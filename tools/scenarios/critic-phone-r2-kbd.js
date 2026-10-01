/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17',{waitUntil:'load'});
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(1200);
  const seen=[];
  for (let i=0;i<45;i++){
    await page.keyboard.press('Tab');
    const f = await page.evaluate(()=>{
      const a=document.activeElement; if(!a) return null;
      const b=a.getBoundingClientRect(); const cs=getComputedStyle(a);
      return {tag:a.tagName, t:(a.textContent||a.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,44),
        r:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)],
        inView: b.top>=-1 && b.bottom<=innerHeight+1 && b.left>=-1 && b.right<=innerWidth+1,
        outline: cs.outlineStyle+' '+cs.outlineWidth, shadow:(cs.boxShadow||'').slice(0,40)};
    });
    seen.push(f);
  }
  seen.forEach((f,i)=>log((i+1)+' '+JSON.stringify(f)));
  await shot('kbd-focus');
};
