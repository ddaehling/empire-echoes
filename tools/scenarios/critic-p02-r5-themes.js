/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  await shot('theme', '.map__frame');
  await shot('full');
  // sample canvas pixels for pure black/white
  log('pixels:', await page.evaluate(()=>{
    const c=document.querySelector('.map__plate'); const g=c.getContext('2d');
    const d=g.getImageData(0,0,c.width,c.height).data; const seen={}; let black=0,white=0,n=0;
    for(let i=0;i<d.length;i+=4*97){ const r=d[i],gg=d[i+1],b=d[i+2],a=d[i+3]; if(a<10) continue; n++;
      if(r===0&&gg===0&&b===0) black++; if(r===255&&gg===255&&b===255) white++;
      const k=r+','+gg+','+b; seen[k]=(seen[k]||0)+1; }
    const top=Object.entries(seen).sort((a,b)=>b[1]-a[1]).slice(0,10);
    return JSON.stringify({n, black, white, top});
  }));
};
