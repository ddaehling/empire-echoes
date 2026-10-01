/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'getAttribute').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const st = () => page.evaluate(() => ({ full: !!document.querySelector('.legend__bodywrap'),
    pill: !!document.querySelector('.legend--compact'), crit: document.querySelector('.byline__crit').getAttribute('aria-expanded') }));
  log('a ' + JSON.stringify(await st()));
  await page.click('.byline__crit'); await page.waitForTimeout(400);
  log('b ' + JSON.stringify(await st()));
  await page.click('.legend__toggle'); await page.waitForTimeout(400);
  log('c ' + JSON.stringify(await st()));
  await page.click('.legend__toggle'); await page.waitForTimeout(400);
  log('d(folded) ' + JSON.stringify(await st()));
  await page.click('.legend__toggle'); await page.waitForTimeout(400);
  log('e ' + JSON.stringify(await st()));
};
