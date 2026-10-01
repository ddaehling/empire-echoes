/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const s of [1,9,17,23,25]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
    await page.waitForTimeout(1300);
    const r = await page.evaluate(()=>{
      const sels=['.cl-bar','.cl-line','[data-mount="cloze"]','.cl-'];
      const found=[];
      document.querySelectorAll('*').forEach(e=>{
        const c=(e.className||'').toString();
        if (/\bcl-(bar|line|cloze)\b/.test(c)) {
          const b=e.getBoundingClientRect(); const cs=getComputedStyle(e);
          found.push({cls:c.slice(0,40), r:[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)], vis:cs.display+'/'+cs.visibility, inView: b.height>0 && b.top<innerHeight && b.bottom>0});
        }
      });
      const txt=document.body.innerText;
      return {found, hasCloze:/What you will be able to say|started as|It started as/.test(txt),
        blanks: (txt.match(/blank/gi)||[]).length};
    });
    log('step '+s+' :: '+JSON.stringify(r));
  }
};
