/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Not a map test. A minimal reproduction of the shell bug that produces
   "TypeError: a is not iterable" from core/util.js `throttle`, so the shell
   owner can see it without guessing. Any module that dispatches every frame
   (the map's setMapView, the timeline's setYear) reaches this. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 30000 });
  log(JSON.stringify(await page.evaluate(async () => {
    const { throttle } = await import('/app/js/core/util.js');
    let calls = 0, err = null;
    const th = throttle(() => { calls++; }, 150);
    th();                       // leading edge: runs now, args -> null, t -> null
    th();                       // schedules a trailing run at +150ms
    const t0 = performance.now();
    while (performance.now() - t0 < 200) { /* block past the timer's due time */ }
    try { th(); } catch (e) { err = String(e); }   // wait<=0 -> runs, clears t, args -> null
    await new Promise(r => setTimeout(r, 60));     // the ORPHANED timer now fires run()
    return { calls, errorFromDirectCall: err, note: 'the throw arrives asynchronously as an uncaught error' };
  })));
  await page.waitForTimeout(400);
};
