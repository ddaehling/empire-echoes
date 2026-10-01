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
      const p=document.querySelector('.tr-panel__scroll');
      const t=p?p.innerText:'';
      const i=t.indexOf('WHAT YOU WILL BE ABLE TO SAY');
      let y=null;
      if(p&&i>=0){ const n=[...p.querySelectorAll('*')].find(e=>!e.children.length&&/WHAT YOU WILL BE ABLE TO SAY/.test(e.textContent||'')); if(n){const b=n.getBoundingClientRect(); y=Math.round(b.y);} }
      return {has:i>=0, charPos:i, len:t.length, y, ch:p?p.clientHeight:null, sh:p?p.scrollHeight:null};
    });
    log('step '+String(s).padStart(2)+' cloze-in-panel='+r.has+' at char '+r.charPos+'/'+r.len+' screenY='+r.y+' window='+r.ch);
  }
};
