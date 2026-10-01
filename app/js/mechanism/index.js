/**
 * mechanism/index.js — THE MECHANISM MATRIX (FEATURE_SPEC charge 6 / P09).
 *
 * A real contingency table of how a place was taken against how it left, with
 * counts in every cell, built entirely from `acquisitions[].mechanism` and
 * `departures[].mechanism`. Empty cells stay visibly empty, because the
 * scatter is the answer. Predict the shape before it reveals. Click a cell and
 * the map paints only those units; click a row header and the map paints every
 * chartered-company territory it can reach at the year on the clock, and the
 * list beneath puts all of them on one axis across three centuries. Sorting by
 * how it left is followed, in flow and with no way past it, by the counter-line.
 *
 * AND THEN THE TABLE IS COUNTED AGAIN, IN PEOPLE (`people.js`). This is the
 * piece's own answer to its own best sentence. "105 of the 149 places that
 * left to become countries did it by negotiated independence — 70 % of them"
 * is true and is very nearly the wrong lesson, because a table counts places
 * and most places were small. Recounted at each territory's peak population,
 * with nested places excluded so nobody is counted twice, the biggest column
 * swaps: negotiated independence takes 67 % of the places and 24 % of the
 * people; partition takes 4 % of the places and 70 % of them. The reader
 * commits to a column before the rails are drawn. Nothing in the dataset
 * moves; the denominator does.
 *
 * AND THEN A THIRD TIME, BY WHO LOST (`counterparty.js`). Every row name in
 * this table is a thing Britain did; not one says to whom. Counted off the
 * same first-acquisition records, two thirds of the table has no European
 * power on the other side of it at all, and the row this atlas calls "war
 * settlement" has none whatever — Punjab from the Lahore Durbar, Assam and
 * British Burma from the Konbaung kingdom, Bhutan from Bhutan. The block is
 * the piece auditing its own vocabulary in public, with the count on screen.
 *
 * The table is ONE tab stop. 149 boxes behind a Tab key is 149 presses between
 * the reader and the two blocks that answer the table, so the arrows walk it
 * the way they walk a spreadsheet (`table.js`, `rove`).
 *
 * WHERE IT LIVES. The rail sheet (`ask:sheet`), per LAYOUT_BUDGET §3 level 3.
 * It compresses the map; it never covers it. It adds no stratum to the plate
 * and asks for no stage. At `data-stage="plate"` its one control is not drawn.
 *
 * ------------------------------------------------------------------ THE PATH
 * HOW THE AUTHORED PATH DRIVES THIS PIECE. Everything below is public.
 *
 *   bus.emit('mechanism:open',  { row?, col?, reveal?, sort?, cp? })
 *        Open the sheet. `row` / `col` pick a header, both pick a cell.
 *        `reveal: true` skips the prediction (a link that already names a cell
 *        has answered it). `sort: 'left' | 'taken' | null` sets the sort, and
 *        'left' brings the counter-line with it.
 *   bus.emit('mechanism:pick',  { row?, col?, clear? })   pick without opening
 *   bus.emit('mechanism:close', {})
 *   bus.emit('ask:mechanism', …)  — accepted alias for mechanism:open
 *
 *   Emits: mechanism:ready    { rows, cols, filled, possible, counted }
 *          mechanism:opened   { row, col, revealed }
 *          mechanism:picked   { kind, row, col, places, unitIds }
 *          mechanism:revealed { answered, correct }
 *          mechanism:recounted{ answered, correct, answer }  — the people ask
 *          mechanism:counted-sides { answered, correct, answer } — the counterparty ask
 *          mechanism:sorted   { axis }          — 'left' fires the counter-line
 *          mechanism:closed   {}
 *
 * ------------------------------------------------------------------- THE URL
 * ARCHITECTURE §8. State rides in `filter`, which is already in the frozen key
 * set, so a teacher's link is a page number:
 *
 *   #year=1900&filter=mech:open
 *   #year=1957&filter=mech:open,mechRow:chartered-company
 *   #filter=mech:open,mechRow:conquest,mechCol:negotiated-independence
 *   #filter=mech:open,mechSort:left      — opens with the counter-line up
 *   #filter=mech:open,mechCp:open        — opens with the counterparty recount up
 *
 * A link that names a row, a column or the sort reveals the table without the
 * prediction and says on screen that it did.
 */

import { el, fill, disposer, announce, prefersReducedMotion } from '../core/util.js';
import { buildMatrix, acqLabel, depLabel } from './matrix.js';
import { renderTable, renderRule, renderEmptyRows } from './table.js';
import { renderDetail, itemsFor, mapNote } from './detail.js';
import { renderCounter, findFive } from './counter.js';
import { renderPeople, countPeople, PEOPLE_CLAIM } from './people.js';
import { renderCounterparty, countCounterparties, CP_CLAIM } from './counterparty.js';

const CLAIM = 'p09:mechanism:scatter';

/* Four answers to one question, defined as shares of the table so the right
   one is found by counting rather than written down. */
const BUCKETS = [
  { id: 'most', label: 'nearly all of them', min: 0.80, max: 1.01 },
  { id: 'three', label: 'about three quarters', min: 0.60, max: 0.80 },
  { id: 'half', label: 'about half', min: 0.35, max: 0.60 },
  { id: 'few', label: 'fewer than a third', min: -1, max: 0.35 },
];

export default {
  id: 'mechanism',
  slot: 'chrome-end',
  requires: ['data'],

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { root, store, data, bus, util } = ctx;

    await util.loadCss(new URL('../../css/mechanism.css', import.meta.url));

    this.m = buildMatrix(data);
    this.pick = null;
    this.sort = null;            // null | 'taken' | 'left'
    this.revealed = false;
    this.said = null;            // the bucket the student committed to
    this.peopleSaid = null;      // and the column they committed to in people
    this.cpSaid = null;         // and the share they committed to in counterparty
    this.cpOpen = false;        // the third recount is staged behind one line
    this.open = false;
    this.painted = false;
    this.counterShown = false;
    this.skipped = false;

    /* A prediction already in the Ledger is not asked twice. The Ledger is an
       ES-module singleton owned by the close piece; if that piece is absent
       this import fails and the prediction is simply asked again. */
    try {
      const mod = await import('../close/ledger.js');
      this.ledger = mod.getLedger(bus);
      const prior = this.ledger.get(CLAIM);
      if (prior) { this.revealed = true; this.said = prior.youSaid || null; }
      const priorP = this.ledger.get(PEOPLE_CLAIM);
      if (priorP) this.peopleSaid = priorP.youSaid || null;
      const priorC = this.ledger.get(CP_CLAIM);
      if (priorC) { this.cpSaid = priorC.youSaid || null; this.cpOpen = true; }
    } catch (_) { this.ledger = null; }

    /* --- the one control ---------------------------------------------- */
    this.entry = el('button.mx-entry', {
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
      title: 'How each part was taken, against how it left — a table of ' + this.m.counted + ' places (M)',
      onclick: () => this._route(this.open ? null : { open: true }),
    }, el('span.mx-entry__mark', { 'aria-hidden': 'true' }, '▦'), el('span.mx-entry__t', { text: 'Taken → left' }));

    /* `chrome-end` is a SHARED slot: the registry hands the same element to
       every module that names it, and a module that calls fill() on it deletes
       its neighbours. Append, never fill — and check again after the last
       module has mounted, because one of the neighbours does call fill(). */
    this._ensureEntry = () => {
      if (!this.entry.isConnected) root.append(this.entry);
      this._stage();
    };
    this._ensureEntry();

    /* --- routing: the URL is the state -------------------------------- */
    const want = (s) => {
      const f = s.filters || {};
      return [f.mech || '', f.mechRow || '', f.mechCol || '', f.mechSort || '', f.mechSet || '', f.mechCp || ''].join('|');
    };
    this.d(store.watch(want, () => this._sync()));

    /* --- the bus contract --------------------------------------------- */
    const on = (n, fn) => this.d(bus.on(n, fn));
    /* Naming EITHER axis is a whole new pick: `{col:'partition'}` means the
       partition column, never "the partition column crossed with whatever row
       was selected a minute ago". Name neither and the current pick stands. */
    const asPick = (p) => {
      const q = { ...(p || {}) };
      if ('row' in q || 'col' in q || 'set' in q) {
        q.row = q.row || null; q.col = q.col || null; q.set = q.set || null;
      }
      return q;
    };
    on('mechanism:open', (p) => this._route({ open: true, ...asPick(p) }));
    on('ask:mechanism', (p) => this._route({ open: true, ...asPick(p) }));
    on('mechanism:close', () => this._route(null));
    on('mechanism:pick', (p = {}) => {
      if (p.clear) { this._route({ open: this.open, row: null, col: null, set: null }); return; }
      this._route({ open: this.open, ...asPick(p) });
    });

    /* Another piece taking the rail closes us; we do not steal it back. */
    on('chrome:sheet', (p) => {
      if (!p) return;
      if (p.open && p.id !== 'mechanism') { if (this.open) this._forget(); }
      if (!p.open && p.id === 'mechanism' && this.open) this._route(null);
    });

    on('map:painted-set', (p) => { this._paintNote(p); });
    on('chrome:stage', () => this._ensureEntry());

    /* --- M ------------------------------------------------------------- */
    const onKey = (ev) => {
      if (ev.key !== 'm' && ev.key !== 'M') return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      ev.preventDefault();
      this._route(this.open ? null : { open: true });
    };
    document.addEventListener('keydown', onKey);
    this.d(() => document.removeEventListener('keydown', onKey));

    bus.emit('mechanism:ready', {
      rows: this.m.rows.length, cols: this.m.cols.length,
      filled: this.m.filled, possible: this.m.possible, counted: this.m.counted,
    });

    /* window.BEA is where every piece publishes its handle, and getting on it
       is fiddly for a reason worth writing down: the dossier creates a stub
       `window.BEA = {}` during its own mount, and main.js then REPLACES the
       whole object with a fresh literal on the line after it emits app:ready.
       A handle published at mount, or synchronously on app:ready, is thrown
       away by that assignment. So publish on the next task, and keep checking
       that the handle we published is still the one on the object. */
    this._expose = (tries = 40) => {
      if (typeof window === 'undefined') return;
      if (!window.BEA) { if (tries > 0) setTimeout(() => this._expose(tries - 1), 40); return; }
      if (!this._handle) this._handle = {
        matrix: this.m,
        open: (p) => this._route({ open: true, ...(p || {}) }),
        close: () => this._route(null),
        pick: (p) => this._route({ open: true, row: (p && p.row) || null, col: (p && p.col) || null }),
        reveal: () => { this.revealed = true; this._render(); },
        sides: () => countCounterparties(this.m),
        state: () => ({
          open: this.open, pick: this.pick, sort: this.sort, revealed: this.revealed,
          counter: this.counterShown, cpOpen: this.cpOpen, cpSaid: this.cpSaid,
        }),
      };
      if (window.BEA.mechanism !== this._handle) window.BEA.mechanism = this._handle;
      if (tries > 0) setTimeout(() => this._expose(tries - 1), 250);
    };
    this._expose();
    on('app:ready', () => setTimeout(() => { this._expose(); this._ensureEntry(); }, 0));

    this._sync();
  },

  update(state, prev, changed) {
    if (!this.open) return;
    if (changed.has('year')) this._paintNote(this._lastPaint);
  },

  destroy() {
    if (this.d) this.d.all();
    if (this.open) { try { this.ctx.bus.emit('ask:sheet', null); } catch (_) {} }
    if (this.painted) { try { this.ctx.bus.emit('ask:paintUnits', { unitIds: [] }); } catch (_) {} }
    this._handle = null;
    if (typeof window !== 'undefined' && window.BEA) delete window.BEA.mechanism;
    /* Remove only what is mine: the slot belongs to three other pieces too. */
    if (this.entry) this.entry.remove();
  },

  /* ================================================================ stage */

  /**
   * A RESTING STATE, NOT A HIDING PLACE.
   *
   * This control used to be `hidden` at `data-stage="plate"`. Measured on the
   * running app, that meant a reader who lands cold and touches nothing never
   * sees it: forty-five seconds on the plate and the button is still 0px wide
   * (`tools/scenarios/p09/r3-cold.js`). The round-3 verdict caps exactly that
   * pattern where it found it — "hidden at disclosure level 1 … a student who
   * lands cold can never discover that retrieval practice exists" — and the
   * same sentence was true here.
   *
   * So it rests instead. It is one masthead button of three words, inside a
   * strip that already exists; it takes nothing from the plate, and below the
   * shell's §5A breakpoint it is inside the collapsed "Tools ▾" menu and costs
   * no width at all. Measured against tools/scenarios/budget.js at every
   * listed viewport, the control and word ceilings still hold.
   *
   * What DOES change with the stage is its emphasis: at rest it is quiet, and
   * it lights only when the sheet is open.
   */
  _stage() {
    const app = document.getElementById('app');
    const s = (app && app.dataset.stage) || 'plate';
    this.entry.hidden = false;
    this.entry.dataset.rest = (s === 'plate' && !this.open) ? 'yes' : 'no';
  },

  /* ============================================================== routing */

  /** The single write path into state. Everything else reads it back. */
  _route(next) {
    const f = this.ctx.store.getState().filters || {};
    if (!next) {
      this.ctx.store.dispatch('setFilter', { mech: null, mechRow: null, mechCol: null, mechSort: null, mechSet: null, mechCp: null });
      return;
    }
    const patch = {
      mech: next.open === false ? null : 'open',
      mechRow: next.row !== undefined ? (next.row || null) : (f.mechRow || null),
      mechCol: next.col !== undefined ? (next.col || null) : (f.mechCol || null),
      mechSort: next.sort !== undefined ? (next.sort || null) : (f.mechSort || null),
      mechSet: next.set !== undefined ? (next.set || null) : (f.mechSet || null),
      mechCp: next.cp !== undefined ? (next.cp ? 'open' : null) : (f.mechCp || null),
    };
    if (next.cp) { this.cpOpen = true; this.revealed = true; }
    if (next.reveal) this.revealed = true;
    this.ctx.store.dispatch('setFilter', patch);
  },

  _sync() {
    const f = this.ctx.store.getState().filters || {};
    const want = f.mech === 'open';
    const row = f.mechRow || null;
    const col = f.mechCol || null;
    const sort = f.mechSort === 'left' || f.mechSort === 'taken' ? f.mechSort : null;
    const set = f.mechSet === 'five' ? 'five' : null;
    if (f.mechCp === 'open') this.cpOpen = true;

    /* A link that already names a box has made the prediction moot. */
    if ((row || col || sort || set || f.mechCp) && !this.revealed) { this.revealed = true; this.skipped = true; }

    const known = (id, list) => !id || list.some((x) => x.id === id);
    const okRow = known(row, this.m.rows), okCol = known(col, this.m.cols);
    this.badLink = (!okRow || !okCol) ? [row, col].filter(Boolean).join(', ') : null;

    let pick = null;
    if (set === 'five') {
      const { found } = findFive(this.m);
      this.counterShown = true;
      pick = {
        kind: 'set', id: 'five', title: 'the five the word hides',
        gloss: 'Kenya, Malaya, Cyprus, Aden and Palestine, pulled out of four different columns of this table.',
        items: found.map((x) => x.item),
      };
    } else if (okRow && okCol) {
      if (row && col) pick = { kind: 'cell', row, col };
      else if (row) pick = { kind: 'row', row };
      else if (col) pick = { kind: 'col', col };
    }
    const key = (p) => (p ? [p.kind, p.row || '', p.col || '', p.id || ''].join('|') : '');
    const pickChanged = key(pick) !== key(this.pick);
    if (pickChanged) this.pick = pick;
    if (sort !== this.sort) { this.sort = sort; if (sort === 'left') this.counterShown = true; }

    if (want && !this.open) this._show();
    else if (!want && this.open) this._hide();
    else if (want) this._render();

    if (want && pickChanged) this._applyPaint();
  },

  /**
   * The masthead is a shared strip and at 390px the pieces in it ask for
   * 350px of a 204px slot, so the slot scrolls sideways with nothing to say
   * that it does. This does not fix that — it is not one piece's to fix — but
   * when the matrix opens from a link, a keypress or the path, the control
   * that is now lit is at least brought into view inside its own scroller.
   */
  _revealEntry() {
    const e = this.entry;
    if (!e || !e.isConnected || typeof e.getBoundingClientRect !== 'function') return;
    let pane = e.parentElement;
    while (pane && pane !== document.body && pane.scrollWidth <= pane.clientWidth + 1) pane = pane.parentElement;
    if (!pane || pane === document.body || pane.scrollWidth <= pane.clientWidth + 1) return;
    const a = e.getBoundingClientRect(), b = pane.getBoundingClientRect();
    if (a.right <= b.right + 1 && a.left >= b.left - 1) return;
    const left = pane.scrollLeft + (a.right - b.right) + 8;
    try { pane.scrollTo({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }
    catch (_) { pane.scrollLeft = left; }
  },

  /* ================================================================ sheet */

  _show() {
    this.open = true;
    this.entry.setAttribute('aria-expanded', 'true');
    this.entry.classList.add('is-on');
    this.entry.hidden = false;
    this._revealEntry();
    this.body = el('div.mx');
    this._render();
    this.ctx.bus.emit('ask:sheet', {
      id: 'mechanism',
      eyebrow: 'the mechanism matrix',
      title: 'Taken, and left',
      node: this.body,
    });
    this.ctx.bus.emit('mechanism:opened', {
      row: this.pick && this.pick.row, col: this.pick && this.pick.col, revealed: this.revealed,
    });
    this._applyPaint();
  },

  _hide() {
    if (!this.open) return;
    this._forget();
    this.ctx.bus.emit('ask:sheet', null);
    this.ctx.bus.emit('mechanism:closed', {});
  },

  /** Give up the rail and the paint without touching the sheet's own state. */
  _forget() {
    this.open = false;
    this.entry.setAttribute('aria-expanded', 'false');
    this.entry.classList.remove('is-on');
    this._stage();
    if (this.painted) { this.ctx.bus.emit('ask:paintUnits', { unitIds: [] }); this.painted = false; }
    this.ctx.bus.emit('ask:say', { id: 'mechanism', text: null });
  },

  /* =============================================================== render */

  _render() {
    if (!this.body) return;
    const { format } = this.ctx;
    const m = this.m;
    fill(this.body);

    if (this.badLink) {
      this.body.append(el('p.cx-note.cx-note--warn', {
        text: 'This link names something this table does not have: “' + this.badLink + '”. The table below is the whole of it; nothing has been hidden.',
      }));
    }

    /* --- 1. the prediction -------------------------------------------- */
    this.body.append(this._ask());

    /* --- 2. the sort controls (nothing to sort while it is covered) ---- */
    if (this.revealed) this.body.append(this._sorts());

    /* --- 3. the table -------------------------------------------------- */
    const wrap = el('div.mx-tw');
    wrap.append(renderTable(m, {
      format,
      sealed: !this.revealed,
      sortRows: this.sort === 'taken' ? 'size' : null,
      sortCols: this.sort === 'left' ? 'size' : null,
      onPick: (p) => this._route({ open: true, row: p.row || null, col: p.col || null }),
    }));
    wrap.dataset.sealed = this.revealed ? 'no' : 'yes';
    this.body.append(wrap);
    if (!this.revealed) {
      this.body.append(el('p.cx-note', { text: 'The counts are covered until you commit. The shape of the answer is the answer.' }));
    }

    /* --- 4. the reading rule ------------------------------------------ */
    this.body.append(renderRule(m, format));

    /* --- 5. the counter-line, once the columns have been sorted -------- */
    if (this.counterShown) {
      this.counterEl = renderCounter(m, {
        format,
        onSelect: (id) => this.ctx.store.dispatch('select', id),
        onPaint: (id) => this._route({ open: true, set: id, row: null, col: null }),
      });
      this.body.append(this.counterEl);
    }

    /* --- 5b. the same table, counted in people ------------------------- */
    if (this.revealed) {
      this.peopleEl = renderPeople(this.m, this.ctx.data, {
        format,
        said: this.peopleSaid,
        onCommit: (said, right) => this._commitPeople(said, right),
        onPick: (p) => this._route({ open: true, row: null, col: p.col || null }),
        onSelect: (id) => this.ctx.store.dispatch('select', id),
      });
      if (this.peopleEl) this.body.append(this.peopleEl);

      /* --- 5c. and a third time, by who was on the other side --------- */
      this.cpEl = renderCounterparty(this.m, {
        format,
        data: this.ctx.data,
        said: this.cpSaid,
        staged: this.cpOpen || !!this.peopleSaid,
        onOpen: () => { this.cpOpen = true; this._render(); requestAnimationFrame(() => this._scrollTo(this.cpEl, 40)); },
        onCommit: (said, right) => this._commitSide(said, right),
        onSelect: (id) => this.ctx.store.dispatch('select', id),
      });
      if (this.cpEl) this.body.append(this.cpEl);
    }

    /* --- 6. the detail ------------------------------------------------- */
    if (this.pick) {
      this.detailEl = renderDetail(this.pick, m, {
        format, data: this.ctx.data,
        onSelect: (id) => this.ctx.store.dispatch('select', id),
      });
      this.body.append(this.detailEl);
      this._paintNote(this._lastPaint);
    }

    /* --- 7. the two empty rows ---------------------------------------- */
    if (this.revealed) {
      const f = renderEmptyRows(m, format, (p) => {
        if (p.kind === 'place') this.ctx.store.dispatch('select', p.territoryId);
      });
      if (f) this.body.append(f);
    }

    this.body.append(el('p.mx-prov.cx-note', {
      text: 'Counted from ' + format.number(this.ctx.data.acquisitions.length) + ' acquisition records and '
        + format.number(this.ctx.data.departures.length) + ' departure records in this atlas, every time this table is drawn. '
        + 'Nothing on it is stored; if a shard changes, the numbers change with it.',
    }));
  },

  /* --------------------------------------------------------- the ask ---- */

  _ask() {
    const { format } = this.ctx;
    const m = this.m;
    const share = m.filled / m.possible;
    const right = BUCKETS.find((b) => share >= b.min && share < b.max) || BUCKETS[2];

    if (this.revealed) {
      const p = el('p.mx-said');
      if (this.said) {
        const ok = this.said === right.label;
        p.append(el('span.mx-said__k', { text: 'you said' }), ' ');
        p.append(el('b', { text: this.said }));
        p.append('. It is ');
        p.append(el('span.num', { text: format.number(m.filled) }));
        p.append(' of ');
        p.append(el('span.num', { text: format.number(m.possible) }));
        p.append(' — ');
        p.append(el('b', { text: right.label }));
        p.append(ok ? '. You had it.' : '.');
      } else if (this.skipped) {
        p.append(el('span.mx-said__k', { text: 'skipped' }), ' ');
        p.append('You arrived by a link that already named a box, so the question was not asked. ');
        p.append(el('span.num', { text: format.number(m.filled) }));
        p.append(' of ');
        p.append(el('span.num', { text: format.number(m.possible) }));
        p.append(' combinations happened.');
      } else {
        p.append(el('span.num', { text: format.number(m.filled) }));
        p.append(' of ');
        p.append(el('span.num', { text: format.number(m.possible) }));
        p.append(' combinations happened. The other ');
        p.append(el('span.num', { text: format.number(m.empty) }));
        p.append(' never did.');
      }
      return p;
    }

    const box = el('div.cx-ask.mx-ask');
    box.append(el('p.cx-ask__eyebrow', { text: 'before it reveals' }));
    box.append(el('p.cx-ask__q',
      el('span.num', { text: format.number(m.rows.length) }), ' ways in. ',
      el('span.num', { text: format.number(m.cols.length) }), ' ways out. That is ',
      el('span.num', { text: format.number(m.possible) }),
      ' possible combinations. How many of them actually happened?'));
    const ch = el('div.cx-ask__choices');
    for (const b of BUCKETS) {
      ch.append(el('button.mx-ch', {
        type: 'button',
        onclick: () => this._commit(b, right),
      }, b.label));
    }
    box.append(ch);
    return box;
  },

  _commit(said, right) {
    this.said = said.label;
    this.revealed = true;
    this.ctx.bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: CLAIM,
      prompt: 'how many of the ' + this.m.possible + ' ways-in-by-ways-out combinations actually happened',
      youSaid: said.label,
      answer: right.label,
      verdict: said.id === right.id ? 'right' : 'wrong',
    });
    this.ctx.bus.emit('mechanism:revealed', { answered: said.id, correct: said.id === right.id });
    announce(this.m.filled + ' of ' + this.m.possible + ' combinations happened. ' + this.m.empty + ' boxes are empty.');
    this._render();
  },

  /**
   * The second commit: the reader has counted places, and now commits to a
   * column before the same table is recounted in people. The answer is looked
   * up on the running dataset by the block itself; nothing here knows it.
   */
  _commitPeople(said, right) {
    this.peopleSaid = said.label;
    const correct = said.id === right.id;
    this.ctx.bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: PEOPLE_CLAIM,
      prompt: 'which way out of the empire took the most people with it',
      youSaid: said.label,
      answer: right.label,
      verdict: correct ? 'right' : 'wrong',
    });
    this.ctx.bus.emit('mechanism:recounted', { answered: said.id, correct, answer: right.id });
    announce(correct
      ? 'Counted in people it is ' + right.label + ', which is what you said.'
      : 'You said ' + said.label + '. Counted in people it is ' + right.label + '.');
    this._render();
    requestAnimationFrame(() => this._scrollTo(this.peopleEl, 40));
  },

  /**
   * The third commit: places, then people, then the party on the other side.
   * Each recount changes the unit and nothing in the dataset moves. The answer
   * is looked up on the running dataset by the block itself.
   */
  _commitSide(said, right) {
    this.cpSaid = said.label;
    this.cpOpen = true;
    const correct = said.id === right.id;
    const p = countCounterparties(this.m);
    this.ctx.bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: CP_CLAIM,
      prompt: 'on how many of the ' + (p ? p.counted : this.m.counted)
        + ' places on this table there was another European power on the other side',
      youSaid: said.label,
      answer: right.label,
      verdict: correct ? 'right' : 'wrong',
    });
    this.ctx.bus.emit('mechanism:counted-sides', { answered: said.id, correct, answer: right.id });
    if (p) {
      announce('It is ' + p.euroAny + ' of ' + p.counted + '. ' + p.localOnly.n
        + ' places were taken from a state, a kingdom or a people already there, with no European power on the record at all.');
    }
    this._render();
    requestAnimationFrame(() => this._scrollTo(this.cpEl, 40));
  },

  /* -------------------------------------------------------- the sorts --- */

  _sorts() {
    const wrap = el('div.mx-sorts', { role: 'group', 'aria-label': 'Sort the table' });
    wrap.append(el('span.mx-sorts__k', { text: 'sort by' }));
    const b = (id, label, hint) => el('button.mx-sort', {
      type: 'button',
      'aria-pressed': this.sort === id ? 'true' : 'false',
      title: hint,
      onclick: () => this._sortBy(this.sort === id ? null : id),
    }, label);
    wrap.append(b('taken', 'how it was taken', 'Put the rows in order of size'));
    wrap.append(b('left', 'how it left', 'Put the columns in order of size'));
    return wrap;
  },

  _sortBy(axis) {
    if (axis === 'left') this.counterShown = true;   // it never goes away again
    this._route({ open: true, sort: axis });
    this.ctx.bus.emit('mechanism:sorted', { axis });
    if (axis === 'left') {
      requestAnimationFrame(() => this._scrollTo(this.counterEl, 170));
      announce('The columns are in order of size. Mostly negotiated — and five places that word hides.');
    }
  },

  /* ================================================================ paint */

  _applyPaint() {
    if (!this.open) return;
    const { bus, format, store } = this.ctx;
    if (!this.pick) {
      if (this.painted) { bus.emit('ask:paintUnits', { unitIds: [] }); this.painted = false; }
      bus.emit('ask:say', { id: 'mechanism', text: null });
      return;
    }
    const items = itemsFor(this.pick, this.m);
    const units = [];
    const seen = new Set();
    for (const i of items) for (const u of (i.units || [])) if (!seen.has(u)) { seen.add(u); units.push(u); }

    bus.emit('ask:paintUnits', { unitIds: units, reason: reasonFor(this.pick) });
    this.painted = true;

    bus.emit('mechanism:picked', {
      kind: this.pick.kind, row: this.pick.row || null, col: this.pick.col || null,
      places: items.map((i) => i.territoryId), unitIds: units,
    });

    bus.emit('ask:say', {
      id: 'mechanism',
      priority: 40,
      mark: this.pick.kind === 'row' ? 'TAKEN' : this.pick.kind === 'col' ? 'LEFT'
        : this.pick.kind === 'set' ? 'THE FIVE' : 'ONE BOX',
      text: sayFor(this.pick, items, format),
      cta: { label: 'put the whole map back', emit: 'mechanism:pick', payload: { clear: true } },
    });

    if (this.detailEl) requestAnimationFrame(() => this._scrollTo(this.detailEl, 24));
  },

  /**
   * Scroll the sheet's own scroller, keeping `lead` pixels of whatever came
   * before still on screen — so sorting the columns shows the reordered table
   * AND the line that answers it, rather than replacing one with the other.
   */
  _scrollTo(node, lead) {
    if (!node) return;
    const pane = node.closest('.cx-sheet__body') || node.parentElement;
    if (!pane || !pane.getBoundingClientRect) return;
    const top = Math.max(0, pane.scrollTop
      + node.getBoundingClientRect().top - pane.getBoundingClientRect().top - (lead || 0));
    try { pane.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }
    catch (_) { pane.scrollTop = top; }
  },

  /** The map answers every paint with what it could and could not draw. */
  _paintNote(p) {
    this._lastPaint = p || this._lastPaint;
    if (!this.body || !this.pick) return;
    const node = this.body.querySelector('#mx-mapnote');
    if (!node) return;
    const items = itemsFor(this.pick, this.m);
    const year = this.ctx.store.getState().year;
    const asked = (p && p.asked) || 0;
    const drawn = (p && p.drawn) || 0;
    node.textContent = asked ? mapNote(items, drawn, asked, year, this.ctx.format) : '';
  },
};

function reasonFor(pick) {
  if (pick.kind === 'row') return 'taken by ' + acqLabel(pick.row);
  if (pick.kind === 'col') return 'left by ' + depLabel(pick.col);
  if (pick.kind === 'cell') return 'taken by ' + acqLabel(pick.row) + ', left by ' + depLabel(pick.col);
  return pick.title || 'a named set';
}

function sayFor(pick, items, format) {
  const n = format.plural(items.length, 'place', 'places');
  const lo = items.reduce((a, i) => Math.min(a, i.takenYear ?? a), Infinity);
  const open = items.some((i) => !Number.isFinite(i.leftYear));
  const hi = items.reduce((a, i) => Math.max(a, Number.isFinite(i.leftYear) ? i.leftYear : -Infinity), -Infinity);
  const end = open ? 'today' : '<span class="num">' + hi + '</span>';
  const span = Number.isFinite(lo) ? ' <span class="num">' + lo + '</span>–' + end : '';
  if (pick.kind === 'row') return '<strong>' + n + '</strong> were taken by ' + esc(acqLabel(pick.row)) + ', across' + span + '.';
  if (pick.kind === 'col') return '<strong>' + n + '</strong> left by ' + esc(depLabel(pick.col)) + ', across' + span + '.';
  if (pick.kind === 'cell') return '<strong>' + n + '</strong> taken by ' + esc(acqLabel(pick.row)) + ', left by ' + esc(depLabel(pick.col)) + '.';
  return '<strong>' + n + '</strong>: ' + esc(pick.title || '');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
