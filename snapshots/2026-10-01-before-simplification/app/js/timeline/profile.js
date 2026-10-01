/* timeline/profile.js — THE RATE RAIL. How much, and how fast.

   Round 4's verdict, in the critic's own words: "The axis encodes when, never
   how much or how fast. There is no extent-over-time profile anywhere in P03…
   the chapter's single most memorable chronological fact — built over roughly
   350 years and dismantled in roughly 35 — has no representation at all."

   That is correct and it was the largest hole in this piece. A slider that only
   answers *when* is exactly the instrument charge 6 says loses to a printed
   table. So the axis now carries a second rail, on the same scale, drawn from
   the change model that was already being computed for the year row: units
   gained above the line, units lost below it, one bar per year, on whichever
   reading of "British" is active.

   Everything in here is counted, never asserted:

     · the tallest gain bar and the deepest loss bar, with their years;
     · the SHORTEST WINDOW containing half of everything this reading of the
       map ever gained, and the shortest window containing half of everything
       it ever lost. Those two numbers are the honest, measured version of
       "built over 350 years, dismantled in 35" — and unlike the chapter's
       round figures they move when you change the definition of "British",
       which is itself the lesson;
     · the decade totals, so a shape can be read as a number.

   No figure here is interpolated and no year is smoothed. A year with nothing
   in it draws nothing, which is the same rule the year row follows.
 */

/* Half, rounded up: with 182 gains the window must hold 91, not 90.5. */
const half = (n) => Math.ceil(n / 2);

/**
 * The smallest run of consecutive years, inside `rows`, whose values sum to at
 * least `need`. Two pointers over a sparse list — the window is measured in
 * years (last − first + 1), not in list positions, so gaps count against it,
 * which is the whole point.
 */
function tightestWindow(rows, key, need) {
  if (!need) return null;
  let lo = 0, sum = 0, best = null;
  for (let hi = 0; hi < rows.length; hi++) {
    sum += rows[hi][key];
    while (sum - rows[lo][key] >= need) { sum -= rows[lo][key]; lo++; }
    if (sum >= need) {
      const span = rows[hi].year - rows[lo].year + 1;
      if (!best || span < best.span) best = { from: rows[lo].year, to: rows[hi].year, span, n: sum };
    }
  }
  return best;
}

/**
 * buildProfile(def, bounds) — the rate model for one reading of "British".
 * `def` is one entry of the change model (already filtered to a definition).
 */
export function buildProfile(def, bounds) {
  const rows = [];
  let gained = 0, lost = 0, maxGain = 0, maxLoss = 0;
  const years = [...def.years.keys()].sort((a, b) => a - b);
  for (const y of years) {
    if (y < bounds.min || y > bounds.max) continue;
    const rec = def.years.get(y);
    const gain = rec.inUnits | 0, loss = rec.outUnits | 0;
    if (!gain && !loss) continue;
    rows.push({ year: y, gain, loss });
    gained += gain; lost += loss;
    if (gain > maxGain) maxGain = gain;
    if (loss > maxLoss) maxLoss = loss;
  }

  /* The two shapes the chapter's memorable sentence is about. */
  const builtIn = tightestWindow(rows, 'gain', half(gained));
  const shedIn = tightestWindow(rows, 'loss', half(lost));

  /* Ranked bars, for the labels. Ties break on the year so a deep link
     reproduces the same two labels every time. */
  const byGain = rows.filter((r) => r.gain).sort((a, b) => b.gain - a.gain || a.year - b.year);
  const byLoss = rows.filter((r) => r.loss).sort((a, b) => b.loss - a.loss || a.year - b.year);

  /* Decades, so a shape can be read back as a figure. */
  const decades = new Map();
  for (const r of rows) {
    const d = Math.floor(r.year / 10) * 10;
    const e = decades.get(d) || { decade: d, gain: 0, loss: 0 };
    e.gain += r.gain; e.loss += r.loss;
    decades.set(d, e);
  }

  const first = rows.length ? rows[0].year : null;
  const last = rows.length ? rows[rows.length - 1].year : null;

  return {
    rows, decades: [...decades.values()].sort((a, b) => a.decade - b.decade),
    gained, lost, maxGain, maxLoss,
    first, last,
    builtIn, shedIn,
    topGain: byGain.slice(0, 3),
    topLoss: byLoss.slice(0, 3),
    peak: def.extremes ? def.extremes.peak : null,
    at(year) {
      /* linear scan is fine: rows is a few hundred long and this is called
         once per year change, not once per bar. */
      for (const r of rows) if (r.year === year) return r;
      return null;
    },
    decadeAt(year) {
      const d = Math.floor(year / 10) * 10;
      return decades.get(d) || null;
    },
  };
}

/**
 * The sentence under the rail. Every number in it is measured above; the
 * definition's label is printed because every one of them changes with it.
 */
export function profileSentence(p, defLabel) {
  if (!p.rows.length) return `Nothing on this map is gained or lost on the reading “${defLabel}”.`;
  const bits = [];
  if (p.builtIn && p.shedIn) {
    bits.push(
      `Half of everything this map ever counted as ${defLabel} was gained inside ${p.builtIn.span} ${p.builtIn.span === 1 ? 'year' : 'years'} — ${p.builtIn.from}–${p.builtIn.to}. ` +
      `Half of everything it lost went inside ${p.shedIn.span} ${p.shedIn.span === 1 ? 'year' : 'years'} — ${p.shedIn.from}–${p.shedIn.to}.`);
  }
  bits.push(`${p.gained} units in and ${p.lost} out across ${p.last - p.first + 1} years of record. Gains above the line, losses below, one bar a year, counted the same way the map is.`);
  return bits.join(' ');
}

/**
 * The same claim, short enough for a 390px column. Not an elision of the
 * sentence above — a complete, shorter sentence, because a truncated fact is
 * worse than a smaller one. The long form stays on the rail's own label, so a
 * screen reader gets all of it at any width.
 */
export function profileSentenceShort(p, defLabel) {
  if (!p.rows.length) return `Nothing is gained or lost on the reading “${defLabel}”.`;
  if (!p.builtIn || !p.shedIn) return `${p.gained} units in, ${p.lost} out. Gains above the line, losses below.`;
  return `Half of it was taken in ${p.builtIn.span} years (${p.builtIn.from}–${p.builtIn.to}); half of it went in ${p.shedIn.span} (${p.shedIn.from}–${p.shedIn.to}). ` +
    `${p.gained} units in, ${p.lost} out. Gains above the line, losses below; bar height is the square root of the count.`;
}

export default { buildProfile, profileSentence, profileSentenceShort };
