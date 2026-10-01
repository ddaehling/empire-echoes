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
    const app = window.__app || window.app || {};
    const data = app.data || window.data;
    const out = { keys: Object.keys(window).filter(k => /app|data|store|bus/i.test(k)).slice(0,30) };
    if (data && data.metricsAt) {
      for (const y of [1900, 1913, 1922]) {
        out['m' + y] = JSON.parse(JSON.stringify(data.metricsAt(y)));
      }
    }
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 6000));
};
