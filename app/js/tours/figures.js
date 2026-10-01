/**
 * tours/figures.js — the path's own "no check, no number".
 *
 * ============================== WHY THIS EXISTS ============================
 * `core/warrant.js` states the rule and the dossier obeys it. The historian's
 * note, twice, is that THE NUMBERS A STUDENT MEETS ON THE PATH did not:
 *
 *   "Beat 6 prints '£1.72m paid to Barbadian slave-owners for 83,150 people' —
 *    a Legacies of British Slave-ownership figure — while the Barbados
 *    dossier's evidence works are Beckles and Dunn supporting 'the whole
 *    narrative'. Extend the check rule to every printed quantity."
 *
 * and round 2, as a `must fix` from three of the four critics at once:
 *
 *   "tours.json:636 prints Bengal 1769–70 as 'between seven and ten million
 *    people' and 'perhaps a third of the province', contradicting the app's own
 *    record (south-asia.json:1666: 'between roughly one and ten million…
 *    contemporary estimates were political documents'). This is on the DEFAULT
 *    route, in the beat DIDACTIC §8 calls the most important in the app, with
 *    no range-reason, no source and no dispute affordance."
 *
 * ============================== HOW IT WORKS ==============================
 * A quantity is NOT TYPED into the prose. It is registered in `figures.json`
 * with the record that warrants it, and the prose writes `{{fig:<id>}}`. This
 * module does three things and nothing else:
 *
 *   mark(node, used)     walk a rendered prose node, replace every token with
 *                        the registered value and a numbered marker, and record
 *                        which figures this beat used, in the order met
 *   block(used, bus)     the check block for the foot of the beat: one line per
 *                        figure, printed by core/warrant.js so a path figure
 *                        and a dossier figure look identical and carry the same
 *                        three statuses (ok / weak / bare)
 *   plain(text)          the same substitution for a string that is not going
 *                        to be rendered — an aria-label, an announcement, the
 *                        printed sheet
 *
 * A token whose id is not registered prints the id in the defect colour rather
 * than silently vanishing, because a number that disappears is worse than a
 * number that is wrong.
 *
 * `dispute` is DIDACTIC_SPEC M18 made operable: "knowing why a number is
 * uncertain is a higher skill than knowing the number". A figure that carries
 * one prints a control at the point the number is met, and the control opens
 * the positions in the words of the people who hold them.
 */

import { el } from '../core/util.js';
/* THE CHECK LINE IS IMPORTED, NOT FETCHED OFF A GLOBAL AT PAINT TIME.
   ROUND 7, found while fixing the cold step link: `block()` read
   `window.BEA.warrant` and, when it was not there yet, printed its own
   defect sentence — “This atlas prints the number and cannot yet say who
   counted it” — under figures that carry a full citation. Measured on a
   cold load of #tour=core&step=9 with an empty cache: three of three
   figures on the princely beat printed the defect, in --danger, on a
   projector, about numbers this file warrants twice over. `main.js`
   replaces `window.BEA` wholesale on the line after `app:ready`, so that
   global is a race by construction and every module in this repository
   carries a comment about it. A module import is not: `core/warrant.js`
   is the same module the shell publishes, resolved before this file's
   first paint, and the honest defect marker now fires only when a figure
   really has no usable record. */
import { warrantLine } from '../core/warrant.js';

const TOKEN = /\{\{fig:([a-z0-9-]+)\}\}/gi;

let DOC = null;

/** Load once. Safe to call from more than one module; the promise is shared. */
let loading = null;
export function loadFigures(getJson) {
  if (DOC) return Promise.resolve(DOC);
  if (loading) return loading;
  const url = new URL('figures.json', import.meta.url).href;
  loading = Promise.resolve(getJson(url, null)).then((d) => {
    DOC = (d && d.figures) ? d : { figures: {} };
    return DOC;
  }).catch(() => { DOC = { figures: {} }; return DOC; });
  return loading;
}

export function figure(id) {
  return (DOC && DOC.figures && DOC.figures[id]) || null;
}

/** Every registered id — for the audit tool and for a harness. */
export function figureIds() { return DOC ? Object.keys(DOC.figures) : []; }

/** The same substitution, for a string that will not be rendered as a node. */
export function plain(text) {
  return String(text == null ? '' : text).replace(TOKEN, (m, id) => {
    const f = figure(id);
    return f ? f.value : m;
  });
}

/**
 * Replace every `{{fig:…}}` token inside a rendered node.
 *
 * It walks TEXT NODES, so it can never introduce markup that `prose()`'s own
 * filter has already refused, and it runs after that filter rather than before
 * it. `used` is an array the caller owns: ids are pushed in the order they are
 * met, once each, so the markers number themselves down the beat.
 */
export function mark(node) {
  if (!node) return node;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  const hits = [];
  while (walker.nextNode()) {
    if (TOKEN.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
    TOKEN.lastIndex = 0;
  }
  for (const t of hits) {
    const frag = document.createDocumentFragment();
    const src = t.nodeValue;
    let at = 0;
    TOKEN.lastIndex = 0;
    let m;
    while ((m = TOKEN.exec(src))) {
      if (m.index > at) frag.append(document.createTextNode(src.slice(at, m.index)));
      frag.append(one(m[1]));
      at = m.index + m[0].length;
    }
    if (at < src.length) frag.append(document.createTextNode(src.slice(at)));
    t.replaceWith(frag);
  }
  return node;
}

function one(id) {
  const f = figure(id);
  if (!f) {
    /* A number that vanishes is worse than a number that is wrong. */
    const bad = el('span.tr-q.tr-q--bare', { 'data-fig': id, title: 'No figure is registered under this id.' });
    bad.textContent = '[' + id + ']';
    return bad;
  }
  const span = el('span.tr-q', { 'data-fig': id });
  span.append(document.createTextNode(f.value));
  span.append(el('sup.tr-q__m', { 'aria-hidden': 'true', text: '' }));
  /* The marker is decorative; the citation itself is at the foot of the beat
     and is in the reading order. The title carries it for a pointer. */
  span.title = citeText(f) || '';
  return span;
}

/**
 * NUMBER THE MARKERS AND (RE)BUILD THE CHECK BLOCK, FROM THE DOM.
 *
 * WHY IT READS THE DOM RATHER THAN A LIST BUILT WHILE RENDERING. Half the
 * quantities on this path are printed by a REVEAL — the compensation beat's
 * £1.72m appears only after the student has put five cards in order, the
 * tension beat's second testimony only after they have committed. Those nodes
 * are built inside a click handler, long after `buildPanel()` has returned, so
 * a list accumulated during the build would have been missing exactly the
 * figures the beat exists to show. Reading the rendered panel is right in every
 * case and cannot go stale: the markers are numbered in document order and the
 * block at the foot is the same set, in the same order.
 *
 * It is idempotent. A signature of the ids is kept on the root, so the
 * MutationObserver that calls this can fire on our own append without looping.
 */
export function sync(root, opts = {}) {
  if (!root) return null;
  const marks = [...root.querySelectorAll('.tr-q[data-fig]')];
  const order = [];
  for (const m of marks) {
    const id = m.getAttribute('data-fig');
    if (!order.includes(id)) order.push(id);
    const sup = m.querySelector('.tr-q__m');
    if (sup) sup.textContent = String(order.indexOf(id) + 1);
  }
  /* `into` lets a caller put the block somewhere other than the end of the
     surface it scanned — the Close prints its thirteen lines and then the
     check block directly under them, not after the three doors. */
  const host = opts.into || root;
  const sig = order.join('|');
  if (host.dataset.figs === sig) return host.querySelector(':scope > .tr-figs');
  host.dataset.figs = sig;
  const had = host.querySelector(':scope > .tr-figs');
  if (had) had.remove();
  const box = block(order, opts);
  if (box) host.append(box);
  return box;
}

function citeText(f) {
  const w = Array.isArray(f.warrant) ? f.warrant : (f.warrant ? [f.warrant] : []);
  if (!w.length) return null;
  return w.map((v) => v.author + ', ' + v.work + ' (' + v.year + ')').join('; ');
}

/**
 * THE CHECK BLOCK, AT THE FOOT OF THE BEAT.
 *
 * One row per figure this beat printed, numbered to match the marker beside
 * the number itself, and the citation drawn by `core/warrant.js` so that a
 * quantity on the path and a quantity in a dossier are the same object with the
 * same three statuses. A figure with no usable warrant prints the module's own
 * defect marker in `--danger`, which is the point of the exercise: an unchecked
 * number should look like a problem, on the page, to the reader.
 */
export function block(used, opts = {}) {
  if (!used || !used.length) return null;
  const W = { warrantLine };
  const box = el('div.tr-figs', { 'data-count': String(used.length) });
  box.append(el('p.tr-figs__head',
    el('span.tr-figs__lab', { text: 'the figures on this beat, and who counted them' })));
  const list = el('ol.tr-figs__list');
  used.forEach((id, i) => {
    const f = figure(id);
    const li = el('li.tr-figs__row', { 'data-fig': id });
    li.append(el('span.tr-figs__n.num', { text: String(i + 1) }));
    const body = el('div.tr-figs__body');
    body.append(el('p.tr-figs__v',
      el('strong', { text: f ? f.value : '[' + id + ']' }),
      f && f.label ? ' — ' + f.label : ''));
    if (f && f.rangeReason) {
      body.append(el('p.tr-figs__why',
        el('span.tr-figs__whylab', { text: 'why it is a range — ' }), f.rangeReason));
    }
    if (f && W) {
      try { body.append(W.warrantLine(f.warrant, { of: 'tours/figures/' + id })); }
      catch (_) { /* the module is there; the line is a courtesy */ }
    } else if (f) {
      body.append(el('p.tr-figs__nowarrant', { text: 'This atlas prints the number and cannot yet say who counted it.' }));
    }
    if (f && f.dispute) body.append(disputeControl(f, id, opts));
    li.append(body);
    list.append(li);
  });
  box.append(list);
  return box;
}

/** M18, at the point the number is met. */
function disputeControl(f, id, opts) {
  const d = f.dispute;
  const wrap = el('div.tr-figs__dis');
  const open = el('button.cx-more.tr-figs__disgo', { type: 'button', text: d.ask || 'Why is this number disputed?' });
  const body = el('div.tr-figs__disbody', { hidden: true });
  for (const p of d.positions || []) body.append(el('p.tr-figs__dispos', { text: strip(p) }));
  if (d.lesson) body.append(el('p.cx-note.tr-figs__dislesson', { text: d.lesson }));
  open.addEventListener('click', () => {
    const now = body.hidden;
    body.hidden = !now;
    open.setAttribute('aria-expanded', now ? 'true' : 'false');
    open.textContent = now ? 'Close that' : (d.ask || 'Why is this number disputed?');
    if (now && opts.onOpenDispute) opts.onOpenDispute(id);
  });
  open.setAttribute('aria-expanded', 'false');
  wrap.append(open, body);
  return wrap;
}

/* Authored copy may carry *emphasis* for a work title; the four-tag filter in
   panel.js is not reachable from here, so the marks are simply removed rather
   than becoming markup by another route. */
function strip(s) { return String(s == null ? '' : s).replace(/\*/g, ''); }
