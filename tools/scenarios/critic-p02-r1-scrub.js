/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1600', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const t0 = Date.now();
  for (let y=1600; y<=1997; y+=7) {
    await page.evaluate((yy)=>{ location.hash = location.hash.replace(/year=\d+/, 'year='+yy); }, y);
    await page.waitForTimeout(30);
  }
  log('scrub elapsed ms', Date.now()-t0);
  await page.waitForTimeout(1200);
  log('final', await page.evaluate(()=>document.querySelector('.map__plate').getAttribute('aria-label')));
  await shot('after-scrub');
};
