/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const y of [1955, 1965, 1975, 1990]) {
    await page.goto('http://localhost:8777/app/#year='+y,{waitUntil:'load'}); await page.waitForTimeout(2200);
    await page.keyboard.press('h'); await page.waitForTimeout(1300);
    const r = await page.evaluate(()=>[...document.querySelectorAll('.map__target')].map(e=>e.getAttribute('aria-label')||'').filter(a=>/silence/i.test(a)));
    log('Y'+y+' silences n='+r.length+' :: '+JSON.stringify(r).slice(0,1400));
  }
};
