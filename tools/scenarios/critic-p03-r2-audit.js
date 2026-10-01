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
    const out = { years: def.years.size, totalGroups:0, notRecorded:0, noHow:0, examples:[], byYear:{} };
    const sample = [];
    for (const [y, rec] of def.years) {
      for (const g of rec.groups) {
        out.totalGroups++;
        const t = (g.mech || '') + ' | ' + (g.subject||'');
        if (/mechanism not recorded/.test(g.mech||'')) { out.notRecorded++; sample.push(y+': '+g.subject+' — '+g.mech + (g.how? ' [HAS how: '+String(g.how).slice(0,60)+'…]':' [no how]')); }
        if (!g.how) out.noHow++;
      }
    }
    out.examples = sample.slice(0, 60);
    out.sampleCount = sample.length;
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 8000));
};
