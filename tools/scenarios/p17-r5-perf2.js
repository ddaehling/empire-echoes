/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(2800);
  await page.keyboard.press('w'); await page.waitForTimeout(500);
  await page.keyboard.press('s'); await page.waitForTimeout(500);
  await page.keyboard.press('h'); await page.waitForTimeout(800);
  const r = await page.evaluate(async () => {
    const reg = window.BEA.registry;
    const mod = reg && typeof reg.get === 'function' ? reg.get('legend') : null;
    const target = mod || (window.BEA.legend && window.BEA.legend.__mod) || null;
    if (!target) return { note: 'module handle not exposed; timing the DOM cost instead' };
    return null;
  });
  // fall back: measure how long the legend subtree takes to rebuild by observing mutations
  const r2 = await page.evaluate(async () => {
    const slot = document.querySelector('[data-mount="legend"]');
    const times = [];
    let t0 = 0;
    const mo = new MutationObserver(() => { if (t0) { times.push(performance.now() - t0); t0 = 0; } });
    mo.observe(slot, { childList: true, subtree: true });
    const st = window.BEA.store;
    for (let y = 1700; y <= 1990; y += 10) {
      t0 = performance.now();
      st.dispatch('setYear', y);
      await new Promise(r => setTimeout(r, 30));
    }
    mo.disconnect();
    times.sort((a,b)=>a-b);
    return { n: times.length, p50: +times[Math.floor(times.length*0.5)].toFixed(2),
      p95: +times[Math.floor(times.length*0.95)].toFixed(2), max: +times[times.length-1].toFixed(2) };
  });
  log('legend subtree rebuild after a year dispatch: ' + JSON.stringify(r2) + ' ' + JSON.stringify(r));
};
