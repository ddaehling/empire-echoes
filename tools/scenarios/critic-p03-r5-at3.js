/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: window.BEA.store.get is not a function.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const r = await page.evaluate(() => {
    const d = window.BEA && window.BEA.data;
    if (!d) return 'no BEA';
    const out = {};
    out.bounds = d.bounds;
    out.next1856 = d.nextChangeYear(1856, 1);
    out.prev1856 = d.nextChangeYear(1856, -1);
    out.next1913 = d.nextChangeYear(1913, 1);
    const tl = d.timeline();
    out.cutsCount = tl.cuts.length;
    out.events = tl.events.length;
    out.cutsNear1856 = tl.cuts.filter(c=>c>1850&&c<1865);
    return out;
  });
  log(JSON.stringify(r,null,1));
  // now drive shift-right from 1856 with rail focused
  await page.evaluate(()=>{location.hash='#year=1856';});
  await page.waitForTimeout(800);
  const seq=[];
  for (let i=0;i<6;i++){
    await page.keyboard.press('Shift+ArrowRight'); await page.waitForTimeout(450);
    seq.push(await page.evaluate(()=>window.BEA.store.get().year));
  }
  log('shift-right seq from 1856: '+seq.join(', '));
  const seq2=[];
  await page.evaluate(()=>{location.hash='#year=1856';}); await page.waitForTimeout(600);
  for (let i=0;i<4;i++){
    await page.keyboard.press('Alt+ArrowRight'); await page.waitForTimeout(450);
    seq2.push(await page.evaluate(()=>window.BEA.store.get().year));
  }
  log('alt-right (bigJump) seq from 1856: '+seq2.join(', '));
};
