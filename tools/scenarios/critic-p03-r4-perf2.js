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
    // find the timeline module instance via the registry if exposed on any global
    const keys = Object.getOwnPropertyNames(window).filter(k => /app|registry|atlas|store/i.test(k));
    return keys;
  });
  log('globals:', JSON.stringify(r));
  const paint = await page.evaluate(async () => {
    const t = [];
    for (let y = 1750; y < 2050; y++) {
      const a = performance.now();
      window.dispatchEvent(new HashChangeEvent('hashchange'));
      location.hash = '#year=' + (y > 2027 ? 2027 : y);
      await new Promise(rr => requestAnimationFrame(() => requestAnimationFrame(rr)));
      t.push(performance.now() - a);
    }
    t.sort((a,b)=>a-b);
    return { p50: t[150], p95: t[285] };
  });
  log('two-raf sweep:', JSON.stringify(paint));
};
