/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(500);
  await page.evaluate(() => { const m = window.__map; m.plate.setProjectionState('equal-earth', 'mercator', 0.5); m.plate.draw(); });
  await shot('mid-morph-t05');
  await page.evaluate(() => { const m = window.__map; m.plate.setProjectionState('equal-earth', 'equal-earth', 1); m.plate._pathSig=''; m.plate._baseSig=''; m.plate.draw(); });
  await page.waitForTimeout(200);
  await shot('after-morph-restored');
  log('ok');
};
