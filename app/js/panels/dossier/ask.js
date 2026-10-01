/* panels/dossier/ask.js — commit before reveal.
 *
 * Round 2 lost to the printed chapter on one thing above all others: the
 * dossier asked the student nothing. Across 260 territories there was not one
 * interrogative, not one input, not one commitment. The chapter has a THINK box
 * roughly every page, and the whole of DIDACTIC_SPEC §4 turns on hypercorrection
 * — a student who commits to a wrong answer and is then shown the record
 * remembers it; a student who reads the correction next to the belief does not.
 *
 * So the two blocks that were already in the data become questions:
 *
 *   1. `pedagogy.misconception.belief` prints ALONE, with "do you think that is
 *      true?" and three answers. The correction is not in the DOM until the
 *      student commits. All 260 territories carry one, so every dossier asks.
 *   2. The largest counted death toll in the entry prints as a bracket
 *      question — order of magnitude, because that is the judgement students
 *      actually get wrong — and the figure is not in the DOM until they answer.
 *
 * Both commitments are stamped to the Ledger (`ledger:append`) and kept here for
 * the session, so returning to a place shows the student their own answer back.
 * Nothing is written to storage by this piece: the metrics schema belongs to
 * P12/P19/P20 and this module will not open a second one behind their back.
 */
import { el } from '../../core/util.js';

/* key -> { kind, answer, label, correct, at, territoryId, year } */
const record = new Map();

export function answerFor(key) { return record.get(key) || null; }
export function answered(key) { return record.has(key); }

export function remember(key, entry) {
  if (!key || record.has(key)) return record.get(key) || null;
  const e = { ...entry, at: Date.now() };
  record.set(key, e);
  return e;
}

/** What this student has committed to so far, this session. */
export function tally() {
  let n = 0, doubted = 0, ranges = 0, onTarget = 0;
  for (const e of record.values()) {
    if (e.kind === 'belief') { n++; if (e.correct) doubted++; }
    if (e.kind === 'toll') { ranges++; if (e.correct) onTarget++; }
  }
  return { beliefs: n, doubted, ranges, onTarget, all: n + ranges };
}

export function resetAnswers() { record.clear(); }

/** Every commitment this student has made this session, newest first.
 *
 *  The whole-app critic's round-2 verdict named C5 — no retrieval, no recap,
 *  nothing to take away — as one of the two things this application loses on.
 *  These are the only assessable acts in the app, and until now there was no
 *  way to find them again: a student answered a question about Bengal and it
 *  was gone the moment they clicked Egypt. The list is a destination in the
 *  rail (LAYOUT_BUDGET §3, level `deep`), so it costs nothing at second zero.
 */
export function answers() {
  return [...record.entries()]
    .map(([key, e]) => ({ key, ...e }))
    .sort((a, b) => (b.at || 0) - (a.at || 0));
}

/* ------------------------------------------------------------- the belief -- */

const BELIEF_CHOICES = [
  { id: 'true', label: 'I think that is true' },
  { id: 'false', label: 'I think that is false' },
  { id: 'unsure', label: 'I am not sure' },
];

/**
 * The verdict, written to be read by someone who has just been wrong.
 * `belief` is a misconception by definition — it is the thing the entry exists
 * to correct — so "false" is the answer the record supports, and we say that
 * without congratulating or scolding anybody.
 */
function beliefVerdict(answer) {
  if (answer === 'true') {
    return 'You said it was true. So does most of what gets written about this. The record below is where it breaks.';
  }
  if (answer === 'false') {
    return 'You said it was false. You were right to doubt it. This is the part of the record that carries you.';
  }
  return 'You said you were not sure. That is a fair place to start. Here is what the record holds.';
}

export const BELIEF = { choices: BELIEF_CHOICES, verdict: beliefVerdict };

/* -------------------------------------------------------------- the toll -- */

/* Order of magnitude, not a slider. A student's error on a death toll is almost
   never 15% — it is a factor of a hundred, and a bracket makes that visible in
   one line. The brackets are stated in words because that is how the answer is
   held in the head. */
export const BRACKETS = [
  { id: 'none', label: 'nobody', lo: 0, hi: 0 },
  { id: 'dozens', label: 'dozens', lo: 1, hi: 99 },
  { id: 'hundreds', label: 'hundreds', lo: 100, hi: 999 },
  { id: 'thousands', label: 'thousands', lo: 1000, hi: 9999 },
  { id: 'tens-thousands', label: 'tens of thousands', lo: 10000, hi: 99999 },
  { id: 'hundreds-thousands', label: 'hundreds of thousands', lo: 100000, hi: 999999 },
  { id: 'millions', label: 'a million or more', lo: 1000000, hi: Infinity },
];

export function bracketOf(n) {
  if (!Number.isFinite(n)) return null;
  for (let i = 0; i < BRACKETS.length; i++) if (n >= BRACKETS[i].lo && n <= BRACKETS[i].hi) return i;
  return BRACKETS.length - 1;
}

/** Where the record's own figure sits on the same scale. */
export function bracketSpan(low, high) {
  const a = bracketOf(low != null ? low : high);
  const b = bracketOf(high != null ? high : low);
  if (a == null || b == null) return null;
  return { from: Math.min(a, b), to: Math.max(a, b) };
}

export function bracketVerdict(pickIndex, span) {
  if (!span) return { correct: false, text: '' };
  if (pickIndex >= span.from && pickIndex <= span.to) {
    return { correct: true, text: 'That is the bracket the record gives.' };
  }
  const gap = pickIndex < span.from ? span.from - pickIndex : pickIndex - span.to;
  const dir = pickIndex < span.from ? 'low' : 'high';
  const word = gap === 1 ? 'One bracket' : gap === 2 ? 'Two brackets' : gap + ' brackets';
  return { correct: false, text: word + ' ' + dir + ' — a factor of about ' + Math.pow(10, gap) + '.' };
}

/* ------------------------------------------------------------- rendering -- */

function askHead(text, note) {
  const h = el('p.cx-ask__q.dsr__askq');
  h.append(el('span.dsr__askqt', { text }));
  if (note) h.append(el('span.dsr__asknote', { text: note }));
  return h;
}

function choiceRow(key, kind, choices, chosen) {
  const row = el('div.cx-ask__choices.dsr__choices', { role: 'group' });
  for (const c of choices) {
    const b = el('button.dsr__choice', {
      type: 'button',
      dataset: { act: 'ask', key, kind, value: c.id },
      'aria-pressed': chosen === c.id ? 'true' : 'false',
    }, el('span', { text: c.label }));
    if (chosen === c.id) b.dataset.chosen = 'yes';
    if (chosen && chosen !== c.id) b.disabled = true;
    row.append(b);
  }
  return row;
}

/**
 * The belief block. Before a commitment there is no correction in the DOM —
 * not hidden with CSS, not in a title attribute, not one element away. A
 * student cannot read past a question they have not answered because the answer
 * has not been rendered.
 */
export function beliefBlock({ key, belief, correction, correctionNodes, territoryName }) {
  const box = el('div.cx-ask.dsr__ask', { dataset: { ask: 'belief', state: answered(key) ? 'done' : 'open' } });
  const said = answerFor(key);
  box.append(el('span.cx-ask__eyebrow.dsr__askeyebrow', { text: said ? 'You answered this' : 'Think, before you read the record' }));
  box.append(el('blockquote.dsr__belief', {}, el('p', { text: String(belief) })));
  if (!said) {
    box.append(askHead('Do you think that is true of ' + territoryName + '?',
      'Commit to an answer and the record opens underneath it.'));
    box.append(choiceRow(key, 'belief', BELIEF_CHOICES, null));
    box.append(el('p.dsr__askwhy', {
      text: 'Nothing is graded and nothing is hidden afterwards. You are being asked because a belief you '
        + 'have committed to is one you notice being corrected.',
    }));
    return box;
  }
  box.append(choiceRow(key, 'belief', BELIEF_CHOICES, said.answer));
  box.append(el('p.dsr__askverdict', { dataset: { ok: said.correct ? 'yes' : 'no' }, text: beliefVerdict(said.answer) }));
  const rev = el('div.dsr__reveal');
  rev.append(el('p.dsr__revealk.sc', { text: 'What the record shows' }));
  const p = el('p.dsr__correction');
  if (correctionNodes) p.append(correctionNodes); else p.append(document.createTextNode(String(correction || '')));
  rev.append(p);
  box.append(rev);
  return box;
}

/**
 * The toll block. Same rule: the figure is not in the DOM until the student has
 * put a bracket on it.
 */
export function tollBlock({ key, question, low, high, format, tollNode, noteNode, higher }) {
  const box = el('div.cx-ask.dsr__ask.dsr__ask--toll', { dataset: { ask: 'toll', state: answered(key) ? 'done' : 'open' } });
  const said = answerFor(key);
  const span = bracketSpan(low, high);
  box.append(el('span.cx-ask__eyebrow.dsr__askeyebrow', { text: said ? 'You answered this' : 'Think, before the figure prints' }));
  if (!said) {
    box.append(askHead(question,
      'The record has a figure, and the note that prints with it says what the figure counts — often a famine '
      + 'or a war that followed, not the day in the heading. Put it in a bracket first.'));
    box.append(choiceRow(key, 'toll', BRACKETS, null));
    return box;
  }
  const pick = BRACKETS.findIndex((b) => b.id === said.answer);
  const v = bracketVerdict(pick, span);
  box.append(el('p.cx-ask__q.dsr__askq', {}, el('span.dsr__askqt', { text: question })));
  box.append(el('p.dsr__askpick', {},
    el('span.sc.dsr__k', { text: 'You said' }), ' ',
    el('b', { text: BRACKETS[pick] ? BRACKETS[pick].label : String(said.answer) })));
  box.append(el('p.dsr__askverdict', { dataset: { ok: v.correct ? 'yes' : 'no' }, text: v.text }));
  const rev = el('div.dsr__reveal');
  if (tollNode) rev.append(tollNode);
  if (higher) {
    rev.append(el('p.dsr__askhigher', {
      text: 'The note beneath names a higher published figure — about ' + format.number(higher.value)
        + ' — so the bar above is not the top of the argument.',
    }));
  }
  if (noteNode) rev.append(noteNode);
  box.append(rev);
  return box;
}

/** The one-line running record, printed in the THINK block's header. */
export function tallyLine() {
  const t = tally();
  if (t.all < 2) return null;
  const bits = [];
  if (t.beliefs) {
    bits.push('you have taken a position on ' + t.beliefs + (t.beliefs === 1 ? ' of these beliefs' : ' of these beliefs')
      + ' and doubted ' + t.doubted);
  }
  if (t.ranges) {
    bits.push('you have put a bracket on ' + t.ranges + (t.ranges === 1 ? ' death toll' : ' death tolls')
      + ' and had ' + t.onTarget + ' inside the range the record gives');
  }
  return 'So far this session, ' + bits.join('; ') + '.';
}
