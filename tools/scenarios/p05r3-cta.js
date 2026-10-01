/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(1800);
  log('CTA: "' + await page.evaluate(() => (document.querySelector('.cx-cta') || {}).textContent || '(none)') + '"');
  log('lede: "' + await page.evaluate(() => (document.querySelector('.cx-lede__say') || {}).textContent || '') + '"');
  await shot('cold');
};
