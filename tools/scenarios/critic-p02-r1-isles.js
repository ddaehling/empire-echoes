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
  const r = await page.evaluate(()=>{
    const out=[];
    for (const e of document.querySelectorAll('.map__target')) {
      const b=e.getBoundingClientRect();
      if (b.x>620&&b.x<860&&b.y>130&&b.y<340) out.push({id:e.dataset.unit, x:Math.round(b.x), y:Math.round(b.y), w:Math.round(b.width), tiny:e.classList.contains('is-tiny'), aria:e.getAttribute('aria-label').slice(0,50)});
    }
    return out;
  });
  log('ISLES:', JSON.stringify(r,null,1));
  await page.evaluate(()=>window.__map.plate && null);
  // crop
  await page.evaluate(()=>{let d=document.getElementById('__crop'); if(!d){d=document.createElement('div');d.id='__crop';d.style.position='fixed';d.style.zIndex='-1';d.style.pointerEvents='none';document.body.appendChild(d);} d.style.left='640px';d.style.top='140px';d.style.width='200px';d.style.height='160px';});
  await shot('isles','#__crop');
};
