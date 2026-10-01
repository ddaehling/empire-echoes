/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const st = () => page.evaluate(() => ({ big: document.querySelector('.map').classList.contains('is-enlarged'),
    frame: (() => { const b = document.querySelector('.map__frame').getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; })(),
    live: (document.getElementById('live-status') || {}).textContent }));
  log('boot ' + JSON.stringify(await st()));
  await page.keyboard.press('e');
  await page.waitForTimeout(1500);
  log('after E ' + JSON.stringify(await st()));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1922));
  await page.waitForTimeout(1500);
  log('after year change ' + JSON.stringify(await st()));
  await shot('shrunk');
};
