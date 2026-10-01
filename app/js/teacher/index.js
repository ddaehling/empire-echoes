/**
 * teacher/index.js — P20. The teaching desk: transfer, audit, and the classroom.
 *
 * WHY THIS PIECE EXISTS. Four rounds against an 18,000-word coursebook chapter
 * and the same sentence every time: "There is no path. The app hands a student
 * a world map and leaves them to click." The largest single gap in the rubric
 * was C8, transfer and historical thinking — 3 against the chapter's 5 —
 * and the critic said exactly why: "the chapter teaches four portable moves by
 * name and models them; the app teaches none by name and has no exam apparatus
 * at all."
 *
 * So this piece names the moves. Four of them, each with a weak answer and a
 * strong answer to the SAME question, the difference stated in words, and then
 * the student's own attempt on a real text from this atlas's corpus, checked
 * against a model and a mark scheme. Then the apparatus a department needs:
 * the Evidence Ledger over all 898 figures in the dataset, the printable pack,
 * frozen deep links, practice questions with mark schemes, and a Methods panel
 * that states in our own words the two charges we concede to print.
 *
 * WHERE IT LIVES — AND WHY IT MOVED. One labelled control in `chrome-end` and
 * nothing else. A student who never presses it never sees any of this;
 * FEATURE_SPEC P20 acceptance test 6 is the reason.
 *
 * Round three: "the Teaching desk is a full-screen takeover that drops the map,
 * against DIDACTIC §8.1's constant-spatial-frame rule". That is correct and it
 * was the wrong reading of the law on our side. `.app__overlay` is exempt from
 * LAYOUT_BUDGET B5 — that is a rule about *pixels standing on the plate* — but
 * FEATURE_SPEC §2 rule 1 is unconditional and names this piece's own surface in
 * so many words: "No full-screen content modal exists in this app. Plates,
 * matrices, ledgers and parallel texts compress the map; they do not cover it."
 * A ledger is on that list. We were the exception nobody granted.
 *
 * So the desk is now the rail sheet (`ask:sheet`), the same column the
 * mechanism matrix, the historiography drawer and our own move cards already
 * use — LAYOUT_BUDGET §3 level 3, guaranteed at least 280px and its own scroll,
 * a side column above 62rem and a bottom sheet below it, and the map, the year,
 * the spine band and the transport all still live beside it. Nothing here ever
 * touches the year, the selection, the layer or the view; closing it (Escape,
 * the sheet's own close, or the control) leaves the map exactly as it was.
 *
 * The consequence for the Evidence Ledger is real and it is in `evidence.js`:
 * an eleven-column table does not belong in a 400px column, so every figure is
 * now a record rather than a row, and the sort that was eleven table headers is
 * a named control over the same eleven keys. Nothing was dropped from a row.
 *
 * URL. Every surface is a frozen deep link, documented in the Classroom, and
 * the four keys are unchanged by the move into the rail:
 *   #panel=workshop   the four moves
 *   #panel=evidence   the Evidence Ledger
 *   #panel=classroom  lesson framing, links, questions, printables
 *   #panel=methods    how this was made and what it does not know
 *
 * AT THE CLOSE. Round three also said the Classroom's printables were "two
 * clicks past the Close". DIDACTIC §8 puts the printed sheet at minute 29, so
 * the pack is offered *in* the Close: `close:opened` appends one quiet block to
 * the sheet the Close is already occupying, with three sheets that print
 * without leaving it and one link into the Classroom for the rest. P21 owns the
 * Close and this file does not edit it — the block is our own node, appended
 * after theirs, removed when the sheet changes.
 *
 * ON THE PATH. One more thing lives outside the desk, and it is the answer to
 * the transfer criterion: `path.js` offers each of the four moves at the beat
 * where the beat is already making the student do it, through the tour's own
 * published `tours:aux` extension point, into the rail sheet. A student who
 * never opens the desk still meets all four. See the header of that file.
 *
 * EVENTS EMITTED   teacher:open {panel} · teacher:close · teacher:print {pack}
 *                  teacher:move {n, id} · tours:aux · ask:sheet
 * EVENTS HEARD     tours:beat · chrome:sheet · teacher:moveOpen (our own)
 *
 * FILES OWNED  app/js/teacher/*, app/css/teacher.css, tools/evidence-audit.js
 */

import { el, fill, disposer, announce, storage } from '../core/util.js';
import { buildFigures, defaultSort, contentVersion, ledgerStats } from './figures.js';
import { renderWorkshop } from './workshop.js';
import { renderLedger } from './evidence.js';
import { renderClassroom } from './classroom.js';
import { renderSmall, fits } from './small.js';
import { renderMethods } from './methods.js';
import { printPack } from './print.js';
import { mountPath, moveDone } from './path.js';
import { setBeatAnswers, derivedAudit } from './pack.js';

/**
 * THE DRIFT CHECK, ON THE HANDLE.
 *
 * `pack.js::beatAnswers` derives an answer line for a beat the guided path has
 * not published one for, because a pack is printed for a lesson the reader may
 * not be running. That derivation restates four lines of
 * `tours/index.js::_answerKey`, so it is held against the published rows for
 * every beat the tour DOES publish and the result is put where a scenario can
 * read it: `tools/scenarios/p20-accept.js` fails the build on a non-empty
 * array. Written on both payloads, because `main.js` replaces `window.BEA`
 * after `app:ready`.
 */
function publishAnswerAudit() {
  const put = () => {
    try {
      if (typeof window === 'undefined') return;
      (window.BEA || (window.BEA = {})).teacherAnswerDrift = derivedAudit();
    } catch (_) { /* no handle, no matter */ }
  };
  /* Twice, and for the reason `tours/index.js` writes its own handles twice:
     `main.js` emits `app:ready` and then ASSIGNS a fresh `window.BEA` on the
     next line, so anything written from inside an `app:ready` handler is
     discarded. The second write lands on the following task. */
  put();
  setTimeout(put, 0);
  /* AND ONCE THE AUTHORED BEATS ARE ACTUALLY IN. `steps.js` fetches
     `tours.json`; until it resolves there is nothing to hold the published key
     against, and `derivedAudit()` says so by answering null. */
  try { loadSteps().then(put, () => {}); } catch (_) { /* nothing to wait for */ }
}
import { loadSteps, setRouteFacts, setActiveRoute } from './steps.js';
import { loadTiming, invalidate as invalidateTiming } from './timing.js';

const PANELS = [
  { id: 'workshop', label: 'Workshop', title: 'The four moves', sub: 'Four moves, named and modelled' },
  { id: 'evidence', label: 'Evidence', title: 'The Evidence Ledger', sub: 'Every figure in the atlas, weakest first' },
  /* NOT "TUESDAY, FIRST PERIOD" ANY MORE. DIDACTIC_SPEC §8, amended wave 9:
     the empire is a two-lesson unit, and §8.5 makes it a law that a surface
     naming a route says which lesson it is. One period in the title said there
     was one lesson. Which lesson this page is about is chosen inside it, and
     the head names the unit. */
  { id: 'classroom', label: 'Classroom', title: 'The two-lesson unit', sub: 'Board, plan, sheets and key, one lesson at a time' },
  { id: 'methods', label: 'Methods', title: 'How this was made', sub: 'How this was made, and what it cannot do' },
];

/* The desk's own sheet id. `path.js` opens `teacher:move:N` in the same column
   and must not be mistaken for this one, so the test is equality, never a
   prefix. */
const SHEET_ID = 'teacher:desk';
const IDS = new Set(PANELS.map(p => p.id));

/**
 * The transcribed primary texts. They belong to the dossier, whose own file
 * says it publishes them on `window.BEA.testimony` precisely so that "the
 * evidence ledger, the audit tool and a hostile critic can all read the same
 * table". We take the published object first; if the dossier is not mounted we
 * import the module directly; if neither works the workshop says so in words
 * rather than breaking. A missing corpus must never take this piece down.
 */
async function loadTestimony() {
  const pub = typeof window !== 'undefined' && window.BEA && window.BEA.testimony;
  if (pub && Array.isArray(pub.texts) && pub.texts.length) return pub.texts;
  try {
    const mod = await import('../panels/dossier/testimony.js');
    if (mod && Array.isArray(mod.TESTIMONY)) return mod.TESTIMONY;
  } catch (_) { /* the dossier piece is absent; carry on without it */ }
  return [];
}

/**
 * The four definitions of "British". The map owns them and writes the sentence
 * that describes each one; the printed map sheet has to say which of the four
 * it was drawn under, and it must say it in the map's words rather than in a
 * second set of words that could drift. If the map piece is absent the sheet
 * says nothing about the threshold rather than guessing at one.
 */
async function loadDefinitions() {
  try {
    const mod = await import('../map/definition.js');
    if (mod && Array.isArray(mod.DEFINITIONS)) {
      return { list: mod.DEFINITIONS, fallback: mod.DEFAULT_DEFINITION || null };
    }
  } catch (_) { /* no map module */ }
  return null;
}

const ALIASES = { teacher: 'workshop', ledger: 'evidence', teach: 'workshop', print: 'classroom' };

export default {
  id: 'teacher',
  slot: 'chrome-end',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    this.open = null;
    this.rendered = new Map();
    /* WHERE THE READER WAS. The ledger's own links leave the desk — they set the
       year and open the territory, and the dossier needs the column — so an
       auditor checking forty numbers goes out and comes back forty times. The
       entry reopens on the section they left, and the column comes back at the
       scroll offset they left it at, because the alternative is finding row 300
       again by hand. */
    this.lastPanel = null;
    this.scrollAt = new Map();
    this.corpus = null;
    this.loading = null;

    await ctx.util.loadCss(new URL('../../css/teacher.css', import.meta.url));

    /* --- the one entry a student ever sees ---------------------------- */
    /* ONE control in chrome-end, always, at every width (FEATURE_SPEC P20
       acceptance test 6). Below 62rem it does a second job: the tour hides its
       own auxiliary slot when the transport docks over the plate, so this is
       where a standing move is offered. The label always says which job it is
       doing, so there is never a control whose behaviour you have to guess. */
    this.armed = null;
    this.entry = el('button.tp-entry', {
      type: 'button',
      'aria-expanded': 'false',
      onclick: () => {
        if (this.armed) { ctx.bus.emit('teacher:moveOpen', { n: this.armed.n }); return; }
        this._go(this.open ? null : (this.lastPanel || 'workshop'));
      },
    });
    this._label(null);
    fill(ctx.root, this.entry);

    /* --- routing ------------------------------------------------------ */
    const want = (s) => {
      const raw = (s.panelState && s.panelState.overlay) || null;
      const id = raw ? (ALIASES[raw] || raw) : null;
      return id && IDS.has(id) ? id : null;
    };
    this.d(ctx.store.watch(want, (id) => this._sync(id)));

    /* THE COLUMN IS SHARED AND IT IS SINGLE. The shell arbitrates one rail
       sheet at a time, and it already closes ours on Escape, on its own close
       control, and whenever another piece asks for the column. All we have to
       do is keep the address honest: if the sheet showing is not ours, then
       `#panel=` is naming a surface that is not on screen. */
    this.mine = false;
    this.prevSheet = null;
    this.displaced = null;
    this.d(ctx.bus.on('chrome:sheet', (p) => {
      const id = p && p.open ? String(p.id || '') : null;
      const wasOurs = this.mine;
      this.mine = id === SHEET_ID;
      /* Our own open and our own close are announced back to us; neither is
         somebody else taking the column, and neither is the surface we
         displaced. */
      if (this._presenting) return;
      /* THE SHELL CLOSED US. Escape and the sheet's own × go through
         `chrome/_closeSheet` and never through this module, so the put-back has
         to hang off the event rather than off our own close path — measured:
         pressing Escape at a Complication Gate closed the desk and left the
         reader with no gate and a disabled Next. */
      if (wasOurs && id === null) this._restore(true);
      else if (!this.mine) this.displaced = null;
      this.prevSheet = id;
      if (!this.mine && this.open) this._go(null);
    }));

    /* --- the pack, at the Close --------------------------------------- */
    this.d(ctx.bus.on('close:opened', () => this._atClose()));

    /* THE GUIDED PATH'S OWN ANSWER LINES, TAKEN OFF THE BUS.
       `tours/index.js` authors one expected answer and one common-wrong answer
       per beat in `tours.json` and publishes them "so the teaching desk's
       printed plan can carry it". It also writes them to
       `window.BEA.toursAnswerKey` — and that handle is destroyed a few lines
       later, because `main.js` ASSIGNS a fresh `window.BEA` object after it
       emits `app:ready` rather than merging into the one modules have been
       writing to. Measured: the key is not on the handle at any point in the
       session. The event is the surviving channel, tours re-emits it on
       `app:ready`, and this subscription is in place before that. Without it
       the printed lesson plan carries an empty answer column, which is the
       whole of the charge this pack answers. */
    this.d(ctx.bus.on('tours:ready', (p) => {
      setBeatAnswers(p && p.answerKey);
      setRouteFacts(p);
      publishAnswerAudit();
      /* THE CLOCK IS PART OF THE PAYLOAD. `timing.js` costs every step of a
         route and checks its total against the one this payload carries, so a
         fresh payload invalidates a cached clock — otherwise a sheet printed
         after a route change would carry the previous line-up's minutes. */
      invalidateTiming();
    }));

    /* THE PAGE NUMBER. `tours:ready` and `tours:routes` both carry the required
       step count of every route the guided path knows, computed by the same
       `_flatten` this desk mirrors in `steps.js`. Handing both payloads over is
       what lets that mirror be CHECKED rather than trusted, and an unchecked
       route prints no step numbers at all. The two files it reads are fetched
       once, here, so that a print — which is synchronous — never waits. */
    this.d(ctx.bus.on('tours:routes', (p) => { setRouteFacts(p); invalidateTiming(); publishAnswerAudit(); }));
    /* And the route a reader SWITCHED to. `tours/_pickRoute` dispatches
       `startTour` and re-announces nothing, so the store is the only place the
       change shows; without this the step index would keep answering for the
       route the lesson opened on. */
    this.d(ctx.store.watch((s) => s.activeTour, (id) => setActiveRoute(id), { immediate: true }));
    /* AND WHETHER THERE IS ROOM FOR ANY OF IT. A tablet turned landscape gets
       the desk back with no reload, and a laptop window dragged narrow loses it
       the same way; `_fit()` re-measures rather than remembering a decision. */
    {
      const onResize = () => { if (this.open) this._fit(); };
      window.addEventListener('resize', onResize, { passive: true });
      this.d(() => window.removeEventListener('resize', onResize));
    }
    loadSteps();
    /* And the module that schedules the in-beat retrievals, so the lesson clock
       can ask it where they fall. Printing is synchronous; this is loaded here
       so it never waits. */
    loadTiming();

    /* Last, not first: an address that already names a panel must not open the
       desk before the column's bookkeeping above exists. */
    this._sync(want(ctx.store.getState()));

    /* --- the four moves, on whatever route the lesson runs ------------ */
    this.d(mountPath(ctx, {
      texts: () => this._texts(),
      openDesk: (panel) => this._go(panel || 'workshop'),
      onArm: (move) => this._label(move),
    }));
  },

  /**
   * The masthead entry's label. Two states and no third: the desk, or the move
   * standing at this beat. `aria-haspopup` changes with it, because one of them
   * opens a dialog and the other opens the rail sheet, and a screen reader
   * should not be told the wrong one.
   */
  _label(move) {
    if (!this.entry) return;
    const e = this.entry;
    /* An answered move stops taking the control: below 62rem this entry is the
       only way into the desk, and a card the reader has already committed to is
       not worth that. It stays reachable from the tour's own aux slot, from
       inside the card, and from `#panel=workshop`. */
    const live = move && !moveDone(move.n) ? move : null;
    this.armed = live;
    e.classList.toggle('tp-entry--move', !!live);
    if (live) {
      /* The mark stays '§' in both states. It is how a reader finds this control
         in a masthead of eight; changing it would make the entry read as a
         different control appearing rather than the same one changing job. */
      e.replaceChildren(
        el('span.tp-entry__mark', { 'aria-hidden': 'true' }, '\u00a7'),
        'Move ' + live.n,
        el('span.tp-entry__arrow', { 'aria-hidden': 'true' }, ' \u2192'));
      e.setAttribute('title', 'Move ' + live.n + ' of 4 \u2014 ' + live.name + '. ' + live.one);
      e.setAttribute('aria-label',
        'Move ' + live.n + ' of 4, ' + live.name +
        '. Opens beside the map; the lesson stays where it is.');
      return;
    }
    e.replaceChildren(el('span.tp-entry__mark', { 'aria-hidden': 'true' }, '\u00a7'), 'Teaching desk');
    /* The word on the control never changes — it is how a reader finds it in a
       masthead of eight. What changes is what it promises, because after the
       first visit it reopens on the section you left, at the row you left. */
    const p = this.lastPanel && PANELS.find(x => x.id === this.lastPanel);
    e.setAttribute('title', p
      ? 'Teaching desk \u2014 back to ' + p.title + ', where you left it'
      : 'Teaching desk \u2014 the four moves, the evidence ledger, the printable pack');
    e.setAttribute('aria-label', p
      ? 'Teaching desk. Opens beside the map, back at ' + p.title + '.'
      : 'Teaching desk. Opens beside the map: the four moves, the evidence ledger, the printable pack.');
  },

  /** The transcribed corpus, loaded once, shared by the desk and the path. */
  _texts() {
    if (!this._textsP) this._textsP = loadTestimony();
    return this._textsP;
  },

  update() {},

  destroy() {
    this.dying = true;
    if (this.d) this.d.all();
    this._teardown();
    if (this.ctx && this.ctx.root) this.ctx.root.replaceChildren();
  },

  /* ------------------------------------------------------------------ nav */

  _go(id) {
    this.ctx.store.dispatch('setPanel', { overlay: id });
  },

  async _sync(id) {
    if (id === this.open) return;
    this.open = id;
    this.entry.setAttribute('aria-expanded', id ? 'true' : 'false');
    this.entry.classList.toggle('is-on', !!id);
    if (!id) { this._teardown(); return; }
    const reopening = !this.wasOpen;
    await this._ensureCorpus();
    if (this.open !== id) return;                    // closed while loading
    this.wasOpen = true;
    this.lastPanel = id;
    this._build();
    const page = this._show(id);
    this._present(id, reopening ? (this.scrollAt.get(id) || 0) : 0);
    /* Focus goes in only when it was on our own entry or nowhere at all. On a
       tab change it is on a tab, inside the desk, and `_present` has already put
       it back; taking it again would break the arrow keys after one press. */
    const a = document.activeElement;
    if (page && (a === this.entry || !a || a === document.body)) {
      try { page.focus({ preventScroll: true }); } catch (_) { /* gone */ }
    }
    this.ctx.bus.emit('teacher:open', { panel: id });
  },

  /**
   * Hand the desk to the shell's rail sheet. The node is the same one every
   * time — the pages inside it keep their scroll, their typed answers and their
   * listeners across a tab change and across a close — and only the head line
   * changes, so the sheet names the section a reader is actually in.
   *
   * `_presenting` guards the round trip: `ask:sheet` makes the shell emit
   * `chrome:sheet` synchronously, and without the guard our own listener would
   * read our own open as somebody else taking the column.
   */
  _present(id, scrollTo) {
    const p = PANELS.find(x => x.id === id) || PANELS[0];
    if (!this.mine) this._capture();
    /* The shell fills the sheet with `replaceChildren`, so handing it the desk
       again — which is what a tab change does — detaches and re-inserts the
       whole subtree and the browser drops the focus on the floor. Measured at
       1024x640: two presses of the right-arrow on the tab strip left focus on
       the document's skip link and the strip on the wrong tab. The node is
       re-connected by the time this runs, so re-focusing it is exact. */
    const had = document.activeElement;
    this._presenting = true;
    try {
      this.ctx.bus.emit('ask:sheet', {
        /* The eyebrow is two short words on purpose. `.cx-sheet__head` is a flex
           row and the eyebrow takes its intrinsic width first: measured at
           900x700, where the rail is 304px, "the teaching desk" printed over
           three lines and left the title 85px to wrap into. */
        id: SHEET_ID, eyebrow: 'the desk', title: p.title, node: this.desk,
      });
    } finally { this._presenting = false; }
    this.mine = true;
    const sc = this.desk.closest('.cx-sheet__body');
    if (sc) sc.scrollTop = scrollTo || 0;
    if (had && had !== document.activeElement && had.isConnected) {
      try { had.focus({ preventScroll: true }); } catch (_) { /* gone */ }
    }
    this._fit();
  },

  /**
   * IS THERE ROOM TO READ THE DESK? Measured on the scroller the desk is
   * actually in, every time it is presented and on every resize.
   *
   * Wave 9: "the Teaching desk is one tap from the student's Tools menu and is
   * UNREADABLE at 390x844." Measured before this existed: a 223-pixel reading
   * window holding 14,493px of the Classroom tab — sixty-five screenfuls. The
   * sheet's height at phone widths is the shell's, not this module's, and the
   * reading-mode control that expands the guided path's panel does not expand
   * the sheet when the desk is in it. So under RESPONSIVE_LAW §11's own floor
   * the desk says so, in one screen, with the address to open it at instead —
   * see `small.js`, which carries the whole measurement.
   *
   * It is not a mode and nothing is remembered: turn the device and the desk
   * comes back, because this runs again and the answer changes.
   */
  _fit() {
    const sc = this.desk && this.desk.closest('.cx-sheet__body');
    const ok = fits(sc);
    if (ok === this._roomy && this.small) { this._applyFit(ok); return; }
    this._roomy = ok;
    if (!ok && !this.small) {
      this.small = el('section.tp-page.tp-page--small', { tabindex: '-1' });
      this.desk.appendChild(this.small);
    }
    if (!ok) {
      try { renderSmall(this.small, { ...this.ctx, corpus: this.corpus }, sc); }
      catch (err) { this.small.textContent = 'The Teaching desk needs a wider window. Open #panel=classroom on a laptop.'; }
    }
    this._applyFit(ok);
    /* THE HEAD HAS TO AGREE WITH WHAT IS UNDER IT. The sheet's title comes from
       the tab, and with the tabs hidden it named a section that is not on the
       screen — measured at 390x844: "the desk · The four moves" over a card
       saying the desk is not here. The node is the same one, so this is a
       re-label and not a re-mount; `_presenting` keeps our own listener from
       reading it as somebody else taking the column. */
    const want = ok ? null : 'Not on this screen';
    if (want !== this._smallTitle) {
      this._smallTitle = want;
      const p = PANELS.find((x) => x.id === this.open) || PANELS[0];
      this._presenting = true;
      try {
        this.ctx.bus.emit('ask:sheet', {
          id: SHEET_ID, eyebrow: 'the desk', title: want || p.title, node: this.desk,
        });
      } finally { this._presenting = false; }
    }
  },

  _applyFit(ok) {
    if (this.small) this.small.hidden = ok;
    const nav = this.desk && this.desk.querySelector('.tp__nav');
    if (nav) nav.hidden = !ok;
    if (this.pages) this.pages.hidden = !ok;
  },

  /**
   * KEEP WHAT WE ARE ABOUT TO DISPLACE. The rail holds one surface at a time,
   * and the guided path's beat panels, its Complication Gates and its recall
   * cards all live in it. A student who presses the desk at a gate used to lose
   * the gate. The shell already solves this for the two-year comparison
   * (LAYOUT_BUDGET §3: "the shell keeps the displaced surface — the node
   * itself, with its listeners and its content — and restores it"), so we do
   * the same thing the same way: the node, not a re-render. A gate's Next-
   * enabling logic is bound to the node it was built on, and rebuilding it
   * would throw away a placement the student had already made.
   *
   * The body can hold more than one child — our own pack block is appended
   * after the Close's — so all of them are kept and put back in order.
   */
  _capture() {
    const body = document.querySelector('.cx-sheet__body');
    const t = document.querySelector('.cx-sheet__title');
    const e = document.querySelector('.cx-sheet__eyebrow');
    const nodes = body ? [...body.children] : [];
    this.displaced = (this.prevSheet && nodes.length)
      ? { id: this.prevSheet, title: t ? t.textContent : '', eyebrow: e ? e.textContent : '', nodes }
      : null;
  },

  /**
   * Put back whatever the desk displaced, or close the column if there was
   * nothing there. `gone` says the shell has already emptied it, in which case
   * an empty put-back is a no-op rather than a second close.
   */
  _restore(gone) {
    const back = this.dying ? null : this.displaced;
    this.displaced = null;
    this._restored = !!back;
    this.mine = false;
    this._presenting = true;
    try {
      if (back) {
        this.ctx.bus.emit('ask:sheet',
          { id: back.id, eyebrow: back.eyebrow, title: back.title, node: back.nodes[0] });
        const body = document.querySelector('.cx-sheet__body');
        for (let i = 1; i < back.nodes.length; i++) if (body) body.appendChild(back.nodes[i]);
        this.prevSheet = back.id;
      } else if (!gone) {
        this.ctx.bus.emit('ask:sheet', null);
        this.prevSheet = null;
      }
    } catch (_) { /* shell gone */ }
    this._presenting = false;
  },

  _teardown() {
    this.wasOpen = false;
    const sc = this.desk && this.desk.closest('.cx-sheet__body');
    if (sc && this.lastPanel) this.scrollAt.set(this.lastPanel, sc.scrollTop);
    /* Only ever close a sheet that is ours. When the reader leaves the desk by
       opening somebody else's surface, this runs *after* their content is in
       the column, and closing it here would shut a panel we did not open — and
       in that case there is nothing to put back, because they put it there. */
    if (this.mine) this._restore(false);
    /* The node and its four pages are kept, detached. Rebuilding them would
       throw away a half-written workshop paragraph and the ledger's filters for
       nothing: this is four DOM subtrees, not a live subscription. */
    const held = this.desk && this.desk.contains(document.activeElement);
    if (this.desk && this.desk.parentNode) this.desk.parentNode.removeChild(this.desk);
    /* The shell's sheet does not put focus back — it is not a modal and it has
       nowhere to put it. We do, because we know which control opened this: a
       reader who pressed Escape inside the desk lands on the entry they came
       through, and not at the top of the document. */
    if (!this.dying && (held || !document.activeElement || document.activeElement === document.body)) {
      /* If we put a surface back — a beat, a gate — the reader's place is in it,
         not in the masthead. Otherwise the column is empty and the entry is the
         only thing that makes sense. */
      const put = this._restored
        && document.querySelector('.cx-sheet__body a[href], .cx-sheet__body button:not([disabled]), .cx-sheet__body textarea, .cx-sheet__body input, .cx-sheet__body select');
      try { (put || this.entry).focus({ preventScroll: true }); } catch (_) { /* gone */ }
    }
    this._label(null);
    if (this.ctx) this.ctx.bus.emit('teacher:close', {});
  },

  /* ------------------------------------------------------- at the Close -- */

  /**
   * DIDACTIC §8 puts the printed sheet at minute 29, inside the Close. P21 owns
   * the Close and this file does not edit it; the block below is our own node,
   * appended to the shell's sheet body after the Close's, and replaced rather
   * than duplicated if the Close is opened twice. The shell's next `ask:sheet`
   * refills that body, so it cannot leak on to another surface.
   */
  _atClose() {
    const body = document.querySelector('.cx-sheet__body');
    if (!body) return;
    const old = body.querySelector('.tp-atclose');
    if (old) old.remove();

    const sheet = (id, label, note) => {
      const b = el('button.tp-atclose__go', { type: 'button' },
        el('span.tp-atclose__lab', label), el('span.tp-atclose__note', note));
      b.addEventListener('click', async () => {
        await this._ensureCorpus();
        this._print({ id });
      });
      return b;
    };

    body.appendChild(el('section.cx-panel.tp-atclose',
      el('p.cx-panel__head', 'the printable pack'),
      el('p.tp-atclose__say',
        'Your revision sheet is the button above, and it is built from what you committed to. ' +
        'These three are the rest of the pack. They print from here; they do not take you anywhere.'),
      el('div.tp-atclose__row',
        sheet('revision', 'The four moves, and what you wrote',
          'Your own answers, or ruled space to write them by hand.'),
        sheet('questions', 'Twelve practice questions',
          'With the mark scheme, and the source each one needs.'),
        sheet('ledger', 'The evidence ledger',
          'Every figure in this atlas with its source, weakest first.')),
      el('button.cx-more', {
        type: 'button',
        onclick: () => this._go('classroom'),
      }, 'Everything else a teacher would print, and the lesson it belongs to')));
  },

  /* ------------------------------------------------------------ the data */

  /**
   * The desk reads the shards directly rather than the normalised objects,
   * for one reason: `tools/evidence-audit.js` reads them the same way and
   * calls the same `buildFigures()`. Two readers, one walk, no drift. The
   * files are already in the browser cache — the shell fetched them at boot —
   * so this costs a parse, not a download, and it only happens if somebody
   * opens the desk.
   */
  async _ensureCorpus() {
    if (this.corpus) return this.corpus;
    if (this.loading) return this.loading;
    const { util } = this.ctx;
    const dir = new URL('../../data/territories/', import.meta.url);
    this.loading = (async () => {
      const manifest = await util.getJson(new URL('index.json', dir)) || {};
      const files = manifest.shards || [];
      const shards = [];
      await Promise.all(files.map(async (file) => {
        const payload = await util.getJson(new URL(file, dir));
        if (payload) shards.push({ file, payload });
      }));
      shards.sort((a, b) => a.file.localeCompare(b.file));
      const rows = defaultSort(buildFigures(shards));
      const version = contentVersion(shards, manifest, rows);
      const stats = ledgerStats(rows);
      const testimony = await this._texts();
      const definitions = await loadDefinitions();
      this.corpus = { manifest, shards, rows, version, stats, testimony, definitions };
      this.loading = null;
      return this.corpus;
    })();
    return this.loading;
  },

  /* ----------------------------------------------------------- the shell */

  _build() {
    if (this.desk) return;

    this.tabs = PANELS.map((p, i) => el('button.tp-tab', {
      type: 'button', role: 'tab', id: 'tp-tab-' + p.id,
      'aria-controls': 'tp-page-' + p.id, 'aria-selected': 'false',
      tabindex: '-1', title: p.sub,
      onclick: () => this._go(p.id),
      /* A `role="tab"` is driven by the arrow keys, not by Tab — one tab stop
         for the whole strip, and Home/End for the ends. Without this the
         desk's four tabs are four separate stops and a screen reader is told
         one thing while the keyboard does another. */
      onkeydown: (ev) => {
        const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[ev.key];
        let next = null;
        if (d) next = (i + d + PANELS.length) % PANELS.length;
        else if (ev.key === 'Home') next = 0;
        else if (ev.key === 'End') next = PANELS.length - 1;
        if (next === null) return;
        ev.preventDefault();
        this._go(PANELS[next].id);
        this.tabs[next].focus();
      },
    }, el('span.tp-tab__label', p.label)));

    this.pages = el('div.tp__pages');

    /* The sheet's own head carries the title and the way out, so the desk adds
       one row: which of the four sections, and the content version that every
       printed page and every deep link off this desk also carries. */
    /* A LANDMARK, NOT A DIALOG. The desk stopped being a modal in round three
       (FEATURE_SPEC §2 rule 1: nothing covers the map), and with the dialog
       role went the only accessible name it had — measured: `.tp` carried no
       role, no `aria-label` and no `aria-labelledby`, so a screen reader
       arriving in the rail sheet was handed four tabs inside an unnamed div.
       A region with a name is what it now is, and what it should have been:
       the sheet's head names the surface, this names the thing inside it. */
    this.desk = el('div.tp', { role: 'region', 'aria-label': 'The teaching desk' },
      el('div.tp__nav',
        el('div.tp__tabs', { role: 'tablist', 'aria-label': 'Teaching desk sections' }, ...this.tabs),
        el('p.tp__version', { title: 'The content version. Every printed page and every deep link carries it.' },
          this.corpus.version.string)),
      this.pages);
  },

  _show(id) {
    for (const t of this.tabs) {
      const on = t.id === 'tp-tab-' + id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
      t.classList.toggle('is-on', on);
    }
    let page = this.rendered.get(id);
    if (!page) {
      page = el('section.tp-page', {
        id: 'tp-page-' + id, role: 'tabpanel',
        'aria-labelledby': 'tp-tab-' + id, tabindex: '0',
      });
      const api = {
        ...this.ctx,
        corpus: this.corpus,
        go: (p) => this._go(p),
        print: (pack) => this._print(pack),
        store2: storage,
      };
      try {
        if (id === 'workshop') renderWorkshop(page, api);
        else if (id === 'evidence') renderLedger(page, api);
        else if (id === 'classroom') renderClassroom(page, api);
        else if (id === 'methods') renderMethods(page, api);
      } catch (err) {
        page.appendChild(el('p.cx-note.cx-note--warn',
          'This section failed to draw: ' + (err && err.message ? err.message : String(err))));
        // eslint-disable-next-line no-console
        console.warn('[teacher] ' + id + ' failed', err);
      }
      this.rendered.set(id, page);
      this.pages.appendChild(page);
    }
    for (const [key, node] of this.rendered) node.hidden = key !== id;
    announce(PANELS.find(p => p.id === id).label + '. ' + PANELS.find(p => p.id === id).sub + '.');
    return page;
  },

  /* --------------------------------------------------------------- print */

  _print(pack) {
    printPack(pack, this.corpus, this.ctx);
    this.ctx.bus.emit('teacher:print', { pack: pack && pack.id });
  },
};
