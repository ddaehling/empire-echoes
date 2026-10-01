/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const rd = () => { const l=document.querySelector('.legend'), b=document.querySelector('.byline');
    return {legend:l?l.innerText.replace(/\s+/g,' ').slice(0,600):null, byline:b?b.innerText.replace(/\s+/g,' ').slice(0,600):null}; };
  for (const y of [1957, 1963, 1948]) {
    await page.goto('http://localhost:8777/app/#year='+y, {waitUntil:'load'});
    await page.waitForTimeout(2500);
    await page.keyboard.press('h'); await page.waitForTimeout(1200);
    log('YEAR '+y+' (H on) ' + JSON.stringify(await page.evaluate(rd)));
    await shot('sil-'+y);
    await page.keyboard.press('h'); await page.waitForTimeout(400);
  }
};
