/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: not run.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* load AT one lesson, switch to another while the app is still booting */
module.exports = async ({ page, log, ctx, url }) => {
  page.on('framenavigated', f => { if (f === page.mainFrame()) log('NAV ' + f.url()); });
  const D = +(process.env.W9_DELAY || 300);
  const TO = process.env.W9_TO || '#tour=period&step=4';
  await ctx.addInitScript(({ to, d }) => {
    const push = (o) => { console.error('W9RACE ' + JSON.stringify(o)); try { const a = JSON.parse(localStorage.getItem('w9race') || '[]'); a.push(o); localStorage.setItem('w9race', JSON.stringify(a)); } catch (e) {} };
    push({ ev: 'init', t: Math.round(performance.now()), href: location.href, rs: document.readyState });
    /* rAF and not setTimeout: a timer scheduled from an init script is dropped
       outright in this browser at some delays (measured: nothing fired at 600,
       900 or 1000 ms while 650, 700, 750 and 800 all did), and a harness that
       silently does not fire is a harness that reports PASS for the wrong
       reason. rAF is main-thread-synchronised and fires as soon as the app
       yields, which is also closer to what a real click or paste does. */
    const at = () => {
      if (performance.now() >= d) {
        push({ ev: 'set', t: Math.round(performance.now()), from: location.hash,
               boot: document.documentElement.dataset.boot,
               status: (window.BEA && window.BEA.store) ? window.BEA.store.getState().status : 'booting' });
        location.hash = to;
        return;
      }
      requestAnimationFrame(at);
    };
    requestAnimationFrame(at);
  }, { to: TO, d: D });
  await page.goto('about:blank');
  await page.goto(url + '#tour=core&step=9', { waitUntil: 'load', timeout: 45000 });
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const s = window.BEA.store.getState(), app = document.getElementById('app');
    const dock = document.querySelector('.tr-dock, .bar__dock, .tr-bar');
    return { race: JSON.parse(localStorage.getItem('w9race') || '[]'), hash: location.hash,
             tour: s.activeTour, step: s.tourStep, path: app.getAttribute('data-path'),
             counter: dock ? (dock.textContent.match(/(\d+)\s*\/\s*(\d+)/) || [null])[0] : null };
  });
  const want = TO.match(/tour=([^&]+)/)[1], wantStep = +TO.match(/step=(\d+)/)[1];
  /* THE MOUNTED ROUTE IS THE POINT. The address and the store can agree with
     each other and both be lying: measured with the boot gate off, at
     boot+600ms, the address read `#year=1909&tour=period&step=4`, the store
     read `period@3`, and the transport in the masthead read `9 / 17` — the
     step count of the route that was ALREADY mounted (core, 17 steps), on the
     year that route's step 9 flies to. So the counter is asserted, not the
     store, because the counter is what a student can see. */
  const wantCount = (process.env.W9_COUNT || '4 / 9');
  const ok = new RegExp('tour=' + want).test(r.hash) && r.tour === want
    && r.step === wantStep - 1 && r.path === 'on' && r.counter === wantCount;
  log('delay=' + D + ' to=' + TO + ' fired=' + JSON.stringify(r.race) + ' -> ' + (ok ? 'PASS' : 'FAIL')
      + ' hash=' + r.hash + ' store=' + r.tour + '@' + r.step + ' counter=' + r.counter);
};
