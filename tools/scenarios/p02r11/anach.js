/**
 * p02r11/anach.js — THE ANACHRONISM SWEEP, round 11.
 *
 * Every year 1580-2026, every painted unit, every string this module can put
 * on a plate or in a screen reader's ear, tested against the dataset's own
 * dates. Five classes:
 *
 *   A  a plate name the dataset dates OUTSIDE the year on the plate
 *   B  a plate name that is the title of a colony the dataset says has ended,
 *      on ground the dataset holds another name for  (the Cape Colony class)
 *   C  an accessible name whose "(now X)" clause prints a name that is not
 *      the name of this ground now  (the Somaliland class)
 *   D  a headline taken from a record the dataset left OPEN, printed in a year
 *      later than every date the dataset holds for that ground, while the
 *      atlas's own live title says something else  (the Somers Isles class)
 *   E  a group label failing A or B
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });

  const res = await page.evaluate(() => {
    const mod = window.BEA.registry.get('map').mod;
    const data = window.BEA.data;
    const N = mod.namer;
    const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');
    const yearOf = (v) => { if (v == null) return null;
      const raw = typeof v === 'object' ? (v.value != null ? v.value : v.display) : v;
      const m = String(raw == null ? '' : raw).match(/-?\d{3,4}/); return m ? Number(m[0]) : null; };
    // every year mentioned anywhere in a territory's own record
    const lastDated = new Map();
    const walk = (o, hit, seenO, depth) => {
      seenO = seenO || new Set(); depth = depth || 0;
      if (!o || typeof o !== 'object' || depth > 8 || seenO.has(o)) return;
      seenO.add(o);
      if (Array.isArray(o)) { for (const v of o) walk(v, hit, seenO, depth + 1); return; }
      for (const [k, v] of Object.entries(o)) {
        if ((k === 'from' || k === 'to' || k === 'date' || k === 'signed' || k === 'start' || k === 'end') ) {
          const y = yearOf(v); if (y) hit(y);
        }
        if (k === 'year' && typeof v === 'number') hit(v);
        walk(v, hit, seenO, depth + 1);
      }
    };
    for (const t of data.territories || []) {
      let mx = 0; walk(t, (y) => { if (y > mx && y < 2100) mx = y; });
      lastDated.set(t.id, mx);
    }
    const openRec = new Map();      // tid -> [{name, from, usedBy}]
    for (const t of data.territories || []) {
      openRec.set(t.id, (t.namesOverTime || []).filter((n) => n && n.name && n.to == null)
        .map((n) => ({ name: n.name, from: yearOf(n.from), usedBy: n.usedBy || '' })));
    }

    const out = { A: [], B: [], C: [], D: [], E: [] };
    const seen = new Set();
    const add = (cls, key, row) => { const k = cls + '|' + key; if (seen.has(k)) return; seen.add(k); out[cls].push(row); };

    for (let y = 1580; y <= 2026; y++) {
      let paint; try { paint = mod._paintFor(y); } catch (e) { continue; }
      const groups = new Map();
      for (const [uid, rec] of paint) {
        const tid = mod._tidFor(uid, rec);
        const txt = mod._plateName(uid, rec, y);
        if (tid) { if (!groups.has(tid)) groups.set(tid, []); groups.get(tid).push(uid); }
        if (txt) {
          if (N.dateable(tid, txt, y) === false) add('A', tid + '|' + norm(txt), { y, tid, uid, txt });
          else if (N.deadName(txt, y)) add('B', tid + '|' + norm(txt), { y, tid, uid, txt });
          else if (tid) {
            const last = lastDated.get(tid) || 0;
            const rec2 = (openRec.get(tid) || []).find((n) => norm(n.name) === norm(txt));
            const t = data.byId.get(tid);
            if (rec2 && y > last && t && norm(t.name) !== norm(txt) && !N.deadName(t.name, y)) {
              add('D', tid + '|' + norm(txt), { y, tid, uid, txt, from: rec2.from, usedBy: rec2.usedBy, title: t.name, last });
            }
          }
        }
        // C — the spoken name
        if (tid) {
          const lab = N.label(uid, tid, y);
          const m = lab && lab.text && lab.text.match(/\((?:now|the former) ([^)]+)\)/);
          if (m) {
            const inner = m[1];
            const p = N.periodName(tid, y);
            const isNow = p && p.modern && norm(p.modern) === norm(inner);
            const bad = /\(now /.test(lab.text) && !isNow
              && (N.dateable(tid, inner, y) === false || N.deadName(inner, y) || N.supersededTitle(inner, y)
                  || (p && p.source === 'the name this place has today'));
            if (bad) add('C', tid + '|' + norm(inner), { y, tid, uid, txt: lab.text });
          }
        }
      }
      for (const [tid, units] of groups) {
        if (units.length < 2) continue;
        const g = mod._plateGroupName(tid, units, y);
        if (!g) continue;
        if (N.dateable(tid, g, y) === false || N.deadName(g, y)) add('E', tid + '|' + norm(g), { y, tid, txt: g });
      }
    }
    return out;
  });

  for (const cls of ['A', 'B', 'C', 'D', 'E']) {
    log(cls + ' — ' + res[cls].length + ' distinct');
    for (const r of res[cls].slice(0, 60)) {
      log('   ' + r.y + '  ' + r.tid + (r.uid ? ' / ' + r.uid : '') + '   "' + r.txt + '"'
        + (r.title ? '   [open record from ' + r.from + ', ' + r.usedBy + '; atlas title "' + r.title + '"; last dated year ' + r.last + ']' : ''));
    }
    if (res[cls].length > 60) log('   … ' + (res[cls].length - 60) + ' more');
  }
};
