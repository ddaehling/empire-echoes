/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1400);
  const r = await page.evaluate(() => ({
    marks: [...document.querySelectorAll('.cl-close .tr-q')].map(n => n.getAttribute('data-fig') + '=' + (n.textContent || '').trim()),
    rows: [...document.querySelectorAll('.cl-figs .tr-figs__row')].map(n => n.getAttribute('data-fig')),
    warrants: [...document.querySelectorAll('.cl-figs .wq__w')].map(n => n.dataset.status),
    defects: document.querySelectorAll('.cl-figs .wq__defect').length,
    leftover: ((document.querySelector('.cl-close').textContent.match(/\{\{fig:[a-z0-9-]+\}\}/g)) || []),
    line4: (document.querySelectorAll('.cl-line')[3] || {}).textContent,
  }));
  log(JSON.stringify(r, null, 1));
  await shot('close-figs');
};
