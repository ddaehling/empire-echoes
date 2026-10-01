/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'innerText').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && document.querySelector('.tl'), null, { timeout: 20000 });
  await page.waitForTimeout(400);
  // a soft-date mark
  const soft = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.tl-mark')].find(b => b.dataset.kind !== 'what');
    return m ? m.dataset.year : null;
  });
  await page.evaluate((y) => { [...document.querySelectorAll('.tl-mark')].find(b => b.dataset.year === y).focus(); }, soft);
  await page.waitForTimeout(250);
  log('soft-date pop (' + soft + '): ' + await page.evaluate(() => document.querySelector('.tl__pop').innerText.replace(/\n/g, ' / ').slice(0, 420)));
  await shot('pop-date');
  // a disputed-account mark
  const what = await page.evaluate(() => {
    const m = [...document.querySelectorAll('.tl-mark')].find(b => b.dataset.kind === 'what');
    return m ? m.dataset.year : null;
  });
  await page.evaluate((y) => { [...document.querySelectorAll('.tl-mark')].find(b => b.dataset.year === y).focus(); }, what);
  await page.waitForTimeout(250);
  log('disputed-account pop (' + what + '): ' + await page.evaluate(() => document.querySelector('.tl__pop').innerText.replace(/\n/g, ' / ').slice(0, 420)));
  await shot('pop-claim');
  // a lane
  await page.evaluate(() => document.querySelector('.tl-lane[data-phase="dissolution"]').focus());
  await page.waitForTimeout(250);
  log('phase pop: ' + await page.evaluate(() => document.querySelector('.tl__pop').innerText.replace(/\n/g, ' / ').slice(0, 420)));
  await shot('pop-phase');
  // focus ring on a change card
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1858));
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('.tl-chg').focus());
  await page.waitForTimeout(150);
  await shot('card-focus', '.tl');
};
