/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** P08 — probe: compare the browser series with tools/audit-timeline.js. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  const out = await page.evaluate(async () => {
    const data = window.BEA.data;
    const mod = await import('/app/js/viz/series.js');
    const s = mod.buildSeries(data);
    const pick = (y) => { const r = s.at(y); return { y, high: r.extentHigh, low: r.extentLow, ruled: r.ruled, terr: r.territories, units: r.units }; };
    const years = [1600, 1700, 1783, 1815, 1850, 1900, 1914, 1918, 1922, 1939, 1947, 1948, 1960, 1997];
    /* what is in / out at 1947 vs 1922, by area */
    const at = (y) => data.statusAt(y);
    const a22 = at(1922), a47 = at(1947);
    const area = (u) => (data.unitMeta.get(u) || {}).area_km2 || 0;
    const lost = [];
    for (const [u, e] of a22) if (!a47.has(u)) lost.push([u, Math.round(area(u)), e.territoryId]);
    lost.sort((a, b) => b[1] - a[1]);
    return {
      peakLand: { year: s.peak.year, km2: s.peak.extentHigh },
      peakTerr: { year: s.peakTerr.year, n: s.peakTerr.territories },
      rows: years.map(pick),
      biggestLost1922to1947: lost.slice(0, 12),
      datasetPeak: (data.meta && data.meta.dataset && data.meta.dataset.peak) || null,
      canada1947: (() => { const e = a47.get('ca-ontario') || a47.get('canada'); return e ? { status: e.status, deg: e.controlDegree, to: e.span && e.span.to } : 'absent'; })(),
      canada1922: (() => { const e = a22.get('ca-ontario') || a22.get('canada'); return e ? { status: e.status, deg: e.controlDegree, to: e.span && e.span.to } : 'absent'; })(),
    };
  });
  log(JSON.stringify(out, null, 1));
};
