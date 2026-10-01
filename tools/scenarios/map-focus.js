/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* The focus ring and the selection outline, close up. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(500);
  await page.evaluate(() => window.BEA.bus.emit('ask:flyTo', { unitId: 'malta', zoom: 5 }));
  await page.waitForTimeout(900);
  await page.evaluate(() => { window.__map.module._focusUnit('malta'); window.__map.module._selectUnit('malta'); });
  await page.waitForTimeout(400);
  await shot('focus-malta');
  await page.evaluate(() => { const m = window.__map; m.plate.hover = 'cyprus'; m.plate.draw(); });
  await page.waitForTimeout(200);
  await page.evaluate(() => window.BEA.bus.emit('ask:flyTo', { unitId: 'in-west-bengal', zoom: 4 }));
  await page.waitForTimeout(900);
  await page.evaluate(() => { const st = window.BEA.store.getState(); window.__map.module._selectUnit('in-west-bengal'); window.__map.plate.hover = 'in-bihar'; window.__map.plate.draw(); });
  await page.waitForTimeout(400);
  await shot('selection-india');
  log('selected:', await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId));
  log('selectedUnits:', await page.evaluate(() => window.__map.plate.selectedUnits ? [...window.__map.plate.selectedUnits].slice(0, 8) : null));
};
