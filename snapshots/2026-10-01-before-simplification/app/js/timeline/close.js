/* timeline/close.js — THE ENDING.

   Round 2's verdict on this piece, verbatim: "Reaching 1997 currently yields a
   good payoff line and a contested-dates register, but no close: no 'what is
   still British, what is still disputed', no through-line sentence to complete,
   nothing to take away. This is the C5 hole and the timeline owns the last
   beat."

   Correct. The coursebook's charge 2 is that a chapter ends and an explorable
   map does not, so nothing lands, and DIDACTIC_SPEC §8's last beat
   (00:29-00:30) is written out in full: "1997 fades and fourteen dots remain.
   Three sentences: what is still British, what is still disputed, what was
   settled recently and by whom. Then the through-line sentence from §2.3 with
   four blanks — the student completes it."

   Not one word of it needed writing. Every territory in this dataset that is
   still British carries a `stillBritish` object — `statusToday`, a note, a
   population with its year, and `disputedWith` where somebody else claims it —
   and until now nothing in the application rendered it. Nine events are dated
   1997 or later, from the handover to the Chagos treaty of 22 May 2025. The
   arguments at the end are the dataset's own `contested` notes, printed whole,
   with the dataset's own sources under them.

   Where it lives: the sheet. 410x716 with its own scroll, beside a live map
   (LAYOUT_BUDGET B7, B8). The time bar is 140px and the ending is not a
   stratum of it; the bar carries one `.cx-more` that reaches this, and the band
   says one sentence of it when the record runs out.

   What it must not do: mark the student. There is no right answer to the
   through-line and this module never claims there is. It prints what they
   wrote, and beside it the sentence this atlas would write, and leaves the
   comparison to them. That is hypercorrection, not scoring. */

import { el } from '../core/util.js';

/* This session only, like predict.js. No storage is opened behind P12/P19/P20's
   metrics schema, and nothing goes to a network. */
const record = new Map();
export function closeAnswer(key) { return record.get(key) || null; }
export function closeAsked(key) { return record.has(key); }
export function resetClose() { record.clear(); }

/* ------------------------------------------------------------ the data -- */

/* Plain words for the dataset's status codes. The dataset's own vocabulary is
   correct and unreadable; a fifteen-year-old needs the sentence, not the enum. */
const TODAY = {
  'british-overseas-territory': 'a British Overseas Territory',
  'disputed': 'a British Overseas Territory that another state claims',
  'sovereign-base-area': 'a Sovereign Base Area — British soil run by the Ministry of Defence',
  'antarctic-claim': 'a claim in Antarctica, suspended rather than settled',
  'crown-dependency': 'a Crown dependency — self-governing, and not part of the United Kingdom',
  'part-of-uk': 'part of the United Kingdom',
};
const ORDER = ['british-overseas-territory', 'sovereign-base-area', 'antarctic-claim', 'crown-dependency', 'part-of-uk'];
const GROUP_HEAD = {
  'british-overseas-territory': 'British Overseas Territories',
  'sovereign-base-area': 'Sovereign Base Areas',
  'antarctic-claim': 'The Antarctic claim',
  'crown-dependency': 'Crown dependencies',
  'part-of-uk': 'The United Kingdom itself',
};
/* The dataset files the Falklands and South Georgia under `disputed` and
   Gibraltar, the Chagos and the Antarctic claim under their ordinary status,
   although all five are claimed by another state. Grouping on the status word
   therefore printed "claimed by somebody else · 2" three lines under a figure
   reading "5 of them claimed by another state" — one screen contradicting
   itself. The claim is a property of a place, not a category of place: it is
   printed on every row that has one, and the two `disputed` places group with
   the other twelve overseas territories, which is what they are. Fourteen. */
const groupKey = (k) => (k === 'disputed' ? 'british-overseas-territory' : k);
const plainToday = (k) => TODAY[k] || String(k || '').replace(/-/g, ' ');
/* `disputedWith` is a sentence for the Antarctic claim and a word everywhere
   else. On a row it has to be a word; the sentence is printed whole one press
   below, where there is room for it. */
function shortClaim(t) {
  const s = String(t || '').trim();
  if (s.length <= 34) return s;
  const cut = s.search(/[,;]|\s—\s/);
  return (cut > 0 ? s.slice(0, cut) : s.slice(0, 32)) + ', and others';
}

/**
 * Everything this atlas still holds, at the last year it covers. Read off
 * `territory.stillBritish`, which the dataset carries for exactly these places
 * and which nothing in the application rendered before this pass.
 */
export function residue(data) {
  const max = data.bounds.max;
  const places = [];
  for (const t of data.territories) {
    const sb = t.stillBritish;
    if (!sb || !sb.statusToday) continue;
    const s = data.territoryAt(t.id, max);
    if (!s || !s.status || s.status === 'not-british') continue;
    places.push({
      id: t.id,
      name: t.name,
      today: sb.statusToday,
      note: sb.note || '',
      population: Number.isFinite(sb.population) ? sb.population : null,
      populationYear: sb.populationYear || null,
      disputedWith: sb.disputedWith || null,
      units: (sb.units || []).length || (t.units || []).length,
      contested: (t.contested && t.contested.isContested && t.contested.note) ? t.contested.note : '',
      evidence: t.evidence || [],
    });
  }
  const rank = (p) => { const i = ORDER.indexOf(groupKey(p.today)); return i < 0 ? ORDER.length : i; };
  places.sort((a, b) => rank(a) - rank(b) || (b.population || 0) - (a.population || 0));

  const outside = places.filter((p) => p.today !== 'part-of-uk');
  const disputed = places.filter((p) => p.disputedWith);
  const withPop = outside.filter((p) => p.population != null);
  return {
    year: max,
    places,
    outside,
    disputed,
    units: places.reduce((n, p) => n + p.units, 0),
    peopleOutside: withPop.reduce((n, p) => n + p.population, 0),
    peopleCounted: withPop.length,
    peopleMissing: outside.length - withPop.length,
    groups: ORDER.map((k) => ({ key: k, head: GROUP_HEAD[k] || k, rows: places.filter((p) => groupKey(p.today) === k) }))
      .filter((g) => g.rows.length),
  };
}

/** Everything this atlas dates to 1997 or later — the record after the story. */
export function afterTheStory(data, from) {
  return data.events
    .filter((e) => Number.isFinite(e.year) && e.year >= (from || 1997))
    .sort((a, b) => a.year - b.year);
}

/* --------------------------------------------------- the through-line --
   DIDACTIC_SPEC §2.3, which that document calls "the app's success metric",
   split at its four load-bearing clauses. The blanks are not a gap-fill quiz:
   they are the four things a student has to have understood to be able to say
   the sentence at all — what it started as, what it became, what the single
   colour hid, and why it came apart. */
const LINE = [
  { pre: 'Britain’s empire started as ', label: 'what it started as', ours: 'sugar islands',
    hint: 'what was grown', help: 'What was grown on them, and who was forced to grow it.' },
  { pre: ' worked by enslaved Africans, became ', label: 'what it became', ours: 'a trading company',
    hint: 'what kind of thing', help: 'Not a country. The thing that ended up ruling India.' },
  { pre: ' that ended up ruling India, turned into a global industrial-strategic system painted one colour on a map that hid ', label: 'what the one colour hid', ours: 'a dozen kinds of rule',
    hint: 'what the pink hid', help: 'One colour on the map; how many different arrangements underneath it.' },
  { pre: ', and came apart between 1942 and 1997 because ', label: 'why it came apart', ours: 'the people it ruled organised, and Britain went broke',
    hint: 'two reasons', help: 'Two reasons, not one — something they did, and something that happened to Britain.' },
];
const LINE_END = '.';
export const THROUGH_LINE = LINE.map((b) => b.pre + b.ours).join('') + LINE_END;

/* ---------------------------------------------------------- the build -- */

/**
 * buildClose(ctx) -> [nodes]
 * ctx: { data, format, defLabel, profile, seenText, emit, announce, onSelect, onYear, onOpenAll }
 */
export function buildClose(ctx) {
  const { data, format } = ctx;
  const r = residue(data);
  const num = (n) => (format && format.number ? format.number(n) : String(n));
  const out = [];

  /* ---- 1. COMMIT BEFORE THE REVEAL ------------------------------------
     The one question this ending is entitled to ask, and the one nearly every
     student gets wrong: they think the answer is nought. It is asked before
     the figure is on screen, and the figure is the answer. */
  out.push(askHowMany());

  /* ---- 2. the residue, once the guess is in --------------------------- */
  const figs = el('div.tl-close__figs', { hidden: true });
  const body = el('div.tl-close__body', { hidden: true });
  out.push(figs, body);

  figs.append(
    el('div.cx-fig',
      el('span.cx-fig__v.num', { text: String(r.outside.length) }),
      el('span.cx-fig__l', { text: `places still British in ${r.year}, outside the United Kingdom` })),
    el('div.cx-fig',
      el('span.cx-fig__v.num', { text: String(r.disputed.length) }),
      el('span.cx-fig__l', { text: 'of them claimed by another state' })),
    r.peopleCounted
      ? el('div.cx-fig',
        el('span.cx-fig__v.num', { text: num(r.peopleOutside) }),
        el('span.cx-fig__l', {
          text: `people in ${r.peopleCounted} of those ${r.outside.length}` +
            (r.peopleMissing ? ` — this atlas carries no population figure for the other ${r.peopleMissing}` : ''),
        }))
      : el('div.cx-fig.cx-fig--none', el('span.cx-fig__v', { text: 'no figure' }), el('span.cx-fig__l', { text: 'nothing in this dataset counts the people in them' })));

  body.append(...[sectionStill(), sectionDisputed(), sectionSince(), sectionSentence(), sectionArgue(), sectionSeen()].filter(Boolean));

  return out;

  /* ------------------------------------------------------------------- */
  function askHowMany() {
    const key = 'p03:residue-count';
    const box = el('div.cx-ask.tl-close__ask', { role: 'group', 'aria-label': 'One question before the ending' });
    const head = el('p.cx-ask__eyebrow', { text: 'before you look' });
    const q = el('p.cx-ask__q', {
      text: 'Not counting the United Kingdom itself, how many places is Britain still responsible for today?',
    });
    const slot = el('div.tl-close__askbody');
    box.append(head, q, slot);

    const truth = r.outside.length;
    const BANDS = [
      { id: 'none', label: 'none', lo: 0, hi: 0 },
      { id: 'few', label: '1 or 2', lo: 1, hi: 2 },
      { id: 'five', label: 'about 5', lo: 3, hi: 9 },
      { id: 'twenty', label: 'about 20', lo: 10, hi: 30 },
      { id: 'many', label: 'more than 40', lo: 31, hi: Infinity },
    ];
    const right = BANDS.find((b) => truth >= b.lo && truth <= b.hi) || BANDS[BANDS.length - 1];

    const prior = record.get(key);
    if (prior) { reveal(prior.answer, true); return box; }

    slot.append(el('div.cx-ask__choices', ...BANDS.map((b) => {
      const btn = el('button.btn.btn--small.tl-close__choice', { type: 'button', text: b.label });
      btn.addEventListener('click', () => {
        const entry = { kind: 'close-residue', answer: b.id, label: b.label, measured: truth, correct: b.id === right.id, at: Date.now() };
        record.set(key, entry);
        if (ctx.emit) ctx.emit('ledger:append', { kind: 'predicted', claimId: key, ...entry });
        reveal(b.id, false);
      });
      return btn;
    })));
    return box;

    function reveal(answerId, silent) {
      const chose = BANDS.find((b) => b.id === answerId) || right;
      const ok = chose.id === right.id;
      const cd = r.places.filter((p) => p.today === 'crown-dependency').length;
      const line = `${ok ? 'Yes. ' : `You said ${chose.label}. `}There are ${truth}, in ${r.year}, spread over ` +
        `${r.units} separate pieces of the map. ${r.disputed.length} of them are claimed by another state; ` +
        `${cd} of them are Crown dependencies, which have never been part of the United Kingdom at all.`;
      slot.replaceChildren(
        el('p.tl-close__verdict', { text: line }),
        el('p.cx-note', { text: 'The empire has no closing date. It has a residue, and the residue is still administered, still funded and — in five cases — still argued over in courts and at the United Nations.' }));
      figs.hidden = false;
      body.hidden = false;
      if (!silent && ctx.announce) ctx.announce(line, true);
      if (ctx.onRevealed) ctx.onRevealed();
    }
  }

  /* ---- what is still British ------------------------------------------ */
  function sectionStill() {
    const panel = el('section.cx-panel.tl-close__sec');
    panel.append(
      el('p.cx-panel__head', { text: 'what is still British' }),
      el('p.tl-close__lead', {
        text: `Every place in this atlas that Britain still holds in ${r.year}, in the dataset's own words. Press one to read what it says; press its name again to put it on the map.`,
      }));
    for (const g of r.groups) {
      panel.append(el('p.tl-close__grouphead', { text: `${g.head} · ${g.rows.length}` }));
      const list = el('ul.tl-close__list');
      for (const p of g.rows) list.append(row(p));
      panel.append(list);
    }
    return panel;

    function row(p) {
      const note = el('div.tl-close__note', { hidden: true });
      const toggle = el('button.cx-more.tl-close__name', {
        type: 'button', 'aria-expanded': 'false',
        text: p.name,
      });
      const meta = el('span.tl-close__meta', {
        text: [
          p.today === 'disputed' ? 'a British Overseas Territory' : plainToday(p.today),
          p.disputedWith ? 'claimed by ' + shortClaim(p.disputedWith) : null,
          p.population != null ? num(p.population) + ' people' + (p.populationYear ? ', ' + p.populationYear : '') : 'no population figure in this dataset',
        ].filter(Boolean).join(' · '),
      });
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        note.hidden = open;
        if (!open && !note.childElementCount) {
          note.append(
            el('p.tl-close__prose', { text: p.note || 'This atlas carries no note on how this place stands today.' }),
            p.disputedWith ? el('p.cx-note.cx-note--warn', { text: 'Claimed by ' + p.disputedWith + '.' }) : null,
            el('button.cx-more.tl-close__go', {
              type: 'button', text: 'Put it on the map',
              onclick: () => { if (ctx.onSelect) ctx.onSelect(p.id); },
            }));
        }
        if (ctx.onMeasure) ctx.onMeasure();
      });
      return el('li.tl-close__row', toggle, meta, note);
    }
  }

  /* ---- what is still disputed ----------------------------------------- */
  function sectionDisputed() {
    const panel = el('section.cx-panel.tl-close__sec');
    panel.append(
      el('p.cx-panel__head', { text: 'what is still disputed' }),
      el('p.tl-close__lead', {
        text: `${r.disputed.length} of them are claimed by somebody else. What follows is this atlas's own note on each dispute, printed whole, with both cases in it — because a dispute with one case in it is not a dispute.`,
      }));
    for (const p of r.disputed) {
      panel.append(
        el('h4.cx-panel__title.tl-close__title', { text: p.name }),
        el('p.cx-note.cx-note--warn', { text: 'Claimed by ' + p.disputedWith }),
        el('p.tl-close__prose', { text: p.contested || p.note }),
        src(p.evidence && p.evidence[0]));
    }
    return panel;
  }

  /* ---- what has been settled since 1997, and by whom ------------------- */
  function sectionSince() {
    const evs = afterTheStory(data, 1997);
    const panel = el('section.cx-panel.tl-close__sec');
    panel.append(
      el('p.cx-panel__head', { text: 'what has happened since the story ends' }),
      el('p.tl-close__lead', {
        text: evs.length
          ? `The spine ends at 1997 because Hong Kong was the last large populated territory to leave. The record does not. ${evs.length} things in this atlas are dated 1997 or later — courts, treaties, referendums and one released archive.`
          : 'This atlas dates nothing after 1997.',
      }));
    for (const e of evs) {
      panel.append(el('div.tl-close__ev', { 'data-year': String(e.year) },
        el('button.tl-close__evhead', { type: 'button', onclick: () => { if (ctx.onYear) ctx.onYear(e.year); } },
          el('span.num.tl-close__evyear', { text: String(e.year) }),
          el('span.tl-close__evtitle', { text: e.title })),
        e.summary ? el('p.tl-close__prose', { text: e.summary }) : null,
        e.significance ? el('p.tl-close__prose.tl-close__why', { text: 'Why it matters: ' + e.significance }) : null,
        src(e.sources && e.sources[0])));
    }
    panel.append(el('p.cx-note', {
      text: 'None of the five disputes above is settled by any of these. The furthest any of them has moved is the Chagos: an advisory opinion of the International Court of Justice in 2019, and a treaty with Mauritius signed on 22 May 2025 that has not yet entered into force.',
    }));
    return panel;
  }

  /* ---- the sentence ---------------------------------------------------- */
  function sectionSentence() {
    const key = 'p03:through-line';
    const panel = el('section.cx-ask.tl-close__sec.tl-close__line');
    const slot = el('div.tl-close__linebody');
    panel.append(
      el('p.cx-ask__eyebrow', { text: 'the sentence to take away' }),
      el('p.cx-ask__q', { text: 'Four things missing, and they are the four the whole account turns on. Put them in your own words. Nothing here is marked and nothing is scored.' }),
      slot);

    const prior = record.get(key);
    if (prior) { done(prior.answer); return panel; }

    const inputs = LINE.map((b, i) => el('input.tl-close__blank', {
      type: 'text', 'data-blank': String(i + 1),
      'aria-label': b.label + ' — ' + b.help,
      title: b.help,
      placeholder: b.hint, autocomplete: 'off', spellcheck: 'false',
    }));
    const sentence = el('p.tl-close__say');
    LINE.forEach((b, i) => { sentence.append(document.createTextNode(b.pre), inputs[i]); });
    sentence.append(document.createTextNode(LINE_END));

    const go = el('button.btn.btn--small.tl-close__commit', { type: 'button', text: 'That is my sentence' });
    go.addEventListener('click', () => {
      const words = inputs.map((n) => n.value.trim());
      if (words.every((w) => !w)) { inputs[0].focus(); return; }
      const entry = { kind: 'through-line', answer: words, at: Date.now() };
      record.set(key, entry);
      if (ctx.emit) ctx.emit('ledger:append', { kind: 'retold', claimId: key, ...entry });
      done(words);
    });
    slot.append(sentence, go,
      el('p.cx-note', { text: 'Leave one blank if you cannot fill it — a gap you can see is worth more than a guess you cannot defend.' }));
    return panel;

    function done(words) {
      const mine = el('p.tl-close__mine');
      LINE.forEach((b, i) => {
        mine.append(document.createTextNode(b.pre));
        const w = (words[i] || '').trim();
        mine.append(w
          ? el('strong.tl-close__filled', { text: w })
          : el('span.tl-close__blankleft', { text: '—' }));
      });
      mine.append(document.createTextNode(LINE_END));

      const ours = el('p.tl-close__ours', { text: THROUGH_LINE });
      slot.replaceChildren(
        el('p.tl-close__minehead', { text: 'Yours' }), mine,
        el('p.tl-close__minehead', { text: 'The sentence this atlas would write' }), ours,
        el('p.cx-note', {
          text: 'These are not marked against each other. If yours says something this one does not, that is a claim you can defend from what you have just been reading — and the four things you could go argue with are below.',
        }));
      if (ctx.announce) ctx.announce('Your sentence is recorded. The atlas’s own version is printed beside it.', true);
      if (ctx.onMeasure) ctx.onMeasure();
    }
  }

  /* ---- three things you could go argue with ---------------------------- */
  function sectionArgue() {
    /* DIDACTIC §8's last card. The three are not invented: they are the three
       live arguments this dataset itself records against the places that are
       still British, in the dataset's own words, with the dataset's sources. */
    const want = ['great-britain', 'ireland', 'british-indian-ocean-territory'];
    const picked = [];
    for (const id of want) { const p = r.places.find((x) => x.id === id && x.contested); if (p) picked.push(p); }
    for (const p of r.places) { if (picked.length >= 3) break; if (p.contested && !picked.includes(p)) picked.push(p); }

    const QUESTION = {
      'great-britain': 'Did the empire pay — and if it did, who was paid?',
      'ireland': 'Was Ireland a colony?',
      'british-indian-ocean-territory': 'Who is allowed to count as a population?',
    };
    const panel = el('section.cx-panel.tl-close__sec');
    panel.append(
      el('p.cx-panel__head', { text: 'three things you could go argue with' }),
      el('p.tl-close__lead', { text: 'Not loose ends. Live arguments, recorded in this atlas against places that are still British, with the works on each side.' }));
    for (const p of picked) {
      panel.append(
        el('h4.cx-panel__title.tl-close__title', { text: QUESTION[p.id] || p.name }),
        el('p.tl-close__prose', { text: p.contested }),
        src(p.evidence && p.evidence[0]),
        el('button.cx-more.tl-close__go', {
          type: 'button', text: 'Open ' + p.name,
          onclick: () => { if (ctx.onSelect) ctx.onSelect(p.id); },
        }));
    }
    return panel;
  }

  /* HOW MUCH OF THE RECORD THIS READER HAS ACTUALLY SEEN. The spine's coverage
     tracker used to be a 13px foot inside a 140px bar; LAYOUT_BUDGET §4 sends
     it to the close, and this is the close. It is the last line of the ending
     because refusing closure is the point: the account is finished and the
     atlas is not. */
  function sectionSeen() {
    if (!ctx.seenText) return null;
    return el('p.cx-note.tl-close__seen', { text: ctx.seenText + '. Nothing in this account depends on having seen the rest; the rest is still there.' });
  }

  function src(s) {
    if (!s) return el('p.cx-src.tl-close__src', el('span.cx-src__kind', { text: 'unsourced' }),
      document.createTextNode('This atlas carries no source for this note.'));
    return el('p.cx-src.tl-close__src',
      s.kind ? el('span.cx-src__kind', { text: String(s.kind).replace(/-/g, ' ') }) : null,
      document.createTextNode((s.author ? s.author + ', ' : '')),
      el('cite', { text: s.work || 'untitled' }),
      s.year ? el('span.num', { text: ' (' + s.year + ')' }) : null,
      s.supports ? el('span.tl-close__for', { text: 'Cited for: ' + s.supports }) : null);
  }
}

export default { buildClose, residue, afterTheStory, THROUGH_LINE, closeAnswer, closeAsked, resetClose };
