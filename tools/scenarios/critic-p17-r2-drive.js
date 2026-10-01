/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const byline = () => page.evaluate(() => document.querySelector('#legend-byline')?.innerText || 'NONE');
  const rule = () => page.evaluate(() => document.querySelector('.legend__rulebox')?.innerText || 'NONE');
  const crit = async () => {
    const p = await page.evaluate(() => document.querySelector('#legend-criticism')?.innerText || 'CLOSED');
    return p;
  };
  await page.click('body');
  log('BYLINE@1900 claimed >>>', await byline());
  log('RULE >>>', await rule());
  // open criticism
  await page.click('.byline__crit');
  await page.waitForTimeout(400);
  log('CRIT (mercator/status/claimed) >>>', await crit());
  await shot('crit-open');
  for (const k of ['2','3','4']) {
    await page.keyboard.press(k);
    await page.waitForTimeout(700);
    log(`--- after key ${k} ---`);
    log('RULE >>>', await rule());
    log('CRIT >>>', await crit());
  }
  await shot('after-4');
  await page.keyboard.press('1'); await page.waitForTimeout(500);
  await page.keyboard.press('p'); await page.waitForTimeout(1500);
  log('--- after P (projection) ---');
  log('BYLINE >>>', await byline());
  log('CRIT >>>', await crit());
  await shot('equal-earth');
  await page.keyboard.press('s'); await page.waitForTimeout(1500);
  log('--- after S (stitching) ---');
  log('BYLINE >>>', await byline());
  log('CRIT >>>', await crit());
  log('RULE >>>', await rule());
  await shot('stitching');
};
