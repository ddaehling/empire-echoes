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
  const r = await page.evaluate(()=>{
    const B = window.BEA || {};
    const rep = B.registry && B.registry.report ? B.registry.report() : null;
    const d = B.data;
    let m = null, err=null;
    try { m = d && typeof d.metricsAt==='function' ? d.metricsAt(1913) : 'NO metricsAt'; } catch(e){ err=String(e); }
    return { keys:Object.keys(B), mounted: rep && rep.mounted, missing: rep && rep.missing, metrics: m, err,
      dataFns: d? Object.keys(d).filter(k=>typeof d[k]==='function') : null,
      hasSymbology: !!B.symbology };
  });
  log(JSON.stringify(r, null, 1).slice(0,4000));
};
