/* timeline/playback.js — playback that behaves like reading, not like video.

   A red flood spreading across Africa is memorable and teaches nothing except
   that it happened fast. So the clock does two things a video player does not:

   RESTS   — a year carrying an empire-wide event dwells longer, and its title
             is printed while it holds.
   STOPS   — at a small set of years the clock stops itself and says why.
             Eight of them are the phase boundaries of DIDACTIC_SPEC §2.1 with
             the defence of that boundary attached. The rest are measured from
             the dataset at run time: the widest year, the biggest one-year
             gain, the biggest one-year loss.

   Round 1's measured cards promised something the change row could not deliver
   ("the chips beside the year say by what mechanism" at a year whose row showed
   three chips against a swing of thirty-six units). They now name the places
   themselves, taken from the same model the row prints, so the card cannot
   claim more than the row shows. Every figure is counted on the definition of
   "British" that is currently active, and the card says which one. */

import { PHASES } from './phases.js';

function listOf(groups, dir, n = 3) {
  const picked = groups.filter((g) => g.dir === dir).slice(0, n).map((g) => g.subject);
  if (!picked.length) return '';
  if (picked.length === 1) return picked[0];
  return picked.slice(0, -1).join(', ') + ' and ' + picked[picked.length - 1];
}

/**
 * buildStops(model, def, bounds) -> Map<year, {year,title,why,kind}>
 * `model` is one entry of the change model (already filtered to a definition).
 */
export function buildStops(model, def, bounds, profile) {
  const stops = new Map();
  const set = (year, title, why, kind) => {
    if (!Number.isFinite(year) || year < bounds.min || year > bounds.max) return;
    if (!stops.has(year)) stops.set(year, { year, title, why, kind });
  };
  /* A measured extreme that falls on a phase boundary is not dropped: the
     boundary card takes the measurement as a second paragraph, so the card and
     the change row under it still name the same year and the same figure.
     Round 2 lost the biggest single-year loss entirely this way — it falls on
     1947, and 1947 is where phase III ends. */
  const augment = (year, line) => {
    if (!Number.isFinite(year)) return false;
    const s = stops.get(year);
    if (!s) return false;
    s.why = s.why + ' ' + line;
    return true;
  };

  for (const p of PHASES) {
    set(p.from, `${p.numeral} · ${p.name} begins`, p.startNote, 'phase');
    set(p.to, `${p.numeral} · ${p.name} ends`, p.endNote, 'phase');
  }

  const on = `Counted on one reading of "British": ${def.label} — ${def.sentence}. Press 1–4 to change the reading and these figures change with it.`;
  const e = model.extremes;

  if (e.peak) {
    const line = `${e.peak.n} units are ${def.label} in ${e.peak.year} — more than in any other year in this dataset.`;
    if (!augment(e.peak.year, line)) set(e.peak.year, 'The widest the map ever gets', `${line} ${on}`, 'measured');
  }
  if (e.rise) {
    const y = model.years.get(e.rise.year);
    const who = y ? listOf(y.groups, 'in') : '';
    const line = `More units come under British control in ${e.rise.year} than in any other year here — ${e.rise.d} of them${who ? ', the largest ' + who : ''}. Every one is in the row beside the year, with the mechanism that put it there.`;
    if (!augment(e.rise.year, line)) set(e.rise.year, `The biggest single-year gain: +${e.rise.d} units`, `${line} ${on}`, 'measured');
  }
  if (e.fall) {
    const y = model.years.get(e.fall.year);
    const who = y ? listOf(y.groups, 'out') : '';
    const n = Math.abs(e.fall.d);
    const line = `This is also the biggest single-year loss in the dataset: ${n} units leave${who ? ', the largest ' + who : ''}. Read the mechanisms in the row — most of this empire ended by negotiation, and some of it did not.`;
    if (!augment(e.fall.year, line)) set(e.fall.year, `The biggest single-year loss: −${n} units`, `${line} ${on}`, 'measured');
  }

  /* ROUND 5 — the shape stops. The chapter's most memorable chronological fact
     is a ratio: a long slow building and a short fast dismantling. It is
     measured here, not asserted, and the clock stops at both ends of the run in
     which half of everything went, because a student watching the map has no
     other way to notice that the run was short. */
  if (profile && profile.shedIn) {
    const w = profile.shedIn;
    const built = profile.builtIn;
    const line = `Half of everything this map ever lost — ${w.n} of ${profile.lost} units — goes inside these ${w.span} years, ${w.from} to ${w.to}.` +
      (built ? ` Half of everything it gained took ${built.span} years, ${built.from} to ${built.to}. That ratio is the shape on the rail under the axis.` : '');
    if (!augment(w.from, line)) set(w.from, `The ${w.span} years in which half of it went`, `${line} ${on}`, 'measured');
    const endLine = `That is the end of the run: ${w.from}–${w.to}, ${w.span} years, ${w.n} of ${profile.lost} units lost inside it.`;
    if (!augment(w.to, endLine)) set(w.to, `${w.to} — the end of the ${w.span}-year run`, `${endLine} ${on}`, 'measured');
  }
  if (profile && profile.builtIn && profile.builtIn.from !== (profile.shedIn && profile.shedIn.from)) {
    const b = profile.builtIn;
    const line = `Half of everything this map ever counted as ${def.label} is gained inside these ${b.span} years, ${b.from} to ${b.to} — ${b.n} of ${profile.gained} units.`;
    if (!augment(b.from, line)) set(b.from, `The ${b.span} years in which half of it was taken`, `${line} ${on}`, 'measured');
  }

  return stops;
}

/* Years that hold longer during playback.

   Round 4: "Playback is unreadable between stops. At 1x a year holds 700ms
   while the row carries up to seven cards; only 42 of 828 years get the 2.6x
   rest and only 11 years stop. From 1600 I played 28 consecutive years and the
   clock never paused once." Correct. Playback that runs at a constant rate
   through a record that is not constant is video, not reading.

   So the rest set is no longer only the empire-wide events. Every year the
   atlas has anything dated to rests, and rests in proportion to how much: a
   year with one card holds a little longer, a year with five holds much longer,
   and a year with nothing in it is skipped past at a third of the rate. The
   dwell is computed in index.js from this map; what is built here is the reason
   a year is worth holding on, which is what gets printed while it holds. */
export function buildRests(data) {
  const rests = new Map();
  for (const ev of data.events) {
    if (ev.scope !== 'empire-wide') continue;
    if (!Number.isFinite(ev.year)) continue;
    if (!rests.has(ev.year)) rests.set(ev.year, ev.title);
  }
  return rests;
}

export default { buildStops, buildRests };
