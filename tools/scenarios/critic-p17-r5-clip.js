/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => {
    const out=[];
    for (const e of document.querySelectorAll('*')) {
      const s=(e.innerText||'').trim();
      if (/^more ↓/.test(s) && s.length<30) {
        let p=e, chain=[];
        for(let i=0;i<5 && p;i++){ chain.push(p.tagName+'.'+(p.className||'').toString().slice(0,60)); p=p.parentElement; }
        out.push(chain);
      }
    }
    return out;
  });
  log('MORE CHAIN: '+JSON.stringify(info,null,1));
  await page.evaluate(()=>window.scrollTo(0,0));
  await shot('clip');
  const box = await page.evaluate(()=>{
    const e=[...document.querySelectorAll('*')].find(x=>/^more ↓/.test((x.innerText||'').trim()));
    if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height};
  });
  log('BOX '+JSON.stringify(box));
};
