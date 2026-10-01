/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05r3-variants.js — the three runs of DIDACTIC §8.2 are three different runs. */
module.exports = async ({ page, log }) => {
  const base = 'http://localhost:8777/app/';
  for (const v of ['eight', 'thirty', 'sixty']) {
    await page.goto('about:blank');
    await page.goto(base + '#tour=' + v + '&step=1', { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
    await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
    await page.waitForTimeout(1400);
    const rows = [];
    for (let i = 0; i < 30; i++) {
      const st = await page.evaluate(() => ({
        count: (document.querySelector('.tr-bar__count') || {}).textContent || '',
        title: (document.querySelector('.cx-sheet__title') || {}).textContent || '(none)',
        essay: document.querySelectorAll('.tr-essay--inline').length,
        gate: !!document.querySelector('.tr-field'),
      }));
      rows.push(st.count.trim() + ' ' + st.title.slice(0, 34) + (st.essay ? ' +ESSAY' : ''));
      if (st.gate) { await page.evaluate(() => document.querySelector('.tr-field__cell')?.click()); await page.waitForTimeout(200); }
      const moved = await page.evaluate(() => { const n = document.querySelector('.tr-bar__next'); if (!n || n.disabled || n.hidden) return false; n.click(); return true; });
      if (!moved) break;
      await page.waitForTimeout(420);
    }
    log(v + ':  ' + rows.join(' | '));
  }
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  log('the opening control says: ' + await page.evaluate(() => (document.querySelector('.cx-cta') || {}).textContent || '(none)'));
};
