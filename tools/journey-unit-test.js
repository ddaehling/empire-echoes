#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT) || 8993;
const BASE = process.env.BASE_URL || `http://127.0.0.1:${PORT}`;
const moduleURL = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
let passes = 0;
async function check(name, run) {
  await run();
  passes += 1;
  console.log(`PASS ${name}`);
}
async function server() {
  if (process.env.BASE_URL) return null;
  const child = spawn(process.execPath, [path.join(ROOT, "tools/serve.js")], {
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Test server startup timeout")),
      10000,
    );
    child.stdout.on("data", (chunk) => {
      if (String(chunk).includes("Classroom atlas:")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    child.stderr.on("data", (chunk) => {
      clearTimeout(timeout);
      reject(new Error(String(chunk)));
    });
    child.on("error", reject);
  });
  return child;
}
(async () => {
  const [content, resources, legacy, source] = await Promise.all([
    fs.readFile(path.join(ROOT, "app/journey/js/rallye-content.js"), "utf8"),
    fs.readFile(path.join(ROOT, "app/journey/js/rallye-resources.js"), "utf8"),
    fs.readFile(
      path.join(ROOT, "app/journey/js/rallye-legacy-prompts.js"),
      "utf8",
    ),
    fs.readFile(path.join(ROOT, "app/journey/js/rallye.js"), "utf8"),
  ]);
  const actual = (await import(moduleURL(content))).rallye;
  const stages = [...actual.stations, actual.finalAssessment];
  const fixtureContent = `${content}\nrallye.contentRevision = "migration-test-current";\nrallye.stations[0].investigation.operator = "Explain";\nrallye.stations[0].investigation.responsePurpose = "Connect a source detail to a claim.";\nrallye.stations[0].investigation.support = { stems: ["The evidence suggests …"], vocabulary: [{ term: "revenue", meaning: "income collected by an authority" }] };`;
  const fixtureEngine = source
    .replace('"./rallye-content.js"', JSON.stringify(moduleURL(fixtureContent)))
    .replace('"./rallye-resources.js"', JSON.stringify(moduleURL(resources)))
    .replace('"./rallye-legacy-prompts.js"', JSON.stringify(moduleURL(legacy)));
  const engine = await import(moduleURL(fixtureEngine));
  const { LEGACY_PROMPT_SNAPSHOT } = await import(moduleURL(legacy));
  const stamp = "2026-09-29T10:00:00.000Z";
  const old = {
    version: 3,
    rallyeId: actual.id,
    student: { name: "Earlier Learner", className: "Q2" },
    answers: {
      [stages[0].id]: "My original answer belongs to the earlier question.",
      "removed-stage": "Also preserve unknown old stage IDs.",
    },
    notebooks: {
      [stages[0].id]: {
        note: "Original research note",
        citations: [
          { title: "Earlier source", url: "https://example.org/earlier" },
        ],
      },
    },
    checkpoints: { [stages[0].id]: "old-choice" },
    startedAt: stamp,
    submittedAt: stamp,
    updatedAt: stamp,
    currentIndex: 3,
  };
  await check(
    "actual content retains seven required responses, 45 minutes and human written marking",
    () => {
      assert.equal(stages.length, 7);
      assert.equal(
        stages.reduce((sum, item) => sum + item.minutes, 0),
        actual.minutes,
      );
      assert.equal(actual.minutes, 45);
      const total = stages.reduce(
        (sum, stage) =>
          sum + (stage.investigation || stage.question || stage).points,
        0,
      );
      assert.equal(total, actual.points);
      for (const stage of stages) {
        const task = stage.investigation || stage.question || stage;
        assert.ok(task.minWords > 0 && task.maxWords >= task.minWords);
        assert.equal(
          task.rubric.reduce((sum, item) => sum + item.points, 0),
          task.points,
          stage.id,
        );
        assert.ok(
          engine.validateStage(stage, "", { citations: [] }),
          `${stage.id} remains required`,
        );
      }
      assert.equal(engine.gradeRallye({}).written.earned, null);
      assert.equal(engine.gradeRallye({}).written.pending, actual.points);
    },
  );
  const migrated = engine.normaliseSaved(old);
  await check(
    "legacy completed attempt is archived with exact old prompts and never regraded as current work",
    () => {
      assert.deepEqual(migrated.answers, {});
      assert.deepEqual(migrated.notebooks, {});
      assert.deepEqual(migrated.checkpoints, {});
      assert.equal(migrated.startedAt, null);
      assert.equal(migrated.submittedAt, null);
      assert.equal(migrated.student.name, old.student.name);
      assert.equal(migrated.previousAttempts.length, 1);
      const entry = migrated.previousAttempts[0];
      assert.deepEqual(entry.attempt, old);
      assert.deepEqual(entry.promptSnapshot, LEGACY_PROMPT_SNAPSHOT);
      assert.equal(entry.contentRevision, "legacy-v1");
      assert.equal(entry.attempt.submittedAt, stamp);
      const draft = engine.normaliseSaved({ ...old, submittedAt: null });
      assert.equal(draft.previousAttempts[0].attempt.submittedAt, null);
      assert.deepEqual(draft.previousAttempts[0].attempt.answers, old.answers);
      assert.equal(draft.startedAt, null);
      assert.match(
        engine.recoveredAttemptText(entry),
        /Also preserve unknown old stage IDs/,
      );
      assert.match(
        engine.recoveredAttemptText(entry),
        /Original research note/,
      );
      assert.ok(
        engine
          .recoveredAttemptText(entry)
          .includes(LEGACY_PROMPT_SNAPSHOT[0].prompt),
      );
    },
  );
  await check(
    "same-revision drafts resume without duplicate archives; future mismatches retain original snapshots",
    () => {
      migrated.answers[stages[0].id] = "New draft for the current question.";
      migrated.startedAt = stamp;
      const resumed = engine.normaliseSaved(migrated);
      assert.equal(
        resumed.answers[stages[0].id],
        migrated.answers[stages[0].id],
      );
      assert.equal(resumed.previousAttempts.length, 1);
      const future = engine.normaliseSaved({
        ...migrated,
        contentRevision: "earlier-test-revision",
      });
      assert.equal(future.previousAttempts.length, 2);
      assert.deepEqual(future.answers, {});
      assert.deepEqual(
        future.previousAttempts[1].promptSnapshot,
        migrated.promptSnapshot,
      );
      assert.equal(
        future.previousAttempts[1].attempt.previousAttempts,
        undefined,
      );
      const unknown = engine.normaliseSaved({
        ...old,
        contentRevision: "unknown-old-revision",
      });
      assert.deepEqual(unknown.previousAttempts[0].promptSnapshot, []);
      assert.match(
        engine.recoveredAttemptText(unknown.previousAttempts[0]),
        /Original question: Unavailable/,
      );
    },
  );
  await check(
    "current completed attempt remains locked and completion still checks source requirements",
    () => {
      const complete = engine.normaliseSaved({
        version: 3,
        rallyeId: actual.id,
        contentRevision: "migration-test-current",
      });
      complete.student.name = "Current Learner";
      complete.startedAt = stamp;
      complete.submittedAt = stamp;
      for (const stage of stages) {
        const task = stage.investigation || stage.question || stage;
        complete.answers[stage.id] = Array(task.minWords)
          .fill("evidence")
          .join(" ");
        complete.notebooks[stage.id] = {
          note: "",
          citations: Array.from(
            { length: task.minSources || stage.minSources || 0 },
            (_, i) => ({
              title: `Source ${i}`,
              url: `https://example.org/${i}`,
            }),
          ),
        };
      }
      assert.deepEqual(engine.validateRallye(complete), []);
      assert.equal(engine.normaliseSaved(complete).submittedAt, stamp);
      const requiringSources = stages.find(
        (stage) =>
          (stage.investigation || stage.question || stage).minSources > 0,
      );
      assert.ok(requiringSources, "at least one source requirement survives");
      complete.notebooks[requiringSources.id].citations = [];
      assert.ok(
        engine
          .validateRallye(complete)
          .some((error) => error.id === requiringSources.id),
      );
    },
  );
  let child, browser;
  try {
    child = await server();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`${BASE}/app/journey/js/rallye.js`);
    await page.evaluate(
      async ({ engineURL, old }) => {
        window.testEngine = await import(engineURL);
        localStorage.clear();
        localStorage.setItem(
          window.testEngine.RALLYE_STORAGE_KEY,
          JSON.stringify(old),
        );
        document.body.innerHTML = '<main id="test-host"></main>';
        window.testRallye = window.testEngine.createRallye(
          document.querySelector("main"),
        );
      },
      { engineURL: moduleURL(fixtureEngine), old },
    );
    await check(
      "browser migration persists the archive before fresh work and makes recovery downloadable",
      async () => {
        const saved = await page.evaluate(() =>
          JSON.parse(
            localStorage.getItem(window.testEngine.RALLYE_STORAGE_KEY),
          ),
        );
        assert.equal(saved.previousAttempts.length, 1);
        assert.deepEqual(saved.answers, {});
        assert.equal(saved.previousAttempts[0].attempt.submittedAt, stamp);
        await page.locator(".ry-recovered-work > summary").click();
        assert.ok(
          await page
            .locator(".ry-recovered-work")
            .innerText()
            .then((t) => t.includes("Earlier saved work")),
        );
        const downloadEvent = page.waitForEvent("download");
        await page
          .locator(
            '[data-ry-download-archive="0"][data-ry-archive-format="txt"]',
          )
          .click();
        const download = await downloadEvent;
        const text = await fs.readFile(await download.path(), "utf8");
        assert.ok(text.includes(LEGACY_PROMPT_SNAPSHOT[0].prompt));
        assert.ok(text.includes(old.answers[stages[0].id]));
        assert.match(text, /earlier questions/);
        await page.locator(".ry-recovered-work > summary").click();
      },
    );
    await check(
      "operator and exact prompt precede source reading; support is optional and does not fill answers",
      async () => {
        await page.locator("#ry-name").fill("Current Learner");
        await page.locator('[data-ry-start] button[type="submit"]').click();
        assert.equal(
          await page.locator(".ry-task-focus strong").textContent(),
          "Explain",
        );
        assert.equal(
          await page.locator(".ry-task-preview").textContent(),
          (stages[0].investigation || stages[0].question || stages[0]).prompt,
        );
        assert.ok(
          await page.evaluate(
            () =>
              !!(
                document
                  .querySelector(".ry-task-focus")
                  .compareDocumentPosition(
                    document.querySelector(".ry-sources"),
                  ) & Node.DOCUMENT_POSITION_FOLLOWING
              ),
          ),
        );
        assert.equal(
          await page.locator(".ry-language-support").evaluate((el) => el.open),
          false,
        );
        await page.locator(".ry-language-support > summary").click();
        assert.match(
          await page.locator(".ry-language-terms").innerText(),
          /revenue.*income collected/s,
        );
        assert.equal(await page.locator("#ry-answer").inputValue(), "");
        await page
          .locator("#ry-answer")
          .fill("A fresh answer for this content revision.");
        const saved = await page.evaluate(() =>
          JSON.parse(
            localStorage.getItem(window.testEngine.RALLYE_STORAGE_KEY),
          ),
        );
        assert.equal(
          saved.answers[stages[0].id],
          "A fresh answer for this content revision.",
        );
        assert.equal(
          saved.previousAttempts[0].attempt.answers[stages[0].id],
          old.answers[stages[0].id],
        );
      },
    );
    await check(
      "current JSON/text/HTML portfolios keep revision provenance and earlier work separate",
      async () => {
        for (const format of ["json", "txt", "html"]) {
          const details = page.locator(".ry-sidebar .ry-downloads");
          await details.evaluate((el) => {
            el.open = true;
          });
          const downloadEvent = page.waitForEvent("download");
          await details.locator(`[data-ry-download="${format}"]`).click();
          const download = await downloadEvent;
          const result = await fs.readFile(await download.path(), "utf8");
          assert.ok(
            result.includes("migration-test-current"),
            `${format} has current revision`,
          );
          assert.ok(
            result.includes(old.answers[stages[0].id]),
            `${format} preserves old answer`,
          );
          assert.ok(
            result.includes("A fresh answer for this content revision."),
            `${format} has new answer`,
          );
          if (format === "html") {
            assert.ok(
              result.includes("Original student: Earlier Learner"),
              "earlier author retained after name change",
            );
            assert.ok(
              result.includes("Current Learner"),
              "current author also present",
            );
            assert.ok(
              result.includes('class="ry-recovered-stage" open'),
              "earlier work expanded for print",
            );
          }
          if (format === "json") {
            const report = JSON.parse(result);
            assert.equal(report.previousAttempts.length, 1);
            assert.equal(report.grades, null);
          }
        }
      },
    );
    await check("starting again retains earlier revisions", async () => {
      await page.locator('[data-ry-action="reset-dialog"]').click();
      await page.locator('[data-ry-action="confirm-reset"]').click();
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem(window.testEngine.RALLYE_STORAGE_KEY)),
      );
      assert.deepEqual(saved.answers, {});
      assert.equal(saved.previousAttempts.length, 1);
    });
    await check(
      "quota failure retains the original stored attempt and in-memory recovery",
      async () => {
        await page.evaluate(
          ({ old }) => {
            window.testRallye.destroy();
            localStorage.setItem(
              window.testEngine.RALLYE_STORAGE_KEY,
              JSON.stringify(old),
            );
            window.realSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = () => {
              throw new DOMException("Quota", "QuotaExceededError");
            };
            window.testRallye = window.testEngine.createRallye(
              document.querySelector("main"),
            );
          },
          { old },
        );
        const stored = await page.evaluate(() =>
          JSON.parse(
            localStorage.getItem(window.testEngine.RALLYE_STORAGE_KEY),
          ),
        );
        assert.deepEqual(stored, old);
        assert.match(
          await page.locator("[data-ry-save]").innerText(),
          /unavailable/,
        );
        await page.locator(".ry-recovered-work > summary").click();
        const downloadEvent = page.waitForEvent("download");
        await page
          .locator(
            '[data-ry-download-archive="0"][data-ry-archive-format="json"]',
          )
          .click();
        const download = await downloadEvent;
        const recovery = JSON.parse(
          await fs.readFile(await download.path(), "utf8"),
        );
        assert.deepEqual(recovery.attempt, old);
        await page.evaluate(() => {
          Storage.prototype.setItem = window.realSetItem;
        });
      },
    );
    assert.deepEqual(pageErrors, []);
    await context.close();
  } finally {
    if (browser) await browser.close();
    if (child) child.kill();
  }
  console.log(`\n${passes} unit alignment checks passed.`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
