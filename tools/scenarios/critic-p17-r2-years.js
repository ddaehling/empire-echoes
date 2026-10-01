/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1600, 1700, 1783, 1857, 1913, 1922, 1947, 1997, 2023]) {
    await page.evaluate(y => window.BEA.store.dispatch('setYear', y), y);
    await page.waitForTimeout(700);
    const o = await page.evaluate(y => {
      const m = window.BEA.data.metricsAt(y);
      return {
        rule: document.querySelector('.legend__rulebox')?.innerText.replace(/\n+/g,' | '),
        expUnits: m.controlledUnits, expTerr: m.territories, allUnits: m.units,
      };
    }, y);
    log(y, '| expected controlledUnits='+o.expUnits+' territories='+o.expTerr+' allUnits='+o.allUnits);
    log('   ', o.rule);
  }
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1922));
  await page.waitForTimeout(800);
  await shot('1922');
  // expand the totals details
  const t = await page.evaluate(()=>{ const ds=[...document.querySelectorAll('.legend__det')]; ds.forEach(d=>d.open=true); return ds.map(d=>d.innerText).join('\n\n=====\n\n'); });
  log('DETAILS:\n'+t);
};
