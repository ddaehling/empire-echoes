#!/usr/bin/env node
"use strict";

// Browser fixtures stay in this test: no supplied reading, API key or real API
// request is needed to exercise the student experience.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const { ROOT, startServer, download } = require("./qa/learning-harness.js");

const endpoint = "https://reader-word-help.test/explain";
const fixture = {
  title: "Reading test",
  source: "Test fixture",
  paragraphs: [
    "You gain experience as you gain power in the council. People discuss public memory in museums.",
    "A longer sentence checks context boundaries while " +
      "readers compare ideas, ask questions, and discuss what they discover, ".repeat(18) +
      "the unfamiliarword appears in the middle while " +
      "readers compare ideas, ask questions, and discuss what they discover, ".repeat(18) +
      "alongside tomorrow and confidence.",
    "B1 readers compare COVID-19 and 19th-century accounts — punctuation stays unchanged.",
  ],
};
const review = path.join(ROOT, ".impeccable/review");
let passed = 0;
const pass = (message) => { passed++; console.log(`PASS ${message}`); };

function reply(data, overrides = {}) {
  const term = data.word === "gain" && data.start === data.context.lastIndexOf("gain") ? "gain power" : data.word;
  return {
    term,
    meaning: `An easy meaning of ${term}.`,
    inContext: `In this passage, ${term} describes the idea in the selected sentence.`,
    examples: [`We use ${term} in this example.`, `You can remember ${term} with this sentence.`],
    source: "ai",
    ...overrides,
  };
}

async function scenario(browser, origin, content = fixture, options = {}) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    acceptDownloads: true,
    ...options,
  });
  const page = await context.newPage();
  const state = { calls: [], errors: [], unexpected: [], mode: "valid", release: null, delivered: null };
  page.on("pageerror", (error) => state.errors.push(error.message));
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/word-help-config.js")) {
      return route.fulfill({ contentType: "text/javascript", body: `export const wordHelpEndpoint = ${JSON.stringify(endpoint)};` });
    }
    if (url.pathname === "/app/reader/content.json") {
      return route.fulfill({ contentType: "application/json", body: JSON.stringify(content) });
    }
    if (url.href === endpoint) {
      const data = request.postDataJSON();
      state.calls.push({ method: request.method(), data });
      const mode = state.mode;
      if (mode === "daily" || mode === "busy") return route.fulfill({
        status: 429,
        contentType: "application/json",
        headers: { "Retry-After": "3600" },
        body: JSON.stringify({ error: mode === "daily"
          ? { code: "daily_limit", message: "Daily word-help limit reached. Try again tomorrow." }
          : { code: "rate_limit", message: "Word help is busy. Try again in a minute." } }),
      });
      if (mode === "delayed") {
        await new Promise((resolve) => { state.release = resolve; });
      }
      const overrides = mode === "xss" ? {
        meaning: '<img src=x onerror="window.readerXss=true"> A plain-text meaning.',
        inContext: '<svg onload="window.readerXss=true"> A plain-text explanation.',
      } : mode === "invalid" ? { term: "invented phrase" } : {};
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(reply(data, overrides)) }).catch(() => {});
      if (mode === "delayed") state.delivered = true;
      return;
    }
    if (url.origin === origin || url.protocol === "data:" || url.protocol === "blob:") return route.continue();
    // A changed configuration must never accidentally spend the live API budget.
    state.unexpected.push(url.href);
    return route.abort("blockedbyclient");
  });
  await page.goto(`${origin}/app/reader/`);
  await page.evaluate(() => document.fonts.ready);
  return { context, page, state };
}

async function waitUntil(callback, message) {
  const deadline = Date.now() + 10000;
  while (!callback()) {
    if (Date.now() >= deadline) throw new Error(message);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}

function word(page, text, index = 0) {
  return page.locator(".reading-word").filter({ hasText: new RegExp(`^${text}$`) }).nth(index);
}

async function explained(page, term) {
  await page.waitForFunction((expected) =>
    document.querySelector("#word-title")?.textContent === expected &&
    document.querySelector("#save-word")?.disabled === false, term);
}

async function close(page) {
  const button = page.locator("#close-word");
  if (await button.isVisible()) await button.click();
}

async function verifyNoErrors(state) {
  assert.deepEqual(state.errors, [], "the reading must have no uncaught browser errors");
  assert.deepEqual(state.unexpected, [], "no external network is used by this browser fixture");
}

(async () => {
  const { server, origin } = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    await fs.mkdir(review, { recursive: true });
    const { context, page, state } = await scenario(browser, origin);
    await page.locator(".reading-word").first().waitFor();
    assert.equal(await page.locator("#reading-title").innerText(), fixture.title);
    assert.equal(await page.locator("#reading-source").innerText(), fixture.source);
    assert.deepEqual(await page.locator("#reading-text p").allTextContents(), fixture.paragraphs);
    assert.equal(state.calls.length, 0, "opening the reading never starts an API call");
    const offsets = await page.locator("#reading-text p").first().locator(".reading-word").evaluateAll((nodes) => nodes.map((node) => ({
      text: node.textContent, start: Number(node.dataset.start), end: Number(node.dataset.end),
    })));
    for (const item of offsets) assert.equal(fixture.paragraphs[0].slice(item.start, item.end), item.text);
    for (const token of ["B1", "COVID-19", "19th-century"]) assert.equal(await word(page, token).count(), 1, `${token} remains a complete lookup target`);
    pass("reading preserves every paragraph, space and punctuation; opening uses no API call");

    await word(page, "gain", 1).click();
    await explained(page, "gain power");
    assert.equal(state.calls.length, 1);
    assert.equal(state.calls[0].method, "POST");
    const first = state.calls[0].data;
    assert.deepEqual(Object.keys(first).sort(), ["context", "end", "start", "word"]);
    assert.equal(first.word, "gain");
    assert.equal(first.context.slice(first.start, first.end), "gain");
    assert.equal(first.start, first.context.lastIndexOf("gain"), "the second occurrence is selected");
    assert.ok(first.context.length <= 800);
    assert.equal(await page.locator("#word-body li").count(), 2);
    await page.locator("#save-word").click();
    assert.equal(await page.locator("#save-word").isDisabled(), true);
    assert.match(await page.locator("#saved-count").innerText(), /1/);
    await page.locator("#vocabulary > summary").click();
    assert.match(await page.locator("#saved-words").innerText(), /gain power/);
    const exported = await download(page, "#download-vocabulary");
    assert.match(exported, /gain power/);
    assert.match(exported, /An easy meaning/);
    pass("clicking the repeated word sends exact offsets, expands a phrase, saves and downloads it");

    await close(page);
    await word(page, "gain", 1).click();
    await page.waitForFunction(() => document.querySelector("#word-title")?.textContent === "gain power");
    assert.equal(state.calls.length, 1, "a repeated lookup uses the browser cache");
    await close(page);
    await page.reload();
    await page.locator(".reading-word").first().waitFor();
    assert.match(await page.locator("#saved-count").innerText(), /1/);
    await page.locator("#vocabulary > summary").click();
    assert.match(await page.locator("#saved-words").innerText(), /gain power/);
    assert.equal(state.calls.length, 1, "reloading saved vocabulary makes no lookup");
    pass("repeat lookup is cached; saved vocabulary survives reloading");

    const words = page.locator(".reading-word");
    assert.equal(await page.locator('.reading-word[tabindex="0"]').count(), 1, "reading uses one tab stop");
    await words.first().focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await words.nth(1).evaluate((node) => document.activeElement === node), true);
    await page.keyboard.press("ArrowLeft");
    assert.equal(await words.first().evaluate((node) => document.activeElement === node), true);
    await page.keyboard.press("Enter");
    await explained(page, "You");
    await page.keyboard.press("Escape");
    assert.equal(await words.first().evaluate((node) => document.activeElement === node), true);
    pass("keyboard users can move between words, open help and return focus with Escape");

    await word(page, "unfamiliarword").click();
    await explained(page, "unfamiliarword");
    const bounded = state.calls.at(-1).data;
    assert.ok(bounded.context.length <= 800, "long paragraphs are bounded before transmission");
    assert.equal(bounded.context.slice(bounded.start, bounded.end), "unfamiliarword");
    assert.ok(fixture.paragraphs[1].includes(bounded.context));
    pass("long paragraphs produce a bounded context with valid word offsets");
    await close(page);

    state.mode = "daily";
    await word(page, "tomorrow").click();
    await page.waitForFunction(() => document.querySelector("#word-body")?.textContent.includes("limit"));
    assert.match(await page.locator("#word-panel").innerText(), /daily|midnight UTC|1[,.]?000/i);
    assert.equal(await page.locator("#save-word").isVisible(), false);
    assert.equal(await page.locator("[data-retry]").count(), 0, "daily exhaustion does not invite another immediate request");
    await close(page);
    state.mode = "busy";
    await word(page, "tomorrow").click();
    await page.locator("[data-retry]").waitFor();
    const callsBeforeRetry = state.calls.length;
    state.mode = "valid";
    await page.locator("[data-retry]").click();
    await explained(page, "tomorrow");
    assert.equal(state.calls.length, callsBeforeRetry + 1);
    pass("the daily limit is explained; temporary throttling offers a working retry");
    await close(page);

    state.mode = "delayed";
    await word(page, "council").click();
    await waitUntil(() => state.release, "delayed mock request did not arrive");
    await close(page);
    state.mode = "valid";
    await word(page, "museums").click();
    await explained(page, "museums");
    state.release();
    await waitUntil(() => state.delivered, "delayed mock was not delivered");
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.locator("#word-title").innerText(), "museums", "stale response cannot replace the current word");
    pass("a cancelled older response cannot overwrite a newer explanation");
    await close(page);

    state.mode = "xss";
    await word(page, "confidence").click();
    await page.waitForFunction(() => {
      const body = document.querySelector("#word-body");
      return Boolean(body?.textContent.includes("plain-text") || body?.querySelector("[data-retry]"));
    });
    assert.equal(await page.locator("#word-body img, #word-body svg, #word-body script").count(), 0);
    assert.equal(await page.evaluate(() => window.readerXss), undefined);
    pass("malicious provider content is rendered as text or rejected without executing HTML");
    await close(page);

    state.mode = "invalid";
    await word(page, "experience").click();
    await page.locator("[data-retry]").waitFor();
    assert.equal(await page.locator("#save-word").isVisible(), false);
    assert.doesNotMatch(await page.locator("#word-title").innerText(), /invented phrase/);
    pass("an unrelated model phrase is rejected and cannot be saved");
    await close(page);

    await verifyNoErrors(state);
    await context.close();

    const empty = await scenario(browser, origin, { title: "", source: "", paragraphs: [] });
    await empty.page.waitForFunction(() => document.querySelector("#reading-text")?.textContent.trim().length > 0);
    assert.equal(await empty.page.locator(".reading-word").count(), 0);
    assert.match(await empty.page.locator("#reading-text").innerText(), /text|reading|ready|provided|available/i);
    assert.equal(empty.state.calls.length, 0);
    await verifyNoErrors(empty.state);
    await empty.context.close();
    pass("a missing source reading has an honest empty state and makes no API request");

    const screenshotFixture = {
      ...fixture,
      paragraphs: [fixture.paragraphs[0], "This short test passage checks the reading layout. Students can explore a word, read its meaning, and save helpful expressions."],
    };
    const desktop = await scenario(browser, origin, screenshotFixture);
    await desktop.page.locator(".reading-word").first().waitFor();
    await word(desktop.page, "gain", 1).click();
    await explained(desktop.page, "gain power");
    const styles = await desktop.page.evaluate(() => {
      const selectors = ["body", ".reader-brand", ".reader-saved-link", "#reading-source", ".reading-guidance", "#word-title", "#word-body", "#save-word", ".reader-status", ".reader-privacy"];
      return selectors.map((selector) => {
        const node = document.querySelector(selector);
        const css = getComputedStyle(node);
        let ancestor = node;
        while (ancestor && getComputedStyle(ancestor).backgroundColor === "rgba(0, 0, 0, 0)") ancestor = ancestor.parentElement;
        return { selector, color: css.color, backgroundColor: css.backgroundColor,
          effectiveBackground: ancestor ? getComputedStyle(ancestor).backgroundColor : "rgb(255, 255, 255)",
          letterSpacing: css.letterSpacing, fontSize: css.fontSize, backgroundImage: css.backgroundImage };
      });
    });
    console.log(`Computed reader styles: ${JSON.stringify(styles)}`);
    const mobile = await scenario(browser, origin, screenshotFixture, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await mobile.page.locator(".reading-word").first().waitFor();
    await word(mobile.page, "gain", 1).tap();
    await explained(mobile.page, "gain power");
    const bounds = await mobile.page.locator("#word-panel").boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 391, "word help fits a narrow phone");
    assert.ok(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "phone page has no horizontal overflow");
    // Capture both layouts together after interaction checks, in one QA round.
    // A repair-only rerun can retain that round with READER_SKIP_SCREENSHOTS=1.
    if (process.env.READER_SKIP_SCREENSHOTS !== "1") await Promise.all([
      desktop.page.screenshot({ path: path.join(review, "reader-desktop.png"), fullPage: true }),
      mobile.page.screenshot({ path: path.join(review, "reader-mobile.png"), fullPage: true }),
    ]);
    await mobile.page.locator("#save-word").tap();
    assert.equal(await mobile.page.locator("#save-word").isDisabled(), true, "the scrollable phone panel keeps its save action reachable");
    assert.match(await mobile.page.locator("#saved-count").innerText(), /1/);
    await verifyNoErrors(desktop.state);
    await verifyNoErrors(mobile.state);
    await mobile.context.close();
    await desktop.context.close();
    pass("touch lookup fits a phone and its save action is reachable; desktop/mobile screenshots available");

    console.log(`Reader interaction checks passed: ${passed}`);
    console.log(`Screenshots: ${path.join(review, "reader-desktop.png")} and ${path.join(review, "reader-mobile.png")}`);
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
