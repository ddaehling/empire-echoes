/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscr.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  const st = async () => page.evaluate(()=>document.querySelector('.map').dataset.definition);
  log('before', await st());
  const p = await page.evaluate(()=>{const b=[...document.querySelectorAll('.map__def')][2];const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.touchscreen.tap(p.x, p.y);
  await page.waitForTimeout(1000);
  log('after tap on "3 controlled"', await st());
  await shot('after-tap');
};
