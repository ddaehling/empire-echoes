#!/usr/bin/env node
'use strict';

// Regression checks for the separate /app/next/ experience. Existing classroom
// files are verified against the pre-redesign SHA-256 manifest. This suite owns
// an isolated browser profile and server; BASE_URL can target an existing server.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8880;
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}/app/next/`;
const ORIGINAL_URL = new URL('../', BASE_URL).href;
const ARTIFACT_DIR = process.env.QA_ARTIFACT_DIR || (process.platform === 'win32' ? os.tmpdir() : '/tmp');
const artifact = name => path.join(ARTIFACT_DIR, `next-qa-${name}`);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const failures = [];
let passes = 0;

async function startServer() {
  if (process.env.BASE_URL) return null;
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.js')], {
    env: { ...process.env, PORT: String(PORT), HOST: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => { server.kill(); reject(new Error(`Test server did not start: ${output}`)); }, 10000);
    server.stdout.on('data', bytes => {
      output += bytes;
      if (output.includes('Classroom atlas:')) { clearTimeout(timeout); resolve(); }
    });
    server.stderr.on('data', bytes => { output += bytes; });
    server.on('error', error => { clearTimeout(timeout); reject(error); });
    server.on('exit', code => { clearTimeout(timeout); reject(new Error(`Test server exited (${code}): ${output}`)); });
  });
  return server;
}

async function check(name, run) {
  try { await run(); passes++; console.log(`PASS ${name}`); }
  catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${name}: ${error.message}`); }
}

function watchErrors(page, errors) {
  page.on('pageerror', error => errors.push(`Page: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`Console: ${message.text()}`); });
  page.on('requestfailed', request => errors.push(`Request: ${request.url()} (${request.failure()?.errorText})`));
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
}

async function ready(page, url = BASE_URL) {
  await page.goto(url);
  await page.locator('html[data-ready="true"]').waitFor({ timeout: 25000 });
  await page.evaluate(() => document.fonts.ready);
}

async function settle(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function route(page, value) {
  await page.evaluate(hash => { location.hash = hash; }, value);
  await page.locator(`#${value.split('?')[0]}-view`).waitFor({ state: 'visible' });
  await settle(page);
}

async function assertNoOverflow(page, label) {
  const size = await page.evaluate(() => ({ width: innerWidth, root: document.documentElement.scrollWidth, body: document.body.scrollWidth }));
  assert.ok(Math.max(size.root, size.body) <= size.width + 1, `${label}: horizontal overflow ${JSON.stringify(size)}`);
}

async function verifyPreservation() {
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'tools/qa/classroom-v1-sha256.json'), 'utf8'));
  assert.equal(Object.keys(manifest).length, 219, 'Preservation manifest should cover all 219 original files');
  const changed = [];
  await Promise.all(Object.entries(manifest).map(async ([name, expected]) => {
    try { if (hash(await fs.readFile(path.join(ROOT, name))) !== expected) changed.push(name); }
    catch { changed.push(`${name} (missing)`); }
  }));
  assert.deepEqual(changed, [], 'Original classroom files must remain byte-for-byte unchanged');
}

async function verifyContent() {
  const source = await fs.readFile(path.join(ROOT, 'app/next/js/assessment-content.js'), 'utf8');
  const { assessment } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  assert.equal(assessment.tasks.length, 8);
  assert.equal(new Set(assessment.tasks.map(task => task.type)).size, 7);
  assert.equal(assessment.tasks.filter(task => task.type === 'order').length, 2);
  assert.ok(assessment.tasks.every(task => task.required));
  const sum = tasks => tasks.reduce((total, task) => total + task.points, 0);
  assert.equal(sum(assessment.tasks), 30);
  assert.equal(sum(assessment.tasks.filter(task => task.review === 'automatic')), 18);
  assert.equal(sum(assessment.tasks.filter(task => task.review === 'human')), 12);
  assert.equal(assessment.tasks.reduce((total, task) => total + task.minutes, 0), 35);
  return assessment;
}

async function testExplore(page) {
  await check('new navigation is Explore and Assessment; original routes remain live', async () => {
    assert.deepEqual(await page.locator('.main-nav [data-view]').evaluateAll(nodes => nodes.map(node => node.dataset.view)), ['explore', 'assessment']);
    assert.equal(await page.locator('#learn-view, #teacher-view').count(), 0);
    assert.equal(new URL(await page.locator('.original-link').getAttribute('href'), BASE_URL).href, ORIGINAL_URL);
    const original = await page.context().newPage();
    try {
      for (const view of ['explore', 'learn', 'check', 'teacher']) {
        await ready(original, `${ORIGINAL_URL}#${view}`);
        assert.ok(await original.locator(`#${view}-view`).isVisible(), `Original ${view} route must still work`);
      }
    } finally { await original.close(); }
  });

  await check('globe uses real WebGL and changes with year, rotation, zoom and reset', async () => {
    const canvas = page.locator('#globe-container canvas.globe-canvas');
    await canvas.waitFor({ state: 'visible' });
    assert.equal(await canvas.getAttribute('data-globe-ready'), 'true');
    assert.equal(await canvas.evaluate(node => node.getContext('webgl2') instanceof WebGL2RenderingContext), true, 'Globe must be rendered by WebGL2');
    const pixels = async () => {
      await settle(page);
      const bounds = await canvas.boundingBox();
      const edge = Math.floor(Math.min(bounds.width, bounds.height) * 0.7);
      // Compare the rendered globe, excluding changing year labels, camera
      // controls and the keyboard focus ring surrounding the canvas.
      return hash(await page.screenshot({ clip: { x: bounds.x + (bounds.width - edge) / 2, y: bounds.y + (bounds.height - edge) / 2, width: edge, height: edge } }));
    };
    await page.locator('[data-year="1922"]').click();
    await page.locator('#reset-view').click();
    const initial = await pixels();
    await page.locator('[data-year="1600"]').click();
    assert.notEqual(await pixels(), initial, 'Year must change the globe texture');
    assert.ok(await page.locator('#previous-year').isDisabled());
    await page.locator('#year-slider').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#hero-year').textContent(), '1601');
    await page.locator('[data-year="1922"]').click();
    await canvas.focus();
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await pixels(), initial, 'Arrow keys rotate the globe');
    await page.keyboard.press('Home');
    assert.equal(await pixels(), initial, 'Home restores the initial camera');
    await page.locator('#zoom-in').click();
    assert.notEqual(await pixels(), initial, 'Zoom changes the globe view');
    await page.locator('#reset-view').click();
    assert.equal(await pixels(), initial);
    const rect = await canvas.boundingBox();
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width / 2 + 100, rect.y + rect.height / 2 + 20, { steps: 6 });
    await page.mouse.up();
    assert.notEqual(await pixels(), initial, 'Pointer drag rotates the globe');
    await page.locator('#reset-view').click();
    await page.locator('#colour-mode').selectOption('rule');
    assert.match(await page.locator('#legend-items').textContent(), /Direct authority.*Indirect authority.*Limited authority/);
    assert.notEqual(await pixels(), initial, 'Authority mode changes the globe texture');
    await page.locator('#colour-mode').selectOption('extent');
  });

  await check('place search, globe selection, flat projection and timeline work by keyboard', async () => {
    await page.locator('#main').focus();
    await page.keyboard.press('/');
    assert.equal(await page.locator('#place-search').evaluate(node => node === document.activeElement), true);
    await page.locator('#place-search').fill('India');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#historical-context h2').textContent(), 'British India');
    const selectedRegion = await page.locator('#historical-context .context-label').textContent();
    assert.match(page.url(), /place=british-india/);
    assert.equal(await page.locator('#place-search').getAttribute('aria-expanded'), 'false');
    await page.locator('#back-to-context').click();
    await settle(page);
    const globeCanvas = page.locator('#globe-container canvas');
    const globeBounds = await globeCanvas.boundingBox();
    await globeCanvas.click({ position: { x: globeBounds.width / 2, y: globeBounds.height / 2 } });
    assert.ok(await page.locator('#historical-context.is-territory').isVisible(), 'Clicking the Indian subcontinent on the globe must select its territory');
    assert.equal(await page.locator('#historical-context .context-label').textContent(), selectedRegion, 'Globe picking should agree with the displayed geography');
    await page.locator('#back-to-context').click();
    await page.locator('#flat-view').click();
    assert.ok(await page.locator('#flat-container svg.atlas-map').isVisible());
    assert.equal(await page.locator('#flat-view').getAttribute('aria-pressed'), 'true');
    const world = page.locator('#flat-container .atlas-world');
    const before = await world.getAttribute('transform');
    await page.locator('#zoom-in').click();
    assert.notEqual(await world.getAttribute('transform'), before);
    await page.locator('#reset-view').click();
    assert.equal(await world.getAttribute('transform'), before);
    await page.locator('[data-year="1997"]').click();
    assert.ok(await page.locator('#next-year').isDisabled());
    await page.locator('#play-timeline').click();
    await page.waitForFunction(() => Number(document.querySelector('#year-output').textContent) > 1600 && Number(document.querySelector('#year-output').textContent) < 1997);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#play-timeline').getAttribute('aria-pressed'), 'false');
    await page.locator('#read-map').click();
    assert.ok(await page.locator('#map-reading').isVisible());
    await page.locator('#read-map').click();
    await page.locator('#globe-view').click();
    await page.locator('[data-year="1922"]').click();
  });
}

async function testFallback(browser) {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 768, height: 1024 } });
  const errors = [];
  await context.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /webgl/i.test(type) ? null : getContext.call(this, type, ...args); };
  });
  const page = await context.newPage();
  watchErrors(page, errors);
  try {
    await ready(page);
    assert.ok(await page.locator('#flat-container svg.atlas-map').isVisible(), 'WebGL failure must leave an operational flat map');
    assert.ok(await page.locator('#globe-view').isDisabled());
    assert.match(await page.locator('#view-description').textContent(), /3D unavailable/);
    await page.locator('[data-year="1947"]').click();
    assert.equal(await page.locator('#hero-year').textContent(), '1947');
    await route(page, 'assessment');
    assert.ok(await page.locator('#assessment-view').isVisible());
    assert.ok((await page.locator('#assessment-view').textContent()).length > 100, 'Assessment must remain usable without WebGL');
    await assertNoOverflow(page, 'Fallback assessment at 768px');
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
}

const STORAGE_KEY = 'empire-classroom-assessment-v2';
const SOURCE_RESPONSE = 'The Act establishes that the United Kingdom government would no longer govern Kenya. As enacted legislation, its wording is strong evidence of the formal constitutional change in December 1963. However, a law cannot show whether particular families recovered land or felt safer after independence. Diaries, interviews and land records would help investigate those experiences and whether political independence changed everyday life.';
const ARGUMENT_RESPONSE = 'Decisions made in London mattered, but they did not independently determine every change in the empire. In Jamaica, Parliament passed the Abolition Act, while Samuel Sharpe and enslaved workers challenged plantation power through a strike and rebellion. Their actions helped create pressure for change. The continuation of compulsory apprenticeship also shows that British legislation did not immediately provide complete freedom. In India, Parliament transferred Company government to the Crown after the rebellion of 1857. This connects a British legal decision with actions by Indian soldiers and civilians. Britain retained substantial power to suppress resistance and decide the form of government, so local resistance did not always achieve the outcomes its participants wanted. Overall, imperial change emerged from unequal struggles between British authorities and people living under their power. London could formalise changes, but an explanation based only on London would miss the pressures that shaped those decisions.';

async function savedState(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY); }

async function taskPage(page, task) {
  await page.locator(`.as-sidebar [data-as-task="${task.id}"]`).click();
  await page.waitForFunction(id => document.querySelector('.as-sidebar [aria-current="step"]')?.dataset.asTask === id, task.id);
  assert.equal(await page.locator('.as-task-panel [data-as-heading]').textContent(), task.title);
}

async function arrange(page, task) {
  for (let target = 0; target < task.answer.length; target++) {
    const id = task.answer[target];
    let index = await page.locator('.as-order li').evaluateAll((nodes, wanted) => nodes.findIndex(node => node.querySelector('[data-as-move]').dataset.asMove === wanted), id);
    while (index > target) {
      await page.locator(`[data-as-move="${id}"][data-as-direction="-1"]`).click();
      index--;
    }
  }
}

async function downloadedText(page, format, scope = '.as-results') {
  const details = page.locator(`${scope} .as-downloads`);
  if (!(await details.evaluate(node => node.open))) await details.locator('summary').click();
  const pending = page.waitForEvent('download');
  await details.locator(`[data-as-download="${format}"]`).click();
  const download = await pending;
  assert.match(download.suggestedFilename(), new RegExp(`\\.${format}$`));
  return fs.readFile(await download.path(), 'utf8');
}

async function testAssessment(page, content) {
  const originalSentinel = JSON.stringify({ notes: { qa: 'Original version stays separate' }, progress: {}, completed: [] });
  await page.evaluate(value => localStorage.setItem('empire-classroom-v1', value), originalSentinel);
  const byId = id => content.tasks.find(task => task.id === id);
  await check('assessment identifies the learner and blocks incomplete submission without feedback', async () => {
    await route(page, 'assessment');
    await page.locator('[data-as-start] button[type="submit"]').click();
    assert.ok(await page.locator('#as-name-error').isVisible());
    await page.locator('#as-name').fill('QA Learner <draft>');
    await page.locator('#as-class').fill('History 12');
    await page.locator('[data-as-start] button[type="submit"]').click();
    assert.equal(await page.locator('.as-sidebar [data-as-task]').count(), 8);
    await page.locator('[data-as-action="review"]').click();
    await page.locator('[data-as-action="submit"]').click();
    assert.ok(await page.locator('.as-review-notice').isVisible());
    assert.match(await page.locator('.as-review-notice').textContent(), /8 tasks need/);
    assert.equal((await savedState(page)).submittedAt, null);
    assert.equal(await page.locator('.as-results, .as-feedback, .as-rubric').count(), 0);
    const report = JSON.parse(await downloadedText(page, 'json', '.as-review-panel'));
    assert.equal(report.status, 'draft');
    assert.equal(report.score, null);
    assert.ok(report.tasks.every(task => !('correctAnswer' in task) && !('explanation' in task) && !('rubric' in task) && !('mark' in task)), 'Draft exports must not expose answer keys or marks');
  });

  await check('single choice, exact multi-select, matching and both confirmed ordering tasks', async () => {
    const single = byId('changing-empire');
    await taskPage(page, single);
    await page.locator(`[data-as-response="${single.id}"][value="uniform-state"]`).check(); // Deliberately incorrect: final objective score should be 16/18.
    const multi = byId('reading-rule');
    await taskPage(page, multi);
    await page.locator(`[data-as-response="${multi.id}"][value="local-institutions"]`).check();
    assert.equal(await page.locator(`.as-sidebar [data-as-task="${multi.id}"]`).evaluate(node => node.classList.contains('is-done')), false);
    await page.locator(`[data-as-response="${multi.id}"][value="self-government"]`).check();
    await page.locator(`[data-as-response="${multi.id}"][value="equal-rights"]`).check();
    assert.match(await page.locator('#as-task-error').textContent(), /exactly 2/);
    await page.locator(`[data-as-response="${multi.id}"][value="equal-rights"]`).uncheck();
    for (const task of content.tasks.filter(task => task.type === 'order')) {
      await taskPage(page, task);
      await arrange(page, task);
      assert.equal(await page.locator(`.as-sidebar [data-as-task="${task.id}"]`).evaluate(node => node.classList.contains('is-done')), false, 'Ordering needs explicit confirmation');
      await page.locator(`[data-as-confirm="${task.id}"]`).check();
      await page.locator(`[data-as-move="${task.answer[0]}"][data-as-direction="1"]`).click();
      assert.equal(await page.locator(`[data-as-confirm="${task.id}"]`).isChecked(), false, 'Editing an order must clear confirmation');
      await arrange(page, task);
      await page.locator(`[data-as-confirm="${task.id}"]`).check();
      assert.deepEqual((await savedState(page)).answers[task.id], { order: task.answer, confirmed: true });
    }
    const matching = byId('forms-of-rule');
    await taskPage(page, matching);
    for (const item of matching.items) await page.locator(`[data-as-match="${item.id}"]`).selectOption('protectorate');
    assert.match(await page.locator('#as-task-error').textContent(), /only once/);
    for (const item of matching.items) await page.locator(`[data-as-match="${item.id}"]`).selectOption(matching.answer[item.id]);
    assert.deepEqual((await savedState(page)).answers[matching.id], matching.answer);
  });

  await check('map assignment records real territory picks and the accessible dropdown', async () => {
    const task = byId('locate-india');
    await taskPage(page, task);
    await page.locator('[data-as-map] .atlas-unit[data-unit="in-maharashtra"]').click();
    assert.equal(await page.locator('[data-as-map-select]').inputValue(), 'british-india');
    await page.getByLabel('Your selected territory', { exact: true }).selectOption('kenya');
    assert.equal((await savedState(page)).answers[task.id].territoryId, 'kenya');
    await page.getByLabel('Your selected territory', { exact: true }).selectOption('british-india');
    assert.equal((await savedState(page)).answers[task.id].territoryId, 'british-india');
  });

  await check('source analysis and extended writing enforce word limits and persist drafts', async () => {
    for (const [id, answer] of [['independence-source', SOURCE_RESPONSE], ['evidence-argument', ARGUMENT_RESPONSE]]) {
      const task = byId(id);
      // Error messages appear after a learner asks to submit; ordinary drafting
      // can remain quiet while its incomplete status is still recorded.
      await page.locator('[data-as-action="review"]').click();
      await page.locator('[data-as-action="submit"]').click();
      await taskPage(page, task);
      const textarea = page.locator(`[data-as-written="${id}"]`);
      await textarea.fill('A response that is too brief.');
      assert.match(await page.locator('#as-task-error').textContent(), new RegExp(`at least ${task.minWords}`));
      assert.equal(await page.locator(`.as-sidebar [data-as-task="${id}"]`).evaluate(node => node.classList.contains('is-done')), false);
      await textarea.fill('evidence '.repeat(task.maxWords + 1));
      assert.match(await page.locator('#as-task-error').textContent(), /words or fewer/);
      await textarea.fill(answer);
      assert.ok(await page.locator('#as-task-error').isHidden());
      await page.reload();
      await page.locator('html[data-ready="true"]').waitFor();
      assert.equal(await page.locator(`[data-as-written="${id}"]`).inputValue(), answer);
      assert.equal((await savedState(page)).student.name, 'QA Learner <draft>');
    }
    assert.equal(await page.locator('#nav-count').textContent(), '8/8');
    await page.locator('.as-sidebar [data-as-action="explore"]').click();
    await page.locator('#explore-view').waitFor({ state: 'visible' });
    assert.match(page.url(), /return=assessment/);
    await page.getByRole('link', { name: 'Return to your assessment', exact: false }).click();
    await page.locator('#assessment-view').waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-as-written="evidence-argument"]').inputValue(), ARGUMENT_RESPONSE);
    await page.locator('.skip-link').focus();
    await page.keyboard.press('Enter');
    assert.ok(await page.locator('#assessment-view').isVisible());
    assert.equal(await page.locator('#main').evaluate(node => node === document.activeElement), true);
  });

  await check('all assignment types and exploration fit 390px, 768px and 1440px with reduced motion', async () => {
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await route(page, 'explore');
      await assertNoOverflow(page, `Explore at ${width}px`);
      await page.screenshot({ path: artifact(`explore-${width}.png`), fullPage: true, animations: 'disabled' });
      await route(page, 'assessment');
      assert.equal(await page.locator('#globe-container canvas').getAttribute('tabindex'), '-1', 'Hidden globe must leave the keyboard sequence');
      for (const task of content.tasks) {
        await taskPage(page, task);
        await assertNoOverflow(page, `${task.type} at ${width}px`);
        if (['order', 'source-analysis', 'map-location'].includes(task.type) && width !== 768) await page.screenshot({ path: artifact(`${task.id}-${width}.png`), fullPage: true, animations: 'disabled' });
      }
      await page.locator('[data-as-action="review"]').click();
      await assertNoOverflow(page, `Review at ${width}px`);
    }
  });

  await check('public validation and marking distinguish objective scores from pending human review', async () => {
    const result = await page.evaluate(async key => {
      const { validateAssessment, gradeAssessment } = await import('./js/assessment.js');
      const state = JSON.parse(localStorage.getItem(key));
      const partial = structuredClone(state);
      partial.answers['reading-rule'] = ['local-institutions', 'equal-rights'];
      return { errors: validateAssessment(state), score: gradeAssessment(state), partial: gradeAssessment(partial) };
    }, STORAGE_KEY);
    assert.deepEqual(result.errors, []);
    assert.deepEqual({ earned: result.score.earned, possible: result.score.possible, pending: result.score.pending }, { earned: 16, possible: 18, pending: 12 });
    assert.equal(result.partial.items.find(item => item.id === 'reading-rule').earned, 1, 'Multi-select awards documented partial credit');
    assert.ok(result.score.items.filter(item => item.review === 'human').every(item => item.earned === null), 'Written responses must not receive invented automatic marks');
    assert.equal(await page.locator('.as-feedback, .as-rubric, .as-results').count(), 0, 'Correctness stays hidden until submission');
  });

  await check('submission reveals accurate feedback, locks the attempt and survives reload', async () => {
    await page.locator('[data-as-action="submit"]').click();
    await page.locator('.as-results').waitFor();
    assert.match(await page.locator('.as-results-marks').textContent(), /16\s*\/\s*18/);
    assert.match(await page.locator('.as-results-marks').textContent(), /12.*written marks awaiting teacher review/);
    assert.match(await page.locator('.as-result-explanation').textContent(), /not your final mark/);
    assert.equal(await page.locator('.as-feedback-item').count(), 8);
    assert.equal(await page.locator('[data-as-response], [data-as-written], [data-as-match]').count(), 0);
    await page.locator('.as-feedback-item').first().locator('summary').click();
    assert.match(await page.locator('.as-feedback-item').first().textContent(), /The correct answer/);
    const submittedAt = (await savedState(page)).submittedAt;
    assert.ok(submittedAt);
    await page.reload();
    await page.locator('html[data-ready="true"]').waitFor();
    assert.ok(await page.locator('.as-results').isVisible());
    assert.equal((await savedState(page)).submittedAt, submittedAt);
    assert.equal(await page.locator('#nav-count').textContent(), '✓');
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await assertNoOverflow(page, `Results at ${width}px`);
      await page.screenshot({ path: artifact(`results-${width}.png`), fullPage: true, animations: 'disabled' });
    }
  });

  await check('completed work exports text, JSON and printable reports with all eight answers', async () => {
    const text = await downloadedText(page, 'txt');
    assert.match(text, /Automatically checked: 16 \/ 18/);
    assert.match(text, /Written marks awaiting teacher review: 12/);
    assert.equal((text.match(/Correct answer:/g) || []).length, 1, 'Portable text only repeats answers that need correction');
    assert.ok(!text.includes('(1 marks)'), 'A one-mark rubric item uses the singular');
    assert.ok(text.includes(SOURCE_RESPONSE) && text.includes(ARGUMENT_RESPONSE));
    const report = JSON.parse(await downloadedText(page, 'json'));
    assert.equal(report.status, 'completed');
    assert.equal(report.tasks.length, 8);
    assert.equal(report.score.pending, 12);
    assert.ok(report.tasks.filter(task => task.mark.review === 'human').every(task => task.mark.earned === null && task.rubric.length));
    const html = await downloadedText(page, 'html');
    assert.ok(html.includes('QA Learner &lt;draft&gt;'), 'Learner text must be escaped in portable HTML');
    await fs.writeFile(artifact('report.html'), html);
    await fs.writeFile(artifact('report.json'), JSON.stringify(report, null, 2));
    await page.context().addInitScript(() => { window.print = () => { window.__qaPrinted = true; }; });
    await page.locator('[data-as-action="print"]').click();
    const frame = page.frameLocator('iframe[title="Printable assessment report"]');
    await frame.locator('body').waitFor({ state: 'attached' });
    await page.waitForFunction(() => document.querySelector('iframe[title="Printable assessment report"]')?.contentWindow?.__qaPrinted === true, null, { timeout: 5000 });
    assert.equal(await frame.locator('section').count(), 8);
    assert.ok((await frame.locator('body').textContent()).includes(ARGUMENT_RESPONSE));
    const reportPage = await page.context().newPage();
    try {
      await reportPage.setContent(html);
      assert.equal(await reportPage.getByRole('heading', { name: 'Correct answer', exact: true }).count(), 1, 'Printed reports avoid duplicate full-mark answers');
      await reportPage.emulateMedia({ media: 'print' });
      assert.ok(await reportPage.locator('button').isHidden());
      await reportPage.pdf({ path: artifact('report.pdf'), format: 'A4', printBackground: true });
      await reportPage.screenshot({ path: artifact('report-print.png'), fullPage: true });
    } finally { await reportPage.close(); }
  });

  await check('starting over requires confirmation and keeps original-version storage separate', async () => {
    await page.locator('[data-as-action="reset-dialog"]').click();
    assert.ok(await page.getByRole('dialog').isVisible());
    await page.locator('[data-as-action="cancel-reset"]').click();
    assert.ok(await page.locator('.as-results').isVisible());
    assert.ok((await savedState(page)).submittedAt);
    await page.locator('[data-as-action="reset-dialog"]').click();
    await page.locator('[data-as-action="confirm-reset"]').click();
    assert.ok(await page.locator('[data-as-start]').isVisible());
    assert.deepEqual((await savedState(page)).answers, {});
    assert.equal((await savedState(page)).submittedAt, null);
    assert.equal(await page.locator('#nav-count').textContent(), '0/8');
    assert.equal(await page.evaluate(() => localStorage.getItem('empire-classroom-v1')), originalSentinel);
    await page.reload();
    await page.locator('html[data-ready="true"]').waitFor();
    assert.ok(await page.locator('[data-as-start]').isVisible());
  });
}

async function main() {
  await check('all 219 original classroom files are preserved', verifyPreservation);
  let assessmentContent;
  await check('eight required assignments cover seven types and honest 18 + 12 marking', async () => { assessmentContent = await verifyContent(); });
  const server = await startServer();
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    watchErrors(page, errors);
    await ready(page);
    await testExplore(page);
    await testAssessment(page, assessmentContent);
    await check('WebGL-unavailable devices retain a working atlas and assessment', () => testFallback(browser));
    await check('new experience has no browser errors or failed assets', async () => assert.deepEqual(errors, []));
    await check('original files remain unchanged after all interactions', verifyPreservation);
    await context.close();
  } finally {
    await browser?.close();
    if (server && server.exitCode === null) await new Promise(resolve => { server.once('exit', resolve); server.kill(); });
  }
  console.log(`\n${passes} passed; ${failures.length} failed. QA artifacts: ${artifact('*')}`);
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
