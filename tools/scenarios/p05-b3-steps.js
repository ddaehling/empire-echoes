/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05-b3-steps.js — print the step list of a route with its kind and fit. */
const ROUTE = process.env.ROUTE || 'core';
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=' + ROUTE + '&step=0', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  const rows = await page.evaluate(() => {
    const T = window.BEA && window.BEA.tours;
    const steps = (T && T.steps) || [];
    return steps.map((s, i) => ({
      i, kind: s.kind, n: s.n || '',
      id: s.beat ? s.beat.id : (s.gate && s.gate.id) || (s.recall && s.recall.id) || (s.dispute && s.dispute.id) || '',
      bkind: s.beat ? s.beat.kind : '',
      fit: s.beat ? (s.beat.fit || '') : '',
      opt: !!s.optional,
      cost: s.beat ? s.beat.cost_s : (s.gate ? 60 : 45),
    }));
  });
  for (const r of rows) log(String(r.i).padStart(2) + ' ' + r.kind.padEnd(9) + ' ' + String(r.id).padEnd(22) + ' ' + String(r.bkind).padEnd(11) + ' fit=' + String(r.fit).padEnd(5) + ' opt=' + r.opt + ' cost=' + r.cost);
  log('TOTAL cost_s = ' + rows.reduce((a, r) => a + (r.cost || 0), 0) + ' over ' + rows.length + ' steps');
};
