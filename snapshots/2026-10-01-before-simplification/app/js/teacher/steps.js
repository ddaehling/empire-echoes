/**
 * teacher/steps.js — the page number, TAKEN FROM THE GUIDED PATH'S OWN FUNCTION.
 *
 * THE CHARGE. Round two, the rubric scorer, on the classroom pack, and it is
 * the only line tagged to this piece:
 *
 *   "the printed lesson plan's segment links are state deep links
 *    (#year=…&sel=…) rather than #tour=core&step=N, because pack.js cannot
 *    compute the step index without reimplementing tours/_flatten. It says so
 *    honestly, but a cover teacher who loses the run has to restart from step 1.
 *    Publish the flattened step index on window.BEA so the plan can print the
 *    page number it wants to print."
 *
 * The honest refusal that stood in `pack.js` was right about the risk and wrong
 * about the remedy. A state link puts the MAP back; it does not put the LESSON
 * back. A teacher who loses the run at nineteen minutes wants the twelfth stop,
 * not the year 1882 with no transport, no counter and no Next.
 *
 * ================= WHY THIS FILE NO LONGER MIRRORS ANYTHING ================
 *
 * It used to. `flatten()` below was a hand-copy of `tours/index.js::_flatten`,
 * "written to be diffed against it rather than to be elegant", checked after
 * the fact against the step count the tour publishes. Wave 9 proved what that
 * costs. `budget.js::flatten` grew DIDACTIC_SPEC §3.2's two tests — a spaced
 * recall is only scheduled when a REQUIRED beat earlier on the route teaches
 * the item and at least `RECALL_GAP_S` of costed route separates them — and the
 * copy here did not. Measured on this build, before the change:
 *
 *     route         the tour runs   this file said
 *     lesson-two          9              12       (three recalls it refuses)
 *     thirty             25              26
 *     sixty              25              26
 *
 * The check did its job and refused to print, which is why nobody read a wrong
 * number. But refusing is not free: `routeSteps()` is empty for an unverified
 * route, `timing.js::routeClock` is built on `routeSteps()`, and every printed
 * surface for LESSON TWO — the whole second period of a two-lesson unit —
 * degraded together. Its plan printed no step numbers, four of its five
 * segments printed "the guided path is not running in this build, so the beat
 * answer lines could not be read", and beats the route does run were labelled
 * extension. The classroom critic: "This is the second period of a two-period
 * unit; on paper it currently does not exist."
 *
 * A copy that goes stale silently and takes a lesson's pack down with it is a
 * worse instrument than no copy. So THE COPY IS GONE. `tours/budget.js`
 * exports `flatten` as a pure function of (beats, variantMeta, gatesDoc) for
 * exactly this reason — `tours/index.js::_flatten` is one line long and returns
 * `budget.flatten(...)` — and this file now calls the same function on the same
 * two JSON files. There is one implementation of a step list in this
 * repository and both callers are on it.
 *
 * THE CHECK STAYS, and it is now a check rather than a reconciliation. The
 * tour publishes, on `tours:ready` and `tours:routes`, the required step count
 * of every route it knows; `verify()` still holds this file's list against it,
 * route by route, and a route that disagrees still prints NO step numbers and
 * prints the reason in words. What changed is that the two can now only
 * disagree if the tour is running a different `tours.json` from the one we
 * read, which is a fault worth refusing over — not because a shared function
 * grew a clause on one side of a copy.
 *
 * Two further checks, on the current route only, because the tour publishes
 * the material for them: the beat ids of the answer key must be OUR beat ids,
 * in OUR order, and each beat's own ordinal (the count of required beats up to
 * it, which is what `_answerKey` publishes as `step`) must equal ours. Order,
 * ordinal and total would all have to break together in a compensating way for
 * a wrong number to survive.
 *
 * WHAT IT PUBLISHES. `window.BEA.tourStepIndex`, because the rubric asked for
 * it there and because the Close and the first-run offer are entitled to the
 * same page numbers the plan prints. Its payload names the function it is
 * computed by (`computedBy`) and carries the check result, so a consumer that
 * finds `verified: false` prints no step numbers.
 *
 * NOTHING HERE RENDERS. No DOM, no state, no listeners on anything but the one
 * `tours:ready` payload the desk already takes.
 */

import { getJson } from '../core/util.js';
/* THE GUIDED PATH'S OWN STEP LIST, not a copy of it. `budget.js` is pure and
   is the single implementation both `tours/index.js::_flatten` and this file
   call — see the header for the three routes a hand-copy got wrong. */
import { flatten as routeFlatten, beatsFor } from '../tours/budget.js';

const TOURS = new URL('../tours/tours.json', import.meta.url).href;
const GATES = new URL('../tours/gates.json', import.meta.url).href;

/* THE ROUTE THE PRINTED PACK IS WRITTEN FOR IS NOT NAMED HERE ANY MORE.
   It used to be `export const ROUTE = 'core'`, with a comment calling core
   "the default thirty-minute run". Both halves went wrong at once: the route
   line-up is the guided path's to publish, and core's own arithmetic now
   prices it at fifty to sixty-five minutes, which is not a lesson. Which route
   a single school period runs on is decided in `timing.js`, from the published
   route payload, and every surface in this directory asks it. Nothing in this
   file knows a route's name or a route's length. */

/* ------------------------------------------------------------- the state -- */

const S = {
  loaded: false,          /* the two files arrived */
  gates: new Map(),       /* gateId -> the claim it complicates, for the printed plan */
  routes: new Map(),      /* routeId -> { steps:[…], required, byBeat:Map, ok:bool|null, why } */
  told: new Map(),        /* routeId -> the tour's own required count, as published */
  /* THE PUBLISHED ROUTE RECORDS, KEPT WHOLE AND NEVER REWRITTEN. `tours:ready`
     and `tours:routes` carry one record per route — its label, its strap, its
     step count and its own costed minutes (`minutes`, `minutesLow`,
     `minutesMax`, `minutesSay`, `minutesExact`, `minutesExactMax`,
     `checkpoints`). This directory prints no minute figure of its own, so
     these records are the only source of one. `timing.js` reads them. */
  pub: new Map(),         /* routeId -> the guided path's own published record */
  beats: new Map(),       /* beatId -> the authored beat, for the cost mirror */
  order: null,            /* the current route's beat ids, from the answer key */
  ordinals: null,         /* beatId -> the tour's own beat ordinal */
  here: null,             /* the route the tour is actually on */
};

/* ------------------------------------------------- the guided path's own -- */

/**
 * THE ROUTE'S STEP LIST, from the function the guided path itself runs.
 *
 * `tours/index.js::_flatten` is `budget.flatten(this.beats, this.vmeta,
 * this.gatesDoc)` and nothing else; this is the same call on the same two JSON
 * files, so the two cannot drift. The shape below is this directory's — `{ kind,
 * id, n, after, optional }`, ids rather than records — because that is what
 * every consumer here already reads, and it is a rename of the fields, not a
 * second computation of them.
 *
 * What `budget.flatten` decides and this file therefore inherits: which gates a
 * route hosts, whether an argument between historians is scheduled, and — the
 * clause the hand-copy that stood here did not have — DIDACTIC_SPEC §3.2's two
 * tests on a spaced recall. A recall the guided path refuses is not a step
 * here either, which is the whole point.
 */
function flatten(doc, gatesDoc, variant) {
  const meta = (doc.variantMeta && doc.variantMeta[variant]) || null;
  if (!meta) return null;
  const ids = (doc.variants && doc.variants[variant]) || null;
  if (!Array.isArray(ids)) return null;

  return routeFlatten(beatsFor(doc, variant), meta, gatesDoc || { gates: [] })
    .map((st) => (st.kind === 'beat'
      ? { kind: 'beat', id: st.beat.id, n: st.optional ? 0 : st.n, optional: !!st.optional }
      : {
        kind: st.kind,
        id: (st.gate && st.gate.id) || (st.recall && st.recall.id)
          || (st.dispute && (st.dispute.id || '')) || '',
        after: st.after,
      }));
}

/* ------------------------------------------------------------- the load -- */

let loading = null;

/** Read the two files once. Safe to call repeatedly; safe to never call. */
export function loadSteps() {
  if (loading) return loading;
  loading = (async () => {
    const [doc, gatesDoc] = await Promise.all([getJson(TOURS, null), getJson(GATES, null)]);
    if (!doc || !Array.isArray(doc.beats)) return false;
    for (const g of ((gatesDoc && gatesDoc.gates) || [])) if (g && g.id) S.gates.set(g.id, g.claim || '');
    for (const b of doc.beats) if (b && b.id) S.beats.set(b.id, b);
    for (const id of Object.keys(doc.variants || {})) {
      const steps = flatten(doc, gatesDoc || { gates: [] }, id);
      if (!steps) continue;
      const byBeat = new Map();
      steps.forEach((st, i) => { if (st.kind === 'beat') byBeat.set(st.id, i + 1); });
      S.routes.set(id, {
        steps, byBeat,
        required: steps.filter((st) => !st.optional).length,
        ok: null, why: 'the guided path has not announced itself yet, so this count is unchecked',
      });
    }
    S.loaded = S.routes.size > 0;
    verify();
    publish();
    return S.loaded;
  })();
  return loading;
}

/* ------------------------------------------------------------ the check -- */

/**
 * WHAT THE TOUR TELLS US, taken from the payload the desk already subscribes
 * to. `tours:ready` carries `{ variant, steps, answerKey, routes[] }` and
 * `tours:routes` carries `{ here, routes[] }`; each route in `routes[]` carries
 * its own `steps`, which is `_flatten(...).filter(not optional).length` — the
 * exact number this file computes for itself.
 */
export function setRouteFacts(p) {
  if (!p || typeof p !== 'object') return;
  if (typeof p.variant === 'string') S.here = p.variant;
  if (typeof p.here === 'string') S.here = p.here;
  if (Number.isFinite(p.steps) && S.here) S.told.set(S.here, p.steps);
  /* EVERY ROUTE THE TOUR KNOWS, NOT ONLY THE ONES IT OFFERS. `routes[]` is the
     LINE-UP — `tours/index.js` filters a retired route out of it on purpose, so
     that a door with six doors on it is not offered — and until wave 9 that was
     the only place a step count came from. The effect was that `core` and
     `period`, both superseded, announced nothing and stayed permanently
     unverified here; a beat this lesson demotes then had no route to send the
     teacher to, because the route that does carry it printed no page numbers.
     `stepIndex` is the same module's own flattened index of EVERY named route
     (`_stepIndex`, frozen contract) and is on both payloads, so the count is
     taken from there and the line-up is left to mean what it means. */
  const sx = p.stepIndex && p.stepIndex.routes;
  if (sx) {
    for (const id of Object.keys(sx)) {
      const r = sx[id];
      if (r && Array.isArray(r.steps)) S.told.set(id, r.steps.filter((st) => !st.optional).length);
    }
  }
  if (Array.isArray(p.routes)) {
    for (const r of p.routes) {
      if (!r || !r.id) continue;
      if (Number.isFinite(r.steps)) S.told.set(r.id, r.steps);
      S.pub.set(r.id, r);
    }
  }
  if (Array.isArray(p.answerKey)) {
    S.order = p.answerKey.filter((r) => r && r.beatId).map((r) => r.beatId);
    S.ordinals = new Map(p.answerKey.filter((r) => r && r.beatId).map((r) => [r.beatId, r.step]));
  }
  verify();
  publish();
}

function verify() {
  for (const [id, r] of S.routes) {
    const told = S.told.get(id);
    if (!Number.isFinite(told)) {
      r.ok = null;
      r.why = 'the guided path did not announce a step count for this route';
      continue;
    }
    if (told !== r.required) {
      r.ok = false;
      r.why = 'this sheet counts ' + r.required + ' steps on “' + id + '” and the guided path counts '
        + told + ', so the step numbers are not printed';
      continue;
    }
    /* The current route gets the two extra checks. */
    if (id === S.here && S.order && S.order.length) {
      const mine = r.steps.filter((st) => st.kind === 'beat').map((st) => st.id);
      const same = mine.length === S.order.length && mine.every((x, i) => x === S.order[i]);
      if (!same) {
        r.ok = false;
        r.why = 'the beats of “' + id + '” are not in the order the guided path announced';
        continue;
      }
      if (S.ordinals) {
        let bad = null;
        for (const st of r.steps) {
          if (st.kind !== 'beat' || st.optional) continue;
          const told2 = S.ordinals.get(st.id);
          if (Number.isFinite(told2) && told2 !== st.n) { bad = st.id; break; }
        }
        if (bad) {
          r.ok = false;
          r.why = 'the beat ordinal for “' + bad + '” does not match the guided path’s own';
          continue;
        }
      }
    }
    r.ok = true;
    r.why = 'checked against the guided path’s own count of ' + told + ' steps on this route';
  }
}

/* ----------------------------------------------------------- the answers -- */

/**
 * WHAT STANDS BETWEEN THIS BEAT AND THE NEXT ONE, and it is not nothing.
 *
 * `_flatten` inserts a Complication Gate, an argument between historians or a
 * spaced recall immediately after the beat it belongs to, and at a gate the
 * tour DISABLES Next until the reader has placed the card. A cover teacher
 * reading a printed plan that jumps from step 3 to step 5 needs to be told what
 * step 4 is, because it is the one place in the run where pressing Next does
 * not work and a room of twenty-eight will say so out loud.
 *
 * Returns [] when the route is unverified, so a sheet prints nothing rather
 * than guessing at a stop.
 */
export function afterBeat(beatId, route) {
  const r = S.routes.get(route);
  if (!r || r.ok !== true) return [];
  const i = r.steps.findIndex((st) => st.kind === 'beat' && st.id === beatId);
  if (i < 0) return [];
  const out = [];
  for (let j = i + 1; j < r.steps.length; j++) {
    const st = r.steps[j];
    if (st.kind === 'beat') break;
    /* A RECALL STOP CARRIES ITS OWN AUTHORED COPY OUT WITH IT.
       Round nine, the classroom critic: the printed plan called both recall
       stops "a retrieval question about something met earlier in this lesson"
       while step 5's own on-screen copy says "One number this chapter never
       gave you", and gave neither stop the SAY / ASK / If-they-say block every
       beat segment has. `tours.json` authors that copy on the parent beat as
       `recallAfter` — `mark`, `say`, `t`, `year`, `sel` — beside the beat it
       belongs to, exactly as it authors the beat answer lines. So it is handed
       out here rather than re-typed on a sheet. */
    const parent = S.beats.get(beatId);
    out.push({
      n: j + 1, kind: st.kind, id: st.id,
      claim: st.kind === 'gate' ? (S.gates.get(st.id) || '') : '',
      rec: st.kind === 'recall' && parent && parent.recallAfter
        && parent.recallAfter.id === st.id ? parent.recallAfter : null,
    });
  }
  return out;
}

/** 1-based step index of a beat on a route, or null if it is not verified. */
export function stepOf(beatId, route) {
  const r = S.routes.get(route);
  if (!r || r.ok !== true) return null;
  const n = r.byBeat.get(beatId);
  return Number.isFinite(n) ? n : null;
}

/** `#tour=core&step=7`, or null. */
export function stepLink(beatId, route) {
  const n = stepOf(beatId, route);
  return n ? '#tour=' + route + '&step=' + n : null;
}

/**
 * DOES THIS ROUTE RUN THIS BEAT? true / false / null-for-unknown.
 *
 * `stepOf` cannot answer this: it returns null both for "the route omits this
 * beat" and for "the index is not checked yet", and a caller that treats those
 * the same will re-route a lesson card on the strength of a file that has not
 * finished loading. The three states are kept apart here because `path.js`
 * decides where a transferable move fires on the answer, and the only safe
 * behaviour on `null` is to change nothing.
 */
export function carries(beatId, route) {
  const r = S.routes.get(route);
  if (!r || r.ok !== true) return null;
  return r.byBeat.has(beatId);
}

/** How many steps the route has, once checked. */
export function stepCount(route) {
  const r = S.routes.get(route);
  return r && r.ok === true ? r.required : null;
}

/**
 * The state of the check, in words a printed sheet can carry. `ok` false or
 * null both mean: print the state link and this sentence instead of a number.
 */
export function stepCheck(route) {
  const r = S.routes.get(route);
  if (!r) {
    return { ok: false, why: S.loaded
      ? 'the guided path does not carry a route called “' + route + '” in this build'
      : 'the guided path’s own step list could not be read in this build' };
  }
  return { ok: r.ok === true, why: r.why, required: r.required, told: S.told.get(route) ?? null };
}

/**
 * WHICH ROUTE THE APP IS ACTUALLY ON. The tour announces its variant on
 * `tours:ready`, but `_pickRoute()` — the control that switches a reader from
 * one route to another — does not re-announce it; it
 * dispatches `startTour` and the store is the only thing that then knows.
 * Measured: after `#tour=thirty` the store read `activeTour: 'thirty'` and this
 * function still said `core`. So the store is pushed in from the module, and
 * the announced variant is only the fallback.
 */
export function setActiveRoute(id) {
  if (typeof id === 'string' && id && S.here !== id) { S.here = id; verify(); publish(); }
}

export function currentRoute() { return S.here; }

/* --------------------------------------------------------- the publisher -- */

/**
 * `window.BEA.tourStepIndex`. The rubric asked for the index to be published
 * there; this piece cannot write in `tours/`, so it publishes a mirror that
 * labels itself as one and carries its own audit. A consumer that finds a
 * `verified: false` payload should print no step numbers.
 */
function publish() {
  try {
    if (typeof window === 'undefined') return;
    const out = { computedBy: 'tours/budget.js::flatten', route: S.here, routes: {} };
    let all = S.routes.size > 0;
    for (const [id, r] of S.routes) {
      if (r.ok !== true) all = false;
      out.routes[id] = {
        verified: r.ok === true,
        why: r.why,
        required: r.required,
        steps: r.steps.map((st) => ({ kind: st.kind, id: st.id, optional: !!st.optional })),
        beats: Object.fromEntries(r.byBeat),
      };
    }
    out.verified = all;
    (window.BEA || (window.BEA = {})).tourStepIndex = out;
  } catch (_) { /* no handle, no matter */ }
}

/* ------------------------------------------------- what `timing.js` reads -- */

/** Every published route record, newest payload wins, keyed by route id. */
export function publishedRoutes() { return new Map(S.pub); }

/** One published route record — the only place a minute figure comes from. */
export function publishedRoute(id) { return S.pub.get(id) || null; }

/**
 * The flattened, CHECKED step list of a route: `{ kind, id, n, after, optional }`
 * in run order. Empty until the mirror has been checked against the guided
 * path's own count for that route, because a clock built on an unchecked step
 * list is a clock nobody may print.
 */
export function routeSteps(route) {
  const r = S.routes.get(route);
  return r && r.ok === true ? r.steps : [];
}

/**
 * THE BEATS A ROUTE RUNS — WHICH IS NOT A PAGE NUMBER, AND IS NOT GATED ON THE
 * COUNT CHECK.
 *
 * `routeSteps()` above is empty until the mirror's step COUNT has been checked
 * against the guided path's own, and rightly: a step index is a claim about
 * where the counter will read mid-lesson, and printing an unchecked one sends a
 * teacher to the wrong stop. A BEAT LIST is a different kind of fact. It is
 * `doc.variants[route]` — a list in the same file the guided path reads — and
 * nothing about a disagreement over how many gates or recalls hang off those
 * beats makes the list of beats wrong.
 *
 * The two-lesson binding (`timing.js::unitLessons`) needs the second and not the
 * first: it asks which published route carries Lesson One's beats, and the
 * answer does not change while the counter is in dispute. Gating it on the
 * count check made every teacher surface say "no route in this build" for the
 * whole of a wave in which the tours module was mid-way through re-cutting its
 * line-up — measured, on this build, with `period` publishing nine steps against
 * a mirror of ten.
 *
 * Nothing here may be printed as a step number. `carries()` and `stepOf()` stay
 * gated, and they are the only two functions a page number comes from.
 */
export function routeBeats(route) {
  const r = S.routes.get(route);
  if (!r) return [];
  return r.steps.filter((st) => st.kind === 'beat' && !st.optional).map((st) => st.id);
}

/** The authored beat record, for the cost mirror in `timing.js`. */
export function beatRecord(id) { return S.beats.get(id) || null; }

/** Every route this build carries a checked step list for. */
export function knownRoutes() { return [...S.routes.keys()]; }

export default { loadSteps, setRouteFacts, stepOf, stepLink, stepCount, stepCheck, currentRoute, carries, setActiveRoute, afterBeat, publishedRoutes, publishedRoute, routeSteps, routeBeats, beatRecord, knownRoutes };
