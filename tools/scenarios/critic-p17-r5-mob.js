/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(3500);
  await shot('01-mobile-first');
  const t = await page.evaluate(()=>{
    const l=document.querySelector('[class*="legend"]'); const b=document.querySelector('[class*="byline"]');
    const box=e=>{if(!e)return null;const r=e.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
    return {legend:box(l), byline:box(b), legendText:l?l.innerText.replace(/\s+/g,' ').slice(0,600):'none', bylineText:b?b.innerText.replace(/\s+/g,' ').slice(0,400):'none'};
  });
  log(JSON.stringify(t,null,1));
  // try to open full key on mobile
  const b = await page.evaluate(() => { const m=[...document.querySelectorAll('button,a')].find(e=>/open the full key/i.test(e.innerText)); if(!m)return null; const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}; });
  log('KEYBTN '+JSON.stringify(b));
  if(b){ await page.mouse.click(b.x,b.y); await page.waitForTimeout(1200); }
  await shot('02-mobile-key');
  const after = await page.evaluate(()=>{
    const m=document.querySelector('.map__plate')||document.querySelector('svg');
    const r=m?m.getBoundingClientRect():null;
    const k=document.querySelector('.lplate, [class*="lplate"]');
    return {map:r?{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}:null, key:k?{c:(k.className||'').toString(),...(()=>{const q=k.getBoundingClientRect();return{x:Math.round(q.x),y:Math.round(q.y),w:Math.round(q.width),h:Math.round(q.height)};})()}:null};
  });
  log('AFTER '+JSON.stringify(after));
  log('ERR '+JSON.stringify(errs));
};
