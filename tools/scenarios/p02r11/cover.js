/** p02r11/cover.js — class F: a unit named by a territory whose own dated
 *  coverage does not include it in that year. The Old Northwest / Canada East
 *  class. Prints how many distinct (territory, unit) pairs and at which years. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });
  const res = await page.evaluate(() => {
    const mod = window.BEA.registry.get('map').mod, data = window.BEA.data;
    const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');
    const finalCov = new Map();
    for (const t of data.territories || []) {
      const gc = t.geoCoverage || [];
      finalCov.set(t.id, gc.length ? (gc[gc.length - 1].units || []) : (t.units || []));
    }
    const rows = new Map();
    for (let y = 1580; y <= 2026; y++) {
      let paint; try { paint = mod._paintFor(y); } catch (e) { continue; }
      for (const [uid, rec] of paint) {
        const tid = mod._tidFor(uid, rec); if (!tid) continue;
        const live = data.unitsOf(tid, y) || [];
        const at = data.territoryAt(tid, y);
        const cov = (at && live.length) ? live : (finalCov.get(tid) || []);
        if (cov.includes(uid)) continue;
        const txt = mod._plateName(uid, rec, y);
        const own = data.unitName ? data.unitName(uid) : uid;
        if (!txt || norm(txt) === norm(own)) continue;
        const k = tid + '|' + uid;
        if (!rows.has(k)) rows.set(k, { tid, uid, own, y0: y, y1: y, txt, active: !!at, n: 0 });
        const r = rows.get(k); r.y1 = y; r.n++; r.txt = txt;
      }
    }
    return [...rows.values()];
  });
  log('F — a unit named by a territory that does not cover it: ' + res.length + ' pairs');
  for (const r of res.sort((a, b) => b.n - a.n)) {
    log('   ' + r.tid + ' / ' + r.uid + ' ("' + r.own + '")  years ' + r.y0 + '-' + r.y1 + ' (' + r.n + ')  last printed "' + r.txt + '"');
  }
};
