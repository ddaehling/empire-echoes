/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(900);
  const ids = await page.evaluate(()=>{
    const d = window.BEA.data||{};
    const keys = Object.keys(d);
    return {keys, n: (d.territories?Object.keys(d.territories).length:null)};
  });
  log('data keys '+JSON.stringify(ids).slice(0,400));
  const res = await page.evaluate(()=>{
    const d=window.BEA.data;
    const t = d.territories||d.byId||{};
    const want=['mysore','maratha','punjab','sikh','burma','nepal','bhutan','ajmer','assam','konbaung','lahore','gwalior'];
    const out=[];
    for (const [k,v] of Object.entries(t)) {
      const nm=((v.name||'')+' '+k).toLowerCase();
      if (!want.some(w=>nm.includes(w))) continue;
      (v.acquisitions||[]).forEach(a=>out.push({id:k, name:v.name, date:(a.date&&a.date.display)||'', mech:a.mechanism, how:(a.how||'').slice(0,120)}));
    }
    return out;
  });
  log('ACQ '+JSON.stringify(res,null,1));
};
