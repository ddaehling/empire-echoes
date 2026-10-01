/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const rd = (page) => page.evaluate(()=>{ const b=document.querySelector('.byline'); return b&&b.innerText.replace(/\n/g,' | '); });
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.keyboard.press('w'); await page.waitForTimeout(1500);
  log('WEIGHT ON at 1900: ' + await rd(page));
  await page.evaluate(()=>{location.hash='#year=1620';}); await page.waitForTimeout(1800);
  log('SAME MODE at 1620:  ' + await rd(page));
  await page.evaluate(()=>{location.hash='#year=1750';}); await page.waitForTimeout(1800);
  log('SAME MODE at 1750:  ' + await rd(page));
  await page.keyboard.press('w'); await page.waitForTimeout(900);
  await page.keyboard.press('w'); await page.waitForTimeout(1500);
  log('RETOGGLED at 1750:  ' + await rd(page));
  await shot('stale');
};
