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
    const [dm, cm] = await Promise.all([import('/app/js/core/data.js'), import('/app/js/timeline/changes.js')]);
    const data = await dm.loadData();
    const model = cm.createChangeModel(data);
    const def = model.forDefinition('claimed', (e)=> e.controlDegree>=1 && e.status!=='informal-sphere', 'claimed');
    const tl = data.timeline();
    let empty=0, tot=0, emptyWithEvents=0;
    const evYears = tl.eventsByYear;
    const emptyButEventful=[];
    for (let y=1750;y<=1997;y++){ tot++; if(!def.years.has(y)) { empty++; const ev=evYears.get(y); if(ev&&ev.length){ emptyWithEvents++; if(emptyButEventful.length<14) emptyButEventful.push(y+': '+ev.map(e=>e.title).slice(0,2).join(' / ')); } } }
    return {range:'1750-1997', tot, empty, pct:(100*empty/tot).toFixed(0)+'%', emptyWithEvents, examples:emptyButEventful};
  });
  log(JSON.stringify(r,null,1));
};
