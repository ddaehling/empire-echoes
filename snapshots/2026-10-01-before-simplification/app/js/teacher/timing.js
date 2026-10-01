/**
 * teacher/timing.js — the lesson clock. Mirrored from the guided path's own
 * cost model, CHECKED against the guided path's own published total, and the
 * only place in this directory a minute figure comes from.
 *
 * THE CHARGE. Round eight, the historian and the classroom critic, on the same
 * defect from two sides:
 *
 *   "the timing model undercounted: it priced only the beat word counts and
 *    ignored the in-beat figures, the checkpoints and their reveals. The
 *    default core route re-priced from 35–45 minutes to 55. Student surfaces
 *    were re-timed; teacher surfaces were not. Live in the app and in the
 *    printed pack the Teaching desk still says 'the thirty-minute run' /
 *    'The thirty minutes' / 'the four moves, on the thirty-minute path'. A head
 *    of history plans Tuesday from a printed page that contradicts the app on
 *    the projector."
 *
 * Every one of those figures was typed into this directory by hand. Typed
 * minutes are how a printed page and a projector come to disagree, so there
 * are now none: `pack.js`'s segments no longer carry `at` or `mins`,
 * `classroom.js`'s lesson rows no longer carry `at`, and the four sheet titles
 * that said "thirty minutes" say what the route this build actually publishes
 * actually costs.
 *
 * WHAT THIS FILE MAY AND MAY NOT ASSERT.
 *
 *   IT MAY assert the shape of a school period. Fifty minutes on the
 *   timetable, five for settling and the register, five for packing away and
 *   getting a class out of the room: that is a fact about a school, it is
 *   stated once, here, and it is printed in words wherever it is used so a
 *   department with a different period can see exactly what to change.
 *
 *   IT MAY NOT assert one second of the run. Every figure about the route —
 *   its total, each segment's span, where a beat falls in the lesson — is
 *   computed from the beats' own authored costs and then CHECKED against the
 *   number `tours/index.js` published for that same route. If our arithmetic
 *   and theirs disagree by a minute, `ok` is false, `why` says so in words, and
 *   every surface prints the sentence instead of a clock. There is no path
 *   through this file that prints a minute nobody checked.
 *
 * THE MIRROR, AND WHY IT IS A MIRROR RATHER THAN A REQUEST. The tour publishes
 * each route's TOTAL (`minutesExact` at the authored reading rate,
 * `minutesExactMax` at the classroom floor of 110 words a minute). It does not
 * publish where inside the run those minutes fall, and a lesson plan is nothing
 * but that. So the per-step arithmetic below is line-for-line
 * `tours/index.js::_beatCost` and `_budgetMinutes` — read them side by side —
 * and the two totals it produces are compared with the two the tour published.
 * A mirror that is checked against its subject on every payload is not a second
 * source of truth; it is the same truth, indexed by step.
 *
 * WHICH ROUTE TUESDAY RUNS ON. Not a name typed here either. `lessonRoute()`
 * takes the published line-up and picks the single-period route: a route the
 * guided path has flagged as one, else a route whose id or label says so, else
 * the longest route whose SLOW end still fits the teaching window. The slow end
 * is deliberate — a plan that fits only if the class reads fast is a plan that
 * overruns — and if nothing fits, that is said in words rather than papered
 * over with the shortest route pretending.
 *
 * NOTHING HERE RENDERS. No DOM, no state, no listeners.
 */

import { publishedRoute, publishedRoutes, routeSteps, routeBeats, beatRecord, knownRoutes } from './steps.js';
import { bindLessons, LESSONS } from './unit.js';

/* -------------------------------------------------------- the period ------ */

/**
 * THE ONE THING IN THIS DIRECTORY THAT IS A CLAIM ABOUT A SCHOOL RATHER THAN
 * ABOUT THE ROUTE. Fifty minutes on the timetable is the period the classroom
 * case rests on; the ten minutes taken off it are settling and the register at
 * one end, packing away and a corridor at the other. Every surface that uses
 * `teaching` prints this arithmetic beside it in words.
 */
export const PERIOD = Object.freeze({
  minutes: 50,
  settle: 5,
  packAway: 5,
  teaching: 40,
  /* Tuesday, first period. The wall-clock times on the board schedule are this
     plus the run's own elapsed minutes, and nothing else. */
  startsAt: 9 * 60,
});

/**
 * HOW MANY MINUTES OF ATLAS FIT IN A PERIOD — AND WHOSE NUMBER THAT IS.
 *
 * The guided path publishes `periodMinutes` on every route record: its own
 * budget for one lesson's worth of running the app. When it is there, that is
 * the number, because two modules holding two different definitions of "a
 * period" is the same defect at one remove — and this whole piece exists
 * because the desk kept its own copy of a figure the path had already moved.
 * The arithmetic above is what this desk falls back to when the path publishes
 * no budget, and it is stated in words either way so a department with a
 * different timetable can see exactly what to change.
 */
export function teachingWindow() {
  for (const r of publishedRoutes().values()) {
    if (r && Number.isFinite(r.periodMinutes)) return { minutes: r.periodMinutes, published: true };
  }
  return { minutes: PERIOD.teaching, published: false };
}

/** The window, in words, for a sentence that needs to name it. */
export function periodSays() {
  const w = teachingWindow();
  return w.published
    ? 'the ' + w.minutes + ' minutes of atlas the guided path sizes one period at'
    : 'a ' + PERIOD.minutes + '-minute period, less settling, the register and packing away — '
      + PERIOD.teaching + ' minutes to teach in';
}

/**
 * THE VERDICT A HEAD OF HISTORY IS READING FOR: does this route finish inside a
 * period, and by how much.
 */
export function periodVerdict(slow) {
  if (!Number.isFinite(slow)) return '';
  const w = teachingWindow();
  const over = slow - w.minutes;
  const tail = over > 0
    ? ', which is ' + over + (over === 1 ? ' minute' : ' minutes') + ' more: it will not finish in one period.'
    : over === 0 ? ' — exactly one period.'
      : ', and leaves ' + (-over) + (over === -1 ? ' minute' : ' minutes') + ' in hand.';
  return (w.published
    ? 'The guided path sizes one period at ' + w.minutes + ' minutes of atlas. This route asks for ' + slow
    : 'A ' + PERIOD.minutes + '-minute period leaves ' + PERIOD.teaching + ' minutes to teach in, once '
      + PERIOD.settle + ' for settling and the register and ' + PERIOD.packAway
      + ' for packing away are out of it. This route asks for ' + slow) + tail;
}

/**
 * WHAT THE CLOCK PRICES, AND WHAT IT DOES NOT — the sentence round nine's
 * classroom critic asked this file for by name.
 *
 * Its charge, as the material gap: "The 29-minute clock prices the atlas, not
 * the room: the same pack sets seven written tasks and budgets zero minutes for
 * them… 'Leaves 1 minute in hand' is currently the most misleading sentence in
 * the pack." And the remedy it named: "make `teacher/timing.js` print the
 * arithmetic it already knows — 50-minute period, 5 settling, 5 packing away,
 * 29 of atlas — and state plainly that the seven written tasks come out of the
 * remaining 11 minutes and will not all fit."
 *
 * That is exactly what this returns, and every term in it is already here:
 * `PERIOD` is this file's one claim about a school, printed in words wherever
 * it is used; `atlas` is the route's own checked slow clock; `tasks` is the
 * pack's own count of what it sets. Nothing is typed. If the guided path ever
 * prices the writing itself, `atlas` grows, `left` shrinks and this sentence
 * stays true without being edited.
 *
 * `left` is measured against the TEACHING window — the whole period less
 * settling and packing away — not against the guided path's own atlas budget,
 * because the minutes the atlas does not want are exactly the minutes the
 * writing has to come out of, and they are the ones nobody was counting.
 */
export function roomArithmetic(atlas, tasks) {
  if (!Number.isFinite(atlas)) return null;
  const n = Number.isFinite(tasks) ? tasks : 0;
  return {
    period: PERIOD.minutes, settle: PERIOD.settle, packAway: PERIOD.packAway,
    teaching: PERIOD.teaching, atlas, left: PERIOD.teaching - atlas, tasks: n,
  };
}

/**
 * The same arithmetic in the sentence a plan carries. `brief` is the screen's
 * form — one sentence, because the desk's own historical failure is the wall of
 * everything — and the long form is the paper's, where a head of history is
 * planning Tuesday and has room to read the working.
 */
export function roomSays(atlas, tasks, brief) {
  const r = roomArithmetic(atlas, tasks);
  if (!r) return '';
  const mins = (v) => v + (v === 1 ? ' minute' : ' minutes');
  if (brief) {
    if (r.left <= 0) {
      return 'And the clock is the atlas, not the room: it spends the whole of the '
        + mins(r.teaching) + ' a ' + r.period + '-minute period leaves to teach in, so the pack\u2019s '
        + r.tasks + ' written tasks have no time of their own at all.';
    }
    return 'And the clock is the atlas, not the room: of the ' + mins(r.teaching) + ' a '
      + r.period + '-minute period leaves to teach in, ' + r.atlas + ' are screen and ' + r.left
      + ' are everything else \u2014 including the pack\u2019s ' + r.tasks
      + ' written tasks, which will not all fit. The printed plan does that arithmetic in full.';
  }
  const head = 'The clock in the margin prices the atlas, not the room, and it does not price a pen. A '
    + r.period + '-minute period, less ' + r.settle + ' for settling and ' + r.packAway
    + ' for packing away, leaves ' + mins(r.teaching) + ' to teach in; this route spends '
    + mins(r.atlas) + ' of that on the screen';
  if (r.left <= 0) {
    return head + ' — all of it. The written tasks below have no time of their own, so every one '
      + 'of them is homework unless you cut a segment.';
  }
  if (!r.tasks) return head + ' and leaves ' + mins(r.left) + '.';
  return head + ' and leaves ' + mins(r.left) + '. The ' + r.tasks + ' written tasks come out of '
    + 'those, and a class of twenty-eight will not finish all ' + r.tasks + ' in them. Decide before '
    + 'the bell which are written in the room and which go home; each segment’s “If you are behind” '
    + 'line names the part worth keeping.';
}

/** Minutes past midnight as `09:05`. */
export function wallClock(minsPastMidnight) {
  const m = Math.max(0, Math.round(minsPastMidnight));
  const h = Math.floor(m / 60) % 24;
  return String(h).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
}

/** The wall-clock time `n` minutes into the run. */
export function atMinute(n) {
  return wallClock(PERIOD.startsAt + PERIOD.settle + (Number.isFinite(n) ? n : 0));
}

/* ------------------------------------------------------- the cost model --- */

/* `tours/index.js` lines 63–70. Duplicated here on purpose and checked against
   that file's own published totals on every payload — see the header. */
const SLOW_WPM = 110;
const AUTHORED_WPM = 180;
const RETRIEVAL_S = 45;
const GATE_S = 90;
const DISPUTE_S = 150;

/** `tours/index.js::_beatCost`, line for line. `wpm` absent is the authored model. */
function beatCost(b, wpm) {
  if (!b) return 0;
  const base = b.cost_s || 60;
  let s;
  if (!wpm || !b.words) s = base;
  else {
    const authored = Math.round((b.words / AUTHORED_WPM) * 60);
    const doing = Math.max(0, base - authored);
    s = Math.round((b.words / wpm) * 60) + doing;
  }
  if (b.onPath && b.onPath.words) {
    s += Math.round((b.onPath.words / (wpm || AUTHORED_WPM)) * 60) + RETRIEVAL_S;
  }
  return s;
}

/* --------------------------------------------------- the checkpoint plan -- */

/**
 * WHERE THE IN-BEAT RETRIEVALS FALL, ASKED OF THE MODULE THAT SCHEDULES THEM.
 * `tours/index.js` counts them by calling `quiz/checkpoint.js::plan()` with the
 * route's ordered beat ids; this asks the same function the same question and
 * uses the beat each one lands on, which is the half the tour does not need and
 * a lesson plan does. A build without the quiz module answers nothing, which is
 * also what the tour's count answers there, so the two still agree.
 */
let planFn = null;
let planLoad = null;

export function loadTiming() {
  if (planLoad) return planLoad;
  planLoad = import('../quiz/checkpoint.js')
    .then((m) => { planFn = (m && typeof m.plan === 'function') ? m.plan : null; return true; })
    .catch(() => { planFn = null; return false; });
  return planLoad;
}

/**
 * `placed` is the number of SPACED RECALL STEPS the route already runs, and
 * subtracting them is not a rounding: it is the floor rule, in the words of the
 * module that owns it (`quiz/index.js`, quoted in `tours/budget.js`'s
 * `checkpoints`) — "each host stands down only when the lesson has ALREADY
 * produced at least as many retrievals as there are hosts up to and including
 * it". A route that places R recalls of its own has met its first R hosts, so
 * the FIRST R planned moments, in route order, do not fire.
 *
 * Measured before this argument was here: `lesson-one` places one recall and
 * plans one moment, so this file costed it one production more than
 * `budget.js` did — 45 seconds — and `routeClock` refused the whole route for
 * disagreeing with the published total. The effect on paper was that LESSON
 * ONE's plan, its task sheets and its key printed no minutes at all, while
 * Lesson Two (which places none, so the two agreed) printed its 25–30. Two
 * sheets from the same pack, one with a clock and one without, and nothing on
 * either saying why.
 */
function checkpointsOn(beatIds, placed) {
  const out = new Map();
  if (typeof planFn !== 'function') return out;
  try {
    const got = planFn(beatIds);
    if (!Array.isArray(got)) return out;
    /* `plan()` returns its moments in route order, so "the first R hosts" is
       the first R entries. Dropped here rather than subtracted from the total,
       so that the per-beat marks, the segment ends and the whole-run figure are
       one arithmetic and cannot disagree with each other. */
    const fire = got.slice(Math.max(0, Number(placed) || 0));
    for (const c of fire) if (c && c.beat) out.set(c.beat, (out.get(c.beat) || 0) + 1);
  } catch (_) { /* the scheduler declined; the check below will catch the gap */ }
  return out;
}

/* ------------------------------------------------------- the route clock -- */

const CACHE = new Map();   /* route -> clock, invalidated whenever a payload lands */

/** Called by nothing but this file; the payload's identity is the cache key. */
function key(route) {
  const pub = publishedRoute(route);
  return route + '|' + (pub ? (pub.steps + ':' + pub.minutesExact + ':' + pub.minutesExactMax) : 'none')
    + '|' + routeSteps(route).length + '|' + (planFn ? '1' : '0');
}

/**
 * THE CLOCK FOR ONE ROUTE.
 *
 *   { ok, why, route, label, steps, published,
 *     seconds: { fast, slow },          the whole run, both reading rates
 *     minutes: { fast, slow, say },     rounded, and the sentence
 *     at:  Map beatId -> { start, end } elapsed MINUTES, slow clock
 *     sec: Map beatId -> { start, end } elapsed seconds, slow clock
 *     stops: [ { i, kind, id, after, start, end } ]  every step, in run order
 *     checkpoints: Map beatId -> n }
 *
 * `ok` is false — and every figure above is absent — unless BOTH our totals
 * equal the guided path's own published totals for this route.
 */
export function routeClock(route) {
  if (!route) return { ok: false, why: 'no route has been chosen for this lesson yet', route: null };
  const k = key(route);
  const hit = CACHE.get(route);
  if (hit && hit.$k === k) return hit;

  const out = { $k: k, ok: false, route, why: '', label: '', steps: 0 };
  const pub = publishedRoute(route);
  const list = routeSteps(route);

  if (!pub) {
    out.why = 'the guided path has not published a route called “' + route + '” in this build, '
      + 'so no timing for it can be checked';
    CACHE.set(route, out); return out;
  }
  out.label = pub.label || route;
  out.published = pub;
  if (!list.length) {
    out.why = 'the step list for “' + route + '” has not been checked against the guided path’s '
      + 'own count yet, so no minute figure is printed';
    CACHE.set(route, out); return out;
  }

  const beatIds = list.filter((st) => st.kind === 'beat' && !st.optional).map((st) => st.id);
  const cps = checkpointsOn(beatIds,
    list.filter((st) => st.kind === 'recall' && !st.optional).length);

  /* One pass, two clocks. `fast` is the authored model — the number the tour
     publishes as `minutesExact`; `slow` is the same arithmetic at the
     classroom floor, which is `minutesExactMax` and is the clock a lesson plan
     is written on. */
  let fast = 0, slow = 0;
  const stops = [];
  const sec = new Map();
  for (const st of list) {
    if (st.optional) continue;
    const a = slow;
    if (st.kind === 'beat') {
      const b = beatRecord(st.id);
      fast += beatCost(b, null);
      slow += beatCost(b, SLOW_WPM);
      const n = cps.get(st.id) || 0;
      if (n) { fast += n * RETRIEVAL_S; slow += n * RETRIEVAL_S; }
    } else if (st.kind === 'gate') { fast += GATE_S; slow += GATE_S; }
    else if (st.kind === 'dispute') { fast += DISPUTE_S; slow += DISPUTE_S; }
    else { fast += RETRIEVAL_S; slow += RETRIEVAL_S; }
    stops.push({ i: stops.length, step: 0, kind: st.kind, id: st.id, after: st.after || st.id, start: a, end: slow });
  }
  /* `step` is the 1-based address number, and optional steps are appended past
     the end of the counter, so it is the index in the WHOLE list, not in this
     one. Taken from the list rather than recounted. */
  {
    let j = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].optional) continue;
      if (stops[j]) stops[j].step = i + 1;
      j++;
    }
  }
  for (const st of stops) {
    const home = st.after || st.id;
    const cur = sec.get(home);
    if (!cur) sec.set(home, { start: st.start, end: st.end });
    else cur.end = Math.max(cur.end, st.end);
  }

  /* ---- the check. Two totals, both of them theirs. --------------------- */
  const mineFast = Math.round(fast / 60);
  const mineSlow = Math.round(slow / 60);
  const toldFast = pub.minutesExact;
  const toldSlow = pub.minutesExactMax;
  if (!Number.isFinite(toldFast) || !Number.isFinite(toldSlow)) {
    out.why = 'the guided path published no costed total for “' + route + '”, so this sheet '
      + 'cannot check a clock and prints none';
    CACHE.set(route, out); return out;
  }
  if (mineFast !== toldFast || mineSlow !== toldSlow) {
    out.why = 'this sheet costs “' + route + '” at ' + mineFast + '–' + mineSlow
      + ' minutes and the guided path costs it at ' + toldFast + '–' + toldSlow
      + ', so no times are printed';
    CACHE.set(route, out); return out;
  }

  out.ok = true;
  out.why = 'checked against the guided path’s own costed total of ' + toldFast + '–' + toldSlow
    + ' minutes for this route';
  out.steps = pub.steps;
  out.seconds = { fast, slow };
  out.minutes = {
    fast: mineFast,
    slow: mineSlow,
    say: pub.minutesSay || (mineFast + '–' + mineSlow),
    offer: pub.minutes,
  };
  out.sec = sec;
  out.at = new Map([...sec].map(([id, v]) => [id, { start: v.start / 60, end: v.end / 60 }]));
  out.stops = stops;
  out.checkpoints = cps;
  CACHE.set(route, out);
  return out;
}

/* ---------------------------------------------------- which route Tuesday - */

/**
 * THE SINGLE-PERIOD ROUTE, DISCOVERED RATHER THAN NAMED.
 *
 * Three tests, in order, and the first one that answers wins:
 *
 *  1. THE GUIDED PATH SAID SO. If a published record carries a flag naming
 *     itself as the one-period route, that is the answer and no arithmetic of
 *     ours overrides it. The path team owns the line-up; this is how they tell
 *     us which of it is Tuesday's.
 *  2. ITS NAME SAYS SO. `period`, `one period`, `single` in the id or the
 *     label. Deliberately narrow: "the core lesson" must not match, and does
 *     not.
 *  3. IT FITS. The longest route — most steps, because more of the lesson is
 *     better — whose SLOW total still lands inside the teaching window. The
 *     slow end is the test, because a plan that fits only if the class reads
 *     fast is a plan that overruns.
 *
 * When nothing fits, the answer is the shortest route the build has, `fits` is
 * false, and `why` says in words that no route in this build runs in a period.
 * Every surface prints that sentence rather than a clock that cannot happen.
 */
const NAMED = /(^|[^a-z])(period|one[- ]lesson|single)([^a-z]|$)/i;

/** Does this route end inside the teaching window? The path's own flag first. */
function fitsWindow(r) {
  if (!r) return false;
  if (r.fitsPeriod === true) return true;
  if (r.fitsPeriod === false) return false;
  return Number.isFinite(r.minutesExactMax) && r.minutesExactMax <= teachingWindow().minutes;
}

export function routeChoice() {
  const all = [...publishedRoutes().values()].filter((r) => r && r.id);
  if (!all.length) {
    return { id: null, fits: false, why: 'The guided path has not published its routes in this build, '
      + 'so this plan cannot say which one runs in a period', all: [] };
  }
  const known = new Set(knownRoutes());
  const usable = all.filter((r) => known.has(r.id));
  const pool = usable.length ? usable : all;

  const flagged = pool.filter((r) => r.period === true || r.singlePeriod === true
    || r.onePeriod === true || r.fitsPeriod === true);
  if (flagged.length) {
    /* More than one route may fit a period — the short run does too. The one
       the guided path has made its default is the one it means a class to run,
       and among the rest the longest is the most lesson that still fits. */
    const r = flagged.sort((a, b) => (b.isDefault === true) - (a.isDefault === true)
      || (b.steps || 0) - (a.steps || 0))[0];
    return { id: r.id, fits: true, all: pool,
      why: 'The guided path publishes “' + (r.label || r.id) + '” as the route that runs in a single '
        + 'period, and this is that route’s plan' };
  }

  const named = pool.filter((r) => NAMED.test(r.id) || NAMED.test(r.label || ''));
  if (named.length) {
    const r = named.sort((a, b) => (b.steps || 0) - (a.steps || 0))[0];
    return { id: r.id, fits: fitsWindow(r), all: pool,
      why: '“' + (r.label || r.id) + '” is the route this build names for a single period, and this '
        + 'is that route’s plan' };
  }

  const fitting = pool.filter(fitsWindow);
  if (fitting.length) {
    const r = fitting.sort((a, b) => (b.steps || 0) - (a.steps || 0)
      || (b.minutesExactMax || 0) - (a.minutesExactMax || 0))[0];
    return { id: r.id, fits: true, all: pool,
      why: 'The guided path flags no route as the single-period one in this build, so this plan is '
        + 'written on “' + (r.label || r.id) + '” — the longest route it publishes that still ends '
        + 'inside the teaching window' };
  }

  const shortest = pool.slice().sort((a, b) => (a.minutesExactMax || 0) - (b.minutesExactMax || 0))[0];
  return { id: shortest.id, fits: false, all: pool,
    why: 'No route the guided path publishes in this build ends inside the teaching window. This plan '
      + 'is written on the shortest of them, “' + (shortest.label || shortest.id) + '”, and it will '
      + 'not finish in one period' };
}

/** The route id Tuesday runs on. Null only when the guided path published none. */
export function lessonRoute() { return routeChoice().id; }

/* ------------------------------------------------------------- phrasing -- */

/** `0–4`, from two elapsed-minute marks. Whole minutes: a plan is not a stopwatch. */
export function spanSay(a, b) {
  const lo = Math.round(a);
  const hi = Math.round(b);
  return lo === hi ? String(lo) : lo + '–' + hi;
}

/* Called whenever a fresh payload lands, so a clock is never served from a
   route line-up that has since changed. `key()` already covers the published
   figures; this covers the case where nothing observable changed but the
   checkpoint scheduler arrived late. */
export function invalidate() { CACHE.clear(); UCACHE.k = ''; UCACHE.v = null; }

/* ------------------------------------------------------------- the unit ---- *
 *
 * WHICH PUBLISHED ROUTE IS LESSON ONE AND WHICH IS LESSON TWO.
 *
 * DIDACTIC_SPEC §8, amended wave 9: the empire is a two-lesson unit, and §8.5
 * makes it a law that every surface naming a route says which lesson it is,
 * what it covers, and what the other one covers. The teacher's pack is on that
 * list, so every sheet in it is now a sheet for ONE lesson.
 *
 * The matching is `unit.js::bindLessons()` and it is done on BEATS, not on
 * names: no route id is typed in this directory, because the route line-up
 * belongs to the tours module and has been re-cut in four of the last five
 * waves. This function's only job is to turn the published line-up into the
 * shape that function reads — id, label, purpose, whether it fits a period, and
 * the beats it actually runs — and to hang each lesson's checked clock off the
 * result. A lesson with no route in this build gets `route: null` and a `why`
 * in words; every surface prints the sentence instead of a clock.
 */
const UCACHE = { k: '', v: null };

export function unitLessons() {
  const pub = [...publishedRoutes().values()].filter((r) => r && r.id);
  const shaped = pub.map((r) => ({
    id: r.id, label: r.label, for: r.for, fitsPeriod: r.fitsPeriod,
    /* `routeBeats`, not `routeSteps`: which beats a route runs is a fact about
       the authored file and does not wait on the step-count check, which is a
       claim about the counter. See the note on `steps.js::routeBeats`. */
    beats: routeBeats(r.id),
  })).filter((r) => r.beats.length);
  const k = shaped.map((r) => r.id + ':' + r.beats.join('+')).join('|');
  if (UCACHE.k === k && UCACHE.v) return UCACHE.v;
  const out = bindLessons(shaped).map((b) => ({
    ...b,
    other: LESSONS.find((l) => l.n !== b.lesson.n) || null,
    clock: b.route ? routeClock(b.route) : { ok: false, why: b.why, route: null },
  }));
  UCACHE.k = k; UCACHE.v = out;
  return out;
}

/** One lesson's binding: its lesson record, its route, its clock, its reason. */
export function lessonBinding(n) {
  const all = unitLessons();
  return all.find((b) => b.lesson.n === Number(n)) || all[0] || null;
}

/** The route id one lesson runs on, or null. */
export function routeOf(n) {
  const b = lessonBinding(n);
  return b ? b.route : null;
}

/** Every lesson this build can actually print a timed pack for. */
export function boundLessons() { return unitLessons().filter((b) => b.route); }

export default {
  PERIOD, periodSays, periodVerdict, teachingWindow, wallClock, atMinute, loadTiming,
  routeClock, routeChoice, lessonRoute, spanSay, invalidate, roomArithmetic, roomSays,
  unitLessons, lessonBinding, routeOf, boundLessons,
};
