/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  const r = await page.evaluate(()=>{
    const want = ['united-arab-emirates','iran','turkey','vanuatu','new-hebrides','au-coral-sea-islands','tuvalu','ki-gilbert-islands','sri-lanka','ceylon','ghana','myanmar','zimbabwe','malawi','zambia','botswana','lesotho','belize','guyana'];
    const out=[];
    for (const w of want){ const e=document.getElementById('map-u-'+w); if(e) out.push(w+' :: '+e.getAttribute('aria-label')); }
    const all=[...document.querySelectorAll('.map__target')].map(e=>e.getAttribute('aria-label').split('.')[0]);
    return {out, sample: all.slice(0,0), total: all.length};
  });
  log('NAMES:', JSON.stringify(r,null,1));
  // check territory display names in data for period naming fields
  const dn = await page.evaluate(async ()=>{
    const mod = await import('/app/js/core/data.js'); const d = await mod.loadData();
    const ids=['iran','turkey','new-hebrides','united-arab-emirates','sri-lanka','ghana'];
    return ids.map(id=>{const t=d.byId.get(id); return t? {id, name:t.name, keys:Object.keys(t).filter(k=>/name|alias|period|then/i.test(k))} : {id, missing:true};});
  });
  log('TERR NAMES:', JSON.stringify(dn));
};
