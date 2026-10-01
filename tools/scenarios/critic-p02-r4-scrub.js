/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const t0=Date.now();
  for (let y=1600;y<=1997;y+=1) {
    await page.evaluate(y=>window.BEA.store.dispatch('setYear',y), y);
    if (y%40===0) await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1500);
  log('scrub ms', Date.now()-t0);
  await shot('after-scrub');
  log('year', await page.evaluate(()=>window.BEA.store.getState().year));
  // now play at 16x
  await page.evaluate(()=>{window.BEA.store.dispatch('setYear',1600); window.BEA.store.dispatch('setSpeed',16); window.BEA.store.dispatch('play');});
  await page.waitForTimeout(9000);
  log('after play year', await page.evaluate(()=>window.BEA.store.getState().year));
  await shot('after-play');
};
