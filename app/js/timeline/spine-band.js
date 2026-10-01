/* timeline/spine-band.js — the four overlapping empires, permanently under the map.

   T1 in DIDACTIC_SPEC §3: "the four-colour spine bar, always visible under the
   map. Scrubbing the timeline lights one band." Except that at 1820 it lights
   three, and that is the whole point: §2.2 says render the overlap, do not tidy
   it into a relay race. Simultaneity is the thing print cannot show and the
   thing students most often get wrong.

   Each lane is a button. Focus or click it and it says why its boundary is where
   it is — the argument from §2.2, not a decorative date. */

import { el, fill } from '../core/util.js';
import { PHASES, SPINE_MIN, SPINE_MAX, spineCaption } from './phases.js';

export function createSpineBand({ onNote, onPeek }) {
  const lanes = [];
  const track = el('div.tl-spine__track');

  PHASES.forEach((p, i) => {
    const label = el('span.tl-lane__label',
      el('span.tl-lane__num.num', { text: p.numeral }),
      el('span.tl-lane__name', { text: p.name }),
      el('span.tl-lane__short', { text: p.short, 'aria-hidden': 'true' })
    );
    const span = el('span.tl-lane__span.num', {
      text: (p.fromSoft ? 'c.' : '') + p.from + '–' + p.to,
    });
    const bar = el('button.tl-lane', {
      type: 'button',
      'data-phase': p.id,
      'data-soft-start': p.fromSoft ? 'true' : null,
      'data-on': 'false',
      'aria-pressed': 'false',
      style: `--lane-fill:${p.fill};--lane-ink:${p.ink};--lane-tex:${p.tex};--lane-tex-size:${p.texSize};--lane-i:${i}`,
      title: p.name + ' — ' + (p.fromSoft ? 'c.' : '') + p.from + '–' + p.to,
      'aria-label': `${p.numeral}. ${p.name}, ${p.fromSoft ? 'about ' : ''}${p.from} to ${p.to}. Press for what drove it and why its dates are where they are.`,
    }, label, span);

    /* A PRESS OPENS THE ARGUMENT. FOCUS AND HOVER ONLY SAY WHAT THIS ENGINE
       WAS.

       Round 3's audit of the running app: "60 Tabs from a cold load never
       escape a six-control loop in the time bar; the map, legend, definition
       switch and dossier are unreachable by forward Tab (WCAG 2.1.2)." This
       listener was the cause. `focus` opened the phase note in the rail sheet,
       the sheet moves focus into its own close button, and forward Tab came
       back out of the sheet into this bar, reached the next lane, and opened
       the sheet again — a loop with no exit, from a cold load, with a keyboard.
       A mouse crossing the bar on its way to the map did the same thing to the
       rail, four times in a row.

       Opening a surface and moving focus into it is a change of context, and
       WCAG 3.2.1 says a change of context may not be triggered by focus. So it
       is not, any more. Focus and hover write ONE SENTENCE into the lede band —
       the same channel every other piece speaks in, at nineteen pixels, with
       "why its dates are where they are" as its one quiet control. Nothing is
       lost and nothing is moved: the whole argument is still one press away,
       and now the press is the thing that opens it. */
    bar.addEventListener('focus', () => onPeek && onPeek(p, 'focus'));
    bar.addEventListener('mouseenter', () => onPeek && onPeek(p, 'hover'));
    bar.addEventListener('click', () => onNote && onNote(p));
    lanes.push({ p, bar });
    track.append(bar);
  });

  /* THE CAPTION IS NOT IN THE BAR ANY MORE.

     It was the only narrative sentence on screen and it was the one sentence
     the bottom of the window clipped: a 13px serif line under a map that had
     been squeezed to 230px tall. The shell now speaks the phase clause in the
     lede band at nineteen pixels, which is the largest text on the page, so the
     caption is not deleted — it has been promoted. What is kept here is the
     text itself, so anything that wants it (the phase note in the sheet, the
     screen reader) can still have it. The coverage tracker goes with it, into
     the rate sheet, where it sits beside the picture it is a tally of. */
  const caption = el('p.tl-spine__caption');
  const seen = el('p.tl-spine__seen', { 'aria-live': 'off' });
  /* The trace: the years this student has actually looked at, drawn on the same
     scale as the lanes. The "not yet visited" line rests on this and nothing
     else — scrubbing from 1600 to 2020 in one drag does not visit 1955, and
     round 1's tracker, which only recorded lit lanes, said it did. */
  const trace = el('div.tl-spine__trace', { 'aria-hidden': 'true' });
  const root = el('div.tl-spine', { role: 'group', 'aria-label': 'The four empires — which are running in this year' },
    track, trace);

  let lastKey = '';
  let lastCaption = '';
  let lastSeenKey = '';

  return {
    root,
    lanes,

    layout(scale) {
      for (const { p, bar } of lanes) {
        const x1 = scale.x(p.from), x2 = scale.x(p.to);
        bar.style.left = x1 + 'px';
        bar.style.width = Math.max(2, x2 - x1) + 'px';
        const w = x2 - x1;
        bar.classList.toggle('is-tight', w < 210);
        bar.classList.toggle('is-narrow', w < 118);
        bar.classList.toggle('is-bare', w < 62);
      }
    },

    /* Cheap: only touches the DOM when the lit set or the caption actually changes. */
    setYear(year, live) {
      let key = year < SPINE_MIN ? 'pre' : year > SPINE_MAX ? 'post' : '';
      for (const { p, bar } of lanes) {
        const on = year >= p.from && year <= p.to;
        key += on ? '1' : '0';
        if ((bar.dataset.on === 'true') !== on) {
          bar.dataset.on = on ? 'true' : 'false';
          bar.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
      }
      if (key === lastKey && lastCaption) return;
      lastKey = key;
      const c = spineCaption(year, live);
      lastCaption = c.lead;
      fill(caption,
        el('strong.tl-spine__lead', { text: c.lead }),
        document.createTextNode(' '),
        el('span.tl-spine__rest', { text: c.rest })
      );
    },

    /* setSeen(idsVisited, yearsLooked, bounds) — the tracker is about years the
       student stood in, not lanes that happened to light. It says how many, so
       the claim is checkable against the trace above it. */
    setSeen(set, yearsLooked, datedYears) {
      const k = PHASES.map((p) => (set.has(p.id) ? '1' : '0')).join('') + '|' + yearsLooked;
      if (k === lastSeenKey) return;
      lastSeenKey = k;
      const missing = PHASES.filter((p) => !set.has(p.id));
      for (const { p, bar } of lanes) bar.dataset.seen = set.has(p.id) ? 'true' : 'false';
      /* Round 3 measured this against the raw data bounds — 828 years, most of
         which hold nothing — so the meter opened at 0.1% and stayed there. The
         denominator is now the years this atlas has something dated in, which
         is a set a student could actually finish. */
      const tally = datedYears
        ? `years visited: ${yearsLooked} of ${datedYears} that carry a record`
        : `${yearsLooked} years looked at`;
      if (!missing.length) {
        seen.textContent = `All four phases · ${tally}`;
        seen.dataset.done = 'true';
        return;
      }
      seen.dataset.done = 'false';
      /* Round 2 printed "Not yet: IV Dissolution" beside a caption reading "All
         four engines have stopped" — two different meanings of the same four
         numerals on one screen. The meter names the phase and its years, and
         says what the tally is a tally of. */
      seen.textContent = missing.length === PHASES.length
        ? tally
        : 'Not yet looked at: ' + missing.map((p) => `${p.short} ${p.from}–${p.to}`).join(', ') + ' · ' + tally;
    },

    /* The visited ranges, drawn under the lanes on the axis's own scale. */
    setTrace(ranges, scale) {
      if (!scale) return;
      const kids = [];
      for (const [a, b] of ranges) {
        const x1 = scale.x(a), x2 = scale.x(b);
        kids.push(el('span.tl-spine__been', { style: `left:${x1}px;width:${Math.max(2, x2 - x1)}px` }));
      }
      fill(trace, ...kids);
    },

    /* The two strings the foot used to print, still computed, still true, and
       now readable where they mean something: the phase clause in the sheet's
       phase note, the tally in the rate sheet. */
    captionText() { return caption.textContent || ''; },
    seenText() { return seen.textContent || ''; },

    noteFor(p) { return p; },
  };
}

export { PHASES };
