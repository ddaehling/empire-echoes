/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('01-dark-first');
  const b = await page.evaluate(() => { const m=[...document.querySelectorAll('button,a')].find(e=>/open the full key|the colour key/i.test(e.innerText)); if(!m)return null; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  if(b){await page.mouse.click(b.x,b.y); await page.waitForTimeout(1200);}
  await shot('02-dark-key');
  const col = await page.evaluate(()=>{ const e=document.querySelector('.lplate__col--a'); if(!e)return null; const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; });
  if(col) await page.screenshot({path:'/tmp/p17r5-dark/zoom-col.png', clip:{x:col.x,y:col.y,width:col.w,height:Math.min(col.h,700)}});
  // contrast check on legend text
  const c = await page.evaluate(()=>{
    const out=[];
    for(const sel of ['.legend__h','.legend__chip','[class*="byline"] *']){
      const e=document.querySelector(sel); if(!e)continue; const cs=getComputedStyle(e);
      out.push({sel,color:cs.color,bg:cs.backgroundColor,size:cs.fontSize});
    }
    return out;
  });
  log('STYLES '+JSON.stringify(c));
};
