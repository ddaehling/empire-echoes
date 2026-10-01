/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  for (const step of [3, 9, 17]) {
    await page.evaluate((n) => { location.hash = '#tour=thirty&step=' + n; }, step);
    await page.waitForTimeout(1800);
    const r = await page.evaluate(() => {
      const s = window.BEA.store.getState();
      const rib = document.querySelector('.legend--ribbon');
      const pk = window.BEA.legend;
      return {
        year: s.year, layer: s.activeLayer, filters: s.filters,
        strip: rib ? rib.textContent.trim().replace(/\s+/g, ' ').slice(0, 160) : null,
        highlight: !!document.querySelector('.map[data-highlight]:not([data-highlight=""])'),
      };
    });
    log('step ' + step + ' :: ' + JSON.stringify(r));
    await shot('beat' + step);
  }
};
