/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(async () => {
    const d = await import('/app/js/core/data.js');
    const data = await d.loadData();
    const st = data.statusAt(1900);
    const arr = Array.isArray(st)? st : Object.values(st);
    const sample = arr.slice(0,3);
    // metrics on unitMeta?
    const um = data.unitMeta;
    const k = Object.keys(um)[0];
    return { statusSample: sample, unitMetaKeys: Object.keys(um[k]||{}), n: arr.length,
      metricsList: data.metrics ? 'yes':'no' };
  });
  log(JSON.stringify(r, null, 1).slice(0,3000));
};
