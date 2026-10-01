/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* w9sh-13-race.js — (e) THE BOOT RACE, deterministically.
   `about:blank` first so the goto is always a real document navigation and the
   init script always runs in the document we measure. The init script fires
   `location.hash = '#tour=period&step=4'` at W9_DELAY ms and records, in
   sessionStorage so it survives anything, what the app thought it was doing at
   that instant. Then: the address, the store, and what is actually drawn. */
const ADDR = '#tour=period&step=4';
module.exports = async ({ page, log, ctx, url }) => {
  const D = +(process.env.W9_DELAY || 0);
  await ctx.addInitScript(({ addr, d }) => {
    const push = (o) => { try { const a = JSON.parse(sessionStorage.getItem('w9race') || '[]'); a.push(o); sessionStorage.setItem('w9race', JSON.stringify(a)); } catch (e) {} };
    setTimeout(() => {
      push({ ev: 'set', t: Math.round(performance.now()), from: location.hash,
             boot: document.documentElement.dataset.boot,
             status: window.BEA ? window.BEA.store.getState().status : 'booting(no BEA yet)' });
      location.hash = addr;
    }, d);
  }, { addr: ADDR, d: D });
  await page.goto('about:blank');
  await page.evaluate(() => { try { sessionStorage.removeItem('w9race'); } catch (e) {} });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const s = window.BEA.store.getState(), app = document.getElementById('app');
    const dock = document.querySelector('.tr-dock, .bar__dock, .tr-bar');
    return { race: JSON.parse(sessionStorage.getItem('w9race') || '[]'),
             hash: location.hash, tour: s.activeTour, step: s.tourStep,
             path: app.getAttribute('data-path'),
             counter: dock ? (dock.textContent.match(/(\d+)\s*\/\s*(\d+)/) || [null])[0] : null,
             heading: (document.querySelector('.tr-panel__title, .tr-panel h2, .cx-sheet__title, .app__lede') || {}).textContent || null };
  });
  const fired = r.race[0] || null;
  const ok = /tour=period/.test(r.hash) && /step=4(&|$)/.test(r.hash)
    && r.tour === 'period' && r.step === 3 && r.path === 'on' && r.counter === '4 / 9';
  log('delay=' + D + 'ms  fired-at=' + (fired ? fired.t + 'ms status=' + fired.status + ' boot=' + fired.boot : 'NEVER')
    + '  -> ' + (ok ? 'PASS' : 'FAIL')
    + '  hash=' + r.hash + '  store=' + r.tour + '@' + r.step + '  path=' + r.path + '  counter=' + r.counter);
};
