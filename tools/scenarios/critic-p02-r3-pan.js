/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1922');
  await page.waitForTimeout(3200);
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(400); }
  await shot('1922-default');
  // drag to bring canada into view
  await page.mouse.move(700, 300); await page.mouse.down(); await page.mouse.move(700, 480, {steps:12}); await page.mouse.up();
  await page.waitForTimeout(900);
  await shot('1922-panned');
  log('view hash:', await page.evaluate(()=>location.hash));
  // zoom in on India
  for (let i=0;i<3;i++){ await page.click('.map__zoom'); await page.waitForTimeout(500); }
  await shot('1922-zoomed');
  log('view hash2:', await page.evaluate(()=>location.hash));
};
