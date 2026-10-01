/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1820'; });
  await page.waitForTimeout(900);
  await shot('mode');
  log(await page.evaluate(()=>document.querySelector('.time__slot').innerText.slice(0,1400)));
  const box = await page.evaluate(()=>{const e=document.querySelector('.time__slot'); const r=e.getBoundingClientRect(); return {w:r.width,h:r.height,top:r.top};});
  log('time slot box '+JSON.stringify(box));
};
