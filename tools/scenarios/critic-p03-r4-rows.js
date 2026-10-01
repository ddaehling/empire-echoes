/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const years = [1607,1655,1704,1757,1765,1783,1788,1807,1834,1838,1842,1857,1858,1882,1898,1919,1922,1947,1948,1956,1960,1963,1965,1980,1997,2019];
  for (const y of years) {
    await page.evaluate(yy => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(420);
    const t = await page.evaluate(() => {
      const row = document.querySelector('.tl-row, .tl-cards') || document.querySelector('.tl-chg')?.parentElement;
      const cards = [...document.querySelectorAll('.tl-chg')].map(n => n.innerText.replace(/\n/g,' | '));
      const lead = document.querySelector('.tl-year, .tl-head')?.innerText || '';
      const body = document.body.innerText;
      const idx = body.indexOf('things dated');
      return { cards, summary: idx>0 ? body.slice(idx-60, idx+180).replace(/\n/g,' ') : '' };
    });
    log('=== ' + y + ' :: ' + t.summary);
    t.cards.forEach(c => log('   - ' + c.slice(0, 400)));
  }
};
