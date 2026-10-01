#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { startServer, ready, download } = require("./qa/learning-harness.js");

// A saved live v4 notebook from before the analysis-focused revision.
// The original wording is deliberately independent of the current content.
const oldPrompt = {
  id: "departure-and-division",
  title: "Independence is more than a border",
  prompt:
    "Describe the political change in 1947: name the two new independent countries and say whose rule ended. Then use one detail from the source to show how people’s homes or concerns about their future were affected in the period around partition.",
  instructions: [
    "Keep the timing of your example clear. The letter was written in 1946, and the family testimony recalls displacement before partition.",
  ],
  operator: "Outline",
  responsePurpose: "Your account of the change",
};
const old = {
  version: 4,
  rallyeId: "empire-echoes-rallye-v1",
  contentRevision: "ungraded-2026-10-01",
  promptSnapshot: [oldPrompt],
  previousAttempts: [],
  student: { name: "Returning learner", className: "Q2" },
  answers: {
    [oldPrompt.id]:
      "India and Pakistan became independent when British rule ended. The letter shows uncertainty about the future.",
  },
  notebooks: {
    [oldPrompt.id]: { note: "My note about the 1946 letter.", citations: [] },
  },
  completedStages: { [oldPrompt.id]: true },
  startedAt: "2026-10-01T12:00:00.000Z",
  finishedAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
  currentIndex: 3,
};

(async () => {
  const { server, origin } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--enable-unsafe-swiftshader"],
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/app/journey/js/rallye-state.js`);
    await page.evaluate((saved) => {
      localStorage.setItem("empire-echoes-enquiry-v4", JSON.stringify(saved));
    }, old);
    await ready(page, `${origin}/app/journey/#rallye`);

    assert.match(
      await page.locator(".ry-notice").innerText(),
      /earlier work is preserved with its original questions/i,
    );
    assert.equal(await page.locator(".ry-recovered-work").isVisible(), true);
    const originalData = JSON.parse(
      await download(
        page,
        '[data-ry-download-archive="0"][data-ry-archive-format="json"]',
      ),
    );
    assert.deepEqual(originalData.attempt, old);
    assert.deepEqual(originalData.promptSnapshot, old.promptSnapshot);
    const readable = await download(
      page,
      '[data-ry-download-archive="0"][data-ry-archive-format="txt"]',
    );
    for (const text of [
      oldPrompt.prompt,
      ...oldPrompt.instructions,
      old.answers[oldPrompt.id],
      old.notebooks[oldPrompt.id].note,
    ]) assert.ok(readable.includes(text));
    console.log("PASS prior v4 work is explained, discoverable, and downloadable with its exact original question");

    await page.locator("[data-ry-start] button[type=submit]").click();
    await page.locator(`[data-ry-stage="${oldPrompt.id}"]`).first().click();
    await page.locator(`#ry-answer[data-ry-written="${oldPrompt.id}"]`).waitFor();
    assert.equal(await page.locator("#ry-answer").inputValue(), "");
    const newAnswer = "My new analysis belongs to the revised assignment.";
    await page.locator("#ry-answer").fill(newAnswer);
    await page.locator('[data-ry-action="next"]').click();
    await page.reload();
    await page.locator("html[data-ready=true]").waitFor();
    const resumed = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("empire-echoes-enquiry-v4")),
    );
    assert.notEqual(resumed.contentRevision, old.contentRevision);
    assert.equal(resumed.previousAttempts.length, 1);
    assert.deepEqual(resumed.previousAttempts[0].attempt, old);
    assert.equal(resumed.answers[oldPrompt.id], newAnswer);
    assert.equal(resumed.completedStages[oldPrompt.id], undefined);
    const currentPrompt = resumed.promptSnapshot.find((item) => item.id === oldPrompt.id);
    assert.notEqual(currentPrompt.prompt, oldPrompt.prompt);
    assert.ok(!readable.includes(currentPrompt.prompt));
    assert.deepEqual(errors, []);
    console.log("PASS revised writing reloads separately without duplicate archives, old completion, or browser errors");
    await context.close();
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
