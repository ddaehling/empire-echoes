/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-stress.js — 600 frames of scrubbing through the shell's own history
   writer (the throttle's only caller), then the focal sweep, then the sweep
   again under whatever motion setting this run was launched with. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  const errs = [];
  page.on('pageerror', e => errs.push(String(e)));

  const t0 = Date.now();
  await page.evaluate(async () => {
    const s = window.BEA.store;
    for (let i = 0; i < 600; i++) {
      s.dispatch('setYear', 1600 + (i % 397));
      s.flush();
      await new Promise(r => requestAnimationFrame(r));
    }
  });
  await page.waitForTimeout(800);
  log('600-frame scrub in ' + (Date.now() - t0) + 'ms; uncaught errors: ' + errs.length + ' ' + JSON.stringify(errs.slice(0, 3)));
  log('history entries after the scrub: ' + await page.evaluate(() => history.length) + ' (a scrub must not stack Back)');

  // the focal path
  await page.evaluate(() => window.BEA.bus.emit('ask:sweep'));
  await page.waitForTimeout(2500);
  const mid = await page.evaluate(() => ({ year: window.BEA.store.getState().year, stage: document.getElementById('app').dataset.stage }));
  log('2.5s into the sweep: ' + JSON.stringify(mid));
  await page.evaluate(() => document.querySelector('.cx-cta') && document.querySelector('.cx-cta').click());
  await page.waitForTimeout(900);
  log('after Stop: ' + JSON.stringify(await page.evaluate(() => ({ year: window.BEA.store.getState().year, stage: document.getElementById('app').dataset.stage, cta: (document.querySelector('.cx-cta') || {}).textContent }))));
  log('uncaught errors total: ' + errs.length);
};
