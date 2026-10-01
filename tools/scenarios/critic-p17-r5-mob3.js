/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'querySelectorAll').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const ctrls = await page.evaluate(()=>{
    const b=document.querySelector('[class*="byline"]');
    const out=[...b.querySelectorAll('button,a')].map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').slice(0,40),c:(e.className||'').toString().slice(0,50)}));
    const r=b.getBoundingClientRect();
    const m=document.querySelector('.map__plate')||document.querySelector('svg');
    const mr=m.getBoundingClientRect();
    const ov = Math.max(0,Math.min(r.right,mr.right)-Math.max(r.left,mr.left)) * Math.max(0,Math.min(r.bottom,mr.bottom)-Math.max(r.top,mr.top));
    return {ctrls:out, byline:{x:r.x,y:r.y,w:r.width,h:r.height}, map:{x:mr.x,y:mr.y,w:mr.width,h:mr.height}, occludedPct: Math.round(100*ov/(mr.width*mr.height))};
  });
  log(JSON.stringify(ctrls,null,1));
};
