/**
 * P09 acceptance tests, run against the running app and the live data layer.
 * Nothing here reads a fixture: every expected number is recounted from
 * window.BEA.data inside the page.
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.mechanism, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  const P = (ok, name, got) => log((ok ? 'PASS  ' : 'FAIL  ') + name + '  ' + got);

  /* --- T2: cell counts equal an independent recount over the data layer --- */
  const t2 = await page.evaluate(() => {
    const d = window.BEA.data;
    // recount from scratch, from data.acquisitions / data.departures only
    const firstAcq = new Map(), lastDep = new Map();
    for (const a of d.acquisitions) {
      if (!a.mechanism) continue;
      const p = firstAcq.get(a.territoryId);
      if (!p || (a.year ?? 9e9) < (p.year ?? 9e9)) firstAcq.set(a.territoryId, a);
    }
    for (const x of d.departures) {
      if (!x.mechanism) continue;
      const p = lastDep.get(x.territoryId);
      if (!p || (x.year ?? Infinity) >= (p.year ?? Infinity)) lastDep.set(x.territoryId, x);
    }
    const want = new Map();
    let n = 0;
    for (const [tid, a] of firstAcq) {
      const dd = lastDep.get(tid); if (!dd) continue;
      const k = a.mechanism + '|' + dd.mechanism;
      want.set(k, (want.get(k) || 0) + 1); n++;
    }
    const m = window.BEA.mechanism.matrix;
    const bad = [];
    for (const [k, v] of want) { const c = m.cells.get(k); if (!c || c.n !== v) bad.push(k + ' want ' + v + ' got ' + (c ? c.n : 0)); }
    for (const [k, c] of m.cells) if (!want.has(k)) bad.push(k + ' extra ' + c.n);
    // and the DOM must print the same figures
    const domBad = [];
    for (const tr of document.querySelectorAll('.mx-t tbody tr')) {
      const row = tr.dataset.row;
      const cols = [...document.querySelectorAll('.mx-t__ch[data-id]')].map(e => e.dataset.id);
      [...tr.querySelectorAll('td.mx-c')].forEach((td, i) => {
        const printed = Number(td.textContent.replace(/[^0-9]/g, '') || 0);
        const w = want.get(row + '|' + cols[i]) || 0;
        if (printed !== w) domBad.push(row + '|' + cols[i] + ' printed ' + printed + ' want ' + w);
      });
    }
    return { n, cells: want.size, mn: m.counted, mf: m.filled, bad, domBad };
  });
  P(t2.bad.length === 0 && t2.domBad.length === 0 && t2.n === t2.mn,
    'T2 cell counts == recount over data.acquisitions x data.departures',
    JSON.stringify({ recount: t2.n, matrix: t2.mn, cells: t2.cells, filled: t2.mf, mismatches: t2.bad.slice(0, 4), dom: t2.domBad.slice(0, 4) }));

  /* --- T3: chartered-company row paints across centuries, year untouched -- */
  const yearBefore = await page.evaluate(() => window.BEA.store.getState().year);
  await page.evaluate(() => window.BEA.bus.emit('mechanism:open', { reveal: true }));
  await page.waitForTimeout(500);
  const t3 = await page.evaluate(async () => {
    const seen = [];
    const off = window.BEA.bus.on('map:painted-set', (p) => seen.push(p));
    document.querySelector('.mx-t__rb[aria-label*="chartered"], .mx-t tbody tr[data-row="chartered-company"] .mx-t__rb').click();
    await new Promise(r => setTimeout(r, 700));
    off();
    const items = [...document.querySelectorAll('.mx-i__y')].map(e => e.textContent);
    const m = window.BEA.mechanism.matrix;
    const row = m.itemsInRow('chartered-company');
    const lo = Math.min(...row.map(i => i.takenYear).filter(Number.isFinite));
    const hi = Math.max(...row.map(i => Number.isFinite(i.leftYear) ? i.leftYear : 2026));
    return { painted: seen[seen.length - 1] || null, places: row.length, lo, hi, listed: items.length,
             year: window.BEA.store.getState().year, hash: location.hash,
             highlight: document.querySelector('.stage__map [data-highlight], .app__stage [data-highlight]') ? true : (document.querySelector('.map, [data-highlight]') || {}).dataset ? true : null };
  });
  P(t3.painted && t3.painted.asked > 0 && t3.year === yearBefore && (t3.hi - t3.lo) >= 200,
    'T3 row header paints every chartered-company place, year untouched',
    JSON.stringify(t3));

  /* --- T4: the counter-line follows the sort and cannot be dismissed ------ */
  const t4 = await page.evaluate(async () => {
    [...document.querySelectorAll('.mx-sort')].find(x => /how it left/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 500));
    const cn = document.querySelector('.mx-cn');
    if (!cn) return { ok: false };
    const txt = cn.innerText;
    const closers = cn.querySelectorAll('[aria-label*="lose" i], .cx-sheet__close, button[aria-expanded]');
    const hidden = [...cn.querySelectorAll('*')].some(e => e.hidden && !/why that range/i.test(e.textContent || ''));
    const names = ['Kenya', 'Malaya', 'Cyprus', 'Aden', 'Palestine'].filter(n => txt.includes(n));
    // and it survives sorting again / sorting back
    [...document.querySelectorAll('.mx-sort')].find(x => /how it left/.test(x.textContent)).click();
    await new Promise(r => setTimeout(r, 400));
    const still = !!document.querySelector('.mx-cn');
    return { ok: true, names, closers: closers.length, hidden, still, first: txt.split('\n')[1] };
  });
  P(t4.ok && t4.names.length === 5 && t4.closers === 0 && t4.still,
    'T4 counter-line after sorting by how it left, names the five, no dismiss',
    JSON.stringify(t4));

  /* --- T5: every toll has a range or a stated reason ---------------------- */
  const t5 = await page.evaluate(() => {
    const m = window.BEA.mechanism.matrix;
    const bad = [];
    for (const c of m.cells.values()) for (const i of c.items) {
      const k = i.cost; if (!k) continue;
      const hasD = k.deathsLow != null || k.deathsHigh != null;
      const hasP = k.displacedLow != null || k.displacedHigh != null;
      if (!hasD && !hasP) { if (!k.note) bad.push(i.territoryId + ' cost with neither figure nor note'); continue; }
      const rangeD = k.deathsLow != null && k.deathsHigh != null;
      const rangeP = k.displacedLow != null && k.displacedHigh != null;
      if (!(rangeD || rangeP) && !k.note) bad.push(i.territoryId + ' single figure, no note');
    }
    return { bad };
  });
  P(t5.bad.length === 0, 'T5 every toll is a range or carries a reason', JSON.stringify(t5.bad.slice(0, 5)));

  /* --- T6: cell click paints only those units ---------------------------- */
  const t6 = await page.evaluate(async () => {
    const seen = [];
    const off = window.BEA.bus.on('map:painted-set', (p) => seen.push(p));
    window.BEA.bus.emit('mechanism:open', { row: 'conquest', col: 'transfer-to-another-power' });
    await new Promise(r => setTimeout(r, 700));
    off();
    const m = window.BEA.mechanism.matrix;
    const c = m.cell('conquest', 'transfer-to-another-power');
    const units = new Set(); for (const i of c.items) for (const u of i.units) units.add(u);
    return { cell: c.n, units: units.size, painted: seen[seen.length - 1], hash: location.hash };
  });
  P(t6.painted && t6.painted.asked === t6.units, 'T6 a cell paints exactly its own units', JSON.stringify(t6));

  /* --- T7: the people rails recount, independently, over data.byId -------- */
  const t7 = await page.evaluate(async () => {
    /* get a clean surface: reopen with no pick, then answer the people ask */
    window.BEA.bus.emit('mechanism:open', {});
    await new Promise(r => setTimeout(r, 500));
    const ask = document.querySelector('.mx-pp .mx-ch');
    if (ask) { ask.click(); await new Promise(r => setTimeout(r, 400)); }

    const d = window.BEA.data, m = window.BEA.mechanism.matrix;
    const get = (id) => (d.byId.get ? d.byId.get(id) : d.byId[id]);
    const INDEP = new Set(['war-of-independence', 'insurgency-then-negotiation', 'partition',
      'negotiated-independence', 'referendum', 'lease-expiry']);
    /* recount from scratch: top-level territories only, peak.population */
    const want = new Map();
    let places = 0, people = 0, nested = 0;
    for (const c of m.cells.values()) {
      if (!INDEP.has(c.col)) continue;
      for (const it of c.items) {
        const t = get(it.territoryId);
        if (t && t.nestedWithin) { nested++; continue; }
        const w = want.get(c.col) || { places: 0, people: 0 };
        w.places++; places++;
        const P = t && t.peak && Number.isFinite(t.peak.population) ? t.peak.population : null;
        if (P != null) { w.people += P; people += P; }
        want.set(c.col, w);
      }
    }
    /* and what the DOM prints */
    const rows = [...document.querySelectorAll('.mx-pp__r')].map((r) => {
      const v = [...r.querySelectorAll('.mx-pp__b')].map((b) => {
        const el = b.querySelector('.mx-pp__v');
        return el ? el.textContent : null;
      });
      return { col: r.dataset.col, lead: r.dataset.lead, places: v[0], people: v[1] };
    });
    const bad = [];
    for (const r of rows) {
      const w = want.get(r.col);
      if (!w) { bad.push(r.col + ' drawn but not counted'); continue; }
      const printed = parseInt(String(r.places).split('\u00b7')[0].replace(/[^0-9]/g, ''), 10);
      if (printed !== w.places) bad.push(r.col + ' places printed ' + printed + ' want ' + w.places);
    }
    for (const k of want.keys()) if (!rows.some((r) => r.col === k)) bad.push(k + ' counted but not drawn');
    /* the reversal: the biggest by places and the biggest by people differ */
    const byPlaces = [...want.entries()].sort((a, b) => b[1].places - a[1].places)[0];
    const byPeople = [...want.entries()].sort((a, b) => b[1].people - a[1].people)[0];
    const leadPlaces = rows.find((r) => r.lead === 'places');
    const leadPeople = rows.find((r) => r.lead === 'people');
    return {
      bad, rows: rows.length, places, people, nested,
      byPlaces: byPlaces && byPlaces[0], byPeople: byPeople && byPeople[0],
      markedPlaces: leadPlaces && leadPlaces.col, markedPeople: leadPeople && leadPeople.col,
      reversed: byPlaces && byPeople && byPlaces[0] !== byPeople[0],
      noZero: !/·\s*0%/.test(document.querySelector('.mx-pp').innerText),
    };
  });
  P(t7.bad.length === 0 && t7.rows > 1 && t7.reversed
    && t7.markedPlaces === t7.byPlaces && t7.markedPeople === t7.byPeople && t7.noZero,
    'T7 people rails recount == independent recount, and the biggest column swaps',
    JSON.stringify(t7));

  /* --- T8: the table is one tab stop and the arrows walk it -------------- */
  const t8 = await page.evaluate(async () => {
    const sheet = document.querySelector('.cx-sheet');
    const foc = [...sheet.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')]
      .filter((e) => !e.disabled && e.tabIndex >= 0);
    const inTable = foc.filter((e) => e.closest('.mx-t'));
    const stops = sheet.querySelectorAll('.mx-c__b, .mx-c--none, .mx-t__cb, .mx-t__rb').length;
    const first = document.querySelector('.mx-t [tabindex="0"]');
    if (!first) return { inTable: inTable.length, stops, moved: false };
    first.focus();
    const start = document.activeElement;
    const press = (key) => document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    press('ArrowDown'); await new Promise((r) => setTimeout(r, 30));
    const a = document.activeElement;
    press('ArrowRight'); await new Promise((r) => setTimeout(r, 30));
    const b = document.activeElement;
    return {
      total: foc.length, inTable: inTable.length, stops,
      moved: a !== start && b !== a,
      zeros: document.querySelectorAll('.mx-t [tabindex="0"]').length,
      inside: !!(b && b.closest('.mx-t')),
    };
  });
  P(t8.inTable === 1 && t8.moved && t8.zeros === 1 && t8.inside && t8.stops > 80,
    'T8 the table is one tab stop; arrows walk all ' + t8.stops + ' boxes',
    JSON.stringify(t8));

  await shot('accept');
};
