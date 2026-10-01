/**
 * viz/ratio-line.js — THE RATIO LINE. FEATURE_SPEC charge 10, P08.
 *
 * Print's charge: "disproportion is a prose fact, not a spatial one." Print's
 * own answer is to state both numbers and trust the reader to divide. Most
 * readers do not divide. This does something print cannot: it makes the
 * student put a mark on the axis FIRST, and then shows them how far off it was.
 * Being wrong on purpose is the engine of DIDACTIC_SPEC §4 — a corrected
 * prediction is remembered; a read sentence is not.
 *
 * THE ORDER IS THE PEDAGOGY, and it is enforced, not suggested:
 *   1. one sourced anchor figure and one question;
 *   2. an axis with no answer on it, and a divider the student drags;
 *   3. a commitment, by pointer or by Enter, written to the Ledger;
 *   4. only then the figures, and the size of the error, in words.
 * Nothing animates before the commitment (P12's drama gate).
 *
 * THE AXIS SAYS WHAT IT IS, IN WORDS, ALWAYS. A logarithmic axis that does not
 * announce itself is a lie with a ruler on it. Kenya and the ICS are drawn
 * logarithmically because five orders of magnitude will not fit otherwise;
 * compensation is drawn linearly because a logarithmic axis cannot draw zero
 * at all, and there the zero is the whole fact.
 *
 * Keyboard: the divider is a slider — arrows move it, Home/End go to the ends,
 * Enter commits. It is reachable in one tab from the panel.
 */

import { el, fill } from '../core/util.js';
import { FIGURES } from './content.js';
import { figure, citation, warrantLine, checkWarrant } from './figures.js';
import { unitsOf } from './plate.js';
import { buildRangeBar } from './range-bar.js';

const STEPS = 220;                       // divider positions across the track

export function buildRatio(ctx, spec, onGo) {
  const { data, bus, format } = ctx;
  const root = el('div.viz.viz-ratio', { dataset: { ratio: spec.id, state: 'asking' } });

  const anchor = FIGURES[spec.anchorFig];
  const target = FIGURES[spec.targetFig];
  const anchorOk = anchor && checkWarrant(data, anchor.warrant).ok;
  const targetOk = target && checkWarrant(data, target.warrant).ok;

  /* ---------------------------------------------------------- the ask -- */
  const anchorP = el('p.viz-ratio__anchor', { html: spec.anchorLine });
  const q = el('p.cx-ask__q', { text: spec.question });
  const askBlock = el('div.cx-ask.viz-ratio__ask',
    el('span.cx-ask__eyebrow', { text: 'Commit a guess' }), q);

  /* ---------------------------------------------------------- the axis - */
  const scaleSaid = el('p.cx-note.viz-ratio__scale', { html: spec.scaleSaid });

  const track = el('div.viz-axis__track');
  const anchorMark = el('span.viz-axis__mark.viz-axis__mark--anchor', { dataset: { role: 'anchor' } });
  const anchorLbl = el('span.viz-axis__lab.viz-axis__lab--anchor');
  const targetMark = el('span.viz-axis__mark.viz-axis__mark--target', { hidden: true });
  const targetLbl = el('span.viz-axis__lab.viz-axis__lab--target', { hidden: true });
  const guessMark = el('span.viz-axis__mark.viz-axis__mark--guess', { hidden: true });
  const alsoWrap = el('div.viz-axis__also');

  const handle = el('button.viz-axis__handle', {
    type: 'button',
    role: 'slider',
    'aria-label': spec.guessLabel + ' — drag or use the arrow keys, then press Enter to commit',
    'aria-valuemin': '0', 'aria-valuemax': String(STEPS), 'aria-valuenow': String(Math.round(STEPS / 2)),
  });
  const axis = el('div.viz-axis', track, anchorMark, anchorLbl, targetMark, targetLbl, guessMark, handle);

  const endsLo = el('span.viz-axis__end.num');
  const endsHi = el('span.viz-axis__end.num');
  const ends = el('div.viz-axis__ends', endsLo, endsHi);

  const readout = el('p.viz-ratio__readout');
  const commit = el('button.viz-ratio__commit', {
    type: 'button', text: 'Commit this guess',
    onclick: () => doCommit(),
  });

  /* ---------------------------------------------------------- reveal --- */
  const reveal = el('div.viz-ratio__reveal', { hidden: true });

  /* The anchor is the one figure on screen before the guess, so it carries its
     citation immediately: a number a student can see is a number they can
     check. The ANSWER's warrant is printed at the reveal, not before it. */
  const anchorCite = anchor ? citation(data, anchor) : null;

  root.append(anchorP, anchorCite, askBlock, scaleSaid, axis, ends, readout, commit, alsoWrap, reveal);

  /* ============================================================ scale == */
  const isLog = spec.scale === 'log';
  const lo = spec.min, hi = spec.max;
  const L = (v) => Math.log10(Math.max(v, 1));

  const toPos = (v) => {
    if (isLog) return clamp01((L(v) - L(lo)) / (L(hi) - L(lo)));
    return clamp01((v - lo) / (hi - lo));
  };
  const toVal = (p) => {
    if (isLog) return Math.pow(10, L(lo) + p * (L(hi) - L(lo)));
    return lo + p * (hi - lo);
  };
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  const roundGuess = (v) => {
    if (!isLog) return Math.round(v / 100000) * 100000;
    if (v >= 1000000) return Math.round(v / 100000) * 100000;
    if (v >= 100000) return Math.round(v / 10000) * 10000;
    if (v >= 10000) return Math.round(v / 1000) * 1000;
    if (v >= 1000) return Math.round(v / 100) * 100;
    if (v >= 100) return Math.round(v / 10) * 10;
    return Math.round(v);
  };

  const money = spec.id === 'compensation';
  const say = (v) => (money ? '£' : '') + format.number(Math.round(v));

  endsLo.textContent = say(lo);
  endsHi.textContent = say(hi);

  /* The anchor is the one figure on screen before the guess, because the
     question is unanswerable without it. It is stated in the question too. */
  let step = Math.round(STEPS / 2);
  let committed = false;

  function place(node, v) { node.style.insetInlineStart = (toPos(v) * 100).toFixed(3) + '%'; }
  /** A label near an end of the axis re-anchors instead of hanging off it. */
  function placeLabel(node, v) {
    const p = toPos(v);
    node.style.insetInlineStart = (p * 100).toFixed(3) + '%';
    node.dataset.align = p < 0.22 ? 'start' : (p > 0.78 ? 'end' : 'mid');
  }

  if (anchorOk) {
    place(anchorMark, anchor.value);
    placeLabel(anchorLbl, anchor.value);
    fill(anchorLbl, el('span.num', { text: anchor.print }), el('span.viz-axis__u', { text: ' ' + (anchor.unit || '') }));
  } else {
    anchorMark.hidden = true;
    anchorLbl.dataset.align = 'start';
    fill(anchorLbl, el('b.viz-defect', { text: '[unsourced]' }));
  }

  function paint() {
    const p = step / STEPS;
    handle.style.insetInlineStart = (p * 100).toFixed(3) + '%';
    handle.setAttribute('aria-valuenow', String(step));
    const v = roundGuess(toVal(p));
    handle.setAttribute('aria-valuetext', say(v) + ' — ' + spec.guessLabel);
    if (!committed) {
      fill(readout,
        el('span.viz-ratio__yousay', { text: 'You are saying: ' }),
        el('span.num.viz-ratio__guess', { text: say(v) }),
        el('span.viz-ratio__u', { text: ' ' + spec.guessLabel.toLowerCase() }));
    }
    return v;
  }

  /* ---------------------------------------------------- dragging ------- */
  function fromClientX(x) {
    const r = track.getBoundingClientRect();
    if (!r.width) return step;
    const p = clamp01((x - r.left) / r.width);
    return Math.round(p * STEPS);
  }
  let dragging = false;
  const down = (ev) => {
    if (committed) return;
    dragging = true;
    axis.setPointerCapture && axis.setPointerCapture(ev.pointerId);
    step = fromClientX(ev.clientX); paint();
    ev.preventDefault();
  };
  axis.addEventListener('pointerdown', down);
  axis.addEventListener('pointermove', (ev) => { if (dragging && !committed) { step = fromClientX(ev.clientX); paint(); } });
  const up = () => { dragging = false; };
  axis.addEventListener('pointerup', up);
  axis.addEventListener('pointercancel', up);

  handle.addEventListener('keydown', (ev) => {
    if (committed) return;
    const big = ev.shiftKey ? 10 : 1;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { step = Math.max(0, step - big); }
    else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { step = Math.min(STEPS, step + big); }
    else if (ev.key === 'Home') { step = 0; }
    else if (ev.key === 'End') { step = STEPS; }
    else if (ev.key === 'Enter') { ev.preventDefault(); doCommit(); return; }
    else return;
    ev.preventDefault();
    paint();
  });

  /* ---------------------------------------------------- the commit ----- */
  function doCommit() {
    if (committed) return;
    const guess = roundGuess(toVal(step / STEPS));
    committed = true;
    root.dataset.state = 'revealed';
    commit.hidden = true;
    handle.setAttribute('aria-disabled', 'true');
    handle.disabled = true;

    place(guessMark, guess);
    guessMark.hidden = false;

    if (targetOk) {
      place(targetMark, target.value);
      placeLabel(targetLbl, target.value);
      fill(targetLbl, el('span.num', { text: target.print }), el('span.viz-axis__u', { text: ' ' + (target.unit || '') }));
      targetMark.hidden = false; targetLbl.hidden = false;
    }

    fill(readout,
      el('span.viz-ratio__yousay', { text: 'You said ' }),
      el('span.num.viz-ratio__guess', { text: say(guess) }),
      el('span', { text: '. ' }),
      el('span.viz-ratio__truth', { text: errorSentence(guess) }));

    /* The other counted quantities on the same axis — only now, and only the
       ones the dataset can back. */
    const also = (spec.alsoFigs || []).map((id) => FIGURES[id]).filter(Boolean);
    if (also.length) {
      fill(alsoWrap, el('h4.viz-also__h', { text: 'Where these sit on the same axis' }),
        ...also.map((f) => {
          const ok = checkWarrant(data, f.warrant).ok;
          const row = el('p.viz-also__r');
          row.append(figure(data, f, { focusable: false }));
          if (ok && f.value >= lo && f.value <= hi) {
            const m = el('span.viz-also__bar');
            m.style.inlineSize = (toPos(f.value) * 100).toFixed(2) + '%';
            row.append(m);
          }
          return row;
        }));
    }

    const wl = target ? warrantLine(data, target) : null;
    const cite = target ? citation(data, target) : null;
    /* A registered contested figure renders as a band on the same axis as the
       counted points above it, never as a scalar. See range-bar.js. */
    const range = spec.range ? buildRangeBar(ctx, spec.range, { toPos, lo, hi, sayLo: say(lo), sayHi: say(hi) }) : null;
    fill(reveal,
      range,
      wl,
      spec.after ? el('p.viz-ratio__after', { text: spec.after }) : null,
      cite);
    reveal.hidden = false;

    bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: 'p08:ratio:' + spec.id,
      t: spec.t || null,
      prompt: spec.question,
      youSaid: say(guess),
      answer: targetOk ? target.print + ' ' + (target.unit || '') : 'unsourced',
      year: spec.year || null,
      unitIds: spec.units || [],
    });
    bus.emit('viz:committed', { ratio: spec.id, guess, answer: targetOk ? target.value : null });

    const units = target && targetOk ? unitsOf(data, target) : [];
    const paintIds = (spec.units && spec.units.length ? spec.units : units);
    if (paintIds.length) bus.emit('ask:paintUnits', { unitIds: paintIds, reason: 'the place this figure is about' });
    if (spec.year) bus.emit('ask:setYear', { year: spec.year });

    if (ctx.util && ctx.util.announce) ctx.util.announce('You said ' + say(guess) + '. ' + errorSentence(guess));
  }

  function errorSentence(guess) {
    if (!targetOk) return 'This atlas cannot check its own figure for this question, so it prints nothing rather than a number it cannot defend.';
    const t = target.value;
    if (t === 0) {
      return 'The answer is £0. Not a small payment: no payment. Every penny of the £20,000,000 went to the people who had owned other people.';
    }
    const ratio = guess > 0 ? t / guess : Infinity;
    if (!Number.isFinite(ratio)) return 'The answer is ' + target.print + ' ' + (target.unit || '') + '.';
    if (ratio >= 1.6) {
      return 'The answer is ' + target.print + ' — about ' + niceFactor(ratio) + ' times more than you said.';
    }
    if (ratio <= 0.62) {
      return 'The answer is ' + target.print + ' — about ' + niceFactor(1 / ratio) + ' times fewer than you said.';
    }
    return 'The answer is ' + target.print + '. You were close, which is rarer here than you might think.';
  }

  function niceFactor(r) {
    if (r >= 1000) return format.compact(Math.round(r / 100) * 100);
    if (r >= 100) return String(Math.round(r / 10) * 10);
    if (r >= 10) return String(Math.round(r));
    return String(Math.round(r * 10) / 10);
  }

  /* ------------------------------------------------------- other lines - */
  if (typeof onGo === 'function' && spec.others && spec.others.length) {
    const more = el('p.viz-ratio__more');
    for (const o of spec.others) {
      more.append(el('button.cx-more', { type: 'button', text: o.label, onclick: () => onGo(o.id) }));
    }
    root.append(more);
  }

  paint();

  return {
    node: root,
    commit: doCommit,
    focus() { handle.focus(); },
    isCommitted: () => committed,
  };
}
