/* =============================================================================
   THE SHEET — where everything the ribbon cannot show now lives.
   Owner: P17. Contract: docs/LAYOUT_BUDGET.md §3 level 3, §5, §7.

   WHAT THIS REPLACES, AND WHY. Round 4 built a "reading plate": a fixed panel
   down the left of the window that inset the entire application by 40rem
   (`body:has(#legend-plate) .app { padding-inline-start: 40rem }`). It was an
   honest answer to a real problem — fifteen legal forms will not fit in a
   157px corner — but it was a second layout system, owned by one piece, and it
   moved the map, the time bar and the dossier every time a student pressed a
   swatch. The shell now owns a rail with a sheet in it: 410x716 at 1366x768,
   its own scroll, beside a live map, opened with one event. This file supplies
   the bodies for it and owns none of the geometry.

   THREE SHEETS, NOT ONE SCROLL. 9,000 characters in one column is the defect
   this round is fixing everywhere, so the material is cut where the reader's
   question changes:

     key         what the marks mean — the rule in force, the fourteen legal
                 forms, WHAT A UNIT IS, the marks that are not colours, the
                 tenure ramp, how the totals are counted.
     criticism   the four provenance fields and the three things wrong with
                 THIS rendering. (On a phone this is also where the byline's
                 three questions live, because there is no apparatus column at
                 390px and nothing of P17's may stand on the plate — B5.)
     poster      the transfer exercise: the same three questions asked of the
                 1886 Imperial Federation map, which this atlas did not draw.

   Each ends with the one control that leads to the next, as `.cx-more`.
   ========================================================================== */

import { el, announce } from '../core/util.js';
import { fillFigures, fieldList } from './byline.js';
import {
  ruleBlock, colourSection, groupingNotes, marksSection, countingNotes, tenureRamp, deltaLine, spoken,
} from './key.js';
import { POSTER, POSTER_QUESTIONS, POSTER_OPEN, OURS } from './poster.js';

/* --------------------------------------------------------------- panels -- */

/** Wrap a built section in the app's one panel recipe (chrome.css §B). */
function panel(node, { plain = false } = {}) {
  if (!node) return null;
  node.classList.add('cx-panel', plain ? 'cx-panel--plain' : 'cx-panel--tight');
  for (const h of node.querySelectorAll('.legend__h')) h.classList.add('cx-panel__head');
  for (const c of node.querySelectorAll('.legend__cite')) c.classList.add('cx-src');
  return node;
}

function head(node, text, hint) {
  node.appendChild(el('p.legend__h.cx-panel__head', {},
    el('span', { text }),
    /* The hint is a second clause, not a second word: without this the name
       computation returns "MARKS THAT ARE NOT COLOURS the three pinned in the
       key", with nothing between the heading and its own subtitle. */
    hint ? spoken(' — ') : null,
    hint ? el('span.legend__hint', { text: hint }) : null,
  ));
  return node;
}

/** The one "there is more" affordance. No pill, no dashed box, no border. */
function more(label, onClick, { back = false } = {}) {
  const b = el('button.cx-more', {
    type: 'button',
    class: back ? 'cx-more--back' : null,
    'data-focus-key': 'sheet-more:' + label.slice(0, 18),
    /* `.cx-more::after` prints " →". Generated content counts towards an
       accessible name in every engine that implements accname, so measured on
       the running app these two buttons were spoken as "Three things wrong with
       this rendering right-pointing arrow" and "How these figures are counted
       right-pointing arrow". The arrow is the affordance drawn; the label is
       the label said. */
    'aria-label': label,
    text: label,
  });
  b.addEventListener('click', onClick);
  return b;
}

/* ------------------------------------------------- what a unit is --------- */

/**
 * THE WORD THIS ATLAS COUNTS IN, DEFINED ONCE.
 *
 * "182 units · 132 territories · claimed" is printed under the year, the ribbon
 * counts in units, the sheet counts in units and the map's card counts in
 * units. Before this block the word was counted four times on the opening
 * screen and defined nowhere, which is exactly the failure this piece exists to
 * teach students to spot in other people's maps.
 *
 * Every number in it is live: none of it is typed here.
 */
function termsSection(ctx) {
  const { totals, format, data, def } = ctx;
  const sec = el('section#legend-terms.legend__section', { 'aria-labelledby': 'legend-terms-h' });
  sec.appendChild(el('p.legend__h', { id: 'legend-terms-h' },
    el('span', { text: 'What a unit is, and what a territory is' }),
    spoken(' — '),
    el('span.legend__hint', { text: 'the two words every count on this screen is in' }),
  ));
  const indexed = data.unitMeta && data.unitMeta.size ? format.number(data.unitMeta.size) : null;
  const set = totals ? totals.sets[def.id] : null;

  sec.appendChild(el('p.legend__sentence.legend__sentence--block', {}, el('strong', { text: 'A unit ' }),
    'is one piece of ground with one border, drawn from the atlas’s geometry index'
    + (indexed ? ` — ${indexed} of them, covering the whole world this atlas ever touches` : '')
    + '. A unit is never allowed to straddle a border the empire’s own story crosses, which is why Bengal is two units and not one: the line drawn in 1947 has to be sayable on the same map as 1857.'));

  sec.appendChild(el('p.legend__sentence.legend__sentence--block', {}, el('strong', { text: 'A territory ' }),
    'is a political thing with a name, a constitutional status, an acquisition and an end — "British India", "Barbados", "Hong Kong". One territory can cover many units, and its units change as it gains and loses ground.'));

  if (set) {
    sec.appendChild(el('p.legend__sentence.legend__sentence--block', {},
      'At ', el('span.num', { text: format.year(ctx.year) }), ', under ', el('strong', { text: def.label.toLowerCase() }), ', this map draws ',
      el('span.num', { text: format.number(set.units) }), ' units belonging to ',
      el('span.num', { text: format.number(set.territories) }), ' territories. ',
      'The two figures differ because a territory is an argument and a unit is a shape: Hong Kong is one territory and three units, taken in 1842, 1860 and 1898 on three different legal instruments.',
    ));
  }
  sec.appendChild(el('p.cx-note', {
    text: 'Counts of units and counts of territories are never added together anywhere in this atlas, and no figure on this screen mixes them.',
  }));
  return sec;
}

/* --------------------------------------------------------- the criticism - */

/**
 * All three, in full, always. Round 3 put this list inside the byline, where it
 * measured 184px against 355px of content: criticism 1 readable, 2 and 3 off
 * the bottom, and the colour key pushed off the panel to make room. It has a
 * sheet now — 410x716 beside a live map.
 */
function criticismSection(ctx) {
  /* NO HEADING HERE. The sheet's own title says "Three things wrong with this
     rendering" three centimetres above; a panel head repeating it is the
     "three names for one block" fault this round is clearing out everywhere. */
  const sec = el('section.lplate__sec', { 'aria-labelledby': 'legend-crit-h', id: 'legend-criticism' });
  sec.appendChild(el('p.lplate__crit-lede', { id: 'legend-crit-h' },
    'The three questions above are the ones to ask any imperial map. Here they are turned on this one, ',
    el('strong', { text: 'recomputed from the units drawn at ' + ctx.format.year(ctx.year) }), '.',
  ));

  const chosen = ctx.chosen || [];
  const fig = ctx.figures || {};
  const ol = el('ol.lplate__crit');
  for (const c of chosen) {
    ol.appendChild(el('li', {},
      el('strong', { text: fillFigures(c.title, fig) }), ' ',
      el('span', { text: fillFigures(c.body, fig) }),
    ));
  }
  sec.appendChild(ol);
  if (chosen.length < 3) {
    sec.appendChild(el('p.cx-note.lplate__short', {
      text: `Only ${chosen.length} apply to this rendering. The list is not padded to three.`,
    }));
  }
  if (ctx.defect) sec.appendChild(el('p.cx-note.cx-note--warn.legend__defect', { text: ctx.defect }));
  return sec;
}

/* ------------------------------------------------------- the second map -- */

/**
 * CHARGE 4, FINISHED. Round 3's best sentence was "these three questions work
 * on the 1886 pink poster and on any textbook plate", and the student never did
 * it once. An asserted transferable skill is not one. Here the same three
 * questions are asked about a map this app did not draw, the student commits,
 * and what they chose is kept and printed back beside this atlas's own answers.
 */
function posterSection(ctx) {
  const answers = ctx.posterAnswers || {};
  const sec = el('section.lplate__sec.lplate__sec--poster', { 'aria-labelledby': 'legend-poster-h', id: 'legend-poster' });
  sec.appendChild(el('p.legend__h', { id: 'legend-poster-h' },
    el('span', { text: 'Now do it on a map we did not draw' }),
    spoken(' — '),
    el('span.legend__hint', { text: 'the same three questions' }),
  ));
  sec.appendChild(el('p.lplate__poster-obj', {},
    el('em', { text: POSTER.title }), ' ',
    el('span.lplate__poster-pub', { text: POSTER.published }),
  ));
  sec.appendChild(el('p.legend__sentence.legend__sentence--block', { text: POSTER.why }));
  sec.appendChild(el('p.cx-note.lplate__hint', { text: POSTER.seeing }));

  for (const q of POSTER_QUESTIONS) {
    /* ONE QUESTION TREATMENT, EVERYWHERE (chrome.css §B). These are assessable
       items; they now look exactly like the dossier's THINK questions and the
       quiz's, so a student learns the shape once. */
    const block = el('div.cx-ask.lplate__q', { role: 'group', 'aria-labelledby': 'pq-' + q.id });
    block.appendChild(el('span.cx-ask__eyebrow', { text: 'Commit' }));
    block.appendChild(el('p.cx-ask__q.lplate__q-h', { id: 'pq-' + q.id, text: q.q }));
    const chosenId = answers[q.id];
    const list = el('ul.lplate__opts.cx-ask__choices');
    for (const o of q.options) {
      const picked = chosenId === o.id;
      const li = el('li');
      const b = el('button.lplate__opt', {
        type: 'button',
        'data-focus-key': `poster:${q.id}:${o.id}`,
        'aria-pressed': picked ? 'true' : 'false',
      });
      b.dataset.state = picked ? (o.right ? 'right' : 'wrong') : 'idle';
      b.appendChild(el('span.lplate__opt-t', { text: o.text }));
      b.addEventListener('click', () => ctx.onPosterAnswer && ctx.onPosterAnswer(q.id, o.id));
      li.appendChild(b);
      if (picked) li.appendChild(el('p.lplate__because', { class: o.right ? 'is-right' : 'is-wrong', text: o.because }));
      list.appendChild(li);
    }
    block.appendChild(list);
    sec.appendChild(block);
  }

  /* The open field. No right answer, and it is the one that matters. */
  const open = el('div.cx-ask.lplate__q');
  open.appendChild(el('span.cx-ask__eyebrow', { text: 'In your own words' }));
  open.appendChild(el('p.cx-ask__q.lplate__q-h', { id: 'pq-open', text: POSTER_OPEN.q }));
  open.appendChild(el('p.cx-note.lplate__hint', { text: POSTER_OPEN.hint }));
  const ta = el('textarea.lplate__text', {
    rows: '3',
    'aria-labelledby': 'pq-open',
    'data-focus-key': 'poster:open',
    placeholder: 'In your own words.',
  });
  ta.value = answers.open || '';
  ta.addEventListener('change', () => ctx.onPosterAnswer && ctx.onPosterAnswer('open', ta.value.trim(), false));
  open.appendChild(ta);
  sec.appendChild(open);

  const done = POSTER_QUESTIONS.every(q => answers[q.id]);
  const keep = el('button.lplate__keep', {
    type: 'button',
    'data-focus-key': 'poster:keep',
    text: answers.kept ? 'Kept in this browser' : 'Keep these answers',
    disabled: !done || !!answers.kept ? '' : null,
  });
  if (!done) keep.title = 'Answer the three questions first.';
  keep.addEventListener('click', () => ctx.onPosterKeep && ctx.onPosterKeep());
  sec.appendChild(keep);

  if (answers.kept) {
    const back = el('div.lplate__kept');
    back.appendChild(el('p.lplate__kept-h', { text: 'What you said about the 1886 sheet, and what this atlas answers to the same three:' }));
    const dl = el('dl.lplate__kept-list');
    for (const q of POSTER_QUESTIONS) {
      const o = q.options.find(x => x.id === answers[q.id]);
      dl.appendChild(el('dt', { text: q.q }));
      dl.appendChild(el('dd', {},
        el('span.lplate__kept-you', { text: 'You: ' + (o ? o.text : '—') }),
        el('span.lplate__kept-us', { text: 'Here: ' + (OURS[q.id] || '') }),
      ));
    }
    if (answers.open) {
      dl.appendChild(el('dt', { text: POSTER_OPEN.q }));
      dl.appendChild(el('dd', {}, el('span.lplate__kept-you', { text: answers.open })));
    }
    back.appendChild(dl);
    back.appendChild(el('p.cx-note', {
      text: ctx.posterStored
        ? `Kept in this browser under one key, ${answers.keptAt ? 'on ' + answers.keptAt + ', ' : ''}so it survives a reload. Nothing you typed leaves this device, and nothing is sent anywhere.`
        : 'This browser refused to store it, so it is kept for this session only and a reload will lose it. Copy it out if you need it.',
    }));
    sec.appendChild(back);
  }
  return sec;
}

/* ============================================================ the sheets == */

export const SHEETS = {
  key: { id: 'legend:key', eyebrow: 'The legend', title: 'How to read this map' },
  method: { id: 'legend:method', eyebrow: 'The legend', title: 'How these figures are counted' },
  criticism: { id: 'legend:criticism', eyebrow: 'The legend', title: 'Three things wrong with this rendering' },
  poster: { id: 'legend:poster', eyebrow: 'The legend', title: 'A map we did not draw' },
};

/**
 * FOUR SHEETS, CUT WHERE THE READER'S QUESTION CHANGES.
 *
 * Measured in the rail at 1366x768, one sheet holding all of this scrolled to
 * 5,059px in a 660px column — 7.7 screenfuls, which is the same defect as the
 * dossier's "13 sections" jump menu wearing a different hat. Cut here it is
 * 2,750 / 2,161 / ~700 / ~1,900, and each one answers a different question.
 */
export function kindOf(section) {
  if (section === 'criticism') return 'criticism';
  if (section === 'poster') return 'poster';
  if (section === 'method' || section === 'grouping') return 'method';
  return 'key';
}

/**
 * Fill `host` with one sheet's body. The host is owned by this piece and handed
 * to the shell once, so re-rendering on a year change does not reset the
 * reader's scroll position and does not re-open anything.
 */
export function fillSheet(host, ctx, kind, go) {
  host.replaceChildren();
  host.className = 'lsheet';
  host.dataset.kind = kind;

  if (kind === 'poster') {
    host.appendChild(panel(posterSection(ctx)));
    host.appendChild(more('Back to the full key', () => go('colour'), { back: true }));
    return host;
  }

  if (kind === 'criticism') {
    /* THE FOUR FIELDS FEATURE_SPEC REQUIRES, from the same builder the byline
       uses, so the two can never disagree about what is on the plate. On a
       phone this is the ONLY place they exist, because the apparatus column
       does not exist under 62rem and nothing of P17's may stand on the map. */
    const fields = el('section.legend__section');
    head(fields, 'Ask these three of any imperial map', 'and of this one');
    fields.appendChild(fieldList(ctx.byline || ctx));
    host.appendChild(panel(fields));
    host.appendChild(panel(criticismSection(ctx)));
    host.appendChild(more('Now do it on a map we did not draw', () => go('poster')));
    host.appendChild(more('Back to the full key', () => go('colour'), { back: true }));
    return host;
  }

  if (kind === 'method') {
    /* WHY THIS IS ITS OWN SHEET. It is the atlas's working, and a reader who
       wants to check the arithmetic is not the same reader, in the same minute,
       as one who wants to know what dark red means. Nothing is deleted: the
       grouping decisions, the forms not on the plate this year and the full
       reconciliation against data.metricsAt are all here, whole. */
    const colours = colourSection(ctx, { headingId: 'legend-method-colour-h' });
    for (const n of groupingNotes(ctx, colours.__absent)) host.appendChild(panel(n));
    host.appendChild(panel(countingNotes(ctx)));
    host.appendChild(more('Back to the full key', () => go('colour'), { back: true }));
    return host;
  }

  /* --- the key ---------------------------------------------------------- */
  const rule = el('section#legend-rule.legend__section');
  head(rule, 'The rule in force', 'everything below is counted under it');
  rule.appendChild(ruleBlock(ctx));
  const d = deltaLine(ctx);
  if (d) rule.appendChild(d);
  host.appendChild(panel(rule));

  const colour = colourSection(ctx, { headingId: 'legend-status-h' });
  host.appendChild(panel(colour));

  host.appendChild(panel(termsSection(ctx)));
  host.appendChild(panel(marksSection(ctx, { headingId: 'legend-more-h' })));
  host.appendChild(panel(tenureRamp(ctx)));
  /* The absent list is computed by colourSection and belongs with the method,
     not with the marks: it is a statement about the dataset at this year. */
  host.appendChild(more('Three things wrong with this rendering', () => go('criticism')));
  host.appendChild(more('How these figures are counted', () => go('method')));
  return host;
}

/** Scroll a named section to the top of the sheet's own scroller. */
export function revealSection(host, name) {
  if (!host) return;
  const scroller = host.closest('.cx-sheet__body') || host.parentElement;
  const map = {
    colour: null, criticism: '#legend-criticism',
    poster: '#legend-poster-h', marks: '#legend-more-h', terms: '#legend-terms-h',
    method: null, grouping: null,
  };
  const node = map[name] ? host.querySelector(map[name]) : null;
  if (!scroller) return;
  if (!node) { scroller.scrollTop = 0; return; }
  const block = node.closest('.cx-panel') || node;
  scroller.scrollTop = Math.max(0, block.offsetTop - scroller.offsetTop - 6);
  if (name === 'criticism') {
    announce('Three things wrong with this rendering: all three are set out here, beside the map.');
  }
}

export default { fillSheet, revealSection, SHEETS, kindOf };
