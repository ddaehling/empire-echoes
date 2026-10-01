/**
 * teacher/parts.js — the small shared pieces of the teaching desk.
 *
 * Two rules govern this file.
 *
 * 1. QUOTATIONS. FEATURE_SPEC §1 charge 8 makes `renderSource()` the only
 *    function in the app allowed to print one, and the dossier publishes it on
 *    `window.BEA.renderSource`. The desk uses it. `sourceBlock()` falls back to
 *    its own rendering only if that function is genuinely absent — a broken or
 *    missing dossier module — and the fallback obeys the same law: nature,
 *    origin, purpose and what-it-cannot-tell-you print BEFORE the quote, in DOM
 *    order and above it visually, at the same type size.
 *
 * 2. COUNTS. Every tally on this desk is computed from the shards at the moment
 *    it is drawn. Nothing here is written down. If a shard changes, the number
 *    changes, and if a mechanism has no members the row is absent rather than
 *    printed as zero.
 */

import { el } from '../core/util.js';
import { statusCount } from '../tours/answers.js';
import { beatRecord } from './steps.js';

/* --------------------------------------------------------------- jumping -- */

/**
 * SCROLL THE SCROLLER THAT IS ACTUALLY THERE.
 *
 * Both jump bars on this desk — the Workshop's four moves and the Classroom
 * tab's six blocks — used to scroll `.tp__pages`, which was the desk's own
 * pane when the desk was a full-screen document. The desk is the rail sheet
 * now (`ask:sheet`), and the element with the overflow is `.cx-sheet__body`;
 * `.tp__pages` still exists and still has `scrollTop`, so the old code set a
 * value on an element that does not scroll and nothing moved. Measured at both
 * 390x844 and 1440x900: pressing "Everything to print" moved focus to the
 * right heading and left the page exactly where it was, with the target at
 * y = 10,820.
 *
 * So the scroller is FOUND rather than named: the nearest ancestor that can
 * actually scroll. Focus moves too, with `preventScroll`, because the scroll
 * has already been done and a keyboard user must land on the heading.
 */
export function jumpTo(id, headSel = '.cx-panel__title') {
  const target = typeof id === 'string' ? document.getElementById(id) : id;
  if (!target) return false;

  let pane = target.parentElement;
  while (pane && pane !== document.body) {
    const st = getComputedStyle(pane);
    const scrolls = /(auto|scroll)/.test(st.overflowY) && pane.scrollHeight > pane.clientHeight + 2;
    if (scrolls) break;
    pane = pane.parentElement;
  }
  if (pane && pane !== document.body) {
    pane.scrollTop += target.getBoundingClientRect().top - pane.getBoundingClientRect().top - 12;
  } else {
    target.scrollIntoView({ block: 'start' });
  }

  const h = (headSel && target.querySelector(headSel)) || target;
  h.setAttribute('tabindex', '-1');
  h.focus({ preventScroll: true });
  return true;
}

/* ------------------------------------------------------------- furniture -- */

export function head(text) {
  return el('p.cx-panel__head', text);
}

/**
 * THE HEADING LEVEL IS h3 AND THAT IS NOT ARBITRARY. The desk lives in the
 * rail sheet, whose own title is an `h2`; the Workshop's four moves are `h3`.
 * A panel titled `h4` skipped a level and sat a rank below a move it is a peer
 * of, so the desk's outline read h2 → h4 → h5 with h3s scattered through it.
 * The CSS on `.cx-panel__title` keys on the class, not the element, so the
 * rank is free to be correct.
 */
export function panel(title, ...children) {
  return el('section.cx-panel.tp-block',
    title ? el('h3.cx-panel__title.tp-block__title', title) : null,
    ...children.filter(Boolean));
}

/* --------------------------------------------------------------- sources -- */

/**
 * The atlas's transcribed primary texts. The dossier owns the corpus and
 * publishes it (its own file says so, in as many words, so that "the evidence
 * ledger, the audit tool and a hostile critic can all read the same table").
 * We read it and never write it.
 */
export function findText(api, id) {
  const list = (api.corpus && api.corpus.testimony) || [];
  return list.find(t => t.id === id) || null;
}

export function sourceBlock(t) {
  const render = typeof window !== 'undefined' && window.BEA && window.BEA.renderSource;
  const body = el('div.tp-source');
  if (typeof render === 'function') {
    try {
      /* renderSource prints its own "check it against" line. Printing a second
         one here would be the app saying the same thing twice in two registers,
         which is exactly the habit chrome.css §5 exists to stop. */
      body.appendChild(render(t, {}));
      return body;
    } catch (_) { /* fall through to our own rendering */ }
  }
  return fallbackSource(t);
}

function checkLine(t) {
  if (!t.check) return null;
  return el('p.tp-check',
    el('span.tp-check__k', 'Where to check it'), ' ', t.check);
}

const FIELDS = [
  ['nature', 'What it is'],
  ['origin', 'Who made it, and when'],
  ['purpose', 'What it was made for'],
  ['cannotTell', 'What it cannot tell you'],
];

function fallbackSource(t) {
  return el('figure.tp-source.tp-source--own',
    el('dl.tp-source__prov', ...FIELDS.flatMap(([k, label]) => [
      el('dt.tp-source__k', label),
      t[k] ? el('dd.tp-source__v', t[k])
        : el('dd.tp-source__v', el('b.defect', '[unsourced]'),
          ' No answer for this field is recorded.'),
    ])),
    el('blockquote.tp-source__q', el('p', '“' + (t.quote || '') + '”')),
    el('figcaption.tp-source__cap', t.speaker || [t.author, t.work, t.year].filter(Boolean).join(', ')),
    checkLine(t));
}

/* --------------------------------------------------------------- tallies -- */

function tally(shards, pick) {
  const counts = new Map();
  let total = 0;
  const subjects = new Set();
  for (const { payload } of shards) {
    for (const t of (payload.territories || [])) {
      for (const step of pick(t)) {
        if (!step || !step.mechanism) continue;
        counts.set(step.mechanism, (counts.get(step.mechanism) || 0) + 1);
        total++;
        subjects.add(t.id);
      }
    }
  }
  return {
    rows: [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    total, subjects: subjects.size,
  };
}

export const tallyAcquisitions = (shards) => tally(shards, t => t.acquisitions || []);
export const tallyDepartures = (shards) => tally(shards, t => t.departures || []);

/* ---------------------------------------------------------------- number -- */

export function fmt(n) {
  return n === null || n === undefined ? '' : Number(n).toLocaleString('en-GB');
}

export function figureValue(r) {
  if (r.quantity === 'money') return null;
  if (!r.hasValue) return null;
  return r.hasRange ? fmt(r.low) + '–' + fmt(r.high) : fmt(r.low);
}

/* ------------------------------------------------------------ the year -- */

/**
 * THE LAST YEAR THE ATLAS RECORDS A CHANGE — AND WHY IT IS NOT THE CLOCK'S.
 *
 * `data.bounds.max` is `new Date().getFullYear() + 1` (core/data.js), and on
 * screen that is right: a scrubber should reach the present. On PAPER it is a
 * bug, and round three's historian found it — the printed lesson sheet's last
 * segment read "Open the map here #year=2027", a year derived from the machine
 * that printed the sheet. A plan filed in a departmental folder is opened next
 * term by somebody else, and a year in the future reads as a typo.
 *
 * So every year a printed sheet types into a link is pinned to the last year
 * the DATASET records a change. It moves when the dataset moves and never when
 * the clock does, and the sheet's footer already carries the dataset's own
 * build stamp, so the two cannot disagree. If the data cannot be read the year
 * is `null` and the caller prints no link rather than a number it cannot check.
 */
export function lastRecordedChange(data) {
  try {
    const evs = (data && data.events) || [];
    let best = null;
    for (const e of evs) {
      const y = Number(e && e.year);
      if (!Number.isFinite(y)) continue;
      if (!best || y > best.year) best = { year: y, what: e.title || e.label || null, id: e.territoryId || null };
    }
    return best;
  } catch (_) { return null; }
}

export function lastRecordedYear(data) {
  const c = lastRecordedChange(data);
  return c ? c.year : null;
}

/**
 * Resolve a printed link that wants that year. A link written as `#year=@last`
 * is filled in from the dataset; anything else is returned unchanged; and a
 * `@last` link with no dataset behind it returns null, which every caller
 * prints as no link at all.
 */
export function resolveYearLink(link, data) {
  if (!link || link.indexOf('@last') < 0) return link || null;
  const y = lastRecordedYear(data);
  return y ? link.replace('@last', String(y)) : null;
}


/* --------------------------------------------------- how many kinds of rule --
 *
 * ONE QUANTITY, ONE ANSWER — WHICH IS NOT WHERE THIS DESK STARTED.
 *
 * Round nine, the rubric critic: "one quantity, three answers." The Close's
 * through-line strip said "a dozen kinds of rule", the board sheet said "at
 * least fifteen different legal arrangements", and the poster beat's own panel
 * — which asks the class for a number and then computes one — printed sixteen.
 * Two of those three were typed by hand and one was counted from the dataset.
 *
 * `tours/answers.js::statusCount` is the function that counts it, and the
 * poster beat is the beat that asks the question, so the YEAR and the
 * DEFINITION are read off that beat's own `map` block rather than typed here
 * either. If the dataset changes, or the beat moves its year, every teacher
 * surface that prints the number moves with it; if the data cannot be read the
 * answer is `null` and every caller prints the claim without a number rather
 * than a number nobody counted.
 */
export function kindsOfRule(data) {
  if (!data || typeof data.statusAt !== 'function') return null;
  const b = beatRecord('poster');
  const m = (b && b.map) || {};
  const year = Number.isFinite(m.year) ? m.year : null;
  const def = typeof m.def === 'string' && m.def ? m.def : 'claimed';
  if (!Number.isFinite(year)) return null;
  try {
    const r = statusCount(data, year, def);
    if (!r || !Number.isFinite(r.value) || r.value < 1) return null;
    return { n: r.value, year, def, unit: r.unit, kinds: (r.detail || []).map((x) => x[0]) };
  } catch (_) { return null; }
}

/**
 * The same count in the clause a printed sentence carries. `noun` picks the
 * wording the surrounding sentence needs; both forms name the same counted
 * number and neither states one when the dataset cannot be read.
 */
export function kindsOfRuleSays(data, noun) {
  const k = kindsOfRule(data);
  const word = noun || 'kinds of rule';
  if (!k) return 'more ' + word + ' than any class guesses \u2014 the atlas counts them on screen and names every one';
  return k.n + ' ' + word;
}

/** The count with the year it was counted at, for a line that must be checkable. */
export function kindsOfRuleChecked(data, noun) {
  const k = kindsOfRule(data);
  if (!k) return kindsOfRuleSays(data, noun);
  return kindsOfRuleSays(data, noun) + ', counted on this map in ' + k.year;
}
