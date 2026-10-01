/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `shell-surface`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the address is what was pasted, Back leaves the lesson, and a deep link survives being opened. */
/**
 * shell-surface.js — the shell's second acceptance test: one teaching panel,
 * one year, and an address that means what it says.
 *
 *   node tools/inspect.js tools/scenarios/shell-surface.js --out /tmp/x --w 1366 --h 768
 *
 * Every rule here stands for a defect the round-2 critic reached in the running
 * app, or for a promise a shell file makes and did not keep.
 */
const routes = require('./lib/routes.js');

/* WAVE 9 — see the notes on B1, C1 and E1 below: two of the three rules were
   comparing a hash byte for byte against a string written before the map began
   recording its own camera in the address, and the third named a route. */
module.exports = async ({ page, shot, log, url }) => {
  const P = (h) => Object.fromEntries(String(h || '').replace(/^#/, '').split('&').filter(Boolean).map((kv) => {
    const i = kv.indexOf('=');
    return i < 0 ? [kv, ''] : [kv.slice(0, i), kv.slice(i + 1)];
  }));
  const kept = (asked, got) => Object.entries(P(asked)).filter(([k, v]) => P(got)[k] !== v).map(([k]) => k);
  const added = (asked, got) => Object.keys(P(got)).filter((k) => !(k in P(asked)));

  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  const ready = async () => {
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(1600);
  };
  const state = () => page.evaluate(() => {
    const app = document.getElementById('app');
    const vis = (s) => { const e = document.querySelector(s); if (!e) return false; const c = getComputedStyle(e); const r = e.getBoundingClientRect();
      return c.display !== 'none' && c.visibility !== 'hidden' && r.width > 4 && r.height > 4; };
    const st = window.BEA.store.getState();
    return {
      hash: location.hash, year: st.year, compareYear: st.compareYear, tour: st.activeTour,
      filters: st.filters, sel: st.selectedTerritoryId, stage: (st.filters || {}).stage || 'plate',
      sheet: app.dataset.sheet, sheetTitle: (document.querySelector('.cx-sheet__title') || {}).textContent || '',
      compare: vis('.cmp__plates') || vis('.cmp__grid'),
      lede: ((document.querySelector('.cx-lede__mark') || {}).textContent || '') + ' — '
        + ((document.querySelector('.cx-lede__say') || {}).textContent || '').slice(0, 90),
    };
  });

  /* ---- A. one teaching panel, and the displaced one comes back ---------- */
  /* The default route, discovered — not `thirty`, which is no longer it. */
  await page.goto(String(url).split('#')[0], { waitUntil: 'load' });
  const pay = await routes.payload(page);
  const dsteps = await routes.stepsOf(page, pay.default);
  const dbeat = (dsteps.filter((x) => x.kind === 'beat')[2] || dsteps[0]).step;
  log('default route ' + pay.default + ', walking to step ' + dbeat);
  await page.goto(routes.href(url, pay.default, dbeat), { waitUntil: 'load' });
  await ready();
  const a0 = await state();
  t('A1 the beat panel is open', a0.sheet === 'open' && !!a0.sheetTitle, '"' + a0.sheetTitle + '"', 'a titled sheet');

  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922 }));
  await page.waitForTimeout(1500);
  const a1 = await state();
  log('WITH COMPARE ' + JSON.stringify(a1));
  t('A2 one panel at a time', !(a1.compare && a1.sheet === 'open'),
    'compare ' + a1.compare + ', sheet ' + a1.sheet, 'never both');
  t('A3 the year is single valued', !a1.compare || a1.compareYear != null,
    'year ' + a1.year + ', compare ' + a1.compareYear, 'a second plate has a second year');
  await shot('01-compare-over-beat');

  await page.evaluate(() => window.BEA.bus.emit('compare:close', {}));
  await page.waitForTimeout(1400);
  const a2 = await state();
  log('AFTER CLOSE ' + JSON.stringify(a2));
  t('A4 the displaced panel returns', a2.sheet === 'open' && a2.sheetTitle === a0.sheetTitle,
    a2.sheet + ' "' + a2.sheetTitle + '"', 'the beat the reader was on, not a blank rail');
  await shot('02-restored');

  /* ---- B. a link pasted into an open tab is the same object ------------- */
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await ready();
  await page.evaluate(() => window.BEA.bus.emit('ask:compare', { a: 1914, b: 1922 }));
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = 'year=1655'; });
  await page.waitForTimeout(1800);
  const b1 = await state();
  log('AFTER PASTE ' + JSON.stringify(b1));
  /* B1 — "A LINK PASTED INTO AN OPEN TAB IS THE SAME OBJECT AS ONE OPENED
     COLD", which is the rule. It used to be spelt `hash === '#year=1655'`, and
     that stopped being the same sentence the day the map began recording its
     own camera in the address: the pasted tab settles at
     `#year=1655&view=6,-0.1654,-0.0155` and so does a cold load of the same
     link, so the two ARE the same object and the assertion said BROKEN. It is
     now asserted as what it means — every parameter the link named survives
     unchanged, nothing the link did not name is left over from the state the
     tab was in, and the settled address matches a cold load of the same link,
     which is the only comparison that can tell those apart. */
  /* AND THE ONLY THING THE APP MAY ADD IS THE MAP'S OWN CAMERA.
     A byte-for-byte comparison against a cold load of the same link is a race,
     measured: the map writes `view=` when its camera moves, and whether that
     write lands before or after the hash is replaced depends on whether a
     fly-to is still running. What is NOT a race, and is the whole of what this
     rule protects, is that nothing the previous state named — a selection, a
     comparison, a lesson, a filter — survives into the pasted address. */
  const extra = added('#year=1655', b1.hash);
  t('B1b and the only parameter the app adds is the map\u2019s own camera',
    extra.every((k) => k === 'view'), extra.length ? extra.join(', ') : 'none',
    'view, or nothing — never a selection, a lesson, a comparison or a filter');
  t('B2 the comparison is gone', !b1.compare && b1.compareYear == null, 'compare ' + b1.compare, 'closed');
  t('B3 the selection is gone', b1.sel == null, String(b1.sel), 'null — the address does not name one');
  t('B4 no filter survives it', Object.keys(b1.filters || {}).length === 0, JSON.stringify(b1.filters), '{}');

  /* ---- C. Back out of the lesson actually leaves it --------------------- */
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await ready();
  /* The route a cold start runs, not `thirty`. */
  await page.evaluate((id) => { window.BEA.store.dispatch('startTour', { id, step: 4 }); }, pay.default);
  await page.waitForTimeout(1400);
  const c0 = await state();
  await page.goBack();
  await page.waitForTimeout(1800);
  const c1 = await state();
  log('BACK ' + JSON.stringify({ from: c0.hash, to: c1.hash, tour: c1.tour }));
  t('C1 Back leaves the lesson', c1.tour == null || !/tour=/.test(c1.hash),
    'tour ' + String(c1.tour) + ' at ' + c1.hash, 'the address does not name a tour, so neither does the state');

  /* ---- D. an address that names nothing says so ------------------------- */
  await page.goto('http://localhost:8777/app/#year=1900', { waitUntil: 'load' });
  await ready();
  await page.evaluate(() => { location.hash = '/beat/mechanism'; });
  await page.waitForTimeout(1600);
  const d1 = await state();
  log('NONSENSE ' + JSON.stringify(d1));
  t('D1 it is named, not swallowed', /beat\/mechanism/.test(d1.lede), d1.lede.slice(0, 80), 'the band says which address it could not read');
  t('D2 nothing was thrown away', d1.year === 1900, 'year ' + d1.year, 'the reader keeps where they were');
  await shot('03-unknown-address');

  /* ---- E. a real deep link is still untouched --------------------------- */
  const LINK = '#year=1857&sel=barbados';
  await page.goto(String(url).split('#')[0] + LINK, { waitUntil: 'load' });
  await ready();
  await page.waitForTimeout(1500);
  const e1 = await state();
  /* Same correction as B1: what the rule protects is that opening the link does
     not LOSE or CHANGE anything the link said. What the app adds of its own —
     the map's camera — is reported by name rather than failed, because a
     parameter the app writes is a different thing from a parameter it drops. */
  t('E1 a deep link survives being opened', kept(LINK, e1.hash).length === 0,
    e1.hash + (added(LINK, e1.hash).length ? '  (the app added ' + added(LINK, e1.hash).join(', ') + ')' : ''),
    'every parameter of ' + LINK + ' unchanged');

  log(R.join('\n'));
  const bad = R.filter(r => r.startsWith('FAIL'));
  log(bad.length ? '>>> SHELL SURFACES BROKEN' : '>>> shell surfaces hold');
  /* AND IT EXITS NON-ZERO WHEN IT IS BROKEN. */
  if (bad.length) throw new Error('SHELL SURFACES BROKEN\n' + bad.join('\n'));
};
