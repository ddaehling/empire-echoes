/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.tl__warn');
  await page.waitForTimeout(900);
  await page.evaluate(() => { const d=document.querySelector('.tl__drawer-scroll'); if(d) d.scrollIntoView({block:'center'}); window.scrollBy(0,700); });
  await page.waitForTimeout(600);
  await shot('disputed-1');
  log('TEXT:', await page.evaluate(()=>{const d=document.querySelector('.tl__drawer-scroll')||document.querySelector('[class*="drawer"]'); return d?d.innerText.slice(0,3500):'none';}));
};
