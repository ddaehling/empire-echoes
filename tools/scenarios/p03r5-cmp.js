/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1913&compare=1914'; });
  await page.waitForTimeout(600);
  log('state after compare=1914:', await page.evaluate(() => JSON.stringify({ cy: document.querySelector('.tl').__p03.store.getState().compareYear, hash: location.hash })));
  await page.evaluate(() => { location.hash = '#panel=close'; });
  await page.waitForTimeout(700);
  log('state after #panel=close:', await page.evaluate(() => JSON.stringify({ cy: document.querySelector('.tl').__p03.store.getState().compareYear, hash: location.hash, ghost: !document.querySelector('.tl-ax__ghost').hidden })));
  await page.evaluate(() => { location.hash = '#year=1900'; });
  await page.waitForTimeout(700);
  log('state after #year=1900:', await page.evaluate(() => JSON.stringify({ cy: document.querySelector('.tl').__p03.store.getState().compareYear, ghost: !document.querySelector('.tl-ax__ghost').hidden })));
};
