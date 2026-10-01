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
  const out = process.env.CROPOUT || '/tmp/cp02r4-crop';
  require('fs').mkdirSync(out,{recursive:true});
  await page.screenshot({path: path.join(out,'world.png'), clip:{x:560,y:56,width:520,height:330}});
  log('wrote world.png');
  // India close-up
  await page.screenshot({path: path.join(out,'asia.png'), clip:{x:830,y:80,width:260,height:200}});
  log('wrote asia.png');
};
