/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.route('**/js/tours/**', r => r.abort());
  await page.reload({waitUntil:'load'});
  await page.waitForTimeout(3000);
  const s = await page.evaluate(()=>{const e=document.querySelector('.tl-spine'); return e? e.innerText.slice(0,300):'MISSING';});
  log('spine with tours killed:', s);
  await shot('tours-killed');
};
