/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const years = [1200,1500,1600,1607,1655,1707,1757,1776,1783,1807,1833,1834,1838,1857,1858,1876,1884,1899,1919,1922,1942,1947,1948,1956,1963,1997,2000,2027];
  for (const y of years) {
    await page.evaluate((yy) => { location.hash = '#year=' + yy; }, y);
    await page.waitForTimeout(320);
    const o = await page.evaluate(() => {
      const w = document.querySelector('.tl__warn');
      const c = document.querySelector('.tl__circa');
      return {
        year: document.querySelector('.tl__year')?.textContent,
        count: document.querySelector('.tl__count')?.textContent,
        circaShown: c ? !c.hidden : null,
        warn: w && w.offsetParent !== null ? w.textContent : null,
        warnLabel: w && w.offsetParent !== null ? (w.getAttribute('aria-label')||'').slice(0,220) : null,
        head: document.querySelector('.tl__changehead')?.innerText.replace(/\n/g,' | '),
        nothing: (() => { const n = document.querySelector('.tl__nothing'); return n && !n.hidden ? n.innerText.replace(/\n/g,' | ') : null; })(),
      };
    });
    log(JSON.stringify(o));
  }
};
