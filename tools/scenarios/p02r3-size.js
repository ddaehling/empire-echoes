/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    window.__sizes = [];
    const p = window.__map.plate;
    const orig = p.setSize.bind(p);
    p.setSize = (w,h,d) => { const before=[p.w,p.h]; const r = orig(w,h,d); if (r) window.__sizes.push([before[0],before[1],w,h]); return r; };
  });
  await page.evaluate(async () => {
    const S = window.BEA.store;
    for (let y = 1600; y <= 1700; y++) { S.dispatch('setYear', y); await new Promise(r => requestAnimationFrame(r)); }
  });
  log('resizes: ' + JSON.stringify(await page.evaluate(() => window.__sizes.slice(0, 25))));
  log('count: ' + await page.evaluate(() => window.__sizes.length));
};
