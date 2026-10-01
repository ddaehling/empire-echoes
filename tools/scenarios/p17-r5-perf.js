/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  await page.keyboard.press('w'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(800);
  const r = await page.evaluate(async () => {
    const L = window.__legendModule || null;
    const t = [];
    const st = window.BEA.store;
    for (let y = 1600; y <= 1990; y += 10) {
      const t0 = performance.now();
      st.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(r));
      t.push(performance.now() - t0);
    }
    t.sort((a,b)=>a-b);
    return { n: t.length, p50: +t[Math.floor(t.length*0.5)].toFixed(2), p95: +t[Math.floor(t.length*0.95)].toFixed(2), max: +t[t.length-1].toFixed(2) };
  });
  log('scrub frame cost (store dispatch -> next frame, all modules): ' + JSON.stringify(r));
  const rc = await page.evaluate(() => {
    const t0 = performance.now();
    for (let i=0;i<200;i++) window.BEA.legend.totalsAt(1900);
    const a = performance.now()-t0;
    return { totalsAtCachedx200: +a.toFixed(2) };
  });
  log(JSON.stringify(rc));
};
