/* =============================================================================
   TOTALS — the live numbers the legend and the byline both print.
   Owner: P17.

   Every figure here is computed from data.statusAt(year), data.unitMeta and the
   territories' own cited `peak.population` at read time. There is no cached
   total, no rounded constant and no number typed into this file. Where the
   geometry index has no area for a unit, that unit is counted in
   `unitsWithoutArea` and left out of the km² sum — never treated as zero.

   Two rules this file exists to keep:

   1. THE PRINTED RULE IS THE RULE COMPUTED. `sets[id]` is built by running
      DEFINITIONS[id].test, and DEFINITIONS[id].rule is the sentence the legend
      prints. They cannot drift, because there is one test.

   2. NO FALSE PRECISION. Areas are summed from modern outlines and halved by a
      stated convention where control did not fill a unit. `sig()` rounds every
      area to three significant figures before it is formatted, so this panel can
      never print 815,179.86 km² of eighteenth-century territory.
   ========================================================================== */

import { DEFINITIONS } from './symbology.js';

const cache = new WeakMap();   // data -> Map<year, result>

/**
 * Round to `digits` significant figures. An area built from modern coastlines,
 * halved by convention on partial units and summed over 300 polygons is good to
 * about three figures and no more; printing more is a lie about the method.
 */
export function sig(n, digits = 3) {
  if (!Number.isFinite(n) || n === 0) return n;
  const mag = Math.pow(10, digits - 1 - Math.floor(Math.log10(Math.abs(n))));
  return Math.round(n * mag) / mag;
}

/** area, rounded to three significant figures first. Always use this here. */
export const areaText = (format, km2) => format.area(Math.round(sig(km2)));

/**
 * The population floor for a set of territories: each territory's own cited
 * peak recorded figure, in that territory's own census year. Exactly the rule
 * and exactly the source the map's own definition card uses, so the two panels
 * on one screen cannot disagree. A floor, never a population "in this year".
 */
export function populationOf(territoryIds, data) {
  let total = 0, counted = 0, missing = 0, earliest = null, latest = null;
  for (const id of territoryIds) {
    const t = data.byId && data.byId.get(id);
    const p = t && t.peak && Number(t.peak.population);
    if (Number.isFinite(p) && p > 0) {
      total += p; counted++;
      const y = Number(t.peak.populationYear);
      if (Number.isFinite(y)) {
        if (earliest == null || y < earliest) earliest = y;
        if (latest == null || y > latest) latest = y;
      }
    } else missing++;
  }
  return { total, counted, missing, earliest, latest };
}

/**
 * totalsAt(data, year) -> {
 *   year,
 *   sets: { claimed:{units,km2,territories,territoryIds,unitsWithoutArea,partialUnits,population}, … }
 *   byStatus: [{ statusId, units, km2, territories:[{id,name,units}] }]
 *   informalUnits, informalTerritories, drawnUnits, degreeOneUnits
 * }
 * Stable per (data, year) so repeated renders cost nothing.
 */
export function totalsAt(data, year) {
  if (!data || typeof data.statusAt !== 'function') return null;
  let byYear = cache.get(data);
  if (!byYear) cache.set(data, (byYear = new Map()));
  const y = Math.round(Number(year));
  if (byYear.has(y)) return byYear.get(y);

  const meta = data.unitMeta;
  const areaOf = (unitId) => {
    const m = meta && typeof meta.get === 'function' ? meta.get(unitId) : null;
    const a = m && Number(m.area_km2);
    return Number.isFinite(a) && a > 0 ? a : null;
  };

  const sets = {};
  for (const d of DEFINITIONS) {
    sets[d.id] = {
      units: 0, km2: 0, unitsWithoutArea: 0, partialUnits: 0, territories: new Set(),
      /* THE PLATE'S OWN GEOGRAPHY, at this year and under this rule.
         Round 2's self-criticism quoted whole-atlas figures — "the Canadian
         units cover 9.9 million km²" — at 1650 and at 2023, when no Canadian
         unit was drawn at all. Every figure the criticism prints is now
         accumulated here, over the units actually painted. */
      geo: {
        tiny: 0,
        highLatKm2: 0, highLatUnits: 0,     // centroid 40° or further from the equator
        tropicKm2: 0, tropicUnits: 0,       // centroid within 23.5° of it
        canadaKm2: 0, africaKm2: 0,
        barbadosKm2: 0,
        smallest: null, largest: null,      // { id, name, km2 }
      },
    };
  }

  /* -----------------------------------------------------------------------
     ROUND 5 — THE COLOUR VOCABULARY IS COUNTED UNDER THE RULE IN FORCE.

     `byStatus` counted every entry data.statusAt returns, whatever definition
     was on. So the corner key printed "Ruled from London 94 · Protectorate 46"
     — 140 units — beside its own headline "126 of 302 units · administered",
     and pressing 2, 3 or 4 changed the totals line and left the colours
     identical. That is charge 4's own mechanism failing inside the panel whose
     job charge 4 is: the printed rule has to be the rule computed, everywhere
     on the panel, not only in the figures line.

     There is now one aggregation per definition. `byStatus` stays as the
     whole-year roll for anything that wants it; `sets[id].byStatus` is the roll
     of what is actually drawn under that rule.
  ----------------------------------------------------------------------- */
  const statusAgg = new Map();
  const statusBySet = {};
  for (const d of DEFINITIONS) statusBySet[d.id] = new Map();
  const bump = (agg, e, counted) => {
    let s = agg.get(e.status);
    if (!s) {
      agg.set(e.status, (s = {
        statusId: e.status, units: 0, km2: 0, unitsWithoutArea: 0, partialUnits: 0,
        degrees: new Set(), places: new Map(),
      }));
    }
    s.units++;
    if (e.partial) s.partialUnits++;
    if (counted == null) s.unitsWithoutArea++; else s.km2 += counted;
    if (e.controlDegree != null) s.degrees.add(e.controlDegree);
    return s;
  };
  let informalUnits = 0;
  const informalTerritories = new Set();
  let drawnUnits = 0;
  let degreeOneUnits = 0;          // the raw "any degree at all" count, informal included

  const entries = data.statusAt(y);
  for (const e of entries.values()) {
    drawnUnits++;
    if (e.controlDegree >= 1) degreeOneUnits++;
    const a = areaOf(e.unitId);

    /* A unit British control did not fill counts at half its area — the rule
       tools/audit-timeline.js, the map renderer and this panel all use, so the
       three land figures on one screen agree. Half is a convention, and the
       legend says so on screen rather than hiding it. */
    const counted = a == null ? null : (e.partial ? a / 2 : a);

    const s = bump(statusAgg, e, counted);
    const perSet = [];
    for (const d of DEFINITIONS) if (d.test(e)) perSet.push(bump(statusBySet[d.id], e, counted));
    if (e.territoryId) {
      const name = (e.territory && e.territory.name) || e.territoryId;
      const p = s.places.get(e.territoryId);
      if (p) p.units++;
      else {
        /* THE TERRITORY'S OWN WORDS.
           Round 3 listed Yukon and South Georgia under "ruled directly from
           London through an appointed governor" while the dataset's own period
           for them reads "Canadian territory, run from Ottawa" and "A claim on
           paper ... no administration of any kind". A legend that teaches
           students to distrust a category label and then hides the dataset's
           own label is not applying its lesson to itself, so the roll now
           carries the span's label and where it was governed from, and the
           legend flags the ones that do not match the family sentence. */
        const sp = e.span || {};
        const raw = sp.raw || {};
        const place = {
          id: e.territoryId, name, units: 1,
          label: sp.label || null,
          governedFrom: sp.governedFrom || null,
          /* THE DATASET'S OWN CAVEAT. `controlDegreeNote` is the field the data
             model uses to say "this place's degree of control is not what its
             legal status implies" — it is on Yukon ("Not a British crown colony
             but a Canadian territory") and on South Georgia ("no administration
             of any kind"), and on nothing that fits its box. The legend does
             not judge; it prints the field. */
          degreeNote: sp.controlDegreeNote || raw.controlDegreeNote || null,
          degree: e.controlDegree,
        };
        s.places.set(e.territoryId, place);
      }
      for (const ss of perSet) {
        const pp = ss.places.get(e.territoryId);
        if (pp) pp.units++;
        else {
          const from = s.places.get(e.territoryId);
          ss.places.set(e.territoryId, from ? { ...from, units: 1 } : { id: e.territoryId, name: (e.territory && e.territory.name) || e.territoryId, units: 1 });
        }
      }
    }

    if (e.status === 'informal-sphere') {
      informalUnits++;
      if (e.territoryId) informalTerritories.add(e.territoryId);
    }

    const m = meta && typeof meta.get === 'function' ? meta.get(e.unitId) : null;
    const lat = m && Array.isArray(m.centroid) ? Number(m.centroid[1]) : null;

    for (const d of DEFINITIONS) {
      if (!d.test(e)) continue;
      const set = sets[d.id];
      set.units++;
      if (e.partial) set.partialUnits++;
      if (counted == null) set.unitsWithoutArea++; else set.km2 += counted;
      if (e.territoryId) set.territories.add(e.territoryId);

      const g = set.geo;
      if (m && m.tiny) g.tiny++;
      if (a != null && Number.isFinite(lat)) {
        if (Math.abs(lat) >= 40) { g.highLatKm2 += a; g.highLatUnits++; }
        else if (Math.abs(lat) <= 23.5) { g.tropicKm2 += a; g.tropicUnits++; }
      }
      if (a != null && m) {
        if (/Canada/.test(m.region || '')) g.canadaKm2 += a;
        if (/Africa|Nile/.test(m.region || '')) g.africaKm2 += a;
        if (e.unitId === 'barbados') g.barbadosKm2 = a;
        const rec = { id: e.unitId, name: m.name || e.unitId, km2: a };
        if (!g.smallest || a < g.smallest.km2) g.smallest = rec;
        if (!g.largest || a > g.largest.km2) g.largest = rec;
      }
    }
  }

  const roll = (agg) => [...agg.values()]
    .map(s => ({ ...s, places: [...s.places.values()].sort((a, b) => a.name.localeCompare(b.name)) }))
    .sort((a, b) => b.units - a.units);

  for (const d of DEFINITIONS) {
    const set = sets[d.id];
    set.territoryIds = set.territories;
    set.population = populationOf(set.territories, data);
    set.territories = set.territories.size;
    set.byStatus = roll(statusBySet[d.id]);
  }

  const byStatus = roll(statusAgg);

  const out = Object.freeze({
    year: y, sets, byStatus,
    informalUnits, informalTerritories: informalTerritories.size,
    drawnUnits, degreeOneUnits,
  });
  byYear.set(y, out);
  return out;
}


/* -----------------------------------------------------------------------------
   THE ANCHOR.

   Round 3 printed "25.1 million km²" with impeccable method and no meaning: a
   fifteen-year-old has no picture of a million square kilometres, and the
   printed chapter beat us in six words with "a quarter of the world's land
   surface". So every magnitude this panel prints now carries one comparison,
   and the comparison is COMPUTED from the atlas's own geometry index rather
   than typed here.

   The denominator is Great Britain — England, Scotland and Wales as the same
   units.index.json measures every other shape on the plate. It is the right
   denominator for this subject (it is the place doing the claiming), and it is
   the one a student in a British classroom can already picture. If any of the
   three units is missing from the geometry index the anchor is not printed at
   all: an anchor with a guessed denominator is worse than none.
----------------------------------------------------------------------------- */

const METROPOLE = ['gb-england', 'gb-scotland', 'gb-wales'];

/** The value format.area actually shows: sig-3, then compacted over a million. */
function asPrinted(km2) {
  const n = Math.round(sig(km2));
  if (n < 1e6) return n;
  const v = n / 1e6;
  return (v >= 100 ? Math.round(v) : +v.toFixed(v >= 10 ? 0 : 1)) * 1e6;
}

/** km² of the islands that did the claiming, from the same index as the rest. */
export function metropoleKm2(data) {
  const meta = data && data.unitMeta;
  if (!meta || typeof meta.get !== 'function') return null;
  let sum = 0, found = 0;
  for (const id of METROPOLE) {
    const m = meta.get(id);
    const a = m && Number(m.area_km2);
    if (Number.isFinite(a) && a > 0) { sum += a; found++; }
  }
  return found === METROPOLE.length ? sum : null;
}

const FIFTHS = [null, 'one', 'two', 'three', 'four'];

/**
 * anchors(data, format, set) -> { area: {short,long} | null, units: {short,long} | null }
 * One comparison per printed magnitude. Nothing is returned that cannot be
 * computed at this year from this dataset.
 */
export function anchors(data, format, set) {
  const out = { area: null, units: null };
  if (!set) return out;

  const gb = metropoleKm2(data);
  if (gb && set.km2 > 0) {
    /* Both sides rounded THE WAY THEY ARE PRINTED, so the multiple a student
       checks on a calculator against the two figures on this panel is the
       multiple this line claims. format.area compacts anything over a million
       to at most three digits, so 24,500,000 prints as "25 million" and the
       ratio has to be taken from 25, not from 24.5. */
    const shown = asPrinted(Math.round(sig(set.km2)));
    const denom = Math.round(sig(gb));
    const times = Math.round(shown / denom);
    if (times >= 2) {
      out.area = {
        short: `about ${format.number(times)}× Great Britain`,
        long: `${format.area(Math.round(sig(set.km2)))} is about ${format.number(times)} times the land area of Great Britain, which this atlas's own geometry index puts at ${format.area(denom, { compact: false })} — England, Scotland and Wales, measured from the same file as every other shape on the plate. Both figures are rounded here the way they are printed, so the division works on the two numbers you can see.`,
      };
    }
  }

  const total = data && data.unitMeta && data.unitMeta.size ? data.unitMeta.size : null;
  if (total && set.units > 0) {
    const frac = set.units / total;
    const fifth = Math.round(frac * 5);
    const wordy = fifth >= 1 && fifth <= 4 && Math.abs(frac - fifth / 5) <= 0.07
      ? `${FIFTHS[fifth]} in every five` : null;
    out.units = {
      short: `${format.number(set.units)} of ${format.number(total)} places this atlas can draw`,
      long: `${format.number(set.units)} of the ${format.number(total)} places this atlas holds geometry for${wordy ? ` — ${wordy}` : ` — ${format.percent(frac)}`}. That denominator is the atlas's own coverage, not the world: it is how much of THIS map is British at this year, and nothing more.`,
    };
  }
  return out;
}

export default { totalsAt, sig, areaText, populationOf, anchors, metropoleKm2 };
