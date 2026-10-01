/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const names = await page.evaluate(()=> {
    const out=[];
    document.querySelectorAll('.legend *, [class*="legend"]').forEach(e=>{
      const al=e.getAttribute('aria-label'); const t=e.getAttribute('title');
      if(al||t) out.push({c:(e.className||'').toString().slice(0,40), al, t: t&&t.slice(0,120)});
    });
    return out;
  });
  log(JSON.stringify(names,null,1).slice(0,4000));
  // degrees leak check across whole doc
  const leaks = await page.evaluate(()=>{
    const bad=[];
    document.querySelectorAll('*').forEach(e=>{
      const al=e.getAttribute('aria-label');
      if(al && /deg\b|°/.test(al)) bad.push({c:(e.className||'').toString().slice(0,40), al:al.slice(0,120)});
    });
    // also computed text of chips
    return bad;
  });
  log('DEG LEAKS: '+JSON.stringify(leaks));
  // masthead control counts at various steps
};
