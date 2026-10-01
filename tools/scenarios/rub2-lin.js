/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const r = await page.evaluate(()=> {
    const out=[];
    document.querySelectorAll('button,[role="button"],a[href]').forEach(e=>{
      const al=(e.getAttribute('aria-label')||'').replace(/\s+/g,' ');
      const vis=(e.innerText||'').replace(/\s+/g,' ').trim();
      if(!al||!vis) return;
      const v = vis.replace(/[→↓←×✕▾·]/g,' ').replace(/\s+/g,' ').trim();
      if(v && !al.toLowerCase().includes(v.toLowerCase())) out.push({vis:v.slice(0,60), al:al.slice(0,90)});
    });
    return out;
  });
  log('LABEL-IN-NAME MISMATCHES: '+r.length);
  r.slice(0,25).forEach(x=>log('  vis="'+x.vis+'"  name="'+x.al+'"'));
};
