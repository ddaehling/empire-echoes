/**
 * map/palette.js — the encoding law, in code.
 *
 *   status        -> fill + texture           (both, always; colour is never alone)
 *   controlDegree -> a THRESHOLD, deciding what is drawn at all — never a
 *                    second visual channel. There is no hatch-density ramp on
 *                    Gibraltar in this file and there never will be.
 *   tenure        -> the single-hue --tenure-1..7 ramp, read as an order
 *
 * The dataset carries 21 statuses; the audited palette carries ten fills
 * (docs/DESIGN.md §2.2). The map therefore folds 21 into 10 by the rule the
 * palette was designed around: the three madder shades are a ladder of how
 * *direct* the rule was, so a status lands on a rung by its own controlDegree,
 * and everything outside the madder family keeps its own institutional colour.
 * Nothing here invents a hex; every value is a token read from the document,
 * so both themes follow automatically.
 */

/** status id -> palette key. Everything else falls through to the degree ladder. */
const EXPLICIT = {
  'company-trading-posts': 'company-rule',
  'company-rule': 'company-rule',
  'protectorate': 'protectorate',
  'protected-state': 'protectorate',
  'princely-state': 'protectorate',
  'mandate': 'mandate',
  'trusteeship': 'mandate',
  'condominium': 'mandate',
  'leased-territory': 'lease',
  'occupied': 'occupied',
  'informal-sphere': 'informal',      // no fill at all — see render.js
};

/** The madder ladder: how directly London gave the orders. */
function ladder(degree) {
  if (degree >= 5) return 'crown-conquered';
  if (degree >= 3) return 'settlement';
  return 'dominion';
}

/**
 * P17 owns the status vocabulary (FEATURE_SPEC §2 P04) and publishes it as
 * `window.BEA.symbology` / the `legend:symbology` bus event: a proved
 * status -> { family, texture } table covering all 21 statuses, with the
 * texture assignment checked by the same graph colouring that proved the ten
 * fills. We adopt it when it arrives and fall back to the table above when the
 * legend is not running, so the map is never left inventing an encoding.
 */
let SYMBOL = null;

export function adoptSymbology(sym) {
  if (!sym || !sym.STATUS_SYMBOL) return false;
  SYMBOL = sym.STATUS_SYMBOL;
  return true;
}
export const hasSymbology = () => !!SYMBOL;

export function paletteKey(status, controlDegree) {
  if (SYMBOL && SYMBOL[status]) {
    const s = SYMBOL[status];
    if (s.mark === 'informal' || s.family == null) return 'informal';
    return s.family;
  }
  const k = EXPLICIT[status];
  if (k) return k;
  return ladder(Number(controlDegree) || 0);
}

/** The engraved mark for a status — family siblings differ, which is the point. */
export function textureFor(status, key) {
  if (SYMBOL && SYMBOL[status] && SYMBOL[status].texture) return SYMBOL[status].texture;
  return TEXTURE[key] || 'plain';
}

/** The texture assigned to each palette key by tools/design/textures.js. */
export const TEXTURE = {
  'never-british': 'plain',
  'lost-former': 'hatch-45',
  'dominion': 'rule-h',
  'settlement': 'stipple',
  'crown-conquered': 'plain',
  'company-rule': 'cross',
  'lease': 'rule-v',
  'protectorate': 'hatch-135',
  'mandate': 'stipple-coarse',
  'occupied': 'hatch-135-dense',
  'informal': 'plain',
};

export const PALETTE_KEYS = [
  'never-british', 'lost-former', 'dominion', 'settlement', 'crown-conquered',
  'company-rule', 'lease', 'protectorate', 'mandate', 'occupied',
];

/** Human words for the ten fills, used on focus and in the map's own key. */
export const KEY_LABEL = {
  'never-british': 'not British this year',
  'lost-former': 'formerly British, already lost',
  'dominion': 'self-governing under the Crown',
  'settlement': 'settler or assembly colony',
  'crown-conquered': 'ruled directly from London',
  'company-rule': 'run by a chartered company',
  'lease': 'held on a lease',
  'protectorate': 'protectorate or protected state',
  'mandate': 'mandate, trust or condominium',
  'occupied': 'under military occupation',
  'informal': 'informal empire — never claimed',
};

/* =============================================================================
   WHICH FILLS ARE DOING THE WORK ALONE — measured, per theme, every re-read.

   DESIGN.md §2.2 proves the ten fills and says, in as many words, that nine
   status pairs sit under 12 ΔE00 and are SEPARATED BY TEXTURE ALONE. That is a
   promise about the texture, and until this round nothing in this module
   checked whether the texture could keep it. It could not, and the classroom
   critic measured where: under a Viénot protanope transform the self-governing
   fill (#FDC3B9) falls to 9.6 ΔE00 from the ground it is drawn on, so at 1900
   Canada, Australia and New Zealand read as unclaimed land — and the texture
   that is supposed to be carrying them is `rule-h`, a 0.5px rule at 22% ink on
   a 6px period, which survives at reading distance and is gone at the back of
   a classroom.

   So the engraving is no longer a constant. Every time the palette is read the
   module measures each family's fill against the ground under FOUR vision
   models — normal, protanope, deuteranope, tritanope — and any family whose
   worst case falls below DESIGN.md's own 12 ΔE00 is drawn with a HEAVY
   engraving: the same hatch, at the same period, so the legend's swatch is
   still the same mark, but at twice the line weight and in the family's own
   `--map-*-stroke` ink, which the palette already guarantees against that
   fill. A family the colour carries is left exactly as it was.

   Nothing here invents a colour: the heavy ink is a published token, and the
   test is arithmetic on the tokens themselves, so it follows a theme change
   and it will follow any future repaint of the palette without being edited.
   ========================================================================== */

const RGB_CACHE = new Map();
function toRgb(value) {
  if (!value) return null;
  if (RGB_CACHE.has(value)) return RGB_CACHE.get(value);
  let out = null;
  try {
    if (!PROBE) PROBE = document.createElement('canvas').getContext('2d');
    PROBE.fillStyle = '#010203';
    PROBE.fillStyle = value;
    const h = PROBE.fillStyle;
    if (h === '#010203' && String(value).replace(/\s/g, '').toLowerCase() !== '#010203') out = null;
    else if (h[0] === '#') out = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    else { const m = h.match(/[\d.]+/g); out = m && m.length >= 3 ? [+m[0], +m[1], +m[2]] : null; }
  } catch (e) { out = null; }
  RGB_CACHE.set(value, out);
  return out;
}

const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const gam = (c) => { const v = Math.max(0, Math.min(1, c)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); };

/** Hunt-Pointer-Estévez LMS, and the Viénot 1999 single-plane dichromat maps. */
function lms([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  return [17.8824 * R + 43.5161 * G + 4.11935 * B,
    3.45565 * R + 27.1554 * G + 3.86714 * B,
    0.0299566 * R + 0.184309 * G + 1.46709 * B];
}
function unlms([L, M, S]) {
  return [gam(0.0809444479 * L - 0.130504409 * M + 0.116721066 * S),
    gam(-0.0102485335 * L + 0.0540193266 * M - 0.113614708 * S),
    gam(-0.000365296938 * L - 0.00412161469 * M + 0.693511405 * S)];
}
const VISION = {
  normal: (c) => c,
  protan: (c) => { const [L, M, S] = lms(c); return unlms([2.02344 * M - 2.52581 * S, M, S]); },
  deutan: (c) => { const [L, M, S] = lms(c); return unlms([L, 0.494207 * L + 1.24827 * S, S]); },
  tritan: (c) => { const [L, M, S] = lms(c); return unlms([L, M, -0.395913 * L + 0.801109 * M]); },
};

function lab([r, g, b]) {
  const R = lin(r), G = lin(g), B = lin(b);
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = (R * 0.2126 + G * 0.7152 + B * 0.0722);
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(X), fy = f(Y), fz = f(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIEDE2000. The project's own instrument (tools/design/colour.js) reports in
 *  this metric and DESIGN.md's 12 is a number in it, so the map measures in it
 *  too rather than in something that merely correlates. */
export function deltaE00(c1, c2) {
  const [L1, a1, b1] = lab(c1), [L2, a2, b2] = lab(c2);
  const kL = 1, kC = 1, kH = 1;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
  const A1 = (1 + G) * a1, A2 = (1 + G) * a2;
  const Cp1 = Math.hypot(A1, b1), Cp2 = Math.hypot(A2, b2);
  const deg = (r) => (r * 180) / Math.PI;
  const rad = (dg) => (dg * Math.PI) / 180;
  const hp = (a, b) => { if (a === 0 && b === 0) return 0; const h = deg(Math.atan2(b, a)); return h >= 0 ? h : h + 360; };
  const h1 = hp(A1, b1), h2 = hp(A2, b2);
  const dLp = L2 - L1, dCp = Cp2 - Cp1;
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) {
    dhp = h2 - h1;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(rad(dhp) / 2);
  const Lb = (L1 + L2) / 2, Cpb = (Cp1 + Cp2) / 2;
  let hpb = h1 + h2;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(h1 - h2) > 180) hpb = (h1 + h2 + (h1 + h2 < 360 ? 360 : -360)) / 2;
    else hpb = (h1 + h2) / 2;
  }
  const T = 1 - 0.17 * Math.cos(rad(hpb - 30)) + 0.24 * Math.cos(rad(2 * hpb))
    + 0.32 * Math.cos(rad(3 * hpb + 6)) - 0.20 * Math.cos(rad(4 * hpb - 63));
  const dTh = 30 * Math.exp(-Math.pow((hpb - 275) / 25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(Cpb, 7) / (Math.pow(Cpb, 7) + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lb - 50, 2)) / Math.sqrt(20 + Math.pow(Lb - 50, 2));
  const Sc = 1 + 0.045 * Cpb;
  const Sh = 1 + 0.015 * Cpb * T;
  const Rt = -Math.sin(rad(2 * dTh)) * Rc;
  return Math.sqrt(Math.pow(dLp / (kL * Sl), 2) + Math.pow(dCp / (kC * Sc), 2)
    + Math.pow(dHp / (kH * Sh), 2) + Rt * (dCp / (kC * Sc)) * (dHp / (kH * Sh)));
}

/** DESIGN.md §2.2's own floor: below this the pair is separated by texture. */
export const TEXTURE_FLOOR = 12;

/**
 * separations(tokens) -> { key: { worst, byModel } } — each family's fill
 * against the ground it is drawn on, under all four vision models.
 */
export function separations(tokens) {
  const ground = toRgb(tokens.ground) || toRgb(tokens.fills['never-british']);
  const out = {};
  if (!ground) return out;
  for (const k of PALETTE_KEYS) {
    const c = toRgb(tokens.fills[k]);
    if (!c) continue;
    const byModel = {};
    let worst = Infinity;
    for (const [name, fn] of Object.entries(VISION)) {
      const v = deltaE00(fn(c), fn(ground));
      byModel[name] = Math.round(v * 10) / 10;
      if (v < worst) worst = v;
    }
    out[k] = { worst: Math.round(worst * 10) / 10, byModel };
  }
  return out;
}

/**
 * The families whose colour cannot be trusted to separate them from the ground
 * for every reader, and whose texture is therefore load-bearing. `never-british`
 * is excluded: it IS the ground.
 */
export function weakFamilies(tokens, floor = TEXTURE_FLOOR) {
  const sep = separations(tokens);
  const out = new Set();
  for (const k of PALETTE_KEYS) {
    if (k === 'never-british') continue;
    if (sep[k] && sep[k].worst < floor) out.add(k);
  }
  return out;
}

/* ---- reading the tokens ------------------------------------------------- */

/**
 * Resolve every colour this module needs from the live document, so a theme
 * change is a re-read and never a second hard-coded palette.
 */
/**
 * A colour the CANVAS can actually paint with.
 *
 * `--map-ground` is a `color-mix()` and a computed custom property keeps that
 * form (`oklab(0.237 -0.002 -0.003)`) rather than resolving to `rgb()`. Every
 * browser this app targets parses it, but a canvas that cannot silently keeps
 * the PREVIOUS fill instead of throwing — which would paint the world's land
 * in the graticule's ink and leave no error anywhere. So every derived colour
 * is proved against a scratch context before it is handed to the renderer, and
 * falls back to the plain token if it does not take.
 */
let PROBE = null;
function canvasColour(value, fallback) {
  if (!value) return fallback;
  try {
    if (!PROBE) PROBE = document.createElement('canvas').getContext('2d');
    PROBE.fillStyle = '#010203';
    PROBE.fillStyle = value;
    return PROBE.fillStyle === '#010203' ? fallback : value;
  } catch (e) { return fallback; }
}

export function readTokens(el = document.documentElement) {
  const cs = getComputedStyle(el);
  const v = (name, fallback = '') => (cs.getPropertyValue(name) || fallback).trim();
  const fills = {}, hover = {}, selected = {}, stroke = {};
  for (const k of PALETTE_KEYS) {
    fills[k] = v('--map-' + k);
    hover[k] = v('--map-' + k + '-hover') || fills[k];
    selected[k] = v('--map-' + k + '-selected') || fills[k];
    stroke[k] = v('--map-' + k + '-stroke') || v('--map-border-hot');
  }
  const tenure = [];
  for (let i = 1; i <= 7; i++) tenure.push(v('--tenure-' + i));
  return {
    fills, hover, selected, stroke, tenure,
    tenureNone: v('--tenure-none'),
    /* THE GROUND IS NOT A STATUS.
       Round 6, dark theme: the world's non-British land was drawn in
       `--map-never-british` (#27231E, a warm brown) and Egypt and the Sudan —
       "held by the army", #5B4431, a warm brown hatch — sat 1.7:1 apart in
       luminance with the same hue. At map scale the occupation disappeared
       into the continent it was an occupation of. The status colour cannot
       move: the legend publishes it and the swatch has to match the fill. The
       GROUND can, because it is not a status. Every unit this map paints
       carries a status fill from the ten-family palette; the land layer
       underneath is the paper of the plate, and in the dark theme it is now a
       neutral graphite, so the three families a reader has to separate — sea
       (navy), ground (neutral), army (brown) — differ in hue as well as in
       value. Light theme is unchanged. See map.css. */
    ground: canvasColour(v('--map-ground'), v('--map-never-british')),
    sea: v('--map-sea'),
    seaDeep: v('--map-sea-deep'),
    coast: v('--map-coast'),
    graticule: v('--map-graticule'),
    border: v('--map-border'),
    borderHot: v('--map-border-hot'),
    label: v('--map-label'),
    labelHalo: v('--map-label-halo'),
    plateEdge: v('--map-plate-edge'),
    paper: v('--paper'),
    paperSunk: v('--paper-sunk'),
    ink: v('--ink'),
    inkMuted: v('--ink-muted'),
    inkGhost: v('--ink-ghost'),
    // The ink a ghost is named in: a place held once and not in this year is
    // not the same kind of fact as a place held now, so it is not set in the
    // same colour. Falls back to the muted ink if the stroke token is absent.
    lostInk: v('--map-lost-former-stroke') || v('--ink-muted'),
    inkFaint: v('--ink-faint'),
    accent: v('--accent'),
    focusRing: v('--focus-ring'),
    fontSans: v('--font-sans'),
    fontFigures: v('--font-figures'),
    texInk: v('--tex-ink'),
    texInkSoft: v('--tex-ink-soft'),
  };
}

/** Tenure buckets, in years, from docs/DESIGN.md §2.4. */
export const TENURE_BUCKETS = [10, 25, 50, 75, 100, 150];
export const TENURE_LABELS = [
  'under 10 years', '10–24 years', '25–49 years', '50–74 years',
  '75–99 years', '100–149 years', '150 years or more',
];
export function tenureBucket(years) {
  const y = Number(years) || 0;
  for (let i = 0; i < TENURE_BUCKETS.length; i++) if (y < TENURE_BUCKETS[i]) return i;
  return 6;
}

export default { paletteKey, textureFor, adoptSymbology, TEXTURE, PALETTE_KEYS, KEY_LABEL, readTokens, tenureBucket, TENURE_LABELS, separations, weakFamilies, deltaE00, TEXTURE_FLOOR };
