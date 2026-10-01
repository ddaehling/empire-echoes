#!/usr/bin/env node
'use strict';
/** Assigns an engraved texture to each status so that NO pair separated by less
 *  than 12 dE00 (in either theme, under any of the four vision models) shares a
 *  texture. Exhaustive backtracking over an ordered texture list, so the result
 *  is proved, not asserted. Run: node tools/design/textures.js */
const C = require('./colour.js'), P = require('./palette.js');
const V = ['normal', 'protan', 'deutan', 'tritan'], TIER_A = 12;
const TEX = ['plain', 'rule-h', 'rule-v', 'hatch-45', 'hatch-135', 'cross', 'stipple', 'stipple-coarse', 'hatch-135-dense'];
/* Preference order per status: the first texture is the one the design WANTS
   (it should read as a plausible engraver's mark for that kind of rule); the
   solver falls back down the list only if a constrained neighbour took it. */
const WANT = {
  'never-british':   ['plain'],
  'crown-conquered': ['plain'],
  'lost-former':     ['hatch-45', 'stipple-coarse', 'rule-h'],
  'dominion':        ['rule-h', 'stipple', 'rule-v'],
  'settlement':      ['stipple', 'rule-h', 'cross'],
  'company-rule':    ['cross', 'stipple-coarse', 'rule-h'],
  'lease':           ['rule-v', 'hatch-135', 'cross'],
  'protectorate':    ['hatch-135', 'rule-v', 'hatch-45'],
  'mandate':         ['stipple-coarse', 'cross', 'rule-h'],
  'occupied':        ['hatch-135-dense', 'hatch-45', 'cross'],
};
const N = Object.keys(P.light.fills);

const edges = new Set();
for (const set of [P.light, P.night]) for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
  const w = Math.min(...V.map(v => C.deltaE00(C.simulate(set.fills[N[i]], v), C.simulate(set.fills[N[j]], v))));
  if (w < TIER_A) edges.add(N[i] + '|' + N[j]);
}
const adj = Object.fromEntries(N.map(n => [n, new Set()]));
for (const e of edges) { const [a, b] = e.split('|'); adj[a].add(b); adj[b].add(a); }

const order = [...N].sort((a, b) => adj[b].size - adj[a].size);   // most constrained first
const asn = {};
(function solve(i) {
  if (i === order.length) return true;
  const n = order[i];
  const opts = [...(WANT[n] || []), ...TEX];
  for (const t of opts) {
    if ([...adj[n]].some(m => asn[m] === t)) continue;
    asn[n] = t;
    if (solve(i + 1)) return true;
    delete asn[n];
  }
  return false;
})(0);

console.log('constrained pairs (worst-case dE00 < ' + TIER_A + ' in either theme): ' + edges.size);
for (const e of [...edges].sort()) {
  const [a, b] = e.split('|');
  console.log('  ' + (a + ' / ' + b).padEnd(40) + asn[a] + '  vs  ' + asn[b] + (asn[a] === asn[b] ? '   << CLASH' : ''));
}
console.log('');
console.log('degree:'); for (const n of order) console.log('  ' + n.padEnd(18) + adj[n].size + '   -> ' + asn[n]);
console.log('');
console.log(JSON.stringify(Object.fromEntries(N.map(n => [n, asn[n]])), null, 2));
const clash = [...edges].some(e => { const [a, b] = e.split('|'); return asn[a] === asn[b]; });
console.log(clash ? 'FAIL: a constrained pair shares a texture.' : 'PASS: every constrained pair has a different texture; ' + new Set(Object.values(asn)).size + ' textures used.');
process.exit(clash ? 1 : 0);
