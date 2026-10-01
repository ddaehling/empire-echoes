/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(async () => {
    const mod = await import('/app/js/legend/ribbon.js');
    const root = document.querySelector('.legend--ribbon');
    const t = [];
    for (let i = 0; i < 60; i++) { const t0 = performance.now(); mod.fitRibbon(root); t.push(performance.now() - t0); }
    t.sort((a, b) => a - b);
    return { p50: +t[30].toFixed(3), p95: +t[57].toFixed(3), max: +t[59].toFixed(3) };
  });
  log('fitRibbon alone: ' + JSON.stringify(r));
  const s = await page.evaluate(async () => {
    const st = window.BEA.store; const t = [];
    for (let y = 1600; y <= 1990; y += 10) {
      const t0 = performance.now(); st.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(r)); t.push(performance.now() - t0);
    }
    t.sort((a, b) => a - b);
    return { p50: +t[20].toFixed(2), p95: +t[38].toFixed(2), max: +t[39].toFixed(2) };
  });
  log('whole-app year step: ' + JSON.stringify(s));
};
