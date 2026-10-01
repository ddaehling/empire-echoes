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
    const m = await import('/app/js/core/data.js');
    const d = await m.loadData({});
    const out = {};
    const at = d.statusAt ? d.statusAt(1913) : null;
    if (at) {
      const vals = [...(at.values ? at.values() : Object.values(at))];
      const deg = {};
      for (const v of vals) { const k = v.controlDegree; deg[k] = (deg[k]||0)+1; }
      out.byDegree = deg;
      out.total = vals.length;
      out.informal = vals.filter(v=>v.status==='informal-sphere').length;
      out.claimed = vals.filter(v=>v.controlDegree>=1 && v.status!=='informal-sphere').length;
      out.administered = vals.filter(v=>v.controlDegree>=3 && v.status!=='informal-sphere').length;
      out.controlled = vals.filter(v=>v.controlDegree===5 && v.status!=='informal-sphere').length;
    }
    out.metrics = d.metricsAt ? Object.keys(d.metricsAt(1913)) : 'none';
    return out;
  });
  log('1913 truth:', JSON.stringify(r));
};
