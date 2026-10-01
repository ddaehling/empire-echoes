/**
 * shell-boot-race.js — THE ADDRESS BAR MAY NOT LIE ABOUT THE LESSON.
 *
 * GUARANTEE THIS FILE PROTECTS: whatever address the reader gives this app,
 * and whenever they give it, the address bar, the store and the mounted route
 * agree when the app settles.
 *
 * WHY IT EXISTS. `core/url.js` reads the address at boot step 2 and the app is
 * not `ready` until step 5, and everything in between dispatches — and every
 * dispatch runs through a 150ms trailing throttle that WRITES THE ADDRESS
 * BACK. A lesson address arriving in that window (a teacher pasting a link
 * into the tab that is still opening, a hashchange from an in-page link, a
 * restored session) could be overwritten by a write serialised from the state
 * of one tick ago, and the queued `hashchange` would then find the address it
 * was supposed to deliver already replaced by the app's own. The reader's
 * lesson was gone and nothing was logged. It happened at some firing times and
 * not others, which is what a race is — so this file does not test one timing,
 * it tests fourteen, three of them arriving after the app has settled.
 *
 *   node tools/inspect.js tools/scenarios/shell-boot-race.js --out /tmp/race
 *   node tools/inspect.js tools/scenarios/shell-boot-race.js --out /tmp/race --mobile
 *
 * Prints PASS/FAIL per case and `>>> the address never lied` / `>>> THE URL
 * AND THE MOUNTED ROUTE DISAGREE`, and exits non-zero on any failure.
 */
'use strict';

const READY = () => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready';

module.exports = async ({ page, log, url }) => {
  /* Two real routes, read from the payload the app publishes — never named
     here, so renaming a route does not silently turn this file green. */
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(READY, null, { timeout: 30000 });
  await page.waitForFunction(() => window.BEA.toursRoutes && window.BEA.toursIndex, null, { timeout: 30000 });
  const routes = await page.evaluate(() => {
    const ids = window.BEA.toursRoutes.routes.map(r => r.id)
      .filter(id => (window.BEA.toursIndex.routes[id] || {}).steps?.length >= 4);
    return { from: ids[0], to: ids[1] || ids[0] };
  });
  if (!routes.to || routes.from === routes.to) { log('only one route long enough to test — nothing to race'); return; }
  log('racing  ' + routes.from + ' -> ' + routes.to);

  const settle = async () => {
    await page.waitForFunction(READY, null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    return page.evaluate(() => {
      const s = window.BEA.store.getState();
      return { hash: location.hash, tour: s.activeTour, step: s.tourStep + 1 };
    });
  };

  let fails = 0;
  const check = (label, r, wantTour, wantStep) => {
    const ok = r.tour === wantTour && r.step === wantStep
      && r.hash.includes('tour=' + wantTour) && r.hash.includes('step=' + wantStep);
    if (!ok) fails++;
    log((ok ? 'PASS' : 'FAIL') + '  ' + label.padEnd(30)
      + ' store=' + r.tour + '@' + r.step + '  want=' + wantTour + '@' + wantStep
      + '\n            hash=' + r.hash);
  };

  /* 1. ONE ADDRESS ARRIVING AT ELEVEN DIFFERENT MOMENTS OF BOOT. */
  for (const d of [0, 30, 60, 100, 150, 200, 300, 450, 600, 900, 1300]) {
    await page.goto(url + '#tour=' + routes.from + '&step=3', { waitUntil: 'commit' });
    await page.evaluate(([ms, h]) => new Promise(r => setTimeout(() => { location.hash = h; r(); }, ms)),
      [d, '#tour=' + routes.to + '&step=4']);
    check('set at boot+' + d + 'ms', await settle(), routes.to, 4);
  }

  /* 2. TWO ADDRESSES INSIDE THE SAME BOOT — the last one is the reader's. */
  await page.goto(url + '#tour=' + routes.from + '&step=3', { waitUntil: 'commit' });
  await page.evaluate(([a, b]) => new Promise(r => {
    setTimeout(() => { location.hash = a; }, 60);
    setTimeout(() => { location.hash = b; r(); }, 260);
  }), ['#tour=' + routes.from + '&step=6', '#tour=' + routes.to + '&step=2']);
  check('two addresses in one boot', await settle(), routes.to, 2);

  /* 3. AND AFTER READY, WHICH IS THE ORDINARY PASTE. */
  await page.goto(url + '#tour=' + routes.from + '&step=3', { waitUntil: 'load' });
  await page.waitForFunction(READY, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(h => { location.hash = h; }, '#tour=' + routes.to + '&step=5');
  check('pasted after ready', await settle(), routes.to, 5);

  /* 4. A PASTE THAT LANDS INSIDE THE WRITER'S OWN 150ms WINDOW: scrub the year
     (which schedules a write), then paste 40ms later, before it fires. */
  await page.goto(url + '#tour=' + routes.from + '&step=3', { waitUntil: 'load' });
  await page.waitForFunction(READY, null, { timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(h => new Promise(r => {
    window.BEA.store.act.setYear(1857);
    setTimeout(() => { location.hash = h; r(); }, 40);
  }), '#tour=' + routes.to + '&step=7');
  check('pasted inside the write window', await settle(), routes.to, 7);

  /* 5. THE SAME STATE IS THE SAME ADDRESS. `filters` is a free-form object and
     its keys used to be serialised in whatever order the modules happened to
     dispatch them, so one reader's link read `filter=stage:working,pressure:off`
     and the next reader's — same app, same state — read
     `filter=pressure:off,stage:working`. Two strings for one state defeats
     `write()`'s own `next === lastWritten` short-circuit, and it means two
     identical links do not look identical to the teacher comparing them.
     Set the same three filters in both orders and the address must not move. */
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(READY, null, { timeout: 30000 });
  await page.waitForTimeout(900);
  const orders = [];
  for (const keys of [['zeta', 'alpha', 'mu'], ['mu', 'zeta', 'alpha']]) {
    await page.evaluate(ks => {
      window.BEA.store.act.clearFilters();
      for (const k of ks) window.BEA.store.dispatch('setFilter', { [k]: 'x' });
    }, keys);
    await page.waitForTimeout(500);
    orders.push((await page.evaluate(() => location.hash)).match(/filter=[^&]*/)?.[0] || '(no filter)');
  }
  const same = orders[0] === orders[1] && orders[0] !== '(no filter)';
  if (!same) fails++;
  log((same ? 'PASS' : 'FAIL') + '  ' + 'address is deterministic'.padEnd(30)
    + '\n            ' + orders.join('\n            '));

  log(fails ? '>>> THE URL AND THE MOUNTED ROUTE DISAGREE (' + fails + ' failing)'
            : '>>> the address never lied');
  if (fails) throw new Error('boot race: ' + fails + ' failing case(s)');
};
