/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3200);
  await shot('mobile-now');
  const c = await page.evaluate(()=>{const el=document.querySelector('.map__plate'); const r=el.getBoundingClientRect(); return {w:Math.round(r.width),h:Math.round(r.height)};});
  log('plate size', JSON.stringify(c));
  const dots = await page.evaluate(()=>{
    const t=[...document.querySelectorAll('.map__target.is-tiny')];
    return {tiny:t.length, all:document.querySelectorAll('.map__target').length};
  });
  log('tiny', JSON.stringify(dots));
  // zoom in via keyboard to see if it recovers
  await page.evaluate(()=>document.querySelector('.map__plate').focus());
  for (let i=0;i<5;i++){ await page.keyboard.press('+'); await page.waitForTimeout(200); }
  await page.waitForTimeout(800); await shot('mobile-zoomed');
};
