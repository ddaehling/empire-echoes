/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  log('hash0', await page.evaluate(()=>location.hash));
  await page.keyboard.press('e'); await page.waitForTimeout(900);
  await page.keyboard.press('p'); await page.waitForTimeout(1800);
  await page.keyboard.press('+'); await page.waitForTimeout(600);
  await page.keyboard.press('+'); await page.waitForTimeout(900);
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(600);
  log('hash1', await page.evaluate(()=>location.hash));
  await shot('zoomed');
  // reload and see if restored
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(3000);
  log('hash after reload', await page.evaluate(()=>location.hash));
  await shot('after-reload');
  log('plate', await page.evaluate(()=>{const r=document.querySelector('.map__plate').getBoundingClientRect();return r.width+'x'+r.height}));
};
