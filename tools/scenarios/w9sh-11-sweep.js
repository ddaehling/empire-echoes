/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* sweeps the moment the hash is set across the whole boot window */
const ADDR = '#tour=period&step=4';
module.exports = async ({ page, log, ctx, url }) => {
  const D = +(process.env.W9_DELAY || 0);
  await ctx.addInitScript(({ addr, d }) => {
    window.__race = [];
    setTimeout(() => {
      const bar = document.getElementById('boot-progress');
      window.__race.push({ t: Math.round(performance.now()),
        pct: bar ? bar.style.width : '?',
        boot: document.documentElement.dataset.boot,
        status: window.BEA ? window.BEA.store.getState().status : 'no-store' });
      location.hash = addr;
    }, d);
  }, { addr: ADDR, d: D });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2600);
  const r = await page.evaluate(() => {
    const s = window.BEA.store.getState(), app = document.getElementById('app');
    return { fired: window.__race, hash: location.hash, tour: s.activeTour, step: s.tourStep,
             path: app.getAttribute('data-path'), panel: !!document.querySelector('.tr-panel, .tr-gate, .app__sheet .qz') };
  });
  const ok = /tour=period/.test(r.hash) && /step=4(&|$)/.test(r.hash)
    && r.tour === 'period' && r.step === 3 && r.path === 'on' && r.panel;
  log('delay=' + D + 'ms  fired=' + JSON.stringify(r.fired) + '  -> ' + (ok ? 'PASS' : 'FAIL')
      + '  hash=' + r.hash + '  store=' + r.tour + '@' + r.step + '  path=' + r.path + ' panel=' + r.panel);
};
