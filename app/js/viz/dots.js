/**
 * viz/dots.js — THE HUNDRED DOTS. T8, M2, M9, P08's fifth component.
 *
 * WHY IT EXISTS. The second half of the critic's charge: "no guess-then-reveal
 * dot chart for the British share of the Company army." Guess-then-reveal is
 * not decoration. A prediction that turns out wrong is remembered; a sentence
 * read is not (Roediger & Karpicke; the hypercorrection effect). So nothing is
 * drawn until the student has filled in a number they will have to defend.
 *
 * AND THEN THE REFUSAL, WHICH IS THE POINT OF THIS PARTICULAR CHART.
 * This atlas records the SIZE of the East India Company's army — 280,000 men
 * by the 1850s, 200,000 handed to the Crown in 1858 — and it records that they
 * were "most of them Indian". It does not record how many were European,
 * because the Company published strength and not composition. So the dots do
 * not resolve to a percentage. They resolve to the band the record actually
 * supports: fewer than half, with everything above that drawn open and named
 * as uncounted.
 *
 * A chart that filled in the missing share would teach the wrong lesson twice —
 * once about the army, and once about what a number is. DIDACTIC_SPEC M18: "a
 * false-precision number in this app is a bug, not a rounding choice."
 *
 * What the record DOES let us draw beside the student's guess is a comparison:
 * the Company's private army was twice the size of the British Army. On a
 * hundred dots, every soldier the British state had anywhere on earth fills
 * fifty of them. That mark is warranted, and it makes the field readable.
 *
 * Keyboard: the field is a slider. Arrows move the fill by one dot, shift by
 * ten, Home/End to the ends, Enter commits. Clicking any dot fills to it.
 */

import { el, fill, append } from '../core/util.js';
import { FIGURES, DOTS } from './content.js';
import { figure, citation, warrantLine, checkWarrant } from './figures.js';

const N = 100;

export function buildDots(ctx, spec, opts = {}) {
  /* See flow.js: inside a beat, the beat owns the year and the selection. */
  const onPath = !!opts.onPath;
  const { data, bus } = ctx;
  const root = el('div.viz.viz-dots', { dataset: { dots: spec.id, state: 'asking' } });

  const anchor = FIGURES[spec.anchorFig];
  const compare = FIGURES[spec.compareFig];
  const anchorOk = anchor && checkWarrant(data, anchor.warrant).ok;
  const compareOk = compare && checkWarrant(data, compare.warrant).ok;

  /* ---------------------------------------------------------- the ask -- */
  const anchorP = el('p.viz-dots__anchor', { html: spec.anchorLine });
  const anchorBad = anchorOk ? null : figure(data, anchor || { id: 'dots:anchor', print: '', warrant: {} });
  const anchorCite = anchor ? citation(data, anchor) : null;
  const ask = el('div.cx-ask.viz-dots__ask',
    el('span.cx-ask__eyebrow', { text: 'Commit a guess' }),
    el('p.cx-ask__q', { text: spec.question }));

  /* ------------------------------------------------------- the hundred - */
  const field = el('div.viz-dots__field', {
    role: 'slider',
    tabindex: '0',
    'aria-label': spec.question + ' Use the arrow keys, then press Enter to commit.',
    'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0',
  });
  const dots = [];
  for (let i = 0; i < N; i++) {
    /* The dots are the drawing, not a hundred announcements: the field itself
       carries the value for a screen reader, and after the commit it stops
       being a control and becomes a described picture. */
    const d = el('span.viz-dot', { dataset: { i: String(i), state: 'idle' }, 'aria-hidden': 'true' });
    dots.push(d);
    field.append(d);
  }
  /* Ten by ten, so "half" is a row boundary and not a point inside a row.
     The cap is drawn where the evidence stops, across the field, in words. */
  const cap = el('span.viz-dots__cap', { hidden: true });
  const capNote = el('p.viz-dots__capnote', { hidden: true,
    text: 'The red line is where the evidence stops. “Most of them Indian” puts at least the fifty dots above it beyond argument. Nobody counted the fifty below.' });
  const wrap = el('div.viz-dots__wrap', field, cap);

  const readout = el('p.viz-dots__readout');
  const commit = el('button.viz-ratio__commit', { type: 'button', text: 'Commit this guess', onclick: () => doCommit() });

  const key = el('ul.viz-dots__key', { hidden: true });
  const verdict = el('div.viz-dots__verdict', { hidden: true });

  append(root, [anchorP, anchorBad, anchorCite, ask, wrap, capNote, readout, commit, key, verdict]);

  /* ============================================================ guess == */
  let step = 0;
  let committed = false;

  function paint() {
    for (let i = 0; i < N; i++) {
      dots[i].dataset.state = committed
        ? (i < Math.round(spec.answer.capFrac * N) ? 'indian' : 'open')
        : (i < step ? 'guess' : 'idle');
      /* After the reveal the student's own answer stays on the field as a ring
         over the record's, because a guess that disappears cannot be argued
         with and the Close has to be able to quote it back. */
      if (committed) dots[i].dataset.guess = i < step ? 'yes' : '';
    }
    field.setAttribute('aria-valuenow', String(step));
    field.setAttribute('aria-valuetext', step + ' of every hundred ' + spec.guessLabel);
    if (!committed) {
      fill(readout,
        el('span.viz-ratio__yousay', { text: 'You are saying: ' }),
        el('span.num.viz-ratio__guess', { text: String(step) }),
        el('span.viz-ratio__u', { text: ' of every hundred ' + spec.guessLabel }),
        step === 0 ? el('span.viz-ratio__u', { text: ' — press a dot, or use the arrow keys.' }) : null);
    }
  }

  function indexAt(x, y) {
    const r = field.getBoundingClientRect();
    if (!r.width) return step;
    for (let i = 0; i < N; i++) {
      const b = dots[i].getBoundingClientRect();
      if (x >= b.left - 1 && x <= b.right + 1 && y >= b.top - 1 && y <= b.bottom + 1) return i + 1;
    }
    /* Off a dot but inside the field: fall back to reading rows and columns. */
    const rowH = r.height / 5;
    const row = Math.max(0, Math.min(4, Math.floor((y - r.top) / rowH)));
    const col = Math.max(0, Math.min(20, Math.round(((x - r.left) / r.width) * 20)));
    return Math.max(0, Math.min(N, row * 20 + col));
  }

  let dragging = false;
  field.addEventListener('pointerdown', (ev) => {
    if (committed) return;
    dragging = true;
    field.setPointerCapture && field.setPointerCapture(ev.pointerId);
    step = indexAt(ev.clientX, ev.clientY); paint(); ev.preventDefault();
  });
  field.addEventListener('pointermove', (ev) => { if (dragging && !committed) { step = indexAt(ev.clientX, ev.clientY); paint(); } });
  const up = () => { dragging = false; };
  field.addEventListener('pointerup', up);
  field.addEventListener('pointercancel', up);

  field.addEventListener('keydown', (ev) => {
    if (committed) return;
    const big = ev.shiftKey ? 10 : 1;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') step = Math.max(0, step - big);
    else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') step = Math.min(N, step + big);
    else if (ev.key === 'Home') step = 0;
    else if (ev.key === 'End') step = N;
    else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); doCommit(); return; }
    else return;
    ev.preventDefault(); paint();
  });

  /* =========================================================== reveal == */
  function doCommit() {
    if (committed) return;
    const guess = step;
    committed = true;
    root.dataset.state = 'revealed';
    commit.hidden = true;
    field.setAttribute('aria-disabled', 'true');
    field.removeAttribute('tabindex');
    field.setAttribute('role', 'img');
    field.removeAttribute('aria-valuemin');
    field.removeAttribute('aria-valuemax');
    field.removeAttribute('aria-valuenow');
    field.removeAttribute('aria-valuetext');
    field.setAttribute('aria-label',
      'A hundred dots for the Company\u2019s army. You marked ' + guess + ' as British. '
      + Math.round(spec.answer.capFrac * N) + ' are drawn solid — ' + spec.answer.capLabel
      + '. The remaining ' + (N - Math.round(spec.answer.capFrac * N)) + ' are drawn open: ' + spec.answer.openLabel + '.');
    paint();

    const capN = Math.round(spec.answer.capFrac * N);
    cap.style.insetBlockStart = 'calc(' + (spec.answer.capFrac * 100).toFixed(2) + '% - 1px)';
    cap.hidden = false;
    capNote.hidden = false;

    /* The student's own mark stays on the field, as a numbered line under it,
       because a guess that vanishes at the reveal cannot be argued with. */
    fill(readout,
      el('span.viz-ratio__yousay', { text: 'You said ' }),
      el('span.num.viz-ratio__guess', { text: String(guess) }),
      el('span', { text: ' in a hundred were British. ' }),
      el('span.viz-ratio__truth', { text: verdictSentence(guess, capN) }));

    fill(key,
      el('li.viz-dots__ki', { dataset: { swatch: 'indian' } },
        el('span.viz-dots__sw'), el('span', { text: spec.answer.capLabel })),
      el('li.viz-dots__ki', { dataset: { swatch: 'open' } },
        el('span.viz-dots__sw'), el('span', { text: spec.answer.openLabel })),
      el('li.viz-dots__ki', { dataset: { swatch: 'guess' } },
        el('span.viz-dots__sw'), el('span', { text: 'what you said' })));
    key.hidden = false;

    fill(verdict,
      el('p.viz-dots__lead', { text: spec.verdictLead }),
      warrantLine(data, anchor),
      el('p.viz-dots__body', { text: spec.verdictBody }),
      compareOk && spec.compareLine ? el('p.viz-dots__cmpline', { html: spec.compareLine }) : null,
      compareOk ? warrantLine(data, compare) : null,
      el('p.viz-dots__after', { text: spec.after }),
      citation(data, anchor));
    verdict.hidden = false;

    bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: 'p08:dots:' + spec.id,
      t: spec.t || null,
      prompt: 'Of every hundred soldiers in the East India Company’s army, how many were British?',
      youSaid: guess + ' in 100 were British',
      answer: anchorOk ? 'fewer than 50 in 100 — “most of them Indian”, and the Europeans were never counted' : 'unsourced',
      /* Marked corrected only when the guess put the British in the majority of
         an army that conquered India. That is the misconception; being unsure
         where under half is not. */
      verdict: anchorOk && guess >= capN ? 'corrected' : null,
      year: spec.year || null,
      unitIds: spec.units || [],
    });
    bus.emit('viz:committed', { dots: spec.id, guess, answer: anchorOk ? capN : null });
    if (spec.year && !onPath) bus.emit('ask:setYear', { year: spec.year });
    if (spec.sel && !onPath) ctx.store.dispatch('select', spec.sel);
    if (ctx.util && ctx.util.announce) ctx.util.announce('You said ' + guess + ' in a hundred. ' + verdictSentence(guess, capN));
  }

  function verdictSentence(guess, capN) {
    if (!anchorOk) return 'This atlas cannot check its own figure for this question, so it prints nothing rather than a number it cannot defend.';
    if (guess >= capN) {
      return 'The record puts it below ' + capN + ': its words are “most of them Indian”. You put the British in the majority of an army that conquered India, and they were not.';
    }
    if (guess === 0) {
      return 'Below ' + capN + ' is right, but not none: there was a British officer corps, and it is the reason the sepoys had someone to mutiny against in 1857.';
    }
    return 'Below ' + capN + ' is the right side of the line — the record says “most of them Indian”. It will not tell you where under it, and neither will this chart.';
  }

  paint();

  return {
    node: root,
    commit: doCommit,
    focus() { field.focus(); },
    isCommitted: () => committed,
  };
}

export { DOTS };
