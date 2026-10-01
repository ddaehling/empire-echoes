/* timeline/row.js — ONE ACT, ONE CARD.

   Round 4 printed, at 1882, three cards for one act: the Egypt acquisition,
   "The bombardment of Alexandria and the occupation of Egypt", and "The British
   occupation of Egypt" — the last two opening with near-identical sentences. At
   1820 all three visible cards were the General Maritime Treaty, two of them
   beginning "A Royal Navy and Bombay Marine expedition destroyed the Qawasim
   fleet…". Seven slots spent on one paragraph said three times.

   `changes.js` already folded two territory *records* of one act into one card.
   That fold is extended here to the dataset's events, and the folded row model
   becomes the single source of truth for BOTH the inline row and the year
   sheet — which is the other round-4 defect: the row said "7 of 13" and the
   sheet it opened rendered 12 and claimed 12. There is now one array and one
   denominator.

   Everything is computed once per reading of "British", at mount, so a year
   change is a DOM write and nothing else. That is also why the 300-year sweep
   is now inside budget: round 4 rebuilt every string on every frame.

   Nothing here writes prose. Every sentence is the dataset's own. */

const DIR_GLYPH = { in: '+', out: '−', shift: '→' };

/* Two accounts of one act usually open with the same clause, because they are
   the same clause. Normalised, lower-cased, punctuation-free — so "The Royal
   Navy bombarded Alexandria on 11 July 1882" and "The Royal Navy shelled
   Alexandria for ten and a half hours" still diverge at word four and are
   printed in full, while a literal repeat is not printed twice. */
function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function sharedOpening(a, b) {
  const x = norm(a), y = norm(b);
  if (!x || !y) return 0;
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  return i;
}

/* The territories one card is about — its own, the one it came from, the one it
   went to, and the one whose record was folded into it. An event that names any
   of them is an account of this act. */
function terrSet(g) {
  const s = new Set();
  for (const k of ['territoryId', 'fromTerritoryId', 'toTerritoryId', 'mirrorTerritoryId']) {
    if (g[k]) s.add(g[k]);
  }
  for (const r of g.alsoRecords || []) if (r.territoryId) s.add(r.territoryId);
  return s;
}

/**
 * buildRows(def, events, ctx) -> Map<year, YearRow>
 *
 * ctx: { defLabel, format }
 */
export function buildRows(def, events, ctx) {
  const out = new Map();
  const label = ctx.defLabel;
  const years = new Set([...def.years.keys(), ...def.redraws.keys(), ...events.years]);

  for (const year of years) {
    const rec = def.years.get(year) || null;
    const groups = rec ? rec.groups : [];
    const records = rec ? rec.records : [];
    const redraws = def.redraws.get(year) || [];
    const evs = events.at(year).slice();

    /* ---- 1. the acts, in the order the row prints them ------------------ */
    const acts = [];
    for (const g of groups) acts.push(mk(g, 'change', year, label));
    for (const g of redraws) acts.push(mk(g, 'redraw', year, label));
    for (const r of records) acts.push(mk(r, 'record', year, label));

    /* ---- 2. fold every event that is an account of one of them ---------- */
    let folded = 0;
    const loose = [];
    for (const e of evs) {
      const host = hostFor(acts, e);
      if (host) {
        host.also.push(eventAsAccount(e, host));
        host.absorbed.push(e);
        folded++;
      } else loose.push(e);
    }

    /* ---- 3. fold the leftovers into each other -------------------------- */
    const keep = [];
    for (const e of loose) {
      const twin = keep.find((k) => sameAct(k.src, e));
      if (twin) { twin.also.push(eventAsAccount(e, twin)); twin.absorbed.push(e); folded++; continue; }
      keep.push(mkEvent(e));
    }
    for (const k of keep) acts.push(k);

    /* ---- 4. two places, one act ---------------------------------------- */
    /* 1820 puts Bahrain and the Trucial States in the row, both entering
       Britain's informal empire, both accounts opening "A Royal Navy and Bombay
       Marine expedition destroyed the Qawasim fleet…". They are two places and
       they keep two cards — merging them would delete a place from the map's
       own chronology — but the second says whose act it shares, so the row
       reads as one event in two places rather than as two events. */
    for (let i = 1; i < acts.length; i++) {
      const b = acts[i];
      if (b.kind === 'event' || !b.src.how) continue;
      for (let j = 0; j < i; j++) {
        const a = acts[j];
        if (a.kind === 'event' || !a.src.how) continue;
        if (overlap(a.src.how, b.src.how) >= 0.45) { b.sibling = a.subject; break; }
      }
    }

    /* ---- 5. finish the strings ----------------------------------------- */
    for (const a of acts) finishStrings(a, label, year);

    const mapChanges = groups.length + redraws.length;
    const head = acts.length
      ? `${acts.length} ${acts.length === 1 ? 'act' : 'acts'} dated ${year}` +
        (mapChanges ? ` · ${mapChanges} ${mapChanges === 1 ? 'changes' : 'change'} the map` : ' · none of them moves the map')
      : '';

    const extras = [];
    const extrasShort = [];
    if (redraws.length) {
      const units = redraws.reduce((n, g) => n + g.units.length, 0);
      const from = [...new Set(redraws.map((g) => g.year))].sort((a, b) => a - b).join(', ');
      extras.push(`${units} ${units === 1 ? 'unit redraws' : 'units redraw'} here, dated ${from}`);
      extrasShort.push(`${units} redraw here, dated ${from}`);
    }
    if (records.length) {
      extras.push(`${records.length} ${records.length === 1 ? 'record' : 'records'} dated here, no map change`);
      extrasShort.push(`${records.length} dated, no map change`);
    }
    if (folded) {
      extras.push(`${folded} further ${folded === 1 ? 'record' : 'records'} of these same acts, folded in`);
      extrasShort.push(`${folded} folded in`);
    }

    out.set(year, {
      year, acts, mapChanges, folded,
      delta: rec ? rec.delta : 0,
      shiftUnits: rec ? rec.shiftUnits : 0,
      inUnits: rec ? rec.inUnits : 0,
      outUnits: rec ? rec.outUnits : 0,
      head,
      headShort: acts.length ? `${acts.length} ${acts.length === 1 ? 'act' : 'acts'} dated ${year}` + (mapChanges ? ` · ${mapChanges} change the map` : ' · none moves the map') : '',
      extras: extras.join(' · '),
      extrasShort: extrasShort.join(' · '),
    });
  }
  return out;
}

/* Content words, for measuring whether two records are saying the same thing. */
const STOP = new Set(['the', 'and', 'that', 'this', 'with', 'from', 'were', 'was', 'for', 'its', 'it', 'a', 'an', 'in', 'to', 'of', 'on', 'by', 'at', 'as', 'is', 'not', 'but', 'his', 'her', 'their', 'had', 'has', 'been', 'into', 'after', 'over', 'than', 'them', 'they', 'which', 'who', 'when', 'then']);
function words(text) {
  const out = new Set();
  for (const w of norm(text).split(' ')) if (w.length > 2 && !STOP.has(w)) out.add(w);
  return out;
}
/* Share of the shorter text's content words that also appear in the longer one.
   Two accounts of one act score very high; two things that merely happened in
   the same place in the same year do not. */
function overlap(a, b) {
  const A = words(a), B = words(b);
  if (A.size < 6 || B.size < 6) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / Math.min(A.size, B.size);
}

/* AN EVENT IS FOLDED ONLY WHEN IT IS THE SAME ACCOUNT, NOT MERELY THE SAME
   PLACE. The complaint round 4 made was textual — "the row's seven slots get
   spent on one paragraph said three times" — so the test is textual too: the
   event must name a place this card is about AND repeat what the card already
   says, either by opening with the same forty characters or by sharing at least
   45 per cent of its content words with the card's own account.

   That keeps Pontiac's War and the Royal Proclamation of 1763 as cards of their
   own beside the Treaty of Paris, and it still folds the two 1882 accounts of
   the bombardment of Alexandria and the two 1820 accounts of the General
   Maritime Treaty, which is what the row was losing its slots to. */
function hostFor(acts, e) {
  const ids = new Set(e.territoryIds || []);
  if (e.territoryId) ids.add(e.territoryId);
  const units = new Set(e.unitIds || []);
  if (!ids.size && !units.size) return null;
  const text = e.summary || e.significance || '';
  if (!text) return null;
  let best = null, bestScore = 0;
  for (const a of acts) {
    if (a.kind === 'event') continue;
    let named = false;
    for (const t of a.terrs) if (ids.has(t)) { named = true; break; }
    if (!named) for (const u of a.units) if (units.has(u)) { named = true; break; }
    if (!named) continue;
    /* Compared against the card's own account AND against every account already
       folded into it. Egypt 1882 is why: the regional record repeats the
       acquisition's sentence (0.62 of its content words) and the empire-wide
       one repeats the regional record's (0.58) but not the acquisition's
       (0.37). Three accounts of one bombardment, chained. */
    const texts = [a.src.how || ''];
    for (const r of a.also) if (r.src && r.src.summary) texts.push(r.src.summary);
    let score = 0;
    for (const t of texts) {
      if (!t) continue;
      score = Math.max(score, overlap(t, text), sharedOpening(t, text) >= 40 ? 1 : 0);
    }
    if (score >= 0.45 && score > bestScore) { bestScore = score; best = a; }
  }
  return best;
}

/* Two loose events are one act when they name a place in common and open with
   the same forty characters. Below that they are two things that happened in
   the same year, and they both get a card. */
function sameAct(a, b) {
  const A = new Set([...(a.territoryIds || []), a.territoryId].filter(Boolean));
  let shares = false;
  for (const t of [...(b.territoryIds || []), b.territoryId]) if (t && A.has(t)) { shares = true; break; }
  if (!shares) return false;
  return sharedOpening(a.summary, b.summary) >= 40 || sharedOpening(a.title, b.title) >= 18;
}

function mk(g, kind, filedYear, label) {
  return {
    kind: kind === 'redraw' ? 'change' : kind,
    rowKind: kind,
    dir: g.dir,
    glyph: DIR_GLYPH[g.dir] || '·',
    subject: g.subject,
    soft: !!g.soft,
    territoryId: g.territoryId || null,
    terrs: terrSet(g),
    units: g.units || [],
    population: g.population != null ? g.population : null,
    areaKm2: g.areaKm2 || 0,
    src: g,
    also: (g.alsoRecords || []).map((r) => ({
      kind: 'record',
      head: `The same act, recorded again under ${r.subject}: ${r.mechanism}${r.date ? ' · ' + r.date : ''}`,
      body: r.how || '',
      territoryId: r.territoryId || null,
    })),
    absorbed: [],
    filedYear,
    label,
  };
}

function mkEvent(e) {
  return {
    kind: 'event', rowKind: 'event',
    dir: 'event', glyph: '◆',
    subject: e.title,
    soft: !!e.soft,
    territoryId: e.territoryId || null,
    terrs: new Set([...(e.territoryIds || []), e.territoryId].filter(Boolean)),
    units: e.unitIds || [],
    population: null,
    areaKm2: 0,
    src: e,
    also: [],
    absorbed: [],
  };
}

/* A folded event, printed as what it is: another account of the same act. Where
   its opening clause repeats the card's, only the part that is new is kept —
   the point of folding is that the student reads the sentence once. */
function eventAsAccount(e, host) {
  const hostHow = host.kind === 'event' ? host.src.summary : (host.src.how || '');
  const shared = sharedOpening(hostHow, e.summary);
  const body = shared >= 40 && e.significance ? e.significance : (e.summary || e.significance || '');
  return {
    kind: 'event',
    id: e.id,
    head: `The same act, recorded again as an event: ${e.title} · ${e.date}${e.scopeLabel ? ' · ' + e.scopeLabel : ''}`,
    body,
    repeated: shared >= 40,
    sources: e.sources || [],
    significance: e.significance || '',
    territoryId: e.territoryId || null,
    src: e,
  };
}

/* ------------------------------------------------------- display strings -- */

function finishStrings(a, label, filedYear) {
  const g = a.src;
  if (a.kind === 'event') {
    a.mechLine = [g.date, g.type, g.scopeLabel].filter(Boolean).join(' · ');
    a.how = g.summary || '';
    a.howShort = g.summaryShort || '';
    a.howTruncated = !!(g.summary && g.summaryShort && g.summary !== g.summaryShort);
    a.howKind = 'account';
    a.dateNote = g.date;
  } else {
    a.mechLine = g.mechanism + (g.dateNote || g.date ? ' · ' + (g.dateNote || g.date) : '');
    a.how = g.how || '';
    a.howShort = g.howShort || g.gloss || '';
    a.howTruncated = !!g.howTruncated;
    a.howKind = g.howIsDefinition ? 'definition' : 'account';
    a.dateNote = g.dateNote || g.date || String(g.year);
  }

  /* the seam: everything true about this card that is not the mechanism */
  const seams = [], speech = [];
  if (a.rowKind === 'record') {
    seams.push(`no map change under “${label}”`);
    speech.push(`This is dated ${g.year}; the map under “${label}” does not move for it.`);
  }
  if (a.kind !== 'event') {
    if (g.statusMove && !/→/.test(g.mechanism)) {
      seams.push(g.statusMove);
      speech.push(`Its legal status goes from ${g.statusMove.replace(' → ', ' to ')}.`);
    }
    if (g.threshold) { seams.push(g.threshold); speech.push(g.thresholdWhy || ''); }
    if (a.rowKind === 'redraw') {
      seams.push(`dated ${g.dateNote || g.year} · the map redraws it here`);
      speech.push(`This is dated ${g.dateNote || g.year}; the map redraws it here.`);
    } else if (g.mapYear != null && g.mapYear !== g.year) {
      if (g.dir === 'out') {
        seams.push(`the map redraws it in ${g.mapYear}`);
        speech.push(`It is still drawn on this map to the end of ${g.year}, and the map redraws it at ${g.mapYear}.`);
      } else {
        seams.push(`the map draws it from ${g.mapYear}`);
        speech.push(`The map draws it from ${g.mapYear}.`);
      }
    }
  }
  if (a.sibling) {
    seams.push(`the same act as ${a.sibling}, in this row`);
    speech.push(`This is the same act as ${a.sibling}, which is also in this row.`);
  }
  if (a.also.length) {
    /* Not in the seam: the card's own last line already reads "and 2 more
       records of the same act", and printing it twice cost the seam its second
       line, which then clipped mid-phrase. */
    const n = a.also.length;
    speech.push(`${n} further ${n === 1 ? 'record' : 'records'} of the same act ${n === 1 ? 'is' : 'are'} folded into this card.`);
  }
  a.seamText = seams.join(' · ');

  const sentence = a.kind === 'event'
    ? [`${g.date}: ${g.title}.`, g.scopeLabel ? `A ${g.type} ${g.scopeLabel}.` : '', g.summaryShort].filter(Boolean).join(' ')
    : [
      changeSentence(a),
      g.dateNote || g.date ? `The record dates it ${g.dateNote || g.date}.` : '',
      a.howShort,
    ].filter(Boolean).join(' ');
  a.speechBody = speech.filter(Boolean).join(' ');
  a.aria = sentence + (a.speechBody ? ' ' + a.speechBody : '') + ' Opens the full record below, with the map still on screen.';
  a.sentence = sentence;
  a.filedYear = filedYear;
}

/* The arrow is a typographic device, not a word: a screen reader gets the verb
   it stands for, so what is heard is the sentence the card means. */
export function changeSentence(a) {
  const mech = String(a.src.mechanism).replace(/ → /g, ' becomes ');
  const joined = /^(taken by|left by|still |enters |British rule)/.test(mech) ? `${a.subject} ${mech}` : `${a.subject}: ${mech}`;
  return joined.replace(/\.$/, '') + '.';
}

export default { buildRows };
