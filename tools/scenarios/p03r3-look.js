/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && document.querySelector('.tl') && document.querySelector('.tl').__p03, null, { timeout: 20000 });
  for (const y of [1947, 1919, 1996]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(250);
    await shot('bar-' + y, '.tl');
  }
  const h = await page.evaluate(() => {
    const tl = document.querySelector('.tl').getBoundingClientRect();
    const stage = document.getElementById('stage');
    return { tlH: Math.round(tl.height), stageH: stage ? Math.round(stage.getBoundingClientRect().height) : null, vh: innerHeight };
  });
  log('heights: ' + JSON.stringify(h));
};
