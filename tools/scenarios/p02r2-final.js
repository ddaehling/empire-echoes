/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(3600);
  await shot('01-1913');
  await page.evaluate(() => window.__map.setDefinition('influenced'));
  await page.waitForTimeout(600); await shot('02-influenced');
  await page.evaluate(() => window.__map.setDefinition('controlled'));
  await page.waitForTimeout(600); await shot('03-controlled');
  await page.evaluate(() => { window.__map.setDefinition('claimed'); window.BEA.store.dispatch('setYear', 1783); });
  await page.waitForTimeout(700); await shot('04-1783');
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1913); window.BEA.bus.emit('ask:paintSilence', { unitIds: ['kenya'], agent: 'the Colonial Office, 1963', reason: 'Operation Legacy' }); });
  await page.waitForTimeout(700); await shot('05-silence');
  const sil = await page.evaluate(() => document.querySelector('.map__switch').innerText.split('\n').filter(l => /holes are silences/i.test(l)).join(' '));
  log('silence line', sil);
  await page.evaluate(() => window.BEA.bus.emit('ask:paintSilence', { unitIds: [], clear: true }));
  log('errors', JSON.stringify(errs));
};
