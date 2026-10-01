/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot }) => {
  await page.waitForTimeout(2800);
  await shot('full');
  await shot('key', '.stage__key');
  await page.evaluate(() => window.BEA.store.dispatch('setFilter', { stage: 'apparatus' }));
  await page.waitForTimeout(700);
  await shot('key-apparatus', '.stage__key');
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(900);
  await shot('sheet-open');
  await shot('key-rail', '.stage__key');
};
