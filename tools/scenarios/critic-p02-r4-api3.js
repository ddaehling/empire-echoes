/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const s = await page.evaluate(() => {
    const data = window.BEA.data;
    const m = data.statusAt(1900);
    const pick = st => st ? {status:st.status, cd:st.controlDegree, partial:st.partial, since:st.since, circa:st.circa} : null;
    const ids = ['us-florida','hawaii','reunion','id-maluku','pitcairn-islands','cn-weihaiwei','anguilla','in-bengal','gibraltar'];
    const res = {}; ids.forEach(id => res[id] = pick(m.get(id)));
    const mm = data.metricsAt(1900);
    return {size: m.size, res, byDegree: mm.byDegree, units: mm.units, territories: mm.territories, byStatus: mm.byStatus};
  });
  log('S:', JSON.stringify(s, null, 1).slice(0,4000));
  const drawn = await page.evaluate(() => {
    const t = [...document.querySelectorAll('.map__target')];
    return t.filter(x=>['us-florida','hawaii','reunion','pitcairn-islands','anguilla','cn-weihaiwei'].includes(x.dataset.unit))
      .map(x=>({id:x.dataset.unit, aria:x.getAttribute('aria-label'), cls:x.className}));
  });
  log('DRAWN_SUSPECT:', JSON.stringify(drawn, null, 1).slice(0,3000));
  // Are the map text labels drawn on canvas? check the label list the module computes
  log('N targets', await page.evaluate(()=>document.querySelectorAll('.map__target').length));
};
