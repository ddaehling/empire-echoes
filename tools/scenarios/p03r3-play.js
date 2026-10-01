/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForSelector('.tl', { timeout: 15000 });
  await page.waitForTimeout(800);
  const st = () => page.evaluate(() => {
    const p = document.querySelector('.tl').__p03;
    return { year: p.store.getState().year, playing: p.store.getState().playing, hasSwept: p.hasSwept, sweeping: p.sweeping,
      btn: (document.querySelector('.tl-btn--play') || {}).textContent };
  });
  // skip the sweep: pretend it already ran
  await page.evaluate(() => { document.querySelector('.tl').__p03.hasSwept = true; location.hash = '#year=1750&filter=stage:working'; });
  await page.waitForTimeout(800);
  log('before: ' + JSON.stringify(await st()));
  await page.click('.tl-btn--play');
  await page.waitForTimeout(3000);
  log('after 3s of Play: ' + JSON.stringify(await st()));
  await page.click('.tl-btn--play');
  await page.waitForTimeout(400);
  log('after pause: ' + JSON.stringify(await st()));
  // and at the end of the record
  await page.evaluate(() => { location.hash = '#year=1997&filter=stage:working'; });
  await page.waitForTimeout(700);
  await page.click('.tl-btn--play');
  await page.waitForTimeout(2500);
  log('Play from the last year: ' + JSON.stringify(await st()));
  await page.click('.tl-btn--play');
};
