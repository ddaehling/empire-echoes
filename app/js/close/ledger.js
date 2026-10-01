/**
 * close/ledger.js — the Ledger. FEATURE_SPEC P21, first object.
 *
 * WHAT IT IS. A record of every *commitment* this student made, written as a
 * sentence in their own voice: "I said the map showed 2 kinds of rule. It
 * showed 11." Nothing else is recorded. Not clicks, not dwell time, not scroll
 * depth, not which territory is popular. Charge 12's containment is
 * architectural: you cannot optimise a number you never collect, so the write
 * path below is a whitelist and everything outside it is dropped on the floor.
 *
 * THE ONLY KINDS THAT MAY BE WRITTEN are in `KINDS`. The only fields that may
 * be persisted are in `FIELDS`. `sanitise()` enforces both, and a scenario can
 * assert the persisted object's key set (P21 acceptance test 5).
 *
 * Persisted to localStorage at `bea.ledger.v1`, never to a network. Clearable.
 *
 * Listens:  ledger:append  { kind, claimId, ... }   — anyone may write
 * Emits:    ledger:changed { count, last }
 */

const KEY = 'bea.ledger.v1';

/** The whole enumeration. A `kind` not on this list is not recorded. */
export const KINDS = [
  'predicted',    // committed a guess before a reveal
  'sorted',       // put things in an order or into buckets
  'classified',   // named a legal status / a mechanism
  'placed',       // put a complication on the two-axis field
  'declined',     // was offered a complication and declined it, by name
  'attributed',   // answered "what was this source made for?"
  'collapsed',    // chose one of four competing claims and paid its price
  'dissented',    // pushed back, verbatim
  'found',        // opened a fact for themselves, off the path
  'retold',       // wrote the through-line in their own words
  'completed',    // finished a beat
];

/** The whole schema. Anything else is dropped before it reaches storage. */
const FIELDS = [
  'id', 'kind', 'claimId', 'beatId', 't', 'misconceptionId',
  'prompt', 'youSaid', 'answer', 'verdict', 'year', 'unitIds', 'at', 'dueAt',
];

/** The longest gap the Close will still call one sitting. */
const SESSION_MS = 3 * 60 * 60 * 1000;

let seq = 0;

function nowId() { seq += 1; return 'l' + Date.now().toString(36) + '-' + seq; }

function sanitise(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const kind = String(raw.kind || '');
  if (!KINDS.includes(kind)) return null;
  const out = { id: raw.id || nowId(), kind, at: Number(raw.at) || Date.now() };
  for (const f of FIELDS) {
    if (f === 'id' || f === 'kind' || f === 'at') continue;
    const v = raw[f];
    if (v == null || v === '') continue;
    if (f === 'unitIds') { out[f] = (Array.isArray(v) ? v : [v]).map(String).slice(0, 40); continue; }
    if (f === 'year' || f === 'dueAt') { const n = Number(v); if (Number.isFinite(n)) out[f] = n; continue; }
    if (f === 'youSaid' || f === 'answer' || f === 'prompt') { out[f] = String(v).slice(0, 400); continue; }
    out[f] = String(v).slice(0, 120);
  }
  return out;
}

export function createLedger(bus, storage) {
  const store = storage || {
    get: (k, f) => { try { const v = localStorage.getItem(k); return v == null ? f : JSON.parse(v); } catch (_) { return f; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; } },
    remove: (k) => { try { localStorage.removeItem(k); } catch (_) { /* private mode */ } },
  };

  let entries = [];
  const loaded = store.get(KEY, null);
  if (Array.isArray(loaded)) entries = loaded.map(sanitise).filter(Boolean);

  const startedAt = Date.now();
  let saveT = 0;
  const save = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => store.set(KEY, entries.slice(-400)), 120);
  };

  const api = {
    KEY,
    KINDS,
    startedAt,

    /** The one write path. Returns the stored entry, or null if it was refused. */
    append(raw) {
      const e = sanitise(raw);
      if (!e) return null;
      /* One entry per claim, and the FIRST answer is the one that is kept —
         a student's first wrong guess is the thing the Close is about, so a
         later correction is recorded as a separate `verdict`, never as a
         quiet overwrite of what they actually said. */
      if (e.claimId) {
        const prior = entries.find((x) => x.claimId === e.claimId && x.kind === e.kind);
        if (prior) {
          if (e.verdict && !prior.verdict) prior.verdict = e.verdict;
          save();
          return prior;
        }
      }
      entries.push(e);
      save();
      if (bus) bus.emit('ledger:changed', { count: entries.length, last: e });
      return e;
    },

    /**
     * HOW LONG THIS STUDENT HAS BEEN HERE, and never zero of anything.
     *
     * `startedAt` is this page's load. That was right until somebody reloaded:
     * the record survives a reload and the clock did not, so a student who had
     * been working for twenty minutes and pressed refresh was told at the Close
     * that they had just arrived. The earliest commitment still in the record
     * counts instead — but only if it is inside `SESSION_MS`, because a ledger
     * is kept for weeks and "after 4,317 minutes" is not a session, it is a
     * date. Nothing new is stored to do this: `at` is already on every entry.
     */
    elapsedMs() {
      const now = Date.now();
      let from = startedAt;
      for (const e of entries) {
        const t = Number(e.at);
        if (Number.isFinite(t) && t < from && now - t < SESSION_MS) from = t;
      }
      return Math.max(0, now - from);
    },

    all() { return entries.slice(); },
    count() { return entries.length; },
    byKind(kind) { return entries.filter((e) => e.kind === kind); },
    get(claimId) { return entries.find((e) => e.claimId === claimId) || null; },
    has(claimId) { return entries.some((e) => e.claimId === claimId); },
    /** Did this student do this beat? `completed` is written by the runner. */
    didBeat(beatId) { return entries.some((e) => e.beatId === beatId && e.kind === 'completed'); },
    beatsDone() { return entries.filter((e) => e.kind === 'completed').map((e) => e.beatId); },
    /** Facts found off the path, which convert a later beat into a retrieval. */
    /* The dossier stamps a found claim as `<territoryId>:<section>`, so a place
       opened off the path matches on its prefix as well as on its id. */
    found(id) {
      const pre = String(id) + ':';
      return entries.some((e) => e.kind === 'found' && (e.claimId === id || e.beatId === id || String(e.claimId || '').startsWith(pre)));
    },
    declined() { return entries.filter((e) => e.kind === 'declined'); },
    dissents() { return entries.filter((e) => e.kind === 'dissented'); },
    /* Whole minutes, rounded — and the Close is careful never to print this
       number on its own, because a run that rounds to zero is a run of some
       length and "after 0 minutes" tells a student who has just finished
       thirteen lines that they spent no time on them. See `_elapsedSay()`. */
    minutes() { return Math.max(0, Math.round(api.elapsedMs() / 60000)); },

    clear() { entries = []; store.remove(KEY); if (bus) bus.emit('ledger:changed', { count: 0, last: null }); },

    /** Wire the bus so any piece in the app can write one line. */
    listen() {
      if (!bus) return () => {};
      return bus.on('ledger:append', (p) => api.append(p));
    },
  };

  return api;
}

/* One Ledger per page. It is an ES module, so this is a real singleton: the
   tours module, the onboarding module and the close module all import this
   file and all get the same record, whatever order they mount in and whether
   or not any one of them fails. */
let singleton = null;
let listening = null;

export function getLedger(bus) {
  if (!singleton) singleton = createLedger(bus || null);
  if (bus && !listening) listening = singleton.listen();
  return singleton;
}

export default createLedger;
