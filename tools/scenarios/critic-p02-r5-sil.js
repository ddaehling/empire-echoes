/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — elementHandle.hover: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('e'); await page.waitForTimeout(1000);
  await page.keyboard.press('h'); await page.waitForTimeout(1500);
  log('silences map: ' + await page.evaluate(() => JSON.stringify([...(window.__map.silences||new Map()).entries()]).slice(0,2000)));
  // hover Australia
  const el = await page.$('[data-unit="au-western-australia"], [data-unit="commonwealth-of-australia"], [data-unit="au-queensland"]');
  if (el) {
    await el.hover(); await page.waitForTimeout(1200); await shot('sil-hover');
    await el.click(); await page.waitForTimeout(1600); await shot('sil-click');
    log('TEXT:\n' + (await page.evaluate(()=>document.body.innerText)).slice(0,2500));
  } else log('no australia target');
};
