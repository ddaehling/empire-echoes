#!/usr/bin/env node
/**
 * Regenerates app/data/territories/index.json from what is on disk.
 *
 *   node tools/data-index.js          rewrite the manifest
 *   node tools/data-index.js --check  exit 1 if it is out of date
 *
 * Any app/data/territories/<name>.json is a shard, except index.json and
 * anything starting with "_" (templates). Event-only shards under
 * app/data/events/ are listed too. The shell loads exactly what is listed here
 * — a shard that is not in this file never reaches the app.
 */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'app', 'data', 'territories');
const EVENTS = path.join(ROOT, 'app', 'data', 'events');
const FILE = path.join(DIR, 'index.json');

const isShard = f => f.endsWith('.json') && f !== 'index.json' && f !== 'manifest.json' && !f.startsWith('_');
const shards = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter(isShard).sort() : [];
const events = fs.existsSync(EVENTS) ? fs.readdirSync(EVENTS).filter(isShard).sort().map(f => '../events/' + f) : [];

let current = {};
try { current = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (_) {}
const next = { ...current, shards, events };
const same = JSON.stringify(current.shards) === JSON.stringify(shards)
          && JSON.stringify(current.events || []) === JSON.stringify(events);

if (process.argv.includes('--check')) {
  console.log(same ? 'index.json is up to date: ' + (shards.join(', ') || '(no shards)')
                   : 'OUT OF DATE — run: node tools/data-index.js');
  process.exit(same ? 0 : 1);
}
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(FILE, JSON.stringify(next, null, 2) + '\n');
console.log('territories/index.json -> ' + (shards.join(', ') || '(no shards yet)')
  + (events.length ? '  + events: ' + events.join(', ') : ''));
