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
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForFunction(() => window.BEA && window.BEA.legend, null, { timeout: 20000 });
  for (const y of [1600, 1607, 1660, 2023, 2027]) {
    await page.evaluate((yy) => window.BEA.store.dispatch('setYear', yy), y);
    await page.waitForTimeout(500);
    log(y + ' :: ' + await page.evaluate(() => {
      const g = (s) => (document.querySelector(s) || {}).innerText || '(none)';
      return [g('.legend__head'), g('.legend__bodywrap').slice(0, 220)].join(' ||| ').replace(/\n/g, ' | ');
    }));
  }
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1600));
  await page.waitForTimeout(400);
  await shot('1600');
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 2023));
  await page.waitForTimeout(400);
  await shot('2023');
  log('ERRORS ' + JSON.stringify(errs));
};
