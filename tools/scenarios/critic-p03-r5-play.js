/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{location.hash='#year=1938';}); await page.waitForTimeout(800);
  await page.evaluate(()=>{ const s=document.querySelector('.tl-speed'); if(s){s.value='4';s.dispatchEvent(new Event('change',{bubbles:true}));} });
  await page.waitForTimeout(300);
  await page.click('.tl-btn--play'); 
  const seen = [];
  for (let i=0;i<26;i++){
    await page.waitForTimeout(500);
    const st = await page.evaluate(()=>({ y: window.BEA.store.state.year, playing: window.BEA.store.state.playing,
      stop: (document.querySelector('.tl__stop, .tl-stop, [class*=stop]')||{innerText:''}).innerText.replace(/\n/g,' ').slice(0,220) }));
    seen.push(st.y+(st.playing?'':'[PAUSED]')+(st.stop?' :: '+st.stop:''));
    if (!st.playing && i>3) break;
  }
  log(seen.join('\n'));
  await shot('playback-stop');
};
