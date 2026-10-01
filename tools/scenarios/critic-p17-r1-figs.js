/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1700', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const rows=[];
  for (const y of [1600,1700,1720,1770,1800,1858,1900,1913,1922,1947,1960,1990,2023]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(900);
    const t = await page.evaluate((yy)=>{
      const m = window.BEA.data.metricsAt(yy);
      return {
        legend:(document.querySelector('.legend__figures')||{}).innerText,
        delta:(document.querySelector('.legend__delta')||{innerText:''}).innerText,
        metrics: m.controlledUnits+'u '+m.territories+'t',
        tlSum: (document.querySelector('.tl__count')||document.querySelector('[class*="tl__"][class*="count"]')||{innerText:''}).innerText,
      };
    }, y);
    rows.push({y, ...t});
  }
  log(JSON.stringify(rows,null,1));
};
