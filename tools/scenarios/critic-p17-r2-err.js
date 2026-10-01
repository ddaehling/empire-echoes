/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  page.on('pageerror', e => log('PAGEERROR: ' + (e.stack||String(e)).slice(0,900)));
  await page.waitForTimeout(3000);
  await page.click('.byline__crit'); await page.waitForTimeout(400);
  for (let i=0;i<25;i++){
    await page.keyboard.press(['1','2','3','4'][i%4]);
    await page.evaluate(y=>window.BEA.store.dispatch('setYear', y), 1700+i*12);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1500);
  log('CRIT@1988:', (await page.evaluate(()=>document.querySelector('#legend-criticism').innerText)).replace(/\n+/g,' || '));
  await page.evaluate(()=>window.BEA.store.dispatch('setYear', 2023)); await page.waitForTimeout(1200);
  log('CRIT@2023:', (await page.evaluate(()=>document.querySelector('#legend-criticism').innerText)).replace(/\n+/g,' || '));
  await page.evaluate(()=>window.BEA.store.dispatch('setYear', 1650)); await page.waitForTimeout(1200);
  log('CRIT@1650:', (await page.evaluate(()=>document.querySelector('#legend-criticism').innerText)).replace(/\n+/g,' || '));
  await shot('crit1650');
};
