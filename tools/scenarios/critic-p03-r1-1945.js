/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const d = window.BEA.data;
    const a = d.acquisitions.filter(x => x.year === 1945).map(x => x.mechanism + ' :: ' + (x.territoryName||x.territoryId) + ' :: ' + (x.how||'').slice(0,120));
    const l = d.departures.filter(x => x.year === 1945).map(x => x.mechanism + ' :: ' + (x.territoryName||x.territoryId));
    // peak year
    const tl = d.timeline();
    let peak = {y:0,n:-1}; let rise={y:0,d:0}, fall={y:0,d:0};
    for (let y=tl.min;y<=tl.max;y++){const n=tl.unitsByYear[y-tl.min]; if(n>peak.n)peak={y,n}; if(y>tl.min){const dd=n-tl.unitsByYear[y-1-tl.min]; if(dd>rise.d)rise={y,d:dd}; if(dd<fall.d)fall={y,d:dd};}}
    return { acq1945: a, dep1945: l, peak, rise, fall, acq1942: d.acquisitions.filter(x=>x.year===1942).length, dep1942: d.departures.filter(x=>x.year===1942).map(x=>x.mechanism+' :: '+(x.territoryName||x.territoryId)) };
  });
  log(JSON.stringify(r, null, 1).slice(0, 5000));
};
