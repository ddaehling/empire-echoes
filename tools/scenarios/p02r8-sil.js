/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2400);
  const at = async (y) => {
    await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(700);
    return page.evaluate(() => {
      const m = window.BEA.map;
      return { est: m.holesAt(), first: m.firstHoleYear() };
    });
  };
  for (const y of [1700, 1900, 1909, 1910, 1955, 1963, 1997]) {
    log(y + ' estimate ' + JSON.stringify(await at(y)));
  }
  // engage at a year that has holes and count what is actually drawn
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1963));
  await page.waitForTimeout(700);
  await page.keyboard.press('h');
  await page.waitForTimeout(1000);
  log('1963 ON ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map; let holes = 0, quiet = 0; const ids = [];
    for (const [id, r] of m.plate.paint) { if (r.mode === 'hole') { holes++; ids.push(id); } if (r.quiet) quiet++; }
    return { holes, ids: ids.slice(0, 12), quiet, silence: document.querySelector('.map').dataset.silence,
      say: (document.querySelector('.cx-lede__say') || {}).textContent };
  })));
  await shot('sil-1963');
  // scrub back with the mode still on
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1700));
  await page.waitForTimeout(900);
  log('1700 STILL ON ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map; let holes = 0, quiet = 0;
    for (const [, r] of m.plate.paint) { if (r.mode === 'hole') holes++; if (r.quiet) quiet++; }
    return { holes, quiet, silence: document.querySelector('.map').dataset.silence,
      say: (document.querySelector('.cx-lede__say') || {}).textContent };
  })));
  await shot('sil-1700');
};
