#!/usr/bin/env node
/**
 * acceptance.js — THE FRONT DOOR. One command, one green or red line.
 *
 *   node tools/acceptance.js                 the whole suite
 *   node tools/acceptance.js --quick         the checkers and the phone laws only
 *   node tools/acceptance.js --only <regex>  the checks whose name matches
 *   node tools/acceptance.js --list          what it would run, and why
 *   node tools/acceptance.js --jobs 8        how many browsers at once (default 5)
 *
 * WHAT IT RUNS, AND WHY IT EXISTS.
 *
 * Everything this repository can assert lived in nineteen separate commands and
 * 1,463 scenario files, most of them one-shot probes from earlier waves. There
 * was no way to ask "is the build green?" and get an answer, and there was no
 * list anywhere of which of those files were load-bearing. Two failure modes
 * followed, and both were live when this file was written:
 *
 *   1. A CHECK THAT PRINTS `FAIL` AND EXITS 0. `p05-accept`, `p06-accept`,
 *      `p08-accept`, `p10-accept` and `shell-surface` each reported real
 *      failures and returned normally, so anything that trusted exit codes
 *      called them green. `read.js` did the same with ">>> READING LAW BROKEN".
 *      So a check here is RED IF IT EXITS NON-ZERO **OR** IF ITS OUTPUT
 *      CONTAINS THIS PROJECT'S OWN FAILURE CONVENTION — a `FAIL` row, a
 *      `-> FAIL`, `>>> … BROKEN`, `>>> … FAILED`, `HAS FAILURES`, or an
 *      `ERROR` line from one of the node checkers. A scenario cannot go green
 *      by declining to throw.
 *   2. A CHECK THAT WALKS A ROUTE NOBODY USES. Every scenario that walks the
 *      lesson now discovers the route from the payload the app publishes
 *      (`tools/scenarios/lib/routes.js`), so renaming a route or moving
 *      `isDefault` cannot leave the suite testing a path a cold start never
 *      runs. That is checked here too, as `routes/default`, before anything
 *      else: if the app publishes no default route, nothing below it means
 *      anything.
 *
 * WHAT IT DOES NOT DO. It does not soften a check to make the line green, and
 * it does not hide a failure it cannot attribute. A red summary naming four
 * failures in three other agents' files is the correct output of this file.
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SCEN = path.join(ROOT, 'tools', 'scenarios');
const URL = process.env.BEA_URL || 'http://localhost:8777/app/';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
const has = (n) => argv.includes('--' + n);
const JOBS = Math.max(1, +flag('jobs', 5));
const ONLY = flag('only', null);

/* ------------------------------------------------------------------ suite --
   Every entry names the GUARANTEE it protects, in one line, because a check
   whose purpose nobody can state is a check nobody will maintain. */

/** The node checkers. `argv` is passed through; red on a non-zero exit or an
 *  ERROR line. */
const CHECKERS = [
  ['data', 'tools/validate-data.js', [],
    'every date, status, source and cross-reference in the dataset is well-formed and defensible'],
  ['gloss', 'tools/check-gloss.js', ['--selftest'],
    'no sentence in the app contradicts another, and the checker still catches the 13 historical regressions it was built for'],
  ['timing', 'tools/check-timing.js', ['--selftest'],
    'no printed minute figure disagrees with the one tours/budget.js computes, on any surface, student or teacher'],
  ['pack', 'tools/check-pack.js', ['--selftest'],
    'every line of the printed teacher pack is about a beat the lesson it names actually runs'],
  ['recall', 'tools/check-recall.js', [],
    'DIDACTIC_SPEC §3.2: every spaced recall is a SECOND meeting with something a beat earlier on that route taught, six minutes back, and every surface says the same number of them'],
  ['recall-self', 'tools/check-recall.js', ['--selftest'],
    'and the §3.2 checker still catches the six regressions it was built for'],
];

/** Viewport sweeps. `w x h` plus the flags `inspect.js` takes. */
const PHONE = [
  ['390x844', ['--w', '390', '--h', '844']],
  ['390x844-dark', ['--w', '390', '--h', '844', '--dark']],
  ['390x844-reduced', ['--w', '390', '--h', '844', '--reduced']],
  ['360x740', ['--w', '360', '--h', '740']],
  ['768x1024', ['--w', '768', '--h', '1024']],
];
/* LAYOUT_BUDGET §0's own sweep, plus the two landscape phones the brief names. */
const PLATE = [
  ['1920x1080', ['--w', '1920', '--h', '1080']],
  ['1440x900', ['--w', '1440', '--h', '900']],
  ['1366x768', ['--w', '1366', '--h', '768']],
  ['1024x640', ['--w', '1024', '--h', '640']],
  ['900x700', ['--w', '900', '--h', '700']],
  ['1440x900-dark', ['--w', '1440', '--h', '900', '--dark']],
  ['1440x900-reduced', ['--w', '1440', '--h', '900', '--reduced']],
  ['844x390', ['--w', '844', '--h', '390']],
  ['768x1024', ['--w', '768', '--h', '1024']],
  ['740x360', ['--w', '740', '--h', '360']],
  ['390x844', ['--w', '390', '--h', '844']],
];

/**
 * THE ACCEPTANCE SCENARIOS. One line each saying what it protects — the same
 * sentence that stands at the top of the file itself.
 *
 * `routes: 'all'` means the scenario walks every route the app publishes and is
 * run once; `routes: 'default'` means it is handed `--route default`.
 * Everything else takes no route argument because it does not walk the lesson.
 */
/* CHECKS THAT MUST NOT SHARE A CPU. A wall-clock measurement taken while four
   other browsers are running measures the machine, not the app. `p03-time`'s
   T5 asserts FEATURE_SPEC P03.5 — "a 600-frame scrub costs under 16ms per
   frame at 1440x900 with the full dataset" — by dispatching 600 synchronous
   `setYear` + `flush()` and dividing wall time by 600, which is the right
   measurement and the one most sensitive to load. It is run alone, after the
   pool has drained, so that when it is red it is red about the app. */
const SOLO = new Set(['scenario/p03-time']);

const SCENARIOS = [
  /* --- the laws, at the viewports they are written for ------------------- */
  /* EVERY ROUTE AT EVERY VIEWPORT, and the cost is deliberate. Narrowing the
     later viewports to the default route was tried and immediately lost a real
     defect: `dock` D2 finds Next overflowing the right edge of a 768x1024
     window on the LAST step of `thirty` and `sixty` and nowhere else, so a
     sweep that walks only the default at 768 is green about a broken control.
     A law is not asserted until it is asserted where it breaks. */
  ['read', 'read.js', PHONE, null,
    'RESPONSIVE_LAW §11: on every published route, the prose can be read through the window it is in, and one press moves between reading and the map'],
  ['dock', 'dock.js', PHONE, null,
    'RESPONSIVE_LAW: what stands ON the map — the band, its controls and their targets'],
  ['budget', 'budget.js', PLATE, null,
    'LAYOUT_BUDGET: the cold plate keeps its share of every window in the sweep'],
  ['budget-working', 'budget-working.js', PHONE, null,
    'LAYOUT_BUDGET B8: a mounted beat keeps its panel'],

  /* --- the shell -------------------------------------------------------- */
  ['shell', 'shell.js', null, null,
    'boot, deep-link restore, URL writing, back/forward, module isolation, Escape and the error boundary'],
  ['shell-accept', 'shell-accept.js', null, null,
    'the shell acceptance tests in FEATURE_SPEC §2 P01'],
  ['shell-surface', 'shell-surface.js', null, null,
    'the address is what was pasted, Back leaves the lesson, and a deep link survives being opened'],
  ['shellr3-focal', 'shellr3-focal.js', null, null,
    'one filled control at a time inside the lesson'],
  ['shellr3-near', 'shellr3-near.js', null, null,
    'what sits near the thumb at the small end'],
  ['shellr3-seam', 'shellr3-seam.js', null, null,
    'the seam between the plate and the panel at 900x700'],
  ['shellr3-drive', 'shellr3-drive.js', null, null,
    'driving the shell through its own states without losing the band'],
  ['smoke', 'smoke.js', null, null,
    'the app boots, paints and answers at all'],
  ['data-fixture', 'data-fixture.js', null, null,
    'core/data.js reads both dataset shapes and loads its geometry'],

  /* --- one per piece, at the current round ------------------------------ */
  ['p02-map', 'p02r8-accept.js', null, null,
    'P02: the map paints every year with a coastline, no pure black or white, and a different set per definition'],
  ['p02-r6', 'p02r6-accept.js', null, null,
    'P02 round 6: the paint rules that round added'],
  ['p02-r5', 'p02r5-accept.js', null, null,
    'P02 round 5: tiny territories stay findable'],
  ['p02-base', 'p02-accept.js', null, null,
    'P02: the original FEATURE_SPEC §2 acceptance list'],
  ['p03-time', 'p03-accept.js', null, null,
    'P03: the spine band in every state, the year says which phases run, the keyboard jumps, the uncertainty rail, 600 frames, and playback stops itself and says why'],
  ['p03-r6', 'p03r6-accept.js', null, null,
    'P03 round 6: the timeline changes that round made'],
  ['p04-dossier', 'p04-r6-accept.js', null, null,
    'P04: the four answers above the fold, no banned euphemism, every destination carries its evidence'],
  ['p04-r5', 'p04-r5-accept.js', null, null,
    'P04 round 5: the dossier as staged destinations'],
  ['p04-r4', 'p04-r4-accept.js', null, null,
    'P04 round 4: the dossier acceptance list of that round'],
  ['p05-tours', 'p05-accept.js', null, null,
    'P05: every forward edge of the lesson disables and unfocuses Next until the student has placed something'],
  ['p06-legend', 'p06-accept.js', null, null,
    'P06: the legend agrees with the catalogue it is a key to'],
  ['p06-r2', 'p06-r2-accept.js', null, null,
    'P06 round 2: the legend changes that round made'],
  ['p08-viz', 'p08-accept.js', null, null,
    'P08: the counted figures mount inside their own beats, record a committed guess, and never move the year the beat is holding'],
  ['p10-quiz', 'p10-accept.js', null, null,
    'P10: retrieval on the path, and each card says why it was chosen for this student'],
  ['p17-legend', 'p17-r10-accept.js', null, null,
    'P17: the byline, the provenance line and the legend fields'],
  ['p17-r9', 'p17-r9-accept.js', null, null,
    'P17 round 9: the legend changes that round made'],
  ['p18-close', 'p18r6-accept.js', null, null,
    'P18: the Close signs its through-line and greys what the route could not reach'],
  ['p20-print', 'p20-accept.js', null, null,
    'P20: the printed teacher pack'],
  ['map-accept', 'map-accept.js', null, null,
    'the map module acceptance list'],
  ['hgx', 'hgx-accept.js', null, null,
    'P16: historians disagree — the positions, the gate, the verdict on the far side of a commitment, and no false balance'],
  ['r7', 'r7-accept.js', null, null,
    'wave 7: the honest re-pricing of every route'],
  ['w8-routes', 'w8-routes.js', null, null,
    'every route publishes its own arithmetic, exactly one is the default, and the card offers no route the app does not publish'],
  ['w8-card', 'w8-card.js', null, null,
    'the route card prints what the model computed and never a retyped figure'],
  ['w8-run', 'w8-run.js', null, null,
    'the default route can be walked end to end'],
  ['w9-card', 'w9-card.js', null, null,
    'DIDACTIC_SPEC §8.5: on every route, the door promises exactly the misleads that route\'s beats deliver, and every control that starts a route is called by that route\'s name'],
  ['w9-close', 'w9-close.js', null, null,
    'DIDACTIC_SPEC §8.4: both lessons walked cold to their own Close — it names what was finished, signs THIS lesson\'s through-line, greys nothing, and names the other lesson as a subject'],
  ['w9-proj', 'w9-proj.js', null, null,
    'the projection mislead is DELIVERED on the path — equal-area on the beat that carries it, Mercator back on the next — and no route delivers one it did not promise'],
  ['w9-slice', 'w9-slice.js', PHONE, null,
    'the rail sheet\'s scroller ends where its foot begins, on every route, at every sampled surface'],
  ['w9-ax', 'w9-ax.js', null, null,
    'every actor eyebrow on every route clears WCAG AA against the well it sits on'],
];

/* ------------------------------------------------------------------- run -- */

/* THE CONVENTION LIVES IN ONE FILE, and `tools/inspect.js` reads the same one,
   so a scenario run standalone and the same scenario run here cannot disagree
   about whether it failed. */
const { FAIL_LINE, reasons } = require(path.join(SCEN, 'lib', 'verdict.js'));
const SCEN_ERROR = /!! SCENARIO ERROR:|THE SCENARIO REPORTED FAILURES/;

function run(cmd, args, cwd) {
  return new Promise((res) => {
    const t0 = Date.now();
    const p = spawn(cmd, args, { cwd, env: process.env });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { out += d; });
    p.on('error', (e) => res({ code: 127, out: String(e), ms: Date.now() - t0 }));
    p.on('close', (code) => res({ code, out, ms: Date.now() - t0 }));
  });
}

const jobs = [];

/* THE FIRST CHECK, AND EVERYTHING ELSE DEPENDS ON IT. */
jobs.push({
  name: 'routes/default', kind: 'route',
  why: 'the app publishes exactly one default route, and every scenario below discovers it rather than naming it',
  cmd: 'node', args: [path.join(ROOT, 'tools', 'inspect.js'), path.join(SCEN, 'w8-routes.js'),
    '--out', path.join(require('os').tmpdir(), 'acceptance-routes')],
});

/* THE SUITE'S OWN LINT, AND IT RUNS BEFORE THE SUITE.
   Failure mode 2 at the top of this file is "a check that walks a route nobody
   uses", and it came back twice: `w9-close`, `w9-card`, `w9-proj` and `w9-ax`
   were written the same wave as `lib/routes.js` and all four navigated to
   `#tour=period`, a route `variantMeta` marks retired. Reading the guarantee
   sentences did not catch it and neither did the run, because a scenario with
   no assertion is green wherever it goes. So the files THIS FILE RUNS are
   scanned for a hardcoded route id: an acceptance scenario asks the app which
   route a student is given, and if it names one it must name it as a comment
   about history, not as an address it opens. */
jobs.push({
  name: 'harness/no-hardcoded-route', kind: 'lint',
  why: 'no scenario in this suite opens a route by name — every one discovers it from the published payload',
  lint: () => {
    const bad = [];
    for (const [, file] of SCENARIOS) {
      const abs = path.join(SCEN, file);
      if (!fs.existsSync(abs)) continue;
      /* CODE ONLY. A comment naming a route is this repository's HISTORY —
         every one of these files explains which address it used to open and
         why that was wrong, and reading those would make the lint unusable.
         Block comments are blanked line by line so the line numbers survive. */
      const src = fs.readFileSync(abs, 'utf8');
      const lines = src.split('\n');
      let inBlock = false;
      lines.forEach((raw, i) => {
        let line = raw;
        if (inBlock) {
          const end = line.indexOf('*/');
          if (end < 0) return;
          line = line.slice(end + 2);
          inBlock = false;
        }
        for (;;) {
          const open = line.indexOf('/*');
          if (open < 0) break;
          const close = line.indexOf('*/', open + 2);
          if (close < 0) { line = line.slice(0, open); inBlock = true; break; }
          line = line.slice(0, open) + ' ' + line.slice(close + 2);
        }
        const slash = line.indexOf('//');
        if (slash >= 0) line = line.slice(0, slash);
        /* A line that navigates is always scanned, whatever the comment state
           says: a `/*` inside a string or a regex earlier in the file can leave
           the cheap scanner thinking it is still inside a comment, and a lint
           that under-reports on the exact files it is for is no lint. */
        if (/page\.goto\(|location\.hash/.test(raw)) line = raw;
        const m = /['"`][^'"`]*#tour=([a-z0-9-]+)/i.exec(line);
        /* `#tour=none` is not a route. It is how this app spells "no lesson
           running", and a scenario asserting the spine survives it is asserting
           the right thing. */
        if (m && m[1] !== 'none') bad.push(file + ':' + (i + 1) + '  opens #tour=' + m[1] + ' by name');
        /* AND THE OTHER TWO WAYS IN. A route id typed into `startTour`, or a
           route looked up by key on the published index, is the same defect
           without a `#` in it — `shellr3-drive.js` dispatched
           `startTour, { id: 'thirty', step: 6 }` and `p06-accept.js`
           dispatched `startTour, 'thirty'`, and the `#tour=` rule saw neither. */
        const n2 = /startTour['"`]?\s*,\s*(?:\{[^}]*id:\s*)?['"`]([a-z0-9-]+)['"`]/i.exec(line);
        if (n2 && n2[1] !== 'none') bad.push(file + ':' + (i + 1) + '  starts the tour "' + n2[1] + '" by name');
        const n3 = /\b(routes|variants|variantMeta)\.(thirty|core|period|sixty|eight)\b/.exec(line);
        if (n3) bad.push(file + ':' + (i + 1) + '  looks up ' + n3[1] + '.' + n3[2] + ' by name');
      });
    }
    return bad;
  },
});

for (const [name, file, extra, why] of CHECKERS) {
  jobs.push({ name: 'check/' + name, kind: 'checker', why, cmd: 'node', args: [path.join(ROOT, file), ...extra] });
}

if (!has('quick')) {
  for (const [name, file, sweep, routeMode, why] of SCENARIOS) {
    const abs = path.join(SCEN, file);
    if (!fs.existsSync(abs)) { jobs.push({ name: 'scenario/' + name, kind: 'missing', why, missing: file }); continue; }
    const viewports = sweep || [['default', []]];
    viewports.forEach(([vp, flags], i) => {
      const routeArgs = routeMode
        ? (i === 0 ? (routeMode.first === 'all' ? [] : ['--route', routeMode.first])
                   : (routeMode.rest === 'all' ? [] : ['--route', routeMode.rest]))
        : [];
      jobs.push({
        name: 'scenario/' + name + (sweep ? '@' + vp : ''), kind: 'scenario', why,
        cmd: 'node',
        args: [path.join(ROOT, 'tools', 'inspect.js'), abs, '--url', URL,
          '--out', path.join(require('os').tmpdir(), 'acceptance', name + '-' + vp), ...flags, ...routeArgs],
      });
    });
  }
}

const selected = ONLY ? jobs.filter((j) => new RegExp(ONLY, 'i').test(j.name)) : jobs;

if (has('list')) {
  for (const j of selected) console.log(j.name.padEnd(34) + '  ' + j.why);
  console.log('\n' + selected.length + ' checks.');
  process.exit(0);
}

(async () => {
  const t0 = Date.now();
  process.stderr.write('acceptance: ' + selected.length + ' checks, ' + JOBS + ' at a time, against ' + URL + '\n');
  const q = selected.filter((j) => !SOLO.has(j.name));
  const alone = selected.filter((j) => SOLO.has(j.name));
  const done = [];
  await Promise.all(Array.from({ length: JOBS }, async () => {
    while (q.length) {
      const j = q.shift();
      if (j.kind === 'missing') { done.push({ ...j, red: true, reasons: ['the file is not in tools/scenarios: ' + j.missing], ms: 0 }); continue; }
      if (j.kind === 'lint') {
        const bad = j.lint();
        done.push({ ...j, red: bad.length > 0, code: bad.length ? 1 : 0, ms: 0, reasons: bad });
        process.stderr.write(bad.length ? 'x' : '.');
        continue;
      }
      const r = await run(j.cmd, j.args, ROOT);
      const red = r.code !== 0 || FAIL_LINE.test(r.out) || SCEN_ERROR.test(r.out);
      done.push({ ...j, red, code: r.code, ms: r.ms, reasons: red ? reasons(r.out) : [], out: r.out });
      process.stderr.write(red ? 'x' : '.');
    }
  }));
  /* AND THEN, ON A QUIET MACHINE, THE ONES THAT MEASURE TIME. */
  for (const j of alone) {
    const r = await run(j.cmd, j.args, ROOT);
    const red = r.code !== 0 || FAIL_LINE.test(r.out) || SCEN_ERROR.test(r.out);
    done.push({ ...j, red, code: r.code, ms: r.ms, reasons: red ? reasons(r.out) : [], out: r.out, solo: true });
    process.stderr.write(red ? 'x' : '.');
  }
  process.stderr.write('\n');

  done.sort((a, b) => a.name.localeCompare(b.name));
  const red = done.filter((d) => d.red);

  const W = Math.max(...done.map((d) => d.name.length)) + 2;
  console.log('');
  console.log('=== ACCEPTANCE — the British Empire Atlas ===');
  console.log('url ' + URL + '   ' + done.length + ' checks   ' + ((Date.now() - t0) / 1000).toFixed(0) + 's');
  console.log('');
  for (const d of done) {
    console.log((d.red ? 'RED  ' : 'green') + '  ' + d.name.padEnd(W)
      + String(Math.round(d.ms / 100) / 10 + 's').padStart(7) + '   '
      + (d.solo ? '[alone] ' : '') + d.why);
  }
  if (red.length) {
    console.log('');
    console.log('--- what is red, and what it said ---');
    for (const d of red) {
      console.log('');
      console.log(d.name + '   (exit ' + d.code + ')');
      const rs = d.reasons.length ? d.reasons : ['(no named failure line — read the full report)'];
      rs.slice(0, 8).forEach((r) => console.log('    ' + r));
      if (d.reasons.length > 8) console.log('    … and ' + (d.reasons.length - 8) + ' more');
    }
  }
  console.log('');
  console.log(red.length
    ? '>>> RED — ' + red.length + ' of ' + done.length + ' checks failed: ' + red.map((d) => d.name).join(', ')
    : '>>> GREEN — all ' + done.length + ' checks passed');
  process.exit(red.length ? 1 : 0);
})();
