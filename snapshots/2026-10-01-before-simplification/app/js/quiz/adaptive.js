/**
 * quiz/adaptive.js — the schedule, and the only thing this app remembers
 * about a student.
 *
 * THE RECORD. FEATURE_SPEC §1, charge 12 fixes the metrics schema at seven
 * fields and forbids an eighth. This module writes exactly those seven keys to
 * `localStorage` under `bea:metrics.v1` and nothing else, ever, and never to a
 * network. There is no dwell time here, no click count, no session length, no
 * "most popular territory", and no score. You cannot optimise a number you
 * never collect.
 *
 *   pathCompletion              — P05's, when it lands. Preserved, never written here.
 *   firstAttemptAccuracyByTItem — ours. Per T-item: how often it was produced
 *                                 right the FIRST time it was ever asked. The
 *                                 retrieval schedule for each item lives inside
 *                                 its own record here, because the schedule IS
 *                                 per-T-item retrieval and putting it anywhere
 *                                 else would mean an eighth key.
 *   predictionErrorByPredict    — ours. Per [PREDICT] moment: how often the
 *                                 committed guess was wrong. If nobody is ever
 *                                 wrong at the opening, the hook is too easy.
 *   gatePlacements              — P05's. Preserved.
 *   throughLineCompletion       — P21's. Preserved.
 *   delayedRetrievalOnReturn    — ours. How the delayed re-ask went on return.
 *   closeReachedAtMinute        — P21's. Preserved.
 *
 * THE SPACING. DIDACTIC_SPEC §3: every item is encountered at least twice, at
 * least six minutes apart, and the second encounter is production, not
 * re-presentation. FEATURE_SPEC §2 P10 sharpens it: an item introduced before
 * minute 16 returns after minute 22. Both are enforced here, in that order.
 * After the session, the gaps expand — a day, three days, a week, three weeks —
 * because the retention interval we care about is next week's lesson
 * (Cepeda et al., 2006).
 */

const KEY = 'metrics.v1';
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

/** The seven. Nothing else is ever persisted. */
const FIELDS = [
  'pathCompletion',
  'firstAttemptAccuracyByTItem',
  'predictionErrorByPredict',
  'gatePlacements',
  'throughLineCompletion',
  'delayedRetrievalOnReturn',
  'closeReachedAtMinute',
];

const EMPTY = () => ({
  pathCompletion: null,
  firstAttemptAccuracyByTItem: {},
  predictionErrorByPredict: {},
  gatePlacements: [],
  throughLineCompletion: null,
  delayedRetrievalOnReturn: {},
  closeReachedAtMinute: null,
});

/** In-session second encounter: six minutes, and after minute 22 if it was
 *  first met before minute 16. Then the long tail, in days. */
const LADDER = [6 * MIN, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY];

export default class Schedule {
  constructor(storage, now = () => Date.now()) {
    this.storage = storage;
    this.now = now;
    this.started = now();
    this.m = this._read();
    this.answeredThisSession = new Set();
  }

  /* ------------------------------------------------------------- store -- */

  _read() {
    const raw = this.storage.get(KEY, null);
    const m = EMPTY();
    if (raw && typeof raw === 'object') {
      for (const k of FIELDS) if (raw[k] !== undefined) m[k] = raw[k];
    }
    return m;
  }

  /** Writes exactly the seven fields. A key outside FIELDS cannot reach disk. */
  _write() {
    const out = {};
    for (const k of FIELDS) out[k] = this.m[k];
    this.storage.set(KEY, out);
  }

  forget() {
    this.storage.remove(KEY);
    this.m = EMPTY();
    this.answeredThisSession = new Set();
  }

  /** For the acceptance test: the exact key set that reaches localStorage. */
  persistedKeys() { return FIELDS.slice(); }

  /* -------------------------------------------------------------- read -- */

  sessionMinute() { return (this.now() - this.started) / MIN; }

  record(item) {
    const t = this.m.firstAttemptAccuracyByTItem[item.t];
    return (t && t.items && t.items[item.id]) || null;
  }

  /** Has this student been away and come back with work outstanding? */
  isReturn() {
    let last = 0;
    for (const t of Object.values(this.m.firstAttemptAccuracyByTItem)) {
      for (const r of Object.values((t && t.items) || {})) if (r.lastAt > last) last = r.lastAt;
    }
    return last > 0 && (this.now() - last) > 30 * MIN;
  }

  /** Everything due now, hardest-earned first: what they got wrong, oldest. */
  due(items, limit = 0) {
    const now = this.now();
    const out = items.filter((it) => {
      const r = this.record(it);
      return r && r.dueAt && r.dueAt <= now && !this.answeredThisSession.has(it.id);
    });
    out.sort((a, b) => {
      const ra = this.record(a), rb = this.record(b);
      const wrongA = ra.lastRight === false ? 0 : 1;
      const wrongB = rb.lastRight === false ? 0 : 1;
      if (wrongA !== wrongB) return wrongA - wrongB;
      return ra.dueAt - rb.dueAt;
    });
    return limit ? out.slice(0, limit) : out;
  }

  /** Never seen, in the order the lesson meets them. */
  fresh(items, limit = 0) {
    const out = items.filter((it) => !this.record(it) && !this.answeredThisSession.has(it.id));
    out.sort((a, b) => (a.minutes || 99) - (b.minutes || 99));
    return limit ? out.slice(0, limit) : out;
  }

  /** The queue: what is owed first, then what has not been met. */
  queue(items, limit = 3) {
    const d = this.due(items);
    if (d.length >= limit) return d.slice(0, limit);
    return d.concat(this.fresh(items, limit - d.length));
  }

  /* ------------------------------------------------------------- write -- */

  /**
   * One answer. `right` is a boolean; `onReturn` marks a delayed re-ask that
   * opened a new visit, which is the spacing effect and the thing worth
   * measuring.
   */
  answer(item, right, onReturn = false) {
    const now = this.now();
    const byT = this.m.firstAttemptAccuracyByTItem;
    if (!byT[item.t]) byT[item.t] = { asked: 0, firstCorrect: 0, items: {} };
    const t = byT[item.t];
    if (!t.items) t.items = {};
    let r = t.items[item.id];
    const first = !r;
    if (first) {
      r = t.items[item.id] = { asked: 0, firstRight: null, right: 0, wrong: 0, streak: 0, lastAt: 0, dueAt: 0, lastRight: null };
      t.asked = (t.asked || 0) + 1;
    }
    r.asked += 1;
    if (first) {
      r.firstRight = !!right;
      if (right) t.firstCorrect = (t.firstCorrect || 0) + 1;
    }
    if (right) { r.right += 1; r.streak = (r.streak || 0) + 1; }
    else { r.wrong += 1; r.streak = 0; }
    r.lastRight = !!right;
    r.lastAt = now;

    /* The spacing rule, in the order the spec states it. */
    const step = Math.min(r.streak, LADDER.length - 1);
    let dueAt = now + LADDER[step];
    if (step === 0) {
      const met = this.sessionMinute();
      if (met < 16) dueAt = Math.max(dueAt, this.started + 22 * MIN);
    }
    r.dueAt = dueAt;

    if (item.predict) {
      const p = this.m.predictionErrorByPredict;
      if (!p[item.predict]) p[item.predict] = { asked: 0, wrong: 0 };
      p[item.predict].asked += 1;
      if (!right) p[item.predict].wrong += 1;
    }

    if (onReturn) {
      const d = this.m.delayedRetrievalOnReturn;
      d.asked = (d.asked || 0) + 1;
      if (right) d.correct = (d.correct || 0) + 1;
      d.lastReturnAt = now;
    }

    this.answeredThisSession.add(item.id);
    this._write();
    return r;
  }

  /**
   * Owed: produced wrongly and never since produced right — regardless of the
   * clock. `due()` is the schedule and is the right thing almost everywhere,
   * but a session ends at the Close and there is no "later" after it. An item
   * the student got wrong at minute eight and has not put right by minute
   * twenty-seven is owed, and offering it is worth more than protecting a gap
   * that will never elapse. Oldest miss first.
   */
  owed(items, limit = 0) {
    const out = items.filter((it) => {
      const r = this.record(it);
      return r && r.lastRight === false;
    });
    out.sort((a, b) => this.record(a).lastAt - this.record(b).lastAt);
    return limit ? out.slice(0, limit) : out;
  }

  /** What this student got wrong last time, for the return sentence. */
  wrongLastTime(items) {
    return items.filter((it) => {
      const r = this.record(it);
      return r && r.lastRight === false;
    });
  }

  /** True once every item has been produced correctly at least once. */
  coverage(items) {
    let met = 0, right = 0;
    for (const it of items) {
      const r = this.record(it);
      if (!r) continue;
      met += 1;
      if (r.right > 0) right += 1;
    }
    return { met, right, total: items.length };
  }
}
