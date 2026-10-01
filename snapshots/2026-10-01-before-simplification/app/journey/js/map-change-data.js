/** Journey-only, year-end snapshots. The original atlas and its data are untouched.
 * The source reader retains a terminal period through its last calendar year;
 * here an authority ending during Y is absent at 31 December Y. Exact dates stay
 * in the source records; year-only and uncertain dates remain approximate.
 */
const cache = new WeakMap();
const SOFT = new Set(["circa", "decade", "range", "contested", "unknown"]);
const NOT_CONTROLLED = new Set([
  "independent",
  "independence",
  "post-independence",
  "former",
  "lost",
  "ceded",
  "relinquished",
  "withdrawn",
  "none",
  "not-british",
  "pre-colonial",
  "commonwealth",
]);
const list = (value) =>
  value == null ? [] : Array.isArray(value) ? value : [value];

export const MAP_SNAPSHOT_NOTE =
  "31 December snapshots. Boundaries are approximate modern areas, not historical frontiers; hatching means partial authority. Dates described as approximate remain estimates.";

/** Brief authored context, linked to checked museum, archival or primary sources.
 * These are selected landmarks, not an exhaustive narrative or a scale score.
 */
export const MAP_MILESTONES = Object.freeze([
  {
    year: 1757,
    territoryId: "bengal-presidency",
    title: "A company becomes a political power",
    summary:
      "The East India Company defeats the nawab at Plassey through force and alliances. This begins a change in power in Bengal, not the conquest of all India in a single year.",
    question:
      "What disappears when a map turns a military and political struggle into one colour?",
    sources: [
      {
        title: "National Army Museum · Battle of Plassey",
        url: "https://www.nam.ac.uk/explore/battle-plassey",
      },
    ],
  },
  {
    year: 1858,
    territoryId: "british-india",
    title: "From Company to Crown",
    summary:
      "After the rebellion of 1857, the British Crown takes over the Company’s Indian government and armed forces. A change in authority can matter even when the coloured area barely changes.",
    question:
      "Does a larger coloured area tell you more than a change in who governs?",
    sources: [
      {
        title: "UK Parliament · East India Company and Raj",
        url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/east-india-company-and-raj-1785-1858/",
      },
    ],
  },
  {
    year: 1922,
    territoryId: "ireland",
    title: "The state changes close to home",
    summary:
      "The Irish Free State is established as a dominion on 6 December. Northern Ireland remains within the United Kingdom. A single empire colour conceals very different constitutional relationships.",
    question:
      "How does the history of the United Kingdom complicate the idea of one British identity?",
    sources: [
      {
        title: "House of Commons Library · The Anglo-Irish Treaty",
        url: "https://commonslibrary.parliament.uk/research-briefings/cbp-9260/",
      },
    ],
  },
  {
    year: 1947,
    territoryId: "british-india",
    title: "Independence and partition",
    summary:
      "British rule ends as India and Pakistan become independent in August. Partition brings violence and displacement; removing colour from a map cannot show the human consequences.",
    question: "Whose experience would you need alongside an imperial map?",
    sources: [
      {
        title: "The National Archives · Partition of British India",
        url: "https://www.nationalarchives.gov.uk/education/teaching-resources/partition-of-british-india/",
      },
    ],
  },
  {
    year: 1960,
    territoryId: "nigeria",
    title: "Independence reshapes the world",
    summary:
      "Nigeria becomes independent on 1 October. In December, the UN General Assembly affirms colonial peoples’ right to self-determination. Decolonisation changes political authority and the language used to justify it.",
    question:
      "What is the difference between losing territory and people gaining self-government?",
    sources: [
      {
        title: "Nigeria Independence Act 1960",
        url: "https://www.legislation.gov.uk/ukpga/Eliz2/8-9/55/body/enacted?view=plain",
      },
      {
        title: "United Nations · Decolonisation",
        url: "https://www.un.org/dppa/decolonization/about",
      },
    ],
  },
  {
    year: 1963,
    territoryId: "kenya",
    title: "Kenya becomes independent",
    summary:
      "British responsibility for Kenya’s government ends on 12 December. The legal transfer is a date on a timeline; the struggle that preceded it and its aftermath need further evidence.",
    question:
      "What can an independence law establish, and what can it not explain?",
    sources: [
      {
        title: "Kenya Independence Act 1963 · original Act",
        url: "https://www.legislation.gov.uk/ukpga/1963/54/pdfs/ukpga_19630054_en.pdf",
      },
    ],
  },
  {
    year: 1997,
    territoryId: "hong-kong",
    title: "Hong Kong’s handover",
    summary:
      "Sovereignty over Hong Kong passes to China on 1 July. This is a transfer of sovereignty, not independence. Britain’s remaining overseas territories mean the map does not become empty.",
    question:
      "Why might 1997 feel like an ending while imperial connections continue?",
    sources: [
      {
        title: "House of Commons · The Hong Kong handover",
        url: "https://publications.parliament.uk/pa/cm199798/cmselect/cmfaff/710/71003.htm",
      },
      {
        title: "House of Commons · Overseas Territories",
        url: "https://publications.parliament.uk/pa/cm200708/cmselect/cmfaff/147/14704.htm",
      },
    ],
  },
]);

function dateInfo(data, value) {
  const date = data.readDate(value);
  if (!date) return null;
  return {
    ...date,
    rank: date.year * 10000 + (date.month || 1) * 100 + (date.day || 1),
    uncertain: SOFT.has(date.precision),
  };
}

function ranges(data, values) {
  return list(values)
    .map((raw, index) => {
      const from = dateInfo(data, raw.from);
      const to = dateInfo(data, raw.to);
      // A stated date range is retained to its latest stated endpoint. This is a
      // conservative display convention, not invented day-level precision.
      return {
        raw,
        index,
        from,
        to,
        start: from?.year ?? -Infinity,
        endExclusive: to ? (to.endYear ?? to.year) : Infinity,
      };
    })
    .filter((item) => item.from);
}

function prepareSpans(data, territory) {
  if (!territory.statusPeriods?.length)
    return territory.spans.map((span) => ({
      ...span,
      startRank: span.start * 10000,
      end: span.end,
      yearEnd: true,
    }));
  const statuses = ranges(data, territory.statusPeriods);
  const coverage = territory.geoCoverage?.length
    ? ranges(data, territory.geoCoverage)
    : [
        {
          raw: { units: territory.units },
          start: -Infinity,
          endExclusive: Infinity,
          from: null,
          to: null,
          index: 0,
        },
      ];
  const spans = [];
  for (const status of statuses)
    for (const extent of coverage) {
      const start = Math.max(status.start, extent.start);
      const endExclusive = Math.min(status.endExclusive, extent.endExclusive);
      if (start >= endExclusive) continue; // A within-year period is not a year-end snapshot.
      const raw = status.raw;
      const degree = Number.isFinite(raw.controlDegree)
        ? raw.controlDegree
        : null;
      spans.push({
        territoryId: territory.id,
        territory,
        start,
        end: Number.isFinite(endExclusive) ? endExclusive - 1 : null,
        startRank: Math.max(
          status.from?.rank ?? -Infinity,
          extent.from?.rank ?? -Infinity,
        ),
        statusOrder: status.index,
        coverageOrder: extent.index,
        status: raw.status || "held",
        controlDegree: degree,
        controlled:
          degree != null ? degree > 0 : !NOT_CONTROLLED.has(raw.status),
        units: list(extent.raw.units || territory.units).map(String),
        partial: list(extent.raw.partial).map(String),
        label: raw.label || null,
        note: raw.note || null,
        governedFrom: raw.governedFrom || null,
        localLegislature: raw.localLegislature || null,
        franchise: raw.franchise || null,
        howControlWorked: raw.howControlWorked || null,
        circa: !!(status.from?.uncertain || extent.from?.uncertain),
        circaEnd: !!(status.to?.uncertain || extent.to?.uncertain),
        contested: !!(raw.contested || status.from?.precision === "contested"),
        gapBefore: !!raw.gapBefore,
        from: status.from,
        to: status.to,
        coverageLabel: extent.raw.label || null,
        coverageChange: extent.raw.change || null,
        sources: list(raw.evidence || raw.sources),
        raw,
        yearEnd: true,
      });
    }
  return spans;
}

function wins(a, b) {
  if (a.territory?.nestedWithin === b.territoryId) return true;
  if (b.territory?.nestedWithin === a.territoryId) return false;
  if (a.startRank !== b.startRank) return a.startRank > b.startRank;
  if (a.units.length !== b.units.length) return a.units.length < b.units.length;
  if (a.territoryId === b.territoryId && a.statusOrder !== b.statusOrder)
    return a.statusOrder > b.statusOrder;
  return a.territoryId > b.territoryId;
}

export function createYearEndData(data) {
  if (data.snapshotConvention === "year-end") return data;
  if (cache.has(data)) return cache.get(data);
  const spansByTerritory = new Map(
    data.territories.map((t) => [t.id, prepareSpans(data, t)]),
  );
  const spans = [...spansByTerritory.values()]
    .flat()
    .sort((a, b) => a.start - b.start);
  const bounds = {
    min: data.bounds.min,
    max: Math.max(
      data.bounds.max,
      ...spans.filter((s) => s.end != null).map((s) => s.end + 1),
    ),
  };
  const clampYear = (value) =>
    Math.max(
      bounds.min,
      Math.min(bounds.max, Math.round(Number(value) || bounds.min)),
    );
  const active = (span, year) =>
    span.start <= year && (span.end == null || year <= span.end);
  const snapshots = new Map();
  const cuts = [
    ...new Set([
      bounds.min,
      bounds.max,
      ...spans.flatMap((s) => [s.start, ...(s.end == null ? [] : [s.end + 1])]),
    ]),
  ]
    .filter((y) => y >= bounds.min && y <= bounds.max)
    .sort((a, b) => a - b);
  const unitRuns = new Map();
  for (const span of spans.filter((s) => s.controlled))
    for (const unit of span.units) {
      if (!unitRuns.has(unit)) unitRuns.set(unit, []);
      unitRuns.get(unit).push([span.start, span.end ?? Infinity]);
    }
  for (const [unit, values] of unitRuns) {
    const merged = [];
    for (const run of values.sort((a, b) => a[0] - b[0])) {
      const last = merged.at(-1);
      if (last && run[0] <= last[1] + 1) last[1] = Math.max(last[1], run[1]);
      else merged.push([...run]);
    }
    unitRuns.set(unit, merged);
  }
  const sinceAt = (unit, year) =>
    unitRuns.get(unit)?.find(([a, b]) => a <= year && year <= b)?.[0] ?? null;

  function statusAt(value) {
    const year = clampYear(value);
    if (snapshots.has(year)) return snapshots.get(year);
    const map = new Map();
    for (const span of spans) {
      if (span.start > year) break;
      if (!active(span, year)) continue;
      for (const unitId of span.units) {
        const previous = map.get(unitId);
        if (previous && !wins(span, previous.span)) continue;
        const since = span.controlled ? sinceAt(unitId, year) : null;
        map.set(
          unitId,
          Object.freeze({
            unitId,
            territoryId: span.territoryId,
            territory: span.territory,
            status: span.status,
            controlDegree: span.controlDegree,
            controlled: span.controlled,
            since,
            tenureYears: since == null ? 0 : year - since,
            spanStart: span.start,
            spanEnd: span.end,
            partial: span.partial.includes(unitId),
            circa: span.circa,
            contested: span.contested,
            span,
            yearEnd: true,
          }),
        );
      }
    }
    snapshots.set(year, map);
    if (snapshots.size > 24) snapshots.delete(snapshots.keys().next().value);
    return map;
  }

  function territoryAt(id, value) {
    const territory = data.get(id);
    if (!territory) return null;
    const year = clampYear(value);
    const ownSpans = spansByTerritory.get(id) || [];
    let span = null;
    for (const candidate of ownSpans)
      if (active(candidate, year) && (!span || wins(candidate, span)))
        span = candidate;
    const units = span?.units || territory.units;
    const starts = span?.controlled
      ? units.map((u) => sinceAt(u, year)).filter((y) => y != null)
      : [];
    const since = starts.length ? Math.min(...starts) : null;
    const changes = ownSpans.flatMap((s) => [
      s.start,
      ...(s.end == null ? [] : [s.end + 1]),
    ]);
    const previous = changes.filter((y) => y <= year);
    const next = changes.filter((y) => y > year);
    return {
      id,
      territory,
      active: !!span,
      controlled: !!span?.controlled,
      status: span?.status || null,
      controlDegree: span?.controlDegree ?? null,
      span,
      since,
      tenureYears: since == null ? 0 : year - since,
      units,
      nextChange: next.length ? Math.min(...next) : null,
      prevChange: previous.length ? Math.max(...previous) : null,
      year,
      yearEnd: true,
    };
  }

  function territoriesAt(year, { controlledOnly = false } = {}) {
    return data.territories
      .map((t) => territoryAt(t.id, year))
      .filter((t) => t.active && (!controlledOnly || t.controlled))
      .map((t) => ({
        territory: t.territory,
        span: t.span,
        status: t.status,
        controlDegree: t.controlDegree,
        controlled: t.controlled,
      }));
  }

  function metricsAt(value) {
    const year = clampYear(value),
      states = statusAt(year),
      territoryIds = new Set();
    const byStatus = {},
      byRegion = {},
      byDegree = {};
    let controlledUnits = 0;
    for (const entry of states.values()) {
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      if (!entry.controlled) continue;
      controlledUnits++;
      territoryIds.add(entry.territoryId);
      const region = entry.territory?.region || "unplaced";
      byRegion[region] = (byRegion[region] || 0) + 1;
      byDegree[entry.controlDegree] = (byDegree[entry.controlDegree] || 0) + 1;
    }
    return {
      year,
      units: states.size,
      controlledUnits,
      territories: territoryIds.size,
      byStatus,
      byRegion,
      byDegree,
    };
  }

  let timelineCache;
  function timeline() {
    if (timelineCache) return timelineCache;
    const unitsByYear = new Int32Array(bounds.max - bounds.min + 1),
      territoriesByYear = new Int32Array(unitsByYear.length);
    for (let year = bounds.min; year <= bounds.max; year++) {
      const metrics = metricsAt(year);
      unitsByYear[year - bounds.min] = metrics.controlledUnits;
      territoriesByYear[year - bounds.min] = metrics.territories;
    }
    timelineCache = {
      ...data.timeline(),
      ...bounds,
      cuts,
      unitsByYear,
      territoriesByYear,
      at: (year) => ({
        units: unitsByYear[clampYear(year) - bounds.min],
        territories: territoriesByYear[clampYear(year) - bounds.min],
      }),
    };
    return timelineCache;
  }

  const result = {
    ...data,
    bounds,
    snapshotConvention: "year-end",
    snapshotNote: MAP_SNAPSHOT_NOTE,
    spans,
    unitRuns,
    statusAt,
    territoryAt,
    territoriesAt,
    metricsAt,
    timeline,
    unitsOf: (id, year) =>
      year == null ? data.unitsOf(id) : territoryAt(id, year)?.units || [],
    nextChangeYear: (year, direction = 1) =>
      direction > 0
        ? (cuts.find((y) => y > year) ?? bounds.max)
        : ([...cuts].reverse().find((y) => y < year) ?? bounds.min),
    meta: { ...data.meta, snapshotConvention: "year-end" },
  };
  cache.set(data, result);
  return result;
}

const labelStatus = (data, status) =>
  status
    ? data.statuses.find((item) => item.id === status)?.label ||
      status.replaceAll("-", " ")
    : "No recorded British authority";

/** Endpoint differences, never area totals or a tally of countries conquered.
 * Groups use the rendered political record so overlapping parents/children
 * cannot count the same geometry twice. A record transfer remains "changed".
 */
export function diffMapStates(data, fromYear, toYear) {
  const before = data.statusAt(fromYear),
    after = data.statusAt(toYear);
  const added = [],
    removed = [],
    changed = [];
  const records = { added: [], removed: [], changed: [] };
  for (const unitId of new Set([...before.keys(), ...after.keys()])) {
    const a = before.get(unitId),
      b = after.get(unitId);
    let kind;
    if (!a?.controlled && b?.controlled) kind = "added";
    else if (a?.controlled && !b?.controlled) kind = "removed";
    else if (
      a?.controlled &&
      b?.controlled &&
      (a.status !== b.status ||
        a.controlDegree !== b.controlDegree ||
        a.partial !== b.partial ||
        a.territoryId !== b.territoryId)
    )
      kind = "changed";
    if (!kind) continue;
    ({ added, removed, changed })[kind].push(unitId);
    records[kind].push({ unitId, before: a, after: b });
  }
  const groups = {};
  for (const kind of ["added", "removed", "changed"]) {
    const grouped = new Map();
    for (const item of records[kind]) {
      const state = kind === "removed" ? item.before : item.after;
      const key = [
        item.before?.territoryId,
        item.after?.territoryId,
        item.before?.status,
        item.after?.status,
        item.before?.controlDegree,
        item.after?.controlDegree,
        !!item.before?.partial,
        !!item.after?.partial,
      ].join("|");
      if (!grouped.has(key))
        grouped.set(key, {
          territoryId: state.territoryId,
          name:
            state.territory?.shortName ||
            state.territory?.name ||
            state.territoryId,
          unitIds: [],
          fromTerritoryId: item.before?.territoryId || null,
          toTerritoryId: item.after?.territoryId || null,
          fromName:
            item.before?.territory?.shortName ||
            item.before?.territory?.name ||
            null,
          toName:
            item.after?.territory?.shortName ||
            item.after?.territory?.name ||
            null,
          fromStatus: labelStatus(
            data,
            item.before?.controlled ? item.before.status : null,
          ),
          toStatus: labelStatus(
            data,
            item.after?.controlled ? item.after.status : null,
          ),
          fromStatusId: item.before?.status || null,
          toStatusId: item.after?.status || null,
          fromDegree: item.before?.controlDegree ?? null,
          toDegree: item.after?.controlDegree ?? null,
          partial: !!state.partial,
          fromPartial: !!item.before?.partial,
          toPartial: !!item.after?.partial,
        });
      grouped.get(key).unitIds.push(item.unitId);
    }
    groups[kind] = [...grouped.values()].sort(
      (a, b) =>
        b.unitIds.length - a.unitIds.length || a.name.localeCompare(b.name),
    );
  }
  // Endpoint-exclusive: stepping 1946→1947 includes events in1947, not1946.
  const lo = Math.min(fromYear, toYear),
    hi = Math.max(fromYear, toYear);
  const events = data
    .eventsBetween(lo + 1, hi)
    .filter((event) => event.year > lo && event.year <= hi);
  const notes = [
    MAP_SNAPSHOT_NOTE,
    "These changes compare the two displayed snapshots. Changes that occur and reverse between them may not appear; use event dates for the historical sequence.",
  ];
  return {
    fromYear,
    toYear,
    direction: Math.sign(toYear - fromYear),
    added,
    removed,
    changed,
    groups,
    events,
    notes,
  };
}
