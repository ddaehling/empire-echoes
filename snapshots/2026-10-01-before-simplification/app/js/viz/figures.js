/**
 * viz/figures.js — a number may not appear on this screen unless the dataset
 * still says it.
 *
 * THE PROBLEM. A chart is the easiest place in an application to tell a lie,
 * because a number in a chart has no visible parent. Type "£20 million" into a
 * template and it will still be there in three years when the record behind it
 * has been corrected to something else, and nobody will ever know.
 *
 * THE RULE HERE. Every figure this piece prints declares a WARRANT: the record
 * in the dataset it came from, and the words that record must still contain.
 * At render time the warrant is checked against the live dataset. If the record
 * has gone, or no longer contains those words, the figure does not quietly
 * change and it does not quietly disappear: it renders `[unsourced]` in
 * --danger, in front of a sixteen-year-old, and increments a counter the
 * statusbar can read (FEATURE_SPEC P08 acceptance test 5, and §2's rule that a
 * defect is student-visible).
 *
 * This is deliberately stricter than "the number is in a variable somewhere".
 * It is a claim about provenance that a hostile critic can break by editing one
 * JSON file and reloading the page.
 *
 * A warrant is:
 *   { kind: 'event'|'territory', id, pick(record) -> string, must: [ ...strings ] }
 * `pick` returns the text the warrant is about; `must` are the substrings that
 * text has to contain, compared with whitespace and typographic punctuation
 * normalised (the shards use both ' and ’, and both - and –).
 */

import { el } from '../core/util.js';

/* -------------------------------------------------------------- lookup -- */

function eventById(data, id) {
  if (!data || !Array.isArray(data.events)) return null;
  return data.events.find((e) => e && e.id === id) || null;
}

function recordFor(data, w) {
  if (!w || !w.id) return null;
  if (w.kind === 'territory') return (data.get && data.get(w.id)) || null;
  return eventById(data, w.id);
}

/** Normalise for comparison: one kind of quote, one kind of dash, one space. */
function norm(s) {
  return String(s == null ? '' : s)
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* ------------------------------------------------------------- resolve -- */

/**
 * @returns {{ok:boolean, why:string, record:object|null, text:string, cites:object[]}}
 */
export function checkWarrant(data, w) {
  const record = recordFor(data, w);
  if (!record) return { ok: false, why: 'no record `' + (w && w.id) + '` in the dataset', record: null, text: '', cites: [] };
  let text = '';
  try { text = String(w.pick ? w.pick(record) || '' : ''); } catch (_) { text = ''; }
  if (!text) return { ok: false, why: 'the field this figure was read from is empty in `' + w.id + '`', record, text: '', cites: citesOf(record, w) };
  const hay = norm(text);
  for (const need of w.must || []) {
    if (!hay.includes(norm(need))) {
      return { ok: false, why: '`' + w.id + '` no longer says “' + need + '”', record, text, cites: citesOf(record, w) };
    }
  }
  return { ok: true, why: '', record, text, cites: citesOf(record, w) };
}

function citesOf(record, w) {
  const list = [];
  const add = (arr) => { for (const c of arr || []) if (c && c.work) list.push(c); };
  if (w && w.cite) {
    let extra = w.cite;
    if (typeof extra === 'function') { try { extra = extra(record); } catch (_) { extra = null; } }
    add(extra);
  }
  add(record && record.evidence);
  /* De-duplicate on work + year: the same book backs several figures. */
  const seen = new Set();
  return list.filter((c) => {
    const k = (c.author || '') + '|' + c.work + '|' + (c.year || '');
    if (seen.has(k)) return false;
    seen.add(k); return true;
  }).slice(0, 3);
}

/* -------------------------------------------------------------- render -- */

let defects = 0;
export function defectCount() { return defects; }

/**
 * The one way a figure from this piece is allowed to look, and the one way it
 * is allowed to fail. `.num` is base.css's tabular figure treatment; the
 * defect is `--danger`, in words, naming what broke.
 */
export function figure(data, spec, opts = {}) {
  const w = checkWarrant(data, spec.warrant);
  if (!w.ok) {
    defects += 1;
    return el('span.viz-fig.viz-fig--bad', {
      dataset: { fig: spec.id || '', bad: 'yes' },
      title: 'This figure could not be checked against the dataset: ' + w.why,
    }, el('b.viz-defect', { text: '[unsourced]' }), ' ', el('span', { text: w.why }));
  }
  const node = el('span.viz-fig', {
    dataset: { fig: spec.id || '', year: spec.year != null ? String(spec.year) : '' },
    tabindex: opts.focusable === false ? null : '0',
    role: opts.focusable === false ? null : 'button',
    'aria-label': (spec.print + ' ' + (spec.unit || '')).trim() + (opts.hint || ''),
  },
  el('span.viz-fig__v.num', { text: spec.print }),
  spec.unit ? el('span.viz-fig__u', { text: ' ' + spec.unit }) : null);
  return node;
}

/** The record's own citation line, in the shared chrome treatment. */
export function citation(data, spec) {
  const w = checkWarrant(data, spec.warrant);
  const cites = w.cites || [];
  if (!cites.length) return null;
  const c = cites[0];
  return el('p.cx-src',
    el('span.cx-src__kind', { text: kindWord(c.kind) }),
    c.author ? el('span', { text: c.author + ', ' }) : null,
    el('cite', { text: c.work }),
    c.year ? el('span.num', { text: ' ' + c.year }) : null,
    c.supports ? el('span.viz-src__for', { text: ' — ' + c.supports }) : null);
}

function kindWord(k) {
  const map = {
    book: 'Monograph', article: 'Article', 'primary-source': 'Primary text',
    database: 'Database', despatch: 'Despatch', testimony: 'Testimony',
    report: 'Official report', statute: 'Statute',
  };
  return map[k] || 'Source';
}

/**
 * The dataset's own sentence, verbatim, with the figure's words marked. This is
 * the warrant made visible: a student can read the sentence the number was
 * taken from without leaving the chart.
 */
export function warrantLine(data, spec) {
  const w = checkWarrant(data, spec.warrant);
  if (!w.ok) return null;
  const text = w.text;
  const marks = (spec.warrant.must || []).slice().sort((a, b) => b.length - a.length);
  const out = el('p.viz-warrant');
  let rest = text;
  /* Mark the first occurrence of each required phrase; anything unmatched is
     printed as plain text, never dropped. */
  const pieces = [];
  const lower = rest.toLowerCase();
  const hits = [];
  for (const m of marks) {
    const i = lower.indexOf(m.toLowerCase());
    if (i >= 0) hits.push([i, i + m.length]);
  }
  hits.sort((a, b) => a[0] - b[0]);
  let cursor = 0;
  for (const [a, b] of hits) {
    if (a < cursor) continue;
    pieces.push(document.createTextNode(rest.slice(cursor, a)));
    pieces.push(el('mark.viz-mark', { text: rest.slice(a, b) }));
    cursor = b;
  }
  pieces.push(document.createTextNode(rest.slice(cursor)));
  out.append(el('span.viz-warrant__q', ...pieces));
  return out;
}
