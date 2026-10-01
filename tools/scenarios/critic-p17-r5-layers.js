/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(3000);
  const layers = ['status','tenure','mechanism','exit','informal','system'];
  for (const L of layers) {
    await page.evaluate(l=>{ location.hash = '#year=1913&layer='+l; }, L);
    await page.waitForTimeout(2000);
    const t = await page.evaluate(()=>{
      const lg=document.querySelector('[class*="legend"]');
      const by=document.querySelector('[class*="byline"]');
      return { legend: lg?lg.innerText.replace(/\s+/g,' ').slice(0,420):'none', byline: by?by.innerText.replace(/\s+/g,' ').slice(0,420):'none' };
    });
    log('LAYER '+L+' :: LEGEND: '+t.legend+'\n    BYLINE: '+t.byline);
    await shot('layer-'+L);
  }
  log('ERR '+JSON.stringify(errs));
};
