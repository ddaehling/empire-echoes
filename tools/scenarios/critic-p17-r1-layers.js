/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'replace').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  await page.addStyleTag({content:'.app{height:100dvh}'});
  await page.waitForTimeout(400);
  for (const l of ['status','tenure','mechanism','exit','informal','system']) {
    await page.evaluate(x=>{ window.BEA.store.act.setActiveLayer ? window.BEA.store.act.setActiveLayer(x) : (location.hash='#year=1913&layer='+x); }, l);
    await page.waitForTimeout(1400);
    const s = await page.evaluate(()=>({layer:window.BEA.store.getState().activeLayer, byline:(document.querySelector('#legend-byline .byline__line')||{}).innerText.replace(/\n/g,' ').match(/COLOUR(.*?)YEAR/)?.[1]}));
    log(l+' -> state='+s.layer+' | byline colour="'+s.byline+'"');
    await shot('layer-'+l);
  }
};
