/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  for (const y of [1900, 1913, 1922, 1955]) {
    await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(800);
    const l = await page.evaluate(() => window.BEA.map.plate.labelsDrawn.map(x => x.text));
    log(y + ' (' + l.length + ') ' + JSON.stringify(l));
    await shot('y' + y);
  }
};
