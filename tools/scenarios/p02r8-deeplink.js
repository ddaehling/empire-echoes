/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** A restored deep link must not unlock the map's tray. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(2000);
  log(JSON.stringify(await page.evaluate(() => {
    const vis = (s) => { const e = document.querySelector(s); if (!e) return false; const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0; };
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.width + 'x' + b.height; };
    return { lvl: document.getElementById('app').dataset.stage, year: window.BEA.store.getState().year,
      tiles: vis('.map__modes'), door: vis('.map__modesmore'), dial: vis('.map__switch'),
      sheetlink: vis('.map__sheetlink'), zooms: vis('.map__zooms'),
      mapCanvas: g('.stage__map canvas'), stageMap: g('.stage__map'),
      mapButtons: [...document.querySelectorAll('.map__furniture button')].filter(e => e.getBoundingClientRect().width).length };
  })));
  await shot('deeplink');
};
