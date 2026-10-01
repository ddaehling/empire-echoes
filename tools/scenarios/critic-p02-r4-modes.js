/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const path=require('path');
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const out='/tmp/cp02r4-modes'; require('fs').mkdirSync(out,{recursive:true});
  const snap = async n => { await page.screenshot({path: path.join(out,n+'.png'), clip:{x:0,y:56,width:1440,height:340}}); log('shot '+n); };
  const st = async ()=> await page.evaluate(()=>{const m=document.querySelector('.map');return {proj:m.dataset.projection, mode:m.dataset.mode||m.className, layer:window.BEA.store.getState().activeLayer};});
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1922));
  await page.waitForTimeout(800); await snap('a-1922');
  await page.keyboard.press('p'); await page.waitForTimeout(2200); await snap('b-equalearth'); log('after P:', JSON.stringify(await st()));
  await page.keyboard.press('p'); await page.waitForTimeout(2200); log('after P2:', JSON.stringify(await st()));
  await page.keyboard.press('w'); await page.waitForTimeout(1600); await snap('c-weight'); log('after W:', JSON.stringify(await st()));
  const wtext = await page.evaluate(()=>document.body.innerText.slice(0,1200));
  log('WEIGHT UI:', wtext.slice(0,900));
  await page.keyboard.press('w'); await page.waitForTimeout(800);
  await page.keyboard.press('h'); await page.waitForTimeout(1600); await snap('d-silences'); log('after H:', JSON.stringify(await st()));
  log('SILENCE UI:', (await page.evaluate(()=>document.body.innerText)).slice(0,900));
  await page.keyboard.press('h'); await page.waitForTimeout(600);
  await page.keyboard.press('s'); await page.waitForTimeout(2000); await snap('e-stitching'); log('after S:', JSON.stringify(await st()));
  log('STITCH UI:', (await page.evaluate(()=>document.body.innerText)).slice(0,900));
};
