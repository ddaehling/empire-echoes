/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const before = await page.evaluate(()=>document.documentElement.scrollHeight);
  log('docH before: '+before);
  // click a big unit on the map
  await page.evaluate(() => { location.hash = '#year=1900&sel=india'; });
  await page.waitForTimeout(2500);
  const after = await page.evaluate(()=>({h:document.documentElement.scrollHeight, legendY: Math.round(document.querySelector('[data-mount="legend"]').getBoundingClientRect().y)}));
  log('after: '+JSON.stringify(after));
  await shot('with-selection');
};
