/**
 * search/corpus.js — everything this atlas can be asked for, in one array.
 *
 * Six kinds of record, all built at mount from the dataset. Nothing here is
 * typed by hand: the names come from the shards and from
 * `app/data/geo/units.index.json`, so a shard that gains an alias tomorrow is
 * searchable tomorrow without this file changing.
 *
 *   place     260 territories, with every name they were ever filed under
 *   unit      302 pieces of geometry, with the 272 alias sets on them
 *   event     308 dated events
 *   person    every named person in an acquisition, a departure or an event
 *   source    632 distinct cited works, and the parties Britain took land from
 *   absence   see silence.js — the archive's holes, as searchable objects
 *
 * A record's `names[]` entries each carry a weight and a `kind`. The kind is
 * printed back to the reader when the name they typed is not the name this
 * atlas files the thing under, because "Ceylon → Sri Lanka" is a fact about
 * empire, not an autocorrect.
 */

import { norm } from './match.js';

const nm = (text, weight, kind) => (text ? { text: String(text), weight, kind } : null);
const clean = (list) => list.filter(Boolean).filter((n, i, a) => a.findIndex((b) => norm(b.text) === norm(n.text)) === i);

/** The year a `namesOverTime` entry starts / stops being the name in use. */
function nameSpan(readDate, entry) {
  const from = entry.from ? (readDate(entry.from) || {}).year : null;
  const to = entry.to ? (readDate(entry.to) || {}).year : null;
  return { from: Number.isFinite(from) ? from : null, to: Number.isFinite(to) ? to : null };
}

/** The name a territory was filed under, by the people who filed it, in `year`. */
export function nameInUse(data, t, year) {
  const list = t.namesOverTime || [];
  let best = null;
  for (const e of list) {
    if (!e || !e.name) continue;
    const { from, to } = nameSpan(data.readDate, e);
    if (from != null && year < from) continue;
    if (to != null && year >= to) continue;
    best = { name: e.name, from, to, usedBy: e.usedBy || null, note: e.note || null, language: e.language || null };
  }
  if (best) return best;
  /* Past the last recorded name, the modern successor is the honest answer. */
  const suc = (t.modernSuccessors || [])[0];
  const last = list[list.length - 1];
  if (last) {
    const { from, to } = nameSpan(data.readDate, last);
    if (to != null && year >= to && suc && suc.name) return { name: suc.name, from: to, to: null, usedBy: 'successor-state', note: null };
  }
  return null;
}

function placeRecords(data) {
  const out = [];
  for (const t of data.territories) {
    const names = [nm(t.name, 1, 'atlas')];
    names.push(nm(t.shortName, 0.98, 'short'));
    names.push(nm(t.formalName, 0.96, 'formal'));
    for (const e of t.namesOverTime || []) {
      const { from, to } = nameSpan(data.readDate, e);
      const label = to != null ? 'used until ' + to : (from != null ? 'used from ' + from : 'historical name');
      names.push(nm(e.name, 0.95, label));
    }
    for (const s of t.modernSuccessors || []) names.push(nm(s.name, 0.9, 'today'));
    for (const a of t.aka || []) names.push(nm(a, 0.9, 'also called'));
    out.push({
      kind: 'place', id: t.id, title: t.name, territoryId: t.id,
      names: clean(names), region: t.region, t,
      unitIds: t.units || [],
    });
  }
  return out;
}

function unitRecords(data) {
  const out = [];
  if (!data.unitMeta) return out;
  for (const [id, u] of data.unitMeta) {
    const names = [nm(u.name, 0.86, 'unit')];
    for (const a of u.aliases || []) names.push(nm(a, 0.84, 'also called'));
    if (u.sovereign_today && u.sovereign_today !== u.name) names.push(nm(u.sovereign_today, 0.78, 'today'));
    out.push({ kind: 'unit', id, title: u.name || id, names: clean(names), unitIds: [id], u });
  }
  return out;
}

function eventRecords(data) {
  const out = [];
  for (const e of data.events) {
    const names = [nm(e.title, 1, 'event')];
    for (const p of (e.links && e.links.places) || []) names.push(nm(p.name, 0.7, 'place in it'));
    for (const tag of e.tags || []) names.push(nm(String(tag).replace(/-/g, ' '), 0.45, 'tag'));
    out.push({
      kind: 'event', id: e.id, title: e.title, names: clean(names),
      year: e.year, e, unitIds: (e.links && e.links.units) || [],
      territoryId: e.territoryId || ((e.links && e.links.territories) || [])[0] || null,
    });
  }
  return out;
}

/**
 * Everyone the dataset names, gathered across acquisitions, departures and
 * events. One record per person, listing every place they appear, because a
 * student who types "Kenyatta" wants Kenya and the 1963 departure, not four
 * identical rows.
 */
function personRecords(data) {
  const by = new Map();
  const add = (p, where) => {
    if (!p || !p.name) return;
    const key = norm(p.name);
    if (!key) return;
    let r = by.get(key);
    if (!r) {
      r = {
        kind: 'person', id: 'person:' + key.replace(/ /g, '-'), title: p.name,
        names: [nm(p.name, 1, 'person')], appearances: [], sides: new Set(),
        lived: p.lived || null, unitIds: [],
      };
      by.set(key, r);
    }
    if (!r.lived && p.lived) r.lived = p.lived;
    if (p.side) r.sides.add(p.side);
    r.appearances.push({ role: p.role || null, ...where });
    for (const u of where.unitIds || []) if (!r.unitIds.includes(u)) r.unitIds.push(u);
  };

  for (const t of data.territories) {
    for (const a of t.acquisitions || []) {
      const where = { territoryId: t.id, place: t.name, year: a.year, what: 'when Britain took it', unitIds: a.units || t.units };
      for (const p of a.people || []) add(p, where);
    }
    for (const d of t.departures || []) {
      const where = { territoryId: t.id, place: t.name, year: d.year, what: 'when it left', unitIds: d.units || t.units };
      for (const p of d.led || []) add(p, where);
    }
  }
  for (const e of data.events) {
    const where = {
      territoryId: e.territoryId || ((e.links && e.links.territories) || [])[0] || null,
      place: e.title, year: e.year, what: 'in this event', eventId: e.id,
      unitIds: (e.links && e.links.units) || [],
    };
    for (const p of e.people || []) add(p, where);
  }

  for (const r of by.values()) { r.sides = [...r.sides]; r.names = clean(r.names); }
  return [...by.values()];
}

/**
 * Every distinct work cited anywhere in the atlas, with what it is cited for.
 * These are what the evidence lens filters by, so the key has to be the work
 * and not the citation: 632 works, 1,072 citations, counted at build time.
 */
export function sourceRecords(data) {
  const by = new Map();
  const add = (src, owner) => {
    if (!src || !src.work) return;
    const key = norm((src.author || '') + '|' + src.work + '|' + (src.year || ''));
    let r = by.get(key);
    if (!r) {
      r = {
        kind: 'source', id: 'src:' + key.replace(/[^a-z0-9]+/g, '-').slice(0, 80),
        title: src.work, author: src.author || null, year: Number(src.year) || null,
        workKind: src.kind || null, publisher: src.publisher || null,
        names: clean([nm(src.work, 1, 'work'), nm(src.author, 0.94, 'author')]),
        cites: [], unitIds: [], supports: [],
      };
      by.set(key, r);
    }
    r.cites.push(owner);
    if (src.supports && !r.supports.includes(src.supports)) r.supports.push(src.supports);
    for (const u of owner.unitIds || []) if (!r.unitIds.includes(u)) r.unitIds.push(u);
  };

  const walkEvidence = (node, owner) => {
    for (const e of node || []) add(e, owner);
  };

  for (const t of data.territories) {
    const owner = { kind: 'place', id: t.id, title: t.name, unitIds: t.units || [] };
    walkEvidence(t.evidence, owner);
    for (const a of t.acquisitions || []) walkEvidence(a.evidence, owner);
    for (const d of t.departures || []) walkEvidence(d.evidence, owner);
  }
  for (const e of data.events) {
    walkEvidence(e.evidence, {
      kind: 'event', id: e.id, title: e.title, year: e.year,
      unitIds: (e.links && e.links.units) || [],
    });
  }
  return [...by.values()];
}

/**
 * WHOM BRITAIN TOOK IT FROM. `acquisitions[].counterparties` names the state,
 * kingdom, people or company on the other side of every acquisition, and what
 * they lost in their own entry. They are not people and they are not places,
 * so they get their own kind — DIDACTIC_SPEC M17: empire is a story about
 * relationships under coercion, and a search that cannot find the other party
 * has told half of it.
 */
function partyRecords(data) {
  const by = new Map();
  for (const t of data.territories) {
    for (const a of t.acquisitions || []) {
      for (const c of a.counterparties || []) {
        if (!c || !c.name) continue;
        /* ONE POLITY, ONE RESULT. The shards write "Ottoman Empire" in one
           record and "The Ottoman Empire" in another, and keying on the raw
           name put both in the finder as two separate states — nine polities
           doubled that way, including the Sultanate of Mysore, the Kingdom of
           Nepal and the Batavian Republic. A leading article is orthography,
           not a different party. Both spellings stay searchable; only one row
           comes back, under whichever name the shards used more often. */
        const key = norm(c.name).replace(/^(the|a) /, '');
        if (!key) continue;
        let r = by.get(key);
        if (!r) {
          r = {
            kind: 'party', id: 'party:' + key.replace(/ /g, '-').slice(0, 70), title: c.name,
            names: [], spellings: new Map(), partyKind: c.kind || null,
            losses: [], unitIds: [], territoryId: t.id, year: a.year,
          };
          by.set(key, r);
        }
        r.spellings.set(c.name, (r.spellings.get(c.name) || 0) + 1);
        if (!r.partyKind && c.kind) r.partyKind = c.kind;
        r.losses.push({ lost: c.lost || null, place: t.name, territoryId: t.id, year: a.year, mechanism: a.mechanism });
        for (const u of a.units || t.units || []) if (!r.unitIds.includes(u)) r.unitIds.push(u);
      }
    }
  }
  for (const r of by.values()) {
    const spell = [...r.spellings.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
    r.title = spell[0][0];
    r.names = clean(spell.map(([text], i) => nm(text, i ? 0.95 : 1, i ? 'also written' : 'the other party')));
    delete r.spellings;
  }
  return [...by.values()];
}

export function buildCorpus(data) {
  const places = placeRecords(data);
  const units = unitRecords(data);
  const events = eventRecords(data);
  const people = personRecords(data);
  const sources = sourceRecords(data);
  const parties = partyRecords(data);
  return {
    places, units, events, people, parties, sources,
    all: [...places, ...units, ...events, ...people, ...parties, ...sources],
  };
}
