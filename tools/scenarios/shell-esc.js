/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  const st = () => page.evaluate(() => JSON.stringify({
    rail: document.getElementById('app').dataset.rail,
    sheet: document.getElementById('app').dataset.sheet,
    doss: document.getElementById('app').dataset.dossier,
    sel: window.BEA.store.getState().selectedTerritoryId,
    overlay: window.BEA.store.getState().panelState.overlay,
    tour: window.BEA.store.getState().activeTour,
    active: document.activeElement ? document.activeElement.tagName + '.' + String(document.activeElement.className).slice(0,30) : null,
  }));
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(1200); log('selected  ' + await st());
  await page.keyboard.press('Escape'); await page.waitForTimeout(600); log('esc 1     ' + await st());
  await page.keyboard.press('Escape'); await page.waitForTimeout(600); log('esc 2     ' + await st());
  await page.keyboard.press('Escape'); await page.waitForTimeout(600); log('esc 3     ' + await st());
};
