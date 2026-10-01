/**
 * p02r10/names-diff.js — every string this pass changes, across 1580-2026.
 *
 * The naming rules in this module may only be changed against a measurement,
 * so the round-9 namer is loaded verbatim from names-r9.js.txt alongside the
 * live one and both are asked for every unit label and every group label at
 * every year the atlas can show. Every difference is printed, with the years
 * it spans, so a reviewer can check each one against the shard rather than
 * against my opinion of the rule.
 *
 * It also re-runs round 9's two anachronism classes, because a fix to one
 * class of wrong name that reopens another is not a fix.
 */
const fs = require('fs'), path = require('path');

module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });
  const oldSrc = fs.readFileSync(path.join(__dirname, 'names-r9.js.txt'), 'utf8')
    .replace(/^export default[\s\S]*$/m, '').replace(/^export\s+/gm, '');

  const res = await page.evaluate(({ oldSrc }) => {
    const mod = window.BEA.registry.get('map').mod;
    const data = window.BEA.data;
    // eslint-disable-next-line no-new-func
    const makeNamer = new Function(oldSrc + '; return makeNamer;')();
    const old = makeNamer(data);
    const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');
    const yearOf = (v) => { if (v == null) return null;
      const raw = typeof v === 'object' ? (v.value != null ? v.value : v.display) : v;
      const m = String(raw == null ? '' : raw).match(/-?\d{3,4}/); return m ? Number(m[0]) : null; };
    /* the round-9 plate label, verbatim */
    const oldName = (uid, rec, y) => {
      const held = !!(rec && rec.entry && rec.entry.territoryId);
      const tid = mod._tidFor(uid, rec);
      let s = tid ? old.short(uid, tid, y, { strict: !held }) : (data.unitName ? data.unitName(uid) : uid);
      if (s && s.length > 26 && tid) {
        const t = data.byId ? data.byId.get(tid) : null;
        const alt = t && t.shortName;
        if (alt && alt.length < s.length && old.dateable(tid, alt, y) !== false) s = alt;
      }
      return s && s.length <= 30 ? s : (s ? s.slice(0, 27).replace(/\s\S*$/, '') + '…' : null);
    };
    const oldGroup = (tid, units, y) => {
      const p = old.periodName(tid, y);
      const t = data.byId && data.byId.get(tid);
      let s = (p && p.picked && p.name) || null;
      if (!s && p && p.name && !p.dead) s = p.name;
      if (!s && p && p.successor) s = p.successor;
      if (!s) { const alt = t && (t.shortName || t.name); s = alt && old.dateable(tid, alt, y) !== false ? alt : null; }
      if (!s) return null;
      if (s.length > 30) { const alt = t && t.shortName; if (alt && old.dateable(tid, alt, y) !== false) s = alt; }
      return s.length <= 30 ? s : s.slice(0, 27).replace(/\s\S*$/, '') + '…';
    };

    const terr = new Map(), dated = new Map();
    for (const t of data.territories || []) {
      const names = (t.namesOverTime || []).filter((n) => n && n.name).map((n) => ({
        name: n.name, from: yearOf(n.from), to: yearOf(n.to), usedBy: n.usedBy || '', language: n.language || '' }));
      for (const n of names) for (const part of [n.name, ...String(n.name).split(' / ')]) {
        const k = norm(part); if (!k) continue;
        if (!dated.has(k)) dated.set(k, []); dated.get(k).push({ from: n.from, to: n.to });
      }
      let last = null;
      for (const s of t.spans || []) { const b = yearOf(s.end);
        if (b == null) last = Infinity; else if (last !== Infinity) last = last == null ? b : Math.max(last, b); }
      terr.set(t.id, { t, names, last });
    }
    /* A NAME CUT WITH AN ELLIPSIS IS THE SAME NAME, SHORTER. "The Southern
       Provinces,…" is the head of a string the dataset dates to the year; the
       sweep must not report the plate for the plate's own truncation. */
    const dateable = (name, y) => {
      const k = norm(String(name).replace(/…$/, ''));
      let recs = dated.get(k);
      if (!recs && /…/.test(String(name)) && k.length >= 12) {
        recs = [];
        for (const [key, list] of dated) if (key.startsWith(k)) recs.push(...list);
        if (!recs.length) recs = null;
      }
      if (!recs || !recs.length) return null;
      return recs.some((x) => (x.from == null || y >= x.from) && (x.to == null || y <= x.to)); };
    const titleDead = (tid, name, y) => { const rc = terr.get(tid); if (!rc) return false;
      if (rc.last == null || rc.last === Infinity || y <= rc.last) return false;
      return rc.names.some((n) => n.usedBy === 'modern' && norm(n.name) !== norm(name)
        && (n.from == null || y >= n.from) && (n.to == null || y <= n.to)); };
    const alive = (tid, y) => { const rc = terr.get(tid); if (!rc) return null;
      const hit = rc.names.filter((n) => (n.from == null || y >= n.from) && (n.to == null || y <= n.to));
      return hit.length ? hit.map((n) => n.name + ' [' + n.usedBy + ']').join(' / ') : null; };

    const changes = new Map(), anach = [], dup = [], seen = new Set();
    let printed = 0;
    for (let y = 1580; y <= 2026; y++) {
      let paint; try { paint = mod._paintFor(y); } catch (e) { continue; }
      const groups = new Map(), byTid = new Map();
      for (const [uid, rec] of paint) {
        const tid = mod._tidFor(uid, rec); if (!tid) continue;
        if (!groups.has(tid)) groups.set(tid, []); groups.get(tid).push(uid);
        const a = oldName(uid, rec, y), b = mod._plateName(uid, rec, y);
        if (String(a || '') !== String(b || '')) {
          const k = tid + ' unit  ' + (a || '(nothing)') + '  ->  ' + (b || '(nothing)');
          if (!changes.has(k)) changes.set(k, { first: y, last: y, n: 0 });
          const c = changes.get(k); c.n++; c.last = y;
        }
        if (b) {
          printed++;
          const ghost = !!(rec && rec.lost);
          const clean = String(b), d = dateable(clean, y), rc = terr.get(tid);
          if (d === false && !ghost) { const k = 'A|' + tid + '|' + norm(clean); if (!seen.has(k)) { seen.add(k); anach.push({ cls: 'A', y, tid, uid, txt: b, lost: !!rec.lost, alive: alive(tid, y) }); } }
          else if (d === null && !ghost && rc && norm(clean) === norm(rc.t.name) && titleDead(tid, clean, y)) {
            const k = 'B|' + tid + '|' + norm(clean); if (!seen.has(k)) { seen.add(k); anach.push({ cls: 'B', y, tid, uid, txt: b, lost: !!rec.lost, alive: alive(tid, y) }); } }
          const own = data.unitName ? data.unitName(uid) : uid;
          if (!byTid.has(tid)) byTid.set(tid, []);
          byTid.get(tid).push({ txt: b, borrowed: norm(b) !== norm(own) });
        }
      }
      for (const [tid, list] of byTid) {
        const strings = [...new Set(list.map((r) => norm(r.txt)))];
        if (strings.length < 2 || !list.some((r) => r.borrowed)) continue;
        const k = 'C|' + tid + '|' + strings.sort().join('+'); if (seen.has(k)) continue; seen.add(k);
        dup.push({ y, tid, texts: [...new Set(list.map((r) => r.txt + (r.borrowed ? '*' : '')))] });
      }
      for (const [tid, units] of groups) {
        if (units.length < 2) continue;
        const gGhost = units.every((u) => { const r = paint.get(u); return r && r.lost; });
        const a = oldGroup(tid, units, y), b = mod._plateGroupName(tid, units, y);
        if (String(a || '') !== String(b || '')) {
          const k = tid + ' group ' + (a || '(nothing)') + '  ->  ' + (b || '(nothing)');
          if (!changes.has(k)) changes.set(k, { first: y, last: y, n: 0 });
          const c = changes.get(k); c.n++; c.last = y;
        }
        if (b && !gGhost) { printed++;
          const clean = String(b), d = dateable(clean, y), rc = terr.get(tid);
          if (d === false) { const k = 'A|' + tid + '|g|' + norm(clean); if (!seen.has(k)) { seen.add(k); anach.push({ cls: 'A', y, tid, uid: 'group', txt: b, alive: alive(tid, y) }); } }
          else if (d === null && rc && norm(clean) === norm(rc.t.name) && titleDead(tid, clean, y)) {
            const k = 'B|' + tid + '|g|' + norm(clean); if (!seen.has(k)) { seen.add(k); anach.push({ cls: 'B', y, tid, uid: 'group', txt: b, alive: alive(tid, y) }); } }
        }
      }
    }
    const dbg = [];
    { const k = 'southernprovinces';
      for (const [key, list] of dated) if (key.startsWith(k)) dbg.push(key + ' ' + JSON.stringify(list));
      dbg.push('exact ' + JSON.stringify(dated.get(k) || null)); }
    return { changes: [...changes.entries()].map(([k, v]) => ({ k, ...v })).sort((a, b) => a.first - b.first),
      anach, dup, printed };
  }, { oldSrc });

  log('names printed across 447 years: ' + res.printed);
  log('A/B ANACHRONISTIC LABELS (round 9 classes, must stay 0): ' + res.anach.length);
  for (const f of res.anach) log('   * [' + f.cls + '] ' + f.y + ' ' + f.tid + ' [' + f.uid + ']' + (f.lost ? ' GHOST' : ' HELD') + ' prints "' + f.txt + '" | dataset holds: ' + (f.alive || 'nothing'));
  log('C ONE TERRITORY, TWO NAMES IN ONE FRAME: ' + res.dup.length);
  for (const f of res.dup) log('   * ' + f.y + ' ' + f.tid + ' ' + JSON.stringify(f.texts));
  log('STRINGS THIS PASS CHANGES: ' + res.changes.length);
  for (const c of res.changes) log('   ~ ' + c.first + '-' + c.last + ' (' + c.n + ' yr) ' + c.k);
};
