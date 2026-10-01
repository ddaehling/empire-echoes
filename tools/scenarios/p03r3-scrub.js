/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1600));
  await page.waitForTimeout(200);
  await page.focus('.tl-ax__rail');
  const t0 = Date.now();
  for (let i = 0; i < 397; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  const y = await page.evaluate(() => ({ store: window.BEA.store.getState().year, want: document.querySelector('.tl').__p03.wantYear, hash: location.hash }));
  log('397 ArrowRight from 1600 in ' + (Date.now()-t0) + 'ms -> ' + JSON.stringify(y));

  // perf: 600 frames
  const r = await page.evaluate(async () => {
    const tl = document.querySelector('.tl').__p03;
    const store = window.BEA.store;
    tl.perf.reset();
    const raf = () => new Promise(r => requestAnimationFrame(r));
    const t0 = performance.now();
    for (let i = 0; i < 600; i++) { store.dispatch('setYear', 1420 + i); await raf(); }
    const total = performance.now() - t0;
    return { n: tl.perf.n, avg: +(tl.perf.ms / Math.max(1, tl.perf.n)).toFixed(3), worst: +tl.perf.worst.toFixed(2), wallAvgFrame: +(total/600).toFixed(2) };
  });
  log('600-frame scrub: ' + JSON.stringify(r));

  // pointer drag across the whole rail
  const box = await page.locator('.tl-ax__rail').boundingBox();
  await page.mouse.move(box.x + 20, box.y + box.height - 8);
  await page.mouse.down();
  for (let i = 0; i <= 60; i++) await page.mouse.move(box.x + 20 + (box.width-40) * i/60, box.y + box.height - 8);
  await page.mouse.up();
  await page.waitForTimeout(300);
  log('after drag: ' + JSON.stringify(await page.evaluate(() => ({ y: window.BEA.store.getState().year }))));
};
