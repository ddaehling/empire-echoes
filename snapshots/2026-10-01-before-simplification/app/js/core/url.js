/**
 * url.js — the address bar is a first-class teaching tool.
 *
 * A teacher scrubs to 1857, opens Bengal, starts the Company Rule tour at step 3,
 * copies the URL into a lesson plan, and thirty students land on exactly that view.
 * That is the whole point of this file.
 *
 * Shape of a link:
 *   /app/#year=1857&sel=bengal&layer=status&tour=company-rule&step=3&compare=1914
 *
 * Keys (all optional except `year`):
 *   year     the year on the map                       1857
 *   sel      selected territory id                     bengal
 *   layer    active thematic layer                     status  (omitted when default)
 *   tour     active tour id                            company-rule
 *   step     tour step, ONE-BASED for humans           3       (state.tourStep is 0-based)
 *   compare  second year for compare mode              1914
 *   q        search query                              bengal
 *   filter   filters, as key:value pairs               region:africa,status:colony
 *   view     map camera, "k,x,y"                       2.4,0.31,-0.08
 *   panel    full-screen overlay id                    about
 *   quiz     active quiz id                            partition
 *   theme    paper | lamplit                            lamplit (omitted when auto)
 *   motion   reduced | full                            reduced (omitted when auto)
 *
 * Back/forward: navigational changes (selection, tour, step, layer, compare, overlay)
 * push a history entry. Continuous changes (scrubbing the year, panning the map,
 * typing in search) replace the current entry, so Back never becomes a stutter.
 */

import { throttle } from './util.js';

const DEFAULTS = { layer: 'status' };

/** Order matters: it is the order a human reads the link in. */
const KEYS = ['year', 'sel', 'layer', 'tour', 'step', 'compare', 'q', 'filter', 'view', 'panel', 'quiz', 'theme', 'motion'];

/** Changing any of these is "going somewhere" — it earns a history entry. */
const NAVIGATIONAL = new Set(['sel', 'tour', 'step', 'layer', 'compare', 'panel', 'quiz']);

/* --------------------------------------------------------------- encode -- */

const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };

/* THE SAME STATE IS THE SAME ADDRESS. `filters` is a free-form object and its
   keys arrive in whatever order the modules happened to dispatch them, so one
   reader's link read `filter=stage:working,pressure:off` and the next reader's
   — same app, same state, one reload apart — read `filter=pressure:off,
   stage:working`. Measured across eleven boots in tools' own boot-race probe:
   both orders, from the same two dispatches. Two different strings for one
   state means `write()`'s `next === lastWritten` short-circuit can miss, a
   pasted link and a copied one can differ character for character, and a
   teacher comparing two links cannot tell whether anything changed. Sorting is
   the whole fix; nothing downstream reads the order (`decodeFilters` builds an
   object). */
function encodeFilters(filters) {
  const parts = [];
  for (const k of Object.keys(filters || {}).sort()) {
    const v = filters[k];
    if (v == null || v === '' || v === false) continue;
    const val = Array.isArray(v) ? v.join('+') : String(v);
    parts.push(enc(k) + ':' + enc(val));
  }
  return parts.join(',');
}

function decodeFilters(str) {
  const out = {};
  for (const pair of String(str || '').split(',')) {
    if (!pair) continue;
    const i = pair.indexOf(':');
    if (i < 0) continue;
    const k = dec(pair.slice(0, i)), v = dec(pair.slice(i + 1));
    out[k] = v.includes('+') ? v.split('+') : v;
  }
  return out;
}

// Encode conservatively: keep the link readable, escape only what breaks parsing.
const enc = (s) => encodeURIComponent(String(s)).replace(/%20/g, '+');
const dec = (s) => { try { return decodeURIComponent(String(s).replace(/\+/g, ' ')); } catch (_) { return String(s); } };

/** state -> "year=1857&sel=bengal" (no leading #). */
export function serialize(state) {
  const p = new Map();
  p.set('year', String(state.year));
  if (state.selectedTerritoryId) p.set('sel', enc(state.selectedTerritoryId));
  if (state.activeLayer && state.activeLayer !== DEFAULTS.layer) p.set('layer', enc(state.activeLayer));
  if (state.activeTour) {
    p.set('tour', enc(state.activeTour));
    p.set('step', String((state.tourStep | 0) + 1));
  }
  if (state.compareYear != null) p.set('compare', String(state.compareYear));
  if (state.searchQuery) p.set('q', enc(state.searchQuery));
  const f = encodeFilters(state.filters); if (f) p.set('filter', f);
  const v = state.mapView;
  if (v && Number.isFinite(v.k)) p.set('view', [round(v.k, 3), round(v.x, 4), round(v.y, 4)].join(','));
  if (state.panelState && state.panelState.overlay) p.set('panel', enc(state.panelState.overlay));
  if (state.quizState && state.quizState.active && state.quizState.quizId) p.set('quiz', enc(state.quizState.quizId));
  if (state.theme && state.theme !== 'auto') p.set('theme', state.theme);
  if (state.reducedMotion && state.reducedMotion !== 'auto') p.set('motion', state.reducedMotion);
  return KEYS.filter(k => p.has(k)).map(k => k + '=' + p.get(k)).join('&');
}

const round = (n, dp) => (Number.isFinite(n) ? +n.toFixed(dp) : 0);

/**
 * Does this fragment name anything this atlas knows?
 *
 * `#/beat/mechanism`, `#chapter-3`, a half-pasted link — none of them carry a
 * key from KEYS, so `parse` returns an empty patch, the reader lands on the
 * default year, and 150ms later the writer replaces the address with
 * `#year=1900`. Nothing was said. An app whose whole argument is that a
 * rendering should declare what it cannot show may not silently rewrite a
 * reader's address; it reports it (`url:unknown`) and the shell says so in the
 * one sentence band.
 */
export function unknownAddress(str) {
  const raw = String(str || '').replace(/^[#?]/, '').trim();
  if (!raw) return null;
  for (const part of raw.split('&')) {
    if (!part) continue;
    const i = part.indexOf('=');
    if (KEYS.includes(i < 0 ? part : part.slice(0, i))) return null;
  }
  return raw;
}

/** "year=1857&sel=bengal" (with or without #) -> a patch for store.dispatch('hydrate', …). */
export function parse(str) {
  const raw = String(str || '').replace(/^[#?]/, '');
  const q = new Map();
  for (const part of raw.split('&')) {
    if (!part) continue;
    const i = part.indexOf('=');
    const k = i < 0 ? part : part.slice(0, i);
    q.set(k, i < 0 ? '' : part.slice(i + 1));
  }
  const patch = {};
  if (q.has('year')) { const y = num(q.get('year')); if (y != null) patch.year = y; }
  if (q.has('sel')) patch.selectedTerritoryId = dec(q.get('sel')) || null;
  if (q.has('layer')) patch.activeLayer = dec(q.get('layer')) || DEFAULTS.layer;
  if (q.has('tour')) patch.activeTour = dec(q.get('tour')) || null;
  if (q.has('step')) patch.tourStep = Math.max(0, (num(q.get('step')) ?? 1) - 1);
  if (q.has('compare')) patch.compareYear = q.get('compare') === '' ? null : num(q.get('compare'));
  if (q.has('q')) patch.searchQuery = dec(q.get('q'));
  if (q.has('filter')) patch.filters = decodeFilters(q.get('filter'));
  if (q.has('view')) {
    const [k, x, y] = String(q.get('view')).split(',').map(Number);
    if (Number.isFinite(k)) patch.mapView = { k, x: x || 0, y: y || 0 };
  }
  if (q.has('panel')) patch.panelState = { overlay: dec(q.get('panel')) || null };
  if (q.has('quiz')) patch.quizState = { active: true, quizId: dec(q.get('quiz')), index: 0, answers: [], score: 0, done: false };
  if (q.has('theme')) patch.theme = dec(q.get('theme'));
  if (q.has('motion')) patch.reducedMotion = dec(q.get('motion'));
  return patch;
}

/**
 * COHERENCE PASS — WHAT BACK MEANS.
 *
 * `parse` returns a patch containing only the keys the address actually names,
 * which is right for a link someone typed: `#year=1900` should not blow away a
 * theme they chose. It is wrong for Back. Selecting Bengal pushes a history
 * entry; pressing Back returns to `#year=1858`, whose patch has no `sel` key at
 * all, so the store kept the selection, the writer immediately put `sel=` back
 * into the address, and Back looked like it had done nothing. The dossier stayed
 * open on a place the address no longer named.
 *
 * Going back is a statement about what is NOT in the address, so the pop path
 * fills the state the address owns and leaves alone the state it does not
 * (theme and motion, which are also a stored preference).
 */
export function parseForPop(str) {
  const raw = String(str || '').replace(/^[#?]/, '');
  const has = new Set();
  for (const part of raw.split('&')) { if (!part) continue; const i = part.indexOf('='); has.add(i < 0 ? part : part.slice(0, i)); }
  const patch = parse(raw);
  if (!has.has('sel')) patch.selectedTerritoryId = null;
  if (!has.has('layer')) patch.activeLayer = DEFAULTS.layer;
  if (!has.has('tour')) { patch.activeTour = null; patch.tourStep = 0; }
  if (!has.has('compare')) patch.compareYear = null;
  if (!has.has('q')) patch.searchQuery = '';
  if (!has.has('filter')) patch.filters = {};
  if (!has.has('view')) patch.mapView = null;
  if (!has.has('panel')) patch.panelState = { overlay: null };
  if (!has.has('quiz')) patch.quizState = { active: false, quizId: null, index: 0, answers: [], score: 0, done: false };
  return patch;
}

/* -------------------------------------------------------------- connect -- */

/**
 * connect(store, { bus })
 *  .restore()        read the current address (hash, or ?query as a fallback) into the store
 *  .write(force)     push the store into the address now
 *  .link(patch)      absolute URL for the current state with `patch` applied — for share buttons
 *  .destroy()
 */
export function connect(store, { bus = null, base = null } = {}) {
  let lastWritten = null;
  let disposed = false;
  let restored = false;
  /* An address that arrived before the app was ready, held until it is. See
     THE BOOT RACE below. */
  let pendingAddress = null;

  const href = () => (base || location.href.split('#')[0]);

  function currentHash() { return location.hash.replace(/^#/, ''); }

  /* THE BOOT RACE — WHY THE ADDRESS IS READ-ONLY UNTIL THE APP IS READY.

     `boot()` reads the address at step 2 and does not finish until step 5, and
     everything in between — the module graph mounting, each piece dispatching
     its own first state — runs through `store.subscribe(writeSoon)` and WRITES
     THE ADDRESS BACK. `writeSoon` is a 150 ms trailing throttle, so during boot
     there is almost always a write pending against a state that is one tick old.

     Now let a lesson address arrive in that window — a teacher pasting a link
     into the tab that is still opening, a `hashchange` from an in-page link, a
     restored session. The browser delivers `hashchange` ASYNCHRONOUSLY, one
     task after the assignment. If the pending throttled write lands in between:

       t+0    location.hash = '#tour=period&step=4'     (address bar now says it)
       t+10   the pending write() fires, serialises the OLD state, and calls
              history.replaceState(… '#tour=core&step=9' …)
       t+12   the queued `hashchange` finally runs; onPop reads currentHash(),
              which is now the address the writer just put back, sees
              `raw === lastWritten`, and returns

     The reader's address is gone, nothing is logged, and the app carries on in
     the lesson it was already in. MEASURED at 1366x768, loading
     `#tour=core&step=9` and switching to `#tour=period&step=4` at boot+600 ms:
     the store finished at `core@8`, the transport read `9 / 17`, and the
     address bar read `…&tour=core&step=9…` — three parties agreeing with each
     other and all three disagreeing with what the reader asked for. It happened
     at some firing times and not others, which is what a race is.

     TWO RULES, AND THEY ARE THE SAME RULE FROM THE TWO SIDES:

       1. NOTHING WRITES THE ADDRESS BEFORE `status === 'ready'`. While the app
          is opening, the address belongs to whoever gave it to us. The app
          publishes its own address once, at ready, when the state is a state a
          reader could have asked for.
       2. AN ADDRESS THAT ARRIVES BEFORE READY IS HELD, NOT APPLIED. A pop
          applied against a half-mounted app hydrates a store no module has
          subscribed to yet; the last one to arrive is replayed at ready, once,
          through exactly the same path any other pop takes. */
  const isReady = () => { try { return store.getState().status === 'ready'; } catch (_) { return false; } };

  /**
   * COHERENCE PASS — THE HYDRATION WINDOW THAT DID NOT EXIST.
   *
   * `hydrating` is documented as "true only while url.js is restoring", and two
   * things rely on it: this file's own `write()` guard, and every module that
   * must not treat a restored value as something the reader just did.
   *
   * It never worked. The three dispatches below used to run back to back and
   * the store notifies ONCE PER FRAME, so by the time any subscriber ran,
   * `hydrating` was already false again. Measured: opening the link
   * `#year=1857` promoted the disclosure stage to `working` (because "the year
   * changed" looked like a reader touching the atlas) and the address bar
   * rewrote itself to `#year=1857&filter=stage:working` before the page had
   * finished painting. A teacher's link is not the same object after it is
   * opened, which is the one thing ARCHITECTURE §8 promises it is.
   *
   * The fix is to flush INSIDE the window, so subscribers actually observe
   * `hydrating: true`, and to close it with a second, separate notification.
   */
  function applyPatch_(patch, emit) {
    store.dispatch('setHydrating', true);
    store.dispatch('hydrate', patch);
    store.flush();                       // subscribers see hydrating === true
    if (emit) emit();
    store.dispatch('setHydrating', false);
    store.flush();                       // …and then see it go false, alone
  }

  function restore() {
    // A link may arrive as #year=… or, from a copy-paste that lost the fragment, ?year=…
    let raw = currentHash();
    if (!raw && /(^|[?&])(year|sel|tour)=/.test(location.search)) raw = location.search.replace(/^\?/, '');
    const patch = parse(raw);
    const orphan = unknownAddress(raw);
    lastWritten = raw;
    restored = true;
    applyPatch_(patch, bus ? () => bus.emit('url:restore', { patch, raw }) : null);
    if (orphan && bus) bus.emit('url:unknown', { raw: orphan, where: 'load' });
    return patch;
  }

  function write(force = false) {
    if (disposed) return;
    // Never write an address before we have read the one we were given: a
    // module that dispatches during mount would otherwise erase the link.
    if (!restored && !force) return;
    // …nor before the app is ready, which is the same rule one step further
    // out: see THE BOOT RACE above.
    if (!isReady() && !force) return;
    const state = store.getState();
    if (state.hydrating && !force) return;
    const next = serialize(state);
    if (next === lastWritten) return;
    const wasNav = isNavigational(lastWritten, next);
    lastWritten = next;
    const url = href() + '#' + next;
    try {
      if (wasNav) history.pushState({ bea: next }, '', url);
      else history.replaceState({ bea: next }, '', url);
    } catch (_) { location.hash = next; }   // e.g. file:// — degrade, don't die
    if (bus) bus.emit('url:change', { hash: next, pushed: wasNav });
  }

  /* WHAT COUNTS AS "GOING SOMEWHERE" WHILE A LESSON IS RUNNING — AND IT IS NOT
     WHAT A BEAT DOES TO THE MAP.

     ROUND 2 OF WAVE 10, the rubric and the phone, the same defect: "start the
     default route at step 4, press browser Back, and the address settles at
     `#year=1900&tour=lesson-one&step=5&filter=stage:working` — the reader asked
     to leave and stayed in. On Android, Back is the way out of anything."

     REPRODUCED AND MEASURED, logging every `url:change`:

       t+0     startTour(lesson-one, 4)
       t+150   push  #year=1900&tour=lesson-one&step=5
       t+900   push  #year=1831&sel=jamaica&tour=lesson-one&step=5&filter=…

     The second push is the BEAT: arriving at step 5 the lesson scrubs to 1831,
     selects Jamaica and sets a filter, and `sel` is in NAVIGATIONAL, so the
     lesson's own scene-setting earned a history entry of its own. Back went to
     the entry between the two — same lesson, same step, a different year — and
     to the student nothing happened at all. Every beat that touches the map
     stacks another of these, so Back walks backwards through the app's
     bookkeeping instead of leaving the lesson. That is exactly the stutter this
     file's own header says Back may never become.

     A change the READER made is going somewhere. A change the LESSON made is
     the lesson doing its work, and the only reader action inside a running
     lesson that is a destination is the step itself (and a full-screen overlay
     or a quiz, which the reader opens over the lesson and Back should close).
     So while the tour and the step both stand still, the rest of the address
     REPLACES.

     The result is one history entry per step: Back inside a lesson goes back a
     step, and Back out of the step you entered on leaves the lesson, which is
     what `shell-surface` C1 asserts and what a phone's Back button means. */
  const LESSON_NAV = new Set(['tour', 'step', 'panel', 'quiz']);

  function isNavigational(before, after) {
    if (before == null) return false;
    const a = parseRaw(before), b = parseRaw(after);
    const inLesson = !!a.get('tour') && a.get('tour') === b.get('tour')
      && (a.get('step') || '') === (b.get('step') || '');
    for (const k of (inLesson ? LESSON_NAV : NAVIGATIONAL)) {
      if ((a.get(k) || '') !== (b.get(k) || '')) return true;
    }
    return false;
  }

  function parseRaw(raw) {
    const m = new Map();
    for (const part of String(raw).split('&')) { const i = part.indexOf('='); if (i > 0) m.set(part.slice(0, i), part.slice(i + 1)); }
    return m;
  }

  // Year scrubbing fires every frame; the History API throttles hard and will
  // start logging errors if we write that often. 150ms trailing is invisible
  // to a human and safe in every browser.
  const writeSoon = throttle(() => write(false), 150);

  const onPop = () => {
    const raw = currentHash();
    if (raw === lastWritten) return;
    /* Held, not applied — and `lastWritten` is NOT touched, so the replay at
       ready goes down the ordinary path and the ordinary path's own guards
       (the orphan check, the pop semantics) all still run. */
    if (!isReady()) {
      pendingAddress = raw;
      if (bus) bus.emit('url:deferred', { raw, why: 'booting' });
      return;
    }
    applyPop(raw);
  };

  function applyPop(raw) {
    const orphan = unknownAddress(raw);
    if (orphan) {
      /* A pasted address that names nothing must not be treated as Back. Back
         means "everything the address does not name goes to its default", and
         obeying that here would silently throw away the reader's selection, the
         layer and the year on the strength of a typo. Say so; change nothing;
         put the real address back. */
      lastWritten = null;
      if (bus) bus.emit('url:unknown', { raw: orphan, where: 'paste' });
      write(true);
      return;
    }
    lastWritten = raw;
    // A pop is not a reader action either: same window, same reason.
    applyPatch_(parseForPop(raw), bus ? () => bus.emit('url:pop', { raw }) : null);
  };

  const unsub = store.subscribe(() => writeSoon());
  /* THE REPLAY. One shot, on the transition into `ready`, and out of the
     subscriber's own frame so a hydrate cannot re-enter the notification that
     delivered it. If nothing arrived during boot this does nothing at all and
     the writer above publishes the app's own address in the same frame. */
  const unsubReady = store.subscribe((state) => {
    if (pendingAddress == null || state.status !== 'ready') return;
    const raw = pendingAddress;
    pendingAddress = null;
    queueMicrotask(() => { if (!disposed) applyPop(raw); });
  });
  addEventListener('popstate', onPop);
  addEventListener('hashchange', onPop);

  /** Absolute, shareable URL for the current state (optionally with a patch applied). */
  function link(patch = null) {
    const state = patch ? applyPatch(store.getState(), patch) : store.getState();
    return href() + '#' + serialize(state);
  }
  function share() { return link(null); }

  function applyPatch(state, patch) {
    const next = { ...state, ...patch };
    if (patch.panelState) next.panelState = { ...state.panelState, ...patch.panelState };
    if (patch.quizState) next.quizState = { ...state.quizState, ...patch.quizState };
    if (patch.filters) next.filters = { ...state.filters, ...patch.filters };
    return next;
  }

  function destroy() {
    disposed = true;
    pendingAddress = null;
    writeSoon.cancel();
    unsub();
    unsubReady();
    removeEventListener('popstate', onPop);
    removeEventListener('hashchange', onPop);
  }

  return { restore, write, link, share, destroy, serialize, parse };
}

export default { connect, serialize, parse, parseForPop, unknownAddress };
