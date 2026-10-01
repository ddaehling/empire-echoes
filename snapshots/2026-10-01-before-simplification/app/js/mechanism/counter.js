/**
 * mechanism/counter.js — the counter-line.
 *
 * FEATURE_SPEC charge 6: "Sorting by 'how it left' is followed, unskippably,
 * by the counter-line: mostly negotiated — and Kenya, Malaya, Cyprus, Aden,
 * Palestine."
 *
 * Unskippable here means what the layout budget means by it: the block is in
 * normal flow, directly under the table, at reading size, with no dismiss
 * control, no accordion and nothing behind a hover. Sort the columns and it is
 * there; it stays there for the rest of the session.
 *
 * Not one figure below is typed in. The largest column is found by counting,
 * the share is computed against the places that actually became countries, and
 * the five names are looked up in the dataset — a name this atlas does not
 * hold is reported as missing rather than quietly dropped.
 */

import { el } from '../core/util.js';
import { depLabel, tollOf, BECAME_INDEPENDENT } from './matrix.js';

/* The five the word hides. Ids first, then a name match, so a shard rename
   downgrades this to an honest "not in this atlas" rather than a lie. */
const FIVE = [
  { key: 'Kenya', ids: ['kenya'] },
  { key: 'Malaya', ids: ['federation-of-malaya', 'federated-malay-states'] },
  { key: 'Cyprus', ids: ['cyprus'] },
  { key: 'Aden', ids: ['aden-colony', 'aden-protectorate'] },
  { key: 'Palestine', ids: ['mandatory-palestine'] },
];

/**
 * The five, resolved against the running dataset. Exported so the module can
 * rebuild the same set from a URL (`#filter=mech:open,mechSet:five`) without
 * rendering the counter-line first.
 */
export function findFive(m) {
  const found = [], missing = [];
  for (const f of FIVE) {
    let hit = null;
    for (const id of f.ids) {
      for (const c of m.cells.values()) {
        const it = c.items.find((x) => x.territoryId === id);
        if (it) { hit = it; break; }
      }
      if (hit) break;
    }
    if (hit) found.push({ key: f.key, item: hit });
    else missing.push(f.key);
  }
  return { found, missing };
}

export function renderCounter(m, ctx) {
  const { format, onPaint, onSelect } = ctx;
  const num = (n) => format.number(n);

  const biggest = m.cols.slice().sort((a, b) => b.total - a.total)[0];
  const indep = m.cols.filter((c) => BECAME_INDEPENDENT.has(c.id));
  const indepTotal = indep.reduce((s, c) => s + c.total, 0);
  const share = indepTotal ? biggest.total / indepTotal : 0;

  const box = el('aside.mx-cn.cx-panel', { role: 'note' });
  box.append(el('p.cx-panel__head', { text: 'read the biggest column again' }));

  const lead = el('p.mx-cn__lead');
  lead.append(el('b', { text: 'Mostly ' + biggest.short + '. ' }));
  lead.append(el('span.num', { text: num(biggest.total) }));
  lead.append(' of the ');
  lead.append(el('span.num', { text: num(indepTotal) }));
  lead.append(' places that left British rule to become countries did it by ');
  lead.append(biggest.label);
  lead.append(' — ');
  lead.append(el('span.num', { text: format.percent(share) }));
  lead.append(' of them. That is the true answer and it is the wrong lesson.');
  box.append(lead);

  const { found, missing } = findFive(m);

  /* Which columns the five actually fall in is counted, not asserted: if a
     shard reclassifies Aden tomorrow this sentence changes with it. */
  const spread = new Map();
  for (const f of found) spread.set(f.item.dep, (spread.get(f.item.dep) || 0) + 1);
  const clauses = [...spread.entries()].sort((a, b) => b[1] - a[1]);

  const p2 = el('p.mx-cn__p');
  p2.append('Now read ');
  p2.append(el('span.num', { text: num(found.length) }));
  p2.append(' of them off the same table: ');
  p2.append(el('b', { text: found.map((f) => f.key).join(', ') }));
  p2.append('. They are not in one column \u2014 ');
  clauses.forEach(([dep, n], i) => {
    if (i) p2.append(i === clauses.length - 1 ? ' and ' : ', ');
    p2.append(el('span.num', { text: num(n) }));
    p2.append((n === 1 ? ' in ' : ' in ') + depLabel(dep));
  });
  p2.append('.');
  box.append(p2);

  /* The one inside the biggest column is the whole argument, so it gets its
     own departure record printed in the dataset's own words rather than a
     characterisation of mine. */
  const inside = found.find((f) => f.item.dep === biggest.id);
  if (inside && inside.item.leftHow) {
    const q = el('p.mx-cn__inside');
    q.append(el('b', { text: inside.key + ' is inside that column. ' }));
    q.append('This atlas\u2019s own record of the handover reads: ');
    q.append(el('span.mx-cn__q', { text: '\u201c' + inside.item.leftHow + '\u201d' }));
    box.append(q);
  }

  const ul = el('ul.mx-cn__l');
  for (const f of found) {
    const it = f.item;
    const li = el('li.mx-cn__i');
    li.append(el('button.mx-link', { type: 'button', onclick: () => onSelect(it.territoryId) }, f.key));
    li.append(' · ');
    li.append(el('span.mx-cn__mech', { text: depLabel(it.dep) }));
    li.append(' · ');
    li.append(el('span.num', { text: String(it.leftYear ?? '—') }));
    const t = tollOf(it);
    if (t) {
      li.append(' · ');
      li.append(el('span.num', { text: rng(t.lo, t.hi, format) + ' dead' }));
      if (t.dLo != null || t.dHi != null) li.append(el('span.num', { text: ', ' + rng(t.dLo, t.dHi, format) + ' displaced' }));
    } else {
      li.append(' · ');
      li.append(el('span.cx-note', { text: 'no toll recorded on this departure' }));
    }
    if (it.dep === biggest.id) {
      li.append(el('span.mx-cn__flag', { text: 'in the big column' }));
    }
    ul.append(li);
  }
  box.append(ul);
  if (missing.length) {
    box.append(el('p.cx-note.cx-note--warn', { text: 'Not in this atlas under a name I could match: ' + missing.join(', ') + '. The line above is short by that many, and says so.' }));
  }

  /* How many places in the biggest column carry a death toll of their own.
     This is the sentence that stops "negotiated" from meaning "quiet". */
  const col = m.itemsInCol(biggest.id);
  const tolled = col.filter((i) => tollOf(i));
  if (tolled.length) {
    const p3 = el('p.mx-cn__p');
    p3.append(el('span.num', { text: num(tolled.length) }));
    p3.append(' of the ');
    p3.append(el('span.num', { text: num(col.length) }));
    p3.append(' places in that column record deaths in the leaving, from ');
    const lows = tolled.map((i) => tollOf(i).lo).filter((n) => n != null).sort((a, b) => a - b);
    p3.append(el('span.num', { text: num(lows[0]) }));
    p3.append(' in one case to ');
    p3.append(el('span.num', { text: num(lows[lows.length - 1]) }));
    p3.append(' in another. ');
    p3.append(el('b', { text: '“Negotiated” is a column heading, not a description of the years before it.' }));
    box.append(p3);
  }

  box.append(el('button.cx-more.mx-cn__go', {
    type: 'button',
    onclick: () => onPaint('five'),
  }, el('span', { text: 'put those ' + format.plural(found.length, 'place', 'places') + ' on the map' })));

  return box;
}

function rng(lo, hi, format) {
  if (lo == null && hi == null) return 'no figure';
  if (lo == null) return 'up to ' + format.number(hi);
  if (hi == null || hi === lo) return format.number(lo);
  return format.number(lo) + '–' + format.number(hi);
}
