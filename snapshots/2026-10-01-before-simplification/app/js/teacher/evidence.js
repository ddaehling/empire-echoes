/**
 * teacher/evidence.js — the Evidence Ledger. FEATURE_SPEC §1 charge 13.
 *
 * "A page carries its own evidence base; an app buries it in a build."
 *
 * One row per figure in the atlas — 898 of them, walked out of the shards by
 * `figures.js`, which is the same function `tools/evidence-audit.js` calls. The
 * default sort is the one a head of department wants and nobody else would
 * choose: lowest confidence first, then contested, then figures stated as a
 * single number with no range, because that is where false precision hides.
 *
 * THREE THINGS IN HERE THAT ARE NOT IN THE SPEC AND SHOULD BE.
 *
 *   `source level`  — whether the citation on a row backs THAT NUMBER, or is
 *      the territory's general reading list. 658 of the 898 are the second
 *      kind. That is the single most useful column on this table and it is the
 *      one that makes us look worst, which is why it is on by default.
 *   `money`         — 45 monetary claims that the dataset states as prose, not
 *      as a value. No validator can check them. They are listed as rows with no
 *      value rather than left out, because leaving them out would make this
 *      table flatter than the truth.
 *   `no note`       — a death toll with no sentence saying who counted and how
 *      disputed the figure is. `validate-data.js` fails the build for that, so
 *      the count should be zero; it is printed anyway, because a check you
 *      cannot see is not a check.
 *
 * Every record links to the map state where the figure appears. Following the
 * link closes the desk, because the link carries no `panel` key and
 * `core/url.js` clears the panel for a hash that does not name one — and the map
 * it lands on is the one that was beside the ledger the whole time.
 *
 * ROUND THREE: THE TABLE BECAME A LIST OF RECORDS. The desk used to be a
 * full-screen document and this was an eleven-column table 96rem wide. The desk
 * now compresses the map instead of covering it (FEATURE_SPEC §2 rule 1), which
 * means a rail column of roughly 400px, and an eleven-column table in 400px is
 * a table you read four columns at a time through a horizontal scrollbar you
 * cannot see the top of. So each figure is now one record — subject and figure
 * as its heading, the value in the figure face, its four judgements as tags,
 * its source, the sentence it supports, its counting note, and the shard path —
 * and the sort that was eleven clickable headers is one named control over the
 * same eleven keys, plus a direction. Nothing was dropped from a row, the
 * default order is unchanged, and `tools/evidence-audit.js` still prints the
 * identical rows from the identical function.
 */

import { el, fill, debounce } from '../core/util.js';
import { fmt, head } from './parts.js';
import { noteLead } from './figures.js';

const COLS = [
  { key: 'subject', label: 'Subject', get: r => r.subject },
  { key: 'figure', label: 'Figure', get: r => r.figure },
  { key: 'value', label: 'Value', num: true, get: r => (r.hasValue ? r.low : -1) },
  { key: 'year', label: 'Year', num: true, get: r => (r.year === null ? -Infinity : r.year) },
  { key: 'confidence', label: 'Confidence', num: true, get: r => ({ low: 0, medium: 1, high: 2 }[r.confidence] ?? -1) },
  { key: 'contested', label: 'Contested', num: true, get: r => (r.contested ? 0 : 1) },
  { key: 'range', label: 'Range', num: true, get: r => (r.quantity === 'money' ? 2 : r.hasRange ? 1 : 0) },
  { key: 'source', label: 'Source', get: r => (r.sources[0] ? r.sources[0].author : 'zzz') },
  { key: 'level', label: 'Source level', num: true, get: r => ({ none: 0, record: 1, figure: 2 }[r.sourceLevel] ?? 3) },
  { key: 'supports', label: 'The sentence it supports', get: r => r.supports || '' },
  { key: 'shard', label: 'Where in the data', get: r => r.shard + ' ' + r.path },
];

const FILTERS = [
  { id: 'norange', label: 'Only numbers with no range', test: r => r.hasValue && !r.hasRange },
  { id: 'low', label: 'Only low confidence', test: r => r.confidence === 'low' },
  { id: 'contested', label: 'Only contested', test: r => r.contested },
  { id: 'record', label: 'Only record-level citations', test: r => r.sourceLevel === 'record' },
  { id: 'nonote', label: 'Only figures with no counting note', test: r => !r.note },
  { id: 'money', label: 'Only money, stated in prose', test: r => r.quantity === 'money' },
];

export function renderLedger(root, api) {
  const { corpus } = api;
  const state = { sort: null, dir: 1, filters: new Set(), q: '' };

  const count = el('p.tp-led__count', { role: 'status', 'aria-live': 'polite' });
  const list = el('ol.tp-led__recs');

  const search = el('input.tp-led__search', {
    type: 'search', id: 'tp-led-q', placeholder: 'Bengal · famine · Elkins · km²',
    'aria-label': 'Filter the ledger by any word in a row',
  });
  search.addEventListener('input', debounce(() => { state.q = search.value.trim().toLowerCase(); redraw(); }, 120));

  /* SORTABLE ON EVERY COLUMN (P20 acceptance test 1), in a column that has no
     room for eleven header buttons. One named control over the same eleven
     keys, and a direction beside it that says which way it is pointing in
     words rather than in an arrow alone. */
  const sort = el('select.tp-led__sort', { id: 'tp-led-sort' },
    el('option', { value: '' }, 'The default — weakest first'),
    ...COLS.map(c => el('option', { value: c.key }, c.label)));
  const dir = el('button.tp-led__dir', { type: 'button', 'aria-pressed': 'false', disabled: true },
    el('span.tp-led__dirg', { 'aria-hidden': 'true' }, '↑'), 'ascending');
  const setDir = () => {
    const desc = state.dir === -1;
    dir.replaceChildren(el('span.tp-led__dirg', { 'aria-hidden': 'true' }, desc ? '↓' : '↑'),
      desc ? 'descending' : 'ascending');
    dir.setAttribute('aria-pressed', desc ? 'true' : 'false');
    dir.disabled = !state.sort;
    dir.title = state.sort ? 'Reverse the order' : 'Choose a column to sort by first';
  };
  sort.addEventListener('change', () => { state.sort = sort.value || null; state.dir = 1; setDir(); redraw(); });
  dir.addEventListener('click', () => { state.dir = -state.dir; setDir(); redraw(); });

  const chips = FILTERS.map(f => {
    const b = el('button.tp-chip', { type: 'button', 'aria-pressed': 'false' }, f.label);
    b.addEventListener('click', () => {
      if (state.filters.has(f.id)) state.filters.delete(f.id); else state.filters.add(f.id);
      b.setAttribute('aria-pressed', state.filters.has(f.id) ? 'true' : 'false');
      b.classList.toggle('is-on', state.filters.has(f.id));
      redraw();
    });
    return b;
  });

  const reset = el('button.cx-more', { type: 'button' }, 'Back to the default order');
  reset.addEventListener('click', () => {
    state.sort = null; state.dir = 1; state.filters.clear(); state.q = '';
    search.value = ''; sort.value = ''; setDir();
    chips.forEach(c => { c.setAttribute('aria-pressed', 'false'); c.classList.remove('is-on'); });
    redraw();
  });

  fill(root,
    el('div.tp-prose.tp-page__intro',
      el('p.tp-lede-p',
        'One record for every figure in this atlas. Sorted the way an auditor sorts: ' +
        'lowest confidence first, then contested, then figures given as a single number ' +
        'with no range. Sort by any of the eleven fields; the default is the one that shows ' +
        'us at our worst.'),
      el('p.cx-note',
        'For the same table without a browser: ', el('code', 'node tools/evidence-audit.js'),
        ' — add ', el('code', '--csv'), ', ', el('code', '--json'), ', ', el('code', '--no-range'),
        ', ', el('code', '--low'), ' or ', el('code', '--contested'),
        '. It reads the same shards and calls the same function this page calls, so the two cannot drift apart.')),

    summary(corpus),

    el('div.tp-led__tools', { role: 'group', 'aria-label': 'Filter and sort the ledger' },
      el('div.tp-led__field',
        el('label.tp-led__lab', { for: 'tp-led-q' }, 'Find'), search),
      el('div.tp-led__field',
        el('label.tp-led__lab', { for: 'tp-led-sort' }, 'Order by'),
        el('div.tp-led__sortrow', sort, dir)),
      el('div.tp-led__chips', ...chips),
      el('div.tp-led__acts',
        el('button.btn.btn--small', {
          type: 'button',
          onclick: () => api.print({ id: 'ledger', rows: current(corpus, state) }),
        }, 'Print this table'),
        reset)),

    count,
    list,
  );

  setDir();
  redraw();

  function redraw() {
    const rows = current(corpus, state);
    const bits = [];
    if (state.q) bits.push('matching “' + state.q + '”');
    for (const f of FILTERS) if (state.filters.has(f.id)) bits.push(f.label.replace(/^Only /, '').toLowerCase());
    count.textContent = rows.length === corpus.rows.length
      ? 'All ' + corpus.rows.length + ' figures, weakest first.'
      : rows.length + ' of ' + corpus.rows.length + ' figures' + (bits.length ? ' — ' + bits.join(', ') : '') + '.';
    fill(list, ...rows.map(rowNode));
  }
}

/* ------------------------------------------------------------ the shape -- */

function current(corpus, state) {
  let rows = corpus.rows;
  for (const f of FILTERS) if (state.filters.has(f.id)) rows = rows.filter(f.test);
  if (state.q) {
    const q = state.q;
    rows = rows.filter(r =>
      (r.subject + ' ' + r.figure + ' ' + (r.supports || '') + ' ' + (r.note || '') + ' ' +
        r.shard + ' ' + r.path + ' ' + r.confidence + ' ' + (r.unit || '') + ' ' +
        r.sources.map(s => s.author + ' ' + s.work).join(' ')).toLowerCase().includes(q));
  }
  if (!state.sort) return rows;
  const col = COLS.find(c => c.key === state.sort);
  if (!col) return rows;
  return rows.slice().sort((a, b) => {
    const x = col.get(a), y = col.get(b);
    const c = col.num ? (x - y) : String(x).localeCompare(String(y));
    return (c || (a.seq - b.seq)) * state.dir;
  });
}

/**
 * One figure, one record. The field order is the audit order: what it is, what
 * it says, how far we trust it, who backs it, what sentence it is holding up,
 * and where in the data to go and check. Every field that was a column is here;
 * none of them is behind a disclosure.
 */
function rowNode(r) {
  const src = r.sources[0];
  return el('li.tp-led__rec', { dataset: { conf: r.confidence, level: r.sourceLevel, q: r.quantity } },
    /* The deep link is the heading. It was a column at the far right and at
       1366 it was the first thing to fall off the edge of the table — a strange
       fate for the one control that takes a reader from a number to the map
       state the number is about. */
    el('p.tp-led__h',
      el('a.tp-led__link', { href: r.link, title: 'Open ' + r.subject + ' on the map at this year' }, r.subject),
      el('span.tp-led__fig', r.figure)),

    el('p.tp-led__vline',
      el('span.tp-led__v.num', valueCell(r)),
      r.unit ? el('span.tp-led__u', ' ' + r.unit) : null,
      el('span.tp-led__yr', r.year === null ? 'no year given' : el('span.num', String(r.year)))),

    el('p.tp-led__tags',
      el('span.tp-tag', { dataset: { conf: r.confidence } }, r.confidence + ' confidence'),
      r.contested ? el('span.tp-tag.tp-tag--warn', 'contested') : null,
      r.quantity === 'money' ? el('span.tp-tag', 'money, in prose')
        : r.hasRange ? el('span.tp-tag', 'has a range')
          : el('span.tp-tag.tp-tag--warn', 'single value, no range'),
      el('span.tp-tag', { dataset: { level: r.sourceLevel } },
        r.sourceLevel === 'figure' ? 'cited for this figure'
          : r.sourceLevel === 'record' ? 'record-level citation only' : 'no citation'),
      /* THE WARRANT, WHICH IS NOT THE CITATION. `sourceLevel` says how close
         the reading list sits to this figure; the WARRANT says whether a
         record is filed against THIS QUANTITY and where to look it up.
         core/warrant.js owns the contract; the row shows its class the way the
         printed ledger does, so the screen and the paper say the same thing. */
      r.warrantStatus === 'ok' ? el('span.tp-tag', { dataset: { warrant: 'ok' } }, 'checkable figure')
        : r.warrantStatus === 'weak' ? el('span.tp-tag.tp-tag--warn', 'record named, no locator')
          : el('span.tp-tag.tp-tag--warn', 'no record against this number')),

    el('p.tp-led__src',
      src ? [el('span.tp-led__auth', src.author), ', ', el('cite', src.work),
        ' ', el('span.num', src.year ? '(' + src.year + ')' : ''),
        r.sources.length > 1 ? el('span.tp-dim', ' and ' + (r.sources.length - 1) + ' more') : null]
        : el('b.defect', '[unsourced]')),

    el('p.tp-led__sup', r.supports || el('span.tp-dim', 'No sentence recorded for this figure.'),
      r.gloss ? el('span.tp-led__note.tp-led__note--gloss', ' ' + r.gloss) : null,
      /* A note that came off a block covering several figures says so. It used
         to be printed as this number's own counting note, which on the Irish
         famine pair told a reader that an emigration figure was estimated the
         way a death toll was. */
      r.note ? el('span.tp-led__note',
        ' ' + (noteLead(r) || 'How it was counted:') + ' ' + r.note)
        : el('span.tp-led__note.tp-led__note--miss', ' No counting note.')),

    r.warrantText
      ? el('p.tp-led__warr',
        el('span.tp-led__warrk', 'Where this number comes from'), ' ', r.warrantText)
      : null,

    el('p.tp-led__path', el('code', r.shard.replace('app/data/territories/', '')), ' ', el('code', r.path)));
}

function valueCell(r) {
  if (r.quantity === 'money') return el('span.tp-dim', 'in prose');
  if (!r.hasValue) return el('span.tp-dim', 'none');
  return r.hasRange ? fmt(r.low) + '–' + fmt(r.high) : fmt(r.low);
}

/* -------------------------------------------------------------- summary -- */

function summary(corpus) {
  const s = corpus.stats;
  const line = (k, v, note) => el('li.tp-sum__i',
    el('span.tp-sum__v.num', String(v)), el('span.tp-sum__k', k),
    note ? el('span.tp-sum__n', note) : null);
  return el('section.cx-panel.tp-block.tp-sum',
    head('What is in here, before you read a row'),
    el('ul.tp-sum__list',
      line('figures', s.total, 'every number a reader can see'),
      line('low confidence', s.low, 'we say so on the row'),
      line('contested', s.contested, 'historians disagree and the note says what about'),
      line('single value, no range', s.noRange, 'the false-precision risk'),
      line('record-level citation only', s.recordLevel, 'the book backs the territory, not this number'),
      line('no citation at all', s.noSource, 'this must be zero'),
      line('a record against the number itself', s.warrantOk, 'named, and with somewhere to look it up'),
      line('no record against the number', s.warrantBare, 'the citation backs the record, not the figure'),
      line('no counting note', s.noNote, 'a toll with no note fails validate-data.js --strict'),
      line('money, stated in prose', s.money, 'no validator can check these')),
    el('p.cx-note',
      'Quantities: ' + Object.entries(s.quantities).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => k + ' ' + v).join(' · ') + '.'));
}
