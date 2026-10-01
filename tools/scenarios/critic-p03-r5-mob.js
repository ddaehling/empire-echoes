/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: exits 1.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{location.hash='#year=1947';}); await page.waitForTimeout(900);
  await shot('mob-1947');
  const g = await page.evaluate(()=>{
    const sw=document.querySelector('.map__switch');
    const ax=document.querySelector('.tl-ax__rail').getBoundingClientRect();
    const t=document.elementFromPoint(ax.x+ax.width*0.9, ax.y+ax.height/2);
    return { painted: sw.scrollHeight, axis90: t? (t.tagName+'.'+(typeof t.className==='string'?t.className:'svg')) : null,
      timebarH: Math.round(document.querySelector('#timebar').getBoundingClientRect().height),
      stageH: Math.round(document.querySelector('#stage').getBoundingClientRect().height) };
  });
  log(JSON.stringify(g));
  // tap the axis at 1960 area
  await page.evaluate(()=>{const ax=document.querySelector('.tl-ax__rail'); const r=ax.getBoundingClientRect(); const ev=new PointerEvent('pointerdown',{bubbles:true,clientX:r.x+r.width*0.85,clientY:r.y+r.height/2}); ax.dispatchEvent(ev);});
  await page.waitForTimeout(700);
  log('year after tap 85%: '+await page.evaluate(()=>window.BEA.store.state.year));
  await shot('mob-after-tap');
};
