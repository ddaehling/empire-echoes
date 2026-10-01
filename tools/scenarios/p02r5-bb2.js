/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto(page.url().split('#')[0] + '#year=1913');
  await page.waitForTimeout(3400);
  const r = await page.evaluate(() => {
    const p = window.__map.plate;
    const cam = p.camera();
    const ml = p.markLayout(cam);
    let moved = 0, under = 0;
    const obs = p.obstacles;
    const inObs = (x, y, r) => obs.some(o => x + r > o.x - 2 && x - r < o.x + o.w + 2 && y + r > o.y - 2 && y - r < o.y + o.h + 2);
    for (const m of ml.values()) { if (m.moved) moved++; if (inObs(m.x, m.y, m.r)) under++; }
    return { minMark: p.minMark(cam), worldW: cam.worldW / p.dpr, n: ml.size, moved, under,
      movedCount: ml.movedCount, worst: ml.worstShiftPx, obs: obs.length };
  });
  log(JSON.stringify(r));
};
