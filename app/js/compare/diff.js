/**
 * compare/diff.js — what changed between two plates, in words, with the mechanism.
 *
 * The whole point of P18. Two pictures side by side let a student eyeball a
 * difference; a printed atlas with four maps in it can do that much. What print
 * cannot do is compute the difference and name the instrument that caused each
 * line of it. So this file crosses `data.statusAt(a)` with `data.statusAt(b)`
 * under two definitions of the word "British", groups the changed units by
 * territory, and then goes to `data.acquisitions[]` and `data.departures[]` for
 * the MECHANISM — conquest, treaty cession, lease expiry, war of independence.
 *
 * Rules this file obeys, from the top of the repository down:
 *   · Every number here is counted from the dataset at call time. There is not
 *     one hard-coded total in this module and there may never be one.
 *   · Where a change has no mechanism record, it says so — "no mechanism
 *     recorded in this dataset" — instead of guessing one. An absence renders
 *     as an absence (BRIEF §6, FEATURE_SPEC §1 charge 7).
 *   · Mechanism ids are the dataset's own. The labels below translate them into
 *     student English and add nothing; "war-transfer" becomes "transferred at
 *     the end of a war", never "acquired" (DIDACTIC_SPEC §7.1 rule 2).
 *   · EVERY ROW NAMES THE OTHER PARTY. A difference list that says only what
 *     Britain got is the pink map in a table, and it is the exact failure
 *     DIDACTIC_SPEC M17 exists to defeat. So an arrival carries the polity it
 *     was taken from, out of `acquisitions[].counterparties[]`, and a departure
 *     carries the people who led it out, out of `departures[].led[]` with
 *     `side: "local"` first. Both come from the dataset; neither is authored
 *     here; where the record is empty the row says so and invents nobody.
 */

import { measure } from '../map/definition.js';

/* The dataset's acquisition mechanisms, in plain words. Ids from
   data.acquisitions[].mechanism; anything unknown falls through to the id
   itself with its hyphens opened out, so a new mechanism is legible on the day
   it lands rather than silently mislabelled. */
const ACQ = {
  'annexation-of-existing-colony': 'annexed from an existing colony',
  'chartered-company': 'taken by a chartered company',
  condominium: 'joint rule agreed with another power',
  conquest: 'conquest',
  'informal-influence': 'run without ever being claimed',
  lease: 'leased',
  mandate: 'League of Nations mandate',
  occupation: 'military occupation',
  'protectorate-declared': 'protectorate declared',
  purchase: 'bought',
  settlement: 'settlement',
  'treaty-cession': 'ceded by treaty',
  trusteeship: 'United Nations trusteeship',
  /* NEUTRAL BY DEFAULT, EUROPEAN ONLY WHEN THE RECORD SAYS SO.
     `war-transfer` covers two different things: Mauritius passing from France
     at the Treaty of Paris, and the Konbaung kingdom of Burma ceding Arakan and
     Tenasserim at Yandabo. One gloss for both prints "another European power"
     over Tipu Sultan and the Lahore Durbar — the round-3 disqualifier, found in
     the dossier's own vocabulary, and this module is a second surface that
     could have printed it. It never says who the other party was unless the
     record does: the default is the neutral sentence, the European variant is
     chosen ONLY when every counterparty in the record is itself a European
     power, and the row prints the counterparty's own name beside it either way.
     Computed from the data, so a retag in the shards changes this with it. */
  'war-transfer': 'transferred at the end of a war',
};

/** The European-cession variant, used only when the record supports it. */
const WAR_TRANSFER_EUROPEAN = 'ceded by another European power at the end of a war';
const EUROPEAN_KINDS = new Set(['european-power']);

const DEP = {
  'insurgency-then-negotiation': 'armed revolt, then negotiation',
  'lease-expiry': 'the lease ran out',
  'merger-into-neighbour': 'merged into a neighbour',
  'negotiated-independence': 'negotiated independence',
  partition: 'partition',
  referendum: 'referendum',
  'still-a-territory': 'still governed from London',
  'transfer-to-another-power': 'transferred to another power',
  'war-of-independence': 'war of independence',
};

const words = (id) => String(id || '').replace(/-/g, ' ');

/**
 * The gloss for an acquisition mechanism, read against the record's own
 * counterparties. Only `war-transfer` varies, and it varies in one direction
 * only: the neutral sentence unless every named counterparty is a European
 * power, in which case the record itself says the transfer was European.
 */
export const acqLabel = (id, parties) => {
  if (id === 'war-transfer' && Array.isArray(parties) && parties.length
      && parties.every((c) => EUROPEAN_KINDS.has(c.kind))) return WAR_TRANSFER_EUROPEAN;
  return ACQ[id] || (id ? words(id) : null);
};
export const depLabel = (id) => DEP[id] || (id ? words(id) : null);

/** A record's counterparties, kept whole — name, kind and what they lost. */
function partiesOf(rec) {
  return (rec && Array.isArray(rec.counterparties) ? rec.counterparties : [])
    .filter((c) => c && c.name)
    .map((c) => ({ name: String(c.name), kind: c.kind || null, lost: c.lost || null }));
}

/**
 * Who led a departure out. `side: "local"` first and always — the people this
 * atlas exists to stop being scenery (DIDACTIC_SPEC LO6, T18, M17) — then the
 * others, so a transfer between two outside powers still names its actors
 * rather than printing an empty line.
 */
function ledBy(rec) {
  const all = (rec && Array.isArray(rec.led) ? rec.led : []).filter((p) => p && p.name);
  const local = all.filter((p) => p.side === 'local');
  const rest = all.filter((p) => p.side !== 'local');
  return [...local, ...rest].map((p) => ({ name: String(p.name), role: p.role || null, side: p.side || null }));
}

/** The units a definition actually paints in a given year. */
export function membersOf(statusMap, def) {
  const out = new Map();
  for (const [uid, e] of statusMap) if (def.test(e)) out.set(uid, e);
  return out;
}

/**
 * A side of the comparison: one year, one definition, its own totals.
 * `measure()` is the map's own function, so the figures printed under a compare
 * plate are the same figures the Definition Switch prints under the single one.
 */
export function side(data, year, def) {
  const statusMap = data.statusAt(year);
  const members = membersOf(statusMap, def);
  const m = measure(statusMap, data.unitMeta, def);
  return {
    year, def, statusMap, members,
    units: m.units, territories: m.territories, km2: m.km2,
    unitsWithoutArea: m.unitsWithoutArea,
  };
}

/** territoryId → display name, from the dataset and nowhere else. */
function nameOf(data, tid, fallbackUnit) {
  const t = tid && data.byId ? data.byId.get(tid) : null;
  if (t) return t.shortName || t.name || tid;
  return (data.unitName && data.unitName(fallbackUnit)) || fallbackUnit || tid || 'unknown';
}

/**
 * Group a set of changed units into one row per territory, then attach the
 * mechanism from the acquisition or departure record whose own year falls
 * inside the window the two plates span.
 */
function rows(data, entries, kind, lo, hi, statusFrom) {
  const byTerr = new Map();
  for (const [uid, e] of entries) {
    const tid = e.territoryId || null;
    const key = tid || ('unit:' + uid);
    let r = byTerr.get(key);
    if (!r) {
      r = {
        key, kind, territoryId: tid, name: nameOf(data, tid, uid),
        units: [], status: e.status, statusFrom: null, statusTo: null,
        mechanism: null, mechanismLabel: null, how: null, year: null,
        /* The dataset's own phrase for how this place was held — "Tribute to
           Colombo", "Under the maritime truce", "Factories, gunboats and
           telegraph lines". It is not a mechanism and is never printed as one;
           it is what a row says when two DEFINITIONS are being compared and
           there is, by construction, no event to name. */
        spanLabel: null,
        instrument: null, counterparties: [], confidence: null, sameYear: lo === hi,
        /* Who the other party was. `parties` for an arrival — the polity the
           place was taken from, with its kind and what the record says it lost;
           `led` for a departure — the people who took it out, local first.
           Both are the dataset's, verbatim. An empty array stays empty. */
        parties: [], led: [], becomes: [], movement: null, resistance: null,
      };
      byTerr.set(key, r);
    }
    r.units.push(uid);
    if (!r.spanLabel && e.span && e.span.label) r.spanLabel = e.span.label;
    if (statusFrom) { r.statusFrom = statusFrom.get(uid) ? statusFrom.get(uid).status : null; r.statusTo = e.status; }
  }

  const records = kind === 'gained' ? (data.acquisitions || []) : (data.departures || []);
  const label = kind === 'gained' ? acqLabel : depLabel;
  for (const r of byTerr.values()) {
    if (lo === hi) continue;                 // two definitions of one year: no event caused this
    const own = new Set(r.units);
    let best = null;
    for (const rec of records) {
      if (rec.territoryId !== r.territoryId) continue;
      const y = Number(rec.year);
      if (!Number.isFinite(y) || y <= lo || y > hi) continue;
      const touches = !rec.units || !rec.units.length || rec.units.some((u) => own.has(u));
      if (!touches) continue;
      if (!best || y > Number(best.year)) best = rec;   // the last one inside the window
    }
    if (best) {
      r.mechanism = best.mechanism || null;
      r.parties = partiesOf(best);
      r.mechanismLabel = kind === 'gained' ? label(best.mechanism, r.parties) : label(best.mechanism);
      r.how = best.how || null;
      r.year = Number(best.year);
      r.date = best.date || null;
      r.instrument = best.instrument || null;
      r.confidence = best.confidence || null;
      r.counterparties = r.parties.map((c) => c.name);
      r.led = ledBy(best);
      r.becomes = (best.becomes || []).map((b) => b && b.name).filter(Boolean);
      r.movement = best.movement || null;
      r.resistance = best.resistance || null;
      r.recordId = best.id || null;
    }
  }
  const out = [...byTerr.values()];
  out.sort((a, b) => (b.units.length - a.units.length) || a.name.localeCompare(b.name));
  return out;
}

/**
 * The status-changed rows. The mechanism here is the legal instrument, so the
 * row carries the two status ids and, where the window holds an event that
 * says it changed a status, that event's title.
 */
function changedRows(data, pairs, lo, hi, statusLabel) {
  const byTerr = new Map();
  for (const [uid, a, b] of pairs) {
    const tid = b.territoryId || a.territoryId || null;
    const key = tid || ('unit:' + uid);
    let r = byTerr.get(key);
    if (!r) {
      r = {
        key, kind: 'changed', territoryId: tid, name: nameOf(data, tid, uid),
        units: [], statusFrom: a.status, statusTo: b.status,
        fromLabel: statusLabel(a.status), toLabel: statusLabel(b.status),
        event: null, year: null, mechanismLabel: null, sameYear: lo === hi,
      };
      byTerr.set(key, r);
    }
    r.units.push(uid);
  }
  if (lo !== hi && data.eventsBetween) {
    for (const r of byTerr.values()) {
      if (!r.territoryId) continue;
      let ev = null;
      try {
        const list = data.eventsBetween(lo + 1, hi, { territoryId: r.territoryId, changedStatus: true });
        for (const e of list) if (!ev || Number(e.year) > Number(ev.year)) ev = e;
      } catch (_) { ev = null; }
      if (ev) {
        r.event = ev.title || null;
        r.year = Number(ev.year);
        r.mechanismLabel = ev.title || null;
        r.recordId = ev.id || null;
      }
    }
  }
  const out = [...byTerr.values()];
  out.sort((a, b) => (b.units.length - a.units.length) || a.name.localeCompare(b.name));
  return out;
}

/**
 * The comparison. `A` and `B` are `side()` results, already ordered so that A
 * is the left-hand plate.
 */
export function diff(data, A, B) {
  const statusLabel = (id) => {
    const s = (data.statuses || []).find((x) => x.id === id);
    return (s && s.label) || words(id);
  };

  const gainedEntries = new Map();
  const lostEntries = new Map();
  const changedPairs = [];
  for (const [uid, e] of B.members) {
    const a = A.members.get(uid);
    if (!a) gainedEntries.set(uid, e);
    else if (a.status !== e.status) changedPairs.push([uid, a, e]);
  }
  for (const [uid, e] of A.members) if (!B.members.has(uid)) lostEntries.set(uid, e);

  const lo = Math.min(A.year, B.year), hi = Math.max(A.year, B.year);
  const gainedRows = rows(data, gainedEntries, 'gained', lo, hi, null);
  const lostRows = rows(data, lostEntries, 'lost', lo, hi, null);
  const chRows = changedRows(data, changedPairs, lo, hi, statusLabel);

  let events = [];
  if (lo !== hi && data.eventsBetween) {
    try { events = data.eventsBetween(lo, hi, { changedStatus: true }) || []; } catch (_) { events = []; }
  }

  return {
    a: A, b: B, lo, hi, sameYear: lo === hi,
    gained: { units: gainedEntries.size, rows: gainedRows, unitIds: new Set(gainedEntries.keys()) },
    lost: { units: lostEntries.size, rows: lostRows, unitIds: new Set(lostEntries.keys()) },
    changed: { units: changedPairs.length, rows: chRows, unitIds: new Set(changedPairs.map((p) => p[0])) },
    net: {
      units: B.units - A.units,
      territories: B.territories - A.territories,
      km2: B.km2 - A.km2,
    },
    events,
    statusLabel,
  };
}

/** Every unit the comparison touches — what the "only what changed" view keeps lit. */
export function touched(d) {
  const s = new Set();
  for (const u of d.gained.unitIds) s.add(u);
  for (const u of d.lost.unitIds) s.add(u);
  for (const u of d.changed.unitIds) s.add(u);
  return s;
}

export default { diff, side, membersOf, touched, acqLabel, depLabel };
