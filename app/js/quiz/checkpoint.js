/**
 * quiz/checkpoint.js — retrieval ON the path, not beside it.
 *
 * THE DEFECT THIS EXISTS TO FIX. Round 2's critic: "the eight-item adaptive
 * retrieval block is opt-in behind a masthead 'Recall' button. Nothing on the
 * path forces the second spaced encounter, so the spacing claim in the didactic
 * spec is unearned for any student who simply presses Next." That was true. A
 * student could press Next through every beat and never once be made to
 * *produce* anything after minute 22, which is the single claim DIDACTIC_SPEC
 * §3 and §8.1 rest on ("every T-item introduced before minute 16 is retrieved
 * again after minute 22").
 *
 * WHERE THIS RUNS, AND WHO OWNS THE PLACEMENT. FEATURE_SPEC §2 P10 says this
 * piece "depends on P05 (beat placement)", and P05 now carries four `recall`
 * steps on the spine that hand us an item through `quiz:ask`. That is the right
 * owner for *where*, and this file does not compete with it: the moment a
 * `quiz:ask` arrives from the path, the autonomous hosts below stand down for
 * the rest of the session. Eight retrieval moments in thirty minutes is not
 * twice the spacing, it is half the lesson.
 *
 * What this file owns is *which* item, and the four hosts are the fallback for
 * a path that places none — the eight-minute variant, an older tours.json, a
 * deep link into the middle of the lesson. They are `present`-kind beats that
 * open or close a chapter, the only places where the student is reading rather
 * than committing, and all four sit after the path's own first recall step, so
 * a path that does its job never reaches them.
 *
 * HOW THE ITEM IS CHOSEN — the adaptive part, in four bands, stated to the
 * student in the card itself because a student who can see why they are being
 * asked again understands what spacing is for:
 *
 *   0  you got this wrong earlier and the gap has now elapsed
 *   1  you got something on this T-number wrong, and this asks it another way
 *   2  the lesson has taught this and never asked you to produce it
 *   3  anything else the lesson has covered
 *
 * ABOVE the bands, and only above them, sits one filter: while any eligible
 * item sits on a T-number no earlier moment has spent, every item on a spent
 * one is out. Four moments against twenty must-stick items is the scarcest
 * budget in this app, and until round 6 round 2 that rule was a sort key
 * BELOW the band — so a student who got two things wrong on one T-number spent
 * all four moments on two T-numbers, measured on `core` as T13, T13, T7, T7.
 * Then, within a band: an objective (LO) this session has not yet retrieved,
 * then the earliest thing in the lesson, then the id — so the choice is
 * deterministic and a scenario can assert it.
 *
 * AND ONE MORE THING THE CARD HAS TO KNOW: whether this is the student's
 * SECOND encounter with the thing or their first. Both are worth doing —
 * §8.1 asks for prediction before reveal five times — but they are different
 * moves and the card said the first was the second. See `onScreenT`.
 *
 * ELIGIBILITY is computed from `tours:beat` events — id, `t` and `chapter` —
 * plus, on a returning visit, the Ledger's own record of completed beats. So
 * this file never parses another piece's data files and cannot go stale
 * against them. CHAPTER_T is DIDACTIC_SPEC §8's own chapter-to-T-number
 * assignment, transcribed. Nothing outside it can be asked, which is the
 * §3 rule: no item may test anything but the twenty and the eighteen.
 */

import { tagsOf, belief, debt, owesPrimary } from './misconceptions.js';

/** DIDACTIC_SPEC §8: which of the twenty each chapter of the lesson carries. */
export const CHAPTER_T = {
  poster: ['T1'],
  atlantic: ['T2', 'T3', 'T4', 'T5'],
  company: ['T6', 'T7', 'T8', 'T9', 'T10', 'T11'],
  imperial: ['T12', 'T13', 'T14', 'T15', 'T16', 'T17'],
  dissolution: ['T14', 'T18', 'T19'],
  after: ['T20'],
};

/**
 * THE FOUR RETRIEVAL MOMENTS — AND WHY THEY ARE NO LONGER FOUR BEAT IDS.
 *
 * ROUND 6, W4, reproduced before it was fixed. Walking `core` — THE DEFAULT
 * ROUTE — end to end pressing nothing but Next produced two retrievals, not
 * four, and the cards printed "checkpoint 1 of 4" and "checkpoint 2 of 4" at
 * them. The cause was that this list named four beats and two of them are not
 * on that route: `singapore` belongs to the full path only, and `amritsar` HAS
 * NEVER EXISTED IN THIS APPLICATION AT ALL — the Amritsar beat is
 * `two-in-tension`. That is precisely the defect round 5 found in close.json
 * line 11, in a second file, still standing: a hard-coded id in one module
 * pointing at a beat another module does not have, failing silently, and a
 * printed number saying otherwise.
 *
 * So a moment is no longer a beat id. It is an ORDERED LIST of beats that can
 * host it, resolved by `plan()` against the route the student is actually on —
 * read off `tours:ready`'s own published step index, never off tours.json, so
 * this file still parses no other piece's data. A moment that cannot resolve
 * is dropped, and the total the card prints is the number of moments that
 * resolved, so "checkpoint 2 of 3" on `core` and "2 of 4" on the full path are
 * both true sentences about the run the student is in. Same rule as the
 * Close's route-relative denominator: never print a total the route cannot
 * reach.
 *
 * WHAT DECIDES A CANDIDATE. A host is a beat where the student is READING
 * rather than committing, so a question does not land on top of a question,
 * and the ledes are positional prose that has to stay true wherever a moment
 * lands. `MIN_BEAT_GAP` keeps two moments from landing within two beats of
 * each other: on `core` that is what stops `exits` (minute 25.9) firing 1.7
 * minutes after `two-in-tension` (minute 24.2), which would be a cluster, not
 * spacing. The last moment is exempt from the gap only when it is the route's
 * final required beat, because "last one before the close" is a place, not an
 * interval.
 *
 * WHY EVERY MOMENT CARRIES TWO LEDES. Round 6 round 2: the card said "Two
 * chapters behind you. The second encounter is not reading it again. It is
 * saying it again." at `egypt` while asking about T13, whose beat is the NEXT
 * step. `lede` is the sentence for a second encounter and `ledePre` for a
 * first, and `onScreenT` below decides which — the position is stated the same
 * way in both, because the position is true either way, and only the claim
 * about having met the thing changes. Both are written so they survive a cold
 * `#tour=core&step=9`, where the student has read two beats and no chapters.
 */
export const MOMENTS = [
  {
    id: 'after-chapter-ii',
    hosts: ['egypt', 'revenue-loop'],
    lede: 'Two chapters behind you. The second encounter is not reading it again. It is saying it again.',
    ledePre: 'Two chapters in, and this one is still ahead of you. Answer it before the lesson gets there.',
  },
  {
    id: 'inside-chapter-iii',
    /* NOT the Amritsar beat. `two-in-tension` is the heaviest beat on either
       route and the gravest thing in the lesson; a pop question landing on its
       first frame is the one interruption this module should never make. */
    hosts: ['two-track', 'singapore'],
    lede: 'One thing from earlier before you read on \u2014 out of your head, page shut.',
    ledePre: 'One thing you have not met yet, before you read on. Guess it, then find out.',
  },
  {
    id: 'inside-chapter-iv',
    hosts: ['exits', 'singapore'],
    lede: 'Past twenty minutes. What you met before minute sixteen is due back now, and due back as production.',
    ledePre: 'Deep into the run, and this one your route has not shown you. Commit to a guess anyway \u2014 it is the cheapest way to learn anything here.',
  },
  {
    id: 'before-the-close',
    hosts: ['fourteen'],
    last: true,
    lede: 'Last one before the close. This gap decides whether any of it is there next week.',
    ledePre: 'Last one before the close, and it is a guess rather than a memory. Being wrong here is what makes the answer land.',
  },
];

/** The authored moments at their first-choice beat: what this module offers
 *  before a route has been published to it, and what `plan()` degrades to. */
export const HOSTS = MOMENTS.map((m, i) => ({ beat: m.hosts[0], lede: m.lede, ledePre: m.ledePre, moment: m.id, late: i > 0 }));

export const TOTAL = HOSTS.length;

/** Two moments closer together than this are a cluster, not spacing. */
const MIN_BEAT_GAP = 2;

/**
 * Resolve the authored moments against one route's own required beats, in
 * order. `routeBeats` is the ordered list of beat ids the route walks, taken
 * from `tours:ready`'s `stepIndex` — this module never reads tours.json.
 *
 * Returns `[{ beat, lede, moment, ix, late }]`, shortest-honest: a moment with
 * no candidate on this route, or no candidate far enough from the one before
 * it, is dropped rather than pointed at a beat that will never arrive.
 */
export function plan(routeBeats) {
  const beats = Array.isArray(routeBeats) ? routeBeats.filter(Boolean) : [];
  if (!beats.length) return HOSTS.slice();
  const out = [];
  let lastIx = -Infinity;
  MOMENTS.forEach((m, mi) => {
    for (const b of m.hosts) {
      const ix = beats.indexOf(b);
      if (ix < 0) continue;
      const gap = ix - lastIx;
      const terminal = !!m.last && ix === beats.length - 1;
      if (gap < MIN_BEAT_GAP && !(terminal && gap >= 1)) continue;
      out.push({ beat: b, lede: m.lede, ledePre: m.ledePre, moment: m.id, ix, late: false });
      lastIx = ix;
      return;
    }
  });
  /* WHICH MOMENTS ARE "AFTER MINUTE 22". The last two a route resolves, on
     every route: the moments are spread across the whole run by `MIN_BEAT_GAP`
     and the last two therefore always sit in its final third — on `core` at
     minutes 25.9 and 31.6 against a 31.6-minute budget. This is the flag that
     turns DIDACTIC_SPEC §8.1 on inside `pick()`, and it is computed from the
     route rather than from a clock because the clock belongs to the student's
     reading speed and the rule belongs to the lesson's shape. */
  for (let i = Math.max(0, out.length - 2); i < out.length; i++) out[i].late = true;
  return out;
}

/**
 * The audit that would have caught `amritsar` the day it was written: every
 * candidate beat named above must exist on at least one route, and every route
 * must resolve at least one moment. `routes` is `{ routeId: [beatId, ...] }`,
 * built from the published step index by the caller.
 */
export function audit(routes) {
  const all = new Set();
  for (const b of Object.values(routes || {})) for (const x of (b || [])) all.add(x);
  const dead = [];
  for (const m of MOMENTS) for (const h of m.hosts) if (all.size && !all.has(h)) dead.push(m.id + ' \u2192 ' + h);
  const per = {};
  for (const [id, b] of Object.entries(routes || {})) per[id] = plan(b).map((h) => h.beat);
  const empty = Object.keys(per).filter((id) => !per[id].length);
  return { dead, empty, per };
}

/** Kinds a checkpoint may use. `map` needs the plate the beat is using, and
 *  `explain` costs four minutes of writing the 30-minute path has not got. */
const KINDS = new Set(['choose', 'who', 'order', 'match', 'estimate', 'year']);

/** Every T-number the guided route walks, from the chapter table above. */
const ROUTE_T = new Set(Object.values(CHAPTER_T).flat());

/**
 * Can a retrieval moment on the guided route host this item at all? Two
 * conditions, and they are the same two `pick` applies below, so the answer
 * cannot drift away from the behaviour: the kind has to be one a checkpoint
 * can render, and the T-number has to belong to a chapter the route walks.
 *
 * This is what `onPath` in bank.json now asserts, and what
 * tools/scenarios/p10-misconceptions.js checks the flag against — a flag set
 * by hand and read by nothing was how round 2's critics came to be told that
 * M15 could not be reached on the route when the real obstacle was a sort key.
 */
export function canHost(item) {
  return !!item && KINDS.has(item.kind) && ROUTE_T.has(item.t);
}

/* A misconception this student has never been made to commit on is worth more
   than a third pass at a T-number they have already produced twice. It sorts
   AFTER the band and after T-diversity, so it never displaces the thing they
   actually got wrong: it only decides between candidates that were otherwise
   tied.

   ROUND 3. That tie used to be broken, below this key, by `minutes` — the
   item's position in the lesson — and `minutes` therefore decided which of
   §4's eighteen a student was actually made to argue with. Walking the
   24-step route pressing nothing but Next produced two checkpoints on T1 and
   the SAME belief twice (M4, minute 3), while M15 at minute 19 could not win a
   tie against anything at all. `debt()` in misconceptions.js replaces the
   binary with §4's own ranking, and the sort below now uses it. */
const mUnrepaired = (item, repaired) => debt(item, repaired);

/** The belief itself, in the student's voice, for the "why this one" line. */
function firstUnrepairedBelief(item, repaired) {
  for (const m of tagsOf(item)) if (!repaired.has(m)) return belief(m);
  return null;
}

const MIN = 60 * 1000;

/** Every T-number the lesson has put in front of this student so far. */
export function taughtT(seen) {
  const out = new Set();
  for (const b of seen) {
    if (b.t) out.add(b.t);
    for (const t of CHAPTER_T[b.chapter] || []) out.add(t);
  }
  return out;
}

/**
 * HAS THIS BEEN ON SCREEN? — round 6 round 2, the classroom critic's material
 * finding: "the spaced-recall card tells the student 'you saw this a minute
 * ago' about things the route has not taught — and on a cold step link, has
 * not taught anything."
 *
 * Reproduced exactly. `taughtT()` expands a seen beat to `CHAPTER_T[chapter]`,
 * which is DIDACTIC_SPEC §8's table of what a chapter COVERS, not of what this
 * route's beats carry. On `core` the imperial chapter is entered at `egypt`,
 * which marks T12–T17 taught — so checkpoint 1, at `egypt`, asked `m15-borders`
 * (T13) one step before the T13 beat, under the line "The lesson put this in
 * front of you a minute ago", and checkpoint 2 asked `t16-bengal-1943` (T16),
 * whose beat is on NO core beat at all.
 *
 * Eligibility is left alone: guess-before-teaching is a good move and §8.1
 * asks for it five times ("prediction before reveal"). What changes is that
 * the card has to know which of the two it is doing, so it can stop claiming a
 * second encounter it never gave. A T-number has been on screen when a beat
 * this student walked CARRIED it, or when this student has already been asked
 * something on it. Nothing else counts, and a chapter is not a beat.
 */
export function onScreenT(seen, sched, items) {
  const out = askedT(seen);
  if (sched && typeof sched.record === 'function' && Array.isArray(items)) {
    for (const x of items) if (x.t && !out.has(x.t) && sched.record(x)) out.add(x.t);
  }
  return out;
}

/** The T-numbers the path asks about directly — a beat carries exactly one. */
export function askedT(seen) {
  const out = new Set();
  for (const b of seen) if (b.t) out.add(b.t);
  return out;
}

/**
 * Choose the one item this checkpoint asks. Returns `{ item, band, reason }`
 * or null when nothing is both eligible and honestly spaced.
 *
 * @param items    the resolved bank
 * @param opts.seen        [{id,t,chapter}] beats applied this session, in order
 * @param opts.sched       the Schedule
 * @param opts.ledger      P21's ledger, or null
 * @param opts.used        Set of item ids already spent on a checkpoint
 * @param opts.usedT       Set of T-numbers already spent on a checkpoint
 * @param opts.losDone     Set of LOs already retrieved this session
 * @param opts.repaired    Set of misconception ids this student has already
 *                         committed on and been corrected on
 * @param opts.now         ms
 * @param opts.minGapMs    the smallest honest gap to a previous encounter
 * @param opts.preferEarlyT Set of T-numbers the route taught in its first
 *                         half. DIDACTIC_SPEC \u00a78.1: "every T-item
 *                         introduced before minute 16 is retrieved again after
 *                         minute 22." A moment that sits after minute 22 is
 *                         the only place that rule can be kept, so on those
 *                         moments an early T outranks a late one \u2014 below the
 *                         band, so it never displaces something this student
 *                         personally got wrong.
 */
export function pick(items, opts) {
  const { seen = [], sched, ledger = null, used = new Set(), usedT = new Set(), losDone = new Set(), repaired = new Set() } = opts || {};
  const earlyT = (opts && opts.preferEarlyT) || null;
  const now = (opts && opts.now) || Date.now();
  const minGap = (opts && opts.minGapMs != null) ? opts.minGapMs : 5 * MIN;

  const taught = taughtT(seen);
  const asked = askedT(seen);
  /* `opts.onScreen` lets the caller add what only it can see — quiz/index.js
     folds in the T-numbers an ON_PATH figure's own commit produced, which no
     beat record and no schedule record carries. Absent, this computes the two
     sources it can reach by itself, so `pick` stays callable from a test. */
  const onScreen = (opts && opts.onScreen) || onScreenT(seen, sched, items);

  /* HOW THIN THIS PART OF THE TWENTY IS — round 3.
     DIDACTIC_SPEC §3: "at least 14 of the 20 must be retrieved at least once
     in the default 30-minute path". Four retrieval moments cannot cover
     fourteen T-numbers, so what a scarce moment is spent on decides which
     parts of the twenty are ever produced at all. Some T-numbers have six
     items a checkpoint can host (T18) and some have one (T16, the famine).
     Spending the moment on the one is worth more than a fourth pass at the
     six, and it breaks ties between candidates that are otherwise equal on
     everything §4 cares about — it sorts BELOW the misconception debt, so it
     never displaces a belief that is still standing. */
  const perT = new Map();
  for (const x of items) {
    if (!KINDS.has(x.kind) || !ROUTE_T.has(x.t)) continue;
    perT.set(x.t, (perT.get(x.t) || 0) + 1);
  }

  /* Which T-numbers this student got wrong when the beat itself asked. The
     ledger keeps the FIRST answer, which is the one worth chasing. */
  const wrongT = new Set();
  if (ledger && typeof ledger.all === 'function') {
    for (const e of ledger.all()) {
      if (e.verdict === 'corrected' && e.t) wrongT.add(e.t);
    }
  }

  const cands = [];
  for (const it of items) {
    if (!KINDS.has(it.kind)) continue;
    if (used.has(it.id)) continue;
    if (!taught.has(it.t)) continue;
    if (sched.answeredThisSession && sched.answeredThisSession.has(it.id)) continue;
    const r = sched.record(it);
    /* Asking again forty seconds later is re-presentation wearing a question
       mark. If the gap is not there, the item is not eligible. */
    if (r && (now - r.lastAt) < minGap) continue;

    /* Not "has the chapter covered it" — "has it been on screen". See
       `onScreenT` above; everything the card says about a second encounter
       hangs off this one boolean. */
    const pre = !onScreen.has(it.t);

    let band, reason;
    if (r && r.lastRight === false) {
      band = 0;
      reason = 'You got this wrong earlier in this session. Say it now, before you look — being corrected on something you committed to is the part that sticks.';
    } else if (wrongT.has(it.t)) {
      band = 1;
      reason = 'You answered something on this same ground the other way earlier in this session. Same ground, asked from a different side.';
    } else if (!asked.has(it.t)) {
      band = 2;
      /* ROUND 3, and it matters that this sentence is exactly true. `taught`
         is DIDACTIC_SPEC §8's chapter-to-T table; `asked` is what a beat
         actually carried. An item in band 2 is therefore one whose chapter the
         student has walked and which NO beat on their route put a question on
         — the route's own blind spots, which for T16 (famine) is the whole of
         it. The old sentence said "the lesson has taught this", which for the
         famine was not true: the lesson walked past it. */
      reason = pre
        ? 'You have not met this one yet — nothing on your route has put it on screen. Guess first anyway: committing to a wrong answer and then being corrected is what makes the right one land when the lesson reaches it.'
        : 'Nothing on your route has asked you to produce this — its chapter covers it and no beat put a question on it. Guess before you look; being wrong here is the cheapest thing in this app.';
    } else if (r) {
      band = 3;
      reason = 'Produce it again, from memory, with the gap behind it. That gap is the whole point.';
    } else {
      band = 3;
      reason = pre
        ? 'You have not met this one yet. Guess before the lesson gets there — a guess you have committed to is worth more than a paragraph you have read.'
        : 'The lesson has covered this. Answer it from what you have, not from the panel.';
    }
    /* Band 0 and band 1 are things this student personally got wrong, and
       nothing outranks those. From band 2 down, a belief they have never been
       asked to commit on gets the card, and the card says which belief. */
    const mNew = mUnrepaired(it, repaired);
    if (owesPrimary(mNew) && band >= 2) {
      const b = firstUnrepairedBelief(it, repaired);
      if (b) {
        band = 2;
        reason = 'Plenty of people your age would say: “' + b
          + '” This one goes straight at that. Commit to an answer before you look — being wrong here is the cheapest thing in this app.';
      }
    }
    cands.push({ it, band, reason, pre, latePre: (earlyT && pre) ? 1 : 0, early: earlyT ? (earlyT.has(it.t) ? 0 : 1) : 0, sameT: usedT.has(it.t) ? 1 : 0, mNew, scarce: perT.get(it.t) || 99, fresh: losDone.has(it.lo) ? 1 : 0 });
  }

  if (!cands.length) return null;

  /* FOUR MOMENTS, FOUR T-NUMBERS — A FILTER, NOT A SORT KEY.
     Round 6 round 2, the classroom critic, reproduced: a fully-answered run of
     `core` in which the student is WRONG (which is the run that matters, and
     the run this file's band 0 exists for) spent all four checkpoints on two
     T-numbers — measured here as T13, T13, T7, T7 — against the rule this
     file's own header states: "a T-number no earlier checkpoint has used comes
     first (four checkpoints on four different things beats four on two)".
     `sameT` was that rule, and it was a sort key BELOW `band`, so the moment a
     student got two things wrong on one T-number, band 0 took every remaining
     moment and diversity never got a vote.
     It is a filter now, above the band, because the scarcity is real: four
     moments against twenty must-stick items. A third pass at a T-number this
     student has already produced twice is worth less than a first pass at one
     they have produced never, however wrong they were the first time — and the
     one they got wrong is not lost, it is what the end-of-session block and
     the Ledger are for. When every eligible candidate is on a spent T-number
     the filter does nothing and the bands decide, as before. */
  const unspentT = cands.filter((c) => !c.sameT);
  const pool = unspentT.length ? unspentT : cands;

  /* §8.1 — "every T-item introduced before minute 16 is retrieved again after
     minute 22" — AND EXACTLY WHERE THAT KEY BELONGS. It is only ever passed in
     on the moments that sit after minute 22 (`plan()` marks the last two the
     route resolves), because before minute 22 the rule has nothing to say.
     Its position between `mNew` and `scarce` was found by measurement, not by
     taste, and both neighbours are load-bearing:
       · BELOW `mNew`. Above it, the fallback moment on the 24-step route
         stopped asking `m15-borders` and asked `m11-who-got-rich` instead —
         which drops M15, §4's SYMPATHETIC oversimplification and the one the
         round-3 historian named by hand, off the Next-only walk. A spacing
         rule may not cost a belief.
       · ABOVE `scarce`. Below it, measured on `core`, it never changed a
         single pick: scarcity broke every tie first and the route retrieved
         T13, T16, T14 and T10 — not one of the five T-numbers it introduces
         before minute 16. A rule that never fires is not a rule.
     Where it now sits, `core`'s last two moments ask T5 and T4, both met
     before minute 16 and both retrieved after minute 22, and the famine and
     M15 keep the moments round 3 gave them.

     `latePre` is the same rule's other half, added in round 6 round 2 and
     passed in on the same moments (it is derived from `earlyT`, which is only
     ever non-null on them). §8.1's sentence is "RETRIEVED again", and a
     first encounter cannot be a second one however useful it is: a guess
     before teaching belongs early, where the lesson still has time to answer
     it, and the two moments after minute 22 are the only place the spacing
     claim can actually be kept. So on those two, an item this student has
     genuinely had on screen outranks one they have not — below `mNew`, for
     the same reason `early` is below it: a spacing rule may not cost a belief. */
  pool.sort((a, b) =>
    (a.band - b.band)
    || (a.sameT - b.sameT)
    || (a.mNew - b.mNew)
    || (a.latePre - b.latePre)
    || (a.early - b.early)
    || (a.scarce - b.scarce)
    || (a.fresh - b.fresh)
    || ((a.it.minutes || 99) - (b.it.minutes || 99))
    || (a.it.id < b.it.id ? -1 : 1));

  const w = pool[0];
  return { item: w.it, band: w.band, reason: w.reason, pretest: w.pre };
}

export default { MOMENTS, HOSTS, TOTAL, CHAPTER_T, canHost, pick, plan, audit, taughtT, askedT, onScreenT };
