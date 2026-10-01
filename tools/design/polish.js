'use strict';
/** Local search around hand-picked atlas-plate anchors: maximise the minimum
 *  pairwise CIEDE2000 across all four views WITHOUT drifting far from the
 *  aesthetic anchor (penalty on OKLCH distance). Beauty first, then separation. */
const C = require('./colour.js');
const VIEWS = ['normal', 'protan', 'deutan', 'tritan'];
const ANCHOR = {
  'never-british':   [0.932, 0.014,  88],
  'lost-former':     [0.795, 0.010,  70],
  'dominion':        [0.855, 0.062,  22],
  'settlement':      [0.715, 0.118,  26],
  'crown-conquered': [0.520, 0.150,  26],
  'company-rule':    [0.785, 0.105,  80],
  'lease':           [0.655, 0.070, 178],
  'protectorate':    [0.600, 0.085, 248],
  'mandate':         [0.450, 0.095, 315],
  'occupied':        [0.365, 0.030,  60],
};
const SEA = [0.895, 0.030, 232];
const NAMES = Object.keys(ANCHOR);
const SPAN = { L: 0.05, C: 0.035, H: 12 };   // how far polish may wander
// The two GROUND tones stay quiet by decree: they are the paper the empire is printed on.
const SPAN_OVERRIDE = { 'never-british': { L: 0.02, C: 0.006, H: 8 }, 'lost-former': { L: 0.03, C: 0.006, H: 10 } };
const span = n => SPAN_OVERRIDE[n] || SPAN;
const LAMBDA = 26;                            // aesthetic gravity

const inGamut = (L, c, H) => { const [l2, c2] = C.oklch(C.oklch2hex(L, c, H)); return Math.abs(l2 - L) < 0.006 && Math.abs(c2 - c) < 0.006; };
function metrics(state) {
  const hex = {}; for (const n of NAMES) hex[n] = C.oklch2hex(...state[n]);
  const seaHex = C.oklch2hex(...SEA);
  const sim = {}; for (const v of VIEWS) { sim[v] = {}; for (const n of NAMES) sim[v][n] = C.simulate(hex[n], v); sim[v].__sea = C.simulate(seaHex, v); }
  let min = Infinity, worst = '', softsum = 0;
  for (let i = 0; i < NAMES.length; i++) for (let j = i + 1; j < NAMES.length; j++) for (const v of VIEWS) {
    const d = C.deltaE00(sim[v][NAMES[i]], sim[v][NAMES[j]]);
    if (d < min) { min = d; worst = NAMES[i] + ' vs ' + NAMES[j] + ' @' + v; }
    softsum += Math.min(d, 16);                     // reward lifting ALL weak pairs, not only the worst
  }
  let seaPen = 0;
  for (const n of NAMES) for (const v of VIEWS) { const d = C.deltaE00(sim[v][n], sim[v].__sea); if (d < 15) seaPen += (15 - d) * 0.5; }
  let drift = 0;
  for (const n of NAMES) { const a = ANCHOR[n], s = state[n];
    const sp = span(n);
    drift += ((s[0] - a[0]) / sp.L) ** 2 + ((s[1] - a[1]) / sp.C) ** 2 + ((s[2] - a[2]) / sp.H) ** 2; }
  return { min, worst, hex, obj: min * 3 + softsum * 0.06 - seaPen - LAMBDA * drift / NAMES.length };
}
let s = JSON.parse(JSON.stringify(ANCHOR)), sc = metrics(s);
let best = { s: JSON.parse(JSON.stringify(s)), sc };
const ITER = +(process.argv[2] || 120000);
for (let i = 0; i < ITER; i++) {
  const T = 1.2 * (1 - i / ITER) ** 2 + 0.004;
  const n = NAMES[(Math.random() * NAMES.length) | 0], a = ANCHOR[n], old = s[n].slice(), cand = old.slice();
  const sp = span(n);
  const k = (Math.random() * 3) | 0;
  if (k === 0) cand[0] = Math.max(a[0] - sp.L, Math.min(a[0] + sp.L, old[0] + (Math.random() - .5) * 0.05));
  if (k === 1) cand[1] = Math.max(Math.max(0.004, a[1] - sp.C), Math.min(a[1] + sp.C, old[1] + (Math.random() - .5) * 0.03));
  if (k === 2) cand[2] = Math.max(a[2] - sp.H, Math.min(a[2] + sp.H, old[2] + (Math.random() - .5) * 12));
  if (!inGamut(...cand)) continue;
  s[n] = cand; const ns = metrics(s);
  if (ns.obj > sc.obj || Math.random() < Math.exp((ns.obj - sc.obj) / T)) { sc = ns; if (ns.obj > best.sc.obj) best = { s: JSON.parse(JSON.stringify(s)), sc: ns }; }
  else s[n] = old;
}
console.error('anchor min: ' + metrics(ANCHOR).min.toFixed(2) + '  ->  polished min: ' + best.sc.min.toFixed(2) + '   worst: ' + best.sc.worst);
const oklchOut = {}, hexOut = {};
for (const n of NAMES) { oklchOut[n] = best.s[n].map((x, i) => +x.toFixed(i === 2 ? 1 : 4)); hexOut[n] = C.oklch2hex(...best.s[n]); }
console.log(JSON.stringify({ sea: C.oklch2hex(...SEA), fills: hexOut, oklch: oklchOut }, null, 2));
