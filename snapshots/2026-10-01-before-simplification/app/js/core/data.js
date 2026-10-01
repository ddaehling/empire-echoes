/**
 * data.js — the data layer. Loads the dataset, builds the indices, and answers
 * the one question the whole atlas keeps asking:
 *
 *      "In year Y, who held what, how completely, and for how long by then?"
 *
 * The map calls statusAt() on every scrub frame, so it must be O(log n) after
 * the first visit to a period. It is: the timeline is cut into segments at every
 * year where anything changes, and each segment's answer is computed once and
 * cached. The same year twice returns the SAME Map object, so callers can skip
 * work with a `===` check.
 *
 * ---------------------------------------------------------------------------
 * WHAT IT READS  (see docs/DATA_MODEL.md for the full schema, which is owned by
 * the data-model agent; this file is the reader, not the authority)
 *
 *   app/data/territories/index.json     { shards: [...], events: [...], statuses, regions, meta }
 *                                       regenerate with `node tools/data-index.js`
 *   app/data/territories/<shard>.json   { shard: {...}, territories: [...], events: [...] }
 *   app/data/events/<theme>.json        { events: [...] }
 *   app/data/geo/index.json             { files: [{ id, file, object|objects, preload }], units: "units.index.json" }
 *
 * A territory carries `geoCoverage` (extent over time) and `statusPeriods`
 * (constitutional status over time) as two independent axes. This file crosses
 * them into flat, year-indexed **spans** — one status on one set of units over
 * one stretch of years — because that is what a map can paint.
 *
 * The older flat shape (`{ units, spans:[{start,end,status}] }`) is still read,
 * so the built-in placeholder and any quick fixture keep working.
 * ---------------------------------------------------------------------------
 */

import { bisect, clamp, getJson } from './util.js';

const DATA_BASE = new URL('../../data/', import.meta.url);

/**
 * Legacy fallback only. In the v1 schema, control is `controlDegree > 0`:
 * 0 means no British authority (an informal sphere, or Hong Kong under Japanese
 * occupation), and everything from a dominion (1) to a crown colony (5) counts.
 */
const NON_CONTROL = new Set([
  'independent', 'independence', 'post-independence', 'former', 'lost', 'ceded',
  'relinquished', 'withdrawn', 'none', 'not-british', 'pre-colonial', 'commonwealth',
]);

/** Precisions that should print as "c. 1612" rather than "1612". */
const SOFT = new Set(['circa', 'decade', 'range', 'contested', 'unknown']);

const EMPTY_MAP = Object.freeze(new Map());

/* ============================================================== dates ===== */

const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
const str = (v) => (v == null ? null : String(v));
const int = (v) => { const n = typeof v === 'string' ? parseInt(v, 10) : v; return Number.isFinite(n) ? Math.trunc(n) : null; };

/**
 * Every date in the dataset is an object: { value:"1898-07-01", precision,
 * display, end, note }. Bare numbers and "1898-07-01" strings are accepted too.
 * Returns { year, month, day, precision, display, note, circa, endYear } or null.
 */
export function readDate(d) {
  if (d == null || d === '') return null;
  if (typeof d === 'number') return { year: Math.trunc(d), month: null, day: null, precision: 'year', display: null, note: null, circa: false, endYear: null };
  if (typeof d === 'string') {
    const m = /^(-?\d{1,4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/.exec(d.trim());
    if (!m) return null;
    return { year: +m[1], month: m[2] ? +m[2] : null, day: m[3] ? +m[3] : null, precision: m[3] ? 'exact' : m[2] ? 'month' : 'year', display: null, note: null, circa: /^c\.?\s|circa/i.test(d), endYear: null };
  }
  if (typeof d !== 'object') return null;
  const base = readDate(d.value ?? d.date ?? d.year ?? null);
  if (!base) return null;
  const precision = str(d.precision) || base.precision;
  const end = readDate(d.end ?? null);
  return {
    year: base.year, month: base.month, day: base.day,
    precision, display: str(d.display), note: str(d.note),
    circa: SOFT.has(precision), endYear: end ? end.year : null,
  };
}

const yearOf = (d) => { const r = readDate(d); return r ? r.year : null; };

/* ======================================================== normalising ===== */

/**
 * Cross the two axes. `periods` are the status periods, `coverage` the extent
 * periods; both use an EXCLUSIVE `to` where it abuts the next period's `from`
 * (the contiguity rule in DATA_MODEL §3.3) and an inclusive one otherwise.
 */
function toRanges(list, keyFrom = 'from', keyTo = 'to') {
  const rows = list.map(p => ({ raw: p, from: readDate(p[keyFrom]), to: readDate(p[keyTo]) }))
    .filter(r => r.from)
    .sort((a, b) => a.from.year - b.from.year);
  return rows.map((r, i) => {
    const next = rows[i + 1];
    let end = null;
    if (r.to) {
      const abuts = next && next.from.year === r.to.year;
      end = abuts ? r.to.year - 1 : r.to.year;
      if (end < r.from.year) end = r.from.year;
    }
    return { raw: r.raw, start: r.from.year, end, from: r.from, toDate: r.to };
  });
}

function spansFromV1(t, raw) {
  const coverage = toRanges(arr(raw.geoCoverage));
  const statuses = toRanges(arr(raw.statusPeriods));
  if (!statuses.length) return [];

  const fallbackUnits = coverage.length ? [] : t.units;
  const covers = coverage.length ? coverage : [{ raw: {}, start: -Infinity, end: null, from: null }];
  const out = [];

  for (const sp of statuses) {
    const s = sp.raw;
    const degree = Number.isFinite(s.controlDegree) ? s.controlDegree : null;
    for (const cv of covers) {
      const start = Math.max(sp.start, cv.start === -Infinity ? sp.start : cv.start);
      const spEnd = sp.end == null ? Infinity : sp.end;
      const cvEnd = cv.end == null ? Infinity : cv.end;
      const end = Math.min(spEnd, cvEnd);
      if (start > end) continue;
      const units = (cv.raw.units ? arr(cv.raw.units).map(String) : fallbackUnits);
      out.push({
        territoryId: t.id,
        start,
        end: end === Infinity ? null : end,
        status: str(s.status) || 'held',
        controlDegree: degree,
        controlled: degree != null ? degree > 0 : !NON_CONTROL.has(str(s.status)),
        units,
        partial: arr(cv.raw.partial).map(String),
        label: str(s.label) || null,
        note: str(s.note) || null,
        governedFrom: str(s.governedFrom) || null,
        localLegislature: str(s.localLegislature) || null,
        franchise: str(s.franchise) || null,
        howControlWorked: str(s.howControlWorked) || null,
        circa: !!(sp.from && sp.from.circa),
        circaEnd: !!(sp.toDate && sp.toDate.circa),
        contested: !!(s.contested || (sp.from && sp.from.precision === 'contested')),
        gapBefore: !!s.gapBefore,
        from: sp.from, to: sp.toDate,
        coverageLabel: str(cv.raw.label) || null,
        coverageChange: str(cv.raw.change) || null,
        sources: arr(s.evidence ?? s.sources),
        raw: s,
      });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

function spansFromLegacy(t, raw) {
  return arr(raw.spans ?? raw.periods ?? raw.control ?? raw.timeline).map(s => {
    if (!s || typeof s !== 'object') return null;
    const start = int(s.start ?? s.from ?? s.begin ?? s.year);
    if (start == null) return null;
    const rawEnd = s.end ?? s.to ?? s.until;
    const end = rawEnd == null || rawEnd === 'present' || rawEnd === '' ? null : int(rawEnd);
    const status = str(s.status ?? s.type ?? s.state) || 'held';
    const units = arr(s.units ?? s.unitIds ?? s.unit).map(String);
    const degree = Number.isFinite(s.controlDegree) ? s.controlDegree : null;
    return {
      territoryId: t.id, start, end, status,
      controlDegree: degree,
      controlled: typeof s.controlled === 'boolean' ? s.controlled : (degree != null ? degree > 0 : !NON_CONTROL.has(status)),
      units: units.length ? units : t.units,
      partial: arr(s.partial).map(String),
      label: str(s.label) || null, note: str(s.note ?? s.caveat) || null,
      circa: !!(s.circa ?? s.circaStart ?? s.approx), circaEnd: !!s.circaEnd,
      contested: !!s.contested, gapBefore: false,
      from: null, to: null, sources: arr(s.sources ?? s.source), raw: s,
    };
  }).filter(Boolean).sort((a, b) => a.start - b.start);
}

/** An acquisition or a departure, flattened to something the timeline can plot. */
function normStep(raw, t, kind) {
  const d = readDate(raw.date);
  return {
    ...raw,
    kind,
    id: str(raw.id) || (t.id + ':' + kind + ':' + (d ? d.year : '?')),
    territoryId: t.id,
    territoryName: t.name,
    region: t.region,
    year: d ? d.year : null,
    date: d,
    mechanism: str(raw.mechanism) || null,
    how: str(raw.how) || null,
    units: arr(raw.units).map(String),
  };
}

function normEvent(raw, territory) {
  if (!raw || typeof raw !== 'object') return null;
  const d = readDate(raw.date ?? raw.year ?? raw.start);
  if (!d) return null;
  const links = raw.links || {};
  const territoryIds = arr(links.territories ?? raw.territoryIds ?? (territory ? territory.id : null)).map(String);
  const end = readDate(raw.endDate);
  return {
    ...raw,
    id: str(raw.id) || ((territoryIds[0] || 'event') + ':' + d.year + ':' + (raw.kind || raw.type || 'event')),
    year: d.year, month: d.month, day: d.day,
    date: d, endYear: end ? end.year : null,
    type: str(raw.kind ?? raw.type) || 'event',
    title: str(raw.title ?? raw.name) || '',
    summary: str(raw.summary ?? raw.text ?? raw.description) || '',
    significance: str(raw.significance) || '',
    circa: d.circa,
    territoryIds,
    territoryId: territoryIds[0] || (territory ? territory.id : null),
    territoryName: territory ? territory.name : null,
    unitIds: arr(links.units ?? raw.unitIds).map(String),
    places: arr(links.places),
    region: str(raw.region) || (territory ? territory.region : null),
    changedStatus: !!raw.changedStatus,
    sources: arr(raw.evidence ?? raw.sources ?? raw.source),
  };
}

function normTerritory(raw, shardRegion) {
  if (!raw || typeof raw !== 'object') return null;
  const id = str(raw.id ?? raw.territoryId ?? raw.slug);
  if (!id) return null;

  const t = {
    ...raw,
    id,
    name: str(raw.name ?? raw.title) || id,
    formalName: str(raw.formalName) || null,
    shortName: str(raw.shortName ?? raw.short ?? raw.name ?? raw.title) || id,
    region: str(raw.region ?? raw.area ?? shardRegion) || 'unplaced',
    subregion: str(raw.subregion) || null,
    nestedWithin: str(raw.nestedWithin) || null,
  };

  // Alternate names: the v1 model records who used each name and when.
  const aka = new Set(arr(raw.aka ?? raw.alsoKnownAs ?? raw.alternateNames).map(String));
  for (const n of arr(raw.namesOverTime)) if (n && n.name && n.name !== t.name) aka.add(String(n.name));
  if (t.formalName && t.formalName !== t.name) aka.add(t.formalName);
  for (const s of arr(raw.modernSuccessors)) if (s && s.name && s.name !== t.name) aka.add(String(s.name));
  t.aka = [...aka];

  // Units: the union of every coverage period, or the flat list in older data.
  const units = new Set(arr(raw.units ?? raw.unitIds ?? raw.geoUnits ?? raw.iso ?? raw.isoCodes).map(String));
  for (const c of arr(raw.geoCoverage)) for (const u of arr(c && c.units)) units.add(String(u));
  t.units = [...units];

  t.spans = raw.statusPeriods ? spansFromV1(t, raw) : spansFromLegacy(t, raw);
  if (!t.spans.length && raw.spans) t.spans = spansFromLegacy(t, raw);
  if (!t.units.length) {
    const fromSpans = new Set();
    for (const s of t.spans) for (const u of s.units) fromSpans.add(u);
    t.units = [...fromSpans];
  }

  t.acquisitions = arr(raw.acquisitions).map(a => normStep(a, t, 'acquisition')).sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  t.departures = arr(raw.departures).map(d => normStep(d, t, 'departure')).sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  t.eventIds = arr(raw.eventIds).map(String);
  t.events = arr(raw.events).map(e => normEvent(e, t)).filter(Boolean);

  const controlled = t.spans.filter(s => s.controlled);
  t.firstYear = t.spans.length ? t.spans[0].start : null;
  t.lastYear = t.spans.length ? t.spans.reduce((m, s) => (s.end == null ? Infinity : Math.max(m, s.end)), -Infinity) : null;
  t.acquiredYear = (t.acquisitions[0] && t.acquisitions[0].year) ?? (controlled.length ? controlled[0].start : null);
  t.endedYear = (t.departures[0] && t.departures[0].year)
    ?? (controlled.length && controlled[controlled.length - 1].end != null ? controlled[controlled.length - 1].end : null);
  t.stillBritish = raw.stillBritish || null;
  t.tenureYears = t.acquiredYear != null
    ? (t.endedYear != null ? t.endedYear - t.acquiredYear : new Date().getFullYear() - t.acquiredYear)
    : null;
  return t;
}

/* ================================================================ loading == */

function rowsOf(payload, key) {
  if (Array.isArray(payload)) return key === 'territories' ? payload : [];
  if (!payload || typeof payload !== 'object') return [];
  return Array.isArray(payload[key]) ? payload[key]
    : (key === 'territories' && Array.isArray(payload.items)) ? payload.items : [];
}

async function loadTerritoryShards(base) {
  const warnings = [];
  const dir = new URL('territories/', base);

  let manifest = await getJson(new URL('index.json', dir));
  if (!manifest) manifest = await getJson(new URL('manifest.json', dir));

  let files = [], statusMeta = [], regionMeta = [], meta = {}, eventFiles = [];
  if (Array.isArray(manifest)) files = manifest;
  else if (manifest && typeof manifest === 'object') {
    files = manifest.shards || manifest.files || [];
    eventFiles = manifest.events || [];
    statusMeta = manifest.statuses || [];
    regionMeta = (manifest.regions || []).filter(r => r && r.label);
    meta = manifest.meta || {};
  }

  const entries = files.map(f => (typeof f === 'string'
    ? { file: f.endsWith('.json') ? f : f + '.json', region: f.replace(/\.json$/, '') }
    : { file: f.file || (f.id ? f.id + '.json' : null), region: f.region || f.id || null }))
    .filter(e => e.file);

  if (!entries.length && !manifest) {
    // No manifest at all — try the conventional single-file names, then give up
    // quietly. When a manifest EXISTS we trust it exactly and probe nothing, so
    // a healthy boot makes no failing requests.
    for (const name of ['all.json', 'territories.json']) {
      const probe = await getJson(new URL(name, dir));
      if (probe) { entries.push({ file: name, region: null, inline: probe }); break; }
    }
  }

  const territories = [];
  const looseEvents = [];
  const seen = new Set();

  await Promise.all(entries.map(async (entry) => {
    const payload = entry.inline || await getJson(new URL(entry.file, dir));
    if (!payload) { warnings.push('shard missing: territories/' + entry.file); return; }
    const header = (payload && !Array.isArray(payload) && payload.shard) || {};
    const shardRegion = header.region || (payload && !Array.isArray(payload) && payload.region) || entry.region;
    const rows = rowsOf(payload, 'territories');
    if (!rows.length && !rowsOf(payload, 'events').length) warnings.push('shard empty: territories/' + entry.file);
    for (const row of rows) {
      const t = normTerritory(row, shardRegion);
      if (!t) { warnings.push('unreadable territory in ' + entry.file); continue; }
      if (seen.has(t.id)) { warnings.push('duplicate territory id "' + t.id + '" in ' + entry.file); continue; }
      seen.add(t.id);
      t.shard = entry.file;
      territories.push(t);
    }
    for (const e of rowsOf(payload, 'events')) { const ev = normEvent(e, null); if (ev) { ev.shard = entry.file; looseEvents.push(ev); } }
  }));

  await Promise.all(eventFiles.map(async (f) => {
    const payload = await getJson(new URL(String(f), dir));
    if (!payload) { warnings.push('event shard missing: ' + f); return; }
    for (const e of rowsOf(payload, 'events').concat(Array.isArray(payload) ? payload : [])) {
      const ev = normEvent(e, null); if (ev) { ev.shard = String(f); looseEvents.push(ev); }
    }
  }));

  return { territories, looseEvents, statusMeta, regionMeta, meta, warnings, manifest: !!manifest };
}

async function loadGeo(base) {
  const dir = new URL('geo/', base);
  const warnings = [];
  let index = await getJson(new URL('index.json', dir));
  if (!index) index = await getJson(new URL('manifest.json', dir));

  let entries = [];
  if (Array.isArray(index)) entries = index.map(f => ({ id: String(f).replace(/\.[^.]+$/, ''), file: String(f) }));
  else if (index && typeof index === 'object') {
    const list = index.files || index.layers || index.geo || [];
    entries = (Array.isArray(list) ? list : Object.entries(list).map(([id, file]) => ({ id, file })))
      .map(f => (typeof f === 'string' ? { id: f.replace(/\.[^.]+$/, ''), file: f } : f))
      .filter(f => f && f.file);
  }
  if (!entries.length && !index) {
    for (const name of ['world.topo.json', 'world.json']) {
      const probe = await getJson(new URL(name, dir));
      if (probe) { entries.push({ id: 'world', file: name, inline: probe }); break; }
    }
  }

  // Several layers routinely share one file (land + lakes + graticule all live in
  // land.topo.json), so fetch each FILE once and hand the topology to each layer.
  const fileCache = new Map();
  const fetchFile = (file) => {
    if (!fileCache.has(file)) fileCache.set(file, getJson(new URL(file, dir)));
    return fileCache.get(file);
  };
  const isLazy = (e) => e.preload === false || e.lazy === true
    || /lazil?y|on demand|when needed/i.test(String(e.use || e.note || ''));

  const layers = {};
  await Promise.all(entries.map(async (e) => {
    const id = e.id || e.file;
    const meta = {
      id, file: e.file, object: e.object || null, objects: e.objects || null,
      detail: e.detail || null, projection: e.projection || null,
      lazy: isLazy(e), data: null, loaded: false, meta: e,
    };
    layers[id] = meta;
    if (meta.lazy) return;                       // fetched on demand instead
    const payload = e.inline || await fetchFile(e.file);
    if (!payload) { warnings.push('geometry missing: geo/' + e.file); return; }
    meta.data = payload; meta.loaded = true;
  }));

  // Per-unit metadata (name, aliases, region, centroid, area). Only probed once
  // geometry actually exists, so an empty app/data/geo/ makes no failing request.
  let unitMeta = null;
  const named = index && index.units;
  const candidates = named ? [String(named)] : (Object.keys(layers).length ? ['units.index.json', 'units.json'] : []);
  for (const name of candidates) {
    const rows = await getJson(new URL(name, dir));
    if (!rows) continue;
    unitMeta = Array.isArray(rows)
      ? new Map(rows.map(r => [String(r.id ?? r), typeof r === 'object' ? r : { id: String(r) }]))
      : new Map(Object.entries(rows));
    break;
  }

  /** Fetch a layer marked `preload: false`. Safe to call repeatedly. */
  const loadLayer = async (id) => {
    const meta = layers[id];
    if (!meta) return null;
    if (meta.loaded) return meta.data;
    const payload = await fetchFile(meta.file);
    if (!payload) { warnings.push('geometry missing: geo/' + meta.file); return null; }
    meta.data = payload; meta.loaded = true;
    return payload;
  };

  return { layers, index: index || null, unitMeta, warnings, loadLayer, available: Object.values(layers).some(l => l.loaded) };
}

/* ============================================================ placeholder == */

/**
 * A deliberately tiny, deliberately accurate stand-in so the shell boots and
 * every other module can be developed before the real shards land. Every date
 * here is uncontroversial. The app labels it as a placeholder in the footer.
 * Unit ids follow app/data/geo/units.index.json.
 */
export function placeholderTerritories() {
  const P = (id, name, region, units, spans, events) => ({ id, name, region, units, spans, events, placeholder: true });
  return [
    P('virginia', 'Virginia', 'north-america', ['united-states'],
      [{ start: 1607, end: 1776, status: 'colony', controlDegree: 4 }, { start: 1776, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1607, kind: 'founding', title: 'Jamestown founded', summary: 'The Virginia Company plants a settlement on Powhatan land.' },
       { year: 1776, kind: 'independence', title: 'Declaration of Independence', summary: 'Thirteen colonies declare independence from Britain.' }]),
    P('jamaica', 'Jamaica', 'caribbean', ['jamaica'],
      [{ start: 1655, end: 1962, status: 'crown-colony', controlDegree: 5 }, { start: 1962, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1655, kind: 'conquest', title: 'English invasion', summary: 'An English fleet takes Jamaica from Spain.' },
       { year: 1834, kind: 'abolition', title: 'Slavery Abolition Act takes effect', summary: 'Enslaved people are moved into unpaid "apprenticeship" until 1838.' },
       { year: 1962, kind: 'independence', title: 'Independence', summary: 'Jamaica becomes independent on 6 August 1962.', date: '1962-08-06' }]),
    P('bengal', 'Bengal', 'south-asia', ['india', 'bangladesh'],
      [{ start: 1757, end: 1858, status: 'company-rule', controlDegree: 4 }, { start: 1858, end: 1947, status: 'crown-rule', controlDegree: 5 }, { start: 1947, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1757, kind: 'battle', title: 'Battle of Plassey', summary: 'Company forces under Robert Clive defeat Siraj-ud-Daulah.', date: '1757-06-23' },
       { year: 1770, kind: 'famine', title: 'Great Bengal famine', summary: 'Perhaps a third of the population of Bengal dies.' },
       { year: 1858, kind: 'constitutional', title: 'Crown takes over from the Company', summary: 'The Government of India Act transfers rule to the Crown.' },
       { year: 1947, kind: 'independence', title: 'Partition', summary: 'Bengal is divided between India and Pakistan.', date: '1947-08-15' }]),
    P('canada', 'Canada', 'north-america', ['canada'],
      [{ start: 1763, end: 1867, status: 'crown-colony', controlDegree: 5 }, { start: 1867, end: 1931, status: 'dominion', controlDegree: 1 }, { start: 1931, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1763, kind: 'treaty', title: 'Treaty of Paris', summary: 'France cedes New France to Britain.' },
       { year: 1867, kind: 'constitutional', title: 'Confederation', summary: 'The British North America Act creates the Dominion of Canada.', date: '1867-07-01' },
       { year: 1931, kind: 'constitutional', title: 'Statute of Westminster', summary: 'Dominions gain legislative independence.' }]),
    P('hong-kong', 'Hong Kong', 'east-asia', ['hk-hong-kong-island', 'hk-kowloon', 'hk-new-territories'],
      [{ start: 1842, end: 1997, status: 'crown-colony', controlDegree: 5 }, { start: 1997, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1842, kind: 'treaty', title: 'Treaty of Nanking', summary: 'Hong Kong Island is ceded after the First Opium War.' },
       { year: 1997, kind: 'constitutional', title: 'Handover to China', summary: 'Sovereignty returns to China on 1 July 1997.', date: '1997-07-01' }]),
    P('gold-coast', 'Gold Coast', 'west-africa', ['ghana'],
      [{ start: 1821, end: 1957, status: 'crown-colony', controlDegree: 5 }, { start: 1957, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1957, kind: 'independence', title: 'Ghana independent', summary: 'Kwame Nkrumah leads the first sub-Saharan colony to independence.', date: '1957-03-06' }]),
    P('new-south-wales', 'New South Wales', 'australasia', ['australia'],
      [{ start: 1788, end: 1901, status: 'crown-colony', controlDegree: 5 }, { start: 1901, end: 1931, status: 'dominion', controlDegree: 1 }, { start: 1931, end: null, status: 'independent', controlDegree: 0 }],
      [{ year: 1788, kind: 'founding', title: 'First Fleet lands at Sydney Cove', summary: 'A penal colony is established on Eora country.', date: '1788-01-26' },
       { year: 1901, kind: 'constitutional', title: 'Federation', summary: 'Six colonies federate as the Commonwealth of Australia.', date: '1901-01-01' }]),
  ];
}

/* ================================================================= build == */

function buildIndex(territories) {
  const byId = new Map(), byRegion = new Map(), byUnit = new Map();
  const spans = [], events = [], acquisitions = [], departures = [];
  const statusCounts = new Map();

  for (const t of territories) {
    byId.set(t.id, t);
    if (!byRegion.has(t.region)) byRegion.set(t.region, []);
    byRegion.get(t.region).push(t);
    for (const u of t.units) {
      if (!byUnit.has(u)) byUnit.set(u, []);
      byUnit.get(u).push(t);
    }
    for (const s of t.spans) {
      s.territory = t;
      spans.push(s);
      statusCounts.set(s.status, (statusCounts.get(s.status) || 0) + 1);
    }
    for (const e of t.events) events.push(e);
    for (const a of t.acquisitions) acquisitions.push(a);
    for (const d of t.departures) departures.push(d);
  }
  spans.sort((a, b) => a.start - b.start);
  acquisitions.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  departures.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
  return { byId, byRegion, byUnit, spans, events, acquisitions, departures, statusCounts };
}

/** Merged, gap-tolerant runs of British control per geography unit, across all territories. */
function buildUnitRuns(spans) {
  const raw = new Map();
  for (const s of spans) {
    if (!s.controlled) continue;
    for (const u of s.units) {
      if (!raw.has(u)) raw.set(u, []);
      raw.get(u).push([s.start, s.end == null ? Infinity : s.end]);
    }
  }
  const runs = new Map();
  for (const [u, list] of raw) {
    list.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [a, b] of list) {
      const last = merged[merged.length - 1];
      if (last && a <= last[1] + 1) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
    }
    runs.set(u, merged);
  }
  return runs;
}

function runStart(runs, unit, year) {
  const list = runs.get(unit);
  if (!list) return null;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i][0] <= year) return year <= list[i][1] ? list[i][0] : null;
  }
  return null;
}

function buildCuts(spans, floor, ceil) {
  const set = new Set([floor, ceil]);
  for (const s of spans) {
    if (s.start >= floor && s.start <= ceil) set.add(s.start);
    if (s.end != null && s.end + 1 >= floor && s.end + 1 <= ceil) set.add(s.end + 1);
  }
  return [...set].sort((a, b) => a - b);
}

/* =================================================================== API == */

export async function loadData({ base = DATA_BASE, territories: injected = null } = {}) {
  const t0 = performance.now();
  const [terr, geo] = await Promise.all([
    injected
      ? { territories: injected.map(r => normTerritory(r)).filter(Boolean), looseEvents: [], statusMeta: [], regionMeta: [], meta: {}, warnings: [], manifest: true }
      : loadTerritoryShards(base),
    loadGeo(base),
  ]);

  let territories = terr.territories;
  let placeholder = false;
  const warnings = [...terr.warnings, ...geo.warnings];
  if (!territories.length) {
    placeholder = true;
    territories = placeholderTerritories().map(r => normTerritory(r)).filter(Boolean);
    warnings.push('No territory shards listed in app/data/territories/index.json — using the built-in placeholder dataset. Run `node tools/data-index.js` once shards exist.');
  }

  // Empire-wide events live apart from territories; hang each one on every
  // territory it links to, and honour a territory's own eventIds.
  const byId = new Map(territories.map(t => [t.id, t]));
  const eventById = new Map();
  for (const t of territories) for (const e of t.events) eventById.set(e.id, e);
  for (const e of terr.looseEvents) {
    eventById.set(e.id, e);
    for (const tid of e.territoryIds) { const t = byId.get(tid); if (t && !t.events.includes(e)) t.events.push(e); }
  }
  for (const t of territories) {
    for (const eid of t.eventIds) {
      const e = eventById.get(eid);
      if (e && !t.events.includes(e)) t.events.push(e);
      else if (!e) warnings.push('territory "' + t.id + '" references unknown event "' + eid + '"');
    }
    t.events.sort((a, b) => a.year - b.year || (a.month || 0) - (b.month || 0) || (a.day || 0) - (b.day || 0));
  }

  return buildApi({ territories, allEvents: [...eventById.values()], terr, geo, placeholder, warnings, ms: performance.now() - t0 });
}

function buildApi({ territories, allEvents, terr, geo, placeholder, warnings, ms }) {
  const idx = buildIndex(territories);
  idx.events = allEvents.sort((a, b) => a.year - b.year || (a.month || 0) - (b.month || 0) || (a.day || 0) - (b.day || 0));
  const unitRuns = buildUnitRuns(idx.spans);

  const thisYear = new Date().getFullYear();
  let min = Infinity, max = -Infinity;
  for (const s of idx.spans) { min = Math.min(min, s.start); max = Math.max(max, s.end == null ? thisYear : s.end); }
  for (const e of idx.events) { min = Math.min(min, e.year); max = Math.max(max, e.year); }
  if (!Number.isFinite(min)) { min = 1497; max = thisYear; }
  min = Math.floor(min / 10) * 10;
  max = Math.min(Math.ceil(max / 10) * 10, thisYear + 1);

  const cuts = buildCuts(idx.spans, min, max);
  const segments = new Array(cuts.length);
  const segMetrics = new Array(cuts.length);
  const eventYears = idx.events.map(e => e.year);

  function segmentIndex(year) {
    const y = clamp(Math.round(Number(year) || min), min, max);
    const i = bisect(cuts, y);
    return i < 0 ? 0 : i;
  }

  // Later start wins; a territory nested inside another beats its parent; then
  // the more specific claim (fewer units); then stable by id.
  function wins(a, b) {
    if (a.territory && a.territory.nestedWithin === b.territoryId) return true;
    if (b.territory && b.territory.nestedWithin === a.territoryId) return false;
    if (a.start !== b.start) return a.start > b.start;
    if (a.units.length !== b.units.length) return a.units.length < b.units.length;
    return a.territoryId > b.territoryId;
  }

  function buildSegment(year) {
    const m = new Map();
    for (const s of idx.spans) {
      if (s.start > year) break;                        // spans are sorted by start
      if (s.end != null && year > s.end) continue;
      for (const u of s.units) {
        const prev = m.get(u);
        if (prev && !wins(s, prev.span)) continue;
        const since = s.controlled ? runStart(unitRuns, u, year) : null;
        m.set(u, Object.freeze({
          unitId: u,
          territoryId: s.territoryId,
          territory: s.territory,
          status: s.status,
          controlDegree: s.controlDegree,
          controlled: s.controlled,
          since,
          tenureYears: since == null ? 0 : year - since,
          spanStart: s.start,
          spanEnd: s.end,
          partial: s.partial.length ? s.partial.includes(u) : false,
          circa: s.circa,
          contested: s.contested,
          span: s,
        }));
      }
    }
    return Object.freeze(m);
  }

  // Everything except tenureYears is constant across a segment, so the segment
  // map is built once and tenure is layered on per year through a small LRU.
  const yearCache = new Map();
  const YEAR_CACHE_MAX = 16;

  function deriveTenure(seg, year) {
    const m = new Map();
    for (const [u, e] of seg) m.set(u, e.since == null ? e : Object.freeze({ ...e, tenureYears: year - e.since }));
    return Object.freeze(m);
  }

  /**
   * statusAt(year) -> Map<unitId, {
   *   unitId, territoryId, territory, status, controlDegree, controlled,
   *   since, tenureYears, spanStart, spanEnd, partial, circa, contested, span }>
   *
   *   controlDegree  0–5 from the data model: 0 = no British authority,
   *                  5 = full direct British sovereignty. Drives map shading.
   *   since          first year of the unbroken run of British control this unit
   *                  is in — ACROSS territories, so Bengal reads 1757 even after
   *                  the Crown replaced the Company in 1858. null when not held.
   *   tenureYears    year - since (0 when since is null).
   *   partial        true when British control did not fill this unit (draw it hatched).
   *
   * Frozen and cached: statusAt(1857) twice returns the SAME object, so
   * `if (next === prev) return;` is a valid fast path for renderers.
   */
  function statusAt(year) {
    if (!cuts.length) return EMPTY_MAP;
    const y = clamp(Math.round(Number(year) || min), min, max);
    const hit = yearCache.get(y);
    if (hit) return hit;
    const i = segmentIndex(y);
    const seg = segments[i] || (segments[i] = buildSegment(cuts[i]));
    const out = y === cuts[i] ? seg : deriveTenure(seg, y);
    yearCache.set(y, out);
    if (yearCache.size > YEAR_CACHE_MAX) yearCache.delete(yearCache.keys().next().value);
    return out;
  }

  /** metricsAt(year) -> { year, units, controlledUnits, territories, byStatus, byRegion, byDegree } */
  function metricsAt(year) {
    const i = segmentIndex(year);
    if (segMetrics[i]) return segMetrics[i];
    const m = segments[i] || (segments[i] = buildSegment(cuts[i]));
    const byStatus = {}, byRegion = {}, byDegree = {}, terrSet = new Set();
    let controlledUnits = 0;
    for (const e of m.values()) {
      byStatus[e.status] = (byStatus[e.status] || 0) + 1;
      if (e.controlled) {
        controlledUnits++;
        terrSet.add(e.territoryId);
        const r = e.territory ? e.territory.region : 'unplaced';
        byRegion[r] = (byRegion[r] || 0) + 1;
        if (e.controlDegree != null) byDegree[e.controlDegree] = (byDegree[e.controlDegree] || 0) + 1;
      }
    }
    return (segMetrics[i] = Object.freeze({
      year: cuts[i], units: m.size, controlledUnits, territories: terrSet.size, byStatus, byRegion, byDegree,
    }));
  }

  /**
   * territoryAt(id, year) -> null if no such territory, otherwise
   * { id, territory, active, controlled, status, controlDegree, span, since,
   *   tenureYears, units, nextChange, prevChange, year }
   */
  function territoryAt(id, year) {
    const t = idx.byId.get(id);
    if (!t) return null;
    const y = Math.round(Number(year));
    let span = null;
    for (const s of t.spans) {
      if (s.start <= y && (s.end == null || y <= s.end)) { if (!span || wins(s, span)) span = s; }
    }
    const units = span ? span.units : t.units;
    let since = null;
    if (span && span.controlled && units.length) {
      const starts = units.map(u => runStart(unitRuns, u, y)).filter(v => v != null);
      since = starts.length ? Math.min(...starts) : span.start;
    }
    let nextChange = null, prevChange = null;
    for (const s of t.spans) {
      if (s.start > y && (nextChange == null || s.start < nextChange)) nextChange = s.start;
      if (s.start <= y && (prevChange == null || s.start > prevChange)) prevChange = s.start;
      if (s.end != null && s.end + 1 > y && (nextChange == null || s.end + 1 < nextChange)) nextChange = s.end + 1;
    }
    return {
      id: t.id, territory: t, active: !!span, controlled: !!(span && span.controlled),
      status: span ? span.status : null, controlDegree: span ? span.controlDegree : null,
      span, since, tenureYears: since == null ? 0 : y - since,
      units, nextChange, prevChange, year: y,
    };
  }

  /** Every territory with an active span in `year`. */
  function territoriesAt(year, { controlledOnly = false } = {}) {
    const y = Math.round(Number(year));
    const out = [];
    for (const t of territories) {
      for (const s of t.spans) {
        if (s.start <= y && (s.end == null || y <= s.end)) {
          if (controlledOnly && !s.controlled) break;
          out.push({ territory: t, span: s, status: s.status, controlDegree: s.controlDegree, controlled: s.controlled });
          break;
        }
      }
    }
    return out;
  }

  /** eventsBetween(a, b) -> events with a <= year <= b, in chronological order. */
  function eventsBetween(a, b, { type = null, region = null, territoryId = null, changedStatus = null, limit = 0 } = {}) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    const start = bisect(eventYears, lo - 1) + 1;
    const out = [];
    for (let i = start; i < idx.events.length; i++) {
      const e = idx.events[i];
      if (e.year > hi) break;
      if (type && e.type !== type) continue;
      if (region && e.region !== region) continue;
      if (territoryId && e.territoryId !== territoryId && !e.territoryIds.includes(territoryId)) continue;
      if (changedStatus != null && !!e.changedStatus !== changedStatus) continue;
      out.push(e);
      if (limit && out.length >= limit) break;
    }
    return out;
  }

  let _timeline = null;
  /**
   * timeline() -> { min, max, cuts, events, eventsByYear:Map,
   *                 unitsByYear:Int32Array, territoriesByYear:Int32Array, at(y) }
   * The typed arrays are indexed by (year - min) and are what the time bar and
   * the charts draw. Computed once, on first call.
   */
  function timeline() {
    if (_timeline) return _timeline;
    const n = max - min + 1;
    const unitsByYear = new Int32Array(n);
    const territoriesByYear = new Int32Array(n);
    for (let y = min; y <= max; y++) {
      const m = metricsAt(y);
      unitsByYear[y - min] = m.controlledUnits;
      territoriesByYear[y - min] = m.territories;
    }
    const eventsByYear = new Map();
    for (const e of idx.events) {
      if (!eventsByYear.has(e.year)) eventsByYear.set(e.year, []);
      eventsByYear.get(e.year).push(e);
    }
    return (_timeline = Object.freeze({
      min, max, cuts, events: idx.events, eventsByYear, unitsByYear, territoriesByYear,
      at: (y) => ({ units: unitsByYear[clamp(y, min, max) - min], territories: territoriesByYear[clamp(y, min, max) - min] }),
    }));
  }

  /** The next / previous year at which anything on the map changes. */
  function nextChangeYear(year, dir = 1) {
    const y = Math.round(year);
    if (dir > 0) { for (const c of cuts) if (c > y) return c; return max; }
    for (let i = cuts.length - 1; i >= 0; i--) if (cuts[i] < y) return cuts[i];
    return min;
  }

  /** Fuzzy search over names, alternate names, region and unit names. */
  function search(query, { limit = 20, year = null } = {}) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const out = [];
    for (const t of territories) {
      const hay = [t.name, t.shortName, t.formalName, ...t.aka, t.region].filter(Boolean).map(s => s.toLowerCase());
      let score = 0;
      for (const h of hay) {
        if (h === q) score = Math.max(score, 100);
        else if (h.startsWith(q)) score = Math.max(score, 80);
        else if (h.includes(q)) score = Math.max(score, 50);
      }
      if (!score) continue;
      if (year != null) { const at = territoryAt(t.id, year); if (at && at.active) score += 10; }
      out.push({ territory: t, id: t.id, name: t.name, region: t.region, score });
    }
    return out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
  }

  /* -- vocabularies, derived from the data so the legend never goes stale -- */
  const declaredStatus = new Map((terr.statusMeta || []).map(s => [s.id || s, s]));
  const statuses = [...idx.statusCounts.entries()].map(([id, count]) => {
    const declared = declaredStatus.get(id) || {};
    const degrees = idx.spans.filter(s => s.status === id && s.controlDegree != null).map(s => s.controlDegree);
    return {
      id, count,
      label: declared.label || null,
      controlDegree: degrees.length ? Math.round(degrees.reduce((a, b) => a + b, 0) / degrees.length) : null,
      controlled: typeof declared.controlled === 'boolean' ? declared.controlled : !NON_CONTROL.has(id),
      order: declared.order ?? null,
      ...declared,
    };
  }).sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || b.count - a.count);

  const declaredRegion = new Map((terr.regionMeta || []).map(r => [r.id || r, r]));
  const regions = [...idx.byRegion.entries()]
    .map(([id, list]) => ({ id, label: (declaredRegion.get(id) || {}).label || null, count: list.length, territories: list }))
    .sort((a, b) => b.count - a.count);

  return {
    /* collections */
    territories,
    byId: idx.byId,
    byRegion: idx.byRegion,
    byUnit: idx.byUnit,
    spans: idx.spans,
    events: idx.events,
    acquisitions: idx.acquisitions,
    departures: idx.departures,
    statuses,
    regions,
    unitRuns,

    /* geometry — raw topojson; the map module decodes it */
    geo: geo.layers,
    geoIndex: geo.index,
    geoAvailable: geo.available,
    unitMeta: geo.unitMeta,
    loadGeoLayer: geo.loadLayer,

    /* the queries */
    statusAt,
    metricsAt,
    territoryAt,
    territoriesAt,
    eventsBetween,
    timeline,
    nextChangeYear,
    search,

    /* helpers */
    get: (id) => idx.byId.get(id) || null,
    unitsOf: (id, year) => (year == null ? (idx.byId.get(id) || { units: [] }).units : (territoryAt(id, year) || { units: [] }).units),
    territoriesForUnit: (unitId) => idx.byUnit.get(unitId) || [],
    eventsFor: (territoryId) => (idx.byId.get(territoryId) || { events: [] }).events,
    unitName: (unitId) => (geo.unitMeta && geo.unitMeta.get(unitId) || {}).name || unitId,
    readDate,
    bounds: { min, max },

    meta: Object.freeze({
      placeholder,
      warnings,
      loadedMs: Math.round(ms),
      counts: {
        territories: territories.length, spans: idx.spans.length, events: idx.events.length,
        units: idx.byUnit.size, segments: cuts.length,
        acquisitions: idx.acquisitions.length, departures: idx.departures.length,
      },
      dataset: terr.meta || {},
      geo: { available: geo.available, layers: Object.keys(geo.layers), units: geo.unitMeta ? geo.unitMeta.size : 0 },
    }),
  };
}

export default { loadData, placeholderTerritories, readDate };
