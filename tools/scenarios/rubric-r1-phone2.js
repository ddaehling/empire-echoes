/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [17, 5, 21]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForTimeout(2400);
    await shot('p'+s);
    const m = await page.evaluate(()=>{
      const mm=document.querySelector('.stage__map').getBoundingClientRect();
      return {map:[Math.round(mm.width),Math.round(mm.height)], h:document.documentElement.scrollWidth-innerWidth};
    });
    log('step'+s+' '+JSON.stringify(m));
    // scroll the panel down to see the whole beat
    await page.evaluate(()=>{ const p=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+60&&e.clientHeight>150); if(p[0]) p[0].scrollTop = p[0].scrollHeight/2; });
    await page.waitForTimeout(600);
    await shot('p'+s+'-mid');
  }
};
