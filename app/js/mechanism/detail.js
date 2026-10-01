/**
 * mechanism/detail.js — what a cell, a row or a column actually contains.
 *
 * This is the part that answers "how did each part split away". The matrix
 * gives the shape; this gives the places, their dates and the plain-verb
 * sentence from the departure record. Every name opens its dossier.
 *
 * The span rule under each name is drawn on ONE axis shared by the whole list,
 * so clicking `a company` really does put three centuries on screen at once —
 * the map can only paint what exists at the year on the clock, and says so.
 */

import { el, frag } from '../core/util.js';
import { acqLabel, depLabel, tollOf } from './matrix.js';
import { sideOf, KIND } from './counterparty.js';

const FIRST = 24;   // rows printed before the reader asks for the rest

export function renderDetail(pick, m, ctx) {
  const { format } = ctx;
  const num = (n) => format.number(n);

  const items = itemsFor(pick, m);
  const box = el('section.mx-d', { 'aria-live': 'polite' });

  /* ---- what you picked --------------------------------------------- */
  const head = el('div.mx-d__hd');
  head.append(el('p.cx-panel__head', { text: headEyebrow(pick) }));
  head.append(el('h3.cx-panel__title.mx-d__t', titleOf(pick, m, format)));
  box.append(head);

  const gloss = glossOf(pick, m);
  for (const g of gloss) box.append(el('p.mx-d__g', { text: g }));

  if (!items.length) {
    box.append(el('p.cx-note', { text: 'No place in this atlas was taken that way and left that way. The box is empty because nothing happened in it, not because nobody counted.' }));
    return box;
  }

  /* ---- what the map can and cannot show ----------------------------- */
  box.append(el('p.mx-d__map.cx-note', { id: 'mx-mapnote' }, ''));

  /* ---- who was on the other side (M17: the row name never says) ----- */
  const side = otherSide(items, format);
  if (side) box.append(side);

  /* ---- the toll line, where there is one ---------------------------- */
  const tolls = items.map(tollOf);
  const dead = tolls.filter((t) => t && (t.lo != null || t.hi != null)).length;
  const moved = tolls.filter((t) => t && (t.dLo != null || t.dHi != null)).length;
  if (dead || moved) {
    const p = el('p.mx-d__toll');
    p.append('Of these ');
    p.append(el('span.num', { text: num(items.length) }));
    p.append(', ');
    const bits = [];
    if (dead) bits.push([num(dead), dead === 1 ? ' records a death toll in the leaving' : ' record a death toll in the leaving']);
    if (moved) bits.push([num(moved), moved === 1 ? ' records people displaced by it' : ' record people displaced by it']);
    bits.forEach((b, i) => {
      if (i) p.append(' and ');
      p.append(el('span.num', { text: b[0] }));
      p.append(b[1]);
    });
    p.append('. ');
    p.append(el('span.cx-note', { text: 'Each figure is a range with a reason, printed on the place. They are not added together: these are different events in different decades, and a total would be a claim no historian has made.' }));
    box.append(p);
  }

  /* ---- the axis ----------------------------------------------------- */
  const [a0, a1] = axisFor(items, ctx);
  box.append(axisHead(a0, a1, format));

  /* ---- the places --------------------------------------------------- */
  const ul = el('ul.mx-l');
  const draw = (from, to) => {
    for (let i = from; i < to && i < items.length; i++) ul.append(row(items[i], a0, a1, m, ctx));
  };
  draw(0, FIRST);
  box.append(ul);

  if (items.length > FIRST) {
    const more = el('button.cx-more', { type: 'button' },
      el('span', { text: 'the other ' + num(items.length - FIRST) + ' places' }));
    more.addEventListener('click', () => {
      draw(FIRST, items.length);
      more.remove();
    });
    box.append(more);
  }
  return box;
}

/* ------------------------------------------------- who was on the other side
 *
 * The row and column names of this table are all things Britain did. This
 * sentence is the answer to "to whom", counted off the same records, for
 * whatever the reader has just picked. It is never a total with no names
 * under it: the parties are printed, and each opens a place.
 */
function otherSide(items, format) {
  const s = sideOf(items);
  if (!s.n || !s.names.length) return null;
  const n = (v) => format.number(v);

  const p = el('p.mx-d__side');
  p.append(el('span.mx-d__sk', { text: 'on the other side' }), ' ');
  const bits = [];
  if (s.local) bits.push([n(s.local), s.local === 1 ? ' was taken from a state, a kingdom or a people already there' : ' were taken from a state, a kingdom or a people already there']);
  if (s.euro) bits.push([n(s.euro), s.euro === 1 ? ' from another European or American state' : ' from another European or American state']);
  if (s.unsorted) bits.push([n(s.unsorted), s.unsorted === 1 ? ' from a party this count will not sort by its label' : ' from parties this count will not sort by their labels']);
  if (!bits.length) return null;
  p.append('Of these ');
  p.append(el('span.num', { text: n(s.n) }));
  p.append(', ');
  bits.forEach((b, i) => {
    if (i) p.append(i === bits.length - 1 ? ' and ' : ', ');
    p.append(el('span.num', { text: b[0] }));
    p.append(b[1]);
  });
  p.append('.');
  /* The clauses overlap only when a record can carry both, so the caveat is
     printed only when it is true of what has just been counted. */
  if (s.euro && s.local && (s.euro + s.local) > s.n) {
    p.append(' Those two overlap: ');
    p.append(el('span.num', { text: n(s.euro + s.local - (s.n - s.unsorted)) }));
    p.append(' of these records name both.');
  }
  if (s.nobody) {
    p.append(' ');
    p.append(el('span.num', { text: n(s.nobody) }));
    p.append(s.nobody === 1 ? ' records nobody living there.' : ' record nobody living there.');
  }

  const wrap = el('div.mx-d__sw');
  wrap.append(p);

  /* The names themselves, which is the part a row label can never carry. */
  const top = s.names.slice(0, 10);
  const names = el('p.mx-d__names');
  names.append(el('span.mx-d__sk', { text: 'named' }), ' ');
  top.forEach((x, i) => {
    if (i) names.append(' · ');
    names.append(el('span.mx-d__nm', { title: KIND[x.kind] || x.kind, text: x.name }));
    if (x.n > 1) names.append(el('span.num.mx-d__nn', { text: ' ' + x.n }));
  });
  if (s.names.length > top.length) {
    names.append(' · ');
    names.append(el('span.cx-note', { text: 'and ' + n(s.names.length - top.length) + ' more, each on its own place below' }));
  }
  wrap.append(names);
  return wrap;
}

/* ------------------------------------------------------------------ bits */

export function itemsFor(pick, m) {
  if (!pick) return [];
  if (pick.kind === 'cell') { const c = m.cell(pick.row, pick.col); return c ? c.items : []; }
  if (pick.kind === 'row') return m.itemsInRow(pick.row);
  if (pick.kind === 'col') return m.itemsInCol(pick.col);
  if (pick.kind === 'set') return pick.items || [];
  return [];
}

function headEyebrow(pick) {
  if (pick.kind === 'cell') return 'one box';
  if (pick.kind === 'row') return 'one way in';
  if (pick.kind === 'col') return 'one way out';
  return 'a named set';
}

function titleOf(pick, m, format) {
  const n = (x) => el('span.num', { text: format.number(x) });
  const noun = (x) => (Math.abs(x) === 1 ? ' place' : ' places');
  if (pick.kind === 'cell') {
    const c = m.cell(pick.row, pick.col);
    const k = c ? c.n : 0;
    return frag(n(k), noun(k), ': taken by ', em(acqLabel(pick.row)), ', left by ', em(depLabel(pick.col)));
  }
  if (pick.kind === 'row') {
    const r = m.rows.find((x) => x.id === pick.row) || { total: 0 };
    return frag(n(r.total), noun(r.total), ' taken by ', em(acqLabel(pick.row)));
  }
  if (pick.kind === 'col') {
    const c = m.cols.find((x) => x.id === pick.col) || { total: 0 };
    return frag(n(c.total), noun(c.total), ' left by ', em(depLabel(pick.col)));
  }
  return frag(pick.title || 'a named set');
}

const em = (t) => el('em', { text: t });

function glossOf(pick, m) {
  const out = [];
  if (pick.kind === 'row' || pick.kind === 'cell') {
    const r = m.rows.find((x) => x.id === pick.row);
    if (r && r.gloss) out.push(r.gloss);
  }
  if (pick.kind === 'col' || pick.kind === 'cell') {
    const c = m.cols.find((x) => x.id === pick.col);
    if (c && c.gloss) out.push(c.gloss);
  }
  if (pick.kind === 'set' && pick.gloss) out.push(pick.gloss);
  return out;
}

function axisFor(items, ctx) {
  let lo = Infinity, hi = -Infinity;
  for (const i of items) {
    if (Number.isFinite(i.takenYear)) lo = Math.min(lo, i.takenYear);
    if (Number.isFinite(i.leftYear)) hi = Math.max(hi, i.leftYear);
    if (Number.isFinite(i.takenYear)) hi = Math.max(hi, i.takenYear);
  }
  const b = (ctx.data && ctx.data.bounds) || { min: 1600, max: 2027 };
  if (!Number.isFinite(lo)) lo = b.min;
  if (!Number.isFinite(hi)) hi = b.max;
  const now = new Date().getFullYear();
  const open = items.some((i) => !Number.isFinite(i.leftYear));
  if (open) hi = Math.max(hi, now);
  lo = Math.floor(lo / 50) * 50;
  hi = Math.ceil(hi / 50) * 50;
  if (hi - lo < 100) hi = lo + 100;
  return [lo, hi];
}

function axisHead(a0, a1, format) {
  const wrap = el('div.mx-axw');
  wrap.append(el('p.mx-ax__k', { text: 'when each of them was British' }));
  const n = el('div.mx-ax', { 'aria-hidden': 'true' });
  const step = (a1 - a0) > 400 ? 100 : (a1 - a0) > 200 ? 100 : 50;
  for (let y = a0; y <= a1; y += step) {
    n.append(el('span.mx-ax__t', { style: { left: pct(y, a0, a1) } }, el('span.num', { text: String(y) })));
  }
  wrap.append(n);
  return wrap;
}

const pct = (y, a0, a1) => (((y - a0) / (a1 - a0)) * 100).toFixed(2) + '%';

function row(item, a0, a1, m, ctx) {
  const { format, onSelect } = ctx;
  const li = el('li.mx-i', { dataset: { dep: item.dep } });

  const left = Number.isFinite(item.leftYear) ? item.leftYear : a1;
  const l = ((Math.max(a0, item.takenYear ?? a0) - a0) / (a1 - a0)) * 100;
  const w = Math.max(0.8, ((left - Math.max(a0, item.takenYear ?? a0)) / (a1 - a0)) * 100);

  const from = (item.takenFrom || []).filter((c) => c && c.name && c.kind !== 'no-resident-population');
  const b = el('button.mx-i__b', {
    type: 'button',
    onclick: () => onSelect(item.territoryId),
    'aria-label': item.name + ', British '
      + (item.takenYear ?? '?') + ' to ' + (Number.isFinite(item.leftYear) ? item.leftYear : 'today')
      + '. Taken from ' + (from.length ? from.map((c) => c.name).join(', ') : 'a party this atlas does not name')
      + '. Left by ' + depLabel(item.dep) + '. Open its dossier.',
  });
  b.append(el('span.mx-i__n', { text: item.name }));
  b.append(el('span.num.mx-i__y', {
    text: (item.takenYear ?? '?') + '–' + (Number.isFinite(item.leftYear) ? item.leftYear : 'now'),
  }));
  b.append(el('span.mx-i__sp', {
    'aria-hidden': 'true',
    dataset: { open: Number.isFinite(item.leftYear) ? 'no' : 'yes' },
    style: { left: l.toFixed(2) + '%', width: w.toFixed(2) + '%' },
  }));
  li.append(b);

  /* Who lost it, on the line under its name. A place in this list without
     this line is a place whose record names nobody, and it says so. */
  const fl = el('p.mx-i__from');
  fl.append(el('span.mx-i__k', { text: 'from' }), ' ');
  fl.append(from.length
    ? el('span.mx-i__fv', { text: from.map((c) => c.name).join(' · ') })
    : el('span.cx-note', { text: 'no counterparty on this record' }));
  li.append(fl);

  const toll = tollOf(item);
  if (toll) {
    const t = el('p.mx-i__t');
    t.append(el('span.mx-i__k', { text: 'the leaving cost' }), ' ');
    if (toll.lo != null || toll.hi != null) {
      t.append(el('span.num', { text: range(toll.lo, toll.hi, format) }));
      t.append(' dead');
    }
    if (toll.dLo != null || toll.dHi != null) {
      if (toll.lo != null) t.append(', ');
      t.append(el('span.num', { text: range(toll.dLo, toll.dHi, format) }));
      t.append(' displaced');
    }
    t.append('. ');
    if (toll.note) t.append(note(toll.note));
    li.append(t);
  }
  return li;
}

/**
 * A toll's note is why the figure is a range, and it is often a paragraph. The
 * range itself is never hidden; the reasoning opens in place, in one click,
 * and closes nothing behind a hover.
 */
function note(text) {
  const s = String(text);
  const cut = s.indexOf('. ');
  const head = (cut > 40 && cut < s.length - 2) ? s.slice(0, cut + 1) : s;
  const wrap = el('span.mx-i__note.cx-note');
  wrap.append(document.createTextNode(head));
  if (head.length < s.length) {
    const rest = el('span', { text: ' ' + s.slice(head.length).trim(), hidden: true });
    const more = el('button.cx-more.mx-i__more', { type: 'button' }, el('span', { text: 'why that range' }));
    more.addEventListener('click', () => { rest.hidden = false; more.remove(); });
    wrap.append(rest, ' ', more);
  }
  return wrap;
}

function range(lo, hi, format) {
  if (lo == null && hi == null) return 'no figure';
  if (lo == null) return 'up to ' + format.number(hi);
  if (hi == null || hi === lo) return format.number(lo);
  return format.number(lo) + '–' + format.number(hi);
}

/* ============================================== the map's own sentence == */

/**
 * The map paints at the year on the clock, and a set that spans three
 * centuries will never all be on the plate at once. Say which is which.
 */
export function mapNote(items, drawn, asked, year, format) {
  const spanLo = items.reduce((a, i) => Math.min(a, i.takenYear ?? a), Infinity);
  const open = items.some((i) => !Number.isFinite(i.leftYear));
  const spanHi = items.reduce((a, i) => Math.max(a, Number.isFinite(i.leftYear) ? i.leftYear : -Infinity), -Infinity);
  const to = open ? 'today' : String(spanHi);
  const parts = [];
  parts.push('These ' + format.number(items.length) + ' places cover ' + format.number(asked)
    + ' pieces of this atlas\u2019s geometry; ' + format.number(drawn) + ' of them are drawn at ' + year + '.');
  if (drawn < asked) {
    parts.push('The rest were taken later or gone earlier. The list below holds every one of the '
      + format.number(items.length) + ', on a single axis from ' + spanLo + ' to ' + to + '.');
  }
  return parts.join(' ');
}
