/**
 * map/render.js — the plate.
 *
 * Canvas, because a 600-frame scrub has to hold its frame budget with 302 units
 * on screen. The interactive and accessible layer is DOM, over the top, built by
 * index.js; picking is a second canvas, in hit.js.
 *
 * How a frame is cheap:
 *   · geometry is flattened once into shared arrays (geometry.js);
 *   · each projection is applied once, into Float32Arrays of world coordinates;
 *   · the sea, graticule, land ghost and lakes are drawn into an offscreen
 *     canvas that only changes when the camera, projection, size or theme does;
 *   · scrubbing the year changes only the *paint*, so the Path2D cache and the
 *     base layer both survive, and a frame is 302 fills over one blit.
 *
 * What is drawn, in order: sea · graticule · land (never British) · lakes ·
 * unit fills · unit textures · coastlines · minimum-size marks for tiny units ·
 * hover, selection and focus outlines.
 */

import { projectAll, projectPoint, worldBox, frameBox, frameSpan, fullSpan, PLATE_FRAME, mixInto, WORLD_WIDTH, PROJECTION_IDS } from './projection.js';
import { patterns } from './texture.js';

/**
 * The tallest world box any projection in the registry makes, in world units.
 * Every projection is fitted against this one number, so the equatorial scale
 * is the same in all of them and the morph still shows the polar exaggeration
 * it exists to show. Computed once, from the projections themselves.
 */
let REF_H = 0;
function refHeight() {
  if (!REF_H) for (const id of PROJECTION_IDS) REF_H = Math.max(REF_H, worldBox(id).height);
  return REF_H;
}

const MIN_MARK_PX = 10;         // the reference minimum mark, on a full-size plate
const MIN_MARK_FLOOR = 6.5;     // and the floor it may fall to on a phone
const MARK_FULL_W = 900;        // the plate width at which the full 10px applies
const FIT = 0.98;

export class Plate {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.base = document.createElement('canvas');
    this.baseCtx = this.base.getContext('2d', { alpha: false });
    // A half-resolution copy of the same ground, used only while the projection
    // is morphing: filling and stroking every coastline in the world at full
    // resolution costs about 18ms a frame, and the ground is not the thing the
    // student is watching. The units stay at full resolution throughout.
    this.baseLo = document.createElement('canvas');
    this.baseLoCtx = this.baseLo.getContext('2d', { alpha: false });

    this.w = 0; this.h = 0; this.dpr = 1;
    /* A multiplier on the label type, for one caller only: the printed map
       sheet. On screen the size is derived from the plate's width, which is
       right for a screen and wrong for paper — a 2,000px export reproduced
       250mm wide puts a 13.5px name at about 5pt, which is the classroom
       reviewer's complaint about the printed plate ("labels come out at about
       5pt ... unreadable at the back of the room"). P20 asks for the sheet
       through `window.__map.printImage()`, which sets this. */
    this.labelScale = 1;
    // Paper the map may not use, because a panel of this module's own is
    // sitting on it. See setInsets().
    this.insets = { top: 0, right: 0, bottom: 0, left: 0 };
    /* HOW HARD THE WORLD IS PRESSED INTO THE PLATE. 1 contains the whole plate
       frame (64N-56S) inside the paper; above 1 the world is scaled past the
       fit and the edges are cropped. See setFill(). */
    this.fill = 1;
    this.view = { k: 1, x: 0, y: 0 };
    this.projFrom = 'equal-earth';
    this.projTo = 'equal-earth';
    this.t = 1;

    this.tokens = null;
    this.pat = null;
    this.paint = new Map();       // unitId -> paint record
    this.paintStamp = 0;          // bumped on every setPaint, so caches key off it
    this.stitch = false;          // the Stitching view: tiny units as fixed nodes
    this.weight = null;           // Map<unitId, scale> | null
    this.hover = null; this.selected = null; this.focus = null;
    this.selectedUnits = null;    // Set<unitId> of the selected territory

    this.geom = null;             // { lon, lat, n, shapes }
    this.land = null; this.lakes = null; this.grat = null;
    this.meta = null;             // Map<unitId, unitMeta>

    this._proj = new Map();       // key -> { x, y }
    this._bounds = new Map();     // key -> Map<id, [x0,y0,x1,y1,cx,cy]>
    this._scratch = null;
    this._baseScratch = new Map();
    this._paths = null;
    this._pathSig = '';
    this._baseSig = '';
    this._order = null;
    this.lastFrameMs = 0;
    this.frames = [];

    /**
     * Rectangles in CSS pixels that a mark may not be drawn under, because
     * something opaque is standing there. Round 2 shipped without these and
     * three of the seven places acceptance test 3 names — Barbados, Singapore,
     * Hong Kong Island — were drawn underneath the byline, the definition card
     * and a button, so a click on the dot pressed the button instead. A mark
     * that cannot be seen is not a mark. See markLayout().
     */
    this.obstacles = [];
    /** (unitId, rec) -> the words to draw on the plate, or null. Set by index.js. */
    this.labelText = null;
    /** [{a, b, km}] — the network drawn in the Stitching view. Set by index.js. */
    this.net = null;
    this.labelsDrawn = [];
  }

  /**
   * The paper a mark may not stand on.
   *
   * `rects` are in CSS pixels relative to the plate. They are treated exactly
   * like another mark in the deconfliction below: the anchor never moves, the
   * mark is pushed off it along a spiral, and a hairline leader stays behind
   * to say where the place really is.
   */
  setObstacles(rects) {
    const next = (rects || []).filter((r) => r && r.w > 4 && r.h > 4);
    const sig = next.map((r) => [r.x | 0, r.y | 0, r.w | 0, r.h | 0].join(',')).join(';');
    if (sig === this._obsSig) return false;
    this._obsSig = sig;
    this.obstacles = next;
    this._marks = null; this._markSig = '';
    return true;
  }

  /* ---- inputs ---------------------------------------------------------- */

  setGeometry({ units, land, lakes, graticule, meta }) {
    this.geom = units || this.geom;
    if (land !== undefined) this.land = land;
    if (lakes !== undefined) this.lakes = lakes;
    if (graticule !== undefined) this.grat = graticule;
    if (meta) this.meta = meta;
    this._proj.clear(); this._bounds.clear(); this._rings = new Map();
    this._scratch = null; this._baseScratch = new Map();
    this._paths = null; this._pathSig = ''; this._baseSig = '';
    this._order = null; this._orderSig = '';
    return this;
  }

  setTokens(tokens, dpr = this.dpr) {
    this.tokens = tokens;
    this.pat = patterns(tokens, dpr);
    this._baseSig = '';
    return this;
  }

  setSize(w, h, dpr) {
    if (w === this.w && h === this.h && dpr === this.dpr) return false;
    this.sizeChanges = (this.sizeChanges || 0) + 1;
    this.lastSize = [this.w, this.h, w, h];
    this.w = w; this.h = h; this.dpr = dpr;
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.base.width = this.canvas.width; this.base.height = this.canvas.height;
    this.baseLo.width = Math.max(1, Math.round(this.canvas.width / 2));
    this.baseLo.height = Math.max(1, Math.round(this.canvas.height / 2));
    if (this.tokens) this.pat = patterns(this.tokens, dpr);
    this._paths = null; this._pathSig = ''; this._baseSig = '';
    return true;
  }

  /**
   * The minimum mark, in CSS pixels, for THIS plate.
   *
   * 10px wherever the world is drawn 900px wide or more — which covers the
   * acceptance test at 1,000px and every uncluttered desktop. Below that it
   * tapers to 6.5px, because a 10px disc on a 390px phone is 2.6% of the width
   * of the world and eighty-six of them stop being marks and become the map.
   * It follows the width the world actually got, not the width of the plate,
   * since a plate with a legend standing on half of it draws a smaller world. Clickability does not depend on
   * this number: the pointer resolves a mark by nearest centre inside 22px, and
   * the focus target is 44px, at every plate size.
   */
  minMark(cam = null) {
    // The width the WORLD actually got, not the width of the plate. Since the
    // fit contains, a 1,440 × 458 stage draws a 478px world however wide the
    // plate is, and a 10px disc on a 478px world is 2% of the planet: eighty-
    // six of them stop being marks and become the map.
    const c = cam || this.camera();
    const w = Math.max(0, c.worldW / this.dpr);
    if (!w || w >= MARK_FULL_W) return MIN_MARK_PX;
    return Math.max(MIN_MARK_FLOOR, MIN_MARK_PX * (w / MARK_FULL_W));
  }

  setView(v) { this.view = { k: v.k, x: v.x, y: v.y }; return this; }
  setPaint(map) { this.paint = map; this.paintStamp++; this._marks = null; return this; }
  setStitch(on) { if (!!on === this.stitch) return this; this.stitch = !!on; this._marks = null; this._order = null; this._orderSig = ''; return this; }

  /**
   * Is this unit one of the 101 the geometry index itself calls `tiny`?
   *
   * Round 1 decided tininess from screen size alone, so at world zoom Wales,
   * the four Irish provinces and every Indian state collapsed into overlapping
   * discs — 202 of 243 marks on a phone — and erased the very shapes a student
   * needs. A minimum mark exists so that Gibraltar at 3.7 km² is not sub-pixel.
   * It does not exist to replace a real coastline that happens to be small at
   * this zoom, so it is now offered only to units the index flags.
   */
  isTiny(uid) {
    const m = this.meta && this.meta.get(uid);
    return !!(m && m.tiny);
  }
  setWeight(map) {
    const next = map || null;
    // Only throw the geometry caches away when the weighting actually changed.
    // A year scrub calls this every frame with null, and invalidating the
    // Path2D cache on each of those rebuilt 302 outlines for nothing.
    if (next === null && this.weight === null) return this;
    this.weight = next; this._pathSig = ''; this._order = null; this._marks = null;
    return this;
  }
  setProjectionState(from, to, t) {
    this.projFrom = from; this.projTo = to; this.t = t;
    // Mid-morph the map is in motion: detail below two device pixels cannot be
    // seen and is not drawn. Every mark, texture and coastline still is.
    this.morphing = t > 0 && t < 1;
    return this;
  }

  /**
   * The camera is being dragged, wheeled or pinched.
   *
   * A year scrub is cheap because the paint changes and the geometry does not:
   * the Path2D cache and the offscreen ground both survive, and a frame is
   * 0.5ms. A CAMERA scrub invalidates both, and rebuilding 302 outlines plus
   * the 44,638-point land layer at full resolution costs about 42ms a frame —
   * 24fps, which you can feel in your hand. So while the camera is actually in
   * motion the plate drops to the same level of detail it uses mid-morph:
   * segments under two device pixels are skipped, rings smaller than the ink
   * they would make are skipped, the graticule and lakes are suspended, and the
   * ground is composited at half resolution. Nothing that can be seen is
   * dropped, and the full-resolution frame is drawn the moment the hand stops.
   */
  setMotion(on) {
    const v = !!on;
    if (v === this.motion) return false;
    this.motion = v;
    this._baseSig = '';
    this._pathSig = '';
    return true;
  }

  /** True whenever detail below a couple of device pixels cannot be seen. */
  get moving() { return !!(this.morphing || this.motion); }
  set moving(v) { this.morphing = !!v; }

  /* ---- projection cache ------------------------------------------------ */

  _projected(id) {
    let p = this._proj.get(id);
    if (!p && this.geom) {
      p = projectAll(this.geom.lon, this.geom.lat, this.geom.n, id);
      this._proj.set(id, p);
    }
    return p;
  }

  _extraProjected(flat, id, key) {
    const k = key + ':' + id;
    let p = this._proj.get(k);
    if (!p && flat) { p = projectAll(flat.lon, flat.lat, flat.n, id); this._proj.set(k, p); }
    return p;
  }

  /**
   * Per-RING world bounds, cached per layer and projection. Level of detail:
   * the land layer is 44,638 points, most of them islands a fraction of a pixel
   * across at world zoom. Skipping rings smaller than the ink they would make
   * is what lets the projection morph hold its frame budget — nothing visible
   * is ever dropped, and every ring returns the moment it is big enough to see.
   */
  _ringBounds(flat, key) {
    const cacheKey = key + '#' + this.projFrom + '#' + this.projTo;
    let arr = this._rings && this._rings.get(cacheKey);
    if (arr) return arr;
    if (!this._rings) this._rings = new Map();
    const sets = [];
    const ids = this.projFrom === this.projTo ? [this.projTo] : [this.projFrom, this.projTo];
    for (const id of ids) {
      const p = flat === this.geom ? this._projected(id) : this._extraProjected(flat, id, key);
      if (p) sets.push(p);
    }
    if (!sets.length) return null;
    arr = new Map();
    for (const [uid, sh] of flat.shapes) {
      const out = new Float32Array(sh.rings.length * 4);
      for (let ri = 0; ri < sh.rings.length; ri++) {
        const r = sh.rings[ri];
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const p of sets) {
          for (let i = r.o, e = r.o + r.n; i < e; i++) {
            const vx = p.x[i], vy = p.y[i];
            if (vx < x0) x0 = vx; if (vx > x1) x1 = vx;
            if (vy < y0) y0 = vy; if (vy > y1) y1 = vy;
          }
        }
        out[ri * 4] = x0; out[ri * 4 + 1] = y0; out[ri * 4 + 2] = x1; out[ri * 4 + 3] = y1;
      }
      arr.set(uid, out);
    }
    this._rings.set(cacheKey, arr);
    return arr;
  }

  /** Per-unit world bounds and centroid for one projection. */
  _shapeBounds(id) {
    let m = this._bounds.get(id);
    if (m) return m;
    m = new Map();
    const p = this._projected(id);
    if (!p || !this.geom) { this._bounds.set(id, m); return m; }
    const { x, y } = p;
    for (const [uid, sh] of this.geom.shapes) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const r of sh.rings) {
        for (let i = r.o, e = r.o + r.n; i < e; i++) {
          const vx = x[i], vy = y[i];
          if (vx < x0) x0 = vx; if (vx > x1) x1 = vx;
          if (vy < y0) y0 = vy; if (vy > y1) y1 = vy;
        }
      }
      const meta = this.meta && this.meta.get(uid);
      let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      if (meta && Array.isArray(meta.centroid)) {
        const c = projectPoint(meta.centroid[0], meta.centroid[1], id);
        cx = c[0]; cy = c[1];
      }
      let px = cx, py = cy;
      if (meta && Array.isArray(meta.point)) {
        const q = projectPoint(meta.point[0], meta.point[1], id);
        px = q[0]; py = q[1];
      }
      m.set(uid, { x0, y0, x1, y1, cx, cy, px, py });
    }
    this._bounds.set(id, m);
    return m;
  }

  /** The world coordinates in force this frame (morph-aware). */
  _coords() {
    if (this.t <= 0) return this._projected(this.projFrom);
    if (this.t >= 1) return this._projected(this.projTo);
    const a = this._projected(this.projFrom), b = this._projected(this.projTo);
    if (!a || !b) return a || b;
    const n = this.geom.n;
    if (!this._scratch) this._scratch = { x: new Float32Array(n), y: new Float32Array(n) };
    mixInto(a.x, a.y, b.x, b.y, this.t, this._scratch.x, this._scratch.y, n);
    return this._scratch;
  }

  _boundsNow() {
    if (this.t <= 0) return this._shapeBounds(this.projFrom);
    if (this.t >= 1) return this._shapeBounds(this.projTo);
    const a = this._shapeBounds(this.projFrom), b = this._shapeBounds(this.projTo);
    const t = this.t, u = 1 - t, out = new Map();
    for (const [id, A] of a) {
      const B = b.get(id); if (!B) continue;
      out.set(id, {
        x0: A.x0 * u + B.x0 * t, y0: A.y0 * u + B.y0 * t,
        x1: A.x1 * u + B.x1 * t, y1: A.y1 * u + B.y1 * t,
        cx: A.cx * u + B.cx * t, cy: A.cy * u + B.cy * t,
        px: A.px * u + B.px * t, py: A.py * u + B.py * t,
      });
    }
    return out;
  }

  /* ---- camera ---------------------------------------------------------- */

  /**
   * Reserve the paper the definition card and the controls are standing on.
   *
   * Round 1 drew the world across the whole plate and then put an opaque card
   * over the right-hand fifth of it, so at a 1,000px plate Singapore and Hong
   * Kong Island — two of the seven places the acceptance test names — were
   * behind the card and could not be clicked at all. A printed atlas does not
   * do this: the key sits in the margin and the plate is drawn inside it. So
   * the camera now fits the world to the paper that is actually free.
   */
  setInsets(ins) {
    const next = {
      top: Math.max(0, ins.top || 0), right: Math.max(0, ins.right || 0),
      bottom: Math.max(0, ins.bottom || 0), left: Math.max(0, ins.left || 0),
    };
    const cur = this.insets;
    if (cur.top === next.top && cur.right === next.right && cur.bottom === next.bottom && cur.left === next.left) return false;
    this.insets = next;
    this._paths = null; this._pathSig = ''; this._baseSig = ''; this._marks = null;
    return true;
  }

  /**
   * ZOOM-TO-FILL, AND ITS CEILING.
   *
   * The plate frame is 2.37:1. Where the rectangle the shell hands this module
   * is wider than that the world fills its height and the sea runs to the left
   * and right edges, which is what a plate in an atlas looks like. Where the
   * rectangle is TALLER than that — a phone, in portrait, is 390 x 476 — the
   * world would otherwise be a 165px band floating in the middle of the sheet.
   * So the plate is scaled past the fit and the edges are cropped. It is
   * capped by `_layout()`, because past a very small crop the first things off
   * the sheet are the eastern Pacific coast of Canada on one edge and Fiji and
   * New Zealand on the other, and a map of a world empire may not lose Fiji to
   * a layout rule.
   */
  setFill(f) {
    const next = Math.max(1, Math.min(3, Number(f) || 1));
    if (Math.abs(next - this.fill) < 0.005) return false;
    this.fill = next;
    this._paths = null; this._pathSig = ''; this._baseSig = ''; this._marks = null;
    return true;
  }

  /** The frame's centre in world units, interpolated across a morph. */
  frameCentre() {
    const t = Math.max(0, Math.min(1, this.t)), u = 1 - t;
    return frameBox(this.projFrom).cy * u + frameBox(this.projTo).cy * t;
  }

  camera() {
    const a = worldBox(this.projFrom), b = worldBox(this.projTo);
    const t = Math.max(0, Math.min(1, this.t)), u = 1 - t;
    const height = a.height * u + b.height * t;
    const dpr = this.dpr;
    const ins = this.insets;
    const availW = Math.max(120, this.w - ins.left - ins.right);
    /* AND THE FLOOR ON THE HEIGHT IS 40, NOT 120.
       The camera centres the world at `availH / 2`, so a floor above the
       rectangle's real height does not protect anything — it moves the plate.
       Measured at 390x844 inside beat 17 with the peek strip open
       (`html[data-tour-fit="text"]`): the canvas was 390x70, this said 120,
       and the world was drawn centred 60px down a 70px band — 25px low, with
       the Punjab the beat is about pushed under the bottom edge and Kashmir
       filling the strip. The floor exists to stop a division by a degenerate
       box while the shell is still settling; 40 does that and 120 lies about
       any band shorter than itself. RESPONSIVE_LAW F2 floors the map at 40. */
    const availH = Math.max(40, this.h - ins.top - ins.bottom);
    // THE FIT, AND WHY IT CHANGED AGAIN IN ROUND 5.
    //
    // Round 4 contained the whole 1000 x 939 Mercator box inside the paper. On
    // the stage this app actually has — 1920 x 491, because the timeline under
    // the map is 500px tall — that drew the world 522px wide: 27.9% of the
    // plate, land on 12.6% of the pixels, India twenty pixels across. Measured
    // in a browser, that is the single reason a printed chapter beat this map.
    //
    // The fit is now against the PLATE FRAME (projection.js): 64 degrees north
    // to 56 degrees south, the band a British Empire atlas has to show. Its
    // aspect is 2.37:1, so the same 1920 x 491 strip draws the world 1164px
    // wide — 61% — and on any plate taller than about 0.42 x its width the
    // world fills the paper edge to edge. Nunavut, Yukon, Iceland and
    // Antarctica fall outside the default framing; the minus key zooms out
    // past it, the crop is printed on the card, and nothing is unreachable.
    //
    // ROUND 6: and the frame is now the whole rectangle the shell guarantees,
    // so `availW x availH` IS the plate and this fit has no paper margin left
    // to give away. `this.fill` presses the world further into a rectangle
    // taller than the world band. See setFill().
    const base = Math.min(availW / WORLD_WIDTH, availH / frameSpan()) * (this.fill || 1);

    const s = base * this.view.k * dpr;
    const cy = this.frameCentre();
    const ox = (ins.left + availW / 2) * dpr - this.view.x * WORLD_WIDTH * s;
    const oy = (ins.top + availH / 2) * dpr - (cy + this.view.y * height) * s;
    return { s, ox, oy, base, height, cy, availW, availH, worldW: WORLD_WIDTH * s, worldH: height * s };
  }

  /** Screen (CSS px) position of a world point. */
  toScreen(wx, wy, cam = this.camera()) {
    return [(wx * cam.s + cam.ox) / this.dpr, (wy * cam.s + cam.oy) / this.dpr];
  }

  /** Screen position of a unit's label point, and its screen extent. */
  unitScreen(unitId, cam = this.camera()) {
    const b = this._boundsNow().get(unitId);
    if (!b) return null;
    const d = this.dpr;
    const sc = this.weight && this.weight.has(unitId) ? this.weight.get(unitId) : 1;
    const x0 = ((b.cx + (b.x0 - b.cx) * sc) * cam.s + cam.ox) / d;
    const x1 = ((b.cx + (b.x1 - b.cx) * sc) * cam.s + cam.ox) / d;
    const y0 = ((b.cy + (b.y0 - b.cy) * sc) * cam.s + cam.oy) / d;
    const y1 = ((b.cy + (b.y1 - b.cy) * sc) * cam.s + cam.oy) / d;
    // The mark anchor is NEVER scaled. Weight mode grows the mark about its
    // own position, so a re-encoding can never move a place on the map.
    const ax = (b.px * cam.s + cam.ox) / d;
    const ay = (b.py * cam.s + cam.oy) / d;
    const mark = this.paint.has(unitId) ? this.markLayout(cam).get(unitId) : null;
    return {
      x0, y0, x1, y1,
      w: x1 - x0, h: y1 - y0,
      px: ax, py: ay,
      // Where the mark actually sits after deconfliction; equal to the anchor
      // whenever nothing had to move.
      mx: mark ? mark.x : ax,
      my: mark ? mark.y : ay,
      mr: mark ? mark.r : 0,
      moved: !!(mark && mark.moved),
      tiny: !!mark,
    };
  }

  /* ---- minimum marks, and keeping them off each other ------------------ */

  /**
   * Where each minimum-size mark is actually drawn, in CSS pixels.
   *
   * Two rules, in this order.
   *   · A mark is offered only to a unit the index flags `tiny`, and only while
   *     its own outline is smaller than the mark would be.
   *   · Marks may not sit on top of each other. Nine of them land inside 30px
   *     around the Irish Sea and eleven more down the Lesser Antilles; drawn at
   *     their true points they become one blob that hides England, Scotland and
   *     Ireland underneath. So an overlapping mark is pushed off its anchor
   *     along a spiral and keeps a hairline leader back to where it belongs.
   *     The anchor never moves — the leader is what makes the displacement
   *     readable as a displacement rather than as a location.
   */
  markLayout(cam = this.camera()) {
    const sig = this._sig(cam) + '|' + this.paintStamp + '|' + (this.stitch ? 's' : '') + '|' + this.w + 'x' + this.h + '|' + (this._obsSig || '');
    if (this._marks && this._markSig === sig) return this._marks;
    const bounds = this._boundsNow();
    const d = this.dpr;
    const list = [];
    for (const [uid, rec] of this.paint) {
      /* A DESTROYED RECORD IS NEVER SUB-PIXEL. Tiny units have always been
         guaranteed a minimum mark; a silence had to be a tiny unit to get one,
         so at world zoom a hole in a small province was drawn at whatever size
         the projection gave it, which for several is under two pixels. The
         floor now follows the CONTENT, not only the geometry index: if the
         shape the record was destroyed in cannot be seen, the destruction
         cannot be seen either. Anything already big enough falls through the
         `own >= min` test below and is drawn as itself. */
      if (!this.isTiny(uid) && !(rec && rec.mode === 'hole')) continue;
      const b = bounds.get(uid);
      if (!b) continue;
      const sc = this.weight && this.weight.has(uid) ? this.weight.get(uid) : 1;
      const own = Math.max(b.x1 - b.x0, b.y1 - b.y0) * sc * cam.s / d;
      const min = this.minMark(cam);
      if (own >= min && !this.stitch) continue;               // its own outline is enough
      const x = (b.px * cam.s + cam.ox) / d;
      const y = (b.py * cam.s + cam.oy) / d;
      if (x < -80 || y < -80 || x > this.w + 80 || y > this.h + 80) continue;
      const r = (min / 2) * (this.weight ? Math.min(6, Math.max(1, sc)) : 1);
      list.push({ uid, rec, ax: x, ay: y, x, y, r, moved: false });
    }
    // Biggest first, so a weighted mark keeps its true position and the small
    // ones move around it.
    list.sort((a, b) => (b.r - a.r) || (a.uid < b.uid ? -1 : 1));
    const placed = [];
    const obs = this.obstacles;
    const underPanel = (m, x, y) => {
      for (const o of obs) {
        if (x + m.r > o.x - 2 && x - m.r < o.x + o.w + 2
          && y + m.r > o.y - 2 && y - m.r < o.y + o.h + 2) return true;
      }
      return false;
    };
    const onPlate = (m, x, y) => x > m.r + 1 && y > m.r + 1 && x < this.w - m.r - 1 && y < this.h - m.r - 1;
    const free = (m, x, y) => {
      for (const p of placed) {
        const dx = p.x - x, dy = p.y - y;
        const need = p.r + m.r + 1.5;
        if (dx * dx + dy * dy < need * need) return false;
      }
      return !underPanel(m, x, y);
    };
    /**
     * HOW FAR A MARK MAY TRAVEL, AND WHY THERE IS NOW A CEILING.
     *
     * Round 3's spiral ran 26 rings — up to about 570px — and in the Lesser
     * Antilles, where eleven marks land inside 20px of each other, it used all
     * of them: Barbados, Trinidad, Antigua and Suriname were drawn 1,000 to
     * 1,500 km out in the open Atlantic on crossing leader lines, and with a
     * dossier open twenty-odd leaders fanned across the ocean into Brazil. A
     * mark that has travelled 1,500 km is no longer a displaced mark; it is a
     * wrong mark with an alibi.
     *
     * The ceiling is a small multiple of the mark itself, so a cluster of
     * eleven can still open out into a legible rosette and nothing can drift
     * into another sea. A mark that cannot find free paper inside the ceiling
     * stays exactly where it belongs and is allowed to overlap its neighbour,
     * because two dots touching is a smaller lie than one dot in Brazil.
     */
    const shiftCap = Math.max(26, Math.min(64, this.minMark(cam) * 5.5));
    const withinCap = (m, x, y) => {
      const dx = x - m.ax, dy = y - m.ay;
      return dx * dx + dy * dy <= shiftCap * shiftCap;
    };
    for (const m of list) {
      if (!free(m, m.x, m.y)) {
        let done = false;
        // A panel is 300px across and a neighbouring mark is 10px across, so
        // escaping the two is not the same problem. A mark standing under a
        // panel is first pushed straight out of it by the SHORTEST edge:
        // Singapore under the definition card leaves by the card's bottom edge,
        // 40px from where it belongs, instead of spiralling 170px into the
        // Arabian Sea. The spiral below is the fallback, not the first move.
        for (const o of obs) {
          if (done) break;
          if (!(m.ax + m.r > o.x - 2 && m.ax - m.r < o.x + o.w + 2
            && m.ay + m.r > o.y - 2 && m.ay - m.r < o.y + o.h + 2)) continue;
          const pad = m.r + 4;
          // ROUND 5: THE EXIT IS NOW A LINE, NOT A POINT — and that is what
          // made eleven places in the Lesser Antilles reachable again. A
          // panel is 266 x 150; when a whole cluster has to leave one, every
          // member aims at the same perpendicular foot, the first one takes
          // it, and the rest fall back to a spiral that cannot clear a 150px
          // card. So each edge is tried ALONG its length: the cluster opens
          // into a row just outside the panel, each dot keeping its leader
          // back to where the place actually is. Round 4 left Barbados under
          // the byline, where a click never reached the map at all.
          const edges = [
            { d: m.ax - (o.x - pad), at: (t) => [o.x - pad, m.ay + t] },
            { d: (o.x + o.w + pad) - m.ax, at: (t) => [o.x + o.w + pad, m.ay + t] },
            { d: m.ay - (o.y - pad), at: (t) => [m.ax + t, o.y - pad] },
            { d: (o.y + o.h + pad) - m.ay, at: (t) => [m.ax + t, o.y + o.h + pad] },
          ].sort((p, q) => p.d - q.d);
          // A mark may leave a panel by up to a fifth of the plate: a visible,
          // leadered move, and nothing like a crossing of the Atlantic.
          const exitCap = Math.min(shiftCap * 3, this.w * 0.22, this.h * 0.34);
          const stride = m.r * 2 + 3;
          for (const e of edges) {
            if (done) break;
            if (e.d > exitCap) continue;
            for (let k = 0; k <= 9 && !done; k++) {
              for (const sgn of (k === 0 ? [0] : [1, -1])) {
                const [x, y] = e.at(sgn * k * stride);
                if (!onPlate(m, x, y)) continue;
                if (Math.hypot(x - m.ax, y - m.ay) > exitCap) continue;
                if (free(m, x, y)) { m.x = x; m.y = y; m.moved = true; done = true; break; }
              }
            }
          }
        }
        // The spiral, bounded. It still prefers the nearest free paper, so a
        // mark travels only as far as it must, and never past the ceiling.
        for (let step = 1; step <= 9 && !done; step++) {
          const rad = (m.r * 2 + 2.0) * step;
          if (rad > shiftCap) break;
          for (let a = 0; a < 12; a++) {
            const ang = a * (Math.PI / 6) + step * 0.55;
            const x = m.ax + Math.cos(ang) * rad;
            const y = m.ay + Math.sin(ang) * rad;
            if (!onPlate(m, x, y) || !withinCap(m, x, y)) continue;
            if (free(m, x, y)) { m.x = x; m.y = y; m.moved = true; done = true; break; }
          }
        }
        // Nowhere inside the ceiling. Stand your ground: no leader, no lie.
        if (!done) { m.x = m.ax; m.y = m.ay; m.moved = false; }
      }
      placed.push(m);
    }
    const out = new Map();
    let moved = 0, worst = 0;
    for (const m of placed) {
      out.set(m.uid, m);
      if (m.moved) { moved++; worst = Math.max(worst, Math.hypot(m.x - m.ax, m.y - m.ay)); }
    }
    // The legend has to be able to say that a dot is not where the place is.
    out.movedCount = moved;
    out.worstShiftPx = Math.round(worst);
    this._marks = out; this._markSig = sig;
    return out;
  }

  /* ---- paths ----------------------------------------------------------- */

  _sig(cam) {
    return [this.projFrom, this.projTo, this.t.toFixed(3), cam.s.toFixed(4),
      cam.ox.toFixed(2), cam.oy.toFixed(2), this.weight ? this.weight.size + ':' + (this.weight.get('__v') || '') : '0'].join('|');
  }

  _buildPaths(cam) {
    this.pathBuilds = (this.pathBuilds || 0) + 1;
    const coords = this._coords();
    if (!coords || !this.geom) { this._paths = new Map(); return; }
    const { x, y } = coords;
    const bounds = this._boundsNow();
    const s = cam.s, ox = cam.ox, oy = cam.oy;
    const eps = this.moving ? 2.0 : 0.55;    // device px: drop invisible detail
    const minRing = this.moving ? 2.5 : 0.7;
    const rings = this._ringBounds(this.geom, 'units');
    const out = new Map();
    // Cull off-screen units. At world zoom this drops nothing; zoomed to k=10
    // on Gibraltar it drops nearly all 302, and a wheel step stops costing
    // 21ms of building outlines for coastlines that are four screens away.
    // Everything downstream already tolerates a missing path: the draw loop,
    // the outline ring and the picker all check for it.
    const mx = 200 * this.dpr;
    const vx0 = -mx, vy0 = -mx, vx1 = this.canvas.width + mx, vy1 = this.canvas.height + mx;
    for (const [uid, sh] of this.geom.shapes) {
      const b = bounds.get(uid);
      const sc = this.weight && this.weight.has(uid) ? this.weight.get(uid) : 1;
      const cx = b ? b.cx : 0, cy = b ? b.cy : 0;
      if (b) {
        const bx0 = (cx + (b.x0 - cx) * sc) * s + ox, bx1 = (cx + (b.x1 - cx) * sc) * s + ox;
        const by0 = (cy + (b.y0 - cy) * sc) * s + oy, by1 = (cy + (b.y1 - cy) * sc) * s + oy;
        if (bx1 < vx0 || bx0 > vx1 || by1 < vy0 || by0 > vy1) continue;
      }
      const rb = rings && rings.get(uid);
      const p = new Path2D();
      for (let ri = 0; ri < sh.rings.length; ri++) {
        const r = sh.rings[ri];
        if (rb && sh.rings.length > 1) {
          const w = (rb[ri * 4 + 2] - rb[ri * 4]) * sc * s;
          const h = (rb[ri * 4 + 3] - rb[ri * 4 + 1]) * sc * s;
          if (Math.max(w, h) < minRing) continue;
        }
        let lx = 0, ly = 0, started = false, drawn = 0;
        for (let i = r.o, e = r.o + r.n; i < e; i++) {
          const wx = sc === 1 ? x[i] : cx + (x[i] - cx) * sc;
          const wy = sc === 1 ? y[i] : cy + (y[i] - cy) * sc;
          const sx = wx * s + ox, sy = wy * s + oy;
          if (!started) { p.moveTo(sx, sy); lx = sx; ly = sy; started = true; drawn = 1; continue; }
          const dx = sx - lx, dy = sy - ly;
          if (i < e - 1 && dx * dx + dy * dy < eps * eps) continue;
          p.lineTo(sx, sy); lx = sx; ly = sy; drawn++;
        }
        if (drawn > 2) p.closePath();
      }
      out.set(uid, p);
    }
    this._paths = out;
  }

  paths(cam = this.camera()) {
    const sig = this._sig(cam);
    if (sig !== this._pathSig || !this._paths) { this._buildPaths(cam); this._pathSig = sig; }
    return this._paths;
  }

  _pathOf(flat, id, coords, cam) {
    const sh = flat && flat.shapes.get(id);
    if (!sh) return null;
    const { x, y } = coords;
    const s = cam.s, ox = cam.ox, oy = cam.oy;
    const p = new Path2D();
    const eps = this.moving ? 2.4 : 0.55;
    const minRing = this.moving ? 3.0 : 0.7;
    const rings = this._ringBounds(flat, id);
    const rb = rings && rings.get(id);
    for (let ri = 0; ri < sh.rings.length; ri++) {
      const r = sh.rings[ri];
      if (rb) {
        const rw = (rb[ri * 4 + 2] - rb[ri * 4]) * s;
        const rh = (rb[ri * 4 + 3] - rb[ri * 4 + 1]) * s;
        if (Math.max(rw, rh) < minRing) continue;
      }
      let lx = 0, ly = 0, started = false, drawn = 0;
      for (let i = r.o, e = r.o + r.n; i < e; i++) {
        const sx = x[i] * s + ox, sy = y[i] * s + oy;
        if (!started) { p.moveTo(sx, sy); lx = sx; ly = sy; started = true; drawn = 1; continue; }
        const dx = sx - lx, dy = sy - ly;
        if (i < e - 1 && dx * dx + dy * dy < eps * eps) continue;
        p.lineTo(sx, sy); lx = sx; ly = sy; drawn++;
      }
      if (drawn > 2) p.closePath();
    }
    return p;
  }

  /* ---- the base layer -------------------------------------------------- */

  /**
   * Sea, graticule, land ghost and lakes. Cached in an offscreen canvas because
   * scrubbing the year does not change any of it — but drawn straight onto the
   * plate mid-morph, when it changes every frame and the offscreen round trip
   * would be a full-canvas blit bought for nothing.
   */
  _drawBase(camIn, lo = false) {
    this.baseDraws = (this.baseDraws || 0) + 1;
    const sig = this._sig(camIn) + '|' + this.w + 'x' + this.h + '|' + (this.tokens ? this.tokens.sea : '');
    if (!lo && sig === this._baseSig) return;
    this._baseSig = lo ? '' : sig;
    const g = lo ? this.baseLoCtx : this.baseCtx, T = this.tokens;
    const d = lo ? this.dpr / 2 : this.dpr;
    const cam = lo ? { ...camIn, s: camIn.s / 2, ox: camIn.ox / 2, oy: camIn.oy / 2 } : camIn;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = T.sea || '#BCD8EB';
    g.fillRect(0, 0, lo ? this.baseLo.width : this.base.width, lo ? this.baseLo.height : this.base.height);

    const mkCoords = (flat, key) => {
      if (!flat) return null;
      if (this.t <= 0) return this._extraProjected(flat, this.projFrom, key);
      if (this.t >= 1) return this._extraProjected(flat, this.projTo, key);
      const a = this._extraProjected(flat, this.projFrom, key);
      const b = this._extraProjected(flat, this.projTo, key);
      if (!a || !b) return a || b;
      const n = flat.n;
      let sc = this._baseScratch.get(key);          // reused, never reallocated
      if (!sc || sc.x.length !== n) { sc = { x: new Float32Array(n), y: new Float32Array(n) }; this._baseScratch.set(key, sc); }
      mixInto(a.x, a.y, b.x, b.y, this.t, sc.x, sc.y, n);
      return sc;
    };

    // graticule — a hairline grid, drawn under the land. Suppressed mid-morph:
    // it is a reference grid, and during 560ms of motion it is only cost.
    if (this.grat && !this.moving) {
      const c = mkCoords(this.grat, 'grat');
      const sh = this.grat.shapes.get('graticule');
      if (c && sh) {
        g.strokeStyle = T.graticule || 'rgba(45,34,20,.10)';
        g.lineWidth = Math.max(0.5, 0.5 * d);
        g.beginPath();
        for (const r of sh.rings) {
          for (let i = r.o, e = r.o + r.n; i < e; i++) {
            const sx = c.x[i] * cam.s + cam.ox, sy = c.y[i] * cam.s + cam.oy;
            if (i === r.o) g.moveTo(sx, sy); else g.lineTo(sx, sy);
          }
        }
        g.stroke();
      }
    }

    // land: every coast in the world, in the "not British" fill
    if (this.land) {
      const c = mkCoords(this.land, 'land');
      const p = c && this._pathOf(this.land, 'land', c, cam);
      if (p) {
        g.fillStyle = T.ground || T.fills['never-british'];
        g.fill(p, 'evenodd');
        g.strokeStyle = T.coast || '#6E7F8C';
        g.lineWidth = Math.max(1, 1 * d);
        g.stroke(p);
      }
    }
    if (this.lakes && !this.moving) {
      const c = mkCoords(this.lakes, 'lakes');
      const p = c && this._pathOf(this.lakes, 'lakes', c, cam);
      if (p) { g.fillStyle = T.sea; g.fill(p, 'evenodd'); g.strokeStyle = T.coast; g.lineWidth = Math.max(1, d); g.stroke(p); }
    }
  }

  /* ---- the frame ------------------------------------------------------- */

  drawOrder() {
    const sig = this.weight ? 'w' + this.weight.size + ':' + this._pathSig : 'plain';
    if (this._order && this._orderSig === sig) return this._order;
    const b = this._shapeBounds(this.projTo);
    const w = this.weight;
    const ids = [...this.geom.shapes.keys()];
    const areaOf = (id) => {
      const A = b.get(id); if (!A) return 0;
      const s = w && w.has(id) ? w.get(id) : 1;
      return (A.x1 - A.x0) * (A.y1 - A.y0) * s * s;
    };
    ids.sort((p, q) => areaOf(q) - areaOf(p));   // big first, so small land on top
    this._order = ids;
    this._orderSig = sig;
    return ids;
  }

  draw() {
    if (!this.geom || !this.tokens) return;
    const t0 = performance.now();
    const cam = this.camera();
    const g = this.ctx, T = this.tokens, d = this.dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    if (this.moving) {
      this._drawBase(cam, true);
      g.drawImage(this.baseLo, 0, 0, this.canvas.width, this.canvas.height);
    } else {
      this._drawBase(cam);
      g.drawImage(this.base, 0, 0);
    }

    const paths = this.paths(cam);
    const order = this.drawOrder();
    const bounds = this._boundsNow();
    const coastW = Math.max(1, Math.round(1 * d));
    const pat = this.pat;
    if (this.stitch) g.globalAlpha = 0.22;      // landmasses ghosted; the dots speak

    const marks = this.markLayout(cam);
    for (let i = 0; i < order.length; i++) {
      const uid = order[i];
      const rec = this.paint.get(uid);
      if (!rec) continue;
      const p = paths.get(uid);
      if (!p) continue;
      // In the Stitching view the landmasses are ghosted and the dots carry the
      // reading, so a unit that has a mark does not also draw its outline fill.
      if (this.stitch && marks.has(uid)) continue;
      this._paintShape(g, p, rec, pat, T, coastW);
    }

    g.globalAlpha = 1;
    // The network between the stitching nodes, under the dots.
    if (this.stitch && this.net && this.net.length) this._drawNetLines(g, marks, T, d);
    // Minimum-size marks: 101 units are smaller than a pixel at world zoom.
    // Gibraltar decided the Mediterranean; it is not allowed to vanish.
    // Leaders first, under every mark, so no line crosses a disc.
    let anyMoved = false;
    for (const m of marks.values()) if (m.moved) { anyMoved = true; break; }
    if (anyMoved) {
      g.save();
      // A leader is what turns a displacement into a statement. The further a
      // mark had to travel to get out from under somebody's panel, the more
      // the line has to be seen, or the student reads the new position as the
      // place.
      g.strokeStyle = T.inkMuted || T.coast;
      g.lineWidth = Math.max(0.8, 0.8 * d);
      g.beginPath();
      for (const m of marks.values()) {
        if (!m.moved) continue;
        // Never a leader with one end off the paper: round 3 drew three lines
        // that ran off the left edge and terminated at nothing.
        if (m.ax < 0 || m.ay < 0 || m.ax > this.w || m.ay > this.h) continue;
        g.moveTo(m.ax * d, m.ay * d);
        g.lineTo(m.x * d, m.y * d);
      }
      g.stroke();
      // A one-pixel tick on the true position, so the anchor is still a place.
      g.fillStyle = T.inkMuted || T.ink;
      for (const m of marks.values()) {
        if (!m.moved) continue;
        if (m.ax < 0 || m.ay < 0 || m.ax > this.w || m.ay > this.h) continue;
        g.beginPath(); g.arc(m.ax * d, m.ay * d, Math.max(0.8, 0.7 * d), 0, 6.28319); g.fill();
      }
      g.restore();
    }
    for (const m of marks.values()) {
      const disc = new Path2D();
      disc.arc(m.x * d, m.y * d, m.r * d, 0, 6.28319);
      this._paintShape(g, disc, m.rec, pat, T, coastW, true);
    }

    // In the Stitching view the dataset's own tags say which of these dots were
    // coaling stations, naval bases and chokepoints. Those get a second ring.
    if (this.stitch) {
      g.save();
      g.strokeStyle = T.ink;
      g.lineWidth = Math.max(1, 0.9 * d);
      for (const m of marks.values()) {
        if (!m.rec || !m.rec.stitchKind) continue;
        g.beginPath(); g.arc(m.x * d, m.y * d, (m.r + 3) * d, 0, 6.28319); g.stroke();
      }
      g.restore();
    }

    // Informal empire keeps a node where the pressure was applied — a mark, not
    // a territory. It carries no magnitude, and nothing here pretends it does.
    for (const [uid, rec] of this.paint) {
      if (!rec.node) continue;
      const b = bounds.get(uid); if (!b) continue;
      const x = b.px * cam.s + cam.ox, y = b.py * cam.s + cam.oy;
      g.save();
      g.strokeStyle = T.inkMuted || T.coast;
      g.lineWidth = Math.max(1.5, d);
      g.setLineDash([]);
      g.beginPath(); g.arc(x, y, 6 * d, 0, 6.28319); g.stroke();
      g.fillStyle = T.inkMuted || T.coast;
      g.beginPath(); g.arc(x, y, 1.9 * d, 0, 6.28319); g.fill();
      g.restore();
    }

    this._drawOutlines(g, paths, bounds, cam, T, d);
    // Names first, distances into whatever paper is left: a station with no
    // name is a dot, and a leg with no number is still a line you can see.
    const used = this._drawLabels(g, marks, bounds, cam, T, d);
    if (this.stitch && this.net && this.net.length) this._drawNetDistances(g, marks, T, d, used);
    this.lastFrameMs = performance.now() - t0;
    this.frames.push(this.lastFrameMs);
    if (this.frames.length > 1200) this.frames.shift();
  }

  /**
   * The network in the Stitching view.
   *
   * NOT a route. `net` is a minimum spanning tree over the stations the dataset
   * itself tags, joined by great-circle distance computed from this atlas's own
   * centroids — the shortest set of legs that connects every station to the
   * rest. The construction is stated in the card in those words, because the
   * one thing this plate may not do is draw a cable Britain laid and call it
   * evidence. The shape it makes is the argument: the stations are not
   * scattered, they run in a line from the Channel to the China Sea.
   */
  _drawNetLines(g, marks, T, d) {
    g.save();
    g.strokeStyle = T.ink;
    g.globalAlpha = 0.5;
    g.lineWidth = Math.max(1, 0.9 * d);
    g.setLineDash([Math.max(4, 3.5 * d), Math.max(3, 3 * d)]);
    g.beginPath();
    for (const leg of this.net) {
      const a = marks.get(leg.a), b = marks.get(leg.b);
      if (!a || !b) continue;
      g.moveTo(a.x * d, a.y * d);
      g.lineTo(b.x * d, b.y * d);
    }
    g.stroke();
    g.restore();

  }

  /** The distance on each leg, where there is room for it after the names. */
  _drawNetDistances(g, marks, T, d, used) {
    // The distance on each leg, where there is room for it. This is the number
    // the coursebook's sentence about a system of communications is missing.
    const px = Math.max(9, Math.min(12, 10 * (this.w / 900)));
    g.save();
    g.font = `${Math.round(px * d)}px ${T.fontFigures || T.fontSans || 'system-ui, sans-serif'}`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const taken = (used || []).slice();
    const legs = this.net.slice().sort((p, q) => q.km - p.km);
    for (const leg of legs) {
      const a = marks.get(leg.a), b = marks.get(leg.b);
      if (!a || !b) continue;
      const x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      const text = Math.round(leg.km).toLocaleString('en-GB') + ' km';
      const wpx = g.measureText(text).width / d;
      const box = { x: x - wpx / 2 - 3, y: y - px / 2 - 2, w: wpx + 6, h: px + 4 };
      if (box.x < 2 || box.y < 2 || box.x + box.w > this.w - 2 || box.y + box.h > this.h - 2) continue;
      if (this._hits(box, taken) || this._underObstacle(box)) continue;
      taken.push(box);
      g.fillStyle = T.labelHalo || T.paper;
      g.fillRect(box.x * d, box.y * d, box.w * d, box.h * d);
      g.fillStyle = T.inkMuted || T.ink;
      g.fillText(text, x * d, (y + 0.5) * d);
    }
    g.restore();
  }

  _hits(box, taken) {
    for (const t of taken) {
      if (box.x < t.x + t.w && box.x + box.w > t.x && box.y < t.y + t.h && box.y + box.h > t.y) return true;
    }
    return false;
  }

  _underObstacle(box) {
    for (const o of this.obstacles) {
      if (box.x < o.x + o.w && box.x + box.w > o.x && box.y < o.y + o.h && box.y + box.h > o.y) return true;
    }
    return false;
  }

  /**
   * Names, on the plate.
   *
   * Round 2 drew no words at any zoom, so the map was a field of coloured
   * shapes a student could only name by clicking them one at a time — which
   * makes a printed plate with fifty engraved names strictly better at the one
   * thing a map is for. A map with no names is not a map; it is a diagram.
   *
   * The rules: the year's own name (names.js), never the successor state's; a
   * fixed budget scaled to the plate, biggest shape first, so the labels a
   * student gets are the ones they can act on; nothing drawn under a panel or
   * over another label; the selection, the focus and the hover always labelled
   * whatever their size; and in the Stitching view every tagged station named,
   * because in that view the dots ARE the subject.
   */
  _drawLabels(g, marks, bounds, cam, T, d) {
    this.labelsDrawn = [];
    if (!this.labelText || this.moving) return;
    const px = Math.max(10, Math.min(13.5, 11 * (this.w / 900) + 2.5)) * (this.labelScale || 1);
    // The budget follows the AREA of the plate, not its width: a 1440 x 608
    // enlarged plate has room for half as many names again as a 1440 x 329
    // strip, and a strip that spends its whole budget on Canada and Australia
    // stops naming Gibraltar and Barbados, which is the other half of the
    // charge this module answers.
    /* ROUND 6 — THE BUDGET FOLLOWS THE WORLD, NOT THE PAPER.
       On a phone in portrait the plate is 390 x 476 and the inhabited band of
       the world inside it — 64 N to 56 S, which is where every name is — is
       390 x 165. Spending a 476-pixel budget of names inside a 165-pixel band
       is what the reviewer saw: "the bottom third of the plate is empty
       Southern Ocean while labels collide in the top half", seventeen names
       stacked three deep over Canada while the Southern Ocean carried none.
       The budget is now taken against the height the band actually occupies,
       capped at the plate: 17 names becomes 10 on a phone and nothing changes
       on any desktop, where the band already fills the plate's height. Zooming
       in raises the band above the plate and the cap holds it at the paper. */
    const bandH = Math.min(this.h, Math.max(60, frameSpan() * cam.s / d));
    const budget = Math.max(7, Math.min(44, Math.round(Math.sqrt(this.w * bandH) / 25)));
    const ghostBudget = Math.max(2, Math.round(budget * 0.22));
    let ghosts = 0;
    // The distance labels on the stitching network were drawn first; a name
    // laid over one of them makes both unreadable.
    const taken = [];
    // Reserve the panels so a name is never half under the legend.
    const cands = [];
    const seen = new Set();
    const push = (uid, priority) => {
      if (!uid || seen.has(uid)) return;
      const rec = this.paint.get(uid);
      if (!rec) return;
      seen.add(uid);
      const m = marks.get(uid);
      const b = bounds.get(uid);
      if (!m && !b) return;
      const sc = this.weight && this.weight.has(uid) ? this.weight.get(uid) : 1;
      let x, y, area, above;
      if (m) {
        x = m.x; y = m.y - m.r - 2; area = m.r * m.r * 4; above = true;
      } else {
        const x0 = ((b.cx + (b.x0 - b.cx) * sc) * cam.s + cam.ox) / d;
        const x1 = ((b.cx + (b.x1 - b.cx) * sc) * cam.s + cam.ox) / d;
        const y0 = ((b.cy + (b.y0 - b.cy) * sc) * cam.s + cam.oy) / d;
        const y1 = ((b.cy + (b.y1 - b.cy) * sc) * cam.s + cam.oy) / d;
        area = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
        x = (b.px * cam.s + cam.ox) / d;
        y = (b.py * cam.s + cam.oy) / d;
        above = false;
      }
      if (x < -40 || y < -40 || x > this.w + 40 || y > this.h + 40) return;
      cands.push({ uid, rec, x, y, area, above, priority, lost: !!rec.lost });
    };

    /* THE EMPIRE'S MASS GETS NAMED FIRST.
       Round 4's plate labelled Kuria Muria Islands, Perim, Niue and Nauru and
       never once labelled India — because India is fifteen units, each of them
       twenty pixels across, and each of them lost the budget to a dot with a
       10px minimum mark. So units of one territory that are small on screen
       are labelled ONCE, as the territory, at their own area-weighted centre:
       "British India", not fifteen states nobody can read. Zoom in and each
       unit is large enough to carry its own name again, and the cluster
       dissolves. Nothing is invented — the name comes from the same namer, and
       the centre is the mean of the units actually drawn. */
    const clusters = new Map();
    if (this.groupLabel) {
      for (const [uid, rec] of this.paint) {
        const tid = rec && rec.entry && rec.entry.territoryId;
        if (!tid || rec.lost) continue;
        const b = bounds.get(uid);
        if (!b) continue;
        const sc = this.weight && this.weight.has(uid) ? this.weight.get(uid) : 1;
        const x0 = ((b.cx + (b.x0 - b.cx) * sc) * cam.s + cam.ox) / d;
        const x1 = ((b.cx + (b.x1 - b.cx) * sc) * cam.s + cam.ox) / d;
        const y0 = ((b.cy + (b.y0 - b.cy) * sc) * cam.s + cam.oy) / d;
        const y1 = ((b.cy + (b.y1 - b.cy) * sc) * cam.s + cam.oy) / d;
        const a = Math.max(0, x1 - x0) * Math.max(0, y1 - y0);
        const px2 = (b.px * cam.s + cam.ox) / d, py2 = (b.py * cam.s + cam.oy) / d;
        if (px2 < -60 || py2 < -60 || px2 > this.w + 60 || py2 > this.h + 60) continue;
        let c = clusters.get(tid);
        if (!c) { c = { tid, n: 0, area: 0, sx: 0, sy: 0, wsum: 0, big: 0, units: [], ex0: Infinity, ex1: -Infinity }; clusters.set(tid, c); }
        if (x0 < c.ex0) c.ex0 = x0;
        if (x1 > c.ex1) c.ex1 = x1;
        const wgt = Math.max(a, 4);
        c.n++; c.area += a; c.sx += px2 * wgt; c.sy += py2 * wgt; c.wsum += wgt;
        c.units.push(uid);
        if (a >= 2400) c.big++;
      }
    }
    const clustered = new Set();
    for (const c of clusters.values()) {
      // Two or more units, none of them yet big enough to carry its own name.
      if (c.n < 2 || c.big > 0 || c.area < 90) { clusters.delete(c.tid); continue; }
      c.x = c.sx / c.wsum; c.y = c.sy / c.wsum;
      for (const u of c.units) clustered.add(u);
    }
    // Priority 0 is always drawn; priority 1 competes on size.
    if (this.selectedUnits) for (const uid of this.selectedUnits) push(uid, 0);
    push(this.focus, 0);
    push(this.hover, 0);
    // The place the empire was run from is never a casualty of the label
    // budget — but it is ONE name, not eight. The metropole is eight units in
    // this geometry (Great Britain, Ireland, Man, Jersey, Guernsey…), and
    // pushing every one of them at priority 0 spent four of a twenty-name
    // budget on the Channel Islands while Nigeria and the Sudan went unnamed.
    // The largest home unit carries the name; the rest compete like anyone
    // else, and `said` de-duplicates whatever the namer resolves alike.
    {
      let bestHome = null, bestArea = -1;
      for (const [uid, rec] of this.paint) {
        if (!rec || !rec.home) continue;
        const b = bounds.get(uid);
        const a = b ? Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0) : 0;
        if (a > bestArea) { bestArea = a; bestHome = uid; }
      }
      if (bestHome) push(bestHome, 0);
      for (const [uid, rec] of this.paint) if (rec && rec.home && uid !== bestHome) push(uid, 1);
    }
    if (this.stitch) for (const [uid, m] of marks) { if (m.rec && m.rec.stitchKind) push(uid, 0); }
    for (const [uid] of this.paint) { if (!clustered.has(uid)) push(uid, 1); }
    for (const c of clusters.values()) {
      const text = this.groupLabel(c.tid, c.units);
      if (!text) { for (const u of c.units) push(u, 1); continue; }
      cands.push({ uid: c.units[0], tid: c.tid, rec: this.paint.get(c.units[0]), text,
        x: c.x, y: c.y, area: Math.max(c.area, 260), above: false, priority: 1, group: true,
        // The ground the cluster actually covers, so a group name can be
        // measured against the thing it names. See the width test below.
        span: Math.max(0, c.ex1 - c.ex0) });
    }
    /* AND THE MASS OF THE EMPIRE OUTRANKS THE PIXELS.
       Sorting names by drawn area is the charge itself: it hands prime type to
       Kuria Muria Islands and Perim because they carry a 10px minimum mark in
       an empty sea, and leaves Nigeria and the Sudan unnamed. So a share of
       the budget is awarded on a CITED quantity instead — each territory's own
       recorded peak population, the same field weight mode uses and the same
       one the card names its source for. No figure is invented: a territory
       with no cited population simply competes on area as before. */
    if (this.labelMass) {
      const massed = [];
      for (const c of cands) {
        if (c.priority !== 1 || c.lost) continue;
        const tid = c.tid || (c.rec && c.rec.entry && c.rec.entry.territoryId);
        const v = tid ? this.labelMass(tid) : null;
        if (Number.isFinite(v) && v > 0) massed.push({ c, v });
      }
      massed.sort((a, b) => b.v - a.v);
      const promote = Math.max(3, Math.round(budget * 0.35));
      for (let i = 0; i < Math.min(promote, massed.length); i++) massed[i].c.priority = 0.6;
    }
    cands.sort((a, b) => (a.priority - b.priority) || (b.area - a.area));

    g.save();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    let drawn = 0;
    // Sub-units of one territory now resolve to the same period name, which is
    // the honest answer and would otherwise print "British India" eleven times.
    /* Two names that a reader cannot tell apart are one name printed twice.
       Round 6's phone plate carried "Northwest Territories" and "The
       North-West Territories" one above the other over Canada — two different
       units, two honest period names, and a reader who sees a rendering fault.
       De-duplication now compares what the eye compares: lower case, no
       article, no hyphens, no spaces. The first of the pair keeps the name;
       the second gives its place in the budget to somewhere unnamed. */
    const said = new Set();
    const key = (t) => t.toLowerCase().replace(/^the\s+/, '').replace(/[\s\-–—'’.]/g, '');
    /* TWO NAMES FOR ONE TERRITORY, ONE ABOVE THE OTHER, ON A PHONE.
       `_hits` guarantees no two names overlap, and on a 390px band that is not
       enough: measured on the cold plate at 390x844, "The North-West
       Territories", "Dominion of Canada" and the ghost "Old Northwest" were
       drawn 20px apart over one continent — three lines of type in the space
       one name needs, and the reviewer read them as colliding. They are three
       true facts and a desktop plate has room for all three; a phone does not,
       and the fact a student needs at that size is the country.

       So on a band under 560px wide, two names OF THE SAME TERRITORY must
       stand at least two line-heights apart. Nothing is renamed and nothing is
       moved: the second one gives its place in the budget to somewhere else on
       the plate that has no name at all. Above 560 this does not run. */
    /* The rule is about SPACE, not about the dataset. The three names over
       North America belong to three different territories — the North-West
       Territories, the Dominion and the ceded Ohio country are three records —
       so a same-territory test does not see them. What the reader sees is
       three lines of type stacked in the room one name needs. So on a narrow
       band every name keeps a line-height of clear paper around it, and the
       name that cannot have it goes somewhere else on the plate that has none
       at all: measured on the cold 390x844 plate, that is Africa and the
       Pacific, which had one name between them. */
    const narrow = this.w < 560;
    const pad = narrow ? px * 1.15 : 0;
    const tooClose = (b) => {
      if (!narrow) return false;
      for (const t of taken) {
        if (b.x < t.x + t.w + pad && b.x + b.w + pad > t.x
          && b.y < t.y + t.h + pad && b.y + b.h + pad > t.y) return true;
      }
      return false;
    };
    for (const c of cands) {
      if (c.priority && drawn >= budget) break;
      // A ghost — held once, not in this year — is not the same kind of fact as
      // a place Britain ruled today, and round 4 set both in identical type, so
      // the 1900 plate read Hawaii, Florida and Réunion as if they were Egypt.
      // Ghosts are italic, in the lost-territory ink, and they have their own
      // small budget: they annotate the plate, they do not compete with it.
      if (c.lost && c.priority) { if (ghosts >= ghostBudget || c.area < 90) continue; }
      const text = c.text || this.labelText(c.uid, c.rec);
      if (!text || said.has(key(text))) continue;
      g.font = `${c.lost ? 'italic 400' : '500'} ${Math.round(px * d)}px ${T.fontSans || 'system-ui, sans-serif'}`;
      const wpx = g.measureText(text).width / d;
      if (c.priority && !c.group && wpx > Math.max(60, Math.sqrt(c.area) * 2.6) && !marks.has(c.uid)) continue;
      /* AND A GROUP NAME IS MEASURED TOO — round 10.
         The width test above exempted group labels, and a group label is the
         one candidate whose text can be arbitrarily longer than the ground it
         names: "Awadh and the United Provinces" is 280 px, and on the 390 px
         band a lesson beat gets on a phone it was drawn across Punjab, the
         Bengal Presidency and British India at once, over the top of three
         other names. A name wider than the country is not a label, it is a
         line of text lying on a map. Two limits, both measured on the plate:
         a group name may not be much wider than the cluster it names, and no
         competing name may take more than 62% of the plate's width — at which
         point the reader can no longer tell which shape it belongs to. The
         selection, the focus and the hover (priority 0) are exempt from both,
         because those three are answers to something the reader just did. */
      if (c.priority && c.group && c.span > 0 && wpx > Math.max(70, c.span * 1.6)) continue;
      if (c.priority && wpx > this.w * 0.62 && !marks.has(c.uid)) continue;
      // Four places to try before giving up on a name: above, below, right,
      // left. In the Stitching view the ringed stations cluster nine deep
      // around the Irish Sea and the Lesser Antilles, and a single fixed
      // position dropped most of their names — in the one view where the dots
      // ARE the subject and a nameless dot teaches nothing.
      const half = wpx / 2 + 3;
      const rise = px * 0.55 + (c.above ? 0 : 0);
      const spots = c.above
        ? [[0, -rise], [0, rise + px * 0.9], [half + 10, 0], [-half - 10, 0],
           [half + 8, -rise], [-half - 8, -rise], [half + 8, rise], [-half - 8, rise]]
        : [[0, 0], [0, -px - 3], [0, px + 3], [half + 10, 0], [-half - 10, 0]];
      let box = null, dx = 0, dy = 0;
      for (const [ox, oy] of spots) {
        const b = { x: c.x + ox - wpx / 2 - 3, y: c.y + oy - px / 2 - 2, w: wpx + 6, h: px + 4 };
        if (b.x < 1 || b.y < 1 || b.x + b.w > this.w - 1 || b.y + b.h > this.h - 1) continue;
        if (this._hits(b, taken) || this._underObstacle(b)) continue;
        if (c.priority && tooClose(b)) continue;
        box = b; dx = ox; dy = oy; break;
      }
      if (!box) continue;
      taken.push(box);
      said.add(key(text));
      const tx = (c.x + dx) * d, ty = (c.y + dy) * d;
      g.strokeStyle = T.labelHalo || T.paper;
      g.lineWidth = Math.max(2.5, 3 * d);
      g.strokeText(text, tx, ty);
      g.fillStyle = c.lost ? (T.lostInk || T.label || T.ink)
        : c.priority === 0 ? (T.ink || T.label) : (T.label || T.ink);
      g.fillText(text, tx, ty);
      this.labelsDrawn.push({ uid: c.uid, tid: c.tid || null, text, x: c.x + dx, y: c.y + dy, lost: !!c.lost, group: !!c.group });
      if (c.priority) drawn++;
      if (c.lost && c.priority) ghosts++;
    }
    g.restore();
    return taken;
  }

  _paintShape(g, p, rec, pat, T, coastW, isMark = false) {
    // `ask:paintUnits` names a set; everything outside it is pushed back so the
    // set reads as a set. It is dimmed, never hidden: the map does not lie about
    // what else was British that year in order to make a point.
    if (rec.dim) {
      const a = g.globalAlpha;
      g.globalAlpha = a * 0.22;
      this._paintShape(g, p, { ...rec, dim: false }, pat, T, coastW, isMark);
      g.globalAlpha = a;
      return;
    }
    /* QUIET, NOT HIDDEN. Set on every non-hole unit while the Silences layer is
       on. 0.22 (`dim`, above) is for a named set the reader asked to isolate
       and is too faint to read a status off; this is loud enough to keep the
       whole plate legible and quiet enough that seven empty shapes are the
       first thing the eye lands on. */
    if (rec.quiet) {
      const a = g.globalAlpha;
      g.globalAlpha = a * 0.5;
      this._paintShape(g, p, { ...rec, quiet: false }, pat, T, coastW, isMark);
      g.globalAlpha = a;
      return;
    }
    if (rec.mode === 'hole') {
      // A silence. The coastline is drawn; the interior is left as bare paper.
      // On a filled map, absence is the loudest mark available.
      g.fillStyle = T.paper;
      g.fill(p, 'evenodd');
      g.strokeStyle = T.ink;
      g.lineWidth = Math.max(1.5, coastW * 1.5);
      g.setLineDash([]);
      g.stroke(p);
      return;
    }
    if (rec.mode === 'informal') {
      // Informal empire: no fill and no claimed border, because that
      // distinction IS the content. A broken line, which reads as "not a
      // border", and a node where the pressure was applied. No haze is drawn,
      // because a haze radius would have to encode a quantity and this dataset
      // carries no cited figure for it — see the caption on the switch.
      g.save();
      g.strokeStyle = T.inkMuted || T.inkFaint || T.coast;
      g.lineWidth = Math.max(1.5, coastW * 1.5);
      g.setLineDash([Math.max(5, coastW * 5), Math.max(4, coastW * 4)]);
      g.lineJoin = 'round';
      g.stroke(p);
      g.restore();
      return;
    }
    if (rec.mode === 'absence') {
      // No cited figure for the active metric. Never zero, never guessed.
      g.fillStyle = T.paperSunk || T.paper;
      g.fill(p, 'evenodd');
      if (pat.absence) { g.fillStyle = pat.absence; g.fill(p, 'evenodd'); }
      g.strokeStyle = T.coast;
      g.lineWidth = coastW;
      g.stroke(p);
      return;
    }

    const fill = rec.fill;
    if (rec.partial && !isMark) {
      // British control did not fill this unit, so the colour is cut by bands
      // of bare ground. The status stays legible; the incompleteness is visible.
      g.fillStyle = fill;
      g.fill(p, 'evenodd');
      g.fillStyle = pat.bandsFor(T.fills['never-british']);
      g.fill(p, 'evenodd');
    } else {
      g.fillStyle = fill;
      g.fill(p, 'evenodd');
    }
    /* THE ENGRAVING, AT THE WEIGHT THE FILL NEEDS IT. `rec.engrave` is set by
       index.js from palette.js's per-theme measurement: a family whose colour
       falls under 12 dE00 from the ground for any of the four vision models is
       separated by its hatch alone, so its hatch is drawn at twice the weight
       in its own stroke ink. Same period, same mark, same key. */
    const tex = rec.engrave === 'heavy' && pat.heavyFor
      ? (pat.heavyFor(rec.texture, rec.strokeColour) || pat[rec.texture])
      : pat[rec.texture];
    if (tex) { g.fillStyle = tex; g.fill(p, 'evenodd'); }
    g.strokeStyle = T.coast;
    g.lineWidth = coastW;
    g.stroke(p);
  }

  _drawOutlines(g, paths, bounds, cam, T, d) {
    const marks = this.markLayout(cam);
    const ring = (uid, colour, width, dash) => {
      const m = marks.get(uid);
      const p = paths.get(uid);
      if (!p && !m) return;
      g.save();
      g.setLineDash(dash || []);
      g.strokeStyle = colour;
      g.lineWidth = width * d;
      g.lineJoin = 'round';
      if (m) {
        const c = new Path2D();
        c.arc(m.x * d, m.y * d, (m.r + 2.5) * d, 0, 6.28319);
        g.stroke(c);
      } else g.stroke(p);
      g.restore();
    };

    if (this.selectedUnits) {
      for (const uid of this.selectedUnits) {
        const rec = this.paint.get(uid);
        // Selection is an outline, never a change of fill: two selected fills
        // sit within 7 dE00 of another category's base fill, so the outline is
        // the only thing that can carry it.
        const stroke = rec && rec.strokeColour ? rec.strokeColour : T.borderHot;
        ring(uid, T.borderHot, 3);
        ring(uid, stroke, 1.5);
      }
    }
    if (this.hover && (!this.selectedUnits || !this.selectedUnits.has(this.hover))) {
      ring(this.hover, T.borderHot, 1.5);
    }
    if (this.focus) {
      ring(this.focus, T.focusRing || T.accent, 2.5);
      ring(this.focus, T.labelHalo, 1, [3, 3]);
    }
  }

  frameStats() {
    const f = this.frames.slice().sort((a, b) => a - b);
    if (!f.length) return null;
    const q = (p) => f[Math.min(f.length - 1, Math.floor(p * f.length))];
    return {
      frames: f.length,
      mean: +(f.reduce((a, b) => a + b, 0) / f.length).toFixed(2),
      median: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2), max: +f[f.length - 1].toFixed(2),
      // Instrumentation a critic can check: how often the geometry caches were
      // thrown away, which is the only thing that makes a frame expensive.
      pathBuilds: this.pathBuilds || 0, sizeChanges: this.sizeChanges || 0,
      lod: this.moving,
    };
  }
  resetStats() { this.frames = []; this.pathBuilds = 0; this.sizeChanges = 0; this.baseDraws = 0; }
}

export default { Plate, MIN_MARK_PX };
export { MIN_MARK_PX };
