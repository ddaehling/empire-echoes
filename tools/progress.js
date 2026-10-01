#!/usr/bin/env node
// Tiny append-only progress recorder. Safe for concurrent agents (atomic rename + retry).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'progress', 'state.json');

function load() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch { return { started: null, wave: 0, pieces: {}, events: [], verdicts: [] }; }
}
function save(s) {
  const tmp = FILE + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(s, null, 2));
  fs.renameSync(tmp, FILE);
}
function withLock(fn) {
  const lock = FILE + '.lock';
  for (let i = 0; i < 400; i++) {
    try { const fd = fs.openSync(lock, 'wx'); fs.closeSync(fd);
      try { const s = load(); fn(s); save(s); } finally { fs.unlinkSync(lock); }
      return true;
    } catch (e) { if (e.code !== 'EEXIST') throw e;
      try { if (Date.now() - fs.statSync(lock).mtimeMs > 15000) fs.unlinkSync(lock); } catch {}
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
    }
  }
  return false;
}
const [,, cmd, ...rest] = process.argv;
const now = () => new Date().toISOString();
withLock(s => {
  if (!s.started) s.started = now();
  if (cmd === 'piece') {
    const [id, status, ...noteParts] = rest;
    const note = noteParts.join(' ');
    const p = s.pieces[id] || (s.pieces[id] = { id, status: 'pending', rounds: 0, note: '', history: [] });
    p.status = status; if (note) p.note = note; p.updated = now();
    p.history.push({ t: now(), status, note });
    if (status === 'round') p.rounds++;
  } else if (cmd === 'name') {
    const [id, ...t] = rest;
    const p = s.pieces[id] || (s.pieces[id] = { id, status: 'pending', rounds: 0, note: '', history: [] });
    p.title = t.join(' ');
  } else if (cmd === 'verdict') {
    const [id, winner, ...gap] = rest;
    s.verdicts.push({ t: now(), piece: id, winner, gap: gap.join(' ') });
    const p = s.pieces[id]; if (p) { p.lastVerdict = winner; p.lastGap = gap.join(' '); }
  } else if (cmd === 'wave') {
    s.wave = Number(rest[0]) || s.wave;
    s.waveLabel = rest.slice(1).join(' ');
  } else if (cmd === 'event') {
    s.events.push({ t: now(), msg: rest.join(' ') });
    if (s.events.length > 600) s.events = s.events.slice(-600);
  } else if (cmd === 'headline') {
    s.headline = rest.join(' ');
  }
  s.updated = now();
});
