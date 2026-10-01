/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P02 map — the states a critic will look at: dark, mobile, reduced motion,
   selection, hover, tenure, deep link, zoom. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1860));
  await page.waitForTimeout(600);
  await shot('a-1860');

  await page.evaluate(() => window.__map.setDefinition('influenced'));
  await page.waitForTimeout(500);
  await shot('b-1860-influenced');
  log('informal units drawn:', JSON.stringify(await page.evaluate(() => {
    const m = window.__map;
    return [...m.plate.paint.entries()].filter(([, r]) => r.mode === 'informal').map(([k]) => k);
  })));

  await page.evaluate(() => { window.__map.setDefinition('claimed'); window.BEA.store.dispatch('setYear', 1913); });
  await page.waitForTimeout(400);

  /* selection + hover */
  await page.evaluate(() => {
    const m = window.__map;
    const s = m.unitScreen('in-west-bengal') || m.unitScreen('jamaica');
    m.module._selectUnit('in-west-bengal');
    m.plate.hover = 'ceylon';
    m.plate.draw();
  });
  await page.waitForTimeout(500);
  await shot('c-selected-bengal');

  /* tenure layer */
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'tenure'));
  await page.waitForTimeout(600);
  await shot('d-tenure');
  await page.evaluate(() => window.BEA.store.dispatch('setLayer', 'status'));
  await page.waitForTimeout(400);

  /* built-in weight metric: population */
  await page.evaluate(() => window.__map.sizeByPopulation());
  await page.waitForTimeout(600);
  await shot('e-weight-population');
  log('population weight:', JSON.stringify(await page.evaluate(() => {
    const w = window.__map.weight;
    return { metric: w.metric, counted: w.counted, missing: w.missing, sample: [...w.values.entries()].slice(0, 3) };
  })));
  await page.evaluate(() => window.__map.setWeight(null));
  await page.waitForTimeout(300);

  /* zoom into the Mediterranean: Gibraltar and Malta at real scale */
  await page.evaluate(() => { window.BEA.bus.emit('ask:flyTo', { unitId: 'gibraltar' }); });
  await page.waitForTimeout(1500);
  await shot('f-zoom-gibraltar');
  log('zoom:', JSON.stringify(await page.evaluate(() => {
    const m = window.__map;
    return { k: +m.plate.view.k.toFixed(2), fineLoaded: !!m.module.fineFlat, gib: m.unitScreen('gibraltar') };
  })));

  await page.evaluate(() => window.BEA.store.dispatch('setMapView', { k: 1, x: 0, y: 0 }));
  await page.waitForTimeout(500);

  /* keyboard: focus a unit, arrow to a neighbour, Enter to select */
  const kb = await page.evaluate(async () => {
    const m = window.__map;
    m.module._focusUnit('malta');
    const first = document.activeElement && document.activeElement.dataset.unit;
    const ev = (key, shift = false) => document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key, shiftKey: shift, bubbles: true, cancelable: true }));
    ev('ArrowLeft');
    const afterLeft = document.activeElement && document.activeElement.dataset.unit;
    ev('Enter');
    return { first, afterLeft, selected: window.BEA.store.getState().selectedTerritoryId,
      label: document.activeElement && document.activeElement.getAttribute('aria-label') };
  });
  log('keyboard:', JSON.stringify(kb));
  await shot('g-keyboard-focus');
};
