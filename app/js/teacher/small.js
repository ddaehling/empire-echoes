/**
 * teacher/small.js — WHAT THE TEACHING DESK SAYS WHEN THERE IS NOT ROOM TO READ IT.
 *
 * ============================== THE CHARGE ================================
 * Wave 9: "the Teaching desk is one tap from the student's Tools menu and is
 * UNREADABLE at 390x844 — either make it readable there or make it honestly
 * unavailable on a phone with a line saying where to find it."
 *
 * Both halves were true, and here is the measurement, taken on the running app
 * with `tools/scenarios/pk/06-window.js` before a line of this file existed:
 *
 *     390x844    the sheet is 280px, the scroller inside it 223px, and the
 *                Classroom tab holds 14,493px of content — 65 SCREENFULS
 *     844x390    265px window, 18,141px of content — 68 screenfuls
 *     740x360    235px window, 18,710px — 80 screenfuls
 *     768x1024   223px window, 10,432px — 47 screenfuls
 *     900x700    571px window — 33
 *     1366x768   660px — 22
 *     1440x900   792px — 17
 *
 * RESPONSIVE_LAW §11 sets the floor for a readable window at 390 at 400px, and
 * `tools/scenarios/read.js` fails the build when the guided path's beat panel
 * is under it. The desk gets 223. Three lines of prose, and a lesson plan
 * behind them.
 *
 * =========================== WHY NOT JUST FIX IT ==========================
 * Because the 223 is not this module's to change. The rail sheet's height at
 * phone widths is the shell's — `.app__sheet`, LAYOUT_BUDGET §3 — and the
 * reading-mode control that expands the guided path's panel does not expand the
 * sheet when the desk is in it (measured: pressing "Read" leaves it at 280).
 * Shortening the desk would not help either: a tenth of 14,493px is still six
 * screenfuls through a letterbox. THE LETTERBOX IS THE PROBLEM, not the length.
 *
 * And the desk is not a surface a phone can use even when it can scroll it. Of
 * its four sections, three are paper: twelve A4 sheets and a print dialogue, an
 * 898-row evidence ledger sorted eleven ways, and four worked exam paragraphs
 * with mark schemes. A phone has no printer and no second window to check a
 * source in. This is a teacher at a desk on a Monday evening, and saying so is
 * more use than a scrollable ruin.
 *
 * ============================== SO: HONESTLY ==============================
 * Under the floor the desk prints ONE SCREEN instead of the document. It says
 * what it is, what is in it, the measured reason it is not here, and exactly
 * where to find it — the same address, on a wider screen. It also does the one
 * thing a phone genuinely can: it names the unit's two lessons and their honest
 * lengths (DIDACTIC_SPEC §8.5) and offers a control that starts one, because a
 * teacher who opened this on the bus is deciding what to teach, not printing.
 *
 * Nothing is hidden behind it: the card carries the address in full, so the
 * teacher can send it to themselves. And it goes away by itself — `applies()`
 * is asked again on every resize, so a tablet turned landscape gets the desk
 * back without a reload.
 */

import { el, fill } from '../core/util.js';
import { LESSONS } from './unit.js';
import { unitLessons } from './timing.js';

/**
 * RESPONSIVE_LAW §11's own floor for a readable window at 390 wide. It is not
 * re-derived here and it is not softened: the desk is prose, the same law that
 * governs the beat panel's prose governs this, and a number chosen to make the
 * desk pass would be the defect rather than the fix.
 */
export const READ_FLOOR = 400;

/** Is there room to read the desk in this window? Measured, never assumed. */
export function fits(scroller) {
  const h = scroller && scroller.clientHeight;
  return !Number.isFinite(h) || h <= 0 ? true : h >= READ_FLOOR;
}

/** What each section holds, in one clause, so the card names what is missing. */
const WHAT = [
  ['Workshop', 'four transferable moves, worked examples and mark schemes'],
  ['Evidence', 'every figure in the atlas, with what backs it and what does not'],
  ['Classroom', 'the board, the plan, and five printable sheets per lesson'],
  ['Methods', 'how this was built, where it takes a position, and what it does not know'],
];

/**
 * The card. `scroller` is the element that was measured, so the sentence can
 * print the real number rather than a category.
 */
/**
 * WOULD TURNING THIS DEVICE HELP? A ROTATION SWAPS THE TWO EDGES, so a window
 * turned on its side is at most as tall as it is currently WIDE — and the desk
 * needs `READ_FLOOR` of reading height inside whatever is left after the
 * browser's own chrome and the app's time bar. So:
 *
 *   · already landscape (wider than it is tall): turning it makes it shorter.
 *     Never say it.
 *   · portrait, and the window is narrower than the floor: turning it gives a
 *     window whose WHOLE height is less than the reading height the desk needs.
 *     It cannot work, and saying it does is the defect below.
 *   · portrait and wide enough: it works. Measured on this build — an iPad
 *     portrait at 768x1024 gets the desk 224 pixels and refuses; the same
 *     device at 1024x768 gets it 660 and renders the whole thing.
 *
 * THE CHARGE, round two, the phone critic: "at 844x390 the Teaching desk's
 * refusal card says 'Open the atlas on a laptop, or turn this device landscape'
 * on a device that is already landscape. One clause." It was worse than that in
 * the other direction too: at 390x844 the same clause told a phone to turn
 * itself, and measured, that hands the desk 265 pixels against a floor of 400.
 * The card was giving an instruction that fails on every phone in both
 * orientations and works only on a tablet, and it said the same thing to all of
 * them.
 */
export function turningHelps(w, h) {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return false;
  if (w >= h) return false;                 /* already on its side */
  return w >= READ_FLOOR;                   /* the height a rotation would give */
}

export function renderSmall(root, api, scroller) {
  const h = scroller && scroller.clientHeight ? Math.round(scroller.clientHeight) : null;
  const W = (typeof window !== 'undefined' && window.innerWidth) || 0;
  const H = (typeof window !== 'undefined' && window.innerHeight) || 0;
  const turn = turningHelps(W, H);
  const bound = unitLessons();
  const start = (b) => {
    if (!b || !b.route) return null;
    return el('a.cx-more', { href: '#tour=' + b.route + '&step=1' },
      'Start ' + b.lesson.name);
  };

  fill(root,
    el('div.tp-small',
      /* THE FIRST SCREENFUL HAS TO CARRY THE WHOLE POINT. There are 224 pixels
         of it at 390x844, which is four lines: what this is, and where to go
         instead. Everything else is below the fold on purpose. */
      el('p.tp-small__lead',
        el('strong', 'The Teaching desk needs a bigger screen.'),
        turn ? ' Turn this device on its side, or open the atlas on a laptop, and press '
          : ' Open the atlas on a laptop, or in a bigger browser window, and press ',
        el('strong', 'Teaching desk'), '. Or go straight to:'),
      el('p.tp-small__addr', el('code', '#panel=classroom')),

      el('p.tp-small__why',
        h ? 'This window gives it ' + h + ' pixels of reading height and it needs ' + READ_FLOOR
          + ' — the floor the guided lesson’s own panel is held to. The desk comes back by itself '
          + 'when there is room, with no reload.'
          : 'There is not enough reading height in this window for it. The desk comes back by '
          + 'itself when there is room.',
        /* The one thing a reader will try first, answered before they try it —
           and answered with the arithmetic rather than with a verdict. */
        !turn && W && H ? (W >= H
          ? ' This window is already on its side; turning it back makes it shorter, not taller.'
          : ' Turning it on its side will not do it either: this window is ' + W + ' pixels wide, '
            + 'so on its side it would be ' + W + ' pixels tall — less than the ' + READ_FLOOR
            + ' the desk needs to read in, before the browser’s own bars.') : ''),

      el('h3.tp-small__h', 'What it is'),
      el('p.tp-small__where',
        'A lesson plan a cover teacher can run cold, an evidence ledger of every figure in this '
        + 'atlas, four worked exam paragraphs with mark schemes, and twelve printable sheets — five '
        + 'of them per lesson. It is built for A4 and a print dialogue, which is the other thing a '
        + 'phone has not got.'),

      el('h3.tp-small__h', 'What is in it'),
      el('ul.tp-small__list', ...WHAT.map(([name, what]) =>
        el('li.tp-small__li', el('span.tp-small__n', name), el('span.tp-small__w', what)))),

      /* THE ONE THING A PHONE CAN DO, and the reason this card is not a wall.
         DIDACTIC_SPEC §8.5: every surface that names a route says which lesson
         it is, what it covers and what the other one covers. A teacher who
         opened this on a bus is choosing what to teach on Tuesday. */
      el('h3.tp-small__h', 'The unit, from here'),
      el('p.tp-small__note',
        'Two lessons, each one school period. You can read either of them on this screen — the '
        + 'lesson itself is built for a phone; only the desk around it is not.'),
      el('ul.tp-small__lessons', ...bound.map((b) => el('li.tp-small__lesson',
        el('span.tp-small__ln', b.lesson.name + ' — ' + b.lesson.title),
        el('span.tp-small__lr', b.route
          ? (b.clock && b.clock.ok ? b.clock.minutes.say + ' minutes' : 'in this build')
          : 'no route in this build'),
        el('span.tp-small__lc', 'It covers ' + b.lesson.covers + '.'),
        start(b)))),
    ));
  return root;
}

export default { renderSmall, fits, turningHelps, READ_FLOOR };
