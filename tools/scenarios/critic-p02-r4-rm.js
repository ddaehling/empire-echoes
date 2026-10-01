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
  const out='/tmp/cp02r4-rm'; require('fs').mkdirSync(out,{recursive:true});
  log('motion attr:', await page.evaluate(()=>document.documentElement.dataset.motion));
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1922));
  await page.waitForTimeout(800);
  const t0=Date.now();
  await page.keyboard.press('p');
  // sample frames
  for (let i=0;i<6;i++){ await page.screenshot({path: path.join(out,'f'+i+'.png'), clip:{x:560,y:60,width:520,height:330}}); await page.waitForTimeout(180); }
  log('proj now:', await page.evaluate(()=>document.querySelector('.map').dataset.projection), 'ms', Date.now()-t0);
  await page.waitForTimeout(1500);
  await page.screenshot({path: path.join(out,'final.png'), clip:{x:560,y:60,width:520,height:330}});
  log('map size', JSON.stringify(await page.evaluate(()=>{const r=document.querySelector('.map').getBoundingClientRect();return{w:Math.round(r.width),h:Math.round(r.height)};})));
};
