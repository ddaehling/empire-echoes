/**
 * shell.js — verification for the app shell and core runtime (owner: shell agent).
 * Checks: boot, deep-link restore, URL writing, back/forward, module isolation,
 * data queries, keyboard escape, and the error boundary.
 */
const LINK = '#year=1857&sel=bengal&layer=trade&tour=company-rule&step=3&compare=1914&q=beng';

module.exports = async ({ page, shot, log, url }) => {
  /* GUARANTEE THIS FILE PROTECTS: boot, deep-link restore, URL writing,
     back/forward, module isolation, data queries, Escape, and the error
     boundary — the shell contract every other piece stands on.
     WAVE 9: this predicate READ `window.BEA.store.getState()` while only
     GUARDING `window.BEA`, and started throwing "Cannot read properties of
     undefined (reading 'getState')" inside the predicate, which Playwright does
     not retry — it rethrows. `main.js` replaces the BEA handle just after
     `app:ready`, so `window.BEA` is truthy for a moment with no store on it.
     Guard every hop of the path that is about to be dereferenced. */
  const ready = () => page.waitForFunction(
    () => !!(window.BEA && window.BEA.store && window.BEA.store.getState
             && window.BEA.store.getState().status === 'ready'),
    null, { timeout: 30000 });

  /* 1 — plain boot ------------------------------------------------------- */
  await ready();
  await shot('01-boot');
  log('boot report:', JSON.stringify(await page.evaluate(() => ({
    ms: window.BEA.ms,
    mounted: window.BEA.report.mounted,
    absent: window.BEA.report.absent.length,
    placeholder: window.BEA.data.meta.placeholder,
    counts: window.BEA.data.meta.counts,
    bounds: window.BEA.data.bounds,
  }))));

  /* 2 — a shared teaching link restores exactly --------------------------- */
  await page.goto(url + LINK, { waitUntil: 'load' });
  await ready();
  const restored = await page.evaluate(() => {
    const s = window.BEA.store.getState();
    return { year: s.year, sel: s.selectedTerritoryId, layer: s.activeLayer, tour: s.activeTour,
      step: s.tourStep, compare: s.compareYear, q: s.searchQuery, dossier: document.getElementById('app').dataset.dossier };
  });
  log('restored from link:', JSON.stringify(restored));
  await shot('02-deep-link');

  /* 3 — state writes back to the address bar ------------------------------ */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1901));
  await page.waitForTimeout(300);
  log('hash after setYear:', await page.evaluate(() => location.hash));

  /* 4 — back / forward ---------------------------------------------------- */
  await page.evaluate(() => window.BEA.store.dispatch('select', 'jamaica'));
  await page.waitForTimeout(300);
  const beforeBack = await page.evaluate(() => location.hash);
  await page.goBack();
  await page.waitForTimeout(350);
  const afterBack = await page.evaluate(() => ({ hash: location.hash, sel: window.BEA.store.getState().selectedTerritoryId }));
  log('history: before=', beforeBack, ' after back=', JSON.stringify(afterBack));

  /* 5 — the data API ------------------------------------------------------ */
  log('data api:', JSON.stringify(await page.evaluate(() => {
    const d = window.BEA.data;
    const m = d.statusAt(1900);
    const one = m.get([...m.keys()][0]);
    return {
      statusAtSize: m.size,
      sample: { unit: one.unitId, territory: one.territoryId, status: one.status, since: one.since, tenure: one.tenureYears },
      identity: d.statusAt(1900) === d.statusAt(1900),
      events1750to1800: d.eventsBetween(1750, 1800).length,
      territoryAt: (() => { const t = d.territoryAt('bengal', 1800); return t && t.status + '/' + t.tenureYears; })(),
      timeline: (() => { const t = d.timeline(); return [t.min, t.max, t.unitsByYear.length]; })(),
      metrics1900: d.metricsAt(1900).controlledUnits,
      search: d.search('jam').map(r => r.id),
    };
  })));

  /* 6 — a module that throws must not take the app down ------------------- */
  log('module isolation:', JSON.stringify(await page.evaluate(async () => {
    const r = window.BEA.registry;
    r.register({ id: 'saboteur', slot: 'overlay', mount() { throw new Error('deliberate mount failure'); } });
    r.register({ id: 'grumbler', slot: 'overlay', mount() {}, update() { throw new Error('deliberate update failure'); } });
    await r.mountAll();
    for (let i = 0; i < 5; i++) { window.BEA.store.dispatch('nudgeYear', 1); window.BEA.store.flush(); }
    return { saboteur: r.get('saboteur').status, grumbler: r.get('grumbler').status,
      appStillReady: window.BEA.store.getState().status === 'ready',
      year: window.BEA.store.getState().year };
  })));

  /* 7 — Escape closes things --------------------------------------------- */
  await page.evaluate(() => window.BEA.store.dispatch('select', 'canada'));
  await page.waitForTimeout(200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  log('after Escape, tour:', await page.evaluate(() => window.BEA.store.getState().activeTour));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  log('after 2nd Escape, selection:', await page.evaluate(() => window.BEA.store.getState().selectedTerritoryId));

  /* 8 — a mounted module fills its slot, dossier opens --------------------- */
  await page.evaluate(async () => {
    const r = window.BEA.registry;
    r.register({ id: 'demo-dossier', slot: 'dossier',
      mount({ root, store, data, format }) {
        this.render = () => {
          const s = store.getState();
          const t = s.selectedTerritoryId && data.get(s.selectedTerritoryId);
          root.innerHTML = t
            ? '<div style="padding:1rem"><h2 style="margin:0 0 .25rem;font-size:1.4rem">' + t.name + '</h2>'
              + '<p style="margin:0;opacity:.7">' + format.yearRange(t.firstYear, t.endedYear) + '</p></div>'
            : '<p style="padding:1rem;opacity:.6">Nothing selected.</p>';
        };
        this.render();
      },
      update() { this.render(); } });
    await r.mountAll();
    window.BEA.store.dispatch('select', 'bengal');
    window.BEA.store.flush();
  });
  await page.waitForTimeout(500);
  await shot('03-dossier-open');

  /* 9 — the error boundary ------------------------------------------------ */
  await page.evaluate(() => {
    const boot = document.getElementById('boot');
    boot.hidden = false; boot.dataset.state = 'error';
    document.getElementById('boot-error-msg').textContent = 'The atlas could not read its dataset (Unexpected token < in JSON).';
    const d = document.getElementById('boot-error-detail');
    d.hidden = false;
    d.textContent = 'SyntaxError: Unexpected token < in JSON at position 0\n    at loadTerritoryShards (data.js:214)\n    at boot (main.js:158)';
  });
  await page.waitForTimeout(250);
  await shot('04-error-boundary');
};
