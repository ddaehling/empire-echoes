/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(400);
  await shot('1820-three-engines');
  log('stage closed-drawer:', await page.evaluate(() => Math.round(document.querySelector('#stage').getBoundingClientRect().height)));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1922));
  await page.waitForTimeout(400);
  await shot('1922');
  log('1922 row:', await page.evaluate(() => document.querySelector('.tl__changes').innerText.replace(/\n/g,' | ').slice(0, 1100)));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1941));
  await page.waitForTimeout(400);
  await shot('1941');
  log('1941 row:', await page.evaluate(() => document.querySelector('.tl__changes').innerText.replace(/\n/g,' | ').slice(0, 700)));
};
