/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.__map.resetStats());
  const b = await page.evaluate(() => { const r = window.__map.module.el.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  const cx = Math.round(b[0] + b[2] / 2), cy = Math.round(b[1] + b[3] / 2);
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 0; i < 60; i++) { await page.mouse.move(cx + Math.round(Math.sin(i/6)*140), cy + Math.round(Math.cos(i/7)*60)); }
  await page.mouse.up();
  await page.waitForTimeout(600);
  log('DRAG ' + JSON.stringify(await page.evaluate(() => window.__map.frameStats())));
  // wheel zoom
  await page.evaluate(() => window.__map.resetStats());
  for (let i = 0; i < 24; i++) { await page.mouse.wheel(0, -120); }
  await page.waitForTimeout(700);
  log('WHEEL ' + JSON.stringify(await page.evaluate(() => window.__map.frameStats())));
  log('view ' + JSON.stringify(await page.evaluate(() => window.__map.plate.view)));
};
