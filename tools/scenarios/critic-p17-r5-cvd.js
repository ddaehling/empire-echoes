/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'getBoundingClientR.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const MAT = {
  protanopia: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
  achromatopsia: '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0',
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = await page.evaluate(() => { const m=[...document.querySelectorAll('button,a')].find(e=>/open the full key/i.test(e.innerText)); const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1200);
  await page.evaluate((mats)=>{
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg'); svg.setAttribute('style','position:fixed;width:0;height:0');
    for(const [k,v] of Object.entries(mats)){
      const f=document.createElementNS(ns,'filter'); f.setAttribute('id','cvd-'+k);
      const m=document.createElementNS(ns,'feColorMatrix'); m.setAttribute('type','matrix'); m.setAttribute('values',v);
      f.appendChild(m); svg.appendChild(f);
    }
    document.body.appendChild(svg);
  }, MAT);
  const col = await page.evaluate(()=>{ const e=document.querySelector('.lplate__col--a'); const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  log('COL '+JSON.stringify(col));
  await page.screenshot({path:'/tmp/p17r5-cvd/normal.png', clip:{x:col.x,y:col.y,width:col.w,height:Math.min(col.h,700)}});
  for (const k of Object.keys(MAT)) {
    await page.evaluate(kk=>{ document.documentElement.style.filter='url(#cvd-'+kk+')'; }, k);
    await page.waitForTimeout(400);
    await page.screenshot({path:'/tmp/p17r5-cvd/'+k+'.png', clip:{x:col.x,y:col.y,width:col.w,height:Math.min(col.h,700)}});
  }
  await page.evaluate(()=>{document.documentElement.style.filter='';});
  log('done');
};
