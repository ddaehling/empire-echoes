/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')].find(x=>/Teaching desk/.test(x.innerText||'')); if(b)b.click();});
  await page.waitForTimeout(1800);
  await shot('desk');
  log((await page.evaluate(()=>document.body.innerText)).slice(0,4000));
};
