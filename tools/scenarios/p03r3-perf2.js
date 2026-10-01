/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async () => {
    const raf = () => new Promise(r => requestAnimationFrame(r));
    let t0 = performance.now();
    for (let i = 0; i < 600; i++) await raf();
    const idle = (performance.now() - t0) / 600;
    const tl = document.querySelector('.tl').__p03;
    // P03 alone: render the timeline for 600 years with no store dispatch at all
    tl.perf.reset();
    t0 = performance.now();
    for (let i = 0; i < 600; i++) { tl.lastYear = null; tl.render({ ...window.BEA.store.getState(), year: 1420 + i }); }
    const p03only = (performance.now() - t0) / 600;
    return { idleFrameMs: +idle.toFixed(2), p03RenderOnlyMs: +p03only.toFixed(3), p03Worst: +tl.perf.worst.toFixed(2) };
  });
  log(JSON.stringify(r));
};
