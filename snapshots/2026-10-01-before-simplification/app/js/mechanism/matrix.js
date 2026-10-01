/**
 * mechanism/matrix.js — the counting, and nothing else.
 *
 * FEATURE_SPEC charge 6 / P09. A real contingency table of how a place was
 * taken against how it left, built entirely from `acquisitions[].mechanism`
 * and `departures[].mechanism`. No total in this file is written down; every
 * one of them is counted, on the running dataset, every time.
 *
 * THE COUNTING RULE, STATED ONCE AND PRINTED IN THE UI:
 *
 *   One place, one mark. A territory is counted in the row of the mechanism
 *   of its FIRST acquisition and the column of the mechanism of its LAST
 *   departure. A place taken twice (the Cape, 1795 and 1806) is not two
 *   places; a place that changed hands and left again is counted by how it
 *   finally went.
 *
 *   "Last" means latest by date, and an UNDATED departure record is the latest
 *   of all, because an undated departure is an open one — the place has not
 *   left. Two territories turn on this. Britain withdrew the Falklands
 *   garrison in 1774 and the islands are British today; part of the British
 *   Indian Ocean Territory went to Seychelles in 1976 and the rest is
 *   administered from London now. Sorting those by year alone would file both
 *   under "handed to another power", which is false in the present tense.
 *
 * The rule has a visible price and the UI pays it out loud:
 *   - Great Britain has no departure record, so it is the one territory of
 *     260 that carries no mark. `uncounted[]` names it rather than hiding it.
 *   - Two of the fourteen rows come out empty — mandate and trusteeship — and
 *     that emptiness is a finding, not a gap: every mandate and every
 *     trusteeship in this dataset was already under British occupation or
 *     conquest before the League or the UN assigned it. `laterOnly` counts
 *     the acquisitions the rule pushes out of the row so the claim can be
 *     checked on screen.
 *
 * Nothing here touches the DOM.
 */

/* The order the table is drawn in when nobody has sorted it. Force first,
   paperwork second, the flagless kind last — so reading down the rows is
   itself an argument about what "taken" covers. */
export const ACQ_ORDER = [
  'conquest', 'occupation', 'war-transfer', 'annexation-of-existing-colony',
  'treaty-cession', 'purchase', 'lease', 'settlement', 'chartered-company',
  'protectorate-declared', 'condominium', 'mandate', 'trusteeship',
  'informal-influence',
];

/* Left to right: fought, fought then talked, cut in two, talked, voted,
   absorbed, handed on, ran out, never left. */
export const DEP_ORDER = [
  'war-of-independence', 'insurgency-then-negotiation', 'partition',
  'negotiated-independence', 'referendum', 'merger-into-neighbour',
  'transfer-to-another-power', 'lease-expiry', 'still-a-territory',
];

/**
 * `short` is the label in the table, where the space is 7rem or a rotated
 * 5rem. `full` is the label everywhere a sentence has room. `gloss` is the
 * plain-verb line printed when the reader picks that row or column — one
 * sentence, house voice, agent named (DIDACTIC_SPEC §7.1).
 */
export const ACQ = {
  'conquest': {
    short: 'conquest', full: 'conquest',
    gloss: 'British forces beat somebody and kept the ground.',
  },
  'occupation': {
    short: 'occupation', full: 'military occupation',
    gloss: 'Troops moved in and stayed, with the legal question left open — sometimes for seventy years, as in Egypt from 1882.',
  },
  'war-transfer': {
    /* `full` is read in sentences like "4 places taken by …", so it is a noun
       phrase, and it names the event rather than the loser. "Handed over in a
       peace treaty" named a loser this row does not have: not one of the
       places filed here was signed over by a European power. */
    short: 'war settlement', full: 'a war settlement',
    /* Not only a European war: nine of the sixteen records under this tag are
       treaties imposed on defeated Asian states (Seringapatam, Yandabo,
       Lahore, Sinchula). A gloss keyed to the mechanism cannot name the
       counterparty; the cell's own units do. */
    gloss: 'A war ended and the place changed owner on paper. Nobody living there was asked. Who signed it away is a separate question from what the row is called — sometimes another European empire at a peace conference, sometimes a kingdom Britain had just beaten. The block below counts which, rather than assuming.',
  },
  'annexation-of-existing-colony': {
    short: 'absorbed a colony', full: 'absorbed a neighbouring colony',
    gloss: 'One possession swallowed another, or a company territory was folded into a crown one. The people in it changed government without moving — and most of these records name a First Nation, a sultanate or an African kingdom on the other side as well as the colony, because the colony being absorbed was itself sitting on somebody else’s ground.',
  },
  'treaty-cession': {
    short: 'signed over', full: 'signed over by treaty',
    gloss: 'A ruler signed. What was signed, what was translated and what was understood are three different documents in several of these cases.',
  },
  'purchase': {
    short: 'bought', full: 'bought',
    /* Same rule as war-transfer: 11 of the 14 purchases in this dataset have
       no European counterparty at all — the Suez Canal shares from the
       Khedive of Egypt in 1875, Rupert's Land from the Hudson's Bay Company
       in 1870, Fort St George in 1639. The gloss names no party. */
    gloss: 'Cash changed hands — £10,000 for the Danish Gold Coast forts; the Khedive of Egypt’s Suez Canal shares in 1875; Rupert’s Land from the Hudson’s Bay Company in 1870. The inhabitants were part of the sale and were not consulted.',
  },
  'lease': {
    short: 'leased', full: 'leased',
    gloss: 'Sovereignty stayed with somebody else on paper while Britain ran the place. The paper mattered: it is why Hong Kong had an end date.',
  },
  'settlement': {
    short: 'settlement', full: 'settlement on inhabited land',
    gloss: 'British settlers occupied land that already had people on it. In this atlas the acquisition record names them: the prior inhabitants are counterparties, not scenery.',
  },
  'chartered-company': {
    short: 'a company', full: 'a chartered company',
    gloss: 'A private firm with shareholders, a charter and an army took the ground first, and the state arrived afterwards.',
  },
  'protectorate-declared': {
    short: 'protectorate', full: 'protectorate declared',
    gloss: 'Britain announced protection over a place it did not claim to own, and then ran its foreign policy, its army and usually its taxes.',
  },
  'condominium': {
    short: 'shared rule', full: 'shared rule with another power',
    gloss: 'Two flags over one territory — a legal form invented to keep a place out of a rival’s hands.',
  },
  'mandate': {
    short: 'mandate', full: 'League of Nations mandate',
    gloss: 'The League assigned a former German or Ottoman territory to Britain to administer, with a duty to report. Every one of them was already under British troops when it was assigned.',
  },
  'trusteeship': {
    short: 'trusteeship', full: 'UN trusteeship',
    gloss: 'The mandates were re-labelled in 1946 under the United Nations, which added visiting missions and a right of petition. The soldiers did not change.',
  },
  'informal-influence': {
    short: 'no flag', full: 'influence without a flag',
    gloss: 'No British claim, no British border, no pink on the map — and British gunboats, loans, railways or treaty terms setting the country’s choices. Gallagher and Robinson called this the imperialism of free trade; the objection is that stretched far enough the idea cannot be falsified.',
  },
};

export const DEP = {
  'war-of-independence': {
    short: 'lost a war', full: 'a war of independence',
    gloss: 'Britain fought to keep the place and lost it.',
  },
  'insurgency-then-negotiation': {
    short: 'fought, then talked', full: 'an insurgency, then a negotiation',
    gloss: 'Britain fought an armed movement, said it had won, and then handed over — usually to people it had recently imprisoned.',
  },
  'partition': {
    short: 'partitioned', full: 'partition',
    gloss: 'The territory was cut in two or more, and a border drawn at speed became the thing people died crossing.',
  },
  'negotiated-independence': {
    short: 'negotiated', full: 'negotiated independence',
    gloss: 'A date was agreed, a flag came down at midnight, and a constitution took effect. This one word covers everything from a quiet transfer of files to the end of a war Britain had been fighting for years.',
  },
  'referendum': {
    short: 'a vote', full: 'a vote',
    gloss: 'People were polled on where they would belong. The question they were allowed to answer was usually set in London.',
  },
  'merger-into-neighbour': {
    short: 'merged', full: 'merged into a neighbour',
    gloss: 'The unit stopped existing as itself and became part of a bigger one — often another British possession, so nothing changed on the pink map.',
  },
  'transfer-to-another-power': {
    short: 'handed on', full: 'handed to another power',
    gloss: 'Britain gave, sold, swapped or lost the place to another state. Independence was not on offer.',
  },
  'lease-expiry': {
    short: 'lease ran out', full: 'the lease ran out',
    gloss: 'The paper had a date on it and the date arrived.',
  },
  'still-a-territory': {
    short: 'still British', full: 'still British',
    gloss: 'It has not left. Fourteen Overseas Territories and the Crown Dependencies are still administered from London today.',
  },
};

export const acqLabel = (id, k = 'full') => (ACQ[id] && ACQ[id][k]) || id || 'unrecorded';
export const depLabel = (id, k = 'full') => (DEP[id] && DEP[id][k]) || id || 'unrecorded';

const yearOf = (step) => (step && Number.isFinite(step.year) ? step.year : null);

/**
 * buildMatrix(data) — the whole computation.
 *
 * Returns a plain object. Everything a renderer needs is on it; nothing a
 * renderer needs is computed twice.
 */
export function buildMatrix(data) {
  const territories = (data && data.territories) || [];

  const rowIds = [...ACQ_ORDER];
  const colIds = [...DEP_ORDER];
  /* A mechanism string in the dataset that this file has never heard of must
     still be drawn, or the table lies about the data it claims to count. */
  for (const a of (data.acquisitions || [])) if (a.mechanism && !rowIds.includes(a.mechanism)) rowIds.push(a.mechanism);
  for (const d of (data.departures || [])) if (d.mechanism && !colIds.includes(d.mechanism)) colIds.push(d.mechanism);

  const cells = new Map();            // 'row|col' -> { n, items[] }
  const rowTotal = new Map();
  const colTotal = new Map();
  const laterOnly = new Map();        // acquisitions the "first" rule drops
  const laterOnlyPlaces = new Map();  // and the places they belong to
  const uncounted = [];
  let counted = 0;

  for (const id of rowIds) { rowTotal.set(id, 0); laterOnly.set(id, 0); laterOnlyPlaces.set(id, []); }
  for (const id of colIds) colTotal.set(id, 0);

  for (const t of territories) {
    const acqs = (t.acquisitions || []).filter((a) => a && a.mechanism);
    const deps = (t.departures || []).filter((d) => d && d.mechanism);
    const first = acqs[0] || null;                       // data.js sorts by year
    /* An undated departure is an open one, so it sorts last, not first. */
    const last = deps.length
      ? deps.slice().sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity))[deps.length - 1]
      : null;

    /* every acquisition after the first: the price of the rule, counted */
    for (let i = 1; i < acqs.length; i++) {
      const m = acqs[i].mechanism;
      if (!laterOnly.has(m)) { laterOnly.set(m, 0); laterOnlyPlaces.set(m, []); }
      laterOnly.set(m, laterOnly.get(m) + 1);
      laterOnlyPlaces.get(m).push({
        territoryId: t.id, name: t.name, year: yearOf(acqs[i]),
        after: acqs[i - 1].mechanism, how: acqs[i].how || null,
      });
    }

    if (!first || !last) {
      uncounted.push({
        territoryId: t.id, name: t.name,
        why: !first && !last ? 'no acquisition and no departure record'
          : !first ? 'no acquisition record' : 'no departure record',
      });
      continue;
    }

    const item = {
      territoryId: t.id,
      name: t.name,
      region: t.region,
      acq: first.mechanism,
      dep: last.mechanism,
      takenYear: yearOf(first),
      leftYear: yearOf(last),
      takenHow: first.how || null,
      /* Who was on the other side of the FIRST acquisition — the same record
         the row comes from. counterparty.js counts the whole table again on
         this field; detail.js prints it under every place it lists. */
      takenFrom: Array.isArray(first.counterparties) ? first.counterparties.filter((c) => c && c.name) : [],
      leftHow: last.how || null,
      instrument: last.instrument || first.instrument || null,
      led: last.led || null,
      movement: last.movement || null,
      becomes: last.becomes || null,
      cost: last.cost || null,
      evidence: (last.evidence && last.evidence.length ? last.evidence : first.evidence) || null,
      units: (last.units && last.units.length ? last.units : t.units) || [],
      stillBritish: t.stillBritish || null,
      takenCount: acqs.length,
      leftCount: deps.length,
    };

    const key = item.acq + '|' + item.dep;
    let cell = cells.get(key);
    if (!cell) { cell = { row: item.acq, col: item.dep, n: 0, items: [] }; cells.set(key, cell); }
    cell.n++; cell.items.push(item);
    rowTotal.set(item.acq, (rowTotal.get(item.acq) || 0) + 1);
    colTotal.set(item.dep, (colTotal.get(item.dep) || 0) + 1);
    counted++;
  }

  for (const cell of cells.values()) {
    cell.items.sort((a, b) => (a.leftYear ?? 9999) - (b.leftYear ?? 9999) || String(a.name).localeCompare(b.name));
  }

  const rows = rowIds.map((id) => ({
    id, kind: 'row', label: acqLabel(id), short: acqLabel(id, 'short'),
    gloss: (ACQ[id] && ACQ[id].gloss) || null,
    total: rowTotal.get(id) || 0,
    laterOnly: laterOnly.get(id) || 0,
    laterOnlyPlaces: laterOnlyPlaces.get(id) || [],
  }));
  const cols = colIds.map((id) => ({
    id, kind: 'col', label: depLabel(id), short: depLabel(id, 'short'),
    gloss: (DEP[id] && DEP[id].gloss) || null,
    total: colTotal.get(id) || 0,
  }));

  const filled = [...cells.values()].filter((c) => c.n > 0).length;

  return {
    rows, cols, cells, counted, uncounted,
    filled,
    possible: rows.length * cols.length,
    empty: rows.length * cols.length - filled,
    territories: territories.length,
    cell: (r, c) => cells.get(r + '|' + c) || null,
    itemsInRow(id) { return rows.length ? flatten(cells, (c) => c.row === id) : []; },
    itemsInCol(id) { return flatten(cells, (c) => c.col === id); },
  };
}

function flatten(cells, pred) {
  const out = [];
  for (const c of cells.values()) if (pred(c)) out.push(...c.items);
  out.sort((a, b) => (a.leftYear ?? 9999) - (b.leftYear ?? 9999) || String(a.name).localeCompare(b.name));
  return out;
}

/* ---------------------------------------------------------------- tolls -- */

/** Places that became independent countries, as opposed to being absorbed,
 *  handed on, or never leaving at all. The denominator for "mostly negotiated". */
export const BECAME_INDEPENDENT = new Set([
  'war-of-independence', 'insurgency-then-negotiation', 'partition',
  'negotiated-independence', 'referendum', 'lease-expiry',
]);

/** Does this departure record a death toll, and is it a range? */
export function tollOf(item) {
  const c = item && item.cost;
  if (!c) return null;
  const lo = Number.isFinite(c.deathsLow) ? c.deathsLow : null;
  const hi = Number.isFinite(c.deathsHigh) ? c.deathsHigh : null;
  const dLo = Number.isFinite(c.displacedLow) ? c.displacedLow : null;
  const dHi = Number.isFinite(c.displacedHigh) ? c.displacedHigh : null;
  if (lo == null && hi == null && dLo == null && dHi == null) return null;
  return { lo, hi, dLo, dHi, note: c.note || null, range: lo != null && hi != null && hi !== lo };
}
