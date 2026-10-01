/**
 * store.js — one plain state object, typed actions, batched notification.
 *
 * There is no framework. There is this file.
 *
 *   import { store } from './core/store.js';
 *   store.dispatch('setYear', 1857);
 *   store.getState().year;                       // 1857
 *   const off = store.watch(s => s.year, y => …); // fires only when year changes
 *
 * Rules
 *  1. NEVER mutate the state object. Dispatch an action; actions return a patch.
 *  2. Subscribers run once per animation frame, however many actions fired.
 *  3. Every subscriber gets (state, prev, changed) where `changed` is a Set of
 *     the top-level keys that actually changed. Use it to skip work.
 *  4. Unknown action names warn loudly and change nothing — they never throw,
 *     because a broken module must not take the atlas down with it.
 */

import { clamp, shallowEqual } from './util.js';

/* -------------------------------------------------------- initial state -- */

/** @typedef {typeof initialState} State */
export const initialState = Object.freeze({
  /* time */
  year: 1900,               // the year on the map right now
  bounds: { min: 1497, max: 2025 }, // replaced by data.timeline() after load
  playing: false,           // is the clock running
  speed: 1,                 // playback multiplier: 0.25 … 8 (years per tick scale)
  compareYear: null,        // number => split/compare mode against this year

  /* selection */
  selectedTerritoryId: null, // the dossier subject
  hoveredUnitId: null,       // the geometry unit under the pointer (or keyboard focus)
  focusedUnitId: null,       // keyboard focus, kept apart from pointer hover

  /* view */
  activeLayer: 'status',     // which thematic layer paints the map
  mapView: null,             // { k, x, y } — opaque to everyone but the map module
  filters: {},               // { region?, status?, era?, … } — layer/search modules own the keys
  searchQuery: '',

  /* narrative */
  activeTour: null,          // tour id
  tourStep: 0,               // 0-based step index within the tour
  quizState: { active: false, quizId: null, index: 0, answers: [], score: 0, done: false },

  /* chrome */
  panelState: { dossier: false, legend: true, timeline: true, overlay: null, sheet: null },
  theme: 'auto',             // 'auto' | 'paper' (light) | 'lamplit' (dark)
  reducedMotion: 'auto',     // 'auto' | 'reduced' | 'full'

  /* learner memory */
  visited: new Set(),        // territory ids the student has opened

  /* runtime */
  status: 'booting',         // 'booting' | 'ready' | 'error'
  error: null,               // { message, detail, where } when status === 'error'
  hydrating: false,          // true while url.js is restoring — suppress URL writes
});

/* -------------------------------------------------------------- actions -- */

const int = (v, fallback = null) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

const inBounds = (s, y) => clamp(y, s.bounds.min, s.bounds.max);

/**
 * Each action is (state, payload) => patch | null.
 * Returning null means "nothing changed" and costs nothing.
 */
export const actions = {
  /* --- time --- */
  setYear: (s, y) => {
    const n = int(y); if (n == null) return null;
    const v = inBounds(s, n);
    return v === s.year ? null : { year: v };
  },
  nudgeYear: (s, delta) => actions.setYear(s, s.year + (int(delta) ?? 0)),
  setBounds: (s, b) => {
    const min = int(b && b.min, s.bounds.min), max = int(b && b.max, s.bounds.max);
    if (min === s.bounds.min && max === s.bounds.max) return null;
    return { bounds: { min, max }, year: clamp(s.year, min, max) };
  },
  play: (s) => (s.playing ? null : { playing: true }),
  pause: (s) => (s.playing ? { playing: false } : null),
  setPlaying: (s, v) => (!!v === s.playing ? null : { playing: !!v }),
  togglePlay: (s) => ({ playing: !s.playing }),
  setSpeed: (s, v) => {
    const n = Number(v); if (!Number.isFinite(n) || n <= 0) return null;
    const sp = clamp(n, 0.25, 16);
    return sp === s.speed ? null : { speed: sp };
  },
  setCompareYear: (s, y) => {
    if (y == null || y === '' || y === false) return s.compareYear == null ? null : { compareYear: null };
    const n = int(y); if (n == null) return null;
    const v = inBounds(s, n);
    return v === s.compareYear ? null : { compareYear: v };
  },
  toggleCompare: (s) => (s.compareYear == null
    ? { compareYear: inBounds(s, s.year - 50) }
    : { compareYear: null }),

  /* --- selection --- */
  select: (s, id) => {
    const next = id || null;
    if (next === s.selectedTerritoryId) return null;
    const patch = { selectedTerritoryId: next, panelState: { ...s.panelState, dossier: !!next } };
    if (next && !s.visited.has(next)) patch.visited = new Set(s.visited).add(next);
    return patch;
  },
  deselect: (s) => (s.selectedTerritoryId == null ? null : actions.select(s, null)),
  hover: (s, id) => ((id || null) === s.hoveredUnitId ? null : { hoveredUnitId: id || null }),
  focusUnit: (s, id) => ((id || null) === s.focusedUnitId ? null : { focusedUnitId: id || null }),
  visit: (s, id) => (!id || s.visited.has(id) ? null : { visited: new Set(s.visited).add(id) }),
  clearVisited: (s) => (s.visited.size ? { visited: new Set() } : null),

  /* --- view --- */
  setLayer: (s, id) => (!id || id === s.activeLayer ? null : { activeLayer: String(id) }),
  setMapView: (s, v) => (shallowEqual(v, s.mapView) ? null : { mapView: v || null }),
  setFilter: (s, patch) => {
    if (!patch || typeof patch !== 'object') return null;
    const next = { ...s.filters };
    for (const [k, v] of Object.entries(patch)) { if (v == null || v === '' || v === false) delete next[k]; else next[k] = v; }
    return shallowEqual(next, s.filters) ? null : { filters: next };
  },
  clearFilters: (s) => (Object.keys(s.filters).length ? { filters: {} } : null),
  setSearch: (s, q) => (String(q ?? '') === s.searchQuery ? null : { searchQuery: String(q ?? '') }),

  /* --- narrative --- */
  startTour: (s, arg) => {
    const id = typeof arg === 'string' ? arg : arg && arg.id;
    if (!id) return null;
    const step = typeof arg === 'object' && arg ? int(arg.step, 0) : 0;
    return { activeTour: id, tourStep: Math.max(0, step), panelState: { ...s.panelState, overlay: null } };
  },
  setTourStep: (s, n) => {
    const v = Math.max(0, int(n, 0));
    return v === s.tourStep ? null : { tourStep: v };
  },
  nextStep: (s) => ({ tourStep: s.tourStep + 1 }),
  prevStep: (s) => (s.tourStep <= 0 ? null : { tourStep: s.tourStep - 1 }),
  endTour: (s) => (s.activeTour == null ? null : { activeTour: null, tourStep: 0 }),

  /* --- quiz --- */
  setQuiz: (s, patch) => {
    if (!patch || typeof patch !== 'object') return null;
    const next = { ...s.quizState, ...patch };
    return shallowEqual(next, s.quizState) ? null : { quizState: next };
  },
  resetQuiz: (s) => ({ quizState: { active: false, quizId: null, index: 0, answers: [], score: 0, done: false } }),

  /* --- chrome --- */
  setPanel: (s, patch) => {
    if (!patch || typeof patch !== 'object') return null;
    const next = { ...s.panelState, ...patch };
    return shallowEqual(next, s.panelState) ? null : { panelState: next };
  },
  togglePanel: (s, key) => (key in s.panelState ? { panelState: { ...s.panelState, [key]: !s.panelState[key] } } : null),
  openOverlay: (s, id) => (s.panelState.overlay === id ? null : { panelState: { ...s.panelState, overlay: id || null } }),
  closeOverlay: (s) => (s.panelState.overlay == null ? null : { panelState: { ...s.panelState, overlay: null } }),
  setTheme: (s, t) => {
    // tokens.css names the themes 'paper' and 'lamplit'; 'light'/'dark' are
    // accepted from URLs and old links and normalised here.
    const v = { light: 'paper', dark: 'lamplit', paper: 'paper', lamplit: 'lamplit', auto: 'auto' }[t];
    return v && v !== s.theme ? { theme: v } : null;
  },
  setReducedMotion: (s, m) => (['auto', 'reduced', 'full'].includes(m) && m !== s.reducedMotion ? { reducedMotion: m } : null),

  /* --- runtime --- */
  setStatus: (s, v) => (v === s.status ? null : { status: v }),
  fail: (s, err) => ({ status: 'error', error: normaliseError(err) }),
  clearError: (s) => (s.error ? { status: 'ready', error: null } : null),

  /**
   * Bulk restore. Used by url.js and by tests. Only keys that exist in the
   * initial state are accepted, and each is routed through its own action so
   * clamping and validation still apply.
   */
  hydrate: (s, patch) => {
    if (!patch || typeof patch !== 'object') return null;
    let acc = {}, cur = s;
    const via = (name, value) => {
      const p = actions[name](cur, value);
      if (p) { acc = { ...acc, ...p }; cur = { ...cur, ...p }; }
    };
    if ('bounds' in patch) via('setBounds', patch.bounds);
    if ('year' in patch) via('setYear', patch.year);
    if ('compareYear' in patch) via('setCompareYear', patch.compareYear);
    if ('activeLayer' in patch) via('setLayer', patch.activeLayer);
    if ('selectedTerritoryId' in patch) via('select', patch.selectedTerritoryId);
    /* AN ADDRESS THAT DOES NOT NAME A TOUR IS AN ADDRESS WITH NO TOUR IN IT.
       `startTour` returns null without an id, so `activeTour: null` — which is
       exactly what url.js's `parseForPop` sends on every Back out of the
       lesson — used to change nothing at all: the address said one thing and
       the transport went on running. Back is a statement about what is NOT in
       the address (url.js, WHAT BACK MEANS) and this is the half of it that
       lives here. */
    if ('activeTour' in patch) {
      if (patch.activeTour) via('startTour', { id: patch.activeTour, step: patch.tourStep });
      else via('endTour', null);
    }
    if ('tourStep' in patch) via('setTourStep', patch.tourStep);
    if ('searchQuery' in patch) via('setSearch', patch.searchQuery);
    /* FILTERS ARE REPLACED, NOT MERGED. `setFilter` is a patch action — right
       for a reader turning one thing on — and it was wrong here, because the
       address carries the WHOLE filter set (see url.js `serialize`). Measured:
       open a comparison, then paste `#year=1655` into the same tab. The address
       came back as `#year=1655&filter=cmpr:1,stage:working`, because the
       incoming `{}` merged into the filters already there and removed nothing.
       A teacher's link is not the same object after it is opened unless a key
       the link does not name is actually gone. */
    if ('filters' in patch) {
      via('clearFilters', null);
      via('setFilter', patch.filters);
    }
    if ('mapView' in patch) via('setMapView', patch.mapView);
    if ('theme' in patch) via('setTheme', patch.theme);
    if ('reducedMotion' in patch) via('setReducedMotion', patch.reducedMotion);
    if ('panelState' in patch) via('setPanel', patch.panelState);
    if ('quizState' in patch) via('setQuiz', patch.quizState);
    if ('playing' in patch) via('setPlaying', patch.playing);
    if ('speed' in patch) via('setSpeed', patch.speed);
    if (patch.visited && patch.visited.size) acc.visited = new Set([...s.visited, ...patch.visited]);
    return Object.keys(acc).length ? acc : null;
  },

  /** Internal: url.js brackets its restore with this so we don't write back. */
  setHydrating: (s, v) => (!!v === s.hydrating ? null : { hydrating: !!v }),
};

function normaliseError(err) {
  if (!err) return { message: 'Something went wrong.', detail: '', where: '' };
  if (typeof err === 'string') return { message: err, detail: '', where: '' };
  return {
    message: err.message || String(err),
    detail: err.detail || (err.stack ? String(err.stack).split('\n').slice(0, 4).join('\n') : ''),
    where: err.where || err.module || '',
  };
}

/* ---------------------------------------------------------------- store -- */

export function createStore(overrides = {}, { actions: extra = {} } = {}) {
  const table = { ...actions, ...extra };
  let state = Object.freeze({ ...initialState, ...overrides,
    visited: new Set(overrides.visited || initialState.visited) });
  let prev = state;

  const subscribers = new Set();     // fn(state, prev, changed)
  const watchers = new Set();        // { sel, cb, eq, last }
  let changed = new Set();
  let frame = 0;
  let depth = 0;
  const trail = [];                  // last N actions, for the error boundary

  function getState() { return state; }

  function dispatch(type, payload) {
    if (type && typeof type === 'object') { payload = type.payload; type = type.type; }
    const fn = table[type];
    if (!fn) { console.warn('[store] unknown action "' + type + '" — ignored'); return state; }
    let patch;
    try { patch = fn(state, payload); }
    catch (err) { console.warn('[store] action "' + type + '" threw', err); return state; }
    if (!patch) return state;

    const next = { ...state };
    let touched = false;
    for (const [k, v] of Object.entries(patch)) {
      if (!(k in initialState)) { console.warn('[store] action "' + type + '" set unknown key "' + k + '"'); continue; }
      if (!Object.is(next[k], v)) { next[k] = v; changed.add(k); touched = true; }
    }
    if (!touched) return state;

    state = Object.freeze(next);
    trail.push(type); if (trail.length > 50) trail.shift();
    schedule();
    return state;
  }

  /** Convenience: store.act.setYear(1857) === store.dispatch('setYear', 1857) */
  const act = new Proxy({}, {
    get: (_, name) => (payload) => dispatch(String(name), payload),
    has: (_, name) => String(name) in table,
  });

  function schedule() {
    if (frame || depth) return;
    frame = requestAnimationFrame(notify);
  }

  /** Run several dispatches and notify once, synchronously, at the end. */
  function batch(fn) {
    depth++;
    try { fn(dispatch); } finally { depth--; }
    if (!depth) { if (frame) { cancelAnimationFrame(frame); frame = 0; } notify(); }
    return state;
  }

  /** Force pending notifications to run right now (tests, before screenshots). */
  function flush() { if (frame) { cancelAnimationFrame(frame); frame = 0; } if (changed.size) notify(); }

  function notify() {
    frame = 0;
    if (!changed.size) return;
    const keys = changed; changed = new Set();
    const was = prev; prev = state;
    for (const w of [...watchers]) {
      let value;
      try { value = w.sel(state); } catch (err) { console.warn('[store] selector threw', err); continue; }
      if (w.eq(value, w.last)) continue;
      const before = w.last; w.last = value;
      try { w.cb(value, before, state); } catch (err) { console.warn('[store] watcher threw', err); }
    }
    for (const fn of [...subscribers]) {
      try { fn(state, was, keys); } catch (err) { console.warn('[store] subscriber threw', err); }
    }
  }

  /** subscribe(fn) — fn(state, prev, changedKeysSet). Returns unsubscribe. */
  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  /**
   * watch(selector, cb, { immediate = false, equal = Object.is })
   * Fires only when the selected value changes. Returns unsubscribe.
   */
  function watch(sel, cb, { immediate = false, equal = Object.is } = {}) {
    const w = { sel, cb, eq: equal, last: undefined };
    try { w.last = sel(state); } catch (_) { w.last = undefined; }
    watchers.add(w);
    if (immediate) { try { cb(w.last, undefined, state); } catch (err) { console.warn('[store] watcher threw', err); } }
    return () => watchers.delete(w);
  }

  /** Sugar for watching several keys: watchKeys(['year','activeLayer'], cb) */
  function watchKeys(keys, cb, opts) {
    return watch(s => keys.map(k => s[k]), (v, p, s) => cb(s, keys), { ...opts, equal: shallowEqual });
  }

  function has(type) { return type in table; }
  function history() { return [...trail]; }

  return { getState, dispatch, act, batch, flush, subscribe, watch, watchKeys, has, history, actions: table,
    get state() { return state; } };
}

/** The single application store. */
export const store = createStore();
export default store;
