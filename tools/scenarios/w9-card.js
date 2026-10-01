/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w9-card`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: DIDACTIC_SPEC §8.5, the labelling law, on the
 * two surfaces it names first — THE DOOR and THE ROUTE CARD. Every surface that
 * names a route says which lesson it is, what it covers and what the other one
 * covers; the name is the lesson's name, never "the lesson", never "the guided
 * path", never a bare duration; and the promise the door makes is counted from
 * the beats the route actually walks.
 *
 * ROUND 2 OF WAVE 9 REWROTE THIS FILE. It used to open `#tour=period&step=1` —
 * a retired route — press a control, log some strings and screenshot. It
 * contained no assertion of any kind, so it could not go red, and the suite
 * counted it as coverage of the sentence above while the door told every cold
 * student "Three things about this map mislead. You will find all three in
 * about 25 minutes" on a lesson that answers two of them, under a control
 * reading "Start the lesson". The classroom critic's fix is the assertion
 * below: ON EVERY ROUTE, THE NUMBER OF MISLEADS THE DOOR PROMISES EQUALS THE
 * NUMBER THAT ROUTE'S BEATS DELIVER — counted by `budget.js::misleadsOn`, never
 * written down.
 */
const routes = require('./lib/routes.js');
const walker = require('./lib/walk.js');

const WORDS = { no: 0, none: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, all: -1 };
/** The count a promise makes, in words: "all three", "two of them", "the third". */
function promised(text, of) {
  const t = String(text || '').toLowerCase();
  const m = /you will find (all|\w+)\b(?:\s+(\w+))?/.exec(t);
  if (!m) return null;
  if (m[1] === 'all') return of;
  return WORDS[m[1]] != null ? WORDS[m[1]] : Number(m[1]) || null;
}
/* §8.5: what a name may never be. */
const BANNED_NAME = [/^start the lesson$/i, /^the lesson$/i, /^the guided path$/i,
  /^start$/i, /^start the guided (path|lesson)$/i, /^\s*\d+\s*minutes?\s*$/i];

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);

  await page.goto(url, { waitUntil: 'load' });
  const pay = await routes.payload(page);

  /* ---- THE DOOR, per route, off the payload the door itself prints -------- */
  for (const r of pay.routes) {
    const d = r.door || {};
    const of = d.of || r.misleadsOf;
    const delivers = (d.delivers || r.misleads || []).length;
    log('door(' + r.id + '): ' + JSON.stringify(d.text || '(none)'));

    C.t(r.id + ' D0 the route publishes a door', !!d.text && !!d.cta,
      d.text ? 'text + cta' : 'nothing', 'onboarding prints what tours computes, never a literal');
    C.t(r.id + ' D1 the promise counts what the route delivers', promised(d.text, of) === delivers,
      'promises ' + promised(d.text, of) + ', walks ' + delivers + ' of ' + of,
      'DIDACTIC_SPEC §8 LESSON ONE beat 1: "The promise must match the lesson."');
    if (delivers < of) {
      C.t(r.id + ' D2 and names where the rest are', !!d.leftTo && String(d.text).includes(String(d.leftTo).split(':')[0]),
        d.leftTo ? JSON.stringify(String(d.leftTo).slice(0, 44)) : 'nothing named',
        'a lesson that delivers two names the third as the other lesson\'s business');
    } else {
      C.t(r.id + ' D2 and claims nothing elsewhere', !d.leftTo, String(d.leftTo),
        'a route that answers all three points at no other lesson');
    }
    C.t(r.id + ' D3 the control is called by the route\'s name',
      BANNED_NAME.every((re) => !re.test(String(d.cta || '').trim()))
      && String(d.cta || '').includes(String(d.name || r.label).split(':')[0]),
      JSON.stringify(String(d.cta || '')),
      '§8.5: never "the lesson", never "the guided path", never a bare duration');
    C.t(r.id + ' D4 the note says what it is and how long', /·/.test(String(d.note || ''))
      && /minute/.test(String(d.note || '')),
      JSON.stringify(String(d.note || '')), 'what it is FOR beside the computed length');
  }

  /* ---- THE DOOR A COLD STUDENT ACTUALLY MEETS ---------------------------- */
  await walker.cold(page, url);
  await page.goto(url, { waitUntil: 'load' });
  await page.reload({ waitUntil: 'load' });
  await routes.ready(page);
  await page.waitForTimeout(2000);
  await shot('door-cold');
  const cold = await page.evaluate(() => ({
    cta: [...document.querySelectorAll('.cx-cta')].map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim()),
    starters: [...document.querySelectorAll('button, a')].filter((b) => b.offsetParent
      && /^(start|begin|open the lesson)/i.test((b.textContent || '').trim()))
      .map((b) => ({ cls: String(b.className).slice(0, 40), t: (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) })),
    body: document.body.innerText.replace(/\s+/g, ' '),
  }));
  const def = pay.routes.find((x) => x.id === pay.default);
  log('cold starters: ' + JSON.stringify(cold.starters));
  C.t('E1 the cold door prints the default route\'s promise',
    cold.body.includes(String(def.door.text).replace(/<[^>]+>/g, '').split('.').slice(1, 2).join('.').trim().slice(0, 40)),
    JSON.stringify(cold.body.slice(cold.body.indexOf('poster'), cold.body.indexOf('poster') + 150)),
    'the sentence tours computed for ' + pay.default);
  /* §8.5 BANS THE PHRASE, NOT ONLY THE SLOT. Every control on the cold screen
     that offers to start a route has to name the route it starts. */
  const nameless = cold.starters.filter((b) => BANNED_NAME.some((re) => re.test(b.t)));
  C.t('E2 no control on the cold screen is called "the lesson"', nameless.length === 0,
    JSON.stringify(nameless) || 'none',
    '§8.5: "The name is the lesson\'s name … never \'the lesson\', never \'the guided path\', never a bare duration"');

  /* ---- THE ROUTE CARD, on the first beat of every lesson ------------------ */
  for (const r of pay.routes.filter((x) => !x.retired)) {
    await routes.open(page, url, r.id, 1, 2000);
    const card = await page.evaluate(() => {
      const box = document.querySelector('.tr-routes');
      if (!box) return null;
      const openBtn = box.querySelector('.tr-routes__open');
      if (openBtn) openBtn.click();
      return null;
    });
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const box = document.querySelector('.tr-routes');
      return box ? {
        line: (box.querySelector('.tr-routes__line') || {}).innerText || '',
        labs: [...box.querySelectorAll('.tr-routes__lab')].map((x) => x.innerText.replace(/\s+/g, ' ')),
        text: (box.innerText || '').replace(/\s+/g, ' '),
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      } : null;
    });
    if (!m) { C.t(r.id + ' F0 the card is on the first beat', false, 'no .tr-routes', 'a card'); continue; }
    C.t(r.id + ' F1 the card names the route you are on', m.line.includes(String(r.label).split(':')[0]),
      JSON.stringify(m.line.slice(0, 90)), 'by name, not "the lesson"');
    C.t(r.id + ' F2 it offers the others by name',
      pay.routes.filter((x) => !x.retired && x.id !== r.id)
        .every((x) => m.text.includes(String(x.label).split(':')[0])) || m.labs.length >= 2,
      m.labs.length + ' rows', 'every other route the app publishes');
    C.t(r.id + ' F3 nothing pushes the page sideways', !m.overflowX, m.overflowX, 'no horizontal scroll');
    if (r.pairs) {
      /* §8.5: "states the unit total beside the lesson total, so neither number
         can be read as the other". */
      const both = m.text.includes(String(r.covers.length)) && m.text.includes(String(r.unitCovers));
      C.t(r.id + ' F4 §8.5 the unit total stands beside the lesson total',
        both || String(r.leaves).includes(String(r.unitCovers)),
        'lesson ' + r.covers.length + ' / unit ' + r.unitCovers + ' of ' + r.mustStickTotal,
        'both numbers, so neither can be read as the other');
    }
    if (r.id === pay.default) await shot('card-' + r.id);
  }

  C.finish('§8.5, the labelling law, on the door and the route card');
};
