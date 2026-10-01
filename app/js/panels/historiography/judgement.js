/* panels/historiography/judgement.js — commit before the verdict exists.
 *
 * The dossier's ask.js already does commit-then-correct for two things: a
 * misconception (do you think that is true?) and a death toll (what order of
 * magnitude?). Both have a right answer. This one does not, and that is the
 * whole point of it.
 *
 * FEATURE_SPEC charge 15 and DIDACTIC_SPEC §4 turn on the same mechanism —
 * a student who has committed to a position notices what happens to it — but
 * an interpretation is not a fact and cannot be marked. So the commitment here
 * has two parts and both are required:
 *
 *   1. WHICH ONE EXPLAINS MORE. Buttons, one per named position, plus
 *      "neither on its own", which is a real answer and is never the default.
 *   2. AND SAY WHY. A sentence, typed, at least twenty characters. Not
 *      optional, not skippable, and stored verbatim so it can be read back.
 *
 * Until BOTH are given, `verdict` and `settle` are NOT IN THE DOM. Not hidden
 * with CSS, not in a title attribute, not one element away — not rendered.
 * That is the same rule the dossier holds itself to and it is the only rule
 * that makes the exercise worth doing.
 *
 * The record is written into the dossier's own session ledger (ask.js
 * `remember`) with kind 'judgement', so a judgement shows up in "Every
 * question you have answered" beside the beliefs and the tolls, and is emitted
 * on the bus as `ledger:append` for P21's Close. Nothing is written to storage
 * by this file: the metrics schema belongs to P12/P19/P20.
 */
import { remember, answerFor } from '../dossier/ask.js';

const MIN_CHARS = 20;

/* Local mirror, because ask.js's record does not carry the free text in a
   shape this piece needs to re-render from, and because a judgement is keyed
   by dispute rather than by territory. */
const said = new Map();   /* disputeId -> { choice, label, why, at } */

export function judgementKey(disputeId) { return 'hgx:' + disputeId; }

/* The exact separator written into the Ledger's `youSaid` and read back out of
   it. One string, one place, so the two halves cannot drift apart. */
const SAID_JOIN = ' explains more — ';

export function saidSentence(label, why) { return label + SAID_JOIN + why; }

/**
 * BRING BACK WHAT THIS STUDENT ALREADY SAID.
 *
 * A judgement lived in this module's own Map and nowhere else, so it lasted
 * exactly as long as the tab. The Ledger, which is where it is also written,
 * survives a reload — and the Close reads from the Ledger. A student who came
 * back two days later, which this app explicitly supports and advertises, was
 * therefore told two different things about themselves: the Close printed
 * "YOURS — you said Drescher explains more" while this panel asked them the
 * question again as though they had never answered it. Two of our own surfaces
 * disagreeing about the student's own record is the defect this whole piece
 * exists to make impossible on questions of evidence; it is not defensible on
 * a question about the student.
 *
 * So the Map is rebuilt from the Ledger on mount. Only from our own rows —
 * `kind: 'collapsed'` with an `hgx:` claim — and only where the sentence can be
 * read back whole. Nothing is written to storage from here: this reads a record
 * another piece already keeps, which is charge 12's containment intact.
 */
export function rehydrate(ledger) {
  if (!ledger || typeof ledger.all !== 'function') return 0;
  let n = 0;
  for (const e of ledger.all()) {
    if (!e || e.kind !== 'collapsed') continue;
    const id = String(e.claimId || '');
    if (!id.startsWith('hgx:')) continue;
    const key = id.slice(4);
    if (!key || said.has(key)) continue;
    const raw = String(e.youSaid || '');
    const i = raw.indexOf(SAID_JOIN);
    if (i <= 0) continue;
    const label = raw.slice(0, i);
    const why = raw.slice(i + SAID_JOIN.length).trim();
    if (!why) continue;
    /* `choice` is not carried in the Ledger's schema, and this piece will not
       widen someone else's schema to store one. The label is what the panel
       prints back, and it is enough to show a returning reader their own
       answer; what is lost is which button was pressed, which nothing renders. */
    said.set(key, { choice: null, label, why, at: Number(e.at) || Date.now(), restored: true });
    n += 1;
  }
  return n;
}

export function judgementFor(disputeId) {
  return said.get(disputeId) || null;
}

export function hasJudged(disputeId) { return said.has(disputeId); }

export function judgements() {
  return [...said.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => (b.at || 0) - (a.at || 0));
}

export function resetJudgements() { said.clear(); }

/** The name one position goes by, everywhere: on the button, in the pager, in
 *  the Ledger and in the Close. One function so the four cannot drift apart. */
export function positionName(p) {
  return p.whoShort || p.who.split(',')[0].split(' and ')[0];
}

/** The choices for a dispute: one per position, then the honest fourth wall. */
export function choicesFor(dispute) {
  const out = (dispute.positions || []).map((p) => ({
    id: p.key,
    /* `whoShort` where the reduction of `who` would still be a mouthful. The
       Waitangi Crown position reduced to "The New Zealand Crown's long-standing
       legal position", which is a sentence on the face of a button and, at 390,
       a pager label three lines deep. */
    label: positionName(p),
    full: p.short,
  }));
  out.push({
    id: 'neither',
    label: 'Neither on its own',
    full: 'Each of them explains part of it, and I can say which part.',
  });
  return out;
}

/**
 * Record a judgement. Returns the stored entry.
 * `ctx` carries store/bus so the commitment reaches the same ledger every
 * other commitment in this app reaches.
 */
export function commit(dispute, choiceId, why, ctx) {
  const trimmed = String(why || '').trim();
  if (!choiceId || trimmed.length < MIN_CHARS) return null;
  if (said.has(dispute.id)) return said.get(dispute.id);
  const choice = choicesFor(dispute).find((c) => c.id === choiceId) || { id: choiceId, label: choiceId };
  const entry = { choice: choiceId, label: choice.label, why: trimmed, at: Date.now() };
  said.set(dispute.id, entry);

  const st = ctx && ctx.store ? ctx.store.getState() : {};
  /* `correct` is deliberately null. There is no right answer here and the
     panel that reads this list back must not print one. */
  remember(judgementKey(dispute.id), {
    kind: 'judgement',
    answer: choiceId,
    label: choice.label,
    correct: null,
    question: dispute.question,
    note: trimmed,
    territoryId: st.selectedTerritoryId || (dispute.territories || [])[0] || null,
    year: dispute.year || st.year || null,
  });
  if (ctx && ctx.bus) {
    /* P21's Ledger is a whitelist: a `kind` not in its enumeration is dropped
       on the floor, which is charge 12's containment working as designed and
       is also how this piece's commitments used to reach the Close and vanish.
       `collapsed` is the kind in P21's own vocabulary for choosing between
       competing claims, and it is what the student has just done. There is no
       `answer` field, because the Close prints that as "the atlas: …" and this
       atlas does not hold a right answer to this question. Everything the row
       needs to read as a sentence is in `youSaid`. */
    ctx.bus.emit('ledger:append', {
      kind: 'collapsed',
      claimId: judgementKey(dispute.id),
      prompt: dispute.question,
      youSaid: saidSentence(choice.label, trimmed),
      year: dispute.year || st.year || null,
      at: entry.at,
    });
  }
  return entry;
}

/** Has this student judged anything at all this session? */
export function judgedCount() { return said.size; }

export { MIN_CHARS, answerFor };
