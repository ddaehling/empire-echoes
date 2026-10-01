/* timeline/rate-rail.js — the second rail: how much, and how fast.

   Built once per definition and per layout width, then only a marker moves, so
   scrubbing costs one transform. The bars are the change model's own per-year
   `inUnits` and `outUnits`; nothing here is smoothed, interpolated or rounded
   into a curve.

   Three things are focusable, because they are the three things a student is
   meant to take away and a keyboard must reach them: the tallest gain, the
   deepest loss, and the window in which half of everything was lost. Each is a
   button that takes the map to its year. The rail itself is one more press
   target: a press anywhere on it goes to that year.

   The bars themselves are not 400 tab stops. They are drawn in an aria-hidden
   svg and every figure in them is also printed as text, in the caption and in
   the readout, exactly as the event ticks on the axis above are. */

import { el, fill } from '../core/util.js';
import { profileSentence, profileSentenceShort } from './profile.js';

/* Under this width the long sentence runs to eight lines and eats the map, so
   the rail prints the short one — a complete sentence, not a truncated one.
   COHERENCE PASS: height counts for the same reason width does. On a 1366x768
   school laptop the long form ran four full-width lines (about 96px) directly
   under a map that had been squeezed to 230px tall, and on a 1440x900 window
   it ran three. Both windows now print the short sentence, which says the same
   two findings and the same reading rule in one line. Nothing is truncated and
   nothing is hidden: the long form is still the rail's `aria-label`. */
/* The rail lives in the 410px sheet now, never under the axis, so the caption
   is always the short form: two findings and the reading rule in one line,
   complete, never truncated. The long form is still the rail's aria-label. */
const NARROW = { matches: true };

const SVGNS = 'http://www.w3.org/2000/svg';
/* The rail is a sheet surface now, not a 42px strip under the axis, so it gets
   the height a chart of four hundred years needs: the two extremes, the two
   measured windows and their labels each have somewhere to stand. */
const H_UP = 30;          // px of gain, above the line
const H_DN = 30;          // px of loss, below it
const H = H_UP + H_DN + 1;

/* BAR HEIGHT IS THE SQUARE ROOT OF THE COUNT, and the caption says so in
   words. On a linear scale the deepest bar is 45 units and the commonest is
   one, so 1765's seven gains and the whole seventeenth century are a hairline
   and the rail teaches only that 1947 was big — which is the thing everybody
   already knows. The same reasoning the Ratio Line uses for its log axis
   (FEATURE_SPEC charge 10): a scale that hides the small values is not more
   honest than one that names itself. */
const scaleH = (v, max, px) => (max <= 0 ? 0 : Math.max(2, (Math.sqrt(v) / Math.sqrt(max)) * px));

function svg(name, attrs) {
  const n = document.createElementNS(SVGNS, name);
  if (attrs) for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  return n;
}

export function createRateRail({ onYear, onGuess }) {
  const gBars = svg('g', { class: 'tl-rate__bars' });
  const gRule = svg('g', { class: 'tl-rate__rule' });
  const sheet = svg('svg', { class: 'tl-rate__svg', height: H, 'aria-hidden': 'true', focusable: 'false' });
  sheet.append(gRule, gBars);

  const marker = el('span.tl-rate__marker', { 'aria-hidden': 'true' });
  const ghost = el('span.tl-rate__ghost', { 'aria-hidden': 'true', hidden: true });
  const labels = el('div.tl-rate__labels');
  /* Not a control in the accessibility tree: the bars are a picture of numbers
     that are all printed as text under it, the two extremes and the two windows
     inside it are real buttons, and the year itself is set from the slider on
     the axis above. It is a convenience press target for a pointer, nothing
     more, which is exactly what the event ticks on that axis are. */
  const plot = el('div.tl-rate__plot', {
    'aria-hidden': 'true',
    title: 'The rate of change, year by year. Above the line: units this reading of “British” gained that year. Below it: units lost. Press anywhere to take the map to that year.',
  }, sheet, marker, ghost, labels);

  const readout = el('p.tl-rate__readout', { 'aria-live': 'off' });
  const caption = el('p.tl-rate__caption');
  /* `.cx-more` — the app's one "there is more here" mark. This used to be a
     bordered pill, which was one of the eight different affordances for the
     same job. */
  const askBtn = el('button.cx-more.tl-rate__ask', { type: 'button', hidden: true });

  const head = el('div.tl-rate__head',
    el('span.tl-rate__eyebrow', { text: 'how fast, and how much' }),
    readout);

  const root = el('div.tl-rate', { role: 'group', 'aria-label': 'The rate of change: units gained and lost each year' },
    head, plot, caption, askBtn);

  let profile = null, scale = null, defLabel = '', width = 0;

  plot.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('.tl-rate__lbl')) return;
    const r = plot.getBoundingClientRect();
    onYear(scale.year(ev.clientX - r.left));
  });

  function labelButton(cls, glyph, n, year, speech) {
    const b = el('button.tl-rate__lbl', {
      type: 'button', 'data-dir': cls, 'aria-label': speech,
      title: speech,
    },
      el('span.tl-rate__lbl-n.num', { text: glyph + n }),
      el('span.tl-rate__lbl-y.num', { text: String(year) }));
    b.addEventListener('click', (ev) => { ev.stopPropagation(); onYear(year); });
    return b;
  }

  function draw(p, sc, label) {
    profile = p; scale = sc; defLabel = label;
    width = Math.round(sc.usable + sc.x0 + 10);
    sheet.setAttribute('width', width);
    sheet.setAttribute('viewBox', `0 0 ${width} ${H}`);

    const base = H_UP + 0.5;
    fill(gRule, svg('line', { x1: sc.x0, y1: base, x2: width - 10, y2: base, class: 'tl-rate__base' }));

    const kids = [];
    const maxUp = Math.max(1, p.maxGain);
    const maxDn = Math.max(1, p.maxLoss);
    /* One bar is at least a hairline wide, and never wider than a year: at
       1440px a year is about three pixels, which is what makes the 1890s and
       1960–68 read as shapes rather than as spikes. */
    const bw = Math.max(1, Math.min(4, Math.floor(sc.pxPerYear)));
    for (const r of p.rows) {
      const x = Math.round(sc.x(r.year)) - (bw > 1 ? Math.floor(bw / 2) : 0);
      if (r.gain) {
        const h = scaleH(r.gain, maxUp, H_UP);
        kids.push(svg('rect', { x, y: base - h, width: bw, height: h, class: 'tl-rate__bar tl-rate__bar--in' }));
      }
      if (r.loss) {
        const h = scaleH(r.loss, maxDn, H_DN);
        kids.push(svg('rect', { x, y: base, width: bw, height: h, class: 'tl-rate__bar tl-rate__bar--out' }));
      }
    }
    fill(gBars, ...kids);

    /* The two extremes, labelled where they stand. */
    const lk = [];
    const g0 = p.topGain[0], l0 = p.topLoss[0];
    if (g0) {
      const b = labelButton('in', '+', g0.gain, g0.year,
        `The biggest single-year gain on this reading of “British”: ${g0.gain} units in ${g0.year}. Takes the map there.`);
      b.style.left = Math.round(sc.x(g0.year)) + 'px';
      b.dataset.side = sc.x(g0.year) > width * 0.72 ? 'left' : 'right';
      lk.push(b);
    }
    if (l0) {
      const b = labelButton('out', '−', l0.loss, l0.year,
        `The biggest single-year loss on this reading of “British”: ${l0.loss} units in ${l0.year}. Takes the map there.`);
      b.style.left = Math.round(sc.x(l0.year)) + 'px';
      b.dataset.side = sc.x(l0.year) > width * 0.72 ? 'left' : 'right';
      lk.push(b);
    }
    /* The two measured windows, drawn as regions rather than brackets: half of
       everything gained, and half of everything lost. The shape of the second
       against the first is the whole argument of this rail. */
    const band = (w, dir, what) => {
      const x1 = sc.x(w.from), x2 = sc.x(w.to);
      const b = el('button.tl-rate__band', {
        type: 'button', 'data-dir': dir,
        style: `left:${Math.round(x1)}px;width:${Math.max(6, Math.round(x2 - x1))}px`,
        'aria-label': `${what} — ${w.n} of ${dir === 'in' ? p.gained : p.lost} units — ${dir === 'in' ? 'came' : 'went'} inside these ${w.span} years, ${w.from} to ${w.to}. Takes the map to ${w.from}.`,
        title: `${w.span} years: ${w.from}–${w.to}. ${what}.`,
      }, el('span.tl-rate__band-n.num', { text: w.span + ' yr' }));
      b.addEventListener('click', (ev) => { ev.stopPropagation(); onYear(w.from); });
      return b;
    };
    if (p.builtIn) lk.push(band(p.builtIn, 'in', `Half of everything this map ever gained on the reading “${label}”`));
    if (p.shedIn) lk.push(band(p.shedIn, 'out', `Half of everything this map ever lost on the reading “${label}”`));

    fill(labels, ...lk);

    const sentence = profileSentence(p, label) +
      ` Bar height is the square root of the count, so a year of one change is still visible beside ${p.maxLoss} in ${p.topLoss[0] ? p.topLoss[0].year : ''}; the two figures on the rail are the tallest and the deepest.`;
    caption.textContent = NARROW.matches ? profileSentenceShort(p, label) : sentence;
    root.setAttribute('aria-label', 'The rate of change: units gained and lost each year. ' + sentence);
  }

  /* Cheap per-year work: move one line, rewrite one string. */
  function setYear(year) {
    if (!scale) return;
    marker.style.transform = `translateX(${scale.x(year)}px)`;
    if (!profile) return;
    const r = profile.at(year);
    const d = profile.decadeAt(year);
    if (r) {
      readout.textContent = `${year}: ${r.gain ? '+' + r.gain : ''}${r.gain && r.loss ? ' and ' : ''}${r.loss ? '−' + r.loss : ''} ${r.gain + r.loss === 1 ? 'unit' : 'units'}` +
        (d ? ` · ${d.decade}s: +${d.gain} / −${d.loss}` : '');
    } else {
      readout.textContent = d && (d.gain || d.loss)
        ? `${year}: nothing gained or lost · ${d.decade}s: +${d.gain} / −${d.loss}`
        : `${year}: nothing gained or lost, and nothing in the whole ${Math.floor(year / 10) * 10}s`;
    }
  }

  /* The student's own guess, drawn on the rail as a second marker so the reveal
     happens where the evidence is. */
  function setGuess(year, label) {
    if (year == null || !scale) { ghost.hidden = true; return; }
    ghost.hidden = false;
    ghost.style.transform = `translateX(${scale.x(year)}px)`;
    ghost.dataset.label = label || String(year);
  }

  function setAsk(text, speech, on) {
    askBtn.hidden = !text;
    if (!text) return;
    askBtn.textContent = text;
    askBtn.setAttribute('aria-label', speech || text);
    askBtn.onclick = on;
  }

  return { root, plot, draw, setYear, setGuess, setAsk, get profile() { return profile; } };
}

export default { createRateRail };
