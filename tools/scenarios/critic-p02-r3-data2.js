/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const d = await mod.loadData();
    const m = d.metricsAt(1913);
    const out = { byDegree: m.byDegree, units: m.units, territories: m.territories, controlledUnits: m.controlledUnits };
    // recompute counts per definition threshold
    const st = d.statusAt(1913);
    const arr = [...(st instanceof Map ? st.values() : Object.values(st))];
    out.n = arr.length;

    const deg = {};
    for (const e of arr) deg[e.controlDegree] = (deg[e.controlDegree]||0)+1;
    out.degTally = deg;
    out.informal = arr.filter(e=>e.status==='informal-sphere').length;
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0,3000));
};
