/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p02-r5`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P02 round 5: tiny territories stay findable. */
/* P02 acceptance tests, FEATURE_SPEC §2 P02 1-6. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.map, null, { timeout: 20000 });
  await page.waitForTimeout(2600);
  const set = async (y) => { await page.evaluate(yy => window.BEA.store.dispatch('setYear', yy), y); await page.waitForTimeout(600); };

  /* ---- T1: coastline + no black/white fills ---------------------------- */
  await set(1913);
  const t1 = await page.evaluate(() => {
    const m = window.BEA.map, mod = m.module;
    const T = mod.tokens;
    const norm = (c) => String(c || '').trim().toLowerCase();
    const bad = [];
    for (const [k, v] of Object.entries(T.fills || {})) {
      const n = norm(v);
      if (/^#0{3,8}$/.test(n) || /^#f{3,8}$/i.test(n) || n === 'rgb(0, 0, 0)' || n === 'rgb(255, 255, 255)') bad.push([k, v]);
    }
    let drawn = 0, stroked = 0;
    for (const [id, rec] of m.plate.paint) { drawn++; if (rec.mode !== 'skip') stroked++; }
    return { theme: document.documentElement.getAttribute('data-theme'), coast: T.coast, sea: T.sea,
      badFills: bad, drawn, stroked, fillCount: Object.keys(T.fills || {}).length };
  });
  log('T1 ' + JSON.stringify(t1));
  await shot('T1');

  /* ---- T2: definition switch counts match data ------------------------- */
  const t2 = await page.evaluate(async () => {
    const m = window.BEA.map, d = window.BEA.data;
    const wait = () => new Promise(r => setTimeout(r, 450));
    const grab = async (def) => { m.setDefinition(def); await wait();
      return { def, painted: [...m.plate.paint.keys()].filter(k => { const r = m.plate.paint.get(k); return r && r.entry; }).sort(), n: m.measures ? m.measures.units : null }; };
    const a = await grab('claimed'), b = await grab('controlled');
    await grab('claimed');
    const by = d.metricsAt(1913).byDegree;
    const claimed = Object.entries(by).reduce((s, [k, v]) => s + (Number(k) >= 1 ? v : 0), 0);
    const controlled = by[5] || 0;
    const same = a.painted.length === b.painted.length && a.painted.every((x, i) => x === b.painted[i]);
    return { byDegree: by, aN: a.n, bN: b.n, aPainted: a.painted.length, bPainted: b.painted.length,
      dataClaimed: claimed, dataControlled: controlled, identicalSets: same,
      diffModule: a.painted.length - b.painted.length, diffData: claimed - controlled };
  });
  log('T2 ' + JSON.stringify(t2));

  /* ---- T5: weight mode ------------------------------------------------- */
  const t5 = await page.evaluate(async () => {
    const m = window.BEA.map;
    const ten = ['gibraltar','malta','ascension','barbados','singapore','hk-hong-kong-island','ye-aden-colony','jamaica','ceylon','mauritius'];
    const values = {}; ten.forEach((id, i) => { values[id] = 1000 * (i + 1); });
    const before = new Map();
    for (const [id, r] of m.plate.paint) before.set(id, r.mode);
    m.setWeight({ metric: 'test-metric', caption: 'a test metric', source: 'test source', values, year: 1913 });
    await new Promise(r => setTimeout(r, 500));
    let scaled = 0, absence = 0, other = 0; const scaledIds = [];
    for (const [id, r] of m.plate.paint) {
      if (r.weight != null && r.weight !== 1) { scaled++; scaledIds.push(id); }
      else if (r.mode === 'absence') absence++;
      else other++;
    }
    const w = m.weight;
    m.setWeight(null);
    await new Promise(r => setTimeout(r, 400));
    return { scaled, scaledIds: scaledIds.sort(), absence, other, missing: w && w.missing != null ? w.missing : null };
  });
  log('T5 ' + JSON.stringify(t5));

  /* ---- T4: projection --------------------------------------------------- */
  const t4 = await page.evaluate(async () => {
    const m = window.BEA.map;
    const area = (id) => { const b = m.plate._boundsNow().get(id); return b ? (b.x1 - b.x0) * (b.y1 - b.y0) : null; };
    const before = { canada: area('ca-nunavut') || area('ca-quebec'), kenya: area('kenya'),
      colours: [...m.plate.paint.entries()].map(([k, r]) => k + ':' + (r.entry ? r.entry.status : r.mode)).sort().join('|') };
    m.setProjection('equal-earth');
    await new Promise(r => setTimeout(r, 1400));
    const after = { canada: area('ca-nunavut') || area('ca-quebec'), kenya: area('kenya'),
      colours: [...m.plate.paint.entries()].map(([k, r]) => k + ':' + (r.entry ? r.entry.status : r.mode)).sort().join('|') };
    m.setProjection('mercator');
    await new Promise(r => setTimeout(r, 1200));
    return { canadaBefore: before.canada, canadaAfter: after.canada,
      canadaRatio: before.canada && after.canada ? +(after.canada / before.canada).toFixed(3) : null,
      kenyaRatio: before.kenya && after.kenya ? +(after.kenya / before.kenya).toFixed(3) : null,
      coloursUnchanged: before.colours === after.colours };
  });
  log('T4 ' + JSON.stringify(t4));
  await shot('T4-back');
};
