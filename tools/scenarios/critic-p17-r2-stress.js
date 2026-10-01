/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  // open criticism, then hammer year + definition
  await page.click('.byline__crit'); await page.waitForTimeout(400);
  for (let i=0;i<25;i++){
    await page.keyboard.press(['1','2','3','4'][i%4]);
    await page.evaluate(y=>window.BEA.store.dispatch('setYear', y), 1700+i*12);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(1200);
  log('after burst byline:', (await page.evaluate(()=>document.querySelector('.stage__note').innerText)).replace(/\n+/g,' | ').slice(0,800));
  log('legend:', (await page.evaluate(()=>document.querySelector('.stage__legend').innerText)).replace(/\n+/g,' | ').slice(0,400));
  const st = await page.evaluate(()=>({ year: window.BEA.store.getState?window.BEA.store.getState().year:null }));
  log('state', JSON.stringify(st));
  await shot('burst');
  // select a territory
  await page.evaluate(()=>window.BEA.store.dispatch('select','india'));
  await page.waitForTimeout(1200);
  log('after select legend:', (await page.evaluate(()=>document.querySelector('.stage__legend')?.innerText||'GONE')).replace(/\n+/g,' | ').slice(0,300));
  log('after select byline:', (await page.evaluate(()=>document.querySelector('.stage__note')?.innerText||'GONE')).replace(/\n+/g,' | ').slice(0,300));
  await shot('selected');
};
