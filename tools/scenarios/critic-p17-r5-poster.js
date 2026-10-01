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
  // scroll right column
  await page.mouse.move(640, 700);
  for(let i=0;i<10;i++){ await page.mouse.wheel(0,600); await page.waitForTimeout(250); }
  await shot('01-poster-top');
  const opts = await page.evaluate(()=>{
    const out=[];
    for (const e of document.querySelectorAll('button,[role="radio"],label,li')) {
      const s=(e.innerText||'').trim();
      if (/Mercator — and the sheet never says so|One flat red for everything British|1886 in the title|There is no way to tell|Trade, weighted by value/.test(s) && s.length<200) {
        const r=e.getBoundingClientRect(); out.push({s:s.slice(0,70),x:r.x+8,y:r.y+r.height/2,tag:e.tagName,vis:r.height>0});
      }
    }
    return out;
  });
  log('OPTIONS: '+JSON.stringify(opts,null,1));
  // click a WRONG one first: "There is no way to tell from looking"
  const wrong = opts.find(o=>/There is no way to tell/.test(o.s));
  if (wrong) { await page.mouse.click(wrong.x+40, wrong.y); await page.waitForTimeout(900); }
  await shot('02-after-wrong');
  const fb = await page.evaluate(()=>{ let best=null; for(const e of document.querySelectorAll('div,section,p')){const s=(e.innerText||'');if(/NOW DO IT ON A MAP/.test(s)&&(!best||s.length<best.length))best=s;} return best||'none';});
  log('POSTER STATE: '+fb.replace(/\s+/g,' ').slice(0,2500));
  log('ERR '+JSON.stringify(errs));
};
