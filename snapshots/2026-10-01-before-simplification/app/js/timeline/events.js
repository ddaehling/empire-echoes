/* timeline/events.js — the 308 recorded events, made readable in the year row.

   Round 2 drew every event as a one-pixel `<line>` inside an `<svg>` marked
   `aria-hidden="true" focusable="false"`. Three hundred and eight events became
   hairlines with no text, no focus and no title in the accessibility tree, and
   only the fifty empire-wide ones ever produced a sentence — as a card that
   flashed past during playback. So Jallianwala Bagh, the Salt March, the Bengal
   famine of 1943, the Great Famine of 1845 and the rebellion of 1857 existed in
   `data.events` and appeared nowhere in the timeline, in any mode. A chronology
   that cannot tell you what happened at Amritsar loses to a printed table, and
   should.

   This file turns `data.timeline().eventsByYear` into a model the year row can
   print: one card per event, in date order within the year, each carrying its
   own date, its scope, the first clause of the dataset's summary, and — when
   opened — the summary in full, why it mattered, the misconception it is there
   to break, the people named in it, and its sources.

   Nothing is written here. Every string comes from the dataset. */

import { firstClause } from './changes.js';

/* The dataset's `type` vocabulary is open, so it is never translated — it is
   printed as it stands, with hyphens turned into spaces. `scope` is closed and
   is printed as the reach of the thing, because "regional" on its own tells a
   student nothing. */
const SCOPE = {
  'empire-wide': 'across the empire',
  regional: 'across a region',
  local: 'in one place',
};

const SOFT = new Set(['circa', 'contested', 'range', 'decade', 'century']);
const isSoft = (d) => !!d && (d.circa === true || SOFT.has(d.precision));

function typeLabel(t) {
  return String(t || 'event').replace(/-/g, ' ');
}

/* Chronological within a year: a dated day first, then a dated month, then the
   ones the dataset only places in the year. */
function ordinal(e) {
  const d = e.date || {};
  return (Number(d.month) || 13) * 100 + (Number(d.day) || 99);
}

export function buildEventModel(data) {
  const tl = data.timeline();
  const byYear = new Map();
  let total = 0;

  for (const [year, list] of tl.eventsByYear) {
    const rows = list.map((e) => {
      const d = e.date || {};
      const sources = (e.evidence && e.evidence.length ? e.evidence : e.sources) || [];
      return {
        kind: 'event',
        id: e.id,
        year,
        title: e.title || '(untitled record)',
        type: typeLabel(e.type || e.kind),
        scope: e.scope || null,
        scopeLabel: SCOPE[e.scope] || '',
        date: d.display || String(year),
        soft: isSoft(d),
        dateNote: d.note || '',
        changedStatus: !!e.changedStatus,
        summary: e.summary || '',
        summaryShort: firstClause(e.summary || e.significance || '', 128),
        significance: e.significance || '',
        misconception: e.pedagogy && e.pedagogy.misconception ? e.pedagogy.misconception : null,
        hook: e.pedagogy && e.pedagogy.hook ? e.pedagogy.hook : '',
        whyItMatters: e.pedagogy && e.pedagogy.whyItMatters ? e.pedagogy.whyItMatters : '',
        people: Array.isArray(e.people) ? e.people : [],
        sources,
        territoryIds: e.territoryIds || [],
        territoryId: (e.territoryIds && e.territoryIds[0]) || e.territoryId || null,
        endYear: Number.isFinite(e.endYear) && e.endYear !== year ? e.endYear : null,
      };
    });
    rows.sort((a, b) => ordinal(a) - ordinal(b));
    byYear.set(year, rows);
    total += rows.length;
  }

  const years = [...byYear.keys()].sort((a, b) => a - b);

  return {
    byYear,
    years,
    total,
    at(year) { return byYear.get(year) || []; },
    /** The nearest year on either side that carries an event. */
    near(year, dir) {
      let best = null;
      for (const y of years) {
        if (dir > 0 && y > year) { best = y; break; }
        if (dir < 0 && y < year) best = y;
      }
      return best;
    },
  };
}

export default { buildEventModel };
