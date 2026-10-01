/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P17 round 4 — what this panel says when the map module is not running.
   Round 3 had no visible fallback for P02's mount race; one run in four the
   plate never drew and the legend described it anyway. */
module.exports = async ({ page, shot, log }) => {
  await page.route('**/js/map/index.js', r => r.abort());
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForTimeout(8000);
  log('legend present:', await page.evaluate(() => !!document.querySelector('.legend')));
  log('byline defect:', await page.evaluate(() => {
    const b = document.querySelector('#legend-byline');
    return b ? b.innerText.replace(/\s+/g, ' ') : 'NO BYLINE';
  }));
  log('key defect:', await page.evaluate(() => {
    const d = document.querySelector('.legend .legend__defect');
    return d ? d.textContent.slice(0, 200) : 'none';
  }));
  await page.evaluate(() => window.BEA.legend.openPlate('criticism'));
  await page.waitForTimeout(700);
  log('criticism with no plate:', await page.evaluate(() =>
    document.querySelector('#legend-criticism').innerText.replace(/\s+/g,' ').slice(0, 700)));
  await shot('nomap');
};
