/**
 * lib/routes.js — ROUTE AWARENESS FOR EVERY ACCEPTANCE SCENARIO.
 *
 * GUARANTEE THIS FILE PROTECTS: no acceptance scenario in this repository may
 * test a route nobody uses.
 *
 * WHY IT EXISTS. Until wave 9 every acceptance scenario in `tools/scenarios/`
 * navigated to a hardcoded `#tour=thirty` — 140 of them still do. `thirty` has
 * not been the default route since wave 8: `tours.json`'s `variantMeta` moved
 * `isDefault` to `period`, and wave 9 moves it again, to the first lesson of a
 * two-lesson unit (DIDACTIC_SPEC §8, amended). A harness that walks a route no
 * student is given is the most dangerous defect this project has, because it
 * makes the build look green while a student meets a broken app. `read.js`
 * asserted the whole of RESPONSIVE_LAW §11 — 113 assertions, all green —
 * against a 25-step path a cold start never runs.
 *
 * SO NOTHING HERE NAMES A ROUTE. Everything is read from the payload the app
 * itself publishes, which is the same payload `tours/budget.js` computes and
 * `tools/check-timing.js` checks every printed minute against:
 *
 *   window.BEA.toursRoutes = { here, default, routes[] }   — per-route figures
 *   window.BEA.toursIndex  = { routes: { <id>: { steps[] } } }  — the step list,
 *          each step carrying { i, step, kind: beat|gate|recall, id, title }.
 *          `step` is the 1-based number `#tour=<id>&step=N` takes.
 *
 * Rename a route, add one, move `isDefault`, change a route's length — and
 * every scenario built on this file follows without an edit.
 *
 * ------------------------------------------------------------------ API ----
 *   await payload(page)          -> { here, default, routes[], index }
 *   await defaultRouteId(page)   -> the id a cold start runs
 *   await routeIds(page)         -> every named route, shortest first
 *   await stepsOf(page, id)      -> that route's flattened step list
 *   sample(steps, n)             -> representative steps BY KIND, not by number
 *   href(url, id, step)          -> the address a teacher's link uses
 *   await open(page, url, id, step) -> go there and wait for ready
 *   Checks()                     -> the PASS/FAIL collector whose finish()
 *                                   THROWS, so a failing rule exits non-zero
 *
 * THE COLLECTOR IS THE OTHER HALF OF THE SAME DEFECT. `p05`, `p06`, `p08`,
 * `p10` and `shell-surface` each printed FAIL lines and exited 0, so a runner
 * that trusts exit codes called them green. `Checks().finish()` throws.
 */

'use strict';

const READY = () => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready';

/** Wait until the app is up AND the tours module has published its payload. */
async function ready(page, timeout = 30000) {
  await page.waitForFunction(READY, null, { timeout });
  await page.waitForFunction(
    () => window.BEA && window.BEA.toursRoutes && window.BEA.toursIndex,
    null, { timeout });
}

/** THE PUBLISHED PAYLOAD, whole. Never re-derived, never retyped. */
async function payload(page) {
  await ready(page);
  const p = await page.evaluate(() => ({
    here: window.BEA.toursRoutes.here,
    default: window.BEA.toursRoutes.default,
    routes: window.BEA.toursRoutes.routes,
    index: window.BEA.toursIndex,
  }));
  if (!p.routes || !p.routes.length) throw new Error('lib/routes: the app published no routes');
  if (!p.default) throw new Error('lib/routes: the app published no default route');
  return p;
}

/** The route a cold start runs — authored once, on the route itself. */
async function defaultRouteId(page) { return (await payload(page)).default; }

/** Every named route, in the order the payload publishes them (shortest first). */
async function routeIds(page) { return (await payload(page)).routes.map((r) => r.id); }

/** One route's whole computed record. */
async function routeFacts(page, id) {
  const p = await payload(page);
  const r = p.routes.find((x) => x.id === id);
  if (!r) throw new Error('lib/routes: no route "' + id + '" — the app publishes ' + p.routes.map((x) => x.id).join(', '));
  return r;
}

/** One route's flattened step list, each { i, step, kind, id, title }. */
async function stepsOf(page, id) {
  const p = await payload(page);
  const r = p.index && p.index.routes && p.index.routes[id];
  if (!r || !r.steps || !r.steps.length) {
    throw new Error('lib/routes: route "' + id + '" publishes no steps');
  }
  return r.steps;
}

/**
 * REPRESENTATIVE STEPS, CHOSEN BY WHAT THEY ARE, NOT BY THEIR NUMBER.
 *
 * `read.js` used to walk [1, 2, 4, 14, 18, 20] because on the 25-step `thirty`
 * those happened to be a poster, a spine, a textual beat, a gate, another
 * textual beat and a choropleth. Every one of those numbers is out of range on
 * `eight` (5 steps) and picks different surfaces on every other route. So the
 * sample is taken by KIND: the opening beat, the second beat, the first gate,
 * the first recall, a beat from the middle, and the last step — which is the
 * set of surfaces §11 actually distinguishes (a mounted beat, a gate that
 * renders no beat panel, a card that renders over one, and the ending).
 * Duplicates collapse; a route with no gate simply contributes no gate.
 */
function sample(steps) {
  const beats = steps.filter((s) => s.kind === 'beat');
  const pick = [];
  const add = (s) => { if (s && !pick.some((x) => x.step === s.step)) pick.push(s); };
  add(beats[0]);
  add(beats[1]);
  add(steps.find((s) => s.kind === 'gate'));
  add(steps.find((s) => s.kind === 'recall'));
  add(beats[Math.floor(beats.length / 2)]);
  add(steps[steps.length - 1]);
  return pick.filter(Boolean).sort((a, b) => a.step - b.step);
}

/** The address a teacher's link uses. `step` is the published 1-based number. */
function href(url, id, step) {
  const base = String(url || 'http://localhost:8777/app/').split('#')[0];
  return base + '#tour=' + id + '&step=' + step;
}

/** Cold-load one step of one route and wait until it is really there. */
async function open(page, url, id, step, settle = 2200) {
  await page.goto(href(url, id, step), { waitUntil: 'load' });
  await ready(page);
  await page.waitForTimeout(settle);
}

/**
 * WHICH ROUTES THIS RUN WALKS.
 *   (nothing)            every named route, default first
 *   --route <id>         that one
 *   --route default      the one a cold start runs
 *   --default-only       the same, spelled as a flag
 * The default-first ordering matters: when a run goes red, the first red line
 * should be about the route a student is actually given.
 */
async function chosen(page, argv = process.argv) {
  const p = await payload(page);
  const all = p.routes.map((r) => r.id);
  const i = argv.indexOf('--route');
  const one = i >= 0 ? argv[i + 1] : (argv.includes('--default-only') ? 'default' : null);
  if (one) {
    const id = one === 'default' ? p.default : one;
    if (!all.includes(id)) throw new Error('lib/routes: no route "' + id + '" — have ' + all.join(', '));
    return [id];
  }
  return [p.default, ...all.filter((x) => x !== p.default)];
}

/**
 * THE COLLECTOR. `t(id, ok, got, want)` records; `finish(title)` prints the
 * tally and THROWS when anything failed, so the process exits non-zero and a
 * runner cannot call a scenario green while it prints FAIL.
 */
function Checks(log) {
  const rows = [];
  const api = {
    t(id, ok, got, want) {
      rows.push({ id, ok: !!ok, got, want });
      log((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
      return !!ok;
    },
    get failures() { return rows.filter((r) => !r.ok); },
    get count() { return rows.length; },
    finish(title) {
      const bad = rows.filter((r) => !r.ok);
      if (!bad.length) { log('>>> ' + title + ' holds — ' + rows.length + ' assertions'); return; }
      log('>>> ' + title.toUpperCase() + ' BROKEN — ' + bad.length + ' of ' + rows.length);
      bad.forEach((r) => log('    FAIL ' + r.id + '  got ' + r.got + '  (' + r.want + ')'));
      const e = new Error(title + ': ' + bad.length + ' of ' + rows.length + ' assertions failed\n'
        + bad.map((r) => '  FAIL ' + r.id + '  got ' + r.got + '  (want ' + r.want + ')').join('\n'));
      e.acceptance = bad;
      throw e;
    },
  };
  return api;
}

module.exports = { ready, payload, defaultRouteId, routeIds, routeFacts, stepsOf, sample, href, open, chosen, Checks };
