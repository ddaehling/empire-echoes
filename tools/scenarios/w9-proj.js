/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w9-proj`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: DIDACTIC_SPEC §8, LESSON ONE beat 2 — the
 * PROJECTION mislead is DELIVERED on the path, not merely named: "The map
 * redraws once in equal-area with one sentence saying so — the projection
 * mislead, delivered rather than named — and Mercator is restored on the next
 * beat." And its converse: a route that does not promise that mislead does not
 * quietly deliver it either, because the door's promise is counted from the
 * beats (`budget.js::misleadsOn`) and a promise nobody can check is a slogan.
 *
 * ROUND 2 OF WAVE 9 REWROTE THIS FILE. It used to walk steps 1, 2 and 3 of
 * `#tour=period` — a retired route — and LOG the projection at each. No
 * assertion, no failure path, and the route it walked is one no student is
 * given. The step numbers were `period`'s and mean something different on every
 * other route, which is why nothing here names a step: the beat that carries
 * the mislead is found by asking the authored record which beat carries it, and
 * the route index says which step that beat is on.
 */
const routes = require('./lib/routes.js');

const PROJECTION = 'what projection it is';

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);
  await page.goto(url, { waitUntil: 'load' });
  const pay = await routes.payload(page);

  /* WHICH BEAT CARRIES WHICH MISLEAD IS AUTHORED, NOT GUESSED. Read it from
     the same document `budget.js::misleadsOn` counts. */
  const beats = await page.evaluate(async () => {
    const r = await fetch('js/tours/tours.json');
    const doc = await r.json();
    return (doc.beats || []).filter((b) => b.mislead).map((b) => ({ id: b.id, mislead: b.mislead }));
  });
  const carrier = beats.find((b) => b.mislead === PROJECTION);
  C.t('P0 a beat carries the projection mislead', !!carrier,
    carrier ? carrier.id : 'no beat declares "' + PROJECTION + '"',
    'one authored beat, named on its own record');
  if (!carrier) { C.finish('the projection mislead, delivered'); return; }

  /* WHERE THE SENTENCE ACTUALLY IS. `tours.json`'s own `$proj` note says it:
     "map/index.js calls this projection 'equal-earth' and its own byline calls
     it 'equal-area'; the panel uses the byline's word." So the claim lives in
     two places and both are read — the beat's prose, which is the sentence the
     student reads, and the legend byline's projection field, which is the
     plate's own declaration of what it is drawn in. */
  const proj = () => page.evaluate(() => {
    const m = (window.BEA && window.BEA.map) || {};
    return {
      p: m.projection || null,
      says: (document.querySelector('.tr-panel__body, .tr-panel') || {}).innerText || '',
      field: (document.querySelector('.byline__value[data-field="projection"]') || {}).textContent || '',
    };
  });

  for (const r of pay.routes.filter((x) => !x.retired)) {
    const steps = await routes.stepsOf(page, r.id);
    const at = steps.find((s) => s.id === carrier.id);
    const promises = (r.misleads || []).includes(PROJECTION);
    log('');
    log(r.id + ': promises the projection mislead = ' + promises
      + (at ? ', carried at step ' + at.step + ' of ' + steps.length : ', beat not on this route'));

    C.t(r.id + ' P1 the promise and the route agree', promises === !!at,
      'promises=' + promises + ' carries=' + !!at,
      'a route promises exactly the misleads its own beats deliver');
    if (!at) continue;

    await routes.open(page, url, r.id, at.step, 3000);
    const on = await proj();
    await shot(r.id + '-reveal');
    C.t(r.id + ' P2 the map is redrawn equal-area on that beat',
      !!on.p && !/mercator/i.test(on.p), String(on.p),
      'the mislead delivered, not named — an equal-area projection on screen');
    C.t(r.id + ' P3 and a sentence says so', /equal[- ]area|equal[- ]earth/i.test(on.says),
      JSON.stringify(String(on.says).replace(/\s+/g, ' ').slice(0, 110)),
      'the beat says the map just redrew, and in what');
    /* THE PLATE'S OWN DECLARATION, WHERE THE PLATE IS DECLARING ANYTHING. The
       legend byline is not mounted on every beat at every window, and asserting
       a surface that is legitimately absent turns a check into noise. Where it
       IS on screen it must agree with the renderer — a byline saying Mercator
       over an equal-area map is the contradiction this suite exists for. */
    if (String(on.field).trim()) {
      C.t(r.id + ' P3b the plate\'s byline agrees with the renderer', /equal/i.test(on.field),
        JSON.stringify(on.field), 'the byline names what the renderer is drawing');
    } else log(r.id + ' P3b — no byline projection field on screen at this beat; nothing to contradict');

    const next = steps.find((s) => s.step === at.step + 1);
    if (next) {
      await routes.open(page, url, r.id, next.step, 3000);
      const after = await proj();
      C.t(r.id + ' P4 Mercator is restored on the next beat', /mercator/i.test(String(after.p)),
        String(after.p),
        'tours.json\'s own $proj note: "Mercator is restored on the next beat of every route … '
        + 'because the rest of this atlas\'s plate geometry — label collision, the fly-to zooms, '
        + 'the peek strip — is calibrated for mercator, and because the demonstration is the point '
        + 'rather than a change of house projection"');
    }
  }

  /* AND THE CONVERSE. A route that promises nothing about the projection must
     never sit on an equal-area map at its first beat, or the promise is a
     description of the file rather than of the lesson. */
  for (const r of pay.routes.filter((x) => !x.retired && !(x.misleads || []).includes(PROJECTION))) {
    await routes.open(page, url, r.id, 1, 2400);
    const p = (await proj()).p;
    C.t(r.id + ' P5 opens on the map the poster lies with', /mercator/i.test(String(p)), String(p),
      'a route that does not answer the projection mislead does not pre-empt it either');
  }

  C.finish('the projection mislead, delivered on the path');
};
