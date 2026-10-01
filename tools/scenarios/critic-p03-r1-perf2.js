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
    const tl = document.querySelector('.tl').__p03;
    const store = window.BEA.store;
    tl.perf.reset();
    const raf = () => new Promise(r => requestAnimationFrame(r));
    const t0 = performance.now();
    for (let i = 0; i < 600; i++) { store.dispatch('setYear', 1420 + i); await raf(); }
    const total = performance.now() - t0;
    return { n: tl.perf.n, avg: +(tl.perf.ms / Math.max(1, tl.perf.n)).toFixed(3), worst: +tl.perf.worst.toFixed(2), wallAvgFrame: +(total/600).toFixed(2) };
  });
  log('600-frame scrub: ' + JSON.stringify(r));
};
