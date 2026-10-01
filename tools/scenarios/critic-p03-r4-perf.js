/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  // 600 frame scrub by dragging the rail across
  const box = await page.evaluate(() => { const r = document.querySelector('.tl-ax__rail').getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  log('rail box:', JSON.stringify(box));
  await page.mouse.move(box.x + 100, box.y + box.h/2);
  await page.mouse.down();
  const t0 = Date.now();
  const frames = [];
  for (let i = 0; i < 600; i++) {
    const f0 = Date.now();
    await page.mouse.move(box.x + 100 + (i % 900), box.y + box.h/2);
    frames.push(Date.now() - f0);
  }
  await page.mouse.up();
  const total = Date.now() - t0;
  frames.sort((a,b)=>a-b);
  log('600 moves total ms:', total, 'mean per move:', (total/600).toFixed(2), 'p50', frames[300], 'p95', frames[570], 'max', frames[599]);
  log('final year:', await page.evaluate(()=>location.hash));
  await shot('after-scrub');
  // long-task style measure using requestAnimationFrame during programmatic year sweep
  const sweep = await page.evaluate(async () => {
    const t = [];
    for (let y = 1600; y < 1900; y++) {
      const a = performance.now();
      location.hash = '#year=' + y;
      await new Promise(r => requestAnimationFrame(r));
      t.push(performance.now() - a);
    }
    t.sort((a,b)=>a-b);
    return { mean: t.reduce((s,x)=>s+x,0)/t.length, p50: t[150], p95: t[285], max: t[299] };
  });
  log('300-year programmatic sweep (ms/frame):', JSON.stringify(sweep));
};
