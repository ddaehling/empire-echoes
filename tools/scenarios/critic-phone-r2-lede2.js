/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(()=>window.BEA&&window.BEA.store&&window.BEA.store.getState().status==='ready',{timeout:30000});
  await page.waitForTimeout(800);
  await page.evaluate(()=>window.BEA.store.dispatch('setYear',1857));
  await page.waitForTimeout(1000);
  await shot('lede1857','.app__lede');
  await shot('full1857');
  log('visible-lede', await page.evaluate(()=>{
    const p=document.querySelector('.cx-lede__say');
    return JSON.stringify({full:p.textContent.trim(), ch:p.clientHeight, sh:p.scrollHeight});
  }));
};
