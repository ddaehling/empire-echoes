/**
 * teacher/classroom.js — the things a teacher needs before Tuesday.
 *
 * Charge 14 is CONCEDED (FEATURE_SPEC §1): print has one version, software has
 * a deploy, and curriculum is built on permanence. We do not win that. What we
 * can do is make a link behave like a page number, and that is most of this
 * file: the frozen URL contract, printed as a contract, with a builder that
 * turns whatever is on screen into a link a teacher can put in a worksheet, and
 * the content version stamped beside it so a link that means something
 * different in March announces the fact.
 *
 * Four blocks:
 *   A  what goes on the board at 09:05
 *   B  a lesson that can be run with THIS build, timed, with a link per beat
 *   C  the deep-link contract, and a builder
 *   D  twelve practice questions with mark schemes, tagged by type
 *   E  the printable pack
 *
 * Block B names what is running in this build at the moment it is drawn, from
 * `registry.report()`, rather than describing a lesson that assumes pieces that
 * may not be installed. A lesson plan that promises a beat the build cannot do
 * is worse than no lesson plan.
 */

import { el, fill, announce } from '../core/util.js';
import { QUESTIONS, TYPES } from './questions.js';
import { panel, head, jumpTo, lastRecordedChange, resolveYearLink, kindsOfRuleChecked } from './parts.js';
import { TIERS, SEGMENTS, tasksFor, coreCount, beatStep, segmentPlan, routeFacts, onLesson, beatAnswers,
  LESSONS, boardOf, planOf, segmentsOf, keyText } from './pack.js';
import { movePlan } from './path.js';
import { stepOf, stepCount, beatRecord } from './steps.js';
import { lessonRoute, routeOf, lessonBinding, unitLessons, routeChoice, atMinute, wallClock,
  periodVerdict, roomSays, PERIOD } from './timing.js';

/* THE BOARD AND THE PLAN NOW LIVE IN `unit.js`, ONE OF EACH PER LESSON.
   DIDACTIC_SPEC §8 became a two-lesson unit in wave 9 and §8.5 made it a law
   that every surface naming a route says which lesson it is; a single `BOARD`
   and a single `LESSON` could not say that, and the two defects the critics
   found here were both a page speaking for a lesson it was not written for.
   `unit.js` holds them, `tools/check-pack.js` checks every line of them against
   the beats its own lesson actually runs, and this file draws them. */


/* Small numbers are words in a sentence a person reads; a desk that opens
   "5 segments" reads as a spreadsheet. `sheets.js` has the same list for the
   printed pages and neither borrows the other's, because one is prose in an
   interface and the other is prose on paper. */
const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const say = (n) => WORD[n] || String(n);
const Say = (n) => (WORD[n] ? WORD[n][0].toUpperCase() + WORD[n].slice(1) : String(n));

/* WHAT EACH MOVE IS FOR. The BEAT it fires on is not written here: `path.js`
   decides that from the route the reader is on, and four typed sentences naming
   a beat went silently wrong the last time the default route changed. */
const MOVE_TAILS = {
  1: 'Sam Sharpe’s words, and who wrote them down.',
  2: 'Description, verdict, interpretation — which of the three is an argument.',
  3: 'Urabi in 1881 against the British declaration of 1922.',
  4: 'The atlas’s strongest claim, run against French Algeria.',
};

const URL_KEYS = [
  ['year', '1765', 'The year on the map. Always present.'],
  ['sel', 'bengal-presidency', 'The territory whose dossier opens. Ids are in the dataset and never change.'],
  ['layer', 'trade', 'Which thematic layer paints the map. Omitted when it is the default.'],
  ['compare', '1914', 'Turns on compare mode against this year.'],
  ['filter', 'stage:apparatus', 'Opens the atlas with its full apparatus showing, rather than the quiet first view.'],
  ['view', '2.4,0.31,-0.08', 'The camera: zoom, then x and y. Use it to pin a region.'],
  ['panel', 'evidence', 'Opens a desk surface: workshop, evidence, classroom or methods.'],
  ['q', 'beng', 'Puts a term in the search box.'],
  ['theme', 'paper', 'paper or lamplit. Omitted when it follows the machine.'],
  ['motion', 'reduced', 'Turns animation off for the whole session.'],
];

/* The six blocks of this tab, in the order they are drawn, so the jump bar and
   the page cannot fall out of step. `id` is the section's own DOM id. */
const BLOCKS = [
  ['tp-cr-board', 'On the board'],
  ['tp-cr-lesson', 'The lesson, timed'],
  ['tp-cr-pack', 'The classroom pack'],
  ['tp-cr-links', 'Links that keep'],
  ['tp-cr-practice', 'Practice questions'],
  ['tp-cr-print', 'Everything to print'],
];

/**
 * WHICH LESSON THIS PAGE IS ABOUT — chosen once, at the top, and remembered for
 * the session only.
 *
 * DIDACTIC_SPEC §8 is a two-lesson unit and §8.5 says every surface naming a
 * route must say which lesson it is. The alternative to this control was two of
 * every block on one page: two boards, two plans, two pack lists, twelve print
 * buttons. That is the wall-of-everything this project keeps having to undo, so
 * the page shows ONE lesson at a time and names the other one in words at the
 * top, where a teacher planning a scheme of work reads it.
 */
let SHOWING = 1;

export function renderClassroom(root, api) {
  const n = SHOWING;
  const bound = unitLessons();
  const blocks = [board(api, n), lesson(api, n), classpack(api, n), links(api), practice(api), printing(api, n)];
  blocks.forEach((b, i) => { if (b) b.id = BLOCKS[i][0]; });

  fill(root,
    el('div.tp-prose.tp-page__intro',
      el('p.tp-lede-p',
        'The empire is a two-lesson unit: ' + LESSONS.map(l => l.name + ', ' + l.title.toLowerCase())
          .join(', and ') + '. Each is one school period and each is a whole lesson with its own '
        + 'beginning and its own ending. Everything on this page — the board, the plan, the five '
        + 'sheets — is for the lesson chosen below.'),
      el('p.tp-prose__p',
        'A framing to put on the board, a lesson you can run with this build as it stands, the '
        + 'classroom pack — a plan a cover teacher can run cold, three task sheets and an answer '
        + 'key — the deep-link contract so a link behaves like a page number, and twelve questions '
        + 'with mark schemes.')),

    /* THE LESSON PICKER. Two controls and a line about the one not chosen. A
       lesson the guided path publishes no route for still gets its pack — the
       sheets print, the clock does not, and the reason is on the page. */
    el('div.tp-unit', { role: 'group', 'aria-label': 'Which lesson this page is about' },
      ...bound.map((b) => el('button.tp-unit__b' + (b.lesson.n === n ? '.is-on' : ''), {
        type: 'button',
        'aria-pressed': b.lesson.n === n ? 'true' : 'false',
        'data-lesson': String(b.lesson.n),
        /* THE WHOLE TAB IS REDRAWN, SO THE FOCUSED BUTTON IS DESTROYED WITH IT.
           Measured by keyboard at 1440x900: pressing a lesson left focus on the
           document body and a keyboard reader at the top of the page with no
           idea anything had happened. The replacement is found by its own
           `data-lesson` and focused, and the change is announced, because a
           silent redraw is not a control. */
        onclick: () => {
          SHOWING = b.lesson.n;
          renderClassroom(root, api);
          const again = root.querySelector('.tp-unit__b[data-lesson="' + b.lesson.n + '"]');
          if (again) { try { again.focus({ preventScroll: true }); } catch (_) { /* gone */ } }
          announce(b.lesson.name + ', ' + b.lesson.title + '. The board, the plan and the five '
            + 'sheets on this page are now this lesson’s.');
        },
      },
        el('span.tp-unit__n', b.lesson.name),
        el('span.tp-unit__t', b.lesson.title),
        el('span.tp-unit__r', b.route
          ? (b.clock && b.clock.ok ? b.clock.minutes.say + ' minutes' : 'timed against “' + b.label + '”')
          : 'no route in this build'))),
      /* THE OTHER LESSON, NAMED AS A SUBJECT AND NOT AS A DEFICIT — §8.4(5).
         It is THIS lesson's own `other` sentence, which describes the one not
         chosen; taking it off the other lesson's record printed a description
         of the lesson already on screen. */
      el('p.cx-note.tp-unit__why',
        ((bound.find((b) => b.lesson.n === n) || bound[0] || { lesson: {} }).lesson.other || '') + '.')),

    /* SIX BLOCKS AND ONE COLUMN. Measured at 390x844: this tab is 12,658px of
       content in the sheet's 198px window, which is sixty-four screenfuls of
       scrolling to reach the print buttons at the bottom. The Workshop already
       solved the same problem with `.tp-jump`, so this uses that, unchanged.
       Nothing is hidden and nothing is behind a tab — FEATURE_SPEC §2 rule 2 —
       the bar is a shortcut past scrolling, not a container.
       Buttons, not anchors, for the reason the Workshop states: an `href="#…"`
       is written into the address bar and read back by `core/url.js` as a state
       with no year and no selection. */
    el('nav.tp-jump', { 'aria-label': 'The parts of this page' },
      ...BLOCKS.map(([id, name], i) => el('button.tp-jump__item', {
        type: 'button',
        onclick: () => jumpTo(id),
      },
        el('span.tp-jump__n', String(i + 1)),
        el('span.tp-jump__t', name)))),
    ...blocks,
  );
}


/* ------------------------------------------------------------ A · board -- */

/**
 * THE BOARD SCHEDULE, AND WHY IT HAS WALL-CLOCK TIMES ON IT.
 *
 * This block used to be headed "On the board at 09:05" and "And at 09:55, in
 * their own words" — two times typed by hand against a lesson that no longer
 * ran for fifty minutes, and against a route that has since been re-costed. So
 * the times are computed: the period starts on the hour, the class settles, the
 * run starts, and each line of the framing is written up at the moment the
 * segment that checks it begins. Those moments come from `pack.segmentPlan()`,
 * which is the guided path's own costed clock indexed by segment.
 *
 * A held line is keyed to THE BEAT THAT CARRIES ITS EVIDENCE, not to the
 * segment it sits in. A segment runs if any one of its beats does, so keying
 * the schedule to segments printed "the class checks it on the map in that
 * segment" beside a claim whose only evidence is on a beat this route omits.
 * Round nine's rubric critic found exactly that on the Indian Civil Service
 * line, and this is the repair: `pack.onLesson()` — `steps.js::carries()`, the
 * function the lesson rows are already answered by — decides, and a line whose
 * beat is off the route prints as extension rather than as a promise.
 *
 * A line goes up when the run LEAVES its beat, not when it arrives: it is a
 * finding the class has just checked, not a heading for what is coming, and
 * writing it up before the evidence lands gives the answer away on a beat whose
 * whole design is to make them guess first.
 *
 * `data` is the dataset, for the one held line whose quantity is counted rather
 * than typed. It may be absent; that line then prints its claim without a
 * number rather than a number nobody counted.
 *
 * Exported because `print.js` prints the same schedule on the board sheet, and
 * two copies of a clock is how a screen and its printout come to disagree.
 */
export function boardPlan(data, lesson) {
  const n = lesson == null ? 1 : Number(lesson);
  const BOARD = boardOf(n) || { question: '', hold: [], sentence: '' };
  const plan = segmentPlan(n);
  const clock = plan.clock || null;
  const beatAt = (id) => (clock && clock.ok && clock.at ? clock.at.get(id) || null : null);
  const onRows = plan.rows.filter(r => r.on);
  const first = onRows[0] || null;
  const last = onRows[onRows.length - 1] || null;

  const out = [{
    kind: 'question',
    when: plan.ok && first ? atMinute(first.startMin) : null,
    sort: first ? first.startMin : Infinity,
    lead: 'The lesson question', text: BOARD.question,
    note: 'Up before the class comes in, and it stays up.',
  }];

  BOARD.hold.forEach((h) => {
    const on = onLesson(h.beat, n);
    const span = on === true ? beatAt(h.beat) : null;
    const rec = beatRecord(h.beat);
    const head = (rec && rec.panel && rec.panel.title) || h.beat;
    const step = on === true ? stepOf(h.beat, plan.route) : null;
    out.push({
      kind: 'hold',
      beat: h.beat,
      when: span ? atMinute(span.end) : null,
      sort: span ? span.end : Infinity,
      lead: h.lead,
      text: keyText(typeof h.text === 'function' ? h.text(data) : h.text, data),
      note: span
        ? 'Write it up as the run leaves ' + (step ? 'step ' + step + ', ' : '') + '“' + head + '”'
          + ' — the beat where the class checks it on the map.'
        : on === false
          ? 'Extension. This route does not run “' + head + '”, the beat that puts the evidence for '
            + 'this line on screen, so do not put it up as a finding the class has checked.'
          : 'No time is printed for this line: this build could not check which steps the route runs.',
    });
  });

  out.push({
    kind: 'sentence',
    when: plan.ok && last ? atMinute(last.startMin) : null,
    sort: last ? last.startMin : Infinity,
    lead: 'In their own words', text: BOARD.sentence,
    note: 'The last segment. Sixty seconds of silence, then one read-out.',
  });

  out.sort((a, b) => a.sort - b.sort);
  return { ok: plan.ok, why: plan.why, lesson: n, rows: out };
}

function board(api, n) {
  const plan = boardPlan(api && api.data, n);
  const head0 = plan.ok && plan.rows[0] && plan.rows[0].when
    ? 'On the board from ' + plan.rows[0].when
    : 'On the board';
  const p = panel(head0,
    el('ol.tp-board__sched', ...plan.rows.map(r => el('li.tp-board__si',
      el('span.tp-board__st.num', r.when || '—'),
      el('div.tp-board__sb',
        el('p.tp-board__sl', el('strong', r.lead)),
        el('p.tp-board__sx', r.text),
        el('p.tp-board__sn', r.note))))),
    el('p.cx-note',
      plan.ok
        ? 'The three held lines are the atlas’s own findings, not a summary of the topic, and each '
          + 'is checkable on the map — each against one named beat, which is why a line this route '
          + 'does not reach says so instead of taking a time. The times are this route’s own costed '
          + 'clock, counted from the moment the run starts — ' + runStartSays() + '.'
        : 'No times are printed here. ' + plan.why + '. The lines themselves are unaffected.'));
  p.appendChild(el('div.tp-acts',
    el('button.btn.btn--small', { type: 'button', onclick: () => api.print({ id: 'board@' + n }) },
      'Print the board sheet')));
  return p;
}

/**
 * THE LESSON'S OWN LINKS, WITH THE ONE COMPUTED YEAR FILLED IN.
 *
 * All but one segment name a year that is a historical fact and is typed on the
 * row. The last one — "it is not finished" — wants the far end of the record,
 * and the far end of the record is not the far end of the SCRUBBER: the axis
 * runs to `bounds.max`, which core/data.js computes as this machine's year
 * plus one. That is right on screen and wrong on paper, so the seventh segment
 * carries `@last` and this resolves it from the dataset. Both the screen and
 * `print.js` call it, so the two cannot print different years.
 */
export function lessonLink(b, data) {
  return resolveYearLink(b && b.link, data);
}

/** What happened in that year, for the sheet that wants to say so. */
export function lessonLastChange(data) {
  return lastRecordedChange(data);
}

/* ----------------------------------------------------------- B · lesson -- */

/**
 * THE ROUTE THIS LESSON RUNS ON, IN ONE SENTENCE, AND IT IS NOT A NAME WE CHOSE.
 * `timing.js` picks the single-period route out of the line-up the guided path
 * publishes and says why it picked it; this prints that sentence, the route's
 * own costed range, and — the line a head of history is actually reading for —
 * whether it finishes inside a period.
 */
function routeLine(n) {
  const rf = routeFacts(n);
  const c = rf.clock;
  const bind = rf.bind;
  if (!rf.route) return el('p.cx-note', (bind && bind.why ? bind.why : 'no route') + '.');
  /* The route's reason is written to be joined onto "…, because <why>"; a
     paragraph that opens with it has to capitalise it here rather than making
     `unit.js` guess where its sentence will be used. */
  const why = bind && bind.why ? bind.why : '';
  const bits = [(why ? why[0].toUpperCase() + why.slice(1) : '') + ': '];
  if (c && c.ok) {
    bits.push(c.minutes.say + ' minutes over ' + rf.steps + ' presses of Next'
      + (Number.isFinite(c.minutes.offer) && String(c.minutes.offer) !== c.minutes.say
        ? ' — the single figure the class sees on the door is ' + c.minutes.offer + ', the middle of that range. '
        : '. ')
      + 'The times below are the slower of the two reading rates the guided path costs this route at, '
      + 'because a plan that fits only if the class reads fast is a plan that overruns. '
      + periodVerdict(c.minutes.slow) + ' ' + roomSays(c.minutes.slow, tasksFor('core').length, true));
  } else {
    bits.push('no minute figures are printed on this page. ' + (c ? c.why : 'The clock is unchecked') + '.');
  }
  return el('p.cx-note', ...bits);
}

/**
 * What goes in the minute column of one lesson row: this segment's own span on
 * the lesson route's checked clock, the word "extension" when the route does
 * not run it, and an em-dash when the clock could not be checked — never a
 * number this file remembers.
 */
function lessonSpan(b) {
  const plan = segmentPlan(b.lesson);
  if (!plan.ok) return '—';
  /* THE ROW'S OWN BEAT, NOT ITS SEGMENT'S. A segment runs if any one of its
     beats does, so a row whose beat this lesson omits was taking the segment's
     minute span and printing it as if the class would be there. Measured on
     Lesson Two after `egypt` was demoted: the Egypt row read "8–12 min" beside
     a beat that is not in the run, because `scramble` shares its segment. */
  if (onLesson(b.beat, b.lesson) === false) return 'extension';
  const r = lessonAt(b);
  return r ? r.say + ' min' : 'extension';
}

/**
 * WHEN THE RUN STARTS, WHICH IS THE ONE CLOCK FACT THIS DESK OWNS. The wall
 * times on the board schedule are the route's own elapsed minutes added to it,
 * and it is printed in words wherever it is used so a department whose first
 * period is not at nine can see exactly what to change.
 */
export function runStartSays() {
  return 'a first period beginning at ' + wallClock(PERIOD.startsAt) + ', with '
    + PERIOD.settle + ' minutes for settling and the register before the atlas is opened';
}

/** The clock row for the segment this lesson line belongs to. */
function lessonAt(b) {
  const plan = segmentPlan(b.lesson);
  if (!plan.ok) return null;
  const seg = segmentsOf(b.lesson).find(x => x.beats.some(y => y.id === b.beat));
  const r = seg ? plan.rows.find(x => x.id === seg.id) : null;
  return r && r.on ? r : null;
}

function lesson(api, n) {
  const running = installed(api);
  const rf = routeFacts(n);
  const c = rf.clock;
  const L = rf.lesson || LESSONS[0];
  /* §8.5, THE LABELLING LAW: the name is the lesson's name, never "the lesson"
     and never a bare duration. The duration follows the name; it never replaces
     it, and it is read off the route rather than typed. */
  const title = L.name + ' — ' + L.title + (c && c.ok ? ' · ' + c.minutes.say + ' minutes' : '');
  const p = panel(title,
    el('p.tp-prose__p',
      'Teacher-led, one screen, the map never leaves it. Each beat is a link: open it before the ' +
      'lesson, or paste it into your own slides. The question at the end of each beat is the one ' +
      'worth asking out loud, and it is a question the map answers rather than one it illustrates.'),
    el('p.tp-prose__p.tp-lesson__cov',
      el('strong', 'It covers'), ' ' + L.covers + '. ',
      el('span.tp-lesson__oth', L.other + '.')),
    routeLine(n),
    el('ol.tp-lesson', ...planOf(n).map(b => el('li.tp-lesson__b',
      el('p.tp-lesson__at.num', lessonSpan(b)),
      el('div.tp-lesson__body',
        el('h4.tp-lesson__t', b.title),
        el('p.tp-lesson__do', b.do),
        /* No question, no line. A row whose beat asks nothing on screen and
           carries no teacher question printed a bare "ASK" and a space. */
        lessonAsk(b).text
          ? el('p.tp-lesson__ask', el('span.tp-lesson__askk',
            lessonAsk(b).from === 'beat' ? 'On screen' : 'Ask'), ' ' + lessonAsk(b).text)
          : null,
        /* TWO LINKS, AND THEY DO DIFFERENT THINGS. The step link rejoins the
           guided run at this stop — panel, counter and Next; the state link
           moves only the map. Round two asked for the first and it is printed
           first. It appears only when `steps.js` has checked its mirror of the
           path's own step list against the path's own count. */
        stepFor(b) ? el('p.tp-lesson__step',
          el('a.cx-more', { href: stepFor(b).href }, 'Rejoin the run here'),
          el('code.tp-lesson__link', stepFor(b).href),
          el('span.tp-lesson__stepn', stepFor(b).n + ' / ' + (stepFor(b).of || '?'))) : null,
        lessonLink(b, api.data) ? el('a.cx-more', { href: lessonLink(b, api.data) }, 'Open the map here') : null,
        lessonLink(b, api.data) ? el('code.tp-lesson__link', lessonLink(b, api.data)) : null,
        b.link && !lessonLink(b, api.data)
          ? el('p.cx-note', 'The map link for this beat needs the dataset’s last recorded year and the dataset is not readable here.')
          : null)))),
    moveBlock(n),
    el('p.cx-note',
      'Running in this build right now: ' + running.on.join(', ') +
      (running.off.length ? '. Not installed: ' + running.off.join(', ') + '.' : '.') +
      ' This line is read from the module registry as the page draws, so it cannot go stale — ' +
      'and it is the honest answer to “what does the app actually do today?”'));
  p.appendChild(el('div.tp-acts',
    /* The two labels are deliberate and the order is deliberate: the plan a
       cover teacher runs from is "the lesson plan", and the five-column table
       above it is the same lesson compressed to one side for the desk. */
    el('button.btn.btn--small', { type: 'button', onclick: () => api.print({ id: 'plan@' + n }) },
      'Print the lesson plan'),
    el('button.btn.btn--small', { type: 'button', onclick: () => api.print({ id: 'lesson@' + n }) },
      'Print it as one page instead')));
  return p;
}

/**
 * WHAT THIS ROW ASKS, AND WHO WROTE IT.
 *
 * Round nine, the phone critic, on the one-page lesson table and its twin on
 * this desk: "the step-1 row hard-codes `do:` and `ask:` for a population-share
 * question the app's step 1 does not ask… Do not leave a printed page telling a
 * teacher to ask something the projector is not asking."
 *
 * The guided path already publishes one line per beat — the question, the
 * expected answer and the common wrong answer, authored in `tours.json` beside
 * the beat and published on `tours:ready` precisely so the printed plan can
 * carry it. The printed plan has carried it since round three. This desk row
 * and the one-page table did not, and typed their own. So they ask the same
 * source now: the beat's published question first, its own band sentence
 * second, and only then the row's typed line — which is a teacher's question to
 * put to the room, not a claim about what is on the screen.
 *
 * `from` says which of the two a surface is looking at, so a sheet can label a
 * question the projector is asking differently from one the teacher asks.
 */
export function lessonAsk(row) {
  const id = row && row.beat;
  const rec = id ? beatRecord(id) : null;
  /* DOES THE BEAT ITSELF ASK THE CLASS ANYTHING? Only a beat with its own panel
     question — a `predict` beat, the kind that puts a box on screen and takes a
     number before it will reveal anything — is asking. Every other beat is
     presented, and the question worth putting to the room afterwards is the
     teacher's, not the app's; that is what this desk authors and it is not a
     claim about the screen. Asked of the beat record rather than declared on
     the row, so a beat that gains a question is picked up without an edit. */
  const asks = !!(rec && rec.panel && (rec.panel.question || rec.panel.input));
  if (asks) {
    const a = beatAnswers().get(id);
    if (a && typeof a.ask === 'string' && a.ask.trim()) return { text: a.ask.trim(), from: 'beat' };
    const q = typeof rec.panel.question === 'string' ? rec.panel.question.trim() : '';
    if (q) return { text: q, from: 'beat' };
  }
  return { text: (row && row.ask) || '', from: 'desk' };
}

/**
 * The step this lesson row rejoins the run at. A row names the BEAT it is the
 * desk's summary of, not the segment: segment 6 opens on Amritsar and this row
 * is about the exits beat two steps later, and pointing a teacher at the wrong
 * one of those is exactly the kind of off-by-two a printed page number cannot
 * afford. `pack.js` resolves the id to a checked step index, or to nothing.
 */
function stepFor(row) {
  return row && row.beat ? beatStep({ id: row.beat }, row.lesson) : null;
}

/**
 * THE FOUR TRANSFERABLE MOVES AND WHERE THIS ROUTE OFFERS THEM. Computed, so
 * that a plan cannot name a beat the lesson does not run — which is exactly
 * what happened when the default route changed from the full path to the
 * shorter one and two of the four moves stopped being offered at all.
 */
function moveBlock(n) {
  const ROUTE = routeOf(n) || lessonRoute();
  if (!ROUTE) return el('p.cx-note',
    'The four transferable moves are offered at beats on the guided run, and this build publishes '
    + 'no route for this lesson, so no beat can be named for them.');
  const plan = movePlan(ROUTE);
  const step = (id) => stepOf(id, ROUTE);
  /* HOW MANY OF THE FOUR THIS LESSON ACTUALLY OFFERS, AND HOW MANY THE UNIT
     DOES — counted, because the four moves are the app's answer to the transfer
     criterion and a move a student never meets is not transferable. Round two
     found two of four missing when the default route changed; the two-lesson
     split moves them again, and this says so on the page instead of waiting for
     a critic. The unit figure is the union over both lessons, because a student
     who does the unit meets a move offered on either. */
  const mine = plan.filter((m) => m.offered !== false).length;
  const across = new Set();
  for (const b of unitLessons()) {
    if (!b.route) continue;
    for (const m of movePlan(b.route)) if (m.offered !== false) across.add(m.n);
  }
  const orphan = plan.filter((m) => !across.has(m.n));
  return el('div.tp-moves',
    el('p.cx-panel__head', 'The four transferable moves, and where they are offered'),
    el('ol.tp-moves__l', ...plan.map(m => el('li.tp-moves__i',
      el('span.tp-moves__n', 'Move ' + m.n),
      el('span.tp-moves__t', m.name + ' — ' + (MOVE_TAILS[m.n] || m.one)),
      el('span.tp-moves__w', whereSays(m, step, stepCount(ROUTE)))))),
    el('p.cx-note',
      'Each is a ninety-second card beside the map, offered by one quiet control in the transport. '
      + say(mine) + ' of the four ' + (mine === 1 ? 'is' : 'are') + ' offered on this lesson and '
      + say(across.size) + ' across the unit’s two lessons together. '
      + (orphan.length
        ? (orphan.length === 1 ? 'Move ' + orphan[0].n + ' is' : 'Moves '
          + orphan.slice(0, -1).map((m) => m.n).join(', ') + ' and ' + orphan[orphan.length - 1].n
          + ' are')
          + ' offered on neither, because the beat'
          + (orphan.length === 1 ? ' it fires at is' : 's they fire at are')
          + ' not on either lesson’s route; ' + (orphan.length === 1 ? 'it is' : 'they are')
          + ' in the Workshop in full, and a student who takes the full route meets '
          + (orphan.length === 1 ? 'it' : 'them') + ' there. '
        : 'A student who does both lessons meets all four without opening this desk. ')
      + 'The worked examples, the mark schemes and the three non-British cases are in the Workshop.'));
}

/** One line saying where a move is offered, in steps, with its fallback. */
function whereSays(m, step, of) {
  const first = step(m.beat);
  /* NOT "offered at the “egypt” beat" WHEN THIS LESSON DOES NOT RUN EGYPT.
     `movePlan` falls back to the move's authored beat when none of them is on
     the route, which is correct at runtime — the offer never fires — and a lie
     on a printed plan. Measured after the two-lesson split: Move 3's only home
     is `egypt`, which DIDACTIC_SPEC §3.1 puts first on the demotion order, and
     both lessons' plans named it as if a class would meet it. */
  if (m.offered === false) {
    return 'not offered on this lesson: it fires at ' + (m.at || [m.beat]).map(x => '“' + x + '”').join(' or ')
      + ', which this route does not run. The move itself is in the Workshop, in full.';
  }
  if (!first) return 'offered at the “' + m.beat + '” beat';
  let out = 'offered at step ' + first + ' of ' + (of || '?');
  if (m.moved) out += ', which is not the beat it was written for — this route omits that one';
  const alt = (m.homes || []).slice(1).map(step).filter(Boolean);
  if (alt.length) {
    out += '; or step ' + alt.join(', ') + ' if that beat’s one control is already taken by another card';
  }
  return out;
}

function installed(api) {
  try {
    const r = api.registry && api.registry.report ? api.registry.report() : null;
    if (!r) return { on: ['the map, the time control, the legend and the dossier'], off: [] };
    const on = (r.mounted || []).map(m => (typeof m === 'string' ? m : m.id)).filter(Boolean);
    const off = [...(r.absent || []), ...(r.failed || []), ...(r.skipped || [])]
      .map(m => (typeof m === 'string' ? m : (m && (m.id || m.path)) || '')).filter(Boolean);
    return { on: on.length ? on : ['nothing reported'], off };
  } catch (_) {
    return { on: ['nothing reported'], off: [] };
  }
}


/* ------------------------------------------------------- B2 · the pack -- */

/**
 * THE CLASSROOM PACK. Round five, the head of history: "the teacher is
 * scripted minute by minute, the 28 students are given eight ruled lines",
 * and a non-specialist "cannot run Tuesday from the printed plan because it
 * carries no answer key". Both were true of the sheets above. Five printables
 * answer it, and they are listed here rather than buried in the printing block
 * because they are the reason a department adopts this rather than a thing a
 * department might also print.
 *
 * The tasks are the same questions at three levels of support, so the whole
 * room answers the same thing at the same moment — five per lesson now, not
 * seven per unit, because the pack is per lesson. `unit.js` holds them and the
 * answer key; nothing here restates any of it.
 */
/**
 * A PRINT BUTTON NAMED AFTER WHAT IT PRINTS.
 *
 * Measured on this tab: seventeen buttons, every one of them with the
 * accessible name "Print". Sighted readers get the name from the heading
 * beside it; a screen-reader user listing the buttons on the page gets
 * seventeen identical rows and no way to tell the answer key from the map. The
 * visible word stays "Print" — the column is narrow and the heading is right
 * there — and the accessible name carries the sheet.
 */
function printBtn(api, id, name) {
  return el('button.btn.btn--small', {
    type: 'button', 'aria-label': 'Print ' + name,
    onclick: () => api.print({ id }),
  }, 'Print');
}

function classpack(api, n) {
  const L = (routeFacts(n).lesson) || LESSONS[0];
  const rows = TIERS.map(t => {
    const list = tasksFor(t.id, n);
    const ext = list.filter(x => x.off || onLesson(x.beat, n) === false).length;
    return el('li.tp-packs__i', { 'data-pack': 'tasks-' + t.id + '@' + n },
      el('div.tp-packs__body',
        el('h4.tp-packs__t', 'Task sheet · ' + t.word,
          el('span.tp-tag', t.name)),
        el('p.tp-packs__w', t.strap + ' ' + Say(list.length) + ' task' + (list.length === 1 ? '' : 's')
          + ' for ' + L.name + (ext ? ', ' + say(ext) + ' of them marked extension because this '
            + 'build’s route does not put ' + (ext === 1 ? 'its' : 'their') + ' evidence on screen'
            : '') + '.')),
      printBtn(api, 'tasks-' + t.id + '@' + n, 'the ' + t.name.toLowerCase() + ' task sheet, '
        + t.word + ', for ' + L.name));
  });

  const missing = segmentsOf(n).reduce((a, sg) => a + coreCount(sg).off, 0);
  const keyN = TIERS.reduce((a, t) => a + tasksFor(t.id, n).length, 0);

  const p = panel('The classroom pack — ' + L.name,
    el('p.tp-prose__p',
      'Five sheets for ' + L.name + ', for somebody who has not taught this before. A plan with '
      + 'every sentence to say and every click to make. Three task sheets — the same tasks at three '
      + 'levels of support, so the whole room answers one question at a time. And a key that marks '
      + 'all ' + keyN + ' of them. The other lesson has its own five sheets; nothing here is shared '
      + 'between them, because a page written for one lesson and printed for the other is exactly '
      + 'the defect this pack was rebuilt to kill.'),
    el('ul.tp-packs',
      el('li.tp-packs__i', { 'data-pack': 'plan@' + n },
        el('div.tp-packs__body',
          el('h4.tp-packs__t', 'The lesson plan, to run cold'),
          el('p.tp-packs__w',
            Say(segmentsOf(n).length) + ' segments with the deep link for each, the words to say, the '
            + 'clicks to make, what to watch for in the room, which task the class writes, and what '
            + 'to cut if you are behind.')),
        printBtn(api, 'plan@' + n, 'the lesson plan for ' + L.name)),
      ...rows,
      el('li.tp-packs__i', { 'data-pack': 'key@' + n },
        el('div.tp-packs__body',
          el('h4.tp-packs__t', 'The answer key', el('span.tp-tag', 'teacher only')),
          el('p.tp-packs__w',
            'All ' + keyN + ' tasks, marked for a non-specialist: the answer, three band '
            + 'descriptors, the common wrong answer and why it is given, and one sentence to say '
            + 'to the class.')),
        printBtn(api, 'key@' + n, 'the answer key for ' + L.name))),
    el('p.cx-note',
      'The plan takes the guided path’s own answer lines as it prints. They are authored beside the '
      + 'beats, so what a teacher says out loud cannot drift from what a beat asks. '
      + (missing
        ? 'It also flags the ' + say(missing) + ' beat' + (missing === 1 ? '' : 's')
          + ' here that this lesson’s route does not run — nobody is told to ask about a beat their '
          + 'class never saw, and tools/check-pack.js fails the build if one is ever printed as if '
          + 'they had.'
        : 'Every beat named on these sheets is a beat this lesson’s route runs; '
          + 'tools/check-pack.js fails the build if that stops being true.')));
  return p;
}

/* ------------------------------------------------------------ C · links -- */

function links(api) {
  const out = el('input.tp-link__out', { type: 'text', readonly: true, 'aria-label': 'The link for the atlas as it stands' });
  const said = el('span.tp-link__said', { role: 'status' });

  const refresh = () => {
    let href = '';
    try { href = api.url && api.url.share ? api.url.share() : location.href; }
    catch (_) { href = location.href; }
    out.value = href;
  };
  refresh();

  const copy = el('button.btn.btn--small', { type: 'button' }, 'Copy this link');
  copy.addEventListener('click', async () => {
    refresh();
    let ok = false;
    try { await navigator.clipboard.writeText(out.value); ok = true; } catch (_) { ok = false; }
    if (!ok) { out.focus(); out.select(); }
    said.textContent = ok ? 'Copied.' : 'Selected — press ⌘C or Ctrl+C.';
    setTimeout(() => { said.textContent = ''; }, 4000);
  });

  return panel('A link that means the same thing in March',
    el('p.tp-prose__p',
      'Every state of this atlas is in its address. Set the year, pick a place, open a surface, ' +
      'then copy the link and set it the way you would set a page number. The keys below are a ' +
      'contract: they are documented in ARCHITECTURE §8 and they do not get renamed.'),
    el('div.tp-link',
      el('label.tp-link__lab', { for: 'tp-link-out' }, 'The atlas as it stands beside this desk'),
      out, copy, said),
    el('p.tp-version', 'Stamp this beside the link: ', el('span.num', api.corpus.version.string)),
    /* One record per key rather than three columns. The desk lives in the rail
       now, and a three-column table of code, example and prose asked for 282px
       of a 269px column at 900x700 — measured — which is a sideways scrollbar
       under a contract that is supposed to be easy to read. */
    el('dl.tp-keys',
      ...URL_KEYS.flatMap(([k, ex, why]) => [
        el('dt.tp-keys__k', el('code', k), el('span.tp-keys__ex', el('code', '=' + ex))),
        el('dd.tp-keys__w', why),
      ])),
    el('p.cx-note',
      'Two links to keep: ', el('a.tp-inline', { href: '#panel=evidence' }, '#panel=evidence'),
      ' opens the ledger for a class doing source work, and ',
      el('a.tp-inline', { href: '#filter=stage:apparatus' }, '#filter=stage:apparatus'),
      ' opens the atlas with everything showing, for a projector.'));
}

/* --------------------------------------------------------- D · practice -- */

function practice(api) {
  const list = el('div.tp-qs');
  const state = { type: 'all' };

  const draw = () => {
    const qs = state.type === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.type === state.type);
    fill(list, ...qs.map(q => questionNode(q, api.data)));
  };

  const chips = [{ id: 'all', label: 'All ' + QUESTIONS.length }]
    .concat(TYPES.map(t => ({ id: t.id, label: t.label + ' ' + QUESTIONS.filter(q => q.type === t.id).length })))
    .map(c => {
      const b = el('button.tp-chip', { type: 'button', 'aria-pressed': c.id === 'all' ? 'true' : 'false' }, c.label);
      if (c.id === 'all') b.classList.add('is-on');
      b.addEventListener('click', () => {
        state.type = c.id;
        b.parentNode.querySelectorAll('.tp-chip').forEach(x => {
          x.classList.toggle('is-on', x === b);
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
        draw();
      });
      return b;
    });

  const p = panel('Practice questions, with mark schemes',
    el('p.tp-prose__p',
      'Twelve questions answerable from this atlas. Each names the move it is testing, links to the ' +
      'map states its evidence lives in, and carries a mark scheme written for a student marking ' +
      'their own work — because that is who reads mark schemes.'),
    el('div.tp-led__chips', ...chips),
    list);
  draw();
  p.appendChild(el('div.tp-acts',
    el('button.btn.btn--small', { type: 'button', onclick: () => api.print({ id: 'questions' }) },
      'Print all twelve with mark schemes')));
  return p;
}

function questionNode(q, data) {
  const scheme = el('div.tp-qs__scheme', { hidden: true },
    head('What a top-band answer does'),
    el('p.tp-qs__band', q.scheme.top),
    head('What a middle-band answer does'),
    el('p.tp-qs__band', q.scheme.middle),
    head('What loses the marks'),
    el('p.tp-qs__band.tp-qs__band--floor', q.scheme.floor),
    head('Evidence a marker should expect to see'),
    el('ul.tp-qs__ev', ...q.evidence.map(e => el('li', e))));

  const toggle = el('button.cx-more', { type: 'button', 'aria-expanded': 'false' }, 'Mark scheme');
  toggle.addEventListener('click', () => {
    scheme.hidden = !scheme.hidden;
    toggle.setAttribute('aria-expanded', scheme.hidden ? 'false' : 'true');
  });

  return el('article.tp-qs__q',
    el('p.tp-qs__meta',
      el('span.tp-tag', q.type),
      el('span.tp-qs__marks.num', q.marks + ' marks'),
      el('span.tp-qs__moves', 'Move: ' + q.moves.join(' · ')),
      el('span.tp-qs__tags', q.tags.join(' '))),
    el('p.tp-qs__text', q.q),
    el('p.tp-qs__atlas', 'In the atlas: ',
      ...q.atlas
        .map(a => ({ label: a.label, href: resolveYearLink(a.href, data) }))
        .filter(a => a.href)
        .flatMap((a, i) => [i ? ' · ' : '', el('a.tp-inline', { href: a.href }, a.label)])),
    toggle, scheme);
}

/* --------------------------------------------------------- E · printing -- */

/**
 * EVERYTHING WORTH PRINTING — and eight of the twelve are now per lesson.
 *
 * DIDACTIC_SPEC §8.5: every surface that names a route says which lesson it is.
 * A sheet whose content is a lesson's — the plan, the three task sheets, the
 * key, the board, the one-page lesson — carries `@1` or `@2` in its print id
 * and its own name says which. The four that are about the atlas rather than
 * about a lesson — the ledger, the source booklet, the question paper, the map
 * — carry no lesson and never claim one.
 */
function packsFor(n, name) {
  /* THE NAME GOES ON THE PAPER, AND THE BADGE GOES ON THE CARD — NOT BOTH.
     Round two: "The pack catalogue prints the lesson name twice ('The board
     sheet — Lesson OneLesson One') on all seven lesson sheets in both lessons:
     the title suffix and the tp-tag badge are redundant." Both are wanted, in
     different places: the printed sheet's own header needs the lesson in its
     title, and the catalogue card needs the badge so seven cards in a list of
     twelve are visibly one lesson's. So each entry now carries both — `title`,
     which is what the printed page and the print button say, and `short`,
     which is what the card's heading says beside the badge. */
  const of = ' — ' + name;
  const P = (id, lesson, short, what) => ({ id, lesson, short, title: short + (lesson ? of : ''), what });
  return [
    P('plan@' + n, true, 'The lesson plan, to run cold', 'Every segment with its deep link, the words to say, the clicks to make, both answer lines for the spoken question, what to watch for, and what to cut when you are behind. Written for somebody who has not taught this before.'),
    P('tasks-core@' + n, true, 'Task sheet · Slate (core)', 'The tasks the class works from, with the room to write that each one actually needs.'),
    P('tasks-supported@' + n, true, 'Task sheet · Chalk (supported)', 'The same tasks with the scaffolding built in — a word bank, sentence starters, and one choice instead of a blank page.'),
    P('tasks-extension@' + n, true, 'Task sheet · Ink (extension)', 'The same tasks as harder judgements: the second interpretation, the criterion behind the evidence, and one case from off this map.'),
    P('key@' + n, true, 'The answer key', 'Every task on this lesson’s sheets. The answer, what weak, secure and strong look like, the wrong answer to expect, why students give it, and the one sentence to say to the class. Teacher only.'),
    P('board@' + n, true, 'The board sheet', 'This lesson’s question, the three things to hold and its own through-line sentence with the blanks. Two sides: the framing and its schedule, then the sentence and the room to answer it. Big type, a wide left margin for pencil.'),
    P('lesson@' + n, true, 'The lesson on one page', 'The beats as one table — times, what to do, what to ask, the deep link for each. One side of A4 for the desk; the plan above is the version with the answers and the script.'),
    P('revision', false, 'The revision sheet', 'Your own workshop paragraphs and your own scope placements, printed out of this browser with the questions and the mark-scheme lines beside them, and a wide margin for pencil. It prints what this desk holds and says so.'),
    P('ledger', false, 'The evidence ledger', 'Whatever is on screen in the Evidence tab, filters and sort included, one row per line, with the content version in the header.'),
    P('booklet', false, 'The source booklet', 'The atlas’s transcribed primary texts, each with what it is, who made it, what it was for, what it cannot tell you, and where to check it.'),
    P('questions', false, 'The question paper', 'Twelve questions with their mark schemes, tagged by type. Print it once and cut it up.'),
    P('map', false, 'The map as it stands', 'The map exactly as the atlas is drawing it beside this desk, at the year you left it, with its key and its caption.'),
  ];
}

function printing(api, n) {
  const L = (routeFacts(n).lesson) || LESSONS[0];
  const list = packsFor(n, L.name);
  return panel('Everything worth printing',
    el('p.tp-prose__p',
      'Twelve sheets. Seven of them are ' + L.name + '’s and say so on the page; the other five are '
      + 'about the atlas rather than about a lesson. The honest position, and it is in the Methods '
      + 'panel too: the permanent artefacts here are the printed ones. The app is the machine that '
      + 'makes a page; the page is what survives a browser upgrade. Every sheet carries the content '
      + 'version, and none of them carries any interface furniture.'),
    el('ul.tp-packs', ...list.map(p => el('li.tp-packs__i', { 'data-pack': p.id },
      el('div.tp-packs__body',
        el('h4.tp-packs__t', p.short || p.title, p.lesson ? el('span.tp-tag', L.name) : null),
        el('p.tp-packs__w', p.what)),
      printBtn(api, p.id, p.title.replace(/^The /, 'the '))))),
    el('p.cx-note',
      'Printing opens your browser’s own print dialogue on a page built for A4. '
      + 'Choose “Save as PDF” there if you want a file rather than paper.'));
}

