/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=19',{waitUntil:'load'}); await page.waitForTimeout(2400);
  await page.evaluate(()=>{const b=document.querySelector('.viz-entry'); if(b)b.click();});
  await page.waitForTimeout(1800); await shot('viz-exits');
  log('VIZ>>'+await page.evaluate(()=>{const v=document.querySelector('[class*=viz]'); return v? v.innerText.replace(/\s+/g,' ').slice(0,2000):'none';}));
  await page.goto('http://localhost:8777/app/#tour=thirty&step=3',{waitUntil:'load'}); await page.waitForTimeout(2200);
  await page.evaluate(()=>{const b=document.querySelector('.viz-entry'); if(b)b.click();});
  await page.waitForTimeout(1800); await shot('viz-crops');
  log('VIZ3>>'+await page.evaluate(()=>{const v=document.querySelector('[class*=viz]'); return v? v.innerText.replace(/\s+/g,' ').slice(0,1800):'none';}));
};
