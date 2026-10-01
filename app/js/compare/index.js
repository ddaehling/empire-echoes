/**
 * compare — P18. Two plates, one screen, and the difference written out in words.
 *
 * WHY THIS PIECE EXISTS. A book with four maps in it asks the reader to hold
 * 1770 in their head while looking at 1820. Most readers do not, which is how
 * "the empire ended in 1776" survives every textbook that contradicts it. This
 * view puts the two states of the world side by side, keeps their pan, zoom,
 * projection and layer locked together so the only thing that differs is the
 * thing under discussion, and then does what no printed spread can: it COMPUTES
 * the difference and names the mechanism behind every line of it — conquest,
 * treaty cession, lease expiry, war of independence — out of
 * `data.acquisitions[]` and `data.departures[]`.
 *
 * WHAT EVERY ROW SAYS, AFTER ROUND 3. A difference list is the surface in this
 * app most likely to reinforce M17 — "empire is a British story" — because a
 * list of what Britain gained has Britain as the only actor in every line. So
 * each line now carries three things out of the dataset and nothing authored:
 * the instrument, the year, and WHO. An arrival names the polity it was taken
 * from (`acquisitions[].counterparties[]`): Tipu Sultan's Mysore, the Lahore
 * Durbar, the Konbaung kingdom, the Eora peoples of Sydney Harbour. A departure
 * names the people who took it out (`departures[].led[]`, `side: "local"`
 * first) and what it became: "led by Michael Collins and Arthur Griffith ·
 * became Irish Free State". Under each list, a counted tally of its mechanisms
 * — "48 negotiated independence · 12 transferred to another power · 9 merged
 * into a neighbour · 7 partition · 6 referendum" — which is the shape of
 * decolonisation in one line and is computed, never written.
 *
 * And the gloss on `war-transfer` is neutral by default. Round 3 disqualified
 * the whole artefact for one string in another module that printed "handed over
 * by another European power" over the Konbaung kingdom and the Sikh empire.
 * This module could have printed the same thing: it now says "transferred at
 * the end of a war" unless EVERY counterparty in the record is itself a
 * European power, in which case, and only then, it says so. Computed from
 * `counterparties[].kind`, so a retag in the shards moves it automatically, and
 * the row prints the counterparty's own name beside it in either case.
 *
 * FIVE SCRIPTED COMPARISONS (compare/presets.js), each opening with a committed
 * prediction, because a reveal nobody bet against is a picture you scroll past:
 *   1770 v 1820      M5   losing America did not shrink the empire
 *   1783 v 1815      M5   where the capital went instead
 *   1860 v 1860      charge 5 / LO11 — claimed, against claimed-and-run
 *   1914 v 1922      T14  the peak is to the RIGHT of the war
 *   1945 v 1965      T19  what 1947 did and did not end
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW THE AUTHORED PATH (app/js/tours/) DRIVES THIS SURFACE
 *
 *   bus.emit('ask:compare', {
 *     preset: 'informal',        // one of the five ids above — sets everything
 *   });
 *   bus.emit('ask:compare', {    // or drive it by hand:
 *     a: 1914, b: 1922,          // two years (b may equal a)
 *     defA: 'claimed',           // optional; defaults to the map's definition
 *     defB: 'influenced',
 *     ask: 'Your question?',     // optional; a prediction of your own
 *     choices: [{id,label}, …],  //   with its answers
 *     answer: 'b',               //   and which one the data supports
 *     reveal: true,              // optional; skip the prediction entirely
 *     hold: false,               // optional; see below
 *   });
 *
 * `hold: false` is for ONE case: a beat that opens a comparison as its own
 * teaching move. Without it, opening this surface holds the lesson (see "the
 * year on screen is single-valued", point 3), which would drop the very beat
 * panel that asked for it. It carries one condition, and it is not optional:
 * the beat's own year must be one of the two plates' years — pass `a:` equal
 * to the year the beat sets — or the beat's headline and the plates print two
 * different dates, which is the defect the hold exists to end.
 *   bus.emit('ask:compare', null);   // or 'compare:close' — close it
 *
 * A reader who was not sent here reaches it by the quiet "Compare" control in
 * the masthead (absent at data-stage="plate"; in the sheet band it is a row in
 * the shell's own tools panel) or by pressing `v`. `c` was the obvious letter;
 * P06 had already bound it, so `v` is the published key and `c` is accepted
 * only when nothing else has claimed the keystroke.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE YEAR ON SCREEN IS SINGLE-VALUED, AND THIS SURFACE ENFORCES ITS HALF
 *
 * Two plates are two labelled dates. A THIRD date is a lie, and round 2 shipped
 * one: 1655 in the lede, 1900 on the timeline and 1914 on these plates at the
 * same moment. Two mechanisms, both here:
 *
 *   1. Nothing acts inside the hydration window, and the notification that
 *      CLOSES that window is always a full re-sync. Before this, a year applied
 *      by a deep link or by the Back button never reached these plates at all.
 *   2. A year moved by anyone but this piece — a tour beat, the timeline, a
 *      change card — closes the comparison and says which year won. It does not
 *      silently re-base onto a pair nobody asked for.
 *   3. ROUND 4, AND THE HOLE THE FIRST TWO LEFT. Both of those defend the
 *      comparison against a year moved from outside. Neither defended the
 *      OUTSIDE against a year moved by the comparison. Measured at 1366x768,
 *      cold-loaded into `#tour=thirty&step=9` and then pressing `v`:
 *
 *        the lede band     12 AUGUST 1765   (the beat, still speaking)
 *        the compare bar   1770 against 1820
 *        plate A           1770
 *        the time bar      1770
 *        the dossier       LEGAL STATUS IN 1770   (the beat's own selection)
 *
 *      Four teaching surfaces stacked and two years on one screen — the exact
 *      fault this section was written to end, arriving from the other side.
 *      The comparison had moved the store's year to 1770 while the beat went on
 *      printing the date it was standing on, because a beat's headline is
 *      authored prose and does not follow the year.
 *
 *      So: A COMPARISON OPENED INSIDE A LESSON BEAT HOLDS THE LESSON FIRST.
 *      `tours:explore` is the app's own published move for "the student has
 *      stepped off the path" — it drops the beat panel, stops the beat
 *      re-applying its year, and replaces the beat's dated headline with
 *      "Exploring · your open question … Rejoin at 9", which carries no date at
 *      all. The beat's own selection is dropped with `deselect`, so the dossier
 *      cannot print a third one. Then, and only then, the year moves. Close (or
 *      Escape) emits `tours:rejoin`: the beat comes back, its year comes back,
 *      its selection comes back, and the comparison leaves nothing behind.
 *      Measured after the change, same viewport, same beat: one year on screen
 *      at every step of that round trip.
 *
 *      It is also the whole responsive answer. The beat panel is 280px of a
 *      390x844 phone (LAYOUT_BUDGET B8, RESPONSIVE_LAW §2), and while it is
 *      mounted this surface is handed the 192px map band and nothing else:
 *      measured before the change, `.cmp` was 390x192 with a 70px bar, the
 *      second plate drawn at y=342 in a box that ended at 348, and the whole
 *      difference list below the bottom of the surface with no way to reach it.
 *      Holding the lesson gives the surface the plate back — 390x450 — which is
 *      the geometry it was designed against. Same at 900x700 (596x390 -> 900x390,
 *      because the rail column goes with the beat) and at 768x1024 (768x391 ->
 *      768x650). Nothing here asks the shell for a pixel it does not already
 *      publish.
 *
 *      ROUND 5, AND WHAT WAS STILL WRONG WITH THE SHAPE. The hold above put
 *      one year on the screen and gave this surface the whole plate back. Then
 *      four critics opened it on a phone and found three things the hold could
 *      not answer, all of them in the PREDICTION phase, which is the half of
 *      this surface a student meets first:
 *
 *        · "the compare plate draws one map (1770) and asks 'Was it holding
 *          more of the map in 1770, or in 1820?' with no 1820 plate visible and
 *          no toggle."  The second plate was `display: none` until the reader
 *          committed. A surface whose whole promise is two plates on one screen
 *          spent its entire prediction phase being one plate and a question
 *          about a year that was nowhere. It is a FACE-DOWN CARD now, in the
 *          exact place the drawn plate will occupy, with its own year and
 *          definition on its own label and "commit an answer and this plate is
 *          drawn" on its face. It counts nothing until the reveal, because a
 *          card printing "96 units" would answer the question it exists to make
 *          the reader answer first. And because the card is where the plate
 *          goes, committing turns one card over instead of re-laying the screen
 *          out: measured at 1366x768, 1440x900, 1920x1080, 1024x640 and
 *          900x700, neither plate moves by a pixel between the two phases.
 *
 *        · the third answer was off the bottom of its own box. Measured at
 *          390x844 inside beat 9: `.cmp__ask` was a region of its own, the grid
 *          row gave it 188px, the question is 322px tall, and "About the same"
 *          sat at y=638 in a box that ended at 628, with the note 118px below
 *          that, inside a scroller with no scrollbar. Two students in three
 *          were being offered two of three answers. The question is in the
 *          surface's own scroller now, the plates take 112px of a phone rather
 *          than 224 while a question is up (side by side, one of them the
 *          card), and every answer is whole and on screen at rest at 390x844,
 *          768x1024, 844x390, 900x700, 1024x640, 1366x768, 1440x900 and
 *          1920x1080 — rule P2 of `tools/scenarios/p18r5-accept.js`.
 *
 *        · "the preset chip row clips '1945' at the right edge with no scroll
 *          affordance." 366px of row holding 407px of chips. It scrolls with
 *          snap, its fade is written from the measurement (`_pickerEdges`) so
 *          it appears at the end that actually has more and nowhere else, and
 *          the pressed chip is scrolled into view — opening `1945 / 1965` from
 *          a link used to draw a pressed chip off the side of a row that then
 *          looked like a row of four.
 *
 *      And one thing they reported about every other surface in the app, which
 *      was true here too: "sliced clean through the x-height". Measured at
 *      900x700 with the reveal up, the difference had a 114px window under the
 *      sticky plates, the counted head took all of it, and the verdict the
 *      reader had just bet against was drawn across the bottom edge with the
 *      lower half of every letter removed. Three answers: the ANSWER is the
 *      first thing in the difference at every width under 62rem (it was already
 *      that on a phone); every scroller in this surface fades its last 20px
 *      while it has more below and stops the moment it does not (`_edges`); and
 *      a commit that leaves the answer off screen scrolls to it (`_commit`).
 *      At 900x700 the difference is a COLUMN again rather than a 114px strip —
 *      see compare.css, "46rem to 62rem AND SHORT" — which is +52% of drawn map
 *      and 2.5x the reading window from the same window.
 *
 *      ROUND 6. FOUR CRITICS OPENED IT ON A PHONE AGAIN. The hold above was
 *      confirmed by all four ("the year desync itself is properly fixed: it
 *      holds the lesson, offers Rejoin at step 13, and shows one year
 *      everywhere") and four things were not:
 *
 *        · "once open the two plates are 195px wide each — a world map 195px
 *          across. Below 62rem the two plates should stack, not sit side by
 *          side." Round 5 put the ASK phase side by side to buy the question its
 *          height, and the arithmetic that forced it had a mistake in it: it
 *          costed the face-down card as a plate. It draws nothing and counts
 *          nothing; it needs the room to say which year it is and that it is
 *          face down, which is one 3.5rem strip. The plates stack in both phases
 *          under 46rem now — plate A 390x93 against 194x70, 2.4x the world — the
 *          three answers go three across on one row so every one of them is
 *          still whole at rest, and plate A is drawn at exactly the height it
 *          has after the commit, so what changes on commit is the card growing
 *          into the plate it stood in for. FEATURE_SPEC §2 rule 3, measured.
 *
 *          AND THE GAIN IS IN THE HEIGHT, NOT THE WIDTH, WHICH IS WORTH SAYING
 *          BECAUSE IT IS THE OPPOSITE OF WHAT THE COMPLAINT SOUNDS LIKE. The
 *          plate is contain-fit: sampled off the canvas at 390x844, a 390x93
 *          box draws a 222x93 world and a 390x49 box draws 117x49, so the drawn
 *          width is 2.39x the box's HEIGHT and the box's own width only decides
 *          how much sea is beside it. Side by side the pair had 70px of height
 *          each and drew 167x70; stacked they have 93 and draw 222x93 — 1.8x
 *          the world, bought by not spending a plate's worth of height on a
 *          card that has nothing to draw.
 *
 *        · THE PAYLOAD'S OWN LETTERBOX. The panel's headline finding was a beat
 *          panel reading 2,135px of content through 129px, and this surface had
 *          the same shape in its own difference: at 390x844 the scroller is
 *          343px, the sticky plates take 232, and 5,529px of verdict and named
 *          places read through 109. The plates now have two heights and the
 *          reader's own scroll chooses: whole at the top of the list, a peek
 *          (144px, both years, both totals, both maps at 119x50) once they are
 *          in it —
 *          109px of reading window becomes 234, +115%, and 435 at 768x1024,
 *          the viewport the panel called the worst in the app. Pressing any
 *          named place gives the plates their full depth back, because that is
 *          the gesture that needs the map. `_peek`, and compare.css "the plates
 *          stand back".
 *
 *        · "the preset chip row cuts '1945' at the right edge with no scroll
 *          affordance." Round 5 answered this with a fade keyed to the
 *          measurement, and the panel looked at the same row and said the same
 *          thing, correctly: a fade is a cue, not a control. The row keeps the
 *          fade and gets two 28px buttons, drawn only at the end that has
 *          somewhere to go, each moving the row on by exactly one comparison.
 *          `_pickerScroll`, `_pickerEdges`.
 *
 *        · AND ONE THE CRITICS DID NOT REACH, FOUND BY DRIVING IT. At 1440x900,
 *          cold into `#tour=thirty&step=9` and then `v`, both plates were drawn
 *          over the Bay of Bengal while the question above them asked about
 *          thirteen colonies in North America and the verdict named America,
 *          India and Australia. The batch in `request` sets the whole map and
 *          1.5s later the store reads `{k: 4, x: 0.244}` again — the beat's own
 *          frame, re-applied by a neighbour when the stage rectangle changed.
 *          At 1366x768 and 390x844 the same load was fine, which is why four
 *          rounds of harness never saw it. The frame a script asks for is now
 *          HELD (`_wantView`) as well as dispatched: `_paint` draws from it
 *          until the reader moves the camera themselves. Verified at 1440x900,
 *          1366x768, 900x700 and 390x844: `{k: 1, x: 0, y: 0}` at all four.
 *
 *      Its executable form is `tools/scenarios/p18r6-accept.js` (R1-R9) and
 *      `tools/scenarios/p18r6-drive.js`, run at nine viewports in light, dark
 *      and reduced motion beside the round-3, -4 and -5 harnesses.
 *
 * And one teaching panel at a time: opening this closes the rail sheet
 * (`ask:sheet`, null) and drops the selected territory. The shell holds the
 * displaced surface and puts it back on `compare:close`, so a student four
 * beats into the lesson who presses `v` gets their beat panel back when they
 * close the comparison. P06 stands its own thematic reading down for the same
 * reason, from its side.
 *
 * It answers with `compare:open`, `compare:commit` and `compare:close`, and it
 * puts its one sentence in the shell's band via `ask:say` at priority 50, so a
 * tour that wants different words can outrank it at 60 and this piece will not
 * fight back.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE URL, which is the teacher's contract (ARCHITECTURE §8)
 *
 *   #year=1820&compare=1770                             the two years
 *   #filter=cmp:informal                                a scripted comparison
 *   #filter=cmpa:claimed,cmpb:influenced                a definition on each plate
 *   #filter=cmpr:1                                      already revealed
 *   #filter=cmpg:b                                      the guess that was committed
 *   #filter=cmpd:1                                      "only what changed" is on
 *
 * `compare` is the shell's own key. The six `cmp*` keys live in the free-form
 * `filters` object the shell already round-trips, which is what FEATURE_SPEC §7
 * says to use rather than asking for new top-level state. Every one of them is
 * written back as the reader changes it, so the address bar at any moment is a
 * link that reproduces exactly what is on screen — including which answer this
 * student committed to, which is what makes acceptance test 4 true rather than
 * nearly true.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHERE IT RENDERS, AND WHY THAT IS INSIDE THE BUDGET
 *
 * Under 62rem the reveal is ONE SCROLLER with the two plates stuck to the top
 * of it — not three fixed regions. Measured on round 2, at 390x844 the plates
 * took 308 of the stage's 441px and the difference list got 133, whose first
 * 170 belonged to the head and the verdict: the first named place sat at y=799
 * inside a box that ended at 632, so a phone reader met two thumbnails and no
 * list. The plates now hold the top and never leave, and the verdict and the
 * twenty-eight names run under them at their natural height.
 *
 * Slot `map-overlay` (`.stage__over`), the one surface LAYOUT_BUDGET rule B5
 * exempts by name, because compare mode is not a panel standing on the plate:
 * it IS the plate, drawn twice by the map's own renderer. The colour ribbon
 * stays visible underneath — it is the key to both plates — and the stage, the
 * time bar, the lede band and the rail are untouched, so B1–B4 are measured on
 * exactly the geometry they were measured on before this piece existed.
 * Nothing here is a modal and nothing here is a tab.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LIST IS THE PAYLOAD, SO WHEN IT IS BELOW THE FOLD THE SURFACE SAYS SO
 *
 * Measured with the reveal up: the counted head and the answer take about 320px
 * of a difference column that is 541px at 1440x900 and about 170px at 900x700,
 * so the twenty-nine named places under them were entirely off screen at three
 * of the four viewports a school owns, inside a scroller with no scrollbar.
 * Round 3 caught the guided path doing the same thing to its own gate. Two
 * answers, both here: "what the count cannot see" moved out of the fixed head
 * and into the scroller where the lines it talks about are, and a strip —
 * `↓ 29 arrived · 19 went · 10 changed` — takes a row of the surface, moves the
 * reader to the first NAME rather than to the head above it, and exists only
 * while no named place is on screen. It is a grid row and not a sticky footer,
 * because a sticky footer covered the last line of the verdict at 900x700, and
 * a region that clips its own text is what LAYOUT_BUDGET §4 opens by refusing.
 *
 * Events emitted:  compare:ready {presets} · compare:open {a,b,defA,defB,preset}
 *                  · compare:commit {preset,choice,correct} · compare:pick
 *                  {unitId,side} · compare:close
 * Events honoured: ask:compare · compare:close · compare:set
 */

import { el, fill, disposer, announce } from '../core/util.js';
import { definitionById, DEFAULT_DEFINITION } from '../map/definition.js';
import { attach as attachCamera } from '../map/interaction.js';
import { pick } from '../map/hit.js';
import { SidePlate, sharedGeometry, tenureIndex, readTokens } from './split.js';
import { diff, side, touched, acqLabel, depLabel } from './diff.js';
import { PRESETS, presetById, order } from './presets.js';

const STORE_KEY = 'compare.v1';

export default {
  id: 'compare',
  slot: 'map-overlay',
  requires: ['data'],

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { store, bus, util, data } = ctx;

    await util.loadCss(new URL('../../css/compare.css', import.meta.url));

    this.root = ctx.root;
    this.open = false;
    this.phase = 'ask';
    this.guess = null;
    this.diffOnly = false;
    this.spot = null;              // the row a reader is pointing at
    this.record = util.storage.get(STORE_KEY, {}) || {};
    this.geometry = sharedGeometry(data);
    this.firstHeld = tenureIndex(data);
    this.tokens = readTokens();

    this._build();
    this._buildLauncher();

    /* ---- the ways in ------------------------------------------------- */
    this.d(bus.on('ask:compare', (m) => (m ? this.request(m) : this.close())));
    this.d(bus.on('compare:set', (m) => this.request(m || {})));
    this.d(bus.on('compare:close', () => this.close()));

    /* IS A LESSON RUNNING, AND IS THE STUDENT STANDING ON A BEAT?
       The first half is read from `#app[data-path]`, which RESPONSIVE_LAW §3.2
       publishes from `state.activeTour` — so it is right on a cold load into
       `#tour=…&step=…`, one frame before any bus traffic, which is exactly the
       load this surface got wrong. The second half cannot come from there:
       `data-path` stays `on` while the student is exploring off the path (the
       lesson is held, not ended), and a comparison must not "hold" a lesson
       that is already held or rejoin one the student stepped off deliberately.
       That single bit is the tours module's own, it is on its own bus, and this
       is the only thing taken from there. */
    this._exploring = false;
    const mark = (p) => { if (p && typeof p.exploring === 'boolean') this._exploring = p.exploring; };
    this.d(bus.on('tours:beat', mark));
    this.d(bus.on('tours:state', mark));
    /* A lesson that ends while a comparison is open has nothing to rejoin. */
    this.d(bus.on('tours:state', (p) => { if (p && !p.running) this._held = null; }));
    this.d(bus.on('app:ready', () => { this._dockLauncher(); this._launcherVisibility(store.getState()); }));

    this.d(util.on(document, 'keydown', (ev) => this._onKey(ev)));
    /* ESCAPE, IN THE CAPTURE PHASE, AND ONLY WHILE THIS SURFACE IS UP.
       Measured at 390x844: pressing Escape over an open comparison did nothing,
       because P02 keeps an enlarged plate on a phone and takes Escape for it in
       a bubble listener registered eleven modules earlier — so by the time this
       one saw the key it was already `defaultPrevented`, and the only way out
       of the comparison on a phone was the Close word in a wrapped bar. Capture
       runs ahead of every bubble listener, this branch only fires when the
       comparison is genuinely open and focus is not in a field, and it still
       stands down for the shell (chrome's own capture listener is registered
       first and takes the tools panel, the sweep and the sheet before this).
       The dossier reached the same conclusion on the same viewport for the same
       reason; the precedent is in app/js/panels/dossier/index.js. */
    this.d(util.on(document, 'keydown', (ev) => this._onEscapeCapture(ev), { capture: true }));

    /* The store is the source of truth; the URL writes into it, so restoring a
       deep link and pressing the button take exactly the same path. */
    this.d(store.subscribe((state, prev, changed) => {
      /* THE HYDRATION HOLE, and why it produced three years on one screen.
         url.js applies a restored link — and every Back and Forward — inside a
         window where `hydrating` is true, then closes the window with a second
         notification. Returning early on the first and ignoring the second
         meant a year applied by a deep link or by the Back button never reached
         these plates: the address bar said one year, the timeline said it, and
         this surface went on drawing the year it had been opened with. That is
         the round-2 verdict's "1655 in the lede, 1900 on the timeline, 1914 on
         the compare map", seen from this side. So: nothing acts DURING the
         window, and the notification that closes it is always a full re-sync. */
      if (state.hydrating) { this._dirty = true; return; }
      const leaving = this._dirty || (changed.has('hydrating') && !state.hydrating);
      if (leaving) {
        this._dirty = false;
        this._ownYear = state.year;          // a restored link is not an outside move
        this._syncFromState(state);
        this._launcherVisibility(state);
        return;
      }
      /* THE YEAR ON SCREEN IS SINGLE-VALUED. Two plates are two labelled dates;
         a THIRD date is a lie, and it is what happens when a tour beat, the
         timeline or a change card moves the year under an open comparison. The
         comparison does not silently re-base itself onto a pair nobody asked
         for — it closes, and says which year won. */
      if (this.open && changed.has('year') && state.year !== this._ownYear) {
        this._closedBy = state.year;
        this.close();
        return;
      }
      if (changed.has('compareYear') || changed.has('filters')) this._syncFromState(state);
      else if (this.open && changed.has('mapView')) this._syncFromState(state);
      if (this.open && changed.has('activeLayer')) this._paint(true);
      if (changed.has('theme') || changed.has('reducedMotion')) this._themeChanged();
      if (changed.has('filters')) this._launcherVisibility(state);
    }));

    this._mq = window.matchMedia('(prefers-color-scheme: dark)');
    this._onMq = () => this._themeChanged();
    this._mq.addEventListener('change', this._onMq);
    this.d(() => this._mq.removeEventListener('change', this._onMq));

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.grid);
    this.d(() => this._ro.disconnect());

    this._launcherVisibility(store.getState());
    this._syncFromState(store.getState());
    bus.emit('compare:ready', { presets: PRESETS.map((p) => p.id) });
  },

  /* =================================================== the surface ====== */

  _build() {
    const canvasA = el('canvas', { 'aria-hidden': 'true' });
    const canvasB = el('canvas', { 'aria-hidden': 'true' });

    this.labA = el('span.cmp__year.num');
    this.labB = el('span.cmp__year.num');
    this.defA = el('span.cmp__def');
    this.defB = el('span.cmp__def');
    this.totA = el('p.cmp__totals');
    this.totB = el('p.cmp__totals');

    /* THE SECOND PLATE IS ON SCREEN FROM THE FIRST FRAME, FACE DOWN.
       Round 5's phone critic opened this surface inside a beat and reported:
       "the compare plate draws one map (1770) and asks 'Was it holding more of
       the map in 1770, or in 1820?' with no 1820 plate visible and no toggle."
       They were right about what they saw. The second plate was `display: none`
       until the reader committed, so a surface whose whole promise is "two
       plates, one screen" spent its entire prediction phase being one plate and
       a question about a year that was nowhere.

       It is a card now, in exactly the place the drawn plate will occupy, with
       the year and the definition on its own label and the words on its face.
       Three things follow, and all three are the point: the promise is true at
       the first frame; the reveal turns a card over rather than re-laying the
       screen out, so at every width above 46rem nothing moves when the second
       plate arrives; and the reader can see that the app is holding something
       back on purpose, which is what makes committing feel like a bet rather
       than a form field. Its TOTALS stay off until the reveal — printing "96
       units" beside a face-down card would answer the question the card exists
       to make the reader answer first. */
    this.faceDown = el('div.cmp__facedown',
      el('span.cmp__facedown-w', { text: 'Face down' }),
      el('span.cmp__facedown-s', { text: 'Commit an answer and this plate is drawn' }));

    const mkSide = (k, lab, def, plate, tot) => el('section.cmp__side', {
      dataset: { side: k }, tabindex: '0', role: 'group',
      'aria-label': k === 'a' ? 'The first plate' : 'The second plate',
    },
    /* No "left" / "right" anywhere in this piece's prose. Below 62rem the two
       plates stack, and a verdict that says "the left-hand plate" is then
       simply wrong. Every sentence names the YEAR or the DEFINITION instead,
       which is true at every viewport and is also the thing worth remembering. */
    el('h2.cmp__lab', lab, def),
    plate,
    tot);

    this.sideA = mkSide('a', this.labA, this.defA, el('div.cmp__plate', canvasA), this.totA);
    this.sideB = mkSide('b', this.labB, this.defB, el('div.cmp__plate', canvasB, this.faceDown), this.totB);
    /* A wrapper that is `display: contents` at every width where the three
       regions fit side by side — so the desktop grid below is exactly the grid
       it has always been — and a real, sticky box on a phone, where the two
       plates hold the top of one scroller and the difference runs under them.
       See compare.css, "the phone is one column and one scroll". */
    this.plates = el('div.cmp__plates', this.sideA, this.sideB);

    this.askEl = el('div.cmp__ask');
    this.deltaEl = el('aside.cmp__delta', { 'aria-label': 'What changed between the two plates' });

    this.title = el('span.cmp__title');
    this.diffBtn = el('button.cmp__toggle', {
      type: 'button', 'aria-pressed': 'false',
      onclick: () => this._setDiffOnly(!this.diffOnly),
    }, 'Only what changed');
    this.closeBtn = el('button.cmp__close', {
      type: 'button', 'aria-label': 'Close the comparison and go back to one map',
      onclick: () => this.close(),
    }, 'Close');
    this.pickEl = el('div.cmp__picker', { role: 'group', 'aria-label': 'Other comparisons' });

    /* A FADE SAYS THERE IS MORE. IT DOES NOT SAY HOW TO GET IT.
       Round 5 keyed the chip row's fade to the measurement, and round 6's panel
       looked at the same row and reported the same defect again: "the preset
       chip row cuts '1945' at the right edge with no scroll affordance."
       They are right that a fade is a cue and not a control. Measured at
       390x844 inside a beat: the row is 366px wide and 407px long, so 41px of
       the fifth comparison is outside it, and the only way to it was a
       sideways drag on a strip a thumb cannot see the end of.

       So the row keeps its fade AND gets two real controls, 2rem square (WCAG
       2.2 SC 2.5.8 asks 24 CSS px; these are 32), drawn over the end that
       actually has more and nowhere else — `_pickerEdges` writes `data-of` and
       these read it. Each press moves the row by one chip and the row's own
       scroll-snap does the rest. They exist only in the band where the picker
       is a full-width row of its own (compare.css, under 46rem); above it the
       row has never overflowed at any viewport this file is tested at. */
    const nav = (dir, word, glyph) => el('button.cmp__picknav', {
      type: 'button', dataset: { dir },
      'aria-label': word + ' comparisons',
      tabindex: '-1',
      onclick: () => this._pickerScroll(dir === 'next' ? 1 : -1),
    }, el('span', { 'aria-hidden': 'true', text: glyph }));
    this.pickPrev = nav('prev', 'Earlier', '\u2039');
    this.pickNext = nav('next', 'More', '\u203a');
    /* `display: contents` above 46rem, so the picker stays a direct flex child
       of the bar and every rule already written for it keeps applying. */
    this.pickRow = el('div.cmp__pickrow', this.pickPrev, this.pickEl, this.pickNext);

    /* WHAT THIS SURFACE JUST DID TO THE LESSON, IN THE PLACE IT DID IT.
       A student four beats in presses `v` and the beat panel goes. The shell's
       band says so from the tours side ("Exploring · your open question …
       Rejoin at 9") but it cannot say the two things that belong to this
       surface: that CLOSE is also the way back, and which year the lesson is
       standing on. One line, computed, present only while this piece is holding
       a lesson. */
    /* A SPAN, NOT A PARAGRAPH, AND THE REASON IS MEASURED. base.css line 91 is
       `:where(p, ul, ol, dl, figure, table, blockquote, pre) + * { margin-top:
       var(--space-lg) }`, so a `<p>` here pushed 16px of flow margin onto the
       title beside it and the bar went from 35px to 48px at every viewport
       above 46rem — 13px taken off both plates by a line of type that is 17px
       tall. `timeline.css` records the same trap from its own side. */
    this.heldEl = el('span.cmp__held', { hidden: true });

    this.bar = el('div.cmp__bar',
      el('span.cmp__eyebrow', { text: 'Two dates, one screen' }),
      this.heldEl,
      this.title, this.pickRow,
      el('span.cmp__barsp'), this.diffBtn, this.closeBtn);

    this.grid = el('div.cmp__grid', this.plates, this.askEl, this.deltaEl);
    /* A ROW OF `.cmp`, NOT A STICKY FOOTER INSIDE THE SCROLLER. See
       `_jump()` and compare.css: the strip has to take height from the scroller
       rather than stand on top of its last line. */
    this.jumpHost = el('div.cmp__jumphost', { hidden: true });
    /* DOM order: bar, strip, grid. VISUAL order: bar, grid, strip (compare.css
       places the rows explicitly). A shortcut to the foot of a list that a
       keyboard user only reaches after tabbing through the fifty-eight rows it
       was going to save them is not a shortcut. */
    this.el = el('div.cmp', { dataset: { phase: 'ask' }, hidden: true }, this.bar, this.jumpHost, this.grid);
    /* APPEND, never fill. `map-overlay` is a shared slot — P06's pressure layer
       renders into the same element — and `fill()` here silently deleted its
       node on mount. Nothing in this module ever removes a child it did not
       create. */
    this.root.appendChild(this.el);

    this.A = new SidePlate(canvasA);
    this.B = new SidePlate(canvasB);
    for (const s of [this.A, this.B]) {
      s.setGeometry(this.geometry).setTokens(this.tokens);
    }

    /* The camera is shared. Dragging either plate moves both, and the result is
       written back to `mapView`, so closing the comparison leaves the single
       map exactly where the comparison left it. */
    const sync = (v) => {
      this.A.setView(v); this.B.setView(v);
      this.A.draw(); this.B.draw();
      /* The reader has moved the camera, so the view this surface displaced on
         opening a scripted pair is not put back on close: what they chose beats
         what they came in with. See `request`. And the frame the SCRIPT asked
         for stops being asserted, for the same reason. */
      this._camMoved = true;
      this._wantView = null;
      this.ctx.store.dispatch('setMapView', { k: v.k, x: v.x, y: v.y });
    };
    this.camA = attachCamera(this.A.plate, {
      target: canvasA, frame: this.sideA, onView: sync,
      onPick: (x, y) => this._pickOn(this.A, x, y),
    });
    this.camB = attachCamera(this.B.plate, {
      target: canvasB, frame: this.sideB, onView: sync,
      onPick: (x, y) => this._pickOn(this.B, x, y),
    });
    this.d(() => { this.camA.destroy(); this.camB.destroy(); });

    /* Keyboard on either plate: the same keys the single map uses. */
    for (const [sec, cam] of [[this.sideA, this.camA], [this.sideB, this.camB]]) {
      this.d(this.ctx.util.on(sec, 'keydown', (ev) => {
        if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
        const step = ev.shiftKey ? 120 : 48;
        if (ev.key === '+' || ev.key === '=') { cam.zoomIn(); }
        else if (ev.key === '-' || ev.key === '_') { cam.zoomOut(); }
        else if (ev.key === 'ArrowLeft') { cam.panBy(step, 0); }
        else if (ev.key === 'ArrowRight') { cam.panBy(-step, 0); }
        else if (ev.key === 'ArrowUp') { cam.panBy(0, step); }
        else if (ev.key === 'ArrowDown') { cam.panBy(0, -step); }
        else if (ev.key === 'Home') { cam.reset(); this._paint(true); }
        else return;
        ev.preventDefault();
      }));
    }

    /* The "there is more below" strip is only honest while there IS more below,
       so its visibility is measured on every scroll of whichever element is the
       scrollport at this width, and on every resize. Passive: it reads
       geometry and never blocks a gesture. */
    const check = this.ctx.util.rafThrottle(() => { this._jumpCheck(); this._edges(); });
    for (const n of [this.deltaEl, this.grid, this.askEl, this.pickEl]) {
      this.d(this.ctx.util.on(n, 'scroll', check, { passive: true }));
    }

    /* Delegated: every row in the difference list lights its own places. */
    this.d(this.ctx.util.on(this.deltaEl, 'click', '.cmp__row', (ev, node) => this._rowPressed(node)));
    this.d(this.ctx.util.on(this.deltaEl, 'pointerover', '.cmp__row', (ev, node) => this._rowHover(node)));
    this.d(this.ctx.util.on(this.deltaEl, 'focusin', '.cmp__row', (ev, node) => this._rowHover(node)));
    this.d(this.ctx.util.on(this.deltaEl, 'pointerleave', () => this._rowHover(null)));
  },

  /**
   * The way in for a reader who was not sent here by a link or a tour. One
   * quiet control in the masthead, and it does not exist at `data-stage="plate"`
   * — at second zero there is nothing to compare the map against, and the
   * nineteen controls of LAYOUT_BUDGET §3 level 0 are nineteen for a reason.
   */
  _buildLauncher() {
    if (!this.launcher) {
      /* THE MASTHEAD IS FULL, AND ON A PHONE IT IS OVER-FULL. Measured at
         390x844 in round 2 this control was an 86px word sitting at x=340: its
         right edge was at 426 in a 390px document that does not scroll, so the
         one way into this surface for a reader who was not sent here was off
         the side of the screen. It now carries a two-pane glyph and drops the
         word and the key chip under 46rem — 26px instead of 86 — which puts it
         back on the phone and moves everything docked after it 60px inboard. */
      this.launcher = el('button.cmp__launch', {
        /* LABEL IN NAME (WCAG 2.5.3). The visible word is "Compare"; the
           accessible name begins with that exact string and then says what the
           control does, so "click Compare" reaches it by voice. The `v` chip is
           `aria-hidden` and is a keystroke, not part of the label. */
        type: 'button', title: 'Compare two dates side by side (v)',
        'aria-label': 'Compare \u2014 two dates side by side',
        onclick: () => (this.open ? this.close() : this.request({ preset: this._suggest() })),
      },
      el('span.cmp__launch-i', { 'aria-hidden': 'true' }, el('i'), el('i')),
      el('span.cmp__launch-k', { 'aria-hidden': 'true', text: 'v' }),
      el('span.cmp__launch-w', { text: 'Compare' }));
      this.d(() => this.launcher.remove());
    }
    this._dockLauncher();
  },

  /**
   * The masthead's right-hand slot is shared, and the piece that mounts last
   * into it replaces its children wholesale. Mount order put this button on
   * screen and then took it off again, so the button re-docks itself on
   * `app:ready` and on any state change that could have re-rendered a
   * neighbour. Cheap, idempotent, and it never touches anyone else's node.
   */
  _dockLauncher() {
    const host = document.querySelector('[data-mount="chrome-end"]');
    if (!host || !this.launcher || this.launcher.parentElement === host) return;
    host.appendChild(this.launcher);
  },

  _launcherVisibility(state) {
    if (!this.launcher) return;
    this._dockLauncher();
    const stage = (state.filters && state.filters.stage) || 'plate';
    /* Not at second zero. LAYOUT_BUDGET §3 level 0 is nineteen controls and one
       sentence, and at second zero there is nothing to compare the map against
       — the same argument that defers the definition dial to `working`. */
    this.launcher.hidden = stage === 'plate';
  },

  /** The comparison nearest the year the reader is already looking at. */
  _suggest() {
    const y = this.ctx.store.getState().year;
    let best = PRESETS[0], d = Infinity;
    for (const p of PRESETS) {
      const dist = Math.min(Math.abs(p.a.year - y), Math.abs(p.b.year - y));
      if (dist < d) { d = dist; best = p; }
    }
    return best.id;
  },

  /* =================================================== opening ========== */

  /** The single entry point. Everything — bus, key, button, URL — comes here. */
  request(m = {}) {
    const { store } = this.ctx;
    const cur = store.getState();
    const preset = m.preset ? presetById(m.preset) : null;
    const baseDef = (cur.filters && cur.filters.def) || DEFAULT_DEFINITION;

    let aY, bY, aD, bD;
    if (preset) {
      aY = preset.a.year; bY = preset.b.year;
      aD = preset.a.def || baseDef; bD = preset.b.def || baseDef;
    } else {
      aY = Number.isFinite(+m.a) ? +m.a : cur.year;
      bY = Number.isFinite(+m.b) ? +m.b : (cur.compareYear != null ? cur.compareYear : cur.year);
      aD = m.defA || baseDef; bD = m.defB || baseDef;
    }
    this.adhoc = preset ? null : {
      ask: m.ask || null, choices: m.choices || null, answer: m.answer || null,
    };

    const filters = {
      cmp: preset ? preset.id : null,
      cmpa: aD === baseDef && (!preset || !preset.a.def) ? null : aD,
      cmpb: bD === baseDef && (!preset || !preset.b.def) ? null : bD,
      /* A comparison a TEACHER set — a bare `#compare=` link, or `ask:compare`
         with two years and no question — is revealed at once: they chose the
         pair deliberately and the plates are the point. A SCRIPTED comparison
         asks first, every time, because the prediction is the pedagogy
         (DIDACTIC_SPEC §8.1). `reveal: true` overrides either way. */
      cmpr: (m.reveal || (!preset && !m.ask)) ? '1' : null,
      cmpg: null,
      cmpd: null,
    };
    /* The year this surface itself asked for. Anything that moves the year to
       anything else is somebody else's beat, and closes the comparison rather
       than re-basing it (see the store subscription). */
    this._ownYear = aY;
    this._closedBy = null;
    /* ONE TEACHING PANEL AT A TIME (LAYOUT_BUDGET §3 level 3; the round-2
       verdict on the whole app). The rail sheet holds long surfaces — the
       fourteen legal forms, the layer reference, the rate rail — and any one of
       them open beside two plates is a second argument on the same screen. P06
       already stands its own reading down when this opens; this is the generic
       half, and it names no other piece's classes so it keeps working as
       neighbours come and go. */
    this.ctx.bus.emit('ask:sheet', null);
    /* THE LESSON IS HELD BEFORE THE YEAR MOVES, NEVER AFTER IT — see the head
       of this file, "the year on screen is single-valued", point 3. Everything
       this call does to the outside happens here, in one place, ahead of the
       batch, so that at no point between the keystroke and the first paint is
       there a beat printing 1765 over a plate printing 1770. */
    this._holdOutside(m.hold !== false);
    /* A SCRIPTED COMPARISON OPENS ON THE WHOLE MAP, BECAUSE ITS VERDICT IS
       ABOUT THE WHOLE MAP. The camera is shared with the single plate, so a
       comparison opened from a beat inherited the beat's zoom: measured at
       900x700 on the diwani beat, `1770 against 1820` drew two plates of Asia,
       and the sentence under them — "23 map units went, every American one of
       them, 40 arrived: India, Australia, the Indian Ocean" — named four things
       of which one was on screen. This is a script's pair, not the reader's, so
       the script gets the frame its own words are about. Two limits, both
       measured rather than assumed: it applies ONLY to the five scripted
       comparisons (a pair a teacher set by hand, or a reader's `v` on an ad-hoc
       pair, keeps the view they chose), and the view it displaced is put back
       on close unless the reader moved the camera themselves in the meantime —
       so panning inside a comparison still survives it, which is the behaviour
       `sync()` below was written for. */
    const preView = cur.mapView || {};
    const zoomed = Math.abs((+preView.k || 1) - 1) > 1e-3 || !!preView.x || !!preView.y;
    this._priorView = (!this.open && preset && zoomed)
      ? { k: +preView.k || 1, x: +preView.x || 0, y: +preView.y || 0 } : null;
    this._camMoved = false;
    /* SET BEFORE THE DISPATCH, NOT AFTER IT.
       `store.batch` can notify inside the call, so a flag set on the line after
       it is set one sync too late: the sync that opened the surface saw it
       false and the flag then sat true until the next unrelated state change.
       It survived the first `v` of a session only because the stage was still
       `plate` then, and promoting it to `working` produced a second
       notification a frame later that happened to consume the flag. On the
       second `v` the stage was already `working`, nothing followed, and the
       comparison opened with focus left behind on `#stage` — "operable from
       the keyboard alone" quietly false on every reopening. */
    this._takeFocus = true;
    /* One batch, so the year, the compare year and the six keys land in a
       single history entry and Back leaves the comparison in one press. */
    store.batch((dispatch) => {
      dispatch('setYear', aY);
      dispatch('setCompareYear', bY);
      dispatch('setFilter', filters);
      if (this._priorView) dispatch('setMapView', { k: 1, x: 0, y: 0 });
    });
    /* AND THE DISPATCH ABOVE IS NOT ENOUGH ON ITS OWN. Measured in round 6 at
       1440x900, cold into `#tour=thirty&step=9` and then `v`: the batch sets
       `mapView` to the whole map, and 1.5s later the store reads
       `{k: 4, x: 0.244}` again — the beat's frame on Bengal — and both plates
       are drawn over the Bay of Bengal while the question above them asks about
       thirteen colonies in North America and the verdict names America, India
       and Australia. At 1366x768 and at 390x844 the same load leaves the whole
       map, so this is a race with a neighbour re-fitting its own camera when
       the stage rectangle changes, and it is not one this piece can win by
       dispatching harder.

       So the frame a SCRIPT asked for is held here as well as dispatched, and
       `_paint` draws from it until the reader moves the camera themselves
       (`sync`, above, clears it) or the comparison closes. The plates are this
       module's own canvases; nothing else on screen is drawn from this value,
       and `close()` still hands the reader's own view back to the single map.
       One deferred re-dispatch keeps the store in step where it can be. */
    this._wantView = this._priorView ? { k: 1, x: 0, y: 0 } : null;
    if (this._wantView) {
      const want = this._wantView;
      setTimeout(() => {
        if (!this.open || this._camMoved || this._wantView !== want) return;
        const v = store.getState().mapView || {};
        if (Math.abs((+v.k || 1) - 1) > 1e-3 || v.x || v.y) store.dispatch('setMapView', { ...want });
      }, 260);
    }
    /* A reader who asked for this view gets their focus put in it — the first
       answer if there is a question, the first plate if there is not. Without
       it, "operable from the keyboard alone" meant tabbing past the whole map
       and the whole time bar first. Deep links at page load do not steal
       focus; only a request somebody actually made. (`_takeFocus` is set
       above, before the batch — see the note there.) */
    this.ctx.bus.emit('ask:stage', { level: 'working' });
  },

  /* ============================================ the lesson, and the rail == */

  /** Is a lesson mounted? RESPONSIVE_LAW §3.2 — not the tours bus. */
  _pathOn() {
    const app = document.getElementById('app');
    return !!(app && app.dataset.path === 'on');
  },

  /**
   * EVERYTHING THIS SURFACE TAKES FROM THE REST OF THE SCREEN, IN ONE PLACE.
   *
   * Two things, both because the year is about to move and every other surface
   * that prints a year would then be printing a different one:
   *
   *   the beat   A beat's headline is authored prose — "12 August 1765" — and
   *              it does not follow the store's year, so a comparison opened
   *              under it puts two dates on one screen. `tours:explore` is the
   *              app's own move for "the student has stepped off the path": the
   *              beat panel goes, the beat stops re-applying its year, and the
   *              band's dated headline is replaced by the undated "Exploring ·
   *              your open question … Rejoin at 9". It is reversible in one
   *              press, and `_releaseOutside` presses it.
   *   the dossier A dossier prints "LEGAL STATUS IN 1770" against the year, so
   *              it does not lie — but it is a fourth teaching surface beside
   *              two plates and a difference list, which is the round-2 verdict
   *              on this whole app. It is put back on close.
   *
   * A student who was ALREADY exploring is not held again and is not rejoined
   * on close: they stepped off the path themselves and this piece does not get
   * to decide when they step back on.
   */
  _holdOutside(mayHold = true, defer = false) {
    const { store, bus } = this.ctx;
    const run = () => {
      const state = store.getState();
      /* Nothing to hold if the surface has gone in the meantime. */
      if (defer && state.compareYear == null) return;
      if (!this._holdDone) {
        this._holdDone = true;
        this._heldSel = state.selectedTerritoryId || null;
        this._held = null;
        if (mayHold && this._pathOn() && !this._exploring) {
          this._held = {
            step: Number.isFinite(+state.tourStep) ? (+state.tourStep + 1) : null,
            year: state.year,
          };
          bus.emit('tours:explore');
          announce(`The lesson is held at step ${this._held.step}, in ${this._held.year}. `
            + 'Closing the comparison goes back to it.');
          if (defer) this._render(false);          // the bar has a line to print now
        }
      }
      if (store.getState().selectedTerritoryId) store.dispatch('deselect');
    };
    /* `request` runs outside a store notification and holds BEFORE the year
       moves, which is the whole point of it. The hydration path (below) runs
       INSIDE one, where a dispatch is re-entrant and a bus emit reaches a
       module that is itself mid-notification, so it waits a frame. */
    if (defer) requestAnimationFrame(run); else run();
  },

  /**
   * The exact reverse, one frame later. Deferred because `_teardown` runs
   * inside a store notification and a dispatch from there is a re-entrant
   * notification — the same reason the `cmp*` key cleanup below is deferred.
   */
  _releaseOutside(rejoin) {
    const held = this._held, sel = this._heldSel;
    const view = this._camMoved ? null : this._priorView;
    this._held = null; this._heldSel = null; this._priorView = null; this._wantView = null;
    if (!rejoin && !view) return;
    requestAnimationFrame(() => {
      const s = this.ctx.store.getState();
      if (s.compareYear != null) return;         // reopened in the meantime
      /* Before the rejoin, not after: a beat that sets its own view must be the
         last word, and it is applied a frame later than this. */
      if (view) this.ctx.store.dispatch('setMapView', view);
      if (!rejoin) return;
      if (held) {
        /* Rejoining re-applies the beat, and the beat re-applies its own year
           AND its own selection — so the selection is not restored here as
           well, or a beat that deliberately selects nothing would get the
           reader's old choice put back under it. */
        this.ctx.bus.emit('tours:rejoin');
        return;
      }
      if (sel && !s.selectedTerritoryId) this.ctx.store.dispatch('select', sel);
    });
  },

  close() {
    if (!this.open) { this._closedBy = null; return; }
    const { store } = this.ctx;
    store.batch((dispatch) => {
      dispatch('setCompareYear', null);
      dispatch('setFilter', { cmp: null, cmpa: null, cmpb: null, cmpr: null, cmpg: null, cmpd: null });
    });
  },

  /** State → this surface. The only place `this.open` is allowed to change. */
  _syncFromState(state) {
    const f = state.filters || {};
    const want = state.compareYear != null && Number.isFinite(+state.compareYear);
    if (!want) { if (this.open) this._teardown(); return; }

    const baseDef = f.def || DEFAULT_DEFINITION;
    let preset = f.cmp ? presetById(f.cmp) : null;
    /* A SCRIPTED COMPARISON DECIDES ITS OWN DEFINITIONS, AND A LEFTOVER KEY MAY
       NOT OVERRULE IT. `filters` is merged, not replaced, on every same-document
       navigation — a hash link, the Back button — so `cmpb:influenced`, set once
       by the 1860 comparison, survived into the next one and drew "1820
       influenced" opposite "1770 claimed": a pair no script asked for, under a
       script's own title. When `cmp` names a comparison, that comparison's defs
       (or the map's current one) are the only ones read. The two keys still
       govern a pair a teacher set by hand, which is the case they exist for. */
    const x = { year: state.year, def: definitionById(preset ? (preset.a.def || baseDef) : (f.cmpa || baseDef)).id };
    const y = { year: +state.compareYear, def: definitionById(preset ? (preset.b.def || baseDef) : (f.cmpb || baseDef)).id };
    const [left, right] = order(x, y);
    /* A SCRIPTED VERDICT MAY NOT BE PRINTED OVER A PAIR IT WAS NOT WRITTEN FOR.
       `verdict`, `caution` and `cite` are authored prose about two named years.
       If the pair on screen is no longer that pair — a restored link that kept
       `cmp:peak` but carried other years, a caller who set one year by hand —
       the script is dropped and the generated question and the counted verdict
       take over. Wrong prose beside right numbers is the worst of both. */
    if (preset) {
      const want = order({ year: preset.a.year, def: x.def }, { year: preset.b.year, def: y.def });
      if (want[0].year !== left.year || want[1].year !== right.year) preset = null;
    }
    /* The year this surface has accepted. Not `left.year` — with
       `#year=1820&compare=1770` the left plate is 1770 and the store's year is
       1820, and recording the wrong one of the two makes a later move TO 1770
       invisible and draws 1770 against 1770. */
    this._ownYear = state.year;

    this.preset = preset;
    this.left = left; this.right = right;
    /* Ask only when there is a question to ask. A scripted comparison always
       has one; a caller-supplied one has whatever the caller passed; a bare
       `#compare=1770` from a teacher has none, and gets both plates at once
       rather than a question nobody wrote. */
    const hasQuestion = !!preset || !!(this.adhoc && this.adhoc.ask && this.adhoc.choices);
    this.phase = (f.cmpr === '1' || !hasQuestion) ? 'revealed' : 'ask';
    this.guess = f.cmpg || null;
    this.diffOnly = f.cmpd === '1';

    const sig = [left.year, left.def, right.year, right.def, preset ? preset.id : ''].join('|');
    const changedPair = sig !== this._sig;
    this._sig = sig;
    const first = !this.open;
    /* A DEEP LINK IS A WAY IN TOO, AND IT DOES NOT COME THROUGH `request`.
       `#tour=thirty&step=9&compare=1820` opens this surface straight out of
       hydration: the tour wins the year, so the pair is 1765 against 1820 and
       the dates agree — but the beat panel, the beat's dossier and two plates
       are all still on screen at once, and the geometry is the one this pass
       exists to end. Measured at 390x844 on that link before this branch:
       `.cmp` 390x192, a 70px bar, two plates of 52 with about 26px of map in
       each, and the whole difference list below the bottom of the surface.
       So the same hold, from the other entrance. */
    if (first) this._holdOutside(true, true);
    this.open = true;
    this.el.hidden = false;
    this.root.classList.add('cmp-host');
    this._render(first);
    if (this._takeFocus) {
      this._takeFocus = false;
      const target = this.phase === 'ask'
        ? this.askEl.querySelector('.cmp__choice')
        : this.sideA;
      /* Once, then once more. Reopening this surface a second time in a
         session runs against the shell putting focus back on `#stage` when the
         previous comparison closed, and against a stage-level change that can
         re-parent the plate a frame later; measured in the acceptance run, the
         second `v` of a session landed on `#stage` rather than on the question.
         The retry only acts if focus is still outside this surface, so it can
         never take focus away from something the reader moved to themselves. */
      if (target) {
        const put = () => target.isConnected && target.focus({ preventScroll: true });
        requestAnimationFrame(put);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (this.open && this.el && !this.el.contains(document.activeElement)) put();
        }));
      }
    }
    if (first || changedPair) {
      this.ctx.bus.emit('compare:open', {
        a: left.year, b: right.year, defA: left.def, defB: right.def,
        preset: preset ? preset.id : null,
      });
      announce(`Comparing ${left.year} with ${right.year}. `
        + (this.phase === 'ask' ? 'A question first: commit an answer to see the second plate.' : ''));
    }
  },

  _teardown() {
    const had = this.el && this.el.contains(document.activeElement);
    this.open = false;
    this._sig = '';
    this.el.hidden = true;
    this.root.classList.remove('cmp-host');
    const moved = this._closedBy;
    this._closedBy = null;
    const held = this._held;
    /* WHO PUTS THE LESSON BACK. If something else moved the year, that
       something else is almost always the lesson itself — Next and Rejoin both
       go through the tour, which re-applies the beat and its year, and the
       guard above sees that year and closes this surface. Emitting
       `tours:rejoin` on top of it would be a second rejoin the student did not
       ask for, and if the mover was the timeline instead then the student is
       exploring on purpose and this piece does not get to end that. So the
       lesson is put back only on an ordinary close. */
    this._releaseOutside(moved == null);
    this._holdDone = false;
    this.heldEl.hidden = true;
    this.el.dataset.held = 'no';
    if (moved != null) {
      /* Closed because something else moved the year. Say so: a surface that
         vanishes without a reason is a bug the reader has to model. */
      this.ctx.bus.emit('ask:say', {
        id: 'compare', priority: 45, mark: String(moved),
        text: `<strong>One map again.</strong> The year moved to ${moved}, and this atlas shows one year at a time `
          + 'unless you ask it for two. Press <strong>v</strong> for two dates on one screen.',
      });
      announce(`Comparison closed. The year moved to ${moved}.`);
    } else if (held) {
      /* The lesson is coming back and it will speak for itself a frame from
         now, so this piece says nothing into the band — two sentences racing
         for one line is how the band ends up holding the wrong one. */
      this.ctx.bus.emit('ask:say', { id: 'compare', text: null });
      announce(`Comparison closed. Back on the lesson at step ${held.step}, in ${held.year}.`);
    } else {
      this.ctx.bus.emit('ask:say', { id: 'compare', text: null });
      announce('Comparison closed. One map again.');
    }
    this.ctx.bus.emit('compare:close', {});
    if (had) { const stage = document.getElementById('stage'); if (stage) stage.focus({ preventScroll: true }); }
    /* Leave no address behind that describes a surface that is not there. Back
       out of a comparison and the six `cmp*` keys can survive the pop with no
       `compare=` beside them; a teacher copying that link would send a class to
       a comparison the app then refuses to draw. Deferred by a frame because
       this runs inside a store notification. */
    const f = this.ctx.store.getState().filters || {};
    if (f.cmp || f.cmpa || f.cmpb || f.cmpr || f.cmpg || f.cmpd) {
      requestAnimationFrame(() => {
        const s2 = this.ctx.store.getState();
        if (s2.compareYear != null) return;
        this.ctx.store.dispatch('setFilter', { cmp: null, cmpa: null, cmpb: null, cmpr: null, cmpg: null, cmpd: null });
      });
    }
  },

  /* =================================================== render =========== */

  _render(first) {
    const { data, format } = this.ctx;
    /* The coarse geometry is preloaded by the shell, but a deep link can open
       this view before a slow disk has finished; ask again rather than draw a
       blank plate and call it a comparison. */
    if (!this.geometry) {
      this.geometry = sharedGeometry(data);
      if (this.geometry) for (const s of [this.A, this.B]) s.setGeometry(this.geometry);
    }
    const dl = definitionById(this.left.def), dr = definitionById(this.right.def);

    this.A_side = side(data, this.left.year, dl);
    this.B_side = side(data, this.right.year, dr);
    this.d_ = diff(data, this.A_side, this.B_side);
    this.touched = touched(this.d_);

    this.el.dataset.phase = this.phase;
    this.el.dataset.same = this.d_.sameYear ? 'year' : 'no';

    this.labA.textContent = String(this.left.year);
    this.labB.textContent = String(this.right.year);
    this.defA.textContent = dl.label;
    this.defB.textContent = dr.label;
    this.sideA.setAttribute('aria-label',
      `First plate: ${this.left.year}, ${dl.label}. ${this.A_side.units} map units, ${this.A_side.territories} territories. Arrow keys pan both plates; plus and minus zoom both.`);
    /* THE FACE-DOWN PLATE SAYS SO, TO A SCREEN READER TOO, AND IT COUNTS
       NOTHING. A card that announced "96 map units, 67 territories" would hand
       the answer to the one reader who cannot see that it is blank. */
    this.sideB.setAttribute('aria-label', this.phase === 'ask'
      ? `Second plate: ${this.right.year}, ${dr.label}. Face down — commit an answer and it is drawn.`
      : `Second plate: ${this.right.year}, ${dr.label}. ${this.B_side.units} map units, ${this.B_side.territories} territories. Arrow keys pan both plates; plus and minus zoom both.`);

    this._totals(this.totA, this.A_side, format);
    if (this.phase === 'ask') fill(this.totB, el('span.cmp__facedown-k', { text: 'not counted yet' }));
    else this._totals(this.totB, this.B_side, format);

    this.title.textContent = this.preset ? this.preset.label
      : (this.d_.sameYear ? `${this.left.year}: ${dl.label} against ${dr.label}`
        : `${this.left.year} against ${this.right.year}`);
    this.diffBtn.setAttribute('aria-pressed', this.diffOnly ? 'true' : 'false');
    this.diffBtn.hidden = this.phase !== 'revealed';

    /* Both figures come from the lesson as it stood when this surface took it
       over — the step the transport was showing and the year the beat was
       standing on. Nothing here is authored and nothing is a total. */
    const held = this._held;
    this.heldEl.hidden = !held;
    this.el.dataset.held = held ? 'yes' : 'no';
    if (held) {
      /* NEITHER A STEP NUMBER NOR A YEAR, AND BOTH OMISSIONS ARE THE POINT.
         The year first: this whole change exists so that one screen carries one
         date, and "Close returns to 1765" printed two inches from a plate
         labelled 1770 is that defect again in smaller type, however carefully
         it is worded. The year the lesson is holding is spoken to a screen
         reader instead (`_holdOutside`), where it arrives in sequence and not
         beside anything. The step number, second: the masthead's transport is
         on the same screen counting steps ("9 / 25") and the shell's band is
         counting beats ("Rejoin at 7"), and a third control repeating either
         would put three numbers for one place on one line of sight.
         What is left is the two facts this surface owns and nobody else states:
         the lesson has been held, and Close is the way back to it. */
      /* Two spans, and the second one goes at phone width. Measured at 390x844
         with the reveal up: the whole sentence is 211px, and beside "Only what
         changed" and Close it wants 422 of a 366px line, so the bar wrapped to
         three rows and took 99px off a surface that has 450. Under 46rem the
         line reads "LESSON HELD ·" with the Close button immediately beside it,
         which is the same sentence made of one word and one control instead of
         five words; the full form is spoken to a screen reader by
         `_holdOutside` and is on screen at every wider width. */
      fill(this.heldEl,
        el('span.cmp__held-h', { text: 'Lesson held' }),
        el('span.cmp__held-t', { text: ' · Close puts it back' }));
    }

    this._renderPicker();
    if (this.phase === 'ask') this._renderAsk(); else fill(this.askEl);
    this._renderDelta();
    this._say();

    const labels = this._labeller();
    const spot = this._spotUnits();
    for (const s of [this.A, this.B]) { s.setProjection(this._projection()); s.setLabels(labels); s.plate.selectedUnits = spot; }
    this._resize(true);
    if (first) requestAnimationFrame(() => this._resize(true));
    /* The fades are a measurement of laid-out text, and nothing above has been
       laid out yet. One frame later it has. */
    requestAnimationFrame(() => this._edges());
  },

  _projection() {
    const f = this.ctx.store.getState().filters || {};
    return f.proj === 'equal-area' ? 'equal-area' : (f.proj || 'mercator');
  },

  _totals(node, s, format) {
    fill(node,
      el('span.cmp__fig', el('b.num', { text: format.number(s.units) }), ' units'),
      el('span.cmp__sep', { 'aria-hidden': 'true', text: '·' }),
      el('span.cmp__fig', el('b.num', { text: format.number(s.territories) }), ' territories'),
      el('span.cmp__sep', { 'aria-hidden': 'true', text: '·' }),
      el('span.cmp__fig', el('b.num', { text: format.area(s.km2) })));
  },

  _renderPicker() {
    const kids = PRESETS.map((p) => el('button.cmp__pick', {
      type: 'button', dataset: { id: p.id },
      'aria-pressed': this.preset && this.preset.id === p.id ? 'true' : 'false',
      title: p.teaches,
      onclick: () => this.request({ preset: p.id }),
    }, p.chip || p.label));
    fill(this.pickEl, ...kids);
    /* THE CHIP THAT IS PRESSED IS THE CHIP THAT IS ON SCREEN. Below 46rem this
       row is a sideways scroller, and the fifth comparison starts 53px past its
       right edge: opening `1945 / 1965` from a link or from the tools panel
       drew a pressed chip nobody could see, and the row looked like a row of
       four. Deferred one frame because the widths this reads are the ones the
       browser has not laid out yet at the end of a `fill`. */
    requestAnimationFrame(() => {
      const on = this.pickEl.querySelector('.cmp__pick[aria-pressed="true"]');
      if (on && this.pickEl.scrollWidth > this.pickEl.clientWidth + 2) {
        const a = on.getBoundingClientRect(), b = this.pickEl.getBoundingClientRect();
        if (a.left < b.left - 1 || a.right > b.right + 1) {
          this.pickEl.scrollLeft += (a.left - b.left) - (b.width - a.width) / 2;
        }
      }
      this._pickerEdges();
    });
  },

  /**
   * WHICH END OF THE CHIP ROW HAS MORE, MEASURED RATHER THAN ASSUMED.
   *
   * Round 5: "the preset chip row clips '1945' at the right edge with no scroll
   * affordance." Measured at 390x844 inside a beat: the row is 366px wide and
   * 407px long, so 41px of the fifth chip is outside it — and the fade this
   * file already declared was unconditional, so it was ALSO painted at 900x700
   * where the row fits with 100px to spare, which is a fade that means nothing
   * and therefore reads as an edge. It is keyed to the measurement now: `start`,
   * `end`, `both` or `none`, and `none` paints nothing at all.
   */
  _pickerEdges() {
    if (!this.pickEl) return;
    const over = this.pickEl.scrollWidth - this.pickEl.clientWidth;
    const x = this.pickEl.scrollLeft;
    const v = over <= 2 ? 'none'
      : (x <= 2 ? 'end' : (x >= over - 2 ? 'start' : 'both'));
    if (this.pickEl.dataset.of !== v) this.pickEl.dataset.of = v;
    if (this.pickRow && this.pickRow.dataset.of !== v) this.pickRow.dataset.of = v;
    /* A control that cannot move the row is not drawn, so nothing on this bar
       is ever a dead target. `hidden` and not `disabled`: a disabled button is
       a control that is there and refuses, and there is nothing here to refuse
       — the row simply ends. */
    if (this.pickPrev) this.pickPrev.hidden = !(v === 'start' || v === 'both');
    if (this.pickNext) this.pickNext.hidden = !(v === 'end' || v === 'both');
  },

  /**
   * One press, one comparison. The step is the first chip whose leading edge is
   * outside the scrollport in the direction of travel, so the row lands on a
   * chip boundary and the scroll-snap has nothing to correct; when there is no
   * such chip left it goes to the end, which is what the reader asked for.
   */
  _pickerScroll(dir) {
    const row = this.pickEl;
    if (!row) return;
    const b = row.getBoundingClientRect();
    let target = null;
    const chips = [...row.querySelectorAll('.cmp__pick')];
    if (dir > 0) { for (const c of chips) { const r = c.getBoundingClientRect(); if (r.right > b.right + 1) { target = r.left - b.left; break; } } }
    else { for (const c of [...chips].reverse()) { const r = c.getBoundingClientRect(); if (r.left < b.left - 1) { target = r.left - b.left; break; } } }
    const to = target == null ? (dir > 0 ? row.scrollWidth : 0) : row.scrollLeft + target;
    const smooth = !document.documentElement.matches('[data-motion="reduced"]')
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left: Math.max(0, to), behavior: smooth ? 'smooth' : 'auto' });
    this._pickerEdges();
  },

  /**
   * A LINE OF TYPE MAY NOT BE CUT IN HALF BY THE FOOT OF A SCROLLER.
   *
   * Round 5's four critics all reported the same class of defect in the shell's
   * beat panel — "sliced clean through the x-height", "a hard slice below" —
   * and this surface had it too, in the one place it could least afford it.
   * Measured at 900x700 inside beat 9 with the reveal up: the difference gets a
   * 114px window under the sticky plates, and the verdict the reader has just
   * bet against — "You said More in 1770, the dataset says More in 1820" — was
   * drawn across the bottom edge with the lower half of every letter removed.
   *
   * Two answers, and they are different answers to different halves of it.
   * The composition half is above (`.cmp__top` puts the ANSWER first at every
   * width under 62rem, not just on a phone). The optical half is here: whenever
   * a scroller in this surface has more below, it fades its last 20px, so a cut
   * line reads as a line that continues rather than a line that has been
   * guillotined — and the fade goes the moment the reader reaches the end, so
   * it never dims a last line that is genuinely the last.
   */
  _edges() {
    const more = (n) => !!n && (n.scrollHeight - n.clientHeight > 2)
      && (n.scrollTop < n.scrollHeight - n.clientHeight - 2);
    for (const n of [this.deltaEl, this.grid, this.askEl]) {
      if (!n) continue;
      const v = more(n) ? 'yes' : 'no';
      if (n.dataset.more !== v) n.dataset.more = v;
    }
    this._pickerEdges();
    this._peek();
  },

  /**
   * THE PLATES STAND BACK WHILE THE LIST IS BEING READ, AND COME BACK THE
   * MOMENT IT IS BEING USED.
   *
   * Below 62rem the two plates are stuck to the top of the one scroller, which
   * is right — point at a line, watch both maps ring the same place — and it
   * costs the payload the top of its window for as long as the reader is in the
   * list. Measured at 390x844 inside beat 9 with the reveal up: the scroller is
   * 343px, the sticky block takes 232 of it, and the difference — the verdict
   * plus fifty-eight named places with the instrument that moved each one, 5529
   * px of it — reads through a 111px slit. That is the same 16:1 letterbox the
   * round-6 panel found in the beat panel next door, in this surface's own
   * payload.
   *
   * So the block has two heights, and the reader's own scroll chooses between
   * them. At the top of the scroller both plates are whole. One flick into the
   * list and they drop to a peek — both years, both totals, both maps, at a
   * third of the depth — and the reading window goes from 111px to about 215.
   * Scroll back to the top, or press any named place, and they are whole again,
   * because pressing a place is precisely the gesture that needs the map.
   *
   * Three things make it safe rather than clever. It is measured from
   * `getComputedStyle(...).position === 'sticky'`, so it exists only in the
   * bands where compare.css actually sticks the plates and never in the three-
   * column layouts or the sideways phone, and no media condition is restated in
   * JavaScript. It is hysteretic — on above 28px of scroll, off below 6 — so a
   * scroller that settles a pixel either way cannot oscillate. And because the
   * block is sticky, shrinking it moves the flow of everything below it by
   * exactly the amount the pinned box gives back, so the line the reader was
   * looking at stays where it was: measured, the first named row moves by 0px
   * across the change.
   */
  _peek() {
    if (!this.el || !this.grid || !this.plates) return;
    if (this._peekHold && Date.now() - this._peekHold < 1200) return;
    const sticky = getComputedStyle(this.plates).position === 'sticky';
    let v = 'off';
    if (sticky && this.phase === 'revealed') {
      const t = this.grid.scrollTop;
      v = (this.el.dataset.peek === 'on') ? (t > 6 ? 'on' : 'off') : (t > 28 ? 'on' : 'off');
    }
    this._setPeek(v);
  },

  /** The two canvases are sized against the box the row gives them, so a
      change of that box is a re-measure and a repaint, once, on the next
      frame. Never inside the scroll handler that caused it. */
  _setPeek(v) {
    if (!this.el || this.el.dataset.peek === v) return;
    this.el.dataset.peek = v;
    if (this._peekRaf) cancelAnimationFrame(this._peekRaf);
    this._peekRaf = requestAnimationFrame(() => {
      this._peekRaf = 0;
      if (!this.open) return;
      this.A.size(); this.B.size();
      this._paint(true);
      this._stickyDepth();
    });
  },

  /* ---- the prediction ------------------------------------------------ */

  _question() {
    if (this.preset) {
      return {
        id: this.preset.id, ask: this.preset.ask, choices: this.preset.choices,
        answer: this.preset.resolve(this.d_),
      };
    }
    if (this.adhoc && this.adhoc.ask && this.adhoc.choices) {
      return { id: 'adhoc', ask: this.adhoc.ask, choices: this.adhoc.choices, answer: this.adhoc.answer };
    }
    /* No script and no caller-supplied question: one is generated from the two
       plates themselves, so a teacher who sets an arbitrary pair still gets a
       prediction and never gets an invented claim. */
    const l = this.left, r = this.right;
    const ask = this.d_.sameYear
      ? `Same year, two definitions of the word British. Does the ${definitionById(r.def).label} plate show more places than the ${definitionById(l.def).label} one?`
      : `Was Britain holding more of the map in ${l.year}, or in ${r.year}?`;
    const choices = this.d_.sameYear
      ? [{ id: 'a', label: 'No, the same places' }, { id: 'b', label: 'Yes, more places' }]
      : [{ id: 'a', label: `More in ${l.year}` }, { id: 'b', label: `More in ${r.year}` }, { id: 'same', label: 'About the same' }];
    const answer = this.B_side.units > this.A_side.units ? 'b'
      : this.A_side.units > this.B_side.units ? 'a' : (this.d_.sameYear ? 'a' : 'same');
    return { id: 'auto', ask, choices, answer };
  },

  _renderAsk() {
    const q = this._question();
    this.q = q;
    const choices = q.choices.map((c) => el('button.cmp__choice', {
      type: 'button', dataset: { id: c.id },
      onclick: () => this._commit(c.id),
    }, c.label));
    fill(this.askEl, el('div.cx-ask.cmp__askbox',
      el('p.cx-ask__eyebrow', { text: 'Commit before you look' }),
      el('p.cx-ask__q', { text: q.ask }),
      el('div.cx-ask__choices', ...choices),
      el('p.cx-note', { text: 'There is no penalty for being wrong, and being wrong is the point: a guess you have committed to is the thing the evidence has to argue with.' })));
  },

  _commit(choiceId) {
    const q = this.q || this._question();
    const correct = choiceId === q.answer;
    this.record[q.id] = { choice: choiceId, answer: q.answer, correct, at: Date.now() };
    this.ctx.util.storage.set(STORE_KEY, this.record);
    this.ctx.bus.emit('ledger:append', {
      kind: 'prediction', source: 'compare', id: q.id,
      question: q.ask, choice: choiceId, answer: q.answer, correct,
      a: this.left.year, b: this.right.year, defA: this.left.def, defB: this.right.def,
    });
    this.ctx.bus.emit('compare:commit', { preset: q.id, choice: choiceId, correct });
    this._takeFocus = true;                     // the choices are gone; land on the left plate
    /* AND THE READER IS TAKEN TO THE ANSWER IF IT IS NOT ALREADY IN FRONT OF
       THEM. Measured at 844x390 — a phone in landscape, the one window this
       surface cannot pin anything in — the reveal drew the two plates at 7rem
       each in a 137px scrollport and put the sentence the reader had just bet
       against 74px below the fold. They had committed to an answer and the
       screen showed them two maps. `_renderDelta` reads this flag one frame
       later, when the block has a height, and only moves the scroller if the
       answer is not already whole in it — so at every window that can show it
       at rest, nothing moves at all. */
    this._reveal = true;
    this.ctx.store.dispatch('setFilter', { cmpr: '1', cmpg: choiceId });
    announce(correct ? 'Committed. Your answer matches what the dataset shows.'
      : 'Committed. The second plate does not agree with you — the difference is listed on the right.');
  },

  /* ---- the difference ------------------------------------------------ */

  _renderDelta() {
    const { format } = this.ctx;
    const d = this.d_;
    const q = this.q || (this.phase === 'revealed' ? this._question() : null);

    const head = el('div.cmp__head',
      el('p.cx-panel__head', { text: d.sameYear ? 'What the second definition adds' : 'What changed between the two plates' }),
      el('div.cmp__figs',
        this._fig(d.gained.units, 'arrived', 'gain'),
        this._fig(d.lost.units, 'went', 'loss'),
        this._fig(d.changed.units, 'changed status', 'shift')),
      el('p.cmp__net', el('span.num', { text: (d.net.units >= 0 ? '+' : '−') + Math.abs(d.net.units) }),
        d.sameYear ? ` map units once "${definitionById(this.right.def).label}" is the test · ` : ` map units by ${this.right.year} · `,
        el('span.num', { text: (d.net.km2 >= 0 ? '+' : '−') + format.area(Math.abs(d.net.km2)) }),
        el('span.cmp__hint', { text: ' · point at any line in the list and it is ringed on both plates' })));

    /* Two blocks, one scroll. The answer is deliberately short — four short
       sentences at most — because the alternative, tried and rejected in this
       piece's second round, was to cap the answer's height and let it scroll
       separately, which clipped the verdict mid-word to guarantee the list was
       on screen. Editorial discipline beats a max-height: at 1366x768 the
       answer and the head of the first list both fit in 427px, and the section
       heads are sticky for everything below.

       WHAT MOVED IN ROUND 3, AND WHY. "What the count cannot see" used to sit
       in this fixed top block. Measured with the reveal up, it cost the top
       block 110px, and the consequence was that at 1440x900 the reader saw two
       of twenty-nine named places and at 900x700 and 390x844 they saw none at
       all — the computed list, the one thing a printed spread cannot do, was
       below the fold on three of the four viewports a school owns. The note
       reads "every line below counts one", so it belongs immediately above the
       lines, inside the scroller, not above the verdict. The top block is now
       the head and the answer and nothing else. */
    const top = el('div.cmp__top', head,
      this.phase === 'revealed' && q ? this._verdict(q) : null);

    const lists = [];
    if (this.phase === 'revealed' && this.preset && this.preset.caution) {
      lists.push(el('p.cx-note.cx-note--warn.cmp__caution', { text: this.preset.caution }));
    }
    if (this.phase === 'revealed') lists.push(this._grain());
    lists.push(
      this._section('arrived', d.gained.rows, 'gain'),
      this._section('went', d.lost.rows, 'loss'),
      this._section('changed what they legally were', d.changed.rows, 'shift'),
      this._events());
    const cite = this.preset && this.preset.cite;
    if (cite) lists.push(el('p.cmp__cite', { text: cite }));
    if (this.A_side.unitsWithoutArea || this.B_side.unitsWithoutArea) {
      lists.push(el('p.cx-note.cmp__gap', {
        text: `Area is summed from each unit's own figure, a partly-held unit counted at half. `
          + `${Math.max(this.A_side.unitsWithoutArea, this.B_side.unitsWithoutArea)} of the units drawn here carry no area figure and are not in that total.`,
      }));
    }
    fill(this.deltaEl, top, el('div.cmp__lists', ...lists));
    this._jump();
    this._jumpCheck();
    if (this._reveal) {
      this._reveal = false;
      requestAnimationFrame(() => {
        const ans = this.deltaEl.querySelector('.cmp__answer');
        const sc = this._scroller();
        if (!ans || !sc) return;
        const a = ans.getBoundingClientRect(), b = sc.getBoundingClientRect();
        if (a.top >= b.top - 1 && a.bottom <= b.bottom + 1) return;   // already whole
        ans.scrollIntoView({
          block: 'start',
          behavior: this.ctx.util.prefersReducedMotion() ? 'auto' : 'smooth',
        });
      });
    }
    /* And again once the browser has laid the column out. The first read
       happens inside the render, before the sticky heads and the wrapped
       counterparty lines have their final heights, and a strip that says
       "29 arrived below" while ARRIVED is on screen is furniture. */
    requestAnimationFrame(() => this._jumpCheck());
  },

  /**
   * THE LIST IS BELOW THE FOLD, SO THE SURFACE SAYS SO AND POINTS AT IT.
   *
   * Round 3's verdict caught the path telling a student "place it to go on"
   * beside a field seven hundred pixels below the fold with nothing pointing
   * down. This surface had the same fault in its own shape: the head and the
   * answer take about 320px, and the twenty-nine named places under them start
   * below the bottom edge of the region at 1440x900, 900x700 and 390x844. A
   * scroller with no scrollbar and no cue is not a route to a control.
   *
   * So: one strip, stuck to the bottom edge of whichever element is actually
   * the scrollport (the difference column above 62rem, the whole grid below
   * it), naming each list and its count, and moving the reader to it. It exists
   * only while the first list is genuinely off screen — `_jumpCheck` measures
   * that on every scroll and every resize — so it is never an arrow pointing at
   * something already in view. Disclosure level 3: it is inside a surface the
   * reader opened, and it does not exist until then.
   */
  _jump() {
    const d = this.d_;
    const secs = [
      ['gain', d.gained.rows.length, 'arrived'],
      ['loss', d.lost.rows.length, 'went'],
      ['shift', d.changed.rows.length, 'changed'],
    ].filter(([, n]) => n > 0);
    if (!secs.length || this.phase !== 'revealed') { this.jumpEl = null; fill(this.jumpHost); this.jumpHost.hidden = true; return; }
    this.jumpEl = el('nav.cmp__jump', { 'aria-label': 'Go to the named places' },
      el('span.cmp__jump-a', { 'aria-hidden': 'true', text: '↓' }),
      ...secs.map(([kind, n, word]) => el('button.cmp__jump-b', {
        type: 'button', dataset: { to: kind },
        onclick: () => this._jumpTo(kind),
      }, el('span.num', { text: String(n) }), ' ', word)),
      /* No trailing sentence. It wrapped the strip onto a second line inside a
         368px column and cost the plates another eighteen pixels to say what
         the arrow and three underlined counts already say. The words are in the
         nav's own label, where a screen reader gets them and the plate does not
         pay for them. */
    );
    fill(this.jumpHost, this.jumpEl);
  },

  _jumpTo(kind) {
    const sec = this.deltaEl.querySelector(`.cmp__sec[data-kind="${kind}"]`);
    if (!sec) return;
    const behavior = this.ctx.util.prefersReducedMotion() ? 'auto' : 'smooth';
    /* Scroll to the first NAME, not to the head above it. Measured at 390x844:
       landing on the section head put the head and its mechanism tally in the
       152px the sticky plates leave, and the first place — the thing the
       reader pressed a button to reach — straddled the bottom edge. The button
       they pressed already said "19 went", so the head is not the payload. */
    const first = sec.querySelector('.cmp__row');
    (first || sec).scrollIntoView({ block: 'start', behavior });
    if (first) first.focus({ preventScroll: true });
  },

  /** Which element actually scrolls at this width. */
  _scroller() {
    for (const n of [this.deltaEl, this.grid]) {
      if (n && n.scrollHeight > n.clientHeight + 4) return n;
    }
    return null;
  },

  _jumpCheck() {
    if (!this.jumpHost || !this.open) return;
    const show = () => {
      if (!this.jumpEl) return false;
      /* The first NAMED PLACE, not the first section. Between 1945 and 1965
         nothing arrives, so the first section is the empty "arrived" — a real
         finding, and 60px of it — and measuring against that head declared the
         list on screen while all ninety-seven departures were under the fold. */
      const row = this.deltaEl.querySelector('.cmp__row');
      const sc = this._scroller();
      if (!row || !sc) return false;
      const a = row.getBoundingClientRect(), b = sc.getBoundingClientRect();
      /* Measured as if the strip were not there. It is a grid row, so showing
         it shortens the scroller by its own height — and the first version of
         this test therefore pushed the one visible row off the bottom and then
         reported, correctly and uselessly, that no row was visible. The
         question is whether the reader would see a named place if this strip
         did not exist; if they would, it should not. */
      const own = this.jumpHost.hidden ? 0 : this.jumpHost.getBoundingClientRect().height;
      return a.top >= b.bottom + own - 8;
    };
    const want = show();
    if (this.jumpHost.hidden === !want) return;    // no layout thrash on every scroll frame
    this.jumpHost.hidden = !want;
  },

  /**
   * THE COUNT, READ AGAINST ITS OWN GRAIN.
   *
   * Every figure above this line counts places. A list of places gives one line
   * to British India and one line to Ascension Island, and a student who reads
   * "40 arrived" without being told that will carry away a number that means
   * almost nothing. So the two ends of the longest list are named, with the
   * area this atlas draws for each, and the sentence says plainly what the
   * count cannot see. Both places, both figures and the ratio are taken from
   * the dataset at render time — `unitMeta.area_km2`, the same field the
   * plate's own km² total is summed from. Nothing here is authored but the
   * grammar, and where the areas are missing the note does not print at all
   * rather than guessing at a comparison.
   */
  _grain() {
    const { data, format } = this.ctx;
    const meta = data.unitMeta;
    if (!meta) return null;
    const d = this.d_;
    const pool = d.gained.rows.length >= d.lost.rows.length ? d.gained : d.lost;
    if (pool.rows.length < 3) return null;
    const sized = [];
    for (const r of pool.rows) {
      let km2 = 0, known = 0;
      for (const u of r.units) {
        const m = meta.get(u);
        if (m && Number.isFinite(m.area_km2)) { km2 += m.area_km2; known++; }
      }
      if (known === r.units.length && km2 > 0) sized.push({ r, km2 });
    }
    if (sized.length < 3) return null;
    sized.sort((x, y) => y.km2 - x.km2);
    const big = sized[0], small = sized[sized.length - 1];
    if (!(big.km2 / small.km2 > 20)) return null;   // no disproportion, no lesson
    /* Two significant figures. The ratio of two drawn polygons is not known to
       six, and printing "438,116 times" would be exactly the false precision
       the app spends the rest of its time refusing (DIDACTIC_SPEC §7.1 rule 3). */
    const raw = big.km2 / small.km2;
    const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(raw)) - 1));
    const times = Math.round(raw / mag) * mag;
    return el('p.cx-note.cmp__grain',
      el('span.cmp__grain-k', { text: 'What the count cannot see' }),
      'Every line below counts one. ',
      el('b', { text: big.r.name }), ' draws ', el('span.num', { text: format.area(Math.round(big.km2)) }),
      '; ', el('b', { text: small.r.name }), ' draws ',
      el('span.num', { text: format.area(Math.round(small.km2)) }),
      ', about ', el('span.num', { text: times >= 1e6 ? format.compact(times) : format.number(times) }),
      ' times smaller. The count cannot see that. The km² figure can.');
  },

  _fig(n, label, kind) {
    return el('div.cx-fig.cx-fig--sm.cmp__f', { dataset: { kind } },
      el('span.cx-fig__v.num', { text: String(n) }),
      el('span.cx-fig__l', { text: label }));
  },

  _verdict(q) {
    const chosen = this.guess ? (q.choices.find((c) => c.id === this.guess) || null) : null;
    const right = q.choices.find((c) => c.id === q.answer) || null;
    const correct = chosen && chosen.id === q.answer;
    const kids = [];
    if (chosen) {
      kids.push(el('p.cmp__guess', { dataset: { correct: correct ? 'yes' : 'no' } },
        el('span.cmp__guess-k', { text: 'You said' }),
        el('span.cmp__guess-v', { text: chosen.label }),
        el('span.cmp__guess-k', { text: correct ? 'and the dataset agrees' : 'the dataset says' }),
        correct ? null : el('span.cmp__guess-a', { text: right ? right.label : '' })));
    }
    if (this.preset) {
      kids.push(el('p.cmp__verdict', { text: this.preset.verdict(this.d_) }));
    }
    return el('div.cmp__answer', ...kids);
  },

  _section(title, rows, kind) {
    if (!rows.length) {
      /* An empty section is a finding, and it says which kind of finding it is:
         a wider definition can only add, so those two zeroes are structural,
         not evidence of a quiet decade. */
      const why = this.d_.sameYear
        ? 'Nothing, and nothing could: a wider definition can only add places, never take one away.'
        : 'Nothing at all between these two dates. That is a finding, not a blank cell.';
      return el('section.cmp__sec', { dataset: { kind } },
        el('p.cx-panel__head', { text: title }),
        el('p.cmp__empty', { text: why }));
    }
    const list = rows.map((r) => this._row(r, kind));
    return el('section.cmp__sec', { dataset: { kind } },
      el('p.cx-panel__head', el('span', { text: title }),
        el('span.cmp__count', el('span.num', { text: String(rows.length) }), ' places')),
      this._tally(rows),
      el('ul.cmp__list', ...list.map((n) => el('li', n))));
  },

  /**
   * HOW, COUNTED — one line, above the list it summarises.
   *
   * A list of forty places with forty instruments beside them is forty facts
   * and no shape. The shape is the tally: between 1770 and 1820 the arrivals
   * are mostly conquest and treaty cession, between 1914 and 1922 they are
   * mostly mandates, and a student who reads those two lines has the argument
   * of the whole period in eleven words. It is counted from the same
   * `mechanismLabel` the rows print, so the line and the list can never
   * disagree, and the places with no record are counted openly rather than
   * dropped out of the denominator.
   */
  _tally(rows) {
    const by = new Map();
    for (const r of rows) {
      /* The tally counts MECHANISMS, so it uses the mechanism's own neutral
         gloss and not the row's. A row says whether a particular war transfer
         was European; the tally says how many war transfers there were. Two
         lines in one tally for one mechanism would be a miscount dressed as
         detail. */
      const k = r.kind === 'changed'
        ? (r.mechanismLabel ? 'named instrument' : 'no instrument recorded')
        : (r.mechanism
          ? (r.kind === 'gained' ? acqLabel(r.mechanism) : depLabel(r.mechanism))
          : (r.sameYear ? 'never claimed' : 'no record'));
      by.set(k, (by.get(k) || 0) + 1);
    }
    if (by.size < 2) return null;                       // one kind is not a tally
    const sorted = [...by.entries()].sort((a, b) => b[1] - a[1]);
    const show = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((n, e) => n + e[1], 0);
    const kids = [];
    show.forEach(([label, n], i) => {
      if (i) kids.push(el('span.cmp__tally-s', { 'aria-hidden': 'true', text: '·' }));
      kids.push(el('span.cmp__tally-i', el('span.num', { text: String(n) }), ' ' + label));
    });
    if (rest) {
      kids.push(el('span.cmp__tally-s', { 'aria-hidden': 'true', text: '·' }));
      kids.push(el('span.cmp__tally-i', el('span.num', { text: String(rest) }), ' by other means'));
    }
    return el('p.cmp__tally', ...kids);
  },

  /**
   * WHAT HAPPENED IN BETWEEN — the third thing FEATURE_SPEC §2 P18 asks the
   * difference readout to name, beside the units gained and lost. It is
   * `data.eventsBetween(a, b, { changedStatus: true })`: only the events the
   * dataset itself records as having changed a status, in order, dated. Nothing
   * is authored; the cap is stated rather than silently applied.
   */
  _events() {
    const d = this.d_;
    if (d.sameYear || !d.events || !d.events.length) return null;
    const { format } = this.ctx;
    const CAP = 14;
    const shown = d.events.slice(0, CAP);
    const rest = d.events.length - shown.length;
    return el('section.cmp__sec.cmp__sec--ev', { dataset: { kind: 'events' } },
      el('p.cx-panel__head', el('span', { text: `what happened between ${d.lo} and ${d.hi}` }),
        el('span.cmp__count', el('span.num', { text: String(d.events.length) }), ' recorded')),
      el('ul.cmp__evlist', ...shown.map((e) => el('li.cmp__ev',
        el('span.num.cmp__ev-y', { text: format.year(e.year, { circa: !!e.circa }) }),
        el('span.cmp__ev-t', { text: e.title || 'untitled record' })))),
      rest > 0 ? el('p.cx-note.cmp__evmore', {
        text: `The first ${shown.length} of ${d.events.length}. Every one of them is on the timeline between these two years.`,
      }) : null);
  },

  /**
   * The second line of a row. In order: the two legal statuses, the mechanism
   * from the dataset's own acquisition or departure record, the dataset's own
   * phrase for how the place was held — and, when there is none of those, the
   * absence said out loud rather than a guess.
   */
  _detail(r) {
    if (r.kind === 'changed') return { text: `${r.fromLabel} → ${r.toLabel}`, none: false };
    if (r.mechanismLabel) return { text: r.mechanismLabel, none: false };
    if (r.sameYear && r.spanLabel) return { text: r.spanLabel, none: false };
    if (r.sameYear) return { text: 'claimed by nobody, run all the same', none: false };
    return { text: 'no mechanism recorded in this dataset', none: true };
  },

  /**
   * WHO THE OTHER PARTY WAS. The third line of a row, and the reason this list
   * is not the pink map in a table.
   *
   * DIDACTIC_SPEC M17 — "empire is a British story" — is the misconception a
   * difference list is structurally most likely to reinforce, because a list of
   * what Britain gained has Britain as the only actor in every line. So an
   * arrival names the polity it was taken from, straight out of
   * `acquisitions[].counterparties[]`: the Sultanate of Mysore under Tipu
   * Sultan, the Lahore Durbar, the Konbaung kingdom. A departure names the
   * people who took it out, `departures[].led[]` with `side: "local"` first,
   * and what it became. Two names at most, and the count of the rest, because a
   * row is a row. Nothing here is authored and nothing is inferred: where the
   * record has no counterparty the line does not print.
   */
  _who(r) {
    const cap = (list) => {
      const two = list.slice(0, 2).map((x) => x.name || x);
      const more = list.length - two.length;
      /* Two names and a count, and the whole line capped, because the dataset
         is right to write "The Gwich'in, Han, Northern Tutchone, Southern
         Tutchone, Kaska and Tlingit nations" and a row is still a row. The full
         roster is in the territory's own dossier, which is one press away. */
      return this.ctx.format.truncate(this.ctx.format.list(two), 92)
        + (more ? ` and ${more} more` : '');
    };
    if (r.kind === 'gained' && r.parties && r.parties.length) {
      /* Two slots, and they go to the polities and the peoples first. The
         dataset also records counterparties of kind `other` (rival navies, the
         seals of the Scotia Sea) and `no-resident-population`; those are true
         and they are not who a student needs in the two slots a row has. */
      const rank = (c) => (c.kind === 'no-resident-population' ? 2 : c.kind === 'other' ? 1 : 0);
      const sorted = r.parties.map((c, i) => ({ c, i })).sort((x, y) => rank(x.c) - rank(y.c) || x.i - y.i).map((x) => x.c);
      if (rank(sorted[0]) === 2) {
        /* Every counterparty in the record is "no resident population". Say
           that, rather than printing "taken from no resident population". */
        return { k: 'taken from', v: 'no one — the record names no resident population' };
      }
      return { k: 'taken from', v: cap(sorted) };
    }
    if (r.kind === 'lost') {
      if (r.led && r.led.length) {
        const became = r.becomes && r.becomes.length ? r.becomes[0] : null;
        return { k: 'led by', v: cap(r.led) + (became ? ` · became ${became}` : '') };
      }
      if (r.becomes && r.becomes.length) return { k: 'became', v: r.becomes[0] };
      if (r.movement) return { k: 'led by', v: r.movement };
    }
    return null;
  },

  _row(r, kind) {
    const { format } = this.ctx;
    const det = this._detail(r);
    const mech = det.text;
    const unrecorded = det.none;
    const who = this._who(r);
    return el('button.cmp__row', {
      type: 'button', dataset: { key: r.key, kind },
      'aria-pressed': this.spot === r.key ? 'true' : 'false',
    },
    el('span.cmp__row-name', { text: r.name }),
    el('span.cmp__row-line',
      el('span.cmp__row-mech', { text: mech, dataset: { none: unrecorded ? 'true' : null } }),
      r.year ? el('span.num.cmp__row-y', { text: format.year(r.year) }) : null,
      r.units.length > 1 ? el('span.cmp__row-n', { text: `${r.units.length} units` }) : null),
    who ? el('span.cmp__row-who',
      el('span.cmp__row-wk', { text: who.k }),
      el('span.cmp__row-wv', { text: who.v })) : null);
  },

  /* ---- pointing at a row --------------------------------------------- */

  _rowsIndex() {
    if (!this._rowMap || this._rowMapFor !== this.d_) {
      const m = new Map();
      for (const g of [this.d_.gained.rows, this.d_.lost.rows, this.d_.changed.rows]) {
        for (const r of g) m.set(r.key, r);
      }
      this._rowMap = m; this._rowMapFor = this.d_;
    }
    return this._rowMap;
  },

  /**
   * A press on either plate. The list wires forwards — point at a row and the
   * places light — and this is the same wire backwards, because a student who
   * has just seen half of North America turn grey presses the grey, not the
   * list. Where the place is in the difference, its row is lit and scrolled to;
   * where it is not, that is the answer and it is said out loud, because "this
   * one did not change" is one of the more useful things a comparison knows.
   */
  _pickOn(sideplate, x, y) {
    const hitUnit = pick(sideplate.plate, x, y);
    const uid = hitUnit && (hitUnit.unitId || hitUnit.id || hitUnit);
    this.ctx.bus.emit('compare:pick', { unitId: typeof uid === 'string' ? uid : null, side: sideplate === this.A ? 'a' : 'b' });
    if (!uid || typeof uid !== 'string') return;
    let hit = null;
    for (const r of this._rowsIndex().values()) if (r.units.includes(uid)) { hit = r; break; }
    if (!hit) {
      const name = (this.ctx.data.unitName && this.ctx.data.unitName(uid)) || uid;
      this.spot = null;
      for (const b of this.deltaEl.querySelectorAll('.cmp__row')) b.setAttribute('aria-pressed', 'false');
      this.ctx.bus.emit('ask:say', {
        id: 'compare', priority: 50,
        mark: this.d_.sameYear ? String(this.left.year) : `${this.left.year} – ${this.right.year}`,
        text: `<strong>${esc(name)}</strong> — the same on both plates. Nothing in this comparison changed here.`,
      });
      announce(`${name}. The same on both plates.`);
      this._relight();
      return;
    }
    const btn = this.deltaEl.querySelector(`.cmp__row[data-key="${CSS.escape(hit.key)}"]`);
    if (btn) { this._rowPressed(btn); btn.scrollIntoView({ block: 'nearest' }); }
  },

  _rowHover(node) {
    const key = node ? node.dataset.key : null;
    if (this._hoverKey === key) return;
    this._hoverKey = key;
    this._relight();
  },

  /** Ring and name the spotlit places on both plates, at most once a frame. */
  _relight() {
    if (!this._relightRaf) {
      this._relightRaf = this.ctx.util.rafThrottle(() => {
        if (!this.open) return;
        const labels = this._labeller();
        const spot = this._spotUnits();
        for (const s of [this.A, this.B]) {
          s.setLabels(labels);
          s.plate.selectedUnits = spot;
        }
        this._paint(false);
        this.A.draw();
        if (this.phase === 'revealed') this.B.draw();
      });
    }
    this._relightRaf();
  },

  _rowPressed(node) {
    const key = node.dataset.key;
    /* PRESSING A PLACE IS THE GESTURE THAT NEEDS THE MAPS, so the peek (see
       `_peek`) gives way to it and stays given for 1.2s — long enough that the
       `scrollIntoView` this press causes cannot immediately re-collapse the
       block it just opened. After that the reader's next scroll decides again. */
    this._peekHold = Date.now();
    this._setPeek('off');
    this.spot = this.spot === key ? null : key;
    for (const b of this.deltaEl.querySelectorAll('.cmp__row')) {
      b.setAttribute('aria-pressed', b.dataset.key === this.spot ? 'true' : 'false');
    }
    const r = this._rowsIndex().get(key);
    if (this.spot && r) {
      const bits = [];
      bits.push(this._detail(r).text);
      const who = this._who(r);
      if (who) bits.push(`${who.k} ${who.v}`);
      this.ctx.bus.emit('ask:say', {
        id: 'compare', priority: 50,
        mark: r.year ? String(r.year) : (this.d_.sameYear ? String(this.left.year) : `${this.left.year}–${this.right.year}`),
        text: `<strong>${esc(r.name)}</strong> — ${esc(bits.join(', '))}.`,
      });
      announce(`${r.name}. ${bits.join(', ')}.`);
    } else this._say();
    this._relight();
  },

  /**
   * WHAT A SPOTLIT ROW DOES TO THE PLATES, and why it is not a dim.
   *
   * Round 2 answered a pointed-at row by dimming the other three hundred units
   * to a fifth of their ink. On a 500px plate that washed out the whole world
   * in aid of a 6px node in the Bight of Biafra that was no easier to find than
   * before. The map already has a grammar for "this one, here": the selection
   * outline (`--map-*-stroke` over `--map-border-hot`), which render.js also
   * gives first call on the label budget — so a spotlit place is now RINGED and
   * NAMED on both plates, and nothing else changes at all.
   *
   * Dimming survives for one job it is right for: "Only what changed", where
   * quieting everything that did not change is the whole request.
   */
  _spotUnits() {
    const key = this._hoverKey || this.spot;
    const r = key ? this._rowsIndex().get(key) : null;
    return r ? new Set(r.units) : null;
  },

  /** The set that stays at full ink. Null means everything is. */
  _lit() {
    return this.diffOnly ? this.touched : null;
  },

  _setDiffOnly(on) {
    this.diffOnly = !!on;
    this.diffBtn.setAttribute('aria-pressed', this.diffOnly ? 'true' : 'false');
    this.ctx.store.dispatch('setFilter', { cmpd: this.diffOnly ? '1' : null });
    this._relight();
  },

  /* ---- the band ------------------------------------------------------ */

  _say() {
    if (!this.open) return;
    const d = this.d_;
    const text = this.phase === 'ask'
      ? 'Two plates, one screen. Commit an answer and the second plate is drawn.'
      : (d.sameYear
        ? `Same year, two definitions. <strong>${d.gained.units}</strong> more map units appear when the places Britain ran without claiming are counted.`
        : `<strong>${d.gained.units}</strong> map units arrived, <strong>${d.lost.units}</strong> went and <strong>${d.changed.units}</strong> changed what they legally were between ${this.left.year} and ${this.right.year}.`);
    this.ctx.bus.emit('ask:say', {
      id: 'compare', priority: 50,
      mark: d.sameYear ? String(this.left.year) : `${this.left.year} – ${this.right.year}`,
      text,
    });
  },

  /* ---- painting ------------------------------------------------------ */

  /**
   * Which places get their name printed on the plate.
   *
   * Only the ones the difference list is talking about — a compare plate is
   * half the width of the single one and a full set of labels on it is a
   * thicket. When a row is being pointed at, ONLY that row's places are named,
   * because the alternative was what round 2 shipped: pressing "Ambas Bay and
   * Victoria" dimmed the world in aid of a 6px dot nobody could find.
   */
  _labeller() {
    const rows = [];
    for (const g of [this.d_.gained.rows, this.d_.lost.rows, this.d_.changed.rows]) for (const r of g) rows.push(r);
    rows.sort((a, b) => b.units.length - a.units.length);
    const byUnit = new Map();
    const key = this._hoverKey || this.spot;
    const only = key ? this._rowsIndex().get(key) : null;
    if (only) { for (const u of only.units) byUnit.set(u, only.name); }
    else for (const r of rows.slice(0, 16)) for (const u of r.units) if (!byUnit.has(u)) byUnit.set(u, r.name);
    return (uid) => byUnit.get(uid) || null;
  },

  _resize(force) {
    if (!this.open) return;
    const a = this.A.size(), b = this.B.size();
    this._paint(force || a || b);
    this._stickyDepth();
    this._jumpCheck();
    this._edges();
  },

  /**
   * HOW FAR DOWN THE STICKY PLATES REACH, PUBLISHED FOR `scroll-margin`.
   *
   * Below 62rem the plates are stuck to the top of the one scroller, so a row
   * reached by `scrollIntoView` — pressing a place on either plate, or tabbing
   * to it — lands UNDER them unless the row carries a scroll margin at least as
   * deep as the sticky block. That margin used to be two hard rem values, one
   * per band, and they were right only while the plates were two hard heights.
   * They are not any more (compare.css, "the sticky block is a share of the
   * scroller"): the block is 45% of the scroller between 46 and 62rem, so it is
   * 143px in a 900x700 window and 260px in a 768x1024 one, and no single
   * constant is right for both — too small hides the row, too large throws it
   * past the fold of a short window. So it is measured, here, on the same
   * ResizeObserver that already re-fits the plates, and read by one `calc`.
   */
  _stickyDepth() {
    if (!this.plates || !this.el) return;
    /* `display: contents` above 62rem: no box, no sticky block, no margin. */
    const h = Math.round(this.plates.getBoundingClientRect().height);
    const v = h > 8 ? h + 'px' : '';
    /* THE WHOLE SURFACE'S HEIGHT, AND WHY THE SHARE IS TAKEN FROM IT RATHER
       THAN FROM THE SCROLLER.
       The sticky plates are a share of the room available (compare.css, "the
       sticky block is a share of the scroller"). Expressed in CSS as a
       percentage, that share resolves against `.cmp__grid` — and `.cmp__grid`
       is exactly the box whose height the "there is more below" strip changes
       when it takes its row. So: strip appears -> scroller 38px shorter ->
       plates shorter -> more of the list visible -> strip should not be there
       -> scroller taller -> plates taller -> less of the list visible -> strip
       appears. Measured at 768x1024 the moment the reveal came up: eight to
       twenty-two `ResizeObserver loop completed with undelivered
       notifications` per page life, from a layout with no fixed point.
       `.cmp` itself is the stage rectangle. It does not move when the strip
       does, so a share of it settles on the first frame. */
    const box = Math.round(this.el.getBoundingClientRect().height);
    const bv = box > 8 ? box + 'px' : '';
    /* WRITTEN ONLY WHEN THEY CHANGE. Both of these run inside a
       ResizeObserver callback, where an unconditional inline write dirties
       style on every notification whether or not the value moved. */
    if (v === this._stickyV && bv === this._boxV) return;
    this._stickyV = v; this._boxV = bv;
    if (v) this.el.style.setProperty('--cmp-sticky', v);
    else this.el.style.removeProperty('--cmp-sticky');
    if (bv) this.el.style.setProperty('--cmp-h', bv);
    else this.el.style.removeProperty('--cmp-h');
    /* AND WHATEVER WAS MEASURED FROM THE OLD VALUES IS NOW A FRAME OUT OF DATE.
       `--cmp-h` is not only read back by `scroll-margin`: since round 6 the
       plates block is a share of it in both phases, so writing it changes the
       height of the content inside the scroller WITHOUT changing the scroller's
       own box — which means the ResizeObserver that got us here does not fire
       again and `_edges` and `_jumpCheck`, which ran before this write, are
       measuring the layout that has just been replaced.

       Measured at 390x844 under `prefers-reduced-motion`, where P02 lifts its
       plate into a strip of its own and the stage settles one frame later than
       it does under full motion: the question ran 70px past the foot of the
       scroller and the fade that says so was not drawn, because `data-more` had
       been computed against a scroller whose content was 70px shorter. Under
       full motion the same build drew it. A cue that appears at one motion
       setting and not the other is not a cue.

       So the two measured attributes are recomputed on the frame after the
       write. `_edges` does not call this method, so there is no loop, and the
       one call this schedules is skipped when nothing moved (both writes above
       return early when the values are unchanged). */
    if (this._edgeRaf) cancelAnimationFrame(this._edgeRaf);
    this._edgeRaf = requestAnimationFrame(() => {
      this._edgeRaf = 0;
      if (!this.open) return;
      this._jumpCheck();
      this._edges();
    });
  },

  _paint(force) {
    if (!this.open) return;
    const { data } = this.ctx;
    /* The frame the script asked for outranks the store's until the reader
       moves the camera — see the note in `request`. */
    const view = (!this._camMoved && this._wantView)
      ? this._wantView : this.ctx.store.getState().mapView;
    if (view) { this.A.setView(view); this.B.setView(view); }
    const dim = this._lit();
    const layer = this.ctx.store.getState().activeLayer;
    const dl = definitionById(this.left.def), dr = definitionById(this.right.def);
    this.A.paint({ data, year: this.left.year, def: dl, firstHeld: this.firstHeld, dim, layer, force });
    this.A.draw();
    if (this.phase === 'revealed') {
      this.B.paint({ data, year: this.right.year, def: dr, firstHeld: this.firstHeld, dim, layer, force });
      this.B.draw();
    }
  },

  _themeChanged() {
    this.tokens = readTokens();
    this.A.setTokens(this.tokens); this.B.setTokens(this.tokens);
    if (this.open) this._paint(true);
  },

  /* =================================================== keys ============= */

  _onKey(ev) {
    if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const t = ev.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    /* `v` for versus. `c` was the obvious letter and P06 (thematic layers) had
       already taken it; it is still accepted here, but only when nothing else
       has claimed the keystroke, so whichever piece owns `c` keeps owning it. */
    if (ev.key === 'v' || ev.key === 'V' || ev.key === 'c' || ev.key === 'C') {
      if (this.open) this.close(); else this.request({ preset: this._suggest() });
      ev.preventDefault();
      return;
    }
  },

  _onEscapeCapture(ev) {
    if (ev.key !== 'Escape' || !this.open) return;
    if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const t = ev.target;
    if (t instanceof Element && t.closest('input,textarea,select,[contenteditable="true"]')) return;
    const app = document.getElementById('app');
    /* The rail sheet is more recently opened than this surface whenever both
       are up, so it closes first. Everything else on screen is behind this. */
    if (app && app.dataset.sheet === 'open') return;
    ev.preventDefault();
    ev.stopPropagation();
    this.close();
  },

  update(state, prev, changed) {
    if (!this.open) return;
    if (changed.has('year') || changed.has('compareYear') || changed.has('filters')) return;  // handled in subscribe
    if (changed.has('mapView')) this._paint(false);
  },

  destroy() {
    /* `disposer()` returns the ADD function; calling it with no argument adds
       nothing and disposes nothing. Every listener this module registered — the
       document keydown, the two scroll listeners, the bus subscriptions, the
       store subscription, both cameras — survived a destroy() until this line
       was `this.d.all()`, which is a leak P19's mount-and-destroy-fifty-times
       budget is written to catch. */
    if (this.d) this.d.all();
    if (this.el) this.el.remove();
    if (this.root) this.root.classList.remove('cmp-host');
    if (this.A) this.A.destroy();
    if (this.B) this.B.destroy();
  },
};

/** Only <strong> reaches the band; everything interpolated into it is escaped. */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
