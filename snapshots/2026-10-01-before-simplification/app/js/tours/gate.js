/**
 * tours/gate.js — the Complication Gate. FEATURE_SPEC §1 charge 11.
 *
 * "A book ambushes the reader; an app's users route around what they don't
 * click." So five facts in this lesson are placed on the spine's ONLY forward
 * edge, and Next is disabled AND unfocusable until the student has placed the
 * damaging fact on a two-axis field: what it does to the claim they have just
 * been given, and how sure they are.
 *
 * FOUR RULES, and each of them is load-bearing:
 *   1. ANY placement advances. There is no right answer and the panel says so.
 *   2. There is no dismiss button, because an acknowledgement is not a
 *      commitment. Declining is a separate, named, recorded choice — the escape
 *      stays (DIDACTIC §8.2) and removing it would teach worse.
 *   3. The gate is AIMED: which variant appears is chosen by a predicate over
 *      this student's own Ledger, so the complication is the one that damages
 *      the claim they just made.
 *   4. A decline is re-offered later and named at the Close, under their name.
 */

import { el } from '../core/util.js';
import { mark as markFigures, plain as figPlain } from './figures.js';

const esc = (s) => String(s == null ? '' : s);

function prose(html, tag = 'p', cls = '') {
  const p = el(tag + (cls ? '.' + cls.split(' ').join('.') : ''));
  const t = document.createElement('template');
  t.innerHTML = esc(html);
  for (const n of [...t.content.querySelectorAll('*')]) {
    if (!['STRONG', 'EM', 'B', 'I', 'CODE'].includes(n.tagName)) n.replaceWith(...n.childNodes);
    else for (const a of [...n.attributes]) n.removeAttribute(a.name);
  }
  p.append(t.content);
  /* NO CHECK, NO NUMBER — HERE TOO. ROUND 3, three critics: "36 quantities
     printed in the path's own prose carry no check line (tours.json beats 3, 4,
     7, 8, 13 and gates.json)". A Complication Gate is prose in a panel like any
     beat and its quantities — the twenty thousand who reached British lines,
     the hundred and fifty thousand children taken to residential schools, the
     Partition range — are exactly the numbers a student will repeat. The token
     is substituted and marked the same way a beat's is; `tours/index.js` runs
     the same `syncFigures` over the gate's root, so the check block at its foot
     is the same block, drawn by the same `core/warrant.js`. */
  markFigures(p);
  return p;
}

/** The same substitution for a string that is not rendered as a node. */
function figs(s) { return figPlain(esc(s)); }

/** Which variant this student gets. The predicate is over the Ledger only. */
export function pickVariant(gate, ledger) {
  const vs = gate.variants || [];
  for (const v of vs) {
    if (!v.when) continue;
    if (v.when.ledgerHas && ledger && ledger.has(v.when.ledgerHas)) return v;
    if (v.when.declinedAny && ledger && ledger.declined().length) return v;
  }
  return vs.find((v) => !v.when) || vs[0] || null;
}

/**
 * buildGate({ gate, axes, noRightAnswer, ledger, cite, onPlaced, onDeclined,
 *             satisfied })
 * → { node, placed }
 *
 * `satisfied` — WHETHER THIS RUN HAS ALREADY PLACED THIS GATE. Wave 9: the
 * forward edge was released by any row in the Ledger, and the Ledger is kept
 * for weeks. So a student who placed g1 in one lesson met g1 on the next
 * route, in a different lesson, already open — the edge did not hold, and
 * `tools/scenarios/p05-accept.js` measured exactly that: five of the full
 * route's six forward edges held, because the sixth had been placed on the
 * default route earlier in the same scenario. Charge 11 is about a student
 * not being able to route around the complication IN THE LESSON THEY ARE
 * DOING, so the runner passes what it knows — did THIS run place it — and
 * when it did not, the field is live again whatever the record says. The
 * record is still the record: `onPlaced` returns the row the Ledger kept, and
 * a second placement that disagrees with the first is named rather than
 * silently overwriting it (see `place()`).
 */
export function buildGate(o) {
  const { gate, axes, noRightAnswer, ledger, onPlaced, onDeclined, citeFn, extra } = o;
  const v = pickVariant(gate, ledger);
  const root = el('div.tr-gate', { 'data-gate': gate.id });
  if (!v) { root.append(el('p.cx-note.cx-note--warn', { text: '[gate has no content] — this is a bug in gates.json.' })); return { node: root, placed: true }; }

  const key = 'p05:gate:' + gate.id;
  const kept = ledger && ledger.get(key);
  /* `satisfied` absent means "nobody is scoping this" and the old behaviour
     stands, so every other caller of this function is unchanged. */
  const prior = (o.satisfied === false) ? null : kept;

  root.append(el('div.tr-gate__head',
    el('span.tr-gate__eyebrow', { text: esc(v.eyebrow || 'the complication') }),
    el('p.tr-gate__claim', el('span.tr-gate__claimlab', { text: 'the claim so far — ' }), esc(gate.claim))));
  root.append(el('h3.cx-panel__title.tr-gate__title', { text: figs(v.title) }));
  root.append(prose(v.text, 'p', 'tr-p'));

  /* WHERE OUR READING GOES, AND WHY IT IS NOT HERE.
     Round 3, measured at 1440x900: the field sat about seven hundred pixels
     below the fold of the rail with nothing pointing down at it, and at
     900x700, 768x1024 and 390x844 the student was told "Place it to go on"
     with no placeable thing on screen. Roughly a hundred and forty words of
     prose stood between the instruction and the field.
     Half of that prose is `why` — this app's own reading of what the fact does
     to the claim. Printing it first also told the student the answer to the
     question the field is asking. So the fact goes above the field and our
     reading goes below it, revealed once they have committed. Same words, same
     citation, better order: the gate is now commit-then-compare, like every
     other question in this app, and the field is the second thing in the
     panel rather than the last. */
  const after = el('div.tr-gate__after', { hidden: true });
  after.append(el('p.tr-gate__afterlab', { text: 'what this atlas thinks it does to the claim' }));
  after.append(prose(v.why, 'p', 'tr-p tr-p--why'));
  if (v.cite && citeFn) { const c = citeFn(v.cite); if (c) after.append(c); }
  const revealWhy = () => { after.hidden = false; };

  if (prior) {
    root.append(el('p.tr-gate__done', prior.verdict === 'declined'
      ? 'You declined this one. It is recorded, and the Close will say so.'
      : 'You placed this: ' + prior.youSaid));
    revealWhy();
    root.append(after);
    if (extra) root.append(extra);
    return { node: root, placed: true };
  }

  /* --------------------------------------------------- the two-axis field */
  /* THE FIELD IS A GRID, NOT NINE TAB STOPS.
     ROUND 3: "`.tr-field__cell` has no `role` and ArrowRight does not move
     focus; a keyboard user tabs through nine cells to place one fact. Make it
     a `radiogroup` with roving tabindex." Measured before this change: nine
     Tab presses to cross the field, and a screen reader announced nine
     unrelated buttons with no group, no count and no position.

     It is a radiogroup with MANUAL selection — the arrows move focus and Enter
     or Space places — rather than the automatic kind where an arrow key also
     checks. The WAI-ARIA practices allow both, and this one has to be manual:
     placing writes a Ledger row that the Close prints under the student's own
     name and that this app deliberately never lets them quietly overwrite.
     An arrow key must not be able to commit that by accident. The instruction
     is spoken as part of the group's own description. */
  const field = el('div.tr-field', { 'data-gatefield': 'yes' });
  const gridId = 'tr-field-' + gate.id;
  field.append(el('p.tr-field__ask', { id: gridId + '-x', text: axes.x.label }));
  const grid = el('div.tr-field__grid', {
    role: 'radiogroup',
    id: gridId,
    'aria-label': 'Place this fact: what it does to the claim, and how sure you are',
    'aria-describedby': gridId + '-how',
  });
  grid.append(el('span.tr-field__corner'));
  for (const x of axes.x.stops) grid.append(el('span.tr-field__colhead', { text: x.label }));
  const cells = [];
  const cols = axes.x.stops.length;
  for (const y of axes.y.stops) {
    grid.append(el('span.tr-field__rowhead', { text: y.label }));
    for (const x of axes.x.stops) {
      const cell = el('button.tr-field__cell', {
        type: 'button',
        role: 'radio',
        'aria-checked': 'false',
        /* Roving: exactly one cell is in the tab order at a time, so the field
           is ONE stop on the way to Next instead of nine. */
        tabindex: cells.length === 0 ? '0' : '-1',
        'aria-label': x.label + ', ' + y.label,
        title: x.label + ' · ' + y.label,
        onclick: () => place(x, y),
      }, el('span.tr-field__dot'));
      cell._x = x; cell._y = y;
      cells.push(cell);
      grid.append(cell);
    }
  }
  const rove = (i) => {
    const n = cells[Math.max(0, Math.min(cells.length - 1, i))];
    if (!n) return;
    for (const c of cells) c.setAttribute('tabindex', c === n ? '0' : '-1');
    try { n.focus(); } catch (_) { /* detached */ }
  };
  grid.addEventListener('keydown', (ev) => {
    const i = cells.indexOf(document.activeElement);
    if (i < 0) return;
    const K = ev.key;
    let to = -1;
    if (K === 'ArrowRight') to = (i % cols === cols - 1) ? i : i + 1;
    else if (K === 'ArrowLeft') to = (i % cols === 0) ? i : i - 1;
    else if (K === 'ArrowDown') to = Math.min(cells.length - 1, i + cols);
    else if (K === 'ArrowUp') to = Math.max(0, i - cols);
    else if (K === 'Home') to = 0;
    else if (K === 'End') to = cells.length - 1;
    else return;
    ev.preventDefault();
    ev.stopPropagation();
    rove(to);
  });
  field.append(el('p.tr-field__ask.tr-field__ask--y', { text: axes.y.label }), grid);
  field.append(el('p.cx-note.tr-field__how', {
    id: gridId + '-how',
    text: 'Arrow keys move across the field. Enter or Space places the fact where you have stopped — '
      + 'and a placement is recorded, so nothing places itself as you move.',
  }));
  field.append(el('p.cx-note.tr-field__note', { text: noRightAnswer }));

  const decline = el('button.cx-more.tr-gate__decline', {
    type: 'button',
    text: 'I would rather not place this',
    onclick: () => {
      onDeclined({
        kind: 'declined', claimId: key, beatId: gate.after, t: v.id,
        misconceptionId: gate.misconception || null,
        prompt: figs(v.title), youSaid: 'I declined to place this', verdict: 'declined',
      });
      field.replaceWith(el('p.tr-gate__done', { text: 'Recorded. It will be offered again, and the Close will name it.' }));
      decline.remove();
      revealWhy();
      if (extra && !extra.isConnected) root.append(extra);
    },
  });

  root.append(field, decline, after);
  return { node: root, placed: false };

  function place(x, y) {
    const said = x.label + ', ' + y.label;
    for (const c of cells) c.setAttribute('aria-checked', (c._x === x && c._y === y) ? 'true' : 'false');
    /* THE ROW THE LEDGER KEPT, NOT THE ONE WE SENT. `ledger.append` keeps the
       FIRST answer per claim on purpose — a student's first commitment is what
       the Close is about — so on a re-run the field can land somewhere the
       record will not move to. Saying "you placed it here" about a cell the
       Close will not print is the same class of lie as an unearned recall, so
       the panel prints what was kept and names the difference. */
    const row = onPlaced({
      kind: 'placed', claimId: key, beatId: gate.after, t: v.id,
      misconceptionId: gate.misconception || null,
      prompt: figs(v.title), youSaid: said, answer: figs(gate.claim), verdict: 'confirmed',
    });
    const held = (row && row.youSaid) || said;
    field.replaceWith(el('p.tr-gate__done',
      el('strong', { text: 'You placed it: ' }), held + '. ',
      el('span.tr-gate__doneNote', {
        text: held === said
          ? 'That is a position, and the Close will print it under your name. You can move on.'
          : 'You put it at ' + said + ' this time. The Close prints the first answer you gave this fact, '
            + 'which is the one above — a first commitment is what it is about. You can move on.',
      })));
    decline.remove();
    revealWhy();
    if (extra && !extra.isConnected) root.append(extra);
  }
}

export default buildGate;
