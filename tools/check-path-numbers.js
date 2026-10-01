#!/usr/bin/env node
/**
 * check-path-numbers.js — NO CHECK, NO NUMBER, ON THE AUTHORED PATH.
 *
 * `tools/check-warrants.js` audits the quantities the DATASET prints. This one
 * audits the quantities the LESSON prints in its own voice: every magnitude
 * typed into `tours.json`, `gates.json`, `close.json` and `thesis.json`.
 *
 * A magnitude here is money, a thousands-separated number, "N million", a
 * spelled-out "sixty thousand", or a percentage. Years, dates, step counts and
 * ordinals are not magnitudes and are not audited: "1765" is a date the record
 * carries; "£1.72 million" is a claim somebody produced by a method.
 *
 * THE RULE. A magnitude is either
 *   - printed through `{{fig:<id>}}`, in which case `app/js/tours/figures.json`
 *     carries its author, work, year, specific claim and where to look, and the
 *     beat prints that record under the number; or
 *   - matched by ALLOWED below, with the reason it needs no warrant of its own.
 * Anything else is a bare quantity on the path.
 *
 * THE FLOOR RISES. `FLOOR` is the number of bare magnitudes this build may
 * carry. It is a ratchet: converting a figure lowers it, a new bare number
 * fails the build. It may only ever be reduced.
 *
 *   node tools/check-path-numbers.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = [
  'app/js/tours/tours.json',
  'app/js/tours/gates.json',
  'app/js/close/close.json',
  'app/js/close/thesis.json',
];

/* The magnitude pattern. Deliberately narrow: it must not fire on a year, a
   date, a step number or a page reference. */
const MAG = new RegExp([
  '£\\d[\\d.,]*\\s*(?:million|billion|m\\b)?',
  '\\b\\d{1,3}(?:,\\d{3})+\\b',
  '\\b(?:one|two|three|four|five|six|seven|eight|nine|ten|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion)\\s+(?:million|thousand|billion)\\b',
  '\\b\\d+(?:\\.\\d+)?\\s*(?:million|billion|per cent|%)\\b',
].join('|'), 'gi');

/**
 * The magnitudes that need no warrant of their own, each with its reason.
 * A reason is required: a list without reasons becomes a list of exemptions.
 */
const ALLOWED = [
  [/^£0\.?$/i, 'zero is not an estimate: it is the absence of a payment, and the payment it is the absence of is warranted beside it'],
  [/^three hundred million$/i, 'an order of magnitude for the population of British India ("past three hundred million"); the population figures themselves are the dataset’s and are audited by check-warrants.js'],
  [/^1,200$/, 'the Hunter Committee’s own wounded count, printed inside the Amritsar figure’s warranted record'],
  [/^800,000$/, 'the low end of a range printed in a figure card that carries its own note'],
  [/^6,000$/, 'the European death toll of 1857, printed in a figure card whose note is about how it was counted'],
];

let bare = 0;
let tokens = 0;
const rows = [];

function walk(v, where, file) {
  if (typeof v === 'string') {
    tokens += (v.match(/\{\{fig:[a-z0-9-]+\}\}/g) || []).length;
    const s = v.replace(/\{\{fig:[a-z0-9-]+\}\}/g, '');
    MAG.lastIndex = 0;
    let m;
    while ((m = MAG.exec(s))) {
      const hit = m[0].trim();
      if (ALLOWED.some(([re]) => re.test(hit))) continue;
      bare += 1;
      rows.push({ file, where, hit, ctx: s.slice(Math.max(0, m.index - 46), m.index + 54).replace(/\s+/g, ' ') });
    }
    return;
  }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, where + '[' + i + ']', file)); return; }
  if (v && typeof v === 'object') {
    for (const k of Object.keys(v)) {
      if (k.startsWith('$')) continue;          // authored notes to editors, never printed
      walk(v[k], where + '.' + k, file);
    }
  }
}

for (const f of FILES) {
  walk(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')), '', f);
}

/* Every token must resolve, and a registered figure nobody prints is dead. */
const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'app/js/tours/figures.json'), 'utf8')).figures;
const used = new Set();
for (const f of FILES) {
  const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of raw.matchAll(/\{\{fig:([a-z0-9-]+)\}\}/g)) used.add(m[1]);
}
const ghosts = [...used].filter((id) => !reg[id]);
const unused = Object.keys(reg).filter((id) => !used.has(id));

const FLOOR = 0;    // was 36; round 3 converted the last of them. It only comes down.
                    // Every magnitude the lesson prints in its own voice — the
                    // beats, the five chapter arguments, the Complication Gates
                    // and the Close's thirteen lines — is now registered in
                    // app/js/tours/figures.json with the record that warrants it
                    // and printed through a {{fig:}} token. The entries left in
                    // ALLOWED below each carry the reason they need none.

console.log('path number audit — the quantities the lesson prints in its own voice');
console.log('  through {{fig:}}   ' + String(tokens).padStart(3) + '   warranted in app/js/tours/figures.json');
console.log('  bare               ' + String(bare).padStart(3) + '   typed into the prose with no record');
console.log('  registered         ' + String(Object.keys(reg).length).padStart(3) + '   figures in the registry');
console.log('');
for (const r of rows) console.log('  BARE  ' + r.file + r.where + '  ::  ' + r.hit + '   …' + r.ctx + '…');
if (ghosts.length) console.log('\n  GHOST TOKENS (no such figure): ' + ghosts.join(', '));
if (unused.length) console.log('\n  registered but never printed: ' + unused.join(', '));

let fail = false;
if (ghosts.length) { console.log('\nFAIL — a token names a figure that is not registered.'); fail = true; }
if (bare > FLOOR) {
  console.log('\nFAIL — ' + bare + ' bare quantities on the path, floor is ' + FLOOR
    + '. Register it in figures.json and print it with {{fig:…}}.');
  fail = true;
}
if (!fail) console.log('\n' + bare + ' bare, floor ' + FLOOR + '. ' + tokens + ' printed through a warrant. The floor only ever comes down.');
process.exit(fail ? 1 : 0);
