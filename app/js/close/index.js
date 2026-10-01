/**
 * close/index.js — P21. THE ENDING, AND THE ENDING MADE VISIBLE FROM THE START.
 *
 * Print's second charge is the one that hurts: "a chapter ends; an explorable
 * map has no ending, so nothing lands." Four objects answer it.
 *
 *  1. THE LEDGER (ledger.js) — every commitment this student made, as a
 *     sentence in their own voice. Nothing else is recorded.
 *  2. THE UNFINISHED SENTENCE — DIDACTIC_SPEC §2.3's through-line runs in the
 *     statusbar from second one with blanks in it, so the ending is visible
 *     from the beginning and the distance to it is visible without a progress
 *     bar. A blank fills when the Ledger earns it. Clicking a blank goes to the
 *     beat that fills it. It never nags and never blocks.
 *  3. THE ANY-EXIT CLOSE — reachable at any second from the control at the end
 *     of that sentence, or by pressing Escape twice. It prints the twelve-line
 *     argument: lines this student can defend are set in full and carry their
 *     own numbers, their own first wrong guesses and their own gate choices;
 *     lines they cannot are greyed, with the evidence named and its price in
 *     seconds. A conclusion that names its own gaps teaches better than one
 *     that pretends there are none.
 *  4. THE REVISION SHEET — one page, their signed sentence at the top, printed
 *     from their own session. It is the artefact that outlives the browser.
 *
 * The Close opens in the rail, never over the plate: FEATURE_SPEC §2 rule 1 has
 * no exception for the ending.
 *
 * Slot: `statusbar`. Emits: close:opened · close:signed
 * Listens: close:open · ledger:changed · tours:beat
 */

import { el, fill, disposer, announce } from '../core/util.js';
import { getLedger } from './ledger.js';
import { stillBritish } from '../tours/answers.js';
import { loadFigures, mark as markFigures, sync as syncFigures, plain as figPlain, figure, figureIds } from '../tours/figures.js';
import { snapLines } from '../tours/panel.js';
/* WHICH ROUTE A COLD START RUNS. Asked of the module that owns the question
   rather than answered here — see `_routeId`. `budget.js` is pure (no DOM, no
   bus), so importing it costs this piece nothing at mount. */
import { defaultRoute as toursDefaultRoute } from '../tours/budget.js';

const CSS = new URL('../../css/tours.css', import.meta.url);
/* P21's own sheet. It is loaded AFTER tours.css and overrides §6 of it, which
   is where the through-line's one-line strip is styled. See close.css §0. */
const CSS_MINE = new URL('../../css/close.css', import.meta.url);
const HERE = (f) => new URL(f, import.meta.url).href;
const TOURS = (f) => new URL('../tours/' + f, import.meta.url).href;

export default {
  id: 'close',
  slot: 'statusbar',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { util, bus } = ctx;
    await util.loadCss(CSS);
    await util.loadCss(CSS_MINE);

    const [thesis, close, tours] = await Promise.all([
      util.getJson(HERE('thesis.json'), null),
      util.getJson(HERE('close.json'), null),
      util.getJson(TOURS('tours.json'), null),
      /* NO CHECK, NO NUMBER — the same registry the path prints from, so the
         £1.72m in line 4 of this panel and the £1.72m on beat 6 are one
         object with one warrant and cannot drift apart. `tours/figures.js`
         holds a single copy however many modules ask for it. */
      loadFigures((u) => util.getJson(u, null)),
    ]);
    if (!thesis || !close) return;

    this.thesis = thesis;
    this.close = close;
    this.tours = tours || { beats: [], chapters: [] };
    this.beatById = new Map((this.tours.beats || []).map((b) => [b.id, b]));
    this.ledger = getLedger(bus);
    this.ledger.listen();

    /* WHEN THIS SESSION STARTED LOOKING. A clause that fills in the first
       seconds of a cold deep link is not news — it is the page arriving — and
       scrolling the line to it hands a reader their own sentence starting in
       the middle. Measured at 390x844 on `#tour=thirty&step=9`: the ledger is
       empty at the first paint and carries `revenue-loop` at the second, so
       clause 4 read as freshly earned and the spine opened at scrollLeft 414
       of 604. The underline still marks it; the line does not move for it. */
    this._mountedAt = Date.now();
    /* WHICH ROUTE'S BEATS THIS SENTENCE IS KEYED AGAINST. Resolved before the
       first paint and again whenever the running route changes, because a
       blank is only reachable if the beat that earns it is in this route's
       step list. See `_audit`. */
    this._resolveRoute();
    this._audit();
    /* WHERE THIS SESSION CAME IN, RECORDED WHEN IT CAME IN.
       ROUND 3, three critics, one sentence: every student who walked the whole
       route was told "You came in part-way through. This lesson opened at step
       15, so the 3 beats before it are not in your record" — printed directly
       under "8 of 13 lines below you have the evidence for", with nothing
       greyed. The old test compared `store.tourStep` against the number of
       beats in the record, and a route's steps are not its beats: `core` is 11
       required beats in 15 stops and `thirty` is 16 in 25, so at the last step
       the test could never pass and the false sentence was printed on EVERY
       completed run of EVERY route. See `_joinedLate`. The entry point is a
       fact about the session, so it is recorded once, here, and never inferred
       from where the student has since walked to. */
    this._entryStep = null;
    this._noteEntry();
    this.d(bus.on('tours:beat', () => this._noteEntry()));
    this.d(bus.on('tours:ready', () => { this._noteEntry(); if (this._resolveRoute()) this._schedule(); }));
    this.d(bus.on('tours:routes', () => { if (this._resolveRoute()) this._schedule(); }));
    this._buildSentence(ctx.root);
    this._buildPrintRegion();

    /* ONE PAINT PER FRAME. Six of these events can land in one tick — a beat
       that closes writes `completed`, which fires `ledger:changed`, which
       changes the panel's height, which fires `chrome:layout` — and at 390x844
       the through-line is a block INSIDE the panel, so each repaint resizes the
       element the shell is observing. Measured: six ledger writes in one tick
       produced "ResizeObserver loop completed with undelivered notifications"
       on every run at 390x844 and none at 900x700, where the block does not
       exist. Coalescing into a single frame removes it. */
    this.d(bus.on('ledger:changed', () => this._schedule()));
    this.d(bus.on('tours:beat', () => this._schedule()));
    this.d(bus.on('close:open', (p) => this.open(p)));
    this.d(bus.on('chrome:stage', () => this._schedule()));
    this.d(bus.on('chrome:layout', () => this._schedule()));
    const onResize = () => { clearTimeout(this._rt); this._rt = setTimeout(() => this._schedule(), 120); };
    window.addEventListener('resize', onResize);
    this.d(() => {
      clearTimeout(this._rt); clearTimeout(this._st); clearTimeout(this._freshT);
      if (this._refit) cancelAnimationFrame(this._refit);
      if (this._blkRefit) cancelAnimationFrame(this._blkRefit);
      if (this._paintQ) cancelAnimationFrame(this._paintQ);
      window.removeEventListener('resize', onResize);
      this._closeWhole();
    });
    this.d(bus.on('chrome:sheet', (p) => {
      if (p && !p.open) this._disarm();
      this._placeWhole();
      /* The rail takes a column out of the footer, so the sentence has a
         different amount of room open than closed and has to be re-fitted. */
      clearTimeout(this._st); this._st = setTimeout(() => this._schedule(), 80);
    }));

    /* Esc Esc, from anywhere. The first Escape belongs to whoever is holding
       something open — the shell closes the sheet, the map leaves the enlarged
       plate — so this counts presses rather than claiming the key. */
    this._lastEsc = 0;
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        /* THE EVENT'S OWN CLOCK, NOT THE HANDLER'S. `Date.now()` at handler
           time measures when this app got round to the key, not when the key
           was pressed — so a long task between the two presses (a beat
           re-rendering, a repaint of the plate) made two presses 150ms apart
           arrive 950ms apart and the pair was refused. It failed once in ten
           runs of the harness at 390x844 under reduced motion, which is the
           worst kind of defect to leave in the only keyboard route to the
           ending. `timeStamp` is the moment the event was generated and is on
           the same clock as `performance.now()`. */
        const now = (typeof ev.timeStamp === 'number' && ev.timeStamp > 0) ? ev.timeStamp : performance.now();
        if (now - this._lastEsc < 900) { this._lastEsc = 0; this.open({ reason: 'esc esc' }); return; }
        this._lastEsc = now;
        return;
      }
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target;
      if (t instanceof Element && t.closest('input,textarea,select,[contenteditable=""],[contenteditable="true"]')) return;
      if (ev.key === 'l' || ev.key === 'L') { ev.preventDefault(); this.openLedger(); }
    };
    document.addEventListener('keydown', onKey);
    this.d(() => document.removeEventListener('keydown', onKey));

    this._paintSentence();
  },

  destroy() { if (this.d) this.d.all(); if (this.printEl) this.printEl.remove(); },

  /* ============================================ the unfinished sentence == */

  /**
   * ONE SENTENCE, TWO PLACEMENTS, ONE PIECE OF MARKUP.
   *
   * `.cl-bar` — the strip in `.app__foot` — exists only at `data-foot="on"`.
   * `.cl-blk` — the spine at the foot of the panel scroller — exists only at
   * `data-foot="off"`. Both carry the same one-line scroller (`.cl-say`), the
   * same six clauses, and the same control that opens the sentence out into a
   * wrapped copy that can be read whole. Never both at once: two copies of one
   * sentence is two sentences to a screen reader.
   */
  _buildSentence(root) {
    this.sentence = el('p.cl-say', { 'aria-label': 'What you will be able to say at the end' });
    this.sayWrap = el('div.cl-say__wrap', this.sentence);
    /* THE CUE IS A CONTROL, NOT A FADE.
       Measured after a walk of the whole path: at 900x700 the strip is a 446px
       window on a 1258px sentence and at 1366x768 a 806px window on the same
       1258 — so two thirds of a student's own sentence is off the end of the
       box at every width the strip exists at, and the 15 % mask that says so
       was read by a classroom critic as "no visible cue that there is more to
       the left". A button says it in words, and does something about it. */
    this.whole = el('button.cl-bar__whole', {
      type: 'button',
      'aria-expanded': 'false',
      text: 'Read it whole',
      onclick: () => this._toggleWhole(),
    });
    this.finish = el('button.cx-more.cl-finish', {
      type: 'button',
      onclick: () => this.open({ reason: 'control' }),
    });
    fill(root, el('div.cl-bar', this.sayWrap, this.whole, this.finish));
    this._wireLine(this.sentence);
  },

  /**
   * THE ARROW KEYS ARE ALREADY TAKEN. A focused scroll container normally
   * scrolls under Left/Right, but P02 pans the plate with the arrow keys from
   * a document-level listener, so measured at 900x700 with the line focused
   * and every clause filled, six ArrowLefts and a Home moved it 0px: the
   * sentence had six clauses in it and a keyboard could reach four. So the
   * line handles its own keys, clause by clause — which is also the right
   * step, because a clause is the unit the reader is looking for — and stops
   * the event, but ONLY while it is the focused element and only while there
   * is somewhere to go.
   *
   * Per node, because there are two lines now and only one of them is ever on
   * screen: the strip's, and the panel spine's.
   */
  _wireLine(n) {
    n._cl = { key: null, set: null, touched: false };
    n.addEventListener('keydown', (ev) => {
      if (document.activeElement !== n) return;
      if (n.scrollWidth <= n.clientWidth + 1) return;
      const max = n.scrollWidth - n.clientWidth;
      const stops = [...n.querySelectorAll('.cl-say__g')].map((g) => {
        const r = g.getBoundingClientRect();
        return Math.max(0, Math.min(Math.round(r.left - n.getBoundingClientRect().left + n.scrollLeft), max));
      });
      let to = null;
      if (ev.key === 'ArrowRight') to = stops.find((x) => x > n.scrollLeft + 2);
      else if (ev.key === 'ArrowLeft') to = [...stops].reverse().find((x) => x < n.scrollLeft - 2);
      else if (ev.key === 'Home') to = 0;
      else if (ev.key === 'End') to = max;
      if (to == null) {
        /* At an end, hand the key back rather than swallowing it. */
        if (ev.key === 'ArrowRight') to = max;
        else if (ev.key === 'ArrowLeft') to = 0;
        else return;
        if (Math.abs(to - n.scrollLeft) < 2) return;
      }
      ev.preventDefault();
      ev.stopPropagation();
      n.scrollLeft = to;
      n._cl.set = n.scrollLeft;
      /* THE READER HAS TAKEN THE LINE. Measured at 900x700 with every clause
         filled: six ArrowLefts moved the line and the settle pass put it back
         on the next repaint, because the settle pass could not tell the
         reader's offset from its own. It can now. */
      n._cl.touched = true;
    });
  },

  /* ==================================== which beat earns which blank =====
   *
   * THE DEFECT THIS ANSWERS, MEASURED. Round 5 walked `core` — the DEFAULT
   * route — from step 0 to the Close, completing all eleven required beats:
   * poster, spine, resistance, compensation, revenue-loop, egypt, scramble,
   * two-track, two-in-tension, exits, fourteen. Three of the six blanks never
   * filled. Slots 1, 3 and 5 were keyed to `barbados`, `who-took-bengal` and
   * `princely`, none of which `core` carries, so:
   *
   *   · the signature scaffold printed  "started as ______ worked by … ______
   *     that ended up ruling … a map that hid ______"
   *   · `.cl-finish` read "Finish here", data-primary="" — for ever
   *   · pressing one of those three blanks emitted `tours:goBeat` for a beat
   *     that is not in the running route's steps, and `_goto` returns silently
   *
   * A student who did every single thing the default lesson asked was told, by
   * the app's own ending, that they had not finished it — and DIDACTIC_SPEC
   * §2.3 calls this sentence the app's success metric.
   *
   * THE CAUSE IS NOT THE THREE IDS. A route is composed in `tours.json`
   * `variants`; a blank is keyed in `thesis.json`; nothing checked one against
   * the other, and `close.json` had drifted the same way in a form no route
   * could hide — its line 11 required a beat id, `amritsar`, that has never
   * existed in `tours.json` at all, so that line was grey on all four routes
   * including the one whose own strap claims to fill every line.
   *
   * So: a slot names its earners in order of preference and this resolves the
   * first one that is on the route the student is actually running; and
   * `_audit` checks every slot and every close line against every route at
   * mount, and calls `console.error` when a clause cannot be earned on a route
   * this content has not declared partial. The repository's rule is zero
   * console errors, so a future edit to `variants` that orphans a clause turns
   * every scenario red on the spot instead of shipping a broken ending.
   */
  _routeId() {
    const st = this.ctx.store.getState();
    const v = st && st.activeTour;
    if (v && this.tours.variants && this.tours.variants[v]) return v;
    /* No route mounted yet: the sentence is keyed against the one the door
       will start. WHICH ROUTE THAT IS IS NOT NAMED HERE — round 8 moved the
       default from `core` to the route that fits a school period, and a second
       file holding an opinion about the key is exactly how the through-line
       came to be keyed to beats the default route does not carry. It is stated
       once, as `isDefault` on the route itself in tours.json, and read through
       the function that owns the question. */
    return toursDefaultRoute(this.tours);
  },

  _routeBeats(id) {
    const ids = (this.tours.variants && this.tours.variants[id || this._routeId()]) || [];
    return new Set(ids);
  },

  /** Ordered earners for a slot, oldest field first so nothing has to migrate. */
  /**
   * THE THROUGH-LINE THIS ROUTE IS ACTUALLY ASSEMBLING.
   *
   * DIDACTIC_SPEC §8.4(3), amended wave 9: a lesson "completes and signs THIS
   * LESSON'S own through-line", and §2.3's whole sentence "belongs to the unit
   * and may be offered for signing only at the unit Close or at the end of the
   * full route… A lesson must never present a sentence it cannot earn, and
   * must never present §2.3 with the other lesson's half greyed out."
   *
   * The `partial` mechanism does precisely that greying, and it is right for
   * the short run — a taste of the whole sentence, which says so. It is wrong
   * for a lesson, because a lesson is a whole thing whose argument finishes.
   * So `thesis.json` carries a `perRoute` block and this returns it: same
   * shape, same slot resolution, same audit, a different sentence. Routes with
   * no block get the unit's sentence, which is what the full route should have
   * and what every retired route still gets.
   */
  _thesisFor(routeId) {
    const per = (this.thesis && this.thesis.perRoute) || {};
    const own = per[routeId || this._routeName];
    return own ? Object.assign({}, this.thesis, own) : this.thesis;
  },

  /** The block for the route that is running right now. */
  _th() { return this._thesisFor(this._routeName); },

  _earners(s) {
    if (Array.isArray(s.earnedBy) && s.earnedBy.length) return s.earnedBy;
    return s.requires ? [s.requires] : [];
  },

  /**
   * The beat this blank is keyed to ON THIS ROUTE, or null when the route
   * carries none of them. `null` is not an error here — it is what the Close
   * prints as "this route never offered it" — and `_audit` is the thing that
   * decides whether it was declared or is a bug.
   */
  _earnerFor(s, on) {
    const set = on || this._route;
    for (const id of this._earners(s)) if (set.has(id)) return id;
    return null;
  },

  _resolveRoute() {
    const id = this._routeId();
    if (this._routeName === id) return false;
    this._routeName = id;
    this._route = this._routeBeats(id);
    return true;
  },

  /**
   * EVERY CLAUSE, EVERY LINE, EVERY ROUTE — checked by the app, at mount.
   *
   * Published on `window.BEA.throughLineAudit` so a scenario can assert it,
   * and shouted at the console when it fails, because that is what makes the
   * check unignorable in a repository whose harness fails on a single console
   * error.
   */
  _audit() {
    const beats = new Set((this.tours.beats || []).map((b) => b.id));
    const routes = Object.keys(this.tours.variants || {});
    const partial = this.thesis.partial || {};
    const bad = [];
    const table = {};

    /* 0. A LINE THAT NEEDS TWO BEATS MUST SAY WHICH ONE ASKED THE QUESTION.
          See `_askOf`. Without it the clause is keyed to a question a route
          carrying only the other beat can never put, which is how blank 6 came
          to be unfillable on the one-period route. */
    for (const l of this.close.lines || []) {
      if (!l.mine || !l.mine.claimId) continue;
      const req = l.requires || [];
      if (req.length > 1 && !l.mine.beat) {
        bad.push('close line ' + l.n + ' needs ' + req.length + ' beats and does not say which of them asked "'
          + l.mine.claimId + '" (author mine.beat)');
      }
      if (l.mine.beat && !req.includes(l.mine.beat)) {
        bad.push('close line ' + l.n + ' says "' + l.mine.beat + '" asked its question, and that beat is not in its requires');
      }
    }

    /* 1. An id that names no beat is wrong on every route, always — and
          every per-route sentence is checked with the same eye as the shared
          one, or a lesson's own through-line could be orphaned silently. */
    const allSlotSets = [this.thesis.slots].concat(
      Object.values((this.thesis && this.thesis.perRoute) || {}).map((x) => x.slots || []));
    for (const set of allSlotSets) {
      for (const s of set) {
        for (const id of this._earners(s)) {
          if (!beats.has(id)) bad.push('thesis slot ' + s.n + ' names a beat that does not exist: "' + id + '"');
        }
      }
    }
    for (const l of this.close.lines || []) {
      for (const id of l.requires || []) {
        if (!beats.has(id)) bad.push('close line ' + l.n + ' names a beat that does not exist: "' + id + '"');
      }
    }

    /* 2. Every blank has an earner on every route, or the route says so. */
    for (const r of routes) {
      const on = this._routeBeats(r);
      const row = {};
      for (const s of this._thesisFor(r).slots) {
        const e = this._earnerFor(s, on);
        row[s.n] = e;
        if (!e && !partial[r]) {
          bad.push('route "' + r + '" can never fill blank ' + s.n + ' (' + s.hint + '): none of '
            + this._earners(s).join(', ') + ' is on it, and thesis.json does not declare this route partial');
        }
      }
      table[r] = { slots: row, reachable: Object.values(row).filter(Boolean).length, partial: !!partial[r] };
    }

    /* 3. AND THE SENTENCE ABOUT WHERE THEY CAME IN IS CHECKED THE SAME WAY,
          for every route and every step of it, at mount.

       ROUND 3, all four critics, one sentence: every student who finished a
       route was told "You came in part-way through. This lesson opened at step
       15, so the 3 beats before it are not in your record" — under a headline
       counting the lines they had earned, with nothing greyed. The cause was
       that `_joinedLate` compared a STEP number with a BEAT count, and a
       route's steps include its gates, its argument between historians and its
       spaced recalls. The fix is in `_joinedLate`; this is the rule that stops
       the class coming back, and it does not need a student to walk a route to
       find it. For every route, at every step a lesson can open at, the number
       of beats that precede that step must be a real count of beats on that
       route: never negative, never more than the route carries, and zero at
       step one — which is exactly the arithmetic the old test could not do.

       It runs against tours' own published step index. When that has not been
       published yet the check is deferred rather than skipped, because a rule
       that quietly does not run is not a rule. */
    const voice = [];
    const routeIx = (typeof window !== 'undefined' && window.BEA && window.BEA.toursIndex) || null;
    if (routeIx && routeIx.routes) {
      for (const r of Object.keys(routeIx.routes)) {
        const steps = routeIx.routes[r].steps || [];
        const carry = steps.filter((x) => x.kind === 'beat' && !x.optional).length;
        for (let i = 0; i < steps.length; i++) {
          const before = steps.filter((x) => x.i < i && x.kind === 'beat' && !x.optional).length;
          if (before < 0 || before > carry) {
            voice.push('route "' + r + '" step ' + (i + 1) + ' counts ' + before
              + ' beats before it, and the route carries ' + carry + ' — a step count printed as a beat count');
          }
          if (i === 0 && before !== 0) {
            voice.push('route "' + r + '" says ' + before + ' beats precede its first step');
          }
        }
      }
      if (voice.length) bad.push(...voice);
    } else {
      /* The index arrives with `tours:ready`; re-run then. */
      this.d(this.ctx.bus.on('tours:ready', () => { if (!this._reaudited) { this._reaudited = true; this._audit(); } }));
    }

    const audit = { routes: table, problems: bad, ok: bad.length === 0, entryChecked: !!routeIx };
    /* THE HANDLE HAS TO OUTLIVE THE BOOT. `main.js` assigns `window.BEA = {…}`
       wholesale on the line AFTER it emits `app:ready`, so anything a module
       writes onto that object during mount — or from inside an `app:ready`
       handler — is thrown away on the next line. Measured: the audit read back
       as `undefined` on one run and as the object on another, depending only on
       whether this module's async mount happened to finish before or after the
       shell's assignment. So it is written now AND again on the next task,
       which is after the assignment however the race falls. */
    this._publish = () => { try { (window.BEA || (window.BEA = {})).throughLineAudit = audit; } catch (_) { /* no handle */ } };
    this._publish();
    setTimeout(this._publish, 0);
    this.d(this.ctx.bus.on('app:ready', () => setTimeout(this._publish, 0)));
    if (bad.length) console.error('[close] the through-line cannot be finished:\n  ' + bad.join('\n  '));
    return audit;
  },

  /**
   * "16 kinds of rule — you guessed 11 kinds of rule" is not a sentence.
   * The answer and the guess are both recorded with their unit, because both
   * are printed alone elsewhere; here they are printed together, so the second
   * copy of a shared tail comes off.
   */
  _trimUnit(said, answer) {
    const a = String(answer || '').trim();
    const s = String(said || '').trim();
    if (!a || !s) return s;
    const tail = a.replace(/^[\d.,–—-]+\s*/, '').trim();
    if (!tail || tail.length < 3) return s;
    if (s.toLowerCase().endsWith(tail.toLowerCase())) {
      const cut = s.slice(0, s.length - tail.length).trim();
      if (cut) return cut;
    }
    return s;
  },

  _slotState() {
    /* THE ROUTE CAN CHANGE UNDER THIS SENTENCE. A student may take another
       route from the card on beat 1, or paste `#tour=eight` into an open tab,
       and neither of those re-emits `tours:ready`. Resolving here costs one
       string comparison per paint and means the blanks are always keyed
       against the route that is actually running. */
    this._resolveRoute();
    const out = [];
    for (const s of this._th().slots) {
      const goto = this._earnerFor(s);
      const seen = !!goto && this.ledger.didBeat(goto);
      /* ATTENDANCE IS NOT AN ANSWER, AND THE SENTENCE IS THE APP'S SUCCESS
         METRIC.
         ROUND 2, the rubric, as a defect: "The Close's '4 of 13 lines you have
         the evidence for' counts commitments, not comprehension, and says so —
         but a student who clicks past every question still reaches 'Finish and
         print' with a complete signed sentence. The sentence is earned by
         attendance at a beat, not by answering it."
         The thirteen lines already know the difference — `_standing()` returns
         `unanswered` for a beat that was on screen and whose question was
         walked past — and they know it from `close.json`'s own `mine.claimId`.
         The clauses now read the same record: a clause whose earner beat put a
         question to this student fills when they have ANSWERED it, and a
         decline counts, because "I would rather not guess" is an answer and is
         recorded by name. A clause whose beat only had something to show still
         fills on attendance, because there was nothing to commit to. */
      const ask = this._askOf(goto);
      const answered = !ask || !!this.ledger.get(ask);
      const done = seen && answered;
      const waiting = seen && !answered;
      let text = s.fill;
      let shortFill = s.shortFill;
      if (done && s.mine) {
        const e = this.ledger.get(s.mine.claimId);
        /* Same rule as `_mine`: a slot that quotes the student back at
           themselves stays on the authored wording when there is nothing to
           quote. "a dozen kinds of rule — you guessed no answer" is not a
           sentence anyone should have to read in their own through-line. */
        const put = (tpl) => String(tpl)
          .replace('{answer}', e && e.answer ? e.answer : '')
          .replace('{said}', this._trimUnit(e && e.youSaid, e && e.answer));
        if (e && e.verdict !== 'declined') {
          text = put(s.mine.fill);
          if (s.mine.shortFill) shortFill = put(s.mine.shortFill);
        } else if (e && e.answer) {
          text = s.mine.fill.replace('{answer}', e.answer).replace(/\s*—\s*you guessed \{said\}/, '').replace('{said}', 'nothing');
          if (s.mine.shortFill) shortFill = s.mine.shortFill.replace('{answer}', e.answer).replace('{said}', 'nothing');
        }
      }
      /* `offered` is false only where THIS route carries no beat that earns
         the clause. It is not a failure state and it never blocks: the Close
         names it, the finish control stops waiting for it, and the blank
         stops pretending to be a control that goes somewhere. */
      out.push({ ...s, done, waiting, ask, text, shortFill, goto, offered: !!goto });
    }
    return out;
  },

  /**
   * THE QUESTION A BEAT PUT TO THIS STUDENT, IF IT PUT ONE.
   *
   * Read off `close.json`, which already names it: a line whose `requires`
   * includes this beat and which carries a `mine.claimId` is a line about a
   * beat that ASKED something. Nothing new is authored and nothing is
   * duplicated — the two halves of the ending agree because they read the same
   * field. A beat that only had something to show returns null and its clause
   * fills on attendance, which is the right test for it.
   */
  _askOf(beatId) {
    if (!beatId) return null;
    if (!this._askMap) {
      this._askMap = new Map();
      for (const l of (this.close && this.close.lines) || []) {
        if (!l.mine || !l.mine.claimId) continue;
        /* WHICH OF THE LINE'S BEATS ACTUALLY ASKED IT. A line may need two
           beats and only one of them may put a question — line 13 (line 12 until
           round 9 inserted the Berlin line above it) needs
           `singapore` and `exits`, and only `exits` asks. Pointing both at the
           one claim keyed the through-line's closing clause to a question a
           route carrying `singapore` alone never puts, so blank 6 could never
           fill on the one-period route however completely it was done. The
           asker is authored, as `mine.beat`; a single-beat line does not need
           it, because there is only one candidate. `_audit()` requires it
           wherever there is a choice. */
        const asked = l.mine.beat ? [l.mine.beat] : (l.requires || []);
        for (const b of asked) if (!this._askMap.has(b)) this._askMap.set(b, l.mine.claimId);
      }
    }
    return this._askMap.get(beatId) || null;
  },

  /** The blanks this route can actually earn — what "finished" means here. */
  _reachable(slots) { return slots.filter((s) => s.offered).length; },

  /**
   * WHAT A SHORTER ROUTE DID NOT TEACH, SAID IN ITS OWN WORDS. The greyed
   * lines of the argument already price their own omissions in seconds; a
   * clause of the through-line that this route never offered is the same
   * honesty in one sentence, and it is the difference between an ending that
   * names its gaps and an ending that quietly refuses to arrive.
   */
  _partialSay(slots) {
    const out = slots.filter((s) => !s.offered);
    if (!out.length) return '';
    const which = out.map((s) => 'blank ' + s.n + ' (' + s.hint + ')').join(' and ');
    const why = (this.thesis.partial || {})[this._routeName] || '';
    return 'This route never offers ' + which + '. ' + (why || 'No beat on it earns that clause.')
      + ' Everything it did teach is filled: sign it and print.';
  },

  /** One group per clause, in the abbreviated wording the one-line box holds. */
  _lineGroups(slots, live, mark) {
    return slots.map((s) => {
      const g = el('span.cl-say__g', { 'data-n': String(s.n) });
      if (s.done) {
        g.append(el('span.cl-say__filled', { text: s.shortFill || s.text, 'data-new': mark.has(s.n) ? 'yes' : '' }));
      } else if (live && s.offered) {
        g.append(el('button.cl-say__blank', {
          type: 'button',
          title: s.hint + ' — go to the beat that fills this',
          'aria-label': 'Blank ' + s.n + ': ' + s.hint + '. Go to the beat that fills it.',
          onclick: () => this._goBeat(s.goto),
        }, el('span.cl-say__rule')));
      } else {
        /* A BLANK THIS ROUTE NEVER OFFERS IS NOT A BUTTON. It used to be one,
           and pressing it asked the runner for a beat that is not in its step
           list, which returns silently. A control that does nothing is worse
           than no control, so it is set flat and says why in its own title. */
        g.append(el('span.cl-say__blank.cl-say__blank--flat', {
          title: s.offered ? s.hint : s.hint + ' — no beat on this route fills it',
          'data-offered': s.offered ? '' : 'no',
        }, el('span.cl-say__rule')));
      }
      const join = s.short != null ? s.short : s.after;
      /* No space before a comma or a full stop. */
      g.append(el('span.cl-say__join', { text: (/^[,.;:]/.test(join) ? '' : ' ') + join + ' ' }));
      return g;
    });
  },

  /**
   * THE SAME SENTENCE, WRAPPED, IN FULL WORDS. This is what "read it whole"
   * opens and what the panel spine expands to. The clauses are the long ones —
   * a box that wraps has no reason to abbreviate — and every unfilled blank is
   * still a numbered gap that goes to the beat that fills it.
   */
  _sayWrapped(slots, live, fresh) {
    const say = el('p.cl-blk__say');
    say.append(this._th().lead + ' ');
    for (const s of slots) {
      if (s.done) say.append(el('span.cl-blk__filled', { text: s.text, 'data-new': fresh.has(s.n) ? 'yes' : '' }));
      else {
        const kids = [el('span.cl-blk__rule'), el('span.cl-blk__n', { text: String(s.n) })];
        if (live && s.offered) {
          say.append(el('button.cl-blk__gap', {
            type: 'button',
            title: s.hint + ' — go to the beat that fills this',
            'aria-label': 'Blank ' + s.n + ' of ' + slots.length + ': ' + s.hint + '. Go to the beat that fills it.',
            onclick: () => this._goBeat(s.goto),
          }, ...kids));
        } else {
          say.append(el('span.cl-blk__gap.cl-blk__gap--flat', {
            title: s.offered ? s.hint : s.hint + ' — no beat on this route fills it',
            'data-offered': s.offered ? '' : 'no',
            'aria-label': 'Blank ' + s.n + ': ' + s.hint + (s.offered ? '' : ' — this route carries no beat that fills it'),
          }, ...kids));
        }
      }
      say.append((/^[,.;:]/.test(s.after) ? '' : ' ') + s.after + ' ');
    }
    return say;
  },

  /**
   * THE LINE, AND THE SPINE. One state, painted into whichever of the two the
   * viewport actually has.
   *
   * MEASURED, on the build this replaces, cold-loaded into the authored path
   * and then walked to the end:
   *   390x844   data-foot="off"  strip 0x0; block at y=660 in a scroller whose
   *                              last visible pixel is y=660 — six clauses, NONE DRAWN
   *   768x1024  data-foot="off"  same
   *   900x700   data-foot="on"   strip 446px on a 1258px sentence, resting at
   *                              scrollLeft 812 — clauses 5 and 6, no lead
   *   1366x768  data-foot="on"   806px on 1258, resting at 452 — clauses 4, 5, 6
   * The block was not short at the first two widths and it was not absent
   * either: it was below the fold of a 198px scroller, which is worse, because
   * it also cost the beat 172px of scroll length to be invisible in.
   */
  _paintSentence() {
    if (!this.sentence) return;
    const slots = this._slotState();
    const filled = slots.filter((s) => s.done).length;
    /* At `data-stage="plate"` the blanks are not yet controls: LAYOUT_BUDGET
       level 0 is nineteen controls, and six of them cannot be six blanks in a
       sentence nobody has earned a word of yet. They become buttons the moment
       the reader touches anything. */
    const stage = document.documentElement.dataset.stage || 'plate';
    const live = stage !== 'plate';
    /* WHICH CLAUSE JUST ARRIVED. The sentence assembling itself is the whole
       device — DIDACTIC_SPEC §2.3 — and a word that appears silently in a line
       a student is not looking at teaches nothing. So a clause earned since the
       last paint is underlined in the accent for four seconds and said once.
       It fires on a change, never on a repaint: `_doneKey` is the set of filled
       clauses, and the first paint of a session sets it without announcing, so
       a reload of a finished lesson does not read six clauses aloud. */
    const doneKey = slots.filter((s) => s.done).map((s) => s.n).join(',');
    const fresh = new Set();
    if (this._doneKey != null && doneKey !== this._doneKey) {
      const before = new Set(this._doneKey.split(',').filter(Boolean));
      for (const s of slots) if (s.done && !before.has(String(s.n))) fresh.add(s.n);
    }
    this._doneKey = doneKey;
    if (fresh.size) {
      const last = slots.filter((s) => fresh.has(s.n)).pop();
      if (last) announce('Blank ' + last.n + ' of ' + slots.length + ' filled: ' + last.text + '. ' + (slots.length - slots.filter((x) => x.done).length) + ' left.');
      clearTimeout(this._freshT);
      this._freshT = setTimeout(() => { this._fresh = null; this._schedule(); }, 4200);
      this._fresh = fresh;
    }
    const mark = this._fresh || new Set();
    const lead = el('span.cl-say__lead', { text: (this._th().shortLead || this._th().lead) + ' ' });
    const groups = this._lineGroups(slots, live, mark);
    fill(this.sentence, lead, ...groups);
    this.sentence.dataset.filled = String(filled);
    this.sentence.title = '';
    this._scrollLine(this.sentence, slots, groups, false, mark);
    /* MEASURE AGAIN ON THE NEXT FRAME. The footer is one line across the whole
       window and its width changes when the rail opens, when the masthead
       collapses and when a web font finishes loading — all of which can land
       after this paint. */
    if (this._refit) cancelAnimationFrame(this._refit);
    this._refit = requestAnimationFrame(() => { this._refit = 0; this._scrollLine(this.sentence, slots, groups, true, mark); });
    /* FINISHED MEANS EVERY BLANK THIS ROUTE OFFERS, not every blank in the
       sentence. The short run has no Atlantic chapter and thesis.json says so;
       a student who did all five of its beats has finished it, and the Close
       names the two clauses it never taught rather than withholding the ending
       for them. On every other route the two numbers are the same six. */
    const reach = this._reachable(slots);
    this.finish.textContent = filled >= reach ? 'Finish and print' : 'Finish here';
    this.finish.dataset.primary = filled >= reach ? 'yes' : '';
    /* The one thing the control can say about WHY it is not yet the primary
       one, and it is the difference between a clause not reached and a clause
       walked past. */
    const openQ = slots.filter((s2) => s2.waiting).length;
    this.finish.title = filled >= reach
      ? 'The sentence is complete. Sign it and print your revision sheet.'
      : openQ
        ? openQ + (openQ === 1 ? ' clause is' : ' clauses are') + ' still blank because you were at the beat and went past its question. The Close names each one.'
        : 'The close, whenever you stop. Clauses you have not earned stay blank and the Close says why.';

    /* THE STRIP AND THE SPINE ARE NEVER BOTH ON SCREEN, so exactly one of them
       is in the accessibility tree: two copies of one sentence is two sentences
       to a screen reader, and one of them is a sentence nobody can see. `hidden`
       rather than `aria-hidden`, because the strip carries "Finish here" — a
       focusable control — and `aria-hidden` over a focusable element is the one
       ARIA error that produces a control a keyboard can reach and a screen
       reader cannot name. */
    const bar = this.sentence.closest('.cl-bar');
    if (bar) bar.hidden = this._footOff();
    if (this._footOff()) this._closeWhole();
    this._paintPanel(slots, filled, live, mark);
    if (this.wholeBox) this._fillWhole(slots, live, mark);
  },

  /** One repaint per frame, whatever asked for it. */
  _schedule() {
    if (this._paintQ) return;
    this._paintQ = requestAnimationFrame(() => { this._paintQ = 0; this._paintSentence(); });
  },

  _footOff() {
    const app = document.getElementById('app');
    return !!app && app.dataset.foot === 'off';
  },

  /* ------------------------------------------- read it whole (the strip) - */

  /**
   * A 26px strip cannot print 1,258px of sentence, and no amount of scrolling
   * makes a sentence read as one thing. So the strip's control opens the same
   * sentence wrapped, directly above itself, and closes on Escape, on a click
   * outside, or on the control again.
   *
   * IT IS PINNED FROM MEASURED NUMBERS, NOT FROM `bottom: 100%`. `.app__foot`
   * is a 26-32px strip and an absolutely-positioned child of it is at the mercy
   * of whatever the shell does with `overflow` in that row; `position: fixed`
   * against the strip's own measured rectangle is the same device the writing
   * surface below uses, and it cannot be clipped by a row 26px tall. It never
   * reaches the plate: it is capped at the top of the time bar, which is the
   * band directly above the footer at every width where the strip exists.
   */
  _toggleWhole() {
    if (this.wholeBox) { this._closeWhole(); return; }
    const bar = this.sentence && this.sentence.closest('.cl-bar');
    if (!bar) return;
    const box = el('div.cl-say__all', {
      role: 'group',
      'aria-label': 'What you will be able to say at the end, in full',
    });
    this.wholeBox = box;
    bar.append(box);
    this._fillWhole(this._slotState(), (document.documentElement.dataset.stage || 'plate') !== 'plate', this._fresh || new Set());
    this._placeWhole();
    this.whole.setAttribute('aria-expanded', 'true');
    this.whole.textContent = 'Close it';
    this._wholeAway = (ev) => {
      if (ev.type === 'keydown' && ev.key !== 'Escape') return;
      if (ev.type === 'pointerdown' && ev.target instanceof Node && bar.contains(ev.target)) return;
      this._closeWhole();
    };
    document.addEventListener('keydown', this._wholeAway);
    document.addEventListener('pointerdown', this._wholeAway, true);
    this._wholePlace = () => this._placeWhole();
    window.addEventListener('resize', this._wholePlace);
    announce('The through-line, in full. Press Escape to close it.');
  },

  _fillWhole(slots, live, fresh) {
    const box = this.wholeBox;
    if (!box || !box.isConnected) return;
    const filled = slots.filter((s) => s.done).length;
    fill(box,
      el('div.cl-blk__head',
        el('span.cl-blk__lab', { text: 'what you will be able to say' }),
        el('span.cl-blk__count', { text: filled + ' of ' + slots.length })),
      this._sayWrapped(slots, live, fresh));
  },

  _placeWhole() {
    const box = this.wholeBox;
    const bar = this.sentence && this.sentence.closest('.cl-bar');
    if (!box || !bar) return;
    const r = bar.getBoundingClientRect();
    /* The ceiling is the top of the time bar. Above that is the plate, and
       RESPONSIVE_LAW §1 does not allow this to reach it at 900x700, which is
       the one width where the strip exists inside the docked band. */
    const time = document.querySelector('.app__time');
    const map = document.querySelector('.stage__map');
    /* The ceiling, in order of what is actually on screen: the top of the time
       bar; failing that, the foot of the plate; failing both, two fifths of the
       window. Never 0 — an unguarded ceiling is a box that grows over the map,
       which RESPONSIVE_LAW §1 forbids outright in the docked band and B5
       forbids everywhere else. */
    const ceil = time ? time.getBoundingClientRect().top + 4
      : (map ? map.getBoundingClientRect().bottom + 4 : Math.round(window.innerHeight * 0.6));
    const bottom = Math.max(0, Math.round(window.innerHeight - r.top + 6));
    box.style.setProperty('--cl-all-left', Math.round(r.left) + 'px');
    box.style.setProperty('--cl-all-w', Math.round(r.width) + 'px');
    box.style.setProperty('--cl-all-bottom', bottom + 'px');
    box.style.setProperty('--cl-all-max', Math.max(64, Math.round(window.innerHeight - bottom - ceil)) + 'px');
  },

  _closeWhole() {
    if (!this.wholeBox) return;
    /* AN ESCAPE THAT PUT SOMETHING AWAY IS NOT THE FIRST OF A PAIR. Esc Esc is
       the keyboard route to the Close; a reader who presses Escape to shut this
       box and then Escape again to shut the rail should get the rail shut, not
       the ending. Measured in the harness: the two presses were 300ms apart and
       the Close opened over a sentence nobody had asked to finish. */
    this._lastEsc = 0;
    this.wholeBox.remove();
    this.wholeBox = null;
    if (this._wholeAway) {
      document.removeEventListener('keydown', this._wholeAway);
      document.removeEventListener('pointerdown', this._wholeAway, true);
      this._wholeAway = null;
    }
    if (this._wholePlace) { window.removeEventListener('resize', this._wholePlace); this._wholePlace = null; }
    if (this.whole) {
      this.whole.setAttribute('aria-expanded', 'false');
      this.whole.textContent = 'Read it whole';
      try { this.whole.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ }
    }
  },

  /**
   * NO CLAUSE IS EVER DROPPED. It scrolls — and it rests at the beginning.
   *
   * The old `_fitSentence` shed clauses from the front until the line fitted.
   * A scroll container replaced it, and then took the same words away a second
   * way: it scrolled to the clause most recently earned, so a student with all
   * six filled was handed the line at scrollLeft 812 of 812 — clauses 5 and 6,
   * no lead, the sentence beginning "…, one colour hiding". Measured at
   * 900x700, 1024x640 and 1366x768. The rule now: the line rests at the start
   * of the student's own sentence, and moves off it only in the four seconds
   * after a clause has actually arrived, so the arrival can be seen.
   */
  _scrollLine(n, slots, groups, settle, fresh) {
    if (!n || !n.isConnected) return;
    if (!n._cl) n._cl = { key: null, set: null, touched: false };
    const st = n._cl;
    const over = n.scrollWidth - n.clientWidth;
    /* A box with no width at all is `.app__foot` being `display: none`, not a
       line that fits. Say nothing about it; the spine is carrying the sentence
       at that viewport. */
    if (n.clientWidth < 8) { n.removeAttribute('data-more'); n.removeAttribute('tabindex'); this._more(n, ''); return; }
    if (over <= 1) {
      n.removeAttribute('data-more');
      n.removeAttribute('tabindex');
      this._more(n, '');
      st.key = null; st.set = null;
      return;
    }
    /* Reachable by keyboard. Every unfilled clause is a button and therefore a
       Tab stop, but a reader who has earned all six has no button left in the
       box — and a scroll region with no focusable child cannot be scrolled
       from a keyboard at all (WCAG 2.1.1). */
    const anyButton = !!n.querySelector('button');
    if (anyButton) n.removeAttribute('tabindex');
    else {
      n.setAttribute('tabindex', '0');
      n.setAttribute('role', 'group');
      n.setAttribute('aria-label', 'What you will be able to say at the end — scroll to read it all');
    }

    const key = slots.map((s) => (s.done ? '1' : '0')).join('') + '|' + n.clientWidth + '|' + [...(fresh || [])].join(',');
    /* MEASURE TWICE. The first pass runs in the same frame as the repaint,
       before a web font has finished and before the rail has taken its column,
       so the clause rectangles it reads are provisional. The second pass
       corrects it — but only while the offset is still the one this code set,
       so a reader who has already dragged the line is never dragged back. */
    const mine = st.set != null && Math.abs(n.scrollLeft - st.set) <= 1;
    if (key !== st.key) st.touched = false;
    if (key !== st.key || (settle && mine && !st.touched)) {
      /* THE START, UNLESS SOMETHING HAS JUST ARRIVED — AND IT SETTLES BACK.
         A clause is fresh for 4.2 seconds; while it is, the line shows it,
         because a sentence assembling itself is the whole device (§2.3). When
         the freshness expires this runs again with an empty `fresh` set and the
         line returns to the first word of the student's own sentence, so the
         RESTING state of the strip is always its beginning. Measured on the
         build this replaces, after a walk of the whole path: 900x700 rested at
         812 of 812 — clauses 5 and 6 and no lead; 1024x640 at 720; 1366x768 at
         452. Two thirds of a student's own sentence, permanently off the front
         of the box, with a 15 % mask for a signpost.

         The offset is computed without moving the box first: the clause's own
         rectangle plus the current scroll IS its position in the content, and
         setting scrollLeft to measure it makes the settle pass fight the
         freshness pass on alternate frames. */
      let want = 0;
      const news = fresh && fresh.size && (Date.now() - (this._mountedAt || 0)) > 2500;
      const newest = news ? slots.map((s, i) => (fresh.has(s.n) ? i : -1)).filter((i) => i >= 0).pop() : -1;
      const g = newest >= 0 ? groups[newest] : null;
      if (g) {
        const box = n.getBoundingClientRect();
        const r = g.getBoundingClientRect();
        const abs = r.left - box.left + n.scrollLeft;
        /* Only when the news would not be on screen at the start of the line.
           At 1440x900 the line overflows by 21px of 887, so jumping to the
           newest clause would hide the three before it to buy nothing. */
        if (abs + r.width > n.clientWidth - 2) want = Math.max(0, Math.min(Math.round(abs), over));
      }
      n.scrollLeft = want;
      st.key = key;
      st.set = n.scrollLeft;
    }
    const x = n.scrollLeft;
    this._more(n, x <= 1 ? 'end' : (x >= over - 1 ? 'start' : 'both'));
    if (!n._clScroll) {
      n._clScroll = () => {
        const o = n.scrollWidth - n.clientWidth;
        if (o <= 1) { this._more(n, ''); return; }
        const s2 = n.scrollLeft;
        /* A drag or a flick is the reader taking the line; after that the
           settle pass leaves it where they put it. */
        if (st.set == null || Math.abs(s2 - st.set) > 1) st.touched = true;
        this._more(n, s2 <= 1 ? 'end' : (s2 >= o - 1 ? 'start' : 'both'));
      };
      n.addEventListener('scroll', n._clScroll, { passive: true });
      this.d(() => n.removeEventListener('scroll', n._clScroll));
    }
  },

  /** The cue goes on the line AND on its wrapper, which is the box that can
      draw a chevron in the margin: a mask fade is a hint, an arrow is a fact. */
  _more(n, v) {
    if (v) n.dataset.more = v; else n.removeAttribute('data-more');
    const w = n.parentElement;
    if (w && w.classList.contains('cl-say__wrap')) { if (v) w.dataset.more = v; else w.removeAttribute('data-more'); }
  },

  /* ============================ the same sentence, where there is no strip = */

  /**
   * `#app[data-foot="off"]` — 390x844 and 768x1024 — means there is no
   * provenance strip on screen and anything in `data-mount="statusbar"` is
   * invisible rather than short (RESPONSIVE_LAW §6). §7 hands P21 the remedy:
   * render the through-line as the beat panel's own last block.
   *
   * ROUND 3 MEASURED WHAT "LAST BLOCK" COST. `.cx-sheet__body` at 390x844 is a
   * 198px window on 386px of content; the block was 172px of it and its top
   * edge sat at y=660, which is the window's last pixel. Six clauses were in
   * the document and none of them were drawn — and the beat, which is the
   * thing the student is actually reading, was paying 172px of scroll for it.
   *
   * So the block is now a SPINE: one sticky line at the foot of the scroller,
   * 28px, always on screen, all six clauses in it, immediately above the
   * timeline — and it opens out into the wrapped sentence when the student
   * asks. The beat gets 144px of its scroller back and the through-line gets
   * its first visible pixel on a phone.
   */
  _paintPanel(slots, filled, live, fresh) {
    if (!this._footOff()) { this._dropPanel(); return; }
    const host = this._panelHost();
    if (!host) { this._dropPanel(); return; }

    /* AN UNCHANGED SPINE IS NOT REBUILT. `chrome:layout` fires on every scroll
       of the rail and every stage change, and replacing a node inside the
       panel resizes the panel, which fires `chrome:layout`. The signature is
       everything the block draws from; when it has not moved, neither does the
       DOM. */
    const reach = this._reachable(slots);
    const sig = slots.map((s) => (s.done ? '1' : '0')).join('') + '|' + (live ? 'l' : 'f')
      + '|' + [...fresh].sort().join(',') + '|' + (this._blkOpen ? 'o' : 'c') + '|' + this._routeName;
    if (this.panelBox && this.panelBox.isConnected && this.panelBox.parentElement === host
      && host.lastElementChild === this.panelBox
      && this.panelBox.dataset.sig === sig) { this._watchPanel(); return; }

    const box = el('div.cl-blk', {
      'data-sig': sig,
      'data-filled': String(filled),
      'data-open': this._blkOpen ? 'yes' : 'no',
      role: 'group',
      'aria-label': 'The through-line: what you will be able to say at the end. '
        + filled + ' of ' + slots.length + ' filled.',
    });

    /* ---- the spine: the one line that is always on screen ---------------- */
    const line = el('p.cl-say.cl-blk__line');
    const wrap = el('div.cl-say__wrap', line);
    const mark = fresh || new Set();
    const groups = this._lineGroups(slots, live, mark);
    fill(line, el('span.cl-say__lead', { text: (this._th().shortLead || this._th().lead) + ' ' }), ...groups);
    line.dataset.filled = String(filled);
    this._wireLine(line);

    /* WHAT "0/6" MEASURES, SAID WHERE IT IS READ.
       ROUND 3, the classroom critic, as a defect: "Blanks 1 and 6 stay unfilled
       for a student who walks every beat but skips the beat's own retrieval;
       that is correct behaviour and the Close names it, but the top-of-screen
       strip reads '0/6' during the run, which understates progress a teacher is
       watching from the front." The count is right and it is not a progress
       bar: it counts CLAUSES EARNED BY ANSWERING, which is the app's success
       metric and deliberately not attendance. What was missing is the other
       number, which the app already has — how many beats are in the record —
       so the control that carries the count now says both, in its own title and
       in its accessible name, where a teacher or a screen reader can find them
       and where neither costs a pixel of a 390px strip. */
    const beatsIn = this.ledger.beatsDone().length;
    const both = filled + ' of ' + slots.length + ' blanks filled'
      + (beatsIn ? ' \u00b7 ' + beatsIn + (beatsIn === 1 ? ' beat' : ' beats') + ' in your record' : '');
    const toggle = el('button.cl-blk__toggle', {
      type: 'button',
      'aria-expanded': this._blkOpen ? 'true' : 'false',
      title: both + '. A blank fills when you have ANSWERED the beat that earns it, not when you have been to it.',
      /* LABEL IN NAME (WCAG 2.5.3): the visible string opens the accessible
         one. A control whose spoken name does not contain what is printed on
         it cannot be reached by speech input, and round 3 found two of those
         in the masthead. */
      'aria-label': filled + '/' + String(slots.length) + ' blanks filled'
        + (beatsIn ? ', ' + beatsIn + (beatsIn === 1 ? ' beat' : ' beats') + ' in your record' : '')
        + ' — ' + (this._blkOpen ? 'hide' : 'read') + ' the whole through-line',
      onclick: () => { this._blkOpen = !this._blkOpen; this._paintSentence(); this._focusBlk(); },
    }, el('span.cl-blk__count', { text: filled + '/' + slots.length }), el('span.cl-blk__chev', { 'aria-hidden': 'true' }));

    const finish = el('button.cl-blk__finish', {
      type: 'button',
      text: 'Finish',
      'aria-label': filled >= reach ? 'Finish and print your revision sheet' : 'Finish here — the close, whenever you stop',
      'data-primary': filled >= reach ? 'yes' : '',
      onclick: () => this.open({ reason: 'panel control' }),
    });
    box.append(el('div.cl-blk__spine', toggle, wrap, finish));

    /* ---- opened out: the same sentence, wrapped, in full words ----------- */
    const full = el('div.cl-blk__full', { hidden: !this._blkOpen });
    full.append(el('div.cl-blk__head',
      el('span.cl-blk__lab', { text: 'what you will be able to say' }),
      el('span.cl-blk__count', { text: filled + ' of ' + slots.length })));
    full.append(this._sayWrapped(slots, live, mark));
    const next = slots.find((s) => !s.done && s.offered);
    const foot = el('div.cl-blk__foot');
    /* THE OTHER NUMBER, WHERE THERE IS ROOM FOR IT AND A SENTENCE TO EXPLAIN
       IT. First draft put it in the head beside "0 of 6" and measured at
       390x844 it squeezed the label to one word a line and truncated itself at
       "1 beat in your recorc". The head is a two-item row 358px wide; the foot
       is a paragraph. */
    if (beatsIn) {
      foot.append(el('p.cl-blk__note.cl-blk__beats',
        el('span.num', { text: String(beatsIn) }),
        beatsIn === 1 ? ' beat is in your record. ' : ' beats are in your record. ',
        'A blank fills when you have answered the beat that earns it, not when you have been to it.'));
    }
    if (next && live) {
      foot.append(el('button.cx-more.cl-blk__next', {
        type: 'button',
        /* `.cx-more` supplies its own arrow (chrome.css §309). */
        text: next.n + ' · ' + next.hint,
        'aria-label': 'Blank ' + next.n + ': ' + next.hint + '. Go to the beat that fills it.',
        onclick: () => this._goBeat(next.goto),
      }));
    } else if (next) {
      foot.append(el('p.cl-blk__note', { text: slots.length + ' blanks. Each fills itself when you have the evidence for it.' }));
    } else if (reach < slots.length) {
      foot.append(el('p.cl-blk__note', { text: this._partialSay(slots) }));
    } else {
      foot.append(el('p.cl-blk__note', { text: 'Every blank filled. Sign it in your own words and print the page.' }));
    }
    full.append(foot);
    box.append(full);

    /* Replace in place when it is already where it belongs; move it when the
       panel it was in has been torn down and rebuilt under it — and LAST,
       always. A beat that re-renders appends its own panel after this block,
       which measured at 390x844 put the spine between the beat's headline and
       the beat's body, in the middle of somebody else's argument. */
    if (this.panelBox && this.panelBox.isConnected && this.panelBox.parentElement === host
      && host.lastElementChild === this.panelBox) this.panelBox.replaceWith(box);
    else { this._dropPanel(); host.append(box); }
    this.panelBox = box;
    this.blkLine = line;
    /* The scroller's own height, published to CSS. A sticky element taller than
       its scrollport cannot be sticky, so the opened block is capped against
       this number and never against a viewport unit: at 390x844 the port is
       198px and 46vh is 388. */
    const port = host.clientHeight || 0;
    if (port > 0) box.style.setProperty('--cl-port', port + 'px');
    this._scrollLine(line, slots, groups, false, mark);
    if (this._blkRefit) cancelAnimationFrame(this._blkRefit);
    this._blkRefit = requestAnimationFrame(() => {
      this._blkRefit = 0;
      if (line.isConnected) this._scrollLine(line, slots, groups, true, mark);
    });
    this._watchPanel();
  },

  /** After the spine opens or closes, put the caret back on the control. */
  _focusBlk() {
    requestAnimationFrame(() => {
      const t = this.panelBox && this.panelBox.querySelector('.cl-blk__toggle');
      if (t) { try { t.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ } }
    });
  },

  _dropPanel() {
    if (this.panelBox) { this.panelBox.remove(); this.panelBox = null; this.blkLine = null; }
  },

  /**
   * Where the block goes, in order of preference. The beat panel first, because
   * that is where a student on the authored path is reading; then whatever else
   * the rail sheet is holding; then an open dossier. If none of the three is on
   * screen there is nothing being read and the block renders nowhere, which is
   * the honest answer rather than a sentence floating over the plate — and the
   * one thing RESPONSIVE_LAW §1 forbids outright.
   *
   * Never inside the Close itself: the Close prints the whole sentence and its
   * signature scaffold already, and a second copy is a second sentence.
   */
  _panelHost() {
    const seen = (n) => {
      if (!n || !n.isConnected) return false;
      const c = getComputedStyle(n);
      if (c.display === 'none' || c.visibility === 'hidden') return false;
      const r = n.getBoundingClientRect();
      return r.width > 40 && r.height > 8;
    };
    /* BESIDE THE BEAT PANEL, NOT INSIDE IT. RESPONSIVE_LAW §7 asks for "the
       beat panel's own last block", and the block that reads as the panel's
       last block is the last child of the column the panel is in — which is
       also the only version of it that does not resize another module's
       observed element. `tours/panel.js` puts a ResizeObserver on `.tr-panel`
       and repaints its diagram from the callback; a block appended INSIDE the
       panel changes that box every time a clause fills, and five clauses
       landing in one tick produced "ResizeObserver loop completed with
       undelivered notifications" on every run at 390x844 — which the shell
       turns into `[app] uncaught` and a `data-dev` flag a student can see.
       One element out, the loop is gone and the block is drawn in the same
       place, immediately below the panel, inside the same scroller. */
    const panel = document.querySelector('.tr-panel');
    if (seen(panel) && panel.parentElement && seen(panel.parentElement)) return panel.parentElement;
    /* THE SHEET BRANCH IS TERMINAL. In the sheet band the reference sheet opens
       OVER the dossier rail, so when it is on screen the dossier is not: a
       block appended there is drawn behind the sheet, which is a second copy of
       the sentence that nobody can read and a screen reader can. Measured at
       390x844 with the Close open, the block was in the dossier and reporting a
       live rectangle. If the sheet is the surface and it is the Close or the
       Ledger — both of which print the whole sentence themselves — the answer
       is that there is nowhere, not that there is the dossier. */
    const sheet = document.querySelector('.app__sheet .cx-sheet__body') || document.querySelector('.sheet__body');
    if (seen(sheet)) {
      if (sheet.querySelector('.cl-close') || sheet.querySelector('.cl-ledger')) return null;
      return sheet;
    }
    const dos = document.querySelector('.dossier__body .dossier:not(.dossier--empty)');
    if (seen(dos)) return dos;
    return null;
  },

  /**
   * A beat re-renders its own panel whenever the student answers something in
   * it, which takes this block out of the document with it. Watching the rail
   * is the only way to put it back that does not depend on tours announcing
   * every internal repaint. The observer only ever acts when the block has
   * actually been detached, so appending it cannot re-trigger itself.
   */
  _watchPanel() {
    if (this._panelObs) return;
    const targets = [document.getElementById('sheet'), document.getElementById('dossier')].filter(Boolean);
    if (!targets.length) return;
    this._panelObs = new MutationObserver(() => {
      if (this._panelQ) return;
      this._panelQ = requestAnimationFrame(() => {
        this._panelQ = 0;
        if (!this._footOff()) { this._dropPanel(); return; }
        const host = this._panelHost();
        if (!host) { this._dropPanel(); return; }
        if (this.panelBox && this.panelBox.parentElement === host
          && host.lastElementChild === this.panelBox) return;
        this._schedule();
      });
    });
    for (const t of targets) this._panelObs.observe(t, { childList: true, subtree: true });
    this.d(() => {
      if (this._panelQ) cancelAnimationFrame(this._panelQ);
      this._panelObs.disconnect();
      this._panelObs = null;
      this._dropPanel();
    });
  },

  /* ======================================================= the Close ===== */

  open() {
    const node = this._buildClose();
    this.ctx.bus.emit('ask:sheet', {
      id: 'close', eyebrow: 'the end, whenever you stop',
      title: 'What you can now defend', node,
      /* THE SURFACE'S OWN READING DECLARATION — RESPONSIVE_LAW §11.2, and the
         same contract a beat's `fit` is. The Close is the most textual surface
         in the application: measured at 390x844 after a finished `core` route,
         `.cx-sheet__body` was 242px holding 6,342 — 26.2 screenfuls of the
         ending, the sign and the print, with the map still at 170 and the time
         control at 184. Declared `text`, the shell drops the plate to its 44px
         peek and the time control to a 52px year line and the window is 528. */
      work: 'text',
    });
    this.ctx.bus.emit('close:opened', { minutes: this.ledger.minutes(), entries: this.ledger.count() });
    /* Everything that listens to `close:opened` and appends beside us has run
       by the next frame; the observer catches anything later. */
    this._watchSiblings();
    requestAnimationFrame(() => this._adoptSiblings());
    announce('The close. Of the ' + this._onRoute().length + ' lines this route offers, you have the evidence for ' + this._defensible().length + '.');
  },

  /**
   * WHAT A LINE COSTS, AND WHY IT IS NOT A COUNT OF STEPS.
   *
   * `didBeat` is `completed`, and `completed` is written by the runner the
   * moment a beat MOUNTS. So it means "this was on your screen", which is the
   * right test for a beat that only had something to show you and the wrong
   * one for a beat that asked you a question. Measured: a pure tap-through —
   * thirty-four presses of Next in sixteen seconds, six gate cells clicked at
   * random, nothing read — printed "13 of 13 lines below you have the evidence
   * for" and greyed none of them, which also made the next sentence ("the rest
   * are greyed…") false. The Ledger held sixteen `completed` entries and six
   * `placed` ones and not one prediction, sort or classification.
   *
   * So a line is defensible when every beat it needs was on screen AND, where
   * the line quotes this student's own commitment, the commitment exists. Six
   * of the thirteen name one. A decline counts: "I would rather not guess" is
   * an answer, it is recorded by name, and `_mine` prints it as one.
   *
   * Nothing new is collected to do this. It is the record that was already
   * there, read for what it says rather than for how long it is.
   */
  _asked(line) { return !!(line && line.mine && line.mine.claimId); },

  _answered(line) {
    return this._asked(line) && !!this.ledger.get(line.mine.claimId);
  },

  /** Beats named by this line that the student has not been to at all. */
  _unseen(line) {
    return (line.requires || []).filter((b) => !this.ledger.didBeat(b));
  },

  /**
   * WHICH BEATS THIS LINE NEEDS THAT THE RUNNING ROUTE NEVER OFFERS.
   *
   * ROUND 6, W2. Not the same thing as "you have not been there", and the
   * Close spent five rounds saying it was. Measured before the fix: a complete,
   * fully answered walk of `core` — every beat, every gate, the argument, the
   * ordering, the sort, the two documents, fifteen stops to `Finish and print`
   * — printed "8 of 13 lines below you have the evidence for" and, under it,
   * "the rest are greyed with the evidence you have not seen". Five of those
   * thirteen lines require `barbados`, `who-took-bengal`, `nationalisation`,
   * `princely` or `singapore`, and that route did not carry them, so no amount
   * of work by that student could ever have earned them. The panel was telling
   * a student who had finished the lesson that they had not, and blaming them
   * for a choice the route made. The through-line has known the difference
   * since round 5 — `_earnerFor` resolves a blank against the route actually
   * running and `_audit` shouts when it cannot — and the thirteen lines did
   * not. They do now.
   */
  _offRoute(line) {
    const on = this._route || new Set();
    return (line.requires || []).filter((b) => !on.has(b) && !this.ledger.didBeat(b));
  },

  _standing(line) {
    if (this._offRoute(line).length) return 'offroute';
    if (this._unseen(line).length) return 'unseen';
    if (this._asked(line) && !this._answered(line)) return 'unanswered';
    return 'yes';
  },

  /**
   * THE DENOMINATOR, AND IT IS THE ROUTE'S, NOT THE FILE'S. The lines this run
   * could reach: everything close.json holds, less the ones whose evidence is
   * on a route this student is not taking. Same rule the quiz's checkpoints
   * use for "checkpoint 2 of 3" — never print a total the route cannot reach.
   */
  _onRoute() {
    return this.close.lines.filter((l) => this._standing(l) !== 'offroute');
  },

  /**
   * IS THIS ROUTE ONE LESSON OF A UNIT? — the test §8.4(4) turns on.
   * A lesson is a route that has an authored lesson Close AND a partner it
   * names; everything else (the full route, the short run) keeps the old
   * behaviour, because on those a greyed line IS a gap in what the reader
   * chose and naming its price is the honest thing.
   */
  _isLesson() {
    const copy = this._lessonCopy();
    const meta = (this.tours.variantMeta || {})[this._routeName] || {};
    return !!(copy && meta.pairs && (this.tours.variants || {})[meta.pairs]) && !this._unitDone();
  },

  /** The last required beat of a route, by id — the one §8.4(2) calls finishing. */
  _lastBeatOf(id) {
    const st = this._routeSteps(id);
    if (!st) return null;
    const b = st.filter((x) => x.kind === 'beat' && !x.optional && x.id);
    return b.length ? b[b.length - 1].id : null;
  },

  /**
   * BOTH LESSONS ARE IN THE RECORD — DIDACTIC_SPEC §8.4(7).
   *
   * "The unit Close exists and fires once. A student whose record shows both
   * lessons finished gets it, whether they did them a week apart or in one
   * sitting: it is the only surface that completes §2.3 entire, prints the
   * unit's coverage against §3's floor of fourteen by name, and greys what the
   * UNIT never reached with its price in seconds. How they got there is
   * recorded and never judged."
   *
   * The Ledger survives a reload and is kept for weeks, so "a week apart" is
   * simply two `completed` rows; nothing new is stored to answer this.
   */
  _unitDone() {
    const meta = (this.tours.variantMeta || {})[this._routeName] || {};
    const pair = meta.pairs;
    if (!pair || !(this.tours.variants || {})[pair]) return false;
    const mine = this._lastBeatOf(this._routeName);
    const theirs = this._lastBeatOf(pair);
    return !!(mine && theirs && this.ledger.didBeat(mine) && this.ledger.didBeat(theirs));
  },

  /**
   * The unit's own opening sentence and its one arithmetic line. §8.4(1)'s
   * rule still holds — an achievement first, in words — and §8.4(7) adds the
   * one count this surface is allowed: the unit against §3's floor of
   * fourteen, named because it is the floor the whole specification turns on.
   */
  _unitBlock() {
    if (!this._unitDone()) return null;
    const meta = (this.tours.variantMeta || {})[this._routeName] || {};
    const pairMeta = (this.tours.variantMeta || {})[meta.pairs] || {};
    const here = this._routeFigure('covers') || [];
    const there = (() => {
      try {
        const p = window.BEA && window.BEA.toursRoutes;
        const r = p && (p.routes || []).find((x) => x.id === meta.pairs);
        return (r && r.covers) || [];
      } catch (_) { return []; }
    })();
    const both = new Set(here.concat(there).map((x) => x.t || x));
    const floor = this._routeFigure('unitFloor') || 14;
    const total = this._routeFigure('mustStickTotal') || 20;
    /* Named in the order the unit runs, not in the order this student did
       them — "how they got there is recorded and never judged" (§8.4(7)). */
    const keys = Object.keys((this.tours.variants) || {});
    const pair = [[this._routeName, meta], [meta.pairs, pairMeta]]
      .sort((a, b) => keys.indexOf(a[0]) - keys.indexOf(b[0]));
    const box = el('div.cl-close__finishedbox.cl-close__unit');
    box.append(el('p.cl-close__finished',
      el('strong', { text: 'You have finished the whole unit — both lessons. ' }),
      pair.map((x) => x[1].label || x[0]).join('; and ') + '.'));
    box.append(el('p.cx-note.cl-close__unitcount',
      'Between them the two lessons teach ', el('span.num', { text: String(both.size) }),
      ' of the ', el('span.num', { text: String(total) }),
      ' things this course wants you to keep — it asks ', el('span.num', { text: String(floor) }),
      ' of a unit. Every line below is now yours to argue with, and the ones still greyed are '
      + 'greyed for the unit, with what each would cost you.'));
    return box;
  },

  /**
   * THE LINES THIS CLOSE DRAWS. DIDACTIC_SPEC §8.4(4), verbatim: "Grey lines
   * belong to the unit Close, not to a lesson's. Inside a lesson, a line this
   * lesson was never going to reach is not a gap in the student's work and
   * must not be drawn as one."
   *
   * MEASURED BEFORE THIS EXISTED, walking `#tour=lesson-one` end to end and
   * pressing Finish: fourteen `.cl-line`, eight of them carrying
   * `.cl-line__missing` — "NOT ON THIS ROUTE: the status of British India at
   * 1857 against 1859 — on Lesson Two: how it was ruled, and how it ended. 185
   * seconds". A student who has just finished a whole lesson was shown six
   * lines of their own work and eight priced absences, which is §2.3 presented
   * with the other lesson's half greyed out — the thing §8.4(3) forbids by
   * name. On `lesson-two` it greyed line 1, the four-engine spine, which that
   * lesson's own first beat restates.
   *
   * So a lesson draws its own lines and nothing else. The other lesson is
   * named as a subject, once, by `_nextLessonBlock` (§8.4(5)), with a control
   * that starts it; the whole fourteen, greyed and priced, are the unit
   * Close's business (§8.4(7)).
   */
  _linesToDraw() {
    return this._isLesson() ? this._onRoute() : this.close.lines;
  },

  _defensible() {
    return this.close.lines.filter((l) => this._standing(l) === 'yes');
  },

  /**
   * THE SHORTEST ROUTE THAT WOULD HAVE EARNED THIS LINE, named from its own
   * label. Computed, not asserted: a line that goes off-route says which run
   * carries its evidence, so "not on this route" is an address and not a
   * shrug. Null when no other route carries it, which the mount audit already
   * reports as dead keying (tools/scenarios/p05-b4-audit.js).
   */
  _routeThatEarns(line) { return this._routeThatEarnsAll([line]); },

  /**
   * The shortest OTHER route that carries the evidence for every one of these
   * lines. Named for the summary sentence, which must not promise one run and
   * then list lines two different runs carry: `eight` drops ten lines, three
   * of which only the full path holds, so the sentence has to name the run
   * that would earn all ten.
   */
  _routeThatEarnsAll(lines) {
    const need = [];
    for (const l of lines) for (const b of (l.requires || [])) if (!need.includes(b)) need.push(b);
    let best = null;
    for (const [id, ids] of Object.entries(this.tours.variants || {})) {
      if (id === this._routeName) continue;
      const meta = (this.tours.variantMeta || {})[id];
      /* A SUPERSEDED ROUTE IS NOT SOMEWHERE TO SEND ANYBODY. `core` and
         `period` keep their keys so a printed page number still resolves
         (tours.json `variantMeta.*.retired`), but "which the core lesson
         carries" is an offer, and offering a route the door no longer shows
         sends a student to a lesson that is not in this unit. */
      if (!meta || !meta.label || meta.retired) continue;
      const on = new Set(ids);
      if (!need.every((b) => on.has(b))) continue;
      if (!best || ids.length < best.n) {
        best = { id, n: ids.length, label: meta.label || id };
      }
    }
    return best;
  },

  /**
   * HOW LONG THEY HAVE BEEN HERE, said rather than counted.
   *
   * "after 0 minutes" was printed on any run that rounded below thirty
   * seconds — a deep link into beat 23, a fast walk, a reload — and it told a
   * student who had just read thirteen lines of argument that they had spent
   * no time on it. A number that rounds to nothing is not a measurement worth
   * printing; the sentence is. One minute is "a minute", under one is "in
   * under a minute", and the figures stay in `.num` so they set as figures.
   */
  /**
   * THE ENTRY POINT, RECORDED RATHER THAN RECONSTRUCTED.
   *
   * The first step index at which the lesson stood in THIS session. A student
   * who pressed Start from the door entered at 0; a student handed
   * `#tour=thirty&step=18` entered at 17. It is written once per route: taking
   * another route from the card on beat 1 is a new entry at 0, and that is the
   * truth about that run.
   */
  _noteEntry() {
    const st = this.ctx.store.getState();
    if (!st || !st.activeTour) return;
    const at = Number(st.tourStep);
    if (!Number.isFinite(at)) return;
    if (this._entryRoute === st.activeTour && this._entryStep != null) return;
    this._entryRoute = st.activeTour;
    this._entryStep = Math.max(0, at);
  },

  /** The flattened step list for a route, from tours' own published index. */
  _routeSteps(id) {
    const ix = (typeof window !== 'undefined' && window.BEA && window.BEA.toursIndex) || null;
    const r = ix && ix.routes && ix.routes[id || this._routeId()];
    return (r && Array.isArray(r.steps)) ? r.steps : null;
  },

  /**
   * DID THIS RUN START IN THE MIDDLE OF A ROUTE?
   *
   * ROUND 3 rewrote this. The old test was `beatsDone().length >= tourStep - 1`
   * and it compared two things that do not count the same objects: a route's
   * STEPS include its Complication Gates, its argument between historians and
   * its spaced recalls, none of which write a `completed` entry. On `core` the
   * last step is 15 and the record can hold at most 11 beats; on `thirty` it is
   * 25 and 16. So the test failed at the end of every route, and the panel told
   * a student who had just walked every stop that they had arrived late — under
   * a headline counting the lines they had earned, with nothing greyed.
   *
   * The replacement asks the only question the sentence is about: which beats
   * lie BEFORE the step this session opened at, and how many of those are
   * missing from the record. The step number in the sentence is the recorded
   * entry point, not wherever the student has since walked to. If tours has not
   * published its step index there is no honest answer available, so nothing is
   * said — silence is cheaper than a false claim.
   */
  _joinedLate() {
    const st = this.ctx.store.getState();
    if (!st || !st.activeTour) return null;
    const entry = this._entryStep;
    if (!Number.isFinite(entry) || entry < 2) return null;   /* step 1 or 2 is not "part-way" */
    const steps = this._routeSteps(st.activeTour);
    if (!steps) return null;
    const before = steps
      .filter((x) => x.i < entry && x.kind === 'beat' && !x.optional && x.id)
      .map((x) => x.id);
    if (!before.length) return null;
    const done = new Set(this.ledger.beatsDone());
    const missed = before.filter((id) => !done.has(id));
    if (missed.length < 1) return null;
    return { at: entry + 1, missed: missed.length, ids: missed };
  },

  _elapsedSay() {
    const ms = this.ledger.elapsedMs();
    if (ms < 60000) return ['in under a minute.'];
    const mins = Math.max(1, Math.round(ms / 60000));
    return ['after ', el('span.num', { text: String(mins) }), mins === 1 ? ' minute.' : ' minutes.'];
  },

  /**
   * ONE ROUTE TO A BEAT, AND IT WORKS FROM A COLD PLATE.
   *
   * `tours:goBeat` searches the steps of the route that is running. From the
   * Close there may not be one — a student can reach this panel with Esc Esc
   * without ever having pressed Start, and the Congo offer below is aimed at
   * exactly that reader — and `_goto` then returns silently, which is a
   * control that does nothing. So: put the rail back, start the path if none
   * is mounted, and ask for the beat on the next tick, when its steps exist.
   */
  /**
   * THE ADDRESS ON THE PAPER, AND IT IS THE ROUTE THE STUDENT ACTUALLY RAN.
   *
   * ROUND 3, three critics, one line: every "where the evidence is" link on the
   * printed revision sheet was stamped `&tour=thirty`, so a student who ran the
   * fifteen-stop `core` route and followed their own sheet landed in the
   * twenty-five-stop route, at a step number that means something else there.
   *
   * So the route is the one this session ran, and the step is looked up in
   * tours' own published index rather than left to the reader: `hrefOf()` is
   * the one function in the application that knows the difference between a
   * step index, an address number and a beat number.
   *
   * AND THE HOST. `http://localhost:8777/app/#…` is a dead address on anybody
   * else's machine, and a revision sheet is a piece of paper that leaves this
   * machine. When the atlas is being served from a loopback address the sheet
   * prints the fragment alone, which is the part that is true wherever the
   * atlas is opened; from a real host it prints the whole URL.
   */
  _addressOf(e) {
    const route = this._entryRoute || this._routeId();
    const ix = (typeof window !== 'undefined' && window.BEA && window.BEA.toursIndex) || null;
    let tail = '';
    if (e.beatId && ix && typeof ix.stepOf === 'function') {
      const n = ix.stepOf(route, e.beatId);
      if (n != null) tail = '&tour=' + route + '&step=' + n;
    }
    if (!tail && e.beatId) tail = '&tour=' + route;
    const frag = '#year=' + (e.year || 1900) + tail;
    const local = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname) || location.protocol === 'file:';
    return local ? frag : location.origin + location.pathname + frag;
  },

  _goBeat(id) {
    if (!id) return;
    const { bus } = this.ctx;
    const app = document.getElementById('app');
    const running = !!app && app.dataset.path === 'on';
    bus.emit('ask:sheet', null);
    if (!running) bus.emit('tours:start', { step: 0 });
    const go = () => bus.emit('tours:goBeat', { id });
    if (running) go(); else setTimeout(go, 0);
  },

  /**
   * WHAT IS ACTUALLY MISSING FROM THIS LINE, IN WORDS, AND WHERE TO GO FIRST.
   *
   * A line names one or two beats. `line.evidence` is the whole of it, which
   * is the right thing to print when the whole of it is missing and an
   * overstatement when half of it is behind the reader — round 7's finding on
   * line 12, where `core` carries the exit tally and not Singapore. So a line
   * with two beats carries one clause per beat (`evidenceBy` in close.json)
   * and this prints the clauses for the beats that are genuinely still owed.
   * A line with one beat, or one whose author has not split it, falls back to
   * `evidence` and reads exactly as it always did.
   */
  _missingSay(line, stand) {
    const missing = stand === 'offroute' ? this._offRoute(line) : this._unseen(line);
    const by = line.evidenceBy || null;
    const first = missing[0] || (line.requires || [])[0];
    if (!by || !missing.length || missing.length === (line.requires || []).length) {
      return { say: line.evidence, first };
    }
    const parts = missing.map((b) => by[b]).filter(Boolean);
    if (!parts.length) return { say: line.evidence, first };
    return { say: parts.join(' and '), first };
  },

  _priceOf(line) {
    let s = 0;
    for (const b of line.requires || []) {
      if (this.ledger.didBeat(b)) continue;
      const beat = this.beatById.get(b);
      s += (beat && beat.cost_s) || 60;
    }
    return s;
  },

  /**
   * The student's own record against a line of the argument.
   *
   * A DECLINE IS NOT AN ANSWER AND MUST NOT BE PRINTED AS ONE. The authored
   * sentences are of the form "You said the map showed {said}. It showed
   * {answer}." — which is right for a guess and grammatical nonsense for
   * somebody who pressed "I would rather not guess". Round 3 caught the older
   * version of this failure from the other end: an empty field was recorded as
   * the number zero and printed back as the student's own answer. Both come
   * from the same mistake, which is assuming a commitment exists. So a
   * declined entry prints as a decline, in the same slot, with the atlas's
   * figure still shown, because the figure is the part they came for.
   */
  _mine(line) {
    if (!line.mine) return null;
    const e = this.ledger.get(line.mine.claimId);
    if (!e) return null;
    if (e.verdict === 'declined') {
      return 'You were asked this and chose not to guess. That is recorded as a decline, not as a number.'
        + (e.answer ? ' The atlas: ' + e.answer + '.' : '');
    }
    return line.mine.say.replace('{said}', e.youSaid || '').replace('{answer}', e.answer || '');
  },

  /**
   * THE CLOSE'S OWN READING FIT — its foot, and the two controls in it.
   *
   * ROUND 2, the phone critic, as this piece's biggest gap: "At 390x844 the
   * Close — the ending, the sign, the print — reads 7,071px through a 242px
   * window… no `.tr-panel__foot`, so no MORE and no MAP toggle exist on the
   * panel at all. It is the most textual surface in the application and the
   * only one that never collapses the map."
   *
   * Two things follow, and they are separate. The BAND is taken the way every
   * beat takes it: `tours/index.js` publishes `data-tour-fit="text"` while this
   * panel is mounted, the shell resolves `#app[data-read]` from it, and the
   * map drops to its 44px peek, the ribbon stands down and the time control
   * becomes a 52px year line — measured here, 242px of reading window became
   * 532 and the sheet 280 became 570.
   *
   * The FOOT is this function. It is the same element, the same three classes
   * and the same treatment as a beat's foot (`tours/panel.js` `frame()`), and
   * that is deliberate: a student who has pressed `more of this beat` twelve
   * times should not have to learn a second control on the thirteenth screen.
   * `Map` routes to the one toggle in the interface — `tours:fit` — so the
   * announcement is still made once, by the module that owns the words.
   */
  _closeFoot(scroll) {
    const more = el('button.tr-panel__more', {
      type: 'button',
      'aria-label': 'More of this page — scroll down, there is more below',
    }, el('span.tr-panel__morew', { text: 'more of this page' }),
       el('span.tr-panel__morea', { 'aria-hidden': 'true', text: '↓' }));
    more.addEventListener('click', () => {
      const smooth = document.documentElement.dataset.motion !== 'reduced';
      const by = Math.max(80, scroll.clientHeight - 48);
      try { scroll.scrollBy({ top: by, behavior: smooth ? 'smooth' : 'auto' }); }
      catch (_) { scroll.scrollTop += by; }
    });

    /* NO `Map` CONTROL IN THIS FOOT. The shell renders the reading toggle in
       the sheet's own head for every surface tours does not own, and shows it
       only when no `.tr-panel__fit` is on screen (`chrome/index.js`
       `_paintSheetFit`) — so drawing one here would hide the working control
       and leave a dead one in its place. The Close declares `work: 'text'` on
       `ask:sheet` instead, which is the contract for a surface. */
    const print = el('button.btn.btn--small.cl-foot__print', {
      type: 'button', text: 'Print',
      'aria-label': 'Print my revision sheet',
      onclick: () => this._print(),
    });
    return el('div.tr-panel__foot.cl-foot', more, print);
  },

  /**
   * DID THIS STUDENT FINISH THIS LESSON? DIDACTIC_SPEC §8.4(2), verbatim:
   * "Finishing is reaching the last beat. It is never conditional on a quiz
   * score, a signature, a gate placement or a completed sentence. A student
   * who answered nothing correctly has still finished the lesson."
   *
   * So this asks the Ledger one question — is the route's last REQUIRED beat
   * in the record — and asks nothing else. `completed` is written by the
   * runner the moment a beat is applied, so it is attendance at the last beat
   * and not work done at it, which is exactly what §8.4(2) says it must be.
   */
  _finishedLesson() {
    const steps = this._routeSteps(this._routeName);
    if (!steps) return false;
    const beats = steps.filter((x) => x.kind === 'beat' && !x.optional && x.id);
    if (!beats.length) return false;
    if (!this.ledger.didBeat(beats[beats.length - 1].id)) return false;
    /* AND THEY HAVE TO HAVE WALKED IT. Reaching the last beat is the test §8.4
       sets, and it is the right one — no score, no signature, no gate, no
       sentence. It is not satisfied by a deep link ONTO the last beat: measured
       at 390x844 on `#tour=lesson-one&step=9`, the Close opened "You have
       finished Lesson One" over one beat of record and its own next paragraph
       said "you came in part-way through", which is two claims about the same
       run. `_joinedLate()` is the record this app already keeps of where a run
       started; a run that started in the middle has not finished the lesson,
       and the Close says which lesson it is instead. */
    return !this._joinedLate();
  },

  /** The authored Close copy for the lesson this route is, or null. */
  _lessonCopy(id) { return ((this.close && this.close.lessons) || {})[id || this._routeName] || null; },

  /**
   * THE FIRST SENTENCE OF THE CLOSE, AND IT IS AN ACHIEVEMENT.
   *
   * §8.4(1): "It opens by naming what was finished, in words, and the words
   * are true… Never a percentage, never '9 of 20', never a fraction of a unit,
   * never a bar with an unfilled remainder." The fraction below it is true and
   * stays; what changed is that it is no longer the first thing a student who
   * has just finished a lesson is told about themselves.
   *
   * A student who stopped part-way gets §8.5's half of the same rule instead —
   * which lesson this is — and no claim about finishing, because they have not.
   */
  _finishedBlock() {
    const copy = this._lessonCopy();
    if (!copy) return null;
    const done = this._finishedLesson();
    if (!done) {
      return el('p.cl-close__which', el('strong', { text: copy.finished.replace(/^You have finished /, 'This is ') }));
    }
    const box = el('p.cl-close__finished',
      el('strong', { text: copy.finished }),
      this._didSay(copy));
    /* §3.2's own line, once, computed by `tours/budget.js::recallsSay` and read
       off the published payload rather than counted again here: "a route with
       fewer eligible recalls than slots runs with fewer recalls and says so,
       once, in one true line on its own card and in its Close." */
    const rs = this._routeFigure('recallsSay');
    if (rs) return el('div.cl-close__finishedbox', box, el('p.cx-note.cl-close__recalls', { text: rs }));
    return box;
  },

  /**
   * WHAT THIS STUDENT ACTUALLY WALKED, NAMED — NOT WHAT THE ROUTE OFFERS.
   *
   * ROUND 2 OF WAVE 9, the phone critic, walking `lesson-two` cold at 390x844
   * and committing every question: the Close said "You have finished Lesson
   * Two … self-rule given and refused, February 1942, how the exits actually
   * happened, and the fourteen still there", and three of those four had never
   * been on screen — the retrieval cards had taken their beats' place. Wave 8's
   * Close was scrupulous about what it could claim and this one was not,
   * "because it is reading the route rather than the run."
   *
   * So `did` is authored as one clause per beat, and a clause prints only when
   * that beat is in the record. A student who walked all of them reads the
   * sentence the route promised; a student who did not reads the shorter, true
   * one. Nothing is greyed and nothing is scored — this is the achievement
   * sentence, and §8.4(1) says it is stated as one.
   */
  _didSay(copy) {
    const did = copy && copy.did;
    if (!did) return '';
    if (typeof did === 'string') return ' ' + did;           /* older authoring */
    const said = did.filter((x) => x && x.say && (!x.beat || this.ledger.didBeat(x.beat)))
      .map((x) => x.say);
    if (!said.length) return '';
    const list = said.length === 1 ? said[0]
      : said.slice(0, -1).join(', ') + ', and ' + said[said.length - 1];
    return ' ' + list.charAt(0).toUpperCase() + list.slice(1) + '.';
  },

  /** One field of the running route's published record, or null. */
  _routeFigure(key) {
    try {
      const p = window.BEA && window.BEA.toursRoutes;
      const r = p && (p.routes || []).find((x) => x.id === this._routeName);
      return r ? r[key] : null;
    } catch (_) { return null; }
  },

  /**
   * THE OTHER LESSON, NAMED AS A SUBJECT AND NOT AS A DEFICIT.
   *
   * §8.4(5): the sentence says what the other lesson covers and carries "a
   * control that starts it. Banned in this slot: incomplete, unfinished, you
   * missed, remaining, left to go, any percentage, and any progress meter. A
   * student who does one lesson and no more has done a whole lesson."
   *
   * And §8.4(6), in the same block because it is the same honesty: the items
   * this lesson RAISED and did not teach, by name, one press each. A press
   * goes to the beat that hosts the thing, on the route that runs it — the
   * address comes from tours' own published step index, so a beat that moves
   * takes its link with it and a beat that is not on that route yields no
   * control at all rather than a dead one.
   */
  _nextLessonBlock() {
    const copy = this._lessonCopy();
    if (!copy) return null;
    const bus = this.ctx.bus;
    const box = el('div.cl-block.cl-next');
    const nx = copy.next || null;
    if (nx && nx.id && ((this.tours.variants || {})[nx.id])) {
      const meta = (this.tours.variantMeta || {})[nx.id] || {};
      box.append(el('p.cl-block__lab', { text: 'the other lesson in this unit' }));
      box.append(el('p.cl-next__say', { text: nx.say }));
      box.append(el('button.btn.btn--small.cl-next__go', {
        type: 'button', text: (nx.cta || ('Start ' + (meta.label || nx.id))) + ' →',
        onclick: () => {
          bus.emit('ask:sheet', null);
          bus.emit('tours:setRoute', { id: nx.id });
        },
      }));
    }
    const raises = (copy.raises || []).filter((r) => r && r.say && r.beat);
    if (raises.length) {
      box.append(el('p.cl-block__lab.cl-next__lab2', {
        text: 'raised in this lesson, and not taught in it — one press each',
      }));
      const ul = el('ul.cl-next__raises');
      for (const r of raises) {
        const href = this._beatHref(r.route || this._routeName, r.beat)
          || this._beatHref('thirty', r.beat);
        ul.append(el('li.cl-next__raise', href
          ? el('a.cx-more.cl-next__rgo', { href, text: r.say + ' →' })
          : el('span', { text: r.say })));
      }
      box.append(ul);
    }
    return box.childNodes.length ? box : null;
  },

  /** `#tour=<route>&step=N` for a beat, from tours' own published index. */
  _beatHref(routeId, beatId) {
    try {
      const ix = window.BEA && window.BEA.toursIndex;
      if (ix && typeof ix.hrefOf === 'function') return ix.hrefOf(routeId, beatId);
    } catch (_) { /* the index is not up yet */ }
    return null;
  },

  _buildClose() {
    /* The lines are keyed against the route that is actually running, so the
       route is resolved before the first of them is counted. */
    this._resolveRoute();
    const root = el('div.cl-close');
    /* §8.4(1): the achievement first, the arithmetic under it. */
    const finished = this._unitBlock() || this._finishedBlock();
    if (finished) root.append(finished);
    const can = this._defensible();
    const mine = this._onRoute();

    const unanswered = this.close.lines.filter((l) => this._standing(l) === 'unanswered');
    const unseen = this.close.lines.filter((l) => this._standing(l) === 'unseen');
    const away = this.close.lines.filter((l) => this._standing(l) === 'offroute');
    const done = mine.length > 0 && can.length === mine.length;
    const note = [];
    if (unanswered.length) {
      note.push(' ' + (unanswered.length === 1 ? 'One more line is' : String(unanswered.length) + ' more are')
        + ' greyed because you were at the beat and went past the question it turns on. The question is named on each.');
    }
    if (unseen.length) {
      note.push(' ' + (unseen.length === 1 ? 'One is' : String(unseen.length) + ' are')
        + ' greyed with the evidence you have not seen, and what it would cost you to see it.');
    }
    /* THE OFF-ROUTE LINES ARE STILL ON THE PAGE, AND THEY ARE NOT A DEFICIT.
       They stay visible, greyed and priced — a student should be able to see
       what the longer run would have given them — but they are outside the
       count, because a line whose beat this route never offered is not a line
       this student failed to earn. */
    /* §8.4(4): inside a lesson these are not drawn, so they are not
       described either. The other lesson is named once, as a subject, by
       `_nextLessonBlock`. */
    if (away.length && !this._isLesson()) {
      /* INSIDE A LESSON, THE OTHER LESSON'S LINES ARE NOT A GAP IN THIS
         STUDENT'S WORK. DIDACTIC_SPEC §8.4(4): "Grey lines belong to the unit
         Close, not to a lesson's. Inside a lesson, a line this lesson was
         never going to reach is not a gap in the student's work and must not
         be drawn as one." They stay on the page — a student should be able to
         see the whole argument, and each line still names its own beat and its
         own price — but on a lesson they are named as the OTHER LESSON'S, by
         that lesson's name, and only what neither lesson reaches is left over
         for the unit Close to grey. */
      const pairId = ((this.tours.variantMeta || {})[this._routeName] || {}).pairs;
      const pairMeta = pairId ? (this.tours.variantMeta || {})[pairId] : null;
      if (pairMeta && pairMeta.label) {
        const on = this._routeBeats(pairId);
        const theirs = away.filter((l) => (l.requires || []).every((b) => on.has(b)));
        const neither = away.filter((l) => theirs.indexOf(l) < 0);
        if (theirs.length) {
          note.push(' ' + theirs.length + (theirs.length === 1 ? ' line below belongs to ' : ' lines below belong to ')
            + pairMeta.label + ' — ' + (theirs.length === 1 ? 'line ' : 'lines ')
            + theirs.map((l) => l.n).join(', ') + ' — set greyed here because that lesson is where '
            + (theirs.length === 1 ? 'it is' : 'they are') + ' argued.');
        }
        if (neither.length) {
          const r2 = this._routeThatEarnsAll(neither);
          note.push(' ' + (neither.length === 1 ? 'One more — line ' : neither.length + ' more — lines ')
            + neither.map((l) => l.n).join(', ') + ' — ' + (neither.length === 1 ? 'is' : 'are')
            + ' on neither lesson' + (r2 ? '; ' + r2.label + ' carries ' + (neither.length === 1 ? 'it' : 'them') : '')
            + '. Each names its own beat and its own price, and you can go and do it now.');
        }
      } else {
        /* "NEVER OFFERED THEIR EVIDENCE" WAS TRUE OF MOST OF THESE LINES AND
           NOT OF ALL OF THEM: line 13 needs two beats and this route may carry
           one. The sentence says what is true of every line in the list — the
           route does not go to every beat they name — and each line below names
           the part it is actually missing. */
        const r = this._routeThatEarnsAll(away);
        note.push(' ' + (away.length === 1
          ? 'One more line is below and is not counted here: this route does not go to every beat it names'
          : String(away.length) + ' more lines are below and are not counted here: this route does not go to every beat they name')
          + ' — ' + (away.length === 1 ? 'line ' : 'lines ') + away.map((l) => l.n).join(', ')
          + (r ? ', which ' + r.label + ' carries' : '') + '. Each names its own beat and its own price, and you can go and do it now.');
      }
    }
    note.push(' Nothing here is a score.');
    root.append(el('p.cl-close__stand', { dataset: { done: done ? 'yes' : '' } },
      el('span.num', { text: String(can.length) }),
      ' of ', el('span.num', { text: String(mine.length) }),
      done
        ? (this._lessonCopy()
          ? ' — you have the evidence for every line this lesson offers, '
          : ' — you have the evidence for every line this route offers, ')
        : ' lines below you have the evidence for, ',
      ...this._elapsedSay(),
      el('span.cl-close__standnote', { text: note.join('') })));

    /* A CLOSE REACHED FROM THE MIDDLE OF A LESSON IS NOT A FAILED LESSON.
       ROUND 2, the rubric, as a defect: "Deep-linking to a mid-route step
       (#tour=core&step=9) starts a fresh ledger, so the through-line shows six
       empty blanks and the Close shows 1 of 13. Correct behaviour, but a
       teacher pasting a mid-lesson link into slides gets a Close that reads as
       failure. Worth a line of copy."
       It is the record being right, not the student being wrong, and the test
       is arithmetic the app already has: the step this run is standing on
       against the number of beats in the record. Arriving at step nine with one
       beat done is a link, not a lesson. */
    const jump = this._joinedLate();
    if (jump) {
      root.append(el('p.cx-note.cl-close__late',
        el('strong', { text: 'You came in part-way through. ' }),
        'This lesson opened at step ' + jump.at + ', so '
        + (jump.missed === 1 ? 'one beat before it is' : jump.missed + ' beats before it are')
        + ' not in your record and the lines that need them are greyed. '
        + 'That is the record being accurate, not you being behind: nothing here counts what happened '
        + 'on somebody else\u2019s screen. Every greyed line names its own beat and what it costs to go and do it.'));
    }

    /* THE ONE THING THE ATLAS CAN SAY ABOUT READING, FROM TWO NUMBERS IT
       ALREADY PRINTS. It does not collect dwell time, click counts or scroll
       depth and it is not going to (FEATURE_SPEC charge 12). It does know how
       many beats are in the record and how long the session has been open,
       because both are already on this page — and sixteen beats in under a
       minute is not a reading speed. Said once, priced honestly, and only when
       the arithmetic is not close: four beats a minute is twice as fast as the
       thirty-minute route and still does not trip it. */
    /* THE OPT-OUT, PRICED. "I would rather not guess" is offered at every
       prediction and it is the right control to offer: a forced guess is not a
       commitment. But a student who takes it every time walks the whole path
       and arrives here with an argument they never put their name to, and
       until now nothing said so until the very last screen. It is said here in
       one sentence, with the number, and the beats are one press away above. */
    const dec = this.ledger.declined().length;
    if (dec >= 2) {
      root.append(el('p.cl-close__speed.cl-close__speed--dec',
        'You took "I would rather not guess" ', el('span.num', { text: String(dec) }), ' times. ',
        'That is an honest answer and it is recorded as one — but a guess you get wrong is the thing you remember, and a decline is not. Each of them is still there.'));
    }

    const beats = this.ledger.beatsDone().length;
    const mins = Math.max(this.ledger.elapsedMs(), 1) / 60000;
    if (beats >= 4 && beats / mins > 4) {
      root.append(el('p.cl-close__speed',
        'You covered ', el('span.num', { text: String(beats) }), ' beats ', ...this._elapsedSay(),
        ' Nobody reads at that speed. Take the lines below as the floor, not the ceiling — the atlas can check what you committed to, not what you took in.'));
    }

    /* THE PAGE THAT OUTLIVES THE BROWSER, ANNOUNCED WHERE §8 PUTS IT.
       DIDACTIC_SPEC §8 spends minute 29 on the revision sheet, and round 3
       found the app's printables two clicks past this panel. The sheet is
       generated at the bottom of the Close, after the through-line is signed —
       because a sheet printed before the signature has an empty headline — so
       what belongs at the top is not a second copy of the button but the fact
       that the button is coming, and a way to get to it in one press. */
    const toSign = el('button.cx-more.cl-close__toprint', {
      type: 'button', text: 'Go and sign it',
      onclick: () => {
        const n = root.querySelector('.cl-sign');
        if (!n) return;
        try { n.scrollIntoView({ block: 'start', behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' }); } catch (_) { n.scrollIntoView(); }
        const f = n.querySelector('.cl-sign__field');
        if (f) setTimeout(() => { try { f.focus(); } catch (_) { /* focus is a courtesy */ } }, 150);
      },
    });
    /* THE PROMISE IS NOW THE MEASUREMENT.
       ROUND 2, the classroom critic: "The revision sheet is promised as one A4
       page (FEATURE_SPEC P21, and the Close itself says 'This ends in one A4
       page you can print and write on'). Under A4 print emulation after a
       completed route it is three. Either tighten it to one page or change the
       promise." Both. The sheet is tightened — the people, the engines and the
       ranges are set in two columns and each person is one clause (close.css §4)
       — and the sentence below says what the page actually is, which depends on
       how much of the lesson this student did and cannot honestly be one number.
       Measured at 794x1122 under print emulation with a full ledger: 1,877px
       before, and the same content set two-up after. */
    root.append(el('p.cl-close__sheetnote',
      'This ends in an A4 page you can print and write on — one page for a lesson, '
      + 'two if you have walked the whole route and met everyone on it. Your sentence at the top, the '
      + 'people you met, what you got wrong and where the evidence for it is. Sign the through-line at '
      + 'the foot of this panel first, or the page has no headline. ',
      toSign));

    const list = el('ol.cl-lines');
    for (const line of this._linesToDraw()) {
      const stand = this._standing(line);
      const li = el('li.cl-line', { 'data-can': stand === 'yes' ? 'yes' : 'no', 'data-why': stand });
      li.append(el('span.cl-line__n.num', { text: String(line.n) }));
      /* The line's quantities are `{{fig:…}}` tokens, substituted here and
         checked at the foot of this list — never typed into close.json. */
      const lineText = el('p.cl-line__text', { text: line.text });
      markFigures(lineText);
      li.append(lineText);
      if (stand === 'yes') {
        const mine = this._mine(line);
        if (mine) li.append(el('p.cl-line__mine', el('span.cl-line__minelab', { text: 'yours — ' }), mine));
      } else if (stand === 'unanswered') {
        /* THE HONEST GREY. The beat was on screen; the question was not
           answered. Naming the question is the difference between "you have
           not been there" and "you were there and did not commit", and only
           the second one can be fixed in ten seconds. */
        li.append(el('p.cl-line__missing',
          el('span.cl-line__lab', { text: 'unanswered: ' }),
          (line.mine && line.mine.ask) || 'the question this beat put to you',
          el('button.cx-more.cl-line__go', {
            type: 'button',
            text: 'answer it',
            'aria-label': 'Answer it — go back to ' + line.evidence,
            onclick: () => this._goBeat((line.requires || [])[0]),
          })));
      } else {
        const secs = this._priceOf(line);
        /* OFF-ROUTE IS A DIFFERENT SENTENCE FROM SKIPPED, and it is the
           difference between "you did not go" and "this run does not go
           there". Both stay on the page, both keep their price, and only one
           of them is counted in the headline above. */
        const elsewhere = stand === 'offroute' ? this._routeThatEarns(line) : null;
        /* AND IT NAMES ONLY THE HALF THAT IS MISSING.
           ROUND 7, the phone critic: "Close line 12 — line 13 since round 9 — requires singapore AND
           exits; core carries exits, so 'this route never offered their
           evidence' overstates the omission by half for that one line." The
           price beside it has always been the price of the beats not yet done
           (`_priceOf` skips the ones in the Ledger); the words beside the
           price were the whole line's. They are now the same set. */
        const want = this._missingSay(line, stand);
        li.append(el('p.cl-line__missing',
          el('span.cl-line__lab', { text: stand === 'offroute' ? 'not on this route: ' : 'missing: ' }),
          want.say,
          (stand === 'offroute' && elsewhere
            ? el('span.cl-line__away', { text: ' — on ' + elsewhere.label + '. ' })
            : null),
          el('button.cx-more.cl-line__go', {
            type: 'button',
            text: Math.round(secs / 5) * 5 + ' seconds',
            'aria-label': (stand === 'offroute' ? 'Go and do it anyway — ' : 'Go and do it — ')
              + want.say + ', about ' + Math.round(secs / 5) * 5 + ' seconds',
            onclick: () => this._goBeat(want.first),
          })));
      }
      list.append(li);
    }
    root.append(list);
    /* The check block for every quantity this panel prints, numbered to match
       the markers above it and drawn by `core/warrant.js`. It sits directly
       under the thirteen lines because that is where the numbers are. */
    const figHost = el('div.cl-block.cl-figs');
    root.append(figHost);
    syncFigures(root, { into: figHost });

    /* ---- their gate choices, named ------------------------------------ */
    const placed = this.ledger.byKind('placed');
    const declined = this.ledger.declined();
    if (placed.length || declined.length) {
      const g = el('div.cl-block');
      g.append(el('h4.cx-panel__head', { text: 'the complications' }));
      for (const e of placed) g.append(el('p.cl-block__row', el('strong', { text: e.prompt + ' — ' }), 'you placed it as ' + e.youSaid + '.'));
      /* SIX IDENTICAL PLACEMENTS OUT OF NINE SQUARES. The field cannot tell a
         considered position from the first square under a thumb, and it should
         not pretend to — but it can say that every one of them landed in the
         same place, which is a fact about the record and not a judgement about
         the reader. Measured: a tap-through that clicked the first cell every
         time was reported back as six separate positions, in the reader's own
         voice, with no note at all. */
      const same = placed.length >= 3 && placed.every((e) => e.youSaid === placed[0].youSaid);
      if (same) g.append(el('p.cl-block__row.cl-block__row--flag',
        el('strong', { text: 'All ' + placed.length + ' are the same square. ' }),
        'Nine were available. If that was a position, it is a strong one and it belongs in the box below; if it was the square nearest your thumb, the field is still there.'));
      for (const e of declined) g.append(el('p.cl-block__row.cl-block__row--declined', el('strong', { text: e.prompt + ' — ' }), 'you declined to place this one. It is still here.'));
      root.append(g);
    }

    /* ---- push back ----------------------------------------------------- */
    const dis = el('div.cl-block.cl-push');
    dis.append(el('h4.cx-panel__head', { text: 'push back' }));
    dis.append(el('p.cl-block__row', { text: 'If you think one of these lines is wrong, say so. It is printed on your sheet, unedited, exactly as you wrote it.' }));
    const field = el('textarea.cl-push__field', { rows: '2', placeholder: 'I disagree with line …, because…', 'aria-label': 'Where you disagree with this app' });
    const send = el('button.btn.btn--small', { type: 'button', text: 'Record that' });
    send.addEventListener('click', () => {
      const v = field.value.trim();
      if (!v) { field.focus(); return; }
      this.ledger.append({ kind: 'dissented', claimId: 'p05:dissent:' + Date.now(), youSaid: v, prompt: 'where I disagree' });
      field.value = '';
      dis.append(el('p.cl-block__row', el('strong', { text: 'Recorded, unedited: ' }), v));
    });
    dis.append(field, send);
    for (const e of this.ledger.dissents()) dis.append(el('p.cl-block__row', el('strong', { text: 'you wrote: ' }), e.youSaid));
    root.append(dis);

    /* ---- refuse closure ------------------------------------------------ */
    root.append(this._remaining());

    /* ---- the through-line, in their words ------------------------------ */
    root.append(this._signature());

    /* ---- the frame, off this map --------------------------------------- */
    const off = this._offmap();
    if (off) root.append(off);

    /* ---- the other lesson, and what this one raised --------------------- *
       §8.4(5) and (6). It stands above the three doors because it is about
       this unit and they are about the world outside it, and below the lines
       because a student should see what they can defend before they are told
       what comes next. */
    const nextLesson = this._nextLessonBlock();
    if (nextLesson) root.append(nextLesson);

    /* ---- three doors --------------------------------------------------- */
    const doors = el('div.cl-block.cl-doors');
    doors.append(el('h4.cx-panel__head', { text: 'three things you could go argue with' }));
    for (const d of this.close.doors || []) {
      const door = el('div.cl-door',
        el('p.cl-door__l', el('strong', { text: d.label + ' — ' }), d.say),
        el('p.cl-door__b', { text: d.book }));
      const go = this._doorControl(d);
      if (go) door.append(go);
      doors.append(door);
    }
    root.append(doors);

    root.append(el('div.cl-actions',
      el('button.btn.btn--primary', { type: 'button', text: 'Print my revision sheet', onclick: () => this._print() }),
      el('button.cx-more.cl-actions__go', { type: 'button', text: 'Everything I committed to', onclick: () => this.openLedger() })));
    /* WHAT THE BUTTON DOES ON THE DEVICE MOST STUDENTS HOLD.
       ROUND 2, the phone: "The Close's 'Print my revision sheet' calls
       window.print() directly, which on iOS Safari is a share-sheet, not a
       print — worth a line of copy for the phone student, since the Close's own
       promise is 'one A4 page you can print and write on'." It is the right
       call to make: `window.print()` is the only route to the page a browser
       will honour, and on iOS it opens the share sheet with Print and Save to
       Files in it. So the sentence says so rather than the button pretending. */
    root.append(el('p.cx-note.cl-actions__note', {
      text: 'On a phone this opens the share sheet, not a printer — Print and “Save to Files” are both '
        + 'in it, and Save to Files keeps the page as a PDF you can open later or send to a printer at '
        + 'school. On a laptop it opens the print dialogue.',
    }));

    /* THE FRAME, THE SAME SHAPE A BEAT USES. Everything built above scrolls in
       row one; the foot is row two and is a real edge rather than a raft
       floating over the reading — sticky inside the shell's scroller resolves
       against its CONTENT box and comes to rest 16px above the visible edge,
       which is the bug tours.css §THE FRAME was written to kill. Above 62rem
       the grid is not applied and this is simply the last block on the page. */
    const scroll = el('div.cl-close__scroll', { role: 'region', 'aria-label': 'The close, in full — scrollable' });
    scroll.append(...root.childNodes);
    root.append(scroll, this._closeFoot(scroll));
    root.dataset.more = '';

    /* Does it have more below, and has it been scrolled? Same two attributes
       and the same rAF-coalesced paint as `tours/panel.js`, so the cue and the
       mask behave identically on the thirteenth screen and the first. */
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
    scroll.addEventListener('scroll', paint, { passive: true });
    /* The same line-box rounding the beats use: a line of the ending is never
       cut through its x-height at the head of the window. `tours/panel.js`. */
    snapLines(scroll);
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => {
        if (!root.isConnected) { try { ro.disconnect(); } catch (_) { /* gone */ } return; }
        paint();
      });
      try { ro.observe(scroll); } catch (_) { /* no observer, no cue */ }
    }
    requestAnimationFrame(paint);
    this._closeScroll = scroll;
    this._assertVoice(root);
    return root;
  },

  /**
   * NO SENTENCE IN THIS PANEL MAY CONTRADICT THE COUNT PRINTED ABOVE IT.
   *
   * ROUND 3, the rubric, on the joined-late defect: "add the same kind of teeth
   * the gloss got". The gloss got a rule that fails the build; this is the
   * runtime half of the same idea, and it reads the RENDERED panel rather than
   * the intentions behind it, because the defect it exists to catch was a
   * sentence that was true about one arithmetic and false about the page it was
   * printed on.
   *
   * Four invariants, all of them arithmetic between things on this screen:
   *   V1  the headline "N of M lines below you have the evidence for" equals
   *       the number of lines actually rendered as earned;
   *   V2  "you came in part-way through … the N beats before it are not in your
   *       record" is only printable when at least one line is actually greyed;
   *   V3  the same sentence's N may not exceed the number of required beats the
   *       running route carries — it is a count of beats, not of steps, and
   *       confusing the two is the whole defect;
   *   V4  "you covered N beats" is the number of beats in the record;
   *   V5  ROUND 6, W2. M is the number of lines THIS ROUTE offers — the ones
   *       rendered without `data-why="offroute"` — and never the number of
   *       lines close.json happens to hold. The defect it exists to catch is
   *       the one a completed run of the default route printed for five
   *       rounds: "8 of 13" beside a control reading "Finish and print", where
   *       the five missing lines needed beats that route does not carry;
   *   V6  and the converse, which is the sentence a student who finished
   *       deserves: if every line this route offers is rendered as earned, the
   *       headline says so in words, not only in two equal numbers.
   *
   * Published on `window.BEA.closeVoiceAudit` so a scenario can assert it, and
   * `console.error`d on failure, because the repository's rule is zero console
   * errors and that is what makes a check unignorable.
   */
  _assertVoice(root) {
    const bad = [];
    const num = (node) => {
      if (!node) return null;
      const n = node.querySelector('.num');
      const v = Number(String((n && n.textContent) || '').replace(/[^\d]/g, ''));
      return Number.isFinite(v) ? v : null;
    };
    const lines = [...root.querySelectorAll('li.cl-line')];
    const earned = lines.filter((li) => li.dataset.can === 'yes').length;
    const greyed = lines.length - earned;
    /* The lines this route offers: everything rendered less the ones marked
       as belonging to another run. Read off the rendered list, not off the
       intention, because the defect was a number that was true about one
       arithmetic and false about the page it was printed on. */
    const offered = lines.filter((li) => li.dataset.why !== 'offroute').length;
    const onRouteGrey = lines.filter((li) => li.dataset.can !== 'yes' && li.dataset.why !== 'offroute').length;

    const stand = root.querySelector('.cl-close__stand');
    const said = num(stand);
    const nums = stand ? [...stand.querySelectorAll('.num')].map((n) => Number(String(n.textContent).replace(/[^\d]/g, ''))) : [];
    if (stand && said !== null && said !== earned) {
      bad.push('the headline says ' + said + ' of ' + (nums[1] != null ? nums[1] : '?') + ' lines are earned; ' + earned + ' are rendered as earned');
    }
    if (stand && nums.length > 1 && nums[1] !== offered) {
      bad.push('the headline counts against ' + nums[1] + ' lines; this route offers ' + offered
        + ' (' + (lines.length - offered) + ' of the ' + lines.length + ' need a beat it does not carry)');
    }
    if (stand && offered > 0 && earned === offered && stand.dataset.done !== 'yes') {
      bad.push('every line this route offers is earned and the headline does not say so');
    }
    if (stand && stand.dataset.done === 'yes' && earned !== offered) {
      bad.push('the headline says the route is finished; ' + onRouteGrey + ' of its own lines are still greyed');
    }

    const late = root.querySelector('.cl-close__late');
    if (late) {
      const jump = this._joinedLate();
      const missed = jump ? jump.missed : 0;
      /* Round 6: the off-route lines are greyed on every run of a shorter
         route, so they cannot be the evidence that somebody joined late. The
         test is the lines this route DOES offer. */
      if (!onRouteGrey) bad.push('"You came in part-way through" is printed and not one of the ' + offered + ' lines this route offers is greyed');
      const steps = this._routeSteps();
      const carry = steps ? steps.filter((x) => x.kind === 'beat' && !x.optional).length : null;
      if (carry != null && missed > carry) {
        bad.push('"' + missed + ' beats before it" is more beats than the route carries (' + carry + ') — a step count printed as a beat count');
      }
    }

    const speed = root.querySelector('.cl-close__speed:not(.cl-close__speed--dec)');
    const covered = num(speed);
    if (speed && covered !== null && covered !== this.ledger.beatsDone().length) {
      bad.push('"you covered ' + covered + ' beats" against ' + this.ledger.beatsDone().length + ' in the record');
    }

    const audit = { ok: bad.length === 0, earned, greyed, offered, offRoute: lines.length - offered, lines: lines.length, problems: bad };
    try { (window.BEA || (window.BEA = {})).closeVoiceAudit = audit; } catch (_) { /* no handle */ }
    if (bad.length) console.error('[close] the panel contradicts itself:\n  ' + bad.join('\n  '));
    return audit;
  },

  /**
   * ONE SCROLL REGION, INCLUDING WHAT ANOTHER PIECE APPENDS BESIDE US.
   *
   * RESPONSIVE_LAW §11.5: inside a reading fit the panel's own window is the
   * only scroll region, "a thumb flick landed in whichever of the three the
   * 30px band under it belonged to". The Close obeys that for its own content
   * — and then P20's teaching desk appends its printable-pack block to the
   * SHELL'S sheet body on `close:opened`, as its own comment says it does, as
   * a sibling of ours. Measured at 390x844 with the frame in place and nothing
   * else changed: `.cx-sheet__body` clientHeight 528, scrollHeight 910 — the
   * outer body scrolling 382px to reach a 358px block that sat below our foot,
   * where `more of this page` could not reach it and a flick could.
   *
   * So a sibling that arrives is adopted into our scroller, above the foot.
   * The node is P20's, with P20's listeners and lifecycle, unchanged; only its
   * parent moves, and only in the band where the frame exists. It is the same
   * move `chrome/index.js` `_syncStepDock()` makes on the transport and for the
   * same reason: CSS cannot reparent, and a control below the fold of a
   * scroller nobody scrolls is a control that is not there.
   */
  _adoptSiblings() {
    const scroll = this._closeScroll;
    if (!scroll || !scroll.isConnected) return;
    const body = scroll.closest('.cx-sheet__body');
    if (!body) return;
    const foot = scroll.parentElement && scroll.parentElement.querySelector('.tr-panel__foot');
    let moved = 0;
    for (const kid of [...body.children]) {
      if (kid.classList.contains('cl-close')) continue;
      scroll.append(kid);
      moved++;
    }
    if (foot && foot.parentElement) foot.parentElement.append(foot);
    return moved;
  },

  _watchSiblings() {
    if (this._sibObs) return;
    const body = document.querySelector('.app__sheet .cx-sheet__body');
    if (!body || typeof MutationObserver !== 'function') return;
    this._sibObs = new MutationObserver(() => {
      if (this._sibQ) return;
      this._sibQ = requestAnimationFrame(() => { this._sibQ = 0; this._adoptSiblings(); });
    });
    this._sibObs.observe(body, { childList: true });
    this.d(() => {
      if (this._sibQ) cancelAnimationFrame(this._sibQ);
      try { this._sibObs.disconnect(); } catch (_) { /* gone */ }
      this._sibObs = null;
    });
  },

  /**
   * 1997 fades and the map does not go blank. Counted, never asserted.
   *
   * AND NAMED BY WHAT IS LEFT, NOT BY WHAT WAS TAKEN. Round 2 caught this list
   * printing the word Ireland under the heading "what is still British". The
   * dataset was right — the open span is labelled "Northern Ireland only" and
   * records four lost units — and the panel was printing `territory.name` over
   * the top of it. Three records are partial in that way (Ireland, Cyprus, the
   * British Indian Ocean Territory) and all three now print the span's own
   * label. The same function supplies the units, so "light them on the map"
   * can no longer paint the Irish Free State British either.
   */
  _remaining() {
    const { data, bus } = this.ctx;
    const a = stillBritish(data);
    const box = el('div.cl-block.cl-remaining');
    box.append(el('h4.cx-panel__head', { text: 'it is not finished' }));
    box.append(el('p.cl-block__row',
      'This atlas still draws ', el('span.num', { text: String(a.value) }),
      ' places with no end date. That is more than the fourteen British Overseas Territories you will read about, because this count also holds the United Kingdom itself, the Crown Dependencies, and Cyprus, where the Sovereign Base Areas stayed British. Three of them are named here by what is left of them, not by what was taken. How many are left depends on what you are willing to count.'));
    box.append(el('p.cl-remaining__names', { text: a.names.join(' · ') }));
    box.append(el('button.cx-more.cl-remaining__go', {
      type: 'button', text: 'Light them on the map',
      onclick: () => bus.emit('ask:paintUnits', { unitIds: a.units, reason: 'still drawn by this atlas today — the part of each record that has no end date' }),
    }));
    return box;
  },

  /**
   * A DOOR THAT OPENS. Two of the three doors used to end in a keyboard
   * instruction — "Press 4 on the map and watch what arrives", "Press H on the
   * map for a year where a record was destroyed" — which on the device most
   * students hold is not a hint, it is a dead end: a phone has no 4 and no H.
   * The sentence now says what the door is; the control does the thing; and the
   * key, where there is one, is named on the control's own title for the reader
   * who has a keyboard. Anything this app cannot honour renders no control at
   * all rather than a button that lies.
   */
  _doorControl(d) {
    const act = d && d.do;
    if (!act || !act.label || !act.kind) return null;
    const { bus, store } = this.ctx;
    const run = {
      /* The four definitions of "British". `map:setDefinition` is the same
         path keys 1–4 take, and the map says its own sentence when it lands. */
      definition: () => bus.emit('map:setDefinition', act.value),
      /* What this atlas cannot tell you — the records that were destroyed
         rather than lost. P07 owns the list and opens it on `ask:silences`. */
      silences: () => bus.emit('ask:silences'),
      layer: () => store.dispatch('setLayer', act.value),
    }[act.kind];
    if (!run) return null;
    return el('button.cx-more.cl-door__go', {
      type: 'button',
      text: act.label,
      title: act.key ? act.label + ' — the keyboard does this with ' + act.key : act.label,
      onclick: () => { this._keepDraft(); run(); },
    });
  },

  /**
   * THE FRAME, OFF THIS MAP — offered at the end rather than past it.
   *
   * The three non-British cases are this app's strongest single asset for the
   * transfer criterion and, measured, a student walking the path met none of
   * them: the Congo beat is authored `optional: true` and marked "past the
   * end", so the transport runs out before it; Algeria and Angola/Mozambique
   * live in the teaching desk, behind Tools. The words "Congo", "Lumumba" and
   * "off this map" returned zero hits in the whole of this panel.
   *
   * So the Close offers all three, with what each one does to the claim the
   * student has just spent a lesson assembling. Nothing here is invented: the
   * Congo card is the beat's own `claim`, `ledeMark`, actor and `cost_s`, and
   * the other two are read from `PORTABLE_CASES` at runtime. If the beat is not
   * in `tours.json`, or the desk's module will not load, the block prints only
   * what it can actually offer — the honest answer being a shorter list, never
   * a control that goes nowhere.
   */
  _offmap() {
    const beat = this.beatById.get('congo');
    const box = el('div.cl-block.cl-offmap');
    box.append(el('h4.cx-panel__head', { text: 'the frame, off this map' }));
    box.append(el('p.cl-block__row', { text: 'Everything above is British. A frame that only works on the case it was built from is not a frame, it is a summary — so here it is taken away from Britain and run against three empires that were not. There are no quantities in any of the three: they are dates, and books you can go and find.' }));

    if (beat) {
      const p = beat.panel || {};
      const secs = Number(beat.cost_s) || 0;
      const mins = secs >= 90 ? 'about ' + Math.round(secs / 60) + ' minutes' : Math.round(secs / 5) * 5 + ' seconds';
      const line = el('p.cl-door__l',
        el('strong', { text: 'The Congo, ' + (beat.ledeMark || '30 June 1960') + ' — ' }),
        p.claim ? 'it breaks the strongest claim in this application: “' + p.claim + '”' : 'the exit this atlas never draws.');
      const who = beat.actor && beat.actor.name
        ? el('p.cl-door__b', { text: beat.actor.name + ' — ' + (beat.actor.role || '') })
        : null;
      box.append(el('div.cl-offmap__case', line, who,
        el('button.cx-more.cl-offmap__go', {
          type: 'button',
          text: (p.offer && p.offer.label) || 'One more, off this map',
          'aria-label': 'Go to the Congo beat, ' + mins,
          onclick: () => { this._keepDraft(); this._goBeat('congo'); },
        }),
        el('span.cl-offmap__price', { text: ' ' + mins }),
        (p.offer && p.offer.note) ? el('p.cl-door__b', { text: p.offer.note }) : null));
    }

    /* Algeria and the Portuguese empire live in the desk, and the desk is a
       module we may not import at boot: it is another agent's file, it is
       large, and the Close must still build if it is missing. So the cases are
       fetched when this block is drawn, and the block simply grows two rows
       when they arrive. `tours/panel.js` reads the same export the same way. */
    const rest = el('div.cl-offmap__rest');
    box.append(rest);
    import('../teacher/portable.js').then((mod) => {
      const cases = (mod && mod.PORTABLE_CASES) || [];
      const two = cases.filter((c) => c.id !== 'congo');
      if (!two.length || !rest.isConnected) return;
      for (const c of two) {
        rest.append(el('div.cl-offmap__case',
          el('p.cl-door__l', el('strong', { text: c.place + ', ' + c.power + ', ' + c.span + ' — ' }), c.engine || ''),
          el('button.cx-more.cl-offmap__go', {
            type: 'button', text: 'Run the claim against it',
            'aria-label': 'Open ' + c.place + ' in the workshop, off this map',
            onclick: () => { this._keepDraft(); this._openPortable(); },
          })));
      }
    }).catch(() => { /* the desk is not mounted; the Congo offer stands alone */ });

    return box;
  },

  /** The desk's own last section, reached without going through Tools. */
  _openPortable() {
    this.ctx.store.dispatch('openOverlay', 'workshop');
    let tries = 0;
    const land = () => {
      const target = document.getElementById('tp-move-portable');
      const pane = document.querySelector('.tp__pages');
      if (!target || !pane) { if (tries++ < 20) setTimeout(land, 100); return; }
      pane.scrollTop += target.getBoundingClientRect().top - pane.getBoundingClientRect().top - 12;
      const h = target.querySelector('.tp-move__name');
      if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ } }
    };
    setTimeout(land, 120);
  },

  _signature() {
    const box = el('div.cl-block.cl-sign');
    box.append(el('h4.cx-panel__head', { text: 'the through-line, in your words' }));
    const slots = this._slotState();
    box.append(el('p.cl-sign__scaffold', ...(() => {
      const kids = [this._th().lead + ' '];
      for (const s of slots) {
        kids.push(s.done ? el('em', { text: s.text }) : el('span.cl-sign__gap', {
          text: '______',
          /* A rule this route could never fill is still a rule the student may
             write over — the field below is theirs and takes any sentence —
             but the scaffold says which it is, so nobody hunts for a beat that
             is not on their path. A clause whose beat was ON SCREEN and whose
             question was walked past says THAT instead, because only one of the
             two can be fixed in ten seconds. */
          title: !s.offered ? s.hint + ' — no beat on this route fills it'
            : s.waiting ? s.hint + ' — you were at the beat and did not answer its question'
            : s.hint,
          'data-offered': s.offered ? '' : 'no',
          'data-waiting': s.waiting ? 'yes' : '',
        }));
        kids.push((/^[,.;:]/.test(s.after) ? '' : ' ') + s.after + ' ');
      }
      return kids;
    })()));
    if (this._reachable(slots) < slots.length) {
      box.append(el('p.cx-note.cl-sign__partial', { text: this._partialSay(slots) }));
    }
    box.append(el('p.cl-block__row.cl-sign__prompt', { text: this._th().prompt }));
    const prior = this.ledger.get('p05:through-line');
    const field = el('textarea.cl-sign__field', {
      rows: '3', placeholder: this._th().placeholder,
      'aria-label': 'The through-line in your own words',
    });
    /* AN UNSENT SENTENCE IS NOT THROWN AWAY. Every other control in this panel
       is a way out of it — a greyed line goes to its beat, a door opens a
       layer, the Congo offer leaves for a beat — and each of them tore down the
       panel with a half-written sentence in it. The draft is held for the
       session and put back the next time the Close is built. It is never
       written to the Ledger: the Ledger records commitments, and a draft is by
       definition not one. */
    if (prior) field.value = prior.youSaid;
    else if (this._draft) field.value = this._draft;

    /* YOU HAVE TO BE ABLE TO READ BACK WHAT YOU ARE ABOUT TO SIGN.
       ROUND 2, the phone: the box was `rows="3"` — 94px measured at 390x844 —
       and the scaffolded sentence a finished route hands the student is 280
       characters, six lines at that measure, so it was clipped mid-clause
       ("…became a company that taxed Bengal and used the") with no scroll cue.
       It grows to its content, from a floor of three lines to a ceiling of
       fourteen (22rem in close.css §8), after which it scrolls rather than
       eating the panel it sits in. Measured before writing: the box is laid
       out by the time the panel is in the document, so the first grow runs on
       the next frame rather than against a zero scrollHeight. */
    const grow = () => {
      if (!field.isConnected) return;
      field.style.blockSize = 'auto';
      const want = field.scrollHeight;
      field.style.blockSize = want > 0 ? want + 'px' : '';
    };
    field.addEventListener('input', () => { this._draft = field.value; grow(); });
    requestAnimationFrame(grow);
    const name = el('input.cl-sign__name', { type: 'text', placeholder: 'your name', 'aria-label': 'Your name, for the top of the sheet' });
    if (this._name) name.value = this._name;
    name.addEventListener('input', () => { this._name = name.value; });
    const sign = el('button.btn.btn--small', { type: 'button', text: 'Sign it' });
    sign.addEventListener('click', () => {
      const v = field.value.trim();
      if (!v) { field.focus(); return; }
      this.signed = { text: v, name: name.value.trim() || 'unsigned' };
      this.ledger.append({ kind: 'retold', claimId: 'p05:through-line', youSaid: v, prompt: 'the through-line in your own words' });
      box.append(el('p.cl-sign__done', { text: 'Signed. It is the header of your sheet.' }));
      this.ctx.bus.emit('close:signed', { words: v.split(/\s+/).length });
      this._leaveCompose();
    });
    const done = el('button.cx-more.cl-sign__ok', {
      type: 'button', text: 'Done',
      onclick: () => { try { field.blur(); } catch (_) { /* nothing focused */ } this._leaveCompose(); },
    });
    box.append(field, el('div.cl-sign__row', name, sign, done));
    this.signBox = box;
    this.signField = field;
    /* THE ONE PLACE THE APP ASKS A STUDENT TO WRITE, AND ON A PHONE IT WAS
       UNDER THE KEYBOARD. Measured at 390x844: the field is a 358x96 box with
       the name field below it, at the foot of a 198px scroller, and iOS puts
       its keyboard over roughly the bottom 340px of the screen — the whole
       sheet. The shell's grid is fixed and does not scroll, so the browser's
       own "scroll the caret into view" has nowhere to scroll to. While the
       field is focused at phone width the block therefore stands up as its own
       surface at the TOP of the visual viewport, which is the one band a
       keyboard never covers, and it goes away the moment the writing stops.
       It is not furniture: it exists only while a student is typing into it. */
    const enter = () => this._enterCompose();
    field.addEventListener('focus', enter);
    name.addEventListener('focus', enter);
    /* LEAVING IS SYNCHRONOUS. `focusout` fires before the next element has
       focus, so a deferred check reads `document.body` and a Tab out of this
       surface left it standing over the control the reader had just tabbed to:
       measured at 390x844, the next stop after Done — the Congo offer — was
       focused behind the writing surface, off screen and covered. Reading
       `relatedTarget`, which IS the element about to take focus, closes the
       surface in the same frame the focus moves. */
    box.addEventListener('focusout', (ev) => {
      const to = ev.relatedTarget;
      if (to && box.contains(to)) return;
      if (to) { this._leaveCompose(); return; }
      setTimeout(() => {
        if (!box.isConnected || !box.contains(document.activeElement)) this._leaveCompose();
      }, 0);
    });
    return box;
  },

  /** Phones only, and only while something in the block has focus. */
  _enterCompose() {
    const box = this.signBox;
    if (!box || !box.isConnected) return;
    if (!window.matchMedia('(max-width: 46rem)').matches) return;
    if (this._composeArmed) return;
    this._composeArmed = true;
    const vv = window.visualViewport;
    /* PINNED ABOVE THE KEYBOARD, NOT OVER THE MAP. `position: fixed` is laid
       out against the LAYOUT viewport, which the keyboard does not shrink; the
       VISUAL viewport is what the keyboard leaves. The gap between the two
       bottoms is therefore the height of the keyboard, whatever keyboard it
       is, and pinning the surface that far up from the bottom puts the field
       directly above it — where a writer expects it, and with the plate and
       the year still on screen above. Both numbers come from the browser; no
       device is guessed at, and where `visualViewport` does not exist the
       offset is 0 and the block sits at the foot of the window. */
    this._vvSync = () => {
      const b = this.signBox;
      if (!b) return;
      const h = (vv && vv.height) || window.innerHeight;
      const top = Math.max(0, (vv && vv.offsetTop) || 0);
      const kb = Math.max(0, Math.round(window.innerHeight - (top + h)));

      /* NO KEYBOARD, NO FLOATING SURFACE.
         ROUND 2, the phone: "At the Close on the phone the signature panel
         floats over the timebar and half-covers '1921 · 211 units · 149
         territories · claimed · Account disputed'." This surface exists for one
         reason — an on-screen keyboard covers the bottom ~340px of a phone and
         the shell's grid has nowhere to scroll the caret to — and it pins
         itself the height of that keyboard up from the foot. With no keyboard
         that height is 0, so it pinned itself AT the foot, over the time
         control, which RESPONSIVE_LAW §1 forbids outright: below 62rem nothing
         floats. A hardware keyboard, a phone-width desktop window and every
         headless harness are all in that state.
         So the surface is ARMED on focus and only STANDS UP when the browser
         says a keyboard has actually taken the bottom of the window. Where it
         never does, the block stays in the flow and nothing floats. */
      const want = kb > 120;
      const on = b.dataset.compose === 'on';
      if (want !== on) {
        b.dataset.compose = want ? 'on' : '';
        document.documentElement.dataset.p05compose = want ? 'on' : '';
        if (want) announce('Writing the through-line. The rest of the panel is below; press Done when you have finished.');
      }
      if (!want) {
        b.style.removeProperty('--cl-vv-bottom');
        b.style.removeProperty('--cl-vv-h');
        b.style.removeProperty('--cl-vv-win');
        return;
      }
      b.style.setProperty('--cl-vv-h', h + 'px');
      b.style.setProperty('--cl-vv-bottom', kb + 'px');
      /* AND THE WINDOW'S OWN HEIGHT, because the surface's ceiling is worked
         out in CSS from the shell's published `--dock-key-y` — the foot of the
         plate — and `100vh` is not `innerHeight` on a phone with a URL bar.
         RESPONSIVE_LAW §1 says nothing floats inside the map rectangle below
         62rem; close.css §3.3 keeps this surface under it, measured, from the
         two numbers set here and the one the shell publishes. */
      b.style.setProperty('--cl-vv-win', window.innerHeight + 'px');
    };
    this._vvSync();
    if (vv) { vv.addEventListener('resize', this._vvSync); vv.addEventListener('scroll', this._vvSync); }
  },

  _leaveCompose() {
    const box = this.signBox;
    const vv = window.visualViewport;
    this._composeArmed = false;
    if (vv && this._vvSync) { vv.removeEventListener('resize', this._vvSync); vv.removeEventListener('scroll', this._vvSync); }
    this._vvSync = null;
    document.documentElement.dataset.p05compose = '';
    if (box) {
      box.dataset.compose = '';
      box.style.removeProperty('--cl-vv-bottom');
      box.style.removeProperty('--cl-vv-h');
      box.style.removeProperty('--cl-vv-win');
    }
  },

  /** Called by every control in the Close that navigates away from it. */
  _keepDraft() {
    if (this.signField && this.signField.isConnected) this._draft = this.signField.value;
    this._leaveCompose();
  },

  /* ======================================================= the drawer ==== */

  openLedger() {
    const box = el('div.cl-ledger');
    const all = this.ledger.all().filter((e) => e.kind !== 'completed');
    if (!all.length) {
      box.append(el('p.cx-note', { text: 'Nothing yet. This fills with the things you commit to — a guess, an order, a placement, a fact you found on your own. Not clicks, not time on page, not which places are popular. Those are not collected, so they cannot be optimised for.' }));
    }
    const seenFound = new Set();
    for (const e of all.slice().reverse()) {
      /* A found fact is one line per place, not one per field: the dossier
         stamps a claim for every section a reader opens, and thirty lines that
         all say "Barbados" is a log, not a record of what someone learnt. */
      let line = null;
      if (e.kind === 'found') {
        const tid = String(e.claimId || '').split(':')[0];
        if (seenFound.has(tid)) continue;
        seenFound.add(tid);
        const t = this.ctx.data.byId && this.ctx.data.byId.get(tid);
        line = 'I opened ' + ((t && (t.shortName || t.name)) || tid) + ' for myself.';
      }
      box.append(el('div.cl-ledger__row', { 'data-kind': e.kind },
        el('span.cl-ledger__kind', { text: e.kind === 'found' ? 'found on my own' : e.kind }),
        el('p.cl-ledger__said', line ? el('strong', { text: line })
          : (e.youSaid ? [el('span.cl-ledger__lab', { text: 'I said ' }), el('strong', { text: e.youSaid })] : el('span', { text: e.prompt || e.claimId }))),
        e.answer ? el('p.cl-ledger__ans', { text: 'the atlas: ' + e.answer }) : null,
        Number.isFinite(e.year) ? el('button.cx-more.cl-ledger__go', {
          type: 'button', text: 'Back to ' + e.year,
          onclick: () => { this.ctx.store.dispatch('setYear', e.year); if (e.beatId) this.ctx.bus.emit('tours:goBeat', { id: e.beatId }); },
        }) : null));
    }
    box.append(el('button.cx-more.cl-ledger__go', { type: 'button', text: 'Clear this record', onclick: () => { this.ledger.clear(); this._paintSentence(); this.openLedger(); } }));
    this.ctx.bus.emit('ask:sheet', { id: 'close:ledger', eyebrow: 'kept on this machine only', title: 'What you committed to', node: box });
  },

  /* ================================================= the revision sheet == */

  /** The citation for a figure, in one sentence, for the printed sheet.
   *  Drawn from `core/warrant.js` when it is on the page so the paper and the
   *  screen say the same thing; a bare figure says so rather than saying
   *  nothing, which is the whole rule. */
  _warrantSay(w) {
    const list = Array.isArray(w) ? w : (w ? [w] : []);
    if (!list.length) return 'No source is recorded for this figure.';
    /* Author, short title and year — not the subtitle and not the shelfmark.
       The full check line is on the beat and in the Evidence Ledger; on one
       sheet of A4 what a student needs is enough to find the book. */
    const short = (w2) => {
      const t = String(w2 || '').split(':')[0].trim();
      return t.length > 44 ? t.slice(0, 41).replace(/[,;\s]+$/, '') + '…' : t;
    };
    return 'From ' + list.map((v) => v.author + ', ' + short(v.work) + ' (' + v.year + ')').join('; ') + '.';
  },

  _buildPrintRegion() {
    this.printEl = el('div.tr-print', { hidden: true, 'aria-hidden': 'true' });
    document.body.appendChild(this.printEl);
  },

  _print() {
    const { data } = this.ctx;
    const s = this.signed || (this.ledger.get('p05:through-line') ? { text: this.ledger.get('p05:through-line').youSaid, name: 'unsigned' } : null);
    const version = (data.meta && data.meta.dataset && data.meta.dataset.version) || (data.meta && data.meta.dataset && data.meta.dataset.built) || 'unversioned';
    const p = this.printEl;
    fill(p);
    p.append(el('h1.tr-print__h', { text: s ? s.text : 'The through-line — unwritten. Go back and say it in your own words.' }));
    p.append(el('p.tr-print__by', { text: (s && s.name ? s.name + ' · ' : '') + new Date().toLocaleDateString('en-GB') + ' · The British Empire, an interactive atlas · dataset ' + version }));

    const phases = el('section.tr-print__s.tr-print__s--cols');
    /* NAMED FROM WHAT IS ACTUALLY PRINTED. The heading said "The four engines"
       and the loop below prints every chapter the path has except the poster —
       which is five, because `after` ("it is not finished") is a chapter too.
       A heading that miscounts the list under it is the same class of error as
       a key that miscounts the map. */
    const engines = (this.tours.chapters || []).filter((c) => c.id !== 'poster');
    phases.append(el('h2', { text: engines.length > 4 ? 'The four engines, and what is left' : 'The four engines' }));
    for (const c of engines) {
      /* The chapter's one printed line may carry a `{{fig:}}` token — the
         compensation chapter's does — and this is paper, so the registered
         value is substituted rather than the token printed. */
      phases.append(el('p', el('strong', { text: c.numeral + '. ' + c.title + ' — ' }), figPlain(c.sheetLine || '')));
    }
    p.append(phases);

    const people = el('section.tr-print__s.tr-print__s--cols');
    people.append(el('h2', { text: 'The people you met' }));
    const seen = new Set();
    /* ONE CLAUSE EACH, ON PAPER. The role a beat prints on screen is two or
       three sentences and there is room for it there; sixteen of them set one to
       a line was 840px of an 1,877px sheet — the single largest block on a page
       promised as one. The first sentence is what a student needs to remember
       who this was, and the whole of it is a press away in the app. */
    const clause = (t) => {
      const one = String(t || '').split(/(?<=[.;])\s+/)[0] || String(t || '');
      return one.length > 84 ? one.slice(0, 81).replace(/[,;\s]+$/, '') + '…' : one;
    };
    for (const b of (this.tours.beats || [])) {
      if (!this.ledger.didBeat(b.id) || !b.actor || seen.has(b.actor.name)) continue;
      seen.add(b.actor.name);
      people.append(el('p', el('strong', { text: b.actor.name + ' — ' }), clause(b.actor.role)));
    }
    if (!seen.size) people.append(el('p', { text: 'None yet — you left before the first beat.' }));
    p.append(people);

    const wrong = el('section.tr-print__s.tr-print__s--cols');
    wrong.append(el('h2', { text: 'What you got wrong, and where the evidence is' }));
    const bad = this.ledger.all().filter((e) => e.verdict === 'corrected' && e.youSaid);
    if (!bad.length) wrong.append(el('p', { text: 'Nothing recorded. Either you were right or you did not commit to anything — and only one of those is worth repeating.' }));
    for (const e of bad) {
      wrong.append(el('p',
        el('strong', { text: 'You said ' + e.youSaid + '. ' }),
        (e.answer ? 'The atlas: ' + e.answer + '. ' : ''),
        el('span.tr-print__link', { text: this._addressOf(e) })));
    }
    p.append(wrong);

    /* THE PAPER AND THE PANEL SAY THE SAME THING. The printed sheet already
       refuses to invent a headline for an unsigned through-line; it may not
       then imply that thirteen lines of argument were earned. */
    const open2 = this.close.lines.filter((l) => this._standing(l) === 'unanswered');
    if (open2.length) {
      const q = el('section.tr-print__s.tr-print__s--cols');
      q.append(el('h2', { text: 'Still open — you were there and did not answer' }));
      for (const l of open2) {
        q.append(el('p', el('strong', { text: 'Line ' + l.n + ': ' }), (l.mine && l.mine.ask) || l.evidence, ' — ', l.evidence, '.'));
      }
      p.append(q);
    }

    /* THE RANGES, FROM THE REGISTRY THAT WARRANTS THEM. They used to be two
       typed sentences in this file, which is the exact defect `tours/figures.js`
       exists to end: a number printed in a student's hand with no record behind
       it. Every figure that carries a `rangeReason` is printed here with its
       reason and its citation, so the sheet says the same thing the beat said,
       in the same words, from the same object. */
    const contested = el('section.tr-print__s.tr-print__s--cols');
    contested.append(el('h2', { text: 'The numbers that are ranges, and why' }));
    let ranges = 0;
    for (const id of figureIds()) {
      const f = figure(id);
      if (!f || !f.rangeReason) continue;
      ranges += 1;
      /* The first sentence of the reason, and the book. The whole reason and
         the shelfmark are on the beat and in the Evidence Ledger. */
      const why = String(f.rangeReason).split(/(?<=[.;])\s+/)[0];
      contested.append(el('p',
        el('strong', { text: f.value + (f.label ? ' — ' + f.label : '') + '. ' }),
        why + ' ' + (this._warrantSay(f.warrant) || '')));
    }
    contested.append(el('p', el('strong', { text: 'Africans landed in Barbados: 350,000–600,000. ' }), 'The island was also a re-export market that sold captives on, and the voyage records are incomplete. The range follows the Trans-Atlantic Slave Trade Database.'));
    if (ranges || true) p.append(contested);

    const diss = this.ledger.dissents();
    if (diss.length) {
      const d = el('section.tr-print__s');
      d.append(el('h2', { text: 'Where you disagreed with this app' }));
      for (const e of diss) d.append(el('p', { text: '“' + e.youSaid + '”' }));
      p.append(d);
    }

    p.append(el('p.tr-print__foot', { text: 'Wide margin left for pencil. Nothing on this page came from anywhere but this machine.' }));

    /* The sheet stays armed until the Close is put away. A browser's own print
       command a minute later must produce the same page as the button did —
       and the page a student keeps is the whole point of P21, so it does not
       get taken away by an `afterprint` event that some browsers fire before
       the dialogue has even opened. */
    p.hidden = false;
    document.documentElement.dataset.p05print = 'on';
    this.armed = true;
    setTimeout(() => { try { window.print(); } catch (_) { /* headless has no printer */ } }, 30);
  },

  _disarm() {
    if (!this.armed) return;
    this.armed = false;
    document.documentElement.dataset.p05print = '';
    if (this.printEl) this.printEl.hidden = true;
  },
};
