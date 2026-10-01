/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.textContent: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P03 — element shots of the time bar in several years, so the bar can be read
// even while other pieces are mid-build and the page is tall.
module.exports = async ({ page, shot, log }) => {
  const errors = [], pageErrors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('requestfailed', r => failed.push(r.url()));
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl');
  const years = [1600, 1820, 1857, 1931, 1500, 2010];
  for (const y of years) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(150);
    await shot('bar-' + y, '.app__time');
    log(y + ' caption: ' + (await page.textContent('.tl-spine__caption')));
  }
  // a mark popover
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1931));
  await page.waitForTimeout(120);
  await page.click('.tl__warn');
  await page.waitForTimeout(160);
  await shot('pop-1931', '.app__time');
  log('pop: ' + (await page.textContent('.tl__pop')).slice(0, 400));
  // a phase note
  await page.keyboard.press('Escape');
  await page.click('.tl-lane[data-phase="imperial"]');
  await page.waitForTimeout(160);
  await shot('pop-phase', '.app__time');
  log('errors: ' + JSON.stringify(errors) + ' | pageErrors: ' + JSON.stringify(pageErrors));
};
