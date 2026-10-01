/**
 * search/silence.js — the archive's holes, as searchable objects.
 *
 * FEATURE_SPEC §1 charge 7, Move 3: "searching something the archive cannot
 * answer must return the ABSENCE AS A RESULT — with its named agent, the date,
 * the disclosure history, and a 'what would settle it' line." Never
 * "no results found".
 *
 * WHERE THE SILENCES COME FROM. Not from this file. Every one of them is read
 * out of the shards at mount, from the sentences the dataset already writes
 * about its own numbers: a `toll.note` that says nobody counted, a
 * `contested.note` that says no census exists, a note that says the records
 * were destroyed. That is 180 of them at the time of writing, across events,
 * acquisitions, departures, consequences and population notes, and a shard
 * that adds one tomorrow is searchable tomorrow. `absences.json` adds only the
 * question a student would type, the named agent, the disclosure pointer and
 * the "what would settle it" line for the ten strongest cases.
 *
 * THREE SHAPES, and the difference between them is the lesson:
 *
 *   destroyed        a record was made and then somebody destroyed or hid it.
 *                    An agent is required. Where the dataset does not name
 *                    one, we say that, in those words — an unnamed destroyer
 *                    is still a destroyer.
 *   never-made       nobody was counting. There is nothing to disclose, ever.
 *                    The agent question changes: who was counting, and whom
 *                    did they leave out?
 *   contested-range  a range with a reason. The archive can answer, but not
 *                    to one number, and the reason is a method dispute.
 *
 * NOTHING HERE INVENTS A FIGURE. The range, the counted figure beside it, the
 * quotation and every date are the dataset's. The only prose this module
 * writes is the framing, and the framing is the same three sentences every
 * time so that a reader learns the shape.
 */

import { keyWords, scoreBest, scoreName } from './match.js';

/* A record noun, then a destruction verb, inside one sentence. Requiring the
   noun first is what stops "British columns burned hundreds of villages" and
   "casualty figures were not recorded" being read as destroyed archives. */
const REC = '(?:records?|files?|archives?|documents?|registers?|papers?|ledgers?|returns?)';
const DES = '(?:destroy|destruction|burn|burnt|shred|conceal|hidden|hiding|withheld|suppress|removed to Britain)';
const DESTROYED = new RegExp(REC + '\\b[^.]{0,160}' + DES + '|Hanslope|Operation Legacy|migrated archive', 'i');
/* A range whose own note says the figure is disputed, and says why. Not a
   destroyed record and not an absent one: a record that cannot settle the
   question, which is the third shape and the commonest. */
const DISPUTED = /\bdisputed\b|\bcontested\b|estimates? vary|cannot be given|could not be given|no agreement|order of magnitude|reconstructions?\b/i;
const NEVER = /no ?one counted|nobody counted|never counted|no census|were not counted|was not counted|not counted|no reliable count|no count (?:was|is) (?:made|possible)|none can now be made|no authority was counting|no agreed total|no one was counting|nobody counted independently|no one was keeping|were not recorded|none were recorded/i;

/** The words that turn a place query into a question about a number. */
const ASKING = /\b(deaths?|dead|died|dying|killed|kill|toll|tolls|how many|howmany|number|numbers|figures?|count|counted|counting|casualt\w*|victims?|records?|files?|archives?|destroyed|missing|lost|displaced|refugees?|removed|detained|hanged|massacre|famine|statistics|evidence|silence|silences|absence|unknown)\b/;

const KIND_LABEL = {
  destroyed: 'a record that was destroyed',
  'never-made': 'a count that was never made',
  'contested-range': 'a number nobody can settle',
};

/* The three lines the app writes for itself, one per shape. They are the same
   every time on purpose: the epistemology has three shapes and a student
   should come to recognise them. An authored entry overrides its own. */
const SETTLE = {
  destroyed: 'The destroyed file, or a copy of it somewhere the destroyer did not control — a duplicate sent to London, a mission letter book, a court record. When those surface the number moves, which is exactly what happened to the Kenyan figures after 2011.',
  'never-made': 'Nothing can be disclosed here, because nothing was written down to disclose. Only a reconstruction — from tax rolls, burial registers, army returns or a later census — and historians disagree about which of those to trust.',
  'contested-range': 'Not a document but a method: an agreed way of counting deaths above a baseline nobody measured at the time. Until two historians accept the same method the range is the answer, and the midpoint is not.',
};

const UNNAMED = 'This record does not say who destroyed them. An unnamed destroyer is still a destroyer, and the missing name is part of what was taken.';

const NEVER_AGENT = 'Nothing was destroyed here: the count was never made. The absence still has authors — the people who decided whose deaths were entered in a register and whose were not.';

function shapeOf(text) {
  if (!text) return null;
  if (DESTROYED.test(text)) return 'destroyed';
  if (NEVER.test(text)) return 'never-made';
  return null;
}

/** Pull the first sentence that carries the silence, so the quote is tight. */
function silentSentence(text, shape) {
  const re = shape === 'destroyed' ? DESTROYED : NEVER;
  const parts = String(text).split(/(?<=\.)\s+/);
  for (const p of parts) if (re.test(p)) return p.trim();
  return String(text).trim();
}

function rangeOf(toll) {
  if (!toll) return null;
  if (toll.deathsLow != null && toll.deathsHigh != null && toll.deathsLow !== toll.deathsHigh) {
    return { low: toll.deathsLow, high: toll.deathsHigh, unit: 'people dead', note: toll.note || null };
  }
  if (toll.displacedLow != null && toll.displacedHigh != null && toll.displacedLow !== toll.displacedHigh) {
    return { low: toll.displacedLow, high: toll.displacedHigh, unit: 'people displaced', note: toll.note || null };
  }
  return null;
}

/**
 * Build every silence the dataset carries, then fold the authored pointers on
 * top. An authored entry whose anchor does not resolve is dropped: this file
 * can never assert a silence the data has stopped carrying.
 */
export function buildSilences(data, doc) {
  const out = [];
  const seen = new Set();
  const authored = new Map();
  const authoredExtra = new Map();
  for (const a of (doc && doc.entries) || []) {
    if (a.anchor && a.anchor.eventId) authored.set('e:' + a.anchor.eventId, a);
    if (a.anchor && a.anchor.territoryId) authored.set('t:' + a.anchor.territoryId + '/' + (a.anchor.path || ''), a);
    for (const alt of a.also || []) {
      if (alt.eventId) authoredExtra.set('e:' + alt.eventId, a);
      if (alt.territoryId) authoredExtra.set('t:' + alt.territoryId + '/' + (alt.path || ''), a);
    }
  }

  /* One silence per figure. A territory whose departure cost and whose
     `consequences.violence` toll carry the same range is one hole in the
     record described twice, and printing it twice would be bookkeeping. */
  const ranges = new Set();
  const push = (rec) => {
    if (!rec || seen.has(rec.id)) return;
    if (rec.range) {
      const k = (rec.territoryId || rec.owner) + '|' + rec.range.low + '|' + rec.range.high;
      if (ranges.has(k)) return;
      ranges.add(k);
    }
    seen.add(rec.id);
    out.push(rec);
  };

  /* ---- events ---------------------------------------------------------- */
  for (const e of data.events) {
    const key = 'e:' + e.id;
    if (authoredExtra.has(key) && !authored.has(key)) continue;   // folded into its sibling
    const toll = e.toll || {};
    const contested = e.contested || null;
    const notes = [toll.note, contested && contested.note].filter(Boolean);
    let shape = null, quote = null;
    for (const n of notes) { const s = shapeOf(n); if (s) { shape = s; quote = silentSentence(n, s); break; } }
    const range = rangeOf(toll);
    if (!shape && range && ((contested && contested.isContested) || DISPUTED.test(toll.note || ''))) {
      shape = 'contested-range'; quote = (toll.note || contested.note);
    }
    if (!shape) continue;
    const a = authored.get(key) || null;
    const d = data.readDate(e.date) || {};
    push(makeRecord({
      data, a, shape, quote, range,
      id: 'silence:' + e.id,
      owner: e.title,
      ownerKind: 'event',
      territoryId: e.territoryId || ((e.links && e.links.territories) || [])[0] || null,
      unitIds: (e.links && e.links.units) || [],
      year: Number.isFinite(d.year) ? d.year : e.year,
      when: d.display || (e.year != null ? String(e.year) : null),
      whenLabel: 'the event is dated',
      evidence: e.evidence || [],
      fullNote: toll.note || (contested && contested.note) || null,
      contestedNote: contested && contested.note,
      counted: countedIn(toll.note) || countedIn(contested && contested.note),
    }));
  }

  /* ---- territories ----------------------------------------------------- */
  for (const t of data.territories) {
    const slots = [];
    const cons = t.consequences || {};
    for (const k of Object.keys(cons)) {
      const v = cons[k];
      if (v && v.toll) slots.push({ path: 'consequences.' + k, note: v.toll.note, toll: v.toll, head: v.note || null });
    }
    for (const acq of t.acquisitions || []) {
      if (acq.cost) slots.push({ path: 'acquisitions.' + acq.id, note: acq.cost.note, toll: acq.cost, year: acq.year, head: acq.how || null, units: acq.units });
    }
    for (const dep of t.departures || []) {
      if (dep.cost) slots.push({ path: 'departures.' + dep.id, note: dep.cost.note, toll: dep.cost, year: dep.year, head: dep.how || null, units: dep.units });
    }
    if (t.peak && t.peak.populationNote) slots.push({ path: 'peak.populationNote', note: t.peak.populationNote, toll: null, head: null });

    for (const s of slots) {
      const shape = shapeOf(s.note);
      const range = rangeOf(s.toll);
      const finalShape = shape
        || (range && ((t.contested && t.contested.isContested) || DISPUTED.test(s.note || '')) ? 'contested-range' : null);
      if (!finalShape) continue;
      const key = 't:' + t.id + '/' + s.path;
      const shortKey = 't:' + t.id + '/' + s.path.split('.').slice(0, 2).join('.');
      if (authoredExtra.has(shortKey) && !authored.has(shortKey)) continue;
      const a = authored.get(shortKey) || authored.get(key) || null;
      push(makeRecord({
        data, a, shape: finalShape,
        quote: shape ? silentSentence(s.note, shape) : s.note,
        range,
        id: 'silence:' + t.id + ':' + s.path,
        owner: t.name,
        ownerKind: 'place',
        territoryId: t.id,
        unitIds: s.units && s.units.length ? s.units : (t.units || []),
        year: Number.isFinite(s.year) ? s.year : null,
        when: null,
        whenLabel: null,
        heldFrom: t.acquiredYear, heldTo: t.endedYear, stillBritish: t.stillBritish,
        evidence: t.evidence || [],
        fullNote: s.note,
        contestedNote: t.contested && t.contested.note,
        counted: countedIn(s.note),
        what: s.path.startsWith('consequences.') ? s.path.slice('consequences.'.length) : null,
      }));
    }
  }

  /* Authored entries whose disclosure event exists get it attached here, once. */
  for (const rec of out) {
    if (!rec.disclosureEventId) continue;
    const ev = data.events.find((e) => e.id === rec.disclosureEventId);
    if (!ev) { rec.disclosureEventId = null; continue; }
    const d = data.readDate(ev.date) || {};
    const end = ev.endDate ? (data.readDate(ev.endDate) || {}) : null;
    rec.disclosure = {
      id: ev.id, title: ev.title, from: d.display || null, to: end && end.display,
      summary: ev.summary || null, year: d.year || ev.year,
      money: (ev.toll && ev.toll.money) || null,
      unitIds: (ev.links && ev.links.units) || [],
    };
  }

  const byId = new Map(out.map((r) => [r.id, r]));
  return { list: out, byId };
}

/** Any counted figure the note itself states, so the pair can be shown. */
function countedIn(note) {
  if (!note) return null;
  for (const sentence of String(note).split(/(?<=\.)\s+/)) {
    const m = /\b(?:official|officially|commission|court records?|returns?)\b/i.exec(sentence);
    if (!m) continue;
    const fig = /\b(\d[\d,]{2,})\b/.exec(sentence);
    if (!fig) continue;
    return { figure: fig[1], from: sentence.trim() };
  }
  return null;
}

function makeRecord(o) {
  const { data, a, shape } = o;
  const authoredAgent = a && a.agent ? a.agent : null;
  const title = (a && a.ask) || defaultAsk(o);
  /* ONLY AN AUTHORED SILENCE HAS A NAME YOU CAN TYPE. A derived one's headline
     contains its subject's name ("No one counted: Ceylon"), so indexing it
     would put a lecture about uncounted dead above Ceylon itself for anyone
     who typed Ceylon. Derived silences are reachable one way only: by asking
     a question with a counting word in it. */
  const names = [];
  if (a) {
    names.push({ text: title, weight: 1, kind: 'question' });
    for (const tr of a.triggers || []) names.push({ text: tr, weight: 1, kind: 'question' });
  }
  names.push({ text: o.owner, weight: 0.5, kind: 'about' });

  return {
    kind: 'absence',
    silenceKind: shape,
    silenceLabel: KIND_LABEL[shape],
    id: o.id,
    authored: !!a,
    title,
    answer: (a && a.answer) || defaultAnswer(o),
    names,
    quote: o.quote || null,
    fullNote: o.fullNote || null,
    contestedNote: o.contestedNote || null,
    counted: o.counted || null,
    agent: authoredAgent || (shape === 'destroyed' ? null : NEVER_AGENT),
    agentUnknown: shape === 'destroyed' && !authoredAgent,
    agentUnknownNote: UNNAMED,
    range: o.range || null,
    year: (a && a.goto && a.goto.year) != null ? a.goto.year : o.year,
    when: o.when || null,
    whenLabel: o.whenLabel || null,
    heldFrom: o.heldFrom, heldTo: o.heldTo, stillBritish: o.stillBritish,
    owner: o.owner, ownerKind: o.ownerKind, what: o.what || null,
    territoryId: o.territoryId || null,
    unitIds: o.unitIds || [],
    evidence: o.evidence || [],
    disclosureEventId: (a && a.disclosureEventId) || null,
    disclosure: null,
    whatWouldSettleIt: (a && a.whatWouldSettleIt) || SETTLE[shape],
  };
}

function defaultAsk(o) {
  if (o.shape === 'destroyed') return 'The record for ' + o.owner + ' was destroyed';
  if (o.shape === 'never-made') return 'No one counted: ' + o.owner;
  return o.owner + ' — the number is disputed, and the dispute is the point';
}

function defaultAnswer(o) {
  if (o.shape === 'destroyed') return 'This atlas has no figure to give you, and the reason is in the record itself.';
  if (o.shape === 'never-made') return 'There was no count to lose. Nobody made one.';
  return 'A range, with a reason. A single number here would be false precision.';
}

/**
 * Which silences answer this query?
 *
 * Two routes in. A direct hit on the question or one of its triggers — typing
 * "Operation Legacy" — and the compound route, which is the one that matters:
 * a place this atlas knows, plus a word that asks for a number. "Kenya deaths
 * 1954" is the second kind, and it is the query FEATURE_SPEC names.
 */
export function findSilences(silences, q, qw, ctx = {}) {
  const out = [];
  const asking = ASKING.test(q);

  /* Score the silence's own question against the SUBJECT of the query, not
     against the question words. Otherwise "Kenya deaths 1954" matches every
     authored silence whose trigger contains the word "deaths", and the Indian
     National Army turns up in an answer about Kenya. */
  const core = keyWords(q).join(' ');
  const qq = core || q;
  const qqw = qq ? qq.split(' ') : qw;
  const read = ctx.read || [{ q: qq, qw: qqw, mul: 1 }];
  const placeIds = ctx.placeIds || new Set();
  const unitIds = ctx.unitIds || new Set();
  const years = ctx.years || [];

  for (const s of silences.list) {
    /* The subject's own name is NOT a way in. Typing "Ceylon" must return
       Ceylon, not a lecture about what nobody counted there; the absence
       appears when the reader asks a question, or names the silence itself. */
    const asked = s.names.filter((n) => n.kind !== 'about');
    let score = scoreBest(read, asked).score;
    let why = score ? 'named' : null;

    if (asking) {
      const ownerHit = scoreName(qq, qqw, s.owner, 1);
      const placeHit = s.territoryId && placeIds.has(s.territoryId);
      const unitHit = s.unitIds.some((u) => unitIds.has(u));
      if (placeHit || unitHit || ownerHit >= 500) {
        const bonus = 700 + (placeHit ? 120 : 0) + Math.min(140, ownerHit / 6);
        if (bonus > score) { score = bonus; why = 'asked'; }
      }
    }

    if (!score) continue;

    /* A year in the query that sits inside the silence's own window is a
       strong signal — "Kenya deaths 1954" over "Kenya deaths". */
    if (years.length && Number.isFinite(s.year)) {
      const gap = Math.min(...years.map((y) => Math.abs(y - s.year)));
      if (gap <= 12) score += 220;
      else if (gap > 30) score -= 260;   // a date was asked for; this is not it
    }
    if (s.authored) score += 180;
    if (s.silenceKind === 'destroyed') score += 90;

    out.push({ ...s, score: Math.round(score), why });
  }
  return out.sort((x, y) => y.score - x.score);
}

export { ASKING };
