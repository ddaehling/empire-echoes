/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(1400);
  log(JSON.stringify(await page.evaluate(() => {
    const e = document.querySelector('.cx-lede__say');
    const cs = getComputedStyle(e);
    const p = document.querySelector('.tl').__p03;
    return { w: e.clientWidth, fs: cs.fontSize, budget: p.sayBudget(), text: e.textContent, len: e.textContent.length,
             h: e.clientHeight, sh: e.scrollHeight, maxw: cs.maxWidth };
  })));
};
