'use strict';
/** Same local search as polish.js, run on the lamplit anchors. The night palette
 *  is tuned in its own right, not derived by a formula from the day palette. */
const C = require('./colour.js');
const V = ['normal', 'protan', 'deutan', 'tritan'];
const ANCHOR = {
  'never-british':   [0.262, 0.0105,  82],
  'lost-former':     [0.362, 0.0090,  68],
  'dominion':        [0.848, 0.0680,  29.5],
  'settlement':      [0.679, 0.1110,  26.6],
  'crown-conquered': [0.554, 0.1500,  27.3],
  'company-rule':    [0.774, 0.1060,  80.2],
  'lease':           [0.673, 0.0690, 178.6],
  'protectorate':    [0.620, 0.0850, 248.7],
  'mandate':         [0.496, 0.0940, 315.2],
  'occupied':        [0.420, 0.0280,  60.1],
};
const SEA = [0.160, 0.030, 255];
const N = Object.keys(ANCHOR);
const SPAN = { L: 0.055, C: 0.040, H: 14 };
const OV = { 'never-british': { L: 0.02, C: 0.005, H: 8 }, 'lost-former': { L: 0.03, C: 0.005, H: 8 } };
const sp = n => OV[n] || SPAN;
const SEA_FLOOR = 12.5, LAMBDA = 22;
const inG = (L, c, H) => { const [a, b] = C.oklch(C.oklch2hex(L, c, H)); return Math.abs(a - L) < 0.007 && Math.abs(b - c) < 0.007; };
function m(st) {
  const hex = {}; for (const n of N) hex[n] = C.oklch2hex(...st[n]);
  const sea = C.oklch2hex(...SEA);
  const sim = {}; for (const v of V) { sim[v] = {}; for (const n of N) sim[v][n] = C.simulate(hex[n], v); sim[v].__s = C.simulate(sea, v); }
  let min = Infinity, worst = '', soft = 0;
  for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) for (const v of V) {
    const d = C.deltaE00(sim[v][N[i]], sim[v][N[j]]);
    if (d < min) { min = d; worst = N[i] + ' vs ' + N[j] + ' @' + v; }
    soft += Math.min(d, 16);
  }
  let seaPen = 0;
  for (const n of N) for (const v of V) { const d = C.deltaE00(sim[v][n], sim[v].__s); if (d < SEA_FLOOR) seaPen += (SEA_FLOOR - d) * 1.2; }
  let drift = 0;
  for (const n of N) { const a = ANCHOR[n], s = st[n], q = sp(n);
    drift += ((s[0] - a[0]) / q.L) ** 2 + ((s[1] - a[1]) / q.C) ** 2 + ((s[2] - a[2]) / q.H) ** 2; }
  return { min, worst, hex, obj: min * 3 + soft * 0.06 - seaPen - LAMBDA * drift / N.length };
}
let s = JSON.parse(JSON.stringify(ANCHOR)), sc = m(s), best = { s: JSON.parse(JSON.stringify(s)), sc };
const IT = +(process.argv[2] || 160000);
for (let i = 0; i < IT; i++) {
  const T = 1.2 * (1 - i / IT) ** 2 + 0.004;
  const n = N[(Math.random() * N.length) | 0], a = ANCHOR[n], q = sp(n), old = s[n].slice(), cd = old.slice();
  const k = (Math.random() * 3) | 0;
  if (k === 0) cd[0] = Math.max(a[0] - q.L, Math.min(a[0] + q.L, old[0] + (Math.random() - .5) * 0.05));
  if (k === 1) cd[1] = Math.max(Math.max(0.004, a[1] - q.C), Math.min(a[1] + q.C, old[1] + (Math.random() - .5) * 0.03));
  if (k === 2) cd[2] = Math.max(a[2] - q.H, Math.min(a[2] + q.H, old[2] + (Math.random() - .5) * 12));
  if (!inG(...cd)) continue;
  s[n] = cd; const ns = m(s);
  if (ns.obj > sc.obj || Math.random() < Math.exp((ns.obj - sc.obj) / T)) { sc = ns; if (ns.obj > best.sc.obj) best = { s: JSON.parse(JSON.stringify(s)), sc: ns }; }
  else s[n] = old;
}
console.error('anchor min ' + m(ANCHOR).min.toFixed(2) + ' -> polished ' + best.sc.min.toFixed(2) + '   worst: ' + best.sc.worst);
const o = {}; for (const n of N) o[n] = best.s[n].map((x, i) => +x.toFixed(i === 2 ? 1 : 4));
console.log(JSON.stringify({ sea: C.oklch2hex(...SEA), oklch: o, hex: Object.fromEntries(N.map(n => [n, C.oklch2hex(...best.s[n])])) }, null, 2));
