/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  const r = await page.evaluate(async () => {
    const m = window.BEA.map, s = window.BEA.store;
    m.resetStats();
    const t = [];
    for (let y = 1600; y <= 1997; y++) {
      const a = performance.now();
      s.dispatch('setYear', y);
      s.flush();
      m.draw();
      t.push(performance.now() - a);
    }
    t.sort((a, b) => a - b);
    const sum = t.reduce((x, y) => x + y, 0);
    return { frames: t.length, mean: +(sum / t.length).toFixed(3), median: +t[Math.floor(t.length / 2)].toFixed(3),
      p95: +t[Math.floor(t.length * 0.95)].toFixed(3), worst: +t[t.length - 1].toFixed(3),
      over16: t.filter(v => v > 16).length, stats: m.frameStats() };
  });
  log('scrub ' + JSON.stringify(r));
  // 600-frame continuous scrub at playback
  const r2 = await page.evaluate(async () => {
    const m = window.BEA.map, s = window.BEA.store;
    const t = [];
    for (let i = 0; i < 600; i++) {
      const y = 1600 + (i % 398);
      const a = performance.now();
      s.dispatch('setYear', y); s.flush(); m.draw();
      t.push(performance.now() - a);
      if (i % 40 === 0) await new Promise(r => requestAnimationFrame(r));
    }
    t.sort((a, b) => a - b);
    return { n: t.length, mean: +(t.reduce((x, y) => x + y, 0) / t.length).toFixed(3), median: +t[300].toFixed(3), p95: +t[570].toFixed(3), worst: +t[599].toFixed(3), over16: t.filter(v => v > 16).length };
  });
  log('600-frame ' + JSON.stringify(r2));
  await shot('after-scrub');
};
