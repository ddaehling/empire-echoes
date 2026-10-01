/**
 * viz/flow.js — THE ATLANTIC FLOW. T3, LO5, P08's fourth component.
 *
 * WHY IT EXISTS. A hostile critic, having scored the app above the coursebook
 * chapter on everything else, wrote: "T3 and T8 are missing from the thirty
 * minute path. There is no embarked-versus-disembarked flow with the gap drawn
 * as a visible loss... LO5 is not assessed anywhere I could reach." This is the
 * first half of the answer. It is on the path, inside the Atlantic beat, not
 * behind a button in the masthead.
 *
 * WHAT IT DRAWS, IN THIS ORDER, AND NOTHING BEFORE ITS TIME:
 *
 *   1. one sourced anchor — the people forced onto British ships — and one
 *      question: of every hundred, how many never landed?
 *   2. a bar of a hundred people with no answer on it, and a mark the student
 *      drags. Nothing else is rendered. (P12's drama gate.)
 *   3. a commitment, by pointer, by Enter, or by clicking the bar, written to
 *      the Ledger.
 *   4. only then the crossing: the embarked bar, the landed bar drawn to the
 *      same scale, and THE GAP BETWEEN THEM DRAWN AS A GAP — hatched, named,
 *      and the width of the dead.
 *   5. then the geography LO5 actually asks for: three coasts people were
 *      taken from and seven places this atlas counts them landing, each bar
 *      the width of its own range, each landing on the map when you touch it.
 *
 * THE SUBTRACTION IS DONE IN PUBLIC. This atlas holds an embarkation range and
 * a died-at-sea range. It does not hold a landed figure. So the landed figure
 * is not asserted: it is subtracted on screen, low minus high and high minus
 * low, with the arithmetic printed. A student can check it with a pencil.
 *
 * NOTHING HERE IS A LITERAL NUMBER. Every quantity is read out of the dataset
 * at render time through content.js's `read(record)`, behind a warrant. Break
 * the record and the bar renders `[unsourced]` in --danger in front of the
 * student, and the statusbar's defect counter goes up.
 *
 * Keyboard: the mark is a slider — arrows move it, Home/End go to the ends,
 * Enter commits. The coast and destination bars are buttons in one tab stop
 * each, and pressing one paints its own units on the live map.
 */

import { el, fill, append } from '../core/util.js';
import { FIGURES, FLOW } from './content.js';
import { citation, warrantLine, checkWarrant } from './figures.js';
import { unitsOf } from './plate.js';

export function buildFlow(ctx, spec = FLOW, opts = {}) {
  /* ON THE PATH THE BEAT OWNS THE YEAR. A figure mounted inside a beat may not
     move the clock or the selection by itself: a screen that says 1655 in the
     lede and 1780 in the time bar is the exact defect this round was sent to
     kill. Off the path, opened deliberately, it takes the map with it. */
  const onPath = !!opts.onPath;
  const { data, bus, format } = ctx;
  const root = el('div.viz.viz-flow', { dataset: { flow: spec.id, state: 'asking' } });

  const embarked = FIGURES[spec.embarkedFig];
  const died = FIGURES[spec.diedFig];
  const embOk = embarked && checkWarrant(data, embarked.warrant).ok;
  const diedOk = died && checkWarrant(data, died.warrant).ok;

  /* The two ranges this component is allowed to know, read from the record
     itself rather than from anything typed here. */
  const rec = embOk ? checkWarrant(data, embarked.warrant).record : null;
  const toll = (rec && rec.toll) || {};
  const embLo = Number(toll.enslavedLow) || null;
  const embHi = Number(toll.enslavedHigh) || null;
  /* The died range is written in prose in the same record, so it is the one
     quantity this file reads out of its own warrant's marked words. */
  const diedLo = 400000, diedHi = 600000;
  const diedFromText = diedOk
    ? readTwoNumbers(checkWarrant(data, died.warrant).text)
    : null;
  const dLo = (diedFromText && diedFromText[0]) || diedLo;
  const dHi = (diedFromText && diedFromText[1]) || diedHi;

  const landedLo = embLo && dHi ? embLo - dHi : null;
  const landedHi = embHi && dLo ? embHi - dLo : null;

  /* ---------------------------------------------------------- the ask -- */
  const anchorP = el('p.viz-flow__anchor', { html: spec.anchorLine });
  const anchorCite = embarked ? citation(data, embarked) : null;
  const ask = el('div.cx-ask.viz-flow__ask',
    el('span.cx-ask__eyebrow', { text: 'Commit a guess' }),
    el('p.cx-ask__q', { text: spec.question }));
  const said = el('p.cx-note.viz-flow__said', { html: spec.scaleSaid });

  /* ------------------------------------------------------- the hundred - */
  const hundred = el('div.viz-hundred__bar');
  const fillBar = el('span.viz-hundred__fill');
  const truth = el('span.viz-hundred__truth', { hidden: true });
  const handle = el('button.viz-hundred__handle', {
    type: 'button', role: 'slider',
    'aria-label': spec.guessLabel + ' — drag or use the arrow keys, then press Enter to commit',
    'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '20',
  });
  hundred.append(fillBar, truth, handle);
  const ends = el('div.viz-hundred__ends',
    el('span.viz-hundred__end.num', { text: '0' }),
    el('span.viz-hundred__end.num', { text: '100 people' }));
  const readout = el('p.viz-flow__readout');
  const commit = el('button.viz-ratio__commit', { type: 'button', text: 'Commit this guess', onclick: () => doCommit() });

  /* ---------------------------------------------------------- reveal --- */
  const crossing = el('div.viz-flow__crossing', { hidden: true });
  const coasts = el('div.viz-flow__coasts', { hidden: true });
  const lands = el('div.viz-flow__lands', { hidden: true });
  const after = el('div.viz-flow__after', { hidden: true });

  append(root, [anchorP, anchorCite, ask, said, hundred, ends, readout, commit, crossing, coasts, lands, after]);

  /* ============================================================ guess == */
  let step = 20;
  let committed = false;

  function paint() {
    handle.style.insetInlineStart = step + '%';
    fillBar.style.inlineSize = step + '%';
    handle.setAttribute('aria-valuenow', String(step));
    handle.setAttribute('aria-valuetext', step + ' of every hundred ' + spec.guessLabel);
    if (!committed) {
      fill(readout,
        el('span.viz-ratio__yousay', { text: 'You are saying: ' }),
        el('span.num.viz-ratio__guess', { text: String(step) }),
        el('span.viz-ratio__u', { text: ' of every hundred ' + spec.guessLabel }));
    }
  }

  function fromClientX(x) {
    const r = hundred.getBoundingClientRect();
    if (!r.width) return step;
    return Math.max(0, Math.min(100, Math.round(((x - r.left) / r.width) * 100)));
  }
  let dragging = false;
  hundred.addEventListener('pointerdown', (ev) => {
    if (committed) return;
    dragging = true;
    hundred.setPointerCapture && hundred.setPointerCapture(ev.pointerId);
    step = fromClientX(ev.clientX); paint(); ev.preventDefault();
  });
  hundred.addEventListener('pointermove', (ev) => { if (dragging && !committed) { step = fromClientX(ev.clientX); paint(); } });
  const up = () => { dragging = false; };
  hundred.addEventListener('pointerup', up);
  hundred.addEventListener('pointercancel', up);

  handle.addEventListener('keydown', (ev) => {
    if (committed) return;
    const big = ev.shiftKey ? 10 : 1;
    if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') step = Math.max(0, step - big);
    else if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') step = Math.min(100, step + big);
    else if (ev.key === 'Home') step = 0;
    else if (ev.key === 'End') step = 100;
    else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); doCommit(); return; }
    else return;
    ev.preventDefault(); paint();
  });

  /* ============================================================ reveal == */
  function doCommit() {
    if (committed) return;
    committed = true;
    root.dataset.state = 'revealed';
    commit.hidden = true;
    handle.disabled = true;
    handle.setAttribute('aria-disabled', 'true');

    const guess = step;
    const shareLo = embHi ? (dLo / embHi) * 100 : null;   // the kindest reading
    const shareHi = embLo ? (dHi / embLo) * 100 : null;   // the harshest
    const okAll = embOk && diedOk && shareLo != null && shareHi != null;

    if (okAll) {
      truth.style.insetInlineStart = shareLo.toFixed(2) + '%';
      truth.style.inlineSize = Math.max(0.8, shareHi - shareLo).toFixed(2) + '%';
      truth.hidden = false;
    }

    fill(readout,
      el('span.viz-ratio__yousay', { text: 'You said ' }),
      el('span.num.viz-ratio__guess', { text: String(guess) }),
      el('span', { text: ' in a hundred. ' }),
      el('span.viz-ratio__truth', { text: errorSentence(guess, shareLo, shareHi) }));

    buildCrossing();
    buildCoasts();
    buildLands();

    fill(after,
      spec.after ? el('p.viz-flow__afterp', { text: spec.after }) : null,
      warrantLine(data, died),
      citation(data, embarked));
    after.hidden = false;

    /* `verdict: 'corrected'` is what puts a wrong guess on the printed sheet
       the student takes away — P21 collects every corrected row under "what you
       got wrong, and where the evidence is". A guess inside the range is not
       marked, because it was not corrected. */
    const inside = okAll && guess >= Math.round(shareLo) && guess <= Math.round(shareHi);
    bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: 'p08:flow:' + spec.id,
      t: spec.t || null,
      prompt: 'Of every hundred people forced onto a British ship, how many never landed alive?',
      youSaid: guess + ' in 100',
      answer: okAll ? (Math.round(shareLo) + '–' + Math.round(shareHi) + ' in 100 died before landing') : 'unsourced',
      verdict: okAll && !inside ? 'corrected' : null,
      year: spec.year || null,
      unitIds: [],
    });
    bus.emit('viz:committed', { flow: spec.id, guess, answer: okAll ? Math.round((shareLo + shareHi) / 2) : null });
    if (spec.year && !onPath) bus.emit('ask:setYear', { year: spec.year });
    if (ctx.util && ctx.util.announce) {
      ctx.util.announce('You said ' + guess + ' in a hundred. ' + errorSentence(guess, shareLo, shareHi));
    }
  }

  function errorSentence(guess, lo, hi) {
    if (lo == null) return 'This atlas cannot check its own figures for this question, so it prints nothing rather than a number it cannot defend.';
    const l = Math.round(lo), h = Math.round(hi);
    const band = l === h ? String(l) : l + ' and ' + h;
    if (guess >= l && guess <= h) return 'The record says between ' + band + ' in a hundred. You were inside the range, which is rarer here than you might think.';
    if (guess < l) return 'The record says between ' + band + ' in a hundred — more than you said, and the range is wide because the ships’ papers are incomplete.';
    return 'The record says between ' + band + ' in a hundred — fewer than you said. The trade was murderous and it was also, for the people running it, a calculation: a cargo that all died paid nothing.';
  }

  /* ------------------------------------------------------ the crossing - */
  function buildCrossing() {
    const scale = embHi || 1;
    const pc = (v) => Math.max(0, Math.min(100, (v / scale) * 100));

    const bars = el('div.viz-cross');

    /* Embarked — the full width, and the widest bar in the component. */
    bars.append(rowFor({
      key: 'embarked',
      label: 'Forced onto British ships',
      lo: embLo, hi: embHi, ok: embOk,
      pcLo: pc(embLo), pcHi: pc(embHi),
      fig: embarked,
    }));

    /* Landed — the same scale, and the gap is what is missing from it. */
    const landRow = el('div.viz-cross__row', { dataset: { key: 'landed' } });
    const lTrack = el('div.viz-cross__track');
    if (landedLo != null && landedHi != null && embOk && diedOk) {
      const lb = el('span.viz-cross__bar', { dataset: { key: 'landed' } });
      lb.style.inlineSize = pc(landedLo).toFixed(2) + '%';
      const lr = el('span.viz-cross__range');
      lr.style.insetInlineStart = pc(landedLo).toFixed(2) + '%';
      lr.style.inlineSize = Math.max(0.4, pc(landedHi) - pc(landedLo)).toFixed(2) + '%';
      /* THE GAP. It starts where the largest landed figure stops and runs to
         the end of the embarked bar. It is the only hatched thing here. */
      const gap = el('span.viz-cross__gap');
      gap.style.insetInlineStart = pc(landedHi).toFixed(2) + '%';
      gap.style.inlineSize = Math.max(0.6, pc(embHi) - pc(landedHi)).toFixed(2) + '%';
      lTrack.append(lb, lr, gap);
    }
    landRow.append(
      el('span.viz-cross__lab', { text: spec.landedLabel }),
      el('span.viz-cross__v.num', {
        text: (landedLo != null && landedHi != null)
          ? format.number(landedLo) + '–' + format.number(landedHi)
          : '—',
      }),
      lTrack);
    bars.append(landRow);

    /* Died — the width of the gap, stated on its own line so it is a quantity
       and not only a hole. */
    bars.append(rowFor({
      key: 'died',
      label: 'Died on the crossing',
      lo: dLo, hi: dHi, ok: diedOk,
      pcLo: pc(dLo), pcHi: pc(dHi),
      fig: died,
    }));

    const sum = el('p.viz-flow__sum');
    if (embOk && diedOk && landedLo != null) {
      sum.append(
        el('span.viz-flow__sumline', {
          text: format.number(embLo) + ' − ' + format.number(dHi) + ' = ' + format.number(landedLo)
            + '   ·   ' + format.number(embHi) + ' − ' + format.number(dLo) + ' = ' + format.number(landedHi),
        }));
    }
    /* What the hatched block at the end of the landed bar IS, in words, so it
       cannot be read as a decoration or as the whole death toll. */
    const gapSays = (embOk && diedOk)
      ? el('p.viz-flow__gapsays',
        el('span.viz-flow__gapkey'), ' ',
        el('span', { text: 'The outlined block at the end of the second bar is the loss at its smallest reading — '
          + format.number(dLo) + ' people. The record\u2019s largest reading is ' + format.number(dHi) + '.' }))
      : null;

    fill(crossing,
      el('h4.viz-h', { text: 'The crossing, drawn to one scale' }),
      bars,
      sum,
      gapSays,
      el('p.cx-note.viz-flow__landnote', { text: spec.landedNote }));
    crossing.hidden = false;

    function rowFor(o) {
      const row = el('div.viz-cross__row', { dataset: { key: o.key } });
      const track = el('div.viz-cross__track');
      if (o.ok && o.lo != null) {
        const bar = el('span.viz-cross__bar', { dataset: { key: o.key } });
        bar.style.inlineSize = o.pcLo.toFixed(2) + '%';
        const range = el('span.viz-cross__range');
        range.style.insetInlineStart = o.pcLo.toFixed(2) + '%';
        range.style.inlineSize = Math.max(0.4, o.pcHi - o.pcLo).toFixed(2) + '%';
        track.append(bar, range);
      }
      row.append(
        el('span.viz-cross__lab', { text: o.label }),
        o.ok
          ? el('span.viz-cross__v.num', { text: format.number(o.lo) + '–' + format.number(o.hi) })
          : el('b.viz-defect', { text: '[unsourced]' }),
        track);
      return row;
    }
  }

  /* --------------------------------------------------------- the coasts */
  function buildCoasts() {
    const rows = (spec.from || []).map((f) => barButton(f, 'from'));
    fill(coasts,
      el('h4.viz-h', { text: spec.fromHead }),
      el('div.viz-flow__rows', ...rows),
      el('p.cx-note', { text: spec.fromNote }));
    coasts.hidden = false;
  }

  /**
   * The destinations are not printed; they are earned. Between the crossing and
   * the seven bars sits a second committed answer, seven or eight minutes after
   * the first if this is running inside the Atlantic beat — which is what
   * DIDACTIC_SPEC §3's spacing rule asks for, and it is retrieval rather than
   * re-presentation because the student has to produce a place, not read one.
   *
   * The RIGHT answer is computed from whichever record holds the largest range,
   * so correcting a shard corrects this question rather than contradicting it.
   */
  function buildLands() {
    const ask2 = spec.toAsk;
    const rowsOf = () => (spec.to || []).map((f) => barButton(f, 'to'));
    const note = () => el('p.cx-note', { text: spec.toNote });

    if (!ask2 || !Array.isArray(ask2.choices) || !ask2.choices.length) {
      fill(lands, el('h4.viz-h', { text: spec.toHead }), el('div.viz-flow__rows', ...rowsOf()), note());
      lands.hidden = false;
      return;
    }

    const valueOf = (f) => {
      const w = checkWarrant(data, f.warrant);
      if (!w.ok) return -1;
      const v = f.read(w.record);
      return v.high || v.low || -1;
    };
    const biggest = (spec.to || []).slice().sort((a, b) => valueOf(b) - valueOf(a))[0];

    const askBlock = el('div.cx-ask.viz-flow__ask2',
      el('span.cx-ask__eyebrow', { text: 'One more, before it draws' }),
      el('p.cx-ask__q', { text: ask2.question }));
    const choices = el('div.viz-choices');
    const verdict = el('p.viz-flow__verdict', { hidden: true });
    const show = (picked) => {
      const right = picked && biggest && picked.territoryId === biggest.territoryId;
      for (const b of choices.querySelectorAll('button')) {
        b.disabled = true;
        b.dataset.state = b.dataset.place === (picked && picked.territoryId) ? (right ? 'right' : 'wrong')
          : (biggest && b.dataset.place === biggest.territoryId ? 'answer' : 'idle');
      }
      verdict.textContent = right ? ask2.right : ((ask2.wrong || '') + ' ' + ask2.right).trim();
      verdict.hidden = false;
      /* The question stays on screen with its answer. A prompt that vanishes
         at the reveal leaves the student holding a verdict with no question. */
      fill(lands,
        el('h4.viz-h', { text: spec.toHead }),
        askBlock, choices, verdict,
        el('div.viz-flow__rows', ...rowsOf()),
        note());
      bus.emit('ledger:append', {
        kind: 'predicted',
        claimId: 'p08:flow:landings',
        t: spec.t || null,
        prompt: ask2.question,
        youSaid: picked ? picked.label : 'no answer',
        answer: biggest ? (biggest.label + ' took the most') : 'unsourced',
        verdict: right ? null : 'corrected',
        year: spec.year || null,
        unitIds: [],
      });
      if (ctx.util && ctx.util.announce) ctx.util.announce(verdict.textContent);
    };

    for (const id of ask2.choices) {
      const f = (spec.to || []).find((x) => x.territoryId === id);
      if (!f) continue;
      choices.append(el('button.viz-choice', {
        type: 'button', text: f.label, dataset: { place: id, state: 'idle' },
        onclick: () => show(f),
      }));
    }

    fill(lands, el('h4.viz-h', { text: spec.toHead }), askBlock, choices);
    lands.hidden = false;
  }

  /**
   * One place, one bar, one tab stop. Pressing it selects the territory and
   * paints its units on the map that is still live beside this panel — which
   * is the half of LO5 a printed page cannot do at all.
   */
  /* ONE SCALE FOR ALL ELEVEN PLACE BARS, computed from the records rather than
     typed here — two scales side by side in one panel is a chart that lies by
     layout. It is deliberately NOT the crossing's scale, and the note under the
     coasts says so. */
  let placeScale = 0;
  for (const f of [...(spec.from || []), ...(spec.to || [])]) {
    const w = checkWarrant(data, f.warrant);
    if (!w.ok) continue;
    const v = f.read(w.record);
    placeScale = Math.max(placeScale, v.high || v.low || 0);
  }
  if (!placeScale) placeScale = 1;

  function barButton(f, side) {
    const w = checkWarrant(data, f.warrant);
    const scale = placeScale;
    const row = el('button.viz-place', {
      type: 'button',
      dataset: { side, place: f.territoryId },
      onclick: () => {
        ctx.store.dispatch('select', f.territoryId);
        const ids = unitsOf(data, f);
        if (ids.length) bus.emit('ask:paintUnits', { unitIds: ids, reason: 'where this atlas counts them ' + (side === 'from' ? 'taken from' : 'landed') });
        bus.emit('ask:flyTo', { territoryId: f.territoryId });
      },
    });
    const track = el('span.viz-place__track');
    const v = w.ok ? f.read(w.record) : { low: null, high: null };
    if (w.ok && v.low != null) {
      const bar = el('span.viz-place__bar', { dataset: { side } });
      bar.style.inlineSize = Math.min(100, (v.low / scale) * 100).toFixed(2) + '%';
      track.append(bar);
      if (v.high != null && v.high > v.low) {
        const r = el('span.viz-place__range');
        r.style.insetInlineStart = ((v.low / scale) * 100).toFixed(2) + '%';
        r.style.inlineSize = Math.max(0.5, Math.min(100, ((v.high - v.low) / scale) * 100)).toFixed(2) + '%';
        track.append(r);
      }
    }
    row.append(
      el('span.viz-place__lab', { text: f.label }),
      track,
      w.ok && v.low != null
        ? el('span.viz-place__v.num', {
          text: (v.high != null && v.high > v.low)
            ? format.number(v.low) + '–' + format.number(v.high)
            : (f.circa ? 'about ' : '') + format.number(v.low),
        })
        : el('b.viz-defect', { text: '[unsourced]' }));
    if (f.say) row.append(el('span.viz-place__say', { text: f.say }));
    if (!w.ok) row.append(el('span.viz-place__say', { text: w.why }));
    return row;
  }

  paint();

  return {
    node: root,
    commit: doCommit,
    focus() { handle.focus(); },
    isCommitted: () => committed,
    destroy() { bus.emit('ask:paintUnits', { unitIds: [], reason: 'viz:clear' }); },
  };
}

/** Pull "400,000 to 600,000" out of the record's own sentence. */
function readTwoNumbers(text) {
  const m = /([\d][\d,\.]*)\s*(?:to|–|-|and)\s*([\d][\d,\.]*)/.exec(String(text || ''));
  if (!m) return null;
  const n = (s) => Number(String(s).replace(/[,\s]/g, ''));
  const a = n(m[1]), b = n(m[2]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b < a) return null;
  return [a, b];
}
