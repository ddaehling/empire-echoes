#!/usr/bin/env node
"use strict";

// Independent integration acceptance: an ephemeral server and fresh browser
// contexts never use the classroom port or an existing student's profile.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const ARTIFACTS = process.env.QA_ARTIFACT_DIR || "/tmp/empire-focus-qa";
const failures = [];
const evidence = [];
let passes = 0;

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
    ".pdf": "application/pdf",
  };
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
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
    failures.push({ name, error: error.message });
    console.error(`FAIL ${name}: ${error.stack || error}`);
  }
}

const frames = (page, count = 2) =>
  page.evaluate(async (n) => {
    for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame);
  }, count);

async function ready(page, url) {
  // A different fragment on the same document is a live route change. These
  // scenario starts deliberately request a genuine new document and boot.
  if (page.url() !== "about:blank") await page.goto("about:blank");
  await page.goto(url);
  await page.locator("html[data-ready=true]").waitFor({ timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await frames(page);
}

async function contextPage(browser, options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    ...options,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  page.setDefaultTimeout(12000);
  return { context, page, errors };
}

// Decode the actual browser screenshot, rather than sampling CSS declarations.
async function pixelStats(page, bytes) {
  return page.evaluate(
    async (source) => {
      const image = new Image();
      image.src = source;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let luminance = 0,
        orange = 0,
        orangeLuma = 0,
        otherLuma = 0,
        centerInkPixels = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const x = (i / 4) % canvas.width,
          y = Math.floor(i / 4 / canvas.width);
        if (
          Math.abs(x - canvas.width / 2) < 24 &&
          Math.abs(y - canvas.height / 2) < 24 &&
          r < 90 &&
          g < 110 &&
          b < 145
        )
          centerInkPixels++;
        luminance += luma;
        if (
          r > 130 &&
          g > 25 &&
          g < 195 &&
          b < 140 &&
          r > g * 1.28 &&
          r > b * 1.5
        ) {
          orange++;
          orangeLuma += luma;
        } else otherLuma += luma;
      }
      const count = pixels.length / 4;
      return {
        width: canvas.width,
        height: canvas.height,
        luma: luminance / count,
        orangePixels: orange,
        orangeFraction: orange / count,
        orangeLuma: orangeLuma / (orange || 1),
        otherLuma: otherLuma / (count - orange || 1),
        centerInkPixels,
      };
    },
    `data:image/png;base64,${bytes.toString("base64")}`,
  );
}

async function shot(page, name) {
  await frames(page);
  const filename = path.join(ARTIFACTS, `${name}.png`);
  const bytes = await page.screenshot({ path: filename });
  return { filename, stats: await pixelStats(page, bytes) };
}

async function mapSnapshot(page) {
  return page.evaluate(() => {
    const node =
      document.querySelector("#globe-container canvas") ||
      document.querySelector("#flat-container .journey-flat-map");
    const rect = node.getBoundingClientRect();
    return {
      dataset: { ...node.dataset },
      width: rect.width,
      height: rect.height,
      transform: node.querySelector(".atlas-world")?.getAttribute("transform"),
      tag: node.tagName,
      parent: node.parentElement.id,
    };
  });
}

async function saveMapIdentity(page) {
  await page.evaluate(() => {
    window.__focusQAOriginalMap =
      document.querySelector("#globe-container canvas") ||
      document.querySelector("#flat-container .journey-flat-map");
    window.__focusQAOriginalStage = document.querySelector("#scene-stage");
  });
  return mapSnapshot(page);
}

async function assertIdentity(page, focused) {
  const actual = await page.evaluate(() => ({
    map:
      window.__focusQAOriginalMap ===
      (document.querySelector("#globe-container canvas") ||
        document.querySelector("#flat-container .journey-flat-map")),
    connected: window.__focusQAOriginalMap?.isConnected,
    stage:
      window.__focusQAOriginalStage === document.querySelector("#scene-stage"),
    inDialog: document
      .querySelector("#territory-view")
      .contains(window.__focusQAOriginalMap),
    duplicates: document.querySelectorAll(".tp-map-svg").length,
  }));
  assert.deepEqual(actual, {
    map: true,
    connected: true,
    stage: true,
    inDialog: focused,
    duplicates: 0,
  });
}

async function openFocus(page, id = "british-india") {
  await page.locator(".territory-open").focus();
  await page.keyboard.press("Enter");
  await focused(page, id);
}

async function focused(page, id) {
  await page
    .locator("#territory-view[aria-modal=true]")
    .waitFor({ state: "visible" });
  await page.waitForFunction(
    (id) => document.querySelector("#scene-stage")?.dataset.focusId === id,
    id,
  );
  await page.waitForFunction(() => {
    const map =
      document.querySelector("#globe-container canvas") ||
      document.querySelector("#flat-container .journey-flat-map");
    return (
      map?.dataset.focusPhase === "settled" && Number(map.dataset.viewZoom) > 1
    );
  });
  await frames(page, 3);
}

async function closed(page) {
  await page.locator("#territory-view").waitFor({ state: "hidden" });
  await frames(page, 3);
  const restored = await page.evaluate(() => ({
    locked: document.body.classList.contains("territory-focus-open"),
    headerInert: document.querySelector(".site-header").inert,
    focusId: document.querySelector("#scene-stage").dataset.focusId || "",
  }));
  assert.deepEqual(restored, {
    locked: false,
    headerInert: false,
    focusId: "",
  });
}

async function photo(page) {
  const image = page
    .locator("[data-focus-reading] .tp-photographs img")
    .first();
  await image.scrollIntoViewIfNeeded();
  await image.evaluate((image) => image.decode());
  assert.ok(
    await image.evaluate(
      (image) => image.naturalWidth > 100 && image.alt.length > 20,
    ),
  );
  assert.ok(
    await page.locator("[data-focus-reading] .tp-image-credit").count(),
  );
  return image.getAttribute("src");
}

async function keyboardLoop(page) {
  const close = page.locator("[data-focus-close]");
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  assert.ok(
    await page.evaluate(() =>
      document
        .querySelector("#territory-view")
        .contains(document.activeElement),
    ),
  );
  for (let i = 0; i < 28; i++) {
    await page.keyboard.press("Tab");
    assert.ok(
      await page.evaluate(() =>
        document
          .querySelector("#territory-view")
          .contains(document.activeElement),
      ),
      `Tab escaped the territory dialog at step ${i}`,
    );
  }
}

async function assertLayout(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    "Page must not overflow horizontally",
  );
  for (const selector of [
    "[data-focus-map]",
    "[data-focus-reading]",
    "[data-focus-close]",
  ]) {
    const box = await page.locator(selector).boundingBox();
    assert.ok(
      box && box.width > 20 && box.height > 20,
      `${selector} has a useful visible box`,
    );
    assert.ok(
      box.x >= -1 && box.x + box.width <= (await page.viewportSize()).width + 1,
      `${selector} fits horizontally`,
    );
  }
}

async function desktopJourney(browser, origin, projection) {
  const { context, page, errors } = await contextPage(browser);
  try {
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1930&view=${projection}&place=british-india`,
    );
    const before = await saveMapIdentity(page);
    assert.equal(
      before.tag,
      "CANVAS",
      "This scenario must use the real WebGL atlas",
    );
    assert.equal(before.dataset.projection, projection);
    const headerBefore = await pixelStats(
      page,
      await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 20 } }),
    );
    await shot(page, `${projection}-before`);
    await openFocus(page);
    await assertIdentity(page, true);
    const during = await mapSnapshot(page);
    assert.equal(
      during.dataset.projection,
      projection,
      "Focus retains the existing projection",
    );
    assert.equal(during.dataset.focusTerritory, "british-india");
    assert.ok(
      Number(during.dataset.viewZoom) > Number(before.dataset.viewZoom) * 1.05,
      "The renderer's actual zoom increases",
    );
    assert.ok(
      await page.evaluate(() =>
        document
          .querySelector("#territory-view")
          .contains(document.activeElement),
      ),
      "Opening moves keyboard focus into the dialog",
    );
    assert.equal(
      await page.locator(".site-header").evaluate((node) => node.inert),
      true,
    );
    await assertLayout(page);
    const headerDuring = await pixelStats(
      page,
      await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 20 } }),
    );
    assert.ok(
      headerDuring.luma < headerBefore.luma * 0.9,
      `Surrounding page actually fades in pixels: ${headerBefore.luma} → ${headerDuring.luma}`,
    );
    const mapPixels = await pixelStats(
      page,
      await page
        .locator("#scene-stage")
        .screenshot({
          path: path.join(ARTIFACTS, `${projection}-focused-map.png`),
        }),
    );
    assert.ok(
      mapPixels.orangeFraction > 0.005,
      "Rendered map contains a visible highlighted territory",
    );
    const focusShot = await shot(page, `${projection}-focused`);
    const imageSource = await photo(page);
    await shot(page, `${projection}-story-photo`);
    await keyboardLoop(page);
    await page.keyboard.press("Escape");
    await closed(page);
    await assertIdentity(page, false);
    const after = await mapSnapshot(page);
    for (const key of [
      "projection",
      "viewZoom",
      "viewLongitude",
      "viewLatitude",
      "viewPanX",
      "viewPanY",
    ])
      assert.equal(
        after.dataset[key],
        before.dataset[key],
        `${key} restores after Escape`,
      );
    assert.equal(await page.locator("#year-slider").inputValue(), "1930");
    assert.ok(
      await page
        .locator(".territory-open")
        .evaluate((node) => node === document.activeElement),
      `Escape restores the initiating control; actual=${await page.evaluate(() => document.activeElement.outerHTML.slice(0, 350))}`,
    );
    await openFocus(page);
    await page.locator("[data-focus-close]").click();
    await closed(page);
    await openFocus(page);
    await page.goBack();
    await closed(page);
    await page.goForward();
    await focused(page, "british-india");
    await assertIdentity(page, true);
    const related = page.locator("[data-tp-territory]").first();
    if (await related.count()) {
      const relatedId = await related.getAttribute("data-tp-territory");
      await related.click();
      await focused(page, relatedId);
      await assertIdentity(page, true);
      assert.equal((await mapSnapshot(page)).dataset.projection, projection);
    }
    await page.locator("[data-focus-atlas]").click();
    await closed(page);
    assert.equal((await mapSnapshot(page)).dataset.projection, projection);
    assert.deepEqual(errors, []);
    evidence.push({
      scenario: `desktop-${projection}`,
      before,
      during,
      after,
      headerBefore,
      headerDuring,
      mapPixels,
      imageSource,
      screenshot: focusShot.filename,
    });
  } finally {
    await context.close();
  }
}

async function mobileJourney(browser, origin, width) {
  const { context, page, errors } = await contextPage(browser, {
    viewport: { width, height: 844 },
  });
  try {
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1930&view=flat&place=british-india`,
    );
    await saveMapIdentity(page);
    await openFocus(page);
    await assertIdentity(page, true);
    await assertLayout(page);
    await shot(page, `mobile-${width}-focused`);
    await photo(page);
    await shot(page, `mobile-${width}-photo`);
    if (width === 390) {
      await page.setViewportSize({ width: 844, height: 390 });
      await focused(page, "british-india");
      await assertLayout(page);
      await page.locator("[data-focus-map]").scrollIntoViewIfNeeded();
      await shot(page, "mobile-landscape-focused");
    }
    await page.locator("[data-focus-close]").click();
    await closed(page);
    await assertIdentity(page, false);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

async function deepLinks(browser, origin) {
  const { context, page, errors } = await contextPage(browser);
  try {
    for (const projection of ["globe", "flat"]) {
      await ready(
        page,
        `${origin}/app/journey/#territory?id=british-india&year=1930&view=${projection}`,
      );
      await focused(page, "british-india");
      assert.equal((await mapSnapshot(page)).dataset.projection, projection);
      await photo(page);
      await page.locator("[data-focus-close]").click();
      await closed(page);
      assert.equal((await mapSnapshot(page)).dataset.projection, projection);
    }
    await ready(
      page,
      `${origin}/app/journey/#territory?id=jamaica&year=1834&view=flat`,
    );
    await focused(page, "jamaica");
    await photo(page);
    await shot(page, "deep-link-jamaica");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

async function fallbackJourney(browser, origin) {
  const { context, page, errors } = await contextPage(browser);
  try {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (/webgl/i.test(type)) return null;
        return original.call(this, type, ...args);
      };
    });
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1930&view=globe&place=british-india`,
    );
    const before = await saveMapIdentity(page);
    assert.equal(before.tag.toLowerCase(), "svg");
    await openFocus(page);
    await assertIdentity(page, true);
    const during = await mapSnapshot(page);
    assert.ok(
      Number(during.dataset.viewZoom) > Number(before.dataset.viewZoom),
    );
    assert.notEqual(
      during.transform,
      before.transform,
      "The existing global SVG is actually zoomed",
    );
    const dim = await page
      .locator(".journey-flat-map .atlas-unit")
      .evaluateAll((nodes) =>
        nodes.reduce(
          (counts, node) => {
            const opacity = Number(getComputedStyle(node).opacity);
            if (opacity < 0.5) counts.dim++;
            else counts.bright++;
            return counts;
          },
          { dim: 0, bright: 0 },
        ),
      );
    assert.ok(
      dim.dim > 20 && dim.bright > 0,
      "Selected fallback geography remains distinct from faded surrounding units",
    );
    const mapPixels = await pixelStats(
      page,
      await page.locator("#scene-stage").screenshot(),
    );
    assert.ok(mapPixels.orangeFraction > 0.005);
    await shot(page, "fallback-focused");
    await page.keyboard.press("Escape");
    await closed(page);
    await assertIdentity(page, false);
    const after = await mapSnapshot(page);
    assert.equal(after.dataset.viewZoom, before.dataset.viewZoom);
    assert.equal(after.transform, before.transform);
    await page.evaluate(() => {
      location.hash = "explore?year=1922&view=flat&place=fiji";
    });
    await page.waitForFunction(
      () =>
        document.querySelector("#historical-context h2")?.textContent ===
        "Fiji",
    );
    await openFocus(page, "fiji");
    await assertIdentity(page, true);
    assert.ok(
      Number((await mapSnapshot(page)).dataset.viewZoom) > 1,
      "Fallback Fiji focuses a visible island group",
    );
    assert.match(
      await page.locator("[data-focus-note]").textContent(),
      /crosses the flat map/i,
    );
    await shot(page, "fallback-fiji");
    await page.keyboard.press("Escape");
    await closed(page);
    assert.deepEqual(errors, []);
    evidence.push({
      scenario: "webgl-fallback",
      before,
      during,
      after,
      dim,
      mapPixels,
    });
  } finally {
    await context.close();
  }
}

async function fullscreenJourney(browser, origin, fallback) {
  const { context, page, errors } = await contextPage(browser);
  try {
    if (fallback)
      await page.addInitScript(() => {
        Element.prototype.requestFullscreen = undefined;
        Element.prototype.webkitRequestFullscreen = undefined;
        Object.defineProperty(document, "fullscreenEnabled", {
          configurable: true,
          get: () => false,
        });
      });
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1930&view=flat&place=british-india`,
    );
    await saveMapIdentity(page);
    await page.locator("#fullscreen-toggle").click();
    await page.waitForFunction(
      () => !!document.querySelector("#atlas-experience").dataset.fullscreen,
    );
    await openFocus(page);
    await assertIdentity(page, true);
    assert.equal(await page.evaluate(() => document.fullscreenElement), null);
    assert.equal(
      await page.locator("#atlas-experience").getAttribute("data-fullscreen"),
      null,
    );
    assert.equal(
      await page.evaluate(() =>
        document.body.classList.contains("atlas-fullscreen-open"),
      ),
      false,
    );
    await shot(page, `from-fullscreen-${fallback ? "fallback" : "native"}`);
    await page.locator("[data-focus-close]").click();
    await closed(page);
    await page.locator("#fullscreen-toggle").click();
    await page.waitForFunction(
      () => !!document.querySelector("#atlas-experience").dataset.fullscreen,
    );
    await page.locator("#fullscreen-toggle").click();
    await page.waitForFunction(
      () => !document.querySelector("#atlas-experience").dataset.fullscreen,
    );
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

async function rallyeJourney(browser, origin) {
  const { context, page, errors } = await contextPage(browser);
  try {
    await ready(page, `${origin}/app/journey/#rallye`);
    await page.locator("#ry-name").fill("Isolated focus QA");
    await page.locator("[data-ry-start] button[type=submit]").click();
    const draft =
      "My saved argument remains recoverable after reading the territory's story.";
    await page.locator("#ry-answer").fill(draft);
    await page.waitForFunction(
      (text) => localStorage.getItem("empire-echoes-rallye-v3")?.includes(text),
      draft,
    );
    const before = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("empire-echoes-rallye-v3")),
    );
    // Current curriculum may start with a modern identity stop without a map.
    // The real territory return route must preserve its response either way.
    const storyButton = page.locator('[data-ry-action="territory"]');
    if (await storyButton.count()) await storyButton.click();
    else
      await page.evaluate(() => {
        location.hash = "territory?id=british-india&year=1930&return=rallye";
      });
    await page
      .locator("#territory-view[aria-modal=true]")
      .waitFor({ state: "visible" });
    const returnLink = page.locator("[data-focus-rallye]");
    await returnLink.click();
    await page.locator("#rallye-view").waitFor({ state: "visible" });
    await closed(page);
    assert.equal(await page.locator("#ry-answer").inputValue(), draft);
    const after = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("empire-echoes-rallye-v3")),
    );
    assert.deepEqual(after.answers, before.answers);
    assert.deepEqual(after.notebooks, before.notebooks);
    assert.deepEqual(after.student, before.student);
    assert.deepEqual(errors, []);
    evidence.push({
      scenario: "rallye-return",
      preservedAnswers: Object.keys(after.answers),
      studentName: after.student.name,
    });
  } finally {
    await context.close();
  }
}

async function motionJourney(browser, origin) {
  const { context, page, errors } = await contextPage(browser, {
    reducedMotion: "no-preference",
  });
  try {
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1930&view=globe&place=british-india`,
    );
    await page.waitForFunction(
      () =>
        document.querySelector("#globe-container canvas").dataset.focusPhase ===
        "settled",
    );
    const before = await saveMapIdentity(page);
    await page.locator(".territory-open").click();
    await page
      .locator("#territory-view[aria-modal=true]")
      .waitFor({ state: "visible" });
    await shot(page, "animated-opening");
    await focused(page, "british-india");
    await shot(page, "animated-settled");
    await page.keyboard.press("Escape");
    await closed(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const started = Date.now();
    await openFocus(page);
    assert.ok(Date.now() - started < 2000, "Reduced motion focuses promptly");
    const running = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.playState === "running").length,
    );
    assert.equal(
      running,
      0,
      "Reduced motion leaves no running decorative animations",
    );
    assert.ok(
      Number((await mapSnapshot(page)).dataset.viewZoom) >
        Number(before.dataset.viewZoom),
    );
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

async function customViewJourney(browser, origin) {
  const { context, page, errors } = await contextPage(browser);
  try {
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1922&view=flat&place=british-india&colour=rule`,
    );
    await page.locator("#zoom-in").click();
    await page.locator("#zoom-in").click();
    await page.locator("#globe-container canvas").focus();
    await page.keyboard.press("ArrowRight");
    await frames(page, 3);
    const before = await saveMapIdentity(page);
    await openFocus(page);
    await page.locator("[data-focus-refocus]").click();
    await focused(page, "british-india");
    await page.keyboard.press("Escape");
    await closed(page);
    const after = await mapSnapshot(page);
    for (const key of [
      "projection",
      "viewZoom",
      "viewLongitude",
      "viewLatitude",
      "viewPanX",
      "viewPanY",
    ])
      assert.equal(
        after.dataset[key],
        before.dataset[key],
        `Custom ${key} restores`,
      );
    assert.equal(await page.locator("#colour-mode").inputValue(), "rule");
    assert.equal(await page.locator("#year-slider").inputValue(), "1922");
    assert.match(page.url(), /place=british-india/);
    await assertIdentity(page, false);
    assert.deepEqual(errors, []);
    evidence.push({ scenario: "custom-camera-and-colour", before, after });
  } finally {
    await context.close();
  }
}

async function geographyJourney(browser, origin) {
  const { context, page, errors } = await contextPage(browser);
  try {
    for (const projection of ["globe", "flat"]) {
      for (const id of ["hong-kong", "gibraltar", "fiji"]) {
        await ready(
          page,
          `${origin}/app/journey/#territory?id=${id}&year=1922&view=${projection}`,
        );
        await focused(page, id);
        const snapshot = await mapSnapshot(page);
        assert.equal(snapshot.dataset.projection, projection);
        assert.ok(
          await page.locator("[data-focus-reading] .tp-section").count(),
        );
        if (id === "fiji" && projection === "flat")
          assert.match(
            await page.locator("[data-focus-note]").textContent(),
            /crosses the flat map/i,
          );
        const screenshot = await shot(page, `${projection}-${id}`);
        const mapPixels = await pixelStats(
          page,
          await page.locator("#scene-stage").screenshot(),
        );
        assert.ok(
          mapPixels.orangePixels > 8 || mapPixels.centerInkPixels > 12,
          `${id} must have a visible selected shape or locator`,
        );
        evidence.push({
          scenario: `${projection}-${id}`,
          snapshot,
          mapPixels,
          screenshot: screenshot.filename,
        });
        await page.locator("[data-focus-close]").click();
        await closed(page);
      }
    }
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

async function lostContextJourney(browser, origin) {
  const { context, page, errors } = await contextPage(browser);
  try {
    await ready(
      page,
      `${origin}/app/journey/#explore?year=1930&view=globe&place=british-india`,
    );
    await saveMapIdentity(page);
    await openFocus(page);
    await page
      .locator("#globe-container canvas")
      .evaluate((canvas) =>
        canvas.dispatchEvent(
          new Event("webglcontextlost", { cancelable: true }),
        ),
      );
    const fallback = page.locator("#flat-container .journey-flat-map");
    await fallback.waitFor({ state: "visible" });
    await page.waitForFunction(
      () =>
        Number(
          document.querySelector("#flat-container .journey-flat-map")?.dataset
            .viewZoom,
        ) > 1,
    );
    assert.equal(
      await page.evaluate(
        () =>
          window.__focusQAOriginalStage ===
          document.querySelector("#scene-stage"),
      ),
      true,
    );
    assert.equal(await fallback.getAttribute("data-focus-id"), "british-india");
    await fallback.evaluate((node) => {
      window.__focusQALiveFallback = node;
    });
    await shot(page, "context-loss-focused");
    await page.keyboard.press("Escape");
    await closed(page);
    assert.ok(await fallback.isVisible());
    assert.equal(
      await fallback.evaluate((node) => node === window.__focusQALiveFallback),
      true,
    );
    const transform = await fallback
      .locator(".atlas-world")
      .getAttribute("transform");
    assert.doesNotMatch(transform, /NaN|Infinity|undefined/);
    assert.equal(Number(await fallback.getAttribute("data-view-zoom")), 1);
    assert.equal(
      await page.locator("#flat-view").getAttribute("aria-pressed"),
      "true",
    );
    assert.match(page.url(), /view=flat/);
    assert.deepEqual(errors, []);
    evidence.push({
      scenario: "webgl-context-loss-during-focus",
      restoredTransform: transform,
    });
  } finally {
    await context.close();
  }
}

(async () => {
  await fs.mkdir(ARTIFACTS, { recursive: true });
  const { server, origin } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--enable-unsafe-swiftshader"],
    });
    console.log(`INFO Chromium ${browser.version()}; isolated ${origin}`);
    for (const projection of ["globe", "flat"])
      await check(
        `${projection}: same live map, real zoom, faded background, story, keyboard and complete return journey`,
        () => desktopJourney(browser, origin, projection),
      );
    for (const width of [390, 320])
      await check(
        `${width}px: focused map, photograph, reading and close remain usable`,
        () => mobileJourney(browser, origin, width),
      );
    await check(
      "Cold territory links retain projection and provide stories for mainland and island cases",
      () => deepLinks(browser, origin),
    );
    await check(
      "WebGL failure focuses and restores the same global SVG atlas",
      () => fallbackJourney(browser, origin),
    );
    for (const fallback of [false, true])
      await check(
        `${fallback ? "Fallback" : "Native"} fullscreen releases into focus and remains usable afterward`,
        () => fullscreenJourney(browser, origin, fallback),
      );
    await check(
      "Rallye writing and notebook survive territory reading and return",
      () => rallyeJourney(browser, origin),
    );
    await check(
      "Animated focus settles and reduced motion completes promptly",
      () => motionJourney(browser, origin),
    );
    await check(
      "A custom atlas camera, selected year, place and authority colours restore exactly",
      () => customViewJourney(browser, origin),
    );
    await check(
      "Tiny and antimeridian territories remain highlighted on globe and flat atlas",
      () => geographyJourney(browser, origin),
    );
    await check(
      "WebGL context loss during focus recovers to SVG and restores a valid fallback camera",
      () => lostContextJourney(browser, origin),
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
    await fs.writeFile(
      path.join(ARTIFACTS, "results.json"),
      JSON.stringify({ passes, failures, evidence }, null, 2),
    );
  }
  console.log(
    `\n${passes} passed; ${failures.length} failed. Artifacts: ${ARTIFACTS}`,
  );
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
