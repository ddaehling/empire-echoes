/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1922, 1857, 1765, 1834]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(800);
    await shot('y'+y);
    log('=== '+y+' ===', await page.evaluate(()=>{const e=document.querySelector('.tl'); return e?e.innerText.replace(/\n+/g,' | ').slice(0,1400):'none';}));
  }
};
