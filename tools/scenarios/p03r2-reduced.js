/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1856));
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => window.BEA.store.getState().year);
  await page.locator('.tl-btn--play').click();
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({ year: window.BEA.store.getState().year, playing: window.BEA.store.getState().playing,
    motion: document.documentElement.dataset.motion, live: (document.getElementById('live-status') || {}).textContent }));
  log('reduced motion: from ' + before + ' -> ' + JSON.stringify(after));
};
