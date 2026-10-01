/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  log('DOOR cta="' + await page.evaluate(() => document.querySelector('.cx-cta:not([hidden])')?.textContent || '') + '"');
  log('DOOR lede="' + await page.evaluate(() => document.querySelector('.cx-lede__say')?.textContent || '') + '"');
  await page.evaluate(() => document.querySelector('.tr-bar__escape')?.click());
  await page.waitForTimeout(1400);
  await page.evaluate(() => document.querySelector('.tr-routes__open')?.click());
  await page.waitForTimeout(400);
  const card = await page.evaluate(() => ({
    line: document.querySelector('.tr-routes__line')?.textContent || '',
    rows: [...document.querySelectorAll('.tr-routes__row')].map((n) => n.querySelector('.tr-routes__lab')?.textContent),
    how: document.querySelector('.tr-routes__how')?.textContent || '',
    escapeTitle: document.querySelector('.tr-bar__escape')?.getAttribute('title') || '',
  }));
  log('CARD ' + JSON.stringify(card, null, 1));
  await shot('card');
};
