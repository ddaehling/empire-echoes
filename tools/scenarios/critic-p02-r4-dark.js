/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path=require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const out='/tmp/cp02r4-dark'; require('fs').mkdirSync(out,{recursive:true});
  await page.evaluate(()=>{location.hash='#year=1913';});
  await page.waitForTimeout(1500);
  log('theme attr:', await page.evaluate(()=>document.documentElement.dataset.theme || getComputedStyle(document.documentElement).colorScheme));
  await page.screenshot({path: path.join(out,'dark-map.png'), clip:{x:0,y:56,width:1440,height:340}});
  // sample canvas pixels for pure black/white
  const px = await page.evaluate(()=>{
    const c=document.querySelector('.map__plate'); const ctx=c.getContext('2d');
    const d=ctx.getImageData(0,0,c.width,c.height).data;
    let black=0, white=0, tot=0; const hist={};
    for(let i=0;i<d.length;i+=4*97){ tot++; const r=d[i],g=d[i+1],b=d[i+2];
      if(r===0&&g===0&&b===0) black++; if(r===255&&g===255&&b===255) white++;
      const k=[r,g,b].join(','); hist[k]=(hist[k]||0)+1; }
    const top=Object.entries(hist).sort((a,b)=>b[1]-a[1]).slice(0,8);
    return {tot, black, white, top};
  });
  log('PIXELS:', JSON.stringify(px));
};
