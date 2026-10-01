/**
 * map/projection.js — two projections, and the morph between them.
 *
 * The toggle is the app's signature interaction, so it has to be honest about
 * what it is showing: Mercator preserves angle and inflates area away from the
 * equator; Equal Earth preserves area and bends shape. We hold both, projected
 * once into world coordinates, and interpolate the projected points. There is
 * no interpolation of any *quantity* here — only of screen positions between
 * two exact projections of the same vertex.
 *
 * World space: every projection is normalised to a box 1000 units wide,
 * centred on (0, 0), keeping its own aspect ratio. `height` therefore differs
 * per projection, which is the whole point: Mercator is nearly square and
 * Equal Earth is a long ellipse, and the morph shows you that.
 *
 * Mercator is cut at 84 degrees north and south. Every Mercator world map ever
 * printed does this, because the projection sends the poles to infinity; the
 * byline says so rather than letting a student think Antarctica is a wall.
 */

const RAD = Math.PI / 180;
const WORLD_W = 1000;

/* ---- Mercator ----------------------------------------------------------- */

export const MERCATOR_CUT = 84;                  // degrees; y is clamped here

function mercatorRaw(lonDeg, latDeg, out) {
  const phi = Math.max(-MERCATOR_CUT, Math.min(MERCATOR_CUT, latDeg)) * RAD;
  out[0] = lonDeg * RAD;
  out[1] = -Math.log(Math.tan(Math.PI / 4 + phi / 2));
  return out;
}

/* ---- Equal Earth (Šavrič, Patterson & Jenny 2018) ------------------------ */

const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const M = Math.sqrt(3) / 2;

function equalEarthRaw(lonDeg, latDeg, out) {
  const lambda = lonDeg * RAD;
  const phi = latDeg * RAD;
  const s = M * Math.sin(phi);
  const l = Math.asin(s > 1 ? 1 : s < -1 ? -1 : s);
  const l2 = l * l, l6 = l2 * l2 * l2;
  out[0] = lambda * Math.cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)));
  out[1] = -(l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)));
  return out;
}

/* ---- the registry ------------------------------------------------------- */

export const PROJECTIONS = {
  mercator: {
    id: 'mercator',
    label: 'Mercator',
    raw: mercatorRaw,
    /** What is wrong with this rendering, in the app's own words. */
    caveat: 'Mercator keeps compass bearings true and inflates everything away from the equator. Greenland looks the size of Africa; Africa is fourteen times larger. Cut at 84°N and 84°S, because the projection sends the poles to infinity.',
    short: 'area exaggerated towards the poles',
  },
  'equal-earth': {
    id: 'equal-earth',
    label: 'Equal Earth',
    raw: equalEarthRaw,
    caveat: 'Equal Earth keeps every area in true proportion and pays for it in shape: the far north and south are sheared, and no bearing you measure on it is a compass bearing.',
    short: 'areas true, shapes sheared',
  },
};

export const PROJECTION_IDS = Object.keys(PROJECTIONS);


/* ---- THE PLATE FRAME ----------------------------------------------------

   WHY THIS EXISTS, AND WHAT IT FIXED.

   A Mercator cut at 84° is very nearly SQUARE: 1000 world units wide by 939
   tall. The stage this app is given is 1920 × 491 — an aspect of 3.9 — because
   the timeline below the map is 500px tall. Fitting a square into a 3.9:1 strip
   by "contain" draws the world at 522px: 27.9% of the plate's width, with
   India three-quarters of everyone Britain ruled and twenty pixels across.
   That, measured, is what lost round 4 to a printed chapter.

   So the fit is no longer against the projection's whole box. It is against a
   FRAME: the band of latitude a British Empire atlas has to show, 64°N to
   56°S. Inside it are the United Kingdom, every Canadian province anyone lived
   in, the Falklands, South Georgia, Campbell Island and the whole of the
   tropics. Outside it are Nunavut, the Northwest Territories, Yukon, Iceland,
   Alaska and Antarctica — the places Mercator inflates most and Britain ruled
   least, which is the coursebook's own charge 4 made into a cropping decision.
   The crop is stated on the plate and the minus key zooms out past it, so
   nothing is hidden; it is simply not the default framing.

   Both projections are framed on the SAME latitudes, so pressing P still shows
   Canada balloon and Africa shrink: the equatorial scale is what changes.     */

export const PLATE_FRAME = { north: 64, south: -56 };

const framed = new Map();

/** The frame of one projection in world units: its height, and its centre. */
export function frameBox(id) {
  let f = framed.get(id);
  if (f) return f;
  const box = worldBox(id);
  const raw = PROJECTIONS[id].raw;
  const p = [0, 0];
  raw(0, PLATE_FRAME.north, p); const yN = (p[1] - box.cy) * box.scale;
  raw(0, PLATE_FRAME.south, p); const yS = (p[1] - box.cy) * box.scale;
  f = { id, top: yN, bottom: yS, span: Math.abs(yS - yN), cy: (yN + yS) / 2 };
  framed.set(id, f);
  return f;
}

/** The tallest frame of any projection — the one number every fit uses. */
let FRAME_H = 0;
export function frameSpan() {
  if (!FRAME_H) for (const id of PROJECTION_IDS) FRAME_H = Math.max(FRAME_H, frameBox(id).span);
  return FRAME_H;
}

/** The tallest whole-world box of any projection, for the zoom-out limit. */
let FULL_H = 0;
export function fullSpan() {
  if (!FULL_H) for (const id of PROJECTION_IDS) FULL_H = Math.max(FULL_H, worldBox(id).height);
  return FULL_H;
}

/* ---- world-space projection --------------------------------------------- */

/** The normalised bounds of a projection, computed from a dense sphere sample. */
function measure(raw) {
  const p = [0, 0];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let lat = -90; lat <= 90; lat += 1) {
    for (let lon = -180; lon <= 180; lon += 2) {
      raw(lon, lat, p);
      if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
      if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
    }
  }
  return { x0, y0, x1, y1 };
}

const measured = new Map();
function boundsOf(id) {
  let b = measured.get(id);
  if (!b) { b = measure(PROJECTIONS[id].raw); measured.set(id, b); }
  return b;
}

/** Metrics for one projection in world space. */
export function worldBox(id) {
  const b = boundsOf(id);
  const scale = WORLD_W / (b.x1 - b.x0);
  return {
    id,
    scale,
    width: WORLD_W,
    height: (b.y1 - b.y0) * scale,
    cx: (b.x0 + b.x1) / 2,
    cy: (b.y0 + b.y1) / 2,
  };
}

/**
 * Project a whole flattened coordinate set into world space.
 * Returns Float32Arrays parallel to `lon`/`lat`.
 */
export function projectAll(lon, lat, n, id) {
  const box = worldBox(id);
  const raw = PROJECTIONS[id].raw;
  const x = new Float32Array(n), y = new Float32Array(n);
  const p = [0, 0];
  for (let i = 0; i < n; i++) {
    raw(lon[i], lat[i], p);
    x[i] = (p[0] - box.cx) * box.scale;
    y[i] = (p[1] - box.cy) * box.scale;
  }
  return { x, y, box };
}

/** Project a single lon/lat pair into world space. */
export function projectPoint(lonDeg, latDeg, id, out = [0, 0]) {
  const box = worldBox(id);
  const p = [0, 0];
  PROJECTIONS[id].raw(lonDeg, latDeg, p);
  out[0] = (p[0] - box.cx) * box.scale;
  out[1] = (p[1] - box.cy) * box.scale;
  return out;
}

/** Interpolate two world-space point sets. `t` 0 = a, 1 = b. */
export function mixInto(ax, ay, bx, by, t, outX, outY, n) {
  const u = 1 - t;
  for (let i = 0; i < n; i++) { outX[i] = ax[i] * u + bx[i] * t; outY[i] = ay[i] * u + by[i] * t; }
}

export const WORLD_WIDTH = WORLD_W;
export default { PROJECTIONS, PROJECTION_IDS, worldBox, frameBox, frameSpan, fullSpan, PLATE_FRAME, projectAll, projectPoint, mixInto, WORLD_WIDTH, MERCATOR_CUT };
