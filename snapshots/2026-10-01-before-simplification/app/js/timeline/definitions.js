/* timeline/definitions.js — the timeline's copy of the Definition Switch.

   Move 1 (FEATURE_SPEC §1 charge 4) holds the year and changes what the word
   "British" means. Round 1 ignored it: the map printed "97 units drawn" at 1913
   under `controlled` while the timeline, two hundred pixels below, printed
   "194 units". Two contradictory counts for one year on one screen destroys the
   move it exists to teach.

   So the timeline reads the same four tests the map reads, from the same file
   (`app/js/map/definition.js`, P17's published vocabulary), and falls back to a
   local copy of the same four predicates if the map module is not present — the
   spine band has to survive the map being killed, and so does the count.

   The four sets nest: controlled ⊆ administered ⊆ claimed ⊆ influenced. */

const FALLBACK = [
  { id: 'claimed', label: 'claimed', sentence: 'everywhere Britain claimed authority', test: (e) => e.controlDegree >= 1 && e.status !== 'informal-sphere' },
  { id: 'administered', label: 'administered', sentence: 'everywhere Britain actually administered', test: (e) => e.controlDegree >= 3 },
  { id: 'controlled', label: 'controlled', sentence: 'direct British sovereignty only', test: (e) => e.controlDegree === 5 },
  { id: 'influenced', label: 'influenced', sentence: 'everything claimed, plus informal empire', test: (e) => e.controlDegree >= 1 || e.status === 'informal-sphere' },
];

export const DEFAULT_DEFINITION = 'claimed';

let DEFS = FALLBACK;

/** Load the map's own vocabulary if it is there; otherwise keep the local one. */
export async function loadDefinitions() {
  try {
    const m = await import('../map/definition.js');
    if (m && Array.isArray(m.DEFINITIONS) && m.DEFINITIONS.length) {
      DEFS = m.DEFINITIONS.map((d) => ({ id: d.id, label: d.label, sentence: d.sentence, test: d.test }));
    }
  } catch (_) { /* the map piece is not mounted; the fallback is the same four rules */ }
  return DEFS;
}

export function definitions() { return DEFS; }

export function definitionById(id) {
  return DEFS.find((d) => d.id === id) || DEFS.find((d) => d.id === DEFAULT_DEFINITION) || FALLBACK[0];
}

/** The raw `def=` in the address bar, or null. Only useful on the first frame:
    the map mirrors it into `filters.def`, which is where it then lives. */
export function definitionFromHash(hash = location.hash) {
  const raw = String(hash || '').replace(/^#/, '');
  for (const part of raw.split('&')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i) === 'def') {
      const v = decodeURIComponent(part.slice(i + 1));
      if (DEFS.some((d) => d.id === v)) return v;
    }
  }
  return null;
}

/** Where the definition actually lives once the app is running: `filters.def`
    on the shell store (the map mirrors `def=` into it on entry, and writes it
    there on every switch). Reading the store rather than the hash is what makes
    a deep link reproduce — the shell rewrites `#def=x` as `#filter=def:x`. */
export function definitionFromState(store) {
  const f = (store && store.getState && store.getState().filters) || {};
  if (f.def && DEFS.some((d) => d.id === f.def)) return f.def;
  return definitionFromHash() || DEFAULT_DEFINITION;
}

export default { loadDefinitions, definitions, definitionById, definitionFromHash, definitionFromState, DEFAULT_DEFINITION };
