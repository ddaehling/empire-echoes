/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=4', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForTimeout(2000);
  log('year ' + await page.evaluate(() => document.querySelector('.tl__year').textContent)
    + '  phase "' + await page.evaluate(() => document.querySelector('.tl__phase').textContent) + '"'
    + '  title "' + await page.evaluate(() => document.querySelector('.tl__phase').title) + '"');
  // scrub to 1820 with the keyboard on the axis
  await page.evaluate(() => window.BEA.store.dispatch ? null : null);
  await page.goto('http://localhost:8777/app/#tour=thirty&step=4&year=1820', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  log('year ' + await page.evaluate(() => document.querySelector('.tl__year').textContent)
    + '  phase "' + await page.evaluate(() => document.querySelector('.tl__phase').textContent) + '"'
    + '  title "' + await page.evaluate(() => document.querySelector('.tl__phase').title) + '"'
    + '  box ' + await page.evaluate(() => { const b = document.querySelector('.tl__phase').getBoundingClientRect(); return Math.round(b.width)+'x'+Math.round(b.height); })
    + '  time ' + await page.evaluate(() => Math.round(document.querySelector('.app__time').getBoundingClientRect().height)));
  await shot('y1820');
};
