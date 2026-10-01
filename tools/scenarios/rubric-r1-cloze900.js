/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  await page.click('.cx-cta'); await page.waitForTimeout(1100);
  for(let i=0;i<8;i++){
    await page.evaluate(()=>{const c=document.querySelector('.tr-field__cell'); if(c)c.click();});
    await page.waitForTimeout(300);
    await page.evaluate(()=>{const n=document.querySelector('.tr-bar__next'); if(n&&!n.disabled)n.click();});
    await page.waitForTimeout(650);
  }
  const r = await page.evaluate(()=>{
    const bar=document.querySelector('.cl-bar'); const blk=document.querySelector('.cl-blk');
    const rr=e=>{const b=e.getBoundingClientRect();return[Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)];};
    const vis = e => { if(!e) return null; const b=e.getBoundingClientRect(); return b.width>0&&b.height>0; };
    // how many clauses actually painted in the strip
    let painted=0, total=0;
    if(bar) bar.querySelectorAll('.cl-say__filled,.cl-say__gap,[class*=cl-say__]').forEach(e=>{total++; const b=e.getBoundingClientRect(); if(b.width>0&&b.right<=innerWidth+1) painted++;});
    return {barRect: bar?rr(bar):'none', barTxt: bar? bar.innerText.replace(/\s+/g,' '):null, painted, total,
      blk: blk? {rect:rr(blk), txt:blk.innerText.replace(/\s+/g,' ')} : 'no .cl-blk',
      foot: document.getElementById('app').dataset.foot};
  });
  log('R>>'+JSON.stringify(r,null,1));
  await shot('cloze900');
};
