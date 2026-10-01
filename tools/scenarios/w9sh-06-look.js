/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.BEA.store.dispatch('setPlaying', false));
  for (const level of ['plate', 'apparatus']) {
    await page.evaluate(l => window.BEA.bus.emit('ask:stage', { level: l }), level);
    await page.waitForTimeout(1200);
    await shot('full-' + level);
  }
};
