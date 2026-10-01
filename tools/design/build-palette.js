'use strict';
/** Derives every map-palette value (fill / hover / selected / stroke / label-on,
 *  the tenure ramp and the engraved texture assignment) from OKLCH anchors that
 *  were tuned by tools/design/polish.js (day) and polish-night.js (night), and
 *  writes tools/design/palette.js + palette.css.txt.
 *  Run: node tools/design/build-palette.js */
const fs = require('fs'), path = require('path');
const C = require('./colour.js');
/* Gamut-clamp: reduce chroma until the colour actually survives the round trip
   into sRGB. Without this a "more saturated" hover state silently clips to a
   pure primary and looks like a warning light rather than a printed tint. */
function hex(L, c, H) {
  let lo = 0, hi = c;
  const ok = cc => {
    const [l2, c2] = C.oklch(C.oklch2hex(L, cc, H));
    return Math.abs(l2 - L) < 0.005 && Math.abs(c2 - cc) < 0.004;
  };
  if (ok(c)) return C.oklch2hex(L, c, H);
  for (let i = 0; i < 22; i++) { const mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid; }
  return C.oklch2hex(L, lo, H);
}

/* Ten status anchors, PAPER theme. Order = the legend order. */
const DAY = {
  'never-british':   [0.9344, 0.0153,  87.8],
  'lost-former':     [0.7803, 0.0096,  70.5],
  'dominion':        [0.8660, 0.0680,  29.5],
  'settlement':      [0.6666, 0.1106,  26.6],
  'crown-conquered': [0.5196, 0.1497,  27.3],
  'company-rule':    [0.7764, 0.1056,  80.2],
  'lease':           [0.6600, 0.0687, 178.6],
  'protectorate':    [0.5971, 0.0853, 248.7],
  'mandate':         [0.4513, 0.0937, 315.2],
  'occupied':        [0.3620, 0.0283,  60.1],
};
/* LAMPLIT theme — tuned in its own right, not a formula applied to the day set. */
const NIGHT = {
  'never-british':   [0.2596, 0.0107,  81.6],
  'lost-former':     [0.3685, 0.0086,  68.0],
  'dominion':        [0.8798, 0.0638,  30.0],
  'settlement':      [0.6511, 0.1005,  25.5],
  'crown-conquered': [0.5399, 0.1407,  31.9],
  'company-rule':    [0.7673, 0.1065,  80.6],
  'lease':           [0.6812, 0.0663, 179.4],
  'protectorate':    [0.6073, 0.0899, 247.7],
  'mandate':         [0.5010, 0.0956, 315.9],
  'occupied':        [0.4074, 0.0433,  60.6],
};
/* Engraved texture backstop. Graph-coloured so that no pair separated by less
   than 12 dE00 under any vision model shares a texture. */
const TEXTURE = {                     // solved + proved by tools/design/textures.js
  'never-british':   'plain',
  'lost-former':     'hatch-45',
  'dominion':        'rule-h',
  'settlement':      'stipple',
  'crown-conquered': 'plain',
  'company-rule':    'cross',
  'lease':           'rule-v',
  'protectorate':    'hatch-135',
  'mandate':         'stipple-coarse',
  'occupied':        'hatch-135-dense',
};

function makeSet(anchors, { paper, ink, sea, dark, tenure, dirOverride }) {
  const S = { paper, ink, sea, fills: {}, hover: {}, selected: {}, stroke: {}, onFill: {}, texture: TEXTURE };
  for (const [n, [L, c, H]] of Object.entries(anchors)) {
    S.fills[n] = hex(L, c, H);
    /* Hover and selected step the fill a fixed distance and gain chroma, so the
       feedback is the same visible size for every category. On paper they deepen
       toward the ink (very dark tints lift instead); under lamplight they lift
       toward the lamp (very pale tints deepen instead). */
    /* settlement deepens into crown-conquered's madder if it darkens, so on
       paper it brightens instead — selection must never look like another status. */
    const dir = (dirOverride && dirOverride[n]) || (dark ? (L > 0.70 ? -1 : 1) : (L < 0.48 ? 1 : -1));
    const step = dark ? [0.050, 0.105] : [0.042, 0.088];
    S.hover[n]    = hex(L + dir * step[0], Math.min(0.29, c * 1.22 + 0.006), H);
    S.selected[n] = hex(L + dir * step[1], Math.min(0.31, c * 1.42 + 0.012), H);
    /* The engraved outline always contrasts with its own fill, in either theme. */
    S.stroke[n]   = hex(L > 0.60 ? Math.max(0.26, L - 0.32) : Math.min(0.88, L + 0.30),
                        Math.min(0.26, c * 0.90), H);
    /* Label colour for a legend patch or a badge sitting ON the fill. Picks the
       stronger of the two extremes so every one of the ten clears WCAG AA. */
    const f = S.fills[n];
    const darkInk = dark ? '#0F0C09' : '#14110D', lightInk = dark ? '#F3ECDE' : '#FBF8F3';
    S.onFill[n] = C.contrast(f, darkInk) >= C.contrast(f, lightInk) ? darkInk : lightInk;
  }
  S.tenure = tenure;
  return S;
}

/* Tenure ramp: single-hue madder sequential, seven steps, monotone in L* by
   construction so it can never be confused with the categorical hues. */
const tenureDay   = Array.from({ length: 7 }, (_, i) => hex(0.935 - i * 0.0885, 0.018 + i * 0.0228, 34 - i * 1.9));
const tenureNight = Array.from({ length: 7 }, (_, i) => hex(0.320 + i * 0.0810, 0.020 + i * 0.0215, 34 - i * 1.9));

const light = makeSet(DAY,   { paper: '#F8F5F0', ink: '#241F19', sea: '#BCD8EB', dark: false, dirOverride: { settlement: 1 }, tenure: tenureDay });
const night = makeSet(NIGHT, { paper: '#15120E', ink: '#EFE7D7', sea: '#0B1B2A', dark: true, tenure: tenureNight });

const banner = `'use strict';\n/* GENERATED by tools/design/build-palette.js — do not hand-edit.\n   Audited by tools/design/cvd-check.js. Mirrored into app/css/tokens.css. */\n`;
fs.writeFileSync(path.join(__dirname, 'palette.js'),
  banner + 'module.exports = ' + JSON.stringify({ light, night, DAY, NIGHT, TEXTURE }, null, 2) + ';\n');

const rows = [], order = Object.keys(DAY);
for (const [name, S] of [['light (paper)', light], ['night (lamplit)', night]]) {
  rows.push('/* ---- ' + name + ' ---- */');
  rows.push('  --map-sea: ' + S.sea + ';');
  for (const n of order) rows.push(
    '  --map-' + n + ': ' + S.fills[n] + ';  --map-' + n + '-hover: ' + S.hover[n] +
    ';  --map-' + n + '-selected: ' + S.selected[n] + ';  --map-' + n + '-stroke: ' + S.stroke[n] +
    ';  --map-' + n + '-on: ' + S.onFill[n] + ';');
  S.tenure.forEach((h, i) => rows.push('  --tenure-' + (i + 1) + ': ' + h + ';'));
}
fs.writeFileSync(path.join(__dirname, 'palette.css.txt'), rows.join('\n') + '\n');
console.log(rows.join('\n'));
