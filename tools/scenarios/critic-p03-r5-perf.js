/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  // definition sensitivity of the profile sentence
  const sent = async () => page.evaluate(()=>document.querySelector('.tl-rate__caption').innerText.replace(/\s+/g,' ').slice(0,300));
  log('def1: '+await sent());
  await page.keyboard.press('3'); await page.waitForTimeout(1200);
  log('def3: '+await sent());
  await page.keyboard.press('4'); await page.waitForTimeout(1200);
  log('def4: '+await sent());
  await page.keyboard.press('1'); await page.waitForTimeout(1000);

  // AT5: 600-year scrub timing
  const t = await page.evaluate(async () => {
    const BEA = window.BEA;
    const t0 = performance.now();
    let frames = 0;
    for (let y = 1400; y < 2000; y++) {
      BEA.store.dispatch('setYear', y);
      BEA.store.flush && BEA.store.flush();
      frames++;
    }
    const t1 = performance.now();
    return { frames, total: Math.round(t1-t0), per: ((t1-t0)/frames).toFixed(2) };
  });
  log('scrub perf (sync dispatch): '+JSON.stringify(t));
  // rAF-paced measure
  const t2 = await page.evaluate(async () => {
    const BEA = window.BEA;
    const times = [];
    let y = 1600;
    return await new Promise(res => {
      let last = performance.now();
      function step(){
        const now = performance.now(); times.push(now-last); last = now;
        BEA.store.dispatch('setYear', y++);
        if (y < 1600+400) requestAnimationFrame(step); else {
          times.sort((a,b)=>a-b);
          res({ n: times.length, median: times[Math.floor(times.length/2)].toFixed(2), p95: times[Math.floor(times.length*0.95)].toFixed(2), max: times[times.length-1].toFixed(2) });
        }
      }
      requestAnimationFrame(step);
    });
  });
  log('rAF-paced 400 years: '+JSON.stringify(t2));
};
