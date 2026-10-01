/* =============================================================================
   layers/index.js — P06, THEMATIC LAYERS.
   Owner: layers. Directory: app/js/layers/, app/css/layers.css.

   THE ONE JOB. Same territories, same year, drawn a different way each time —
   "the thing a book cannot do" — with every encoding labelled, so that a
   re-encoding is never a fresh lie. Thirteen readings are registered. A
   fourteenth that FEATURE_SPEC asks for is NOT registered, because the atlas
   has no figure to draw it from, and it is named and explained in the sheet
   instead of quietly missing.

   ---------------------------------------------------------------------------
   WHAT ROUND 3 CHANGED HERE, AND WHY
   ---------------------------------------------------------------------------
   The round-3 verdict capped the whole artefact at 40 over one sentence:
   nine acquisition records whose losing party is Tipu Sultan's Mysore, the
   Maratha confederacy, the Lahore Durbar, the Konbaung kingdom, Nepal or
   Bhutan were headlined, in the app's own vocabulary, as "handed over by
   another European power". This piece was carrying its own version of that
   error — the acquisition plate's `war-spoil` family read "won from another
   empire", glossed "at the end of a EUROPEAN war", over Punjab, Assam,
   Arakan, Kumaon and Ajmer.

   Three changes, in ascending order of size.

   1. THE WORD IS NEUTRAL AND THE SPLIT IS COUNTED. `war-transfer` is one tag
      over two different events. The key row now prints, recomputed at every
      year from `counterparties[].kind`, how many of them are cessions where
      every named party is a European power and how many are a defeated state
      giving up territory — and it names the states. Retag a shard and the
      line moves; there is no list of places kept by hand anywhere in here.

   2. EVERY UNIT ON THE ACQUISITION PLATE NAMES THE PARTY THAT LOST IT.
      "settled on land already lived in — from Kalinago and Arawak of
      Ichirouganaim". The plate that asks what Britain did can no longer
      answer without saying to whom.

   3. A NEW READING: `taken-from`. Neutralising a gloss removes a sentence; it
      does not remove the vantage point that produced it, and a layer called
      HOW BRITAIN TOOK IT reproduces DIDACTIC_SPEC M17 by construction however
      carefully its nine words are written. Every one of the 469 acquisition
      records in this dataset names at least one counterparty, with a `kind`
      from a controlled vocabulary of eight, and no surface in this app drew
      that field. It is the second step of the route now, immediately after
      the reading that needs it, and it is the plate on which Punjab says
      "the Sikh empire (Lahore Durbar)".

   And one fix from the same verdict that is not about vocabulary: the
   informal-empire haze was arriving on guided beats that do not name it —
   "adding a second argument to a beat that is supposed to carry one". Its
   1830-1914 default now stands down while a beat is on screen. See
   `_pressureOn`.

   WHERE EACH THING IS DRAWN
     · the plate            re-keyed through `window.__map.plate.setPaint`,
                            P02's own published drive surface. See paint.js.
     · over the plate       hazes, pins and the network, in the shell's
                            `map-overlay` slot. See overlay.js.
     · the key              a card on the plate while one of our layers paints,
                            because P17's colour ribbon is and stays the
                            LEGAL-STATUS key. See panel.js.
     · the reference        `ask:sheet` — every layer, its byline, its caveat,
                            every category with its count, the sources, and the
                            layer this atlas cannot draw.
     · the sentence         `ask:say` at priority 40, the shell's one voice.

   ---------------------------------------------------------------------------
   HOW THE AUTHORED PATH (app/js/tours/) DRIVES THIS SURFACE
   ---------------------------------------------------------------------------
   LISTENS FOR
     ask:layer      {id, predict?}       set the active layer. Unknown id is
                                         refused and logged, never guessed.
                                         `predict:false` skips the commit-first
                                         question, for a path running its own.
     layers:set     {id}                 alias of the above.
     ask:layerKey   {open?:bool}         open/close the reference sheet.
     ask:pressure   {on:bool}            force the informal haze on or off,
                                         overriding the 1830–1914 default.
     ask:lockLayer  {id, on, why}        hold a layer's marks on and disable
                                         the control that would remove them.
                                         Used for T4: the resistance pins may
                                         not be switched off during the
                                         Atlantic chapter.
     ask:isolate    {layer, category}    paint only one category of a layer.
     tours:beat     {chapter}            the Atlantic chapter locks resistance.
   EMITS
     layers:ready    {layers:[{id,label,sentence,byline,caption,group}]}
     layers:changed  {id, label, sentence, byline, caption, painted, absent,
                      quiet, categories:[{id,word,count}]}
     layers:pins     {layer, count}
     layers:predict  {layer, choice, majority}
   URL
     `layer=` is the shell's own key (ARCHITECTURE §8) and carries the active
     layer, so `#year=1913&layer=mechanism` is a page number. Two further
     states round-trip through the documented free-form `filter` key:
     `filter=pressure:off` pins the informal haze off, `filter=pressure:on`
     pins it on. Nothing else of this piece's is in the address bar, because
     nothing else of this piece's is a place a teacher would send someone to.
   ========================================================================== */

import { el, disposer, announce, on as onEvt } from '../core/util.js';
import { LAYERS, byId, NOT_BUILT, FAMINE_CATEGORIES, RUN } from './catalog.js';

/* How many readings are registered. Written nowhere as a word: the chooser,
   the control's title and the route's exit all count the registry, so adding
   or removing a layer can never leave a sentence claiming the old number. */
const N_READINGS = LAYERS.length;
import { LAYER_MEANING, LAYER_SHORT } from '../legend/symbology.js';
import { buildIndex, apply, resistUnitsAt, takenFromRecord } from './paint.js';
import { readTokens } from '../map/palette.js';
import { projectPoint } from '../map/projection.js';
import { Overlay } from './overlay.js';
import { buildKeyCard, buildCaption, buildSheet, buildRun } from './panel.js';

const HERE = import.meta.url;
const MAP_LAYERS = new Set(['status', 'control', 'tenure', 'weight']);

/**
 * WHICH READINGS SURVIVE A TWO-UP COMPARISON, AND WHY MOST DO NOT.
 *
 * P18's compare surface draws its own two plates through its own `paintFor`,
 * not through `window.__map.plate.setPaint` — so this piece's re-keying does
 * not reach them. Measured on the round-2 build: with `layer=mechanism` set and
 * compare open at 1914/1922, the masthead chip read "Taken", the address bar
 * read `layer=mechanism`, and both plates painted legal status. That is a
 * re-encoding claimed and not drawn, which is the one thing this piece exists
 * to prevent, and it is also the app's "two teaching panels at once" defect
 * seen from this side.
 *
 * Three readings genuinely survive: `status` is what compare paints anyway,
 * `tenure` is handled inside `compare/split.js` by name, and `control` is the
 * definition, which compare carries per side as `defA`/`defB`. Every other
 * reading stands down while the comparison is open, says so in one line, and
 * is put back the moment the comparison closes.
 */
const SURVIVES_COMPARE = new Set(['status', 'control', 'tenure']);

/** The two-or-three-word form P17's byline prints on a narrow plate. */
const SHORT_FORM = {
  slavery: 'was slavery lawful here this year',
  labour: 'who was moved, and how',
  famine: 'famine, and its dates',
  'taken-from': 'who Britain took it from',
};

export default {
  id: 'layers',
  slot: 'toolbar',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    this.app = document.getElementById('app') || document.querySelector('.app');
    await ctx.util.loadCss(new URL('../../css/layers.css', HERE));

    this.routes = (await ctx.util.getJson(new URL('./routes.json', HERE).href)) || { nodes: [], links: [], sources: {} };
    this.pressure = (await ctx.util.getJson(new URL('./pressure.json', HERE).href)) || { places: [], sources: {}, metric: null };

    /* ONE VOCABULARY, NOT TWO.
       P17 owns the sentence a layer prints, and holds it in LAYER_MEANING. It
       knows the ten layers FEATURE_SPEC §2 P06 lists. This piece registers
       three more — slavery, people moved, famine — which the wave brief asks
       for and the dataset supports, and P17 was correct to print, in front of
       the student, `[layer "slavery" has no definition sentence — it should
       not have registered]`. The fix is not to print a second sentence of our
       own beside its complaint: it is to put the sentence where the app already
       looks for it. Nothing is overwritten — a layer P17 already knows keeps
       P17's words — and no file outside this directory is edited. If P17 later
       adds these three, every line below becomes a no-op.  */
    for (const l of LAYERS) {
      if (!LAYER_MEANING[l.id]) LAYER_MEANING[l.id] = l.sentence;
      if (!LAYER_SHORT[l.id] && l.short) LAYER_SHORT[l.id] = SHORT_FORM[l.id] || l.short.toLowerCase();
    }

    this.ix = buildIndex(ctx.data);
    this.tokens = readTokens(document.documentElement);
    this.locks = new Map();          // layerId -> why
    this.isolated = null;
    this.predicted = new Set();      // layers whose PREDICT has been answered
    this.answers = new Map();        // layerId -> {choice, label}
    this.sheetOpen = false;
    this.pinIndex = 0;
    this.lastTally = null;
    this.runI = null;                // null = not on the route; 0..3 = the step
    this.runDone = false;
    this.runSeen = false;            // has this reader ever been offered it?
    this.compareOpen = false;
    this.beat = null;                // the guided path's current beat, if any
    this.stoodDownFrom = null;       // the reading compare made us put back
    this._echoT = null;              // the commitment echo's stand-down timer
    this._echoLayer = null;          // the reading that echo belongs to

    this.wide = window.matchMedia('(min-width: 88rem)');
    this._buildBar(ctx.root);
    this._buildOverlay();
    this._wire();

    // The map publishes its renderer during its own mount and we mount after
    // it, so this is normally instant; the retry is for a map that is slow or
    // absent, in which case this piece degrades to the chooser and the sheet
    // and never throws.
    this._attach();
    if (!this.plate) {
      this.d(ctx.bus.on('map:ready', () => this._attach()));
      const t = setTimeout(() => this._attach(), 400);
      this.d(() => clearTimeout(t));
    }

    ctx.bus.emit('layers:ready', {
      layers: LAYERS.map((l) => ({
        id: l.id, label: l.label, sentence: l.sentence, byline: l.byline,
        caption: l.caption, group: l.group, paints: l.paints,
      })),
      notBuilt: NOT_BUILT.map((n) => ({ id: n.id, label: n.label, why: n.why })),
    });
    this._render();
  },

  /* =============================================================== attach == */

  /**
   * Wrap two methods on P02's renderer, and only two. `setPaint` is where a
   * re-encoding belongs; `draw` is the only reliable signal that the camera
   * moved, because a pan and a zoom change no state this module can watch.
   * Both are restored in destroy().
   */
  _attach() {
    if (this.plate) return;
    const api = window.__map;
    if (!api || !api.plate) return;
    this.mapApi = api;
    this.plate = api.plate;

    const self = this;
    this._origSetPaint = this.plate.setPaint;
    this.plate.setPaint = function (table) {
      self.rawPaint = table;
      try { self._decorate(table); } catch (err) { console.warn('layers: paint pass failed', err); }
      return self._origSetPaint.call(this, table);
    };
    this._origDraw = this.plate.draw;
    this.plate.draw = function () {
      const out = self._origDraw.apply(this, arguments);
      self._overlaySoon();
      return out;
    };
    this._attachDescribe();
    this._repaint();
    /* A COLD DEEP LINK IS NOT A LAYER CHANGE.
       `#year=1913&layer=system` arrives through `hydrate`, which sets the store
       before this module is listening, so the subscriber that normally hands
       the stitching to P02 never fires. A teacher's link is a page number
       (ARCHITECTURE §8): it has to mean the same thing on a cold load as it
       does pasted into an open tab. Measured before this: the link restored
       `layer=system`, drew the network, and left the plate un-stitched. */
    const id = this._layerId();
    if (id !== 'status') { this._handover(id, null); this._say(); }
  },

  /**
   * THE PLATE'S ACCESSIBLE NAMES HAVE TO SAY WHAT THE PLATE IS DRAWING.
   *
   * P02 names every one of its ~250 focusable map targets with `_describe`:
   * "Bengal. Crown colony. Control degree 5 of 5. held since 1757." That is
   * the LEGAL-STATUS reading, and it is the right name while the legal-status
   * plate is painting. While one of this piece's readings is painting it is
   * the wrong one twice over. A sighted reader sees Punjab go madder and reads
   * "a regional state, or its ruler" off the key; a screen-reader user hears
   * the same sentence they heard on the previous plate, and the re-encoding —
   * the entire content of this piece — is invisible to them. Worse, P02's name
   * for an `absence` record reads "no cited figure for the measure now sizing
   * the map", which is true of ITS absence (weight mode) and false of ours:
   * ours means the record answers nothing this reading asks.
   *
   * So the name is extended, by the same wrapping this file already uses for
   * `setPaint` and `draw`, from the module P02 publishes at `window.__map`.
   * Nothing in app/js/map/ is edited; it is restored in destroy(); and it adds
   * nothing at all while the active reading is one of P02's own.
   */
  _attachDescribe() {
    const mod = this.mapApi && this.mapApi.module;
    if (!mod || typeof mod._describe !== 'function' || this._origDescribe) return;
    const self = this;
    this._origDescribe = mod._describe;
    this._describeHost = mod;
    mod._describe = function (uid, rec) {
      let out = self._origDescribe.call(this, uid, rec);
      try { out = self._nameFor(out, rec); } catch (err) { /* a name is never worth a crash */ }
      return out;
    };
  },

  /** What this piece adds to one unit's accessible name. */
  _nameFor(base, rec) {
    const l = this._layer();
    if (!rec || MAP_LAYERS.has(l.id)) return base;
    let out = base;
    if (rec.layerAbsence) {
      /* Correct P02's one clause about absence rather than contradicting it in
         a second sentence. Narrow, and a no-op the moment that string moves. */
      out = out.replace('no cited figure for the measure now sizing the map', rec.layerAbsence);
      return out + ' Drawn now by ' + l.label + '.';
    }
    if (!rec.layerWord && !rec.label) return out;
    return out + ' Drawn now by ' + l.label + ': ' + (rec.label || rec.layerWord) + '.';
  },

  _detach() {
    if (this._describeHost && this._origDescribe) {
      this._describeHost._describe = this._origDescribe;
      this._origDescribe = null; this._describeHost = null;
    }
    if (!this.plate) return;
    if (this._origSetPaint) this.plate.setPaint = this._origSetPaint;
    if (this._origDraw) this.plate.draw = this._origDraw;
    this.plate = null;
  },

  /* ================================================================ state == */

  _layerId() {
    const id = (this.ctx.store.getState().activeLayer) || 'status';
    return byId.has(id) ? id : 'status';
  },
  _layer() { return byId.get(this._layerId()); },
  _stage() { return (this.app && this.app.dataset.stage) || 'plate'; },
  _year() { return this.ctx.store.getState().year; },

  /**
   * Is the informal pressure haze drawn right now?
   *
   * FEATURE_SPEC §1 charge 5 asks for it "on by default from 1830 to 1914",
   * and two rules bound that default.
   *  · Not at `data-stage="plate"`. LAYOUT_BUDGET §3 fixes second zero at
   *    nineteen controls and 179 words and is binding over this file; the haze
   *    arrives the moment the reader touches the atlas, which is also the
   *    moment an argument about what "British" means can mean anything.
   *  · Not on top of a layer that is already making its own argument. A haze
   *    over the acquisition-mechanism plate is two claims in one picture. It
   *    rides on the readings of legal status, control, tenure and weight, and
   *    on its own layer, and nowhere else — unless a teacher pins it with
   *    `filter=pressure:on`, which overrides everything here.
   */
  _pressureOn() {
    const f = this.ctx.store.getState().filters || {};
    if (f.pressure === 'off') return false;
    if (f.pressure === 'on') return true;
    const id = this._layerId();
    if (id === 'informal') return true;
    if (!MAP_LAYERS.has(id)) return false;
    if (this._stage() === 'plate') return false;
    /* ON A GUIDED BEAT, ONLY WHERE THE BEAT NAMES IT.
       Round 3's verdict: "the informal-empire layer is switched on during
       guided beats where it is not the payload — it is on at beat 14, the
       self-government two-track — adding a second argument to a beat that is
       supposed to carry one." Measured on the running build: the path's
       princely (1909), Egypt (1882) and two-track (1913) beats all sit inside
       the 1830-1914 default, all paint legal status, and all three arrived
       with £320m of British capital hazing over Argentina.
       DIDACTIC_SPEC §3's rule for the tours agent is one T-number per beat,
       and this piece is not entitled to add a second. So while a beat is on
       screen the default stands down, and the haze appears only where the beat
       asked for it — by naming the layer (`ask:layer informal`) or by pinning
       it (`ask:pressure`, `filter=pressure:on`), both of which are answered
       above this line. Off the path — free exploration, a deep link, the run —
       FEATURE_SPEC §1 charge 5's 1830-1914 default is untouched. */
    if (this._onPath()) return false;
    const l = byId.get('informal');
    const y = this._year();
    return y >= l.autoYears[0] && y <= l.autoYears[1];
  },

  /** Is a guided beat on screen right now? Free exploration is not a beat. */
  _onPath() {
    if (!this.ctx.store.getState().activeTour) return false;
    return !(this.beat && this.beat.exploring);
  },

  _pinsFor() {
    const id = this._layerId();
    if (this.locks.has('resistance')) return 'resistance';
    const l = byId.get(id);
    return (l && l.pins) || null;
  },

  /* ================================================================ paint == */

  /** Re-key the plate's own paint table for the active layer. */
  _decorate(table) {
    const id = this._layerId();
    if (MAP_LAYERS.has(id)) { this.lastTally = null; return; }
    const year = this._year();
    if (id === 'resistance') this.ix.resistUnits = resistUnitsAt(this.ix, year);
    this.tokens = readTokens(document.documentElement);
    const tally = apply(table, { layerId: id, year, ix: this.ix, tokens: this.tokens });
    if (this.isolated) {
      const keep = new Set(tally.members.get(this.isolated) || []);
      for (const [uid, rec] of table) if (!keep.has(uid)) rec.dim = true;
    }
    this.lastTally = tally;
    /* THE KEY IS DRAWN FROM THE TALLY, SO IT HAS TO BE REDRAWN WHEN THE TALLY
       ARRIVES — WHICH IS NOT ALWAYS WHEN THE READER ACTS.
       Measured on a cold `#year=1826&layer=taken-from`, at 1366x768: the plate
       came up fully painted in eight colours and the key card beside it read
       "nothing to draw at 1826 — a real result, not a loading state", with
       "9 more categories are not on the plate at 1826" under it. On a cold
       load this module attaches before P02 has called `setPaint` even once, so
       `_repaint` returns early, the tally is null, the disclosure change that
       follows renders a key of nothing — and P02's first paint then fills the
       tally in without anybody redrawing the card. The key was not stale by a
       frame; it was stale for the session, and it was calling a full plate
       empty. The acceptance test asked whether the card EXISTED and it did.
       A signature so an unchanged tally costs one string compare, not a DOM
       rebuild on every scrub. */
    const sig = id + '|' + year + '|' + tally.painted + '|' + tally.absent + '|' + tally.quiet;
    if (sig !== this._tallySig) { this._tallySig = sig; this._renderSoon(); }
  },

  /** One render per frame, whoever asked and however many times. */
  _renderSoon() {
    if (this._renderPending) return;
    this._renderPending = true;
    requestAnimationFrame(() => {
      this._renderPending = false;
      if (this.bar && this.bar.isConnected) this._render();
    });
  },

  /** Ask the plate to recompute and redraw with this layer's opinion applied. */
  _repaint() {
    if (!this.plate || !this.rawPaint) return;
    try {
      this._decorate(this.rawPaint);
      this._origSetPaint.call(this.plate, this.rawPaint);
      this._origDraw.call(this.plate);
      /* The accessible names are written in P02's own `_syncOptions`, which a
         repaint driven from here does not reach. Without this the canvas
         changed colour and ~250 aria-labels kept describing the previous
         reading — the exact split this piece exists to close, on the one
         reader who cannot see the colour change. It is P02's own published
         throttle, so this costs one timer, not a relayout. */
      const mod = this.mapApi && this.mapApi.module;
      if (mod && typeof mod._syncOptionsSoon === 'function') mod._syncOptionsSoon();
    } catch (err) { console.warn('layers: repaint failed', err); }
  },

  /* ============================================================== overlay == */

  _buildOverlay() {
    this.host = document.querySelector('[data-mount="map-overlay"]');
    if (!this.host) return;
    this.wrap = el('div.ly-layer', { 'data-on': 'no' });
    this.host.appendChild(this.wrap);
    this.over = new Overlay(this.wrap, {
      format: this.ctx.format,
      onActivate: (p) => this._activate(p),
    });
    /* ONE STACK, IN ONE CORNER, ABOVE WHATEVER P02 IS ALREADY STANDING ON.
       The plate's bottom-left already carries the definition dial. Its exact
       height is not this module's business to know, so it is measured from
       P02's own published obstacle list every time we draw. */
    this.stack = el('div.ly-stack');
    this.keyHost = el('div.ly-keyhost');
    this.capHost = el('div.ly-caphost');
    this.stack.append(this.keyHost, this.capHost);
    this.wrap.append(this.stack);
  },

  /**
   * Six modules render into `map-overlay` and at least one of them replaces
   * that slot's children wholesale on its own mount, which silently deleted
   * this piece's entire surface between mount and first paint. Nobody owns
   * that slot, so the only correct behaviour is to be a good tenant and check
   * that we are still in the room. Measured: one `isConnected` read per frame.
   */
  _ensureHost() {
    if (!this.host || !this.wrap) return;
    if (!this.wrap.isConnected) this.host.appendChild(this.wrap);
  },

  _overlaySoon() {
    if (this._pending) return;
    this._pending = true;
    requestAnimationFrame(() => { this._pending = false; this._drawOverlay(); });
  },

  /**
   * How much of the plate's bottom-left corner P02 is already using, in CSS
   * pixels, read from its own `obstacles()` report rather than from a guess
   * about its DOM. Our own furniture can never appear in that list, because
   * the overlay slot's one child is `pointer-events: none` and P02 skips
   * those — so this cannot feed back on itself.
   */
  _floor() {
    if (!this.mapApi || !this.mapApi.obstacles || !this.plate) return 8;
    let floor = 8;
    try {
      for (const o of this.mapApi.obstacles() || []) {
        if (o.x > this.plate.w * 0.6) continue;              // not our corner
        if (o.y < this.plate.h * 0.55) continue;             // not in the foot
        floor = Math.max(floor, this.plate.h - o.y + 6);
      }
    } catch (err) { /* an unmeasured floor is 8px, never a crash */ }
    /* Measured at 1024x640 with the apparatus column open: P02 stacks the dial
       and the mode row up the left flank, and an uncapped floor lifted this
       piece's whole stack to the TOP of the plate, over Nova Scotia. A key
       belongs at the foot of a plate or nowhere; past this cap it stays at the
       foot and simply overlaps a control, which is the smaller wrong. */
    return Math.min(floor, this.plate.h * 0.45);
  },

  /**
   * The plate's own measurements, published to CSS.
   *
   * WHY THE CARD IS SIZED AGAINST THE PLATE AND NOT THE VIEWPORT. Round 2 sized
   * the stack `min(15.5rem, 40vw)`, which is a guess about the plate made from
   * the window. Measured at 900x700 with the rail open: the plate is 596x410
   * and a 248px card took 42% of its width — the whole Atlantic — while 40vw
   * said 360 and never bit. The plate publishes its real rectangle here every
   * time it is drawn, so the key is a share of the map it is a key TO.
   */
  _publishPlate() {
    if (!this.wrap) return;
    this.wrap.style.setProperty('--ly-floor', this._floor() + 'px');
    if (!this.plate) return;
    this.wrap.style.setProperty('--ly-plate-w', this.plate.w + 'px');
    this.wrap.style.setProperty('--ly-plate-h', this.plate.h + 'px');
  },

  _at(unitId) {
    if (!this.plate) return null;
    const s = this.plate.unitScreen(unitId);
    if (!s) return null;
    const x = s.tiny ? s.mx : s.px;
    const y = s.tiny ? s.my : s.py;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    if (x < -80 || y < -80 || x > this.plate.w + 80 || y > this.plate.h + 80) return null;
    return { x, y };
  },

  _drawOverlay() {
    if (!this.over || !this.plate) return;
    this._ensureHost();
    /* The floor is republished on EVERY draw, including the draws where this
       piece has no marks to make. Round 2 set it inside the early return, so a
       fill layer — which draws no marks at all — kept whatever floor happened
       to be measured before P02's furniture had been laid out, and on a phone
       the key card sat on the definition dial. */
    this._publishPlate();
    const kind = this._pinsFor();
    const haze = this._pressureOn();
    const anything = !!kind || haze;
    this.wrap.dataset.on = anything ? 'yes' : 'no';
    this.over.clear();
    if (!anything) return;

    // Overlay pixels must be plate pixels. Enlarged, P02 re-parents the plate
    // out of this slot, so measure both and translate rather than assume.
    const cRect = this.plate.canvas.getBoundingClientRect();
    const hRect = this.host.getBoundingClientRect();
    this.over.fit({ w: cRect.width, h: cRect.height }, { x: cRect.left - hRect.left, y: cRect.top - hRect.top });

    const year = this._year();
    if (haze) this._drawPressure();
    if (kind === 'resistance') this._drawResistance(year);
    if (kind === 'famine') this._drawFamine(year);
    if (kind === 'system') this._drawSystem(year);
    this.over.restoreFocus(this.pinIndex);
  },

  /**
   * A place is in the sphere in the year on the clock, or it is not drawn.
   *
   * Round 2 drew all fourteen at every year, so at 1650 there were rings over
   * Qatar and the Trucial States two and a half centuries before the treaties
   * that put them there. The gate is `statusAt(year)`, not the plate's own
   * paint table: under the "claimed" definition the plate draws none of these
   * at all — `controlDegree` is 0 — and that invisibility is the whole reason
   * FEATURE_SPEC charge 5 exists. The haze is what makes the sphere visible on
   * a map that has no way to hold it.
   */
  _pressurePlaces() {
    const st = this.ctx.data.statusAt(this._year());
    const out = [];
    for (const p of this.pressure.places || []) {
      const e = st.get(p.unitId);
      if (!e || e.status !== 'informal-sphere') continue;
      out.push({ ...p, at: this._at(p.unitId) });
    }
    return out;
  },

  _drawPressure() {
    const places = this._pressurePlaces();
    let max = 0;
    for (const p of this.pressure.places || []) if (p.value != null && p.value > max) max = p.value;
    this.over.drawPressure(places, { maxValue: max || 1, showValues: this._stage() !== 'plate' });
    this.lastPressure = {
      withFigure: places.filter((p) => p.value != null).length,
      without: places.filter((p) => p.value == null).length,
    };
    this.ctx.bus.emit('layers:pins', { layer: 'informal', count: places.filter((p) => p.at).length });
  },

  _drawResistance(year) {
    const pins = [];
    const { format } = this.ctx;
    for (const e of this.ix.revoltEvents) {
      if (!Number.isFinite(e.year) || e.year > year) continue;
      for (const pt of this._pointsOf(e)) {
        pins.push({
          kind: e.kind, at: pt, event: e, recent: year - e.year <= 25,
          label: `${e.title}, ${format.year(e.year)}. ${this._toll(e)}`,
        });
      }
    }
    this.over.drawPins(pins);
    this.ctx.bus.emit('layers:pins', { layer: 'resistance', count: pins.length });
  },

  _drawFamine(year) {
    const pins = [];
    const { format } = this.ctx;
    for (const e of this.ix.famineEvents) {
      if (!Number.isFinite(e.year) || e.year > year) continue;
      for (const pt of this._pointsOf(e)) {
        pins.push({
          kind: 'famine', at: pt, event: e, recent: year - e.year <= 25,
          label: `${e.title}, ${format.year(e.year)}. ${this._toll(e)}`,
        });
      }
    }
    this.over.drawPins(pins);
    this.ctx.bus.emit('layers:pins', { layer: 'famine', count: pins.length });
  },

  _drawSystem(year) {
    const nodes = [];
    const seen = new Map();
    for (const n of this.routes.nodes || []) {
      if (n.fromYear > year) continue;
      if (n.toYear != null && n.toYear < year) continue;
      const at = this._at(n.unitId);
      seen.set(n.unitId, { ...n, at });
      nodes.push(seen.get(n.unitId));
    }
    const links = [];
    for (const l of this.routes.links || []) {
      if (l.fromYear > year) continue;
      if (l.toYear != null && l.toYear < year) continue;
      const a = seen.get(l.a) || { at: this._at(l.a) };
      const b = seen.get(l.b) || { at: this._at(l.b) };
      links.push({
        ...l, a, b,
        aName: (seen.get(l.a) && seen.get(l.a).name) || l.a,
        bName: (seen.get(l.b) && seen.get(l.b).name) || l.b,
      });
    }
    const cam = this.plate.camera ? this.plate.camera() : null;
    const worldW = cam ? cam.worldW / (this.plate.dpr || 1) : 0;
    this.over.drawNetwork(links, nodes, { worldW });
    this.ctx.bus.emit('layers:pins', { layer: 'system', count: nodes.filter((n) => n.at).length, links: links.length });
  },

  /** Where an event happened: its own coordinates first, its units second. */
  _pointsOf(e) {
    const out = [];
    const places = (e.links && e.links.places) || [];
    for (const p of places) {
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lon)) continue;
      const w = this._world(p.lon, p.lat);
      if (w) out.push(w);
    }
    if (out.length) return out.slice(0, 2);
    for (const u of (e.links && e.links.units) || []) {
      const at = this._at(u);
      if (at) { out.push(at); break; }
    }
    return out;
  },

  /**
   * A longitude and a latitude, put on the plate through P02's own projection.
   * No projection maths lives in this module: `plate.toScreen` takes world
   * coordinates, and the world coordinates come from the same projection the
   * plate is drawing with.
   */
  _world(lon, lat) {
    try {
      const id = (this.plate.t >= 0.5 ? this.plate.projTo : this.plate.projFrom) || 'equal-earth';
      const p = projectPoint(lon, lat, id);
      const s = this.plate.toScreen(p[0], p[1]);
      if (!Number.isFinite(s[0]) || !Number.isFinite(s[1])) return null;
      if (s[0] < -40 || s[1] < -40 || s[0] > this.plate.w + 40 || s[1] > this.plate.h + 40) return null;
      return { x: s[0], y: s[1] };
    } catch (err) { /* fall through to the unit anchor */ }
    return null;
  },

  _toll(e) {
    const t = e.toll;
    const { format } = this.ctx;
    if (!t) return 'This atlas records no count.';
    const lo = Number(t.deathsLow), hi = Number(t.deathsHigh);
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi !== lo) {
      return `Between ${format.number(lo)} and ${format.number(hi)} dead, on the counts this atlas holds.`;
    }
    if (Number.isFinite(lo)) return `${format.number(lo)} dead, on the count this atlas holds.`;
    return t.note ? String(t.note).slice(0, 160) : 'No one counted.';
  },

  _activate(p) {
    const { store, bus } = this.ctx;
    if (p.kind === 'pin' && p.pin.event) {
      const e = p.pin.event;
      if (Number.isFinite(e.year)) store.dispatch('setYear', e.year);
      const tid = (e.links && e.links.territories && e.links.territories[0]) || null;
      if (tid && this.ctx.data.byId.has(tid)) store.dispatch('select', tid);
      bus.emit('ask:say', {
        id: 'layers:pin', priority: 58, mark: this.ctx.format.year(e.year),
        text: `<strong>${escape_(e.title)}.</strong> ${escape_(String(e.summary || '').slice(0, 190))}`,
      });
      announce(`${e.title}, ${e.year}.`);
      return;
    }
    if (p.kind === 'node' && p.node) {
      bus.emit('ask:say', {
        id: 'layers:pin', priority: 58, mark: String(p.node.fromYear),
        text: `<strong>${escape_(p.node.name)}</strong> — ${escape_(p.node.role)}. ${escape_(p.node.note || '')}`,
      });
      announce(p.node.name + ', ' + p.node.role + '.');
      return;
    }
    if (p.kind === 'pressure' && p.place) {
      const q = p.place.value != null
        ? `<strong>${escape_(p.place.name)}.</strong> About <strong>£${p.place.value} million</strong> of British capital in 1913, and not one acre of British territory.`
        : `<strong>${escape_(p.place.name)}.</strong> ${escape_(p.place.why || '')}`;
      bus.emit('ask:say', { id: 'layers:pin', priority: 58, mark: 'Informal empire', text: q });
      announce(p.place.name + '. ' + (p.place.value != null ? '£' + p.place.value + ' million.' : 'No figure.'));
    }
  },

  /* ================================================================== key == */

  _keyRows() {
    const l = this._layer();
    const t = this.lastTally;
    const n = (id) => (t && t.counts.get(id)) || 0;
    if (l.id === 'informal') {
      const live = this._pressurePlaces();
      // Nothing in the sphere in this year is a real answer, and the empty key
      // says so in words rather than printing two zeroes.
      if (!live.length) return [];
      const withFig = live.filter((p) => p.value != null).length;
      const without = live.length - withFig;
      return [
        { id: 'figure', mark: 'haze', word: 'haze ⌀ = £m invested, 1913', count: withFig, gloss: this.pressure.metric ? this.pressure.metric.how : '' },
        { id: 'nofigure', mark: 'ring', word: 'in the sphere, no figure held', count: without, gloss: 'A broken ring, never a haze. A radius nobody can source is a claim, not a measurement.' },
      ];
    }
    if (l.id === 'system') {
      const y = this._year();
      const nodes = (this.routes.nodes || []).filter((x) => x.fromYear <= y && (x.toYear == null || x.toYear >= y));
      const links = (this.routes.links || []).filter((x) => x.fromYear <= y && (x.toYear == null || x.toYear >= y));
      const roles = new Map();
      for (const x of nodes) roles.set(x.role, (roles.get(x.role) || 0) + 1);
      const SHAPE = { 'metropole': 'square', 'naval base': 'square', 'coaling station': 'dot', 'cable station': 'diamond', 'chokepoint': 'bar', 'terminus': 'diamond' };
      const rows = [...roles.entries()].sort((a, b) => b[1] - a[1])
        .map(([role, c]) => ({ id: 'role:' + role, mark: SHAPE[role] || 'dot', word: role, count: c }));
      rows.push({ id: 'cable', mark: 'cable', word: 'cable, dated', count: links.filter((x) => x.kind === 'cable').length, gloss: 'Solid line. Every one carries the year that segment opened and a source.' });
      rows.push({ id: 'route', mark: 'route', word: 'mail and coal route', count: links.filter((x) => x.kind === 'route').length, gloss: 'Broken line. A scheduled steamer route, not a simulation and not a sailing time.' });
      return rows;
    }
    if (l.id === 'resistance') {
      const y = this._year();
      const rev = this.ix.revoltEvents.filter((e) => e.year <= y);
      return [
        { id: 'revolt', mark: 'ring-hot', word: 'a rising, dated', count: rev.filter((e) => e.kind === 'revolt').length, gloss: 'A ring at the place it happened. Counted as events: one rising can carry two pins.' },
        { id: 'massacre', mark: 'x', word: 'a killing by British forces', count: rev.filter((e) => e.kind === 'massacre').length, gloss: 'A cross. Where the count is disputed the pin prints the range.' },
        { id: 'held', mode: 'absence', word: 'nothing recorded here', count: t ? t.quiet : null, gloss: 'Quieted, not removed. This atlas holding no record is not the same as nothing having happened.' },
      ];
    }
    if (l.id === 'famine') {
      const y = this._year();
      const fam = this.ix.famineEvents.filter((e) => e.year <= y);
      return [
        { id: 'famine-policy', key: 'crown-conquered', word: 'famine under British rule, recorded here', count: n('famine-policy'), gloss: FAMINE_CATEGORIES[0].gloss },
        { id: 'famine-event', mark: 'tri', word: 'a dated famine, with its range', count: fam.length, gloss: 'A triangle at the place, opening the year and the range. Nobody counted at the time, so every figure here is a range with a method behind it.' },
      ];
    }
    if (!l.categories) return [];
    return l.categories.map((c) => ({
      id: c.id, key: c.key, mode: c.mode, word: c.word, gloss: c.gloss,
      count: n(c.id),
      members: c.members && c.members.length > 1
        ? c.members.map((m) => ({ id: m, n: this._mechCount(m) })) : null,
      /* The one line under a row that the records write themselves. On the
         acquisition plate it splits the war settlements by who actually lost;
         on the counterparty plate it names the parties on the map right now.
         Both are recomputed at every year, so neither can go stale and neither
         is a list maintained by hand. */
      note: l.id === 'mechanism' && c.id === 'war-spoil' ? this._warSplit() : null,
      names: l.id === 'taken-from' && n(c.id) ? this._partiesIn(c.id) : null,
    }));
  },

  /**
   * THE SENTENCE THAT WOULD HAVE CAUGHT ROUND 3'S DISQUALIFIER, PRINTED UNDER
   * THE ROW THAT CARRIED IT.
   *
   * `war-transfer` is one tag over two different events: a cession between
   * European empires at a peace conference, and a state Britain has just
   * beaten in the field giving up territory. The atlas used to print the first
   * of those over all of them. It now counts them apart from the records'
   * own `counterparties[].kind`, at the year on the clock, and names the
   * parties in the second group. Retag a shard and this line moves with it.
   */
  _warSplit() {
    const y = this._year();
    const { format } = this.ctx;
    let euro = 0; let other = 0;
    const names = new Set();
    for (const [, list] of this.ix.acqByUnit) {
      let last = null;
      for (const a of list) { if (a.year <= y) last = a; else break; }
      if (!last || last.mechanism !== 'war-transfer') continue;
      const cp = last.cp || [];
      if (cp.length && cp.every((c) => c.kind === 'european-power')) { euro++; continue; }
      other++;
      for (const c of cp) if (c.kind && c.kind !== 'european-power') names.add(c.name);
    }
    if (!euro && !other) return null;
    const listed = [...names].slice(0, 4);
    return `Of these at ${format.year(y)}: ${format.number(euro)} where every party the record names is a European power, `
      + `and ${format.number(other)} where it names someone else`
      + (listed.length ? ` — ${listed.join('; ')}${names.size > listed.length ? `, and ${format.number(names.size - listed.length)} more` : ''}` : '')
      + '. One tag, two different events; the map draws one colour and the record tells you which.';
  },

  /** The parties actually on the plate this year, in one category, named. */
  _partiesIn(catId) {
    const y = this._year();
    const names = new Set();
    for (const [uid, list] of this.ix.acqByUnit) {
      if (!this.rawPaint || !this.rawPaint.has(uid)) continue;
      const last = takenFromRecord(list, y);
      const first = last && last.cp && last.cp[0];
      if (!first) continue;
      const kind = first.kind || 'other';
      if (kind !== catId) continue;
      names.add(first.name);
    }
    return [...names].slice(0, 6);
  },

  /**
   * THE ONE CLAIM THIS READING MAKES ABOUT THE WHOLE ATLAS, COMPUTED RATHER
   * THAN WRITTEN DOWN.
   *
   * "Britain took its empire from other Europeans" is the sentence this piece
   * was printing over Tipu Sultan and the Konbaung kingdom in round 3, and it
   * is what a student arrives believing. The honest refutation is not an
   * adjective: it is the count, at every year the atlas can draw, of which
   * kind of party the records name. So it is counted here — once per session,
   * over `bounds.min..bounds.max`, from the same index the plate paints from —
   * and the sentence in the sheet is assembled from the answer. If a shard is
   * retagged tomorrow the span, the share and the verdict all move with it,
   * and no string in this directory has to be edited.
   *
   * Cost: one pass over the acquisitions to build the intervals, then one
   * prefix sum per kind. Measured at about 1 ms; memoised regardless.
   */
  _counterpartyRun() {
    if (this._cpRun !== undefined) return this._cpRun;
    const b = this.ctx.data.bounds || { min: 1600, max: 2000 };
    const from = b.min; const to = b.max; const span = to - from + 1;
    if (!(span > 1)) { this._cpRun = null; return null; }
    const kinds = new Map();          // kind -> Int32Array of deltas
    const total = new Int32Array(span + 1);
    const bump = (arr, a, z) => {
      const i = Math.max(0, a - from);
      const j = Math.min(span, z - from + 1);
      if (j <= i) return;
      arr[i] += 1; arr[j] -= 1;
    };
    /* The intervals are built by asking the SAME function the plate asks, at
       each record's own year — not by walking the raw list — so the counts in
       this block and the colours on the map can never disagree about which
       record answers for a place in a given year. The boundaries are the
       record years, so this is exact and costs one call per record. */
    for (const [, list] of this.ix.acqByUnit) {
      for (let i = 0; i < list.length; i++) {
        const a = takenFromRecord(list, list[i].year);
        const first = a && a.cp && a.cp[0];
        if (!first) continue;
        const kind = first.kind || 'other';
        if (!kinds.has(kind)) kinds.set(kind, new Int32Array(span + 1));
        const z = i + 1 < list.length ? list[i + 1].year - 1 : to;
        bump(kinds.get(kind), list[i].year, z);
        bump(total, list[i].year, z);
      }
    }
    const run = (arr) => { let acc = 0; const out = new Int32Array(span); for (let i = 0; i < span; i++) { acc += arr[i]; out[i] = acc; } return out; };
    const series = new Map(); for (const [k, v] of kinds) series.set(k, run(v));
    const tot = run(total);
    const eu = series.get('european-power') || new Int32Array(span);
    const three = ['regional-state', 'indigenous-polity', 'indigenous-people']
      .map((k) => series.get(k) || new Int32Array(span));
    /* A SHARE OF FOUR PLACES IS NOT A SHARE.
       Measured on the first build of this block: `data.bounds` opens at 1200,
       because Jersey and Guernsey carry a 1204 record, and the answer came
       back "the European share reaches 100%, in 1204" — true, useless, and it
       makes the plate's own argument look false. So every proportion below is
       counted only from the first year this atlas draws at least twenty
       places, and the sheet prints that year and why. The span in which
       European powers lead is NOT gated: it is a fact about which group is
       largest, and one place against none is still a lead. */
    const MIN_PLATE = 20;
    let floorYear = null;
    for (let i = 0; i < span; i++) if (tot[i] >= MIN_PLATE) { floorYear = from + i; break; }
    /* RUNS, NOT A FIRST AND A LAST. The first build reported "the largest
       single group only between 1204 and 1870", which is a minimum and a
       maximum with a century and a half of gap inside it — Jersey in 1204 is
       one European record against none, and the real lead does not begin until
       the 1750s. A span that is not contiguous is not a span. */
    const runs = [];
    let peakPct = 0; let peakYear = null; let peakThree = 0;
    let leadYears = 0; let drawnYears = 0;
    let everMajority = false; let everBeatsThree = false;
    for (let i = 0; i < span; i++) {
      if (!tot[i]) continue;
      let top = null; let topN = -1;
      for (const [k, v] of series) if (v[i] > topN) { topN = v[i]; top = k; }
      /* A tie is not a lead: only a strict maximum counts as "the largest". */
      let ties = 0; for (const [, v] of series) if (v[i] === topN) ties++;
      if (floorYear == null || from + i < floorYear) continue;
      drawnYears++;
      const leads = top === 'european-power' && ties === 1;
      if (leads) {
        leadYears++;
        const lastRun = runs[runs.length - 1];
        if (lastRun && lastRun[1] === from + i - 1) lastRun[1] = from + i;
        else runs.push([from + i, from + i]);
      }
      const t3 = three[0][i] + three[1][i] + three[2][i];
      const pct = (eu[i] / tot[i]) * 100;
      if (peakYear == null || pct > peakPct) { peakPct = pct; peakYear = from + i; peakThree = (t3 / tot[i]) * 100; }
      if (eu[i] * 2 > tot[i]) everMajority = true;
      if (eu[i] > t3) everBeatsThree = true;
    }
    const longest = runs.slice().sort((a, z) => (z[1] - z[0]) - (a[1] - a[0]))[0] || null;
    this._cpRun = {
      from, to, floorYear, minPlate: MIN_PLATE,
      span: longest, runs: runs.length, leadYears, drawnYears,
      peakPct: Math.round(peakPct), peakYear,
      threePctAt: Math.round(peakThree),
      everMajority, everBeatsThree,
    };
    return this._cpRun;
  },

  _mechCount(mechanism) {
    const y = this._year();
    let n = 0;
    for (const [, list] of this.ix.acqByUnit) {
      let last = null;
      for (const a of list) { if (a.year <= y) last = a; else break; }
      if (last && last.mechanism === mechanism) n++;
    }
    return n;
  },

  /* ================================================================= bar === */

  _buildBar(root) {
    this.bar = el('div.ly-bar', { role: 'group', 'aria-label': 'Ways to draw this map' });
    this.open = el('button.cx-more.ly-bar__open', {
      type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false',
      'aria-label': 'Draw this map another way',
      title: N_READINGS + ' readings of the same territories and the same year (C)',
    });
    /* Two labels, one control. The masthead on a phone is 86 pixels wide and
       "Draw this another way" ran straight through the search and the teaching
       desk. The long label is the one that teaches; the short one is the one
       that fits. CSS picks, so there is no width listener. */
    /* ONE LABEL ELEMENT, WRITTEN IN JS, NOT TWO TOGGLED BY A MEDIA QUERY.
       Round 2 shipped a long span and a short span and hid one of them with
       `@media … { display: none }`. Measured after the shell added its masthead
       overflow drawer: at 390 the drawer re-parents this control into
       `.mount--sub`, whose own rules set `display` on the descendants it lays
       out, and the button read "Draw this another wayLayers". A label that
       depends on another stylesheet not touching `display` is a label waiting
       to say two things at once. */
    this.label = el('span.ly-bar__label', { text: 'Layers' });
    this.open.append(this.label);
    this.open.addEventListener('click', () => this._toggleSheet());
    this.back = el('button.ly-bar__back', {
      type: 'button', hidden: true, title: 'Back to the legal-status plate',
      'aria-label': 'Back to the legal-status plate',
    }, '×');
    this.back.addEventListener('click', () => this.setLayer('status'));
    /* ONE CONTROL, NOT THREE. Round 2 put a separate TAKEN state chip beside
       the button and the ×, three items in a masthead the round-2 critic found
       clipping 'Taken → left' mid-word at 1366 with no scroll and no collapse.
       The state belongs ON the control it is the state of. */
    this.bar.append(this.open, this.back);
    root.appendChild(this.bar);
  },

  /* ================================================================ sheet == */

  /* THE CONTROL OPENS THE ROUTE, NOT THE MENU — the first time, and every time
     after that until the reader has either finished it or stepped off it. */
  _toggleSheet() {
    if (this.sheetOpen) { this.ctx.bus.emit('ask:sheet', null); return; }
    if (!this.runSeen && !this.runDone) { this._runTo(0); return; }
    this._openSheet();
  },

  /* ================================================================== run == */

  /**
   * FIVE WAYS TO BE WRONG ABOUT THIS MAP. See the RUN comment in catalog.js
   * for why a chooser of twelve was replaced, as the first thing a reader
   * meets, by a route of four with a question in each.
   *
   * `_runTo` is the only entry: it sets the step, paints the step's layer
   * WITHOUT the standalone commit gate (the gate is inside the panel, where the
   * reader can also see where they are in the route), and renders the sheet.
   */
  _runTo(i) {
    if (i < 0 || i >= RUN.steps.length) return;
    this.runSeen = true;
    this.runI = i;
    const step = RUN.steps[i];
    /* The layer is set first and the panel is drawn after, so a reader who has
       already committed on this step arrives to a plate that is already
       painted rather than to a question they have answered. */
    this.setLayer(step.layer, { from: 'run', skipPredict: true });
    this._openSheet();
  },

  _runLeave(how) {
    this.runI = null;
    if (how === 'close') this.runDone = true;
    this._openSheet();
  },

  _runCommit(choiceId, label) {
    const step = RUN.steps[this.runI];
    const l = byId.get(step.layer);
    this.predicted.add(l.id);
    this.answers.set(l.id, { choice: choiceId, label });
    this.predictAnswer = { layer: l.id, choice: choiceId, label };
    this.ctx.bus.emit('layers:predict', { layer: l.id, choice: choiceId, majority: l.id === 'exit' ? 'negotiated-independence' : null });
    /* THE COUNTER-LINE IS NOT PRINTED TWICE, AND THE BAND GETS THE HALF THAT
       FITS IT. Measured at 1440x900 dark: the band read "Count them on the key
       — and notice that the counts move as you scrub, so "most" has no…" — a
       310-character argument cut mid-sentence at 19px, while the same
       paragraph stood complete and unclipped in the rail 300 pixels away. The
       band records the COMMITMENT, which is short and is the thing the reader
       wants to see held against the evidence; the argument stays where it has
       room to be read. */
    this._echo(label);
    this._openSheet();
  },

  _runNode() {
    return buildRun({
      i: this.runI,
      answered: this.answers.get(RUN.steps[this.runI].layer) || null,
      onCommit: (id, label) => this._runCommit(id, label),
      onStep: (i) => this._runTo(i),
      onLeave: (how) => this._runLeave(how),
      onCta: (step) => {
        if (!step.cta) return;
        this.ctx.bus.emit(step.cta.emit, step.cta.payload || {});
        this.ctx.bus.emit('ask:stage', { level: 'working' });
        announce('The definition is now “influenced”. The year has not moved.');
      },
    });
  },

  _openSheet() {
    const { bus } = this.ctx;
    /* ONE TEACHING PANEL AT A TIME (LAYOUT_BUDGET §3 level 3, and the round-2
       verdict on the whole app). Opening this one closes the comparison rather
       than sitting beside it asserting a second year. */
    if (this.compareOpen) bus.emit('compare:close', {});
    if (this.runI != null) {
      bus.emit('ask:sheet', {
        id: 'layers:key', eyebrow: 'Thematic layers', title: RUN.title, node: this._runNode(),
      });
      return;
    }
    const l = this._layer();
    const sources = [];
    if (l.id === 'informal') for (const k in (this.pressure.sources || {})) sources.push(this.pressure.sources[k]);
    if (l.id === 'system') for (const k in (this.routes.sources || {})) sources.push(this.routes.sources[k]);
    const extras = [];
    if (l.id === 'informal' && this.pressure.metric) {
      extras.push({
        head: 'The quantity the haze encodes',
        paras: [
          this.pressure.metric.label + ' — ' + this.pressure.metric.unit + '. ' + this.pressure.metric.how,
          'What it cannot tell you: ' + this.pressure.metric.cannotTellYou,
          'Area is proportional to the figure, so the radius is its square root. '
            /* COUNTED, NOT WRITTEN DOWN. Round 2 wrote "two carry a figure and
               eleven do not" into this string. pressure.json holds fourteen
               places and two figures, so the second number had been wrong on
               screen since the day a fourteenth place was added — in a panel
               whose whole subject is that a radius nobody can source is a lie.
               It is counted from the file now. */
            + `${this.ctx.format.number((this.pressure.places || []).filter((x) => x.value != null).length)} of these places carry a figure this atlas is willing to draw, and `
            + `${this.ctx.format.number((this.pressure.places || []).filter((x) => x.value == null).length)} do not. `
            + 'That is the finding, not the failure: informal empire is easiest to see exactly where the money was counted, '
            + 'and Britain’s grip on the Gulf, on Persia and on Siam was not made of money.',
        ],
        figures: (this.pressure.places || []).filter((p) => p.value != null)
          .map((p) => ({ v: '£' + p.value + 'm', l: p.name + ', 1913' })),
      });
    }
    if (l.id === 'taken-from') {
      const c = this._counterpartyRun();
      if (c) {
        extras.push({
          head: 'Counted across every year this atlas draws',
          paras: [
            c.span
              ? `“Another European power” is the largest single group on this plate in ${this.ctx.format.number(c.leadYears)} of the `
                + `${this.ctx.format.number(c.drawnYears)} years this atlas draws — the longest unbroken run is ${c.span[0]} to ${c.span[1]}, `
                + 'which is the Caribbean and Indian Ocean islands changing hands at Paris, Amiens and Vienna, and Quebec with them. '
                + 'Before that run and after it, the largest group is a state or a people Britain took ground from directly.'
              : '“Another European power” is not the largest single group on this plate at any year in this atlas.',
            `Its highest share of the plate at any year is ${c.peakPct}%, in ${c.peakYear}. `
              + (c.everMajority ? 'It does reach a majority.' : 'It never reaches a majority.')
              + ' And at '
              + (c.everBeatsThree ? 'some years it outnumbers' : 'no year does it outnumber')
              + ' the three kinds that name a state or a people Britain took ground from directly — a regional state or its ruler, '
              + 'an Indigenous state or confederacy, and people already living there — counted together.',
            `The shares are counted from ${c.floorYear} on, the first year this atlas draws ${c.minPlate} places. `
              + `Before that the plate is a handful of Channel Islands and a percentage of it would mean nothing: this atlas's `
              + `earliest record is ${c.from}, and in that year the European share is 100% of two units.`,
            'Every figure in this block is counted from the records at run time, over every year this atlas holds. '
              + 'Nothing here is stored, and retagging a shard moves all of it.',
          ],
          figures: [
            { v: c.peakPct + '%', l: 'the European share at its highest, ' + c.peakYear },
            { v: c.threePctAt + '%', l: 'the other three together, same year' },
          ],
        });
      }
    }
    if (l.id === 'slavery') {
      extras.push({
        head: 'The three dates, and the two figures',
        paras: [
          'The Slave Trade Act of 1807 ended British trafficking. The Slavery Abolition Act of 1833 took effect on 1 August 1834. '
            + '"Apprenticeship" — unpaid work for the former owner — ran until 1 August 1838.',
          'Compensation was paid to the owners, not to the people they had held. Twenty million pounds, about forty per cent of annual Treasury spending, '
            + 'raised as a loan that the Treasury finished repaying in 2015.',
        ],
        figures: [
          { v: '£20,000,000', l: 'paid to slave-owners' },
          { v: '£0', l: 'paid to the people freed' },
        ],
      });
    }
    const node = buildSheet({
      activeId: l.id, rows: this._keyRows(), counts: this.lastTally,
      format: this.ctx.format, year: this._year(),
      onPick: (id) => this.setLayer(id),
      onIsolate: (cat) => this._isolate(cat),
      isolated: this.isolated,
      locks: this.locks,
      predictAnswer: this.predictAnswer && this.predictAnswer.layer === l.id ? this.predictAnswer : null,
      predictAfter: l.predict ? l.predict.after : null,
      mechanismMembers: l.id === 'mechanism',
      sources, extras,
      runDone: this.runDone,
      onRun: () => this._runTo(0),
    });
    bus.emit('ask:sheet', {
      id: 'layers:key', eyebrow: 'Thematic layers', title: 'Ways to draw this map', node,
    });
  },

  _isolate(catId) {
    this.isolated = this.isolated === catId ? null : catId;
    this._repaint();
    if (this.sheetOpen) this._openSheet();
    const rows = this._keyRows();
    const row = rows.find((r) => r.id === this.isolated);
    announce(this.isolated && row
      ? `Showing only ${row.word}: ${this.ctx.format.number(row.count)} places. The rest of the map is dimmed, not removed.`
      : 'Showing every place again.');
  },

  /* ================================================================ layer == */

  setLayer(id, { from = 'user', skipPredict = false } = {}) {
    if (!byId.has(id)) { console.warn('layers: refused unknown layer "' + id + '"'); return false; }
    const l = byId.get(id);
    /* A reading this piece draws on the single plate cannot be shown on P18's
       two, so choosing one closes the comparison rather than setting a state
       the screen does not honour. See SURVIVES_COMPARE. */
    if (this.compareOpen && !SURVIVES_COMPARE.has(id)) {
      /* Cleared FIRST: the close handler below puts back whatever compare made
         us drop, and here the reader has just named something else. */
      this.stoodDownFrom = null;
      this.ctx.bus.emit('compare:close', {});
    }
    /* T4: the resistance marks may not be switched off during the Atlantic
       chapter. The layer can still be LEFT — the reader is not trapped — but
       the pins stay drawn (see _pinsFor) and the control that would remove
       them says why rather than pretending to work. */
    if (this.locks.has(id) && id !== this._layerId()) announce(this.locks.get(id));
    /* CHOOSING THIS READING HAS TO CHANGE THE READING, AND HAS TO CHANGE IT
       FIRST. `control` is the definition switch; setting the store key alone
       moves no pixel, and P17's probe then reported — correctly, and in front
       of the student — "this plate is pixel-for-pixel the legal-status plate".
       Picking it moves the dial one rung, from Britain's widest claim to what
       Britain actually administered, which is the layer's entire content. It
       happens BEFORE the store changes, so the probe never samples the pair
       (layer=control, plate unchanged) and never has to accuse us of it. Only
       from the default rung: a reader who has already chosen one keeps it. */
    if (id === 'control' && window.__map && window.__map.definition === 'claimed') {
      this.ctx.bus.emit('map:setDefinition', { id: 'administered', from: 'layers' });
    }
    /* Commit before reveal, once per session, however the layer was asked for
       — a tour beat that jumps straight to the exit plate would otherwise skip
       the one interaction the layer exists for. The authored path can still
       run its own version and bypass this with `ask:layer {predict:false}`. */
    if (l.predict && !this.predicted.has(id) && from !== 'predict' && !skipPredict) { this._askPredict(l); return true; }
    this.isolated = null;
    this.ctx.store.dispatch('setLayer', id);
    return true;
  },

  /**
   * PREDICT before reveal (DIDACTIC §8.1, and FEATURE_SPEC P06's own line for
   * the exit layer). It is a commitment, not a quiz: any answer advances, the
   * wrong ones are the interesting ones, and the counter-line is printed
   * whatever was chosen.
   */
  _askPredict(l) {
    const ask = el('div.cx-ask.ly-predict');
    ask.appendChild(el('p.cx-ask__eyebrow', { text: 'Commit first' }));
    ask.appendChild(el('p.cx-ask__q', { text: l.predict.q }));
    const ch = el('div.cx-ask__choices');
    for (const c of l.predict.choices) {
      const b = el('button.ly-predict__b', { type: 'button', text: c.label });
      b.addEventListener('click', () => {
        this.predicted.add(l.id);
        this.answers.set(l.id, { choice: c.id, label: c.label });
        this.ctx.bus.emit('layers:predict', { layer: l.id, choice: c.id, majority: l.id === 'exit' ? 'negotiated-independence' : null });
        this.predictAnswer = { layer: l.id, choice: c.id, label: c.label };
        this.setLayer(l.id, { from: 'predict' });
        /* AFTER the layer is set, not before: _say() clears the echo on every
           layer change (so a stale commitment can never stand over a plate it
           was not about), and setting the layer is a layer change. */
        this._echo(c.label);
        /* The sheet is NOT closed. The band can be overwritten by the next
           thing that speaks — measured: the map's own weight note outlived
           this counter-line by three seconds — and the counter-line is the
           payload of the whole interaction. It stays in the rail, beside a
           live map, until the reader closes it. */
        this._openSheet();
      });
      ch.appendChild(b);
    }
    ask.appendChild(ch);
    ask.appendChild(el('p.cx-note', { text: 'There is no penalty for being wrong, and being wrong is the point: a guess you have committed to is the thing evidence can correct.' }));
    this.ctx.bus.emit('ask:sheet', { id: 'layers:key', eyebrow: 'Before it paints', title: l.label, node: ask });
  },

  /**
   * THE READER'S OWN ANSWER, IN THE BAND, FOR SEVEN SECONDS.
   *
   * It is a separate id at a separate priority, sitting ON TOP of the layer's
   * standing sentence rather than replacing it, and it stands down on its own.
   * Two measurements shaped this. At 390 the full label ("BY AN ARMY —
   * CONQUEST AND OCCUPATION") took the whole first line of a two-line band and
   * clipped the sentence beneath it; at 900 and 1024 the band is a SINGLE line
   * and even the shortened label plus the sentence overflowed it. So the echo
   * carries the commitment and nothing else, the standing sentence carries the
   * reading, and the two take turns instead of competing for one line. The
   * argument the commitment is being held against is in the rail, in full,
   * where it has the room to be read.
   */
  _echo(label) {
    const { bus } = this.ctx;
    clearTimeout(this._echoT);
    this._echoLayer = this._layerId();
    bus.emit('ask:say', {
      id: 'layers:said', priority: 58, mark: 'You said',
      text: '<strong>' + escape_(shortChoice(label)) + '</strong>',
    });
    this._echoT = setTimeout(() => {
      this._echoLayer = null;
      bus.emit('ask:say', { id: 'layers:said', text: null });
    }, 7000);
  },

  /* ================================================================= wire == */

  /**
   * Three readings are P02's own and are switched on there, not here: the
   * stitching (`ask:stitch`), size-by-a-quantity (`ask:sizeBy`) and the
   * definition dial. This piece asks for them by their published events and
   * withdraws them when the reader leaves, so a layer is never left on behind
   * a layer that has replaced it.
   */
  _handover(id, prevId) {
    const { bus } = this.ctx;
    if (prevId === 'system' && id !== 'system') bus.emit('ask:stitch', { on: false });
    if (prevId === 'weight' && id !== 'weight') bus.emit('ask:sizeBy', { metric: null });
    if (id === 'system') bus.emit('ask:stitch', { on: true });
    if (id === 'weight') bus.emit('ask:sizeBy', { metric: 'population' });
    /* A RE-ENCODED PLATE IS NEVER SHOWN AT SECOND ZERO'S DISCLOSURE LEVEL.
       LAYOUT_BUDGET §3 lists "changing the layer" as one of the six things that
       advance the reader to `working`, and round 2 only asked for it on the
       definition switch. Measured on a cold load of the deep link
       `#year=1913&layer=mechanism` — a teacher's page number, ARCHITECTURE §8 —
       the plate arrived painted by acquisition mechanism at `data-stage=plate`,
       where layers.css hides this piece's whole bar: no key card, no route to
       the sources, and no control to get back to legal status. A recoloured map
       with no key is the exact defect this piece exists to prevent, and it was
       being shipped by the one URL a teacher is most likely to paste. */
    if (id !== 'status') bus.emit('ask:stage', { level: 'working' });
  },

  _wire() {
    const { store, bus } = this.ctx;
    this.prevLayer = this._layerId();

    this.d(store.subscribe((state, prev, changed) => {
      if (changed.has('activeLayer')) {
        const id = this._layerId();
        this._handover(id, this.prevLayer);
        this.prevLayer = id;
        this.isolated = null; this._repaint(); this._render(); this._say();
      }
      /* `activeTour` is in this list because the pressure haze's default is
         suppressed while a beat is on screen (_pressureOn). Leaving the lesson
         has to put it back on the frame the lesson ends, not on whatever the
         reader happens to touch next. */
      else if (changed.has('year') || changed.has('filters') || changed.has('activeTour')) {
        if (changed.has('activeTour') && !state.activeTour) this.beat = null;
        this._render(); this._overlaySoon();
      }
      if (changed.has('theme')) { this.tokens = readTokens(document.documentElement); this._repaint(); }
    }));

    this.d(bus.on('chrome:stage', () => { this._render(); this._overlaySoon(); }));
    this.d(bus.on('chrome:sheet', (p) => {
      this.sheetOpen = !!(p && p.open && p.id === 'layers:key');
      this.open.setAttribute('aria-expanded', this.sheetOpen ? 'true' : 'false');
      /* Somebody else took the rail. The route does not survive that as a
         hidden state: a reader who comes back gets the step they were on,
         but the sheet's next open is theirs to ask for, not ours to force. */
    }));

    /* ONE PANEL, ONE YEAR ON SCREEN.
       Compare draws two plates through its own painter, so nothing this piece
       re-keys reaches them (SURVIVES_COMPARE). Standing down is not politeness:
       staying on would leave the masthead chip, the address bar and the legend
       all naming a reading that is not drawn anywhere on screen. */
    this.d(bus.on('compare:open', () => {
      this.compareOpen = true;
      if (this.sheetOpen) bus.emit('ask:sheet', null);
      const id = this._layerId();
      if (SURVIVES_COMPARE.has(id)) return;
      this.stoodDownFrom = id;
      this.ctx.store.dispatch('setLayer', 'status');
      bus.emit('ask:say', {
        id: 'layers:standdown', priority: 58, mark: 'Two plates',
        text: '<strong>Back on legal status while two plates are on screen.</strong> '
          + 'A comparison draws its own pair, and this atlas only re-keys one plate at a time — '
          + 'so the reading you had would have been claimed and not drawn.',
      });
      announce('Two plates on screen. The thematic reading is put back until the comparison closes.');
    }));
    this.d(bus.on('compare:close', () => {
      if (!this.compareOpen) return;
      this.compareOpen = false;
      bus.emit('ask:say', { id: 'layers:standdown', text: null });
      const back = this.stoodDownFrom;
      this.stoodDownFrom = null;
      if (back && back !== 'status') this.setLayer(back, { from: 'restore', skipPredict: true });
    }));
    this.d(bus.on('map:enlarged', () => this._overlaySoon()));
    this.d(bus.on('map:projection', () => this._overlaySoon()));
    this.d(bus.on('map:definition', () => { this._repaint(); this._render(); }));

    const take = (p) => this.setLayer(typeof p === 'string' ? p : (p && p.id),
      { from: 'bus', skipPredict: !!(p && p.predict === false) });
    this.d(bus.on('ask:layer', take));
    this.d(bus.on('layers:set', take));
    this.d(bus.on('ask:layerKey', (p) => (p && p.open === false ? bus.emit('ask:sheet', null) : this._openSheet())));
    this.d(bus.on('ask:pressure', (p) => {
      store.dispatch('setFilter', { pressure: p && p.on === false ? 'off' : 'on' });
    }));
    this.d(bus.on('ask:isolate', (p) => { if (p && p.category) this._isolate(p.category); }));
    this.d(bus.on('ask:lockLayer', (p) => {
      if (!p || !p.id) return;
      if (p.on === false) this.locks.delete(p.id); else this.locks.set(p.id, p.why || 'Held on for this beat.');
      this._render(); this._overlaySoon();
    }));

    /* T4: during the Atlantic chapter the resistance pins may not be switched
       off, because abolition is dated AFTER Sam Sharpe and the order is the
       lesson. The control stays on screen, disabled, and says why. */
    this.d(bus.on('tours:beat', (p) => {
      /* Kept for _pressureOn: the haze's 1830-1914 default stands down while a
         beat is on screen, because a beat carries one argument. */
      const wasPath = this._onPath();
      this.beat = p || null;
      if (wasPath !== this._onPath()) { this._render(); this._overlaySoon(); }
      const atlantic = !!(p && p.chapter === 'atlantic');
      const had = this.locks.has('resistance');
      if (atlantic && !had) this.locks.set('resistance', 'Held on for the Atlantic chapter: abolition is dated after Sam Sharpe’s rising, and the order is the lesson.');
      if (!atlantic && had) this.locks.delete('resistance');
      if (atlantic !== had) { this._render(); this._overlaySoon(); }
    }));

    this.d(onEvt(document, 'keydown', (ev) => {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (ev.key === 'c' || ev.key === 'C') { ev.preventDefault(); this._toggleSheet(); }
    }));

    this.d(onEvt(window, 'resize', () => this._overlaySoon()));
    /* The label is written, not toggled, so the width it depends on has to be
       watched rather than left to a stylesheet. */
    if (this.wide && this.wide.addEventListener) {
      const onWide = () => this._render();
      this.wide.addEventListener('change', onWide);
      this.d(() => this.wide.removeEventListener('change', onWide));
    }
    this.d(bus.on('chrome:layout', () => this._render()));
  },

  /** The layer's sentence, in the shell's one voice, at content priority. */
  _say() {
    const l = this._layer();
    const { bus } = this.ctx;
    /* THE ECHO DIES WITH THE READING IT BELONGED TO — and not one beat sooner.
       It stands at 58 for seven seconds, and four layer changes inside those
       seven seconds left "You said: by an army" at 19px over a plate of revolt
       pins, which is P02's own stale-sentence defect with this piece's name on
       it. It is cleared HERE, on the next layer change, rather than on a timer
       alone. The `_echoLayer` guard is not decoration: the store's subscriber
       runs asynchronously, so on the standalone predict path this method fires
       AFTER the commit that set the layer and BEFORE the echo is raised, and an
       unconditional clear there would delete a sentence that had not been said
       yet. */
    if (this._echoLayer && this._echoLayer !== l.id) {
      clearTimeout(this._echoT);
      this._echoLayer = null;
      bus.emit('ask:say', { id: 'layers:said', text: null });
    }
    /* SILENT WHERE THE PIXELS ARE NOT OURS.
       `control`, `weight` and the projection are P02's own readings and P02
       writes a better sentence for them than this file could: it has the
       counts. "Size is people now, not land. 122 carry a cited figure; 11 draw
       as an absence." So this piece hands those over and says nothing, and it
       CLEARS its own line when it does — otherwise the band kept a sentence
       about the last thematic reading standing over P02's new one.
       `tenure` is the exception: P02 paints it and says nothing about it, so
       the sentence would be nobody's. */
    if (l.id === 'status' || (l.paints === 'map' && l.id !== 'tenure')) {
      bus.emit('ask:say', { id: 'layers:layer', text: null });
      return;
    }
    bus.emit('ask:say', {
      /* 45: above a change card (40, and re-emitted on every year change) and
         below a moment (50). An active re-encoding is a standing state of the
         plate, and while it is on it is the sentence that makes the colours
         mean anything. */
      /* NOT the label: the shell prints mark then sentence, and 'HOW BRITAIN
         TOOK IT | colour = how Britain took it' is one thought said twice. The
         mark says what just happened to the plate — which is this piece's
         whole content, and is the thing a reader most needs told. */
      /* 50 — A MOMENT, not standing content.
         Round 2 spoke at 45, one rung below P02's own change notices. Measured:
         press 2 for the definition, then choose a thematic reading, and the
         band still read "Nothing was taken or given up. The word changed, and
         33 units…" — a sentence about the previous action, standing over a
         plate that had since changed meaning. A re-encoding IS a moment: the
         colours on the map stopped meaning what they meant. At 50 the newest
         moment wins, so a definition change after this one takes the band back,
         which is also right.  */
      /* 57 — ONE RUNG ABOVE P02'S RE-ENCODING NOTICES (56), AND WHY.
         Measured on the round-2 build: press 2 for the definition, then pick a
         thematic reading, and the band still read "Nothing was taken or given
         up. The word changed, and 33 units cross the line" — a sentence about
         the previous action, standing at 19px over a plate that had since been
         completely recoloured. Worse: leaving weight for the mechanism plate
         printed P02's withdrawal notice, "Size is land area again", as the
         caption of a mechanism map. P02's own comment is the rule — "the band
         belongs to whatever is happening now" — and while one of this piece's
         readings is painting, that reading IS what is happening. It stands
         down the moment the reader leaves it (see the clear above), so it can
         never do to P02 what P02 was doing to it. */
      id: 'layers:layer', priority: 57, mark: 'Same year, redrawn',
      /* `band`, not sentence + byline. Round 2 concatenated the two and the
         result was clipped mid-word at 390 ("…carrying 14…") and at 900. The
         band is two lines at reading size and the sentence written for it is
         written to fit it; catalog.js refuses to register a layer whose band
         is over 62 characters. The measurement and its source are one control
         away, on this sentence's own `cta`. */
      text: `<strong>${escape_(l.band)}</strong>`,
      cta: { label: 'What this measures', emit: 'ask:layerKey', payload: {} },
    });
  },

  /* =============================================================== render == */

  _render() {
    const l = this._layer();
    const stage = this._stage();
    const mine = !MAP_LAYERS.has(l.id);
    if (this.bar) {
      this.bar.dataset.stage = stage;
      const on = l.id !== 'status';
      this.bar.dataset.on = on ? 'yes' : 'no';
      /* THREE WIDTHS, ONE LABEL.
         · sheet band (a phone, or a tall narrow window): the noun alone. The
           masthead there is 390px and shared with four other controls, and
           "Layers: Taken" clipped to "Layers: Tak"; the state is on the plate's
           own key card two centimetres below.
         · under 88rem: the noun and the state. Ninety pixels of this piece's
           is ninety the shell does not have to find, and the round-2 critic
           found the masthead clipping "Taken → left" mid-word at 1366.
         · 88rem and up: the sentence that teaches, because there is room. */
      const wide = this.wide && this.wide.matches;
      const roomy = this.app && this.app.dataset.rail !== 'sheet';
      this.label.textContent = !roomy ? 'Layers'
        : wide ? (on ? 'Drawn as: ' + (l.short || l.label) : 'Draw this another way')
          : (on ? 'Layers: ' + (l.short || l.label) : 'Layers');
      this.open.title = on
        ? l.label + ' — ' + l.sentence + '. Press C for the other ' + (N_READINGS - 1) + ' readings.'
        : N_READINGS + ' readings of the same territories and the same year (C)';
      this.back.hidden = !on;
      const lock = this.locks.get(l.id);
      this.open.disabled = false;
      this.bar.title = lock || '';
    }
    if (!this.keyHost) return;
    this._ensureHost();
    if (this.plate) this._publishPlate();

    const showKey = mine && stage !== 'plate';
    this.keyHost.replaceChildren();
    if (showKey) {
      this.keyHost.appendChild(buildKeyCard({
        layer: l, rows: this._keyRows(), year: this._year(),
        format: this.ctx.format, counts: this.lastTally,
        note: this.locks.get(l.id) || null,
        onOpen: () => this._openSheet(),
      }));
      /* A HALF-ROW AT THE FOOT OF A BOX IS A CLIP UNLESS IT IS MARKED.
         The key's rows are capped against the plate's own height, so on a short
         window the list scrolls. Measured at 900x700 on the mechanism plate:
         four and a half of seven rows, and the half-row read as a rendering
         fault rather than as "there is more". This flags the box the frame
         after it is laid out, and layers.css draws the fade. */
      const sc = this.keyHost.querySelector('.ly-key__scroll');
      if (sc) requestAnimationFrame(() => {
        if (!sc.isConnected) return;
        sc.dataset.more = sc.scrollHeight - sc.clientHeight > 2 ? 'yes' : 'no';
      });
    }

    /* ONE CAVEAT ON THE PLATE, AND IT IS THE ONE THE SPEC MAKES PERMANENT.
       FEATURE_SPEC charge 5 requires the pressure layer's caption to be on
       screen whenever the haze is. Every other layer's caveat is one control
       away — on the key card's `.cx-more`, in the sheet, and on the card's own
       title. Measured at 1024x640 with the apparatus column open: printing
       both a seven-row key and a sixty-word caveat on a 355px plate clipped
       the caveat mid-word and pushed the key over Nova Scotia. Two panels do
       not fit there, so only the one that has to be there is there. */
    this.capHost.replaceChildren();
    if (this._pressureOn() && stage !== 'plate') {
      this.capHost.appendChild(buildCaption(byId.get('informal'), () => { this.setLayer('informal'); this._openSheet(); }));
    }

    this._overlaySoon();

    this.ctx.bus.emit('layers:changed', {
      id: l.id, label: l.label, sentence: l.sentence, byline: l.byline, caption: l.caption,
      painted: this.lastTally ? this.lastTally.painted : null,
      absent: this.lastTally ? this.lastTally.absent : null,
      quiet: this.lastTally ? this.lastTally.quiet : null,
      categories: this._keyRows().map((r) => ({ id: r.id, word: r.word, count: r.count })),
    });
  },

  update(state, prev, changed) {
    if (!this.plate) this._attach();
    if (changed && (changed.has('year') || changed.has('activeLayer'))) this._overlaySoon();
  },

  destroy() {
    this._renderPending = true;      // any frame still queued becomes a no-op
    clearTimeout(this._echoT);
    this._detach();
    if (this.d) this.d();
    if (this.over) this.over.destroy();
    if (this.wrap) this.wrap.remove();
    if (this.bar) this.bar.remove();
  },
};

/* The say channel sanitises to <strong>/<em>/<b>/<i>/<span>, so anything we put
   in it has to arrive with its own angle brackets already dealt with. */
/**
 * The reader's own answer, cut to a length the band can hold.
 *
 * The band is two lines at reading size and the mark takes the first of them.
 * Measured at 390x844: "YOU SAID: BY AN ARMY — CONQUEST AND OCCUPATION" filled
 * that line by itself and pushed "colour = how Britain took it, from 468
 * acquisition records" onto one line, where it clipped at "468 acquisiti…".
 * The clause before the dash is the reader's own words and it is the half that
 * carries the answer; the whole label is set unabridged in the rail, beside
 * the counter-argument it belongs to.
 */
function shortChoice(label) {
  const first = String(label || '').split(/\s+—\s+|,\s+/)[0].trim();
  const out = first.length > 30 ? first.slice(0, 29).replace(/\s+\S*$/, '') + '…' : first;
  return out.toLowerCase();
}

function escape_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
