/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  const gb = await page.evaluate(()=>{const e=document.getElementById('map-u-great-britain')||document.getElementById('map-u-gb-england'); if(!e) return null; const r=e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};});
  log('GB target', JSON.stringify(gb));
  const near = await page.evaluate((g)=>{
    if(!g) return [];
    const out=[];
    for(const e of document.querySelectorAll('.map__target')){const b=e.getBoundingClientRect();
      if(Math.abs(b.x-g.x)<160&&Math.abs(b.y-g.y)<160) out.push({id:e.dataset.unit,x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),tiny:e.classList.contains('is-tiny')});}
    return out;
  }, gb);
  log('NEAR GB:', JSON.stringify(near));
  await page.evaluate((g)=>{let d=document.getElementById('__crop'); if(!d){d=document.createElement('div');d.id='__crop';d.style.position='fixed';d.style.zIndex='-1';d.style.pointerEvents='none';document.body.appendChild(d);} d.style.left=(g.x-90)+'px';d.style.top=(g.y-90)+'px';d.style.width='240px';d.style.height='200px';}, gb);
  await shot('isles', '#__crop');
};
