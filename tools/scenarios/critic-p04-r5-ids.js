/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const out = await page.evaluate(async () => {
    const w = window;
    const keys = Object.keys(w).filter(k => /app|store|data|bus|atlas/i.test(k));
    let ids = null, n = null;
    const d = w.__data || w.data || (w.App && w.App.data) || (w.app && w.app.data);
    if (d && d.territories) { const t = d.territories; ids = (Array.isArray(t)?t:Object.values(t)).slice(0,0); }
    return { keys, hasData: !!d, dKeys: d ? Object.keys(d).slice(0,40) : null };
  });
  log(JSON.stringify(out, null, 1));
};
