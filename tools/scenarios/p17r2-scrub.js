/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — ReferenceError: document is not defined.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    for (let y = 1600; y <= 1997; y += 1) {
      window.BEA.store.dispatch('setYear', y);
      if (y % 40 === 0) await new Promise(r => requestAnimationFrame(r));
    }
  });
  await page.waitForTimeout(1500);
  log('legend mounted: ' + !!document.querySelector);
  log('ERRORS ' + JSON.stringify(errs));
};
