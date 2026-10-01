/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P03 — the final visual sweep. Scrolls the time bar into view so the popovers
// can be seen over the stage even while another piece is making the page tall.
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console:' + m.text()); });
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector('.app__time').scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(150);
  await shot('a-bar-in-place');
  await page.click('.tl-lane[data-phase="company"]');
  await page.waitForTimeout(250);
  await shot('b-phase-pop-over-stage');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1967));
  await page.waitForTimeout(200);
  await page.click('.tl__warn');
  await page.waitForTimeout(200);
  await shot('c-date-pop-over-stage');
  log('1967 pop: ' + (await page.textContent('.tl__pop')));
  log('errors: ' + JSON.stringify(errs));
};
