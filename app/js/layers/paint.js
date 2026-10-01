/* =============================================================================
   layers/paint.js — RE-KEYING THE PLATE, WITHOUT OWNING IT.
   Owner: P06.

   THE PROBLEM. P02 owns the plate and paints one reading of it: legal status,
   with `controlDegree` as a threshold and a tenure ramp. Four of this piece's
   layers are a different reading of the same shapes — how it was taken, how it
   ended, whether slavery was lawful here this year, who was made to work here.
   A re-encoding has to change the PIXELS, not just a caption, for three
   reasons, in ascending order of importance:

     1. The reader is looking at the map, not at the byline.
     2. P17's byline verifies itself against the canvas (legend/plate-probe.js)
        and prints, in front of the student, "the atlas is set to mechanism but
        this plate is pixel-for-pixel the legal-status plate" when it is. That
        message is correct and it is the one this file exists to stop being
        true.
     3. A layer that does not draw is not a layer.

   THE MECHANISM. P02 publishes its renderer as `window.__map.plate` and says
   so in its own comment: "a read/drive surface for scenarios and for any piece
   that needs the plate". `setPaint(Map<unitId, record>)` is that surface's one
   input. This file wraps it: the map computes its paint table exactly as
   before, we re-key the records that our layer has an opinion about, and the
   plate draws. Nothing in `app/js/map/` is edited, the raw table is kept so a
   layer change can be re-applied without asking the map to recompute, and
   `unhook()` puts the original method back.

   WHAT WE MAY CHANGE ON A RECORD, and nothing else:
     fill, strokeColour, texture   the drawing
     mode                          'fill' | 'absence' (bare ground: no figure)
     quiet                         0.5 alpha — not our subject, still readable
     label                         the words the plate prints for this unit
     layerKey, layerWord           our own fields, read back by the key
   `key` and `entry` are left alone, because P02 reads them for its hover card,
   its accessible names and its palette lookups. A student hovering a place
   still hears its legal status, which is true; the colour says something else,
   which the byline, the key and the lede band all state.
   ========================================================================== */

import { readTokens } from '../map/palette.js';
import {
  MECHANISM_FAMILIES, EXIT_CATEGORIES, SLAVERY_STATES,
  LABOUR_CATEGORIES, FAMINE_CATEGORIES, RESISTANCE_CATEGORIES,
  COUNTERPARTY_KINDS,
} from './catalog.js';

/* The audited (fill, texture) pairs, by palette key. Read from the live
   document so both themes follow and nothing here is a second palette. */
const TEXTURE = {
  'never-british': 'plain',
  'lost-former': 'hatch-45',
  'dominion': 'rule-h',
  'settlement': 'stipple',
  'crown-conquered': 'plain',
  'company-rule': 'cross',
  'lease': 'rule-v',
  'protectorate': 'hatch-135',
  'mandate': 'stipple-coarse',
  'occupied': 'hatch-135-dense',
};

/* ------------------------------------------------------------- indexing --- */

/**
 * Build the per-unit answers each fill layer needs, once per dataset.
 * Nothing here is interpolated and nothing is guessed: a unit that the record
 * does not answer for is absent from the map, and an absent unit is drawn as
 * bare ground.
 */
export function buildIndex(data) {
  const acqByUnit = new Map();      // unitId -> [{year, mechanism}] ascending
  const depByUnit = new Map();      // unitId -> {mechanism, year}  (the last one)
  for (const a of data.acquisitions || []) {
    if (!a.mechanism || a.year == null) continue;
    /* THE PARTY ON THE OTHER SIDE, CARRIED WITH THE ACQUISITION.
       `counterparties[]` is a required, populated field on every acquisition
       record in this dataset — a name, a `kind` from a vocabulary of eight,
       and a `lost` clause — and until round 3 no surface in this app drew it.
       Two readings are made of it here: the `taken-from` layer, and the name
       printed on every unit of the `mechanism` plate, so that the plate that
       asks what Britain did can never again answer without saying to whom. */
    const cp = (a.counterparties || [])
      .filter((c) => c && c.name)
      .map((c) => ({ name: String(c.name), kind: c.kind || null, lost: c.lost || null }));
    for (const u of a.units || []) {
      if (!acqByUnit.has(u)) acqByUnit.set(u, []);
      acqByUnit.get(u).push({ year: a.year, mechanism: a.mechanism, id: a.id, territoryId: a.territoryId, cp });
    }
  }
  for (const list of acqByUnit.values()) list.sort((x, y) => x.year - y.year);

  for (const d of data.departures || []) {
    if (!d.mechanism) continue;
    for (const u of d.units || []) {
      const prev = depByUnit.get(u);
      // The LAST recorded departure is how British rule at this place ended;
      // an earlier one belongs to an earlier occupation of the same ground.
      if (!prev || (d.year ?? 0) >= (prev.year ?? 0)) {
        depByUnit.set(u, { mechanism: d.mechanism, year: d.year, id: d.id, territoryId: d.territoryId });
      }
    }
  }

  /* Per-territory consequence facts, resolved to units through the territory's
     own unit list. `consequences` is prose plus a small controlled vocabulary;
     only the vocabulary is read here. */
  const slaveryByT = new Map();
  const labourByT = new Map();
  const famineByT = new Map();
  const multiLabour = new Set();
  for (const t of data.territories || []) {
    const c = t.consequences || {};
    if (c.slavery) {
      const ab = c.slavery.abolitionDate && data.readDate(c.slavery.abolitionDate);
      const em = c.slavery.emancipationDate && data.readDate(c.slavery.emancipationDate);
      slaveryByT.set(t.id, {
        abolition: ab && Number.isFinite(ab.year) ? ab.year : null,
        emancipation: em && Number.isFinite(em.year) ? em.year : null,
        note: c.slavery.note || null,
        money: (c.slavery.toll && c.slavery.toll.money) || null,
        low: c.slavery.toll && Number(c.slavery.toll.enslavedLow) || null,
        high: c.slavery.toll && Number(c.slavery.toll.enslavedHigh) || null,
        tollNote: (c.slavery.toll && c.slavery.toll.note) || null,
      });
    }
    const pt = c.populationTransfer;
    if (pt && Array.isArray(pt.kind)) {
      const kinds = pt.kind;
      const hit = LABOUR_CATEGORIES.filter((k) => kinds.includes(k.id));
      if (hit.length) {
        labourByT.set(t.id, { id: hit[0].id, all: hit.map((h) => h.id), note: pt.note || null });
        if (hit.length > 1) multiLabour.add(t.id);
      } else {
        labourByT.set(t.id, { id: null, all: [], note: pt.note || null });
      }
    }
    const v = c.violence;
    if (v && Array.isArray(v.kind) && v.kind.includes('famine-policy')) {
      famineByT.set(t.id, { note: v.note || null, toll: v.toll || null });
    }
  }

  /* Places whose record carries a rising or a killing, and the events
     themselves, indexed by year so the pins can accumulate as time runs. */
  const revoltEvents = [];
  for (const e of data.events || []) {
    if (e.kind !== 'revolt' && e.kind !== 'massacre') continue;
    revoltEvents.push(e);
  }
  const famineEvents = (data.events || []).filter((e) => e.kind === 'famine');

  return {
    acqByUnit, depByUnit, slaveryByT, labourByT, famineByT, multiLabour,
    revoltEvents, famineEvents,
  };
}

/* ---------------------------------------------------------- the re-keying - */

const catBy = (list, id) => list.find((c) => c.id === id) || null;

/**
 * “ — from the Konbaung kingdom”. The parties the record names, at most two,
 * appended to the family word so the plate's own label for a unit can never
 * say how it was taken without saying who lost it. Empty when the record
 * names nobody, because an invented counterparty is worse than none.
 */
function fromClause(cp) {
  if (!cp || !cp.length) return '';
  const names = cp.slice(0, 2).map((c) => c.name);
  const more = cp.length - names.length;
  return ' \u2014 from ' + names.join(' and ') + (more > 0 ? ', and ' + more + ' more' : '');
}

/**
 * The record that answers "who was this taken from" at a given year: the most
 * recent acquisition on or before it in which ground actually changed hands.
 * Exported because the plate, the key's named parties and the run-of-years
 * count in index.js must all pick the same record or they contradict each
 * other on screen. See the comment at its one use in `decide`.
 */
export function takenFromRecord(list, year) {
  let last = null; let anyOnOrBefore = null;
  for (const a of list || []) {
    if (a.year > year) break;
    anyOnOrBefore = a;
    if (a.mechanism !== 'annexation-of-existing-colony') last = a;
  }
  return last || anyOnOrBefore;
}

/** The acquisition family a mechanism belongs to. */
function familyOf(mechanism) {
  for (const f of MECHANISM_FAMILIES) if (f.members.includes(mechanism)) return f;
  return null;
}

/**
 * One layer's opinion about one unit.
 * Returns { key, word, mode } | null (no opinion — the unit is quieted).
 */
function decide(layerId, uid, rec, year, ix) {
  const e = rec.entry;
  const tid = e ? e.territoryId : null;

  if (layerId === 'mechanism') {
    const list = ix.acqByUnit.get(uid);
    if (!list || !list.length) return { mode: 'absence', word: 'no acquisition record for this ground' };
    let last = null;
    for (const a of list) { if (a.year <= year) last = a; else break; }
    if (!last) return { mode: 'absence', word: 'no acquisition recorded on or before this year' };
    const fam = familyOf(last.mechanism);
    if (!fam) return { mode: 'absence', word: 'mechanism “' + last.mechanism + '” has no drawing rule' };
    if (fam.key === 'informal') return { key: 'informal', word: fam.word, mode: 'informal', catId: fam.id };
    /* The family is what the colour says; the party is what the record says.
       Both go on the unit, and the party goes SECOND, so a reader who only
       ever meets the colour still meets the name. */
    return {
      key: fam.key, word: fam.word, catId: fam.id, mechanism: last.mechanism, since: last.year,
      label: fam.word + fromClause(last.cp),
      cp: last.cp,
    };
  }

  if (layerId === 'taken-from') {
    const list = ix.acqByUnit.get(uid);
    if (!list || !list.length) return { mode: 'absence', word: 'no acquisition record for this ground' };
    /* WHICH RECORD ANSWERS "WHO FROM", AND WHY IT IS NOT ALWAYS THE LAST ONE.
       The acquisition plate paints the most recent act on or before the year,
       and that is right for it: the question is what Britain last did here.
       It is wrong for this one. Measured on the first build of this reading,
       at 1913: Canada and every Australian colony painted "another party the
       record names", because their most recent acquisition is an
       `annexation-of-existing-colony` — a re-labelling, which this atlas's own
       key glosses "Nothing changed hands; a great deal changed on paper" — and
       the party it names is the British legislature that administered the
       ground before. That is a true fact about a filing cabinet and a false
       answer to "who was this taken from", on exactly the two places where
       M17 matters most.
       So a re-labelling is skipped: the plate uses the most recent record on
       or before this year in which ground actually changed hands. Where every
       record for a place is a re-labelling, the last one is used and the
       caveat says what that means. Ontario at 1913 now reads France, 1763. */
    const last = takenFromRecord(list, year);
    if (!last) return { mode: 'absence', word: 'no acquisition recorded on or before this year' };
    const first = last.cp && last.cp[0];
    /* A record with no counterparty is drawn as bare ground and counted in a
       row of its own, never folded into one of the eight. Every record in this
       dataset carries the field today; the day one does not, the plate says so
       rather than guessing. */
    if (!first) return { mode: 'absence', word: 'no counterparty named in this acquisition record', catId: 'none' };
    const cat = catBy(COUNTERPARTY_KINDS, first.kind) || catBy(COUNTERPARTY_KINDS, 'other');
    return {
      key: cat.key, word: cat.word, catId: cat.id,
      label: first.name + ' \u2014 ' + cat.word
        + (last.cp.length > 1 ? ', and ' + (last.cp.length - 1) + ' more named on the same record' : ''),
      cp: last.cp,
    };
  }

  if (layerId === 'exit') {
    const d = ix.depByUnit.get(uid);
    if (!d) return { mode: 'absence', word: 'no departure recorded in this atlas' };
    const cat = catBy(EXIT_CATEGORIES, d.mechanism);
    if (!cat) return { mode: 'absence', word: 'departure “' + d.mechanism + '” has no drawing rule' };
    return { key: cat.key, word: cat.word, catId: cat.id, exitYear: d.year };
  }

  if (layerId === 'slavery') {
    const s = tid && ix.slaveryByT.get(tid);
    if (!s) return null;
    if (s.abolition == null && s.emancipation == null) {
      return { mode: 'absence', word: 'enslavement recorded, no date held', catId: 'undated' };
    }
    const end = s.emancipation != null ? s.emancipation : s.abolition;
    const banned = s.abolition != null ? s.abolition : s.emancipation;
    if (year < banned) return { key: catBy(SLAVERY_STATES, 'trade').key, word: catBy(SLAVERY_STATES, 'trade').word, catId: 'trade' };
    if (year < end) return { key: catBy(SLAVERY_STATES, 'traded-banned').key, word: catBy(SLAVERY_STATES, 'traded-banned').word, catId: 'traded-banned' };
    return { key: catBy(SLAVERY_STATES, 'after').key, word: catBy(SLAVERY_STATES, 'after').word, catId: 'after' };
  }

  if (layerId === 'labour') {
    const l = tid && ix.labourByT.get(tid);
    if (!l) return null;
    if (!l.id) return { mode: 'absence', word: 'people were moved here; none of the four kinds this layer paints' };
    const cat = catBy(LABOUR_CATEGORIES, l.id);
    return { key: cat.key, word: cat.word, catId: cat.id, also: l.all.length - 1 };
  }

  if (layerId === 'famine') {
    const f = tid && ix.famineByT.get(tid);
    if (!f) return null;
    const cat = FAMINE_CATEGORIES[0];
    return { key: cat.key, word: cat.word, catId: cat.id };
  }

  if (layerId === 'resistance') {
    /* The sentence P17 prints for this layer is "colour = the legal status;
       the pins are recorded revolt and killing", so the colour MUST stay the
       legal status. What changes is that a place with nothing recorded stands
       back — the plate really does change, the pixel probe can see it, and the
       sentence stays true. */
    const set = ix.resistUnits;
    if (!set) return null;
    return set.has(uid) ? { keep: true, catId: 'held' } : null;
  }

  if (layerId === 'informal') {
    // Every formally held place stands back so the places Britain never
    // claimed are the loudest thing on the plate. The informal ones are
    // already drawn with no fill and no border by P02; we do not touch them.
    return rec.mode === 'informal' ? { keep: true } : null;
  }

  return { keep: true };
}

/**
 * Re-key a whole paint table for the active layer. Mutates the records, which
 * the map creates fresh on every `_paintFor`, and returns a tally the key card
 * and the sheet print. Nothing is invented: a unit the layer has no answer for
 * is quieted, and a unit whose record is silent is drawn as bare ground.
 */
/* HOW LOUDLY THE REST OF THE MAP STANDS BACK.
   P02 draws `quiet` at half alpha and `dim` at 0.22. Which is right depends on
   whether the layer's own sentence still claims the fill.
     · resistance and informal say "colour = the legal status" / "no colour",
       so the rest of the plate must stay READABLE as status: `quiet`.
     · slavery, labour and famine replace the fill, so a half-alpha settler
       colony sits at the same value as this layer's own palest category and
       the two become one. Measured at 1840: quieted Western Australia and
       "slavery ended here" were indistinguishable. Those layers use `dim`. */
const DIM_REST = new Set(['slavery', 'labour', 'famine']);

export function apply(table, { layerId, year, ix, tokens }) {
  const counts = new Map();
  const T = tokens;
  let painted = 0, absent = 0, quiet = 0;
  const members = new Map();   // catId -> [unitId]

  for (const [uid, rec] of table) {
    if (rec.mode === 'hole') continue;             // a silence outranks every layer
    const v = decide(layerId, uid, rec, year, ix);
    if (!v) { if (DIM_REST.has(layerId)) rec.dim = true; else rec.quiet = true; quiet++; continue; }
    const tally = (id, unit) => {
      if (!id) return;
      counts.set(id, (counts.get(id) || 0) + 1);
      if (!members.has(id)) members.set(id, []);
      members.get(id).push(unit);
    };
    if (v.keep) { painted++; tally(v.catId, uid); continue; }
    if (v.mode === 'informal') { painted++; tally(v.catId, uid); continue; }
    if (v.mode === 'absence') {
      rec.mode = 'absence';
      rec.label = v.word;
      rec.layerKey = null;
      rec.layerWord = v.word;
      rec.layerCat = v.catId || null;
      /* P02's accessible name for an `absence` record reads “no cited figure
         for the measure now sizing the map”, which is true of ITS absence
         (weight mode) and false of ours: ours means the record answers nothing
         this reading asks. The flag lets index.js correct that one clause in
         the name, on the records it owns and nowhere else. */
      rec.layerAbsence = v.word;
      absent++;
      continue;
    }
    const fill = T.fills[v.key];
    if (!fill) { rec.quiet = true; quiet++; continue; }
    rec.mode = 'fill';
    rec.fill = fill;
    rec.strokeColour = T.stroke[v.key] || rec.strokeColour;
    rec.texture = TEXTURE[v.key] || 'plain';
    rec.label = v.label || v.word;
    rec.layerKey = v.key;
    rec.layerWord = v.word;
    rec.layerCat = v.catId || null;
    painted++;
    tally(v.catId, uid);
  }
  return { counts, members, painted, absent, quiet };
}

/**
 * Which units carry a rising or a killing on or before this year — computed
 * here rather than in `decide` so it is done once per repaint and not once per
 * unit. Massacre outranks revolt on a unit that carries both, because it is
 * the rarer mark and the one a reader must not miss.
 */
export function resistUnitsAt(ix, year) {
  const out = new Map();
  for (const e of ix.revoltEvents) {
    if (!Number.isFinite(e.year) || e.year > year) continue;
    const units = (e.links && e.links.units) || e.units || [];
    for (const u of units) {
      const cur = out.get(u);
      if (cur === 'massacre') continue;
      out.set(u, e.kind);
    }
  }
  return out;
}

export { readTokens };
export default { buildIndex, apply, resistUnitsAt, takenFromRecord };
