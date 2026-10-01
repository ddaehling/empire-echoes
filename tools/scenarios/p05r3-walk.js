/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05r3-walk.js — walk the whole path and report what the rail actually shows. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1300);
  await page.evaluate(() => window.BEA.bus.emit('tours:start', {}));
  await page.waitForTimeout(800);
  const rows = [];
  for (let i = 0; i < 26; i++) {
    const st = await page.evaluate(() => ({
      count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
      title: (document.querySelector('.cx-sheet__title') || {}).textContent || '(none)',
      panel: !!document.querySelector('.tr-panel'),
      gate: !!document.querySelector('.tr-gate'),
      quiz: !!document.querySelector('.qz-cp, .qz-check'),
      years: document.querySelectorAll('.tr-years__b').length,
      pressure: (window.BEA.store.getState().filters || {}).pressure || '(auto)',
      year: window.BEA.store.getState().year,
      locked: !!(document.querySelector('.tr-bar__next') || {}).disabled,
    }));
    rows.push(st.count.padEnd(11) + ' ' + (st.panel ? 'panel' : st.gate ? 'gate ' : st.quiz ? 'quiz ' : '?????') + ' yr=' + String(st.year).padEnd(5) + ' pressure=' + st.pressure.padEnd(6) + ' years=' + st.years + '  ' + st.title.slice(0, 46));
    if (st.gate) { await page.evaluate(() => document.querySelector('.tr-field__cell')?.click()); await page.waitForTimeout(250); }
    const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled) return false; n.click(); return true; });
    if (!moved) break;
    await page.waitForTimeout(500);
  }
  log(rows.join('\n'));
};
