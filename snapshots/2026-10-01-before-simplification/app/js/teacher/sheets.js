/**
 * teacher/sheets.js — the printed classroom pack: the plan, three task sheets,
 * and the answer key.
 *
 * These are the sheets `print.js` builds when the pack id is `plan`,
 * `tasks-core`, `tasks-supported`, `tasks-extension` or `key`. They live in
 * their own file because they are the only sheets in the pack that are
 * designed as PAPER first: everything else here prints something the screen
 * already holds, and these five print things the screen never shows.
 *
 * THE WRITING ROOM IS THE POINT. Round five: "the teacher is scripted minute
 * by minute, the 28 students are given eight ruled lines." So `space()` below
 * is not decoration — it is the answer to the charge. Every task declares what
 * it needs (ruled lines at 9mm, a table with cells a pencil fits in, a loop to
 * draw, a matching column, a numbered ordering strip) and gets it. The core
 * sheet gives 30 ruled lines, a four-row table, a five-row ordering strip, a
 * loop to draw and the through-line sentence. Nothing is given fewer lines
 * than the answer in the key actually needs.
 *
 * WHERE THE ANSWERS COME FROM. Two sources and they are labelled as two.
 * `pack.beatAnswers()` is one expected line and one common-wrong line per beat,
 * authored in `tours.json` beside the beat — taken from the guided path's own
 * published key for the route it is running, and read off the authored beat for
 * every other route, because a pack is printed for a lesson the reader may not
 * be on (see `pack.js::beatAnswers`). It is what a teacher says out loud when
 * the class answers the beat. `TASKS[].key` is authored here and it marks
 * paper. Neither is a copy of the other and the printed key says which is
 * which.
 *
 * FIGURES. A key entry may name `fig`, a row id in the Evidence Ledger. The
 * value and the citation are read out of `corpus.rows` as the sheet is built.
 * If the row is gone the sheet prints that the figure could not be resolved.
 * No quantity in this file is typed as a string.
 */

import { el } from '../core/util.js';

import { fmt, resolveYearLink } from './parts.js';
import { TIERS, SEGMENTS, tasksFor, segmentOf, beatAnswers, coreCount, segmentStart, beatStep, routeFacts, segmentStops, segmentPlan, segmentIsExtension, onLesson, taskIsExtension, routeForwardEdges, segmentTags, segmentOpen, keyText, LESSONS, lessonNo, boardOf, segmentsOf, demotionOf, taskTags } from './pack.js';
import { movePlan } from './path.js';
import { stepOf } from './steps.js';
import { routeChoice, atMinute, periodVerdict, roomSays } from './timing.js';

/* ------------------------------------------------------------- helpers -- */

/** A run of ruled lines, 9mm apart. */
function rules(n) {
  return el('div.tp-paper__rules', ...Array.from({ length: n }, () => el('span.tp-paper__rule')));
}

/** THIS LESSON'S OWN through-line sentence with its blanks as ruled spaces.
 *  DIDACTIC_SPEC §8.4(3): a lesson signs the sentence it can earn, and never
 *  §2.3 entire with the other lesson's half greyed out. */
function sentenceBlanks(n) {
  const out = [];
  const b = boardOf(n) || { sentence: '' };
  for (const part of String(b.sentence).split(/(_+)/)) {
    if (!part) continue;
    if (part[0] === '_') out.push(el('span.tp-paper__blank', { style: 'width:' + Math.max(8, part.length) + 'ch' }, ''));
    else out.push(part);
  }
  return el('p.tp-paper__fill', ...out);
}

/* A clause taken off another module reads mid-sentence: `timing.js` and
   `unit.js` write their reasons to be joined onto "…, because <why>". A printed
   page starts its sentences with a capital, so a page that opens one with a
   borrowed clause capitalises it here rather than making the other module guess
   where its sentence will be used. */
function opens(t) {
  const x = String(t || '').trim();
  return x ? x[0].toUpperCase() + x.slice(1) : '';
}

/** An empty table with a header row and cells tall enough to write in. */
function grid(g) {
  const rowsN = g.rows || 3;
  const pre = g.prefill || [];
  return el('table.tp-paper__grid',
    el('thead', el('tr', ...g.cols.map(c => el('th', { scope: 'col' }, c)))),
    el('tbody', ...Array.from({ length: rowsN }, (_, r) =>
      el('tr', ...g.cols.map((_c, c) => {
        const v = (pre[r] && pre[r][c]) || '';
        return v ? el('td.tp-paper__gcell.is-given', v) : el('td.tp-paper__gcell', '');
      })))));
}

/** The revenue loop, as four boxes and four arrows with ruled labels. */
function loopFrame(prefilled) {
  const words = ['revenue', 'sepoys', 'conquest', 'more revenue'];
  const box = (i) => el('div.tp-paper__lbox',
    el('span.tp-paper__lnum', String(i + 1)),
    prefilled ? el('span.tp-paper__lword', words[i]) : null);
  const arm = (glyph) => el('div.tp-paper__larm',
    el('span.tp-paper__lgl', { 'aria-hidden': 'true' }, glyph),
    el('span.tp-paper__lrule'));
  return el('div.tp-paper__loop',
    box(0), arm('→'), box(1),
    arm('↑'), el('div.tp-paper__lmid', 'label the arrows'), arm('↓'),
    box(3), arm('←'), box(2));
}

/** Two columns to draw joining lines between. */
function matchFrame(m) {
  const n = Math.max(m.left.length, m.right.length);
  return el('table.tp-paper__match',
    el('tbody', ...Array.from({ length: n }, (_, i) => el('tr',
      el('td.tp-paper__ml', m.left[i] || ''),
      el('td.tp-paper__mgap', ''),
      el('td.tp-paper__mr', m.right[i] || '')))));
}

/** A numbered ordering strip: a small year box and a ruled line per slot. */
function orderFrame(n) {
  return el('ol.tp-paper__order', ...Array.from({ length: n }, (_, i) => el('li.tp-paper__oi',
    el('span.tp-paper__on', String(i + 1)),
    el('span.tp-paper__oyear', ''),
    el('span.tp-paper__orule'))));
}

/**
 * Everything a task asks for on paper, IN THE ORDER THE TASK ASKS FOR IT.
 *
 * `space` is an array of steps, not a bag of options, and the order on paper
 * is the order in the array. This is not tidiness: the first version of these
 * sheets rendered every space in a fixed order and printed the supported
 * sheet's tick list ABOVE the instruction "after the reveal, tick the four
 * words" — measured on the printed page, in `tasks-supported-1.png` — so a
 * student ticked before the reveal, which is the one thing the beat exists to
 * stop. A sheet whose instructions are out of order is worse than a sheet
 * with no instructions.
 */
function space(steps, lesson) {
  const out = [];
  for (const s of (steps || [])) {
    if (!s) continue;
    if (s.then) out.push(el('p.tp-paper__taskq.tp-paper__taskq--then', s.then));
    if (s.bank) out.push(el('p.tp-paper__bank', el('span.tp-paper__bankl', 'Word bank'),
      ...s.bank.flatMap((w, i) => [i ? el('span.tp-paper__banksep', '\u00b7') : null, el('span.tp-paper__bankw', w)])));
    if (s.box) out.push(el('div.tp-paper__abox', el('span.tp-paper__aboxl', s.box), el('span.tp-paper__aboxf', '')));
    if (s.circle) out.push(el('p.tp-paper__circle',
      el('span.tp-paper__circlel', 'Circle one'),
      ...s.circle.flatMap((c, i) =>
        [i ? el('span.tp-paper__csep', '\u00b7') : null, el('span.tp-paper__copt', c)])));
    if (s.ticks) out.push(el('ul.tp-paper__ticks', ...s.ticks.map(t =>
      el('li.tp-paper__tick', el('span.tp-paper__tbox', ''), t))));
    if (s.order) out.push(orderFrame(s.order));
    if (s.loop) out.push(loopFrame(s.loop === 'prefilled'));
    if (s.match) out.push(matchFrame(s.match));
    if (s.grid) out.push(grid(s.grid));
    if (s.sentence) out.push(sentenceBlanks(lesson));
    if (s.lead) out.push(el('p.tp-paper__lead', s.lead));
    if (s.rules) out.push(rules(s.rules));
  }
  return out;
}

/**
 * The four thresholds, read off the map module's own list rather than typed
 * here. `corpus.definitions` is loaded by the desk from `map/definition.js`;
 * if the map piece is absent the key says so rather than naming four words it
 * cannot check. This is the same rule the printed map sheet already follows
 * for its threshold caption.
 */
function definitionsLine(corpus) {
  const defs = corpus && corpus.definitions && corpus.definitions.list;
  if (!defs || !defs.length) {
    return el('p.tp-paper__fig', el('strong', 'The four words. '),
      'The map module is not running in this build, so the four thresholds could not be read. '
      + 'They are the four buttons above the map, and the beat names them on screen.');
  }
  return el('p.tp-paper__fig', el('strong', 'The four words, from the map’s own list. '),
    el('span.tp-paper__figv', defs.map(d => d.label || d.id).join(' · ')),
    ' — ', defs.map(d => (d.label || d.id) + ': ' + String(d.sentence || '').replace(/^drawn:\s*/, '')).join('; '), '.');
}

/** The ledger row a key entry cites, with its value and its source. */
function figureLine(id, lead, corpus) {
  const row = (corpus && corpus.rows || []).find(r => r.id === id);
  if (!row) {
    return el('p.tp-paper__fig', el('strong', 'Figure. '),
      'The ledger row ', el('code', id), ' is not in this build of the dataset, so no number is printed here.');
  }
  const value = row.quantity === 'money' ? (row.note || 'stated in prose')
    : !row.hasValue ? 'no value given'
      : (row.hasRange ? fmt(row.low) + '–' + fmt(row.high) : fmt(row.low)) + (row.unit ? ' ' + row.unit : '');
  const src = row.sources && row.sources[0]
    ? row.sources[0].author + ', ' + row.sources[0].work + (row.sources[0].year ? ' (' + row.sources[0].year + ')' : '')
      + (row.sourceLevel === 'record' ? ', record-level' : '')
    : '[unsourced]';
  /* THE RANGE, AND THE REASON FOR THE RANGE. Round two, the historian, on
     every printed quantity in the app: "no printed word may assert a figure
     without the record that warrants it", and specifically that a range with
     no stated reason teaches false precision by omission. The ledger already
     holds the counting note — who counted, how, and why the ends are that far
     apart — so the key prints it beside the number rather than leaving a
     teacher to say "somewhere between one and ten million" with nothing to add
     when a student asks why the gap is that wide. A figure with no note prints
     the absence, in words, because that is a fact about the figure. */
  return el('p.tp-paper__fig',
    el('strong', 'Figure. '), lead ? lead + ' ' : '',
    el('span.tp-paper__figv', row.subject + ' — ' + row.figure + ': ' + value),
    ' — ', row.confidence + ' confidence' + (row.contested ? ', contested' : ''),
    '. ', src, '.',
    row.quantity === 'money' ? null
      : el('span.tp-paper__fign',
        row.note ? ' ' + row.note
          : ' No counting note is recorded for this figure, so the range cannot be explained from the '
            + 'dataset. Say that to the class rather than picking an end of it.'),
    /* WHERE THE NUMBER COMES FROM, AS OPPOSED TO WHERE THE RECORD COMES FROM.
       core/warrant.js draws the distinction and the dataset now carries it:
       a WARRANT names the record that warrants THIS QUANTITY and where to look
       it up; the citation above names the works the whole record rests on.
       When a figure has a warrant this line prints it, and the teacher can
       answer "how do we know that?" from the sheet. When it has none the sheet
       says so in those words — an answer key that implies a number is checkable
       when it is not is worse for a non-specialist than one that admits it. */
    warrantNote(row));
}

function warrantNote(row) {
  const w = row.warrant;
  if (w && row.warrantText) {
    return el('span.tp-paper__figw',
      ' Where this number comes from: ' + row.warrantText
      + (row.warrantStatus === 'weak'
        ? ' The record is named and no place to look it up is: treat it as a citation to follow up, not one to quote.'
        : ''));
  }
  return el('span.tp-paper__figw',
    ' No record is filed against this number itself'
    + (row.sourceLevel === 'record'
      ? ' — the citation above backs the record it sits in, not the figure. '
      : '. ')
    + 'The Evidence Ledger flags it, and so does this line. Give it to the class as a claim with a range, not as a fact.');
}

/* ============================================================== the plan == */

/**
 * The lesson plan a cover teacher can run cold. One block per segment: the
 * link, the beats it contains and whether the default route runs them, the
 * words to say, the clicks to make, the question with BOTH answer lines from
 * tours, what to watch for in the room, which task the class writes, and what
 * to cut if the period is short.
 */
/* THE EXAMPLE ADDRESS IN THE "IF YOU LOSE THE RUN" BLOCK. Taken from a segment
   this route actually has, because a hand-typed "&step=6" is a step number on a
   route that may only have five. */
function lostExample(rf, n) {
  const mid = segmentsOf(n).map(segmentStart).filter(Boolean);
  const pick = mid[Math.min(3, mid.length - 1)];
  return pick ? pick.href : (rf.route ? '#tour=' + rf.route + '&step=1' : '#tour=…&step=…');
}

/* Small numbers are words at the head of a sentence; a printed page that opens
   "2 of the numbered stops" reads as a spreadsheet. */
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function count(n) { return WORDS[n] ? WORDS[n][0].toUpperCase() + WORDS[n].slice(1) : String(n); }

/** What the one-control bullet says on this route, from the route's own stops. */
function nextBullet() {
  const e = routeForwardEdges();
  const head = ['The whole lesson is driven by one control: ', el('strong', 'Next'), '. '];
  if (!e.known) {
    return head.concat(['This build could not read the guided path’s own step list, so this plan does '
      + 'not say what stands between the beats. Drive the run with Next and read the screen.']);
  }
  if (!e.blocking) {
    return head.concat([
      'On this route you never need anything else: it carries no Complication Gate and no argument '
      + 'between historians, so ', el('strong', 'Next is never switched off'), '. '
      /* NOT "about something met earlier in the lesson". On a short route a
         spaced recall can be a FIRST encounter — the run never taught the
         number it asks for, and says so on the card itself — so this line
         says what the control does and the stop's own block below says what
         it asks. */
      + (e.recalls
        ? (e.recalls === 1 ? 'One numbered stop below is a retrieval card'
          : count(e.recalls) + ' of the numbered stops below are retrieval cards')
          + '; nothing is disabled at ' + (e.recalls === 1 ? 'it' : 'them')
          + ', and each is scripted in full with the segment it stands in. '
        : '')
      + 'The gates and the argument are on the longer routes, and the plan for those is a different lesson.']);
  }
  return head.concat([
    'You should never need anything else — except at the ' + (WORDS[e.blocking] || e.blocking) + ' numbered '
    + (e.blocking === 1 ? 'stop' : 'stops') + ' below marked '
    + (e.gates && e.disputes ? 'Complication Gate or argument' : e.gates ? 'Complication Gate' : 'argument')
    + ', where ', el('strong', 'Next is switched off'),
    ' until somebody in the room has placed the card on the two-axis field. '
    + 'There is no right placement, the app says so on the screen, and any placement moves the run on.']);
}

/**
 * A segment's map link. Segment 7 asks for the far end of the record and
 * writes it as `@last`, because the far end of the SCRUBBER is the machine's
 * own year plus one — the defect round three's historian found printed as
 * "#year=2027" on a sheet filed in 2026. Resolved from the dataset here; if
 * the dataset cannot be read the sheet prints the instruction in words and no
 * link at all, rather than a year it cannot check.
 */
function mapLink(s, ctx) {
  const href = resolveYearLink(s.link, ctx && ctx.data);
  return href ? el('code', href) : el('span.tp-paper__nolink', 'the last year on the scrubber');
}

export function planSheet(corpus, ctx, lesson) {
  const L = lessonNo(lesson) || LESSONS[0];
  const BOARD = boardOf(L.n) || { question: '', sentence: '', hold: [] };
  const ans = beatAnswers();
  const body = el('div.tp-paper__plan');

  /* §8.5, FIRST THING ON THE PAGE. Which lesson this is, what it covers, and
     what the other one covers — so a head of department holding two of these
     can see they are two halves of one unit and not two drafts of one lesson. */
  body.appendChild(el('p.tp-paper__unit',
    el('strong', L.name + ' of two — ' + L.title + '. '),
    'It covers ' + L.covers + '. ', el('span.tp-paper__unito', L.other + '.')));

  body.appendChild(el('p.tp-paper__stand',
    'This plan assumes you have not taught this before. Everything to say is written out, the map '
    + 'never leaves the screen, and no segment asks you to leave the page you are on.'));

  const rf = routeFacts(L.n);
  const choice = { why: (rf.bind && rf.bind.why) || '' };
  const clock = rf.clock;
  const plan = segmentPlan(L.n);

  /* THE ROUTE, AND WHETHER IT FITS THE PERIOD. Every number in this paragraph
     is the guided path's own, by way of `timing.js`; this file prints no minute
     figure it did not have checked. The critic's charge was that a head of
     history plans Tuesday from a printed page that contradicts the app on the
     projector, and this paragraph is the page and the projector agreeing. */
  body.appendChild(el('p.tp-paper__stand.tp-paper__route',
    el('strong', 'The route this plans, and whether it fits. '),
    opens(choice.why) + (clock && clock.ok ? ': ' : '. '),
    clock && clock.ok
      ? (clock.minutes.say + ' minutes over ' + (rf.steps || '?') + ' presses of Next'
        + (Number.isFinite(clock.minutes.offer) && String(clock.minutes.offer) !== clock.minutes.say
          ? ' — the single figure the class sees on the door is ' + clock.minutes.offer
            + ', the middle of that range. '
          : '. ')
        + 'The clock in the left margin below is the slower of the two reading rates the guided path '
        + 'costs this route at, because a plan that fits only when the class reads fast is a plan '
        + 'that overruns. ' + periodVerdict(clock.minutes.slow))
      /* THE ROUTE'S OWN REASON IS ALREADY THE FIRST HALF OF THIS SENTENCE.
         Printing `clock.why` again after it repeated the whole clause on any
         lesson the guided path publishes no route for — measured on Lesson
         Two's plan, which said it twice in one paragraph. */
      : 'No times are printed on this plan, and no step numbers either.'));

  /* WHAT THE CLOCK PRICES, AND WHAT IT DOES NOT. The paragraph above is the
     atlas; this one is the room. Round nine's classroom critic called "leaves
     1 minute in hand" the most misleading sentence in the pack, because the
     seven written tasks below it were budgeted at nothing. `timing.js` owns
     the arithmetic; this prints it. */
  if (clock && clock.ok) {
    body.appendChild(el('p.tp-paper__warn.tp-paper__room',
      el('strong', 'And what the clock does not price. '),
      roomSays(clock.minutes.slow, tasksFor('core', L.n).length)));
  }

  body.appendChild(el('h2.tp-paper__h2', 'The sixty seconds before the bell'));
  body.appendChild(el('ol.tp-paper__pre',
    el('li', rf.route
      ? [el('span', 'Open the atlas and press '), el('code', '#tour=' + rf.route + '&step=1'),
        el('span', '. That starts “' + rf.label + '”'
          + (rf.steps ? ', which is ' + rf.steps + ' steps long' : '') + '.')]
      : ['Open the atlas. The guided path is not running in this build, so there is no run to start; '
        + 'the segment links below move the map only.']),
    el('li', 'Print one task sheet per student. Three versions exist and they look identical from the back of the room: '
      + TIERS.map(t => t.name + ' (“' + t.word + '”)').join(', ') + '.'),
    el('li', 'Keep this plan and the answer key on the desk. The answer key is a separate sheet and is not for students.'),
    el('li', 'Write this lesson’s question on the board: “' + BOARD.question + '”'),
    /* HOW MANY STOPS, AND WHETHER THEY BLOCK — COUNTED, NOT PROMISED. This
       bullet used to say "the four numbered stops"; four was the previous
       default route's count, and a route with no gates on it sends a cover
       teacher hunting for a control that is not there. */
    el('li', ...nextBullet())));

  /* IF YOU LOSE THE RUN. Round two, tagged to this pack: "a cover teacher who
     loses the run has to restart from step 1." Every segment below now prints
     the step it begins at, and this block says what a step link does and — the
     part that matters, and that the round-two panel found by measurement — what
     it does NOT do when it is opened cold. */
  if (rf.ok && rf.steps) {
    body.appendChild(el('p.tp-paper__warn.tp-paper__lost',
      el('strong', 'If you lose the run. '),
      'Every segment below starts at a numbered step — ', el('code', lostExample(rf, L.n)),
      '. Type it and the lesson comes back at that stop: map, panel, counter and ', el('strong', 'Next'),
      ', with everything the class has committed in this browser still counted. Opened on a machine that '
      + 'has not run the lesson, a step link starts an empty record — it rejoins the run, it cannot invent '
      + 'the lesson before it, so the ending will show most of its lines greyed. For the '
      + 'ending, start at step 1: the whole run is ' + rf.steps + ' presses of Next. The ',
      el('code', '#year=…'), ' link beside it moves the map only.'));
  } else {
    body.appendChild(el('p.tp-paper__warn',
      'This build could not confirm the guided path’s step numbering, so no step numbers are printed '
      + 'below and the segment links move the map only. ' + opens(rf.why || '')
      + (rf.route ? ' Start the run at #tour=' + rf.route + '&step=1 and drive it with Next.' : '')));
  }

  body.appendChild(el('h2.tp-paper__h2', 'What the class is doing while you talk'));
  /* NOT "SEVEN TASKS". The pack is per lesson now and the lessons are not the
     same length; a printed plan that says seven while the sheet beside it
     carries five is the same defect as a printed minute figure nobody
     computed. Counted off this lesson's own sheet. */
  const nTasks = tasksFor('core', L.n).length;
  body.appendChild(el('p.tp-paper__stand',
    count(nTasks) + ' task' + (nTasks === 1 ? '' : 's') + ' on this lesson’s sheet, the same '
    + count(nTasks).toLowerCase() + ' at three levels of support — so the whole room is '
    + 'answering one question at a time and you can take an answer from anyone. Every task is marked '
    + 'in the answer key.'));

  /* THE FOUR TRANSFERABLE MOVES, AND WHERE THIS ROUTE OFFERS THEM. A cover
     teacher planning to the minute has to know that four times in the lesson a
     quiet second control appears in the transport and a student who presses it
     spends a minute and a half on a card this desk owns. Where each one fires is
     COMPUTED from the route, not typed: two of the four silently moved beat when
     the default route changed, and a printed plan that names a beat the lesson
     does not run is worse than one that names none. */
  const ROUTE = rf.route;
  const moves = movePlan(ROUTE).map(m => ({ m, at: stepOf(m.beat, ROUTE), alt: (m.homes || []).slice(1).map(x => stepOf(x, ROUTE)).filter(Boolean) }));
  if (rf.ok && moves.some(x => x.at)) {
    /* HOW MANY OF THE FOUR THIS LESSON OFFERS, COUNTED. "Four times in the run"
       was typed, and after the two-lesson split it was wrong on both lessons:
       Lesson One offers one of the four and Lesson Two two, because two of the
       moves fire only at beats the other lesson has and one fires only at
       `egypt`, which DIDACTIC_SPEC §3.1 puts first on the demotion order. A
       cover teacher told to expect four quiet controls goes looking for three
       that are not there. */
    const on = moves.filter(({ m }) => m.offered !== false);
    const off = moves.filter(({ m }) => m.offered === false).map(({ m }) => m.n);
    body.appendChild(el('h2.tp-paper__h2', 'The transferable moves, on this lesson'));
    body.appendChild(el('p.tp-paper__end',
      count(on.length) + ' time' + (on.length === 1 ? '' : 's') + ' in this run a second, quieter '
      + 'control appears beside ', el('strong', 'Next'),
      '. It offers a ninety-second card that names one exam move and asks the class to commit to an '
      + 'answer. Take it if you have the minute; nothing at all happens if you do not, and all four '
      + 'are in full in the Workshop either way. Where they fall: ',
      ...on.map(({ m, at, alt }, i) => el('span.tp-paper__movew',
        (i ? ' · ' : '') + 'Move ' + m.n + ' ' + m.name.toLowerCase()
        + (at ? ', step ' + at + (alt.length ? ' or ' + alt.join(' or ') : '') : ''))),
      '.',
      off.length ? el('span.tp-paper__movew',
        ' Move' + (off.length === 1 ? ' ' + off[0] + ' is' : 's ' + off.join(' and ') + ' are')
        + ' not offered on this lesson — the beat' + (off.length === 1 ? '' : 's')
        + ' they fire at ' + (off.length === 1 ? 'is' : 'are') + ' not on this route.') : null));
  }

  for (const s of segmentsOf(L.n)) {
    const c = coreCount(s);
    const start = rf.ok ? segmentStart(s) : null;
    const beats = s.beats.map(b => {
      const a = ans.get(b.id);
      const st = beatStep(b, L.n);
      const on = onLesson(b.id, L.n);
      return el('li.tp-paper__beat',
        st && st.lesson && !b.optional ? el('span.tp-paper__beatn', 'step ' + st.n) : null,
        el('span.tp-paper__beath', '“' + b.head + '”'),
        b.optional
          ? el('span.tp-paper__beato', ' — offered past the end of the run, not part of it'
            + (st ? '; ' + st.href : ''))
          : on === true ? null
            : on === false
              ? el('span.tp-paper__beato', ' — extension' + (st ? '; ' + st.href : ''))
              : null,
        a && a.mark ? el('span.tp-paper__beatm', ' (' + a.mark + ')') : null);
    });

    /* AN ANSWER LINE FOR A BEAT THIS LESSON DOES NOT RUN IS STILL WORTH
       PRINTING — a teacher who takes the extension needs it — but it must not
       sit unlabelled in a column headed "Ask", beside four questions the
       projector really does ask. It carries the same mark the step line above
       it carries. */
    const askBlock = [];
    for (const b of s.beats) {
      const a = ans.get(b.id);
      if (!a) continue;
      const bOff = !b.optional && onLesson(b.id, L.n) === false;
      askBlock.push(el('div.tp-paper__ans' + (bOff || b.optional ? '.tp-paper__ans--ext' : ''),
        el('p.tp-paper__ansq', a.ask || '',
          b.optional ? el('span.tp-paper__anse', ' — offered past the end of the run')
            : bOff ? el('span.tp-paper__anse', ' — extension; not asked on this lesson') : null),
        el('p.tp-paper__ansa', el('strong', 'The answer. '), a.expected),
        el('p.tp-paper__answ', el('strong', 'If they say… '), a.commonWrong)));
    }
    if (!askBlock.length) {
      askBlock.push(el('p.tp-paper__answ',
        'The guided path is not running in this build, so the beat answer lines could not be read. '
        + 'The task answers on the answer key are unaffected.'));
    }

    const row = plan.rows.find(r => r.id === s.id) || null;
    const ext = segmentIsExtension(s);
    body.appendChild(el('section.tp-paper__seg' + (ext ? '.tp-paper__seg--ext' : ''),
      el('p.tp-paper__segn',
        el('span.tp-paper__segt', plan.ok ? (row && row.on ? row.say + ' min' : 'extension') : '—'),
        plan.ok && row && row.on ? el('span.tp-paper__segwall', atMinute(row.startMin)) : null,
        el('span.tp-paper__segd', s.title),
        el('span.tp-paper__segk', (tg => [...tg.t, ...tg.lo, ...tg.m].join(' · '))(segmentTags(s)))),
      start
        ? el('p.tp-paper__seglink',
          el('strong', 'The run should be here. '), el('code', start.href),
          ' — step ' + start.n + ' of ' + (start.of || '?') + '; the counter on screen reads “'
          + start.n + ' / ' + (start.of || '?') + '”. ',
          /* `segmentOpen()`, not `s.open`: the "longest"/"shortest segment"
             claims are computed off the same clock as the minute column. Two of
             them were typed and one was false — round nine, the classroom
             critic. */
          el('span.tp-paper__seglink2', 'The map alone: '), mapLink(s, ctx), ' — ' + segmentOpen(s))
        : el('p.tp-paper__seglink', el('strong', 'Put the map here. '), mapLink(s, ctx),
          ' — ' + segmentOpen(s)),
      el('ul.tp-paper__beats', ...beats),
      /* A STOP IS A STEP A COVER TEACHER HAS TO RUN, so a recall stop gets the
         same Say / Ask / The answer / Why block a beat segment gets. Every word
         of it is authored elsewhere — the run's own sentence in `tours.json`,
         the question, the answer and the reason in the quiz bank, with the
         answer's figures already read out of the dataset — and `pack.js`
         collects it. Round nine, the classroom critic: "Step 7 asks a whole
         class to guess the Bengal 1943 death toll and a cover teacher has
         nothing to say when a hand goes up." */
      ...segmentStops(s).map(st => (st.script
        ? el('div.tp-paper__stopc',
          el('p.tp-paper__stop', el('span.tp-paper__beatn', 'step ' + st.n), ' ' + st.says),
          st.script.say ? el('p.tp-paper__stopl',
            el('strong', 'On screen. '),
            (st.script.mark ? '“' + st.script.mark + '” — ' : ''), st.script.say) : null,
          st.script.ask ? el('p.tp-paper__stopl', el('strong', 'It asks. '), st.script.ask) : null,
          st.script.answer ? el('p.tp-paper__stopl', el('strong', 'The answer. '), st.script.answer)
            : el('p.tp-paper__stopl', el('strong', 'The answer. '),
              'The retrieval bank is not running in this build, so it could not be read here. '
              + 'The card prints it on screen when the class commits.'),
          /* The quiz bank authors no common-wrong line for a retrieval card —
             the wrong answers are numbers and there are infinitely many — so
             the block carries the card's own `because` instead, which is the
             paragraph a teacher needs when a hand goes up and asks why the
             figure is a range. */
          st.script.why ? el('p.tp-paper__stopw', el('strong', 'Why the number is what it is. '),
            st.script.why) : null)
        : el('p.tp-paper__stop',
          el('span.tp-paper__beatn', 'step ' + st.n), ' ' + st.says))),
      c.off ? el('p.tp-paper__warn',
        'This lesson does not run ' + offNames(s) + '. '
        + (c.off === 1 ? 'That beat is extension' : 'Those beats are extension')
        + ' — the step link beside ' + (c.off === 1 ? 'it' : 'them') + ' above names the route that '
        + 'does carry ' + (c.off === 1 ? 'it' : 'them') + ' — so do not ask the class about '
        + (c.off === 1 ? 'it' : 'them') + ' unless you started the run there.') : null,
      c.off ? demotionNote(s) : null,

      el('p.tp-paper__lab', 'Say'),
      el('ul.tp-paper__say', ...s.say.map(x => el('li', x))),

      el('p.tp-paper__lab', 'Do'),
      el('ol.tp-paper__dolist', ...s.do.map(x => el('li', x))),

      el('p.tp-paper__lab', 'Ask, and what to do with the answer'),
      ...askBlock,

      el('p.tp-paper__watch', el('strong', 'Watch for. '), s.watch),
      el('p.tp-paper__write', el('strong', 'They write. '),
        taskCall(s) + extensionTiers(s)),
      el('p.tp-paper__short', el('strong', 'If you are behind. '), s.ifShort)));
  }

  /* The closing instruction is an instruction, not a standfirst: it is set to
     the plan's own body measure rather than the 150mm standfirst measure,
     which is also what keeps the sheet to five sides. */
  /* WHAT TO READ FIRST, AND IT IS NOT A TASK NUMBER.
     This line used to say "read Task 7 first" on a sheet that carries five
     computed tasks — round two, the classroom critic — and no task on any tier
     asks for the through-line sentence at all. The sentence is on the BOARD
     sheet, with its blanks, and the last plan row's own `ask` is what sets it
     ("Write the through-line sentence from the board in your own words"). So
     the line names the board sheet, and names the last task by a number it
     computes rather than one it remembers. */
  body.appendChild(el('h2.tp-paper__h2', 'At the end'));
  body.appendChild(el('p.tp-paper__end',
    'Take the sheets in and read the through-line sentence first — the one on the board sheet, '
    + 'with the blanks, that the last segment gives them sixty seconds of silence to write. A '
    + 'student who can write it in their own words has the shape of ' + L.name
    + '; one who cannot has usually lost one engine, and the answer key says which and where to '
    + 'send them back to. Then ' + lastTaskSay(L.n) + '.'));

  /* THE TITLE ON THE PAPER IS THE ROUTE'S OWN LENGTH. It said "thirty minutes"
     while the app on the projector said fifty-five. */
  return {
    /* §8.5, THE LABELLING LAW: the name is the lesson's name. It used to be
       the route's label or a bare duration, so Lesson Two's plan printed
       "Lesson plan — no guided route, run cold" — a title that names no lesson
       and reads as a fault report. */
    title: 'Lesson plan — ' + L.name + ': ' + L.title
      + (clock && clock.ok ? ' · ' + clock.minutes.say + ' minutes' : '') + ', run cold',
    node: body,
  };
}

/**
 * THE BEATS IN THIS SEGMENT THE LESSON ROUTE LEAVES OUT, NAMED — and named for
 * THIS lesson.
 *
 * `onLesson(beatId, lesson)` defaulted its second argument to 1, and this call
 * did not pass one, so every beat on LESSON TWO's plan was asked about Lesson
 * One's route. Measured on the printed page: segment s8 listed “The war the
 * empire fought” at step 7 and “How did they leave?” at step 8 — both on the
 * route, both with a step number beside them — and then, four lines below,
 * "This lesson does not run “The war the empire fought”, “How did they leave?”
 * or “Two men, one garden”. That beat is extension … so do not ask the class
 * about it." One segment, two contradictory instructions, in a document whose
 * whole purpose is that a cover teacher can run it without checking.
 *
 * The singular "That beat" in that sentence was the tell: `coreCount` asked the
 * right route and counted one, while this function named three.
 */
function offNames(seg) {
  const off = offBeats(seg).map(b => '“' + b.head + '”');
  if (off.length <= 1) return off[0] || '';
  return off.slice(0, -1).join(', ') + ' or ' + off[off.length - 1];
}

/** The same beats, as records, so the sentence around them can say WHY. */
function offBeats(seg) {
  return seg.beats.filter(b => !b.optional && onLesson(b.id, seg.lesson) === false);
}

/**
 * WHY THE BEAT IS NOT ON THE LESSON, WHEN DIDACTIC_SPEC §8 SAYS SO ITSELF.
 *
 * Round two, the rubric scorer and the historian: §8 makes T12 the first item
 * on Lesson Two's demotion order and the route demoted it exactly as published,
 * so a page that presents the loss as an accident — or as the route lagging —
 * is telling a head of history the app is behind when it is not. Where §8 names
 * the demotion, the plan says so and says what still carries the objective.
 */
function demotionNote(seg) {
  const said = offBeats(seg)
    .map(b => ({ b, d: demotionOf(seg.lesson, b.id) }))
    .filter(x => x.d);
  if (!said.length) return null;
  return el('p.tp-paper__warn',
    el('strong', 'And this is deliberate. '),
    said.map(({ b, d }) => '“' + b.head + '” (' + d.t + ') is item ' + (d.i + 1) + ' on the '
      + 'demotion order DIDACTIC_SPEC §8 publishes for this lesson, and this build’s route took '
      + 'it so the lesson ends inside the period.').join(' '),
    ' It is printed above with the step link of a route that does run it, for anyone who has the '
    + 'time; nothing the class is asked to write depends on it.');
}

/**
 * WHICH TIERS OF THIS SEGMENT'S TASK ARE EXTENSION ON THIS ROUTE, named on the
 * plan so a cover teacher knows before the lesson which sheets have a task the
 * class cannot answer from what it has seen — rather than finding out from a
 * hand in the air.
 */
function extensionTiers(seg) {
  const off = TIERS
    .map(t => ({ t, task: tasksFor(t.id, seg.lesson).find(x => x.seg === seg.id) }))
    .filter(x => x.task && taskIsExtension(x.task) === true)
    .map(x => x.t.word + ' (' + x.t.name + ')');
  if (!off.length) return '';
  return ' ' + (off.length === 1 ? 'On ' + off[0] + ' that task is extension'
    : 'On ' + off.slice(0, -1).join(', ') + ' and ' + off[off.length - 1] + ' that task is extension')
    + ': this route does not run the beat it is about, so it is offered, not set.';
}

/**
 * THE TASK NUMBER ON THE SHEET, WHICH IS NOT THE SEGMENT'S POSITION IN THE PLAN.
 *
 * It used to be. `taskNumber(seg)` returned the segment's index in its lesson,
 * and a segment that hosts TWO tasks — the spine and the crossing on Lesson
 * One, Berlin and Egypt on Lesson Two — puts the two out of step for every
 * segment after it. Measured on the printed pack: Lesson One's segment s3 “Who
 * resisted, and who was paid” said "They write. Task 3", and Task 3 on the
 * sheet in front of the class is the crossing, in the segment before it. The
 * key repeated the same wrong number as its own segment heading.
 *
 * So the number is read off the TASKS, which is where a student reads it, and a
 * segment that sets two says both. The tiers can also differ — Lesson Two's
 * third task is Egypt on Slate and Chalk and the two-track timeline on Ink —
 * and where they do, the numbers are stated per tier rather than under a claim
 * that all three sheets agree. `tools/check-pack.js` rule H fails the build if
 * a segment's tiers disagree in a way this sentence does not say.
 */
function taskNumbersOf(seg) {
  const per = new Map();
  for (const t of TIERS) {
    const ns = tasksFor(t.id, seg.lesson).filter(x => x.seg === seg.id).map(x => x.n);
    per.set(t, ns.sort((a, b) => a - b));
  }
  return per;
}

const numList = (ns) => (ns.length === 1 ? 'Task ' + ns[0]
  : 'Tasks ' + ns.slice(0, -1).join(', ') + ' and ' + ns[ns.length - 1]);

/** The plan's "They write" line, in words that are true of all three sheets. */
function taskCall(seg) {
  const per = taskNumbersOf(seg);
  const shapes = new Set([...per.values()].map(ns => ns.join(',')));
  const any = [...per.values()].find(ns => ns.length);
  if (!any) return 'Nothing on the task sheet is set at this segment.';
  if (shapes.size === 1) {
    return numList(any) + ' on the task sheet — all three versions, same number.';
  }
  const has = [...per].filter(([, ns]) => ns.length);
  const none = [...per].filter(([, ns]) => !ns.length).map(([t]) => t.word);
  return 'The three sheets are not the same here. '
    + has.map(([t, ns]) => numList(ns) + ' on ' + t.word + ' (' + t.name + ')').join('; ')
    + (none.length
      ? '; and nothing at this segment on ' + (none.length === 1 ? none[0]
        : none.slice(0, -1).join(', ') + ' and ' + none[none.length - 1])
        + ' — those sheets set their task at another segment, so do not send the room to a number '
        + 'that is not on the paper in front of them'
      : '')
    + '.';
}

/** The same, for a heading: the numbers only. */
function taskHead(seg) {
  const per = taskNumbersOf(seg);
  const all = [...new Set([...per.values()].flat())].sort((a, b) => a - b);
  return all.length ? numList(all) : 'No task';
}

/** The last task of a lesson, by the number the sheet actually prints on it. */
function lastTaskSay(n) {
  const segs = segmentsOf(n);
  for (let i = segs.length - 1; i >= 0; i--) {
    const per = taskNumbersOf(segs[i]);
    const all = [...new Set([...per.values()].flat())].sort((a, b) => a - b);
    if (all.length) {
      return numList([all[all.length - 1]]) + ', which is the one written at the ending, '
        + 'against the key';
    }
  }
  return 'the last task on the sheet against the key';
}

/* ======================================================== the task sheets == */

export function taskSheet(tierId, lesson) {
  const L = lessonNo(lesson) || LESSONS[0];
  const tier = TIERS.find(t => t.id === tierId) || TIERS[0];
  const tasks = tasksFor(tier.id, L.n);
  const body = el('div.tp-paper__tasks');

  body.appendChild(el('div.tp-paper__namebar',
    el('span.tp-paper__namel', 'Name'), el('span.tp-paper__namef', ''),
    el('span.tp-paper__namel', 'Class'), el('span.tp-paper__namef.tp-paper__namef--sm', ''),
    el('span.tp-paper__namel', 'Date'), el('span.tp-paper__namef.tp-paper__namef--sm', '')));

  body.appendChild(el('p.tp-paper__unit',
    el('strong', L.name + ' of two — ' + L.title + '. '),
    'This sheet is for ' + L.name + ' only. ', el('span.tp-paper__unito', L.other + '.')));
  body.appendChild(el('p.tp-paper__stand', tier.note));

  const rt = routeFacts(L.n);
  const tplan = segmentPlan(L.n);
  if (rt.ok && rt.steps) {
    /* THE EXAMPLE IS ONE OF THIS SHEET'S OWN CHIPS, NOT A NUMBER CHOSEN TO
       LOOK LIKE ONE. It read `screen: 6 / 9`, which on Lesson One is a real
       step of the route and no task's anchor — an invented number in the one
       paragraph telling a class how to read the real ones. */
    const sample = (() => {
      for (const t of tasks) {
        const st = t.beat ? beatStep({ id: t.beat }, L.n) : null;
        if (st && st.lesson) return st.n;
      }
      return null;
    })();
    body.appendChild(el('p.tp-paper__standsm',
      'The grey number beside each task — ',
      el('code', sample ? 'screen: ' + sample + ' / ' + rt.steps : 'screen: n / ' + rt.steps),
      ' — is what the counter at the top of the atlas should read while you are answering it. '
      + 'If it does not match, you are on the wrong task or the class has moved on.'
      + (tplan.ok ? ' A task marked EXTENSION is not on this lesson: it is there for anyone who '
        + 'finishes, and nobody is behind for leaving it.' : '')));
  }

  /* THE NUMBER IN THE CORNER OF THE SCREEN. The guided path's counter reads
     "6 / 15" while the class works, so a student who has lost their place can
     match it against the task in front of them without asking. It is printed
     only when `steps.js` has checked the numbering against the path's own
     count; an unchecked build simply prints no chip. */
  for (const t of tasks) {
    const seg = segmentOf(t);
    /* THE ANCHOR IS THE TASK'S OWN BEAT, NOT ITS SEGMENT'S FIRST.
       Round two, the classroom critic: "Task 3 on the Lesson One core sheet
       prints 'screen: 2 / 9' for a beat the plan itself lists at step 3, and
       shares that anchor with Task 2 — on a sheet whose own rubric says a
       mismatch means 'you are on the wrong task'." A segment can host two
       tasks: Task 2 is the spine and Task 3 is the crossing, one press apart,
       and printing the segment's opening step on both made the sheet's own
       instruction unfollowable. `beatStep` answers for the task's beat on this
       lesson's route, and falls back to the segment's start where a task names
       no beat. */
    const own = t.beat ? beatStep({ id: t.beat }, L.n) : null;
    const start = (own && own.lesson) ? own : segmentStart(seg);
    /* A TASK KEYED TO A BEAT THE CLASS NEVER SAW IS A TASK NOBODY CAN ANSWER.
       So a task whose own beat this route does not run is marked EXTENSION on
       the student's own sheet, in the same place the step chip would be. */
    const ext = taskIsExtension(t) === true;
    body.appendChild(el('section.tp-paper__task' + (ext ? '.tp-paper__task--ext' : ''),
      el('p.tp-paper__taskn',
        el('span.tp-paper__taskno', 'Task ' + t.n),
        /* THE TASK'S OWN TITLE where it has one. A segment can host two tasks
           — the spine and the crossing, Berlin and Egypt — and printing the
           segment's title on both told a class the two questions were the same
           question. */
        el('span.tp-paper__taskt', t.title || seg.title),
        ext ? el('span.tp-paper__taskext', 'extension')
          : start ? el('span.tp-paper__taskstep', 'screen: ' + start.n + ' / ' + (start.of || '?')) : null,
        el('span.tp-paper__taskk', taskTags(t, seg).t.join(' \u00b7 '))),
      el('p.tp-paper__taskq', t.prompt),
      ...space(t.space, L.n)));
  }

  return { title: 'Task sheet · ' + tier.word + ' — ' + tier.name + ' · ' + L.name + ': ' + L.title,
    node: body };
}

/* ========================================================== the answer key == */

export function keySheet(corpus, ctx, lesson) {
  const L = lessonNo(lesson) || LESSONS[0];
  const ans = beatAnswers();
  const kplan = segmentPlan(L.n);
  const body = el('div.tp-paper__answers');

  body.appendChild(el('p.tp-paper__unit',
    el('strong', L.name + ' of two — ' + L.title + '. '),
    'This key marks ' + L.name + '’s three sheets only. ',
    el('span.tp-paper__unito', L.other + ', and has its own key.')));

  body.appendChild(el('p.tp-paper__stand',
    'For the teacher. Every task on all three sheets, with the answer, what a weak, a secure and a '
    + 'strong response looks like, the wrong answer classes actually give, why they give it, and the '
    + 'one sentence to say back. You do not need to know this topic to mark with this sheet.'));

  body.appendChild(el('h2.tp-paper__h2', 'How to use it'));
  body.appendChild(el('ul.tp-paper__how',
    el('li', el('strong', 'Weak / secure / strong'), ' are descriptors, not marks. Map them to your own '
      + 'department’s bands. A secure answer is the one most of the room should reach.'),
    el('li', el('strong', 'Say this'), ' is written to be said out loud to the whole class the first time '
      + 'the wrong answer appears. It corrects without closing the question down.'),
    el('li', el('strong', 'On the beat'), ' lines are the guided path’s own answers, authored beside '
      + 'the beats. They are for the spoken question in the lesson, not for marking paper.'),
    el('li', el('strong', 'The minutes in the margin'), ' are this lesson’s own route, costed by the '
      + 'guided path and checked against its published total — the same clock the lesson plan and the '
      + 'task sheets carry. A task marked ', el('strong', 'extension'), ' is one this route does not '
      + 'reach; mark it if it comes back, but nobody is behind for leaving it.')));

  for (const seg of segmentsOf(L.n)) {
    const segTasks = TIERS.flatMap(t => tasksFor(t.id, L.n).filter(x => x.seg === seg.id));
    const beatLines = seg.beats.map(b => ans.get(b.id)).filter(Boolean);

    const start = segmentStart(seg);
    const krow = kplan.rows.find(r => r.id === seg.id) || null;

    body.appendChild(el('section.tp-paper__kseg',
      el('p.tp-paper__segn',
        el('span.tp-paper__segt', kplan.ok
          ? (krow && krow.on ? krow.say + ' min' : 'extension')
          : '—'),
        el('span.tp-paper__segd', taskHead(seg) + ' · ' + seg.title),
        start ? el('span.tp-paper__segstep', start.href) : null,
        el('span.tp-paper__segk', segmentTags(seg).t.join(' · '))),

      ...(beatLines.length ? beatLines.map(a => el('p.tp-paper__kbeat',
        el('strong', 'On the beat. '), a.ask ? a.ask + ' — ' : '', a.expected,
        el('span.tp-paper__kbeatw', ' They usually say: ' + a.commonWrong))) : []),

      ...segTasks.map(t => {
        const tier = TIERS.find(x => x.id === t.tier);
        const kext = taskIsExtension(t) === true;
        return el('article.tp-paper__ktask' + (kext ? '.tp-paper__ktask--ext' : ''),
          /* THE TASK'S OWN TITLE ON THE TIER LINE. A segment can host two
             tasks, so the key printed six articles under one heading with
             nothing but "Slate · Core" to tell them apart — and a
             non-specialist marking thirty scripts on a Wednesday evening has to
             be able to find the question in front of them. */
          el('p.tp-paper__ktier', tier.word + ' · ' + tier.name
            + (t.title ? ' · ' + t.title : '')
            + (kext ? ' · extension on this route' : '')),
          el('p.tp-paper__kq', t.prompt),
          el('dl.tp-paper__kdl',
            /* `keyText`, not the raw string: the model answer's one counted
               quantity is a token the dataset fills in, so the key, the Close
               and the beat's own panel cannot print three different numbers for
               the same thing. */
            el('dt', 'The answer'), el('dd', keyText(t.key.answer, ctx && ctx.data)),
            el('dt', 'Weak'), el('dd', t.key.weak),
            el('dt', 'Secure'), el('dd', t.key.secure),
            el('dt', 'Strong'), el('dd', t.key.strong),
            el('dt', 'The wrong answer to expect'), el('dd', t.key.wrong),
            el('dt', 'Why they give it'), el('dd', t.key.why)),
          el('p.tp-paper__ksay', el('span.tp-paper__ksayl', 'Say this'), t.key.say),
          t.key.defs ? definitionsLine(corpus) : null,
          t.key.fig ? figureLine(t.key.fig, t.key.figLead, corpus) : null);
      })));
  }

  return { title: 'Answer key — ' + L.name + ': ' + L.title, node: body };
}

export default { planSheet, taskSheet, keySheet };
