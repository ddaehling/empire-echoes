#!/usr/bin/env node
"use strict";

// Student-facing interaction checks. No port 8777 use, external service, or API key.
const assert = require("node:assert/strict");
const { chromium, webkit } = require("playwright");
const { startServer, ready } = require("./qa/learning-harness.js");
const WEBKIT = process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH || process.env.WEBKIT_EXECUTABLE || webkit.executablePath();
const endpoint = "https://word-help.test/lookup";
let passed = 0;
const ok = (message) => { passed++; console.log(`PASS ${message}`); };

async function point(page, selector, word, occurrence = 0) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  return target.evaluate((block, { word, occurrence }) => {
    let start = -1;
    for (let i = 0; i <= occurrence; i++) start = block.textContent.indexOf(word, start + 1);
    if (start < 0) throw new Error(`Text not found: ${word}`);
    const end = start + word.length;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let total = 0, first = false;
    const range = document.createRange();
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!first && start < total + node.length) { range.setStart(node, start - total); first = true; }
      if (first && end <= total + node.length) { range.setEnd(node, end - total); break; }
      total += node.length;
    }
    const rect = range.getClientRects()[0];
    return { x: rect.left + Math.min(rect.width / 2, 10), y: rect.top + rect.height / 2 };
  }, { word, occurrence });
}
async function rightClick(page, selector, word, occurrence = 0) {
  const p = await point(page, selector, word, occurrence);
  await page.mouse.click(p.x, p.y, { button: "right" });
  await page.locator(".word-help-dialog[open]").waitFor();
}
async function closeHelp(page) {
  if (await page.locator(".word-help-dialog[open]").count()) {
    await page.locator(".word-help-close").click();
    await page.locator(".word-help-dialog[open]").waitFor({ state: "hidden" });
  }
}
async function fixture(page) {
  await page.locator(".ry-task-prompt").evaluate((paragraph) => {
    const fixture = document.createElement("p");
    fixture.id = "word-help-qa-passage";
    fixture.className = "ry-task-prompt";
    fixture.textContent = "You gain experience as you gain power in the council. People discuss public memory in museums. The word unfamiliar appears here.";
    paragraph.after(fixture);
    const closed = document.createElement("details");
    closed.id = "word-help-qa-closed";
    closed.innerHTML = '<summary>Closed source</summary><p class="ry-task-prompt">Invisibleword is inside a closed source.</p>';
    fixture.after(closed);
  });
  await page.locator("#word-help-qa-passage[data-word-reading]").waitFor();
}
async function search(page, word) {
  await page.locator(".word-help-toggle").click();
  await page.locator("#word-help-search").fill(word);
  await page.locator("#word-help-search").press("Enter");
}
async function touch(page, p, kind = "hold", engine = "chromium") {
  if (engine === "chromium") {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y }] });
    if (kind === "move") await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: p.x, y: p.y - 50 }] });
    await page.waitForTimeout(kind === "tap" ? 70 : 560);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
  } else {
    // WebKit's Playwright transport has no held touchscreen gesture API. Check
    // the same pointer path synthetically; this does not certify iPad OS callouts.
    await page.evaluate(({ p, kind }) => {
      const target = document.elementFromPoint(p.x, p.y);
      window.__wordHelpTouchTarget = target;
      target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerType: "touch", isPrimary: true, pointerId: 12, button: 0, clientX: p.x, clientY: p.y }));
      if (kind === "move") target.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "touch", isPrimary: true, pointerId: 12, clientX: p.x, clientY: p.y - 50 }));
    }, { p, kind });
    await page.waitForTimeout(kind === "tap" ? 70 : 560);
    await page.evaluate(p => window.__wordHelpTouchTarget.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "touch", isPrimary: true, pointerId: 12, clientX: p.x, clientY: p.y })), p);
  }
}

async function browserChecks(engine, origin) {
  const browser = await (engine === "webkit" ? webkit.launch({ headless: true, executablePath: WEBKIT }) : chromium.launch({ headless: true }));
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce", acceptDownloads: true });
    page.on("pageerror", e => errors.push(e.message));
    await page.route("**/word-help-config.js", route => route.fulfill({ contentType: "text/javascript", body: 'export const wordHelpEndpoint = "";' }));
    await ready(page, `${origin}/app/journey/#rallye`);
    await page.locator("[data-ry-start] button[type=submit]").click();
    await fixture(page);
    await rightClick(page, ".ry-task-prompt", "public");
    assert.equal(await page.locator("#word-help-title").innerText(), "public memory");
    assert.equal(await page.locator(".word-help-examples li").count(), 2);
    if (await page.evaluate(() => Boolean(globalThis.CSS?.highlights))) {
      assert.equal(await page.evaluate(() => [...CSS.highlights.get("word-help")][0].toString()), "public memory");
    }
    await closeHelp(page);
    await rightClick(page, ".ry-source .ry-source-summary", "Company");
    assert.equal(await page.locator(".word-help-dialog[open]").count(), 1);
    await closeHelp(page);
    ok(`${engine}: real task/source text hit testing and public memory chunk`);

    await rightClick(page, "#word-help-qa-passage", "gain", 1);
    assert.equal(await page.locator("#word-help-title").innerText(), "gain power");
    assert.match(await page.locator(".word-help-meaning").innerText(), /control/i);
    await page.locator("[data-word-save]").click();
    assert.equal(await page.locator("[data-word-save]").isDisabled(), true);
    await page.locator("[data-word-list]").click();
    assert.equal(await page.locator(".vocabulary-entry h3").innerText(), "gain power");
    assert.match(await page.locator(".vocabulary-context").innerText(), /You gain experience as you gain power/);
    await page.locator(".vocabulary-close").click();
    await rightClick(page, "#word-help-qa-passage", "power");
    assert.equal(await page.locator("#word-help-title").innerText(), "gain power");
    assert.equal(await page.locator("[data-word-save]").isDisabled(), true);
    await closeHelp(page);
    ok(`${engine}: clicked second gain or power expands and saves one complete phrase`);

    await search(page, "gain");
    assert.equal(await page.locator(".word-help-match").count(), 2);
    await page.locator(".word-help-match").nth(1).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.locator("#word-help-title").innerText(), "gain power");
    await page.keyboard.press("Escape");
    await page.locator(".word-help-dialog[open]").waitFor({ state: "hidden" });
    await search(page, "Invisibleword");
    assert.equal(await page.locator(".word-help-match").count(), 0);
    await closeHelp(page);
    await page.locator("#word-help-qa-closed summary").click();
    await search(page, "Invisibleword");
    assert.equal(await page.locator(".word-help-match").count(), 1, "newly opened source becomes searchable");
    await closeHelp(page);
    ok(`${engine}: keyboard search keeps repeated word offsets and reflects source disclosure visibility`);

    // Text fields and a real source link keep their ordinary right-click menu.
    await page.locator("#ry-answer").fill("A private answer with secretstudentword.");
    await page.locator("#ry-answer").click({ button: "right" });
    assert.equal(await page.locator(".word-help-dialog[open]").count(), 0);
    const link = page.locator(".ry-source a").first();
    await link.evaluate(node => { for (let n = node.parentElement; n; n = n.parentElement) if (n.tagName === "DETAILS") n.open = true; });
    await link.click({ button: "right" });
    assert.equal(await page.locator(".word-help-dialog[open]").count(), 0);
    await search(page, "secretstudentword");
    assert.equal(await page.locator(".word-help-match").count(), 0);
    await closeHelp(page);
    await page.locator(".word-help-toggle").click();
    await page.locator("[data-word-pick]").click();
    const pick = await point(page, "#word-help-qa-passage", "public");
    await page.mouse.click(pick.x, pick.y);
    assert.equal(await page.locator("#word-help-title").innerText(), "public memory");
    await closeHelp(page);
    ok(`${engine}: answers and links stay untouched; explicit tap-to-pick works`);
    await page.locator('[data-ry-stage="rule-and-resistance"]').first().click();
    await rightClick(page, ".ry-source blockquote p", "Subjects");
    assert.equal(await page.locator("#word-help-title").innerText(), "Our other Subjects");
    await closeHelp(page);
    ok(`${engine}: original archival source resolves the whole historical expression`);

    const touchPage = await browser.newPage({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true, reducedMotion: "reduce" });
    touchPage.on("pageerror", e => errors.push(e.message));
    await touchPage.route("**/word-help-config.js", route => route.fulfill({ contentType: "text/javascript", body: 'export const wordHelpEndpoint = "";' }));
    await ready(touchPage, `${origin}/app/journey/#rallye`);
    await touchPage.locator("[data-ry-start] button[type=submit]").click();
    await fixture(touchPage);
    const touchPoint = await point(touchPage, "#word-help-qa-passage", "gain", 1);
    await touch(touchPage, touchPoint, "tap", engine);
    await touchPage.waitForTimeout(500);
    assert.equal(await touchPage.locator(".word-help-dialog[open]").count(), 0);
    await touch(touchPage, await point(touchPage, "#word-help-qa-passage", "gain", 1), "move", engine);
    assert.equal(await touchPage.locator(".word-help-dialog[open]").count(), 0);
    await touch(touchPage, await point(touchPage, "#word-help-qa-passage", "gain", 1), "hold", engine);
    await touchPage.locator(".word-help-dialog[open]").waitFor();
    assert.equal(await touchPage.locator("#word-help-title").innerText(), "gain power");
    await touchPage.screenshot({ path: `/tmp/word-help-${engine}-ipad.png` });
    await closeHelp(touchPage);
    ok(`${engine}: ${engine === "chromium" ? "real CDP" : "synthetic"} touch hold works; short tap/movement do not trigger`);
    for (const width of [390, 320]) {
      await touchPage.setViewportSize({ width, height: 844 });
      await rightClick(touchPage, "#word-help-qa-passage", "gain", 1);
      const bounds = await touchPage.locator(".word-help-dialog").boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width + 1, `dialog fits ${width}px`);
      assert.ok(await touchPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.ok(await touchPage.locator(".word-help-dialog").evaluate(d => d.scrollWidth <= d.clientWidth + 1));
      if (width === 390) await touchPage.screenshot({ path: `/tmp/word-help-${engine}-390.png` });
      await closeHelp(touchPage);
    }
    ok(`${engine}: narrow dialog and page have no horizontal overflow`);
    await touchPage.close();

    // An isolated new profile mocks the configured server; no key or network is needed.
    const apiPage = await browser.newPage({ viewport: { width: 1200, height: 900 }, reducedMotion: "reduce" });
    apiPage.on("pageerror", e => errors.push(e.message));
    const requests = [];
    let answerMode = "valid", release;
    await apiPage.route("**/word-help-config.js", route => route.fulfill({ contentType: "text/javascript", body: `export const wordHelpEndpoint = ${JSON.stringify(endpoint)};` }));
    await apiPage.route(endpoint, async route => {
      const data = route.request().postDataJSON(); requests.push(data);
      if (answerMode === "delayed") await new Promise(resolve => { release = resolve; });
      if (answerMode === "offline") return route.abort("failed");
      if (answerMode === "busy") return route.fulfill({ status: 429, body: "{}" });
      if (answerMode === "bad") return route.fulfill({ contentType: "application/json", body: JSON.stringify({ term: "invented phrase", meaning: "Wrong", inContext: "Wrong", examples: ["One", "Two"] }) });
      const term = data.word === "gain" ? "gain power" : data.word;
      return route.fulfill({ contentType: "application/json", body: JSON.stringify({ term, meaning: '<img src=x onerror="window.pwned=true"> A plain-text meaning.', inContext: "A context-specific explanation.", examples: answerMode === "unrelated" ? ["An easy example.", "Another easy example."] : [`We use ${term} in a sentence.`, `An example with ${term} is easy to remember.`] }) }).catch(() => {});
    });
    await ready(apiPage, `${origin}/app/journey/#rallye`);
    await apiPage.locator("[data-ry-start] button[type=submit]").click();
    await fixture(apiPage);
    await apiPage.locator("#ry-answer").fill("Private secretstudentword text never sent.");
    await rightClick(apiPage, "#word-help-qa-passage", "gain", 1);
    await apiPage.locator(".word-help-meaning").waitFor();
    assert.equal(await apiPage.locator("#word-help-title").innerText(), "gain power");
    assert.equal(await apiPage.locator(".word-help-meaning img").count(), 0);
    assert.equal(await apiPage.evaluate(() => window.pwned), undefined);
    assert.equal(requests[0].context.slice(requests[0].start, requests[0].end), "gain");
    assert.equal(requests[0].start, requests[0].context.lastIndexOf("gain"));
    assert.doesNotMatch(JSON.stringify(requests), /secretstudentword/);
    await closeHelp(apiPage);
    await rightClick(apiPage, "#word-help-qa-passage", "gain", 1);
    await apiPage.locator(".word-help-meaning").waitFor();
    assert.equal(requests.length, 1, "same word/context uses cache");
    await closeHelp(apiPage);
    ok(`${engine}: contextual API offsets, escaped rendering, privacy and repeated-lookup cache`);

    answerMode = "delayed";
    await rightClick(apiPage, "#word-help-qa-passage", "unfamiliar");
    await apiPage.waitForFunction(() => document.querySelector("[data-word-status]").textContent.includes("Loading"));
    while (!release) await apiPage.waitForTimeout(10);
    await closeHelp(apiPage);
    answerMode = "valid";
    release();
    await apiPage.waitForTimeout(100);
    assert.equal(await apiPage.locator(".word-help-dialog[open]").count(), 0);
    answerMode = "bad";
    await rightClick(apiPage, "#word-help-qa-passage", "unfamiliar");
    await apiPage.locator('[data-word-body] a').waitFor();
    assert.match(await apiPage.locator("[data-word-body]").innerText(), /could not connect/);
    assert.equal(await apiPage.locator("[data-word-save]").count(), 0);
    await closeHelp(apiPage);
    answerMode = "unrelated";
    await rightClick(apiPage, "#word-help-qa-passage", "unfamiliar");
    await apiPage.locator('[data-word-body] a').waitFor();
    assert.equal(await apiPage.locator("[data-word-save]").count(), 0, "examples must use the complete expression");
    await closeHelp(apiPage);
    answerMode = "busy";
    await rightClick(apiPage, "#word-help-qa-passage", "unfamiliar");
    await apiPage.locator('[data-word-body] a').waitFor();
    assert.match(await apiPage.locator("[data-word-body]").innerText(), /busy/);
    await closeHelp(apiPage);
    answerMode = "offline";
    await rightClick(apiPage, "#word-help-qa-passage", "public");
    await apiPage.locator(".word-help-meaning").waitFor();
    assert.equal(await apiPage.locator("#word-help-title").innerText(), "public memory");
    assert.match(await apiPage.locator(".word-help-footnote").innerText(), /temporarily unavailable/);
    await closeHelp(apiPage);
    assert.deepEqual(errors, [], "no page errors");
    ok(`${engine}: cancelled/stale, invalid, throttled and offline responses handled`);
  } finally { await browser.close(); }
}
(async () => {
  const { server, origin } = await startServer();
  try {
    for (const engine of (process.env.BROWSER ? [process.env.BROWSER] : ["chromium", "webkit"])) await browserChecks(engine, origin);
    console.log(`Word-help interaction checks passed: ${passed}`);
  } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
