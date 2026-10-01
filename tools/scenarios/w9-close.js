/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `w9-close`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: DIDACTIC_SPEC §8.4, the Close rule, on EVERY
 * lesson the app publishes — each lesson signs its own through-line at its own
 * Close, names the other lesson as a subject rather than a deficit, and greys
 * nothing, because grey lines belong to the unit Close.
 *
 * ROUND 2 OF WAVE 9 REWROTE THIS FILE, and the reason is the point of the
 * wave. It used to navigate to `#tour=period&step=10` — a route `variantMeta`
 * marks `retired` and `routeIds` no longer offers — press Finish, log the
 * lines, take a screenshot and return. It contained NO ASSERTION: grep it for
 * `ok(` or `FAIL` and you found nothing, so it could not go red, and
 * `tools/acceptance.js` reported it green beside the sentence "each lesson
 * signs its own through-line at its own Close". Nothing in the suite tested
 * that sentence, and the defect it names — both lesson Closes drawing all
 * fourteen lines with eight greyed, which §8.4(3) and (4) forbid by name —
 * shipped past it twice.
 *
 * It also has to WALK the lesson rather than deep-link into its last step.
 * Every rule in §8.4 is about a student who did the lesson; a Close reached by
 * deep link correctly reports an empty record and greys everything, and
 * asserting against that would have been the same mistake in a new place.
 */
const routes = require('./lib/routes.js');
const walker = require('./lib/walk.js');

/* §8.4(1): the first sentence is an achievement. These are what it may not be. */
const NOT_AN_ACHIEVEMENT = [/\d+\s*%/, /\b\d+\s+of\s+\d+\b/, /\bprogress\b/i, /\bcomplete[d]?\s*:/i];
/* §8.4(5): banned in the slot that names the other lesson. */
const DEFICIT = [/\bincomplete\b/i, /\bunfinished\b/i, /\byou missed\b/i, /\bremaining\b/i,
  /\bleft to go\b/i, /\d+\s*%/];

module.exports = async ({ page, shot, log }) => {
  const url = 'http://localhost:8777/app/';
  const C = routes.Checks(log);

  await page.goto(url, { waitUntil: 'load' });
  const pay = await routes.payload(page);
  /* WHICH ROUTES ARE LESSONS IS THE APP'S ANSWER, NOT THIS FILE'S. A lesson is
     a route that names a partner (§8.4(5) has nothing to say to a route that
     stands alone), and the default must be one of them. */
  const lessons = pay.routes.filter((r) => r.pairs && !r.retired).map((r) => r.id);
  C.t('W0 the app publishes a two-lesson unit', lessons.length === 2, lessons.join(', ') || 'none',
    'exactly two routes name each other as a pair — DIDACTIC_SPEC §8');
  C.t('W0b the default is one of them', lessons.includes(pay.default), pay.default,
    'a cold start runs a lesson');

  for (const id of lessons) {
    const r = pay.routes.find((x) => x.id === id);
    const pairLabel = (pay.routes.find((x) => x.id === r.pairs) || {}).label || r.pairs;
    log('');
    log('--- walking ' + id + ' (' + r.label + ') end to end, on a clean record ---');
    const run = await walker.walk(page, url, id, log);
    C.t(id + ' W1 the walk reaches the Close', run.closed, 'closed=' + run.closed + ' after ' + run.steps + ' steps',
      'a student who presses Next to the end gets an ending');
    if (!run.closed) continue;

    const m = await page.evaluate(() => {
      const root = document.querySelector('.cl-close') || document.body;
      const txt = (root.innerText || '').replace(/\s+/g, ' ');
      const lines = [...root.querySelectorAll('.cl-line')].map((l) => ({
        n: Number((l.querySelector('.cl-line__n') || {}).textContent || 0),
        grey: !!l.querySelector('.cl-line__missing'),
        offroute: /not on this route/i.test(l.innerText || ''),
      }));
      /* THE THROUGH-LINE HAS TWO RENDERINGS AND BOTH ARE THE SAME SENTENCE.
         `.cl-blk` — the spine at the foot of the panel scroller — exists only
         at `data-foot="off"`; otherwise the line is `.cl-say` with
         `.cl-say__blank` / `.cl-say__filled`. Reading only the first returned
         -1 at every viewport this suite runs. Both stand OUTSIDE `.cl-close`
         — the spine sits at the foot of the panel scroller, not inside the
         Close's own scroll region — so this is asked of the document. */
      const blk = document.querySelector('.cl-blk');
      const gaps = blk ? blk.querySelectorAll('.cl-blk__gap').length
        : document.querySelectorAll('.cl-say__blank').length;
      const filled = blk ? blk.querySelectorAll('.cl-blk__filled').length
        : document.querySelectorAll('.cl-say__filled').length;
      return {
        txt,
        head: (root.querySelector('.cl-close__finished, .cl-close__which') || {}).innerText || '',
        lines, grey: lines.filter((l) => l.grey).length, offroute: lines.filter((l) => l.offroute).length,
        gaps, filled,
        sign: !!root.querySelector('.cl-sign__field'),
        through: (root.querySelector('.cl-blk, .cl-say') || {}).innerText || '',
        argue: /go argue with/i.test(txt),
        books: root.querySelectorAll('.cl-book, .cl-read__b, .cl-argue__b').length,
        unit: /finished the whole unit/i.test(txt),
        pairMentions: [...root.querySelectorAll('button, a')].map((b) => (b.textContent || '').trim()),
      };
    });
    await shot(id + '-close');
    log(id + ' close: ' + JSON.stringify({ lines: m.lines.length, grey: m.grey, offroute: m.offroute,
      gaps: m.gaps, filled: m.filled, sign: m.sign, unit: m.unit }));
    log(id + ' head: ' + JSON.stringify(String(m.head).replace(/\s+/g, ' ').slice(0, 160)));

    /* §8.4(1) — it opens by naming what was finished, in words. */
    C.t(id + ' W2 §8.4(1) it opens by naming the lesson', /finish/i.test(m.head) && m.head.includes(r.label.split(':')[0]),
      JSON.stringify(String(m.head).replace(/\s+/g, ' ').slice(0, 90)),
      'the lesson\'s own name, as an achievement');
    const bad1 = NOT_AN_ACHIEVEMENT.filter((re) => re.test(m.head));
    C.t(id + ' W3 §8.4(1) and not as a fraction', bad1.length === 0,
      bad1.map(String).join(' ') || 'no percentage, no n-of-m, no meter',
      'never a percentage, never "9 of 20", never a bar with an unfilled remainder');

    /* §8.4(3) — this lesson's OWN through-line, signable. */
    C.t(id + ' W4 §8.4(3) a through-line to sign', m.sign, 'sign field=' + m.sign,
      'the sentence printed in §8 under THIS lesson, in the student\'s own words');
    C.t(id + ' W5 §8.4(3) every blank of it filled by the walk', m.gaps === 0 && m.filled > 0,
      m.filled + ' filled, ' + m.gaps + ' still blank',
      'a student who walked the lesson can complete its own sentence');

    /* §8.4(4) — GREY LINES BELONG TO THE UNIT CLOSE. This is the one that
       shipped: both lesson Closes drew all fourteen §2.3 lines and greyed the
       other lesson's six with a price in seconds. Unless the unit Close has
       fired — which §8.4(7) says is the one surface where grey is true — a
       lesson's Close greys nothing. */
    if (!m.unit) {
      C.t(id + ' W6 §8.4(4) a lesson Close greys nothing', m.grey === 0,
        m.grey + ' of ' + m.lines.length + ' lines greyed',
        'lines ' + m.lines.filter((l) => l.grey).map((l) => l.n).join(', ')
        + ' — "Inside a lesson, a line this lesson was never going to reach is not a gap '
        + 'in the student\'s work and must not be drawn as one"');
      C.t(id + ' W7 §8.4(3) it does not show §2.3 with the other half greyed', m.offroute === 0,
        m.offroute + ' lines marked NOT ON THIS ROUTE',
        '§2.3 entire belongs to the unit Close');
      C.t(id + ' W8 §8.4(3) it shows only the lines its own through-line spans',
        m.lines.length > 0 && m.lines.length < 14, m.lines.length + ' lines',
        'fewer than the unit\'s fourteen');
    } else {
      log(id + ' — the unit Close fired (§8.4(7)); grey is true here and W6..W8 do not apply');
      C.t(id + ' W6u §8.4(7) the unit Close completes §2.3 entire', m.lines.length >= 14,
        m.lines.length + ' lines', 'all fourteen, once both lessons are in the record');
    }

    /* §8.4(5) — the other lesson, as a subject, with a control that starts it. */
    const namesPair = m.txt.includes(pairLabel) || m.txt.includes(String(pairLabel).split(':')[0]);
    C.t(id + ' W9 §8.4(5) it names the other lesson', namesPair, namesPair ? pairLabel : 'not named',
      'the other lesson named as a subject');
    const starter = m.pairMentions.some((t) => new RegExp('start|open|go to', 'i').test(t)
      && new RegExp(String(pairLabel).split(':')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(t));
    C.t(id + ' W10 §8.4(5) with a control that starts it', starter,
      starter ? 'present' : JSON.stringify(m.pairMentions.filter((t) => /lesson/i.test(t)).slice(0, 4)),
      'a control that starts the other lesson');
    /* The banned words are banned IN THAT SLOT, so read the sentence that
       names the pair rather than the whole panel. */
    const slot = (() => {
      const i = m.txt.indexOf(String(pairLabel).split(':')[0]);
      return i < 0 ? '' : m.txt.slice(Math.max(0, i - 160), i + 240);
    })();
    const bad5 = DEFICIT.filter((re) => re.test(slot));
    C.t(id + ' W11 §8.4(5) and not as a deficit', bad5.length === 0,
      bad5.map(String).join(' ') || 'no deficit word in that sentence',
      'banned: incomplete, unfinished, you missed, remaining, left to go, any percentage');

    /* §8.4(9) — it ends where it always ended. */
    C.t(id + ' W12 §8.4(9) three things to go argue with', m.argue, 'present=' + m.argue,
      '"Three things you could go argue with. Here\'s where to start."');
  }

  C.finish('§8.4, the Close rule, on every lesson');
};
