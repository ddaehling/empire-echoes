/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2600);
  log('motion attr: ' + await page.evaluate(() => document.documentElement.dataset.motion));
  log('reduced?: ' + await page.evaluate(() => window.__map.module._reducedMotion()));
  const r = await page.evaluate(async () => {
    const M = window.__map;
    const samples = [];
    const t0 = performance.now();
    M.setProjection('equal-earth');
    for (let i = 0; i < 24; i++) {
      await new Promise(rr => requestAnimationFrame(rr));
      samples.push([Math.round(performance.now() - t0), +M.plate.t.toFixed(2), M.plate.projFrom, M.plate.projTo,
        document.querySelector('.map__fade').classList.contains('is-on')]);
    }
    await new Promise(rr => setTimeout(rr, 900));
    return { samples: samples.filter((s, i) => i % 4 === 0), t: M.plate.t, proj: M.projection };
  });
  log('MORPH SAMPLES ' + JSON.stringify(r));
  await shot('reduced-equal-earth');
};
