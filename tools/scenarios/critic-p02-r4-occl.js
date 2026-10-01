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
      const c=document.querySelector('.map__plate').getBoundingClientRect();
      const overs=[...document.querySelectorAll('.map > *')].filter(e=>!/plate|targets|fade/.test(String(e.className)));
      const grid=[]; const N=60;
      let hit=0, tot=0;
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){
        const x=c.left+(i+0.5)*c.width/N, y=c.top+(j+0.5)*c.height/N; tot++;
        for(const o of overs){const b=o.getBoundingClientRect(); if(x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom){hit++;break;}}
      }
      return {pct: Math.round(100*hit/tot), mapW: Math.round(c.width), mapH: Math.round(c.height), overs: overs.map(o=>String(o.className)).slice(0,10)};
    });
    log(tag, JSON.stringify(r));
  };
  await f('default');
  await page.evaluate(()=>window.BEA.store.dispatch('select','gibraltar'));
  await page.waitForTimeout(1400);
  await f('with-dossier');
};
