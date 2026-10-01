/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.keyboard.press('h');
  await page.waitForTimeout(1200);
  await shot('silences-mode');
  log('legend:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).replace(/\n+/g,' | ').slice(0,700));
  log('byline:', (await page.evaluate(()=>document.querySelector('.stage__note').innerText)).replace(/\n+/g,' | ').slice(0,700));
  log('switch:', (await page.evaluate(()=>document.querySelector('.map__switch')?.innerText||'')).replace(/\n+/g,' | ').slice(0,700));
  // criticism in silences mode
  await page.click('.byline__crit'); await page.waitForTimeout(600);
  log('crit:', (await page.evaluate(()=>document.querySelector('#legend-criticism').innerText)).replace(/\n+/g,' | '));
  await shot('sil-crit');
  // now weight mode
  await page.keyboard.press('h'); await page.waitForTimeout(600);
  await page.keyboard.press('w'); await page.waitForTimeout(1400);
  log('WEIGHT byline:', (await page.evaluate(()=>document.querySelector('.stage__note').innerText)).replace(/\n+/g,' | ').slice(0,900));
  log('WEIGHT legend:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).replace(/\n+/g,' | ').slice(0,700));
  await shot('weight');
};
