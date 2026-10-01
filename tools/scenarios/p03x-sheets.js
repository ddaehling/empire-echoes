/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.BEA.bus.emit('timeline:openYear', { year: 1858 }));
  await page.waitForTimeout(700);
  log('year sheet', await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); return JSON.stringify({ t: document.querySelector('.cx-sheet__title').textContent, h: Math.round(b.getBoundingClientRect().height), sh: b.scrollHeight, note: (document.querySelector('.tl__drawer-more')||{}).textContent }); }));
  await shot('year');
  await page.evaluate(() => window.BEA.bus.emit('timeline:openRate'));
  await page.waitForTimeout(700);
  await shot('rate');
  log('rate sheet', await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); return JSON.stringify({ t: document.querySelector('.cx-sheet__title').textContent, h: Math.round(b.getBoundingClientRect().height), sh: b.scrollHeight, rateW: Math.round(document.querySelector('.tl-rate__plot').getBoundingClientRect().width), svgW: document.querySelector('.tl-rate__svg').getAttribute('width') }); }));
  // the prediction
  const ask = await page.$('.tl-rate__ask');
  if (ask) { await ask.click(); await page.waitForTimeout(800); }
  await shot('predict');
  log('predict', await page.evaluate(() => { const p = document.querySelector('.tl-pred'); return p ? p.innerText.slice(0, 200).replace(/\n/g, ' | ') : 'NONE'; }));
  // an account in full
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.evaluate(() => window.BEA.bus.emit('timeline:openAccount'));
  await page.waitForTimeout(700);
  await shot('account');
  log('account sheet', await page.evaluate(() => { const b = document.querySelector('.cx-sheet__body'); return JSON.stringify({ t: document.querySelector('.cx-sheet__title').textContent, h: Math.round(b.getBoundingClientRect().height), sh: b.scrollHeight }); }));
};
