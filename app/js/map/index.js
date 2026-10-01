/**
 * map — the plate every fact in this atlas is filed on.
 *
 * The coursebook's sharpest charge (docs/rival/WHY_PRINT_WINS.md §4) is that a
 * choropleth structurally teaches that area equals importance, and that flat
 * colour hides the difference between claimed, administered and controlled.
 * Four mechanisms in this module answer it, and they are the reason it exists:
 *
 *   1  THE DEFINITION SWITCH — keys 1–4 hold the year and change what the word
 *      "British" means. Unit count, km² and population are recomputed from the
 *      dataset and printed each time. §4.
 *   2  WEIGHT MODE — size stops meaning land area and starts meaning a cited
 *      quantity, scaled about each unit's own projected centroid so nothing
 *      moves. A unit with no cited figure draws as an absence, never a zero. §4
 *   3  MINIMUM MARKS — 101 units are flagged tiny; every one draws at 10px and
 *      answers to a 44px target. Gibraltar is never sub-pixel. §4
 *   4  THE PROJECTION TOGGLE — Mercator against Equal Earth, morphing, so the
 *      student watches Canada shrink and learns that a map is an argument. §4
 *
 * And two more charges land here:
 *   §5  informal empire draws with NO fill and NO claimed border, because that
 *       distinction is the content, with the argument's own caption attached.
 *   §7  a silence draws as a hole: coastline only, interior left as bare paper.
 *
 * Encoding law, binding: status → fill + texture; controlDegree → a THRESHOLD
 * that decides what is drawn at all, never a second visual channel; tenure →
 * the single-hue ramp. Colour is never the only signal.
 *
 * Events emitted
 *   map:ready       { units, projection, definition }
 *   map:definition  { id, label, measures, year }
 *   map:projection  { id, previous }
 *   map:view        { k, x, y }
 *   map:hover       { unitId, territoryId }
 *   map:weight      { metric, caption, counted, missing }
 * Events honoured
 *   ask:flyTo { unitId | territoryId, zoom }   ask:sizeBy { metric, year, values, caption, source }
 *   ask:paintSilence { unitIds, reason, agent } ask:paintUnits { unitIds, reason }
 *   map:setProjection { id } | 'mercator'      map:setDefinition { id } | 'claimed'
 */

import { Plate } from './render.js';
import { attach as attachCamera, clampView } from './interaction.js';
import { pick, neighbour } from './hit.js';
import { flattenTopology, flattenAsOne } from './geometry.js';
import { PROJECTIONS, PROJECTION_IDS, WORLD_WIDTH, worldBox, frameSpan, PLATE_FRAME } from './projection.js';

/** The tallest of the projections, in world units — the reference every fit
 *  is measured against, so both projections keep the same equatorial scale. */
const WORLD_HEIGHT_REF = PROJECTION_IDS.reduce((m, id) => Math.max(m, worldBox(id).height), 0);
import { paletteKey, textureFor, adoptSymbology, TEXTURE, KEY_LABEL, readTokens, tenureBucket, TENURE_LABELS, weakFamilies, separations } from './palette.js';
import { DEFINITIONS, DEFAULT_DEFINITION, definitionById, measure, population } from './definition.js';
import { makeNamer } from './names.js';

/**
 * The address the page was opened at, captured when this module is IMPORTED —
 * which is before the shell restores state and rewrites the hash. `def=` and
 * `proj=` are not shell URL keys, so by the time `mount()` runs they have
 * already been dropped from the address bar, and round 3's deep links only
 * appeared to work because the read happened to win the race.
 */
const ENTRY_HASH = String((typeof location !== 'undefined' && location.hash) || '');

/**
 * Mercator, deliberately, and this is a pedagogic decision rather than a
 * default. The misconception the student walks in with is the schoolroom pink
 * Mercator — a Canada the size of Africa, a Greenland the size of Africa — and
 * you cannot correct a picture the student has not been shown. The reveal is
 * the toggle at 00:27, and it only reveals anything if the map starts wrong.
 */
const DEFAULT_PROJECTION = 'mercator';

/**
 * THE CEILING ON ZOOM-TO-FILL, AND WHY IT IS 1.
 *
 * On a plate taller than the world band the world can be scaled past the fit
 * and the left and right edges cropped. Measured before choosing this number:
 * on a 390 x 476 phone plate, filling the height needs 1.30, which crops 23%
 * of the world's longitude — and this projection's antimeridian cut is placed
 * so that both edges carry empire. At 1.15 the crop is 13% and it takes New
 * Zealand (174 E), Fiji (178 E) and the Yukon off the sheet; at 1.30 it also
 * takes British Columbia and the eastern Caribbean. A map of a world empire
 * does not lose Fiji to a layout rule.
 *
 * What fills the phone's plate instead is the world itself: the canvas is now
 * the whole rectangle, and the geometry does not stop at the 64 N - 56 S frame
 * — it is the frame the FIT is computed against. Width-limited, the drawn
 * globe is 390 x 366 in a 390 x 476 plate (77%), poles included, nothing
 * cropped, and the rest is sea drawn as sea to all four edges.
 *
 * The knob stays because it is the right knob. Raising it needs a measurement.
 */
const FILL_MAX = 1.0;

/**
 * THE PLACES THAT CARRY THE ARGUMENT, in DIDACTIC_SPEC §3's own order.
 *
 * Used for one thing only: deciding where a keyboard, a screen reader or a
 * switch user enters the plate (`_seedUnit`). It changes nothing that is
 * drawn, nothing that is counted and nothing that is claimed — it is the
 * difference between opening the atlas at Bengal and opening it at the Coral
 * Sea Islands. Every id is a territory id in this dataset; a year in which
 * none of them is British falls through to the largest unit on the plate.
 */
const SPINE_PLACES = [
  'bengal-presidency',            // T7 — the diwani, and what the revenue bought
  'british-india',                // T9, T10, T11
  'barbados',                     // T2, T3 — sugar, and the ships
  'jamaica',                      // T4 — Tacky's Revolt, the Baptist War
  'egypt',                        // T12 — occupied for 74 years, never annexed
  'ireland',                      // T16 — famine under British rule
  'cape-colony',                  // T13, T15
  'kenya',                        // detention, and the 2013 settlement
  'nigeria',                      // the Scramble, and indirect rule
  'straits-settlements',          // the chokepoint
  'singapore',
  'hong-kong',
  'new-zealand',                  // T9 — Waitangi, two texts
  'commonwealth-of-australia',
  'new-south-wales',
  'quebec',
  'canada',
  'virginia',                     // T2 — 1607, where the Atlantic empire starts
  'great-britain',
];

/**
 * The Stitching view (charge 4c). The dataset's own tags say which of the small
 * units were coaling stations, naval bases and chokepoints; nothing here is
 * assigned by us. No route lines are drawn between them — see the caption.
 */
const STITCH_TAGS = {
  'coaling-station': 'a coaling station',
  'naval-base': 'a naval base',
  'strategic-chokepoint': 'a chokepoint',
  'strategic-port': 'a strategic port',
  'treaty-port': 'a treaty port',
  'free-port': 'a free port',
  'fort': 'a fort',
  'cable-station': 'a cable station',
};

/**
 * THE SILENCES, AND WHERE THEIR WORDS COME FROM.
 *
 * FEATURE_SPEC §1 charge 7 makes `silences[]` a first-class data type with a
 * required named agent, owned by P16. That field is not in the shards yet, and
 * nothing in the app has ever emitted `ask:paintSilence`, so the best mechanism
 * this module owns — a unit drawn as coastline with bare paper inside — has
 * never once fired in front of a student, and the legend has read "None filed
 * here yet" since round 1. A mechanism nobody can reach is not a mechanism.
 *
 * This table does not author a silence. It is a POINTER. The unit ids are
 * resolved from the territory's own `units[]`; every word the student reads is
 * fetched at runtime from the path named in `quote`, so it is the dataset's
 * sentence, not ours, and if the shard changes the caption changes with it. The
 * one claim made here is that the sentence at that path describes a record that
 * was destroyed — and each of them says so in those words.
 *
 * When `silences[]` lands, `ask:paintSilence` overrides all of this: a caller's
 * set replaces the derived set entirely (see `_wireBus`).
 */
const SILENCE_SOURCES = [
  {
    territoryId: 'kenya',
    quote: ['consequences', 'violence', 'toll', 'note'],
    // The dataset's own words for who did it. Quoted, not summarised.
    agentPath: ['pedagogy', 'misconception', 'correction'],
    agent: 'the colonial government in Nairobi, and then the Foreign and Commonwealth Office, which held what survived at Hanslope Park until 2011',
    // WHEN THE SILENCE STARTS. The shard says the records were destroyed at
    // independence, so the year comes from the territory's own key date for
    // independence — not from a number typed here.
    from: { keyDate: /independen/i },
    fromNote: 'The records were destroyed at independence, so the hole opens in that year and not before.',
  },
  {
    territoryId: 'commonwealth-of-australia',
    quote: ['consequences', 'populationTransfer', 'toll', 'note'],
    // The 1997 inquiry says the records were destroyed and does not say by
    // whom. That is not a gap in this table; it is the shape of the silence,
    // and it is printed to the student in those words.
    agent: null,
    agentNote: 'This record does not say who destroyed them. An unnamed destroyer is still a destroyer, and the missing name is part of what was taken.',
    // The removals, and therefore the records that were destroyed, begin in
    // the first year the shard's own sentence names.
    from: { yearIn: ['consequences', 'populationTransfer', 'note'] },
    fromNote: 'The removals begin in this year; a record cannot be destroyed before it is made.',
  },
];

/**
 * THE GEOMETRY THIS ATLAS HAS NOT GOT.
 *
 * Charge 9: at map scale, 6 February 1840 is New Zealand turning one colour,
 * and the 1863 confiscations that answered the Treaty have no shape at all,
 * because this atlas holds a single polygon for New Zealand. Round 2 left that
 * charge unattempted. It cannot be answered by drawing a line we do not have —
 * that would be the one invented thing on the plate — so it is answered the
 * way charge 7 is answered: the absence is drawn as an absence, pinned to the
 * ground it happened on, with the dataset's own numbers beside it.
 *
 * Again a pointer, not a claim: `quote` and `line` are paths into the shard,
 * and `sinceKeyDate` finds the year in the territory's own `keyDates`.
 */
const UNDRAWABLE = [
  {
    territoryId: 'new-zealand',
    unitId: 'new-zealand',
    sinceKeyDate: /waikato/i,
    title: 'The confiscations have no line here',
    quote: ['consequences', 'violence', 'note'],
    pick: /confiscated/i,
    line: ['consequences', 'borderLegacy'],
    why: 'This atlas holds one polygon for New Zealand, so the raupatu confiscation boundaries cannot be drawn on it. The loss is counted here instead of shown, and the difference between counting and showing is the charge this plate is answering.',
  },
  {
    territoryId: 'kenya',
    unitId: 'kenya',
    sinceKeyDate: /state of emergency/i,
    title: 'The guarded villages have no line here',
    quote: ['pedagogy', 'misconception', 'correction'],
    pick: /guarded villages/i,
    line: ['pedagogy', 'whyItMatters'],
    // NO FIGURE IS TYPED HERE. Round 4 wrote "about a million people" into
    // this file; it matched africa-east-south.json on the day it was written
    // and a correction to the shard would not have reached the plate. The
    // number the student reads is the quoted sentence above, fetched from the
    // path in `quote`, so the shard is the only place it lives.
    why: 'That happened inside this one shape. Kenya is the same size on this map in 1952 and in 1963, and no camp, cordon or village line exists in this geometry, so the figure is counted here instead of shown.',
  },
];

/**
 * One sentence out of a passage — the one that carries the claim, quoted whole.
 * Chopping a quotation mid-clause would be its own small dishonesty, so this
 * splits on sentence ends and returns the matching sentence intact.
 */
function sentenceWith(text, rx) {
  if (!text) return null;
  if (!rx) return text;
  const parts = String(text).split(/(?<=[.!?])\s+/);
  const hit = parts.find((p) => rx.test(p));
  return hit ? hit.trim() : text;
}

/** Walk a dotted path into a territory; returns a string or null. Never throws. */
function textAt(obj, path) {
  let o = obj;
  for (const k of path) { if (!o || typeof o !== 'object') return null; o = o[k]; }
  return typeof o === 'string' && o.trim() ? o.trim() : null;
}

/** Great-circle distance in km between two [lon, lat] pairs. */
function haversineKm(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return NaN;
  const R = 6371.0088, r = Math.PI / 180;
  const dLat = (b[1] - a[1]) * r, dLon = (b[0] - a[0]) * r;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export default {
  id: 'map',
  slot: 'map',
  requires: [],

  async mount(ctx) {
    const { root, store, data, bus, util, format } = ctx;
    this.ctx = ctx;
    this.d = util.disposer();
    await util.loadCss(new URL('../../css/map.css', import.meta.url));

    this.definition = DEFAULT_DEFINITION;
    this.projection = DEFAULT_PROJECTION;
    this.silences = new Map();          // unitId -> { reason, agent }
    this.highlight = null;              // Set<unitId> | null
    this.weightState = null;            // { metric, caption, values, source, missing }
    this.morph = null;
    this.optionEls = new Map();
    this.activeUnit = null;
    this.paintSig = '';
    this.stitch = false;
    this.namer = makeNamer(data);
    this.silenceAsked = [];             // what a caller named, drawn or not

    this._readDeepLink();
    this._buildDom();
    this.plate = new Plate(this.canvas);
    this.plate.meta = data.unitMeta || new Map();
    // Names on the plate, in this year's language. See names.js and
    // render.js#_drawLabels: a map with no words is a diagram, not a map.
    this.plate.labelText = (uid, rec) => this._plateName(uid, rec, store.getState().year);

    /**
     * ONE NAME FOR A TERRITORY DRAWN AS MANY SMALL PIECES.
     *
     * At world scale India is fifteen units inside a 22 × 20px box; each of
     * them lost the label budget to a dot, so round 4's plate named Kuria
     * Muria Islands and Perim and never named India — three-quarters of
     * everyone Britain ruled. render.js#_drawLabels collapses a territory's
     * small units into one candidate and asks here what to call it. The name
     * is the same period name every other label uses; nothing is invented.
     */
    /**
     * WHICH NAMES ARE WORTH THE BUDGET — answered with a cited quantity.
     *
     * `render.js#_drawLabels` awards a third of the label budget on this
     * number instead of on drawn area, so a plate that has room for twenty
     * names spends them on the places where the people were. The figure is the
     * territory's own `peak.population` field — the same cited quantity weight
     * mode scales by and the same one the card names its source for. A
     * territory with no cited figure returns null and competes on area, which
     * is what every printed plate does for all of them.
     */
    this.plate.labelMass = (territoryId) => {
      const t = territoryId && data.byId ? data.byId.get(territoryId) : null;
      const p = t && t.peak && Number(t.peak.population);
      return Number.isFinite(p) && p > 0 ? p : null;
    };

    this.plate.groupLabel = (territoryId, units) => this._plateGroupName(territoryId, units, store.getState().year);
    this.tokens = this._readTokens();
    this.weakFills = weakFamilies(this.tokens);
    this.plate.setTokens(this.tokens, window.devicePixelRatio || 1);

    // The Plate is constructed neutral; tell it which projection it is in before
    // anything is drawn, or the badge says one thing and the ground shows another.
    this.plate.setProjectionState(this.projection, this.projection, 1);

    this._precompute();
    await this._loadGeometry();

    // The listeners go on the CANVAS. See the note at the top of interaction.js:
    // binding them to the map root captured the pointer for every button the
    // map owns and made all eight of them dead to a mouse.
    this.camera = attachCamera(this.plate, {
      target: this.canvas,
      frame: this.frame,
      onView: (v) => this._onView(v),
      onPick: (x, y) => this._onPick(x, y),
      onHover: (x, y) => this._onHover(x, y),
    });
    this.d(() => this.camera.destroy());

    this._wireResize();
    this._wireKeys();
    this._wireBus();
    this._wireTheme();

    const s = store.getState();
    if (s.mapView) this.plate.setView(clampView(s.mapView, this.plate));
    this._measure();
    this._repaint(true);
    this._syncOptions();
    this._mounted = true;
    this._syncSilenceBtn();
    this._applyStage();
    this._expose();
    this._emitProjection(null);
    bus.emit('map:ready', { units: this.plate.geom ? this.plate.geom.shapes.size : 0, projection: this.projection, definition: this.definition });
    bus.emit('map:painted', { year: store.getState().year, definition: this.definition });
  },

  /* ==================================================== deep link ======== */

  _readDeepLink() {
    // `def=` and `proj=` are not shell URL keys, so they are read once on entry
    // and then mirrored into `filters`, which the shell does persist. A link of
    // the form #year=1913&def=controlled therefore lands where it says it does.
    const raw = (ENTRY_HASH || String(location.hash || '')).replace(/^#/, '');
    const q = new Map();
    for (const part of raw.split('&')) { const i = part.indexOf('='); if (i > 0) q.set(part.slice(0, i), decodeURIComponent(part.slice(i + 1))); }
    const f = this.ctx.store.getState().filters || {};
    const def = q.get('def') || f.def;
    const proj = q.get('proj') || f.proj;
    if (def && DEFINITIONS.some((d) => d.id === def)) this.definition = def;
    if (proj && PROJECTION_IDS.includes(proj)) this.projection = proj;
    if (this.definition !== (f.def || null) || this.projection !== (f.proj || null)) {
      this.ctx.store.dispatch('setFilter', {
        def: this.definition === DEFAULT_DEFINITION ? null : this.definition,
        proj: this.projection === DEFAULT_PROJECTION ? null : this.projection,
      });
    }
  },

  /* ==================================================== dom ============== */

  _buildDom() {
    const { util } = this.ctx;
    const el = util.el;
    // The canvas is a picture, not a control: it is described, not focused.
    // Everything a keyboard needs is a real element — the 302 unit options in
    // the listbox below, and the zoom and projection buttons.
    this.canvas = el('canvas', { class: 'map__plate', role: 'img', 'aria-label': 'Map of the British Empire' });
    this.fadeCanvas = el('canvas', { class: 'map__fade', 'aria-hidden': 'true' });
    this.targets = el('div', { class: 'map__targets', role: 'listbox', 'aria-label': 'Territories drawn on the map' });

    // The card is a scroll container with a VISIBLE affordance. Round 2's card
    // was 677px of content in a 374px box with no scrollbar and no cue, so in
    // the Stitching view the sentence explaining what the student was looking
    // at read "16 are ringed because the" and stopped.
    /* THE READING IS A STRIP, NOT A PANEL — the round-6 change.

       The definition switch is a control over the whole map, exactly like the
       year: 1 / 2 / 3 / 4 hold the year still and change what the word
       *British* means. It was a 300 x 340 card standing on the Atlantic, and
       because this module compressed itself around its own furniture the card
       was paid for out of the world — 248px of map, every second, whether or
       not anybody had pressed it. It is now four segments on one line at the
       head of the plate, and it does not appear at all until the reader has
       touched the atlas (`working`).

       Everything the card used to carry below its fold — the gloss, the three
       figures, the mode captions, the ghost note, the silence note, the
       informal-empire note — is not deleted and not shrunk. It goes to the
       sheet (`ask:sheet`), which is 410 x 716 with its own scroll, beside a
       live map. It was being clipped mid-word in a 26px box; there is no
       version of that which teaches. */
    this.switchBody = el('div', { class: 'map__switchbody' });
    /* COHERENCE PASS — THE SWITCH IS NEVER THE THING THAT SCROLLS.
       Title, the four buttons and the count they change lived inside the
       scroller with the prose. On a 1366x768 school laptop — the commonest
       screen this will ever run on — the rail is short enough that rows three
       and four of the switch ("3 controlled", "4 influenced") were sliced in
       half under the fold, so the app's signature mechanism arrived broken by
       default. The head is pinned; only prose may fall below the fold. */
    this.switchHead = el('div', { class: 'map__switchhead' });
    // One "there is more here", in the app's one shape for it (chrome.css).
    // It used to be a paging control for a scroll box; the scroll box has gone
    // to the sheet and this is the route to it.
    // ONE DOOR, ONE NAME. The band renders this same label as its control, and
    // measured on a 390px phone the longer wording ran 28px off the right edge
    // of the band, which does not wrap. Same words in both places, and both fit.
    this.moreBtn = el('button', { type: 'button', class: 'cx-more map__sheetlink' }, 'What this leaves out');
    // Also `.cx-panel`: one hairline, square, no shadow. It carries a control
    // bar rather than prose, so it names its own tighter padding rather than
    // inventing a second box.
    this.readout = el('div', { class: 'cx-panel map__switch', role: 'group', 'aria-label': 'What “British” means' }, [this.switchHead, this.moreBtn]);
    this.projBtn = el('button', { type: 'button', class: 'map__mode map__proj', 'aria-live': 'off' });
    this.zoomIn = el('button', { type: 'button', class: 'map__zoom', 'aria-label': 'Zoom in' }, '+');
    this.zoomOut = el('button', { type: 'button', class: 'map__zoom', 'aria-label': 'Zoom out' }, '−');
    this.homeBtn = el('button', { type: 'button', class: 'map__zoom map__zoom--home', 'aria-label': 'Whole world' }, '◻');
    // The visible label goes away on a short rail (a 1024 x 768 laptop gives
    // this column 230px, and five two-line tiles left the definition card
    // 56px tall — the flagship mechanism clipped to half a heading). The
    // accessible name never goes away, so a screen reader and a tooltip both
    // still say what the key does.
    /* THE TIER IS WHY A MOUSE COULD NEVER REACH THIS ROW.
       Round 6 put all five tiles behind "Other ways to draw this" and then put
       that button inside the row it opens, so at `plate` and at `working` the
       button measured 0 x 0: the projection reveal, weight, stitching and the
       silences — four of this module's five best ideas — were reachable only
       by pressing a key that is documented in screen-reader-only text. The row
       is now visible from `working`, and each tile declares the level it
       belongs to: Projection and Weight are the two re-encodings that answer
       charge 4 (area is not importance), so they arrive the moment the reader
       has touched the atlas; Stitching, Silences and Enlarge stay behind the
       one word, which is now a door standing OUTSIDE the room. */
    const mode = (cls, key, now, sub) => el('button', {
      type: 'button', class: 'map__mode ' + cls, 'aria-pressed': 'false',
      'aria-label': `${now} — ${sub} (key ${key})`, title: `${now} — ${sub} · key ${key}`,
    }, [
      el('span', { class: 'map__modetop' }, [el('kbd', { class: 'map__modekey' }, key), el('span', { class: 'map__modenow' }, now)]),
      el('span', { class: 'map__modesub' }, sub),
    ]);
    this.stitchBtn = mode('map__stitch', 'S', 'Stitching', 'the small places, at one size');
    // THE BUTTON THAT WAS MISSING. Round 2 built weight mode, proved it, and
    // then shipped it with no key, no control and nothing on the bus that a
    // student could reach: the one mechanism in this module that turns "area
    // is not importance" from an assertion into a demonstration could only be
    // run from a developer console. It is a button now, and it is W.
    this.weightBtn = mode('map__weight', 'W', 'Weight', 'size = people, not land');
    // Charge 7 and charge 9 in one control: what this plate cannot show you.
    this.silenceBtn = mode('map__silence', 'H', 'Silences', 'holes where a record was destroyed');
    /**
     * THE CONTROL ROUND 4 DID NOT HAVE. A student on a 1440 x 900 laptop is
     * given a 329px strip for the map, because the timeline under it is 500px
     * tall; inside that strip a 2.37:1 world can only ever be 780px wide.
     * Enlarged, the same window draws it 1440px wide with nothing over it.
     */
    this.bigBtn = mode('map__big', 'E', 'Enlarge', 'the plate fills the window');
    this.modes = el('div', { class: 'map__modes', role: 'group', 'aria-label': 'Other ways to draw this plate', hidden: 'hidden' },
      [this.projBtn, this.weightBtn, this.stitchBtn, this.silenceBtn, this.bigBtn]);
    // FOUR OTHER READINGS OF THE SAME PLATE, BEHIND ONE WORD. P, S, W and H
    // are alternative renderings, and four alternatives offered before the
    // first reading has been read are four ways to be lost (LAYOUT_BUDGET §4).
    // They arrive at `apparatus`, behind this.
    this.modesBtn = el('button', {
      type: 'button', class: 'cx-more map__modesmore', 'aria-expanded': 'false',
      'aria-controls': 'map-modes',
    }, 'Other ways to draw this');
    this.modes.id = 'map-modes';
    this.d(util.on(this.modesBtn, 'click', () => this._toggleModes()));
    /* THE PHONE'S ROUTE BACK TO THE FOUR DEFINITIONS — RESPONSIVE_LAW §5's
       debt, paid with the width the reservation already has.

       Below 40rem the dial is not on the plate and not in a dock: 844 = 46 bar
       + 110 lede + MAP + 32 ribbon + 280 panel (B8's floor) + 184 time, so a
       36px dial dock spends the map from 192 down to 156 and D4's floor is
       176. The law says that is a debt this module owns, and until this pass
       there was no route at all: `.map__sheetlink` lives inside `.map__foot`,
       which is hidden at that width, so on a phone the sheet that holds the
       gloss, the figures and the caveats could not be opened by anyone.

       The width comes from the cluster itself. On a phone `+` and `-` are the
       two controls with another route — pinch (interaction.js, `pointers.size
       === 2`) and the `+`/`-` keys — while "Whole world" has none: a reader who
       has pinched into the Caribbean cannot get back out. So below 40rem the
       cluster is the home button and this chip, which is 84px against the
       ribbon's 104px reservation and hands 20px of swatch back to P17. The
       chip is labelled, because a bare "1" in a strip is the unlabelled-swatch
       defect this module has logged against two other pieces. */
    this.defChip = el('button', {
      type: 'button', class: 'map__defchip', hidden: 'hidden',
    }, [el('kbd', { class: 'map__defkey' }, '1'), document.createTextNode(' '), el('span', { class: 'map__defchipw' }, 'claimed')]);
    this.d(util.on(this.defChip, 'click', () => this._openSheet()));
    this.zooms = el('div', { class: 'map__zooms' }, [this.defChip, this.zoomIn, this.zoomOut, this.homeBtn]);
    this.controls = el('div', { class: 'map__controls' }, [this.modesBtn, this.modes]);
    /* ONE ROW ALONG THE FOOT, NOT TWO ISLANDS THAT CAN COLLIDE.
       The definition strip was pinned to the foot on the left and the mode row
       to the foot on the right, each sized by its own content, and below about
       1200px they met: measured at 1024 x 768 they overlapped by 13,436px and
       `elementFromPoint` over the centre of the "4 influenced" button returned
       the projection tile — two live controls, one on top of the other. They
       are now the two ends of ONE flex row that wraps, so overlap is not a
       thing this layout can express at any width. */
    /* AND THE FIVE OTHER READINGS FOLLOW THE DIAL. `.map__controls` — the door
       "Other ways to draw this" and the five tiles behind it — is a child of
       `.map__foot`, so at the one width where the foot is not on screen
       (below 40rem, RESPONSIVE_LAW §5) Projection, Weight, Stitching, Silences
       and Enlarge had no route at all on a phone. They ride with the dial into
       the sheet. One node, moved, never copied: there is one door and one row
       of tiles in this application. */
    this.sheetTail = el('div', { class: 'map__sheettail' });
    this.foot = el('div', { class: 'map__foot' }, [
      el('div', { class: 'map__strip' }, [this.readout]),
      this.controls,
    ]);
    /* THE APP'S ONE PANEL RECIPE, NOT THIS MODULE'S OWN. The hover card was a
       hand-rolled box — a different border token, its own padding, its own
       shadow — which is one more of the twenty-seven box treatments
       LAYOUT_BUDGET §5 counted on one screen. It is `.cx-panel` now, floated
       because the reader's pointer just summoned it, tight because it follows
       a cursor. map.css keeps only its geometry. */
    this.tip = el('div', { class: 'cx-panel cx-panel--float cx-panel--tight map__tip', role: 'status', 'aria-live': 'off', hidden: 'hidden' });
    this.hint = el('p', { class: 'map__hint sr-only', id: 'map-hint' },
      'Arrow keys move between territories. Shift with an arrow pans the map. Plus and minus zoom. Keys 1 to 4 change what the word British means. '
      + 'Every one of the following also has a button on the plate, under Other ways to draw this. '
      + 'P swaps the projection. S shows the stitching view, in which every small place is drawn at the same size. W makes size mean people instead of land. '
      + 'H draws the silences: the places whose record was destroyed. E gives the plate the whole width of the window, and E or Escape puts it back.');

    /**
     * NO RAIL, AND NO CARD.
     *
     * Round 5 put this module's furniture in a column BESIDE the plate and
     * sized the plate to what was left, so the column's 248px were paid for
     * out of the world. The shell now guarantees that nothing stands on the
     * plate, and charges this module for the whole rectangle, so the trade is
     * gone: the canvas is the rectangle and these two small objects float over
     * the sea. The strip sits at the head of the plate, the zooms in the one
     * corner of a British Empire plate that carries nothing British at any
     * year (see map.css). Neither costs the world a pixel, and both are fed to
     * the label engine as obstacles so no name is ever printed under them.
     *
     * They stay parented into the shell's full-screen `overlay` mount, which
     * is the one layer LAYOUT_BUDGET B5 exempts, and which is also the only
     * way they can rise above the legend at all: `.stage__map` is `z-index: 0`
     * and therefore a stacking context, so on a phone every one of this
     * module's controls used to return BLOCKED from `elementFromPoint`.
     */
    /* THREE OBJECTS, THREE CORNERS, ALL OVER WATER.
       The definition strip at the foot on the left, "Other ways to draw this"
       at the foot on the right, the zooms at the head on the right. They were
       one stack at the head on the left, which is Canada and Alaska, and with
       the mode tiles open the stack was 129px tall and standing on the Cape.
       Kept as siblings so each can be placed on its own corner; map.css does
       the placing, and every one of them is fed to the label engine as an
       obstacle so no name is ever printed underneath. */
    this.furniture = el('div', { class: 'map__furniture' }, [this.foot, this.zooms]);
    // The hover card lives in its own full-window layer: it follows the
    // pointer across the PLATE, and it must not be clipped by the strip.
    // Pointer-transparent, so it can never intercept a click.
    this.tipLayer = el('div', { class: 'map__tiplayer' }, [this.tip]);

    /**
     * THE PLATE FRAME — the single structural change of round 5.
     *
     * The canvas used to be `inset: 0` on the map root, so it was always the
     * whole stage and the world was fitted inside it: at 1920 x 491 the drawn
     * world was 27.9% of the canvas and the remaining 72% was sea. The frame
     * is now sized by `_layout()` to EXACTLY the pixels the world occupies, so
     * the canvas is the world, the paper around it is the atlas margin, and
     * the rail stands on that margin instead of on the map.
     */
    this.frame = el('div', { class: 'map__frame' }, [this.canvas, this.fadeCanvas, this.targets]);
    /**
     * THE PEEK STRIP IS A CONTROL — docs/RESPONSIVE_LAW.md §11.
     *
     * In reading mode the plate is 44 pixels of the place a beat is about, and
     * the strip itself is the way back to the band: one tap anywhere on it and
     * the map, the colour ribbon and the time control all come back. The
     * button is a CHILD OF THE PLATE, which is why it does not violate rule D1
     * — it paints nothing, takes no ground of its own, and is inside
     * `.stage__map`, the one rectangle D1 excludes because that rectangle IS
     * the map. `display: none` at every other width and in every other state,
     * so it costs a cold plate nothing and can never intercept a click meant
     * for a territory.
     *
     * It routes through the shell (`ask:read`) rather than acting itself,
     * because there is exactly ONE toggle in the interface and tours renders
     * it: `Map`, in the beat panel's foot, beside Next. The shell presses that
     * control, so this route and that one can never disagree and the
     * announcement is made once, in the module that owns the words.
     */
    this.peekBtn = el('button', {
      class: 'map__peek', type: 'button',
      'data-role': 'peek',
    }, [el('span', { class: 'map__peekw', text: 'Open the map' })]);
    this.d(util.on(this.peekBtn, 'click', (ev) => {
      ev.preventDefault(); ev.stopPropagation();
      this.ctx.bus.emit('ask:read', { mode: 'map', from: 'map' });
    }));

    this.el = el('div', { class: 'map', 'data-projection': this.projection, 'data-definition': this.definition },
      [this.frame, this.peekBtn, this.hint]);
    this.targets.setAttribute('aria-describedby', 'map-hint');
    this.ctx.root.replaceChildren(this.el);
    const host = document.querySelector('#app [data-mount="overlay"]');
    if (host) { host.appendChild(this.furniture); this.furniture.classList.add('is-floating'); host.appendChild(this.tipLayer); }
    else { this.el.appendChild(this.furniture); this.el.appendChild(this.tipLayer); }
    this.d(() => { if (this.furniture && this.furniture.parentNode) this.furniture.remove(); });
    // Both objects can be living in ANOTHER module's slot when we are pulled
    // down (see _syncDocks), so removing our own layer is not enough: the zoom
    // cluster would be left standing in the colour ribbon for ever.
    this.d(() => { for (const n of [this.foot, this.zooms]) if (n && n.parentNode) n.remove(); });
    this.d(() => { if (this.tipLayer && this.tipLayer.parentNode) this.tipLayer.remove(); });

    // Which kind of pointer is driving, so the hover card can stand down on a
    // touch screen. Capture phase and passive: it must never affect the drag.
    this.d(util.on(this.canvas, 'pointerdown', (ev) => {
      this._touchPointer = ev.pointerType === 'touch' || ev.pointerType === 'pen';
      if (this._touchPointer && this.tip) { this.tip.hidden = true; this.tip.replaceChildren(); }
    }, { capture: true, passive: true }));

    this.d(util.on(this.zoomIn, 'click', () => { this.camera.zoomIn(); this._repaint(true); }));
    this.d(util.on(this.zoomOut, 'click', () => { this.camera.zoomOut(); this._repaint(true); }));
    this.d(util.on(this.homeBtn, 'click', () => { this.camera.reset(); this._repaint(true); }));
    this.d(util.on(this.projBtn, 'click', () => this.setProjection(this.projection === 'mercator' ? 'equal-earth' : 'mercator')));
    this.d(util.on(this.stitchBtn, 'click', () => this.setStitch(!this.stitch)));
    this.d(util.on(this.weightBtn, 'click', () => this.toggleWeight()));
    this.d(util.on(this.silenceBtn, 'click', () => this.setSilenceMode(!this.silenceMode)));
    this.d(util.on(this.bigBtn, 'click', () => { this._bigTouched = true; this.setEnlarged(!this.enlarged); }));
    this.d(util.on(this.moreBtn, 'click', () => this._openSheet()));
    this._renderProjButton();
  },

  /* ==================================================== geometry ========= */

  async _loadGeometry() {
    const { data, util } = this.ctx;
    const geo = data.geo || {};
    const units = geo.coarse && geo.coarse.data;
    if (!units) {
      this.noGeo = true;
      this.el.classList.add('map--nogeo');
      return;
    }
    const unitFlat = flattenTopology(units, geo.coarse.object || 'units');
    const landTopo = (geo.land && geo.land.data) || null;
    const land = landTopo ? flattenAsOne(landTopo, (geo.land && geo.land.object) || 'land', 'land') : null;
    const lakes = (geo.lakes && geo.lakes.data) ? flattenAsOne(geo.lakes.data, geo.lakes.object || 'lakes', 'lakes') : null;
    const grat = (geo.graticule && geo.graticule.data) ? flattenAsOne(geo.graticule.data, geo.graticule.object || 'graticule', 'graticule') : null;
    this.plate.setGeometry({ units: unitFlat, land, lakes, graticule: grat, meta: data.unitMeta });
    this.coarseFlat = unitFlat;
    util.idle && util.idle(() => this._loadFine());
  },

  /** The fine outlines are worth 1.8 MB only once somebody zooms in. */
  async _loadFine() {
    const { data } = this.ctx;
    if (this.fineFlat || !data.loadGeoLayer) return;
    if (this.plate.view.k < 2.5) { this._fineWanted = true; return; }
    try {
      const payload = await data.loadGeoLayer('fine');
      if (!payload) return;
      const meta = (data.geo && data.geo.fine) || {};
      this.fineFlat = flattenTopology(payload, meta.object || 'units');
      this._useFine();
    } catch (_) { /* the coarse map is a complete map; this is an upgrade */ }
  },

  _useFine() {
    if (!this.fineFlat) return;
    const view = this.plate.view;
    this.plate.setGeometry({ units: this.fineFlat });
    this.plate.setView(view);
    this._repaint(true);
    this._syncOptions();
  },

  /* ==================================================== precompute ======= */

  _precompute() {
    const { data } = this.ctx;
    // The first year each unit came under real British authority. Informal
    // spheres are excluded: Britain never claimed Argentina, so Argentina never
    // becomes "formerly British".
    this.firstHeld = new Map();
    // `_holeYears()` is derived from `firstHeld`, so it is stale the moment
    // this runs again.
    this._holeYearsCache = null;
    // AND THE YEAR IT STOPPED, and which territory held it last. A ghost with
    // no dates is a grey shape a student cannot interrogate: round 4 labelled
    // Hawaii, Florida, Réunion and Maluku on the 1900 plate and had nothing to
    // say about any of them. Both numbers come from the spans themselves.
    this.lastHeld = new Map();
    this.lastHolder = new Map();
    for (const s of data.spans || []) {
      if (s.status === 'informal-sphere') continue;
      if (!(Number(s.controlDegree) >= 1)) continue;
      for (const u of s.units || []) {
        const cur = this.firstHeld.get(u);
        if (cur == null || s.start < cur) this.firstHeld.set(u, s.start);
        const end = s.end == null ? null : Number(s.end);
        const prev = this.lastHeld.get(u);
        if (end != null && (prev === undefined || prev == null || end > prev)) {
          this.lastHeld.set(u, end); this.lastHolder.set(u, s.territoryId);
        } else if (end == null) { this.lastHeld.set(u, null); }
      }
    }
    this.statusLabel = new Map((data.statuses || []).map((s) => [s.id, s.label]));

    // Which small units the dataset itself calls load-bearing. Read from
    // `tags[]` on the territory; nothing is assigned here.
    this.stitchTag = new Map();
    for (const t of data.territories || []) {
      let kind = null;
      for (const g of t.tags || []) if (STITCH_TAGS[g]) { kind = STITCH_TAGS[g]; break; }
      if (!kind) continue;
      for (const u of t.units || []) if (!this.stitchTag.has(u)) this.stitchTag.set(u, kind);
    }
  },

  /* ==================================================== paint =========== */

  _paintFor(year) {
    const { data } = this.ctx;
    const T = this.tokens;
    const def = definitionById(this.definition);
    const st = data.statusAt(year);
    const out = new Map();
    const weight = this.weightState;

    for (const [uid, e] of st) {
      const sil = this.silences.get(uid);
      if (sil && this._silenceLive(sil, uid, year, def.test(e))) {
        out.set(uid, {
          mode: 'hole', key: 'silence', entry: e, label: 'no record was allowed to survive here',
          reason: sil.reason || null, agent: sil.agent || null, agentNote: sil.agentNote || null,
          from: sil.from, fromNote: sil.fromNote || null,
        });
        continue;
      }
      if (!def.test(e)) continue;                    // the threshold, doing its one job
      const key = paletteKey(e.status, e.controlDegree);
      if (key === 'informal') {
        out.set(uid, { mode: 'informal', key, entry: e, texture: 'plain', label: KEY_LABEL.informal, node: true });
        continue;
      }
      if (weight) {
        const v = weight.values.get(uid);
        if (!(Number.isFinite(v) && v > 0)) {
          out.set(uid, { mode: 'absence', key, entry: e, texture: textureFor(e.status, key), label: 'no cited figure for this measure' });
          continue;
        }
      }
      out.set(uid, {
        mode: 'fill', key, entry: e,
        fill: T.fills[key], strokeColour: T.stroke[key], texture: textureFor(e.status, key),
        /* THE ENGRAVING CARRIES THE FAMILIES THE COLOUR CANNOT — round 10.
           `this.weakFills` is measured from the live tokens every time the
           palette is read: the families whose fill sits under DESIGN.md's own
           12 dE00 from the ground for a normal, protanope, deuteranope or
           tritanope reader. For those, and only those, the hatch is drawn at
           twice the weight in the family's own published stroke ink, because
           for those readers the hatch is the ONLY thing separating the shape
           from unclaimed land. Measured in the paper theme: self-governing
           under the Crown is 9.6 dE00 from the ground for a protanope, which
           is why Canada, Australia and New Zealand read as unclaimed at 1900
           on a projector. */
        engrave: this.weakFills && this.weakFills.has(key) ? 'heavy' : null,
        partial: !!e.partial, label: KEY_LABEL[key],
        // THE METROPOLE IS ALWAYS NAMED. At a 480px world Great Britain is
        // about 10px across and lost every label-budget contest it entered, so
        // the one plate in this app that has to say where the empire was run
        // from did not say it. The status id is the dataset's own — nothing is
        // assigned here — and the namer collapses the eight home units to one
        // period name, so this costs a single label.
        home: e.status === 'part-of-uk',
      });
    }

    // Formerly British: held once, not held now. The United States greying out
    // in 1783 is one of the most useful things this map does.
    for (const [uid, first] of this.firstHeld) {
      if (out.has(uid) || st.has(uid)) continue;
      if (year <= first) continue;                   // not yet held: nothing to draw, silence or not
      const sil = this.silences.get(uid);
      if (sil && this._silenceLive(sil, uid, year, false)) {
        out.set(uid, {
          mode: 'hole', key: 'silence', label: 'no record was allowed to survive here',
          reason: sil.reason || null, agent: sil.agent || null, agentNote: sil.agentNote || null,
          from: sil.from, fromNote: sil.fromNote || null,
        });
        continue;
      }
      out.set(uid, {
        mode: 'fill', key: 'lost-former', fill: T.fills['lost-former'],
        strokeColour: T.stroke['lost-former'], texture: TEXTURE['lost-former'],
        partial: false, label: KEY_LABEL['lost-former'], lost: true,
        heldFrom: first, heldTo: this.lastHeld.get(uid),
        lastHolder: this.lastHolder.get(uid) || null,
      });
    }

    // A named set (`ask:paintUnits`) pushes everything else back. Nothing is
    // removed: the rest of the empire is still there, and still readable, just
    // quiet while the set is being talked about.
    if (this.highlight) {
      for (const [uid, rec] of out) if (!this.highlight.has(uid)) rec.dim = true;
    }
    if (this.stitch) {
      for (const [uid, rec] of out) {
        const kind = this.stitchTag.get(uid);
        if (kind) rec.stitchKind = kind;
      }
    }
    /* WHEN THE SUBJECT IS THE ABSENCE, THE ABSENCE HAS TO BE THE LOUDEST THING.
       Round 6 drew the holes correctly and drew everything else exactly as
       loudly, so at world zoom seven empty shapes among two hundred filled ones
       were, in the reviewer's words, "effectively invisible where it is
       switched on". Nothing is hidden and nothing is removed — every fill, every
       texture and every name is still drawn, and a reader can still read the
       whole plate. The rest of the map simply stops shouting for as long as the
       question is what is missing from it. It is the same move the plate already
       makes for `ask:paintUnits`, at a level you can still read through. */
    /* AND ONLY WHEN THERE IS SOMETHING TO STAND OUT AGAINST. Scrubbing back
       past the first destruction with the mode still on used to drain the
       whole plate to half alpha in aid of nothing at all. No hole, no hush. */
    if (this.silenceMode) {
      let holes = 0;
      for (const rec of out.values()) if (rec.mode === 'hole') holes++;
      if (holes) for (const rec of out.values()) if (rec.mode !== 'hole') rec.quiet = true;
    }

    // Tenure is a separate reading of the same data: one hue, seven steps.
    if (this.ctx.store.getState().activeLayer === 'tenure') {
      for (const [uid, rec] of out) {
        if (rec.mode !== 'fill' || rec.lost) continue;
        const e = rec.entry;
        if (!e || e.since == null) continue;
        rec.fill = T.tenure[tenureBucket(e.tenureYears)] || rec.fill;
        rec.texture = 'plain';
        rec.tenureLabel = TENURE_LABELS[tenureBucket(e.tenureYears)];
      }
    }
    return out;
  },

  _repaint(force = false) {
    if (!this.plate.geom) return;
    const year = this.ctx.store.getState().year;
    const sig = [year, this.definition, this.ctx.store.getState().activeLayer,
      this.weightState ? this.weightState.metric : '', this.silences.size, this.stitch ? 's' : '', this.tokens.sea].join('|');
    if (force || sig !== this.paintSig) {
      this.paintSig = sig;
      this.plate.setPaint(this._paintFor(year));
      this.plate.setWeight(this._weightScales());
      this.plate.net = this.stitch ? this._stitchNet() : null;
    }
    this.plate.selectedUnits = this._selectedUnits();
    this.plate.draw();
  },

  _selectedUnits() {
    const id = this.ctx.store.getState().selectedTerritoryId;
    if (!id) return null;
    const units = this.ctx.data.unitsOf ? this.ctx.data.unitsOf(id, this.ctx.store.getState().year) : null;
    const set = new Set(units && units.length ? units : []);
    if (!set.size) { const t = this.ctx.data.byId.get(id); if (t) for (const u of t.units || []) set.add(u); }
    return set.size ? set : null;
  },

  /* ==================================================== weight =========== */

  _weightScales() {
    const w = this.weightState;
    if (!w) return null;
    const vals = [...w.values.values()].filter((v) => Number.isFinite(v) && v > 0).sort((a, b) => a - b);
    if (!vals.length) return null;
    // Reference at the 70th percentile rather than the median, so the top of the
    // distribution has room to grow without the whole map turning into overlap.
    // Area is proportional to the value: the scale is the square root of it.
    const ref = vals[Math.min(vals.length - 1, Math.floor(vals.length * 0.7))];
    /* A SHAPE THAT ALREADY SAYS MORE THAN WAS HELD MAY NOT BE MADE TO SAY MORE.
       Measured at 1640 with W and S both on: `in-gujarat`, `in-maharashtra`,
       `in-tamil-nadu`, `in-andhra-pradesh` and `in-west-bengal` were each
       carrying British India's peak population — 388,997,955, counted in 1941
       — and each scaled 4.5x about its own centroid, which drew "The Company's
       settlements" as an orange mass over the whole subcontinent in a year when
       the Company held five walled warehouses. This dataset says so itself, in
       its own geoCoverage note for 1612-1765: "Draw these as dots, not
       provinces: the Company held perhaps a few hundred acres."
       Every one of those five units carries `partial` in that year — the flag
       the plate already draws as bands of bare ground, meaning British control
       did not fill this unit. A partial unit may SHRINK under a weight, which
       is information, and may not GROW, which is a claim in the opposite
       direction to the evidence. The count is printed in the band and in the
       sheet, so the clamp is stated rather than silently applied. */
    const st = this.ctx.data.statusAt(this.ctx.store.getState().year);
    const m = new Map();
    let held = 0;
    for (const [uid, v] of w.values) {
      if (!Number.isFinite(v) || v <= 0) continue;
      let sc = Math.max(0.3, Math.min(4.5, Math.sqrt(v / ref)));
      const e = st.get(uid);
      if (e && e.partial && sc > 1) { sc = 1; held++; }
      m.set(uid, sc);
    }
    this.weightHeld = held;
    return m;
  },

  /**
   * The one metric this module can source itself: each territory's own cited
   * peak recorded population, in that territory's own census year. It is a
   * floor and it says so. Every other metric arrives on `ask:sizeBy`.
   */
  _builtInPopulation(year) {
    const { data } = this.ctx;
    const st = data.statusAt(year);
    const def = definitionById(this.definition);
    const values = new Map();
    let missing = 0, counted = 0;
    const seenT = new Set();
    let y0 = Infinity, y1 = -Infinity, withYear = 0;
    for (const [uid, e] of st) {
      if (!def.test(e)) continue;
      const t = data.byId.get(e.territoryId);
      const p = t && t.peak && Number(t.peak.population);
      if (Number.isFinite(p) && p > 0) {
        values.set(uid, p); counted++;
        if (!seenT.has(e.territoryId)) {
          seenT.add(e.territoryId);
          const py = Number(t.peak.populationYear);
          if (Number.isFinite(py)) { withYear++; if (py < y0) y0 = py; if (py > y1) y1 = py; }
        }
      } else missing++;
    }
    // WHERE THE NUMBER COMES FROM, named on the plate. FEATURE_SPEC §1 charge 5
    // requires the analogous layer to name its quantity, its year and its
    // source; round 4's weight legend named the first two and not the third.
    const source = withYear
      ? `Every figure is the \`peak.population\` field of a territory in this dataset, with that territory's own \`peak.populationYear\` beside it: ${withYear} territories, census years ${y0}–${y1}. Where the shard names the census, the dossier prints it.`
      : 'Every figure is the `peak.population` field of a territory in this dataset.';
    return {
      metric: 'population',
      caption: 'Size is each territory’s own peak recorded population, in its own census year. It is not a population in this year, and not a cartogram of where those people lived.',
      shortCaption: 'Each territory’s own peak recorded population, in its own census year.',
      source,
      values, counted, missing,
    };
  },

  /**
   * P, S, W AND H OPEN THE ROW THEY BELONG TO — AND NOTHING ELSE.
   *
   * ROUND 8, MEASURED. Round 7 made this `ask:stage {level:'apparatus'}`, on
   * the reasoning that pressing a re-encoding key is the deliberate act level 2
   * is defined by. It is — but `apparatus` is not a permission, it is an
   * instruction to the shell to RESERVE A COLUMN beside the plate. At
   * 1366 x 768 pressing `W` moved the drawn map from 1366 x 462 to 962 x 462
   * and the plate fill from 100% to 70%: four hundred and four pixels of world
   * taken away at the exact second the sentence in the band read "Size is
   * people now, not land". A control that shrinks the thing it is a control
   * over is not a disclosure, it is a tax.
   *
   * The five tiles are this module's own furniture. They float over the
   * Southern Ocean, they are 395 x 46, and they cost the map nothing — so
   * opening them asks the shell for nothing. The only level this module ever
   * requests is `working`, and only because touching the atlas is what
   * `working` means (LAYOUT_BUDGET §3).
   */
  _revealModes() {
    if (!this._mounted) return;
    if (this._stage() === 'plate') this.ctx.bus.emit('ask:stage', { level: 'working' });
    this._setModes(true);
  },

  setWeight(w) {
    this._revealModes();
    /* COHERENCE PASS — ONE CONTRACT, WHICHEVER DOOR YOU CAME IN BY.
       `ask:sizeBy` on the bus coerced `values` from a plain object into a Map;
       this method, which is the same operation on the exposed API, did not, and
       `_paintFor` calls `values.get(id)`. So the module's own acceptance
       scenario — and any piece that reached the map directly rather than through
       the bus — died with "weight.values.get is not a function". Normalise here,
       where both doors lead. */
    if (w && w.values && !(w.values instanceof Map)) {
      w = { ...w, values: new Map(Object.entries(w.values).map(([k, v]) => [k, Number(v)])) };
    }
    this.weightState = w;
    this.el.dataset.weight = w ? w.metric : '';
    if (this.weightBtn) {
      this.weightBtn.setAttribute('aria-pressed', w ? 'true' : 'false');
      this.weightBtn.classList.toggle('is-on', !!w);
    }
    this.paintSig = '';
    this._repaint(true);
    if (w) {
      // Count what was actually drawn, not what was offered: places outside the
      // active definition are not part of this question at all.
      let counted = 0, missing = 0;
      for (const rec of this.plate.paint.values()) {
        if (rec.lost || rec.mode === 'hole' || rec.mode === 'informal') continue;
        if (rec.mode === 'absence') missing++; else counted++;
      }
      w.counted = counted; w.missing = missing;
    }
    this._renderReadout();
    this._syncOptions();
    this.ctx.bus.emit('map:weight', w ? { metric: w.metric, caption: w.caption, counted: w.counted, missing: w.missing } : null);
    if (w) {
      const n = this.ctx.format.number;
      this._sayReading('SIZE — PEOPLE, NOT LAND',
        '<strong>Size is people now, not land.</strong> '
        + `${n(w.counted)} carry a cited figure`
        + (w.missing ? `; ${n(w.missing)} draw as an absence` : '')
        + '.');
    } else {
      this._sayReading('SIZE — LAND AGAIN',
        '<strong>Size is land area again.</strong> Which makes Canada look like a fifth of it.');
    }
    this.ctx.util.announce(w
      ? `Weight mode on. ${w.counted} places carry a figure; ${w.missing} draw as an absence.`
      : 'Weight mode off. Size is land area again.');
  },

  /* ==================================================== stitching ======== */

  /**
   * Charge 4c, made operable. A map's visual weight is area, and the empire's
   * load-bearing points were dots: Gibraltar, Malta, Aden, Perim, Socotra,
   * Ascension, St Helena, Singapore, Hong Kong Island, Bermuda. In this view
   * every unit the geometry index calls tiny is drawn at ONE fixed size,
   * whatever its square mileage, and the continents are ghosted behind them.
   * The argument the coursebook makes in a sentence becomes the picture.
   */
  setStitch(on) {
    const next = !!on;
    if (next === this.stitch) return;
    this.stitch = next;
    this.el.dataset.stitch = next ? 'on' : '';
    this.stitchBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
    this.stitchBtn.classList.toggle('is-on', next);
    this._revealModes();
    this.plate.setStitch(next);
    this.paintSig = '';
    this._repaint(true);
    let n = 0, tagged = 0;
    for (const [uid, rec] of this.plate.paint) {
      if (!this.plate.isTiny(uid)) continue;
      n++; if (rec.stitchKind) tagged++;
    }
    this.stitchCount = n; this.stitchTagged = tagged;
    this._renderReadout();
    this._syncOptions();
    this.ctx.bus.emit('map:stitch', { on: next, drawn: n, tagged });
    this._sayReading(next ? 'THE SMALL PLACES' : 'SIZE — LAND AGAIN', next
      ? `<strong>Every small place at one size.</strong> ${this.ctx.format.number(n)} of them; `
        + `${this.ctx.format.number(tagged)} were bases or chokepoints.`
      : '<strong>Size is land area again.</strong> Gibraltar and Aden go back to being specks.');
    this.ctx.util.announce(next
      ? `Stitching view. ${n} small places drawn at one size; ${tagged} of them tagged in the dataset as coaling stations, bases, forts or chokepoints, joined by the shortest chain that links all ${tagged}. The lines are measured great-circle distances between the stations, not sailing routes and not cables: this dataset holds no cited route.`
      : 'Stitching view off. Size is land area again.');
  },

  /**
   * Weight mode, on a key and on a button.
   *
   * The default metric is the one this module can source itself and cite: each
   * territory's own peak recorded population, in that territory's own census
   * year. It is a floor, it says so on the card, and every territory with no
   * cited figure draws as an absence rather than as a zero. Press W at 1913
   * and Canada — a fifth of the plate — collapses to a sliver while India
   * swells into a red mass. That is charge 4b demonstrated instead of asserted.
   */
  toggleWeight() {
    if (this.weightState) { this.setWeight(null); return; }
    const w = this._builtInPopulation(this.ctx.store.getState().year);
    w.builtIn = true;
    this.setWeight(w);
  },

  /**
   * Silences, on a key and on a button (charge 7, and charge 9's second half).
   *
   * Two kinds of absence, both real, both in the dataset's own words:
   *   · a destroyed record — the unit draws as coastline with bare paper
   *     inside, and the legend's sentence is "no record was allowed to survive
   *     here", never "no data";
   *   · geometry this atlas has not got — the unit stays drawn and takes a
   *     pinned note saying what happened inside it that no line here can show.
   */
  setSilenceMode(on) {
    const next = !!on;
    if (next === this.silenceMode) return;
    /* A MODE THAT MAKES THE MAP WORSE AND RETURNS NOTHING IS NOT A MODE.
       Round 7 shipped this: press H at 1901, every one of the two hundred
       drawn shapes drops to half alpha so that the seven empty ones stand out,
       and then the band reports "No hole can be drawn at 1901." The whole
       plate was degraded to say that there was nothing to see. It is now a
       question asked before the mode is entered: if this year has no hole, the
       map is left exactly as it is and the band offers the first year that
       does — which is the one thing a reader who pressed H actually wanted. */
    if (next && !this._holesAt(this.ctx.store.getState().year)) {
      this._offerHoleYear(this.ctx.store.getState().year);
      return;
    }
    this.silenceMode = next;
    this.el.dataset.silence = next ? 'on' : '';
    this.silenceBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
    this.silenceBtn.classList.toggle('is-on', next);
    this._revealModes();
    if (next) {
      this.silences = new Map(this._derivedSilences());
      this.silenceAsked = [...this.silences.keys()];
      this.silenceSource = 'dataset';
    } else if (this.silenceSource === 'dataset') {
      this.silences = new Map();
      this.silenceAsked = [];
      this.silenceSource = null;
    }
    this.paintSig = '';
    this._repaint(true);
    this._renderReadout();
    this._syncOptions();
    let drawn = 0;
    for (const rec of this.plate.paint.values()) if (rec.mode === 'hole') drawn++;
    const notes = this._undrawableNow().length;
    this.ctx.bus.emit('map:silence', { asked: this.silenceAsked.length, drawn, unitIds: this.silenceAsked, notes, from: 'map' });
    if (next && !drawn) {
      /* THE ESTIMATE SAID YES AND THE PLATE SAYS NO. `_holesAt` reads the
         dataset's dates; whether the ground is painted at all also depends on
         the active definition, which the estimate cannot know. Rather than
         leave the reader in a mode that has drained the plate and drawn
         nothing, back out of it and make the same offer. */
      this.setSilenceMode(false);
      this._offerHoleYear(this.ctx.store.getState().year);
      return;
    }
    if (next) {
      const names = this._silenceNames(1);
      this._sayReading('WHAT IS NOT HERE',
        `<strong>${this.ctx.format.number(drawn)} ${drawn === 1 ? 'shape is' : 'shapes are'} empty`
          + `${names ? ' — ' + names : ''}.</strong> No record was allowed to survive there.`);
    } else {
      this._sayReading('THE RECORD, AS FILED',
        '<strong>Silences off.</strong> The plate is filled again, as every imperial map is.');
    }
    this._syncSilenceBtn();
    this.ctx.util.announce(next
      ? `Silences on. ${drawn} ${drawn === 1 ? 'place is' : 'places are'} drawn as coastline with bare paper inside, because the record was destroyed. ${notes} more ${notes === 1 ? 'carries a note' : 'carry notes'} about something this atlas has no geometry for.`
      : 'Silences off.');
  },

  /**
   * THE YEARS THIS PLATE CAN DRAW A HOLE IN.
   *
   * One number per derived silence: the first year at which BOTH gates in
   * `_silenceLive` are open — the record has been destroyed, and the ground is
   * somewhere this map is already drawing. It reads the same two fields the
   * paint path reads, so the control can never promise a hole the plate then
   * declines to draw. `firstHeld` is built once in `_precompute` and does not
   * move with the definition or the year, so this is computed once too.
   */
  _holeYears() {
    if (!this._holeYearsCache) {
      const out = [];
      for (const [uid, sil] of this._derivedSilences()) {
        const first = this.firstHeld ? this.firstHeld.get(uid) : null;
        if (!Number.isFinite(sil.from) || !Number.isFinite(first)) continue;
        // `_silenceLive` opens the second gate at `year > first` for a unit
        // that is NOT currently drawn and at `year >= first` for one that is.
        // A unit is only drawn from `first` onward, so the year the plate can
        // first put a hole in it is `max(from, first)` — not `first + 1`,
        // which under-reported by one year on every span that begins in the
        // same year the record was destroyed.
        out.push(Math.max(sil.from, first));
      }
      this._holeYearsCache = out.sort((a, b) => a - b);
    }
    return this._holeYearsCache;
  },

  /** How many holes this plate could draw at `year`. */
  _holesAt(year) {
    let n = 0;
    for (const y of this._holeYears()) { if (y <= year) n++; else break; }
    return n;
  },

  /** The first year in the whole atlas at which a hole exists, or null. */
  _firstHoleYear() { const ys = this._holeYears(); return ys.length ? ys[0] : null; },

  /**
   * What H says at a year that has no hole. Not "no data" and not a drained
   * plate: a date, and a way to get to it. The dates are the reason the
   * records were destroyed when they were, so the offer is itself the content.
   */
  _offerHoleYear(year) {
    const f = this.ctx.format;
    const first = this._firstHoleYear();
    this._revealModes();
    this._syncSilenceBtn();
    if (first == null) {
      this._sayReading('WHAT IS NOT HERE',
        '<strong>No destroyed record in this atlas has a date and a place.</strong> '
        + 'The absences it can show are written on the territories themselves, not on the paper.');
      this.ctx.util.announce('This atlas has no silence it can draw as a hole.');
      return;
    }
    /* THE ONE KIND OF CONTROL THIS MODULE PUTS IN THE BAND: a thing to DO that
       the reader has not got yet, not a second copy of a door already on
       screen. It goes through `_sayReading` so that a later level change
       re-issues it intact rather than replacing it with a stale sentence. */
    this._sayReading('WHAT IS NOT HERE',
      `<strong>Nothing had been destroyed by ${f.year(year)} that this atlas can draw.</strong> `
        + `The first hole opens in ${f.year(first)}.`,
      { label: `Go to ${f.year(first)}`, emit: 'map:gotoSilence', payload: { year: first } });
    this.ctx.util.announce(`No record had been destroyed by ${year} that this map can draw as a hole. `
      + `The first is ${first}. The control in the sentence band goes there.`);
  },

  /** The Silences tile says, at every year, whether it has anything to draw. */
  _syncSilenceBtn() {
    if (!this.silenceBtn) return;
    const year = this.ctx.store.getState().year;
    const n = this._holesAt(year);
    const first = this._firstHoleYear();
    const off = !n && !this.silenceMode;
    this.silenceBtn.classList.toggle('is-unavailable', off);
    const sub = !off ? 'holes where a record was destroyed'
      : first == null ? 'nothing this atlas can draw as a hole'
        : `nothing yet — the first is ${this.ctx.format.year(first)}`;
    const el2 = this.silenceBtn.querySelector('.map__modesub');
    if (el2 && el2.textContent !== sub) el2.textContent = sub;
    this.silenceBtn.setAttribute('aria-label', `Silences — ${sub} (key H)`);
    this.silenceBtn.title = `Silences — ${sub} · key H`;
  },

  /**
   * The silence set, derived from the dataset at call time. Nothing cached, so
   * a dataset that grows a `silences[]` field tomorrow does not need this
   * module changed to stop using the pointer table — see `_wireBus`.
   */
  _derivedSilences() {
    const { data } = this.ctx;
    const out = [];
    for (const src of SILENCE_SOURCES) {
      const t = data.byId && data.byId.get(src.territoryId);
      if (!t) continue;
      const quote = textAt(t, src.quote);
      if (!quote) continue;
      const from = this._silenceYear(t, src);
      // NO DATE, NO HOLE. Round 3 drew Kenya as a coastline-only hole at 1700
      // — 195 years before Britain reached East Africa and 252 before anything
      // was burned — and captioned it "no record was allowed to survive
      // there". A silence is an event with a date, and an undated one is not
      // rendered at all rather than rendered at every date.
      if (!Number.isFinite(from)) continue;
      for (const u of t.units || []) {
        out.push([u, {
          reason: quote, agent: src.agent || null, agentNote: src.agentNote || null,
          from, fromNote: src.fromNote || null,
          territoryId: t.id, territoryName: t.name || t.id,
        }]);
      }
    }
    return out;
  },

  /** The year a silence begins, read out of the territory's own record. */
  _silenceYear(t, src) {
    const { data } = this.ctx;
    const f = src.from || {};
    if (f.keyDate) {
      const kd = ((t.pedagogy && t.pedagogy.keyDates) || t.keyDates || [])
        .find((k) => f.keyDate.test(String((k && k.what) || '')));
      const y = kd && data.readDate ? (data.readDate(kd.date) || {}).year : null;
      if (Number.isFinite(y)) return y;
    }
    if (f.yearIn) {
      const m = /\b(1[5-9]\d\d|20\d\d)\b/.exec(textAt(t, f.yearIn) || '');
      if (m) return Number(m[1]);
    }
    return NaN;
  },

  /**
   * Is this unit's silence live at this year?
   *
   * Two gates, both of which round 3 was missing: the record must already have
   * been destroyed, and the place must be somewhere this map is drawing. A
   * hole in paper nobody has claimed yet is not a silence; it is a mistake.
   */
  _silenceLive(sil, uid, year, drawnNow) {
    if (!sil) return false;
    if (Number.isFinite(sil.from) && year < sil.from) return false;
    if (drawnNow) return true;
    const first = this.firstHeld.get(uid);
    return Number.isFinite(first) && year > first;
  },

  /** The units carrying a "this atlas has no geometry for it" note right now. */
  /**
   * WHY THIS NO LONGER WAITS FOR A KEYSTROKE.
   *
   * These two notes — the raupatu acreage New Zealand's own shard records, and
   * the villagisation figure Kenya's does — are the best writing this module
   * puts on the plate, and charges 9 and 10 are answered here or nowhere.
   * Round 4 rendered them only after the student pressed H, which is a mode
   * most students never enter, so the plate's answer to the two charges was
   * invisible in the default state. They are standing content now: whenever
   * the year is past the date the shard gives and the ground is on the plate,
   * the note is on the card.
   */
  _undrawableNow() {
    const { data, store } = this.ctx;
    const year = store.getState().year;
    const out = [];
    for (const u of UNDRAWABLE) {
      const t = data.byId && data.byId.get(u.territoryId);
      if (!t) continue;
      const kd = ((t.pedagogy && t.pedagogy.keyDates) || []).find((k) => u.sinceKeyDate.test(String((k && k.what) || '')));
      const since = kd && data.readDate ? (data.readDate(kd.date) || {}).year : null;
      if (since == null || year < since) continue;
      if (!this.plate.paint.has(u.unitId)) continue;
      out.push({ ...u, since, when: kd && kd.what, quoteText: sentenceWith(textAt(t, u.quote), u.pick), lineText: textAt(t, u.line), territory: t });
    }
    return out;
  },

  /**
   * The network drawn in the Stitching view — and what it is not.
   *
   * Charge 4c commits to "the coaling and cable network between them". This
   * dataset holds no cited cable or coaling route, and round 2 therefore drew
   * nothing and said so, which is honest and is also half a mechanism. So the
   * plate draws the one connection it can compute rather than quote: a minimum
   * spanning tree over the stations the dataset itself tags, weighted by the
   * great-circle distance between their centroids in this atlas's own geometry.
   * It is the shortest set of legs that reaches every station. It is not a
   * route, it is not a cable, and the card says so in exactly those words. What
   * it shows is that the tagged stations are not scattered: the cheapest way to
   * join them is a line from the Channel to the China Sea, which is CHAMPION
   * §4's sentence — a system of communications before it was a territory —
   * turned into something a student can measure.
   */
  _stitchNet() {
    const meta = this.ctx.data.unitMeta;
    const nodes = [];
    for (const [uid, rec] of this.plate.paint) {
      if (!rec.stitchKind || !this.plate.isTiny(uid)) continue;
      const m = meta && meta.get(uid);
      const c = m && (m.centroid || m.point);
      if (Array.isArray(c)) nodes.push({ uid, c });
    }
    if (nodes.length < 2) return [];
    // Prim's algorithm, 16 nodes: 256 distances, computed once per paint.
    const inTree = new Set([nodes[0].uid]);
    const legs = [];
    while (inTree.size < nodes.length) {
      let best = null;
      for (const a of nodes) {
        if (!inTree.has(a.uid)) continue;
        for (const b of nodes) {
          if (inTree.has(b.uid)) continue;
          const km = haversineKm(a.c, b.c);
          if (!Number.isFinite(km)) continue;
          if (!best || km < best.km) best = { a: a.uid, b: b.uid, km };
        }
      }
      if (!best) break;
      inTree.add(best.b);
      legs.push(best);
    }
    // The claim the picture makes is "a chain, not a cluster", so measure it:
    // the longest unbroken run through the tree, in stations and in kilometres.
    // Two depth-first walks — the far end of one is an end of the diameter.
    const adj = new Map();
    for (const l of legs) {
      if (!adj.has(l.a)) adj.set(l.a, []);
      if (!adj.has(l.b)) adj.set(l.b, []);
      adj.get(l.a).push([l.b, l.km]);
      adj.get(l.b).push([l.a, l.km]);
    }
    const walk = (from) => {
      const seen = new Set([from]);
      let far = { id: from, km: 0, hops: 1 };
      const stack = [[from, 0, 1]];
      while (stack.length) {
        const [id, km, hops] = stack.pop();
        if (km > far.km) far = { id, km, hops };
        for (const [nx, w] of adj.get(id) || []) {
          if (seen.has(nx)) continue;
          seen.add(nx);
          stack.push([nx, km + w, hops + 1]);
        }
      }
      return far;
    };
    const a = walk(nodes[0].uid);
    const b = walk(a.id);
    legs.longest = { stations: b.hops, km: b.km, from: a.id, to: b.id };
    return legs;
  },

  /* ==================================================== definition ======= */

  setDefinition(id, { announce = true } = {}) {
    const def = definitionById(id);
    if (!def || def.id === this.definition) return;
    this.definition = def.id;
    this.el.dataset.definition = def.id;
    if (this.weightState && this.weightState.builtIn) this.weightState = this._builtInPopulation(this.ctx.store.getState().year);
    this.paintSig = '';
    this._repaint(true);
    this._measure();
    this._syncOptions();
    this.ctx.store.dispatch('setFilter', { def: def.id === DEFAULT_DEFINITION ? null : def.id });
    const m = this.measures[def.id];
    this.ctx.bus.emit('map:definition', { id: def.id, label: def.label, measures: this.measures, year: this.ctx.store.getState().year });
    // Changing what the word means IS touching the atlas: level 1 is earned,
    // never asked for. The map requests; the shell decides (LAYOUT_BUDGET §3).
    this.ctx.bus.emit('ask:stage', { level: 'working' });
    this._hushReading();
    this._sayDefinition(def);
    this.ctx.bus.emit('map:setDefinition', { id: def.id, from: 'map' });
    if (announce) {
      this.ctx.util.announce(`${def.title}: ${this.ctx.format.number(m.units)} units, ${this.ctx.format.area(m.km2)}, ${m.territories} territories.`);
    }
  },

  /** Is there a cited quantity for informal influence yet? Today: no. */
  _influenceQuantity() {
    if (this._infl !== undefined) return this._infl;
    this._infl = (this.ctx.data.territories || []).some(
      (t) => (t.influence || []).some((i) => Number.isFinite(Number(i && i.value))));
    return this._infl;
  },

  _measure() {
    const { data, store } = this.ctx;
    const year = store.getState().year;
    const st = data.statusAt(year);
    this.measures = {};
    for (const def of DEFINITIONS) {
      const m = measure(st, data.unitMeta, def);
      m.population = population(m.territoryIds, data, year);
      this.measures[def.id] = m;
    }
    // THE ONE PLACE THE TWO ARITHMETICS DISAGREE, PRINTED RATHER THAN HIDDEN.
    //
    // `data.metricsAt(year).byDegree` counts every unit at control degree 1 or
    // more. This module's "claimed" excludes informal spheres, because a place
    // Britain dominated and never claimed is the whole content of charge 5. At
    // 1913 that is a difference of exactly one unit — Iran — and a student who
    // adds the legend's column up is entitled to know why the totals differ by
    // one rather than being told the map is wrong.
    const informalHeld = [];
    let degreeHeld = 0;
    for (const e of st.values()) {
      if (e.controlDegree >= 1) { degreeHeld++; if (e.status === 'informal-sphere') informalHeld.push(e.unitId); }
    }
    this.degreeHeld = degreeHeld;
    this.informalHeld = informalHeld;
    this.measuredYear = year;
    this._renderReadout();
  },

  _renderReadout() {
    // The card is a few dozen elements and `_markScroll()` reads scrollHeight,
    // which forces layout. Rebuilding it on every frame of a 600-frame scrub
    // was costing more than the map itself and producing main-thread stalls
    // long enough to trip the shell's throttle race (core/util.js:108). While
    // the clock is running it is rebuilt at most four times a second, and the
    // scroll measurement is deferred until the clock stops.
    if (this.ctx.store.getState().playing) {
      const now = performance.now();
      if (this._cardAt && now - this._cardAt < 250) {
        if (!this._cardT) this._cardT = setTimeout(() => { this._cardT = 0; this._renderReadout(); }, 260);
        return;
      }
      this._cardAt = now;
    } else {
      this._cardAt = performance.now();
    }
    if (this._stageNow === 'plate' && !this._sheetOpen) return;
    const { util, format } = this.ctx;
    const el = util.el;
    const year = this.ctx.store.getState().year;
    const active = definitionById(this.definition);
    this._renderDefChip(active);
    const m = this.measures && this.measures[active.id];
    if (!m) return;

    const mkDefs = (cls) => DEFINITIONS.map((d) => {
      const on = d.id === active.id;
      const b = el('button', {
        type: 'button', class: 'map__def' + cls + (on ? ' is-on' : ''),
        'aria-pressed': on ? 'true' : 'false',
        title: d.gloss,
      // A REAL SPACE BETWEEN THE NUMBER AND THE WORD. Without it a screen
      // reader says "1claimed" — the same run-together defect the critic
      // caught in the legend's compact fold and this module's own figures.
      }, [el('kbd', { class: 'map__defkey' }, d.key), document.createTextNode(' '), el('span', { class: 'map__defword' }, d.label)]);
      b.addEventListener('click', () => this.setDefinition(d.id));
      return b;
    });
    const buttons = DEFINITIONS.map((d) => {
      const on = d.id === active.id;
      const b = el('button', {
        type: 'button', class: 'map__def' + (on ? ' is-on' : ''),
        'aria-pressed': on ? 'true' : 'false',
        title: d.gloss,
      }, [el('kbd', { class: 'map__defkey' }, d.key), document.createTextNode(' '), el('span', { class: 'map__defword' }, d.label)]);
      // In the one-row rail only the definition in force is visible, so the
      // tap has to move to the next one; anywhere else it sets the one named.
      b.addEventListener('click', () => this.setDefinition(d.id));
      return b;
    });

    const pop = m.population;
    const fig = (label, value, note, mod) => el('div', { class: 'cx-fig map__fig' + (mod ? ' ' + mod : '') }, [
      el('span', { class: 'cx-fig__v map__figv num' }, value),
      // A real space between the figure and its label. Without it a screen
      // reader reads "no figurepeople" and "193units drawn" — the same
      // run-together defect the critic caught in the legend's compact fold.
      document.createTextNode(' '),
      el('span', { class: 'cx-fig__l map__figl' }, label),
      note ? el('span', { class: 'map__fign' }, note) : null,
    ].filter(Boolean));

    const rows = [
      fig('units drawn', format.number(m.units), `of ${format.number(this.plate.geom ? this.plate.geom.shapes.size : 0)} on the map`),
      fig('land', format.area(m.km2), m.unitsWithoutArea ? `${m.unitsWithoutArea} with no area figure` : 'summed from the units'),
      /* COHERENCE PASS — THE TERRITORY COUNT IS PRINTED ONCE, IN THE KEY.
         "182 units · 132 territories · 25 million km²" was set three times on
         one screen in three type systems: here, in the corner key on the other
         margin, and under the year in the time bar. The key owns the totals
         (FEATURE_SPEC P17); this card owns the switch and what pressing it
         does, so it keeps only the two figures the switch itself moves and the
         population hole it cannot fill. */
      // THE POPULATION HOLE. This dataset carries one population figure per
      // territory: its own peak, in its own census year. Summing those and
      // printing the total under the header "1913" is what round 1 did, and it
      // produced 945 million for a year in which the single largest contributor
      // was Great Britain's census of 2021. That is a fabricated figure however
      // carefully it is captioned, and FEATURE_SPEC's rule 3 is unambiguous:
      // where there is no figure we draw a hole and say so. This is the hole.
      fig('people', 'no figure',
        `nothing in this dataset counts the people under this definition in ${format.year(year)}`,
        'cx-fig--none map__fig--hole'),
    ];

    const kids = [];
    // The mode captions go directly under the buttons, ABOVE the figures.
    // Round 2 put them below and the card clipped: in the Stitching view the
    // sentence explaining what the student was looking at was the one thing
    // scrolled out of sight. The sentence that says what mode you are in is
    // the most load-bearing text on the card, so it is never below the fold.
    const notes = [];
    if (this.noGeo) {
      kids.push(el('p', { class: 'map__nogeo' },
        'No geometry loaded, so there is no plate to draw. The counts below are still real, and still come from the dataset — this is a missing file, not a missing history.'));
    }
    /* THE YEAR IS NOT PRINTED HERE. It is 27px high in the time bar and it was
       being set a second time, in a second type system, six inches away. One
       noun, one place (LAYOUT_BUDGET §5). */
    const head = [
      el('h2', { class: 'map__switchttl' }, [
        el('span', { class: 'map__switchword' }, 'British'),
        el('span', { class: 'map__switchmeans' }, 'means'),
      ]),
      el('div', { class: 'map__defs', role: 'group', 'aria-label': 'Definition of British' }, buttons),
    ];
    // What the word the student just pressed actually MEANS, immediately under
    // the button that set it. Round 3 had it below the totals and the caveats,
    // which on most plates put it behind the fold; the coherence pass moved it
    // into the pinned head, because a switch whose meaning scrolls away is a
    // switch a student presses without learning anything.
    const figsEl = el('div', { class: 'map__figs' }, rows);
    // The gloss and the standing caveats come after the totals, and the caption
    // for whatever MODE is running comes before both: if a student has just
    // pressed Stitching or turned on weight mode, the sentence explaining what
    // they are now looking at must be above the fold of this card, not below it.
    const tail = [];

    const narrow = this.el.clientWidth < 736;      // the same 46rem the CSS uses
    if (active.id === 'influenced') {
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, narrow
        ? [
          el('strong', {}, 'An argument, not a measurement. '),
          'The dashed shapes were never claimed — they were dominated. Gallagher and Robinson (1953). Stretched far enough, the idea becomes unfalsifiable.',
        ]
        : [
          el('strong', {}, 'This layer is an argument, not a measurement. '),
          'The dashed shapes were never claimed. They were dominated: by trade, by debt, by the navy. The reading is Gallagher and Robinson, ',
          el('em', {}, 'The Imperialism of Free Trade'),
          ' (1953). The objection to it: stretched far enough, it becomes unfalsifiable.',
          this._influenceQuantity()
            ? ''
            : ' No radius is drawn here, because no cited figure for the pressure exists in this dataset.',
        ]));
    }
    if (this.weightState && this.weightHeld) {
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode map__caveat--held' }, [
        el('strong', {}, `${format.number(this.weightHeld)} ${this.weightHeld === 1 ? 'shape is' : 'shapes are'} held at true size. `),
        'The dataset says British control did not fill ',
        this.weightHeld === 1 ? 'it' : 'them',
        ' — they are drawn cut by bands of bare ground for exactly that reason — so they may shrink under a weight and may not grow. ',
        'At 1640 the Company\u2019s five coastal factories each carried British India\u2019s peak population of 389 million, counted in 1941, and each was drawn four and a half times its own size: an orange mass over the subcontinent in a year when the Company held a few hundred acres. ',
        'The shard\u2019s own instruction for those years reads ',
        el('q', { class: 'map__quote' }, 'Draw these as dots, not provinces'),
        '.',
      ]));
    }
    if (this.weightState) {
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, narrow
        ? [
          el('strong', {}, 'Size is not area. '),
          this.weightState.shortCaption || this.weightState.caption,
          this.weightState.missing ? ` ${this.weightState.missing} places carry no figure and draw as an absence.` : '',
        ]
        : [
          el('strong', {}, 'Size is not area here. '), this.weightState.caption,
          this.weightState.missing ? ` ${this.weightState.missing} places carry no figure and are drawn as an absence, not as a zero.` : '',
          ' Nothing moves: each shape grows about its own centre. Where two overlap, both held more than the map has room for.',
        ]));
      if (this.weightState.source) {
        notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode map__caveat--src' }, [
          el('strong', {}, 'Where the figures come from. '), this.weightState.source,
        ]));
      }
    }
    // What the dataset does hold, and why it cannot be added up. This is the
    // teaching, not an apology: a student who understands why these numbers
    // will not sum has learned something about historical demography.
    if (this.silences.size || this.silenceAsked.length) {
      // Count what was DRAWN, not what was asked for. A caller naming five
      // places of which one has geometry here gets told exactly that.
      let drawn = 0;
      for (const rec of this.plate.paint.values()) if (rec.mode === 'hole') drawn++;
      const asked = this.silenceAsked.length;
      const bits = [el('strong', {}, 'The holes are silences. ')];
      if (this.silenceSource === 'dataset') {
        bits.push('This dataset has no ');
        bits.push(el('code', {}, 'silences[]'));
        bits.push(' field yet, so the legend still reports none filed. These are derived from the shards\u2019 own sentences about records that were destroyed, and each one quotes the sentence it came from. ');
      }
      if (drawn) {
        bits.push(`${format.number(drawn)} ${drawn === 1 ? 'place is' : 'places are'} drawn as coastline with bare paper inside: no record was allowed to survive there.`);
      } else {
        bits.push('None of them can be drawn on this plate.');
      }
      if (asked > drawn) {
        const unknown = this._unknownUnits ? this._unknownUnits(this.silenceAsked) : [];
        // WHY a named silence is not drawn. The commonest answer is the one
        // round 3 got wrong by drawing it anyway: the record still existed in
        // this year. Naming that year is the teaching — a silence has a date.
        let notYet = Infinity;
        for (const u of this.silenceAsked) {
          const s = this.silences.get(u);
          if (s && Number.isFinite(s.from) && s.from > year) notYet = Math.min(notYet, s.from);
        }
        bits.push(` ${format.number(asked - drawn)} more ${asked - drawn === 1 ? 'was named and is not' : 'were named and are not'} drawn`);
        if (unknown.length) {
          bits.push(`: this atlas has no geometry for ${unknown.slice(0, 4).join(', ')}. The absence of the record and the absence of the shape are two different holes, and only one of them can be drawn.`);
        } else if (Number.isFinite(notYet)) {
          bits.push(`, because in ${format.year(year)} those records still existed. The earliest of these destructions is ${format.year(notYet)}; a hole cannot be older than the act that made it.`);
        } else {
          bits.push(' at this year and this definition, so the absence is stated here rather than shown.');
        }
      }
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, bits));
    }
    if (this.stitch) {
      const net = (this.plate.net || []);
      const km = net.reduce((a, l) => a + l.km, 0);
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, [
        el('strong', {}, 'Size is off. '),
        `${format.number(this.stitchCount || 0)} small places, all at one fixed size whatever their area; the landmasses are ghosted behind them. ${format.number(this.stitchTagged || 0)} are ringed: the dataset tags those a coaling station, naval base, fort, treaty port or chokepoint.`,
      ]));
      if (net.length) {
        notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, [
          el('strong', {}, 'The dotted lines are not a route. '),
          `No cited cable or coaling route exists in this dataset, and a line drawn from memory would be the one invented thing on the plate. This is the shortest network that reaches all ${format.number(net.length + 1)} ringed stations — each joined to its nearest unjoined neighbour — measured as great-circle distance between their centroids in this atlas's own geometry, computed here, not quoted. `,
          el('span', { class: 'num' }, format.number(Math.round(km))),
          ' km of legs in total.',
        ]));
        const L = net.longest;
        if (L && L.stations > 2) {
          const nameOf = (uid) => this.plate.labelText ? this.plate.labelText(uid, this.plate.paint.get(uid) || {}) : uid;
          notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, [
            el('strong', {}, 'A chain, not a cluster. '),
            `The longest unbroken run through that network is ${format.number(L.stations)} of the ${format.number(net.length + 1)} stations and `,
            el('span', { class: 'num' }, format.number(Math.round(L.km))),
            ` km, from ${nameOf(L.from)} to ${nameOf(L.to)}. That is the coursebook's sentence — a system of communications before it was a territory — with a number on it.`,
          ]));
        }
      }
    }
    // WHAT THE GREY SHAPES ARE. Round 4 drew fifty of them on the 1900 plate,
    // named four in the same black type as Egypt, and explained none: the
    // legend's colour counts cover only the units with a status this year.
    let ghosts = 0;
    for (const rec of this.plate.paint.values()) if (rec && rec.lost) ghosts++;
    if (ghosts) {
      const named = (this.plate.labelsDrawn || []).filter((l) => l.lost).length;
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--ghost' }, [
        el('strong', {}, 'The grey shapes were British once. '),
        `${format.number(ghosts)} ${ghosts === 1 ? 'place is' : 'places are'} drawn on this plate that Britain held at some point and did not hold in ${format.year(year)} — hatched, no status colour`,
        named ? `, and the ${format.number(named)} named ${named === 1 ? 'one is' : 'ones are'} set in italic so a ghost is never mistaken for a possession. ` : '. ',
        'Hover any of them for the years it was held and how that ended.',
      ]));
    }
    // WHEN THE PLATE IS MOSTLY UNDER SOMEBODY ELSE'S PANEL, SAY SO AND SAY
    // WHAT TO DO. On a 390 x 844 phone the stage this map is given is 183px
    // tall and the byline covers most of it; the honest move is not to pretend
    // otherwise but to point at the control that fixes it.
    if (!this.enlarged && this.fitChoice && this.plateRect) {
      const area = this.plateRect.w * this.plateRect.h;
      if (area > 0 && this.fitChoice.clean / area < 0.55) {
        notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode map__caveat--cover' }, [
          el('strong', {}, 'Other panels are standing on this plate. '),
          `${format.percent(1 - this.fitChoice.clean / area)} of it is covered by the byline and the key, which this module cannot move. `,
          'Press E, or the Enlarge key, and the plate fills the window with nothing over it.',
        ]));
      }
    }
    const undrawn = this._undrawableNow();
    for (const u of undrawn) {
      const bits = [el('strong', {}, `${u.title}, ${format.year(u.since)}. `)];
      if (u.quoteText) bits.push(el('q', { class: 'map__quote' }, u.quoteText), ' ');
      bits.push(u.why);
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode map__caveat--undrawn' }, bits));
    }

    if (this.highlightNote) {
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, [
        el('strong', {}, 'Showing a set. '),
        this.highlightNote,
      ]));
    }

    if (pop.counted) {
      const bits = [
        el('strong', {}, 'Why not. '),
        `One count per territory, at its own peak, in its own census year: ${format.number(pop.counted)} of ${format.number(m.territories)} carry one`,
        pop.earliest ? `, across ${format.yearRange(pop.earliest, pop.latest)}` : '',
        '. ',
        pop.after
          ? `${format.number(pop.after)} were counted after ${format.year(year)}. Summed, they would total no year at all.`
          : 'They are peaks, not a snapshot, so they do not sum to this year.',
      ];
      if (!notes.length) {
        tail.push(el('p', { class: 'cx-note map__caveat map__caveat--pop' }, bits.filter(Boolean)));
      }
    }
    // THE TRAP GOES ABOVE THE FOLD.
    //
    // Round 3 put the sentence that makes the whole Definition Switch mean
    // something — the same year, the same evidence, N units of difference — at
    // the very bottom of a card whose bottom 404px were unreachable. It is the
    // punchline of this control, so it now sits directly under the four
    // buttons, before the totals and before every caveat.
    const diff = this.measures.influenced.units - this.measures.controlled.units;
    kids.push(el('p', { class: 'map__delta' }, [
      `On the widest reading ${this.ctx.format.number(this.measures.influenced.units)} units are drawn; on the narrowest, `,
      el('span', { class: 'num' }, this.ctx.format.number(this.measures.controlled.units)),
      `. The same year, the same evidence, ${this.ctx.format.number(diff)} units of difference.`,
    ]));
    if (this.informalHeld && this.informalHeld.length) {
      const names = this.informalHeld.slice(0, 3).map((u) => this.ctx.data.unitName ? this.ctx.data.unitName(u) : u);
      const n = this.informalHeld.length;
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--informal' }, [
        el('strong', {}, 'Why the totals differ by ' + format.number(n) + '. '),
        `${format.number(this.degreeHeld)} units reach control degree 1 or more this year. `,
        `${n === 1 ? format.list(names) + ' is' : format.list(names) + (n > 3 ? ' and others are' : ' are')} `,
        'not counted as claimed, because Britain dominated ',
        n === 1 ? 'it' : 'them', ' without ever claiming ', n === 1 ? 'it' : 'them', '. Press 4 to draw ',
        n === 1 ? 'it' : 'them', ' back in.',
      ]));
    }
    // A dot that is not where the place is has to say so, on the plate's own
    // legend, or it is simply a wrong dot. Charge 4 again: a mark that has
    // moved is still a claim about position.
    const marks = this.plate._marks;
    if (marks && marks.movedCount) {
      notes.push(el('p', { class: 'cx-note map__caveat map__caveat--mode' }, [
        el('strong', {}, 'Some dots have been moved. '),
        `${format.number(marks.movedCount)} of the minimum-size marks would sit on top of each other at this zoom, so they are drawn on the nearest free paper instead — never more than ${format.number(marks.worstShiftPx)} pixels away, each with a hairline leader back to where the place actually is, and a tick on the true position. The dot is the size of the mark, not the size of the place, and where it has moved it is not the place either. Zoom in and they go home.`,
      ]));
    }
    kids.push(...notes, figsEl, ...tail);

    if (this.switchHead) this.switchHead.replaceChildren(...head);
    /* The long form is built into a DETACHED node. Nothing below this line is
       in the viewport until the reader asks for it, which is the whole of the
       round-6 change: the plate carries the control, the sheet carries the
       apparatus, and neither is a 26px box with prose cut off mid-word. */
    /* THE DIAL IS ALSO IN THE SHEET, AND ON A PHONE IT IS ONLY THERE.
       RESPONSIVE_LAW §5 takes the four-segment dial off the plate below 40rem
       — 844 = 46 bar + 110 lede + MAP + 32 ribbon + 280 panel + 184 time, and
       a 36px dial dock would spend the map down to 156 — and calls that a debt
       this module owns. This is the payment. The sheet is 410 x 716 with its
       own scroll and it is where the gloss for the definition in force already
       lives, so the control and the thing it explains are in one place. It is
       the same four ids, the same handler and the same `aria-pressed` state,
       rebuilt by this function on every change, so the two dials cannot
       disagree: there is one definition and it is `this.definition`. */
    this.switchBody.replaceChildren(
      el('div', { class: 'map__switch map__switch--sheet', role: 'group', 'aria-label': 'What “British” means' }, [
        el('h3', { class: 'map__sheetdial' }, 'On this plate, “British” means'),
        el('div', { class: 'map__defs', role: 'group', 'aria-label': 'Definition of British' }, mkDefs(' map__def--sheet ')),
      ]),
      el('h3', { class: 'cx-panel__title map__sheetttl' }, active.title),
      el('p', { class: 'map__gloss' }, active.gloss),
      ...kids,
      this.sheetTail,
    );
    this._syncSheet();
  },

  /* ==================================================== the sheet ======== */

  /**
   * WHERE THE APPARATUS WENT.
   *
   * Everything this module used to stand on the Atlantic in a 300 x 340 card —
   * the gloss for the definition in force, the three figures and the
   * population hole, and every caveat about what this rendering is doing to
   * the evidence — is here, in the rail, at 410 x 716, with its own scroll,
   * beside a live map. Not one sentence of it was deleted; it was clipped
   * mid-word before and it is whole now.
   */
  _openSheet() {
    if (!this.switchBody) return;
    this._sheetOpen = true;
    this._renderReadout();          // fills the node, then calls _syncSheet
    this._emitSheet();
  },

  _emitSheet() {
    const el = this.ctx.util.el;
    const body = el('div', { class: 'map__sheet' });
    body.appendChild(this.switchBody);
    this.ctx.bus.emit('ask:sheet', {
      id: 'map:reading',
      eyebrow: 'The plate',
      title: 'What this reading leaves out',
      node: body,
    });
  },

  /**
   * Keeping an open sheet honest costs nothing, and must not cost the reader
   * their scroll position. `switchBody` is the same node that was handed to
   * the shell, so `replaceChildren` above has already updated the sheet in
   * place; re-emitting `ask:sheet` would rebuild it and reset `scrollTop` to
   * zero — four times a second during playback, under the reader's thumb.
   */
  _syncSheet() {},

  /* ==================================================== staging ======== */

  /**
   * WHAT IS ON THE PLATE AT EACH LEVEL (LAYOUT_BUDGET §3).
   *
   *   plate      the world, and three zoom buttons. Nothing else. A reader who
   *              has not touched the atlas has nothing to compare a definition
   *              against, and the four-segment dial in front of them at second
   *              zero is four questions they have not asked yet.
   *   working    + the dial, + the two re-encodings that answer charge 4 with
   *              a picture rather than a claim: PROJECTION and WEIGHT. Round 6
   *              filed all five behind a word and then filed the word inside
   *              the row it opened, so both measured 0 x 0 at every level a
   *              mouse could reach and the only documented route in was a
   *              keystroke printed in screen-reader-only text. A door has to
   *              be on the outside of the room.
   *   apparatus  + Stitching, Silences and Enlarge, behind the one word.
   *   the sheet  the gloss, the figures, the population hole and every caveat,
   *              at any level, on a named control.
   */
  _stage() {
    const app = document.getElementById('app');
    const v = (app && app.dataset.stage) || 'plate';
    return v === 'working' || v === 'apparatus' ? v : 'plate';
  },

  _applyStage() {
    const st = this._stage();
    if (this._stageNow === st) return;
    this._stageNow = st;
    if (this.readout) this.readout.hidden = st === 'plate';
    if (this.defChip) this.defChip.hidden = st === 'plate';
    // ONE NEW CONTROL PER LEVEL, AND IT IS A DOOR, NOT A TRAY.
    //   plate      the zooms.
    //   working    + the four-segment dial, + the word "Other ways to draw
    //              this". Two objects, both on water, both closed.
    //   working    ...and the route into the sheet, in the dial's own head.
    //   apparatus  + the byline's column, which the shell reserves.
    // The five tiles are never a level: they are behind the word, at any level
    // from `working`, and they close again.
    if (this.controls) this.controls.hidden = st === 'plate';
    // ONE DOOR INTO THE SHEET, IN THE DIAL'S OWN HEAD, FROM `working` ON.
    // It is beside the four segments whose gloss, figures and caveats the
    // sheet holds, it does not move, and it is the only copy — see
    // `_sheetCta()` for why the band no longer carries a second one.
    if (this.moreBtn) this.moreBtn.hidden = st === 'plate';
    // Going back to `plate` closes the row. Going forward never opens it.
    this._setModes(st === 'plate' ? false : this._modesOpen === true);
    this._resayCtas();
    if (st !== 'plate') this._renderReadout();
    // The control dock is claimed at `working` and given back at `plate`: a
    // dock costs the map 36px whether or not there is a dial in it, and at
    // `plate` there is not (see _dockHosts).
    if (this._syncDocks()) { this.paintSig = ''; }
    // The strip is an obstacle the labels dodge, so a strip that has just
    // appeared has to be re-measured or it prints through "Great Britain".
    if (this._fitLater) this._fitLater();
  },

  /**
   * The door, and it is only a door. It opens and closes five tiles that stand
   * on water. It changes no level, reserves no column and takes no pixel of
   * map: see `_revealModes` for the measurement that settled that.
   */
  _toggleModes(want) {
    if (!this.modes || !this.modesBtn) return;
    if (this._stage() === 'plate') this.ctx.bus.emit('ask:stage', { level: 'working' });
    this._setModes(want === undefined ? !this._modesOpen : !!want);
  },

  /**
   * FIVE TILES, OR NONE. Round 7 split them into two tiers so Projection and
   * Weight arrived with the dial and the other three stayed behind the word.
   * The whole-app review measured what that produces: "a single territory
   * click unlocks the reading plate, the 5-button view tray, the 7-button
   * transport and 5 red links at once". Two of the five were part of that
   * flood. They are all behind the door now, and the door is one quiet word.
   */
  _setModes(open) {
    if (!this.modes || !this.modesBtn) return;
    this._modesOpen = !!open;
    this.modes.hidden = !this._modesOpen;
    this.modesBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (this._fitLater) this._fitLater();
  },

  /**
   * THE DIAL SPEAKS IN THE BAND, NOT IN A PANEL.
   *
   * A switch whose meaning is printed in 12px beside it is a switch a student
   * presses without learning anything, and the gloss that used to sit under
   * these four buttons was clipped mid-word at every viewport we measured. The
   * shell has one sentence slot at 19px (LAYOUT_BUDGET §6) and this is what it
   * is for: press 3 and the sentence in the band says what changed, at reading
   * size, with the route to the rest of it.
   */
  _sayDefinition(def) {
    const m = this.measures && this.measures[def.id];
    if (!m) return;
    const n = this.ctx.format.number(m.units);
    const say = typeof def.say === 'function' ? def.say(n) : `${def.sentence} — ${n} units.`;
    /* PRIORITY 52, NOT 45. chrome.js says its own uncounted version of this
       sentence at priority 50 and its comment asks P02 to "overwrite this
       sentence with the counted version by emitting ask:say at a higher
       priority". At 45 it never did: the band said "the word changed, not the
       map" and never said what it changed TO, in numbers, which is the entire
       content of the switch.
       It still stands down to the timeline, which says the same thing at 55
       with the delta in it — "56 units cross the line: 182 units become 126" —
       and a better route out of it. That is the right sentence and it should
       win. This one is the floor when the time bar is not running. */
    this._lastDef = { mark: 'BRITISH — ' + def.label.toUpperCase(), text: say };
    this.ctx.bus.emit('ask:say', {
      id: 'map:definition',
      priority: 52,
      mark: this._lastDef.mark,
      text: say,
      cta: this._sheetCta(),
    });
    clearTimeout(this._sayT);
    // It stands down rather than holding the band for the rest of the lesson:
    // the band belongs to whatever is happening now.
    this._sayT = setTimeout(() => {
      this._lastDef = null;
      this.ctx.bus.emit('ask:say', { id: 'map:definition', text: null });
    }, 20000);
  },

  /**
   * EVERY RE-ENCODING SAYS WHAT IT DID, IN ONE SENTENCE, IN THE ONE SLOT.
   *
   * Measured before this round: pressing P put "The word changed, not the map.
   * Nothing was taken or given up — British now means claimed" at 19px at the
   * top of the screen — a sentence about the definition, on the one action
   * that changes the map and not the word. W, S and H said nothing at all, so
   * the Weight cartogram and the Silences layer arrived under whatever
   * sentence happened to be up, now stale. The cause is upstream: the shell
   * treats any change to `state.filters` as a definition change, and this
   * module dispatches `setFilter { proj }`. It is fixed from this side, which
   * is where it can be fixed honestly: each re-encoding writes its own line at
   * priority 52 — above the shell's 50 — the moment it fires, and the shell's
   * sentence never reaches the screen.
   *
   * Each line has to do one job: say what the reader is now looking at, and
   * say what it costs. They stand down after 20 seconds; the band belongs to
   * whatever is happening now (LAYOUT_BUDGET §6).
   */

  /**
   * THE SAME DOOR IS NEVER PRINTED TWICE — AND IT IS PRINTED WHERE IT BELONGS.
   *
   * The route into this module's sheet used to be emitted as the sentence
   * band's control on every re-encoding, AND printed permanently in the dial's
   * own head. At `apparatus` both stood at once: the same five words in the
   * same colour, eleven hundred pixels apart, two of the six identically
   * weighted accent links the whole-app review counted on one screen.
   *
   * One of them had to go, and it is the band's. The band is the shell's one
   * control slot and it is worth more to this module as a place to put
   * something the reader has not got yet — "Go to 1910" — than as a second
   * copy of a door that is already on screen, four segments from the dial the
   * sheet is about. This module now writes a control into the band only when
   * the control is the next thing to DO, never when it is a place to read.
   *
   * It also removes a dependency on `.cx-cta[hidden]`, which chrome.css does
   * not honour: `.cx-cta { display: inline-flex }` has no `[hidden]` guard, so
   * `_setCta(null)` leaves the previous control on screen. Measured at
   * 1366 x 768: the band's button reports `hidden === true` and still paints.
   * That is the shell's line to add; nothing here relies on it any more.
   */
  _sheetCta() { return null; },

  _sayReading(mark, text, cta) {
    this.ctx.bus.emit('ask:say', {
      /* 56: above the shell's definition sentence (50) and above the
         timeline's better, counted version of it (55), which holds the band
         for twelve seconds. A re-encoding is not a competing topic — it is the
         thing the reader just did, and the band has to be describing what is
         on the plate now. Below the sweep (60), which is an authored sequence
         and outranks everything. */
      id: 'map:reading',
      priority: 56,
      mark,
      text,
      cta: cta || this._sheetCta(),
    });
    this._lastReading = { mark, text, cta: cta || null };
    this._saidReading = true;
    clearTimeout(this._readT);
    this._readT = setTimeout(() => this._hushReading(), 12000);
  },

  /**
   * A SENTENCE THAT IS STILL STANDING WHEN THE LEVEL CHANGES HAS THE WRONG
   * CONTROL ON IT. `_sheetCta()` answers "is the permanent door showing?", and
   * that answer changes at `apparatus` — so any sentence this module put up
   * before the change is re-issued with the control recomputed. Without this,
   * moving to `apparatus` with a mode sentence up printed "What this leaves
   * out" twice, eleven hundred pixels apart, which is the duplication the
   * whole-app review counted.
   */
  _resayCtas() {
    if (this._saidReading && this._lastReading) {
      this.ctx.bus.emit('ask:say', {
        id: 'map:reading', priority: 56,
        mark: this._lastReading.mark, text: this._lastReading.text,
        cta: this._lastReading.cta || this._sheetCta(),
      });
    }
    if (this._lastDef) {
      this.ctx.bus.emit('ask:say', {
        id: 'map:definition', priority: 52,
        mark: this._lastDef.mark, text: this._lastDef.text, cta: this._sheetCta(),
      });
    }
  },

  /**
   * The band belongs to whatever is happening NOW. A sentence about the
   * Stitching view still standing at 19px while the reader is pressing 3 is
   * the same defect this round was called to fix, pointing the other way.
   */
  _hushReading() {
    clearTimeout(this._readT);
    if (!this._saidReading) return;
    this._saidReading = false;
    this._lastReading = null;
    this.ctx.bus.emit('ask:say', { id: 'map:reading', text: null });
  },

  /* ==================================================== projection ======= */

  /** The one line the band says when the shape of the world changes. */
  _sayProjection(id) {
    /* EIGHTY-FIVE CHARACTERS. The band clamps at two lines and ellipsises the
       rest, and two lines on a 390px phone is about that. A sentence broken
       mid-word at the top of the screen teaches nothing, which is the rule
       this module was given for its own caveats and had not applied to its own
       sentences: measured at 390 x 844, six of these ran past the clamp. The
       rest of each argument is in the sheet, whole. */
    const say = id === 'equal-earth'
      ? '<strong>Equal Earth: every area here is true.</strong> Canada shrinks. Africa does not.'
      : '<strong>Mercator swells the north.</strong> Greenland is drawn the size of Africa.';
    this._sayReading(id === 'equal-earth' ? 'THE PAPER — EQUAL EARTH' : 'THE PAPER — MERCATOR', say);
  },

  /** Up to `n` of the places drawn as holes right now, in the plate's own words. */
  _silenceNames(n) {
    const out = [];
    for (const [uid, rec] of this.plate.paint) {
      if (rec.mode !== 'hole') continue;
      const name = this.plate.labelText ? this.plate.labelText(uid, rec) : null;
      if (name) out.push(name);
      if (out.length >= n) break;
    }
    if (!out.length) return '';
    const joined = this.ctx.format.list ? this.ctx.format.list(out) : out.join(', ');
    // The band clamps at two lines and puts an ellipsis on anything longer, so
    // a sentence that names "the Territory of Papua and New Guinea" and "the
    // Colony and Protectorate of Nigeria" would arrive broken. One name is
    // better than two halves.
    if (joined.length <= 24) return joined;
    return out[0].length <= 24 ? out[0] : '';
  },

  _renderProjButton() {
    const p = PROJECTIONS[this.projection];
    const other = PROJECTIONS[this.projection === 'mercator' ? 'equal-earth' : 'mercator'];
    const el = this.ctx.util.el;
    this.projBtn.replaceChildren(
      el('span', { class: 'map__modetop' }, [el('kbd', { class: 'map__modekey' }, 'P'), el('span', { class: 'map__modenow' }, p.label)]),
      el('span', { class: 'map__modesub' }, p.short),
    );
    this.projBtn.setAttribute('aria-label', `Projection: ${p.label} — ${p.short}. Switch to ${other.label}.`);
    this.el.dataset.projection = this.projection;
  },

  setProjection(id) {
    if (!PROJECTIONS[id] || id === this.projection || this.morph) return;
    const from = this.projection;
    this.projection = id;
    this.ctx.store.dispatch('setFilter', { proj: id === DEFAULT_PROJECTION ? null : id });
    /* SAID HERE, NOT AFTER THE MORPH. The shell's subscriber runs inside that
       dispatch and puts its definition sentence up at priority 50; the morph
       takes 560ms, so a sentence emitted at the end of it would leave the
       wrong one on screen for half a second at 19px. This runs in the same
       synchronous turn, so the wrong sentence never paints. */
    this._sayProjection(id);
    this._renderProjButton();
    this._revealModes();
    const reduced = this._reducedMotion();
    const dur = this._duration('--dur-deliberate', 560);

    if (reduced) {
      // A cross-fade, not a tween: the shape change still reads, the movement
      // does not happen.
      this._snapshot();
      this.plate.setProjectionState(id, id, 1);
      this._repaint(true);
      this._fade(dur);
      this._afterProjection(from);
      return;
    }
    this.plate.setProjectionState(from, id, 0);
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / dur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // ease-in-out cubic
      this.plate.setProjectionState(from, id, e);
      this.plate.draw();
      if (t < 1) { this.morph = requestAnimationFrame(step); }
      else {
        this.morph = null;
        this.plate.setProjectionState(id, id, 1);
        this._repaint(true);
        this._afterProjection(from);
      }
    };
    this.morph = requestAnimationFrame(step);
  },

  _afterProjection(from) {
    this.camera.commit(this.plate.view);
    this._repaint(true);
    this._syncOptions();
    this._emitProjection(from);
    this.ctx.util.announce(`${PROJECTIONS[this.projection].label} projection. ${PROJECTIONS[this.projection].caveat}`);
  },

  _emitProjection(previous = null) {
    const p = PROJECTIONS[this.projection];
    this.ctx.bus.emit('map:projection', {
      id: this.projection,
      // P17's byline speaks of an "equal-area" projection; give it the word it
      // reads as well as our own id, so the byline is never "not declared".
      projection: this.projection === 'equal-earth' ? 'equal-area' : this.projection,
      label: p.label, caveat: p.caveat, previous,
    });
  },

  _snapshot() {
    const c = this.fadeCanvas;
    c.width = this.canvas.width; c.height = this.canvas.height;
    c.style.width = this.canvas.style.width; c.style.height = this.canvas.style.height;
    c.getContext('2d').drawImage(this.canvas, 0, 0);
    c.style.opacity = '1';
    c.classList.add('is-on');
  },

  _fade(dur) {
    const c = this.fadeCanvas;
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / dur);
      c.style.opacity = String(1 - t);
      if (t < 1) requestAnimationFrame(step);
      else { c.classList.remove('is-on'); c.width = c.height = 1; }
    };
    requestAnimationFrame(step);
  },

  _reducedMotion() {
    const m = document.documentElement.dataset.motion;
    if (m === 'reduced') return true;
    if (m === 'full') return false;
    return this.ctx.util.prefersReducedMotion();
  },

  _duration(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const n = parseFloat(v);
    return Number.isFinite(n) ? (v.endsWith('ms') ? n : n * 1000) : fallback;
  },

  /* ==================================================== interaction ===== */

  _onView(v) {
    this.ctx.store.dispatch('setMapView', v);
    // The hand is on the map: draw at motion detail until it stops.
    this.plate.setMotion(true);
    if (this._stillT) clearTimeout(this._stillT);
    this._stillT = setTimeout(() => {
      this._stillT = 0;
      if (this.plate.setMotion(false)) { this.plate.draw(); this._syncOptions(); }
    }, 130);
    this.plate.draw();
    this._syncOptionsSoon();
    if (this._fineWanted && v.k >= 2.5 && !this.fineFlat) { this._fineWanted = false; this._loadFine(); }
  },

  _onHover(x, y) {
    if (x < 0) { this._setHover(null); return; }
    const uid = pick(this.plate, x, y);
    this._setHover(uid);
    if (uid) this._placeTip(x, y);
  },

  _setHover(uid) {
    if (uid === this.plate.hover) return;
    this.plate.hover = uid;
    this.frame.classList.toggle('is-over', !!uid);
    this.ctx.store.dispatch('hover', uid);
    const rec = uid && this.plate.paint.get(uid);
    this._renderTip(uid, rec);
    this.ctx.bus.emit('map:hover', { unitId: uid, territoryId: rec && rec.entry ? rec.entry.territoryId : null });
    this.plate.draw();
  },

  /**
   * The hover card.
   *
   * Round 2 had none, and no labels either, so the only way to learn the name
   * of a place was to click it and read the dossier — one place at a time, with
   * the map's whole point (comparison across a field) thrown away. A printed
   * plate names fifty places at once for free.
   *
   * The card says four things, in this order, and every one of them comes out
   * of the dataset: what this place was called in this year; what its status
   * was and how directly London ruled it; how long Britain had held it by now;
   * and HOW IT WAS TAKEN. The last line is the one the critic's verdict said
   * was missing everywhere — the map showing where and never why.
   */
  _renderTip(uid, rec) {
    const t = this.tip;
    if (!t) return;
    // A TOUCH IS NOT A HOVER. On a phone the pointer never leaves, so the card
    // stayed on screen after the tap that opened the dossier and covered both
    // the plate and the panel it had just opened. Touch gets the dossier,
    // which is the full answer; the card is for a pointer that can hover.
    if (this._touchPointer || !this._canHover()) { t.hidden = true; t.replaceChildren(); return; }
    if (!uid || !rec) { t.hidden = true; t.replaceChildren(); return; }
    const { util, format, data, store } = this.ctx;
    const el = util.el;
    const year = store.getState().year;
    const n = this._name(uid, rec);
    const rows = [el('p', { class: 'map__tipname' }, n.text)];

    if (rec.mode === 'hole') {
      rows.push(el('p', { class: 'map__tipwhat' }, 'No record was allowed to survive here.'));
      if (rec.reason) rows.push(el('p', { class: 'map__tipwhy' }, rec.reason));
      if (rec.agent) rows.push(el('p', { class: 'map__tipwho' }, ['Destroyed by ', rec.agent, '.']));
      else if (rec.agentNote) rows.push(el('p', { class: 'map__tipwho' }, rec.agentNote));
      if (Number.isFinite(rec.from)) {
        rows.push(el('p', { class: 'map__tipflag' },
          `This hole opens in ${format.year(rec.from)} and is not drawn before it.${rec.fromNote ? ' ' + rec.fromNote : ''}`));
      }
    } else if (rec.mode === 'informal') {
      rows.push(el('p', { class: 'map__tipwhat' }, 'Informal empire: dominated by Britain, never claimed by it.'));
      rows.push(el('p', { class: 'map__tipwhy' }, 'No fill and no border, because that is the distinction.'));
    } else if (rec.lost) {
      // A GHOST IS INTERROGABLE. It says what it was, for how long, and how it
      // ended — otherwise it is a grey shape with an italic name and no way in.
      const to = Number.isFinite(rec.heldTo) ? rec.heldTo : null;
      rows.push(el('p', { class: 'map__tipwhat' }, [
        'Held once, not in ', format.year(year), '.',
      ]));
      if (Number.isFinite(rec.heldFrom)) {
        rows.push(el('p', { class: 'map__tipheld num' },
          to != null ? `British ${format.yearRange(rec.heldFrom, to)} — ${format.duration(Math.max(0, to - rec.heldFrom))}`
            : `British from ${format.year(rec.heldFrom)}`));
      }
      const tid = rec.lastHolder || this._tidFor(uid, rec);
      const how = tid && to != null ? this._howEnded(tid, to) : null;
      if (how) rows.push(el('p', { class: 'map__tipwhy' }, [el('strong', {}, 'How it ended: '), how]));
    } else {
      const e = rec.entry;
      const status = e ? (this.statusLabel.get(e.status) || format.statusLabel(e.status)) : null;
      if (status) {
        rows.push(el('p', { class: 'map__tipwhat' }, [
          status,
          el('span', { class: 'map__tipdeg' }, ` · control degree ${e.controlDegree} of 5`),
        ]));
      }
      if (e && e.since != null) {
        const held = Math.max(0, year - e.since);
        rows.push(el('p', { class: 'map__tipheld num' },
          `British since ${format.year(e.since)} — ${held === 0 ? 'this year' : format.plural ? format.plural(held, 'year', 'years') : held + ' years'}`));
      }
      const how = this._howTaken(uid, e && e.territoryId, year);
      if (how) rows.push(el('p', { class: 'map__tipwhy' }, [el('strong', {}, 'How: '), how]));
      if (e && e.partial) rows.push(el('p', { class: 'map__tipflag' }, 'British control did not fill this unit.'));
      if (e && e.circa) rows.push(el('p', { class: 'map__tipflag' }, 'The date is approximate.'));
      if (e && e.contested) rows.push(el('p', { class: 'map__tipflag' }, 'Historians dispute this.'));
      if (rec.mode === 'absence') rows.push(el('p', { class: 'map__tipflag' }, 'No cited figure for the measure now sizing the map — drawn as an absence, not a zero.'));
      if (n.anachronism) rows.push(el('p', { class: 'map__tipflag' }, `Not yet called ${n.notYet}: ${n.anachronism}.`));
      if (rec.stitchKind) rows.push(el('p', { class: 'map__tipflag' }, `The dataset tags this ${rec.stitchKind}.`));
    }
    const note = this._undrawableFor(uid);
    if (note) rows.push(el('p', { class: 'map__tipflag' }, note.title + '. ' + note.why));
    t.replaceChildren(...rows);
    t.hidden = false;
  },

  /**
   * How THIS UNIT was taken — resolved to the unit, not to the territory.
   *
   * Round 3 printed the territory's latest acquisition under a unit heading,
   * and Hong Kong Island read "How: lease, 1898" — the New Territories lease,
   * under a heading naming the island that was ceded in perpetuity in 1842.
   * The cession/lease distinction is the whole legal spine of 1997, and 173 of
   * this atlas's 302 units sit in the 39 territories that carry more than one
   * acquisition, so the error was systemic rather than a Hong Kong quirk.
   *
   * The dataset names the units on each acquisition, so the answer is simply
   * to read it: the latest acquisition on or before this year that names THIS
   * unit. When an acquisition names no units it is territory-wide and applies.
   * When neither exists the label says what it is instead of pretending —
   * "the last thing that happened to <territory>".
   */
  _howTaken(unitId, territoryId, year) {
    if (!territoryId) return null;
    const t = this.ctx.data.byId && this.ctx.data.byId.get(territoryId);
    if (!t) return null;
    const upTo = (t.acquisitions || []).filter((a) => Number.isFinite(Number(a.year)) && Number(a.year) <= year)
      .sort((a, b) => a.year - b.year);
    if (!upTo.length) return null;
    const names = (a) => Array.isArray(a.units) && a.units.length;
    const mine = upTo.filter((a) => names(a) && a.units.includes(unitId));
    const wide = upTo.filter((a) => !names(a));
    let a = null, scope = 'unit';
    if (mine.length) a = mine[mine.length - 1];
    else if (wide.length) { a = wide[wide.length - 1]; scope = 'territory'; }
    else { a = upTo[upTo.length - 1]; scope = 'other'; }
    const mech = a.mechanism ? String(a.mechanism).replace(/-/g, ' ') : null;
    const how = a.how ? String(a.how) : null;
    const yr = this.ctx.format.year(a.year);
    const head = scope === 'other'
      ? `the last thing that happened to ${t.name || territoryId}: `
      : '';
    const body = mech && how
      ? `${mech}, ${yr}. ${how.length > 190 ? how.slice(0, 187).replace(/\s\S*$/, '') + '…' : how}`
      : mech ? `${mech}, ${yr}.` : how ? `${yr}. ${how}` : null;
    return body ? head + body : null;
  },

  /** How a territory stopped being British, in the dataset's own words. */
  _howEnded(territoryId, byYear) {
    const t = this.ctx.data.byId && this.ctx.data.byId.get(territoryId);
    if (!t) return null;
    const list = (t.departures || []).filter((d) => Number.isFinite(d.year) && d.year <= byYear + 1);
    if (!list.length) return null;
    const d = list[list.length - 1];
    const mech = d.mechanism ? String(d.mechanism).replace(/-/g, ' ') : null;
    const how = d.how ? String(d.how) : null;
    const yr = this.ctx.format.year(d.year);
    const body = mech && how
      ? `${mech}, ${yr}. ${how.length > 170 ? how.slice(0, 167).replace(/\s\S*$/, '') + '…' : how}`
      : mech ? `${mech}, ${yr}.` : how ? `${yr}. ${how}` : null;
    return body;
  },

  _undrawableFor(uid) {
    for (const u of this._undrawableNow()) if (u.unitId === uid) return u;
    return null;
  },

  /** `x, y` are plate coordinates; the card is placed in the window. */
  _placeTip(x, y) {
    const t = this.tip;
    if (!t || t.hidden) return;
    const p = this.frame.getBoundingClientRect();
    const b = t.getBoundingClientRect();
    const w = b.width || 240, h = b.height || 90;
    const vw = window.innerWidth, vh = window.innerHeight;
    let left = p.left + x + 16, top = p.top + y + 16;
    if (left + w > vw - 6) left = Math.max(6, p.left + x - w - 16);
    if (top + h > vh - 6) top = Math.max(6, p.top + y - h - 16);
    t.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
  },

  /** Is there a pointer that can hover, and a window with room for the card? */
  _canHover() {
    if (window.innerWidth < 620) return false;
    try { return matchMedia('(hover: hover)').matches; } catch (_) { return true; }
  },

  _onPick(x, y) {
    // The card is a hover affordance and the dossier is the answer to a click:
    // leaving a 20rem card standing after the tap that opened the panel put
    // both on top of each other on a phone. It comes back on the next move.
    if (this.tip) { this.tip.hidden = true; this.tip.replaceChildren(); }
    const uid = pick(this.plate, x, y);
    if (!uid) { this.ctx.store.dispatch('deselect'); return; }
    this._selectUnit(uid);
  },

  _selectUnit(uid) {
    const rec = this.plate.paint.get(uid);
    const tid = rec && rec.entry ? rec.entry.territoryId : this._territoryForUnit(uid);
    if (tid) this.ctx.store.dispatch('select', tid);
    this.activeUnit = uid;
    this.plate.focus = uid;
    this.ctx.store.dispatch('focusUnit', uid);
    this.plate.draw();
  },

  /**
   * BRING THE SELECTION INTO VIEW.
   *
   * Round 3: `#year=1866&sel=new-zealand` with the dossier open put New
   * Zealand's DOM target at (506,417) — on top of Tristan da Cunha, whose
   * tooltip is what a pointer there returned — and New Zealand itself was not
   * on the plate at all. Selecting a place and not being shown it is the one
   * thing a map may not do.
   *
   * The contain fit means nothing is off the plate at home any more, so this
   * fires when the camera is zoomed in, or when the selection lands under a
   * panel. It never changes the zoom: it pans, and the plate centre is inside
   * the free rectangle by construction.
   */
  _ensureSelectionVisible() {
    if (!this.plate || !this.plate.geom || !this.camera) return false;
    const units = this._selectedUnits();
    if (!units || !units.size) return false;
    const cam = this.plate.camera();
    const obs = this.plate.obstacles || [];
    let target = null, anyVisible = false;
    for (const uid of units) {
      const sc = this.plate.unitScreen(uid, cam);
      if (!sc) continue;
      if (!target) target = uid;
      const x = sc.mx, y = sc.my;
      const on = x > 4 && y > 4 && x < this.plate.w - 4 && y < this.plate.h - 4;
      const under = on && obs.some((o) => x > o.x && x < o.x + o.w && y > o.y && y < o.y + o.h);
      if (on && !under) { anyVisible = true; break; }
    }
    if (anyVisible || !target) return false;
    /* `fit: false` keeps this function's own promise, three paragraphs above:
       it pans, it never changes the zoom. The subject-size floor flyTo applies
       to a beat's request would zoom in here, and a map that jumps closer
       because a panel opened over the selection is not bringing it into view. */
    this.camera.flyTo(target, { zoom: this.plate.view.k, fit: false });
    this._repaint(true);
    this._syncOptions();
    this.ctx.util.announce(`Moved the map to show ${this._name(target, this.plate.paint.get(target)).text}.`);
    return true;
  },

  _territoryForUnit(uid) {
    const list = this.ctx.data.territoriesForUnit ? this.ctx.data.territoriesForUnit(uid) : null;
    return list && list.length ? list[0].id : null;
  },

  /* ==================================================== a11y targets ==== */

  _syncOptionsSoon() {
    if (this._optTimer) return;
    this._optTimer = setTimeout(() => { this._optTimer = 0; this._syncOptions(); }, 120);
  },

  _syncOptions() {
    if (!this.plate.geom) return;
    // The legend and the byline change height on their own — a fold opens, a
    // year changes their text — without ever resizing the plate, so the
    // obstacle set is re-measured here rather than only on resize. Six
    // getBoundingClientRect calls; it only repaints when something moved.
    /* WHERE THE FURNITURE STANDS IS RE-DECIDED HERE, not only on resize: a
       lesson beat flies the camera without changing a single box on screen,
       and the corner that was the north Pacific a moment ago is Bengal now.
       `_placeFurniture` is cheap (four rect scores against the drawn units)
       and it runs on this function's own 120ms debounce. */
    const placed = this._placeFurniture();
    if (this.plate.setObstacles(this._obstacleRects()) || placed) { this.paintSig = ''; this._repaint(true); }
    const cam = this.plate.camera();
    const { util, data } = this.ctx;
    const wanted = [];
    for (const [uid, rec] of this.plate.paint) {
      const s = this.plate.unitScreen(uid, cam);
      if (!s) continue;
      if (s.x1 < -60 || s.y1 < -60 || s.x0 > this.plate.w + 60 || s.y0 > this.plate.h + 60) continue;
      wanted.push([uid, rec, s]);
    }
    wanted.sort((a, b) => (b[2].w * b[2].h) - (a[2].w * a[2].h));   // small last = on top

    const seen = new Set();
    const frag = document.createDocumentFragment();
    let rebuilt = false;
    let rank = 0;
    for (const [uid, rec, s] of wanted) {
      seen.add(uid);
      rank++;
      let node = this.optionEls.get(uid);
      if (!node) {
        node = util.el('div', { class: 'map__target', role: 'option', id: 'map-u-' + uid, tabindex: '-1', 'aria-selected': 'false' });
        node.dataset.unit = uid;
        node.addEventListener('focus', () => this._focusUnit(uid, false));
        node.addEventListener('click', (ev) => { ev.stopPropagation(); this._selectUnit(uid); });
        this.optionEls.set(uid, node);
        frag.appendChild(node);
        rebuilt = true;
      }
      const w = Math.max(44, Math.min(s.w, this.plate.w * 0.5));
      const h = Math.max(44, Math.min(s.h, this.plate.h * 0.6));
      // THE TARGET SITS ON THE PLACE, NOT ON THE MIDDLE OF ITS BOX.
      //
      // Round 3 put a non-tiny unit's target at the centre of its bounding
      // box. New Zealand's geometry crosses the antimeridian, so its box is
      // 474px wide on a 480px world and its centre is in the mid-Atlantic:
      // `#year=1866&sel=new-zealand` put New Zealand's own target on Tristan
      // da Cunha. A bounding-box centre is also outside the shape for every
      // crescent — Malaysia, the Bahamas, Newfoundland-and-Labrador. The
      // geometry index carries a proper label point per unit; use it, and let
      // a deconflicted mark carry its target with it.
      const cx = s.tiny ? s.mx : s.px;
      const cy = s.tiny ? s.my : s.py;
      node.style.width = w + 'px';
      node.style.height = h + 'px';
      node.style.transform = `translate(${Math.round(cx - w / 2)}px, ${Math.round(cy - h / 2)}px)`;
      node.classList.toggle('is-tiny', !!s.tiny);
      // Stacking order is size, recomputed every sync. Round 2 left it at DOM
      // insertion order, which never changes, so once the New Territories'
      // target had been created before Hong Kong Island's it stayed on top of
      // it for the life of the page and Hong Kong Island was unfocusable.
      node.style.zIndex = String(rank);
      node.setAttribute('aria-label', this._describe(uid, rec));
    }
    if (rebuilt) this.targets.appendChild(frag);
    for (const [uid, node] of this.optionEls) {
      if (seen.has(uid)) continue;
      node.remove(); this.optionEls.delete(uid);
    }
    const active = this.activeUnit && this.optionEls.has(this.activeUnit) ? this.activeUnit : this._seedUnit(wanted);
    for (const [uid, node] of this.optionEls) node.tabIndex = uid === active ? 0 : -1;
    this.activeUnit = active;
    const sel = this._selectedUnits();
    for (const [uid, node] of this.optionEls) node.setAttribute('aria-selected', sel && sel.has(uid) ? 'true' : 'false');
    this.canvas.setAttribute('aria-label', this._plateLabel());
  },

  /**
   * WHERE A KEYBOARD ENTERS THE EMPIRE.
   *
   * `wanted` is sorted big-first so that the small marks are painted last and
   * therefore sit on top, and round 6 took the roving tabindex's default from
   * the END of that list — the smallest thing drawn. Measured at 1366 x 768,
   * year 1900: `document.querySelector('.map__target[tabindex="0"]')` was
   * `au-coral-sea-islands`, three uninhabited reefs annexed in 1879. A student
   * driving this atlas from the keyboard, or hearing it read aloud, met the
   * British Empire through its most obscure dot and had to arrow past two
   * hundred others to reach anything that carries an argument.
   *
   * The entry point is now editorial, and it is the same editorial list the
   * lesson is built on: the places DIDACTIC_SPEC §3 says must stick, in the
   * order that spec puts them in. The first one drawn in the year on the clock
   * wins; in a year when none of them is British yet, the largest thing on the
   * plate does, which in 1610 is Virginia and never a reef. A selection always
   * wins over both, so a deep link lands on what it named.
   */
  _seedUnit(wanted) {
    if (!wanted || !wanted.length) return null;
    const sel = this._selectedUnits();
    if (sel && sel.size) { for (const [uid] of wanted) if (sel.has(uid)) return uid; }
    const rank = new Map();
    for (const [uid, rec] of wanted) {
      const tid = this._tidFor(uid, rec);
      const i = tid ? SPINE_PLACES.indexOf(tid) : -1;
      if (i < 0) continue;
      let c = rank.get(i);
      if (!c) { c = { tid, first: uid, named: null }; rank.set(i, c); }
      // Within one territory, the unit that carries the territory's own name.
      // The Bengal Presidency is drawn as five modern states, and the largest
      // of them is Odisha; "West Bengal, in the Presidency of Fort William in
      // Bengal" is the door a reader can name. Falls back to the largest unit
      // drawn, which is what `wanted` is already sorted by.
      if (!c.named && this._sharesName(uid, rec, c.tid)) c.named = uid;
    }
    if (rank.size) {
      const c = rank.get(Math.min(...rank.keys()));
      return c.named || c.first;
    }
    return wanted[0][0];
  },

  /** Does this unit's name in this year carry its territory's own word? */
  _sharesName(uid, rec, tid) {
    const t = this.ctx.data.byId && this.ctx.data.byId.get(tid);
    if (!t) return false;
    const words = String(t.name || '').toLowerCase().match(/[a-z]{4,}/g) || [];
    const stop = new Set(['presidency', 'colony', 'province', 'protectorate', 'settlements', 'territory', 'islands', 'state', 'states', 'british', 'union', 'commonwealth', 'dominion']);
    const key = words.filter((w) => !stop.has(w));
    if (!key.length) return false;
    // The unit id, not the rendered name: the namer already prints a unit as
    // "Odisha, in the Presidency of Fort William in Bengal", so every unit of
    // the presidency "contains" the word Bengal and the test would pass for
    // all five. The geometry index's own id does not.
    const id = String(uid).toLowerCase();
    return key.some((w) => id.includes(w));
  },

  /**
   * The name of a place in the year that is on the map, not the name of the
   * state that stands there now. See names.js.
   */
  _name(uid, rec) {
    const year = this.ctx.store.getState().year;
    const tid = this._tidFor(uid, rec);
    if (!tid) return { text: (this.ctx.data.unitName ? this.ctx.data.unitName(uid) : uid) || uid, period: null };
    return this.namer.label(uid, tid, year);
  },

  /**
   * Which territory's vocabulary names this unit.
   *
   * A unit that is drawn as "formerly British" carries no status entry, so
   * round 3's first pass fell straight through to the geometry index's own
   * name — and the geometry index is a modern file. That put "Namibia" on a
   * 1960 plate, and "Zambia" wherever a unit stopped being painted. The
   * fallback is the territory this atlas files the unit under, whose
   * `namesOverTime` knows what the place was called in the year on the clock.
   */
  /* ==================================================== the words ========

     THE PLATE'S OWN NAMING, TAKEN OUT OF A CLOSURE AND GIVEN A YEAR.

     Both of these used to read `store.getState().year` from inside a lambda,
     which meant the one rule this atlas cares most about — a name on a plate
     is a name that can be dated to the year on the plate — could only ever be
     tested at whatever year the app happened to be showing. Sweeping 1580 to
     2026 measured 1913 four hundred and forty-seven times. They take the year
     as an argument now; `labelText` and `groupLabel` pass the store's.
     `tools/scenarios/p02r5/anach-sweep.js` passes every year there is. */

  /** The words on the plate for one drawn unit, in `year`'s language. */
  _plateName(uid, rec, year) {
    const { data } = this.ctx;
    const held = !!(rec && rec.entry && rec.entry.territoryId);
    const tid = this._tidFor(uid, rec);
    let s = tid ? this.namer.short(uid, tid, year, { strict: !held }) : (data.unitName ? data.unitName(uid) : uid);
    // A name that has to be cut mid-word is not a name. "United Kingdom of
    // Great…" told a student nothing; where the period title is too long for
    // a plate the dataset's own short title is used instead, and only if
    // there is none does the label get an ellipsis.
    /* AND THE SHORT TITLE HAS TO BE DATEABLE TOO. `shortName` is a modern
       index field with no dates on it, and it was substituted for any period
       name over 26 characters with no test at all: at 1888 the Kenya plate
       resolved "Imperial British East Africa Company territory" — the right
       answer, from the dataset, for 1888 — and then printed "East Africa
       Protectorate", a name that did not exist until 1895. The substitution
       now goes through the same date test as every other name. */
    /* AND `dateable` RETURNS THREE THINGS, NOT TWO. `!== false` accepts `null`
       — "the dataset does not date this string" — and a colony's `shortName`
       is exactly the string the dataset does not date: it is this atlas's own
       index label. So at 2020 the plate resolved "West Bengal, Bihar,
       Jharkhand and Odisha in India, and Bangladesh", the right answer, found
       it too long, and printed "Bengal Presidency" over West Bengal. Swept
       1580-2026 it did the same with "Assam" over Sylhet, "Oregon Country"
       over Oregon and "The Ionian Islands" over the Ionian Islands, all at
       years when the dataset's own record says the ground is called something
       else. The substitute goes through the strong test as well. */
    if (s && s.length > 26 && tid) {
      const t = data.byId ? data.byId.get(tid) : null;
      const alt = t && t.shortName;
      if (alt && alt.length < s.length && this.namer.dateable(tid, alt, year) !== false
        && !this.namer.deadName(alt, year)) s = alt;
    }
    // "The Southern Provinces,…" — a name cut at a comma keeps the comma, and
    // the ellipsis then reads as part of a list rather than as an elision.
    return s && s.length <= 30 ? s : (s ? s.slice(0, 27).replace(/\s\S*$/, '').replace(/[,;:·\s]+$/, '') + '…' : null);
  },

  /** One name for a territory drawn as many small pieces, in `year`'s language. */
  _plateGroupName(territoryId, units, year) {
    const { data } = this.ctx;
    const p = this.namer.periodName(territoryId, year);
    const t = data.byId && data.byId.get(territoryId);
    /* A GROUP LABEL IS A LABEL. This collapsed eleven units of British India
       into one name and took `p.name` unconditionally, so the one code path
       that never asked whether the name could be dated was the one that
       prints the largest type on the plate: at 2020 it drew "Union of South
       Africa" across the Republic, and at 1612 "British India" over the
       Company's three factories. `periodName` now marks a fallback title that
       the dataset's own dates contradict, and a group with nothing dateable
       to say says nothing — render.js#_drawLabels then falls back to naming
       the units one at a time, which is the honest smaller answer. */
    let s = (p && p.picked && p.name) || null;
    if (!s && p && p.name && !p.dead) s = p.name;
    if (!s && p && p.successor) s = p.successor;
    if (!s) {
      const alt = t && (t.shortName || t.name);
      s = alt && this.namer.dateable(territoryId, alt, year) !== false
        && !this.namer.deadName(alt, year) ? alt : null;
    }
    if (!s) return null;
    if (s.length > 30) {
      const alt = t && t.shortName;
      if (alt && this.namer.dateable(territoryId, alt, year) !== false
        && !this.namer.deadName(alt, year)) s = alt;
    }
    return s.length <= 30 ? s : s.slice(0, 27).replace(/\s\S*$/, '').replace(/[,;:·\s]+$/, '') + '…';
  },

  _tidFor(uid, rec) {
    if (rec && rec.entry && rec.entry.territoryId) return rec.entry.territoryId;
    if (!this._tidCache) this._tidCache = new Map();
    if (this._tidCache.has(uid)) return this._tidCache.get(uid);
    const list = this.ctx.data.territoriesForUnit ? this.ctx.data.territoriesForUnit(uid) : null;
    const tid = list && list.length ? list[list.length - 1].id : null;
    this._tidCache.set(uid, tid);
    return tid;
  },

  _describe(uid, rec) {
    const { format } = this.ctx;
    const n = this._name(uid, rec);
    const name = n.text;
    if (rec.mode === 'hole') {
      return `${name}. A silence: no record was allowed to survive here.`
        + (rec.agent ? ` Destroyed by ${rec.agent}.` : '');
    }
    if (rec.mode === 'informal') return `${name}. Informal empire: dominated by Britain, never claimed by it. Control degree ${rec.entry ? rec.entry.controlDegree : 1} of 5.`;
    if (rec.lost) return `${name}. Formerly British, already lost by this year.`;
    const e = rec.entry;
    const status = e ? (this.statusLabel.get(e.status) || format.statusLabel(e.status)) : 'unknown';
    const deg = e ? e.controlDegree : null;
    const extra = [];
    if (n.period && n.period.local) extra.push(`called ${n.period.local.name} in ${n.period.local.language}`);
    if (e && e.partial) extra.push('British control did not fill this unit');
    if (e && e.circa) extra.push('the date is approximate');
    if (e && e.contested) extra.push('historians dispute this');
    if (rec.mode === 'absence') extra.push('no cited figure for the measure now sizing the map');
    if (rec.stitchKind) extra.push(`the dataset tags this ${rec.stitchKind}`);
    if (rec.tenureLabel) extra.push('held ' + rec.tenureLabel);
    else if (e && e.since != null) extra.push(`held since ${format.year(e.since)}`);
    if (rec.dim) extra.push('outside the set now being shown');
    return `${name}. ${status}. Control degree ${deg == null ? 'unknown' : deg + ' of 5'}.${extra.length ? ' ' + extra.join('; ') + '.' : ''}`;
  },

  _plateLabel() {
    const { format } = this.ctx;
    const def = definitionById(this.definition);
    const m = this.measures && this.measures[def.id];
    const proj = PROJECTIONS[this.projection];
    return `Map of the British Empire in ${format.year(this.ctx.store.getState().year)}. ${proj.label} projection. ${def.sentence}. `
      + (m ? `${format.number(m.units)} units, ${format.area(m.km2)}.` : '');
  },

  _focusUnit(uid, moveDom = true) {
    this.activeUnit = uid;
    this.plate.focus = uid;
    this.ctx.store.dispatch('focusUnit', uid);
    for (const [id, node] of this.optionEls) node.tabIndex = id === uid ? 0 : -1;
    if (moveDom) { const n = this.optionEls.get(uid); if (n) n.focus(); }
    const rec = this.plate.paint.get(uid);
    if (rec) this.ctx.util.announce(this._describe(uid, rec));
    this.plate.draw();
  },

  /* ==================================================== keys ============ */

  _wireKeys() {
    const { util } = this.ctx;
    const onKey = (ev) => {
      if (ev.defaultPrevented) return;
      const t = ev.target;
      if (t && (t.matches('input, textarea, select, [contenteditable="true"]'))) return;
      const inMap = this.el.contains(t);
      const key = ev.key;

      // 1–4 hold the year and change what "British" means. Global, because
      // that is the point: it is a way of re-reading whatever is on screen.
      const def = DEFINITIONS.find((d) => d.key === key);
      if (def && !ev.metaKey && !ev.ctrlKey && !ev.altKey) { ev.preventDefault(); this.setDefinition(def.id); return; }
      if ((key === 'p' || key === 'P') && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault(); this.setProjection(this.projection === 'mercator' ? 'equal-earth' : 'mercator'); return;
      }
      if ((key === 's' || key === 'S') && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault(); this.setStitch(!this.stitch); return;
      }
      // W and H are as global as 1–4 and P, and for the same reason: they are
      // ways of re-reading whatever is already on screen, not tools you have
      // to go to the map to fetch.
      if ((key === 'w' || key === 'W') && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault(); this.toggleWeight(); return;
      }
      if ((key === 'h' || key === 'H') && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault(); this.setSilenceMode(!this.silenceMode); return;
      }
      // E: give the plate the room it needs. Round 5's first pass documented
      // this key in three files, put it on a tile and in the screen-reader
      // hint, and never bound it — so the one control that answers "the map is
      // 28% of its canvas" could only be reached with a mouse.
      if ((key === 'e' || key === 'E') && !ev.metaKey && !ev.ctrlKey && !ev.altKey) {
        ev.preventDefault(); this._bigTouched = true; this.setEnlarged(!this.enlarged); return;
      }
      // Escape leaves the enlarged plate before the shell gets to close
      // anything else, and only then. Otherwise it is not ours.
      if (key === 'Escape' && this.enlarged) {
        ev.preventDefault(); this._bigTouched = true; this.setEnlarged(false); return;
      }
      if (!inMap) return;

      if (key === '+' || key === '=') { ev.preventDefault(); this.camera.zoomIn(); this.plate.draw(); this._syncOptionsSoon(); return; }
      if (key === '-' || key === '_') { ev.preventDefault(); this.camera.zoomOut(); this.plate.draw(); this._syncOptionsSoon(); return; }
      if (key === '0') { ev.preventDefault(); this.camera.reset(); this.plate.draw(); this._syncOptionsSoon(); return; }

      const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const d = dirs[key];
      if (d) {
        const onUnit = t && t.classList && t.classList.contains('map__target');
        if (!onUnit || ev.shiftKey) {
          ev.preventDefault();
          const step = ev.shiftKey ? 120 : 60;
          this.camera.panBy(-d[0] * step, -d[1] * step);
          this.plate.draw(); this._syncOptionsSoon();
          return;
        }
        ev.preventDefault();
        const next = neighbour(this.plate, this.activeUnit, d[0], d[1], this.optionEls.keys());
        if (next) this._focusUnit(next);
        return;
      }
      if ((key === 'Enter' || key === ' ') && t && t.classList && t.classList.contains('map__target')) {
        ev.preventDefault(); this._selectUnit(t.dataset.unit);
      }
    };
    this.d(util.on(document, 'keydown', onKey));
  },

  /* ==================================================== bus ============= */

  _wireBus() {
    const { bus, data } = this.ctx;
    const on = (name, fn) => this.d(bus.on(name, fn));

    // P17 owns the status vocabulary and mounts after us, so we subscribe now
    // and adopt its proved status -> family + texture table the moment it lands.
    const adopt = (p) => {
      const sym = (p && p.symbology) || (window.BEA && window.BEA.symbology) || null;
      if (!adoptSymbology(sym)) return;
      this.paintSig = '';
      this._repaint(true);
      this._syncOptions();
    };
    on('legend:symbology', adopt);
    adopt(null);

    /* THE SHELL SAYS WHICH BAND WE ARE IN; WE DO NOT GUESS FROM A WIDTH.
       `chrome:layout` carries `dock`, the three dock rectangles and the
       furniture-relative offsets (RESPONSIVE_LAW §3.4). A band change always
       comes with a resize, so `_layout` would catch it eventually — but the
       ribbon's two copies swap without one (P17 pins a copy the moment a rail
       opens), and a zoom cluster docked into the copy that just went away is
       a control that has left the screen. */
    on('chrome:layout', () => {
      if (!this.plate || !this.furniture) return;
      if (this._syncDocks()) { this.paintSig = ''; this._layout(true); this._repaint(true); this._syncOptionsSoon(); }
    });

    // Modules mount in list order and the map is first, so anything we announce
    // during mount is announced to an empty room. Say it again once everyone is
    // in it. (The shell emits app:ready after the last module mounts.)
    on('app:ready', () => {
      this._expose();
      adopt(null);
      this._emitProjection(null);
      bus.emit('map:ready', { units: this.plate.geom ? this.plate.geom.shapes.size : 0, projection: this.projection, definition: this.definition });
      bus.emit('map:painted', { year: this.ctx.store.getState().year, definition: this.definition });
      bus.emit('map:definition', { id: this.definition, measures: this.measures, year: this.ctx.store.getState().year });
    });

    on('ask:flyTo', (p = {}) => {
      let uid = p.unitId;
      if (!uid && p.territoryId) {
        const units = data.unitsOf ? data.unitsOf(p.territoryId, this.ctx.store.getState().year) : null;
        uid = units && units.length ? units[0] : null;
      }
      if (!uid) return;
      /* REMEMBER WHAT WE FLEW TO, BECAUSE THE BAND MOVES UNDER IT.
         A beat asks for a subject and a zoom once, at mount. The rectangle it
         is drawn in then changes twice more: the shell settles the stage, and
         below 62rem a textual beat drops the plate to a peek strip
         (`html[data-tour-fit="text"]`, 390x92 at 390x844) or gives it back on
         the student's press. A camera that keeps its centre and its k through
         that does not re-frame, it CROPS — measured at 390x844 on beat 17, the
         Punjab the beat is about was cut by the top edge of the band. The
         target is kept and re-flown whenever the plate's own height or width
         changes by more than a tenth. */
      this._flyTarget = { uid, zoom: p.zoom || null };
      this.camera.flyTo(uid, { zoom: p.zoom || null });
      // The view the beat asked for. If the student has moved the plate since,
      // the band changing shape is not a licence to move it back.
      this._flyView = { ...this.plate.view };
      this._flyBox = null;
      this._repaint(); this._syncOptions();
    });

    // A teacher's link is a page number: `#year=1913&def=controlled` has to
    // mean the same thing pasted into an open tab as it does on a cold load.
    // Round 3 read `def=` once, at mount, and ignored every later hash.
    // `ev.newURL`, not `location.hash`: the shell rewrites the address on the
    // same turn as the event, so by the time a handler reads `location` the
    // `def=` it was told about has already been canonicalised away.
    this.d(this.ctx.util.on(window, 'hashchange', (ev) => {
      const url = String((ev && ev.newURL) || location.href || '');
      const raw = (url.split('#')[1] || '').replace(/^#/, '');
      for (const part of raw.split('&')) {
        const i = part.indexOf('=');
        if (i <= 0) continue;
        const k = part.slice(0, i), v = decodeURIComponent(part.slice(i + 1));
        if (k === 'def' && DEFINITIONS.some((d) => d.id === v)) this.setDefinition(v);
        if (k === 'proj' && PROJECTION_IDS.includes(v)) this.setProjection(v);
      }
    }));

    on('chrome:stage', () => this._applyStage());
    on('map:openSheet', () => this._openSheet());
    // The offer H makes at a year with no hole: go to the year that has one,
    // and be in the mode when you arrive. One control, one arrival.
    on('map:gotoSilence', (p = {}) => {
      const y = Number(p.year) || this._firstHoleYear();
      if (!Number.isFinite(y)) return;
      this.ctx.store.dispatch('setYear', y);
      setTimeout(() => this.setSilenceMode(true), 0);
    });
    // The rail holds one sheet. If another piece takes it, this one is closed —
    // otherwise the next year change would quietly steal it back.
    on('chrome:sheet', (p) => { this._sheetOpen = !!(p && p.open && p.id === 'map:reading'); });
    on('map:setProjection', (p) => this.setProjection(typeof p === 'string' ? p : (p && p.id)));
    on('map:setDefinition', (p) => this.setDefinition(typeof p === 'string' ? p : (p && p.id)));

    on('ask:sizeBy', (p) => {
      if (!p || p.metric == null) { this.setWeight(null); return; }
      if (p.metric === 'population' && !p.values) { const w = this._builtInPopulation(this.ctx.store.getState().year); w.builtIn = true; this.setWeight(w); return; }
      const values = p.values instanceof Map ? p.values : new Map(Object.entries(p.values || {}).map(([k, v]) => [k, Number(v)]));
      this.setWeight({ metric: p.metric, caption: p.caption || 'Size is a sourced quantity, not land area.', source: p.source || null, values, counted: 0, missing: 0 });
    });

    on('ask:paintSilence', (p = {}) => {
      const ids = p.unitIds || [];
      if (!ids.length && p.clear !== true) return;
      this.silences = new Map();
      this.silenceAsked = ids.slice();
      this.silenceSource = 'bus';
      for (const u of ids) this.silences.set(u, { reason: p.reason || null, agent: p.agent || null });
      if (this.silenceBtn) { this.silenceBtn.setAttribute('aria-pressed', 'true'); this.silenceBtn.classList.add('is-on'); }
      this.silenceMode = true;
      this.el.dataset.silence = 'on';
      this.paintSig = '';
      this._repaint(true); this._renderReadout(); this._syncOptions();
      let drawn = 0;
      for (const rec of this.plate.paint.values()) if (rec.mode === 'hole') drawn++;
      this.ctx.bus.emit('map:silence', { asked: ids.length, drawn, unitIds: ids });
    });

    // Why a named unit is not on the plate. The two answers are different and
    // a student is owed the difference: "this atlas has no such place" is a gap
    // in the geometry, "not drawn at this year and definition" is history.
    this._unknownUnits = (ids) => (ids || []).filter((u) => !(this.plate.geom && this.plate.geom.shapes.has(u)));

    on('ask:paintUnits', (p = {}) => {
      this.highlight = p.unitIds && p.unitIds.length ? new Set(p.unitIds) : null;
      this.el.dataset.highlight = this.highlight ? (p.reason || 'set') : '';
      this.paintSig = '';
      this._repaint(true);
      let drawn = 0;
      if (this.highlight) for (const uid of this.highlight) if (this.plate.paint.has(uid)) drawn++;
      const asked = this.highlight ? this.highlight.size : 0;
      const unknown = this.highlight ? this._unknownUnits([...this.highlight]) : [];
      const missing = asked - drawn - unknown.length;
      this.highlightNote = this.highlight
        ? (`${this.ctx.format.number(drawn)} of ${this.ctx.format.number(asked)} named ${asked === 1 ? 'place is' : 'places are'} drawn; the rest of the map is dimmed, not removed.`
          + (unknown.length ? ` ${this.ctx.format.number(unknown.length)} ${unknown.length === 1 ? 'has' : 'have'} no geometry in this atlas at all: ${unknown.slice(0, 4).join(', ')}.` : '')
          + (missing > 0 ? ` ${this.ctx.format.number(missing)} ${missing === 1 ? 'is' : 'are'} in the geometry but not drawn at this year and this definition.` : '')
          + (p.reason ? ` Shown because: ${p.reason}.` : ''))
        : null;
      this._renderReadout();
      this._syncOptions();
      this.ctx.bus.emit('map:painted-set', { asked, drawn, reason: p.reason || null });
    });

    on('ask:stitch', (p) => this.setStitch(p === undefined ? true : (p === false ? false : !!(p && p.on !== false))));
  },

  /**
   * A debug handle, in the same place the shell puts everything else. It is a
   * read/drive surface for scenarios under tools/scenarios and for any piece
   * that needs the plate before the bus is wired.
   */
  _expose() {
    const self = this;
    const api = {
      plate: this.plate,
      pick: (x, y) => pick(this.plate, x, y),
      hoverAt: (x, y) => this._onHover(x, y),
      unitScreen: (id) => this.plate.unitScreen(id),
      setDefinition: (id) => this.setDefinition(id),
      setProjection: (id) => this.setProjection(id),
      setWeight: (w) => this.setWeight(w),
      setStitch: (on) => this.setStitch(on),
      toggleWeight: () => this.toggleWeight(),
      setSilenceMode: (on) => this.setSilenceMode(on),
      // Which years this plate can put a hole in — the same answer the H
      // control gives, so a critic can check the control against the data.
      holesAt: (y) => this._holesAt(Number.isFinite(y) ? y : this.ctx.store.getState().year),
      firstHoleYear: () => this._firstHoleYear(),
      get stitch() { return self.stitch; },
      get silenceMode() { return !!self.silenceMode; },
      get fitChoice() { return self.fitChoice; },
      get fitScores() { return self.fitScores; },
      get marks() { return self.plate._marks; },
      insets: () => self._insets(),
      obstacles: () => self._obstacleRects(),
      home: () => { self.camera.reset(); self._repaint(true); self._syncOptions(); },
      get labels() { return self.plate.labelsDrawn.map((l) => l.text); },
      get net() { return self.plate.net; },
      get undrawable() { return self._undrawableNow(); },
      obstacles: () => self.plate.obstacles,
      markLayout: () => this.plate.markLayout(),
      describe: (uid) => this._describe(uid, this.plate.paint.get(uid) || {}),
      sizeByPopulation: () => { const w = this._builtInPopulation(this.ctx.store.getState().year); w.builtIn = true; this.setWeight(w); },
      get definition() { return self.definition; },
      get projection() { return self.projection; },
      get measures() { return self.measures; },
      get weight() { return self.weightState; },
      get silences() { return self.silences; },
      frameStats: () => this.plate.frameStats(),
      resetStats: () => this.plate.resetStats(),
      draw: () => this.plate.draw(),
      /**
       * THE PRINTED PLATE, at paper's aspect and paper's type size.
       *
       * P20's map sheet is `canvas.toDataURL()` on the live plate, and the
       * live plate is a screen: 2.37:1, with names sized from its width. On a
       * portrait A4 that fills the top 40% of the page at about 5pt — the
       * classroom reviewer's "unreadable at the back of the room". This
       * redraws the SAME plate — same year, same definition, same camera,
       * nothing generated for print that was not on the screen — into a
       * landscape A4 box with the label type scaled for paper, and puts the
       * canvas back before the browser can paint, so nothing flickers.
       *
       *   const src = window.__map.printImage();       // 297 x 210 at 300dpi-ish
       *   img.src = src;                               // in an A4 landscape sheet
       */
      printImage: ({ w = 2100, h = 1485, labelScale = 2.1, dpr = 1 } = {}) => {
        const P = self.plate;
        if (!P || !P.canvas) return null;
        const cv = P.canvas;
        const keep = { w: P.w, h: P.h, dpr: P.dpr, sw: cv.style.width, sh: cv.style.height, ls: P.labelScale };
        let url = null;
        try {
          P.labelScale = labelScale;
          P.setSize(w, h, dpr);
          P.draw();
          url = cv.toDataURL('image/png');
        } catch (e) { url = null; } finally {
          P.labelScale = keep.ls;
          P.setSize(keep.w, keep.h, keep.dpr);
          cv.style.width = keep.sw; cv.style.height = keep.sh;
          try { P.draw(); } catch (e) { /* the next frame will */ }
        }
        return url;
      },
      module: this,
    };
    window.__map = api;
    // `window.BEA` is created by the shell at app:ready, which is AFTER every
    // module mounts, so assigning once here left `BEA.map` undefined for the
    // whole session and every scenario that reached for it got nothing.
    if (window.BEA) window.BEA.map = api;
    this.ctx.bus.on('app:ready', () => { if (window.BEA) window.BEA.map = api; });
    setTimeout(() => { if (window.BEA && !window.BEA.map) window.BEA.map = api; }, 0);
  },

  /* ==================================================== theme / size ==== */

  /**
   * Read the palette from THIS MODULE'S OWN ELEMENT, not from the document.
   * Everything inherits, so every global token still resolves; what it buys is
   * `--map-ground`, which map.css declares on `.map` because it is a decision
   * about this plate's paper and not a change to the published status palette.
   */
  _readTokens() { return readTokens(this.el || document.documentElement); },

  _wireTheme() {
    const mo = new MutationObserver(() => {
      const t = this._readTokens();
      if (t.sea === this.tokens.sea && t.ground === this.tokens.ground && t.fills['crown-conquered'] === this.tokens.fills['crown-conquered']) return;
      this.tokens = t;
      this.weakFills = weakFamilies(t);
      this.plate.setTokens(t, this.plate.dpr);
      this.paintSig = '';
      this._repaint(true);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] });
    this.d(() => mo.disconnect());

    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => {
      this.tokens = this._readTokens();
      this.weakFills = weakFamilies(this.tokens);
      this.plate.setTokens(this.tokens, this.plate.dpr);
      this.paintSig = '';
      this._repaint(true);
    };
    mq.addEventListener('change', onScheme);
    this.d(() => mq.removeEventListener('change', onScheme));
  },

  /**
   * THE PLATE IS THE WORLD, AND EVERY PIECE OF CHROME STANDS BESIDE IT.
   *
   * WHAT LOST ROUND 4, MEASURED. The stage this module is given is 1440 × 329
   * — the timeline under the map is 500px tall — and rounds 1–4 drew a canvas
   * across the whole of it, fitted a world into whatever rectangle was left
   * clean, and then floated this module's own definition card and mode tiles
   * back on top. A critic measured the result in a browser: the drawn world was
   * 27.9% of the canvas width, and a 70 × 70 `elementFromPoint` grid found 44%
   * of the plate covered at 1920px, 60% at 1440px and 89% on a phone. A map you
   * cannot see loses to a printed plate no matter what the apparatus around it
   * can do, and it did.
   *
   * The rule now is the one a printed atlas has always used, and it is
   * measurable rather than negotiated:
   *
   *   1. THE CANVAS IS THE WORLD. `.map__plate` is sized to exactly the pixels
   *      the plate frame occupies — 1000 × 421.9 world units, 2.37:1 — so the
   *      drawn world is 100% of the canvas in one axis and never less than that
   *      in the other. There is no dead sea inside the plate to measure against,
   *      and everything outside 64°N–56°S (Antarctica, Nunavut, Iceland) falls
   *      outside the canvas instead of being the loudest shape on it.
   *   2. THE CHROME IS OUTSIDE IT. The definition card, the four mode tiles and
   *      the zoom keys dock into a rail in the margin — a column beside the
   *      plate on a laptop, a bar beneath it on a phone. Nothing this module
   *      draws stands on the plate. Occlusion by `map__*` is zero, by
   *      construction, at every width.
   *   3. THE PLATE SLIDES TO THE CLEANEST PAPER. Two other modules put panels
   *      over this stage (the byline and the legend, both bottom-left and
   *      top-left). Where the margin leaves the plate room to move, it moves
   *      away from them, so what they cover falls on paper the world was not
   *      using.
   *   4. AND IT CAN TAKE THE WHOLE SCREEN. `E`, or the Enlarge key on the rail,
   *      lifts the plate out of the 329px strip and fills the window under the
   *      masthead. At 1440 that is a world 1160px wide instead of 780 — the
   *      full width the critic asked for — with nothing over it at all.
   */

  /** Other modules' panels standing over this stage, in viewport coordinates. */
  _foreign() {
    const out = [];
    // Enlarged, the plate is parented into the shell's overlay layer and is
    // ABOVE the byline and the legend, so they stand on nothing. Round 5's
    // first pass still reserved their rectangles and refused to name Canada
    // and Australia on a plate that had nothing over them at all.
    if (this.enlarged) return out;
    const seen = new Set();
    const add = (n) => {
      if (!n || seen.has(n)) return;
      seen.add(n);
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
      if (cs.pointerEvents === 'none') return;
      const b = n.getBoundingClientRect();
      if (b.width < 24 || b.height < 24) return;
      out.push({ x: b.left, y: b.top, w: b.width, h: b.height });
    };
    for (const slot of document.querySelectorAll('#app [data-mount]')) {
      if (this.el.contains(slot) || slot.contains(this.el)) continue;
      if (this.furniture && (slot.contains(this.furniture) || this.furniture.contains(slot))) continue;
      for (const child of slot.children) add(child);
    }
    return out;
  },

  /** How much of `box` (viewport coords) other modules' panels cover. */
  _overlapArea(box, rects) {
    let a = 0;
    for (const o of rects) {
      const w = Math.min(box.x + box.w, o.x + o.w) - Math.max(box.x, o.x);
      const h = Math.min(box.y + box.h, o.y + o.h) - Math.max(box.y, o.y);
      if (w > 0 && h > 0) a += w * h;
    }
    return a;
  },

  /**
   * Place the plate and the rail. Returns true if the canvas had to be resized,
   * which is the only expensive outcome (it throws away the Path2D cache and
   * the offscreen ground: about 38ms).
   */
  /**
   * THE DOSSIER IS NOT SOMETHING THE PLATE MAY STAND ON.
   *
   * Enlarged, this module is parented into the shell's full-screen overlay
   * layer, which sits ABOVE the dossier column and above the mobile sheet. So
   * the enlarged plate reads the dossier's own rectangle and stops at it,
   * rather than covering the panel the student just opened. FEATURE_SPEC's
   * standing rule is that panels compress the map and never cover it; the
   * inverse is just as true and round 5's first pass broke it.
   */
  _dossierRect() {
    const d = document.getElementById('dossier') || document.querySelector('.app__dossier');
    if (!d) return null;
    const cs = getComputedStyle(d);
    if (cs.visibility === 'hidden' || cs.display === 'none') return null;
    const b = d.getBoundingClientRect();
    if (b.width < 40 || b.height < 40) return null;
    if (b.right < 4 || b.left > window.innerWidth - 4 || b.top > window.innerHeight - 4) return null;
    return b;
  },

  /**
   * The top of the stage area: under the masthead AND under the sentence band.
   *
   * ROUND 8. The enlarged plate is `position: fixed`, so whatever it docks
   * over, it hides. It docked at the masthead's bottom, and measured on a
   * 390 x 844 phone with a dossier open that put a 390 x 134 map straight over
   * the 110px lede band — the shell's one sentence slot, the channel every
   * piece in this app writes its voice into (LAYOUT_BUDGET §6). The map is
   * allowed to take the sea; it is not allowed to take the app's mouth.
   *
   * The band only yields when yielding is the difference between a map and no
   * map at all, which `_considerEnlarge` decides with a measurement, not here.
   */
  _mastheadBottom(overBand) {
    const bar = document.getElementById('chrome') || document.querySelector('.app__bar');
    const b = bar && bar.getBoundingClientRect();
    let y = b && b.height ? Math.max(0, Math.round(b.bottom)) : 0;
    if (overBand) return y;
    const lede = document.querySelector('.app__lede');
    const lb = lede && lede.getBoundingClientRect();
    if (lb && lb.height > 8 && lb.bottom > y && lb.top < y + 8) y = Math.round(lb.bottom);
    return y;
  },

  /**
   * ENLARGED TAKES WHAT IT USES AND NOT A PIXEL MORE.
   *
   * Round 5's first pass made the enlarged plate `inset: bar 0 0 0` — the
   * whole window — and so a phone got a proper 390px-wide world at the cost of
   * every one of the timeline's 600 pixels, including the four-phase spine
   * band that DIDACTIC_SPEC §2 requires to be visible at all times. But a
   * 2.37:1 world 390px wide is only 165px tall: the other 629 were being taken
   * and then left as paper. So the enlarged block is sized to the plate plus
   * the rail and nothing else, and the timeline keeps whatever is under it.
   */
  /**
   * WHERE THE ENLARGED PLATE DOCKS, AND WHAT IT IS ALLOWED TO COVER.
   *
   * Under the sentence band whenever there is a map's worth of room under it —
   * 200px, which is the floor the whole-app review asked for by name. Only
   * when there is not does it dock under the masthead and take the band, and
   * only then because the alternative is a 24px strip of ocean.
   */
  _dockTop() {
    const under = this._mastheadBottom(false);
    const over = this._mastheadBottom(true);
    if (under <= over) return over;
    const dos = this._dossierRect();
    const floor = dos && dos.top > over + 40 ? dos.top : window.innerHeight;
    return (floor - under) >= 200 ? under : over;
  },

  /**
   * The rectangle an enlarged plate WOULD take, without taking it.
   *
   * Extracted from `_sizeEnlarged` so that `_considerEnlarge` can ask the one
   * question it never asked: is enlarging actually bigger? Under
   * RESPONSIVE_LAW nothing stands on the plate below 62rem any more, so the
   * answer on a phone is often no — measured at 390 x 844 under
   * `prefers-reduced-motion`, `.map.is-enlarged` was 390 x 165 where the
   * docked band hands this module 390 x 192. The device was designed when the
   * docked band was 122px tall; it is not any more.
   */
  _enlargedBox() {
    const top = this._dockTop();
    const vw = window.innerWidth, vh = window.innerHeight;
    const dos = this._dossierRect();
    let availW = vw, left = 0, availH = vh - top;
    if (dos) {
      if (dos.width < vw - 80 && dos.left > vw * 0.45) availW = Math.max(240, Math.round(dos.left));
      else if (dos.top > top + 80) availH = Math.max(96, Math.round(dos.top - top));
    }
    const span = frameSpan();
    let needH = Math.min(availH, Math.round(availW * span / WORLD_WIDTH));
    needH = Math.min(needH, Math.max(240, Math.round(availH * 0.72)));
    const room = Math.max(0, Math.round(availH));
    const h = Math.max(96, Math.min(room || 140, Math.max(140, Math.round(needH))));
    return { top, left, w: availW, h };
  },

  _sizeEnlarged() {
    const top = this._dockTop();
    const vw = window.innerWidth, vh = window.innerHeight;
    const dos = this._dossierRect();
    let availW = vw, left = 0, availH = vh - top;
    if (dos) {
      if (dos.width < vw - 80 && dos.left > vw * 0.45) availW = Math.max(240, Math.round(dos.left));
      // NOT `Math.max(160, ...)`. On a phone the dossier's head sits at
      // y = 181 and the masthead ends at 46: the room is 135, and a 160px
      // floor here is what drew this plate down to y = 206, over the dossier's
      // title and its close button. The room is the room.
      else if (dos.top > top + 80) availH = Math.max(96, Math.round(dos.top - top));
    }
    const span = frameSpan();
    // The furniture floats over the plate now, so an enlarged plate reserves
    // nothing for it: it asks for the height the world needs at this width.
    let needH = Math.min(availH, Math.round(availW * span / WORLD_WIDTH));
    // Whatever the dock, the enlarged plate never takes more than about
    // seven-tenths of the room under the masthead: the four-phase spine band
    // and the axis under this map are the app's other permanent object, and a
    // map that hides them has answered one charge by breaking another.
    needH = Math.min(needH, Math.max(240, Math.round(availH * 0.72)));
    /* AND NEVER ONE PIXEL PAST THE PANEL IT IS DODGING.
       Round 6 floored this at 140px. On a phone the dossier is a bottom sheet
       whose head is at y=181 and the masthead ends at y=46, so the room above
       it is 135 — and a 140px floor drew the plate to y=186, over the
       dossier's title row and most of its close button. Measured at 390 x 844
       on the plain deep link `#year=1900&sel=egypt`: the map, not the dossier,
       was what stood on that header. The floor now yields to the room. */
    const room = Math.max(0, Math.round(availH));
    // WRITE ONLY ON A REAL CHANGE. `_layout` is driven by a ResizeObserver on
    // this very element, so an unconditional style write here is a resize
    // feedback loop; the browser reports it as an uncaught
    // "ResizeObserver loop completed with undelivered notifications" and the
    // bar for this app is zero console errors.
    const h = Math.max(96, Math.min(room || 140, Math.max(140, Math.round(needH))));
    const sig = [top, left, availW, h].join(',');
    if (this._bigSig === sig) return;
    this._bigSig = sig;
    const st = this.el.style;
    st.top = top + 'px';
    st.left = left + 'px';
    st.width = availW + 'px';
    st.height = h + 'px';
    st.right = 'auto';
    st.bottom = 'auto';
  },

  _layout(force = false) {
    if (!this.plate || !this.frame) return false;
    if (this.enlarged) this._sizeEnlarged();
    const R = this.el.getBoundingClientRect();
    /* THE ROOM YOU ACTUALLY GET IS THE ROOM YOU CAN BE SEEN IN.
       RESPONSIVE_LAW §7 P02 (3): in the sheet band `.stage__map` ends where the
       foot strips begin and it clips. `.map` is `position: absolute; inset: 0`
       against the nearest POSITIONED ancestor, which is not always the one that
       clips — measured at 768x1024 inside beat 17, `.stage__map` is 768x334
       and `.map` is 768x370, so the plate drew a 370px world of which the
       bottom 36 were behind the control dock, and every fit, every centring
       and every furniture score was computed against a rectangle 11% taller
       than the one the reader has. The plate is measured against the
       INTERSECTION with the first ancestor that hides its overflow. Only the
       trailing edges are taken: an ancestor that clipped the top or the left
       would need the frame moved as well, and nothing in this shell does. */
    let visH = R.height, visW = R.width;
    for (let p = this.el.parentElement; p && p !== document.body; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.overflow === 'visible' && cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const pr = p.getBoundingClientRect();
      if (pr.width < 8 || pr.height < 8) break;
      if (pr.top <= R.top + 1 && pr.left <= R.left + 1) {
        visH = Math.min(visH, pr.bottom - R.top);
        visW = Math.min(visW, pr.right - R.left);
      }
      break;
    }
    const W = Math.max(1, Math.round(visW)), H = Math.max(1, Math.round(visH));
    if (W < 8 || H < 8) return false;
    const span = frameSpan();

    /* --- THE CANVAS IS THE PLATE -----------------------------------------

       Round 5 sized this frame to exactly the pixels the world occupied and
       stood the rail on the paper beside it, because two other modules put
       opaque panels over this stage and the plate had to dodge them. The
       shell now guarantees the rectangle (LAYOUT_BUDGET B5: nothing stands on
       the plate) and charges this module for all of it — so a reserved 248px
       column was being paid for out of the world. Measured on the running
       app: the drawn map covered 70% of its rectangle at 1024 x 640, 71% at
       1440 x 900 and 35% on a phone, and the rest was bare paper the reader
       had been given instead of a map. That is rule B6, and it was this
       module's to fix.

       The frame is now the whole rectangle. The sea is drawn to all four
       edges. The furniture — three zoom buttons and, from `working`, one
       four-segment strip — floats over the plate the way a key sits on an
       atlas sheet, and costs the world nothing. */
    const pw = W, ph = H, bx = 0, by = 0;
    const foreign = this._foreign();

    /* HOW HARD TO PRESS THE WORLD INTO THE PAPER.

       Only ever in ONE direction. A plate WIDER than the world band (every
       desktop) fits by its height and carries sea at the left and right edges,
       which is what a plate in an atlas looks like — pressing it further would
       crop latitude, and 69px of latitude at 1366 x 462 is Scotland at one end
       and the Southern Ocean at the other. A plate TALLER than the band (a
       phone, in portrait) is the only case where filling costs longitude, and
       FILL_MAX (see above) is currently 1: it costs New Zealand. */
    const fitW = W / WORLD_WIDTH, fitH = H / span;
    const fill = fitW < fitH ? Math.max(1, Math.min(FILL_MAX, fitH / fitW)) : 1;
    if (this.plate.setFill(fill)) this._frameBox = null;

    this._railMode = 'strip';
    this._dock = 'over';
    const narrow = W < 736;
    if (this._narrow !== narrow) { this._narrow = narrow; this._renderReadout(); }

    const over = this._overlapArea({ x: R.left, y: R.top, w: pw, h: ph }, foreign);
    this.fitChoice = { dock: 'over', clean: Math.round(pw * ph - over), pw, ph,
      covered: pw * ph ? Math.max(0, over / (pw * ph)) : 0, alt: null };
    if (!this.enlarged) this._bigGain = this._enlargedWidth();
    this._renderEnlargeButton();
    this._considerEnlarge();

    /* --- apply ---------------------------------------------------------- */
    const fs = this.frame.style;
    /* THE CACHE IS CHECKED AGAINST THE DOM, NOT ONLY AGAINST ITSELF.
       `_frameBox` is a string guard that skips the four style writes when
       nothing moved, and it went out of step with the element it is a cache
       of: measured at 1440x900 under reduced motion, 100 ms after the dossier
       opens, `plate.w` was 1008 and `.map__frame` was still 1440 — the world
       drawn at 1008 and stretched across 1440 — with every `.map__target`
       standing where the old plate had put it. A cached rectangle that
       disagrees with the rectangle on screen is not a cache. */
    const wantBox = bx + ',' + by + ',' + pw + ',' + ph;
    const fr = this.frame.getBoundingClientRect();
    if (this._frameBox !== wantBox || Math.abs(fr.width - pw) >= 2 || Math.abs(fr.height - ph) >= 2) {
      this._frameBox = wantBox;
      fs.left = bx + 'px'; fs.top = by + 'px'; fs.width = pw + 'px'; fs.height = ph + 'px';
    }
    this.plateRect = { x: R.left + bx, y: R.top + by, w: pw, h: ph };

    /* The furniture is laid over the plate, exactly congruent with it, and is
       pointer-transparent except for its own controls; map.css pins the strip
       to the head of the sheet and the zooms to its foot. It takes no width
       and no height from the world. */
    // Which band we are in, and therefore whether either object is on the
    // plate at all, is decided before the plate is measured for obstacles.
    this._syncDocks();
    if (this.furniture) {
      const rs = this.furniture.style;
      const sig = 'over:' + [R.left, R.top, pw, ph].map(Math.round).join(',');
      if (this._railSig !== sig) {
        this._railSig = sig;
        rs.left = Math.round(R.left) + 'px'; rs.top = Math.round(R.top) + 'px';
        rs.width = Math.round(pw) + 'px'; rs.height = Math.round(ph) + 'px';
        this.furniture.dataset.dock = 'over';
        this.furniture.dataset.railmode = 'strip';
      }
    }

    /* --- the canvas itself ---------------------------------------------- */
    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
    const changed = dpr !== this.plate.dpr || Math.abs(pw - this.plate.w) >= 2 || Math.abs(ph - this.plate.h) >= 2;
    let sized = false;
    if (changed) {
      // A resize throws away the Path2D cache and the offscreen ground. The
      // stage row flutters by a pixel or two as the panels around it reflow
      // with the year, so a small change must HOLD before it is honoured;
      // a real window resize holds immediately because it does not flutter.
      const big = force || Math.abs(pw - this.plate.w) >= 48 || Math.abs(ph - this.plate.h) >= 48 || dpr !== this.plate.dpr;
      const playing = this.ctx.store.getState().playing;
      const settle = playing ? 420 : 150;
      const now = performance.now();
      if (!this._sizeWant || this._sizeWant.w !== pw || this._sizeWant.h !== ph) {
        this._sizeWant = { w: pw, h: ph, at: now };
        if (this._sizeT) clearTimeout(this._sizeT);
        this._sizeT = setTimeout(() => { this._sizeT = 0; if (this._fit) this._fit(); }, settle + 20);
      }
      if (big || (now - this._sizeWant.at) >= settle) {
        sized = this.plate.setSize(pw, ph, dpr);
        if (sized) this.plate.setTokens(this.tokens, dpr);
        this._sizeWant = null;
      }
    } else if (this._sizeWant) {
      this._sizeWant = null;
      if (this._sizeT) { clearTimeout(this._sizeT); this._sizeT = 0; }
    }

    /* THE LABELS DODGE THIS MODULE'S OWN FURNITURE TOO. It used to stand in
       the margin, so it could not cover a name; it stands over the sea now, so
       it can, and "Fiji" under the zoom stack is a wrong map however small the
       stack is. The world does not shrink for them — only the names move. */
    const shifted = this.plate.setObstacles(this._obstacleRects(foreign));
    if (sized) this.plate.setView(clampView(this.plate.view, this.plate));
    /* A RESIZED PLATE HAS STALE TARGETS, AND A CLICK MAY NOT WAIT 120 ms.
       `_syncOptions` runs on a debounce, which is right for a camera nudge and
       wrong for a resize: opening the dossier takes the plate from 1440 to
       1008, every unit moves, and for the length of the debounce the 44px
       `.map__target` boxes are still standing where the old plate put them.
       Measured at 1440x900 under reduced motion, where the rail opens with no
       transition and the window is widest: Barbados' target sat at (482,364)
       while Barbados itself had moved to (347,280), and a click on it selected
       LAGOS — 5,000 km away, and a fail of this module's own acceptance test 3.
       The pick was never wrong; only the boxes over it were. A size change is
       the one event after which they must be right in the same turn. */
    if (sized) {
      if (this._optTimer) { clearTimeout(this._optTimer); this._optTimer = 0; }
      this._syncOptions();
    }
    return sized || shifted;
  },

  /**
   * What still stands on the plate after all that, in plate coordinates.
   *
   * The plate moves away from other modules' panels where the margin lets it;
   * where it cannot, this is the second line — a name is never set under a
   * panel, and a minimum-size mark is pushed onto free paper with a hairline
   * leader back to its true position (render.js#markLayout).
   */
  /** This module's own floating furniture, in viewport coordinates. */
  _ownRects() {
    const out = [];
    /* THE PEEK STRIP'S OWN WORD IS FURNITURE TOO — docs/RESPONSIVE_LAW.md §11.
       It is not in `.map__furniture` (it is a child of the plate, so that rule
       D1 can go on measuring it like everything else), so it has to be added
       by name. Measured at 390x844 on step 18 before it was: the chip sat at
       the strip's trailing end and the label engine printed `Assam` under it,
       so the one word on a 44px strip that said where the student was read
       `Assa`. LAYOUT_BUDGET §4: a word cut mid-word teaches nothing. */
    if (this.peekBtn) {
      const w = this.peekBtn.querySelector('.map__peekw');
      const cs = w && getComputedStyle(this.peekBtn);
      if (w && cs && cs.display !== 'none' && cs.visibility !== 'hidden') {
        const b = w.getBoundingClientRect();
        if (b.width > 8 && b.height > 4) out.push({ x: b.left - 6, y: b.top - 4, w: b.width + 12, h: b.height + 8 });
      }
    }
    if (!this.furniture) return out;
    for (const n of this.furniture.querySelectorAll('.map__switch, .map__controls, .map__zooms')) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const b = n.getBoundingClientRect();
      if (b.width < 12 || b.height < 12) continue;
      out.push({ x: b.left, y: b.top, w: b.width, h: b.height });
    }
    return out;
  },

  _obstacleRects(foreign = null) {
    const r = this.plateRect;
    if (!r || !r.w) return [];
    // This module's own furniture is always in the set: it stands over the sea
    // now, and a name printed under the strip is a wrong map however small the
    // strip is. `_syncOptions()` re-measures on its own schedule, so the two
    // callers must not disagree about what an obstacle is.
    const list = (foreign || this._foreign()).concat(this._ownRects());
    const out = [];
    for (const o of list) {
      const x0 = Math.max(o.x, r.x), x1 = Math.min(o.x + o.w, r.x + r.w);
      const y0 = Math.max(o.y, r.y), y1 = Math.min(o.y + o.h, r.y + r.h);
      if (x1 - x0 < 8 || y1 - y0 < 8) continue;
      out.push({ x: x0 - r.x, y: y0 - r.y, w: x1 - x0, h: y1 - y0 });
    }
    const covered = out.reduce((a, o) => a + o.w * o.h, 0) / (r.w * r.h);
    return covered > 0.7 ? [] : out;
  },

  /** The phone's one-chip reading of the dial, kept in step with it. */
  _renderDefChip(active) {
    if (!this.defChip) return;
    const d = active || definitionById(this.definition);
    const k = this.defChip.querySelector('.map__defkey');
    const w = this.defChip.querySelector('.map__defchipw');
    if (k) k.textContent = d.key;
    if (w) w.textContent = d.label;
    this.defChip.setAttribute('aria-label',
      `On this plate, “British” means ${d.key} ${d.label}. Open the reading to change it and to read what it leaves out.`);
    this.defChip.title = d.gloss;
  },

  /* ================================================ the dock-slot contract

     RESPONSIVE_LAW: below 62rem nothing floats inside the map rectangle. This
     module owns two of the four things that were: the zoom cluster and the
     "British means" dial. Both are RENDERED INTO the shell's named docks here
     rather than pinned over the plate by CSS, which is what §7 asks of P02 and
     what lets `chrome.css` §E delete its two transitional blocks.

       docked band, >= 40rem   dial  -> data-mount="dock-foot"  (one 36px row)
       docked band, any width  zooms -> data-mount="legend", trailing end
       docked band, < 40rem    dial  -> not on screen; see §5 and _openSheet
       float band              both  -> back over the plate, placed by
                                        _placeFurniture (below)

     Two notes on why this is JS and not a media query. First, the ribbon has
     two copies (P17 pins one the moment a rail opens), so "where is the
     ribbon" has no answer in CSS and the answer here is "whichever element
     currently carries data-mount=legend". Second, `.map__furniture` declares
     `container-type: size`, which makes it a containing block for every fixed
     descendant, so a child of it CANNOT be pinned to a viewport rectangle at
     all — §E had to pin to `--dock-key-dy`/`--dock-foot-dy` offsets for
     exactly that reason. Moving the node removes the whole problem. */

  _dockHosts() {
    const app = document.getElementById('app');
    const docked = !!app && app.dataset.dock === 'docked';
    // The same two conditions layout.css and chrome.css §E key on, read from
    // the shell's published attribute rather than re-derived from a width.
    const phone = window.matchMedia('(max-width: 39.999rem)').matches;
    /* AND A DOCK COSTS THE MAP ITS HEIGHT WHETHER OR NOT ANYTHING IS IN IT.
       The dial does not exist at `data-stage="plate"` — LAYOUT_BUDGET §4 defers
       it until the reader has touched the atlas — so docking an empty row on
       the cold plate spends 36px of map on nothing. Measured at 900 x 700 cold:
       `budget.js` B2 fell to 900x354 against its 380 floor and B5 counted
       32,400 px2 of `.stage__dock` inside the plate rectangle. The dock is
       claimed when there is something to put in it, which is also exactly what
       `data-dockfoot` means (RESPONSIVE_LAW §3.2). */
    const level = (app && app.dataset.stage) || 'plate';
    const wanted = level === 'working' || level === 'apparatus';
    return {
      docked,
      phone,
      foot: docked && !phone && wanted ? document.querySelector('#app [data-mount="dock-foot"]') : null,
      key: docked ? this._liveRibbon() : null,
    };
  },

  /**
   * WHICH OF THE TWO RIBBONS IS THE ONE ON SCREEN.
   *
   * P17 renders the colour ribbon twice below 62rem — its own slot, and a
   * `position: fixed` copy the moment a rail opens — and the shell says so in
   * as many words (RESPONSIVE_LAW §3.3: "where is the ribbon has no answer in
   * CSS"). Measured at 390 x 844 inside beat 9 with the bottom sheet open, the
   * slot copy is at y = -308, three hundred pixels above the top of the
   * window, and the live strip is the pinned one at y = 348. Docking into the
   * first match put the zoom cluster off the top of the screen. `--dock-key-y`
   * is the shell's published answer; the on-screen test is the fallback for
   * the frame before it is republished.
   */
  _liveRibbon() {
    const all = [...document.querySelectorAll('#app [data-mount="legend"], #app .legend__pin.stage__key')];
    if (!all.length) return null;
    const app = document.getElementById('app');
    const want = app ? parseFloat(getComputedStyle(app).getPropertyValue('--dock-key-y')) : NaN;
    let onScreen = null;
    for (const n of all) {
      const r = n.getBoundingClientRect();
      if (r.height < 2) continue;
      if (Number.isFinite(want) && Math.abs(r.top - want) <= 2) return n;
      if (r.bottom > 0 && r.top < window.innerHeight && !onScreen) onScreen = n;
    }
    return onScreen || all[0];
  },

  /** Put each object where the band says it lives. True if anything moved. */
  _syncDocks() {
    if (!this.furniture) return false;
    const h = this._dockHosts();
    let moved = false;
    const put = (node, host, end) => {
      if (!node) return;
      const target = host || this.furniture;
      if (node.parentNode !== target) { target.appendChild(node); moved = true; }
      // `dock-end` is the shell's own word for "the trailing end of this
      // strip" (RESPONSIVE_LAW §3.1); it is only meaningful in a dock.
      node.classList.toggle('dock-end', !!host && !!end);
      node.classList.toggle('is-docked', !!host);
    };
    put(this.foot, h.foot, false);
    put(this.zooms, h.key, true);
    // Below 40rem the foot is not on screen at all, so the door to the five
    // other readings goes where the dial went: into the sheet.
    if (this.controls && this.sheetTail) {
      const home = h.docked && h.phone ? this.sheetTail : this.foot;
      if (home && this.controls.parentNode !== home) { home.appendChild(this.controls); moved = true; }
    }
    if (this.furniture.dataset.band !== (h.docked ? 'docked' : 'float')) {
      this.furniture.dataset.band = h.docked ? 'docked' : 'float';
      moved = true;
    }
    // The ribbon is another module's slot and it re-renders on every year:
    // if a `replaceChildren` there takes the zoom cluster with it, put it back
    // on the next frame rather than on the next resize.
    if (h.key && this._keyWatch !== h.key) {
      if (this._keyObs) this._keyObs.disconnect();
      this._keyWatch = h.key;
      this._keyObs = new MutationObserver(() => {
        if (this.zooms && this.zooms.parentNode !== h.key && this._dockHosts().key === h.key) this._syncDocks();
      });
      this._keyObs.observe(h.key, { childList: true });
      this.d(() => { if (this._keyObs) this._keyObs.disconnect(); });
    } else if (!h.key && this._keyObs) {
      this._keyObs.disconnect(); this._keyObs = null; this._keyWatch = null;
    }
    return moved;
  },

  /* ============================================ where the furniture stands

     "IT ONLY COVERS SEA" IS AN ASSUMPTION ABOUT THE FRAMING, AND A LESSON
     BEAT BREAKS IT.

     map.css argues, correctly, that on the DEFAULT framing of a British
     Empire plate the top-right corner is eastern Siberia and the foot is the
     Southern Ocean, so furniture put there stands on nothing. Measured on the
     running app that argument holds — and it holds only while the camera is
     at home. Cold-loaded into beat 9 of the authored path, which flies the
     camera to the Company in Bengal, at 1366 x 768:

       drawn map            956 x 462  (x 0..956, y 108..570)
       .map__foot           936 x 42 at 10,518
       covered              45,016 px2 of the DRAWN MAP
       standing on          Andhra Pradesh 3,595 px2 · Puducherry 2,632 ·
                            Tamil Nadu 924 · British Manila 4,308

     The beat is about the Company in India and the app's signature control
     was drawn across the Company's own coast. The reviewer saw the same thing
     over the Barbados/Tobago cluster and over Trinidad and the Guianas.

     So the corner is no longer a constant. Every repaint that matters, this
     scores the four corners and the two edges against the units actually
     drawn, in the framing actually on screen, and puts each object where the
     map is emptiest. Two rules keep it from flickering: an object moves only
     when it is standing on a real amount of drawn land (STAND_ON px2), and
     only to a slot that is at least a third better; and it never moves during
     a drag. Below 62rem none of this runs, because RESPONSIVE_LAW takes both
     objects off the plate entirely and there is nothing left to place. */

  /* TWO LIMITS, AND THEY ARE DIFFERENT KINDS OF COST.

     MOVE is cheap: a corner is a corner and a reader who has learned "the
     zooms are in a corner" has learned this one too. 1,200 px2 is about
     two-thirds of one 44px target, so a control moves as soon as it clips a
     single island's reach.

     SHED is expensive: the four words — claimed, administered, controlled,
     influenced — ARE the teaching, and hiding three of them to save a corner
     would be answering a layout problem with a pedagogical one. So the words
     go only when the best corner still stands on more than about three whole
     targets, which on the authored path happens only where the camera has
     flown into a continent and there is genuinely nowhere clear. Measured:
     the default world framing scores 3,999 px2 at its best corner (the
     Falklands, South Georgia, the South Sandwich Islands, Heard and McDonald
     and New Zealand all live down there) and keeps its words; beat 9's plate,
     flown into Bengal, scored 45,016 and does not. */
  _standOnLimit() { return 1200; },
  _shedLimit() { return 6000; },

  /** The candidate boxes, in plate coordinates, for one object. */
  _slotBoxes(kind, full = false, lift = 0) {
    const W = this.plate.w, H = this.plate.h;
    const inset = 10;
    const z = this.zooms ? this.zooms.getBoundingClientRect() : null;
    let f = this.foot ? this.foot.getBoundingClientRect() : null;
    // `full` asks for the row at its UNSHED width, which is the only way to
    // ask "could the words come back?" while they are away. The width is the
    // last one measured with them on; there is no other way to know it.
    if (full && this._footFullW) f = { width: this._footFullW, height: this._footFullH || (f ? f.height : 42) };
    if (kind === 'zooms') {
      const w = Math.max(40, z ? z.width : 46), h = Math.max(40, z ? z.height : 124);
      return {
        tr: { x: W - inset - w, y: inset, w, h },
        tl: { x: inset, y: inset, w, h },
        br: { x: W - inset - w, y: H - inset - h, w, h },
        bl: { x: inset, y: H - inset - h, w, h },
      };
    }
    // The foot row is content-sized and anchored to one end of one edge; it is
    // measured, not guessed, so a two-line wrap is scored as two lines.
    const w = Math.min(W - inset * 2, Math.max(120, f ? f.width : W - inset * 2));
    const h = Math.max(28, f ? f.height : 42);
    const L = Math.max(0, lift || 0);
    /* SIX PLACES, NOT FOUR. A strip along the middle of the foot is where an
       engraved atlas puts its key as often as a corner is, and it is clean at
       framings where both ends are land — which is what the alternative to it
       costs: shedding the three words was firing at four beats of twelve, and
       "claimed / administered / controlled / influenced" IS the teaching. */
    return {
      bl: { x: inset, y: H - inset - h - L, w, h },
      bc: { x: Math.max(inset, Math.round((W - w) / 2)), y: H - inset - h - L, w, h },
      br: { x: W - inset - w, y: H - inset - h - L, w, h },
      tl: { x: inset, y: inset + L, w, h },
      tc: { x: Math.max(inset, Math.round((W - w) / 2)), y: inset + L, w, h },
      tr: { x: W - inset - w, y: inset + L, w, h },
    };
  },

  /**
   * What one plate-space box costs: the px2 of drawn units it overlaps, and —
   * the number that actually decides things — how many units it puts its own
   * body over the ANCHOR of. Area is a nuisance; an anchor under a control is
   * a place that cannot be clicked. Measured on the cold 1366 plate with the
   * dial at its designed corner, `document.elementFromPoint` over the
   * Falkland Islands returned `map__sheetlink`.
   */
  _landUnder(box) {
    const r = this._landCost(box);
    return r.area;
  },

  _landCost(box) {
    if (!this.plate || !this.plate.paint) return { area: 0, hits: 0 };
    const cam = this.plate.camera();
    let sum = 0, hits = 0;
    for (const uid of this.plate.paint.keys()) {
      const u = this.plate.unitScreen(uid, cam);
      if (!u) continue;
      /* THE SAME BOX `_syncOptions` GIVES THE UNIT, TO THE PIXEL.
         What has to stay clear is not the drawn shape, it is the thing a
         finger can hit: every unit gets a 44px floor there, tiny or not.
         Scored at the drawn geometry the default foot corner tested at 38 px2
         while `.map__target` for the Falklands, South Georgia, the South
         Sandwich Islands and Heard and McDonald measured 3,963 px2 under the
         dial — the round-6 defect ("elementFromPoint over New Zealand
         returned map__zoom") with a different control on top. Two functions
         that disagree about where a unit is are worse than either. */
      const bw = Math.max(44, Math.min(u.w, this.plate.w * 0.5));
      const bh = Math.max(44, Math.min(u.h, this.plate.h * 0.6));
      const cx = u.tiny ? u.mx : u.px;
      const cy = u.tiny ? u.my : u.py;
      const x0 = cx - bw / 2, x1 = cx + bw / 2;
      const y0 = cy - bh / 2, y1 = cy + bh / 2;
      const w = Math.min(box.x + box.w, x1) - Math.max(box.x, x0);
      const h = Math.min(box.y + box.h, y1) - Math.max(box.y, y0);
      if (w > 0 && h > 0) sum += w * h;
      if (cx >= box.x && cx <= box.x + box.w && cy >= box.y && cy <= box.y + box.h) hits++;
    }
    return { area: Math.round(sum), hits };
  },

  /**
   * Choose a corner for the zooms and an end for the definition row, and
   * publish both on the furniture layer for map.css to act on. Returns true
   * when anything moved, so the caller can re-measure its obstacles.
   */
  _placeFurniture() {
    if (!this.plate || !this.furniture || !this.plateRect) return false;
    // Below 62rem both objects are docked out of the plate (RESPONSIVE_LAW).
    if (document.getElementById('app') && document.getElementById('app').dataset.dock === 'docked') {
      if (this.furniture.dataset.zoomslot || this.furniture.dataset.footslot || this.furniture.dataset.tight) {
        delete this.furniture.dataset.zoomslot; delete this.furniture.dataset.footslot;
        delete this.furniture.dataset.tight;
        return true;
      }
      return false;
    }
    if (this.frame && this.frame.classList.contains('is-dragging')) return false;
    const limit = this._standOnLimit();
    let moved = false;
    /* MEASURE THE ROW WE ARE GOING TO DRAW, NOT THE ONE ON SCREEN. Until
       `data-footslot` is set map.css leaves the row full-width — 1346px at
       1366 x 768 — and every corner scored over the shed limit, so the words
       came off at the DEFAULT view, which is the one place they must not.
       Setting the slot first makes the row content-sized; the very next
       `getBoundingClientRect` in `_slotBoxes` flushes layout, so this costs one
       frame of nothing and gives every number below the right width. */
    if (!this.furniture.dataset.footslot) { this.furniture.dataset.footslot = 'bl'; moved = true; }
    if (!this.furniture.dataset.zoomslot) { this.furniture.dataset.zoomslot = 'tr'; moved = true; }
    /* TWO NUMBERS, AND THE SECOND ONE DECIDES.

       `area` is how much drawn ground a slot covers; `hits` is how many units
       it puts its own body over the ANCHOR of, which is the number that means
       something: an anchor under a control is a place that cannot be clicked.
       Measured on the cold 1366 plate at `working`, with the dial in the
       corner map.css designed for it, `document.elementFromPoint` over the
       Falkland Islands returned `map__sheetlink`. Slots are compared by hits
       first, then by area, so a corner that covers more sea and no place beats
       one that covers less sea and a colony. */
    /* ONE COST, IN PIXELS, SO THE TWO HARMS CAN BE COMPARED.

       An anchor under the strip is a place that cannot be clicked, and it is
       worth about two 44px targets of covered ground: HIT_PX. Ranking hits
       strictly before area was tried and it is worse — measured on the
       authored path, it moved the dial from a corner with one southern-ocean
       anchor under it (1,824 px2) to the middle of the top edge with none
       (11,690 px2, across Madhya Pradesh, Odisha, Chhattisgarh and West
       Bengal, on the beats about India). Two harms, one currency. */
    const HIT_PX = 4000;
    const cost = (c) => c.area + c.hits * HIT_PX;
    const better = (a, b) => cost(a) - cost(b);
    const pick = (kind, order, current, taken, lift = 0) => {
      const boxes = this._slotBoxes(kind, false, lift);
      const free = order.filter((k) => (typeof taken === 'function' ? !taken(boxes[k], k) : k !== taken));
      if (!free.length) free.push(order[0]);
      const now = current && boxes[current] && free.includes(current) ? current : free[0];
      let best = now, bestCost = this._landCost(boxes[now]);
      if (bestCost.hits === 0 && bestCost.area <= limit) return { slot: best, ...bestCost };
      for (const k of free) {
        if (k === now) continue;
        const c = this._landCost(boxes[k]);
        // A third cheaper, or it is not worth moving a control whose position
        // a reader has already learned.
        if (cost(c) < cost(bestCost) * 0.67) { best = k; bestCost = c; }
      }
      return { slot: best, ...bestCost };
    };
    const ORDER = ['bl', 'bc', 'br', 'tl', 'tc', 'tr'];
    const wasTight = this.furniture.dataset.tight === 'yes';
    if (!wasTight && this.foot) {
      const r = this.foot.getBoundingClientRect();
      if (r.width > 20) { this._footFullW = r.width; this._footFullH = r.height; }
    }
    let foot = pick('foot', ORDER, this.furniture.dataset.footslot, null, 0);
    let lift = 0;
    /* LIFT BEFORE YOU SHED. The corner is right and the row is 42px tall: on
       the cold plate the Falklands sit about a row and a half above the foot,
       so raising the strip over the same sea clears them and costs the reader
       nothing at all — the words stay, the corner stays, the map is unchanged.
       Three steps of one row each, and no further: a strip a third of the way
       up a plate is not at the foot of it any more. */
    if (foot.hits > 0) {
      for (const L of [48, 96, 144]) {
        const alt = pick('foot', ORDER, foot.slot, null, L);
        if (better(alt, foot) < 0) { foot = alt; lift = L; }
        if (foot.hits === 0) break;
      }
    }
    /* AND SHED ONLY IF LIFTING DID NOT DO IT. The three definitions not in
       force drop their word and keep their number (LAYOUT_BUDGET B3: shed a
       stratum, do not ask for the room back), which takes the row from 771px
       to about 350 and lets it stand where a full row could not.

       ENTERING AND LEAVING ARE NOT THE SAME TEST, and the first draft used one
       for both, which oscillates: shedding shrinks the row, the smaller row
       scores clean, the words come back, the row is over the limit again.
       Measured on the authored path, the dial was tight at steps 7, 15, 17 and
       21 and not at 1 and 13, for no reason a reader could see. The words come
       back only when the row would stand clean AT ITS FULL WIDTH. */
    /* SHEDDING IS FOR AN UNREACHABLE PLACE, NOT FOR COVERED SEA — and it is
       two steps, cheapest first, because the four words are the lesson.

         "yes"  drops the word from the three definitions NOT in force.
                The one in force keeps its word, all four keep their number,
                their 44px target and their accessible name, and all four are
                spelt out in the sheet.

       Each step is taken only if the one before it did not get `hits` to 0
       across every slot and every lift, and the whole thing unwinds only when
       the full row would stand clean — measured, because a single test for
       entering and leaving oscillates: the first draft was tight at steps 7,
       15, 17 and 21 of the authored path and not at 1 and 13, for no reason a
       reader could see. */
    /* AND NOTHING HERE MAY REMOVE A CONTROL. An earlier step in this ladder
       hid `.map__controls` — the door to Projection, Weight, Stitching,
       Silences and Enlarge — because LAYOUT_BUDGET §7 defers it to
       `apparatus` anyway, and it is 220px of a 771px row. That is shedding a
       ROUTE, not a stratum: `p02r8-accept.js` then timed out at 1366 x 768
       waiting for `.map__modesmore`, which is the only way into five of this
       module's ideas. A label may go. A door may not. */
    const shedLevels = ['no', 'yes'];
    const trySlot = (level) => {
      this.furniture.dataset.tight = level;
      let f = pick('foot', ORDER, foot.slot, null, 0), L = 0;
      if (f.hits > 0) {
        for (const step of [48, 96, 144]) {
          const alt = pick('foot', ORDER, f.slot, null, step);
          if (better(alt, f) < 0) { f = alt; L = step; }
          if (f.hits === 0) break;
        }
      }
      return { f, L };
    };
    const was = shedLevels.includes(this.furniture.dataset.tight || 'no') ? this.furniture.dataset.tight || 'no' : 'no';
    let level = 'no', chosen = null;
    for (const lv of shedLevels) {
      chosen = trySlot(lv);
      level = lv;
      if (chosen.f.hits === 0) break;
    }
    foot = chosen.f; lift = chosen.L;
    if (this.furniture.dataset.tight !== level) this.furniture.dataset.tight = level;
    if (was !== level) moved = true;
    /* TWO OBJECTS IN DIFFERENT CORNERS CAN STILL BE IN THE SAME PLACE.
       Round 6 made the two never take the same slot KEY and called that a
       structural guarantee. It is not one, because the definition row is
       content-sized and its box is clamped to the plate's width: measured at
       1024 x 768 — the commonest classroom projector — inside beats 9, 12, 17,
       21 and 24 the plate is 688 wide, the row is 668, so its `tr` box runs
       x = 10 to 678 and IS its `tl` box. `data-footslot="tr"` and
       `data-zoomslot="tl"` were different keys naming one rectangle, and the
       zoom cluster (46 x 124 at 10,118) stood on the row (668 x 75 at 10,118)
       for 46 x 75 = 3,450 px2, clipping the dial's first word so that
       "'British' means" read "sh' means". It does not happen at 1366, 1440 or
       1920, where the row is narrower than the plate by more than a cluster.

       So the second object is placed against the first one's RECTANGLE, with
       a gap, rather than against its name. A full-width row occupies one edge;
       the two corners on the opposite edge are always free, and the ranking
       below then picks the emptier of them. */
    const footBox = this._slotBoxes('foot', false, lift)[foot.slot];
    const GAP = 8;
    const hitsFoot = (b) => !!(footBox && b
      && b.x < footBox.x + footBox.w + GAP && b.x + b.w + GAP > footBox.x
      && b.y < footBox.y + footBox.h + GAP && b.y + b.h + GAP > footBox.y);
    const zoom = pick('zooms', ['tr', 'tl', 'br', 'bl'], this.furniture.dataset.zoomslot, hitsFoot, 0);
    const liftPx = lift + 'px';
    if (this.furniture.style.getPropertyValue('--map-foot-lift') !== liftPx) {
      this.furniture.style.setProperty('--map-foot-lift', liftPx); moved = true;
    }
    if (this.furniture.dataset.zoomslot !== zoom.slot) { this.furniture.dataset.zoomslot = zoom.slot; moved = true; }
    if (this.furniture.dataset.footslot !== foot.slot) { this.furniture.dataset.footslot = foot.slot; moved = true; }
    return moved;
  },

  /**
   * THE CONTROL THAT WAS MISSING: give the plate the whole window.
   *
   * The map is handed a 329px strip on a 900px screen because the timeline
   * beneath it is 500px tall, and inside that strip a 2.37:1 world can only
   * ever be 780px wide. Enlarged, the same 1440px window draws it 1160px wide
   * with nothing over it — which is what a plate in an atlas looks like. It is
   * one key, it is reversible with the same key or Escape, and the timeline is
   * one keystroke away, so nothing is hidden and nothing is lost.
   */
  setEnlarged(on, { announce = true } = {}) {
    on = !!on;
    if (on === !!this.enlarged) return;
    this.enlarged = on;
    const host = document.querySelector('#app [data-mount="overlay"]');
    if (on && host) {
      host.appendChild(this.el);
      if (this.furniture) { host.appendChild(this.furniture); this.furniture.classList.add('is-big'); }
      this.el.classList.add('is-enlarged');
    } else {
      this.ctx.root.appendChild(this.el);
      this.el.classList.remove('is-enlarged');
      if (this.furniture) this.furniture.classList.remove('is-big');
      const st = this.el.style;
      st.top = st.left = st.width = st.height = st.right = st.bottom = '';
      this._bigSig = null;
    }
    this._renderEnlargeButton();
    this._frameBox = null; this._railSig = null;
    if (this._fit) this._fit(true);
    this._repaint(true);
    this._syncOptions();
    if (announce) {
      this.ctx.util.announce(on
        ? 'The plate now fills the window. Press E or Escape to bring the timeline back.'
        : 'The plate is back in the stage, with the timeline under it.');
    }
    this.ctx.bus.emit('map:enlarged', { enlarged: on });
  },

  /** How wide the world would be drawn if the plate took the window. */
  _enlargedWidth() {
    const vw = window.innerWidth;
    const dos = this._dossierRect();
    let availW = vw;
    if (dos && dos.width < vw - 80 && dos.left > vw * 0.45) availW = Math.max(240, Math.round(dos.left));
    return availW;
  },

  /**
   * THE ONE CASE WHERE THE PLATE TAKES THE SCREEN WITHOUT BEING ASKED.
   *
   * On a 390 x 844 phone the shell gives this module a stage 183px tall, and
   * P17's byline — a panel this module does not own and may not move — covers
   * 84% of the largest plate that fits in it. Measured with a 50 x 50
   * `elementFromPoint` grid: the world was 0% visible. A map nobody can see is
   * not a map, and no amount of apparatus around it makes up for that.
   *
   * So on a narrow window, once, at the first settled layout, the plate takes
   * the room it needs and says so. It is not a mode the student is locked in:
   * the tile that did it now reads Shrink, in the accent, and E or Escape
   * undoes it. It never fires twice, it never fires after the student has
   * touched the control themselves, and it never fires on a desktop, where the
   * same measurement now reads between 0.6% and 22%.
   */
  _considerEnlarge() {
    if (this.enlarged || this._bigTouched || this._autoBigDone) return;
    if (!this.fitChoice || window.innerWidth >= 820) return;
    if (this.fitChoice.covered < 0.4) return;
    /* AND ONLY IF IT IS ACTUALLY BIGGER — the round-5 correction.
       This device was built when a phone's docked band was 122px and every
       other module's panel could stand on it. RESPONSIVE_LAW ended both:
       `.stage__map` clips, nothing floats inside it, and the band is 192px.
       Measured at 390 x 844 under `prefers-reduced-motion` with a territory
       selected, the enlarged plate came out 390 x 165 — the map made itself
       25px SMALLER and announced that it had taken the space it needs. It
       also made that choice under reduced motion and not under full motion at
       the same beat, because the two settle their first frames in a different
       order, and a layout with two answers is a layout with none. Both are
       fixed by asking the question with a number. */
    {
      const box = this._enlargedBox();
      const now = this.plateRect ? this.plateRect.w * this.plateRect.h : 0;
      if (box && now && box.w * box.h <= now * 1.15) return;
    }
    // Only where there is somewhere to go. A phone whose dossier sheet leaves
    // 90px under the masthead gets a worse map enlarged than docked, and an
    // enlarged plate that small can only be drawn by standing on the panel it
    // was dodging.
    {
      const dos = this._dossierRect();
      const top = this._dockTop();
      const gap = dos && dos.top > top ? dos.top - top : Infinity;
      /* THE FLOOR IS 96px, NOT 140, WHEN THERE IS OTHERWISE NO MAP AT ALL.
         Round 5 refused to enlarge into a band under 140px on the reasoning
         that a 90px plate is worse docked than enlarged. True — but the case
         it was protecting against is not the case that actually occurs: on a
         390 x 844 phone the dossier sheet is 1,999px tall and starts 135px
         under the masthead, so the choice is not between a small map and a
         large one, it is between a 135px map and NO map. A 135px world with
         Africa and India in it is a map; 25 visible rows of ocean is not. */
      if (gap < 96) return;
      if (gap < 140 && this.fitChoice.covered < 0.85) return;
    }
    this._autoBigDone = true;
    const pct = Math.round(this.fitChoice.covered * 100);
    setTimeout(() => {
      if (this.enlarged || this._bigTouched || !this.plate) return;
      this._autoBigWhy = `Other panels covered ${pct}% of the ${this.fitChoice.pw} × ${this.fitChoice.ph} plate this window had room for, so the map took the space it needs. Shrink gives the timeline its room back.`;
      this.setEnlarged(true, { announce: false });
      this.ctx.util.announce(`The map was ${pct}% covered by other panels, so it has taken the top of the screen. Press E or use the Shrink control to bring the timeline back.`);
    }, 60);
  },

  _renderEnlargeButton() {
    if (!this.bigBtn) return;
    const on = !!this.enlarged;
    this.bigBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    this.bigBtn.classList.toggle('is-on', on);
    const now = this.bigBtn.querySelector('.map__modenow');
    const sub = this.bigBtn.querySelector('.map__modesub');
    if (now) now.textContent = on ? 'Shrink' : 'Enlarge';
    this.bigBtn.setAttribute('aria-label', on
      ? 'Shrink — give the timeline its room back (key E)'
      : 'Enlarge — the plate takes the room it needs (key E)');
    // THE CONTROL SAYS WHAT IT IS WORTH, IN PIXELS, MEASURED NOW. "The plate
    // fills the window" is a promise; "1,182px wide instead of 780" is a
    // number the student can check by pressing the key.
    const gain = !on && this._bigGain && this.fitChoice
      ? Math.round(this._bigGain / Math.max(1, this.fitChoice.pw) * 10) / 10 : 0;
    if (sub) {
      /* COHERENCE PASS — ONE LABEL, NOT THREE. This sub-line said three
         different things at three moments — "1,182px of world instead of 939",
         "1,108px of world instead of 728" and "43% of this plate is under other
         panels" — so the same control appeared to be three controls, and two of
         the three were measured in pixels. It says one thing now. That the
         plate is covered is still reported, but by the control lighting up
         (`is-urgent`, driven by the same measurement), which is what a signal
         is for. */
      sub.textContent = on ? 'give the timeline its room back' : 'fills the window';
    }
    // Urgent while the docked plate is small or covered: this is the control
    // that answers the charge, and round 4 shipped it looking like the others.
    /* ENLARGE IS NOT URGENT ANY MORE, AND SAYING SO WOULD BE A LIE.
       It was urgent when the shell handed this module a 329px strip: pressing
       it doubled the world. The plate is now 60-68% of the viewport by
       contract and enlarging it takes the four-phase spine band's row to buy a
       few hundred pixels. The tile stays — it is still the right control when
       something really is standing on the plate — and it goes loud only then. */
    const urgent = !on && !!this.fitChoice && this.fitChoice.covered > 0.35;
    this.bigBtn.classList.toggle('is-urgent', urgent);
  },

  /**
   * THE BAND CHANGED SHAPE: FLY THE SUBJECT AGAIN.
   *
   * Called after every re-layout. It is a no-op unless a beat has named a
   * subject and the plate's drawable box has changed by more than a tenth in
   * either axis since that subject was last framed — so a repaint, a hover or
   * a year change never moves the camera, and a peek strip opening or closing
   * always does.
   */
  _refly() {
    const t = this._flyTarget;
    if (!t || !this.plate || !this.camera) return false;
    const c = this.plate.camera();
    if (!c || !c.availW || !c.availH) return false;
    const last = this._flyBox;
    if (last && Math.abs(c.availW - last.w) <= last.w * 0.1
      && Math.abs(c.availH - last.h) <= last.h * 0.1) return false;
    this._flyBox = { w: c.availW, h: c.availH };
    if (!last) return false;           // first measurement is not a change
    /* AND ONLY IF THE PLATE IS STILL WHERE THE BEAT PUT IT. A student who has
       panned or zoomed owns the camera: opening the dossier changes the
       rectangle by 30% at 1366x768, and re-flying then would throw away the
       pan they just made. */
    const v = this._flyView, now = this.plate.view;
    if (!v || !now || Math.abs(v.k - now.k) > 0.01
      || Math.abs(v.x - now.x) > 0.001 || Math.abs(v.y - now.y) > 0.001) return false;
    const moved = this.camera.flyTo(t.uid, { zoom: t.zoom });
    if (moved) this._flyView = { ...this.plate.view };
    return moved;
  },

  _wireResize() {
    const fit = (force) => {
      if (this._fitting) return;       // never re-enter: a repaint can resize the card
      this._fitting = true;
      try {
        if (this._layout(force === true)) {
          this._refly();
          this._repaint(true); this._syncOptions();
        }
      } finally { this._fitting = false; }
    };
    this._fit = fit;
    // Observe only my own boxes. Observing the other modules' mounts as well
    // put the browser into a ResizeObserver feedback loop — their panels
    // re-render when the map re-paints — so the rest is re-measured on a
    // debounce, from the events that actually change the furniture.
    // The callback must not mutate layout synchronously: the plate and the rail
    // are both observed and both change size when the other does, and doing the
    // work inside the notification is exactly what produces
    // "ResizeObserver loop completed with undelivered notifications".
    let roFrame = 0;
    const ro = new ResizeObserver(() => {
      if (roFrame) return;
      roFrame = requestAnimationFrame(() => { roFrame = 0; fit(); });
    });
    this.d(() => { if (roFrame) cancelAnimationFrame(roFrame); });
    ro.observe(this.el);
    this.d(() => ro.disconnect());
    this._fitTimers = [];
    this._fitLater = () => {
      if (this._fitT) return;
      this._fitT = setTimeout(() => { this._fitT = 0; fit(); }, 90);
    };
    // Panels mount after the map does, and some of them settle late.
    for (const ms of [300, 900, 2200]) this._fitTimers.push(setTimeout(() => fit(), ms));
    this.d(() => { if (this._fitT) clearTimeout(this._fitT); if (this._sizeT) clearTimeout(this._sizeT); if (this._panelT) clearTimeout(this._panelT); for (const t of this._fitTimers) clearTimeout(t); });
    this.d(this.ctx.util.on(window, 'resize', () => this._fitLater()));
    fit(true);
  },
  /** A foreign panel has just opened or closed: re-measure, twice, cheaply. */
  _panelFit() {
    if (this._fitLater) this._fitLater();
    clearTimeout(this._panelT);
    this._panelT = setTimeout(() => { this._panelT = 0; if (this._fit) this._fit(); }, 460);
  },

  update(state, prev, changed) {
    if (!this.plate) return;
    if (changed.has('year')) {
      // Paint first, then measure. The card asks the plate what is drawn on it
      // (the silence notes do), so measuring first described last year's map.
      this._repaint();
      this._measure();
      if (!state.playing) this._syncOptionsSoon();
      // A sentence about the projection is about a plate that has moved on.
      this._hushReading();
      // The Silences tile is the one control whose answer depends on the year.
      if (!state.playing) {
        this._syncSilenceBtn();
        /* AND THE MODE SAYS SO WHEN THE YEAR LEAVES IT BEHIND. Scrubbing back
           past 1910 with H still on leaves a mode that draws nothing and says
           nothing — a reader looking for absences at 1700 has no way to know
           the plate is answering. It names the year the first hole opens, and
           offers it, exactly as pressing H at 1700 would. */
        if (this.silenceMode && !this._holesAt(state.year)) {
          if (this._noHoleSaidFor !== state.year) {
            this._noHoleSaidFor = state.year;
            this._offerHoleYear(state.year);
          }
        } else { this._noHoleSaidFor = null; }
      }
    }
    if (changed.has('activeLayer')) { this.paintSig = ''; this._repaint(true); this._syncOptionsSoon(); }
    if (changed.has('selectedTerritoryId')) {
      this._repaint(); this._ensureSelectionVisible(); this._syncOptionsSoon();
      /* RE-MEASURE WHAT IS STANDING ON THE PLATE. Opening the dossier is the
         single largest change to this module's rectangle that happens in a
         session, and it was the one change that did not re-measure: `fitChoice`
         was last computed by the 2,200ms settle timer and then believed for the
         rest of the session. Measured on a 390 x 844 phone with the Kenya
         dossier open, the sheet covered 451 of the plate's 476 rows — 95% —
         and this module still reported `covered: 0.365`, so neither the
         auto-enlarge nor the "other panels are standing on this plate" caveat
         ever fired and the reader was left with no map and no explanation.
         The dossier settles a beat after the state change, so twice. */
      this._panelFit();
    }
    if (changed.has('mapView') && state.mapView) {
      const v = state.mapView, c = this.plate.view;
      if (Math.abs(v.k - c.k) > 1e-4 || Math.abs(v.x - c.x) > 1e-5 || Math.abs(v.y - c.y) > 1e-5) {
        this.plate.setView(clampView(v, this.plate)); this._repaint(); this._syncOptionsSoon();
      }
    }
    if (changed.has('panelState') || changed.has('activeTour') || changed.has('tourStep')
      || changed.has('selectedTerritoryId') || (changed.has('playing') && !state.playing)) {
      if (this._fitLater) this._fitLater();
    }
    if (changed.has('playing') && !state.playing) { this._renderReadout(); if (this._fitLater) this._fitLater(); }
    if (changed.has('filters')) {
      const f = state.filters || {};
      if (f.def && f.def !== this.definition) this.setDefinition(f.def, { announce: false });
      if (f.proj && f.proj !== this.projection) this.setProjection(f.proj);
    }
  },

  destroy() {
    if (this.morph) cancelAnimationFrame(this.morph);
    if (this._stillT) clearTimeout(this._stillT);
    if (this._optTimer) clearTimeout(this._optTimer);
    if (this._cardT) clearTimeout(this._cardT);
    if (this._sayT) clearTimeout(this._sayT);
    // Enlarged, the plate lives in the shell's overlay mount, not in our own
    // root: replaceChildren() on the root would leave it on screen for ever.
    if (this.enlarged) this.setEnlarged(false, { announce: false });
    if (this.el && this.el.parentNode) this.el.remove();
    if (this.d) this.d.all();
    if (this.ctx && this.ctx.root) this.ctx.root.replaceChildren();
  },
};
