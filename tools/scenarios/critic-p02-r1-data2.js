/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const dm = await import('/app/js/map/definition.js');
    const d = mod.default && mod.default.load ? await mod.default.load() : (mod.load ? await mod.load() : mod.default);
    const out = { dataKeys: Object.keys(d||{}).slice(0,60) };
    try {
      const m = d.metricsAt(1913);
      out.metrics1913 = { units:m.units, controlledUnits:m.controlledUnits, territories:m.territories, byDegree:m.byDegree, byStatusKeys:Object.keys(m.byStatus) };
      const sm = d.statusAt(1913);
      const meta = d.unitMeta;
      const res = {};
      for (const def of dm.DEFINITIONS) res[def.id] = dm.measure(sm, meta, def).units;
      out.defCounts = res;
      // informal-sphere degrees
      const degs = {};
      for (const e of sm.values()) if (e.status==='informal-sphere') degs[e.controlDegree]=(degs[e.controlDegree]||0)+1;
      out.informalDegrees = degs;
    } catch(e) { out.err = String(e); }
    return out;
  });
  log('R:', JSON.stringify(r, null, 1).slice(0,3000));
};
