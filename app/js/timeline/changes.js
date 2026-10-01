/* timeline/changes.js — the answer to the coursebook's sixth charge.

   "The mechanism column is the pedagogy; a time-slider teaches chronology and
    unteaches causation. An animated map answers only *when*, which is the least
    interesting variable in the whole subject, and hides *how*."

   Round 2 answered that by diffing the map: for every year the map redraws, it
   compared `data.statusAt(y-1)` with `data.statusAt(y)` and printed the units
   that moved, with the mechanism attached. The mechanisms were right. The years
   were not, and the years are what a chronology is for.

   The bug was structural, not cosmetic. A status span is end-inclusive: British
   India's span runs *to the end of 1947*, so the map's paint changes at the 1948
   cut. Filing the change under the cut year filed the end of the Raj under 1948,
   Hong Kong under 1998, Kenyan independence under 1964 and Suez under 1957 — a
   printed table beats that every time, and should.

   So this file now separates two things a map conflates:

     THE EVENT YEAR   the year the dataset's own record is dated. 15 August 1947.
                      This is the year the change is filed under, and the year
                      Shift+→ lands on.
     THE MAP YEAR     the cut at which the drawn map actually redraws. 1948.
                      Printed on the card as a seam when the two differ, because
                      the difference is worth teaching and hiding it is a lie.

   Three further rules survive from round 2 and are load-bearing:
     · the subject of every sentence is computed from the geo units that moved,
       never from the territory that happened to own the record. That is what
       stops "British India taken by settlement" for the Andaman penal colony.
     · a change with no cited explanation prints no explanation, and never
       borrows a plausible one from a neighbouring record.
     · "mechanism not recorded" is printed only when the dataset really records
       nothing — not over a card that is at that moment quoting the mechanism.
       Where there is no acquisition or departure record, the span the unit moved
       *into* is read instead: its label and its `howControlWorked` are dataset
       prose and they say what happened.
*/

/* Typographic labels and a one-line gloss for the closed mechanism vocabulary
   (DATA_MODEL §3.2, §3.4). No facts are added here: the ids are the data. */
const MECH = {
  /* how it was taken */
  settlement: ['settlement', 'British subjects moved in on land held to be empty. It rarely was.'],
  conquest: ['conquest', 'Taken by military force from the people or state that held it.'],
  'chartered-company': ['chartered company', 'A company with a monopoly, an army and the right to tax — and a government that could disclaim it.'],
  'treaty-cession': ['treaty cession', 'Another state signed it over, almost always after a defeat. Read the treaty next to the war.'],
  purchase: ['purchase', 'Britain paid a state, a company or a claimed owner for it.'],
  'protectorate-declared': ['protectorate declared', 'Britain takes foreign policy and defence and leaves the ruler on the throne. Cheaper than conquest, easier to disown.'],
  lease: ['lease', 'Rented for a fixed term from a state that kept legal sovereignty.'],
  'annexation-of-existing-colony': ['annexation', 'An existing polity or colony absorbed whole into British rule.'],
  /* ROUND 3, THE DISQUALIFIER, second surface. Nine of the sixteen records
     carrying this tag have no European counterparty — Mysore, the Marathas,
     the Lahore Durbar, Konbaung Burma, Nepal, Bhutan — so a gloss keyed to
     the mechanism may not assert who the other party was. This one says only
     what is true of every record that carries it; the card names the
     counterparty itself. */
  'war-transfer': ['war transfer', 'Changed hands at the end of a war — between European powers at a conference table, or from a defeated state under an imposed treaty. Nobody living there was asked.'],
  mandate: ['mandate', 'A League of Nations trust to prepare a territory for self-rule; in practice a colony with paperwork.'],
  trusteeship: ['UN trusteeship', 'The mandate renamed after 1945, with a reporting duty attached.'],
  occupation: ['occupation', 'Held by the army without a claim to sovereignty. Often temporary, sometimes for decades.'],
  inheritance: ['inheritance', 'Came with a marriage, a crown or a company Britain already owned.'],
  'union-with-britain': ['union', 'Joined to the British state itself by an Act, not held as a colony.'],
  'informal-influence': ['informal influence', 'No claim, no flag, no governor — and British loans, British railways and British warships deciding the terms anyway.'],

  /* how it ended */
  'negotiated-independence': ['negotiated independence', 'Agreed at a conference and legislated at Westminster. The commonest ending, and the one students expect least.'],
  'war-of-independence': ['war of independence', 'Won by armed struggle against British forces.'],
  'insurgency-then-negotiation': ['insurgency, then negotiation', 'Rebellion suppressed militarily, then a handover a few years later — often to people who had opposed the rebels.'],
  partition: ['partition', 'Divided at independence, usually along a line drawn in a hurry by a British official.'],
  'transfer-to-another-power': ['transfer to another power', 'Handed to a different state rather than made independent.'],
  'lease-expiry': ['lease expiry', 'The lease ran out and the territory reverted.'],
  'merger-into-neighbour': ['merger into a neighbour', 'Joined an existing neighbouring state instead of standing alone.'],
  referendum: ['referendum', 'The decisive step was a popular vote.'],
  'still-a-territory': ['still a territory', 'It never left.'],
};

export function mechanismLabel(id) {
  const m = MECH[id];
  return m ? m[0] : String(id || 'unknown').replace(/-/g, ' ');
}
export function mechanismGloss(id) {
  const m = MECH[id];
  return m ? m[1] : '';
}

/* Informal empire is not a legal status and it does not end in independence:
   Argentina was never British, so it cannot become independent of Britain.
   Any record attached to an `informal-sphere` span is relabelled here, and the
   word "independence" is refused. (FEATURE_SPEC §1 charge 5; DIDACTIC M6.) */
const INFORMAL = 'informal-sphere';
const OCCUPIED = 'occupied';

/* Is this unit on the British map at all, on the widest possible reading?
   A span with controlDegree 0 — a Japanese occupation of Hong Kong, a place
   Britain has left — is in the status map but is not British under any
   definition.

   ROUND 4, and this is the correction the whole file turns on. Rounds 2 and 3
   used this predicate to decide that a unit entering or leaving the *definition*
   set, while still on the map under some other status, had not really changed —
   and printed over it: "Nothing was taken or given up here. The word 'British'
   was redefined, and this place crossed the line."

   That sentence was false every single time it fired, and structurally so.
   Inside one reading of "British" the test never moves; only the place's own
   status can. So a unit that starts passing the test has had its status change,
   which is a historical event with a record attached. The sentence was printed
   over the bombardment of Alexandria and the destruction of Urabi's army at
   Tel el-Kebir (1882), over the end of the Egyptian protectorate (1922), over
   the invasions of Iraq and Persia (1941) and over Fernando Pó (1834). Calling
   an invasion a redefinition is a euphemism for invasion, and it is the one
   thing DIDACTIC_SPEC §6 disqualifies outright.

   So the predicate stays, and its only remaining job is the honest one: to say
   whether the place was — or still is — drawn on this map under a status this
   reading of the word does not count. That is a *seam*, printed under the
   mechanism, never in place of it. The mechanism always comes from the record.

   The redefinition sentence now lives where it is true: the definition switch
   itself (`defDiff` below, rendered when a student presses 1–4 and the year
   does not move). */
const onMapAtAll = (e) => !!e && (e.controlDegree >= 1 || e.status === INFORMAL);

/* A departure sentence has to survive being read out loud in a classroom.
   The mechanism vocabulary is the dataset's and is never overwritten, but two
   statuses change what the same word means, and both were producing sentences
   a student would lose marks for:
     informal-sphere — Argentina was never British, so it cannot leave Britain;
                       what ends is the informal relationship.
     occupied        — a British military administration handing a country back
                       to its own government is not that country becoming
                       independent of Britain. */
export function departurePhrase(mechanismId, status) {
  if (status === INFORMAL) return { text: "Britain's informal empire here ends", gloss: 'The relationship ends without anyone becoming independent, because this place was never a British possession.' };
  if (status === OCCUPIED && /independence/.test(String(mechanismId || ''))) {
    return { text: 'the occupation ends by agreement', gloss: 'A military administration handed back, not a colony released: the country was not Britain’s to grant independence to.' };
  }
  return null;
}

/* ---------------------------------------------------------------- text -- */

/* The first clause of a `how`, printed inline under the change. Cut at the end
   of the first sentence when that is short enough, otherwise at a word
   boundary. Never rewritten, never summarised — the full sentence is in the
   expander.

   Round 2 cut at /[.;]\s/ and kept the delimiter, so cards ended on a dangling
   semicolon: "…and held it for four years;". A semicolon is a hinge, not a
   stop: cutting there always loses the second half of the thought, so it is now
   marked with an ellipsis and the clause before it is kept whole. */
export function firstClause(text, max = 132) {
  const s = String(text || '').trim().replace(/\s+/g, ' ');
  if (!s) return '';
  if (s.length <= max) return s;
  const stop = s.search(/[.!?]\s/);
  if (stop > 24 && stop <= max) return s.slice(0, stop + 1);
  const semi = s.search(/;\s/);
  if (semi > 24 && semi <= max) return s.slice(0, semi) + '…';
  const cut = s.lastIndexOf(' ', max);
  return s.slice(0, cut > 24 ? cut : max).replace(/[,;:]$/, '') + '…';
}

/* THE LOSING SIDE, BY NAME. `counterparties[].lost` is present in this dataset
   for every major acquisition and departure and round 4 rendered none of it —
   so Shah Alam II and the Nawabs, and the Bengali weavers of the 1770 famine
   year, existed only inside prose. It is a first-class field on every card
   now. Only entries that actually say what was lost are carried: a name with
   no loss beside it is a label, not a perspective. */
function partiesOf(rec, side) {
  if (!rec || !Array.isArray(rec.counterparties)) return [];
  return rec.counterparties
    .filter((c) => c && c.name)
    .map((c) => ({
      name: String(c.name),
      kind: String(c.kind || '').replace(/-/g, ' '),
      lost: String(c.lost || '').trim(),
      note: String(c.note || '').trim(),
      side,
    }));
}

function instrumentOf(rec) {
  const i = rec && rec.instrument;
  if (!i || !i.name) return null;
  return {
    name: String(i.name),
    kind: String(i.kind || '').replace(/-/g, ' '),
    signed: (i.signed && i.signed.display) || '',
    note: String(i.note || '').trim(),
  };
}

const SOFT_PRECISION = new Set(['circa', 'contested', 'range', 'decade', 'century']);
const isSoft = (d) => !!d && (d.circa === true || SOFT_PRECISION.has(d.precision));

/* ----------------------------------------------------------- the model -- */

/**
 * createChangeModel(data) -> { forDefinition(id, test, label), statusLabel }
 *
 * `forDefinition` returns, for one reading of the word "British":
 *   years   Map<eventYear, { year, groups[], records[], delta, inUnits,
 *                            outUnits, shiftUnits, mapYears[] }>
 *   counts  Map<cutYear, { units, territories }>   — what the map draws there
 *   at(y)   the counts holding in any year, not only a cut year
 *   changeYears  sorted array: every year this definition has something to say
 * built once per definition and cached.
 */
export function createChangeModel(data) {
  const tl = data.timeline();
  const cuts = tl.cuts;
  const statusName = new Map((data.statuses || []).map((s) => [s.id, s.label || s.id]));
  const statusShort = new Map((data.statuses || []).map((s) => [s.id, s.short || '']));
  const cache = new Map();

  const statusLabel = (id) => statusName.get(id) || String(id || '').replace(/-/g, ' ');

  /* Records indexed by year once, so matching a group is a small scan. */
  const acqByYear = new Map(), depByYear = new Map(), evByYear = new Map();
  const push = (m, y, v) => { if (!Number.isFinite(y)) return; let a = m.get(y); if (!a) m.set(y, (a = [])); a.push(v); };
  for (const a of data.acquisitions) push(acqByYear, a.year, a);
  for (const d of data.departures) push(depByYear, d.year, d);
  for (const e of data.events) if (e.changedStatus) push(evByYear, e.year, e);

  const areaOf = (unitId) => {
    const m = data.unitMeta && data.unitMeta.get(unitId);
    const a = m && Number(m.area_km2);
    return Number.isFinite(a) && a > 0 ? a : 0;
  };

  /* The name of a place, from the units that actually changed. If those units
     are exactly a territory's units, the territory is the place; otherwise the
     units are, and they are named individually. This single rule is what stops
     "British India taken by settlement". */
  function subjectOf(unitIds, territoryId) {
    const t = territoryId ? data.get(territoryId) : null;
    if (t && t.units && t.units.length === unitIds.length) {
      const set = new Set(t.units);
      if (unitIds.every((u) => set.has(u))) return { text: t.name, whole: true };
    }
    const names = unitIds.map((u) => data.unitName(u));
    const listed = names.length === 1 ? names[0]
      : names.length === 2 ? names[0] + ' and ' + names[1]
      : `${names[0]}, ${names[1]} and ${names.length - 2} more`;
    /* part of a territory moved, not all of it — so the territory is context,
       in brackets, and never the subject of the sentence. */
    return { text: t ? `${listed} (${t.name})` : listed, whole: false };
  }

  /* The record that explains a group: it must name at least one of the units
     that moved (a record that lists its own units and none of ours explains
     nothing, however tempting its territory name is). Records with no units of
     their own fall back to a territory match. The cut year is searched first,
     then the year before it, because a span is end-inclusive: a departure dated
     15 August 1947 shows on the map as the province leaving at the 1948 cut.
     A record dated *after* the change never explains it. */
  function findRecord(byYear, year, territoryId, unitIds, back = 1) {
    const want = new Set(unitIds);
    let best = null, bestScore = 0;
    for (const dy of back ? [0, -1] : [0]) {
      const list = byYear.get(year + dy);
      if (!list) continue;
      for (const r of list) {
        const hasUnits = !!(r.units && r.units.length);
        const overlap = hasUnits ? r.units.reduce((n, u) => n + (want.has(u) ? 1 : 0), 0) : 0;
        const exact = r.territoryId === territoryId;
        if (hasUnits ? !overlap : !exact) continue;
        const score = (dy === 0 ? 10000 : 0) + (exact ? 1000 : 0) + overlap * 10 - Math.abs(dy);
        if (score > bestScore) { bestScore = score; best = r; }
      }
      if (best && dy === 0) break;
    }
    return best;
  }

  function findEvent(year, territoryId, unitIds) {
    const want = new Set(unitIds);
    let best = null, bestScore = 0;
    for (const dy of [0, -1]) {
      const list = evByYear.get(year + dy);
      if (!list) continue;
      for (const e of list) {
        const byUnit = (e.unitIds || []).some((u) => want.has(u)) ? 5 : 0;
        const byTerr = (e.territoryIds || []).includes(territoryId) ? 10 : 0;
        if (!byUnit && !byTerr) continue;
        const score = byUnit + byTerr + (dy === 0 ? 20 : 0);
        if (score > bestScore) { bestScore = score; best = e; }
      }
      if (best && dy === 0) break;
    }
    return best;
  }

  function build(test, defLabel) {
    const counts = new Map();
    const everSeen = new Set();          // units this definition has drawn before
    const finished = [];                 // every change, in cut order
    let prev = null, prevRaw = null;

    for (const c of cuts) {
      const seg = data.statusAt(c);
      const cur = new Map();
      const terrSet = new Set();
      for (const [u, e] of seg) if (test(e)) { cur.set(u, e); terrSet.add(e.territoryId); }
      counts.set(c, { units: cur.size, territories: terrSet.size });

      if (prev) {
        /* group key: one chip per place per transition, never per record */
        const groups = new Map();
        const grab = (key, seed) => { let g = groups.get(key); if (!g) groups.set(key, (g = seed)); return g; };

        for (const [u, e] of cur) {
          const p = prev.get(u);
          if (!p) {
            /* Was it already drawn last year, under a status this reading does
               not count? Then the place's own status has moved — an invasion, a
               protectorate declared, a company charter — and the record that
               says so is the sentence. What the threshold adds is a seam, not
               a mechanism: `belowLine` is that seam and nothing more. */
            const pr0 = prevRaw ? prevRaw.get(u) : null;
            const pr = onMapAtAll(pr0) ? pr0 : null;
            const g = grab('in|' + e.territoryId + '|' + e.status + '|' + (pr ? pr.status : ''),
              { dir: 'in', territoryId: e.territoryId, fromTerritoryId: pr ? pr.territoryId : null,
                fromStatus: pr ? pr.status : null, toStatus: e.status,
                belowLine: !!pr, units: [], entry: e, prevEntry: pr || (pr0 || null), rawTo: e });
            g.units.push(u);
          } else if (p.territoryId !== e.territoryId || p.status !== e.status) {
            const g = grab('shift|' + p.territoryId + '>' + e.territoryId + '|' + p.status + '>' + e.status,
              { dir: 'shift', territoryId: e.territoryId, fromTerritoryId: p.territoryId, fromStatus: p.status, toStatus: e.status, units: [], entry: e, prevEntry: p, rawTo: e });
            g.units.push(u);
          }
        }
        for (const [u, p] of prev) {
          if (cur.has(u)) continue;
          const raw = seg.get(u) || null;         // still in the record, below the line?
          const cr = onMapAtAll(raw) ? raw : null;
          const g = grab('out|' + p.territoryId + '|' + p.status + '|' + (raw ? raw.status + '/' + raw.controlDegree : ''),
            { dir: 'out', territoryId: p.territoryId, toTerritoryId: cr ? cr.territoryId : null,
              fromStatus: p.status, toStatus: cr ? cr.status : null,
              belowLine: !!cr, units: [], entry: cr || null, prevEntry: p, rawTo: raw });
          g.units.push(u);
        }

        for (const g of groups.values()) finished.push(finish(g, c, everSeen, defLabel));
      }
      for (const u of cur.keys()) everSeen.add(u);
      prev = cur; prevRaw = seg;
    }

    /* ---- file every change under its own record's year, not the map's cut -- */
    const years = new Map();
    const bucket = (y) => {
      let r = years.get(y);
      if (!r) years.set(y, (r = { year: y, groups: [], records: [], delta: 0, inUnits: 0, outUnits: 0, shiftUnits: 0, unitsChanged: 0, mapYears: new Set() }));
      return r;
    };
    const usedRecords = new Set();
    const redraws = new Map();
    for (const g of finished) {
      if (g.mapYear !== g.year) {
        let list = redraws.get(g.mapYear);
        if (!list) redraws.set(g.mapYear, (list = []));
        list.push(g);
      }
      const r = bucket(g.year);
      r.groups.push(g);
      if (g.dir === 'in') r.inUnits += g.units.length;
      else if (g.dir === 'out') r.outUnits += g.units.length;
      else r.shiftUnits += g.units.length;
      if (g.mapYear !== g.year) r.mapYears.add(g.mapYear);
      if (g.recordId) usedRecords.add(g.recordId);
      if (g.mirrorId) usedRecords.add(g.mirrorId);
    }

    /* ---- one place, one card -------------------------------------------
       Round 3 printed, at 1882, "+ Egypt · now counts as claimed · Nothing was
       taken" and, four cards to the right, "+ Egypt · taken by occupation ·
       14 September 1882 · no map change under 'claimed'". Two cards about the
       same act, contradicting each other, and the second seam was false: the
       map plainly redraws Egypt in 1882.

       A dated record is a separate card only when the map really did not move
       for it. If every unit it names is already accounted for by a change filed
       in the same year, it belongs to that change: it is folded in as a second
       account of the same act, printed inside the card, and never as a rival
       card. */
    const byFiledYear = new Map();
    for (const g of finished) {
      let a = byFiledYear.get(g.year);
      if (!a) byFiledYear.set(g.year, (a = []));
      a.push(g);
    }
    for (const [, list] of [...acqByYear, ...depByYear]) {
      for (const r of list) {
        if (usedRecords.has(r.id)) continue;
        const ru = r.units && r.units.length ? r.units : ((data.get(r.territoryId) || {}).units || null);
        if (!ru || !ru.length) continue;
        for (const dy of [0, 1]) {
          const cands = byFiledYear.get(r.year + dy);
          if (!cands) continue;
          const host = cands.find((g) => {
            if (!ru.every((u) => g.units.includes(u))) return false;
            return g.territoryId === r.territoryId || g.fromTerritoryId === r.territoryId ||
              g.toTerritoryId === r.territoryId || g.mirrorTerritoryId === r.territoryId;
          });
          if (host) {
            host.alsoRecords.push(describeRecord(r, r.year));
            usedRecords.add(r.id);
            break;
          }
        }
      }
    }

    /* Records dated in a year whose units never moved on this definition. They
       are real, they are dated, and round 2 buried them in an expander that
       only opened on years that already had changes — so 1930 (a departure) and
       1667, 1756, 1805, 1864, 1927, 1954, 1973 read as empty years. They are
       cards now, in their own right, marked as records rather than movements. */
    for (const [y, list] of [...acqByYear, ...depByYear]) {
      for (const r of list) {
        if (usedRecords.has(r.id)) continue;
        bucket(y).records.push(describeRecord(r, y));
      }
    }

    for (const rec of years.values()) {
      rec.groups.sort(rank);
      rec.records.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
      rec.delta = rec.inUnits - rec.outUnits;
      rec.unitsChanged = rec.inUnits + rec.outUnits + rec.shiftUnits;
      rec.mapYears = [...rec.mapYears].sort((a, b) => a - b);
    }
    for (const [y, list] of redraws) list.sort(rank);
    return { years, counts, redraws };
  }

  /* A dataset record that is dated in a year but moved nothing the map draws.
     Same two rules as the row itself: name the subject from the units the
     record names, and never say a place that was never British became
     independent of Britain. */
  function describeRecord(r, y) {
    const out = r.kind === 'departure';
    const a1 = data.territoryAt ? data.territoryAt(r.territoryId, y) : null;
    const a0 = data.territoryAt ? data.territoryAt(r.territoryId, y - 1) : null;
    const st = (a0 && a0.status === INFORMAL) ? INFORMAL : (a0 && a0.status) || (a1 && a1.status) || null;
    const informal = st === INFORMAL || /informal/.test(String(r.mechanism || ''));
    const phrase = out ? departurePhrase(r.mechanism, st) : null;
    const units = (r.units && r.units.length ? r.units : (data.get(r.territoryId) || { units: [] }).units) || [];
    return {
      kind: 'record',
      dir: out ? 'out' : 'in',
      year: y,
      recordId: r.id,
      name: subjectOf(units, r.territoryId).text,
      subject: subjectOf(units, r.territoryId).text,
      territoryId: r.territoryId,
      mechanism: phrase ? phrase.text
        : informal ? (out ? "Britain's informal empire here ends" : "enters Britain's informal empire")
        : (out ? 'left by ' + mechanismLabel(r.mechanism) : 'taken by ' + mechanismLabel(r.mechanism)),
      mechanismId: r.mechanism || null,
      gloss: phrase ? phrase.gloss : mechanismGloss(r.mechanism),
      how: r.how || '',
      howShort: firstClause(r.how || '', 148),
      howTruncated: firstClause(r.how || '', 148) !== String(r.how || '').trim().replace(/\s+/g, ' '),
      date: r.date && r.date.display ? r.date.display : String(r.year),
      dateNote: r.date && r.date.display ? r.date.display : '',
      areaKm2: 0,
      population: null,
      soft: isSoft(r.date),
      units,
      counterparties: partiesOf(r, out ? 'departure' : 'acquisition'),
      instrument: instrumentOf(r),
      resistance: String(r.resistance || '').trim(),
      recordEvidence: Array.isArray(r.evidence) ? r.evidence : [],
    };
  }

  /* Turn a raw group into the thing the row prints.
     Order of authority for the explanation: the acquisition or departure record
     that names these units; then a `changedStatus` event that names them; then
     the span the unit moved into — its own label and `howControlWorked`, which
     is dataset prose about this place in this year; then the dataset's
     definition of the status. Nothing else, and nothing invented. */
  function finish(g, cutYear, everSeen, defLabel) {
    const units = g.units.slice().sort();
    const subj = subjectOf(units, g.territoryId);
    const terr = data.get(g.territoryId);
    const informal = g.fromStatus === INFORMAL || g.toStatus === INFORMAL;
    const resumed = g.dir === 'in' && !g.belowLine && units.every((u) => everSeen.has(u));

    /* the span this place moved into, and the one it came out of */
    const intoSpan = (g.rawTo && g.rawTo.span) || null;
    const rawToStatus = g.rawTo ? g.rawTo.status : null;
    const rawToDegree = g.rawTo ? g.rawTo.controlDegree : null;

    let record = null, mirror = null, mech = '', gloss = '', how = '', source = '';
    if (g.dir === 'in') {
      record = findRecord(acqByYear, cutYear, g.territoryId, units);
      /* Egypt in 1882 is one event held in two territory records: the taking,
         filed under `egypt`, and the ending of the informal relationship, filed
         under `egypt-before-the-occupation`. Round 3 printed both as separate
         and contradictory cards. The mirror is found here and folded into the
         one card, so the row states the change once. */
      if (g.fromTerritoryId && g.fromTerritoryId !== g.territoryId) {
        mirror = findRecord(depByYear, cutYear, g.fromTerritoryId, units);
      }
      if (g.toStatus === INFORMAL) {
        /* Entering informal empire, whatever the record calls it: Argentina was
           not "taken". Only the destination decides this — round 4's bug was
           testing either end, which made the occupation of Egypt, a place
           *leaving* informal empire, read "informal empire begins". */
        mech = 'informal empire begins';
        gloss = 'Britain never claimed this place and ran a great deal of it anyway — through loans, railways, shipping and the navy.';
      } else if (record) {
        mech = 'taken by ' + mechanismLabel(record.mechanism);
        gloss = mechanismGloss(record.mechanism);
      } else if (mirror) {
        /* Only the losing side kept a record of it. Its `how` is the account;
           its mechanism describes an ending, so it is not borrowed as a verb. */
        mech = statusLabel(g.fromStatus) + ' → ' + statusLabel(g.toStatus);
        gloss = statusShort.get(g.toStatus) || '';
      } else if (resumed) {
        mech = 'British rule resumes as ' + article(statusLabel(g.toStatus));
      } else {
        mech = 'enters as ' + article(statusLabel(g.toStatus));
      }
      source = record ? 'acquisition' : '';
    } else if (g.dir === 'out') {
      record = findRecord(depByYear, cutYear, g.territoryId, units);
      /* The mirror on the way out: the record filed under whatever the place
         became. Britain leaving Egypt in 1922 is one act with two records. */
      if (g.toTerritoryId && g.toTerritoryId !== g.territoryId) {
        mirror = findRecord(acqByYear, cutYear, g.toTerritoryId, units);
      }
      const raw = record ? record.mechanism : null;
      const phrase = departurePhrase(raw, g.fromStatus);
      if (phrase) {
        mech = phrase.text; gloss = phrase.gloss;
      } else if (raw) {
        mech = 'left by ' + mechanismLabel(raw);
        gloss = mechanismGloss(raw);
      } else if (rawToStatus && rawToStatus !== g.fromStatus) {
        /* Still in the record, under a status this definition does not count:
           Singapore is not a Crown colony that "ends", it is a Crown colony
           that becomes a Japanese military occupation, and the dataset says so. */
        mech = statusLabel(g.fromStatus) + ' → ' + statusLabel(rawToStatus);
        gloss = statusShort.get(rawToStatus) || '';
      } else if (rawToStatus && rawToDegree === 0) {
        /* Same status, no British authority left in it: Australia is still a
           Dominion in 1942 and Britain can no longer legislate for it. */
        mech = 'still ' + article(statusLabel(g.fromStatus)) + ' — British authority here ends';
        gloss = '';
      } else {
        mech = statusLabel(g.fromStatus) + ' ends';
      }
      source = record ? 'departure' : '';
    } else {
      const a = statusLabel(g.fromStatus), b = statusLabel(g.toStatus);
      if (a !== b) {
        mech = a + ' → ' + b;
      } else {
        const fromT = data.get(g.fromTerritoryId), toT = data.get(g.territoryId);
        mech = fromT && toT ? 'moved from ' + fromT.name + ' to ' + toT.name : 'reorganised';
      }
      record = findRecord(acqByYear, cutYear, g.territoryId, units, 0);
      source = record ? 'acquisition' : '';
    }

    /* THE EVENT YEAR. A record dated 15 August 1947 is filed under 1947, even
       though the map — whose spans are end-inclusive — redraws at the 1948 cut.
       Where they differ the card prints the seam rather than hiding it. */
    const dated = record || mirror;
    const year = (dated && Number.isFinite(dated.year) &&
      (dated.year === cutYear || (g.dir !== 'shift' && dated.year === cutYear - 1)))
      ? dated.year : cutYear;
    const dateNote = dated && dated.date && dated.date.display ? dated.date.display : '';

    if (record && record.how) { how = record.how; }
    if (!how && mirror && mirror.how) { how = mirror.how; source = source || (g.dir === 'in' ? 'departure' : 'acquisition'); }
    let ev = null;
    if (!how) {
      ev = findEvent(cutYear, g.territoryId, units);
      if (ev && (ev.summary || ev.significance || ev.title)) {
        how = ev.summary || ev.significance || ev.title;
        source = 'event';
      }
    }
    let howIsDefinition = false;
    if (!how && intoSpan) {
      /* The span the place moved into is dataset prose about this place in this
         year: "Japan renamed the island Syonan-to…", "Australia adopted the
         Statute of Westminster in 1942 and backdated it to 1939…". */
      how = intoSpan.howControlWorked || intoSpan.note || '';
      if (how) source = 'span';
    }
    if (!how) {
      const sid = g.dir === 'out' ? g.fromStatus : g.toStatus;
      const short = statusShort.get(sid);
      if (short) { how = statusLabel(sid) + ': ' + short; source = 'status-definition'; howIsDefinition = true; }
    }
    /* Only now, with every source exhausted, may the card say so. It never
       prints "mechanism not recorded" over a card that records the mechanism. */
    if (!record && !mirror && !how && g.dir !== 'shift') mech += ' — mechanism not recorded';

    const spanLabel = intoSpan && intoSpan.label ? intoSpan.label : '';

    /* THE THRESHOLD SEAM. Where the redefinition sentence used to be, and all
       that was ever true in it: this place is drawn on the map on either side
       of the change, under a status this reading of "British" does not count.
       That is worth saying — it is Move 1 seen from the year row — and it is
       said *under* the mechanism, never instead of it. */
    let threshold = null, thresholdWhy = '';
    if (g.belowLine) {
      const other = statusLabel(g.dir === 'in' ? g.fromStatus : g.toStatus).toLowerCase();
      const mine = statusLabel(g.dir === 'in' ? g.toStatus : g.fromStatus).toLowerCase();
      threshold = g.dir === 'in' ? `counts as ${defLabel} from here` : `stops counting as ${defLabel} here`;
      thresholdWhy = g.dir === 'in'
        ? `This place is drawn on the map on both sides of the change — ${other} before it, ${mine} after. Under “${defLabel}” it begins counting here. Something did change: its legal status.`
        : `This place is still drawn on the map after the change, as ${other}. Under “${defLabel}” it stops counting here. Something did change: its legal status.`;
    }
    /* What the map's own colours did, printed whenever both ends are known and
       differ — so a card whose verb comes from a record still says what legal
       status the place moved between. */
    const statusMove = (g.fromStatus && g.toStatus && g.fromStatus !== g.toStatus)
      ? statusLabel(g.fromStatus) + ' → ' + statusLabel(g.toStatus) : '';

    const soft = !!(record && isSoft(record.date)) ||
      !!(g.entry && g.entry.circa && g.entry.spanStart === cutYear) ||
      !!(g.prevEntry && g.prevEntry.contested);

    /* Population belongs to the territory, and this dataset has no per-unit
       figure. So a group is credited with a population only when it moved the
       whole territory; a fragment ranks on area, and says so in the list. */
    const pop = subj.whole && terr && terr.peak ? Number(terr.peak.population) : NaN;
    const area = units.reduce((n, u) => n + areaOf(u), 0);

    return {
      kind: 'change',
      dir: g.dir,
      belowLine: !!g.belowLine,
      threshold,
      thresholdWhy,
      statusMove,
      year,
      mapYear: cutYear,
      units,
      subject: subj.text,
      wholeTerritory: subj.whole,
      territoryId: g.territoryId,
      fromTerritoryId: g.fromTerritoryId || null,
      toTerritoryId: g.toTerritoryId || null,
      fromStatus: g.fromStatus, toStatus: g.toStatus,
      fromStatusLabel: g.fromStatus ? statusLabel(g.fromStatus) : null,
      toStatusLabel: g.toStatus ? statusLabel(g.toStatus) : null,
      mechanism: mech,
      dateNote,
      spanLabel,
      mechanismId: record && record.mechanism ? record.mechanism : null,
      gloss,
      how,
      howIsDefinition,
      howShort: firstClause(how, 148),
      howTruncated: firstClause(how, 148) !== String(how || '').trim().replace(/\s+/g, ' '),
      source,
      eventTitle: ev ? ev.title : null,
      recordId: record ? record.id : null,
      mirrorId: mirror ? mirror.id : null,
      mirrorHow: mirror && mirror.how && mirror.how !== how ? mirror.how : '',
      mirrorMech: mirror ? (mirror.kind === 'departure' ? 'left by ' + mechanismLabel(mirror.mechanism) : 'taken by ' + mechanismLabel(mirror.mechanism)) : '',
      mirrorTerritoryId: mirror ? mirror.territoryId : null,
      alsoRecords: [],
      /* Who lost, and what they said they lost. Both sides of a mirrored act
         are carried, in record order, so Egypt in 1882 names the bondholders'
         side and Urabi's. */
      counterparties: [
        ...partiesOf(record, g.dir === 'in' ? 'acquisition' : 'departure'),
        ...partiesOf(mirror, g.dir === 'in' ? 'departure' : 'acquisition'),
      ],
      instrument: instrumentOf(record) || instrumentOf(mirror),
      resistance: String((record && record.resistance) || (mirror && mirror.resistance) || '').trim(),
      /* The record's OWN evidence. Round 4 headed the 1765 diwani card with
         Joya Chatterji on the 1947 boundary, because the card fell back to the
         territory's whole bibliography. The record cites itself first now. */
      recordEvidence: [
        ...(record && Array.isArray(record.evidence) ? record.evidence : []),
        ...(mirror && Array.isArray(mirror.evidence) ? mirror.evidence : []),
      ],
      soft,
      resumed,
      population: Number.isFinite(pop) && pop > 0 ? pop : null,
      populationYear: terr && terr.peak ? terr.peak.populationYear : null,
      areaKm2: area,
      informal,
    };
  }

  const VOWEL = /^[aeiou]/i;
  const article = (label) => (VOWEL.test(label) ? 'an ' : 'a ') + label.toLowerCase();

  /* Ordered by the number of people the dataset records, then — for places with
     no population figure — by area. Stated in the expander, so the ordering is
     itself readable. Ties break on the unit id, so a deep link reproduces. */
  function rank(a, b) {
    if ((a.population != null) !== (b.population != null)) return a.population != null ? -1 : 1;
    if (a.population != null && a.population !== b.population) return b.population - a.population;
    if (a.areaKm2 !== b.areaKm2) return b.areaKm2 - a.areaKm2;
    return a.units[0] < b.units[0] ? -1 : a.units[0] > b.units[0] ? 1 : 0;
  }

  return {
    statusLabel,
    /** forDefinition(id, test) — cached per definition id. */
    forDefinition(id, test, label) {
      let m = cache.get(id);
      if (!m) {
        const built = build(test, label || id);
        /* counts hold from one cut to the next */
        const cutList = cuts;
        const at = (y) => {
          let lo = 0, hi = cutList.length - 1, best = 0;
          if (!cutList.length) return { units: 0, territories: 0 };
          while (lo <= hi) { const mid = (lo + hi) >> 1; if (cutList[mid] <= y) { best = mid; lo = mid + 1; } else hi = mid - 1; }
          return built.counts.get(cutList[best]) || { units: 0, territories: 0 };
        };
        /* Every year this definition has something to say: the years records
           are dated, and the years the drawn map redraws. Both, because a
           student jumping forward wants 1947 *and* wants to be able to reach
           the year the paint changes. */
        const changeYears = [...new Set([...built.years.keys(), ...cutList])].sort((a, b) => a - b);
        m = { id, years: built.years, counts: built.counts, redraws: built.redraws, at, changeYears, extremes: extremesOf(built, cutList) };
        cache.set(id, m);
      }
      return m;
    },
  };

  /* The widest year, the biggest gain and the biggest loss — measured on this
     definition, not asserted, and recomputed when the definition changes.
     Measured on the map's own cuts, because "widest" is a fact about the drawn
     map; the gain and loss are read back to the event year so the card and the
     row beneath it name the same year. */
  function extremesOf(built, cutList) {
    let peak = null, rise = null, fall = null;
    for (const c of cutList) {
      const n = (built.counts.get(c) || { units: 0 }).units;
      if (!peak || n > peak.n) peak = { year: c, n };
    }
    for (const [y, rec] of built.years) {
      if (rec.inUnits && (!rise || rec.inUnits > rise.d)) rise = { year: y, d: rec.inUnits };
      if (rec.outUnits && (!fall || rec.outUnits > fall.d)) fall = { year: y, d: rec.outUnits };
    }
    if (fall) fall = { year: fall.year, d: -fall.d };
    return { peak, rise, fall };
  }
}

/* =====================================================================
   THE DEFINITION DIFF — where "the word British was redefined" is true.

   Move 1 (FEATURE_SPEC §1 charge 4) holds the year still and changes what the
   word means. That, and only that, is a redefinition: no army moves, no treaty
   is signed, no date changes. The same map, the same year, a different line.

   This function is the diff between two readings of the word at one year. It is
   the sentence rounds 2 and 3 printed over invasions, put where it is a fact:
   press 1–4 at 1913 and the row says which places crossed the line and in which
   direction, with their real legal status on both sides.
   ===================================================================== */
export function definitionDiff(data, year, oldDef, newDef, statusLabel) {
  const seg = data.statusAt(year);
  const label = statusLabel || ((s) => String(s || '').replace(/-/g, ' '));
  const groups = new Map();
  let inUnits = 0, outUnits = 0, before = 0, after = 0;
  const beforeT = new Set(), afterT = new Set();

  for (const [u, e] of seg) {
    const was = !!oldDef.test(e), now = !!newDef.test(e);
    if (was) { before++; beforeT.add(e.territoryId); }
    if (now) { after++; afterT.add(e.territoryId); }
    if (was === now) continue;
    const dir = now ? 'in' : 'out';
    if (now) inUnits++; else outUnits++;
    const key = dir + '|' + e.territoryId + '|' + e.status;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { dir, territoryId: e.territoryId, status: e.status, statusLabel: label(e.status), controlDegree: e.controlDegree, units: [] }));
    g.units.push(u);
  }

  const rows = [...groups.values()];
  for (const g of rows) {
    const t = data.get(g.territoryId);
    const whole = t && t.units && t.units.length === g.units.length && g.units.every((u) => t.units.includes(u));
    g.subject = whole && t ? t.name
      : g.units.length === 1 ? data.unitName(g.units[0])
      : `${data.unitName(g.units[0])} and ${g.units.length - 1} more${t ? ' (' + t.name + ')' : ''}`;
  }
  rows.sort((a, b) => (a.dir === b.dir ? b.units.length - a.units.length : a.dir === 'in' ? -1 : 1));

  return {
    year,
    from: oldDef, to: newDef,
    rows,
    inUnits, outUnits,
    before: { units: before, territories: beforeT.size },
    after: { units: after, territories: afterT.size },
  };
}

export default { createChangeModel, definitionDiff, mechanismLabel, mechanismGloss, firstClause };
