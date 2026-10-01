/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1955',{waitUntil:'load'}); await page.waitForTimeout(2400);
  await page.keyboard.press('h'); await page.waitForTimeout(1500);
  const r = await page.evaluate(()=>{
    const B=window.BEA;
    const out={};
    try{ out.layers = B.map && B.map.layers && Object.keys(B.map.layers); }catch(e){}
    // find the holes via the paint module state if exposed
    const holes=[...document.querySelectorAll('[class*=hole],[data-mode=hole]')].map(e=>e.getAttribute('aria-label')||e.textContent).slice(0,20);
    out.holes=holes;
    return out;
  });
  log('R>>'+JSON.stringify(r).slice(0,900));
  // hover NSW
  const box = await page.evaluate(()=>{
    const t=[...document.querySelectorAll('.map__target')].find(e=>/New South Wales/i.test(e.getAttribute('aria-label')||''));
    if(!t) return null; const b=t.getBoundingClientRect(); return {x:Math.round(b.x+b.width/2), y:Math.round(b.y+b.height/2), aria:t.getAttribute('aria-label')};
  });
  log('NSW target: '+JSON.stringify(box));
  if(box){ await page.mouse.move(box.x, box.y); await page.waitForTimeout(1000); await shot('nsw-hover');
    log('TIP>>'+await page.evaluate(()=>{const t=document.querySelector('.map__tip,[class*=tip]'); return t? t.innerText.replace(/\s+/g,' ').slice(0,900):'none';}));
    await page.mouse.click(box.x, box.y); await page.waitForTimeout(1400); await shot('nsw-click');
    log('PANEL>>'+await page.evaluate(()=>document.body.innerText.slice(0,10).length && (document.querySelector('.cx-sheet')||{}).innerText?.replace(/\s+/g,' ').slice(0,1500)));
  }
};
