/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const peek = () => page.evaluate(() => ({
    key: window.BEA.legend.sampleKey, base: window.BEA.legend.baselines,
    verified: window.BEA.legend.layerVerified, drawn: window.BEA.legend.drawnLayer,
  }));
  log('start ' + JSON.stringify(await peek()));
  for (const L of ['mechanism', 'tenure', 'status', 'exit', 'informal']) {
    await page.evaluate((l) => window.BEA.store.dispatch('setLayer', l), L);
    await page.waitForTimeout(1400);
    log(L + ' ' + JSON.stringify(await peek()));
  }
};
