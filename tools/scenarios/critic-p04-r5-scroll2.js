/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1765&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  // tall viewport test
  await page.setViewportSize({width:1440,height:1400}); await page.waitForTimeout(1200);
  log('tall:', JSON.stringify(await page.evaluate(()=>{
    const f=document.querySelector('.map__furniture'); const s=document.querySelector('.map__switch');
    const r=s.getBoundingClientRect(); const st=document.querySelector('.map').getBoundingClientRect();
    return {cls:f.className, sw:{x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0}, stageH: st.height|0};
  })));
  await shot('tall-1400');
  await page.setViewportSize({width:1440,height:900}); await page.waitForTimeout(1000);
  // scroll dossier via the narrow uncovered strip
  const sc = await page.evaluate(()=>{ const e=document.querySelector('.app__dossier'); return {st:e.scrollTop, sh:e.scrollHeight, ch:e.clientHeight}; });
  log('before', JSON.stringify(sc));
  await page.mouse.move(1030, 500);
  for(let i=0;i<4;i++){ await page.mouse.wheel(0,900); await page.waitForTimeout(300); }
  log('after strip scroll', JSON.stringify(await page.evaluate(()=>{const e=document.querySelector('.app__dossier');return {st:e.scrollTop};})));
  await shot('scrolled-strip');
  // and via the covered region
  await page.evaluate(()=>{document.querySelector('.app__dossier').scrollTop=0;});
  await page.mouse.move(1250, 500);
  for(let i=0;i<4;i++){ await page.mouse.wheel(0,900); await page.waitForTimeout(300); }
  log('after covered scroll', JSON.stringify(await page.evaluate(()=>{const e=document.querySelector('.app__dossier');return {st:e.scrollTop};})));
};
