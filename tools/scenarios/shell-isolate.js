/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: exits 1.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-isolate.js — one module throws in mount(), one never settles, one throws
   on a timer after boot. The atlas must open, name them, and keep every other
   module running. */
module.exports = async ({ page, shot, log }) => {
  await page.route('**/js/viz/index.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: "export default { id:'viz', slot:'overlay', async mount(){ throw new Error('viz: deliberate test failure'); } };",
  }).catch(() => {}));
  await page.route('**/js/search/index.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: "export default { id:'search', slot:'toolbar', mount(){ return new Promise(()=>{}); } };",
  }).catch(() => {}));
  await page.route('**/js/quiz/index.js', route => route.fulfill({
    contentType: 'text/javascript',
    body: "export default { id:'quiz', slot:'overlay', async mount(){ setTimeout(()=>{ throw new Error('quiz: deliberate late throw'); }, 400); }, update(){ throw new Error('quiz: deliberate update throw'); } };",
  }).catch(() => {}));

  const t0 = Date.now();
  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  log('booted in ' + (Date.now() - t0) + 'ms despite three broken modules');
  await page.waitForTimeout(2500);
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1857); window.BEA.store.flush(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1858); window.BEA.store.flush(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1859); window.BEA.store.flush(); });
  await page.waitForTimeout(1200);
  log('report: ' + JSON.stringify(await page.evaluate(() => {
    const r = window.BEA.registry.report();
    return { mounted: r.mounted, failed: r.failed, slow: r.slow, disabled: r.disabled,
      note: document.getElementById('shell-note').textContent.slice(0, 200),
      dev: document.getElementById('app').hasAttribute('data-dev'),
      mapDrawn: !!document.querySelector('.stage__map canvas, .stage__map svg'),
      vizSlotEmpty: [...document.querySelectorAll('[data-mount="overlay"]')].every(n => true),
      year: window.BEA.store.getState().year };
  })));
  await shot('with-three-broken-modules');
};
