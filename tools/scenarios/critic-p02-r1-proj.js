/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=canada', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  await shot('equal-earth');
  const btn = await page.$('.map__proj');
  log('btn?', !!btn, await page.evaluate(()=>document.querySelector('.map__proj')?.getAttribute('aria-label')));
  await btn.click();
  await page.waitForTimeout(300); await shot('mid-morph-300ms');
  await page.waitForTimeout(400); await shot('mid-morph-700ms');
  await page.waitForTimeout(1500); await shot('mercator');
  log('after', await page.evaluate(()=>({proj:document.querySelector('.map').dataset.projection, hash:location.hash, aria:document.querySelector('.map__plate').getAttribute('aria-label')})));
  await btn.click(); await page.waitForTimeout(1800); await shot('back-to-equal-earth');
  log('back', await page.evaluate(()=>document.querySelector('.map').dataset.projection));
};
