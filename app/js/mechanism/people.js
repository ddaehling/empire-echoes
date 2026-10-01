/**
 * mechanism/people.js — count the same table again, in people.
 *
 * THE PROBLEM THIS FIXES. The matrix counts places, and so does every sentence
 * built on it: "105 of the 149 places that left to become countries did it by
 * negotiated independence — 70 % of them." That is true, and as a lesson it is
 * close to the opposite of the truth, because the unit is wrong. One line for
 * Ascension and one line for British India. Sorting by "how it left" and
 * reading the biggest column is exactly the reasoning a printed table invites
 * and cannot correct.
 *
 * So: the same six columns, recounted in people, drawn as two rails on one
 * scale, and the biggest column changes. Places says negotiated independence.
 * People says partition. Nothing in the dataset changed; the denominator did.
 *
 * WHAT IS COUNTED, AND WHAT IS NOT — all four rules are printed on screen:
 *
 *  1. Only the columns in which a place left to become a country
 *     (`BECAME_INDEPENDENT`), which is the same denominator the counter-line
 *     already uses. Merged, handed on and still-British are named and dropped.
 *  2. Only territories this atlas does not nest inside another
 *     (`territory.nestedWithin`). Bengal Presidency's 60.3 million are inside
 *     British India's 389 million; adding both counts the same people twice.
 *     The excluded places are counted, named and totalled on screen.
 *  3. `peak.population` — the highest figure this atlas records for a place,
 *     in the year it records for it. The years run across two centuries, so
 *     the sum is not a census and the UI says so.
 *  4. A place with no population figure is missing from the people rail and
 *     present in the places rail, and is named. It is never counted as zero.
 *
 * Nothing here writes a total down. Every figure is recounted on the running
 * dataset each time the block is drawn.
 */

import { el } from '../core/util.js';
import { BECAME_INDEPENDENT } from './matrix.js';

export const PEOPLE_CLAIM = 'p09:mechanism:people';

const num = (d) => (Number.isFinite(d) ? d : null);

/** A share that never rounds a real quantity down to nothing. */
function share(v, format) {
  if (!Number.isFinite(v) || v <= 0) return '0%';
  if (v < 0.005) return 'under 1%';
  if (v < 0.095) return format.percent(v, { dp: 1 });
  return format.percent(v);
}

/* ------------------------------------------------------------ counting -- */

/**
 * countPeople(matrix, data) — the whole computation, no DOM.
 * Returns null if the dataset carries no population figures at all, so the
 * block can be absent rather than empty.
 */
export function countPeople(m, data) {
  const byId = data && data.byId;
  const get = (id) => (byId && typeof byId.get === 'function' ? byId.get(id) : (byId || {})[id]);

  const cols = [];
  const nestedOut = [];
  const noFigure = [];
  const zeroFigure = [];        // a recorded 0 is a hole wearing a number
  let places = 0, people = 0, tablePlaces = 0;
  let yLo = Infinity, yHi = -Infinity;
  let largest = null, smallest = null;
  const dropped = [];

  for (const c of m.cols) {
    if (!BECAME_INDEPENDENT.has(c.id)) { if (c.total) dropped.push(c); continue; }
    const row = {
      id: c.id, label: c.label, short: c.short,
      tableTotal: c.total,          // what the table prints for this column
      places: 0, people: 0, nested: 0, missing: [],
    };
    for (const it of m.itemsInCol(c.id)) {
      const t = get(it.territoryId);
      const pk = (t && t.peak) || null;
      const raw = pk ? num(pk.population) : null;
      /* A peak population of nought cannot be added to a people count. It is
         either an unknown or, on the informal-influence rows, a place where
         Britain governed nobody. Either way it is absence, and absence is not
         drawn as zero — so it leaves the people rail by the same door as a
         missing figure, and is named separately on screen. */
      const P = raw != null && raw > 0 ? raw : null;

      if (t && t.nestedWithin) {
        row.nested++;
        const host = get(t.nestedWithin);
        nestedOut.push({
          name: it.name, territoryId: it.territoryId,
          within: (host && host.name) || t.nestedWithin, pop: P,
        });
        continue;
      }

      row.places++; places++;
      if (P == null) {
        row.missing.push(it.name);
        (raw === 0 ? zeroFigure : noFigure).push(it.name);
        continue;
      }
      row.people += P; people += P;
      const py = pk ? num(pk.populationYear) : null;
      if (py != null) { if (py < yLo) yLo = py; if (py > yHi) yHi = py; }
      if (!smallest || P < smallest.pop) smallest = { name: it.name, territoryId: it.territoryId, pop: P };
      if (!largest || P > largest.pop) {
        largest = {
          name: it.name, territoryId: it.territoryId, pop: P, year: py,
          note: (pk && pk.populationNote) || null,
          col: c.id, colShort: c.short, colLabel: c.label,
          leftYear: num(it.leftYear),
          evidence: (t && t.evidence && t.evidence[0]) || null,
        };
      }
    }
    cols.push(row); tablePlaces += row.tableTotal;
  }

  if (!people || !places) return null;

  for (const r of cols) {
    r.placeShare = places ? r.places / places : 0;
    r.peopleShare = people ? r.people / people : 0;
  }
  nestedOut.sort((a, b) => (b.pop || 0) - (a.pop || 0));

  const byPlaces = cols.slice().sort((a, b) => b.places - a.places || b.people - a.people);
  const byPeople = cols.slice().sort((a, b) => b.people - a.people || b.places - a.places);

  /* The choices offered are the three biggest columns by place count plus
     whichever column is biggest by people, so the true answer is always on
     the list and the list is never written down. */
  const seen = new Set();
  const choices = [];
  for (const c of [...byPlaces.slice(0, 3), byPeople[0]]) {
    if (!c || seen.has(c.id)) continue;
    seen.add(c.id); choices.push(c);
  }
  choices.sort((a, b) => b.places - a.places);

  return {
    cols: byPlaces,
    choices,
    biggestByPlaces: byPlaces[0],
    biggestByPeople: byPeople[0],
    places, people, tablePlaces,
    nestedOut, noFigure, zeroFigure, dropped,
    yLo: Number.isFinite(yLo) ? yLo : null,
    yHi: Number.isFinite(yHi) ? yHi : null,
    largest, smallest,
  };
}

/* ------------------------------------------------------------- drawing -- */

/**
 * renderPeople(matrix, data, opts) — the block, sealed or open.
 *
 * opts: { format, said, onCommit(choice, right), onPick({kind,col}), onSelect(id) }
 * `said` is the label the reader already committed to, from the Ledger.
 */
export function renderPeople(m, data, opts) {
  const p = countPeople(m, data);
  if (!p) return null;
  const { format, said, onCommit, onPick, onSelect } = opts;
  const n = (v) => format.number(v);
  const pc = (v) => share(v, format);

  const box = el('section.mx-pp.cx-panel', { 'aria-label': 'The same table counted in people' });
  box.append(el('p.cx-panel__head', { text: 'count the same table again, in people' }));

  const big = p.biggestByPlaces;
  const lead = el('p.mx-pp__lead');
  lead.append('The table counts places, and its biggest column is ');
  lead.append(el('b', { text: big.label }));
  lead.append(' with ');
  lead.append(el('span.num', { text: n(big.tableTotal) }));
  lead.append(' of them. Every place is one line, whatever size it was');
  if (p.largest && p.smallest) {
    lead.append(': ');
    lead.append(el('b', { text: p.smallest.name }));
    lead.append(' (');
    lead.append(el('span.num', { text: n(p.smallest.pop) }));
    lead.append(' people at its peak) is one line, and ');
    lead.append(el('b', { text: p.largest.name }));
    lead.append(' (');
    lead.append(el('span.num', { text: n(p.largest.pop) }));
    lead.append(') is one line');
  }
  lead.append('.');
  box.append(lead);

  /* --- sealed: the question ----------------------------------------- */
  if (!said) {
    const ask = el('div.cx-ask.mx-pp__ask');
    ask.append(el('p.cx-ask__eyebrow', { text: 'change the unit before you look' }));
    ask.append(el('p.cx-ask__q',
      'Now count people instead of places — each place at the highest population this atlas records for it. Which way out of the empire took the most people with it?'));
    const ch = el('div.cx-ask__choices');
    for (const c of p.choices) {
      ch.append(el('button.mx-ch', {
        type: 'button',
        onclick: () => onCommit(c, p.biggestByPeople),
      }, c.label));
    }
    ask.append(ch);
    box.append(ask);
    box.append(el('p.cx-note', { text: 'The rails below are covered until you commit. It is a one-in-four guess; the point is to have one.' }));
    return box;
  }

  /* --- open: what you said, then the two rails ----------------------- */
  const right = p.biggestByPeople;
  const ok = said === right.label;
  const sd = el('p.mx-said');
  sd.append(el('span.mx-said__k', { text: 'you said' }), ' ');
  sd.append(el('b', { text: said }));
  sd.append('. It is ');
  sd.append(el('b', { text: right.label }));
  sd.append(' — ');
  sd.append(el('span.num', { text: n(right.people) }));
  sd.append(' people in ');
  sd.append(el('span.num', { text: n(right.places) }));
  sd.append(right.places === 1 ? ' place' : ' places');
  if (right.tableTotal !== right.places) {
    sd.append(', out of the ');
    sd.append(el('span.num', { text: n(right.tableTotal) }));
    sd.append(' the table puts in that column');
  }
  sd.append(ok ? '. You had it.' : '.');
  box.append(sd);

  box.append(rails(p, { format, onPick }));

  /* --- the sentence the two rails make ------------------------------- */
  const swap = el('p.mx-pp__swap');
  swap.append(el('b', { text: 'Change the unit and the biggest column changes. ' }));
  swap.append('Counted in places, ');
  swap.append(el('span.mx-pp__c', { text: p.biggestByPlaces.label }));
  swap.append(' takes ');
  swap.append(el('span.num', { text: pc(p.biggestByPlaces.placeShare) }));
  swap.append(' and ');
  swap.append(el('span.mx-pp__c', { text: right.label }));
  swap.append(' takes ');
  swap.append(el('span.num', { text: pc(right.placeShare) }));
  swap.append('. Counted in people, ');
  swap.append(el('span.mx-pp__c', { text: right.label }));
  swap.append(' takes ');
  swap.append(el('span.num', { text: pc(right.peopleShare) }));
  swap.append(' and ');
  swap.append(el('span.mx-pp__c', { text: p.biggestByPlaces.label }));
  swap.append(' takes ');
  swap.append(el('span.num', { text: pc(p.biggestByPlaces.peopleShare) }));
  swap.append('. Nothing in the dataset moved. The denominator did.');
  box.append(swap);

  /* --- the one place that carries the reversal ----------------------- */
  if (p.largest) {
    const L = p.largest;
    const one = el('p.mx-pp__one');
    one.append(el('button.mx-link', { type: 'button', onclick: () => onSelect(L.territoryId) }, L.name));
    one.append(' is ');
    one.append(el('span.num', { text: n(L.pop) }));
    one.append(' of those ');
    one.append(el('span.num', { text: n(p.people) }));
    one.append(' on its own — ');
    one.append(el('b', { text: pc(L.pop / p.people) }));
    one.append(' of everyone in this count');
    if (L.leftYear != null) {
      one.append(', and it left in ');
      one.append(el('span.num', { text: String(L.leftYear) }));
    }
    one.append('. One territory, one column, in a single year.');
    box.append(one);
    if (L.note) {
      const pv = el('p.cx-note.mx-pp__prov');
      pv.append(el('span.num', { text: n(L.pop) }));
      pv.append(' — ' + L.note);
      box.append(pv);
    }
    if (L.evidence) {
      const cite = el('p.cx-src.mx-pp__src');
      cite.append(el('span.cx-src__kind', { text: L.evidence.kind || 'book' }), ' ');
      cite.append(el('cite', { text: L.evidence.work || '' }));
      if (L.evidence.author) { cite.append(' — '); cite.append(L.evidence.author); }
      if (L.evidence.year) { cite.append(' '); cite.append(el('span.num', { text: String(L.evidence.year) })); }
      /* `supports` says what the work is cited FOR, which here is not the
         census figure — printing it stops the citation from claiming more
         than it holds. */
      cite.append(el('span.mx-pp__for', {
        text: ' \u00b7 this atlas cites it for: ' + (L.evidence.supports || 'this territory'),
      }));
      box.append(cite);
    }
  }

  box.append(notes(p, format));
  return box;
}

/* ---------------------------------------------------------- the rails --- */

function rails(p, { format, onPick }) {
  const n = (v) => format.number(v);
  const pc = (v) => share(v, format);
  const list = el('ol.mx-pp__l');

  for (const c of p.cols) {
    const li = el('li.mx-pp__r', {
      dataset: {
        col: c.id,
        lead: c.id === p.biggestByPeople.id ? 'people' : c.id === p.biggestByPlaces.id ? 'places' : '',
      },
    });
    li.append(el('button.mx-pp__nm', {
      type: 'button',
      'aria-label': c.label + ': ' + n(c.places) + ' ' + format.plural(c.places, 'place', 'places')
        + ', ' + n(c.people) + ' people. Show them on the map.',
      onclick: () => onPick({ kind: 'col', col: c.id }),
    }, c.short));

    li.append(bar('places', c.placeShare, n(c.places) + ' · ' + pc(c.placeShare), false));

    const allMissing = c.people === 0 && c.missing.length > 0;
    li.append(allMissing
      ? el('div.mx-pp__b', { dataset: { k: 'people' } },
        el('span.mx-pp__k', { text: 'people' }),
        el('span.mx-pp__none', { text: 'no figure in this atlas for any of them' }))
      : bar('people', c.peopleShare, format.compact(c.people) + ' · ' + pc(c.peopleShare), true));

    list.append(li);
  }
  return list;
}

function bar(kind, share, label, isPeople) {
  const row = el('div.mx-pp__b', { dataset: { k: kind } });
  row.append(el('span.mx-pp__k', { text: kind }));
  const track = el('span.mx-pp__t', { 'aria-hidden': 'true' });
  track.append(el('i.mx-pp__f', {
    dataset: { k: isPeople ? 'people' : 'places' },
    style: { width: Math.max(0.6, share * 100) + '%' },
  }));
  row.append(track);
  row.append(el('span.mx-pp__v.num', { text: label }));
  return row;
}

/* ---------------------------------------------------------- the rules --- */

function notes(p, format) {
  const n = (v) => format.number(v);
  const wrap = el('div.mx-pp__notes');

  const a = el('p.cx-note');
  a.append('Each place at its own peak — the highest population this atlas records for it');
  if (p.yLo != null && p.yHi != null) {
    a.append(', in years from ');
    a.append(el('span.num', { text: String(p.yLo) }));
    a.append(' to ');
    a.append(el('span.num', { text: String(p.yHi) }));
  }
  a.append('. Not one census: read the rails as orders of magnitude.');
  wrap.append(a);

  const b = el('p.cx-note');
  if (p.nestedOut.length) {
    const top = p.nestedOut.find((x) => x.pop);
    b.append('The rails hold ');
    b.append(el('span.num', { text: n(p.places) }));
    b.append(' places, not the table\u2019s ');
    b.append(el('span.num', { text: n(p.tablePlaces) }));
    b.append(': ');
    b.append(el('span.num', { text: n(p.nestedOut.length) }));
    b.append(' nested ' + (p.nestedOut.length === 1 ? 'place is' : 'places are') + ' left out so nobody is counted twice');
    if (top) {
      b.append(' — ' + top.name + '\u2019s ');
      b.append(el('span.num', { text: n(top.pop) }));
      b.append(' are already inside ' + top.within);
    }
    b.append('. ');
  }
  if (p.dropped.length) {
    b.append(el('span.num', { text: n(p.dropped.length) }));
    b.append(p.dropped.length === 1 ? ' way out is not counted at all — ' : ' ways out are not counted at all — ');
    b.append(p.dropped.map((d) => d.short).join(', '));
    b.append(' — because those places did not become countries. ');
  }
  if (p.noFigure.length || p.zeroFigure.length) {
    const bits = [];
    if (p.noFigure.length) bits.push(format.plural(p.noFigure.length, 'place', 'places') + ' carry no population figure (' + p.noFigure.join(', ') + ')');
    if (p.zeroFigure.length) bits.push(format.plural(p.zeroFigure.length, 'place', 'places') + ' record a peak of nought — unknown, or nobody Britain governed (' + p.zeroFigure.join(', ') + ')');
    b.append(bits.join(', and ') + '. All of them are in the places rail and absent from the people one; none is counted as zero.');
  }
  if (b.childNodes.length) wrap.append(b);

  return wrap;
}
