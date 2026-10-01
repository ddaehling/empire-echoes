/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1882));
  await page.waitForTimeout(400);
  await shot('a-1882');
  // open a change card -> full account in the drawer
  await page.click('.tl-chg[data-kind="change"]');
  await page.waitForTimeout(500);
  await shot('b-changepop');
  log('changepop:', await page.evaluate(() => document.querySelector('.tl__pop').innerText.slice(0, 700).replace(/\n/g,' | ')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // playback stop card
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.setYear(1857); });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.showStopCard(p.stops.get(1858) || { year: 1858, title: 'test', why: 'test' }); });
  await page.waitForTimeout(400);
  await shot('c-stopcard');
  log('stopcard:', await page.evaluate(() => document.querySelector('.tl__stopcard').innerText.replace(/\n/g,' | ').slice(0,400)));
  log('stage after stopcard:', await page.evaluate(() => JSON.stringify(document.querySelector('#stage').getBoundingClientRect())));
};
