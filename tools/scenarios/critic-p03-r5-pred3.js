/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  // does playback ask before the widest year?
  await page.evaluate(()=>{location.hash='#year=1914';}); await page.waitForTimeout(700);
  await page.evaluate(()=>{const s=document.querySelector('.tl-speed'); s.value='8'; s.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.click('.tl-btn--play');
  for (let i=0;i<20;i++){
    await page.waitForTimeout(400);
    const st = await page.evaluate(()=>({y:window.BEA.store.state.year, playing:window.BEA.store.state.playing, pred: !!document.querySelector('.tl-pred'), stop:(document.querySelector('[class*=stop]')||{innerText:''}).innerText.slice(0,80).replace(/\n/g,' ')}));
    log(JSON.stringify(st));
    if (st.pred) { await shot('pred-auto'); break; }
    if (!st.playing && i>2) { await shot('stopped'); break; }
  }
  const btns = await page.evaluate(()=>Array.from(document.querySelectorAll('.tl-pred button')).map(b=>b.className));
  log('band classes: '+JSON.stringify(btns));
};
