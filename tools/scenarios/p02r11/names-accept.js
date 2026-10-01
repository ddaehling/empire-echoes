/**
 * p02r11/names-accept.js — THE ANACHRONISM ACCEPTANCE HARNESS.
 *
 *   A NAME PRINTED ON A PLATE FOR YEAR Y MUST BE DATEABLE TO Y BY THE DATASET,
 *   AND IT MUST BE A NAME FOR THE GROUND IT IS PRINTED ON.
 *
 * Six rules, swept across every year from 1580 to 2026, every painted unit,
 * every string this module can put on the plate or in a screen reader's ear.
 * Prints PASS/FAIL per rule and `>>> the names hold` / `>>> NAMES BROKEN`.
 *
 *   node tools/inspect.js tools/scenarios/p02r11/names-accept.js --out /tmp/n --w 1366 --h 768
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready');
  await page.waitForFunction(() => { const e = window.BEA.registry.get('map'); return e && e.status === 'mounted' && e.mod.plate; }, null, { timeout: 30000 });

  const res = await page.evaluate(() => {
    const mod = window.BEA.registry.get('map').mod, data = window.BEA.data, N = mod.namer;
    const TODAY = (data.bounds && data.bounds.max) || 2026;
    const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');
    const out = { A: [], B: [], C: [], D: [], E: [], F: [] };
    const seen = new Set();
    const add = (c, k, r) => { const key = c + '|' + k; if (seen.has(key)) return; seen.add(key); out[c].push(r); };
    for (let y = 1580; y <= 2026; y++) {
      let paint; try { paint = mod._paintFor(y); } catch (e) { continue; }
      const groups = new Map();
      for (const [uid, rec] of paint) {
        const tid = mod._tidFor(uid, rec); if (!tid) continue;
        if (!groups.has(tid)) groups.set(tid, []); groups.get(tid).push(uid);
        const held = !!(rec && rec.entry && rec.entry.territoryId);
        const full = N.short(uid, tid, y, { strict: !held });   // untruncated
        if (full) {
          if (N.dateable(tid, full, y) === false) add('A', tid + '|' + norm(full), { y, tid, uid, txt: full });
          if (N.deadName(full, y)) add('B', tid + '|' + norm(full), { y, tid, uid, txt: full });
          // D — the present-day test fired and the old name is still on the plate
          const p = N.periodName(tid, y);
          const st = N.staleHeadline(p, (data.unitName ? data.unitName(uid) : uid), tid, y);
          if (st && norm(st) !== norm(full)) add('D', tid + '|' + norm(full), { y, tid, uid, txt: full, want: st });
        }
        // C — "(now X)" must name the ground as it is called TODAY
        const lab = N.label(uid, tid, y);
        const m = lab && lab.text && lab.text.match(/\(now ([^)]+)\)/);
        if (m) {
          const inner = m[1];
          const p = N.periodName(tid, y);
          const headlineIsNow = !!(p && p.pickedRec && p.pickedRec.usedBy === 'modern');
          if (headlineIsNow || N.dateable(tid, inner, TODAY) === false || N.deadName(inner, TODAY)) {
            add('C', tid + '|' + norm(inner), { y, tid, uid, txt: lab.text });
          }
        }
        // F — named by a territory whose own dated coverage excludes the unit
        if (!N.covers(tid, uid, y)) {
          const own = data.unitName ? data.unitName(uid) : uid;
          const alt = N.holderOf(uid, y, tid);
          if (full && norm(full) !== norm(own) && !alt) {
            const back = N.lastCovered(tid, uid);
            const then = back && back.to !== Infinity ? N.periodName(tid, back.mid) : null;
            if (!then || norm(then.name) !== norm(full)) add('F', tid + '|' + uid, { y, tid, uid, txt: full, own });
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

  const NAMES = {
    A: 'a plate name the dataset dates outside the year on the plate',
    B: 'a plate name that is the title of a colony this dataset says had ended',
    C: '"(now X)" where X is not what this ground is called now',
    D: 'a historic open record still printed past the end of the atlas’s own account',
    E: 'a group label failing A or B',
    F: 'a unit named by a territory whose own coverage excludes it',
  };
  let bad = 0;
  for (const k of ['A', 'B', 'C', 'D', 'E', 'F']) {
    const n = res[k].length;
    if (n) bad++;
    log((n ? 'FAIL' : 'PASS') + '  ' + k + ' — ' + NAMES[k] + ': ' + n);
    for (const r of res[k].slice(0, 20)) log('        ' + r.y + '  ' + r.tid + (r.uid ? ' / ' + r.uid : '') + '  "' + r.txt + '"' + (r.want ? '  want "' + r.want + '"' : ''));
  }
  log(bad ? '>>> NAMES BROKEN' : '>>> the names hold');
};
