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
    const rail = document.querySelector('.tl-ax__rail');
    const b = rail.getBoundingClientRect();
    const times = [];
    const fire = (x) => {
      rail.dispatchEvent(new PointerEvent('pointermove', {clientX:x, clientY:b.y+b.height/2, bubbles:true, pointerId:1, buttons:1}));
      window.dispatchEvent(new PointerEvent('pointermove', {clientX:x, clientY:b.y+b.height/2, bubbles:true, pointerId:1, buttons:1}));
    };
    rail.dispatchEvent(new PointerEvent('pointerdown', {clientX:b.x+5, clientY:b.y+b.height/2, bubbles:true, pointerId:1, buttons:1, isPrimary:true}));
    for (let i=0;i<600;i++){
      const t0=performance.now();
      fire(b.x + 5 + (i%580));
      await new Promise(rq=>requestAnimationFrame(rq));
      times.push(performance.now()-t0);
    }
    window.dispatchEvent(new PointerEvent('pointerup', {clientX:b.x+300, clientY:b.y+b.height/2, bubbles:true, pointerId:1}));
    times.sort((a,b)=>a-b);
    const mean = times.reduce((a,b)=>a+b,0)/times.length;
    return { mean: mean.toFixed(2), p50: times[300].toFixed(2), p95: times[570].toFixed(2), max: times[599].toFixed(2) };
  });
  log('drag frame cost:', JSON.stringify(r));
  log('year now:', await page.evaluate(()=>document.querySelector('.tl__year').textContent));
};
