/**
 * mechanism/table.js — the contingency table itself, as a real <table>.
 *
 * Row and column totals are <th> with tabular figures (FEATURE_SPEC P09), so a
 * student can read down a column exactly as they would in a book — and then
 * click it. Empty cells are <td> with no content and no control: absence is
 * drawn as bare paper, never as a zero.
 *
 * The only visual channel besides the figure is a rule under each cell whose
 * WIDTH is the count. Size, not colour: DESIGN.md §6.4 forbids colour as the
 * only signal, and a nine-by-fourteen heatmap in 410 pixels would be one.
 */

import { el } from '../core/util.js';

export function renderTable(m, opts) {
  const { onPick, sortRows, sortCols, format, sealed } = opts;
  const num = (n) => format.number(n);
  const places = (n) => format.plural(n, 'place', 'places');

  const rows = order(m.rows, sortRows);
  const cols = order(m.cols, sortCols);

  let max = 0;
  for (const c of m.cells.values()) if (c.n > max) max = c.n;

  const table = el('table.mx-t', {
    'aria-describedby': 'mx-rule',
  });
  /* Sealed, the caption must not print the very figure the reader is about to
     guess. It says what the table is and nothing about what is in it. */
  table.append(sealed
    ? el('caption.mx-t__cap', { id: 'mx-cap' },
      'How ', el('b', { text: num(m.counted) }), ' places were taken, against how they left. ',
      'Every count is covered until you commit. ',
      el('span.mx-t__kbd', { text: 'Arrow keys move inside the table; Tab leaves it.' }))
    : el('caption.mx-t__cap', { id: 'mx-cap' },
      'How ', el('b', { text: num(m.counted) }), ' places were taken, against how they left. ',
      el('span.num', { text: num(m.filled) }), ' of ', el('span.num', { text: num(m.possible) }),
      ' combinations happened; the other ', el('span.num', { text: num(m.empty) }), ' are blank. ',
      el('span.mx-t__kbd', { text: 'Arrow keys move inside the table; Tab leaves it.' })));

  /* ---- head -------------------------------------------------------- */
  const hr = el('tr');
  hr.append(el('td.mx-t__corner', el('span.mx-t__ax', { text: 'taken ↓' }), el('span.mx-t__ax', { text: 'left →' })));
  for (const c of cols) {
    const th = el('th.mx-t__ch', { scope: 'col', dataset: { id: c.id } });
    th.append(el('button.mx-t__cb', {
      type: 'button',
      'aria-label': 'How it left: ' + c.label + ' — ' + places(c.total) + '. Show them on the map.',
      onclick: () => onPick({ kind: 'col', col: c.id }),
    }, el('span.mx-t__rot', { text: c.short })));
    hr.append(th);
  }
  hr.append(el('th.mx-t__ch.mx-t__ch--tot', { scope: 'col' }, el('span.mx-t__rot', { text: 'all' })));
  table.append(el('thead', hr));

  /* ---- body -------------------------------------------------------- */
  const tb = el('tbody');
  for (const r of rows) {
    const tr = el('tr', { dataset: { row: r.id, empty: r.total ? 'no' : 'yes' } });
    const rh = el('th.mx-t__rh', { scope: 'row' });
    rh.append(el('button.mx-t__rb', {
      type: 'button',
      'aria-label': 'Taken by ' + r.label + ' — ' + places(r.total) + '. Show them all on the map, across every century.',
      onclick: () => onPick({ kind: 'row', row: r.id }),
    }, r.short));
    tr.append(rh);

    for (const c of cols) {
      const cell = m.cell(r.id, c.id);
      if (!cell || !cell.n) {
        /* An empty box is a finding, so it is a stop on the arrow-key walk —
           but never a tab stop, and it opens nothing. */
        tr.append(el('td.mx-c.mx-c--none', {
          dataset: { n: '0' }, tabindex: '-1',
          'aria-label': 'None taken by ' + r.label + ' left by ' + c.label + '.',
        },
          el('span.mx-c__vis', { 'aria-hidden': 'true' }),
          el('span.mx-sr', { text: 'none' })));
        continue;
      }
      const td = el('td.mx-c', { dataset: { n: String(cell.n) } });
      const b = el('button.mx-c__b', {
        type: 'button',
        'aria-label': places(cell.n) + ' taken by ' + r.label + ', left by ' + c.label + '. Show them on the map.',
        onclick: () => onPick({ kind: 'cell', row: r.id, col: c.id }),
      },
        el('span.num.mx-c__n', { text: num(cell.n) }),
        /* Size, not colour, and floored so the smallest count still reads as a
           rule rather than a speck of dust. */
        el('span.mx-c__bar', { 'aria-hidden': 'true', style: { width: (18 + Math.round((cell.n / max) * 70)) + '%' } }));
      td.append(b);
      tr.append(td);
    }
    tr.append(el('th.mx-t__tot', { scope: 'row' }, el('span.num', { text: num(r.total) })));
    tb.append(tr);
  }
  table.append(tb);

  /* ---- foot -------------------------------------------------------- */
  const fr = el('tr');
  fr.append(el('th.mx-t__rh.mx-t__rh--tot', { scope: 'row' }, 'all'));
  for (const c of cols) fr.append(el('th.mx-t__tot', { scope: 'col' }, el('span.num', { text: num(c.total) })));
  fr.append(el('th.mx-t__tot.mx-t__tot--grand', el('span.num', { text: num(m.counted) })));
  table.append(el('tfoot', fr));

  rove(table);
  return table;
}

/* ================================================== one tab stop, arrows ==
 * 61 cells, 9 column heads and 14 row heads is 84 tab stops between the table
 * and the two things that answer it — the counter-line and the people rails.
 * A keyboard reader was being charged 84 presses to reach the argument.
 *
 * So the table is one tab stop and the arrows walk it, the way a spreadsheet
 * does. Roving tabindex only: the markup stays a plain data table, so a screen
 * reader's own table commands and its row/column header announcements are
 * untouched. Empty boxes are stops on the walk — an empty box is the finding —
 * and are never tab stops.
 */
function rove(table) {
  const grid = [];
  const rowsOf = (sect) => (sect ? [...sect.rows] : []);
  const head = table.tHead, body = table.tBodies[0];
  for (const tr of [...rowsOf(head), ...rowsOf(body)]) {
    const line = [];
    for (const c of tr.cells) {
      const b = c.querySelector('.mx-t__cb, .mx-t__rb, .mx-c__b');
      line.push(b || (c.matches('.mx-c--none') ? c : null));
    }
    grid.push(line);
  }
  const all = grid.flat().filter(Boolean);
  if (all.length < 2) return;
  for (const n of all) n.tabIndex = -1;

  let cur = all[0];
  cur.tabIndex = 0;
  const at = (n) => {
    for (let r = 0; r < grid.length; r++) {
      const c = grid[r].indexOf(n);
      if (c > -1) return [r, c];
    }
    return null;
  };
  const put = (n) => {
    if (!n || n === cur) return;
    cur.tabIndex = -1; cur = n; cur.tabIndex = 0; cur.focus();
  };
  const step = (r, c, dr, dc) => {
    let y = r + dr, x = c + dc;
    while (y >= 0 && y < grid.length) {
      const line = grid[y] || [];
      while (x >= 0 && x < line.length) {
        if (line[x]) return line[x];
        if (!dc) break;                     // vertical move: same column only
        x += dc;
      }
      if (dc) break;                        // horizontal move: same row only
      y += dr; x = c;
    }
    return null;
  };

  table.addEventListener('focusin', (ev) => {
    const n = ev.target.closest('.mx-t__cb, .mx-t__rb, .mx-c__b, .mx-c--none');
    if (n && n !== cur && all.includes(n)) { cur.tabIndex = -1; cur = n; cur.tabIndex = 0; }
  });

  table.addEventListener('keydown', (ev) => {
    if (ev.metaKey || ev.altKey) return;
    const pos = at(document.activeElement);
    if (!pos) return;
    const [r, c] = pos;
    const line = grid[r] || [];
    let go = null;
    switch (ev.key) {
      case 'ArrowRight': go = step(r, c, 0, 1); break;
      case 'ArrowLeft': go = step(r, c, 0, -1); break;
      case 'ArrowDown': go = step(r, c, 1, 0); break;
      case 'ArrowUp': go = step(r, c, -1, 0); break;
      case 'Home': go = ev.ctrlKey ? all[0] : line.find(Boolean); break;
      case 'End': go = ev.ctrlKey ? all[all.length - 1] : [...line].reverse().find(Boolean); break;
      default: return;
    }
    ev.preventDefault();
    put(go);
  });
}

function order(list, mode) {
  if (mode !== 'size') return list;
  return list.slice().sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}

/* ==================================================== the reading rule === */

/**
 * The sentence that makes the table checkable. Every figure in it is counted
 * on the running dataset — there is no literal number in this function.
 */
export function renderRule(m, format) {
  const p = el('p.mx-rule.cx-note', { id: 'mx-rule' });
  p.append(el('b', { text: 'One place, one mark. ' }));
  p.append('A territory sits in the row of how it was ');
  p.append(el('em', { text: 'first' }));
  p.append(' taken and the column of how it ');
  p.append(el('em', { text: 'finally' }));
  p.append(' left. ');
  p.append(el('span.num', { text: format.number(m.counted) }));
  p.append(' of ');
  p.append(el('span.num', { text: format.number(m.territories) }));
  p.append(' territories carry both records. A place whose departure record is still open — it has not left — counts as still British, whatever happened to it earlier: Britain pulled the Falklands garrison out in 1774 and the islands are British today.');
  if (m.uncounted.length === 1) {
    p.append(' The one place with no mark is ');
    p.append(el('b', { text: m.uncounted[0].name }));
    p.append(': ' + m.uncounted[0].why + '. It is the only territory here that never left.');
  } else if (m.uncounted.length > 1) {
    p.append(' ');
    p.append(el('span.num', { text: format.number(m.uncounted.length) }));
    p.append(' places carry no mark: ');
    p.append(m.uncounted.slice(0, 4).map((u) => u.name + ' (' + u.why + ')').join('; '));
    p.append(m.uncounted.length > 4 ? ', and others.' : '.');
  }
  return p;
}

/* ================================================== the empty-row find === */

/**
 * The two rows the counting rule empties, and why that emptiness is the
 * finding rather than the flaw. Every claim in it is recomputed from
 * `laterOnly`, so if the dataset changes the sentence changes or disappears.
 */
export function renderEmptyRows(m, format, onPick) {
  const dead = m.rows.filter((r) => r.total === 0 && r.laterOnly > 0);
  if (!dead.length) return null;

  const box = el('div.mx-find.cx-panel.cx-panel--tight');
  box.append(el('p.cx-panel__head', { text: 'two rows with nothing in them' }));
  const p = el('p.mx-find__p');
  p.append('No place in this atlas ');
  p.append(el('em', { text: 'entered' }));
  p.append(' the empire as a ' + dead.map((r) => r.label.replace('League of Nations ', '').replace('UN ', '')).join(' or a ') + '. ');
  p.append('There are ');
  p.append(el('span.num', { text: format.number(dead.reduce((s, r) => s + r.laterOnly, 0)) }));
  p.append(' such acquisitions in the records, and every one of them followed something else. ');
  box.append(p);

  const ul = el('ul.mx-find__l');
  for (const r of dead) {
    for (const pl of r.laterOnlyPlaces) {
      ul.append(el('li',
        el('button.mx-link', { type: 'button', onclick: () => onPick({ kind: 'place', territoryId: pl.territoryId }) }, pl.name),
        ' — ', (m.rows.find((x) => x.id === pl.after) || { short: pl.after }).short,
        ' first, then ', (m.rows.find((x) => x.id === r.id) || r).short, ' in ',
        el('span.num', { text: String(pl.year == null ? '—' : pl.year) })));
    }
  }
  box.append(ul);
  box.append(el('p.cx-note', { text: 'The League and the United Nations did not hand Britain places it did not already hold. They gave a name, a report and a duty to somewhere its army was already standing.' }));
  return box;
}
