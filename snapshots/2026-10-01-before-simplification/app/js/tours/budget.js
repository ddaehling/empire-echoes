/**
 * tours/budget.js — THE COST MODEL. THE ONLY PLACE A DURATION IS COMPUTED.
 *
 * ================================ THE CONTRACT ============================
 *
 * WAVE 8, L1 and the single-sourcing charge: "Every timing number anywhere in
 * the app — student or teacher, screen or print — must be derived from
 * `_budgetMinutes`, never a hardcoded string." That was already true of the
 * student surfaces and false of the teacher's, because the arithmetic lived
 * inside a mounted module: a private method on an object that owns a DOM bar,
 * a bus subscription and a running student. Nothing outside the page could ask
 * it anything, so the printed pack retyped a number, and a retyped number goes
 * stale. It went stale.
 *
 * So the model is here, and it is pure: no DOM, no bus, no store, no `this`.
 * Feed it the three authored files and it answers. `tours/index.js` calls it to
 * paint the card; `tools/check-timing.js` calls the SAME functions, in Node, to
 * fail the build when any surface prints a minute figure this file does not
 * compute. There is one implementation and both ends of the app read it.
 *
 * THE PUBLISHED PAYLOAD — frozen; read it, never re-derive it. Every route on
 * `tours:ready` / `tours:routes` and on `window.BEA.toursRoutes` carries:
 *
 *   id            the route key, and the `#tour=<id>` a teacher's link uses
 *   label         its name in prose ("the one-period lesson")
 *   for           WHAT IT IS FOR, authored: "one lesson" / "the full unit" /
 *                 "a quick look". The phrase a teacher chooses on at 08:55.
 *   isDefault     true on exactly one route — the one a cold start runs
 *   steps         required steps (gates, disputes and recalls included)
 *   minutesExact     minutes at FAST_WPM — a fluent adult skimming
 *   minutesExactMax  minutes at SLOW_WPM — a mixed-ability class. THE PLANNING
 *                    NUMBER. `fitsPeriod` and `periods` are computed from THIS
 *                    end, never from the flattering one.
 *   minutesLow / minutesMax  the same two, rounded to five
 *   minutesSay    the range as printed ("20–30"), collapsing to one figure
 *                 when both ends round together
 *   minutes       ONE figure for every surface with room for one: the middle
 *   periods       how many 30-minute school periods it needs, at the slow rate
 *   fitsPeriod    true when it runs inside one period at the slow rate
 *   covers        §3's twenty that a BEAT on this route teaches. Coverage.
 *   recalled      §3's twenty that only a spaced recall on this route asks —
 *                 a first encounter, reported apart from `covers` and never
 *                 added into it. See `mustStick()`.
 *   mustStickMet  covers + recalled, for a surface that wants both at once
 *   drops         §3's twenty this route does not reach at all
 *   floor         §3's own floor of fourteen, so a route can admit a shortfall
 *   roomMinutes   the ROOM, not the atlas: { lesson, settle, pack, atlas,
 *                 left } — the timetabled period minus settling, packing away
 *                 and this route's own slow-rate length. `left` is the minutes
 *                 a written task has to come out of, and it may be negative.
 *   checkpoints   in-beat retrieval moments this route hosts
 *   figures       counted figures the viz module mounts inside its beats
 *   greyLines / greySeconds  Close lines this route cannot reach, and the price
 *   leaves        the whole omission sentence, computed
 *
 * NOBODY MAY RETYPE ANY OF THESE. tools/check-timing.js reads the source of
 * every student- and teacher-facing file, finds every minute figure written as
 * a literal, and fails when one disagrees with what this file computes.
 *
 * ================================ THE MODEL ===============================
 *
 * A beat costs `round(words / wpm * 60)` for its reading plus what it asks the
 * student to DO, which does not get slower when the prose gets harder. The
 * authored `cost_s` in tours.json is that sum at FAST_WPM, so the doing half is
 * recovered by subtracting the authored reading half from it. On top of that:
 *
 *   · A COUNTED FIGURE the viz module mounts inside a beat (`onPath.words`) —
 *     the words across its question AND its reveal, plus one production.
 *   · A COMPLICATION GATE, 90 seconds: read a damaging fact, place it.
 *   · AN ARGUMENT BETWEEN HISTORIANS, 150: two positions, a choice and a
 *     written sentence.
 *   · A RETRIEVAL, 45, wherever it happens — a recall step of its own, a guess
 *     committed to a figure, or a checkpoint the quiz drops inside a beat. They
 *     are the same task, so they are one constant.
 *   · THE CHAPTER ESSAYS, at 200 a minute, only on a route that opens them.
 */

/* The moments a route actually hosts, resolved by the module that schedules
   them. Never guessed: `plan()` is pure, takes the ordered beat ids and returns
   what it can space on them. */
import { plan as checkpointPlan } from '../quiz/checkpoint.js';

/** The rate tours.json's authored `cost_s` was written at: a fluent adult. */
export const FAST_WPM = 180;
/** A median sixteen-year-old on expository prose with names and dates in it.
 *  THE HONEST PLANNING RATE, and the one every fit-in-a-period test uses. */
export const SLOW_WPM = 110;
/** One production, wherever it happens. */
export const RETRIEVAL_S = 45;
/** A Complication Gate: read the damaging fact, place it on the field. */
export const GATE_S = 90;
/**
 * DIDACTIC_SPEC §3's spacing plan, and §3.2's third test: the shortest gap
 * that makes a second asking a SPACED one. A recall closer than this to the
 * beat that taught the thing is re-presentation with a question mark on it,
 * and the run gets no recall rather than a fake one.
 */
export const RECALL_GAP_S = 6 * 60;
/** An argument between historians: two positions, a choice, a written sentence. */
export const DISPUTE_S = 150;
/** DIDACTIC_SPEC §8. One school period of teaching, inside a 50-minute lesson
 *  with settling, register and packing away around it. */
export const PERIOD_MINUTES = 30;
/** DIDACTIC_SPEC §3: how many of the twenty a route is expected to carry. */
export const MUST_STICK_FLOOR = 14;

/**
 * THE ROOM, NOT THE ATLAS. Round 9's classroom critic: "the 29-minute clock
 * prices the atlas, not the room: the same pack sets seven written tasks and
 * budgets zero minutes for them… 'Leaves 1 minute in hand' is currently the
 * most misleading sentence in the pack."
 *
 * This module cannot price a written task — it does not know what the pack
 * sets, and guessing would be exactly the invention round 7 caught. What it
 * can do is stop the teacher's surfaces retyping the frame the whole
 * one-period argument rests on, which is the timetabled period MINUS what a
 * class spends not learning. Both numbers come from the brief that set this
 * wave's L1 ("a teacher has 50 minutes including settling, register and
 * packing away") and PERIOD_MINUTES is already derived from them; they are
 * stated here once so that `roomMinutes` on the payload can print the whole
 * subtraction, and so that a pack that says "leaves N in hand" is saying it
 * about a number this file computed.
 */
export const LESSON_MINUTES = 50;
export const SETTLE_MINUTES = 5;
export const PACK_MINUTES = 5;

/** A route's `gates` / `recalls` flag: true (all), false (none), or a list. */
const wants = (flag, id) => (Array.isArray(flag) ? flag.includes(id) : flag !== false);

const words = (s) => String(s || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

/**
 * The route's ordered step list. A step is a beat, a Complication Gate, an
 * argument between historians or a spaced recall; an optional beat is appended
 * past the end of the counter so every index before it keeps its meaning.
 * Pure: `tours/index.js::_flatten` is this function with its own docs.
 */
export function flatten(beats, vmeta, gatesDoc) {
  const gates = new Map(((gatesDoc && gatesDoc.gates) || []).map((g) => [g.id, g]));
  const meta = vmeta || {};
  const out = [];
  const required = (beats || []).filter((b) => !b.optional);
  /* THE ROUTE TEST AND THE SPACING TEST, DIDACTIC_SPEC §3.2, APPLIED HERE
     BECAUSE THIS IS WHERE THE STEP IS MADE.

     A spaced recall is a SECOND encounter, and its whole didactic value rests
     on one implicit claim: you have seen this before. Until wave 9 the only
     condition on scheduling one was that the route's `recalls` flag allowed
     its id — so `period` carried `t16-bengal-1943` on a route where no beat
     teaches T16, and the step said "a number this lesson has named but not
     given you" one press after the loop beat had printed it in full. Two
     surfaces, one press apart, contradicting each other about the student's
     own session.

     So a recall is only flattened into a route when both of the tests this
     file can decide are already satisfied:

       1. THE ROUTE TEST. A REQUIRED beat EARLIER in this route teaches the
          item — as its own primary payload (`beat.t`) or as the counted figure
          mounted inside it (`beat.onPath.t`). Optional beats, pins, extension
          cards and Close lines are not teaching. A recall may never be the
          first encounter with anything.
       2. THE SPACING TEST, in its planned form. At least `RECALL_GAP_S` of
          the route's own costed length must separate the end of that beat from
          the recall. The gap is measured at SLOW_WPM — the planning rate, and
          the one every fit-in-a-period test uses — so a route has ONE step
          list whatever rate it is later priced at. This is what drops
          `t14-peak`, which sat 240 seconds after the beat whose own chart had
          just revealed the peak.

     The third test — did THIS student actually walk that beat, and has six
     minutes of THEIR session elapsed — is a fact about a run and belongs to
     the runner; `tours/index.js::_recallWarrant` applies it before the card
     renders. A step this function refuses is a step nobody pays for either:
     it is not in the list, so it is not in the budget. */
  const taughtAt = new Map();
  let at = 0;
  required.forEach((b, n) => {
    out.push({ kind: 'beat', beat: b, n: n + 1 });
    at += beatCost(b, SLOW_WPM);
    if (b.t && !taughtAt.has(b.t)) taughtAt.set(b.t, at);
    if (b.onPath && b.onPath.t && !taughtAt.has(b.onPath.t)) taughtAt.set(b.onPath.t, at);
    if (b.gateAfter && gates.has(b.gateAfter) && wants(meta.gates, b.gateAfter)) {
      out.push({ kind: 'gate', gate: gates.get(b.gateAfter), n: n + 1, after: b.id });
      at += GATE_S;
    }
    if (b.disputeAfter && meta.disputes !== false) {
      out.push({ kind: 'dispute', dispute: b.disputeAfter, n: n + 1, after: b.id });
      at += DISPUTE_S;
    }
    if (b.recallAfter && wants(meta.recalls, b.recallAfter.id)) {
      const taught = taughtAt.get(b.recallAfter.t);
      if (taught != null && at - taught >= RECALL_GAP_S) {
        out.push({ kind: 'recall', recall: b.recallAfter, n: n + 1, after: b.id });
        at += RETRIEVAL_S;
      }
    }
  });
  for (const b of (beats || [])) if (b.optional) out.push({ kind: 'beat', beat: b, n: 0, optional: true });
  return out;
}

/**
 * EVERY RECALL THIS ROUTE'S AUTHORING OFFERS, AND WHETHER IT SURVIVED — so a
 * surface can say "this lesson had room for two spaced recalls and legitimate
 * ground for one" without counting anything twice, and so a checker can print
 * the refusals by name. Same two tests as `flatten`, reported rather than
 * silently applied.
 */
export function recallAudit(beats, vmeta, gatesDoc) {
  const meta = vmeta || {};
  const kept = new Set(flatten(beats, meta, gatesDoc)
    .filter((s) => s.kind === 'recall').map((s) => s.recall.id));
  const taught = new Set();
  const out = [];
  for (const b of (beats || [])) {
    if (b.optional) continue;
    const r = b.recallAfter;
    if (r && wants(meta.recalls, r.id)) {
      out.push({
        id: r.id, t: r.t, after: b.id, kept: kept.has(r.id),
        why: kept.has(r.id) ? 'ok'
          : ((b.t === r.t || (b.onPath && b.onPath.t === r.t))
            ? 'the beat it stands behind is the beat that teaches ' + r.t + ' — there is no gap to space across'
            : (!taught.has(r.t) ? 'no required beat earlier on this route teaches ' + r.t
              : 'less than ' + Math.round(RECALL_GAP_S / 60) + ' minutes after the beat that teaches ' + r.t)),
      });
    }
    if (b.t) taught.add(b.t);
    if (b.onPath && b.onPath.t) taught.add(b.onPath.t);
  }
  return { offered: out.length, kept: out.filter((x) => x.kept).length, items: out };
}

/** The beats one route walks, in route order. */
export function beatsFor(doc, variant) {
  const ids = (doc.variants && doc.variants[variant]) || (doc.variants && doc.variants.thirty) || [];
  const byId = new Map((doc.beats || []).map((b) => [b.id, b]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/** One beat's seconds: its reading at `wpm`, the doing, and whatever counted
 *  figure the viz module mounts inside it. */
export function beatCost(b, wpm) {
  const base = b.cost_s || 60;
  let s;
  if (!wpm || !b.words) s = base;
  else {
    const authored = Math.round((b.words / FAST_WPM) * 60);   /* the model's own reading half */
    const doing = Math.max(0, base - authored);
    s = Math.round((b.words / wpm) * 60) + doing;
  }
  if (b.onPath && b.onPath.words) {
    s += Math.round((b.onPath.words / (wpm || FAST_WPM)) * 60) + RETRIEVAL_S;
  }
  return s;
}

/**
 * HOW MANY IN-BEAT RETRIEVAL MOMENTS THIS RUN ACTUALLY HOSTS.
 *
 * The moments themselves are asked of the module that schedules them —
 * `quiz/checkpoint.js::plan()` resolves the authored moments against this
 * route's own ordered beats and drops the ones it cannot space. A build
 * without the quiz module answers zero, which is true.
 *
 * THEN THE FLOOR RULE, which this model was ignoring and which cost the route
 * its honesty. `quiz/index.js` says it in its own words: "A FLOOR, NOT A
 * COMPETING SCHEDULER… Each host stands down only when the lesson has ALREADY
 * produced at least as many retrievals as there are hosts up to and including
 * it: the first host wants one to have happened, the second two, the fourth
 * four." So a route that places R spaced recalls of its own has already met
 * its first R hosts, and those hosts do not fire. Planned − placed, floored at
 * zero, is that rule and nothing more.
 *
 * Measured before this was here: `lesson-one` places one recall and resolves
 * one moment, so it was PRICED for two productions and DELIVERED one — and
 * `tools/scenarios/p10-accept.js` 7a, which compares the published promise
 * with what nine presses of Next actually produce, failed on exactly that
 * gap. A route may not charge a student forty-five seconds for a question it
 * has already decided not to ask.
 *
 * This is one line of another module's arithmetic restated here, which this
 * repository is right to be nervous about. It is the smallest form the rule
 * has, it is quoted above from the file that owns it, and the acceptance test
 * that would catch it drifting is named in the paragraph before this one.
 */
export function checkpoints(steps) {
  try {
    if (typeof checkpointPlan !== 'function') return 0;
    const ids = (steps || [])
      .filter((st) => st.kind === 'beat' && !st.optional)
      .map((st) => st.beat.id);
    const got = checkpointPlan(ids);
    const planned = Array.isArray(got) ? got.length : 0;
    const placed = (steps || []).filter((st) => st.kind === 'recall' && !st.optional).length;
    return Math.max(0, planned - placed);
  } catch (_) { return 0; }
}

/** The whole run, in seconds, at one reading rate. */
export function budgetSeconds(steps, wpm, vmeta, doc) {
  let s = 0;
  for (const st of steps || []) {
    if (st.optional) continue;
    if (st.kind === 'beat') s += beatCost(st.beat, wpm);
    else if (st.kind === 'gate') s += GATE_S;
    else if (st.kind === 'dispute') s += DISPUTE_S;
    else s += RETRIEVAL_S;
  }
  s += checkpoints(steps) * RETRIEVAL_S;
  if (vmeta && vmeta.essays && doc) {
    for (const c of doc.chapters || []) s += Math.round(words(c.essay || '') / 200 * 60);
  }
  return s;
}

/** The whole run, in minutes. */
export function budgetMinutes(steps, wpm, vmeta, doc) {
  return Math.round(budgetSeconds(steps, wpm, vmeta, doc) / 60);
}

/** Rounded to five minutes — the precision an estimate about a person has. */
export function offerMinutes(m) {
  return Math.max(5, Math.round((Number.isFinite(m) ? m : 0) / 5) * 5);
}

/** The offer as a range; it collapses to one figure when both ends round the
 *  same way, which is the honest answer on a short run. */
export function offerSay(steps, vmeta, doc) {
  const lo = offerMinutes(budgetMinutes(steps, null, vmeta, doc));
  const hi = offerMinutes(budgetMinutes(steps, SLOW_WPM, vmeta, doc));
  return lo >= hi ? String(lo) : lo + '–' + hi;
}

/** ONE figure for a surface with room for one, and it is the MIDDLE of the
 *  range rather than the fast reader's end. */
export function offerMid(steps, vmeta, doc) {
  const lo = budgetMinutes(steps, null, vmeta, doc);
  const hi = budgetMinutes(steps, SLOW_WPM, vmeta, doc);
  return offerMinutes((lo + hi) / 2);
}

/**
 * WHICH LINES OF THE CLOSE THIS ROUTE CANNOT REACH, AND WHAT THEY COST.
 * Counted from `close.json`'s own `requires` against the route's own beat list,
 * priced from each missing beat's own `cost_s`. Nothing asserted.
 */
export function greyLines(doc, closeDoc, variant) {
  const on = new Set((doc.variants && doc.variants[variant]) || []);
  const byId = new Map((doc.beats || []).map((b) => [b.id, b]));
  const out = [];
  for (const l of (closeDoc && closeDoc.lines) || []) {
    const missing = (l.requires || []).filter((b) => !on.has(b));
    if (!missing.length) continue;
    out.push({
      n: l.n,
      evidence: l.evidence || '',
      beats: missing,
      cost: missing.reduce((a, b) => a + ((byId.get(b) || {}).cost_s || 60), 0),
    });
  }
  return out;
}

/**
 * DIDACTIC_SPEC §3's TWENTY, RESOLVED AGAINST ONE ROUTE — counted, never
 * asserted, AND SPLIT IN TWO, because round 9's classroom critic found the one
 * number doing the work of two: "`budget.js::mustStick()` counts a spaced recall
 * as coverage, so T3 and T16 are credited to a route that teaches neither. The
 * T3 recall's own copy admits it: 'One number this chapter never gave you.'"
 * That was true, and it inflated the default route's headline. So:
 *
 *   covers    TAUGHT. A required beat carries the item as its primary payload
 *             (`beat.t`), or the counted figure mounted inside that beat does
 *             (`beat.onPath.t` — `barbados` teaches T2 in prose and T3 in the
 *             crossing chart). This is the number a route may print as its
 *             coverage, and the one `short` is measured against §3's floor of
 *             fourteen with.
 *   recalled  MET ONCE, AND ONLY AS A GUESS-THEN-REVEAL. A spaced recall the
 *             route actually inserts asks for an item no beat on it teaches.
 *             That is a real encounter and worth having — but it is a FIRST
 *             encounter, and §3's spacing plan budgets the second one as
 *             retrieval. It is reported separately and never added into
 *             `covers`.
 *   drops     neither.
 *
 * Optional beats do not count: a student who never takes the Congo has still
 * done the whole route.
 *
 * This is the arithmetic behind the sentence a short route prints about itself.
 * Round 6 wrote "fifteen of the twenty" into a note by hand and round 7 found
 * the numbers around it superseded; this cannot go stale, because adding a beat
 * to `variants` moves it.
 */
export function mustStick(doc, variant, gatesDoc) {
  const table = (doc.mustStick && doc.mustStick.items) || [];
  /* THE FLOOR IS THE ARTEFACT'S, NOT THE FILE'S. DIDACTIC_SPEC §3.1, amended
     wave 9: the unit's floor is fourteen, Lesson One's is seven, Lesson Two's
     is eight and the full route's is all twenty. A lesson measured against the
     unit's number reports a shortfall it was never meant to carry, and a
     shortfall stated wrong is worse than none. The route states its own. */
  const floor = ((doc.variantMeta && doc.variantMeta[variant] && doc.variantMeta[variant].floor)
    || (doc.mustStick && doc.mustStick.floor) || MUST_STICK_FLOOR);
  const meta = (doc.variantMeta && doc.variantMeta[variant]) || {};
  const beats = beatsFor(doc, variant);
  const taught = new Set();
  const asked = new Set();
  for (const b of beats) {
    if (b.optional) continue;
    if (b.t) taught.add(b.t);
    if (b.onPath && b.onPath.t) taught.add(b.onPath.t);
  }
  /* WHAT A RECALL ASKS IS READ OFF THE STEPS THE ROUTE ACTUALLY HAS, not off
     the authoring. Since wave 9 `flatten()` refuses a recall whose item no
     earlier beat on the route teaches, so `recalled` — the set of items a
     route meets ONLY as a recall — is now always empty by construction, and
     that is the point: §3.1's "a recall is never coverage" used to be a rule
     about arithmetic downstream of a step that should never have existed. It
     is still computed rather than asserted, so a later authoring change that
     re-opens the hole shows up here instead of in front of a student. */
  /* THE GATES DOC IS PART OF THE ROUTE, NOT AN ORNAMENT ON IT. Wave 10:
     passing `null` here made `flatten` skip the Complication Gate, so the
     spacing test measured a route ninety seconds shorter than the one the
     student walks and refused a recall that clears §3.2 by a wide margin. Same
     defect as `leavesSay`'s, in the same file, one function apart. */
  for (const st of flatten(beats, meta, gatesDoc || null)) {
    if (st.kind === 'recall' && st.recall && st.recall.t) asked.add(st.recall.t);
  }
  const covers = table.filter((x) => taught.has(x.t));
  const recalled = table.filter((x) => !taught.has(x.t) && asked.has(x.t));
  const drops = table.filter((x) => !taught.has(x.t) && !asked.has(x.t));
  return {
    covers, recalled, drops, floor, total: table.length,
    met: covers.length + recalled.length,
    short: Math.max(0, floor - covers.length),
  };
}

/**
 * ONE TRUE LINE ABOUT THIS ROUTE'S SPACED RECALLS — DIDACTIC_SPEC §3.2.
 * "A route with fewer eligible recalls than slots runs with fewer recalls and
 * says so, once, in one true line on its own card and in its Close: 'this
 * lesson had room for two spaced recalls and legitimate ground for one.' A
 * true sentence about the lesson is worth more than a second question the
 * lesson did not earn." Empty when there is nothing to say.
 */
export function recallsSay(rec) {
  if (!rec) return '';
  const word = (n) => ['no', 'one', 'two', 'three', 'four', 'five'][n] || String(n);
  if (!rec.offered) {
    return 'It asks nothing again from earlier: a spaced recall is a SECOND meeting with something, '
      + 'and everything on this route is met here for the first time or belongs to the other lesson.';
  }
  if (rec.kept === rec.offered) return '';
  const ground = rec.kept === 0 ? 'none' : word(rec.kept);
  return 'It had room for ' + word(rec.offered) + ' spaced recall' + (rec.offered === 1 ? '' : 's')
    + ' and legitimate ground for ' + ground + ', so it runs with ' + ground + '. '
    + 'A recall may not be the first time you meet a thing.';
}

/** The route's authored sentence about what it drops, with the counted tails
 *  the Close and §3 supply. Nothing in the tails is written down anywhere. */
export function leavesSay(doc, closeDoc, variant, gatesDoc) {
  const meta = (doc.variantMeta && doc.variantMeta[variant]) || {};
  const grey = greyLines(doc, closeDoc, variant);
  const ms = mustStick(doc, variant, gatesDoc);
  const parts = [];
  const lead = meta.leavesLead || meta.leaves || '';
  if (lead) parts.push(lead);

  /* ONE HALF OF A UNIT DOES NOT HAVE A SHORTFALL — IT HAS A PARTNER.
     DIDACTIC_SPEC §8.4(5): the other lesson is named "as a subject, not as a
     deficit", and §8.5: the coverage sentence "states the unit total beside
     the lesson total, so neither number can be read as the other". So a route
     that names a pair prints a different sentence from a route that stands
     alone: what this lesson teaches, what the other one adds, what the two
     reach together against §3's floor of fourteen, and — last, and only then —
     what NEITHER lesson reaches. A lesson that listed the other lesson's
     twelve items under "it does not reach" would be telling a student who has
     done a whole lesson that they have done most of nothing. */
  const pairId = meta.pairs;
  const pairMeta = pairId && doc.variantMeta ? doc.variantMeta[pairId] : null;
  if (pairMeta && doc.variants && doc.variants[pairId] && ms.total) {
    const pairMs = mustStick(doc, pairId, gatesDoc);
    const mine = new Set(ms.covers.map((x) => x.t));
    const theirs = new Set(pairMs.covers.map((x) => x.t));
    const added = pairMs.covers.filter((x) => !mine.has(x.t));
    const unitDrops = ms.drops.filter((x) => !theirs.has(x.t));
    const unitMet = mine.size + added.length;
    const unitFloor = (doc.mustStick && doc.mustStick.floor) || MUST_STICK_FLOOR;
    parts.push(ms.covers.length + ' of the ' + ms.total + ' things this course wants you to keep are'
      + ' taught by a beat you walk in this lesson. ' + (pairMeta.label || pairId) + ' teaches '
      + added.length + ' more, and the two together reach ' + unitMet + ' of the ' + ms.total
      + ' — the course asks ' + unitFloor + ' of a unit.'
      + (unitDrops.length ? ' Neither lesson reaches: ' + unitDrops.map((x) => x.say).join('; ') + '.' : ''));
    const rs = recallsSay(recallAudit(beatsFor(doc, variant), meta, gatesDoc || null));
    if (rs) parts.push(rs);
    if (grey.length && closeDoc) {
      const pairGrey = new Set(greyLines(doc, closeDoc, pairId).map((g) => g.n));
      const both = grey.filter((g) => pairGrey.has(g.n));
      parts.push(grey.length + ' of the Close’s ' + ((closeDoc.lines || []).length)
        + ' lines need a beat this lesson does not walk — lines ' + grey.map((g) => g.n).join(', ')
        + '. ' + (pairMeta.label || pairId) + ' walks ' + (grey.length - both.length) + ' of them'
        + (both.length ? ', and ' + both.length + ' are on neither lesson and are named, with their price, at the unit Close.' : '.'));
    }
    return parts.join(' ');
  }
  /* WHAT IT DOES NOT TEACH, BY NAME. The T-numbers are DIDACTIC_SPEC §3's
     filing system and they are on the payload (`drops[].t`) for the teaching
     desk; on screen they are jargon, so the clause a student reads names the
     thing rather than its code. The count and the floor are both computed. */
  if (ms.total && ms.drops.length) {
    /* TWO NUMBERS, NOT ONE, and the difference between them is the round-9
       correction: a recall on an item no beat here teaches is a first
       encounter, not coverage. See `mustStick()`. */
    const one = ms.recalled.length === 1;
    parts.push(ms.covers.length + ' of the ' + ms.total + ' things this course wants you to keep are'
      + ' taught by a beat you walk'
      + (ms.short ? ' — the plan asks for ' + ms.floor + '.' : '.')
      + (ms.recalled.length
        ? ' ' + ms.recalled.length + (one ? ' more — ' : ' more — ') + ms.recalled.map((d) => d.say).join('; ')
          + (one ? ' — is asked once' : ' — are asked once')
          + ', as a guess and a reveal the run never returns to, so it counts as a first encounter here'
          + ' and not as coverage.'
        : '')
      + ' It does not reach: ' + ms.drops.map((d) => d.say).join('; ') + '.');
  }
  {
    const rs = recallsSay(recallAudit(beatsFor(doc, variant), meta, gatesDoc || null));
    if (rs) parts.push(rs);
  }
  if (grey.length && closeDoc) {
    const mins = Math.max(1, Math.round(grey.reduce((a, g) => a + g.cost, 0) / 60));
    parts.push(grey.length + ' of the Close’s ' + ((closeDoc.lines || []).length)
      + ' lines are then greyed — lines ' + grey.map((g) => g.n).join(', ')
      + ' — each naming its own evidence and its own price. About ' + mins
      + ' minutes of lesson, and the Close says so rather than pretending otherwise.');
  }
  return parts.join(' ');
}

/* ==================================================================== *
 * THE DOOR. DIDACTIC_SPEC §8, LESSON ONE beat 1, in bold: "The promise
 * must match the lesson. The old copy promised three misleads in one
 * sitting; a lesson that delivers two must say two."
 *
 * ROUND 2 OF WAVE 9 FOUND IT STILL LYING, on the first sentence a cold
 * student reads: `onboarding/index.js` hard-coded "Three things about this
 * map mislead. You will find all three in about N minutes" and a control
 * reading "Start the lesson · 25 minutes", while the default route is
 * Lesson One, which answers two of the three. Three surfaces already had
 * the right words — this route's own strap, Lesson Two's strap, and the
 * cover-teacher script — and the door disagreed with all of them one press
 * apart.
 *
 * So the promise is COUNTED, not written. `poster` answers what the colour
 * means, `spine` answers what projection it is, `exits` answers what year
 * exactly — the three questions the `poster` beat itself ends on — and each
 * says so on its own record as `mislead`. A route promises the ones its own
 * required beats deliver, names the rest as the other lesson's business, and
 * a beat that moves route takes its promise with it.
 * ==================================================================== */

/** Every mislead this atlas answers anywhere — the denominator, counted. */
export function misleadsAll(doc) {
  const out = [];
  for (const b of (doc && doc.beats) || []) {
    if (b.mislead && out.indexOf(b.mislead) < 0) out.push(b.mislead);
  }
  return out;
}

/** The ones a REQUIRED beat on this route answers, in route order. */
export function misleadsOn(doc, variant) {
  const out = [];
  for (const b of beatsFor(doc, variant)) {
    if (b.optional || !b.mislead) continue;
    if (out.indexOf(b.mislead) < 0) out.push(b.mislead);
  }
  return out;
}

const WORD = ['none', 'one', 'two', 'three', 'four', 'five', 'six'];
const countWord = (n) => WORD[n] || String(n);
/** "a", "a and b", "a, b and c" — the house list, never a bare comma tail. */
function andList(xs) {
  if (!xs.length) return '';
  if (xs.length === 1) return xs[0];
  return xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
}

/**
 * WHAT THE FIRST SCREEN SAYS, AND WHAT ITS ONE CONTROL IS CALLED.
 *
 * §8.5, the labelling law, applies to the door before it applies to anything
 * else: "The name is the lesson's name — 'Lesson One: how it was taken' —
 * never 'the lesson', never 'the guided path', never a bare duration," and
 * "no surface may print a duration this document invented."
 *
 * Returns `{ text, cta, note, delivers, of, leftTo }`. `text` is HTML, because
 * the band renders one strong opening clause; everything else is plain.
 */
export function doorSay(doc, variant, minutes) {
  const meta = (doc.variantMeta && doc.variantMeta[variant]) || {};
  const all = misleadsAll(doc);
  const here = misleadsOn(doc, variant);
  const rest = all.filter((m) => here.indexOf(m) < 0);
  const pairId = meta.pairs;
  const pairMeta = pairId && doc.variantMeta ? doc.variantMeta[pairId] : null;
  const pairHas = pairId ? misleadsOn(doc, pairId) : [];
  const pairTakes = rest.filter((m) => pairHas.indexOf(m) >= 0);
  /* The name without its subtitle. §8.5 wants the lesson's name on the door;
     LAYOUT_BUDGET wants the band's one control to fit a 390px phone, and the
     full label plus a note is 404px there — measured, clipped. So the name
     goes on the control and the subtitle stays on the route card, where there
     is room for it. */
  const shortName = (s2) => String(s2 || '').split(/[:—]/)[0].trim() || String(s2 || '');

  const Cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);
  let text = '<strong>A poster, not a description.</strong> '
    + Cap(countWord(all.length)) + ' things about this map mislead.';
  if (here.length && here.length === all.length) {
    text += ' You will find all ' + countWord(all.length) + ' here.';
  } else if (here.length) {
    /* "the third" is §8's own wording and it is only true while there are
       three of them and two are here; anything else counts itself. */
    const rem = (rest.length === 1 && all.length === 3 && here.length === 2)
      ? 'third' : (rest.length === 1 ? 'last one' : 'other ' + countWord(rest.length));
    text += ' You will find ' + countWord(here.length) + ' of them here';
    if (pairMeta && pairTakes.length && pairTakes.length === rest.length) {
      text += ' and the ' + rem + ' in ' + shortName(pairMeta.label || pairId) + '.';
    } else if (rest.length) {
      text += '; the ' + rem + (rest.length === 1 ? ' is' : ' are') + ' on the full route.';
    } else text += '.';
  }
  /* THE CONTROL IS NAMED, NOT DESCRIBED. "Start the lesson" is the phrase
     §8.5 bans by name; the note beside it says what the route is for and
     what it costs, together, so neither is a bare number. */
  const mins = Number.isFinite(minutes) && minutes > 0
    ? Math.max(5, Math.round(minutes / 5) * 5) : null;
  return {
    text,
    cta: 'Start ' + shortName(meta.label || variant),
    name: meta.label || variant,
    note: [meta.for || '', mins ? 'about ' + mins + ' minutes' : ''].filter(Boolean).join(' \u00b7 ') || null,
    delivers: here, of: all.length, leftTo: pairTakes.length ? (pairMeta.label || pairId) : null,
  };
}

/** Which route a cold start runs. Authored once, on the route itself, so no
 *  second file has to know the key.
 *
 *  AND EXACTLY ONE ROUTE MAY CLAIM IT. The contract at the top of this file
 *  says `isDefault` is "true on exactly one route"; nothing enforced it, and
 *  wave 9 shipped with `period` still flagged beside `lesson-one`, so the
 *  right answer came back only because of the order of the keys in a JSON
 *  file. `defaultRoutes()` reports every claimant so a checker can fail on
 *  two, and this one warns rather than throwing, because a door that opens
 *  the wrong lesson is better than a door that does not open. */
export function defaultRoutes(doc) {
  return Object.entries((doc && doc.variantMeta) || {})
    .filter(([, meta]) => meta && meta.label && meta.isDefault).map(([id]) => id);
}

export function defaultRoute(doc) {
  const claim = defaultRoutes(doc);
  if (claim.length > 1 && typeof console !== 'undefined' && console.warn) {
    console.warn('tours: ' + claim.length + ' routes claim isDefault (' + claim.join(', ')
      + '); exactly one may. Using ' + claim[0] + '.');
  }
  if (claim.length) return claim[0];
  return (doc && doc.variants && doc.variants.core) ? 'core' : 'thirty';
}

/** Every named route, with its own arithmetic. `$note` is not a route. */
export function routeIds(doc) {
  return Object.keys((doc && doc.variants) || {}).filter((id) => {
    const meta = doc.variantMeta && doc.variantMeta[id];
    /* A RETIRED ROUTE IS STILL A ROUTE THIS FUNCTION RETURNS, and that is
       deliberate. `core` and `period` were superseded by the two-lesson unit
       but they keep their keys, because a teacher's `#tour=<id>&step=N` is a
       page number and a printed pack may already carry one. Dropping them here
       ALSO dropped them from `allRoutes()`, which is what
       `tools/check-timing.js` reads — so a printed page still selling `core`
       as "the default thirty-minute run" stopped being caught, and the
       checker's own selftest said so within the minute. A route nobody may
       print a stale number about is a route this function has to keep
       pricing. What retirement changes is the OFFER, not the arithmetic:
       `routeFigures` publishes `retired`, and `tours/index.js` filters the
       line-up on it. */
    return !!(meta && meta.label);
  });
}

/** ONE ROUTE'S WHOLE PUBLISHED PAYLOAD. See THE CONTRACT above. */
export function routeFigures(doc, gatesDoc, closeDoc, variant) {
  const meta = (doc.variantMeta && doc.variantMeta[variant]) || {};
  const steps = flatten(beatsFor(doc, variant), meta, gatesDoc);
  const required = steps.filter((x) => !x.optional);
  const fast = budgetMinutes(steps, null, meta, doc);
  const slow = budgetMinutes(steps, SLOW_WPM, meta, doc);
  const grey = greyLines(doc, closeDoc, variant);
  const ms = mustStick(doc, variant, gatesDoc);
  const rec = recallAudit(beatsFor(doc, variant), meta, gatesDoc);
  const pairMeta = meta.pairs && doc.variantMeta ? doc.variantMeta[meta.pairs] : null;
  const pair = meta.pairs && doc.variants && doc.variants[meta.pairs]
    ? mustStick(doc, meta.pairs, gatesDoc).covers.map((x) => x.t) : null;
  const unit = pair
    ? Array.from(new Set(ms.covers.map((x) => x.t).concat(pair))) : null;
  return {
    id: variant,
    label: meta.label || variant,
    for: meta.for || '',
    isDefault: variant === defaultRoute(doc),
    /* SUPERSEDED, BUT STILL ADDRESSABLE AND STILL PRICED. See `routeIds`. */
    retired: !!meta.retired,
    strap: meta.strap || '',
    /* §8.5's labelling law, computed: what the first screen promises, what
       its one control is called, and which of the poster's misleads this
       route actually answers. `onboarding/index.js` prints `door` verbatim. */
    door: doorSay(doc, variant, offerMid(steps, meta, doc)),
    misleads: misleadsOn(doc, variant),
    misleadsOf: misleadsAll(doc).length,
    leaves: leavesSay(doc, closeDoc, variant, gatesDoc),
    greyLines: grey.map((g) => g.n),
    greySeconds: grey.reduce((a, g) => a + g.cost, 0),
    steps: required.length,
    beats: required.filter((x) => x.kind === 'beat').length,
    minutes: offerMid(steps, meta, doc),
    minutesLow: offerMinutes(fast),
    minutesExact: fast,
    minutesMax: offerMinutes(slow),
    minutesExactMax: slow,
    minutesSay: offerSay(steps, meta, doc),
    /* THE PLANNING FIGURES, AND THEY ARE COMPUTED FROM THE SLOW END. A route
       that fits a period only if the class reads at 180 words a minute does
       not fit a period. */
    periods: Math.max(1, Math.ceil(slow / PERIOD_MINUTES)),
    fitsPeriod: slow <= PERIOD_MINUTES,
    periodMinutes: PERIOD_MINUTES,
    /* THE ROOM'S ARITHMETIC, so no printed page has to do it. `left` is what
       is over after settling, packing away and this route's own atlas time at
       the SLOW rate — the minutes any written task has to come out of. It goes
       negative when the route does not fit, and a surface that prints it must
       print the negative rather than clamping it. */
    roomMinutes: {
      lesson: LESSON_MINUTES,
      settle: SETTLE_MINUTES,
      pack: PACK_MINUTES,
      atlas: slow,
      left: LESSON_MINUTES - SETTLE_MINUTES - PACK_MINUTES - slow,
    },
    checkpoints: checkpoints(steps),
    figures: required.filter((x) => x.kind === 'beat' && x.beat.onPath).length,
    covers: ms.covers.map((x) => x.t),
    recalled: ms.recalled.map((x) => x.t),
    mustStickMet: ms.met,
    drops: ms.drops.map((x) => ({ t: x.t, say: x.say })),
    mustStickFloor: ms.floor,
    mustStickTotal: ms.total,
    /* THE OTHER HALF OF THE UNIT, AND THE UNIT'S OWN ARITHMETIC.
       DIDACTIC_SPEC §8.5: every surface that names a route says which lesson
       it is, what it covers, and WHAT THE OTHER ONE COVERS — and §3.1 puts the
       floor of fourteen on the unit rather than on either lesson. So a lesson
       publishes the route id of its pair, the pair's own label, and the union
       of the two lessons' coverage counted once, against the unit's floor.
       Nothing here is retyped: `unitCovers` is the union of two computed sets,
       and it moves the day a beat moves. */
    /* §3.2's own sentence, computed: "A route with fewer eligible recalls than
       slots runs with fewer recalls and says so, once, in one true line on its
       own card and in its Close." Both numbers are here so no surface has to
       count them, and `recallsSay` is that line. */
    recallsOffered: rec.offered,
    recallsKept: rec.kept,
    recallsSay: recallsSay(rec),
    pairs: meta.pairs || null,
    pairLabel: pairMeta ? (pairMeta.label || meta.pairs) : '',
    pairCovers: pair ? pair.length : 0,
    unitCovers: unit ? unit.length : 0,
    unitFloor: (doc.mustStick && doc.mustStick.floor) || MUST_STICK_FLOOR,
  };
}

/** Every route, shortest first: a student choosing between them is choosing
 *  how much time they have, and that is the axis to sort on. */
export function allRoutes(doc, gatesDoc, closeDoc) {
  return routeIds(doc)
    .map((id) => routeFigures(doc, gatesDoc, closeDoc, id))
    .sort((a, b) => a.minutes - b.minutes || a.minutesExactMax - b.minutesExactMax);
}
