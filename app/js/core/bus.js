/**
 * bus.js — the cross-module event bus.
 *
 * The store is for STATE (things that are true right now).
 * The bus is for MOMENTS (things that just happened) and for requests one module
 * makes of another without importing it.
 *
 * Handlers are isolated: a throwing subscriber can never break the emitter or
 * the other subscribers. Errors are reported through `bus.on('error', …)`.
 *
 *   import { bus } from './core/bus.js';
 *   const off = bus.on('territory:select', ({ id }) => { … });
 *   bus.emit('territory:select', { id: 'bengal' });
 *   off();
 *
 * Conventions (see docs/ARCHITECTURE.md for the full catalogue):
 *   <area>:<verb>     e.g. map:ready, map:hover, timeline:scrub, tour:step
 *   ask:<verb>        a request another module may honour, e.g. ask:flyTo
 */

const NS = '*';

export function createBus({ name = 'bus', debug = false } = {}) {
  /** @type {Map<string, Set<Function>>} */
  const chans = new Map();
  const log = [];

  function channel(type) {
    let s = chans.get(type);
    if (!s) chans.set(type, (s = new Set()));
    return s;
  }

  function on(type, fn) {
    if (typeof fn !== 'function') throw new TypeError(name + '.on(' + type + ') needs a function');
    channel(type).add(fn);
    return () => off(type, fn);
  }

  function once(type, fn) {
    const wrapped = (detail, meta) => { off(type, wrapped); fn(detail, meta); };
    return on(type, wrapped);
  }

  function off(type, fn) {
    const s = chans.get(type);
    if (!s) return false;
    const had = s.delete(fn);
    if (!s.size) chans.delete(type);
    return had;
  }

  function emit(type, detail) {
    const meta = { type, at: performance.now() };
    if (debug) { log.push(meta); if (log.length > 500) log.shift(); }
    dispatch(chans.get(type), detail, meta);
    if (type !== NS) dispatch(chans.get(NS), detail, meta);
    return detail;
  }

  function dispatch(set, detail, meta) {
    if (!set || !set.size) return;
    for (const fn of [...set]) {
      try { fn(detail, meta); }
      catch (err) { report(err, meta.type, fn); }
    }
  }

  function report(err, type, fn) {
    const set = chans.get('error');
    if (set && set.size) {
      for (const h of [...set]) { try { h({ error: err, type, handler: fn }); } catch (_) { /* give up quietly */ } }
    } else {
      console.warn('[' + name + '] handler for "' + type + '" threw:', err);
    }
  }

  /** Wait for an event once, as a promise. Resolves null on timeout. */
  function next(type, timeout = 0) {
    return new Promise(resolve => {
      const off1 = once(type, d => { clearTimeout(t); resolve(d); });
      const t = timeout ? setTimeout(() => { off1(); resolve(null); }, timeout) : 0;
    });
  }

  function clear(type) { if (type) chans.delete(type); else chans.clear(); }
  function count(type) { return (chans.get(type) || { size: 0 }).size; }
  function types() { return [...chans.keys()]; }

  return { on, once, off, emit, next, clear, count, types, ANY: NS };
}

/** The single application bus. */
export const bus = createBus({ name: 'bus' });
export default bus;
