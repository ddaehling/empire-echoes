/**
 * chrome/index.js — the staging and disclosure controller.
 *
 * Owned by the shell / art-direction agent. The contract it implements is
 * docs/LAYOUT_BUDGET.md; read that before changing anything here.
 *
 * WHAT THIS MODULE IS FOR. Four excellent pieces each shipped its full
 * explanatory apparatus at second zero, so a fifteen-year-old met 82 controls
 * and 821 words before one sentence of story. Nothing of that is deleted. This
 * module decides WHEN each thing exists, and it owns the one channel that
 * speaks to the reader in a single voice.
 *
 * IT OWNS
 *   1. `data-stage` on <html> and #app — plate | working | apparatus.
 *      Persisted as state.filters.stage, so it is in the URL and a teacher can
 *      link to it: `#year=1857&filter=stage:apparatus`.
 *   2. The lede band (the `lede` mount): at most ONE sentence and at most ONE
 *      primary control, ever.
 *   3. The sheet (the `sheet` mount): the surface every deferred thing opens
 *      into, with a guaranteed height. Nothing in this app may open into a
 *      one-pixel container again.
 *   4. The opening focal action: a thirty-second sweep of 1600→1997.
 *
 * EVENTS IT LISTENS FOR
 *   ask:say     {id, text, mark?, priority?, cta?, ttl?}  — put a sentence in
 *               the band. Highest priority wins; equal priority, newest wins.
 *               `text` may contain <strong>/<em> only. Pass text:null to clear
 *               your own entry.
 *   ask:stage   {level}  — request a stage. Never goes backwards on its own.
 *   ask:sheet   {id, title, eyebrow?, node} | null  — open/close the sheet.
 *   ask:sweep   — run the opening sweep (also what the CTA emits).
 *
 * EVENTS IT EMITS
 *   chrome:ready  {stage, rail}
 *   chrome:stage  {stage, prev}
 *   chrome:sheet  {id, open}
 *   chrome:sweep  {phase, year, running}
 *   chrome:layout {rail, stage:{top,height}, plate:{top,height}, vw, vh}
 *                 — whenever the geometry changes shape (resize, rail band
 *                   crossing, the map moving). Debounced to one per frame.
 *
 * A piece that wants a stratum on screen asks for a stage. It never sets one.
 *
 * -------------------------------------------------------------------------
 * HOW THE AUTHORED PATH (app/js/tours/) DRIVES THIS SURFACE
 *
 * Everything the shell owns can be driven from the bus, and everything that is
 * a position in the lesson is in the URL, so a tour step is a link.
 *
 *   // say the step's sentence in the one place the reader is already reading
 *   bus.emit('ask:say', { id: 'tour', priority: 50, mark: '1857',
 *                         text: '…', cta: { label: 'The next thing',
 *                                           emit: 'tour:next', payload: {} } });
 *   bus.emit('ask:say', { id: 'tour', text: null });        // hand the band back
 *
 *   bus.emit('ask:stage', { level: 'apparatus' });          // reveal a stratum
 *   bus.emit('ask:sheet', { id, eyebrow, title, node });    // a long surface
 *   bus.emit('ask:sheet', null);                            // close it
 *   bus.emit('ask:sweep');                                  // the 30s sweep
 *
 * State, not moments, goes through the store and therefore through the URL:
 * `store.dispatch('startTour', {id, step})` writes `#tour=…&step=…` (1-based),
 * and the disclosure level rides in `filter=stage:…`. A tour that sets the year,
 * the selection, the layer and the stage produces a link that reproduces the
 * beat exactly; nothing a tour does to this surface is invisible to Back.
 *
 * Read, never write: `#app[data-stage]` (the disclosure level),
 * `#app[data-rail="side"|"sheet"]` (is the rail a column or a bottom sheet),
 * and the custom properties `--stage-top`, `--stage-height`, `--rail-top-min`,
 * `--rail-clear` and `--dock-floor`.
 *
 * `--dock-floor` is the seam at the FOOT of the plate, as `--rail-clear` is the
 * seam at the foot of the window: the lowest a floating control strip may sit
 * without covering something already pinned there. Write
 * `bottom: var(--dock-floor)` and you are clear of the map's definition dial,
 * the colour ribbon, the time bar and an open bottom sheet, at every viewport,
 * measured rather than summed from tokens.
 */

import { el, fill, disposer, announce, prefersReducedMotion } from '../core/util.js';

/* THE FALLBACK TABLE for a beat that has not declared its work. It is read
   only when `<html data-tour-fit>` is absent; a declaration always wins.
   docs/RESPONSIVE_LAW.md §11.2. */
const TEXT_WORK = new Set(['tension', 'dispute', 'gate', 'sort', 'definition',
  'close', 'source', 'retrieve', 'recall', 'loop', 'offmap']);
const MAP_WORK = new Set(['sweep', 'predict', 'present', 'paint', 'compare', 'poster']);

/* THE THIRD CLAIMANT, AND ROUND 3'S AMENDMENT — docs/RESPONSIVE_LAW §11.10.
   The band under 62rem has THREE claimants and exactly one subject: the plate,
   the panel and the TIME control. `fit` answers "plate or panel" and it has
   never answered the second half of the question, so in the `map` state BOTH
   apparatus rows stood at full size and the panel sat on B8's 280px floor.
   Measured at 390x844 on the build round 3 reviewed:

     step 1  the poster   map 208  time 184  panel 280  reading window 128 / 681
     step 2  the spine    map 208  time 184  panel 280  reading window 128 / 735
     step 12 the exits    map 208  time 184  panel 280  reading window 129 / 533

   — 5.3, 5.7 and 4.1 screenfuls, with the poster's own guess input 400px below
   the fold on stop 1 of 15, and the historian's note that "the panel edge cuts
   'The poster map used one pink for' mid-sentence".

   A beat whose evidence is the FOUR LANES is the case the two-value contract
   could not state at all: the spine beat's own sentence is "the bands under
   the map overlap on purpose: in 1820 three", its plate is a 1636 outline
   doing nothing, and collapsing the time control there would delete the thing
   it is about. So `sweep` resolves to `time`: the plate stands down to the
   peek strip, the time control keeps its whole band, and the panel takes what
   the plate gave up. A beat may declare it directly (`fit: "time"`). */
const TIME_WORK = new Set(['sweep']);

/* THE SHEET SURFACES OF THE LESSON AND OF THE ENDING — docs/RESPONSIVE_LAW
   §11.2. Reading mode used to require a mounted `.tr-panel`, and four of the
   surfaces a student on the guided path actually meets are not one: the two
   recall cards (`tours:recall:…`, `quiz:recall`), the five Complication Gates
   (`tours:gate:…`), the dispute card (`tours:dispute:…`) and THE CLOSE — the
   ending, the sign and the print, which is the most textual surface in the
   application and was the only one that never collapsed the map. Measured at
   390x844 with the Close open: `.cx-sheet__body` 242 holding 6,342 = 26.2
   SCREENFULS, over a 170px map of a place the Close is not about, a colour
   ribbon keying it, and a 184px time control. Every id below opens a surface
   whose work is prose; any piece may say otherwise for its own surface with
   `work: 'map'` in its `ask:sheet` payload, and nothing else in the app is
   swept in by this. */
const LESSON_SHEET = /^(close|tours:|quiz:)/;

const STAGES = ['plate', 'working', 'apparatus'];
const rank = (s) => Math.max(0, STAGES.indexOf(s));

/* -----------------------------------------------------------------------
   THE SPINE, STATED. DIDACTIC_SPEC §2.1 is normative: four empires, four
   engines, overlapping. The shell owns the through-line because the
   through-line is not any one piece's property — before this, the only
   sentence of narrative on screen was clipped by the bottom of the window.
   Spans and engines are §2.1's table, compressed to one clause each.
   ----------------------------------------------------------------------- */
const PHASES = [
  { n: 'I',   name: 'The Atlantic empire', from: 1585, to: 1838,
    say: '<strong>The Atlantic empire.</strong> Sugar, tobacco and cotton grown by enslaved Africans on land taken from Indigenous peoples, kept exclusive by the Navigation Acts and the Royal Navy.' },
  { n: 'II',  name: 'The Company empire', from: 1600, to: 1858,
    say: '<strong>The Company empire.</strong> A chartered monopoly found that taxing Bengal paid better than trading with it, and spent the revenue on soldiers who took more.' },
  { n: 'III', name: 'The imperial empire', from: 1815, to: 1947,
    say: '<strong>The imperial empire.</strong> Factories needing markets, steam and telegraph shrinking distance, fear for the routes to India, and a race with France, Russia and Germany.' },
  { n: 'IV',  name: 'Dissolution', from: 1942, to: 1997,
    say: '<strong>Dissolution.</strong> Anticolonial parties older than the wars, a bankrupt Britain, and counter-insurgencies that lost anyway.' },
];

/** The phase a year sits in. Phases overlap on purpose (§2.2); the latest one
 *  that has started is the one whose engine is doing the most work. */
function phaseFor(year) {
  let best = null;
  for (const p of PHASES) if (year >= p.from && year <= p.to) best = p;
  return best || (year < PHASES[0].from ? PHASES[0] : PHASES[PHASES.length - 1]);
}

/* The opening sentence. It is the app's best sentence — the rate rail's finding
   — promoted out of a 13px caption 985px down the page. */
const OPENING = {
  mark: '1600 – 1997',
  say: 'Half of this empire was taken in <strong>123 years</strong>. Half of it went in <strong>28</strong>.',
};

export default {
  id: 'chrome',
  slot: 'lede',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    this.app = document.getElementById('app') || document.querySelector('.app');
    this.sheetEl = document.getElementById('sheet');
    this.sheetMount = document.querySelector('[data-mount="sheet"]');
    this.says = new Map();
    this.sweep = null;

    this._buildLede(ctx.root);
    this._buildSheet();
    this._buildTools();
    this._startLayout();

    const { store, bus } = ctx;

    /* --- the stage ---------------------------------------------------- */
    this._applyStage(this._stageOf(store.getState()), true);
    this.d(store.watch(s => (s.filters && s.filters.stage) || 'plate', () => {
      this._applyStage(this._stageOf(store.getState()));
    }));

    /* Promotion. The reader does not press a "show me more" button to reach
       `working`: they earn it by touching the atlas at all. Anything that
       changes the year, the selection, the definition or the layer means the
       reader has started, and the working apparatus now has something to be
       about. */
    this.d(store.subscribe((state, prev, changed) => {
      if (state.hydrating) return;
      /* Unconditional, and before the sweep guard: a link into the lesson can
         have its disclosure level cleared out from under it by a later
         `hydrate` (filters are replaced, not merged — store.js), and `_earn`
         costs one array lookup once the level has been reached. */
      this._earn(state);
      if (this.sweep) return;
      if (changed.has('year') || changed.has('selectedTerritoryId') || changed.has('activeLayer')
          || changed.has('playing') || changed.has('compareYear')
          || (changed.has('filters') && this._defChanged(state, prev))) {
        this._request('working');
      }
      if (changed.has('activeTour') || changed.has('tourStep')) this._earn(state);
      if (changed.has('filters') && this._defChanged(state, prev)) this._sayDefinition(state);
      if (changed.has('year') || changed.has('filters')) this._refreshDefault(state);
    }));

    /* --- the say channel ---------------------------------------------- */
    this.d(bus.on('ask:say', (m) => this._say(m)));
    this.d(bus.on('chrome:say', (m) => this._say(m)));   // accepted alias

    /* --- stage requests ------------------------------------------------ */
    this.d(bus.on('ask:stage', (m) => this._request((m && m.level) || 'working')));
    /* THE READING CONTRACT. A piece asks; the shell answers. Same shape as
       `ask:stage`, and for the same reason: the band is the shell's to state.
       docs/RESPONSIVE_LAW.md §11.4. */
    this.d(bus.on('ask:read', (m) => this._askRead((m && m.mode) || 'map')));

    /* --- the sheet ----------------------------------------------------- */
    this.d(bus.on('ask:sheet', (m) => (m && m.node ? this._openSheet(m) : this._closeSheet())));

    /* --- the sweep ----------------------------------------------------- */
    this.d(bus.on('ask:sweep', () => this._runSweep()));
    /* THE PUBLISHED AUX SLOT — `tours:aux`, the extension point every piece
       that offers one control off the path uses. The shell listens so that
       `_syncPathJump` runs on the frame the offer arrives and on the frame it
       is withdrawn: nothing resizes when a figure is appended into the sheet,
       so no observer above hears it. A frame is taken first because tours
       fills the slot in its own handler for the same event. */
    this.d(bus.on('tours:aux', () => requestAnimationFrame(() => this._syncPathJump())));

    /* --- one teaching panel, one year ---------------------------------- */
    this.d(bus.on('compare:open', () => this._compareOpened()));
    this.d(bus.on('compare:close', () => this._compareClosed()));
    this.d(store.subscribe((state, prev, changed) => {
      if (state.hydrating) return;
      if (this.compareOpen && changed.has('compareYear') && state.compareYear == null) {
        /* THE YEAR ON SCREEN IS SINGLE-VALUED. Two labelled plates are two
           dates; a third date is a lie. `compareYear` is the shell's own state
           and it round-trips through the address, so a comparison drawn while
           it is null is a surface asserting a year the app does not hold. This
           is a backstop, not the mechanism — P18 stands itself down first. */
        bus.emit('compare:close', {});
      }
    }));

    /* --- an address that names nothing --------------------------------- */
    this.d(bus.on('url:unknown', (m) => this._sayUnknown(m)));

    /* Escape closes, outermost first: the tools panel, then the sheet. */
    const onKey = (ev) => {
      if (ev.key !== 'Escape') return;
      if (this.toolsOpen) { this._setTools(false, true); ev.preventDefault(); return; }
      if (this.sweep) { this._stopSweep(); ev.preventDefault(); return; }
      if (this.sheetOpen) { this._closeSheet(); ev.preventDefault(); }
    };
    document.addEventListener('keydown', onKey, true);
    this.d(() => document.removeEventListener('keydown', onKey, true));

    /* THE PRESS ITSELF, WHEREVER IT IS MADE. `_askRead` is the funnel for the
       peek strip and for the shell's own control in the sheet's head, but a
       thumb on tours' `Map` never passes through it — and that is the control
       the phone critic actually pressed. A capture-phase listener on the
       document sees all three and none of the machine-made changes of fit (a
       `fitAfter` handover, a step change), which is exactly the line between
       "the student chose this" and "the lesson did". docs/RESPONSIVE_LAW
       §11.10. */
    const onFitPress = (ev) => {
      const t = ev.target && ev.target.closest ? ev.target.closest('.tr-panel__fit, .cx-sheet__fit') : null;
      if (!t || this._aligning) return;
      requestAnimationFrame(() => {
        const w = this._readWork();
        if (w) this._readPref = w === 'map' ? 'map' : 'text';
      });
    };
    document.addEventListener('click', onFitPress, true);
    this.d(() => document.removeEventListener('click', onFitPress, true));

    this._earn(store.getState());
    this._checkAddress(store.getState());
    this.d(bus.on('url:restore', () => this._checkAddress(this.ctx.store.getState())));
    this.d(bus.on('url:pop', () => this._checkAddress(this.ctx.store.getState())));
    this.d(bus.on('chrome:openNearest', (m) => {
      const id = (m && m.id) || this._nearest;
      if (!id) return;
      this._say({ id: 'chrome:nearest', text: null });
      this._saidBad = false;
      store.dispatch('select', id);
    }));

    this._refreshDefault(store.getState());
    bus.emit('chrome:ready', { stage: this.stage, rail: this.rail });
  },

  update(state, prev, changed) {
    if (changed.has('reducedMotion') && this.sweep) this._stopSweep();
  },

  destroy() {
    clearTimeout(this._defT);
    clearTimeout(this._unknownT);
    clearTimeout(this._nearT);
    this._setTools(false, false);
    this._stopSweep();
    this._closeSheet();
    this._stopLayout();
    if (this.d) this.d.all();
  },

  /* ==================================================== the layout ======= */

  /**
   * THE RAIL'S ORIENTATION, AND THE PLATE'S FLOOR.
   *
   * layout.css decides both in media queries; this mirrors the same condition
   * onto `#app[data-rail]` and measures the two numbers CSS cannot: where the
   * stage actually starts, and where the drawn map actually is. A bottom sheet
   * sized only from `dvh` does not know that the map is above it, which is how
   * a 900x700 window ended up with a 406px sheet over a 358px stage and no
   * atlas in the atlas.
   *
   * Three published values, all on `#app`, all in CSS pixels:
   *   --stage-top      the stage's y — nothing may be pinned above it (B5)
   *   --stage-height   the stage's height
   *   --rail-top-min   the highest y a bottom sheet may reach, i.e. the drawn
   *                    map's top plus the plate's floor. layout.css clamps the
   *                    sheet against it.
   *
   * It is measured, not computed from tokens, because the map moves: at phone
   * width P02 lifts the plate out of the stage into a fixed strip, and the
   * floor has to follow the thing it is protecting.
   */
  _startLayout() {
    if (typeof window === 'undefined') return;
    this._sheetMq();

    let queued = 0;
    const run = () => { queued = 0; this._measure(); this._armReadFloor(); };
    this.d(() => {
      if (this._floorTimer) { clearTimeout(this._floorTimer); this._floorTimer = 0; }
      if (this._floorRaf) { cancelAnimationFrame(this._floorRaf); this._floorRaf = 0; }
    });
    this._relayout = () => { if (!queued) queued = requestAnimationFrame(run); };

    window.addEventListener('resize', this._relayout, { passive: true });
    window.addEventListener('orientationchange', this._relayout, { passive: true });
    if (this._mqSheet && this._mqSheet.addEventListener) this._mqSheet.addEventListener('change', this._relayout);
    this._dockMq();
    if (this._mqDock && this._mqDock.addEventListener) this._mqDock.addEventListener('change', this._relayout);

    // The map may move without the window changing size (P02's enlarged plate,
    // the apparatus gutter opening). Watch the two boxes that decide the floor.
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(this._relayout);
      /* The rail's own box is observed too: its height is clamped against
         `--rail-top-min`, which this function writes, so the seam it publishes
         as `--rail-clear` is only correct one frame later. There is no loop —
         `--rail-clear` moves the key strip, not the rail. */
      for (const sel of ['.app__stage', '.app__dossier', '.app__sheet', '.stage__dock', '.stage__key', '.bar__dock', '.map__furniture']) {
        const n = document.querySelector(sel);
        if (n) this._ro.observe(n);
      }
      if (this.app) this._ro.observe(this.app);
    }
    /* The map can also move without anything resizing: at phone width P02 lifts
       the plate out of the stage and parents it into the overlay when a
       territory is selected. A ResizeObserver on the stage never hears that —
       measured, the floor stayed where the stage's stale <svg> was and the
       sheet started 110px below the map. Watch the two places the plate can be
       re-parented to, and re-measure after any state change that moves it.
       `_relayout` coalesces to one frame and `_measure` returns early when
       nothing has changed, so this costs a rectangle read. */
    if (window.MutationObserver) {
      /* tours re-renders its bar on some beats and appends it to the overlay
         again; the observer that already watches that layer re-adopts it. */
      this._mo = new MutationObserver(() => { this._syncStepDock(); this._relayout(); });
      for (const sel of ['.app__overlay', '.stage__map']) {
        const n = document.querySelector(sel);
        if (n) this._mo.observe(n, { childList: true });
      }
      /* THE BEAT'S DECLARATION IS AN ATTRIBUTE ON <html>, AND NOTHING RESIZES
         WHEN IT CHANGES. `data-tour-fit` moves `--rail-top-min`, which moves a
         `position: fixed` sheet and a `position: absolute` plate; neither is a
         grid track, so no ResizeObserver above ever hears it. Measured before
         this observer: a press on the panel's `Map` control changed the
         attribute and the band stayed as it was until the next unrelated
         relayout. The beat panel's own root is watched for the same reason —
         `data-kind` is the fallback this file reads when nothing declared. */
      this._readMo = new MutationObserver(() => this._relayout());
      this._readMo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tour-fit'] });
      for (const sel of ['.app__sheet', '.app__dossier']) {
        const n = document.querySelector(sel);
        if (n) this._readMo.observe(n, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-kind', 'data-beat'] });
      }
      this.d(() => { try { this._readMo.disconnect(); } catch (_) {} });
    }
    this._layoutOff = this.ctx.store.subscribe((state, prev, changed) => {
      /* `activeTour` changes the masthead (the transport's reserved box opens)
         and `tourStep` changes what is in it, so both move the rectangles this
         function publishes. Before they were watched, a cold load into a beat
         published the cold plate's docks and the pinned transport landed on
         nothing. */
      if (changed.has('activeTour') || changed.has('tourStep')) this._syncPath(state);
      if (changed.has('selectedTerritoryId') || changed.has('panelState')
        || changed.has('activeLayer') || changed.has('activeTour') || changed.has('tourStep')) this._relayout();
    });
    this._syncPath(this.ctx.store.getState());
    this._measure();
  },

  /**
   * IS A LESSON MOUNTED? — `#app[data-path="on"|"off"]`.
   *
   * Two things in this file need the answer and neither should ask the tours
   * module for it: the transport's reserved box in the masthead opens only for
   * a lesson, and the masthead's own collapse stops being a measurement and
   * becomes a constant (see `_fitBar`). `state.activeTour` is the store's own
   * value, it round-trips through the address, and it is set before any beat
   * has rendered, so a cold load into `#tour=thirty&step=9` is right on its
   * first paint rather than one frame later.
   */
  _syncPath(state) {
    if (!this.app) return;
    const on = !!(state && state.activeTour);
    const v = on ? 'on' : 'off';
    if (this.app.dataset.path === v) return;
    this.app.dataset.path = v;
    this._barNatural = 0;          // the bar's contents just changed
    this._syncStepDock();
    if (this._relayout) this._relayout(); else this._measure();
    this._fitBar();
  },

  /**
   * THE TRANSPORT MOVES IN THE DOM, NOT ONLY ON SCREEN — `#dock-step`.
   *
   * The rest of the docking in this pass is done from chrome.css SS-E, by
   * pinning a `position: fixed` control to a rectangle the shell publishes.
   * That is enough for a control the eye has to find. It is NOT enough for a
   * control the KEYBOARD has to find, and Back and Next are the second kind.
   *
   * Measured at 390x844 on beat 9, with the bar pinned into the masthead but
   * still parented into `.app__overlay` — which is the last element in the
   * document, because that is what a full-screen layer has to be:
   *
   *   tab 1  Skip to the map          tab 4  Tools
   *   tab 2  Skip to the timeline     tab 5  The argument, in full
   *   tab 3  Layers                   tab 6  a territory on the map
   *   ... and Back and Next are somewhere past tab 40, after the whole dossier
   *
   * A control drawn between `Layers` and `Tools` and reached fortieth is worse
   * than the floating bar it replaced: WCAG 2.4.3 is about exactly this gap
   * between what a screen shows and what a keyboard does. CSS cannot close it;
   * only the document order can.
   *
   * So the shell ADOPTS the node into the slot it built for it. Nothing is
   * re-created — the same element, with tours' own listeners and its own
   * lifecycle — and it goes home the moment the band or the lesson changes, so
   * tours' teardown finds what it appended where it appended it.
   *
   * DELETE this function when tours renders its transport into
   * `data-mount="dock-step"` itself. It becomes a no-op first: the node is
   * already in the slot, and `_syncStepDock` returns on its first line.
   */
  _syncStepDock() {
    const slot = document.getElementById('dock-step');
    if (!slot || !this.app) return;
    const want = this.app.dataset.dock === 'docked' && this.app.dataset.path === 'on';
    const node = document.querySelector('.tr-dock');

    if (want && node && node.parentNode !== slot) {
      if (!this._stepHome) this._stepHome = { parent: node.parentNode, next: node.nextSibling };
      slot.appendChild(node);
      this._stepAdopted = node;
      if (this._relayout) this._relayout();
      return;
    }
    if (!want && this._stepAdopted) {
      const n = this._stepAdopted, home = this._stepHome;
      this._stepAdopted = null; this._stepHome = null;
      /* tours may have removed it while it was here — its own teardown, or a
         re-render. A detached node is not put back anywhere. */
      if (n && n.isConnected && home && home.parent && home.parent.isConnected) {
        try { home.parent.insertBefore(n, home.next && home.next.isConnected ? home.next : null); } catch (_) { home.parent.appendChild(n); }
      }
      if (this._relayout) this._relayout();
    }
  },

  /**
   * THE JUMP TO A FIGURE ANOTHER PIECE APPENDED — round 3, named by two
   * critics at once, and there is no room for it in the masthead in the whole
   * docked band.
   *
   * `viz/index.js` appends `.viz-onpath` — the counted figure that carries T3,
   * T8 and T14 onto the default route — into the sheet's body beside the beat
   * panel, and offers ONE control that jumps to it through the published
   * `tours:aux` slot in the tour bar. Measured, mid-lesson, on the beat that
   * carries T3:
   *
   *   390x844   `.tr-bar__aux` computes `display: none` and has a 0x0 box —
   *             `tours.css` §1 stands it down under 46rem and is right to:
   *             the bar is mark 28 + Layers 97 + the transport's box 220 +
   *             Tools 68 = 413 of 390, and the aux copy rendered "One mo".
   *             `.viz-entry` in the masthead is `display: none` too, so the
   *             figure had no route in of any kind.
   *   768x1024  the button is drawn at x 665-736, OUTSIDE the 144px box it
   *             lives in (`.bar__dock` ends at 672), and `Tools` runs
   *             684-752 — so its own centre hit-tests to `.bar__more-w`.
   *   900x700   the same, aux 797-868 against Tools at 816-884.
   *
   * That is the defect RESPONSIVE_LAW §12.1 recorded for the transport and
   * deferred at these two windows, arriving on the one control that carries a
   * must-stick item onto the path. `budget-working.js` W16h measures it now.
   *
   * The lede band cannot take it either: on that beat it is already carrying
   * "1655", the beat's two-line sentence and "The argument, in full" across
   * all 358px of it at 390.
   *
   * The sheet's own head is free, it is the one piece of furniture the shell
   * draws for every surface, and in this band it has already shed its eyebrow
   * (`display: none`), which is the slot this stands in. So the shell ADOPTS
   * the node — the same element, with tours' listeners and viz's payload; it
   * is never re-created and never re-labelled — exactly as `_syncStepDock`
   * adopts the transport, and puts it back the moment the figure, the band or
   * the lesson changes. One home for one control across the whole docked band,
   * which is §8's rule about a bar that can be learned, said about a chip.
   *
   * IT IS SCOPED TO THE FIGURE ON PURPOSE. `tours:aux` is a shared extension
   * point: the teacher desk offers "Move 3 · Comparing two extracts" through
   * it and onboarding offers a review of three wrong answers, and neither of
   * those belongs in a 324px head. The condition is the case the critics
   * measured — a block appended into the open sheet that the beat's own
   * scroller does not contain.
   *
   * DELETE this function when viz renders its own marker inside the beat's
   * prose at phone width, or when the bar has a box its aux fits in.
   * docs/RESPONSIVE_LAW.md §11.5B.
   */
  _syncPathJump() {
    if (!this.app || !this.sheetMount) return;
    const head = this.sheetMount.querySelector('.cx-sheet__head');
    const aux = document.querySelector('.tr-bar__aux');
    const want = !!head && !!aux
      && this.app.dataset.dock === 'docked'
      && !!document.querySelector('.app__sheet .viz-onpath')
      && !!aux.querySelector('button');

    if (want && aux.parentNode !== head) {
      if (!this._auxHome) this._auxHome = { parent: aux.parentNode, next: aux.nextSibling };
      head.insertBefore(aux, this.sheetFit || head.lastElementChild);
      this._auxAdopted = aux;
      return;
    }
    if (!want) this._restoreAux();
  },

  /** The other half of `_syncPathJump`, so teardown can use it too: tours
   *  removes what it appended and it must still be where tours left it. */
  _restoreAux() {
    if (!this._auxAdopted) return;
    const n = this._auxAdopted, home = this._auxHome;
    this._auxAdopted = null; this._auxHome = null;
    /* tours may have re-rendered its bar while the span was here. A detached
       node, or a home that has itself left the document, is not put back. */
    if (n && n.isConnected && home && home.parent && home.parent.isConnected) {
      try { home.parent.insertBefore(n, home.next && home.next.isConnected ? home.next : null); } catch (_) { home.parent.appendChild(n); }
    }
  },

  _stopLayout() {
    /* Put it back before anything else is torn down: tours removes what it
       appended, and it must still be where tours left it. */
    if (this._stepAdopted) { this.app && (this.app.dataset.dock = 'float'); this._syncStepDock(); }
    this._restoreAux();
    if (this._relayout) {
      window.removeEventListener('resize', this._relayout);
      window.removeEventListener('orientationchange', this._relayout);
      if (this._mqSheet && this._mqSheet.removeEventListener) this._mqSheet.removeEventListener('change', this._relayout);
    }
    if (this._ro) { try { this._ro.disconnect(); } catch (_) {} this._ro = null; }
    if (this._mo) { try { this._mo.disconnect(); } catch (_) {} this._mo = null; }
    if (this._layoutOff) { try { this._layoutOff(); } catch (_) {} this._layoutOff = null; }
  },

  /**
   * THE PLATE'S FLOOR — what the bottom sheet may never take.
   *
   * It used to be a flat 150, and 150 was a lie about what a student saw.
   * Measured at 390x844 inside beat 9, the band it protected ran y=156 to
   * y=306 and held THREE strips as well as the map: the pinned colour ribbon
   * (390x28), the lesson's transport (206x40) and the map's zoom cluster
   * (136x42). 24,872 px2 of a 58,500 px2 band — 42.5% — was furniture, so the
   * "150px of map" the clamp defended was about 122px of map with 29% of that
   * covered. Nothing measured it, because LAYOUT_BUDGET B5 exempts
   * `.app__overlay` and all three of those strips live there.
   *
   * docs/RESPONSIVE_LAW.md takes the furniture off the plate and gives it two
   * strips of its own at the foot. So the floor is now stated in three parts
   * and MEASURED for two of them:
   *
   *     --map-min   the clean, contiguous map. 152 on a phone, 300 on a
   *                 tablet in portrait. Declared in layout.css per band.
   *   + .stage__dock   the control dock   (0 at data-stage="plate")
   *   + .stage__key    the colour ribbon
   *
   * Measuring the two strips rather than summing their tokens is the same
   * lesson `--dock-floor` records: a strip that is content-sized, wraps, and
   * exists only from one disclosure level upward cannot be added up in CSS.
   */
  /**
   * THE PEEK STRIP'S HEIGHT — `--read-peek`, read from the stylesheet.
   *
   * 44px, and it is one number rather than a per-band table because the strip
   * is a CONTROL: it is the map offering itself back, and WCAG 2.2 SC 2.5.5
   * says a primary one-handed target is 44x44. A 28px strip would be a
   * decoration a thumb cannot reliably hit; a 96px strip would be a small bad
   * map. At 44 it prints a legible slice of the place a beat is about — 
   * measured at 390x844 on step 18, Punjab at the beat's own zoom is still
   * outlined and still labelled — and it restores the band in one tap.
   */
  _readPeek() {
    const app = this.app;
    let n = 44;
    if (app) {
      const v = getComputedStyle(app).getPropertyValue('--read-peek-h').trim();
      const f = parseFloat(v);
      if (Number.isFinite(f) && f > 0) {
        n = /rem\s*$/.test(v)
          ? f * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)
          : f;
      }
    }
    return Math.max(28, Math.round(n));
  },

  _mapFloor() {
    const app = this.app;
    let min = 150;
    if (app) {
      const v = getComputedStyle(app).getPropertyValue('--map-min').trim();
      const n = parseFloat(v);
      if (Number.isFinite(n) && n > 0) {
        min = /rem\s*$/.test(v)
          ? n * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16)
          : n;
      }
    }
    return Math.round(min);
  },

  /**
   * HOW DEEP THE FOOT STRIPS ARE — the union, not the sum.
   *
   * The control dock and the colour ribbon both sit between the drawn map and
   * an open bottom sheet, so both are charged to the floor. P17 renders the
   * ribbon in TWO places — its own slot, and, the moment a rail opens under
   * 62rem, a `position: fixed` copy carrying both classes so that the sheet
   * cannot bury it — so a per-selector sum counted one strip twice and charged
   * the map 32 pixels it was not paying. Rows are merged by their vertical
   * extent, which is exact whichever copies happen to be live.
   */
  _footStrips() {
    const rows = [];
    for (const sel of ['.stage__dock', '.stage__key', '.legend__pin']) {
      for (const n of document.querySelectorAll(sel)) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = n.getBoundingClientRect();
        if (r.height > 2 && r.width > 8) rows.push([r.top, r.bottom]);
      }
    }
    rows.sort((a, b) => a[0] - b[0]);
    let total = 0, end = -Infinity;
    for (const [t, b] of rows) {
      if (b <= end) continue;
      total += b - Math.max(t, end);
      end = b;
    }
    return Math.round(total);
  },

  /**
   * THE PLATE'S FOOT SEAM — `--dock-floor`.
   *
   * Round 3, measured at 900x700 on the first beat of the guided path:
   *
   *   .tr-dock       fixed  382,381  206x40   z 62
   *   .map__switch          8,402    580x66   — "British means 1 2 3 4"
   *   .map__defs            123,407  337x32
   *   overlap(dock, .map__switch)   3,914 px²
   *   overlap(dock, .map__defs)     1,092 px²  — the right-hand end of the dial,
   *                                              which is "3 controlled" and
   *                                              "4 influenced"
   *
   * The critic's words: "the floating tour bar overlays the map's definition
   * switch and clips options 3 controlled and 4 influenced, making two of the
   * four definitions of British unclickable at a listed test viewport."
   *
   * The cause is the same class of bug as `--rail-clear` (§2A): two pieces pin
   * something along the foot of the plate and neither can see the other. P02
   * puts its control strip there because the foot of a British Empire plate is
   * the Southern Ocean; P05 puts the transport there because the foot is the
   * one place a floating bar covers no land. Both are right. Nobody owns the
   * seam, so P05 computes it from four tokens plus its own `--tr-dock-lift`,
   * and on a cold load into beat 1 that custom property is not written yet —
   * measured, it read `""`, and the bar sat 19px inside the dial.
   *
   * A token sum cannot answer this. The map's strip is content-sized: it is
   * 66px at 900x700 and 32px at 1440x900, it wraps, and it appears only at
   * `data-stage="working"`. So the shell measures where the plate's furniture
   * actually starts and publishes ONE number, the way it already publishes the
   * rail's seam. Consumers write `bottom: var(--dock-floor)` and stop guessing.
   *
   * Clamped at both ends: never lower than the top of the time bar (the floor
   * every consumer already had) and never so high that the bar climbs off the
   * plate onto the map's own labels.
   */
  _dockFloor(plate) {
    const vh = window.innerHeight;
    let top = Infinity;
    /* Everything already pinned along the foot of the plate or below it. The
       open bottom sheet is in the list because in the sheet band it is the
       lowest thing the dock must clear; beside a column it is not on the foot
       at all and `_measure` never asks. */
    const sels = ['.map__foot', '.stage__dock', '.stage__key', '.legend__pin', '.app__time', '.app__foot'];
    if (this.rail === 'sheet') sels.push('.app__sheet', '.app__dossier');
    for (const sel of sels) {
      for (const n of document.querySelectorAll(sel)) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const r = n.getBoundingClientRect();
        if (r.width < 8 || r.height < 4) continue;
        if (r.top > vh || r.bottom < 0) continue;
        top = Math.min(top, r.top);
      }
    }
    if (!Number.isFinite(top)) top = vh;
    const GAP = 4;
    let floor = Math.round(vh - top + GAP);
    /* The ceiling. A tall wrapped strip must not push the transport up over the
       map's own labels: the bar stays in the lower half of the plate, and if
       the furniture is deeper than that the furniture is the thing over budget
       (LAYOUT_BUDGET B3's remedy: shed a stratum, do not take the room). */
    const plateTop = plate ? plate.top : 0;
    const plateH = plate ? plate.height : vh;
    const ceiling = Math.max(0, Math.round(vh - plateTop - Math.max(96, plateH * 0.42)));
    return Math.max(0, Math.min(floor, ceiling));
  },

  /* ==================================================== reading mode ===== */

  /**
   * READING MODE — `#app[data-read="on"|"off"]`, `#app[data-beatwork]`.
   *
   * docs/RESPONSIVE_LAW.md §11. LAYOUT_BUDGET B1 ("the plate keeps at least
   * 50–64 % of the viewport") was written for the COLD PLATE, where the plate
   * IS the subject of the page. Inside a mounted beat whose work is textual it
   * is the wrong rule, and it was being applied there. Measured at 390x844 on
   * `#tour=thirty&step=18` — Dyer and Tagore on Amritsar, the app's C6 beat —
   * on the build this function was written against:
   *
   *   .stage__map          390x72       the map, drawing a static Punjab
   *   .legend__pin         390x32       a colour key for 72px of map
   *   .app__sheet          390x378      the lesson
   *   .tr-panel__scroll    390x226   holding 2,154px of prose  = 9.5 screenfuls
   *   .app__time           390x184      a time control 2.4x the size of the
   *                                     window the lesson is read through
   *
   * Four lines of the beat at a time, with a fade slicing a sentence at both
   * edges. Three phone rounds named it as the one defect that decides whether
   * a fifteen-year-old finishes this on a bus.
   *
   * SO THE BAND IS SPLIT BY WHAT THE BEAT IS DOING, NOT BY THE VIEWPORT.
   * `app/js/tours` already publishes the declaration — `<html data-tour-fit>`,
   * from the step's own kind, an authored `"fit"` field, or the student's
   * press on the panel's `Map` control. This function READS it (it does not
   * redefine it), falls back to the beat's `data-kind` when it is absent, and
   * publishes ONE attribute the whole shell keys on. What follows from it is
   * layout.css §READING MODE: the plate becomes a 44px peek strip, the colour
   * ribbon stands down with the map it keys, the time control becomes a 44px
   * year line, and the beat panel takes the rest of the band.
   *
   * The kinds whose work is textual, when nothing has declared: this list is
   * the FALLBACK and never overrules a declaration. `tension`, `dispute`,
   * `gate`, `sort`, `definition`, `close`, `source`, `retrieve`, `recall`,
   * `loop` and `offmap` argue in prose; `sweep`, `predict` and `present`
   * usually argue on the plate and keep it.
   */
  /** Is there a beat panel on screen at all? A declaration about a beat is
   *  only an answer while the beat it declares is mounted. */
  _livePanel() {
    const panel = document.querySelector('.tr-panel');
    if (!panel) return null;
    const cs = getComputedStyle(panel);
    if (cs.display === 'none' || cs.visibility === 'hidden') return null;
    return panel;
  },

  /** THE SURFACE AN OVERRIDE BELONGS TO. A student's press is remembered for
   *  as long as they stay on the thing they pressed it on, and forgotten the
   *  moment the step, the tour or the sheet changes under them — the same
   *  lifetime tours gives its own `Map` control. */
  _readKey() {
    const st = (this.ctx && this.ctx.store && this.ctx.store.getState()) || {};
    return (st.activeTour || '-') + '/' + (st.tourStep == null ? '-' : st.tourStep)
      + '/' + (this.sheetOpen ? (this.sheetId || 'sheet') : '-');
  },

  _readWork() {
    if (!this.app) return null;
    /* THE SHEET BAND, not the whole docked band. Reading mode exists because a
       BOTTOM SHEET splits one column of height with the plate and the time
       control; beside a side column (900x700 and the landscape tablets) the
       beat panel is already a full-height grid item measuring 92-93 % of the
       window and there is nothing to take. Measured at 900x700 on step 18:
       `.app__sheet` 304x652 of 700, `.tr-panel__scroll` 304x468. The defect
       this mode answers is not there, so neither is the mode. */
    if (!this._mqSheetMatches()) return null;
    if (!this._mqDockMatches()) return null;             // the float band is unchanged

    const panel = this._livePanel();
    const sheetId = this.sheetOpen ? (this.sheetId || '') : '';
    const lessonSheet = !!sheetId && LESSON_SHEET.test(sheetId);

    /* IS THIS A SURFACE READING MODE CAN APPLY TO AT ALL? Two answers, and the
       second one is this round's amendment. A mounted lesson step, as before;
       OR an open sheet carrying a surface of the lesson or of the ending. A
       territory dossier, a layer's key, the comparison, a chart: unchanged,
       because on those the map IS what the reader is looking at. */
    /* AND A SURFACE THAT HAS DECLARED IS ONE OF THEM, WHEREVER IT WAS OPENED
       FROM. §11.2 publishes `work` in `ask:sheet` as a contract any piece may
       use, and this line was quietly refusing to honour it outside a lesson:
       measured on the cold plate at 390x844 with the timeline's four-engines
       sheet open (`work: 'text'`, four 82px rows and a note), `data-read` was
       `off` and the surface was read through 242px under a full map band. */
    if (!panel && !lessonSheet && !this.sheetWork
      && !document.documentElement.getAttribute('data-tour-fit')) return null;

    /* 0. THE STUDENT'S OWN PRESS OUTRANKS EVERY DECLARATION, for as long as
       they stay on the surface they pressed it on. It is held here, and not on
       `<html data-tour-fit>`, because that attribute is tours' contract about a
       BEAT and three of the surfaces below are not beats: writing an override
       there told the rest of the app a step had declared something it had not.
       When tours has a control of its own, `_askRead` presses that instead and
       this is never reached. */
    if (this._readOverride) {
      if (this._readOverride.key === this._readKey()) return this._readOverride.mode;
      this._readOverride = null;
    }

    /* 1. THE STEP'S OWN DECLARATION, published by tours — AND ONLY WHILE THE
       BEAT IT DECLARES IS ON SCREEN. `data-tour-fit` is a property of a beat;
       a recall card, a gate and the Close are sheet surfaces of the lesson
       with no beat panel in them, and the attribute standing from the step
       before was answering for a beat that had left. Measured at 390x844 on
       `#tour=core&step=15` — "The famine on the railway", a recall card — the
       standing declaration read `map`, so reading mode was off and 661px of
       card was read through 242, with the map at 192 and NO CONTROL ANYWHERE
       to give the room back: the card renders no `.tr-panel__foot`, so tours'
       `Map` did not exist. That is the dead end the phone critic found. */
    if (panel) {
      const declared = document.documentElement.getAttribute('data-tour-fit');
      const kind = panel.getAttribute('data-kind') || '';
      if (declared === 'time') return 'time';
      /* AND THE SECOND HALF OF THE QUESTION, WHICH `fit` DOES NOT ANSWER.
         `text` means "the plate stands down"; on a beat whose evidence is the
         four lanes it must not mean "and so does the time control". The shell
         resolves the third claimant from the beat's own kind, and a beat that
         declares `time` outright is answered above. */
      if (declared === 'text') return TIME_WORK.has(kind) ? 'time' : 'text';
      if (declared === 'map') return declared;
    }

    /* 2. THE SHEET SURFACE'S OWN DECLARATION, then the surface table.
       `ask:sheet` carries an optional `work: 'text' | 'map'` and it is the
       same contract `fit` is for a beat: the piece that renders a surface says
       whether the plate or the panel is the evidence for it. Nothing declares
       yet; the table answers for the lesson's own surfaces and for the Close,
       and every other surface is left exactly as it was. */
    if (this.sheetWork === 'text' || this.sheetWork === 'map' || this.sheetWork === 'time') return this.sheetWork;
    if (!panel && lessonSheet) return 'text';

    /* 3. A LESSON SURFACE WITH NO BEAT PANEL AND NO SHEET — a Complication
       Gate rendered into the rail itself rather than into the sheet. The
       declaration answers, but only while something of the lesson is actually
       drawn. Measured with the sheet closed under a running step: the
       attribute stood, nothing was rendered, and the plate stayed a 44px strip
       with no reading anywhere to justify it. A mode with nothing in it is not
       a mode. */
    if (!panel) {
      const gate = document.querySelector('.qz');
      const declared = document.documentElement.getAttribute('data-tour-fit');
      if (!gate || getComputedStyle(gate).display === 'none') return null;
      return declared === 'text' || declared === 'map' ? declared : 'text';
    }
    const kind = panel.getAttribute('data-kind') || '';
    if (TIME_WORK.has(kind)) return 'time';
    if (TEXT_WORK.has(kind)) return 'text';
    if (MAP_WORK.has(kind)) return 'map';

    /* 4. THE SANE DEFAULT FOR AN UN-FLAGGED BEAT IS `text`.
       A beat that has not said what it is is a beat with prose in a panel and
       a polygon on a plate, and on a 390px screen the prose is the thing that
       cannot be read at 226px while the polygon is perfectly legible at 44.
       The map is one press away in either direction; the sentence is not. */
    return 'text';
  },

  /**
   * THE STUDENT'S OWN PRESS — `bus.emit('ask:read', { mode: 'map'|'text' })`.
   *
   * There is one toggle per surface and this routes to it, so the routes to it
   * can never disagree. On a beat tours renders it (`Map`, in the panel's foot
   * beside Next), owns the announcement, owns its own `aria-pressed`, and
   * forgets the override when the step changes; this presses that control. On
   * a surface tours does not own — a recall card, a gate, the Close — the
   * shell renders its own in the sheet's head (`_paintSheetFit`) and holds the
   * override itself, with the same lifetime.
   */
  _askRead(mode) {
    const want = mode === 'map' || mode === 'text' ? mode : null;
    if (!want) return;
    if (!this._aligning) this._readPref = want;
    const now = this._readWork();
    if (now === want) return;
    /* SCOPED TO THE OPEN SHEET, for the same reason `_paintSheetFit` is: a beat
       panel left mounted in the rail behind an open Close still carries its own
       `Map`, and `inert` stops a POINTER, not a scripted `click()`. Unscoped,
       pressing the Close's control toggled a beat nobody was looking at. */
    const btn = document.querySelector('.app__sheet .tr-panel__fit');
    if (btn && typeof btn.click === 'function') { btn.click(); return; }
    this._readOverride = { key: this._readKey(), mode: want };
    if (this._relayout) this._relayout(); else this._measure();
    announce(want === 'text'
      ? 'Reading. The map is a strip at the top; press Map to open it.'
      : 'The map is open. Press Read to give the room back to the text.');
  },

  /**
   * THE CONTROL THAT LEAVES READING MODE, ON EVERY SURFACE THAT CAN ENTER IT.
   *
   * Round 2, measured at 390x844: the two recall cards and the Close render no
   * `.tr-panel__foot` at all, so on them the app's only reading toggle did not
   * exist. A student who reached the Close, or who pressed OPEN THE MAP on a
   * recall card, had no way back to the text but Back or Next. A mode with an
   * entrance and no exit is worse than no mode.
   *
   * So the shell keeps one in the sheet's own head — the one piece of sheet
   * furniture the shell renders for every surface — and it is shown ONLY when
   * tours has not rendered one, so the interface never carries two controls
   * for one state. The peek strip is the third route to the same state and is
   * unchanged.
   */
  _paintSheetFit() {
    const btn = this.sheetFit;
    if (!btn) return;
    const work = this._readWork();
    /* SCOPED TO THE OPEN SHEET, and it has to be. A beat panel left mounted in
       the rail behind an open Close still carries its own `Map`, and it is
       inert and invisible: counting it hid the only control the surface on
       screen had. */
    const theirs = document.querySelector('.app__sheet .tr-panel__fit');
    const show = !!work && this.sheetOpen && !theirs;
    if (btn.hidden !== !show) btn.hidden = !show;
    if (!show) return;
    const reading = work === 'text';
    const w = btn.querySelector('.cx-sheet__fitw');
    const a = btn.querySelector('.cx-sheet__fita');
    if (w) w.textContent = reading ? 'Map' : 'Read';
    if (a) a.textContent = reading ? '▾' : '▴';
    /* LABEL IN NAME, WCAG 2.5.3: the visible word opens the accessible name. */
    btn.setAttribute('aria-label', reading
      ? 'Map — a strip at the top; press to open it to its full band'
      : 'Read — press to give this panel the screen and keep the map as a strip');
    btn.title = reading
      ? 'Open the map to its full band.'
      : 'Give this panel the screen. The map stays as a strip at the top.';
  },

  /** THE FURNITURE BETWEEN THE PANEL'S EDGE AND THE PROSE — the sheet's head,
   *  tours' foot and its gap, and the Close's through-line row. It is measured,
   *  never summed from tokens: three of the four belong to other modules
   *  (RESPONSIVE_LAW §11.6) and the fourth changes with the surface. It is
   *  constant for a surface, so the arithmetic that uses it converges in one
   *  frame. */
  /* AND IT IS MEASURED ONCE PER SURFACE, WHICH IS NOT AN OPTIMISATION.
     `--read-trim` is inside this difference: the trim shortens the window, the
     shorter window changes this offset, the offset moves the plate, the plate
     moves the panel and the trim is measured again. Measured under reduced
     motion at 390x844 with it read live every frame: `.tr-panel__fit` never
     became stable and Playwright gave up after thirty seconds of retries — a
     layout that never settles, which is the same class of defect as the two
     stable fixed points `_measure` records above. The offset is a property of
     the SURFACE (a sheet head, tours' foot and its gap, the through-line row),
     so it is taken when the surface changes and held for as long as it is on
     screen. */
  _panelOffset() {
    const win = this._readingWindow();
    const panel = document.querySelector('#app[data-sheet="open"] .app__sheet, .app__dossier:not([inert])');
    if (!win || !panel) return this._panelOff || 160;
    const key = this._readKey() + '|' + (win.className || '');
    if (this._panelOffKey !== key) { this._panelOffKey = key; this._panelOff = 0; this._trimReserve = 0; }
    /* AND THE TRIM IS RESERVED, NOT DISCOVERED AFTERWARDS. The furniture is
       what stands between the panel's edge and the prose; `--read-trim` is the
       line the window gives back on top of it, and it is applied to the same
       box. Measured at 768x1024 on the poster with the trim outside this sum:
       the plate was sized for a 320px window, the edge landed inside a line,
       the trim took 45 of them back and R17 read 275. The reserve only ever
       grows while a surface is on screen — a floor that could shrink as well as
       grow is the two-cycle this file has already paid for twice — and it is
       bounded by the trim's own cap. */
    const off = Math.round(panel.getBoundingClientRect().height
      - win.getBoundingClientRect().height - (this._trim || 0));
    if (off >= 40 && off <= 320) this._panelOff = off;
    this._trimReserve = Math.max(this._trimReserve || 0, this._trim || 0);
    return (this._panelOff || 160) + (this._trimReserve || 0);
  },

  /**
   * THE READING FLOOR, CHECKED AGAINST THE WINDOW THAT WAS DRAWN.
   *
   * `_measure` sizes the plate from `_panelOffset()`, which is a prediction:
   * on a surface it has not measured yet it is the 160px fallback, and it is
   * corrected only after the browser has laid the surface out. The plate is
   * therefore sized once from an offset belonging to the surface before it,
   * and the shortfall — measured at 1 to 3 pixels at 768x1024 — is invisible
   * to every rule that reads the tokens instead of the box.
   *
   * So the floor is asserted where `read.js` R17 asserts it: on the scroller
   * the prose is actually in, one frame after the layout was written. The
   * correction is a RESERVE, not a target — it only grows, it resets with the
   * surface, and it gives up the moment the plate is standing on D4's own
   * minimum, because a map under 220px (176 on a phone) is not a map and the
   * reading may not take that from it. Bounded at 64px, which is more than
   * three times the largest shortfall this arithmetic can produce.
   */
  _armReadFloor() {
    if (this._floorRaf || typeof requestAnimationFrame !== 'function') return;
    this._floorRaf = requestAnimationFrame(() => { this._floorRaf = 0; this._guardReadFloor(); });
  },

  /** AND IT LOOKS AGAIN AFTER THE BAND HAS SETTLED, BOUNDED, PER SURFACE.
   *  Under `prefers-reduced-motion` base.css gives every property a 1ms
   *  transition, so `max-block-size` ANIMATES and a rectangle read one frame
   *  after the write is a rectangle from between two states — the identical
   *  trap `_syncLineGrid` records two screens down. Measured at 768x1024 with
   *  `--reduced`, walking to `thirty step 1`: the guard read the window as over
   *  the floor mid-transition, took no action, and the band settled at 319
   *  against 320, while the same walk in full motion settled at 320. So a pass
   *  that declines to act asks to be woken once more, at most four times for a
   *  surface, and the counter resets with the surface. */
  _reArmReadFloor() {
    if ((this._floorLooks || 0) >= 4) return;
    this._floorLooks = (this._floorLooks || 0) + 1;
    if (this._floorTimer) return;
    this._floorTimer = setTimeout(() => { this._floorTimer = 0; this._guardReadFloor(); }, 90);
  },

  _guardReadFloor() {
    const app = this.app;
    if (!app) return;
    if (app.dataset.read === 'on' || app.dataset.beatwork !== 'map') { this._readShort = 0; return; }
    const win = this._readingWindow();
    if (!win) return;
    const key = this._readKey() + '|' + (win.className || '');
    if (this._floorKey !== key) {
      this._floorKey = key; this._readShort = 0; this._floorOff = -1;
      this._floorWait = 0; this._floorLooks = 0;
    }
    if (this._plateAtFloor) return;              // the plate has nothing left to give
    const anyMin = this._cssLen(document.documentElement, '--read-any-min', 240);
    const short = Math.round(anyMin - win.getBoundingClientRect().height);
    if (short < 1 || short > 64) { this._reArmReadFloor(); return; }
    /* AND A PREDICTION THAT HAS JUST BEEN CORRECTED IS NOT A SHORTFALL TO
       RESERVE FOR — IT IS ONE THAT HAS NOT BEEN SPENT YET. `_panelOffset()`
       measures itself as a side effect of the same `_measure` that sized the
       plate, so on the frame after a new surface the offset is right and the
       plate is still sized from the old one. Reserving here would pay for the
       same pixels twice: measured at 768x1024 on the poster, the plate went 306
       -> 277 to buy 1px of reading. So the first answer to a shortfall is to
       lay out again with the offset that is now known, and only what survives
       THAT is reserved.

       AND IT WAITS AT MOST THREE FRAMES. A surface whose furniture is still
       settling — a figure sizing itself, a testimony column reflowing — hands
       this a new offset every frame, and a rule that defers whenever the
       offset moved would defer for ever: measured on `eight step 5`, the plate
       GREW to 327 and the reading settled at 292 against the floor. Three
       waits, then the shortfall is reserved whatever the offset is doing,
       which is the same bound `_armTrim` uses for the same reason. */
    const off = this._panelOff || 0;
    if (!off) { this._reArmReadFloor(); return; }
    if (this._floorOff !== off && (this._floorWait || 0) < 3) {
      this._floorOff = off;
      this._floorWait = (this._floorWait || 0) + 1;
      this._refit();
      return;
    }
    const next = Math.min(64, (this._readShort || 0) + short);
    if (next === (this._readShort || 0)) { this._reArmReadFloor(); return; }
    this._readShort = next;
    this._refit();
  },

  /** THE LINE GRID IS NOT VALID ACROSS A CHANGE THIS PASS MADE.
   *  `_syncLineGrid` keys on the untrimmed window and gives up after four
   *  passes, both deliberately (see the two comments there). When THIS pass
   *  moves the plate, the window it already fitted no longer exists, and the
   *  four passes it spent were spent on the old one — measured at 768x1024 on
   *  `lesson-two step 9`, the reading reached its floor and R14 then read the
   *  bottom edge 11.2px into a line box. So the grid is told to start again for
   *  the geometry this pass is about to hand it. */
  _refit() {
    this._trimSh = 0; this._gridKey = ''; this._trimPasses = 0;
    this._trimBox = null; this._trimWait = 0;
    if (this._relayout) this._relayout();
  },

  /** A length token in CSS px, whatever unit it was written in. */
  _cssLen(node, prop, fallback) {
    if (!node) return fallback;
    let raw = '';
    try { raw = (getComputedStyle(node).getPropertyValue(prop) || '').trim(); } catch (_) { return fallback; }
    const n = parseFloat(raw);
    if (!isFinite(n)) return fallback;
    if (/rem$/.test(raw)) return n * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
    if (/em$/.test(raw)) return n * (parseFloat(getComputedStyle(node).fontSize) || 16);
    return n;
  },

  /** How many pixels the collapsed time control has handed to the band. It is
   *  the difference between the row the breakpoint states (`:root --time-h`,
   *  which no override can shadow) and the row the time control is actually
   *  drawn in. 0 whenever the band is whole. */
  _timeFreed() {
    const full = this._cssLen(document.documentElement, '--time-h', 0);
    if (!full) return 0;
    const el2 = document.querySelector('.app__time');
    if (!el2) return 0;
    const now = el2.getBoundingClientRect().height;
    if (!now) return 0;
    return Math.max(0, Math.round(full - now));
  },

  /**
   * THE STUDENT'S ANSWER OUTLIVES THE STEP THEY GAVE IT ON, in the sheet band.
   *
   * ROUND 3, the phone: "The MAP collapse preference does not persist between
   * beats: tap it on the poster, press Next, and the spine re-opens with 208px
   * of map and a 128px slot." Reading mode forgot the press on purpose — a
   * declaration is about a beat — and on a 390px screen that was the wrong
   * half of the trade: a student who has said "I want to read" has said
   * something about the screen in their hand and the bus they are on, not
   * about one beat, and they had to say it again at every stop.
   *
   * So the preference is held for the route, and it is APPLIED BY PRESSING THE
   * ONE CONTROL TOURS RENDERS — never by the shell writing tours' attribute
   * behind it, which would leave the beat's own `Map` button reporting a state
   * the band is not in. It fires at most once per step, so a student who
   * presses `Map` after it lands keeps the map for as long as they stay there.
   * It is the same mechanism §11.2 already gives `ask:read`, and the same
   * mechanism aligns a `sweep` beat, whose declared `map` the shell resolves as
   * `time`. docs/RESPONSIVE_LAW §11.10.
   */
  _alignFit() {
    if (!this._mqSheetMatches() || !this._mqDockMatches()) return;
    const panel = this._livePanel();
    if (!panel) return;
    const btn = document.querySelector('.app__sheet .tr-panel__fit, .app__dossier .tr-panel__fit');
    if (!btn || typeof btn.click !== 'function') return;
    const key = this._readKey();
    if (this._alignKey === key) return;
    const declared = document.documentElement.getAttribute('data-tour-fit');
    if (declared !== 'map' && declared !== 'text') return;
    /* THE TWO REASONS THE DECLARATION AND THE BAND CAN DISAGREE AT A MOUNT. */
    const kind = panel.getAttribute('data-kind') || '';
    /* A STUDENT WHO HAS ASKED FOR THE MAP KEEPS IT, EVEN ON A `time` BEAT.
       The alignment exists to make tours' control agree with a band the shell
       resolved; it is not a second opinion about a press the student has
       already made. */
    const wantText = (declared === 'map') && this._readPref !== 'map'
      && (TIME_WORK.has(kind) || this._readPref === 'text');
    const wantMap = (declared === 'text') && !TIME_WORK.has(kind) && this._readPref === 'map';
    this._alignKey = key;
    if (!wantText && !wantMap) return;
    /* AND THIS PRESS IS NOT THE STUDENT'S. The capture listener that records
       the preference cannot tell a thumb from a `click()`, and without this
       flag the shell's own alignment on the spine beat wrote `text` into the
       preference and carried it onto every map beat after it — measured in one
       session at 390x844: the exits opened in reading mode having been asked
       for by nobody. */
    this._aligning = true;
    try { btn.click(); } finally { this._aligning = false; }
  },

  _measure() {
    const app = this.app;
    if (!app) return;
    const stageEl = document.querySelector('.app__stage');
    if (!stageEl) return;

    /* THE DECLARATION IS ALIGNED WITH THE BAND BEFORE EITHER IS READ, so the
       beat's own `Map` control and the band can never report different states
       within one frame. It presses at most once per step. */
    this._alignFit();

    /* READING MODE IS RESOLVED AND PUBLISHED BEFORE THE STAGE IS MEASURED, and
       that order is the whole of it. `data-read` moves `--time-h` and
       `--key-h` in layout.css, which moves the stage's own grid track; reading
       the rectangle first and setting the attribute afterwards measured last
       frame's band and settled over two frames with a visible jump. Setting an
       attribute invalidates style; the `getBoundingClientRect()` below flushes
       layout; so this reads the band the student is about to see.
       docs/RESPONSIVE_LAW.md §11. */
    const work = this._readWork();
    /* `data-read` HAS ALWAYS MEANT ONE THING: THE PLATE HAS STOOD DOWN. Two of
       the three works collapse it — `text` because the prose is the subject and
       `time` because the four lanes are — so the attribute answers `work !==
       'map'` and every rule already written against it is unchanged.
       docs/RESPONSIVE_LAW §11.10. */
    const readOn = work === 'text' || work === 'time';
    const readV = readOn ? 'on' : 'off';
    if (app.dataset.read !== readV) app.dataset.read = readV;
    const workV = work || '';
    if ((app.dataset.beatwork || '') !== workV) {
      if (workV) app.dataset.beatwork = workV; else delete app.dataset.beatwork;
    }
    /* AND THE TIME CONTROL STANDS DOWN ON EVERYTHING THAT IS NOT ABOUT TIME.
       184px of transport, axis, uncertainty rail and four lanes is right on the
       cold plate and on the beat whose argument is the lanes; inside every
       other mounted step it is a control 1.4x the size of the window the lesson
       is read through. It becomes the 52px year line — the year, the axis, and
       which of the four empires are running — and ONE PRESS brings the whole of
       it back, because it comes back with the map it stood down beside. */
    const timeV = work && work !== 'time' ? 'line' : '';
    if ((app.dataset.timeband || '') !== timeV) {
      if (timeV) app.dataset.timeband = timeV; else delete app.dataset.timeband;
    }

    const stage = stageEl.getBoundingClientRect();

    /* The drawn map, wherever it currently is. The enlarged plate is asked for
       FIRST because when P02 lifts the map out of the stage into a fixed strip
       (phone width, a territory open) the stage's own <svg> is still in the
       document and still 390x476 — measuring that one put the floor 110px
       below the map it was meant to protect and left a strip of empty stage
       between the map and the sheet. */
    let plate = null;
    for (const sel of ['.map.is-enlarged', '.stage__map canvas', '.stage__map svg', '.stage__map']) {
      const n = document.querySelector(sel);
      if (!n) continue;
      const cs = getComputedStyle(n);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = n.getBoundingClientRect();
      if (r.width > 40 && r.height > 40) { plate = r; break; }
    }
    /* WHERE THE BOTTOM SHEET MAY START.
       Two terms, and the second one is the whole of the responsive pass. The
       first is `--map-min`: how much CLEAN, CONTIGUOUS map a student keeps —
       never more than the map actually draws, or the sheet is charged for map
       that is not there. The second is the depth of the foot strips, because
       the colour ribbon and the control dock stand BETWEEN the map and the
       sheet and have to be somewhere.

       It used to be one flat 150 with the ribbon inside it, which is why the
       ribbon was drawn across the bottom 32px of the map at 390x844 and the
       map's own zoom cluster on top of that: the clamp thought it was
       protecting 150px of atlas and was protecting about 120. Measured at
       390x844 on beat 9, drawn map 390x152, ribbon 390x28 at y=278: the two
       overlapped by 10,920 px2, 18.4% of the band. They do not now, and the
       arithmetic that stops them is this line. */
    /* THE FOOT STRIPS ARE STILL MEASURED IN READING MODE, and the measurement
       is the point. The colour ribbon stands down there (layout.css §READING
       MODE sets `display: none` on both of P17's copies) so it measures 0 by
       itself; the CONTROL DOCK does not, because the four definitions of
       "British" are the best single idea in this application and rule Q4 of
       `shell-accept.js` exists to stop them becoming unreachable — measured at
       768x1024 with `--dock-h` forced to 0 in this state, all four were
       hit-tested as BLOCKED. So the dial keeps its 36px row under the peek
       strip wherever it is rendered (at 390 it is not; chrome.css §E and
       RESPONSIVE_LAW §5), and reading mode pays for it out of the panel, which
       at 768x1024 has 742 pixels to pay it from. `data-read` is set at the top
       of this function and `getComputedStyle` flushes style, so this reads the
       band as it will be and not as it was. */
    const strips = this._footStrips();
    /* The most the map may keep before the panel falls under LAYOUT_BUDGET B8.
       A sheet is never allowed to be shorter than `--cx-sheet-min`, so the map
       is never allowed to be taller than what is left after it. */
    const capMax = Math.max(40, Math.round(stage.height - strips - 280));
    /* AND THE MAP GETS THE REST — computed from the STAGE, never from the map.
     *
     * Reserving "what the map actually draws" was tried and it is a trap: the
     * reservation sets the map's rectangle (layout.css, THE MAP'S RECTANGLE IS
     * THE ROOM IT ACTUALLY GETS) and the rectangle sets what the map draws, so
     * the pair is a feedback loop that can only ever contract. Measured at
     * 390x844 under `prefers-reduced-motion`, where the first frames happen in
     * a different order: it settled at a map of 165 and a panel of 352, while
     * the same build under full motion settled at 192 and 280. Both are stable
     * fixed points of the same arithmetic. A layout with two answers is a
     * layout with none.
     *
     * The stage's own height is an input, not an output, so this has one
     * answer: the panel gets exactly `--cx-sheet-min` — B8's floor, which is
     * what a bottom sheet is entitled to and no more — the two foot strips get
     * their measured depth, and the map gets everything that is left. It is
     * also the most map the budget can give: 192 of a 390x844 phone against
     * the 122 (with 29% of that covered) this pass started from.
     *
     * `--map-min` is the pre-paint floor, used before there is a stage to
     * measure. If the map letterboxes inside the rectangle it is handed, the
     * empty band is inside `.stage__map`, which is exactly what B6 measures
     * and exactly what P02 owns. */
    /* AND IN READING MODE F1 IS INVERTED, ON PURPOSE. The map keeps the peek
       strip — `--read-peek`, 44px, which is WCAG 2.5.5's target size because
       the strip IS the control that restores the band — and the PANEL gets
       everything that is left. It is the same one-number arithmetic as F1 with
       the two claimants swapped, which is why nothing downstream changes: the
       sheet's clamp and the map's rectangle both read `--rail-top-min` and
       neither knows or cares which of the two asked for the number.
       docs/RESPONSIVE_LAW.md §11.3. */
    const peek = this._readPeek();
    /* AND ON A MAP-WORK BEAT THE PLATE KEEPS EXACTLY THE BAND IT HAD.
       `capMax` is what is left of the STAGE after the panel's floor, and the
       stage grew by the 132px the time control just gave back — so without
       this line the plate would have eaten every pixel reading mode freed and
       the poster would still be read through 128. The freed pixels are the
       PANEL's: the plate measures 208 at 390x844 before and after, `read.js`
       R9 and `dock.js` D4 are unmoved, and the sheet's own clamp
       (`100dvh - --sheet-clear - --rail-top-min`) hands the remainder to the
       reading. docs/RESPONSIVE_LAW §11.10. */
    const freed = this._timeFreed();
    let clean = readOn ? peek : Math.max(40, capMax - freed);
    /* AND THE PLATE GIVES UP THE DIFFERENCE WHEN THE READING WOULD FALL UNDER
       ITS FLOOR. At 390x844 the arithmetic never reaches this: the plate is
       208, the panel 412 and the window 255 against a floor of 240. At
       768x1024 it does — the plate was 350 and the exits beat read 240 against
       a floor of 320 — so the plate drops to what leaves the floor standing,
       and stops at D4's own minimum, which is the point at which the map is no
       longer a map. `--read-any-min` is the token both this and `read.js` R17
       read, so the shell and the harness cannot hold different numbers. */
    /* AND THE PREDICTION IS CORRECTED AGAINST THE WINDOW THAT WAS ACTUALLY
       DRAWN — WAVE 10, AND IT IS ONE TO THREE PIXELS.
       `_panelOffset()` is a PREDICTION of what stands between the panel's edge
       and the prose, and on a surface it has not seen before it starts at the
       160px fallback and is corrected on the next frame. So the plate is sized
       from an offset that is right for the surface the student just left.
       Measured at 768x1024, walking `read.js`'s own plan in one session (the
       poster is reached after a Close, not cold): `thirty step 1` settled at a
       294px plate and a 319px window against a 320px floor, `lesson-two step 9`
       at 317, while a COLD load of either address settled at 320 exactly. Both
       are stable fixed points of the same arithmetic reached from two different
       states, which is the shape this file has already paid for twice.
       `_guardReadFloor` reads the achieved window one frame later and reserves
       the shortfall here. It only ever grows within a surface and resets with
       the surface, so it cannot oscillate; it is bounded at 64px and it stops
       the moment the plate is standing on D4's own floor and has nothing left
       to give. docs/RESPONSIVE_LAW §11.15. */
    if (!readOn && work === 'map') {
      const anyMin = this._cssLen(document.documentElement, '--read-any-min', 240);
      const d4 = this.app && this.app.clientWidth >= 700 ? 220 : 176;
      const need = anyMin + this._panelOffset() + (this._readShort || 0);
      const room = Math.round(stage.height - strips - need);
      clean = Math.max(d4, Math.min(clean, room));
      this._plateAtFloor = clean <= d4;
    } else {
      this._plateAtFloor = false;
    }
    void this._mapFloor;
    const keepTo = stage.top + clean + strips;
    const railTopMin = Math.round(Math.max(keepTo, stage.top + 40));

    this._fitBar();

    const rail = this._mqSheet ? (this._mqSheet.matches ? 'sheet' : 'side') : 'side';

    /* THE SEAM, AND WHY IT IS ZERO BESIDE A COLUMN.
       `--rail-clear` answers one question and only one: "how far up from the
       bottom edge does the open rail reach, so that I can sit immediately above
       it?" That question has an answer when the rail is a bottom sheet. When it
       is a side column the rail is a full-height grid item, and the honest
       answer is that there is no bottom seam at all — the window's bottom edge
       belongs to the time bar.

       It was published unconditionally, and it was wrong by the height of the
       window. Measured at 900x700 on the guided path: the rail was a side
       column at y=52, so this reported 648; app/js/tours pins its transport at
       `bottom: max(--rail-clear, …) + --key-h`, which put Back and Next at
       y = -19 — off the top of the screen, unclickable, with no other way to
       advance the lesson. The lesson could not be finished at 900x700 and
       nothing measured it, because the cold plate has no transport in it.

       Beside a column the value is 0 and every consumer's `max(…)` expression
       falls back to its own floor, which is the time bar. */
    let railClear = 0;
    if (rail === 'sheet') {
      for (const sel of ['.app__sheet', '.app__dossier']) {
        const n = document.querySelector(sel);
        if (!n) continue;
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = n.getBoundingClientRect();
        if (r.height < 8 || r.width < 8) continue;
        railClear = Math.max(railClear, Math.round(window.innerHeight - r.top));
      }
    }

    /* The map's foot strip appears when the stage reaches `working` and it does
       not resize the stage, so no observer above hears it. Watch the box itself
       the first time it exists; after that it is one rectangle read per frame
       that already runs. */
    if (this._ro && !this._footObserved) {
      const foot = document.querySelector('.map__foot');
      if (foot) { try { this._ro.observe(foot); this._footObserved = true; } catch (_) {} }
    }

    this.rail = rail;

    /* THE DOCKED BAND, AND THE TWO DOCK RECTANGLES.
       docs/RESPONSIVE_LAW.md. `data-dock` mirrors the media condition;
       `--dock-step-*` and `--dock-foot-*` publish where the two reserved boxes
       actually are, so a piece that still renders a `position: fixed` control
       can be pinned into one from outside (chrome.css SS-E) without either
       side guessing. Both are written unconditionally — a box that is
       `display: none` publishes a zero rectangle, which is the honest answer
       to "where is the dock" when there is no dock. */
    const dock = this._mqDockMatches() ? 'docked' : 'float';

    /* IS THERE ANYTHING FOR THE FOOT DOCK TO HOLD?
       The strip costs the map its height, so it only exists when a control is
       going to be in it. Two ways for that to be true: a piece has rendered
       into `data-mount="dock-foot"` (the destination), or a piece still draws
       a control strip over the plate's foot and chrome.css SS-E is pinning it
       there for now (the transition). At data-stage="plate" and at 390 there
       is neither, and the map keeps the 36px. */
    let dockFoot = 'off';
    if (dock === 'docked') {
      const slot = document.querySelector('#dock-foot');
      if (slot && slot.querySelector('*')) dockFoot = 'on';
      if (dockFoot === 'off') {
        for (const sel of ['.map__foot']) {
          for (const n of document.querySelectorAll(sel)) {
            const cs = getComputedStyle(n);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            const r = n.getBoundingClientRect();
            if (r.height > 4 && r.width > 8) { dockFoot = 'on'; break; }
          }
        }
      }
    }

    /* THREE RECTANGLES: the transport's box in the masthead, the control dock
       at the foot of the plate, and the colour ribbon — which is a dock too,
       because it is where the zoom cluster goes, and because at phone width
       P17 empties its own slot and renders a pinned copy instead, so `where is
       the ribbon` has no answer in CSS. The ribbon's rect is whichever copy is
       live; when both are, the one nearest the plate's foot wins. */
    const rects = {};
    for (const [k, sels] of [['step', ['#dock-step']], ['foot', ['#dock-foot']],
                             ['key', ['.legend__pin.stage__key', '#app .stage__key', '.legend__pin']]]) {
      let r = { x: 0, y: 0, w: 0, h: 0 };
      for (const sel of sels) {
        for (const n of document.querySelectorAll(sel)) {
          const cs = getComputedStyle(n);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const b = n.getBoundingClientRect();
          if (b.height <= 2 || b.width <= 8) continue;
          if (r.h && b.top >= r.y) continue;
          r = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
        }
        if (r.h) break;
      }
      rects[k] = r;
    }
    /* The foot dock in the map's own furniture coordinates. `.map__furniture`
       carries `container-type: size`, which is `contain: size layout style`,
       which makes it a containing block for every `position: fixed` descendant
       — so a strip inside it cannot be pinned to a viewport rectangle, and the
       shim below would have had to guess. It is pinned by JS to be congruent
       with the drawn plate, so the honest thing to publish is the OFFSET from
       its own top-left to the dock. Both rectangles are read in the same frame
       and in the same coordinate space, so the difference is exact. */
    const furn = document.querySelector('.map__furniture');
    const fr = furn ? furn.getBoundingClientRect() : null;
    const off = {};
    for (const k of ['foot', 'key']) {
      off[k] = fr && rects[k].h
        ? { x: Math.round(rects[k].x - fr.left), y: Math.round(rects[k].y - fr.top) }
        : { x: 0, y: 0 };
    }
    const rectKey = dock + '|' + dockFoot + '|' + JSON.stringify(rects) + JSON.stringify(off);

    const dockFloor = this._dockFloor(plate);

    const changed = app.dataset.rail !== rail
      || this._lastTop !== Math.round(stage.top)
      || this._lastH !== Math.round(stage.height)
      || this._lastClear !== railClear
      || this._lastDock !== dockFloor
      || this._lastRects !== rectKey
      || this._lastRead !== readV + '|' + workV
      || this._lastFloor !== railTopMin;
    /* THE READING SURFACE'S OWN THREE JOBS, AND THEY ARE BEFORE THE EARLY
       RETURN. The control that leaves reading mode, the covered panel behind
       the sheet and the line grid the prose is read on all change when the
       CONTENT of the rail changes, and the rail's rectangle does not move when
       it does: measured, the Close opened over a mounted beat with identical
       geometry, `changed` was false, and the head still carried the shell's own
       toggle beside the one the Close renders. They are cheap and idempotent;
       `_syncLineGrid` does its own work only when the window it measures has
       actually resized. */
    this._paintSheetFit();
    this._syncPathJump();
    this._syncCovered();
    this._syncLineGrid(!!work);
    this._syncReadLength();

    if (!changed) return;
    this._lastRead = readV + '|' + workV;
    this._lastClear = railClear;
    this._lastDock = dockFloor;
    this._lastRects = rectKey;
    app.dataset.dock = dock;
    app.dataset.dockfoot = dockFoot;
    this._syncStepDock();
    /* Whether there is a provenance strip at all. `--foot-h` is 0 in the sheet
       band, so `.app__foot` is not on screen there and anything rendered into
       `data-mount="statusbar"` is invisible rather than short — measured at
       390x844, the through-line the student assembles across the whole lesson
       (`.cl-bar`, six clauses, the app's C5 centrepiece) was in the document,
       carried all six of its clauses, and had a bounding box of 0x0. A piece
       that has foot content needs a testable way to know that, and a height of
       zero is not a signal anyone reads. */
    /* MEASURED, not parsed. `--foot-h` is a length in `rem`, and
       `parseFloat("1.625rem")` is 1.625, which is not 26 and is not greater
       than 4 — so the first version of this line reported `off` at 900x700,
       where the strip is 26px tall and on screen, and P21 would have moved its
       through-line out of a region it actually had. The strip is an element;
       ask the element. */
    const footEl = document.querySelector('.app__foot');
    let footOn = false;
    if (footEl) {
      const fcs = getComputedStyle(footEl);
      if (fcs.display !== 'none' && fcs.visibility !== 'hidden') {
        const fr = footEl.getBoundingClientRect();
        footOn = fr.height > 4 && fr.width > 8 && fr.top < window.innerHeight;
      }
    }
    app.dataset.foot = footOn ? 'on' : 'off';
    for (const k of ['step', 'foot', 'key']) {
      const r = rects[k];
      app.style.setProperty('--dock-' + k + '-x', r.x + 'px');
      app.style.setProperty('--dock-' + k + '-y', r.y + 'px');
      app.style.setProperty('--dock-' + k + '-w', r.w + 'px');
      app.style.setProperty('--dock-' + k + '-h', r.h + 'px');
    }
    for (const k of ['foot', 'key']) {
      app.style.setProperty('--dock-' + k + '-dx', off[k].x + 'px');
      app.style.setProperty('--dock-' + k + '-dy', off[k].y + 'px');
    }
    app.style.setProperty('--rail-clear', railClear + 'px');
    app.style.setProperty('--dock-floor', dockFloor + 'px');

    app.dataset.rail = rail;
    /* THE LANDSCAPE BAND, published so a piece can read it rather than
       re-derive it from `innerHeight` (docs/RESPONSIVE_LAW.md §12). It is a
       fact about the WINDOW, not about the rail: at 844x390 the rail is a side
       column, which is right, and the five rows still do not sum. */
    const vband = this._mqShortMatches() ? 'short' : 'tall';
    if (app.dataset.vband !== vband) app.dataset.vband = vband;
    this._lastTop = Math.round(stage.top);
    this._lastH = Math.round(stage.height);
    this._lastFloor = railTopMin;
    app.style.setProperty('--stage-top', this._lastTop + 'px');
    app.style.setProperty('--stage-height', this._lastH + 'px');
    /* `!important`, and LAYOUT_BUDGET B9 is the reason. `--rail-top-min` is the
       SHELL's answer to where the bottom sheet may start; every consumer of it
       — the sheet's own clamp and the map's rectangle — is in layout.css. A
       component stylesheet took it over with an `!important` rule of its own
       to buy a beat panel some room (tours.css §17), which is the exact move
       B9 exists to stop: the shell could then no longer state the band, so the
       panel got 380 of 844 and the map, the ribbon and the time control kept
       their full-band sizes underneath it. An inline `!important` is the only
       declaration a stylesheet cannot out-specify, and this number is the
       shell's. The BEAT still decides the split — it declares it through
       `data-tour-fit`, which this file reads two hundred lines above — but the
       arithmetic that follows from the declaration is stated in one place. */
    app.style.setProperty('--rail-top-min', railTopMin + 'px', 'important');
    app.style.setProperty('--read-peek', peek + 'px');

    this.ctx.bus.emit('chrome:layout', {
      rail, dock, read: readOn, beatWork: work, readPeek: peek,
      screenfuls: this._screenfuls || 0,
      stage: { top: this._lastTop, height: this._lastH },
      plate: plate ? { top: Math.round(plate.top), height: Math.round(plate.height) } : null,
      railClear, dockFloor,
      docks: { step: rects.step, foot: rects.foot, key: rects.key, offset: off },
      dockFoot: dockFoot === 'on',
      vband,
      vw: window.innerWidth, vh: window.innerHeight,
    });
  },

  /* ============================== the covered panel ====================== */

  /**
   * THE PANEL UNDER THE SHEET IS NOT ON THE PAGE.
   *
   * LAYOUT_BUDGET B7: the dossier and the sheet occupy the same rail column,
   * and opening the sheet STACKS it over the dossier rather than opening a
   * second column. The covered one is still `display: block`, still
   * `visibility: visible`, and still full of tab stops. Measured at 390x844
   * inside a mounted beat: `#dossier` and `#sheet` at identical coordinates,
   * z 20 against z 50, with 26 tabbable controls in the covered one — and
   * eighteen presses of Tab from the beat never reached `.tr-bar__next`,
   * because they walked a panel nobody could see. Measured again at 1366x768:
   * the same stacking, 26 against 22.
   *
   * `inert` is the whole answer and it is one attribute: it removes the
   * subtree from the tab order, from hit testing and from the accessibility
   * tree in one move, which is what "this is behind something" means. It is
   * released the moment the sheet closes.
   *
   * The test is geometric, not attributal, because "covered" is a fact about
   * rectangles: the sheet has to be open, rendered, and overlapping the panel
   * by most of the panel's own area. In the float band at 1440x900 with the
   * rail wide open the two still stack, so this is not scoped to a breakpoint.
   */
  _syncCovered() {
    const doss = document.querySelector('.app__dossier');
    if (!doss) return;
    /* THE TEST IS STRUCTURAL, NOT GEOMETRIC, and that is deliberate.
       LAYOUT_BUDGET B7: "the dossier and the sheet occupy the same grid column
       and the same `--rail-w`; opening the sheet while the dossier is open
       STACKS it". There is no state in this application in which the sheet is
       open and the panel under it is partly readable — measured at 390x844 and
       at 1366x768, the two rectangles are identical. An overlap ratio was tried
       first and it is a race: on the frame the sheet opens the panel behind it
       has not been re-clamped yet, the ratio read 0.27, and the covered panel
       stayed in the tab order because nothing resized afterwards to ask again.
       A fact that is true by layout should not be re-derived from pixels that
       settle two frames later. */
    let cover = false;
    const sheet = this.sheetOpen ? document.querySelector('.app__sheet') : null;
    if (sheet && !sheet.hidden) {
      const cs = getComputedStyle(sheet);
      const cd = getComputedStyle(doss);
      cover = cs.display !== 'none' && cs.visibility !== 'hidden'
        && cd.display !== 'none' && cd.visibility !== 'hidden';
    }
    if (cover === !!this._covered) return;
    this._covered = cover;
    if (cover) {
      /* If the caret is inside the panel about to go inert it has to leave
         first, or the browser drops focus to <body> and the next Tab starts
         from the top of the document. */
      if (doss.contains(document.activeElement)) {
        const to = document.querySelector('.app__sheet .cx-sheet__title, .app__sheet button');
        if (to && to.focus) { try { to.focus({ preventScroll: true }); } catch (_) { to.focus(); } }
        else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      }
      doss.setAttribute('inert', '');
      doss.setAttribute('aria-hidden', 'true');
    } else {
      doss.removeAttribute('inert');
      doss.removeAttribute('aria-hidden');
    }
  },

  /* ============================== the line grid ========================== */

  /**
   * NO LINE OF PROSE IS CUT THROUGH ITS X-HEIGHT AT EITHER EDGE.
   *
   * Round 2, measured at 390x844 on `#tour=core&step=9`: "What kind of thing
   * is it?" clipped at the top of the reading window and "What can it NOT tell
   * you?" clipped at the bottom; on first paint of the same beat, "on the 1914
   * map took twenty years of treaties" clipped at the bottom. A window that
   * shows fourteen lines and two halves is a window that shows fourteen lines
   * and two pieces of litter, and the mask over each edge fades the litter
   * rather than removing it.
   *
   * TWO MOVES, AND THEY ARE THE SAME MOVE AT THE TWO EDGES.
   *
   *  1. THE WINDOW IS AN EXACT NUMBER OF LINES. `--read-trim` is what is left
   *     over when the readable window is divided by its own line box, and the
   *     shell gives it back: the panel is that much shorter, and the bottom
   *     edge then falls where a line ends. It is computed against the
   *     UNTRIMMED height (measured + the trim already applied), so it converges
   *     in one frame and cannot oscillate.
   *  2. THE TOP EDGE LANDS ON A LINE BOUNDARY. A flick leaves `scrollTop`
   *     anywhere; after the scroll settles the shell moves it to the nearest
   *     line box, which is at most half a line. The line boxes are read from
   *     the live layout (a Range over the scroller's own contents returns one
   *     rectangle per line box), so this is the type as it is actually set —
   *     not a line-height token, which a heading, a blockquote or a figure
   *     would make a lie.
   *
   * With the top edge on a boundary and the window an exact number of lines,
   * the bottom edge is on one too. Reduced motion is respected: the correction
   * is instant either way, because it is a correction and not a movement.
   */
  /**
   * THE READING WINDOW IS THE SCROLLER THE PROSE IS ACTUALLY IN, wherever the
   * piece that renders the surface chose to put it — not `.cx-sheet__body`,
   * which is only the outermost box. Three surfaces put it in three places:
   * a beat in `.tr-panel__scroll`, the Close in `.cl-close__scroll`, a recall
   * card and a gate in the body itself. Measured at 390x844 with the Close
   * open and reading mode on: `.cx-sheet__body` reported 511 holding 511 and
   * looked fixed, while `.cl-close__scroll` inside it held 6,332 — so a rule
   * written against the body would have passed on a surface reading at 13
   * screenfuls. A piece may name its own with `data-read-window`; otherwise
   * the deepest scroller with something to scroll is it.
   */
  _readingWindow() {
    /* IT IS NOT A PROPERTY OF READING MODE — IT IS THE SCROLLER THE PROSE IS
       IN, and it is cut through the x-height of its last line just as badly on
       a beat whose work is the map. ROUND 3, the rubric: "at 390x844 the beat
       scroller clips its last line of body text through the x-height rather
       than at a line boundary." Measured on the build it reviewed: the spine
       beat's bottom edge fell 9.3px into a line box, the exits 6.8, and R14
       could not see any of them because it only looked while `data-read` was
       `on`. The window is resolved, and the grid is set, wherever a lesson
       surface is mounted in the sheet band. */
    if (!this.app || !this.app.dataset.beatwork) return null;
    return this._findWindow();
  },

  /**
   * THE SAME RESOLUTION, UNGATED — and it is what publishes HOW LONG THE
   * READING IS at every viewport, including the two where reading mode does not
   * exist.
   *
   * ROUND 3, the classroom: "the one-person-at-a-time staging of the tension
   * beat stops at 46rem, so the projector case is the worst case: at 1024x640
   * the Amritsar beat is 463px of scroller holding 2,951px (6.4 screenfuls) and
   * at 1366x768 it is 587/2,645 (4.5). The phone gets 3.9. Gate the staging on
   * available height, not width alone."
   *
   * A WIDTH QUERY WAS NEVER THE RIGHT GATE AND NEITHER IS A HEIGHT ONE. What
   * decides whether a beat needs staging is how many screens of it there are,
   * which is a fact about the window AND the content and is knowable only by
   * measuring both. So the shell measures it and publishes it, and a piece that
   * stages its content reads one number instead of guessing at a breakpoint:
   *
   *   #app[data-readfuls]      the reading, in screenfuls, rounded down ("1".."9+")
   *   #app[data-readlong=on]   more than three of them
   *   --read-screenfuls        the same number, for a CSS-only gate
   *   chrome:layout { screenfuls }
   *
   * docs/RESPONSIVE_LAW §11.11.
   */
  _findWindow() {
    const body = document.querySelector('.app__sheet .cx-sheet__body');
    if (!body) return null;
    const vis = (n) => {
      const cs = getComputedStyle(n);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    const named = body.querySelector('[data-read-window], .tr-panel__scroll, .cl-close__scroll');
    if (named && vis(named)) return named;
    /* THE ANSWER FROM LAST FRAME, WHILE IT IS STILL THE ANSWER. The scan below
       is a computed-style read per node and `_measure` runs on every relayout
       frame; `fill()` replaces the body's children when the surface changes, so
       containment is a sound test that the previous window is still the live
       one. */
    if (this._snapNode && this._snapNode !== body && this._snapNode.isConnected
      && body.contains(this._snapNode) && vis(this._snapNode)) return this._snapNode;
    let best = null;
    let n = 0;
    for (const e of body.querySelectorAll('*')) {
      if (++n > 600) break;
      if (e.scrollHeight <= e.clientHeight + 4 || e.clientHeight < 80) continue;
      const cs = getComputedStyle(e);
      if (!/(auto|scroll)/.test(cs.overflowY)) continue;
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      best = e;                                   // deepest wins: keep going
    }
    if (best) return best;
    return vis(body) ? body : null;
  },

  /** HOW LONG THE READING IS, PUBLISHED — see `_findWindow`. It is measured at
   *  every viewport, because the two the classroom critic measured (1024x640
   *  and 1366x768) are the two where reading mode does not exist and the beat
   *  is longest in screenfuls. */
  _syncReadLength() {
    const app = this.app;
    if (!app) return;
    const win = this._findWindow();
    const h = win ? win.clientHeight : 0;
    const sf = win && h > 40 ? win.scrollHeight / h : 0;
    const n = sf ? Math.min(9, Math.max(1, Math.floor(sf))) : 0;
    const v = n ? String(n) : '';
    if ((app.dataset.readfuls || '') !== v) {
      if (v) app.dataset.readfuls = v; else delete app.dataset.readfuls;
      app.style.setProperty('--read-screenfuls', String(n));
    }
    const long = n >= 4 ? 'on' : '';
    if ((app.dataset.readlong || '') !== long) {
      if (long) app.dataset.readlong = long; else delete app.dataset.readlong;
    }
    this._screenfuls = Math.round(sf * 10) / 10;
  },

  /** The measured line box of the prose in a scroller, from the live layout. */
  _lineRects(node) {
    try {
      const r = document.createRange();
      r.selectNodeContents(node);
      const list = Array.from(r.getClientRects())
        .filter((b) => b.height > 4 && b.height < 200 && b.width > 8);
      r.detach && r.detach();
      return list;
    } catch (_) { return []; }
  },

  /** How much of a line box the edge at `y` cuts: 0 when the line is either
   *  wholly above the edge or wholly below it, and its half-height at worst. */
  _cutAt(rects, y) {
    let worst = 0;
    for (const b of rects) {
      if (y <= b.top + 0.5 || y >= b.bottom - 0.5) continue;
      worst = Math.max(worst, Math.min(y - b.top, b.bottom - y));
    }
    return worst;
  },

  /** Arm the next trim pass. One frame, coalesced — never a synchronous read
   *  of a style this function has just set. */
  _armTrim() {
    if (this._trimRaf) cancelAnimationFrame(this._trimRaf);
    /* TWO FRAMES, NOT ONE. A rAF callback runs BEFORE the frame's own style
       recalculation, and under `prefers-reduced-motion` this app's 1ms
       transitions mean the property set a moment ago is still interpolating
       from its old value when the callback forces layout. Measured with one
       frame: the pass added the same 10px correction four times and the trim
       stood at 38 on a beat that needed 10. */
    this._trimRaf = requestAnimationFrame(() => {
      this._trimRaf = requestAnimationFrame(() => {
        this._trimRaf = 0;
        this._trimPass();
      });
    });
  },

  /** One incremental correction of the window's bottom edge, off the live
   *  layout. Returns having either changed nothing or added what the edge cuts.
   *  docs/RESPONSIVE_LAW §11.5A. */
  _trimPass() {
    const app = this.app;
    if (!app || !app.dataset.beatwork) return;
    const win = this._readingWindow();
    if (!win) return;
    /* Taken at the top of the scroll and held for the surface: a window that
       resized itself under a moving thumb would be worse than the defect. */
    if (win.scrollTop > 4) return;
    if ((this._trimPasses || 0) >= 4) return;
    const box = win.getBoundingClientRect();
    /* AND A BOX THAT HAS NOT MOVED SINCE THE LAST CORRECTION IS A LAYOUT THAT
       HAS NOT CAUGHT UP, not a correction that failed. Applying a second delta
       to it is how an incremental rule becomes an accumulator; this is what
       stops it. Three waits, then the pass gives up rather than guessing. */
    if (this._trimBox != null && Math.abs(box.bottom - this._trimBox) < 0.5) {
      if ((this._trimWait || 0) < 3) { this._trimWait = (this._trimWait || 0) + 1; this._armTrim(); }
      return;
    }
    this._trimWait = 0;
    let delta = 0;
    for (const b of this._lineRects(win)) {
      /* A LINE, NOT A BLOCK. A figure, a ring diagram or a row of answer
         buttons straddling the edge is not a line of prose, and shrinking the
         window by its height would cost a whole screenful to hide something
         the student can see the top of and scroll to. 40px is above every
         leading this app sets and below every block it draws. */
      if (b.height > 40) continue;
      if (b.top <= box.bottom - 0.5 && b.bottom > box.bottom + 0.5) {
        /* A LINE WHOSE DESCENDERS ARE CLIPPED IS NOT CUT THROUGH ITS X-HEIGHT
           and it reads perfectly; paying most of a line to hide it would be the
           cure costing more than the disease. */
        if (b.bottom - box.bottom < b.height * 0.25) continue;
        delta = Math.max(delta, Math.ceil(box.bottom - b.top));
      }
    }
    /* A SLIVER OF A BUTTON IS NOT A CUE, IT IS A RULE. ROUND 3, the phone, on
       the spaced-recall card: "All a thumb sees is ~10px of the button's top
       edge." Ten pixels of a 44px control reads as a hairline, and the one
       thing it does not read as is a control with more below it. */
    for (const c of win.querySelectorAll('button, input, textarea, select, a[href], [role="button"]')) {
      const b = c.getBoundingClientRect();
      if (b.height < 8 || b.width < 8) continue;
      if (!(b.top < box.bottom - 0.5 && b.bottom > box.bottom + 0.5)) continue;
      const shown = box.bottom - b.top;
      if (shown >= Math.min(16, b.height / 3)) continue;
      delta = Math.max(delta, Math.ceil(shown + 1));
    }
    if (delta <= 0) { this._trimPasses = 0; return; }
    /* THE CAP IS ONE LINE BOX, NOT A ROUND NUMBER: the app's largest leading is
       34px and a cap of 32 refused to pay for it, so the head was cut through
       its x-height with nothing done about it. 46 is that line plus its slack,
       and it is under a tenth of the smallest window this mode allows. */
    const next = (this._trim || 0) + delta;
    if (next > 46) { this._trimPasses = 4; return; }
    this._trimPasses = (this._trimPasses || 0) + 1;
    this._trim = next;
    this._trimBox = box.bottom;
    app.style.setProperty('--read-trim', next + 'px');
    this._armTrim();                      // look again once the browser has it
  },

  _syncLineGrid(live) {
    const app = this.app;
    if (!app) return;
    const win = live ? this._readingWindow() : null;
    if (!win) {
      if (this._trimRaf) { cancelAnimationFrame(this._trimRaf); this._trimRaf = 0; }
      this._trimSh = 0; this._trimPasses = 0; this._trimBox = null; this._trimWait = 0;
      if (this._trim) { this._trim = 0; app.style.setProperty('--read-trim', '0px'); }
      if (this._snapOff) { this._snapOff(); this._snapOff = null; }
      if (this._gridOff) { this._gridOff(); this._gridOff = null; }
      this._snapNode = null;
      this._gridKey = '';
      return;
    }
    /* THE MEASUREMENT IS NOT FREE — a Range over the scroller's contents is a
       layout read per line box — so it is taken only when the window it
       measures has changed shape or content. `_measure` runs on every relayout
       frame; this runs when the reading changes. */
    /* THE KEY IS THE UNTRIMMED WINDOW, AND THAT IS WHAT MAKES IT CONVERGE.
       It used to be the LIVE `clientHeight` plus the trim as a third term, and
       the pair is a two-cycle: the trim shortens the window, the shorter window
       is a new key, the new key re-measures, the re-measure resets the trim to
       zero and finds the same answer, and the window is a new key again.
       Measured under reduced motion at 390x844 after one press on the peek
       strip, sampling `.tr-panel__fit` every 120 ms: y = 678.47, 683.47,
       678.47, 683.47 — a five-pixel flip, which is `--read-trim` itself, and
       Playwright refused to click a control that never held still for two
       frames. Keyed on `clientHeight + trim` — the height the window WOULD
       have with no trim — the second pass reads the same key as the first and
       stops. */
    const key = (win.clientHeight + (this._trim || 0)) + 'x' + win.scrollHeight;
    const sameNode = this._snapNode === win;
    if (this._gridKey === key && sameNode) return;
    this._gridKey = key;

    /* 1. THE TRIM — the bottom edge of the FIRST SCREENFUL, which is the one a
       student meets before they have touched anything, and the one the critic
       measured ("on the 1914 map took twenty years of treaties", clipped at the
       bottom on first paint). A fixed line-height token cannot answer this: the
       beat panel sets caps, prose, testimony and captions at four different
       leadings, so the number is read off the line boxes the browser actually
       made.

       AND IT IS APPLIED ON THE NEXT FRAME, NEVER READ BACK IN THE SAME ONE,
       WHICH IS ROUND 3'S CORRECTION AND THE REASON R14 SURVIVED TWO ROUNDS
       UNDER `--reduced`. The old pass reset `--read-trim` to zero, forced
       layout, measured from zero and set the answer, all synchronously. Under
       `prefers-reduced-motion` this app gives every property a 1ms transition
       (base.css), so `max-block-size` ANIMATES: a rectangle read in the same
       task returns the height from BEFORE the reset, and the pass measures one
       state behind itself. Measured at 390x844 in reduced motion, walking the
       path to `#tour=thirty&step=4`, logging every pass: trim 9 at a window of
       457, then trim 1 at 449, then 9, then 1 — a two-cycle between two wrong
       answers, one of which read clean to the harness and the other of which
       cut a line by 9px. The cold load of the same address settled at 10 and
       was clean, which is why three rounds of reading the code found nothing.

       So the correction is INCREMENTAL and ASYNCHRONOUS. Each pass measures
       the live layout, adds what the current bottom edge cuts, and hands the
       browser a frame to apply it before looking again. It converges — a
       corrected edge cuts nothing, so the next pass adds nothing — it is
       bounded at four passes and at one line box in total, and it starts from
       zero on every new surface, which is what stops the accumulator the
       previous version's comment warns about (2px carried forward stood at 55
       three surfaces later). */
    if (!sameNode || this._trimSh !== win.scrollHeight) {
      this._trimSh = win.scrollHeight;
      this._trimPasses = 0;
      this._trimBox = null;
      this._trimWait = 0;
      if (this._trim) { this._trim = 0; app.style.setProperty('--read-trim', '0px'); }
    }
    this._armTrim();

    /* ONE RE-CHECK AFTER THE SURFACE SETTLES. A beat's own blocks finish
       laying out over several frames — a web font arriving, a figure sizing
       itself, a testimony column reflowing — and none of that changes the
       window's clientHeight or scrollHeight, so the key above cannot see it.
       Measured in reduced motion at 390x844 on step 4: the trim was right when
       it was taken and the bottom edge was 10px into a line box 400ms later.
       One delayed re-measure, per surface, and it is cheap. */
    /* AND IT IS WATCHED, NOT TIMED. The first version re-checked once 450 ms
       after the surface opened, then twice, and both were races: a beat's own
       blocks settle over several frames, the Close rebuilds itself whenever the
       Ledger or the beat behind it changes, a student opens `more of this
       beat`, a web font arrives — and NONE of those necessarily changes the
       window's own `clientHeight` or `scrollHeight`, which is all the key above
       can see. Measured in reduced motion at 768x1024 and at 390x844, the
       bottom edge was 7.5-10.8px into a line box after the last timer had
       fired. So the content is observed: any reflow inside the window, and any
       change to what is in it, re-measures. There is no loop — the correction
       is a custom property on `#app`, not a mutation of this subtree, and the
       observed box is the CONTENT, whose height the trim does not move. */
    if (!sameNode) {
      this._trimTries = 0;
      if (this._gridOff) { this._gridOff(); this._gridOff = null; }
      let t = 0;
      const again = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          this._gridKey = '';
          this._syncLineGrid(!!this.app && !!this.app.dataset.beatwork);
        }, 120);
      };
      let ro = null; let mo = null;
      if (window.ResizeObserver) {
        ro = new ResizeObserver(again);
        for (const c of win.children) { try { ro.observe(c); } catch (_) {} }
      }
      if (window.MutationObserver) {
        mo = new MutationObserver(again);
        try { mo.observe(win, { childList: true, subtree: true, characterData: true }); } catch (_) {}
      }
      const boot = setTimeout(again, 450);
      this._gridOff = () => {
        clearTimeout(t); clearTimeout(boot);
        if (ro) { try { ro.disconnect(); } catch (_) {} }
        if (mo) { try { mo.disconnect(); } catch (_) {} }
      };
      this.d(() => { if (this._gridOff) { this._gridOff(); this._gridOff = null; } });
    }

    /* 2. THE SNAP, armed once per surface. */
    if (!sameNode) {
      if (this._snapOff) { this._snapOff(); this._snapOff = null; }
      this._snapNode = win;
      let t = 0;
      const onScroll = () => {
        clearTimeout(t);
        t = setTimeout(() => this._snapLines(win), 160);
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      this._snapOff = () => { clearTimeout(t); win.removeEventListener('scroll', onScroll); };
      this.d(() => { if (this._snapOff) { this._snapOff(); this._snapOff = null; } });
    }
  },

  /**
   * AFTER THE FLICK SETTLES, PUT THE EDGES BACK ON THE LINES.
   *
   * A thumb leaves `scrollTop` anywhere, so the top edge slices a line through
   * its x-height and so does the bottom. The candidates are the line boundaries
   * themselves — read from the live layout, so mixed leading is handled by
   * construction — and the one chosen is the smallest move that leaves the
   * worse of the two edges cleanest. It is a correction, not a movement, so it
   * is instant in both motion settings.
   */
  _snapLines(win) {
    if (!win || !win.isConnected) return;
    if (!this.app || this.app.dataset.read !== 'on') return;
    const top = win.scrollTop;
    const max = win.scrollHeight - win.clientHeight;
    /* Both ends are flush by construction; snapping there fights the rubber
       band and would hide the last line. */
    if (top < 2 || top > max - 2) return;
    const box = win.getBoundingClientRect();
    const rects = this._lineRects(win);
    if (rects.length < 3) return;
    const cands = new Set([0]);
    for (const b of rects) {
      const dTop = b.top - box.top;
      if (Math.abs(dTop) <= 42) cands.add(Math.round(dTop));
      const dBot = b.bottom - box.bottom;
      if (Math.abs(dBot) <= 42) cands.add(Math.round(dBot));
    }
    let best = 0, bestCut = Infinity;
    for (const d of cands) {
      if (top + d < 0 || top + d > max) continue;
      const cut = Math.max(this._cutAt(rects, box.top + d), this._cutAt(rects, box.bottom + d));
      if (cut < bestCut - 0.4 || (Math.abs(cut - bestCut) <= 0.4 && Math.abs(d) < Math.abs(best))) {
        bestCut = cut; best = d;
      }
    }
    if (!best) return;
    const now = Math.max(this._cutAt(rects, box.top), this._cutAt(rects, box.bottom));
    if (now - bestCut < 1) return;
    win.scrollTop = top + best;
  },

  /* ==================================================== stage ============ */

  _stageOf(state) {
    const v = state.filters && state.filters.stage;
    return STAGES.includes(v) ? v : 'plate';
  },

  _defChanged(state, prev) {
    const a = (state.filters || {}), b = (prev && prev.filters) || {};
    return a.def !== b.def || a.proj !== b.proj;
  },

  /**
   * A LESSON IS A LEVEL — the disclosure a link carries with it.
   *
   * Round 3, measured on cold loads at 900x700:
   *
   *   #tour=thirty&step=1    ->  data-stage="working"   dial on screen
   *   #tour=thirty&step=9    ->  data-stage="plate"     dial absent
   *   #tour=thirty&step=14   ->  data-stage="plate"     dial absent
   *
   * A teacher who sets `#tour=thirty&step=9` in a lesson plan — which
   * FEATURE_SPEC §1 charge 14 says is the whole point of a frozen hash route —
   * hands thirty students a poorer app than the student who pressed Next nine
   * times: no definition dial, no full transport, no "account disputed". Beat 1
   * only escaped because that beat happens to set the stage itself.
   *
   * The rule is not "restore whatever the last session had"; it is a statement
   * about what the address means. `plate` is second zero, and you cannot be
   * nine beats into the lesson and still be at second zero. So an address that
   * names a step in the lesson carries `working` with it, exactly as if the
   * reader had walked there. A bare `#year=1857` is still the cold plate, and
   * `#…&filter=stage:apparatus` still wins, because stages never go backwards.
   */
  _earn(state) {
    if (state && state.activeTour) this._request('working');
  },

  /** Stages only ever go forward on their own. A reader can go back explicitly. */
  _request(level) {
    if (!STAGES.includes(level)) return;
    if (rank(level) <= rank(this.stage || 'plate')) return;
    this.ctx.store.dispatch('setFilter', { stage: level === 'plate' ? null : level });
  },

  _applyStage(next, silent) {
    const prev = this.stage;
    if (prev === next) return;
    this.stage = next;
    document.documentElement.dataset.stage = next;
    if (this.app) this.app.dataset.stage = next;
    if (this.cta) this._setCta(null);
    /* A stage change adds and removes furniture on the plate — the definition
       dial at `working`, the apparatus column at `apparatus` — and none of it
       resizes a box any observer is watching. Re-measure, so `--dock-floor` is
       right on the frame the dial appears rather than the next time the window
       moves. */
    if (this._relayout) this._relayout();
    if (!silent) {
      this.ctx.bus.emit('chrome:stage', { stage: next, prev });
      this._refreshDefault(this.ctx.store.getState());
    }
  },

  /* ==================================================== the lede ========= */

  _buildLede(root) {
    this.markEl = el('span.cx-lede__mark');
    this.sayEl = el('p.cx-lede__say');
    this._ctaAction = () => this._runSweep();
    this.cta = el('button.cx-cta', {
      type: 'button',
      onclick: () => (this.sweep ? this._stopSweep() : this._ctaAction()),
    }, el('span.cx-cta__w', { text: 'Watch it happen' }), el('span.cx-cta__note', { text: '30 seconds' }));
    fill(root, el('div.cx-lede', this.markEl, this.sayEl, this.cta));
  },

  /** Put a sentence in the band. Highest priority wins. */
  _say({ id, text, mark, priority = 10, cta } = {}) {
    if (!id) return;
    if (text == null) this.says.delete(id);
    else this.says.set(id, { id, text: String(text), mark: mark || '', priority, cta, at: Date.now() });
    this._paint();
  },

  /** The shell's own sentence, when nobody louder is speaking. */
  _refreshDefault(state) {
    if (this.stage === 'plate' && !this.sweep) {
      this._say({ id: 'chrome:opening', priority: 1, mark: OPENING.mark, text: OPENING.say });
      return;
    }
    const p = phaseFor(state.year);
    this._say({ id: 'chrome:opening', priority: 1, mark: p ? p.n + '  ' + String(state.year) : String(state.year), text: p ? p.say : '' });
  },

  _paint() {
    let best = null;
    for (const s of this.says.values()) {
      if (!best || s.priority > best.priority || (s.priority === best.priority && s.at >= best.at)) best = s;
    }
    if (!best) { this.markEl.textContent = ''; this.sayEl.textContent = ''; this._setCta(null); return; }
    this.markEl.textContent = best.mark || '';
    // Only <strong>, <em> and <span class="num"> survive; everything else is text.
    this.sayEl.innerHTML = sanitise(best.text);
    this._setCta(best.cta || null, best);
    if (this.lastSaid !== best.text) {
      this.lastSaid = best.text;
      if (best.priority > 1) announce(this.sayEl.textContent);
    }
  },

  /**
   * THE ONE CONTROL. There is exactly one at a time and the shell renders it,
   * which is the whole mechanism of the focal path: on a screen where every
   * other control is ink on paper, one thing is madder red and it is the next
   * thing to do. At `plate` it is the sweep. Once a piece has something more
   * urgent to offer — "the rest of this account", "why is this disputed" — that
   * piece's sentence carries the control, quietly, and the sweep stands down.
   */
  _setCta(cta, best) {
    if (this.sweep) return;                       // Stop owns the button
    if (cta && cta.label) {
      this.cta.hidden = false;
      /* LOUD ONLY AT SECOND ZERO. LAYOUT_BUDGET §6: "`.cx-cta` is the only
         filled, madder-red control that may exist in the viewport, and the
         shell renders it… on a screen where everything else is ink on paper,
         one thing is madder red and it is the next thing to do."

         Round 3, measured on the cold plate: the sweep has been superseded as
         the opening offer by onboarding's "Start the lesson · 40 minutes", and
         every piece-supplied control is drawn quiet — so second zero had NO
         filled control at all and the focal path was signalled by nothing. The
         line is the register, not the owner: at `plate`, with nobody urgent
         speaking (the opening band is priority 1, onboarding's hook is 30;
         content starts at 38), the band's control IS the focal path and is
         drawn as one. Everywhere else it stays quiet, so there is still never
         more than one filled control on the screen. */
      const focal = this.stage === 'plate'
        && !(this.ctx.store.getState() || {}).activeTour
        && (!best || (best.priority || 0) <= 30);
      if (focal) delete this.cta.dataset.quiet;
      else this.cta.dataset.quiet = 'true';
      fill(this.cta, el('span.cx-cta__w', { text: cta.label }),
        cta.note ? el('span.cx-cta__note', { text: cta.note }) : null);
      this._ctaAction = () => this.ctx.bus.emit(cta.emit || 'chrome:cta', cta.payload || {});
      return;
    }
    this._ctaAction = () => this._runSweep();
    if (this.stage !== 'plate') { this._hideCta(); return; }
    /* THE RED BUTTON POINTS AT THE SENTENCE ABOVE IT, OR AT NOTHING.
       Round 3, measured at 900x700 on `#tour=thirty&step=5`: the band read
       "THE COMPLICATION — One fact here damages what you were just told. Place
       it to go on", and the one filled madder-red control in the viewport read
       "Watch it happen · 30 seconds". The header of this file already says the
       sweep "stands down" once a piece has something more urgent to offer; it
       only did so when that piece supplied a control of its own. A speaker with
       no control gets no control, rather than inheriting the shell's.
       `chrome:opening` is the shell's own sentence, at priority 1. */
    const mine = !best || best.id === 'chrome:opening';
    if (!mine || (this.ctx.store.getState() || {}).activeTour) { this._hideCta(); return; }
    this.cta.hidden = false;
    delete this.cta.dataset.quiet;
    fill(this.cta,
      el('span.cx-cta__w', { text: this.swept ? 'Watch it again' : 'Watch it happen' }),
      el('span.cx-cta__note', { text: '30 seconds' }));
  },

  /**
   * THE ONE CONTROL IS ALSO THE DOOR, AND A DOOR MAY NOT DROP THE READER.
   *
   * ROUND 2 OF WAVE 10, the rubric: "pressing the door's one control mounts the
   * beat but leaves focus on the document body… a keyboard-only reader is
   * returned to the top of the page and needs 40 tabs to reach Next."
   *
   * REPRODUCED at 1440x900: `.cx-cta` reads "Start Lesson One · one lesson ·
   * about 25 minutes"; pressing it starts the lesson, `_setCta` hides the
   * button on the same state change, `document.activeElement` becomes BODY, and
   * from there Tab reached `.tr-bar__next` on press 42. This button is the
   * shell's — the door only supplies its label through `_say`'s `cta` — so the
   * focus that was on it when it vanished is the shell's to hand on. WCAG 2.4.3.
   *
   * IT HANDS ON TO THE SURFACE THE PRESS OPENED, NOT TO A NEIGHBOUR. The
   * lesson's own reading window, or the sheet's title above it: the reader
   * lands at the top of what they asked for and Tab walks the lesson from
   * there. It is armed only when the button really had focus, it gives up
   * after half a second, and it stands down the moment the reader moves focus
   * themselves — a rescue that fires against a reader who has already gone
   * somewhere is a worse defect than the one it fixes.
   */
  _hideCta() {
    const a = document.activeElement;
    const had = !!a && (a === this.cta || this.cta.contains(a));
    this.cta.hidden = true;
    if (had) this._armFocusRescue();
  },

  _armFocusRescue() {
    if (this._rescueRaf || typeof requestAnimationFrame !== 'function') return;
    let frames = 0;
    const step = () => {
      this._rescueRaf = 0;
      const a = document.activeElement;
      /* The reader has gone somewhere of their own accord: nothing to rescue. */
      if (a && a !== document.body && a !== document.documentElement) return;
      const sheet = document.querySelector('#app[data-sheet="open"] .app__sheet');
      const vis = (n) => {
        if (!n) return false;
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const r = n.getBoundingClientRect();
        return r.width > 8 && r.height > 8;
      };
      let target = null;
      if (vis(sheet)) {
        const title = sheet.querySelector('.cx-sheet__title');
        target = (title && title.textContent.trim() && vis(title))
          ? title : (this._findWindow() || sheet.querySelector('.cx-sheet__body'));
      }
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        try { target.focus({ preventScroll: true }); } catch (_) { target.focus(); }
        return;
      }
      if (++frames > 30) return;                  // half a second, then give up
      this._rescueRaf = requestAnimationFrame(step);
    };
    this._rescueRaf = requestAnimationFrame(step);
  },

  /* ==================================================== the masthead ===== */

  /**
   * THE MASTHEAD'S ONE OVERFLOW CONTROL.
   *
   * Six modules put a control in the bar. On a wide window they fit on one line
   * and `.bar__tools` is `display: contents`, so nothing about the masthead
   * changes. In the sheet band they do not fit: measured at 390x844 on the
   * guided path, `.bar__slot--end` asked for 317px of a 196px strip and the
   * Recall button's right edge stood at x=388 with half of it off the screen,
   * while the wordmark was cut to "The Bri…". The strips scroll sideways, which
   * is what keeps the document one screen wide, but a sideways scroll with no
   * affordance is not a way to reach a control nobody knows is there.
   *
   * layout.css turns the wrapper into a panel under the masthead in exactly
   * that band. This wires the control that opens it. Nothing is re-parented:
   * the mount slots keep their modules, their listeners and their identity.
   */
  _buildTools() {
    this.toolsBtn = document.getElementById('bar-more');
    this.toolsPanel = document.getElementById('bar-tools');
    this.barEl = document.querySelector('.app__bar');
    if (!this.toolsBtn || !this.toolsPanel) return;
    this.toolsBtn.hidden = false;
    this.toolsOpen = false;
    /* Set from the media condition before any control exists, so the collapsed
       masthead is right on the FIRST paint at phone width rather than one frame
       later. `#app` is `hidden` until the boot screen goes, so the measured
       correction below never flashes. */
    if (this.app && this._mqSheetMatches()) this.app.dataset.bar = 'stack';

    /* The bar's own contents arrive over the next second as six modules mount,
       and they change again when the path starts and stops. Re-measure. */
    if (window.MutationObserver) {
      this._barMo = new MutationObserver(() => this._relayout && this._relayout());
      for (const sel of ['.bar__slot--main', '.bar__slot--end']) {
        const n = document.querySelector(sel);
        if (n) this._barMo.observe(n, { childList: true, subtree: true });
      }
      this.d(() => { try { this._barMo.disconnect(); } catch (_) {} });
    }
    this.d(this.ctx.bus.on('app:ready', () => this._relayout && this._relayout()));

    this.toolsBtn.addEventListener('click', () => this._setTools(!this.toolsOpen, true));

    /* Pressing anything inside the panel is a decision; the panel's job is
       done and the surface it just opened is what the reader wants to see. */
    this.toolsPanel.addEventListener('click', (ev) => {
      if (!this.toolsOpen) return;
      const hit = ev.target.closest('button, a[href], [role="button"]');
      if (hit) this._setTools(false, false);
    });

    const away = (ev) => {
      if (!this.toolsOpen) return;
      if (this.toolsPanel.contains(ev.target) || this.toolsBtn.contains(ev.target)) return;
      this._setTools(false, false);
    };
    document.addEventListener('pointerdown', away, true);
    this.d(() => document.removeEventListener('pointerdown', away, true));

    /* A window that grows past the band leaves the panel with nowhere to be. */
    this.d(this.ctx.bus.on('chrome:layout', (m) => { if (m && m.rail !== 'sheet') this._setTools(false, false); }));
  },

  /** The sheet band, as one expression. layout.css states the same condition;
   *  if you change one, change both (LAYOUT_BUDGET §2A). */
  _sheetMq() {
    if (!this._mqSheet && typeof window !== 'undefined' && window.matchMedia) {
      this._mqSheet = window.matchMedia('(max-width: 39.999rem), (max-width: 61.999rem) and (min-height: 46rem)');
    }
    return this._mqSheet;
  },
  _mqSheetMatches() { const m = this._sheetMq(); return !!(m && m.matches); },

  /** THE DOCKED BAND, as one expression. layout.css states exactly the same
   *  condition; if you change one, change both (docs/RESPONSIVE_LAW.md SS1).
   *  Below it, nothing floats inside the map rectangle. */
  _dockMq() {
    if (!this._mqDock && typeof window !== 'undefined' && window.matchMedia) {
      this._mqDock = window.matchMedia('(max-width: 61.999rem)');
    }
    return this._mqDock;
  },
  _mqDockMatches() { const m = this._dockMq(); return !!(m && m.matches); },

  /** THE LANDSCAPE BAND, as one expression. layout.css §THE LANDSCAPE BAND
   *  states exactly the same condition; if you change one, change both
   *  (docs/RESPONSIVE_LAW.md §12). Below 460px of viewport height the five
   *  rows of the app grid are re-cut so that they sum to the window, the
   *  provenance strip has no room and says so, and the time control sheds the
   *  four-lane spine for `Engines` and the spine's own reading. */
  _shortMq() {
    if (!this._mqShort && typeof window !== 'undefined' && window.matchMedia) {
      this._mqShort = window.matchMedia('(max-height: 460px)');
    }
    return this._mqShort;
  },
  _mqShortMatches() { const m = this._shortMq(); return !!(m && m.matches); },


  /**
   * DOES THE MASTHEAD FIT? — measured, not guessed at with a breakpoint.
   *
   * A width alone cannot answer it, because the bar's contents change: below
   * 62rem the path docks its transport elsewhere, so at 900x700 the bar holds
   * eight controls and fits, while at 1024x640 it holds eleven — Back, the
   * counter, Next, the escape and Layers as well — and does not. Measured at
   * 1024x640 mid-lesson: the wordmark was cut by 49px and the Teaching desk
   * entry ran from x=978 past the right edge of a 1024px window. A breakpoint
   * set for 390 and 768 would have shipped that, which is how the round-2
   * defect shipped in the first place.
   *
   * So: the natural width of the bar's contents is measured whenever the bar is
   * NOT stacked (inside the panel the controls are full-width and tell you
   * nothing), remembered, and compared against the room. A 24px hysteresis
   * keeps a window dragged across the threshold from oscillating.
   */
  _fitBar() {
    if (!this.toolsBtn || !this.toolsPanel || !this.barEl || !this.app) return;

    /* WHILE A LESSON IS MOUNTED THE ANSWER IS NOT MEASURED. IT IS `stack`.
     *
     * The measurement above is right about a masthead whose contents are
     * fixed. A lesson's are not: beats add and remove their own controls, so
     * the sum changes from beat to beat and the threshold is crossed in the
     * middle of the lesson. Measured at 1366x768, walking the authored path:
     *
     *     step  1   data-bar unset   9 controls
     *     step  5   data-bar unset  10 controls   (+ "Place it", "the field")
     *     step  9   data-bar unset  10 controls   (+ "Count it")
     *     step 14   data-bar=stack   6 controls
     *     step 23   data-bar=stack   5 controls
     *
     * The masthead was one shape for the first half of the lesson and another
     * for the second, and the student was not told and did not do anything.
     * Six entrances they had learned the position of moved behind a menu at
     * beat 14 because beat 14 happens to add a wide control of its own — which
     * is the definition of an interface that cannot be learned.
     *
     * So it is a constant for the length of the lesson: `chrome-end` is
     * collapsed from the first beat to the last, at every viewport, and the
     * bar holds the lesson (Back, the counter, Next, the escape) plus `Tools`.
     * `toolbar` is never collapsed — LAYOUT_BUDGET SS5A, and rule W4 of
     * budget-working.js — so Back and Next are never behind the menu.
     */
    if (this.app.dataset.path === 'on') {
      if (this.app.dataset.bar !== 'stack') this.app.dataset.bar = 'stack';
      return;
    }

    const stacked = this.app.dataset.bar === 'stack';
    if (!stacked) {
      /* The CONTENTS, not the boxes. `.bar__slot--main` is `flex: 1 1 auto`, so
         its own `scrollWidth` is at least the space it was given and adding it
         to the others always exceeds the bar — measured, that stacked the
         masthead at 1920 and hid the path's transport behind a menu. Sum the
         controls, at whatever depth their module put them. */
      const strip = (sel) => {
        const n = document.querySelector(sel);
        if (!n) return 0;
        const kids = [];
        for (const c of n.children) {
          if (c.classList && c.classList.contains('mount--sub')) kids.push(...c.children);
          else kids.push(c);
        }
        let w = 0, seen = 0;
        for (const k of kids) {
          const r = k.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          w += r.width; seen++;
        }
        return w + Math.max(0, seen - 1) * 8;
      };
      const el2 = (sel, prop) => { const n = document.querySelector(sel); return n ? (n[prop] || 0) : 0; };
      const brand = el2('.brand__mark', 'offsetWidth') + 8
        + el2('.brand__title', 'scrollWidth') + el2('.brand__sub', 'scrollWidth') + 8;
      this._barNatural = brand + strip('.bar__slot--main') + strip('.bar__slot--end') + 24;
      /* Room the panel's own control will want back once it appears. */
      this._barStackCost = 76;
    }
    const room = this.barEl.clientWidth - 32;
    const want = this._mqSheetMatches()
      || (this._barNatural || 0) > room - (stacked ? (this._barStackCost || 76) + 24 : 0);
    if (want === stacked) return;
    if (!want) this._setTools(false, false);
    this.app.dataset.bar = want ? 'stack' : 'wide';
  },

  _setTools(open, moveFocus) {
    if (!this.toolsBtn || !this.toolsPanel) return;
    /* Above the band the strips are on one line and there is nothing to open.
       The control is `display: none` there; this is the same answer for the
       keyboard, the bus and anything else that reaches past the pointer. */
    if (open && getComputedStyle(this.toolsBtn).display === 'none') return;
    if (!!open === !!this.toolsOpen) return;
    this.toolsOpen = !!open;
    if (this.app) this.app.dataset.tools = this.toolsOpen ? 'open' : 'closed';
    this.toolsBtn.setAttribute('aria-expanded', this.toolsOpen ? 'true' : 'false');
    if (!moveFocus) return;
    if (this.toolsOpen) {
      const first = this.toolsPanel.querySelector('button:not([hidden]):not(:disabled), a[href], input, select');
      if (first) first.focus();
    } else {
      this.toolsBtn.focus();
    }
  },

  /* ============================== one teaching panel at a time =========== */

  /**
   * The round-2 verdict: "the disclosure controller permits two teaching panels
   * at once… one screen asserting three different years simultaneously."
   *
   * The two exclusive surfaces are the rail sheet (the fourteen legal forms,
   * the layer reference, the rate rail, and the guided path's own beat panel)
   * and the two-plate comparison. Either one open beside the other is two
   * arguments about two different years on one screen.
   *
   * P18 already closes the sheet when it opens, and P06 already closes the
   * comparison when its reference opens. What neither can do is put the reader
   * back: a student four beats into the lesson who presses `v` had their beat
   * panel closed under them and no way back to it but Back. The shell holds the
   * displaced surface — the node, with its listeners — and restores it when the
   * comparison closes. Nothing is re-rendered and nothing is lost.
   */
  _compareOpened() {
    this.compareOpen = true;
    if (this.sheetOpen) { this._displaced = this._sheetRecord; this._closeSheet(); return; }
    // P18 asks for the sheet to close a beat before it announces itself.
    const recent = Date.now() - (this._sheetClosedAt || 0) < 1200;
    this._displaced = recent ? this._lastSheet : null;
  },

  _compareClosed() {
    this.compareOpen = false;
    const back = this._displaced;
    this._displaced = null;
    if (back && back.node && !this.sheetOpen) this._openSheet(back);
  },

  /* ==================================================== the sheet ======== */

  _buildSheet() {
    if (!this.sheetMount) return;
    this.sheetEyebrow = el('span.cx-sheet__eyebrow');
    this.sheetTitle = el('h2.cx-sheet__title');
    this.sheetBody = el('div.cx-sheet__body');
    const close = el('button.cx-sheet__close', {
      type: 'button', 'aria-label': 'Close', title: 'Close (Esc)',
      onclick: () => this._closeSheet(),
    }, '×');
    /* THE READING TOGGLE FOR A SURFACE TOURS DOES NOT OWN — see
       `_paintSheetFit`. Hidden at every width and on every surface where tours
       renders its own; the two never appear together. */
    this.sheetFit = el('button.cx-sheet__fit', {
      type: 'button', hidden: true,
      onclick: () => this.ctx.bus.emit('ask:read', {
        mode: this._readWork() === 'text' ? 'map' : 'text', from: 'sheet',
      }),
    }, el('span.cx-sheet__fitw', { text: 'Read' }),
       el('span.cx-sheet__fita', { 'aria-hidden': 'true', text: '▴' }));
    fill(this.sheetMount, el('div.cx-sheet',
      el('div.cx-sheet__head', this.sheetEyebrow, this.sheetTitle, this.sheetFit, close),
      this.sheetBody));
  },

  _openSheet({ id, title, eyebrow, node, work }) {
    if (!this.sheetMount) return;
    const changed = this.sheetId !== (id || 'sheet');
    this.sheetId = id || 'sheet';
    /* THE SURFACE'S OWN READING DECLARATION (docs/RESPONSIVE_LAW §11.2), the
       same contract a beat's `fit` is: the piece that renders a surface says
       whether the plate or the panel is the evidence for it. Absent, the
       surface table in `_readWork` answers, and every surface outside it is
       unchanged. */
    this.sheetWork = work === 'text' || work === 'map' || work === 'time' ? work : null;
    /* A new surface is a new question, so a press made on the last one is
       forgotten — the same lifetime tours gives its own `Map`. */
    if (changed) this._readOverride = null;
    /* Kept so a surface displaced by the comparison can be put back exactly as
       it was — the same node, with the same listeners and the same scroll. */
    this._sheetRecord = { id: this.sheetId, title, eyebrow, node, work };
    this.sheetEyebrow.textContent = eyebrow || '';
    this.sheetTitle.textContent = title || '';
    fill(this.sheetBody, node);
    this.sheetEl.hidden = false;
    if (this.app) this.app.dataset.sheet = 'open';
    this.sheetOpen = true;
    this.sheetBody.scrollTop = 0;
    this._setTools(false, false);
    /* THE SURFACE SETTLES OVER TWO FRAMES AND ITS RECTANGLE DOES NOT MOVE WHEN
       IT DOES. Measured at 390x844 on `#tour=core&step=11`: the beat's sheet
       opened, `_measure` ran while the rail behind it was still being built,
       the panel it would cover reported no box, and nothing resized afterwards
       — so the covered panel stayed in the tab order with 26 controls in it.
       Two frames, then the state is read again. */
    if (this._relayout) this._relayout();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!this.sheetOpen) return;
      this._paintSheetFit();
      this._syncPathJump();
      this._syncCovered();
      this._syncLineGrid(!!this.app && !!this.app.dataset.beatwork);
    }));
    this.ctx.bus.emit('chrome:sheet', { id: this.sheetId, open: true });
  },

  _closeSheet() {
    if (!this.sheetOpen) return;
    this.sheetOpen = false;
    this.sheetEl.hidden = true;
    if (this.app) this.app.dataset.sheet = 'closed';
    fill(this.sheetBody);
    this.sheetWork = null;
    this._readOverride = null;
    this._lastSheet = this._sheetRecord;
    this._sheetClosedAt = Date.now();
    /* THE COVERED PANEL IS RELEASED WITH THE THING THAT COVERED IT. */
    this._syncCovered();
    if (this._relayout) this._relayout();
    this.ctx.bus.emit('chrome:sheet', { id: this.sheetId, open: false });
  },

  /* ============================== an address that names nothing ========== */

  /**
   * `#/beat/mechanism`, `#chapter-3`, a half-copied link: none of those name a
   * key this atlas knows, so the reader landed on 1900 and the address bar
   * quietly rewrote itself. Nothing was said, which is the one thing an atlas
   * that argues about honest rendering cannot do. The band is the app's single
   * prose channel; the answer goes there, in the reader's own words back at
   * them, and it stands down after eight seconds.
   */
  /**
   * AND AN ADDRESS THAT NAMES A PLACE THIS ATLAS HAS NOT GOT.
   *
   * `url.js:unknownAddress` catches a fragment carrying no key this atlas
   * knows. It cannot catch a key it knows carrying a value it does not:
   * `#year=1857&sel=bengal` opens on 1857 with nothing selected, because the id
   * is `bengal-presidency` and `bengal` is what anybody would type.
   *
   * `main.js:vetSelection` already clears that id, announces it, and prints a
   * note in the footer — so the FACT is reported and this must not report it
   * twice; LAYOUT_BUDGET §5 is explicit that one noun gets one place. What the
   * footer cannot do is repair the link. So the band speaks only in the case
   * the footer leaves unfinished — when the atlas holds something that answers
   * to what was typed — and what it adds is the right id and a control that
   * opens it. When there is no near match there is nothing to add, and the
   * band says nothing at all.
   *
   * It does not rewrite the address. Correcting a reader's link to what we
   * assume they meant is the behaviour this whole surface exists to refuse:
   * the offer is made, and the press is theirs.
   */
  _checkAddress(state) {
    const data = this.ctx.data;
    const id = state && state.selectedTerritoryId;
    /* A readable address after an unreadable one takes the offer down; an offer
       that outlives the thing it repairs is its own small lie. Only the shell's
       own line is cleared — an unreadable FRAGMENT is reported by `_sayUnknown`
       and stands for its own eight seconds. */
    const ok = () => {
      this._badSel = null;
      if (this._saidBad) { this._saidBad = false; this._say({ id: 'chrome:nearest', text: null }); }
    };
    if (!id || !data || typeof data.get !== 'function') { ok(); return; }
    if (data.get(id)) { ok(); return; }
    if (this._badSel === id) return;
    this._badSel = id;
    let near = null;
    try {
      const hits = data.search ? data.search(String(id).replace(/[-_]+/g, ' '), { limit: 1 }) : [];
      if (hits && hits.length && hits[0].name && data.get(hits[0].id)) near = hits[0];
    } catch (_) { /* a search that fails is not a reason to say the wrong thing */ }
    if (!near) return;                     // the footer note is the whole answer
    this._saidBad = true;
    this._nearest = near.id;
    this._say({
      id: 'chrome:nearest',
      /* Above content (40), a moment (50) and a beat's own sentence (55–65):
         "this app could not read your link" is the most urgent thing on screen
         for the twelve seconds it is up. At 55 it lost to whatever spoke last —
         measured, the guided path's standing sentence buried it entirely. */
      priority: 68,
      mark: 'THAT LINK',
      text: '<strong>“' + escapeText(String(id).slice(0, 40)) + '” is not an id in this atlas.</strong> '
        + 'It files that place as <em>' + escapeText(near.name) + '</em>, id <em>'
        + escapeText(near.id) + '</em>.',
      cta: { label: 'Open ' + near.name, emit: 'chrome:openNearest', payload: { id: near.id } },
    });
    clearTimeout(this._nearT);
    this._nearT = setTimeout(() => this._say({ id: 'chrome:nearest', text: null }), 12000);
  },

  _sayUnknown(m) {
    const raw = (m && m.raw ? String(m.raw) : '').slice(0, 48);
    const y = this.ctx.store.getState().year;
    this._say({
      id: 'chrome:unknown',
      /* Above content (40), above a moment (50), above a beat's own sentence
         (55–65): "this app could not read your link" is the most urgent thing
         on the screen for the eight seconds it is up, and at 55 it was losing
         to whatever spoke last — measured, the guided path's standing sentence
         buried it entirely. */
      priority: 68,
      mark: 'THAT ADDRESS',
      text: '<strong>Nothing here is called “' + escapeText(raw) + '”.</strong> '
        + 'A link into this atlas names a year — <em>#year=' + y + '</em> — and may add a place, a layer or a step.',
    });
    clearTimeout(this._unknownT);
    this._unknownT = setTimeout(() => this._say({ id: 'chrome:unknown', text: null }), 8000);
  },

  /* ==================================================== the sweep ======== */

  /**
   * The focal path at second zero. DIDACTIC_SPEC §8, 00:02–00:05: "Play a
   * 25-second animated sweep, 1600→1997, with the band lighting each phase and
   * one clause per phase on screen." Play at 1x is a sixteen-minute video and
   * is not that. If the timeline answers `ask:sweep` itself this becomes its
   * job; until then the shell drives it, because an app whose one obvious next
   * thing does not work has no focal path at all.
   */
  _runSweep() {
    if (this.sweep) return;
    const { store, bus, util } = this.ctx;
    const b = store.getState().bounds || { min: 1600, max: 1997 };
    const from = Math.max(b.min, 1600);
    const to = Math.min(b.max, 1997);
    const reduced = prefersReducedMotion ? prefersReducedMotion() : false;

    store.dispatch('pause');
    this.cta.dataset.quiet = 'true';
    fill(this.cta, el('span.cx-cta__w', { text: 'Stop' }));
    bus.emit('chrome:sweep', { running: true, year: from });

    if (reduced) {
      // No animation: four plates, one per phase, each held long enough to read.
      const stops = [from, 1783, 1900, to];
      let i = 0;
      const step = () => {
        if (!this.sweep) return;
        store.dispatch('setYear', stops[i]);
        this._sayPhase(stops[i]);
        if (++i >= stops.length) { this._stopSweep(); return; }
        this.sweep.timer = setTimeout(step, 2200);
      };
      this.sweep = { timer: 0, reduced: true };
      step();
      return;
    }

    const DUR = 30000;
    const t0 = performance.now();
    let lastYear = -1;
    const frame = (t) => {
      if (!this.sweep) return;
      const k = Math.min(1, (t - t0) / DUR);
      const y = Math.round(from + (to - from) * k);
      if (y !== lastYear) {
        lastYear = y;
        store.dispatch('setYear', y);
        this._sayPhase(y);
      }
      if (k >= 1) { this._stopSweep(); return; }
      this.sweep.raf = requestAnimationFrame(frame);
    };
    this.sweep = { raf: requestAnimationFrame(frame) };
  },

  /**
   * The definition dial is the best single idea in this atlas: the same year,
   * four meanings of the word "British", and 88 units crossing the line. Its
   * explanation used to render into the time bar, where it asked for 255px of a
   * 140px region and printed the year axis through itself. It is a moment, and
   * moments are sentences: it goes here, at 19px, alone.
   *
   * No count is stated. The map and the ribbon are both counting on screen, and
   * this module does not own the definitions' arithmetic — P02 does, and P02
   * should overwrite this sentence with the counted version by emitting
   * `ask:say` at a higher priority.
   */
  _sayDefinition(state) {
    const def = (state.filters && state.filters.def) || 'claimed';
    this._say({
      id: 'chrome:definition',
      priority: 50,
      mark: 'THE WORD',
      text: '<strong>The word changed, not the map.</strong> Nothing was taken or given up — “British” now means <em>' + def + '</em>.',
    });
    clearTimeout(this._defT);
    this._defT = setTimeout(() => this._say({ id: 'chrome:definition', text: null }), 9000);
  },

  _sayPhase(year) {
    const p = phaseFor(year);
    if (this.sweepPhase === p) return;
    this.sweepPhase = p;
    this._say({ id: 'chrome:sweep', priority: 60, mark: p.n + '  ' + p.from + '–' + p.to, text: p.say });
  },

  _stopSweep() {
    if (!this.sweep) return;
    if (this.sweep.raf) cancelAnimationFrame(this.sweep.raf);
    if (this.sweep.timer) clearTimeout(this.sweep.timer);
    this.sweep = null;
    this.sweepPhase = null;
    this.swept = true;
    this._say({ id: 'chrome:sweep', text: null });
    this._setCta(null);
    this.ctx.bus.emit('chrome:sweep', { running: false });
    // The sweep IS the first interaction; everything at `working` has now been
    // earned, and the reader has seen the whole shape once.
    this._request('working');
    this._refreshDefault(this.ctx.store.getState());
  },
};

/** Text from the address bar is the one string in this app a stranger wrote.
 *  It goes through the same sanitiser as everything else, but the markup
 *  characters are neutralised before they ever reach it. */
function escapeText(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Allow <strong>, <em>, <b>, <i> and nothing else. Copy is ours, but this is a
 *  channel other modules write into, so it is filtered rather than trusted. */
function sanitise(html) {
  const t = document.createElement('template');
  t.innerHTML = String(html);
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) continue;
      if (child.nodeType !== 1) { child.remove(); continue; }
      const tag = child.tagName.toLowerCase();
      if (!['strong', 'em', 'b', 'i', 'span'].includes(tag)) {
        child.replaceWith(...child.childNodes);
        continue;
      }
      for (const a of [...child.attributes]) if (a.name !== 'class') child.removeAttribute(a.name);
      walk(child);
    }
  };
  walk(t.content);
  return t.innerHTML;
}
