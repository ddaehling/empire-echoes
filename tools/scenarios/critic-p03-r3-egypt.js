/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(()=>window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(1000);
  await shot('egypt1882');
  log('row:', await page.evaluate(()=>document.querySelector('.tl')?.innerText.replace(/\n+/g,' | ').slice(0,1200)));
  log('cards:', await page.evaluate(()=>[...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].map(c=>c.getAttribute('aria-label')).join(' || ').slice(0,1200)));
};
