/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path=require('path');
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  const meta = await page.evaluate(()=>{
    const el=document.querySelector('.dossier');
    let p=el.parentElement, scroller=null;
    while(p){ if(p.scrollHeight>p.clientHeight+4 && getComputedStyle(p).overflowY!=='visible'){scroller=p.className||p.tagName;break;} p=p.parentElement;}
    return {scroller, docScroll: document.documentElement.scrollHeight, win: window.innerHeight,
      bodyOverflow: getComputedStyle(document.body).overflow,
      switchPos: getComputedStyle(document.querySelector('.map__furniture')).position};
  });
  log(JSON.stringify(meta));
  for (let i=0;i<6;i++){
    await page.mouse.move(1200,500);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(500);
    await shot('scroll-'+i);
  }
  const after = await page.evaluate(()=>{
    const sw=document.querySelector('.map__switch'); const r=sw.getBoundingClientRect();
    const d=document.querySelector('.dossier').getBoundingClientRect();
    return {sw:{x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0}, doss:{x:d.x|0,y:d.y|0,w:d.width|0,h:d.height|0}};
  });
  log('after scroll', JSON.stringify(after));
};
