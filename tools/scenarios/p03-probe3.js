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
    const withContested = d.events.filter(e => e.contested);
    const rows = [];
    for (let y = tl.min + 1; y <= tl.max; y++) {
      const dlt = tl.unitsByYear[y - tl.min] - tl.unitsByYear[y - 1 - tl.min];
      if (dlt) rows.push([y, dlt, tl.unitsByYear[y - tl.min]]);
    }
    const byMag = rows.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 12);
    let peak = { y: 0, n: -1 };
    for (let y = tl.min; y <= tl.max; y++) { const n = tl.unitsByYear[y - tl.min]; if (n > peak.n) peak = { y, n }; }
    const acqMech = {}, depMech = {};
    for (const a of d.acquisitions) acqMech[a.mechanism] = (acqMech[a.mechanism] || 0) + 1;
    for (const a of d.departures) depMech[a.mechanism] = (depMech[a.mechanism] || 0) + 1;
    const softP = p => p && p !== 'exact';
    const dateSoft = e => e.date && (e.date.circa || softP(e.date.precision));
    return {
      contestedShape: withContested.slice(0, 3).map(e => ({ id: e.id, contested: e.contested })),
      contestedCount: withContested.length,
      dateSoftEvents: d.events.filter(dateSoft).length,
      dateSoftNoNote: d.events.filter(e => dateSoft(e) && !(e.date && e.date.note)).length,
      circaEvents: d.events.filter(e => e.date && e.date.circa).map(e => [e.year, e.title, e.date.precision, e.date.note]),
      rangePrecEvents: d.events.filter(e => e.date && e.date.precision === 'range').map(e => [e.year, e.title, e.date.note]),
      contestedPrecEvents: d.events.filter(e => e.date && e.date.precision === 'contested').map(e => [e.year, e.title, e.date.note]),
      acqSoft: d.acquisitions.filter(a => a.date && (a.date.circa || softP(a.date.precision) && a.date.precision !== 'year')).map(a => [a.year, a.territoryId, a.date.precision, a.date.note]),
      depSoft: d.departures.filter(a => a.date && (a.date.circa || softP(a.date.precision) && a.date.precision !== 'year')).map(a => [a.year, a.territoryId, a.date.precision, a.date.note]),
      biggestChanges: byMag, changeYears: rows.length,
      peak, min1: tl.unitsByYear[0],
      acqMech, depMech,
      acqKeys: Object.keys(d.acquisitions[0]), depKeys: Object.keys(d.departures[0]),
      acqSample: { year: d.acquisitions[40].year, mech: d.acquisitions[40].mechanism, tid: d.acquisitions[40].territoryId, tname: d.acquisitions[40].territoryName, how: (d.acquisitions[40].how||'').slice(0,80) },
      depSample: { year: d.departures[10].year, mech: d.departures[10].mechanism, tid: d.departures[10].territoryId, tname: d.departures[10].territoryName },
      pre1600: [...d.statusAt(1599).values()].map(v => v.unitId + '/' + v.territoryId),
      at1200: [...d.statusAt(1200).values()].map(v => v.unitId + '/' + v.territoryId),
      empireWide: d.events.filter(e => e.scope === 'empire-wide').map(e => [e.year, e.title]),
    };
  });
  log(JSON.stringify(out, null, 1));
};
