/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.click('.cx-cta');
  await page.waitForTimeout(1200);
  const nsteps = +(process.env.N||6);
  for (let i=0;i<nsteps;i++){
    await page.evaluate(()=>{const c=document.querySelector('.tr-field__cell'); if(c) c.click();});
    await page.waitForTimeout(300);
    await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();});
    await page.waitForTimeout(700);
  }
  const r = await page.evaluate(()=>{
    const b = document.querySelector('.cl-blk');
    const rect = e=>{const x=e.getBoundingClientRect();return [Math.round(x.x),Math.round(x.y),Math.round(x.width),Math.round(x.height)];};
    const fin = document.querySelector('.cl-finish');
    return { blk: b? {rect:rect(b), txt:b.innerText.replace(/\s+/g,' ')} : 'NO .cl-blk',
             bar: document.querySelector('.cl-bar')? rect(document.querySelector('.cl-bar')):'none',
             finish: fin? {rect:rect(fin), txt:fin.innerText}:'no finish',
             step: (document.querySelector('.tr-bar')||{}).innerText };
  });
  log('R>>'+JSON.stringify(r,null,1));
  // scroll panel to bottom to shoot it
  await page.evaluate(()=>{ const b=document.querySelector('.cl-blk'); if(b) b.scrollIntoView({block:'center'}); });
  await page.waitForTimeout(500);
  await shot('cloze-panel');
};
