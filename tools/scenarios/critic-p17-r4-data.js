/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(async () => {
    const out = {};
    const app = window.__app || window.app || {};
    out.appKeys = Object.keys(window).filter(k => /app|data|store|bus/i.test(k)).slice(0,30);
    const data = window.__app?.data || window.data;
    out.hasData = !!data;
    if (data) {
      out.dataKeys = Object.keys(data).slice(0,40);
      for (const y of [1783, 1900, 1913, 1922, 1947]) {
        try { const m = data.metricsAt(y); out['m'+y] = JSON.parse(JSON.stringify(m)); } catch(e) { out['m'+y] = 'ERR ' + e.message; }
      }
      out.statuses = data.statuses ? (Array.isArray(data.statuses) ? data.statuses.length : Object.keys(data.statuses).length) : null;
    }
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 9000));
};
