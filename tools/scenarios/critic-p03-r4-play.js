/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.waitForTimeout(3000);
  await page.evaluate(() => { location.hash = '#year=1600'; });
  await page.waitForTimeout(1000);
  // click Play button
  await page.click('.tl-btn--play');
  const samples = [];
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500);
    samples.push(await page.evaluate(() => (location.hash.match(/year=(\d+)/)||[])[1] + (document.querySelector('.tl-btn--play')?.innerText.trim()||'')));
  }
  log('samples every 500ms:', samples.join(' '));
  await shot('after-20s');
  const state = await page.evaluate(() => ({
    hash: location.hash,
    playBtn: document.querySelector('.tl-btn--play')?.innerText,
    row: document.querySelector('.tl-chg')?.innerText,
    stop: document.body.innerText.match(/stopped[^\n]*/gi)
  }));
  log('state:', JSON.stringify(state, null, 1));
  log('errs', JSON.stringify(errs));
};
