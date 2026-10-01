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
    const m = await import('/app/js/core/data.js');
    const d = await m.loadData({});
    const scopes = {};
    for (const e of d.events) scopes[e.scope] = (scopes[e.scope]||0)+1;
    const ew = new Set(d.events.filter(e=>e.scope==='empire-wide' && Number.isFinite(e.year)).map(e=>e.year));
    return { scopes, restYears: ew.size, total: d.events.length };
  });
  log(JSON.stringify(r));
};
