/**
 * main.js — boot.
 *
 *   1. show a loading state that is honest about what it is doing
 *   2. load the dataset (falling back to a placeholder if shards are missing)
 *   3. restore state from the URL, so a shared link lands exactly where it should
 *   4. discover and mount the feature modules, isolating any that break
 *   5. reveal the app and announce it
 *
 * Nothing below makes a content decision. Every visible word in the finished
 * atlas comes from a feature module or from app/data.
 */

import { store } from './core/store.js';
import { bus } from './core/bus.js';
import { createRegistry } from './core/registry.js';
import { loadData } from './core/data.js';
import * as urlModule from './core/url.js';
import * as format from './core/format.js';
import * as util from './core/util.js';

const { $, announce, exists, storage } = util;

/**
 * Where modules come from.
 *
 * app/js/modules.json is the registry: `modules` is the list the shell loads, in
 * order. Add one line there when you land a module (or run `node tools/modules.js`
 * to regenerate it from the filesystem). Set `autodiscover: true` in that file to
 * additionally probe every path in `areas` — handy while developing, at the cost
 * of a 404 per area that does not exist yet.
 *
 * AREAS below is only the fallback used if modules.json itself is missing.
 */
const AREAS = [
  './map/index.js',
  './timeline/index.js',
  './panels/index.js',
  './legend/index.js',
  './tours/index.js',
  './quiz/index.js',
  './viz/index.js',
  './search/index.js',
  './onboarding/index.js',
  './teacher/index.js',
];

/* ------------------------------------------------------------ boot chrome -- */

const bootEl = $('#boot');
const appEl = $('#app');
const progressEl = $('#boot-progress');
const statusEl = $('#boot-status');
let bootDone = false;

function progress(pct, message) {
  if (bootDone) return;
  if (progressEl) progressEl.style.width = Math.max(0, Math.min(100, pct)) + '%';
  if (statusEl && message) statusEl.textContent = message;
}

function revealApp() {
  if (bootDone) return;
  bootDone = true;
  if (appEl) appEl.hidden = false;
  if (bootEl) {
    bootEl.dataset.state = 'gone';
    setTimeout(() => { if (bootEl.dataset.state === 'gone') bootEl.hidden = true; }, 700);
  }
  document.documentElement.dataset.boot = 'ready';
}

/**
 * The error boundary. Called when the shell itself cannot continue — not when a
 * single module misbehaves, which the registry absorbs.
 */
function showFatal(where, err, { recoverable = false } = {}) {
  document.documentElement.dataset.boot = 'error';
  store.dispatch('fail', { message: humanMessage(where, err), detail: String((err && err.stack) || err || ''), where });
  if (!bootEl) return;
  bootDone = false;
  bootEl.hidden = false;
  bootEl.dataset.state = 'error';
  const msg = $('#boot-error-msg'), detail = $('#boot-error-detail'), cont = $('#boot-continue');
  if (msg) msg.textContent = humanMessage(where, err);
  if (detail) {
    const text = String((err && err.stack) || err || '').trim();
    detail.textContent = text.split('\n').slice(0, 12).join('\n');
    detail.hidden = !text;
  }
  if (cont) cont.hidden = !recoverable;
  console.error('[boot] fatal in ' + where, err);
}

function humanMessage(where, err) {
  const raw = String((err && err.message) || err || 'Unknown error');
  if (where === 'data') return 'The atlas could not read its dataset (' + raw + ').';
  if (where === 'modules') return 'The atlas loaded its data but could not build the interface (' + raw + ').';
  return 'Something in the app broke while starting up (' + raw + ').';
}

if (bootEl) {
  const reload = $('#boot-reload');
  if (reload) reload.addEventListener('click', () => location.reload());
  const cont = $('#boot-continue');
  if (cont) cont.addEventListener('click', () => { store.dispatch('clearError'); revealApp(); });
}

/* ------------------------------------------------- document <-> state sync -- */

function syncDocument(state) {
  const root = document.documentElement;
  if (root.dataset.theme !== state.theme) root.dataset.theme = state.theme;
  if (root.dataset.motion !== state.reducedMotion) root.dataset.motion = state.reducedMotion;
  if (!appEl) return;
  const d = appEl.dataset;
  const set = (k, v) => { const s = v == null ? '' : String(v); if (d[k] !== s) d[k] = s; };
  set('dossier', state.panelState.dossier && state.selectedTerritoryId ? 'open' : 'closed');
  set('layer', state.activeLayer);
  set('tour', state.activeTour || '');
  set('step', state.activeTour ? state.tourStep + 1 : '');
  set('compare', state.compareYear == null ? 'off' : 'on');
  set('playing', state.playing ? 'on' : 'off');
  set('overlay', state.panelState.overlay || '');
  set('selected', state.selectedTerritoryId || '');
  set('year', state.year);
}

function syncTitle(state, data) {
  const t = state.selectedTerritoryId && data ? data.get(state.selectedTerritoryId) : null;
  const year = format.year(state.year);
  document.title = (t ? t.name + ', ' + year : year) + ' — The British Empire';
}

/* --------------------------------------------------------------- persist -- */

const PERSIST_KEYS = ['theme', 'reducedMotion'];

function restorePreferences() {
  const prefs = storage.get('prefs', null);
  if (prefs) store.dispatch('hydrate', { theme: prefs.theme, reducedMotion: prefs.reducedMotion });
  const visited = storage.get('visited', null);
  if (Array.isArray(visited) && visited.length) store.dispatch('hydrate', { visited: new Set(visited) });
  store.flush();
}

const savePrefs = util.debounce((state) => {
  storage.set('prefs', Object.fromEntries(PERSIST_KEYS.map(k => [k, state[k]])));
  storage.set('visited', [...state.visited]);
}, 400);

/* ----------------------------------------------------------- stray errors -- */

let phase = 'early';                 // 'early' | 'modules' | 'ready'
const strays = [];

function noteStray(err) {
  if (phase === 'early') { showFatal('startup', err, { recoverable: true }); return; }
  const text = String((err && err.message) || err || 'unknown error');
  if (!strays.includes(text)) strays.push(text);
  console.error('[app] uncaught', err);
  if (appEl) appEl.setAttribute('data-dev', '1');
  refreshShellNote();
}

/* ------------------------------------------------------------------ boot -- */

async function boot() {
  const t0 = performance.now();

  /* WHOSE ERROR IS FATAL.
     Before this pass any stray uncaught error during boot replaced the whole
     atlas with the error boundary — including one thrown by a single module's
     own `setTimeout`, which the registry would otherwise have absorbed without
     the reader noticing. Six modules land in this wave; one of them throwing on
     a timer must cost that module, not the map.

     So: an error is fatal only while the shell itself is still assembling
     (`phase === 'early'` — the dataset, the store, the address). From the
     moment we start mounting modules it is recorded, named in the footer, and
     survivable. */
  addEventListener('error', (ev) => noteStray(ev.error || ev.message));
  addEventListener('unhandledrejection', (ev) => noteStray(ev.reason));

  restorePreferences();
  syncDocument(store.getState());
  progress(12, 'Reading the dataset…');

  /* 1. data ---------------------------------------------------------------- */
  let data;
  try {
    data = await loadData();
  } catch (err) {
    showFatal('data', err);
    return;
  }
  store.dispatch('setBounds', data.bounds);
  store.flush();
  progress(40, data.meta.placeholder
    ? 'Using the placeholder dataset…'
    : 'Read ' + format.plural(data.meta.counts.territories, 'territory', 'territories') + '…');

  /* 2. the URL is the state ------------------------------------------------ */
  const url = urlModule.connect(store, { bus });
  url.restore();

  /* 3. modules ------------------------------------------------------------- */
  const context = { store, data, bus, format, util, url, baseUrl: import.meta.url };
  const registry = createRegistry(context);

  const manifest = await util.getJson(new URL('modules.json', import.meta.url), null);
  const listed = manifest ? (Array.isArray(manifest) ? manifest : manifest.modules || []) : [];
  const areas = (manifest && manifest.areas) || AREAS;
  const scan = manifest ? !!manifest.autodiscover : true;
  const candidates = util.unique(listed.concat(scan ? areas : []));

  progress(55, candidates.length ? 'Looking for the atlas modules…' : 'No modules registered yet…');
  phase = 'modules';
  try {
    await registry.discover(candidates.map(p => new URL(p, import.meta.url).href), exists);
    await registry.mountAll((id, i, n) => progress(55 + Math.round(35 * i / n), 'Building ' + id + '…'));
  } catch (err) {
    showFatal('modules', err, { recoverable: true });
    return;
  }

  /* --------------------------------------------------------------------- */
  /* COHERENCE PASS — A LINK TO A PLACE THIS ATLAS DOES NOT HOLD.
     `#sel=india` set `selectedTerritoryId: 'india'`, which is not an id in this
     dataset (the subcontinent is `british-india`). The shell then wrote
     `data-dossier="open"` and `data-selected="india"`, the address bar carried
     `sel=india`, the map had nothing to outline, and the dossier — correctly —
     said "No place selected". Four parts of the app disagreed about whether
     anything was selected, and a teacher whose worksheet carried a stale id got
     an empty drawer with no explanation.

     One selection model: a selection is a territory this atlas holds, or it is
     not a selection. An id we cannot resolve is cleared and SAID, in the shell
     note, because the alternative is a panel that looks broken. */
  const unknownSelections = new Set();
  function vetSelection(state) {
    const id = state.selectedTerritoryId;
    if (id && data.get(id) && unknownSelections.size) {
      /* A real selection has arrived, so the note about the broken one is no
         longer true. It said "nothing is selected"; something is. */
      unknownSelections.clear();
      const note = $('#shell-note');
      if (note) { note.dataset.selection = ''; refreshShellNote(); }
    }
    if (!id || data.get(id)) return false;
    unknownSelections.add(id);
    queueMicrotask(() => {
      store.dispatch('deselect');
      store.flush();
      const note = $('#shell-note');
      const list = [...unknownSelections];
      const msg = list.length === 1
        ? `This link asked for “${list[0]}”. There is no place with that name in the atlas, so nothing is selected.`
        : `This link asked for places the atlas does not hold (${list.join(', ')}), so nothing is selected.`;
      if (note) { note.dataset.selection = msg; refreshShellNote(); }
      announce(msg);
    });
    return true;
  }
  vetSelection(store.getState());

  /* 4. wire the loop ------------------------------------------------------- */
  /* THE FAN-OUT IS THE ATLAS. Everything before `registry.update` here is
     shell bookkeeping — a document title, a data-attribute, a stale-id check —
     and none of it is worth a frame in which no module updates. Each step is
     therefore isolated: a throw is reported once and the modules still get
     their state. (The store already isolates the subscriber itself; this
     isolates the four jobs inside it from each other.) */
  const step = (name, fn) => { try { fn(); } catch (err) { noteStray(new Error('shell/' + name + ': ' + ((err && err.message) || err))); } };

  store.subscribe((state, prev, changed) => {
    if (changed.has('selectedTerritoryId')) step('vetSelection', () => vetSelection(state));
    step('syncDocument', () => syncDocument(state));
    if (changed.has('year') || changed.has('selectedTerritoryId')) step('syncTitle', () => syncTitle(state, data));
    registry.update(state, prev, changed);
    if (changed.has('theme') || changed.has('reducedMotion') || changed.has('visited')) step('savePrefs', () => savePrefs(state));
  });

  addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape' || ev.defaultPrevented) return;
    const s = store.getState();
    if (s.panelState.overlay) store.dispatch('closeOverlay');
    else if (s.activeTour) store.dispatch('endTour');
    else if (s.selectedTerritoryId) store.dispatch('deselect');
    else return;
    ev.preventDefault();
  });

  /* 5. ready --------------------------------------------------------------- */
  const report = registry.report();
  const incomplete = !report.mounted.length || (report.absent || []).length || !report.ok;
  if (incomplete) appEl && appEl.setAttribute('data-dev', '1');

  syncTitle(store.getState(), data);
  store.dispatch('setStatus', 'ready');
  store.flush();
  progress(100, 'Ready.');
  revealApp();

  writeShellNote(data, registry);
  // A module the registry recorded as `slow` may still land; say so when it has.
  setTimeout(refreshShellNote, 11000);

  phase = 'ready';
  const ms = Math.round(performance.now() - t0);
  bus.emit('app:ready', { data, registry, url, ms, report });
  announce('The atlas is ready. Showing the year ' + format.year(store.getState().year) + '.');

  // The debugging handle every other agent (and the inspection harness) can use.
  window.BEA = { store, bus, data, url, registry, format, util, report, ms, version: 1 };
  console.info('[atlas] ready in ' + ms + 'ms · ' + report.mounted.length + ' modules · '
    + data.meta.counts.territories + ' territories'
    + (data.meta.placeholder ? ' (PLACEHOLDER dataset)' : ''));
}

/**
 * The one line of shell-authored text a user can see. It exists so the app is
 * never silently wrong about what it is showing.
 */
let noteSource = null;                 // { data, registry } once boot has got that far

function writeShellNote(data, registry) {
  noteSource = { data, registry };
  refreshShellNote();
}

/**
 * The one line of shell-authored text a user can see. It exists so the app is
 * never silently wrong about what it is showing: a placeholder dataset, a
 * module that is not running, a module still mounting, a stray error. It is
 * recomputed rather than written once, because a module may fail minutes after
 * boot and the footer must not still claim everything is fine.
 */
function refreshShellNote() {
  const note = $('#shell-note');
  if (!note || !noteSource) return;
  const { data, registry } = noteSource;
  const report = registry.report();
  const bits = [];
  if (data.meta.placeholder) bits.push('Placeholder dataset — the real one has not been built yet.');
  if (!data.geoAvailable) bits.push('No map geometry loaded yet.');
  const broken = [...(report.failed || []), ...(report.invalid || []), ...(report.disabled || [])];
  if (broken.length) bits.push('Not running: ' + broken.join(', ') + '.');
  if ((report.slow || []).length) bits.push('Still opening: ' + report.slow.join(', ') + '.');
  if (!broken.length && !report.mounted.length) bits.push('Shell only — no feature modules are registered in app/js/modules.json yet.');
  if (strays.length) bits.push(format.plural(strays.length, 'error', 'errors') + ' logged since loading.');
  const selectionNote = note.dataset.selection || '';
  note.textContent = [selectionNote, bits.join(' ')].filter(Boolean).join('  ');
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
