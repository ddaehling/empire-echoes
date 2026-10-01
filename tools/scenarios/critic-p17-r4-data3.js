/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const r = await page.evaluate(async () => {
    const out = {};
    try {
      const mod = await import('/app/js/core/data.js');
      const d = await mod.loadData();
      out.dkeys = Object.keys(d).slice(0,60);
      for (const y of [1783, 1900, 1913, 1922, 1947]) {
        const m = d.metricsAt(y);
        out['m'+y] = { units:m.units, territories:m.territories, byDegree:m.byDegree, keys:Object.keys(m),
          areaKeys: Object.keys(m).filter(k=>/area|km|pop/i.test(k)).map(k=>[k,m[k]]) };
      }
      out.statusesCount = d.statuses ? (Array.isArray(d.statuses)?d.statuses.length:Object.keys(d.statuses).length) : null;
      out.m1900full = d.metricsAt(1900);
    } catch (e) { out.err = String(e) + (e.stack||'').slice(0,400); }
    return JSON.parse(JSON.stringify(out));
  });
  log(JSON.stringify(r, null, 1).slice(0, 14000));
};
