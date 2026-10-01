#!/usr/bin/env node
/**
 * validate-data.js — British Empire Atlas dataset validator.
 *
 * Zero dependencies. CommonJS. Node 18+.
 *
 * Checks every dataset shard in app/data/territories/ (and app/data/events/ if it exists)
 * against app/data/schema.json, and then against the semantic rules in docs/DATA_MODEL.md
 * that a JSON Schema cannot express:
 *
 *   - dates are real dates, and run forwards
 *   - status periods are ordered, contiguous and non-overlapping
 *   - every geo unit id exists in app/data/geo/units.index.json
 *   - no territory claims a unit its coverage does not include at that date
 *   - controlled vocabularies are respected (schema) and used coherently (here)
 *   - every territory has at least one acquisition AND a departure or an explicit still-held record
 *   - citations are present and plausible
 *   - no duplicate ids anywhere in the dataset
 *
 * Usage:
 *   node tools/validate-data.js                  validate everything, human report
 *   node tools/validate-data.js app/data/territories/caribbean.json    validate one file
 *   node tools/validate-data.js --strict         treat warnings as errors
 *   node tools/validate-data.js --json           machine-readable report on stdout
 *   node tools/validate-data.js --quiet          only print errors and the summary
 *   node tools/validate-data.js --geo path/to/units.index.json
 *   node tools/validate-data.js --include-template  also check _TEMPLATE.json (skipped by default)
 *   node tools/validate-data.js --no-color
 *
 * Exit codes: 0 clean (warnings allowed unless --strict), 1 errors found, 2 could not run.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'app', 'data', 'schema.json');
const TERRITORY_DIR = path.join(ROOT, 'app', 'data', 'territories');
const EVENT_DIR = path.join(ROOT, 'app', 'data', 'events');
const DEFAULT_GEO_INDEX = path.join(ROOT, 'app', 'data', 'geo', 'units.index.json');

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

const argv = process.argv.slice(2);
const opts = {
  strict: argv.includes('--strict'),
  json: argv.includes('--json'),
  quiet: argv.includes('--quiet'),
  color: !argv.includes('--no-color') && process.stdout.isTTY,
  // Editorial default (general editor, 2026-09): _-prefixed shards are exemplars,
  // not data. They collide with the real shards. Pass --include-template to check them.
  skipTemplate: !argv.includes('--include-template'),
  files: [],
  geo: null,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--geo') opts.geo = argv[++i];
  else if (a.startsWith('--geo=')) opts.geo = a.slice(6);
  else if (!a.startsWith('--')) opts.files.push(a);
}
const GEO_INDEX = opts.geo ? path.resolve(process.cwd(), opts.geo) : DEFAULT_GEO_INDEX;

const C = {
  red: (s) => (opts.color ? `\u001b[31m${s}\u001b[0m` : s),
  yellow: (s) => (opts.color ? `\u001b[33m${s}\u001b[0m` : s),
  green: (s) => (opts.color ? `\u001b[32m${s}\u001b[0m` : s),
  dim: (s) => (opts.color ? `\u001b[2m${s}\u001b[0m` : s),
  bold: (s) => (opts.color ? `\u001b[1m${s}\u001b[0m` : s),
  cyan: (s) => (opts.color ? `\u001b[36m${s}\u001b[0m` : s),
};

/* ------------------------------------------------------------------ *
 * Findings
 * ------------------------------------------------------------------ */

const findings = []; // {severity, file, path, code, message, hint}

function report(severity, file, where, code, message, hint) {
  findings.push({ severity, file, path: where, code, message, hint: hint || null });
}
const err = (file, where, code, message, hint) => report('error', file, where, code, message, hint);
const warn = (file, where, code, message, hint) => report('warn', file, where, code, message, hint);

/* ------------------------------------------------------------------ *
 * Minimal JSON Schema (draft 2020-12 subset) validator
 * Supported: $ref (#/$defs/*), type, enum, const, required, properties,
 * additionalProperties, items, minItems, maxItems, uniqueItems, minLength,
 * maxLength, pattern, minimum, maximum, anyOf, allOf, oneOf, not.
 * ------------------------------------------------------------------ */

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v; // string | number | boolean | object
}

function typeMatches(v, t) {
  const actual = typeOf(v);
  if (t === 'number') return actual === 'number' || actual === 'integer';
  if (t === 'object') return actual === 'object';
  return actual === t;
}

function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) throw new Error(`Only local $refs supported, got ${ref}`);
  let node = root;
  for (const seg of ref.slice(2).split('/')) {
    node = node[decodeURIComponent(seg.replace(/~1/g, '/').replace(/~0/g, '~'))];
    if (node === undefined) throw new Error(`Unresolvable $ref ${ref}`);
  }
  return node;
}

function schemaValidate(root, schema, data, where, out) {
  if (schema === true || schema === undefined) return;
  if (schema === false) {
    out.push({ path: where, message: 'value not allowed here' });
    return;
  }

  if (schema.$ref) schemaValidate(root, resolveRef(root, schema.$ref), data, where, out);

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeMatches(data, t))) {
      out.push({ path: where, message: `expected ${types.join(' or ')}, got ${typeOf(data)}` });
      return; // further keywords are meaningless
    }
  }

  if (schema.const !== undefined && JSON.stringify(data) !== JSON.stringify(schema.const)) {
    out.push({ path: where, message: `must be ${JSON.stringify(schema.const)}` });
  }

  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(data))) {
    out.push({
      path: where,
      message: `${JSON.stringify(data)} is not in the controlled vocabulary`,
      hint: `allowed: ${schema.enum.join(', ')}`,
    });
  }

  const t = typeOf(data);

  if (t === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      out.push({ path: where, message: `too short (${data.length} chars, minimum ${schema.minLength})` });
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      out.push({ path: where, message: `too long (${data.length} chars, maximum ${schema.maxLength})` });
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      out.push({ path: where, message: `"${data}" does not match required pattern ${schema.pattern}` });
    }
  }

  if (t === 'number' || t === 'integer') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      out.push({ path: where, message: `${data} is below the minimum ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      out.push({ path: where, message: `${data} is above the maximum ${schema.maximum}` });
    }
  }

  if (t === 'array') {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      out.push({ path: where, message: `needs at least ${schema.minItems} item(s), has ${data.length}` });
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      out.push({ path: where, message: `allows at most ${schema.maxItems} item(s), has ${data.length}` });
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      data.forEach((item, i) => {
        const key = JSON.stringify(item);
        if (seen.has(key)) out.push({ path: `${where}[${i}]`, message: `duplicate value ${key}` });
        seen.add(key);
      });
    }
    if (schema.items) data.forEach((item, i) => schemaValidate(root, schema.items, item, `${where}[${i}]`, out));
  }

  if (t === 'object') {
    for (const req of schema.required || []) {
      if (!(req in data)) out.push({ path: `${where}.${req}`, message: `required property "${req}" is missing` });
    }
    const props = schema.properties || {};
    for (const [k, v] of Object.entries(data)) {
      if (props[k]) schemaValidate(root, props[k], v, `${where}.${k}`, out);
      else if (schema.additionalProperties === false) {
        out.push({
          path: `${where}.${k}`,
          message: `unknown property "${k}"`,
          hint: `allowed here: ${Object.keys(props).join(', ')}`,
        });
      } else if (typeof schema.additionalProperties === 'object') {
        schemaValidate(root, schema.additionalProperties, v, `${where}.${k}`, out);
      }
    }
  }

  if (schema.allOf) schema.allOf.forEach((s) => schemaValidate(root, s, data, where, out));

  if (schema.anyOf) {
    const branch = schema.anyOf.map((s) => {
      const sub = [];
      schemaValidate(root, s, data, where, sub);
      return sub;
    });
    if (!branch.some((b) => b.length === 0)) {
      out.push({
        path: where,
        message: 'does not satisfy any allowed shape',
        hint: branch.map((b, i) => `option ${i + 1}: ${b.map((e) => e.message).join('; ')}`).join(' | '),
      });
    }
  }

  if (schema.oneOf) {
    const okCount = schema.oneOf.filter((s) => {
      const sub = [];
      schemaValidate(root, s, data, where, sub);
      return sub.length === 0;
    }).length;
    if (okCount !== 1) out.push({ path: where, message: `must match exactly one allowed shape (matched ${okCount})` });
  }

  if (schema.not) {
    const sub = [];
    schemaValidate(root, schema.not, data, where, sub);
    if (sub.length === 0) out.push({ path: where, message: 'matches a forbidden shape' });
  }
}

/* ------------------------------------------------------------------ *
 * Dates
 * ------------------------------------------------------------------ */

const NEEDS_NOTE = new Set(['circa', 'decade', 'range', 'contested', 'unknown']);
const NEEDS_END = new Set(['range', 'contested']);

function parseParts(s) {
  const m = /^(-?\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(s || '');
  if (!m) return null;
  return { y: parseInt(m[1], 10), m: m[2] ? parseInt(m[2], 10) : null, d: m[3] ? parseInt(m[3], 10) : null };
}

function realDate(p) {
  if (!p) return false;
  if (p.m !== null && (p.m < 1 || p.m > 12)) return false;
  if (p.d !== null) {
    const days = [31, (p.y % 4 === 0 && p.y % 100 !== 0) || p.y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (p.d < 1 || p.d > days[p.m - 1]) return false;
  }
  return true;
}

/** Earliest instant a date string can mean, as a sortable integer. */
function startNum(s) {
  const p = parseParts(s);
  if (!p) return null;
  return p.y * 10000 + (p.m || 1) * 100 + (p.d || 1);
}
/** Latest instant a date string can mean. */
function endNum(s) {
  const p = parseParts(s);
  if (!p) return null;
  return p.y * 10000 + (p.m || 12) * 100 + (p.d || 31);
}

/** Earliest instant a histDate object can mean. */
function dStart(d) {
  if (!d || !d.value) return null;
  return startNum(d.value);
}
/** Latest instant a histDate object can mean (respecting `end`). */
function dEnd(d) {
  if (!d) return null;
  if (d.end) return endNum(d.end);
  if (!d.value) return null;
  return endNum(d.value);
}
function dShow(d) {
  if (!d) return '(no date)';
  return d.display || d.value || '(unknown)';
}

function checkHistDate(file, where, d, ctx) {
  if (!d || typeof d !== 'object') return;
  if (d.precision !== 'unknown' && !d.value) {
    err(file, where, 'date/missing-value', `${ctx}: precision is "${d.precision}" but there is no value`, 'Only precision "unknown" may omit value.');
  }
  if (d.value) {
    const p = parseParts(d.value);
    if (!p) err(file, `${where}.value`, 'date/unparseable', `${ctx}: "${d.value}" is not YYYY, YYYY-MM or YYYY-MM-DD`);
    else if (!realDate(p)) err(file, `${where}.value`, 'date/not-a-real-date', `${ctx}: "${d.value}" is not a real calendar date`);
  }
  if (d.end) {
    const p = parseParts(d.end);
    if (!p || !realDate(p)) err(file, `${where}.end`, 'date/not-a-real-date', `${ctx}: end "${d.end}" is not a real calendar date`);
    else if (d.value && endNum(d.end) < startNum(d.value)) {
      err(file, where, 'date/backwards', `${ctx}: end ${d.end} is before value ${d.value}`);
    }
  }
  if (NEEDS_END.has(d.precision) && !d.end) {
    err(file, where, 'date/range-needs-end', `${ctx}: precision "${d.precision}" needs an "end" date so the UI can show the span`);
  }
  if (NEEDS_NOTE.has(d.precision) && !d.note) {
    err(file, where, 'date/needs-note', `${ctx}: precision "${d.precision}" needs a "note" saying why the date is uncertain`, 'Rule 3 of the brief: say so in the UI, do not hide it.');
  }
  if (d.calendar === 'old-style' && !d.note) {
    err(file, where, 'date/old-style-needs-note', `${ctx}: Old Style dates need a note explaining the calendar`);
  }
  if (!d.display) return;
  if (d.value && /^\d{4}$/.test(d.value) && d.precision === 'exact') {
    warn(file, where, 'date/precision-mismatch', `${ctx}: precision "exact" but the value is only a year`, 'Use precision "year" unless you know the day.');
  }
}

/* ------------------------------------------------------------------ *
 * Vocabulary knowledge used for semantic checks
 * ------------------------------------------------------------------ */

const DEFAULT_CONTROL_DEGREE = {
  'company-trading-posts': 1,
  'company-rule': 4,
  'proprietary-colony': 3,
  'representative-colony': 4,
  'crown-colony': 5,
  'self-governing-colony': 2,
  'crown-rule': 5,
  protectorate: 3,
  'protected-state': 2,
  'princely-state': 2,
  mandate: 4,
  trusteeship: 4,
  condominium: 3,
  'leased-territory': 5,
  occupied: 5,
  dominion: 1,
  'associated-state': 1,
  'overseas-territory': 3,
  'crown-dependency': 2,
  'part-of-uk': 5,
  'informal-sphere': 0,
};

const BANNED_PHRASES = [
  'rich tapestry',
  'played a key role',
  'played an important role',
  'it is important to note',
  'a significant impact',
  'melting pot',
  'the sun never set',
  'acquired the territory',
];

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

function fail(msg) {
  process.stderr.write(`${C.red('cannot run:')} ${msg}\n`);
  process.exit(2);
}

function readJson(file) {
  const text = fs.readFileSync(file, 'utf8');
  try {
    return { data: JSON.parse(text), text };
  } catch (e) {
    const m = /position (\d+)/.exec(e.message);
    let at = '';
    if (m) {
      const pos = parseInt(m[1], 10);
      const line = text.slice(0, pos).split('\n').length;
      const col = pos - text.lastIndexOf('\n', pos - 1);
      at = ` (line ${line}, column ${col})`;
    }
    return { error: `${e.message}${at}` };
  }
}

function listShards() {
  if (opts.files.length) return opts.files.map((f) => path.resolve(process.cwd(), f));
  const files = [];
  for (const dir of [TERRITORY_DIR, EVENT_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (!name.endsWith('.json')) continue;
      // index.json / manifest.json are manifests, not shards (see tools/data-index.js).
      if (name === 'index.json' || name === 'manifest.json') continue;
      if (opts.skipTemplate && name.startsWith('_')) continue;
      files.push(path.join(dir, name));
    }
  }
  return files;
}

/** Accepts every plausible shape of units.index.json and returns {ids:Set, aliases:Map}. */
function loadGeoIndex() {
  if (!fs.existsSync(GEO_INDEX)) return null;
  const r = readJson(GEO_INDEX);
  if (r.error) {
    err(rel(GEO_INDEX), '', 'geo/unparseable', `units.index.json is not valid JSON: ${r.error}`);
    return { ids: new Set(), aliases: new Map(), broken: true };
  }
  const ids = new Set();
  const aliases = new Map();
  const take = (entry) => {
    if (typeof entry === 'string') {
      ids.add(entry);
      return;
    }
    if (!entry || typeof entry !== 'object') return;
    const id = entry.id || entry.unitId || entry.code || entry.ID || (entry.properties && entry.properties.id);
    if (typeof id === 'string') ids.add(id);
    const al = entry.aliases || entry.alias || (entry.properties && entry.properties.aliases);
    if (Array.isArray(al) && typeof id === 'string') al.forEach((a) => aliases.set(a, id));
  };
  const src = r.data;
  const containers = [src, src && src.units, src && src.features, src && src.index, src && src.entries];
  for (const c of containers) {
    if (Array.isArray(c)) c.forEach(take);
    else if (c && typeof c === 'object' && c !== src) {
      for (const [k, v] of Object.entries(c)) {
        ids.add(k);
        if (v && typeof v === 'object') take(Object.assign({ id: k }, v));
      }
    }
  }
  if (ids.size === 0 && src && typeof src === 'object' && !Array.isArray(src)) {
    // last resort: a bare {id: {...}} map at top level
    for (const [k, v] of Object.entries(src)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) ids.add(k);
    }
  }
  return { ids, aliases };
}

function rel(p) {
  return path.relative(ROOT, p) || p;
}

/* ------------------------------------------------------------------ *
 * Semantic checks
 * ------------------------------------------------------------------ */

function nearest(id, pool) {
  // cheap edit-distance-ish suggestion
  let best = null;
  let bestScore = Infinity;
  for (const cand of pool) {
    const a = id;
    const b = cand;
    if (Math.abs(a.length - b.length) > 4) continue;
    let dist = 0;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) if (a[i] !== b[i]) dist++;
    if (dist < bestScore) {
      bestScore = dist;
      best = cand;
    }
  }
  return bestScore <= Math.max(2, Math.floor(id.length / 3)) ? best : null;
}

function checkTerritory(file, t, i, ctx) {
  const P = `territories[${i}]`;
  const name = t.name || t.id || `#${i}`;

  /* --- ids ------------------------------------------------------- */
  if (t.id) {
    if (ctx.territoryIds.has(t.id)) {
      err(file, `${P}.id`, 'id/duplicate-territory', `duplicate territory id "${t.id}" (also in ${rel(ctx.territoryIds.get(t.id))})`);
    } else ctx.territoryIds.set(t.id, file);
  }

  /* --- dates everywhere ------------------------------------------ */
  walkHistDates(t, P, (where, d, label) => checkHistDate(file, where, d, `${name} ${label}`));

  /* --- coverage --------------------------------------------------- */
  const cov = Array.isArray(t.geoCoverage) ? t.geoCoverage : [];
  let prevCov = null;
  cov.forEach((c, ci) => {
    const w = `${P}.geoCoverage[${ci}]`;
    const s = dStart(c.from);
    const e = c.to ? dEnd(c.to) : Infinity;
    if (s !== null && e !== null && e < s) {
      err(file, w, 'coverage/backwards', `${name}: coverage period ${ci} ends (${dShow(c.to)}) before it starts (${dShow(c.from)})`);
    }
    if (prevCov && s !== null && prevCov.s !== null && s < prevCov.s) {
      err(file, w, 'coverage/unsorted', `${name}: coverage periods must be in date order; ${dShow(c.from)} follows ${dShow(prevCov.from)}`);
    }
    if (prevCov && prevCov.to && s !== null && dStart(prevCov.to) !== null && s < dStart(prevCov.to)) {
      err(file, w, 'coverage/overlap', `${name}: coverage period starting ${dShow(c.from)} overlaps the previous one, which runs to ${dShow(prevCov.to)}`);
    }
    if (prevCov && !prevCov.to) {
      err(file, w, 'coverage/open-not-last', `${name}: coverage period ${ci - 1} has no "to" but is not the last one`);
    }
    if (ci > 0 && !c.change) {
      warn(file, w, 'coverage/no-change-note', `${name}: coverage changed at ${dShow(c.from)} but no "change" sentence says what was gained or lost`);
    }
    // gained/lost must agree with the actual set difference
    if (ci > 0 && prevCov) {
      const before = new Set(prevCov.units || []);
      const now = new Set(c.units || []);
      const gained = [...now].filter((u) => !before.has(u));
      const lost = [...before].filter((u) => !now.has(u));
      if (c.gained && JSON.stringify([...c.gained].sort()) !== JSON.stringify(gained.sort())) {
        err(file, `${w}.gained`, 'coverage/gained-mismatch', `${name}: "gained" says [${c.gained.join(', ')}] but the units actually added are [${gained.join(', ') || 'none'}]`);
      }
      if (c.lost && JSON.stringify([...c.lost].sort()) !== JSON.stringify(lost.sort())) {
        err(file, `${w}.lost`, 'coverage/lost-mismatch', `${name}: "lost" says [${c.lost.join(', ')}] but the units actually removed are [${lost.join(', ') || 'none'}]`);
      }
    }
    for (const u of c.partial || []) {
      if (!(c.units || []).includes(u)) {
        err(file, `${w}.partial`, 'coverage/partial-not-covered', `${name}: "${u}" is listed as partially covered but is not in this period's units`);
      }
    }
    (c.units || []).forEach((u) => ctx.useUnit(file, `${w}.units`, u, name));
    (c.gained || []).forEach((u) => ctx.useUnit(file, `${w}.gained`, u, name));
    (c.lost || []).forEach((u) => ctx.useUnit(file, `${w}.lost`, u, name));
    prevCov = { s, from: c.from, to: c.to, units: c.units };
    // Coverage periods are half-open [from, to). Use the START of the `to` date as the
    // exclusive end, so "…to 1765" and "1765 to…" hand over rather than overlap.
    const eExcl = c.to ? dStart(c.to) : Infinity;
    if (t.id) ctx.claims.push({ territory: t.id, nestedWithin: t.nestedWithin, file, start: s, end: eExcl === null ? e : eExcl, units: c.units || [] });
  });

  const coveredAt = (unit, when) => {
    if (when === null) return true; // unknown date: cannot judge
    return cov.some((c) => {
      const s = dStart(c.from);
      const e = c.to ? dEnd(c.to) : Infinity;
      return (c.units || []).includes(unit) && s !== null && when >= s && when <= e;
    });
  };
  const everCovered = (unit) => cov.some((c) => (c.units || []).includes(unit));

  /* --- acquisitions ----------------------------------------------- */
  const acqs = Array.isArray(t.acquisitions) ? t.acquisitions : [];
  let prevAcq = null;
  acqs.forEach((a, ai) => {
    const w = `${P}.acquisitions[${ai}]`;
    if (a.id) ctx.claimStepId(file, `${w}.id`, a.id, `acquisition of ${name}`);
    const s = dStart(a.date);
    if (prevAcq !== null && s !== null && s < prevAcq) {
      err(file, w, 'acquisition/unsorted', `${name}: acquisitions must be in date order; ${dShow(a.date)} comes after a later one`);
    }
    if (s !== null) prevAcq = s;
    for (const u of a.units || []) {
      ctx.useUnit(file, `${w}.units`, u, name);
      if (!everCovered(u)) {
        err(file, `${w}.units`, 'units/not-covered', `${name}: acquisition "${a.id}" claims unit "${u}", but no coverage period ever includes it`, 'A territory may only claim units it covers. Add a coverage period or fix the unit id.');
      } else if (!coveredAt(u, s)) {
        err(file, `${w}.units`, 'units/not-covered-at-date', `${name}: acquisition "${a.id}" claims "${u}" on ${dShow(a.date)}, but coverage does not include it then`);
      }
    }
    if ((a.mechanism === 'treaty-cession' || a.mechanism === 'war-transfer' || a.mechanism === 'lease' || a.mechanism === 'purchase') && !a.instrument) {
      err(file, w, 'acquisition/needs-instrument', `${name}: mechanism "${a.mechanism}" must name the treaty, convention or contract in "instrument"`);
    }
    if (a.mechanism === 'war-transfer' && a.instrument && !a.instrument.name) {
      err(file, w, 'acquisition/needs-treaty-name', `${name}: a war transfer must name the treaty`);
    }
    if ((a.counterparties || []).length === 0) {
      err(file, w, 'acquisition/no-counterparty', `${name}: every acquisition must say who lost what`);
    }
    for (const cp of a.counterparties || []) {
      if (cp.kind !== 'no-resident-population' && !cp.lost) {
        warn(file, `${w}.counterparties`, 'acquisition/counterparty-no-loss', `${name}: counterparty "${cp.name}" has no "lost" sentence saying what they lost`);
      }
    }
    checkProse(file, w, a.how, `${name} acquisition "${a.id}" how`);
  });

  /* --- status periods --------------------------------------------- */
  const sts = Array.isArray(t.statusPeriods) ? t.statusPeriods : [];
  let prev = null;
  sts.forEach((sp, si) => {
    const w = `${P}.statusPeriods[${si}]`;
    const s = dStart(sp.from);
    const e = sp.to ? dEnd(sp.to) : null;
    if (s !== null && e !== null && e < s) {
      err(file, w, 'status/backwards', `${name}: status "${sp.status}" ends (${dShow(sp.to)}) before it starts (${dShow(sp.from)})`);
    }
    if (si < sts.length - 1 && !sp.to) {
      err(file, w, 'status/open-not-last', `${name}: only the final status period may omit "to"; "${sp.status}" is period ${si + 1} of ${sts.length}`);
    }
    if (prev) {
      if (s !== null && prev.start !== null && s < prev.start) {
        err(file, w, 'status/unsorted', `${name}: status periods must be in date order; "${sp.status}" (${dShow(sp.from)}) comes after "${prev.status}" (${dShow(prev.from)})`);
      } else if (prev.to) {
        const pStart = dStart(prev.to);
        const pEnd = dEnd(prev.to);
        if (s !== null && pStart !== null && s < pStart) {
          err(file, w, 'status/overlap', `${name}: "${sp.status}" starts ${dShow(sp.from)} while "${prev.status}" still runs to ${dShow(prev.to)}`);
        } else if (s !== null && pEnd !== null && s > pEnd && !sp.gapBefore) {
          err(file, w, 'status/gap', `${name}: nothing describes the years between ${dShow(prev.to)} and ${dShow(sp.from)}`, 'Status periods must be contiguous. If the gap is real and deliberate, set gapBefore:true and explain in gapReason.');
        }
      }
      if (sp.gapBefore && !sp.gapReason) {
        err(file, w, 'status/gap-no-reason', `${name}: gapBefore is set but gapReason does not explain why`);
      }
    }
    const def = DEFAULT_CONTROL_DEGREE[sp.status];
    if (sp.controlDegree !== undefined && def !== undefined && sp.controlDegree !== def && !sp.controlDegreeNote) {
      err(file, `${w}.controlDegree`, 'status/degree-override', `${name}: controlDegree ${sp.controlDegree} differs from the default ${def} for "${sp.status}" and has no controlDegreeNote`, 'The legend shading depends on this number. Justify the override or use the default.');
    }
    if (sp.controlDegree === undefined && def !== undefined) {
      warn(file, w, 'status/degree-missing', `${name}: no controlDegree on "${sp.status}"; the map will fall back to the default (${def})`);
    }
    checkProse(file, w, sp.howControlWorked, `${name} status "${sp.status}"`);
    prev = { status: sp.status, from: sp.from, to: sp.to, start: s };
  });

  /* --- departures / still held ------------------------------------ */
  const deps = Array.isArray(t.departures) ? t.departures : [];
  const stillHeldDeparture = deps.some((d) => d.mechanism === 'still-a-territory');

  if (deps.length === 0 && !t.stillBritish) {
    err(file, P, 'lifecycle/no-ending', `${name}: no departure and no stillBritish record — every territory must say how British rule ended, or state plainly that it has not`, 'Add a departure entry, or a stillBritish object with statusToday and a note.');
  }
  if (stillHeldDeparture && !t.stillBritish) {
    err(file, P, 'lifecycle/still-a-territory-needs-record', `${name}: a departure with mechanism "still-a-territory" must be accompanied by a stillBritish object`);
  }
  if (acqs.length === 0) {
    err(file, P, 'lifecycle/no-acquisition', `${name}: every territory needs at least one acquisition`);
  }

  let prevDep = null;
  deps.forEach((d, di) => {
    const w = `${P}.departures[${di}]`;
    if (d.id) ctx.claimStepId(file, `${w}.id`, d.id, `departure of ${name}`);
    if (!d.date && d.mechanism !== 'still-a-territory') {
      err(file, w, 'departure/no-date', `${name}: departure "${d.id}" needs a date (only mechanism "still-a-territory" may omit one)`);
    }
    const s = dStart(d.date);
    if (prevDep !== null && s !== null && s < prevDep) {
      err(file, w, 'departure/unsorted', `${name}: departures must be in date order`);
    }
    if (s !== null) prevDep = s;
    if (s !== null && prevAcq !== null && s < dStart(acqs[0].date)) {
      err(file, w, 'departure/before-acquisition', `${name}: departure ${dShow(d.date)} is before the first acquisition ${dShow(acqs[0].date)}`);
    }
    for (const u of d.units || []) {
      ctx.useUnit(file, `${w}.units`, u, name);
      if (!everCovered(u)) {
        err(file, `${w}.units`, 'units/not-covered', `${name}: departure "${d.id}" releases unit "${u}", which this territory never covered`);
      } else if (!coveredAt(u, s)) {
        err(file, `${w}.units`, 'units/not-covered-at-date', `${name}: departure "${d.id}" releases "${u}" on ${dShow(d.date)}, but coverage does not include it then`);
      }
    }
    if ((d.mechanism === 'partition' || (d.secondaryMechanisms || []).includes('partition')) && !d.borders) {
      err(file, w, 'departure/partition-needs-borders', `${name}: a partition must say what the borders did, in "borders"`);
    }
    if (d.mechanism !== 'still-a-territory' && (d.led || []).length === 0) {
      warn(file, w, 'departure/no-leaders', `${name}: departure "${d.id}" names nobody who led it`, 'Colonised people are actors with names, not scenery.');
    }
    if (d.mechanism !== 'still-a-territory' && !d.cost) {
      warn(file, w, 'departure/no-cost', `${name}: departure "${d.id}" does not record what it cost, even to say nobody died`);
    }
    if (d.mechanism !== 'still-a-territory' && !d.borders) {
      warn(file, w, 'departure/no-borders', `${name}: departure "${d.id}" does not say what the borders did`);
    }
    checkProse(file, w, d.how, `${name} departure "${d.id}" how`);
  });

  /* --- lifecycle consistency of the last status period ------------ */
  if (sts.length) {
    const last = sts[sts.length - 1];
    const lastDep = deps.filter((d) => d.date).slice(-1)[0];
    if (!t.stillBritish && lastDep && !last.to) {
      err(file, `${P}.statusPeriods[${sts.length - 1}]`, 'lifecycle/status-open-after-departure', `${name}: the last status period has no end date, but the territory departed on ${dShow(lastDep.date)}`);
    }
    if (!t.stillBritish && lastDep && last.to && dStart(last.to) !== dStart(lastDep.date)) {
      warn(file, `${P}.statusPeriods[${sts.length - 1}].to`, 'lifecycle/status-end-mismatch', `${name}: British status ends ${dShow(last.to)} but the final departure is dated ${dShow(lastDep.date)}`);
    }
    if (t.stillBritish && !stillHeldDeparture && last.to) {
      warn(file, `${P}.statusPeriods[${sts.length - 1}].to`, 'lifecycle/still-held-closed-status', `${name}: marked still British, but the final status period ends on ${dShow(last.to)}`);
    }
    const firstAcq = acqs.length ? dStart(acqs[0].date) : null;
    const firstStatus = dStart(sts[0].from);
    if (firstAcq !== null && firstStatus !== null && firstStatus < firstAcq) {
      err(file, `${P}.statusPeriods[0].from`, 'lifecycle/status-before-acquisition', `${name}: British status begins ${dShow(sts[0].from)}, before the first acquisition on ${dShow(acqs[0].date)}`);
    }
  }

  /* --- stillBritish ------------------------------------------------ */
  if (t.stillBritish) {
    for (const u of t.stillBritish.units || []) {
      ctx.useUnit(file, `${P}.stillBritish.units`, u, name);
      if (!everCovered(u)) err(file, `${P}.stillBritish.units`, 'units/not-covered', `${name}: stillBritish lists "${u}", which this territory never covered`);
    }
  }

  /* --- successors -------------------------------------------------- */
  for (const [k, ms] of (t.modernSuccessors || []).entries()) {
    for (const u of ms.units || []) ctx.useUnit(file, `${P}.modernSuccessors[${k}].units`, u, name);
  }
  if (!t.stillBritish && (t.modernSuccessors || []).length === 0) {
    warn(file, P, 'identity/no-successor', `${name}: no modern successor state, so a student cannot map it onto a country they know`);
  }

  /* --- consequences ------------------------------------------------ */
  if (t.consequences && t.consequences.retainedTerritory) {
    for (const u of t.consequences.retainedTerritory.units || []) ctx.useUnit(file, `${P}.consequences.retainedTerritory.units`, u, name);
  }
  if (deps.some((d) => d.mechanism === 'partition') && !(t.consequences && t.consequences.partition && t.consequences.partition.happened)) {
    err(file, `${P}.consequences`, 'consequences/partition-not-recorded', `${name}: departs by partition but consequences.partition.happened is not true`);
  }

  /* --- toll sanity -------------------------------------------------- */
  walkTolls(t, P, (where, toll) => {
    const pairs = [['deathsLow', 'deathsHigh'], ['displacedLow', 'displacedHigh'], ['enslavedLow', 'enslavedHigh']];
    for (const [lo, hi] of pairs) {
      if (toll[lo] !== undefined && toll[hi] !== undefined && toll[lo] > toll[hi]) {
        err(file, where, 'toll/backwards', `${name}: ${lo} (${toll[lo]}) is greater than ${hi} (${toll[hi]})`);
      }
      if ((toll[lo] !== undefined || toll[hi] !== undefined) && !toll.note) {
        err(file, where, 'toll/no-note', `${name}: a human-cost figure is given with no note saying who counted and how disputed it is`);
      }
    }
  });

  /* --- evidence ----------------------------------------------------- */
  const evs = t.evidence || [];
  if (evs.length === 0) err(file, `${P}.evidence`, 'evidence/missing', `${name}: no citations`);
  evs.forEach((c, k) => checkCitation(file, `${P}.evidence[${k}]`, c, name, ctx));
  acqs.forEach((a, ai) => (a.evidence || []).forEach((c, k) => checkCitation(file, `${P}.acquisitions[${ai}].evidence[${k}]`, c, name, ctx)));
  deps.forEach((d, di) => (d.evidence || []).forEach((c, k) => checkCitation(file, `${P}.departures[${di}].evidence[${k}]`, c, name, ctx)));

  if (t.confidence === 'low' && !(t.contested && t.contested.note)) {
    err(file, `${P}.confidence`, 'evidence/low-confidence-unexplained', `${name}: confidence is "low" but nothing explains what is uncertain`);
  }
  if (t.contested && t.contested.isContested && !t.contested.note) {
    err(file, `${P}.contested`, 'evidence/contested-no-note', `${name}: marked contested with no note saying what is disputed`);
  }

  /* --- pedagogy ------------------------------------------------------ */
  if (t.pedagogy) {
    checkProse(file, `${P}.pedagogy.hook`, t.pedagogy.hook, `${name} hook`);
    checkProse(file, `${P}.pedagogy.misconception.correction`, t.pedagogy.misconception && t.pedagogy.misconception.correction, `${name} correction`);
    checkProse(file, `${P}.pedagogy.whyItMatters`, t.pedagogy.whyItMatters, `${name} whyItMatters`);
    for (const other of t.pedagogy.compareWith || []) ctx.softRefs.push({ file, path: `${P}.pedagogy.compareWith`, kind: 'territory', id: other, from: name });
    if (!t.pedagogy.keyDates || t.pedagogy.keyDates.length < 3) {
      warn(file, `${P}.pedagogy.keyDates`, 'pedagogy/thin-key-dates', `${name}: fewer than three key dates; the quiz has little to work with`);
    }
  }

  /* --- cross-references (resolved later) ------------------------------ */
  for (const id of t.eventIds || []) ctx.softRefs.push({ file, path: `${P}.eventIds`, kind: 'event', id, from: name });
  for (const key of ['relatedTerritories', 'precededBy', 'succeededBy']) {
    for (const id of t[key] || []) ctx.softRefs.push({ file, path: `${P}.${key}`, kind: 'territory', id, from: name });
  }
  if (t.nestedWithin) {
    for (const parent of (Array.isArray(t.nestedWithin) ? t.nestedWithin : [t.nestedWithin])) {
      ctx.softRefs.push({ file, path: `${P}.nestedWithin`, kind: 'territory', id: parent, from: name });
    }
  }
  for (const d of deps) for (const b of d.becomes || []) if (b.territoryId) ctx.softRefs.push({ file, path: `${P}.departures`, kind: 'territory', id: b.territoryId, from: name });
}

function checkEvent(file, e, i, ctx) {
  const P = `events[${i}]`;
  const name = e.title || e.id || `#${i}`;
  if (e.id) {
    if (ctx.eventIds.has(e.id)) err(file, `${P}.id`, 'id/duplicate-event', `duplicate event id "${e.id}" (also in ${rel(ctx.eventIds.get(e.id))})`);
    else ctx.eventIds.set(e.id, file);
  }
  walkHistDates(e, P, (where, d, label) => checkHistDate(file, where, d, `${name} ${label}`));

  if (e.date && e.endDate) {
    const s = dStart(e.date);
    const en = dEnd(e.endDate);
    if (s !== null && en !== null && en < s) err(file, `${P}.endDate`, 'event/backwards', `${name}: ends (${dShow(e.endDate)}) before it starts (${dShow(e.date)})`);
  }
  const links = e.links || {};
  if ((links.territories || []).length === 0 && (links.units || []).length === 0) {
    err(file, `${P}.links`, 'event/unanchored', `${name}: an event must link to at least one territory or one geo unit, or it can never appear on the map`);
  }
  for (const id of links.territories || []) ctx.softRefs.push({ file, path: `${P}.links.territories`, kind: 'territory', id, from: name, hard: true });
  for (const id of links.events || []) ctx.softRefs.push({ file, path: `${P}.links.events`, kind: 'event', id, from: name });
  for (const u of links.units || []) ctx.useUnit(file, `${P}.links.units`, u, name);

  (e.evidence || []).forEach((c, k) => checkCitation(file, `${P}.evidence[${k}]`, c, name, ctx));
  walkTolls(e, P, (where, toll) => {
    if ((toll.deathsLow !== undefined || toll.deathsHigh !== undefined) && !toll.note) {
      err(file, where, 'toll/no-note', `${name}: a death toll with no note saying who counted it`);
    }
    if (toll.deathsLow !== undefined && toll.deathsHigh !== undefined && toll.deathsLow > toll.deathsHigh) {
      err(file, where, 'toll/backwards', `${name}: deathsLow is greater than deathsHigh`);
    }
  });
  checkProse(file, `${P}.summary`, e.summary, `${name} summary`);
  checkProse(file, `${P}.significance`, e.significance, `${name} significance`);
  if (e.contested && e.contested.isContested && !e.contested.note) {
    err(file, `${P}.contested`, 'evidence/contested-no-note', `${name}: marked contested with no note`);
  }
}

function checkCitation(file, where, c, owner, ctx) {
  if (!c || typeof c !== 'object') return;
  const year = c.year;
  const thisYear = new Date().getFullYear();
  if (typeof year === 'number' && year > thisYear) {
    err(file, `${where}.year`, 'evidence/future-citation', `${owner}: citation dated ${year}, which is in the future`);
  }
  if (c.locator && /^(p\.?\s?\d+|pp\.?\s?\d+)/i.test(c.locator) && (c.kind === undefined || c.kind === 'book')) {
    warn(file, `${where}.locator`, 'evidence/page-number', `${owner}: a precise page number is cited — only keep it if you are certain of the edition`, 'Rule 5 of the brief: never invent a citation.');
  }
  const key = `${(c.author || '').toLowerCase()}|${(c.work || '').toLowerCase()}`;
  const seen = ctx.citations.get(key);
  if (seen && seen.year !== c.year) {
    warn(file, `${where}.year`, 'evidence/inconsistent-year', `${owner}: "${c.work}" is dated ${c.year} here but ${seen.year} in ${rel(seen.file)}`);
  } else if (!seen) ctx.citations.set(key, { year: c.year, file });
}

function checkProse(file, where, text, label) {
  if (typeof text !== 'string' || !text) return;
  const low = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (low.includes(phrase)) {
      warn(file, where, 'prose/filler', `${label}: contains "${phrase}"`, 'House style: concrete, specific, human. Names, numbers, dates, consequences.');
    }
  }
  if (/\bTBD\b|\bTODO\b|\bXXX\b|lorem ipsum/i.test(text)) {
    err(file, where, 'prose/placeholder', `${label}: still contains placeholder text`);
  }
}

/** Walk any nested object and call back on things that look like histDates. */
function walkHistDates(node, where, cb, label) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkHistDates(v, `${where}[${i}]`, cb, label));
    return;
  }
  if (typeof node.precision === 'string' && (node.display !== undefined || node.value !== undefined)) {
    cb(where, node, label || where.split('.').slice(-1)[0]);
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === 'object') walkHistDates(v, `${where}.${k}`, cb, k);
  }
}

/** Walk any nested object and call back on toll-shaped objects. */
function walkTolls(node, where, cb) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach((v, i) => walkTolls(v, `${where}[${i}]`, cb));
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (!v || typeof v !== 'object') continue;
    if ((k === 'toll' || k === 'cost') && !Array.isArray(v)) cb(`${where}.${k}`, v);
    else walkTolls(v, `${where}.${k}`, cb);
  }
}

/* ------------------------------------------------------------------ *
 * Main
 * ------------------------------------------------------------------ */

function main() {
  if (!fs.existsSync(SCHEMA_PATH)) fail(`schema not found at ${rel(SCHEMA_PATH)}`);
  const schemaRead = readJson(SCHEMA_PATH);
  if (schemaRead.error) fail(`schema.json is not valid JSON: ${schemaRead.error}`);
  const schema = schemaRead.data;

  const shardFiles = listShards();
  const geo = loadGeoIndex();

  const ctx = {
    territoryIds: new Map(),
    eventIds: new Map(),
    stepIds: new Map(),
    citations: new Map(),
    softRefs: [],
    claims: [],
    unknownUnits: new Map(),
    usedUnits: new Set(),
    claimStepId(file, where, id, label) {
      if (this.stepIds.has(id)) {
        err(file, where, 'id/duplicate-step', `duplicate acquisition/departure id "${id}" (${label}); ids must be unique across the whole dataset because the app deep-links to them`);
      } else this.stepIds.set(id, file);
    },
    useUnit(file, where, unit, owner) {
      this.usedUnits.add(unit);
      if (!geo || geo.broken) return;
      if (geo.ids.has(unit) || geo.aliases.has(unit)) {
        if (geo.aliases.has(unit)) {
          warn(file, where, 'geo/alias', `${owner}: "${unit}" is an alias for "${geo.aliases.get(unit)}" — use the canonical id`);
        }
        return;
      }
      const key = `${file}|${where}|${unit}`;
      if (this.unknownUnits.has(key)) return;
      this.unknownUnits.set(key, true);
      const guess = nearest(unit, geo.ids);
      err(file, where, 'geo/unknown-unit', `${owner}: "${unit}" is not an id in app/data/geo/units.index.json`, guess ? `did you mean "${guess}"?` : 'The geometry agent owns that vocabulary; never invent a unit id.');
    },
  };

  if (!shardFiles.length) {
    process.stderr.write(`${C.yellow('nothing to validate:')} no .json shards in ${rel(TERRITORY_DIR)}\n`);
  }

  const perFile = [];
  const skipped = [];

  for (const file of shardFiles) {
    const f = rel(file);
    const r = readJson(file);
    if (r.error) {
      err(f, '', 'file/unparseable', `not valid JSON: ${r.error}`);
      perFile.push({ file: f, territories: 0, events: 0 });
      continue;
    }
    const data = r.data;

    // A manifest or index file is not a shard. Skip it, but say so.
    const looksLikeShard =
      data && typeof data === 'object' && !Array.isArray(data) &&
      (data.schemaVersion !== undefined || Array.isArray(data.territories) || Array.isArray(data.events));
    if (!looksLikeShard) {
      skipped.push({ file: f, why: 'no schemaVersion, territories or events — treated as a manifest, not a dataset shard' });
      continue;
    }

    // 1. schema conformance
    const schemaErrors = [];
    schemaValidate(schema, schema, data, '', schemaErrors);
    for (const e of schemaErrors) err(f, e.path || '(root)', 'schema', e.message, e.hint);

    // 2. semantics (run even if the schema complained; more findings per pass is better)
    const territories = Array.isArray(data.territories) ? data.territories : [];
    const events = Array.isArray(data.events) ? data.events : [];
    territories.forEach((t, i) => {
      checkTerritory(f, t, i, ctx);
      // A shard may honestly span several regions; it then declares shard.regions[].
      // Only complain when the territory's region is outside what the shard declares.
      if (data.shard && t.region && data.shard.region !== 'empire-wide') {
        const declared = Array.isArray(data.shard.regions) && data.shard.regions.length
          ? data.shard.regions
          : (data.shard.region ? [data.shard.region] : []);
        if (declared.length && !declared.includes(t.region)) {
          warn(f, `territories[${i}].region`, 'shard/region-mismatch', `${t.name || t.id}: region "${t.region}" is not among the regions this shard declares (${declared.join(', ')})`, 'Either the territory is in the wrong shard, or add the region to shard.regions[].');
        }
      }
    });
    events.forEach((e, i) => checkEvent(f, e, i, ctx));
    perFile.push({ file: f, territories: territories.length, events: events.length });
  }

  // 3. cross-shard reference resolution
  for (const ref of ctx.softRefs) {
    const pool = ref.kind === 'territory' ? ctx.territoryIds : ctx.eventIds;
    if (pool.has(ref.id)) continue;
    const guess = nearest(ref.id, pool.keys());
    const msg = `${ref.from}: references ${ref.kind} "${ref.id}", which no shard defines`;
    const hint = guess ? `did you mean "${guess}"?` : 'It may live in a shard not written yet — check before release.';
    if (ref.hard) err(ref.file, ref.path, `ref/missing-${ref.kind}`, msg, hint);
    else warn(ref.file, ref.path, `ref/missing-${ref.kind}`, msg, hint);
  }

  // 4. two territories claiming the same unit at the same time
  const byUnit = new Map();
  for (const c of ctx.claims) {
    for (const u of c.units) {
      if (!byUnit.has(u)) byUnit.set(u, []);
      byUnit.get(u).push(c);
    }
  }
  // Containment graph. nestedWithin may name one parent or several (a place can sit
  // inside different umbrellas at different times: Penang was a Straits Settlement,
  // then part of the Federation of Malaya). Two territories in the same containment
  // tree claiming one coarse unit is a map-resolution artefact, not a data error.
  const parents = new Map();
  for (const c of ctx.claims) {
    const p = c.nestedWithin;
    parents.set(c.territory, p == null ? [] : (Array.isArray(p) ? p : [p]));
  }
  const ancestorsOf = (id) => {
    const out = new Set();
    const stack = [...(parents.get(id) || [])];
    while (stack.length) {
      const n = stack.pop();
      if (!n || out.has(n)) continue;
      out.add(n);
      for (const p of parents.get(n) || []) stack.push(p);
    }
    return out;
  };
  const sameTree = (x, y) => {
    const ax = ancestorsOf(x), ay = ancestorsOf(y);
    if (ax.has(y) || ay.has(x)) return true;            // one contains the other
    for (const a of ax) if (ay.has(a)) return true;      // siblings under one umbrella
    return false;
  };

  const reportedPairs = new Set();
  for (const [unit, claims] of byUnit) {
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        const a = claims[i];
        const b = claims[j];
        if (a.territory === b.territory) continue;
        if (sameTree(a.territory, b.territory)) continue;
        if (a.start === null || b.start === null) continue;
        // Coverage periods are half-open [from, to): a period that ends on the day the
        // next one begins is a handover, not an overlap.
        if (a.start >= b.end || b.start >= a.end) continue;
        const pair = [a.territory, b.territory].sort().join('|') + '|' + unit;
        if (reportedPairs.has(pair)) continue;
        reportedPairs.add(pair);
        warn(a.file, `territories(${a.territory})`, 'geo/overlapping-claim', `"${a.territory}" and "${b.territory}" both cover unit "${unit}" at the same time`, 'If one sits inside the other, set nestedWithin. If they really are successive, fix the coverage dates.');
      }
    }
  }

  // 5. geo index availability
  if (!geo) {
    warn(rel(GEO_INDEX), '', 'geo/index-missing', `app/data/geo/units.index.json does not exist yet, so ${ctx.usedUnits.size} geo unit id(s) could not be checked`, 'Re-run once the geometry pipeline has produced it. Use --strict in CI to make this fatal.');
  } else if (!geo.broken) {
    const unused = [...geo.ids].filter((id) => !ctx.usedUnits.has(id));
    if (unused.length && !opts.quiet) {
      warn(rel(GEO_INDEX), '', 'geo/unused-units', `${unused.length} geo unit(s) are drawn but claimed by no territory`, unused.slice(0, 12).join(', ') + (unused.length > 12 ? ', …' : ''));
    }
  }

  // 6. THE GLOSS CHECK — does the sentence the app prints contradict the record?
  //
  // Three times this atlas printed a headline keyed to a mechanism tag that its
  // own record contradicted: Kenya 1920 under "taken from another European
  // coloniser", the Asian war-transfers under "Handed over by another European
  // power", and the Treaty of Amritsar under "Bought" when Britain was the
  // seller. Each was patched as a string and came back in a new form. So the
  // class is now a build gate. tools/check-gloss.js renders the real sentence
  // out of the app's own vocab.js — every acquisition, under every mechanism —
  // and reports any that asserts a direction, an agent or a party the record
  // does not warrant. Run as a child process because it must import an ES
  // module and this validator is synchronous by design.
  if (!argv.includes('--no-gloss')) runGlossCheck();

  // 7. THE WARRANT AUDIT — H1. Every printed quantity against the record that
  // warrants it. Reported, not failed: an unwarranted figure is a debt this
  // atlas admits on the page in --danger, not a build break. The one failure
  // is going backwards — tools/check-warrants.js carries a floor, and removing
  // a citation trips it.
  if (!argv.includes('--no-warrants')) runWarrantCheck();

  // 8. THE TIMING CHECK — does a printed minute agree with the one the app
  // computes? Same class as the gloss check, one directory over: a sentence in
  // one file asserting a number another file contradicts. Round 7 re-priced
  // every route and the teacher surfaces kept their typed figures, so the
  // printed pack said "the thirty-minute run" about a route the app was
  // pricing at 55. tools/check-timing.js imports app/js/tours/budget.js — the
  // one module allowed to turn a route into minutes — and reads the app's own
  // copy against it. Run as a child process for the same reason the gloss
  // check is: it must import ES modules and this validator is synchronous.
  if (!argv.includes('--no-timing')) runTimingCheck();

  // 9. THE PACK CHECK — does the printed page agree with the projector?
  // The same class again, one surface over. Wave 9's critics found the board
  // sheet asking a class to check a fact the route never taught, and a printed
  // step 1 asking a population-share question the app's step 1 never asks. A
  // teacher cannot run a page that disagrees with the screen. tools/check-pack.js
  // cross-references every printed prompt, task, board line and answer against
  // the beats actually on the route that pack is for — reading the pack's own
  // authored content out of app/js/teacher/unit.js and the routes out of
  // app/js/tours/budget.js — and fails on any reference to an off-route beat.
  // Child process, ES modules, same reason as the two above.
  if (!argv.includes('--no-pack')) runPackCheck();

  printReport(perFile, ctx, geo, skipped);
}

function runPackCheck() {
  const { execFileSync } = require('child_process');
  const script = path.join(__dirname, 'check-pack.js');
  if (!fs.existsSync(script)) {
    warn('tools/check-pack.js', '', 'pack/checker-missing',
      'the pack checker is not present, so no printed teacher page was checked against the route it is for',
      'It is the only guard against a printed sheet naming a beat the class never sees. Restore it.');
    return;
  }
  let payload = null;
  try {
    payload = JSON.parse(execFileSync(process.execPath, [script, '--json'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
  } catch (e) {
    try { payload = JSON.parse(String((e && e.stdout) || '')); } catch (_) {
      err('tools/check-pack.js', '', 'pack/checker-failed',
        'the pack checker could not run: ' + String((e && e.message) || e).split('\n')[0],
        'Run node tools/check-pack.js on its own to see why.');
      return;
    }
  }
  if (!payload) return;
  // TWO OF THE WARNING CODES ARE ABOUT THE ROUTE, NOT THE PACK, and while the
  // guided path is mid-way through the two-lesson split they fire once per
  // piece. One line each, counted, rather than eleven rows in a report ten
  // other agents read; `node tools/check-pack.js` lists every one.
  const lag = {};
  for (const f of payload.findings || []) {
    if (f.severity === 'error') { err('app/js/teacher/unit.js', '', f.code, f.message + ' — ' + f.where, f.hint); continue; }
    if (f.code === 'pack/beat-not-yet-on-route' || f.code === 'pack/beat-from-other-lesson') {
      lag[f.code] = (lag[f.code] || 0) + 1; continue;
    }
    warn('app/js/teacher/unit.js', '', f.code, f.message, f.hint);
  }
  const st = payload.stats || {};
  const ls = (payload.lessons || []).map((l) => l.name + ' → ' + (l.route || 'no route in this build')).join('; ');
  packNote = `pack check: ${st.pieces} pieces of authored teacher content — ${st.board} board lines, `
    + `${st.plan} plan rows, ${st.segmentBeats} segment beats, ${st.tasks} tasks — read against the beats `
    + `each lesson's own route runs. ${ls}.`
    + (st.selftest ? ` ${st.selftest.caught}/${st.selftest.replayed} historical regressions caught` : '')
    + (lag['pack/beat-not-yet-on-route'] ? `; ${lag['pack/beat-not-yet-on-route']} pieces print as extension because the route has not caught up with DIDACTIC_SPEC §8` : '')
    + (lag['pack/beat-from-other-lesson'] ? `; ${lag['pack/beat-from-other-lesson']} beats on a lesson's route belong to the other lesson` : '')
    + '.';
}

function runTimingCheck() {
  const { execFileSync } = require('child_process');
  const script = path.join(__dirname, 'check-timing.js');
  if (!fs.existsSync(script)) {
    warn('tools/check-timing.js', '', 'timing/checker-missing',
      'the timing checker is not present, so no printed duration was checked against the model',
      'It is the only guard against a typed minute figure going stale under a re-priced route. Restore it.');
    return;
  }
  let payload = null;
  try {
    payload = JSON.parse(execFileSync(process.execPath, [script, '--json', '--selftest'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
  } catch (e) {
    // exit 1 means findings and the JSON is still on stdout; anything else is a crash.
    try { payload = JSON.parse(String((e && e.stdout) || '')); } catch (_) {
      err('tools/check-timing.js', '', 'timing/checker-failed',
        'the timing checker could not run: ' + String((e && e.message) || e).split('\n')[0],
        'Run node tools/check-timing.js on its own to see why.');
      return;
    }
  }
  if (!payload) return;
  let loose = 0;
  for (const f of payload.findings || []) {
    if (f.severity === 'error') { err(f.file, '', f.code, f.message, f.hint); continue; }
    // A minute figure outside the timing surfaces that matches no route is
    // almost always history — "fired for about ten minutes" — and one warning
    // per sentence of Amritsar prose is noise in a report ten other agents
    // read. It is counted in the note below, and `node tools/check-timing.js`
    // lists every one of them with its file and line.
    if (f.code === 'timing/loose-figure') { loose++; continue; }
    warn(f.file, '', f.code, f.message, f.hint);
  }
  const st = payload.stats || {};
  const def = (payload.routes || []).find((r) => r.isDefault);
  const fits = (payload.routes || []).filter((r) => r.fitsPeriod).map((r) => r.id);
  timingNote = `timing check: ${payload.routes ? payload.routes.length : 0} routes costed at ${st.slowWpm} `
    + `and 180 words a minute; ${st.figures} printed minute figures read against them, ${st.exempt} exempt as history`
    + (st.selftest ? `; ${st.selftest.caught}/${st.selftest.replayed} historical regressions caught` : '')
    + `; ${loose} outside the timing surfaces match no route and read as history (check-timing lists them)`
    + `. Default: ${def ? def.id + ' (' + def.minutesSay + ' min, ' + def.covers + '/20 must-stick)' : 'none'}`
    + `; fits one ${st.period}-minute period: ${fits.length ? fits.join(', ') : 'NOTHING'}.`;
}

function runGlossCheck() {
  const { execFileSync } = require('child_process');
  const script = path.join(__dirname, 'check-gloss.js');
  if (!fs.existsSync(script)) {
    warn('tools/check-gloss.js', '', 'gloss/checker-missing', 'the gloss checker is not present, so no generated headline was checked against its record', 'It is the only guard against the class of defect that has now recurred three times. Restore it.');
    return;
  }
  let payload = null;
  try {
    const out = execFileSync(process.execPath, [script, '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    payload = JSON.parse(out);
  } catch (e) {
    // exit 1 means findings, and the JSON is still on stdout; anything else is a crash.
    const out = e && e.stdout ? String(e.stdout) : '';
    try { payload = JSON.parse(out); } catch (_) {
      err('tools/check-gloss.js', '', 'gloss/checker-failed', 'the gloss checker could not run: ' + String((e && e.message) || e).split('\n')[0], 'Run node tools/check-gloss.js on its own to see why.');
      return;
    }
  }
  for (const f of (payload && payload.findings) || []) {
    if (f.severity === 'error') err('app/data/territories', f.id, f.code, f.message, f.hint);
    // Other surfaces keep their own mechanism tables and are owned by other
    // agents. They are reported, not failed: a warning here, and --strict makes
    // it fatal, so the class cannot quietly survive somewhere else.
    else if (f.severity === 'warn') warn(f.id.split(':')[0], f.id, f.code, f.message, f.hint);
  }
  if (payload && payload.stats && !opts.quiet) {
    glossNote = `gloss check: ${payload.stats.sweptRenders} headlines rendered across every mechanism, ${payload.stats.teethRenders} across every direction, ${payload.stats.teethCaught} contradictions the checker can see.`;
  }
}

let glossNote = null;
let warrantNote = null;
let timingNote = null;
let packNote = null;

function runWarrantCheck() {
  const { execFileSync } = require('child_process');
  const script = path.join(__dirname, 'check-warrants.js');
  if (!fs.existsSync(script)) return;
  let payload = null;
  try { payload = JSON.parse(execFileSync(process.execPath, [script, '--json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })); }
  catch (e) { try { payload = JSON.parse(String((e && e.stdout) || '')); } catch (_) {
    err('tools/check-warrants.js', '', 'warrant/checker-failed', 'the warrant audit could not run: ' + String((e && e.message) || e).split('\n')[0]);
    return; } }
  if (!payload) return;
  if (payload.belowFloor) {
    err('app/data/territories', '', 'warrant/below-floor',
      `only ${payload.warranted} printed quantities carry a warrant, below the floor of ${payload.floor}`,
      'A citation has been removed. Run node tools/check-warrants.js --ok to see what is left.');
  }
  warrantNote = `warrant audit: ${payload.warranted} of ${payload.total} printed quantities carry the record that warrants them; ${payload.bare} print a defect marker in --danger.`;
}

function printReport(perFile, ctx, geo, skipped) {
  const errors = findings.filter((f) => f.severity === 'error');
  const warnings = findings.filter((f) => f.severity === 'warn');

  if (opts.json) {
    process.stdout.write(
      JSON.stringify(
        {
          ok: errors.length === 0 && (!opts.strict || warnings.length === 0),
          counts: {
            errors: errors.length,
            warnings: warnings.length,
            shards: perFile.length,
            territories: perFile.reduce((a, f) => a + f.territories, 0),
            events: perFile.reduce((a, f) => a + f.events, 0),
          },
          files: perFile,
          skipped,
          findings,
        },
        null,
        2
      ) + '\n'
    );
  } else {
    const out = [];
    out.push('');
    out.push(C.bold('British Empire Atlas — dataset validation'));
    const nT = perFile.reduce((a, f) => a + f.territories, 0);
    const nE = perFile.reduce((a, f) => a + f.events, 0);
    out.push(C.dim(`schema ${rel(SCHEMA_PATH)} · ${perFile.length} shard(s) · ${nT} territories · ${nE} events`));
    out.push('');

    const byFile = new Map();
    for (const f of findings) {
      if (opts.quiet && f.severity === 'warn') continue;
      if (!byFile.has(f.file)) byFile.set(f.file, []);
      byFile.get(f.file).push(f);
    }

    if (byFile.size === 0) {
      out.push(C.green('  No problems found.'));
    }

    for (const [file, list] of byFile) {
      const e = list.filter((x) => x.severity === 'error').length;
      const w = list.filter((x) => x.severity === 'warn').length;
      out.push(`${C.bold(C.cyan(file))} ${C.dim(`— ${e} error(s), ${w} warning(s)`)}`);
      for (const f of list) {
        const tag = f.severity === 'error' ? C.red('ERROR') : C.yellow(' WARN');
        out.push(`  ${tag} ${C.dim(f.path || '(root)')}`);
        out.push(`        ${f.message}`);
        if (f.hint) out.push(`        ${C.dim('→ ' + f.hint)}`);
        out.push(`        ${C.dim('[' + f.code + ']')}`);
      }
      out.push('');
    }

    // per-shard inventory
    if (perFile.length && !opts.quiet) {
      out.push(C.bold('Shards'));
      for (const f of perFile) out.push(`  ${f.file}  ${C.dim(`${f.territories} territories, ${f.events} events`)}`);
      for (const s2 of skipped) out.push(`  ${s2.file}  ${C.dim(`skipped — ${s2.why}`)}`);
      out.push('');
    }

    if (glossNote) out.push(C.dim('  ' + glossNote));
    if (warrantNote) out.push(C.dim('  ' + warrantNote));
    if (timingNote) out.push(C.dim('  ' + timingNote));
    if (packNote) out.push(C.dim('  ' + packNote));
    if (!geo) out.push(C.yellow('  geo index not present — unit ids were not verified.'));
    else if (geo.ids) out.push(C.dim(`  geo index: ${geo.ids.size} unit id(s) known, ${ctx.usedUnits.size} referenced by the dataset.`));

    out.push('');
    const summary = `${errors.length} error(s), ${warnings.length} warning(s)`;
    if (errors.length) out.push(C.red(C.bold(`FAIL — ${summary}`)));
    else if (warnings.length && opts.strict) out.push(C.red(C.bold(`FAIL (--strict) — ${summary}`)));
    else if (warnings.length) out.push(C.yellow(`PASS with warnings — ${summary}`));
    else out.push(C.green(C.bold('PASS — clean')));
    out.push('');
    process.stdout.write(out.join('\n'));
  }

  process.exit(errors.length || (opts.strict && warnings.length) ? 1 : 0);
}

try {
  main();
} catch (e) {
  fail(e && e.stack ? e.stack : String(e));
}
