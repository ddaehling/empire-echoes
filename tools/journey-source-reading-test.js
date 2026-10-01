#!/usr/bin/env node
"use strict";

// The assignments must work with external websites blocked, including exports.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { chromium } = require("playwright");
const { startServer, ready, download } = require("./qa/learning-harness.js");

(async () => {
  const { server, origin } = await startServer();
  const externalRequests = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ reducedMotion: "reduce", acceptDownloads: true });
    await page.route("**/*", (route) => {
      if (route.request().url().startsWith(origin)) return route.continue();
      externalRequests.push(route.request().url());
      return route.abort();
    });
    await ready(page, `${origin}/app/journey/#rallye`);
    await page.locator("[data-ry-start] button[type=submit]").click();
    const readings = [
      ["freedom-and-memory", "freedom-rebellion", "All who hold out, will meet with certain death."],
      ["rule-and-resistance", "rule-proclamation", "We hold Ourselves bound to the Natives"],
      ["migration-and-belonging", "migration-windrush", "Health Visitor"],
    ];
    for (const [stage, id, anchor] of readings) {
      await page.locator(`[data-ry-stage="${stage}"]`).first().click();
      await page.locator(`#ry-answer[data-ry-written="${stage}"]`).waitFor();
      const source = await page.evaluate(async (id) =>
        (await import("./js/rallye-resources.js")).RALLYE_RESOURCE_BY_ID[id], id);
      const card = page.locator(".ry-evidence .ry-source").filter({
        has: page.getByRole("heading", { name: source.title, exact: true }),
      });
      assert.ok((await card.locator("blockquote").innerText()).includes(anchor));
      assert.equal(await card.locator("blockquote").isVisible(), true);
      assert.deepEqual(await card.locator("blockquote p").evaluateAll(nodes => nodes.map(node => node.innerText)), source.excerpt.split(/\n\s*\n/));
      assert.ok((await card.innerText()).includes(source.excerptNote));
      const original = card.locator(`a[href="${source.url}"]`);
      assert.match(await original.textContent(), /PDF/);
      await page.locator("#ry-answer").fill(`My reading of ${id}.`);
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        if (width === 320 || width === 1440) {
          await fs.mkdir("/tmp/empire-source-reading", { recursive: true });
          await card.screenshot({ path: `/tmp/empire-source-reading/${id}-${width}.png` });
        }
      }
      if (id === "rule-proclamation") {
        const paraphrase = card.locator("details").filter({ has: page.locator("summary", { hasText: "In our words" }) });
        assert.equal(await paraphrase.getAttribute("open"), null);
        await paraphrase.locator("summary").focus();
        await page.keyboard.press("Enter");
        assert.ok((await paraphrase.innerText()).includes(source.summary));
        await page.reload();
        await page.locator(`#ry-answer[data-ry-written="${stage}"]`).waitFor();
        assert.equal(await page.locator("#ry-answer").inputValue(), `My reading of ${id}.`);
      }
    }
    const json = JSON.parse(await download(page, '[data-ry-download="json"]'));
    const text = await download(page, '[data-ry-download="txt"]');
    const html = await download(page, '[data-ry-download="html"]');
    const exported = await browser.newPage();
    await exported.setContent(html);
    for (const [, id] of readings) {
      const source = json.stages.flatMap(stage => stage.providedSources).find(source => source.id === id);
      assert.ok(text.includes(source.excerpt));
      assert.ok(text.includes(source.excerptNote));
      assert.match(source.urlLabel, /PDF/);
      const card = exported.locator(".sources article").filter({
        has: exported.getByRole("heading", { name: source.title, exact: true }),
      });
      assert.deepEqual(await card.locator("blockquote p").evaluateAll(nodes => nodes.map(node => node.innerText)), source.excerpt.split(/\n\s*\n/));
      assert.ok((await card.innerText()).includes(source.excerptNote));
      assert.ok((await card.locator("a").first().innerText()).includes(source.urlLabel));
    }
    assert.deepEqual(externalRequests, [], "No external website is required to read or save the evidence");
    console.log("PASS: Three inline archival readings, mobile/tablet/desktop fit, keyboard paraphrase, draft recovery and HTML/TXT/JSON exports; no external requests.");
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
