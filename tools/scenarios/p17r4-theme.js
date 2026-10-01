/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await page.evaluate(() => window.BEA.legend.openPlate('colour'));
  await page.waitForTimeout(900);
  await shot('plate');
  await shot('key', '.stage__legend');
  log('theme:', await page.evaluate(() => document.documentElement.dataset.theme),
      'motion:', await page.evaluate(() => document.documentElement.dataset.motion));
  log('contrast probe:', JSON.stringify(await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e);
      return { color: c.color, bg: c.backgroundColor }; };
    return { plate: g('#legend-plate'), colA: g('.lplate__col--a'), colB: g('.lplate__col--b'),
      word: g('.legend__word'), sent: g('.legend__sentence'), opt: g('.lplate__opt'),
      byline: g('#legend-byline'), open: g('.legend__open') };
  })));
};
