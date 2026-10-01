/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.waitForFunction: Timeout 20000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, url }) => {
  const base = url.split('#')[0];
  const snap = async () => {
    await page.waitForFunction(() => window.BEA && document.querySelector('.tl-chg'), null, { timeout: 20000 });
    await page.waitForTimeout(600);
    return page.evaluate(() => ({
      def: document.querySelector('.tl').dataset.definition,
      count: document.querySelector('.tl__count').textContent,
      head: document.querySelector('.tl__changecount').textContent,
      cards: [...document.querySelectorAll('.tl-chg:not(.tl-chg--more)')].filter(c => !c.hidden)
        .map(c => c.querySelector('.tl-chg__subject').textContent),
    }));
  };
  for (let i = 0; i < 3; i++) {
    await page.goto(base + '#year=1858&def=controlled', { waitUntil: 'load' });
    log('run ' + i + ': ' + JSON.stringify(await snap()));
  }
};
