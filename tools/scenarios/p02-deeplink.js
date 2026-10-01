/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await page.waitForTimeout(2500);
  const cold = await page.evaluate(() => ({ def: window.__map.definition, hash: location.hash, filters: window.BEA.store.getState().filters }));
  log('COLD (loaded at #year=1913&def=controlled): ' + JSON.stringify(cold));
  const fired = await page.evaluate(async () => {
    let n = 0; window.addEventListener('hashchange', () => n++);
    location.hash = '#year=1913&def=administered';
    await new Promise((r) => setTimeout(r, 800));
    return { n, def: window.__map.definition, hash: location.hash };
  });
  log('WARM (hash set to def=administered): ' + JSON.stringify(fired));
  await page.waitForTimeout(700);
  log('after settle: ' + JSON.stringify(await page.evaluate(() => ({ def: window.__map.definition, hash: location.hash }))));
};
