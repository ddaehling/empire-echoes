/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: Resulting promise was garbage collected..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(500);
  const run = (to) => page.evaluate((to) => new Promise((resolve) => {
    // Honest end-to-end: the gap between the frames the browser actually
    // presented, not the time our own draw call took to be issued.
    const m = window.__map;
    m.resetStats();
    // Timestamp the morph's OWN rAF callbacks — no competing loop, so this is
    // the cadence the browser actually gave the animation.
    const gaps = []; let last = 0;
    const orig = m.plate.draw.bind(m.plate);
    m.plate.draw = function () { const n = performance.now(); if (last) gaps.push(n - last); last = n; return orig(); };
    m.setProjection(to);
    setTimeout(() => {
      m.plate.draw = orig;
      const during = gaps.slice(0).sort((a, b) => a - b);
      resolve({
        drawIssueMs: m.frameStats(),
        presentedFrames: during.length,
        gapMedian: +during[Math.floor(during.length / 2)].toFixed(2),
        gapP95: +during[Math.floor(during.length * 0.95)].toFixed(2),
        gapMax: +during[during.length - 1].toFixed(2),
      });
    }, 900);
  }), to);
  log('morph -> mercator:', JSON.stringify(await run('mercator')));
  await page.waitForTimeout(400);
  log('morph -> equal earth:', JSON.stringify(await run('equal-earth')));
};
