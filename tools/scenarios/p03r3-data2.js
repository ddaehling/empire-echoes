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
    const ev1919 = (tl.eventsByYear.get(1919)||[]).map(e=>({t:e.title,scope:e.scope,type:e.type,sum:(e.summary||'').slice(0,120),sig:(e.significance||'').slice(0,120),ev:(e.evidence||[]).length,src:(e.sources||[]).length,ped:e.pedagogy?Object.keys(e.pedagogy):null,terr:e.territoryIds,date:e.date}));
    const oneEv = d.events.find(e=>e.year===1919);
    // 1942 diff
    const a = d.statusAt(1941), b = d.statusAt(1942);
    const changes=[];
    for (const [u,e] of b) { const p=a.get(u); if(!p) changes.push({u,to:e.status,deg:e.controlDegree,terr:e.territoryId,kind:'in'});
      else if (p.status!==e.status||p.territoryId!==e.territoryId) changes.push({u,from:p.status,to:e.status,fdeg:p.controlDegree,deg:e.controlDegree,ft:p.territoryId,terr:e.territoryId,kind:'shift'}); }
    for (const [u,p] of a) { if(!b.has(u)) changes.push({u,from:p.status,fdeg:p.controlDegree,terr:p.territoryId,kind:'gone'}); }
    const dep1942 = d.departures.filter(r=>r.year===1942).map(r=>({t:r.territoryId,m:r.mechanism,units:r.units,date:r.date&&r.date.display,how:(r.how||'').slice(0,90)}));
    const acq1942 = d.acquisitions.filter(r=>r.year===1942).map(r=>({t:r.territoryId,m:r.mechanism,units:r.units}));
    const ev1942 = (tl.eventsByYear.get(1942)||[]).map(e=>({t:e.title,ch:e.changedStatus,units:(e.unitIds||[]).length,terr:e.territoryIds}));
    // 1997
    const s97=d.statusAt(1997), s98=d.statusAt(1998);
    const hk=[...s97.entries()].filter(([u])=>/hk|hong/.test(u)).map(([u,e])=>({u,st:e.status,deg:e.controlDegree}));
    const hk98=[...s98.entries()].filter(([u])=>/hk|hong/.test(u)).map(([u,e])=>({u,st:e.status,deg:e.controlDegree}));
    return { ev1919, oneEvSample: oneEv? {evidence:oneEv.evidence, sources:oneEv.sources, pedagogy:oneEv.pedagogy, links:oneEv.links, people:oneEv.people}:null,
      changes1942: changes.slice(0,40), n1942: changes.length, dep1942, acq1942, ev1942, hk, hk98 };
  });
  log(JSON.stringify(out, null, 1));
};
