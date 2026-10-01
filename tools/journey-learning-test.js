#!/usr/bin/env node
"use strict";

// Real current UI acceptance, on a private ephemeral port and fresh profile.
// No student storage is read and no existing server is touched.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require("playwright");
const {
  ROOT,
  noAssessment,
  startServer,
  ready,
  download,
} = require("./qa/learning-harness.js");
const ARTIFACTS = process.env.QA_ARTIFACT_DIR || "/tmp/empire-learning-qa";
const failures = [];
let passes = 0;
async function check(name, run) {
  try {
    await run();
    passes++;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push({ name, error: error.stack || error.message });
    console.error(`FAIL ${name}: ${error.stack || error}`);
  }
}
async function currentState(page) {
  return page.evaluate(async () => {
    const { RALLYE_STORAGE_KEY } = await import("./js/rallye-state.js");
    return JSON.parse(localStorage.getItem(RALLYE_STORAGE_KEY));
  });
}
async function openStage(page, id) {
  await page.locator(`[data-ry-stage="${id}"]`).first().click();
  await page.locator(`#ry-answer[data-ry-written="${id}"]`).waitFor();
}
async function expand(page, selector) {
  const details = page.locator(selector).first();
  if (!(await details.evaluate((node) => node.open)))
    await details.locator(":scope > summary").click();
}
async function start(page, name = "Learning QA <history>") {
  await page.locator("#ry-name").fill(name);
  await page.locator("[data-ry-start] button[type=submit]").click();
  await page.locator("#ry-answer").waitFor();
}
async function preserveSnapshot() {
  const directory = path.join(
    ROOT,
    "snapshots/2026-10-01-before-simplification",
  );
  const manifest = JSON.parse(
    await fs.readFile(path.join(directory, "manifest.json"), "utf8"),
  );
  for (const [file, hash] of Object.entries(manifest.files)) {
    assert.equal(
      crypto
        .createHash("sha256")
        .update(await fs.readFile(path.join(directory, file)))
        .digest("hex"),
      hash,
      file,
    );
  }
}
(async () => {
  await fs.mkdir(ARTIFACTS, { recursive: true });
  await check(
    "frozen pre-simplification snapshot is byte-for-byte intact",
    preserveSnapshot,
  );
  const { server, origin } = await startServer();
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
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().startsWith(origin))
        errors.push(`${response.status()} ${response.url()}`);
    });
    await ready(page, `${origin}/app/journey/#rallye`);
    const content = await page.evaluate(
      async () => (await import("./js/rallye-content.js")).rallye,
    );
    const stages = [...content.stations, content.finalAssessment];
    await check(
      "welcome explains editable learning work without assessment or length guidance",
      async () => {
        noAssessment(await page.locator("#rallye-view").innerText());
        assert.match(
          await page.locator("#rallye-view").innerText(),
          /edit|revisit|return|revise/i,
        );
        assert.equal(await page.locator("#ry-answer").count(), 0);
      },
    );
    await start(page);
    await check(
      "all seven tasks expose context, essential evidence, one editable response and optional help",
      async () => {
        for (const [index, stage] of stages.entries()) {
          await openStage(page, stage.id);
          const text = await page.locator("#rallye-view").innerText();
          noAssessment(text);
          assert.ok(
            text.includes(stage.investigation.prompt),
            `${stage.id} exact current task appears`,
          );
          assert.ok(await page.locator("#ry-answer").isEditable());
          assert.equal(
            await page.locator("#ry-answer").getAttribute("maxlength"),
            null,
          );
          assert.equal(
            await page.locator("#ry-answer").getAttribute("minlength"),
            null,
          );
          assert.equal(
            await page
              .locator(
                "[data-ry-word-count],.ry-rubric,.ry-assessment-criteria",
              )
              .count(),
            0,
          );
          assert.equal(
            await page.locator("textarea[data-ry-written]").count(),
            1,
          );
          const currentContext = stage.contextParagraphs || stage.context;
          const contextText = Array.isArray(currentContext)
            ? currentContext
            : [currentContext];
          assert.ok(
            contextText.every((paragraph) => text.includes(paragraph)),
            `${stage.id} historical introduction visible`,
          );
          await page.screenshot({
            path: path.join(ARTIFACTS, `task-${index + 1}.png`),
            fullPage: true,
          });
        }
      },
    );
    const concise = "Tax income funded troops and strengthened Company rule.";
    const long =
      "The source identifies resistance and shows why a single official account cannot establish everyone's experience. ".repeat(
        200,
      );
    await check(
      "empty, concise and long writing remain voluntary learning work without hidden gates",
      async () => {
        await openStage(page, stages[0].id);
        await page.locator("#ry-answer").fill("");
        await page.locator('[data-ry-action="next"]').click();
        await page
          .locator(`#ry-answer[data-ry-written="${stages[1].id}"]`)
          .waitFor();
        await openStage(page, stages[0].id);
        await page.locator("#ry-answer").fill(concise);
        await page.locator('[data-ry-action="next"]').click();
        await page.locator("#ry-answer").fill(long);
        assert.equal(await page.locator("#ry-answer").inputValue(), long);
        await page.locator('[data-ry-action="next"]').click();
        const state = await currentState(page);
        assert.equal(state.answers[stages[0].id], concise);
        assert.equal(state.answers[stages[1].id], long);
        assert.equal(
          Object.values(state.completedStages || {}).filter(Boolean).length,
          0,
          "Typing alone must not judge task completion",
        );
      },
    );
    await check(
      "optional research remains available without manual citation requirements",
      async () => {
        await openStage(page, stages[0].id);
        const links = page.locator(".ry-source a[href^=http]");
        assert.ok(await links.count(), "Attribution links remain available");
        assert.equal(
          await page
            .locator("#ry-source-title,#ry-source-url,#ry-reuse-source")
            .count(),
          0,
          "No citation administration is demanded",
        );
        const disclosures = await page
          .locator("#rallye-view details")
          .evaluateAll((nodes) =>
            nodes.map((node) => ({
              text: node.querySelector("summary")?.textContent,
              open: node.open,
            })),
          );
        assert.ok(
          disclosures.some((item) =>
            /help|language|research|source|notes|map/i.test(item.text),
          ),
          "Extra support is discoverable",
        );
        assert.ok(
          disclosures
            .filter((item) =>
              /help|language|research|source|notes/i.test(item.text),
            )
            .some((item) => !item.open),
          "Optional support begins collapsed",
        );
        await expand(page, ".ry-notebook");
        await page
          .locator("#ry-notes")
          .fill(
            "I chose the Company source: https://www.bl.uk/collection-items/charter-granted-to-the-east-india-company",
          );
        const task = stages[0].investigation;
        await page.locator('[data-ry-action="review"]').click();
        await page.locator('[data-ry-action="complete"]').click();
        assert.ok(
          (await currentState(page)).finishedAt,
          "A learner can save a review with no citations and unfinished writing",
        );
        noAssessment(await page.locator("#rallye-view").innerText());
        assert.ok(task.prompt);
      },
    );
    await check(
      "a saved review stays editable and retains changes through map, story and reload",
      async () => {
        await openStage(page, stages[0].id);
        const edited = `${concise} The 1765 revenue rights helped finance administration.`;
        await page.locator("#ry-answer").fill(edited);
        await expand(page, ".ry-research");
        await page.locator('[data-ry-action="explore"]').first().click();
        await page.locator("#explore-view").waitFor({ state: "visible" });
        assert.equal(
          await page.locator("#hero-year").textContent(),
          String(stages[0].mapFocus.year),
        );
        await page
          .locator('a[href="#rallye"]')
          .filter({ visible: true })
          .last()
          .click();
        await page.locator("#ry-answer").waitFor();
        assert.equal(await page.locator("#ry-answer").inputValue(), edited);
        await expand(page, ".ry-research");
        await page.locator('[data-ry-action="territory"]').first().click();
        await page.locator("#territory-view").waitFor({ state: "visible" });
        await page.locator("[data-focus-rallye]").click();
        await page.locator("#ry-answer").waitFor();
        assert.equal(await page.locator("#ry-answer").inputValue(), edited);
        await page.reload();
        await page.locator("html[data-ready=true]").waitFor();
        await openStage(page, stages[0].id);
        assert.equal(await page.locator("#ry-answer").inputValue(), edited);
        for (const [index, stage] of stages.entries()) {
          await openStage(page, stage.id);
          if (index > 1)
            await page
              .locator("#ry-answer")
              .fill(`My evidence-based response for ${stage.title}.`);
          await page.locator("[data-ry-done]").check();
        }
        const state = await currentState(page);
        assert.equal(
          Object.values(state.completedStages).filter(Boolean).length,
          7,
        );
        assert.ok(state.finishedAt);
      },
    );
    await check(
      "JSON, text and printable HTML export all current work and provenance without assessment metadata",
      async () => {
        const rawJSON = await download(page, '[data-ry-download="json"]');
        const report = JSON.parse(rawJSON);
        noAssessment(report);
        assert.ok(rawJSON.includes(content.contentRevision));
        assert.equal(report.stages.length, 7);
        assert.equal(report.stages[1].response, long);
        assert.match(report.stages[0].notes, /I chose the Company source/);
        assert.ok(
          report.stages[0].providedSources.every(
            (source) => source.title && source.url,
          ),
        );
        assert.match(report.note, /does not claim.*learner used every source/i);
        assert.ok(
          !report.previousAttempts?.length,
          "Archives are separate recovery downloads",
        );
        for (const format of ["txt", "html"]) {
          const result = await download(page, `[data-ry-download="${format}"]`);
          noAssessment(result, `${format} portfolio`);
          for (const stage of stages)
            assert.ok(
              result.includes(stage.title),
              `${format} includes ${stage.id}`,
            );
          assert.ok(
            result.includes(
              format === "html" ? long.replaceAll("'", "&#39;") : long,
            ),
            `${format} retains long text`,
          );
          assert.ok(result.includes(content.contentRevision));
          if (format === "html")
            assert.ok(result.includes("Learning QA &lt;history&gt;"));
          await fs.writeFile(
            path.join(ARTIFACTS, `current-portfolio.${format}`),
            result,
          );
        }
        await fs.writeFile(
          path.join(ARTIFACTS, "current-portfolio.json"),
          rawJSON,
        );
      },
    );
    await check(
      "teacher UI and downloads contain current prompts and no contradictory assessment guidance",
      async () => {
        await page.evaluate(() => {
          location.hash = "teacher";
        });
        await page.locator("#teacher-view").waitFor({ state: "visible" });
        noAssessment(
          await page.locator("#teacher-view").innerText(),
          "teacher UI",
        );
        const guide = await page.evaluate(async () => {
          const { teacherGuide } = await import("./js/teacher-content.js");
          const { renderTeacherDocument, teacherGuideText } =
            await import("./js/teacher.js");
          return {
            html: renderTeacherDocument(teacherGuide),
            text: teacherGuideText(teacherGuide),
          };
        });
        noAssessment(guide.text, "teacher text");
        noAssessment(guide.html, "teacher HTML");
        for (const stage of stages)
          assert.ok(
            guide.text.includes(stage.investigation.prompt),
            `${stage.id}: exact teacher/student task parity`,
          );
        await fs.writeFile(
          path.join(ARTIFACTS, "teacher-current.html"),
          guide.html,
        );
      },
    );
    await check(
      "current workspaces fit narrow phone, tablet and desktop",
      async () => {
        await page.evaluate(() => {
          location.hash = "rallye";
        });
        for (const width of [320, 390, 768, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await openStage(page, stages[0].id);
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            `${width}px horizontal fit`,
          );
          await page.screenshot({
            path: path.join(ARTIFACTS, `learning-${width}.png`),
            fullPage: true,
          });
        }
      },
    );
    await check(
      "current learning flow produces no browser errors or failed local assets",
      () => assert.deepEqual(errors, []),
    );
    await context.close();

    const recoveryContext = await browser.newContext({
      acceptDownloads: true,
      reducedMotion: "reduce",
    });
    const recoveryPage = await recoveryContext.newPage();
    recoveryPage.setDefaultTimeout(12000);
    await recoveryPage.goto(`${origin}/app/journey/js/rallye-state.js`);
    const oldContentSource = await fs.readFile(
      path.join(
        ROOT,
        "snapshots/2026-10-01-before-simplification/app/journey/js/rallye-content.js",
      ),
      "utf8",
    );
    const oldContent = (
      await import(
        `data:text/javascript;base64,${Buffer.from(oldContentSource).toString("base64")}`
      )
    ).rallye;
    const old = {
      version: 3,
      rallyeId: oldContent.id,
      contentRevision: oldContent.contentRevision,
      student: { name: "Earlier learner", className: "Q2" },
      answers: {
        [stages[0].id]:
          "Exact earlier answer, including its own question context.",
        "unknown-old-stage": "Keep this unknown stage too.",
      },
      notebooks: {
        [stages[0].id]: {
          note: "Earlier note",
          citations: [
            { title: "Earlier evidence", url: "https://example.org/source" },
          ],
        },
      },
      checkpoints: {},
      startedAt: "2026-09-28T08:00:00.000Z",
      submittedAt: "2026-09-28T08:40:00.000Z",
      updatedAt: "2026-09-28T08:40:00.000Z",
      currentIndex: 2,
    };
    const legacyRaw = JSON.stringify(old);
    await recoveryPage.evaluate(
      (raw) => localStorage.setItem("empire-echoes-rallye-v3", raw),
      legacyRaw,
    );
    await ready(recoveryPage, `${origin}/app/journey/#rallye`);
    await check(
      "old v3 work is kept byte-for-byte in its original key and never attached to rewritten questions",
      async () => {
        assert.equal(
          await recoveryPage.evaluate(() =>
            localStorage.getItem("empire-echoes-rallye-v3"),
          ),
          legacyRaw,
        );
        const initialReport = JSON.parse(
          await download(recoveryPage, '[data-ry-download="json"]'),
        );
        assert.ok(
          initialReport.stages.every(
            (stage) => !stage.response && !stage.notes,
          ),
        );
        await start(recoveryPage, "New learner");
        const state = await currentState(recoveryPage);
        assert.deepEqual(state.answers, {});
        assert.ok(Object.values(state.notebooks).every((book) => !book.note));
        assert.ok(state.previousAttempts.length);
        assert.deepEqual(state.previousAttempts[0].attempt, old);
        await recoveryPage
          .locator("#ry-answer")
          .fill("A new response belongs to the rewritten task.");
        await recoveryPage.reload();
        await recoveryPage.locator("html[data-ready=true]").waitFor();
        assert.equal(
          await recoveryPage.evaluate(() =>
            localStorage.getItem("empire-echoes-rallye-v3"),
          ),
          legacyRaw,
        );
        assert.equal(
          (await currentState(recoveryPage)).previousAttempts.length,
          1,
        );
      },
    );
    await check(
      "earlier work is a separate recovery download with original prompts, answers and metadata",
      async () => {
        const recovered = JSON.parse(
          await download(
            recoveryPage,
            '[data-ry-download-archive="0"][data-ry-archive-format="json"]',
          ),
        );
        assert.deepEqual(recovered.attempt, old);
        const text = await download(
          recoveryPage,
          '[data-ry-download-archive="0"][data-ry-archive-format="txt"]',
        );
        assert.ok(text.includes(oldContent.stations[0].investigation.prompt));
        assert.ok(text.includes(old.answers[stages[0].id]));
        assert.ok(text.includes(old.answers["unknown-old-stage"]));
        const current = await download(
          recoveryPage,
          '[data-ry-download="json"]',
        );
        noAssessment(JSON.parse(current));
        assert.ok(!current.includes(old.answers[stages[0].id]));
        assert.ok(
          !current.includes(oldContent.stations[0].investigation.prompt),
        );
        assert.ok(
          current.includes("A new response belongs to the rewritten task."),
        );
        await fs.writeFile(
          path.join(ARTIFACTS, "separate-recovery.json"),
          JSON.stringify(recovered, null, 2),
        );
      },
    );
    await check(
      "a fresh notebook preserves both current writing and untouched legacy storage",
      async () => {
        await expand(recoveryPage, ".ry-new-notebook");
        await recoveryPage.locator('[data-ry-action="reset-dialog"]').click();
        await recoveryPage.locator('[data-ry-action="confirm-reset"]').click();
        const state = await currentState(recoveryPage);
        assert.deepEqual(state.answers, {});
        assert.ok(
          state.previousAttempts.some(
            (entry) =>
              entry.attempt.answers?.[stages[0].id] ===
              "A new response belongs to the rewritten task.",
          ),
        );
        assert.equal(
          await recoveryPage.evaluate(() =>
            localStorage.getItem("empire-echoes-rallye-v3"),
          ),
          legacyRaw,
        );
      },
    );
    await check(
      "autosave failure retains original v3 storage and offers the in-memory recovery download",
      async () => {
        await recoveryPage.evaluate(async () => {
          const { RALLYE_STORAGE_KEY } = await import("./js/rallye-state.js");
          localStorage.removeItem(RALLYE_STORAGE_KEY);
        });
        await recoveryPage.addInitScript(() => {
          Storage.prototype.setItem = () => {
            throw new DOMException("Quota", "QuotaExceededError");
          };
        });
        await recoveryPage.reload();
        await recoveryPage.locator("html[data-ready=true]").waitFor();
        await start(recoveryPage, "Unsaved learner");
        await recoveryPage
          .locator("#ry-answer")
          .fill("My in-memory writing needs a backup.");
        assert.match(
          await recoveryPage.locator("[data-ry-save]").first().innerText(),
          /unavailable/i,
        );
        assert.equal(
          await recoveryPage.evaluate(() =>
            localStorage.getItem("empire-echoes-rallye-v3"),
          ),
          legacyRaw,
        );
        const recovered = JSON.parse(
          await download(
            recoveryPage,
            '[data-ry-download-archive="0"][data-ry-archive-format="json"]',
          ),
        );
        assert.deepEqual(recovered.attempt, old);
        const current = await download(
          recoveryPage,
          '[data-ry-download="txt"]',
        );
        assert.ok(current.includes("My in-memory writing needs a backup."));
      },
    );
    await recoveryContext.close();
    await check(
      "the frozen snapshot remains intact after full learning and migration flows",
      preserveSnapshot,
    );
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
    await fs.writeFile(
      path.join(ARTIFACTS, "results.json"),
      JSON.stringify({ passes, failures }, null, 2),
    );
  }
  console.log(
    `\n${passes} passed; ${failures.length} failed. Evidence: ${ARTIFACTS}`,
  );
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
