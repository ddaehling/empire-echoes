/* panels/dossier — P04, the territory dossier.
 *
 * Answers, without scrolling, the four questions a student actually has about
 * a place: what it was in law this year; who took it and from whom; who was
 * here and what they did; how it ended. Everything else is one scroll of THIS
 * PANEL away — the panel scrolls, the map stays, the timeline stays.
 *
 * It also owns renderSource(), the single function in this app permitted to
 * print a quotation or a citation, and publishes it for every other piece.
 *
 * Emits:
 *   ledger:append   { kind:'found', claimId, territoryId, year, dwellMs }
 *   dossier:navigate{ from, to, back? }                           a because-chip
 *   source:unsourced{ field, key, count }                         a defect shown
 *   source:ready    { renderSource }                              on mount
 *   ask:flyTo       { territoryId }                               chip navigation
 *   ask:paintUnits  { unitIds, reason }                           nested / direct rule
 *
 * Listens: ask:renderSource  ({ src, opts, reply })  for a piece that cannot import.
 *          dossier:openSection { id }                open one of this entry's sections
 *          chrome:sheet        { id, open }          the shell says what is in the rail
 *
 * THE ROUTE IN, for a guided path (P05) or any other piece that needs to put a
 * reader in front of one thing in here. Two steps, in this order:
 *
 *   store.dispatch('select', territoryId);          // the fold, and the band's sentence
 *   bus.emit('dossier:openSection', { id: 'testimony' });
 *
 * `id` is one of the section keys below; an unknown key is ignored and the
 * fold stays up, so a tour step can name a section an entry does not have
 * without breaking the tour. The shell answers with `chrome:sheet {id:'dossier:
 * <key>', open:true}` when it is up, which is the event to wait on.
 *
 *   why          what this place is joined to, and the cause under each join
 *   testimony    the texts written at the time, transcribed, colonised side first
 *   actors       every named non-British person and institution, and our sources
 *   control      how control actually worked, in full
 *   taken-full   every acquisition step, with its instrument and counterparties
 *   ended-full   every departure step, with its mechanism
 *   nested       what sat inside this, and what this sat inside
 *   dates        the key dates, with contested and circa marks
 *   consequences what this place did to the people in it
 *   contested    where historians disagree about this entry, by name
 *   evidence     the source apparatus for everything above
 *   words        the vocabulary this entry uses, defined
 *   answers      every question this reader has committed an answer to
 */
import { disposer, on, loadCss, announce, rafThrottle, debounce } from '../../core/util.js';
import { renderDossier, refitFold } from './dossier.js';
import { renderSource, useBus, unsourced, classOnly } from './source.js';
import { createLedger, createNav, linksFor, bestYearFor, claimId } from './claims.js';
import { remember, answerFor, BRACKETS, bracketSpan, bracketVerdict } from './ask.js';
import { nestedSplit } from './fields.js';
import { TESTIMONY, auditTestimony, testimonyStats } from './testimony.js';
import { CAUSES, auditCauses } from './causes.js';
import { publish as publishWarrant } from '../../core/warrant.js';

/* renderSource is published globally, so it must survive one instance being
   torn down while another is still mounted (the harness mounts and destroys
   this module fifty times to check for listener leaks). */
let live = 0;

/* A claim counts as FOUND when it has been at least half visible inside the
   scrolling panel, continuously, for this long. Round 1 stamped on the first
   intersection with an unscrolled 6,830px root, so selecting Bengal wrote
   eleven `found` entries in the same millisecond, before the student had read
   a word, and every retrieval conversion built on that record was worthless. */
const DWELL_MS = 1500;

/* A focused node's identity, stable across a re-render of the same entry.
   Class plus the data attributes this panel's controls are addressed by; the
   tag is included so a heading and a button that share a class do not swap. */
function sigOf(node) {
  if (!node || !node.getAttribute) return null;
  const d = node.dataset || {};
  const parts = [node.tagName, node.getAttribute('class') || ''];
  for (const k of ['act', 'sheet', 'key', 'value', 'kind', 'target', 'step', 'for', 'claim', 'block']) {
    if (d[k] != null) parts.push(k + '=' + d[k]);
  }
  return parts.join('|');
}
function findBySig(root, sig) {
  if (!sig) return null;
  const all = root.querySelectorAll('a[href],button,summary,input,select,textarea,[tabindex],[data-claim],[data-block]');
  for (const n of all) if (sigOf(n) === sig) return n;
  return null;
}

export default {
  id: 'panels-dossier',
  slot: 'dossier',
  requires: ['data'],

  async mount({ root, store, data, bus, format, util }) {
    await loadCss(new URL('../../../css/dossier.css', import.meta.url));
    this.root = root;
    this.store = store; this.data = data; this.bus = bus; this.format = format; this.util = util;
    this.off = disposer();
    this.ledger = createLedger(bus);
    this.nav = createNav(store, bus);
    this.lastKey = null;
    this.timers = new Map();   /* element -> dwell timer */
    this.scroller = root.closest('.app__dossier') || null;
    this.app = document.getElementById('app') || document.querySelector('.app');
    this.lastPointerAt = 0;
    this.keepScroll = null;
    this.focusAfter = null;
    /* Acquisition steps the student has asked to see in full. Session-only,
       cleared when the subject changes. */
    this.expanded = new Set();
    /* THE RAIL IS SHARED. docs/LAYOUT_BUDGET.md rule B7: the dossier and the
       shell's sheet occupy one grid column at one width, and the sheet stacks
       over this panel. Ten of this entry's twelve sections are now destinations
       in that sheet rather than screenfuls of this column, so this piece has to
       know which surface is in front of the reader. */
    this.sheets = new Map();      /* section id -> {id, eyebrow, title, node} */
    this.openSheetId = null;
    this.sheetHost = document.querySelector('[data-mount="sheet"]') || document.getElementById('sheet');

    useBus(bus);
    const publish = () => {
      if (typeof window === 'undefined') return;
      window.BEA = window.BEA || {};
      window.BEA.renderSource = renderSource;
      window.BEA.unsourcedCount = unsourced;
      window.BEA.classOnlyCount = classOnly;
      window.BEA.dossierLedger = this.ledger;
      /* Charge 13: a head of department must be able to audit this without a
         debugger and without reading a source file. Both tables this piece
         states in its own voice — the transcribed primary texts and the causal
         claims — are published with their audits attached, so
         `BEA.testimony.audit()` and `BEA.causes.audit()` return the list of
         anything missing a field, from the console, on the running app. */
      window.BEA.testimony = { texts: TESTIMONY, audit: auditTestimony, stats: testimonyStats };
      window.BEA.causes = { links: CAUSES, audit: auditCauses };
      /* H1's contract, published from the first piece to adopt it, so the path,
         tours, close and viz teams can read it off the running app:
         BEA.warrant.contract says what a warrant is, BEA.warrant.quantity()
         prints one, and BEA.warrant.auditWarrants(BEA.data.territories) counts
         how many figures in the dataset still have none. */
      publishWarrant();
    };
    live++;
    publish();
    this.off(bus.on('app:ready', () => { const t = setTimeout(publish, 0); this.off(() => clearTimeout(t)); }));
    bus.emit('source:ready', { renderSource });
    this.off(bus.on('ask:renderSource', (p) => { if (p && typeof p.reply === 'function') p.reply(renderSource(p.src, p.opts)); }));

    /* The browser's own Back button. Round 3 kept a private stack that never
       heard about popstate, so after a chip and a browser Back the panel still
       printed "← Back to Bengal Presidency, 1857" on the Bengal Presidency
       1857 panel, and the map stayed where the chip's flight had left it. */
    this.off(bus.on('url:pop', () => {
      const st = this.store.getState();
      if (this.nav.popped(st)) { this.lastKey = null; this.render(); }
    }));

    /* One delegated listener for the whole panel — and one for our own
       content while it is standing in the shell's sheet, which is outside this
       module's root. Without the second, every because-chip, every attribution
       gate and every source cross-reference inside a routed section would be a
       dead control the moment it left this column. */
    this.off(on(root, 'click', '[data-act], .dsr-chip', (ev, hit) => this.onClick(ev, hit)));
    if (this.sheetHost) {
      this.off(on(this.sheetHost, 'click', '[data-act], .dsr-chip', (ev, hit) => {
        if (!this.openSheetId) return;          /* the sheet is somebody else's */
        this.onClick(ev, hit, { inSheet: true });
      }));
    }
    /* Another piece may take the sheet at any moment. When it does, ours is no
       longer on screen and its claims stop being read. */
    this.off(bus.on('chrome:sheet', (m) => {
      if (!m) return;
      const mine = !!m.id && String(m.id).startsWith('dossier:');
      if (!m.open || !mine) {
        const was = this.openSheetId;
        this.openSheetId = null; this.sheetClaims = [];
        /* The shell empties the sheet when it closes it, so a keyboard reader
           who pressed Escape inside a routed section was left on <body> with
           no way back to the row they came from. Focus goes back to the
           control that opened it. */
        if (was) {
          const a = document.activeElement;
          if (!a || a === document.body || !a.isConnected || (this.sheetHost && this.sheetHost.contains(a))) {
            const btn = root.querySelector('[data-act="sheet"][data-sheet="' + CSS.escape(was) + '"]');
            if (btn) btn.focus({ preventScroll: true });
          }
        }
      }
      if (this.tick) this.tick();
    }));
    /* A named route into one of this entry's sections, for any piece that has
       one (the lede band's control is the first). */
    this.off(bus.on('dossier:openSection', (m) => this.openSheet((m && m.id) || 'testimony')));

    /* Was the last selection made with a pointer or with a keyboard? Only a
       keyboard user needs focus moved for them; moving it under a mouse click
       would steal the caret from whatever they were doing. */
    this.off(on(document, 'pointerdown', () => { this.lastPointerAt = Date.now(); }, { capture: true, passive: true }));
    /* And was anybody driving with a keyboard at all? A deep link
       (#year=1900&sel=egypt) is neither a pointer selection nor a key
       press, and moving focus for it drew a focus ring round the title on
       first paint for a reader who had opened a shared link with a mouse
       in their hand. Focus is moved for somebody who is steering. */
    this.lastKeyAt = 0;
    this.off(on(document, 'keydown', () => { this.lastKeyAt = Date.now(); }, { capture: true, passive: true }));

    /* ESCAPE, IN THE CAPTURE PHASE. Measured at 390x844: by the time this
       module's bubble-phase listener saw Escape it was already
       `defaultPrevented` — another module, registered earlier, takes Escape on
       a phone — so a reader on a phone had no key that closed the panel and,
       until the header was lifted clear of the map (dossier.css §ROUND 7), no
       visible ✕ either. Capture runs before every bubble listener, and this one
       only acts when focus is inside this panel, so it takes Escape from
       nobody else. */
    this.off(on(document, 'keydown', (ev) => {
      if (ev.key !== 'Escape' || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const a = ev.target;
      if (!(a instanceof Node) || !root.contains(a)) return;
      if (a instanceof Element && a.closest('input,textarea,select,[contenteditable="true"]')) return;
      ev.preventDefault();
      ev.stopPropagation();
      this.closeToMap();
    }, { capture: true }));

    /* THE PANEL KEEPS FOCUS UNTIL ESCAPE.
       Reproduced before it was changed: pressing Enter on a focused map target
       opened this panel and left `document.activeElement` on BODY, so a
       keyboard or screen-reader user opened a panel they could not then read.
       Two things were wrong. The panel did move focus to its heading — and
       then the rail opening resized this column, the ResizeObserver fired a
       reflow, and `replaceChildren` threw the focused node away (see
       `render`). And once focus was inside, Tab walked straight back out into
       the map's 302 targets.

       The exits are named, both of them, and announced on entry: Escape, and
       the ✕ that is the first stop in the cycle. WCAG 2.1.2 asks for a
       documented way out, not for no boundary. */
    this.off(on(document, 'keydown', (ev) => {
      if (ev.key !== 'Tab' || ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (!this.store.getState().selectedTerritoryId) return;
      const a = ev.target;
      if (!(a instanceof Node) || !root.contains(a)) return;
      if (this.app && this.app.dataset.sheet === 'open') return;   /* the sheet is in front */
      const items = this.focusables();
      if (items.length < 2) return;
      const first = items[0];
      const last = items[items.length - 1];
      const here = items.indexOf(a);
      if (here === -1) {
        /* The heading carries tabindex="-1" and is not in the cycle, so a
           Shift+Tab off it would land outside the panel. */
        if (ev.shiftKey) { ev.preventDefault(); last.focus(); }
        return;
      }
      if (!ev.shiftKey && here === items.length - 1) { ev.preventDefault(); first.focus(); }
      else if (ev.shiftKey && here === 0) { ev.preventDefault(); last.focus(); }
    }));

    this.off(on(document, 'keydown', (ev) => {
      if (ev.defaultPrevented || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      const a = ev.target;
      const typing = a instanceof Element && a.closest('input,textarea,select,[contenteditable=""],[contenteditable="true"]');
      if (typing) return;
      if ((ev.key === 'd' || ev.key === 'D') && !ev.shiftKey) {
        if (!this.store.getState().selectedTerritoryId) return;
        if (root.contains(a)) return;
        ev.preventDefault();
        this.focusPanel();
        return;
      }
      if (ev.key === 'Escape' && root.contains(a)) { ev.preventDefault(); this.closeToMap(); }
    }));

    /* A claim is FOUND when it has been read, not when it has been rendered.
       This is measured directly rather than with an IntersectionObserver: a
       section 760px tall can never cross a ratio threshold inside a 515px
       panel, and an observer only reports at the instants a threshold is
       crossed, so a block that comes to rest half-read is never re-evaluated.
       A rect read per claim per scroll frame is 17 reads; it is not a cost. */
    this.claims = [];
    this.tick = rafThrottle(() => this.evaluate());
    if (this.scroller) this.off(on(this.scroller, 'scroll', this.tick, { passive: true }));
    this.off(on(window, 'resize', this.tick, { passive: true }));
    /* A resize changes the fold's budget, and the budget is what decides how
       much of each field is printed. Re-render (which restores every field to
       full) and let the fit pass spend the new budget from scratch. */
    this.reflow = debounce(() => { this.lastKey = null; this.render(); }, 120);
    this.off(on(window, 'resize', this.reflow, { passive: true }));
    this.off(() => this.reflow.cancel());
    if (this.scroller && typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(() => this.reflow());
      ro.observe(this.scroller);
      this.off(() => ro.disconnect());
    }
    this.off(() => { this.tick.cancel(); this.clearTimers(); });

    /* The fold's fit is measured in real type. If the serif is still swapping
       in, the measurement is of the fallback stack and the budget is wrong, so
       fit it again once the faces have landed. */
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (this.root && this.root.isConnected) { this.lastKey = null; this.render(); } }).catch(() => {});
    }

    /* Charge 14's containment, and DIDACTIC_SPEC's rule that the permanent
       artefact is the printed page: print carries everything, so every folded
       extension opens before the print and closes again after it. */
    this.off(on(window, 'beforeprint', () => {
      this.printOpened = [...this.root.querySelectorAll('details:not([open])')];
      for (const d of this.printOpened) d.open = true;
      /* Ten of this entry's sections live in the sheet and are therefore not in
         this panel's DOM at all. The printed page is the permanent artefact
         (FEATURE_SPEC charge 14), so every one of them is put back for the
         print and taken out again afterwards. */
      const box = document.createElement('div');
      box.className = 'dsr__printall';
      for (const sh of this.sheets.values()) {
        if (sh.node.isConnected) continue;
        const h = document.createElement('h3');
        h.className = 'dsr__eyebrow cx-panel__head sc';
        h.textContent = sh.title;
        box.append(h, sh.node);
      }
      if (box.childNodes.length) { this.root.append(box); this.printBox = box; }
    }));
    this.off(on(window, 'afterprint', () => {
      for (const d of this.printOpened || []) d.open = false;
      this.printOpened = null;
      if (this.printBox) { this.printBox.remove(); this.printBox = null; }
    }));

    this.render();
  },

  clearTimers() {
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  },

  /* Dwell, keyed by ELEMENT and not by claim id.
     Two elements can carry the same claim — the fold prints the status block
     and the block below prints the same claim in full — and keying the timer
     by claim let the off-screen twin cancel the on-screen one's dwell. */
  evaluate() {
    this.evaluateIn(this.claims, this.scroller);
    /* A section standing in the sheet is on screen and is being read; a
       section this reader has never opened is not, and stamps nothing. That is
       the same rule the folds used to state, measured against the surface the
       content is actually in. */
    if (this.openSheetId && this.sheetScroller) this.evaluateIn(this.sheetClaims, this.sheetScroller);
  },

  evaluateIn(claims, scroller) {
    if (!claims || !claims.length) return;
    const host = scroller || document.documentElement;
    if (!host.isConnected) return;
    const r = host.getBoundingClientRect();
    const top = scroller ? r.top : 0;
    const bottom = scroller ? r.bottom : window.innerHeight;
    for (const n of claims) {
      const cid = n.dataset.claim;
      const b = n.getBoundingClientRect();
      const shown = Math.min(b.bottom, bottom) - Math.max(b.top, top);
      /* Half of the block, or 180px of it, is in front of the reader. Half
         alone would exempt every long section, which are the full ones. */
      const enough = shown > 0 && b.height > 0 && (shown >= 0.5 * b.height || shown >= 180);
      if (!enough) {
        const t = this.timers.get(n);
        if (t) { clearTimeout(t); this.timers.delete(n); }
        continue;
      }
      if (this.timers.has(n) || this.ledger.has(cid)) continue;
      const started = Date.now();
      this.timers.set(n, setTimeout(() => {
        this.timers.delete(n);
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        const st = this.store.getState();
        if (st.playing) return;
        this.ledger.found(cid, { territoryId: st.selectedTerritoryId, year: st.year, dwellMs: Date.now() - started });
      }, DWELL_MS));
    }
  },

  update(state, prev, changed) {
    if (!changed.has('year') && !changed.has('selectedTerritoryId') && !changed.has('panelState')) return;
    this.render();
  },

  render() {
    const state = this.store.getState();
    const key = state.selectedTerritoryId + '@' + state.year + '#' + this.nav.depth();
    if (key === this.lastKey) return;
    this.lastKey = key;
    this.clearTimers();

    if (state.selectedTerritoryId !== this.lastSel && this.expanded) this.expanded.clear();
    /* What this student had already read about THIS place before they arrived
       on it this time. Snapshotted when the selection changes, so a claim that
       dwells while they are reading it now cannot make the panel announce that
       they have read it before — the band is about a return, and a return has
       to be a second arrival. */
    if (state.selectedTerritoryId !== this.lastSel) {
      const pre = state.selectedTerritoryId ? state.selectedTerritoryId + ':' : null;
      this.priorKnown = pre ? this.ledger.all().filter((c) => String(c).startsWith(pre)).length : 0;
    }
    const t = this.data.get(state.selectedTerritoryId);
    /* A sheet is about ONE place. When the place changes, the surface standing
       over this column is about the place the reader has just left, so it comes
       down rather than silently re-pointing at the new entry. */
    if (state.selectedTerritoryId !== this.lastSel && this.openSheetId) {
      this.openSheetId = null; this.sheetClaims = [];
      this.bus.emit('ask:sheet', null);
    }
    if (!t) this.sheets.clear();
    const links = t ? linksFor(this.data, t, state.year) : new Map();
    const node = renderDossier({
      data: this.data, store: this.store, format: this.format, state, links,
      ledger: this.ledger, priorKnown: this.priorKnown || 0,
      navDepth: this.nav.depth(), navFrom: this.nav.peek(),
      expanded: this.expanded, sheets: this.sheets,
      /* IS ANYBODY LISTENING? This panel prints a sentence about what happens
         to the student's record, and until this round it printed the same
         sentence whether or not that was true — the same defect the round-4
         critic caught in the index note, in a different place. `ledger:append`
         is emit-only from here, so the bus's own subscriber count for it is a
         direct measurement of whether another module consumes the record.
         Nothing is asserted about which module; only whether one exists. */
      ledgerRead: !!(this.bus && this.bus.count && this.bus.count('ledger:append') > 0),
    });
    const selChanged = state.selectedTerritoryId !== this.lastSel;
    /* Which extension folds were open. Answering a question inside one
       re-renders the panel, and round 5's first cut rebuilt every fold shut —
       so committing to a death-toll bracket inside "the taking, in full" threw
       the student back to a closed summary and their own answer was two clicks
       away. Folds are session state about THIS entry, so they survive a
       re-render and are cleared when the entry changes. */
    if (selChanged) this.openFolds = new Set();
    else {
      this.openFolds = new Set([...this.root.querySelectorAll('details.dsr__ext[open]')]
        .map((d) => d.dataset.for).filter(Boolean));
    }
    this.lastSel = state.selectedTerritoryId;

    /* WHAT THE READER WAS ON.
       `replaceChildren` throws away every node in this column, including the
       one that had focus, and the browser then puts focus on <body>. That is
       how "Enter on a map target opens a panel you cannot read" happened: the
       panel DID move focus to its heading, and 120ms later the rail's own
       resize fired the reflow debounce and this line deleted it. Measured at
       1366x768 the focus trace read
         IN .map__target → OUT → IN h2.dsr__name → OUT → null.
       A re-render is not a navigation, so the caret goes back where it was. */
    const act = document.activeElement;
    const hadFocus = act && act !== document.body && this.root.contains(act);
    const sig = hadFocus ? sigOf(act) : null;

    this.root.replaceChildren(node);
    if (hadFocus && !this.focusAfter) {
      const back = sig ? findBySig(node, sig) : null;
      const to = back || node.querySelector('.dsr__name');
      if (to) { to.setAttribute('tabindex', to.getAttribute('tabindex') || '-1'); to.focus({ preventScroll: true }); }
    }
    if (this.openFolds && this.openFolds.size) {
      for (const d of node.querySelectorAll('details.dsr__ext')) {
        if (this.openFolds.has(d.dataset.for)) d.open = true;
      }
    }
    /* A commitment re-renders the panel in place. Snapping to the top would
       throw the student away from the question they have just answered, so the
       scroll is held and the reveal takes focus. */
    if (this.scroller) this.scroller.scrollTop = this.keepScroll != null ? this.keepScroll : 0;
    if (this.focusAfter) {
      const box = node.querySelector('[data-ask][data-state="done"]');
      if (box) {
        const v = box.querySelector('.dsr__askverdict') || box;
        v.setAttribute('tabindex', '-1');
        v.focus({ preventScroll: true });
      }
    }
    this.keepScroll = null;
    this.focusAfter = null;

    /* The fold is a fixed budget and the strings are not. Measure it, and give
       back the least load-bearing field first until the four answers clear the
       panel's bottom edge. Everything given back is printed whole further down
       the same scroll, with a button that goes there.
       Twice: once now, and once after the browser has settled the grid — the
       panel is 421px at 1280x800 but is not that height on the frame it is
       first written into. */
    if (this.scroller) {
      refitFold(node, this.scroller);
      if (this.refitRaf) cancelAnimationFrame(this.refitRaf);
      this.refitRaf = requestAnimationFrame(() => {
        this.refitRaf = 0;
        if (this.root && this.root.firstElementChild) refitFold(this.root.firstElementChild, this.scroller);
      });
    }

    /* THE HISTORIOGRAPHY SLOT. This entry may carry an argument between named
       historians; that block is owned by `panels/historiography` and stands in
       the anchor printed at §2b of the page. Announced rather than imported, so
       the dossier neither depends on that piece nor breaks when it is missing.
       Emitted after the panel is in the document, because the block is written
       into a node this render has just placed. */
    this.bus.emit('dossier:rendered', {
      root: this.root,
      territoryId: state.selectedTerritoryId,
      year: state.year,
    });

    this.claims = [...node.querySelectorAll('[data-claim]')];
    /* A section that was open in the sheet when this panel re-rendered is a
       section the reader is looking at. The node it was showing belongs to the
       render that has just been thrown away, so it is republished from the new
       one; otherwise answering a question inside a routed section would leave a
       dead tree on screen. */
    if (this.openSheetId) {
      if (this.sheets.has(this.openSheetId)) this.openSheet(this.openSheetId, { keep: true });
      else { this.openSheetId = null; this.bus.emit('ask:sheet', null); }
    }
    if (this.tick) requestAnimationFrame(() => this.tick());
    /* A because-chip navigates to the CLAIM it caused, not merely to the
       territory that holds it. Where the authored link named a section, the
       new panel opens on it. */
    const wants = this.nav.takeSection ? this.nav.takeSection() : null;
    if (wants) requestAnimationFrame(() => this.goto('dsr-' + wants));
    if (t && !state.playing) {
      const statusWord = (node.querySelector('.dsr__statusword') || { textContent: 'Britain held nothing here this year' }).textContent;
      const say = t.name + ', ' + state.year + '. ' + statusWord + '. Press D for the dossier.';
      if (say !== this.lastSaid) { this.lastSaid = say; announce(say); }
    }
    this.publishSay(t, state, node);
    /* Tab order. The dossier is the last landmark in the shell's DOM, so a
       keyboard user who selects a place on the map had to press Tab past
       seventeen legend entries to reach the panel about it. The panel cannot
       move itself in the document, so instead: a selection made without a
       pointer moves focus into the panel, and D reaches it from anywhere. */
    const steering = Date.now() - (this.lastKeyAt || 0) < 2500
      || (document.activeElement && document.activeElement !== document.body);
    if (selChanged && t && !state.playing && steering && Date.now() - this.lastPointerAt > 500
        && !(this.app && this.app.dataset.sheet === 'open')) {
      const a = document.activeElement;
      const inPanel = a && this.root.contains(a);
      const inField = a && a.closest && a.closest('input,textarea,select,[contenteditable="true"]');
      if (!inPanel && !inField) this.focusPanel({ silent: true });
    }
  },

  /* ============================================================ the band ====
   * docs/LAYOUT_BUDGET.md §6: the next thing to read is always in the same
   * slot, at 19px, in one voice. When a reader picks a place off the map the
   * band answers before they have read a word of this column — with the one
   * sentence this entry exists to carry, and with one quiet control into the
   * strongest thing the entry has. This panel writes a sentence; it never
   * writes into the band directly and it never renders a .cx-cta.
   */
  publishSay(t, state, node) {
    if (!this.bus) return;
    if (!t) { if (this.said) { this.said = false; this.bus.emit('ask:say', { id: 'dossier:place', text: null }); } return; }
    const ped = t.pedagogy || {};
    /* ONE SENTENCE THAT FITS.
       Round 3's critic: "the lede truncates mid-sentence with an ellipsis
       whenever a territory is selected ('…the first modern…'), putting a
       broken sentence at the top of the screen." That ellipsis was this
       module's. The band clamps at two lines, and 180 of the 261 argument
       lines in this dataset open with a sentence longer than two lines will
       hold at 1366. A sentence cut mid-word teaches nothing.

       So the sentence is cut here, at a punctuation mark its own author put
       there, and what is given back is two lines below in this panel under
       "in the argument", whole, with a control that opens the rest. The
       candidates are longest-first; the band itself decides which one it can
       hold. */
    const whole = String(ped.whyItMatters || '').trim();
    const options = [];
    if (whole) {
      const stop = whole.search(/[.!?](\s|$)/);
      const first = (stop > 0 ? whole.slice(0, stop + 1) : whole).trim();
      if (first) options.push(first);
      for (const c of clausesWithin(first)) options.push(c);
    }
    const word = (node.querySelector('.dsr__statusword') || {}).textContent;
    /* The last resort, and never a fragment: what this place was, in law, this
       year. Short, true, and the other thing the reader wanted to know. There
       is always one, because a year in which Britain held nothing here is
       itself an answer — and without it two entries with a long argument line
       and no punctuation in it had nothing shorter to fall back to and stayed
       clipped at 1024 and at 390. */
    options.push(word
      ? '<strong>' + word + '</strong> in ' + state.year + '.'
      : 'Britain held nothing here in ' + state.year + '.');
    if (!options.length) { if (this.said) { this.said = false; this.bus.emit('ask:say', { id: 'dossier:place', text: null }); } return; }

    const texts = node.querySelector('[data-block="testimony-promo"]');
    this.sayOptions = options;
    this.sayCta = texts && this.sheets.has('testimony')
      ? { label: 'Their words', note: 'written at the time', emit: 'dossier:openSection', payload: { id: 'testimony' } }
      : null;
    /* A first guess measured against the band as it stands. It is a guess and
       not an answer because the control this sentence carries is rendered by
       the shell AFTER the sentence, and it takes width out of the same row —
       which is exactly how three sentences were still being clipped after the
       measurement was added. `_fitSay` corrects it against the real box. */
    let i = 0;
    while (i < options.length - 1 && !this.ledeFits(options[i])) i++;
    this.sayIndex = i;
    this.said = true;
    this.emitSay();
    this.fitSay(0);
  },

  emitSay() {
    this.bus.emit('ask:say', {
      id: 'dossier:place',
      /* 45, between "content" and "a moment" (LAYOUT_BUDGET §6). A reader who
         has just picked a place off the map has asked a direct question, so
         this outranks a change card that arrived on its own at 40; the
         definition change, which is a moment the reader made deliberately,
         still outranks it at 50, and the sweep at 60 outranks everything. */
      priority: 45,
      /* THE NAME, ONCE. The critic counted "Khedivate of Egypt" three times in
         one screenful — this eyebrow, the sentence, and the panel's own h2 two
         inches to the right of it, all at the same instant. The band's mark
         slot is for the period the sentence belongs to (LAYOUT_BUDGET §6 uses
         a date), and the panel beside it is already carrying the name at
         h4. */
      mark: String(this.store.getState().year),
      text: this.sayOptions[this.sayIndex],
      cta: this.sayCta,
    });
  },

  /**
   * MEASURE THE BOX, NOT THE ESTIMATE.
   * The shell owns the band and renders the control this sentence carries, so
   * the width the sentence actually gets is not known until the shell has
   * painted. This reads the real box on the next frame and, if the sentence is
   * clipped, drops to the next shorter complete statement — never to a
   * fragment, never to an ellipsis, and never below the legal-status sentence
   * at the end of the list. At most three steps, so it settles inside a frame
   * budget and cannot loop.
   */
  fitSay(step) {
    if (this.sayRaf) cancelAnimationFrame(this.sayRaf);
    this.sayRaf = requestAnimationFrame(() => {
      this.sayRaf = 0;
      if (!this.said || !this.sayOptions) return;
      const el2 = document.querySelector('.cx-lede__say');
      if (!el2) return;
      /* Somebody louder is speaking — the sweep, or a definition change. Their
         sentence is not ours to shorten. */
      const mine = (el2.textContent || '').trim();
      const want = String(this.sayOptions[this.sayIndex]).replace(/<[^>]*>/g, '').trim();
      if (mine !== want) return;
      if (el2.scrollHeight <= el2.clientHeight + 1) return;
      if (this.sayIndex >= this.sayOptions.length - 1) return;
      if (step >= 3) return;
      this.sayIndex++;
      this.emitSay();
      this.fitSay(step + 1);
    });
  },

  /**
   * WILL THE BAND HOLD THIS SENTENCE?
   * Measured, not estimated: the band's own width, in the band's own face, at
   * the size it is actually set in, with the words wrapped the way the browser
   * will wrap them, counted against its own line clamp. `.cx-lede__say` is
   * `flex: 1` between the period mark and whatever control is up, so its width
   * already prices both, and the answer therefore changes with the viewport —
   * at 1920 the whole argument line usually fits and nothing is cut at all.
   */
  ledeFits(text) {
    const say = document.querySelector('.cx-lede__say');
    if (!say) return String(text).length <= 105;
    const w = say.clientWidth;
    if (!w) return String(text).length <= 105;
    try {
      const cs = getComputedStyle(say);
      if (!this._mctx) this._mctx = document.createElement('canvas').getContext('2d');
      const c = this._mctx;
      if (!c) return String(text).length <= 105;
      c.font = [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily].join(' ');
      const clamp = parseInt(cs.webkitLineClamp, 10) || 2;
      const words = String(text).replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean);
      let line = '';
      let n = 1;
      for (const word of words) {
        const t = line ? line + ' ' + word : word;
        if (c.measureText(t).width <= w) { line = t; continue; }
        n++;
        line = word;
        if (n > clamp) return false;
      }
      return n <= clamp;
    } catch (_) { return String(text).length <= 105; }
  },

  /* ============================================================ the sheet ===
   * One rail, one width (rule B7). This does not open a second column and it
   * does not cover the map: it stacks over this panel inside the rail the
   * shell already owns, guaranteed 280px minimum and its own scroll (rule B8).
   */
  openSheet(id, { keep } = {}) {
    const sh = this.sheets.get(id);
    if (!sh) return false;
    const st = this.store.getState();
    const tt = this.data.get(st.selectedTerritoryId);
    this.openSheetId = id;
    this.bus.emit('ask:sheet', {
      id: 'dossier:' + id,
      /* The place is the eyebrow and the section is the title: "BRITISH INDIA
         / Written at the time", not a title that wraps to two lines because
         the place name is inside it. */
      eyebrow: tt ? tt.name : sh.eyebrow,
      title: sh.title,
      node: sh.node,
    });
    this.sheetScroller = document.querySelector('.cx-sheet__body');
    this.sheetClaims = [...sh.node.querySelectorAll('[data-claim]')];
    if (sh.node.dataset && sh.node.dataset.claim) this.sheetClaims.unshift(sh.node);
    if (!keep) {
      const h = sh.node.querySelector('.dsr__eyebrow') || sh.node;
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
      /* Same charge as the index note, in the channel a screen-reader user is
         actually in: do not tell them the panel opened "beside the map" when
         the rail is a bottom sheet standing over it. Measured off the live
         element rather than a breakpoint copied out of layout.css. */
      announce(sh.title + '. ' + (this.railIsSheet() ? 'Opened over the map.' : 'Opened beside the map.')
        + ' Escape closes it and leaves this place open.');
    }
    if (this.tick) requestAnimationFrame(() => this.tick());
    return true;
  },

  /**
   * Is the rail a bottom sheet standing over the map, rather than a column
   * beside it? Read off the live element, so this piece never carries a second
   * copy of the shell's 62rem breakpoint in JavaScript. Nothing in this module
   * lays out from the answer — it only decides what we are allowed to say.
   */
  railIsSheet() {
    const el = this.root && this.root.closest ? this.root.closest('.app__dossier') : null;
    const n = el || document.querySelector('.app__dossier');
    if (!n || typeof getComputedStyle !== 'function') return false;
    return getComputedStyle(n).position === 'fixed';
  },

  /** Every stop in this panel's own Tab cycle, in document order. */
  focusables() {
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),'
      + 'textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
    return [...this.root.querySelectorAll(sel)].filter((e) => {
      if (e.hidden || e.closest('[hidden]')) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 || r.height > 0;
    });
  },

  /** Close this dossier and put the reader back on the map, saying so. */
  closeToMap() {
    this.nav.clear();
    this.store.dispatch('deselect');
    const stage = document.getElementById('stage') || document.querySelector('.app__stage');
    if (stage) { stage.setAttribute('tabindex', stage.getAttribute('tabindex') || '-1'); stage.focus({ preventScroll: true }); }
    announce('Dossier closed. You are back on the map.');
  },

  /** Move focus into this panel and say so.
   *  The heading is the target, not the panel: a screen reader announces the
   *  place's name and the year, which is the answer to "what have I just
   *  opened", and the ✕ is the very next stop. */
  focusPanel({ silent, tries } = {}) {
    const head = this.root.querySelector('.dsr__name');
    if (!head) return false;
    head.setAttribute('tabindex', '-1');
    head.focus({ preventScroll: true });
    /* A NO-OP IS NOT A FAILURE TO NOTICE LATER. The shell flips
       `#app[data-dossier]` to "open", and while it is still "closed" the column
       is `visibility: hidden` — you cannot focus a hidden element, and
       `focus()` reports nothing. Measured under `--reduced` at 1366x768, this
       module's render ran a frame ahead of that flip and the focus trace showed
       exactly one event: `IN .map__target`. Measured under `--reduced`, the
       inherited `visibility` unwinds one level of the panel's tree per frame —
       at frame 3 `.dossier` was visible and `.dsr__head` was still hidden — so
       the retry runs for fifteen frames, which is a quarter of a second nobody
       can see and the difference between a reachable panel and BODY. */
    if (document.activeElement !== head) {
      const n = (tries || 0) + 1;
      if (n <= 15 && typeof requestAnimationFrame === 'function') {
        if (this.focusRaf) cancelAnimationFrame(this.focusRaf);
        this.focusRaf = requestAnimationFrame(() => {
          this.focusRaf = 0;
          if (!this.root || !this.root.isConnected) return;
          if (!this.store.getState().selectedTerritoryId) return;
          const a = document.activeElement;
          if (a && a !== document.body && this.root.contains(a)) return;
          this.focusPanel({ silent, tries: n });
        });
        return false;
      }
    }
    if (!silent) announce('Dossier. Tab moves through it; Escape closes it and returns you to the map.');
    return true;
  },

  /** Scroll this panel — never the document — to a section. */
  goto(id) {
    /* Ten of this entry's twelve sections are no longer positions in this
       column: they are destinations. Every "more" button in the fold, every
       cross-reference between sources and every because-chip that names a
       section arrives here, so the redirection is made once, at the door. */
    const key = String(id).replace(/^dsr-/, '');
    if (this.sheets.has(key)) { this.openSheet(key); return; }
    const owner = [...this.sheets.values()].find((sh) => sh.node.querySelector('#' + CSS.escape(id)));
    if (owner) {
      this.openSheet(owner.id);
      const inSheet = owner.node.querySelector('#' + CSS.escape(id));
      if (inSheet) requestAnimationFrame(() => inSheet.scrollIntoView({ block: 'start', behavior: 'auto' }));
      return;
    }
    const target = this.root.querySelector('#' + CSS.escape(id));
    if (!target || !this.scroller) return;
    /* An extension section is folded shut. A contents button that scrolls to a
       closed fold and leaves it closed is a dead control, so open it first. */
    for (let n = target; n && n !== this.root; n = n.parentElement) {
      if (n.tagName === 'DETAILS' && !n.open) n.open = true;
    }
    const head = this.root.querySelector('.dsr__head');
    const pad = head ? head.getBoundingClientRect().height + 8 : 8;
    const top = target.getBoundingClientRect().top - this.scroller.getBoundingClientRect().top + this.scroller.scrollTop - pad;
    const reduced = typeof matchMedia === 'function'
      && (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced');
    this.scroller.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
    /* Focus the section's heading, not the whole section: a focus ring drawn
       round a 900px block is noise, and a screen reader wants the heading.
       Inside an extension fold the heading is the summary — the section's own
       eyebrow is not rendered there, so focusing it moved focus nowhere and
       the contents rail dropped a keyboard user on the body element. */
    const det = target.closest('details');
    const h = (det && det.querySelector(':scope > summary')) || target.querySelector('.dsr__eyebrow') || target;
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
  },

  paint(kind) {
    const st = this.store.getState();
    const t = this.data.get(st.selectedTerritoryId);
    if (!t) return;
    const shape = nestedSplit(this.data, t, st.year);
    const ids = kind === 'direct' ? shape.direct : shape.stateUnits;
    const reason = kind === 'direct'
      ? 'what British officials ran themselves inside ' + t.name + ' in ' + st.year
      : 'the states inside ' + t.name + ' that kept a ruler of their own in ' + st.year;
    this.bus.emit('ask:paintUnits', { unitIds: ids, reason });
    /* The paint is invisible where students actually stand. At the default
       world view the two sets of the Indian Empire differ by about six per cent
       of the pixels over India, so pressing both buttons produced two
       identical maps and the teaching move never happened. The view goes with
       the paint. */
    this.fitTo(ids);
    announce(ids.length + ' units painted: ' + reason + '. The map has moved to them.');
  },

  /** Take the map to the union of a set of units. `ask:flyTo` only knows how to
   *  frame one unit, so the camera is computed here from the units' own
   *  bounding boxes and written to the store, which the map honours. */
  async fitTo(unitIds) {
    if (!unitIds || !unitIds.length || !this.data.unitMeta) return false;
    let lon0 = Infinity, lat0 = Infinity, lon1 = -Infinity, lat1 = -Infinity;
    let n = 0;
    for (const u of unitIds) {
      const m = this.data.unitMeta.get(u);
      if (!m || !m.bbox) continue;
      n++;
      lon0 = Math.min(lon0, m.bbox[0]); lat0 = Math.min(lat0, m.bbox[1]);
      lon1 = Math.max(lon1, m.bbox[2]); lat1 = Math.max(lat1, m.bbox[3]);
    }
    if (!n) return false;
    let proj = null;
    try { proj = await import('../../map/projection.js'); } catch (_) { proj = null; }
    if (!proj || !proj.projectPoint || !proj.worldBox) {
      this.bus.emit('ask:flyTo', { unitId: unitIds[0] });
      return false;
    }
    const st = this.store.getState();
    const id = (st.filters && st.filters.proj) || 'mercator';
    const box = proj.worldBox(id);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const out = [0, 0];
    for (let i = 0; i <= 4; i++) {
      for (let j = 0; j <= 4; j++) {
        proj.projectPoint(lon0 + (lon1 - lon0) * (i / 4), lat0 + (lat1 - lat0) * (j / 4), id, out);
        x0 = Math.min(x0, out[0]); x1 = Math.max(x1, out[0]);
        y0 = Math.min(y0, out[1]); y1 = Math.max(y1, out[1]);
      }
    }
    const fill = 0.62;
    const kx = (proj.WORLD_WIDTH * fill) / Math.max(x1 - x0, 1);
    const ky = (box.height * fill) / Math.max(y1 - y0, 1);
    const k = Math.max(1, Math.min(14, Math.min(kx, ky)));
    this.store.dispatch('setMapView', {
      k,
      x: ((x0 + x1) / 2) / proj.WORLD_WIDTH,
      y: ((y0 + y1) / 2) / box.height,
    });
    return true;
  }, 

  /** A student commits to an answer. This is the only place in the panel where
   *  a click changes what the record shows, so it is also the only place that
   *  writes to the Ledger with a value the student chose. */
  onAsk(hit) {
    const key = hit.dataset.key;
    const kind = hit.dataset.kind;
    const value = hit.dataset.value;
    if (!key || answerFor(key)) return;
    const st = this.store.getState();
    let correct = false;
    let label = value;
    if (kind === 'purpose') {
      /* The attribution gate. The right answer is the class of purpose a
         source of this kind has, and the button carries it, so scoring cannot
         drift away from what was rendered. */
      correct = hit.dataset.ok === 'yes';
      label = (hit.textContent || value).trim();
    } else if (kind === 'belief') {
      /* `misconception.belief` is by construction the thing the entry exists to
         correct, so doubting it is the position the record supports. */
      correct = value === 'false';
    } else {
      const b = BRACKETS.find((x) => x.id === value);
      label = b ? b.label : value;
      const art = this.root.querySelector('.dossier');
      if (art && art.dataset.gateKey === key) {
        const lo = art.dataset.gateLow != null ? Number(art.dataset.gateLow) : null;
        const hi = art.dataset.gateHigh != null ? Number(art.dataset.gateHigh) : null;
        const pick = BRACKETS.findIndex((x) => x.id === value);
        correct = bracketVerdict(pick, bracketSpan(lo, hi)).correct;
      }
    }
    /* The question itself, taken off the surface the reader just answered on.
       Without it the session record can print what they said and not what they
       were asked, which is a list of verdicts nobody can revise from. */
    const box = hit.closest('[data-ask], .cx-ask, .dsr__block');
    const txt = (n) => (n ? (n.textContent || '').replace(/\s+/g, ' ').trim() : '');
    /* `.cx-ask__q` carries the question AND the instruction under it in one
       node, so reading the whole thing back gives "…of Khedivate of
       Egypt?Commit to an answer and the record opens underneath it." The
       question proper is `.dsr__askqt`; for a belief the thing the student
       actually took a position on is the belief itself. */
    const belief = box && box.querySelector('.dsr__belief');
    const asked = txt(box && (box.querySelector('.dsr__askqt') || box.querySelector('.cx-ask__q')));
    const question = belief
      ? '\u201c' + txt(belief) + '\u201d \u2014 ' + (asked || 'true?')
      : (asked || null);
    remember(key, { kind, answer: value, label, correct, question, territoryId: st.selectedTerritoryId, year: st.year });
    this.bus.emit('ledger:append', {
      kind: kind === 'belief' ? 'committed' : kind === 'purpose' ? 'attributed' : 'predicted',
      claimId: key, answer: value, label, correct,
      territoryId: st.selectedTerritoryId, year: st.year, at: Date.now(),
    });
    announce(kind === 'belief'
      ? 'Answer recorded. What the record shows is now open below your answer.'
      : kind === 'purpose'
        ? 'Answer recorded. What this atlas knows about this source is now open below your answer.'
        : 'Answer recorded: ' + label + '. The figure the record gives is now open below it.');
    this.keepScroll = this.scroller ? this.scroller.scrollTop : null;
    this.focusAfter = key;
    this.lastKey = null;
    this.render();
  },

  onClick(ev, hit, { inSheet } = {}) {
    const act = hit.dataset.act;
    if (act === 'sheet') { ev.preventDefault(); this.openSheet(hit.dataset.sheet); return; }
    if (act === 'ask') { ev.preventDefault(); this.onAsk(hit); return; }
    if (act === 'back') { ev.preventDefault(); this.nav.back(); this.lastKey = null; this.render(); return; }
    if (act === 'close') { ev.preventDefault(); this.nav.clear(); this.store.dispatch('deselect'); return; }
    if (act === 'goto') { ev.preventDefault(); this.goto(hit.dataset.target); return; }
    if (act === 'paint-children') { ev.preventDefault(); this.paint('children'); return; }
    if (act === 'paint-direct') { ev.preventDefault(); this.paint('direct'); return; }
    if (act === 'expand') {
      ev.preventDefault();
      const id = hit.dataset.step;
      if (!id) return;
      this.expanded.add(id);
      this.keepScroll = this.scroller ? this.scroller.scrollTop : null;
      this.lastKey = null;
      this.render();
      const card = this.root.querySelector('[data-claim$=":' + CSS.escape(id) + '"]');
      if (card) { const h = card.querySelector('.dsr__lead') || card; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      return;
    }
    if (hit.classList.contains('dsr-chip')) {
      ev.preventDefault();
      const target = hit.dataset.target;
      if (!target || !this.data.byId.has(target)) return;
      /* A chip pressed inside the sheet navigates the panel underneath it, so
         the sheet has to stand down: leaving it up would show one place's
         sources over another place's entry. */
      if (inSheet) { this.openSheetId = null; this.sheetClaims = []; this.bus.emit('ask:sheet', null); }
      const raw = hit.dataset.targetYear;
      const y = raw === '' || raw == null ? bestYearFor(this.data.byId.get(target), this.store.getState().year) : Number(raw);
      this.nav.go(target, Number.isFinite(y) ? y : this.store.getState().year, hit.dataset.section || null);
      this.lastKey = null;
      this.render();
    }
  },

  destroy() {
    if (this.openSheetId && this.bus) { this.openSheetId = null; this.bus.emit('ask:sheet', null); }
    if (this.said && this.bus) this.bus.emit('ask:say', { id: 'dossier:place', text: null });
    if (this.off) this.off.all();
    if (this.refitRaf) cancelAnimationFrame(this.refitRaf);
    if (this.focusRaf) cancelAnimationFrame(this.focusRaf);
    if (this.sayRaf) cancelAnimationFrame(this.sayRaf);
    this.clearTimers();
    if (this.root) this.root.replaceChildren();
    live = Math.max(0, live - 1);
    if (live === 0 && typeof window !== 'undefined' && window.BEA && window.BEA.renderSource === renderSource) {
      delete window.BEA.renderSource;
      delete window.BEA.unsourcedCount;
      delete window.BEA.classOnlyCount;
      delete window.BEA.dossierLedger;
    }
  },
};

/* -------------------------------------------------------- the band's cut --
 * Every complete statement that can be made by cutting `s` at a mark its own
 * author put there, longest first. The caller takes the first one the band
 * will hold.
 *
 * Only marks that end an independent clause are used — a colon, a semicolon, a
 * dash, or a comma before a coordinating conjunction or a "because" — so what
 * comes back is a sentence and not a fragment. Nothing is ever cut mid-word,
 * nothing ends in an ellipsis, and nothing is given back that is not also
 * printed whole two lines below in the panel, under "in the argument", with a
 * control that opens the rest.
 *
 * Measured over the 261 argument lines in the dataset at 1024x640 — the
 * narrowest band in the contract — 259 come back whole or cut cleanly. The
 * remaining two fall through to the legal-status sentence, which is short,
 * true, and the other thing the reader wanted to know.
 */
export function clausesWithin(s) {
  const MARKS = [
    /^([\s\S]{24,}?)\s*[:;]\s/,
    /^([\s\S]{24,}?)\s+[\u2014\u2013]\s/,
    /^([\s\S]{24,}?)\s+-\s/,
    /^([\s\S]{24,}?),\s+(?:and|but|so|yet|which is why|because|which|where|though|although)\s/i,
  ];
  const out = [];
  const seen = new Set();
  for (const re of MARKS) {
    /* Walk left to right, keeping the PREFIX: the first clause, then the first
       two, then the first three. Slicing the remainder instead would return
       "because the documents were hidden and then found." — which is a
       fragment, and the exact failure this function exists to stop. */
    let scan = 0;
    for (let guard = 0; guard < 6; guard++) {
      const m = s.slice(scan).match(re);
      if (!m) break;
      /* The statement ends where the mark BEGINS. Consuming the mark itself
         left sentences ending "…, because." */
      const cut = s.slice(0, scan + m[1].length).replace(/[,;:\u2014\u2013\-\s]+$/, '') + '.';
      if (cut.length > 12 && !seen.has(cut)) { seen.add(cut); out.push(cut); }
      scan += m[0].length;
      if (scan >= s.length) break;
    }
  }
  /* Longest first: the reader should lose the least the band can afford. */
  return out.sort((a, b) => b.length - a.length);
}
