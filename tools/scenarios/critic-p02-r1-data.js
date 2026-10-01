/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const app = window.__ATLAS__ || window.atlas || window.APP || null;
    const keys = Object.keys(window).filter(k => /atlas|store|data|app/i.test(k)).slice(0,40);
    return { keys, hasAtlas: !!app };
  });
  log('WINDOW KEYS:', JSON.stringify(r));
  const m = await page.evaluate(() => {
    const d = (window.__ATLAS__ && window.__ATLAS__.data) || window.data;
    if (!d) return 'no data handle';
    const out = {};
    try { out.metrics1913 = d.metricsAt(1913); } catch(e){ out.err = String(e); }
    return out;
  });
  log('METRICS:', JSON.stringify(m).slice(0,1500));
};
