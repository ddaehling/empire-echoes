/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.waitForTimeout(3000);
  const b = await page.evaluate(()=>{const e=document.querySelector('.byline__crit'); const r=e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.click(b.x,b.y); await page.waitForTimeout(1000);
  const ent = await page.evaluate(()=>{const e=[...document.querySelectorAll('.legend__entry')].find(x=>/Princely state/.test(x.innerText)); const r=e.getBoundingClientRect(); return {x:r.x+40,y:r.y+12};});
  await page.mouse.click(ent.x,ent.y); await page.waitForTimeout(1400);
  await shot('01-entry-clicked');
  const st = await page.evaluate(()=>{
    const e=[...document.querySelectorAll('.legend__entry')].find(x=>/Princely state/.test(x.innerText));
    return {expanded:e.getAttribute('aria-expanded'), pressed:e.getAttribute('aria-pressed'), text:e.innerText.replace(/\s+/g,' ').slice(0,900)};
  });
  log('ENTRY '+JSON.stringify(st,null,1));
  const painted = await page.evaluate(()=>{
    const nodes=[...document.querySelectorAll('[data-unit],[data-unit-id]')];
    let dim=0,lit=0;
    for(const n of nodes){ const o=parseFloat(getComputedStyle(n).opacity); if(o<0.6)dim++; else lit++; }
    return {total:nodes.length,dim,lit};
  });
  log('PAINT '+JSON.stringify(painted));
  const note = await page.evaluate(()=>{const e=document.querySelector('[class*="stage-note"],[class*="stagenote"]'); return e?e.innerText.replace(/\s+/g,' ').slice(0,400):'none';});
  log('STAGE NOTE: '+note);
  log('ERR '+JSON.stringify(errs));
};
