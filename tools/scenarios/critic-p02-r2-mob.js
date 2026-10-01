/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscr.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await shot('mobile');
  log('map box: ' + JSON.stringify(await page.evaluate(()=>{const r=document.querySelector('.map')?.getBoundingClientRect(); return r?{w:Math.round(r.width),h:Math.round(r.height)}:null;})));
  // tap a big unit
  const b = await page.evaluate(()=>{const e=document.querySelector('.map__target[data-unit="in-bengal"]')||document.querySelector('.map__target'); const r=e.getBoundingClientRect(); return {u:e.dataset.unit,x:r.x+r.width/2,y:r.y+r.height/2};});
  log('tap ' + JSON.stringify(b));
  await page.touchscreen.tap(b.x, b.y);
  await page.waitForTimeout(1200);
  log('after tap: ' + await page.evaluate(()=>location.hash));
  await shot('after-tap');
  // pinch-ish: double tap zoom?
  await page.touchscreen.tap(b.x, b.y);
  await page.waitForTimeout(800);
  await shot('after-tap2');
};
