/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.boundingBox: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(400);
  await shot('m-1882');
  log('spine present:', await page.evaluate(() => !!document.querySelector('.tl-spine__track')));
  log('play word:', await page.evaluate(() => document.querySelector('.tl-btn__word').textContent));
  const b = await page.locator('.tl-chg').first().boundingBox();
  log('card box:', JSON.stringify(b));
  await page.click('.tl-chg');
  await page.waitForTimeout(500);
  await shot('m-pop');
  log('stage:', await page.evaluate(() => JSON.stringify(document.querySelector('#stage').getBoundingClientRect())));
  log('body scrollWidth vs clientWidth:', await page.evaluate(() => document.documentElement.scrollWidth + ' / ' + document.documentElement.clientWidth));
};
