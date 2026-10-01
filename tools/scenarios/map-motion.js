/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Reduced motion: the projection change must cross-fade, not tween. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  log('data-motion:', await page.evaluate(() => document.documentElement.dataset.motion));
  log('prefersReduced:', await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(500);
  const trace = await page.evaluate(() => new Promise((resolve) => {
    const m = window.__map, seen = [];
    const orig = m.plate.setProjectionState.bind(m.plate);
    m.plate.setProjectionState = (a, b, t) => { seen.push([a, b, +t.toFixed(2)]); return orig(a, b, t); };
    m.setProjection('mercator');
    let mid = null;
    setTimeout(() => {
      const f = document.querySelector('.map__fade');
      mid = { w: f.width, opacity: f.style.opacity, on: f.classList.contains('is-on') };
    }, 180);
    setTimeout(() => {
      m.plate.setProjectionState = orig;
      resolve({ states: seen.slice(0, 40), count: seen.length,
        intermediate: seen.filter(s => s[2] > 0 && s[2] < 1).length,
        midFade: mid });
    }, 1400);
  }));
  log('projection trace:', JSON.stringify(trace));
  await shot('reduced-after-toggle');
};
