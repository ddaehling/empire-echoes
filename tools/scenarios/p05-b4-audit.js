/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/**
 * p05-b4-audit.js — DEAD KEYING, EVERY ROUTE, WITHOUT WALKING ONE.
 *
 * B2 was one instance of a class: a clause of the through-line, a line of the
 * Close, or a control keyed to a beat id that the RUNNING route does not carry
 * — or that does not exist at all. This asserts the whole class for every route
 * from the published data, so a future edit to `variants` that orphans a clause
 * fails here in two seconds instead of at the end of somebody's lesson.
 */
module.exports = async ({ page, log }) => {
  let bad = 0;
  const t = (ok, name, detail) => { if (!ok) bad++; log((ok ? 'PASS  ' : 'FAIL  ') + name + '  ' + detail); };

  await page.goto('http://localhost:8777/app/', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1200);

  const D = await page.evaluate(async () => {
    const j = (u) => fetch(u).then(r => r.json());
    const [tours, thesis, close] = await Promise.all([
      j('/app/js/tours/tours.json'), j('/app/js/close/thesis.json'), j('/app/js/close/close.json'),
    ]);
    return { tours, thesis, close, index: window.BEA.toursIndex ? Object.fromEntries(Object.entries(window.BEA.toursIndex.routes).map(([k, r]) => [k, Object.keys(r.beats)])) : null };
  });

  const allBeats = new Set(D.tours.beats.map(b => b.id));
  const routes = Object.keys(D.tours.variants);

  // 1. every id named anywhere exists at all
  const named = new Set();
  for (const s of D.thesis.slots) for (const b of (s.earnedBy || [s.requires])) named.add(b);
  for (const l of D.close.lines) for (const b of (l.requires || [])) named.add(b);
  for (const r of routes) for (const b of D.tours.variants[r]) named.add(b);
  const ghosts = [...named].filter(b => !allBeats.has(b));
  t(ghosts.length === 0, 'every beat id named by thesis.json, close.json and variants exists in tours.json', ghosts.length ? 'GHOSTS: ' + ghosts.join(', ') : String(named.size) + ' ids, all real');

  // 2. every slot is earnable on every route, or the route is declared partial
  const partial = D.thesis.partial || {};
  for (const r of routes) {
    const on = new Set(D.tours.variants[r]);
    const dead = D.thesis.slots.filter(s => !(s.earnedBy || [s.requires]).some(b => on.has(b))).map(s => s.n);
    const declared = !!partial[r];
    t(dead.length === 0 || declared, 'route "' + r + '": every through-line clause is earnable, or the route declares itself partial',
      dead.length ? 'blanks ' + dead.join(',') + (declared ? ' — declared partial: "' + String(partial[r]).slice(0, 60) + '…"' : ' — NOT DECLARED') : 'all 6 earnable');
  }

  // 3. the published step index resolves every beat of every route
  if (D.index) {
    for (const r of routes) {
      const listed = new Set(D.index[r] || []);
      const missing = D.tours.variants[r].filter(b => !listed.has(b));
      t(missing.length === 0, 'route "' + r + '": window.BEA.toursIndex names every beat on it', missing.length ? 'MISSING: ' + missing.join(', ') : listed.size + ' beats indexed');
    }
  } else {
    t(false, 'window.BEA.toursIndex is published', 'absent');
  }

  // 4. every Close line's `mine.claimId` beat is on at least one route
  for (const l of D.close.lines) {
    const req = l.requires || [];
    const anywhere = req.every(b => routes.some(r => D.tours.variants[r].includes(b)));
    t(anywhere, 'close line ' + l.n + ' requires beats that some route carries', req.join(', '));
  }

  log(bad === 0 ? '>>> no dead keying' : '>>> DEAD KEYING: ' + bad);
};
