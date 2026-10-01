/* panels/dossier/fields.js — read the dataset, decide nothing.
 *
 * Every function here answers one question about a territory at a year using
 * only fields that exist in app/data/territories/*.json. Where the record is
 * silent these return null, and the renderer prints the silence. Nothing here
 * interpolates, averages or guesses.
 */
import { readDate } from '../../core/data.js';
import {
  STATUS_FAMILY, FAMILY_TEXTURE, DEPARTURE_VERB,
  LEGISLATURE, COUNTERPARTY_KIND, BECOMES_KIND, INSTRUMENT_KIND, label,
  acquisitionGloss, takenBlock as takenBlockGloss, inSentence as inSentenceGloss,
} from './vocab.js';

const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

/* ------------------------------------------------------------------ name -- */

/** The name in use at `year`, from namesOverTime, with who used it.
 *
 * Clamped to the years the territory exists. A namesOverTime entry with no `to`
 * runs to infinity, so at 1980 British India titled itself "Hindustan · 1980 ·
 * the name used locally in 1980" — a local name for a state that had been gone
 * for 33 years. Outside the entry's own span the atlas name is the only honest
 * title, because no one was using any name for a thing that did not exist. */
export function nameAt(territory, year) {
  const lastY = territory.lastYear;
  const firstY = territory.firstYear;
  const outside = (Number.isFinite(lastY) && year > lastY) || (Number.isFinite(firstY) && year < firstY);
  if (outside) return { name: territory.name, usedBy: null, language: null, note: null, isAtlasName: true, from: null, to: null, outside: true };
  const list = arr(territory.namesOverTime)
    .map((n) => ({ ...n, fromY: (readDate(n.from) || {}).year ?? null, toY: (readDate(n.to) || {}).year ?? null }))
    .filter((n) => n.name);
  let hit = null;
  for (const n of list) {
    const from = n.fromY == null ? -Infinity : n.fromY;
    const to = n.toY == null ? Infinity : n.toY;
    if (year >= from && year <= to) { if (!hit || from >= (hit.fromY ?? -Infinity)) hit = n; }
  }
  if (!hit) return { name: territory.name, usedBy: null, language: null, note: null, isAtlasName: true, from: null, to: null };
  return {
    name: hit.name,
    usedBy: hit.usedBy || null,
    language: hit.language || null,
    note: hit.note || null,
    isAtlasName: hit.name === territory.name,
    from: hit.fromY, to: hit.toY,
  };
}

/* How to say who used a name, in a sentence that ends "... in 1913".
   `modern` is the name we use now, so it must never render as
   "the name used today in 1956". */
export const USED_BY = {
  local: { at: 'the name used locally', plain: 'the name used locally' },
  'british-official': { at: 'the name British officials used', plain: 'the name British officials used' },
  british: { at: 'the name British officials used', plain: 'the name British officials used' },
  'other-european': { at: 'the name other Europeans used', plain: 'the name other Europeans used' },
  modern: { at: null, plain: 'the name used today, applied here to the whole period' },
  other: { at: 'in use at the time', plain: 'in use at the time' },
};

/** The sub-line under the title: never "the name used today in 1956". */
export function usedByLine(nm, year) {
  const e = USED_BY[nm.usedBy];
  if (!e) return nm.usedBy ? 'a name used by ' + String(nm.usedBy).replace(/-/g, ' ') + ' in ' + year : null;
  return e.at ? e.at + ' in ' + year : e.plain;
}

/* ---------------------------------------------------------------- status -- */

export function statusFamily(statusId) { return label(STATUS_FAMILY, statusId, 'never-british'); }
export function familyTexture(family) { return label(FAMILY_TEXTURE, family, 'plain'); }

/** The dataset's own definition of a status id, from territories/index.json. */
export function statusMeta(data, statusId) {
  return (data.statuses || []).find((s) => s.id === statusId) || null;
}

export function legislatureLine(id) {
  if (!id) return null;
  return label(LEGISLATURE, id, id);
}

/* ------------------------------------------------- taken / ended records -- */

/**
 * How it was taken — the whole shape of the answer, not one row of it.
 *
 * Round 1 printed the latest acquisition on or before the selected year as
 * THE answer to "how was it taken". For British India in 1930 that is the
 * Sikkim protectorate of 1890, out of twenty-one steps, and the panel said so
 * in display type.
 *
 * Round 3 printed the FIRST step as the answer, and got two things wrong.
 *
 *   (a) It asserted "IN FORCE IN 1964 — Absorbed whole into British rule,
 *       23 July 1920" three lines below "Britain held nothing here in 1964".
 *       The loop that produced it had no idea departures existed. On 41
 *       territories — Kenya 1964, Nigeria 1961, Egypt 1956, British India 1997
 *       — the panel stated as fact that a British acquisition was still in
 *       force years after the place had left. A false statement of fact, on
 *       the atlas's most important entries, from its primary interaction.
 *       `held` and `gone` are now required and the line is relabelled, never
 *       printed as "in force" once British authority here has ended.
 *
 *   (b) The first step on record is how Britain got IN; it is very often not
 *       the step that made Britain the ruler. British India at 1857 headlined
 *       a 1600 charter "taken from Other English merchants" — 0 units, no
 *       counterparty who lived in India — while the diwani of Bengal sat
 *       fifteen cards below. So the headline is now the LOAD-BEARING step,
 *       chosen on evidence the record actually carries, the founding step is
 *       still printed, and the reason for the ordering is printed with them.
 *
 * The ranking, in order, and every rule of it is printable to the student:
 *   1. the step this atlas records the largest counted death toll at
 *   2. failing that, the step that brought the most ground under control,
 *      when one step strictly beats every other
 *   3. failing that, the first step: Britain got in and stayed.
 */
const tollHigh = (cost) => {
  if (!cost || typeof cost !== 'object') return null;
  const hi = Number.isFinite(cost.deathsHigh) ? cost.deathsHigh : null;
  const lo = Number.isFinite(cost.deathsLow) ? cost.deathsLow : null;
  return hi != null ? hi : lo;
};

export function takingAt(territory, year, opts = {}) {
  const list = (territory.acquisitions || []).filter(Boolean);
  if (!list.length) return null;
  const founding = list[0];
  const held = opts.held !== false;     /* Britain has a legal status here at `year` */
  const gone = !!opts.gone;             /* a departure at or before `year` has happened */

  let latest = null;
  for (const a of list) if (a.year != null && a.year <= year) latest = a;
  const notYet = founding.year != null && year < founding.year;

  /* --- the load-bearing step ------------------------------------------- */
  let lead = founding;
  let leadWhy = null;
  if (list.length > 1) {
    const counted = list.map((a) => ({ a, n: tollHigh(a.cost) })).filter((x) => x.n != null);
    counted.sort((x, y) => y.n - x.n);
    if (counted.length) {
      if (counted[0].a !== founding) { lead = counted[0].a; leadWhy = { kind: 'toll', value: counted[0].n }; }
    } else {
      let best = null; let bestN = -1; let tie = false;
      for (const a of list) {
        const n = (a.units || []).length;
        if (n > bestN) { best = a; bestN = n; tie = false; } else if (n === bestN) tie = true;
      }
      if (best && best !== founding && !tie && bestN > (founding.units || []).length) {
        lead = best; leadWhy = { kind: 'ground', value: bestN };
      }
    }
  }

  /* --- what to say about the year the student is standing in ------------ */
  const ended = !held || gone;
  return {
    founding,
    lead,
    leadWhy,
    leadIsFounding: lead === founding,
    /* Only ever set when British authority here has NOT ended. */
    inForce: !ended && latest && latest !== lead ? latest : null,
    /* Set instead of inForce once it has. Labelled as the last step, never as
       a step still in force. */
    lastStep: ended && latest && latest !== lead ? latest : null,
    /* The headline step is itself the latest one at this year. */
    leadIsCurrent: !!latest && latest === lead,
    ended,
    held,
    count: list.length,
    notYet,
    all: list,
  };
}

/** Kept for callers that want a single step; returns the FOUNDING one. */
export function acquisitionAt(territory) {
  const list = territory.acquisitions || [];
  return list.length ? list[0] : null;
}

/** How the story ends: the last departure on record, whatever the year is. */
export function finalDeparture(territory) {
  const list = territory.departures || [];
  return list.length ? list[list.length - 1] : null;
}

/** A departure at or before `year`, for the "already left" case. */
export function departureAt(territory, year) {
  let hit = null;
  for (const d of territory.departures || []) if (d.year != null && d.year <= year) hit = d;
  return hit;
}

/**
 * HOW IT WAS TAKEN, in one line.
 *
 * There is no logic here any more, and that is the point. Round 1 printed
 * "taken from another European coloniser" over Kenya's African counterparties;
 * round 3 printed "Handed over by another European power at the end of a war"
 * over Tipu Sultan, the Marathas, the Lahore Durbar and Konbaung Burma; round 5
 * printed "Bought" over the Treaty of Amritsar, at which Britain was the
 * SELLER. Three patches to three strings, and the same defect each time: a
 * mechanism tag was being asked to write a sentence about a record it had not
 * read.
 *
 * So the sentence is assembled in exactly one place — `acquisitionGloss()` in
 * vocab.js — from tables that are split so that no string asserting a
 * direction, an agent or a party is reachable from a tag at all. This file
 * re-exports it and adds nothing. tools/check-gloss.js asserts that this line
 * is still a bare re-export, and fails the build if logic reappears here.
 */
export const acquisitionVerb = acquisitionGloss;
/* ROUND 6: the same rule one level up. The BLOCK — eyebrow, verb, secondary
   qualifier and the label beside the names — is assembled in vocab.js and
   re-exported verbatim, so there is still exactly one author of this prose and
   tools/check-gloss.js can render what the page renders. */
export const takenBlock = takenBlockGloss;
export const inSentence = inSentenceGloss;

export function departureVerb(mechanism) { return label(DEPARTURE_VERB, mechanism, mechanism); }
export function counterpartyKind(kind) { return label(COUNTERPARTY_KIND, kind, kind); }
export function becomesKind(kind) { return label(BECOMES_KIND, kind, kind); }
export function instrumentKind(kind) { return label(INSTRUMENT_KIND, kind, kind); }

/* ---------------------------------------------------------------- actors --
 * The requirement (FEATURE_SPEC §2 P04, test 3) is that every dossier names a
 * non-British person or institution, and that a dossier which cannot renders a
 * visible defect rather than hiding it.
 *
 * Round 1 got two things wrong. It filed every European power under "other",
 * so Jersey, Guernsey, Madeira, the Azores, Guadeloupe and the US Virgin
 * Islands printed [missing local actors] in --danger while naming Salazar,
 * John VI of Portugal and Victor Hugues two lines below. And it printed the
 * same red defect on Ascension, whose own record says there was nobody there,
 * three paragraphs above the sentence that says it.
 *
 * So there are now three buckets and one honest test:
 *   here    people and bodies of this place: indigenous peoples and polities,
 *           regional states, non-British people on the local side, the movement
 *           the record credits with forcing the departure
 *   other   other non-British parties: European powers, other-power people
 *   none    the record explicitly says no one lived here when Britain took it
 * The defect fires only when `here` and `other` are BOTH empty.
 */
const EUROPEAN_KINDS = new Set(['european-power']);

/* THE ORDER OF THE `here` BUCKET, AND WHY IT IS NOT DOCUMENT ORDER.
 * Round 3's critic asked for named colonised actors to be surfaced in the top
 * six of "Who was here". Measured before this change, British India's top six
 * opened with **"Other English merchants"** — the rival London traders the
 * 1600 charter was aimed at, filed as `kind: "other"` on the earliest
 * acquisition, and therefore first in document order under a heading that says
 * who was HERE. Nothing was wrong with the data; the list was simply printed
 * in the order the takings happened.
 *
 * So the bucket is ranked. Peoples and polities of the place first, then the
 * states of the region, then everyone else the record files as a party. The
 * sort is stable, so within a rank the record's own order survives — this
 * reorders, it never drops, and nothing is inferred about anybody: the rank is
 * read straight off `counterparty.kind`, which the dataset already states.
 */
const HERE_RANK = {
  'indigenous-people': 0,
  'indigenous-polity': 0,
  'regional-state': 1,
  empire: 1,
  'chartered-company': 3,
  other: 3,
};
function hereRank(kind, source) {
  if (source === 'person') return 2;      /* a named individual of this place */
  if (source === 'movement') return 2;
  const r = HERE_RANK[kind];
  return r == null ? 2 : r;
}

export function actorsOf(territory) {
  const here = [];
  const other = [];
  const seen = new Set();
  let empty = null;
  const push = (bucket, name, role, source, kind) => {
    const n = String(name || '').trim();
    if (!n) return;
    const k = n.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    bucket.push({ name: n, role: role || null, source, rank: hereRank(kind, source) });
  };

  for (const a of territory.acquisitions || []) {
    for (const c of a.counterparties || []) {
      if (c.kind === 'no-resident-population') {
        if (!empty) empty = { name: c.name, note: c.note || c.lost || null, year: a.year };
        continue;
      }
      const line = [counterpartyKind(c.kind), c.lost ? 'lost: ' + c.lost : null].filter(Boolean).join(' — ');
      if (EUROPEAN_KINDS.has(c.kind)) push(other, c.name, line, 'counterparty', c.kind);
      else push(here, c.name, line, 'counterparty', c.kind);
    }
    for (const p of a.people || []) {
      if (p.side === 'british') continue;
      (p.side === 'other-power' ? push.bind(null, other) : push.bind(null, here))(p.name, p.role, 'person');
    }
  }
  for (const d of territory.departures || []) {
    for (const p of d.led || []) {
      if (p.side === 'british') continue;
      (p.side === 'other-power' ? push.bind(null, other) : push.bind(null, here))(p.name, p.role, 'person');
    }
    if (d.movement) push(here, d.movement, 'the movement the record credits with forcing this departure', 'movement');
  }
  /* Deliberately NOT harvested: people attached to this territory's events.
     The shell attaches every empire-wide event that links to a territory, so
     the War of 1812's people would arrive in the Bermuda dossier and Tecumseh
     would be listed as somebody who was in Bermuda. A name in the wrong place
     is worse than a hole, and the hole is printed. */
  /* Stable by construction: Array.prototype.sort is stable in every engine
     this app runs in, so equal ranks keep the record's own order. */
  here.sort((a, b) => a.rank - b.rank);
  return { here, other, empty, named: here.length + other.length };
}

/**
 * THE SIX NAMES PRINTED ABOVE THE FOLD.
 * A rank-ordered list alone gives six peoples and polities and no person, and
 * a fifteen-year-old remembers Jaja of Opobo and Nōpera Panakareao, not "the
 * delta city-states". So the fold's six is composed rather than sliced: up to
 * three of the peoples and polities whose place this was, up to three named
 * individuals from it, record order inside each group, and the rest of the
 * list filled from the top if either group is short. Nobody is invented and
 * nobody is hidden — the full list, in rank order, is one click away in the
 * sheet with the derivation note above it.
 */
export function foldActors(actors, n = 6) {
  const here = (actors && actors.here) || [];
  /* `departures[].movement` is a free-text field and some entries put a whole
     sentence in it — New Zealand's reads "No independence movement against
     Britain. The movement that changed New Zealand was Māori: Kīngitanga,
     Kotahitanga, Rātana, Ngā Tamatoa and the 1975 land march." That is a good
     sentence and a terrible name, and it belongs in the list in the sheet, not
     in a row of six names. A movement reaches the fold only when it reads as a
     name: short, and not a sentence. */
  const nameable = (a) => a.source !== 'movement' || (a.name.length <= 60 && !/\.\s/.test(a.name));
  const pool = here.filter(nameable);
  const people = pool.filter((a) => a.source === 'person');
  const bodies = pool.filter((a) => a.source === 'counterparty');
  const half = Math.floor(n / 2);
  const out = [...bodies.slice(0, half), ...people.slice(0, n - Math.min(half, bodies.length))];
  if (out.length < n) for (const a of pool) { if (out.length >= n) break; if (!out.includes(a)) out.push(a); }
  if (out.length < n) for (const a of here) { if (out.length >= n) break; if (!out.includes(a)) out.push(a); }
  /* Print them in the order the ranked list holds them, so the fold and the
     sheet do not disagree about who comes first. */
  const rank = new Map(here.map((a, i) => [a, i]));
  return out.slice(0, n).sort((a, b) => rank.get(a) - rank.get(b));
}

/* --------------------------------------- the people the record does not name --
 * Bermuda is the one territory of 260 whose entry names no non-British person
 * at all, so it is the one that prints [missing local actors] in --danger.
 * That is what FEATURE_SPEC §2 P04 test 3 requires and it stays. But a bare
 * red error teaches nothing, and Bermuda's record is not silent about people:
 * it describes about four thousand enslaved Bermudians freed in 1834, a Black
 * majority shut out of the vote until 1968, and captives shipped in from King
 * Philip's War. None of them is named. That is a different and more
 * interesting failure than "no data", and it is computed from the record's own
 * fields — never invented, never inferred from prose.
 */
export function unnamedGroups(territory) {
  const out = [];
  const c = territory.consequences || {};
  if (c.slavery) out.push('the people it says were enslaved here');
  if (c.populationTransfer) out.push('the people moved here or taken away by force');
  if (c.violence) out.push('the people counted in the violence');
  const fr = (territory.spans || []).map((s) => s.franchise).filter(Boolean).join(' ');
  if (/exclud|only|no one|barred|property|white|men\b/i.test(fr)) out.push('the people its franchise shut out');
  for (const a of territory.acquisitions || []) if (a.resistance) { out.push('the people who resisted'); break; }
  return out;
}

/* ------------------------------------------------------------------ toll --
 * Never a scalar where the record is a range, never a zero where the record is
 * silent. A cost with a note and no figures renders as the note, headed
 * "no count exists". */
export function toll(cost) {
  if (!cost || typeof cost !== 'object') return null;
  const lo = Number.isFinite(cost.deathsLow) ? cost.deathsLow : null;
  const hi = Number.isFinite(cost.deathsHigh) ? cost.deathsHigh : null;
  return {
    low: lo, high: hi,
    counted: lo != null || hi != null,
    range: lo != null && hi != null && lo !== hi,
    note: cost.note || null,
    displaced: Number.isFinite(cost.displaced) ? cost.displaced : null,
  };
}

/* ------------------------------------------------------------------ dates -- */

/** Prefer the record's own display string; fall back to format.js. */
export function showDate(d, format) {
  const r = readDate(d);
  if (!r) return null;
  const raw = d && typeof d === 'object' ? d : null;
  return {
    year: r.year,
    text: (raw && raw.display) || format.date({ year: r.year, month: r.month, day: r.day }) || format.year(r.year),
    circa: r.circa,
    note: r.note || null,
    precision: r.precision,
  };
}

/** Every territory nested inside this one — the princely-states case (T11). */
export function childrenOf(data, territory, year) {
  const kids = [];
  for (const t of data.territories) {
    if (t.nestedWithin !== territory.id) continue;
    const at = data.territoryAt(t.id, year);
    kids.push({ territory: t, at, active: !!(at && at.active) });
  }
  return kids.sort((a, b) => Number(b.active) - Number(a.active) || a.territory.name.localeCompare(b.territory.name));
}

/* ---------------------------------------------------- the status period --
 * The data layer slices an authored statusPeriod on the territory's geographic
 * coverage, so Bengal's single crown-rule period of 1 November 1858 to
 * 15 August 1947 arrives as a span starting in 1912, and Kenya's 1920-1963
 * crown colony arrives as 1952-1959. Round 1 printed the slice and called it
 * "this status ran", which is false.
 *
 * `span.from` / `span.to` are the AUTHORED statusPeriod dates; `span.start` /
 * `span.end` are the slice. This returns both, plus the coverage label and the
 * change note that explain why they differ — two authored strings the panel
 * threw away.
 */
export function statusRun(span, format) {
  if (!span) return null;
  const authoredStart = span.from && Number.isFinite(span.from.year) ? span.from.year : span.start;
  const authoredEnd = span.to && Number.isFinite(span.to.year) ? span.to.year : span.end;
  const sliced = authoredStart !== span.start || (authoredEnd ?? null) !== (span.end ?? null);
  return {
    authored: format.yearRange(authoredStart, authoredEnd),
    authoredStart,
    authoredEnd,
    startText: (span.from && span.from.display) || null,
    endText: (span.to && span.to.display) || null,
    sliced,
    slice: sliced ? format.yearRange(span.start, span.end) : null,
    coverageLabel: span.coverageLabel || null,
    coverageChange: span.coverageChange || null,
  };
}

/** Every unit this territory holds at `year` that no nested territory holds:
 *  what Britain ruled directly, as opposed to what the same colour covers. */
export function directUnitsAt(data, territory, year) {
  const at = data.territoryAt(territory.id, year) || { units: [] };
  const mine = new Set(at.units || []);
  const inside = new Set();
  const kids = [];
  for (const t of data.territories) {
    if (t.nestedWithin !== territory.id) continue;
    const kat = data.territoryAt(t.id, year);
    kids.push({ territory: t, at: kat, active: !!(kat && kat.active) });
    for (const u of (kat || { units: [] }).units || []) if (mine.has(u)) inside.add(u);
  }
  const direct = [...mine].filter((u) => !inside.has(u));
  return { all: [...mine], direct, inside: [...inside], kids };
}

/* ------------------------------------------------------------------ clip --
 * Round 2 clamped the fold's fields with `-webkit-line-clamp`, so the flagship
 * franchise line ended "roughly 3% of adults enfranchised af…" and the control
 * line ended "A Viceroy in Calcutta, then New…". A sentence cut mid-word is not
 * a summary; it is content the student cannot reach.
 *
 * clip() therefore cuts at a boundary the language actually has — a sentence
 * end, then a clause end, then a word — never inside a word, and always reports
 * what is left so the caller can print a route to it.
 */
export function clip(text, max = 170) {
  const s = String(text == null ? '' : text).trim();
  if (!s) return { head: '', rest: null, whole: true };
  if (s.length <= max) return { head: s, rest: null, whole: true };

  /* Whole sentences first. */
  const parts = s.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [s];
  let head = '';
  for (const p of parts) {
    if (head && (head + p).trim().length > max) break;
    head += p;
    if (head.trim().length >= max * 0.55) break;
  }
  head = head.trim();
  if (head && head.length <= max && head.length < s.length) {
    return { head, rest: s.slice(head.length).trim(), whole: false, cut: 'sentence' };
  }

  /* One sentence longer than the budget: cut at a clause boundary. */
  const window = s.slice(0, max + 1);
  let at = -1;
  for (const m of window.matchAll(/[,;:—–](?=\s)/g)) at = m.index;
  if (at < max * 0.5) {
    const sp = window.lastIndexOf(' ');
    at = sp > max * 0.5 ? sp : -1;
  }
  if (at <= 0) return { head: s, rest: null, whole: true };
  return { head: s.slice(0, at).trim(), rest: s.slice(at).replace(/^[\s,;:—–]+/, ''), whole: false, cut: 'clause' };
}

/* ----------------------------------------------------------- the endings --
 * Round 2 printed the LAST departure as "How it ended". On Egypt that is the
 * Suez withdrawal of 1956, so the fold read as if Egypt became independent in
 * 1956 — three decades late and the wrong claim. British rule over a place can
 * end in stages, and the stage that ended it is the FIRST one.
 */
export function endingAt(territory, year) {
  const list = (territory.departures || []).filter(Boolean);
  if (!list.length) return null;
  const first = list[0];
  const last = list[list.length - 1];
  let next = null;
  for (const d of list) if (d.year != null && d.year >= year) { next = d; break; }
  let done = null;
  for (const d of list) if (d.year != null && d.year <= year) done = d;
  return { first, last, next, done, count: list.length, all: list };
}

/* ------------------------------------------------ T11: what sat inside it --
 * Round 2 printed "42 inside a territory with a ruler and a status of its own"
 * over a list that includes the Bengal, Madras and Bombay Presidencies, Punjab,
 * Assam, Sindh, the North-West Frontier, the Central Provinces, Burma and the
 * Andamans. Those are British provinces with British governors. As printed it
 * taught that nine tenths of the Indian Empire was under Indian rulers, when
 * the split is closer to three fifths / two fifths by area.
 *
 * So the split is made on the child's own STATUS at the year, not on the mere
 * fact of being filed separately.
 */
const RULER_OF_ITS_OWN = new Set(['princely-state', 'protected-state', 'protectorate', 'informal-sphere']);

export function nestedSplit(data, territory, year) {
  const at = data.territoryAt(territory.id, year) || { units: [] };
  const mine = new Set(at.units || []);
  const provinceUnits = new Set();
  const stateUnits = new Set();
  const unplacedUnits = new Set();
  const provinces = [];
  const states = [];
  const dormant = [];
  for (const t of data.territories) {
    if (t.nestedWithin !== territory.id) continue;
    const kat = data.territoryAt(t.id, year);
    const active = !!(kat && kat.active);
    const status = kat && kat.span ? kat.span.status : null;
    const row = { territory: t, at: kat, active, status };
    if (!active) { dormant.push(row); continue; }
    const bucket = RULER_OF_ITS_OWN.has(status) ? states : status ? provinces : null;
    (bucket || dormant).push(row);
    const sink = bucket === states ? stateUnits : bucket === provinces ? provinceUnits : unplacedUnits;
    for (const u of (kat.units || [])) if (mine.has(u)) sink.add(u);
  }
  /* A unit can be claimed by two children in the same year; a state's own ruler
     is the more specific claim, so it wins and the province set drops it. */
  for (const u of stateUnits) provinceUnits.delete(u);
  const own = [...mine].filter((u) => !provinceUnits.has(u) && !stateUnits.has(u) && !unplacedUnits.has(u));
  return {
    all: [...mine],
    own,
    provinces, states, dormant,
    provinceUnits: [...provinceUnits],
    stateUnits: [...stateUnits],
    /* what British officials ran themselves: this entry's own ground plus every
       separately-filed unit whose status is a British administration */
    direct: [...new Set([...own, ...provinceUnits])],
  };
}

/* ---------------------------------------------- a higher figure in a note --
 * Kenya's headline read "DEAD 12,000 — 25,000" while the note under it cited
 * Blacker at about 50,000 excess deaths. A range bar that stops below the
 * highest figure its own note relies on is teaching a number the page then
 * contradicts. This reads the record's own note and, where the note carries a
 * larger count, says so and opens the top of the bar.
 *
 * Deliberately conservative: a bare integer is ignored (that is how years,
 * regiment numbers and file references get in), and money, land and distance
 * are excluded by the word that follows.
 */
const SCALE = { thousand: 1e3, million: 1e6, billion: 1e9 };
const NOT_PEOPLE = /^\s*(?:pounds?|£|\$|rupees?|dollars?|acres?|hectares?|square|km|kilometres?|kilometers?|miles?|tons?|tonnes?|per cent|%|shillings?)/i;

export function higherFigureInNote(note, high) {
  if (!note || !Number.isFinite(high)) return null;
  const s = String(note);
  let best = null;
  const re = /(?:^|[^\d.,£$])(\d[\d,]*(?:\.\d+)?)(\s*(?:thousand|million|billion))?/gi;
  let m;
  while ((m = re.exec(s))) {
    const digits = m[1];
    const scaleWord = (m[2] || '').trim().toLowerCase();
    if (!digits.includes(',') && !scaleWord) continue;          // a bare 1919 is a year
    const after = s.slice(m.index + m[0].length);
    if (NOT_PEOPLE.test(after)) continue;                        // money, land, distance
    const value = Number(digits.replace(/,/g, '')) * (SCALE[scaleWord] || 1);
    if (!Number.isFinite(value) || value <= high) continue;
    if (!best || value > best.value) best = { value, text: m[0].trim() };
  }
  return best;
}

/** Every cost object in the entry, largest counted toll first. */
export function tolls(territory) {
  const out = [];
  const push = (cost, where, label, id) => {
    if (!cost || typeof cost !== 'object') return;
    const t = toll(cost);
    if (!t) return;
    out.push({ ...t, where, label, id, cost });
  };
  for (const a of territory.acquisitions || []) push(a.cost, 'taken-full', acquisitionVerb(a.mechanism, a), 'a:' + a.id);
  for (const d of territory.departures || []) push(d.cost, 'ended-full', departureVerb(d.mechanism), 'd:' + d.id);
  const v = territory.consequences && territory.consequences.violence;
  if (v && v.toll) push(v.toll, 'consequences', 'What it left behind', 'c:violence');
  return out;
}
