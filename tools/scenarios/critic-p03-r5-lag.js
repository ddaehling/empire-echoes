/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  for (const y of [2010, 2026, 2000, 2027, 1300, 1250, 1400]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(1200);
    log(y, JSON.stringify(await page.evaluate(()=>({year:document.querySelector('.tl__year').textContent, cap:document.querySelector('.tl-spine__caption')?.innerText}))));
  }
  await shot('lag');
};
