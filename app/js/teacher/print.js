/**
 * teacher/print.js — the printable pack.
 *
 * FEATURE_SPEC §1 charge 14 is conceded, and the honest containment is stated
 * in the Methods panel: the permanent objects here are the printed ones. So
 * these sheets have to be genuinely good on paper, not a screenshot of an
 * interface.
 *
 * MECHANICS. A print builds one `.tp-paper` element and appends it to <body>.
 * On screen it is `display: none`; in print it is the only thing that is not.
 * The rule that does the hiding is guarded by `body:has(> .tp-paper)`, so
 * printing any other part of this app is completely unaffected by this file.
 * The content version is in a `position: fixed` footer, which Chrome and Safari
 * repeat on every printed page — that is FEATURE_SPEC P20 acceptance test 5,
 * and it is why the version is not simply printed once at the top.
 *
 * The map sheet uses the atlas's own canvas, read with `toDataURL()`. It is a
 * picture of what the app was drawing a second earlier: no re-projection, no
 * re-colouring, nothing generated for print that was not on the screen.
 */

import { el, fill } from '../core/util.js';
import { QUESTIONS } from './questions.js';
import { lessonLink, lessonLastChange, lessonAsk, boardPlan, runStartSays } from './classroom.js';
import { beatStep, routeFacts, segmentPlan, segmentsOf, boardOf, planOf, lessonNo, LESSONS, UNIT_SENTENCE } from './pack.js';
import { routeOf } from './timing.js';
import { fmt, resolveYearLink } from './parts.js';
import { storage } from '../core/util.js';
import { MOVE_INDEX, SCOPE_CLAIM, WORKSHOP_STORE_KEY } from './workshop.js';
import { pathPicks } from './path.js';
import { PORTABLE_CASES, PORTABLE_CLAIM, PORTABLE_STORE_KEY } from './portable.js';
import { planSheet, taskSheet, keySheet } from './sheets.js';

/**
 * THE MAP SHEET AND THE LAMPLIT THEME.
 *
 * The map sheet is a photograph of the atlas's own canvas, and in the lamplit
 * theme that canvas is near-black. Measured by printing it with the app in
 * lamplit: 60% of the A4 is a solid dark rectangle, and unlike a background
 * colour an <img> prints whether or not the teacher has background graphics
 * switched on. So the one sheet that is a picture asks the atlas to draw
 * itself in its paper colours first, takes the picture, prints, and puts the
 * screen back exactly as it was. Nothing else about the drawing changes — same
 * year, same projection, same zoom, same layer — and the caption says which
 * colours it was drawn in, because the caption's whole claim is that the sheet
 * shows what the screen showed.
 */
export function printPack(pack, corpus, ctx) {
  const id = (pack && pack.id) || 'board';
  if (id === 'map' && lamplitNow(ctx) && ctx && ctx.store) return printMapOnPaper(pack, corpus, ctx);
  return renderAndPrint(id, pack, corpus, ctx, {});
}

function lamplitNow(ctx) {
  try {
    const t = ctx && ctx.store ? ctx.store.getState().theme : 'auto';
    if (t === 'lamplit') return true;
    if (t === 'paper') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (_) { return false; }
}

async function printMapOnPaper(pack, corpus, ctx) {
  const was = ctx.store.getState().theme;
  ctx.store.dispatch('setTheme', 'paper');
  /* Two frames plus a beat. Measured: the canvas is fully repainted 120ms
     after the theme changes (mean luminance 30 -> 212 over the north-west
     quarter of the canvas); this waits longer than that, because a picture
     taken too early is a dark picture rather than a missing one. */
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise(r => setTimeout(r, 240));
  try { renderAndPrint('map', pack, corpus, ctx, { recoloured: true }); }
  finally { ctx.store.dispatch('setTheme', was); }
}

function renderAndPrint(id, pack, corpus, ctx, opts) {
  const old = document.querySelector('.tp-paper');
  if (old && old.parentNode) old.parentNode.removeChild(old);

  const body = build(id, pack, corpus, ctx, opts || {});

  /* THE RUNNING FOOTER IS A `tfoot`, NOT A FIXED ELEMENT.
     It used to be `position: fixed; bottom: 0`, which Chrome repeats on every
     printed page — the mechanism FEATURE_SPEC P20 acceptance test 5 asks for —
     but places against the bottom of the page CONTENT box, over whatever text
     reached it. Measured on the answer key: page one printed "Ticking
     'invaded' and 'settled'." straight through the version line. Pushing the
     footer down into the page margin does not work either; Chrome clips fixed
     content to the content box, and at -9mm the footer vanished from every
     page — also measured, on the same sheet.
     A `tfoot` repeats on every page AND reserves its own height in every
     page's flow, so nothing can be printed underneath it. The sheet is one
     single-column table: the head cell prints once at the top of the tbody,
     the footer repeats. */
  const paper = el('div.tp-paper', { role: 'document', 'aria-hidden': 'true' },
    el('table.tp-paper__sheet',
      el('tfoot.tp-paper__foot',
        el('tr', el('td',
          el('span.tp-paper__v', corpus.version.string),
          el('span.tp-paper__url', linkFor(ctx, id))))),
      el('tbody', el('tr', el('td.tp-paper__cell',
        el('header.tp-paper__head',
          el('p.tp-paper__title', 'The British Empire — an interactive atlas'),
          el('p.tp-paper__pack', body.title)),
        el('main.tp-paper__body', body.node))))));

  document.body.appendChild(paper);
  try { window.print(); } catch (_) { /* a browser that will not print is not our bug to fix */ }
}

/* -------------------------------------------------- the running footer --
 *
 * WHAT THE FOOTER USED TO PRINT, AND WHY IT WAS WRONG.
 * `location.href`. On the machine that printed the pack that is a true
 * address; in a departmental folder it is "http://localhost:8777/app/…" on
 * seventeen sheets, which round three's head of history called correctly — "a
 * dead address on somebody else's machine". It was also the SAME address on
 * every sheet, because it was whatever the desk happened to be showing: a
 * student task sheet carried `#panel=classroom`, a surface for teachers.
 *
 * So the footer now prints two things it can defend. The dataset stamp on the
 * left, unchanged. On the right, the deep link for THIS SHEET'S OWN SUBJECT —
 * the task sheets carry the start of the route the tasks are timed to, the
 * ledger carries the ledger, the map sheet carries the state it is a picture
 * of — as a FRAGMENT, which is the part of the address that does not depend on
 * whose machine the atlas is on. If the atlas is being served from a real host
 * the origin is printed with it, because then the whole line is a live address
 * worth typing; from localhost or from a file it is not, and it is left off.
 */

/* Localhost is not an address anybody else can type. */
function deployedBase() {
  try {
    const l = window.location;
    if (!l || l.protocol === 'file:') return null;
    const h = l.hostname || '';
    if (!h || h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]'
      || /\.local$/i.test(h) || /^0\.0\.0\.0$/.test(h)) return null;
    return l.origin + l.pathname;
  } catch (_) { return null; }
}

/* The fragment for the state the map sheet is a picture of — the MAP's state
   and nothing else. Four of the ten deep-link keys describe the desk or the
   machine rather than the map (`panel`, `theme`, `motion`, `q`), and printing
   them puts a teacher back on this desk instead of on the map they printed.
   `theme` is the sharpest case: the map sheet sets the paper theme to take its
   picture, so leaving the key in stamped `&theme=paper` on the footer of a
   sheet whose whole point is the map. */
const MAP_KEYS = ['year', 'sel', 'layer', 'compare', 'filter', 'view'];

function stateFragment(ctx) {
  try {
    const href = ctx && ctx.url && ctx.url.share ? ctx.url.share() : window.location.href;
    const i = String(href).indexOf('#');
    if (i < 0) return null;
    const parts = String(href).slice(i + 1).split('&')
      .filter(kv => MAP_KEYS.includes(kv.split('=')[0]));
    return parts.length ? '#' + parts.join('&') : null;
  } catch (_) { return null; }
}

function fragmentFor(raw, ctx) {
  const { id, n } = splitId(raw);
  /* EVERY SHEET THAT IS ONE LESSON'S carries that lesson's own run. The plan
     and the one-page lesson were left off this list and printed `#panel=classroom`
     in their footers — the desk, not the lesson — which is the least useful
     address on either page: a cover teacher holding the plan wants the run. */
  if (id === 'tasks-core' || id === 'tasks-supported' || id === 'tasks-extension'
    || id === 'board' || id === 'plan' || id === 'lesson' || id === 'key') {
    /* The sheets a student holds. The address that is any use to them is the
       start of the run their tasks are numbered against — THEIR lesson's run,
       not the unit's, which is the whole point of a per-lesson pack. */
    /* NO FALLBACK TO THE OTHER LESSON'S ROUTE. It used to read `routeOf(n) ||
       lessonRoute()`, and Lesson Two's board sheet printed Lesson One's run in
       its footer — a page for one lesson carrying the address of another,
       which is the exact defect this pack was rebuilt to kill. A lesson with no
       route in this build prints the desk instead, which is true. */
    const r = routeOf(n);
    return r ? '#tour=' + r + '&step=1' : '#panel=classroom';
  }
  if (id === 'ledger' || id === 'booklet') return '#panel=evidence';
  if (id === 'revision') return '#panel=workshop';
  if (id === 'map') return stateFragment(ctx) || '#panel=classroom';
  return '#panel=classroom';
}

function linkFor(ctx, id) {
  const frag = fragmentFor(id, ctx);
  const base = deployedBase();
  return base ? base + frag : 'the atlas · ' + frag;
}

/* ------------------------------------------------------------- the packs -- */

/**
 * A PRINT ID NAMES ITS LESSON. DIDACTIC_SPEC §8.5: every surface that names a
 * route says which lesson it is, and eight of the twelve sheets in this pack
 * are one lesson's. `plan@2` is Lesson Two's plan; an id with no `@` is a sheet
 * about the atlas rather than about a lesson, and it never claims one. An id
 * that arrives without a lesson where one is needed defaults to Lesson One,
 * because a cold start runs Lesson One.
 */
function splitId(raw) {
  const s = String(raw || '');
  const at = s.indexOf('@');
  if (at < 0) return { id: s, n: 1, said: false };
  const n = Number(s.slice(at + 1));
  return { id: s.slice(0, at), n: Number.isFinite(n) && lessonNo(n) ? n : 1, said: true };
}

function build(raw, pack, corpus, ctx, opts) {
  const { id, n } = splitId(raw);
  /* The classroom pack. Five sheets that print things the screen never shows:
     the plan a cover teacher runs cold, three task sheets at three levels of
     support, and the answer key for that lesson's own tasks. `sheets.js` builds
     them, one lesson at a time; see `splitId` below for how the lesson gets
     from the print control to the sheet. */
  if (id === 'plan') return planSheet(corpus, ctx, n);
  if (id === 'tasks-core') return taskSheet('core', n);
  if (id === 'tasks-supported') return taskSheet('supported', n);
  if (id === 'tasks-extension') return taskSheet('extension', n);
  if (id === 'key') return keySheet(corpus, ctx, n);
  if (id === 'lesson') return lessonSheet(ctx, n);
  if (id === 'ledger') return ledgerSheet(pack, corpus);
  if (id === 'booklet') return bookletSheet(corpus);
  if (id === 'questions') return questionSheet(ctx);
  if (id === 'map') return mapSheet(ctx, corpus, opts);
  if (id === 'revision') return revisionSheet(ctx);
  return boardSheet(ctx, n);
}

/* --- the board ------------------------------------------------------------ */

function boardSheet(ctx, n) {
  const L = lessonNo(n) || LESSONS[0];
  const BOARD = boardOf(L.n) || { question: '', hold: [], sentence: '' };
  const bp = boardPlan(ctx && ctx.data, L.n);
  /* WHO THIS SHEET IS FOR, WHICH IT DID NOT USED TO SAY. Printed, it read as
     a student worksheet with eight ruled lines — the shape of round five's
     charge — while its actual job is to be copied onto the board before the
     class comes in. Measured on paper: the question, the three lines and the
     sentence filled the top half of the A4 and the bottom half was white. It
     now says what it is in one line, and the writing space runs to the foot of
     the page so that a room without task sheets can still use it as one. */
  return {
    title: 'The board sheet — ' + L.name + ': ' + L.title,
    node: el('div.tp-paper__board',
      /* §8.5, and the first thing on the page: which lesson, what it covers,
         and what the other one covers. A teacher filing two of these can see
         they are two halves of one unit. */
      el('p.tp-paper__standsm.tp-paper__unit',
        el('strong', L.name + ' of two — ' + L.title + '.'),
        ' It covers ' + L.covers + '. ' + L.other + '.'),
      el('p.tp-paper__standsm',
        'One copy for the room. The question goes on the board before the class comes in and stays '
        + 'there. The held lines go up one at a time, as the run leaves the beat that puts the '
        + 'evidence for each of them on screen — the times below are this route’s own, and a line '
        + 'whose beat this route does not run is marked extension rather than given a time. The '
        + 'ruled space at the foot is for a class writing on this sheet rather than on a task sheet.'),
      el('h1.tp-paper__h1', BOARD.question),
      el('h2.tp-paper__h2', 'What goes up, and when'),
      /* THE SAME SCHEDULE THE DESK SHOWS, from `classroom.boardPlan()`. Two
         copies of a clock is how a screen and its printout come to disagree,
         and the wall-clock times used to be typed on both. */
      /* The question and the through-line sentence are already set once each on
         this sheet, large; the schedule gives them their time and points at
         them rather than printing a second copy a teacher might copy twice. */
      el('ol.tp-paper__sched', ...bp.rows.map(r => el('li.tp-paper__si',
        el('span.tp-paper__st', r.when || '—'),
        el('span.tp-paper__sl', r.lead),
        el('span.tp-paper__sx', r.kind === 'question' ? 'The question at the top of this sheet.'
          : r.kind === 'sentence' ? 'The sentence at the foot of this sheet, with the blanks.'
            : r.text),
        el('span.tp-paper__sn', r.note)))),
      el('p.tp-paper__standsm', bp.ok
        ? 'The times are the lesson route’s own costed clock, counted from the moment the run '
          + 'starts — ' + runStartSays() + '.'
        : 'No times are printed. ' + bp.why + '.'),
      el('h2.tp-paper__h2', 'By the end of the lesson, in your own words'),
      el('p.tp-paper__fill', ...ruled(BOARD.sentence)),
      el('div.tp-paper__rules', ...Array.from({ length: 14 }, () => el('span.tp-paper__rule')))),
  };
}

/* The board sentence carries its blanks as runs of underscores. On paper they
   become ruled spaces of the same width, so a pencil has somewhere to go. */
function ruled(sentence) {
  const out = [];
  for (const part of String(sentence).split(/(_+)/)) {
    if (!part) continue;
    if (part[0] === '_') out.push(el('span.tp-paper__blank', { style: 'width:' + Math.max(6, part.length) + 'ch' }, ''));
    else out.push(part);
  }
  return out;
}

/* --- the revision sheet ---------------------------------------------------
 *
 * WHAT IT IS AND WHAT IT IS NOT. FEATURE_SPEC P21 owns the Ledger — the record
 * of every prediction and commitment a student makes anywhere in the atlas —
 * and the Close that turns it into a revision sheet. This is not that sheet and
 * does not pretend to be: it prints what THIS desk holds, which is the
 * student's own workshop paragraphs and their six scope placements. It says so
 * on the page, because a revision sheet that implies it knows more about you
 * than it does is worse than one that admits its scope.
 */
function revisionSheet(ctx) {
  const saved = storage.get(WORKSHOP_STORE_KEY, {}) || {};
  const marks = saved.scopeMarks || {};
  const written = MOVE_INDEX.filter(m => (saved[m.slug] || '').trim().length);
  const placed = Object.keys(marks).length;

  const body = el('div.tp-paper__revision',
    el('p.tp-paper__stand',
      'Everything on this page is your own work, taken out of this browser. ' +
      'Nothing here was sent anywhere, and nothing on it was written by the app except the ' +
      'questions and the reminders.'),
    el('h2.tp-paper__h2', 'Name and date'),
    el('p.tp-paper__fill', ...ruled('__________________________________     ____________________')),
  );

  if (!written.length && !placed) {
    body.appendChild(el('p.tp-paper__stand',
      'You have not written anything in the workshop yet, so this sheet is a blank one. ' +
      'It prints the four moves and the questions, and leaves you the room to answer them by hand.'));
  }

  for (const m of MOVE_INDEX) {
    body.appendChild(el('article.tp-paper__q',
      el('p.tp-paper__qn', 'Move ' + m.n + ' · ' + m.name),
      el('p.tp-paper__qt', m.question),
      (saved[m.slug] || '').trim()
        ? el('blockquote.tp-paper__quote', el('p', saved[m.slug].trim()))
        : el('div.tp-paper__rules', ...Array.from({ length: 6 }, () => el('span.tp-paper__rule'))),
      el('p.tp-paper__qe', el('strong', 'Check it against. '), m.scheme.map(x => x[0]).join(' '))));
  }

  if (placed) {
    body.appendChild(el('h2.tp-paper__h2', 'Your scope test'));
    body.appendChild(el('p.tp-paper__stand', SCOPE_CLAIM));
    body.appendChild(el('table.tp-paper__table',
      el('thead', el('tr', el('th', { scope: 'col' }, 'Exit'), el('th', { scope: 'col' }, 'You placed it'),
        el('th', { scope: 'col' }, 'Write one sentence saying why'))),
      el('tbody', ...Object.entries(marks).map(([id, v]) => el('tr',
        el('th', { scope: 'row' }, id.replace(/-/g, ' ')),
        el('td', v),
        el('td', ''))))));
  }

  /* What the reader answered on the four in-lesson move cards. It is their own
     sentence, quoted back, right or wrong — which is the only kind of revision
     line worth carrying out of a browser. */
  const picks = pathPicks();
  if (picks.length) {
    body.appendChild(el('h2.tp-paper__h2', 'The four moves, as you met them in the lesson'));
    body.appendChild(el('table.tp-paper__table',
      el('thead', el('tr',
        el('th', { scope: 'col' }, 'Move'),
        el('th', { scope: 'col' }, 'You chose'),
        el('th', { scope: 'col' }, 'Write one sentence saying why'))),
      el('tbody', ...picks.map(p2 => el('tr',
        el('th', { scope: 'row' }, p2.n + ' · ' + p2.name),
        el('td', (p2.right ? '' : '(not the move) ') + (p2.said || '')),
        el('td', ''))))));
  }

  /* Off this map. */
  const port = storage.get(PORTABLE_STORE_KEY, {}) || {};
  const pmarks = port.marks || {};
  if (Object.keys(pmarks).length || (port.words || '').trim()) {
    body.appendChild(el('h2.tp-paper__h2', 'The frame, off this map'));
    body.appendChild(el('p.tp-paper__stand', PORTABLE_CLAIM));
    body.appendChild(el('table.tp-paper__table',
      el('thead', el('tr',
        el('th', { scope: 'col' }, 'Case'), el('th', { scope: 'col' }, 'You placed it'),
        el('th', { scope: 'col' }, 'The historians below read it'))),
      el('tbody', ...PORTABLE_CASES.filter(c => pmarks[c.id]).map(c => el('tr',
        el('th', { scope: 'row' }, c.place + ' (' + c.power + ', ' + c.span + ')'),
        el('td', pmarks[c.id]),
        el('td', c.answer))))));
    body.appendChild(el('p.tp-paper__qn', 'Your frame, in your own words'));
    body.appendChild((port.words || '').trim()
      ? el('blockquote.tp-paper__quote', el('p', port.words.trim()))
      : el('div.tp-paper__rules', ...Array.from({ length: 6 }, () => el('span.tp-paper__rule'))));
  }

  /* THE UNIT'S SENTENCE, NOT A LESSON'S. DIDACTIC_SPEC §8.4(3): §2.3 entire
     belongs to the unit and may be offered for signing only where both lessons
     are done. The revision sheet is printed after the fact, from a record of
     what this student did, so it is the one place in the pack that may carry
     the whole thing. */
  body.appendChild(el('h2.tp-paper__h2', 'The sentence, in your own words'));
  body.appendChild(el('p.tp-paper__standsm',
    'This is the whole unit’s sentence — both lessons. Fill in the half you have done and leave '
    + 'the other half until you have.'));
  body.appendChild(el('p.tp-paper__fill', ...ruled(UNIT_SENTENCE)));

  return { title: 'Revision sheet — your own work', node: body };
}

/* --- the lesson ----------------------------------------------------------- */

function lessonSheet(ctx, n) {
  const L = lessonNo(n) || LESSONS[0];
  /* THE STEP COLUMN. One side of A4 for the desk, and the column a teacher
     actually looks at mid-lesson is "where should the counter be". It prints
     only when `steps.js` has checked its step index against the guided path's
     own count; otherwise the column is absent rather than empty. */
  const rf = routeFacts(L.n);
  const lplan = segmentPlan(L.n);
  const rows = planOf(L.n);
  const stepOfRow = (b) => (rf.ok && b.beat ? beatStep({ id: b.beat }, L.n) : null);
  /* The minute column is this route's own clock, by segment, not a typed span. */
  const spanOfRow = (b) => {
    if (!lplan.ok) return '—';
    const seg = segmentsOf(L.n).find(x => x.beats.some(y => y.id === b.beat));
    const r = seg ? lplan.rows.find(x => x.id === seg.id) : null;
    return r && r.on ? r.say + ' min' : 'extension';
  };
  const withSteps = rf.ok && rows.some(stepOfRow);
  /* WHY THE LAST ROW SAYS WHAT IT SAYS. A teacher who reads "#year=2025" on a
     sheet printed in 2026 is entitled to ask whether it is stale. It is not:
     it is the last change in the dataset, and the dataset's build stamp is in
     the footer of this same page. So the sheet says so. */
  const last = lessonLastChange(ctx && ctx.data);

  return {
    title: L.name + ' on one page — ' + L.title
      + (rf.clock && rf.clock.ok ? ' · ' + rf.clock.minutes.say + ' minutes' : ''),
    node: el('div.tp-paper__lesson',
      el('p.tp-paper__standsm.tp-paper__unit',
        el('strong', L.name + ' of two — ' + L.title + '.'),
        ' It covers ' + L.covers + '. ' + L.other + '.'),
      el('p.tp-paper__stand',
        'Teacher-led, one screen. The map never leaves it. '
        + (withSteps
          ? 'Start at #tour=' + (rf.route || '…') + '&step=1 and drive it with Next. The step column is where the '
            + 'counter on screen should read; typing that link rejoins the run at that stop.'
          : 'Open each link before the lesson.')),
      last ? el('p.tp-paper__standsm',
        'The last row opens at ' + last.year + '. That is the last change this dataset records'
        + (last.what ? ' (' + String(last.what).replace(/^The /, 'the ') + ')' : '')
        + ', not the date this sheet was printed; the scrubber itself runs a little past it.') : null,
      el('table.tp-paper__table',
        el('thead', el('tr',
          el('th', { scope: 'col' }, 'Min'),
          withSteps ? el('th', { scope: 'col' }, 'Step') : null,
          el('th', { scope: 'col' }, 'Beat'),
          el('th', { scope: 'col' }, 'What to do'),
          /* THE QUESTION IS THE BEAT'S OWN — see classroom.js::lessonAsk. This
             column used to carry a line typed on the desk, and on step 1 it
             asked a population-share question the app never asks. */
          el('th', { scope: 'col' }, 'What is asked'),
          el('th', { scope: 'col' }, withSteps ? 'Map link' : 'Link'))),
        el('tbody', ...rows.map(b => {
          const st = stepOfRow(b);
          /* The last row's year is the dataset's, not the clock's. */
          const link = lessonLink(b, ctx && ctx.data);
          return el('tr',
            el('th', { scope: 'row' }, spanOfRow(b)),
            withSteps ? el('td.tp-paper__stepcell', st ? st.n + ' / ' + (st.of || '?') : '—') : null,
            el('td', b.title), el('td', b.do), el('td', lessonAsk(b).text),
            el('td', link ? el('code', link) : el('span.tp-paper__nolink', '—')));
        })))),
  };
}

/* --- the ledger ----------------------------------------------------------- */

function ledgerSheet(pack, corpus) {
  const rows = (pack && pack.rows) || corpus.rows;
  const s = corpus.stats;
  return {
    title: 'The evidence ledger — ' + rows.length + ' of ' + corpus.stats.total + ' figures',
    node: el('div.tp-paper__ledger',
      el('p.tp-paper__stand',
        'One row per figure. Sorted weakest first: low confidence, then contested, then figures ' +
        'given as a single value with no range. “Record-level” means the citation backs the ' +
        'territory’s entry, not this particular number. The last column is different and it is ' +
        'the one to look at first: it says whether a record is filed against THIS NUMBER — ' +
        '“checkable” names the record and where to look it up, “named” names it and nowhere to ' +
        'look, “none” means nobody can check the figure yet and it should be given to a class as ' +
        'a claim with a range rather than as a fact.'),
      el('p.tp-paper__counts',
        s.total + ' figures · ' + s.low + ' low confidence · ' + s.contested + ' contested · ' +
        s.noRange + ' with no range · ' + s.recordLevel + ' record-level citations · ' +
        s.noSource + ' unsourced · ' + s.money + ' stated in prose · ' +
        s.warrantOk + ' checkable, ' + s.warrantWeak + ' named, ' + s.warrantBare + ' with no record against the number'),
      el('table.tp-paper__table.tp-paper__table--led',
        el('thead', el('tr',
          el('th', { scope: 'col' }, 'Subject'), el('th', { scope: 'col' }, 'Figure'),
          el('th', { scope: 'col' }, 'Value'), el('th', { scope: 'col' }, 'Yr'),
          el('th', { scope: 'col' }, 'Conf'), el('th', { scope: 'col' }, 'Range'),
          el('th', { scope: 'col' }, 'Source'), el('th', { scope: 'col' }, 'Where in the data'),
          el('th', { scope: 'col' }, 'This number'))),
        el('tbody', ...rows.map(r => el('tr',
          el('th', { scope: 'row' }, r.subject),
          el('td', r.figure),
          el('td.num', r.quantity === 'money' ? 'in prose'
            : !r.hasValue ? 'none'
              : (r.hasRange ? fmt(r.low) + '–' + fmt(r.high) : fmt(r.low)) + (r.unit ? ' ' + r.unit : '')),
          el('td.num', r.year === null ? '—' : String(r.year)),
          el('td', r.confidence + (r.contested ? ', contested' : '')),
          el('td', r.quantity === 'money' ? 'n/a' : r.hasRange ? 'yes' : 'no'),
          el('td', r.sources[0]
            ? r.sources[0].author + ', ' + r.sources[0].work + (r.sources[0].year ? ' (' + r.sources[0].year + ')' : '') +
            (r.sourceLevel === 'record' ? ' — record-level' : '')
            : '[unsourced]'),
          el('td', el('code', r.shard.replace('app/data/territories/', '') + ' ' + r.path)),
          /* The warrant class, in one word a marker can scan a page for. */
          el('td', r.warrantStatus === 'ok' ? 'checkable'
            : r.warrantStatus === 'weak' ? 'named'
              : el('b.tp-paper__bare', 'none'))))))),
  };
}

/* --- the source booklet --------------------------------------------------- */

function bookletSheet(corpus) {
  const texts = (corpus.testimony || []).slice()
    .sort((a, b) => (a.year || 0) - (b.year || 0));
  if (!texts.length) {
    return {
      title: 'The source booklet',
      node: el('p.tp-paper__stand',
        'The transcribed primary texts are held by the dossier, and the dossier is not running in ' +
        'this build. Nothing has been substituted for them.'),
    };
  }
  return {
    title: 'The source booklet — ' + texts.length + ' texts written at the time',
    node: el('div.tp-paper__booklet',
      el('p.tp-paper__stand',
        'Every text here was made by somebody who was a party to what it describes. Each carries ' +
        'four answers before the quotation — what it is, who made it, what it was made for, and ' +
        'what it cannot tell you — and a line saying where to go and check it.'),
      ...texts.map((t, i) => el('article.tp-paper__src',
        el('p.tp-paper__srcn', 'Source ' + letter(i)),
        el('h3.tp-paper__srch', t.author + ', ' + t.work + (t.year ? ', ' + t.year : '')),
        el('dl.tp-paper__prov',
          field('What it is', t.nature), field('Who made it, and when', t.origin),
          field('What it was made for', t.purpose), field('What it cannot tell you', t.cannotTell)),
        el('blockquote.tp-paper__quote', el('p', '“' + (t.quote || '') + '”')),
        el('p.tp-paper__speaker', t.speaker || ''),
        t.check ? el('p.tp-paper__check', el('strong', 'Where to check it. '), t.check) : null))),
  };
}

function field(k, v) {
  return [el('dt', k), el('dd', v || el('b', '[unsourced]'))];
}
const letter = (i) => String.fromCharCode(65 + (i % 26)) + (i >= 26 ? String(Math.floor(i / 26) + 1) : '');

/* --- the questions -------------------------------------------------------- */

function questionSheet(ctx) {
  return {
    title: 'Practice questions and mark schemes',
    node: el('div.tp-paper__qs',
      el('p.tp-paper__stand',
        'Twelve questions answerable from the atlas. The mark scheme under each is written for a ' +
        'student marking their own work.'),
      ...QUESTIONS.map((q, i) => el('article.tp-paper__q',
        el('p.tp-paper__qn', (i + 1) + '. ' + q.type + ' · ' + q.marks + ' marks · move: ' + q.moves.join(', ')),
        el('p.tp-paper__qt', q.q),
        el('p.tp-paper__qa', 'In the atlas: ' + q.atlas
          .map(a => ({ label: a.label, href: resolveYearLink(a.href, ctx && ctx.data) }))
          .filter(a => a.href)
          .map(a => a.label + ' — ' + a.href).join(' · ')),
        el('dl.tp-paper__ms',
          field('Top band', q.scheme.top),
          field('Middle band', q.scheme.middle),
          field('What loses the marks', q.scheme.floor)),
        el('p.tp-paper__qe', el('strong', 'Evidence expected. '), q.evidence.join(' ')))),
    ),
  };
}

/* --- the map -------------------------------------------------------------- */

function mapSheet(ctx, corpus, opts) {
  const state = ctx.store.getState();
  const year = state.year;
  const canvas = document.querySelector('.stage__map canvas');
  let img = null;
  try { if (canvas) img = el('img.tp-paper__map', { src: canvas.toDataURL('image/png'), alt: 'The atlas map at ' + year }); }
  catch (_) { img = null; }

  const key = keyAt(ctx, year);
  return {
    title: 'The map at ' + year,
    node: el('div.tp-paper__mapsheet',
      img || el('p.tp-paper__stand',
        'The map could not be copied — the atlas was not drawing when this sheet was made. ' +
        'Nothing has been substituted for it.'),
      el('p.tp-paper__cap',
        el('strong', 'The British Empire in ' + year + '. '),
        key.caption,
        ' ' + definitionLine(state, corpus),
        (opts && opts.recoloured
          ? ' Drawn at the year, projection and zoom left on screen, in the atlas’s paper colours: '
            + 'the screen was in the lamplit theme, which prints as a solid dark page. '
          : ' Drawn exactly as the atlas was drawing it, at the projection and zoom left on screen. ') +
        'Every boundary is a modern rendering of a claim made at the time, not a survey.'),
      key.node),
  };
}

/** Which of the four thresholds the map was drawn under, in the map's words. */
function definitionLine(state, corpus) {
  const defs = corpus && corpus.definitions;
  if (!defs || !defs.list) return '';
  const id = (state.filters && state.filters.def) || defs.fallback;
  const d = defs.list.find(x => x.id === id);
  if (!d || !d.sentence) return '';
  /* The map's sentence begins "drawn: …" because it is written for a caption
     under the map itself. Here it follows the word "Threshold", so the first
     word would read "Threshold: drawn:" and that is one colon too many. */
  return 'Threshold — ' + d.sentence.replace(/^drawn:\s*/, '') + '.';
}

/**
 * The key. Two sources, in order of preference.
 *
 * 1. The colour ribbon the reader can see under the map. It is the legend
 *    piece's own vocabulary and its own colours, so the printed key says what
 *    the screen said, in the same words, with the same swatches — read off the
 *    live elements with getComputedStyle rather than guessed from tokens.
 * 2. If the legend is not running, the statuses actually on the map at this
 *    year, counted from the data, with no swatches. A key with no colours is
 *    worse than one with them and better than one with the wrong ones.
 */
function keyAt(ctx, year) {
  const fromRibbon = ribbonKey();
  const counted = countedKey(ctx, year);
  return { caption: counted.caption, node: fromRibbon || counted.node };
}

function ribbonKey() {
  const host = document.querySelector('[data-mount="legend"]');
  if (!host) return null;
  const items = [...host.querySelectorAll('li')];
  if (!items.length) return null;
  const out = [];
  for (const li of items) {
    let colour = null;
    for (const n of li.querySelectorAll('*')) {
      const r = n.getBoundingClientRect();
      if (r.width > 40 || r.width < 2) continue;
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') { colour = bg; break; }
    }
    const text = (li.textContent || '').trim().replace(/\s+/g, ' ');
    if (!text) continue;
    const m = /^(.*?)(\d[\d,]*)$/.exec(text);
    out.push(el('li.tp-paper__keyi',
      colour ? el('span.tp-paper__sw', { style: 'background:' + colour }) : null,
      el('span.tp-paper__keyl', (m ? m[1] : text).trim()),
      m ? el('span.tp-paper__keyn.num', m[2]) : null));
  }
  return out.length ? el('ul.tp-paper__key', ...out) : null;
}

function countedKey(ctx, year) {
  let counts = new Map(), controlled = 0, total = 0;
  try {
    const at = ctx.data.statusAt(year);
    for (const s of at.values()) {
      total++;
      if (s.controlled) controlled++;
      if (!s.status) continue;
      counts.set(s.status, (counts.get(s.status) || 0) + 1);
    }
  } catch (_) { /* no data layer: print the picture and say nothing false about it */ }

  const labels = new Map();
  try { for (const s of (ctx.data.statuses || [])) labels.set(s.id, s.label); } catch (_) { /* ignore */ }

  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const caption = rows.length
    ? controlled + ' of ' + total + ' mapped units were under some degree of British control, in ' +
    rows.length + ' different legal forms.'
    : 'The atlas reported no units for this year.';

  return {
    caption,
    node: rows.length
      ? el('ul.tp-paper__key', ...rows.map(([id, n]) => el('li.tp-paper__keyi',
        el('span.tp-paper__keyl', labels.get(id) || id.replace(/-/g, ' ')),
        el('span.tp-paper__keyn.num', String(n)))))
      : null,
  };
}
