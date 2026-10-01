/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  log('motion attr:', await page.evaluate(() => document.documentElement.dataset.motion));
  log('play word:', await page.evaluate(() => document.querySelector('.tl-btn__word').textContent));
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.setYear(1856); });
  await page.waitForTimeout(300);
  await page.click('.tl-btn--play');
  await page.waitForTimeout(600);
  log('after pressing play under reduced motion — playing?', await page.evaluate(() => window.BEA.store.getState().playing), 'year', await page.evaluate(() => window.BEA.store.getState().year));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(400);
  await page.click('.tl-chg');
  await page.waitForTimeout(500);
  await shot('rm-pop');
};
