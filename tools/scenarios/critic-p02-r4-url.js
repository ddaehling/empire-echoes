/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.mouse.move(720,180);
  for(let i=0;i<6;i++){await page.mouse.wheel(0,-200); await page.waitForTimeout(120);}
  await page.waitForTimeout(1200);
  log('hash after zoom:', await page.evaluate(()=>location.hash));
  await page.keyboard.press('p'); await page.waitForTimeout(2000);
  log('hash after proj:', await page.evaluate(()=>location.hash));
  await page.keyboard.press('2'); await page.waitForTimeout(900);
  log('hash after def:', await page.evaluate(()=>location.hash));
  // reload and see it restore
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(3500);
  log('restored:', JSON.stringify(await page.evaluate(()=>({v:window.BEA.store.getState().mapView, p:document.querySelector('.map').dataset.projection, d:document.querySelector('.map').dataset.definition}))));
  await shot('restored');
};
