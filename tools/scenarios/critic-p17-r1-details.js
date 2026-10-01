/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(500);
  await page.evaluate(()=>{ document.querySelectorAll('[data-mount="legend"] details').forEach(d=>d.open=true); });
  await page.waitForTimeout(400);
  const t = await page.evaluate(()=>document.querySelector('[data-mount="legend"]').innerText);
  log('EXPANDED LEGEND:\n'+t);
};
