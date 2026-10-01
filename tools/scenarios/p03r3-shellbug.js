/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Proves the uncaught "a is not iterable" comes from core/util.js throttle via
// core/url.js writeSoon, with NO timeline involvement: it dispatches a state key
// the timeline module does not subscribe to.
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const raf = () => new Promise(r => requestAnimationFrame(r));
    for (let i = 0; i < 400; i++) { window.BEA.store.dispatch('setSearch', 'q' + i); await raf(); }
    window.BEA.store.dispatch('setSearch', '');
  });
  await page.waitForTimeout(500);
  log('400 setSearch dispatches, one per frame, timeline untouched.');
};
