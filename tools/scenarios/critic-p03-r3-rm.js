/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(500);
  await shot('rm-start');
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  const s = await page.evaluate(() => window.BEA.store.getState());
  log('reduced-motion after Space 2.5s: year', s.year, 'playing', s.playing);
  await shot('rm-after');
  log('footer text:', await page.evaluate(() => document.querySelector('.tl, [class*="tl-root"], footer')?.innerText.slice(0,900)));
  // play button label
  log('play btn:', await page.evaluate(() => { const b=document.querySelector('.tl-btn--play'); return b? b.outerHTML.slice(0,400):'none'; }));
};
