#!/usr/bin/env node
/**
 * tools/evidence-audit.js — the Evidence Ledger, for someone with no browser
 * and no reason to trust one.
 *
 *   node tools/evidence-audit.js                  markdown to stdout
 *   node tools/evidence-audit.js --csv            comma-separated, for a spreadsheet
 *   node tools/evidence-audit.js --json           the rows, raw
 *   node tools/evidence-audit.js --summary        just the counts
 *   node tools/evidence-audit.js --no-range       only figures with a single value
 *   node tools/evidence-audit.js --low            only low-confidence figures
 *   node tools/evidence-audit.js --contested      only contested figures
 *   node tools/evidence-audit.js --limit 40
 *   node tools/evidence-audit.js --out FILE
 *
 * It reads the same shards the app reads and calls the same buildFigures() the
 * app calls (app/js/teacher/figures.js). There is no second extraction, which
 * is why this table and the one at #panel=evidence cannot drift apart.
 */
'use strict';

/* `node tools/evidence-audit.js | head -40` closes the pipe under us, and an
   unhandled EPIPE prints a stack trace where the reader expected a table.
   Piping into head is the first thing anybody does with a 898-row report. */
process.stdout.on('error', (e) => { if (e && e.code === 'EPIPE') process.exit(0); });

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'app', 'data', 'territories');

function argv(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}
const has = (f) => process.argv.includes(f);

function readShards() {
  const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
  const files = manifest.shards || [];
  const shards = files.map(file => ({
    file,
    payload: JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')),
  }));
  return { manifest, shards };
}

const esc = (s) => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
const fmt = (n) => (n === null || n === undefined ? '' : n.toLocaleString('en-GB'));

function value(r) {
  if (r.quantity === 'money') return '*(prose only)*';
  if (!r.hasValue) return '*(none)*';
  if (r.hasRange) return `${fmt(r.low)}–${fmt(r.high)}`;
  return fmt(r.low);
}
function sourceCell(r) {
  if (!r.sources.length) return '**[unsourced]**';
  const s = r.sources[0];
  const more = r.sources.length > 1 ? ` (+${r.sources.length - 1})` : '';
  const tag = r.sourceLevel === 'record' ? ' — record-level' : '';
  return `${esc(s.author)}, *${esc(s.work)}* (${s.year || 'n.d.'}, ${esc(s.kind)})${more}${tag}`;
}

/* The record filed against THIS QUANTITY, as opposed to the record it sits in. */
function warrantCell(r) {
  if (r.warrantStatus === 'ok') return 'checkable — ' + esc(r.warrantText);
  if (r.warrantStatus === 'weak') return 'named, no locator — ' + esc(r.warrantText);
  return '**none**';
}

/* The app's figures.js is an ES module and this repo's package.json is
   `"type": "commonjs"`, which is the shell's file and not ours to change. So we
   load the module's own source and evaluate it here. That is deliberate: the
   alternative is a second copy of the extraction logic, and a second copy is
   how an audit tool and the thing it audits stop agreeing. */
function loadFigures() {
  /* figures.js reads a figure's WARRANT class through core/warrant.js — the
     app's one contract for "no check, no number". warrant.js imports nothing
     and touches the DOM only inside its render functions, so the honest way to
     give the audit tool the same code the browser runs is to concatenate it,
     exactly as check-warrants.js does through a data: URL. Same rule as the
     paragraph above: one copy of the logic, or the audit and the app stop
     agreeing. */
  const strip = (file) => fs.readFileSync(path.join(ROOT, ...file), 'utf8')
    .replace(/^export default[\s\S]*$/m, '')
    .replace(/^import[\s\S]*?from\s+'[^']*';\s*$/gm, '')
    .replace(/^export (function|const|let|class)/gm, '$1');
  /* warrant.js and figures.js each declare their own `str` helper, so the two
     sources cannot share a scope. The warrant module is closed over and only
     the two names figures.js imports are bound. */
  const src = 'const __warrant = (function () {\n'
    + strip(['app', 'js', 'core', 'warrant.js'])
    + '\nreturn { readWarrant, warrantText };\n})();\n'
    + 'const readWarrant = __warrant.readWarrant, warrantText = __warrant.warrantText;\n'
    + strip(['app', 'js', 'teacher', 'figures.js']);
  const names = ['buildFigures', 'defaultSort', 'contentVersion', 'ledgerStats', 'fingerprint'];
  const body = src + '\nreturn {' + names.join(',') + '};';
  return new Function(body)();
}

(async () => {
  const { buildFigures, defaultSort, contentVersion, ledgerStats } = loadFigures();

  const { manifest, shards } = readShards();
  let rows = defaultSort(buildFigures(shards));
  const version = contentVersion(shards, manifest, rows);
  const stats = ledgerStats(rows);

  if (has('--no-range')) rows = rows.filter(r => r.hasValue && !r.hasRange);
  if (has('--low')) rows = rows.filter(r => r.confidence === 'low');
  if (has('--contested')) rows = rows.filter(r => r.contested);
  const limit = +argv('--limit', 0);
  if (limit > 0) rows = rows.slice(0, limit);

  let out;
  if (has('--json')) {
    out = JSON.stringify({ version, stats, rows }, null, 2);
  } else if (has('--csv')) {
    const head = ['subject', 'figure', 'low', 'high', 'unit', 'year', 'confidence',
      'contested', 'has_range', 'source_level', 'source', 'supports', 'note', 'note_scope',
      'warrant_status', 'warrant', 'shard', 'path', 'link'];
    const q = (s) => '"' + String(s == null ? '' : s).replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
    out = [head.join(',')].concat(rows.map(r => [
      r.subject, r.figure, r.low, r.high, r.unit, r.year, r.confidence, r.contested,
      r.hasRange, r.sourceLevel,
      r.sources.map(s => `${s.author}, ${s.work} (${s.year})`).join(' / '),
      r.supports, r.note, r.noteScope, r.warrantStatus, r.warrantText || '',
      r.shard, r.path, r.link,
    ].map(q).join(','))).join('\n');
  } else {
    const L = [];
    L.push('# The Evidence Ledger');
    L.push('');
    L.push(`**Content version:** \`${version.string}\``);
    L.push('');
    L.push('One row per figure in the atlas. Sorted weakest first: low confidence, then contested,');
    L.push('then figures stated as a single number with no range — which is where false precision hides.');
    L.push('');
    L.push('`record-level` on a source means the citation is the territory\'s general reading list, not a');
    L.push('source for this particular number. That is a real weakness and it is printed rather than hidden.');
    L.push('');
    L.push('The `this number` column is the sharper test and it is the one to read first. It is the figure\'s');
    L.push('WARRANT class under `app/js/core/warrant.js`: **checkable** — a record is named against this');
    L.push('quantity AND somewhere to look it up; **named** — a record and no locator; **none** — nothing is');
    L.push('filed against the number itself, whatever is cited for the record it sits in.');
    L.push('');
    L.push('A note marked *covers the whole record* was filed by the dataset on a block holding more than');
    L.push('one figure — a death toll and a displacement, say — so it describes the record and not the');
    L.push('single number it is printed beside. `--csv` carries the same thing in a `note_scope` column.');
    L.push('');
    L.push('## What is in here');
    L.push('');
    L.push('| | count |');
    L.push('|---|---:|');
    L.push(`| figures | ${stats.total} |`);
    L.push(`| low confidence | ${stats.low} |`);
    L.push(`| medium confidence | ${stats.medium} |`);
    L.push(`| high confidence | ${stats.high} |`);
    L.push(`| contested | ${stats.contested} |`);
    L.push(`| single value, no range | ${stats.noRange} |`);
    L.push(`| backed only by a record-level citation | ${stats.recordLevel} |`);
    L.push(`| no citation at all | ${stats.noSource} |`);
    L.push(`| stated in prose, not as a value (money) | ${stats.money} |`);
    L.push(`| **a record filed against this number, with a locator** | ${stats.warrantOk} |`);
    L.push(`| a record filed against this number, no locator | ${stats.warrantWeak} |`);
    L.push(`| **no record against the number itself** | ${stats.warrantBare} |`);
    L.push('');
    L.push(`Quantities: ${Object.entries(stats.quantities).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(' · ')}`);
    if (has('--summary')) { emit(L.join('\n')); return; }
    L.push('');
    L.push('## The rows');
    L.push('');
    L.push('| # | subject | figure | value | unit | year | conf. | contested | range | source | this number | supports | how it was counted | shard | path | link |');
    L.push('|---:|---|---|---:|---|---:|---|---|---|---|---|---|---|---|---|---|');
    /* A note filed on a block that holds more than one figure is marked, not
       silently reprinted as this number's own. See figures.js `noteScope`. */
    rows.forEach((r, i) => {
      L.push('| ' + [
        i + 1, esc(r.subject), esc(r.figure), value(r), esc(r.unit || ''),
        r.year || '', r.confidence, r.contested ? 'yes' : '',
        r.quantity === 'money' ? 'n/a' : (r.hasRange ? 'yes' : '**no**'),
        sourceCell(r), warrantCell(r), esc(r.supports),
        r.note ? ((r.noteScope === 'block' ? '*(covers the whole record, not this figure alone)* ' : '') + esc(r.note))
          : '*(no note)*',
        '`' + r.shard.replace('app/data/territories/', '') + '`', '`' + r.path + '`',
        '`' + r.link + '`',
      ].join(' | ') + ' |');
    });
    out = L.join('\n');
  }
  emit(out);

  function emit(text) {
    const file = argv('--out', null);
    if (typeof file === 'string') { fs.writeFileSync(file, text + '\n'); process.stderr.write(`wrote ${file}\n`); }
    else process.stdout.write(text + '\n');
  }
})().catch(err => { console.error(err); process.exit(2); });
