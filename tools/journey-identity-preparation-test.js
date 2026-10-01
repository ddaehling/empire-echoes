#!/usr/bin/env node
"use strict";

// Student-facing preparation and retrieval: no live source website is needed.
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { startServer, ready } = require("./qa/learning-harness.js");

(async () => {
  const { server, origin } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ["--enable-unsafe-swiftshader"] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    page.setDefaultTimeout(12000);
    const errors = [];
    const externalRequests = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", (route) => {
      if (route.request().url().startsWith(origin)) return route.continue();
      externalRequests.push(route.request().url());
      return route.abort();
    });
    await ready(page, `${origin}/app/journey/#rallye`);
    const { content, resources } = await page.evaluate(async () => ({
      content: (await import("./js/rallye-content.js")).rallye,
      resources: (await import("./js/rallye-resources.js")).RALLYE_RESOURCE_BY_ID,
    }));
    await page.locator("[data-ry-start] button[type=submit]").click();
    const response = (id) => `My historical-to-contemporary argument for ${id}.\n<evidence> remains text.`;
    const note = (id) => `My dated evidence and scope note for ${id}.\n<private> remains text.`;
    const openStage = async (id) => {
      await page.locator(`[data-ry-stage="${id}"]`).first().click();
      await page.locator(`#ry-answer[data-ry-written="${id}"]`).waitFor();
    };
    for (const stage of content.stations) {
      await openStage(stage.id);
      const evidence = page.locator(".ry-evidence");
      assert.ok(await evidence.getByRole("heading", { name: "Historical evidence", exact: true }).isVisible());
      assert.ok(await evidence.getByRole("heading", { name: "A connection today", exact: true }).isVisible());
      for (const id of stage.presentDaySourceIds) {
        const source = resources[id];
        const card = evidence.locator(".ry-source").filter({ has: page.getByRole("heading", { name: source.title, exact: true }) });
        assert.ok(await card.locator(".ry-source-summary").isVisible(), `${id} summary is not hidden behind a link or disclosure`);
        assert.equal(await card.locator(".ry-source-summary").innerText(), source.summary);
        assert.ok((await card.locator(".ry-source-meta").innerText()).includes(source.date));
        assert.ok((await card.innerText()).includes(source.scope), `${id} limitation is visible`);
      }
      await page.locator("#ry-answer").fill(response(stage.id));
      await page.locator(".ry-notebook > summary").click();
      await page.locator("#ry-notes").fill(note(stage.id));
    }
    console.log("PASS all six cases expose their dated contemporary evidence and scope without external websites");

    const final = content.finalAssessment;
    await openStage(final.id);
    const ons = resources["final-identities"];
    const onsCard = page.locator(".ry-evidence .ry-source").filter({ has: page.getByRole("heading", { name: ons.title, exact: true }) });
    assert.ok(await onsCard.locator(".ry-source-summary").isVisible(), "ONS is core visible evidence");
    assert.equal(await onsCard.locator(".ry-source-summary").innerText(), ons.summary);
    assert.ok(await page.getByRole("heading", { name: "Build your comparison", exact: true }).isVisible());
    assert.equal(await page.locator(".ry-comparison-case").count(), content.stations.length);
    assert.equal(await page.locator(".ry-comparison-case[open]").count(), 0, "Cases start individually collapsed");
    for (const stage of content.stations) {
      const entry = page.locator(`[data-ry-case="${stage.id}"]`);
      await entry.locator(":scope > summary").focus();
      await page.keyboard.press("Enter");
      assert.ok(await entry.evaluate((node) => node.open), `${stage.id} opens using the keyboard`);
      const text = await entry.innerText();
      assert.ok(text.includes(response(stage.id)), `${stage.id} retrieves the full saved response`);
      assert.ok(text.includes(note(stage.id)), `${stage.id} retrieves the full saved notes`);
      assert.equal(await entry.locator("evidence,private").count(), 0, "Saved markup is escaped");
      assert.equal(await entry.locator(".ry-source").count(), stage.essentialSourceIds.length);
      for (const id of stage.essentialSourceIds) {
        const source = resources[id];
        const card = entry.locator(".ry-source").filter({ has: page.getByRole("heading", { name: source.title, exact: true }) });
        assert.equal(await card.count(), 1, `${stage.id} retrieves ${id}`);
        // Long original extracts keep their optional paraphrase collapsed.
        if (source.excerpt) assert.ok(await card.locator("blockquote").isVisible());
        else assert.equal(await card.locator(".ry-source-summary").innerText(), source.summary);
      }
      await entry.locator(":scope > summary").focus();
      await page.keyboard.press("Space");
      assert.equal(await entry.evaluate((node) => node.open), false);
    }
    console.log("PASS final task shows ONS and six keyboard-accessible cases with complete saved responses, notes, and historical/modern evidence");

    const draft = "My developing final comparison, preserved while I revisit evidence.";
    await page.locator("#ry-answer").fill(draft);
    const first = content.stations[0];
    const entry = page.locator(`[data-ry-case="${first.id}"]`);
    await entry.locator(":scope > summary").click();
    await entry.locator("[data-ry-stage]").click();
    assert.equal(await page.locator("#ry-answer").inputValue(), response(first.id));
    const revised = `${response(first.id)}\nA further qualification.`;
    await page.locator("#ry-answer").fill(revised);
    await openStage(final.id);
    assert.equal(await page.locator("#ry-answer").inputValue(), draft);
    await page.reload();
    await page.locator("html[data-ready=true]").waitFor();
    await page.locator(`#ry-answer[data-ry-written="${final.id}"]`).waitFor();
    assert.equal(await page.locator("#ry-answer").inputValue(), draft);
    await page.locator(`[data-ry-case="${first.id}"] > summary`).click();
    assert.ok((await page.locator(`[data-ry-case="${first.id}"]`).innerText()).includes(revised));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const stage of content.stations) {
        await page.locator(`[data-ry-case="${stage.id}"]`).evaluate((node) => { node.open = true; });
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `all expanded cases fit at ${width}px`);
      for (const stage of content.stations) {
        await page.locator(`[data-ry-case="${stage.id}"]`).evaluate((node) => { node.open = false; });
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `collapsed cases fit at ${width}px`);
    }
    assert.deepEqual(externalRequests, [], "No external website request is needed for the preparation or comparison flow");
    assert.deepEqual(errors, []);
    console.log("PASS final draft and revisions survive revisit/reload; all comparison cases fit phone/tablet/desktop; no external requests or browser errors");
  } finally {
    await browser?.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
