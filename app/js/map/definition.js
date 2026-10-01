/**
 * map/definition.js — the Definition Switch.
 *
 * The coursebook's sharpest charge is that a choropleth teaches "area equals
 * importance" and that a single flat red teaches "the empire was one thing".
 * This file is the first half of the answer: four definitions of the word
 * *British*, all true of the same year, each producing a different map and a
 * different set of totals.
 *
 *   influenced   every place with any British authority OR British domination
 *                without a claim — the widest reading (includes informal empire)
 *   claimed      controlDegree >= 1, informal spheres excluded — what Britain
 *                said was hers
 *   administered controlDegree >= 3 — somebody British gave orders here
 *   controlled   controlDegree === 5 — direct sovereignty and nothing less
 *
 * Every figure below is summed from the dataset at call time. There is no
 * hard-coded total in this file, no interpolation and no estimate: km² comes
 * from `unitMeta.area_km2` per drawn unit (a unit whose coverage is `partial`
 * is counted at half, exactly as tools/audit-timeline.js counts it), and
 * population comes from each territory's own cited `peak.population`, which is
 * a *peak recorded* figure in its own census year and is labelled as such. The
 * number of included territories carrying no population figure is reported
 * beside the total, because that absence is data too.
 */

/* Ids, keys and tests are aligned exactly with the published vocabulary in
   app/js/legend/symbology.js (P17), so the legend, the map and any tour that
   emits `map:setDefinition` all mean the same four things by the same names.
   The four sets nest: controlled ⊆ administered ⊆ claimed ⊆ influenced. */
export const DEFINITIONS = [
  {
    id: 'claimed',
    key: '1',
    label: 'claimed',
    title: 'Claimed',
    gloss: 'Everywhere Britain said was hers — from a governor with an army to a resident with a treaty and no garrison. Places Britain dominated without ever claiming them are excluded here; press 4 for those. This is the map on the schoolroom wall.',
    sentence: 'drawn: everywhere Britain claimed authority — control degree 1 or more, and not an informal sphere',
    /* The one sentence the shell's band says when this button is pressed. It
       is the gloss cut to reading length: 19px, one line, no panel. */
    say: (n) => `Everywhere Britain said was hers — a governor with an army, or a resident with a treaty and no garrison. ${n} units.`,
    test: (e) => e.controlDegree >= 1 && e.status !== 'informal-sphere',
  },
  {
    id: 'administered',
    key: '2',
    label: 'administered',
    title: 'Administered',
    gloss: 'Everywhere British officials actually collected revenue, ran courts or appointed the government.',
    sentence: 'drawn: everywhere Britain actually administered (control degree 3 or more)',
    say: (n) => `Only where British officials collected the revenue, ran the courts or named the government. ${n} units.`,
    test: (e) => e.controlDegree >= 3,
  },
  {
    id: 'controlled',
    key: '3',
    label: 'controlled',
    title: 'Controlled',
    gloss: 'The narrowest reading: control degree 5 — full formal British authority, nothing shared with another power. This is a test of law, not of obedience. Cyprus is drawn here from 1878 while its own record in this atlas reads “occupied and administered, but legally Ottoman”, and New Zealand is drawn here from 1840 while the same record says the governor could not enforce a decision anywhere a chief did not agree with it. Where Britain held the title and not the ground, this button still paints it.',
    sentence: 'drawn: full formal British authority only (control degree 5) — a legal test, not a test of who was obeyed',
    say: (n) => `Full formal British authority and nothing less. A test of law, not of who was obeyed. ${n} units.`,
    test: (e) => e.controlDegree === 5,
  },
  {
    id: 'influenced',
    key: '4',
    label: 'influenced',
    title: 'Influenced',
    gloss: 'Everything claimed, plus the places Britain never claimed and ran anyway — through trade, debt and the navy.',
    sentence: 'drawn: everything claimed, plus informal empire',
    say: (n) => `Everything claimed, plus the places Britain never claimed and ran anyway — by trade, debt and the navy. ${n} units.`,
    test: (e) => e.controlDegree >= 1 || e.status === 'informal-sphere',
  },
];

export const DEFINITION_IDS = DEFINITIONS.map((d) => d.id);
export const DEFAULT_DEFINITION = 'claimed';

export function definitionById(id) {
  return DEFINITIONS.find((d) => d.id === id) || DEFINITIONS.find((d) => d.id === DEFAULT_DEFINITION);
}

/** A unit counted at half when British control did not fill it. */
const weightOf = (entry) => (entry && entry.partial ? 0.5 : 1);

/**
 * measure(statusMap, unitMeta, definition) -> the totals printed by the switch.
 * Pure, cheap (302 entries), and derived only from what was passed in.
 */
export function measure(statusMap, unitMeta, def) {
  const test = def.test;
  const units = new Set();
  const territories = new Set();
  let km2 = 0;
  let unitsWithoutArea = 0;
  for (const e of statusMap.values()) {
    if (!test(e)) continue;
    units.add(e.unitId);
    territories.add(e.territoryId);
    const meta = unitMeta && unitMeta.get(e.unitId);
    const a = meta && Number(meta.area_km2);
    if (Number.isFinite(a) && a > 0) km2 += a * weightOf(e);
    else unitsWithoutArea++;
  }
  return {
    definitionId: def.id,
    units: units.size,
    territories: territories.size,
    km2: Math.round(km2),
    unitsWithoutArea,
    unitIds: units,
    territoryIds: territories,
  };
}

/**
 * population(territoryIds, data) -> { total, counted, missing, earliest, latest }
 * A floor, not a total: it adds up each territory's own cited peak figure in
 * that territory's own census year, and says how many carry no figure at all.
 */
export function population(territoryIds, data, year = null) {
  let total = 0, counted = 0, missing = 0, after = 0, dated = 0;
  let earliest = null, latest = null, largest = null;
  for (const id of territoryIds) {
    const t = data.byId && data.byId.get(id);
    const p = t && t.peak && Number(t.peak.population);
    if (Number.isFinite(p) && p > 0) {
      total += p; counted++;
      if (!largest || p > largest.value) largest = { id, name: t.name || id, value: p, year: Number(t.peak.populationYear) || null };
      const y = Number(t.peak.populationYear);
      if (Number.isFinite(y)) {
        dated++;
        if (year != null && y > year) after++;
        if (earliest == null || y < earliest) earliest = y;
        if (latest == null || y > latest) latest = y;
      }
    } else missing++;
  }
  return { total, counted, missing, earliest, latest, after, dated, largest };
}

/** The four measurements at once, for the readout and for the legend. */
export function measureAll(statusMap, unitMeta, data) {
  const out = {};
  for (const def of DEFINITIONS) {
    const m = measure(statusMap, unitMeta, def);
    m.population = population(m.territoryIds, data);
    out[def.id] = m;
  }
  return out;
}

export default { DEFINITIONS, DEFINITION_IDS, DEFAULT_DEFINITION, definitionById, measure, measureAll, population };
