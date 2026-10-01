/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const lanes = await page.evaluate(()=>Array.from(document.querySelectorAll('.tl-spine__track *')).filter(e=>e.tagName==='BUTTON'||e.getAttribute('role')==='button').map(e=>e.className+' | '+e.innerText.slice(0,50).replace(/\n/g,' ')));
  log('lane controls: '+JSON.stringify(lanes,null,1));
  const b = await page.$('.tl-spine__track button');
  if (b){ await b.click(); await page.waitForTimeout(900); await shot('phase-pop');
    log('pop: '+await page.evaluate(()=>{const p=document.querySelector('.tl__pop, .tl-spine__pop, [class*=pop]'); return p?p.innerText.replace(/\n{2,}/g,'\n').slice(0,1600):'none';}));
  }
};
