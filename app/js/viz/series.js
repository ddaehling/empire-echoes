/**
 * viz/series.js — EXTENT OVER TIME, COMPUTED, NOT COPIED.
 *
 * Everyone "knows" the empire covered about a quarter of the world's land and
 * peaked around 1920. This file does not take that on trust and does not
 * hard-code it. It re-derives the whole series in the browser, year by year,
 * from `data.statusAt(year)` crossed with the per-unit land areas in
 * `app/data/geo/units.index.json` — the same method, and the same two rules,
 * as `tools/audit-timeline.js`:
 *
 *   · a unit claimed by two territories at once (a princely state inside
 *     British India) is counted ONCE, because statusAt returns one entry per
 *     unit and the dataset's own precedence rules have already resolved it;
 *   · coverage flagged `partial` — the St Lawrence strip of Quebec in 1763 —
 *     is counted at half, because counting the whole unit inflates the empire
 *     and counting none erases it.
 *
 * THE BAND IS THE HONEST PART. Some status periods end on a contested date:
 * Canada stopped being British in 1867, or 1931, or 1982, depending on which
 * historian you ask, and the dataset records both ends. An extent line drawn
 * through one of those readings is a decision disguised as a measurement. So
 * this file returns TWO numbers per year — the latest defensible reading and
 * the earliest — and the chart draws the gap between them as a band and says
 * in words what the gap is made of.
 *
 * TWO DIFFERENT TRUE ANSWERS, side by side, never blended:
 *   extent — what a pink map of that year showed, whatever it meant.
 *   ruled  — where Britain actually gave the orders: controlDegree 4 or 5.
 * Collapsing them is how the solid-pink-block myth survives (M4).
 *
 * There is no population series here, and that is deliberate. See censusPoints().
 */

/**
 * Earth's land surface excluding Antarctica. A constant of geography, not a
 * claim about empire, and the same denominator tools/audit-timeline.js uses so
 * the two agree to the percentage point.
 */
export const WORLD_LAND_KM2 = 134000000;
export const WORLD_LAND_NOTE =
  'Share of the world is measured against 134,000,000 km² of land, excluding Antarctica — the denominator school atlases use. '
  + 'Antarctic claims are left out of the top and the bottom of the fraction alike.';

const PARTIAL_WEIGHT = 0.5;
const DIRECT_RULE_DEGREE = 4;

/** Area of one unit, in km², from the geometry index. 0 when we have no outline. */
function areaOf(data, unitId) {
  const m = data.unitMeta && data.unitMeta.get ? data.unitMeta.get(unitId) : null;
  const a = m && Number(m.area_km2);
  return Number.isFinite(a) ? a : 0;
}

/**
 * THE OTHER DEFENSIBLE READING.
 *
 * Eight status periods in this dataset end on a date historians place
 * differently — Canada, the Northwest Territories, the Yukon, South Africa,
 * South West Africa, Uruguay, St Helena. The date object carries both: `year`
 * is the earlier reading (Canada: the Statute of Westminster, 1931), `endYear`
 * the later one (patriation, 1982). `data.statusAt` resolves them EARLY, which
 * is why the map stops colouring Canada in 1931; that makes the drawn line the
 * map's own line, and the difference between the two readings the band above it.
 *
 * `tools/audit-timeline.js` resolves the same dates LATE by default, which is
 * why its 1947 total is about ten million km² larger. Both are in the band.
 */
function lateOnlySpans(data) {
  return (data.spans || []).filter((s) => s && s.to && s.to.endYear && s.to.year && s.to.endYear > s.to.year);
}

/** Area a year gains if the contested departures are dated late instead. */
function lateExtra(data, spans, year, snapshot) {
  let extra = 0;
  const terrs = new Set();
  const seen = new Set();
  for (const s of spans) {
    if (year < s.to.year || year >= s.to.endYear) continue;
    const partial = new Set(Array.isArray(s.partial) ? s.partial : []);
    for (const u of s.units || []) {
      if (snapshot.has(u) || seen.has(u)) continue;
      seen.add(u);
      extra += areaOf(data, u) * (partial.has(u) ? PARTIAL_WEIGHT : 1);
      if (s.territoryId) terrs.add(s.territoryId);
    }
  }
  return { extra: Math.round(extra), territories: terrs.size };
}

/** Everything one year is worth, computed once. */
function measure(data, year, snapshot, spans) {
  let extent = 0, ruled = 0, units = 0, partials = 0;
  const terr = new Set();
  for (const [unitId, e] of snapshot) {
    const w = e.partial ? PARTIAL_WEIGHT : 1;
    const a = areaOf(data, unitId) * w;
    units += 1;
    if (e.partial) partials += 1;
    extent += a;
    if (e.territoryId) terr.add(e.territoryId);
    if (e.controlDegree >= DIRECT_RULE_DEGREE) ruled += a;
  }
  const late = lateExtra(data, spans, year, snapshot);
  return {
    year,
    extent: Math.round(extent),
    extentLate: Math.round(extent) + late.extra,
    contested: late.extra,
    contestedTerritories: late.territories,
    ruled: Math.round(ruled),
    units,
    partials,
    territories: terr.size,
  };
}

/**
 * The whole series, 1600 (or the dataset's own floor) to its ceiling.
 * `statusAt` is stable per segment — statusAt(1857) === statusAt(1857) — so a
 * run of years in which nothing changed is measured once and shared. On this
 * dataset that turns ~430 measurements into ~250.
 */
export function buildSeries(data) {
  const b = (data && data.bounds) || { min: 1600, max: 2027 };
  const from = Math.max(1600, b.min | 0);
  const to = b.max | 0;
  const rows = [];
  const spans = lateOnlySpans(data);

  for (let y = from; y <= to; y++) rows.push(measure(data, y, data.statusAt(y), spans));

  let peak = rows[0], peakTerr = rows[0], peakRuled = rows[0], peakLate = rows[0];
  for (const r of rows) {
    if (r.extent > peak.extent) peak = r;
    if (r.extentLate > peakLate.extentLate) peakLate = r;
    if (r.territories > peakTerr.territories) peakTerr = r;
    if (r.ruled > peakRuled.ruled) peakRuled = r;
  }

  return {
    rows,
    from, to,
    peak, peakLate, peakTerr, peakRuled,
    contestedSpans: spans.length,
    maxExtent: Math.max(peak.extent, peakLate.extentLate),
    at(year) { return rows[Math.max(0, Math.min(rows.length - 1, (year | 0) - from))] || null; },
  };
}

/**
 * WHY THERE IS NO POPULATION LINE.
 *
 * The dataset holds 200-odd counted population figures — a census, a colonial
 * estimate, a modern reconstruction — each attached to one territory, each
 * dated to its own year, each with a note saying who counted and how. They
 * cannot be added into a series, for two reasons that are worth teaching:
 * they are peaks at different years, and they nest (Bengal Presidency's 60.3
 * million in 1941 is inside British India's 389.0 million in 1941, so adding
 * them counts the same people twice).
 *
 * So this returns the points themselves, and the chart draws points. Absence
 * is drawn as absence (FEATURE_SPEC charge 7), never interpolated into a line
 * the record does not support.
 */
export function censusPoints(data) {
  const out = [];
  for (const t of data.territories || []) {
    const p = t.peak;
    if (!p || !Number.isFinite(Number(p.population)) || !Number.isFinite(Number(p.populationYear))) continue;
    out.push({
      id: t.id,
      name: t.name,
      region: t.region,
      value: Number(p.population),
      year: Number(p.populationYear),
      note: p.populationNote || '',
      nestedWithin: t.nestedWithin || null,
    });
  }
  out.sort((a, b) => a.year - b.year || b.value - a.value);
  return out;
}
