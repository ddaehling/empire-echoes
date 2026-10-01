/**
 * compare/split.js — one of the two plates, and the paint it carries.
 *
 * IT REUSES THE MAP'S OWN RENDERER. `Plate` (app/js/map/render.js), the
 * projections, the palette, the textures and the four definitions are imported,
 * not re-implemented. ES modules are singletons, so this is literally the same
 * code and the same adopted symbology the single plate uses: the compare view
 * cannot drift from the map, cannot invent a colour, and cannot disagree with
 * the legend. If P02 fixes a coastline, both compare plates get the fix.
 *
 * What this file adds is only what a second plate needs: its own year, its own
 * definition, and a `dim` set so a row in the difference list can light the
 * places it names on both plates at once.
 */

import { Plate } from '../map/render.js';
import { paletteKey, textureFor, TEXTURE, KEY_LABEL, readTokens, tenureBucket, TENURE_LABELS } from '../map/palette.js';
import { flattenTopology, flattenAsOne } from '../map/geometry.js';

export { readTokens };

/**
 * The geometry, flattened once and shared by both plates. Flattening 302 units
 * twice would double the cost of opening the view for no gain: `setGeometry`
 * keeps its own projected caches per Plate, and the flat arrays are read-only.
 */
export function sharedGeometry(data) {
  const geo = data.geo || {};
  const units = geo.coarse && geo.coarse.data;
  if (!units) return null;
  const landTopo = (geo.land && geo.land.data) || null;
  return {
    units: flattenTopology(units, geo.coarse.object || 'units'),
    land: landTopo ? flattenAsOne(landTopo, (geo.land && geo.land.object) || 'land', 'land') : null,
    lakes: (geo.lakes && geo.lakes.data) ? flattenAsOne(geo.lakes.data, geo.lakes.object || 'lakes', 'lakes') : null,
    graticule: (geo.graticule && geo.graticule.data) ? flattenAsOne(geo.graticule.data, geo.graticule.object || 'graticule', 'graticule') : null,
    meta: data.unitMeta,
  };
}

/**
 * The first year each unit came under real British authority, and the year it
 * stopped. Exactly the map module's rule, for exactly the same reason: a place
 * held once and not held now is drawn as "formerly British", and the United
 * States greying out between the 1770 plate and the 1820 plate is the single
 * most useful thing this comparison does.
 */
export function tenureIndex(data) {
  const firstHeld = new Map();
  for (const s of data.spans || []) {
    if (s.status === 'informal-sphere') continue;
    if (!(Number(s.controlDegree) >= 1)) continue;
    for (const u of s.units || []) {
      const cur = firstHeld.get(u);
      if (cur == null || s.start < cur) firstHeld.set(u, s.start);
    }
  }
  return firstHeld;
}

/**
 * The paint for one plate. A narrowed copy of the map's own `_paintFor`: fills
 * and textures from the shared palette, informal spheres drawn as nodes with no
 * fill and no claimed border, and units held once but not in this year drawn as
 * ghosts. Weight mode, silences and the tenure layer belong to the single plate
 * and are deliberately absent here — two plates already carry two variables,
 * and a third would make the difference unreadable.
 */
export function paintFor({ statusMap, def, tokens, firstHeld, year, dim, layer }) {
  const out = new Map();
  for (const [uid, e] of statusMap) {
    if (!def.test(e)) continue;
    const key = paletteKey(e.status, e.controlDegree);
    if (key === 'informal') {
      out.set(uid, { mode: 'informal', key, entry: e, texture: 'plain', label: KEY_LABEL.informal, node: true });
      continue;
    }
    out.set(uid, {
      mode: 'fill', key, entry: e,
      fill: tokens.fills[key], strokeColour: tokens.stroke[key], texture: textureFor(e.status, key),
      partial: !!e.partial, label: KEY_LABEL[key], home: e.status === 'part-of-uk',
    });
  }
  for (const [uid, first] of firstHeld) {
    if (out.has(uid) || statusMap.has(uid)) continue;
    if (year <= first) continue;
    out.set(uid, {
      mode: 'fill', key: 'lost-former', fill: tokens.fills['lost-former'],
      strokeColour: tokens.stroke['lost-former'], texture: TEXTURE['lost-former'],
      partial: false, label: KEY_LABEL['lost-former'], lost: true, heldFrom: first,
    });
  }
  /* The layer is shared with the single plate, so a reader who was reading
     tenure does not silently get status back the moment they compare. Same
     ramp, same buckets, same rule that a single hue can never be mistaken for
     a categorical read (DESIGN.md §2.4). */
  if (layer === 'tenure') {
    for (const rec of out.values()) {
      if (rec.mode !== 'fill' || rec.lost) continue;
      const e = rec.entry;
      if (!e || e.since == null) continue;
      rec.fill = tokens.tenure[tenureBucket(e.tenureYears)] || rec.fill;
      rec.texture = 'plain';
      rec.tenureLabel = TENURE_LABELS[tenureBucket(e.tenureYears)];
    }
  }
  if (dim && dim.size) for (const [uid, rec] of out) if (!dim.has(uid)) rec.dim = true;
  return out;
}

/** One plate: a canvas, a Plate, and the state that decides what it paints. */
export class SidePlate {
  constructor(canvas) {
    this.canvas = canvas;
    this.plate = new Plate(canvas);
    this.sig = '';
    this.w = 0; this.h = 0;
  }

  setGeometry(g) { if (g) this.plate.setGeometry(g); return this; }
  setTokens(t) { this.tokens = t; this.plate.setTokens(t, window.devicePixelRatio || 1); this.sig = ''; return this; }
  setProjection(id) { this.plate.setProjectionState(id, id, 1); this.sig = ''; return this; }
  setView(v) { this.plate.setView(v); return this; }
  setLabels(fn) { this.plate.labelText = fn || null; this.sig = ''; return this; }

  /** Fit the backing store to the box the CSS grid gave us. */
  size() {
    const box = this.canvas.parentElement;
    if (!box) return false;
    const r = box.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    const dpr = window.devicePixelRatio || 1;
    if (w === this.w && h === this.h && dpr === this.dpr) return false;
    this.w = w; this.h = h; this.dpr = dpr;
    if (this.plate.setSize(w, h, dpr) && this.tokens) this.plate.setTokens(this.tokens, dpr);
    this.sig = '';
    return true;
  }

  paint({ data, year, def, firstHeld, dim, layer, force }) {
    const sig = [year, def.id, layer || '', dim ? dim.size : 0, this.tokens && this.tokens.sea, this.w, this.h].join('|');
    if (!force && sig === this.sig) return false;
    this.sig = sig;
    this.plate.setPaint(paintFor({
      statusMap: data.statusAt(year), def, tokens: this.tokens, firstHeld, year, dim, layer,
    }));
    return true;
  }

  draw() { if (this.plate.geom) this.plate.draw(); }
  destroy() { this.plate = null; }
}

export default { SidePlate, sharedGeometry, tenureIndex, paintFor, readTokens };
