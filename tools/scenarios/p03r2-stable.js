/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* The bar must not change height as you scrub: the map is above it and would
   re-layout every year. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  const hs = await page.evaluate(async () => {
    const out = {};
    for (const y of [1600, 1765, 1820, 1858, 1900, 1942, 1945, 1947, 1948, 1963, 1997, 2027]) {
      window.BEA.store.dispatch('setYear', y);
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      out[y] = [Math.round(document.querySelector('.tl').getBoundingClientRect().height),
                Math.round(document.querySelector('.map').getBoundingClientRect().height)];
    }
    return out;
  });
  log(JSON.stringify(hs));
};
