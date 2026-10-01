/**
 * tours/answers.js — every number a beat prints, computed from the dataset.
 *
 * THE RULE (BRIEF, FEATURE_SPEC §0.3): no total is hard-coded and no figure is
 * invented. A beat that asks a question names an `answerFrom` key; this file is
 * the only place that answers one, and every answer here is a count or a share
 * over `data.*`, carrying the sentence that says how it was counted. If the
 * dataset changes, the questions change with it.
 *
 * The four definitions are re-stated here rather than imported so that the
 * tours module cannot be broken by an edit to a file it does not own. They are
 * the published vocabulary in app/js/map/definition.js and
 * app/js/legend/symbology.js and MUST stay identical to them; the ids, keys and
 * thresholds are the contract.
 */

const DEF_TESTS = {
  claimed: (e) => e.controlDegree >= 1 && e.status !== 'informal-sphere',
  administered: (e) => e.controlDegree >= 3,
  controlled: (e) => e.controlDegree === 5,
  influenced: (e) => e.controlDegree >= 1 || e.status === 'informal-sphere',
};

/** Mechanisms in `departures[].mechanism` that mean armed conflict. */
const ARMED = ['war-of-independence', 'insurgency-then-negotiation'];
/** A territory that never left is not an exit and must not be in the denominator. */
const NOT_AN_EXIT = ['still-a-territory'];

export function definitionTest(id) { return DEF_TESTS[id] || DEF_TESTS.claimed; }

/* ---------------------------------------------------------- statusCount --
   "How many different legal forms of British rule are on this map?" — the
   distinct `status` values actually drawn at this year under this definition.
   This is the same set the colour ribbon is printing along the foot of the
   plate, so the student can check the answer by counting swatches. */
export function statusCount(data, year, def) {
  const test = definitionTest(def);
  const kinds = new Map();
  for (const e of data.statusAt(year).values()) {
    if (!test(e)) continue;
    kinds.set(e.status, (kinds.get(e.status) || 0) + 1);
  }
  const list = [...kinds.entries()].sort((a, b) => b[1] - a[1]);
  return {
    value: list.length,
    unit: list.length === 1 ? 'kind of rule' : 'kinds of rule',
    detail: list,
    /* WHAT THE FOOT OF THE MAP ACTUALLY SHOWS. Round 3: "the reveal says
       ‘they are the swatches along the foot of the map’ when the foot shows
       eight grouped swatches". It was true of an earlier legend and it is not
       true of this one: the colour ribbon groups the statuses into families —
       one swatch reading "Ruled from London" stands for several distinct legal
       forms at once — so counting swatches gives a smaller number than counting
       statuses, and a student who checked would have found the app wrong. The
       full list of what was counted is printed under this sentence. */
    how: `Counted from this atlas: the distinct legal statuses actually drawn at ${year} under the definition “${def}”. The colour ribbon along the foot of the map does not show ${list.length} swatches, because it groups these statuses into colour families — one swatch can stand for several legal forms. Every one that was counted is listed here.`,
  };
}

/* -------------------------------------------------------- armedExitShare --
   "How much of the empire left after a war?" Counted over every
   `departures[].mechanism` in the dataset, with territories that never left
   excluded from the denominator, and the hazard of counting territories rather
   than people printed with the answer. */
export function armedExitShare(data) {
  let exits = 0, armed = 0;
  const armedIds = [];
  const byMech = new Map();
  for (const d of data.departures || []) {
    const m = d.mechanism || 'unknown';
    if (NOT_AN_EXIT.includes(m)) continue;
    exits++;
    byMech.set(m, (byMech.get(m) || 0) + 1);
    if (ARMED.includes(m)) { armed++; if (d.territoryId) armedIds.push(d.territoryId); }
  }
  const pct = exits ? Math.round((armed / exits) * 100) : 0;
  return {
    value: pct,
    unit: '%',
    armed, exits, armedIds,
    detail: [...byMech.entries()].sort((a, b) => b[1] - a[1]),
    how: `Counted from this atlas: ${armed} of ${exits} recorded departures carry the mechanism “war-of-independence” or “insurgency-then-negotiation”. Territories that never left are not in the denominator.`,
  };
}

/* ------------------------------------------------------ legislature1913 --
   The two-track sort. Four real territories at one real year, sorted by the
   `localLegislature` field this atlas records for the span that covers 1913.
   The answer is the dataset's, not ours, which is the whole point of asking. */
const TWO_TRACK = [
  { id: 'canada', bucket: 'elected' },
  { id: 'new-zealand', bucket: 'elected' },
  { id: 'british-india', bucket: 'none' },
  { id: 'kenya', bucket: 'none' },
  { id: 'nigeria', bucket: 'none' },
  { id: 'commonwealth-of-australia', bucket: 'elected' },
  { id: 'jamaica', bucket: 'none' },
  { id: 'cape-colony', bucket: 'elected' },
];
const ELECTED = ['responsible-government', 'sovereign-parliament', 'elected-assembly'];

export function legislature1913(data, year = 1913) {
  const out = [];
  for (const cand of TWO_TRACK) {
    const at = data.territoryAt ? data.territoryAt(cand.id, year) : null;
    if (!at || !at.span) continue;
    const ll = at.span.localLegislature || 'none';
    const bucket = ELECTED.includes(ll) ? 'elected' : 'none';
    out.push({
      id: cand.id,
      label: (at.territory && (at.territory.shortName || at.territory.name)) || cand.id,
      bucket,
      legislature: ll,
      franchise: at.span.franchise || null,
      status: at.status || null,
    });
  }
  /* Two from each side, in a stable but not alphabetical order, so the shape of
     the answer is not given away by the shape of the list. */
  const yes = out.filter((o) => o.bucket === 'elected').slice(0, 2);
  const no = out.filter((o) => o.bucket === 'none').slice(0, 2);
  const items = [yes[0], no[0], yes[1], no[1]].filter(Boolean);
  return {
    items,
    how: `Each answer is the “localLegislature” field this atlas records for the span covering ${year}, with the franchise line beside it.`,
  };
}

/* ------------------------------------------------------------ stillBritish --
   What is left. Counted as territories whose geographical coverage in this
   atlas has no end date — which is a bigger number than the fourteen Overseas
   Territories, and the reason why is the lesson.

   THE NAME IS THE SPAN'S NAME, NOT THE TERRITORY'S. Round 2 shipped a list
   headed "what is still British" with the word **Ireland** in it. The dataset
   was right and the panel was wrong: the open span for that record is labelled
   "Northern Ireland only" and carries four `lost` units. Three records are like
   that — Ireland, Cyprus (the Sovereign Base Areas alone) and the British
   Indian Ocean Territory (the Chagos Archipelago, and the court cases beside
   it). Where the open span lost units, the span's own label is what gets
   printed, and the units painted on the map are the span's units, never the
   territory's — otherwise the map lights the twenty-six counties of the Irish
   Free State as still British, which is the same lie in colour. */
export function stillBritish(data) {
  const list = [];
  const units = [];
  for (const t of data.territories || []) {
    const spans = (t.geoCoverage || []).filter((g) => !g.to || !g.to.value);
    const sb = t.stillBritish || null;
    if (!spans.length && !sb) continue;
    const open = spans[0] || null;
    const lost = (open && open.lost && open.lost.length) ? open.lost.length : 0;
    const name = t.shortName || t.name;
    /* The label only replaces the name where the record says the territory is
       no longer wholly British. "The whole island" is not a better name for
       Montserrat than Montserrat. */
    const display = lost && open && open.label ? open.label : name;
    const mine = [];
    for (const s of spans) for (const u of (s.units || [])) mine.push(u);
    if (!mine.length && sb && sb.units) for (const u of sb.units) mine.push(u);
    if (!mine.length) for (const u of (t.units || [])) mine.push(u);
    for (const u of mine) units.push(u);
    list.push({ id: t.id, territory: t, name, display, label: (open && open.label) || null, partial: !!lost, units: mine });
  }
  return {
    value: list.length,
    unit: list.length === 1 ? 'place' : 'places',
    list,
    units,
    names: list.map((e) => e.display),
    how: 'Counted from this atlas: every territory whose coverage has no end date. It is more than fourteen because this count also includes the United Kingdom itself, the Crown Dependencies, and Cyprus, where the Sovereign Base Areas stayed British. Three of them are drawn by the name of what is left, not the name of what was taken.',
  };
}

/* ----------------------------------------------------------- loopConquests --
   What the revenue → sepoys → conquest loop actually bought, counted rather
   than asserted: every acquisition in South Asia between the diwani and the
   end of the Company that this atlas records as conquest, annexation or a
   transfer at the end of a war. It exists so the mechanism beat can light the
   answer on the map instead of describing it in a fifth text card. */
const LOOP_MECHANISMS = ['conquest', 'annexation-of-existing-colony', 'war-transfer'];
export function loopConquests(data, from = 1765, to = 1856) {
  const units = new Set();
  const places = new Set();
  let steps = 0;
  for (const t of data.territories || []) {
    if (t.region !== 'south-asia') continue;
    for (const a of (t.acquisitions || [])) {
      const y = Number.isFinite(a.year) ? a.year : (a.date && a.date.value ? +String(a.date.value).slice(0, 4) : null);
      if (!Number.isFinite(y) || y < from || y > to) continue;
      if (!LOOP_MECHANISMS.includes(a.mechanism)) continue;
      steps++;
      places.add(t.shortName || t.name);
      for (const u of (a.units || [])) units.add(u);
      if (!(a.units || []).length) for (const u of (t.units || [])) units.add(u);
    }
  }
  return {
    value: steps,
    units: [...units],
    places: [...places],
    from, to,
    how: `Counted from this atlas: ${steps} acquisitions in South Asia between ${from} and ${to} recorded as conquest, annexation of an existing colony, or a transfer at the end of a war.`,
  };
}

/* ---------------------------------------------------------------- units --
   The plain readouts a beat may want in its sentence: how many units and
   territories are drawn right now. Always live, never stored. */
export function drawnAt(data, year, def) {
  const test = definitionTest(def);
  let units = 0;
  const terrs = new Set();
  for (const e of data.statusAt(year).values()) {
    if (!test(e)) continue;
    units++; terrs.add(e.territoryId);
  }
  return { units, territories: terrs.size };
}

export function answer(key, data, beat) {
  const m = (beat && beat.map) || {};
  const year = m.year || 1900;
  const def = m.def || 'claimed';
  switch (key) {
    case 'statusCount': return statusCount(data, year, def);
    case 'armedExitShare': return armedExitShare(data);
    case 'legislature1913': return legislature1913(data, year);
    case 'stillBritish': return stillBritish(data);
    case 'loopConquests': return loopConquests(data);
    default: return null;
  }
}

export default { answer, statusCount, armedExitShare, legislature1913, stillBritish, loopConquests, drawnAt, definitionTest };
