/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  // A. the module's own cost per year change, 600 frames.
  const own = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    p.perf.reset();
    const t = [];
    for (let i = 0; i < 600; i++) {
      const y = 1400 + (i % 620);
      const a = performance.now();
      p.setYear(y);
      p.wantYear = y; p.store.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(r));
      t.push(performance.now() - a);
    }
    t.sort((a,b)=>a-b);
    return { p03mean: p.perf.ms / p.perf.n, p03worst: p.perf.worst, p03n: p.perf.n,
             frameMean: t.reduce((s,x)=>s+x,0)/t.length, p50: t[300], p95: t[570], max: t[599] };
  });
  log('600-frame scrub (whole app frame, and P03 draw only):', JSON.stringify(own));
  // B. the critic's 300-year hash sweep
  const sweep = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03; p.perf.reset();
    const t = [];
    for (let y = 1600; y < 1900; y++) {
      const a = performance.now();
      location.hash = '#year=' + y;
      await new Promise(r => requestAnimationFrame(r));
      t.push(performance.now() - a);
    }
    t.sort((a,b)=>a-b);
    return { mean: t.reduce((s,x)=>s+x,0)/t.length, p50: t[150], p95: t[285], max: t[299], p03mean: p.perf.ms/p.perf.n, p03worst: p.perf.worst };
  });
  log('300-year programmatic sweep:', JSON.stringify(sweep));
  // C. pointer drag of 600 moves
  const box = await page.evaluate(() => { const r = document.querySelector('.tl-ax__rail').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  await page.mouse.move(box.x + 100, box.y + box.h/2);
  await page.mouse.down();
  await page.evaluate(() => document.querySelector('.tl').__p03.perf.reset());
  const t0 = Date.now();
  for (let i = 0; i < 600; i++) await page.mouse.move(box.x + 60 + (i % 1200), box.y + box.h/2);
  const total = Date.now() - t0;
  await page.mouse.up();
  log('600 pointer moves total ms:', total, 'per move:', (total/600).toFixed(2));
  log('P03 during drag:', JSON.stringify(await page.evaluate(() => { const p=document.querySelector('.tl').__p03; return {n:p.perf.n, mean:p.perf.ms/p.perf.n, worst:p.perf.worst}; })));
};
