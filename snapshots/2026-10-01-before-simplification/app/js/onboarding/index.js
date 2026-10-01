/**
 * onboarding/index.js — P15. THE FIRST RUN.
 *
 * Second zero is spent on the history, not on the interface. There is no
 * welcome modal, no coach mark, no interface tour, no cookie banner, no sign-in
 * and no "explore freely" landing. There is ONE sentence, at reading size, in
 * the band every other piece of this app also speaks through, and ONE control
 * beside it. The escape — "I'll explore on my own" — is on the first screen,
 * warns nothing and blocks nothing.
 *
 * WHY THE BAND AND NOT A PANEL. LAYOUT_BUDGET §3 fixes nineteen controls and
 * one sentence at `data-stage="plate"`, and rule B2 gives the plate a floor it
 * only holds with the rail closed. An onboarding panel at second zero would
 * take 410px out of the map to tell the reader that the map matters. So the
 * first run costs the budget one sentence and one quiet control, and the first
 * thing that opens the rail is the student's own answer to a question.
 *
 * A RETURNING VISITOR is offered their previous position and what they got
 * wrong, and declining costs nothing: the escape is in the same place it was.
 *
 * Slot: `overlay` — and it renders nothing into it. Its two controls are the
 * band's one control and one `tours:aux` offer in the masthead bar.
 * Emits: onboarding:ready · tours:start · tours:goBeat
 */

import { el, disposer } from '../core/util.js';
import { getLedger } from '../close/ledger.js';

const CSS = new URL('../../css/tours.css', import.meta.url);

/* The opening sentence. It is a stance and a task in one breath: what this
   object is (a poster), what is wrong with it (three things), and how long it
   takes to find out. DIDACTIC_SPEC §8, 00:00, minus the words that do not fit
   at nineteen pixels. */
/* ONE DURATION CLAIM, IN ONE PLACE, AND IT IS THE PATH'S OWN ARITHMETIC.
   This line used to end "in half an hour" while the control beside it said
   "30 minutes", and the lesson's own authored budget is longer than either.
   DIDACTIC_SPEC §8 is *called* the thirty-minute lesson; that is the name of a
   plan, not a measurement of this build, and the app spends its whole length
   telling students to distrust a confident round number with no provenance.
   So the sentence takes the number from P05's own beats, rounded to five
   minutes because that is the precision the estimate actually has, and says
   nothing at all about time if the number has not arrived. */
/* WAVE 10 — THE PROMISE IS THE ROUTE'S, NOT THIS FILE'S.
   This constant said "You will find all three" while the default route is
   Lesson One, which answers two of the three; and the control beside it said
   "Start the lesson", which DIDACTIC_SPEC §8.5 bans by name along with a bare
   duration. Both are now read off `tours:ready`'s `door` block, computed by
   `tours/budget.js::doorSay` from the beats each route actually walks — see
   §8 LESSON ONE beat 1, in bold: "the promise must match the lesson."
   This literal survives only as the fallback for a build with no tours
   module, and it promises nothing it cannot count. */
const OPENING = (mins) => '<strong>A poster, not a description.</strong> Three things about this map mislead. '
  + (mins ? 'This lesson takes about ' + mins + ' minutes.' : '');

export default {
  id: 'onboarding',
  /* No chrome of its own. `chrome-end` belongs to the teaching desk and the
     masthead already has one bar; the first run's two offers — the way out and
     the three things you got wrong — are handed to that bar as `tours:aux`. */
  slot: 'overlay',

  async mount(ctx) {
    this.ctx = ctx;
    this.d = disposer();
    const { util, bus, store } = ctx;
    await util.loadCss(CSS);

    this.ledger = getLedger(bus);
    this.started = false;
    this.left = false;
    /* WHAT THE OPENING CONTROL PROMISES HAS TO BE TRUE.
       It said "30 minutes" because DIDACTIC_SPEC §8 is called the thirty-minute
       lesson. The path's own authored budget is longer than that, and this app
       spends its whole length insisting that a confident round number with no
       provenance is the thing to distrust. So the promise is now the path's own
       arithmetic, published by P05 at `tours:ready`, and it says "about". If
       the number never arrives the control simply carries no promise, which is
       better than carrying a wrong one. */
    this.minutes = null;
    this.door = null;
    this.d(bus.on('tours:ready', (p) => {
      /* The whole first screen, computed by the piece that owns the route. */
      const was = JSON.stringify([this.minutes, this.door]);
      if (p && p.door && p.door.text) this.door = p.door;
      const m = p && Number(p.minutes);
      if (Number.isFinite(m) && m > 0) this.minutes = Math.max(5, Math.round(m / 5) * 5);
      if (was !== JSON.stringify([this.minutes, this.door]) && !this.started && !this.left) this._say();
    }));

    this.d(bus.on('tours:beat', () => { this.started = true; this._paint(); }));
    this.d(bus.on('tours:state', (p) => { this.started = !!(p && p.running); this._paint(); }));
    this.d(bus.on('onboarding:leave', () => this._leave()));
    this.d(bus.on('onboarding:rejoin', () => { this.left = false; }));
    this.d(bus.on('onboarding:due', () => this._openDue()));

    /* The band belongs to the shell and it re-states its own sentence whenever
       the year or the filters change. Ours sits above it at priority 30 — high
       enough to be the opening line, low enough that a beat (55) or the
       definition switch (50) takes it away the moment either has something to
       say. */
    this._say();
    this.d(store.subscribe((s, prev, changed) => {
      if (this.started || this.left) return;
      if (changed.has('year') || changed.has('filters')) this._say();
    }));

    this._paint();
    bus.emit('onboarding:ready', { returning: this._resumePoint() != null });
  },

  destroy() { if (this.d) this.d.all(); },

  /* ---------------------------------------------------------------- */

  _resumePoint() {
    const done = this.ledger.beatsDone();
    if (!done.length) return null;
    return done[done.length - 1];
  },

  _say() {
    const { bus, store } = this.ctx;
    const back = this._resumePoint();
    if (back) {
      bus.emit('ask:say', {
        id: 'onboarding:hook', priority: 30,
        mark: 'welcome back',
        text: 'You stopped part way through. <strong>' + this.ledger.count() + ' things</strong> you committed to are still on the record.',
        cta: { label: 'Pick up where you left off', emit: 'tours:goBeat', payload: { id: back } },
      });
      return;
    }
    const door = this.door;
    bus.emit('ask:say', {
      id: 'onboarding:hook', priority: 30,
      mark: String(store.getState().year),
      text: door ? door.text : OPENING(this.minutes),
      cta: {
        label: door ? door.cta : 'Start the lesson',
        note: door ? door.note : (this.minutes ? this.minutes + ' minutes' : null),
        emit: 'tours:start', payload: {},
      },
    });
  },

  _paint() {
    const { bus } = this.ctx;
    if (this.started) {
      bus.emit('ask:say', { id: 'onboarding:hook', text: null });
      bus.emit('tours:aux', null);
      return;
    }
    const wrong = this._due();
    bus.emit('tours:aux', wrong.length
      ? { id: 'due', label: wrong.length + ' you got wrong \u2192', emit: 'onboarding:due' }
      : null);
  },

  /* Warns nothing, blocks nothing, changes nothing on the map. It takes our
     sentence out of the band and puts the shell's own back, and the way in is
     left in exactly the same place it was. */
  _leave() {
    this.left = true;
    this.ctx.bus.emit('ask:say', { id: 'onboarding:hook', text: null });
    this.ctx.util.announce('Exploring on your own. The lesson is one press away, in the masthead.');
  },

  /** Up to three things this student got wrong, offered and never insisted on. */
  _due() {
    return this.ledger.all().filter((e) => e.verdict === 'corrected' && e.youSaid).slice(-3);
  },

  _openDue() {
    const { bus, store } = this.ctx;
    const list = el('div.ob-due');
    list.append(el('p.cx-note', { text: 'What you committed to and the atlas contradicted. Each one goes back to the year it happened.' }));
    for (const e of this._due()) {
      list.append(el('div.ob-due__row',
        el('p.ob-due__said', el('span.ob-due__lab', { text: 'you said ' }), el('strong', { text: e.youSaid })),
        e.answer ? el('p.ob-due__ans', { text: 'the atlas: ' + e.answer }) : null,
        el('button.cx-more', {
          type: 'button', text: 'Go back to it',
          onclick: () => {
            if (Number.isFinite(e.year)) store.dispatch('setYear', e.year);
            if (e.beatId) bus.emit('tours:goBeat', { id: e.beatId });
          },
        })));
    }
    bus.emit('ask:sheet', { id: 'onboarding:due', eyebrow: 'from your last visit', title: 'Three you got wrong', node: list });
  },
};
