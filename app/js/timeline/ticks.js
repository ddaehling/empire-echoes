/* timeline/ticks.js — everything the axis draws that comes out of the dataset.

   Two models, both built once at mount:
     eventTicks   — one entry per year that carries an event; heavier when that
                    year changed somebody's status. These are *texture on the
                    axis only*: round 2 made them the sole rendering of the
                    dataset's 308 events, inside an aria-hidden svg, so 258 of
                    them were unreachable in every mode. Every event is now
                    rendered as text in the year row (see events.js); the ticks
                    are the shape of where they fall and nothing else, which is
                    why the svg stays out of the accessibility tree.
     uncertain    — one entry per year the sources do not settle, of two kinds.

   The two kinds matter and the rail draws them differently, because they are
   different epistemic objects and a student who cannot tell them apart cannot
   do source work:

     WHEN   the date itself is soft. c.1585. "1948 to 1952." A range, a decade,
            a contested precision, a span that starts or ends about-then.
     WHAT   the date is firm and the account is not: the record carries
            `contested.isContested` with a note saying who disagrees and why.

   Round 1 drew only the first kind — twenty marks across eight hundred years,
   on a dataset where a hundred and twenty-three acquisition and departure
   records are flagged contested. Marking only soft dates says, silently, that
   everything else is settled. It is not, and now the rail says so.

   Nothing is invented: every mark carries the dataset's own note. A soft date
   with no note fails tools/validate-data.js and cannot reach here. */

const SOFT = new Set(['circa', 'contested', 'range', 'decade', 'century']);

export function isSoftDate(d) {
  return !!d && (d.circa === true || SOFT.has(d.precision));
}

function softLabel(d) {
  if (d.precision === 'contested') return 'dates disagree';
  if (d.precision === 'range') return 'no single date';
  if (d.precision === 'decade') return 'a decade, not a year';
  if (d.precision === 'century') return 'a century, not a year';
  return 'approximate';
}

export function buildEventTicks(data) {
  const tl = data.timeline();
  const out = [];
  for (const [year, list] of tl.eventsByYear) {
    if (year < tl.min || year > tl.max) continue;
    let heavy = false;
    for (const e of list) if (e.changedStatus) { heavy = true; break; }
    out.push({ year, n: list.length, heavy, titles: list.map((e) => e.title) });
  }
  out.sort((a, b) => a.year - b.year);
  return out;
}

export function buildUncertain(data) {
  const byYear = new Map();
  const add = (year, kind, label, what, note) => {
    if (!Number.isFinite(year)) return;
    if (!note) return;                       // no reason, no mark. Never a bare flag.
    let row = byYear.get(year);
    if (!row) { row = { year, reasons: [], kinds: new Set() }; byYear.set(year, row); }
    row.kinds.add(kind);
    /* ROUND 4: the cap is gone. Round 3 stopped at five reasons a year and then
       printed the capped figure as "N reasons in all" — so 1947, which carries
       ten contested records, said five; 1948 said five of eight; 1931 said five
       of six. Nine reasons were dropped in silence, in exactly the years where
       contestation is the lesson, by a feature whose stated promise is that
       nothing is dropped. Everything is kept; the popover scrolls and says how
       far it goes. */
    if (row.reasons.some((r) => r.what === what)) return;
    row.reasons.push({ kind, label, what, note });
  };

  /* --- kind "when": the date itself is not settled ---------------------- */
  for (const e of data.events) {
    if (!isSoftDate(e.date)) continue;
    add(e.year, 'when', softLabel(e.date), e.title, e.date.note || '');
  }
  for (const a of data.acquisitions) {
    if (!isSoftDate(a.date)) continue;
    add(a.year, 'when', softLabel(a.date), `${a.territoryName || a.territoryId} — taken`, a.date.note || '');
  }
  for (const d of data.departures) {
    if (!isSoftDate(d.date)) continue;
    add(d.year, 'when', softLabel(d.date), `${d.territoryName || d.territoryId} — left`, d.date.note || '');
  }
  /* spans carry their own softness: a status that began about-then */
  for (const s of data.spans) {
    const t = s.territory || (data.get ? data.get(s.territoryId) : null);
    const name = t ? t.name : s.territoryId;
    if (s.circa) add(s.start, 'when', 'approximate', `${name} — ${s.label || s.status} begins`, s.note || '');
    if (s.circaEnd && s.end != null) add(s.end, 'when', 'approximate', `${name} — ${s.label || s.status} ends`, s.note || '');
  }

  /* --- kind "what": the date is firm, the account is disputed ----------- */
  const contestedNote = (r) => (r && r.contested && r.contested.isContested ? String(r.contested.note || '') : '');
  for (const a of data.acquisitions) {
    const n = contestedNote(a);
    if (n) add(a.year, 'what', 'account disputed', `${a.territoryName || a.territoryId} — how it was taken`, n);
  }
  for (const d of data.departures) {
    const n = contestedNote(d);
    if (n) add(d.year, 'what', 'account disputed', `${d.territoryName || d.territoryId} — how it ended`, n);
  }
  for (const e of data.events) {
    const n = contestedNote(e);
    if (n) add(e.year, 'what', 'account disputed', e.title, n);
  }

  const rows = [...byYear.values()];
  for (const r of rows) {
    r.kind = r.kinds.has('when') && r.kinds.has('what') ? 'both' : (r.kinds.has('when') ? 'when' : 'what');
    delete r.kinds;
    /* soft dates read first: they are the ones that move the mark on the axis */
    r.reasons.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'when' ? -1 : 1));
  }
  rows.sort((a, b) => a.year - b.year);
  return rows;
}

export default { buildEventTicks, buildUncertain, isSoftDate };
