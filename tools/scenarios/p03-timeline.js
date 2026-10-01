/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.textContent: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P03 — timeline: boot, look, and console/network health.
module.exports = async ({ page, shot, log }) => {
  const errors = [], failed = [], pageErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => failed.push(r.url() + ' ' + (r.failure() && r.failure().errorText)));

  await page.waitForFunction(() => window.BEA && window.BEA.registry, null, { timeout: 20000 });
  await page.waitForSelector('.tl', { timeout: 10000 });
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1820));
  await page.waitForTimeout(250);
  await shot('01-1820');

  const caption = await page.textContent('.tl-spine__caption');
  log('caption@1820: ' + caption);
  const lit = await page.$$eval('.tl-lane[data-on="true"]', ns => ns.map(n => n.dataset.phase));
  log('lit@1820: ' + JSON.stringify(lit));
  const changes = await page.textContent('.tl__changes');
  log('changes@1820: ' + changes);

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1857));
  await page.waitForTimeout(200);
  await shot('02-1857');
  log('changes@1857: ' + (await page.textContent('.tl__changes')));
  log('caption@1857: ' + (await page.textContent('.tl-spine__caption')));

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1931));
  await page.waitForTimeout(200);
  log('warn@1931: ' + (await page.$eval('.tl__warn', n => n.hidden + ' / ' + n.textContent)));
  await shot('03-1931');

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1500));
  await page.waitForTimeout(200);
  await shot('04-1500-head');
  log('caption@1500: ' + (await page.textContent('.tl-spine__caption')));

  await page.evaluate(() => window.BEA.store.dispatch('setYear', 2010));
  await page.waitForTimeout(200);
  log('caption@2010: ' + (await page.textContent('.tl-spine__caption')));
  await shot('05-2010');

  log('console errors: ' + JSON.stringify(errors));
  log('page errors: ' + JSON.stringify(pageErrors));
  log('failed requests: ' + JSON.stringify(failed));
  log('registry: ' + JSON.stringify(await page.evaluate(() => {
    const r = window.BEA.registry.report();
    return { mounted: r.mounted, failed: r.failed, disabled: r.disabled };
  })));
};
