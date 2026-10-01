/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  const ready = () => page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await ready(); await page.waitForTimeout(900);
  const st = async (tag) => log(tag + ' :: ' + JSON.stringify(await page.evaluate(() => ({
    hash: location.hash, len: history.length,
    year: window.BEA.store.getState().year, sel: window.BEA.store.getState().selectedTerritoryId,
    filters: JSON.stringify(window.BEA.store.getState().filters),
  }))));
  await st('0 load');
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1800); window.BEA.store.flush(); });
  await page.waitForTimeout(400); await st('1 year 1800 (replace)');
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(400); await st('2 select (push)');
  await page.evaluate(() => { window.BEA.store.dispatch('setLayer', 'trade'); window.BEA.store.flush(); });
  await page.waitForTimeout(400); await st('3 layer (push)');
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1850); window.BEA.store.flush(); });
  await page.waitForTimeout(400); await st('4 year 1850 (replace)');
  await page.goBack(); await page.waitForTimeout(600); await st('5 back  -> want sel=barbados layer=status');
  await page.goBack(); await page.waitForTimeout(600); await st('6 back  -> want sel=null');
  await page.goForward(); await page.waitForTimeout(600); await st('7 fwd   -> want sel=barbados');
  await page.goForward(); await page.waitForTimeout(600); await st('8 fwd   -> want layer=trade year=1850');
};
