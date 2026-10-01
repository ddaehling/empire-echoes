#!/usr/bin/env node
"use strict";

// End-to-end checks for the classroom entry point. Starts and closes its own server:
// node tools/classroom-test.js
// BASE_URL=http://localhost:9000/app/ node tools/classroom-test.js
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");

const PORT = Number(process.env.PORT) || 8877;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}/app/`;
const errors = [];
const failures = [];
const passed = [];
const artifact = (name) =>
  path.join(
    process.env.QA_ARTIFACT_DIR ||
      (process.platform === "win32" ? os.tmpdir() : "/tmp"),
    `classroom-qa-${name}`,
  );

async function startServer() {
  if (process.env.BASE_URL) return null;
  const server = spawn(process.execPath, [path.join(__dirname, "serve.js")], {
    env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => {
      server.kill();
      reject(new Error(`Test server did not start: ${output}`));
    }, 10000);
    server.stdout.on("data", (bytes) => {
      output += bytes;
      if (output.includes("Classroom atlas:")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on("data", (bytes) => {
      output += bytes;
    });
    server.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    server.on("exit", (code) => {
      clearTimeout(timeout);
      reject(new Error(`Test server exited (${code}): ${output}`));
    });
  });
  return server;
}

async function main() {
  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      acceptDownloads: true,
    });
    const page = await context.newPage();
    page.on("pageerror", (error) =>
      errors.push(`Page error: ${error.message}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`Console: ${message.text()}`);
    });
    page.on("requestfailed", (request) =>
      errors.push(
        `Request failed: ${request.url()} (${request.failure()?.errorText})`,
      ),
    );
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`HTTP ${response.status()}: ${response.url()}`);
    });
    const expect = async (predicate, message) =>
      assert.ok(await predicate, message);
    const test = async (name, run) => {
      try {
        await run();
        passed.push(name);
        console.log(`PASS ${name}`);
      } catch (error) {
        failures.push(`${name}: ${error.message}`);
        console.error(`FAIL ${name}: ${error.message}`);
      }
    };
    const route = async (hash) => {
      await page.evaluate((value) => {
        location.hash = value;
      }, hash);
      const view = hash.split(/[/?]/)[0];
      await page.locator(`#${view}-view`).waitFor({ state: "visible" });
      if (view === "learn" && /\/[0-3]$/.test(hash)) {
        await page.waitForFunction(
          (value) =>
            document.querySelector('.step-list [aria-current="step"]')?.dataset
              .step === value.split("/")[2],
          hash,
        );
      }
    };
    const waitChapter = async (step) =>
      page.waitForFunction(
        (value) =>
          document.querySelector('.step-list [aria-current="step"]')?.dataset
            .step === String(value),
        step,
      );
    await page.goto(BASE_URL);
    await page.locator('html[data-ready="true"]').waitFor();
    await page.evaluate(() => document.fonts.ready);

    await test("entry point and all classroom routes", async () => {
      assert.ok(
        (await page.locator(".atlas-unit").count()) > 100,
        "Map needs real territory geometry",
      );
      assert.equal(await page.locator(".story-card").count(), 3);
      for (const hash of [
        "explore",
        "learn",
        "learn/company/0",
        "check",
        "teacher",
      ]) {
        await route(hash);
        const view = hash.split("/")[0];
        assert.equal(
          await page.locator(".view:visible").count(),
          1,
          "Exactly one route should be visible",
        );
        await expect(
          page
            .locator(`[data-view="${view}"]`)
            .getAttribute("aria-current")
            .then((value) => value === "page"),
          `Navigation state for ${view}`,
        );
        await expect(
          page.locator(`#${view}-view h1`).isVisible(),
          `${view} needs a heading`,
        );
      }
    });

    await test("timeline changes map, supports keyboard and stops playback", async () => {
      await route("explore?year=1922");
      const before = await page
        .locator(".atlas-unit")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("fill")).join("|"),
        );
      await page.locator('[data-year="1600"]').click();
      assert.equal(await page.locator("#year-output").textContent(), "1600");
      const after = await page
        .locator(".atlas-unit")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("fill")).join("|"),
        );
      assert.notEqual(before, after, "Year must change actual map colouring");
      await expect(
        page.locator("#year-back").isDisabled(),
        "Lower year boundary must disable previous",
      );
      await page.locator("#year-slider").focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await page.locator("#map-year").textContent(), "1601");
      assert.match(page.url(), /year=1601/);
      await page.locator('[data-year="1997"]').click();
      await expect(
        page.locator("#year-forward").isDisabled(),
        "Upper year boundary must disable next",
      );
      await page.locator("#play-years").click();
      await page.waitForFunction(
        () =>
          Number(document.querySelector("#map-year").textContent) > 1600 &&
          Number(document.querySelector("#map-year").textContent) < 1997,
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("#play-years").getAttribute("aria-pressed"),
        "false",
      );
      const stopped = await page.locator("#map-year").textContent();
      await page.waitForTimeout(720);
      assert.equal(
        await page.locator("#map-year").textContent(),
        stopped,
        "Escape must actually stop playback",
      );
      await page.locator('[data-map-mode="rule"]').click();
      assert.equal(
        await page
          .locator('[data-map-mode="rule"]')
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.match(
        await page.locator("#map-legend").textContent(),
        /Direct authority.*Indirect authority.*Limited authority/,
      );
      await page.locator('[data-map-mode="extent"]').click();
      await page.locator("#map-note-toggle").click();
      await expect(
        page.locator("#map-note").isVisible(),
        "Map caveats must open",
      );
      await page.locator("#map-note-toggle").click();
      const initialTransform = await page
        .locator(".atlas-world")
        .getAttribute("transform");
      await page.locator("#zoom-in").click();
      assert.notEqual(
        await page.locator(".atlas-world").getAttribute("transform"),
        initialTransform,
        "Zoom must change map",
      );
      await page.locator("#zoom-reset").click();
      assert.equal(
        await page.locator(".atlas-world").getAttribute("transform"),
        initialTransform,
      );
    });

    await test("territory search is usable entirely by keyboard", async () => {
      await route("explore?year=1922");
      await page.locator("#main").focus();
      await page.keyboard.press("/");
      assert.equal(
        await page
          .locator("#place-search")
          .evaluate((node) => document.activeElement === node),
        true,
      );
      await page.locator("#place-search").fill("India");
      await page.keyboard.press("ArrowDown");
      await expect(
        page
          .locator("#search-results button")
          .first()
          .evaluate((node) => document.activeElement === node),
        "Down arrow moves to first match",
      );
      await page.keyboard.press("ArrowUp");
      await expect(
        page
          .locator("#place-search")
          .evaluate((node) => document.activeElement === node),
        "Up arrow returns to search",
      );
      await page.keyboard.press("Enter");
      assert.equal(
        await page.locator("#discovery-content h2").textContent(),
        "British India",
      );
      assert.match(page.url(), /place=british-india/);
      await expect(
        page.locator("#search-results").isHidden(),
        "Results must close after selection",
      );
      await page.locator("#place-search").fill("no-place-with-this-name");
      assert.match(
        await page.locator("#search-results").textContent(),
        /No matching place/,
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("#place-search").getAttribute("aria-expanded"),
        "false",
      );
      await page.locator("#close-territory").click();
      assert.equal(
        await page.locator("#discovery-content.is-territory").count(),
        0,
      );
    });

    await test("four chapters, saved notes, map return, completion and download", async () => {
      await route("learn/company/0");
      await expect(
        page.locator("#previous-step").isDisabled(),
        "First chapter cannot navigate before start",
      );
      const sample =
        "QA note 1: trade, taxes and power. <script>plain text</script>";
      await page.locator("#lesson-response").fill(sample);
      await page.reload();
      await page.locator('html[data-ready="true"]').waitFor();
      assert.equal(
        await page.locator("#lesson-response").inputValue(),
        sample,
        "Note must survive reload",
      );
      await page.locator(".lesson-map-link a").click();
      await page.locator("#explore-view").waitFor({ state: "visible" });
      assert.match(page.url(), /return=learn%2Fcompany%2F0/);
      assert.equal(
        await page.locator("#discovery-content h2").textContent(),
        "British India",
      );
      await page
        .getByRole("link", { name: "Return to your lesson", exact: false })
        .click();
      await page.locator("#lesson-response").waitFor();
      assert.equal(
        await page.locator("#lesson-response").inputValue(),
        sample,
        "Map excursion must preserve notes",
      );
      await page.locator("#next-step").click();
      await page.waitForURL(/#learn\/company\/1$/);
      await waitChapter(1);
      await page.goBack();
      await page.waitForURL(/#learn\/company\/0$/);
      await waitChapter(0);
      assert.equal(
        await page.locator("#lesson-response").inputValue(),
        sample,
        "Browser back restores prior chapter",
      );
      for (let step = 1; step < 4; step++) {
        await page.locator("#next-step").click();
        await page.waitForURL(new RegExp(`#learn/company/${step}$`));
        await waitChapter(step);
        await page
          .locator("#lesson-response")
          .fill(`QA note ${step + 1}: an explanation for chapter ${step + 1}.`);
      }
      await page.locator("#next-step").click();
      await page.waitForURL(/#learn\/company\/complete$/);
      await page.locator("#download-notes").waitFor({ state: "visible" });
      assert.equal(await page.locator(".answer-review").count(), 4);
      assert.equal(
        await page.locator(".answer-review").first().locator("p").textContent(),
        sample,
        "Typed markup must remain literal text",
      );
      const downloadPromise = page.waitForEvent("download");
      await page.locator("#download-notes").click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), "empire-company-notes.txt");
      const content = await fs.readFile(await download.path(), "utf8");
      for (let chapter = 1; chapter <= 4; chapter++)
        assert.match(content, new RegExp(`QA note ${chapter}:`));
      assert.match(content, /Sources/);
      await route("learn");
      const company = page
        .locator(".lesson-row")
        .filter({ has: page.locator('a[href^="#learn/company/"]') });
      assert.match(await company.textContent(), /Completed/);
      await page.reload();
      await page.locator('html[data-ready="true"]').waitFor();
      assert.match(
        await company.textContent(),
        /Completed/,
        "Completion must survive reload",
      );
    });

    await test("quick check handles wrong and correct answers, results and restart", async () => {
      await route("check");
      const answers = [0, 2, 0, 2, 1]; // First deliberately wrong; remaining four correct.
      for (let index = 0; index < answers.length; index++) {
        assert.match(
          await page.locator(".quiz-status").textContent(),
          new RegExp(`Question ${index + 1} of 5`),
        );
        await expect(
          page.locator("#quiz-action").isDisabled(),
          "Answer required before checking",
        );
        await page.locator(`[data-option="${answers[index]}"]`).click();
        assert.equal(
          await page
            .locator(`[data-option="${answers[index]}"]`)
            .getAttribute("aria-pressed"),
          "true",
        );
        await page.locator("#quiz-action").click();
        assert.match(
          await page.locator(".quiz-feedback h3").textContent(),
          index === 0 ? /Here’s the connection/ : /That’s right/,
        );
        assert.equal(
          await page.locator(".quiz-option:disabled").count(),
          3,
          "Checked answers must not be editable",
        );
        assert.equal(await page.locator(".quiz-option.is-correct").count(), 1);
        await page.locator("#quiz-action").click();
      }
      assert.equal(
        await page.locator(".score-line").textContent(),
        "4 of 5 correct",
      );
      assert.equal(await page.locator(".answer-review").count(), 5);
      await expect(
        page
          .locator("#check-title")
          .evaluate((node) => document.activeElement === node),
        "Keyboard focus should reach results heading",
      );
      await page.locator("#restart-quiz").click();
      assert.match(
        await page.locator(".quiz-status").textContent(),
        /Question 1 of 5/,
      );
      await expect(
        page.locator("#quiz-action").isDisabled(),
        "Restart must clear previous selections",
      );
    });

    await test("teacher plan prints with the student worksheet", async () => {
      await route("teacher");
      assert.equal(await page.locator(".agenda-row").count(), 6);
      const minutes = await page
        .locator(".agenda-row > span")
        .allTextContents();
      assert.equal(
        minutes.reduce((sum, value) => sum + parseInt(value, 10), 0),
        45,
      );
      await expect(
        page.locator(".print-only").isHidden(),
        "Worksheet only appears when printing",
      );
      await page.evaluate(() => {
        window.__qaPrints = 0;
        window.print = () => window.__qaPrints++;
      });
      await page.locator("#print-lesson").click();
      assert.equal(
        await page.evaluate(() => window.__qaPrints),
        1,
        "Print action invokes print",
      );
      await page.emulateMedia({ media: "print" });
      try {
        await expect(
          page.locator(".print-only").isVisible(),
          "Printed plan includes worksheet",
        );
        assert.equal(await page.locator(".print-question").count(), 3);
        await expect(
          page.locator(".site-header").isHidden(),
          "Print hides navigation",
        );
        await expect(
          page.locator(".skip-link").isHidden(),
          "Print hides the fixed skip link",
        );
        await expect(
          page.locator(".teacher-aside").isHidden(),
          "Print hides interactive teacher controls",
        );
        await page.pdf({
          path: artifact("teacher.pdf"),
          format: "A4",
          printBackground: true,
        });
        await page.screenshot({
          path: artifact("teacher-print.png"),
          fullPage: true,
          animations: "disabled",
        });
      } finally {
        await page.emulateMedia({ media: "screen" });
      }
    });

    await test("skip to content preserves the current lesson", async () => {
      await route("learn/company/2");
      await page.locator(".skip-link").focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(100);
      await expect(
        page.locator("#learn-view").isVisible(),
        "Skip link must not navigate to Explore",
      );
      await expect(
        page
          .locator("#main")
          .evaluate((node) => document.activeElement === node),
        "Skip link must focus main content",
      );
    });

    await test("mobile, tablet and desktop routes fit without horizontal scrolling", async () => {
      for (const width of [390, 768, 1440]) {
        await page.setViewportSize({
          width,
          height: width === 390 ? 844 : 1000,
        });
        for (const hash of [
          "explore?year=1922&place=",
          "learn",
          "learn/company/0",
          "learn/company/complete",
          "check",
          "teacher",
        ]) {
          await route(hash);
          await page.evaluate(() => document.fonts.ready);
          const dimensions = await page.evaluate(() => ({
            viewport: innerWidth,
            body: document.body.scrollWidth,
            root: document.documentElement.scrollWidth,
          }));
          assert.ok(
            Math.max(dimensions.body, dimensions.root) <=
              dimensions.viewport + 1,
            `${hash} overflows at ${width}px: ${JSON.stringify(dimensions)}`,
          );
          if (hash.startsWith("explore?"))
            await page.screenshot({
              path: artifact(`explore-${width}.png`),
              fullPage: true,
              animations: "disabled",
            });
        }
        assert.equal(
          await page.getByRole("link", { name: /For teachers/ }).count(),
          1,
          `Teacher navigation must have an accessible name at ${width}px`,
        );
      }
    });

    await test("loaded classroom runs without external network access", async () => {
      await context.setOffline(true);
      try {
        await route("explore?year=1947");
        assert.equal(await page.locator("#map-year").textContent(), "1947");
        await route("learn/atlantic/1");
        await expect(
          page.locator("#lesson-response").isVisible(),
          "Lessons remain available offline",
        );
        await route("learn/independence/3");
        await expect(
          page.locator("#lesson-response").isVisible(),
          "All story routes remain available offline",
        );
      } finally {
        await context.setOffline(false);
      }
    });

    await test("no browser errors or failed local assets", async () =>
      assert.deepEqual(errors, []));
    console.log(
      `\n${passed.length} passed; ${failures.length} failed. Screenshots and print sample: ${artifact("*")}`,
    );
    if (failures.length) process.exitCode = 1;
    await context.close();
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) {
      await new Promise((resolve) => {
        server.once("exit", resolve);
        server.kill();
      });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
