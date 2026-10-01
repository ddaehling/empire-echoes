/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // AT5: 600-frame scrub via the rail drag (pointer), measure per-frame
  const box = await page.evaluate(() => { const r = document.querySelector('.tl-ax__rail').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  log('rail box:', JSON.stringify(box));
  await page.evaluate(() => { const m = window.BEA.registry && window.BEA.registry.get ? window.BEA.registry.get('timeline') : null; if (m && m.perf) m.perf.reset(); });
  const t0 = Date.now();
  await page.mouse.move(box.x + 10, box.y + box.h/2);
  await page.mouse.down();
  for (let i=0;i<600;i++){
    const x = box.x + 10 + (box.w-20) * (i/599);
    await page.mouse.move(x, box.y + box.h/2);
  }
  await page.mouse.up();
  const el = Date.now()-t0;
  log('600 pointer moves in', el, 'ms =', (el/600).toFixed(2), 'ms/move (includes CDP overhead)');
  log('year now:', await page.evaluate(()=>window.BEA.store.getState().year));
  const perf = await page.evaluate(() => { const m = window.BEA.registry && window.BEA.registry.get ? window.BEA.registry.get('timeline') : null; return m && m.perf ? {n:m.perf.n, ms:m.perf.ms, worst:m.perf.worst} : 'no perf hook'; });
  log('module perf:', JSON.stringify(perf));
  // rAF-based frame timing during a programmatic 600-year sweep
  const frames = await page.evaluate(async () => {
    const store = window.BEA.store;
    const times = [];
    let y = 1400;
    for (let i=0;i<600;i++){
      const t = performance.now();
      store.dispatch('setYear', 1400 + (i % 600));
      await new Promise(r => requestAnimationFrame(r));
      times.push(performance.now()-t);
    }
    times.sort((a,b)=>a-b);
    return { median: times[300], p95: times[570], max: times[599], mean: times.reduce((a,b)=>a+b,0)/times.length };
  });
  log('600 setYear+rAF frames ms:', JSON.stringify(frames));
  await shot('afterscrub');
};
