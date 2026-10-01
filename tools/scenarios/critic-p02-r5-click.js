/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&def=claimed', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  const centre = id => page.evaluate(id=>{const t=document.querySelector(`.map__target[data-unit="${id}"]`); if(!t) return null; const r=t.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};}, id);
  for (const id of ['barbados','gibraltar','singapore']) {
    const c = await centre(id);
    if(!c){log('no target',id);continue;}
    await page.mouse.click(c.x, c.y); await page.waitForTimeout(1400);
    const sel = await page.evaluate(()=>location.hash);
    const dossier = await page.evaluate(()=>{const d=document.querySelector('.dossier,[class*=dossier]');return d?d.innerText.slice(0,700):'NO DOSSIER'});
    log('clicked',id,'hash=',sel);
    log('dossier:', dossier.replace(/\n+/g,' | ').slice(0,600));
    await shot('click-'+id);
  }
  // keyboard: tab to map, arrow
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'}); await page.waitForTimeout(3000);
  let seq=[];
  for(let i=0;i<25;i++){ await page.keyboard.press('Tab'); const a=await page.evaluate(()=>{const e=document.activeElement;return (e.className||'')+' | '+(e.getAttribute('aria-label')||e.innerText||'').slice(0,60)}); seq.push(i+':'+a); if(/map/.test(a)) break; }
  log('TAB SEQ:', seq.join('\n'));
  for(let i=0;i<3;i++){ await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500); log('focus after arrow:', await page.evaluate(()=>{const e=document.activeElement;return (e.getAttribute('aria-label')||e.className)})); }
  await shot('kbd');
};
