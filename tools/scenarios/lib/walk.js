/**
 * lib/walk.js — WALKING A ROUTE THE WAY A STUDENT WALKS IT.
 *
 * GUARANTEE THIS FILE PROTECTS: an assertion about what a lesson shows a
 * student is made after actually pressing through that lesson, on a clean
 * record, on the route the app publishes.
 *
 * WHY IT EXISTS. `w8-run.js` grew a good walker — it knows that the order beat
 * only accepts the next card chronologically, that a beat hosting a checkpoint
 * asks two things and needs two passes, that "Commit both guesses" must be
 * pressed before "That is my guess", and that pressing a commit on an empty box
 * spends the beat's one commitment on nothing and greys the Close line that
 * beat earns. All of that was learned the hard way and none of it was
 * reusable, so `w9-close.js` deep-linked to the last step instead and asserted
 * a Close reached with an EMPTY RUN RECORD — which greys everything and is a
 * true report about a student who did not do the lesson. Every §8.4 rule is
 * about the student who did.
 *
 * ------------------------------------------------------------------ API ----
 *   await cold(page, url)              a clean record, freshly loaded
 *   await satisfy(page)                do whatever this beat asks
 *   await walk(page, url, id, log)     -> { seen[], closed, steps }
 */

'use strict';

const routes = require('./routes.js');

const READY = () => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready';

/** A student who has never been here. Everything §8.4 says is about a record. */
async function cold(page, url) {
  await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
  await page.waitForFunction(READY, null, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (_) {} });
}

async function click(page, sel, n) {
  const l = page.locator(sel).nth(n || 0);
  if (await l.count() === 0) return false;
  if (!(await l.isVisible().catch(() => false))) return false;
  if (await l.isDisabled().catch(() => false)) return false;
  await l.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(200);
  return true;
}

/** Do whatever this beat asks, so Next comes back. Lifted from `w8-run.js`,
 *  where every line of it was learned from a run that stalled. */
async function satisfy(page) {
  const did = [];
  const countOf = (sel) => page.locator(sel).count();
  if (await countOf('.tr-field__cell')) { if (await click(page, '.tr-field__cell', 4)) did.push('gate'); }
  const nums = await countOf('.tr-num');
  for (let k = 0; k < nums; k++) {
    await page.locator('.tr-num').nth(k).fill(k ? '40' : '25').catch(() => {});
    did.push('number');
  }
  for (let round = 0; round < 12; round++) {
    const n = await countOf('.tr-order__pool li');
    if (!n) break;
    let moved = false;
    for (let k = 0; k < n; k++) {
      await click(page, '.tr-order__btn', k);
      if (await countOf('.tr-order__pool li') < n) { moved = true; did.push('order'); break; }
    }
    if (!moved) break;
  }
  for (let k = 0; k < 10; k++) { if (!(await click(page, '.tr-sort__b'))) break; did.push('sort'); }
  for (let k = 0; k < 8; k++) { if (!(await click(page, '.tr-defrun__b'))) break; did.push('def'); }
  for (let k = 0; k < 8; k++) { if (!(await click(page, '.tr-years__b'))) break; did.push('years'); }
  for (let k = 0; k < 12; k++) { if (!(await click(page, '.tr-loop__next'))) break; did.push('loop'); }
  if (await click(page, '.tr-loop__cut')) did.push('cut');
  for (let pass = 0; pass < 3; pass++) {
    const lists = await page.locator('.tr-tension__opts, .tr-choices, .cx-ask__choices').count();
    for (let li = 0; li < lists; li++) {
      const b = page.locator('.tr-tension__opts, .tr-choices, .cx-ask__choices').nth(li).locator('button').first();
      if (await b.count() && await b.isVisible().catch(() => false) && !(await b.isDisabled().catch(() => true))) {
        await b.click({ timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(150);
        did.push('choice');
      }
    }
    if (!lists) { if (!(await click(page, '.tr-choice'))) break; did.push('choice'); }
  }
  if (await countOf('.tr-source__in')) {
    const n = await countOf('.tr-source__in');
    for (let i = 0; i < n; i++) await page.locator('.tr-source__in').nth(i).fill('A test of the field, twenty characters and more.').catch(() => {});
    did.push('write');
  }
  if (await countOf('.qz-range')) {
    await page.locator('.qz-range').first().evaluate((e) => {
      e.value = String(Number(e.min || 0) + (Number(e.max || 10) - Number(e.min || 0)) * 0.45);
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true }));
    }).catch(() => {});
    did.push('range');
  }
  if (await countOf('.qz-year')) { await page.locator('.qz-year').first().fill('1900').catch(() => {}); did.push('year'); }
  for (const s of ['.qz-conf__o', '.qz-opt', '.qz-chip', '.qz-belief', '.qz-order__u', '.qz-check__o']) {
    if (await click(page, s)) did.push(s.replace(/[.\-_]/g, ''));
  }
  const empty = await page.evaluate(() => [...document.querySelectorAll('.tr-num')].some((n) => !String(n.value || '').trim()));
  if (empty) {
    const n2 = await countOf('.tr-num');
    for (let k = 0; k < n2; k++) { await page.locator('.tr-num').nth(k).fill('40').catch(() => {}); did.push('refill'); }
    await page.waitForTimeout(180);
  }
  for (const s of ['.tr-go', '.tr-tension__go', '.tr-source__go']) { if (await click(page, s)) did.push(s.replace('.', '')); }
  for (const label of ['Commit both guesses', 'Commit', 'That is my guess', 'Check it', 'Answer']) {
    const b = page.locator('button:has-text("' + label + '")').first();
    if (await b.count() && await b.isVisible().catch(() => false) && !(await b.isDisabled().catch(() => true))) {
      await b.click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(240);
      did.push(label.toLowerCase().split(' ')[0]);
    }
  }
  for (const s of ['.tr-go', '.tr-tension__go', '.tr-source__go']) { if (await click(page, s)) did.push(s.replace('.', '') + '2'); }
  return did;
}

/**
 * One route, first step to Close, on a clean record. `log` is optional.
 * Returns every step it met, in order, with what the student was shown.
 */
async function walk(page, url, id, log) {
  const say = log || (() => {});
  await cold(page, url);
  /* AND RELOAD ONTO THE ROUTE. `page.goto(base + '#tour=…')` from `base` is a
     HASH navigation, not a load: the document survives and so does every
     module's in-memory state — including the close ledger written by the last
     route this scenario walked, which then makes the UNIT Close fire on a
     lesson the student has just met for the first time. Clearing storage is
     not enough if nothing re-reads it. */
  await page.goto(routes.href(url, id, 1), { waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  await routes.ready(page);
  await page.waitForTimeout(1500);
  /* THE DOOR STANDS IN FRONT OF THE FIRST BEAT ON A COLD RECORD. A walker that
     does not press it walks nothing. */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.ob-door button, .ob button, button')]
      .find((x) => /^start\b/i.test((x.textContent || '').trim()));
    if (b) b.click();
  });
  await page.waitForTimeout(900);

  const seen = [];
  let closed = false;
  for (let i = 1; i <= 45; i++) {
    const m = await page.evaluate(() => ({
      count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
      title: (document.querySelector('.tr-panel__title') || {}).textContent || '',
      mark: (document.querySelector('.tr-panel__mark') || {}).textContent || '',
      gate: !!document.querySelector('.tr-field'),
      recall: !!document.querySelector('.tr-recall'),
      cp: !!document.querySelector('.qz-cp'),
      beatPanel: !!document.querySelector('.tr-panel__body'),
      close: !!document.querySelector('.cl-close'),
    }));
    if (m.close) { closed = true; break; }
    seen.push({ i, ...m, count: m.count.trim(), title: m.title.trim(), mark: m.mark.trim() });
    const did = await satisfy(page);
    for (const x of await satisfy(page)) did.push(x);
    say('  step ' + String(i).padStart(2) + ' ' + m.count.trim().padEnd(9)
      + (m.gate ? '[gate] ' : '') + (m.recall ? '[recall] ' : '') + (m.cp ? '[checkpoint] ' : '')
      + m.title.slice(0, 44).padEnd(46) + (did.length ? 'did: ' + did.join(',') : ''));
    if (!(await click(page, '.tr-bar__next'))) {
      /* The last step's forward control is "Finish", not "Next". */
      const fin = await page.evaluate(() => {
        const b = [...document.querySelectorAll('button, a')]
          .find((x) => /finish/i.test(x.textContent || '') && x.offsetParent && !x.disabled);
        if (b) { b.click(); return true; }
        return false;
      });
      if (!fin) { say('  CANNOT ADVANCE at step ' + i); break; }
    }
    await page.waitForTimeout(420);
  }
  if (!closed) {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll('button, a')].find((x) => /finish/i.test(x.textContent || ''));
      if (b) b.click();
    });
    await page.waitForTimeout(2400);
    closed = await page.evaluate(() => !!document.querySelector('.cl-close'));
  }
  await page.waitForTimeout(1200);
  return { seen, closed, steps: seen.length };
}

module.exports = { cold, satisfy, walk, click };
