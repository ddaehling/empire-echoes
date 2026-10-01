/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const run = async (mode) => await page.evaluate(async (mode) => {
    const p = document.querySelector('.tl').__p03;
    if (!p.__origDraw) p.__origDraw = p.draw;
    p.draw = mode === 'off' ? function(){} : p.__origDraw;
    const stamps = [];
    await new Promise((done) => {
      let i = 0;
      const step = (ts) => { stamps.push(ts); if (i >= 400) return done();
        const y = 1400 + (i % 620); i++; p.wantYear = y; p.store.dispatch('setYear', y);
        requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
    const g=[]; for (let i=1;i<stamps.length;i++) g.push(stamps[i]-stamps[i-1]);
    g.sort((a,b)=>a-b);
    return { mean:+(g.reduce((s,x)=>s+x,0)/g.length).toFixed(2), p50:+g[200].toFixed(2), p95:+g[380].toFixed(2), over25:g.filter(x=>x>25).length };
  }, mode);
  log('P03 draw ON :', JSON.stringify(await run('on')));
  log('P03 draw OFF:', JSON.stringify(await run('off')));
  log('P03 draw ON :', JSON.stringify(await run('on')));
};
