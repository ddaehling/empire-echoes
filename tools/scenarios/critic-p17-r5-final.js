/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.waitForTimeout(3000);
  // FOLD
  const f = await page.evaluate(()=>{const e=[...document.querySelectorAll('button')].find(x=>/^FOLD$/i.test(x.innerText.trim())); if(!e)return null; const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  log('FOLD BTN '+JSON.stringify(f));
  if(f){ await page.mouse.click(f.x,f.y); await page.waitForTimeout(900); }
  await shot('01-folded');
  const after = await page.evaluate(()=>{const e=document.querySelector('[class*="legend"]'); const r=e.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height),txt:e.innerText.replace(/\s+/g,' ').slice(0,200)};});
  log('AFTER FOLD '+JSON.stringify(after));
  if(f){ await page.mouse.click(f.x,f.y); await page.waitForTimeout(600); }
  // extreme year edges
  for (const y of [1500, 1600, 1610, 2023]) {
    await page.evaluate(yy=>{location.hash='#year='+yy;}, y);
    await page.waitForTimeout(1600);
    const t = await page.evaluate(()=>{const e=document.querySelector('[class*="legend"]'); const b=document.querySelector('[class*="byline"]'); return {l:e?e.innerText.replace(/\s+/g,' ').slice(0,260):'none', b:b?b.innerText.replace(/\s+/g,' ').slice(0,300):'none'};});
    log('YEAR '+y+' :: '+t.l+' ||| '+t.b);
    await shot('year-'+y);
  }
  log('ERR '+JSON.stringify(errs.slice(0,10)));
};
