/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of undefined (reading 'getBoundingClientR.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(3000);
  const b = await page.evaluate(() => { const m=[...document.querySelectorAll('button,a')].find(e=>/open the full key/i.test(e.innerText)); const r=m.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1000);
  const scrollers = await page.evaluate(()=>{
    const out=[];
    for(const e of document.querySelectorAll('*')){
      if(e.scrollHeight>e.clientHeight+30 && e.clientHeight>100){ const r=e.getBoundingClientRect(); out.push({cls:(e.className||'').toString().slice(0,60),ch:e.clientHeight,sh:e.scrollHeight,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width)}); }
    }
    return out.slice(0,20);
  });
  log('SCROLLERS: '+JSON.stringify(scrollers,null,1));
  // scroll the poster into view via native
  await page.evaluate(()=>{ const e=[...document.querySelectorAll('*')].find(x=>/^NOW DO IT ON A MAP/.test((x.innerText||'').trim())); if(e) e.scrollIntoView({block:'start'}); });
  await page.waitForTimeout(700);
  await shot('01-poster');
  const opts = await page.evaluate(()=>{
    const out=[]; for(const e of document.querySelectorAll('button')){const s=(e.innerText||'').trim(); if(/There is no way to tell|Trade, weighted by value|Mercator — and the sheet/.test(s)){const r=e.getBoundingClientRect(); out.push({s:s.slice(0,50),x:r.x+30,y:r.y+r.height/2});}}
    return out;
  });
  log('OPTS '+JSON.stringify(opts));
  const w = opts.find(o=>/There is no way/.test(o.s));
  if(w && w.y>0 && w.y<900){ await page.mouse.click(w.x,w.y); await page.waitForTimeout(900); }
  await shot('02-after-click');
  const st = await page.evaluate(()=>{let best=null;for(const e of document.querySelectorAll('div,section')){const s=(e.innerText||'');if(/NOW DO IT ON A MAP/.test(s)&&(!best||s.length<best.length))best=s;}return best||'none';});
  log('STATE: '+st.replace(/\s+/g,' ').slice(0,2500));
  log('ERR '+JSON.stringify(errs));
};
