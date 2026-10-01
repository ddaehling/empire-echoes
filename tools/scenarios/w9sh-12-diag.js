/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
const ADDR = '#tour=period&step=4';
module.exports = async ({ page, log, ctx, url }) => {
  const D = +(process.env.W9_DELAY || 600);
  page.on('framenavigated', f => { if (f === page.mainFrame()) log('NAVIGATED -> ' + f.url()); });
  await ctx.addInitScript(({ addr, d }) => {
    const push = (o) => { try { const a = JSON.parse(sessionStorage.getItem('w9race') || '[]'); a.push(o); sessionStorage.setItem('w9race', JSON.stringify(a)); } catch (e) {} };
    push({ ev: 'doc', href: location.href, t: Math.round(performance.now()) });
    addEventListener('hashchange', e => push({ ev: 'hashchange', to: location.hash, t: Math.round(performance.now()) }));
    addEventListener('popstate', e => push({ ev: 'popstate', to: location.hash, t: Math.round(performance.now()) }));
    setTimeout(() => {
      push({ ev: 'set', t: Math.round(performance.now()), href: location.href,
             boot: document.documentElement.dataset.boot,
             status: window.BEA ? window.BEA.store.getState().status : 'no-store' });
      location.hash = addr;
      push({ ev: 'after-set', href: location.href, t: Math.round(performance.now()) });
    }, d);
  }, { addr: ADDR, d: D });
  await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2800);
  const r = await page.evaluate(() => {
    const s = window.BEA.store.getState(), app = document.getElementById('app');
    return { race: JSON.parse(sessionStorage.getItem('w9race') || '[]'), hash: location.hash,
             tour: s.activeTour, step: s.tourStep, path: app.getAttribute('data-path'),
             navs: performance.getEntriesByType('navigation').length };
  });
  log('delay=' + D + ' navs=' + r.navs + ' hash=' + r.hash + ' store=' + r.tour + '@' + r.step + ' path=' + r.path);
  r.race.forEach(e => log('   ' + JSON.stringify(e)));
};
