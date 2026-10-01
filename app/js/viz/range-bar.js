/**
 * viz/range-bar.js — THE OPEN RANGE BAR. FEATURE_SPEC P08's sixth component,
 * and charge 7(c): "a lower tick, an upper end that fades with no terminal,
 * and the words *no one counted* — set on the same axis as Amritsar's counted
 * 379, so the two shapes teach the epistemology."
 *
 * WHY IT EXISTS. DIDACTIC_SPEC §9.2 registers ten figures as contested, M18
 * says any number with a real range must render as a range, and §4 M18's rule
 * is blunt: "A false-precision number in this app is a bug, not a rounding
 * choice." The Kenya ratio line was printing the colonial government's own
 * count — 11,503 killed — beside a million people villagised, and printing
 * nothing at all for the figure that is actually disputed. An official count
 * rendered alone, with no band beside it, teaches a student that the official
 * count is the number.
 *
 * WHAT IT DRAWS, AND WHY EVERY EDGE IS A FIGURE IN THE RECORD:
 *   · a solid band from the record's low to the record's high;
 *   · a tick beyond it at the highest NAMED scholarly estimate, read out of
 *     the record's own note by a regular expression, never typed here;
 *   · between the two, a wash that fades out and has no end cap, because the
 *     record's own words are that the highest estimates are argued for and not
 *     established. A terminal line there would be a claim we cannot make.
 *   · the record's sentence underneath, verbatim, with the marked words lit.
 *
 * It takes the axis it is drawn on from its caller, so the band sits on the
 * SAME scale as the counted figures above it. That is the whole point: a
 * counted quantity and an uncounted one, one axis, two shapes.
 */

import { el } from '../core/util.js';
import { checkWarrant, warrantLine } from './figures.js';

/**
 * The largest number written in a sentence, in units of people.
 *
 * Bare integers between 1500 and 2100 are skipped: every note in this dataset
 * carries dates, and a note that ends "concealed until 2011" must not put a
 * tick on the axis at two thousand and eleven people. A figure written with a
 * thousands separator or the word million is kept whatever its size.
 */
function largestNamed(text) {
  const out = [];
  const re = /(\d[\d,.]*)(\s*million)?/gi;
  let m;
  while ((m = re.exec(String(text || '')))) {
    const raw = m[1];
    const n = Number(raw.replace(/,/g, ''));
    if (!Number.isFinite(n)) continue;
    const looksLikeAYear = !m[2] && !/[,.]/.test(raw) && n >= 1500 && n <= 2100;
    if (looksLikeAYear) continue;
    out.push(m[2] ? n * 1e6 : n);
  }
  return out.length ? Math.max(...out) : null;
}

/**
 * @param {object} ctx      the module context (data, format)
 * @param {object} spec     { label, warrant, read(record) -> {low, high, note},
 *                            said, openSaid }
 * @param {object} axis     { toPos(value) -> 0..1, lo, hi }
 */
export function buildRangeBar(ctx, spec, axis) {
  const { data, format } = ctx;
  const w = checkWarrant(data, spec.warrant);
  if (!w.ok) {
    return el('div.viz-range.viz-range--bad',
      el('b.viz-defect', { text: '[unsourced]' }), ' ',
      el('span', { text: w.why }));
  }
  let read = null;
  try { read = spec.read(w.record); } catch (_) { read = null; }
  const lo = read && Number(read.low);
  const hi = read && Number(read.high);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return el('div.viz-range.viz-range--bad',
      el('b.viz-defect', { text: '[unsourced]' }), ' ',
      el('span', { text: 'the record for this figure holds no range' }));
  }
  const note = (read && read.note) || '';
  /* The highest number anyone in the note is willing to put their name to. It
     is read out of the sentence, so correcting the shard moves the tick. */
  const named = largestNamed(note);
  const openTo = named && named > hi ? named : null;

  const track = el('div.viz-range__track');
  const a = axis.toPos(lo) * 100;
  const b = axis.toPos(hi) * 100;
  const band = el('span.viz-range__band');
  band.style.insetInlineStart = a.toFixed(2) + '%';
  band.style.inlineSize = Math.max(0.6, b - a).toFixed(2) + '%';
  track.append(band);

  if (openTo) {
    const c = axis.toPos(openTo) * 100;
    const open = el('span.viz-range__open');
    open.style.insetInlineStart = b.toFixed(2) + '%';
    /* It runs PAST the named estimate and fades out there. Stopping the wash
       at the tick would put an end on the open end, which is the one thing
       this shape exists to refuse. */
    open.style.inlineSize = Math.min(100 - b, Math.max(1, c - b) + 9).toFixed(2) + '%';
    track.append(open);
    const tick = el('span.viz-range__tick');
    tick.style.insetInlineStart = c.toFixed(2) + '%';
    track.append(tick);
    const tlab = el('span.viz-range__ticklab.num', { text: format.number(openTo) });
    tlab.style.insetInlineStart = c.toFixed(2) + '%';
    track.append(tlab);
  }

  /* The same two ends as the axis above it, printed again, because a band
     floating under a list of bars is only "the same axis" if it says so. */
  const ends = (axis.sayLo && axis.sayHi)
    ? el('div.viz-range__ends',
      el('span.viz-hundred__end.num', { text: axis.sayLo }),
      el('span.viz-hundred__end.num', { text: axis.sayHi }))
    : null;

  const head = el('p.viz-range__head',
    el('span.viz-range__lab', { text: spec.label }),
    el('span.viz-range__v.num', { text: format.number(lo) + '–' + format.number(hi) }));

  const legend = el('p.cx-note.viz-range__say', { text: spec.said });
  const open = el('p.viz-range__open-say',
    el('span.viz-range__nocount', { text: 'no one counted' }),
    el('span', {
      text: openTo
        ? ' — the wash runs from the record’s upper figure to ' + format.number(openTo)
          + ', the highest estimate anyone in this record puts a name to, and then stops without an end, because the record does not give it one.'
        : ' — the record gives a range and no upper bound anyone has established.',
    }));

  return el('div.viz-range', { dataset: { range: spec.id || '' } },
    head, track, ends, legend, open, warrantLine(data, spec));
}
