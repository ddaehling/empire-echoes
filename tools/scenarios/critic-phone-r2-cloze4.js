/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [1,9,17,23]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
    await page.waitForTimeout(900);
    const r = await page.evaluate(()=>{
      let best=null;
      document.querySelectorAll('*').forEach(e=>{
        if(!/what you will be able to say/i.test(e.textContent||'')) return;
        if(!best || e.contains(best)===false && best.contains(e)) {}
        best = e; // last (deepest in doc order among matches with smallest subtree)
      });
      // deepest match
      let deep=null;
      document.querySelectorAll('*').forEach(e=>{ if(/what you will be able to say/i.test(e.textContent||'')){ if(!deep||deep.contains(e)) deep=e; }});
      const b=deep?deep.getBoundingClientRect():null;
      // ancestors
      const anc=[]; let p=deep; while(p&&p!==document.body){anc.push((p.className||'').toString().slice(0,30)||p.tagName); p=p.parentElement;}
      // which scroller and where
      let sc=null,off=null;
      p=deep;
      while(p&&p!==document.body){ const cs=getComputedStyle(p); if((cs.overflowY==='auto'||cs.overflowY==='scroll')&&p.scrollHeight>p.clientHeight){ sc={cls:(p.className||'').toString().slice(0,30),ch:p.clientHeight,sh:p.scrollHeight,top:p.scrollTop}; off=Math.round(deep.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop); break;} p=p.parentElement;}
      return {rect:b?[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]:null, anc:anc.slice(0,6), scroller:sc, offsetInScroller:off};
    });
    log('step '+s+' :: '+JSON.stringify(r));
  }
};
