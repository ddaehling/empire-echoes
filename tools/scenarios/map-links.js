/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Deep links, theme switching, and the URL contract. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  log('entry state:', JSON.stringify(await page.evaluate(() => ({
    definition: window.__map.definition,
    projection: window.__map.projection,
    year: window.BEA.store.getState().year,
    units: window.__map.measures[window.__map.definition].units,
    hash: location.hash,
  }))));
  await shot('deeplink');

  /* the definition survives a round trip through the URL the shell writes */
  await page.evaluate(() => window.__map.setDefinition('administered'));
  await page.waitForTimeout(500);
  log('after switch:', JSON.stringify(await page.evaluate(() => ({ hash: location.hash, def: window.__map.definition }))));

  /* forced lamplit theme, live */
  await page.evaluate(() => window.BEA.store.dispatch('setTheme', 'lamplit'));
  await page.waitForTimeout(700);
  await shot('theme-lamplit');
  log('tokens after theme:', JSON.stringify(await page.evaluate(() => {
    const T = window.__map.plate.tokens;
    return { sea: T.sea, coast: T.coast, crown: T.fills['crown-conquered'], paper: T.paper };
  })));
  await page.evaluate(() => window.BEA.store.dispatch('setTheme', 'paper'));
  await page.waitForTimeout(600);
  await shot('theme-paper');
  log('tokens back:', JSON.stringify(await page.evaluate(() => {
    const T = window.__map.plate.tokens;
    return { sea: T.sea, coast: T.coast, crown: T.fills['crown-conquered'] };
  })));
};
