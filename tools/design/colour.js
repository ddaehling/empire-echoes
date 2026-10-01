'use strict';
/**
 * Colour maths for the British Empire Atlas design system.
 * sRGB <-> linear <-> XYZ <-> CIELAB <-> OKLab/OKLCH,
 * CIEDE2000, WCAG contrast, and dichromat simulation
 * (Viénot, Brettel & Mollon 1999 LMS projection).
 * No dependencies.
 */

/* ---------- sRGB ---------- */
const hex2rgb = h => {
  h = String(h).trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)].map(v => v / 255);
};
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const rgb2hex = c => '#' + c.map(v => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const toLin = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const toSrgb = c => c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const lin = h => hex2rgb(h).map(toLin);
const unlin = c => c.map(toSrgb);
const mul = (m, v) => m.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);

/* ---------- CIE XYZ / Lab (D65) ---------- */
const M_RGB2XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.0721750],
  [0.0193339, 0.1191920, 0.9503041],
];
const WP = [0.95047, 1.0, 1.08883];
function lab(hex) {
  const [X, Y, Z] = mul(M_RGB2XYZ, lin(hex));
  const f = t => t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29;
  const fx = f(X / WP[0]), fy = f(Y / WP[1]), fz = f(Z / WP[2]);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
const Lstar = hex => lab(hex)[0];

/* ---------- OKLab / OKLCH ---------- */
function oklab(hex) {
  const [r, g, b] = lin(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}
function oklch(hex) {
  const [L, a, b] = oklab(hex);
  return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360];
}
function oklch2hex(L, C, H) {
  const a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return rgb2hex(unlin([
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ]));
}
/** Nudge a colour in OKLCH space; returns a hex. */
function tweak(hex, { dL = 0, dC = 0, dH = 0, L, C, H } = {}) {
  let [l, c, h] = oklch(hex);
  l = (L ?? l) + dL; c = Math.max(0, (C ?? c) + dC); h = (H ?? h) + dH;
  return oklch2hex(l, c, h);
}

/* ---------- WCAG ---------- */
const relLum = hex => { const [r, g, b] = lin(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function contrast(a, b) {
  const la = relLum(a), lb = relLum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ---------- CIEDE2000 ---------- */
function deltaE00(hexA, hexB) {
  const [L1, a1, b1] = lab(hexA), [L2, a2, b2] = lab(hexB);
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2);
  const Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1, ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const hp = (b, a) => { if (b === 0 && a === 0) return 0; const h = Math.atan2(b, a) * deg; return h < 0 ? h + 360 : h; };
  const hp1 = hp(b1, ap1), hp2 = hp(b2, ap2);
  const dLp = L2 - L1, dCp = Cp2 - Cp1;
  let dhp = 0;
  if (Cp1 * Cp2 !== 0) {
    dhp = hp2 - hp1;
    if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dhp * rad) / 2);
  const Lbp = (L1 + L2) / 2, Cbp = (Cp1 + Cp2) / 2;
  let hbp;
  if (Cp1 * Cp2 === 0) hbp = hp1 + hp2;
  else {
    const d = Math.abs(hp1 - hp2);
    hbp = d > 180 ? (hp1 + hp2 + (hp1 + hp2 < 360 ? 360 : -360)) / 2 : (hp1 + hp2) / 2;
  }
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad)
    + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.20 * Math.cos((4 * hbp - 63) * rad);
  const dTh = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2);
  const Sc = 1 + 0.045 * Cbp, Sh = 1 + 0.015 * Cbp * T;
  const Rt = -Math.sin(2 * dTh * rad) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

/* ---------- Dichromat simulation (Viénot, Brettel & Mollon 1999) ---------- */
const RGB2LMS = [
  [17.8824, 43.5161, 4.11935],
  [3.45565, 27.1554, 3.86714],
  [0.0299566, 0.184309, 1.46709],
];
const LMS2RGB = [
  [0.080944, -0.130504, 0.116721],
  [-0.0102485, 0.0540194, -0.113615],
  [-0.000365294, -0.00412163, 0.693513],
];
const DICHROMAT = {
  normal: null,
  protan: [[0, 2.02344, -2.52581], [0, 1, 0], [0, 0, 1]],
  deutan: [[1, 0, 0], [0.494207, 0, 1.24827], [0, 0, 1]],
  tritan: [[1, 0, 0], [0, 1, 0], [-0.395913, 0.801109, 0]],
};
function simulate(hex, kind) {
  if (!kind || kind === 'normal') return hex.toUpperCase();
  const lms = mul(RGB2LMS, lin(hex));
  return rgb2hex(unlin(mul(LMS2RGB, mul(DICHROMAT[kind], lms))));
}

module.exports = {
  hex2rgb, rgb2hex, lin, unlin, lab, Lstar, oklab, oklch, oklch2hex, tweak,
  relLum, contrast, deltaE00, simulate, DICHROMAT,
};
