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
    const data = await mod.loadData();
    const out = {};
    const m = data.metricsAt(1900);
    out.units = m.units; out.territories = m.territories; out.controlledUnits = m.controlledUnits;
    out.byDegree = m.byDegree;
    out.byStatus = m.byStatus;
    // area sum for claimed at 1900
    const st = data.statusAt(1900);
    let areaClaimed = 0, nClaimed = 0, areaAdmin = 0, nAdmin = 0;
    for (const [id, s] of Object.entries(st)) {
      const meta = data.unitMeta ? data.unitMeta[id] : null;
      const deg = s.controlDegree;
      const informal = s.status === 'informal-sphere';
      if (deg >= 1 && !informal) { nClaimed++; areaClaimed += (meta && meta.area_km2) || 0; }
      if (deg >= 3 && !informal) { nAdmin++; areaAdmin += (meta && meta.area_km2) || 0; }
    }
    out.computed = { nClaimed, areaClaimed: Math.round(areaClaimed), nAdmin, areaAdmin: Math.round(areaAdmin), pct: Math.round(areaAdmin/areaClaimed*100) };
    // barbados
    out.barbados = data.unitMeta && (data.unitMeta['barbados'] || Object.entries(data.unitMeta).filter(([k])=>/barbado/i.test(k)).slice(0,3));
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 8000));
};
