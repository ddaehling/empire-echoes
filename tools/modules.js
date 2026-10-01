#!/usr/bin/env node
/**
 * Regenerates app/js/modules.json from what is actually on disk.
 *
 *   node tools/modules.js          list + rewrite the manifest
 *   node tools/modules.js --check  exit 1 if the manifest is out of date
 *
 * Any app/js/<area>/index.js is a feature module. Mount order follows ORDER
 * below, then alphabetical for anything new.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const JS = path.join(ROOT, 'app', 'js');
const FILE = path.join(JS, 'modules.json');
const ORDER = ['map', 'timeline', 'panels', 'legend', 'tours', 'quiz', 'viz', 'search', 'onboarding', 'teacher'];

const areas = fs.readdirSync(JS, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'core')
  .map(d => d.name)
  .filter(name => fs.existsSync(path.join(JS, name, 'index.js')))
  .sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });

const current = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const next = { ...current, modules: areas.map(a => './' + a + '/index.js') };
const same = JSON.stringify(current.modules) === JSON.stringify(next.modules);

if (process.argv.includes('--check')) {
  console.log(same ? 'modules.json is up to date: ' + areas.join(', ') : 'OUT OF DATE — run: node tools/modules.js');
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(FILE, JSON.stringify(next, null, 2) + '\n');
console.log('modules.json -> ' + (areas.length ? areas.join(', ') : '(none yet)'));
