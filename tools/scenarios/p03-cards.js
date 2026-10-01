/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.textContent: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl');
  log('page height: ' + await page.evaluate(() => document.getElementById('app').getBoundingClientRect().height));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(300);
  await shot('whole-app');
  // stop card
  await page.evaluate(() => { window.BEA.store.batch(d => { d('setYear', 1946); d('setSpeed', 16); }); });
  await page.evaluate(() => window.BEA.store.dispatch('play'));
  await page.waitForFunction(() => !window.BEA.store.getState().playing, null, { timeout: 8000 }).catch(()=>{});
  await page.waitForTimeout(200);
  await shot('stopcard', '.tl__stopcard');
  log('stopcard: ' + await page.textContent('.tl__stopcard'));
  // popovers
  await page.click('.tl-lane[data-phase="dissolution"]');
  await page.waitForTimeout(200);
  await shot('phase-pop', '.tl__pop');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1835));
  await page.waitForTimeout(150);
  await page.click('.tl__warn');
  await page.waitForTimeout(200);
  await shot('date-pop', '.tl__pop');
  log('date-pop: ' + await page.textContent('.tl__pop'));
  // compare ghost
  await page.evaluate(() => window.BEA.store.batch(d => { d('setYear', 1750); d('setCompareYear', 1920); }));
  await page.waitForTimeout(200);
  await shot('compare', '.app__time');
};
