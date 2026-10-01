/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const read = async () => await page.evaluate(() => {
    const c = document.querySelector('.map__plate');
    const st = window.BEA.store.getState();
    const painted = [...document.querySelectorAll('.map__target')].length;
    return {
      def: document.querySelector('.map').dataset.definition,
      proj: document.querySelector('.map').dataset.projection,
      year: st.year, layer: st.activeLayer,
      targets: painted,
      aria: (c && c.getAttribute('aria-label')||'').slice(0,240),
      byDegree: window.BEA.data.metricsAt(st.year).byDegree,
      byStatus: window.BEA.data.metricsAt(st.year).byStatus
    };
  });
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1913));
  await page.waitForTimeout(600);
  for (const key of ['1','2','3','4']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(1200);
    log('KEY '+key+' =>', JSON.stringify(await read()));
    await shot('def-'+key);
  }
};
