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
  const out='/tmp/cp02r4-ghost'; require('fs').mkdirSync(out,{recursive:true});
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1900));
  await page.waitForTimeout(1000);
  await page.screenshot({path: path.join(out,'left.png'), clip:{x:520,y:170,width:300,height:180}});
  await page.screenshot({path: path.join(out,'right.png'), clip:{x:760,y:170,width:260,height:180}});
  // do ghosts have a different label style? read the render source config via canvas is impossible; check names module
  log('ok');
};
