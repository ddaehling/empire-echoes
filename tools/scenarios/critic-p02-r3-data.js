/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/core/data.js').catch(e => ({ err: String(e) }));
    if (mod.err) return { err: mod.err };
    const d = mod.data || mod.default;
    const out = {};
    out.keys = Object.keys(d);
    try { const m = d.metricsAt(1913); out.metrics1913 = JSON.parse(JSON.stringify(m)); } catch(e){ out.mErr = String(e); }
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 4000));
};
