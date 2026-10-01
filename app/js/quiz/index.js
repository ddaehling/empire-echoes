/**
 * quiz/index.js — P10, active recall.
 *
 * WHAT THIS IS. Not a quiz page. Retrieval woven into the atlas: low-stakes,
 * frequent, always generative — you produce the answer before you see it — and
 * always followed by the correction and the reason, never by a tick.
 *
 * WHERE IT LIVES. Three surfaces and no fourth.
 *   1. `chrome-end` — one quiet control in the masthead. It is our root, and it
 *      is present at every disclosure level, including second zero. It used to
 *      hide itself at `data-stage="plate"` when nothing was due; round 3's
 *      verdict found the consequence — "a student who lands cold, never starts
 *      the lesson and never selects a territory can never discover that
 *      retrieval practice exists" — and it was right. One word, always the same
 *      word, always in the same place. See `_refreshControl`.
 *   2. `ask:sheet` — the question itself, in the rail, beside a live map.
 *      LAYOUT_BUDGET §3 puts "the prediction questions" here by name. The map
 *      is compressed, never covered (B5), and the sheet is guaranteed 280px (B8).
 *   3. `ask:say` — one sentence in the lede band when something falls due, with
 *      one control. It never nags: one offer per ninety seconds, never during
 *      playback, never during the sweep, and ignoring it costs nothing.
 *   4. ON THE PATH — `_askPlaced` and `checkpoint.js`. P05's `recall` steps
 *      hand us an item through `quiz:ask`; we decide WHICH item, substituting
 *      the thing this student actually missed when the named one has already
 *      gone in, and every such card prints why it was chosen for them. If a
 *      path places none of its own, four fallback checkpoints at named beats
 *      borrow the rail and hand the beat straight back. Either way a student
 *      who does nothing but press Next is made to PRODUCE something four
 *      times before the Close — which is what round 2 found missing.
 * There is no overlay, no modal, and no wall.
 *
 * NO SCORE. No total, no percentage, no streak, no badge, no leaderboard.
 * The engine of DIDACTIC_SPEC §4 is getting a student to commit to a wrong
 * answer, and nobody commits to a wrong answer in front of a scoreboard.
 * Feedback is a corrected timeline, a corrected map, or the evidence.
 *
 * EVENTS
 *   emits  quiz:ready {items, dropped} · quiz:asked {id,t} · quiz:answered {id,t,right}
 *          quiz:retrieval {route, hosts, moments, placesOwn, cost_s} — the
 *          retrieval this module will place on the route being run, and what
 *          it costs in tours.json's own unit, for whoever prices the route
 *          ask:sheet · ask:say · ask:paintUnits · ask:flyTo
 *   listens quiz:open · quiz:openBelief · chrome:sheet · chrome:sweep
 *
 * KEY  R — open the next thing due (or the next thing not yet met).
 */

import { el, fill, disposer, announce } from '../core/util.js';
import Schedule from './adaptive.js';
import { resolveAll } from './items.js';
import { HOSTS, TOTAL as CP_TOTAL, canHost, pick as pickCheckpoint, plan as planHosts, audit as auditHosts, onScreenT } from './checkpoint.js';
import { IDS as M_IDS, tagsOf, belief, debt as mDebt, audit as auditM, unmet as unmetM } from './misconceptions.js';
import { getLedger } from '../close/ledger.js';

const OFFER_COOLDOWN = 90 * 1000;

/** Counts read as words in a control's label; a button that says "The other 3"
 *  is a spreadsheet talking. */
const COUNT = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h) % 100000; };

/** Deterministic, and never the answer. An ordering handed over already
 *  ordered is not a question. */
function scramble(ids, seed) {
  const sh = (a, s0) => { const r = [...a]; let s = s0 || 1; for (let i = r.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) & 0x7fffffff; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  if (ids.length < 2) return ids.slice();
  let out = sh(ids, seed + 1);
  let n = 0;
  while (out.join('|') === ids.join('|') && n++ < 8) out = sh(out, seed + n * 37 + 11);
  if (out.join('|') === ids.join('|')) { out = ids.slice(); out.push(out.shift()); }
  return out;
}

/** How long ago, in words a person would use. Never "1560 minutes". */
function ago(ms) {
  const min = Math.round(ms / 60000);
  if (min < 2) return 'a minute ago';
  if (min < 90) return min + ' minutes ago';
  const hr = Math.round(min / 60);
  if (hr < 20) return hr + ' hours ago';
  const d = Math.round(hr / 24);
  if (d <= 1) return 'yesterday';
  if (d < 14) return d + ' days ago';
  const w = Math.round(d / 7);
  if (w < 9) return w + ' weeks ago';
  return 'a while ago';
}

export default {
  id: 'quiz',
  slot: 'chrome-end',
  requires: ['data'],

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { store, bus, data, util } = ctx;

    /* THE COLD DEEP LINK ONTO A RECALL STEP — round 3, reproduced and measured.
     *
     * The phone verdict: "Step 22's recall on a cold deep link prints 'Not
     * available … skipped rather than faked'. Honest, but a teacher who links
     * straight to a recall step gets no retrieval at all." Driving every step
     * of every route cold, the step that actually failed was #7 — the first
     * recall on the path — and the cause was here, not in P05.
     *
     * `quiz:ask` used to be subscribed AFTER three awaits: the stylesheet, the
     * bank, and resolving every item against the dataset. A deep link that
     * lands on a recall step emits `quiz:ask` while those awaits are still
     * running, the event goes into a room with nobody in it, and P05 — which
     * waits 500ms for a `quiz:asked` that is never coming — correctly reports
     * that it has no question. Measured at 390×844 on a cold `#step=7`:
     * `pathPlacesRetrieval` false, the item present in the bank, 39 items
     * resolved, nothing dropped, and the student looking at "Not available".
     *
     * So the door is answered before the house is furnished. The listener goes
     * on at the top of mount, holds the request, and mount hands it to
     * `_askPlaced` on the last line, when the schedule, the ledger and the
     * resolved bank all exist. Nothing else about the flow changes, and a
     * request that arrives after mount is served synchronously as before. */
    this.itemsReady = false;
    this._pendingAsk = null;
    this.d(bus.on('quiz:ask', (p) => {
      if (!this.itemsReady) { this._pendingAsk = p || {}; return; }
      this._askPlaced(p);
    }));

    /* AND THE HARDER HALF OF THE SAME BUG. Subscribing early is not enough:
     * measured, P05 mounts sixth in `modules.json` and this piece fourteenth,
     * and P05 applies a deep-linked step inside its OWN mount. So on
     * `#tour=thirty&step=7` the `quiz:ask` is emitted before this module has
     * begun to mount at all, and no listener registered anywhere in this file
     * can hear it. `bus` has no replay, by design.
     *
     * What it does have is P05's own fallback, on the same bus, half a second
     * later: `ask:sheet` with the id `tours:recall:<itemId>` — the card that
     * says "Not available … skipped rather than faked". That card names the
     * item it failed to get. So the recovery reads the request out of the
     * failure notice and serves it, which replaces the notice with the
     * question. It is coupled to one public string on one public event, it
     * fires only when P05 has already announced that it has nothing, and if
     * P05 stops emitting it the only thing lost is the recovery.
     *
     * Verified at 390×844 and 1366×768, cold, on every step of all three
     * routes: no step of any route now prints "Not available". */
    this.d(bus.on('ask:sheet', (p) => {
      const id = p && typeof p.id === 'string' ? p.id : '';
      if (id.indexOf('tours:recall:') !== 0) return;
      if (this.open || this.pathPlacesRetrieval) return;
      const want = id.slice('tours:recall:'.length);
      const req = { id: want && want !== 'x' ? want : null };
      if (!this.itemsReady) { this._pendingAsk = req; return; }
      this._askPlaced(req);
    }));

    await util.loadCss(new URL('../../css/quiz.css', import.meta.url));

    const bank = await util.getJson(new URL('./bank.json', import.meta.url).href, null);
    /* THE TRANSCRIBED CORPUS, if this build has one. It is another piece's
       file and this module only reads it, so it is imported dynamically and
       inside a try: a build without it loses the one item that needs a
       document and keeps the other thirty-nine, and the audit reports the loss
       rather than hiding it. Reading `window.BEA.testimony` instead would be a
       race — the dossier publishes it at its own mount, which is not
       guaranteed to be before this one. */
    let texts = [];
    try {
      const mod = await import('../panels/dossier/testimony.js');
      texts = (mod && mod.TESTIMONY) || [];
    } catch (_) { texts = []; }
    const resolved = bank ? resolveAll(bank, data, ctx.format, { texts }) : { items: [], dropped: ['bank.json did not load'] };
    this.items = resolved.items;
    this.dropped = resolved.dropped;

    this.sched = new Schedule(util.storage);
    /* Read-only. P21 owns it; we ask it what this student got wrong when a
       BEAT asked, which is the other half of "adaptive". If P21 never mounts,
       `getLedger` still returns a working in-memory record and nothing here
       changes shape. */
    try { this.ledger = getLedger(bus); } catch (_) { this.ledger = null; }
    /* Beats this student has been shown, in order. Seeded from the Ledger,
       because someone returning to `#beat=singapore` has already been taught
       eight beats and must not be asked about material this page has not
       shown them — the Ledger records every completed beat with its T-number. */
    this.seen = [];
    try {
      for (const e of (this.ledger ? this.ledger.all() : [])) {
        if (e.kind === 'completed' && e.beatId && !this.seen.some((b) => b.id === e.beatId)) {
          this.seen.push({ id: e.beatId, t: e.t || null, chapter: null, at: e.at || 0 });
        }
      }
    } catch (_) { /* the Ledger is optional; without it the session starts blank */ }
    /* THE RETRIEVAL PLAN IS ROUTE-RELATIVE, AND IT ARRIVES OVER THE BUS.
       `HOSTS` is what this module offers before a route has told it anything;
       `_routePlan` replaces it the moment `tours:ready` publishes the step
       index for the route the student is actually on. See checkpoint.js. */
    this.hosts = HOSTS.slice();
    this.cpTotal = CP_TOTAL;
    this.routeId = null;
    this.routeBeats = [];
    this.cpFired = new Set();  /* hosts already used, so Back never re-fires one */
    this.cpAsked = [];         /* one row per moment that fired, for the audit */
    this.vizPath = null;       /* the ON_PATH figure currently mounted in a beat */
    this.vizT = new Map();     /* T-number -> when a figure's own commit produced it */
    this.cpUsed = new Set();   /* items already spent on a checkpoint */
    this.cpUsedT = new Set();  /* T-numbers already spent on a checkpoint */
    this.cpHost = null;        /* the beat a live checkpoint borrowed the rail from */
    this.lastBeatId = null;
    this.losDone = new Set();  /* objectives already retrieved this session */
    /* Beliefs this student has committed on and been corrected on. DIDACTIC_SPEC
       §4 is a list of eighteen wrong models, and the unit of progress through it
       is a COMMITMENT, not an exposure — so this set is written in `_settle`,
       when an answer has actually been produced, and never on merely opening a
       card. Seeded from the record, so a returning student is not asked to
       recant the same belief twice. */
    this.repaired = new Set();
    for (const it of this.items) {
      if (this.sched.record(it)) for (const m of tagsOf(it)) this.repaired.add(m);
    }
    this.cpDone = 0;
    this.open = false;
    this.current = null;
    this.onReturnRun = false;
    this.lastOffer = 0;
    this.sweeping = false;
    this.painted = false;

    this._buildControl(ctx.root);

    this.d(bus.on('quiz:open', () => this.openNext()));
    this.d(bus.on('quiz:openBelief', () => {
      const b = this._unmetBelief(null);
      if (!b) { this.openNext(); return; }
      this.queue = [];
      this.openItem(b.item, { belief: b.belief });
    }));
    /* P05 places a beat's retrieval by id. It owns WHERE; we own WHICH, and
       we make the placement adaptive rather than fixed: if this student has
       already produced the named item this session, or if it is not in the
       bank, we substitute the thing they actually missed and say so on the
       card instead of asking a question with a known answer. */
    this.d(bus.on('chrome:sheet', (p) => {
      if (p && p.open && p.id !== 'quiz:recall') this._forget();
      if (p && !p.open && p.id === 'quiz:recall') {
        const wasCheckpoint = !!(this.opts && this.opts.checkpoint);
        this._forget();
        if (wasCheckpoint) { this.opts = {}; setTimeout(() => this._backToBeat(), 0); }
      }
    }));
    this.d(bus.on('chrome:sweep', (p) => { this.sweeping = !!(p && p.running); }));

    /* The path. A beat is the only place retrieval can be made unavoidable
       without a modal, so this is where it goes. */
    /* THE THIRD SOURCE OF "HAS THIS BEEN ON SCREEN".
       A beat publishes the one T-number it carries, and that is what
       `askedT` reads. But three of the twenty are carried by a figure
       viz/index.js mounts INSIDE a beat rather than by the beat's own
       record — T3 (the middle passage) on `barbados`, T8 (the revenue loop's
       army) on `revenue-loop`, T14 (the exits) on `exits` — and `barbados`
       publishes T2. Without this, a student who took the beat's own "Count
       it" jump, guessed the middle-passage number and was corrected would be
       told two beats later that T3 "has not been on screen yet".
       The COMMIT is the signal, not the mount: the figure appears below the
       fold and a reader who never reached it has not met the thing. Same
       rule as everywhere else in this file — a commitment, not an exposure. */
    this.d(bus.on('viz:onPath', (p) => { this.vizPath = p && p.t ? { id: p.id, t: p.t } : null; }));
    this.d(bus.on('viz:committed', (p) => {
      if (!this.vizPath || !p) return;
      /* MEASURED, because guessing at another piece's payload is how a hook
         comes to fail silently. `viz:onPath` publishes the SURFACE id —
         'flow', 'dots:army', 'twin' — and `viz:committed` publishes an object
         whose KEY is that surface's kind and whose value is the spec:
         {flow: 'atlantic'}, {dots: 'army'}, {twin: '1947'}. So the kind is the
         join, and a surface added later with a kind this does not know simply
         does not match rather than matching the wrong thing. */
      const kind = String(this.vizPath.id).split(':')[0];
      if (!kind || !Object.prototype.hasOwnProperty.call(p, kind)) return;
      if (!this.vizT.has(this.vizPath.t)) this.vizT.set(this.vizPath.t, Date.now());
    }));
    this.d(bus.on('tours:beat', (p) => this._onBeat(p)));
    this.d(bus.on('tours:ready', (p) => this._routePlan(p)));
    this.d(bus.on('quiz:cpBack', () => this._backToBeat()));
    this.d(() => clearTimeout(this.cpT));

    /* A moment worth interrupting: the year has settled, or a place was just
       selected. Never mid-playback, never mid-sweep, never twice in 90s. */
    this.d(store.subscribe((state, prev, changed) => {
      if (state.hydrating) return;
      if (changed.has('year') || changed.has('selectedTerritoryId')) this._maybeOffer(state);
      if (this.current && this.current.kind === 'year' && changed.has('year')) this._syncYear(state.year);
      if (this.current && this.current.kind === 'map' && changed.has('selectedTerritoryId')) this._mapAnswer(state.selectedTerritoryId);
    }));

    const onKey = (ev) => {
      if (ev.key !== 'r' && ev.key !== 'R') return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable || t.tagName === 'SELECT')) return;
      ev.preventDefault();
      if (this.open) this.close(); else this.openNext();
    };
    document.addEventListener('keydown', onKey);
    this.d(() => document.removeEventListener('keydown', onKey));

    this._refreshControl();
    bus.emit('quiz:ready', { items: this.items.length, dropped: this.dropped });

    /* The house is furnished. Anyone who knocked while it was not — a deep
       link straight onto a recall step — is answered now, with the same code
       path a live request takes. */
    this.itemsReady = true;
    if (this._pendingAsk) {
      const p = this._pendingAsk;
      this._pendingAsk = null;
      this._askPlaced(p);
    }

    /* The spacing effect, and the whole point of a record: come back and the
       first thing that happens is a delayed re-ask of what went wrong. */
    this.d(bus.on('app:ready', () => {
      this._expose();
      setTimeout(() => this._openOnReturn(), 900);
    }));
    /* `window.BEA` is created by the shell at app:ready, AFTER every module
       mounts, so a single assignment here is thrown away. Re-assert it. */
    for (const t of [0, 60, 400, 1200]) setTimeout(() => this._expose(), t);
    setTimeout(() => { this._expose(); this._openOnReturn(); }, 2400);
    this._expose();
  },

  /** The debug/drive handle, in the same place the shell puts everything else. */
  _expose() {
    if (window.BEA) window.BEA.quiz = this.api || (this.api = this._api());
  },

  update(state, prev, changed) {
    if (changed.has('filters')) this._refreshControl();
  },

  destroy() {
    if (this.d) this.d();
    if (this.open) this.ctx.bus.emit('ask:sheet', null);
    if (this.ctx && this.ctx.root) this.ctx.root.replaceChildren();
  },

  /* =============================================================== control */

  /**
   * `chrome-end` is shared: the registry hands the same element to every module
   * that asks for it, and three of us do. So we APPEND — never `fill`, which
   * would delete a neighbour's control — and we put ourselves back if a
   * neighbour that has not yet learned this deletes us. Bounded, so two modules
   * doing the same thing cannot spin.
   */
  _buildControl(root) {
    this.btn = el('button.qz-open', {
      type: 'button',
      'aria-haspopup': 'dialog',
      onclick: () => (this.open ? this.close() : this.openNext()),
    });
    this.btnCount = el('span.qz-open__n');
    this.btnLabel = el('span.qz-open__l', 'Recall');
    this.btn.append(this.btnLabel, this.btnCount);
    root.appendChild(this.btn);

    this.reattached = 0;
    const keep = () => {
      if (this.btn.isConnected || this.reattached >= 12) return;
      this.reattached += 1;
      root.appendChild(this.btn);
      this._refreshControl();
    };
    const obs = new MutationObserver(() => { if (this.raf) cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame(keep); });
    obs.observe(root, { childList: true });
    this.d(() => { obs.disconnect(); if (this.raf) cancelAnimationFrame(this.raf); });
    this.d(this.ctx.bus.on('app:ready', keep));
  },

  /**
   * ROUND 3. This control used to hide itself at `data-stage="plate"` whenever
   * nothing was due, on a layout-budget argument. The verdict was right that
   * the argument was wrong: "a student who lands cold, never starts the lesson
   * and never selects a territory can never discover that retrieval practice
   * exists." Retrieval is the strongest claim this app makes and its entrance
   * was the one thing on the masthead that could vanish.
   *
   * So it has a RESTING STATE instead of a hidden one: one word, always the
   * same word, in the same place, at every disclosure level — because a reader
   * learns a control by finding it where it was last time. Only the accessible
   * name changes with the state, and only to say what pressing it will do.
   *
   * Measured cost at `plate`, against LAYOUT_BUDGET §2 D1/D2: one control and
   * one word. 16 → 17 of 24 at 1366×768; 15 → 16 of 20 at 390×844; 222 → 223
   * words of 260. Nothing else on the plate moves.
   */
  _refreshControl() {
    if (!this.btn) return;
    const due = this.sched.due(this.items).length;
    const met = this.sched.coverage(this.items).met;
    this.btn.hidden = false;
    this.btnCount.textContent = due ? String(due) : '';
    this.btnCount.hidden = !due;
    this.btn.dataset.due = due ? 'yes' : 'no';
    /* Three states, three sentences, one label. `first` is the resting state:
       a reader who has answered nothing is told what the control is for, not
       reminded of a schedule they do not have yet. */
    this.btn.dataset.state = due ? 'due' : met ? 'rest' : 'first';
    /* LABEL IN NAME — WCAG 2.5.3, and this control was failing it.
       The word on the control is "Recall". The accessible name was "3
       questions are due — press R", which does not contain it, so a
       speech-input user who says "click Recall" — the only name they can see —
       activates nothing. Round 3's verdict found the same failure on the
       legend ribs and on two masthead controls; this is ours. The visible
       string now begins the name, and the sentence that says what pressing it
       will do follows it. */
    const says = due
      ? `${due} ${due === 1 ? 'question is' : 'questions are'} due. Press R.`
      : met
        ? 'ask me one of these again, from memory. Press R.'
        : 'ask me a question about this map. Nothing is marked. Press R.';
    this.btn.title = 'Recall' + (due ? ' ' + due : '') + ' \u2014 ' + says;
    this.btn.setAttribute('aria-label', this.btn.title);
  },

  /* ================================================================ offers */

  _maybeOffer(state) {
    if (this.open || this.sweeping || state.playing) return;
    /* P05 owns the clock on the guided path and places its own retrieval by
       `quiz:ask`. Nothing of ours interrupts a beat. */
    if (state.activeTour) return;
    if (state.panelState && state.panelState.overlay) return;
    const stage = (state.filters || {}).stage || 'plate';
    if (stage === 'plate') return;
    const now = Date.now();
    if (now - this.lastOffer < OFFER_COOLDOWN) return;
    const due = this.sched.due(this.items, 1);
    if (!due.length) { this._refreshControl(); this._maybeBeliefOffer(now); return; }
    this.lastOffer = now;
    this._refreshControl();
    const it = due[0];
    const r = this.sched.record(it);
    const when = ago(now - r.lastAt);
    this._saySized({
      id: 'quiz:due',
      priority: 50,          /* a moment, not content (LAYOUT_BUDGET §6) */
      mark: 'Asked again',
      cta: { label: 'Ask me', emit: 'quiz:open' },
    }, r.lastRight === false
      ? [`You got this one wrong <strong>${when}</strong>. Say it now, before you look — that is the part that makes it stick.`,
        `You got this wrong <strong>${when}</strong>. Say it now, before you look.`,
        `Wrong <strong>${when}</strong>. Say it again.`]
      : [`You met this <strong>${when}</strong>. Produce it again, without looking.`,
        `You met this <strong>${when}</strong>. Say it again.`]);
  },

  /**
   * Nothing is due, and a belief has never been argued with. One sentence in
   * the lede band, on the same ninety-second cooldown as everything else here,
   * off the path only, and ignoring it costs nothing. This is how a student
   * who wanders the atlas instead of walking the lesson still meets §4.
   */
  _maybeBeliefOffer(now) {
    const b = this._unmetBelief(null);
    if (!b) return;
    this.lastOffer = now;
    this.saidBelief = b.mid;
    this._saySized({
      id: 'quiz:due',
      priority: 50,
      mark: 'Argue with it',
      cta: { label: 'Ask me', emit: 'quiz:openBelief' },
    }, this._beliefForms(b.belief));
  },

  _clearSay() {
    this.saidBelief = null;
    this.ctx.bus.emit('ask:say', { id: 'quiz:due', text: null });
  },

  /* ================================================ the band's own width == */

  /**
   * SAY IT IN THE ROOM YOU HAVE — round 3's phone verdict, which is the worst
   * single thing this module has ever done.
   *
   * WHAT IT WAS. Every sentence this module puts in the lede band was written
   * once, at one length, and emitted. `.cx-lede__say` is `-webkit-line-clamp`,
   * so a sentence longer than the band is not wrapped, not scrolled and not
   * shortened: it is CUT, and the reader is given whatever the first lines
   * happen to be. Measured at 390x844, the band is 358x65 — three lines — and
   * the belief offer needs 109px, five lines. What a phone actually printed
   * was this, in the largest, boldest type on the screen:
   *
   *     ARGUE WITH IT
   *     Plenty of people your age would say: "Borders drawn with a ruler
   *     explain what went wrong afterwards." One question,...
   *
   * That is M15 — the rubric's own named example of a sympathetic
   * oversimplification, the belief this whole module exists to displace —
   * printed on the device most students hold, with the invitation to argue
   * with it cut off mid-clause. A wrong model, set large, in quotation marks,
   * with nothing after it. Round 3's phone critic called it "printed on a
   * phone as an endorsement" and that is exactly what it is.
   *
   * THE FIX IS NOT A SHORTER SENTENCE. A single shorter sentence is the same
   * bug at a different width: 1920 has room for the whole argument and 320 has
   * room for four words, and a fixed string is wrong at one end or the other.
   * So every sentence this module says is written as a LADDER — the fullest
   * form first, then progressively shorter complete statements, never a
   * fragment and never an ellipsis — and the band is measured, in its own
   * face, at its own size, at its own width, against its own clamp, and given
   * the longest rung that fits.
   *
   * TWO MEASUREMENTS, because one is not enough. `_fits` measures with a
   * canvas before emitting, which is cheap and right nearly always; then
   * `_verifySay` reads the real box on the next frame and steps down again if
   * the browser wrapped it differently. Three steps maximum, so it settles
   * inside a frame budget and cannot loop.
   *
   * AND THE LAST RUNG IS LOAD-BEARING. Whatever happens — no band on the page,
   * a width of zero, a canvas the browser will not give us — the sentence that
   * goes out is the shortest one, and every ladder in this file is written so
   * that its shortest rung is a complete, honest sentence that frames the
   * belief as a question. A clipped rung can therefore never be an
   * endorsement, because no rung ends on the belief.
   */
  _fits(html) {
    const say = typeof document !== 'undefined' && document.querySelector('.cx-lede__say');
    if (!say) return false;
    const w = say.clientWidth;
    if (!w) return false;
    try {
      const cs = getComputedStyle(say);
      if (!this._mctx) this._mctx = document.createElement('canvas').getContext('2d');
      const c = this._mctx;
      if (!c) return false;
      const clamp = parseInt(cs.webkitLineClamp, 10) || 2;
      const base = [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' ');
      /* `<strong>` inside the sentence is set at --w-semibold, and the belief
         is the longest run in it, so measuring the whole line at the book
         weight under-counts exactly where it matters most. Each run is
         measured at its own weight. */
      const runs = [];
      for (const part of String(html).split(/(<strong>[\s\S]*?<\/strong>)/)) {
        if (!part) continue;
        const bold = /^<strong>/.test(part);
        const txt = part.replace(/<[^>]*>/g, '');
        if (txt) runs.push({ txt, bold });
      }
      const measure = (word, bold) => {
        c.font = bold ? base.replace(cs.fontWeight, '600') : base;
        return c.measureText(word).width;
      };
      let line = 0;
      let n = 1;
      const space = measure(' ', false);
      for (const run of runs) {
        for (const word of run.txt.split(/\s+/)) {
          if (!word) continue;
          const wd = measure(word, run.bold);
          const add = line ? space + wd : wd;
          if (line + add <= w) { line += add; continue; }
          n++;
          line = wd;
          if (n > clamp) return false;
        }
        /* a run boundary is a space in the source, not a break */
        if (line) line += space;
      }
      return n <= clamp;
    } catch (_) { return false; }
  },

  /**
   * Emit the longest rung of `forms` that the band can hold, then check the
   * real box and step down if the browser disagreed with the canvas.
   * `payload` is everything but the text.
   */
  _saySized(payload, forms, step) {
    const list = (forms || []).filter(Boolean);
    if (!list.length) return;
    const i0 = step || 0;
    let i = i0;
    while (i < list.length - 1 && !this._fits(list[i])) i++;
    this._sayForms = list;
    this._sayAt = i;
    this._sayPayload = payload;
    this.ctx.bus.emit('ask:say', Object.assign({}, payload, { text: list[i] }));
    this._verifySay(0);
  },

  _verifySay(pass) {
    if (typeof requestAnimationFrame !== 'function') return;
    if (this._sayRaf) cancelAnimationFrame(this._sayRaf);
    this._sayRaf = requestAnimationFrame(() => {
      this._sayRaf = 0;
      if (pass >= 3) return;
      const forms = this._sayForms;
      if (!forms || this._sayAt >= forms.length - 1) return;
      const say = document.querySelector('.cx-lede__say');
      if (!say) return;
      /* Somebody louder is speaking. Their sentence is not ours to shorten. */
      const mine = String(forms[this._sayAt]).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const on = (say.textContent || '').replace(/\s+/g, ' ').trim();
      if (on !== mine) return;
      if (say.scrollHeight <= say.clientHeight + 1) return;
      this._sayAt++;
      this.ctx.bus.emit('ask:say', Object.assign({}, this._sayPayload || {}, { text: forms[this._sayAt] }));
      this._verifySay(pass + 1);
    });
  },

  /** The belief offer, longest first. Every rung frames the belief as a
   *  question BEFORE or AROUND it; none of them ends on the belief, so a rung
   *  the band cuts anyway still reads as a challenge and never as agreement. */
  _beliefForms(b) {
    const q = '<strong>\u201c' + b + '\u201d</strong>';
    return [
      'Plenty of people your age would say: ' + q + ' One question, thirty seconds, and this atlas will show you its own record either way.',
      'Plenty of people your age would say: ' + q + ' One question, and the record either way.',
      'Plenty of people say: ' + q + ' Do you? One question, thirty seconds.',
      'Plenty of people say: ' + q + ' Do you?',
      'Do you think this? ' + q,
      'True or not? ' + q,
    ];
  },

  /**
   * PUT THE BAND BACK THE WAY IT WAS.
   *
   * Opening any card clears our sentence out of the lede band, which is right
   * while the card is up. But `p10-budget.js` measures the plate before the
   * card and after it and requires the two to match to within two pixels, and
   * an offer that disappears because the reader opened something else and
   * closed it again fails that — the map came back 22px TALLER than it went
   * away, which is a budget change the reader did not ask for and cannot undo.
   * It is also just wrong behaviour: a standing offer the reader has neither
   * taken nor answered should still be standing. So it is restored, once, on
   * the same terms it was made — off the path, nothing due, belief still
   * unargued — and it is not a second offer, so it does not touch the
   * ninety-second cooldown.
   */
  _restoreBeliefSay() {
    if (!this.saidBelief || this.open) return;
    const st = this.ctx.store.getState();
    if (st.activeTour || st.playing || this.sweeping) return;
    if (this.sched.due(this.items, 1).length) return;
    const b = this._unmetBelief(null);
    if (!b || b.mid !== this.saidBelief) { this.saidBelief = null; return; }
    this._saySized({
      id: 'quiz:due',
      priority: 50,
      mark: 'Argue with it',
      cta: { label: 'Ask me', emit: 'quiz:openBelief' },
    }, this._beliefForms(b.belief));
  },

  _clearCheckpointSay() {
    if (!this.saidCheckpoint) return;
    this.saidCheckpoint = false;
    this.ctx.bus.emit('ask:say', { id: 'quiz:checkpoint', text: null });
  },

  /* ================================================================= flow */

  _openOnReturn() {
    if (this.onReturnRun || this.open) return;
    this.onReturnRun = true;
    if (!this.sched.isReturn()) { this._refreshControl(); return; }
    const q = this.sched.due(this.items, 3);
    if (!q.length) { this._refreshControl(); return; }
    this.returnRun = q.map((i) => i.id);
    this.queue = q.slice(1);
    this.openItem(q[0], { onReturn: true, intro: q.length });
  },

  openNext() {
    const q = this.sched.queue(this.items, 3);
    if (!q.length) { this._openDone(); return; }
    this.queue = q.slice(1);
    this.openItem(q[0], {});
  },

  /**
   * WHERE AN AUTONOMOUS CHECKPOINT PUTS ITSELF, AND WHY IT IS NOT THE RAIL.
   *
   * ROUND 2 OF WAVE 9, the phone critic, as the material gap: "Lesson Two
   * loses 3 of 9 beats to checkpoints — the walked unit teaches 12 of 20,
   * floor is 14." Reproduced at 390x844 and again at 1366x768: on steps 5, 8
   * and 9 of `lesson-two` the sheet held "What a border explains", "Who did
   * this" and "The famine on the railway" and `.tr-panel` was absent, so
   * `two-track` (T15), `exits` (T18, and T14 in the figure inside it) and
   * `fourteen` (T20) were never on screen at all — and the tour's own Next
   * advanced out of the checkpoint, so pressing Next through the lesson
   * skipped three of its eight payload beats. A number that counts a beat the
   * student never sees is the exact class of defect wave 9 was created to end.
   *
   * A checkpoint is a FLOOR under retrieval, not a competing surface. So it
   * takes the place §8.1 gives it — after the beat's prose, inside the beat's
   * own scroller, where `more of this beat ↓` pages to it — and the beat
   * renders, keeps its title, its map state and its foot, and is counted
   * honestly. If no beat panel is standing (a band-only beat, a route not
   * running, a build without P05) it falls back to the rail, which is what it
   * always did.
   *
   * Returns the node to append into, or null.
   */
  _inlineHost() {
    try {
      const flow = document.querySelector('.tr-panel .tr-panel__flow');
      if (!flow || !flow.isConnected) return null;
      const r = flow.getBoundingClientRect();
      return (r.width > 0 && r.height > 0) ? flow : null;
    } catch (_) { return null; }
  },

  openItem(item, opts = {}) {
    this.current = item;
    this.opts = opts;
    this.onReturn = !!opts.onReturn;
    this.answered = false;
    this.response = null;
    this._clearSay();
    const node = this._render(item, opts);
    this.open = true;
    if (opts.inline) {
      /* The beat keeps the rail. Ours is a block at the foot of its prose,
         marked as one, and it goes when the beat does. The sheet's head is
         not ours to write here, so the two lines it would have carried — what
         this is, and what it is asking — are drawn into the block itself. */
      this.inlineAt = opts.inline;
      node.classList.add('qz--inline');
      node.prepend(el('p.qz__inhead',
        el('span.qz__ineyebrow', { text: this._eyebrow(opts) }),
        el('span.qz__intitle', { text: this._titleFor(item, opts) })));
      /* BEFORE the prose, not after it, and that is the authoring's own
         instruction: every moment's lede says "before you read on", "answer it
         before the lesson gets there", "out of your head, page shut". A
         question at the foot of a beat is a question most readers press Next
         past, and the retrieval floor §8.1 rests on would go with it. So the
         reader lands on the question, and the beat's prose is directly under
         it, in the same window, one press of `more of this beat ↓` away. */
      opts.inline.prepend(node);
    } else {
      this.inlineAt = null;
      this.ctx.bus.emit('ask:sheet', {
        id: 'quiz:recall',
        eyebrow: this._eyebrow(opts),
        title: this._titleFor(item, opts),
        node,
      });
    }
    this.ctx.bus.emit('quiz:asked', { id: item.id, t: item.t });
    this._refreshControl();
    this._pin();
    setTimeout(() => {
      if (item.kind === 'map') return;   // the answer is on the map, not in here
      const f = node.querySelector('input,textarea,.qz-order__i');
      if (f) try { f.focus({ preventScroll: true }); } catch (_) { f.focus(); }
    }, 60);
  },

  /**
   * PIN THE CONTROL ROW WHEN, AND ONLY WHEN, THE CARD OVERFLOWS ITS SHEET.
   *
   * `position: sticky; bottom: 0` does not mean "stick if you would otherwise
   * be off screen"; it means "never be lower than this line", and on a card
   * that already fits it pushes the row DOWN to the foot of a 700px sheet,
   * six inches below the question it belongs to. So the pin is a state, set
   * from the one measurement that answers the question — does the sheet's own
   * scrollport overflow — and re-taken whenever the card or the sheet changes
   * size. A ResizeObserver, not a breakpoint: the same card overflows at
   * 390x844 and does not at 1440x900, and it starts overflowing at 1440x900
   * the moment the correction is revealed under it.
   */
  _pin() {
    const node = this.node;
    if (!node || !node.isConnected) return;
    /* An inline block scrolls with the beat's prose; a sticky foot inside a
       reading window is a second foot under the beat's own. */
    if (this.inlineAt) return;
    const sc = node.closest('.cx-sheet__body') || node.parentElement;
    if (!sc) return;
    const take = () => {
      if (!node.isConnected) return;
      const over = sc.scrollHeight - sc.clientHeight > 2;
      if (over) node.dataset.pin = 'yes'; else delete node.dataset.pin;
    };
    take();
    requestAnimationFrame(take);
    if (this._pinRo) this._pinRo.disconnect();
    if (window.ResizeObserver) {
      this._pinRo = new ResizeObserver(take);
      this._pinRo.observe(sc);
      this._pinRo.observe(node);
      this.d(() => { if (this._pinRo) this._pinRo.disconnect(); });
    }
  },

  /**
   * The sheet's eyebrow. "ASKED AGAIN · FROM EARLIER IN THIS LESSON" is the
   * sentence that makes the spacing legible, and it stays wherever there is a
   * column to print it in. In the sheet band it is not free: measured at
   * 390x844 the long form wrapped to two lines, squeezed the title into a
   * three-line stack beside it, and took 200px of a 332px sheet before the
   * question began. So the band gets the short form. The shell publishes the
   * band on `#app[data-rail]`; nothing here re-derives it from a width.
   */
  _eyebrow(opts) {
    const app = document.getElementById('app');
    const narrow = !!(app && app.dataset.rail === 'sheet');
    if (opts.belief) return narrow ? 'argue with it' : 'argue with it \u00b7 commit first, evidence after';
    if (opts.checkpoint) {
      /* "FROM EARLIER" IS A CLAIM, NOT DECORATION. It is true of a second
         encounter and false of a first, and until round 6 round 2 it printed
         over both — including at `egypt`, one step before the T13 beat. The
         card now knows which it is (`checkpoint.js` `onScreenT`) and says the
         other thing when the other thing is what is happening. */
      return 'checkpoint ' + opts.checkpoint.n + ' of ' + (opts.checkpoint.total || this.cpTotal || CP_TOTAL)
        + (narrow ? '' : (opts.checkpoint.pre ? ' \u00b7 first look' : ' \u00b7 from earlier'));
    }
    if (opts.placed) {
      if (opts.placed.pre) return narrow ? 'guess first' : 'guess first \u00b7 before the lesson gets there';
      return narrow ? 'asked again' : 'asked again \u00b7 from earlier in this lesson';
    }
    return 'Recall';
  },

  /** " · one of 4", " · 4 to put in order". Never a mark, never a total. */
  _count(item) {
    if (item.kind === 'choose' || item.kind === 'who') {
      const n = (item.options || []).length;
      /* Not "one of 4 answers below": measured at 390x844 that wrapped the
         eyebrow to a second line and cost more room than the words bought. */
      return n > 1 ? ' \u00b7 one of ' + n + ' answers' : '';
    }
    if (item.kind === 'order' || item.kind === 'match') {
      const n = ((item.left ? item.right : item.options) || []).length;
      return n > 1 ? ' \u00b7 ' + n + ' to put in order' : '';
    }
    return '';
  },

  _titleFor(item, opts) {
    if (opts.belief) return item.subject || 'One belief, one question';
    if (opts.checkpoint || opts.placed) {
      const pre = (opts.checkpoint && opts.checkpoint.pre) || (opts.placed && opts.placed.pre);
      return item.subject || (pre ? 'Before the lesson gets there' : 'From earlier in this lesson');
    }
    if (opts.onReturn) return 'Where we left off';
    const r = this.sched.record(item);
    if (r) return 'Asked again';
    return 'One question';
  },

  close() {
    const wasCheckpoint = !!(this.opts && this.opts.checkpoint);
    /* AN INLINE BLOCK DOES NOT OWN THE SHEET, SO CLOSING IT MUST NOT CLOSE ONE.
       The beat is the surface; ours is a block inside its reading window, and
       "Skip — it stays unanswered" takes the block away and leaves the reader
       where they are. `_forget()` removes the node; there is no rail to give
       back and no beat to re-open, because the beat never left. */
    if (this.inlineAt) { this._forget(); this._restoreBeliefSay(); return; }
    this._forget();
    this.ctx.bus.emit('ask:sheet', null);
    this._restoreBeliefSay();
    if (wasCheckpoint) { this._backToBeat(); return; }
    /* Pressed R in the middle of a beat and then closed it: give the beat's
       panel back rather than leaving the rail empty in the middle of a lesson.
       If the current step is a recall step there is no panel behind ours and
       `tours:panel` correctly does nothing. */
    if (this.ctx.store.getState().activeTour) this.ctx.bus.emit('tours:panel', {});
  },

  /**
   * A checkpoint borrowed the rail from a beat. However it ends — answered,
   * skipped, or closed with the sheet's own × — the beat comes back. An empty
   * rail in the middle of a lesson is a lesson the student has lost their place
   * in, and losing your place is the one thing the guided path exists to stop.
   */
  _backToBeat() {
    const host = this.cpHost;
    this.cpHost = null;
    if (this.opts) this.opts = {};
    /* The correction may have taken the map to the evidence, and it wrote its
       own sentence into the band while it did. Both have to be handed back, or
       the reader returns to a beat whose sentence says 1816 over a map showing
       1780 — one screen asserting two years, which is the exact defect this
       app spends its whole argument attacking. `tours:goBeat` re-applies the
       beat's year, selection, definition, projection, camera, sentence and
       panel in one batch, which `tours:panel` alone does not. */
    this._clearCheckpointSay();
    const st = this.ctx.store.getState();
    if (!st.activeTour || !host || this.lastBeatId !== host) { this.ctx.bus.emit('ask:sheet', null); return; }
    this.ctx.bus.emit('ask:sheet', null);
    this.ctx.bus.emit('tours:goBeat', { id: host });
  },

  _forget() {
    this._clearCheckpointSay();
    if (this._pinRo) { this._pinRo.disconnect(); this._pinRo = null; }
    if (this.inlineAt) { try { if (this.node) this.node.remove(); } catch (_) { /* gone */ } }
    this.inlineAt = null;
    this.open = false;
    this.current = null;
    if (this.painted) { this.ctx.bus.emit('ask:paintUnits', { unitIds: [] }); this.painted = false; }
    this._refreshControl();
  },

  /**
   * Nothing is due. This is not a results page — there is no total here and
   * no mark. It is the schedule, made visible: what comes back, and when, and
   * why the gaps get longer. A student who can see the spacing understands why
   * they are being asked again.
   */
  _openDone() {
    const now = Date.now();
    const node = el('div.qz');
    node.append(el('p.qz__lede',
      'Nothing is due. Everything you have produced correctly comes back later — tomorrow, then in three days, then in a week — because a thing you can still say after a gap is a thing you have actually learned.'));

    const met = this.items.filter((i) => this.sched.record(i));
    const rows = met.slice().sort((a, b) => this.sched.record(a).dueAt - this.sched.record(b).dueAt);
    if (rows.length) {
      const list = el('ul.qz-sched');
      for (const it of rows.slice(0, 12)) {
        const r = this.sched.record(it);
        const when = r.dueAt <= now ? 'now' : ago(r.dueAt - now).replace(' ago', '');
        list.append(el('li.qz-sched__r',
          el('button.qz-sched__s', { type: 'button', onclick: () => { this.queue = []; this.openItem(it, {}); } }, it.subject || it.question),
          el('span.qz-sched__w', r.lastRight === false ? 'you missed this — back in ' + when : 'back in ' + when)));
      }
      node.append(el('p.cx-panel__head', 'Coming back'), list);
    }

    const notMet = this.items.filter((i) => !this.sched.record(i));
    if (notMet.length) {
      const grid = el('div.qz__grid');
      for (const it of notMet.slice(0, 16)) {
        grid.append(el('button.qz-chip', { type: 'button', onclick: () => { this.queue = []; this.openItem(it, {}); } },
          it.subject || it.id));
      }
      node.append(el('p.cx-panel__head', 'Never asked you this'), grid);
    }

    /* The eighteen, as a state rather than a claim. DIDACTIC_SPEC §4 is the
       part of this app that changes what a student believes rather than what
       they can recite, so "which of them has this student actually argued
       with" is the one piece of progress worth showing — and it is shown as
       what is LEFT, in the belief's own words, never as a count out of
       eighteen. There is no score here and this is not one. */
    const openM = unmetM(this.items, (i) => this.sched.record(i));
    const reachable = openM.filter((m) => this.items.some((i) => tagsOf(i).includes(m) && !this.sched.record(i)));
    if (reachable.length) {
      const grid = el('div.qz-beliefs');
      for (const m of reachable.slice(0, 6)) {
        const b = belief(m);
        const target = this.items.find((i) => i.misconception === m && !this.sched.record(i))
          || this.items.find((i) => tagsOf(i).includes(m) && !this.sched.record(i));
        grid.append(this._beliefControl({ belief: b }, 'argue with it', () => { this.queue = []; this.openItem(target, { belief: b }); }));
      }
      node.append(el('p.cx-panel__head', 'Things people believe that this atlas can argue with'), grid);
    }

    node.append(this._forgetRow());
    this.open = true;
    this.ctx.bus.emit('ask:sheet', { id: 'quiz:recall', eyebrow: 'Recall', title: 'Nothing due', node });
    this._refreshControl();
  },

  _forgetRow() {
    return el('p.qz__forget',
      el('button.cx-more', {
        type: 'button',
        onclick: () => {
          this.sched.forget();
          announce('Cleared. This app now remembers nothing about you.');
          this._refreshControl();
          this._openDone();
        },
      }, 'Clear what this app remembers about me'),
      el('span.cx-note', ' — it is kept in this browser only, and never sent anywhere.'),
    );
  },

  /* ====================================================== on the path ==== */

  /**
   * A retrieval the PATH placed (P05's `recall` steps). Three things happen
   * here that a hard-coded id cannot do on its own:
   *
   *  1. The path stops being able to ask a question this student has already
   *     answered. If the named item went in ten minutes ago, we substitute the
   *     highest-priority thing they actually missed and print why.
   *  2. The autonomous hosts in `checkpoint.js` stand down for the session.
   *     The path is doing the placing; two schedulers on one lesson is noise.
   *  3. The card carries the same "why this one, for you" line as a fallback
   *     checkpoint, so the student always knows what a re-ask is for.
   */
  _askPlaced(p) {
    this.pathPlacesRetrieval = true;
    /* Whatever a fallback checkpoint had borrowed, the path has taken the rail
       back for its own step. There is no beat left for us to hand over. */
    this.cpHost = null;
    const want = p && p.id ? this.items.find((x) => x.id === p.id) : null;
    const byT = !want && p && p.t ? this.items.find((x) => x.t === p.t) : null;
    let item = want || byT;
    let reason = null;
    let substituted = false;

    const spent = item && this.sched.answeredThisSession && this.sched.answeredThisSession.has(item.id);
    if (!item || spent) {
      const alt = pickCheckpoint(this.items, {
        seen: this.seen,
        sched: this.sched,
        ledger: this.ledger,
        used: this.cpUsed,
        usedT: this.cpUsedT,
        losDone: this.losDone,
        repaired: this.repaired,
        onScreen: this._onScreen(),
        now: Date.now(),
      });
      if (alt) {
        substituted = true;
        reason = spent
          ? 'You produced that one already in this session, so the lesson has swapped it. ' + alt.reason
          : alt.reason;
        item = alt.item;
      }
    }
    if (!item) return;   /* P05 prints its own "not available" card */
    /* A recall step the PATH places can land on something the route has not
       shown yet just as easily as a fallback moment can — `core`'s own
       `recallAfter` on `compensation` asks for T3, whose figure is mounted on
       `barbados` and skipped by anyone who presses Next past it. Same test,
       same words, one predicate. */
    const pre = this._isPretest(item);
    if (!reason) {
      const r = this.sched.record(item);
      reason = r
        ? 'You met this earlier in the lesson. Say it again from memory — the gap between the two is what makes it stick.'
        : pre
          ? 'You have not met this one yet. Guess before the lesson gets there — committing to a wrong answer and being corrected is what makes the right one stick.'
          /* Three of the twenty are met as a figure mounted inside a beat, and
             a guess committed there IS a production. Saying "never once asked
             you to produce it" over a number the reader put in themselves ten
             minutes ago is the same small untruth this card was rebuilt to
             stop; `vizT` is the record of it and is already read by
             `_onScreen`. */
          : this.vizT.has(item.t)
            ? 'You put a number on this earlier, on the chart inside the beat. Say it again from memory — the gap between the two is what makes it stick.'
            : 'The lesson has taught this and never once asked you to produce it. Guess before you look; being wrong here is the cheapest thing in this app.';
    }

    this.cpUsed.add(item.id);
    if (item.t) this.cpUsedT.add(item.t);
    this.cpDone += 1;
    this.cpAsked.push({ n: this.cpDone, beat: (p && p.beatId) || null, item: item.id, t: item.t || null, band: null, pre, placed: true, substituted });
    this.queue = [];
    this._clearSay();
    this.openItem(item, { placed: { beatId: (p && p.beatId) || null, reason, substituted, pre } });
  },

  /* ====================================================== misconceptions == */

  /**
   * THE DEFECT THIS FIXES. DIDACTIC_SPEC §4 lists eighteen wrong models and
   * says each one "owns a specific interaction. Not a paragraph. An
   * interaction." Four of them — M7 (railways as development), M11 (empire
   * made ordinary Britons rich), M12 (nobody thought it was wrong at the time)
   * and M15, the rubric's own named example of a SYMPATHETIC oversimplification
   * — were tagged nowhere in this application at all. They now have five
   * commit-then-correct items between them, resolved out of the live atlas.
   *
   * WHERE A STUDENT MEETS THEM, and why here and not somewhere new. P05 owns
   * WHERE retrieval sits on the path and this module does not compete with it
   * (see `_askPlaced`), so there is no fifth surface here and no new beat. What
   * there is instead is one honest offer in three places this module already
   * owns, each of them a place the student is already looking:
   *
   *   1. under the correction of a retrieval the path placed, when nothing is
   *      due and nothing is owed — which on a brisk first run is every time,
   *      and where the row was previously empty;
   *   2. as the tie-break inside a fallback checkpoint (`checkpoint.js`), for
   *      the eight-minute variant and for anyone who deep-links into the middle;
   *   3. as the off-path offer in the lede band, when the schedule has nothing.
   *
   * The offer always names the BELIEF, never the topic, because the belief is
   * the thing that has to be activated before it can be displaced, and a
   * student who reads their own opinion in someone else's sentence will open
   * the card to argue with it.
   */
  _unmetBelief(excludeId) {
    const open = new Set(unmetM(this.items, (it) => this.sched.record(it)));
    if (!open.size) return null;
    const cands = this.items.filter((it) =>
      it.id !== excludeId
      && !this.sched.record(it)
      && !(this.sched.answeredThisSession && this.sched.answeredThisSession.has(it.id))
      && tagsOf(it).some((m) => open.has(m)));
    if (!cands.length) return null;
    /* Ordered by §4's own debt (misconceptions.js): the belief §4 calls a
       SYMPATHETIC oversimplification first, then a belief §4 does not assign to
       the guided path — an item that only glances at a belief is never a
       treatment of it and sorts below both — then the earliest thing in the
       lesson, then the id, so the choice is deterministic and testable.

       ROUND 3. `minutes` used to be the second key, and `minutes` is an item's
       position in the lesson, so this control offered the earliest unmet belief
       every single time: walking the 24-step route, the sentence quoted back at
       the student under the first two corrections was M4's, at minute 3, both
       times, and M15 at minute 19 was structurally unreachable here.

       `open` is what is still standing; `debt` wants the other side of it. */
    const repaired = new Set(M_IDS.filter((m) => !open.has(m)));
    cands.sort((a, b) =>
      (mDebt(a, repaired) - mDebt(b, repaired))
      || ((a.minutes || 99) - (b.minutes || 99))
      || (a.id < b.id ? -1 : 1));
    const it = cands[0];
    const mid = open.has(it.misconception) ? it.misconception : tagsOf(it).find((m) => open.has(m));
    return { item: it, mid, belief: belief(mid) };
  },

  /**
   * The control. Two parts, always: a small label saying what it costs, and
   * the belief itself in the serif every claim in this app is set in — because
   * a reader has to be able to recognise their own opinion in it. It is NOT a
   * button with a twenty-word label: measured at 390×844, that ran three lines
   * out of a pinned control row and printed over the correction behind it.
   * Two lines, clamped, and the same object in all three places it appears.
   */
  _beliefControl(b, lead, onclick) {
    return el('button.qz-belief', { type: 'button', onclick },
      el('span.qz-belief__a', lead),
      el('span.qz-belief__q', '\u201c' + b.belief + '\u201d'));
  },

  /** The one line that offers it. Same sentence everywhere it appears. */
  _beliefReason(b) {
    return 'Plenty of people your age would say: “' + b
      + '” This one goes straight at that. Commit to an answer before you look — being wrong here is the cheapest thing in this app.';
  },

  /* ============================================================ checkpoint */

  /**
   * THE ROUTE, TAKEN OVER THE BUS.
   *
   * ROUND 6, W4. `core` — the default thirty-minute route — ships with
   * `recalls: false`, so the path places no retrieval of its own and this
   * module's four fallback moments ARE the whole of the spacing plan on the
   * route almost every student walks. Measured on the build this note was
   * written against, walking `core` end to end pressing nothing but Next
   * produced TWO retrievals, at minutes 15.5 and 31.6, and printed "checkpoint
   * 1 of 4" and "2 of 4" at the student: two of the four hosts were beats
   * `core` does not carry, and one of them (`amritsar`) is a beat NO route
   * carries and never has.
   *
   * `tours:ready` already publishes the flattened step index for every route —
   * a frozen contract, `{ routes: { id: { steps: [{kind, id, optional}] } } }`
   * — so the plan is resolved against the route the student is on without this
   * module reading tours.json or re-deriving another piece's arithmetic. That
   * is also why this is a listener and not a fetch: the path owns the route and
   * publishes it; we consume it.
   *
   * Two things come out of it. The moments resolve to beats that actually
   * arrive, so `core` gains a third at minute 24.2 — inside DIDACTIC_SPEC
   * §8.1's "after minute 22" window, which `core` previously reached exactly
   * once. And the total the card prints is the number of moments THIS route
   * resolves, so a student is never told a checkpoint is coming that their
   * route cannot deliver.
   */
  _routePlan(p) {
    const idx = p && p.stepIndex;
    const routes = idx && idx.routes;
    if (!routes) return;
    const beatsOf = (r) => (r && Array.isArray(r.steps) ? r.steps : [])
      .filter((x) => x.kind === 'beat' && !x.optional && x.id).map((x) => x.id);
    /* EVERY route is planned, not only the one running, because a reader may
       change route mid-session from the route card and `_switchVariant` rebuilds
       the run in place without re-publishing `tours:ready`. `_useRoute` then
       has the answer already and does not have to ask for it. */
    const all = {};
    this.routePlans = {};
    for (const id of Object.keys(routes)) {
      const beats = beatsOf(routes[id]);
      all[id] = beats;
      this.routePlans[id] = {
        beats,
        hosts: planHosts(beats),
        placesRecalls: (routes[id].steps || []).some((x) => x.kind === 'recall'),
      };
    }
    /* The audit that would have caught `amritsar`. It is read by the debug API
       and by the P10 scenario rather than written to the console, because a
       console error is a defect this app does not ship. */
    this.hostAudit = auditHosts(all);
    this._useRoute(p.variant);
  },

  /** Adopt one route's plan. The total never drops below what has already been
   *  asked: a card that said "3 of 4" must not be followed by "4 of 3". */
  _useRoute(id) {
    const plan = this.routePlans && this.routePlans[id];
    if (!plan || !plan.hosts.length) return;
    this.routeId = id;
    this.routeBeats = plan.beats;
    this.routePlacesRecalls = plan.placesRecalls;
    this.hosts = plan.hosts;
    this.cpTotal = Math.max(plan.hosts.length, this.cpDone || 0);
    /* THE FLOOR'S OWN PRICE, PUBLISHED FOR WHOEVER COSTS THE ROUTE.
       tours.json's cost model prices a beat that asks a student to retrieve at
       60 seconds and it is the only place a route's length is computed — but
       it cannot see these moments, because they are not steps. Four of them on
       `core` is four minutes of a student's lesson that the advertised number
       does not contain. So the number is published rather than asserted here,
       in that model's own unit, and the piece that owns the arithmetic can add
       it. Nothing listens today; a number nobody can read is exactly how the
       advertised minutes came to be wrong in the first place. */
    this.ctx.bus.emit('quiz:retrieval', {
      route: id,
      hosts: plan.hosts.map((h) => h.beat),
      moments: plan.hosts.length,
      placesOwn: plan.placesRecalls,
      cost_s: plan.hosts.length * 60,
    });
  },

  /**
   * DIDACTIC_SPEC §8.1: "Every T-item introduced before minute 16 is retrieved
   * again after minute 22." The T-numbers the route taught in its FIRST HALF —
   * which on `core` is exactly the six beats that end at minute 15.5, and on
   * the full path the eight that end before the Egypt beat. Position, not the
   * clock, because a route's own beats are the only honest measure of where
   * "minute 16" falls on a route whose length the student sets by reading
   * speed, and because a scripted walk collapses wall-clock to seconds.
   *
   * Handed to `pick()` only on the moments that sit after the first one, where
   * the §8.1 window actually is. It sorts below the band, so an item this
   * student personally got wrong still outranks it.
   */
  _earlyT() {
    const beats = this.routeBeats || [];
    if (!beats.length) return null;
    const half = new Set(beats.slice(0, Math.ceil(beats.length / 2)));
    const out = new Set();
    /* The beats' OWN T-numbers, not `taughtT`'s chapter expansion. What §8.1
       protects is what the lesson INTRODUCED before minute 16, and a beat
       introduces the one T-number it carries; expanding by chapter would make
       almost the whole twenty "early" on any route and the key would decide
       nothing. */
    for (const b of this.seen) if (half.has(b.id) && b.t) out.add(b.t);
    return out.size ? out : null;
  },

  /**
   * THE GAP, PRINTED. Spacing that the student cannot see is spacing they
   * cannot learn from, and until this round a retrieval ON the path — the one
   * place the whole §8.1 claim is made — printed no interval at all: the
   * "you met this fifteen minutes ago" line existed only on the off-path card.
   * So the card says how long ago, from this student's own session: the record
   * if they have produced it before, otherwise the moment the lesson put the
   * thing in front of them, which is `seen` and is the same source
   * `checkpoint.js` computes eligibility from.
   */
  _gapSay(item) {
    if (!item) return null;
    const now = Date.now();
    const r = this.sched.record(item);
    if (r && r.lastAt) {
      return (r.lastRight === false ? 'You got this wrong ' : 'You produced this ') + ago(now - r.lastAt) + '.';
    }
    /* ROUND 6 ROUND 2 — THE SENTENCE THAT WAS NOT TRUE.
       This used to accept a beat as carrying the item when the item's T-number
       was anywhere in `CHAPTER_T[b.chapter]`, which is DIDACTIC_SPEC §8's table
       of what a CHAPTER covers, not of what a beat put on the glass. Measured
       on `core`: checkpoint 1 fires at `egypt` (chapter `imperial`, T12) and
       asked `m15-borders` (T13) — whose beat, `scramble`, is the NEXT step —
       under "The lesson put this in front of you a minute ago"; checkpoint 2
       asked `t16-bengal-1943` (T16), which no beat on this route carries at
       all. A cold `#tour=core&step=9` printed the same line with two beats
       seen. An interval is a measurement, and a measurement of something that
       never happened is the one thing this app may not print.
       A beat carries the one T-number it publishes. Nothing else. When the
       thing has not been on screen there is no interval to print, and
       `_preSay` says so instead. */
    /* A `who` item's encounter is the person, not the T-number — see
       `_fireCheckpoint`. A beat that carried T18 named its own people; it did
       not name this atlas's whole roster, and an interval is a measurement of
       something that happened. */
    if (item.kind !== 'who') {
      for (const b of this.seen) {
        if (!b.at || !b.t || b.t !== item.t) continue;
        return 'The lesson put this in front of you ' + ago(now - b.at) + '.';
      }
    }
    /* Three of the twenty are carried by an ON_PATH figure rather than by a
       beat's own record, so for those the interval is the moment the student
       committed the figure's guess. Without this, a card that has just said
       "asked again \u2014 from earlier in this lesson" would print no interval
       at all, which is the same silence the round-3 critic named. */
    const v = this.vizT.get(item.t);
    if (v) return 'You committed a guess on this ' + ago(now - v) + '.';
    return null;
  },

  /** The other half of `_gapSay`: what an honest card says when there is no
   *  gap because there was no first encounter. Kept as short as the interval
   *  line it replaces, and it never apologises for the question — a guess
   *  before teaching is a move §8.1 asks for five times, it just is not a
   *  second encounter and must not be dressed as one. */
  _preSay() {
    return 'This has not been on screen yet \u2014 answer it as a guess.';
  },

  /** Is this item a first encounter for this student? The card's whole frame
   *  hangs off it, and it is `checkpoint.js`'s own predicate rather than a
   *  second copy of it, so the words and the pick cannot drift apart. */
  _isPretest(item) {
    if (!item || !item.t) return false;
    if (item.kind === 'who') return !this.sched.record(item);
    return !this._onScreen().has(item.t);
  },

  /** Everything this student has actually met, from all three sources. */
  _onScreen() {
    const out = onScreenT(this.seen, this.sched, this.items);
    for (const t of this.vizT.keys()) out.add(t);
    return out;
  },

  /**
   * One beat has arrived. Two jobs: remember it, so eligibility is computed
   * from what the lesson has actually shown this student; and, if it is one of
   * the four hosts, take the rail for one question.
   *
   * Guards, in order, because every one of them is a way this could go wrong
   * in front of a class: not while exploring off the path, not on a gate (a
   * gate is already a commitment), not twice for the same host even if the
   * reader presses Back and Next again, not while the sweep is playing, and
   * never if nothing eligible and honestly spaced exists — in which case the
   * beat simply renders and the student never knows a checkpoint was due.
   */
  _onBeat(p) {
    if (!p || !p.id) return;
    /* An inline block lives inside the beat's own scroller and dies with it.
       Reap the flag before anything reads `this.open`, or one checkpoint's
       block leaving the DOM would silence every later one. */
    if (this.inlineAt && !this.inlineAt.isConnected) this._forget();
    /* Ours is the loudest sentence in the band while a correction is on screen
       (priority 66, above a beat's 65). It has to die the instant the path
       moves, or the next beat gets read under the last question's caption. */
    this._clearCheckpointSay();
    if (p.gate) return;
    if (p.exploring) return;

    /* A READER WHO CHANGES ROUTE MID-SESSION. `tours:setRoute` rebuilds the run
       in place and does not re-publish `tours:ready`, so the plan is adopted
       here instead, off the store, before the host lookup that uses it. */
    const now = this.ctx.store.getState().activeTour;
    if (now && now !== this.routeId) this._useRoute(now);

    this.lastBeatId = p.id;
    /* A recall step is not a beat: it teaches nothing new, so it must not
       widen what this student counts as having been taught. */
    if (p.recall) return;
    if (!this.seen.some((b) => b.id === p.id)) {
      this.seen.push({ id: p.id, t: p.t || null, chapter: p.chapter || null, at: Date.now() });
    }

    const hostIx = (this.hosts || HOSTS).findIndex((h) => h.beat === p.id);
    const host = hostIx >= 0 ? this.hosts[hostIx] : null;
    if (!host || this.cpFired.has(host.beat)) return;
    /**
     * A FLOOR, NOT A COMPETING SCHEDULER.
     *
     * This used to read `if (this.pathPlacesRetrieval) return;` — the moment
     * the path placed one retrieval of its own, all four hosts stood down for
     * the session. That was right about ownership and wrong about arithmetic:
     * it assumed a path that places one places all four. Measured on the build
     * this note was written against, the thirty-minute path emitted three
     * `quiz:ask` events and not four — `tours.json` carries `recallAfter` on
     * the `princely` beat and that step was not reached — so a student pressing
     * Next produced three things before the Close and the fallback, watching
     * one placement go by, silently disabled itself for the other three.
     *
     * The rule now compares like with like. Each host stands down only when
     * the lesson has ALREADY produced at least as many retrievals as there are
     * hosts up to and including it: the first host wants one to have happened,
     * the second two, the fourth four. A path doing its own job passes every
     * one of them in silence, which is the intent of P05 owning the placement;
     * a path that quietly drops one is topped up at the next host, and the
     * claim this module actually has to keep — four productions before the
     * Close — stops depending on another piece's step list.
     */
    if (this.pathPlacesRetrieval && this.cpDone > hostIx) return;
    if (this.sweeping) return;

    /* One frame after the beat, so the beat's own `ask:sheet` has landed and
       ours replaces it rather than racing it. Below 62rem the tour drops the
       sheet for a reading beat and puts a CTA in the band; ours is a question,
       so it takes the rail there too, exactly as an asking beat does. */
    clearTimeout(this.cpT);
    this.cpT = setTimeout(() => this._fireCheckpoint(host), 320);
  },

  _fireCheckpoint(host) {
    if (this.cpFired.has(host.beat)) return;
    const st = this.ctx.store.getState();
    if (!st.activeTour) return;
    if (st.panelState && st.panelState.overlay) return;
    if (this.open) return;

    /* A RETRIEVAL MAY NOT STAND ON THE BEAT THAT TEACHES IT.
     *
     * `flatten` in tours/budget.js already applies this rule to the path's own
     * recall steps — "the beat it stands behind is the beat that teaches T14,
     * there is no gap to space across" — and this scheduler did not. Measured
     * on `lesson-two`, walked cold: the moment hosted on `exits` (the beat
     * that carries T18) asked "Who did this? … Tacky" under "Past twenty
     * minutes. What you met before minute sixteen is due back now" and "The
     * lesson put this in front of you a minute ago". Tacky is taught by
     * `resistance`, on the OTHER lesson; what had put T18 "in front of you a
     * minute ago" was the host beat itself, arriving one frame earlier.
     *
     * So the host beat is not part of what counts as earlier. Everything the
     * pick and the card's own interval line read — `seen`, `onScreen` — is the
     * run up to but not including the beat this question is standing on. */
    const before = this.seen.filter((b) => b.id !== host.beat);
    const onScreenBefore = this._onScreen();
    for (const b of this.seen) if (b.id === host.beat && b.t) onScreenBefore.delete(b.t);
    const chosen = pickCheckpoint(this.items, {
      seen: before,
      sched: this.sched,
      ledger: this.ledger,
      used: this.cpUsed,
      usedT: this.cpUsedT,
      losDone: this.losDone,
      repaired: this.repaired,
      preferEarlyT: host.late ? this._earlyT() : null,
      onScreen: onScreenBefore,
      now: Date.now(),
    });
    if (!chosen) return;

    this.cpFired.add(host.beat);
    this.cpUsed.add(chosen.item.id);
    if (chosen.item.t) this.cpUsedT.add(chosen.item.t);
    this.cpHost = host.beat;
    this.cpDone += 1;
    this.queue = [];
    this._clearSay();
    /* Numbered by what has actually happened. A host that finds nothing
       honestly spaced stands down in silence, and the next one must not then
       call itself the third of four when it is the second thing asked. */
    const n = this.cpDone;
    /* One boolean decides the eyebrow, the title, the lede and the interval
       line, and it comes from the pick rather than from a second test here.
       A moment's lede is positional prose ("Two chapters behind you", "Past
       twenty minutes") and stays true either way; what it may not do is also
       claim a second encounter that did not happen, which is why each moment
       carries two of them. */
    /* AND ONE ITEM WHOSE ENCOUNTER IS NOT ITS T-NUMBER.
       A `who` item asks for a PERSON. T18 is "anticolonial politics was
       organised and named", and a beat carrying T18 has put its own roster on
       screen, not this atlas's whole roster — so warranting the person against
       the T-number let `lesson-two`'s last moment ask for Tacky, who is taught
       by `resistance` on the OTHER lesson, under "what you met before minute
       sixteen is due back now". The schedule's own record of THIS item is the
       only thing that can say the person has been met. */
    const forcedPre = chosen.item.kind === 'who' && !this.sched.record(chosen.item);
    const pre = !!chosen.pretest || forcedPre;
    const reason = forcedPre && !chosen.pretest
      ? 'This lesson has named other people, not this one. Guess, then meet them — a name you '
        + 'guessed wrong at is a name you keep.'
      : chosen.reason;
    this.cpAsked.push({ n: this.cpDone, beat: host.beat, item: chosen.item.id, t: chosen.item.t || null, band: chosen.band, pre });
    this.openItem(chosen.item, {
      checkpoint: { n, total: this.cpTotal, beat: host.beat, pre,
        lede: (pre && host.ledePre) || host.lede, reason, band: chosen.band },
      /* AFTER THE BEAT'S PROSE, INSIDE THE BEAT'S OWN READING WINDOW — NOT
         INSTEAD OF IT. See `_inlineHost`. */
      inline: this._inlineHost(),
    });
    announce('Checkpoint ' + n + ' of ' + this.cpTotal + '. '
      + (pre ? 'One question the lesson has not reached yet — guess it, then read on.'
             : 'One question from earlier in this lesson, then read on.')
      + ' It is at the head of this beat, and the beat is under it.');
  },

  /* =============================================================== render */

  _render(item, opts) {
    const wrap = el('div.qz');
    this.node = wrap;
    /* Held back to below the answers when the rail is a 223px sheet. */
    let railLede = null;

    if (opts.belief) {
      /* The student pressed a control that quoted their own opinion at them.
         Print it again above the question, because the activation IS the
         belief and a card that drops it is a card that just asks a fact. */
      wrap.append(el('p.qz-cp__lede', '\u201c' + opts.belief + '\u201d'));
    } else if (opts.checkpoint) {
      /* One short line above the question and nothing else. The reason this
         particular item was chosen is real and is printed — but underneath the
         commit row, because at 390px five lines of preamble push the actual
         question off the bottom of the sheet, and a question you have to
         scroll to find is a question most readers never answer.
         ROUND 3: on the sheet rail even that one line was too much. Measured at
         390x844 inside a beat, the reading window is 223px and the pinned
         commit row takes 60 of it: lede (two lines) plus question (two lines)
         filled the rest, and not one of the four answers was on the glass. The
         line is kept — it is what says the moment is retrieval and not a test —
         and moved below the answers, where it reads as well and costs nothing. */
      if (this._sheetRail()) railLede = opts.checkpoint.lede;
      else wrap.append(el('p.qz-cp__lede', opts.checkpoint.lede));
    } else if (opts.intro) {
      wrap.append(el('p.qz__return',
        `You were here before. ${opts.intro === 1 ? 'One question' : opts.intro + ' questions'} first — the ones you missed — and then you are back exactly where you were.`));
    } else {
      const r = this.sched.record(item);
      if (r) {
        const when = ago(Date.now() - r.lastAt);
        wrap.append(el('p.qz__return', r.lastRight === false
          ? `You got this wrong ${when}. Produce it now, without looking.`
          : `You met this ${when}. Say it again, without looking.`));
      }
    }

    /* The other half of the resting state. A reader who pressed this control
       cold has never been told the bargain, and the bargain is the whole
       method. Said once, on the first question this student is ever asked, and
       never again. ONE LINE: the sheet band is 332px tall at 390x844, and
       every line of preamble costs an answer option out of first view. A
       preamble that pushes the question down its own sheet teaches nothing. What happens to the answer afterwards is said in
       the one place it matters, beside the control that clears it. */
    const first = !opts.checkpoint && !opts.placed && !opts.intro
      && !this.sched.record(item) && this.sched.coverage(this.items).met === 0;
    if (first) {
      wrap.append(el('p.qz__first',
        'Nothing here is marked, and being wrong is free.'));
    }

    const ask = el('div.cx-ask');
    /* How many things there are to work through, said in the one line that is
       always in view. Measured at 390x844: the sheet band is 332px tall and a
       four-option card shows three of them, so a reader who does not know a
       fourth exists never scrolls to it — and on `t6-who-conquered` the fourth
       is the answer. The eyebrow is above the question, so it survives every
       viewport, and it costs no line of its own. */
    ask.append(
      el('span.cx-ask__eyebrow', 'Answer before you look' + this._count(item)),
      el('p.cx-ask__q', item.question),
    );
    if (item.prompt) ask.append(el('p.qz__prompt', item.prompt));
    const body = el('div.qz__in');
    ask.append(body);
    wrap.append(ask);

    this.commit = el('button.btn.qz__commit', { type: 'button', onclick: () => this._commit() }, 'Commit');
    this.hint = el('span.cx-note.qz__hint', { hidden: true });
    /* THE OPT-OUT, PRICED WHERE IT IS TAKEN — round 3, the classroom verdict:
       "the opt-out is offered everywhere and priced only at the end". It was
       right, and this control was part of it: "Skip it — nothing is scored"
       is reassurance, and reassurance at the moment of a decision is an
       argument for taking it. Nothing is scored is still true and it is still
       said, once, at the top of every card. What the control says now is what
       skipping COSTS, which is the one thing the student cannot see from here:
       the question stays unanswered, and an unanswered question is a line this
       app cannot print in their own words at the end. No shaming, no counter,
       no "are you sure" — a price, in four words, on the control that charges
       it. */
    this.actions = el('p.qz__act', this.commit,
      el('button.cx-more.qz__later', {
        type: 'button',
        onclick: () => {
          if (opts.checkpoint || opts.placed) {
            announce('Skipped. It stays unanswered, and nothing you have not said can be printed in your own words at the end.');
          }
          this.close();
        },
      },
        opts.checkpoint ? 'Skip \u2014 it stays unanswered'
          : opts.placed ? 'Skip \u2014 it stays unanswered'
            : 'Not now'),
      this.hint);
    wrap.append(this.actions);

    const K = this['_in_' + item.kind];
    if (K) K.call(this, body, item);
    else body.append(el('p.cx-note', 'This question cannot be asked from the data this atlas holds.'));

    if (railLede) wrap.append(el('p.qz-cp__lede.qz-cp__lede--after', railLede));

    const why = (opts.checkpoint && opts.checkpoint.reason) || (opts.placed && opts.placed.reason)
      || (opts.belief ? this._beliefReason(opts.belief) : null);
    if (why) {
      /* THE INTERVAL, ON THE CARD. It goes here and not above the question
         because at 390x844 the reading window inside a beat is 223px and every
         line of preamble costs an answer out of first view \u2014 the same reason
         round 3 moved the lede below the answers. Below the commit row it is
         read with the reason it belongs to, and it is the sentence that makes
         the spacing legible rather than merely true. */
      const pre = !!((opts.checkpoint && opts.checkpoint.pre) || (opts.placed && opts.placed.pre));
      const gap = (opts.checkpoint || opts.placed)
        ? (pre ? this._preSay() : this._gapSay(item))
        : null;
      wrap.append(el('div.qz-cp',
        el('p.qz-cp__why', el('span.qz-cp__band', 'why this one, for you'),
          gap ? el('span.qz-cp__gap', gap) : null, why)));
    }

    this.answerSlot = el('div.qz__ans', { hidden: true });
    wrap.append(this.answerSlot);
    return wrap;
  },

  /* ---- kinds ------------------------------------------------------------ */

  _in_choose(body, item) {
    this.response = null;
    const name = 'qz-' + item.id;
    for (const o of item.options) {
      const id = name + '-' + o.id;
      const row = el('label.qz-opt', { for: id },
        el('input', { type: 'radio', name, id, value: o.id, onchange: () => { this.response = o.id; this._enable(true); } }),
        el('span', o.label));
      body.append(row);
    }
    this._enable(false, 'Choose one of the answers first. Nothing here is scored, and a guess is worth more than a blank.');
  },

  _in_who(body, item) { this._in_choose(body, item); },

  /** The band, from the shell's own attribute. Never from a media query: the
   *  rail is `sheet` at 900×700 as well as at 390×844, and a width test gets
   *  that wrong in both directions. */
  _sheetRail() {
    const app = document.getElementById('app');
    return !!(app && app.dataset.rail === 'sheet');
  },

  _in_order(body, item) {
    /* A MATCH prints a reference column and then the rows the reader moves.
       Measured at 390×844: the reference took 150px of a 180px first view and
       `t1-engines` showed NONE of its four movable rows — a matching task with
       nothing visible to match. At sheet width the two halves swap, so the
       answer is what a reader sees and the reference is one thumb below it.
       At `side` the order is unchanged; there is no shortage there. */
    let legend = null;
    if (item.left) {
      const leg = el('ol.qz-legend');
      for (const l of item.left) leg.append(el('li', el('strong', l.label), l.sub ? el('span.qz-legend__s', ' ' + l.sub) : null));
      legend = el('div.qz-legend__w', el('p.cx-panel__head', 'In this order'), leg);
    }
    const narrowMatch = !!(item.left && this._sheetRail());
    if (legend && !narrowMatch) {
      body.append(legend);
      body.append(el('p.qz__prompt', 'Now put the engines beside them.'));
    } else if (legend) {
      body.append(el('p.cx-note.qz-legend__cue', 'Against the four empires listed below.'));
    }
    const src = item.left ? item.right : item.options;
    this.order = scramble(src.map((o) => o.id), hash(item.id));
    const list = el('ol.qz-order', { 'aria-label': 'Reorder these. Use the up and down buttons, or focus a row and press the up or down arrow.' });
    const labels = new Map(src.map((o) => [o.id, o.label]));
    const paint = () => {
      fill(list);
      this.order.forEach((id, i) => {
        const li = el('li.qz-order__i', { tabindex: '0', 'data-id': id, onkeydown: (ev) => {
          if (ev.key === 'ArrowUp') { ev.preventDefault(); move(i, -1); }
          if (ev.key === 'ArrowDown') { ev.preventDefault(); move(i, 1); }
        } });
        li.append(
          el('span.qz-order__n.num', String(i + 1)),
          el('span.qz-order__t', labels.get(id)),
          el('span.qz-order__b',
            el('button.qz-order__u', { type: 'button', 'aria-label': 'Move “' + labels.get(id) + '” up', disabled: i === 0, onclick: () => move(i, -1) }, '↑'),
            el('button.qz-order__u', { type: 'button', 'aria-label': 'Move “' + labels.get(id) + '” down', disabled: i === this.order.length - 1, onclick: () => move(i, 1) }, '↓')),
        );
        list.append(li);
      });
    };
    const move = (i, d) => {
      const j = i + d;
      if (j < 0 || j >= this.order.length) return;
      const id = this.order[i];
      [this.order[i], this.order[j]] = [this.order[j], this.order[i]];
      this._enable(true);
      paint();
      announce(`${labels.get(id)} is now number ${j + 1} of ${this.order.length}.`);
      const nodes = list.querySelectorAll('.qz-order__i');
      if (nodes[j]) nodes[j].focus();
    };
    paint();
    body.append(list);
    if (legend && narrowMatch) body.append(legend);
    body.append(el('p.cx-note', 'Move at least one of them. The order in front of you is not the answer.'));
    this.response = () => this.order.slice();
    this._enable(false, 'Move at least one of them first, with the up and down buttons or the arrow keys. The order in front of you is not the answer.');
  },

  _in_match(body, item) { this._in_order(body, item); },

  _in_estimate(body, item) {
    const scale = item.scale || 1;
    const range = el('input.qz-range', {
      type: 'range', min: item.min, max: item.max, step: item.step,
      value: item.start != null ? item.start : item.min,
      'aria-label': item.question,
    });
    const out = el('output.qz-out.num');
    const fmtv = (v) => (scale > 1 ? this.ctx.format.number(v * scale) : (item.step < 1 ? v.toFixed(1) : this.ctx.format.number(v)));
    const paint = () => { out.textContent = fmtv(+range.value) + (scale > 1 ? item.unit.replace(/^,000/, '') : item.unit); };
    /* Commit stays shut until the slider has been moved. A default nobody
       chose is not a prediction, and a prediction is the whole point. */
    range.addEventListener('input', () => { paint(); this._enable(true); });
    range.addEventListener('keydown', () => this._enable(true));
    paint();
    this.response = () => +range.value;
    /* THE SLIDER FIRST, THE READING UNDER IT. Measured at 390x844 in a beat:
       the reading window is 223px and the pinned commit row overlays 52 of it,
       so the card has 171px. With the big value readout above the track, the
       track itself started at y=614 in a window that ended at 608 — the one
       control the question asks the reader to move was not on the glass at
       all, not even cut. The readout is feedback, not a prompt; it belongs
       under the thing that changes it. DOM order and visual order stay the
       same, so this is what a screen reader gets too. */
    body.append(el('div.qz-est', range,
      el('p.qz-est__ends', el('span.num', fmtv(item.min)), el('span.num', fmtv(item.max))),
      out));

    /* The confidence prompt goes IMMEDIATELY under the slider, above the note
       that explains it. Measured at 390x844 with it last: the three radios sat
       below the fold of a 332px sheet, so a student could commit a number
       without ever seeing that they had been asked how sure they were — and
       'a hunch' would then be printed back to them at the Close as something
       they had said. The instruction below can be scrolled to; the question
       cannot. */
    const conf = el('fieldset.qz-conf');
    conf.append(el('legend', 'How sure are you?'));
    this.confidence = 'a hunch';
    ['a hunch', 'fairly sure', 'certain'].forEach((c, i) => {
      const id = 'qz-c-' + i;
      conf.append(el('label.qz-conf__o', { for: id },
        el('input', { type: 'radio', name: 'qz-conf', id, checked: i === 0, onchange: () => { this.confidence = c; } }),
        el('span', c)));
    });
    body.append(conf);
    body.append(el('p.cx-note', 'Move it. Being wrong here is the cheapest thing in this app, and it is what makes the real figure stick.'));
    this._enable(false, 'Move the slider first. A number you did not choose is not a prediction.');
  },

  _in_year(body, item) {
    const st = this.ctx.store.getState();
    /* Blank, not pre-filled with wherever the map happens to be: a year the
       reader did not type is not a year the reader produced. */
    this.yearIn = el('input.qz-year.num', {
      type: 'number', min: st.bounds.min, max: st.bounds.max, step: '1',
      placeholder: '____',
      'aria-label': 'A year',
      oninput: () => { this.yearTouched = true; this._enable(/^\d{3,4}$/.test(this.yearIn.value.trim())); },
    });
    this.yearTouched = false;
    body.append(el('div.qz-yr', this.yearIn,
      el('button.btn.btn--small', { type: 'button', onclick: () => {
        const v = parseInt(this.yearIn.value, 10);
        if (Number.isFinite(v)) this.ctx.store.dispatch('setYear', v);
      } }, 'Take the map there')));
    body.append(el('p.cx-note', 'Type it, or scrub the year bar under the map and read the year off the bar.'));
    this.response = () => parseInt(this.yearIn.value, 10);
    this._enable(false, 'Type a year first, or move the year bar under the map until it says the year you mean.');
  },

  /** Scrubbing the year bar counts as producing a year — but only once the
   *  reader has moved it themselves. */
  _syncYear(year) {
    if (!this.yearIn || this.yearTouched) return;
    this.yearIn.value = String(year);
    this._enable(true);
  },

  _in_map(body, item) {
    /* On a phone the card is a bottom sheet over the map, so "click it on the
       map" is an instruction the reader cannot follow without losing the
       question. Say so, and hand them the same task as a list of names. */
    const narrow = this._sheetRail();
    /* Measured at 390×844: the long version of this sentence is three lines,
       and with a twenty-word question above it `t16-famine` put NOT ONE of its
       named places in the first view — a card asking you to choose, showing
       nothing to choose from. The short form leads; the rest of the
       instruction goes under the list, where it is read by whoever needs it. */
    body.append(el('p.qz__prompt', narrow
      ? 'Name it from the list, or close this card and tap it on the map.'
      : 'Click it on the map. The map is the answer sheet.'));
    const y = item.year || (item.evidence && item.evidence.year);
    if (Number.isFinite(y)) this.ctx.store.dispatch('setYear', y);
    this._home();
    this.commitLater = true;
    const names = el('div.qz-names', { hidden: true });
    const cands = this._mapCandidates(item);
    for (const t of cands) {
      names.append(el('button.btn.btn--small', { type: 'button', onclick: () => this._mapAnswer(t.id, true) }, t.name));
    }
    if (item.hint) names.append(el('p.cx-note.qz-names__h', item.hint));
    names.hidden = !narrow;
    const more = el('button.cx-more', { type: 'button', hidden: narrow, 'aria-expanded': String(narrow), onclick: () => {
      const nowHidden = names.hidden;
      names.hidden = !nowHidden;
      more.setAttribute('aria-expanded', String(nowHidden));
    } }, 'I cannot find it — list the places');
    if (narrow) {
      body.append(names, el('p.cx-note', 'The map is behind this card. Close it, tap the place, and the card comes back with your answer in it.'));
    } else {
      body.append(more, names);
    }
    this._enable(false, 'Click the place on the map, or open the list of names.');
    this.commit.hidden = true;
  },

  /** Give the whole world back before asking someone to find a place in it. */
  _home() {
    try { if (window.BEA && window.BEA.map && window.BEA.map.home) window.BEA.map.home(); } catch (_) {}
  },

  _mapCandidates(item) {
    const data = this.ctx.data;
    const want = (item.targets || []).map((id) => data.get(id)).filter(Boolean);
    const pool = (data.territories || []).filter((t) => !item.targets.includes(t.id));
    const decoys = [];
    let seed = 31;
    while (decoys.length < 5 && pool.length) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const t = pool[seed % pool.length];
      if (t && !decoys.includes(t)) decoys.push(t);
    }
    const all = [want[0], ...decoys].filter(Boolean);
    let s = 17;
    for (let i = all.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) & 0x7fffffff; const j = s % (i + 1); [all[i], all[j]] = [all[j], all[i]]; }
    return all;
  },

  _mapAnswer(id, fromList) {
    if (!this.current || this.current.kind !== 'map' || this.answered || !id) return;
    const item = this.current;
    const right = (item.targets || []).includes(id);
    const t = this.ctx.data.get(id);
    this._settle(right, t ? t.name : String(id), { fromList });
  },

  _in_explain(body, item) {
    /* A DOCUMENT, WITH NOTHING SAID ABOUT IT YET. When the item carries a
       transcribed text, the words go above the box and the atlas's own
       judgements of them stay hidden until the student has written their own.
       The attribution line is the corpus's `speaker` field verbatim, because a
       quotation without a named speaker and a date is not a source, it is a
       caption. */
    if (item.quote) {
      body.append(el('figure.qz-doc',
        el('blockquote.qz-doc__q', { cite: item.speaker || '' }, item.quote),
        el('figcaption.qz-doc__by', item.speaker || '')));
    }
    this.ta = el('textarea.qz-ta', {
      rows: item.rows || '5', 'aria-label': item.question,
      placeholder: item.placeholder || 'Three or four sentences. Nobody marks this but you.',
      oninput: () => this._enable(this.ta.value.trim().length > 12),
    });
    body.append(this.ta);
    body.append(el('p.cx-note', 'Write it before you look at the model answer. Reading a model answer you have not tried to produce teaches almost nothing.'));
    this.response = () => this.ta.value.trim();
    this._enable(false, 'Write a sentence or two first. Reading a model answer you have not tried to produce teaches almost nothing.');
  },

  /**
   * Commit stays shut until the reader has produced something — a default
   * nobody chose is not a prediction. But `disabled` removes a control from
   * the tab order, and a keyboard reader who tabs past an invisible Commit has
   * no way of learning that the card is waiting for them. So the closed state
   * is `aria-disabled`, which keeps the control reachable and lets pressing it
   * say what is missing, out loud, in the live region.
   */
  _enable(ok, why) {
    if (why) this.blockedWhy = why;
    if (ok && this.hint) this.hint.hidden = true;
    if (!this.commit) return;
    this.commit.disabled = false;
    this.commit.setAttribute('aria-disabled', ok ? 'false' : 'true');
    this.commit.dataset.blocked = ok ? '' : 'yes';
  },

  _blocked() { return !!(this.commit && this.commit.getAttribute('aria-disabled') === 'true'); },

  /* =============================================================== commit */

  _commit() {
    if (!this.current || this.answered) return;
    if (this._blocked()) {
      const why = this.blockedWhy || 'Produce an answer first. Nothing here is scored.';
      announce(why);
      if (this.hint) { this.hint.textContent = why; this.hint.hidden = false; }
      return;
    }
    const item = this.current;
    const r = typeof this.response === 'function' ? this.response() : this.response;
    let right = false, said = '';

    if (item.kind === 'choose' || item.kind === 'who') {
      const o = item.options.find((x) => x.id === r);
      said = o ? o.label : '—';
      right = r === item.answer;
    } else if (item.kind === 'order' || item.kind === 'match') {
      const src = item.left ? item.right : item.options;
      const labels = new Map(src.map((o) => [o.id, o.label]));
      said = r.map((id, i) => (i + 1) + '. ' + labels.get(id)).join('  ');
      right = r.join('|') === item.answer.join('|');
    } else if (item.kind === 'estimate') {
      const scale = item.scale || 1;
      said = (scale > 1 ? this.ctx.format.number(r * scale) : String(r)) + (scale > 1 ? item.unit.replace(/^,000/, '') : item.unit) + ' — ' + this.confidence;
      right = Math.abs(r - item.answer) <= (item.tolerance || 0);
      if (item.band) right = right || (r >= item.band[0] && r <= item.band[1]);
    } else if (item.kind === 'year') {
      said = String(r);
      right = item.right ? item.right(r) : (r >= item.low && r <= item.high);
    } else if (item.kind === 'explain') {
      said = r;
      right = null; // self-checked below
    }
    this._settle(right, said);
  },

  /**
   * The correction, the reason, the evidence — and, when it went wrong, the
   * map put back where the evidence is. Never a tick.
   */
  _settle(right, said, opts = {}) {
    const item = this.current;
    this.answered = true;
    if (this.commit) this.commit.hidden = true;
    if (this.actions) this.actions.hidden = true;

    /* Lock the form. What was said stays on screen — the comparison is the
       teaching — but it cannot be quietly changed after the answer lands. */
    if (this.node) {
      for (const f of this.node.querySelectorAll('.qz__in input, .qz__in textarea, .qz__in button, .qz__in select')) f.disabled = true;
      for (const o of this.node.querySelectorAll('.qz-opt')) {
        const inp = o.querySelector('input');
        if (inp && inp.checked) o.dataset.chose = 'yes';
      }
      const ord = this.node.querySelector('.qz-order');
      if (ord) ord.dataset.locked = 'yes';
    }

    const slot = this.answerSlot;
    slot.hidden = false;
    fill(slot);
    /* The previous card's fold, if there was one, is gone with its node. */
    this.prov = null;

    if (item.kind === 'explain') {
      /* The textarea is reproduced below as "you wrote", and an empty locked
         box beside your own sentence is dead space — so the input goes away.
         BUT NOT THE DOCUMENT. On a source item the whole exercise is reading
         your four sentences against the atlas's four with the words still in
         front of you; taking the letter off the screen at the moment of
         comparison would be like closing the book before the seminar. So when
         the item carries a text, only the writing furniture is hidden and the
         quotation stays where it was. */
      const box = this.node && this.node.querySelector('.qz__in');
      if (box) {
        if (item.quote) {
          for (const e of box.querySelectorAll('.qz-ta, .cx-note')) e.hidden = true;
        } else {
          box.hidden = true;
        }
      }
      this._settleExplain(slot, said);
      return;
    }

    this.sched.answer(item, !!right, this.onReturn);
    if (item.lo) this.losDone.add(item.lo);
    for (const m of tagsOf(item)) this.repaired.add(m);
    this.ctx.bus.emit('quiz:answered', { id: item.id, t: item.t, right: !!right });
    this._toLedger(item, said, right);

    slot.append(el('p.qz__said', el('span.qz__said-l', 'You said'), el('span.qz__said-v', said || '—')));
    const truth = el('div.qz__truth');
    truth.innerHTML = item.correction;
    slot.append(truth);
    if (item.because) slot.append(el('p.qz__why', item.because));
    if (item.source) slot.append(this._provenance(item.source));

    if (!right) this._goToEvidence(item);
    slot.append(this._evidenceRow(item, right));
    slot.append(this._nextRow());

    announce(right
      ? 'Held. Here is the record it came from.'
      : 'Not that. The map has gone to where the evidence is.');
    this._fitCard(truth);
    this._reveal();
    this._refreshControl();
    this._pin();
  },

  /* ============================================ the card and the window ==
   *
   * MEASURED AT 390x844, IN A BEAT, ON THE ROUTE. The reading window a
   * correction gets there is `.cx-sheet__body` at 390x223. The M15 card was
   * 2,259px in it: the student committed, read one of four borders, and the
   * REPLACEMENT MODEL — the whole point of §4 — sat at y=1088 with the window
   * ending at y=660, about four screens down, with the "one more, thirty
   * seconds" control four screens below that. Nothing said so. A commit-then-
   * correct move whose replacement model is off the bottom of a phone has
   * built two of the three things §4 asks for.
   *
   * The biggest single block was not the teaching. It was provenance: 646px of
   * "what it is / who made it / what it was made for / what it cannot tell
   * you", between the model and the way out. So the card now folds, in two
   * stages, and only as far as it has to:
   *
   *   1. the source folds into one line that still NAMES it — author, work,
   *      year, or what the method was — with the interrogation one press away;
   *   2. if it is still more than about two and a half screens, the second and
   *      later blocks of the correction fold behind a control that counts them.
   *
   * Both are measured against the real window after layout, so a desktop sheet
   * that can hold the whole card never folds anything, and neither fold ever
   * removes a word: it moves it behind a labelled control. Collapsed, the M15
   * card measures ~1,050px instead of 2,259, and the replacement model lands on
   * the second screen instead of the fifth.
   */

  /** The element that actually scrolls this card — the shell's sheet body on a
   *  phone, the sheet itself elsewhere. Found by walking up and asking. */
  _scrollBox() {
    let n = this.answerSlot;
    while (n && n !== document.body) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 2) return n;
      n = n.parentElement;
    }
    return null;
  },

  _fitCard(truth) {
    const box = this._scrollBox();
    if (!box || !box.clientHeight) return;
    const screens = () => box.scrollHeight / box.clientHeight;
    if (screens() <= 1.6) return;
    if (this.prov) this._foldProv(true);
    if (screens() <= 2.5) return;
    this._foldEvidence(truth);
  },

  /**
   * The citation, folded to its own name. The line that remains is the
   * citation — a reader can see WHOSE work this is without pressing anything
   * — and what folds away is P16's interrogation of it. The button is a real
   * button with `aria-expanded`, so a screen reader is told there is more and
   * told when it opens.
   */
  _provenance(src) {
    const inner = this._source(src);
    const name = this._sourceName(src);
    const wrap = el('div.qz-prov');
    const body = el('div.qz-prov__body', inner);
    const btn = el('button.qz-prov__t', {
      type: 'button',
      'aria-expanded': 'true',
      onclick: () => this._foldProv(btn.getAttribute('aria-expanded') === 'true'),
    }, el('span.qz-prov__n', name), el('span.qz-prov__m', 'what it is, and what it cannot tell you'));
    btn.hidden = true;
    wrap.append(btn, body);
    this.prov = { wrap, btn, body };
    return wrap;
  },

  /** One line naming the source, in its own terms — never "source". */
  _sourceName(src) {
    if (src.author || src.work) {
      return [src.author, src.work, src.year ? String(src.year) : null].filter(Boolean).join(' \u00b7 ');
    }
    const HEAD = {
      dataset: 'How this was counted',
      periodisation: 'This is a periodisation, not a measurement',
      'standard figure': 'The figure usually given',
      reconstruction: 'This is a reconstruction',
      despatch: 'Where this comes from',
      census: 'Where this number comes from',
      database: 'Where this number comes from',
      record: 'Where this name comes from',
    };
    return HEAD[src.kind] || 'How this was arrived at';
  },

  _foldProv(close) {
    if (!this.prov) return;
    const { btn, body } = this.prov;
    btn.hidden = false;
    body.hidden = !!close;
    btn.setAttribute('aria-expanded', close ? 'false' : 'true');
  },

  /**
   * The correction after its first block. Every correction this app writes
   * separates its blocks with a blank line, so the split is the record's own
   * paragraphing and not a guess at where a sentence ends. If a correction has
   * only one block there is nothing to fold and nothing happens.
   */
  _foldEvidence(truth) {
    if (!truth || truth.dataset.folded) return;
    const parts = truth.innerHTML.split(/<br\s*\/?>\s*<br\s*\/?>/i);
    if (parts.length < 2) return;
    truth.dataset.folded = 'yes';
    truth.innerHTML = parts[0];
    const rest = el('div.qz__truth.qz__truth--rest', { hidden: true });
    rest.innerHTML = parts.slice(1).join('<br><br>');
    const n = parts.length - 1;
    const label = n === 1 ? 'The rest of this answer' : 'The other ' + (COUNT[n] || n) + ', in full';
    const btn = el('button.qz-prov__t.qz__more', {
      type: 'button',
      'aria-expanded': 'false',
      onclick: () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        rest.hidden = open;
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        btn.querySelector('.qz-prov__n').textContent = open ? label : 'Fold that back up';
      },
    }, el('span.qz-prov__n', label), el('span.qz-prov__m', 'nothing here is hidden, only folded'));
    truth.after(btn, rest);
  },

  /**
   * Put the correction where the eye is — and put it at the TOP of the window,
   * not merely inside it.
   *
   * `block: 'nearest'` was leaving the answer part-scrolled on a phone: the
   * reading window is 223px, and landing halfway down it meant the first thing
   * a student saw after committing was the second half of "You said", with the
   * control that opens the rest of the record sliced by the strip below. Set
   * the scroll position instead, so the 223px after a commit always begins at
   * "You said" and holds whole blocks.
   */
  _reveal() {
    const s = this.answerSlot;
    if (!s) return;
    const box = this._scrollBox();
    if (box) {
      try {
        const top = s.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
        box.scrollTop = Math.max(0, top);
        return;
      } catch (_) { /* fall through to the browser's own idea of it */ }
    }
    try { s.scrollIntoView({ block: 'nearest', behavior: 'auto' }); } catch (_) {}
  },

  _settleExplain(slot, said) {
    const item = this.current;
    slot.append(el('p.qz__said', el('span.qz__said-l', 'You wrote'), el('span.qz__said-v', said)));
    const model = el('div.qz__truth');
    model.innerHTML = '<span class="qz__modelhead">'
      + (item.modelHead || 'One historian\u2019s version') + '</span>' + item.model;
    slot.append(model);
    if (item.people && item.people.length) {
      slot.append(el('p.cx-panel__head', 'People in the record'),
        el('ul.qz__people', item.people.map((p) => el('li', p))));
    }
    const marks = [];
    const fs = el('fieldset.qz-check');
    fs.append(el('legend', 'Check your own words against it. Nobody else sees this.'));
    (item.checklist || []).forEach((q, i) => {
      const id = 'qz-k-' + i;
      const box = el('input', { type: 'checkbox', id, onchange: (ev) => { marks[i] = ev.target.checked; upd(); } });
      fs.append(el('label.qz-check__o', { for: id }, box, el('span', q)));
    });
    const done = el('button.btn.qz__commit', { type: 'button', disabled: true, onclick: () => {
      const n = marks.filter(Boolean).length;
      this.sched.answer(item, n >= 2, this.onReturn);
      for (const m of tagsOf(item)) this.repaired.add(m);
      this.ctx.bus.emit('quiz:answered', { id: item.id, t: item.t, right: n >= 2 });
      this._toLedger(item, said, n >= 2);
      done.hidden = true;
      if (item.because) slot.append(el('p.qz__why', item.because));
      if (item.source) slot.append(this._source(item.source));
      if (n < 2) this._goToEvidence(item);
      slot.append(this._evidenceRow(item, n >= 2));
      slot.append(this._nextRow());
      this._refreshControl();
      this._reveal();
      announce(n >= 2 ? 'Recorded as held.' : 'Recorded as one to come back to.');
    } }, 'That is my check');
    const upd = () => { done.disabled = !marks.some((x) => x != null); };
    slot.append(fs, done);
  },

  /**
   * One line into P21's Ledger, in the student's own voice, so the Close can
   * print "I said the Royal Navy took Bengal. It was a company." The Ledger
   * whitelists both the kind and the field set, so nothing else can leak; if
   * P21 is not mounted the event goes nowhere and nothing breaks.
   */
  _toLedger(item, said, right) {
    const kind = item.kind === 'explain' ? 'retold'
      : (item.kind === 'order' || item.kind === 'match') ? 'sorted'
      : item.predict ? 'predicted' : 'classified';
    const plain = (html) => String(html || '')
      .replace(/<br\s*\/?>|<\/(p|div|li)>/gi, ' \u00b7 ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ').trim();
    const e = item.evidence || {};
    const sel = item.evTerr || e.sel;
    let units = item.units && item.units.length ? item.units : null;
    if (!units && sel && this.ctx.data.unitsOf) {
      try { units = this.ctx.data.unitsOf(sel, item.evYear || e.year) || null; } catch (_) { units = null; }
    }
    this.ctx.bus.emit('ledger:append', {
      kind,
      claimId: 'quiz:' + item.id,
      t: item.t,
      misconceptionId: item.misconception || undefined,
      prompt: item.question,
      youSaid: said,
      answer: plain(item.correction || item.model).slice(0, 400),
      verdict: right ? 'confirmed' : 'corrected',
      year: item.evYear || e.year,
      unitIds: units && units.length ? units : undefined,
      dueAt: (this.sched.record(item) || {}).dueAt,
    });
  },

  /**
   * Two different objects, and conflating them is what produced four
   * `[unsourced]` lines in front of a student on the first attempt at this.
   *
   *  - A CITATION is a work somebody made: it goes through P16's `renderSource`,
   *    which requires nature, origin, purpose and what it cannot tell you, and
   *    which is the only thing in this app allowed to render a source.
   *  - A METHOD NOTE is how a figure on this card was arrived at — counted live
   *    from the atlas, or a periodisation, or the figure conventionally given.
   *    That is not a quotation and must not be dressed as one. It says what it
   *    is, in its own words, and it is checkable because the count is repeatable.
   */
  _source(src) {
    if (!src) return el('span');
    if (src.author || src.work) {
      const reply = { node: null };
      try {
        this.ctx.bus.emit('ask:renderSource', { src, opts: { compact: true }, reply: (n) => { reply.node = n; } });
      } catch (_) { /* the dossier may not be mounted */ }
      if (reply.node && reply.node.nodeType) return reply.node;
      const p = el('p.cx-src');
      p.append(el('span.cx-src__kind', String(src.kind || 'source').replace(/-/g, ' ')));
      if (src.author) p.append(src.author + ', ');
      if (src.work) p.append(el('cite', src.work));
      if (src.year) p.append(' ', el('span.num', String(src.year)));
      if (src.note) p.append(el('span.qz__note', ' — ' + src.note));
      return p;
    }
    const HEAD = {
      dataset: 'How this was counted',
      periodisation: 'This is a periodisation, not a measurement',
      'standard figure': 'The figure usually given',
      reconstruction: 'This is a reconstruction',
      despatch: 'Where this comes from',
      census: 'Where this number comes from',
      database: 'Where this number comes from',
      record: 'Where this name comes from',
    };
    const p = el('p.cx-src.qz__method');
    p.append(el('span.cx-src__kind', HEAD[src.kind] || 'How this was arrived at'));
    p.append(String(src.note || ''));
    return p;
  },

  _goToEvidence(item) {
    const e = item.evidence || {};
    const { store, bus } = this.ctx;
    const year = item.evYear || e.year;
    const sel = item.evTerr || e.sel;
    /* On the path the band is holding the beat's sentence, with the beat's
       year printed beside it. If we move the map under it without saying so,
       the screen states two different years at once. Priority 66 for exactly
       as long as the correction is on screen, cleared by `_backToBeat`. */
    const prevYear = store.getState().year;
    const prevSel = store.getState().selectedTerritoryId;
    const willMove = (Number.isFinite(year) && year !== prevYear) || (sel && sel !== prevSel);
    if ((this.opts && (this.opts.checkpoint || this.opts.placed)) && willMove) {
      const t = sel ? this.ctx.data.get(sel) : null;
      const place = t ? t.name : null;
      const yr = Number.isFinite(year) ? String(year) : null;
      const where = place && yr ? '<strong>' + place + '</strong> in <strong>' + yr + '</strong>'
        : place ? '<strong>' + place + '</strong>'
          : yr ? '<strong>' + yr + '</strong>' : null;
      if (where) {
        this.saidCheckpoint = true;
        this._saySized({
          id: 'quiz:checkpoint', priority: 66,
          mark: yr || 'the evidence',
          /* Only a checkpoint has a beat to give back. A recall step IS a
             step: there is nothing behind it, and offering to return would
             close the card the student is still reading. */
          cta: this.opts.checkpoint ? { label: 'Back to the beat', note: 'nothing is lost', emit: 'quiz:cpBack' } : null,
        }, [
          'The map has moved to ' + where + ' \u2014 where this atlas records that. Your beat is held, and comes back when you are done.',
          'The map has moved to ' + where + ' \u2014 where this atlas records that. Your beat is held.',
          'The map has moved to ' + where + '. Your beat is held.',
        ]);
      }
    }
    store.batch((d) => {
      if (Number.isFinite(year)) d('setYear', year);
      if (sel && this.ctx.data.get(sel)) d('select', sel);
    });
    const units = item.units && item.units.length ? item.units : null;
    if (sel && this.ctx.data.get(sel)) bus.emit('ask:flyTo', { territoryId: sel, zoom: 2.4 });
    if (units) { bus.emit('ask:paintUnits', { unitIds: units, reason: 'the evidence for the question you just answered' }); this.painted = true; }
  },

  _evidenceRow(item, right) {
    const e = item.evidence || {};
    const year = item.evYear || e.year;
    const sel = item.evTerr || e.sel;
    const t = sel ? this.ctx.data.get(sel) : null;
    const where = [t ? t.name : null, Number.isFinite(year) ? String(year) : null].filter(Boolean).join(', ');
    if (!where) return el('span');
    return el('p.qz__ev',
      el('button.cx-more', { type: 'button', onclick: () => this._goToEvidence(item) },
        right ? `See it on the map — ${where}` : `The map is at ${where}`));
  },

  _nextRow() {
    if (this.opts && this.opts.placed) {
      /* The schedule first. If nothing has come due yet \u2014 and on a brisk
         session nothing will \u2014 fall back to what is simply owed: produced
         wrongly and never since put right. There is no "later" after the
         Close, so protecting a gap that will never elapse costs more than it
         buys. */
      const due = this.sched.due(this.items, 1);
      const owed = due.length ? [] : this.sched.owed(this.items, 1).filter((i) => i.id !== this.current.id);
      const nextUp = due[0] || owed[0] || null;
      const why = due.length
        ? 'This one has come round again on the schedule, and it is the one you have not yet produced correctly.'
        : 'You got this wrong earlier in this session and have not put it right. The lesson ends soon, so this is the last chance to.';
      const label = 'One more \u2014 the one you missed';
      /* On a brisk first run nothing is due and nothing is owed, and this row
         was simply empty — four times, at the four moments the path guarantees
         a student is looking at this card. That is where the eighteen wrong
         models of §4 get their commitment. The button carries the belief, not
         a topic: a student opens a card that has just quoted their own opinion
         back at them. */
      const belief0 = nextUp ? null : this._unmetBelief(this.current.id);
      const row = el('p.qz__next');
      if (belief0) {
        row.append(this._beliefControl(belief0, 'One more, thirty seconds', () => {
          this.openItem(belief0.item, { placed: { beatId: this.opts.placed.beatId, reason: this._beliefReason(belief0.belief), pre: this._isPretest(belief0.item) } });
        }));
      } else if (nextUp) {
        const target = nextUp, reason = why;
        row.append(el('button.btn.qz__commit', { type: 'button', onclick: () => {
          this.openItem(target, { placed: { beatId: this.opts.placed.beatId, reason, pre: this._isPretest(target) } });
        } }, label));
      }
      /* "the bar above" is a lie on a phone, where the transport docks near
         the foot of the plate. Name the control, not its position. */
      row.append(el('span.cx-note', (nextUp || belief0)
        ? 'Or press Next when you are ready; the lesson goes on either way.'
        : 'Press Next when you are ready. Nothing here is scored and nothing is held against you.'));
      return row;
    }
    if (this.opts && this.opts.checkpoint) {
      const cp = this.opts.checkpoint;
      const row = el('p.qz__next',
        el('button.btn.qz__commit', { type: 'button', onclick: () => this._backToBeat() },
          'Back to the lesson \u2192'),
        el('span.cx-note.qz-cp__pos',
          cp.n < (cp.total || this.cpTotal || CP_TOTAL)
            ? 'Checkpoint ' + cp.n + ' of ' + (cp.total || this.cpTotal || CP_TOTAL) + '. The next one is a few beats away.'
            : 'That was the last one. The close is next, and it will quote you.'));
      /* The beat comes back either way; this is a second, quieter door, and it
         is the only route to the §4 items for a reader on the eight-minute
         path. It says the belief, and it never takes the primary control. */
      const b = this._unmetBelief(this.current.id);
      if (b) {
        const host = this.cpHost;
        row.append(this._beliefControl(b, 'First, thirty seconds', () => {
          this.cpHost = host;
          this.openItem(b.item, { checkpoint: { n: cp.n, total: cp.total, beat: host, pre: this._isPretest(b.item), lede: '\u201c' + b.belief + '\u201d Argue with it before you read on.', reason: this._beliefReason(b.belief), band: 2 } });
        }));
      }
      return row;
    }
    const more = (this.queue && this.queue.length) || this.sched.due(this.items).length;
    const row = el('p.qz__next');
    if (more) {
      row.append(el('button.btn.qz__commit', { type: 'button', onclick: () => {
        const nxt = (this.queue && this.queue.length) ? this.queue.shift() : this.sched.due(this.items, 1)[0];
        if (nxt) this.openItem(nxt, { onReturn: this.onReturn });
        else this.close();
      } }, 'Next question'));
    }
    /* "Nothing else is due" is true of the schedule and misleading about the
       app: a student can have produced everything the clock owes them and
       still never have been asked to commit on a single one of §4's eighteen
       beliefs. When the schedule is empty, the next thing offered is one of
       those, in its own words. */
    const b = more ? null : this._unmetBelief(this.current && this.current.id);
    if (b) {
      row.append(this._beliefControl(b, 'One more, thirty seconds', () => {
        this.queue = [];
        this.openItem(b.item, { belief: b.belief });
      }));
    }
    row.append(el('button.cx-more', { type: 'button', onclick: () => this.close() },
      more || b ? 'Back to the map' : 'Back to the map — nothing else is due'));
    return row;
  },

  /* ================================================================== api */

  _api() {
    const self = this;
    return {
      items: () => self.items,
      dropped: () => self.dropped,
      due: () => self.sched.due(self.items).map((i) => i.id),
      open: (id) => { const it = self.items.find((x) => x.id === id); if (it) { self.queue = []; self.openItem(it, {}); } return !!it; },
      next: () => self.openNext(),
      /* The schedule made visible, on demand. `openNext` only reaches it when
         every item has been produced, which is the right behaviour and a poor
         test seam. */
      schedule: () => self._openDone(),
      close: () => self.close(),
      /* The drive seam sets the response object directly, which the DOM knows
         nothing about — so it also opens the commit, exactly as moving the
         control would have. */
      answer: (r) => { if (r !== undefined) { self.response = r; self._enable(true); } self._commit(); },
      metrics: () => self.sched.m,
      /* The §4 coverage table, read out of the RESOLVED bank, so an item the
         dataset could not support reports as absent rather than as present.
         `reachable` is checkpoint.js's own predicate, not a repeat of it, so
         the table cannot claim a route placement the scheduler would refuse. */
      misconceptions: () => auditM(self.items).map((row) => ({
        ...row,
        items: row.items.map((it) => ({
          ...it,
          reachable: canHost(self.items.find((x) => x.id === it.id)),
        })),
      })),
      unmetBeliefs: () => unmetM(self.items, (i) => self.sched.record(i)),
      openBelief: () => { const b = self._unmetBelief(null); if (b) { self.queue = []; self.openItem(b.item, { belief: b.belief }); } return b ? b.item.id : null; },
      persistedKeys: () => self.sched.persistedKeys(),
      /* Forgetting the record has to forget the beliefs too, or a student who
         clears what this app knows about them is still treated as having
         argued with §4 for the rest of the session. */
      forget: () => { self.repaired = new Set(); self.sched.forget(); },
      /** Test seam: pretend the record is older than it is, and that this is a
       *  new visit — which is what an elapsed day actually means. */
      _age: (ms) => {
        for (const t of Object.values(self.sched.m.firstAttemptAccuracyByTItem)) {
          for (const r of Object.values(t.items || {})) { r.lastAt -= ms; r.dueAt -= ms; }
        }
        self.sched.answeredThisSession = new Set();
        self.sched.started = Date.now();
        self.sched._write();
        self._refreshControl();
      },
      _openOnReturn: () => { self.onReturnRun = false; self._openOnReturn(); },
      /** The path's retrieval, for the acceptance scenario and for a teacher
       *  who wants to know what this student was actually made to produce. */
      checkpoints: () => ({
        /* The authored moments, which never change, and the plan THIS route
           resolves them to, which does. `total` is the number the cards print,
           so a scenario can assert that no card promises a checkpoint the
           route cannot deliver. */
        hosts: HOSTS.map((h) => h.beat),
        planned: (self.hosts || []).map((h) => h.beat),
        route: self.routeId,
        routeBeats: self.routeBeats || [],
        routePlacesRecalls: !!self.routePlacesRecalls,
        placing: !!self.pathPlacesRetrieval,
        total: self.cpTotal,
        audit: self.hostAudit || null,
        fired: [...self.cpFired],
        items: [...self.cpUsed],
        usedT: [...self.cpUsedT],
        /* One row per moment that actually fired: the item, its T-number, and
           whether the card framed it as a second encounter or as a guess before
           teaching. Both claims are printed on the card, so both have to be
           assertable from outside. */
        asked: self.cpAsked.slice(),
        onScreenT: [...self._onScreen()],
        vizT: [...self.vizT.keys()],
        seen: self.seen.map((b) => b.id),
        /* Ordered, with the one T-number each beat carries, so a scenario can
           recompute "had this been on screen when that card fired?" from the
           run itself rather than trusting the flag the card printed. */
        seenT: self.seen.map((b) => ({ id: b.id, t: b.t || null })),
      }),
    };
  },
};
