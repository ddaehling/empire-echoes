/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const out = await page.evaluate(() => {
    const d = window.BEA.data, tl = d.timeline();
    const cuts = tl.cuts;
    const t0 = performance.now();
    const DEFS = {
      claimed: e => e.controlDegree >= 1 && e.status !== 'informal-sphere',
      administered: e => e.controlDegree >= 3,
      controlled: e => e.controlDegree === 5,
      influenced: e => e.controlDegree >= 1 || e.status === 'informal-sphere',
    };
    function diffs(test) {
      const out = new Map();
      let prev = new Map();
      for (const c of cuts) {
        const seg = d.statusAt(c);
        const cur = new Map();
        for (const [u, e] of seg) if (test(e)) cur.set(u, e);
        const rows = [];
        for (const [u, e] of cur) {
          const p = prev.get(u);
          if (!p) rows.push(['in', u, e.territoryId, e.status]);
          else if (p.territoryId !== e.territoryId || p.status !== e.status) rows.push(['shift', u, p.territoryId + '/' + p.status + ' -> ' + e.territoryId + '/' + e.status]);
        }
        for (const [u, e] of prev) if (!cur.has(u)) rows.push(['out', u, e.territoryId, e.status]);
        if (rows.length) out.set(c, rows);
        prev = cur;
      }
      return out;
    }
    const dc = diffs(DEFS.claimed);
    const ms = performance.now() - t0;
    const pick = y => (dc.get(y) || []).map(r => r.join(' | '));
    const sizes = [...dc.entries()].map(([y, r]) => [y, r.length]).sort((a,b)=>b[1]-a[1]).slice(0,15);
    // records at some years
    const recAt = y => ({
      acq: d.acquisitions.filter(a => a.year === y).map(a => ({id:a.id, t:a.territoryName, m:a.mechanism, u:a.units})),
      dep: d.departures.filter(a => a.year === y).map(a => ({id:a.id, t:a.territoryName, m:a.mechanism, u:a.units, b:(a.becomes||[]).map(x=>x.name)})),
    });
    return {
      cuts: cuts.length, min: tl.min, max: tl.max, buildMs: Math.round(ms),
      changeYears: dc.size, biggest: sizes,
      y1858: pick(1858), y1942: pick(1942), y1945: pick(1945), y1947: pick(1947).slice(0,30), y1948: pick(1948),
      rec1945: recAt(1945), rec1942: recAt(1942), rec1948: recAt(1948),
      n1947: (dc.get(1947)||[]).length,
      acqNoUnits: d.acquisitions.filter(a=>!a.units||!a.units.length).length,
      depNoUnits: d.departures.filter(a=>!a.units||!a.units.length).length,
      statuses: d.statuses.map(s=>s.id+':'+s.count),
    };
  });
  log(JSON.stringify(out, null, 1));
};
