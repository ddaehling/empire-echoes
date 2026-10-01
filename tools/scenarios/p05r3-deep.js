/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p05r3-deep.js — where does #tour=thirty&step=N actually land? */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.removeItem('bea.ledger.v1'); } catch (_) {} });
  for (const n of [1, 5, 9, 12]) {
    await page.goto('http://localhost:8777/app/#tour=thirty&step=' + n, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => ({
      hash: location.hash,
      tourStep: window.BEA.store.getState().tourStep,
      counter: (document.querySelector('.tr-bar__count')?.textContent || '').trim(),
      title: (document.querySelector('.cx-sheet__title')?.textContent || '').trim(),
      lede: (document.querySelector('.cx-lede__say')?.textContent || '').trim().slice(0, 50),
    }));
    log('step=' + n + '  → ' + JSON.stringify(m));
  }
};
