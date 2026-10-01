/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const stage = require('./p02-stage.js');
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await stage(page);
  for (const y of [1700, 1830, 1900, 1947]) {
    const r = await page.evaluate((yy) => {
      window.BEA.store.dispatch('setYear', yy); window.BEA.store.flush();
      window.__map.plate.draw();
      const L = window.__map.plate.labelsDrawn.map((l) => l.text);
      return { n: L.length, home: L.filter((t) => /Britain|Kingdom|England|Britannia/i.test(t)), all: L.slice(0, 8) };
    }, y);
    log(y + ': ' + r.n + ' labels drawn; metropole label = ' + JSON.stringify(r.home) + '; first few = ' + JSON.stringify(r.all));
  }
};
