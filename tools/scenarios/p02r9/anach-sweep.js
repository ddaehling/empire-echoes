/**
 * p02r9/anach-sweep.js — THE ANACHRONISM SWEEP.
 *
 * The rule this file asserts, in one line:
 *
 *   A NAME PRINTED ON A PLATE FOR YEAR Y MUST BE DATEABLE TO Y BY THE DATASET.
 *
 * It walks every year from 1580 to 2026, asks the map for every unit it would
 * paint in that year, asks the plate what it would print over each of them,
 * and then asks the dataset whether that string was in use. A string the
 * dataset dates, printed outside its dates, is a finding. So is a territory's
 * own title printed in a year the dataset says the territory was over, when
 * the dataset holds a name for that year and the plate did not use it.
 *
 * `--mode before` runs the naming code as it stood before this pass (an exact
 * copy of app/js/map/names.js and of the two lambdas that called it, in
 * names-before.js.txt and inline below), so the count is a measurement of the
 * defect and not of my opinion about it.
 *
 *   node tools/inspect.js tools/scenarios/p02r9/anach-sweep.js --out /tmp/a-before --w 1366 --h 768 --before
 *   node tools/inspect.js tools/scenarios/p02r9/anach-sweep.js --out /tmp/a-after  --w 1366 --h 768
 */
const fs = require('fs'), path = require('path');
const BEFORE = process.argv.includes('--before');

module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });

  const beforeSrc = fs.readFileSync(path.join(__dirname, 'names-before.js.txt'), 'utf8')
    .replace(/^export default[\s\S]*$/m, '').replace(/^export\s+/gm, '');

  const res = await page.evaluate(({ beforeSrc, BEFORE }) => {
    const mod = window.BEA.registry.get('map').mod;
    const data = window.BEA.data;

    /* ---- the namer under test ------------------------------------------ */
    let nameOf, groupOf, oldName, oldGroup;
    {
      // eslint-disable-next-line no-new-func
      const makeNamer = new Function(beforeSrc + '; return makeNamer;')();
      const namer = makeNamer(data);
      oldName = (uid, rec, y) => {                       // verbatim: the old plate.labelText
        const held = !!(rec && rec.entry && rec.entry.territoryId);
        const tid = mod._tidFor(uid, rec);
        let s = tid ? namer.short(uid, tid, y, { strict: !held }) : (data.unitName ? data.unitName(uid) : uid);
        if (s && s.length > 26) {
          const t = tid && data.byId ? data.byId.get(tid) : null;
          const alt = t && t.shortName;
          if (alt && alt.length < s.length) s = alt;
        }
        return s && s.length <= 30 ? s : (s ? s.slice(0, 27).replace(/\s\S*$/, '') + '…' : null);
      };
      oldGroup = (tid, units, y) => {                    // verbatim: the old plate.groupLabel
        const p = namer.periodName(tid, y);
        const t = data.byId && data.byId.get(tid);
        let s = (p && p.name) || (t && (t.shortName || t.name)) || null;
        if (!s) return null;
        if (s.length > 30) s = (t && t.shortName) || s;
        return s.length <= 30 ? s : s.slice(0, 27).replace(/\s\S*$/, '') + '…';
      };
    }
    const newName = (uid, rec, y) => mod._plateName(uid, rec, y);
    const newGroup = (tid, units, y) => mod._plateGroupName(tid, units, y);
    nameOf = BEFORE ? oldName : newName;
    groupOf = BEFORE ? oldGroup : newGroup;

    /* ---- the dataset's own dates, read once ----------------------------- */
    const yearOf = (v) => {
      if (v == null) return null;
      const raw = typeof v === 'object' ? (v.value != null ? v.value : v.display) : v;
      const m = String(raw == null ? '' : raw).match(/-?\d{3,4}/);
      return m ? Number(m[0]) : null;
    };
    const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');
    const dated = new Map();      // normalised name -> [{from,to}] anywhere in the dataset
    const terr = new Map();
    for (const t of data.territories || []) {
      const names = (t.namesOverTime || []).filter((n) => n && n.name).map((n) => ({
        name: n.name, from: yearOf(n.from), to: yearOf(n.to), usedBy: n.usedBy || '', language: n.language || '',
      }));
      for (const n of names) {
        // A slash list is a list of names: "Mauritius / Maurice / Moris" dates
        // the word Mauritius from 1810, and indexing only the whole string
        // left it dated solely by the Dutch record that ends in 1715.
        for (const part of [n.name, ...String(n.name).split(' / ')]) {
          const k = norm(part);
          if (!k) continue;
          if (!dated.has(k)) dated.set(k, []);
          dated.get(k).push({ from: n.from, to: n.to });
        }
      }
      let last = null, first = null;
      for (const s of t.spans || []) {
        const a = yearOf(s.start), b = yearOf(s.end);
        if (a != null) first = first == null ? a : Math.min(first, a);
        if (b == null) last = Infinity; else if (last !== Infinity) last = last == null ? b : Math.max(last, b);
      }
      terr.set(t.id, { t, names, last, first });
    }
    /* true / false / null — "the dataset dates this string and Y is inside it",
       "…and Y is outside it", "the dataset does not date this string at all". */
    const dateable = (name, y) => {
      const recs = dated.get(norm(name));
      if (!recs || !recs.length) return null;
      return recs.some((r) => (r.from == null || y >= r.from) && (r.to == null || y <= r.to));
    };
    /* is there a name the dataset DOES date to Y for this territory? */
    const alive = (tid, y) => {
      const rc = terr.get(tid); if (!rc) return null;
      const hit = rc.names.filter((n) => (n.from == null || y >= n.from) && (n.to == null || y <= n.to));
      return hit.length ? hit.map((n) => n.name + ' [' + n.usedBy + ']').join(' / ') : null;
    };
    /* THE STRONG TEST, AND WHY IT IS NOT "the territory's span has ended".
       A colony ending is not a name dying. Bhutan, Qatar, Sikkim and Sarawak
       are all still called that; flagging them would be flagging the dataset
       for being a history of the British Empire. A TITLE is anachronistic only
       when the territory it files is over AND the same record holds a
       different name for the year on the plate — which is exactly the Cape
       Colony case, and exactly what map/names.js#deadName tests. */
    const titleDead = (tid, name, y) => {
      const rc = terr.get(tid); if (!rc) return false;
      if (rc.last == null || rc.last === Infinity || y <= rc.last) return false;
      // …and the alternative has to be the name the ground has NOW. Anything
      // weaker flags Bhutan, Qatar, Kuwait and the Bahamas for still being
      // called that: a colony ending is not a name dying.
      return rc.names.some((n) => n.usedBy === 'modern' && norm(n.name) !== norm(name)
        && (n.from == null || y >= n.from) && (n.to == null || y <= n.to));
    };

    const findings = [];
    const seen = new Set();
    const add = (cls, y, tid, uid, txt, path) => {
      const k = cls + '|' + tid + '|' + norm(txt) + '|' + path;
      if (seen.has(k)) return;
      seen.add(k);
      findings.push({ cls, y, tid, uid, txt, path, alive: alive(tid, y) });
    };
    let printedTotal = 0;
    const changes = new Map();       // "before -> after" -> {n, first, tid}
    const noteChange = (a, b, y, tid, path) => {
      if (String(a || '') === String(b || '')) return;
      const k = (a || '(nothing)') + '  ->  ' + (b || '(nothing)');
      if (!changes.has(k)) changes.set(k, { n: 0, first: y, last: y, tid, path });
      const c = changes.get(k); c.n++; c.last = y;
    };
    for (let y = 1580; y <= 2026; y++) {
      let paint;
      try { paint = mod._paintFor(y); } catch (e) { continue; }
      const groups = new Map();
      for (const [uid, rec] of paint) {
        const tid = mod._tidFor(uid, rec);
        if (!tid) continue;
        if (!groups.has(tid)) groups.set(tid, []);
        groups.get(tid).push(uid);
        const txt = nameOf(uid, rec, y);
        noteChange(oldName(uid, rec, y), newName(uid, rec, y), y, tid, 'unit');
        if (!txt) continue;
        printedTotal++;
        const clean = String(txt).replace(/…$/, '');
        const d = dateable(clean, y);
        const rc = terr.get(tid);
        if (d === false) add('A · dated name printed outside its dates', y, tid, uid, txt, 'unit');
        else if (d === null && rc && norm(clean) === norm(rc.t.name) && titleDead(tid, clean, y))
          add('B · dead territory title, where the record holds a name for that year', y, tid, uid, txt, 'unit');
      }
      for (const [tid, units] of groups) {
        if (units.length < 2) continue;
        const txt = groupOf(tid, units, y);
        noteChange(oldGroup(tid, units, y), newGroup(tid, units, y), y, tid, 'group');
        if (!txt) continue;
        printedTotal++;
        const clean = String(txt).replace(/…$/, '');
        const d = dateable(clean, y);
        const rc = terr.get(tid);
        if (d === false) add('A · dated name printed outside its dates', y, tid, null, txt, 'group');
        else if (d === null && rc && norm(clean) === norm(rc.t.name) && titleDead(tid, clean, y))
          add('B · dead territory title, where the record holds a name for that year', y, tid, null, txt, 'group');
      }
    }
    const byClass = {};
    for (const f of findings) byClass[f.cls] = (byClass[f.cls] || 0) + 1;
    const changed = [...changes.entries()].map(([k, v]) => ({ k, ...v })).sort((a, b) => a.first - b.first);
    return { findings, byClass, printedTotal, changed, mode: BEFORE ? 'before' : 'after' };
  }, { beforeSrc, BEFORE });

  log('MODE: ' + res.mode + '   names printed across 447 years: ' + res.printedTotal);
  log('DISTINCT ANACHRONISTIC LABELS: ' + res.findings.length);
  for (const k of Object.keys(res.byClass)) log('   ' + k + ': ' + res.byClass[k]);
  log('LABELS THIS PASS CHANGES: ' + res.changed.length + ' distinct strings');
  for (const c of res.changed) log('   ~ ' + String(c.first) + '-' + String(c.last) + ' ' + c.path.padEnd(5) + ' ' + c.tid + '   ' + c.k);
  for (const f of res.findings) {
    log(' * [' + f.cls.slice(0, 1) + '] ' + f.y + '  ' + f.path.padEnd(5) + '  ' + f.tid + (f.uid ? ' [' + f.uid + ']' : '') + '  prints "' + f.txt + '"'
      + '  | dataset holds for that year: ' + (f.alive || 'nothing'));
  }
};
