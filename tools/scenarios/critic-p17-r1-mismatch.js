/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const r = await page.evaluate(async ()=>{
    const d = window.BEA.data;
    const out=[];
    for (const y of [1700,1770,1800,1858,1900,1913,1922,1945,1947,1960,1997,2023]) {
      const m = d.metricsAt(y);
      const es = [...d.statusAt(y).values()];
      const deg1 = es.filter(e=>Number(e.controlDegree)>=1).length;
      const terr1 = new Set(es.filter(e=>Number(e.controlDegree)>=1).map(e=>e.territoryId)).size;
      const nullDeg = es.filter(e=>e.controlDegree==null).length;
      out.push({y, metricsUnits:m.units, metricsControlled:m.controlledUnits, metricsTerr:m.territories, deg1, terr1, nullDeg, total:es.length});
    }
    return out;
  });
  log(JSON.stringify(r,null,1));
  // read legend + timeline readouts across those years
  const reads=[];
  for (const y of [1700,1858,1913,1947]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(1200);
    const t = await page.evaluate(()=>({
      legend:(document.querySelector('.legend__figures')||{}).innerText,
      tl:(document.querySelector('.tl')||{}).innerText.split('\n').slice(0,4).join(' | '),
      card:(()=>{const e=[...document.querySelectorAll('*')].find(n=>/units drawn/.test(n.textContent||'')&&n.children.length<6); return e?e.innerText.replace(/\n/g,' '):null;})(),
    }));
    reads.push({y, ...t});
  }
  log('READOUTS: '+JSON.stringify(reads,null,1));
};
