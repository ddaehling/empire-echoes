/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => new Promise((res) => {
    const off = window.BEA.bus.on('tours:routes', (p) => { off(); res(p.routes); });
    window.BEA.bus.emit('app:ready', {});
    setTimeout(() => res(null), 2500);
  }));
  if (!r) { log('no routes payload'); return; }
  for (const x of r) log(x.id.padEnd(8) + ' ' + String(x.steps).padStart(3) + ' steps · ' + String(x.minutesExact).padStart(3) + ' min exact · offered as ' + x.minutes + ' · grey lines [' + x.greyLines.join(',') + ']');
};
