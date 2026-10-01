/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  const check = async (tag) => {
    const r = await page.evaluate(()=>{
      const bar=document.querySelector('.app__bar');
      const ctl=[...bar.querySelectorAll('button,a[href],[role="button"]')].filter(e=>e.offsetParent!==null)
        .map(e=>({t:(e.textContent||'').trim().replace(/\s+/g,' ').slice(0,26), b:e.getBoundingClientRect()}));
      const ov=[];
      for(let i=0;i<ctl.length;i++)for(let j=i+1;j<ctl.length;j++){
        const a=ctl[i].b,c=ctl[j].b;
        const ix=Math.max(0,Math.min(a.right,c.right)-Math.max(a.left,c.left));
        const iy=Math.max(0,Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top));
        if(ix*iy>30) ov.push({a:ctl[i].t,b:ctl[j].t,area:Math.round(ix*iy),
          arect:[Math.round(a.x),Math.round(a.y),Math.round(a.width),Math.round(a.height)],
          brect:[Math.round(c.x),Math.round(c.y),Math.round(c.width),Math.round(c.height)]});
      }
      // truncation: elements with ellipsis
      const trunc=[];
      document.querySelectorAll('*').forEach(e=>{
        if(e.children.length) return; const t=(e.textContent||'').trim(); if(t.length<8) return;
        const cs=getComputedStyle(e);
        if((cs.textOverflow==='ellipsis'||cs.webkitLineClamp!=='none') && (e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1))
          trunc.push({t:t.slice(0,90), cls:(e.className||'').toString().slice(0,40), sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight});
      });
      const lede=document.querySelector('.app__lede');
      return {controls:ctl.map(c=>({t:c.t,r:[Math.round(c.b.x),Math.round(c.b.y),Math.round(c.b.width),Math.round(c.b.height)]})), overlaps:ov, trunc,
        ledeText: lede?lede.innerText.replace(/\n/g,' | '):null};
    });
    log('== '+tag);
    log('  controls '+JSON.stringify(r.controls));
    log('  OVERLAPS '+JSON.stringify(r.overlaps));
    log('  TRUNCATED '+JSON.stringify(r.trunc));
    log('  lede: '+r.ledeText);
  };
  await page.waitForTimeout(900);
  await check('cold 1900');
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',2020));
  await page.waitForTimeout(1000); await check('cold 2020'); await shot('cold2020');
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1780));
  await page.waitForTimeout(900); await check('cold 1780');
  // in lesson
  for (const s of [1,9,13,17,22,24]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
    await page.waitForTimeout(1200);
    await check('beat step '+s);
  }
};
