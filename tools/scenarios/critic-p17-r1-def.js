/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'slice').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const r = await page.evaluate(()=>{
    const d=window.BEA.data; const es=[...d.statusAt(1913).values()];
    const deg1 = es.filter(e=>e.controlDegree>=1);
    const inf = es.filter(e=>e.status==='informal-sphere');
    const infDeg = {}; inf.forEach(e=>{infDeg[e.controlDegree]=(infDeg[e.controlDegree]||0)+1;});
    const claimedTest = es.filter(e=>e.controlDegree>=1 && e.status!=='informal-sphere');
    const influencedTest = es.filter(e=>e.controlDegree>=1 || e.status==='informal-sphere');
    return { total:es.length, deg1:deg1.length, informal:inf.length, infDeg,
      claimedTest:claimedTest.length, influencedTest:influencedTest.length,
      metrics:{u:d.metricsAt(1913).units, c:d.metricsAt(1913).controlledUnits, t:d.metricsAt(1913).territories} };
  });
  log(JSON.stringify(r,null,1));
  // read the four definitions on screen
  for (const k of ['1','2','3','4']) {
    await page.keyboard.press(k); await page.waitForTimeout(700);
    const s = await page.evaluate(()=>({fig:(document.querySelector('.legend__figures')||{}).innerText, by:(document.querySelector('#legend-byline .byline__line')||{}).innerText.slice(-90)}));
    log('key '+k+': '+JSON.stringify(s));
  }
};
