/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { window.__errs = []; window.addEventListener('error', e => window.__errs.push(String(e.message))); window.__map.resetStats(); });
  const t0 = Date.now();
  await page.evaluate(async () => {
    const S = window.BEA.store;
    for (let y = 1600; y <= 1997; y++) {
      S.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(r));
    }
  });
  const ms = Date.now() - t0;
  const stats = await page.evaluate(() => ({ f: window.__map.frameStats(), errs: window.__errs.length, sample: window.__errs.slice(0,3) }));
  log('398-year scrub in ' + ms + 'ms');
  log('frameStats ' + JSON.stringify(stats.f));
  log('window errors ' + stats.errs + ' ' + JSON.stringify(stats.sample));
};
