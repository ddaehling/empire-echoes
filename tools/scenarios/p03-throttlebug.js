/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// Isolate: does a plain rapid year scrub raise uncaught errors, independent of the timeline UI?
module.exports = async ({ page, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => { for (let y = 1700; y < 1760; y++) { window.BEA.store.dispatch('setYear', y); window.BEA.store.flush(); } });
  await page.waitForTimeout(600);
  log('errors after 60 dispatches: ' + errs.length + ' ' + JSON.stringify(errs.slice(0,2)));
  // and with real time between them
  errs.length = 0;
  for (let i = 0; i < 6; i++) { await page.evaluate((y) => window.BEA.store.dispatch('setYear', y), 1800 + i * 3); await page.waitForTimeout(60); }
  await page.waitForTimeout(500);
  log('errors after paced dispatches: ' + errs.length);
  const users = await page.evaluate(async () => {
    const src = await (await fetch('js/core/url.js')).text();
    return src.split('\n').map((l, i) => [i + 1, l]).filter(([, l]) => /throttle\(/.test(l)).map(x => x.join(': '));
  });
  log('url.js throttle sites: ' + JSON.stringify(users));
};
