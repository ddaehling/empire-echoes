/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(4000);
  log('fresh docH=' + await page.evaluate(()=>document.documentElement.scrollHeight));
  log('legend visible? ' + await page.evaluate(()=>{const r=document.querySelector('[data-mount="legend"]').getBoundingClientRect(); return r.y+' / vh '+innerHeight;}));
  // A student clicks the map
  await page.mouse.click(700, 450);
  await page.waitForTimeout(1500);
  log('after click docH=' + await page.evaluate(()=>document.documentElement.scrollHeight));
  await shot('after-click');
  // hover/press keys without any click
};
