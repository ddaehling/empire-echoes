/** w6/routes.js — every route's own arithmetic, straight from the module. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const routes = await page.evaluate(() => {
    const e = window.BEA.registry.get('tours');
    const m = e && e.mod;
    if (!m) return null;
    return JSON.parse(JSON.stringify(m._routes()));
  });
  if (!routes) { log('no tours module'); return; }
  for (const r of routes) {
    log([r.id.padEnd(7), String(r.steps).padStart(2) + ' steps',
      'exact=' + r.minutesExact + '–' + r.minutesExactMax,
      'offer=' + r.minutesSay, 'grey=' + JSON.stringify(r.greyLines), 'greySeconds=' + r.greySeconds].join('  '));
  }
};
