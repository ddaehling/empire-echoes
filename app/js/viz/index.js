/**
 * viz/index.js — P08. THE QUANTITATIVE SENSE.
 *
 * Three surfaces, and nothing on screen until one of them is asked for:
 *
 *   THE TENSION PLATE   plate.js       four true claims held in one 2×2 field,
 *                                      cross-lit, then collapsed at a price
 *   THE RATIO LINE      ratio-line.js  one axis, one divider, a committed guess
 *                                      BEFORE any figure appears
 *   EXTENT OVER TIME    extent.js      land, share of the world and territories,
 *                                      recomputed from the dataset, with the
 *                                      contested years drawn as a band and the
 *                                      population series honestly refused
 *
 * WHERE THEY RENDER, AND WHY. LAYOUT_BUDGET §3 is binding: at `plate` the screen
 * is the map, one sentence, the year and the colour ribbon, and this piece adds
 * nothing to it — not a chip, not a button, not a word. Everything here opens
 * into the RAIL, through the shell's `ask:sheet`, which is the one surface in
 * this app guaranteed at least 280px and its own scroll. The map compresses
 * beside it and stays live, which is the whole point: a figure lit in the plate
 * paints its units on a map the reader can still see.
 *
 * ------------------------------------------------------------------ DRIVING
 * HOW THE AUTHORED PATH (or anything else) DRIVES THIS PIECE.
 *
 *   bus.emit('viz:open', { id: 'plate:abolition' })      the tension plate
 *   bus.emit('viz:open', { id: 'ratio:kenya' })          32 settlers / a million villagised
 *   bus.emit('viz:open', { id: 'ratio:compensation' })   £20,000,000 / £0
 *   bus.emit('viz:open', { id: 'ratio:ics' })            1,000 officers / 300 million people
 *   bus.emit('viz:open', { id: 'extent' })               how big, and when
 *   bus.emit('viz:open', { id: 'twin' })                 1947: people against land
 *   bus.emit('viz:close')
 *
 * `ask:viz` is accepted as an alias, as are `viz:openPlate {plate}`,
 * `viz:openRatio {id}` and `viz:openExtent`. Everything is idempotent: opening
 * the surface that is already open is a no-op and does not reset a guess the
 * student has already committed.
 *
 * IN THE URL. The open surface is `state.filters.viz`, so it round-trips
 * through the address bar exactly like every other piece of state:
 *
 *   #year=1834&filter=viz:plate.abolition
 *   #year=1956&filter=viz:ratio.kenya&sel=kenya
 *   #year=1922&filter=viz:extent
 *
 * A teacher can therefore set a ratio line the way they would set a page
 * number. Dispatching `setFilter {viz: 'ratio.kenya'}` yourself has exactly the
 * same effect as emitting the event. (`filter` is one of the keys url.js
 * REPLACES rather than pushes, so Back does not close the surface; Escape and
 * the sheet's own × do, and both go through the same state.)
 *
 * AND ONE ROUTE OF ITS OWN, so the piece is not orphaned if nothing drives it:
 * a single `.cx-more` reading "Count it" in the masthead, rendered only at
 * data-stage="apparatus", opening `index` — a contents page of the five
 * surfaces, each described by the question it will ask and by no answer.
 *
 * WHAT IT EMITS, so other pieces can follow:
 *   viz:ready          { surfaces }
 *   viz:opened         { id }                     · viz:closed { id }
 *   viz:figure         { id, print, unit, year, unitIds, source } | { id: null }
 *                      a figure was landed on in the plate — the cross-light.
 *                      The map is asked directly, via the published
 *                      `ask:paintUnits` contract, so a piece that ignores this
 *                      event still sees the lighting on the plate.
 *   viz:committed      { ratio, guess, answer }   a guess went on the record
 *   viz:collapsed      { plate, claim, title }    a version of the story was chosen
 *   viz:extentRevealed { peak, km2 }
 *
 * WHAT IT LISTENS TO BEYOND ITS OWN NAMESPACE:
 *   chrome:sheet   to know when the reader closed the surface from the shell
 *   tours:beat / tours:state   to stand down: while the authored path is
 *                  speaking, this piece never offers anything in the band.
 *
 * IT WRITES TO THE LEDGER and nowhere else: `predicted` for every committed
 * guess, `collapsed` for every version of the story chosen. No timings, no
 * click counts, no "most popular chart" (charge 12).
 */

import { el, disposer } from '../core/util.js';
import { PLATES, RATIOS, RATIO_ORDER, INDEX, FLOW, DOTS, TWIN } from './content.js';
import { buildPlate } from './plate.js';
import { buildRatio } from './ratio-line.js';
import { buildExtent } from './extent.js';
import { buildFlow } from './flow.js';
import { buildDots } from './dots.js';
import { buildTwin } from './twin.js';
import { defectCount } from './figures.js';

const CSS = new URL('../../css/viz.css', import.meta.url);

/** id → { eyebrow, title, build } */
function surfaces(ctx, open) {
  const out = new Map();
  for (const id of Object.keys(PLATES)) {
    const p = PLATES[id];
    out.set('plate:' + id, {
      eyebrow: p.eyebrow, title: p.title,
      build: () => buildPlate(ctx, p),
    });
  }
  for (const id of RATIO_ORDER) {
    const r = RATIOS[id];
    if (!r) continue;
    out.set('ratio:' + id, {
      eyebrow: r.eyebrow, title: r.title,
      build: () => buildRatio(ctx, {
        ...r,
        others: RATIO_ORDER.filter((o) => o !== id).map((o) => ({ id: 'ratio:' + o, label: RATIOS[o].title })),
      }, open),
    });
  }
  out.set('flow', {
    eyebrow: FLOW.eyebrow, title: FLOW.title,
    build: (o) => buildFlow(ctx, FLOW, o),
  });
  for (const id of Object.keys(DOTS)) {
    const d = DOTS[id];
    out.set('dots:' + id, { eyebrow: d.eyebrow, title: d.title, build: (o) => buildDots(ctx, d, o) });
  }
  out.set('twin', {
    eyebrow: TWIN.eyebrow, title: TWIN.title,
    build: (o) => buildTwin(ctx, TWIN, o),
  });
  out.set('extent', {
    eyebrow: 'Measured from this atlas',
    title: 'How big, and when',
    build: (o) => buildExtent(ctx, o),
  });
  out.set('index', {
    eyebrow: INDEX.eyebrow, title: INDEX.title,
    build: () => buildIndex(ctx, open),
  });
  return out;
}

/* Where, in the atlas's own time, each surface has something to say. Used only
   to offer a sentence in the band, never to open anything by itself. */
const OFFERS = [
  { id: 'plate:abolition', from: 1830, to: 1842, mark: '1834', label: 'Four true sentences',
    say: '<strong>Britain abolished slavery.</strong> Three other sentences about the same year are also true, and they do not sit comfortably together.' },
  { id: 'ratio:kenya', from: 1952, to: 1964, mark: 'KENYA', label: 'Guess the other number',
    say: '<strong>32 European settlers were killed</strong> in Kenya between 1952 and 1960. There is another number on the same axis. Guess it before you see it.' },
  { id: 'extent', from: 1900, to: 1935, mark: 'EXTENT', label: 'When was it biggest?',
    say: 'The empire was at its largest <strong>after</strong> the First World War, not before it. The chart marks the peak where the record puts it.' },
  { id: 'twin', from: 1946, to: 1951, mark: '1947', label: 'Guess both numbers',
    say: '<strong>1947 is the date most people give for the end of the empire.</strong> It removed most of the people Britain ruled and almost none of the map. Guess both shares before you see either.' },
];

/* ======================================================== ON THE PATH ======
 * WHERE THE TWO COUNTED THINGS MEET A STUDENT WHO NEVER PRESSES ANYTHING
 * EXTRA. A critic's verdict, round two: "T3 and T8 are missing from the
 * thirty-minute path... LO5 is not assessed anywhere I could reach while
 * following the path." A chart behind a masthead button is not on the path.
 *
 * So each of these two figures is mounted INSIDE the beat it belongs to, under
 * the beat's own prose, in the same rail, with no extra click to reach it. The
 * tours module owns the beat; this module owns the figure; neither edits the
 * other. The contract used is the shell's: the beat's panel is the sheet, the
 * sheet announces itself as `chrome:sheet {id:'tours:beat:<id>', open:true}`,
 * and this module appends one section to it and takes it away again when the
 * beat changes. The shell's own `fill()` would remove it anyway; we do it
 * ourselves so a committed guess survives going back to the beat.
 *
 * The tour bar also gets ONE aux control — the published `tours:aux` contract —
 * so a student who has not scrolled to the bottom of a long beat still has the
 * figure one press away in a place that never moves.
 *
 * Beat 3 is Barbados: "Sugar is not a crop you grow, it is a factory you run...
 * So the planters bought people." The flow answers how many, and how many
 * arrived. Beat 7 is the revenue loop, whose third step asserts an army
 * "overwhelmingly Indian"; the dots make the student commit to a share first.
 */
const ON_PATH = [
  {
    beat: 'barbados', id: 'flow', t: 'T3',
    eyebrow: 'Count it — before you go on',
    title: 'So the planters bought people. How many?',
    aux: 'Count it ↓',
  },
  {
    beat: 'revenue-loop', id: 'dots:army', t: 'T8',
    eyebrow: 'Count it — before you go on',
    title: 'The loop runs on soldiers. Whose?',
    aux: 'Count it ↓',
  },
  /* M14, whose named owner in DIDACTIC_SPEC §4 is this piece and which nothing
     in the app had built: 1947 removed most of the people and almost none of
     the map, and the exits beat is where a student is holding both. */
  {
    beat: 'exits', id: 'twin', t: 'T14',
    eyebrow: 'Count it — before you go on',
    title: '1947 is the date everyone gives. What did it actually remove?',
    aux: 'Count it ↓',
  },
];

/** The contents page. One line per surface, none of them an answer. */
function buildIndex(ctx, open) {
  const node = el('div.viz.viz-index');
  node.append(el('p.viz-index__intro', { text: INDEX.intro }));
  const list = el('ul.viz-index__l');
  for (const it of INDEX.items) {
    list.append(el('li.viz-index__i',
      el('button.cx-more.viz-index__go', { type: 'button', text: it.label, onclick: () => open(it.id) }),
      el('span.cx-note.viz-index__say', { text: it.say })));
  }
  node.append(list);
  return { node };
}

export default {
  id: 'viz',
  /* The masthead's end slot, shared with the other pieces that live there. The
     ONE control this piece puts on screen is rendered there and is `hidden`
     until data-stage="apparatus" — LAYOUT_BUDGET's "one deliberate click".
     At `plate` and at `working` this module draws nothing at all, which is why
     the budget scenario reads identically with it installed and without it.
     Every surface itself opens into the shell's rail via `ask:sheet`. */
  slot: 'chrome-end',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { util, bus, store } = ctx;
    await util.loadCss(CSS);

    /* The one control. `hidden` by default; chrome's `data-stage` reveals it.
       A piece that renders everything and lets the shell hide it is a piece
       that has already paid for the layout (LAYOUT_BUDGET §D). */
    this.entry = el('button.cx-more.viz-entry', {
      type: 'button', 'data-viz': 'root', text: 'Count it',
      title: 'Five things worth counting',
      onclick: () => this._request(this.live ? null : 'index'),
    });
    /* THE SHARED SLOT. `chrome-end` holds three pieces' controls, and one of
       them replaces the slot's children when it mounts, which happens after
       this module. Rather than race it or reach into its DOM, the control is
       re-attached whenever the stage changes — which is the only moment it can
       become visible anyway, so the check costs nothing at second zero. */
    this._ensureEntry = () => { if (this.entry && this.entry.parentNode !== ctx.root) ctx.root.appendChild(this.entry); };
    this._ensureEntry();
    this.d(bus.on('app:ready', () => this._ensureEntry()));
    this.d(bus.on('chrome:stage', () => this._ensureEntry()));
    this.d(() => this.entry.remove());

    this.open = (id) => this._request(id);
    this.surfaces = surfaces(ctx, this.open);
    this.live = null;          // { id, api }
    this.offered = new Set();

    /* ------------------------------------------------------ the contract */
    const openFrom = (p) => this._request(typeof p === 'string' ? p : (p && (p.id || p.surface)));
    this.d(bus.on('viz:open', openFrom));
    this.d(bus.on('ask:viz', openFrom));
    this.d(bus.on('viz:openPlate', (p) => this._request('plate:' + ((p && p.plate) || 'abolition'))));
    this.d(bus.on('viz:openRatio', (p) => this._request('ratio:' + ((p && p.id) || 'kenya'))));
    this.d(bus.on('viz:openExtent', () => this._request('extent')));
    this.d(bus.on('viz:close', () => this._request(null)));

    /* The shell owns the sheet. If the reader closes it, or another piece takes
       it, this module's state has to follow or the URL starts lying. */
    this.d(bus.on('chrome:sheet', (m) => {
      if (!m) return;
      const mine = this.live && m.id === 'viz:' + this.live.id;
      if (mine && m.open === false) this._setFilter(null);
      if (!mine && m.open === true && this.live) this._drop();
      /* A beat's panel just opened. If this piece owes that beat a figure, it
         goes in now, under the beat's own prose. */
      this._sheetId = m.open ? String(m.id || '') : null;
      if (m.open === true && typeof m.id === 'string' && m.id.indexOf('tours:beat:') === 0) {
        this._wantPath(m.id.slice('tours:beat:'.length));
      } else if (m.open === false) {
        this._detachPath();
        /* ANOTHER SURFACE TOOK THE RAIL AND HAS NOW GIVEN IT BACK. Measured on
           the running app: the quiz offers Recall into the same sheet a beat
           later, and when it closes the shell restores the beat — but nothing
           tells this module to put its figure back, so a beat that carried a
           counted thing silently stopped carrying it. The intent is re-stated,
           not re-built: the cached node still holds the student's guess. */
        if (this.pathRunning && this._beatId) this._wantPath(this._beatId);
      }
    }));

    /* While the authored path is speaking, this piece is silent in the band —
       but not absent from the lesson: see ON_PATH. */
    this.d(bus.on('tours:beat', (p) => {
      this.pathRunning = true; this._say(null);
      this._beatId = (p && !p.exploring && !p.gate && !p.recall) ? p.id : null;
      this._wantPath(this._beatId);
    }));
    this.d(bus.on('tours:state', (p) => {
      this.pathRunning = !!(p && p.running && !p.exploring);
      if (this.pathRunning) this._say(null);
      if (!p || !p.running || p.exploring) { this._beatId = null; this._detachPath(); }
      else this._reAux();
    }));
    this.d(bus.on('viz:onpath:focus', () => this._focusPath()));
    this.d(() => this._detachPath());
    this.pathCache = new Map();

    /* ------------------------------------------------------ URL is state */
    this.d(store.watch((s) => (s.filters && s.filters.stage) || 'plate', () => this._ensureEntry()));
    this.d(store.watch((s) => (s.filters && s.filters.viz) || null, (v) => this._apply(v)));
    this._apply((store.getState().filters || {}).viz || null);

    bus.emit('viz:ready', { surfaces: [...this.surfaces.keys()] });
  },

  update(state, prev, changed) {
    if (changed.has('year') && this.live && this.live.api && this.live.api.onYear) this.live.api.onYear(state.year);
    if (changed.has('year') || changed.has('selectedTerritoryId') || changed.has('filters')) this._offer(state);
  },

  destroy() {
    this._drop();
    if (this.d) this.d.all();
  },

  /* ================================================== opening =========== */

  /** Everything goes through state, so the URL is never out of step. */
  _request(id) {
    const key = id ? String(id).replace(/:/g, '.') : null;
    if (id && !this.surfaces.has(String(id).replace(/\./g, ':'))) return;
    this.ctx.store.dispatch('setFilter', { viz: key });
  },

  _setFilter(v) { this.ctx.store.dispatch('setFilter', { viz: v }); },

  _apply(raw) {
    const id = raw ? String(raw).replace(/\./g, ':') : null;
    if (!id) {
      if (this.live) {
        const was = this.live.id;
        this._drop();
        this.ctx.bus.emit('ask:sheet', null);
        this.ctx.bus.emit('viz:closed', { id: was });
      }
      return;
    }
    if (this.live && this.live.id === id) return;      // idempotent: keep the guess
    const s = this.surfaces.get(id);
    if (!s) { this._setFilter(null); return; }
    this._drop();
    const api = s.build();
    this.live = { id, api };
    this.ctx.bus.emit('ask:sheet', { id: 'viz:' + id, eyebrow: s.eyebrow, title: s.title, node: api.node });
    if (this.entry) this.entry.setAttribute('aria-expanded', 'true');
    this._say(null);
    this.ctx.bus.emit('viz:opened', { id, defects: defectCount() });
    if (api.onYear) api.onYear(this.ctx.store.getState().year);
  },

  _drop() {
    if (this.entry) this.entry.setAttribute('aria-expanded', 'false');
    if (!this.live) return;
    try { if (this.live.api.destroy) this.live.api.destroy(); } catch (_) { /* a surface that cannot tidy up must not break the atlas */ }
    this.live = null;
  },

  /* ============================================== on the path =========== */
  /**
   * Called from both ends — the beat changed, or the beat's panel opened —
   * because on a narrow window the tour puts a `present` beat in the band and
   * only opens the panel when the student presses "Read this beat", and the
   * figure has to arrive in either order. Idempotent by construction.
   */
  _wantPath(beatId) {
    const hit = beatId ? ON_PATH.find((o) => o.beat === beatId) : null;
    if (!hit) { this._detachPath(); return; }
    if (this.path && this.path.beat === beatId && this.path.box.isConnected) return;
    this._pathWanted = hit;
    /* The tours module fills the sheet in the same tick it announces the beat,
       and on a narrow window it may not fill it at all until the student
       presses "Read this beat". A short retry ladder covers every order and
       every machine, and stops the moment it lands. A figure that appears on a
       fast laptop and not on a school Chromebook is a figure that is not on the
       path. */
    if (this._pathT) { for (const t of this._pathT) clearTimeout(t); }
    requestAnimationFrame(() => this._attachPath(hit));
    this._pathT = [60, 160, 360, 700, 1200].map((ms) => setTimeout(() => this._attachPath(hit), ms));
  },

  _attachPath(hit) {
    if (this._pathWanted !== hit) return;
    if (this.path && this.path.beat === hit.beat && this.path.box.isConnected) return;
    if (this.live) return;                       // a viz surface owns the rail
    const body = document.querySelector('.cx-sheet__body');
    if (!body) return;
    /* Only into a beat panel. If the rail is holding a dossier or an essay,
       this figure is not part of what the student is reading. */
    if (!body.querySelector('.tr-panel, [data-beat], .tr-beat')) {
      /* The tours panel's own class is not this module's to depend on, so the
         fallback is the sheet id the shell last announced, tracked below. */
      if (this._sheetId !== 'tours:beat:' + hit.beat) return;
    }
    if (this.path && this.path.beat !== hit.beat) this._detachPath();

    let entry = this.pathCache.get(hit.id);
    if (!entry) {
      const s = this.surfaces.get(hit.id);
      if (!s) return;
      const api = s.build({ onPath: true });
      const box = el('section.viz-onpath', { dataset: { onpath: hit.id, t: hit.t || '' } },
        el('p.viz-onpath__eyebrow', { text: hit.eyebrow }),
        el('h3.viz-onpath__h', { text: hit.title }),
        api.node);
      entry = { api, box };
      this.pathCache.set(hit.id, entry);
    }
    body.appendChild(entry.box);
    this.path = { beat: hit.beat, hit, box: entry.box, api: entry.api };
    this._reAux();
    this.ctx.bus.emit('viz:onPath', { id: hit.id, beat: hit.beat, t: hit.t || null });
  },

  /** One control in the tour's own bar, so a long beat never buries this. */
  _reAux() {
    if (!this.path) return;
    this.ctx.bus.emit('tours:aux', { label: this.path.hit.aux, emit: 'viz:onpath:focus' });
    this._auxMine = true;
  },

  _focusPath() {
    if (!this.path) return;
    /* Smooth only where smooth is wanted. DESIGN.md: paper does not glide. */
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.dataset.motion === 'reduced';
    try { this.path.box.scrollIntoView({ block: 'start', behavior: still ? 'auto' : 'smooth' }); } catch (_) { this.path.box.scrollIntoView(); }
    if (this.path.api && this.path.api.focus) this.path.api.focus();
  },

  _detachPath() {
    if (this._pathT) { for (const t of this._pathT) clearTimeout(t); this._pathT = null; }
    this._pathWanted = null;
    if (this._auxMine) { this.ctx.bus.emit('tours:aux', null); this._auxMine = false; }
    if (!this.path) return;
    /* The node is kept, not destroyed: a student who steps back to the beat
       must find the guess they already committed, not a fresh question. */
    if (this.path.box.parentNode) this.path.box.remove();
    this.path = null;
  },

  /* ================================================== the offer ========= */
  /**
   * How a reader who is not on the authored path finds any of this. One
   * sentence, in the shell's band, at priority 38 — below every content
   * sentence in the app, so it never takes the floor from a dossier, a change
   * card or a beat. It appears only once the reader has touched the atlas
   * (`data-stage` past `plate`), only in the years the surface is about, and
   * only once each per session.
   */
  _offer(state) {
    if (this.pathRunning) return;
    const stage = (state.filters && state.filters.stage) || 'plate';
    if (stage === 'plate') return;
    if (this.live) return;

    const sel = state.selectedTerritoryId;
    const hit = OFFERS.find((o) => (state.year >= o.from && state.year <= o.to)
      || (o.id === 'ratio:kenya' && sel === 'kenya'));
    if (!hit) { this._say(null); return; }
    if (this.offered.has(hit.id) && this.saidId !== hit.id) return;
    this.offered.add(hit.id);
    this._say(hit);
  },

  _say(offer) {
    if (!offer) {
      if (this.saidId) { this.ctx.bus.emit('ask:say', { id: 'viz:offer', text: null }); this.saidId = null; }
      return;
    }
    if (this.saidId === offer.id) return;
    this.saidId = offer.id;
    this.ctx.bus.emit('ask:say', {
      id: 'viz:offer', priority: 38, mark: offer.mark, text: offer.say,
      cta: { label: offer.label, emit: 'viz:open', payload: { id: offer.id } },
    });
  },
};
