#!/usr/bin/env node
"use strict";

// Geometry and interaction regression checks for the Journey atlas. This suite
// mounts the production module in an isolated page and never alters saved work
// or the classroom server. Screenshots and sampled transition traces go to /tmp.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const http = require("node:http");
const path = require("node:path");
const os = require("node:os");
const { chromium } = require("playwright");
const { PNG } = require("pngjs");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACTS = process.env.QA_ARTIFACT_DIR || os.tmpdir();
const errors = [];
const failures = [];
let passes = 0;
const artifact = (name) => path.join(ARTIFACTS, `journey-unfold-${name}`);

const HARNESS = `<!doctype html><html lang="en"><meta charset="utf-8">
<title>Unfold geometry regression harness</title>
<style>html,body{margin:0;background:#fff}#stage{position:relative;width:100vw;height:600px;background:#ff00ff;--map-ocean:#bdd6e3;--map-land:#eeebe3;--map-empire:#bd602c;--map-home:#203d72;--map-border:#faf8f0}canvas{outline:0!important}</style>
<div id="stage"></div>
<script type="module">
import {loadData} from '/app/js/core/data.js';
import {createGlobe} from '/app/journey/js/globe.js';
import {feature,geoContains} from '/app/vendor/geo.js';
window.selections=[];window.transitions=[];window.trace=[];window.fallbacks=[];
window.data=await loadData();
window.expectedTerritoryAt=(longitude,latitude)=>{
  const topology=window.data.geo.coarse.data;
  const unit=feature(topology,topology.objects.units).features.find(item=>geoContains(item,[longitude,latitude]));
  return window.data.statusAt(1922).get(String(unit?.id))?.territory?.id;
};
try {
  window.globe=await createGlobe(document.querySelector('#stage'), {
    data:window.data,
    onSelect:id=>window.selections.push(id),
    onTransition:value=>window.transitions.push({at:performance.now(),value}),
    onFallback:error=>window.fallbacks.push(error.message)
  });
  window.globe.update({year:1922});
  document.documentElement.dataset.ready='true';
  window.sample=()=>{
    const state=window.globe.getState?.()||{};
    const canvas=document.querySelector('canvas');
    return {...canvas?.dataset,...state,at:performance.now()};
  };
  window.beginTrace=()=>{window.trace=[];window.tracing=true; const frame=()=>{if(!window.tracing)return;window.trace.push(window.sample());requestAnimationFrame(frame)};requestAnimationFrame(frame)};
  window.endTrace=()=>{window.tracing=false;return window.trace};
} catch(error) {window.bootError=error.message;document.documentElement.dataset.failed='true'}
</script></html>`;

async function createServer() {
  const types = {
    ".js": "text/javascript",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".html": "text/html",
  };
  const server = http.createServer(async (req, res) => {
    if (req.url === "/harness.html") {
      res
        .writeHead(200, {
          "Content-Type": "text/html",
          "Cache-Control": "no-store",
        })
        .end(HARNESS);
      return;
    }
    const filename = path.resolve(
      ROOT,
      `.${decodeURIComponent(new URL(req.url, "http://localhost").pathname)}`,
    );
    if (!filename.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      res
        .writeHead(200, {
          "Content-Type":
            types[path.extname(filename)] || "application/octet-stream",
        })
        .end(await fs.readFile(filename));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return {
    server,
    url: `http://127.0.0.1:${server.address().port}/harness.html`,
  };
}

async function check(name, run) {
  try {
    await run();
    passes++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.stack || error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function ready(page, url) {
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.ready ||
      document.documentElement.dataset.failed,
    null,
    { timeout: 25000 },
  );
  assert.equal(await page.evaluate(() => window.bootError), undefined);
  await page.waitForTimeout(100);
}
async function state(page) {
  return page.evaluate(() => window.sample());
}
const morph = (value) => Number(value.morph ?? value.progress ?? 0);
const phase = (value) => value.transitionPhase ?? value.phase;
const longitude = (value) =>
  Number(value.viewLongitude ?? value.view?.longitude);
const latitude = (value) => Number(value.viewLatitude ?? value.view?.latitude);
async function projection(page, value, animate = true) {
  return page.evaluate(
    async ([value, animate]) => {
      await window.globe.setProjection(value, { animate });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
      return window.sample();
    },
    [value, animate],
  );
}
async function snapshot(page, name) {
  // Capture the live canvas without element-actionability stability waits:
  // those waits otherwise move the visible midpoint toward the final frame.
  const clip = await page.locator("canvas").boundingBox();
  const bytes = await page.screenshot({
    clip,
    animations: "allow",
    timeout: 10000,
  });
  await fs.writeFile(artifact(`${name}.png`), bytes);
  return PNG.sync.read(bytes);
}
function foreground(image, x, y) {
  const i = (Math.round(y) * image.width + Math.round(x)) * 4;
  return !(
    image.data[i] > 246 &&
    image.data[i + 1] < 12 &&
    image.data[i + 2] > 246
  );
}
function silhouette(image) {
  let minX = image.width,
    minY = image.height,
    maxX = -1,
    maxY = -1,
    area = 0;
  // A coarse pixel lattice tolerates antialiasing while proving shape, not just opacity.
  for (let y = 0; y < image.height; y += 3)
    for (let x = 0; x < image.width; x += 3) {
      if (!foreground(image, x, y)) continue;
      area++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    area,
  };
}
function pixelDifference(a, b) {
  assert.equal(a.width, b.width);
  assert.equal(a.height, b.height);
  let changed = 0;
  for (let i = 0; i < a.data.length; i += 16) {
    if (
      Math.abs(a.data[i] - b.data[i]) +
        Math.abs(a.data[i + 1] - b.data[i + 1]) +
        Math.abs(a.data[i + 2] - b.data[i + 2]) >
      30
    )
      changed++;
  }
  return changed / (a.data.length / 16);
}
function meanColourDistance(a, b) {
  assert.equal(a.width, b.width);
  assert.equal(a.height, b.height);
  let difference = 0;
  for (let i = 0; i < a.data.length; i += 16)
    difference +=
      Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2]);
  return difference / (a.data.length / 16);
}
async function clickFlat(page, lon, lat) {
  const s = await state(page);
  const box = await page.locator("canvas").boundingBox();
  assert.ok(
    s.flatBounds,
    "getState() must report rendered flat rectangle bounds",
  );
  const b = s.flatBounds;
  await page.evaluate(() => {
    window.selections = [];
  });
  await page.mouse.click(
    box.x + b.x + ((lon + 180) / 360) * b.width,
    box.y + b.y + ((90 - lat) / 180) * b.height,
  );
  return page.evaluate(() => window.selections.at(-1));
}
async function assertFlatSelection(page, lon, lat) {
  const expected = await page.evaluate(
    ([lon, lat]) => window.expectedTerritoryAt(lon, lat),
    [lon, lat],
  );
  assert.ok(
    expected,
    `Test point ${lon},${lat} must have a recorded territory`,
  );
  assert.equal(await clickFlat(page, lon, lat), expected);
}

async function main() {
  await fs.mkdir(ARTIFACTS, { recursive: true });
  const { server, url } = await createServer();
  const browser = await chromium.launch({
    args: ["--enable-unsafe-swiftshader"],
    headless: true,
  });
  let page;
  try {
    page = await browser.newPage({
      viewport: { width: 1100, height: 700 },
      deviceScaleFactor: 1,
    });
    await ready(page, url);
    await check(
      "production module exposes real WebGL and projection control",
      async () => {
        assert.equal(await page.locator("canvas.globe-canvas").count(), 1);
        assert.equal(
          await page.evaluate(() => typeof window.globe.setProjection),
          "function",
        );
        assert.equal(
          await page.evaluate(() => typeof window.globe.getState),
          "function",
        );
        assert.equal(
          await page.evaluate(
            () => !!document.querySelector("canvas").getContext("webgl2"),
          ),
          true,
        );
      },
    );

    let initial, middle, finished, geometryCanvasCount;
    await check(
      "rotation returns home before geographic mesh unfolds",
      async () => {
        // Sample the real production mesh with a paused browser clock. This
        // keeps screenshot encoding time from advancing the unfolding surface.
        const page = await browser.newPage({
          viewport: { width: 1100, height: 700 },
          deviceScaleFactor: 1,
        });
        try {
          await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
          await ready(page, url);
          await page.evaluate(() =>
            window.globe.focusTerritory("commonwealth-of-australia"),
          );
          await page.waitForTimeout(650);
          const rotated = await state(page);
          assert.ok(
            Math.abs(longitude(rotated) - 24) > 40,
            "Precondition: globe has rotated away from home",
          );
          initial = await snapshot(page, "rotated");
          await page.evaluate(() => window.globe.zoomBy(1.6));
          await page.waitForTimeout(350);
          assert.ok(
            (await state(page)).view.zoom > 1.5,
            "Precondition: resetting also has to undo zoom",
          );
          await page.clock.pauseAt(
            new Date(await page.evaluate(() => Date.now() + 1000)),
          );
          await page.evaluate(() => {
            window.beginTrace();
            window.projectionDone = false;
            window.globe
              .setProjection("flat", { animate: true })
              .then(() => (window.projectionDone = true));
          });
          // 440ms home reset followed by approximately half of the 1150ms unfold.
          await page.clock.runFor(1030);
          const midpointState = await state(page);
          assert.ok(
            phase(midpointState) === "unfold" &&
              morph(midpointState) > 0.4 && morph(midpointState) < 0.6,
            "Capture genuine intermediate geographic curvature",
          );
          middle = await snapshot(page, "unfold-middle");
          await fs.writeFile(
            artifact("geometry-midpoint.json"),
            JSON.stringify(midpointState, null, 2),
          );
          await page.clock.runFor(700);
          assert.equal(await page.evaluate(() => window.projectionDone), true);
          finished = await snapshot(page, "flat");
          geometryCanvasCount = await page.locator("canvas").count();
          const trace = await page.evaluate(() => window.endTrace());
          await fs.writeFile(
            artifact("trace.json"),
            JSON.stringify(trace, null, 2),
          );
          assert.ok(
            trace.some((s) => phase(s) === "reset"),
            "Transition must include reset phase",
          );
          assert.ok(
            trace.some(
              (s) => phase(s) === "unfold" && morph(s) > 0.1 && morph(s) < 0.9,
            ),
            "Transition must animate intermediate curvature",
          );
          assert.ok(
            trace
              .filter((s) => phase(s) === "reset")
              .every((s) => morph(s) < 0.001),
            "Unfold must not start during reset",
          );
          const firstUnfold = trace.find((s) => morph(s) > 0.001);
          assert.ok(firstUnfold, "Morph progression was sampled");
          assert.ok(
            Math.abs(longitude(firstUnfold) - 24) < 0.1 &&
              Math.abs(latitude(firstUnfold) - 20) < 0.1,
            `Reset must reach home before unfolding: ${JSON.stringify(firstUnfold)}`,
          );
          assert.ok(
            trace
              .filter((s) => phase(s) === "unfold")
              .every((s) => Math.abs(s.view.zoom - 1) < 0.001),
            "Reset zoom must remain at home throughout unfolding, without a seam pop",
          );
          const final = await state(page);
          assert.equal(final.projection, "flat");
          assert.ok(morph(final) > 0.999);
          assert.equal(phase(final), "idle");
        } finally {
          await page.close();
        }
      },
    );

    await check(
      "rendered midpoint is a changing geographic surface and flat corners expand",
      async () => {
        assert.ok(
          initial && middle && finished,
          "Transition screenshot prerequisites",
        );
        const a = silhouette(initial),
          b = silhouette(middle),
          c = silhouette(finished);
        await fs.writeFile(
          artifact("silhouettes.json"),
          JSON.stringify({ globe: a, middle: b, flat: c }, null, 2),
        );
        assert.ok(
          a.width / a.height > 0.8 && a.width / a.height < 1.2,
          "Starting silhouette is spherical",
        );
        assert.ok(
          c.width > a.width * 1.6,
          "Final rectangle is substantially wider than the globe",
        );
        assert.ok(
          b.width > a.width * 1.06,
          "Midpoint visibly opens out horizontally",
        );
        assert.ok(
          pixelDifference(initial, middle) > 0.1 &&
            pixelDifference(middle, finished) > 0.1,
          "Visible geometry must differ at setup/action/resolution",
        );
        assert.ok(
          !foreground(initial, c.minX + 10, c.minY + 10),
          "Map corner starts outside globe",
        );
        for (const [x, y] of [
          [c.minX + 10, c.minY + 10],
          [c.maxX - 10, c.minY + 10],
          [c.minX + 10, c.maxY - 10],
          [c.maxX - 10, c.maxY - 10],
        ])
          assert.ok(
            foreground(finished, x, y),
            `Finished map fills corner ${x},${y}`,
          );
        assert.equal(
          geometryCanvasCount,
          1,
          "Both projections use one geographic canvas",
        );
      },
    );

    await check(
      "flat map picking respects longitude, latitude and territorial data",
      async () => {
        await projection(page, "flat", false);
        await assertFlatSelection(page, 78, 23);
        await assertFlatSelection(page, 135, -25);
        await assertFlatSelection(page, -100, 53);
      },
    );

    await check(
      "flat zoom, drag, keyboard pan and Home retain accurate picking",
      async () => {
        await page.evaluate(() => window.globe.focusTerritory("british-india"));
        await page.waitForTimeout(650);
        let s = await state(page);
        assert.ok(s.view.zoom >= 1.8, "Territory focus zooms the flat map");
        await assertFlatSelection(page, 78, 23);
        const box = await page.locator("canvas").boundingBox();
        const previousPan = s.view.panX;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(
          box.x + box.width / 2 + 70,
          box.y + box.height / 2,
          { steps: 6 },
        );
        await page.mouse.up();
        s = await state(page);
        assert.ok(
          s.view.panX < previousPan - 0.1,
          "Dragging changes the flat camera centre",
        );
        await assertFlatSelection(page, 78, 23);
        await page.locator("canvas").focus();
        const beforeKey = s.view.panX;
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(280);
        assert.ok(
          (await state(page)).view.panX > beforeKey,
          "Arrow key pans the flat map",
        );
        await assertFlatSelection(page, 78, 23);
        await page.keyboard.press("Home");
        await page.waitForTimeout(650);
        s = await state(page);
        assert.ok(
          Math.abs(s.view.zoom - 1) < 0.001 &&
            Math.abs(s.view.panX) < 0.001 &&
            Math.abs(s.view.panY) < 0.001,
          "Home restores the whole flat map",
        );
      },
    );

    await check("settled projections stop rendering while idle", async () => {
      const frames = (await state(page)).renderedFrames;
      await page.waitForTimeout(300);
      assert.equal(
        (await state(page)).renderedFrames,
        frames,
        "No WebGL renders should run during idle",
      );
    });

    await check(
      "year changes visibly interpolate colours through a bounded midpoint",
      async () => {
        // Control time on a separate page so slow screenshot encoding cannot
        // advance a 540ms blend beyond its actual midpoint.
        const colourPage = await browser.newPage({
          viewport: { width: 1100, height: 700 },
          deviceScaleFactor: 1,
        });
        try {
          await colourPage.clock.install({
            time: new Date("2026-01-01T00:00:00Z"),
          });
          await ready(colourPage, url);
          await projection(colourPage, "flat", false);
          await colourPage.evaluate(() => window.globe.update({ year: 1600 }));
          await colourPage.waitForTimeout(650);
          await colourPage.clock.pauseAt(
            new Date(await colourPage.evaluate(() => Date.now() + 1000)),
          );
          const before = await snapshot(colourPage, "year-1600");
          await colourPage.evaluate(() => window.globe.update({ year: 1922 }));
          await colourPage.clock.runFor(290);
          const midpointState = await state(colourPage);
          assert.ok(
            midpointState.colourTransition &&
              midpointState.colourMix > 0.35 &&
              midpointState.colourMix < 0.65,
            "Sample the actual colour midpoint",
          );
          const midpoint = await snapshot(colourPage, "year-midpoint");
          await colourPage.clock.runFor(400);
          const final = await state(colourPage);
          assert.equal(final.colourTransition, false);
          assert.equal(final.colourMix, 1);
          const after = await snapshot(colourPage, "year-1922");
          const fullDistance = meanColourDistance(before, after);
          assert.ok(
            fullDistance > 2,
            "Chosen historical years visibly change territorial colour",
          );
          const fromStart = meanColourDistance(before, midpoint),
            fromEnd = meanColourDistance(after, midpoint);
          await fs.writeFile(
            artifact("colour-evidence.json"),
            JSON.stringify(
              { midpointState, fullDistance, fromStart, fromEnd },
              null,
              2,
            ),
          );
          assert.ok(
            fromStart > fullDistance * 0.1 && fromEnd > fullDistance * 0.1,
            `Midpoint must differ from both endpoints: ${JSON.stringify({ fullDistance, fromStart, fromEnd })}`,
          );
          assert.ok(
            fromStart < fullDistance && fromEnd < fullDistance,
            "Midpoint sits between both colours rather than flashing an unrelated state",
          );
        } finally {
          await colourPage.close();
        }
      },
    );

    await check(
      "rapid year changes finish at the newest texture and stop rendering",
      async () => {
        await page.evaluate(async () => {
          for (const year of [1800, 1858, 1947, 1997]) {
            window.globe.update({ year });
            await new Promise((resolve) => setTimeout(resolve, 85));
          }
        });
        await page.waitForFunction(
          () =>
            !window.sample().colourTransition &&
            window.sample().colourMix === 1,
          null,
          { timeout: 1500 },
        );
        const settled = await state(page);
        assert.equal(settled.year, 1997);
        const newest = await snapshot(page, "year-rapid-final");
        await page.waitForTimeout(250);
        assert.equal(
          (await state(page)).renderedFrames,
          settled.renderedFrames,
          "Colour rendering must stop after the blend settles",
        );
        // Compare the animated result with the same year painted directly.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.evaluate(() => window.globe.update({ year: 1600 }));
        await page.waitForTimeout(60);
        await page.evaluate(() => window.globe.update({ year: 1997 }));
        await page.waitForTimeout(60);
        const direct = await snapshot(page, "year-direct-final");
        assert.ok(
          meanColourDistance(newest, direct) < 0.05,
          "Rapidly interrupted blend must equal the authoritative newest-year texture",
        );
        const s = await state(page);
        assert.equal(s.colourTransition, false);
        assert.equal(s.colourMix, 1);
        await page.emulateMedia({ reducedMotion: "no-preference" });
      },
    );

    await check(
      "starting a projection transition settles an active colour blend",
      async () => {
        await projection(page, "globe", false);
        await page.evaluate(() => window.globe.update({ year: 1922 }));
        await page.waitForFunction(
          () =>
            window.sample().colourTransition &&
            window.sample().colourMix > 0.05,
          null,
          { timeout: 1500 },
        );
        await page.evaluate(() => {
          window.projectionDone = false;
          window.globe
            .setProjection("flat")
            .then(() => (window.projectionDone = true));
        });
        const during = await state(page);
        assert.equal(during.year, 1922);
        assert.equal(during.colourTransition, false);
        assert.equal(during.colourMix, 1);
        await page.waitForFunction(() => window.projectionDone, null, {
          timeout: 4000,
        });
      },
    );

    await check(
      "fold reverses mesh deformation and restores globe picking",
      async () => {
        await page.evaluate(() => {
          window.beginTrace();
        });
        const folded = await projection(page, "globe");
        const trace = await page.evaluate(() => window.endTrace());
        assert.ok(
          trace.some(
            (s) => phase(s) === "fold" && morph(s) > 0.1 && morph(s) < 0.9,
          ),
        );
        assert.equal(folded.projection, "globe");
        assert.ok(morph(folded) < 0.001);
        await page.evaluate(() => window.globe.focusTerritory("british-india"));
        await page.waitForTimeout(650);
        const focused = await state(page);
        const expected = await page.evaluate(
          ([lon, lat]) => window.expectedTerritoryAt(lon, lat),
          [longitude(focused), latitude(focused)],
        );
        assert.ok(
          expected,
          "Focused globe centre must be within a dated territory",
        );
        await page.evaluate(() => {
          window.selections = [];
        });
        await page.locator("canvas").focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await page.evaluate(() => window.selections.at(-1)),
          expected,
        );
      },
    );

    await check(
      "rapid projection reversals settle every promise at the latest request",
      async () => {
        const result = await page.evaluate(async () => {
          const a = window.globe.setProjection("flat", { animate: true });
          await new Promise((r) => setTimeout(r, 220));
          const b = window.globe.setProjection("globe", { animate: true });
          await new Promise((r) => setTimeout(r, 160));
          const c = window.globe.setProjection("flat", { animate: true });
          await Promise.race([
            Promise.all([a, b, c]),
            new Promise((_, reject) =>
              setTimeout(
                () =>
                  reject(new Error("Unsettled interrupted projection promise")),
                5000,
              ),
            ),
          ]);
          return window.sample();
        });
        assert.equal(result.projection, "flat");
        assert.ok(morph(result) > 0.999);
      },
    );

    await check(
      "resizing during an unfold preserves final rectangle and picking",
      async () => {
        await projection(page, "globe", false);
        await page.evaluate(() => {
          window.projectionDone = false;
          window.globe
            .setProjection("flat")
            .then(() => (window.projectionDone = true));
        });
        await page.waitForTimeout(550);
        await page.setViewportSize({ width: 760, height: 700 });
        await page.waitForFunction(() => window.projectionDone, null, {
          timeout: 5000,
        });
        const s = await state(page),
          box = await page.locator("canvas").boundingBox();
        assert.ok(
          s.flatBounds.width <= box.width + 1 &&
            s.flatBounds.height <= box.height + 1,
          "Flat surface fits resized canvas",
        );
        await assertFlatSelection(page, 78, 23);
        await snapshot(page, "tablet-flat");
        await page.setViewportSize({ width: 390, height: 700 });
        await page.waitForTimeout(100);
        await assertFlatSelection(page, 135, -25);
        await snapshot(page, "mobile-flat");
        await page.setViewportSize({ width: 1100, height: 700 });
      },
    );

    await check(
      "reduced motion changes projection without animated curvature",
      async () => {
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.evaluate(() => window.beginTrace());
        const started = Date.now();
        const globe = await projection(page, "globe"),
          flat = await projection(page, "flat");
        const elapsed = Date.now() - started;
        const trace = await page.evaluate(() => window.endTrace());
        assert.equal(globe.projection, "globe");
        assert.equal(flat.projection, "flat");
        assert.ok(
          elapsed < 800,
          `Reduced-motion projection should settle directly (${elapsed}ms)`,
        );
        assert.ok(
          !trace.some((s) => morph(s) > 0.001 && morph(s) < 0.999),
          "No intermediate morph under reduced motion",
        );
        await assertFlatSelection(page, 78, 23);
        await page.emulateMedia({ reducedMotion: "no-preference" });
      },
    );

    await check(
      "deactivating during transition does not leave pending work",
      async () => {
        await projection(page, "globe", false);
        const result = await page.evaluate(async () => {
          const pending = window.globe.setProjection("flat");
          await new Promise((r) => setTimeout(r, 160));
          window.globe.setActive(false);
          await Promise.race([
            pending,
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Inactive transition is still pending")),
                1500,
              ),
            ),
          ]);
          window.globe.setActive(true);
          await window.globe.setProjection("flat", { animate: false });
          return window.sample();
        });
        assert.equal(result.projection, "flat");
        assert.ok(morph(result) > 0.999);
      },
    );

    await check(
      "destroying during transition settles pending call and removes canvas",
      async () => {
        await projection(page, "globe", false);
        await page.evaluate(async () => {
          const pending = window.globe.setProjection("flat");
          await new Promise((r) => setTimeout(r, 120));
          window.globe.destroy();
          await Promise.race([
            pending,
            new Promise((_, reject) =>
              setTimeout(
                () =>
                  reject(new Error("Destroyed transition is still pending")),
                1500,
              ),
            ),
          ]);
        });
        assert.equal(await page.locator("canvas").count(), 0);
      },
    );
    await check(
      "context loss during morph triggers fallback and settles the transition",
      async () => {
        const lostPage = await browser.newPage({
          viewport: { width: 900, height: 700 },
        });
        try {
          await ready(lostPage, url);
          const result = await lostPage.evaluate(async () => {
            const pending = window.globe.setProjection("flat");
            await new Promise((r) => setTimeout(r, 160));
            document
              .querySelector("canvas")
              .getContext("webgl2")
              .getExtension("WEBGL_lose_context")
              .loseContext();
            await Promise.race([
              pending,
              new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(
                      new Error("Context-lost transition is still pending"),
                    ),
                  1500,
                ),
              ),
            ]);
            return window.fallbacks;
          });
          assert.equal(result.length, 1);
          assert.match(result[0], /context.*lost/i);
        } finally {
          await lostPage.close();
        }
      },
    );
    await check(
      "WebGL-unavailable initialization rejects cleanly for the flat fallback",
      async () => {
        const unavailable = await browser.newPage();
        try {
          await unavailable.addInitScript(() => {
            const original = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function (type, ...args) {
              return type === "webgl2"
                ? null
                : original.call(this, type, ...args);
            };
          });
          await unavailable.goto(url);
          await unavailable.waitForFunction(
            () => document.documentElement.dataset.failed,
            null,
            { timeout: 15000 },
          );
          assert.match(
            await unavailable.evaluate(() => window.bootError),
            /WebGL2.*unavailable/i,
          );
          assert.equal(await unavailable.locator("canvas").count(), 0);
        } finally {
          await unavailable.close();
        }
      },
    );
    await check("no unexpected browser errors", async () =>
      assert.deepEqual(errors, []),
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
  console.log(
    `\n${passes} passed, ${failures.length} failed. Evidence: ${artifact("*")}`,
  );
  if (failures.length) {
    await fs.writeFile(artifact("failures.txt"), failures.join("\n\n"));
    process.exitCode = 1;
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
