/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  for (const y of [1500, 1607, 1650]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(1800);
    const t = await page.evaluate(()=>{const e=document.querySelector('[class*="legend"]'); return e?e.innerText.replace(/\s+/g,' ').slice(0,700):'none';});
    log('YEAR '+y+' LEGEND: '+t);
    await shot('y'+y);
  }
  // open key at 1500
  await page.evaluate(()=>{location.hash='#year=1500';}); await page.waitForTimeout(1500);
  const b = await page.evaluate(()=>{const e=document.querySelector('.byline__crit'); if(!e)return null; const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  if(b){await page.mouse.click(b.x,b.y); await page.waitForTimeout(1400);}
  await shot('key-1500');
  const k = await page.evaluate(()=>{let best=null;for(const e of document.querySelectorAll('div,section')){const s=(e.innerText||'');if(/^How to read this map/.test(s.trim())&&(!best||s.length<best.length))best=s;}return best||'none';});
  log('KEY@1500: '+k.replace(/\s+/g,' ').slice(0,2000));
};
