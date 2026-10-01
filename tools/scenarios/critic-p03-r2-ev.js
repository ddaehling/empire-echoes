/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const dm = await import('/app/js/core/data.js');
    const data = await dm.loadData();
    const scopes={}; for(const e of data.events) scopes[e.scope]=(scopes[e.scope]||0)+1;
    const ew = data.events.filter(e=>e.scope==='empire-wide').map(e=>e.year+' '+e.title);
    const has = (re)=>data.events.filter(e=>re.test(e.title)).map(e=>e.year+' '+e.title+' ['+e.scope+']');
    return {total:data.events.length, scopes, empireWide:ew.length, ewSample:ew.slice(0,10), amritsar:has(/Amritsar|Jallianwala/i), famine:has(/famine/i).slice(0,6), salt:has(/Salt/i)};
  });
  log(JSON.stringify(r,null,1));
};
