/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3400);
  await shot('01-full');
  log('insets', JSON.stringify(await page.evaluate(() => ({ ins: window.__map.plate.insets, avail: window.__map.plate.camera(), refused: window.__map.module.insetRefused }))).slice(0, 260));
  await page.evaluate(() => window.__map.setDefinition('influenced'));
  await page.waitForTimeout(500); await shot('02-influenced');
  await page.evaluate(() => { window.__map.setDefinition('claimed'); window.__map.setStitch(true); });
  await page.waitForTimeout(600); await shot('03-stitch');
  await page.evaluate(() => window.__map.setStitch(false));
  await page.evaluate(() => window.BEA.store.dispatch('setTheme', 'lamplit'));
  await page.waitForTimeout(600); await shot('04-lamplit');
  log('errors', JSON.stringify(errs));
};
