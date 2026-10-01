/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { const p = document.querySelector('.tl').__p03; p.setYear(1857); p.showStopCard(p.stops.get(1858)); });
  await page.waitForTimeout(400);
  await shot('stopband');
  log('stage with stop card:', await page.evaluate(() => Math.round(document.querySelector('#stage').getBoundingClientRect().height)));
  await page.evaluate(() => document.querySelector('.tl').__p03.hideStopCard());
  await page.waitForTimeout(300);
  // compare ghost
  await page.evaluate(() => window.BEA.store.dispatch('setCompareYear', 1913));
  await page.waitForTimeout(300);
  log('ghost visible:', await page.evaluate(() => { const g = document.querySelector('.tl-ax__ghost'); return !g.hidden && g.textContent; }));
  await page.evaluate(() => window.BEA.store.dispatch('setCompareYear', null));
  // Escape closes drawer
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(300);
  await page.click('.tl-chg--more');
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  log('drawer after Escape:', await page.evaluate(() => document.querySelector('.tl__drawer').hidden));
  log('focus after Escape:', await page.evaluate(() => document.activeElement.className));
  // keyboard: tab into the rail and Alt+Right
  await page.focus('.tl-ax__rail');
  await page.keyboard.press('Alt+ArrowRight');
  await page.waitForTimeout(400);
  log('after Alt+Right from 1858:', await page.evaluate(() => window.BEA.store.getState().year));
  await page.keyboard.press('Shift+ArrowRight');
  await page.waitForTimeout(400);
  log('then Shift+Right:', await page.evaluate(() => window.BEA.store.getState().year));
  await shot('final');
};
