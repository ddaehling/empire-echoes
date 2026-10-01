/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>{if(!/frameSpan/.test(e.message))errs.push('PE '+e.message)});
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(3200);
  await shot('m1-india-sheet');
  const d = await page.evaluate(()=>{
    const el=document.querySelector('.dossier'); const r=el.getBoundingClientRect();
    const host=document.querySelector('.app__dossier'); const hr=host.getBoundingClientRect();
    return {doss:{x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0}, host:{x:hr.x|0,y:hr.y|0,w:hr.width|0,h:hr.height|0},
      hostCls:host.className, text: el.innerText.slice(0,700)};
  });
  log(JSON.stringify(d.doss), JSON.stringify(d.host), d.hostCls);
  log('---\n'+d.text);
  // scroll the sheet
  await page.mouse.move(180, 500);
  for(let i=0;i<3;i++){await page.mouse.wheel(0,700); await page.waitForTimeout(250);}
  await shot('m2-scrolled');
  log('scrollTop', await page.evaluate(()=>document.querySelector('.app__dossier').scrollTop));
  log('ERRS', JSON.stringify(errs.slice(0,5)));
};
