/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — Error: through-line invariant violated.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b2-audit.js — the through-line invariant, checked against every route.
 * FAILS if any clause of DIDACTIC_SPEC §2.3 can never be earned on a route
 * that thesis.json has not declared partial, or if any `requires` in
 * thesis.json / close.json names a beat that does not exist.
 */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.throughLineAudit, null, { timeout: 30000 });
  const a = await page.evaluate(() => window.BEA.throughLineAudit);
  const routes = await page.evaluate(() => new Promise((res) => {
    try {
      let off = null;
      off = window.BEA.bus.on('tours:routes', (p) => { if (typeof off === 'function') off(); res(p && p.routes); });
      window.BEA.bus.emit('app:ready', {});
    } catch (_) { res(null); }
    setTimeout(() => res(null), 4000);
  })).catch(() => null);
  for (const [r, row] of Object.entries(a.routes)) {
    log('ROUTE ' + r.padEnd(7) + ' reachable ' + row.reachable + '/6'
      + (row.partial ? ' (declared partial)' : '')
      + '  ' + Object.entries(row.slots).map(([n, b]) => n + '←' + (b || 'NONE')).join('  '));
  }
  if (routes) for (const r of routes) log('CARD  ' + r.id.padEnd(7) + ' ' + r.steps + ' stops · ' + r.minutes + ' min · grey lines [' + (r.greyLines || []).join(',') + ']');
  log(a.problems.length ? 'PROBLEMS:\n  ' + a.problems.join('\n  ') : 'no problems');
  log(a.ok ? '>>> through-line invariant holds' : '>>> THROUGH-LINE INVARIANT VIOLATED');
  if (!a.ok) throw new Error('through-line invariant violated');
};
