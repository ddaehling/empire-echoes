#!/usr/bin/env node
/**
 * check-recall.js — IS EVERY SPACED RECALL A *SECOND* MEETING?
 *
 * ================================ WHY THIS EXISTS =========================
 * DIDACTIC_SPEC §3.2 is normative and ends with a sentence that names this
 * file: "Failure is student-visible. A recall that renders without passing all
 * three tests is a defect of the same class as an unsourced number: it renders
 * `[unearned recall]` in `--danger` in front of a sixteen-year-old, and CI
 * fails the build. The check belongs beside `tools/check-timing.js` and takes
 * the same `--selftest`." §9.4 lists it under the wave-9 amendment's downstream
 * artefacts. Until now it did not exist, and its absence is why two live
 * defects walked past four checkers:
 *
 *   1. THE DEFAULT ROUTE'S CARD STATED THE OPPOSITE OF WHAT THE ROUTE RUNS.
 *      `budget.js::leavesSay` prices the route's recalls with
 *      `recallAudit(beatsFor(doc, variant), meta, null)` — the third argument
 *      is the GATES doc, and with it null `flatten` never lays the gate step
 *      down, so it never accrues `GATE_S` and the six-minute spacing gap comes
 *      out about ninety seconds short. Lesson One's card therefore printed
 *      "It had room for one spaced recall and legitimate ground for none, so
 *      it runs with none" while the route runs one, at step 7 of 9, chipped
 *      RECALL. The full route's payload says "ground for three" and its
 *      rendered card says "ground for two", from the same line.
 *   2. A ROUTE CARRIED A RECALL FOR AN ITEM NO BEAT ON IT TEACHES, and told
 *      the student it was "a number this lesson has named".
 *
 * Both are the same shape and it is this project's oldest shape: TWO SURFACES,
 * ONE PRESS APART, CONTRADICTING EACH OTHER ABOUT THE STUDENT'S OWN SESSION.
 * `check-timing.js` catches it for minutes. This catches it for retrieval.
 *
 * ============================= WHAT IT ACTUALLY DOES ======================
 * Nothing here re-implements the cost model or the step model. It imports
 * `app/js/tours/budget.js` — the only module allowed to turn a route into
 * steps and seconds — and walks the step list that module returns, using that
 * module's own constants. A second opinion about which steps a route has is
 * exactly the defect this file is for.
 *
 * Five passes, per published route:
 *
 *   R1 THE ROUTE TEST (§3.2 test 1). Every recall the route flattens must be
 *      preceded on that route by a REQUIRED beat that teaches its item, as
 *      `beat.t` or as the counted figure `beat.onPath.t`. Optional beats, side
 *      roads, pins, extension cards and Close lines are not teaching. ERROR.
 *   R2 ITS OWN BEAT IS NOT A GAP. A recall standing behind the very beat that
 *      teaches it is a first encounter with a chip on it. ERROR.
 *   R3 THE SPACING TEST (§3.2 test 3). At least `RECALL_GAP_S` of the route's
 *      own costed length, at `SLOW_WPM`, between the end of that beat and the
 *      recall. ERROR.
 *   R4 THE PROSE IS FALSIFIABLE. A recall whose wording claims an earlier
 *      meeting — "again", "from earlier", "this lesson has named", "from
 *      memory", "six minutes on" — must have passed R1 on this route. A recall
 *      that names the moment must name one the route test found. ERROR.
 *   R5 A RECALL IS NEVER COVERAGE (§3.2, last line, and §3.1). No item may be
 *      counted in `mustStick().covers` on the strength of a recall. ERROR.
 *
 * And one pass across the surfaces:
 *
 *   S1 THE SENTENCE AGREES WITH THE ROUTE. Every surface that says how many
 *      spaced recalls a route runs must say the number the route runs — the
 *      published `recallsKept`, the card's own `recallsSay`, and the sentence
 *      `leavesSay` embeds must be one number. ERROR. This is defect 1 above.
 *
 * And one pass over the machinery §3.2 puts in the runtime, which no static
 * read of a JSON file can decide:
 *
 *   T2 THE RUN TEST EXISTS. §3.2 test 2 is a fact about a run — did THIS
 *      student walk that beat, and has six minutes of THEIR session elapsed —
 *      and belongs to the runner. `tours/index.js` must apply a warrant before
 *      a recall renders. ERROR if it does not.
 *   T3 THE VISIBLE FAILURE PATH. §3.2 asks for `[unearned recall]` in
 *      `--danger` when one renders anyway. WARNING when absent, listed rather
 *      than hidden, because nothing unearned renders today — R1..R5 prove it —
 *      and a warning that is printed cannot be overlooked.
 *
 * `--selftest` replays the two live regressions above plus four synthetic ones
 * from a cold start, and checks that a legitimate recall passes, so the checker
 * cannot go quietly vacuous the way the sentence it guards did.
 *
 * Usage:
 *   node tools/check-recall.js              human report
 *   node tools/check-recall.js --json       machine-readable
 *   node tools/check-recall.js --selftest   replay the regressions
 *   node tools/check-recall.js --ok         also list what it checked and passed
 *
 * Exit codes: 0 clean, 1 findings, 2 could not run.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP_JS = path.join(ROOT, 'app', 'js');
const BUDGET = path.join(APP_JS, 'tours', 'budget.js');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const showOk = argv.includes('--ok');

/* Words that claim the student has met the thing before. A recall may use them
   only where R1 has proved the claim. */
const CLAIMS_EARLIER = /\bagain\b|\bfrom earlier\b|\bearlier\b|\bfrom memory\b|has named\b|\byou (?:put|met|saw|gave)\b|\bminutes on\b|\bback\b/i;

/* ------------------------------------------------------------------ *
 * Load the cost model. It is an ES module in a CommonJS repository and it
 * imports two more, so its graph is inlined as data URLs — the same trick
 * check-timing.js uses, for the same reason: this checker must be given the
 * app's own step list, never a copy of it.
 * ------------------------------------------------------------------ */
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

const findings = [];
const passes = [];
const add = (severity, code, where, message, hint) =>
  findings.push({ severity, code, where, message, hint });
const pass = (code, where, message) => passes.push({ code, where, message });

/**
 * THE RULE, APPLIED INDEPENDENTLY OF THE MODEL THAT APPLIES IT.
 *
 * `budget.js::flatten` already enforces §3.2's route and spacing tests when it
 * lays a route out — which is right, and which is exactly why a checker that
 * only inspected `flatten`'s output would be vacuous: it would be asking the
 * accused for a character reference. So this walks the route's AUTHORED beats
 * in route order and decides each recall for itself, using the cost model only
 * for the two things the cost model owns — what a beat COSTS (`beatCost` at
 * `SLOW_WPM`) and what the constants ARE (`GATE_S`, `DISPUTE_S`,
 * `RETRIEVAL_S`, `RECALL_GAP_S`). The RULE is read from DIDACTIC_SPEC §3.2 and
 * written out here.
 *
 * Then it compares its verdict with the model's, and a disagreement either way
 * is an error:
 *   · the model KEEPS one the rule refuses  — an unearned recall reaches a
 *     student, which is the defect §3.2 is about;
 *   · the model REFUSES one the rule keeps  — a legitimate recall is silently
 *     dropped and the card then says "legitimate ground for none", which is the
 *     defect wave 9 round 2 shipped.
 */
const wants = (flag, id) => (Array.isArray(flag) ? flag.includes(id) : flag !== false);

/** THE NUMBER A SENTENCE CLAIMS. `recallsSay` writes it in words — "legitimate
 *  ground for none / one / two" — so a surface can be compared with a route
 *  without anyone retyping a figure. Returns null when the sentence makes no
 *  claim, which is not a disagreement. */
const WORD = { none: 0, one: 1, two: 2, three: 3, four: 4, five: 5 };
function sayNumber(text) {
  const m = /legitimate ground for (\w+)/.exec(String(text || ''));
  if (!m) return null;
  const w = m[1].toLowerCase();
  return WORD[w] != null ? WORD[w] : (Number(w) || null);
}
/** Do these `[surface, number]` pairs tell one story? */
function surfacesDisagree(pairs) {
  return [...new Set(pairs.filter(([, n]) => n != null).map(([, n]) => n))].length > 1;
}

function verdicts(B, doc, gatesDoc, id) {
  const meta = (doc.variantMeta && doc.variantMeta[id]) || {};
  const gates = new Set(((gatesDoc && gatesDoc.gates) || []).map((g) => g.id));
  const beats = B.beatsFor(doc, id);
  const required = beats.filter((b) => !b.optional);
  const taughtAt = new Map();          /* T-item -> { id, end } of the FIRST required beat */
  const rows = [];
  let at = 0;
  for (const b of required) {
    at += B.beatCost(b, B.SLOW_WPM);
    if (b.t && !taughtAt.has(b.t)) taughtAt.set(b.t, { id: b.id, end: at });
    if (b.onPath && b.onPath.t && !taughtAt.has(b.onPath.t)) taughtAt.set(b.onPath.t, { id: b.id, end: at });
    if (b.gateAfter && gates.has(b.gateAfter) && wants(meta.gates, b.gateAfter)) at += B.GATE_S;
    if (b.disputeAfter && meta.disputes !== false) at += B.DISPUTE_S;
    const r = b.recallAfter;
    if (!r || !wants(meta.recalls, r.id)) continue;
    const taught = taughtAt.get(r.t) || null;
    const gap = taught ? at - taught.end : null;
    const test1 = !!taught;                                   /* §3.2 test 1, the route test */
    const test2 = !!taught && taught.id !== b.id;             /* no gap to space across */
    const test3 = !!taught && gap >= B.RECALL_GAP_S;          /* §3.2 test 3, the spacing test */
    const keeps = test1 && test2 && test3;
    rows.push({
      route: id, recall: r.id, t: r.t, after: b.id, at: Math.round(at),
      taught: taught && taught.id, gap: gap == null ? null : Math.round(gap),
      say: String(r.say || ''), mark: String(r.mark || ''),
      keeps, why: !test1 ? 'R1' : !test2 ? 'R2' : !test3 ? 'R3' : 'ok',
    });
    if (keeps) at += B.RETRIEVAL_S;
  }
  return rows;
}

/** One route, all five recall passes plus the surfaces. */
function auditRoute(B, doc, gatesDoc, closeDoc, id) {
  const meta = (doc.variantMeta && doc.variantMeta[id]) || {};
  const label = meta.label || id;
  const beats = B.beatsFor(doc, id);
  const rows = verdicts(B, doc, gatesDoc, id);
  const modelKeeps = new Set(B.flatten(beats, meta, gatesDoc)
    .filter((s) => s.kind === 'recall').map((s) => s.recall.id));

  for (const row of rows) {
    const where = label + ' · ' + row.recall;
    row.model = modelKeeps.has(row.recall);

    if (row.model && !row.keeps) {
      const why = row.why === 'R1'
        ? 'no required beat earlier on ' + label + ' teaches ' + row.t
        : row.why === 'R2'
          ? 'it stands on `' + row.after + '`, the beat that teaches ' + row.t
            + ' — there is no gap to space across'
          : row.gap + 's separate it from `' + row.taught + '`, and §3.2 asks ' + B.RECALL_GAP_S + 's';
      add('error', row.why, where,
        'this route PLACES a spaced recall that §3.2 refuses: ' + why,
        'DIDACTIC_SPEC §3.2: "A recall that asks for something the student was never taught is not '
        + 'a hard question. It is a false statement about their own session." Its wording is '
        + JSON.stringify(row.say.slice(0, 90)) + '.');
      continue;
    }
    if (!row.model && row.keeps) {
      add('error', 'S2', where,
        'this recall passes all three of §3.2’s tests — taught by `' + row.taught + '`, '
        + row.gap + 's earlier — and the route does not place it',
        'A route with fewer eligible recalls than slots runs with fewer and says so; a route that '
        + 'drops a legitimate one and then says it had "legitimate ground for none" says something '
        + 'untrue about the lesson. Check the arguments to `recallAudit`/`flatten`.');
      continue;
    }
    if (!row.keeps) {
      pass(row.why, where, 'refused, correctly: '
        + (row.why === 'R1' ? 'nothing earlier on this route teaches ' + row.t
          : row.why === 'R2' ? 'it would stand on its own teaching beat'
            : 'only ' + row.gap + 's after `' + row.taught + '`'));
      continue;
    }
    pass('R1', where, 'taught earlier by `' + row.taught + '`');
    pass('R3', where, row.gap + 's after `' + row.taught + '` (>= ' + B.RECALL_GAP_S + 's)');

    /* R4 — the prose is falsifiable against the route. */
    if (CLAIMS_EARLIER.test(row.say + ' ' + row.mark) && !row.taught) {
      add('error', 'R4', where,
        'the recall claims an earlier meeting — ' + JSON.stringify(row.say.slice(0, 90))
        + ' — that this route cannot support', 'DIDACTIC_SPEC §3.2, "What a recall may say".');
    } else pass('R4', where, 'its wording is supported by `' + row.taught + '`');
  }

  /* R5 — a recall is never coverage. */
  const ms = B.mustStick(doc, id);
  const covered = new Set((ms.covers || []).map((x) => x.t));
  const beatTeaches = new Set();
  for (const b of beats) {
    if (b.optional) continue;
    if (b.t) beatTeaches.add(b.t);
    if (b.onPath && b.onPath.t) beatTeaches.add(b.onPath.t);
  }
  for (const row of rows) {
    if (covered.has(row.t) && !beatTeaches.has(row.t)) {
      add('error', 'R5', label + ' · ' + row.t,
        row.t + ' is counted as coverage on ' + label + ' but only a recall carries it',
        'DIDACTIC_SPEC §3.2, last line, and §3.1: "A recall is never counted as coverage. '
        + 'A first encounter dressed as a second is the same lie in a different place."');
    }
  }
  if (rows.length) pass('R5', label, rows.length + ' authored recall(s), none counted as coverage');

  /* S1 — every surface says the number the route runs. */
  const figures = B.routeFigures(doc, gatesDoc, closeDoc, id);
  const ran = modelKeeps.size;
  const surfaces = [['the route runs', ran], ['payload.recallsKept', figures.recallsKept]];
  const inCard = sayNumber(figures.recallsSay);
  const inPayload = sayNumber(figures.leaves);
  /* AND THE SENTENCE THE CARD ITSELF RENDERS. `routeFigures` computes its own
     `leaves`; `tours/index.js` paints the card from `leavesSay()`. They are two
     functions in one file and they can disagree — that is defect 1 at the top
     of this file, and comparing only the payload would miss it entirely. */
  const inRendered = sayNumber(B.leavesSay(doc, closeDoc, id));
  if (inCard != null) surfaces.push(['payload.recallsSay', inCard]);
  if (inPayload != null) surfaces.push(['payload.leaves', inPayload]);
  if (inRendered != null) surfaces.push(['leavesSay() — the rendered card', inRendered]);
  const distinct = [...new Set(surfaces.map(([, n]) => n))];
  if (surfacesDisagree(surfaces)) {
    add('error', 'S1', label,
      'the surfaces disagree about how many spaced recalls this route runs — '
      + surfaces.map(([k, n]) => k + '=' + n).join(', '),
      'Two surfaces one press apart contradicting each other about the student’s own session. '
      + 'The usual cause is a `recallAudit(beats, meta, null)` — the third argument is the GATES '
      + 'doc, and without it `flatten` never lays the gate step down, so the spacing gap comes out '
      + 'short by GATE_S and a legitimate recall is reported as refused.');
  } else pass('S1', label, 'every surface says ' + distinct[0]);

  return rows;
}

/* -------------------------------------------------------------- runtime -- */

/** §3.2 test 2 lives in the runner, and §3.2's last paragraph in the render. */
function auditRuntime() {
  const tours = fs.readFileSync(path.join(APP_JS, 'tours', 'index.js'), 'utf8');
  if (/_recallWarrant\s*\(/.test(tours) && /_recallWarrant\s*\(\s*\w/.test(tours)) {
    pass('T2', 'tours/index.js', 'a run warrant is applied before a recall renders');
  } else {
    add('error', 'T2', 'app/js/tours/index.js',
      'nothing applies §3.2 test 2 — this student\'s own run record — before a recall renders',
      'DIDACTIC_SPEC §3.2 test 2: "Skipping forward, arriving by deep link, entering from '
      + 'free-explore or resuming a route mid-way all fail this test."');
  }
  let seen = false;
  const walkDir = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      if (st.isDirectory()) walkDir(p);
      /* The MARKER, not the phrase. `tours/gate.js` discusses "an unearned
         recall" in a comment about a different rule; a comment is not a thing
         a student sees. */
      else if (/\.(js|json|css)$/.test(f) && /\[unearned recall\]/i.test(fs.readFileSync(p, 'utf8'))) seen = true;
    }
  };
  walkDir(APP_JS);
  if (seen) pass('T3', 'app/js', 'the student-visible marker exists');
  else {
    add('warn', 'T3', 'app/js',
      'no `[unearned recall]` marker exists anywhere in the app',
      'DIDACTIC_SPEC §3.2: "it renders `[unearned recall]` in `--danger` in front of a '
      + 'sixteen-year-old". Nothing unearned renders today — R1..R5 above prove it for every '
      + 'published route — so this is a missing belt beside a working brace, and it is listed '
      + 'rather than hidden.');
  }
}

/* ------------------------------------------------------------- selftest -- */

/**
 * A tiny authored route the rule engine can be pointed at. Costs are set so
 * that the Complication Gate is DECISIVE: without it the gap is 300s and §3.2
 * refuses; with it the gap is 390s and §3.2 keeps. That is the shape of the
 * live regression — an audit run with a null gates document reports a
 * legitimate recall as refused — reproduced in nine lines.
 */
function fixture(patch) {
  const beat = (id, extra) => Object.assign({ id, title: id, cost_s: 150, body: '' }, extra || {});
  const doc = {
    beats: [
      beat('teach', { t: 'T7' }),
      beat('middle', { gateAfter: 'g1' }),
      beat('far', { recallAfter: { id: 'r-t7', t: 'T7', mark: 'six minutes on', say: 'The loop again, from memory.' } }),
    ],
    variants: { probe: ['teach', 'middle', 'far'] },
    variantMeta: { probe: { label: 'the probe route', gates: ['g1'], recalls: true } },
    mustStick: { floor: 1, items: [{ t: 'T7', say: 'the loop' }] },
  };
  return patch ? patch(doc) : doc;
}

const GATES = { gates: [{ id: 'g1', title: 'the gate' }] };

async function selftest(B) {
  const cases = [];
  const only = (rows) => rows[0] || { why: '(no recall was authored at all)', keeps: null };

  /* THE CORRECT CASE FIRST, because a checker that fails everything is as
     useless as one that fails nothing. */
  {
    const v = only(verdicts(B, fixture(), GATES, 'probe'));
    cases.push(['a legitimate recall is kept', v.keeps === true && v.taught === 'teach',
      'kept=' + v.keeps + ' taught by ' + v.taught + ' gap ' + v.gap + 's']);
  }

  /* 1. THE LIVE REGRESSION'S MECHANISM: the gates document changes the answer,
        so an audit handed `null` for it reports a legitimate recall as refused. */
  {
    const doc = fixture();
    const meta = doc.variantMeta.probe;
    const withG = B.recallAudit(B.beatsFor(doc, 'probe'), meta, GATES).kept;
    const without = B.recallAudit(B.beatsFor(doc, 'probe'), meta, null).kept;
    cases.push(['a gate-blind audit reports a legitimate recall as refused',
      withG === 1 && without === 0, withG + ' with the gates doc, ' + without + ' without it']);
  }

  /* 2. §3.2 test 1 — nothing on this route teaches the item. */
  {
    const v = only(verdicts(B, fixture((d) => { d.beats[0].t = 'T9'; return d; }), GATES, 'probe'));
    cases.push(['R1 catches a recall nothing on the route teaches',
      v.keeps === false && v.why === 'R1', 'keeps=' + v.keeps + ' why=' + v.why]);
  }

  /* 3. An OPTIONAL beat is not teaching (§3.2 test 1, second sentence). */
  {
    const v = only(verdicts(B, fixture((d) => { d.beats[0].optional = true; return d; }), GATES, 'probe'));
    cases.push(['R1 counts an optional beat as not teaching',
      v.keeps === false && v.why === 'R1', 'keeps=' + v.keeps + ' why=' + v.why]);
  }

  /* 4. A recall standing on the very beat that teaches it. */
  {
    const v = only(verdicts(B, fixture((d) => { d.beats[0].t = 'T9'; d.beats[2].t = 'T7'; return d; }), GATES, 'probe'));
    cases.push(['R2 catches a recall on its own teaching beat',
      v.keeps === false && v.why === 'R2', 'keeps=' + v.keeps + ' why=' + v.why]);
  }

  /* 5. §3.2 test 3 — inside the six minutes. */
  {
    const v = only(verdicts(B, fixture((d) => { d.beats.forEach((b) => { b.cost_s = 40; }); return d; }), GATES, 'probe'));
    cases.push(['R3 catches a recall inside the six minutes',
      v.keeps === false && v.why === 'R3', 'keeps=' + v.keeps + ' why=' + v.why + ' gap=' + v.gap + 's']);
  }

  /* 6. A route whose `recalls` flag does not allow this one authors nothing. */
  {
    const rows = verdicts(B, fixture((d) => { d.variantMeta.probe.recalls = false; return d; }), GATES, 'probe');
    cases.push(['a route that allows no recalls places none', rows.length === 0, rows.length + ' placed']);
  }

  /* 7. THE SURFACES PASS, ON THE LIVE DEFECT ITSELF. The fixture's route runs
        one legitimate recall; `leavesSay` prices it with a null gates document
        and therefore says "legitimate ground for none". S1 must see that. This
        case is the regression, not a synthetic one: the same call is live in
        `budget.js` on Lesson One and on both full routes. */
  {
    cases.push(['S1 reads a sentence that writes its number in words',
      sayNumber('It had room for four spaced recalls and legitimate ground for two, so it runs with two.') === 2
      && sayNumber('It had room for one spaced recall and legitimate ground for none.') === 0
      && sayNumber('It asks nothing again from earlier.') === null,
      'two=' + sayNumber('legitimate ground for two') + ' none=' + sayNumber('legitimate ground for none')
      + ' silent=' + sayNumber('It asks nothing again from earlier.')]);
    cases.push(['S1 fires on a disagreement and not on a silence',
      surfacesDisagree([['a', 1], ['b', 1], ['c', 0]]) === true
      && surfacesDisagree([['a', 1], ['b', 1], ['c', null]]) === false
      && surfacesDisagree([['a', 3], ['b', 3], ['c', 3]]) === false,
      '1/1/0 -> ' + surfacesDisagree([['a', 1], ['b', 1], ['c', 0]])
      + ', 1/1/null -> ' + surfacesDisagree([['a', 1], ['b', 1], ['c', null]])]);
    /* AND END TO END, over the fixture, whichever world we are in: `leavesSay`
       either agrees with the route or it does not, and `auditRoute` must say
       so. Written this way the case keeps its meaning after the defect at the
       top of this file is fixed — a selftest that starts failing the day the
       bug is fixed is a trap, not a test. */
    const before = findings.length;
    auditRoute(B, fixture(), GATES, { lines: [] }, 'probe');
    const got = findings.slice(before);
    findings.length = before;
    const disagrees = sayNumber(B.leavesSay(fixture(), { lines: [] }, 'probe')) !== 1
      && sayNumber(B.leavesSay(fixture(), { lines: [] }, 'probe')) !== null;
    cases.push(['auditRoute says S1 exactly when the surfaces disagree',
      got.some((f) => f.code === 'S1') === disagrees,
      'surfaces ' + (disagrees ? 'disagree' : 'agree') + '; auditRoute raised '
      + (got.map((f) => f.code).join(',') || 'nothing')]);
    cases.push(['and raises nothing about the recall itself on a correct route',
      got.filter((f) => f.code !== 'S1').length === 0,
      got.filter((f) => f.code !== 'S1').map((f) => f.code).join(',') || 'nothing else']);
  }

  const bad = cases.filter(([, ok]) => !ok);
  for (const [name, ok, got] of cases) {
    process.stdout.write((ok ? '  ok   ' : '  MISS ') + name.padEnd(58) + ' — ' + got + '\n');
  }
  process.stdout.write('\n' + (bad.length
    ? '>>> check-recall --selftest FAILED: ' + bad.length + ' of ' + cases.length + ' regressions NOT caught\n'
    : 'check-recall --selftest: all ' + cases.length + ' checks caught, and a correct route passes\n'));
  return bad.length ? 1 : 0;
}

/* ------------------------------------------------------------------ main -- */

async function main() {
  let B;
  try {
    B = await import(inline(BUDGET, new Map()));
  } catch (e) {
    process.stderr.write('check-recall: could not load the cost model — ' + (e && e.message) + '\n');
    process.exit(2);
  }
  const doc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'tours', 'tours.json'), 'utf8'));
  const gatesDoc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'tours', 'gates.json'), 'utf8'));
  const closeDoc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'close', 'close.json'), 'utf8'));

  if (argv.includes('--selftest')) process.exit(await selftest(B));

  const ids = B.routeIds(doc);
  const rows = [];
  for (const id of ids) rows.push(...auditRoute(B, doc, gatesDoc, closeDoc, id));
  auditRuntime();

  const errors = findings.filter((f) => f.severity === 'error');
  const warns = findings.filter((f) => f.severity === 'warn');

  if (asJson) {
    process.stdout.write(JSON.stringify({ findings, passes, rows }, null, 2) + '\n');
    process.exit(errors.length ? 1 : 0);
  }

  process.stdout.write('check-recall — DIDACTIC_SPEC §3.2, the spaced recall rule\n');
  process.stdout.write(ids.length + ' routes, ' + rows.length + ' recalls placed, '
    + passes.length + ' checks passed\n\n');
  for (const r of rows) {
    process.stdout.write('  ' + r.route.padEnd(12) + ' ' + String(r.recall).padEnd(20)
      + ' ' + String(r.t).padEnd(5) + ' taught by ' + String(r.taught || '(nothing)').padEnd(16)
      + ' gap ' + (r.gap == null ? '—' : r.gap + 's') + '\n');
  }
  if (showOk) {
    process.stdout.write('\n-- what passed --\n');
    for (const p of passes) process.stdout.write('  ok  ' + p.code + '  ' + p.where + '  ' + p.message + '\n');
  }
  if (findings.length) {
    process.stdout.write('\n');
    for (const f of findings) {
      process.stdout.write((f.severity === 'error' ? 'ERROR ' : 'WARN  ') + f.code + '  ' + f.where + '\n');
      process.stdout.write('      ' + f.message + '\n');
      if (f.hint) process.stdout.write('      ' + f.hint + '\n');
    }
  }
  process.stdout.write('\n' + (errors.length
    ? '>>> RECALL RULE BROKEN — ' + errors.length + ' error(s)'
      + (warns.length ? ', ' + warns.length + ' warning(s)' : '') + '\n'
    : '>>> the recall rule holds — ' + passes.length + ' checks'
      + (warns.length ? ', ' + warns.length + ' warning(s)' : '') + '\n'));
  process.exit(errors.length ? 1 : 0);
}

main();
