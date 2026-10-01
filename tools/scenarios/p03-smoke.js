/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P03 — clean-load health: zero console errors, zero failed requests, module mounted.
module.exports = async ({ page, log, shot }) => {
  const errors = [], pageErrors = [], failed = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e)));
  page.on('requestfailed', r => failed.push(r.url() + ' ' + (r.failure() && r.failure().errorText)));
  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl-spine__track');
  await page.waitForTimeout(1200);
  log('registry: ' + JSON.stringify(await page.evaluate(() => { const r = window.BEA.registry.report(); return { mounted: r.mounted.length, failed: r.failed, disabled: r.disabled }; })));
  log('errors=' + JSON.stringify(errors));
  log('pageErrors=' + JSON.stringify(pageErrors));
  log('failed=' + JSON.stringify(failed));
  await page.evaluate(() => document.querySelector('.app__time').scrollIntoView({ block: 'end' }));
  await shot('clean-load', '.app__time');
};
