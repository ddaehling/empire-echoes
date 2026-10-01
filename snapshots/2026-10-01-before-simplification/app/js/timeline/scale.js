/* timeline/scale.js — the axis scale.

   The dataset runs 1200–2027, but 1200–1600 holds a handful of units and the
   spec's axis is 1600–2027. Rather than truncate the data or waste half the
   axis on four empty centuries, the axis is drawn the way a printed atlas draws
   an over-long scale: a short compressed head, a visible break, then the real
   run at true scale. The break is labelled. Nothing is hidden; Home still
   reaches the first year in the data. */

export const BREAK_YEAR = 1600;
const HEAD_FRAC = 0.05;   // share of the usable width given to the pre-1600 head
const GAP = 11;           // px of the break glyph

export function makeScale(min, max, width, padL, padR) {
  const x0 = padL;
  const usable = Math.max(40, width - padL - padR);
  const hasHead = min < BREAK_YEAR;
  const headW = hasHead ? Math.round(usable * HEAD_FRAC) : 0;
  const gap = hasHead ? GAP : 0;
  const mainW = usable - headW - gap;
  const mainMin = hasHead ? BREAK_YEAR : min;
  const mainSpan = Math.max(1, max - mainMin);
  const headSpan = Math.max(1, BREAK_YEAR - min);

  function x(year) {
    const y = year < min ? min : year > max ? max : year;
    if (hasHead && y < BREAK_YEAR) return x0 + ((y - min) / headSpan) * headW;
    return x0 + headW + gap + ((y - mainMin) / mainSpan) * mainW;
  }
  function year(px) {
    if (hasHead && px < x0 + headW) {
      return Math.round(min + ((px - x0) / Math.max(1, headW)) * headSpan);
    }
    const t = (px - x0 - headW - gap) / Math.max(1, mainW);
    return Math.round(mainMin + Math.max(0, Math.min(1, t)) * mainSpan);
  }
  return {
    min, max, x, year, hasHead, headW, gap, mainW, mainMin, x0, usable,
    breakX: hasHead ? x0 + headW + gap / 2 : null,
    pxPerYear: mainW / mainSpan,
  };
}

/* Decade / half-century ruling on the main run only. Labels are chosen so they
   never collide: the step widens as the axis narrows. */
export function ticksFor(scale) {
  const out = [];
  const labelEvery = pickStep(scale.pxPerYear);
  const minorEvery = labelEvery >= 100 ? 25 : labelEvery >= 50 ? 10 : 10;
  const from = Math.ceil(scale.mainMin / minorEvery) * minorEvery;
  for (let y = from; y <= scale.max; y += minorEvery) {
    out.push({ year: y, label: y % labelEvery === 0 ? String(y) : null });
  }
  if (out.length && out[out.length - 1].year !== scale.max) {
    out.push({ year: scale.max, label: null });
  }
  return out;
}

function pickStep(pxPerYear) {
  if (pxPerYear >= 3.4) return 25;
  if (pxPerYear >= 1.7) return 50;
  if (pxPerYear >= 0.85) return 100;
  return 200;
}
