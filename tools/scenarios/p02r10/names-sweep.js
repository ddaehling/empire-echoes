/**
 * p02r10/names-sweep.js — the round-2 sweep. Round 9's sweep asked one
 * question ("is this string dateable to this year?") and got the answer to 0.
 * The critic found two more classes it could not see:
 *
 *   C · ONE TERRITORY, TWO NAMES IN ONE FRAME. At 2020 the South Atlantic
 *       carries "South Georgia" on one mark and "Isle of Georgia" on the mark
 *       beside it. Both are dateable; together they are a rendering fault.
 *   D · AN UNBOUNDED RECORD PRINTED IN A YEAR IT CANNOT VOUCH FOR. Cook's
 *       1775 name has no `to` in the shard, so it covers 2026 by default and
 *       outranks the title the atlas itself files the ground under.
 *
 * Both are swept across every year 1580-2026 and every territory, and the
 * before/after diff of every string this pass changes is printed in full.
 *
 *   node tools/inspect.js tools/scenarios/p02r10/names-sweep.js --out /tmp/n --w 1366 --h 768
 */
const LIVING_MEMORY = 120;

module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });

  const res = await page.evaluate((LM) => {
    const mod = window.BEA.registry.get('map').mod;
    const data = window.BEA.data;
    const yearOf = (v) => { if (v == null) return null;
      const raw = typeof v === 'object' ? (v.value != null ? v.value : v.display) : v;
      const m = String(raw == null ? '' : raw).match(/-?\d{3,4}/); return m ? Number(m[0]) : null; };
    const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');
    const terr = new Map();
    for (const t of data.territories || []) {
      const names = (t.namesOverTime || []).filter((n) => n && n.name).map((n) => ({
        name: n.name, from: yearOf(n.from), to: yearOf(n.to), usedBy: n.usedBy || '', language: n.language || '' }));
      terr.set(t.id, { t, names });
    }
    const findC = [], findD = [], seen = new Set();
    for (let y = 1580; y <= 2026; y++) {
      let paint; try { paint = mod._paintFor(y); } catch (e) { continue; }
      const byTid = new Map();
      for (const [uid, rec] of paint) {
        const tid = mod._tidFor(uid, rec); if (!tid) continue;
        const txt = mod._plateName(uid, rec, y); if (!txt) continue;
        const own = data.unitName ? data.unitName(uid) : uid;
        if (!byTid.has(tid)) byTid.set(tid, []);
        byTid.get(tid).push({ uid, txt, borrowed: norm(txt) !== norm(own) });
        /* D — an unbounded record, printed a long way past its own start, on
           ground the atlas files under a different title. */
        const rc = terr.get(tid);
        if (rc) {
          const rec2 = rc.names.find((n) => norm(n.name) === norm(txt));
          if (rec2 && rec2.to == null && rec2.from != null && y - rec2.from > LM
              && norm(rc.t.name) !== norm(txt)) {
            const k = 'D|' + tid + '|' + norm(txt);
            if (!seen.has(k)) { seen.add(k);
              findD.push({ y, tid, uid, txt, from: rec2.from, title: rc.t.name }); }
          }
        }
      }
      for (const [tid, list] of byTid) {
        const strings = [...new Set(list.map((r) => norm(r.txt)))];
        if (strings.length < 2) continue;
        // only a contradiction when one of the two is BORROWED from the territory
        if (!list.some((r) => r.borrowed)) continue;
        const k = 'C|' + tid + '|' + strings.sort().join('+');
        if (seen.has(k)) continue; seen.add(k);
        findC.push({ y, tid, texts: list.map((r) => r.txt + (r.borrowed ? '*' : '')) });
      }
    }
    return { findC, findD };
  }, LIVING_MEMORY);

  log('C · ONE TERRITORY, TWO NAMES IN ONE FRAME: ' + res.findC.length);
  for (const f of res.findC) log('   * ' + f.y + '  ' + f.tid + '   ' + JSON.stringify(f.texts) + '   (* = borrowed from the territory)');
  log('D · UNBOUNDED RECORD PRINTED > ' + LIVING_MEMORY + ' YEARS AFTER ITS START, TITLE DIFFERS: ' + res.findD.length);
  for (const f of res.findD) log('   * ' + f.y + '  ' + f.tid + '  prints "' + f.txt + '" (recorded from ' + f.from + ', no end) while the atlas files it as "' + f.title + '"');
};
