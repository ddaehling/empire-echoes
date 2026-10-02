#!/usr/bin/env node
"use strict";

// Uses an ephemeral test server and isolated browser profiles. It never changes
// the classroom server on 8777 or a student's saved work. The fixture exercises
// the actual fullscreen module; the integration checks use the complete atlas.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const { chromium, firefox, webkit } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACTS = process.env.QA_ARTIFACT_DIR || "/tmp";
const browsers = { chromium, firefox, webkit };
const browserNames = (process.env.BROWSERS || "chromium").split(",");
const failures = [];
let passes = 0;

const fixture = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fullscreen module regression fixture</title>
<link rel="stylesheet" href="/app/journey/css/experience.css"><link rel="stylesheet" href="/app/journey/css/fullscreen.css">
<style>body{margin:0}#before{padding:30px}main{max-width:1200px;margin:100px auto 200px;padding:16px}.scene-stage{min-height:200px}.globe-container canvas{width:100%;height:100%;display:block}#fixture-caption{padding:20px}#after{padding:40px}.fixture-map{background:var(--map-ocean,#d9e4e3)}.fixture-map text{fill:var(--ink,#222);font:32px sans-serif}</style>
<header id="before"><a href="#after">Outside the atlas</a></header><main>
<section class="atlas-experience" id="atlas-experience" aria-label="Interactive historical atlas">
 <div class="experience-toolbar"><strong>Atlas fullscreen fixture</strong><div class="view-switch"><button id="globe-view" aria-pressed="true">Globe</button><button id="flat-view" aria-pressed="false">Flat map</button></div><button id="fullscreen-toggle">Full screen</button></div>
 <div class="scene-grid"><div class="world-column"><div class="scene-stage" id="scene-stage"><div class="year-annotation"><span>During the year</span><strong id="hero-year">1922</strong></div><div id="globe-container" class="globe-container"><canvas tabindex="0" aria-label="Globe"></canvas></div><div id="flat-container" class="flat-container" hidden><svg class="fixture-map" width="100%" height="100%" viewBox="0 0 800 400"><rect width="800" height="400" fill="transparent"/><text x="400" y="200" text-anchor="middle">British India</text></svg></div><div class="scene-controls"><button id="zoom-in" aria-label="Zoom in">+</button><button id="zoom-out" aria-label="Zoom out">−</button><button id="reset-view">Reset</button></div></div>
 <div class="legend-row"><span>British authority</span><label>Colour by <select id="colour-mode"><option>Empire extent</option><option>Type of authority</option></select></label></div>
 <div class="time-machine"><div class="time-heading"><label for="year-slider">Move through time</label><div class="year-step"><button id="previous-year">Previous year</button><output id="year-output">1922</output><button id="next-year">Next year</button></div></div><input id="year-slider" type="range" min="1600" max="1997" value="1922"><div class="year-waypoints"><button data-year="1600">1600</button><button data-year="1922">1922</button><button data-year="1947">1947</button></div></div></div>
 <aside class="context-panel" id="fixture-caption"><h2 id="selection">British India</h2><label for="fixture-search">Find a territory</label><input id="fixture-search" type="search"><p>The selected place and year must survive entry and exit.</p></aside></div>
</section></main><footer id="after"><button>Outside action</button></footer>
<script type="module">
import { createFullscreen } from '/app/journey/js/fullscreen.js';
const stage = document.querySelector('#atlas-experience');
const button = document.querySelector('#fullscreen-toggle');
window.fullscreenEvents = [];
window.fullscreenController = createFullscreen(stage,button,{onChange(value){window.fullscreenEvents.push(value)}});
window.fixtureYear = 1922;
window.resizeCount = 0;
new ResizeObserver(()=>{window.resizeCount++}).observe(stage);
function year(value){window.fixtureYear=Number(value);document.querySelector('#hero-year').textContent=value;document.querySelector('#year-output').textContent=value;document.querySelector('#year-slider').value=value}
document.querySelector('#year-slider').addEventListener('input',event=>year(event.target.value));
document.querySelector('#next-year').onclick=()=>year(window.fixtureYear+1);
document.querySelector('#previous-year').onclick=()=>year(window.fixtureYear-1);
document.querySelectorAll('[data-year]').forEach(node=>node.onclick=()=>year(node.dataset.year));
for(const type of ['globe','flat'])document.querySelector('#'+type+'-view').onclick=()=>{document.querySelector('#globe-container').hidden=type==='flat';document.querySelector('#flat-container').hidden=type==='globe';document.querySelector('#globe-view').setAttribute('aria-pressed',String(type==='globe'));document.querySelector('#flat-view').setAttribute('aria-pressed',String(type==='flat'))};
document.documentElement.dataset.ready='true';
</script></html>`;

async function startServer() {
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".geojson": "application/json",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      if (pathname === "/__fullscreen_fixture__")
        return response
          .writeHead(200, { "content-type": "text/html" })
          .end(fixture);
      if (pathname === "/favicon.ico") return response.writeHead(204).end();
      let filename = path.resolve(ROOT, `.${pathname}`);
      if (!filename.startsWith(ROOT + path.sep))
        return response.writeHead(403).end();
      if ((await fs.stat(filename)).isDirectory())
        filename = path.join(filename, "index.html");
      response
        .writeHead(200, {
          "content-type":
            types[path.extname(filename)] || "application/octet-stream",
          "cache-control": "no-store",
        })
        .end(await fs.readFile(filename));
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

async function check(name, run) {
  try {
    await run();
    passes++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.stack || error}`);
  }
}

async function settled(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
}

async function createPage(
  browser,
  origin,
  {
    mode = "native",
    width = 1440,
    height = 1000,
    integration = false,
    reducedMotion = "reduce",
  } = {},
) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion,
  });
  await context.addInitScript((mode) => {
    window.nativeRequests = [];
    const original = Element.prototype.requestFullscreen;
    if (mode === "missing") {
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(Element.prototype, "webkitRequestFullscreen", {
        configurable: true,
        value: undefined,
      });
    } else if (mode === "pending") {
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value: function () {
          window.nativeRequests.push({
            id: this.id,
            gesture: navigator.userActivation?.isActive,
          });
          return new Promise((resolve) => {
            window.resolveFullscreenRequest = resolve;
          });
        },
      });
    } else if (mode === "denied") {
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value: function () {
          window.nativeRequests.push({
            id: this.id,
            gesture: navigator.userActivation?.isActive,
          });
          return Promise.reject(
            new DOMException("Denied by regression fixture", "NotAllowedError"),
          );
        },
      });
    } else if (original) {
      Object.defineProperty(Element.prototype, "requestFullscreen", {
        configurable: true,
        value: function (...args) {
          window.nativeRequests.push({
            id: this.id,
            gesture: navigator.userActivation?.isActive,
          });
          return original.apply(this, args);
        },
      });
    }
  }, mode);
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const url = integration
    ? process.env.BASE_URL || `${origin}/app/journey/`
    : `${origin}/__fullscreen_fixture__`;
  await page.goto(url);
  await page.locator('html[data-ready="true"]').waitFor({ timeout: 40000 });
  await page.evaluate(() => document.fonts.ready);
  return { page, context, errors };
}

async function enter(page, expected) {
  await page.locator("#fullscreen-toggle").click();
  await page.waitForFunction(() =>
    ["native", "viewport"].includes(
      document.querySelector("#atlas-experience").dataset.fullscreen,
    ),
  );
  if (expected)
    assert.equal(
      await page.locator("#atlas-experience").getAttribute("data-fullscreen"),
      expected,
    );
  assert.equal(
    await page.locator("#fullscreen-toggle").getAttribute("aria-pressed"),
    "true",
  );
  assert.match(
    (await page.locator("#fullscreen-toggle").getAttribute("aria-label")) ||
      (await page.locator("#fullscreen-toggle").textContent()),
    /exit|close/i,
  );
  await settled(page);
}

async function exit(page, keyboard = false) {
  if (keyboard) await page.keyboard.press("Escape");
  else await page.locator("#fullscreen-toggle").click();
  await page.waitForFunction(
    () => !document.querySelector("#atlas-experience").dataset.fullscreen,
  );
  assert.equal(
    await page.locator("#fullscreen-toggle").getAttribute("aria-pressed"),
    "false",
  );
  await settled(page);
  assert.equal(
    await page
      .locator("#fullscreen-toggle")
      .evaluate((node) => node === document.activeElement),
    true,
    "Focus returns to the fullscreen button",
  );
}

async function assertViewport(page) {
  const stage = await page.locator("#atlas-experience").boundingBox();
  // Native fullscreen can change the real viewport to the virtual display's
  // dimensions (Firefox), independently of Playwright's configured viewport.
  const size = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
  }));
  assert.ok(
    Math.abs(stage.x) <= 1 && Math.abs(stage.y) <= 1,
    `Fullscreen must start at viewport origin: ${JSON.stringify(stage)}`,
  );
  assert.ok(
    Math.abs(stage.width - size.width) <= 2 &&
      Math.abs(stage.height - size.height) <= 2,
    `Fullscreen must fill viewport ${JSON.stringify(size)}: ${JSON.stringify(stage)}`,
  );
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth + 1,
  );
  assert.equal(
    overflow,
    false,
    "Fullscreen cannot introduce horizontal document overflow",
  );
  for (const selector of [
    "#fullscreen-toggle",
    "#year-slider",
    "#next-year",
    "#zoom-in",
    "#flat-view",
  ]) {
    assert.equal(
      await page.locator(selector).isVisible(),
      true,
      `${selector} remains visible`,
    );
    let bounds = await page.locator(selector).boundingBox();
    // Short landscape viewports intentionally scroll. All camera/time controls
    // must remain reachable, while the sticky toolbar keeps Exit available.
    if (
      size.height <= 620 &&
      (bounds.y < 0 || bounds.y + bounds.height > size.height)
    ) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      bounds = await page.locator(selector).boundingBox();
    }
    assert.ok(
      bounds.x >= -1 && bounds.x + bounds.width <= size.width + 1,
      `${selector} fits viewport width: ${JSON.stringify(bounds)}`,
    );
    assert.ok(
      bounds.y >= -1 && bounds.y + bounds.height <= size.height + 1,
      `${selector} fits viewport height: ${JSON.stringify(bounds)}`,
    );
  }
  await page.locator("#atlas-experience").evaluate((node) => {
    node.scrollTop = 0;
  });
}

async function assertToolbarContrast(page) {
  const contrasts = await page.evaluate(() => {
    const toolbar = document.querySelector(".experience-toolbar");
    const rgba = (color) => (color.match(/[\d.]+/g) || []).map(Number);
    const background = rgba(getComputedStyle(toolbar).backgroundColor).slice(
      0,
      3,
    );
    const luminance = (values) =>
      values
        .map((value) => {
          const s = value / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        })
        .reduce(
          (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
          0,
        );
    return [".surface-title strong", "#view-description"].flatMap(
      (selector) => {
        const element = document.querySelector(selector);
        if (!element || !element.getClientRects().length) return [];
        const values = rgba(getComputedStyle(element).color);
        const alpha = values[3] ?? 1;
        const foreground = values
          .slice(0, 3)
          .map(
            (value, index) => value * alpha + background[index] * (1 - alpha),
          );
        const pair = [luminance(foreground), luminance(background)].sort(
          (a, b) => b - a,
        );
        return [{ selector, ratio: (pair[0] + 0.05) / (pair[1] + 0.05) }];
      },
    );
  });
  for (const item of contrasts)
    assert.ok(
      item.ratio >= 4.5,
      `Fullscreen ${item.selector} text contrast is ${item.ratio.toFixed(2)}:1; expected 4.5:1`,
    );
}

async function fixtureTests(browser, name, origin) {
  for (const mode of ["native", "denied", "missing"]) {
    const { page, context, errors } = await createPage(browser, origin, {
      mode,
    });
    try {
      await check(
        `${name}: ${mode} API, entry/exit, user gesture and controls`,
        async () => {
          const before = await page.locator("#atlas-experience").boundingBox();
          await page.evaluate(() => scrollTo(0, 70));
          const originalScroll = await page.evaluate(() => scrollY);
          await enter(
            page,
            mode === "native" && name === "chromium"
              ? "native"
              : mode !== "native"
                ? "viewport"
                : undefined,
          );
          const currentMode = await page
            .locator("#atlas-experience")
            .getAttribute("data-fullscreen");
          console.log(`INFO ${name} ${mode}: actual ${currentMode}`);
          if (currentMode === "native")
            assert.equal(
              await page.evaluate(() => document.fullscreenElement?.id),
              "atlas-experience",
            );
          if (mode !== "missing") {
            const calls = await page.evaluate(() => window.nativeRequests);
            assert.equal(
              calls.length,
              1,
              "One native request is made from the click",
            );
            assert.equal(
              calls[0].gesture,
              true,
              "Native request must preserve the user gesture",
            );
          }
          await assertViewport(page);
          await page.locator("#next-year").click();
          assert.equal(await page.locator("#hero-year").textContent(), "1923");
          await page.locator("#flat-view").click();
          assert.equal(await page.locator("#flat-container").isVisible(), true);
          await exit(page);
          assert.equal(await page.locator("#hero-year").textContent(), "1923");
          assert.equal(
            await page.locator("#selection").textContent(),
            "British India",
          );
          assert.equal(await page.locator("#flat-container").isVisible(), true);
          assert.equal(
            await page.evaluate(() => document.fullscreenElement),
            null,
          );
          const after = await page.locator("#atlas-experience").boundingBox();
          assert.ok(
            Math.abs(after.width - before.width) < 2,
            "Normal atlas width is restored",
          );
          assert.equal(
            await page.evaluate(() => scrollY),
            originalScroll,
            "Page scroll position is restored",
          );
          assert.deepEqual(errors, []);
        },
      );
      await check(
        `${name}: ${mode} API Escape and repeated toggles`,
        async () => {
          await enter(page);
          await page.locator("#year-slider").focus();
          await exit(page, true);
          await enter(page);
          await exit(page);
          assert.deepEqual(
            await page.evaluate(() =>
              window.fullscreenEvents.map((event) => event.active),
            ),
            [true, false, true, false, true, false],
          );
          assert.deepEqual(errors, []);
        },
      );
      if (mode === "native")
        await check(
          `${name}: browser-initiated native exit restores page state`,
          async () => {
            await enter(page, "native");
            await page.evaluate(() => document.exitFullscreen());
            await page.waitForFunction(
              () =>
                !document.querySelector("#atlas-experience").dataset.fullscreen,
            );
            await settled(page);
            assert.equal(
              await page
                .locator("#fullscreen-toggle")
                .getAttribute("aria-pressed"),
              "false",
            );
            assert.equal(
              await page
                .locator("#fullscreen-toggle")
                .evaluate((node) => node === document.activeElement),
              true,
            );
            assert.equal(
              await page.locator("#before").evaluate((node) => node.inert),
              false,
            );
            assert.deepEqual(errors, []);
          },
        );
      if (mode !== "native")
        await check(
          `${name}: ${mode} fallback traps focus and restores page interaction`,
          async () => {
            await enter(page, "viewport");
            await page.locator("#before a").evaluate((node) => node.focus());
            assert.equal(
              await page.evaluate(() =>
                document
                  .querySelector("#atlas-experience")
                  .contains(document.activeElement),
              ),
              true,
              "Outside focus cannot escape the modal viewport",
            );
            const buttons = page.locator(
              "#atlas-experience button:visible, #atlas-experience input:visible, #atlas-experience select:visible, #atlas-experience canvas:visible",
            );
            await buttons.last().focus();
            await page.keyboard.press("Tab");
            assert.equal(
              await page.evaluate(() =>
                document
                  .querySelector("#atlas-experience")
                  .contains(document.activeElement),
              ),
              true,
              "Tab stays within the atlas",
            );
            await exit(page, true);
            await page.locator("#before a").focus();
            assert.equal(
              await page
                .locator("#before a")
                .evaluate((node) => node === document.activeElement),
              true,
              "Outside page becomes interactive again",
            );
            assert.equal(
              await page.locator("#before").evaluate((node) => node.inert),
              false,
            );
          },
        );
    } finally {
      await context.close();
    }
  }
  for (const action of ["exit", "destroy", "Escape"]) {
    const { page, context, errors } = await createPage(browser, origin, {
      mode: "pending",
    });
    try {
      await check(
        `${name}: ${action} cancels pending native entry without a late viewport overlay`,
        async () => {
          await page.locator("#fullscreen-toggle").click();
          await page.waitForFunction(() => window.nativeRequests.length === 1);
          if (action === "Escape") await page.keyboard.press("Escape");
          else
            await page.evaluate(
              (action) => window.fullscreenController[action](),
              action,
            );
          await page.evaluate(() => window.resolveFullscreenRequest());
          await settled(page);
          assert.equal(
            await page
              .locator("#atlas-experience")
              .getAttribute("data-fullscreen"),
            null,
          );
          assert.equal(
            await page.evaluate(() => window.fullscreenController.active),
            false,
          );
          assert.equal(
            await page.locator("#before").evaluate((node) => node.inert),
            false,
          );
          assert.deepEqual(
            await page.evaluate(() => window.fullscreenEvents),
            [],
          );
          assert.deepEqual(errors, []);
        },
      );
    } finally {
      await context.close();
    }
  }
  {
    const { page, context, errors } = await createPage(browser, origin, {
      mode: "missing",
    });
    try {
      await check(
        `${name}: destroy removes modal behavior and restores pre-existing attributes`,
        async () => {
          await enter(page, "viewport");
          await page.evaluate(() => window.fullscreenController.destroy());
          assert.equal(
            await page
              .locator("#atlas-experience")
              .getAttribute("data-fullscreen"),
            null,
          );
          assert.equal(
            await page.locator("#atlas-experience").getAttribute("role"),
            null,
          );
          assert.equal(
            await page.locator("#atlas-experience").getAttribute("aria-modal"),
            null,
          );
          assert.equal(
            await page
              .locator("#fullscreen-toggle")
              .getAttribute("aria-pressed"),
            null,
          );
          assert.equal(
            await page.locator("#fullscreen-toggle").textContent(),
            "Full screen",
          );
          await page.locator("#before a").focus();
          assert.equal(
            await page
              .locator("#before a")
              .evaluate((node) => node === document.activeElement),
            true,
          );
          assert.equal(
            await page.evaluate(() =>
              document.body.classList.contains("atlas-fullscreen-open"),
            ),
            false,
          );
          assert.deepEqual(errors, []);
        },
      );
    } finally {
      await context.close();
    }
  }
  for (const [width, height] of [
    [390, 844],
    [768, 1024],
    [1440, 900],
  ]) {
    const { page, context, errors } = await createPage(browser, origin, {
      mode: "missing",
      width,
      height,
    });
    try {
      await check(
        `${name}: viewport fallback responsive controls ${width}×${height}`,
        async () => {
          await enter(page, "viewport");
          await assertViewport(page);
          await page.setViewportSize({ width: height, height: width });
          await settled(page);
          await assertViewport(page);
          await exit(page, true);
          assert.deepEqual(errors, []);
        },
      );
    } finally {
      await context.close();
    }
  }
}

async function integrationTests(browser, name, origin) {
  for (const settings of [
    { mode: "native", width: 1440, height: 1000 },
    { mode: "denied", width: 390, height: 844 },
  ]) {
    const { page, context, errors } = await createPage(browser, origin, {
      ...settings,
      integration: true,
    });
    try {
      await check(
        `${name}: full atlas ${settings.width}px, ${settings.mode}, globe/flat resize and state preservation`,
        async () => {
          await page.locator("#place-search").fill("India");
          await page.keyboard.press("ArrowDown");
          await page.keyboard.press("Enter");
          await page.waitForFunction(() =>
            location.hash.includes("place=british-india"),
          );
          const selection = await page
            .locator("#historical-context h2")
            .textContent();
          await enter(
            page,
            settings.mode === "denied" ? "viewport" : undefined,
          );
          await assertViewport(page);
          await assertToolbarContrast(page);
          await page.locator("#year-slider").evaluate((node) => {
            node.value = "1947";
            node.dispatchEvent(new Event("input", { bubbles: true }));
          });
          assert.equal(await page.locator("#hero-year").textContent(), "1947");
          await page.locator("#flat-view").click();
          await page.waitForFunction(
            () =>
              document
                .querySelector("#flat-view")
                .getAttribute("aria-pressed") === "true",
          );
          if (await page.locator("#globe-container canvas").count())
            await page.waitForFunction(() => {
              const canvas = document.querySelector("#globe-container canvas");
              return (
                canvas.dataset.projection === "flat" &&
                canvas.dataset.transitionPhase === "idle"
              );
            });
          await settled(page);
          await page.screenshot({
            path: path.join(
              ARTIFACTS,
              `journey-fullscreen-${name}-${settings.width}.png`,
            ),
          });
          await exit(page, true);
          assert.equal(await page.locator("#hero-year").textContent(), "1947");
          assert.equal(
            await page.locator("#historical-context h2").textContent(),
            selection,
          );
          assert.match(page.url(), /place=british-india/);
          assert.equal(
            await page.locator("#flat-view").getAttribute("aria-pressed"),
            "true",
          );
          await page.locator("#globe-view").click();
          if (await page.locator("#globe-container canvas").count())
            await page.waitForFunction(() => {
              const canvas = document.querySelector("#globe-container canvas");
              return (
                canvas.dataset.projection === "globe" &&
                canvas.dataset.transitionPhase === "idle"
              );
            });
          await enter(page);
          await assertViewport(page);
          const canvas = page.locator("#globe-container canvas").first();
          if (await canvas.count()) {
            const bounds = await canvas.boundingBox();
            assert.ok(
              bounds.width > 200 && bounds.height > 100,
              "Globe canvas resizes to a useful area",
            );
            assert.equal(
              await canvas.evaluate(
                (node) => node.width > 0 && node.height > 0,
              ),
              true,
            );
          }
          await page.screenshot({
            path: path.join(
              ARTIFACTS,
              `journey-fullscreen-${name}-${settings.width}-globe.png`,
            ),
          });
          await exit(page);
          assert.deepEqual(errors, []);
        },
      );
      await check(
        `${name}: territory navigation exits ${settings.mode} fullscreen and releases the page`,
        async () => {
          if (
            await page
              .locator("#atlas-experience")
              .getAttribute("data-fullscreen")
          )
            await exit(page);
          await enter(page);
          await page.locator(".territory-open").click();
          await page.locator("#territory-view").waitFor({ state: "visible" });
          await page.locator("#explore-view").waitFor({ state: "visible" });
          assert.equal(
            await page.locator("#explore-view").evaluate((node) => node.inert),
            true,
          );
          assert.equal(
            await page.locator("#territory-view #scene-stage").isVisible(),
            true,
          );
          assert.equal(
            await page
              .locator("#atlas-experience")
              .getAttribute("data-fullscreen"),
            null,
          );
          assert.equal(
            await page.evaluate(() => document.fullscreenElement),
            null,
          );
          assert.equal(
            await page.evaluate(() =>
              document.body.classList.contains("atlas-fullscreen-open"),
            ),
            false,
          );
          assert.equal(
            await page.locator(".site-header").evaluate((node) => node.inert),
            true,
          );
          await page.locator("[data-focus-atlas]").click();
          await page.locator("#territory-view").waitFor({ state: "hidden" });
          await page.locator("#explore-view").waitFor({ state: "visible" });
          assert.equal(
            await page.locator(".site-header").evaluate((node) => node.inert),
            false,
          );
          await enter(page);
          await exit(page, true);
          assert.deepEqual(errors, []);
        },
      );
    } finally {
      await context.close();
    }
  }
}

async function stabilityTests(browser, name, origin) {
  for (const settings of [
    { mode: "native", width: 1440, height: 1000, reducedMotion: "no-preference" },
    { mode: "denied", width: 1440, height: 900 },
    { mode: "missing", width: 390, height: 844 },
    { mode: "missing", width: 900, height: 540 },
  ]) {
    const { page, context, errors } = await createPage(browser, origin, {
      ...settings,
      integration: true,
    });
    try {
      await check(
        `${name}: ${settings.mode} fullscreen ${settings.width}×${settings.height} keeps the globe steady while inspecting changes`,
        async () => {
          await enter(
            page,
            settings.mode === "native" ? undefined : "viewport",
          );
          await page.locator("#globe-container canvas").waitFor();
          await settled(page);
          await page.evaluate(() => {
            const atlas = document.querySelector("#atlas-experience");
            const scene = document.querySelector("#scene-stage");
            const canvas = document.querySelector("#globe-container canvas");
            const slider = document.querySelector("#year-slider");
            const rect = (node) => {
              const box = node.getBoundingClientRect();
              const origin = atlas.getBoundingClientRect();
              return {
                x: box.x - origin.x + atlas.scrollLeft,
                y: box.y - origin.y + atlas.scrollTop,
                width: box.width,
                height: box.height,
              };
            };
            const probe = (window.fullscreenLayoutProbe = {
              phase: "initial",
              samples: [],
              resizing: [],
              visibility: new Set(),
              stopped: false,
            });
            probe.sample = () => {
              probe.samples.push({
                phase: probe.phase,
                year: document.querySelector("#year-slider").value,
                stage: rect(scene),
                canvas: rect(canvas),
                slider: rect(slider),
                buffer: { width: canvas.width, height: canvas.height },
              });
              probe.visibility.add(
                !document.querySelector(".map-change-details").hidden,
              );
            };
            probe.observer = new ResizeObserver(() => {
              probe.resizing.push({ phase: probe.phase, stage: rect(scene) });
            });
            probe.observer.observe(scene);
            probe.observer.observe(canvas);
            const tick = () => {
              if (probe.stopped) return;
              probe.sample();
              probe.frame = requestAnimationFrame(tick);
            };
            tick();
          });
          const setYear = async (year) => {
            await page.locator("#year-slider").evaluate((slider, year) => {
              window.fullscreenLayoutProbe.phase = `year ${year}`;
              slider.value = String(year);
              slider.dispatchEvent(new Event("input", { bubbles: true }));
            }, year);
            await settled(page);
          };
          // Adjacent quiet years hide the disclosure; larger jumps show one or
          // several change types, milestones and differently wrapped headings.
          for (const year of [
            1600, 1601, 1602, 1757, 1758, 1765, 1858, 1922, 1923, 1947,
          ])
            await setYear(year);
          await page.locator(".map-change-disclosure").focus();
          await page.evaluate(() => {
            window.fullscreenLayoutProbe.phase = "open details";
          });
          await page.keyboard.press("Enter");
          await settled(page);
          assert.equal(
            await page.locator(".map-change-details").evaluate((node) => node.open),
            true,
          );
          const more = page.locator(".map-change-show-all");
          if (await more.count()) {
            await page.evaluate(() => {
              window.fullscreenLayoutProbe.phase = "show all changes";
            });
            await more.click();
            await settled(page);
          }
          if (await page.evaluate(() => innerWidth > 760 && innerHeight > 620)) {
            await page.locator(".map-change-disclosure").focus();
            await page.locator("#map-experience").evaluate((node) => {
              node.scrollTop = 0;
            });
            await page.evaluate(() => {
              window.fullscreenLayoutProbe.phase = "keyboard ledger scroll";
            });
            await page.keyboard.press("PageDown");
            await page.waitForFunction(() =>
              document.querySelector("#map-experience").scrollTop > 0,
            );
          }
          // The open ledger must remain usable without borrowing map height.
          const lastPlace = page.locator("[data-map-change-place]").last();
          await lastPlace.scrollIntoViewIfNeeded();
          await settled(page);
          assert.equal(
            await lastPlace.evaluate((node) => {
              const box = node.getBoundingClientRect();
              return node.contains(document.elementFromPoint(
                box.x + box.width / 2,
                box.y + box.height / 2,
              ));
            }),
            true,
            "The expanded ledger can scroll to its last named place",
          );
          for (const year of [1948, 1963, 1964, 1997, 1996, 1601, 1602, 1947])
            await setYear(year);
          await page.locator(".map-change-disclosure").focus();
          await page.evaluate(() => {
            window.fullscreenLayoutProbe.phase = "close details";
          });
          await page.keyboard.press("Enter");
          await settled(page);
          assert.equal(
            await page.locator(".map-change-details").evaluate((node) => node.open),
            false,
          );
          // Exercise real range-pointer input too: a moving track can otherwise
          // make the drag miss the control after the first year changes.
          await page.locator("#year-slider").scrollIntoViewIfNeeded();
          const slider = await page.locator("#year-slider").boundingBox();
          await page.evaluate(() => {
            window.fullscreenLayoutProbe.phase = "pointer scrub";
          });
          await page.mouse.move(slider.x + 10, slider.y + slider.height / 2);
          await page.mouse.down();
          await page.mouse.move(
            slider.x + slider.width - 10,
            slider.y + slider.height / 2,
            { steps: 24 },
          );
          await page.mouse.up();
          await settled(page);
          const recorded = await page.evaluate(() => {
            const probe = window.fullscreenLayoutProbe;
            probe.sample();
            probe.stopped = true;
            cancelAnimationFrame(probe.frame);
            probe.observer.disconnect();
            return {
              samples: probe.samples,
              resizing: probe.resizing,
              visibility: [...probe.visibility],
            };
          });
          assert.deepEqual(
            recorded.visibility.sort(),
            [false, true],
            "The regression must exercise both hidden and visible change disclosures",
          );
          assert.ok(
            recorded.samples.length > 20,
            "Capture layout throughout the interaction, including intermediate frames",
          );
          const initial = recorded.samples[0];
          const changes = recorded.samples.flatMap((sample) => {
            const result = [];
            for (const element of ["stage", "canvas", "buffer", "slider"])
              for (const dimension of element === "buffer"
                ? ["width", "height"]
                : ["x", "y", "width", "height"])
                if (
                  Math.abs(sample[element][dimension] - initial[element][dimension]) > 1
                )
                  result.push(
                    `${sample.phase}: ${element}.${dimension} ${initial[element][dimension]} → ${sample[element][dimension]}`,
                  );
            return result;
          });
          assert.deepEqual(
            [...new Set(changes)].slice(0, 20),
            [],
            "Scrubbing and expanding details must not resize or shift the scene, canvas or slider",
          );
          for (const sample of recorded.resizing)
            assert.ok(
              Math.abs(sample.stage.width - initial.stage.width) <= 1 &&
                Math.abs(sample.stage.height - initial.stage.height) <= 1,
              `ResizeObserver saw a transient scene resize during ${sample.phase}`,
            );
          assert.deepEqual(errors, []);
          await exit(page, true);
        },
      );
    } finally {
      await context.close();
    }
  }
}

(async () => {
  await fs.mkdir(ARTIFACTS, { recursive: true });
  const { server, origin } = await startServer();
  try {
    for (const name of browserNames) {
      assert.ok(browsers[name], `Unknown browser ${name}`);
      const launch =
        name === "chromium" ? { args: ["--enable-unsafe-swiftshader"] } : {};
      const executable =
        process.env[`PLAYWRIGHT_${name.toUpperCase()}_EXECUTABLE_PATH`];
      if (executable) launch.executablePath = executable;
      const browser = await browsers[name].launch(launch);
      console.log(`INFO Browser ${name} ${browser.version()}`);
      try {
        if (process.env.FULLSCREEN_STABILITY_ONLY !== "1")
          await fixtureTests(browser, name, origin);
        if (process.env.FULLSCREEN_FIXTURE_ONLY !== "1") {
          if (process.env.FULLSCREEN_STABILITY_ONLY !== "1")
            await integrationTests(browser, name, origin);
          await stabilityTests(browser, name, origin);
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
  console.log(`\n${passes} passed; ${failures.length} failed.`);
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
