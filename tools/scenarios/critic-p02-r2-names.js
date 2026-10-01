/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{location.hash='#year=1913';});
  await page.waitForTimeout(1500);
  const ids = ['cy-akrotiri-dhekelia','cyprus','ke-kenya','bw-bechuanaland','vu-new-hebrides','za-transvaal','ng-northern-nigeria','iran','turkey','ar-buenos-aires'];
  const r = await page.evaluate((ids)=>{
    const out={};
    for (const id of ids) {
      const el=[...document.querySelectorAll('.map__target')].find(e=>e.dataset.unit===id||e.dataset.unit.includes(id.split('-').pop()));
      out[id]= el? {u:el.dataset.unit, a:el.getAttribute('aria-label')} : null;
    }
    return out;
  }, ids);
  log(JSON.stringify(r, null, 1));
};
