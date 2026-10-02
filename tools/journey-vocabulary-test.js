"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { chromium, webkit } = require("playwright");
const { startServer } = require("./qa/learning-harness.js");

const KEY = "empire-echoes-vocabulary-v1";
const entry = {
  term: "gain power",
  meaning: "To become able to control people or decisions.",
  inContext: "The company gained political influence as well as making money.",
  examples: ["The winning party gained power after the election.", "The council gained power to protect local parks."],
  context: "How did the East India Company gain power?",
  source: "glossary",
};

async function setup(page, origin, before) {
  await page.route("**/__vocabulary_test__", (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/app/journey/css/experience.css"><link rel="stylesheet" href="/app/journey/css/vocabulary.css"></head><body><main id="mount" style="padding:24px"></main></body></html>` }));
  await page.goto(`${origin}/__vocabulary_test__`);
  if (before) await page.evaluate(before, KEY);
  await page.evaluate(async () => {
    const { createVocabulary } = await import("/app/journey/js/vocabulary.js");
    window.notebook = createVocabulary({ mount: document.getElementById("mount") });
  });
}

(async () => {
  const { server, origin } = await startServer();
  const engine = process.env.VOCABULARY_BROWSER === "webkit" ? webkit : chromium;
  const executablePath = process.env.VOCABULARY_BROWSER_PATH;
  const browser = await engine.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  let passed = 0;
  const check = (message) => { passed++; console.log(`PASS ${message}`); };
  try {
    const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 390, height: 844 }, hasTouch: true });
    const page = await context.newPage();
    await setup(page, origin);
    assert.equal(await page.evaluate(() => window.notebook.count()), 0);
    await page.getByRole("button", { name: "My vocabulary (0)", exact: true }).click();
    await page.getByText("Your list is ready.", { exact: false }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Download PDF", exact: true }).isDisabled(), true);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => document.activeElement.className === "vocabulary-open");
    assert.equal(await page.evaluate(() => document.activeElement.className), "vocabulary-open");
    check("empty list, Escape and focus return");

    const result = await page.evaluate((value) => window.notebook.add(value), entry);
    assert.equal(result.ok, true);
    assert.equal(result.saved, true);
    assert.equal(await page.evaluate((value) => window.notebook.has(value), entry), true);
    const duplicate = await page.evaluate((value) => window.notebook.add({ ...value, term: "GAIN POWER" }), entry);
    assert.equal(duplicate.exists, true);
    assert.equal(await page.evaluate(() => window.notebook.count()), 1);
    await page.evaluate((value) => window.notebook.add({ ...value, context: "A new context for the same phrase." }), entry);
    assert.equal(await page.evaluate(() => window.notebook.count()), 2);
    await setup(page, origin);
    assert.equal(await page.evaluate(() => window.notebook.count()), 2);
    check("deduplication respects phrase and sentence; entries persist after reload");

    await page.getByRole("button", { name: "My vocabulary (2)", exact: true }).click();
    await page.getByRole("button", { name: "Download PDF", exact: true }).waitFor();
    await page.waitForFunction(() => !document.querySelector(".vocabulary-download").disabled);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.evaluate(() => { const d = document.querySelector("dialog").getBoundingClientRect(); return d.left >= 0 && d.right <= innerWidth && d.top >= 0 && d.bottom <= innerHeight; }), true);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PDF", exact: true }).click();
    const download = await downloadPromise;
    const bytes = await fs.readFile(await download.path());
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.ok(bytes.length > 15000, "download is a PDF with embedded fonts");
    await fs.copyFile(await download.path(), path.join(os.tmpdir(), "empire-vocabulary-small.pdf"));
    check("mobile dialog fits and downloads an actual local PDF");
    await page.getByRole("button", { name: "Remove gain power from vocabulary", exact: true }).first().click();
    assert.equal(await page.evaluate(() => window.notebook.count()), 1);
    assert.equal(await page.evaluate(() => document.activeElement.className), "vocabulary-remove");
    await page.keyboard.press("Escape");
    check("removing an individual entry preserves focus and the other context");

    await page.evaluate((value) => {
      for (let i = 0; i < 16; i++) window.notebook.add({
        ...value,
        term: `Belonging ${i + 1}: Britain’s identity — “shared” histories`,
        meaning: "Being accepted as part of a group. A person may feel attached to more than one place and community. ".repeat(3),
        inContext: "The passage considers who is included in the idea of Britain today. ".repeat(5),
        examples: ["Javed’s family felt at home in Britain and kept connections with Pakistan.", "A café can be a place where neighbours meet and feel they belong."],
        context: "A longer source sentence about migration, British identity and belonging, with careful attention to words such as café, nation’s and ‘home’. ".repeat(10),
        source: "ai",
      });
    }, entry);
    await page.getByRole("button", { name: "My vocabulary (17)", exact: true }).click();
    const longDownloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PDF", exact: true }).click();
    const longDownload = await longDownloadPromise;
    await fs.copyFile(await longDownload.path(), path.join(os.tmpdir(), "empire-vocabulary-long.pdf"));
    assert.ok((await fs.stat(await longDownload.path())).size > bytes.length);
    check("long entries with smart punctuation and accents export across pages");
    await context.close();

    const corruptContext = await browser.newContext();
    const corruptPage = await corruptContext.newPage();
    await setup(corruptPage, origin, (storageKey) => localStorage.setItem(storageKey, "{broken original saved data"));
    const unsaved = await corruptPage.evaluate((value) => window.notebook.add(value), entry);
    assert.equal(unsaved.ok, true);
    assert.equal(unsaved.saved, false);
    assert.equal(await corruptPage.evaluate((storageKey) => localStorage.getItem(storageKey), KEY), "{broken original saved data");
    await corruptPage.getByRole("button", { name: "My vocabulary (1)", exact: true }).click();
    assert.match(await corruptPage.locator(".vocabulary-status").innerText(), /original data has been kept/);
    check("corrupt stored data remains untouched and new words survive in memory with a clear warning");
    await corruptContext.close();

    const quotaContext = await browser.newContext();
    const quotaPage = await quotaContext.newPage();
    await setup(quotaPage, origin, () => { Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); }; });
    const quotaResult = await quotaPage.evaluate((value) => window.notebook.add(value), entry);
    assert.equal(quotaResult.ok, true);
    assert.equal(quotaResult.saved, false);
    assert.equal(await quotaPage.evaluate(() => window.notebook.count()), 1);
    await quotaPage.getByRole("button", { name: "My vocabulary (1)", exact: true }).click();
    assert.match(await quotaPage.locator(".vocabulary-status").innerText(), /could not save your latest changes/);
    await quotaPage.waitForFunction(() => !document.querySelector(".vocabulary-download").disabled);
    const quotaDownload = quotaPage.waitForEvent("download");
    await quotaPage.getByRole("button", { name: "Download PDF", exact: true }).click();
    assert.equal((await fs.readFile(await (await quotaDownload).path())).subarray(0, 5).toString(), "%PDF-");
    check("storage failure preserves the current list and PDF export remains available");
    await quotaContext.close();

    const tabsContext = await browser.newContext();
    const firstTab = await tabsContext.newPage();
    const secondTab = await tabsContext.newPage();
    const legacy = JSON.stringify({ version: 1, entries: [entry] });
    await setup(firstTab, origin, (storageKey) => localStorage.setItem(storageKey, JSON.stringify({ version: 1, entries: [{ term: "gain power", meaning: "To become able to control people or decisions.", inContext: "The company gained political influence as well as making money.", examples: ["The winning party gained power after the election.", "The council gained power to protect local parks."], context: "How did the East India Company gain power?", source: "glossary" }] })));
    await setup(secondTab, origin);
    await firstTab.evaluate(() => window.notebook.open());
    await secondTab.evaluate(() => window.notebook.open());
    await Promise.all([
      firstTab.evaluate((value) => { for (let i = 0; i < 10; i++) window.notebook.add({ ...value, term: `First tab ${i}` }); }, entry),
      secondTab.evaluate((value) => { for (let i = 0; i < 10; i++) window.notebook.add({ ...value, term: `Second tab ${i}` }); }, entry),
    ]);
    await firstTab.waitForFunction(() => window.notebook.count() === 21 && document.querySelectorAll(".vocabulary-entry").length === 21);
    await secondTab.waitForFunction(() => window.notebook.count() === 21 && document.querySelectorAll(".vocabulary-entry").length === 21);
    assert.equal(await firstTab.evaluate((storageKey) => localStorage.getItem(storageKey), KEY), legacy);
    check("concurrent tabs retain every independent addition and update their open lists; legacy data stays unchanged");

    await firstTab.getByRole("button", { name: "Remove gain power from vocabulary", exact: true }).click();
    await secondTab.waitForFunction(() => window.notebook.count() === 20 && ![...document.querySelectorAll(".vocabulary-entry-heading h3")].some((node) => node.textContent === "gain power"));
    await secondTab.evaluate((value) => window.notebook.add({ ...value, term: "A later addition" }), entry);
    await setup(firstTab, origin);
    assert.equal(await firstTab.evaluate((value) => window.notebook.has(value), entry), false);
    assert.equal(await firstTab.evaluate(() => window.notebook.count()), 21);
    check("cross-tab removals propagate and tombstones prevent old lists resurrecting removed phrases");

    const suspendedTab = await tabsContext.newPage();
    await setup(suspendedTab, origin, () => window.addEventListener("storage", (event) => event.stopImmediatePropagation()));
    await firstTab.evaluate((value) => window.notebook.add({ ...value, term: "New while another tab sleeps" }), entry);
    // Simulate a background tab with delayed storage-event delivery.
    assert.equal(await suspendedTab.evaluate(() => window.notebook.count()), 21);
    await suspendedTab.evaluate((value) => window.notebook.add({ ...value, term: "Added from the stale tab" }), entry);
    assert.equal(await suspendedTab.evaluate(() => window.notebook.count()), 23);
    await setup(secondTab, origin);
    assert.equal(await secondTab.evaluate(() => window.notebook.count()), 23);
    assert.equal(await secondTab.evaluate((value) => window.notebook.has(value), entry), false);
    check("a stale background tab rereads storage before saving without overwriting additions or removals");
    await tabsContext.close();

    const mixedContext = await browser.newContext();
    const offlineTab = await mixedContext.newPage();
    const onlineTab = await mixedContext.newPage();
    await setup(offlineTab, origin, () => { Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); }; });
    await setup(onlineTab, origin);
    await offlineTab.evaluate((value) => window.notebook.add(value), entry);
    await onlineTab.evaluate((value) => window.notebook.add({ ...value, term: "From another tab" }), entry);
    await offlineTab.waitForFunction(() => window.notebook.count() === 2);
    assert.equal(await offlineTab.evaluate((value) => window.notebook.has(value), entry), true);
    assert.equal(await onlineTab.evaluate(() => window.notebook.count()), 1);
    await offlineTab.evaluate(() => window.notebook.open());
    assert.match(await offlineTab.locator(".vocabulary-status").innerText(), /could not save your latest changes/);
    check("cross-tab updates preserve this visit's unsaved words after a storage failure");
    await mixedContext.close();
    console.log(`${passed} vocabulary checks passed.`);
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
