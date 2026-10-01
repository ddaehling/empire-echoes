/* timeline/predict.js — commit before the reveal.

   Round 4's rubric line, verbatim: "P03 asks the student nothing (no retrieval,
   no prediction, no recap — C5 scores 2 against the chapter's THINK boxes)."
   True. A scrubber that only answers questions is a reference work; the chapter
   wins because it makes you commit and then shows you the record.

   So before the widest-year stop can fire, the clock stops one year short and
   asks two questions. Both are answered from figures this piece has already
   measured — `model.extremes.peak` and the rate rail's own half-window — so no
   number is invented to make a quiz out of.

     1. WHEN was this map at its widest? A year, typed. The guess is then drawn
        on the rate rail as a second marker, so the correction happens on the
        evidence rather than in a sentence about it.
     2. HOW LONG did it take to lose half of it? A bracket, not a slider,
        because a student's error here is a factor, not a percentage — the same
        reasoning P04's toll question uses.

   Both commitments go to the Ledger (`ledger:append`) so the Close can print
   them under this student's name, which is the half of charge 2 this piece owes
   P21. Nothing is written to storage here: the metrics schema belongs to
   P12/P19/P20 and this module will not open a second one behind their back. */

import { el } from '../core/util.js';

/* key -> { kind, answer, correct, at } — this session only. */
const record = new Map();

export function answerFor(key) { return record.get(key) || null; }
export function asked(key) { return record.has(key); }
export function resetPredictions() { record.clear(); }
export function tally() {
  let n = 0, near = 0;
  for (const e of record.values()) { n++; if (e.correct) near++; }
  return { asked: n, near };
}

/* Order-of-magnitude brackets for "how many years". The bands are wide on
   purpose: the judgement being tested is decades against centuries. */
const SPAN_BANDS = [
  { id: 'a', label: 'under 15 years', lo: 0, hi: 14 },
  { id: 'b', label: '15 to 40 years', lo: 15, hi: 40 },
  { id: 'c', label: '40 to 100 years', lo: 41, hi: 100 },
  { id: 'd', label: 'more than a century', lo: 101, hi: Infinity },
];
const bandFor = (n) => SPAN_BANDS.find((b) => n >= b.lo && n <= b.hi) || SPAN_BANDS[SPAN_BANDS.length - 1];

/**
 * buildPredict({ profile, peak, defLabel, bounds, onDone, onGuessYear, emit })
 * Returns an array of nodes for the drawer. Renders question 1; question 2
 * follows in place once question 1 is answered.
 */
export function buildPredict(ctx) {
  const { profile, peak, defLabel, bounds } = ctx;
  /* `.cx-ask` — the app's ONE treatment for a question put to the student, so
     a reader learns it in one encounter and recognises it in the dossier, the
     tour and the quiz. This used to be its own box. */
  const box = el('div.cx-ask.tl-pred', { role: 'group', 'aria-label': 'Two questions before the answer' });
  const kids = [
    el('p.cx-ask__eyebrow.tl-pred__eyebrow', { text: 'before you look' }),
  ];
  const body = el('div.tl-pred__body');
  kids.push(body);
  box.append(...kids);

  q1();
  return [box];

  /* ------------------------------------------------- 1. the widest year -- */
  function q1() {
    const key = 'p03:widest-year:' + defLabel;
    const prior = record.get(key);
    if (prior) { reveal1(prior.answer, true); return; }

    const input = el('input.tl-pred__year.num', {
      type: 'number', min: String(bounds.min), max: String(bounds.max),
      step: '1', inputmode: 'numeric', placeholder: '1900',
      'aria-label': `The year you think this map was at its widest, between ${bounds.min} and ${bounds.max}.`,
    });
    const go = el('button.btn.btn--small.tl-pred__go', { type: 'button', text: 'That is my guess' });
    const submit = () => {
      const y = Number(input.value);
      if (!Number.isFinite(y) || y < bounds.min || y > bounds.max) { input.focus(); return; }
      const off = Math.abs(y - peak.year);
      const entry = { kind: 'predict-widest', answer: y, measured: peak.year, correct: off <= 5, at: Date.now() };
      record.set(key, entry);
      if (ctx.emit) ctx.emit('ledger:append', { kind: 'predicted', claimId: key, ...entry });
      if (ctx.onGuessYear) ctx.onGuessYear(y);
      reveal1(y, false);
    };
    go.addEventListener('click', submit);
    input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); submit(); } });

    body.replaceChildren(el('div.tl-pred__q1',
      el('p.cx-ask__q.tl-pred__q', { text: `In which year was this map at its widest — the most units counting as ${defLabel} at once? Say a year before the atlas tells you.` }),
      el('div.tl-pred__row', input, go),
      el('p.tl-pred__hint', { text: `Anywhere from ${bounds.min} to ${bounds.max}. There is no penalty and nothing is scored; the point is to have a number of your own to be wrong against.` })));
    requestAnimationFrame(() => input.focus());
  }

  function reveal1(guess, silent) {
    const off = Math.abs(guess - peak.year);
    const dir = guess === peak.year ? '' : (guess < peak.year ? 'early' : 'late');
    const line = guess === peak.year
      ? `You said ${guess}. That is the year: ${peak.n} units, more than in any other year in this dataset on this reading.`
      : `You said ${guess}. The measured widest year on this reading is ${peak.year}, with ${peak.n} units — you were ${off} ${off === 1 ? 'year' : 'years'} ${dir}.`;
    const nodes = [
      el('p.tl-pred__q.tl-pred__q--done', { text: 'When was it widest?' }),
      el('p.tl-pred__verdict', { text: line }),
      el('p.tl-pred__hint', { text: `Your guess is on the rate rail as a hollow marker, beside the measured year. “Widest” here means the most units drawn, not the most people or the most land — the count changes with the reading of “British”, and pressing 1–4 changes it in front of you.` }),
    ];
    body.replaceChildren(el('div.tl-pred__q1', ...nodes));
    if (!silent) announceLater(line);
    q2();
  }

  /* -------------------------------------------- 2. how fast it came apart -- */
  function q2() {
    if (!profile || !profile.shedIn) { done(); return; }
    const key = 'p03:shed-span:' + defLabel;
    const prior = record.get(key);
    if (prior) { reveal2(prior.answer); return; }
    const truth = bandFor(profile.shedIn.span);
    const wrap = el('div.tl-pred__q2');
    const choices = el('div.cx-ask__choices.tl-pred__choices', ...SPAN_BANDS.map((b) => {
      const btn = el('button.btn.btn--small.tl-pred__choice', { type: 'button', text: b.label, 'data-band': b.id });
      btn.addEventListener('click', () => {
        const entry = { kind: 'predict-shed', answer: b.id, label: b.label, measured: profile.shedIn.span, correct: b.id === truth.id, at: Date.now() };
        record.set(key, entry);
        if (ctx.emit) ctx.emit('ledger:append', { kind: 'predicted', claimId: key, ...entry });
        reveal2(b.id);
      });
      return btn;
    }));
    wrap.append(
      el('p.cx-ask__q.tl-pred__q', { text: `Second: this map lost ${profile.lost} units in all. Half of them went inside one run of years. How long was that run?` }),
      choices);
    body.append(wrap);
  }

  function reveal2(answerId) {
    const truth = bandFor(profile.shedIn.span);
    const chose = SPAN_BANDS.find((b) => b.id === answerId) || truth;
    const right = chose.id === truth.id;
    const built = profile.builtIn;
    const line = `${right ? 'Yes.' : `You said ${chose.label}.`} Half of everything this map ever lost — ${profile.shedIn.n} of ${profile.lost} units — went inside ${profile.shedIn.span} years, ${profile.shedIn.from} to ${profile.shedIn.to}.` +
      (built ? ` Half of everything it gained took ${built.span} years, ${built.from} to ${built.to}.` : '');
    const wrap = body.querySelector('.tl-pred__q2') || body;
    wrap.replaceChildren(
      el('p.tl-pred__q.tl-pred__q--done', { text: 'How fast did it come apart?' }),
      el('p.tl-pred__verdict', { text: line }),
      el('p.tl-pred__hint', {
        text: built && built.span
          ? `That ratio is the shape on the rail: a long shallow rise and a short deep trough. It is measured on this atlas's ${profile.gained} recorded gains and ${profile.lost} recorded losses, on the reading “${defLabel}”. Press 1–4 and both numbers change, because both are facts about a definition as much as about the past.`
          : `Measured on this atlas's ${profile.lost} recorded losses, on the reading “${defLabel}”.`,
      }));
    announceLater(line);
    done();
  }

  function done() { if (ctx.onDone) ctx.onDone(); }

  function announceLater(text) {
    if (ctx.announce) ctx.announce(text, true);
  }
}

export default { buildPredict, answerFor, asked, tally, resetPredictions };
