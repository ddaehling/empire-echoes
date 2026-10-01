/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  for (const y of [1955, 1963]) {
    await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(800);
    log(y + ' card ' + JSON.stringify(await page.evaluate(() => document.querySelector('.map__switchbody').innerText)));
  }
  await page.keyboard.press('h');
  await page.waitForTimeout(1000);
  log('silence mode ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map;
    let holes = 0; const ids = [];
    for (const [id, r] of m.plate.paint) if (r.mode === 'hole') { holes++; ids.push(id); }
    return { holes, ids, card: document.querySelector('.map__switchbody').innerText.slice(0, 700) };
  })));
  await shot('silences');
  await page.keyboard.press('h');
};
