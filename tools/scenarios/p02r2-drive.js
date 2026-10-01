/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));

  /* deep link: definition and projection restore from the hash */
  await page.goto('http://localhost:8777/app/#year=1913&def=controlled&proj=equal-earth', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  log('deep link', JSON.stringify(await page.evaluate(() => ({ def: window.__map.definition, proj: window.__map.projection, painted: [...window.__map.plate.paint.values()].filter(r => r.mode === 'fill' && !r.lost).length }))));

  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  /* hover over the canvas must still update the store */
  const hov = await page.evaluate(async () => {
    const s = window.__map.unitScreen('in-west-bengal') || window.__map.unitScreen('gibraltar');
    const r = document.querySelector('.map__plate').getBoundingClientRect();
    return { x: r.x + s.mx, y: r.y + s.my };
  });
  await page.mouse.move(hov.x, hov.y);
  await page.waitForTimeout(300);
  log('hover', JSON.stringify(await page.evaluate(() => ({ hovered: window.BEA.store.getState().hoveredUnitId, cursorClass: document.querySelector('.map').className }))));

  /* keyboard: tab to a unit, walk with arrows, Enter to select */
  const kb = await page.evaluate(async () => {
    const t = document.getElementById('map-u-gibraltar'); if (!t) return 'no target';
    t.focus();
    return { focused: document.activeElement.dataset.unit, tabindex: t.tabIndex };
  });
  log('keyboard focus', JSON.stringify(kb));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250);
  log('after two ArrowRight', JSON.stringify(await page.evaluate(() => ({ active: document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.unit : null, focusUnit: window.BEA.store.getState().focusedUnitId }))));
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  log('after Enter', JSON.stringify(await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId)));
  await page.keyboard.press('Shift+ArrowLeft'); await page.waitForTimeout(250);
  log('shift-arrow pans', JSON.stringify(await page.evaluate(() => window.__map.plate.view)));

  /* the 1..4 keys and p and s */
  for (const k of ['2', '3', '4', '1', 'p', 's']) { await page.keyboard.press(k); await page.waitForTimeout(700); }
  log('after keys 2 3 4 1 p s', JSON.stringify(await page.evaluate(() => ({ def: window.__map.definition, proj: window.__map.projection, stitch: window.__map.stitch }))));
  await page.keyboard.press('s'); await page.waitForTimeout(400);

  /* selection outline exists and no fill change */
  await page.evaluate(() => window.BEA.store.dispatch('select', 'gibraltar'));
  await page.waitForTimeout(400);
  await shot('01-selected');
  log('errors', JSON.stringify(errs));
};
