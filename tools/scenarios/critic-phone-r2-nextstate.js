/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (let s=1;s<=25;s++){
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
    await page.waitForTimeout(700);
    const r = await page.evaluate(()=>{
      const n=document.querySelector('.tr-bar__next');
      const p=document.querySelector('.tr-panel__scroll');
      const head=document.querySelector('.tr-panel__title,.cx-sheet__title');
      return {label:n?(n.textContent||'').trim().replace(/\s+/g,' '):null, dis:n?n.disabled:null,
        ch:p?p.clientHeight:null, sh:p?p.scrollHeight:null,
        title:head?head.textContent.trim().slice(0,44):null};
    });
    log('step '+String(s).padStart(2)+' | next='+JSON.stringify(r.label)+' disabled='+r.dis+' | window='+r.ch+'px content='+r.sh+'px ('+(r.ch?(r.sh/r.ch).toFixed(1):'?')+' screens) | '+r.title);
  }
};
