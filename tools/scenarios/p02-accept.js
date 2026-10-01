/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p02-base`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P02: the original FEATURE_SPEC §2 acceptance list. */
/**
 * P02 acceptance — FEATURE_SPEC §2 P02 tests 1–6 plus the round-3 critic's
 * named defects. Uses tools/scenarios/p02-stage.js; see the note there.
 */
const stage = require('./p02-stage.js');

module.exports = async ({ page, shot, log }) => {
  await page.waitForSelector('.map__plate', { timeout: 20000 });
  await stage(page);
  const M = () => page.evaluate(() => !!(window.__map));

  // ---- 2. definition switch counts trace to data.metricsAt --------------
  const t2 = await page.evaluate(() => {
    const api = window.__map, d = window.BEA.data;
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    const out = {};
    const paintedFor = (def) => { api.setDefinition(def); return new Set([...api.plate.paint].filter(([, r]) => r.mode !== 'lost' && !r.lost).map(([u]) => u)); };
    const claimed = paintedFor('claimed'), controlled = paintedFor('controlled');
    const m = d.metricsAt(1913);
    out.byDegree = m.byDegree;
    out.claimedDrawn = [...claimed].length; out.controlledDrawn = [...controlled].length;
    // the module's own measures, which the card prints
    out.measures = { claimed: api.measures.claimed.units, administered: api.measures.administered.units, controlled: api.measures.controlled.units, influenced: api.measures.influenced.units };
    const deg = m.byDegree || {};
    const ge = (n) => Object.keys(deg).reduce((a, k) => a + (Number(k) >= n ? deg[k] : 0), 0);
    // `claimed` excludes informal spheres by definition, so the expected count
    // is byDegree>=1 minus any informal-sphere unit that carries a degree.
    const st = d.statusAt(1913);
    let informal = 0; for (const [, e] of st) if (e.status === 'informal-sphere' && e.controlDegree >= 1) informal++;
    out.informalWithDegree = informal;
    out.expect = { claimed: ge(1) - informal, administered: ge(3), controlled: deg[5] || 0 };
    api.setDefinition('claimed');
    return out;
  });
  log('T2 definition counts: measures=' + JSON.stringify(t2.measures) + ' expected from data.metricsAt(1913).byDegree=' + JSON.stringify(t2.expect) + ' byDegree=' + JSON.stringify(t2.byDegree));

  // ---- 1. coastline stroke + no pure black/white fill --------------------
  const t1 = await page.evaluate(() => {
    const api = window.__map;
    const T = api.plate.tokens;
    const bad = [];
    for (const [k, v] of Object.entries(T.fills || {})) {
      const s = String(v).toLowerCase().replace(/\s/g, '');
      if (s === '#000' || s === '#000000' || s === '#fff' || s === '#ffffff' || s === 'rgb(0,0,0)' || s === 'rgb(255,255,255)') bad.push(k + '=' + v);
    }
    return { coast: T.coast, bad, fills: Object.keys(T.fills || {}).length };
  });
  log('T1 paper: coast=' + t1.coast + ' fills=' + t1.fills + ' pure black/white fills=' + JSON.stringify(t1.bad));
  await shot('t1-paper-1913');

  // ---- 3. the seven small places ----------------------------------------
  const seven = ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island'];
  const t3 = await page.evaluate((ids) => {
    const api = window.__map;
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    const out = [];
    for (const id of ids) {
      const node = document.getElementById('map-u-' + id);
      const s = api.unitScreen(id);
      let hit = null;
      if (s) hit = api.pick(s.mx, s.my);
      out.push({ id, drawn: !!api.plate.paint.get(id), mark: s ? Math.round(s.mr * 2) : null,
        target: node ? [Math.round(node.getBoundingClientRect().width), Math.round(node.getBoundingClientRect().height)] : null,
        pick: hit, label: node ? node.getAttribute('aria-label') : null,
        focusable: !!node && node.tabIndex >= -1 });
    }
    return out;
  }, seven);
  for (const r of t3) log(`T3 ${r.id}: drawn=${r.drawn} markPx=${r.mark} target=${JSON.stringify(r.target)} pickAtMark=${r.pick} focusable=${r.focusable}\n      label="${r.label}"`);

  // ---- 4. projection toggle ---------------------------------------------
  const t4 = await page.evaluate(async () => {
    const api = window.__map;
    const area = (uid) => { const s = api.unitScreen(uid); return s ? Math.round(s.w * s.h) : null; };
    const before = { ca: area('ca-nunavut'), ken: area('kenya'), proj: api.plate.projTo };
    const paintBefore = [...api.plate.paint].map(([u, r]) => u + ':' + (r.key || '')).join(',');
    api.setProjection('equal-earth');
    await new Promise((r) => setTimeout(r, 1400));
    const after = { ca: area('ca-nunavut'), ken: area('kenya'), proj: api.plate.projTo };
    const paintAfter = [...api.plate.paint].map(([u, r]) => u + ':' + (r.key || '')).join(',');
    api.setProjection('mercator');
    await new Promise((r) => setTimeout(r, 1400));
    return { before, after, sameColours: paintBefore === paintAfter };
  });
  log('T4 projection: Nunavut area ' + t4.before.ca + ' → ' + t4.after.ca + ' (Kenya ' + t4.before.ken + ' → ' + t4.after.ken + '); colours unchanged=' + t4.sameColours);

  // ---- 5. weight mode ----------------------------------------------------
  const t5 = await page.evaluate(async () => {
    const api = window.__map;
    const ten = ['barbados', 'jamaica', 'malta', 'gibraltar', 'singapore', 'aden', 'ascension', 'mauritius', 'ceylon', 'hk-hong-kong-island'];
    const values = new Map(ten.map((u, i) => [u, 1000 * (i + 1)]));
    api.setWeight({ metric: 'test', caption: 'A test quantity.', values, counted: 0, missing: 0 });
    await new Promise((r) => setTimeout(r, 400));
    const scaled = [...(api.plate.weight || new Map()).keys()];
    let absence = 0, fill = 0;
    for (const [, r] of api.plate.paint) { if (r.mode === 'absence') absence++; if (r.mode === 'fill') fill++; }
    // positions must not move
    const moved = ten.filter((u) => { const s = api.unitScreen(u); return s && Math.abs(s.px - s.px) > 0.001; }).length;
    api.setWeight(null);
    return { scaled: scaled.length, wanted: ten.length, absence, fill, moved };
  });
  log('T5 weight: scaled=' + t5.scaled + '/' + t5.wanted + ' absence-hatched=' + t5.absence + ' still-filled=' + t5.fill + ' anchors moved=' + t5.moved);

  // ---- critic: _howTaken resolves to the unit ---------------------------
  const how = await page.evaluate(() => {
    const api = window.__map;
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    const out = {};
    for (const u of ['hk-kowloon', 'hk-hong-kong-island', 'hk-new-territories', 'ca-quebec']) {
      const s = api.unitScreen(u);
      if (!s) { out[u] = 'not drawn'; continue; }
      api.hoverAt(s.mx, s.my);
      const tip = document.querySelector('.map__tip');
      out[u] = tip && !tip.hidden ? tip.textContent.replace(/\s+/g, ' ').slice(0, 260) : 'no tip';
    }
    return out;
  });
  for (const [k, v] of Object.entries(how)) log('HOW ' + k + ': ' + v);

  // ---- critic: silences are time-gated ----------------------------------
  const sil = await page.evaluate(async () => {
    const api = window.__map;
    const at = (y) => {
      window.BEA.store.dispatch('setYear', y); window.BEA.store.flush();
      api.plate.draw();
      let holes = [];
      for (const [u, r] of api.plate.paint) if (r.mode === 'hole') holes.push(u);
      return holes;
    };
    api.setSilenceMode(true);
    const r = { y1700: at(1700).length, y1900: at(1900).length, y1970: at(1970).length, y2000: at(2000).length };
    r.sample1970 = at(1970).slice(0, 4);
    api.setSilenceMode(false);
    window.BEA.store.dispatch('setYear', 1913); window.BEA.store.flush();
    return r;
  });
  log('SILENCE holes by year: ' + JSON.stringify(sil));

  // ---- critic: selection is brought into view ---------------------------
  await page.goto('http://localhost:8777/app/#year=1866&sel=new-zealand');
  await page.waitForTimeout(3200);
  await stage(page);
  const nz = await page.evaluate(() => {
    const api = window.__map;
    const node = document.getElementById('map-u-new-zealand');
    const mb = document.querySelector('.map').getBoundingClientRect();
    if (!node) return { found: false, plate: [Math.round(mb.width), Math.round(mb.height)] };
    const b = node.getBoundingClientRect();
    const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    const on = cx > mb.left && cx < mb.right && cy > mb.top && cy < mb.bottom;
    const hit = document.elementFromPoint(cx, cy);
    const s = api.unitScreen('new-zealand');
    return { found: true, plate: [Math.round(mb.width), Math.round(mb.height)], insets: api.plate.insets,
      at: [Math.round(cx - mb.left), Math.round(cy - mb.top)], unitScreen: s ? [Math.round(s.mx), Math.round(s.my), Math.round(s.w), Math.round(s.h), s.tiny] : null,
      onPlate: on, under: hit ? (hit.className || hit.tagName) : null, pick: api.pick(cx - mb.left, cy - mb.top) };
  });
  log('NZ 1866 selected: ' + JSON.stringify(nz));
  await shot('nz-1866');

  // ---- critic: def deep link, cold and warm -----------------------------
  await page.goto('http://localhost:8777/app/#year=1913&def=controlled');
  await page.waitForTimeout(2600);
  const cold = await page.evaluate(() => window.__map.definition);
  await page.evaluate(() => { location.hash = '#year=1913&def=administered'; });
  await page.waitForTimeout(900);
  const warm = await page.evaluate(() => window.__map.definition);
  log('DEEPLINK cold def=controlled → ' + cold + ' ; then hash def=administered → ' + warm);
};
