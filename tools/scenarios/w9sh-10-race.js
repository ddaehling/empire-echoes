/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* w9sh-10-race.js — (e) THE BOOT RACE, reproduced from before the first byte
   of the app runs.

   `window.BEA` is published on the LAST line of boot, so a probe that waits for
   it can never see the window this defect lives in. This scenario installs an
   init script instead — it runs before any of the page's own script — and fires
   `location.hash = '#tour=…'` a few milliseconds in, while the store is still
   'booting' and no module has mounted. It then asks the three parties what is
   on screen: the address, the store, and the DOM. They must agree. */
const ADDR = '#tour=period&step=4';

module.exports = async ({ page, log, ctx, url, shot }) => {
  await ctx.addInitScript(({ addr }) => {
    window.__raceLog = [];
    const fire = () => {
      window.__raceLog.push({ at: 'set', ready: !!(window.BEA && window.BEA.store),
        status: window.BEA ? window.BEA.store.getState().status : 'no-store',
        t: Math.round(performance.now()) });
      location.hash = addr;
    };
    /* THE WINDOW IS BETWEEN `url.restore()` AND `setStatus('ready')`, and the
       only signal a page script can see from outside is main.js's own boot
       meter: `progress(55, 'Looking for the atlas modules…')` is the line
       immediately after `restore()`, and `revealApp()` sets
       `<html data-boot="ready">` at the end. So: poll the meter, fire once at
       55-99 %, and record what the store thought it was doing at that moment. */
    const tick = () => {
      if (document.documentElement.dataset.boot === 'ready') return;
      const bar = document.getElementById('boot-progress');
      const pct = bar ? parseFloat(bar.style.width) || 0 : 0;
      if (pct >= 55) { fire(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { addr: ADDR });

  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(3000);

  log('when the hash was set: ' + JSON.stringify(await page.evaluate(() => window.__raceLog)));

  const after = await page.evaluate(() => {
    const s = window.BEA.store.getState();
    const app = document.getElementById('app');
    return {
      hash: location.hash,
      storeTour: s.activeTour, storeStep: s.tourStep,
      dataPath: app.getAttribute('data-path'),
      mountedPanel: !!document.querySelector('.tr-panel, .app__sheet .qz, .tr-gate'),
      transport: (document.querySelector('.tr-dock, .bar__dock') || {}).textContent || null,
    };
  });
  log('AFTER: ' + JSON.stringify(after));
  await shot('after-race');

  const hashHasTour = /tour=period/.test(after.hash) && /step=4(&|$)/.test(after.hash);
  const ok = hashHasTour && after.storeTour === 'period' && after.storeStep === 3
    && after.dataPath === 'on' && after.mountedPanel;
  log((ok ? 'PASS' : 'FAIL') + ' (e) address / store / mounted route agree —'
    + ' want tour=period&step=4 · period@3 · data-path=on · a panel mounted;'
    + ' got ' + after.hash + ' · ' + after.storeTour + '@' + after.storeStep
    + ' · data-path=' + after.dataPath + ' · panel=' + after.mountedPanel);
};
