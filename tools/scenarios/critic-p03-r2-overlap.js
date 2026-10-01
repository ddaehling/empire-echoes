/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const ms=[...document.querySelectorAll('.tl-mark')].map(b=>{const r=b.getBoundingClientRect(); return {y:b.dataset.year, x:r.x, w:r.width, h:r.height};});
    ms.sort((a,b)=>a.x-b.x);
    let occluded=0, gaps=[];
    for(let i=1;i<ms.length;i++){ const g=ms[i].x-(ms[i-1].x+ms[i-1].w); gaps.push(g); if(g<0) occluded++; }
    // hit test each centre
    let unreachable=0, list=[];
    for(const m of ms){ const cx=m.x+m.w/2, cy=m.y!==undefined?0:0; }
    return {n:ms.length, overlapping:occluded, minGap:Math.min(...gaps).toFixed(1), medGap:gaps.sort((a,b)=>a-b)[Math.floor(gaps.length/2)].toFixed(1), size:ms[0].w+'x'+ms[0].h};
  });
  log(JSON.stringify(r));
  // real hit test at each mark centre
  const hits = await page.evaluate(() => {
    const ms=[...document.querySelectorAll('.tl-mark')];
    let wrong=0; const bad=[];
    for(const b of ms){ const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2); if(e!==b && !b.contains(e)) { wrong++; if(bad.length<6) bad.push(b.dataset.year+' -> '+(e?e.className+'/'+(e.dataset?e.dataset.year:''):'null')); } }
    return {total:ms.length, unreachable:wrong, examples:bad};
  });
  log('HIT TEST: '+JSON.stringify(hits));
};
