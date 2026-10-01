/* =============================================================================
   layers/panel.js — THE KEY, AND THE CHOOSER.
   Owner: P06.

   TWO SURFACES, AND WHY THERE ARE TWO.

   1. THE KEY CARD sits on the plate, bottom-left, and exists ONLY while a
      layer of this piece's own is painting. It is the thing a printed atlas
      puts on the plate: the categories actually drawn this year, with their
      counts, plus the byline naming what is being measured. It has to be on
      the plate and not in a drawer, because P17's colour ribbon along the foot
      of the map is the LEGAL-STATUS key and stays the legal-status key; the
      moment the colours mean something else, the reader is owed a key that
      says so, in the same glance. LAYOUT_BUDGET B5 names `.stage__over` as one
      of the three places a panel may stand on the plate, and this is what that
      permission is for. It never appears at `data-stage="plate"`, so second
      zero is untouched.

   2. THE SHEET (`ask:sheet`, the rail, guaranteed 280px and its own scroll)
      carries the reference work: every layer with its definition, its byline
      and its caveat; every category with its count; the fourteen acquisition
      mechanisms behind the nine families they are drawn as; the sources; and
      the layers this atlas cannot honestly draw, with the reason.

   Every class here is a shared chrome class from LAYOUT_BUDGET §5. This file
   invents no box treatment, no second eyebrow and no ninth "there is more"
   affordance.
   ========================================================================== */

import { el } from '../core/util.js';
import { GROUPS, LAYERS, NOT_BUILT, RUN, byId } from './catalog.js';

/* The registry counts itself. No sentence in this file says "twelve". */
const N = LAYERS.length;

const TEXTURE = {
  'never-british': 'plain', 'lost-former': 'hatch-45', 'dominion': 'rule-h',
  'settlement': 'stipple', 'crown-conquered': 'plain', 'company-rule': 'cross',
  'lease': 'rule-v', 'protectorate': 'hatch-135', 'mandate': 'stipple-coarse',
  'occupied': 'hatch-135-dense',
};

/** A swatch is the audited PAIR: the fill and the texture that was proved with
 *  it. Never one without the other (DESIGN §6.4, §6.12).
 *
 *  Where the layer draws a MARK rather than a fill, the swatch draws that same
 *  mark. A key that shows a square beside a map full of rings is not a key; it
 *  is a second thing to learn. `mark` is the glyph name overlay.js draws. */
export function swatch(key, mode, mark) {
  if (mark) {
    const m = el('span.ly-sw.ly-sw--mark', { 'data-mark': mark, 'aria-hidden': 'true' });
    return m;
  }
  if (mode === 'absence' || !key) {
    return el('span.ly-sw.ly-sw--absence', { 'aria-hidden': 'true' });
  }
  if (key === 'informal') {
    return el('span.ly-sw.ly-sw--informal', { 'aria-hidden': 'true' });
  }
  const s = el('span.ly-sw', { 'aria-hidden': 'true' });
  s.style.setProperty('--sw-fill', 'var(--map-' + key + ')');
  s.style.setProperty('--sw-tex', 'var(--tex-' + (TEXTURE[key] || 'plain') + ')');
  s.style.setProperty('--sw-edge', 'var(--map-' + key + '-stroke)');
  return s;
}

/* ------------------------------------------------------------- key card --- */

/**
 * THE KEY SHOWS WHAT IS ON THE PLATE, AND NOTHING ELSE.
 *
 * Round 2 printed every category of the active layer whether or not it was
 * drawn this year, so at 1860 the mechanism key was nine rows wide, ran off the
 * right edge of an 888px card at 900×700 with "settled on land…" cut mid-word,
 * and put a horizontal scrollbar nobody finds between a reader and four of the
 * nine colours. A key row for a colour that is not on the map is not a key; it
 * is a table of contents for a table.
 *
 * So: a row is drawn when its count is not zero. The rows that fall out are not
 * deleted and are not hidden — they are counted in one line under the list, and
 * every one of them, with its zero, is in the sheet. The authored order is kept
 * rather than sorted by size, because on three layers the order IS the argument
 * (slavery runs in time; exit runs pale-to-deep as a ladder of violence).
 */
function liveRows(rows) {
  const live = rows.filter((r) => r.count == null || r.count > 0);
  return { live, hidden: rows.length - live.length };
}

export function buildKeyCard(state) {
  const { layer, year, format, counts, onOpen, note } = state;
  const { live: rows, hidden } = liveRows(state.rows || []);
  const card = el('div.ly-key.cx-panel.cx-panel--tight', {
    role: 'group',
    /* The sentence is NOT printed here. The lede band is already saying it at
       19px, in the shell's one voice, and printing it twice on one screen is
       the "four panels saying the same thing four ways" this app was rebuilt
       to end. It stays as this group's accessible name, so a screen-reader
       meets the meaning before the swatches exactly as a sighted reader does. */
    /* A screen reader meets the meaning AND its provenance before the
       swatches, exactly as a sighted reader meets the sentence in the band and
       the byline one control away. */
    'aria-label': layer.label + ' — ' + layer.sentence + '. ' + (layer.bylineShort || layer.byline),
    title: layer.sentence,
  });
  card.appendChild(el('p.cx-panel__head', { text: layer.label }));

  const list = el('ul.ly-key__list');
  for (const r of rows) {
    const li = el('li.ly-key__row', { title: r.gloss || '' });
    li.appendChild(swatch(r.key, r.mode, r.mark));
    li.appendChild(el('span.ly-key__word', { text: r.word }));
    li.appendChild(el('span.num.ly-key__n', { text: r.count == null ? '' : format.number(r.count) }));
    list.appendChild(li);
  }
  if (!rows.length) {
    list.appendChild(el('li.ly-key__row.ly-key__row--none', {},
      el('span.cx-note', { text: `nothing to draw at ${format.year(year)} — a real result, not a loading state` })));
  }
  /* The rows scroll; the note and the way out do not. A key whose only route
     to its sources is below the fold of its own scrollbox has no route. */
  const scroller = el('div.ly-key__scroll');
  scroller.appendChild(list);
  card.appendChild(scroller);
  /* ONE NOTE, NOT THREE. Everything the card has to add to its own rows goes
     in a single line, because a key with four footnotes is a paragraph.
     The second clause matters more than its length suggests: P17's colour
     strip along the foot of the plate keys the LEGAL STATUS and does not
     change when this piece repaints. A reader with two keys on screen has to
     be told which one is live — "what is this colour measuring" is the first
     of the three questions this atlas teaches you to ask of any map. */
  const bits = [];
  if (note) bits.push(note);
  if (hidden) {
    bits.push(`${format.number(hidden)} more ${hidden === 1 ? 'category is' : 'categories are'} `
      + `not on the plate at ${format.year(year)}; ${hidden === 1 ? 'it is' : 'they are'} in the full key with a zero.`);
  }
  if (counts && counts.absent) {
    bits.push(`${format.number(counts.absent)} drawn as bare ground: the record answers nothing this layer asks.`);
  }
  /* EVERY LAYER OF OURS, NOT ONLY THE ONES THAT REPAINT THE FILL. Measured at
     1440x900 on the pressure plate: P17's strip printed "colour = pressure
     without a claim" above seven LEGAL-STATUS swatches, because the strip takes
     its sentence from the active layer and its swatches from the year. A reader
     with two keys on screen has to be told which one is live, and that is as
     true of a layer that adds marks as of one that replaces the fill. */
  /* ONLY WHERE THE TWO KEYS DISAGREE. P17's strip takes its sentence from the
     active layer and its swatches from the year, so on the pressure plate it
     read "colour = pressure without a claim" above seven LEGAL-STATUS swatches
     and on the stitching plate "colour = role in the network" above the same
     seven. Both need this line. The revolt plate does not: its own sentence
     already says "colour = the legal status; the pins are recorded revolt and
     killing", so the strip below is telling the truth and a note contradicting
     it would be the third key on one screen. The test is the layer's own
     sentence, not a list, so a layer added later is covered by writing an
     honest sentence for it. */
  if (layer.id !== 'status' && !/legal status/i.test(layer.sentence)) {
    bits.push('The strip below the map still keys legal status, not this plate.');
  }
  if (bits.length) card.appendChild(el('p.cx-note.ly-key__note', { text: bits.join(' ') }));
  const more = el('button.cx-more.ly-key__more', {
    type: 'button', 'aria-haspopup': 'dialog',
    /* The one-line answer is on the control that opens the full one, so the
       question "measured from what?" is answered on hover and on focus without
       spending a line of a plate that has none to spare. */
    title: layer.bylineShort || layer.byline,
    text: 'What this measures, and its sources',
  });
  more.addEventListener('click', onOpen);
  card.appendChild(more);
  return card;
}

/* ---------------------------------------------------------- the caption --- */

/** The permanent caption. On the informal layer it is required by FEATURE_SPEC
 *  §1 charge 5 to be permanent, to say that this is an argument and not a
 *  measurement, and to name both Gallagher and Robinson and the objection. */
export function buildCaption(layer, onOpen) {
  const box = el('div.ly-caption.cx-note.cx-note--warn', { role: 'note', title: layer.caption });
  if (layer.id === 'informal') {
    box.appendChild(el('strong.ly-caption__lead', { text: 'This layer is an argument, not a measurement.' }));
    /* Both halves of the argument, named, in the two lines a plate can carry.
       The whole of it — the sentence Gallagher and Robinson actually made, and
       Platt's objection in full — is one control away and is also this box's
       title, so it is never more than a hover or a click from the reader. */
    /* NINETY CHARACTERS, BECAUSE THE BOX IS FOUR LINES AND THE PLATE IT STANDS
       ON CAN BE 202 PIXELS WIDE. Measured at 900x700 with the rail open, the
       longer version clamped to "The objection:…" — a colon with nothing after
       it, which is worse than either half of the argument on its own. Both
       required names survive here, and Platt, the treaty ports and the whole
       of Gallagher and Robinson's claim are on this box's own title attribute
       and one control away in the sheet. */
    box.appendChild(el('span.ly-caption__body', {
      text: ' Gallagher and Robinson (1953). The objection: stretched far enough, it cannot be falsified.',
    }));
  } else {
    box.appendChild(el('strong.ly-caption__lead', { text: 'What this drawing cannot tell you.' }));
    box.appendChild(el('span.ly-caption__body', { text: ' ' + layer.caption }));
  }
  box.appendChild(document.createTextNode(' '));
  const more = el('button.cx-more.ly-caption__more', { type: 'button', text: 'The whole argument' });
  if (onOpen) more.addEventListener('click', onOpen);
  box.appendChild(more);
  return box;
}

/* ---------------------------------------------------------------- the run - */

/**
 * FIVE WAYS TO BE WRONG ABOUT THIS MAP — the sheet's default face.
 *
 * The chooser is still one control away at every step and is what the run hands
 * back at the end. What changed is which of the two a reader meets first: a
 * numbered route with a question in it, instead of thirteen buttons in four
 * groups. See the RUN comment in catalog.js for the measurement that motivated
 * this.
 *
 * `state`:
 *   i           0-based step index
 *   answered    the committed choice for this step's layer, or null
 *   onCommit(choiceId)  · onStep(i) · onLeave() · onCta(step)
 */
export function buildRun(state) {
  const { i, answered, onCommit, onStep, onLeave, onCta } = state;
  const step = RUN.steps[i];
  const l = byId.get(step.layer);
  const wrap = el('div.ly-run');

  /* The shell's sheet header is already printing RUN.title above this node.
     The eyebrow says where the reader is and what is on the plate, not the
     title again — one thought, one place (LAYOUT_BUDGET §5). */
  const head = el('p.cx-panel__head.ly-run__head');
  head.append(
    el('span', { text: 'Step ' + (i + 1) + ' of ' + RUN.steps.length }),
    el('span.ly-run__count', { text: l.short || l.label }),
  );
  wrap.append(head);
  if (i === 0 && !answered) wrap.append(el('p.cx-note.ly-run__lead', { text: RUN.lead }));
  wrap.append(el('p.cx-panel__title.ly-run__title', { text: step.head }));

  if (!answered && l.predict) {
    const ask = el('div.cx-ask.ly-predict');
    ask.append(el('p.cx-ask__eyebrow', { text: 'Commit first' }));
    ask.append(el('p.cx-ask__q', { text: l.predict.q }));
    const ch = el('div.cx-ask__choices');
    for (const c of l.predict.choices) {
      const b = el('button.ly-predict__b', { type: 'button', text: c.label });
      b.addEventListener('click', () => onCommit(c.id, c.label));
      ch.append(b);
    }
    ask.append(ch);
    ask.append(el('p.cx-note', {
      text: 'There is no penalty for being wrong, and being wrong is the point: a guess you have committed to is the thing evidence can correct.',
    }));
    wrap.append(ask);
  } else {
    if (answered) {
      const box = el('div.cx-ask.ly-run__answer');
      box.append(el('p.cx-ask__eyebrow', { text: 'You said' }));
      box.append(el('p.cx-ask__q', { text: answered.label }));
      if (l.predict) box.append(el('p.cx-note', { text: l.predict.after }));
      wrap.append(box);
    }
    wrap.append(el('p.ly-run__now', { text: l.sentence }));
    wrap.append(el('p.cx-note.ly-run__then', { text: step.then }));
    if (step.cta && onCta) {
      const b = el('button.cx-more.ly-run__cta', { type: 'button', text: step.cta.label });
      b.addEventListener('click', () => onCta(step));
      wrap.append(b);
    }
    wrap.append(el('p.ly-sheet__byline', { text: l.byline }));
    wrap.append(el('p.cx-note.cx-note--warn.ly-sheet__cap', { text: l.caption }));
  }

  const nav = el('div.ly-run__nav');
  const back = el('button.ly-run__b', { type: 'button', disabled: i === 0 },
    el('span', { text: '← ' }), el('span', { text: 'Back' }));
  back.addEventListener('click', () => onStep(i - 1));
  const last = i === RUN.steps.length - 1;
  const next = el('button.ly-run__b.ly-run__b--next', { type: 'button' },
    el('span', { text: last ? `The other ${N - RUN.steps.length} readings` : 'Next: ' + RUN.steps[i + 1].head }),
    el('span', { text: ' →' }));
  next.addEventListener('click', () => (last ? onLeave('close') : onStep(i + 1)));
  nav.append(back, next);
  wrap.append(nav);

  const out = el('button.cx-more.ly-run__out', { type: 'button', text: `Skip this — show me all ${N} readings` });
  out.addEventListener('click', () => onLeave('skip'));
  wrap.append(out);
  return wrap;
}

/* -------------------------------------------------------------- the sheet - */

function srcRow(s) {
  const row = el('div.cx-src');
  row.appendChild(el('span.cx-src__kind.sc', { text: s.kind || 'source' }));
  const cite = el('cite.cx-src__cite');
  cite.appendChild(el('span', { text: s.author + ', ' }));
  cite.appendChild(el('em', { text: s.work }));
  cite.appendChild(el('span.num', { text: ' ' + s.year }));
  if (s.publisher) cite.appendChild(el('span', { text: ' (' + s.publisher + ')' }));
  row.appendChild(cite);
  if (s.supports) row.appendChild(el('p.cx-note', { text: s.supports }));
  return row;
}

export function buildSheet(ctx) {
  const {
    activeId, rows, counts, format, year, onPick, onIsolate,
    mechanismMembers, sources, extras, isolated, locks, predictAnswer, predictAfter,
  } = ctx;
  const wrap = el('div.ly-sheet');

  /* The way back onto the route. A reader who skipped it, or who finished it
     and wandered, gets one control in the one place they already look. */
  if (ctx.onRun) {
    const start = el('button.cx-more.ly-sheet__run', {
      type: 'button',
      text: (ctx.runDone ? 'Run it again: ' : '') + RUN.title + ' →',
    });
    start.addEventListener('click', () => ctx.onRun());
    wrap.appendChild(start);
  }

  wrap.appendChild(el('p.cx-note.ly-sheet__lead', {
    text: ctx.runDone
      ? `The other ${N - RUN.steps.length} readings of the same territories and the same year. `
        + 'Every one names what it measures and where the figure comes from. '
        + 'A layer that cannot say both is not in this list.'
      : 'The same territories, the same year, drawn a different way each time. '
        + 'Every reading below names what it measures and where the figure comes from. '
        + 'A layer that cannot say both is not in this list.',
  }));

  for (const g of GROUPS) {
    const sec = el('section.cx-panel.ly-sheet__group');
    sec.appendChild(el('p.cx-panel__head', { text: g.label }));
    sec.appendChild(el('p.cx-note', { text: g.note }));
    const ul = el('ul.ly-sheet__layers');
    for (const l of LAYERS.filter((x) => x.group === g.id)) {
      const on = l.id === activeId;
      const li = el('li.ly-sheet__layer', { 'data-on': on ? 'yes' : 'no' });
      const b = el('button.ly-sheet__pick', {
        type: 'button', 'aria-pressed': on ? 'true' : 'false',
      });
      const lock = ctx.locks && ctx.locks.get(l.id);
      b.appendChild(el('span.ly-sheet__name', { text: l.label }));
      b.appendChild(el('span.ly-sheet__sent', { text: l.sentence }));
      b.addEventListener('click', () => onPick(l.id));
      li.appendChild(b);
      /* Present, disabled, and saying why — never silently absent. */
      if (lock) {
        b.disabled = true;
        b.setAttribute('aria-disabled', 'true');
        li.appendChild(el('p.cx-note.cx-note--warn.ly-sheet__lock', { text: lock }));
      }
      if (on) {
        if (predictAnswer && predictAfter) {
          const box = el('div.cx-ask.ly-sheet__answer');
          box.appendChild(el('p.cx-ask__eyebrow', { text: 'You said' }));
          box.appendChild(el('p.cx-ask__q', { text: predictAnswer.label }));
          box.appendChild(el('p.cx-note', { text: predictAfter }));
          li.appendChild(box);
        }
        li.appendChild(el('p.ly-sheet__byline', { text: l.byline }));
        li.appendChild(el('p.cx-note.cx-note--warn.ly-sheet__cap', { text: l.caption }));
        if (rows && rows.length) {
          const key = el('ul.ly-sheet__key');
          for (const r of rows) {
            const kli = el('li.ly-sheet__krow');
            const btn = el('button.ly-sheet__kbtn', {
              type: 'button',
              'aria-pressed': isolated === r.id ? 'true' : 'false',
              title: r.count ? 'Show only these places on the map' : 'Nothing to show at this year',
            });
            btn.appendChild(swatch(r.key, r.mode, r.mark));
            btn.appendChild(el('span.ly-sheet__kword', { text: r.word }));
            btn.appendChild(el('span.num.ly-sheet__kn', { text: r.count == null ? '—' : format.number(r.count) }));
            if (r.count) btn.addEventListener('click', () => onIsolate(r.id));
            else btn.disabled = true;
            kli.appendChild(btn);
            if (r.gloss) kli.appendChild(el('p.cx-note', { text: r.gloss }));
            if (r.members && r.members.length > 1) {
              kli.appendChild(el('p.cx-note.ly-sheet__members', {
                text: 'In this atlas: ' + r.members.map((m) => m.id + ' (' + format.number(m.n) + ')').join(', ') + '.',
              }));
            }
            /* Two lines the records write for themselves, recomputed at every
               year: the split inside a family that was carrying two different
               events under one word, and the parties actually on the plate in
               a counterparty category. Neither is a list kept by hand, and
               neither survives a retagged shard unchanged. */
            if (r.note) kli.appendChild(el('p.cx-note.ly-sheet__members', { text: r.note }));
            if (r.names && r.names.length) {
              kli.appendChild(el('p.cx-note.ly-sheet__members', {
                text: 'On the plate at this year: ' + r.names.join('; ')
                  + (r.count > r.names.length ? `, and ${format.number(r.count - r.names.length)} more.` : '.'),
              }));
            }
            key.appendChild(kli);
          }
          li.appendChild(key);
        }
        if (l.id === 'mechanism' && mechanismMembers) {
          li.appendChild(el('p.cx-note', {
            text: `All fourteen acquisition mechanisms are counted above, inside the nine families the audited palette can tell apart. `
              + `Ten fills are proved separable under normal vision and three kinds of colour blindness (docs/DESIGN.md §2); a fourteen-colour plate is not, so the fold is printed rather than hidden.`,
          }));
        }
        if (counts) {
          li.appendChild(el('p.cx-note', {
            text: `At ${format.year(year)}: ${format.number(counts.painted)} places painted, `
              + `${format.number(counts.absent)} drawn as bare ground because the record is silent, `
              + `${format.number(counts.quiet)} left quiet because this layer has nothing to say about them.`,
          }));
        }
      }
      ul.appendChild(li);
    }
    sec.appendChild(ul);
    wrap.appendChild(sec);
  }

  if (extras && extras.length) {
    for (const x of extras) {
      const sec = el('section.cx-panel.ly-sheet__group');
      sec.appendChild(el('p.cx-panel__head', { text: x.head }));
      for (const p of x.paras) sec.appendChild(el('p.cx-note', { text: p }));
      if (x.figures) {
        const fl = el('div.ly-sheet__figs');
        for (const f of x.figures) {
          const fig = el('div.cx-fig.cx-fig--sm');
          fig.appendChild(el('span.cx-fig__v.num', { text: f.v }));
          fig.appendChild(el('span.cx-fig__l', { text: f.l }));
          fl.appendChild(fig);
        }
        sec.appendChild(fl);
      }
      wrap.appendChild(sec);
    }
  }

  if (sources && sources.length) {
    const sec = el('section.cx-panel.ly-sheet__group');
    sec.appendChild(el('p.cx-panel__head', { text: 'Where these figures come from' }));
    for (const s of sources) sec.appendChild(srcRow(s));
    wrap.appendChild(sec);
  }

  const nb = el('section.cx-panel.ly-sheet__group');
  nb.appendChild(el('p.cx-panel__head', { text: 'What this atlas cannot draw, and why' }));
  for (const n of NOT_BUILT) {
    nb.appendChild(el('p.cx-panel__title', { text: n.label }));
    nb.appendChild(el('p.cx-note', { text: n.why }));
  }
  wrap.appendChild(nb);

  return wrap;
}

export default { buildKeyCard, buildCaption, buildSheet, buildRun, swatch };
