/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  for (const t of [1200, 1500, 2000, 3000]) {
    await page.waitForTimeout(t === 1200 ? 1200 : 800);
    const o = await page.evaluate(() => {
      const M = window.__map, P = M.plate;
      const box = M.module.el.getBoundingClientRect();
      const cam = P.camera();
      const s = M.unitScreen('gibraltar');
      return { at: Math.round(performance.now()), plate: [P.w, P.h], box: [Math.round(box.width), Math.round(box.height)],
        insets: P.insets, worldH: Math.round(cam.worldH / P.dpr), worldW: Math.round(cam.worldW / P.dpr),
        view: P.view, gib: s ? [Math.round(s.mx), Math.round(s.my), Math.round(s.px), Math.round(s.py)] : null };
    });
    log(JSON.stringify(o));
  }
  await shot('geom');
};
