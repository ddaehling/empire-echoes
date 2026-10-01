/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const s = await page.evaluate(()=>{ const d=window.BEA.data; const g=d.get?d.get('silences'):null; return g? (Array.isArray(g)?g:Object.keys(g)) : Object.keys(d); });
  log('silences raw:', JSON.stringify(s).slice(0,1500));
  const s2 = await page.evaluate(()=>{ try { const arr = window.BEA.data.get('silences'); return arr.map(x=>({id:x.id, units:x.units||x.unitIds, agent:x.agent, year:x.year, title:x.title||x.label, kind:x.kind})); } catch(e){ return String(e); } });
  log('SIL:', JSON.stringify(s2, null, 1).slice(0,3000));
};
