/**
 * search/index.js — P07. FINDING, AND NOT FINDING.
 *
 * Two jobs, and the second one is the piece's argument.
 *
 * 1. WAYFINDING. `Ctrl/Cmd+K` (or `/`) opens a lookup over 260 territories,
 *    302 pieces of geometry with their 272 alias sets, 308 events, every named
 *    person in the dataset, every state and people Britain took land from, and
 *    632 cited works. It is fuzzy, it is keyboard-first, and it resolves
 *    historical names: Ceylon, Van Diemen's Land, Rhodesia, Bombay, Persia,
 *    Weihaiwei, the Somers Isles. A result is an ANSWER — the years held, the
 *    legal status at the year on the map, how Britain took it and how it ended
 *    — so a reader who never presses Enter has still learnt something.
 *    Choosing one sets the whole map state: year, selection and layer
 *    together, all three in the URL.
 *
 *    Nine kinds of result, each with its own answer shape: place · ground ·
 *    event · person · taken-from · source · a year · an absence · the index of
 *    absences. The bar under the list says what Enter will do on the row the
 *    reader is actually on, because for three of the nine it is not "go there".
 *
 *    It is NOT on the landing screen and it is not the primary affordance.
 *    FEATURE_SPEC P07: a prominent search box invites a novice to arrive at
 *    the Scramble before they know what a protectorate is. The only visible
 *    door appears once the reader has touched something (`data-stage` past
 *    `plate`); the keystroke works from second zero for anyone who knows it.
 *
 * 2. THE SEARCH THAT COMES BACK EMPTY (FEATURE_SPEC §1 charge 7, Move 3).
 *    Ask this atlas something the archive cannot answer — "Kenya deaths 1954"
 *    — and the ABSENCE comes back as a result, in the same list, in the same
 *    shape as everything else, with its named agent, its date, its disclosure
 *    history and a line saying what would settle it. Never "no results found".
 *    Choosing it takes the map to the year and asks the plate to draw the hole
 *    — and deliberately does NOT fly the camera to it, because a hole is only
 *    the loudest mark on a map you can still see. See silence.js: the silences
 *    are derived from the shards, not typed here.
 *
 *    And the evidence lens: filter the whole atlas by the year a work was
 *    published, or by a single work, and watch what greys out. See lens.js,
 *    which is careful to caption that as a fact about our bibliography.
 *
 * 3. WHAT THIS ATLAS CANNOT TELL YOU. The absence-as-a-result only
 *    reaches a reader who already knows what to type, which made the strongest
 *    thing in this piece a reward for prior knowledge — the same failure the
 *    whole app was sent to fix, repeated inside the archive. So the 180 holes
 *    are now a reference work: grouped by the three shapes of silence, counted
 *    live from the dataset, named one by one with their agents, and openable.
 *    It is reached four ways — the first row of the empty finder, a `.cx-more`
 *    on any absence's sheet, the query `silences` (so `#q=silences` is a link a
 *    teacher can set), and `bus.emit('ask:silences')` — and it opens behind a
 *    committed number, because the split is the lesson: only 5 of the 180 are
 *    destroyed records. See cannot.js.
 *
 * 4. WHAT ROUND 3 CHANGED. Six defects, all of them found by driving the
 *    running app rather than by reading the code.
 *      · THE RELEVANCE CLIFF. Five of the nine answers to "Tipu Sultan" were
 *        places that matched the word "sultan" — Egypt, Muscat and Oman,
 *        Socotra, Zanzibar, Nejd. A record that matched only PART of a query is
 *        dropped whenever some record matched the whole of it (match.js `full`).
 *      · A BARE YEAR IS NOT A STRING. "1857" answered with British Railways in
 *        Argentina 1857–1914 and Paradise of Dissent: South Australia
 *        1829–1857. A year now answers with the year and with what the dataset
 *        dates to it, and never with a book title.
 *      · THE BAR TOLD THE TRUTH ABOUT ONE KEY AND NOT THE OTHERS. "Enter takes
 *        the map there" was printed under a cited work (it applies a lens) and
 *        under an absence (it opens a hole and refuses to fly).
 *      · THE EVIDENCE LENS HAD NO DOOR. A committed mechanism reachable only by
 *        typing `filter=lens:2011` into the address bar. It has two now.
 *      · ONE POLITY, TWO RESULTS. Nine parties were doubled by a leading "The".
 *      · AND THE PROSE. The absence sheet printed its question twice under a
 *        head that printed it a third time; the Kenya disclosure printed
 *        £19.9m twice in consecutive sentences; and a party row said the
 *        Sultanate of Mysore "Lost British India in 1792".
 *
 * ------------------------------------------------------------------------
 * HOW THE AUTHORED PATH (app/js/tours/) DRIVES THIS SURFACE
 *
 *   bus.emit('ask:find',  { q, open = true, run = true, kind })   open + query
 *   bus.emit('ask:find',  { close: true })                        close it
 *   bus.emit('ask:lens',  { before: 2011 })                       date lens
 *   bus.emit('ask:lens',  { workId: 'src:…' })                    single-work lens
 *   bus.emit('ask:lens',  { off: true })                          clear it
 *   bus.emit('ask:silence', { id: 'silence:mau-mau-emergency-1952' })
 *                                        open one absence, as if searched for
 *   bus.emit('ask:silences')             the index of all of them, in the sheet
 *
 * IT EMITS
 *   search:ready    { places, units, events, people, sources, silences }
 *   search:opened   { q }
 *   search:closed   { q }
 *   search:results  { q, n, kinds }
 *   search:chose    { kind, id, year, territoryId, layer }
 *   search:absence  { id, silenceKind, territoryId, year }
 *   search:lens     { mode, before, workId, units }
 *   search:cannot   { total, destroyed, never-made, contested-range }
 *   search:silenceGuess { youSaid, answer, of }
 *
 * URL: the query is `q` (state.searchQuery, shell-owned). The lens is
 * `filter=lens:2011` or `filter=lens:work:<id>` (state.filters.lens), so a
 * teacher can link a class straight to a lens the way they link a year.
 * ------------------------------------------------------------------------
 *
 * Slot: `overlay`. It renders nothing there until the reader opens it, so it
 * costs the layout budget nothing at `data-stage="plate"` — no control, no
 * word, no pixel of the plate (LAYOUT_BUDGET §2, rules B1–B5, D1–D2).
 */

import { el, disposer, announce, trapFocus, debounce, getJson } from '../core/util.js';
import { buildCorpus } from './corpus.js';
import { buildSilences, findSilences, ASKING } from './silence.js';
import { norm, keyWords, scoreBest, yearsIn } from './match.js';
import { makeAnswerRenderer } from './answer.js';
import { buildLens } from './lens.js';
import { buildCannot, silenceCounts } from './cannot.js';

const CSS = new URL('../../css/search.css', import.meta.url);
const HERE = (f) => new URL(f, import.meta.url).href;

/* How much each kind is worth once its own name score is in. A place beats a
   piece of geometry with the same name because a place is the thing this atlas
   is about; a source is last because nobody types a book title by accident. */
const KIND_WEIGHT = { place: 1, absence: 1, event: 0.94, person: 0.9, party: 0.88, unit: 0.86, source: 0.8 };
const MAX_ROWS = 9;
const MAX_ABSENCE = 3;

/* A query about the archive itself, rather than about a place in it. The
   index of holes then comes back AS A RESULT, which also gives it a deep link
   a teacher can set: `#q=silences` opens the finder with it at the top. */
const ASKS_INDEX = /\b(silence|silences|absence|absences|gap|gaps|missing|destroyed|burned|burnt|suppressed|censor\w*|archive|archives|hidden|cannot|unknown|no ?record|not recorded|uncounted)\b/i;

/* What a reader can type to see the piece work, when they have typed nothing.
   Each is a real query against this dataset, checked by tools/scenarios. */
/* The field's own prompt has to fit the field. Measured at 390px: the long
   form was clipped to "A place, a person, an" — a placeholder that stops
   mid-phrase teaches nothing and looks broken. */
/* Round 3 measured the narrow form clipped to "A place, a person, a q" in a
   169px field at 390px, so the choice is no longer a breakpoint guess: the
   longest of these that actually fits the field is the one that is set. */
const PLACEHOLDERS = [
  'A place, a person, an event, a source — or a question',
  'A place, a person, a question',
  'A place, a person, a year',
  'A place or a question',
  'Search this atlas',
];

const OPENERS = [
  { q: 'Ceylon', why: 'a name this atlas files under another name' },
  { q: 'Van Diemen’s Land', why: 'the same island, renamed by the people who ran it' },
  { q: 'Kenya deaths 1954', why: 'a question the archive cannot answer' },
  { q: 'Elkins', why: 'a historian — see what rests on one book' },
];

export default {
  id: 'search',
  slot: 'overlay',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { util, bus, store } = ctx;
    await util.loadCss(CSS);

    this.open = false;
    this.q = '';
    this.rows = [];
    this.active = 0;
    this.lens = null;
    this.lensState = null;
    this.built = false;

    this.doc = await getJson(HERE('absences.json'), { entries: [] });

    this._buildPalette(ctx.root);
    this._buildDoor();
    this._wireKeys();
    this._wireBus();

    /* The index costs about a frame to build and nobody searches in the first
       second, so it is built when the browser is next idle — or on the first
       keystroke, whichever comes first. Boot time is the map's, not ours. */
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 400));
    idle(() => this._build());

    /* A deep link may carry a query or a lens.
       `#q=Ceylon` with no selection is a teacher sending a class a SEARCH, so
       it opens. `#year=1954&sel=kenya&q=…` is a link to the RESULT of one, so
       it does not — the finder would only be standing in front of the answer
       it had already produced. */
    const s0 = store.getState();
    if (s0.filters && s0.filters.lens) this._applyLensFromUrl(String(s0.filters.lens));
    if (s0.searchQuery) {
      this._build();
      this.q = s0.searchQuery;
      if (!s0.selectedTerritoryId) setTimeout(() => this._openFinder(this.q), 120);
    }

    this.d(() => { if (this.door && this.door.parentNode) this.door.remove(); });
  },

  update(state, prev, changed) {
    if (changed.has('filters')) {
      this._syncDoor(state);
      const lv = state.filters && state.filters.lens ? String(state.filters.lens) : null;
      const was = prev.filters && prev.filters.lens ? String(prev.filters.lens) : null;
      if (lv !== was && lv) this._applyLensFromUrl(lv);
      if (!lv && was) this._clearLens(false);
    }
    if (this.open && (changed.has('year') || changed.has('activeLayer'))) this._render();
  },

  destroy() { clearTimeout(this._sayT); cancelAnimationFrame(this._ovR); this._close(false); if (this.d) this.d.all(); },

  /* ==================================================== the index ======== */

  _build() {
    if (this.built) return;
    this.built = true;
    const t0 = performance.now();
    this.corpus = buildCorpus(this.ctx.data);
    this.silences = buildSilences(this.ctx.data, this.doc);
    this.render = makeAnswerRenderer(this.ctx);
    this.ms = Math.round(performance.now() - t0);
    this.ctx.bus.emit('search:ready', {
      places: this.corpus.places.length, units: this.corpus.units.length,
      events: this.corpus.events.length, people: this.corpus.people.length,
      sources: this.corpus.sources.length, silences: this.silences.list.length,
      ms: this.ms,
    });
  },

  /* ==================================================== the door ========= */

  /**
   * One quiet control in the masthead, and it is not an input. It appears only
   * once the reader has touched something, so the landing screen keeps its
   * nineteen controls and its one obvious next thing.
   *
   * `chrome-end` is a shell slot that more than one piece writes into and one
   * of them replaces its children wholesale, so the button re-attaches itself
   * if it is ever swept away. Same guard the quiz uses.
   */
  _buildDoor() {
    const mount = document.querySelector('[data-mount="chrome-end"]');
    if (!mount) return;
    const key = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? '⌘K' : 'Ctrl K';
    /* THE MASTHEAD IS SHARED AND IT IS FULL. Round 2 measured six entries
       overflowing a 390px bar with no scroll and no collapse, and this door
       was the widest of them at 77px. A device with no keyboard is told about
       a keystroke it cannot press, in a strip that has no room for the word.
       So the shortcut chip is rendered only where a keyboard exists, and CSS
       drops the word below 48rem — the door becomes its own glyph, which is
       the one universally understood mark for this. `aria-label` carries the
       whole sentence either way, so nothing is lost to a screen reader. */
    const hasKeys = !window.matchMedia || !window.matchMedia('(pointer: coarse)').matches;
    const label = 'Find a place, a person, an event, a source — or something the archive cannot answer'
      + (hasKeys ? ' (' + key + ')' : '');
    this.door = el('button.sr-door', {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-label': label,
      title: label,
      onclick: () => this._openFinder(''),
    }, el('span.sr-door__w', { text: 'Find' }),
    /* In the collapsed masthead this control is a full-width row in a panel
       beside "Taken → left", "Compare", "Recall" and "Teaching desk", and one
       four-letter word in that company says less than any of them. The rest of
       the sentence is in the DOM at every width and CSS reveals it only there
       — LAYOUT_BUDGET §5A: the glyph is right in a 46px strip and wrong in the
       panel it becomes. */
    el('span.sr-door__long', { text: ' a place, a person, a question' }),
    hasKeys ? el('kbd.sr-door__k', { text: key }) : null);
    this.doorMount = mount;
    mount.appendChild(this.door);
    const obs = new MutationObserver(() => {
      if (this.door && !this.door.isConnected && this.doorMount.isConnected) this.doorMount.appendChild(this.door);
    });
    obs.observe(mount, { childList: true });
    this.d(() => obs.disconnect());
    this._syncDoor(this.ctx.store.getState());
  },

  _syncDoor(state) {
    if (!this.door) return;
    const stage = (state.filters && state.filters.stage) || 'plate';
    this.door.hidden = stage === 'plate';
  },

  /* ==================================================== the palette ====== */

  _buildPalette(root) {
    this.input = el('input.sr__input', {
      type: 'search', autocomplete: 'off', autocorrect: 'off', spellcheck: 'false',
      'aria-label': 'Search this atlas',
      'aria-controls': 'sr-list', 'aria-autocomplete': 'list', role: 'combobox',
      'aria-expanded': 'true',
      placeholder: PLACEHOLDERS[0],
    });
    this.input.addEventListener('input', debounce(() => { this.q = this.input.value; this._render(); this._pushQuery(); }, 60));

    this.yearNote = el('span.sr__year');
    this.list = el('ul#sr-list.sr__list', { role: 'listbox', 'aria-label': 'Results' });
    this.foot = el('p.sr__foot');

    this.panel = el('div.sr__panel', {
      role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Find in this atlas',
    },
    el('div.sr__bar',
      el('span.sr__glyph', { 'aria-hidden': 'true', text: '⌕' }),
      this.input,
      this.yearNote,
      el('button.sr__x', { type: 'button', 'aria-label': 'Close (Escape)', onclick: () => this._close() }, '×')),
    this.list,
    this.foot);

    this.scrim = el('div.sr__scrim', { onclick: () => this._close() });
    this.wrap = el('div.sr', { hidden: true }, this.scrim, this.panel);
    root.appendChild(this.wrap);

    this.list.addEventListener('mousemove', (ev) => {
      const li = ev.target.closest && ev.target.closest('.sr__row');
      if (!li) return;
      const i = Number(li.dataset.i);
      if (i !== this.active) { this.active = i; this._paintActive(); }
    });
    this.list.addEventListener('click', (ev) => {
      const li = ev.target.closest && ev.target.closest('.sr__row');
      if (!li) return;
      this._choose(this.rows[Number(li.dataset.i)]);
    });
  },

  /* ==================================================== keyboard ========= */

  _wireKeys() {
    /* On `window`, in the capture phase, so Escape closes the finder before
       the shell's own Escape ladder (sheet → overlay → tour → selection)
       gets a chance to unwind something the reader was not looking at. */
    const onKey = (ev) => {
      const k = ev.key;
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && (k === 'k' || k === 'K')) {
        ev.preventDefault(); ev.stopPropagation();
        this.open ? this._close() : this._openFinder('');
        return;
      }
      if (!this.open) {
        if (k === '/' && !mod && !ev.altKey && !isTyping(ev.target)) {
          ev.preventDefault(); this._openFinder('');
        }
        return;
      }
      if (k === 'Escape') { ev.preventDefault(); ev.stopPropagation(); this._close(); return; }
      if (k === 'ArrowDown') { ev.preventDefault(); this._move(1); return; }
      if (k === 'ArrowUp') { ev.preventDefault(); this._move(-1); return; }
      if (k === 'Home' && this.rows.length) { ev.preventDefault(); this.active = 0; this._paintActive(); return; }
      if (k === 'End' && this.rows.length) { ev.preventDefault(); this.active = this.rows.length - 1; this._paintActive(); return; }
      if (k === 'Enter') {
        const r = this.rows[this.active];
        if (r) { ev.preventDefault(); this._choose(r); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    this.d(() => window.removeEventListener('keydown', onKey, true));
  },

  _move(dir) {
    if (!this.rows.length) return;
    this.active = (this.active + dir + this.rows.length) % this.rows.length;
    this._paintActive();
  },

  _paintActive() {
    const kids = [...this.list.children];
    kids.forEach((li, i) => {
      const on = i === this.active;
      li.classList.toggle('is-active', on);
      li.setAttribute('aria-selected', String(on));
      if (on) {
        this.input.setAttribute('aria-activedescendant', li.id);
        li.scrollIntoView({ block: 'nearest' });
      }
    });
    this._paintHint();
  },

  /**
   * WHAT ENTER ACTUALLY DOES, ON THIS ROW.
   *
   * The bar used to read "Enter takes the map there" under every result, and
   * for three of the eight kinds that was false: Enter on a cited work puts
   * the evidence lens on the atlas and moves nothing; Enter on an absence
   * opens a hole in the plate and deliberately refuses to fly the camera to
   * it; Enter on the index opens a sheet. A reader who is told the wrong
   * consequence of a key is being taught to distrust the interface, which is
   * effort spent on the app instead of on the history (rubric C12).
   */
  _hintFor(r) {
    if (!r) return 'takes the map there';
    switch (r.kind) {
      case 'source': return 'greys out the rest of the map';
      case 'absence': return 'opens the hole in the plate';
      case 'index': return 'opens all ' + this.silences.list.length;
      case 'year': return 'sets the map to ' + r.year;
      case 'party': return 'goes to what they lost';
      default: return 'takes the map there';
    }
  },

  _paintHint() {
    if (!this.hint) return;
    /* The arrow-key clause is hidden on a phone (search.css): there are no
       arrow keys there, and its ten characters were what wrapped the bar onto
       a second line and took them off the list. */
    this.hint.replaceChildren(
      el('span.sr__hmove', { text: '↑↓ move · ' }),
      el('kbd', { text: 'Enter' }), ' ', this._hintFor(this.rows[this.active]),
      ' · ', el('kbd', { text: 'Esc' }), ' closes');
  },

  /* ==================================================== open / close ===== */

  _openFinder(q) {
    this._build();
    if (this.open) { if (q != null) { this.input.value = q; this.q = q; this._render(); } return; }
    this.returnTo = document.activeElement;
    this.open = true;
    this.wrap.hidden = false;
    if (q != null) { this.input.value = q; this.q = q; }
    this._render();
    /* After the panel is shown, never before: a hidden field measures zero and
       a zero field takes the shortest prompt in the list. */
    this._fitPlaceholder();
    this.untrap = trapFocus(this.panel, { initial: this.input });
    this.input.select();
    this.ctx.bus.emit('search:opened', { q: this.q });
    announce('Search open. Type to find a place, a person, an event or a source. Escape closes it.');
  },

  /**
   * The prompt has to fit the field it is in, and the field's width depends on
   * the year chip beside it, on the viewport and on the reader's own type
   * size. So it is measured rather than guessed: the longest prompt that fits
   * wins, and if none of them does the field carries none, which says less but
   * does not say half a sentence.
   */
  _fitPlaceholder() {
    const room = this.input.clientWidth;
    if (!room) { this.input.placeholder = PLACEHOLDERS[PLACEHOLDERS.length - 1]; return; }
    const cs = getComputedStyle(this.input);
    const probe = el('span', { style: 'position:absolute;visibility:hidden;white-space:nowrap;'
      + 'font:' + cs.font + ';letter-spacing:' + cs.letterSpacing });
    document.body.appendChild(probe);
    let pick = '';
    for (const t of PLACEHOLDERS) {
      probe.textContent = t;
      if (probe.getBoundingClientRect().width <= room - 4) { pick = t; break; }
    }
    probe.remove();
    this.input.placeholder = pick;
  },

  _close(restore = true) {
    if (!this.open) return;
    this.open = false;
    this.wrap.hidden = true;
    if (this.untrap) { this.untrap(); this.untrap = null; }
    else if (restore && this.returnTo && this.returnTo.focus) this.returnTo.focus();
    this.ctx.bus.emit('search:closed', { q: this.q });
  },

  /* ==================================================== the search ======= */

  _search(qRaw, year) {
    const q = norm(qRaw);
    if (!q) return [];
    const years = yearsIn(qRaw);
    /* A year in the query is a TIME signal, not a string to match. Leave it in
       and "Kenya deaths 1954" returns a book with 1954 in its subtitle. */
    const qn = q.replace(/\b\d{4}\b/g, ' ').replace(/\s+/g, ' ').trim() || q;
    const qw = keyWords(qn);
    const qk = qw.join(' ');
    /* Two readings of the same query: as typed, and as the words that name
       something. The first wins ties (mul 1 against 0.94). */
    const READ = qk && qk !== qn
      ? [{ q: qn, qw, mul: 1 }, { q: qk, qw, mul: 0.94 }]
      : [{ q: qn, qw, mul: 1 }];
    const bareYear = years.length && !q.replace(/\b\d{4}\b/g, '').replace(/[^a-z]/g, '');
    const c = this.corpus;

    const scored = [];
    const placeIds = new Set();
    const unitIds = new Set();

    for (const r of c.all) {
      const { score, via, viaKind, full } = scoreBest(READ, r.names);
      if (!score) continue;
      /* A BARE YEAR IS NOT A STRING. "1857" asks what the map held in 1857,
         not which book has 1857 in its subtitle — and seven of the ten answers
         used to be the second thing: British Railways in Argentina 1857–1914,
         Paradise of Dissent: South Australia 1829–1857, The Story of Kuala
         Lumpur 1857–1939. A cited work is never the answer to a year. */
      if (bareYear && r.kind === 'source') continue;
      /* And a year is not a fuzzy string either: 1857 is one edit from 1856,
         1858 and 1859, so "1857" was answered by the Colony of Victoria
         ("until 1851…"), Van Diemen's Land ("renamed Tasmania in 1856") and
         the Orange River Sovereignty. A record answers a bare year only if it
         is dated near it or carries the digits themselves. */
      if (bareYear) {
        const dated = Number.isFinite(r.year) && years.some((y) => Math.abs(y - r.year) <= 3);
        const literal = via && years.some((y) => String(via).includes(String(y)));
        if (!dated && !literal) continue;
      }
      let s = score * (KIND_WEIGHT[r.kind] || 0.8);
      if (r.kind === 'place') {
        const at = this.ctx.data.territoryAt(r.id, year);
        if (at && at.active && at.controlled) s += 70;
        placeIds.add(r.id);
      }
      if (r.kind === 'unit') unitIds.add(r.id);
      if (r.kind === 'event' && years.length && Number.isFinite(r.year)
        && years.some((y) => Math.abs(y - r.year) <= 3)) s += 260;
      scored.push({ ...r, score: Math.round(s), via, viaKind, full });
    }

    /* THE RELEVANCE CLIFF. When some record matched the whole query, a record
       that matched only part of it is not a weaker answer — it is a different
       question. Dropped, and only then: if nothing matched in full, the
       partials are all the reader has and they stay. See match.js `full`. */
    let pool = scored;
    if (qw.length > 1 && scored.some((r) => r.full)) pool = scored.filter((r) => r.full);

    /* AND A YEAR ANSWERS WITH ITS OWN EVENTS. A record only ever entered the
       loop above because its NAME scored, so "1765" could never return the
       Diwani of Bengal: the title does not carry the digits. The dataset knows
       what is dated to a year, so ask it, and put those events in the list on
       the strength of their date rather than of their spelling. */
    if (bareYear) {
      const byId = new Map(pool.map((r) => [r.id, r]));
      for (const y of years.slice(0, 2)) {
        for (const e of this.ctx.data.eventsBetween(y, y) || []) {
          const rec = byId.get(e.id) || c.events.find((x) => x.id === e.id);
          if (!rec) continue;
          /* One rank for "dated to this year", so an event that happens to
             spell the year in its title does not outrank one that does not.
             The old score survives only as a tiebreak, divided by ten. */
          const s = 3000 + (e.changedStatus ? 200 : 0) + Math.min(90, Math.round((rec.score || 0) / 10));
          if (byId.has(e.id)) { byId.get(e.id).score = s; continue; }
          const row = { ...rec, score: s, via: null, viaKind: null, full: true };
          byId.set(e.id, row);
          pool.push(row);
        }
      }
    }

    /* The absences. Two routes: a direct hit on the question, or a place this
       atlas knows plus a word that asks for a number. */
    const sil = findSilences(this.silences, qn, qw, { placeIds, unitIds, years, read: READ }).slice(0, MAX_ABSENCE);

    pool.sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title)));

    /* A unit whose territory is already answering is noise, not a result. */
    const chosen = [];
    const takenPlaces = new Set(pool.filter((r) => r.kind === 'place').slice(0, 6).map((r) => r.id));
    for (const r of pool) {
      if (r.kind === 'unit') {
        const owners = this.ctx.data.territoriesForUnit(r.id) || [];
        if (owners.some((t) => takenPlaces.has(t.id))) continue;
      }
      chosen.push(r);
      if (chosen.length >= MAX_ROWS) break;
    }

    /* A bare year is a wayfinding question with an answer of its own. */
    const head = [];
    if (bareYear) for (const y of years.slice(0, 2)) head.push(this._yearRecord(y));
    /* A question about the archive rather than about a place in it. It leads
       only when no particular hole answered — "missing records" gets the
       index; "Kenya records destroyed" gets Kenya's hole first and the index
       underneath it, because the specific answer beats the catalogue. */
    const wantsIndex = ASKS_INDEX.test(qRaw);
    if (wantsIndex && !sil.length) head.push(this._indexRecord());

    /* Absences lead when the query asked a counting question. Otherwise they
       take their place on merit, by score, among everything else — so
       "Operation Legacy" leads with the silence it names and "Ceylon" does
       not lead with a lecture about what nobody counted there. */
    const asking = ASKING.test(q);
    const body = asking
      ? [...sil, ...chosen]
      : [...sil, ...chosen].sort((a, b) => b.score - a.score);
    const tail = wantsIndex && sil.length ? [this._indexRecord()] : [];
    return [...head, ...body.slice(0, MAX_ROWS + sil.length), ...tail];
  },

  /** The index of holes, as a result. Choosing it opens the sheet. */
  _indexRecord() {
    const c = silenceCounts(this.silences.list);
    return {
      kind: 'index', id: 'index:silences', title: 'What this atlas cannot tell you',
      score: 4200, names: [], counts: c,
    };
  },

  /** A year, as an answer: what the map holds then, and what changes. */
  _yearRecord(y) {
    const { data } = this.ctx;
    const b = data.bounds || { min: 1600, max: 2000 };
    const yy = Math.max(b.min, Math.min(b.max, y));
    const m = data.metricsAt(yy);
    const evs = data.eventsBetween(yy, yy);
    return {
      kind: 'year', id: 'year:' + yy, title: String(yy), score: 4000,
      year: yy, clamped: yy !== y, metrics: m, events: evs, names: [],
    };
  },

  /* ==================================================== rendering ======== */

  _render() {
    const year = this.ctx.store.getState().year;
    this.yearNote.replaceChildren(
      el('span.sr__yearw', { text: 'answers ' }),
      document.createTextNode('at '),
      el('span.num', { text: this.ctx.format.year(year) }));
    this.yearNote.title = 'Everything below is shown at the year on the map. Change the year and these answers change.';

    if (!this.built) this._build();
    this.rows = this.q.trim() ? this._search(this.q, year) : [];
    this.active = 0;
    this.list.replaceChildren();

    if (!this.q.trim()) { this._renderOpeners(); this._syncOverflow(); return; }

    if (!this.rows.length) { this._renderNothing(); this._syncOverflow(); return; }

    this.rows.forEach((r, i) => {
      const li = el('li.sr__row', {
        id: 'sr-r' + i, role: 'option', 'aria-selected': String(i === 0),
        dataset: { i: String(i), kind: r.kind },
      }, this.render(r, year));
      this.list.appendChild(li);
    });
    this._syncOverflow();
    this.hint = el('span.sr__hint');
    this.foot.replaceChildren(
      this.hint,
      el('span.sr__count', el('span.num', { text: String(this.rows.length) }),
        this.rows.length === 1 ? ' answer' : ' answers'));
    this._paintActive();
    const kinds = this.rows.reduce((a, r) => { a[r.kind] = (a[r.kind] || 0) + 1; return a; }, {});
    this.ctx.bus.emit('search:results', { q: this.q, n: this.rows.length, kinds });
    this._say(this.rows.length + (this.rows.length === 1 ? ' answer' : ' answers')
      + (kinds.absence ? ', the first of which is something the archive cannot answer' : '')
      + '. ' + (this.rows[0] ? this.rows[0].title : ''));
  },

  /** Does the list actually overflow? The fade is a lie if it does not. */
  _syncOverflow() {
    cancelAnimationFrame(this._ovR);
    this._ovR = requestAnimationFrame(() => {
      if (!this.list) return;
      const over = this.list.scrollHeight - this.list.clientHeight > 4;
      this.list.dataset.over = over ? 'yes' : 'no';
    });
  },

  /** One polite announcement per settled query, not one per keystroke. */
  _say(text) {
    clearTimeout(this._sayT);
    this._sayT = setTimeout(() => announce(text), 400);
  },

  _renderOpeners() {
    const c = this.corpus;
    const n = (v) => el('span.num', { text: this.ctx.format.number(v) });
    this.list.appendChild(el('li.sr__blurb',
      el('p', 'Everything in this atlas is in here: ',
        n(c.places.length), ' territories, ',
        n(c.units.length), ' pieces of ground and every name they were filed under, ',
        n(c.events.length), ' events, ',
        n(c.people.length), ' named people, ',
        n(c.parties.length), ' states and peoples Britain took land from, and ',
        n(c.sources.length), ' cited works.')));
    /* THE INDEX OF HOLES, AS A DOOR AND NOT AS A HINT. Round 2's absence
       result was reachable only by a reader who already knew what to type,
       which made the strongest thing in this piece a reward for prior
       knowledge. It is now the first row of the empty state, at the same size
       as a result, with its own count. */
    this.list.appendChild(el('li.sr__try.sr__try--cannot',
      el('button', { type: 'button', onclick: () => { this._openCannot(); this._close(); } },
        el('span.sr__tryq', 'What this atlas ', el('em', 'cannot'), ' tell you'),
        el('span.sr__trywhy', el('span.num', { text: String(this.silences.list.length) }),
          ' questions it has no answer to, and the three different reasons why'))));
    /* THE LENS NEEDED A DOOR. It is a committed mechanism (FEATURE_SPEC §1,
       charge 7) and in round 3 the only way to reach the date form of it was
       to type `filter=lens:2011` into the address bar, which no student will
       ever do. It sits here, beside the index of holes, because both ask the
       same question of the atlas: how do you know, and since when. */
    /* It opens at 1945 and not at 2011, and the difference is the lesson. At
       1945 the map mostly greys, which is what makes the mechanism visible on
       arrival; at 2011 nothing greys at all, and the lens says so in words —
       nothing in this atlas rests only on the Hanslope disclosure. A door that
       lands on the null result first looks broken; a reader who moves the chip
       to 2011 themselves has found the honest answer instead of being told it. */
    this.list.appendChild(el('li.sr__try.sr__try--lens',
      el('button', { type: 'button', onclick: () => { this._openLens({ mode: 'date', before: 1945 }); this._close(); } },
        el('span.sr__tryq', 'How old is this atlas\u2019s evidence?'),
        el('span.sr__trywhy', 'filter the atlas by the year a cited work was published — ',
          el('span.num', { text: '1945' }), ', ', el('span.num', { text: '2005' }), ', ',
          el('span.num', { text: '2011' })))));
    for (const o of OPENERS) {
      this.list.appendChild(el('li.sr__try',
        el('button', { type: 'button', onclick: () => { this.input.value = o.q; this.q = o.q; this._render(); this.input.focus(); } },
          el('span.sr__tryq', { text: o.q }), el('span.sr__trywhy', { text: o.why }))));
    }
    this.hint = null;
    this.foot.replaceChildren(el('span.sr__hint', { text: 'Type to search. Escape closes.' }));
  },

  /**
   * Nothing matched. That is a written answer too — never a blank panel, and
   * never a shrug. It says what was searched, what this atlas does hold, and
   * gives the reader the nearest thing to what they typed.
   */
  _renderNothing() {
    const near = this._nearest(this.q);
    const n = (v) => el('span.num', { text: this.ctx.format.number(v) });
    const li = el('li.sr__blurb.sr__blurb--none',
      el('h3', 'Nothing in this atlas is called ', el('em', { text: this.q.trim() }), '.'),
      el('p', 'That is an answer about this atlas, not about the past. This one holds ',
        n(this.corpus.places.length), ' territories, ',
        n(this.corpus.units.length), ' pieces of ground, ',
        n(this.corpus.events.length), ' events, ',
        n(this.corpus.people.length), ' named people and ',
        n(this.corpus.sources.length),
        ' cited works. If the place you want was never British, it is not here — and the map draws it, unfilled, all the same.'),
      near.length ? el('p.sr__nearlead', { text: 'The closest things it does hold:' }) : null,
      near.length ? el('ul.sr__near', near.map((r) => el('li',
        el('button.cx-more', { type: 'button', onclick: () => { this.input.value = r.title; this.q = r.title; this._render(); this.input.focus(); } },
          r.title)))) : null,
      el('p.sr__nearlead', { text: 'Or read what it cannot answer:' }),
      el('p', el('button.cx-more', { type: 'button', onclick: () => { this._openCannot(); this._close(); } },
        'All ', String(this.silences.list.length), ' things this atlas cannot tell you')),
      el('p.cx-note', 'Try a historical name — ', el('em', { text: 'Ceylon' }), ', ',
        el('em', { text: 'Van Diemen’s Land' }), ', ', el('em', { text: 'Rhodesia' }),
        ' — a person, a cited historian, or a question this atlas cannot answer, like ',
        el('em', { text: 'Kenya deaths 1954' }), '.'));
    this.list.appendChild(li);
    this.hint = null;
    this.foot.replaceChildren(el('span.sr__hint', { text: 'No match. Escape closes.' }));
    this.ctx.bus.emit('search:results', { q: this.q, n: 0, kinds: {} });
  },

  /** The nearest three names in the corpus, by loose subsequence overlap. */
  _nearest(qRaw) {
    const q = norm(qRaw);
    if (q.length < 3) return [];
    const out = [];
    for (const r of [...this.corpus.places, ...this.corpus.events]) {
      const n = norm(r.title);
      let i = 0, hit = 0;
      for (const ch of q) { const j = n.indexOf(ch, i); if (j >= 0) { i = j + 1; hit++; } }
      const s = hit / q.length - Math.abs(n.length - q.length) / 200;
      if (hit >= Math.max(3, q.length - 2)) out.push({ title: r.title, s });
    }
    return out.sort((a, b) => b.s - a.s).slice(0, 3);
  },

  /* ==================================================== choosing ========= */

  /**
   * A result sets the whole state, not a scroll position: the year it is being
   * shown at, the territory selected, and the layer that makes the answer
   * legible — dispatched in one batch so the URL carries all three together.
   */
  _choose(r) {
    if (!r) return;
    const { store, bus, data, format } = this.ctx;
    const now = store.getState();
    let year = now.year;
    let sel = null;
    let layer = now.activeLayer || 'status';

    if (r.kind === 'index') {
      store.dispatch('setSearch', this.q);
      this._openCannot();
      this._close();
      return;
    }
    if (r.kind === 'year') {
      store.batch((d) => { d('setYear', r.year); d('setLayer', layer); d('setSearch', this.q); });
      bus.emit('search:chose', { kind: 'year', id: r.id, year: r.year, territoryId: null, layer });
      announce('Showing ' + format.year(r.year) + '.');
      this._close();
      return;
    }
    if (r.kind === 'place') {
      sel = r.id;
      const at = data.territoryAt(r.id, year);
      if (!(at && at.active)) {
        const t = r.t;
        year = Number.isFinite(t.acquiredYear) ? t.acquiredYear
          : (Number.isFinite(t.firstYear) ? t.firstYear : year);
      }
      layer = 'status';
    } else if (r.kind === 'unit') {
      const owners = data.territoriesForUnit(r.id) || [];
      sel = owners.length ? owners[0].id : null;
      if (sel) { const t = data.get(sel); if (t && Number.isFinite(t.acquiredYear) && !data.territoryAt(sel, year)) year = t.acquiredYear; }
      layer = 'status';
      setTimeout(() => bus.emit('ask:flyTo', { unitId: r.id }), 300);
    } else if (r.kind === 'event') {
      const d = data.readDate(r.e.date) || {};
      if (Number.isFinite(d.year)) year = d.year;
      sel = r.territoryId || null;
      layer = r.e.changedStatus ? 'status' : layer;
      if (/independen|withdraw|handover|transfer/i.test(r.e.title + ' ' + (r.e.tags || []).join(' '))) layer = 'exit';
      else if (/conquest|annex|expedition|treaty|charter|occupat/i.test(r.e.title + ' ' + (r.e.tags || []).join(' '))) layer = 'mechanism';
      if (r.unitIds && r.unitIds.length === 1) setTimeout(() => bus.emit('ask:flyTo', { unitId: r.unitIds[0] }), 300);
    } else if (r.kind === 'person') {
      const a = r.appearances[0] || {};
      if (Number.isFinite(a.year)) year = a.year;
      sel = a.territoryId || null;
      if (sel) setTimeout(() => bus.emit('ask:flyTo', { territoryId: sel }), 300);
    } else if (r.kind === 'party') {
      const l = r.losses[0] || {};
      if (Number.isFinite(l.year)) year = l.year;
      sel = l.territoryId || null;
      layer = 'mechanism';
      if (sel) setTimeout(() => bus.emit('ask:flyTo', { territoryId: sel }), 300);
    } else if (r.kind === 'source') {
      this._openLens({ mode: 'work', workId: r.id });
      this._close();
      return;
    } else if (r.kind === 'absence') {
      this._chooseAbsence(r);
      return;
    }

    store.batch((d) => {
      d('setYear', year);
      d('setLayer', layer);
      if (sel) d('select', sel); else d('deselect');
      d('setSearch', this.q);
    });
    bus.emit('search:chose', { kind: r.kind, id: r.id, year, territoryId: sel, layer });
    bus.emit('ledger:append', { kind: 'found', claimId: 'search:' + r.id, year });
    announce('Showing ' + r.title + ' at ' + format.year(year) + '.');
    this._close();
  },

  /**
   * An absence sets state like any other result, and then does the one thing
   * only it can: it asks the plate to draw the hole, and it says the sentence
   * in the band so the reader arrives already reading.
   */
  _chooseAbsence(r) {
    const { store, bus, format } = this.ctx;
    const year = Number.isFinite(r.year) ? r.year : store.getState().year;
    store.batch((d) => {
      d('setYear', year);
      d('setLayer', 'status');
      if (r.territoryId) d('select', r.territoryId);
      d('setSearch', this.q);
    });
    if (r.unitIds && r.unitIds.length) {
      bus.emit('ask:paintSilence', {
        unitIds: r.unitIds,
        reason: r.quote || r.title,
        agent: r.agentUnknown ? null : r.agent,
      });
      /* NO FLY-TO ON AN ABSENCE, deliberately. The hole's whole argument is
         that on a filled map a piece of bare paper is the loudest mark
         available — and that argument needs the filled map around it. Round 2
         zoomed to Kenya at k=14 and the reader arrived at a beige shape with
         no empire in the frame to be missing from. The plate stays where it
         is; the hole opens in it. */
    }
    bus.emit('ask:say', {
      id: 'search:absence', priority: 50,
      mark: r.when || (Number.isFinite(r.year) ? format.year(r.year) : null),
      text: '<strong>' + escapeText(r.title) + '</strong> ' + escapeText(r.answer),
      cta: { label: 'What would settle it', emit: 'ask:silence', payload: { id: r.id, sheet: true } },
    });
    bus.emit('search:absence', { id: r.id, silenceKind: r.silenceKind, territoryId: r.territoryId, year });
    bus.emit('ledger:append', { kind: 'found', claimId: 'silence:' + r.id, year });
    this._openSilenceSheet(r);
    announce('An absence: ' + r.title + '. ' + r.answer);
    this._close();
  },

  /** The whole apparatus, in the rail, beside a live map. */
  _openSilenceSheet(r) {
    const node = el('div.sr-sheet', this.render(r, this.ctx.store.getState().year, { full: true, headed: true }));
    node.querySelectorAll('.sr__cta').forEach((n) => n.remove());
    node.append(el('p.cx-note', 'One of ', el('span.num', { text: String(this.silences.list.length) }),
      ' holes this atlas can name. They are read out of the dataset’s own notes about its own numbers, '
      + 'not from a list typed by hand.'));
    node.append(el('p.sr-sheet__all',
      el('button.cx-more', { type: 'button', onclick: () => this._openCannot() },
        'All ', String(this.silences.list.length), ', and the three shapes they come in')));
    /* THE DISCLOSURE HAS A YEAR, AND THE ATLAS CAN BE ASKED WHAT RESTS ON IT.
       The evidence lens is a committed mechanism (FEATURE_SPEC §1, charge 7)
       and until round 3 the only way to a DATE lens was to type one into the
       address bar. Here is where it belongs: the reader has just been told the
       Foreign Office admitted holding these files in 2011, so the next
       question is what in this atlas could be said before that. */
    if (r.disclosure && Number.isFinite(r.disclosure.year)) {
      const y = r.disclosure.year;
      node.append(el('p.sr-sheet__all',
        el('button.cx-more', { type: 'button', onclick: () => this._openLens({ mode: 'date', before: y }) },
          'What this atlas could still say using only works published by ', String(y))));
    }
    if (r.evidence && r.evidence.length) {
      const box = el('div.sr-sheet__src', el('p.cx-panel__head', { text: 'What this rests on' }));
      for (const src of r.evidence.slice(0, 4)) box.append(this._cite(src));
      node.append(box);
    }
    this.ctx.bus.emit('ask:sheet', {
      id: 'search:silence', eyebrow: 'An absence, as a result',
      title: r.title, node,
    });
    this._focusSheet(node, null);
  },

  /**
   * WHAT THIS ATLAS CANNOT TELL YOU — every hole, grouped by its shape,
   * behind one committed guess. See `cannot.js` for the argument.
   *
   * It goes in the rail sheet, so it costs the plate nothing at any
   * disclosure level and the map stays live beside it while the reader
   * works down the list.
   */
  async _openCannot() {
    this._build();
    let prior = null;
    try {
      const mod = await import('../close/ledger.js');
      this.ledger = mod.getLedger(this.ctx.bus);
      prior = this.ledger.get('p07:silence-shapes');
    } catch (_) { prior = null; }
    const node = buildCannot(this.ctx, this.silences, (r) => this._chooseAbsence(r), prior);
    this.ctx.bus.emit('ask:sheet', {
      id: 'search:cannot',
      eyebrow: 'The archive, counted',
      title: 'What this atlas cannot tell you',
      node,
    });
    /* The shell mounts the sheet but does not move focus into it, so a reader
       who opened this from the keyboard would land back at the skip links with
       a panel open behind them. Measured, and fixed here rather than in the
       shell because it is our surface. */
    this._focusSheet(node, 'What this atlas cannot tell you. '
      + this.silences.list.length + ' questions, in three shapes, behind one guess.');
    this.ctx.bus.emit('search:cannot', silenceCounts(this.silences.list));
  },

  /** Put the reader inside the surface they just opened. */
  _focusSheet(node, say) {
    if (!node) return;
    node.tabIndex = -1;
    requestAnimationFrame(() => { try { node.focus({ preventScroll: true }); } catch (_) { /* detached */ } });
    if (say) announce(say);
  },

  /** One citation, through the app's one citation function where it exists. */
  _cite(src) {
    let node = null;
    if (window.BEA && typeof window.BEA.renderSource === 'function') {
      try { node = window.BEA.renderSource(src, { compact: true }); } catch (_) { node = null; }
    }
    if (!node) {
      this.ctx.bus.emit('ask:renderSource', { src, opts: { compact: true }, reply: (n) => { node = n; } });
    }
    if (node) return node;
    return el('p.cx-src',
      el('span.cx-src__kind.sc', { text: (src.kind || 'source').replace(/-/g, ' ') }),
      src.author ? src.author + ', ' : '',
      el('cite', { text: src.work || 'untitled' }),
      src.year ? [' ', el('span.num', { text: String(src.year) })] : null);
  },

  /* ==================================================== the lens ========= */

  _openLens(initial) {
    this._build();
    const sources = this.corpus.sources;
    const work = initial && initial.workId ? sources.find((s) => s.id === initial.workId) : null;
    this.lens = buildLens(this.ctx, {
      sources,
      initial: work ? { mode: 'work', work } : { mode: 'date', before: (initial && initial.before) || 2011 },
      onApply: (st) => this._applyLens(st),
      onClear: () => this._clearLens(true),
    });
    this.ctx.bus.emit('ask:sheet', {
      id: 'search:lens', eyebrow: 'Filter the atlas by its own sources',
      title: 'The evidence lens', node: this.lens.root,
    });
  },

  _applyLens(st) {
    const { bus, store } = this.ctx;
    this.lensState = st;
    bus.emit('ask:paintUnits', { unitIds: st.unitIds, reason: st.reason });
    const v = st.mode === 'work' ? 'work:' + st.workId : String(st.before);
    if (((store.getState().filters || {}).lens || null) !== v) store.dispatch('setFilter', { lens: v });
    bus.emit('search:lens', { ...st, n: st.unitIds.length });
  },

  _clearLens(write) {
    const { bus, store } = this.ctx;
    this.lensState = null;
    bus.emit('ask:paintUnits', { unitIds: [], reason: null });
    if (write && (store.getState().filters || {}).lens) store.dispatch('setFilter', { lens: null });
    bus.emit('search:lens', { mode: 'off', units: 0 });
  },

  _applyLensFromUrl(v) {
    this._build();
    if (v.startsWith('work:')) this._openLens({ mode: 'work', workId: v.slice(5) });
    else { const y = parseInt(v, 10); if (Number.isFinite(y)) this._openLens({ mode: 'date', before: y }); }
  },

  /* ==================================================== the bus ========== */

  _wireBus() {
    const { bus } = this.ctx;
    const on = (n, f) => this.d(bus.on(n, f));

    on('ask:find', (p = {}) => {
      if (p.close) { this._close(); return; }
      this._openFinder(p.q == null ? '' : String(p.q));
    });
    on('ask:lens', (p = {}) => {
      if (p.off) { this._clearLens(true); this.ctx.bus.emit('ask:sheet', null); return; }
      this._openLens(p);
    });
    on('ask:silences', () => this._openCannot());
    on('ask:silence', (p = {}) => {
      if (p.all) { this._openCannot(); return; }
      this._build();
      const r = this.silences.byId.get(p.id) || this.silences.list.find((s) => s.id === p.id);
      if (!r) return;
      if (p.sheet) this._openSilenceSheet(r); else this._chooseAbsence(r);
    });
    /* THE LENS DIES WITH ITS CONTROL. The rail holds one sheet; when the lens
       loses it — closed, or taken by another piece — the filter comes off the
       map too. A map dimmed by a filter with no visible control is a trap, and
       the reader would have no way of knowing why half the empire had faded. */
    on('chrome:sheet', (p) => {
      if (!this.lensState) return;
      const mine = p && p.id === 'search:lens' && p.open;
      if (!mine) this._clearLens(true);
    });
    /* A debugging and scenario handle, in the same place everything else is.
       `window.BEA` is assigned by the shell one statement AFTER it emits
       `app:ready`, so attaching on the event itself would be one tick early. */
    const attach = () => { if (window.BEA) window.BEA.search = this._expose(); };
    attach();
    on('app:ready', () => setTimeout(attach, 0));
    const t = setTimeout(attach, 0);
    this.d(() => clearTimeout(t));
  },

  _expose() {
    const self = this;
    return {
      open: (q) => self._openFinder(q == null ? '' : q),
      close: () => self._close(),
      query: (q) => { self._build(); return self._search(q, self.ctx.store.getState().year); },
      silences: () => { self._build(); return self.silences.list; },
      corpus: () => { self._build(); return self.corpus; },
      lens: (o) => self._openLens(o || {}),
      cannot: () => self._openCannot(),
      counts: () => { self._build(); return silenceCounts(self.silences.list); },
      lensState: () => self.lensState,
      get isOpen() { return self.open; },
      get rows() { return self.rows; },
      choose: (i) => self._choose(self.rows[i || 0]),
      module: self,
    };
  },

  _pushQuery() {
    const s = this.ctx.store.getState();
    if ((s.searchQuery || '') !== this.q) this.ctx.store.dispatch('setSearch', this.q);
  },
};

function isTyping(node) {
  if (!node) return false;
  const t = (node.tagName || '').toLowerCase();
  return t === 'input' || t === 'textarea' || t === 'select' || node.isContentEditable;
}

function escapeText(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

