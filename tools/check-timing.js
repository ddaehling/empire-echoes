#!/usr/bin/env node
/**
 * check-timing.js — DOES A PRINTED MINUTE AGREE WITH THE ONE THE APP COMPUTES?
 *
 * ================================ WHY THIS EXISTS =========================
 * Round 7 taught the cost model to see two whole surfaces it had been pricing
 * at zero — the counted figures the viz module mounts inside beats, and the
 * retrieval moments the quiz drops into them — and every route's honest length
 * moved. The student surfaces moved with it, because they read the computed
 * figure. The TEACHER surfaces did not, because they had a number typed into
 * them, and a typed number cannot move:
 *
 *   teacher/classroom.js  'The thirty minutes'
 *   teacher/pack.js       "the `core` route — the default thirty-minute run"
 *   teacher/path.js       "the four moves, ON the thirty-minute path"
 *   teacher/sheets.js     "Lesson plan — thirty minutes, run cold"
 *
 * against a route the app itself was pricing at 55. A head of history plans
 * Tuesday from a printed page that contradicts the app on the projector. That
 * is the same class of defect as check-gloss.js's — a sentence in one file
 * asserting something a record in another file contradicts — and it gets the
 * same answer: a build gate that renders the truth and reads the copy.
 *
 * ============================= WHAT IT ACTUALLY DOES ======================
 * Nothing here re-implements the cost model. It imports `app/js/tours/budget.js`
 * — the one module allowed to turn a route into minutes, and the same one
 * `tours/index.js` paints the card from — and asks it for every route's
 * figures. Then it reads the app's COPY (string literals in JS with the
 * comments stripped, and the non-`$` values in JSON) and checks every minute
 * figure in it against those.
 *
 * Three passes:
 *
 *   A. ATTRIBUTED  a string that names a route AND prints a minute figure must
 *                  print one of THAT route's figures. ERROR. This is the pass
 *                  that catches "the `core` route — the default thirty-minute
 *                  run" the day it is typed.
 *   B. SURFACE     any minute figure in a TIMING SURFACE — the modules whose
 *                  subject is how long the run takes: tours/, close/, teacher/,
 *                  onboarding/ — must be a figure some route computes. ERROR.
 *   C. LOOSE       a minute figure anywhere else in the app that matches no
 *                  route. WARNING: most of it is history ("fired for about ten
 *                  minutes"), and a warning that is listed cannot hide.
 *   D. TOOLS       tools/ — INCLUDING ITS COMMENTS. Round 9's phone critic:
 *                  "tools/scenarios/p05-accept.js still states in its own
 *                  comment that the default route costs 48 minutes at 180 wpm
 *                  and 65 at 110. That is `core`, not the current default.
 *                  check-timing.js reads only app/, so nothing catches it."
 *                  Both halves were true, and the second half is why pointing
 *                  passes A–C at tools/ would not have helped: they strip
 *                  comments. THE ASYMMETRY IS DELIBERATE AND IT IS THIS. In
 *                  app/, a comment is this repository's HISTORY — it is full of
 *                  numbers that used to be true, on purpose, and reading them
 *                  would make the checker unusable. In tools/, a comment that
 *                  names a route and prints a minute figure is a TEST'S OWN
 *                  CLAIM about the app it drives, read by the next person who
 *                  edits the test, and a stale one sends them after a number
 *                  that moved. So pass D runs the ATTRIBUTED rule only — the
 *                  sentence must name a route — over both the copy and the
 *                  comments of every file under tools/. ERROR.
 *
 * `--selftest` replays the four regressions above from a cold start and fails
 * if any of them is not caught, and checks that a correct sentence passes — so
 * the checker cannot go quietly vacuous the way the numbers it guards did.
 *
 * ================================== THE RULE ==============================
 * DO NOT TYPE A MINUTE FIGURE INTO THIS APPLICATION. Read it off the route
 * payload — `tours:ready` / `tours:routes` / `window.BEA.toursRoutes`, whose
 * contract is documented at the top of app/js/tours/budget.js — and print what
 * it says. If you need a figure the payload does not carry, add it to
 * `routeFigures()` and it will be true everywhere at once.
 *
 * Usage:
 *   node tools/check-timing.js              human report
 *   node tools/check-timing.js --json       machine-readable, for validate-data
 *   node tools/check-timing.js --selftest   replay the historical regressions
 *   node tools/check-timing.js --ok         also list what it checked and passed
 *
 * Exit codes: 0 clean, 1 findings, 2 could not run.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APP_JS = path.join(ROOT, 'app', 'js');
const BUDGET = path.join(APP_JS, 'tours', 'budget.js');
const TOOLS = path.join(ROOT, 'tools');
const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const showOk = argv.includes('--ok');

/* THE SURFACES WHOSE SUBJECT IS HOW LONG THE RUN TAKES. A minute figure in one
   of these is a claim about the lesson, whatever else the sentence is about, so
   it is an error rather than a note. */
const TIMING_SURFACES = [
  path.join('app', 'js', 'tours'),
  path.join('app', 'js', 'close'),
  path.join('app', 'js', 'teacher'),
  path.join('app', 'js', 'onboarding'),
];

/* THE ONLY MINUTE FIGURES IN A TIMING SURFACE THAT ARE NOT ABOUT THE RUN.
   Each one names its file, its exact phrase and why it is history rather than
   a duration this app can compute. The list is meant to stay this short: if it
   grows, the rule above is wrong and should be argued with, not padded. */
const EXEMPT = [
  { file: path.join('app', 'js', 'close', 'close.json'), phrase: 'ten minutes of fire',
    why: 'Jallianwala Bagh, 13 April 1919 — the length of the firing, not the length of a lesson.' },
  { file: path.join('app', 'js', 'tours', 'tours.json'), phrase: 'ten minutes into a crowd',
    why: 'Amritsar again, in the beat and in its source card.' },
  { file: path.join('app', 'js', 'tours', 'tours.json'), phrase: 'ten minutes into a crowd penned',
    why: 'Amritsar again, in the beat and in its source card.' },
  { file: path.join('app', 'js', 'tours', 'figures.json'), phrase: 'ten minutes of rifle fire',
    why: 'the warrant behind the Amritsar death toll: the length of the firing, from the Hunter Commission.' },
];

const WORDS = {
  five: 5, ten: 10, fifteen: 15, twenty: 20, 'twenty-five': 25, thirty: 30, 'thirty-five': 35,
  forty: 40, 'forty-five': 45, fifty: 50, 'fifty-five': 55, sixty: 60, 'sixty-five': 65,
  seventy: 70, 'seventy-five': 75, eighty: 80, 'eighty-five': 85, ninety: 90,
};
const NUM = '(\\d{1,3}|' + Object.keys(WORDS).join('|') + ')';
const FIGURE = new RegExp(NUM + '(?:\\s*(?:[-–—]|\\s+to\\s+)\\s*' + NUM + ')?[\\s-]?\\s*minutes?\\b', 'gi');
const toN = (s) => (/^\d+$/.test(s) ? Number(s) : WORDS[String(s).toLowerCase()]);

/* ------------------------------------------------------------------ *
 * Load the cost model. It is an ES module in a CommonJS repository, and
 * it imports two more, so its graph is inlined as data URLs — the same
 * trick check-gloss.js uses on vocab.js, made recursive because this
 * module asks quiz/checkpoint.js how many retrieval moments a route
 * hosts and must not be given a second opinion about that.
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
const add = (severity, code, file, line, message, hint) =>
  findings.push({ severity, code, file, line, message, hint });

/* ------------------------------------------------------------------ *
 * The copy: string literals in JS with the comments stripped, and every
 * non-`$` string value in JSON. A comment is documentation and this
 * repository's documentation is its history — it is full of the numbers
 * that used to be true, on purpose.
 * ------------------------------------------------------------------ */
function literalsOfJs(src) {
  const out = [];
  let i = 0, line = 1;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') line++; i++; }
      i += 2; continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const q = c; const at = line; let s = ''; i++;
      while (i < n) {
        const d = src[i];
        if (d === '\\') { s += (src[i + 1] === 'n' || src[i + 1] === 't') ? ' ' : src[i + 1]; i += 2; continue; }
        if (d === q) { i++; break; }
        if (d === '\n') line++;
        s += d; i++;
      }
      out.push({ text: s, line: at });
      continue;
    }
    i++;
  }
  return out;
}

function literalsOfJson(src) {
  const out = [];
  const lines = src.split('\n');
  const at = (v) => {
    const probe = JSON.stringify(v).slice(1, 60);
    for (let k = 0; k < lines.length; k++) if (lines[k].indexOf(probe) >= 0) return k + 1;
    return 0;
  };
  const walk = (v, key) => {
    if (typeof v === 'string') { if (!String(key).startsWith('$')) out.push({ text: v, line: at(v) }); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, key); return; }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (!k.startsWith('$')) walk(x, k); }
  };
  walk(JSON.parse(src), '');
  return out;
}

function files(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = fs.statSync(p);
    if (st.isDirectory()) files(p, out);
    else if (/\.(js|json)$/.test(f)) out.push(p);
  }
  return out;
}

/** Every minute figure a route legitimately prints, as numbers and as strings. */
function figuresOf(r) {
  const nums = new Set([r.minutes, r.minutesLow, r.minutesMax, r.minutesExact, r.minutesExactMax]
    .filter((x) => Number.isFinite(x)));
  return nums;
}

/** Which routes a string is talking about, by id, by label, or as "the
 *  default route". Round 9: the stale sentence pass D was added for names no
 *  route at all — it says "The default route's honest cost is now 48 minutes at
 *  180 words a minute and 65 at 110", which was `core` when it was written and
 *  is `period` now. "The default route" IS a name for a route; which route it
 *  names is the one thing this checker already knows for certain. */
function routesNamed(text, routes) {
  const low = text.toLowerCase();
  const hit = [];
  const def = routes.find((r) => r.isDefault);
  if (def && /\bthe default (route|path|lesson|run)\b/.test(low)) hit.push(def);
  for (const r of routes) {
    if (r.label && low.includes(String(r.label).toLowerCase())) { hit.push(r); continue; }
    /* An id on its own is only a name when it is written as a link or a key:
       "core" and "period" are ordinary English words. */
    if (new RegExp('#tour=' + r.id + '\\b|`' + r.id + '`|\\btour=' + r.id + '\\b').test(text)) hit.push(r);
  }
  return hit.filter((r, i) => hit.indexOf(r) === i);
}

async function main() {
  let budget;
  try {
    budget = await import(inline(BUDGET, new Map()));
  } catch (e) {
    process.stderr.write('check-timing: could not load the cost model — ' + (e && e.message) + '\n');
    process.exit(2);
  }
  const doc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'tours', 'tours.json'), 'utf8'));
  const gatesDoc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'tours', 'gates.json'), 'utf8'));
  const closeDoc = JSON.parse(fs.readFileSync(path.join(APP_JS, 'close', 'close.json'), 'utf8'));
  const routes = budget.allRoutes(doc, gatesDoc, closeDoc);
  /* The room's own frame is a figure a teacher surface may print — the
     timetabled period, the settling and the packing away, from `budget.js`'s
     own constants rather than typed here. What is LEFT after the atlas is
     deliberately NOT added: it is a different number on every route, it goes
     negative, and widening the allowed set with it would quietly legalise
     "ten minutes" — which in this app is Amritsar, and has to stay listed. A
     surface printing the remainder should print it off `roomMinutes.left`, and
     if that ever needs to pass this checker it should be attributed to its
     route, which pass A already handles. */
  const everyFigure = new Set([budget.PERIOD_MINUTES, budget.LESSON_MINUTES,
    budget.SETTLE_MINUTES, budget.PACK_MINUTES]);
  for (const r of routes) for (const n of figuresOf(r)) everyFigure.add(n);

  /* THE ONE-PERIOD CLAIM, CHECKED RATHER THAN ASSERTED. DIDACTIC_SPEC §8 is a
     thirty-minute lesson and the whole classroom case rests on it. A build
     where no route fits a period is the round-8 defect, and it is caught here
     rather than by a critic. */
  const fits = routes.filter((r) => r.fitsPeriod);
  if (!fits.length) {
    add('error', 'timing/no-period-route', 'app/js/tours/tours.json', 0,
      'no route ends inside a ' + budget.PERIOD_MINUTES + '-minute period at ' + budget.SLOW_WPM
      + ' words a minute; the shortest is ' + Math.min(...routes.map((r) => r.minutesExactMax)) + ' minutes',
      'DIDACTIC_SPEC §8 is a thirty-minute lesson. Cut a route against budgetMinutes(steps, SLOW_WPM) <= '
      + budget.PERIOD_MINUTES + ', or amend §8 in writing first.');
  }
  const def = routes.find((r) => r.isDefault);
  if (!def) {
    add('error', 'timing/no-default', 'app/js/tours/tours.json', 0,
      'no route carries isDefault, so tours/index.js and close/index.js are guessing which one a cold start runs');
  } else if (!def.fitsPeriod && fits.length) {
    add('warn', 'timing/default-overruns', 'app/js/tours/tours.json', 0,
      'the default route "' + def.id + '" takes ' + def.minutesExactMax + ' minutes at ' + budget.SLOW_WPM
      + ' wpm and another route fits a period', 'A default that overruns the period is the round-8 defect.');
  }

  let scanned = 0, matched = 0, exempted = 0;
  for (const abs of files(APP_JS)) {
    const rel = path.relative(ROOT, abs);
    const src = fs.readFileSync(abs, 'utf8');
    let lits;
    try { lits = abs.endsWith('.json') ? literalsOfJson(src) : literalsOfJs(src); }
    catch (e) { add('error', 'timing/unreadable', rel, 0, 'could not read this file’s copy: ' + e.message); continue; }
    const timingSurface = TIMING_SURFACES.some((d) => rel.startsWith(d + path.sep));
    for (const lit of lits) {
      scanned++;
      let m; FIGURE.lastIndex = 0;
      while ((m = FIGURE.exec(lit.text))) {
        matched++;
        const said = [toN(m[1]), m[2] ? toN(m[2]) : null].filter((x) => Number.isFinite(x));
        const phrase = m[0].trim();
        const ex = EXEMPT.find((e) => e.file === rel && lit.text.includes(e.phrase));
        if (ex) { exempted++; continue; }
        const named = routesNamed(lit.text, routes);
        const where = lit.text.replace(/\s+/g, ' ').trim().slice(0, 150);
        if (named.length) {
          const ok = named.some((r) => said.every((n) => figuresOf(r).has(n)));
          if (!ok) {
            const r = named[0];
            add('error', 'timing/route-mismatch', rel, lit.line,
              'this sentence names "' + (r.label || r.id) + '" and prints "' + phrase + '", and that route costs '
              + r.minutesExact + '–' + r.minutesExactMax + ' minutes (it prints "' + r.minutesSay + '")',
              'Read the figure off the route payload — see app/js/tours/budget.js — instead of typing it. «' + where + ' »');
          }
          continue;
        }
        const ok = said.every((n) => everyFigure.has(n));
        if (ok) continue;
        if (timingSurface) {
          add('error', 'timing/stale-figure', rel, lit.line,
            'this timing surface prints "' + phrase + '" and no route computes it (the figures are '
            + [...everyFigure].sort((a, b) => a - b).join(', ') + ')',
            'Read it off the route payload, or add it to the exemption list in tools/check-timing.js with a '
            + 'reason it is not about the run. «' + where + ' »');
        } else {
          add('warn', 'timing/loose-figure', rel, lit.line,
            'prints "' + phrase + '", which matches no route this app computes',
            'Probably history rather than a duration. Listed so it cannot hide. «' + where + ' »');
        }
      }
    }
  }

  /* ---------------- PASS D: tools/, comments included ---------------- *
     Only the ATTRIBUTED rule. A sentence in a build tool that names a route
     and prints a minute figure has to agree with that route; a minute figure
     that names no route is a scenario's own timeout or budget and is not this
     checker's business. See the header for why comments count here and not in
     app/. */
  let toolLines = 0;
  for (const abs of files(TOOLS)) {
    const rel = path.relative(ROOT, abs);
    if (rel === path.join('tools', 'check-timing.js')) continue;   /* its own selftest fixtures */
    let src;
    try { src = fs.readFileSync(abs, 'utf8'); } catch (_) { continue; }
    const lines = src.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const text = lines[i];
      toolLines++;
      let m; FIGURE.lastIndex = 0;
      while ((m = FIGURE.exec(text))) {
        const said = [toN(m[1]), m[2] ? toN(m[2]) : null].filter((x) => Number.isFinite(x));
        const named = routesNamed(text, routes);
        if (!named.length) continue;
        if (named.some((r) => said.every((n) => figuresOf(r).has(n)))) continue;
        const r = named[0];
        add('error', 'timing/tool-mismatch', rel, i + 1,
          'this line names "' + (r.label || r.id) + '" and prints "' + m[0].trim() + '", and that route costs '
          + r.minutesExact + '–' + r.minutesExactMax + ' minutes (it prints "' + r.minutesSay + '")',
          'A build tool that names a route and a length is making a claim about the app. Read it off the '
          + 'route payload, or take the number out. «' + text.replace(/\s+/g, ' ').trim().slice(0, 150) + ' »');
      }
    }
  }

  const stats = { routes: routes.length, literals: scanned, figures: matched, exempt: exempted, toolLines,
    allowed: [...everyFigure].sort((a, b) => a - b), period: budget.PERIOD_MINUTES, slowWpm: budget.SLOW_WPM };

  if (argv.includes('--selftest')) await selftest(routes, budget, stats);

  report(routes, stats);
}

/* ------------------------------------------------------------------ *
 * THE SELFTEST — the four sentences this checker was built for, replayed
 * from a cold start. If the checker stops catching them it is vacuous,
 * and a vacuous checker is worse than none: it is a green light.
 * ------------------------------------------------------------------ */
async function selftest(routes, budget, stats) {
  const cases = [
    { say: 'Open the atlas and press #tour=core&step=1. That starts the default thirty-minute run.',
      surface: true, why: 'round 7: the printed pack sold `core` as thirty minutes while the app priced it at 55' },
    { say: 'the four moves, on the thirty-minute path — `thirty`', surface: true,
      why: 'round 8, teacher/path.js: the full path is nearer eighty minutes' },
    { say: 'The lesson, timed: 35-45 minutes', surface: true,
      why: 'round 7: the figure the model produced before it could see the in-beat figures' },
    { say: 'Lesson plan — thirty minutes, run cold. `core`', surface: true,
      why: 'round 8, teacher/sheets.js: the sheet title that named a route and a length that disagreed' },
    { say: "     model was counting). The `period` route's honest cost is now 48 minutes at 180 words a minute and 65 at 110.",
      surface: false,
      why: 'round 9, tools/scenarios/p05-accept.js: a build tool asserting the DEFAULT route’s length in its own '
        + 'comment, three waves after the default moved. Pass D reads tools/ comments for exactly this.' },
  ];
  const good = [
    { say: 'the core lesson runs about ' + (routes.find((r) => r.id === 'core') || {}).minutes + ' minutes' },
    { say: '`period` fits one ' + budget.PERIOD_MINUTES + '-minute period' },
  ];
  const everyFigure = new Set([budget.PERIOD_MINUTES, budget.LESSON_MINUTES,
    budget.SETTLE_MINUTES, budget.PACK_MINUTES]);
  for (const r of routes) for (const n of figuresOf(r)) everyFigure.add(n);
  const judge = (text, timingSurface) => {
    let m; FIGURE.lastIndex = 0; const hits = [];
    while ((m = FIGURE.exec(text))) {
      const said = [toN(m[1]), m[2] ? toN(m[2]) : null].filter((x) => Number.isFinite(x));
      const named = routesNamed(text, routes);
      if (named.length) { if (!named.some((r) => said.every((n) => figuresOf(r).has(n)))) hits.push('route-mismatch'); continue; }
      if (!said.every((n) => everyFigure.has(n))) hits.push(timingSurface ? 'stale-figure' : 'loose-figure');
    }
    return hits;
  };
  const missed = [];
  for (const c of cases) if (!judge(c.say, c.surface).length) missed.push(c);
  const wrong = [];
  for (const c of good) if (judge(c.say, true).length) wrong.push(c);
  stats.selftest = { replayed: cases.length, caught: cases.length - missed.length, falsePositives: wrong.length };
  for (const c of missed) {
    add('error', 'timing/selftest-missed', 'tools/check-timing.js', 0,
      'the checker no longer catches a regression it was built for: «' + c.say + ' »', c.why);
  }
  for (const c of wrong) {
    add('error', 'timing/selftest-false-positive', 'tools/check-timing.js', 0,
      'the checker flags a sentence that agrees with the computed figure: «' + c.say + ' »',
      'A checker that cries wolf gets switched off.');
  }
}

function report(routes, stats) {
  const errors = findings.filter((f) => f.severity === 'error');
  if (asJson) {
    process.stdout.write(JSON.stringify({ findings, stats, routes: routes.map((r) => ({
      id: r.id, label: r.label, for: r.for, isDefault: r.isDefault, steps: r.steps,
      minutesExact: r.minutesExact, minutesExactMax: r.minutesExactMax, minutesSay: r.minutesSay,
      minutes: r.minutes, periods: r.periods, fitsPeriod: r.fitsPeriod,
      covers: r.covers.length, drops: r.drops.length, mustStickFloor: r.mustStickFloor,
    })) }, null, 2));
    process.exit(errors.length ? 1 : 0);
  }
  const out = [];
  out.push('');
  out.push('check-timing — every printed minute against the one app/js/tours/budget.js computes');
  out.push('');
  out.push('  route      for                                steps   180wpm  110wpm   card    one    periods  T');
  for (const r of routes) {
    out.push('  ' + r.id.padEnd(10) + String(r.for || '').padEnd(35)
      + String(r.steps).padStart(5)
      + String(r.minutesExact).padStart(8) + 'm'
      + String(r.minutesExactMax).padStart(7) + 'm'
      + String(r.minutesSay).padStart(8)
      + String(r.minutes).padStart(7)
      + String(r.periods).padStart(8) + (r.fitsPeriod ? '*' : ' ')
      + String(r.covers.length + '/' + r.mustStickTotal).padStart(7)
      + (r.isDefault ? '   ← default' : ''));
  }
  out.push('');
  out.push('  * fits one ' + stats.period + '-minute period at ' + stats.slowWpm + ' words a minute.');
  out.push('  figures any surface may print: ' + stats.allowed.join(', '));
  out.push('  read ' + stats.literals + ' strings of copy; ' + stats.figures + ' of them print a minute figure; '
    + stats.exempt + ' exempt as history.');
  out.push('  read ' + stats.toolLines + ' lines of tools/, comments included, for a route named beside a length.');
  if (stats.selftest) {
    out.push('  selftest: ' + stats.selftest.caught + ' of ' + stats.selftest.replayed
      + ' historical regressions caught, ' + stats.selftest.falsePositives + ' false positives.');
  }
  out.push('');
  if (!findings.length) out.push('PASS — every printed minute agrees with the model.');
  else {
    for (const f of findings) {
      out.push((f.severity === 'error' ? 'ERROR' : ' WARN') + '  ' + f.file + ':' + f.line + '  [' + f.code + ']');
      out.push('        ' + f.message);
      if (f.hint) out.push('        → ' + f.hint);
    }
    out.push('');
    out.push((errors.length ? 'FAIL' : 'PASS with warnings') + ' — ' + errors.length + ' error(s), '
      + (findings.length - errors.length) + ' warning(s)');
  }
  out.push('');
  process.stdout.write(out.join('\n'));
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => { process.stderr.write('check-timing: ' + (e && e.stack ? e.stack : e) + '\n'); process.exit(2); });
