/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const D = mod.default || mod;
    const data = (typeof D.load === 'function') ? await D.load() : (D.create ? await D.create() : D);
    const keys = Object.keys(data);
    const out = { keys: keys.slice(0,40) };
    if (data.metricsAt) {
      const m = data.metricsAt(1900);
      out.m1900 = { units: m.units, territories: m.territories, controlledUnits: m.controlledUnits, byDegree: m.byDegree, byStatus: m.byStatus };
    }
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 8000));
};
