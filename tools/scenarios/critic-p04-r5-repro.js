/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const cases = [
    '#year=1913&sel=jamaica',
    '#year=1765&sel=bengal-presidency',
    '#year=1913&sel=kenya',
    '#year=1857&sel=british-india',
  ];
  for (const c of cases) {
    const errs=[]; const h=e=>errs.push(String(e.message||e)); page.on('pageerror',h);
    await page.goto('http://localhost:8777/app/'+c, { waitUntil:'load' });
    await page.waitForTimeout(3200);
    const d = await page.evaluate(()=>{
      const f=document.querySelector('.map__furniture'); const s=document.querySelector('.map__switch');
      const doss=document.querySelector('.dossier');
      const sr=s?s.getBoundingClientRect():null, dr=doss.getBoundingClientRect();
      const overlap = sr ? Math.max(0, Math.min(sr.right,dr.right)-Math.max(sr.left,dr.left)) : 0;
      return { fur:f?f.className:null, overlapPx: Math.round(overlap), dossX: Math.round(dr.x), dossW: Math.round(dr.width) };
    });
    log(c+'  →  '+JSON.stringify(d)+'   errors:'+errs.length+' '+(errs[0]||''));
    await shot('repro'+cases.indexOf(c));
    page.off('pageerror',h);
  }
};
