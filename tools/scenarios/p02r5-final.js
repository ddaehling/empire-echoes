/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P02 — the six acceptance tests of FEATURE_SPEC §2, run end to end. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2800);
  const wait = (ms) => page.waitForTimeout(ms);

  /* T1 */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913)); await wait(700);
  log('T1 ' + JSON.stringify(await page.evaluate(() => {
    const m = window.BEA.map, T = m.module.tokens;
    const n = c => String(c || '').trim().toLowerCase();
    const bad = Object.entries(T.fills || {}).filter(([, v]) => /^#(0{3}|0{6}|f{3}|f{6})$/i.test(n(v)));
    let drawn = 0; for (const _ of m.plate.paint) drawn++;
    return { theme: getComputedStyle(document.documentElement).colorScheme, coast: T.coast, sea: T.sea, badFills: bad.length, drawn };
  })));
  await shot('T1');

  /* T2 */
  log('T2 ' + JSON.stringify(await page.evaluate(async () => {
    const m = window.BEA.map, d = window.BEA.data;
    const w = () => new Promise(r => setTimeout(r, 450));
    const set = async (def) => { m.setDefinition(def); await w(); return new Set([...m.plate.paint.keys()].filter(k => m.plate.paint.get(k).entry)); };
    const a = await set('claimed'), b = await set('controlled'); await set('claimed');
    const by = d.metricsAt(1913).byDegree;
    const degree1 = Object.entries(by).reduce((s, [k, v]) => s + (Number(k) >= 1 ? v : 0), 0);
    const informal = m.module.informalHeld.length;
    return { claimedPainted: a.size, controlledPainted: b.size, degree1, informalExcluded: informal,
      expectClaimed: degree1 - informal, dataControlled: by[5] || 0,
      diffPainted: a.size - b.size, diffData: (degree1 - informal) - (by[5] || 0),
      setsDiffer: a.size !== b.size };
  })));

  /* T3 at this width */
  const ids = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
  const clicks = [];
  for (const id of ids) {
    const p = await page.evaluate(uid => { const m = window.BEA.map, s = m.unitScreen(uid);
      if (!s) return null; const f = document.querySelector('.map__frame').getBoundingClientRect();
      return { x: Math.round(f.left + s.mx), y: Math.round(f.top + s.my) }; }, id);
    if (!p) { clicks.push({ id, ok: false }); continue; }
    await page.mouse.click(p.x, p.y); await wait(380);
    const st = await page.evaluate(() => window.BEA.store.getState().focusedUnitId);
    const kb = await page.evaluate(uid => { const t = document.querySelector('.map__target[data-unit="' + uid + '"]');
      if (!t) return null; t.focus(); return { focused: document.activeElement === t, label: t.getAttribute('aria-label'),
        w: Math.round(t.getBoundingClientRect().width), h: Math.round(t.getBoundingClientRect().height) }; }, id);
    clicks.push({ id, clickSelects: st === id, kb });
  }
  log('T3 ' + JSON.stringify(clicks));

  /* T4 */
  log('T4 ' + JSON.stringify(await page.evaluate(async () => {
    const m = window.BEA.map;
    const A = id => { const b = m.plate._boundsNow().get(id); return b ? (b.x1 - b.x0) * (b.y1 - b.y0) : null; };
    const snap = () => ({ ca: A('ca-quebec'), nwt: A('ca-northwest-territories'), ke: A('kenya'),
      col: [...m.plate.paint.entries()].map(([k, r]) => k + ':' + (r.entry ? r.entry.status : r.mode)).sort().join('|'),
      sel: window.BEA.store.getState().selectedTerritoryId });
    const b0 = snap(); m.setProjection('equal-earth'); await new Promise(r => setTimeout(r, 1500));
    const b1 = snap(); m.setProjection('mercator'); await new Promise(r => setTimeout(r, 1400));
    return { quebecRatio: +(b1.ca / b0.ca).toFixed(3), nwtRatio: +(b1.nwt / b0.nwt).toFixed(3),
      kenyaRatio: +(b1.ke / b0.ke).toFixed(3), coloursUnchanged: b0.col === b1.col, selUnchanged: b0.sel === b1.sel };
  })));

  /* T5 */
  log('T5 ' + JSON.stringify(await page.evaluate(async () => {
    const m = window.BEA.map;
    const ten = ['gibraltar','malta','ascension','barbados','singapore','hk-hong-kong-island','ye-aden-colony','jamaica','mauritius','cyprus'];
    const values = new Map(); ten.forEach((id, i) => values.set(id, 1000 * (i + 1)));
    m.setWeight({ metric: 'test-metric', caption: 'a test metric', source: 'a test source', values });
    await new Promise(r => setTimeout(r, 700));
    const scaled = m.plate.weight ? [...m.plate.weight.keys()].sort() : [];
    let absence = 0, drawn = 0;
    for (const [, r] of m.plate.paint) { drawn++; if (r.mode === 'absence') absence++; }
    const o = { scaledN: scaled.length, exact: scaled.join(',') === ten.slice().sort().join(','), absence, drawn };
    m.setWeight(null); await new Promise(r => setTimeout(r, 400));
    return o;
  })));

  /* T6 */
  log('T6 ' + JSON.stringify(await page.evaluate(async () => {
    const m = window.BEA.map, s = window.BEA.store; m.resetStats();
    const t = [];
    for (let y = 1600; y <= 1997; y++) { const a = performance.now(); s.dispatch('setYear', y); s.flush(); m.draw(); t.push(performance.now() - a); }
    t.sort((a, b) => a - b);
    return { frames: t.length, mean: +(t.reduce((a, b) => a + b, 0) / t.length).toFixed(3), median: +t[199].toFixed(3),
      p95: +t[377].toFixed(3), worst: +t[397].toFixed(3), over16: t.filter(v => v > 16).length, plate: m.frameStats() };
  })));
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1913)); await wait(600);
  await shot('final');
};
