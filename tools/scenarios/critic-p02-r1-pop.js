/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const dm = await import('/app/js/map/definition.js');
    const d = await mod.loadData();
    const sm = d.statusAt(1900);
    const mm = dm.measure(sm, d.unitMeta, dm.DEFINITIONS[0]);
    const rows = [];
    for (const id of mm.territoryIds) {
      const t = d.byId.get(id);
      const p = t && t.peak && t.peak.population;
      if (p) rows.push([id, p, t.peak.populationYear]);
    }
    rows.sort((a,b)=>b[1]-a[1]);
    return { total: rows.reduce((s,r)=>s+r[1],0), top: rows.slice(0,22), anachronistic: rows.filter(r=>r[2]>1910).length, anachRows: rows.filter(r=>r[2]>1910).slice(0,25) };
  });
  log('R:', JSON.stringify(r,null,1).slice(0,4000));
};
