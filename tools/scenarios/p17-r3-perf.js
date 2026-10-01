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
    const out = {};
    // cost of totalsAt across 400 cold years, then warm
    let t = performance.now();
    for (let y = 1600; y <= 2000; y++) window.BEA.legend.totalsAt(y);
    out.totalsColdMs = +(performance.now() - t).toFixed(1);
    t = performance.now();
    for (let y = 1600; y <= 2000; y++) window.BEA.legend.totalsAt(y);
    out.totalsWarmMs = +(performance.now() - t).toFixed(1);
    // frame budget during a scrub
    const frames = [];
    let last = performance.now();
    let stop = false;
    const tick = () => { const n = performance.now(); frames.push(n - last); last = n; if (!stop) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    for (let y = 1700; y <= 1990; y += 1) { window.BEA.store.dispatch('setYear', y); await new Promise(r2 => setTimeout(r2, 6)); }
    stop = true;
    await new Promise(r2 => setTimeout(r2, 100));
    frames.sort((a, b) => a - b);
    out.frames = frames.length;
    out.medianMs = +frames[Math.floor(frames.length / 2)].toFixed(1);
    out.p95Ms = +frames[Math.floor(frames.length * 0.95)].toFixed(1);
    out.maxMs = +frames[frames.length - 1].toFixed(1);
    return out;
  });
  log(JSON.stringify(r));
};
