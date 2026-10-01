/* panels/dossier/dossier.js — the renderer.
 *
 * Above the fold at 1280x800, without scrolling, a student sees four things:
 *   1. the name in use at this year, and who used it
 *   2. the legal status at this year, in the words the record uses for THIS
 *      place, with how control worked, where it was governed from, what
 *      legislature existed and WHO COULD VOTE
 *   3. how it was taken, and from whom, by name — the founding step, and
 *      separately the step in force at this year, never confused with it
 *   4. how it ended
 *
 * Everything else is below in one scroll of the panel itself, reachable by a
 * rail of section marks in the sticky header, never behind a tab or a hover.
 */
import { el } from '../../core/util.js';
/* H1, round 5. "Every printed quantity should be traceable to the record that
   warrants it." testimony.js already refuses a primary text with no `check`;
   core/warrant.js applies the same rule to numbers, and this piece is the first
   adopter. Every toll printed below now carries the record that produced the
   figure, or a visible defect saying nobody has said who counted it. */
import { warrantLine, publish as publishWarrant } from '../../core/warrant.js';
import {
  renderSource, missingFields, classFields, workFields, createPanelSources,
  panelClassRepeats, panelSourceRepeats, provenanceRail, PURPOSE_CLASS, PURPOSE_CHOICES, KIND_WORD,
} from './source.js';
import {
  nameAt, usedByLine, statusFamily, familyTexture, statusMeta, legislatureLine,
  takingAt, endingAt, departureAt, acquisitionVerb, takenBlock, inSentence, departureVerb,
  counterpartyKind, becomesKind, instrumentKind, actorsOf, foldActors, toll, showDate,
  childrenOf, statusRun, nestedSplit, clip, higherFigureInNote, tolls, unnamedGroups,
} from './fields.js';
import { claimId, hasAuthoredCause } from './claims.js';
import { beliefBlock, tollBlock, tallyLine, answerFor, answers } from './ask.js';
import { createStyleSink, houseNodes, houseText, houseP, styleFooter } from './housestyle.js';
import { testimonyFor, testimonyStats, auditTestimony, voiceTally } from './testimony.js';

const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);
const LEVEL_WORDS = { record: null, work: 'this atlas, on this work', class: 'true of the class, not recorded for this source' };
const num = (text, cls) => el('span.num' + (cls ? '.' + cls : ''), { text: String(text) });
const eyebrow = (text) => el('h3.cx-panel__head.dsr__eyebrow.sc', { text });

/* ------------------------------------------------------------------ marks -- */

function seal(family) {
  if (family === 'company-rule') {
    return el('span.dsr__seal', { dataset: { seal: 'company' }, title: 'Governed by a shareholder company', html:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">'
      + '<circle cx="12" cy="12" r="9.4"/><circle cx="12" cy="12" r="6.6" stroke-dasharray="1.4 1.6"/>'
      + '<path d="M12 7.4v9.2M8.2 10.2h7.6M9.4 10.2l-1.6 3.1h3.2zM14.6 10.2l-1.6 3.1h3.2z"/></svg>' });
  }
  if (family === 'crown-conquered') {
    return el('span.dsr__seal', { dataset: { seal: 'crown' }, title: 'Ruled by the British state', html:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true">'
      + '<path d="M3.4 8.6l3.3 3.1 5.3-5.1 5.3 5.1 3.3-3.1-1.5 9.1H4.9z"/><path d="M4.4 19.4h15.2"/></svg>' });
  }
  return null;
}

function swatch(family, statusLabel) {
  return el('span.dsr__swatch', {
    dataset: { fam: family, tex: familyTexture(family) },
    role: 'img', 'aria-label': statusLabel + ' — colour and texture',
  });
}

function defect(text) { return el('b.defect', { text }); }

/* ------------------------------------------------------------------ chips --
 * Charge 1(c). A because-chip carries its justification as printed text under
 * the rail, at reading size. Round 1 put it in a `title` attribute, which is
 * invisible on a touch screen and unreadable by a screen reader — the charge
 * defeated by assertion rather than by build. */

const RAIL_MAX = 6;

function chipRail(fullList, ledgerNote) {
  if (!fullList || !fullList.length) return null;
  /* Every chip prints its own justification at reading size, which is what
     charge 1 asks for and what makes a rail expensive. Six is the point at
     which the reasons stop being read. Authored causation is added first in
     claims.js, so what a cap drops is always a cross-reference. */
  const list = fullList.slice(0, RAIL_MAX);
  const dropped = fullList.length - list.length;
  const wrap = el('div.dsr__becausewrap');
  const rail = el('nav.dsr__because', { 'aria-label': 'Where this claim comes from and what followed it' });
  const bases = el('ul.dsr__bases');
  for (const l of list) {
    const dest = l.targetName + (Number.isFinite(Number(l.targetYear)) && l.targetYear !== '' ? ', ' + l.targetYear : '');
    const b = el('button.dsr-chip', {
      type: 'button',
      dataset: {
        rel: l.rel, target: l.targetId, targetYear: l.targetYear ?? '',
        section: l.targetSection || '', authored: l.authored ? 'yes' : 'no',
      },
      'aria-label': l.word + ': ' + l.text + '. Goes to ' + dest + '. ' + (l.authored ? 'Because: ' : 'Basis: ') + l.basis + '.',
    });
    b.append(el('span.dsr-chip__rel.sc', { text: l.word }));
    b.append(el('span.dsr-chip__t', {}, houseNodes(l.text, null)));
    b.append(el('span.dsr-chip__to', { text: '→ ' + dest }));
    rail.append(b);
    const li = el('li', { dataset: { authored: l.authored ? 'yes' : 'no' } });
    li.append(el('span.dsr__basis-t', {}, houseNodes(l.text, null)));
    li.append(document.createTextNode(l.authored
      ? ' — this atlas states the cause. ' + l.basis
      : ' — this link exists because ' + l.basis + '.'));
    /* A causal claim is a claim, so it carries a source on the same line the
       student reads it on. Round 4 found forty of these stated in module
       JavaScript with no citation field at all, four of them carrying
       quantities. There is one per link now, and where there is not, the
       student sees [unsourced] rather than nothing. */
    if (l.authored) {
      const c = l.cite;
      li.append(c
        ? el('span.dsr__basiscite', {
          text: ' Source: ' + [c.author, c.work && c.work + (c.year ? ', ' + c.year : ''), c.publisher]
            .filter(Boolean).join(', ') + '.',
        })
        : el('b.defect.dsr__basiscite', { text: ' [unsourced]' }));
    }
    bases.append(li);
  }
  wrap.append(rail);
  /* Where every chip in a rail stands on the same join, say it once. Three
     identical sentences under three chips is not evidence, it is wallpaper. */
  const distinct = new Set(list.map((l) => l.basis));
  if (distinct.size === 1 && list.length > 1 && !list.some((l) => l.authored)) {
    wrap.append(el('p.dsr__basisone', {
      text: 'All ' + list.length + ' links above exist because ' + list[0].basis + '.',
    }));
  } else {
    wrap.append(el('p.dsr__basishead.sc', { text: 'Why each link above is here' }));
    wrap.append(bases);
  }
  if (dropped > 0) {
    wrap.append(el('p.dsr__basis', {
      text: dropped + (dropped === 1 ? ' further link is' : ' further links are')
        + ' held on this claim and not drawn: a rail whose reasons nobody reads is not evidence.',
    }));
  }
  if (ledgerNote) wrap.append(el('p.dsr__basis', { text: ledgerNote }));
  return wrap;
}

/* ------------------------------------------------------------------ dates -- */

function dateChip(d, format, why) {
  const s = showDate(d, format);
  if (!s) return null;
  const span = num(s.text, s.circa ? 'num--contested' : null);
  if (s.circa || s.note || why) {
    span.title = [s.note, why].filter(Boolean).join(' ') || 'This date is not exact.';
  }
  return span;
}

/* ------------------------------------------------------------------- toll -- */

function tollLine(cost, format, sink, opts = {}) {
  const t = toll(cost);
  if (!t) return null;
  const higher = t.counted ? higherFigureInNote(t.note, t.high != null ? t.high : t.low) : null;
  /* THE ONE DISPLAY FIGURE IN THIS PANEL, in the one treatment the application
     has for one. `.cx-fig` puts the value in mono above its label; `--none`
     prints the honest blank in italic, which is exactly what this field needs
     — a death toll nobody counted is not a zero and must never look like one
     (FEATURE_SPEC charge 7). Round 5 set it as a caption with a small-caps key,
     which made the largest number on the page smaller than the sentence
     beside it. */
  const p = el('div.cx-fig.dsr__toll');
  if (t.counted && t.range) {
    const bar = el('span.cx-fig__v.dsr__range', { dataset: { open: higher ? 'yes' : 'no' } },
      num(format.number(t.low)), el('span.dsr__range-bar', { 'aria-hidden': 'true' }), num(format.number(t.high)));
    /* Charge 7(c), the open range. Kenya's record prints 12,000-25,000 and then
       relies, four lines down, on Blacker at about 50,000. A bar that stops
       below the highest figure its own note leans on teaches a number the page
       then contradicts, so the top of the bar is left open and named. */
    if (higher) bar.append(el('span.dsr__range-open', { text: 'and higher' }));
    p.append(bar, el('span.cx-fig__l', { text: 'dead — the range this record gives' }));
  } else if (t.counted) {
    p.append(el('span.cx-fig__v', {}, num(format.number(t.low ?? t.high))),
      el('span.cx-fig__l', { text: 'dead — the figure this record gives' }));
  } else {
    p.classList.add('cx-fig--none');
    p.append(el('span.cx-fig__v.dsr__nocount', { text: 'no one produced a count' }),
      el('span.cx-fig__l', { text: 'dead' }));
  }
  let note = null;
  if (t.note) { note = el('p.dsr__tollnote'); note.append(houseNodes(t.note, sink)); }

  /* THE WARRANT. Not decoration: the figure above is the largest number on this
     panel, and until this line existed the panel could not say who counted it.
     Where the record carries no warrant this prints the defect in --danger,
     because a death toll nobody can check should look like a problem. */
  /* Only where a figure is actually printed. A record that says "no one
     produced a count" prints no number, so it owes no warrant, and a defect
     marker under it would be this module contradicting the line above it. */
  const printsAFigure = t.counted || (typeof (cost || {}).money === 'string' && /\d/.test(cost.money));
  /* `echo` is the note this block has already printed: the warrant line drops
     its `supports` where the two are the same sentence, so the reader is
     told who counted and where to look, not told the same thing twice. */
  const wl = printsAFigure ? warrantLine(cost && cost.warrant, { of: opts.of || null, echo: t.note || null }) : null;

  /* The gate. One toll per entry — the largest counted one — is not printed
     until the student has put an order of magnitude on it. Everything else on
     the page prints normally, so this is a question, not an obstacle course. */
  if (opts.gate) {
    const block = tollBlock({
      key: opts.gate.key,
      question: opts.gate.question,
      low: t.low, high: t.high,
      format,
      tollNode: p,
      noteNode: (() => { if (!wl) return note; const box = el('div.dsr__tollnotes'); if (note) box.append(note); box.append(wl); return box; })(),
      higher,
    });
    return block;
  }
  if (!note && !wl) return p;
  const wrap = el('div.dsr__tollwrap');
  wrap.append(p);
  if (note) wrap.append(note);
  if (wl) wrap.append(wl);
  return wrap;
}


/* ---------------------------------------------------------- the fold fit --
 * The fold is a fixed budget of vertical space — about 420px at 1280x800 —
 * and it has to hold four answers on all 260 territories. Round 2 spent that
 * budget with CSS line clamps, so the flagship franchise line ended "roughly
 * 3% of adults enfranchised af…". Round 3 clips at a boundary the language
 * has, and where the budget still will not stretch, gives back the least
 * load-bearing field first — the one whose whole text is printed a few
 * centimetres below, under its own heading, with a button that goes there.
 */

/** Render one clippable fold field at a character budget. */
export function fillClipped(p, budget) {
  const full = p.dataset.full || '';
  const k = p.dataset.k || '';
  const c = clip(full, Math.max(24, budget));
  p.replaceChildren();
  if (k) { p.append(el('span.sc.dsr__k', { text: k }), ' '); }
  p.append(houseNodes(c.head, null));
  p.dataset.budget = String(budget);
  if (!c.whole && c.rest) {
    p.append(document.createTextNode(' '));
    p.append(el('button.cx-more.dsr__more', {
      type: 'button', dataset: { act: 'goto', target: p.dataset.target || 'dsr-control' },
      'aria-label': 'The whole of this field is printed further down this panel. Go to it.',
    }, el('span', { text: 'more' })));
  }
}

/* The ladder of what the fold gives up when the strings will not fit the
   budget, least load-bearing first. Every step is measured, not guessed, and
   everything given up is printed whole a few centimetres below, under its own
   heading, with a button that goes there. The franchise line is last and has
   the highest floor: it is the field FEATURE_SPEC §2 singles out. */

function lineHeightOf(p) {
  const cs = getComputedStyle(p);
  const lh = parseFloat(cs.lineHeight);
  return Number.isFinite(lh) ? lh : parseFloat(cs.fontSize) * 1.3;
}

/** Shrink one clipped field until it occupies at most `maxLines`. */
function shrinkToLines(fold, id, maxLines, minChars) {
  const p = fold.querySelector('[data-clip="' + id + '"]');
  if (!p) return false;
  const lh = lineHeightOf(p);
  const cap = maxLines * lh + 3;
  let budget = Number(p.dataset.budget) || (p.dataset.full || '').length;
  let moved = false;
  for (let i = 0; i < 12 && p.getBoundingClientRect().height > cap; i++) {
    const next = Math.max(minChars, Math.round(budget * 0.82));
    if (next >= budget) break;
    budget = next;
    fillClipped(p, budget);
    moved = true;
  }
  return moved;
}

/** Two low-value rows become one line that says where they went. */
function collapseDetail(fold) {
  const gov = fold.querySelector('[data-clip="gov"]');
  const leg = fold.querySelector('[data-clip="leg"]');
  if (!gov && !leg) return false;
  const host = gov || leg;
  const line = el('p.dsr__fact.dsr__fact--moved');
  line.append(el('span.sc.dsr__k', { text: 'Governed from, and the legislature' }), ' ');
  line.append(el('button.cx-more.dsr__more', {
    type: 'button', dataset: { act: 'goto', target: 'dsr-control' },
    'aria-label': 'Where this was governed from and what legislature it had are printed further down this panel. Go to them.',
  }, el('span', { text: 'both, in full' })));
  host.parentNode.insertBefore(line, host);
  if (gov) gov.remove();
  if (leg) leg.remove();
  return true;
}

export function refitFold(root, host) {
  const fold = root.querySelector('.dsr__fold');
  if (!fold || !host) return null;
  const over = () => fold.getBoundingClientRect().bottom - host.getBoundingClientRect().bottom;
  if (over() <= 0) return null;
  const gave = [];
  const step = (name, fn) => {
    if (over() <= 0) return true;
    if (fn()) gave.push(name);
    return over() <= 0;
  };
  const sub = root.querySelector('.dsr__sub[data-optional]');
  step('subregion', () => { if (!sub || sub.hidden) return false; sub.hidden = true; return true; })
    || step('thesis-2', () => shrinkToLines(root, 'thesis', 2, 74))
    || step('how-control-2', () => shrinkToLines(fold, 'hcw', 2, 46))
    || step('taken-from-b', () => shrinkToLines(fold, 'from3', 1, 40) || shrinkToLines(fold, 'from2', 1, 40))
    || step('taken-from-2', () => shrinkToLines(fold, 'from', 2, 52))
    || step('why-step-2', () => shrinkToLines(fold, 'whystep', 2, 70))
    || step('franchise-3', () => shrinkToLines(fold, 'franchise', 3, 96))
    || step('thesis-1', () => shrinkToLines(root, 'thesis', 1, 46))
    || step('how-control-1', () => shrinkToLines(fold, 'hcw', 1, 40))
    || step('detail-rows', () => collapseDetail(fold))
    || step('taken-from-1', () => shrinkToLines(fold, 'from', 1, 40))
    || step('why-step-1', () => shrinkToLines(fold, 'whystep', 1, 48))
    || step('step-in-force', () => {
      const p = fold.querySelector('.dsr__step');
      if (!p || p.hidden) return false;
      p.hidden = true;
      return true;
    })
    || step('became-1', () => shrinkToLines(fold, 'became', 1, 30))
    || step('status-label', () => {
      const lab = fold.querySelector('.dsr__statuslabel');
      if (!lab || lab.hidden) return false;
      lab.hidden = true;
      return true;
    })
    || step('thesis-line', () => {
      /* The whole of it is the first thing below the fold, under its own
         heading, and the line here is a duplicate. It goes before any of the
         four answers is cut, and after everything that is only decoration. */
      const p = root.querySelector('[data-clip="thesis"]');
      if (!p || p.hidden) return false;
      p.hidden = true;
      return true;
    })
    || step('franchise-2', () => shrinkToLines(fold, 'franchise', 2, 80))
    || step('franchise-1', () => shrinkToLines(fold, 'franchise', 1, 56))
    || step('why-step-out', () => {
      const p = fold.querySelector('[data-clip="whystep"]');
      if (!p || p.hidden) return false;
      p.hidden = true;
      return true;
    })
    || step('absent-rows', () => {
      /* A row whose whole content is "the record does not say" is the only
         thing on this page that can go without losing a fact — and it is
         replaced by a mark, not deleted in silence. */
      const p = [...fold.querySelectorAll('.dsr__fact, .dsr__from')].reverse()
        .find((n) => !n.hidden && n.querySelector('.dsr__absent') && !n.classList.contains('dsr__franchise'));
      if (!p) return false;
      p.hidden = true;
      return true;
    })
    || step('contents-button', () => {
      /* Pure navigation chrome, and the contents list it points at is the
         first thing below the fold anyway. It goes before a fact does. */
      const m = root.querySelector('.dsr__meta');
      const b = root.querySelector('.dsr__toc');
      if (!b || b.hidden) return false;
      b.hidden = true;
      if (m) m.hidden = true;
      return true;
    })
    || step('tight-leading', () => {
      /* Last resort, and the only one that costs no content: eighteen
         territories were clearing the panel edge by one to eighteen pixels
         after every other step had run — Union of South Africa 1910 by 13,
         Upper Canada 1791 by 1. Tighter leading on the fold buys about
         twenty. It is the difference between a student seeing "How it ended"
         and having to find it. */
      if (fold.dataset.tight === 'yes') return false;
      fold.dataset.tight = 'yes';
      return true;
    })
    || step('tighter-leading', () => {
      if (fold.dataset.tight === 'more') return false;
      fold.dataset.tight = 'more';
      return true;
    });
  /* Clipping at a clause boundary is coarse: cutting to fit three lines can
     land on two, and on the franchise line that costs a number a student would
     have remembered. So once it fits, give back what the budget will bear,
     most load-bearing field first. */
  for (const id of ['franchise', 'from', 'from2', 'from3', 'hcw', 'thesis', 'whystep', 'became']) {
    const p = root.querySelector('[data-clip="' + id + '"]');
    if (!p || p.hidden) continue;
    const full = (p.dataset.full || '').length;
    let budget = Number(p.dataset.budget) || full;
    for (let i = 0; i < 10 && budget < full; i++) {
      const next = Math.min(full, Math.round(budget * 1.18) + 4);
      fillClipped(p, next);
      if (over() > -2) { fillClipped(p, budget); break; }
      budget = next;
    }
  }
  return { over: Math.round(over()), gave };
}

/* ============================================================== the panel == */

export function renderDossier(ctx) {
  const { data, format, state, links, navDepth, navFrom } = ctx;
  const ledger = ctx.ledger || null;
  const expanded = ctx.expanded || new Set();
  const year = state.year;
  const t = data.get(state.selectedTerritoryId);
  if (!t) return emptyPanel(ctx);

  const sink = createStyleSink();
  const panelSrc = createPanelSources();
  const sections = [];
  const at = data.territoryAt(t.id, year) || {};
  const span = at.span || null;
  const status = span ? span.status : null;
  const family = status ? statusFamily(status) : 'never-british';
  const meta = status ? statusMeta(data, status) : null;
  const nm = nameAt(t, year);
  const ending = endingAt(t, year);
  const dep = ending ? ending.first : null;
  const already = departureAt(t, year);
  /* The two facts that decide whether an acquisition can still be described as
     being in force: does Britain hold a legal status here this year, and has a
     departure already happened at or before it. */
  const taking = takingAt(t, year, { held: !!span, gone: !!(ending && ending.done) });
  const root = el('article.dossier', { dataset: { family, status: status || 'none', territory: t.id } });
  void already;

  /* Register a section so the rail in the sticky header can reach it. Nothing
     is hidden behind the rail: it scrolls this panel, it does not toggle. */
  const sect = (node, id, label) => {
    if (!node) return node;
    node.id = 'dsr-' + id;
    sections.push({ id: 'dsr-' + id, label });
    return node;
  };

  /* ---------------------------------------------------------------- head -- */
  const head = el('header.dsr__head');
  /* One line of the argument, and one control that reaches the contents. */
  const metaRow = el('div.dsr__meta');
  const bar = el('div.dsr__bar');
  if (navDepth > 0) {
    bar.dataset.has = 'back';
    const back = el('button.dsr__back', { type: 'button', dataset: { act: 'back' },
      'aria-label': navFrom ? 'Back to ' + (data.byId.get(navFrom.sel) ? data.byId.get(navFrom.sel).name : 'the previous place') + ', ' + navFrom.year : 'Back' });
    back.append(el('span', { 'aria-hidden': 'true', text: '←' }), document.createTextNode(' Back '));
    if (navFrom && navFrom.sel && data.byId.get(navFrom.sel)) {
      back.append(el('span.dsr__back-to', { text: 'to ' + data.byId.get(navFrom.sel).name + ', ' + navFrom.year }));
    }
    bar.append(back);
  }
  if (navDepth > 0) head.append(bar);

  const title = el('div.dsr__title');
  title.append(el('button.dsr__close', { type: 'button', dataset: { act: 'close' },
    'aria-label': 'Close this dossier (Escape)', title: 'Close (Esc)' },
  el('span', { 'aria-hidden': 'true', text: '✕' })));
  const sealMark = seal(family);
  if (sealMark) title.append(sealMark);
  title.append(el('h2.dsr__name', { text: nm.name }));
  title.append(el('span.dsr__year', { text: String(year) }));
  head.append(title);

  const sub = el('p.dsr__sub');
  const usedWord = usedByLine(nm, year);
  /* When the sub-line is only the subregion it is context, not content, and it
     is the first thing the fold gives back when the budget is short. */
  if (nm.isAtlasName && !usedWord) sub.dataset.optional = 'yes';
  if (!nm.isAtlasName) {
    sub.append(document.createTextNode((usedWord || 'the name in use in ' + year) + ' · '));
    sub.append(el('span.dsr__aka', { text: 'filed as ' + t.name }));
  } else {
    sub.append(document.createTextNode(t.subregion || t.region));
    if (usedWord) sub.append(el('span.dsr__usedby', { text: ' · ' + usedWord }));
  }
  head.append(sub);
  root.append(head);
  /* `meta` is filled just below (the thesis line) and the contents control is
     added to it last, once the sections are known. It is appended to the head
     here so the header is one block in the DOM order a screen reader walks. */
  head.append(metaRow);

  /* ------------------------------------------------------------ the fold -- */
  const fold = el('div.dsr__fold');

  /* (1b) THE ARGUMENT THIS PLACE CARRIES ---------------------------------
   * Charge 1. Round 3's dossier was a record and not an argument: the
   * proposition each entry exists to carry sat three quarters of the way down
   * a seven-thousand-pixel scroll, under "Why this place is in the atlas",
   * where the chapter puts its thesis in the first paragraph. On British India
   * that buried sentence is the chapter's own punchline — Indian taxpayers,
   * not British ones, funded the empire's wars — while the fold headlined a
   * charter of 1600. All 260 entries carry `pedagogy.whyItMatters`. It goes
   * first now, in its own register, with the authored causal chip beside it. */
  const ped0 = t.pedagogy || {};
  const whyClaim = claimId(t.id, 'why', null);
  const whyLinks = links.get(whyClaim) || [];
  const authoredLinks = whyLinks.filter((l) => l.authored);
  /* The line goes in the HEADER, not in the fold. The fold at 1280x800 is
     between 340 and 420 pixels depending on how many events the year carries,
     and it already owes the student four answers; a block with its own heading
     up there cost "How it ended" on Kenya 1964, which is a worse failure than
     the one it was fixing. One line of the thesis in the head is free, the
     whole of it is the first thing below the fold, and the argument is on
     screen either way. */
  if (ped0.whyItMatters) {
    const p = el('p.dsr__thesisline');
    p.dataset.k = 'In the argument';
    p.dataset.full = houseText(ped0.whyItMatters, sink);
    p.dataset.target = 'dsr-why';
    p.dataset.clip = 'thesis';
    fillClipped(p, 118);
    metaRow.append(p);
  }

  /* (2) legal status ------------------------------------------------------ */
  const statusClaim = claimId(t.id, 'status', year);
  const run = statusRun(span, format);
  const sBlock = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'status' } });
  sBlock.dataset.claim = statusClaim;
  sBlock.append(eyebrow('Legal status in ' + year));
  sect(sBlock, 'status', 'Status');
  if (span) {
    /* The headline is the legal description the record wrote for THIS place at
       THIS date; the classification word sits beside it. Egypt then reads
       "The veiled protectorate", "Formal protectorate and martial law",
       "Independent, with four reserved points" and "The Suez Canal Zone base"
       at 1882, 1914, 1922 and 1956 — four legal labels, not three. */
    const cls = meta ? meta.label : status;
    const line = el('p.dsr__statusline');
    line.append(swatch(family, cls));
    const words = el('span.dsr__statuswords');
    words.append(el('strong.dsr__statusword', { text: cls }));
    /* "Military occupation: Suez: seven weeks at Port Said" reads as a mistake.
       Where the record's own label carries a colon, the separator becomes a
       dash. */
    if (span.label) {
      words.append(el('span.dsr__statuslabel', {
        text: (String(span.label).includes(':') ? ' — ' : ': ') + houseText(span.label, sink),
      }));
    }
    line.append(words);
    sBlock.append(line);

    /* The generic definition of the class is printed only where this place's
       own record has nothing to say. "Governed from London with no local
       legislature at all" is the definition of crown rule written for Aden; it
       is false of Bengal, which had a Governor in Calcutta and a part-elected
       assembly, and round 1 printed it two lines above both of them. */
    const hasOwn = !!(span.governedFrom || span.localLegislature || span.franchise || span.howControlWorked);
    if (meta && meta.short && !hasOwn) {
      sBlock.append(el('p.dsr__statusdef', { text: 'What that class means in this atlas: ' + meta.short }));
    }
    if (span.contested || span.circa) {
      sBlock.append(el('p.chip.chip--warn.dsr__warn', {
        text: span.circa ? 'The start of this status is approximate in the record.' : 'This status is contested in the record.',
      }));
    }
    /* A fold field is clipped at a boundary the language has — a full stop, a
       clause, a word — and never with a CSS ellipsis. Round 2's fold ended
       "roughly 3% of adults enfranchised af…" and "A Viceroy in Calcutta, then
       New…", which is not a summary, it is content the student cannot reach.
       Where anything is left, the route to it is a button, not a guess. */
    const row = (cls, k, v, missing, budget, target, clipId) => {
      const p = el('p.dsr__fact' + (cls ? '.' + cls : ''));
      if (!v) {
        p.append(el('span.sc.dsr__k', { text: k }), ' ');
        p.append(el('span.dsr__absent', { text: missing }));
        return p;
      }
      /* The full, house-filtered string is carried on the element so the fold
         can be refitted after layout without re-reading the shard. */
      p.dataset.k = k;
      p.dataset.full = houseText(v, sink);
      p.dataset.target = target || 'dsr-control';
      if (clipId) p.dataset.clip = clipId;
      fillClipped(p, budget || p.dataset.full.length);
      return p;
    };
    /* Anachronism guard: howControlWorked describes the whole status period,
       and the period often mentions events after the selected year. Head it
       with the period, so "the Permanent Settlement of 1793" cannot read as a
       statement about 1770. */
    sBlock.append(row('dsr__fact--tight', run && run.authored ? 'How control worked, ' + run.authored : 'How control worked',
      span.howControlWorked, 'not recorded in this atlas', 96, 'dsr-control', 'hcw'));
    sBlock.append(row(null, 'Governed from', span.governedFrom, 'not recorded in this atlas', 96, 'dsr-control', 'gov'));
    sBlock.append(row(null, 'Local legislature', legislatureLine(span.localLegislature), 'not recorded in this atlas', 0, 'dsr-control', 'leg'));
    /* The flagship field of this panel. It is never clipped mid-sentence, and
       under 200 characters — four fifths of the 623 franchise strings in the
       dataset — it is not clipped at all. */
    sBlock.append(row('dsr__franchise', 'Who could vote',
      span.franchise, 'unknown — no franchise record for this period', 190, 'dsr-control', 'franchise'));
  } else {
    sBlock.append(el('p.dsr__absent', {
      text: 'Britain held nothing here in ' + year + '. This place is in the atlas for ' +
        (t.firstYear != null ? format.yearRange(t.firstYear, t.lastYear) : 'other years') + '.',
    }));
    const fp = el('p.dsr__fact.dsr__franchise');
    fp.append(el('span.sc.dsr__k', { text: 'Who could vote' }), ' ');
    fp.append(el('span.dsr__absent', { text: 'no British authority here in ' + year + ', so there is no franchise to report' }));
    sBlock.append(fp);
  }
  fold.append(sBlock);

  /* (3) how it was taken --------------------------------------------------
   * Round 3 headlined the FIRST step on record. On British India at 1857 that
   * is a royal charter of 31 December 1600, taken from "Other English
   * merchants" — no ground, no Indian counterparty, and fifteen cards above
   * the diwani of Bengal, which is the step the whole entry turns on. The
   * headline is now the load-bearing step, chosen on evidence in the record
   * (fields.js takingAt), the founding step is still printed, and the reason
   * for the ordering is printed with them rather than assumed. */
  const aBlock = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'taken' } });
  sect(aBlock, 'taken', 'Taken');
  if (taking) {
    const a = taking.lead;
    aBlock.dataset.claim = claimId(t.id, 'taken', a.id);
    /* ROUND 6. Every word of this block — the eyebrow above the verb, the verb,
       the secondary-mechanism qualifier and the LABEL BESIDE THE NAMES — comes
       out of one call to vocab.takenBlock(), which reads the record. Nothing
       here is composed locally. Until this wave the eyebrow said "How it was
       taken, and from whom" and the label said "Taken from" whatever the verb
       said, so twelve dossiers printed "Joined with others into one state /
       TAKEN FROM The six colonies of New South Wales…" and check-gloss.js could
       not see it, because it rendered the verb and the page printed the block. */
    const block = takenBlock(a, { count: taking.count, isFounding: taking.leadIsFounding });
    aBlock.append(eyebrow(block.eyebrow));
    const lead = el('p.dsr__lead');
    lead.append(el('strong', { text: block.verb }));
    const dc = dateChip(a.date, format);
    if (dc) { lead.append(document.createTextNode(', ')); lead.append(dc); }
    /* Nepal: primary tag informal-influence, secondary treaty-cession. The
       territory named and the territory transferred are not the same, and only
       the secondary tag says so. */
    if (block.also.length) lead.append(el('span.dsr__also', { text: ' — ' + block.also.join(', ') }));
    aBlock.append(lead);
    /* The counterparties printed here belong to the step printed here. Round 1
       printed the 1920 verb over the 1888 list on Kenya, so the sentence and
       the names contradicted each other. Where the record gives each party a
       role, each group prints under the label that is true of THAT group:
       Charles II is not somebody Pennsylvania was taken from. */
    const CLIPIDS = ['from', 'from2', 'from3'];
    if (block.groups.length) {
      block.groups.forEach((g, i) => {
        const from = el('p.dsr__from');
        from.dataset.k = g.key;
        if (g.role) from.dataset.role = g.role;
        from.dataset.full = houseText(g.names.join('; '), sink);
        from.dataset.target = 'dsr-taken-full';
        if (CLIPIDS[i]) from.dataset.clip = CLIPIDS[i];
        fillClipped(from, i === 0 ? 110 : 90);
        aBlock.append(from);
      });
    } else {
      const from = el('p.dsr__from');
      from.append(el('span.sc.dsr__k', { text: block.key }), ' ');
      from.append(el('span.dsr__absent', { text: 'no counterparty is recorded' }));
      aBlock.append(from);
    }

    /* Why this step and not the first — printed, never assumed. */
    if (!taking.leadIsFounding && taking.leadWhy) {
      const fd = showDate(taking.founding.date, format);
      const why = taking.leadWhy.kind === 'toll'
        ? 'Of the ' + taking.count + ' steps on record here this is the one this atlas puts the largest death toll on.'
        : 'Of the ' + taking.count + ' steps on record here this one brought the most ground under British control.';
      const p = el('p.dsr__whystep');
      p.dataset.k = 'Why this step first';
      p.dataset.full = why + ' Britain got in earlier: '
        /* inSentence(), not .toLowerCase(): Ireland printed "annexed whole into
           english rule, 18 June 1541" because the whole string was lowercased
           after the pre-Union British→English substitution had put a proper
           noun in the middle of it. */
        + inSentence(acquisitionVerb(taking.founding.mechanism, taking.founding)) + (fd ? ', ' + fd.text : '') + '.';
      p.dataset.target = 'dsr-taken-full';
      p.dataset.clip = 'whystep';
      fillClipped(p, p.dataset.full.length);
      aBlock.append(p);
    }

    /* THE YEAR THE STUDENT IS STANDING IN.
       Round 3 printed "IN FORCE IN 1964 — Absorbed whole into British rule,
       23 July 1920" three lines under "Britain held nothing here in 1964", on
       41 territories. An acquisition is in force only while British authority
       here has not ended; once it has, the same step is the LAST one, and that
       is what it is now called. */
    if (taking.count > 1 || taking.notYet) {
      const more = el('p.dsr__step');
      if (taking.notYet) {
        more.append(el('span.sc.dsr__k', { text: 'In ' + year }), ' ');
        more.append(document.createTextNode('Britain had taken no step here yet; the first is above.'));
      } else if (taking.ended) {
        const step = taking.lastStep || taking.lead;
        const dc2 = showDate(step.date, format);
        more.append(el('span.sc.dsr__k', { text: 'The last step before it ended' }), ' ');
        more.append(document.createTextNode(acquisitionVerb(step.mechanism, step) + (dc2 ? ', ' + dc2.text : '')
          + (taking.held ? '' : ' — and by ' + year + ' none of it was still in force.')));
      } else if (taking.inForce) {
        const dc2 = showDate(taking.inForce.date, format);
        more.append(el('span.sc.dsr__k', { text: 'In force in ' + year }), ' ');
        more.append(document.createTextNode(acquisitionVerb(taking.inForce.mechanism, taking.inForce) + (dc2 ? ', ' + dc2.text : '')));
      } else if (taking.leadIsCurrent) {
        more.append(el('span.sc.dsr__k', { text: 'In ' + year }), ' ');
        more.append(document.createTextNode('this was still the latest step Britain had taken here.'));
      } else {
        more.hidden = true;
      }
      aBlock.append(more);
    }
  } else {
    aBlock.append(eyebrow('How it was taken, and from whom'));
    aBlock.append(el('p.dsr__absent', { text: 'No acquisition is recorded for this territory.' }));
  }
  fold.append(aBlock);

  /* (4) how it ended ------------------------------------------------------
   * The headline is the FIRST departure, because that is the step that ended
   * British rule over this place. Round 2 printed the last one, so Egypt's fold
   * read "Independence after a war, 22 December 1956" — the Suez withdrawal,
   * three decades after Egypt became a nominally independent kingdom and three
   * years after it became a republic. A place can be let go in stages, and the
   * stages are counted here rather than collapsed into the newest one. */
  const dBlock = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'ended' } });
  dBlock.append(eyebrow(ending && ending.count > 1 ? 'How it ended — the first of ' + ending.count + ' steps' : 'How it ended'));
  sect(dBlock, 'ended', 'Ended');
  if (dep) {
    dBlock.dataset.claim = claimId(t.id, 'ended', dep.id);
    const lead = el('p.dsr__lead');
    lead.append(el('strong', { text: departureVerb(dep.mechanism) }));
    const dc = dateChip(dep.date, format);
    if (dc) { lead.append(document.createTextNode(', ')); lead.append(dc); }
    dBlock.append(lead);
    const bec = arr(dep.becomes);
    const to = el('p.dsr__from');
    if (dep.mechanism === 'still-a-territory') {
      to.append(el('span.sc.dsr__k', { text: 'Today' }), ' ');
      const st = t.stillBritish && t.stillBritish.note ? t.stillBritish.note : 'It is still under British sovereignty.';
      const c = clip(st, 150);
      to.append(houseNodes(c.head, sink));
      if (!c.whole) {
        /* Gibraltar read "…which claims itthe rest, below ↓": a leading space
           inside a span collapses. The separator is a text node. */
        to.append(document.createTextNode(' '));
        to.append(el('button.cx-more.dsr__more', { type: 'button', dataset: { act: 'goto', target: 'dsr-ended-full' } }, el('span', { text: 'the rest of it' })));
      }
    } else if (bec.length) {
      to.dataset.k = 'It became';
      to.dataset.full = bec.map((b) => {
        const k = b.kind ? becomesKind(b.kind) : null;
        const dup = k && String(b.name).toLowerCase().includes(k.replace(/^an? /, ''));
        return b.name + (k && !dup ? ' (' + k + ')' : '');
      }).join('; ');
      to.dataset.target = 'dsr-ended-full';
      to.dataset.clip = 'became';
      fillClipped(to, to.dataset.full.length);
    } else {
      to.append(el('span.dsr__absent', { text: 'the record does not name what it became' }));
    }
    dBlock.append(to);
    if (ending.count > 1) {
      const rest = el('p.dsr__step');
      const lastDate = showDate(ending.last.date, format);
      rest.append(el('span.sc.dsr__k', { text: 'Then' }), ' ');
      rest.append(document.createTextNode((ending.count - 1) + (ending.count - 1 === 1 ? ' further step' : ' further steps')
        + ' on record, the last being ' + departureVerb(ending.last.mechanism).toLowerCase()
        + (lastDate ? ', ' + lastDate.text : '') + '.'));
      rest.append(document.createTextNode(' '));
      rest.append(el('button.cx-more.dsr__more', { type: 'button', dataset: { act: 'goto', target: 'dsr-ended-full' } },
        el('span', { text: 'all of them' })));
      dBlock.append(rest);
    }
  } else {
    dBlock.append(el('p.dsr__absent', { text: 'No departure is recorded for this territory.' }));
  }
  fold.append(dBlock);
  root.append(fold);

  /* ------------------------------------------------------- below the fold -- */
  const below = el('div.dsr__below');

  /* --------------------------------------------------------------- THINK --
   * The single biggest thing round 2 got wrong: across 260 territories this
   * panel asked the student nothing. No question, no prediction, no
   * commitment, nothing to be wrong about — 19,000 characters of presentation
   * and not one act of retrieval. The chapter it is competing with puts a
   * THINK box on almost every page, and DIDACTIC_SPEC §4 is built on
   * hypercorrection: you remember the correction to a belief you committed to,
   * and you skim the correction to a belief you merely read.
   *
   * So the misconception every one of the 260 entries carries is now a
   * question, its correction is not in the DOM until the student answers, and
   * the answer is stamped to the Ledger. */
  const tollList = tolls(t);
  const gateToll = tollList.filter((x) => x.counted && (x.high != null || x.low != null))
    .sort((a, b) => ((b.high ?? b.low) - (a.high ?? a.low)))[0] || null;
  const gateKey = gateToll ? claimId(t.id, 'toll', gateToll.id) : null;
  const gateFor = (id, question) => (gateToll && gateToll.id === id ? { key: gateKey, question } : null);

  /* ------------------------------------------------ the attribution gate --
   * Charge 8's second committed move. Round 3 shipped no gate here and said
   * why: there are no transcribed quotations in the dataset to mask. But the
   * habit the charge exists to break is not "notice the quotation marks", it
   * is treating a source as a fact rather than as an act by someone with a
   * purpose — and that is gateable on a citation. On the first source in this
   * dossier for which this atlas has a real answer, "What it was made for" is
   * not in the DOM until the student has committed to what they think it was.
   */
  const gateSrcKey = claimId(t.id, 'source-purpose', null);
  let srcGateUsed = false;
  const purposeGate = {
    render({ src, value, level }) {
      if (srcGateUsed || level === 'class') return null;
      const want = PURPOSE_CLASS[src.kind];
      if (!want) return null;
      srcGateUsed = true;
      const said = answerFor(gateSrcKey);
      const box = el('div.cx-ask.dsr__ask.dsr__ask--src', { dataset: { ask: 'purpose', state: said ? 'done' : 'open' } });
      if (!said) {
        box.append(el('span.cx-ask__eyebrow.dsr__askeyebrow', { text: 'Before you read it' }));
        box.append(el('p.cx-ask__q.dsr__askq', {},
          el('span.dsr__askqt', { text: 'What do you think this one was made for?' })));
        const row = el('div.cx-ask__choices.dsr__choices', { role: 'group' });
        for (const c of PURPOSE_CHOICES) {
          row.append(el('button.dsr__choice', {
            type: 'button',
            dataset: { act: 'ask', key: gateSrcKey, kind: 'purpose', value: c.id, ok: c.id === want ? 'yes' : 'no' },
          }, el('span', { text: c.label })));
        }
        box.append(row);
        box.append(el('p.dsr__askwhy', {
          text: 'Commit, and what this atlas knows about this particular work opens under your answer. '
            + 'A source is an act by somebody with a reason, and the reason decides what it can be used for.',
        }));
        return box;
      }
      const chosen = PURPOSE_CHOICES.find((c) => c.id === said.answer);
      box.append(el('p.dsr__askpick', {}, el('span.sc.dsr__k', { text: 'You said' }), ' ',
        el('b', { text: chosen ? chosen.label : String(said.answer) })));
      box.append(el('p.dsr__askverdict', {
        dataset: { ok: said.correct ? 'yes' : 'no' },
        text: said.correct
          ? 'That is the kind of purpose a source of this class has.'
          : 'That is not the kind of purpose a source of this class has. Here is what this one was for.',
      }));
      const rev = el('div.dsr__reveal');
      rev.append(el('p', {}, houseNodes(value, sink)));
      const word = LEVEL_WORDS[level];
      if (word) rev.append(el('span.src__level', { dataset: { level }, text: word }));
      box.append(rev);
      return box;
    },
  };

  /* --------------------------------------------------------- the argument --
   * Round 3 put this three quarters of the way down a seven-thousand-pixel
   * scroll, under the heading "Why this place is in the atlas", and the critic
   * was right that a record with its thesis in the basement is not an
   * argument. On British India the sentence down there is the chapter's own
   * punchline — Indian taxpayers, not British ones, paid for the empire's
   * wars — while the fold headlined a charter of 1600. It is the first thing
   * below the fold now, with the causal chips beside it.
   */
  const whyChips = [...whyLinks, ...(links.get(statusClaim) || [])];
  if (ped0.hook || ped0.whyItMatters || whyChips.length) {
    const hb = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__why', { dataset: { block: 'why' } });
    hb.append(eyebrow(authoredLinks.length
      ? 'The argument this place carries — and what it caused'
      : 'Why this place is in the atlas'));
    sect(hb, 'why', 'Argument');
    hb.dataset.claim = whyClaim;
    if (ped0.whyItMatters) hb.append(houseP('p.dsr__thesist', ped0.whyItMatters, sink));
    if (ped0.hook) hb.append(houseP('p.dsr__hook', ped0.hook, sink));
    const rail = chipRail(whyChips);
    if (rail) hb.append(rail);
    below.append(hb);
  }

  const ped = t.pedagogy || {};
  const misClaim = claimId(t.id, 'misconception', null);
  let misChips = [];
  if (ped.misconception && ped.misconception.belief) {
    const think = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__think', { dataset: { block: 'think' } });
    const said = answerFor(misClaim);
    /* No eyebrow of its own. `.cx-ask` already names itself, at the same size,
       in the same words, one line lower — round 5 printed the heading twice. */
    sect(think, 'think', 'Think');
    think.dataset.claim = misClaim;
    think.append(beliefBlock({
      key: misClaim,
      belief: houseText(ped.misconception.belief, sink),
      correctionNodes: ped.misconception.correction ? houseNodes(ped.misconception.correction, sink) : null,
      correction: ped.misconception.correction || 'The record for this entry holds no correction.',
      territoryName: nm.name,
    }));
    const tl = tallyLine();
    if (tl) think.append(el('p.dsr__asktally', { text: tl }));
    /* ROUND 7, C5. The questions are the only assessable acts in this
       application and there was no way to find one again: a student answered
       about Bengal and it was gone the second they clicked Egypt. One route,
       from the block that asks, into the record of everything they have
       committed to. It is a rail destination, so it costs nothing above the
       fold and nothing at second zero. */
    if (answers().length) {
      think.append(el('button.cx-more.dsr__more', { type: 'button', dataset: { act: 'sheet', sheet: 'answers' } },
        el('span', { text: 'Everything you have answered so far' })));
    }
    if (gateToll && !answerFor(gateKey)) {
      const jump = el('p.dsr__asknext');
      jump.append(document.createTextNode('One more question waits further down, on the death toll this entry records. '));
      jump.append(el('button.cx-more.dsr__more', { type: 'button', dataset: { act: 'goto', target: 'dsr-' + gateToll.where } },
        el('span', { text: 'go to it' })));
      think.append(jump);
    }
    /* The chips this claim carries go where every other chip on this entry
       goes — one rail, once, under "what this place caused" — and their reasons
       go with the rest of the reasons. A second rail inside the question was
       102px of navigation between a reader and their own answer. */
    misChips = links.get(misClaim) || [];
    below.append(think);
  }

  /* ROUND 6. The thirteen-button contents list that used to stand here is
     gone. A contents list at the top of a side column is an admission that
     nobody reaches the bottom of it, and it cost 26 tab stops before a word.
     What replaced it is the index at the foot of this panel: the same
     sections, the same labels, each one a destination in the sheet with
     410x716 and its own scroll, rather than a scroll position 5,000px down
     this column. */

  /* ------------------------------------------------ the record, put to work --
   * FEATURE_SPEC §2 P04 test 6: a fact opened in free exploration converts a
   * later beat from presentation into retrieval. The beats live in P05 and the
   * Close in P21, and both are 266-byte stubs in this build, so round 4's
   * critic was right that the conversion could not be demonstrated: the
   * dossier emitted `ledger:append` and nothing anywhere consumed it.
   *
   * So this panel consumes its own record. Come back to an entry whose facts
   * you have already read this session and the panel does not simply reprint
   * them: it asks you for them first. That is the same conversion, inside the
   * one piece that exists, and it is verifiable — the prompt text on a second
   * visit is not the prompt text on the first.
   */
  if (ledger) {
    const known = new Array(ctx.priorKnown || 0);
    if (known.length) {
      const rb = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__retrieval', { dataset: { block: 'retrieval', path: 'core' } });
      rb.append(eyebrow('You have read this entry already, this session'));
      rb.append(el('p.dsr__retrq', {
        text: known.length + (known.length === 1 ? ' fact from this page is' : ' facts from this page are')
          + ' in your record. Before you read them again, say them: how was ' + nm.name
          + ' taken, and from whom, and how did it end? Then check the block above — that check is worth '
          + 'more to you than the first reading was.',
      }));
      /* THE SENTENCE MUST BE TRUE WHEN IT IS READ — the same rule as the index
         note, applied to time instead of to width. This note used to state,
         unconditionally, that nothing outside this panel reads the record. That
         was measured and true in this build; it stops being true the moment
         another module subscribes to `ledger:append`, and a panel that prints a
         stale confession is doing exactly what round 4 caught in the index
         note. `ctx.ledgerRead` is the bus's live subscriber count, taken at
         render, so the copy tracks the build instead of remembering it. */
      rb.append(el('p.dsr__retrnote', {
        text: ctx.ledgerRead
          ? 'Your record is kept for this session, in this browser, and is not sent anywhere. '
            + 'The rest of the atlas reads it, so a fact you have already found here comes back to you '
            + 'as a question rather than as a statement.'
          : 'Your record is kept for this session, in this browser, and is not sent anywhere. '
            + 'Nothing outside this panel reads it yet: the guided path and the Close that are supposed to '
            + 'use it are not built in this copy of the atlas.',
      }));
      below.append(rb);
    }
  }

  /* the words people wrote at the time -------------------------------------
   * ROUND 4'S BIGGEST GAP, ANSWERED. Until this round the four-question
   * apparatus had 594 modern monographs to interrogate and not one sentence
   * written by anybody who was there, and the panel said so. A provenance
   * machine with nothing but historians' conclusions in it trains a student to
   * audit footnotes, which is not the habit charge 8 exists to build.
   *
   * The primary texts render HERE — above the sources list, on the core path,
   * with the attribution gate on the first of them — so the first source a
   * student is asked "what was this made for?" about is Burke arguing for a
   * bill, Dyer defending himself, or Plaatje raising money for a deputation,
   * and not a university press book of 2005.
   */
  const primaries = testimonyFor(t);
  const tBlock = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__testimony', { dataset: { block: 'testimony', path: 'core' } });
  tBlock.dataset.claim = claimId(t.id, 'testimony', null);
  if (primaries.length) {
    tBlock.append(eyebrow(primaries.length === 1
      ? 'One text written at the time'
      : primaries.length + ' texts written at the time'));
    sect(tBlock, 'testimony', 'Their words');
    tBlock.append(el('p.dsr__testintro', {
      text: primaries.length === 1
        ? 'Not a historian’s account of this place: a document made inside it, by someone who was a party to what it describes. Read the four answers above it before you read the words. What it was made for decides what it can be used for.'
        : 'Not historians’ accounts of this place: documents made inside it, by people who were parties to what they describe. Read the four answers above each one before you read the words. What a text was made for decides what it can be used for.',
    }));
    /* Two open, the rest folded. Four sets of four provenance answers at
       prose size is a thousand words before the student reaches the second
       quotation, and the point of this block is that one text gets read
       properly, not that five get scrolled past. */
    const OPEN = 2;
    let restBox = null;
    primaries.forEach((src, i) => {
      const node = renderSource(src, {
        claimId: claimId(t.id, 'testimony', src.id || null),
        sink, panel: panelSrc, gate: purposeGate,
      });
      if (i < OPEN) { tBlock.append(node); return; }
      if (!restBox) {
        const det = el('details.dsr__ext.dsr__ext--src', { dataset: { for: 'testimony-more' } });
        const sum = el('summary.dsr__extsum');
        sum.append(el('span.dsr__extlabel', { text: (primaries.length - OPEN) + ' more texts written at the time' }));
        sum.append(el('span.dsr__extlen', { text: primaries.slice(OPEN).map((x) => x.author).join(' · ') }));
        det.append(sum);
        tBlock.append(det);
        restBox = det;
      }
      restBox.append(node);
    });
    /* WHOSE WORDS THESE ARE, COUNTED.
       Round 3's critic read Kenya's five texts, found every one of them
       written by an Englishman, and was right to say so. Three of those five
       are still here — Powell on Hola is one of the best things in the
       archive — but the split is now printed under them, for this place, in
       figures a student can check against the list above. An archive
       assembled by the side that kept the paper is a fact about the evidence,
       and a reader who is not told the split will take five Englishmen on
       Kenya for the record of Kenya. */
    const st = testimonyStats();
    const vt = voiceTally(primaries);
    const tally = el('p.cx-note.dsr__testtally');
    const CROWN = 'British officials, politicians, settlers or campaigners';
    const JOINT = (n) => n + ' ' + (n === 1 ? 'carries' : 'carry') + ' the names of the two parties to it';
    let line;
    if (vt.subject === 0) {
      /* The mark is the gap register, not --danger: this is a hole in the
         archive and in this atlas, not a field we failed to fill. */
      tally.append(el('b.dsr__gapmark', { text: '[nobody from here wrote any of these]' }));
      line = ' '
        + (vt.total === 1
          ? 'The one text this atlas has for this place is a British document. '
          : vt.joint
            ? 'Of these ' + vt.total + ', ' + JOINT(vt.joint) + ', and ' + vt.british + ' '
              + (vt.british === 1 ? 'was' : 'were') + ' made by ' + CROWN + '. '
            : 'All ' + vt.total + ' were made by ' + CROWN + '. ')
        + 'This atlas holds no text made here by somebody on the receiving end of it. '
        + 'That is a gap in this atlas before it is anything about who was speaking at the time.';
    } else if (vt.subject === vt.total) {
      line = (vt.total === 1
        ? 'The one text this atlas has for this place was made by somebody on the receiving end of what it describes.'
        : 'All ' + vt.total + ' were made by people from here, or on the receiving end of what they describe.');
    } else {
      line = 'Whose words: ' + vt.subject + ' of these ' + vt.total + ' '
        + (vt.subject === 1 ? 'was' : 'were') + ' made by somebody from here, or on the receiving end of what it describes'
        + (vt.joint ? ', ' + JOINT(vt.joint) : '')
        + (vt.british ? ', and ' + vt.british + ' by ' + CROWN : '')
        + '. They are printed in that order, the colonised side first.';
    }
    /* Through the house-style filter like every other sentence this panel
       writes. The first cut of this line said "signed by both sides" and the
       acceptance audit caught it inside the sheet, which is what the filter
       and the audit are both for. */
    tally.append(houseNodes(line
      + ' Across the whole atlas that is ' + st.texts + ' texts on ' + st.places + ' of 260 entries — '
      + st.subject + ' from the colonised side, ' + st.british + ' British, ' + st.joint + ' signed by the two parties. '
      + 'It is a small archive, it leans the way the surviving paper leans, and the entries without one say so.',
      sink));
    tBlock.append(tally);
    /* The corpus audits itself in front of the student. A text with no locator,
       or with one of the four answers missing, is a defect of ours and is
       printed as one rather than logged where only a developer would see it. */
    const failed = auditTestimony();
    if (failed.length) {
      tBlock.append(el('p.dsr__testaudit', {},
        defect('[' + failed.length + ' of these texts is incomplete]'),
        document.createTextNode(' ' + failed.map((f) => f.id + ' (' + f.missing.join(', ') + ')').join('; ') + '.')));
    }
  } else {
    sect(tBlock, 'testimony', 'Their words');
    tBlock.append(eyebrow('What this entry has not got'));
    /* Marked, but in the gap register and not in --danger. Two hundred and
       three of the 260 entries print this line; a red rule on four fifths of
       the atlas stops being a warning and becomes wallpaper, and --danger is
       reserved here for what the spec calls a defect: a provenance field with
       no answer, and an entry that names no non-British person at all. */
    const miss = el('p.dsr__absence');
    miss.append(el('b.dsr__gapmark', { text: '[no text made at the time]' }));
    miss.append(document.createTextNode(' Every word on this page is a historian writing later. This atlas '
      + 'transcribes ' + testimonyStats().texts + ' texts made at the time and none of them was made here, so '
      + 'nothing you read below is anybody’s own words.'));
    tBlock.append(miss);
    /* Where the nearest thing this atlas has is on the parent entry, say so
       and go there. Not a substitute — Punjab is not British India — but it is
       a real text one click away, and a dead end teaches nothing. */
    const parent = t.nestedWithin ? data.byId.get(t.nestedWithin) : null;
    const up = parent ? testimonyFor(parent) : [];
    if (up.length) {
      const box = el('div.dsr__absencenext');
      box.append(el('p.dsr__absencelead', {
        text: 'The nearest this atlas has is on the entry this one sits inside. Those texts were not made here '
          + 'and they do not speak for here.',
      }));
      const chip = el('button.dsr-chip', {
        type: 'button',
        dataset: { target: parent.id, targetYear: '', section: 'testimony', authored: 'no' },
      });
      chip.append(el('span.dsr-chip__rel.sc', { text: 'the nearest words' }));
      chip.append(el('span.dsr-chip__t', {}, houseNodes(up.length + (up.length === 1 ? ' text made at the time' : ' texts made at the time'), sink)));
      chip.append(el('span.dsr-chip__to', { text: '→ ' + parent.name }));
      box.append(chip);
      tBlock.append(box);
    }
  }
  below.append(tBlock);

  if (span) {
    const sf = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'status-full' } });
    sf.append(eyebrow('How control worked, in full'));
    sect(sf, 'control', 'Control');
    sf.dataset.claim = statusClaim;
    if (run) {
      const rl = el('p.dsr__from');
      rl.append(el('span.sc.dsr__k', { text: 'This status period ran' }), ' ');
      rl.append(document.createTextNode(run.authored
        + (run.startText ? ' (from ' + run.startText + (run.endText ? ' to ' + run.endText : '') + ')' : '')));
      sf.append(rl);
      if (run.sliced) {
        const cl = el('p.dsr__coverage');
        cl.append(el('span.sc.dsr__k', { text: 'Inside it, this atlas draws ' + run.slice }), ' ');
        cl.append(document.createTextNode(run.coverageLabel
          ? 'because the ground this entry covers is “' + run.coverageLabel + '” for those years.'
          : 'because the ground this entry covers changes inside the status period.'));
        if (run.coverageChange) { cl.append(document.createTextNode(' ')); cl.append(houseNodes(run.coverageChange, sink)); }
        sf.append(cl);
      }
    }
    if (span.howControlWorked) sf.append(houseP('p.dsr__prose', span.howControlWorked, sink));
    if (span.raw && span.raw.controlDegreeNote) {
      const p = el('p.dsr__from');
      p.append(el('span.sc.dsr__k', { text: 'Degree of control, and why' }), ' ');
      p.append(houseNodes('degree ' + span.controlDegree + ' of 5 — ' + span.raw.controlDegreeNote, sink));
      sf.append(p);
    } else if (span.controlDegree != null) {
      sf.append(el('p.dsr__from', {}, el('span.sc.dsr__k', { text: 'Degree of control' }), ' ',
        document.createTextNode(span.controlDegree + ' of 5, where 5 is full direct British sovereignty.')));
    }
    if (span.note) sf.append(houseP('p.dsr__prose', span.note, sink));
    if (span.gapBefore && span.raw && span.raw.gapReason) {
      const p = el('p.dsr__contested');
      p.append(el('span.chip.chip--warn', { text: 'a gap before this' }), ' ');
      p.append(houseNodes(span.raw.gapReason, sink));
      sf.append(p);
    }
    if (span.franchise) {
      const p = el('p.dsr__fact.dsr__franchise');
      p.append(el('span.sc.dsr__k', { text: 'Who could vote, in full' }), ' ');
      p.append(houseNodes(span.franchise, sink));
      sf.append(p);
    }
    if (meta && meta.short) {
      sf.append(el('p.dsr__statusdef', { text: 'The class this atlas files it under — ' + meta.label + ' — is defined as: ' + meta.short }));
    }
    below.append(sf);
  }

  /* who was here ---------------------------------------------------------- */
  const actors = actorsOf(t);
  const acBlock = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'actors', derived: 'acquisitions+departures' } });
  acBlock.append(eyebrow('Who was here'));
  /* WHERE THESE NAMES COME FROM, SAID OUT LOUD.
     FEATURE_SPEC §2 P04 names a `local_actors[]` array on the territory. There
     is no such key in any of the 260 shards — not empty, absent — and this
     panel has been assembling the list from the records of the taking and the
     ending instead. Round 4's critic was right that a fallback nobody declares
     is not a mechanism, it is an accident: test 3 was passing because of a
     substitution the student could not see. So the substitution is declared,
     here, in front of the student, on every entry. It is also why the hole
     below is a real hole: if a record's taking and ending name nobody, this
     atlas has nowhere else to look. */
  acBlock.append(el('p.dsr__derived', {
    text: 'This atlas keeps no separate list of people for a place. Every name below is lifted from the '
      + 'records of the taking and the ending — the parties who lost something, the people those records '
      + 'name, and the movement credited with forcing the departure — and from nowhere else. Where those '
      + 'records name nobody, this entry shows a hole instead of a name.',
  }));
  sect(acBlock, 'actors', 'People');
  acBlock.dataset.claim = claimId(t.id, 'actors', null);
  if (actors.empty && !actors.here.length) {
    /* The record itself says nobody lived here. Saying "that is a hole in our
       record, not an empty place" over Ascension's own line "there was nobody
       there" was simply false, and it is the kind of false that makes a
       student stop believing the rest of the panel. */
    const p = el('p.dsr__nobody');
    p.append(el('span.sc.dsr__k', { text: 'No one to take it from' }), ' ');
    p.append(houseNodes('The record for this taking says there was no resident population'
      + (actors.empty.year ? ' in ' + actors.empty.year : '') + '. '
      + (actors.empty.note ? actors.empty.note + ' ' : '')
      /* Round 3 ended this "Everyone named below came from somewhere else."
         On Bermuda nobody is named below, so the sentence pointed at nothing
         and read as a contradiction of the defect under it. */
      + (actors.named ? 'Everyone named below came from somewhere else.' : ''), sink));
    acBlock.append(p);
  }
  if (!actors.named) {
    const groups = unnamedGroups(t);
    const p = el('p.dsr__missing');
    p.append(defect('[missing local actors]'));
    p.append(document.createTextNode(
      ' This atlas names no non-British person or body anywhere in this entry — not at the taking, not at the '
      + 'ending, not among the people who lived here afterwards. It is the only entry of ' + data.territories.length
      + ' of which that is true, and it is printed here rather than hidden.'));
    if (groups.length) {
      p.append(document.createTextNode(' The record is not silent about people. It describes '
        + format.list(groups) + ' — and names none of them. A people described and not named is a '
        + 'particular kind of hole, and it is this one.'));
    }
    acBlock.append(p);
  } else if (!actors.here.length && !actors.empty) {
    acBlock.append(el('p.dsr__missing', {}, defect('[no one from this place is named]'), document.createTextNode(
      ' This entry names non-British parties, below, but no person or body from the place itself. '
      + 'That is a hole in our record and it is printed rather than hidden.')));
  }
  if (actors.here.length) {
    const ul = el('ul.dsr__actors');
    for (const a of actors.here.slice(0, 10)) {
      const li = el('li');
      li.append(el('b.dsr__actor-name', {}, houseNodes(a.name, sink)));
      if (a.role) { const r = el('span.dsr__actor-role'); r.append(houseNodes(a.role, sink)); li.append(r); }
      ul.append(li);
    }
    if (actors.here.length > 10) {
      ul.append(el('li.dsr__actorsmore', {},
        document.createTextNode('and ' + (actors.here.length - 10)
          + ' more named in the steps and the endings below.')));
    }
    acBlock.append(ul);
  }
  if (actors.other.length) {
    const p = el('p.dsr__otheractors');
    p.append(el('span.sc.dsr__k', { text: 'Other non-British parties named here' }), ' ');
    p.append(houseNodes(actors.other.map((a) => a.name).join('; '), sink));
    acBlock.append(p);
  }
  below.append(acBlock);

  /* the full taken record ------------------------------------------------- */
  if ((t.acquisitions || []).length) {
    const full = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'taken-full' } });
    full.append(eyebrow('The taking, in full — ' + t.acquisitions.length + (t.acquisitions.length === 1 ? ' step' : ' steps')));
    sect(full, 'taken-full', 'Steps');

    /* British India renders twenty-one conquests at full length inside a
       432x552 panel: 5,194 words and about seven thousand pixels of scroll,
       which no fifteen-year-old finishes. The steps this entry turns on print
       in full; the rest print their date, their verb and who lost — every fact
       the fold makes a claim about — with a button that opens the prose in
       place. Nothing is behind a hover and nothing is hidden: the page says
       how many are short and why. */
    const KEY = new Set();
    if (taking) {
      KEY.add(taking.founding.id); KEY.add(taking.lead.id);
      if (taking.inForce) KEY.add(taking.inForce.id);
      if (taking.lastStep) KEY.add(taking.lastStep.id);
    }
    const byToll = t.acquisitions
      .filter((a) => a.cost && (Number.isFinite(a.cost.deathsLow) || Number.isFinite(a.cost.deathsHigh)))
      .sort((a, b) => ((b.cost.deathsHigh ?? b.cost.deathsLow) - (a.cost.deathsHigh ?? a.cost.deathsLow)));
    for (const a of byToll.slice(0, 2)) KEY.add(a.id);
    const brief = t.acquisitions.length > 5;
    let briefN = 0;
    if (brief) for (const a of t.acquisitions) if (!KEY.has(a.id) && !expanded.has(a.id)) briefN++;
    if (briefN) {
      full.append(el('p.dsr__briefnote', {
        text: briefN + ' of these ' + t.acquisitions.length + ' steps are printed short: the date, the mechanism '
          + 'and who lost — every fact the fold above makes a claim about. Printed whole: the first step, the step '
          + 'this entry turns on, the one in force at ' + year + ', and the two with the largest death tolls. '
          + 'Each short one has a button that opens it here, and nothing is behind a hover.',
      }));
    }

    for (const a of t.acquisitions) {
      const cid = claimId(t.id, 'taken', a.id);
      const short = brief && !KEY.has(a.id) && !expanded.has(a.id);
      const card = el('div.dsr__record', { dataset: { claim: cid, short: short ? 'yes' : 'no' } });
      if (taking && a === taking.founding) card.dataset.role = 'founding';
      if (taking && a === taking.lead && !taking.leadIsFounding) card.dataset.role = 'lead';
      if (taking && a === taking.inForce) card.dataset.role = 'inforce';
      const rblock = takenBlock(a);
      const h = el('p.dsr__lead');
      h.append(el('strong', { text: rblock.verb }));
      const dc = dateChip(a.date, format);
      if (dc) { h.append(document.createTextNode(', ')); h.append(dc); }
      if (rblock.also.length) h.append(el('span.dsr__also', { text: ' — ' + rblock.also.join(', ') }));
      card.append(h);
      if (short) {
        if (rblock.groups.length) {
          for (const g of rblock.groups) {
            const line = el('p.dsr__from');
            line.append(el('span.sc.dsr__k', { text: g.key }), ' ');
            line.append(houseNodes(g.names.join('; '), sink));
            card.append(line);
          }
        } else {
          const line = el('p.dsr__from');
          line.append(el('span.sc.dsr__k', { text: rblock.key }), ' ');
          line.append(el('span.dsr__absent', { text: 'no counterparty is recorded' }));
          card.append(line);
        }
        card.append(el('p.dsr__expandrow', {}, el('button.cx-more.dsr__more', {
          type: 'button', dataset: { act: 'expand', step: a.id },
          'aria-label': 'Print this step in full: how it happened, what it cost, and its sources.',
        }, el('span', { text: 'print this step in full ↓' }))));
        full.append(card);
        continue;
      }
      if (a.how) card.append(houseP('p.dsr__prose', a.how, sink));
      for (const c of arr(a.counterparties)) {
        const cp = el('p.dsr__cp');
        cp.append(el('b', {}, houseNodes(c.name, sink)));
        cp.append(el('span.dsr__cp-kind', { text: counterpartyKind(c.kind) }));
        if (c.lost) { const l = el('span.dsr__cp-lost'); l.append(houseNodes(c.lost, sink)); cp.append(l); }
        if (c.note) { const n = el('span.dsr__cp-lost'); n.append(houseNodes(c.note, sink)); cp.append(n); }
        card.append(cp);
      }
      if (a.instrument && a.instrument.name) {
        const p = el('p.dsr__instrument');
        p.append(el('span.sc.dsr__k', { text: 'Instrument' }), ' ');
        p.append(houseNodes(a.instrument.name + ' (' + instrumentKind(a.instrument.kind) + ')'
          + (a.instrument.note ? ' — ' + a.instrument.note : ''), sink));
        card.append(p);
      }
      if (a.resistance) {
        const p = el('p.dsr__resist');
        p.append(el('span.sc.dsr__k', { text: 'Resistance' }), ' ');
        p.append(houseNodes(a.resistance, sink));
        card.append(p);
      }
      const tl = tollLine(a.cost, format, sink, {
        /* Round 4: on Bengal this prompt asked "how many died in this
             taking?" against the diwani of 12 August 1765, while the figure
             the record files there — 1,200,000 to 10,000,000 — is the famine
             of 1770. The note explained that; the question did not, so the
             question taught that a treaty killed a million people. It asks
             about the FIGURE now, and says the figure has its own subject. */
        gate: gateFor('a:' + a.id, 'This step carries a death toll in this atlas. How large do you think that figure is?'),
      });
      if (tl) card.append(tl);
      if (a.contested && a.contested.note) {
        const p = el('p.dsr__contested');
        p.append(el('span.chip.chip--warn', { text: 'contested' }), ' ');
        p.append(houseNodes(a.contested.note, sink));
        card.append(p);
      }
      for (const ev of arr(a.evidence)) card.append(renderSource(ev, { claimId: cid, sink, panel: panelSrc, gate: purposeGate }));
      const rail = chipRail(links.get(cid));
      if (rail) card.append(rail);
      full.append(card);
    }
    below.append(full);
  }

  /* the full ending record ------------------------------------------------ */
  if ((t.departures || []).length) {
    const full = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'ended-full' } });
    full.append(eyebrow('The ending, in full'));
    sect(full, 'ended-full', 'Endings');
    for (const d of t.departures) {
      const cid = claimId(t.id, 'ended', d.id);
      const card = el('div.dsr__record', { dataset: { claim: cid } });
      const h = el('p.dsr__lead');
      h.append(el('strong', { text: departureVerb(d.mechanism) }));
      const dc = dateChip(d.date, format);
      if (dc) { h.append(document.createTextNode(', ')); h.append(dc); }
      card.append(h);
      if (d.how) card.append(houseP('p.dsr__prose', d.how, sink));
      if (d.movement) {
        const p = el('p.dsr__movement');
        p.append(el('span.sc.dsr__k', { text: 'Movement' }), ' ');
        p.append(houseNodes(d.movement, sink));
        card.append(p);
      }
      const led = arr(d.led).filter((p) => p && p.side !== 'british');
      const brit = arr(d.led).filter((p) => p && p.side === 'british');
      if (led.length) {
        const ul = el('ul.dsr__actors');
        for (const p of led) {
          const li = el('li');
          li.append(el('b.dsr__actor-name', {}, houseNodes(p.name, sink)));
          if (p.role) { const r = el('span.dsr__actor-role'); r.append(houseNodes(p.role, sink)); li.append(r); }
          ul.append(li);
        }
        card.append(ul);
      }
      if (brit.length) card.append(el('p.dsr__otheractors', {}, el('span.sc.dsr__k', { text: 'On the British side' }), ' ', houseNodes(brit.map((p) => p.name).join('; '), sink)));
      const tl = tollLine(d.cost, format, sink, {
        of: t.id + '/' + d.id + '.cost',
        gate: gateFor('d:' + d.id, 'This ending carries a death toll in this atlas. How large do you think that figure is?'),
      });
      if (tl) card.append(tl);
      if (d.borders) {
        const p = el('p.dsr__borders');
        p.append(el('span.sc.dsr__k', { text: 'Borders' }), ' ');
        p.append(houseNodes(d.borders, sink));
        card.append(p);
      }
      if (d.instrument && d.instrument.name) {
        const p = el('p.dsr__instrument');
        p.append(el('span.sc.dsr__k', { text: 'Instrument' }), ' ');
        p.append(houseNodes(d.instrument.name + ' (' + instrumentKind(d.instrument.kind) + ')' + (d.instrument.note ? ' — ' + d.instrument.note : ''), sink));
        card.append(p);
      }
      if (d.contested && d.contested.note) {
        const p = el('p.dsr__contested');
        p.append(el('span.chip.chip--warn', { text: 'contested' }), ' ');
        p.append(houseNodes(d.contested.note, sink));
        card.append(p);
      }
      for (const ev of arr(d.evidence)) card.append(renderSource(ev, { claimId: cid, sink, panel: panelSrc, gate: purposeGate }));
      const rail = chipRail(links.get(cid));
      if (rail) card.append(rail);
      full.append(card);
    }
    below.append(full);
  }

  /* what sat inside this — T11 ---------------------------------------------
   * Round 2 printed "46 in all — 4 ruled through this entry's own
   * administration, 42 inside a territory with a ruler and a status of its
   * own." Ten of those 42 are the Bengal, Madras and Bombay Presidencies,
   * Punjab, Assam, Sindh, the North-West Frontier, the Central Provinces,
   * Burma and the Andamans: British provinces with British governors. As
   * printed, the fold taught that nine tenths of the Indian Empire was under
   * Indian rulers. The split is now made on each child's own STATUS at the
   * year, which is the thing T11 is actually about.
   */
  const kids = childrenOf(data, t, year);
  if (kids.length) {
    const shape = nestedSplit(data, t, year);
    const kb = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'nested' } });
    kb.append(eyebrow('One colour, ' + kids.length + ' territories'));
    sect(kb, 'nested', 'Inside');
    kb.dataset.claim = claimId(t.id, 'nested', null);
    kb.append(el('p.dsr__prose', {
      text: 'The map paints one colour here. The record holds ' + kids.length + ' separate territories inside it, '
        + (shape.provinces.length + shape.states.length) + ' of them with a status of their own in ' + year + '.',
    }));
    const counts = el('p.dsr__from');
    counts.append(el('span.sc.dsr__k', { text: 'Units on the map at ' + year }), ' ');
    counts.append(document.createTextNode(shape.all.length + ' in all — '
      + shape.direct.length + ' run by British officials ('
      + shape.own.length + ' on this entry’s own ground and '
      + shape.provinceUnits.length + ' inside a province the atlas files separately), and '
      + shape.stateUnits.length + ' inside a state that kept a ruler of its own under British paramountcy.'));
    kb.append(counts);
    if (shape.states.length) {
      kb.append(el('p.dsr__statusdef', {}, houseNodes('The states with rulers of their own here: '
        + shape.states.slice(0, 8).map((k) => k.territory.name).join(', ')
        + (shape.states.length > 8 ? ', and ' + (shape.states.length - 8) + ' more' : '') + '.', sink)));
    }
    const btns = el('p.dsr__paintrow');
    btns.append(el('button.btn.btn--small.dsr__paint', { type: 'button', dataset: { act: 'paint-direct' } },
      el('span', { text: 'Paint what British officials ran (' + shape.direct.length + ')' })));
    if (shape.stateUnits.length) {
      btns.append(el('button.btn.btn--small.dsr__paint', { type: 'button', dataset: { act: 'paint-children' } },
        el('span', { text: 'Paint the states with their own rulers (' + shape.stateUnits.length + ')' })));
    }
    kb.append(btns);
    kb.append(el('p.dsr__statusdef', {
      text: 'Each button also takes the map to the ground it is painting. At world scale the two sets '
        + 'overlap into the same pink shape and the comparison teaches nothing, so the view goes with them.',
    }));
    const ul = el('ul.dsr__kids');
    for (const k of kids.slice(0, 12)) {
      ul.append(el('li', {}, el('button.dsr-chip', {
        type: 'button', dataset: { rel: 'inside', target: k.territory.id, targetYear: k.active ? year : '' },
        'aria-label': 'Open ' + k.territory.name,
      }, el('span.dsr-chip__t', {}, houseNodes(k.territory.name, sink)))));
    }
    if (kids.length > 12) {
      kb.append(el('p.dsr__statusdef', {
        text: 'Twelve of the ' + kids.length + ' are listed above. The rest are on the map, and the two '
          + 'buttons paint them; a rail of ' + kids.length + ' buttons in one panel is not a list anyone reads.',
      }));
    }
    kb.append(ul);
    below.append(kb);
  }

  /* The misconception is a question now, and it is printed at the top of
     this scroll rather than three quarters of the way down it. */

  /* key dates ------------------------------------------------------------- */
  if (arr(ped.keyDates).length) {
    const kd = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'dates' } });
    kd.append(eyebrow('Key dates'));
    sect(kd, 'dates', 'Dates');
    kd.dataset.claim = claimId(t.id, 'dates', null);
    const ol = el('ol.dsr__dates');
    for (const d of ped.keyDates) {
      const s = showDate(d.date, format);
      const li = el('li');
      li.append(num(s ? s.text : '—'));
      const w = el('span.dsr__date-what'); w.append(houseNodes(d.what, sink)); li.append(w);
      ol.append(li);
    }
    kd.append(ol);
    below.append(kd);
  }

  /* consequences ---------------------------------------------------------- */
  const cons = t.consequences || {};
  const consRows = [
    ['Violence', cons.violence && cons.violence.note],
    ['Slavery', cons.slavery && (cons.slavery.note || cons.slavery.summary)],
    ['Population moved', cons.populationTransfer && (cons.populationTransfer.note || cons.populationTransfer.summary)],
    ['Economy', cons.economicLegacy],
    ['Borders', cons.borderLegacy],
    ['Language and law', cons.languageAndLaw],
  ].filter(([, v]) => typeof v === 'string' && v);
  if (consRows.length) {
    const cb = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'consequences' } });
    cb.append(eyebrow('What it left behind'));
    sect(cb, 'consequences', 'After');
    cb.dataset.claim = claimId(t.id, 'consequences', null);
    const dl = el('dl.dsr__facts');
    for (const [k, v] of consRows) {
      dl.append(el('dt.sc', { text: k }));
      const dd = el('dd'); dd.append(houseNodes(v, sink)); dl.append(dd);
    }
    cb.append(dl);
    /* THE MONEY, PRINTED WHERE THE RECORD IS.
     * H1, round 5: the Close prints "£1.72m paid to Barbadian slave-owners for
     * 83,150 people" and the Barbados dossier printed no figure at all, so the
     * number a student meets on the path had no page to be checked on. The
     * award is in the record — it always was — and now it is on the page with
     * the Slave Compensation Commission's own register named beneath it. */
    const slaveryToll = cons.slavery && cons.slavery.toll;
    if (slaveryToll && typeof slaveryToll.money === 'string' && /\d/.test(slaveryToll.money)) {
      const mb = el('div.dsr__money');
      const ml = el('p.dsr__moneyline');
      ml.append(el('span.sc.dsr__k', { text: 'The money' }), ' ');
      ml.append(houseNodes(slaveryToll.money, sink));
      mb.append(ml);
      mb.append(warrantLine(slaveryToll.warrant, { of: t.id + '/consequences.slavery.toll.money' }));
      cb.append(mb);
    }

    if (cons.violence && cons.violence.toll) {
      const tl = tollLine(cons.violence.toll, format, sink, {
        of: t.id + '/consequences.violence.toll',
        gate: gateFor('c:violence', 'How many deaths do you think this atlas records for the violence of British rule in '
          + nm.name + '?'),
      });
      if (tl) cb.append(tl);
    }
    below.append(cb);
  }

  /* contested ------------------------------------------------------------- */
  if (t.contested && t.contested.note) {
    const cb = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'contested' } });
    cb.append(eyebrow('Where historians disagree'));
    sect(cb, 'contested', 'Disagree');
    cb.dataset.claim = claimId(t.id, 'contested', null);
    const p = el('p.dsr__contested');
    p.append(el('span.chip.chip--warn', { text: 'contested' }), ' ');
    p.append(houseNodes(t.contested.note, sink));
    cb.append(p);
    below.append(cb);
  }

  /* the evidence ---------------------------------------------------------- */
  const allSources = [
    ...primaries,
    ...arr(t.evidence),
    ...(t.acquisitions || []).flatMap((a) => arr(a.evidence)),
    ...(t.departures || []).flatMap((d) => arr(d.evidence)),
  ];
  if (allSources.length) {
    const eb = el('section.cx-panel.cx-panel--plain.dsr__block', { dataset: { block: 'evidence' } });
    eb.append(eyebrow('The evidence under this entry'));
    sect(eb, 'evidence', 'Sources');
    eb.dataset.claim = claimId(t.id, 'evidence', null);

    /* THE PROVENANCE RAIL. Charge 8's third move, and the one a footnote
       number cannot do: the evidence gets a shape the eye reads before a word
       of it. One mark per source, in the order they appear, textured by kind.
       Six identical marks IS the finding — this entry is six modern
       monographs and no testimony — and it is legible in half a second. */
    const railed = provenanceRail(allSources);
    if (railed) {
      const shape = el('p.dsr__shape');
      shape.append(el('span.sc.dsr__k', { text: 'What this entry rests on' }), ' ');
      shape.append(railed.rail);
      shape.append(document.createTextNode(railed.bits.join(', ') + '.'));
      const quotes = allSources.filter((s) => s.quote).length;
      shape.append(el('span.dsr__shapenote', {
        text: quotes
          ? quotes + (quotes === 1 ? ' of them is a text written at the time and is transcribed in full above, with its four answers before it.'
            : ' of them are texts written at the time and are transcribed in full above, each with its four answers before it.')
          : 'None of them carries a transcribed quotation in this atlas: you are reading historians’ conclusions, not the words of the people in them.',
      }));
      eb.append(shape);
      /* One kind of source on the page? The line above has already said so;
         a key that repeats it is furniture. */
      const key = railed.kinds.size > 1 ? el('ul.dsr__railkey') : null;
      for (const [k, n] of (key ? railed.kinds : [])) {
        const w = KIND_WORD[k] || [k, k + 's'];
        key.append(el('li', {}, el('span.src__tick', { dataset: { kind: k }, 'aria-hidden': 'true' }),
          document.createTextNode(n + ' ' + (n === 1 ? w[0] : w[1]))));
      }
      if (key) eb.append(key);
    }

    const gaps = allSources.reduce((n, s) => n + missingFields(s), 0);
    const cls = allSources.reduce((n, s) => n + classFields(s), 0);
    const own = allSources.reduce((n, s) => n + workFields(s), 0);
    const fields = allSources.length * 4;
    const count = el('p.dsr__srccount');
    count.append(document.createTextNode('Every source below is printed with four questions asked of it: what it is, '
      + 'who made it, what for, and what it cannot tell you. Of ' + fields + ' answers on this page, '));
    /* Round 3 assembled this sentence by concatenation and, on a page where
       nothing was missing and nothing was class-level, printed "…about that
       particular work, ." The parts are a list now, and the list knows how to
       end. */
    const parts = [];
    parts.push({ n: fields - gaps - cls - own, node: () => document.createTextNode((fields - gaps - cls - own) + ' come from the record itself') });
    if (own) parts.push({ n: own, node: () => document.createTextNode(own + ' are notes this atlas wrote about that particular work') });
    if (cls) parts.push({ n: cls, node: () => el('b.dsr__weakcount', { text: cls + ' are true only of the class of source and not recorded for this one' }) });
    if (gaps) parts.push({ n: gaps, node: () => defect(gaps + ' are not in our record at all') });
    parts.forEach((p, i) => {
      if (i) count.append(document.createTextNode(i === parts.length - 1 ? ' and ' : ', '));
      count.append(p.node());
    });
    count.append(document.createTextNode('.'));
    eb.append(count);

    /* Round 3 replaced a repeated class answer with a button reading "the same
       class answer as above ↑", up to four times on one page. That is worse
       than the repetition: it asks the student to go and fetch a sentence
       instead of reading one. The class answers are one clause long now and
       are printed every time, in the recessive register that says what they
       are. What is still worth saying once is how much of this page's
       provenance is the class rather than the work. */
    const repeats = panelClassRepeats(panelSrc);
    const dupSources = panelSourceRepeats(panelSrc);
    if (repeats.length || dupSources) {
      const rp = el('p.dsr__srcrepeat');
      const bits = [];
      for (const r of repeats) {
        bits.push('“' + r.label.toLowerCase() + '” is answered at the level of the class for ' + r.n + ' of them');
      }
      if (dupSources) bits.push(dupSources + (dupSources === 1 ? ' source is' : ' sources are') + ' cited twice on this page and printed in full once');
      rp.append(document.createTextNode('On this page ' + bits.join('; ') + '.'));
      eb.append(rp);
    }

    for (const ev of arr(t.evidence)) eb.append(renderSource(ev, { claimId: claimId(t.id, 'evidence', null), sink, panel: panelSrc, gate: purposeGate }));
    if (!arr(t.evidence).length) {
      eb.append(el('p.dsr__from', { text: 'The sources for this entry are printed beside the steps they support, above.' }));
    }
    below.append(eb);
  }

  /* the house-style audit ------------------------------------------------- */
  const style = styleFooter(sink);
  if (style) { sect(style, 'words', 'Words'); below.append(style); }

  /* Charge 1(c) and the confidence line are printed once, at the foot of the
     page this panel assembles below. */

  /* ========================================== WHAT IS ON THIS PAGE, AND WHEN ==
   *
   * Round 5 shipped this panel at 9,777 characters and 5,698 pixels of scroll
   * inside a 519-pixel column: 8.3 screenfuls about one place, headed by a
   * thirteen-entry jump menu. Nothing in it was weak. All of it was at once,
   * and a contents list at the top of a side column is an admission that
   * nobody reaches the bottom of that column.
   *
   * Round 5's own answer to this was the folded <details>. That was the wrong
   * instrument and the measurement says so: a fold is still in this column and
   * still in this scroll, so a reader who wants the fourth thing still travels
   * past the first three, and the panel was 8.3 screenfuls whether they opened
   * anything or not.
   *
   * THE ARRANGEMENT NOW. Four things above the fold, ten behind one click
   * each. Above the fold: the legal status with the franchise, how it was
   * taken and from whom, how it ended, and the argument this place carries
   * (one line in the header; the whole of it one click away). Then, in this
   * panel's own short scroll: the ONE question this entry asks, the ONE asset
   * nothing else in this application has — the texts written at the time —
   * the people this record names, and what this place is joined to.
   *
   * Everything else keeps every word it had and becomes a named destination in
   * the shell's sheet (docs/LAYOUT_BUDGET.md §3, level `deep`), where it gets
   * 410x716 with its own scroll BESIDE A LIVE MAP. Nothing is deleted, nothing
   * is hidden behind a hover, and every row of the index says how long the
   * thing it opens is, so the choice is informed rather than blind.
   */
  const SHEETS = {
    why:           ['The argument', 'The argument this place carries'],
    testimony:     ['Their words', 'Written at the time'],
    actors:        ['Who was here', 'The people this record names'],
    control:       ['Status', 'How control worked, in full'],
    'taken-full':  ['The taking', 'Every step of the taking'],
    'ended-full':  ['The ending', 'Every step of the ending'],
    nested:        ['Inside', 'The territories inside this colour'],
    dates:         ['Key dates', 'The dates this record turns on'],
    consequences:  ['After', 'What it left behind'],
    contested:     ['Disagreement', 'Where historians disagree'],
    evidence:      ['Sources', 'The evidence under this entry'],
    words:         ['Words', 'The words this atlas will not use'],
    answers:       ['Your answers', 'Every question you have answered'],
  };
  /* Count what a reader would actually meet, so the index can print an honest
     length beside every route out of this panel. */
  const words = (node) => (node.textContent || '').trim().split(/\s+/).filter(Boolean).length;
  const sheets = ctx.sheets instanceof Map ? ctx.sheets : new Map();
  sheets.clear();
  const stash = (id) => {
    const node = below.querySelector('#dsr-' + id);
    if (!node) return null;
    node.remove();
    const [eb, ti] = SHEETS[id];
    sheets.set(id, { id, eyebrow: eb, title: ti, node, words: words(node) });
    return node;
  };

  /* The one place a piece other than the shell may lift a node out of this
     panel: the testimony block, when there is testimony to lift. Where there
     is none, the entry's own statement that it has none stays on the page,
     because an absence a reader has to click for is an absence they will never
     meet. */
  const hasTestimony = primaries.length > 0;
  if (hasTestimony) stash('testimony');
  const acNode = below.querySelector('#dsr-actors');
  const defects = acNode ? [...acNode.querySelectorAll('.dsr__missing, .dsr__nobody')] : [];
  const actorNames = acNode ? [...acNode.querySelectorAll('.dsr__actor-name')].map((n) => n.textContent) : [];
  if (acNode) stash('actors');
  for (const id of ['why', 'control', 'taken-full', 'ended-full', 'nested', 'dates', 'consequences', 'contested', 'evidence', 'words']) stash(id);

  /* THE SESSION'S OWN RECORD. Not lifted out of `below` like the others: it is
     about the student, not about this place, and it is the same list wherever
     they open it. */
  const ansNode = answersPanel();
  if (ansNode) sheets.set('answers', { id: 'answers', eyebrow: 'Your answers', title: 'Every question you have answered', node: ansNode, words: words(ansNode) });

  /* The dispute's own first sentence, for the index row that opens it — WHOLE
     or not at all. A preview cut mid-clause is the defect this team has fixed
     four times in four other places; one long opening sentence simply gets no
     preview and keeps its category label, which is honest and costs nothing. */
  if (sheets.has('contested') && t.contested && t.contested.note) {
    const note = String(t.contested.note).trim();
    const stop = note.search(/[.!?](\s|$)/);
    const first = stop > 0 ? note.slice(0, stop + 1).trim() : '';
    if (first && first.length <= 120) sheets.get('contested').preview = first;
  }

  /* --------------------------------------------------------------- the page -- */
  const page = el('div.dsr__page');

  /* 1. The question. It is the only assessable act in this application, so it
        is the first thing under the four answers and it is never behind a
        click: DIDACTIC_SPEC §4 is built on committing to a belief BEFORE the
        correction is in the DOM, and a question a reader has to go and find is
        a question they answer after they have read the answer. */
  const thinkNode = below.querySelector('.dsr__think');
  if (thinkNode) { thinkNode.remove(); page.append(thinkNode); }

  /* 2. THE PROMOTION. Four texts written at the time is the strongest single
        asset in this application and round 5 filed it at 38% of the depth of a
        side column, under two other sections. It is second on the page now,
        under its own eyebrow, with the authors named on the face of the
        control, and it opens into a full-height surface where a reader can
        actually sit with the four provenance answers and the words. */
  if (hasTestimony) {
    const tz = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__promo', { dataset: { block: 'testimony-promo' } });
    tz.append(eyebrow(primaries.length === 1 ? 'One text written at the time' : primaries.length + ' texts written at the time'));
    tz.append(el('p.dsr__promoline', { text: primaries.map((x) => x.author).filter(Boolean).join(' · ') }));
    /* The balance, on the face of the control, before the reader opens it.
       "5 texts written at the time · Powell · Lugard · Salisbury · Macmillan"
       reads as a rich archive; "all five by Britons" is the fact about it.
       One clause, because this is above the fold and the fold is a budget. */
    const pv = voiceTally(primaries);
    tz.append(el('p.cx-note.dsr__promosay', {
      text: (primaries.length === 1
        ? 'Not a historian’s account of this place: a document made inside it, by somebody who was a party to what it describes. '
        : 'Not historians’ accounts of this place: documents made inside it, by people who were parties to what they describe. ')
        + (pv.subject === 0
          ? 'Every one of them was made by a Briton — read them knowing that.'
          : pv.subject === pv.total
            ? (pv.total === 1 ? 'It was made by somebody on the receiving end of it.' : 'All of them by people on the receiving end of it.')
            : pv.subject + ' of the ' + pv.total + ' by somebody from here, and they are first.'),
    }));
    tz.append(el('button.cx-more', { type: 'button', dataset: { act: 'sheet', sheet: 'testimony' } },
      el('span', { text: primaries.length === 1 ? 'Read it, with the four questions asked of it' : 'Read them, with the four questions asked of each' })));
    page.append(tz);
  } else {
    const miss = below.querySelector('#dsr-testimony');
    if (miss) { miss.remove(); page.append(miss); }
  }

  /* 2b. WHERE HISTORIANS DISAGREE — P16's anchor, and nothing else.
        This entry may carry an argument between named historians about what
        happened here. That piece owns the block; this is the slot it stands
        in, printed empty and filled from `panels/historiography` after the
        panel is in the document. It is deliberately not an import: if that
        piece is absent or throws, an empty div renders and the dossier is
        unaffected. It sits here — under the texts written at the time and
        above the people — because an argument about the evidence belongs
        beside the evidence, not at the foot of a scroll. */
  page.append(el('div.dsr__hgxslot', { dataset: { slot: 'historiography' } }));

  /* 3. The people. The names are on the page; the derivation note that says
        where this atlas got them, and the parties who are not from here, are
        in the sheet. Every defect mark stays on the page in --danger, in front
        of the reader, which is FEATURE_SPEC §2 P04 test 3. */
  if (acNode) {
    const az = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__promo', { dataset: { block: 'actors-promo' } });
    az.append(eyebrow('Who was here'));
    for (const d of defects) az.append(d);
    /* Not the first six of the list: the six that answer the question.
       Round 3 measured British India's fold opening "Other English merchants
       · Mughal Empire · Jahangir …" under a heading that says who was HERE,
       and Canada's and Australia's opening with four settler politicians. The
       fold now takes peoples and polities AND named individuals of the place,
       so a reader meets Jaja of Opobo and Ahmad Urabi and not only the nouns
       they belong to. `actorNames` is still every name, in rank order, for the
       control's own label and for the sheet. */
    const fold6 = foldActors(actors, 6).map((a) => a.name);
    const shown = fold6.length ? fold6 : actorNames.slice(0, 6);
    if (shown.length) {
      az.append(el('p.dsr__promoline', { text: shown.join(' · ') }));
    }
    az.append(el('button.cx-more', { type: 'button', dataset: { act: 'sheet', sheet: 'actors' } },
      el('span', {
        text: actorNames.length > 6
          ? 'All ' + actorNames.length + ' names, and where this atlas got them'
          : 'Where this atlas got these names',
      })));
    page.append(az);
  }

  /* 4. What this place is joined to. The chips navigate; the reason under each
        one is printed at reading size in the argument sheet, which is where a
        reader who wants to audit a causal claim is going anyway. */
  const PAGE_CHIPS = 3;
  const allChips = [...whyChips, ...misChips];
  const pageRail = chipRail(allChips.slice(0, PAGE_CHIPS));
  const railNav = pageRail ? pageRail.querySelector('.dsr__because') : null;
  if (railNav) {
    const cz = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__promo', { dataset: { block: 'joins' } });
    cz.append(eyebrow(hasAuthoredCause(t) ? 'What this place caused' : 'What this entry is joined to'));
    cz.append(railNav);
    /* Six chips at reading size is 435px of this column — a third of a
       screenful of navigation before a fact. Three here; all of them, each with
       the join or the cause it stands on printed underneath at reading size,
       in the argument. */
    if (sheets.has('why')) {
      cz.append(el('button.cx-more', { type: 'button', dataset: { act: 'sheet', sheet: 'why' } },
        el('span', {
          text: allChips.length > PAGE_CHIPS
            ? 'All ' + allChips.length + ', and why each one is here'
            : 'Why each of these links is here',
        })));
    }
    page.append(cz);
  }

  /* 5. THE INDEX. Ten rows, one click each, every one of them a destination
        with a guaranteed 280px minimum and its own scroll. The length is
        printed on every row: a reader choosing between a 60-word note and a
        900-word record should be told which is which. */
  if (sheets.size) {
    const idx = el('section.cx-panel.cx-panel--plain.dsr__block.dsr__index', { dataset: { block: 'index' } });
    idx.id = 'dsr-index';
    idx.append(eyebrow('The rest of this entry'));
    /* ROUND 4's charge, and it was fair: this sentence described the layout it
       was printed in, and on a 390px phone it described a layout that does not
       exist there — nothing opens beside the map, because the rail is a bottom
       sheet stacked over the map (layout.css, under 62rem). A sentence that
       tells a reader what will happen has to be true where it is read, so both
       are in the DOM and the stylesheet picks the one that matches the rail the
       reader is actually holding. No listener, no breakpoint in JS, correct on
       the frame the window is resized. */
    const kk = el('p.cx-note.dsr__indexk');
    kk.append(el('span.dsr__ifrail', {
      text: 'Everything below opens beside the map, at full height, with its own scroll. ',
    }));
    kk.append(el('span.dsr__ifsheet', {
      text: 'Everything below opens here, over the map, with its own scroll, '
        + 'and closes back to this list. ',
    }));
    kk.append(document.createTextNode(
      'You are not missing an argument by leaving them closed — the argument is above.'));
    idx.append(kk);
    const ul = el('ul.dsr__idx');
    for (const id of ['why', 'testimony', 'actors', 'control', 'taken-full', 'ended-full',
      'nested', 'dates', 'consequences', 'contested', 'evidence', 'words', 'answers']) {
      const sh = sheets.get(id);
      if (!sh) continue;
      const li = el('li.dsr__idxrow');
      li.append(el('button.cx-more.dsr__idxbtn', { type: 'button', dataset: { act: 'sheet', sheet: id } },
        el('span', { text: sh.title })));
      li.append(el('span.dsr__idxlen', {}, num(sh.words), document.createTextNode(' words')));
      /* ONE ROW SAYS WHAT IS IN IT. The round-4 whole-app critic reported that
         nowhere in this application are two named historians in explicit
         disagreement. That is wrong — 103 of the 260 entries carry an authored
         dispute and Kenya's names Elkins, Blacker and Anderson against each
         other — but it was a fair thing to conclude, because the only route to
         it was a row labelled with a category. A category is not a claim, and a
         reader who does not already know that historians disagree about the
         scale of the Mau Mau emergency has no reason to open a row that says
         "Where historians disagree". So this one row prints the dispute's own
         first sentence, whole or not at all. Nothing is added: the sentence is
         already in the entry, three clicks further in. */
      if (sh.preview) li.append(el('p.cx-note.dsr__idxsay', { text: sh.preview }));
      ul.append(li);
    }
    idx.append(ul);
    page.append(idx);
  }

  /* 6. What is left of the running commentary, in one register. */
  const retr = below.querySelector('.dsr__retrieval');
  if (retr) { retr.remove(); page.append(retr); }
  if (sheets.has('why') && allChips.length) {
    const full = chipRail(allChips);
    if (full) {
      const w = sheets.get('why').node;
      w.append(el('h3.cx-panel__head.dsr__eyebrow.sc', { text: 'Every link this entry carries' }));
      w.append(full);
      sheets.get('why').words = (w.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    }
  }
  const anyChips = [...links.values()].some((v) => v && v.length);
  if (anyChips && sheets.has('why')) {
    /* This is a note about how to read the chips' reasons, so it is printed
       where the reasons are and not as a fourth paragraph of small print at the
       foot of a column the reader has already left. */
    sheets.get('why').node.append(el('p.cx-note.dsr__causenote', {
      text: hasAuthoredCause(t)
        ? 'The chips marked “because” carry a cause this atlas states and signs, with the reason printed in the argument — not a join we inferred from two fields sharing an id. Every other chip names the join it actually stands on.'
        : 'No chip on this page says “because”. This atlas states no cause for this entry, so every chip names the join it actually stands on, and none of them claims a cause we have not written down.',
    }));
  }
  page.append(el('p.cx-note.dsr__confidence', {},
    el('span.sc.dsr__k', { text: 'Confidence in this entry' }), ' ',
    document.createTextNode(t.confidence || 'not recorded'),
    document.createTextNode(' · region: ' + (t.region || 'unplaced'))));

  below.replaceChildren(...page.childNodes);
  root.append(below);

  root.dataset.styleNotes = String(sink.size());
  /* The one gated figure on this page, so the click handler can score a
     bracket without re-deriving the whole entry. */
  if (gateToll) {
    root.dataset.gateKey = gateKey;
    if (gateToll.low != null) root.dataset.gateLow = String(gateToll.low);
    if (gateToll.high != null) root.dataset.gateHigh = String(gateToll.high);
  }
  return root;
}

function emptyPanel({ format }) {
  const root = el('article.dossier.dossier--empty');
  root.append(el('h2.dsr__name', { text: 'No place selected' }));
  root.append(el('p.dsr__prose', {
    /* No "or search": app/js/search/index.js is a stub in this build, and a
       panel that tells a reader to use a control that does not exist is the
       round-4 index-note defect in a third place. */
    text: 'Choose a territory on the map and this panel answers four questions without scrolling: '
      + 'what it was in law this year, who took it and from whom, who was here, and how it ended.',
  }));
  void format;
  return root;
}

/* ========================================================================== */
/* THE SESSION'S ANSWERS — C5, from the dossier's side.                       */
/* ========================================================================== */

/* The whole-app critic, round 2: "there is no recap, no retrieval across the
 * session, no summary, no close". The dossier owns the only assessable acts in
 * the application — a belief committed to before the correction exists in the
 * DOM, and an order-of-magnitude bracket committed to before the figure does —
 * and until now each one vanished the moment the reader clicked another place.
 *
 * This is not a new question and not a new claim. It is the questions already
 * asked, read back: what was asked, where, what this student said, and what
 * the record then showed. It lives in the rail (LAYOUT_BUDGET §3, `deep`), so
 * it adds nothing to first paint, and it is the same list from every entry.
 */
function answersPanel() {
  const rows = answers();
  if (!rows.length) return null;
  const root = el('div.dsr__block');
  /* The sheet focuses a section's own eyebrow when it opens. Without one here
     the fallback focused the whole panel and drew a focus ring round 460px of
     it — the noise this file already refuses to make elsewhere. */
  root.append(eyebrow('Your record this session'));
  const beliefs = rows.filter((r) => r.kind === 'belief');
  const tolls = rows.filter((r) => r.kind === 'toll');
  const gates = rows.filter((r) => r.kind === 'purpose');

  root.append(el('p.cx-note', {
    text: 'Every question this atlas has put to you this session, in the order you answered them. '
      + 'Nothing here is stored anywhere: it is this session, in this browser, and closing the tab ends it.',
  }));

  const fig = el('div.dsr__ansfigs');
  const cell = (v, l) => {
    const c = el('div.cx-fig.cx-fig--sm');
    c.append(el('span.cx-fig__v', { text: String(v) }), el('span.cx-fig__l', { text: l }));
    return c;
  };
  fig.append(cell(rows.length, rows.length === 1 ? 'answer committed' : 'answers committed'));
  if (beliefs.length) fig.append(cell(beliefs.filter((b) => b.correct).length + '/' + beliefs.length, 'beliefs you doubted'));
  if (tolls.length) fig.append(cell(tolls.filter((b) => b.correct).length + '/' + tolls.length, 'tolls inside the range'));
  if (gates.length) fig.append(cell(gates.filter((b) => b.correct).length + '/' + gates.length, 'purposes read right'));
  const judged = rows.filter((r) => r.kind === 'judgement');
  if (judged.length) fig.append(cell(judged.length, judged.length === 1 ? 'argument you judged' : 'arguments you judged'));
  root.append(fig);

  const list = el('ol.dsr__ans');
  for (const r of rows) {
    const li = el('li.dsr__ansrow');
    if (r.question) li.append(el('p.dsr__ansq', { text: r.question }));
    const w = el('p.dsr__answ');
    w.append(document.createTextNode('You said '));
    w.append(el('b', { text: r.label || String(r.answer) }));
    w.append(document.createTextNode('. '));
    const v = el('span.dsr__ansv', { dataset: { ok: r.correct ? 'yes' : 'no' } });
    v.textContent = r.kind === 'belief'
      ? (r.correct ? 'The record does not support the belief — you were right to doubt it.'
        : 'The record does not support the belief. The correction is in that entry, under your answer.')
      : r.kind === 'toll'
        ? (r.correct ? 'Inside the range the record gives.' : 'Outside the range the record gives.')
        /* A judgement between historians has no right answer and must not be
           marked as if it had one. `correct` is null on those rows by contract
           (panels/historiography/judgement.js), and without this branch the
           panel told a student their reading of Elkins against Blacker was
           "not the class of purpose a source of that kind has". */
        : r.kind === 'judgement'
          ? 'There is no right answer to this one. Where the argument stands is under your sentence, in that panel.'
          : (r.correct ? 'That is the class of purpose a source of that kind has.'
            : 'Not the class of purpose a source of that kind has.');
    w.append(v);
    li.append(w);
    if (r.kind === 'judgement' && r.note) {
      li.append(el('blockquote.dsr__answhy', {}, el('p', { text: r.note })));
    }
    if (r.territoryId) {
      li.append(el('p.dsr__answhere', { text: r.territoryId.replace(/-/g, ' ') + (r.year ? '  ' + r.year : '') }));
    }
    list.append(li);
  }
  root.append(list);
  root.append(el('p.cx-note.cx-note--warn', {
    text: 'A wrong first answer that you then corrected is worth more than a right one you guessed. '
      + 'The point of committing first is that the correction has somewhere to land.',
  }));
  return root;
}

export { houseText };
