/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913', {waitUntil:'load'});
  await page.waitForTimeout(3000);
  const st = async () => page.evaluate(()=>({proj:document.querySelector('.map').dataset.projection, hash:location.hash}));
  await shot('before');
  await page.locator('.map__proj').click();
  await page.waitForTimeout(400); await shot('t400');
  await page.waitForTimeout(400); await shot('t800');
  await page.waitForTimeout(1400); await shot('after-click-settled');
  log('after pw click', JSON.stringify(await st()));
  // restore via url filter
  await page.goto('http://localhost:8777/app/#year=1913&filter=proj:mercator', {waitUntil:'load'});
  await page.waitForTimeout(2500);
  log('via filter url', JSON.stringify(await st())); await shot('url-filter-mercator');
};
