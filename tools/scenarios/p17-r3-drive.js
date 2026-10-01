/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 3 — drive the real app through every state the critic broke. */
const path = require('path');
const DIR = () => process.env.SHOT_DIR || '/tmp';

const probe = () => ({
  legend: (() => { const e = document.querySelector('.legend'); if (!e) return null;
    const r = e.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })(),
  body: (() => { const e = document.querySelector('#legend-body'); if (!e) return null;
    return { ch: e.clientHeight, sh: e.scrollHeight }; })(),
  head: (() => { const e = document.querySelector('.legend__head'); if (!e) return null;
    const r = e.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })(),
  marks: (() => { const e = document.querySelector('.legend__marksfix'); if (!e) return null;
    const r = e.getBoundingClientRect(); return { y: Math.round(r.y), h: Math.round(r.height) }; })(),
  tight: (document.querySelector('.stage__legend') || {}).dataset && document.querySelector('.stage__legend').dataset.tight,
  visSwatch: (() => { let n = 0; const panel = document.querySelector('.legend'); if (!panel) return 0;
    const pr = panel.getBoundingClientRect();
    for (const s of panel.querySelectorAll('.sym')) {
      const r = s.getBoundingClientRect();
      const host = s.closest('#legend-body, .legend__marksfix') || panel;
      const hr = host.getBoundingClientRect();
      const top = Math.max(hr.top, pr.top), bot = Math.min(hr.bottom, pr.bottom);
      if (r.height > 4 && r.top >= top - 2 && r.bottom <= bot + 2 && r.top >= 0 && r.bottom <= innerHeight) n++;
    } return n; })(),
  keySwatch: (() => { let n = 0; const b = document.querySelector('#legend-body'); if (!b) return 0;
    const panel = document.querySelector('.legend');
    const br = b.getBoundingClientRect(), pr = panel.getBoundingClientRect();
    const top = Math.max(br.top, pr.top), bot = Math.min(br.bottom, pr.bottom);
    for (const s of b.querySelectorAll('.legend__row .sym')) { const r = s.getBoundingClientRect();
      if (r.height > 4 && r.top >= top - 2 && r.bottom <= bot + 2 && r.top >= 0 && r.bottom <= innerHeight) n++; } return n; })(),
  byline: (() => { const e = document.querySelector('#legend-byline'); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { y: Math.round(r.y), h: Math.round(r.height), fields: [...e.querySelectorAll('.byline__value')].map(v => v.dataset.field + '=' + v.textContent.trim().slice(0, 70)) }; })(),
  crit: (() => { const e = document.querySelector('#legend-criticism'); if (!e || e.hidden) return null;
    return [...e.querySelectorAll('li')].map(li => li.textContent.trim().slice(0, 150)); })(),
  markText: [...document.querySelectorAll('.legend__marksfix .legend__row')].map(r => r.innerText.replace(/\n/g, ' ')),
  overlap: (() => { const a = document.querySelector('#legend-byline'), b = document.querySelector('.stage__legend');
    if (!a || !b) return null; const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const st = document.querySelector('.app__stage').getBoundingClientRect();
    return { bylineOverKey: ra.bottom > rb.top + 1, keyBelowStage: rb.bottom > st.bottom + 1, keyAboveStage: rb.top < st.top - 1 }; })(),
});

module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForTimeout(2600);

  const snap = async (name) => { const p = await page.evaluate(probe); log('== ' + name + ' ==', JSON.stringify(p)); return p; };

  await snap('default 1900');
  await shot('01-default');

  // --- criticism open: the key must survive it ---
  await page.click('.byline__crit');
  await page.waitForTimeout(400);
  await snap('criticism open');
  await shot('02-crit-open');

  // --- year-aware criticism ---
  for (const y of [1650, 2023]) {
    await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(450);
    const p = await page.evaluate(probe);
    log('== crit at ' + y + ' ==', JSON.stringify(p.crit));
  }
  await shot('03-crit-2023');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(350);
  await page.click('.byline__crit');
  await page.waitForTimeout(300);

  // --- the modes ---
  for (const key of ['s', 'h', 'w', 'p']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(700);
    const p = await page.evaluate(probe);
    log('== after ' + key + ' ==', JSON.stringify({ fields: p.byline.fields, marks: p.markText, tight: p.tight, keySwatch: p.keySwatch }));
    await shot('04-mode-' + key);
  }
  // criticism under silences+stitch+weight
  await page.click('.byline__crit');
  await page.waitForTimeout(400);
  log('== crit in modes ==', JSON.stringify((await page.evaluate(probe)).crit));
  await shot('05-crit-modes');
  await page.click('.byline__crit');
  for (const key of ['s', 'h', 'w', 'p']) { await page.keyboard.press(key); await page.waitForTimeout(400); }

  // --- open a legend row: trap + source + roll ---
  await page.waitForTimeout(300);
  const row = await page.$('.legend__entry[data-status]');
  if (row) {
    await row.click({ force: true });
    await page.waitForTimeout(600);
    const opened = await page.evaluate(() => {
      const r = document.querySelector('.legend__roll');
      return r ? {
        text: r.innerText.slice(0, 700),
        hasSrc: !!r.querySelector('.src'),
        srcText: r.querySelector('.src') ? r.querySelector('.src').innerText.replace(/\n/g, ' | ').slice(0, 400) : null,
      } : null;
    });
    log('== opened row ==', JSON.stringify(opened, null, 1));
    await shot('06-row-open');
    await page.evaluate(() => window.BEA.store.dispatch('setFilter', { status: null }));
    await page.waitForTimeout(300);
  }

  // --- totals against metricsAt ---
  const totals = await page.evaluate(() => {
    const out = [];
    for (const y of [1700, 1800, 1913, 1922, 1947, 2023]) {
      window.BEA.store.dispatch('setYear', y); window.BEA.store.flush();
      const m = window.BEA.data.metricsAt(y);
      const T = window.BEA.legend && window.BEA.legend.totalsAt ? window.BEA.legend.totalsAt(y) : null;
      out.push({ y, metricsUnits: m.units, metricsControlled: m.controlledUnits, byDegree: m.byDegree,
        legendDegreeOne: T && T.degreeOneUnits, informal: T && T.informalUnits,
        claimed: T && T.sets.claimed.units, administered: T && T.sets.administered.units,
        controlled: T && T.sets.controlled.units, influenced: T && T.sets.influenced.units });
    }
    return out;
  });
  log('== totals ==', JSON.stringify(totals, null, 1));

  // --- scrub for errors ---
  await page.evaluate(async () => {
    for (let y = 1600; y <= 1997; y += 7) { window.BEA.store.dispatch('setYear', y); await new Promise(r => setTimeout(r, 4)); }
  });
  await page.waitForTimeout(700);
  log('errors:', errs.length ? JSON.stringify(errs.slice(0, 12), null, 1) : 'none');
};
