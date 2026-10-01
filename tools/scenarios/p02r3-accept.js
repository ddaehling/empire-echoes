/* RETIRED, WAVE 9 — NOT PART OF THE ACCEPTANCE SUITE (`tools/acceptance.js`).
 * P02 round 3. Superseded by rounds 5, 6 and 8 of the same piece, all of which run clean. It dies in its own first measurement — `Cannot read properties of null (reading 'w')` — because the element it sized no longer exists.
 * The guarantee it protected is now protected by `tools/scenarios/p02r8-accept.js`.
 * Kept, unedited below, as the record of what that round measured. Running it
 * will fail against the current DOM; that is expected and is not a build break. */
// P02 round 3 — the six acceptance tests in FEATURE_SPEC §2, run against the app.
const TINY = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
module.exports = async ({ page, shot, log }) => {
  const ready = () => page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await ready(); await page.waitForTimeout(2500);

  // ---- T1 coastline + no pure black/white fill, in both themes
  for (const theme of ['paper', 'lamplit']) {
    await page.evaluate((t) => window.BEA.store.dispatch('setTheme', t), theme);
    await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913));
    await page.waitForTimeout(700);
    const t1 = await page.evaluate(() => {
      const T = window.__map.plate.tokens;
      const norm = (c) => { const d = document.createElement('div'); d.style.color = c; document.body.appendChild(d);
        const v = getComputedStyle(d).color; d.remove(); return v; };
      const bad = [];
      for (const [k, v] of Object.entries(T.fills)) {
        const c = norm(v);
        if (/^rgb\(0, 0, 0\)$/.test(c) || /^rgb\(255, 255, 255\)$/.test(c)) bad.push([k, v, c]);
      }
      let drawn = 0, noStroke = 0;
      for (const [uid, rec] of window.__map.plate.paint) {
        drawn++;
        // every branch of _paintShape strokes; a record with no fill is a hole
        if (rec.mode === 'fill' && !rec.fill) noStroke++;
      }
      return { theme: document.documentElement.dataset.theme, coast: T.coast, coastNorm: norm(T.coast),
        badFills: bad, drawn, noFill: noStroke, paper: T.paper, ink: T.ink };
    });
    log('T1 ' + theme + ' :: ' + JSON.stringify(t1));
    await shot('t1-' + theme);
  }
  await page.evaluate(() => window.BEA.store.dispatch('setTheme', 'paper'));
  await page.waitForTimeout(400);

  // ---- T2 definitions against data.metricsAt(1913).byDegree
  const t2 = await page.evaluate(() => {
    const M = window.__map, D = window.BEA.data;
    D && window.BEA.store.dispatch('setYear', 1913);
    const setOf = (def) => { M.setDefinition(def); const s = new Set();
      for (const [u, r] of M.plate.paint) if (r.mode !== 'fill' || !r.lost) { if (r.entry) s.add(u); } return s; };
    const claimed = setOf('claimed');
    const controlled = setOf('controlled');
    const md = D.metricsAt(1913);
    // expected from the dataset's own byDegree tally
    const st = D.statusAt(1913);
    let expClaimed = 0, expControlled = 0;
    for (const e of st.values()) {
      if (e.controlDegree >= 1 && e.status !== 'informal-sphere') expClaimed++;
      if (e.controlDegree === 5) expControlled++;
    }
    M.setDefinition('claimed');
    return { byDegree: md.byDegree, claimed: claimed.size, controlled: controlled.size,
      expClaimed, expControlled, diff: claimed.size - controlled.size,
      expDiff: expClaimed - expControlled,
      sameSet: claimed.size === controlled.size };
  });
  log('T2 :: ' + JSON.stringify(t2));

  // ---- T5 weight with a metric only ten units carry
  const t5 = await page.evaluate(() => {
    const M = window.__map;
    const ids = [...M.plate.paint.keys()].slice(0, 10);
    const values = {}; ids.forEach((id, i) => { values[id] = (i + 1) * 1000; });
    window.BEA.bus.emit('ask:sizeBy', { metric: 'test-ten', values, caption: 'A test metric carried by ten units.', source: 'the scenario' });
    const scaled = [], absent = [];
    for (const [u, r] of M.plate.paint) {
      if (M.plate.weight && M.plate.weight.has(u)) scaled.push(u);
      if (r.mode === 'absence') absent.push(u);
    }
    const w = M.weight;
    const out = { asked: ids.length, scaled: scaled.length, absent: absent.length,
      counted: w && w.counted, missing: w && w.missing,
      exactlyThose: scaled.length === ids.length && ids.every(i => scaled.includes(i)) };
    window.BEA.bus.emit('ask:sizeBy', { metric: null });
    return out;
  });
  log('T5 :: ' + JSON.stringify(t5));

  // ---- T4 projection
  const t4 = await page.evaluate(async () => {
    const M = window.__map;
    const before = M.unitScreen('canada');
    const colourBefore = [...M.plate.paint.entries()].map(([u, r]) => u + ':' + (r.fill || r.mode)).join('|');
    M.setProjection('equal-earth');
    await new Promise(r => setTimeout(r, 1200));
    const after = M.unitScreen('canada');
    const colourAfter = [...M.plate.paint.entries()].map(([u, r]) => u + ':' + (r.fill || r.mode)).join('|');
    const areaB = before.w * before.h, areaA = after.w * after.h;
    M.setProjection('mercator');
    await new Promise(r => setTimeout(r, 1200));
    return { canadaMercator: Math.round(areaB), canadaEqualEarth: Math.round(areaA),
      shrank: areaA < areaB * 0.85, coloursIdentical: colourBefore === colourAfter };
  });
  log('T4 :: ' + JSON.stringify(t4));
};
