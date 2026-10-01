/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  log(JSON.stringify(await page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    const at = (y) => p.events.at(y).map(e => ({ t: e.title.slice(0,52), cs: e.changedStatus, terr: e.territoryIds }));
    return { 1882: at(1882), 1763: at(1763), 1820: at(1820), 1900: at(1900), 1919: at(1919) };
  }), null, 1));
};
