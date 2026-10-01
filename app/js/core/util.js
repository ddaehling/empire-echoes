/**
 * util.js — the small shared toolbox. No dependencies, no side effects on import.
 * Everything here is used by more than one module; if only your module needs it,
 * keep it in your module.
 */

/* ---------------------------------------------------------------- DOM ---- */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * el('button.tour__next', { type:'button', 'aria-label':'Next' }, 'Next')
 * Tag syntax: tag#id.class.class  (tag defaults to div)
 * Props: attributes by default; `class`, `style` (object or string), `dataset`
 * (object), `html` (innerHTML — you own the escaping), `text`, and on* handlers.
 * Children: strings, numbers, Nodes, arrays, null/false/undefined (skipped).
 */
export function el(spec, props, ...children) {
  const m = /^([a-zA-Z][\w-]*)?(#[\w-]+)?((?:\.[\w-]+)*)$/.exec(spec || 'div');
  if (!m) throw new SyntaxError('el(): bad spec "' + spec + '"');
  const node = document.createElement(m[1] || 'div');
  if (m[2]) node.id = m[2].slice(1);
  if (m[3]) node.className = m[3].slice(1).split('.').join(' ');
  if (props && (props.nodeType || typeof props !== 'object' || Array.isArray(props))) {
    children.unshift(props); props = null;
  }
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class' || k === 'className') node.className = (node.className ? node.className + ' ' : '') + v;
    else if (k === 'style') { if (typeof v === 'string') node.setAttribute('style', v); else Object.assign(node.style, v); }
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) node.setAttribute(k, '');
    else node.setAttribute(k, v);
  }
  append(node, children);
  return node;
}

export function append(parent, kids) {
  for (const c of kids.flat(4)) {
    if (c == null || c === false || c === true) continue;
    parent.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return parent;
}

/** Replace all children of `node` with `kids`. */
export function fill(node, ...kids) { node.replaceChildren(); return append(node, kids); }

export function frag(...kids) { return append(document.createDocumentFragment(), kids); }

/** Escape text for interpolation into an HTML string. */
export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * on(target, 'click', handler)                        — plain listener
 * on(target, 'click', '.card', handler)               — delegated; `this`/2nd arg is the matched element
 * Returns an unsubscribe function. Always use it in destroy().
 */
export function on(target, type, selectorOrFn, maybeFn, opts) {
  const delegated = typeof selectorOrFn === 'string';
  const fn = delegated ? maybeFn : selectorOrFn;
  const options = (delegated ? opts : maybeFn) || undefined;
  const handler = delegated
    ? (ev) => { const hit = ev.target instanceof Element ? ev.target.closest(selectorOrFn) : null;
                if (hit && target.contains(hit)) fn(ev, hit); }
    : fn;
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

/** Collects unsubscribe functions; call the returned object's .all() in destroy(). */
export function disposer() {
  const fns = [];
  const add = (f) => { if (typeof f === 'function') fns.push(f); return f; };
  add.all = () => { while (fns.length) { try { fns.pop()(); } catch (e) { console.warn('dispose failed', e); } } };
  add.size = () => fns.length;
  return add;
}

/* ------------------------------------------------------------- timing ---- */

export const raf = (fn) => requestAnimationFrame(fn);
export const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
export const idle = (fn, timeout = 200) =>
  (window.requestIdleCallback || ((f) => setTimeout(f, 1)))(fn, { timeout });

/** Trailing-edge debounce. */
export function debounce(fn, ms = 150) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  d.now = (...a) => { clearTimeout(t); fn(...a); };
  return d;
}

/** Leading-edge throttle with a trailing call.
 *
 *  Two defects have been filed against this function and both are closed here.
 *
 *  1. THE ORPHANED TIMER (filed by P03, round 4). `run()` used to drop its
 *     reference to a pending timer without cancelling it. A trailing timer can
 *     fire late — under a long task it routinely does — so a call arriving
 *     after `last + ms` while that timer was still queued took the leading-edge
 *     branch, ran, and set `args = null`; the orphaned timer then fired into
 *     `fn(...null)`. Dragging the year scrubber 600 times threw 32 times in a
 *     row, from url.js's 150 ms history writer. `run()` now cancels the timer
 *     it is standing in for.
 *
 *  2. RE-ENTRANCY. `fn` is called from inside `run()`, and this function's one
 *     caller in the shell (url.js) reaches `history.replaceState`, which any
 *     module may observe and answer with another dispatch — which lands back
 *     here on the same stack. If that re-entrant call found `wait <= 0` it
 *     called `run()` again from inside `run()`, so `fn` re-entered itself, and
 *     with an unlucky `ms` that recurses until the stack ends. A call that
 *     arrives WHILE `fn` is running is now always deferred to a timer, never
 *     executed inline, so `fn` is never on its own stack twice.
 *
 *  The trailing arguments are captured before `fn` runs and cleared after, so a
 *  handler that throws leaves this function in a usable state rather than a
 *  half-armed one.
 */
export function throttle(fn, ms = 100) {
  let last = 0, t = null, args = null, running = false;
  const run = () => {
    clearTimeout(t); t = null;
    last = performance.now();
    const a = args; args = null;
    if (!a) return;
    running = true;
    try { fn(...a); } finally { running = false; last = performance.now(); }
  };
  const th = (...a) => {
    args = a;
    if (running) { if (!t) t = setTimeout(run, ms); return; }   // never re-enter fn
    const wait = ms - (performance.now() - last);
    if (wait <= 0) run();
    else if (!t) t = setTimeout(run, wait);
  };
  th.cancel = () => { clearTimeout(t); t = null; args = null; };
  th.flush = () => { if (args) run(); };
  th.pending = () => !!args;
  return th;
}

/** Coalesce many calls into one per animation frame (latest arguments win). */
export function rafThrottle(fn) {
  let id = 0, args = null;
  const th = (...a) => { args = a; if (!id) id = requestAnimationFrame(() => { id = 0; fn(...args); }); };
  th.cancel = () => { if (id) cancelAnimationFrame(id); id = 0; };
  return th;
}

/** Run fn once, ever. */
export function once(fn) { let done = false, val; return (...a) => (done ? val : (done = true, val = fn(...a))); }

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * Frame loop with easing. Returns a stop() function.
 * animate({ ms:600, ease:easing.outCubic, tick:t => …, done:() => … })
 * Honours prefers-reduced-motion by jumping straight to t=1 unless force:true.
 */
export function animate({ ms = 400, ease = (t) => t, tick, done, force = false } = {}) {
  if (!force && prefersReducedMotion()) { tick && tick(1); done && done(); return () => {}; }
  const t0 = performance.now();
  let id = requestAnimationFrame(step), stopped = false;
  function step(now) {
    const t = ms <= 0 ? 1 : clamp((now - t0) / ms, 0, 1);
    tick && tick(ease(t), t);
    if (t < 1 && !stopped) id = requestAnimationFrame(step);
    else if (!stopped) done && done();
  }
  return () => { stopped = true; cancelAnimationFrame(id); };
}

/* --------------------------------------------------------------- math ---- */

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const inverseLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
export const round = (v, dp = 0) => { const p = 10 ** dp; return Math.round(v * p) / p; };
export const snap = (v, step) => Math.round(v / step) * step;

/** Where does `v` sit in [a,b] mapped onto [c,d], clamped. */
export const mapRange = (v, a, b, c, d) => lerp(c, d, clamp(inverseLerp(a, b, v), 0, 1));

/** Index of the last entry <= value, in a sorted numeric array. -1 if none. */
export function bisect(arr, value) {
  let lo = 0, hi = arr.length - 1, ans = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (arr[mid] <= value) { ans = mid; lo = mid + 1; } else hi = mid - 1; }
  return ans;
}

export const easing = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => t * (2 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  outCubic: t => 1 - (1 - t) ** 3,
  inOutCubic: t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outQuint: t => 1 - (1 - t) ** 5,
  inOutQuint: t => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2),
  outBack: t => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
  outElastic: t => (t === 0 || t === 1) ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
};

/* ---------------------------------------------------------------- ids ---- */

let _uid = 0;
export const uid = (prefix = 'u') => prefix + '-' + (++_uid).toString(36) + '-' + Math.random().toString(36).slice(2, 6);

/** Deterministic small hash — handy for stable colours/keys. */
export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0);
}

export const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ------------------------------------------------------- collections ---- */

export function groupBy(items, key) {
  const fn = typeof key === 'function' ? key : (x) => x[key];
  const m = new Map();
  for (const it of items) { const k = fn(it); const a = m.get(k); a ? a.push(it) : m.set(k, [it]); }
  return m;
}
export const unique = (arr) => [...new Set(arr)];
export const byKey = (items, key) => new Map(items.map(i => [typeof key === 'function' ? key(i) : i[key], i]));
export const sortBy = (items, fn) => [...items].sort((a, b) => { const x = fn(a), y = fn(b); return x < y ? -1 : x > y ? 1 : 0; });

/** Shallow equality — the comparison the store uses for selectors. */
export function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.is(a[k], b[k])) return false;
  return true;
}

/* ------------------------------------------------- environment / a11y ---- */

const _mm = (typeof window !== 'undefined' && window.matchMedia) ? window.matchMedia.bind(window) : null;
const NOOP_MQ = { matches: false, addEventListener() {}, removeEventListener() {} };
const mqReduce = _mm ? _mm('(prefers-reduced-motion: reduce)') : NOOP_MQ;
export const prefersReducedMotion = () => {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  const pref = root && root.dataset ? root.dataset.motion : '';
  if (pref === 'reduced') return true;
  if (pref === 'full') return false;
  return !!mqReduce.matches;
};
export function onReducedMotionChange(fn) {
  const h = () => fn(prefersReducedMotion());
  mqReduce.addEventListener && mqReduce.addEventListener('change', h);
  return () => mqReduce.removeEventListener && mqReduce.removeEventListener('change', h);
}

export function media(query, fn) {
  const mq = _mm ? _mm(query) : NOOP_MQ;
  const h = () => fn(mq.matches);
  mq.addEventListener('change', h); h();
  return () => mq.removeEventListener('change', h);
}

/** Speak a message through the shell's polite live region. Safe before boot. */
let _announceTimer = 0;
export function announce(message, assertive = false) {
  if (typeof document === 'undefined') return;
  const node = document.getElementById(assertive ? 'live-alert' : 'live-status');
  if (!node) return;
  clearTimeout(_announceTimer);
  node.textContent = '';
  _announceTimer = setTimeout(() => { node.textContent = String(message); }, 40);
}

/** Trap Tab focus inside `root` until the returned function is called. */
export function trapFocus(root, { initial } = {}) {
  const SEL = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const prev = document.activeElement;
  const focusables = () => $$(SEL, root).filter(n => n.offsetParent !== null || n === document.activeElement);
  const off = on(root, 'keydown', (ev) => {
    if (ev.key !== 'Tab') return;
    const f = focusables(); if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  (initial || focusables()[0] || root).focus?.();
  return () => { off(); if (prev && prev.focus) prev.focus(); };
}

/* --------------------------------------------------------- resources ---- */

/**
 * Load a stylesheet without ever producing a console 404.
 * Modules should call this in mount() for their own CSS:
 *   await loadCss(new URL('../../css/map.css', import.meta.url));
 * Use absolute /app/… paths for url() references inside the file.
 */
const _css = new Map();
export function loadCss(href, id) {
  const url = String(href);
  if (_css.has(url)) return _css.get(url);
  const p = fetch(url, { cache: 'no-store' })
    .then(r => (r.ok ? r.text() : null))
    .then(text => {
      if (text == null) return false;
      const style = document.createElement('style');
      style.dataset.href = url; if (id) style.id = id;
      style.textContent = text;
      document.head.appendChild(style);
      return true;
    })
    .catch(() => false);
  _css.set(url, p);
  return p;
}

/** fetch JSON, resolving to `fallback` (default null) on 404 / parse failure. No console noise. */
export async function getJson(url, fallback = null) {
  try {
    const r = await fetch(String(url), { cache: 'no-store' });
    if (!r.ok) return fallback;
    return await r.json();
  } catch (_) { return fallback; }
}

/** Does this URL exist? Used by the module registry so a missing module is silent. */
export async function exists(url) {
  try { const r = await fetch(String(url), { method: 'GET', cache: 'no-store' }); return r.ok; }
  catch (_) { return false; }
}

/* ------------------------------------------------------------ storage ---- */

/** localStorage that never throws (private mode, quota, disabled cookies). */
export const storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('bea:' + key); return v == null ? fallback : JSON.parse(v); }
    catch (_) { return fallback; }
  },
  set(key, value) { try { localStorage.setItem('bea:' + key, JSON.stringify(value)); return true; } catch (_) { return false; } },
  remove(key) { try { localStorage.removeItem('bea:' + key); } catch (_) {} },
};

export default {
  $, $$, el, append, fill, frag, escapeHtml, on, disposer,
  raf, nextFrame, idle, debounce, throttle, rafThrottle, once, sleep, animate,
  clamp, lerp, inverseLerp, round, snap, mapRange, bisect, easing,
  uid, hash, slug, groupBy, unique, byKey, sortBy, shallowEqual,
  prefersReducedMotion, onReducedMotionChange, media, announce, trapFocus,
  loadCss, getJson, exists, storage,
};
