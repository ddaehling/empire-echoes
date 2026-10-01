/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1600', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  // real playback at 16x, with everything else in the app live
  await page.evaluate(() => { window.__map.resetStats(); window.BEA.store.batch(d => { d('setSpeed', 16); d('play'); }); });
  await page.waitForTimeout(9000);
  const mid = await page.evaluate(() => ({ year: window.BEA.store.getState().year, stats: window.__map.frameStats() }));
  log('playback 9s at 16x', JSON.stringify(mid));
  await page.evaluate(() => window.BEA.store.dispatch('pause'));
  await page.waitForTimeout(400);
  // and a 600-frame camera scrub: pan + zoom, which rebuilds every path
  const pan = await page.evaluate(async () => {
    const m = window.__map; m.resetStats();
    const t0 = performance.now();
    m.plate.setMotion(true);
    for (let i = 0; i < 600; i++) {
      const k = 1 + 3 * (0.5 - Math.cos(i / 40) / 2);
      m.plate.setView({ k, x: 0.12 * Math.sin(i / 30), y: 0.05 * Math.cos(i / 25) });
      m.plate.draw();
    }
    const moving = m.frameStats();
    m.plate.setMotion(false); m.resetStats();
    const t1 = performance.now();
    for (let i = 0; i < 60; i++) { m.plate.setView({ k: 1 + i / 60, x: 0, y: 0 }); m.plate.draw(); }
    const still = m.frameStats();
    return { wall: Math.round(performance.now() - t0), moving, stillQuality: still, stillWall: Math.round(performance.now() - t1) };
  });
  log('600-frame camera scrub (paths rebuilt every frame)', JSON.stringify(pan));
  await page.evaluate(() => { window.__map.plate.setView({ k: 1, x: 0, y: 0 }); window.__map.draw(); });
  await shot('01-after-play');
  log('errors', JSON.stringify(errs));
};
