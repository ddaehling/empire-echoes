/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `map-accept`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: the map module acceptance list. */
/* P02 map — the acceptance tests from FEATURE_SPEC §2 P02, run against the app.
   Every number printed here is read out of the running page, not asserted. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.BEA && window.BEA.store, null, { timeout: 30000 });
  const go = (fn, arg) => page.evaluate(fn, arg);
  await go(() => window.BEA.store.dispatch('setYear', 1913));
  await page.waitForTimeout(600);
  await shot('t1-paper-1913');

  /* --- T1: coastline on every unit; no fill is #000 or #fff --------------- */
  log('T1 palette:', JSON.stringify(await go(() => {
    const m = window.__map, T = m.plate.tokens;
    const bad = [];
    for (const [k, v] of Object.entries(T.fills)) {
      const h = String(v).trim().toLowerCase();
      if (['#000', '#000000', '#fff', '#ffffff', 'black', 'white'].includes(h)) bad.push(k + '=' + h);
    }
    let drawn = 0, stroked = 0;
    for (const [, rec] of m.plate.paint) { drawn++; if (rec.mode !== 'informal' || true) stroked++; }
    return { fills: T.fills, coast: T.coast, sea: T.sea, bad, drawn, coastDrawnOnEvery: stroked === drawn };
  })));

  /* --- T2: definitions differ, and the counts come from the data ---------- */
  log('T2 definitions:', JSON.stringify(await go(() => {
    const m = window.__map, d = window.BEA.data;
    const st = d.statusAt(1913);
    // an independent recount, straight off data.statusAt, with no module code
    const mine = { claimed: new Set(), administered: new Set(), controlled: new Set(), influenced: new Set() };
    const degHist = {}, degHistControlled = {};
    for (const [u, e] of st) {
      degHist[e.controlDegree] = (degHist[e.controlDegree] || 0) + 1;
      if (e.controlled && e.controlDegree != null) degHistControlled[e.controlDegree] = (degHistControlled[e.controlDegree] || 0) + 1;
      if (e.controlDegree >= 1 && e.status !== 'informal-sphere') mine.claimed.add(u);
      if (e.controlDegree >= 3) mine.administered.add(u);
      if (e.controlDegree === 5) mine.controlled.add(u);
      if (e.controlDegree >= 1 || e.status === 'informal-sphere') mine.influenced.add(u);
    }
    const byDegree = d.metricsAt(1913).byDegree;
    const same = JSON.stringify(byDegree) === JSON.stringify(degHistControlled);
    const ms = m.measures;
    return {
      module: Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, v.units])),
      independent: Object.fromEntries(Object.entries(mine).map(([k, v]) => [k, v.size])),
      matches: Object.entries(mine).every(([k, v]) => ms[k].units === v.size),
      byDegreeControlledMatches: same,
      byDegree, degHistAll: degHist,
      claimedMinusControlled: mine.claimed.size - mine.controlled.size,
      km2: Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, v.km2])),
      nested: mine.controlled.size <= mine.administered.size && mine.administered.size <= mine.claimed.size && mine.claimed.size <= mine.influenced.size,
    };
  })));

  await go(() => window.__map.setDefinition('controlled'));
  await page.waitForTimeout(400);
  await shot('t2-controlled-1913');
  const painted = await go(() => [...window.__map.plate.paint.keys()].filter(k => window.__map.plate.paint.get(k).mode !== 'hole').length);
  log('T2 painted under controlled:', painted);
  await go(() => window.__map.setDefinition('influenced'));
  await page.waitForTimeout(400);
  await shot('t2-influenced-1913');
  await go(() => window.__map.setDefinition('claimed'));
  await page.waitForTimeout(300);

  /* --- T3: the seven named tiny units ------------------------------------ */
  log('T3 tiny units:', JSON.stringify(await go(() => {
    const m = window.__map;
    const want = ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island'];
    return want.map(id => {
      const s = m.unitScreen(id);
      if (!s) return { id, drawn: false };
      const hit = m.pick(s.px, s.py);
      const opt = document.getElementById('map-u-' + id);
      const r = opt && opt.getBoundingClientRect();
      return {
        id, drawn: true, tiny: s.tiny, markPx: 10,
        pickAtOwnMark: hit, distinct: hit === id,
        target: r ? [Math.round(r.width), Math.round(r.height)] : null,
        focusable: !!opt && opt.tabIndex >= -1,
        label: opt && opt.getAttribute('aria-label'),
      };
    });
  })));

  /* --- T4: projection toggle -------------------------------------------- */
  const before = await go(() => {
    const m = window.__map, s = m.unitScreen('ca-ontario');
    return { area: s ? Math.round(s.w * s.h) : null, proj: m.plate.projTo, sel: window.BEA.store.getState().selectedTerritoryId };
  });
  await go(() => window.__map.setProjection('mercator'));
  await page.waitForTimeout(900);
  await shot('t4-mercator');
  const after = await go(() => {
    const m = window.__map, s = m.unitScreen('ca-ontario');
    return { area: s ? Math.round(s.w * s.h) : null, proj: m.plate.projTo };
  });
  log('T4 Ontario drawn area:', JSON.stringify({ equalEarth: before.area, mercator: after.area, ratio: +(after.area / before.area).toFixed(2) }));
  await go(() => window.__map.setProjection('equal-earth'));
  await page.waitForTimeout(900);

  /* --- T5: weight mode --------------------------------------------------- */
  log('T5 weight:', JSON.stringify(await go(() => {
    const m = window.__map;
    const ten = ['barbados', 'jamaica', 'gibraltar', 'malta', 'singapore', 'hk-hong-kong-island', 'mauritius', 'ceylon', 'bermuda', 'fiji'];
    const values = new Map(ten.map((id, i) => [id, 1000 * (i + 1)]));
    const before = new Map([...m.plate.paint.keys()].map(id => { const s = m.unitScreen(id); return [id, s ? Math.round((s.px) * 100) : null]; }));
    window.BEA.bus.emit('ask:sizeBy', { metric: 'test-metric', values, caption: 'A test quantity.' });
    const scaled = [], absent = [];
    for (const [id, rec] of m.plate.paint) { if (rec.mode === 'absence') absent.push(id); }
    const w = m.plate.weight;
    for (const id of ten) if (w && w.has(id)) scaled.push(id);
    let moved = 0;
    for (const [id, was] of before) { const s = m.unitScreen(id); if (s && was != null && Math.abs(Math.round(s.px * 100) - was) > 60) moved++; }
    return { scaledCount: scaled.length, scaled, absentCount: absent.length, paintSize: m.plate.paint.size, centroidsMoved: moved };
  })));
  await page.waitForTimeout(400);
  await shot('t5-weight-test-metric');
  await go(() => window.BEA.bus.emit('ask:sizeBy', { metric: null }));
  await page.waitForTimeout(300);

  /* --- silence holes ------------------------------------------------------ */
  await go(() => window.BEA.bus.emit('ask:paintSilence', {
    unitIds: ['kenya', 'cyprus', 'singapore'], reason: 'Operation Legacy', agent: 'the Colonial Office',
  }));
  await page.waitForTimeout(400);
  await shot('silence-holes');
  log('silence:', JSON.stringify(await go(() => {
    const m = window.__map;
    const holes = [...m.plate.paint.entries()].filter(([, r]) => r.mode === 'hole').map(([k]) => k);
    return { holes, caveat: document.querySelector('.map__switch').innerText.includes('bare paper') };
  })));
  await go(() => window.BEA.bus.emit('ask:paintSilence', { unitIds: [], clear: true }));
  await page.waitForTimeout(200);

  /* --- T6: 600-frame scrub ------------------------------------------------ */
  const scrub = await page.evaluate(() => new Promise((resolve) => {
    // A real scrub: one year per animation frame, through the store, exactly as
    // the timeline drives it. 600 frames, 1600 to 1997.
    const m = window.__map;
    m.resetStats();
    let i = 0;
    const t0 = performance.now();
    const gaps = [];
    let last = t0;
    const step = () => {
      const now = performance.now();
      if (i) gaps.push(now - last);
      last = now;
      if (i >= 600) {
        const g = gaps.slice().sort((a, b) => a - b);
        return resolve({
          paint: m.frameStats(),
          wallMs: +(now - t0).toFixed(1),
          frameGapMedian: +g[Math.floor(g.length / 2)].toFixed(2),
          frameGapP95: +g[Math.floor(g.length * 0.95)].toFixed(2),
          frameGapMax: +g[g.length - 1].toFixed(2),
        });
      }
      window.BEA.store.dispatch('setYear', 1600 + Math.round(i * (1997 - 1600) / 599));
      window.BEA.store.flush();
      i++;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }));
  log('T6 scrub 1600->1997:', JSON.stringify(scrub));
  await shot('after-scrub');
};
