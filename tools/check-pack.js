#!/usr/bin/env node
/**
 * check-pack.js — DOES THE PRINTED PACK AGREE WITH THE PROJECTOR?
 *
 * ================================ WHY THIS EXISTS =========================
 *
 * Wave 9's critics found two of these, and they are the same defect twice:
 *
 *   · the board sheet asked the class to check a fact the route never taught —
 *     "About a thousand British officers of the Indian Civil Service governed
 *     300 million people", whose only evidence is on the `princely` beat, which
 *     the lesson's route does not run;
 *   · a printed step 1 asked a population-share question the app's step 1 never
 *     asks — the beat asks how many KINDS of rule are painted on the poster.
 *
 * A teacher cannot run a page that disagrees with the projector. Both were
 * repaired in the renderers, and a repair in a renderer lasts until the next
 * person edits the data. So this is the gate: it cross-references every printed
 * prompt, task, board line and answer against THE BEATS ACTUALLY ON THE ROUTE
 * THE PACK IS FOR, and fails on any reference to an off-route beat — the way
 * check-gloss.js does for the record and check-timing.js does for the clock.
 *
 * ============================= WHAT IT ACTUALLY DOES ======================
 *
 * Nothing here re-implements a route and nothing here re-states a lesson. It
 * loads two modules and asks them:
 *
 *   app/js/tours/budget.js   the cost model — the only place a duration or a
 *                            route's beat list is computed. It answers which
 *                            routes exist, which of them end inside a period,
 *                            and which beats each one actually runs.
 *   app/js/teacher/unit.js   the pack's authored content, and the field on
 *                            every piece of it saying WHICH LESSON prints it
 *                            and WHICH BEAT puts its evidence on screen. It has
 *                            no imports precisely so that this file can read it.
 *
 * Then `unit.js::bindLessons()` matches each lesson to a published route by its
 * beats — no route id is typed here or there — and `unit.js::auditUnit()`
 * applies the six rules documented beside it:
 *
 *   A  pack/off-route            a piece printed in Lesson N whose beat that
 *                                lesson's route does not run.          ERROR
 *   B  pack/marked-off-but-taught  a piece marked "extension" that the lesson
 *                                actually teaches.                     ERROR
 *   C  pack/extension-is-taught  a piece filed under no lesson that a lesson
 *                                route teaches.                        ERROR
 *   D  pack/unknown-beat         a beat id tours.json does not have. ERROR
 *   E  pack/ask-not-the-beats    a plan row printing its own question beside a
 *                                beat that puts a question on screen.  ERROR
 *   F  pack/unscripted-beat      a beat on the lesson's route that no segment
 *                                of that lesson's plan names.          ERROR
 *   G  pack/demotion-out-of-order  the route dropped an item further down
 *                                §8's published demotion order while still
 *                                running one §8 puts ahead of it.      ERROR
 *   H  pack/segment-has-no-task  a segment the plan tells the class to write
 *                                at, with no task on any tier.         ERROR
 *
 * plus notes that are about the ROUTE or the SHAPE rather than a page that
 * lies, and are therefore warnings: a lesson the guided path publishes no route
 * for; a beat §8 assigns to a lesson whose route does not run it AND names no
 * demotion for; and — `pack/beat-demoted` — a beat the route dropped in §8's
 * own published order, which is the route OBEYING the spec.
 *
 * THAT LAST ONE IS WHY §8'S DEMOTION ORDER IS NOW IN `unit.js`. Round two, the
 * rubric scorer and the historian both: this file used to explain every
 * demoted beat with "The pack is right and the route is behind the amended
 * §8", and §8 makes T12 the first item on Lesson Two's demotion order — the
 * route demoted it exactly as published. A warning that calls a correct route
 * "behind" sends the next builder to un-demote it and overrun the period.
 *
 * `--selftest` replays the charged regressions from a cold start — it rebuilds
 * each defective piece of content, or each defective ROUTE BINDING, as it stood
 * and fails if the rule that should catch it does not — and checks that the
 * real content passes, so this cannot go quietly vacuous the way the pages it
 * guards did.
 *
 * ================================== THE RULE ==============================
 * DO NOT PRINT A PROMPT, A TASK OR AN ANSWER THAT NAMES A BEAT ITS OWN LESSON
 * DOES NOT RUN. If the material is worth having, put it on the lesson whose
 * route runs it, or mark it `off: true` and let it print under the extension
 * label — which says to the class, in words, that this one is not on the screen.
 *
 * Usage:
 *   node tools/check-pack.js              human report
 *   node tools/check-pack.js --json       machine-readable, for validate-data
 *   node tools/check-pack.js --selftest   replay the two charged regressions
 *   node tools/check-pack.js --ok         also list what it checked and passed
 *
 * Exit codes: 0 clean, 1 findings, 2 could not run.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP_JS = path.join(ROOT, 'app', 'js');
const BUDGET = path.join(APP_JS, 'tours', 'budget.js');
const UNIT = path.join(APP_JS, 'teacher', 'unit.js');

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const showOk = argv.includes('--ok');
const selftest = argv.includes('--selftest');

/* budget.js imports two more modules, so its graph is inlined as nested data
   URLs — the same trick check-gloss.js uses on vocab.js and check-timing.js
   uses on this same file. unit.js has NO imports, on purpose: nesting the
   teacher module's real graph blows past what Node will parse, which is why
   the authored content lives in a file with nothing to inline. */
function inline(file, seen) {
  const abs = path.resolve(file);
  if (seen.has(abs)) return seen.get(abs);
  const src = fs.readFileSync(abs, 'utf8');
  const dir = path.dirname(abs);
  const out = src.replace(/(\bfrom\s*)(['"])(\.\.?\/[^'"]+)\2/g, (m, kw, q, spec) =>
    kw + q + inline(path.join(dir, spec), seen) + q);
  const url = 'data:text/javascript;base64,' + Buffer.from(out).toString('base64');
  seen.set(abs, url);
  return url;
}

/** THE ROUTES, NORMALISED — the one shape `bindLessons()` reads. The browser
 *  builds the same shape from `tours:routes` plus the checked step index. */
function routesOf(budget, doc, gatesDoc, closeDoc) {
  return budget.allRoutes(doc, gatesDoc, closeDoc).map((r) => ({
    id: r.id,
    label: r.label,
    for: r.for,
    fitsPeriod: r.fitsPeriod,
    minutesExactMax: r.minutesExactMax,
    covers: r.covers,
    /* THE BEATS A ROUTE ACTUALLY RUNS, required only. An optional beat is
       appended past the end of every route's counter, so it is never a beat a
       lesson omits and never one it teaches. */
    beats: budget.beatsFor(doc, r.id).filter((b) => !b.optional).map((b) => b.id),
  }));
}

function report(find, bound, routes, unit, selfCaught) {
  const errs = find.filter((f) => f.severity === 'error');
  const warns = find.filter((f) => f.severity === 'warn');
  const p = unit.pieces();
  if (asJson) {
    process.stdout.write(JSON.stringify({
      tool: 'check-pack', errors: errs.length, warnings: warns.length, findings: find,
      lessons: bound.map((b) => ({
        lesson: b.lesson.n, name: b.lesson.name, title: b.lesson.title,
        route: b.route, label: b.label, beats: b.beats.length, why: b.why,
      })),
      stats: {
        pieces: p.length,
        board: p.filter((x) => x.kind === 'board').length,
        plan: p.filter((x) => x.kind === 'plan').length,
        segmentBeats: p.filter((x) => x.kind === 'segment').length,
        tasks: p.filter((x) => x.kind === 'task').length,
        routes: routes.length,
        bound: bound.filter((b) => b.route).length,
        selftest: selfCaught || null,
      },
    }, null, 2) + '\n');
  } else {
    const out = [];
    out.push('check-pack — the printed pack against the beats its lesson actually runs');
    out.push('');
    for (const b of bound) {
      out.push('  ' + b.lesson.name + ' — ' + b.lesson.title);
      out.push('    route: ' + (b.route ? b.route + ' (“' + b.label + '”), ' + b.beats.length + ' beats' : 'none in this build'));
      out.push('    ' + b.why + '.');
    }
    out.push('');
    out.push('  routes published: ' + routes.map((r) => r.id + (r.fitsPeriod ? '*' : '')).join(', ')
      + '   (* ends inside a period at the slow reading rate)');
    out.push('');
    if (!find.length) out.push('  no findings.');
    for (const f of find) {
      out.push('  ' + (f.severity === 'error' ? 'ERROR' : 'warn ') + '  ' + f.code);
      out.push('         ' + f.where);
      out.push('         ' + f.message);
      if (f.hint) out.push('         → ' + f.hint);
    }
    out.push('');
    out.push('  ' + errs.length + ' error' + (errs.length === 1 ? '' : 's') + ', '
      + warns.length + ' warning' + (warns.length === 1 ? '' : 's') + '.');
    process.stdout.write(out.join('\n') + '\n');
  }
  return errs.length ? 1 : 0;
}

/* ------------------------------------------------------------- the selftest -- *
 *
 * THE CHARGED CASES, REBUILT FROM A COLD START. Each one is the piece of
 * content as it actually stood when a critic found it, handed to the same rule
 * engine the real content goes through. A checker that cannot catch the defect
 * it was written for is worse than no checker, because it is believed.
 *
 * A case is `{ name, code, was, pieces, bound }`. `pieces` replaces the piece
 * of authored content under test; `bound(b)` rewrites the route binding, for
 * the rules that are about the ROUTE rather than about a sheet. Everything the
 * rules read is one of those two, which is why every rule here is replayable
 * and none of them can go quietly vacuous.
 */
function cases() {
  return [
    {
      name: 'the board sheet asked the class to check a fact the route never taught',
      code: 'pack/off-route',
      was: 'BOARD.hold[2] — “About a thousand British officers of the Indian Civil Service '
        + 'governed 300 million people” — printed as a held finding for the one lesson this '
        + 'build ran, while its only evidence is on the `princely` beat, which that route omits.',
      pieces: [{
        kind: 'board', where: 'Lesson One · board line 3 (“It was run by the people it ruled.”)',
        lesson: 1, beat: 'princely',
      }],
    },
    {
      name: 'a printed step 1 asked a population-share question the app’s step 1 never asks',
      code: 'pack/ask-not-the-beats',
      was: 'LESSON[0] carried `ask: “Roughly what share of the world’s people did Britain rule '
        + 'at this moment?”` on the `poster` beat, whose own on-screen question asks how many '
        + 'KINDS of British rule the poster paints.',
      pieces: [{
        kind: 'plan', where: 'Lesson 1 · plan row “Commit to a wrong answer first”',
        lesson: 1, beat: 'poster',
        typedAsk: 'Roughly what share of the world’s people did Britain rule at this moment?',
      }],
    },
    {
      name: 'a route that took DIDACTIC_SPEC §8’s demotions out of §8’s own order',
      code: 'pack/demotion-out-of-order',
      was: '§8 says of Lesson Two “close it in this order, and stop as soon as it closes”, and '
        + 'names T12 first and T15 last. A route that drops `two-track` while still running '
        + '`egypt` has taken a cut §8 did not publish, and every printed page that explains the '
        + 'loss by quoting §8 is explaining something that did not happen.',
      /* The wave-9 route demoted `egypt` and kept `two-track`, which is §8's
         order. This flips them and nothing else. */
      bound: (b) => b.map((x) => (x.lesson.n !== 2 || !x.route ? x : {
        ...x,
        beats: x.beats.filter((id) => id !== 'two-track').concat(
          x.beats.includes('egypt') ? [] : ['egypt']),
      })),
    },
    {
      name: 'a segment the plan tells the class to write at, with no task on any sheet',
      code: 'pack/segment-has-no-task',
      was: 'The plan prints “They write. Task N on the task sheet” under every segment. A segment '
        + 'no tier sets a task on sends a room of twenty-eight looking for a number that is not '
        + 'on the paper in front of them.',
      /* One synthetic segment with no task of its own, on a beat its lesson
         does run, so no other rule fires on it. */
      pieces: [{
        kind: 'segment', where: 'segment sX “A segment with nothing to write” · beat poster',
        lesson: 1, segLesson: 1, beat: 'poster', seg: 'sX', title: 'A segment with nothing to write',
      }],
    },
  ];
}

/** The selftest's own tally, for the line validate-data prints. */
/** One case, run against the same rule engine the real content goes through.
 *  The synthetic run needs the real segments, or rule F fires on every beat of
 *  the lesson and drowns the case under test; only the piece under test — or
 *  the binding under test — is replaced. */
function runCase(unit, bound, beatsById, c) {
  const scaffold = unit.pieces().filter((p) => p.kind === 'segment');
  const b = c.bound ? c.bound(bound) : bound;
  const pieces = c.pieces ? scaffold.concat(c.pieces) : undefined;
  const got = unit.auditUnit(b, beatsById, pieces);
  return got.find((f) => f.code === c.code && f.severity === 'error') || null;
}

function selfStats(unit, bound, beatsById) {
  const list = cases();
  let caught = 0;
  for (const c of list) if (runCase(unit, bound, beatsById, c)) caught++;
  return { replayed: list.length, caught };
}

function replay(unit, bound, beatsById) {
  const lines = [];
  let bad = 0;
  for (const c of cases()) {
    const hit = runCase(unit, bound, beatsById, c);
    lines.push((hit ? 'CAUGHT  ' : 'MISSED  ') + c.code + '   ' + c.name);
    lines.push('        was: ' + c.was);
    if (hit) lines.push('        now: ' + hit.message);
    else bad++;
  }

  /* AND THE CONTROL. The content as it actually stands must pass, or the
     checker is not a checker, it is a wall. */
  const live = unit.auditUnit(bound, beatsById);
  const liveErrs = live.filter((f) => f.severity === 'error');
  lines.push((liveErrs.length ? 'MISSED  ' : 'CAUGHT  ') + 'control              '
    + 'the pack as it stands raises no error');
  if (liveErrs.length) {
    bad++;
    for (const f of liveErrs) lines.push('        still failing: ' + f.code + ' — ' + f.where);
  }

  const n = cases().length + 1;
  process.stdout.write('check-pack --selftest\n\n  ' + lines.join('\n  ') + '\n\n  '
    + (bad ? bad + ' of ' + n + ' NOT caught — this checker does not work\n'
      : n + '/' + n + ' caught, no false positives\n'));
  return bad ? 1 : 0;
}

async function main() {
  let budget, unit;
  try {
    budget = await import(inline(BUDGET, new Map()));
  } catch (e) {
    process.stderr.write('check-pack: could not load the cost model — ' + (e && e.message) + '\n');
    process.exit(2);
  }
  try {
    unit = await import('data:text/javascript;base64,'
      + Buffer.from(fs.readFileSync(UNIT, 'utf8')).toString('base64'));
  } catch (e) {
    process.stderr.write('check-pack: could not load the pack’s content — ' + (e && e.message) + '\n');
    process.exit(2);
  }

  const doc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'tours', 'tours.json'), 'utf8'));
  const gatesDoc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'tours', 'gates.json'), 'utf8'));
  const closeDoc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'close', 'close.json'), 'utf8'));
  const beatsById = new Map((doc.beats || []).map((b) => [b.id, b]));
  const routes = routesOf(budget, doc, gatesDoc, closeDoc);
  const bound = unit.bindLessons(routes);

  if (selftest) process.exit(replay(unit, bound, beatsById));

  const find = unit.auditUnit(bound, beatsById);

  if (showOk && !asJson) {
    const p = unit.pieces();
    process.stdout.write('  checked ' + p.length + ' pieces of authored pack content — '
      + p.filter((x) => x.kind === 'board').length + ' board lines, '
      + p.filter((x) => x.kind === 'plan').length + ' plan rows, '
      + p.filter((x) => x.kind === 'segment').length + ' segment beats, '
      + p.filter((x) => x.kind === 'task').length + ' tasks — against '
      + routes.length + ' published routes.\n\n');
  }
  process.exit(report(find, bound, routes, unit, selfStats(unit, bound, beatsById)));
}

main().catch((e) => {
  process.stderr.write('check-pack: ' + (e && e.stack || e) + '\n');
  process.exit(2);
});
