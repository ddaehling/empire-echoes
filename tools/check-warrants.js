#!/usr/bin/env node
/**
 * check-warrants.js — every printed quantity, and the record that warrants it.
 *
 * The historian's round-5 note: testimony.js enforces "no check, no entry" on
 * its 43 primary texts and viz/content.js runtime-warrants its chart figures,
 * but the numbers a student meets on the path have neither. This is the audit
 * side of the answer. It loads app/js/core/warrant.js — the same module the
 * browser runs, through a data: URL, because tools/ is CommonJS — and reports
 * every quantity in the dataset as ok, weak or bare.
 *
 *   ok    author, work, year, the specific claim, AND where to look
 *   weak  warranted, but no `check` line
 *   bare  no warrant. The dossier prints the figure with a defect in --danger.
 *
 * Usage: node tools/check-warrants.js [--json] [--bare] [--ok]
 * Exported `audit()` is used by tools/validate-data.js, which reports the
 * counts rather than failing on them: an unwarranted figure is a debt this
 * atlas admits in public, not a build break. It fails only if the count of
 * warranted figures goes DOWN — see --floor.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TERRITORY_DIR = path.join(ROOT, 'app', 'data', 'territories');
const WARRANT = path.join(ROOT, 'app', 'js', 'core', 'warrant.js');

/* A RATCHET, NOT A TARGET.
 *
 * The number of warranted quantities at the end of the last wave. A later wave
 * may only raise it. If this file says 364 and the audit says 300, somebody
 * deleted a citation and the build says so.
 *
 * ROUND 6 raised it from 40 to 223, promoting 161 populations and 22 tolls out
 * of notes that already named the census or the historian behind them.
 *
 * ROUND 7 raised it to 390, and the 157 new warrants came from two places,
 * neither of them memory:
 *
 *    76 areas    THE ATLAS MEASURED ITS OWN MAP. Round 6 left all 256 area
 *                figures bare and said, correctly, that no area figure in this
 *                dataset carries any statement of where it came from. But this
 *                atlas DRAWS these territories, out of a geography it built and
 *                measured itself: app/data/geo/units.index.json carries an
 *                area_km2 per map unit, computed by tools/build-geo.js from
 *                Natural Earth 1:10m boundaries. So for each territory the units
 *                its own geoCoverage says it held in its own areaYear were
 *                summed and compared with the figure printed. Where the two
 *                agree within 5%, the reader gets something better than a
 *                citation — a measurement they can repeat on the map in front of
 *                them. 76 of 251 agree. See tools/onetime/warrant-areas.js.
 *    81 tolls    PROMOTED OUT OF THE RECORD'S OWN NOTE, one at a time, in two
 *                reviewable tables: tools/onetime/warrant-tolls.js took every
 *                toll whose note named a producer, and warrant-tolls-2.js took
 *                THE TOLLS A STUDENT ACTUALLY MEETS — the twenty of
 *                DIDACTIC_SPEC §3 and the entries the default route stops at:
 *                Ireland, Jamaica, Barbados, Virginia, Bengal, Egypt,
 *                Palestine, Mesopotamia, Punjab, Mauritius, South Africa. Every one
 *                names a producer the note already named — Kitchener's burial
 *                parties, the Chalmers commission, the Aba commission of
 *                inquiry, the Book of Negroes, the Sunderlal report, the ships'
 *                returns of the Acadian deportations, the Jamaican slave
 *                registers. Most are not histories: they are the records of the
 *                side doing the counting, and usually of the side doing the
 *                killing, which is why each carries a note saying so.
 *
 * ZERO IS NOT AN ESTIMATE. Fifteen quantities left the denominator this round,
 * not the numerator: ten peak populations of 0 and five areas of 0, every one
 * of them a record stating that Britain governed nobody and no ground — "the
 * zeroes are deliberate: informal empire has no area and no population". There
 * is no counter to name for the absence of a count. core/warrant.js states the
 * rule and tools/check-path-numbers.js already exempted "£0" in the same words.
 *
 * WHAT IS STILL BARE, AND WHY IT IS LEFT THAT WAY.
 *   175 areas        the map cannot check these: a fort or factory whose
 *                    areaKm2 is its own footprint (Cape Coast Castle, 0.02 km²)
 *                    sits inside a map unit that is a whole coastal province,
 *                    so the two are not measuring the same thing. The number
 *                    came from somewhere this atlas cannot name.
 *    76 tolls        their notes explain the range and name nobody — "nobody
 *                    counted", "no count was kept", "the figures are
 *                    reconstructions". Several say so because that IS the
 *                    finding, and inventing a citation for them would be the
 *                    exact failure this module exists to prevent.
 *    47 populations  their notes say the count was never made.
 *
 * PER-CLASS FLOORS exist because one class can collapse while the total rises.
 */
const FLOOR = 390;
const KIND_FLOOR = { toll: 143, population: 161, area: 76, path: 6 };

async function loadWarrant() {
  const src = fs.readFileSync(WARRANT, 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
}

function loadTerritories() {
  const out = [];
  for (const f of fs.readdirSync(TERRITORY_DIR)) {
    if (!f.endsWith('.json') || f === 'index.json' || f.startsWith('_')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(TERRITORY_DIR, f), 'utf8'));
    for (const t of d.territories || []) out.push(t);
  }
  return out;
}

/* THE PATH'S OWN FIGURES, HELD TO THE SAME RULE.
 *
 * The dataset is not the only place this app prints a quantity. The guided path
 * prints its own, and until round 6 it printed them as typed strings — which is
 * how beat 6 came to print the Bengal famine of 1769–70 as "between seven and
 * ten million" while this dataset's own record said "between roughly one and
 * ten million… contemporary estimates were political documents". The path now
 * registers each figure in app/js/tours/figures.json and writes a token in the
 * prose. That file belongs to the path piece; this audit only READS it, and
 * runs the identical contract over it, so a figure a student meets on the
 * default route is counted in the same total as one in a dossier. If the file
 * is absent the audit says so and moves on. */
const PATH_FIGURES = path.join(ROOT, 'app', 'js', 'tours', 'figures.json');

function loadPathFigures() {
  if (!fs.existsSync(PATH_FIGURES)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(PATH_FIGURES, 'utf8'));
    const figs = d.figures || d;
    const out = [];
    for (const [id, f] of Object.entries(figs)) {
      if (!f || typeof f !== 'object' || !('value' in f)) continue;
      out.push({ id, warrant: f.warrant, hasDispute: !!f.dispute, hasReason: !!f.rangeReason });
    }
    return out;
  } catch (e) { return { error: String((e && e.message) || e) }; }
}

async function audit() {
  const W = await loadWarrant();
  const r = W.auditWarrants(loadTerritories());
  const pf = loadPathFigures();
  const pathRows = [];
  if (Array.isArray(pf)) {
    for (const f of pf) {
      const read = W.readWarrant(f.warrant);
      pathRows.push({ of: 'tours/figures.json#' + f.id, kind: 'path', status: read.status, missing: read.missing });
    }
    r.rows.push(...pathRows);
    r.total += pathRows.length;
    for (const row of pathRows) r[row.status] = (r[row.status] || 0) + 1;
  }
  const byKind = {};
  for (const row of r.rows) {
    byKind[row.kind] = byKind[row.kind] || { total: 0, ok: 0, weak: 0, bare: 0 };
    byKind[row.kind].total++;
    byKind[row.kind][row.status]++;
  }
  const warranted = r.ok + r.weak;
  const kindBelow = [];
  for (const [k, min] of Object.entries(KIND_FLOOR)) {
    const got = byKind[k] ? byKind[k].ok + byKind[k].weak : 0;
    if (got < min) kindBelow.push({ kind: k, got, floor: min });
  }
  return { ...r, byKind, pathFigures: Array.isArray(pf) ? pf.length : 0,
    pathMissing: !pf ? 'app/js/tours/figures.json is not present' : (pf && pf.error) || null,
    floor: FLOOR, kindFloor: KIND_FLOOR, kindBelow,
    warranted, belowFloor: warranted < FLOOR || kindBelow.length > 0 };
}

module.exports = { audit, FLOOR, KIND_FLOOR };

if (require.main === module) {
  const argv = process.argv.slice(2);
  audit().then((r) => {
    if (argv.includes('--json')) { process.stdout.write(JSON.stringify(r, null, 2) + '\n'); return; }
    process.stdout.write('warrant audit — ' + r.total + ' printed quantities: the dataset, and the path\u2019s own figures\n');
    process.stdout.write('  ok    ' + String(r.ok).padStart(4) + '   source, claim and where to look\n');
    process.stdout.write('  weak  ' + String(r.weak).padStart(4) + '   source and claim, no check line\n');
    process.stdout.write('  bare  ' + String(r.bare).padStart(4) + '   no warrant — prints a defect marker\n\n');
    for (const [k, v] of Object.entries(r.byKind)) {
      process.stdout.write('  ' + k.padEnd(12) + String(v.total).padStart(4) + ' total   ' + String(v.ok + v.weak).padStart(4) + ' warranted   ' + String(v.bare).padStart(4) + ' bare\n');
    }
    if (r.pathMissing) process.stdout.write('\n  note  ' + r.pathMissing + ' — the guided path\u2019s own figures were not audited.\n');
    for (const b of r.kindBelow) {
      process.stdout.write('  FAIL  ' + b.kind + ': ' + b.got + ' warranted, floor ' + b.floor + ' — a citation has been removed from this class.\n');
    }
    if (argv.includes('--bare')) { process.stdout.write('\nBARE\n'); for (const row of r.rows) if (row.status === 'bare') process.stdout.write('  ' + row.of + '\n'); }
    if (argv.includes('--ok')) { process.stdout.write('\nWARRANTED\n'); for (const row of r.rows) if (row.status !== 'bare') process.stdout.write('  ' + row.status + '  ' + row.of + '\n'); }
    process.stdout.write('\n' + (r.belowFloor
      ? 'FAIL — ' + r.warranted + ' warranted, below the floor of ' + r.floor + ': a citation has been removed.\n'
      : r.warranted + ' warranted, floor ' + r.floor + '. ' + r.bare + ' figures still print a defect.\n'));
    process.exit(r.belowFloor ? 1 : 0);
  }).catch((e) => { process.stderr.write((e && e.stack) || String(e)); process.exit(2); });
}
