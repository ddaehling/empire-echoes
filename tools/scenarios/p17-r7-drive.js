/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 7 — drive the ribbon through stages, years, definitions, modes and
   the rail, and assert that nothing is ever drawn half-way. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.waitForTimeout(2800);

  const probe = (tag) => page.evaluate((t) => {
    const root = document.querySelector('.legend--ribbon');
    const list = root && root.querySelector('.legend__ribbon-list');
    const route = root && root.querySelector('.legend__route');
    if (!list) return { tag: t, missing: true };
    const lb = list.getBoundingClientRect();
    const ribs = [...list.querySelectorAll('.legend__rib')];
    const shown = ribs.filter(r => !r.hidden);
    const half = shown.filter(r => {
      const b = r.getBoundingClientRect();
      return b.right > lb.right + 0.5 || b.left < lb.left - 0.5;
    }).map(r => r.innerText.replace(/\s+/g, ' ').trim());
    const keyRect = document.querySelector('.stage__key').getBoundingClientRect();
    const legRect = root.getBoundingClientRect();
    return {
      tag: t,
      stage: document.getElementById('app').dataset.stage,
      tier: root.dataset.tier, fit: root.dataset.fit,
      total: ribs.length, shown: shown.length,
      route: route ? route.textContent : null,
      overflow: Math.round(list.scrollWidth - list.clientWidth),
      halfDrawn: half,
      spill: Math.round(legRect.bottom - keyRect.bottom),
      keyH: Math.round(keyRect.height), legH: Math.round(legRect.height),
      scrollH: document.documentElement.scrollHeight, vh: innerHeight,
      words: shown.map(r => { const w = r.querySelector('.legend__rib-w');
        return w && w.getBoundingClientRect().width > 1 ? w.textContent : null; }).filter(Boolean),
    };
  }, tag);

  const out = [];
  out.push(await probe('plate 1900'));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500);
  out.push(await probe('working 1901'));
  for (const k of ['2', '3', '4', '1']) { await page.keyboard.press(k); await page.waitForTimeout(450); out.push(await probe('def ' + k)); }
  await page.keyboard.press('h'); await page.waitForTimeout(600); out.push(await probe('silence mode'));
  await page.keyboard.press('h'); await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' })); await page.waitForTimeout(600);
  out.push(await probe('apparatus'));
  for (const y of [1300, 1650, 1783, 1857, 1922, 1947, 1997]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(420);
    out.push(await probe('year ' + y));
  }
  await shot('apparatus-1997');
  await page.evaluate(() => window.BEA.legend.openPlate('colour')); await page.waitForTimeout(700);
  out.push(await probe('rail open'));
  await shot('rail-open');
  await page.evaluate(() => window.BEA.legend.closePlate()); await page.waitForTimeout(700);
  out.push(await probe('rail closed'));

  for (const o of out) log(JSON.stringify(o));
  const bad = out.filter(o => o.missing || (o.halfDrawn && o.halfDrawn.length) || o.overflow > 0 || o.spill > 1 || o.scrollH > o.vh);
  log('FAULTS ' + bad.length + ' ' + JSON.stringify(bad.map(b => b.tag)));
  log('ERRORS ' + JSON.stringify(errs));
};
