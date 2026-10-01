/* Integration coverage for the compact timeline explanation and SVG fallback.
 * Uses a private port/profile and leaves the classroom server on8777 alone. */
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

(async () => {
  const port = Number(process.env.PORT) || 8892;
  const base = process.env.BASE_URL || `http://127.0.0.1:${port}`;
  let server,
    browser,
    checks = 0;
  function check(value, message) {
    assert.ok(value, message);
    checks++;
    console.log(`PASS ${message}`);
  }
  try {
    if (!process.env.BASE_URL) {
      server = spawn(process.execPath, [path.join(__dirname, "serve.js")], {
        env: { ...process.env, PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
      });
      await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () =>
            reject(new Error("Isolated map test server did not become ready")),
          8000,
        );
        server.stdout.once("data", () => {
          clearTimeout(timer);
          resolve();
        });
        server.once("exit", (code) => {
          clearTimeout(timer);
          reject(new Error(`Isolated test server exited: ${code}`));
        });
        server.once("error", reject);
      });
    }
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1100, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/map-module-test.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<!doctype html><html lang="en"><meta charset="utf-8"><title>Journey map integration test</title><link rel="stylesheet" href="/app/journey/css/experience.css"><link rel="stylesheet" href="/app/journey/css/map-experience.css"><body><main style="max-width:920px;margin:24px auto"><h1 style="font-size:24px">Map test</h1><div id="test-map" style="height:440px;width:100%;position:relative"></div><div id="test-explanation"></div></main></body></html>',
      }),
    );
    await page.goto(`${base}/map-module-test.html`);
    const setup = await page.evaluate(async () => {
      const { loadData } = await import("/app/js/core/data.js");
      const { createYearEndData, diffMapStates } =
        await import("/app/journey/js/map-change-data.js");
      const { createMap } = await import("/app/journey/js/flat-map.js");
      const { createMapExperience } =
        await import("/app/journey/js/map-experience.js");
      const data = createYearEndData(await loadData());
      const state = (window.mapTest = {
        data,
        diffMapStates,
        selected: null,
        year: null,
      });
      state.map = createMap(document.querySelector("#test-map"), {
        data,
        onSelect: (id) => (state.selected = id),
      });
      state.experience = createMapExperience(
        document.querySelector("#test-explanation"),
        {
          data,
          onYear: (year) => state.gotoYear(year),
          onSelect: (id) => (state.selected = id),
        },
      );
      state.gotoYear = (year) => {
        state.year = year;
        state.changes = state.experience.update({ year });
        state.map.update({ year, changes: state.changes });
        return state.changes;
      };
      state.gotoYear(1922);
      const diff = state.gotoYear(1947);
      return {
        removed: diff.removed.length,
        india: diff.groups.removed.some(
          (group) => group.territoryId === "british-india",
        ),
        paintedRemoved: document.querySelectorAll(
          '.atlas-unit[data-change="removed"]',
        ).length,
        heading: document.querySelector(".map-change-heading").textContent,
      };
    });
    check(
      setup.india &&
        setup.removed > 0 &&
        setup.removed === setup.paintedRemoved,
      "1947 year-end removals match actual rendered unit IDs, including British India",
    );
    check(
      setup.heading.includes("Independence and partition"),
      "1947 ribbon provides verified historical context",
    );
    await page.locator(".map-change-disclosure").click();
    check(
      (await page.locator("[data-more-change]:visible").count()) === 0,
      "Detailed ledger remains concise until all changes are requested",
    );
    await page.locator(".map-change-show-all").click();
    check(
      (await page.locator("[data-more-change]:visible").count()) > 0,
      "Every named change remains available in the expanded ledger",
    );
    await page.locator("[data-map-change-place]").first().click();
    check(
      !!(await page.evaluate(() => mapTest.selected)),
      "A named change selects its historical territory",
    );
    await page.locator('[data-map-change="next"]').focus();
    await page.keyboard.press("Enter");
    check(
      await page.evaluate(() => mapTest.year === 1948),
      "Keyboard next-change control advances to the next real change year",
    );
    const reverse = await page.evaluate(() => {
      const { data, diffMapStates } = mapTest;
      const forward = diffMapStates(data, 1960, 1964),
        back = diffMapStates(data, 1964, 1960);
      mapTest.gotoYear(1964);
      mapTest.gotoYear(1960);
      return {
        forward: [...forward.removed].sort(),
        backward: [...back.added].sort(),
        text: document.querySelector(".map-change-reading").textContent,
        hasKenya: forward.groups.removed.some(
          (group) => group.territoryId === "kenya",
        ),
      };
    });
    check(
      reverse.hasKenya &&
        JSON.stringify(reverse.forward) === JSON.stringify(reverse.backward),
      "1960s independence changes reverse consistently when time moves backwards",
    );
    check(
      reverse.text.includes("moving backwards"),
      "Backward comparison explicitly explains its reversed colour semantics",
    );
    const preserved = await page.evaluate(() => {
      const before = mapTest.changes;
      const unchanged = mapTest.experience.update({
        year: mapTest.year,
        selectedId: "kenya",
        mode: "rule",
      });
      mapTest.map.update({ mode: "rule" });
      return (
        before === unchanged &&
        document.querySelectorAll('.atlas-unit[data-change="added"]').length ===
          before.added.length
      );
    });
    check(
      preserved,
      "Selection and colour-mode updates retain the current comparison",
    );
    await page.locator(".journey-flat-map").focus();
    const transformBefore = await page
      .locator(".atlas-world")
      .getAttribute("transform");
    await page.keyboard.press("+");
    const transformZoomed = await page
      .locator(".atlas-world")
      .getAttribute("transform");
    await page.keyboard.press("ArrowRight");
    const transformPanned = await page
      .locator(".atlas-world")
      .getAttribute("transform");
    await page.keyboard.press("Home");
    const transformReset = await page
      .locator(".atlas-world")
      .getAttribute("transform");
    check(
      transformZoomed !== transformBefore &&
        transformPanned !== transformZoomed &&
        transformReset === transformBefore,
      "SVG fallback supports keyboard zoom, pan and reset",
    );
    await page.evaluate(() => mapTest.gotoYear(1997));
    check(
      await page.locator('[data-map-change="next"]').isDisabled(),
      "End-of-atlas control does not advance outside1997",
    );
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 1000 });
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width}px layout has no page overflow`,
      );
    }
    check(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length ===
          0,
      ),
      "Reduced-motion mode has no running animations",
    );
    check(errors.length === 0, "Module lifecycle has no browser errors");
    await page.evaluate(() => {
      mapTest.experience.destroy();
      mapTest.map.destroy();
    });
    check(
      (await page.locator(".journey-flat-map, .map-experience").count()) === 0,
      "Destroy removes both module surfaces",
    );
    console.log(`${checks} map experience checks passed.`);
  } finally {
    await browser?.close();
    server?.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
