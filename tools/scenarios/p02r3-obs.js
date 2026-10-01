/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const o = await page.evaluate(() => {
    const m = window.__map;
    const r = m.module.el.getBoundingClientRect();
    const rects = m.module._obstacleRects();
    const cov = rects.reduce((a,x)=>a+x.w*x.h,0)/(r.width*r.height);
    return { plate: [Math.round(r.width), Math.round(r.height)], insets: m.plate.insets,
      obsSet: m.plate.obstacles.length, rectsFound: rects.length, cov: +cov.toFixed(3),
      rects: rects.map(x=>[Math.round(x.x),Math.round(x.y),Math.round(x.w),Math.round(x.h)]),
      marks: m.plate.markLayout().size, labels: m.labels };
  });
  log(JSON.stringify(o, null, 1));
  await shot('now');
};
