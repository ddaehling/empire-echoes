/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const controls = await page.evaluate(()=>Array.from(document.querySelectorAll('.tl-btn, .tl-speed')).map(b=>b.className+' | '+(b.innerText||'').slice(0,20)+' | title='+(b.title||'')+' | aria='+(b.getAttribute('aria-label')||'')));
  log('controls: '+JSON.stringify(controls,null,1));
  await page.evaluate(()=>{location.hash='#year=1930';}); await page.waitForTimeout(700);
  await page.click('.tl-btn--play'); 
  const seq=[];
  for (let i=0;i<8;i++){ await page.waitForTimeout(700); seq.push(await page.evaluate(()=>window.BEA.store.state.year+(window.BEA.store.state.playing?'':'[p]'))); }
  log('reduced-motion play seq: '+seq.join(' '));
  await shot('rm-play');
};
