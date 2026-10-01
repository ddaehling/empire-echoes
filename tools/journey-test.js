#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const {
  startServer: privateServer,
  noAssessment,
} = require("./qa/learning-harness.js");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
let URL = process.env.BASE_URL;
const PREFIX = process.env.QA_ARTIFACT_DIR || "/tmp";
const artifact = (name) => path.join(PREFIX, `journey-final-${name}`);
const failures = [];
let passes = 0;
async function check(name, run) {
  try {
    await run();
    passes++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function preserve() {
  const entries = Object.entries(
    JSON.parse(
      await fs.readFile(
        path.join(ROOT, "tools/qa/pre-journey-sha256.json"),
        "utf8",
      ),
    ),
  );
  assert.equal(entries.length, 231);
  for (const [file, sha] of entries)
    assert.equal(
      crypto
        .createHash("sha256")
        .update(await fs.readFile(path.join(ROOT, file)))
        .digest("hex"),
      sha,
      file,
    );
}
async function startServer() {
  if (process.env.BASE_URL) return null;
  const { server, origin } = await privateServer();
  URL = `${origin}/app/journey/`;
  return server;
}
async function ready(page) {
  await page.goto(URL);
  await page.locator("html[data-ready=true]").waitFor({ timeout: 25000 });
  await page.evaluate(() => document.fonts.ready);
}
async function route(page, hash, view) {
  await page.evaluate((h) => (location.hash = h), hash);
  await page.locator(`#${view}-view`).waitFor({ state: "visible" });
  if (view !== "territory")
    await page.locator("#territory-view").waitFor({ state: "hidden" });
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}
async function noOverflow(page) {
  const s = await page.evaluate(() => ({
    w: innerWidth,
    sw: document.documentElement.scrollWidth,
  }));
  assert.ok(s.sw <= s.w + 1, JSON.stringify(s));
}
async function download(page, format) {
  const button = page
    .locator(`[data-ry-download=${format}]`)
    .filter({ visible: true })
    .first();
  if (!(await button.count()))
    await page.locator(".ry-downloads summary").first().click();
  const pending = page.waitForEvent("download");
  await page
    .locator(`[data-ry-download=${format}]`)
    .filter({ visible: true })
    .first()
    .click();
  const result = await pending;
  return fs.readFile(await result.path(), "utf8");
}
async function main() {
  await check(
    "all 231 files from both previous versions remain unchanged",
    preserve,
  );
  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--enable-unsafe-swiftshader"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await ready(page);
    await check(
      "new atlas boots with real WebGL, correct navigation and retained old URLs",
      async () => {
        assert.equal(
          await page.locator("canvas[data-globe-ready=true]").count(),
          1,
        );
        assert.deepEqual(
          await page
            .locator(".main-nav [data-view]")
            .evaluateAll((ns) => ns.map((n) => n.dataset.view)),
          ["explore", "rallye", "teacher"],
        );
        for (const url of ["../next/", "../"]) {
          const response = await page.request.get(
            new global.URL(url, URL).href,
          );
          assert.equal(response.status(), 200);
          assert.match(await response.text(), /The British Empire/);
        }
      },
    );
    await check(
      "integrated toggle resets then unfolds one live canvas and folds back",
      async () => {
        await page.emulateMedia({ reducedMotion: "no-preference" });
        const canvas = page.locator("#globe-container canvas");
        await canvas.focus();
        await page.keyboard.press("ArrowRight");
        await page.locator("#flat-view").click();
        await page.waitForFunction(
          () =>
            document.querySelector("#globe-container canvas").dataset
              .transitionPhase === "unfold",
        );
        await page.screenshot({
          path: artifact("unfold-midpoint.png"),
          clip: await page.locator("#scene-stage").boundingBox(),
        });
        await page.waitForFunction(
          () =>
            document.querySelector("#globe-container canvas").dataset
              .projection === "flat",
        );
        assert.ok(await page.locator("#globe-container").isVisible());
        assert.ok(await page.locator("#flat-container").isHidden());
        assert.equal(await canvas.getAttribute("data-morph"), "1.0000");
        await page.locator("#zoom-in").click();
        await page.locator("#reset-view").click();
        await page.locator("#globe-view").click();
        await page.waitForFunction(
          () =>
            document.querySelector("#globe-container canvas").dataset
              .projection === "globe",
        );
        await page.emulateMedia({ reducedMotion: "reduce" });
      },
    );
    await check(
      "map changes use year-end India/Kenya/Hong Kong semantics and accurate labelled differences",
      async () => {
        const results = await page.evaluate(async () => {
          const { loadData } = await import("../js/core/data.js");
          const { createYearEndData, diffMapStates } =
            await import("./js/map-change-data.js");
          const d = createYearEndData(await loadData());
          return {
            india: d.territoryAt("british-india", 1947).controlled,
            kenya: d.territoryAt("kenya", 1963).controlled,
            hk: d.territoryAt("hong-kong", 1997).controlled,
            removed: diffMapStates(d, 1996, 1997).removed.length,
          };
        });
        assert.deepEqual(results, {
          india: false,
          kenya: false,
          hk: false,
          removed: 3,
        });
        await page.locator('[data-year="1997"]').click();
        assert.equal(await page.locator("#hero-year").textContent(), "1997");
        assert.match(
          await page.locator("#map-experience").innerText(),
          /Hong Kong|1997/,
        );
      },
    );
    await check(
      "keyboard place search opens a focused, sourced territory page with a real photo",
      async () => {
        await page.locator("#place-search").fill("India");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await page.evaluate(() => {
          window.__originalAtlasCanvas = document.querySelector(
            "#globe-container canvas",
          );
        });
        await page.locator(".territory-open").click();
        await page.locator("#territory-view").waitFor({ state: "visible" });
        assert.match(
          await page.locator("#territory-view h1").textContent(),
          /India/,
        );
        assert.ok(
          await page
            .locator("#territory-view #globe-container canvas")
            .isVisible(),
        );
        assert.ok(
          await page.evaluate(
            () =>
              document.querySelector("#territory-view canvas") ===
              window.__originalAtlasCanvas,
          ),
        );
        assert.equal(
          await page
            .locator("#territory-view canvas")
            .getAttribute("data-focus-territory"),
          "british-india",
        );
        assert.equal(
          await page.locator("#territory-view").getAttribute("aria-modal"),
          "true",
        );
        assert.ok(
          await page.locator(".site-header").evaluate((el) => el.inert),
        );
        const photo = page.locator(".tp-photographs img").first();
        await photo.scrollIntoViewIfNeeded();
        await photo.evaluate((img) => img.decode());
        assert.ok(await photo.evaluate((img) => img.naturalWidth > 500));
        assert.match(
          await page.locator("#territory-view").innerText(),
          /Echoes in Britain|Turning points/,
        );
        await page.screenshot({
          path: artifact("territory.png"),
          fullPage: true,
        });
        await page.locator("[data-tp-explore]").first().click();
        await page.locator("#explore-view").waitFor({ state: "visible" });
      },
    );
    const content = await page.evaluate(async () => {
      const { rallye } = await import("./js/rallye-content.js");
      return rallye;
    });
    const stages = [...content.stations, content.finalAssessment];
    await check(
      "six historical tasks and the final identity comment are ungraded",
      async () => {
        assert.equal(stages.length, 7);
        assert.equal(content.minutes, 45);
        assert.ok(content.contentRevision);
        noAssessment(content);
        assert.ok(
          stages.every(
            (s) => s.investigation.operator && s.investigation.responsePurpose,
          ),
        );
        assert.equal(
          content.stations.filter((s) =>
            /analyse.*word/i.test(s.investigation.operator),
          ).length,
          2,
        );
        assert.match(
          content.finalAssessment.investigation.prompt,
          /imperial|empire/i,
        );
        assert.match(content.finalAssessment.investigation.prompt, /identit/i);
      },
    );
    await route(page, "rallye", "rallye");
    await check(
      "all seven task pages provide editable learning responses without length gates",
      async () => {
        await page.locator("#ry-name").fill("QA Learner <history>");
        await page.locator("#ry-class").fill("Year 11");
        await page.locator("[data-ry-start] button[type=submit]").click();
        for (const [i, stage] of stages.entries()) {
          await page.locator(`[data-ry-stage="${stage.id}"]`).first().click();
          assert.ok(await page.locator("#ry-answer").isEditable());
          assert.equal(
            await page.locator("#ry-answer").getAttribute("maxlength"),
            null,
          );
          noAssessment(await page.locator("#rallye-view").innerText());
          await page
            .locator("#ry-answer")
            .fill(`Evidence connects the history to ${stage.title}.`);
          await page.locator("[data-ry-done]").check();
          if (i === 0) {
            await page.locator(".ry-research > summary").click();
            await page.locator('[data-ry-action="explore"]').first().click();
            await page.locator("#explore-view").waitFor({ state: "visible" });
            assert.equal(
              await page.locator("#hero-year").textContent(),
              String(stage.mapFocus.year),
            );
            await page
              .locator('a[href="#rallye"]')
              .filter({ visible: true })
              .last()
              .click();
            await page.locator("#ry-answer").waitFor();
            assert.equal(
              await page.locator("#ry-answer").inputValue(),
              `Evidence connects the history to ${stage.title}.`,
            );
          }
        }
        await page.reload();
        await page.locator("html[data-ready=true]").waitFor();
        const draft = JSON.parse(await download(page, "json"));
        assert.equal(draft.stages.length, 7);
        noAssessment(draft);
      },
    );
    await check(
      "saving a review keeps the portfolio editable and exports every answer",
      async () => {
        await page.locator('[data-ry-action="review"]').click();
        await page.locator('[data-ry-action="complete"]').click();
        noAssessment(await page.locator("#rallye-view").innerText());
        await page.locator(`[data-ry-stage="${stages[0].id}"]`).first().click();
        const edited =
          "A revised answer remains editable after the saved review.";
        await page.locator("#ry-answer").fill(edited);
        const json = JSON.parse(await download(page, "json"));
        noAssessment(json);
        assert.equal(json.stages[0].response, edited);
        assert.ok(json.stages.every((s) => s.response));
        const text = await download(page, "txt"),
          html = await download(page, "html");
        noAssessment(text);
        noAssessment(html);
        assert.ok(
          stages.every((s) => text.includes(s.title) && html.includes(s.title)),
        );
        assert.ok(html.includes("QA Learner &lt;history&gt;"));
        await fs.writeFile(artifact("student-report.html"), html);
        await fs.writeFile(
          artifact("student-report.json"),
          JSON.stringify(json, null, 2),
        );
        const reportPage = await context.newPage();
        await reportPage.setContent(html);
        await reportPage.pdf({
          path: artifact("student-report.pdf"),
          format: "A4",
          printBackground: true,
        });
        await reportPage.close();
        await page.reload();
        await page.locator("html[data-ready=true]").waitFor();
        await page.locator(`[data-ry-stage="${stages[0].id}"]`).first().click();
        assert.equal(await page.locator("#ry-answer").inputValue(), edited);
      },
    );
    await check(
      "all four destinations fit desktop, tablet and mobile",
      async () => {
        for (const width of [390, 768, 1440]) {
          await page.setViewportSize({
            width,
            height: width === 390 ? 844 : 1000,
          });
          for (const [hash, view] of [
            ["explore", "explore"],
            ["territory?id=hong-kong&year=1997", "territory"],
            ["rallye", "rallye"],
            ["teacher", "teacher"],
          ]) {
            await route(page, hash, view);
            await noOverflow(page);
            await page.screenshot({
              path: artifact(`${view}-${width}.png`),
              fullPage: true,
            });
          }
        }
      },
    );
    await check(
      "teacher handout contains exact rallye prompts, all station keys and complete downloads",
      async () => {
        const guide = await page.evaluate(async () => {
          const { teacherGuide } = await import("./js/teacher-content.js");
          const { renderTeacherDocument, teacherGuideText } =
            await import("./js/teacher.js");
          return {
            html: renderTeacherDocument(teacherGuide),
            text: teacherGuideText(teacherGuide),
          };
        });
        assert.ok(
          stages.every((s) => guide.text.includes(s.investigation.prompt)),
        );
        noAssessment(guide.text);
        noAssessment(guide.html);
        assert.match(guide.text, /Windrush|migration/i);
        assert.ok(guide.html.includes("<!doctype html>"));
        await fs.writeFile(artifact("teacher.html"), guide.html);
      },
    );
    await check(
      "new core experience loads and functions without external network access",
      async () => {
        const offline = await browser.newContext({ reducedMotion: "reduce" });
        await offline.route("**/*", (route) =>
          new global.URL(route.request().url()).origin ===
          new global.URL(URL).origin
            ? route.continue()
            : route.abort(),
        );
        const p = await offline.newPage();
        await ready(p);
        await route(p, "rallye", "rallye");
        assert.ok(await p.locator("[data-ry-start]").isVisible());
        await route(p, "territory?id=jamaica&year=1838", "territory");
        assert.match(await p.locator("#territory-view").innerText(), /Jamaica/);
        await offline.close();
      },
    );
    await check(
      "new integrated experience has no browser errors or failed local assets",
      async () => assert.deepEqual(errors, []),
    );
    await check(
      "previous app files remain unchanged after the complete user flow",
      preserve,
    );
    await context.close();
  } finally {
    await browser?.close();
    if (server) await new Promise((resolve) => server.close(resolve));
  }
  console.log(
    `\n${passes} passed; ${failures.length} failed. Evidence: ${artifact("*")}`,
  );
  if (failures.length) process.exitCode = 1;
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
