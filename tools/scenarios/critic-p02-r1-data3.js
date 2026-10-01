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
    const d = await mod.loadData();
    const out = {};
    const m = d.metricsAt(1913);
    out.metrics1913 = { units:m.units, controlledUnits:m.controlledUnits, territories:m.territories, byDegree:m.byDegree };
    const sm = d.statusAt(1913);
    const res = {};
    for (const def of dm.DEFINITIONS) { const mm = dm.measure(sm, d.unitMeta, def); res[def.id] = {units:mm.units, terr:mm.territories, km2:mm.km2}; }
    out.defCounts = res;
    const degs = {}; const infIds=[];
    for (const e of sm.values()) if (e.status==='informal-sphere') { degs[e.controlDegree]=(degs[e.controlDegree]||0)+1; infIds.push(e.unitId); }
    out.informalDegrees = degs; out.informalIds = infIds;
    // 1900 too
    const sm00 = d.statusAt(1900);
    const res00 = {};
    for (const def of dm.DEFINITIONS) res00[def.id] = dm.measure(sm00, d.unitMeta, def).units;
    out.def1900 = res00;
    out.metrics1900byDegree = d.metricsAt(1900).byDegree;
    // population sanity
    const mm = dm.measure(sm00, d.unitMeta, dm.DEFINITIONS[0]);
    out.pop1900 = dm.population(mm.territoryIds, d);
    return out;
  });
  log('R:', JSON.stringify(r, null, 1).slice(0,4000));
};
