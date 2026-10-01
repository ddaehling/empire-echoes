/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const ov = async(tag)=>{
    const o = await page.evaluate(()=>({
      hscroll: document.documentElement.scrollWidth - innerWidth,
      map: (()=>{const m=document.querySelector('.stage__map'); if(!m) return null; const b=m.getBoundingClientRect(); return [Math.round(b.width),Math.round(b.height)];})(),
      clipped: [...document.querySelectorAll('*')].filter(e=>{const b=e.getBoundingClientRect(); return b.width>0 && (b.right>innerWidth+2||b.left<-2);}).length
    }));
    log(tag+' :: '+JSON.stringify(o));
  };
  await page.waitForTimeout(2500);
  await ov('cold');
  // rapid scrub
  await page.evaluate(()=>{ const s=window.BEA.store; for(let y=1600;y<=1997;y+=7) s.dispatch('setYear', y); });
  await page.waitForTimeout(900); await ov('after-scrub'); await shot('scrub');
  // keyboard only path
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
  for(let i=0;i<12;i++){ await page.keyboard.press('Tab'); }
  const foc = await page.evaluate(()=>{const a=document.activeElement; return (a.tagName+' '+(a.getAttribute('aria-label')||a.textContent||'').replace(/\s+/g,' ').slice(0,50));});
  log('focus after 14 tabs: '+foc);
  await shot('kbd');
  // start lesson via keyboard
  await page.evaluate(()=>document.querySelector('.cx-cta').focus());
  await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  await ov('beat1'); await shot('beat1');
  // press ArrowRight/Next via keyboard
  for(let i=0;i<4;i++){ await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled){n.focus();}}); await page.keyboard.press('Enter'); await page.waitForTimeout(600); }
  await ov('beat5'); await shot('beat5');
  // resize mid-interaction
  await page.setViewportSize({width:768,height:1024}); await page.waitForTimeout(1200); await ov('resized-768'); await shot('resized768');
  await page.setViewportSize({width:1920,height:1080}); await page.waitForTimeout(1200); await ov('resized-1920'); await shot('resized1920');
  await page.setViewportSize({width:390,height:844}); await page.waitForTimeout(1200); await ov('resized-390'); await shot('resized390');
  // reload = return visit
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(2500); await ov('reload'); await shot('reload');
  const st = await page.evaluate(()=>({hash:location.hash, bar:(document.querySelector('.tr-bar')||{}).innerText.replace(/\s+/g,' ')}));
  log('RELOAD STATE>>'+JSON.stringify(st));
};
