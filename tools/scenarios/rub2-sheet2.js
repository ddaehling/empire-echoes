/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=17', {waitUntil:'load'});
  await page.waitForTimeout(2000);
  const info = await page.evaluate(()=>{
    const s=document.querySelector('.cx-sheet__body')||document.querySelector('.cx-sheet');
    return s?{c:s.className,h:s.clientHeight,sh:s.scrollHeight}:null;});
  log('sheet '+JSON.stringify(info));
  for (let i=0;i<5;i++){
    await page.evaluate(()=>{const s=document.querySelector('.cx-sheet__body')||document.querySelector('.cx-sheet'); s.scrollBy(0, s.clientHeight*0.85);});
    await page.waitForTimeout(450);
    await shot('sc'+i);
  }
};
