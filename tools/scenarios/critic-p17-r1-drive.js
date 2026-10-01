/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1900&sel=india', {waitUntil:'load'});
  await page.waitForTimeout(3500);
  const bylineText = () => page.evaluate(()=> (document.querySelector('#legend-byline')||{}).innerText || 'NO BYLINE');
  const legendText = () => page.evaluate(()=> (document.querySelector('[data-mount="legend"]')||{}).innerText || 'NO LEGEND');
  log('BYLINE @claimed/equal-area:\n' + await bylineText());
  await shot('legend-panel', '[data-mount="legend"]');
  // open the criticism
  const crit = page.locator('.byline__crit');
  log('crit count: ' + await crit.count());
  await crit.first().click();
  await page.waitForTimeout(600);
  await shot('crit-open');
  log('BYLINE OPEN:\n' + await bylineText());
  // now change definition to controlled
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.keyboard.press('3');
  await page.waitForTimeout(1200);
  log('BYLINE @controlled:\n' + await bylineText());
  log('LEGEND @controlled:\n' + (await legendText()).slice(0,1200));
  await crit.first().click(); await page.waitForTimeout(500);
  log('CRIT @controlled:\n' + await bylineText());
  await shot('crit-controlled');
  await page.keyboard.press('Escape');
  // projection swap
  await page.keyboard.press('p');
  await page.waitForTimeout(2500);
  log('BYLINE @mercator:\n' + await bylineText());
  await crit.first().click(); await page.waitForTimeout(500);
  log('CRIT @mercator/controlled:\n' + await bylineText());
  await shot('crit-mercator');
  await page.keyboard.press('Escape');
  await page.keyboard.press('4');
  await page.waitForTimeout(1200);
  log('BYLINE @influenced/mercator:\n' + await bylineText());
  await crit.first().click(); await page.waitForTimeout(500);
  log('CRIT @influenced/mercator:\n' + await bylineText());
  await shot('crit-influenced');
};
