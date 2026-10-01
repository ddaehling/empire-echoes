/**
 * mechanism/counterparty.js — count the same table again, by who lost.
 *
 * THE PROBLEM THIS FIXES, AND IT IS THIS PIECE'S OWN.
 *
 * Every row of the matrix names a thing Britain did: conquest, a purchase, a
 * treaty, a war settlement. Not one row name says who was on the other side of
 * it. A reader who learns the row names has learned a vocabulary in which
 * Britain is the only actor — which is M17 exactly, committed by the table
 * that exists to defeat M3 and M14.
 *
 * And the vocabulary is not merely silent, it leans. Three of the glosses on
 * these rows used to say "another European power" out loud. The dataset
 * disagrees with all three. The row this atlas calls `war settlement` holds
 * four places — Punjab, Assam, British Burma, Bhutan — and not one of them was
 * signed by a European. `lease` holds three and none of them either. Counted
 * across the whole table, two thirds of it has no European power on the other
 * side at all.
 *
 * So the same 259 places are counted a third time. Not by place (the table),
 * not by person (people.js), but by counterparty — and the reader commits to a
 * share before the rails are drawn, because the wrong answer here is the
 * default mental model of empire as a European card game.
 *
 * WHAT IS COUNTED, AND WHAT REFUSES TO BE — printed on screen, all of it:
 *
 *  1. The counterparties of each place's FIRST acquisition, which is the same
 *     record the table's row already comes from. One place, one mark, as above.
 *  2. `european-power` is a clean label: a European or American state. Counted.
 *  3. `indigenous-people`, `indigenous-polity` and `regional-state` are clean
 *     the other way: somebody already on the ground. Counted together, and the
 *     three are never merged in the prose.
 *  4. `empire`, `chartered-company` and `other` CANNOT be sorted by their
 *     label. `empire` holds the Mughals, the Qing and the Ottomans alongside
 *     the German and Spanish empires; `chartered-company` holds the Dutch East
 *     India Company and the Hudson's Bay Company. A place whose record carries
 *     only those labels is set aside, counted, and named on screen. It is never
 *     silently pushed to whichever side would make the finding louder.
 *
 * Nothing here writes a total down. Every figure is recounted on the running
 * dataset each time the block is drawn.
 */

import { el } from '../core/util.js';
import { countPeople } from './people.js';

export const CP_CLAIM = 'p09:mechanism:counterparty';

/* The three labels that mean "already living here". Kept apart in the prose,
   added together only for the rail, and named where they are added. */
const LOCAL = ['indigenous-polity', 'indigenous-people', 'regional-state'];
const EURO = 'european-power';
const NOBODY = 'no-resident-population';

/* What each label is, in the reader's words rather than the schema's. */
export const KIND = {
  'european-power': 'a European or American state',
  'indigenous-polity': 'a polity already there',
  'indigenous-people': 'a people already there',
  'regional-state': 'a regional state or kingdom',
  'empire': 'another empire',
  'chartered-company': 'a chartered company',
  'no-resident-population': 'nobody living there',
  'other': 'something else, named on the record',
};

/* Four answers, defined as shares so the right one is found by counting. */
export const CP_BUCKETS = [
  { id: 'most', label: 'nearly all of them', min: 0.80, max: 1.01 },
  { id: 'two', label: 'about two thirds', min: 0.50, max: 0.80 },
  { id: 'third', label: 'about a third', min: 0.18, max: 0.50 },
  { id: 'few', label: 'fewer than one in five', min: -1, max: 0.18 },
];

/* ------------------------------------------------------------ counting -- */

/**
 * countCounterparties(m) — the whole computation, no DOM.
 * Returns null if the dataset records no counterparties at all, so the block
 * can be absent rather than empty.
 */
export function countCounterparties(m) {
  const bands = {
    euroOnly: { id: 'euroOnly', label: 'a European power, and nobody already there', items: [] },
    both: { id: 'both', label: 'a European power AND people already there', items: [] },
    localOnly: { id: 'localOnly', label: 'only a state, a kingdom or a people already there', items: [] },
    nobody: { id: 'nobody', label: 'nobody living there, on the record', items: [] },
    unsorted: { id: 'unsorted', label: 'a label this count will not sort', items: [] },
  };
  const kindCount = new Map();     // kind -> places whose record carries it
  const rows = new Map();          // acquisition mechanism -> { n, euro, local }
  const names = new Map();         // counterparty name -> { name, kind, places[] }
  let counted = 0, withRecord = 0, nobody = 0;

  for (const c of m.cells.values()) {
    for (const it of c.items) {
      counted++;
      const cps = Array.isArray(it.takenFrom) ? it.takenFrom.filter((x) => x && x.name) : [];
      if (cps.length) withRecord++;
      const kinds = new Set(cps.map((x) => x.kind || 'other'));
      for (const k of kinds) kindCount.set(k, (kindCount.get(k) || 0) + 1);
      if (kinds.has(NOBODY)) nobody++;

      const euro = kinds.has(EURO);
      const local = LOCAL.some((k) => kinds.has(k));

      /* Neither European nor already-there splits again, because "nobody was
         living here" is a clean finding and "another empire / a company /
         something else" is an unsortable label, and merging them would file
         Bermuda with the Mughal Empire. */
      const band = euro && local ? bands.both
        : euro ? bands.euroOnly
          : local ? bands.localOnly
            : kinds.has(NOBODY) ? bands.nobody : bands.unsorted;
      band.items.push(it);

      let r = rows.get(it.acq);
      if (!r) { r = { id: it.acq, n: 0, euro: 0, local: 0, unsorted: 0 }; rows.set(it.acq, r); }
      r.n++; if (euro) r.euro++; if (local) r.local++;
      if (!euro && !local) r.unsorted++;

      for (const cp of cps) {
        const key = cp.name;
        let e = names.get(key);
        if (!e) { e = { name: cp.name, kind: cp.kind || 'other', places: [] }; names.set(key, e); }
        e.places.push(it);
      }
    }
  }

  if (!counted || !withRecord) return null;

  const list = [bands.euroOnly, bands.both, bands.localOnly, bands.nobody, bands.unsorted];
  for (const b of list) { b.n = b.items.length; b.share = counted ? b.n / counted : 0; }

  const euroAny = bands.euroOnly.n + bands.both.n;
  const localAny = bands.localOnly.n + bands.both.n;

  /* The row whose name most badly outruns its counterparties: the biggest row
     with a total of zero European counterparties. The sentence built on it is
     therefore found, not written down, and disappears if the data changes. */
  const rowList = m.rows
    .map((r) => ({ ...r, ...(rows.get(r.id) || { n: 0, euro: 0, local: 0, unsorted: 0 }) }))
    .filter((r) => r.n > 0);
  const noEuro = rowList.filter((r) => r.euro === 0 && r.local > 0).sort((a, b) => b.n - a.n);

  /* Who is named most often on the other side, ignoring the labels that carry
     no person — the roster M17 asks every surface to keep. */
  const roster = [...names.values()]
    .filter((e) => e.kind !== NOBODY)
    .sort((a, b) => b.places.length - a.places.length || a.name.localeCompare(b.name));

  return {
    counted, withRecord, nobody,
    bands: list,
    euroOnly: bands.euroOnly, both: bands.both, localOnly: bands.localOnly,
    nobodyBand: bands.nobody, unsorted: bands.unsorted,
    euroAny, localAny,
    euroShare: counted ? euroAny / counted : 0,
    localShare: counted ? localAny / counted : 0,
    kindCount,
    rows: rowList.sort((a, b) => b.n - a.n),
    noEuro,
    roster,
  };
}

/**
 * Who was on the other side of one pick — used by the detail block, which asks
 * the same question of a row, a column or a single box.
 */
export function sideOf(items) {
  let euro = 0, local = 0, unsorted = 0, nobody = 0;
  const names = new Map();
  for (const it of (items || [])) {
    const cps = Array.isArray(it.takenFrom) ? it.takenFrom.filter((x) => x && x.name) : [];
    const kinds = new Set(cps.map((x) => x.kind || 'other'));
    const e = kinds.has(EURO), l = LOCAL.some((k) => kinds.has(k));
    if (e) euro++;
    if (l) local++;
    if (!e && !l) unsorted++;
    if (kinds.has(NOBODY)) nobody++;
    for (const cp of cps) {
      if (cp.kind === NOBODY) continue;
      const k = cp.name;
      const v = names.get(k) || { name: cp.name, kind: cp.kind || 'other', n: 0, lost: cp.lost || null };
      v.n++; names.set(k, v);
    }
  }
  return {
    n: (items || []).length, euro, local, unsorted, nobody,
    names: [...names.values()].sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)),
  };
}

/* ------------------------------------------------------------- drawing -- */

/**
 * renderCounterparty(matrix, opts) — the block, teased, sealed or open.
 *
 * opts: { format, said, staged, onOpen(), onCommit(choice, right), onSelect(id) }
 * `staged` false renders one `.cx-more` line instead of the block, so a reader
 * who has not yet answered the people question meets one question at a time
 * (LAYOUT_BUDGET §3: stage it, never shrink it).
 */
export function renderCounterparty(m, opts) {
  const p = countCounterparties(m);
  if (!p) return null;
  const { format, said, staged, data, onOpen, onCommit, onSelect } = opts;
  const n = (v) => format.number(v);
  const pc = (v) => (v > 0 && v < 0.005 ? 'under 1%' : format.percent(v));

  if (!staged) {
    const tease = el('p.mx-cp__tease');
    tease.append(el('button.cx-more', { type: 'button', onclick: onOpen },
      el('span', { text: 'count the same table a third time, by who was on the other side' })));
    return tease;
  }

  const box = el('section.mx-cp.cx-panel', { 'aria-label': 'The same table counted by counterparty' });
  box.append(el('p.cx-panel__head', { text: 'count the same table again, by who lost' }));

  const lead = el('p.mx-cp__lead');
  lead.append('Every row of this table names something ');
  lead.append(el('b', { text: 'Britain' }));
  lead.append(' did — conquest, a purchase, a treaty, a war settlement. Not one row name says who was on the other side of it. This atlas records that too: each of these ');
  lead.append(el('span.num', { text: n(p.counted) }));
  lead.append(' places carries the parties named on its first acquisition, and ');
  if (p.withRecord === p.counted) {
    lead.append(el('b', { text: 'every one' }));
    lead.append(' of them names at least one.');
  } else {
    lead.append(el('span.num', { text: n(p.withRecord) }));
    lead.append(' of them name at least one.');
  }
  box.append(lead);

  /* --- sealed: the question ------------------------------------------ */
  const right = CP_BUCKETS.find((b) => p.euroShare >= b.min && p.euroShare < b.max) || CP_BUCKETS[2];
  if (!said) {
    const ask = el('div.cx-ask.mx-cp__ask');
    ask.append(el('p.cx-ask__eyebrow', { text: 'before the rails are drawn' }));
    ask.append(el('p.cx-ask__q',
      'On how many of these ', el('span.num', { text: n(p.counted) }),
      ' places was there another ', el('b', { text: 'European power' }),
      ' on the other side — a place Britain took from France, Spain, the Netherlands, Denmark or another European or American state?'));
    const ch = el('div.cx-ask__choices');
    for (const b of CP_BUCKETS) {
      ch.append(el('button.mx-ch', { type: 'button', onclick: () => onCommit(b, right) }, b.label));
    }
    ask.append(ch);
    box.append(ask);
    box.append(el('p.cx-note', { text: 'The rails below are covered until you commit. Most readers guess high, and the reason they guess high is the row names.' }));
    return box;
  }

  /* --- open: what you said, then the four bands ---------------------- */
  const ok = said === right.label;
  const sd = el('p.mx-said');
  sd.append(el('span.mx-said__k', { text: 'you said' }), ' ');
  sd.append(el('b', { text: said }));
  sd.append('. It is ');
  sd.append(el('span.num', { text: n(p.euroAny) }));
  sd.append(' of ');
  sd.append(el('span.num', { text: n(p.counted) }));
  sd.append(' — ');
  sd.append(el('b', { text: right.label }));
  sd.append(ok ? '. You had it.' : '.');
  box.append(sd);

  box.append(bands(p, { format, onSelect }));

  /* --- the sentence the bands make ----------------------------------- */
  const swap = el('p.mx-cp__swap');
  swap.append(el('b', { text: 'The other side of this table is mostly not European. ' }));
  swap.append(el('span.num', { text: n(p.localOnly.n) }));
  swap.append(' of the ');
  swap.append(el('span.num', { text: n(p.counted) }));
  swap.append(' places — ');
  swap.append(el('span.num', { text: pc(p.localOnly.share) }));
  swap.append(' — were taken from a state, a kingdom or a people already living there, with no European power named on the record at all. ');
  swap.append(el('span.num', { text: n(p.euroOnly.n) }));
  swap.append(' changed hands between Europeans alone. ');
  swap.append('Read the row names again with that in front of you.');
  box.append(swap);

  /* --- the row whose name outruns its own counterparties -------------- */
  if (p.noEuro.length) {
    const r = p.noEuro[0];
    const audit = el('div.mx-cp__audit');
    const a1 = el('p.mx-cp__auditp');
    a1.append(el('b', { text: 'The sharpest case is this table’s own vocabulary. ' }));
    a1.append('The row it calls ');
    a1.append(el('span.mx-cp__rowname', { text: r.short }));
    a1.append(' holds ');
    a1.append(el('span.num', { text: n(r.n) }));
    a1.append(r.n === 1 ? ' place, and it was not signed by a European power. ' : ' places, and not one of them was signed by a European power. ');
    a1.append('Every one was signed by a state that had just been beaten:');
    audit.append(a1);

    const ul = el('ul.mx-cp__l');
    for (const it of m.itemsInRow(r.id)) {
      const cps = (it.takenFrom || []).filter((x) => x && x.name && x.kind !== NOBODY);
      const li = el('li.mx-cp__i');
      li.append(el('button.mx-link', { type: 'button', onclick: () => onSelect(it.territoryId) }, it.name));
      li.append(' · ');
      li.append(el('span.num', { text: String(it.takenYear ?? '?') }));
      li.append(' · ');
      li.append(el('span.mx-cp__from', { text: cps.length ? cps.map((c) => c.name).join('; ') : 'no counterparty on the record' }));
      ul.append(li);
    }
    audit.append(ul);

    if (p.noEuro.length > 1) {
      const a2 = el('p.cx-note');
      a2.append(p.noEuro.length === 2 ? 'One other row is the same: ' : (n(p.noEuro.length - 1) + ' other rows are the same: '));
      a2.append(p.noEuro.slice(1).map((x) => x.short + ' (' + x.n + ')').join(', '));
      a2.append('.');
      audit.append(a2);
    }
    box.append(audit);
  }

  /* --- the roster, and the shape of it -------------------------------- */
  if (p.roster.length) {
    const top = p.roster.filter((e) => e.places.length > 1).slice(0, 8);
    if (top.length) {
      const rp = el('p.mx-cp__roster');
      rp.append(el('span.mx-cp__k', { text: 'the names that recur' }), ' ');
      top.forEach((e, i) => {
        if (i) rp.append(' · ');
        rp.append(el('button.mx-link', {
          type: 'button',
          title: (KIND[e.kind] || e.kind) + ' — on ' + e.places.length + ' of these places. Open the first.',
          onclick: () => onSelect(e.places[0].territoryId),
        }, e.name));
        rp.append(el('span.num.mx-cp__n', { text: ' ' + e.places.length }));
      });
      box.append(rp);
    }
    /* That list is mostly European, and the reason is the whole point. Say it,
       with the count that makes it checkable. */
    const once = p.roster.filter((e) => e.places.length === 1).length;
    const total = el('p.mx-cp__shape');
    total.append('The names that recur are mostly European empires, and that is the shape of the thing rather than a correction to it: there were a few European empires and hundreds of everybody else. ');
    total.append(el('span.num', { text: n(p.roster.length) }));
    total.append(' distinct parties are named across these ');
    total.append(el('span.num', { text: n(p.counted) }));
    total.append(' acquisitions, and ');
    total.append(el('span.num', { text: n(once) }));
    total.append(' of them appear exactly once. A list of empires is short. A list of the people an empire was taken from is long, and this is that list.');
    box.append(total);
  }

  /* --- three counts of one table, in one sentence ---------------------- */
  /* C11. Nothing below is written down: the two earlier answers are looked up
     on the same running dataset the earlier blocks used, so if a shard changes
     the through-line changes with it or disappears. */
  const pe = data ? countPeople(m, data) : null;
  if (pe && pe.biggestByPlaces && pe.biggestByPeople) {
    const three = el('p.mx-cp__three');
    three.append(el('b', { text: 'Three counts of one table. ' }));
    three.append('Counted in places, the biggest way out is ');
    three.append(el('span.mx-cp__c', { text: pe.biggestByPlaces.label }));
    three.append('. Counted in people, it is ');
    three.append(el('span.mx-cp__c', { text: pe.biggestByPeople.label }));
    three.append('. Counted by who was on the other side, it is not Europe: a state, a kingdom or a people already living there is named on ');
    three.append(el('span.num', { text: pc(p.localShare) }));
    three.append(' of these records, and on ');
    three.append(el('span.num', { text: pc(p.localOnly.share) }));
    three.append(' of them with no European power beside it. ');
    three.append(el('b', { text: 'Nothing in the dataset moved. The question did.' }));
    box.append(three);
  }

  /* --- the same count, row by row, checkable -------------------------- */
  box.append(rowTable(p, m, format));

  /* --- how it was counted, and what refused ---------------------------- */
  box.append(rules(p, format));
  return box;
}

/* ---------------------------------------------------------- the bands --- */

function bands(p, { format, onSelect }) {
  const n = (v) => format.number(v);
  const pc = (v) => (v > 0 && v < 0.005 ? 'under 1%' : format.percent(v));
  const list = el('ol.mx-cp__bands');

  for (const b of p.bands) {
    if (!b.n && (b.id === 'unsorted' || b.id === 'nobody')) continue;
    const li = el('li.mx-cp__band', { dataset: { band: b.id, lead: b.id === 'localOnly' ? 'yes' : '' } });
    li.append(el('span.mx-cp__bl', { text: b.label }));
    const track = el('span.mx-cp__t', { 'aria-hidden': 'true' });
    track.append(el('i.mx-cp__f', { dataset: { band: b.id }, style: { width: Math.max(0.6, b.share * 100) + '%' } }));
    li.append(track);
    li.append(el('span.mx-cp__v.num', { text: n(b.n) + ' · ' + pc(b.share) }));
    li.append(el('span.mx-sr', { text: b.label + ': ' + n(b.n) + ' places, ' + pc(b.share) + '.' }));
    list.append(li);
  }
  return list;
}

/* --------------------------------------------------- row by row, open --- */

function rowTable(p, m, format) {
  const wrap = el('div.mx-cp__more');
  const body = el('div.mx-cp__rows', { hidden: true });
  const t = el('table.mx-cp__tb');
  t.append(el('caption.mx-cp__cap', { text: 'Each way in, and how many of its places name a European power on the other side.' }));
  const hr = el('tr');
  hr.append(el('th', { scope: 'col' }, 'taken by'));
  hr.append(el('th.mx-cp__nu', { scope: 'col' }, 'places'));
  hr.append(el('th.mx-cp__nu', { scope: 'col' }, 'a European power'));
  hr.append(el('th.mx-cp__nu', { scope: 'col' }, 'already there'));
  t.append(el('thead', hr));
  const tb = el('tbody');
  for (const r of p.rows) {
    const tr = el('tr', { dataset: { zero: r.euro === 0 ? 'yes' : 'no' } });
    tr.append(el('th', { scope: 'row' }, r.short));
    tr.append(el('td.mx-cp__nu', el('span.num', { text: format.number(r.n) })));
    tr.append(el('td.mx-cp__nu', el('span.num', { text: format.number(r.euro) })));
    tr.append(el('td.mx-cp__nu', el('span.num', { text: format.number(r.local) })));
    tb.append(tr);
  }
  t.append(tb);
  body.append(t);
  body.append(el('p.cx-note', {
    text: 'The last two columns overlap and do not sum to the first: a place can name '
      + 'a European power and a people already there on the same record, and '
      + format.number(p.unsorted.n) + ' name neither.',
  }));

  const more = el('button.cx-more', { type: 'button', 'aria-expanded': 'false' },
    el('span', { text: 'the same count, row by row' }));
  more.addEventListener('click', () => {
    const open = body.hidden;
    body.hidden = !open;
    more.setAttribute('aria-expanded', open ? 'true' : 'false');
    more.querySelector('span').textContent = open ? 'hide the row-by-row count' : 'the same count, row by row';
  });
  wrap.append(more, body);
  return wrap;
}

/* ---------------------------------------------------------- the rules --- */

function rules(p, format) {
  const n = (v) => format.number(v);
  const wrap = el('div.mx-cp__notes');

  const a = el('p.cx-note');
  a.append('Counted off the ');
  a.append(el('em', { text: 'first' }));
  a.append(' acquisition of each place — the same record its row comes from. ');
  a.append('“Already there” adds three labels the records keep apart and this rail does not: ');
  a.append(LOCAL.map((k) => KIND[k]).join(', '));
  a.append('.');
  wrap.append(a);

  if (p.nobodyBand.n) {
    const c = el('p.cx-note');
    c.append(el('span.num', { text: n(p.nobodyBand.n) }));
    c.append(p.nobodyBand.n === 1
      ? ' place records nobody living there when Britain arrived — an island with no resident population, which is a finding on the record and not an absence of evidence: '
      : ' places record nobody living there when Britain arrived — islands with no resident population, which is a finding on the record and not an absence of evidence: ');
    c.append(p.nobodyBand.items.map((i) => i.name).join(', '));
    c.append('.');
    wrap.append(c);
  }

  if (p.unsorted.n) {
    const b = el('p.cx-note');
    b.append(el('span.num', { text: n(p.unsorted.n) }));
    b.append(p.unsorted.n === 1 ? ' place will not sort, and is set aside rather than pushed to a side. ' : ' places will not sort, and are set aside rather than pushed to a side. ');
    b.append('Their records name only “another empire”, “a chartered company” or “something else” — labels that hold the Mughal and Qing empires alongside the German and Spanish ones, and the Dutch and French East India Companies alongside the Hudson’s Bay Company. Read them and sort them yourself:');
    wrap.append(b);
    const ul = el('ul.mx-cp__l');
    for (const i of p.unsorted.items) {
      const cps = (i.takenFrom || []).filter((c) => c && c.name);
      ul.append(el('li.mx-cp__i',
        el('b', { text: i.name }), ' · ',
        el('span.mx-cp__from', { text: cps.map((c) => c.name).join('; ') || 'no counterparty on the record' })));
    }
    wrap.append(ul);
  }
  return wrap;
}
