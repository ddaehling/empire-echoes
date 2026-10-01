/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [1,9,17,21,25]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
    await page.waitForTimeout(1400);
    const r = await page.evaluate(()=>{const p=document.querySelector('.tr-panel__scroll'); const m=document.querySelector('.map__frame'); 
      return {ch:p?p.clientHeight:null, sh:p?p.scrollHeight:null, map:m?[Math.round(m.getBoundingClientRect().width),Math.round(m.getBoundingClientRect().height)]:null};});
    log('step '+s+' window='+r.ch+' content='+r.sh+' screens='+(r.ch?(r.sh/r.ch).toFixed(1):'?')+' map='+JSON.stringify(r.map));
    await shot('cb'+s);
  }
};
