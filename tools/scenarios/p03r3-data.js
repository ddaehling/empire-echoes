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
    const tl = d.timeline();
    const cuts = tl.cuts;
    const evYears = [...tl.eventsByYear.keys()].sort((a,b)=>a-b);
    const depYears = d.departures.map(r=>r.year);
    const acqYears = d.acquisitions.map(r=>r.year);
    const setC = new Set(cuts);
    const depNotCut = [...new Set(depYears.filter(y=>!setC.has(y)))].sort((a,b)=>a-b);
    const acqNotCut = [...new Set(acqYears.filter(y=>!setC.has(y)))].sort((a,b)=>a-b);
    const scopes = {};
    for (const e of d.events) scopes[e.scope] = (scopes[e.scope]||0)+1;
    const evKeys = Object.keys(d.events[0]||{});
    const sample = d.events.filter(e=>[1919,1930,1943,1845,1857].includes(e.year)).map(e=>({y:e.year,t:e.title,scope:e.scope,type:e.type,ch:e.changedStatus,sum:(e.summary||'').slice(0,80),sig:(e.significance||'').slice(0,60), terr:(e.territoryIds||[]).slice(0,3), units:(e.unitIds||[]).length, date:e.date&&e.date.display, sources:(e.sources||e.evidence||[]).length}));
    const dep1997 = d.departures.filter(r=>r.year===1997).map(r=>({t:r.territoryId,m:r.mechanism,units:r.units,date:r.date&&r.date.display}));
    const dep1947 = d.departures.filter(r=>r.year===1947).map(r=>({t:r.territoryId,m:r.mechanism,n:(r.units||[]).length,date:r.date&&r.date.display}));
    const depKeys = Object.keys(d.departures[0]||{});
    const acqKeys = Object.keys(d.acquisitions[0]||{});
    return {
      counts: { cuts: cuts.length, events: d.events.length, dep: d.departures.length, acq: d.acquisitions.length, evYears: evYears.length },
      cutsHead: cuts.slice(0,12), cutsTail: cuts.slice(-14),
      has1997: setC.has(1997), has1947: setC.has(1947), has1948: setC.has(1948),
      depNotCut, acqNotCut: acqNotCut.slice(0,60),
      scopes, evKeys, depKeys, acqKeys, sample, dep1997, dep1947,
      bounds: d.bounds,
    };
  });
  log(JSON.stringify(out, null, 1));
};
