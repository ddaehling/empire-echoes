/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    const out = {};
    // 1. synchronous cost of a year change, including forced style+layout
    const sync = (n, off) => {
      const t = [];
      for (let i = 0; i < n; i++) {
        const y = 1400 + ((i + off) % 620);
        const a = performance.now();
        p.wantYear = y; p.store.dispatch('setYear', y);
        document.documentElement.getBoundingClientRect();   // force style + layout
        t.push(performance.now() - a);
      }
      t.sort((a, b) => a - b);
      return { mean: +(t.reduce((s, x) => s + x, 0) / t.length).toFixed(2), p50: +t[Math.floor(n*0.5)].toFixed(2), p95: +t[Math.floor(n*0.95)].toFixed(2), max: +t[n-1].toFixed(2) };
    };
    p.perf.reset();
    out.sync600 = sync(600, 0);
    out.p03only = { mean: +(p.perf.ms / p.perf.n).toFixed(3), worst: +p.perf.worst.toFixed(2), n: p.perf.n };

    // 2. real frame intervals during a 600-frame scrub: how many frames were dropped
    const stamps = [];
    await new Promise((done) => {
      let i = 0;
      const step = (ts) => {
        stamps.push(ts);
        if (i >= 600) return done();
        const y = 1400 + (i % 620); i++;
        p.wantYear = y; p.store.dispatch('setYear', y);
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    const gaps = [];
    for (let i = 1; i < stamps.length; i++) gaps.push(stamps[i] - stamps[i-1]);
    gaps.sort((a,b)=>a-b);
    const dropped = gaps.filter((g) => g > 25).length;
    out.frameGaps = { mean: +(gaps.reduce((s,x)=>s+x,0)/gaps.length).toFixed(2), p50: +gaps[Math.floor(gaps.length*0.5)].toFixed(2), p95: +gaps[Math.floor(gaps.length*0.95)].toFixed(2), max: +gaps[gaps.length-1].toFixed(2), droppedOver25ms: dropped, frames: gaps.length };
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
