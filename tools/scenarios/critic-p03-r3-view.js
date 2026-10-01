/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(800);
  await shot('v1820');
  const sp = await page.evaluate(() => { const e=document.querySelector('.tl-spine'); const r=e.getBoundingClientRect(); return {y:r.y,h:r.height,w:r.width, inView: r.y < window.innerHeight && r.bottom > 0}; });
  log('spine rect:', JSON.stringify(sp), 'innerH', await page.evaluate(()=>window.innerHeight));
  const tl = await page.evaluate(() => { const e=document.querySelector('.tl-ax'); const r=e.getBoundingClientRect(); return {y:r.y,h:r.height,w:r.width}; });
  log('axis rect:', JSON.stringify(tl));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1947));
  await page.waitForTimeout(800);
  await shot('v1947');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1997));
  await page.waitForTimeout(800);
  await shot('v1997');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 2027));
  await page.waitForTimeout(800);
  await shot('v2027');
  log('2027 text:', await page.evaluate(() => document.querySelector('.tl, [class*="tl-root"], footer')?.innerText.slice(0,1200)));
};
