/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  // measure occlusion of the map canvas
  const occ = await page.evaluate(()=>{
    const c=document.querySelector('.map__plate').getBoundingClientRect();
    const overs=[...document.querySelectorAll('.map > *, .map__panel, .legend, .map__modes, [class*="legend"], [class*="map__"]')]
      .filter(e=>!e.classList.contains('map__plate') && !e.classList.contains('map__targets') && !e.classList.contains('map__fade'))
      .map(e=>({c:e.className, r:e.getBoundingClientRect()})).filter(o=>o.r.width>4&&o.r.height>4);
    let area=0; const boxes=[];
    for(const o of overs){ const ov=Math.max(0,Math.min(c.right,o.r.right)-Math.max(c.left,o.r.left))*Math.max(0,Math.min(c.bottom,o.r.bottom)-Math.max(c.top,o.r.top)); if(ov>0){area+=ov; boxes.push([o.c,Math.round(ov)]);} }
    return {canvas:Math.round(c.width*c.height), occluded:Math.round(area), boxes:boxes.slice(0,12)};
  });
  log('OCCLUSION:', JSON.stringify(occ));
  // try to fold
  for (const label of ['FOLD','How to read this map','×','Close']) {
    const b = await page.$(`text=${label}`);
    if (b) { await b.click().catch(()=>{}); await page.waitForTimeout(800); log('clicked', label); }
  }
  await shot('mob-folded');
  const occ2 = await page.evaluate(()=>{
    const c=document.querySelector('.map__plate').getBoundingClientRect();
    const overs=[...document.querySelectorAll('.map > *')].filter(e=>!/plate|targets|fade/.test(e.className)).map(e=>({c:e.className,r:e.getBoundingClientRect()}));
    let area=0; for(const o of overs){ const ov=Math.max(0,Math.min(c.right,o.r.right)-Math.max(c.left,o.r.left))*Math.max(0,Math.min(c.bottom,o.r.bottom)-Math.max(c.top,o.r.top)); if(ov>0)area+=ov; }
    return {canvas:Math.round(c.width*c.height), occluded:Math.round(area)};
  });
  log('OCCLUSION2:', JSON.stringify(occ2));
};
