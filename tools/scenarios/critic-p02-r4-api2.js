/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: Converting circular structure to JSON.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const s = await page.evaluate(() => {
    const data = window.BEA.data;
    const m = data.statusAt(1900);
    const ids = ['us-florida','hawaii','reunion','id-maluku','pitcairn-islands','cn-weihaiwei','anguilla','in-bengal','gibraltar'];
    const res = {};
    ids.forEach(id => res[id] = m.get(id) || null);
    return {size: m.size, res, metrics: data.metricsAt(1900)};
  });
  log('S:', JSON.stringify(s, null, 1).slice(0,4000));
  const drawn = await page.evaluate(() => {
    const t = [...document.querySelectorAll('.map__target')];
    return t.filter(x=>['us-florida','hawaii','reunion','pitcairn-islands','anguilla','cn-weihaiwei'].includes(x.dataset.unit))
      .map(x=>({id:x.dataset.unit, aria:x.getAttribute('aria-label'), cls:x.className, style:x.getAttribute('style')}));
  });
  log('DRAWN_SUSPECT:', JSON.stringify(drawn, null, 1).slice(0,3000));
};
