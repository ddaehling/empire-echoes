#!/usr/bin/env node
/**
 * tools/audit-timeline.js — the reality check on the dataset.
 *
 * For a list of snapshot years it answers, from the data alone:
 *   how many territories were British that year, how much land they covered,
 *   and what changed since the previous snapshot.
 *
 * The point is falsifiability. Everyone "knows" the empire peaked around 1920
 * at roughly a quarter of the world's land. If this dataset says something
 * wildly different, the dataset is wrong, and this tool says where.
 *
 * Land area comes from app/data/geo/units.index.json (area_km2 per unit), so a
 * territory's area is the sum of the units it covered in that year. A unit
 * claimed by two territories at once (a princely state inside British India)
 * is counted ONCE — see dedupe below — otherwise the empire looks twice its
 * real size. Coverage marked `partial` is discounted (see PARTIAL_WEIGHT).
 *
 *   node tools/audit-timeline.js                     the canonical snapshot years
 *   node tools/audit-timeline.js --years 1700,1900   your own
 *   node tools/audit-timeline.js --annual 1600 2026  every year (for charting)
 *   node tools/audit-timeline.js --json              machine-readable
 *   node tools/audit-timeline.js --year 1921 --list  what was held that year
 *   node tools/audit-timeline.js --check             non-zero exit if a sanity band fails
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TERR = path.join(ROOT, 'app', 'data', 'territories');
const GEO = path.join(ROOT, 'app', 'data', 'geo', 'units.index.json');

// 1982 and 1986 are in this list on purpose: the Canada Act (1982), the Australia Act (1986) and
// New Zealand's Constitution Act (1986) sever the last UK legislative authority over the old
// dominions, and they account for ~16.2m km2. Sampling 1980 then 1997 hides that and makes the
// fall look like a cliff caused by Hong Kong, which is a lie about how the empire actually ended.
const CANONICAL_YEARS = [1600, 1650, 1700, 1750, 1783, 1815, 1850, 1877, 1900, 1914, 1922, 1939, 1947, 1960, 1968, 1980, 1982, 1986, 1997, 2026];

// Earth's land surface excluding Antarctica, the figure school atlases use.
const WORLD_LAND_KM2 = 134_000_000;
// A coverage period may flag a unit `partial`: Britain held part of that unit's
// modern outline (the St Lawrence strip of Quebec in 1763, coastal Saint-Domingue).
// Counting the whole unit would inflate the empire; counting none would erase it.
const PARTIAL_WEIGHT = 0.5;
// Two different true answers, reported side by side rather than blended:
//   EXTENT  — what a pink map of that year showed. Includes the rebel American
//             colonies in 1776-83 and the dominions after the Statute of Westminster,
//             because those were still coloured British.
//   RULE    — where Britain actually gave orders: controlDegree 4 or 5.
// Collapsing them is how the "solid pink block" myth survives.
const DIRECT_RULE_DEGREE = 4;

/* ---------------------------------------------------------------- dates --- */
/** First instant a histDate can mean, as a comparable number YYYYMMDD. */
function startNum(v) {
  if (typeof v !== 'string') return null;
  const m = /^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(v.trim());
  if (!m) return null;
  const y = Number(m[1]);
  return y * 10000 + Number(m[2] || 1) * 100 + Number(m[3] || 1);
}
const dStart = (d) => (d && d.value ? startNum(d.value) : null);
/**
 * When a period ENDS on a contested date ("Canada stopped being British somewhere
 * between 1931 and 1982"), an extent map should keep it until the latest defensible
 * end — that is why Canada is pink on a 1939 map. `--contested-early` flips it.
 */
let CONTESTED_EARLY = process.argv.includes('--contested-early');
const dEndOf = (d) => {
  if (!d) return Infinity;
  if (!CONTESTED_EARLY && d.end) return startNum(d.end);
  return dStart(d);
};
const YEAR = (y) => y * 10000 + 701; // 1 July: mid-year, so a colony gained in March counts

/* ---------------------------------------------------------------- load ---- */
function loadShards() {
  const files = fs.readdirSync(TERR)
    .filter((f) => f.endsWith('.json') && f !== 'index.json' && f !== 'manifest.json' && !f.startsWith('_'))
    .sort();
  const territories = [];
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(TERR, f), 'utf8'));
    for (const t of d.territories || []) territories.push({ ...t, _shard: f.replace(/\.json$/, '') });
  }
  return territories;
}
function loadAreas() {
  const idx = JSON.parse(fs.readFileSync(GEO, 'utf8'));
  const arr = Array.isArray(idx) ? idx : idx.units || [];
  const m = new Map();
  for (const u of arr) m.set(u.id, Number(u.area_km2) || 0);
  return m;
}

/* ------------------------------------------------------------- snapshot --- */
/**
 * What was British at instant `when`.
 * Returns { territories:[{id,name,region,status,degree,units:Map<unit,weight>}], units:Map }
 */
function snapshot(territories, when) {
  const held = [];
  for (const t of territories) {
    // The status period in force. It, not geoCoverage, decides whether this was British.
    const sp = (t.statusPeriods || []).find((p) => {
      const s = dStart(p.from);
      const e = p.to ? dEndOf(p.to) : Infinity;
      return s !== null && when >= s && when < e;
    });
    if (!sp) continue;
    const degree = sp.controlDegree === undefined ? null : sp.controlDegree;

    const cov = (t.geoCoverage || []).find((c) => {
      const s = dStart(c.from);
      const e = c.to ? dEndOf(c.to) : Infinity;
      return s !== null && when >= s && when < e;
    });
    const units = new Map();
    if (cov) {
      const partial = new Set(cov.partial || []);
      for (const u of cov.units || []) units.set(u, partial.has(u) ? PARTIAL_WEIGHT : 1);
    }
    held.push({ id: t.id, name: t.name, region: t.region, shard: t._shard, status: sp.status, degree, units, nestedWithin: t.nestedWithin });
  }
  return held;
}

/**
 * Sum land area without double-counting. A unit claimed by several territories at
 * once counts once, at the highest weight anyone claims (a whole claim beats a partial).
 */
function areaOf(held, areas) {
  const best = new Map();
  for (const h of held) {
    for (const [u, w] of h.units) {
      if (!best.has(u) || best.get(u) < w) best.set(u, w);
    }
  }
  let km2 = 0;
  const missing = [];
  for (const [u, w] of best) {
    const a = areas.get(u);
    if (a === undefined) { missing.push(u); continue; }
    km2 += a * w;
  }
  return { km2, units: best.size, missing };
}

/* ----------------------------------------------------------------- CLI ---- */
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const territories = loadShards();
const areas = loadAreas();

let years = CANONICAL_YEARS;
if (flag('--years')) years = val('--years', '').split(',').map((s) => Number(s.trim())).filter(Boolean);
if (flag('--annual')) {
  const i = argv.indexOf('--annual');
  const a = Number(argv[i + 1]) || 1600, b = Number(argv[i + 2]) || 2026;
  years = []; for (let y = a; y <= b; y++) years.push(y);
}
if (flag('--year')) years = [Number(val('--year'))];

function measure(y) {
  const held = snapshot(territories, YEAR(y));
  // The world-land denominator excludes Antarctica, so Antarctic claims are counted
  // separately rather than smuggled into the share of the world.
  const polar = held.filter((h) => h.region === 'polar');
  const nonPolar = held.filter((h) => h.region !== 'polar');
  const ruled = nonPolar.filter((h) => h.degree !== null && h.degree >= DIRECT_RULE_DEGREE);
  const { km2, units, missing } = areaOf(nonPolar, areas);
  const ruledArea = areaOf(ruled, areas);
  const polarArea = areaOf(polar, areas);
  return {
    year: y,
    territories: held.length,
    landKm2: Math.round(km2),
    shareOfWorldLand: +(100 * km2 / WORLD_LAND_KM2).toFixed(2),
    ruledTerritories: ruled.length,
    ruledLandKm2: Math.round(ruledArea.km2),
    polarClaimKm2: Math.round(polarArea.km2),
    geoUnits: units,
    unitsWithoutArea: missing,
    held,
  };
}

const wanted = CONTESTED_EARLY;
CONTESTED_EARLY = wanted;
const rows = years.map(measure);
// The same years read the other way round, so the report can show the band a
// contested independence date creates instead of pretending one answer is the answer.
CONTESTED_EARLY = !wanted;
const altRows = years.map(measure);
CONTESTED_EARLY = wanted;
rows.forEach((r, i) => {
  r.altTerritories = altRows[i].territories;
  r.altLandKm2 = altRows[i].landKm2;
  r.altShare = altRows[i].shareOfWorldLand;
});

if (flag('--list')) {
  for (const r of rows) {
    console.log(`\n${r.year} — ${r.territories} territories, ${r.landKm2.toLocaleString('en-GB')} km² (${r.shareOfWorldLand}% of world land)`);
    const byRegion = {};
    for (const h of r.held) (byRegion[h.region] = byRegion[h.region] || []).push(h);
    for (const reg of Object.keys(byRegion).sort()) {
      console.log(`  ${reg}`);
      for (const h of byRegion[reg].sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`    ${h.name}  [${h.status}${h.degree === null ? '' : ' d' + h.degree}]`);
      }
    }
  }
  process.exit(0);
}

if (flag('--json')) {
  console.log(JSON.stringify(rows.map(({ held, ...r }) => r), null, 2));
  process.exit(0);
}

/* --------------------------------------------------------------- report --- */
const n = (x) => x.toLocaleString('en-GB');
const pad = (s, w, right = true) => (right ? String(s).padStart(w) : String(s).padEnd(w));

console.log('British Empire Atlas — temporal audit');
console.log(`${territories.length} territories across ${new Set(territories.map((t) => t._shard)).size} shards · areas from app/data/geo/units.index.json`);
console.log(`world land taken as ${n(WORLD_LAND_KM2)} km² (excludes Antarctica; Antarctic claims counted separately) · partial coverage weighted ${PARTIAL_WEIGHT}`);
console.log(`contested end dates read as ${CONTESTED_EARLY ? 'the EARLIEST' : 'the LATEST'} defensible date (--contested-early to flip)\n`);

console.log('EXTENT = what the pink map showed.  DIRECT RULE = controlDegree 4-5 only.\n');
console.log(`${pad('year', 6)} ${pad('terr', 5)} ${pad('Δ', 5)} ${pad('land km²', 13)} ${pad('Δ km²', 13)} ${pad('% world', 8)} ${pad('ruled', 5)} ${pad('ruled km²', 13)} ${pad('polar km²', 11)}  contested-date band`);
console.log('-'.repeat(100));
let prev = null;
for (const r of rows) {
  const dT = prev ? r.territories - prev.territories : null;
  const dA = prev ? r.landKm2 - prev.landKm2 : null;
  console.log(
    `${pad(r.year, 6)} ${pad(r.territories, 5)} ${pad(dT === null ? '·' : (dT > 0 ? '+' + dT : dT), 5)} ` +
    `${pad(n(r.landKm2), 13)} ${pad(dA === null ? '·' : (dA > 0 ? '+' + n(dA) : n(dA)), 13)} ` +
    `${pad(r.shareOfWorldLand + '%', 8)} ${pad(r.ruledTerritories, 5)} ${pad(n(r.ruledLandKm2), 13)} ${pad(r.polarClaimKm2 ? n(r.polarClaimKm2) : '·', 11)}` +
    (Math.abs(r.altLandKm2 - r.landKm2) > 250000
      ? `  ${CONTESTED_EARLY ? 'up to' : 'as low as'} ${n(r.altLandKm2)} km² (${r.altShare}%)` : '')
  );
  prev = r;
}

const peak = rows.reduce((a, b) => (b.landKm2 > a.landKm2 ? b : a));
const peakN = rows.reduce((a, b) => (b.territories > a.territories ? b : a));
console.log(`\npeak land in this sample: ${peak.year} — ${n(peak.landKm2)} km², ${peak.shareOfWorldLand}% of world land`);
console.log(`most territories at once:  ${peakN.year} — ${peakN.territories}`);

const missing = new Set();
for (const r of rows) for (const u of r.unitsWithoutArea) missing.add(u);
if (missing.size) console.log(`\ngeo units with no area_km2: ${[...missing].join(', ')}`);

/* ------------------------------------------------------------ sanity ------ */
// Bands a historian would accept. Failing one means the DATA is wrong, not the tool.
const BANDS = [
  { year: 1922, key: 'shareOfWorldLand', lo: 20, hi: 28, why: 'the 1920-22 peak is conventionally about a quarter of the world\'s land' },
  { year: 1922, key: 'landKm2', lo: 28e6, hi: 37e6, why: 'standard figures put the peak empire near 33-35 million km²' },
  { year: 1600, key: 'territories', lo: 3, hi: 8, why: 'in 1600: the British Isles, the Channel Islands, Man, and a fishing claim on Newfoundland — nothing else overseas had stuck' },
  { year: 1600, key: 'landKm2', lo: 200000, hi: 700000, why: 'the British Isles and the Newfoundland fishery, and nothing more' },
  { year: 1783, key: 'landKm2', lo: 1e6, hi: 12e6, why: 'after losing America, before the Indian conquests: a small empire' },
  { year: 2026, key: 'shareOfWorldLand', lo: 0, hi: 1.5, why: 'what is left today is 14 small Overseas Territories plus the UK' },
];
if (flag('--check')) {
  let bad = 0;
  console.log('\nsanity bands');
  for (const b of BANDS) {
    const r = rows.find((x) => x.year === b.year);
    if (!r) { console.log(`  ? ${b.year} not in the sampled years`); continue; }
    const v = r[b.key];
    const ok = v >= b.lo && v <= b.hi;
    if (!ok) bad++;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${b.year} ${b.key} = ${n(Math.round(v))} (expected ${n(b.lo)}–${n(b.hi)}) — ${b.why}`);
  }
  process.exit(bad ? 1 : 0);
}
