/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const r = await page.evaluate(async () => {
    const m = await import('/app/js/core/data.js');
    const data = await m.loadData({});
    const st = data.statusAt(1913);
    const g = {};
    for (const [u,e] of st) { (g[e.controlDegree] ||= []).push(u + ':' + e.status); }
    return { d5: g[5].slice(0,120), d5n: g[5].length, d1: g[1], d0: (g[0]||[]).length };
  });
  log(JSON.stringify(r, null, 1).slice(0, 5000));
};
