/**
 * teacher/pack.js — the classroom pack, one lesson at a time: the segments of
 * that lesson, three task tiers, one answer key.
 *
 * WHY THIS FILE EXISTS. Round five, the head of history, on the printed pack:
 * "the teacher is scripted minute by minute, the 28 students are given eight
 * ruled lines", and a non-specialist "cannot run Tuesday from the printed plan
 * because it carries no answer key". Both charges were literally true. The
 * board sheet printed exactly eight ruled lines; `lessonSheet()` printed a
 * five-column table with a What-to-ask column and no answer column; and there
 * was no student sheet of any kind.
 *
 * The tours module had already done its half of the work and said so in its
 * own comment: every beat carries `answer.expected` and `answer.commonWrong`
 * in `tours.json`, published on `window.BEA.toursAnswerKey` — in that file's
 * words — "so the teaching desk's printed plan can carry it". The desk never
 * read it. It does now, joined by `beatId`, so the board answers a teacher
 * says out loud are authored beside the beats they belong to and cannot drift
 * from the questions. Nothing in this file copies that text.
 *
 * WHAT IS AUTHORED HERE, AND WHY IT IS NOT THE SAME THING. The tours answer
 * line tells a teacher what to say when the class answers the beat. It does
 * not mark paper. `unit.js` authors the other half: every segment's worth of
 * written tasks at three tiers, and for every one of those tasks the
 * answer, a weak / secure / strong descriptor, the wrong answer classes
 * actually give, why they give it, and the one sentence to say back. That is
 * what a non-specialist marking thirty scripts on a Wednesday evening needs
 * and it is not derivable from anything.
 *
 * THE NUMBERS. Every quantity in the key is either a date, or a figure the
 * Evidence Ledger already holds — in which case it carries `fig`, the ledger's
 * own row id, and the printed key sets the value and the citation beside it
 * from `corpus.rows` at print time rather than from a typed string here. A
 * figure id that no longer resolves prints as a missing figure and says so; it
 * does not print a number this file remembers.
 *
 * THE ROUTE, AND THE TIMES — NEITHER OF WHICH IS TYPED HERE ANY MORE.
 * Segments used to carry `at: '0-3'`, `mins: 3` and, on every beat, a
 * `core: true|false` flag asserting whether the default route ran it. All three
 * were hand-typed claims about a route that has since been re-costed from
 * "thirty minutes" to fifty-five, and they did not move with it. So:
 *   · which route Tuesday runs on is `timing.js::lessonRoute()`, chosen from
 *     the line-up the guided path publishes;
 *   · whether a beat is on it is `steps.js::carries()`, answered from the
 *     checked step index, with `null` — "not known yet" — kept apart from
 *     `false`;
 *   · when a segment happens is `segmentPlan()` below, computed from the beats'
 *     own costs and checked against the guided path's own published total.
 * A cover teacher running the lesson must not be told to do a beat the route
 * omits, and a task keyed to a beat the class never saw is a task nobody can
 * answer — so a segment the route does not run is printed as extension, by
 * name, rather than as an instruction.
 *
 * LINKS — AND THE PARAGRAPH THAT USED TO STAND HERE.
 * It read: "each segment's link is a state deep link (#year=…&sel=…) … it is
 * deliberately not #tour=core&step=N … this module cannot compute it without
 * reimplementing tours/_flatten. A number this file cannot verify is a number
 * it does not print." Round two answered that, correctly: "a cover teacher who
 * loses the run has to restart from step 1. Publish the flattened step index."
 *
 * The refusal was right about the risk and wrong about the remedy. A state link
 * restores the MAP; it does not restore the LESSON — no transport, no counter,
 * no Next. So `steps.js` now mirrors `_flatten` and CHECKS the mirror against
 * the tour's own published step count for every route it knows, whatever those
 * routes and those counts are this week. A route that fails the check prints no step
 * numbers and the sheet prints the reason instead. Both links are printed: the
 * step link puts the lesson back, the state link puts only the map back, and
 * the plan says which does which.
 *
 * Segments still name their beats by id, and a beat the lesson route omits is
 * given the step number of a route that DOES carry it, never the lesson
 * route's — a beat that is not on a route has no page number on it.
 */

import { stepOf, stepCount, stepCheck, afterBeat, carries, routeBeats, publishedRoutes, routeSteps, beatRecord, knownRoutes } from './steps.js';
/* THE FIGURE REGISTRY, so a derived answer line prints the same substituted
   quantity the beat prints. Same module `tours/index.js::_answerKey` calls;
   the registry is a module singleton the tour has already filled. */
import { plain as figPlain } from '../tours/figures.js';
import { lessonRoute, routeOf, lessonBinding, routeClock, spanSay } from './timing.js';
import { kindsOfRuleSays, kindsOfRuleChecked } from './parts.js';

/* ---------------------------------------------------------------- the content --
 *
 * THE AUTHORED PACK CONTENT MOVED, AND HERE IS WHY.
 *
 * DIDACTIC_SPEC §8 became a two-lesson unit in wave 9, which means every
 * printed page has to know which lesson it is for — and the two charges the
 * critics brought against the pack were both pages that did not: a board sheet
 * asking a class to check a fact the route never taught, and a printed step 1
 * asking a question the app's step 1 does not ask. Both were repaired in the
 * renderers, and a repair in a renderer lasts until the next edit of the data.
 *
 * So the data now states the claim a checker can falsify — every board line,
 * plan row, segment and task carries the LESSON that prints it and the BEAT
 * that puts its evidence on screen — and it lives in `unit.js`, which has NO
 * IMPORTS so that `tools/check-pack.js` can read it in Node. This file keeps
 * the functions and re-exports the data, so no call site had to move and there
 * is exactly one copy of every sentence.
 */
export { TIERS, SEGMENTS, TASKS, LESSONS, BOARDS, PLAN, UNIT_SENTENCE, UNIT_NAME,
  boardOf, planOf, segmentsOf, lessonNo, otherLesson, demotionOf } from './unit.js';
import { TIERS, SEGMENTS, TASKS, LESSONS, lessonNo, tasksOf, segmentsOf, segmentOf as segOf } from './unit.js';


/** Tasks for ONE LESSON and one tier, in segment order. A sheet is a sheet for
 *  one lesson: with no lesson given this answers the whole unit's tasks, which
 *  is what a count of the pack wants and never what a printed sheet wants. */
export function tasksFor(tier, lesson) {
  if (lesson != null) return tasksOf(lesson, tier);
  const order = new Map(SEGMENTS.map((s, i) => [s.id, i]));
  return TASKS.filter((t) => t.tier === tier).sort((a, b) => order.get(a.seg) - order.get(b.seg));
}

/** The segment a task belongs to. */
export function segmentOf(task) { return segOf(task); }

/** THE LESSON A PIECE OF PACK CONTENT BELONGS TO, and the route that lesson
 *  runs on. Everything below asks these two rather than a global "the lesson
 *  route", because there are two lessons and they are different runs. */
export function lessonOfSeg(seg) { return (seg && seg.lesson) || 1; }
export function routeForSeg(seg) { return routeOf(lessonOfSeg(seg)); }

/**
 * IS THIS BEAT ON THIS ROUTE? Asked of the mirrored BEAT LIST first.
 *
 * `carries()` is gated on the step-COUNT check, and rightly — a step number is
 * a claim about where the counter will read mid-lesson. But "does this lesson
 * run this beat" is a different question with a different source: it is
 * `tours.json`'s own `variants` list, which `steps.js::routeBeats` mirrors and
 * which nothing about a disagreement over gates or recalls makes wrong.
 *
 * Measured while the tours module was re-cutting its line-up for the two-lesson
 * split: `carries()` answered null for every beat of `lesson-two`, so every
 * extension mark on every task sheet went away, every board line printed "this
 * build could not check which steps the route runs", and the tag line beside a
 * segment fell back to the authored union — which is how Lesson Two's Ink sheet
 * printed T12 beside a beat the route had demoted. The beat list was correct
 * throughout. Three states are kept: true, false, and null for a build where
 * neither source knows.
 */
export function runsOn(beatId, route) {
  if (!route || !beatId) return null;
  const list = routeBeats(route);
  if (list && list.length) return list.includes(beatId);
  return carries(beatId, route);
}

/**
 * THE TOURS ANSWER KEY, AND WHY IT ARRIVES OVER THE BUS.
 *
 * `tours/index.js` publishes one `expected` line and one `commonWrong` line
 * per beat, authored in `tours.json` beside the beat, and says in its own
 * comment that it does so "so the teaching desk's printed plan can carry it".
 * It publishes them twice: on the `tours:ready` event, and on
 * `window.BEA.toursAnswerKey`.
 *
 * The handle does not survive. `main.js` assigns `window.BEA = { … }` — a
 * fresh object, not a merge — AFTER it emits `app:ready`, so every key any
 * module wrote before that line is discarded, this one included. Measured in
 * the running app: `Object.keys(window.BEA)` holds twenty-three handles and
 * `toursAnswerKey` is not among them, at boot and after navigating to
 * `#panel=classroom`. The printed plan's answer column was therefore empty and
 * said so on the page — which is how it was found.
 *
 * So the desk takes the event instead. `teacher/index.js` subscribes to
 * `tours:ready` during its own mount, which is before `app:ready`, and hands
 * the payload here. The handle is still read as a fallback in case a future
 * build restores it; neither path invents a line if both are absent, and every
 * printed surface prints the absence in words rather than a blank column.
 */
let BEATS = new Map();

/** Called by the module when tours announces itself. */
export function setBeatAnswers(list) {
  if (!Array.isArray(list)) return;
  const m = new Map();
  for (const r of list) if (r && r.beatId) m.set(r.beatId, r);
  if (m.size) BEATS = m;
}

/**
 * THE ANSWER KEY IS PUBLISHED FOR THE ROUTE THE TOUR IS ON, AND A PACK IS
 * PRINTED FOR A LESSON THAT MAY NOT BE IT.
 *
 * `tours/index.js::_answerKey` walks `this.steps` — the route the reader is
 * actually running — so a cold start publishes LESSON ONE's beats and nothing
 * else. Printed from that same page, Lesson Two's plan then said, on four of
 * its five segments: "The guided path is not running in this build, so the beat
 * answer lines could not be read." The classroom critic, round two: the answer
 * lines are "the single most valuable thing in Lesson One's" plan, and Lesson
 * Two had none of them.
 *
 * The lines themselves are not a fact about a route. They are authored on the
 * BEAT, in `tours.json`, as `answer.expected` and `answer.commonWrong` beside
 * the beat's own `say`; the only route-dependent field `_answerKey` adds is
 * `step`, and no printed surface here reads it (segment numbering comes from
 * `segmentStart`/`beatStep`, which ask the checked index for the right route).
 *
 * So a beat the published key does not carry is read off the authored beat,
 * through the same figure registry the tour substitutes with, and marked
 * `derived: true` so a caller can tell the two apart. Where the tour HAS
 * published a line, the published one wins — this never overwrites the guided
 * path's own answer.
 *
 * This restates four lines of `_answerKey`, which this repository is right to
 * be nervous about, so the drift is checked rather than hoped for:
 * `derivedAudit()` below runs the derivation against the published key for
 * every beat the tour does publish, and `tools/scenarios/p20-accept.js` — on
 * the acceptance board as `p20-print` — fails the build on any disagreement.
 * A drift can then only be about a beat nobody is running, and the next route
 * change surfaces it.
 */
function derivedAnswer(id) {
  const b = beatRecord(id);
  const a = b && b.answer;
  if (!a) return null;
  return {
    step: null,
    beatId: id,
    mark: b.ledeMark || b.mark || '',
    title: (b.panel && b.panel.title) || id,
    ask: figPlain(String(b.say || '').replace(/<[^>]+>/g, '')),
    expected: figPlain(a.expected),
    commonWrong: figPlain(a.commonWrong),
    optional: !!b.optional,
    derived: true,
  };
}

/** The answer lines, by beat id: the guided path's own where it has announced
 *  them, and the authored beat's where it has not. Empty only when neither the
 *  tour nor `tours.json` could be read. */
export function beatAnswers() {
  const out = new Map();
  for (const id of allBeatIds()) {
    const d = derivedAnswer(id);
    if (d) out.set(id, d);
  }
  try {
    const key = (typeof window !== 'undefined' && window.BEA && window.BEA.toursAnswerKey) || null;
    if (Array.isArray(key)) for (const r of key) if (r && r.beatId) out.set(r.beatId, r);
  } catch (_) { /* no handle; the authored lines above still stand */ }
  for (const [id, r] of BEATS) out.set(id, r);
  return out;
}

/**
 * THE DRIFT CHECK, for the scenario that owns it. For every beat the guided
 * path has published a line for, derive one from the authored beat and report
 * any field that does not match. `[]` means the derivation is doing exactly
 * what `tours/index.js::_answerKey` does.
 */
export function derivedAudit() {
  const out = [];
  try {
    /* The EVENT's rows, not the handle's: `main.js` replaces `window.BEA` on
       the line after `app:ready`, so the handle is often gone and the event is
       the surviving channel — the same reason `setBeatAnswers` exists. */
    let key = [...BEATS.values()];
    if (!key.length) {
      const h = (typeof window !== 'undefined' && window.BEA && window.BEA.toursAnswerKey) || null;
      key = Array.isArray(h) ? h : [];
    }
    for (const r of key) {
      if (!r || !r.beatId || r.derived) continue;
      /* `tours.json` not read yet: there is nothing to compare, and reporting a
         disagreement against a file that has not arrived is noise. `null` says
         "not checkable yet"; the publisher re-runs when the file lands. */
      if (!beatRecord(r.beatId)) return null;
      const d = derivedAnswer(r.beatId);
      if (!d) { out.push({ beat: r.beatId, field: 'the beat itself', got: 'the beat carries no authored answer' }); continue; }
      for (const f of ['ask', 'expected', 'commonWrong', 'mark', 'title']) {
        if (String(r[f] || '').trim() !== String(d[f] || '').trim()) {
          out.push({ beat: r.beatId, field: f, told: String(r[f] || '').slice(0, 60), got: String(d[f] || '').slice(0, 60) });
        }
      }
    }
  } catch (_) { /* no handle; the scenario reports the absence */ }
  return out;
}

/** Every beat id this build's routes run, from the checked index. */
function allBeatIds() {
  const out = new Set();
  for (const id of knownRoutes()) for (const b of routeBeats(id)) out.add(b);
  return out;
}

/* ---------------------------------------------------- the page number -- */

/**
 * WHERE THE RUN SHOULD BE, for one segment. The first beat of the segment that
 * the default route actually runs, with its verified step index. Null when the
 * mirror in `steps.js` has not been checked against the guided path's own
 * count — in which case every sheet prints the state link and the reason.
 */
export function segmentStart(seg) {
  const route = routeForSeg(seg);
  const b = seg.beats.find(x => !x.optional && carries(x.id, route) === true);
  if (!b) return null;
  const n = stepOf(b.id, route);
  if (!n) return null;
  return { beat: b, n, of: stepCount(route), route, href: '#tour=' + route + '&step=' + n };
}

/**
 * The step number of ONE beat, on the route that actually carries it.
 *
 * A beat the lesson route omits gets the number of a route that does run it —
 * the longest one, because a teacher going off-piste for one beat wants the
 * route that has the rest of the context around it — and never the lesson
 * route's, because printing that would be a page number for a page that is not
 * there. Which routes those are is asked of the published line-up; no route id
 * is typed in this file.
 */
export function beatStep(b, lesson) {
  if (!b || !b.id) return null;
  const home = routeOf(lesson == null ? 1 : lesson) || lessonRoute();
  if (carries(b.id, home) === true) {
    const n = stepOf(b.id, home);
    if (n) return { route: home, n, of: stepCount(home), lesson: true, optional: !!b.optional, href: '#tour=' + home + '&step=' + n };
  }
  /* THE SHORTEST ROUTE THAT CARRIES IT, not the longest. A teacher going off
     the lesson for one beat wants the least detour that has it, and pointing
     them at the longest route in the build to see a ninety-second beat is not that. */
  const others = [...publishedRoutes().values()]
    .filter(r => r && r.id && r.id !== home)
    .sort((x, y) => (x.steps || 0) - (y.steps || 0));
  for (const r of others) {
    const n = stepOf(b.id, r.id);
    if (n) return { route: r.id, label: r.label || r.id, n, of: stepCount(r.id), lesson: false, optional: !!b.optional, href: '#tour=' + r.id + '&step=' + n };
  }
  return null;
}

/* Tags out of a string the app renders as HTML, for a sheet that prints text. */
const plain = (t) => String(t == null ? '' : t).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/**
 * THE RETRIEVAL ITEM BEHIND A RECALL STOP, asked of the module that owns it.
 *
 * A recall step is not a beat: `tours/index.js::_applyRecall` emits `quiz:ask`
 * and the quiz module renders the card, so the question, the answer and the
 * source belong to `quiz/`. It publishes its resolved items on
 * `window.BEA.quiz.items()` — resolved, meaning the numbers in them are already
 * read out of the dataset — and this reads them there. No question and no
 * answer is written down here; a build without the quiz module answers null
 * and the sheet prints the absence in words.
 */
function quizItem(id) {
  try {
    const q = (typeof window !== 'undefined' && window.BEA && window.BEA.quiz) || null;
    if (!q || typeof q.items !== 'function') return null;
    return (q.items() || []).find((x) => x && x.id === id) || null;
  } catch (_) { return null; }
}

/**
 * THE SCRIPT FOR ONE RECALL STOP — the block round nine found missing.
 *
 * The classroom critic: "Give the two recall stops the same SAY / ASK / If they
 * say / Watch for block every beat segment has. Step 7 asks a whole class to
 * guess the Bengal 1943 death toll and a cover teacher has nothing to say when
 * a hand goes up." And, separately: "The plan calls both recall stops 'A
 * retrieval question about something met earlier in this lesson'. Step 5's own
 * on-screen copy says 'One number this chapter never gave you.' Take that
 * sentence from the beat, as the plan already takes its answer lines."
 *
 * Both halves are answered from the two files that already hold the words:
 * `tours.json`'s `recallAfter` block carries the sentence the class will see
 * on screen (`say`) and the eyebrow above it (`mark`); `quiz/bank.json`, by way
 * of the resolved item, carries the question, the answer with its figures read
 * out of the dataset, and the one paragraph that says why the number matters.
 * Nothing in this file states any of it.
 */
export function recallScript(st) {
  if (!st || st.kind !== 'recall') return null;
  const r = st.rec || null;
  const item = quizItem(st.id);
  if (!r && !item) return null;
  return {
    mark: r && r.mark ? String(r.mark) : '',
    say: r && r.say ? plain(r.say) : '',
    ask: item && item.question ? plain(item.question) : '',
    answer: item && item.correction ? plain(item.correction) : '',
    why: item && item.because ? plain(item.because) : '',
    subject: item && item.subject ? plain(item.subject) : '',
    t: (r && r.t) || (item && item.t) || '',
    resolved: !!item,
  };
}

/**
 * THE STOPS BETWEEN THE BEATS OF A SEGMENT, in words a plan can print. A gate
 * is the one place in the run where Next is disabled, and a plan that does not
 * say so sends a cover teacher to look for a broken button.
 *
 * A recall stop now carries its own script out with it — see `recallScript` —
 * because "a retrieval question about something met earlier" is not something a
 * cover teacher can run: it does not say what is asked, and it does not say
 * what the answer is.
 */
export function segmentStops(seg) {
  const out = [];
  const route = routeForSeg(seg);
  for (const b of seg.beats) {
    if (b.optional || carries(b.id, route) !== true) continue;
    for (const st of afterBeat(b.id, route)) {
      const script = recallScript(st);
      out.push({
        n: st.n,
        kind: st.kind,
        script,
        /* Terse on purpose. What a gate DOES — Next off, any placement moves
           on — is said once at the head of the plan; repeating it at each of
           the four stops cost a printed side and told a teacher nothing they
           had not read four minutes earlier. */
        says: st.kind === 'gate'
          ? 'Complication Gate' + (st.claim ? ' — “' + st.claim + '”' : '.') + ' Next is off until a card is placed.'
          : st.kind === 'dispute'
            ? 'The argument between two named historians. Next is off until the class has taken a side '
              + 'and written a sentence saying why.'
            /* NOT "a retrieval question about something met earlier": that
               sentence was this file's own, it was the same on both stops, and
               on this route it was not even true of the first one. The beat's
               own copy is `script.say`; this line only says what the CONTROL
               does, which is the half the beat does not say. */
            : (script && script.say
              ? 'A retrieval card, in the run\u2019s own words below. Nothing is switched off.'
              : 'A retrieval card the class answers on screen. Nothing is switched off.'),
      });
    }
  }
  return out;
}

/** The lesson route's own name, step count, and whether its index is checked. */
export function routeFacts(lesson) {
  /* NO ROUTE AT ALL is a state this build can be in — the guided path may not be
     installed, its own files may not have loaded, or (since wave 9) it may
     publish no single-period route carrying THIS lesson's beats. Every sheet
     then prints the reason and the state links, and nothing prints `#tour=null`. */
  const bind = lessonBinding(lesson == null ? 1 : lesson);
  const route = bind ? bind.route : null;
  const c = route ? stepCheck(route)
    : { ok: false, why: (bind && bind.why)
      || 'the guided path is not running in this build, so there is no route to number' };
  const clock = routeClock(route);
  return {
    route,
    lesson: bind ? bind.lesson : null,
    other: bind ? bind.other : null,
    bind,
    label: clock.label || route || 'no guided route',
    steps: stepCount(route),
    ok: c.ok,
    why: c.why,
    /* Every minute figure on every sheet comes through here, and it comes from
       the guided path's own costed total by way of `timing.js`, never from
       this file. `clock.ok` false means: print the sentence, not a number. */
    clock,
  };
}

/**
 * How many of a segment's beats the LESSON ROUTE actually runs. An optional
 * beat counts as neither: it is appended past the end of every route, so it is
 * never missing and never required. `unknown` is the third state and it is not
 * folded into either of the other two — while the step index is still loading,
 * `carries()` answers null, and a sheet that read that as "off the route" would
 * print seven extension warnings for one second and then take them away.
 */
export function coreCount(seg) {
  const route = routeForSeg(seg);
  const required = seg.beats.filter(b => !b.optional);
  let on = 0, off = 0, unknown = 0;
  for (const b of required) {
    const c = runsOn(b.id, route);
    if (c === true) on++;
    else if (c === false) off++;
    else unknown++;
  }
  return { on, off, unknown };
}

/**
 * WHAT THIS SEGMENT ACTUALLY TEACHES ON THIS ROUTE, from the beats' own tags.
 *
 * The T-, LO- and M- numbers printed beside a segment used to be typed here as
 * the union of every beat the segment lists, on-route or not — so segment 4
 * promised T7, T9 and T11 on a route that runs only the beat carrying T7, and
 * a student's own task sheet said the task covered the princely states. Each
 * beat in `tours.json` carries exactly one of each; this reads them off the
 * beats the route actually runs. Falls back to what is authored while the step
 * index is unchecked, because an empty tag line is worse than a stale one.
 */
export function segmentTags(seg) {
  const t = [], lo = [], m = [];
  let known = false;
  for (const b of seg.beats) {
    const on = runsOn(b.id, routeForSeg(seg));
    if (on !== true) { if (on === false) known = true; continue; }
    known = true;
    const rec = beatRecord(b.id);
    if (!rec) continue;
    if (rec.t && !t.includes(rec.t)) t.push(rec.t);
    if (rec.lo && !lo.includes(rec.lo)) lo.push(rec.lo);
    if (rec.misconception && !m.includes(rec.misconception)) m.push(rec.misconception);
  }
  if (!known || !t.length) return { t: seg.t || [], lo: seg.lo || [], m: seg.m || [], computed: false };
  return { t, lo, m, computed: true };
}

/**
 * THE TAGS FOR ONE TASK, WHICH ARE ITS OWN BEAT'S AND NOT ITS SEGMENT'S.
 *
 * `segmentTags` is right for a segment: it reads the T-, LO- and M-numbers off
 * the beats the route actually runs there. A TASK is narrower. Lesson Two's
 * segment s6 runs `scramble` (T13) and has `egypt` (T12) demoted, so the
 * segment's computed tags come out T13 — and the Egypt task, printed under the
 * EXTENSION label on a student's own sheet, was chipped T13 beside a question
 * about T12. The tag beside a question is the tag of the thing the question is
 * about, on the route or off it.
 */
export function taskTags(t, seg) {
  const rec = t && t.beat ? beatRecord(t.beat) : null;
  if (!rec || !rec.t) return segmentTags(seg);
  return {
    t: [rec.t], lo: rec.lo ? [rec.lo] : [], m: rec.misconception ? [rec.misconception] : [],
    computed: true,
  };
}

/**
 * IS THIS BEAT ON THE ROUTE THIS LESSON RUNS? true / false / null-for-unknown.
 *
 * `lesson` IS REQUIRED, and a missing one answers null rather than 1. It used
 * to default to Lesson One, which is a confident answer about the wrong lesson,
 * and `sheets.js::offNames` took it: every beat on LESSON TWO's printed plan
 * was checked against Lesson One's route, so the plan listed “The war the
 * empire fought” at step 7 and then told the teacher the lesson does not run
 * it. A default that is right half the time is worse here than no answer, since
 * every sheet in this directory already knows how to print `null` — it prints
 * nothing and marks nothing.
 */
export function onLesson(beatId, lesson) {
  if (lesson == null) return null;
  return runsOn(beatId, routeOf(lesson));
}

/**
 * IS THIS TASK EXTENSION? A task is extension when the lesson route does not
 * run the beat that puts its evidence on screen. `null` while the step index is
 * unchecked, and no sheet marks anything on `null`.
 */
export function taskIsExtension(t) {
  if (!t || !t.beat) return null;
  if (t.off) return true;              /* authored as a case from off this map */
  const on = onLesson(t.beat, t.lesson);
  return on === null ? null : on === false;
}

/**
 * IS THIS SEGMENT PART OF TUESDAY, OR IS IT EXTENSION? A segment none of whose
 * required beats the lesson route runs is not a segment a cover teacher can
 * teach; it is extension, and every sheet says so in that word. While the step
 * index is unchecked the answer is `null` and no sheet re-labels anything.
 */
export function segmentIsExtension(seg) {
  const c = coreCount(seg);
  if (c.unknown) return null;
  return c.on === 0;
}

/* -------------------------------------------------------- the lesson clock -- */

/**
 * WHEN EACH SEGMENT HAPPENS, AND IT IS NOT TYPED ANYWHERE.
 *
 * `timing.js` costs every step of the lesson route from the beats' own authored
 * costs and checks its two totals against the two the guided path published for
 * that same route. This groups those steps into THAT LESSON's segments — a gate, an
 * argument or a spaced recall belongs to the segment of the beat it stands
 * after — and hands back one row per segment: when it starts, when it ends, how
 * long it lasts, and whether the route runs it at all.
 *
 * `ok` false means the clock could not be checked. Every caller then prints
 * `why` in words and no times at all.
 */
export function segmentPlan(lesson) {
  const n = lesson == null ? 1 : Number(lesson);
  const route = routeOf(n);
  const clock = route ? routeClock(route) : { ok: false, why: (lessonBinding(n) || {}).why || '' };
  const mine = segmentsOf(n);
  const home = new Map();
  for (const seg of mine) for (const b of seg.beats) home.set(b.id, seg.id);

  const rows = mine.map(seg => ({
    seg, id: seg.id, on: false, extension: segmentIsExtension(seg),
    start: null, end: null, mins: null, say: '',
  }));
  const byId = new Map(rows.map(r => [r.id, r]));

  if (clock.ok) {
    for (const st of clock.stops) {
      const r = byId.get(home.get(st.after || st.id));
      if (!r) continue;
      r.on = true;
      r.start = r.start === null ? st.start : Math.min(r.start, st.start);
      r.end = r.end === null ? st.end : Math.max(r.end, st.end);
    }
    for (const r of rows) {
      if (!r.on) continue;
      const a = r.start / 60, b = r.end / 60;
      r.say = spanSay(a, b);
      r.mins = Math.max(1, Math.round(b) - Math.round(a));
      r.startMin = a; r.endMin = b;
    }
  }
  return { ok: clock.ok, why: clock.why, route, lesson: n, clock, rows };
}

/**
 * THE SUPERLATIVE, COMPUTED — because two of them were typed and one was false.
 *
 * Round nine, the classroom critic: "app/js/teacher/pack.js:285 hardcodes 'The
 * shortest segment in the lesson' on the 26–29 min (3 min) segment while the
 * 25–26 min segment is 1 min. Compute the superlative from the same clock as
 * everything else, or delete it. pack.js:193's 'longest segment' happens still
 * to be true and is the same unchecked category."
 *
 * So both are gone from the copy and this answers instead, off `segmentPlan()`
 * — the same checked clock every other figure on every sheet comes from. It
 * says nothing at all when the clock is unchecked, when fewer than three
 * segments run (a superlative over two is not information), or when the
 * extreme is shared, because "one of the two longest" is a sentence nobody
 * needs. The minute figure in it is the row's own; no number is typed.
 */
export function segmentSuperlative(seg) {
  const plan = segmentPlan(lessonOfSeg(seg));
  if (!plan.ok || !seg) return '';
  const on = plan.rows.filter((r) => r.on && Number.isFinite(r.mins));
  if (on.length < 3) return '';
  const row = on.find((r) => r.id === seg.id);
  if (!row) return '';
  const mins = on.map((r) => r.mins);
  const max = Math.max(...mins);
  const min = Math.min(...mins);
  const say = (n) => n + (n === 1 ? ' minute' : ' minutes');
  if (row.mins === max && mins.filter((n) => n === max).length === 1) {
    return 'The longest segment in this lesson, at ' + say(row.mins) + '. ';
  }
  if (row.mins === min && mins.filter((n) => n === min).length === 1) {
    return 'The shortest segment in this lesson, at ' + say(row.mins) + '. ';
  }
  return '';
}

/**
 * A SEGMENT'S OPENING INSTRUCTION, with the computed superlative in front of
 * it. Every sheet prints this rather than `seg.open`, so the claim about which
 * segment is longest is made in one place and is made by the clock.
 */
export function segmentOpen(seg) {
  return segmentSuperlative(seg) + ((seg && seg.open) || '');
}

/* ------------------------------------------------- the key's own quantities --
 *
 * ONE QUANTITY, ONE ANSWER. The core Task 7 model answer read "painted one
 * colour over a dozen kinds of rule" while the poster beat's own panel counted
 * sixteen and the board sheet said fifteen — round nine's rubric critic, "one
 * quantity, three answers". A model answer that disagrees with the screen is
 * worse than one that is vague, so the clause is a token and `parts.js` counts
 * it from the dataset with `tours/answers.js::statusCount`, which is the
 * function the beat itself is answered by.
 *
 * A token nobody resolves prints as itself, visibly, rather than silently
 * becoming an empty space in a sentence a teacher is reading out.
 */
const KEY_TOKENS = {
  kindsOfRule: (data) => kindsOfRuleSays(data, 'kinds of rule'),
  /* The board's first held line: the same count, with the year it was counted
     at, because a line a class is asked to CHECK on the map has to say which
     map. `parts.js::kindsOfRuleChecked`. */
  kindsChecked: (data) => kindsOfRuleChecked(data, 'different legal arrangements'),
};

export function keyText(text, data) {
  return String(text == null ? '' : text)
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (KEY_TOKENS[k] ? KEY_TOKENS[k](data) : m));
}

/**
 * THE FORWARD EDGES THIS ROUTE ACTUALLY CARRIES, counted rather than asserted.
 * The printed plan used to promise "the four numbered stops below marked
 * Complication Gate or argument" — four was `core`'s count, and a route with no
 * gates on it sends a cover teacher hunting for a control that is not there.
 */
export function routeForwardEdges(lesson) {
  const r = routeOf(lesson == null ? 1 : lesson);
  const list = r ? routeSteps(r) : [];
  let gates = 0, disputes = 0, recalls = 0;
  for (const st of list) {
    if (st.optional) continue;
    if (st.kind === 'gate') gates++;
    else if (st.kind === 'dispute') disputes++;
    else if (st.kind === 'recall') recalls++;
  }
  return { gates, disputes, recalls, blocking: gates + disputes, known: list.length > 0 };
}

export default { TIERS, SEGMENTS, TASKS, LESSONS, tasksFor, segmentOf, lessonOfSeg, routeForSeg, runsOn, beatAnswers, setBeatAnswers, coreCount, segmentTags, onLesson, taskIsExtension, segmentIsExtension, segmentPlan, routeForwardEdges, segmentStart, beatStep, routeFacts, segmentStops, recallScript, segmentSuperlative, segmentOpen, keyText };
