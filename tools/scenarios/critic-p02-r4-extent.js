/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const e = await page.evaluate(()=>{
    const c=document.querySelector('.map__plate'); const g=c.getContext('2d');
    const W=c.width,H=c.height; const d=g.getImageData(0,0,W,H).data;
    // sea colour = most common
    const hist={}; for(let i=0;i<d.length;i+=4*13){const k=d[i]+','+d[i+1]+','+d[i+2]; hist[k]=(hist[k]||0)+1;}
    const sea=Object.entries(hist).sort((a,b)=>b[1]-a[1])[0][0].split(',').map(Number);
    let minX=W,maxX=0,minY=H,maxY=0,land=0;
    for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const i=(y*W+x)*4;
      const dist=Math.abs(d[i]-sea[0])+Math.abs(d[i+1]-sea[1])+Math.abs(d[i+2]-sea[2]);
      if(dist>30){land++; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y;}}
    return {W,H,sea,minX,maxX,minY,maxY,landFrac:+(land/((W/2)*(H/2))).toFixed(3), worldWFrac:+((maxX-minX)/W).toFixed(3)};
  });
  log('EXTENT:', JSON.stringify(e));
};
