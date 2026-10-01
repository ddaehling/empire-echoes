/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const tl = document.querySelector('.tl'); const cs = getComputedStyle(tl);
    return {
      rootFont: getComputedStyle(document.documentElement).fontSize,
      vw: innerWidth, vh: innerHeight,
      mq62: matchMedia('(max-width: 62rem)').matches,
      mq6199: matchMedia('(max-width: 61.999rem)').matches,
      mq46: matchMedia('(max-width: 46rem)').matches,
      areas: cs.gridTemplateAreas, cols: cs.gridTemplateColumns, rows: cs.gridTemplateRows,
      alignContent: cs.alignContent, alignItems: cs.alignItems,
      pad: cs.padding, rowGap: cs.rowGap,
      timeband: document.getElementById('app')?.getAttribute('data-timeband'),
      dock: document.getElementById('app')?.getAttribute('data-dock'),
      rail: document.getElementById('app')?.getAttribute('data-rail'),
    };
  })));
};
