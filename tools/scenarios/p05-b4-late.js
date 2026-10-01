/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  await page.goto('http://localhost:8777/app/#tour=core&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => ({
    step: window.BEA.store.getState().tourStep,
    stand: (document.querySelector('.cl-close__stand') || {}).textContent,
    late: (document.querySelector('.cl-close__late') || {}).textContent,
    note: (document.querySelector('.cl-actions__note') || {}).textContent,
  }));
  log(JSON.stringify(r, null, 1));
};
