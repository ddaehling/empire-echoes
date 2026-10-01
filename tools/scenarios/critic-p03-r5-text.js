/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const years = [1600, 1765, 1833, 1857, 1922, 1947, 1960, 1997, 2027];
  for (const y of years) {
    await page.evaluate((yy)=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(700);
    const t = await page.evaluate(() => document.querySelector('#timebar').innerText.replace(/\n{2,}/g,'\n'));
    log('===== '+y+' =====\n'+t);
  }
};
