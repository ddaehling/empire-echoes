/* =============================================================================
   P17 — LEGEND, SYMBOLOGY AND MAP LITERACY
   Owner: legend. Directory: app/js/legend/, app/css/legend.css

   Purpose: teach a student to read ANY imperial map, starting with ours.

   ROUND 6 — THE RIBBON AND THE SHEET. ROUND 8 — THE KEY IS NEVER ABSENT AND
   NEVER ANONYMOUS. ROUND 9 — THE INK MEANS WHAT THE KEY SAYS IT MEANS.

   Round 9 answers one charge and takes one line off the opening screen.

     · INK NOW TRACKS DEGREE OF CONTROL, IN BOTH THEMES. In the lamplit theme
       the palest fill on the plate — "Self-governing under the Crown", mean
       control degree 1.5, the one status whose end date is arguable — was the
       LOUDEST mark on it at 12.77:1, while "Ruled from London" (degree 4.5, 94
       of the 182 units drawn at 1900) sat at 3.45:1. Spearman's rho between a
       family's ink weight and its degree of control was 0.12. It is now 0.99,
       and the palette is more colour-blind-safe than before the change (worst
       of 45 pairs across four vision models: 8.44 -> 8.98 dE00). The values, the
       reasoning and the audit are in symbology.js under NIGHT_WEIGHTING.
     · THE STRIP NO LONGER INVITES. At `data-stage="plate"`, if every colour on
       the plate is drawn with its word and its count, the ribbon prints no
       control at all — 0 controls and 25 words at 1366x768, against 1 and 28.
       If a colour could NOT be drawn the control stays, at every stage, saying
       how many are missing: an omission is never silent (ribbon.js, fitRibbon).

   Round 8 repairs two failures a hostile critic found in the phone build, and
   one it did not have to look for:

     · AT REST the strip drew seven colours and named none of them, because a
       "name three or name none" floor in ribbon.js fired at every phone width.
       The floor is gone: the strip now names what fits and counts the rest.
     · WITH A DOSSIER OPEN the key vanished. Under 62rem the rail is a bottom
       sheet lying over the foot of the stage, and P02 lifts the plate itself
       into the shell's `overlay` slot; `.app__stage` is `isolation: isolate`,
       so nothing the stage holds can be drawn over either. The strip now goes
       where the map went — see `_keyHost()` — and rides the foot of the
       enlarged plate. Five hit tests across it, in every state, at every
       viewport, are the acceptance test (tools/scenarios/p17-r8-accept.js).
     · THE STRIP DID NOT RE-FIT when the rail closed, so at 1366x768 closing the
       sheet left five of seven colours drawn beside 194 spare pixels and a
       control reading "+2 more". A key that under-reports itself is the same
       defect as one that over-reports.

   Rounds 1–5 answered every charge by growing. Measured on the build before
   this pass, this one piece put three surfaces on the opening screen: a 30rem
   corner card, a 384x154 byline standing on the Atlantic, and a reading plate
   that inset the whole application by 40rem when it opened. The content was
   good and almost none of it was being read.

   There are now TWO surfaces, and the second one is not on screen until it is
   asked for:

     · THE RIBBON (ribbon.js), in `data-mount="legend"` — a full-width strip
       along the FOOT of the plate, `--key-h` tall (28–34px). One sentence
       saying what the colour is measuring, the swatches actually on the map
       this year with their words and their live counts, and ONE control. It is
       the only apparatus this piece shows at `data-stage="plate"`, it renders
       identically on a phone, and it can never take a pixel from the map.

     · THE SHEET (sheet.js), via `bus.emit('ask:sheet', …)` — the shell's rail,
       410x716 at 1366x768, with its own scroll, beside a live map. The rule in
       force, the fourteen legal forms with their rolls of places, WHAT A UNIT
       IS, the marks that are not colours, the tenure ramp, the counting notes,
       the three things wrong with this rendering and the 1886 transfer exercise
       are all there, cut into three sheets so that no one of them is eight
       screenfuls.

   · THE BYLINE (byline.js), in `stage-note`, renders ONLY at
     `data-stage="apparatus"` and only at 62rem and up. Its three questions are
     DIDACTIC_SPEC §8's 00:16 beat, not a greeting — you cannot repair a
     misconception a reader has not had yet — and below 62rem there is no
     apparatus column, so it would be standing on the plate (LAYOUT_BUDGET B5).
     The four fields it carries are also printed at the head of the criticism
     sheet, from the same builder, so they are one control away at every stage
     and every width and the two can never disagree.

   Charges answered (docs/rival/WHY_PRINT_WINS.md):
     4  the grammar of the medium — the rule that is printed is the rule that is
        computed; every magnitude carries one comparison computed from the same
        geometry index; the map names and criticises its own projection; a legal
        category can be COUNTED and its places NAMED with each place's own label
        beside it; and the three questions are then USED on a map we did not
        draw, with the student's answer kept.
     7  silence must be legible as a mark — the coastline-only hole and the
        absence hatch are permanent entries whose counts come from what the
        RENDERER reports it drew, and which say plainly when they are not in use
        on this plate rather than decorating it.

   One rule governs this module: NOTHING IS ASSERTED ABOUT THE PLATE THAT HAS
   NOT BEEN REPORTED OR MEASURED.

   Emits on the bus:
     legend:symbology { symbology }   once at mount — the status vocabulary
     legend:ready     { definition }
     legend:filter    { status }      a legend row was opened as a filter
     legend:plate     { open, section }
     ask:paintUnits   { unitIds, reason }
     ledger:append    { ... }         the transfer exercise, when kept

   Listens for (all optional — every one has an honest fallback):
     map:projection / map:ready / map:painted / ask:sizeBy / map:weight
     map:stitch / map:silence / source:ready
     map:definition / map:setDefinition / layers:definition
   ========================================================================== */

import { el, fill, disposer, on, announce, getJson, loadCss, storage as persist } from '../core/util.js';
import symbology, {
  DEFINITIONS, DEFINITION_BY_ID, DEFAULT_DEFINITION, LAYER_MEANING,
  layerSentence as layerSentenceFor,
} from './symbology.js';
import { totalsAt } from './totals.js';
import { buildRibbon, fitRibbon } from './ribbon.js';
import { buildByline, chooseCaveats, caveatKey, universalOf, figures } from './byline.js';
import { fillSheet, revealSection, kindOf, SHEETS } from './sheet.js';
import { POSTER_QUESTIONS } from './poster.js';
import { sample as samplePlate, differs as platesDiffer } from './plate-probe.js';
import { readPlate, plateSig } from './plate-key.js';

const POSTER_KEY = 'legend:poster-1886';
/* THREE BREAKPOINTS AND NOT ONE MEASUREMENT. 62rem is the shell's: under it
   there is no apparatus column and the rail becomes a bottom sheet
   (layout.css). The other two decide how much of the ribbon fits on one line
   — see the ladder in ribbon.js. A breakpoint cannot oscillate; a measured
   width can, and round 4's measured budget is how this piece once deleted its
   own colour band for a whole session. */
const NARROW = '(max-width: 62rem)';
const MID = '(min-width: 74.01rem)';
const WIDE = '(min-width: 96.01rem)';

/* Which slot of the sample key is which. See _sampleKey(). */
const K_LAYER = 4;
const K_FILTER = 6;

export default {
  id: 'legend',
  slot: 'legend',

  async mount(ctx) {
    const { root, store, data, bus } = ctx;
    this.ctx = ctx;
    this.root = root;
    this.off = disposer();

    await loadCss(new URL('../../css/legend.css', import.meta.url), 'legend-css');

    const pack = await getJson(new URL('./caveats.json', import.meta.url), null);
    this.caveats = (pack && Array.isArray(pack.caveats)) ? pack.caveats : [];
    this.transfer = (pack && pack.transfer) || '';
    this.caveatsMissing = !pack;
    this.lastCaveatKey = null;
    this.lastUniversal = null;

    /* --- the view facts nobody else has state for yet ---------------------- */
    this.view = { projection: null, plate: 'none', weight: null, stitch: false, silence: false };
    /* -----------------------------------------------------------------------
       ROUND 5 — NO COUNT OUTLIVES THE STATE IT WAS COUNTED IN.

       `map:weight`, `map:stitch` and `map:silence` are emitted by the renderer
       only when the mode is TOGGLED. Round 4 stored their payloads and reprinted
       them for the rest of the session, so pressing W at 1900 and scrubbing to
       1620 printed "176 carry a figure, 6 draw as a hole" over a plate of
       nineteen units, under a heading promising figures recomputed at this year.

       The fix is a live measurement with a proof attached. `_recount()` walks
       the renderer's OWN paint table — the same table, the same arithmetic the
       map itself uses — and the result is accepted only if the units it counts
       equal this panel's independent count of the units drawn under the rule in
       force. If they disagree, the paint table has not caught up with the year
       and every figure is withheld and said to be withheld. `counts` is null
       until that check passes, and it is nulled the instant the state moves.
    ----------------------------------------------------------------------- */
    this.counts = null;
    this.countSig = null;
    this.countChecked = null;
    this.silenceAsked = [];
    this.silenceFirstYear = undefined;
    this.silenceReport = null;
    this.renderSource = null;

    /* --- the sheet --------------------------------------------------------- */
    this.reading = false;
    this.readSection = 'colour';
    /* ROUND 5. "Keep these answers" announced "kept and sent to your Close",
       and the Close module is a 266-byte stub, `window.BEA` exposes no ledger,
       and localStorage was empty after the click: a reload lost the whole 1886
       exercise. This piece now keeps the answers itself, in this browser, under
       its own key, and says exactly that and nothing more. The `ledger:append`
       emit stays, because P21 is the right owner when it exists — but no
       sentence in this UI depends on it having been heard. */
    this.posterAnswers = persist.get(POSTER_KEY, null) || {};

    /* THE SHEET'S BODY IS MINE AND IT IS BUILT ONCE. The shell is handed this
       node, so re-rendering on a year change refills it in place instead of
       re-opening the sheet and throwing the reader's scroll position away. */
    this.sheetHost = el('div.lsheet');
    this.mq = {};
    if (window.matchMedia) {
      for (const [k, q] of [['narrow', NARROW], ['mid', MID], ['wide', WIDE]]) {
        const mq = window.matchMedia(q);
        this.mq[k] = mq;
        const onMq = () => { this._readWidth(); this.render(); };
        mq.addEventListener('change', onMq);
        this.off(() => mq.removeEventListener('change', onMq));
      }
    }
    this._readWidth();

    /* --- what the plate is actually drawing, measured not assumed ---------- */
    this.layerVerified = new Map();   // layerId -> true | false
    this.drawnLayer = 'status';       // what the plate has been SEEN to draw
    this.statusSamples = new Map();   // view signature -> the plate under layer=status
    this.paintWorked = null;
    this.paintEverWorked = false;
    this.lastSample = null;

    const self = this;
    const publish = () => {
      if (!window.BEA) return;
      if (!window.BEA.symbology) window.BEA.symbology = symbology;
      if (!window.BEA.legend) {
        window.BEA.legend = {
          get layerVerified() { return Object.fromEntries(self.layerVerified); },
          get drawnLayer() { return self.drawnLayer; },
          get baselines() { return [...self.statusSamples.keys()]; },
          get sampleKey() { return self.lastSample ? self.lastSample.key : null; },
          get paintWorked() { return self.paintWorked; },
          get caveats() { return self.lastCaveatKey; },
          get reading() { return self.reading; },
          get poster() { return { ...self.posterAnswers }; },
          openPlate: (section) => self.openPlate(section || 'colour'),
          closePlate: () => self.closePlate(),
          totalsAt: (y) => totalsAt(self.ctx.data, y),
        };
      }
    };
    publish();
    this.off(bus.on('app:ready', () => { publish(); setTimeout(publish, 0); }));
    setTimeout(publish, 0);
    bus.emit('legend:symbology', { symbology });
    this._loadGlosses();

    /* --- two slots that are not mine, and I am a good tenant in both ------- */
    this.noteHost = document.querySelector('[data-mount="stage-note"]');
    this.overlayHost = document.querySelector('[data-mount="overlay"]');
    /* P02 MOVES THE MAP; THE KEY HAS TO FOLLOW IT.
       Under 62rem with a territory selected the plate is redrawn as
       `.map.is-enlarged` in this slot, and that arrives a beat AFTER the
       dossier's attribute flips — so the render that answers the rail cannot
       see it yet and would leave the strip behind, under the overlay, which is
       the defect (a plate with no key on the screen). One observer on the slot,
       and a render only when the answer actually changes. */
    if (this.overlayHost && typeof MutationObserver === 'function') {
      const ov = new MutationObserver(() => {
        if (!this.mounted) return;
        /* ONE PREDICATE, ASKED IN ONE PLACE. This observer and `_keyHost()`
           asked the same question two different ways for one revision, and
           because the strip is itself in this slot, the disagreement was a
           render loop: `_keyHost` hosted the strip here, the mutation that
           caused fired this callback, this callback decided it should not be
           here, and re-rendered. The page did not recover. */
        const want = this._wantPin();
        if (want === this._pinned) return;
        this._pinned = want;
        this.render();
      });
      ov.observe(this.overlayHost, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      this.off(() => ov.disconnect());
    }

    if (this.noteHost && typeof MutationObserver === 'function') {
      const mo = new MutationObserver(() => {
        if (this.mounted && !document.getElementById('legend-byline')) this.render();
      });
      mo.observe(this.noteHost, { childList: true });
      this.off(() => mo.disconnect());
    }

    /* --- static facts about the dataset ----------------------------------- */
    const terrs = data.territories || [];
    this.silenceCount = terrs.reduce((n, t) => n + ((t.silences && t.silences.length) || 0), 0);
    this.influenceCited = terrs.some(t => (t.influence || []).some(i => Number.isFinite(Number(i && i.value))));
    this.datasetBuilt = (data.meta && data.meta.dataset && data.meta.dataset.built) || null;

    /* --- listeners -------------------------------------------------------- */
    const setProj = (p) => {
      const v = p && (p.projection || p.id || p);
      const next = v === 'equal-area' || v === 'equalEarth' || v === 'equal_earth' ? 'equal-area'
        : v === 'mercator' ? 'mercator' : null;
      if (next !== this.view.projection) { this.view.projection = next; this.render(); }
    };
    this.off(bus.on('map:projection', setProj));
    const plateDrawn = (p) => {
      this.mapPresent = true;
      this.view.plate = 'drawn';
      if (p && p.projection) setProj(p); else this.render();
    };
    this.off(bus.on('map:ready', plateDrawn));
    this.off(bus.on('map:painted', (p) => { if (this.view.plate !== 'drawn') plateDrawn(p); }));
    const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);
    /* Every one of these three listeners records only WHICH MODE IS ON. The
       counts are measured, in `_recount()`, against the plate as it is now. */
    const onWeight = (p) => {
      this.view.weight = (p && p.metric) || null;
      this.counts = null; this.countSig = null;
      this.render();
    };
    this.off(bus.on('ask:sizeBy', onWeight));
    this.off(bus.on('map:weight', onWeight));

    this.off(bus.on('map:stitch', (p) => {
      this.view.stitch = !!(p && p.on);
      this.counts = null; this.countSig = null;
      this.render();
    }));

    this.off(bus.on('map:silence', (p) => {
      const asked = p ? (num(p.asked) || 0) : 0;
      const drawn = p ? (num(p.drawn) || 0) : 0;
      const onNow = asked > 0 || drawn > 0;
      this.view.silence = onNow;
      this.counts = null; this.countSig = null;
      this.silenceAsked = onNow && Array.isArray(p && p.unitIds) ? p.unitIds.slice() : [];
      this.silenceFirstYear = undefined;
      this.silenceReport = onNow ? { asked, notes: p ? (num(p.notes) || 0) : 0 } : null;
      this.render();
    }));

    const takeSource = (fn) => {
      if (typeof fn !== 'function' || this.renderSource === fn) return;
      this.renderSource = fn;
      if (this.mounted) this.render();
    };
    takeSource(window.BEA && window.BEA.renderSource);
    this.off(bus.on('source:ready', (p) => takeSource(p && p.renderSource)));
    setTimeout(() => takeSource(window.BEA && window.BEA.renderSource), 0);
    const onDefinition = () => this.render();
    this.off(bus.on('map:setDefinition', onDefinition));
    this.off(bus.on('map:definition', onDefinition));
    this.off(bus.on('layers:definition', onDefinition));

    const report = ctx.registry && typeof ctx.registry.report === 'function' ? ctx.registry.report() : null;
    this.mapPresent = !!(report && (report.mounted || []).includes('map'));
    if (this.mapPresent) this.view.plate = 'drawn';

    /* -----------------------------------------------------------------------
       THE MISSING PLATE. One run in four of round 3 hit P02's mount race and
       the map never drew; this panel then described a plate that was not there
       in perfectly confident sentences. It is not this piece's bug and it is
       this piece's job to say so, so the byline gains a visible defect line
       when nothing has reported a paint after a fair wait.
    ----------------------------------------------------------------------- */
    this.plateOverdue = false;
    const overdue = setTimeout(() => {
      const r = ctx.registry && typeof ctx.registry.report === 'function' ? ctx.registry.report() : null;
      const mounted = !!(r && (r.mounted || []).includes('map'));
      if (!mounted && this.view.plate !== 'drawn') {
        this.plateOverdue = true;
        this.mapPresent = false;
        if (this.mounted) this.render();
      }
    }, 6000);
    this.off(() => clearTimeout(overdue));

    /* Delegated clicks inside the sheet's list of legal forms. */
    this.off(on(document, 'click', '.lsheet .legend__entry[data-status]', (ev, hit) => this.toggleStatusFilter(hit.dataset.status)));

    /* --- the disclosure level ------------------------------------------
       The shell owns `data-stage`; this piece reads it and never sets it. At
       `plate` and `working` the ribbon is the whole of this module on screen;
       at `apparatus` the byline joins it in the reserved column. */
    this.off(bus.on('chrome:stage', () => this.render()));

    /* --- the rail --------------------------------------------------------
       Escape and the sheet's own × are the shell's, so the only way this piece
       learns that its sheet has gone is this event. It also tells us when
       another module has taken the rail: the dossier and the sheet share one
       column (LAYOUT_BUDGET B7), and a piece that keeps drawing into a surface
       somebody else is using is a piece that has stopped reading the app. */
    this.off(bus.on('chrome:sheet', (p) => {
      const mine = !!(p && String(p.id || '').startsWith('legend:'));
      if (p && p.open) { if (!mine && this.reading) { this.reading = false; } this._reflow(); return; }
      if (!this.reading) return;
      this.reading = false;
      this._reflow();
      const back = this.root.querySelector('.legend__route');
      if (back && typeof back.focus === 'function') back.focus();
      this.ctx.bus.emit('legend:plate', { open: false, section: null });
    }));

    /* THE RAIL'S WIDTH IS THE RIBBON'S PROBLEM TOO. The dossier and the sheet
       take 410px of the stage at 1366, and the strip is what is left. This is a
       state read, not a measurement: two attributes on #app, watched. */
    const app = document.getElementById('app');
    if (app && typeof MutationObserver === 'function') {
      const mo = new MutationObserver(() => {
        const before = this.rail;
        this._readWidth();
        if (this.rail !== before && this.mounted) {
          this._reflow();
          /* The rail moves over --dur-slow (360ms), so the strip it leaves
             behind is the wrong width for a third of a second after the
             attribute flips. One settle pass. */
          clearTimeout(this._settle);
          this._settle = setTimeout(() => { if (this.mounted) this.render(); }, 420);
        }
      });
      mo.observe(app, { attributes: true, attributeFilter: ['data-dossier', 'data-sheet'] });
      this.off(() => { mo.disconnect(); clearTimeout(this._settle); });
    }

    /* -----------------------------------------------------------------------
       THE STRIP'S OWN WIDTH, WATCHED.

       `fitRibbon` decides how many colours can be drawn whole from the width
       the strip HAS. Round 7 only asked at render time, and the rail's 360ms
       transition meant the answer was always taken mid-slide: measured at
       1366x768, closing the sheet left the strip 1366px wide still showing five
       of seven colours and a control reading "+2 more", with 194 spare pixels
       beside it. A key that under-reports itself is the same defect as one that
       over-reports itself.

       This cannot oscillate, and the reason is structural rather than careful:
       the strip is a full-width shell row whose width does not depend on
       anything in it, so re-fitting can never change the width that is being
       re-fitted. Round 4's oscillation came from measuring the STAGE, which
       this piece was standing in and could push.
    ----------------------------------------------------------------------- */
    if (typeof ResizeObserver === 'function' && this.root) {
      let lastW = -1;
      const ro = new ResizeObserver(() => {
        const w = Math.round(this.root.clientWidth);
        if (w === lastW) return;
        lastW = w;
        if (this.mounted) this._refit();
      });
      ro.observe(this.root);
      this.off(() => ro.disconnect());
    }

    /* THE STAGE CROSSES 62rem WITH A TRANSITION ON IT.
       The rail opens over --dur-slow, so the attribute changes 360ms before the
       stage is actually narrow: both the mutation callback and the frame after
       it still measure the old width, and the byline stayed on a plate that had
       slid under it. This watches for the threshold crossing itself and does
       nothing at all until it happens — it is one boolean, not a budget. */
    if (typeof ResizeObserver === 'function') {
      const stageEl = document.querySelector('.app__stage');
      if (stageEl) {
        this._reserved = this._columnReserved();
        const ro = new ResizeObserver(() => {
          const now = this._columnReserved();
          if (now === this._reserved) return;
          this._reserved = now;
          if (this.mounted) this.render();
        });
        ro.observe(stageEl);
        this.off(() => ro.disconnect());
      }
    }

    /* THE STRIP IS MEASURED, SO IT MUST BE MEASURED WITH THE REAL TYPE.
       `fitRibbon` decides how many colours can be drawn whole from the width of
       the words it can see. If the serif and the sans are still loading, the
       words it can see are the fallback's, and the answer is a few pixels
       wrong in whichever direction the metrics differ — which at 390 is the
       difference between four colours and three. One re-fit when the fonts have
       actually arrived, and never again. */
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(() => { if (this.mounted) this.render(); }).catch(() => {});
    }

    this.mounted = true;
    this.render();
    bus.emit('legend:ready', { definition: this.definitionId() });
    void store; void el;
  },

  /* ------------------------------------------------------------- state --- */

  /** The places the renderer says it drew as holes, in the atlas's own names. */
  _silenceNames(unitIds) {
    const { data } = this.ctx;
    if (!Array.isArray(unitIds) || !unitIds.length) return [];
    const out = [];
    const seen = new Set();
    for (const id of unitIds) {
      const n = (data.unitName && data.unitName(id)) || id;
      if (seen.has(n)) continue;
      seen.add(n);
      out.push(n);
      if (out.length >= 8) break;
    }
    return out;
  },

  /* -----------------------------------------------------------------------
     THE RECOUNT. The renderer's own paint table, walked with the renderer's own
     arithmetic, and checked against this panel's independent count before a
     single figure of it is printed.
  ----------------------------------------------------------------------- */
  _stateSig(s) {
    return [s.year, this.definitionId(), this.view.weight || '',
      this.view.stitch ? 's' : '', this.view.silence ? 'h' : ''].join('|');
  },

  _recount() {
    const m = (window.BEA && window.BEA.map) || window.__map;
    const plate = m && m.plate;
    const paint = plate && plate.paint;
    if (!paint || typeof paint.entries !== 'function') return null;
    const { data } = this.ctx;
    const year = this.ctx.store.getState().year;
    const st = typeof data.statusAt === 'function' ? data.statusAt(year) : null;
    const def = DEFINITION_BY_ID.get(this.definitionId());
    if (!st || !def) return null;
    const tiny = typeof plate.isTiny === 'function' ? (id) => plate.isTiny(id) : null;
    let counted = 0, missing = 0, holes = 0, informal = 0, small = 0, tagged = 0;
    let inSet = 0, holesInSet = 0, offSet = 0;
    const holeIds = [];
    for (const [uid, rec] of paint) {
      if (!rec) continue;
      if (tiny && tiny(uid) && !rec.lost) { small++; if (rec.stitchKind) tagged++; }
      if (rec.lost) continue;
      /* PER-UNIT VERIFICATION, not a total. A paint table left over from another
         year has almost none of ITS units in this year's set, so `offSet` is the
         thing that catches a stale plate before a figure is printed from it. */
      const e = st.get(uid);
      const here = !!(e && def.test(e));
      if (rec.mode === 'hole') { holes++; holeIds.push(uid); if (here) holesInSet++; continue; }
      if (!here) { offSet++; continue; }
      inSet++;
      if (rec.mode === 'informal') { informal++; continue; }
      if (rec.mode === 'absence') missing++; else counted++;
    }
    return { counted, missing, holes, informal, small, tagged, holeIds, offSet, inSet, holesInSet };
  },

  /**
   * Take a recount only if it is a recount OF THIS YEAR. The proof is the unit
   * total: this panel counts the units drawn under the rule in force straight
   * from data.statusAt, and a paint table that has not caught up gives a
   * different number. Measured on this build, the table is one year behind for
   * two animation frames after a scrub; during those frames nothing is printed.
   */
  _takeCount() {
    const s = this.ctx.store.getState();
    const sig = this._stateSig(s);
    const t = this.ctx.data.statusAt ? totalsAt(this.ctx.data, s.year) : null;
    const want = t ? t.sets[this.definitionId()].units : null;
    const got = this._recount();
    this.countChecked = want;
    const verified = got && want != null && got.offSet === 0 && (got.inSet + got.holesInSet) === want;
    if (!verified) {
      const had = this.counts;
      this.counts = null; this.countSig = null;
      /* The renderer paints on its own schedule. Ask again, a few times, before
         concluding that this plate is not this year's — but never print a
         figure from an unverified table in the meantime. */
      if (this._retries == null || this._retrySig !== sig) { this._retries = 0; this._retrySig = sig; }
      if (this._retries < 5) {
        this._retries++;
        clearTimeout(this._retryTimer);
        this._retryTimer = setTimeout(() => { if (this.mounted) this._probeSoon(); }, 90 * this._retries);
      }
      return had != null;
    }
    this._retries = 0;
    const same = this.counts && this.countSig === sig
      && this.counts.counted === got.counted && this.counts.missing === got.missing
      && this.counts.holes === got.holes && this.counts.small === got.small;
    this.counts = got; this.countSig = sig;
    return !same;
  },

  /**
   * THE EARLIEST YEAR ANY OF THESE HOLES CAN EXIST.
   *
   * At 1900, where the app lands, silences are real and none is on the plate,
   * and round 4's key entry described the mark anyway. The honest number is not
   * "when is this unit British" — round 5's first attempt computed that and
   * printed 1788, two centuries before anything was burned. It is the date the
   * renderer itself attached to each silence: the map derives a `from` year for
   * every one, from the territory's own record, and refuses to draw a hole
   * before it, because a record cannot be destroyed before it is made. This
   * reads that field and takes the earliest. If the renderer is not exposing
   * it, this returns null and the entry says nothing rather than guessing.
   */
  _firstSilenceYear() {
    if (this.silenceFirstYear !== undefined) return this.silenceFirstYear;
    this.silenceFirstYear = null;
    const m = (window.BEA && window.BEA.map) || window.__map;
    const sil = m && m.silences;
    if (!sil || typeof sil.values !== 'function') return null;
    let best = null;
    for (const e of sil.values()) {
      const y = Number(e && e.from);
      if (Number.isFinite(y) && (best == null || y < best)) best = y;
    }
    this.silenceFirstYear = best;
    return best;
  },

  definitionId() {
    const s = this.ctx.store.getState();
    const fromState = s.controlDefinition;
    if (DEFINITION_BY_ID.has(fromState)) return fromState;
    const fromFilter = s.filters && s.filters.def;
    if (DEFINITION_BY_ID.has(fromFilter)) return fromFilter;
    const m = /(?:^|[#&])def=([a-z-]+)/.exec(location.hash || '');
    if (m && DEFINITION_BY_ID.has(m[1])) return m[1];
    return DEFAULT_DEFINITION;
  },

  /* --------------------------------------------------------- the sheet ---- */

  /**
   * OPEN THE SHEET. Named `openPlate` because that is the published name on
   * `window.BEA.legend` and in a dozen scenarios; what it opens is now the
   * shell's rail — 410x716 with its own scroll, beside a live map — instead of
   * a 40rem inset on the whole application.
   */
  openPlate(section = 'colour') {
    this.readSection = section;
    const kind = kindOf(section);
    const meta = SHEETS[kind];
    this.reading = true;
    this.render();
    this.ctx.bus.emit('ask:sheet', {
      id: meta.id, eyebrow: meta.eyebrow, title: meta.title, node: this.sheetHost,
    });
    revealSection(this.sheetHost, section);
    const close = document.querySelector('.app__sheet .cx-sheet__close');
    if (close && typeof close.focus === 'function') close.focus();
    this.ctx.bus.emit('legend:plate', { open: true, section });
    announce(kind === 'criticism'
      ? 'Three things wrong with this rendering, beside the map. Press Escape to close.'
      : 'The full key is open beside the map. Press Escape to close.');
  },

  closePlate() {
    if (!this.reading) return;
    this.reading = false;
    /* The shell answers this by closing the rail and emitting chrome:sheet,
       which is where the focus is returned and legend:plate is announced. */
    this.ctx.bus.emit('ask:sheet', null);
    this.render();
    announce('The key is closed and the map has the rail back.');
  },

  /** 'phone' | 'small' | 'mid' | 'wide'. No element is measured to get this. */
  _readWidth() {
    const m = this.mq || {};
    this.phone = !!(m.narrow && m.narrow.matches);
    this.narrow = this.phone;
    this.width = this.phone ? 'phone' : (m.wide && m.wide.matches) ? 'wide'
      : (m.mid && m.mid.matches) ? 'mid' : 'small';
    const app = document.getElementById('app');
    this.rail = !!(app && (app.dataset.dossier === 'open' || app.dataset.sheet === 'open'));
  },

  /**
   * RENDER NOW, AND AGAIN AFTER THE LAYOUT HAS MOVED.
   *
   * The rail's width changes the stage's width, and the stage is a CONTAINER:
   * `@container stage (min-width: 62rem)` decides whether the apparatus column
   * is reserved. Container queries resolve at layout, and this observer runs
   * before that layout has happened, so the first answer is the old one. One
   * extra frame, and only when the rail has actually moved.
   */
  _reflow() {
    this.render();
    if (this._reflowRaf) cancelAnimationFrame(this._reflowRaf);
    this._reflowRaf = requestAnimationFrame(() => {
      this._reflowRaf = 0;
      if (this.mounted) this.render();
    });
  },

  _stage() {
    const app = document.getElementById('app') || document.querySelector('.app');
    const v = app && app.dataset ? app.dataset.stage : null;
    return v === 'working' || v === 'apparatus' ? v : 'plate';
  },

  /**
   * KEEP THE KEY ON SCREEN WHEN THE RAIL IS OPEN AT PHONE WIDTH.
   *
   * Under 62rem the dossier and the sheet are one bottom sheet lying over the
   * foot of the stage, and the key strip lives at the foot of the stage. Round
   * 7 therefore shipped a phone build in which selecting any territory removed
   * the map's key from the screen entirely — measured: five hit tests across
   * the strip all answered with the dossier's own markup.
   *
   * legend.css lifts the strip to sit immediately above the open rail. This
   * supplies the one number that move needs, from the rail's OWN geometry
   * rather than from a copy of the shell's arithmetic, so it stays right if the
   * shell changes the sheet's height:
   *
   *     clear = the rail's height + whatever the rail is standing on
   *
   * The height is used rather than the live `top` because the rail opens with a
   * 360ms transform on it: its top is off the bottom of the window for the
   * first third of a second, and a strip that followed it would fly up the
   * screen. Its height is correct from the first frame.
   *
   * If anything about the measurement is not sane — no rail element, a height
   * that would push the strip off the top of the window — the property is
   * removed and the stylesheet's own fallback stands.
   */
  /**
   * Re-answer the fit question without rebuilding anything. The ribbon's DOM is
   * unchanged; only which entries are painted, and what the one control admits,
   * can move. Cheap enough to run on every width change, and it never touches
   * focus — which a full render does.
   */
  _refit() {
    if (!this.mounted || !this.root) return;
    this._pinKey();
    this._placePin();
    const rib = (this.pinHost && this.pinHost.isConnected ? this.pinHost : this.root)
      .querySelector('.legend--ribbon');
    if (rib) this._fit = fitRibbon(rib);
  },

  /**
   * WHERE THE STRIP HAS TO STAND WHEN THE MAP HAS MOVED.
   *
   * At 390x844 with a territory selected, P02 lifts the plate out of the stage
   * and draws it as `.map.is-enlarged`, fixed, in the shell's `overlay` slot at
   * z 58 — measured at y 46..180, 390x134, which is a better map than the 45px
   * sliver the bottom sheet would otherwise leave. The whole window is then
   * spoken for: masthead 0..46, that map 46..180, the dossier 180..660, the
   * time bar 660..844. There is no free pixel anywhere, and `.app__stage` is
   * `isolation: isolate`, so nothing inside it can be raised over an overlay
   * that is z 70.
   *
   * So the key goes where the map went. It is the map's key; when the map moves
   * to the overlay the key belongs at the foot of it, drawn exactly as it is at
   * every other width — one line, the same words, the same one control — and it
   * costs 28 of that map's 134 pixels. The alternative, measured on the build
   * this round is repairing, was five hit tests across the strip all answering
   * `dsr__from`: a plate of eight colours with its key nowhere on the screen.
   *
   * The tenancy is narrow and it cleans up after itself: only under 62rem, only
   * while a rail is open, only while P02 actually has the overlay, and the node
   * is removed the moment any of those stops being true.
   */
  /**
   * Does the strip have to leave the stage?
   *
   * P02 puts two things in the overlay at phone width: the enlarged plate
   * itself, and its floating furniture (the zoom column) — measured at z 58 and
   * z 59, in a slot at z 70, over a stage that is `isolation: isolate`. EITHER
   * of them is over the strip, and the second one alone was enough to bury the
   * strip's one control: with the legend's own sheet open at 390 the zoom
   * column was drawn across "+5 more →". So the question is not "has the map
   * moved" but "is anything of the map's in the overlay while a rail is open".
   *
   * It is one function because it is asked from two places (here and the slot's
   * mutation observer), and two spellings of it was a render loop.
   */
  _wantPin() {
    if (!this.phone || !this.rail || !this.overlayHost) return false;
    return !!(document.querySelector('.app__overlay .map.is-enlarged')
      || document.querySelector('.app__overlay .map__furniture'));
  },

  _keyHost() {
    const want = this._wantPin();
    this._pinned = want;
    if (!want) {
      if (this.pinHost) { this.pinHost.remove(); this.pinHost = null; }
      return this.root;
    }
    if (!this.pinHost || !this.pinHost.isConnected) {
      this.pinHost = el('div.legend__pin.stage__key');
      this.overlayHost.appendChild(this.pinHost);
    }
    this._placePin();
    return this.pinHost;
  },

  /**
   * Put the pinned strip on the foot of the enlarged map, and keep it there.
   *
   * The map arrives in the overlay while the bottom sheet is still sliding, so
   * its rectangle at the render that creates the strip is not its rectangle a
   * third of a second later — measured, the strip was left three pixels into
   * the dossier's own head. This re-reads the map's real rectangle on every
   * render and every re-fit, and follows it for the length of the shell's
   * transition. It only ever writes one number, so it cannot fight anything.
   */
  _placePin() {
    const host = this.pinHost;
    if (!host || !host.isConnected) return;
    /* The foot of the enlarged plate if there is one — the key belongs to the
       map and should sit on it — otherwise the top of the open rail, which is
       where the strip would have been if the stage could reach that far. */
    const map = document.querySelector('.app__overlay .map.is-enlarged');
    const r = map ? map.getBoundingClientRect() : null;
    const below = r && r.height > 40 ? Math.round(window.innerHeight - r.bottom) : this._railClear();
    if (below != null && below >= 0 && below < window.innerHeight) {
      host.style.setProperty('--legend-pin-bottom', below + 'px');
    } else host.style.removeProperty('--legend-pin-bottom');
  },

  /** Follow the map for the length of the shell's 360ms rail transition. */
  _followPin() {
    clearTimeout(this._follow);
    let n = 0;
    const step = () => {
      if (!this.mounted || !this.pinHost) return;
      this._placePin();
      if (++n < 3) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    this._follow = setTimeout(() => { if (this.mounted) this._placePin(); }, 460);
  },

  /**
   * How far the top of the open rail is above the bottom of the window, from
   * the rail's OWN geometry rather than from a copy of the shell's arithmetic.
   *
   * The rail's HEIGHT is used rather than its live `top` because it opens with
   * a 360ms transform: its top is off the bottom of the window for the first
   * third of a second, and a strip that followed the top would fly up the
   * screen. Its height is right from the first frame.
   */
  _railClear() {
    const app = document.getElementById('app');
    if (!app) return null;
    const rails = [];
    if (app.dataset.sheet === 'open') rails.push(document.querySelector('.app__sheet'));
    if (app.dataset.dossier === 'open') rails.push(document.querySelector('.app__dossier'));
    let px = 0;
    for (const node of rails) {
      if (!node) continue;
      const cs = getComputedStyle(node);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const h = node.getBoundingClientRect().height;
      const foot = parseFloat(cs.insetBlockEnd);
      if (h > 0) px = Math.max(px, h + (Number.isFinite(foot) ? foot : 0));
    }
    return px > 0 ? px : null;
  },

  _pinKey() {
    const root = this.root;
    if (!root || !root.style) return;
    const clear = () => root.style.removeProperty('--legend-rail-clear');
    if (!this.phone || !this.rail) return clear();
    const px = this._railClear();
    const keyH = root.getBoundingClientRect().height || 28;
    if (px != null && px + keyH <= window.innerHeight - 16) root.style.setProperty('--legend-rail-clear', px + 'px');
    else clear();
  },

  /* The transfer exercise: their answer, kept and printed back. */
  /**
   * `rerender: false` is what the free-text field passes. Rebuilding the whole
   * plate on a change event fired by the textarea inside it tears the focused
   * node out from under the event that is still running — observed as an
   * uncaught NotFoundError on every commit of that field — and it also throws
   * the student's caret away mid-sentence. The field's own value is already on
   * screen; only the keep control's state has to move.
   */
  onPosterAnswer(qid, value, rerender = true) {
    if (!value) { delete this.posterAnswers[qid]; }
    else this.posterAnswers = { ...this.posterAnswers, [qid]: value };
    this.posterAnswers.kept = false;
    this.posterStored = persist.set(POSTER_KEY, this.posterAnswers);
    if (rerender) { this.render(); return; }
    const keep = document.querySelector('.lplate__keep');
    if (keep) {
      const done = POSTER_QUESTIONS.every(q => this.posterAnswers[q.id]);
      keep.disabled = !done;
      keep.textContent = 'Keep these answers';
    }
  },

  onPosterKeep() {
    const a = this.posterAnswers;
    if (!POSTER_QUESTIONS.every(q => a[q.id])) return;
    this.posterAnswers = { ...a, kept: true, keptAt: new Date().toISOString().slice(0, 10) };
    this.posterStored = persist.set(POSTER_KEY, this.posterAnswers);
    /* P21 owns the record. This piece hands it over and claims nothing about
       where it is stored, which is why the panel says "for this session". */
    this.ctx.bus.emit('ledger:append', {
      kind: 'transfer',
      by: 'legend',
      claimId: 'legend:imperial-federation-1886',
      label: 'Read the 1886 Imperial Federation poster with the three questions',
      answers: { ...this.posterAnswers },
      year: this.ctx.store.getState().year,
    });
    this.render();
    announce(this.posterStored
      ? 'Your reading of the 1886 sheet is kept in this browser. It will still be here after a reload.'
      : 'This browser refused to store your answers, so they are kept for this session only. Reloading will lose them.');
  },

  /**
   * Open or close the roll of places for one legal form.
   *
   * It also emits `ask:paintUnits`, which is the published contract for asking
   * the plate to draw a subset. This control does not PROMISE a filter: it
   * names and counts the places, from the dataset, at this exact year — and the
   * probe below decides whether the panel is allowed to say the plate changed.
   */
  toggleStatusFilter(statusId) {
    const { store, bus, data, format } = this.ctx;
    const current = store.getState().filters && store.getState().filters.status;
    const next = current === statusId ? null : statusId;
    this.paintWorked = null;
    this._scrollRollIntoView = !!next;
    store.dispatch('setFilter', { status: next });
    bus.emit('legend:filter', { status: next });
    if (next) {
      const unitIds = [];
      const names = new Set();
      for (const [unitId, e] of data.statusAt(store.getState().year)) {
        if (e.status !== next) continue;
        unitIds.push(unitId);
        names.add((e.territory && e.territory.name) || e.territoryId);
      }
      bus.emit('ask:paintUnits', { unitIds, reason: 'legend:' + next });
      announce(`${format.plural(names.size, 'place', 'places')} listed: ${[...names].slice(0, 8).join(', ')}${names.size > 8 ? ', and more' : ''}.`);
    } else {
      bus.emit('ask:paintUnits', { unitIds: null, reason: 'legend:clear' });
      announce('List closed.');
    }
    this.render();
  },

  /* ----------------------------------------------------- the plate probe -- */

  _sampleKey(s) {
    return [
      s.year,
      this.definitionId(),
      this.view.projection || '',
      this.view.weight || '',
      s.activeLayer || 'status',
      s.selectedTerritoryId || '',
      (s.filters && s.filters.status) || '',
      this.view.stitch ? 's' : '',
      this.view.silence ? 'h' : '',
    ].join('|');
  },

  _probeSoon() {
    if (this._probePending) return;
    this._probePending = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      this._probePending = false;
      if (!this.mounted) return;
      /* THE RECOUNT RIDES HERE. Measured on this build, the renderer's paint
         table is one year behind for exactly two animation frames after a
         scrub, which is why this runs inside the same double-rAF the plate
         probe uses. `_takeCount` refuses anything whose unit total does not
         match this panel's own count, so a third frame of lag prints no
         figure rather than last year's. */
      const countMoved = this._takeCount();
      /* THE PLATE CAN BE REPAINTED UNDER A STRIP THAT IS ALREADY ON SCREEN.
         A layer change is two state changes and one repaint, and the repaint is
         last: measured on this build the paint table is one to two frames
         behind, so the render that answered the state change read the PREVIOUS
         layer's colours. Switching back to a layer whose pixels this panel had
         already verified moved nothing else, so without this the strip could
         keep the wrong key indefinitely. This is the same double-rAF the pixel
         probe rides, and it converges: the second pass sees the same
         signature and stops. */
      const psig = plateSig();
      const plateMoved = psig !== this._plateSig;
      this._plateSig = psig;
      const key = this._sampleKey(this.ctx.store.getState());
      const data = samplePlate();
      const prev = this.lastSample;
      this.lastSample = { key, data };
      if (!data) return;
      const parts = key.split('|');
      const base = parts.slice(0, K_LAYER).concat(parts.slice(K_LAYER + 1)).join('|');
      let changed = false;

      const layer = parts[K_LAYER];
      if (layer === 'status') {
        this.statusSamples.set(base, data);
        if (this.statusSamples.size > 8) this.statusSamples.delete(this.statusSamples.keys().next().value);
        if (this.drawnLayer !== 'status') { this.drawnLayer = 'status'; }
      } else if (this.statusSamples.has(base)) {
        const moved = platesDiffer(this.statusSamples.get(base), data);
        if (moved != null && this.layerVerified.get(layer) !== moved) {
          this.layerVerified.set(layer, moved);
          this.drawnLayer = moved ? layer : 'status';
          changed = true;
        }
      }

      if (prev && prev.data && prev.key !== key) {
        const a = prev.key.split('|');
        const diff = [];
        for (let i = 0; i < a.length; i++) if (a[i] !== parts[i]) diff.push(i);
        if (diff.length === 1 && diff[0] === K_FILTER) {
          const moved = platesDiffer(prev.data, data);
          if (moved != null) {
            const want = parts[K_FILTER] ? moved : null;
            if (this.paintWorked !== want) { this.paintWorked = want; changed = true; }
            if (want === true) this.paintEverWorked = true;
          }
        }
      }
      if (changed || countMoved || plateMoved) this.render();
    }));
  },

  /* ------------------------------------------------------------ render --- */

  /**
   * What the marks mean right now, and the counts — but only where the counts
   * have been measured against THIS year's plate. A missing figure is a defect
   * a student can see; a stale one is a defect they cannot.
   */
  modesNow() {
    const s = this.ctx.store.getState();
    const fresh = this.counts && this.countSig === this._stateSig(s) ? this.counts : null;
    return {
      weight: this.view.weight,
      weightCounted: fresh ? fresh.counted : null,
      weightMissing: fresh ? fresh.missing : null,
      stitch: !!this.view.stitch,
      stitchDrawn: fresh ? fresh.small : null,
      silence: !!this.view.silence,
      silenceDrawn: fresh ? fresh.holes : null,
      stale: !fresh,
    };
  },

  /* -----------------------------------------------------------------------
     THE PLATE'S OWN KEY, AND WHEN THIS PANEL IS ALLOWED TO PRINT IT.

     `_takeCount()` already refuses to print a figure from a paint table it
     cannot match, unit for unit, against `data.statusAt` at this year — the
     renderer is one to two animation frames behind a scrub, and a stale figure
     is a defect a reader cannot see. The chips are a bigger claim than the
     figures are, so they ride the same gate: no verified count, no chips read
     off the plate, and the strip falls back to the dataset's legal statuses
     with the sentence that is true of THEM.
  ----------------------------------------------------------------------- */
  _plateKey(s) {
    if (!this.counts || this.countSig !== this._stateSig(s)) return null;
    const p = readPlate();
    return p && p.rows.length ? p : null;
  },

  /**
   * THE ONE LINE UNDER A CHIP THAT THIS MODULE DID NOT WRITE.
   *
   * When a thematic layer re-keys the plate, the chips are P16's categories and
   * the sentence that explains one of them is P16's gloss — written beside the
   * category, in the file that defines it. Copying those thirty-odd sentences
   * into this module would be two vocabularies for one set of colours, and the
   * copy would go stale the first time a category was rewritten. They are read,
   * once, from the table itself: a dynamic import so that a build without the
   * layers module still mounts, and a chip whose gloss is missing prints its
   * word alone rather than an invented sentence.
   */
  _loadGlosses() {
    import('../layers/catalog.js').then((m) => {
      /* NOT gated on `this.mounted`. This runs during mount() and the module
         graph is already loaded, so the promise can settle before the flag is
         set twenty lines later; gating the assignment on it left the glosses
         null for the whole session. The RENDER is gated, which is the part
         that needs a document. */
      const g = new Map();
      for (const v of Object.values(m || {})) {
        if (!Array.isArray(v)) continue;
        for (const c of v) if (c && c.id && c.gloss) g.set(c.id, c.gloss);
      }
      if (!g.size) return;
      this.categoryGloss = g;
      if (this.mounted) this.render();
    }).catch(() => { /* no layers module in this build: the chips print their words */ });
  },

  buildContext() {
    const { store, data, format } = this.ctx;
    const s = store.getState();
    const defId = this.definitionId();
    const def = DEFINITION_BY_ID.get(defId);
    const totals = data.meta && data.statusAt ? totalsAt(data, s.year) : null;

    /* BROKEN BANDS IS DEFINITION-AWARE. Round 3 counted every partial unit on
       the plate whatever the rule in force, so the entry read 61 under all four
       definitions while the same panel's totals note read 53 / 33 / 22 / 61. */
    const partialCount = totals ? totals.sets[defId].partialUnits : null;

    const activeLayer = s.activeLayer || 'status';

    let projection = this.view.projection;
    if (!projection && this.mapPresent) {
      const p = s.filters && s.filters.proj;
      projection = p === 'mercator' ? 'mercator' : 'equal-area';
    }

    const defects = [];
    if (this.caveatsMissing) defects.push('[app/js/legend/caveats.json did not load — the self-criticism list is empty]');
    if (this.plateOverdue) defects.push('[the map module is not running: nothing on this screen has drawn a plate, so the projection, the colours and the marks described here are the atlas’s intentions and not a rendering]');

    return {
      data, format, store,
      state: s,
      year: s.year,
      defId, def, totals,
      metrics: typeof data.metricsAt === 'function' ? data.metricsAt(s.year) : null,
      modes: this.modesNow(),
      silenceReport: this.silenceReport,
      /* THE NAMES ARE THE PLACES ACTUALLY DRAWN AS HOLES AT THIS YEAR, taken
         from the same verified recount as the count. Round 5's first pass named
         the places the renderer was ASKED about, so at 1910 the entry counted
         seven holes and then listed eight places, Kenya among them — whose
         record was not destroyed until 1963. */
      silenceNames: this._silenceNames(this.counts && this.countSig === this._stateSig(s) ? this.counts.holeIds : null),
      silenceFirstYear: this.view.silence ? this._firstSilenceYear() : null,
      onGoToYear: (y) => { this.ctx.store.dispatch('setYear', y); },
      renderSource: this.renderSource,
      definitionsById: DEFINITION_BY_ID,
      activeLayer,
      layerSentence: layerSentenceFor(activeLayer),
      /* ROUND 11 — WHAT THE PLATE IS ACTUALLY KEYED BY. The ribbon's chips are
         built from this and not from the dataset's legal statuses, so the
         strip cannot print a sentence about one encoding over the chips of
         another (plate-key.js). It is read once per render, gated on the same
         verification the figures use: a paint table this panel has not been
         able to check against `data.statusAt` at this year prints nothing
         rather than last year's counts. */
      plateKey: this._plateKey(s),
      categoryGloss: this.categoryGloss || null,
      filterStatus: (s.filters && s.filters.status) || null,
      paintWorked: this.paintWorked,
      paintEverWorked: this.paintEverWorked,
      partialCount,
      silenceCount: this.silenceCount,
      influenceCited: this.influenceCited,
      informalUnits: totals ? totals.informalUnits : 0,
      datasetBuilt: this.datasetBuilt,
      projection,
      plate: this.mapPresent || this.view.plate === 'drawn' ? 'drawn' : 'none',
      defect: defects.length ? defects.join(' ') : null,
      micro: !!this._micro,
      posterAnswers: this.posterAnswers,
      posterStored: this.posterStored !== false,
      reading: this.reading,
      onFold: () => this.ctx.store.dispatch('setPanel', { legend: false }),
      onOpenPlate: (section) => this.openPlate(section),
      onClosePlate: () => this.closePlate(),
      onToggleStatus: (id) => this.toggleStatusFilter(id),
      onPosterAnswer: (q, v, r) => this.onPosterAnswer(q, v, r),
      onPosterKeep: () => this.onPosterKeep(),
    };
  },

  render() {
    if (!this.mounted) return;
    const focusKey = document.activeElement && document.activeElement.getAttribute
      ? document.activeElement.getAttribute('data-focus-key') : null;

    const ctx = this.buildContext();
    const s = ctx.state;

    /* --- the caveats are shared by the byline and the plate --------------- */
    const viewForCaveats = {
      projection: ctx.projection || 'unknown',
      layer: ctx.activeLayer,
      definition: ctx.defId,
      weight: !!this.view.weight,
      stitch: !!this.view.stitch,
      silence: !!this.view.silence,
      plate: ctx.plate,
    };
    const fig = figures(ctx.data, ctx.format, s, ctx.totals, ctx.defId, ctx.modes);
    /* -------------------------------------------------------------------
       THE LIST IS CHOSEN ONCE PER STATE, NOT ONCE PER RENDER.

       chooseCaveats is deliberately asked not to repeat the previous triple,
       which makes it a function of history as well as of state. render() runs
       several times for one state change — a store change, then the map's
       report, then the source renderer arriving — and round 3 re-ran the choice
       on every one of them, so the three criticisms flip-flopped between two
       sets while nothing on screen had changed, and a state change could land
       back on the list it started from. The signature below is everything that
       legitimately changes what is wrong with this rendering; the choice is
       recomputed only when it moves, and the previous triple is what the new
       one is asked to differ from.
    ------------------------------------------------------------------- */
    const sig = [viewForCaveats.projection, viewForCaveats.layer, viewForCaveats.definition,
      viewForCaveats.weight ? 'w' : '', viewForCaveats.stitch ? 's' : '',
      viewForCaveats.silence ? 'h' : '', viewForCaveats.plate, ctx.year].join('|');
    if (sig !== this.caveatSig) {
      this.caveatSig = sig;
      this.caveatChosen = chooseCaveats(this.caveats, viewForCaveats, this.lastCaveatKey, this.lastUniversal, fig);
      this.lastCaveatKey = caveatKey(this.caveatChosen);
      this.lastUniversal = universalOf(this.caveatChosen) || this.lastUniversal;
    }
    const chosen = this.caveatChosen || [];
    ctx.chosen = chosen;
    ctx.figures = fig;
    ctx.transfer = this.transfer;

    /* --- THE RIBBON: the whole of this piece at second zero -------------- */
    const stage = this._stage();
    this._readWidth();
    ctx.stage = stage;
    this.root.dataset.stage = stage;
    this.root.dataset.reading = this.reading ? 'true' : 'false';
    this._formCount = ctx.totals
      ? ctx.totals.sets[ctx.defId].byStatus.filter(x => x.units > 0).length : null;
    const host = this._keyHost();
    if (host !== this.root) this.root.replaceChildren();
    fill(host, buildRibbon(ctx, {
      stage,
      width: this.width || 'mid',
      rail: !!this.rail,
      onOpen: (section) => this.openPlate(section),
    }));
    /* THE FIT PASS. The strip's width is the shell's and does not depend on
       what is in it (LAYOUT_BUDGET §2 `--key-h`, a full-width row), so this can
       measure without any risk of the feedback that made round 4's budget
       oscillate. It decides how many colours can be drawn WHOLE, and what the
       one control has to admit. Synchronous, so nothing is ever painted
       half-drawn and then corrected in front of the reader. */
    this._pinKey();
    this._fit = fitRibbon(host.firstElementChild);
    if (this.pinHost) this._followPin();

    /* The four fields, built from one argument object, so the byline in the
       apparatus column and the field list at the head of the criticism sheet
       cannot drift apart. */
    ctx.byline = this._bylineArgs(ctx);

    /* --- THE SHEET, refilled in place while it is open ------------------- */
    if (this.reading) {
      fillSheet(this.sheetHost, ctx, kindOf(this.readSection), (section) => this.openPlate(section));
      /* A roll of places opened near the foot of a 2,900px sheet is a roll the
         reader cannot see. This is the one scroll this piece performs, and only
         on the render that follows the press. */
      if (this._scrollRollIntoView) {
        this._scrollRollIntoView = false;
        const roll = this.sheetHost.querySelector('.legend__roll');
        const box = this.sheetHost.closest('.cx-sheet__body');
        if (roll && box) {
          const row = roll.closest('.legend__row') || roll;
          box.scrollTop = Math.max(0, row.offsetTop - box.offsetTop - 12);
        }
      }
    }

    /* --- THE BYLINE: apparatus only, and never over the plate ------------ */
    this._renderByline(ctx, stage);

    if (focusKey) {
      const again = document.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`);
      if (again && typeof again.focus === 'function') again.focus();
    }

    this._probeSoon();
  },

  /**
   * THE BYLINE, WHERE IT BELONGS.
   *
   * FEATURE_SPEC P17 requires four fields — projection, what the colour means
   * right now, the exact year, whose definition of control — and requires them
   * to match the render. LAYOUT_BUDGET §7 requires that they are not the first
   * thing a fifteen-year-old meets: "ASK THESE THREE OF ANY IMPERIAL MAP"
   * criticises a map the reader has not looked at yet, and DIDACTIC_SPEC §8
   * delivers its answers at 00:16 and 00:27 "because it now means something".
   *
   * Both are kept. The block renders in the reserved apparatus column at
   * `data-stage="apparatus"`, and the identical field list — same builder, same
   * data — is the head of the criticism sheet, which is one control away from
   * the ribbon at every stage and every width. Under 62rem the block does not
   * render at all: there is no reserved column at that width, so it would be an
   * opaque panel standing on the map, which rule B5 forbids.
   */
  _bylineArgs(ctx) {
    const verified = this.layerVerified.has(ctx.activeLayer)
      ? this.layerVerified.get(ctx.activeLayer)
      : (ctx.activeLayer === 'status' ? true : null);
    return {
      view: { ...this.view, projection: ctx.projection },
      def: ctx.def, format: ctx.format, year: ctx.year,
      layerSentence: ctx.layerSentence, activeLayer: ctx.activeLayer,
      layerVerified: verified,
      drawnSentence: (LAYER_MEANING[this.drawnLayer] || '').replace(/^colour = /, ''),
      critOpen: this.reading && kindOf(this.readSection) === 'criticism',
      keyOpen: false,
      micro: false,
      silenceFirstYear: ctx.silenceFirstYear,
      narrow: false,
      tiny: false,
      chosen: ctx.chosen,
      figures: ctx.figures,
      colours: null,
      modes: ctx.modes,
      transfer: this.transfer,
      defect: ctx.defect,
    };
  },

  /**
   * IS THE APPARATUS COLUMN ACTUALLY RESERVED?
   *
   * The shell reserves it with a CONTAINER query — `@container stage
   * (min-width: 62rem)` sets `--apparatus-gutter` on `.stage__map` — so opening
   * the rail can un-reserve it: measured at 1366x768 at data-stage="apparatus"
   * with the sheet open, the stage falls to 956px (59.75rem), the query stops
   * matching, the gutter goes to 0 and the map slides back under this column.
   * The byline was then a 384x264 opaque panel lying on 101,352px² of plate,
   * which is rule B5.
   *
   * It asks the same question the shell's container query asks — is the stage
   * at least 62rem wide — because the ANSWER on `.stage__map` is a frame stale:
   * container queries resolve at layout, so the computed inset still describes
   * the layout before the rail moved, and reading it hid the byline in the one
   * state where the column exists and showed it in the one state where it does
   * not. `clientWidth` forces the layout it reports, so it is never stale.
   *
   * The 62rem is layout.css's threshold, restated here. If the shell moves it,
   * this line moves with it — that coupling is stated rather than hidden.
   */
  _columnReserved() {
    const stage = document.querySelector('.app__stage');
    if (!stage) return false;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return stage.clientWidth >= 62 * rem;
  },

  _renderByline(ctx, stage) {
    const show = !!(this.noteHost && !this.phone && stage === 'apparatus' && this._columnReserved());
    const existing = document.getElementById('legend-byline');
    if (!show) {
      if (existing) existing.remove();
      this.bylineEl = null;
      return;
    }
    const critOpen = this.reading && kindOf(this.readSection) === 'criticism';
    const built = buildByline(ctx.byline || this._bylineArgs(ctx));
    built.btn.addEventListener('click', () => {
      if (critOpen) this.closePlate(); else this.openPlate('criticism');
    });
    if (existing) existing.remove();
    this.noteHost.insertBefore(built.root, this.noteHost.firstChild);
    this.bylineEl = built.root;
  },

  update(state, prev, changed) {
    if (!this.mounted) return;
    /* THE YEAR MOVED, SO EVERY COUNT THE RENDERER GAVE US IS SUSPECT UNTIL IT
       HAS BEEN RE-MEASURED. Round 4 kept them and printed them. */
    if (changed.has('year') || changed.has('filters') || changed.has('status')) {
      this.counts = null;
      this.countSig = null;
      if (changed.has('year')) this.silenceFirstYear = undefined;
    }
    if (changed.has('year') || changed.has('activeLayer') || changed.has('filters')
      || changed.has('panelState') || changed.has('status') || changed.has('compareYear')) {
      this.render();
      return;
    }
    if (changed.has('selectedTerritoryId')) this._probeSoon();
  },

  destroy() {
    if (this.off) this.off.all();
    const by = document.getElementById('legend-byline');
    if (by) by.remove();
    clearTimeout(this._follow);
    if (this.pinHost) { this.pinHost.remove(); this.pinHost = null; }
    if (this.reading && this.ctx && this.ctx.bus) this.ctx.bus.emit('ask:sheet', null);
    this.reading = false;
    if (this.root) this.root.replaceChildren();
    this.mounted = false;
  },
};
