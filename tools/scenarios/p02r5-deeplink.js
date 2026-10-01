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
  for (const def of ['claimed', 'administered', 'controlled', 'influenced']) {
    await page.evaluate(d => { location.hash = 'year=1913&def=' + d; }, def);
    await page.waitForTimeout(900);
    log(def + ' ' + JSON.stringify(await page.evaluate(() => {
      const m = window.BEA.map;
      return { def: m.definition, painted: [...m.plate.paint.keys()].filter(k => m.plate.paint.get(k).entry).length,
        year: window.BEA.store.getState().year, hash: location.hash };
    })));
  }
  await shot('deeplink');
};
