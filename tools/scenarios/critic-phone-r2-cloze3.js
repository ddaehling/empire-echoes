/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  for (let s=1;s<=25;s++) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
    await page.waitForTimeout(600);
    const r = await page.evaluate(()=>{
      const t=document.body.innerText;
      const has=/WHAT YOU WILL BE ABLE TO SAY/.test(t);
      let host=null, y=null, inView=null;
      if(has){ const n=[...document.querySelectorAll('*')].find(e=>!e.children.length&&/WHAT YOU WILL BE ABLE TO SAY/.test(e.textContent||''));
        if(n){ const b=n.getBoundingClientRect(); y=Math.round(b.y); inView=b.top>=0&&b.bottom<=innerHeight;
          let p=n; while(p&&p!==document.body){ const c=(p.className||'').toString(); if(c){host=c.slice(0,40); break;} p=p.parentElement; } } }
      return {has, host, y, inView};
    });
    log('step '+String(s).padStart(2)+' cloze='+r.has+' host='+r.host+' y='+r.y+' inViewNow='+r.inView);
  }
};
