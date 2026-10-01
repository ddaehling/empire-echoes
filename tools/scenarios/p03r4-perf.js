/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1500);

  // --- AT5: 600 setYear + rAF frames, measured end to end -----------------
  // work per frame: dispatch + a forced synchronous flush of every subscriber
  const work = await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const store = window.BEA.store;
    p.perf.reset();
    const t = [];
    for (let i = 0; i < 600; i++) {
      const y = 1600 + (i % 398);
      const t0 = performance.now();
      store.dispatch('setYear', y);
      store.flush();
      t.push(performance.now() - t0);
    }
    t.sort((a, b) => a - b);
    return { median: +t[300].toFixed(2), p95: +t[570].toFixed(2), max: +t[599].toFixed(2),
      mean: +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(2),
      timelineOwnMean: +(p.perf.ms / Math.max(1, p.perf.n)).toFixed(3), timelineOwnWorst: +p.perf.worst.toFixed(2) };
  });
  log('AT5 work per frame (dispatch + every subscriber, synchronous):', JSON.stringify(work));

  // dropped frames: rAF-to-rAF deltas while scrubbing one year per frame
  const raf = await page.evaluate(async () => {
    const store = window.BEA.store;
    const d = [];
    let prev = 0, i = 0;
    await new Promise((done) => {
      const step = (now) => {
        if (prev) d.push(now - prev);
        prev = now;
        store.dispatch('setYear', 1600 + (i % 398));
        if (++i >= 600) return done();
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    d.sort((a, b) => a - b);
    return { frames: d.length, median: +d[Math.floor(d.length / 2)].toFixed(2),
      p95: +d[Math.floor(d.length * 0.95)].toFixed(2), max: +d[d.length - 1].toFixed(2),
      over20ms: d.filter(x => x > 20).length, over34ms: d.filter(x => x > 34).length };
  });
  log('AT5 rAF interval while scrubbing (60Hz floor is 16.7ms):', JSON.stringify(raf));

  const whole = await page.evaluate(async () => {
    const p = document.querySelector('.tl').__p03;
    p.perf.reset();
    const store = window.BEA.store;
    const t = [];
    for (let i = 0; i < 600; i++) {
      const y = 1600 + (i % 398);
      const t0 = performance.now();
      store.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(() => r()));
      t.push(performance.now() - t0);
    }
    t.sort((a, b) => a - b);
    return {
      median: +t[300].toFixed(2), p95: +t[570].toFixed(2), max: +t[599].toFixed(2),
      mean: +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(2),
      timelineOwnTotalMs: +p.perf.ms.toFixed(2), timelineOwnFrames: p.perf.n,
      timelineOwnMean: +(p.perf.ms / Math.max(1, p.perf.n)).toFixed(3),
      timelineOwnWorst: +p.perf.worst.toFixed(2),
    };
  });
  log('AT5 whole-app frames:', JSON.stringify(whole));

  // --- 600 pointer moves on the rail: uncaught errors? --------------------
  const box = await page.locator('.tl-ax__rail').boundingBox();
  await page.mouse.move(box.x + 40, box.y + box.height / 2);
  await page.mouse.down();
  const t0 = Date.now();
  for (let i = 0; i < 600; i++) {
    await page.mouse.move(box.x + 40 + (i % 900), box.y + box.height / 2);
  }
  await page.mouse.up();
  log('drag of 600 moves took ms:', Date.now() - t0);
  await page.waitForTimeout(1200);
  log('year after drag:', await page.evaluate(() => window.BEA.store.getState().year));
};
