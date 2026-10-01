'use strict';
/** Simulated annealing over OKLCH within hue/lightness constraints, maximising the
 *  minimum pairwise CIEDE2000 across normal + protan + deutan + tritan vision. */
const C = require('./colour.js');
const VIEWS = ['normal', 'protan', 'deutan', 'tritan'];

// [Lmin,Lmax, Cmin,Cmax, Hmin,Hmax]
const BOX = {
  'never-british':   [0.915, 0.935, 0.004, 0.018,  70,  95],
  'lost-former':     [0.830, 0.880, 0.006, 0.026,  60,  95],
  'dominion':        [0.790, 0.870, 0.035, 0.090,   8,  42],
  'settlement':      [0.680, 0.780, 0.080, 0.150,  14,  42],
  'crown-conquered': [0.500, 0.590, 0.120, 0.190,  18,  40],
  'protectorate':    [0.560, 0.740, 0.045, 0.120, 225, 270],
  'company-rule':    [0.720, 0.850, 0.070, 0.140,  62,  98],
  'mandate':         [0.420, 0.560, 0.050, 0.130, 290, 340],
  'lease':           [0.580, 0.740, 0.040, 0.110, 155, 205],
  'occupied':        [0.330, 0.470, 0.010, 0.075,  40, 120],
};
const SEA = [0.895, 0.030, 232];
const NAMES = Object.keys(BOX);

const inGamut = (L, c, H) => {
  const hex = C.oklch2hex(L, c, H);
  const [l2, c2, h2] = C.oklch(hex);
  return Math.abs(l2 - L) < 0.006 && Math.abs(c2 - c) < 0.006;
};
const rnd = (a, b) => a + Math.random() * (b - a);
function randomState() {
  const s = {};
  for (const n of NAMES) {
    const [a, b, cc, dd, e, f] = BOX[n];
    let t = 0, v;
    do { v = [rnd(a, b), rnd(cc, dd), rnd(e, f)]; } while (!inGamut(...v) && ++t < 60);
    s[n] = v;
  }
  return s;
}
function score(state) {
  const hexes = {}; for (const n of NAMES) hexes[n] = C.oklch2hex(...state[n]);
  const seaHex = C.oklch2hex(...SEA);
  const sim = {}; for (const v of VIEWS) { sim[v] = {}; for (const n of NAMES) sim[v][n] = C.simulate(hexes[n], v); sim[v].__sea = C.simulate(seaHex, v); }
  let min = Infinity, worst = '';
  for (let i = 0; i < NAMES.length; i++) for (let j = i + 1; j < NAMES.length; j++) {
    for (const v of VIEWS) {
      const d = C.deltaE00(sim[v][NAMES[i]], sim[v][NAMES[j]]);
      if (d < min) { min = d; worst = NAMES[i] + '|' + NAMES[j] + '@' + v; }
    }
  }
  // land must also stand off the sea (weighted, not part of the min)
  let seaPen = 0;
  for (const n of NAMES) for (const v of VIEWS) {
    const d = C.deltaE00(sim[v][n], sim[v].__sea);
    if (d < 14) seaPen += (14 - d) * 0.6;
  }
  return { min, worst, obj: min - seaPen, hexes };
}
function anneal(iters = 26000) {
  let s = randomState(), sc = score(s), best = { s: JSON.parse(JSON.stringify(s)), sc };
  for (let i = 0; i < iters; i++) {
    const T = 2.4 * (1 - i / iters) ** 2 + 0.012;
    const n = NAMES[(Math.random() * NAMES.length) | 0];
    const [a, b, cc, dd, e, f] = BOX[n];
    const old = s[n].slice();
    const k = (Math.random() * 3) | 0;
    const cand = old.slice();
    if (k === 0) cand[0] = Math.min(b, Math.max(a, old[0] + (Math.random() - 0.5) * 0.09));
    if (k === 1) cand[1] = Math.min(dd, Math.max(cc, old[1] + (Math.random() - 0.5) * 0.05));
    if (k === 2) cand[2] = Math.min(f, Math.max(e, old[2] + (Math.random() - 0.5) * 26));
    if (!inGamut(...cand)) continue;
    s[n] = cand;
    const ns = score(s);
    if (ns.obj > sc.obj || Math.random() < Math.exp((ns.obj - sc.obj) / T)) {
      sc = ns;
      if (ns.obj > best.sc.obj) best = { s: JSON.parse(JSON.stringify(s)), sc: ns };
    } else s[n] = old;
  }
  return best;
}
let best = null;
const restarts = +(process.argv[2] || 8);
for (let r = 0; r < restarts; r++) {
  const b = anneal();
  process.stderr.write('restart ' + r + ' -> min ' + b.sc.min.toFixed(2) + ' obj ' + b.sc.obj.toFixed(2) + '  (' + b.sc.worst + ')\n');
  if (!best || b.sc.obj > best.sc.obj) best = b;
}
const out = {};
for (const n of NAMES) out[n] = C.oklch2hex(...best.s[n]);
console.log(JSON.stringify({ min: +best.sc.min.toFixed(2), worst: best.sc.worst, sea: C.oklch2hex(...SEA), fills: out,
  oklch: Object.fromEntries(NAMES.map(n => [n, best.s[n].map((x, i) => +x.toFixed(i === 2 ? 1 : 4))])) }, null, 2));
