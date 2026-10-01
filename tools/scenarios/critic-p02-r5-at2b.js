/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const painted = p => p.evaluate(() => [...document.querySelectorAll('.map__target')].map(e=>e.getAttribute('data-unit')));
module.exports = async ({ page, shot, log }) => {
  const res = {};
  for (const def of ['claimed','administered','controlled','influenced']) {
    await page.goto('http://localhost:8777/app/#year=1913&def='+def, {waitUntil:'load'});
    await page.waitForTimeout(3000);
    res[def] = await painted(page);
    log(def, res[def].length);
  }
  log('claimed-only not in controlled:', res.claimed.filter(x=>!res.controlled.includes(x)).length);
  log('influenced adds:', res.influenced.filter(x=>!res.claimed.includes(x)).join(','));
  // try to reach the data api
  log('data probe:', await page.evaluate(async ()=>{
    try {
      const m = await import('/app/js/core/data.js');
      const d = m.data || m.default;
      const r = d.metricsAt ? d.metricsAt(1913) : null;
      return JSON.stringify({keys:Object.keys(m), byDegree: r && r.byDegree, rkeys: r?Object.keys(r):null}).slice(0,900);
    } catch(e){ return 'ERR '+e.message; }
  }));
};
