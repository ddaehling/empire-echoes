/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
// P02 round 3 — the six acceptance tests, end to end, one browser.
const TINY = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate && window.__map.plate.geom, null, { timeout: 25000 });
  await page.waitForTimeout(2800);

  // T1
  const t1 = {};
  for (const theme of ['paper','lamplit']) {
    await page.evaluate((t) => { window.BEA.store.dispatch('setTheme', t); window.BEA.store.dispatch('setYear', 1913); }, theme);
    await page.waitForTimeout(700);
    t1[theme] = await page.evaluate(() => {
      const T = window.__map.plate.tokens, P = window.__map.plate;
      const norm = (c) => { const d = document.createElement('div'); d.style.color = c; document.body.appendChild(d); const v = getComputedStyle(d).color; d.remove(); return v; };
      const bad = Object.entries(T.fills).filter(([k,v]) => { const c = norm(v); return c === 'rgb(0, 0, 0)' || c === 'rgb(255, 255, 255)'; });
      let drawn = 0, holes = 0; for (const r of P.paint.values()) { drawn++; if (r.mode === 'hole') holes++; }
      return { drawn, holes, coast: T.coast, badFills: bad.length };
    });
    await shot('t1-' + theme);
  }
  await page.evaluate(() => window.BEA.store.dispatch('setTheme', 'paper'));
  await page.waitForTimeout(500);
  log('T1 ' + JSON.stringify(t1));

  // T2
  const t2 = await page.evaluate(() => {
    const M = window.__map, D = window.BEA.data;
    window.BEA.store.dispatch('setYear', 1913);
    const count = (def) => { M.setDefinition(def); let n = 0; for (const r of M.plate.paint.values()) if (r.entry && !r.lost) n++; return n; };
    const claimed = count('claimed'), controlled = count('controlled');
    M.setDefinition('claimed');
    const st = D.statusAt(1913);
    let ec = 0, ek = 0, informalAtDeg1 = 0;
    for (const e of st.values()) {
      if (e.controlDegree >= 1 && e.status !== 'informal-sphere') ec++;
      if (e.controlDegree === 5) ek++;
      if (e.controlDegree >= 1 && e.status === 'informal-sphere') informalAtDeg1++;
    }
    const bd = D.metricsAt(1913).byDegree;
    const sumGte1 = Object.entries(bd).reduce((a,[k,v]) => a + (Number(k) >= 1 ? v : 0), 0);
    return { claimed, controlled, expClaimed: ec, expControlled: ek, byDegree: bd,
      sumGte1, informalAtDeg1, byDegree5: bd[5],
      pass: claimed === ec && controlled === ek && controlled === bd[5] && claimed === sumGte1 - informalAtDeg1 && claimed !== controlled };
  });
  log('T2 ' + JSON.stringify(t2));

  // T3
  let t3pass = 0; const t3notes = [];
  await page.evaluate(() => window.BEA.store.dispatch('setYear', 1900));
  await page.waitForTimeout(600);
  for (const id of TINY) {
    const r = await page.evaluate((uid) => {
      const M = window.__map, s = M.unitScreen(uid); if (!s) return { err: 'not drawn' };
      const b = M.module.el.getBoundingClientRect();
      return { x: Math.round(b.left + s.mx), y: Math.round(b.top + s.my), moved: Math.round(Math.hypot(s.mx-s.px, s.my-s.py)) };
    }, id);
    if (r.err) { t3notes.push(id + ':' + r.err); continue; }
    await page.mouse.click(r.x, r.y); await page.waitForTimeout(280);
    const g = await page.evaluate((uid) => {
      const S = window.BEA.store.getState(), n = document.getElementById('map-u-' + uid);
      let f = false, lab = null; if (n) { n.focus(); f = document.activeElement === n; lab = n.getAttribute('aria-label'); }
      return { sel: S.selectedTerritoryId, foc: S.focusedUnitId, f, lab };
    }, id);
    const ok = !!g.sel && g.foc === id && g.f && /Control degree \d of 5/.test(g.lab || '') && /\./.test(g.lab || '');
    if (ok) t3pass++; else t3notes.push(id + ' -> ' + JSON.stringify(g));
  }
  log('T3 ' + t3pass + '/7 ' + JSON.stringify(t3notes));

  // T4
  const t4 = await page.evaluate(async () => {
    const M = window.__map;
    window.BEA.store.dispatch('select', 'canada');
    await new Promise(r => setTimeout(r, 400));
    const area = (u) => { const s = M.unitScreen(u); return s ? s.w * s.h : 0; };
    const sig = () => [...M.plate.paint.entries()].map(([u,r]) => u + ':' + (r.fill || r.mode)).join('|');
    const b = { nu: area('ca-nunavut'), on: area('ca-ontario'), sig: sig(), sel: window.BEA.store.getState().selectedTerritoryId };
    M.setProjection('equal-earth'); await new Promise(r => setTimeout(r, 1300));
    const a = { nu: area('ca-nunavut'), on: area('ca-ontario'), sig: sig(), sel: window.BEA.store.getState().selectedTerritoryId };
    M.setProjection('mercator'); await new Promise(r => setTimeout(r, 1300));
    return { nunavutRatio: +(a.nu/b.nu).toFixed(3), ontarioRatio: +(a.on/b.on).toFixed(3),
      coloursIdentical: b.sig === a.sig, selectionKept: b.sel === a.sel,
      pass: a.nu < b.nu * 0.85 && b.sig === a.sig && b.sel === a.sel };
  });
  log('T4 ' + JSON.stringify(t4));

  // T5
  const t5 = await page.evaluate(() => {
    const M = window.__map;
    const ids = [...M.plate.paint.keys()].filter(u => { const r = M.plate.paint.get(u); return r.entry && !r.lost; }).slice(0, 10);
    const values = {}; ids.forEach((id,i) => values[id] = (i+1) * 1000);
    window.BEA.bus.emit('ask:sizeBy', { metric: 'ten-only', values, caption: 'A metric carried by ten units.', source: 'the acceptance test' });
    const scaled = [...(M.plate.weight ? M.plate.weight.keys() : [])];
    let absence = 0, fills = 0;
    for (const r of M.plate.paint.values()) { if (r.mode === 'absence') absence++; if (r.mode === 'fill' && !r.lost) fills++; }
    const w = M.weight;
    const out = { asked: ids.length, scaled: scaled.length, absence, fills, counted: w.counted, missing: w.missing,
      exactly: scaled.length === ids.length && ids.every(i => scaled.includes(i)) };
    window.BEA.bus.emit('ask:sizeBy', { metric: null });
    out.pass = out.exactly && out.absence > 0;
    return out;
  });
  log('T5 ' + JSON.stringify(t5));

  // T6
  await page.evaluate(() => { window.__errs = []; window.addEventListener('error', e => window.__errs.push(String(e.message))); window.__map.resetStats(); });
  await page.evaluate(async () => {
    const S = window.BEA.store;
    for (let y = 1600; y <= 1997; y++) { S.dispatch('setYear', y); await new Promise(r => requestAnimationFrame(r)); }
  });
  log('T6 ' + JSON.stringify(await page.evaluate(() => ({ errs: window.__errs, stats: window.__map.frameStats() }))));
  await shot('final');
};
