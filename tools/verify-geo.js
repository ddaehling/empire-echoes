#!/usr/bin/env node
'use strict';
/**
 * verify-geo.js — load the built geometry and prove it is usable.
 *
 * Asserts, and fails loudly:
 *   - every units.index.json entry has real geometry in BOTH detail levels
 *   - no unit is empty, degenerate, or zero-area
 *   - every unit's `point` is genuinely inside that unit's polygon (label anchor)
 *   - the tiny islands the atlas cannot do without all survive simplification
 *   - required historical splits exist and are spatially distinct
 *   - units do not overlap each other (spot-checked over a lat/lon sample)
 *   - file sizes are within budget
 *   - land.topo.json carries land + graticule and covers the whole globe
 *
 * Run: node tools/verify-geo.js
 */
const fs = require('fs');
const path = require('path');
const topojson = require('topojson-client');
const d3 = require('d3-geo');

const ROOT = path.resolve(__dirname, '..');
const GEO = path.join(ROOT, 'app', 'data', 'geo');
const R = 6371.0088;

let pass = 0, fail = 0;
const failures = [];
function check(ok, label, detail) {
  if (ok) { pass++; return true; }
  fail++; failures.push(label + (detail ? ' — ' + detail : ''));
  return false;
}
const kb = (f) => (fs.statSync(f).size / 1024);

// ---------------------------------------------------------------------------
console.log('=== British Empire Atlas — geometry verification ===\n');

const index = JSON.parse(fs.readFileSync(path.join(GEO, 'units.index.json'), 'utf8'));
const fineTopo = JSON.parse(fs.readFileSync(path.join(GEO, 'units-fine.topo.json'), 'utf8'));
const coarseTopo = JSON.parse(fs.readFileSync(path.join(GEO, 'units-coarse.topo.json'), 'utf8'));
const landTopo = JSON.parse(fs.readFileSync(path.join(GEO, 'land.topo.json'), 'utf8'));

const fine = topojson.feature(fineTopo, fineTopo.objects.units);
const coarse = topojson.feature(coarseTopo, coarseTopo.objects.units);
const fineById = new Map(fine.features.map(f => [f.id || f.properties.id, f]));
const coarseById = new Map(coarse.features.map(f => [f.id || f.properties.id, f]));

// --- 1. file sizes ---------------------------------------------------------
console.log('--- file sizes (budget: coarse < 900 KB, fine < 4096 KB) ---');
const sizes = {
  'units-coarse.topo.json': [kb(path.join(GEO, 'units-coarse.topo.json')), 900],
  'units-fine.topo.json': [kb(path.join(GEO, 'units-fine.topo.json')), 4096],
  'land.topo.json': [kb(path.join(GEO, 'land.topo.json')), 1500],
  'units.index.json': [kb(path.join(GEO, 'units.index.json')), 600],
};
for (const [f, [got, budget]] of Object.entries(sizes)) {
  const ok = got <= budget;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${f.padEnd(24)} ${got.toFixed(0).padStart(5)} KB  (budget ${budget} KB)`);
  check(ok, `${f} is ${got.toFixed(0)} KB, over the ${budget} KB budget`);
}

// --- 2. index integrity ----------------------------------------------------
console.log('\n--- index integrity ---');
const ids = index.map(e => e.id);
check(new Set(ids).size === ids.length, 'duplicate ids in units.index.json');
check(ids.slice().sort().join() === ids.join(), 'units.index.json is not sorted by id');
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const REQ = ['id', 'name', 'aliases', 'kind', 'sovereign_today', 'iso_a2', 'centroid', 'point', 'area_km2', 'bbox', 'tiny'];
let badSlug = [], badKeys = [], badPt = [];
for (const e of index) {
  if (!SLUG.test(e.id)) badSlug.push(e.id);
  for (const k of REQ) if (!(k in e)) badKeys.push(e.id + '.' + k);
  if (!Array.isArray(e.point) || e.point.length !== 2 || !isFinite(e.point[0])) badPt.push(e.id);
}
check(!badSlug.length, 'ids that are not lowercase kebab slugs', badSlug.join(', '));
check(!badKeys.length, 'index entries missing required keys', badKeys.join(', '));
check(!badPt.length, 'index entries with a malformed point', badPt.join(', '));
console.log(`  ${index.length} units, ${index.filter(e => e.tiny).length} flagged tiny, ` +
  `${new Set(index.map(e => e.region)).size} regions`);

// --- 3. every unit has non-degenerate geometry at both levels --------------
console.log('\n--- geometry present and non-degenerate (both detail levels) ---');
const missingFine = [], missingCoarse = [], zeroFine = [], zeroCoarse = [], noRing = [];
for (const e of index) {
  const f = fineById.get(e.id), c = coarseById.get(e.id);
  if (!f || !f.geometry) { missingFine.push(e.id); continue; }
  if (!c || !c.geometry) { missingCoarse.push(e.id); continue; }
  const af = d3.geoArea(f) * R * R, ac = d3.geoArea(c) * R * R;
  if (!(af > 0)) zeroFine.push(e.id + '=' + af.toFixed(4));
  if (!(ac > 0)) zeroCoarse.push(e.id + '=' + ac.toFixed(4));
  // a polygon needs at least 4 positions in its outer ring to enclose anything
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  if (!polys.length || polys.some(p => !p[0] || p[0].length < 4)) noRing.push(e.id);
}
check(!missingFine.length, 'units missing from units-fine.topo.json', missingFine.join(', '));
check(!missingCoarse.length, 'units missing from units-coarse.topo.json', missingCoarse.join(', '));
check(!zeroFine.length, 'units with zero area in fine', zeroFine.join(', '));
check(!zeroCoarse.length, 'units with zero area in coarse', zeroCoarse.join(', '));
check(!noRing.length, 'units with a degenerate outer ring', noRing.join(', '));
console.log(`  ${index.length - missingFine.length - missingCoarse.length} units drawable at both levels`);

// --- 4. label points really are on land ------------------------------------
console.log('\n--- label points fall inside their own unit ---');
const offPoint = [];
for (const e of index) {
  const f = fineById.get(e.id);
  if (!f) continue;
  if (!d3.geoContains(f, e.point)) offPoint.push(e.id);
}
check(!offPoint.length, 'units whose `point` is not inside the unit', offPoint.join(', '));
console.log(`  ${index.length - offPoint.length}/${index.length} label points verified on land`);

// --- 5. the tiny islands the atlas cannot lose -----------------------------
console.log('\n--- pedagogically essential small units survive simplification ---');
const MUST_SURVIVE = [
  'bermuda', 'bahamas', 'barbados', 'antigua', 'barbuda', 'nevis', 'saint-kitts', 'montserrat',
  'anguilla', 'british-virgin-islands', 'cayman-islands', 'turks-caicos-islands', 'dominica',
  'saint-lucia', 'saint-vincent', 'grenada', 'tobago', 'trinidad', 'jamaica',
  'gibraltar', 'malta', 'cyprus', 'gr-ionian-islands', 'es-minorca', 'de-heligoland',
  'ascension', 'tristan-da-cunha', 'saint-helena', 'falkland-islands', 'south-georgia',
  'south-sandwich-islands', 'british-antarctic-territory',
  'mauritius', 'mu-rodrigues', 'seychelles', 'sc-outer-islands', 'maldives',
  'io-diego-garcia', 'io-chagos-archipelago', 'ye-socotra', 'ye-perim', 'ye-kamaran',
  'om-kuria-muria', 'tz-zanzibar', 'my-penang', 'my-labuan', 'singapore',
  'hk-hong-kong-island', 'hk-kowloon', 'hk-new-territories', 'cn-weihaiwei',
  'pitcairn-islands', 'norfolk-island', 'nauru', 'tuvalu', 'ki-gilbert-islands',
  'ki-line-phoenix-islands', 'tokelau', 'niue', 'cook-islands', 'fiji', 'tonga',
  'in-lakshadweep', 'in-andaman-nicobar', 'bahrain', 'christmas-island', 'cocos-keeling-islands',
];
const lost = [], thin = [];
for (const id of MUST_SURVIVE) {
  const e = index.find(x => x.id === id);
  if (!e) { lost.push(id + ' (not in index)'); continue; }
  const c = coarseById.get(id), f = fineById.get(id);
  if (!c || !c.geometry) { lost.push(id + ' (gone from coarse)'); continue; }
  if (!f || !f.geometry) { lost.push(id + ' (gone from fine)'); continue; }
  const ac = d3.geoArea(c) * R * R;
  if (!(ac > 0.05)) thin.push(`${id} coarse area ${ac.toFixed(3)} km²`);
}
check(!lost.length, 'essential small units lost', lost.join(', '));
check(!thin.length, 'essential small units collapsed to a sliver in coarse', thin.join(', '));
console.log(`  ${MUST_SURVIVE.length - lost.length}/${MUST_SURVIVE.length} essential small units intact at world zoom`);

// --- 6. the historical splits the brief demands ----------------------------
console.log('\n--- required historical splits are representable ---');
const SPLITS = {
  'Ireland: island vs Free State vs Northern Ireland':
    ['gb-northern-ireland', 'ie-leinster', 'ie-munster', 'ie-connacht', 'ie-ulster-counties'],
  'Canada as it accreted':
    ['ca-nova-scotia', 'ca-new-brunswick', 'ca-prince-edward-island', 'ca-newfoundland-labrador',
      'ca-quebec', 'ca-ontario', 'ca-manitoba', 'ca-saskatchewan', 'ca-alberta',
      'ca-british-columbia', 'ca-vancouver-island', 'ca-yukon', 'ca-northwest-territories', 'ca-nunavut'],
  'Australian colonies':
    ['au-new-south-wales', 'au-tasmania', 'au-south-australia', 'au-victoria',
      'au-queensland', 'au-western-australia', 'au-northern-territory'],
  'British India successors':
    ['in-west-bengal', 'pk-punjab', 'bd-east-bengal', 'mm-lower-burma', 'lk-kandy',
      'in-telangana', 'in-jammu-kashmir', 'pk-azad-kashmir', 'in-sikkim'],
  'Tanganyika vs Zanzibar': ['tz-tanganyika', 'tz-zanzibar'],
  'Cameroons and Togoland strips':
    ['cm-british-southern-cameroons', 'cm-french-cameroun', 'ng-british-northern-cameroons',
      'gh-british-togoland', 'tg-french-togoland'],
  'Rhodesias and Nyasaland': ['zm-northern-rhodesia', 'zw-southern-rhodesia', 'mw-nyasaland'],
  'Anglo-Egyptian Sudan vs Egypt': ['sudan', 'south-sudan', 'egypt', 'eg-suez-canal-zone'],
  'British vs Italian Somaliland': ['so-british-somaliland', 'so-italian-somaliland'],
  'South African colonies': ['za-cape-colony', 'za-natal', 'za-transvaal', 'za-orange-free-state'],
  'Malaya, Borneo, Straits Settlements':
    ['my-penang', 'my-melaka', 'singapore', 'my-sarawak', 'my-sabah', 'brunei', 'my-labuan'],
  'Hong Kong in three leases': ['hk-hong-kong-island', 'hk-kowloon', 'hk-new-territories'],
  'Palestine vs Transjordan vs Iraq': ['israel', 'west-bank', 'gaza-strip', 'jordan', 'iraq'],
  'Aden and the Gulf':
    ['ye-aden-colony', 'ye-aden-protectorate', 'united-arab-emirates', 'kuwait', 'bahrain', 'qatar', 'oman'],
  'Pacific':
    ['fiji', 'pg-papua', 'pg-new-guinea', 'solomon-islands', 'ki-gilbert-islands', 'tuvalu',
      'tonga', 'vanuatu', 'nauru', 'pitcairn-islands', 'norfolk-island', 'cook-islands',
      'niue', 'samoa', 'tokelau'],
};
for (const [label, need] of Object.entries(SPLITS)) {
  const gone = need.filter(id => !fineById.has(id));
  const ok = check(!gone.length, `split "${label}" incomplete`, gone.join(', '));
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label} (${need.length} units)`);
}

// spatial distinctness of the pairs that must not be the same shape
console.log('\n--- carved units are spatially distinct from their parents ---');
const DISTINCT = [
  ['tz-tanganyika', 'tz-zanzibar'], ['io-chagos-archipelago', 'io-diego-garcia'],
  ['south-georgia', 'south-sandwich-islands'], ['ki-gilbert-islands', 'ki-line-phoenix-islands'],
  ['ca-british-columbia', 'ca-vancouver-island'], ['gh-northern-territories', 'gh-british-togoland'],
  ['ng-northern-nigeria', 'ng-british-northern-cameroons'], ['ye-aden-protectorate', 'ye-socotra'],
  ['us-gulf-interior', 'us-west-florida'], ['egypt', 'eg-suez-canal-zone'],
  ['hk-hong-kong-island', 'hk-kowloon'], ['saint-kitts', 'nevis'], ['trinidad', 'tobago'],
];
for (const [a, b] of DISTINCT) {
  const ea = index.find(x => x.id === a), eb = index.find(x => x.id === b);
  const fa = fineById.get(a), fb = fineById.get(b);
  if (!ea || !eb || !fa || !fb) { check(false, `distinctness pair ${a}/${b} missing`); continue; }
  const aInB = d3.geoContains(fb, ea.point), bInA = d3.geoContains(fa, eb.point);
  const ok = check(!aInB && !bInA, `${a} and ${b} overlap at their label points`);
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${a} vs ${b}`);
}

// --- 7. units do not overlap (sampled) -------------------------------------
console.log('\n--- units do not overlap (label-point sample over all units) ---');
const overlaps = [];
for (const e of index) {
  for (const other of index) {
    if (other.id === e.id) continue;
    // cheap bbox reject first
    const b = other.bbox;
    if (b[0] <= b[2]) { if (e.point[0] < b[0] || e.point[0] > b[2]) continue; }
    if (e.point[1] < b[1] || e.point[1] > b[3]) continue;
    const f = fineById.get(other.id);
    if (f && d3.geoContains(f, e.point)) overlaps.push(`${e.id}'s point falls inside ${other.id}`);
  }
}
check(!overlaps.length, 'overlapping units', overlaps.slice(0, 12).join('; '));
console.log(`  ${overlaps.length} overlaps found among ${index.length} units`);

// --- 8. base map -----------------------------------------------------------
console.log('\n--- base map (land.topo.json) ---');
const objs = Object.keys(landTopo.objects);
check(objs.includes('land'), 'land.topo.json has no `land` object', objs.join(','));
check(objs.includes('graticule'), 'land.topo.json has no `graticule` object', objs.join(','));
const land = topojson.feature(landTopo, landTopo.objects.land);
const landArea = land.features.reduce((s, f) => s + d3.geoArea(f), 0) * R * R;
console.log(`  objects: ${objs.join(', ')}`);
console.log(`  land area ${(landArea / 1e6).toFixed(1)} million km² (Earth's land is ~149)`);
check(landArea > 120e6 && landArea < 160e6, 'land layer area is implausible', landArea.toFixed(0));
const lb = d3.geoBounds(land);
check(lb[0][1] < -60 && lb[1][1] > 70, 'land layer does not span pole to pole', JSON.stringify(lb));

// --- 9. spot-check areas against published figures -------------------------
console.log('\n--- areas vs published figures (±30%) ---');
const KNOWN = {
  bermuda: 54, malta: 316, barbados: 432, jamaica: 10991, cyprus: 9251, 'tz-zanzibar': 2461,
  'ca-nova-scotia': 55284, 'au-new-south-wales': 809444, uganda: 241038, 'in-west-bengal': 88752,
  'saint-helena': 122, ascension: 88, 'pitcairn-islands': 47, 'es-minorca': 695,
  'hk-new-territories': 952, nauru: 21, tuvalu: 26, 'mu-rodrigues': 108, 'falkland-islands': 12173,
  'my-sarawak': 124450, 'mm-lower-burma': 127500, 'za-natal': 94361, lesotho: 30355,
};
let areaBad = [];
for (const [id, want] of Object.entries(KNOWN)) {
  const e = index.find(x => x.id === id);
  if (!e) { areaBad.push(id + ' missing'); continue; }
  const r = e.area_km2 / want;
  const ok = r > 0.7 && r < 1.3;
  if (!ok) areaBad.push(`${id} ${e.area_km2} vs ${want} (x${r.toFixed(2)})`);
  console.log(`  ${ok ? 'PASS' : 'CHECK'}  ${id.padEnd(22)} ${String(e.area_km2).padStart(8)} km²  (published ~${want})`);
}
check(areaBad.length <= 3, 'too many units whose area disagrees with published figures', areaBad.join('; '));

// --- summary ---------------------------------------------------------------
console.log('\n=== ' + (fail === 0 ? 'ALL CHECKS PASSED' : fail + ' CHECK(S) FAILED') +
  ` — ${pass} passed, ${fail} failed ===`);
if (fail) { failures.forEach(f => console.log('  FAIL: ' + f)); process.exit(1); }
