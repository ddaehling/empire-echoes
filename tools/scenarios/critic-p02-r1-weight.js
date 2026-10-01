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
  const r = await page.evaluate(async () => {
    const bus = (await import('/app/js/core/bus.js')).default || (await import('/app/js/core/bus.js')).bus;
    const mod = await import('/app/js/core/data.js');
    const d = await mod.loadData();
    const out = { metrics: (d.metrics||[]).slice(0,6).map(m=>({id:m.id, label:m.label, n: m.values? Object.keys(m.values).length : null})), hasMetrics: !!d.metrics, keys: Object.keys(d).filter(k=>/metric|silen/i.test(k)) };
    return out;
  });
  log('DATA METRICS:', JSON.stringify(r).slice(0,1500));
  const fired = await page.evaluate(async () => {
    const b = await import('/app/js/core/bus.js');
    const bus = b.default && b.default.emit ? b.default : b;
    const mod = await import('/app/js/core/data.js');
    const d = await mod.loadData();
    // pick a metric with few units
    const ms = d.metrics || [];
    if (!ms.length) return 'no metrics array';
    const chosen = ms.map(m=>({id:m.id, n: m.values ? Object.keys(m.values).length : (m.byUnit? Object.keys(m.byUnit).length : 0), label:m.label}));
    return chosen.slice(0,20);
  });
  log('METRIC LIST:', JSON.stringify(fired).slice(0,2000));
};
