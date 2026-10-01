/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  for (const a of ['#tour=core&step=6', '#tour=thirty&step=12']) {
    await page.goto('http://localhost:8777/app/' + a, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1600);
    const r = await page.evaluate(() => ({
      marks: [...document.querySelectorAll('.tr-q')].map(n => n.getAttribute('data-fig')),
      rows: [...document.querySelectorAll('.tr-figs__row')].map(n => n.getAttribute('data-fig')),
      bare: document.querySelectorAll('.tr-q--bare').length,
      defect: document.querySelectorAll('.tr-figs .wq__defect').length,
      leftover: ((document.querySelector('.tr-panel') || { textContent: '' }).textContent.match(/\{\{fig:[a-z0-9-]+\}\}/g) || []),
    }));
    log(a + ' ' + JSON.stringify(r));
  }
  await page.goto('http://localhost:8777/app/#tour=core&step=1', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.BEA.bus.emit('close:open', { reason: 'test' }));
  await page.waitForTimeout(1300);
  const c = await page.evaluate(() => ({
    marks: [...document.querySelectorAll('.cl-close .tr-q')].map(n => n.getAttribute('data-fig')),
    rows: [...document.querySelectorAll('.cl-figs .tr-figs__row')].map(n => n.getAttribute('data-fig')),
    bare: document.querySelectorAll('.cl-close .tr-q--bare').length,
    defect: document.querySelectorAll('.cl-figs .wq__defect').length,
    leftover: ((document.querySelector('.cl-close').textContent.match(/\{\{fig:[a-z0-9-]+\}\}/g)) || []),
  }));
  log('CLOSE ' + JSON.stringify(c));
};
