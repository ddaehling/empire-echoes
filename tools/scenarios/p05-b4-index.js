/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b4-index.js — read window.BEA.toursIndex and print every route's steps. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const idx = await page.evaluate(() => {
    const I = window.BEA && window.BEA.toursIndex;
    if (!I) return null;
    return {
      version: I.version,
      routes: Object.fromEntries(Object.entries(I.routes).map(([k, r]) => [k, r.steps.map(s => s.i + ':' + s.kind + ':' + s.id + ':' + String(s.title).slice(0, 28))])),
      probe: { core_two_in_tension: I.hrefOf('core', 'two-in-tension'), thirty_two_in_tension: I.hrefOf('thirty', 'two-in-tension'), core_congo: I.hrefOf('core', 'congo'), missing: I.hrefOf('core', 'barbados') },
    };
  });
  if (!idx) { log('NO window.BEA.toursIndex'); return; }
  for (const [k, v] of Object.entries(idx.routes)) { log('== ' + k); v.forEach(x => log('   ' + x)); }
  log('PROBE ' + JSON.stringify(idx.probe));
};
