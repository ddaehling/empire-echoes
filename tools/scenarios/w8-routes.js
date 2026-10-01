/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w8-routes` AND as `routes/default`,
 * the FIRST check `node tools/acceptance.js` runs; the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: every route publishes its own arithmetic, and
 * exactly one is the default — so that every other scenario in this suite can
 * discover the route a student is really given instead of naming one.
 *
 * ROUND 2 OF WAVE 9 GAVE THIS FILE ITS ASSERTIONS. Its own docstring used to
 * say, in as many words, "Nothing is asserted here; the app is asked" — while
 * `tools/acceptance.js` ran it first, before everything else, under the
 * sentence above. Meanwhile `variantMeta.period` still carried `isDefault: true`
 * beside `lesson-one` and the right answer came back only because of the order
 * of the keys in a JSON file. A check that cannot fail cannot protect a
 * precondition.
 */
const routes = require('./lib/routes.js');

module.exports = async ({ page, log, shot }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);
  await page.goto(url, { waitUntil: 'load' });
  const pay = await routes.payload(page);

  log('default route on this build: ' + pay.default);
  for (const r of pay.routes) {
    log([
      r.id.padEnd(11),
      String(r.steps).padStart(3) + ' steps',
      'fast ' + String(r.minutesExact).padStart(3) + 'm',
      'slow ' + String(r.minutesExactMax).padStart(3) + 'm',
      'card "' + (r.minutesSay || '') + '"',
      'one number ' + r.minutes,
      'cps ' + r.checkpoints, 'figs ' + r.figures,
      'grey ' + (r.greyLines || []).length,
      r.retired ? 'RETIRED' : '',
      r.for ? ('for: ' + r.for) : '',
      r.covers ? ('T ' + r.covers.length + '/' + r.mustStickTotal
        + ' taught +' + ((r.recalled || []).length) + ' recalled') : '',
    ].filter(Boolean).join(' | '));
  }

  /* --- the precondition every other scenario stands on -------------------- */
  const claim = pay.routes.filter((r) => r.isDefault).map((r) => r.id);
  C.t('A1 exactly one route claims isDefault', claim.length === 1, claim.join(', ') || 'none',
    'budget.js\'s own contract: "true on exactly one route"');
  C.t('A2 the published default is that route', pay.default === claim[0],
    pay.default + ' vs ' + claim[0], 'the payload and the flag agree');
  C.t('A3 the default is not retired', !(pay.routes.find((r) => r.id === pay.default) || {}).retired,
    String((pay.routes.find((r) => r.id === pay.default) || {}).retired),
    'a cold start may not run a superseded route');
  C.t('A4 the index publishes steps for the default',
    !!(pay.index.routes && pay.index.routes[pay.default] && pay.index.routes[pay.default].steps.length),
    (pay.index.routes[pay.default] || { steps: [] }).steps.length + ' steps',
    'route-aware scenarios need a step list to sample');

  /* --- every route's arithmetic is published, and it is arithmetic --------- */
  for (const r of pay.routes) {
    C.t(r.id + ' B1 both reading rates are published',
      Number.isFinite(r.minutesExact) && Number.isFinite(r.minutesExactMax)
      && r.minutesExactMax >= r.minutesExact,
      r.minutesExact + '/' + r.minutesExactMax, 'fast <= slow, both computed');
    C.t(r.id + ' B2 the step count is real', r.steps > 0 && r.beats > 0,
      r.steps + ' steps / ' + r.beats + ' beats', '> 0');
    C.t(r.id + ' B3 coverage is counted, not claimed',
      Array.isArray(r.covers) && Number.isFinite(r.mustStickTotal) && r.mustStickTotal > 0,
      (r.covers || []).length + ' of ' + r.mustStickTotal, 'from tours.json, via mustStick()');
  }

  /* --- and the card offers only what a student may run --------------------- */
  await routes.open(page, url, pay.default, 1, 1800);
  await page.evaluate(() => { const b = document.querySelector('.tr-routes__open'); if (b) b.click(); });
  await page.waitForTimeout(400);
  const shown = await page.evaluate(() => [...document.querySelectorAll('.tr-routes__lab, .tr-routes__row')]
    .map((r) => r.innerText.replace(/\s+/g, ' ')));
  for (const r of shown) log('row: ' + r);
  const retired = pay.routes.filter((r) => r.retired);
  const leaked = retired.filter((r) => shown.some((s) => s.includes(r.label)));
  C.t('C1 no retired route is offered', leaked.length === 0,
    leaked.map((r) => r.id).join(', ') || 'none of ' + retired.length + ' retired routes',
    'retirement changes the offer, not the arithmetic');
  /* NOT "every route" — the card is allowed to curate, and it offers three:
     this lesson, its partner and the full route. What it may NOT do is offer a
     route the payload does not publish, and what it must do is offer the other
     half of the unit (§8.4(5), §8.5) and a way to take the whole thing in one
     sitting (§8, THE FULL ROUTE). */
  const here = pay.routes.find((r) => r.id === pay.default);
  const pairLabel = (pay.routes.find((r) => r.id === here.pairs) || {}).label || '';
  C.t('C2 the card offers the other half of the unit',
    !!pairLabel && shown.some((s) => s.includes(String(pairLabel).split(':')[0])),
    JSON.stringify(pairLabel), '§8.4(5): the other lesson, named, with a way in');
  C.t('C3 and a full route for one sitting',
    shown.some((s) => pay.routes.some((r) => !r.pairs && r.steps > here.steps && s.includes(r.label))),
    shown.length + ' rows', 'the whole unit end to end is on offer');
  const invented = shown.filter((s) => /^YOU ARE ON/.test(s) ? false
    : !pay.routes.some((r) => s.includes(String(r.label).split(':')[0])));
  C.t('C4 and nothing the app does not publish', invented.length === 0,
    JSON.stringify(invented.map((s) => s.slice(0, 40))) || 'none',
    'every row on the card is a route in the payload');
  await shot('routes');
  C.finish('the route payload — one default, and arithmetic on every route');
};
