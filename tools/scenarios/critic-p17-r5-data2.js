/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const out = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js');
    const keys = Object.keys(mod);
    let d = null;
    for (const k of keys) { if (typeof mod[k] === 'function' && /load|create|init/i.test(k)) { try { d = await mod[k](); } catch(e){} } }
    if (!d && mod.data) d = mod.data;
    if (!d && mod.default) d = mod.default;
    const res = { modKeys: keys, ok: !!(d && d.metricsAt) };
    if (d && d.metricsAt) {
      const m = d.metricsAt(1900);
      res.m1900 = { units: m.units, territories: m.territories, byDegree: m.byDegree, keys: Object.keys(m) };
      res.pop = typeof d.populationAt === 'function' ? d.populationAt(1900) : 'no populationAt';
      res.unitMeta = d.unitMeta ? d.unitMeta.size : null;
      let km2 = 0; let n=0;
      const st = d.statusAt ? d.statusAt(1900) : null;
      res.statusAtType = st ? (st.constructor && st.constructor.name) : 'none';
    }
    return res;
  });
  log(JSON.stringify(out, null, 1).slice(0, 4000));
};
