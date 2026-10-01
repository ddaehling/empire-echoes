/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const api = await page.evaluate(() => {
    const w = window;
    const d = w.__atlas && w.__atlas.data ? w.__atlas.data : (w.data || w.App && w.App.data);
    const keys = Object.keys(w).filter(k => /atlas|store|data|app|bus/i.test(k)).slice(0,30);
    return { globals: keys, hasData: !!d, dataKeys: d ? Object.keys(d).slice(0,60) : null };
  });
  log('API: ' + JSON.stringify(api, null, 1));
};
