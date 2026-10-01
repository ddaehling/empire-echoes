/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(200);
  log(await page.evaluate(() => {
    const h = s => { const n = document.querySelector(s); return n ? Math.round(n.getBoundingClientRect().height) : -1; };
    return JSON.stringify({ vw: innerWidth, vh: innerHeight, time: h('.app__time'), tl: h('.tl'),
      deck: h('.tl__deck'), changes: h('.tl__changes'), ax: h('.tl-ax'), spine: h('.tl-spine'),
      caption: h('.tl-spine__caption'), stage: h('.app__stage') });
  }));
};
