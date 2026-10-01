/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('s'); await page.waitForTimeout(2200);
  await page.keyboard.press('e'); await page.waitForTimeout(2000);
  await shot('stitch-big');
  log('TEXT:\n' + (await page.evaluate(()=>document.body.innerText)).slice(0,2200));
  // criticism panel
  await page.keyboard.press('e'); await page.waitForTimeout(1200);
  const crit = await page.$('.byline__crit');
  if (crit) { await crit.click(); await page.waitForTimeout(1500); await shot('criticism'); 
    log('CRIT TEXT:\n' + await page.evaluate(()=>{const e=document.querySelector('.byline'); return e?e.innerText:'';})); }
  else log('no crit button');
};
