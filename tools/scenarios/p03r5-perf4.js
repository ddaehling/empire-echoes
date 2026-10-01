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
    const orig = p.draw.bind(p);
    let work = [];
    p.draw = function (s, h) { const t0 = performance.now(); orig(s, h); document.documentElement.getBoundingClientRect(); work.push(performance.now() - t0); };
    const sweep = async (n) => {
      const stamps = [];
      await new Promise((done) => {
        let i = 0;
        const step = (ts) => { stamps.push(ts); if (i >= n) return done();
          const y = 1400 + (i % 620); i++; p.wantYear = y; p.store.dispatch('setYear', y);
          requestAnimationFrame(step); };
        requestAnimationFrame(step);
      });
      const g = []; for (let i = 1; i < stamps.length; i++) g.push(stamps[i] - stamps[i-1]);
      g.sort((a,b)=>a-b);
      return { mean:+(g.reduce((s,x)=>s+x,0)/g.length).toFixed(2), p50:+g[Math.floor(g.length*0.5)].toFixed(2), p95:+g[Math.floor(g.length*0.95)].toFixed(2), max:+g[g.length-1].toFixed(2), over25:g.filter(x=>x>25).length, frames:g.length };
    };
    const cold = await sweep(600);
    work = []; p.perf.reset();
    const warm = await sweep(600);
    const w = work.slice().sort((a,b)=>a-b);
    return { cold, warm,
      workPerFrame: { n: w.length, mean:+(w.reduce((s,x)=>s+x,0)/w.length).toFixed(2), p50:+w[Math.floor(w.length*0.5)].toFixed(2), p95:+w[Math.floor(w.length*0.95)].toFixed(2), max:+w[w.length-1].toFixed(2) },
      p03Draw: { mean:+(p.perf.ms/p.perf.n).toFixed(3), worst:+p.perf.worst.toFixed(2), n:p.perf.n } };
  });
  log(JSON.stringify(r, null, 1));
};
