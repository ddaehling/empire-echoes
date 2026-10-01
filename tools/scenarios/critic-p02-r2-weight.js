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
    const { bus } = await import('/app/js/core/bus.js');
    const dm = await import('/app/js/core/data.js');
    const data = await dm.loadData({});
    // find a metric with few carriers
    const metrics = {};
    for (const t of data.territories) for (const m of (t.metrics||[])) metrics[m.metric] = (metrics[m.metric]||0)+1;
    return { metricNames: metrics, sample: (data.territories.find(t=>(t.metrics||[]).length)||{}).metrics };
  });
  log('METRICS ' + JSON.stringify(r).slice(0,1500));
  const res = await page.evaluate(async (metric) => {
    const { bus } = await import('/app/js/core/bus.js');
    const dm = await import('/app/js/core/data.js');
    const data = await dm.loadData({});
    const values = new Map();
    let n=0;
    for (const t of data.territories) for (const m of (t.metrics||[])) if (m.metric===metric && Number.isFinite(+m.value)) {
      for (const u of (t.unitIds||[t.id])) values.set(u, +m.value); n++;
    }
    bus.emit('ask:sizeBy', { metric, year: 1900, values, caption: 'test caption from critic' });
    return { asked: n, size: values.size };
  }, Object.keys(r.metricNames||{})[0] || 'population');
  log('EMIT ' + JSON.stringify(res));
  await page.waitForTimeout(2000);
  await shot('weight');
  log('after: ' + JSON.stringify(await page.evaluate(()=>({ w: document.querySelector('.map')?.dataset.weight, note: document.querySelector('.map__switch')?.innerText.slice(-500) }))));
};
