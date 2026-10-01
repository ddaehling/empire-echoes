/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const out = await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const d = window.BEA.data;
    const tl = d.timeline();
    const recYears = new Set();
    for (const a of d.acquisitions) recYears.add(a.year);
    for (const x of d.departures) recYears.add(x.year);
    const evYears = new Set(tl.eventsByYear.keys());
    const groupYears = [];
    for (const [y, r] of p.def.years) if (r.groups.length) groupYears.push(y);
    // density from 1908
    const chain = (list, from, n) => { const s = [...list].sort((a,b)=>a-b); const out=[]; let c=from; for(let i=0;i<n;i++){ const nx=s.find(y=>y>c); if(nx==null)break; out.push(nx); c=nx;} return out; };
    const union = new Set([...recYears, ...evYears]);
    const bigYears = groupYears.filter(y => (p.def.years.get(y).unitsChanged) >= 3);
    return {
      cuts: tl.cuts.length, changeYears: p.def.changeYears.length,
      recYears: recYears.size, evYears: evYears.size, union: union.size,
      groupYears: groupYears.length,
      chainCuts: chain(p.def.changeYears, 1908, 10),
      chainRec: chain(recYears, 1908, 10),
      chainUnion: chain(union, 1908, 10),
      chainGroups: chain(groupYears, 1908, 10),
      chainBig: chain(bigYears, 1908, 10),
      bounds: p.bounds, storyYears: p.storyYears.length,
      evOffChain: [...evYears].filter(y => !p.def.changeYears.includes(y)).length,
    };
  });
  log(JSON.stringify(out, null, 1));
};
