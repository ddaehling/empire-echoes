/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1600));
  await page.waitForTimeout(300);
  await page.focus('.tl-ax__rail');
  for (let i = 0; i < 397; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  log('397 presses -> ' + JSON.stringify(await page.evaluate(() => ({ y: window.BEA.store.getState().year, hash: location.hash }))));
};
