/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const U = 'http://localhost:8777/app/';
  await page.goto(U, { waitUntil: 'load' }); await page.waitForTimeout(2600);
  await shot('a-plate');
  await page.evaluate(() => window.BEA.store.dispatch('select', 'bengal-presidency'));
  await page.waitForTimeout(1400); await shot('b-selected');
  await page.goto(U + '#filter=stage:apparatus', { waitUntil: 'load' }); await page.waitForTimeout(2600);
  await shot('c-apparatus');
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(1200); await shot('d-sheet');
  await page.evaluate(() => window.BEA.legend.openPlate('criticism'));
  await page.waitForTimeout(1000); await shot('e-criticism');
  await page.goto(U + '#year=1783', { waitUntil: 'load' }); await page.waitForTimeout(2600);
  await shot('f-1783');
  log('done');
};
