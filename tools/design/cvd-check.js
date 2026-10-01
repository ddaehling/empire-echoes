#!/usr/bin/env node
'use strict';
/**
 * Colour-blind safety audit for the British Empire Atlas map palette.
 *
 *   node tools/design/cvd-check.js              # audit the light (paper) palette
 *   node tools/design/cvd-check.js --night      # audit the lamplit palette
 *   node tools/design/cvd-check.js --both       # both, exit non-zero if either fails
 *
 * Simulates protanopia, deuteranopia and tritanopia (Viénot/Brettel/Mollon 1999
 * LMS projection) and reports CIEDE2000 separation for all 45 category pairs
 * under all four vision models.
 *
 * TWO-TIER STANDARD. Ten flat fills cannot all clear dE00 >= 12 under three
 * dichromacies at once — a free simulated-annealing search over the whole
 * OKLCH gamut (tools/design/optimise.js) tops out near 7.8. So:
 *   TIER A  worst-case dE00 >= 12  -> colour alone is sufficient.
 *   TIER B  worst-case dE00 >=  6  -> colour PLUS a distinct engraved texture.
 *   FAIL    worst-case dE00 <   6  -> not shippable at any texture.
 * Every TIER B pair is checked here for having genuinely different textures.
 */
const C = require('./colour.js');
const P = require('./palette.js');

const TIER_A = 12, FLOOR = 6;
// Land must stand off the sea. At night both are near-black and CIEDE2000 is
// compressed down there, so the night floor is lower and the theme mandates a
// coastline stroke (--map-coast) instead. See docs/DESIGN.md.
const SEA_FLOOR = { light: 15, night: 12 };
const VIEWS = ['normal', 'protan', 'deutan', 'tritan'];
const pad = (s, n) => String(s).padEnd(n);
const padS = (s, n) => String(s).padStart(n);

function audit(setName) {
  const set = P[setName];
  const MIN_DE_SEA = SEA_FLOOR[setName];
  const names = Object.keys(set.fills), fills = set.fills;
  const out = [];
  const say = (...a) => out.push(a.join(' '));
  let hardFails = 0, textureFails = 0, seaFails = 0;

  say('');
  say('================ MAP PALETTE AUDIT — ' + (setName === 'night' ? 'LAMPLIT (night)' : 'PAPER (light)') + ' ================');
  say('paper ' + set.paper + '    ink ' + set.ink + '    sea ' + set.sea);
  say('');
  say(pad('category', 18) + pad('fill', 9) + padS('L*', 6) + padS('/sea', 7) + padS('/paper', 8) + padS('/ink', 7) +
      '  ' + pad('texture', 16) + 'protan   deutan   tritan');
  for (const n of names) {
    const h = fills[n];
    say(pad(n, 18) + pad(h, 9) + padS(C.Lstar(h).toFixed(1), 6) +
      padS(C.contrast(h, set.sea).toFixed(2), 7) + padS(C.contrast(h, set.paper).toFixed(2), 8) +
      padS(C.contrast(h, set.ink).toFixed(2), 7) + '  ' + pad(set.texture[n], 16) +
      VIEWS.slice(1).map(v => C.simulate(h, v)).join('  '));
  }

  say('');
  say('--- every land fill vs the SEA ' + set.sea + ' (CIEDE2000, floor ' + MIN_DE_SEA + ') ---');
  say(pad('category', 18) + VIEWS.map(v => padS(v, 9)).join('') + padS('worst', 9));
  for (const n of names) {
    const row = VIEWS.map(v => C.deltaE00(C.simulate(fills[n], v), C.simulate(set.sea, v)));
    const worst = Math.min(...row);
    if (worst < MIN_DE_SEA) seaFails++;
    say(pad(n, 18) + row.map(d => padS(d.toFixed(1), 9)).join('') + padS(worst.toFixed(1), 9) + (worst < MIN_DE_SEA ? '  << FAIL' : ''));
  }

  const worstPair = {};
  for (const v of VIEWS) {
    say('');
    say('--- pairwise CIEDE2000 · ' + v.toUpperCase() + (v === 'normal' ? ' vision' : 'opia') + ' ---');
    say(pad('', 18) + names.map(n => padS(n.slice(0, 7), 8)).join(''));
    for (const a of names) {
      const cells = names.map(b => {
        if (a === b) return padS('·', 8);
        const d = C.deltaE00(C.simulate(fills[a], v), C.simulate(fills[b], v));
        const k = [a, b].sort().join('|');
        if (!worstPair[k] || d < worstPair[k].d) worstPair[k] = { d, view: v };
        return padS(d.toFixed(1), 8);
      });
      say(pad(a, 18) + cells.join(''));
    }
  }

  const ranked = Object.entries(worstPair).sort((a, b) => a[1].d - b[1].d);
  say('');
  say('--- WORST CASE per pair, across all four vision models ---');
  say(pad('  dE00', 8) + pad('view', 9) + pad('pair', 40) + pad('tier', 8) + 'textures');
  for (const [k, { d, view }] of ranked) {
    const [a, b] = k.split('|');
    const tier = d >= TIER_A ? 'A' : d >= FLOOR ? 'B' : 'FAIL';
    const tex = set.texture[a] + ' / ' + set.texture[b];
    let note = '';
    if (tier === 'FAIL') { hardFails++; note = '  << BELOW FLOOR'; }
    else if (tier === 'B' && set.texture[a] === set.texture[b]) { textureFails++; note = '  << SAME TEXTURE, NOT SEPARABLE'; }
    say(padS(d.toFixed(1), 6) + '  ' + pad(view, 9) + pad(a + '  vs  ' + b, 40) + pad(tier, 8) + tex + note);
  }

  const tierA = ranked.filter(([, x]) => x.d >= TIER_A).length;
  say('');
  say('pairs: ' + ranked.length + '   tier A (colour alone): ' + tierA +
      '   tier B (colour + texture): ' + (ranked.length - tierA - hardFails) + '   below floor: ' + hardFails);
  say('minimum worst-case separation: ' + ranked[0][1].d.toFixed(2) + ' dE00 (' + ranked[0][0].replace('|', ' vs ') + ' @ ' + ranked[0][1].view + ')');
  say('land/sea failures: ' + seaFails + '   tier-B pairs sharing a texture: ' + textureFails);

  say('');
  say('--- tenure value ramp (must fall monotonically in L* under every model) ---');
  let rampFail = 0;
  for (const v of VIEWS) {
    const Ls = set.tenure.map(h => C.Lstar(C.simulate(h, v)));
    const asc = set.tenure.map(h => C.Lstar(h))[0] < C.Lstar(set.tenure[6]);
    const ok = Ls.every((l, i) => i === 0 || (asc ? l > Ls[i - 1] : l < Ls[i - 1]));
    const steps = Ls.slice(1).map((l, i) => Math.abs(l - Ls[i]));
    if (!ok) rampFail++;
    say('  ' + pad(v, 8) + 'L*: ' + Ls.map(l => padS(l.toFixed(0), 3)).join(' ') +
        '   min step ' + Math.min(...steps).toFixed(1) + (ok ? '   monotonic ok' : '   << NOT MONOTONIC'));
  }

  const pass = hardFails === 0 && textureFails === 0 && seaFails === 0 && rampFail === 0;
  say('');
  say(pass
    ? 'VERDICT: PASS — all ' + ranked.length + ' pairs clear the ' + FLOOR + ' dE00 floor under normal, protan, deutan\n         and tritan vision; every sub-' + TIER_A + ' pair carries a different engraved texture;\n         all land stands >= ' + MIN_DE_SEA + ' dE00 off the sea; the tenure ramp is monotonic in all four.'
    : 'VERDICT: FAIL — ' + (hardFails + textureFails + seaFails + rampFail) + ' problem(s) above.');
  console.log(out.join('\n'));
  return pass;
}

const sets = process.argv.includes('--both') ? ['light', 'night']
  : process.argv.includes('--night') ? ['night'] : ['light'];
const ok = sets.map(audit).every(Boolean);
process.exit(ok ? 0 : 1);
