/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  const f = async (tag) => {
    const r = await page.evaluate(()=>{
      const plate=document.querySelector('.map__plate'); const c=plate.getBoundingClientRect();
      const N=70; let hit=0, tot=0; const who={};
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){
        const x=c.left+(i+0.5)*c.width/N, y=c.top+(j+0.5)*c.height/N;
        if(x<0||y<0||x>innerWidth||y>innerHeight) continue;
        tot++;
        const el=document.elementFromPoint(x,y);
        if(!el) continue;
        if(el===plate || el.classList.contains('map__target') || el.classList.contains('map__targets') || el.classList.contains('map__fade')) continue;
        hit++; const k=String(el.className).split(' ')[0]; who[k]=(who[k]||0)+1;
      }
      return {occludedPct: Math.round(100*hit/tot), mapW:Math.round(c.width), mapH:Math.round(c.height), by: Object.entries(who).sort((a,b)=>b[1]-a[1]).slice(0,6)};
    });
    log(tag, JSON.stringify(r));
  };
  await f('default');
  await page.evaluate(()=>window.BEA.store.dispatch('select','gibraltar'));
  await page.waitForTimeout(1500);
  await f('with-dossier');
};
