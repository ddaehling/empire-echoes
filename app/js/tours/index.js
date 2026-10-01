/**
 * tours/index.js — P05. THE PATH.
 *
 * Three critics named the same failure three rounds running: "there is no path.
 * The app hands a student a world map and leaves them to click." This module is
 * the answer. It ships DIDACTIC_SPEC §8 — the thirty-minute lesson — as an
 * authored spine of fourteen beats that DRIVES the existing single screen. It
 * renders no map, no timeline, no legend and no dossier; it points at them.
 *
 * WHAT A BEAT IS. A year, a selection, a definition of "British", a camera, one
 * sentence in the lede band, and at most one thing to do, in the rail. It is
 * not a slide. There is no full-screen overlay in this piece and the map is
 * never covered (FEATURE_SPEC §2 rule 1).
 *
 * WHAT IS PERSISTENT. Back, the step counter and Next live in the masthead and
 * do not move. "I'll explore on my own" is beside them, warns nothing, blocks
 * nothing, leaves the spine band on screen and returns the student to the exact
 * beat they left. Enter / → advance, ← goes back.
 *
 * THE FIVE GATES sit on the forward edge between chapters and only there. Next
 * is disabled and unfocusable until the damaging fact has been placed on the
 * two-axis field. Any placement advances. Declining is a named, recorded
 * choice, re-offered, and printed at the Close.
 *
 * FREE EXPLORATION FEEDS THE PATH. A place this student opened for themselves
 * before the beat that would have taught it converts that beat from
 * presentation into retrieval: they are asked instead of told, and told why.
 *
 * Slot: `toolbar` (the masthead). Emits:
 *   tours:ready   { beats, gates }
 *   tours:beat    { id, n, total, t, chapter, beatId, exploring }
 *   tours:state   { running, exploring, locked, done }
 * Listens: tours:start · tours:goBeat {id|n} · tours:explore · tours:rejoin
 */

import { el, fill, disposer, announce } from '../core/util.js';
import { buildPanel, cite, frame, soloFoot } from './panel.js';
import { loadFigures, plain as figPlain, sync as syncFigures, mark as markFigures } from './figures.js';
import { buildGate } from './gate.js';
import { stillBritish } from './answers.js';
import { getLedger } from '../close/ledger.js';
/* THE COST MODEL, AND IT NO LONGER LIVES IN THIS FILE.
 *
 * ROUND 8, the single-sourcing charge: "every timing number anywhere in the
 * app — student or teacher, screen or print — must be derived from
 * `_budgetMinutes`, never a hardcoded string." It could not be, because
 * `_budgetMinutes` was a private method on a MOUNTED object: it needed a DOM
 * bar, a bus and a running student before it would answer, so the printed
 * teacher pack could only retype its numbers, and a retyped number goes stale.
 * It went stale — the desk was still selling "the thirty-minute run" against a
 * route this model prices at 55.
 *
 * So the arithmetic is `./budget.js`: pure, no DOM, no bus, no `this`, and it
 * still asks `quiz/checkpoint.js::plan()` how many in-beat retrieval moments
 * THIS route hosts rather than guessing. Every method below that used to do
 * the sums now delegates to it, so there is exactly one implementation, and
 * `tools/check-timing.js` runs that same implementation in Node to fail the
 * build wherever a printed sentence disagrees with it. Read budget.js's
 * header for the published contract before adding a field to the payload. */
import * as budget from './budget.js';

const CSS = new URL('../../css/tours.css', import.meta.url);

/* Kept as local aliases so the prose below still reads; the values are
   budget.js's and there is no second definition of either. */
const SLOW_WPM = budget.SLOW_WPM;
const RETRIEVAL_S = budget.RETRIEVAL_S;

/* The four engines, in one clause each. The spans and the clauses are
   DIDACTIC_SPEC §2.1's table; the colour band under the map is P03's and is not
   duplicated here. Nothing in this list is a number, so nothing in it can go
   stale against the dataset. */
const SWEEP_PHASES = [
  { numeral: 'I', from: 1585, to: 1838, clause: '<strong>The Atlantic empire.</strong> Sugar and tobacco, grown by people bought as property.' },
  { numeral: 'II', from: 1600, to: 1858, clause: '<strong>The Company empire.</strong> A monopoly that found taxing Bengal beat trading with it.' },
  { numeral: 'III', from: 1815, to: 1947, clause: '<strong>The imperial empire.</strong> Markets, steam, and fear for the routes to India.' },
  { numeral: 'IV', from: 1942, to: 1997, clause: '<strong>Dissolution.</strong> A bankrupt Britain and parties older than the wars it fought.' },
];
const HERE = (f) => new URL(f, import.meta.url).href;

/* THE BEAT KINDS WHOSE WORK IS IN THE PANEL, NOT ON THE MAP (tours.css §17).
   Measured content height at 390x844, against a 129px reading window: the
   tension beat 2,135px, the off-map case 1,184px, the loop 420px in a figure
   that has to be seen whole, the sort 634px, the recall 1,073px. On every one
   of these the map is a polygon the beat does not refer to. `present`,
   `predict` and `sweep` are NOT here: those fly the plate somewhere and the
   plate is the evidence. */
const TEXT_WORK = new Set(['tension', 'source', 'sort', 'definition', 'loop', 'retrieve', 'offmap']);

export default {
  id: 'tours',
  slot: 'toolbar',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { util, bus, store } = ctx;

    await util.loadCss(CSS);
    /* `close.json` is read here for ONE reason: so a route can price its own
       omissions instead of asserting them. `variantMeta.core.leaves` claimed
       "Four of the Close's thirteen lines are then greyed"; walking `core` to
       the end and reading the rendered Close counted eight — five whose beats
       the route drops, two the student had not answered, and one that required
       a beat id (`amritsar`) which does not exist. A number a route asserts
       about another module's file is a number that goes stale on the next
       edit, so `_routes()` counts it. Nothing is copied: the file is read,
       counted and dropped. */
    const [tours, gatesDoc, closeDoc] = await Promise.all([
      util.getJson(HERE('tours.json'), null),
      util.getJson(HERE('gates.json'), null),
      util.getJson(new URL('../close/close.json', import.meta.url).href, null),
      /* NO CHECK, NO NUMBER, ON THE PATH — `tours/figures.js`. The registry is
         loaded before the first beat is built, because a panel that renders
         before it has landed would print the token instead of the number. It
         is awaited here and never again: the module holds one copy. */
      loadFigures((u) => util.getJson(u, null)),
    ]);
    if (!tours || !Array.isArray(tours.beats)) {
      /* No content, no path. Say nothing and mount nothing rather than shipping
         an empty control that promises a lesson it cannot run. */
      return;
    }

    this.doc = tours;
    this.gatesDoc = gatesDoc || { gates: [], axes: null };
    this.closeDoc = closeDoc || { lines: [] };
    this.ledger = getLedger(bus);
    this.ledger.listen();

    /* TWO ROUTES, BOTH NAMED BY THEIR OWN ARITHMETIC, AND THE DEFAULT IS THE
       ONE THAT FINISHES.

       DIDACTIC_SPEC §8 is called "the thirty-minute lesson" and until this
       round no route in this application was thirty minutes. The default ran
       fifteen beats, five Complication Gates and four spaced recalls, said so
       honestly in the opening offer — "Start the lesson · 40 minutes" — and
       there was no shorter route a student could be given. A teacher could read
       one in the teaching desk; a student could not walk one.

       So `core` exists: twelve beats, three Complication Gates and one argument
       between named historians, and its own arithmetic comes to 31 minutes. It
       is offered on the first beat of either run and published on
       `tours:routes`, and `#tour=core` is a page number like any other.

       ROUND 5, AND THE PARAGRAPH THAT USED TO STAND HERE WAS WRONG TWICE.
       It said `core` "is not the default" — it has been since round 3 — and it
       priced the cost of the shorter route at "four lines of the Close greyed".
       Walking `core` to the end and reading the rendered Close counted EIGHT:
       five whose beats the route drops, two the student had not answered, and
       one that required a beat id (`amritsar`) which does not exist in this
       file, so it was grey on every route including the full path. That number
       is no longer written down anywhere. `_greyLines()` counts it from
       close.json's own `requires` against this route's own beat list and prices
       it from each missing beat's own `cost_s`, and `_leavesSay()` puts the
       count into the route's own card — five lines on `core`, none on `thirty`.

       WHAT THE SHORTER ROUTE MAY NOT COST IS THE ENDING. It did: three of the
       six blanks of DIDACTIC_SPEC §2.3's through-line were keyed by hand to
       beats `core` does not carry, so a student who did every stop of the
       default lesson was left with a half-finished sentence and a control that
       never said "Finish and print". A blank now names the beats that can earn
       it, in order, and close/index.js takes the first one that is on the route
       being run; its `_audit()` checks every blank against every route at mount
       and calls console.error when one cannot be filled on a route that has not
       declared itself partial. FEATURE_SPEC §2 P05's five Complication Gates
       remain a property of the full path: `core` carries three and its own card
       says which two it drops, in seconds.

       `thirty` keeps its key: a teacher's `#tour=thirty&step=N` is a page
       number, and the harness walks steps 1, 4, 9, 14 and 23 of it. */
    /* THE DEFAULT IS THE ROUTE THAT FITS ONE SCHOOL PERIOD, AND IT IS NOT
       NAMED HERE. Round 3 made `core` the default on the argument that "a
       student given forty-five minutes of lesson in a thirty-minute period
       finishes none of it". Round 7 costed the two surfaces this model could
       not see — the counted figures inside beats and the retrieval moments the
       quiz drops into them — and `core`'s own honest number went to 50-65,
       which turned round 3's argument against `core` itself. Round 8, the
       historian: "there is no longer any route that delivers a 30-minute
       lesson."
       `period` is that route, cut against `budget.js`'s SLOW reading rate
       because the slow rate is the honest planning number for a mixed-ability
       class. WHICH ROUTE IS THE DEFAULT IS STATED ONCE, as `isDefault` on the
       route itself in tours.json, and read here — so a second file cannot hold
       a different opinion about it. `#tour=core`, `#tour=thirty` and
       `#tour=sixty` are untouched: a teacher's link is a page number. */
    this.variant = this._variantFromUrl() || budget.defaultRoute(this.doc);
    /* What this variant carries. DIDACTIC_SPEC §8.2 asks for three runs and
       until this round all three produced the same list: the eight-minute run
       carried three Complication Gates and a retrieval item and came to 17.6
       authored minutes, and the sixty-minute run was the thirty-minute run
       under a different name. Both are claims the app was making and not
       keeping. */
    this.vmeta = (this.doc.variantMeta && this.doc.variantMeta[this.variant])
      || { label: 'the lesson', gates: true, recalls: true, essays: false };
    this.beats = this._beatsFor(this.variant);
    this.chapters = new Map((tours.chapters || []).map((c) => [c.id, c]));
    /* THE STEP NUMBER IS A PAGE NUMBER AND IT MUST NOT MOVE.
       Round 3: "deep link #…&step=9 lands on step 10 (the gate that follows
       beat 9), so a teacher-set link is off by one at every gate." The cause
       was here. The recall steps used to be inserted only if the quiz module
       had already mounted — and module mount order is not guaranteed, so a
       page that resolved a deep link before `quiz:ready` numbered its steps
       against a nineteen-step list and then silently renumbered to twenty-three
       underneath the student. A page number that means one thing in March and
       another in April is not a page number.
       So the list is now the same list every time, in every mount order, and a
       recall the quiz cannot answer says so on its own step (`_applyRecall`)
       and lets Next through, rather than being deleted from the count. */
    this.steps = this._flatten(this.beats);

    this.running = false;
    this.exploring = false;
    this.locked = false;
    this.i = 0;

    this._buildBar(ctx.root);
    this._wire();

    /* The variant's own budget, computed from its own beats rather than
       asserted: a run that says "30 minutes" and takes forty is exactly the
       kind of confident round number this app refuses everywhere else. Emitted
       here and again at `app:ready`, because the first-run module mounts after
       this one and would otherwise never hear it. */
    const ready = () => {
      /* WHAT THE DOOR IS OFFERED IS THE LINE-UP, NOT THE ARCHIVE. A retired
         route is priced by `budget.js` so that no printed page can go stale
         about it (see `routeIds`), and it resolves as a deep link — but it is
         not one of the ways into this unit, and a door with six doors on it is
         not a choice. The one exception is the route the reader is actually
         on: a strip that cannot find it cannot name it. */
      const routes = this._routes().filter((r) => !r.retired || r.id === this.variant);
      const here = routes.find((r) => r.id === this.variant) || {};
      const idx = this._stepIndex();
      bus.emit('tours:ready', {
        variant: this.variant, label: this.vmeta.label,
        beats: this.beats.length, steps: this.required,
        gates: this.steps.filter((x) => x.kind === 'gate' || x.kind === 'dispute').length,
        /* THE FIGURE EVERY SURFACE PRINTS — see `_offerMid`. The door reads
           this one; so does the route card; they cannot disagree. */
        minutes: this._offerMid(),
        minutesLow: this._offerMinutes(),
        minutesExact: this._budgetMinutes(),
        /* THE HONEST RANGE, PUBLISHED FOR THE DOOR AS WELL AS THE CARD.
           ROUND 3 asked the card to say "30-40" where it said "about 30"; the
           opening offer prints `minutes` and belongs to another piece, so the
           string it would need is published here beside the number it already
           reads. `minutes` is unchanged, so nothing breaks by ignoring this. */
        minutesMax: this._offerMinutes(this._budgetMinutes(null, SLOW_WPM)),
        minutesSay: this._offerSay(),
        /* WHAT THIS ROUTE IS FOR, AND WHETHER IT FITS THE PERIOD — the two
           things a teacher choosing at 08:55 must not have to compute. Added
           beside the figures that were already here rather than spread over
           them, because `beats` and `steps` above are this run's counters and
           mean something slightly different from the route payload's. The
           whole payload for this route is `routes.find(r => r.id === variant)`;
           see budget.js's header for the frozen contract. */
        for: here.for || '',
        /* THE DOOR'S OWN SENTENCE AND ITS ONE CONTROL, COMPUTED — §8.5.
           `onboarding/index.js` used to hard-code "Three things about this map
           mislead. You will find all three…" and a control reading "Start the
           lesson", against a default route that answers two of the three and
           has a name of its own. Neither is written down any more: the promise
           is counted off the beats (`budget.js::doorSay`) and the control is
           the route's own label, so a route that changes what it delivers
           changes what the first screen promises with no second edit. */
        door: here.door || null,
        misleads: here.misleads || [],
        isDefault: !!here.isDefault,
        periods: here.periods,
        fitsPeriod: !!here.fitsPeriod,
        periodMinutes: here.periodMinutes,
        covers: here.covers || [],
        drops: here.drops || [],
        mustStickFloor: here.mustStickFloor,
        mustStickTotal: here.mustStickTotal,
        routes,
        /* THE ANSWER COLUMN, PUBLISHED SO THE PRINTED PLAN CAN CARRY IT.
           ROUND 3, the classroom critic, as the single thing standing between
           this and departmental adoption: "print an answer column in the lesson
           plan. Every 'Ask' beat needs one line of expected answer plus one
           common wrong answer… Without it the pack is my personal script, not a
           departmental resource." The lines are authored beside the beats they
           belong to, in tours.json, so they cannot drift from the questions;
           they are published here and on `window.BEA.toursAnswerKey` so the
           teaching desk's printed plan can set them beside its own Ask lines
           without either module copying the other's text. */
        answerKey: this._answerKey(),
        /* The flattened step index for every route — see `_stepIndex()`. It is
           on the payload as well as on the handle so a module that mounts
           before this one hears it rather than polling for a global. */
        stepIndex: idx,
      });
      /* AND IT HAS TO SURVIVE THE BOOT. `main.js` emits `app:ready` and then,
         on the very next line, replaces `window.BEA` with a fresh object — so
         this handle, written from inside an `app:ready` handler, was being
         deleted every time and `window.BEA.toursAnswerKey` has never been
         readable. Written now and again on the next task. */
      const put = () => {
        try {
          const B = (window.BEA || (window.BEA = {}));
          B.toursAnswerKey = this._answerKey();
          /* Same boot hazard as the answer key: `main.js` replaces window.BEA
             on the line after `app:ready`, so this is written twice. */
          B.toursIndex = idx;
          /* EVERY ROUTE'S COMPUTED FIGURES, ON A HANDLE, FOR THE SURFACES THAT
             ARE NOT ON THE BUS — the printed pack and tools/check-timing.js's
             live counterpart. Same array as `tours:routes`. Nothing may retype
             a figure from it. */
          B.toursRoutes = { here: this.variant, default: budget.defaultRoute(this.doc), routes };
        } catch (_) { /* no handle */ }
      };
      put();
      setTimeout(put, 0);
      /* THE ROUTES ARE PUBLISHED, NOT ONLY THE ONE WE HAPPEN TO BE ON.
         Round 4 shipped one offer — "Start the lesson · 40 minutes" — which was
         honest arithmetic about a route nobody had chosen and the only route a
         student was ever shown. Anything on the page that wants to offer a
         shorter one can now read every route with its own measured budget. */
      bus.emit('tours:routes', { here: this.variant, default: budget.defaultRoute(this.doc), routes });
    };
    ready();
    this.d(bus.on('app:ready', ready));
    this.d(bus.on('tours:setRoute', (p2) => { if (p2 && p2.id) this._pickRoute(p2.id); }));

    /* A deep link into a beat is a page number: #tour=thirty&step=7 must open
       the same beat in March that it opened today. */
    const s = store.getState();
    if (s.activeTour && Number.isFinite(s.tourStep)) {
      this._start(Math.max(0, Math.min(this.steps.length - 1, s.tourStep)), { silent: true });
    } else {
      this._paint();
    }

    /* A STEP LINK HAS TO CARRY ITS OWN BEAT'S TEACHING.
     *
     * ROUND 7, the classroom critic, reproduced: "Cold-loading
     * #tour=core&step=3 gives no 'Count it' affordance and no T3 anywhere in
     * the document — 3.4 million, 2.4–3.0 million, 'embarked' all absent —
     * while walking to the same beat on path gives the whole crossing chart.
     * The desk's own lesson plan tells teachers to paste step links; a T-item
     * that exists only when you arrive by pressing Next is a T-item half the
     * classes will not see."
     *
     * The cause is the mount order in `modules.json`: this piece is eighth,
     * `viz` is eleventh and `quiz` fourteenth, and the line above starts the
     * run — announcing the beat — inside our own mount, into a bus those two
     * have not subscribed to yet. Nothing was wrong with either of them; they
     * were told about the lesson before they existed.
     *
     * So the panel is opened again once the house is full, which re-states
     * `ask:sheet` under this beat's own id — the documented hook the figure
     * arrives through ("a beat's panel just opened; if this piece owes that
     * beat a figure, it goes in now"). It deliberately does NOT re-announce
     * `tours:beat`: that event is an ARRIVAL, and re-firing it would let the
     * retrieval module drop a checkpoint over the very beat a pasted step link
     * was meant to show. `tours:ready` has been re-emitted at `app:ready` for
     * this same reason since round 3; this is that repair finished, for the
     * surface that carries the teaching rather than the arithmetic.
     */
    this.d(bus.on('app:ready', () => {
      if (!this.running || this.exploring) return;
      const st = this.step;
      if (!st || st.kind !== 'beat' || !st.beat) return;
      this._openPanel(st.beat);
    }));
  },

  update(state, prev, changed) {
    if (!this.doc) return;
    /* The browser's Back button, and a teacher's deep link. url.js pushes a
       history entry per step, so popping one has to move the path, not just
       the address bar.

       AND IT HAS TO START THE PATH, not merely apply one of its steps. Round 2
       shipped this branch calling `_apply()` without setting `running`, so
       `#tour=thirty&step=7` opened the right beat with an idle transport: the
       panel was there, the counter was blank and Back and Next were not
       rendered at all. A link that lands a class inside the lesson has to land
       them in the lesson. */
    if ((changed.has('tourStep') || changed.has('activeTour')) && state.activeTour && !this._applying) {
      /* A PASTED ADDRESS IS THE RUN IT NAMES.
         `#tour=eight` and `#tour=thirty` differ only in the hash, so pasting
         one into an open tab is a same-document navigation: nothing re-mounts,
         and until this round the variant was read once at mount and never
         again. Measured: opening #tour=eight and then #tour=sixty in the same
         tab left the reader in the eight-minute run with the address claiming
         the sixty. The shell's own contract is that a link pasted into an open
         tab is the object it names, so the run is rebuilt here. */
      /* A ROUTE CHANGE ALWAYS RE-APPLIES, EVEN WHEN THE NUMBER IS THE SAME.
         Measured: pasting `#tour=core&step=14` while standing on step 23 of
         `thirty` left the reader on step 23 with the address claiming step 14.
         `_switchVariant` clamps `this.i` into the shorter list, which landed it
         on exactly the index the new address named, so the `n !== this.i` guard
         below decided nothing had happened. Step 14 of one route and step 23 of
         another are different steps whatever the arithmetic says. */
      let swapped = false;
      if (state.activeTour !== this.variant && this.doc.variants[state.activeTour]) {
        this._switchVariant(state.activeTour);
        swapped = true;
      }
      const n = Math.max(0, Math.min(this.steps.length - 1, state.tourStep || 0));
      if (swapped || n !== this.i || !this.running) {
        this.i = n;
        this.running = true;
        this.exploring = false;
        this._apply();
      }
    }
    /* Escape ends the tour, by the shell's own contract (ARCHITECTURE §11).
       It must not therefore destroy the lesson: Escape means "put the panel
       away and let me look at the map", which is exactly free exploration. The
       path is held where it stands and the way back is in the same place. */
    if (changed.has('activeTour') && !state.activeTour && this.running && !this.exploring) this.explore();
  },

  destroy() {
    this._stopSweep();
    for (const t of this._unburyAt || []) clearTimeout(t);
    if (this.d) this.d.all();
  },

  /* ================================================== content ============ */

  _variantFromUrl() {
    /* Two sources, because url.js may already have canonicalised the hash into
       the store by the time this module mounts. A teacher's `#tour=eight` is a
       page number and it has to mean the same thing either way. */
    const st = this.ctx.store.getState();
    if (st.activeTour && this.doc.variants[st.activeTour]) return st.activeTour;
    const raw = (location.hash || '').replace(/^#/, '');
    for (const part of raw.split('&')) {
      const [k, v] = part.split('=');
      if (k === 'tour' && v && this.doc.variants[v]) return v;
    }
    return null;
  },

  _beatsFor(variant) {
    const ids = (this.doc.variants && this.doc.variants[variant]) || this.doc.variants.thirty;
    const byId = new Map(this.doc.beats.map((b) => [b.id, b]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  },

  /**
   * Beats, their gates and their recalls, in one list, so "the forward edge"
   * is literal and the counter can count what a student actually has to do.
   *
   * THE RECALLS ARE THE SPACING. Round 2: "nothing on the path forces the
   * second spaced encounter, so the spacing claim in the didactic spec is
   * unearned for any student who simply presses Next." Four items from the
   * retrieval bank now sit ON the path, each one asking about something met
   * between four and fifteen minutes earlier, and two of them (T3, T8) are the
   * two must-stick numbers no beat reached. They are adaptive because the quiz
   * owns them: `quiz:ask` hands the item to the module that schedules it, so
   * getting one wrong here puts it back in that student's due queue.
   *
   * If the quiz module is not on the page they are dropped rather than
   * rendered as a promise nothing answers.
   */
  /**
   * The route's ordered step list. THE ARITHMETIC IS `budget.js::flatten` —
   * the same call `tools/check-timing.js` makes in Node — because a second
   * implementation of "which steps does this route have" is a second
   * implementation that goes stale, and the step number is a page number.
   *
   * A ROUTE PICKS ITS OWN FORWARD EDGES. `gates` and `recalls` accept `true`
   * (all), `false` (none) or a list of ids to keep, so the one-period route can
   * say which two spaced recalls it can afford. AN OPTIONAL STEP LIVES PAST THE
   * END OF THE COUNTER: the Congo is appended, so every index before it keeps
   * its meaning, and it is out of the denominator and out of the budget.
   */
  _flatten(beats) {
    return budget.flatten(beats, this.vmeta, this.gatesDoc);
  },

  /* ============================ the forward edge, per run ================ *
   *
   * WHAT THIS RUN HAS PLACED — as against what this BROWSER has ever placed.
   *
   * FEATURE_SPEC §1 charge 11 buys "an app's users route around what they
   * don't click" with five beats where Next is disabled until the student
   * places the damaging fact. Until wave 9 the release was a row in the
   * Ledger, and the Ledger is kept for weeks across every route. Measured, by
   * `tools/scenarios/p05-accept.js`: the scenario walks four steps of the
   * default route (placing g1), then walks the full route end to end — and
   * met FIVE of that route's six forward edges, because g1 opened itself on
   * the strength of a placement made on a different route minutes earlier.
   * ">>> P05 ACCEPTANCE FAILED".
   *
   * The promise is about the lesson the student is in. A two-lesson unit makes
   * that unmistakable: Lesson Two's gate must hold for a student who placed
   * Lesson One's last week. So the satisfied set is scoped to ONE RUN OF ONE
   * ROUTE and kept in `sessionStorage`, which is exactly the right lifetime —
   * a reload mid-lesson keeps the run (the student did place it, one minute
   * ago), a new route clears it, and a new browsing session clears it.
   *
   * Nothing student-facing is stored: the ids are gate ids and dispute keys.
   * The commitments themselves stay in the Ledger, which is the only place
   * this app records what a student said.
   */
  _runKey() { return 'bea.tours.run.v1'; },

  _runRead() {
    try {
      const raw = sessionStorage.getItem(this._runKey());
      const v = raw ? JSON.parse(raw) : null;
      if (!v || v.route !== this.variant || !Array.isArray(v.ids)) return null;
      return v;
    } catch (_) { return null; }   /* private mode, or a storage quota: the edge holds */
  },

  /** Start a fresh run of `route`: every forward edge on it holds again. */
  _runReset(route) {
    this._run = { route: route || this.variant, ids: [] };
    try { sessionStorage.setItem(this._runKey(), JSON.stringify(this._run)); } catch (_) { /* fine */ }
  },

  /** Has THIS run satisfied this forward edge? */
  _runHas(id) {
    if (!this._run || this._run.route !== this.variant) this._run = this._runRead();
    return !!(this._run && this._run.ids.includes(id));
  },

  _runAdd(id) {
    if (!this._run || this._run.route !== this.variant) this._run = this._runRead() || { route: this.variant, ids: [] };
    if (!this._run.ids.includes(id)) this._run.ids.push(id);
    try { sessionStorage.setItem(this._runKey(), JSON.stringify(this._run)); } catch (_) { /* fine */ }
  },

  /** How many steps a student has to do — optional ones are not in it. */
  get required() { return this.steps.filter((s) => !s.optional).length; },

  /**
   * How long this run actually asks for, from its own data: each beat's
   * authored `cost_s`, plus ninety seconds a gate and forty-five a retrieval —
   * the same arithmetic `tools/scenarios/p05-clock.js` reports, so the number
   * on screen and the number in the harness cannot drift apart.
   */
  /**
   * THE COST MODEL, AND THE READING RATE IT ASSUMES IS NOW AN ARGUMENT.
   *
   * ROUND 3, the rubric and the historian: "the door says 'about 30 minutes'
   * for core; the route's own cost model says 31.6 and the prose actually on
   * screen across the fifteen stops measures ~7,200 words including reveals,
   * which is 35-45 minutes for a median 16-year-old. Say '30-40' on the card,
   * the way the long route honestly says 45."
   *
   * The model was not wrong about the beats; it was wrong about the reader.
   * `cost_s` is `round(words / 180 * 60) + do_s(kind)`, and 180 words a minute
   * is a fluent adult skimming — not a sixteen-year-old on a paragraph that
   * names Isandlwana, Adwa and Article 35 in three lines. So the reading half
   * of every beat's cost is recomputed at whatever rate is asked for and the
   * DOING half is left alone, because pressing a control does not get slower
   * when the prose gets harder. `wpm` absent is the authored model, unchanged
   * and still the number the door prints; 110 is the floor a class actually
   * reads at, and the two of them are the two ends of the range on the card.
   */
  /**
   * ROUND 7 — WHAT THE MODEL WAS NOT COUNTING, AND IT WAS TWO WHOLE SURFACES.
   *
   * The rubric critic reproduced this model exactly and then measured what is
   * actually on screen: "it counts only `b.words` from tours.json — it does
   * not count the three in-beat figures the viz module mounts, nor the four
   * checkpoints and their reveals. I measured 5,057 words actually on screen
   * across the required path… the honest on-path total is nearer 6,000-6,300,
   * which is 46-57 minutes at the app's own 110wpm floor."
   *
   * Both are now costed, and neither number is asserted here:
   *   · THE COUNTED FIGURES. `viz/index.js` mounts a guess-then-reveal figure
   *     inside three beats of this route — the crossing, the army dots and the
   *     1947 twin charts. Their words are measured on the running app and
   *     authored on the beat that hosts them (`onPath.words`, with the
   *     scenario that re-measures them named beside it), because a module may
   *     not read another module's internals; `tools/scenarios/p05-accept.js`
   *     asserts that the beats declaring one are exactly the beats that mount
   *     one, so the authored number cannot quietly go stale.
   *   · THE RETRIEVAL MOMENTS. `quiz/checkpoint.js::plan()` resolves the
   *     authored moments against THIS route's own beat list and drops the ones
   *     it cannot space; whatever it returns is what a student meets, and each
   *     one costs `RETRIEVAL_S` like every other production in this model.
   */
  _budgetMinutes(steps, wpm) {
    return budget.budgetMinutes(steps || this.steps, wpm, this.vmeta, this.doc);
  },

  /**
   * How many in-beat retrieval moments this run hosts. Asked of the module
   * that schedules them, never guessed: `plan()` takes the ordered beat ids
   * and returns the moments it can space on them. A build without the quiz
   * module answers zero, which is the truth there.
   */
  _checkpoints(steps) {
    return budget.checkpoints(steps || this.steps);
  },

  /**
   * THE SAME NUMBER, WHEREVER IT IS PRINTED.
   *
   * ROUND 2, three critics, one product: the plate offered "Start the lesson ·
   * 40 minutes", the route card inside beat 1 called the same route "24 stops ·
   * about 42 minutes", and `variantMeta`'s own note claimed the 31-minute
   * `core` route "is the default" when the code default is the long one. Three
   * numbers and a contradiction.
   *
   * The 40 was never wrong: `onboarding/index.js` rounds our published figure
   * to the nearest five, "because that is the precision the estimate actually
   * has". It is the right call and the disagreement was that only one of the
   * two places did it. So the rounding lives here, once, and everything that
   * prints a duration prints this. The exact arithmetic is still published as
   * `minutesExact` for the harness.
   */
  /**
   * One row per beat of THIS route, in route order: what a class should be
   * able to say, and the answer most classes give instead. Ordered, numbered
   * and carrying the step index, so a printed plan can put it in a column
   * beside its own line for the same beat without matching on titles.
   */
  _answerKey() {
    const out = [];
    for (const st of this.steps) {
      if (st.kind !== 'beat') continue;
      const b = st.beat;
      const a = b.answer;
      if (!a) continue;
      out.push({
        step: st.optional ? null : st.n,
        beatId: b.id,
        mark: b.ledeMark || b.mark || '',
        title: (b.panel && b.panel.title) || b.id,
        ask: this._plain(b.say),
        /* The printed plan is paper in a teacher's folder and the tokens have
           no meaning there, so the registered values are substituted before
           this leaves the module that owns them. */
        expected: figPlain(a.expected),
        commonWrong: figPlain(a.commonWrong),
        optional: !!st.optional,
      });
    }
    return out;
  },

  _offerMinutes(m) {
    return budget.offerMinutes(Number.isFinite(m) ? m : this._budgetMinutes());
  },

  /**
   * THE ONE NUMBER, AND IT IS THE MIDDLE OF THE RANGE, NOT THE FLATTERING END.
   *
   * ROUND 7, the phone critic: "the door prints minutes (35) and beat 1's
   * route card prints minutesSay (35-45). Print the range in both places, or
   * the same number in both — this is the round-2 '40 vs 42' defect at a
   * smaller amplitude." The door is `onboarding/index.js`'s and it has room
   * for one figure, not a range; the card is this piece's and the range is
   * the honest thing. So both now print the SAME figure, and it is the middle
   * of the range rather than the fast reader's end — a single number standing
   * for a spread is its centre, and printing the low end as "about" was the
   * app quietly promising the best case. The spread itself is not lost: it is
   * one press away on the card, in the note that explains where it comes from.
   */
  _offerMid(steps) {
    return budget.offerMid(steps || this.steps, this.vmeta, this.doc);
  },

  /** One beat's seconds: its reading at `wpm`, plus the doing, plus whatever
   *  the viz module mounts inside it. */
  _beatCost(b, wpm) {
    return budget.beatCost(b, wpm);
  },

  /**
   * THE OFFER, AS A RANGE, BECAUSE IT IS AN ESTIMATE ABOUT A PERSON.
   *
   * Two numbers from one model at two reading rates, each rounded to five
   * minutes — the precision an estimate like this has. When they round to the
   * same figure the range collapses and one number is printed, which is what
   * happens on the short run and is the honest answer there.
   */
  _offerSay(steps) {
    return budget.offerSay(steps || this.steps, this.vmeta, this.doc);
  },

  /**
   * WHICH LINES OF THE CLOSE THIS ROUTE CANNOT REACH, AND WHAT THEY COST.
   * Counted from `close.json`'s own `requires` against the route's own beat
   * list, priced from each missing beat's own `cost_s`. Nothing asserted.
   */
  _greyLines(variant) {
    return budget.greyLines(this.doc, this.closeDoc, variant);
  },

  /** The route's authored sentence about what it drops, with a counted tail. */
  _leavesSay(variant) {
    return budget.leavesSay(this.doc, this.closeDoc, variant, this.gatesDoc);
  },

  /**
   * THE FLATTENED STEP INDEX, FOR EVERY ROUTE, PUBLISHED.
   *
   * ROUND 2, the classroom critic, as a `must fix`: "the printed lesson plan's
   * segment links are state deep links (#year=…&sel=…) rather than
   * #tour=core&step=N, because pack.js cannot compute the step index without
   * reimplementing tours/_flatten. It says so honestly, but a cover teacher who
   * loses the run has to restart from step 1. Publish the flattened step index
   * on window.BEA so the plan can print the page number it wants to print."
   *
   * `pack.js` was right to refuse: a step index counts gates, disputes and
   * spaced recalls as well as beats, the flags that decide which of those a
   * route carries live in `variantMeta`, and a second implementation of that
   * arithmetic is a second implementation that goes stale. So the answer is not
   * for pack.js to compute it — it is for this module, which owns `_flatten`,
   * to publish it. One entry per step of every named route, in route order,
   * carrying the address that opens it.
   *
   * THE CONTRACT (frozen; read it, never rebuild it):
   *
   *   window.BEA.toursIndex = {
   *     routes: { core: {...}, thirty: {...}, eight: {...}, sixty: {...} },
   *     stepOf(routeId, beatId) -> number | null,     // the flattened index
   *     hrefOf(routeId, beatId) -> '#tour=core&step=7' | null,
   *   }
   *
   * and each route is
   *
   *   { id, label, steps: [ { i, step, kind, id, n, title, mark, optional } ],
   *     beats: { beatId: step } }
   *
   * THREE NUMBERS, AND THEY ARE ALL DIFFERENT. `i` is the index in the
   * flattened list, 0-based, which is what `store.tourStep` holds. `step` is
   * `i + 1` and is THE NUMBER THAT GOES IN THE ADDRESS — measured on the
   * running app, `#tour=thirty&step=17` sets `tourStep` to 16 and the transport
   * reads "17 / 25", because `url.js` writes the address 1-based. `n` is the
   * beat number a student sees ("beat 7 of 12"), which counts beats only and
   * skips gates, disputes and recalls. Getting these three confused is exactly
   * the mistake this publication exists to make impossible, so `hrefOf()` is
   * the thing to call and the numbers are there for a caller that needs one.
   */
  _stepIndex() {
    const routes = {};
    for (const id of Object.keys(this.doc.variants || {})) {
      const meta = (this.doc.variantMeta && this.doc.variantMeta[id]) || null;
      if (!meta || !meta.label) continue;          /* $note is not a route */
      const was = this.vmeta;
      this.vmeta = meta;
      let flat = [];
      try { flat = this._flatten(this._beatsFor(id)); } finally { this.vmeta = was; }
      const steps = flat.map((st, i) => ({
        i,
        step: i + 1,
        kind: st.kind,
        id: st.beat ? st.beat.id
          : (st.gate && st.gate.id) || (st.recall && st.recall.id)
          || (st.dispute && (st.dispute.id || st.dispute)) || '',
        n: st.optional ? null : st.n,
        title: st.beat ? ((st.beat.panel && st.beat.panel.title) || st.beat.id)
          : (st.gate && (st.gate.title || 'Before you go on'))
          || (st.recall && (st.recall.mark || 'A question from earlier'))
          || 'An argument between historians',
        mark: st.beat ? (st.beat.ledeMark || st.beat.mark || '') : '',
        optional: !!st.optional,
      }));
      const beats = {};
      for (const s2 of steps) if (s2.kind === 'beat' && s2.id) beats[s2.id] = s2.step;
      routes[id] = { id, label: meta.label, steps, beats };
    }
    /** The address number for a beat on a route, or null if it is not on it. */
    const stepOf = (routeId, beatId) => {
      const r = routes[routeId];
      if (!r || !Object.prototype.hasOwnProperty.call(r.beats, beatId)) return null;
      return r.beats[beatId];
    };
    return Object.freeze({
      version: 1,
      note: '`step` and `stepOf()` are the 1-based number the address takes; '
        + '`i` is the 0-based index in the flattened list. Use hrefOf().',
      routes,
      stepOf,
      hrefOf: (routeId, beatId) => {
        const n = stepOf(routeId, beatId);
        return n == null ? null : '#tour=' + routeId + '&step=' + n;
      },
    });
  },

  /**
   * EVERY ROUTE, WITH ITS OWN ARITHMETIC. No route's length is asserted; each
   * one is flattened and costed by exactly the function that costs the running
   * one, so the number beside "the thirty-minute lesson" and the number the
   * transport is counting down cannot disagree.
   */
  _routes() {
    return budget.allRoutes(this.doc, this.gatesDoc, this.closeDoc);
  },

  /**
   * THE ROUTE YOU ARE ON, AND THE ONE WORTH OFFERING — not a menu of four.
   * The strip is printed on the first beat of a run, where a student is
   * deciding how much time they have, and four rows of it is a settings panel.
   * So: this route first, then the one that fits a school period and the full
   * path, whichever of them is not this one — two rows on the default route,
   * which is what a student choosing is choosing between. The short run, the
   * middle length and the run with the chapter arguments are teacher's links
   * (`#tour=eight`, `#tour=core`, `#tour=sixty`); every one of them is on the
   * published `routes` payload with its own `for` phrase and its own two
   * numbers, so the teaching desk can print the whole line-up without asking
   * this strip to become one.
   */
  _offerRoutes() {
    const all = this._routes();
    const by = new Map(all.map((r) => [r.id, r]));
    /* A RETIRED ROUTE IS STILL A ROUTE YOU CAN BE ON. `#tour=core&step=7` is a
       page number in somebody's printed pack, and a strip that could not find
       the route the reader is actually on said "you are on Lesson One" over
       somebody else's beats. So it is priced on demand and put at the head of
       its own strip; it is simply never offered to anybody who is not there. */
    if (!by.has(this.variant) && this.doc.variants[this.variant]) {
      const r = budget.routeFigures(this.doc, this.gatesDoc, this.closeDoc, this.variant);
      by.set(this.variant, r);
    }
    const out = [];
    const push = (id) => {
      const r = by.get(id);
      if (!r || out.includes(r)) return;
      if (r.retired && r.id !== this.variant) return;
      out.push(r);
    };
    push(this.variant);
    /* THE OTHER HALF OF THE UNIT COMES SECOND, ALWAYS. DIDACTIC_SPEC §8.5: a
       student on Lesson One is offered Lesson Two by name before anything
       else, because that is the choice the unit actually presents. */
    const here = by.get(this.variant);
    if (here && here.pairs) push(here.pairs);
    push(budget.defaultRoute(this.doc));
    push('thirty');
    return out;
  },

  /** Take another route, from the first beat of it. */
  _pickRoute(id) {
    if (!this.doc.variants[id] || id === this.variant) return;
    this._switchVariant(id);
    this._runReset(id);
    this.i = 0;
    this.finished = false;
    this.running = true;
    this.exploring = false;
    this.ctx.store.dispatch('startTour', { id, step: 0 });
    this._apply();
    const r = this._routes().find((x) => x.id === id);
    announce('Now on ' + (r ? r.label : id) + '. ' + (r ? r.steps + ' stops, about ' + (r.minutesSay || r.minutes) + ' minutes.' : ''));
  },

  /** Rebuild the run in place, keeping nothing but the reader's Ledger. */
  _switchVariant(id) {
    this.variant = id;
    this.vmeta = (this.doc.variantMeta && this.doc.variantMeta[id])
      || { label: 'the lesson', gates: true, recalls: true, essays: false };
    this.beats = this._beatsFor(id);
    this.steps = this._flatten(this.beats);
    this.i = Math.min(this.i, Math.max(0, this.steps.length - 1));
    this.finished = false;
    this.locked = false;
  },

  get step() { return this.steps[this.i] || null; },
  get totalBeats() { return this.beats.filter((b) => !b.optional).length; },

  /* ================================================== the transport ====== */

  _buildBar(root) {
    this.back = el('button.tr-bar__b.tr-bar__back', {
      type: 'button', title: 'Back (←)', 'aria-label': 'Back one beat',
      onclick: () => this.prev(),
    }, el('span.tr-bar__arrow', { 'aria-hidden': 'true', text: '←' }), el('span.tr-bar__w', { text: 'Back' }));

    this.count = el('span.tr-bar__count', { 'aria-live': 'polite' });

    this.next = el('button.tr-bar__b.tr-bar__next', {
      type: 'button', title: 'Next (→ or Enter)', 'aria-label': 'Next beat',
      onclick: () => this.advance(),
    }, el('span.tr-bar__w', { text: 'Next' }), el('span.tr-bar__arrow', { 'aria-hidden': 'true', text: '' }));

    /* THE GATE'S CONTROL MUST NEVER LOSE ITS LABEL, AND THE FIELD MUST NEVER BE
       A THING THE STUDENT CANNOT FIND.
       Round 3, at 900x700, 768x1024 and 390x844: the disabled Next collapsed to
       an unlabelled dashed "·" while the band said "Place it to go on", so a
       student was told to place something and shown neither the word nor the
       thing. Next itself stays disabled and unfocusable — charge 11 is about
       routing around, and a pressable Next is a route around — so the way to
       the field is a second, focusable control that appears only while a gate
       holds the path, says where the field is, takes the reader to it and puts
       the focus on the first cell. It is the only control this piece adds to
       the bar, it exists for five steps of twenty-four, and it is the answer to
       "the field is seven hundred pixels below the fold with nothing pointing
       down at it". */
    this.toField = el('button.cx-more.tr-bar__togate', {
      type: 'button', hidden: true,
      'aria-label': 'Go to the field and place the fact',
      onclick: () => this._goToField(),
    }, el('span.tr-bar__togatew', { text: 'the field' }), el('span.tr-bar__arrow', { 'aria-hidden': 'true', text: '↓' }));

    this.escape = el('button.cx-more.tr-bar__escape', {
      type: 'button',
      onclick: () => {
        if (this.running) { if (this.exploring) this.rejoin(); else this.explore(); return; }
        /* Idle, at every entry: this control starts the lesson. P22's first-run
           offer is told the reader has taken it so its own band stands down. */
        if (this.left) this.left = false;
        this.ctx.bus.emit('onboarding:rejoin');
        this._start(0);
      },
    });

    /* One masthead, one bar. The first-run piece has offers to make before the
       path starts — "pick up where you left off", "three you got wrong" — and
       they arrive here as `tours:aux` rather than as a second control strip
       competing for the same 52 pixels. */
    this.aux = el('span.tr-bar__aux');

    this.bar = el('div.tr-bar', { 'data-state': 'idle' }, this.back, this.count, this.next, this.toField, this.aux, this.escape);

    /* WHERE THE TRANSPORT LIVES — docs/RESPONSIVE_LAW.md §7, P05.
       In the masthead, at every width. Above 62rem that is `toolbar`, this
       module's own slot. Below it the masthead's centre slot is
       `overflow: hidden` and at 390px the brand leaves it about fifty pixels,
       which clipped Next off the screen entirely — so the shell reserves a
       real 9rem box, `data-mount="dock-step"`, between the wordmark and
       `Tools`, and publishes its rectangle.

       UNTIL THIS ROUND WE FLOATED INSTEAD, into `.app__overlay`, pinned to the
       seam by an expression in tours.css plus a measured `--tr-dock-lift`. Two
       things were wrong with it and both were measured. It stood on the map:
       206x40 = 8,240 px² of a 390x152 band at 390x844, on the Bay of Bengal,
       on the beat about Bengal. And `.app__overlay` is the last element in the
       document, so Back and Next were drawn between `Layers` and `Tools` and
       reached past tab stop 40, after the whole dossier (WCAG 2.4.3). CSS
       cannot fix a focus order; only the document order can, which is why the
       destination is a slot in the bar and not a rectangle over the plate.

       So: one destination, two parents. `.tr-dock` is a child of the reserved
       box, it is `position: static` inside it, and it lifts nothing, measures
       nothing and covers nothing. The overlay is kept only as the fallback for
       a shell that has no such slot, and in that case §E's pinned rectangle
       still applies. */
    this.barHome = root;
    this.barDock = el('div.tr-dock');
    const slot = document.querySelector('#app [data-mount="dock-step"]');
    const ov = slot || document.querySelector('#app [data-mount="overlay"]');
    this.dockIsSlot = !!slot;
    if (ov) ov.appendChild(this.barDock);
    this.d(() => this.barDock.remove());

    this.narrow = window.matchMedia('(max-width: 61.999rem)');
    const place = () => {
      /* THE RESERVED BOX EXISTS ONLY WHILE A LESSON IS MOUNTED — layout.css
         shows `.bar__dock` at `#app[data-path="on"]` and hides it otherwise.
         Measured at 390x844 on the cold plate: the bar was parented into a box
         with `display: none`, so the one control this piece has before the
         lesson starts — the door into it — had a 0x0 box and could not be
         pressed. Idle, the bar goes to this module's own masthead slot, which
         is never collapsed (RESPONSIVE_LAW §8). */
      const wantDock = this.narrow.matches && this.running && this.barDock.isConnected;
      const host = wantDock ? this.barDock : this.barHome;
      if (this.bar.parentNode !== host) host.appendChild(this.bar);
      this.barDock.dataset.on = this.narrow.matches ? 'yes' : '';
    };
    place();
    if (this.narrow.addEventListener) {
      this.narrow.addEventListener('change', place);
      this.d(() => this.narrow.removeEventListener('change', place));
    }
    this._place = place;
    /* `_paint` runs on every state change and calls `_place()` first, so the
       bar moves the moment the lesson starts or ends. */

    this.d(this.ctx.bus.on('tours:aux', (p) => this._aux(p)));
    this._paint();
  },

  /* The transport's state, on the bus AND on the handle. A panel built one
     frame after `_paint` has run would otherwise draw its Next in the default
     state and only correct itself at the next press. */
  _publishState(p) {
    try { (window.BEA || (window.BEA = {})).toursState = p; } catch (_) { /* no handle, no matter */ }
    this.ctx.bus.emit('tours:state', p);
  },

  _escapeSays(head, tail) {
    fill(this.escape, document.createTextNode(head), tail ? el('span.tr-bar__esctail', { text: tail }) : null);
  },

  _aux(p) {
    if (!this.aux) return;
    if (!p || !p.label) { fill(this.aux); return; }
    fill(this.aux, el('button.cx-more.tr-bar__auxb', {
      type: 'button', text: p.label,
      onclick: () => this.ctx.bus.emit(p.emit || 'tours:auxClick', p.payload || {}),
    }));
  },

  /* ================================================== the reading band ====
   *
   * WHICH WAY THE SHEET BAND SPLITS, AND WHY IT IS THE BEAT THAT DECIDES.
   *
   * Measured at 390x844 on the build this replaces, `.tr-panel__scroll`:
   * 129px of reading window against 2,135px of beat on step 17, the flagship
   * C6 beat — 16.6 screenfuls, four lines at a time, with the map holding
   * 192px to show a static India polygon. At 768x1024 the panel was 280px of
   * a 1,024px screen (27.3 %) and the map 391 (38 %).
   *
   * RESPONSIVE_LAW F1 splits the band the same way on every beat: the panel
   * gets `--cx-sheet-min`, the map gets the rest. That is right when the map
   * is the argument — the poster, the sweep, a beat that flies to a place —
   * and wrong when the argument is in the panel, which is twelve of the
   * twenty-five steps. So the split is published per step and the rule lives
   * in tours.css §17, which moves exactly one shell property.
   *
   * `map` is the default and the safe one: it is F1 unchanged. `text` is
   * taken only for the kinds whose work is in the panel, for every gate,
   * dispute and recall, or when a beat says `"fit": "text"` in tours.json.
   * A student's own press on the panel's `Map` control outranks all of it,
   * for as long as they stay on that step. */
  _fitFor(st) {
    if (!st) return null;
    if (st.kind === 'gate' || st.kind === 'dispute' || st.kind === 'recall') return 'text';
    const b = st.beat || {};
    /* THE THIRD CASE THE TWO COLUMNS COULD NOT SAY: a beat whose PLATE is the
       question and whose PANEL is the answer. Measured at 390x844 through the
       128px window a map-work beat gets: the poster's reveal is 1,096px of
       prose and a counted list — 8.6 screenfuls, the worst on the path — the
       spine's four engines 735px, the exits reveal 533px. All three are beats
       where the plate has to hold the band while the student LOOKS, and has
       finished its work the moment they commit (or the sweep stops). So the
       band moves then, and `Map` still moves it back. */
    if (b.fitAfter && this._revealed === this._stepKey(st)) return b.fitAfter;
    if (b.fit === 'map' || b.fit === 'text') return b.fit;
    if (TEXT_WORK.has(b.kind)) return 'text';
    /* AND THE TEST FOR THE REST IS WHETHER THE BEAT FLIES SOMEWHERE.
       A beat that names a place and flies to it can say what it has to say in
       a strip: measured at 390x844, Punjab at zoom 7 in a 92px band is still
       Punjab, still outlined, still labelled. A beat that shows the WHOLE
       WORLD cannot — the poster, the 1600-2024 sweep, the exits choropleth and
       the fourteen that are still British are arguments about the shape of the
       plate, and in 92px the Caribbean is one dot. Those four keep the full
       band; every other beat gives it to the prose, and one press on `Map`
       gives it back. */
    return (b.map && b.map.flyTo) ? 'text' : 'map';
  },

  /** A step's identity, so an override is forgotten the moment the step changes. */
  _stepKey(st) {
    if (!st) return '';
    return st.kind + ':' + (st.beat ? st.beat.id : (st.dispute && st.dispute.id) || (st.gate && st.gate.id) || (st.recall && st.recall.id) || String(st.n));
  },

  _publishFit() {
    const root = document.documentElement;
    const st = this.step;
    /* THE CLOSE DECLARES FOR ITSELF, AND NOT THROUGH THIS ATTRIBUTE.
       `data-tour-fit` is this module's contract about a BEAT, and the shell
       reads it only while a beat panel is mounted (chrome/index.js
       `_readWork` step 1). The Close, a gate's card and a recall card are
       sheet surfaces of the lesson with no beat panel in them; they declare
       with `ask:sheet`'s own `work` field, which is the same contract said
       about a surface. Writing an override here for them told the rest of the
       app that a step had declared something it had not. */
    const want = (this.running && !this.exploring && !this.finished) ? this._fitFor(st) : null;
    const key = this._stepKey(st);
    if (this._fitKey !== key) { this._fitKey = key; this._fitOverride = null; }
    if (this._revealed && this._revealed !== key) this._revealed = null;
    const fit = want ? (this._fitOverride || want) : null;
    if (fit) { if (root.getAttribute('data-tour-fit') !== fit) root.setAttribute('data-tour-fit', fit); }
    else if (root.hasAttribute('data-tour-fit')) root.removeAttribute('data-tour-fit');
    return fit;
  },

  /** The student's press. It flips this step only, and it announces the trade. */
  toggleFit() {
    const st = this.step;
    if (!st || !this.running) return;
    const now = document.documentElement.getAttribute('data-tour-fit');
    this._fitKey = this._stepKey(st);
    this._fitOverride = now === 'text' ? 'map' : 'text';
    const fit = this._publishFit();
    this.ctx.bus.emit('tours:fit', { fit });
    announce(fit === 'text' ? 'The map is a peek strip. The beat has the room.' : 'The map has the band. The beat is a reading window again.');
  },

  _paint() {
    const st = this.step;
    const running = this.running;
    this._publishFit();
    if (this._place) this._place();
    if (this.barDock) this.barDock.dataset.live = running && this.narrow && this.narrow.matches ? 'yes' : '';
    this.bar.dataset.state = !running ? 'idle' : (this.exploring ? 'explore' : 'running');
    this.bar.hidden = false;
    /* At second zero the bar is one quiet escape and nothing else: the path has
       not started, so Back and Next would be controls with nothing to control,
       and LAYOUT_BUDGET level 0 is nineteen controls, not twenty-five. */
    this.back.hidden = !running;
    this.next.hidden = !running;
    this.count.hidden = !running;
    if (this.toField) this.toField.hidden = true;

    if (!running) {
      /* A PERSISTENT, QUIET ROUTE INTO THE LESSON, IN EVERY STATE.
         ROUND 2: "Scrub the timeline once and the CTA changes from 'Start the
         lesson · 40 minutes' to 'Ask me'. I then enumerated every visible
         control on the page, opened Tools, and opened the Teaching desk: there
         is no route to the guided path anywhere on screen. A student who
         fiddles with the scrubber for ten seconds before starting has lost the
         flagship." The opening offer in the lede band is P22's and it is right
         to stand down once a reader is doing something else. THIS control is in
         the masthead and never stands down — and until this round it said
         "I'll explore on my own", which is an exit printed on a door nobody had
         come through. There is one thing to say before the lesson starts, and
         it is the lesson. */
      /* AND IT SAYS WHICH LESSON — DIDACTIC_SPEC §8.5, WAVE 10.
         "The name is the lesson's name — 'Lesson One: how it was taken' —
         never 'the lesson', never 'the guided path', never a bare duration."
         This control is the second door on the cold screen and it said "Start
         the lesson" beside a band CTA that names the route, so the two doors
         on one screen disagreed about what they opened. The name comes off the
         route, without its subtitle, for the reason the band's does: the
         masthead has room for a name and not for a sentence. The title
         attribute carries the rest, and its duration is `_offerSay()`, which is
         computed. */
      const label = (this.vmeta && this.vmeta.label) || '';
      const short = label.split(/[:—]/)[0].trim() || label;
      this._escapeSays(short ? 'Start ' + short : 'Start the guided route', '');
      this.escape.title = (label || 'The guided route') + ' — ' + this.required
        + ' steps, about ' + this._offerSay() + ' minutes';
      return;
    }
    fill(this.aux);

    if (this.exploring) {
      /* ROUND 2: "'Rejoin at 7' is printed on the same bar as '9 / 24'. Two
         numbering systems on one strip, on the one control whose job is to get
         the student back." It did return to step 9; the label counted beats.
         The counter beside it is the step index, so this is the step index and
         it says which number it is. */
      this._escapeSays('Rejoin at step ' + (this.i + 1), '');
      return;
    }
    /* THE MASTHEAD IS THE MOST CONTESTED ROW IN THE APP and round 2 measured
       it overflowing with no scroll and no collapse. Two of the controls in it
       are this piece's, so this one gives up its tail below 100rem rather than
       asking anyone else to give up theirs. */
    this._escapeSays('Explore', ' on my own');

    /* THE COUNTER COUNTS WHAT THE STUDENT HAS TO DO.
       Round 2: "the bar reads 14 / 14 while three further forward-edge gates
       and the Close still follow, and at gate beats it renders 14 / 14GATE
       with no space." Both come from counting beats and numbering gates by the
       beat in front of them. A gate is a step: you cannot get past it without
       doing something, so it is in the denominator, and the word beside it is
       a separate element with its own spacing. */
    if (this.finished) {
      fill(this.count, el('span.tr-bar__end', { text: 'the end' }));
      this.next.hidden = true;
      this.back.hidden = false;
      this.back.disabled = false;
      this.escape.textContent = 'Explore on my own';
      this._publishState({ running: true, exploring: false, locked: false, done: true });
      return;
    }
    const mark = !st ? null
      : st.kind === 'gate' ? el('span.tr-bar__lock', { text: 'gate', title: 'Place the fact to go on' })
        : st.kind === 'dispute' ? el('span.tr-bar__lock.tr-bar__lock--dispute', { text: 'argue', title: 'Take a side in this argument to go on' })
          : st.kind === 'recall' ? el('span.tr-bar__lock.tr-bar__lock--recall', { text: 'recall', title: 'Something from earlier, asked again' })
            : null;
    /* AN OPTIONAL STEP IS NOT step 25 OF 24. It is past the end of the counter,
       it was never in the denominator, and saying so is the difference between
       an extra a student chose and a lesson that miscounted itself. */
    if (st && st.optional) {
      fill(this.count, el('span.tr-bar__extra', { text: 'past the end' }));
    } else {
      fill(this.count,
        el('span.num', { text: String(this.i + 1) }),
        el('span.tr-bar__of', { text: ' / ' }),
        el('span.num', { text: String(this.required) }),
        mark);
    }

    this.back.disabled = this.i === 0;
    const last = st && st.optional ? true : this.i >= this.required - 1;
    const blocked = this.locked;
    this.next.disabled = blocked;
    /* Unfocusable, not merely disabled: charge 11 is about routing around, and
       a control you can still Tab to and press Enter on is a control you can
       route around with the keyboard. */
    if (blocked) this.next.setAttribute('tabindex', '-1');
    else this.next.removeAttribute('tabindex');
    this.next.dataset.locked = blocked ? 'yes' : '';
    /* The word, always. `.tr-bar__w` is visually hidden under 62rem so that Back
       and Next can be two arrows in a 143px floating bar — which is right for
       "Next" and wrong for a control that is refusing to move, because an
       unlabelled dashed dot is not a refusal a student can read. tours.css
       exempts `[data-locked="yes"]` from that rule; the short form is used so
       the bar still fits a 390px window. */
    /* THE REFUSAL SAYS WHAT IT IS REFUSING FOR. A gate says "Place it"; a beat
       that holds Next until two documents have been weighed says "Say what each
       knew". One word on one control that means five different things is a
       control a student cannot learn. Authored per beat as `holdSay` /
       `holdHint`; the gate's own words are the default. */
    /* AND A STEP THAT IS NOT A GATE DOES NOT ASK FOR A FIELD. The default
       wording is the Complication Gate's, which is right for a gate and wrong
       for the argument between historians: that step wants a side and a
       sentence and has no two-axis field on it at all. Same class of defect as
       round 7's foot-versus-bar mismatch, one step further along. */
    const st2 = this.step;
    const lockW = (blocked && this.lockSay)
      || (blocked && st2 && st2.kind === 'dispute' ? 'Take a side' : 'Place it');
    /* WCAG 2.5.3: the hint IS the accessible name of Next while it is locked,
       so it has to start with the word printed on the button. "Place it" over
       "Place the fact on the field below to go on" failed that — a speech-input
       user says "Place it" and nothing matches. */
    const lockH = (blocked && this.lockHint)
      || (blocked && st2 && st2.kind === 'dispute'
        ? 'Take a side in this argument, and say why, to go on'
        : 'Place it — put the fact on the field below to go on');
    fill(this.next,
      el('span.tr-bar__w', { text: blocked ? lockW : (last ? 'Finish' : 'Next') }),
      el('span.tr-bar__arrow', { 'aria-hidden': 'true', text: blocked ? '↓' : '→' }));
    this.next.title = blocked ? lockH : (last ? 'Finish (Enter)' : 'Next (→ or Enter)');
    /* THE REFUSAL IS SPOKEN EVEN WHERE IT IS NOT PRINTED. Below 46rem the word
       on this control stands down (the 9rem box will not carry it beside the
       counter, and the 44px twin at the foot of the panel prints it in full),
       so the accessible name has to carry what the label would have said. */
    this.next.setAttribute('aria-label', blocked
      ? lockH
      : (last ? 'Finish the lesson' : 'Next beat'));
    this.toField.hidden = !blocked;

    /* AND THE TWIN AT THE FOOT OF THE PANEL SAYS THE SAME WORD.
       ROUND 7, the phone critic: "tours/panel.js:393 hardcodes `nextw
       .textContent = locked ? 'Place it first' : …` and ignores the step's
       published lockSay, so at step 11 the bar says 'Write the four ↓' and the
       thumb-zone foot says 'Place it first ↓' — with aria-label 'Place the
       fact on the field above' on a beat that has no field." The refusal is
       authored once, per beat, and it is now published with the state rather
       than left for a second control to guess at. */
    this._publishState({
      running, exploring: this.exploring, locked: blocked, done: last,
      lockSay: blocked ? lockW : null,
      lockHint: blocked ? lockH : null,
    });
  },

  /* ================================================== wiring ============= */

  _wire() {
    const { bus, store } = this.ctx;
    this.d(bus.on('tours:start', (p) => this._start((p && p.step) || 0)));
    this.d(bus.on('tours:goBeat', (p) => this._goto(p)));
    this.d(bus.on('tours:explore', () => this.explore()));
    /* THE TRANSPORT, REACHED FROM THE PANEL. The thumb-zone twin at the foot of
       the beat sheet (RESPONSIVE_LAW's docked band; `panel.js` `frame()`) is a
       control in somebody else's rectangle, so it asks over the bus rather than
       holding a reference to this object. One transport, two places to press
       it. */
    this.d(bus.on('tours:next', () => this.advance()));
    this.d(bus.on('tours:back', () => this.prev()));
    this.d(bus.on('tours:rejoin', () => this.rejoin()));
    /* The peek strip's own control, from the panel foot (panel.js `frame`).
       `{ toggle: true }` is the press; the echo carries the settled state so
       every copy of the button repaints from one answer. */
    this.d(bus.on('tours:fit', (p2) => { if (p2 && p2.toggle) this.toggleFit(); }));
    /* Any retrieval card that opens while the path is running gets our foot,
       whoever opened it. See `_footAnySheet`. Two frames, because the piece
       that owns the card fills the body after the shell has announced it. */
    this.d(bus.on('chrome:sheet', (p2) => {
      if (!p2 || !p2.open || !/^(quiz:|tours:recall:)/.test(String(p2.id || ''))) return;
      requestAnimationFrame(() => requestAnimationFrame(() => this._footAnySheet()));
      setTimeout(() => this._footAnySheet(), 400);
    }));
    /* The rail holds one surface at a time. Ours is only ours while the last
       thing the shell put in it was ours; closing somebody else's sheet
       because our beat moved is how two pieces end up fighting over one
       column. */
    this.d(bus.on('chrome:sheet', (p) => {
      this.sheetId = p && p.open ? String(p.id || '') : null;
      this._sheetStomped(p);
    }));
    /* The map decides to enlarge itself on a measurement taken up to two
       seconds after a panel opens, so a single check when the panel opens is
       not enough: watch the event it publishes when it does. */
    this.d(bus.on('map:enlarged', (p) => { if (this.running && p && p.enlarged) this._unbury(); }));
    /* THE PATH HAS AN END AND THE BAR HAS TO SAY SO. Round 2's build left the
       counter reading "23 / 23 GATE" and the band still holding the last
       gate's instruction while the Close was open on the rail — a screen
       telling a student to place a fact they had just placed, under a heading
       that said the lesson was over. */
    /* The lesson is over: hand the atlas back exactly as P06 would have it for
       a reader who never took a lesson. A setting the path needed is not a
       setting to leave pinned on somebody who has finished. */
    /* `_paint` clears the masthead's aux slot on every repaint, and `_sayEnd`
       is what fills it with the offer of the optional step, so it runs after. */
    this.d(bus.on('close:opened', () => { this.finished = true; this._pressureAuto(); this._paint(); this._sayEnd(); }));
    this.d(bus.on('chrome:layout', () => { if (this.running) this._unbury(); }));
    this.d(bus.on('tours:panel', () => { const st = this.step; if (st && st.kind === 'beat') this._openPanel(st.beat, true); }));
    this.d(bus.on('tours:essay', (p) => this._openEssay((p && p.chapter) || (this.step && this.step.beat && this.step.beat.chapter))));

    /* Free exploration feeds the path: a place opened off the spine is a fact
       this student produced, so the beat that would have presented it becomes a
       question instead. Nothing else about a selection is recorded. */
    this.d(store.watch((s) => s.selectedTerritoryId, (id) => {
      if (!id || this._applying) return;
      /* A beat's own selection is not a discovery. The store notifies on the
         next frame, by which time `_applying` is long false, so the beat says
         out loud what it selected and that one id is exempt. */
      if (id === this._tourSel) return;
      if (!this.ledger.found(id)) {
        this.ledger.append({ kind: 'found', claimId: id, beatId: this.step && this.step.beat && this.step.beat.id, year: store.getState().year });
      }
    }));

    const onKey = (ev) => {
      if (!this.running || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey || ev.shiftKey) return;
      const t = ev.target;
      if (t instanceof Element) {
        /* The year, the plate and every form field own their own arrows. The
           path only takes a key nobody else is using at that moment. */
        if (t.closest('input,textarea,select,[contenteditable=""],[contenteditable="true"]')) return;
        if (t.closest('.app__stage, .app__time, .app__dossier')) return;
        if ((ev.key === 'Enter' || ev.key === ' ') && t.closest('button,a[href],[role="button"]')) return;
      }
      if (ev.key === 'ArrowRight' || ev.key === 'Enter') { ev.preventDefault(); this.advance(); return; }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); this.prev(); }
    };
    document.addEventListener('keydown', onKey);
    this.d(() => document.removeEventListener('keydown', onKey));
  },

  /* ================================================== moving ============= */

  _start(i = 0, { silent } = {}) {
    /* A RUN BEGINS AT THE TOP. Starting the lesson from its first step is a
       new run, and every forward edge on it holds again (see `_runReset`).
       Restoring from the URL is NOT a new run — `silent` says so — because a
       reload in the middle of a lesson is the same run continued, and asking
       a student to place the same fact twice because they refreshed would be
       the gate punishing them for the browser. */
    if (!silent && i === 0) this._runReset(this.variant);
    this.running = true;
    this.i = Math.max(0, Math.min(this.steps.length - 1, i));
    this.exploring = false;
    if (!silent) this.ctx.store.dispatch('startTour', { id: this.variant, step: this.i });
    this._apply();
  },

  _goto(p) {
    if (!p) return;
    let i = -1;
    if (p.id) i = this.steps.findIndex((s) => (s.kind === 'beat' && s.beat.id === p.id));
    if (i < 0 && Number.isFinite(p.n)) i = this.steps.findIndex((s) => s.n === p.n && s.kind === 'beat');
    if (i < 0) return;
    this.running = true;
    this.exploring = false;
    /* Reached from the Close — the offer of the optional step is made there —
       so the run is no longer over. */
    this.finished = false;
    this.i = i;
    this._apply();
  },

  advance() {
    if (!this.running) { this._start(0); return; }
    if (this.locked) { announce('Place the fact on the field before going on.'); return; }
    if (this.exploring) { this.rejoin(); return; }
    const st = this.step;
    const lastRequired = !st || st.optional ? true : this.i >= this.required - 1;
    if (lastRequired) { this.ctx.bus.emit('close:open', { reason: 'finished' }); return; }
    this.i += 1;
    this._apply();
  },

  prev() {
    if (!this.running) return;
    /* Back from the Close is back into the lesson, at the step it ended on. */
    if (this.finished) { this.finished = false; this._apply(); return; }
    if (this.i === 0) return;
    if (this.exploring) { this.rejoin(); return; }
    this.i -= 1;
    this.locked = false;
    this._apply();
  },

  /**
   * A SHIM, AND THE DEFECT IT STANDS IN FOR.
   *
   * `app/js/panels/dossier/index.js:512` closes the rail sheet whenever its own
   * panel re-renders while it thinks a section of its own is open there:
   *
   *     if (this.sheets.has(this.openSheetId)) …
   *     else { this.openSheetId = null; this.bus.emit('ask:sheet', null); }
   *
   * `ask:sheet null` closes whatever is in the rail, not merely the dossier's
   * own surface, and a beat selects a territory — so the dossier re-renders one
   * frame after a beat opens its panel. Measured: open Egypt off the path,
   * reach the Egypt beat, let P10's checkpoint interpose and press "show me the
   * beat", and the beat came back for one frame and was then closed under the
   * reader, leaving its title over an empty rail. THE OWNING FIX IS THE
   * DOSSIER'S: close your own surface by id, not the column.
   *
   * Until it lands, a beat that is closed within a second of opening — which no
   * reader does, and which the × on the sheet is indistinguishable from only in
   * that window — is put back once. Once, per beat entry: if it is closed again
   * it was the reader, and the reader wins.
   */
  _sheetStomped(p) {
    if (!p || p.open) return;
    if (!this.running || this.exploring || this.finished) return;
    if (!this._openedAt || !this._openedId) return;
    if (String(p.id || '') !== this._openedId) return;
    if (Date.now() - this._openedAt > 1000) return;
    if (this._reasserted === this._openedId) return;
    this._reasserted = this._openedId;
    const st = this.step;
    if (!st) return;
    setTimeout(() => {
      if (!this.running || this.exploring || this.finished || this.step !== st) return;
      if (st.kind === 'beat') this._openPanel(st.beat, true);
      else if (st.kind === 'gate') this._applyGate(st);
      else if (st.kind === 'dispute') this._applyDispute(st);
    }, 30);
  },

  /** True if the rail is currently showing something this piece put there. */
  _ownsSheet() { return typeof this.sheetId === 'string' && this.sheetId.startsWith('tours:'); },
  _dropSheet() { if (this._ownsSheet()) this.ctx.bus.emit('ask:sheet', null); },

  /** Warns nothing, blocks nothing, keeps the spine band and the map. */
  explore() {
    if (!this.running) return;
    this._stopSweep();
    this.exploring = true;
    this._pressureAuto();
    this._dropSheet();
    const st = this.step;
    const b = st && (st.beat || null);
    /* PRIORITY 58, NOT 45 AND NOT 55. The open question is the thread back into
       the lesson, and 45 lost it: chrome speaks its own sentence at 50 whenever
       the year or the selection changes, which is the first thing a reader does
       in free exploration. 55 then lost it again, to a tie: P03 says its own
       ending sentence at 55 when the year reaches the end of the record, and
       equal priority means newest wins. Measured under reduced motion, stepping
       off the path at the last beat left the band holding "The empire has no
       closing date" and no way back into the lesson anywhere on screen. 58 is
       above every other piece's moment and below the sweep (60) and a running
       beat (65), which is the rank this sentence actually has: nothing is
       running, and it is the only thing on screen that knows where the student
       was. */
    this.ctx.bus.emit('ask:say', {
      id: 'tours:beat', priority: 58,
      mark: 'exploring',
      text: b ? ('Your open question: ' + this._openQuestion(b)) : 'Exploring. The lesson is where you left it.',
      cta: { label: 'Rejoin at step ' + (this.i + 1), emit: 'tours:rejoin' },
    });
    this._paint();
    this.ctx.bus.emit('tours:beat', { id: b && b.id, n: st && st.n, total: this.totalBeats, exploring: true });
    announce('Exploring on your own. The lesson is held at ' + this._where().toLowerCase() + '.');
  },

  rejoin() {
    if (!this.running) return;
    this.exploring = false;
    this.ctx.store.dispatch('startTour', { id: this.variant, step: this.i });
    this._apply();
    announce('Back on the lesson. ' + this._where() + '.');
  },

  _leave() {
    this._stopSweep();
    this._pressureAuto();
    this.running = false;
    this.exploring = false;
    this._fitOverride = null;
    this._fitKey = null;
    this.ctx.bus.emit('ask:say', { id: 'tours:beat', text: null });
    this._dropSheet();
    this._paint();
  },

  /* What the reader was in the middle of, in the words they last saw. A title
     is a label; the thread back to a lesson has to be the thing that was being
     asked or said. */
  _openQuestion(b) {
    const p = b.panel || {};
    return p.question || this._plain(b.say) || p.title || '';
  },

  /* ================================================== applying a beat ==== */

  _apply() {
    const st = this.step;
    if (!st) return;
    this.finished = false;
    const { store, bus } = this.ctx;

    this._applying = true;
    if (store.getState().activeTour !== this.variant) store.dispatch('startTour', { id: this.variant, step: this.i });
    else store.dispatch('setTourStep', this.i);
    this._applying = false;

    this._reasserted = null;
    /* BEFORE THE BRANCH, NOT AFTER IT. A gate, a dispute and a recall each
       return from here into their own renderer, and two of the three do not
       come back through `_paint`. Measured: steps 13 and 23 — both recalls —
       kept the previous beat's `map` split and drew a 527px retrieval block
       into a 198px body. */
    this._publishFit();
    if (st.kind === 'gate') { this._applyGate(st); return; }
    if (st.kind === 'dispute') { this._applyDispute(st); return; }
    if (st.kind === 'recall') { this._applyRecall(st); return; }

    const b = st.beat;
    const m = b.map || {};
    this.locked = false;
    this.lockSay = null;
    this.lockHint = null;
    this._tourSel = m.sel || null;

    /* One batch, so the map, the timeline, the ribbon and the dossier all move
       on the same frame instead of chasing each other for four. */
    this._applying = true;
    store.batch((d) => {
      if (Number.isFinite(m.year)) d('setYear', m.year);
      d('select', m.sel || null);
      if (m.layer) d('setLayer', m.layer);
    });
    this._applying = false;

    this._pressure(m.pressure);
    if (m.def) bus.emit('map:setDefinition', { id: m.def });
    if (m.proj) bus.emit('map:setProjection', { id: m.proj });
    /* A beat that names a place flies to it; a beat that does not is about the
       whole map, and must not inherit the last beat's camera. Round one ended
       the lesson on "count what is left" while still zoomed to the Bay of
       Bengal. `BEA.map.home()` is the map's own published drive surface. */
    if (m.flyTo) bus.emit('ask:flyTo', { territoryId: m.flyTo, zoom: m.zoom || null });
    else this._home();

    /* The sentence. One, in the band, at reading size, where every other piece
       in this app also speaks. Priority 65: a beat is the most urgent sentence
       this app has while a beat is running, and it must not be left holding a
       clause from something that finished two beats ago. */
    this._stopSweep();
    bus.emit('ask:say', {
      id: 'tours:beat', priority: 65,
      mark: b.ledeMark || b.mark,
      /* THE LEDE IS THE PANEL'S OWN SENTENCE, SAID SHORTER, AND IT MAY NOT
         TYPE A NUMBER EITHER. The band the shell draws is plain text, so the
         registered value is substituted here and the marker and its check line
         stay in the panel, on the same screen, where the beat prints them in
         full. `tools/check-path-numbers.js` reads the token, not the value, so
         the quantity is warranted wherever it is met. */
      text: figPlain(b.say),
      cta: this.chapters.get(b.chapter) && this.chapters.get(b.chapter).essay
        ? { label: 'The argument', note: 'in full', emit: 'tours:essay', payload: { chapter: b.chapter } }
        : null,
    });

    if (b.kind === 'sweep') this._runSweep(b);
    if (m.paintStillBritish) this._paintRemaining();

    this._openPanel(b);
    this.ledger.append({ kind: 'completed', beatId: b.id, t: b.t, claimId: 'p05:beat:' + b.id, year: m.year });

    bus.emit('tours:beat', { id: b.id, n: st.n, total: this.totalBeats, t: b.t, chapter: b.chapter, exploring: false });
    /* ONE PLACE, ONE NUMBER. Round 3: "the bar says 1 / 23 while the live region
       announces Beat 1 of 14 — a screen-reader user and a sighted user are told
       different things about where they are." Both numbers were true and that
       was the problem. The announcement now leads with the number in the bar,
       and says what the other number means rather than substituting it. */
    announce(this._where() + '. ' + (b.panel && b.panel.title ? b.panel.title + '. ' : '') + this._plain(b.say));
    this._paint();
  },

  /**
   * ONE ARGUMENT PER BEAT, INCLUDING THE ONES THIS PIECE DID NOT DRAW.
   *
   * Round 3: "the informal-empire layer (£320m / £36m over Argentina, with the
   * Gallagher and Robinson note) is switched on during guided beats where it is
   * not the payload — it is on at beat 14, the self-government two-track —
   * adding a second argument to a beat that is supposed to carry one."
   *
   * P06 turns the pressure haze on by itself for any year between 1830 and 1914
   * on the status plate, which is the right default for a reader wandering the
   * atlas and the wrong one inside a beat whose single T-number is somewhere
   * else. The path therefore states what it wants, using P06's own published
   * control, and states it on EVERY beat rather than only where it differs — a
   * beat that inherits the last beat's argument is the defect.
   *
   * `null` puts the filter back to P06's automatic behaviour, and free
   * exploration gets that back the moment the student steps off the path: a
   * setting the lesson needed is not a setting to leave pinned on somebody who
   * has stopped taking the lesson.
   */
  _pressure(want) {
    const v = want === true ? 'on' : want === false || want == null ? 'off' : null;
    this._applying = true;
    try { this.ctx.store.dispatch('setFilter', { pressure: v }); } catch (_) { /* the filter is somebody else's */ }
    this._applying = false;
  },

  _pressureAuto() {
    this._applying = true;
    try { this.ctx.store.dispatch('setFilter', { pressure: null }); } catch (_) { /* the filter is somebody else's */ }
    this._applying = false;
  },

  _plain(html) { return figPlain(String(html || '').replace(/<[^>]+>/g, '')); },

  /** The sentence the counter in the bar would say if it could speak. */
  _where() {
    const st = this.step;
    if (st && st.optional) return 'An extra step, past the end of the lesson. Nothing waits on it.';
    const n = this.i + 1;
    const total = this.required;
    const kind = !st ? ''
      : st.kind === 'gate' ? ', a complication'
        : st.kind === 'dispute' ? ', an argument between historians'
          : st.kind === 'recall' ? ', asked again from earlier' : '';
    const beat = st && st.n ? ' — beat ' + st.n + ' of ' + this.totalBeats : '';
    return 'Step ' + n + ' of ' + total + kind + beat;
  },

  /**
   * THE END, AND THE ONE CASE THAT IS NOT BRITAIN'S.
   *
   * ROUND 2, two critics: "the Congo beat exists at #step=25, is marked
   * optional, and is offered nowhere: the words Congo, Lumumba, off this map
   * and One more return zero hits in the 8,381 characters of the Close. It is
   * the only thing in the app that takes the frame away from Britain, and it is
   * the difference between C8=4 and C8=5." The offer was on the last required
   * step's panel and nowhere after it, so a student who pressed Finish had lost
   * it for good. The Close is P21's surface and this piece does not write into
   * it; what it owns is the band and the masthead, and both of them are on
   * screen beside the Close. So the offer is made twice, in the two places this
   * piece is allowed to speak, and neither of them can be scrolled past.
   */
  _sayEnd() {
    const opt = this._optionalBeat();
    const off = opt && opt.panel && opt.panel.offer;
    this.ctx.bus.emit('ask:say', {
      id: 'tours:beat', priority: 65,
      mark: 'the end',
      text: opt
        ? 'That is the lesson. The map is still here — and so is one case that is not Britain\u2019s, which breaks the claim you have just assembled.'
        : 'That is the lesson. The map is still here, and so is everything you did not open.',
      cta: opt ? { label: (off && off.label) || 'One more, off this map', emit: 'tours:goBeat', payload: { id: opt.id } } : null,
    });
    if (opt) {
      this._aux({
        label: (off && off.label) || 'One more, off this map',
        emit: 'tours:goBeat', payload: { id: opt.id },
      });
    }
  },

  _home() {
    const api = window.BEA && window.BEA.map;
    if (api && typeof api.home === 'function') { try { api.home(); } catch (_) { /* the plate may not be drawn yet */ } }
  },

  /* ================================================== the sweep ========= */

  /**
   * DIDACTIC_SPEC §8, 00:02–00:05: "a twenty-five second animated sweep,
   * 1600→1997, with the band lighting each phase and one clause per phase on
   * screen." The shell also runs a sweep, from its own CTA, and that one stays
   * where it is for a reader who never starts the lesson. This one belongs to
   * the path, which is why it is here: a beat has to be able to STOP what it
   * started when the reader presses Next, and a sweep that keeps writing the
   * band and moving the year after the beat has ended is a beat that has
   * escaped its own boundaries. Under reduced motion it is four held plates.
   */
  _runSweep(beat) {
    const { store, bus } = this.ctx;
    const b = store.getState().bounds || { min: 1600, max: 1997 };
    const from = Math.max(b.min, 1600);
    const to = Math.min(b.max, 1997);
    const phases = (beat.panel && beat.panel.phases) || SWEEP_PHASES;
    const reduced = document.documentElement.dataset.motion === 'reduced'
      || (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
          && document.documentElement.dataset.motion !== 'full');

    let said = null;
    const say = (y) => {
      let p = null;
      for (const ph of phases) if (y >= ph.from && y <= ph.to) p = ph;
      if (!p || p === said) return;
      said = p;
      bus.emit('ask:say', { id: 'tours:beat', priority: 65, mark: p.numeral + '  ' + p.from + '–' + p.to, text: p.clause });
    };

    store.dispatch('pause');

    if (reduced) {
      const stops = [from, 1783, 1900, to];
      let i = 0;
      const tick = () => {
        if (!this.sweep) return;
        this._applying = true; store.dispatch('setYear', stops[i]); this._applying = false;
        say(stops[i]);
        if (++i >= stops.length) { this._stopSweep(); return; }
        this.sweep.timer = setTimeout(tick, 2200);
      };
      this.sweep = { timer: 0 };
      tick();
      return;
    }

    const DUR = 25000;
    const t0 = performance.now();
    let last = -1;
    const frame = (t) => {
      if (!this.sweep) return;
      const k = Math.min(1, (t - t0) / DUR);
      const y = Math.round(from + (to - from) * k);
      if (y !== last) {
        last = y;
        this._applying = true; store.dispatch('setYear', y); this._applying = false;
        say(y);
      }
      if (k >= 1) { this._stopSweep(); return; }
      this.sweep.raf = requestAnimationFrame(frame);
    };
    this.sweep = { raf: requestAnimationFrame(frame) };
  },

  _stopSweep() {
    if (!this.sweep) return;
    if (this.sweep.raf) cancelAnimationFrame(this.sweep.raf);
    if (this.sweep.timer) clearTimeout(this.sweep.timer);
    this.sweep = null;
    /* THE SWEEP IS OVER, SO THE PLATE'S TURN IS OVER. The spine's four bands
       are the argument for twenty-five seconds and its four engines are four
       paragraphs afterwards — 735px of them, measured in a 128px window at
       390x844. `fitAfter` hands the band to the reading at the moment the
       animation stops, and `Map` hands it back. */
    const st = this.step;
    if (st && st.beat && st.beat.fitAfter) { this._revealed = this._stepKey(st); this._publishFit(); }
  },

  _openPanel(b, force) {
    const { bus, data, store } = this.ctx;
    const p = b.panel || {};
    /* A student who found this place for themselves is asked, not told.
       THE DECISION IS TAKEN ONCE PER ENTRY AND THEN REMEMBERED. It reads the
       Ledger, and `_apply` writes a `completed` line to the Ledger a moment
       after it opens this panel — so re-opening the same beat (P10 interposes a
       checkpoint on the rail and offers "show me the beat", which comes back
       through here) re-read a Ledger that now said the beat was done, and the
       question silently became a statement. Measured: open Egypt off the path,
       reach the Egypt beat, press "show me the beat", and the retrieval was
       gone. */
    const sel = b.map && b.map.sel;
    if (!this._retrievalAt || this._retrievalAt.beatId !== b.id) {
      this._retrievalAt = {
        beatId: b.id,
        on: !!(b.kind === 'present' && sel && this.ledger.found(sel) && !this.ledger.didBeat(b.id)),
      };
    }
    const retrieval = this._retrievalAt.on
      ? { on: true, prompt: 'You opened <strong>' + this._name(sel) + '</strong> on your own before the lesson reached it. Before you read our account: what was it, legally, and who lost it? Say it to yourself, then check.' }
      : null;

    const built = buildPanel({
      beat: b, data, bus, store, ledger: this.ledger, retrieval,
      /* "the thirty-minute path PLUS the essay panels" (§8.2), read literally:
         on the long run the chapter's argument is in the panel at the chapter's
         first beat, not one press away behind a control most readers never
         press. On every other run it stays where it was. */
      essay: this.vmeta.essays && this._firstOfChapter(b) ? this.chapters.get(b.chapter) : null,
      onCommit: (entry) => { this.ledger.append(entry); this._afterCommit(b, entry); this._paint(); },
      /* A BEAT THAT HOLDS THE FORWARD EDGE.
         ROUND 3, the phone: "Next is enabled on first paint on 19 of 25 steps,
         including step 17 (the Dyer/Tagore beat, 16.6 screenfuls) and step 25
         (the Congo)… Inside a 129px window Next is the largest lit control on
         screen and the work is below the fold, so on a phone the incentive
         gradient points at skipping. Gate the two beats that carry C6 and C8
         the way the Complications are gated."
         `buildPanel` has always returned `ready:false` while a commitment is
         outstanding and nothing read it. It is read now, on the beats that say
         `"hold": true` — the two two-in-tension beats, the source beat and the
         off-map case — and released the moment the commitment lands. Every one
         of them has a named, recorded way out that is not silence: the tension
         beats commit whatever you choose, the source beat offers "I would
         rather read this atlas's four lines", and the off-map case takes
         "fits", "strains" or "breaks". Holding a student at a beat with no way
         through would be worse than letting them skip it. */
      onReady: () => { if (b.hold) this.locked = false; this._paint(); },
      onOpenRecord: (id) => {
        this._dropSheet();
        store.dispatch('select', id);
        bus.emit('ask:flyTo', { territoryId: id });
      },
      /* WHICH ROUTE THIS IS, AND THE OTHER ONE, on the first beat of either.
         It is printed where the student is already reading rather than in a
         masthead control, because at 390px the masthead has room for the mark,
         the transport and `Tools` and nothing else (RESPONSIVE_LAW §2). */
      routes: this._firstStep(b)
        ? { here: this.variant, list: this._offerRoutes(), onPick: (id) => this._pickRoute(id) }
        : null,
    });

    /* EVERY BEAT OPENS ITS PANEL, AT EVERY WIDTH.
       Round 1 shipped a narrow-viewport branch: a beat with nothing to answer
       did not take the rail, so the map stayed and the account was one press
       away in the band. Measured on the running app at 390x844 and 768x1024
       that produced the single worst defect of the round — beats 2 and 3
       rendered as the previous beat's sheet title over an empty body, the
       dossier took the rail instead, and the lesson could not be finished on a
       phone at all. A branch that shows the lesson on one class of device and
       not another is not a layout decision, it is two products. The sheet
       stops above the time bar and leaves the plate its floor (B2: 360x150 at
       390 wide; measured 390x307 with the panel open), so the map is still
       there and the year is still reachable. */
    /* The optional step past the end is offered from the last step of the
       route — whatever kind of step that turns out to be — and nowhere else. */
    if (this._lastRequired() && this._optionalBeat() && !b.optional) {
      built.node.append(this._offerNode(this._optionalBeat()));
    }
    if (b.hold && built.ready === false) {
      this.locked = true;
      this.lockSay = b.holdSay || 'Answer it';
      this.lockHint = b.holdHint || (b.holdSay ? b.holdSay + ' — answer this beat before going on' : 'Answer the question in this beat before going on');
    }

    /* LAST, ALWAYS. `frame` moves everything already in the node into its own
       scroller and puts the foot after it; anything appended afterwards would
       be outside both. */
    frame(built.node, bus);

    this._openedId = 'tours:beat:' + b.id;
    this._openedAt = Date.now();
    bus.emit('ask:sheet', {
      id: this._openedId,
      /* ROUND 2: "the Congo beat carries the eyebrow 'IT IS NOT FINISHED'
         inherited from the previous chapter." A step past the end of the
         counter is not in the chapter whose file it sits in, so it may name
         itself; every other beat still takes its chapter's title. */
      eyebrow: (b.panel && b.panel.eyebrow) || (this.chapters.get(b.chapter) || {}).title || 'the lesson',
      title: (b.panel && b.panel.title) || b.ledeMark || 'This beat',
      node: built.node,
    });
    this._unbury();
  },

  /**
   * A REPAIR WITH A MEASUREMENT BEHIND IT, AND A DEFECT REPORT ATTACHED.
   *
   * At 768x1024 the beat panel's head and its first paragraph are painted over
   * by the map. The map is not misbehaving on purpose: under 62rem it moves
   * itself into the shell's overlay layer as `.map.is-enlarged` (z 58, inside
   * `.app__overlay` at z 70) when it measures that panels are covering it, and
   * `map/index.js::_dossierRect()` — the function that keeps the enlarged
   * plate off the panel it is dodging — queries `.app__dossier` only. It has
   * never heard of `.app__sheet`, which is where every teaching surface in
   * this app now lives. That is a one-line fix in a file this piece does not
   * own (add the sheet to that query), and it is reported as such.
   *
   * Until it lands, the lesson cannot be legible only on desks. So: measure
   * whether the top of our own panel is actually visible, and if it is not,
   * ask the map to shrink through its own published handle — and only when the
   * student has not chosen enlarged themselves, so we never undo a decision
   * they made. If the map is fixed, this measures clean and does nothing.
   */
  /**
   * THE COUNTED FIGURE BELONGS INSIDE THE BEAT THAT HOSTS IT.
   *
   * `viz/index.js` mounts its on-path figure by appending `.viz-onpath` to
   * `.cx-sheet__body` — a SIBLING of the beat panel. That is the right place
   * for it to arrive: a module may not know another module's internals, and
   * the sheet body is the shell's published surface. It is the wrong place for
   * it to stay below 62rem, and RESPONSIVE_LAW §11's R4 measures exactly why.
   *
   * Measured at 390x844 on the loop beat: `.cx-sheet__body` 568 holding 1,315
   * — panel 524, figure 727, spine 33 — with `.tr-panel__scroll` 471/2,164
   * inside it. Two touch scroll regions stacked, and a thumb flick landed in
   * whichever one the band under it belonged to. tours.css's own fallback
   * called that "the honest answer when there is more in it than can be
   * shown", and it is not: the honest answer is ONE reading window, and the
   * figure is part of what this beat is asking the student to read — it is the
   * beat's `onPath` payload, it is priced into this beat's own budget by
   * `budget.js::beatCost`, and `quiz/index.js` counts a commitment on it as
   * having met the beat's second T-number.
   *
   * So it is adopted into the panel's own flow, where the panel's scroller
   * carries it and the body goes back to being a column. Nothing is copied and
   * nothing is rebuilt: the node the viz module made is moved, it stays
   * `isConnected`, so that module's own retry ladder sees its work is done and
   * its `_detachPath` still removes it from wherever it is. Above 62rem the
   * body is not a scroller and there is nothing to fix, so this does not fire.
   */
  _adoptOnPath() {
    if (window.matchMedia && !window.matchMedia('(max-width: 61.999rem)').matches) return;
    const body = document.querySelector('.app__sheet .cx-sheet__body');
    if (!body) return;
    const flow = body.querySelector('.tr-panel > .tr-panel__scroll > .tr-panel__flow');
    if (!flow) return;
    for (const fig of [...body.children]) {
      if (!fig.classList || !fig.classList.contains('viz-onpath')) continue;
      flow.append(fig);
    }
  },

  /** Watch the rail for a figure another module drops in beside our panel. */
  _watchOnPath() {
    if (this._onPathObs) return;
    const sheet = document.querySelector('.app__sheet');
    if (!sheet) return;
    let queued = false;
    this._onPathObs = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; this._adoptOnPath(); });
    });
    try { this._onPathObs.observe(sheet, { childList: true, subtree: true }); } catch (_) { this._onPathObs = null; }
    this.d(() => { if (this._onPathObs) { try { this._onPathObs.disconnect(); } catch (_) { /* gone */ } } });
  },

  _unbury() {
    this._watchOnPath();
    this._adoptOnPath();
    /* The map takes its decision on a measurement up to two and a half seconds
       after a panel opens (map/index.js schedules fits at 300, 900 and 2200ms),
       so this is asked on that same rhythm and then stops. Each check is one
       `elementFromPoint`. */
    for (const t of this._unburyAt || (this._unburyAt = [])) clearTimeout(t);
    this._unburyAt.length = 0;
    for (const ms of [0, 350, 1000, 2400]) this._unburyAt.push(setTimeout(() => this._unburyNow(), ms));
  },

  _unburyNow() {
    if (this._unburying) return;
    this._unburying = true;
    requestAnimationFrame(() => {
      this._unburying = false;
      const api = window.BEA && window.BEA.map;
      const mod = api && api.module;
      /* Never undo a choice the student made: `_bigTouched` is the map's own
         record of the reader having pressed E or the Enlarge tile. */
      if (!mod || typeof mod.setEnlarged !== 'function' || !mod.enlarged || mod._bigTouched) return;
      /* Two things must be visible for a beat to be a beat: the panel it opened
         and the sentence it spoke. The enlarged plate docks under the masthead
         rather than under the band when the room below the band is under 200px
         — which, with a beat panel open on a phone, it always is — so the beat
         loses its voice as well as its head. */
      if (!this._buried('#app .cx-sheet__head') && !this._buried('#app .app__lede')) return;
      try { mod.setEnlarged(false, { announce: false }); } catch (_) { /* the map may be mid-paint */ }
      /* Docking changes the plate's rectangle, so the camera the beat asked
         for has to be asked for again or the reader is left looking at the
         wrong ocean. */
      const st = this.step;
      const m = st && st.beat && st.beat.map;
      if (m && m.flyTo) setTimeout(() => this.ctx.bus.emit('ask:flyTo', { territoryId: m.flyTo, zoom: m.zoom || null }), 60);
    });
  },

  /** True when the map is painted over the middle of `sel`. */
  _buried(sel) {
    const n = document.querySelector(sel);
    if (!n) return false;
    const r = n.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return false;
    const x = Math.round(r.left + r.width / 2);
    const y = Math.round(r.top + Math.min(r.height / 2, 18));
    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
    const top = document.elementFromPoint(x, y);
    if (!top || n.contains(top) || top === n) return false;
    return !!top.closest('.map');
  },

  /**
   * A reveal that can be shown on the plate is shown on the plate. The tally of
   * armed exits is a sentence until the five places it names are lit; then it is
   * a geography, and geography is what this app has that a page has not.
   */
  _afterCommit(b, entry) {
    /* THE PLATE HAS DONE ITS WORK. On a `fitAfter` beat the map held the band
       so the student could look before committing; the guess is now in and
       what is left is the reveal, which on the poster is 1,096px of prose in a
       128px window. The band moves to the reading, unless the student has
       already made their own choice with `Map`, which outranks this. */
    if (b && b.fitAfter && entry && this.step && this.step.beat === b) {
      this._revealed = this._stepKey(this.step);
      this._publishFit();
    }
    if (!b || !entry || entry.kind !== 'predicted') return;
    if (b.id !== 'exits') return;
    const { bus, data } = this.ctx;
    const units = [];
    for (const d of data.departures || []) {
      if (d.mechanism !== 'war-of-independence' && d.mechanism !== 'insurgency-then-negotiation') continue;
      for (const u of (d.units && d.units.length ? d.units : (d.territory && d.territory.units) || [])) units.push(u);
    }
    if (units.length) bus.emit('ask:paintUnits', { unitIds: units, reason: 'left after armed conflict, by this atlas’s own departure mechanisms' });
  },

  /**
   * The essay. Charge 1: a chapter can run 900 unbroken words and an interface
   * chops text into 40-word cards. So each chapter ships one real argument, with
   * its connectives visible, in the rail, at reading size, beside a live map —
   * available at every beat of that chapter and blocking nothing.
   */
  _openEssay(chapterId) {
    const c = this.chapters.get(chapterId);
    if (!c || !c.essay) return;
    const body = el('div.tr-essay');
    body.append(el('p.tr-essay__eyebrow', { text: 'the argument, in full · ' + this._words(c.essay) + ' words' }));
    for (const para of String(c.essay).split(/\n\n+/)) {
      const q = el('p.tr-essay__p');
      q.textContent = para;
      markFigures(q);
      body.append(q);
    }
    body.append(el('button.cx-more', {
      type: 'button', text: 'Back to the beat',
      onclick: () => {
        const st = this.step;
        if (st && st.kind === 'beat') this._openPanel(st.beat);
        else if (st && st.kind === 'dispute') this._applyDispute(st);
        else if (st) this._applyGate(st);
      },
    }));
    /* The essay's own quantities, marked and checked, the same way the beats'
       are. The block is appended before the sheet opens so it is inside the
       reading window rather than after it. */
    syncFigures(body, {});
    this.ctx.bus.emit('ask:sheet', { id: 'tours:essay:' + chapterId, eyebrow: 'chapter ' + c.numeral, title: c.title, node: body });
    this._unbury();
  },

  _words(s) { return String(s).trim().split(/\s+/).filter(Boolean).length; },

  /** True on the run's first step — the only place the route strip prints. */
  _firstStep(b) {
    const first = this.steps.find((x) => x.kind === 'beat' && !x.optional);
    return !!first && !!b && first.beat.id === b.id;
  },

  /** True when the step standing is the last one a student has to do. */
  _lastRequired() { const st = this.step; return !!st && !st.optional && this.i >= this.required - 1; },

  _optionalBeat() { const st = this.steps.find((x) => x.optional && x.kind === 'beat'); return st ? st.beat : null; },

  /** The offer, in the same words wherever it is made. */
  _offerNode(b) {
    const off = (b.panel && b.panel.offer) || {};
    return el('div.tr-offer',
      el('span.tr-offer__eyebrow', { text: 'one more, and it is optional' }),
      el('p.tr-offer__note', { text: off.note || 'It breaks the claim you have just assembled. It is not counted, and nothing waits on it.' }),
      el('button.btn.btn--small.tr-offer__go', {
        type: 'button', text: (off.label || 'One more, off this map') + ' \u2192',
        onclick: () => this._goOptional(b.id),
      }));
  },

  /** Take the optional step past the end. It is never reached any other way. */
  _goOptional(id) {
    const i = this.steps.findIndex((x) => x.optional && x.kind === 'beat' && x.beat.id === id);
    if (i < 0) return;
    this.finished = false;
    this.exploring = false;
    this.i = i;
    this._apply();
  },

  /** True when this beat opens its chapter — where the argument belongs. */
  _firstOfChapter(b) {
    const first = this.beats.find((x) => x.chapter === b.chapter);
    return !!first && first.id === b.id;
  },

  _name(id) {
    const t = this.ctx.data.byId && this.ctx.data.byId.get(id);
    return (t && (t.shortName || t.name)) || id;
  },

  /* ================================================== a recall =========== */

  /**
   * A spaced second encounter, ON the path, using the quiz's own adaptive
   * scheduler rather than a copy of it. The year and the map are moved back to
   * where the thing was first met, because a retrieval cue is a place as much
   * as a question, and then the item is handed to `quiz:ask`.
   *
   * Next is never locked here: this is retrieval, not a gate, and a student
   * who cannot remember must be allowed to go on and be told.
   */
  /**
   * DIDACTIC_SPEC §3.2's THIRD TEST — THE ONE ONLY A RUN CAN ANSWER.
   *
   * `budget.js::flatten` has already refused every recall whose item no
   * required beat earlier on this route teaches, and every one that would land
   * inside six minutes of that beat at the planning rate. Those are facts
   * about the ROUTE. This is the fact about the PERSON: did they actually walk
   * that beat, and has six minutes of their own session gone by since?
   *
   * Skipping forward, arriving by deep link, entering from free-explore and
   * resuming a route mid-way all fail it — and they fail it for the same
   * reason the route test exists. "The loop again, from memory" said to
   * somebody who has never seen the loop is not a hard question; it is a false
   * statement about their own session, and what it teaches them is that this
   * app does not know what it showed them.
   *
   * Returns `{ ok, beat, why }`. `beat` is the teaching beat, addressed by id
   * rather than by hope, so the card can name the moment it is asking about.
   */
  _recallWarrant(st) {
    const r = (st && st.recall) || {};
    /* THE ROUTE TEST, RE-RUN HERE rather than trusted: this step could have
       been reached by a deep link into a route whose authoring has moved. */
    const required = this.beats.filter((b) => !b.optional);
    const host = required.findIndex((b) => b.id === st.after);
    let teach = null;
    let at = -1;
    for (let i = 0; i < required.length; i += 1) {
      const b = required[i];
      if (host >= 0 && i >= host) break;                /* only what came BEFORE */
      if (b.t === r.t || (b.onPath && b.onPath.t === r.t)) { teach = b; at = i; break; }
    }
    if (!teach) return { ok: false, beat: null, why: 'route' };

    const row = (this.ledger.all() || []).find((e) => e.kind === 'completed' && e.beatId === teach.id);
    if (!row) return { ok: false, beat: teach, why: 'run' };

    /* THE RUN TEST, APPLIED TO A COUNTED FIGURE AND NOT ONLY TO ITS BEAT.
     *
     * WAVE 10, reproduced before it was fixed. Three of the twenty are taught
     * by the figure the viz module mounts INSIDE a beat rather than by the
     * beat's own prose — `barbados` carries T2 in prose and T3 in the crossing
     * chart — and the chart is a question the reader may press Next straight
     * past. Walking `lesson-one` cold and doing exactly that, the recall at
     * step 7 fired with our lede, "The crossing again. This lesson had the
     * chart on screen earlier", while the card mounted beside it was headed
     * "GUESS FIRST · BEFORE THE LESSON GETS THERE" and said "This has not been
     * on screen yet." Two surfaces, one press apart, contradicting each other
     * about the student's own session — the exact shape wave 9 was written to
     * end, in the one place it had not looked.
     *
     * `quiz/index.js` was right and we were wrong. Attendance at the beat is
     * what §8.4 calls finishing; it is not a first encounter with a number the
     * beat never made the reader look at. So for an item taught by
     * `onPath.t`, the run test asks the record for the commitment itself —
     * the `predicted` line the figure writes when a guess goes in — and
     * refuses when there is none. A refusal here is not a hole in the lesson:
     * `_recallRefusal` says, in one sentence, which of the three tests failed,
     * and Next is open.
     */
    const viaFigure = teach.t !== r.t && !!(teach.onPath && teach.onPath.t === r.t);
    if (viaFigure && !(this.ledger.all() || []).some((e) => e.t === r.t && e.kind === 'predicted')) {
      return { ok: false, beat: teach, why: 'figure' };
    }

    /* THE SPACING TEST, MEASURED TWICE, AND EITHER MEASURE SATISFIES IT.
     *
     * §3.2 asks for six minutes of this student's elapsed session between the
     * teaching beat and the recall. That is the right measure and it is the
     * first one taken. It cannot be the only one, for a reason the quiz
     * module's own acceptance test found within the hour: a route PRICES the
     * recall it schedules, `quiz/index.js` counts the retrievals a run
     * actually delivers, and a wall clock refuses a reader who is simply
     * faster than 110 words a minute — so the lesson charged for a production
     * it then declined to ask for.
     *
     * The second measure is the one `budget.js::flatten` has already enforced
     * on the ROUTE: at the planning rate there are at least six minutes of
     * lesson between the two, or the step would not exist. What that does not
     * know is whether THIS student walked it, and skipping is exactly what
     * §3.2's run test is for. So: six minutes of clock, OR every required beat
     * between the two in this student's own record. A student who read the
     * whole of the intervening lesson has had the lesson's six minutes of
     * spacing whatever their reading speed; a student who jumped the queue has
     * had neither, and gets no recall.
     */
    const gap = Date.now() - Number(row.at || 0);
    if (gap >= budget.RECALL_GAP_S * 1000) return { ok: true, beat: teach, why: 'ok', gap };
    const between = required.slice(at + 1, host < 0 ? required.length : host + 1);
    const skipped = between.filter((b) => !this.ledger.didBeat(b.id));
    if (!skipped.length && between.length) return { ok: true, beat: teach, why: 'walked', gap };
    return { ok: false, beat: teach, why: 'spacing', gap, skipped: skipped.map((b) => b.id) };
  },

  /**
   * WHAT A REFUSED RECALL PUTS ON SCREEN, AND IT IS NOT A QUESTION.
   *
   * §3.2: "It renders nothing. There is no substitute question, no downgraded
   * version, no consolation fact. A route with fewer eligible recalls than
   * slots runs with fewer recalls and says so, once, in one true line." So the
   * step keeps its place in the count — a step that vanished under a student
   * mid-lesson would be its own small lie — and says, in one sentence, which
   * of the three tests it could not pass. Next is open.
   */
  _recallRefusal(w) {
    const mins = Math.round(budget.RECALL_GAP_S / 60);
    const title = (w.beat && w.beat.panel && w.beat.panel.title) || '';
    const text = w.why === 'route'
      ? 'This lesson has not taught the thing this question would ask for, so it is not asked. '
        + 'A second asking is only worth something after a first, and there was no first.'
      : w.why === 'run'
        ? 'This asks you to produce something from a beat you have not walked'
          + (title ? ' — ' + title : '') + '. You reached this step another way, so the question is not asked. '
          + 'Nothing is missing from the lesson: this step is retrieval, and there is nothing yet to retrieve.'
        : w.why === 'figure'
          ? 'The number this would ask for is inside the chart on an earlier beat'
            + (title ? ' — ' + title : '') + ' — and your record has no guess against it, so you '
            + 'went past without putting a number down. That makes this a first meeting, not a second, '
            + 'and a first meeting is not what this step is for. The chart is still there.'
          : 'You met this ' + Math.max(1, Math.round((w.gap || 0) / 60000)) + ' minute'
          + (Math.round((w.gap || 0) / 60000) === 1 ? '' : 's') + ' ago'
          + (title ? ', at ' + title : '')
          + ', and the beats this lesson put between the two — ' + (w.skipped || []).length
          + ' of them — are not in your record. A second asking earns its keep after about ' + mins
          + ' minutes of lesson, not before, so it is not asked here. Reading it again is not retrieval.';
    /* `.tr-panel` is the class `frame()` and tours.css build a reading window
       around; the modifier is what this one is. */
    return el('div.tr-panel.tr-panel--none', { 'data-kind': 'recall-none' },
      el('p.tr-gate__eyebrow', { text: 'no second asking here' }),
      el('p.tr-p', { text }),
      el('p.cx-note', { text: 'Nothing is scored either way, and nothing waits on this step. Press Next.' }));
  },

  /** A recall step whose warrant failed: one true sentence, and Next is open. */
  _refuseRecall(st, warrant) {
    const bus = this.ctx.bus;
    const r = st.recall || {};
    bus.emit('ask:say', {
      id: 'tours:beat', priority: 60,
      mark: 'nothing due',
      /* THE CLAIM IS ABOUT THIS STEP AND NOTHING ELSE. `quiz/index.js` runs its
         own spacing schedule and may put a first-encounter card on the rail at
         any moment — that is its job, and its card says in its own words that
         the thing is new. So this sentence says what is true of the STEP: it
         had a second asking to make and has not earned one. */
      text: 'Nothing on this run has earned a second asking here, so this step asks nothing of its own.',
    });
    this._openedId = 'tours:recall:' + (r.id || 'x');
    this._openedAt = Date.now();
    bus.emit('ask:sheet', {
      id: this._openedId,
      eyebrow: 'asked again',
      title: 'Not asked',
      node: frame(this._recallRefusal(warrant), bus),
    });
    this._unbury();
    bus.emit('tours:beat', { id: 'recall:' + (r.id || ''), n: st.n, total: this.totalBeats, exploring: false, recall: true });
    announce(this._where() + '. There is nothing here this run has earned a second asking of, so nothing is asked. Press Next.');
    this._paint();
  },

  _applyRecall(st) {
    const { bus, store } = this.ctx;
    const r = st.recall || {};
    this.locked = false;
    this._stopSweep();

    /* THE WARRANT COMES BEFORE THE MAP MOVES, NOT AFTER IT.
       Measured: with the check further down, a refused recall had already
       flown the map to Barbados in 1780 — and the year-and-selection change is
       exactly what `quiz/index.js::_maybeOffer` watches for, so P10's own
       spaced-retrieval scheduler took the rail one frame later and put a
       question on screen under a band that had just said no question was being
       asked. Two surfaces contradicting each other again, which is the whole
       class of defect this rule exists to end. A step that asks nothing moves
       nothing: the map stays where the last beat left it, and the reader is
       told, in one sentence, why. */
    const warrant = this._recallWarrant(st);
    if (!warrant.ok) return this._refuseRecall(st, warrant);

    this._pressure(r.pressure);
    this._tourSel = r.sel || null;

    this._applying = true;
    store.batch((d) => {
      if (Number.isFinite(r.year)) d('setYear', r.year);
      d('select', r.sel || null);
    });
    this._applying = false;
    this._home();

    bus.emit('ask:say', {
      id: 'tours:beat', priority: 60,
      mark: r.mark || 'asked again',
      text: r.say || 'Something from earlier, before it goes. No score, and the answer follows either way.',
    });

    /* If the quiz cannot find the item we do not leave a blank step standing:
       say so once and let Next through. */
    let answered = false;
    const off = bus.on('quiz:asked', () => { answered = true; });
    bus.emit('quiz:ask', { id: r.id, t: r.t, beatId: r.after || (st.after || null) });
    this._unbury();
    setTimeout(() => {
      off();
      if (answered) return;
      bus.emit('ask:sheet', {
        id: 'tours:recall:' + (r.id || 'x'),
        eyebrow: 'asked again',
        title: 'Not available',
        node: el('p.cx-note', { text: 'This atlas could not find the retrieval item for this step, so it is skipped rather than faked. Press Next.' }),
      });
    }, 500);

    bus.emit('tours:beat', { id: 'recall:' + (r.id || ''), n: st.n, total: this.totalBeats, exploring: false, recall: true });
    announce(this._where() + '. A question about something from earlier. Nothing is scored.');
    this._paint();
    this._recallFoot(st);
  },

  /**
   * A RECALL STEP GETS THE SAME FOOT AS EVERY OTHER STEP.
   *
   * P10 renders the card and owns every word of it; this appends our own foot
   * beneath it in the shell's sheet body, so `Map` — the one control that
   * brings the reading back from a full map band — exists on this step too.
   * ROUND 2, the phone: "Tapping OPEN THE MAP on one of them takes the map to
   * 192px with no control to get back to the text; only Back or Next escapes."
   *
   * It is appended, not inserted: P21's through-line block watches the same
   * body and re-appends itself last, so the order settles at
   * card · foot · through-line without either piece knowing about the other.
   */
  _recallFoot(st) {
    const put = () => { if (this.step === st) this._footAnySheet(); };
    /* The quiz answers `quiz:ask` synchronously in the good case and opens its
       sheet on the next frame; two frames is enough for both, and the guard
       above makes a late one harmless. */
    requestAnimationFrame(() => requestAnimationFrame(put));
    setTimeout(put, 600);
  },

  /**
   * A RETRIEVAL CARD GETS A FOOT WHEREVER IT STANDS ON THE PATH — NOT ONLY ON
   * THE STEPS THIS MODULE PUT IT ON.
   *
   * ROUND 3, the phone, as its biggest gap: "At 390x844 the spaced-recall card
   * has no foot bar and its Commit button sits underneath the fixed
   * through-line row — visible only as a 10px sliver of a button top. It is a
   * retrieval step, and retrieval is the mechanism the whole spacing plan rests
   * on." Measured on `#tour=core&step=15`: `.cx-sheet__body` 578 with children
   * `qz` and `cl-blk` and no `.tr-panel__foot` at all — no thumb-zone Next, and
   * nothing to page a card that is taller than its window.
   *
   * THE CAUSE WAS AN ASSUMPTION ABOUT WHO OPENS THE CARD. `_recallFoot` footed
   * the recall STEPS this module flattens into a route — and `core` carries
   * none, because `recalls: false`. P10's own spacing schedule opens a due item
   * over whatever beat is standing, which is the point of spacing, and that
   * card is a surface of this lesson exactly as much as ours is. So the foot
   * follows the SURFACE: any sheet whose id says it is a retrieval card gets
   * one while the path is running, whoever opened it.
   */
  _footAnySheet() {
    if (!this.running) return;
    const sheet = document.querySelector('.app__sheet');
    if (!sheet || sheet.hidden) return;
    const body = sheet.querySelector('.cx-sheet__body');
    if (!body) return;
    if (body.querySelector('.tr-panel__foot')) return;   /* a card that framed itself */
    if (!body.querySelector('.qz, .tr-recall')) return;  /* only a retrieval card */
    body.append(soloFoot(body, this.ctx.bus, { moreWord: 'more of this question' }));
  },

  /* ================================================== a dispute ========= */

  /**
   * A HISTORIOGRAPHICAL DISPUTE, AS A GATE ON THE PATH.
   *
   * THE DEFECT. This atlas holds fourteen arguments open between thirty-one
   * named historians, each with the evidence both readings use and the thing
   * each has to explain away, and it will not show a student where an argument
   * stands until they have chosen a position and written a sentence saying
   * why. That is the best commit-then-verdict move in the application — and
   * nothing on the twenty-four-step path ever required a student to make it.
   * It happened in the teaching desk, or when a reader happened to select one
   * of sixty-four territories that carries a card. A skill a student can walk
   * past is a skill the app does not teach.
   *
   * WHAT THIS STEP DOES AND DOES NOT DO. It does not duplicate one word of the
   * argument. `panels/historiography` owns the positions, the sources, the
   * verdict, the settle-field and the record of what this student said; this
   * step frames the question in the lesson's own voice, says why the easy
   * answer is the one to be suspicious of, and hands over. The argument opens
   * in the same rail sheet every other teaching surface uses, under an `hgx:`
   * id, so the two pieces cannot fight for the column: tours only ever drops a
   * sheet whose id begins `tours:`.
   *
   * HOW THEY TALK. `bus.emit('hgx:open')` first, because a bus event is the
   * contract every other module in this app is reached by, and then the
   * module's own published drive surface, `BEA.historiography.open(id)` —
   * the same handle `BEA.map.home()` is reached by two hundred lines above.
   * Either is enough; both are tried because a module that has not published
   * yet is a timing accident and not an answer.
   *
   * HOW THE LOCK LIFTS. Not by our watching their DOM. When a student commits,
   * `judgement.js` writes one row to P21's Ledger — kind `collapsed`, claim id
   * `hgx:<dispute>` — and that row is the commitment. We read it, on
   * `ledger:append` and again on entry, so a student who took a side yesterday
   * walks straight through today and a student who takes it now is released
   * the moment they do. Nothing here reaches into another module's state.
   *
   * AND IF THE MODULE IS NOT ON THE PAGE, the step says so in one line and
   * lets Next through, exactly as a recall does. It never asks for a
   * commitment it cannot record.
   */
  /**
   * The citation for the dispute gate, read out of the historiography module's
   * own record at the moment of drawing. Never copied into gates.json: a
   * citation typed twice is a citation that can drift, and this atlas's whole
   * standing rests on not doing that.
   */
  _disputeCite(id) {
    try {
      const api = window.BEA && window.BEA.historiography;
      const d = api && (api.disputes || []).find((x) => x.id === id);
      const pos = d && (d.positions || []).find((x) => x.src);
      return (pos && pos.src) || null;
    } catch (_) { return null; }
  },

  _applyDispute(st) {
    const { bus, store } = this.ctx;
    const d = st.dispute || {};
    const key = 'hgx:' + d.id;
    this._stopSweep();
    this._tourSel = d.sel || null;
    this._pressure(d.pressure);

    this._applying = true;
    store.batch((dispatch) => {
      if (Number.isFinite(d.year)) dispatch('setYear', d.year);
      dispatch('select', d.sel || null);
    });
    this._applying = false;
    if (d.flyTo) bus.emit('ask:flyTo', { territoryId: d.flyTo, zoom: d.zoom || null });
    else this._home();

    /* THE SAME SCOPE AS A GATE'S. An argument between historians holds the
       forward edge the way the five Complication Gates do, so a side taken in
       a previous browsing session releases nothing here. */
    const edge = 'p05:gate:' + (d.gate || ('dispute:' + d.id));
    const done = () => this._runHas(edge) || this._runHas(key);
    this.locked = !done();

    bus.emit('ask:say', {
      id: 'tours:beat', priority: 55,
      mark: d.mark || 'the argument',
      text: d.say || 'Take a side in this argument before you are shown where it stands.',
    });

    /* Released by the student's own row in the Ledger, not by a peek at
       somebody else's DOM. Registered for the life of the module and guarded
       on the current step, so leaving this step cannot unlock a later one. */
    if (!this._disputeOff) {
      this._disputeOff = bus.on('ledger:append', (e) => {
        const cur = this.step;
        if (!cur || cur.kind !== 'dispute' || !this.locked) return;
        if (!e || String(e.claimId || '') !== 'hgx:' + cur.dispute.id) return;
        this._runAdd('hgx:' + cur.dispute.id);
        this.locked = false;
        this._paint();
        this._focusNext();
        announce('Your position is recorded. Where the argument stands is open beside the map, and you can go on.');
      });
      this.d(this._disputeOff);
    }

    const open = () => {
      let opened = false;
      bus.emit('hgx:open', { id: d.id, reason: 'tours:dispute', reply: (ok) => { opened = !!ok; } });
      if (!opened) {
        const api = window.BEA && window.BEA.historiography;
        if (api && typeof api.open === 'function') { try { opened = api.open(d.id) !== false; } catch (_) { opened = false; } }
      }
      if (!opened) fail();
      return opened;
    };
    const fail = () => {
      this.locked = false;
      this._paint();
      bus.emit('ask:sheet', {
        id: 'tours:dispute:' + d.id,
        eyebrow: 'the forward edge',
        title: 'Not available',
        node: el('p.cx-note', { text: d.absent || 'This atlas could not open the argument for this step, so it is skipped rather than faked. Press Next.' }),
      });
    };

    /* THE FORWARD EDGE IS THE FIELD THIS PATH HAS USED FIVE TIMES ALREADY.
       An argument between historians is a complication like the other five, so
       it is placed on the same two axes, with the same decline, and recorded in
       the same words — one mechanism, learned once, and a student who will not
       enter somebody else's panel is not stranded on the path. Taking a side
       INSIDE the argument releases the lock as well (the `ledger:append`
       listener above), so the deeper move is what the step is for and never the
       price of finishing the lesson.

       `g6` is the gate; its citation is not written in gates.json but injected
       here from the live dispute's own source object, so there is one text of
       Yasmin Khan in this application. */
    const body = el('div.tr-dispute', { 'data-dispute': d.id });
    const g6 = (this.gatesDoc.gates || []).find((x) => x.id === d.gate);
    if (!g6) {
      /* A step cannot ask for a commitment it has nowhere to record. */
      this.locked = false;
      body.append(el('p.cx-note.cx-note--warn', { text: d.absent || 'This atlas could not open the argument for this step, so it is skipped rather than faked. Press Next.' }));
    } else {
      const gate = { ...g6, variants: (g6.variants || []).map((v) => ({ ...v, cite: v.cite || this._disputeCite(d.id) })) };
      const built = buildGate({
        gate,
        axes: this.gatesDoc.axes,
        noRightAnswer: this.gatesDoc.noRightAnswer,
        ledger: this.ledger,
        satisfied: this._runHas(edge),
        citeFn: (src) => cite(src, bus),
        onPlaced: (entry) => { const row = this.ledger.append(entry); this._runAdd(edge); this.locked = false; this._paint(); this._focusNext(); return row; },
        onDeclined: (entry) => { const row = this.ledger.append(entry); this._runAdd(edge); this.locked = false; this._paint(); this._focusNext(); return row; },
      });
      if (built.placed) this.locked = false;

      /* The route into the argument itself, immediately under the gate's own
         account of it and above the field, because reading the two positions
         is the thing the step is asking for and the field is what records it. */
      const route = el('div.tr-dispute__route');
      const took = () => !!(this.ledger && this.ledger.get(key));
      route.append(el('button.btn.btn--small.tr-dispute__go', {
        type: 'button', text: (took() ? 'Read the argument again' : (d.cta || 'Open the argument')) + ' →',
        onclick: () => open(),
      }));
      if (took()) {
        const said = this.ledger.get(key);
        route.append(el('p.tr-gate__done',
          el('strong', { text: 'You took a side in it: ' }), String(said.youSaid || '')));
      } else {
        route.append(el('p.cx-note.tr-dispute__note', { text: d.lede || '' }));
      }
      const field = built.node.querySelector('.tr-field') || built.node.querySelector('.tr-gate__done');
      if (field) built.node.insertBefore(route, field);
      else built.node.append(route);
      body.append(built.node);
      if (d.after) body.append(el('p.cx-note.tr-dispute__after', { text: d.after }));
    }

    if (this._lastRequired() && this._optionalBeat()) body.append(this._offerNode(this._optionalBeat()));
    syncFigures(body, {});
    frame(body, bus);

    this._openedId = 'tours:dispute:' + d.id;
    this._openedAt = Date.now();
    bus.emit('ask:sheet', {
      id: this._openedId,
      eyebrow: 'the forward edge',
      title: d.title || 'Take a side first',
      node: body,
    });
    this._unbury();

    bus.emit('tours:beat', { id: 'dispute:' + d.id, n: st.n, total: this.totalBeats, exploring: false, dispute: true });
    announce(this._where() + '. An argument between named historians. Take a side and say why before going on. There is no right answer.');
    this._paint();
  },

  /* ================================================== a gate ============= */

  _applyGate(st) {
    const { bus, store } = this.ctx;
    const g = st.gate;
    this.locked = true;
    this._pressure(g.pressure);

    /* A GATE INHERITS THE YEAR OF THE BEAT IT STANDS BEHIND.
       A gate has no map state of its own, which is right when it is reached by
       walking — the beat before it has just set the year, and the complication
       is about that moment. It is wrong on a cold load: measured,
       `#tour=thirty&step=24` opened the last Complication Gate with the map at
       1765 and the band saying "one fact here damages what you were just told"
       about a claim from 1997, because nothing had run before it. A teacher's
       deep link is a page number (FEATURE_SPEC §1 charge 14) and it has to open
       the same screen as walking there does. Applied every time and not only on
       a cold load, because re-applying the year the previous beat already set is
       a no-op. */
    const host = this.beats.find((b) => b.id === g.after);
    const hm = (host && host.map) || null;
    if (hm) {
      this._applying = true;
      store.batch((d) => {
        if (Number.isFinite(hm.year)) d('setYear', hm.year);
        if (hm.sel) d('select', hm.sel);
      });
      this._applying = false;
      this._tourSel = hm.sel || this._tourSel;
    }

    bus.emit('ask:say', {
      id: 'tours:beat', priority: 55,
      mark: 'the complication',
      text: 'One fact here damages what you were just told. Place it to go on.',
    });

    /* THE OPTIONAL STEP IS OFFERED FROM THE LAST STEP OF THE ROUTE, WHATEVER
       KIND OF STEP THAT IS. On `core` it is the `fourteen` beat and the offer
       is in its panel; on the full path it is the last Complication Gate, and a
       reader who never sees it never meets the case that breaks this atlas's
       own strongest claim. */
    const extra = this._lastRequired() && this._optionalBeat() ? this._offerNode(this._optionalBeat()) : null;
    const edge = 'p05:gate:' + g.id;
    const done = (entry) => {
      const row = this.ledger.append(entry);
      this._runAdd(edge);
      this.locked = false;
      this._paint();
      this._focusNext();
      return row;
    };
    const built = buildGate({
      gate: g,
      extra,
      axes: this.gatesDoc.axes,
      noRightAnswer: this.gatesDoc.noRightAnswer,
      ledger: this.ledger,
      /* THE EDGE HOLDS UNLESS THIS RUN HAS ALREADY PLACED IT. See `_runHas`. */
      satisfied: this._runHas(edge),
      citeFn: (src) => cite(src, bus),
      onPlaced: done,
      onDeclined: done,
    });
    if (built.placed) this.locked = false;
    /* THE GATE'S OWN CHECK BLOCK, BEFORE THE FRAME GOES ON. `sync` appends to
       the node it scanned, and after `frame()` that node's children are a
       scroller and a foot — so the block would land outside the reading window.
       Called here it lands in the content and the frame carries it in. */
    syncFigures(built.node, {});
    frame(built.node, bus);

    this._openedId = 'tours:gate:' + g.id;
    this._openedAt = Date.now();
    bus.emit('ask:sheet', {
      id: this._openedId,
      eyebrow: 'the forward edge',
      title: 'Before you go on',
      node: built.node,
    });
    this._unbury();

    bus.emit('tours:beat', { id: 'gate:' + g.id, n: st.n, total: this.totalBeats, chapter: g.chapter, exploring: false, gate: true });
    announce(this._where() + '. A complication. Place it on the field before going on. Any placement is accepted.');
    this._paint();
  },

  _focusNext() { try { this.next.focus(); } catch (_) { /* focus is a courtesy */ } },

  /**
   * Take the reader to the thing they are being asked to do.
   *
   * The rail scrolls inside itself (LAYOUT_BUDGET B8), so "below the fold" here
   * means below the sheet body's own scroll, not below the window. `scrollIntoView`
   * on the field walks whatever scroll containers are between it and the
   * document — which at 390x844 is two of them — and then the focus goes onto
   * the first cell, so the keyboard route is the same route as the pointer's.
   */
  _goToField() {
    const f = document.querySelector('#app [data-gatefield="yes"]');
    if (!f) return;
    /* Scroll to the GRID, not to the whole field: the field carries a question,
       two axis labels and a caveat as well as nine cells, and at 900x700 an
       instruction to centre the whole of it left the bottom row of cells 15px
       under the edge of the rail — measured. `block:'end'` on the grid puts the
       last row against the bottom of the scroller, which is the row a reader
       is least likely to find on their own. */
    const target = f.querySelector('.tr-field__grid') || f;
    const smooth = document.documentElement.dataset.motion !== 'reduced';
    try { target.scrollIntoView({ block: 'end', behavior: smooth ? 'smooth' : 'auto' }); } catch (_) { target.scrollIntoView(false); }
    const cell = f.querySelector('.tr-field__cell');
    if (cell) setTimeout(() => { try { cell.focus({ preventScroll: true }); } catch (_) { try { cell.focus(); } catch (__) { /* focus is a courtesy */ } } }, 140);
    announce('The field is open. Nine cells: what the fact does to the claim, and how sure you are. Any placement is accepted.');
  },

  /* ================================================== the remaining ===== */

  /**
   * 1997 fades and the map does not go blank.
   *
   * THE UNITS ARE THE OPEN SPAN'S, NOT THE TERRITORY'S. `territory.units` is
   * the union of every unit the record ever covered, so painting from it lit
   * the twenty-six counties of the Irish Free State, the whole of Cyprus and
   * the Chagos Archipelago's ceded island as "still drawn by this atlas
   * today". answers.js/stillBritish now answers with the open span's units and
   * the open span's label, and it is the only place either is computed.
   */
  _paintRemaining() {
    const { bus, data } = this.ctx;
    const a = stillBritish(data);
    if (a.units.length) bus.emit('ask:paintUnits', { unitIds: a.units, reason: 'still drawn by this atlas today — the part of each record that has no end date' });
  },
};
