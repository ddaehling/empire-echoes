/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Is the "a is not iterable" page error P03's, or the shell's?
   This scenario never touches the timeline: it dispatches a NON-time key on the
   store at frame rate. url.js subscribes to every store change and pushes it
   through util.js `throttle`, whose `run()` can be entered twice for one set of
   args — once synchronously from `th()` when `wait <= 0`, and once from the
   still-pending setTimeout that `run()` nulls but never clears. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.evaluate(async () => {
    const s = window.BEA.store;
    for (let i = 0; i < 400; i++) {
      s.dispatch('setQuery', 'q' + i);
      await new Promise(r => requestAnimationFrame(r));
    }
  });
  // and the pure unit-level repro of the same race
  const unit = await page.evaluate(async () => {
    const { throttle } = await import('/app/js/core/util.js');
    let calls = 0, thrown = 0;
    const th = throttle(() => { calls++; }, 30);
    for (let i = 0; i < 200; i++) {
      try { th(); } catch (e) { thrown++; }
      await new Promise(r => setTimeout(r, 5));
    }
    await new Promise(r => setTimeout(r, 80));
    return { calls, thrownSynchronously: thrown };
  });
  log('unit repro: ' + JSON.stringify(unit));
};
