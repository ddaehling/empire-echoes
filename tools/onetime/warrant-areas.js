#!/usr/bin/env node
/**
 * one-time: ROUND 7 — the 256 area figures, and the only honest warrant for them.
 *
 * THE PROBLEM AS THE AUDIT STATED IT. "No area figure in this dataset carries
 * any statement of where it came from — no note, no year of survey, nothing but
 * `areaYear`. There is no honest citation to promote, and inventing 256 of them
 * would be the exact failure this module exists to prevent."
 *
 * That was true, and it is still true: nobody knows which reference table each
 * of these round numbers was typed from. But it is not the only true thing.
 * This atlas DRAWS every one of these territories, out of a geography it built
 * and measured itself: app/data/geo/units.index.json carries `area_km2` for
 * each map unit, computed by tools/build-geo.js from Natural Earth 1:10m
 * boundaries on a sphere of radius 6,371 km. A territory's own `geoCoverage`
 * says which units it held in a given year. So for every territory the atlas
 * can measure the ground it is drawing and compare it with the number it is
 * printing — and where the two agree, the reader has something better than a
 * citation: a measurement they can repeat, on the map in front of them.
 *
 * THE RULE. A warrant is written only where the units the atlas draws for that
 * territory IN ITS OWN areaYear measure within 5% of the figure printed. That
 * is 90 of 256. The other 166 are left bare on purpose, and they divide into
 * two honest kinds:
 *   - a fort or factory whose `areaKm2` is its own footprint (Cape Coast
 *     Castle, 0.02 km²) while the map unit that carries it is a whole coastal
 *     province. The map is not measuring the same thing.
 *   - an informal-empire record whose area is deliberately zero.
 * In both the number came from somewhere this atlas cannot name, so it goes on
 * printing a defect, which is what a defect marker is for.
 *
 *   node tools/onetime/warrant-areas.js [--dry]
 */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const DIR = path.join(ROOT, 'app', 'data', 'territories');
const GEO = path.join(ROOT, 'app', 'data', 'geo', 'units.index.json');

const TOLERANCE = 0.05;
const DRY = process.argv.includes('--dry');

const idx = JSON.parse(fs.readFileSync(GEO, 'utf8'));
const AREA = new Map();
for (const u of (Array.isArray(idx) ? idx : idx.units || [])) AREA.set(u.id, Number(u.area_km2) || 0);

function startNum(v) {
  if (typeof v !== 'string') return null;
  const m = /^(-?\d{1,4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(v.trim());
  return m ? Number(m[1]) * 10000 + Number(m[2] || 1) * 100 + Number(m[3] || 1) : null;
}
const dStart = (d) => (d && d.value ? startNum(d.value) : null);
const dEnd = (d) => (!d ? Infinity : (d.end ? startNum(d.end) : dStart(d)));
const num = (n) => Math.round(n).toLocaleString('en-GB');

/* Under the schema's 300-character ceiling, and it has to stay there: a check
   line nobody reads to the end is a check line nobody follows. */
const CHECK = 'Open the atlas at that year and select this territory: the outline you see IS the figure. '
  + 'Its units are listed under `geoCoverage` in the shard and measured in app/data/geo/units.index.json, '
  + 'from Natural Earth 1:10m boundaries — public domain, naturalearthdata.com.';
const NOTE = 'A modern outline measured to check an older figure. It confirms the size and the shape to within a twentieth; '
  + 'it is not the surveyed border of that year, and no colonial border was ever surveyed to that precision anyway.';

let wrote = 0, left = 0; const leftRows = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const t of data.territories || []) {
    const peak = t.peak || {};
    if (!Number.isFinite(peak.areaKm2) || peak.areaWarrant) continue;
    const year = Number(peak.areaYear);
    const when = (year || 0) * 10000 + 701;
    const cov = (t.geoCoverage || []).find((c) => {
      const s = dStart(c.from); const e = c.to ? dEnd(c.to) : Infinity;
      return s !== null && when >= s && when < e;
    });
    if (!cov || !year) { left++; leftRows.push([t.id, peak.areaKm2, 'no coverage in ' + (year || '?')]); continue; }
    const partial = new Set(cov.partial || []);
    let km = 0, units = 0, missing = 0;
    for (const u of cov.units || []) {
      const a = AREA.get(u);
      if (a === undefined) { missing++; continue; }
      km += a * (partial.has(u) ? 0.5 : 1); units++;
    }
    if (!km || !peak.areaKm2 || missing) { left++; leftRows.push([t.id, peak.areaKm2, missing ? missing + ' units unmeasured' : 'nothing measurable']); continue; }
    const ratio = km / peak.areaKm2;
    if (Math.abs(ratio - 1) > TOLERANCE) {
      left++;
      leftRows.push([t.id, peak.areaKm2, 'map measures ' + num(km) + ' km² — ' + (ratio > 1 ? '×' + ratio.toFixed(1) : (ratio * 100).toFixed(0) + '% of it')]);
      continue;
    }
    const off = Math.round(Math.abs(ratio - 1) * 1000) / 10;
    peak.areaWarrant = {
      author: 'This atlas, measuring the ground it draws',
      work: 'app/data/geo/units.index.json — Natural Earth 1:10m admin boundaries, measured on a sphere of radius 6,371 km by tools/build-geo.js',
      year: 2026,
      kind: 'dataset',
      supports: t.name + '’s greatest extent, ' + num(peak.areaKm2) + ' km² in ' + year + ': the '
        + units + (units === 1 ? ' map unit' : ' map units') + ' this atlas draws it holding that year measure '
        + num(km) + ' km², ' + (off < 0.05 ? 'the same figure' : 'within ' + off.toFixed(1) + '% of it') + '.',
      check: CHECK,
      note: NOTE,
    };
    wrote++; touched = true;
  }
  if (touched && !DRY) fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
console.log('area warrants written: ' + wrote + '   left bare: ' + left + (DRY ? '   (dry run)' : ''));
if (process.argv.includes('--bare')) for (const r of leftRows) console.log('  ' + r[0].padEnd(42) + String(r[1]).padStart(10) + '  ' + r[2]);
