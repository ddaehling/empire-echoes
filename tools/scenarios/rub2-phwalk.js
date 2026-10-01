/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of ['1','5','11','17','21','23']) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s, {waitUntil:'load'});
    await page.waitForTimeout(2000);
    await shot('p'+s);
    const m = await page.evaluate(()=>{
      const map=document.querySelector('.stage__map'); const b=map?map.getBoundingClientRect():null;
      // clipped text check: any element whose scrollHeight far exceeds clientHeight and overflow hidden
      const clipped=[];
      document.querySelectorAll('p,h1,h2,h3,li,span').forEach(e=>{
        const cs=getComputedStyle(e);
        if(cs.overflow==='hidden'&&e.scrollHeight>e.clientHeight+3&&e.clientHeight>0&&e.innerText.length>25) clipped.push((e.className||'')+' :: '+e.innerText.replace(/\s+/g,' ').slice(0,60));
      });
      return {map:b?{y:Math.round(b.y),h:Math.round(b.height)}:null, over: document.documentElement.scrollHeight-innerHeight, clipped:clipped.slice(0,6)};
    });
    log('step '+s+': map='+JSON.stringify(m.map)+' docOver='+m.over+' clipped='+JSON.stringify(m.clipped));
  }
};
