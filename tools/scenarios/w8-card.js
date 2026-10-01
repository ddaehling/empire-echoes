/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w8-card`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the route card prints what the model computed
 * and never a retyped figure — and it does not become the whole first screen of
 * the lesson again.
 *
 * ROUND 2 OF WAVE 9 REWROTE THIS FILE. It opened `#tour=` + `process.env.ROUTE
 * || 'period'` — a retired route, reached through an environment variable no
 * runner sets — logged three JSON blobs and returned. Nothing was asserted, so
 * the guarantee above was carried by a comment. Every route is now walked to
 * its first beat, and every minute figure the card prints is checked against
 * the set `tours/budget.js` computes for THAT route, which is the same rule
 * `tools/check-timing.js` applies to the app's source: a number on a surface is
 * either one the model produced or it is a defect.
 */
const routes = require('./lib/routes.js');

const FIGURE = /(\d{1,3})(?:\s*(?:[-–—]|\s+to\s+)\s*(\d{1,3}))?[\s-]?\s*minutes?\b/gi;

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);
  await page.goto(url, { waitUntil: 'load' });
  const pay = await routes.payload(page);

  for (const r of pay.routes.filter((x) => !x.retired)) {
    await routes.open(page, url, r.id, 1, 2000);
    const closed = await page.evaluate(() => {
      const b = document.querySelector('.tr-routes');
      const sc = document.querySelector('.app__sheet .cx-sheet__body')
        || document.querySelector('.sheet__body') || document.querySelector('.tr-panel__scroll');
      const q = b ? b.getBoundingClientRect() : null;
      return {
        card: q ? Math.round(q.height) : null,
        window: sc ? Math.round(sc.clientHeight) : null,
        all: sc ? Math.round(sc.scrollHeight) : null,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        wide: [...document.querySelectorAll('.tr-routes *')].filter((e) => e.scrollWidth > e.clientWidth + 2).length,
      };
    });
    log(r.id + ' closed: ' + JSON.stringify(closed));
    C.t(r.id + ' K0 the card is on the first beat', closed.card != null, String(closed.card), 'a .tr-routes');
    if (closed.card == null) continue;

    /* LAYOUT_BUDGET, and the phone critic's standing measurement: the card
       introduces the route, it is not the route. Half the reading window is
       the line. */
    if (closed.window) {
      C.t(r.id + ' K1 the closed card leaves the reading window room',
        closed.card <= closed.window * 0.5,
        closed.card + 'px of a ' + closed.window + 'px window', '<= half');
    }
    C.t(r.id + ' K2 nothing pushes the page sideways', !closed.overflowX, closed.overflowX, 'no doc scroll');
    C.t(r.id + ' K3 nothing inside the card is clipped', closed.wide === 0, closed.wide + ' clipped', '0');

    await page.evaluate(() => { const b = document.querySelector('.tr-routes__open'); if (b) b.click(); });
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => ({
      text: (document.querySelector('.tr-routes') || {}).innerText || '',
      rows: [...document.querySelectorAll('.tr-routes__lab')].map((x) => x.innerText.replace(/\s+/g, ' ')),
    }));
    for (const row of open.rows) log('  row: ' + row);
    if (r.id === pay.default) await shot('card-open');

    /* EVERY MINUTE FIGURE ON THE CARD IS ONE SOME ROUTE COMPUTES. The card
       shows this route and the others it offers, so the legal set is every
       published route's figures plus the period the room is planned in. */
    const legal = new Set();
    for (const x of pay.routes) {
      for (const n of [x.minutes, x.minutesLow, x.minutesMax, x.minutesExact, x.minutesExactMax,
        x.periodMinutes]) if (Number.isFinite(n)) legal.add(n);
    }
    const printed = [];
    let m;
    FIGURE.lastIndex = 0;
    while ((m = FIGURE.exec(open.text))) { printed.push(Number(m[1])); if (m[2]) printed.push(Number(m[2])); }
    const stray = printed.filter((n) => !legal.has(n));
    C.t(r.id + ' K4 every minute figure on the card is one the model computed',
      stray.length === 0,
      stray.length ? stray.join(', ') + ' — legal set ' + [...legal].sort((a, b) => a - b).join(',')
        : printed.length + ' figures, all computed',
      'DO NOT TYPE A MINUTE FIGURE INTO THIS APPLICATION (budget.js, THE RULE)');
  }
  C.finish('the route card — computed figures, and room left to read');
};
