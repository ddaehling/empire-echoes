/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p02-r6`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P02 round 6: the paint rules that round added. */
/**
 * P02 acceptance, FEATURE_SPEC §2 P02 tests 1-6, with PASS/FAIL per test.
 * Round 6. Run at 1440x900 (and with --dark, --reduced) :
 *   node tools/inspect.js tools/scenarios/p02r6-accept.js --out /tmp/a --w 1440 --h 900
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2400);
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  const set = async (y) => { await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y); await page.waitForTimeout(500); };

  /* 1 — coastline on every drawn unit, no #000 / #fff fill */
  await set(1913);
  const a1 = await page.evaluate(() => {
    const T = window.BEA.map.module.tokens, m = window.BEA.map;
    const bad = Object.entries(T.fills || {}).filter(([, v]) => /^#(0{3,8}|f{3,8})$/i.test(String(v).trim()) || /^rgb\(\s*(0,\s*0,\s*0|255,\s*255,\s*255)\s*\)$/.test(String(v).trim()));
    let drawn = 0, noCoast = 0;
    for (const [, rec] of m.plate.paint) { drawn++; if (rec.mode === 'skip') noCoast++; }
    return { bad, drawn, noCoast, coast: T.coast, ground: T.ground, theme: document.documentElement.dataset.theme || 'auto' };
  });
  t('AT1 coast + no black/white fill', a1.bad.length === 0 && a1.drawn > 0 && a1.noCoast === 0,
    `${a1.drawn} units drawn, ${a1.noCoast} without a stroke, bad fills ${JSON.stringify(a1.bad)}, coast ${a1.coast}, ground ${a1.ground}`);

  /* 2 — the definition switch changes the painted set, and by the data's own count.
         `claimed` is degree >= 1 AND NOT informal-sphere — the module prints that
         rule on the plate — so the expected count is computed under the same rule
         from `data.statusAt`, never from `byDegree` alone and never hard-coded. */
  const a2 = await page.evaluate(async () => {
    const m = window.BEA.map, d = window.BEA.data;
    const st = d.statusAt(1913);
    const rows = st instanceof Map ? [...st.values()] : Object.values(st);
    const expClaimed = rows.filter(e => (e.controlDegree || 0) >= 1 && e.status !== 'informal-sphere').length;
    const expControlled = rows.filter(e => (e.controlDegree || 0) === 5 && e.status !== 'informal-sphere').length;
    m.setDefinition('claimed'); await new Promise(r => setTimeout(r, 450));
    const A = new Set([...m.plate.paint].filter(([, r]) => !r.lost).map(([k]) => k));
    m.setDefinition('controlled'); await new Promise(r => setTimeout(r, 450));
    const B = new Set([...m.plate.paint].filter(([, r]) => !r.lost).map(([k]) => k));
    m.setDefinition('claimed'); await new Promise(r => setTimeout(r, 450));
    const meas = m.module.measures;
    return { a: A.size, b: B.size, same: A.size === B.size && [...A].every(x => B.has(x)),
      expClaimed, expControlled, gotClaimed: meas.claimed.units, gotControlled: meas.controlled.units };
  });
  t('AT2 definition switch', !a2.same && a2.gotClaimed === a2.expClaimed && a2.gotControlled === a2.expControlled
      && (a2.a - a2.b) === (a2.expClaimed - a2.expControlled),
    `painted claimed ${a2.a} / controlled ${a2.b}; module counts ${a2.gotClaimed}/${a2.gotControlled}, data says ${a2.expClaimed}/${a2.expControlled}`);

  /* 3 — the seven named small places: each is a real click that selects that place,
         each is keyboard-focusable, each reads its name, status and degree. */
  const ids3 = ['gibraltar', 'malta', 'ascension', 'barbados', 'ye-aden-colony', 'singapore', 'hk-hong-kong-island'];
  const a3 = [];
  for (const id of ids3) {
    const spot = await page.evaluate((uid) => {
      const n = [...document.querySelectorAll('.map__target')].find(e => e.dataset.unit === uid);
      if (!n) return null;
      const r = n.getBoundingClientRect();
      n.focus();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2),
        w: Math.round(r.width), h: Math.round(r.height),
        focused: document.activeElement === n,
        named: /Control degree/.test(n.getAttribute('aria-label') || '') };
    }, id);
    if (!spot) { a3.push([id, 'NO TARGET']); continue; }
    await page.mouse.click(spot.x, spot.y);
    await page.waitForTimeout(260);
    const sel = await page.evaluate(() => {
      const s = window.BEA.store.getState();
      return { unit: s.focusedUnitId, territory: s.selectedTerritoryId };
    });
    const hit = sel.unit === id;
    a3.push([id, spot.w + 'x' + spot.h, hit ? 'selects' : 'MISSED (' + JSON.stringify(sel) + ')',
      spot.focused ? 'focusable' : 'NOT FOCUSABLE', spot.named ? 'named' : 'THIN LABEL']);
  }
  t('AT3 seven small places', a3.every(r => r.length === 5 && r[1].split('x').every(v => +v >= 44)
      && r[2] === 'selects' && r[3] === 'focusable' && r[4] === 'named'), JSON.stringify(a3));

  /* 4 — the projection toggle */
  const a4 = await page.evaluate(async () => {
    const m = window.BEA.map;
    const area = (id) => { const b = m.plate._boundsNow().get(id); return b ? (b.x1 - b.x0) * (b.y1 - b.y0) : null; };
    const colour = () => [...m.plate.paint].map(([k, r]) => k + ':' + r.key + ':' + r.mode).join('|');
    const c0 = colour(), ca = area('ca-nunavut') || area('ca-quebec'), ka = area('kenya');
    m.setProjection('equal-earth'); await new Promise(r => setTimeout(r, 1400));
    const cb = area('ca-nunavut') || area('ca-quebec'), kb = area('kenya'), c1 = colour();
    const reduced = document.documentElement.dataset.motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
    m.setProjection('mercator'); await new Promise(r => setTimeout(r, 1400));
    return { canadaRatio: +(cb / ca).toFixed(3), kenyaRatio: +(kb / ka).toFixed(3), coloursUnchanged: c0 === c1, reduced };
  });
  t('AT4 projection', a4.canadaRatio < 0.6 && a4.kenyaRatio > 0.9 && a4.coloursUnchanged,
    `Canada x${a4.canadaRatio}, Kenya x${a4.kenyaRatio}, fills/selection unchanged ${a4.coloursUnchanged}, reduced-motion ${a4.reduced}`);

  /* 5 — weight mode: exactly the ten scale, and every other unit BRITISH THIS
         YEAR draws the absence hatch. A ghost — a place held once and lost
         before this year — is not in the metric's population and keeps its own
         ink; it is not "no figure", it is not this empire. */
  const a5 = await page.evaluate(async () => {
    const m = window.BEA.map;
    const ten = ['gibraltar', 'malta', 'ascension', 'barbados', 'singapore', 'hk-hong-kong-island', 'ye-aden-colony', 'jamaica', 'ceylon', 'mauritius'];
    const values = {}; ten.forEach((id, i) => { values[id] = 1000 * (i + 1); });
    m.setWeight({ metric: 'test-metric', caption: 'a test metric', source: 'test source', values, year: 1913 });
    await new Promise(r => setTimeout(r, 700));
    const scaled = m.plate.weight ? [...m.plate.weight.keys()].sort() : [];
    let absence = 0, live = 0, other = [];
    for (const [id, r] of m.plate.paint) {
      if (m.plate.weight.has(id) || r.lost) continue;
      live++;
      if (r.mode === 'absence') absence++; else other.push(id + ':' + r.mode);
    }
    m.setWeight(null); await new Promise(r => setTimeout(r, 500));
    return { scaled, absence, live, other: other.slice(0, 6) };
  });
  t('AT5 weight mode', a5.scaled.length === 10 && a5.absence === a5.live,
    `${a5.scaled.length} scaled, ${a5.absence} of ${a5.live} other live units draw the absence hatch${a5.other.length ? ' — exceptions ' + a5.other.join(',') : ''}`);

  /* 6 — a 1600 -> 1997 scrub: errors are counted by the harness, reported below */
  for (let y = 1600; y <= 1997; y += 7) await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y);
  await page.waitForTimeout(900);
  await set(1900);
  const a6 = await page.evaluate(() => ({ units: window.BEA.map.plate.paint.size, year: window.BEA.store.getState().year }));
  t('AT6 scrub 1600-1997', a6.year === 1900 && a6.units > 0, `${a6.units} units at 1900 after a 57-step scrub; console/request errors are counted by the harness below`);

  log(R.join('\n'));
  log(R.some(x => x.startsWith('FAIL')) ? '>>> P02 ACCEPTANCE FAILED' : '>>> P02 acceptance holds');
  await shot('accept');
};
