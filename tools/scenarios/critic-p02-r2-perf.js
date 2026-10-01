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
    const st = await import('/app/js/core/store.js').catch(()=>null);
    const out = {};
    // measure frame cost by dispatching year via store if available
    const t = [];
    for (let y=1750; y<1850; y++) {
      const t0 = performance.now();
      location.hash = '#year='+y;
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      t.push(performance.now()-t0);
    }
    t.sort((a,b)=>a-b);
    out.median = t[Math.floor(t.length/2)]; out.p95 = t[Math.floor(t.length*0.95)]; out.max = t[t.length-1];
    return out;
  });
  log(JSON.stringify(r));
};
