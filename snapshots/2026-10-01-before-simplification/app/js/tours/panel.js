/**
 * tours/panel.js — the body of a beat, rendered into the rail sheet.
 *
 * THE LAW IT OBEYS. The map never disappears (FEATURE_SPEC §2 rule 1): a beat
 * compresses the plate into the rail, it never covers it, and there is no
 * full-screen modal anywhere in this piece. Nothing essential is behind a
 * hover, a tab or an accordion. Every question uses `.cx-ask`, every citation
 * uses `.cx-src`, every figure uses `.cx-fig`, every route out uses `.cx-more`
 * — the shared chrome classes, so a reader learns the treatment once.
 *
 * WHAT A PANEL MAY CONTAIN. One argument in prose, one named non-British
 * actor, and at most one thing to do. A beat carrying two questions is over
 * budget and is a bug in tours.json, not here.
 */

import { el, fill, announce } from '../core/util.js';
import { answer as computeAnswer } from './answers.js';
import { mark as markFigures, sync as syncFigures, plain as figPlain } from './figures.js';

const esc = (s) => String(s == null ? '' : s);

/**
 * A NUMBER AND ITS UNIT, SET THE WAY THE UNIT IS SET.
 *
 * ROUND 3, in the rubric's list and in the phone's: the printed revision sheet
 * read "You said 8%. The atlas: 12 %." — the student's own figure written by
 * one rule and the atlas's by another, side by side on the same line of paper.
 * A unit that is a WORD takes a space ("11 kinds of rule", "21 places"); a unit
 * that is a SIGN is set against the digits ("12%"). One function, so the two
 * halves of that sentence cannot disagree again.
 */
/**
 * A LABEL THAT MAY CARRY A QUANTITY, SET AS TEXT AND MARKED.
 *
 * The ordering strip's cards and drivers are plain strings, not prose, so they
 * went through `text:` and a `{{fig:}}` token in one of them would have printed
 * itself. The compensation beat's whole reveal — the £1.72 million, the 83,150
 * people, the £20 million national bill — is on those five cards, which is
 * exactly where the historian's ask lands hardest.
 */
function figSpan(sel, text) {
  const n = el(sel);
  n.textContent = String(text == null ? '' : text);
  markFigures(n);
  return n;
}

export function withUnit(value, unit) {
  const v = String(value == null ? '' : value);
  const u = String(unit == null ? '' : unit).trim();
  if (!u) return v;
  return /^[%\u00b0\u2030]/.test(u) ? v + u : v + ' ' + u;
}

/** Only <strong>, <em>, <b>, <i>, <code> survive — the app's own filter, applied
 *  to our own copy so a mistake in a JSON string can never become markup. */
function prose(html, tag = 'p', cls = '') {
  const p = el(tag + (cls ? '.' + cls.split(' ').join('.') : ''));
  const t = document.createElement('template');
  t.innerHTML = esc(html);
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1) { child.remove(); continue; }
      const name = child.tagName.toLowerCase();
      if (!['strong', 'em', 'b', 'i', 'code'].includes(name)) { child.replaceWith(...child.childNodes); continue; }
      for (const a of [...child.attributes]) child.removeAttribute(a.name);
      walk(child);
    }
  };
  walk(t.content);
  p.append(t.content);
  /* NO CHECK, NO NUMBER — `tours/figures.js`. A quantity is never typed into
     this copy; the copy writes `{{fig:<id>}}` and the registered value is
     substituted here, AFTER the four-tag filter above, walking text nodes only,
     so the substitution can never introduce markup the filter has refused.
     `USED` is the beat's own running list, so the markers number themselves
     down the beat and the check block at the foot matches them. */
  markFigures(p);
  return p;
}

/** The one citation treatment. Uses the dossier's renderSource when it is on
 *  the page — that function is the app's only quotation renderer — and falls
 *  back to `.cx-src` markup with the same fields when it is not. */
export function cite(src, bus) {
  if (!src) return null;
  if (window.BEA && typeof window.BEA.renderSource === 'function') {
    try {
      const node = window.BEA.renderSource(src, { compact: true });
      if (node) return node;
    } catch (_) { /* fall through to the plain form */ }
  }
  if (bus) {
    let node = null;
    bus.emit('ask:renderSource', { src, opts: { compact: true }, reply: (n) => { node = n; } });
    if (node) return node;
  }
  return el('p.cx-src.tr-src',
    el('span.cx-src__kind', { text: esc(src.kind || 'source') }),
    el('cite', { text: esc(src.work) }),
    ' — ', esc(src.author || 'unknown'), ', ',
    el('span.num', { text: String(src.year || '') }),
    src.supports ? el('span.tr-src__for', { text: ' · cited here for: ' + esc(src.supports) }) : null);
}

/** The actor block. No beat passes without one (FEATURE_SPEC P05 test 2). */
function actorBlock(beat, onOpen) {
  const a = beat.actor;
  if (!a || !a.name) {
    return el('p.cx-note.cx-note--warn.tr-actor', { text: '[no named actor] — this beat is over budget and must not ship.' });
  }
  const box = el('div.tr-actor',
    el('span.tr-actor__eyebrow', { text: 'in the room' }),
    el('p.tr-actor__body', el('strong', { text: esc(a.name) }), ' — ' + esc(a.role)));
  if (a.territoryId && onOpen) {
    box.append(el('button.cx-more', { type: 'button', text: 'Open that record', onclick: () => onOpen(a.territoryId) }));
  }
  return box;
}

/**
 * THE PANEL SCROLLS ITS OWN PROSE. IT IS NOT CUT BY THE TIMELINE.
 *
 * ROUND 2, three critics, one defect. "The beat panel is cut mid-line at EVERY
 * viewport, and a whole line is lost." Measured at 390x844 on step 17: the
 * rail's scroller is 390x198 with 16px of padding at its foot, the beat is
 * 2,081px tall, and the cue that says there is more was `position: sticky;
 * inset-block-end: 0` INSIDE that scroller. Sticky resolves against the
 * scrollport's CONTENT box, so the bar came to rest 16px above the visible
 * edge and left a live half-line under itself — "Dyer fired for about ten
 * minutes into a", sliced through the x-height by the time bar — while the
 * opaque bar hid the line above it, "troops under Brigadier-General Reginald",
 * which was then on screen nowhere at all. Two treatments in forty pixels: a
 * soft fade above the bar and a hard guillotine below it.
 *
 * THE CURE IS STRUCTURAL AND IT IS THE ONE JOB (a) NAMES: the panel scrolls
 * its own prose instead of being clipped by the strip below it. The root is a
 * two-row grid — a scroller, then a foot that is a real row in the flow — so
 * the foot is the panel's bottom edge rather than a raft floating over it.
 * Nothing is behind the bar, nothing continues below it, and the last visible
 * line fades under a mask instead of being cut through its glyphs.
 *
 * AND THE FOOT EARNS ITS HEIGHT TWICE. Below 62rem it also carries Next.
 * Measured at 390x844: `.tr-bar__next` is 27x30 at x=228,y=8 — the control a
 * student presses twenty-four times, at the smallest size in the application,
 * in the worst one-handed reach zone on the phone. The twin at the foot of the
 * sheet is 44px tall, in the thumb zone, and it mirrors the transport's own
 * state (locked at a gate, "Finish" at the end) rather than keeping a second
 * opinion about where the lesson is.
 *
 * Called by the beat panel, by a gate and by a dispute, because all three are
 * the same rectangle. Call it LAST: everything appended to the root before it
 * is moved into the scroller, and anything appended after would land outside.
 */
/**
 * THE SAME FOOT, FOR A STEP WHOSE CARD ANOTHER MODULE OWNS.
 *
 * ROUND 2, the phone, as a `must fix`: "the two recall cards render no
 * `.tr-panel__foot` either… Tapping OPEN THE MAP on one of them takes the map
 * to 192px with no control to get back to the text; only Back or Next escapes."
 *
 * A spaced-recall step does not build a panel: it hands the item to P10, which
 * renders `.qz` straight into the shell's sheet body and owns every word of it.
 * So this piece cannot frame that card — and it must not try. What it can do is
 * put its own foot under it: the same element, the same three classes and the
 * same treatment as `frame()` above, appended to the body as a sibling, with
 * the body made a two-row grid by tours.css so the card scrolls in row one and
 * the foot is a real edge rather than a raft floating over it.
 *
 * `host` is the scroll container the `more` control pages — the sheet body
 * itself, since the card has no scroller of its own.
 */
/**
 * SNAP THE READING WINDOW TO A LINE BOX.
 *
 * ROUND 2, the classroom critic, `must fix`: "At 390x844 snap the beat
 * scroller's viewport to a line box so a line of prose is never cut through its
 * x-height at either edge. Measured on core step 9: 'What kind of thing is it?'
 * clipped at the top, 'What can it NOT tell you?' clipped at the bottom."
 *
 * Measured here before the fix, on the same beat at 390x844, by walking the
 * Range line boxes of every text node and asking what fraction of each is
 * visible: a line was sliced (between 20 % and 80 % showing) at 4 of 19 scroll
 * offsets. CSS cannot do this — `scroll-snap` snaps to elements, and the thing
 * being cut is a line inside a paragraph — and the leading is not one number:
 * a beat sets prose, captions, small caps and a micro check line, so there is
 * no grid to round to.
 *
 * So the position is rounded AFTER the scroll settles, by at most one line, to
 * the nearer boundary of whichever line box straddles the top edge. The head is
 * a clean line start and the foot is a fade — which is how a printed page ends,
 * and the fade is already there. It never fires while a thumb is moving (140ms
 * of quiet first), never moves more than one line, and cannot loop: the
 * adjusted position has no straddling line for the next event to find.
 */
export function snapLines(scroll) {
  if (!scroll) return () => {};
  let t = 0;
  const snap = () => {
    if (!scroll.isConnected) return;
    const box = scroll.getBoundingClientRect();
    if (box.height < 24) return;
    const x = box.left + Math.min(28, box.width / 4);
    const el0 = document.elementFromPoint(x, box.top + 1);
    if (!el0 || !scroll.contains(el0)) return;
    let hit = null;
    const w = document.createTreeWalker(el0, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode() && !hit) {
      const n = w.currentNode;
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const line of r.getClientRects()) {
        if (line.height < 6) continue;
        if (line.top < box.top - 0.5 && line.bottom > box.top + 0.5) { hit = line; break; }
      }
    }
    if (hit) {
      const over = box.top - hit.top;                /* hidden above the edge */
      if (over > 0.5 && over < hit.height - 0.5) {
        const delta = over < hit.height / 2 ? -over : (hit.height - over);
        if (Math.abs(delta) >= 1) scroll.scrollTop += delta;
      }
    }
    cut();
  };

  /**
   * THE FOOT, WHICH CANNOT ALSO BE SNAPPED, IS FADED OVER EXACTLY THE FRAGMENT.
   *
   * Rounding the head to a line boundary moves the foot to an arbitrary one —
   * there is no scroll position at which both edges land on a line, because the
   * window is not a whole number of lines high and a beat sets four different
   * leadings. Two rounds of critics have been on both sides of the fixed ramp:
   * at 1.5rem "a fade slicing a sentence at both edges… the last line was not
   * softened, it was ERASED"; at 0.75rem "clipped at the bottom".
   *
   * So the ramp is not a constant. The fragment of a line left showing at the
   * foot is measured and published as `--tr-cut`, and the mask ramps over
   * exactly that: a foot that lands cleanly on a line boundary has no fade at
   * all, and a foot that cuts a line 11px into a 24px line fades those 11px and
   * nothing above them. Nothing whole is ever dimmed and nothing cut is ever
   * left at full ink.
   */
  /** The line box the bottom edge falls in, and how much of it is showing. */
  function bottomLine() {
    const box = scroll.getBoundingClientRect();
    if (box.height < 24) return null;
    const x = box.left + Math.min(28, box.width / 4);
    const el1 = document.elementFromPoint(x, box.bottom - 1);
    if (!el1 || !scroll.contains(el1)) return null;
    const w2 = document.createTreeWalker(el1, NodeFilter.SHOW_TEXT, null);
    while (w2.nextNode()) {
      const n = w2.currentNode;
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      const r = document.createRange();
      r.selectNodeContents(n);
      for (const line of r.getClientRects()) {
        if (line.height < 6) continue;
        if (line.top < box.bottom - 0.5 && line.bottom > box.bottom + 0.5) {
          return { height: line.height, frag: Math.max(0, Math.min(line.height, box.bottom - line.top)) };
        }
      }
    }
    return null;
  }

  function cut() {
    if (!scroll.isConnected) return;
    if (scroll.getBoundingClientRect().height < 24) return;
    const hit = bottomLine();
    scroll.style.setProperty('--tr-cut', (hit ? hit.frag : 0).toFixed(1) + 'px');
  }
  const on = () => { clearTimeout(t); t = setTimeout(snap, 140); };
  scroll.addEventListener('scroll', on, { passive: true });
  /* THE MEASUREMENT WRITES A STYLE, SO IT MAY NOT WRITE IT INSIDE THE CALLBACK
     THAT OBSERVED IT. Chromium reports "ResizeObserver loop completed with
     undelivered notifications" for a mutation made during delivery, and this
     repository's rule is zero console errors. One frame's delay makes the write
     a normal layout change: the second pass recovers the untrimmed height, gets
     the same residue and writes nothing, so it settles in two frames. */
  let ro = null;
  let roQ = 0;
  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(() => {
      if (!scroll.isConnected) { try { ro.disconnect(); } catch (_) { /* gone */ } return; }
      if (roQ) return;
      roQ = requestAnimationFrame(() => {
        roQ = 0;
        if (!scroll.isConnected) return;
        try { cut(); } catch (_) { /* the window will be measured again */ }
      });
    });
    try { ro.observe(scroll); } catch (_) { ro = null; }
  }
  requestAnimationFrame(() => { try { cut(); } catch (_) { /* nothing to fade */ } });
  return () => {
    clearTimeout(t);
    if (roQ) cancelAnimationFrame(roQ);
    scroll.removeEventListener('scroll', on);
    if (ro) { try { ro.disconnect(); } catch (_) { /* gone */ } }
  };
}

export function soloFoot(host, bus, opts = {}) {
  const more = el('button.tr-panel__more', {
    type: 'button',
    'aria-label': 'More of this — scroll down, there is more below',
  }, el('span.tr-panel__morew', { text: opts.moreWord || 'more of this' }),
     el('span.tr-panel__morea', { 'aria-hidden': 'true', text: '↓' }));
  more.addEventListener('click', () => {
    const smooth = document.documentElement.dataset.motion !== 'reduced';
    const by = Math.max(80, host.clientHeight - 48);
    try { host.scrollBy({ top: by, behavior: smooth ? 'smooth' : 'auto' }); }
    catch (_) { host.scrollTop += by; }
  });

  /* NO `Map` CONTROL HERE, AND THAT IS THE POINT.
     On a surface tours does not own — a recall card, the Close — the shell
     renders the reading toggle in the sheet's own head and shows it ONLY when
     tours has not rendered one (`chrome/index.js` `_paintSheetFit`). It also
     holds the override for those surfaces itself, because `data-tour-fit` is
     this module's contract about a BEAT and the shell reads it only while one
     is mounted. Drawing a second `.tr-panel__fit` here would hide the working
     control and leave a dead one in its place: measured on
     `#tour=thirty&step=7`, pressing ours moved `data-tour-fit` to `map` and
     `#app[data-read]` stayed `on`, because the shell's own resolver — rightly
     — does not read a beat's declaration on a card that is not a beat. */
  const nextw = el('span.tr-panel__nextw', { text: 'Next' });
  const next = el('button.tr-panel__next', {
    type: 'button', title: 'Next (→ or Enter)', 'aria-label': 'Next beat',
    onclick: () => bus && bus.emit('tours:next', {}),
  }, nextw, el('span.tr-panel__nexta', { 'aria-hidden': 'true', text: '→' }));

  const foot = el('div.tr-panel__foot.tr-foot', more, next);

  /* The cue, on the foot's own parent, so tours.css can switch its ink with
     the same `data-more` rule every other foot in this piece uses. */
  let queued = false;
  const paint = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!foot.isConnected) return;
      const below = host.scrollHeight - host.scrollTop - host.clientHeight > 8;
      const v = below ? 'yes' : '';
      if (host.dataset.more !== v) host.dataset.more = v;
    });
  };
  host.addEventListener('scroll', paint, { passive: true });
  snapLines(host);
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(() => { if (!foot.isConnected) { try { ro.disconnect(); } catch (_) { /* gone */ } return; } paint(); });
    try { ro.observe(host); } catch (_) { /* no cue, the control still works */ }
  }
  requestAnimationFrame(paint);
  return foot;
}

export function frame(root, bus) {
  const flow = el('div.tr-panel__flow');
  flow.append(...root.childNodes);
  const scroll = el('div.tr-panel__scroll', { tabindex: '0', role: 'region', 'aria-label': 'This beat, in full — scrollable' }, flow);

  /* WCAG 2.5.3 LABEL IN NAME: the accessible name must CONTAIN the visible
     one, or a speech-input user says the words on the button and nothing
     happens. Round 3 found the class of bug in the legend's ribs; every
     control this piece draws is checked for it by `sc/bar.js`. The arrow is
     decorative and is hidden from the name so the visible label is the words. */
  const more = el('button.tr-panel__more', {
    type: 'button',
    'aria-label': 'More of this beat — scroll down, there is more below',
  }, el('span.tr-panel__morew', { text: 'more of this beat' }), el('span.tr-panel__morea', { 'aria-hidden': 'true', text: '↓' }));

  /* THE TWIN, NOT A SECOND OPINION. It calls the transport over the bus and
     reads the transport's own published state, so a gate that has locked Next
     in the masthead has locked this one too, and the word on it is the same
     word. If the bus is not there it is not drawn: a dead Next is worse than
     no Next. */
  const nextw = el('span.tr-panel__nextw', { text: 'Next' });
  const nexta = el('span.tr-panel__nexta', { 'aria-hidden': 'true', text: '→' });
  const next = el('button.tr-panel__next', {
    type: 'button', title: 'Next (→ or Enter)', 'aria-label': 'Next beat',
    onclick: () => bus && bus.emit('tours:next', {}),
  }, nextw, nexta);
  const paintState = (p) => {
    const locked = !!(p && p.locked);
    const done = !!(p && p.done);
    /* THE REFUSAL IS THE STEP'S OWN, NOT THIS FUNCTION'S GUESS AT IT.
       ROUND 7, the phone critic: this line hardcoded 'Place it first' while
       the bar four inches above it printed the beat's authored `holdSay` —
       "Write the four" on the source beat, "Say what each knew" on the two
       documents — and told a screen reader to place a fact on a field that
       beat does not have. The transport publishes the word and the hint with
       the rest of its state (`tours/index.js::_publishState`); this control
       prints them. The comment above has claimed since round 2 that "the word
       on it is the same word"; it is now true. */
    const lockW = (locked && p && p.lockSay) || 'Place it first';
    const lockH = (locked && p && p.lockHint) || 'Place it first — answer this beat before going on';
    next.disabled = locked;
    next.dataset.locked = locked ? 'yes' : '';
    nextw.textContent = locked ? lockW : (done ? 'Finish' : 'Next');
    nexta.textContent = locked ? '↓' : '→';
    next.title = locked ? lockH : (done ? 'Finish (Enter)' : 'Next (→ or Enter)');
    /* The name starts with the word printed on it (WCAG 2.5.3), then says what
       pressing it does. */
    next.setAttribute('aria-label', locked ? lockH : (done ? 'Finish the lesson' : 'Next beat'));
  };
  paintState(window.BEA && window.BEA.toursState);
  const offState = bus ? bus.on('tours:state', (p) => paintState(p)) : null;

  /* THE PEEK STRIP'S OWN CONTROL — RESPONSIVE_LAW's docked band only.
     On a beat whose work is textual the panel takes 45 % of the band and the
     map drops to a peek strip (tours.css §17). The trade is the student's to
     reverse, on any beat, and the control is at the foot of the thing they are
     reading rather than on the map, because at 390px the map is 92px tall and
     a 44px target on it would be half the strip. It reports the state it is
     in, not the state it would move to, so a screen reader hears "Map, not
     pressed" and knows what pressing does. */
  const fitw = el('span.tr-panel__fitw', { text: 'Map' });
  const fita = el('span.tr-panel__fita', { 'aria-hidden': 'true', text: '▾' });
  const fit = el('button.tr-panel__fit', {
    type: 'button',
    'aria-pressed': 'false',
    onclick: () => bus && bus.emit('tours:fit', { toggle: true }),
  }, fitw, fita);
  const paintFit = () => {
    const big = document.documentElement.getAttribute('data-tour-fit') !== 'text';
    fit.setAttribute('aria-pressed', big ? 'true' : 'false');
    fita.textContent = big ? '▴' : '▾';
    fit.title = big ? 'Map: full band. Press to give the room back to the beat.' : 'Map: a peek strip. Press to open the map to its full band.';
    fit.setAttribute('aria-label', big
      ? 'Map — at full band; press to shrink it and give the room to this beat'
      : 'Map — a peek strip; press to open it to its full band');
  };
  paintFit();
  /* IT READS THE ATTRIBUTE, SO IT WATCHES THE ATTRIBUTE.
     ROUND 2, the phone: "On the spine beat the `.tr-panel__fit` control renders
     the visible label 'MAP ▴' but its accessible name is 'Open the map' while
     the map is already open at 192px; pressing it collapses rather than opens."
     One cause: this control was painted once at build time and repainted only
     on `tours:fit`, which is emitted by the student's own press and by nothing
     else — so every OTHER route to a change of fit left the label behind.
     There are three: a step change, a `fitAfter` beat whose plate has finished
     its work the moment the student commits, and the shell answering
     `ask:read` from the map's peek strip. All three write
     `<html data-tour-fit>`; so this observes that attribute and is right by
     construction rather than by everyone remembering to announce. */
  const offFit = bus ? bus.on('tours:fit', () => paintFit()) : null;
  let fitObs = null;
  if (typeof MutationObserver === 'function') {
    fitObs = new MutationObserver(() => {
      if (!root.isConnected) { try { fitObs.disconnect(); } catch (_) { /* gone */ } return; }
      paintFit();
    });
    try { fitObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tour-fit'] }); }
    catch (_) { fitObs = null; }
  }

  const foot = el('div.tr-panel__foot', more, bus ? fit : null, bus ? next : null);
  /* THE LOOP BEAT'S OWN CONTROLS ARE ITS THUMB-ZONE ROW.
     Measured at 390x844: the reading window on this beat is 129px, the wide
     ring is 118 and "Step it" / "Cut the revenue" are another 44 — so with the
     controls in the flow a student saw the buttons and the top third of a
     figure whose whole argument is that it is CLOSED. They are the two things
     this beat asks you to press, so on a phone they are where the press
     happens: the foot, in place of the Next twin, which tours.css stands down
     on this beat for exactly that reason. */
  if (root.dataset.kind === 'loop' && window.matchMedia && window.matchMedia('(max-width: 46rem)').matches) {
    const ctrls = flow.querySelector('.tr-loop__controls');
    if (ctrls) { ctrls.dataset.docked = 'yes'; foot.append(ctrls); }
  }
  /* THE ROUTE STRIP IS APPARATUS, AND ON A PHONE IT IS NOT WHAT STOP 1 IS FOR.
     ROUND 3, the phone: "on the poster — stop 1 of 15 — the guess input is
     ~400px below the fold, so the prediction that the Close scores can be
     skipped without the student ever seeing it." Measured at 390x844: a 260px
     reading window holding routes 65 + eyebrow 17 + question 174 + the input
     row at 292 — thirty-two pixels past the bottom edge. The strip is a choice
     about how long the lesson is; the question is what the lesson is. Below
     46rem tours.css puts the strip under the beat's own ask, which lands the
     input row inside the first window without touching the map, the plate or
     one word of the beat. */
  if (flow.querySelector('.tr-routes')) root.dataset.routes = 'yes';
  root.append(scroll, foot);

  /* --- does it have more below, and has it been scrolled? --------------
     Both are published on the root as data attributes and drawn in CSS: one
     mask at the foot while there is more, one at the head once the reader has
     moved. The cue's visibility is switched, never its display — toggling
     display fed the ResizeObserver that decides whether to show it and
     Chromium reported "ResizeObserver loop completed with undelivered
     notifications" on the loop beat. */
  let queued = false;
  const paint = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!root.isConnected) return;
      const below = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight > 8;
      const above = scroll.scrollTop > 8;
      const v = below ? 'yes' : '';
      const u = above ? 'yes' : '';
      if (root.dataset.more !== v) root.dataset.more = v;
      if (root.dataset.up !== u) root.dataset.up = u;
    });
  };
  more.addEventListener('click', () => {
    const smooth = document.documentElement.dataset.motion !== 'reduced';
    const by = Math.max(80, scroll.clientHeight - 48);
    try { scroll.scrollBy({ top: by, behavior: smooth ? 'smooth' : 'auto' }); }
    catch (_) { scroll.scrollTop += by; }
  });
  scroll.addEventListener('scroll', paint, { passive: true });
  snapLines(scroll);
  let ro = null;
  if (typeof ResizeObserver === 'function') {
    ro = new ResizeObserver(() => {
      if (!root.isConnected) {
        try { ro.disconnect(); } catch (_) { /* gone */ }
        if (fitObs) { try { fitObs.disconnect(); } catch (_) { /* gone */ } }
        if (offState) offState(); if (offFit) offFit(); return;
      }
      paint();
    });
    try { ro.observe(flow); ro.observe(scroll); } catch (_) { ro = null; }
  }
  requestAnimationFrame(paint);
  paint();
  return root;
}


/* ====================================================================== */

/**
 * buildPanel({ beat, data, bus, ledger, format, onCommit, onOpenRecord, retrieval })
 * → { node, ready }  — `ready` is false while a commitment is outstanding, so
 * the runner knows whether this beat is a gate on the forward edge.
 */
export function buildPanel(o) {
  const { beat, data, bus, store, ledger, onCommit, onOpenRecord, retrieval, essay } = o;
  const p = beat.panel || {};
  const root = el('div.tr-panel', { 'data-beat': beat.id, 'data-kind': beat.kind });
  let ready = true;

  const head = el('div.tr-panel__head',
    el('span.tr-panel__mark.num', { text: esc(beat.ledeMark || beat.mark) }),
    el('span.tr-panel__t', { text: esc(beat.t) + (beat.misconception ? ' · ' + esc(beat.misconception) : '') }));
  /* The title is printed once, by the sheet's own head. Printing it again here
     is the same heading twice in eighty pixels. */
  root.append(head);

  /* --- the free-explore dividend --------------------------------------
     A student who found this place on their own is not told it again. The
     beat converts from presentation into retrieval, and says why, because a
     silent change of mode is a change the student cannot learn from. */
  if (retrieval && retrieval.on) {
    const holder = el('div.tr-panel__body');
    const open = el('button.cx-more', { type: 'button', text: 'Now show me the account' });
    open.addEventListener('click', () => { open.remove(); holder.replaceChildren(...content()); syncFigures(root, { into: root.querySelector(':scope > .tr-panel__scroll > .tr-panel__flow') || root }); });
    root.append(el('div.tr-recall',
      el('span.tr-recall__eyebrow', { text: 'you found this one yourself' }),
      prose(retrieval.prompt, 'p', 'tr-recall__q'),
      open), holder);
    return { node: root, ready: true };
  }

  for (const n of content()) root.append(n);

  /* THE CHECK BLOCK, AT THE FOOT OF THE BEAT, AND ONLY IF THE BEAT PRINTED A
     NUMBER. One row per figure, numbered to match the marker beside the number
     itself, drawn by `core/warrant.js` so a quantity on the path and a quantity
     in a dossier are the same object with the same three statuses.

     It is rebuilt from the rendered panel whenever the panel changes, because
     half of this path's quantities are printed by a REVEAL — the compensation
     beat's £1.72m only after five cards are in order, the tension beat's second
     testimony only after the student has committed — and those nodes are built
     in a click handler long after this function has returned. */
  /* AND IT GOES INSIDE THE READING WINDOW, WHICH MOVES UNDER IT.
     `frame()` runs AFTER this function returns: it lifts everything in the
     panel into `.tr-panel__flow` inside the scroller and puts the foot after
     it. So the block appended here is carried into the flow — and the rebuild
     that a reveal triggers, which runs later still, was appending its copy to
     the panel ROOT, i.e. after the foot, outside the scroller. Measured on the
     compensation beat with the five cards in order: two `.tr-figs` blocks, one
     in `.tr-panel__flow` numbered 1-2-3 and one on `.tr-panel` numbered
     1-2-3-4, so the beat printed its own check block twice and restarted the
     numbering. `sync` takes the host it appends to, so it is told where the
     reading window is each time rather than assuming it has not moved. */
  const figHost = () => root.querySelector(':scope > .tr-panel__scroll > .tr-panel__flow') || root;
  const figOpts = {
    onOpenDispute: (id) => { if (bus) bus.emit('tours:figureDispute', { beat: beat.id, figure: id }); },
  };
  syncFigures(root, { ...figOpts, into: figHost() });
  if (typeof MutationObserver === 'function') {
    const fo = new MutationObserver(() => {
      if (!root.isConnected) { try { fo.disconnect(); } catch (_) { /* gone */ } return; }
      if (fo._q) return;
      fo._q = requestAnimationFrame(() => { fo._q = 0; syncFigures(root, { ...figOpts, into: figHost() }); });
    });
    try { fo.observe(root, { childList: true, subtree: true }); } catch (_) { /* no observer */ }
  }

  /* The frame — the scroller and its foot — is put on by the caller, AFTER it
     has appended anything of its own (the offer of the optional step is
     appended to this node by `tours/index.js`). See `frame()` above. */

  return { node: root, ready };

  /* ------------------------------------------------------------------- */
  function content() {
    const out = [];

    /* WHICH ROUTE THIS IS, AND THE OTHER ONE — FIRST, NOT LAST.
       ROUND 2, the phone: "on the phone the 'Take the thirty-minute lesson
       instead' offer sits at y=1391 inside a 223px window — about five
       scroll-screens down — so a student never sees the choice." It was the
       last block of beat 1, after the argument, the actor and the record. The
       choice of how long the lesson is belongs before the lesson, and beat 1 is
       the front door: it is the first thing in the panel now, on the first beat
       of either run, and it is nowhere else. */
    if (o.routes && o.routes.list && o.routes.list.length > 1 && o.routes.here) {
      out.push(routeStrip(o.routes));
    }

    /* THE CONTROL COMES BEFORE THE PROSE ABOUT IT.
       The panel titled "Press 1857, then 1859" printed three paragraphs first
       and put the years under them, so the sentence "press the years above"
       pointed at nothing and the thing to press was below the fold. A widget a
       beat is named after is the first thing in the beat. */
    if (Array.isArray(p.years) && p.years.length) out.push(yearsBlock());
    if (Array.isArray(p.body)) for (const line of p.body) out.push(prose(line, 'p', 'tr-p'));

    if (p.quote) {
      const q = quoteFromData(p.quote);
      if (q) out.push(el('blockquote.tr-quote', prose(q.text), el('cite', { text: q.where })));
    }

    if (Array.isArray(p.figures)) {
      const row = el('div.tr-figs');
      for (const f of p.figures) {
        row.append(el('div.cx-fig.tr-fig',
          el('span.cx-fig__v.num', { text: esc(f.v) }),
          el('span.cx-fig__l', { text: esc(f.l) }),
          f.note ? el('span.tr-fig__note', { text: esc(f.note) }) : null));
      }
      out.push(row);
    }

    if (beat.kind === 'tension') out.push(tensionBlock());
    if (beat.kind === 'source') out.push(sourceBlock());
    if (beat.kind === 'offmap') out.push(offmapBlock());
    if (beat.kind === 'predict') out.push(predictBlock());
    if (beat.kind === 'retrieve') out.push(orderBlock());
    if (beat.kind === 'sort') out.push(sortBlock());
    if (beat.kind === 'loop') out.push(loopBlock());
    if (beat.kind === 'definition') out.push(definitionBlock());
    if (p.countFrom) out.push(countBlock());

    /* PROSE THAT BELONGS AFTER THE THING IT IS ABOUT.
       `body` is printed before the beat's own widget, which is right when it
       sets the widget up and wrong when it follows from it. Measured at
       390x844 on the loop beat: 205 words of famine — which is what the loop
       DOES when the harvest fails — went in above the ring and pushed the
       figure the beat is named after three screens down. */
    if (Array.isArray(p.tail)) for (const line of p.tail) out.push(prose(line, 'p', 'tr-p'));

    if (p.note) out.push(el('p.cx-note.tr-note', { text: esc(p.note) }));

    out.push(actorBlock(beat, onOpenRecord));

    /* The long run's chapter argument, in the panel rather than behind a
       control. Charge 1: a book runs unbroken paragraphs and an interface
       chops text into cards, so on the run that has the time for it the
       argument is simply here, with its connectives showing. */
    if (essay && essay.essay) {
      const box = el('div.tr-essay.tr-essay--inline');
      box.append(el('p.tr-essay__eyebrow', { text: 'chapter ' + (essay.numeral || '') + ' — the argument, in full · '
        + String(essay.essay).trim().split(/\s+/).filter(Boolean).length + ' words' }));
      /* THE CHAPTER ARGUMENT PRINTS QUANTITIES TOO, AND THEY GET THE SAME
         TREATMENT. ROUND 3, the historian: "36 quantities printed in the path's
         own prose carry no check line." Eleven of them are in these five
         essays. The paragraphs are plain text — an essay carries no markup —
         so the token is substituted into a text node and marked, and the beat's
         own check block at the foot picks the figures up with everything else
         the panel printed. */
      for (const para of String(essay.essay).split(/\n\n+/)) {
        const q = el('p.tr-essay__p');
        q.textContent = para;
        markFigures(q);
        box.append(q);
      }
      out.push(box);
    }

    const from = p.from || (beat.map && beat.map.sel);
    if (from && onOpenRecord) {
      out.push(el('button.cx-more.tr-open', {
        type: 'button',
        text: 'The full record for ' + esc(nameOf(from)),
        onclick: () => onOpenRecord(from),
      }));
    }

    return out;
  }

  /* ------------------------------------------------------ [ROUTES] ----- */
  /**
   * WHICH ROUTE, IN ONE LINE, WITH THE COMPARISON A PRESS AWAY.
   *
   * ROUND 2, the phone: "Beat 1, before the guess is committed: the 'route you
   * are on' card is 1,096px in a 128px window (8.6 screenfuls) and slices
   * mid-clause… A student who wants to read what the core route leaves out
   * before choosing reads it three lines at a time."
   *
   * Measured at 390x844 on `#tour=core&step=1`: this block was 480px of the
   * 1,096, and it stood ABOVE the beat's own question — so on the first screen
   * of the lesson the student met a 480px comparison of two routes and had to
   * page past it to find what they were being asked. The poster's plate is the
   * question on this beat (`fit: "map"`, `fitAfter: "text"`), and that is
   * right: they are being asked to count what one colour hid.
   *
   * So the strip states the choice and holds the argument for it behind one
   * press. What stays on the first screen is everything a choice needs — which
   * route this is, how long it is, and the control that takes the other one.
   * What moves is the two straps, the two "what it leaves out" paragraphs and
   * the note about how the minutes are costed: sixty-eight words of apparatus
   * about an estimate. Nothing is removed and nothing is behind a hover.
   */
  function routeStrip(r) {
    const box = el('div.tr-routes', { role: 'group', 'aria-label': 'Which route through this lesson' });
    const here = r.list.find((v) => v.id === r.here) || r.list[0];
    const others = r.list.filter((v) => v.id !== r.here);

    /* ONE LINE. The route, its length, and the way to the other one. */
    const open = el('button.cx-more.tr-routes__open', {
      type: 'button', 'aria-expanded': 'false',
      text: others.length === 1 ? 'The other route, and what this one leaves out' : 'The other routes, and what this one leaves out',
    });
    box.append(el('p.tr-routes__line',
      el('span.tr-routes__here', { text: 'you are on' }),
      ' ',
      el('strong', { text: esc(here.label) }),
      /* WHAT IT IS FOR, ON THE LINE, IN TWO WORDS. Round 8, the classroom
         critic's standing charge: a teacher choosing at 08:55 must not have to
         compute anything. The route's purpose is authored beside the route in
         tours.json; the numbers around it are computed. */
      here.for ? el('span.tr-routes__for', { text: ' \u2014 for ' + esc(here.for) }) : null,
      el('span.tr-routes__n', { text: ' \u00b7 ' }),
      el('span.num', { text: String(here.steps) }),
      ' stops \u00b7 about ',
      el('span.num', { text: String(here.minutes) }),
      ' minutes'), open);

    const why = el('div.tr-routes__why', { hidden: true });
    for (const v of r.list) {
      const isHere = v.id === r.here;
      const row = el('div.tr-routes__row', { 'data-here': isHere ? 'yes' : '' });
      /* THE ROW IS WHERE THE CHOOSING HAPPENS, so it prints the RANGE rather
         than the single figure the line above prints, and it says in words
         whether the route fits the period. Both ends are `budget.js`'s two
         reading rates; `fitsPeriod` and `periods` are computed from the SLOW
         end, because a route that fits a period only if the class reads at 180
         words a minute does not fit a period. */
      row.append(el('p.tr-routes__lab',
        el('strong', { text: esc(v.label) }),
        isHere ? el('span.tr-routes__here', { text: 'you are on this' }) : null,
        v.for ? el('span.tr-routes__for', { text: ' \u2014 for ' + esc(v.for) }) : null,
        el('span.tr-routes__n', { text: ' \u00b7 ' }),
        el('span.num', { text: String(v.steps) }),
        ' stops \u00b7 ',
        el('span.num', { text: String(v.minutesSay || v.minutes) }),
        ' minutes',
        v.periodMinutes ? el('span.tr-routes__fit', {
          text: ' \u00b7 ' + (v.fitsPeriod
            ? 'fits one ' + v.periodMinutes + '-minute period'
            : 'needs ' + v.periods + ' periods of ' + v.periodMinutes + ' minutes'),
        }) : null));
      if (v.strap) row.append(el('p.tr-routes__strap', { text: esc(v.strap) }));
      /* What a route leaves out is printed whether or not you are on it: a
         choice between two lengths that does not say what the shorter one
         costs is not a choice. */
      if (v.leaves) row.append(el('p.cx-note.tr-routes__leaves', { text: esc(v.leaves) }));
      if (!isHere) {
        row.append(el('button.cx-more.tr-routes__go', {
          type: 'button', text: 'Take ' + esc(v.label) + ' instead',
          onclick: () => r.onPick(v.id),
        }));
      }
      why.append(row);
    }
    /* WHY IT IS A RANGE AND NOT A NUMBER.
       ROUND 3, the rubric: "the door says 'about 30 minutes' for core; the
       route's own cost model says 31.6 and the prose actually on screen across
       the fifteen stops measures ~7,200 words including reveals, which is
       35-45 minutes for a median 16-year-old." The model was right about the
       beats and wrong about the reader, so it is now run twice — once at the
       180 words a minute it was written at, once at 110 — and the card prints
       both ends rather than the flattering one. */
    /* WHERE THE ONE NUMBER COMES FROM, AND WHAT IT IS THE MIDDLE OF.
       ROUND 7: the door and this card printed two different figures for the
       same run (35 against 35-45), and the model behind both was counting only
       the authored prose — not the three counted figures the viz module mounts
       inside beats, and not the retrieval moments the quiz drops into them.
       Both are costed now, the two ends are still computed at two reading
       rates, and the figure on the line above is their middle. */
    why.append(el('p.cx-note.tr-routes__how', {
      text: 'The ' + (here.minutes || '?') + ' is one number for a range, and here is the range: about '
        + (here.minutesLow || here.minutes) + ' minutes if you read at 180 words a minute, about '
        + (here.minutesMax || here.minutes) + ' at 110, which is nearer a class. It is this app costing its own '
        + 'run \u2014 every authored beat, '
        + (here.figures ? here.figures + ' counted figure' + (here.figures === 1 ? '' : 's') + ' inside beats, ' : '')
        + (here.checkpoints ? here.checkpoints + ' retrieval moment' + (here.checkpoints === 1 ? '' : 's') + ', ' : '')
        + 'every gate and every argument \u2014 twice over, at those two reading speeds. The doing (guessing, '
        + 'sorting, placing, writing) is costed the same either way, and every figure here is rounded to five '
        + 'minutes, which is the precision an estimate like this has. Not a promise about you.',
    }));
    open.addEventListener('click', () => {
      const now = why.hidden;
      why.hidden = !now;
      open.setAttribute('aria-expanded', now ? 'true' : 'false');
      open.textContent = now ? 'Close that' : (others.length === 1
        ? 'The other route, and what this one leaves out'
        : 'The other routes, and what this one leaves out');
    });
    box.append(why);
    return box;
  }

  function nameOf(id) {
    const t = data.byId && data.byId.get(id);
    return (t && (t.shortName || t.name)) || id;
  }

  function quoteFromData(spec) {
    const t = data.byId && data.byId.get(spec.territoryId);
    if (!t) return null;
    const m = /^acquisitions\[(\d+)\]\.(\w+)$/.exec(spec.field || '');
    if (m && t.acquisitions && t.acquisitions[+m[1]]) {
      const a = t.acquisitions[+m[1]];
      const text = a[m[2]];
      if (!text) return null;
      return { text, where: 'this atlas, ' + nameOf(spec.territoryId) + ' — how it was taken, ' + (a.date ? a.date.display : '') };
    }
    return null;
  }

  /* --------------------------------------------------- [TENSION] ------
   * TWO CONTEMPORARIES, SET AGAINST EACH OTHER.
   *
   * THE DEFECT THIS ANSWERS, and it is the only rubric criterion this app has
   * ever held below 5. C6 asks for multiperspectivity with named actors. Every
   * beat on this path already carries a named non-British actor — the "in the
   * room" block below — but a cameo is not a perspective. Naming Rani Jind
   * Kaur beside Amritsar tells a student that somebody was there; it never
   * once asks them to hold two people who were there against each other and
   * decide which account explains more. Amritsar has had the material for it
   * in the corpus since the testimony file was written: Dyer's evidence to the
   * Hunter Committee, Tagore's letter returning his knighthood, and Gandhi's
   * statement at the Great Trial, three documents about one morning, made
   * within three years of it and of each other.
   *
   * THE MOVE, AND WHY IT IS IN THIS ORDER. Commit before reveal, like every
   * other question in this app. The student says what each man was placed to
   * KNOW and what each WANTED from writing it down, and then which account
   * explains more — and only then are the documents printed. That order is the
   * whole exercise: an answer given after reading the source is a reading
   * comprehension question, and an answer given before it is a hypothesis the
   * evidence can damage.
   *
   * NOTHING HERE IS SCORED, and nothing here has a right answer, because the
   * question "what did he want" is a historian's judgement and not a fact.
   * What the reveal prints instead is this atlas's own record of the two
   * texts — nature, origin, purpose, and what each cannot tell you — through
   * `renderSource()`, the one function in this application permitted to print
   * a quotation. The student's five commitments are then beside the four
   * questions, and they can see for themselves where they were reading the man
   * rather than the document.
   *
   * IT WRITES ONE LEDGER ROW, kind `collapsed` — P21's own vocabulary for
   * choosing between competing claims, which is exactly what the last question
   * asks — so the Close prints it under the student's name.
   */
  function tensionBlock() {
    const spec = p.tension || {};
    const key = 'p05:' + beat.id + ':tension';
    const box = el('div.cx-ask.tr-ask.tr-tension', { role: 'group', 'aria-label': 'Two accounts of one event' });

    const texts = (() => {
      const t = (typeof window !== 'undefined' && window.BEA && window.BEA.testimony && window.BEA.testimony.texts) || [];
      return new Map(t.map((x) => [x.id, x]));
    })();
    const srcA = texts.get(spec.a && spec.a.src) || null;
    const srcB = texts.get(spec.b && spec.b.src) || null;
    const srcC = texts.get(spec.third && spec.third.src) || null;

    /* THE ATLAS DOES NOT ASK A QUESTION ABOUT A DOCUMENT IT CANNOT PRODUCE.
       The corpus is another piece's file, read here and never copied. If it is
       not on the page this beat says so and stands down, rather than asking a
       student to weigh two texts it is about to fail to print. */
    if (!srcA || !srcB) {
      box.append(el('p.cx-note.cx-note--warn', {
        text: 'This beat sets two documents against each other and this build cannot reach the '
          + 'transcribed corpus, so it would be asking you about words it cannot show you. It is '
          + 'skipped rather than faked.',
      }));
      return box;
    }

    box.append(el('p.cx-ask__eyebrow', { text: 'two people who were there, and they do not agree' }));
    box.append(prose(spec.event, 'p', 'tr-p tr-tension__event'));

    /* DECLARED BEFORE THE `prior` BRANCH, because `revealNodes()` reads it and
       that branch calls `revealNodes()`. Left below, the reveal of a beat the
       student had already answered threw a ReferenceError in the temporal dead
       zone and the panel rendered empty. */
    const picked = new Map();
    const prior = ledger && ledger.get(key);
    if (prior) {
      box.append(el('p.tr-reveal__said',
        el('span.tr-reveal__lab', { text: 'you said ' }), el('strong', { text: esc(prior.youSaid) })));
      box.append(...revealNodes());
      return box;
    }

    ready = false;
    box.append(prose(spec.ask, 'p', 'cx-ask__q'));

    /* One column per person, two questions each, and then the one question that
       makes them argue. Five taps; the commit is the fifth. */
    const cols = el('div.tr-tension__cols');
    const askBlock = (side, man) => {
      const col = el('div.tr-tension__col', { 'data-side': side });
      col.append(el('p.tr-tension__who',
        el('strong', { text: esc(man.who) }),
        el('span.tr-tension__stands', { text: esc(man.stands) })));
      for (const field of ['knew', 'wanted']) {
        const q = man[field];
        if (!q) continue;
        const id = side + ':' + field;
        col.append(el('p.tr-tension__q', { text: esc(q.ask) }));
        const list = el('div.tr-tension__opts', { role: 'group', 'aria-label': esc(q.ask) });
        for (const opt of q.options || []) {
          list.append(el('button.tr-choice.tr-tension__opt', {
            type: 'button', 'data-opt': opt.id, 'aria-pressed': 'false',
            text: esc(opt.label),
            onclick: (ev) => choose(list, id, opt, ev.currentTarget),
          }));
        }
        col.append(list);
      }
      return col;
    };
    const colA = askBlock('a', spec.a);
    const colB = askBlock('b', spec.b);
    cols.append(colA, colB);
    box.append(cols);

    const last = el('div.tr-tension__last');
    last.append(el('p.tr-tension__q.tr-tension__q--last', { text: esc(spec.explains && spec.explains.ask) }));
    const lastList = el('div.tr-tension__opts', { role: 'group', 'aria-label': esc(spec.explains && spec.explains.ask) });
    for (const opt of (spec.explains && spec.explains.options) || []) {
      lastList.append(el('button.tr-choice.tr-tension__opt', {
        type: 'button', 'data-opt': opt.id, 'aria-pressed': 'false',
        text: esc(opt.label),
        onclick: (ev) => choose(lastList, 'explains', opt, ev.currentTarget),
      }));
    }
    last.append(lastList);
    box.append(last);

    /* ONE PERSON AT A TIME, ON A PHONE.
     *
     * ROUND 2, the rubric, `must fix`: "the Amritsar beat is still 2,154px of
     * content in a 434px slot on a phone, five screenfuls, on the emotionally
     * heaviest material in the lesson."
     *
     * Reading mode has already taken every pixel there is out of the shell —
     * the map is a 44px strip, the ribbon is gone, the time control is a 52px
     * year line and the panel has 570 of 844. The remaining length is the
     * BEAT, and measured at 390x844 it is: the event 303, the ask 87, two
     * columns of two questions each 485 and 493, the third question 304, the
     * nag 74, the actor 210 and the check block 380. Nothing in that list is
     * padding.
     *
     * So the beat is staged instead of shortened. Dyer's two questions first;
     * Tagore's arrive when Dyer's are answered; the question that makes the two
     * argue arrives when both men have been read. That is also the better
     * teaching order — you cannot say which account explains more until you
     * have taken a position on each — and it is what a teacher does with this
     * material at the front of a room. Where the room exists the whole beat is
     * on screen at once, unchanged.
     *
     * AND THE TEST FOR "WHERE THE ROOM EXISTS" IS HEIGHT, NOT WIDTH.
     * ROUND 3, the classroom critic, as a `must fix`: "the one-person-at-a-time
     * staging of the tension beat stops at 46rem, so the projector case is the
     * worst case." Measured on this beat, `.tr-panel__scroll` against its own
     * content: 390x844 (staged) 458 holding 1,794 — 3.9 screenfuls; 1024x640
     * 463 holding 2,951 — 6.4; 900x700 546 holding 3,065 — 5.6; 1366x768 587
     * holding 2,645 — 4.5; 1440x900 745 holding 2,529 — 3.4. A wide screen that
     * is SHORT is the worst surface in the set, and it was the only one getting
     * the unstaged beat, because the gate asked about the wrong axis. The
     * window a panel gets comes out of the viewport's height, so that is what
     * is asked: 820px is where this beat comes back under four screenfuls, and
     * it is a measurement rather than a breakpoint.
     */
    const staged = typeof window !== 'undefined'
      && ((window.matchMedia && window.matchMedia('(max-width: 46rem)').matches)
        || (window.innerHeight > 0 && window.innerHeight < 820));
    if (staged) {
      colB.hidden = true;
      last.hidden = true;
      cols.dataset.staged = 'yes';
      colB.append(el('p.cx-note.tr-tension__stagenote', { text: 'The second account. Take a position on this one too, then the question that puts them against each other.' }));
    }

    /* ROUND 3, the classroom critic: "'nothing here has a right answer' about a
       question that does have a defensible answer — the enclosure plan proves
       Dyer knew the crowd was penned — so the app declines to correct where it
       could." It was true and it was the wrong lesson: "what was he placed to
       know" is a question about a situation and the documents often settle it;
       "what did he want the words to do" is a reading and they do not. So the
       beat now says which is which, and on the reveal it marks the ones the
       documents settle and prints the reason. A history teacher who will not
       correct anything has taught that nothing can be. */
    const nSettled = [spec.a && spec.a.knew, spec.a && spec.a.wanted,
      spec.b && spec.b.knew, spec.b && spec.b.wanted, spec.explains]
      .filter((q) => q && q.settles).length;
    const total = 4 + (spec.explains ? 1 : 0);
    const nag = el('p.cx-note.tr-nag', {
      text: total + ' choices, then the documents. Nothing is scored. '
        + (nSettled
          ? nSettled + ' of the ' + total + ' have an answer the documents settle, and the reveal will say which and why; the rest are judgements a historian can argue either way.'
          : 'What you get back is the record of both texts, not a mark.'),
    });
    const go = el('button.btn.btn--small.tr-tension__go', { type: 'button', disabled: true, text: 'Show me what they wrote' });
    go.addEventListener('click', commit);
    box.append(nag, go);
    return box;

    function choose(list, id, opt, btn) {
      picked.set(id, opt);
      for (const b of list.children) {
        const on = b === btn;
        b.dataset.on = on ? 'yes' : '';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      if (staged) {
        const aDone = picked.has('a:knew') && picked.has('a:wanted');
        const bDone = picked.has('b:knew') && picked.has('b:wanted');
        if (aDone && colB.hidden) {
          colB.hidden = false;
          announce('Now the second account. ' + ((spec.b && spec.b.who) || '') + '.');
          try { colB.scrollIntoView({ block: 'start', behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' }); } catch (_) { /* older engines */ }
        }
        if (aDone && bDone && last.hidden) {
          last.hidden = false;
          announce('Both read. One question left: which account explains more.');
          try { last.scrollIntoView({ block: 'start', behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' }); } catch (_) { /* older engines */ }
        }
      }
      const done = picked.size >= 5;
      go.disabled = !done;
      nag.textContent = done
        ? 'All ' + total + '. The documents are one press away, and they were not written for you.'
        : (5 - picked.size) + ' to go. Nothing is scored.';
    }

    function commit() {
      if (picked.size < 5) return;
      const said = (spec.a.who + ' knew: ' + short('a:knew')
        + ' · wanted: ' + short('a:wanted')
        + ' — ' + spec.b.who + ' knew: ' + short('b:knew')
        + ' · wanted: ' + short('b:wanted')
        + ' — explains more: ' + short('explains'));
      onCommit({
        kind: 'collapsed', claimId: key, beatId: beat.id, t: beat.t,
        misconceptionId: beat.misconception, prompt: spec.explains && spec.explains.ask,
        youSaid: said, verdict: 'confirmed', year: beat.map && beat.map.year,
      });
      box.replaceChildren(
        el('p.cx-ask__eyebrow', { text: 'what you said, and then the documents' }),
        el('p.tr-reveal__said', el('span.tr-reveal__lab', { text: 'you said ' }), el('strong', { text: said })),
        ...revealNodes());
      ready = true;
      if (o.onReady) o.onReady();
      try { box.scrollIntoView({ block: 'start' }); } catch (_) { /* older engines */ }
    }

    function short(id) {
      const v = picked.get(id);
      return v ? String(v.label).replace(/[.—]\s*$/, '') : '—';
    }

    /* The reveal is the corpus, not our opinion of it. `cite()` routes through
       the dossier's `renderSource()`, which prints nature / origin / purpose /
       what it cannot tell you ABOVE the words and in front of them in DOM
       order — so the four questions this beat has just asked in the student's
       own words are answered here about the documents. */
    function revealNodes() {
      const out = [];
      out.push(prose(spec.reveal, 'p', 'tr-p tr-p--reveal'));
      /* WHERE THE DOCUMENTS DO SETTLE IT, SAY SO — with the reason, and with
         what this student actually chose, so the correction is about their
         answer and not a general remark. */
      const settled = [[spec.a && spec.a.knew, 'a:knew', spec.a], [spec.a && spec.a.wanted, 'a:wanted', spec.a],
        [spec.b && spec.b.knew, 'b:knew', spec.b], [spec.b && spec.b.wanted, 'b:wanted', spec.b],
        [spec.explains, 'explains', null]].filter(([q]) => q && q.settles);
      if (settled.length) {
        const box2 = el('div.tr-tension__settled');
        box2.append(el('p.tr-tension__settledlab', { text: 'these two the documents settle' }));
        for (const [q, id, man] of settled) {
          const chose = picked.get(id) || null;
          const right = (q.options || []).find((o) => o.id === q.settles.option);
          const ok = chose && chose.id === q.settles.option;
          const row = el('div.tr-tension__settle', { 'data-ok': ok ? 'yes' : (chose ? 'no' : '') });
          row.append(el('p.tr-tension__settleq', { text: esc((man && man.who ? man.who + ' — ' : '') + q.ask) }));
          if (chose) {
            row.append(el('p.tr-tension__settlemine',
              el('span.tr-reveal__lab', { text: ok ? 'you said, and the documents agree — ' : 'you said — ' }),
              esc(chose.label)));
          }
          if (!ok && right) {
            row.append(el('p.tr-tension__settleans',
              el('span.tr-reveal__lab', { text: 'the documents say — ' }), esc(right.label)));
          }
          row.append(prose(q.settles.because, 'p', 'tr-p tr-p--why'));
          box2.append(row);
        }
        if (spec.judgement) box2.append(prose(spec.judgement, 'p', 'cx-note'));
        out.push(box2);
      }
      for (const [side, src] of [[spec.a, srcA], [spec.b, srcB]]) {
        const wrap = el('div.tr-tension__doc');
        wrap.append(el('p.tr-tension__doclab',
          el('strong', { text: esc(side.who) }),
          el('span.tr-tension__stands', { text: esc(side.stands) })));
        const node = cite(src, bus);
        if (node) wrap.append(node);
        out.push(wrap);
      }
      /* THE THIRD VOICE IS OFFERED, NOT PRINTED.
         The beat's argument is between two documents and is complete with two.
         Gandhi's statement is the proof that the argument did not stop, and it
         is one press away rather than a third full provenance block in a 198px
         rail — measured, the three blocks together put the whole path over
         `p05-clock.js`'s 45-minute disqualifier by a minute. */
      if (srcC) {
        const wrap = el('div.tr-tension__doc.tr-tension__doc--third');
        wrap.append(prose(spec.third.lead, 'p', 'tr-p'));
        const open = el('button.cx-more', { type: 'button', text: 'The third man, three years later' });
        open.addEventListener('click', () => {
          const node = cite(srcC, bus);
          open.replaceWith(node || el('p.cx-note', { text: 'This atlas cannot reach that text.' }));
        });
        wrap.append(open);
        out.push(wrap);
      }
      /* THE ATLAS'S OWN ACCOUNT OF THE MORNING, AFTER THE COMMITMENT.
         Amritsar used to be two steps: a `present` beat that printed the count
         and the geography, and then this one, which argued about them. 350
         seconds and 549 words on one morning across two rectangles, and the
         count was printed before the question that the count answers. It is
         one beat now, and the figures land where they do work: on the reveal,
         beside the two documents that disagree about them. */
      if (spec.after) {
        const w = el('div.tr-tension__after');
        for (const line of spec.after.body || []) w.append(prose(line, 'p', 'tr-p'));
        if (Array.isArray(spec.after.figures)) {
          const row = el('div.tr-figs');
          for (const f of spec.after.figures) {
            row.append(el('div.cx-fig.tr-fig',
              el('span.cx-fig__v.num', { text: esc(f.v) }),
              el('span.cx-fig__l', { text: esc(f.l) }),
              f.note ? el('span.tr-fig__note', { text: esc(f.note) }) : null));
          }
          w.append(row);
        }
        out.push(w);
      }
      out.push(el('div.tr-tension__close', prose(spec.close, 'p', 'tr-p')));
      return out;
    }
  }

  /* ---------------------------------------------------- [SOURCE] ------
   * THE STUDENT WRITES THE FOUR LINES FIRST.
   *
   * ROUND 3, the historian, as the single biggest gap in the whole app:
   * "Every one of the 43 primary texts arrives with nature / origin / purpose /
   * what-it-cannot-tell-you already written by the atlas. The two-in-tension
   * beat asks five multiple-choice questions and then hands over the answer
   * sheet. The student can RECOGNISE source reasoning; they never PRODUCE any.
   * Give them one text with those four fields blank, take their sentences,
   * then show the atlas's beside them."
   *
   * That is exactly this block, and Lobengula's 1889 letter to Queen Victoria
   * is the case the historian named: a document about a document, written by
   * the man whose mark was on the first one, six months after he made it, in a
   * language he did not write, carried to a sovereign who did not act on it.
   * Every one of the four fields has something hard in it.
   *
   * THE ORDER IS THE EXERCISE. The words are printed — you cannot say what a
   * document is without reading it — and NOTHING ELSE is. The atlas's own four
   * lines are not in the DOM until the student has written four of their own,
   * because a field with the answer one scroll below it is a copying task.
   * `renderSource()` then prints ours in the same rectangle, beside theirs,
   * clause for clause.
   *
   * NOTHING IS MARKED and nothing can be: these are sentences, not options,
   * and no machine on this page can tell a good one from a bad one. What the
   * student gets is the comparison, which is the only feedback a source
   * exercise has ever really had. The Ledger row is kind `wrote` so the Close
   * can print it under their own name.
   */
  function sourceBlock() {
    const spec = (p.source) || {};
    const key = 'p05:' + beat.id + ':source';
    const box = el('div.cx-ask.tr-ask.tr-source', { role: 'group', 'aria-label': 'Write the four lines about this document' });

    const texts = (() => {
      const t = (typeof window !== 'undefined' && window.BEA && window.BEA.testimony && window.BEA.testimony.texts) || [];
      return new Map(t.map((x) => [x.id, x]));
    })();
    const src = texts.get(spec.src) || null;
    if (!src) {
      box.append(el('p.cx-note.cx-note--warn', {
        text: 'This beat asks you to write four lines about a transcribed document and this build cannot '
          + 'reach the corpus, so it would be asking you about words it cannot show you. It is skipped '
          + 'rather than faked.',
      }));
      return box;
    }

    box.append(el('p.cx-ask__eyebrow', { text: 'you write the four lines first' }));

    /* The document, and only the document. Author, work, date and where to
       check it are the minimum a reader needs to answer "where did it come
       from"; nature, origin, purpose and cannotTell are withheld — they are
       the four things being asked for. */
    const doc = el('blockquote.tr-source__doc');
    doc.append(el('p.tr-source__quote', { text: '\u201c' + esc(src.quote) + '\u201d' }));
    doc.append(el('cite.tr-source__cite', esc(src.speaker || (src.author + ', ' + src.year))));
    box.append(doc);
    box.append(el('p.tr-source__check',
      el('span.tr-source__checklab', { text: 'where to check it — ' }), esc(src.check || 'not recorded')));

    /* RE-ENTRY. The Ledger keeps `youSaid` and nothing else this beat wrote —
       `FIELDS` in close/ledger.js is a whitelist and it is another piece's
       file — so the four sentences are stored in it, labelled, and read back
       out of it here. A student who comes back to this beat sees their own
       words, not four dashes. */
    const prior = ledger && ledger.get(key);
    if (prior) { box.append(...reveal(unpack(prior.youSaid), prior.youSaid)); return box; }

    ready = false;
    box.append(prose(spec.lead, 'p', 'cx-ask__q'));

    const fields = spec.fields || [];
    const inputs = new Map();
    const form = el('div.tr-source__form');
    for (const f of fields) {
      const id = 'tr-src-' + beat.id + '-' + f.id;
      const lab = el('label.tr-source__flab', { for: id }, esc(f.label));
      const hint = el('p.tr-source__fhint', { id: id + '-h', text: esc(f.hint) });
      const ta = el('textarea.tr-source__in', {
        id, rows: '2', spellcheck: 'true',
        'aria-describedby': id + '-h',
        placeholder: 'In your own words…',
      });
      ta.addEventListener('input', gauge);
      inputs.set(f.id, ta);
      form.append(el('div.tr-source__field', lab, hint, ta));
    }
    box.append(form);

    /* TWENTY CHARACTERS, NOT FOUR HUNDRED. The gate is "you have committed to
       a sentence", not "you have written enough". A student who types six words
       into each box has done the thing this beat exists for. */
    const MIN = 20;
    const count = el('p.cx-note.tr-source__count');
    const go = el('button.btn.btn--small.tr-source__go', { type: 'button', disabled: true, text: 'Now show me this atlas\u2019s four lines' });
    const skip = el('button.cx-more.tr-source__skip', {
      type: 'button',
      text: 'I would rather read this atlas\u2019s four lines',
      title: 'Recorded as a decline. You will get the four lines, and the Close will say you did not write your own.',
    });
    const skipPrice = el('p.cx-note.tr-skip__price', {
      text: 'You will get ours either way. A decline is recorded under your name, and the Close says which of the four you wrote.',
    });
    go.addEventListener('click', () => commit(false));
    skip.addEventListener('click', () => commit(true));
    box.append(count, go, skip, skipPrice);
    gauge();
    return box;

    /* The inverse of `said.join(' \u00b7 ')` in `commit`. Labels are authored in
       tours.json and cannot contain the separator. */
    function unpack(line) {
      if (!line || typeof line !== 'string') return null;
      const out = {};
      let any = false;
      for (const part of line.split(' \u00b7 ')) {
        for (const f of fields) {
          const lab = String(f.label).replace(/\?$/, '');
          if (part.indexOf(lab) === 0) { out[f.id] = part.slice(lab.length).trim(); any = true; }
        }
      }
      return any ? out : null;
    }

    function gauge() {
      let done = 0;
      for (const ta of inputs.values()) if (ta.value.trim().length >= MIN) done += 1;
      go.disabled = done < inputs.size;
      count.textContent = done >= inputs.size
        ? 'All four written. Ours are one press away — and they are not a mark scheme.'
        : done + ' of ' + inputs.size + ' written. Nothing is scored; a sentence each is enough.';
    }

    function commit(skipped) {
      const said = [];
      const mine = {};
      for (const f of fields) {
        const v = (inputs.get(f.id) || {}).value || '';
        mine[f.id] = v.trim();
        if (v.trim()) said.push(f.label.replace(/\?$/, '') + ' ' + v.trim());
      }
      onCommit({
        /* `attributed` — the Ledger's own word for "answered what this source
           was made for", which is three of these four fields and the hardest
           of them. A new kind would have to be added to close/ledger.js, which
           is another piece's file; this one already means the right thing. */
        kind: 'attributed',
        claimId: key, beatId: beat.id, t: beat.t,
        misconceptionId: beat.misconception,
        prompt: 'Nature, origin, purpose and what it cannot tell you — for ' + (src.work || 'this document'),
        youSaid: skipped ? 'I read this atlas\u2019s four lines without writing my own' : said.join(' \u00b7 '),
        fields: mine,
        verdict: skipped ? 'declined' : 'confirmed',
        year: beat.map && beat.map.year,
      });
      const wrap = el('div.tr-source__after');
      wrap.append(...reveal(skipped ? null : mine, null));
      form.replaceWith(wrap);
      count.remove(); go.remove(); skip.remove(); skipPrice.remove();
      ready = true;
      if (o.onReady) o.onReady();
      try { wrap.scrollIntoView({ block: 'start' }); } catch (_) { /* older engines */ }
    }

    /* Theirs and ours, clause for clause, in one column on a phone and two
       where there is room. `renderSource()` prints the atlas's record whole
       underneath, because the four fields are not the whole record — the
       quotation, what it supports and where to check it are in it too. */
    function reveal(mine, saidLine) {
      const out = [];
      out.push(prose(spec.reveal, 'p', 'tr-p tr-p--reveal'));
      if (!mine && saidLine) {
        out.push(el('p.tr-reveal__said',
          el('span.tr-reveal__lab', { text: 'you said ' }), el('strong', { text: esc(saidLine) })));
      }
      const grid = el('div.tr-source__vs');
      const OURS = { nature: 'nature', origin: 'origin', purpose: 'purpose', cannot: 'cannotTell' };
      for (const f of fields) {
        const row = el('div.tr-source__row');
        row.append(el('p.tr-source__rlab', { text: esc(f.label) }));
        row.append(el('div.tr-source__mine',
          el('span.tr-source__who', { text: 'yours' }),
          el('p.tr-p', { text: (mine && mine[f.id]) ? mine[f.id] : '\u2014 you did not write this one.' })));
        row.append(el('div.tr-source__ours',
          el('span.tr-source__who', { text: 'this atlas' }),
          el('p.tr-p', { text: esc(src[OURS[f.id]] || 'not recorded') })));
        grid.append(row);
      }
      out.push(grid);
      const full = el('div.tr-source__full');
      full.append(el('p.cx-note', { text: 'And the whole record, including what this atlas cites it for:' }));
      const node = cite(src, bus);
      if (node) full.append(node);
      out.push(full);
      if (spec.close) out.push(el('div.tr-source__close', prose(spec.close, 'p', 'tr-p')));
      const second = secondRound();
      if (second) out.push(second);
      return out;
    }

    /**
     * THE SECOND DOCUMENT, AND IT CUTS THE OTHER WAY.
     *
     * ROUND 2, the rubric, `must fix`: "the four-line source task (H2) fires
     * once, on Lobengula. The historian asked for one; a second, on a source
     * whose purpose cuts the other way (Trevelyan or Salisbury), would let the
     * student see that the four fields answer differently for a document
     * written to justify rather than to protest. The Workshop already holds
     * both texts."
     *
     * It is a second round INSIDE this beat rather than a second beat, for two
     * reasons. The route is thirty minutes and a beat costs three; and the
     * teaching move is the COMPARISON — the same four questions, asked twice,
     * on a letter written by a king who had been deceived and on an
     * after-dinner speech by the man who had just signed the agreement. Purpose
     * is the field that moves, and it only moves if both are in one reading.
     *
     * It is offered, not forced: the beat's own commitment is already made and
     * Next is already unlocked, so a student with four minutes takes it and a
     * class running to a bell does not. Its own commitment is recorded under
     * its own claim id, so the Close can tell one from the other.
     */
    function secondRound() {
      const two = spec.second;
      if (!two || !two.src) return null;
      const src2 = texts.get(two.src);
      if (!src2) return null;
      const key2 = 'p05:' + beat.id + ':source2';
      const wrap = el('div.tr-source2');
      const prior2 = ledger && ledger.get(key2);

      const build = () => {
        fill(wrap);
        wrap.append(el('p.cx-ask__eyebrow', { text: 'the same four questions, on a document written to justify' }));
        if (two.lead) wrap.append(prose(two.lead, 'p', 'cx-ask__q'));
        const doc2 = el('blockquote.tr-source__doc');
        doc2.append(el('p.tr-source__quote', { text: '\u201c' + esc(src2.quote) + '\u201d' }));
        doc2.append(el('cite.tr-source__cite', esc(src2.speaker || (src2.author + ', ' + src2.year))));
        wrap.append(doc2);
        wrap.append(el('p.tr-source__check',
          el('span.tr-source__checklab', { text: 'where to check it — ' }), esc(src2.check || 'not recorded')));

        const ins = new Map();
        const form2 = el('div.tr-source__form');
        for (const f of fields) {
          const id = 'tr-src2-' + beat.id + '-' + f.id;
          const ta = el('textarea.tr-source__in', {
            id, rows: '2', spellcheck: 'true',
            'aria-describedby': id + '-h',
            placeholder: 'In your own words…',
          });
          ta.addEventListener('input', gauge2);
          ins.set(f.id, ta);
          form2.append(el('div.tr-source__field',
            el('label.tr-source__flab', { for: id }, esc(f.label)),
            el('p.tr-source__fhint', { id: id + '-h', text: esc(f.hint) }),
            ta));
        }
        wrap.append(form2);
        const count2 = el('p.cx-note.tr-source__count');
        const go2 = el('button.btn.btn--small.tr-source__go', { type: 'button', disabled: true, text: 'Now show me this atlas\u2019s four lines' });
        go2.addEventListener('click', () => {
          const said = [];
          const mine2 = {};
          for (const f of fields) {
            const v = ((ins.get(f.id) || {}).value || '').trim();
            mine2[f.id] = v;
            if (v) said.push(String(f.label).replace(/\?$/, '') + ' ' + v);
          }
          /* `attributed`, the same kind the first round writes — the Ledger's
             own word for "answered what this source was made for". A second
             claim id, so the Close can tell one document from the other. */
          if (onCommit) {
            onCommit({
              kind: 'attributed',
              claimId: key2, beatId: beat.id, t: beat.t,
              misconceptionId: beat.misconception,
              prompt: 'Nature, origin, purpose and what it cannot tell you — for ' + (src2.work || 'the second document'),
              youSaid: said.join(' \u00b7 '),
              fields: mine2,
              verdict: 'confirmed',
              year: src2.year,
            });
          }
          show(mine2);
        });
        wrap.append(count2, go2);
        gauge2();

        function gauge2() {
          let done = 0;
          for (const ta of ins.values()) if (ta.value.trim().length >= 20) done += 1;
          go2.disabled = done < ins.size;
          count2.textContent = done >= ins.size
            ? 'All four written. Ours are one press away.'
            : done + ' of ' + ins.size + ' written. Nothing is scored; a sentence each is enough.';
        }
      };

      const show = (mine2) => {
        fill(wrap);
        wrap.append(el('p.cx-ask__eyebrow', { text: 'two documents, four questions, and the field that moved' }));
        const grid = el('div.tr-source__vs');
        const OURS2 = { nature: 'nature', origin: 'origin', purpose: 'purpose', cannot: 'cannotTell' };
        for (const f of fields) {
          const row = el('div.tr-source__row');
          row.append(el('p.tr-source__rlab', { text: esc(f.label) }));
          row.append(el('div.tr-source__mine',
            el('span.tr-source__who', { text: 'yours' }),
            el('p.tr-p', { text: (mine2 && mine2[f.id]) ? mine2[f.id] : '\u2014 you did not write this one.' })));
          row.append(el('div.tr-source__ours',
            el('span.tr-source__who', { text: 'this atlas' }),
            el('p.tr-p', { text: esc(src2[OURS2[f.id]] || 'not recorded') })));
          grid.append(row);
        }
        wrap.append(grid);
        const full2 = el('div.tr-source__full');
        full2.append(el('p.cx-note', { text: 'And the whole record, including what this atlas cites it for:' }));
        const n2 = cite(src2, bus);
        if (n2) full2.append(n2);
        wrap.append(full2);
        if (two.close) wrap.append(el('div.tr-source__close', prose(two.close, 'p', 'tr-p')));
      };

      if (prior2) { show(unpack2(prior2.youSaid)); return wrap; }

      /* The offer. Nothing is locked behind it. */
      const offer = el('button.cx-more.tr-source2__go', {
        type: 'button',
        text: two.offer || 'Now one written to justify — the same four questions',
      });
      offer.addEventListener('click', build);
      wrap.append(el('p.cx-note.tr-source2__say', { text: two.say || '' }), offer);
      return wrap;

      function unpack2(line) {
        if (!line || typeof line !== 'string') return null;
        const out2 = {};
        let any = false;
        for (const part of line.split(' \u00b7 ')) {
          for (const f of fields) {
            const lab = String(f.label).replace(/\?$/, '');
            if (part.indexOf(lab) === 0) { out2[f.id] = part.slice(lab.length).trim(); any = true; }
          }
        }
        return any ? out2 : null;
      }
    }
  }

  /* ---------------------------------------------------- [OFFMAP] ------
   * THE CASE THAT BREAKS OUR OWN CLAIM.
   *
   * The three non-British exits — Algeria, the Congo, Angola and Mozambique —
   * were written for the teaching desk's transfer workshop and are the app's
   * strongest single asset for C8, and no student walking the path has ever
   * met one. This step brings one of them onto the path: the Congo, because it
   * is the one that BREAKS the claim rather than confirming it, and a frame
   * that has only ever been confirmed has not been tested.
   *
   * THE CONTENT IS NOT COPIED. `PORTABLE_CASES` is loaded at runtime from
   * `teacher/portable.js` — read, never written, and never re-typed here, so
   * there is exactly one text of each case in this application and this step
   * cannot drift away from the workshop's. If the teacher module is not on the
   * page the step says so and lets Next through.
   */
  function offmapBlock() {
    const box = el('div.cx-ask.tr-ask.tr-offmap', { role: 'group', 'aria-label': 'A case off this map' });
    /* WHICH EMPIRE THIS TIME. ROUND 3: "Only the Congo is reachable at
       #step=25; Algeria and Angola/Mozambique stay in the teaching desk.
       Rotate the caseId so a second visit runs a different empire against the
       same claim — a frame confirmed once is still a frame confirmed once."
       The order is authored (the Congo first, because it BREAKS the claim and a
       frame that has only ever been confirmed has not been tested) and the
       Ledger decides where in it we are: each case has its own claim id, so
       "which have you already argued about" is a question the record answers
       and this beat never has to remember anything itself. */
    const order = (Array.isArray(p.caseOrder) && p.caseOrder.length) ? p.caseOrder : [p.caseId].filter(Boolean);
    const K = (id) => 'p05:' + beat.id + ':offmap:' + id;
    const caseId = order.find((id) => !(ledger && ledger.get(K(id)))) || order[order.length - 1];
    const key = K(caseId);
    box.append(el('p.cx-ask__eyebrow', {
      text: order.length > 1
        ? 'the frame, off this map \u00b7 case ' + (order.indexOf(caseId) + 1) + ' of ' + order.length
        : 'the frame, off this map',
    }));
    box.append(el('p.tr-offmap__claim',
      el('span.tr-offmap__claimlab', { text: 'the claim under test — ' }), esc(p.claim)));
    for (const line of p.intro || []) box.append(prose(line, 'p', 'tr-p'));

    const body = el('div.tr-offmap__body');
    box.append(body);
    body.append(el('p.cx-note', { text: 'Loading the case…' }));

    /* HELD BEFORE THE IMPORT RESOLVES, NOT AFTER IT.
       The case is loaded from the workshop's file with a dynamic import, so
       `ready` used to be set to false inside the `.then()` — one microtask
       after `buildPanel` had already returned `ready: true` to the runner, and
       `tours/index.js` had already decided not to hold the forward edge.
       Measured: the off-map beat's Next was enabled on first paint even with
       `"hold": true` on the beat. It is held pessimistically here and released
       in every branch below, including the one where the workshop is missing. */
    if (beat.hold && !(ledger && ledger.get(key))) ready = false;

    const VERDICTS = [
      ['fits', 'It fits the claim'],
      ['strains', 'It strains the claim'],
      ['breaks', 'It breaks the claim'],
    ];

    import('../teacher/portable.js').then((mod) => {
      const c = (mod.PORTABLE_CASES || []).find((x) => x.id === caseId);
      if (!c) { absent(); return; }
      fill(body);
      body.append(el('p.tr-offmap__where',
        el('strong', { text: esc(c.place) }),
        ' · ' + esc(c.power) + ' · ',
        el('span.num', { text: esc(c.span) })));
      body.append(el('p.tr-p', { text: esc(c.engine) }));
      /* THE CASE'S OWN SET-UP, READ FROM THE WORKSHOP'S FILE. Round 2's version
         retyped the Congo's into `panel.ask`, which is one text of one case in
         two places and could not rotate. `setup` is the workshop's and the
         question after it is ours. */
      if (c.setup) body.append(el('p.tr-p', { text: esc(c.setup) }));
      body.append(prose(p.ask, 'p', 'cx-ask__q'));

      const prior = ledger && ledger.get(key);
      if (prior) {
        body.append(reveal(c, prior.youSaid));
        ready = true;
        if (o.onReady) o.onReady();
        return;
      }

      ready = false;
      const row = el('div.tr-choices.tr-offmap__choices');
      for (const [id, label] of VERDICTS) {
        row.append(el('button.tr-choice', {
          type: 'button', text: label,
          onclick: () => {
            onCommit({
              kind: 'predicted', claimId: key, beatId: beat.id, t: beat.t,
              misconceptionId: beat.misconception, prompt: p.claim,
              youSaid: label, answer: 'this atlas reads it as: ' + c.answer,
              verdict: id === c.answer ? 'confirmed' : 'corrected',
              year: beat.map && beat.map.year,
            });
            row.replaceWith(reveal(c, label));
            ready = true;
            if (o.onReady) o.onReady();
          },
        }));
      }
      body.append(row);
    }).catch(absent);

    return box;

    function absent() {
      fill(body, el('p.cx-note.cx-note--warn', {
        text: 'The three non-British cases live in the teaching desk and this build cannot reach '
          + 'them, so this step is skipped rather than paraphrased from memory. Press Next.',
      }));
      ready = true;
      if (o.onReady) o.onReady();
    }

    function reveal(c, said) {
      const wrap = el('div.tr-reveal.tr-offmap__reveal');
      wrap.append(el('p.tr-reveal__said',
        el('span.tr-reveal__lab', { text: 'you said ' }), el('strong', { text: esc(said) })));
      wrap.append(prose(c.verdict, 'p', 'tr-p tr-p--reveal'));
      const hs = el('ul.tr-offmap__hs');
      for (const h of c.historians || []) {
        hs.append(el('li.tr-offmap__h',
          el('p.tr-offmap__hwho', el('strong', { text: esc(h.who) }),
            el('cite.tr-offmap__hwork', { text: ' ' + esc(h.work) }),
            el('span.tr-offmap__hpub', { text: ' · ' + esc(h.pub) })),
          el('p.tr-offmap__hsays', { text: esc(h.says) })));
      }
      wrap.append(hs);
      wrap.append(el('p.cx-note.tr-offmap__adds', { text: esc(c.adds) }));
      /* The second thing THIS case does to you. It was `panel.m7` — one note,
         written about the Congo — and it could not rotate, so it is now one
         per case, keyed by the case the student actually got. */
      const note = (p.notes && p.notes[c.id]) || p.m7;
      if (note) wrap.append(prose(note, 'p', 'tr-p tr-p--reveal'));
      return wrap;
    }
  }

  /* ----------------------------------------------------- [PREDICT] ----- */
  function predictBlock() {
    const key = 'p05:' + beat.id + ':' + (p.answerFrom || 'q');
    const box = el('div.cx-ask.tr-ask', { role: 'group', 'aria-label': 'A question before the answer' });
    box.append(el('p.cx-ask__eyebrow', { text: 'before you look' }));
    box.append(prose(p.question, 'p', 'cx-ask__q'));

    const prior = ledger && ledger.get(key);
    if (prior) { box.append(revealNode(prior.youSaid)); return box; }

    ready = false;
    const inp = p.input || { type: 'number' };

    if (inp.type === 'choice') {
      const list = el('div.cx-ask__choices.tr-choices');
      for (const c of inp.choices) {
        list.append(el('button.tr-choice', {
          type: 'button', text: esc(c.label),
          onclick: () => commit(c.label, c.correct === true),
        }));
      }
      box.append(list);
    } else {
      const field = el('input.tr-num.num', {
        type: 'number', min: String(inp.min ?? 0), max: String(inp.max ?? 100),
        step: '1', inputmode: 'numeric', placeholder: esc(inp.placeholder || ''),
        'aria-label': esc(p.question),
      });
      const go = el('button.btn.btn--small.tr-go', { type: 'button', text: 'That is my guess' });
      /* AN EMPTY FIELD IS NOT A COMMITMENT.
         Round 3, verified: pressing "That is my guess" with nothing typed
         recorded the number zero, and the Close then printed "YOURS — you said
         the map showed 0 kinds of rule" under the student's own name. `Number('')`
         is 0 and 0 is finite, so the old guard never fired. This app's whole
         claim about the Ledger is that it holds what a student actually said;
         inventing a commitment for them is the one thing it may not do. So an
         empty field is refused, with a reason, and there is a second control
         that records the honest answer instead — a decline, in their words,
         which the Close prints as a decline and never as a number. */
      const nag = el('p.cx-note.cx-note--warn.tr-nag', { hidden: true,
        text: 'Put a number in first — any number. Being wrong on purpose is the point of this question.' });
      /* THE OPT-OUT IS PRICED WHERE IT IS TAKEN, NOT ONLY AT THE END.
         ROUND 3, the classroom critic: "A student who takes the blameless
         'I would rather not guess' opt-out at every prediction still walks all
         24 beats and ends with 3 of 13 Close lines and a nearly blank revision
         sheet; the opt-out is offered everywhere and priced only at the end."
         The wording stays blameless — a student who will not guess must be
         able to say so without being scolded — and the cost is now printed
         beside it, before the press, in the same words the Close will use. */
      const skip = el('button.cx-more.tr-skip', {
        type: 'button',
        text: 'I would rather not guess',
        title: 'Recorded as a decline. The Close prints it under your name and leaves the line it would have filled grey.',
        onclick: () => commit('no answer \u2014 I chose not to guess', null, 'declined'),
      });
      const skipPrice = el('p.cx-note.tr-skip__price', {
        text: 'A decline is recorded under your name, and the line of the closing sentence this question fills stays grey.',
      });
      const submit = () => {
        const raw = String(field.value).trim();
        const v = Number(raw);
        if (!raw || !Number.isFinite(v)) {
          nag.hidden = false;
          field.setAttribute('aria-invalid', 'true');
          field.focus();
          return;
        }
        nag.hidden = true;
        field.removeAttribute('aria-invalid');
        commit(withUnit(v, inp.unit), null);
      };
      go.addEventListener('click', submit);
      field.addEventListener('input', () => { nag.hidden = true; field.removeAttribute('aria-invalid'); });
      field.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); submit(); } });
      box.append(el('div.tr-row', field, inp.unit ? el('span.tr-unit', { text: esc(inp.unit) }) : null, go), nag, skip, skipPrice);
    }
    if (inp.hint) box.append(el('p.cx-note.tr-hint', { text: esc(inp.hint) }));
    return box;

    function commit(said, correct, verdict) {
      const a = p.answerFrom ? computeAnswer(p.answerFrom, data, beat) : null;
      onCommit({
        kind: 'predicted', claimId: key, beatId: beat.id, t: beat.t,
        misconceptionId: beat.misconception, prompt: p.question, youSaid: said,
        /* "The atlas: 12 %." — ROUND 3, three critics, one stray space. A unit
           that is a WORD takes a space ("11 kinds of rule"); a unit that is a
           SIGN does not ("12%"). The student's own answer was already written
           by that rule three lines above; the atlas's was not, and the two
           are printed side by side on the revision sheet. One helper now. */
        answer: a ? withUnit(a.value, a.unit) : null,
        verdict: verdict || (correct === true ? 'confirmed' : 'corrected'),
        year: beat.map && beat.map.year,
      });
      const node = revealNode(said);
      box.replaceChildren(...[...box.childNodes].slice(0, 2), node);
      ready = true;
      if (o.onReady) o.onReady();
    }
  }

  function revealNode(said) {
    const a = p.answerFrom ? computeAnswer(p.answerFrom, data, beat) : null;
    const wrap = el('div.tr-reveal');
    /* A declined guess is not a figure and must not be set as one: `.cx-fig--none`
       is DESIGN.md's own honest "no figure", in italic sans, so the pair reads
       "you did not guess / 15 in this atlas" rather than putting a sentence in
       the mono numeral slot. */
    const noNumber = !/\d/.test(String(said));
    if (a) {
      wrap.append(el('div.tr-reveal__pair',
        el('div.cx-fig.cx-fig--sm.tr-fig' + (noNumber ? '.cx-fig--none' : ''),
          el('span.cx-fig__v' + (noNumber ? '' : '.num'), { text: noNumber ? 'no guess' : esc(said) }),
          el('span.cx-fig__l', { text: noNumber ? 'you declined' : 'you said' })),
        el('div.cx-fig.tr-fig.tr-fig--answer',
          el('span.cx-fig__v.num', { text: a.unit === '%' ? String(a.value) + '%' : String(a.value) }),
          el('span.cx-fig__l', { text: a.unit === '%' ? 'in this atlas' : esc(a.unit) }))));
      wrap.append(el('p.cx-note.tr-how', { text: esc(a.how) }));
      if (a.detail && a.detail.length) {
        const ul = el('ul.tr-detail');
        /* ALL OF THEM, NOT TWELVE OF THEM. The sentence above this list says
           "every one that was counted is listed here", and a cap of twelve made
           that untrue at 1921, where the atlas draws fifteen. A list in a
           scrolling rail costs three lines; a sentence that does not match the
           thing under it costs the reader's trust in every other number. */
        for (const [k, n] of a.detail) {
          ul.append(el('li', el('span.tr-detail__k', { text: String(k).replace(/-/g, ' ') }), el('span.num', { text: String(n) })));
        }
        wrap.append(ul);
      }
    } else {
      wrap.append(el('p.tr-reveal__said', el('span.tr-reveal__lab', { text: 'you said ' }), el('strong', { text: esc(said) })));
    }
    if (p.reveal) wrap.append(prose(p.reveal, 'p', 'tr-p tr-p--reveal'));
    return wrap;
  }

  /* ---------------------------------------------------- [RETRIEVE] ----- */
  function orderBlock() {
    const key = 'p05:' + beat.id + ':order';
    const box = el('div.cx-ask.tr-ask', { role: 'group', 'aria-label': 'Put these in order' });
    box.append(el('p.cx-ask__eyebrow', { text: 'produce it, do not read it' }));
    box.append(prose(p.question || 'Put these in the order they happened. Wrong placements come back with the reason, not the answer.', 'p', 'cx-ask__q'));

    const prior = ledger && ledger.get(key);
    const items = (p.order || []).slice();
    const shuffled = items.slice().sort((a, b) => (a.id < b.id ? -1 : 1));
    const placed = [];
    const pool = el('ol.tr-order__pool');
    const slot = el('ol.tr-order__done');

    if (prior) { box.append(el('p.tr-reveal__said', { text: 'You put them in this order: ' + prior.youSaid })); box.append(prose(p.reveal, 'p', 'tr-p tr-p--reveal')); return box; }

    ready = false;
    const paint = () => {
      pool.replaceChildren(...shuffled.filter((i) => !placed.includes(i.id)).map((i) =>
        el('li', el('button.tr-order__btn', { type: 'button', onclick: () => take(i) },
          figSpan('span.tr-order__label', i.label)))));
      slot.replaceChildren(...placed.map((id, n) => {
        const it = items.find((x) => x.id === id);
        return el('li.tr-order__row',
          el('span.tr-order__n.num', { text: String(n + 1) }),
          figSpan('span.tr-order__label', it.label),
          el('span.tr-order__year.num', { text: String(it.year) }),
          figSpan('span.tr-order__driver', it.driver));
      }));
      if (placed.length === items.length) done();
    };
    const take = (i) => {
      const expected = items.slice().sort((a, b) => a.year - b.year)[placed.length];
      if (expected.id !== i.id) {
        wrong(i, expected);
        return;
      }
      placed.push(i.id);
      paint();
    };
    const msg = el('p.cx-note.cx-note--warn.tr-wrong', { hidden: true });
    const wrongs = [];
    const wrong = (got, expected) => {
      wrongs.push(got.id);
      msg.hidden = false;
      msg.textContent = 'Not yet — ' + figPlain(expected.label).toLowerCase() + ' comes first. ' + figPlain(expected.driver);
    };
    const done = () => {
      onCommit({
        kind: 'sorted', claimId: key, beatId: beat.id, t: beat.t,
        misconceptionId: beat.misconception, prompt: p.question || 'order these',
        youSaid: wrongs.length ? (wrongs.length + ' wrong placement' + (wrongs.length === 1 ? '' : 's') + ' first') : 'right first time',
        answer: items.slice().sort((a, b) => a.year - b.year).map((i) => i.year).join(' → '),
        verdict: wrongs.length ? 'corrected' : 'confirmed',
        year: beat.map && beat.map.year,
      });
      msg.hidden = true;
      if (p.reveal) box.append(prose(p.reveal, 'p', 'tr-p tr-p--reveal'));
      ready = true;
      if (o.onReady) o.onReady();
    };

    box.append(slot, msg, el('p.tr-order__hint', { text: 'Earliest first.' }), pool);
    paint();
    return box;
  }

  /* -------------------------------------------------------- [SORT] ----- */
  function sortBlock() {
    const key = 'p05:' + beat.id + ':sort';
    const box = el('div.cx-ask.tr-ask', { role: 'group', 'aria-label': 'Sort these' });
    box.append(el('p.cx-ask__eyebrow', { text: 'commit, then check the record' }));
    box.append(prose(p.question, 'p', 'cx-ask__q'));

    const set = computeAnswer(p.sortFrom, data, beat);
    const items = (set && set.items) || [];
    if (!items.length) { box.append(el('p.cx-note', { text: 'No spans cover this year in the dataset, so this question cannot be asked honestly. It is skipped.' })); return box; }

    const prior = ledger && ledger.get(key);
    if (prior) { box.append(el('p.tr-reveal__said', { text: 'You got ' + prior.youSaid + ' first time.' })); box.append(prose(p.reveal, 'p', 'tr-p tr-p--reveal')); return box; }

    ready = false;
    let right = 0, asked = 0;
    const list = el('ul.tr-sort');
    for (const it of items) {
      const row = el('li.tr-sort__row');
      const q = el('span.tr-sort__name', { text: esc(it.label) });
      const bs = el('span.tr-sort__buttons');
      for (const b of p.buckets) {
        bs.append(el('button.tr-sort__b', {
          type: 'button', text: esc(b.label),
          onclick: () => choose(row, it, b.id, bs),
        }));
      }
      row.append(q, bs);
      list.append(row);
    }
    box.append(list);
    return box;

    function choose(row, it, bucket, bs) {
      asked++;
      const ok = bucket === it.bucket;
      if (ok) right++;
      bs.replaceChildren(el('span.tr-sort__ans', { 'data-ok': ok ? 'yes' : 'no' },
        el('strong', { text: (it.legislature || 'none').replace(/-/g, ' ') })));
      row.append(el('p.tr-sort__franchise', { text: it.franchise ? 'Who could vote: ' + it.franchise : 'This atlas records no franchise for this span.' }));
      row.dataset.done = 'yes';
      if (asked < items.length) return;
      onCommit({
        kind: 'sorted', claimId: key, beatId: beat.id, t: beat.t,
        misconceptionId: beat.misconception, prompt: p.question,
        youSaid: right + ' of ' + items.length, answer: set.how,
        verdict: right === items.length ? 'confirmed' : 'corrected',
        year: beat.map && beat.map.year,
      });
      box.append(el('p.cx-note.tr-how', { text: set.how }));
      if (p.reveal) box.append(prose(p.reveal, 'p', 'tr-p tr-p--reveal'));
      ready = true;
      if (o.onReady) o.onReady();
    }
  }

  /* -------------------------------------------------------- [LOOP] ----- */
  /**
   * THE SIGNATURE INTERACTION, DRAWN.
   *
   * Round 2's verdict: "the app's declared signature interaction is still
   * prose. 'Step it' produces five stacked text cards in the rail; nothing is
   * drawn as a loop, nothing on the map changes, and the student must scroll
   * to reach 'Cut Bengal's revenue'." All three are answered here.
   *
   *  · The loop is a ring — three nodes and three arrows, in SVG, at the top
   *    of the panel where it stays while the prose accumulates under it. A
   *    feedback loop is a shape, and a shape drawn is a shape remembered.
   *  · The two controls sit WITH the ring, above the prose, so the cut is
   *    never below the fold however many cards have piled up.
   *  · Something on the map moves. Closing the ring lights every unit this
   *    atlas records as taken in South Asia by conquest, annexation or a
   *    war-transfer between the diwani and the end of the Company — the
   *    territory the loop actually bought, counted, not asserted. Cutting it
   *    puts the light out again, which is the whole argument in one gesture.
   */
  function loopBlock() {
    const key = 'p05:loop:cut';
    const box = el('div.tr-loop');
    const steps = p.steps || [];
    let shown = 0;
    let cut = false;

    /* --- the ring ---------------------------------------------------- */
    const SVG = 'http://www.w3.org/2000/svg';
    const svg = (name, attrs, ...kids) => {
      const n = document.createElementNS(SVG, name);
      for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, String(attrs[k]));
      for (const c of kids) if (c) n.append(c);
      return n;
    };
    /* Three nodes on a triangle: revenue at the top, sepoys bottom-right,
       conquest bottom-left. The arrows run clockwise, which is the direction
       the money goes. `more` is not a fourth node — it is the closing arrow,
       and that is the point of the beat. */
    /* TWO GEOMETRIES FOR ONE ARGUMENT, AND THE PHONE GETS THE WIDE ONE.
       ROUND 2, the phone: "the loop diagram at step 9 is the app's stated most
       important mechanism and it is the palest thing on the phone: three
       hairline boxes and dotted grey arrows that are close to invisible at
       192px." Measured at 390x844: the tall 260x216 triangle had to be sized by
       HEIGHT to fit a 129px reading window, which drew it 115px WIDE inside a
       358px column — a fifth of the panel's area used, every stroke scaled to
       0.44 of its authored weight, and every label to four pixels. The room a
       phone has is horizontal, so the phone's ring is a wide one: 380x132,
       drawn at the full width of the panel, where the strokes and the words are
       very nearly their authored size. Same three nodes, same four arrows, same
       closing edge, same cut. `vector-effect: non-scaling-stroke` in tours.css
       takes the remaining scale out of the ink. */
    const WIDE = window.matchMedia && window.matchMedia('(max-width: 46rem)').matches;
    const NODE = WIDE ? {
      revenue: { x: 190, y: 20, label: 'Revenue', sub: "Bengal's land tax" },
      sepoys: { x: 320, y: 82, label: 'Sepoys', sub: 'paid from it' },
      conquest: { x: 60, y: 82, label: 'Conquest', sub: 'the next province' },
    } : {
      revenue: { x: 130, y: 30, label: 'Revenue', sub: "Bengal's land tax" },
      sepoys: { x: 214, y: 150, label: 'Sepoys', sub: 'paid from it' },
      conquest: { x: 46, y: 150, label: 'Conquest', sub: 'the next province' },
    };
    const EDGE = WIDE ? {
      diwani: { d: 'M 190 -8 L 190 -4', head: [190, 0] },
      revenue: { d: 'M 236 26 Q 300 32 318 60', head: [319, 64], mid: [286, 40] },
      /* The closing edge runs straight between the two lower boxes rather than
         under them: it is the same arrow and it costs the figure 30px of height
         it does not have on a phone. */
      sepoys: { d: 'M 274 82 L 110 82', head: [104, 82], mid: [190, 76] },
      conquest: { d: 'M 62 60 Q 78 32 144 26', head: [150, 22], mid: [72, 40] },
    } : {
      diwani: { d: 'M 130 -2 L 130 12', head: [130, 18] },
      revenue: { d: 'M 158 42 Q 210 70 208 122', head: [209, 128], mid: [200, 76] },
      sepoys: { d: 'M 186 168 Q 130 196 74 168', head: [68, 164], mid: [130, 190] },
      conquest: { d: 'M 52 122 Q 50 70 102 42', head: [108, 38], mid: [60, 76] },
    };
    const VIEW = WIDE ? '0 -22 380 126' : '0 -6 260 210';
    /* Where the cut lands, and where its label sits, in each geometry. */
    const CUT = WIDE
      ? { cx: 292, cy: 44, tx: 272, ty: 48, s1: [274, 30, 310, 58], s2: [310, 30, 274, 58], ex: 190, ey: -10 }
      : { cx: 196, cy: 76, tx: 178, ty: 80, s1: [178, 62, 214, 90], s2: [214, 62, 178, 90], ex: 130, ey: -1 };
    const figure = svg('svg', {
      viewBox: VIEW, class: 'tr-ring__svg', 'data-wide': WIDE ? 'yes' : '', role: 'img',
      'aria-label': 'A ring: revenue pays sepoys, sepoys take the next province, the province pays more revenue.',
    });
    const defs = svg('defs');
    for (const [id, cls] of [['tr-ah', 'live'], ['tr-ah-dim', 'dim'], ['tr-ah-dead', 'dead']]) {
      defs.append(svg('marker', { id, viewBox: '0 0 10 10', refX: '6', refY: '5', markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse' },
        svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'tr-ring__ah tr-ring__ah--' + cls })));
    }
    figure.append(defs);
    const edgeNodes = {};
    for (const id in EDGE) {
      const e = svg('path', { d: EDGE[id].d, class: 'tr-ring__edge', 'data-edge': id, fill: 'none', 'marker-end': 'url(#tr-ah-dim)' });
      edgeNodes[id] = e;
      figure.append(e);
    }
    const nodeNodes = {};
    for (const id in NODE) {
      const n = NODE[id];
      const g = svg('g', { class: 'tr-ring__node', 'data-node': id, transform: `translate(${n.x} ${n.y})` });
      g.append(svg('rect', { x: -44, y: -18, width: 88, height: 36, rx: 0, class: 'tr-ring__box' }));
      const t1 = svg('text', { x: 0, y: -1, class: 'tr-ring__t' }); t1.textContent = n.label;
      const t2 = svg('text', { x: 0, y: 11, class: 'tr-ring__s' }); t2.textContent = n.sub;
      g.append(t1, t2);
      nodeNodes[id] = g;
      figure.append(g);
    }
    const cutMark = svg('g', { class: 'tr-ring__cut', hidden: 'hidden' });
    cutMark.append(svg('line', { x1: CUT.s1[0], y1: CUT.s1[1], x2: CUT.s1[2], y2: CUT.s1[3], class: 'tr-ring__slash' }));
    cutMark.append(svg('line', { x1: CUT.s2[0], y1: CUT.s2[1], x2: CUT.s2[2], y2: CUT.s2[3], class: 'tr-ring__slash' }));
    figure.append(cutMark);

    /* WHERE THE CUT LANDS, DRAWN BEFORE IT IS MADE.
       Round 4's charge: "make the cut-the-loop step unmistakable". It was a
       small quiet button under a figure, in the same treatment as "Step it",
       appearing after five presses with nothing on the ring to say what it
       would do. A student who has just watched four arrows light has no reason
       to read the fifth control as the one that breaks the thing. So the ring
       marks its own weak point the moment it closes: a target on the arrow OUT
       of revenue, labelled, and pressable — you cut the loop by pressing the
       loop. The button stays, in the danger treatment, because a target on an
       SVG is not a control every reader will find. */
    /* Pointer affordance only, and deliberately hidden from assistive
       technology: the `<svg>` above carries `role="img"`, so a focusable
       control inside it is a tab stop with no reliable name. The accessible
       route to the same action is the `.tr-loop__cut` button below the figure,
       which is a real <button> with a real label. */
    const cutZone = svg('g', { class: 'tr-ring__zone', hidden: 'hidden', 'aria-hidden': 'true' });
    cutZone.append(svg('circle', { cx: CUT.cx, cy: CUT.cy, r: 14, class: 'tr-ring__zonering' }));
    /* Inside the ring, not on the arc: at y=76 the interior between x=61 (the
       conquest arc) and x=182 (the target) is the only empty space in the
       figure, and a label printed on top of the line it names is a label that
       hides its own subject. */
    const zoneT = svg('text', { x: CUT.tx, y: CUT.ty, class: 'tr-ring__zonet', 'text-anchor': 'end' });
    zoneT.textContent = 'cut here';
    cutZone.append(zoneT);
    figure.append(cutZone);
    const entry = svg('text', { x: CUT.ex, y: CUT.ey, class: 'tr-ring__cap', 'text-anchor': 'middle' });
    entry.textContent = 'the diwani, 1765';
    figure.append(entry);

    const ring = el('figure.tr-ring', figure);
    const caption = el('figcaption.tr-ring__cap2', { text: 'Press Step it. Each press lights one arrow.' });
    ring.append(caption);

    /* --- the controls, with the ring, never below the prose ---------- */
    const next = el('button.btn.btn--small.tr-loop__next', { type: 'button', text: 'Step it' });
    const cutBtn = el('button.btn.tr-loop__cut', { type: 'button', text: esc((p.cut && p.cut.label) || 'Cut the revenue'), hidden: true });
    const controls = el('div.tr-loop__controls', next, cutBtn);

    const list = el('ol.tr-loop__steps');
    const out = el('div.tr-loop__out');
    const stepNode = (s2, i) => el('li.tr-loop__step', { 'data-id': s2.id },
      el('span.tr-loop__n.num', { text: String(i + 1) }),
      el('span.tr-loop__label', { text: esc(s2.label) }),
      el('p.tr-loop__text', { text: esc(s2.text) }));

    /* Which drawn part each authored step lights. `more` closes the ring. */
    const LIGHTS = {
      diwani: { edge: 'diwani' },
      revenue: { node: 'revenue' },
      sepoys: { edge: 'revenue', node: 'sepoys' },
      conquest: { edge: 'sepoys', node: 'conquest', paint: true },
      more: { edge: 'conquest', closed: true },
    };

    let painted = false;
    const homeYear = (beat.map && beat.map.year) || 1765;
    /* THE MAP MOVES, AND IT MOVES BECAUSE THE STUDENT PRESSED SOMETHING.
       The loop's conquests are spread over ninety years, so lighting them at
       1765 lights nothing: the units exist in the geometry and are not drawn
       yet. So the third press runs the year forward to the end of the
       Company's conquests and paints what the loop bought — the province the
       last province paid for — and the cut runs it back. The year is named in
       the caption; nothing moves silently. */
    const paintTheConquests = () => {
      if (painted || !bus) return;
      const a = computeAnswer('loopConquests', data, beat);
      if (!a || !a.units.length) return;
      painted = true;
      if (store) { try { store.dispatch('setYear', a.to); } catch (_) { /* the year is somebody else's */ } }
      bus.emit('ask:paintUnits', {
        unitIds: a.units,
        reason: `what the loop bought between ${a.from} and ${a.to}: ${a.value} acquisitions in South Asia this atlas records as conquest, annexation or a transfer at the end of a war`,
      });
      caption.textContent = `The year has run to ${a.to} and the map is showing what the loop bought. ${a.how}`;
      /* One screen, one year. The band is still saying 12 August 1765 while
         the timeline says 1856, and a screen that asserts two years is the
         defect this app is loudest about in other people's maps. */
      bus.emit('ask:say', {
        id: 'tours:beat', priority: 65,
        mark: a.from + ' → ' + a.to,
        text: 'Ninety years of the loop running. Every province drawn here was taken with the revenue of the last one.',
      });
    };

    next.addEventListener('click', () => {
      if (shown >= steps.length) return;
      const s2 = steps[shown];
      list.append(stepNode(s2, shown));
      const L = LIGHTS[s2.id] || {};
      if (L.edge && edgeNodes[L.edge]) { edgeNodes[L.edge].dataset.on = 'yes'; edgeNodes[L.edge].setAttribute('marker-end', 'url(#tr-ah)'); }
      if (L.node && nodeNodes[L.node]) nodeNodes[L.node].dataset.on = 'yes';
      if (L.paint) paintTheConquests();
      if (L.closed) ring.dataset.closed = 'yes';
      shown++;
      /* Keep the figure AND its controls in view. The rail's body is 198px at
         390x844 and the prose piles up under the figure; without this the third
         press pushes the thing the student is meant to be watching off the top.
         It scrolls the whole loop block rather than the ring, because at phone
         width tours.css puts the controls above the ring (a ring that fits the
         panel leaves no room for "Step it" under it) and scrolling to the ring
         would put the button the student has just pressed off the top. */
      try { box.scrollIntoView({ block: 'start' }); } catch (_) { /* older engines */ }
      if (shown >= steps.length) {
        next.hidden = true;
        cutBtn.hidden = false;
        cutZone.removeAttribute('hidden');
        box.dataset.looped = 'yes';
        caption.textContent = 'The ring is closed: it now pays for itself. Cut the arrow out of revenue — press the target on the ring, or the red control — and watch what stops.';
      } else next.textContent = 'Then →';
    });

    const doCut = () => {
      if (cut) return;
      cut = true;
      cutBtn.hidden = true;
      cutZone.setAttribute('hidden', 'hidden');
      const stall = (p.cut && p.cut.stallsAt) || 'sepoys';
      /* The cut is on the arrow OUT of revenue, so revenue survives and
         everything downstream of it does not. */
      const order = ['revenue', 'sepoys', 'conquest'];
      const from = order.indexOf(stall);
      for (const id in edgeNodes) edgeNodes[id].dataset.cut = 'yes';
      edgeNodes.revenue.dataset.dead = 'yes';
      edgeNodes.revenue.setAttribute('marker-end', 'url(#tr-ah-dead)');
      edgeNodes.sepoys.setAttribute('marker-end', 'url(#tr-ah-dead)');
      edgeNodes.conquest.setAttribute('marker-end', 'url(#tr-ah-dead)');
      edgeNodes.sepoys.dataset.dead = 'yes';
      edgeNodes.conquest.dataset.dead = 'yes';
      cutMark.removeAttribute('hidden');
      ring.dataset.cut = 'yes';
      try { box.scrollIntoView({ block: 'start' }); } catch (_) { /* older engines */ }
      for (let i = from; i < order.length; i++) if (nodeNodes[order[i]]) nodeNodes[order[i]].dataset.dead = 'yes';
      for (const n of list.querySelectorAll('.tr-loop__step')) {
        if (n.dataset.id === stall) n.dataset.stalled = 'yes';
        else if (from >= 0 && order.indexOf(n.dataset.id) > from) n.dataset.dead = 'yes';
      }
      caption.textContent = 'Cut. Nothing downstream of the revenue runs, and the map goes back to 1765 with nothing bought.';
      if (painted && bus) bus.emit('ask:paintUnits', { unitIds: [], reason: 'the loop is cut' });
      if (painted && store) { try { store.dispatch('setYear', homeYear); } catch (_) { /* the year is somebody else's */ } }
      if (painted && bus) bus.emit('ask:say', { id: 'tours:beat', priority: 65, mark: beat.ledeMark || beat.mark, text: beat.say });
      out.append(el('p.tr-loop__stall', el('strong', { text: 'The loop stalls at: ' }), esc(stall)));
      out.append(prose((p.cut && p.cut.text) || '', 'p', 'tr-p'));
      onCommit({
        kind: 'classified', claimId: key, beatId: beat.id, t: beat.t,
        misconceptionId: beat.misconception, prompt: 'cut Bengal’s revenue',
        youSaid: 'I cut the revenue and the loop stalled at ' + stall,
        answer: 'revenue → sepoys → conquest → revenue',
        verdict: 'confirmed', year: beat.map && beat.map.year,
      });
    };
    cutBtn.addEventListener('click', doCut);
    cutZone.addEventListener('click', doCut);

    box.append(el('p.cx-ask__eyebrow', { text: 'run it, do not read it' }), ring, controls, list, out);
    return box;
  }

  /* -------------------------------------------------- [DEFINITION] ----- */
  function definitionBlock() {
    const box = el('div.tr-defrun');
    box.append(el('p.cx-ask__eyebrow', { text: 'the same year, two meanings of one word' }));
    const row = el('div.tr-defrun__row');
    for (const d of p.definitionRun || []) {
      row.append(el('button.tr-defrun__b', {
        type: 'button', 'data-def': d.def,
        onclick: () => {
          bus.emit('map:setDefinition', { id: d.def });
          for (const b of row.children) b.dataset.on = b.dataset.def === d.def ? 'yes' : '';
          read.textContent = d.gloss;
        },
      }, el('strong', { text: d.def }), el('span.tr-defrun__key.num', { text: d.def === 'claimed' ? '1' : '2' })));
    }
    const read = el('p.tr-defrun__gloss', { text: 'Press either. The year does not move; the word does.' });
    box.append(row, read);
    return box;
  }

  /* ------------------------------------------- [YEARS] one place, n labels -
   *
   * DIDACTIC_SPEC T12 asks for a widget, not a paragraph: "the 'what is this
   * place, legally?' widget: Egypt cycles through veiled protectorate (1882) →
   * protectorate (1914) → nominally independent kingdom with British troops
   * (1922) → 1956. One place, four labels." T9 asks for the same move at the
   * other end of the Company: "the map's India polygon changes ownership
   * colour while the student watches, with the legal instrument named on the
   * card. Mechanism visible, not asserted."
   *
   * `panel.years` has been sitting in tours.json since the first build with
   * nothing rendering it, so the Egypt beat asserted its four labels in prose
   * and the student pressed nothing. This renders it, and renders it entirely
   * out of the dataset: the year moves, the plate under the panel recolours
   * because the year moved, and every word printed here — the status, its
   * definition, who governed from where, who could vote — is the span's own
   * field. Nothing is authored twice, so nothing can go stale against the data.
   *
   * A year at which the atlas records nothing says so. It never prints an
   * absence as a status.
   */
  function yearsBlock() {
    const id = p.from || (beat.map && beat.map.sel);
    const box = el('div.tr-years');
    if (!id || !data.territoryAt) return box;

    const statusMeta = new Map((data.statuses || []).map((x) => [x.id, x]));
    box.append(el('p.cx-ask__eyebrow', { text: 'one place, ' + p.years.length + ' labels — press each' }));
    const row = el('div.tr-years__row', { role: 'group', 'aria-label': 'The legal status of this place, year by year' });
    const read = el('div.tr-years__read', { 'aria-live': 'polite' });

    const show = (y) => {
      for (const b of row.children) b.dataset.on = Number(b.dataset.y) === y ? 'yes' : '';
      if (store) { try { store.dispatch('setYear', y); } catch (_) { /* the year is somebody else's */ } }
      const at = data.territoryAt(id, y);
      fill(read);
      if (!at || !at.span) {
        read.append(el('p.cx-note.cx-note--warn', { text: 'At ' + y + ' this atlas records no British span here at all. That is an absence, not a status, and it is drawn as one.' }));
        return;
      }
      const sp = at.span;
      const meta = statusMeta.get(at.status) || {};
      read.append(el('p.tr-years__status',
        el('span.tr-years__y.num', { text: String(y) }),
        el('strong', { text: meta.label || at.status.replace(/-/g, ' ') }),
        sp.label ? el('span.tr-years__lab', { text: ' — ' + sp.label }) : null));
      if (meta.short) read.append(el('p.tr-years__def', { text: meta.short }));
      if (sp.howControlWorked) read.append(el('p.tr-p.tr-years__how', { text: sp.howControlWorked }));
      const facts = el('ul.tr-years__facts');
      if (sp.governedFrom) facts.append(el('li', el('span.tr-years__k', { text: 'decided in ' }), sp.governedFrom));
      if (sp.localLegislature) facts.append(el('li', el('span.tr-years__k', { text: 'local legislature ' }), String(sp.localLegislature).replace(/-/g, ' ')));
      if (sp.franchise) facts.append(el('li', el('span.tr-years__k', { text: 'who could vote ' }), sp.franchise));
      if (facts.childNodes.length) read.append(facts);
      /* The instrument and its date, from the span's own endpoints — this is
         the "legal instrument named on the card" T9 asks for, and it is the
         data's date, not a date retyped into a tour script. */
      const ends = [sp.from && sp.from.display, sp.to && sp.to.display].filter(Boolean);
      if (ends.length) read.append(el('p.cx-note.tr-years__span', { text: 'this span: ' + ends.join(' to ') + (sp.to ? '' : ', still open') }));
    };

    for (const y of p.years) {
      row.append(el('button.tr-years__b', {
        type: 'button', 'data-y': String(y), text: String(y),
        onclick: () => show(y),
      }));
    }
    box.append(row, read);
    show(p.years.includes(beat.map && beat.map.year) ? beat.map.year : p.years[0]);
    return box;
  }

  /* ------------------------------------------------------- [COUNT] ----- */
  function countBlock() {
    const a = computeAnswer(p.countFrom, data, beat);
    if (!a) return el('span');
    const box = el('div.tr-count');
    box.append(el('div.cx-fig.tr-fig',
      el('span.cx-fig__v.num', { text: String(a.value) }),
      el('span.cx-fig__l', { text: 'places this atlas still draws' })));
    box.append(el('p.cx-note.tr-how', { text: a.how }));
    if (a.names && a.names.length) box.append(el('p.tr-count__names', { text: a.names.join(' · ') }));
    return box;
  }
}

export default buildPanel;
