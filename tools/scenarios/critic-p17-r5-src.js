/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const b = await page.evaluate(()=>{const e=document.querySelector('.byline__crit'); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1000);
  for (const name of ['Crown colony','Princely state','Leased territory']) {
    const ent = await page.evaluate((n)=>{const e=[...document.querySelectorAll('.legend__entry')].find(x=>x.innerText.startsWith(n)); if(!e)return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return {x:r.x+40,y:r.y+12};}, name);
    if(!ent) { log(name+' NOT FOUND'); continue; }
    await page.mouse.click(ent.x,ent.y); await page.waitForTimeout(1000);
    const t = await page.evaluate((n)=>{
      const e=[...document.querySelectorAll('.legend__entry')].find(x=>x.innerText.startsWith(n));
      const panel = e && e.nextElementSibling;
      return (e?e.innerText:'') + ' || PANEL: ' + (panel?panel.innerText.replace(/\s+/g,' ').slice(0,1600):'none');
    }, name);
    log('### '+name+' :: '+t.replace(/\s+/g,' ').slice(0,1800));
    await page.mouse.click(ent.x,ent.y); await page.waitForTimeout(500);
  }
  const unsourced = await page.evaluate(()=>document.body.innerText.match(/\[unsourced\]|source renderer is not running/g));
  log('UNSOURCED MARKERS: '+JSON.stringify(unsourced));
};
