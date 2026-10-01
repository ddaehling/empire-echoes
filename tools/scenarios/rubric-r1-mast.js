/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (let s=1;s<=24;s++){
    await page.goto('http://localhost:8777/app/#tour=thirty&step='+s,{waitUntil:'load'});
    await page.waitForTimeout(1300);
    const n = await page.evaluate(()=>{
      const mast=document.querySelector('.app__mast')||document.querySelector('header');
      if(!mast) return {err:'no mast'};
      const els=[...mast.querySelectorAll('button,a')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>4&&r.height>4;});
      return {n:els.length, labels: els.map(e=>(e.textContent||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,24))};
    });
    log('S'+String(s).padStart(2)+' n='+n.n+' '+JSON.stringify(n.labels));
  }
};
