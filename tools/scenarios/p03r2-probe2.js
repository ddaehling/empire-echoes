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
    const d = window.BEA.data;
    const SOFT = new Set(['circa','contested','range','decade','century']);
    const soft = x => !!x && (x.circa === true || SOFT.has(x.precision));
    let spanCirca = 0, spanContested = 0, spanCircaEnd = 0;
    const spanYears = new Set();
    for (const s of d.spans) {
      if (s.circa) { spanCirca++; spanYears.add(s.start); }
      if (s.circaEnd && s.end != null) { spanCircaEnd++; spanYears.add(s.end); }
      if (s.contested) { spanContested++; spanYears.add(s.start); }
    }
    const softDateYears = new Set();
    for (const e of d.events) if (soft(e.date)) softDateYears.add(e.year);
    for (const a of d.acquisitions) if (soft(a.date)) softDateYears.add(a.year);
    for (const a of d.departures) if (soft(a.date)) softDateYears.add(a.year);
    const withPop = d.territories.filter(t => t.peak && Number(t.peak.population) > 0);
    const ev1858 = d.events.filter(e => e.year === 1858).map(e => [e.title, e.changedStatus, (e.summary||'').slice(0,90)]);
    const ev1942 = d.events.filter(e => e.year === 1942).map(e => [e.title, e.changedStatus]);
    return {
      statuses: d.statuses.map(s => ({ id: s.id, label: s.label, n: s.count, deg: s.controlDegree })),
      spanCirca, spanCircaEnd, spanContested, spanYearCount: spanYears.size,
      softDateYearCount: softDateYears.size,
      unionYears: new Set([...spanYears, ...softDateYears]).size,
      terrWithPop: withPop.length, terrTotal: d.territories.length,
      popSample: withPop.slice(0,3).map(t => [t.name, t.peak.population, t.peak.populationYear]),
      ev1858, ev1942,
      contestedAcq: d.acquisitions.filter(a=>a.contested && a.contested.isContested).length,
      contestedDep: d.departures.filter(a=>a.contested && a.contested.isContested).length,
      unitMetaSample: d.unitName('in-west-bengal'),
      areaSample: (d.unitMeta.get('in-west-bengal')||{}).area_km2,
    };
  });
  log(JSON.stringify(out, null, 1));
};
