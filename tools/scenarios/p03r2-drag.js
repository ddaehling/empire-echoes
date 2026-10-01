/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* A real pointer drag across the whole axis, the way a student scrubs, plus
   twelve seconds of playback. Counts what a user would actually hit. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl-ax__rail'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const box = await page.locator('.tl-ax__rail').boundingBox();
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 4, y);
  await page.mouse.down();
  for (let i = 0; i <= 120; i++) {
    await page.mouse.move(box.x + 4 + (box.width - 8) * (i / 120), y);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
  await page.waitForTimeout(500);
  log('after drag, year = ' + await page.evaluate(() => window.BEA.store.getState().year));
  log('perf during drag: ' + await page.evaluate(() => JSON.stringify(document.querySelector('.tl').__p03.perf)));
  // and back
  await page.mouse.move(box.x + box.width - 6, y);
  await page.mouse.down();
  for (let i = 120; i >= 0; i--) { await page.mouse.move(box.x + 4 + (box.width - 8) * (i / 120), y); await page.waitForTimeout(8); }
  await page.mouse.up();
  await page.waitForTimeout(400);
  // playback
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1900); window.BEA.store.dispatch('setSpeed', 8); window.BEA.bus.emit('ask:play'); });
  await page.waitForTimeout(6000);
  log('after playback, year = ' + await page.evaluate(() => window.BEA.store.getState().year));
  await shot('end');
};
