/* panels/historiography/render.js — the DOM for HISTORIANS DISAGREE.
 *
 * Two surfaces and one rule.
 *
 *   renderCard()  the block that stands in the dossier, above the fold, with
 *                 the question and the two names on the face of the control.
 *                 A category label ("Where historians disagree") is not a
 *                 claim, and a reader who does not already know that scholars
 *                 argue about the Mau Mau death toll has no reason to open a
 *                 row that says one. So the card prints the argument's own
 *                 question and the names of the people having it.
 *
 *   renderFull()  the argument itself, in the rail sheet: the positions, the
 *                 commitment, and — only after the commitment — the verdict,
 *                 what would settle it, and the evidence.
 *
 * THE RULE: nothing downstream of the commitment is in the DOM before the
 * commitment. Not hidden, not disabled, not one element away. Rendered on the
 * far side of a branch.
 *
 * Every citation and every quotation goes through the dossier's renderSource()
 * — the single function in this app permitted to print one — so a historian's
 * book is interrogated here with exactly the four questions a despatch is.
 */
import { el } from '../../core/util.js';
import { renderSource } from '../dossier/source.js';
import { TESTIMONY, VOICE, voiceTally } from '../dossier/testimony.js';
import { choicesFor, commit, judgementFor, positionName, MIN_CHARS } from './judgement.js';
import { sourcesOf, DISPUTES, whenMade } from './disputes.js';
import { productionFor, produceChapters } from './produce.js';

const disputeCount = () => DISPUTES.length;

const TESTIMONY_BY_ID = new Map(TESTIMONY.map((t) => [t.id, t]));

const BALANCE_WORD = {
  open: ['still open', 'Historians who have read the same evidence still reach different conclusions.'],
  weighted: ['largely decided', 'One side of this has held up much better than the other. The panel says which, and why.'],
  'settled-on-fact': ['a disagreement about scale, not about what happened', 'The facts under this argument are not in dispute between the people arguing. Read the verdict before you decide.'],
};

function eyebrow(text) {
  return el('h3.cx-panel__head.hgx__eyebrow.sc', { text });
}

/* ---------------------------------------------------------------- the card --
 * What stands in the dossier column. Short by contract: this is above the fold
 * and the fold is a budget (LAYOUT_BUDGET §7, P04).
 */
export function renderCard(disputes, ctx) {
  const list = (disputes || []).filter(Boolean);
  if (!list.length) return null;
  const d = list[0];
  const box = el('section.cx-panel.cx-panel--plain.hgx-card', { dataset: { block: 'disagree' } });
  box.append(eyebrow(list.length === 1 ? 'Historians disagree about this place'
    : list.length + ' arguments historians are having about this place'));
  box.append(el('p.hgx-card__q', { text: d.question }));

  const names = (d.positions || []).map((p) => p.who.split(',')[0]).join(' · ');
  box.append(el('p.hgx-card__who', { text: names }));

  const judged = judgementFor(d.id);
  box.append(el('p.cx-note.hgx-card__say', {
    text: judged
      ? 'You have taken a position on this one. Your answer, the verdict and the evidence are open.'
      : 'Each of them names the evidence they read and the thing they have to explain away. '
        + 'You have to pick one and say why before this atlas will tell you where the argument stands.',
  }));
  box.append(el('button.cx-more.hgx-card__go', {
    type: 'button', dataset: { hgx: 'open', dispute: d.id },
  }, el('span', { text: judged ? 'Read it again, with your answer' : 'Weigh it up' })));

  if (list.length > 1) {
    const ul = el('ul.hgx-card__more');
    for (const other of list.slice(1)) {
      ul.append(el('li', {}, el('button.cx-more', { type: 'button', dataset: { hgx: 'open', dispute: other.id } },
        el('span', { text: other.question }))));
    }
    box.append(ul);
  }
  box.append(indexLink(disputeCount()));
  void ctx;
  return box;
}

/* ---------------------------------------------------------- the shape ------
 * FEATURE_SPEC charge 8's second half: footnote numbers do not aggregate into
 * a picture, so an evidence base has no shape until something draws one. This
 * is that, in one line, before a word of the argument is read — how many
 * historians' works this argument stands on, how many documents made at the
 * time it has to account for, and how many of those were made by somebody on
 * the receiving end. Every figure is counted off this dispute's own fields; a
 * dispute with no contemporary document says so in words and never prints a 0.
 */
function textsOf(d) {
  return (d.testimony || []).map((id) => TESTIMONY_BY_ID.get(id)).filter(Boolean);
}

/**
 * SPLIT THE DOCUMENTS BY WHEN THEY WERE MADE.
 *
 * The panel used to print "n documents made at the time" over whatever ids a
 * dispute listed. For the 1857 argument the one document was Gandhi's statement
 * at the Great Trial — 1922, sixty-five years after the rising — and this panel,
 * whose entire subject is provenance, described it as contemporary. A caption
 * that is wrong about when a text was made teaches the opposite of what the
 * apparatus above it teaches.
 *
 * Nothing is dropped. What a nationalist leader said in a British court in 1922
 * is part of the argument about what to call 1857; it is simply printed under a
 * heading that says when it was written. Every dispute carries `span`, the years
 * it is about, and `whenMade()` places each text against it.
 */
function byWhen(d) {
  const out = { during: [], before: [], after: [] };
  for (const t of textsOf(d)) out[whenMade(d, t.year)].push(t);
  return out;
}

const WHEN_LABEL = {
  during: 'made while this was happening',
  before: 'made before it, and read into it',
  after: 'made afterwards \u2014 not evidence from the time, but part of the argument',
};

function shapeBlock(d) {
  const works = sourcesOf(d).length;
  const when = byWhen(d);
  const texts = textsOf(d);
  const voice = voiceTally(texts.map((t) => ({ voice: VOICE[t.id] })));
  const box = el('section.cx-panel.cx-panel--plain.hgx-shape');
  box.append(eyebrow('What this argument stands on'));
  const row = el('div.hgx-shape__figs');
  const cell = (v, l) => {
    const c = el('div.cx-fig.cx-fig--sm');
    c.append(el('span.cx-fig__v', { text: String(v) }), el('span.cx-fig__l', { text: l }));
    return c;
  };
  row.append(cell(works, works === 1 ? 'work by a historian' : 'works by historians'));
  /* Only the contemporary ones are counted as documents made at the time,
     because that is what the words say. A dispute whose only text was written
     afterwards prints no figure at all rather than a figure that is wrong. */
  if (when.during.length) {
    row.append(cell(when.during.length,
      when.during.length === 1 ? 'document made at the time' : 'documents made at the time'));
  }
  const later = when.before.length + when.after.length;
  if (later) row.append(cell(later, later === 1 ? 'text from outside those years' : 'texts from outside those years'));
  box.append(row);
  /* WHEN, IN ONE SENTENCE. The figures above say how many; this says whether
     they were written while the thing was happening. For 1857 the honest answer
     is that none of them were, and the panel says it in those words rather than
     printing a 0. */
  const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven'];
  const word = (n) => (WORD[n] || String(n));
  const outside = when.before.concat(when.after).map((t) => t.year).sort();
  let whenLine = 'The years this argument is about: ' + d.span[0] + '\u2013' + d.span[1] + '.';
  if (texts.length && !when.during.length) {
    whenLine += texts.length === 1
      ? ' Nothing in this atlas was written inside them; the one text below is from ' + outside[0] + '.'
      : ' Nothing in this atlas was written inside them; the ' + word(texts.length) + ' texts below are from '
        + outside.join(' and ') + '.';
  } else if (texts.length && outside.length) {
    whenLine += (when.during.length === 1 ? ' One of the texts below was' : ' ' + word(when.during.length).replace(/^./, (c) => c.toUpperCase()) + ' of the texts below were')
      + ' written inside them and ' + (outside.length === 1 ? 'one outside' : word(outside.length) + ' outside')
      + ', and each says which.';
  } else if (texts.length) {
    whenLine += texts.length === 1
      ? ' The one text below was written inside them.'
      : ' Every text below was written inside them.';
  }
  box.append(el('p.cx-note.hgx-shape__span', { text: whenLine }));
  /* Who made those documents is the fact about them, and it belongs in the
     sentence rather than in a third figure: "1 of them by somebody from here"
     is a number that means nothing without the clause it needs anyway. */
  const whose = !texts.length ? ''
    : voice.subject === 0
      ? (texts.length === 1 ? 'It was made by a Briton \u2014 read it knowing that. '
        : 'Every one of them was made by a Briton \u2014 read them knowing that. ')
      : voice.subject === texts.length
        ? (texts.length === 1 ? 'It was made by somebody on the receiving end of it. '
          : 'All of them were made by people on the receiving end of it. ')
        : voice.subject + ' of the ' + texts.length + ' were made by somebody from here. ';
  box.append(el('p.cx-note', {
    text: (texts.length
      ? whose + 'Each is printed below with the four questions answered above it \u2014 what it is, who made it, what for, and what it cannot tell you. '
      : 'This atlas holds no text of its own that bears directly on this argument, so what follows rests on the historians\u2019 reading of archives it does not reproduce. ')
      + 'A monograph is a source too: somebody made it, for a reason, out of a particular archive.',
  }));
  return box;
}

/* ------------------------------------------------------------- a position -- */

function positionCard(p, i, dispute) {
  const card = el('article.hgx-pos', { dataset: { pos: p.key } });
  card.append(el('p.hgx-pos__who', {},
    el('span.hgx-pos__n', { text: String(i + 1), 'aria-hidden': 'true' }),
    el('b', { text: p.who })));
  card.append(el('p.hgx-pos__badge', { text: p.badge }));
  card.append(el('p.hgx-pos__short', { text: p.short }));
  card.append(el('p.hgx-pos__claim', { text: p.claim }));

  const dl = el('dl.hgx-pos__ev');
  dl.append(el('dt.sc', { text: 'The evidence they read' }));
  dl.append(el('dd', { text: p.reads }));
  dl.append(el('dt.sc', { text: 'What they have to explain away' }));
  dl.append(el('dd.hgx-pos__against', { text: p.explainAway }));
  card.append(dl);
  void dispute;
  return card;
}

/* ------------------------------------------------------------ the question --
 * The only thing standing between the reader and the verdict, and it is not
 * a formality: a choice AND a sentence.
 */
function askBlock(d, state) {
  const box = el('form.cx-ask.hgx-ask', {
    dataset: { hgxform: d.id },
    onsubmit: (ev) => ev.preventDefault(),
  });
  box.append(el('span.cx-ask__eyebrow', { text: 'Decide, before this atlas tells you anything' }));
  box.append(el('p.cx-ask__q.hgx-ask__q', { text: 'Which of these explains more?' }));

  const row = el('div.cx-ask__choices.hgx-choices', { role: 'radiogroup', 'aria-label': 'Which explains more' });
  for (const c of choicesFor(d)) {
    const b = el('button.hgx-choice', {
      type: 'button',
      dataset: { hgx: 'pick', dispute: d.id, value: c.id },
      'aria-pressed': state.pick === c.id ? 'true' : 'false',
    }, el('b', { text: c.label }), el('span', { text: c.full }));
    if (state.pick === c.id) b.dataset.chosen = 'yes';
    row.append(b);
  }
  box.append(row);

  const id = 'hgx-why-' + d.id;
  box.append(el('label.hgx-ask__label', { for: id, text: 'And say why, in a sentence. What does your answer explain that the other does not?' }));
  const ta = el('textarea.hgx-ask__why', {
    id, rows: '3', dataset: { hgx: 'why', dispute: d.id },
    placeholder: 'Because…',
    'aria-describedby': id + '-help',
  });
  ta.value = state.why || '';
  box.append(ta);

  const short = (state.why || '').trim().length < MIN_CHARS;
  box.append(el('p.cx-note.hgx-ask__help', {
    id: id + '-help',
    text: 'Nothing here is graded and there is no right answer. The verdict, the evidence and what would settle '
      + 'the argument are not on this page until you have committed — because a position you have taken is one '
      + 'you notice being tested.',
  }));
  const go = el('button.hgx-ask__go', {
    type: 'button', dataset: { hgx: 'commit', dispute: d.id },
  }, el('span', { text: 'Commit, and open the verdict' }));
  go.disabled = !state.pick || short;
  box.append(go);
  if (go.disabled) {
    box.append(el('p.cx-note.cx-note--warn.hgx-ask__need', {
      text: !state.pick ? 'Choose one of the answers above.'
        : 'A few more words — at least ' + MIN_CHARS + ' characters, so the sentence says something you can be held to.',
    }));
  }
  return box;
}

/* --------------------------------------------------------------- the reveal -- */

function verdictBlock(d, judged) {
  const wrap = el('div.hgx-verdict');

  const mine = el('div.hgx-mine');
  mine.append(el('span.sc.hgx-k', { text: 'You said' }));
  mine.append(el('p.hgx-mine__pick', {}, el('b', { text: judged.label })));
  mine.append(el('blockquote.hgx-mine__why', {}, el('p', { text: judged.why })));
  /* Read back out of the Ledger rather than out of this session. Said plainly,
     because a panel that shows a student words they do not remember writing
     without saying where they came from is doing something they cannot check. */
  if (judged.restored) {
    mine.append(el('p.cx-note.hgx-mine__when', {
      text: 'You wrote that in an earlier visit. It is kept in your own record on this device, '
        + 'and it is the answer this atlas holds you to.',
    }));
  }
  wrap.append(mine);

  const [word, gloss] = BALANCE_WORD[d.verdict.balance] || ['', ''];
  const v = el('section.cx-panel.hgx-v', { dataset: { balance: d.verdict.balance } });
  v.append(eyebrow('Where the argument stands'));
  v.append(el('p.hgx-v__balance', {},
    el('span.hgx-chip', { dataset: { balance: d.verdict.balance }, text: word }),
    el('span.hgx-v__gloss', { text: gloss })));
  if (d.verdict.lead) v.append(el('p.hgx-v__lead', { text: d.verdict.lead }));
  v.append(el('p.hgx-v__text', { text: d.verdict.text }));
  if (d.verdict.note) v.append(el('p.hgx-v__note', { text: d.verdict.note }));
  wrap.append(v);

  return wrap;
}

/* WHAT WOULD DECIDE IT, named before it is discussed.
 * `settleKey` is the evidence itself — an archive, a series, a comparison, or,
 * three times in fourteen, the honest answer that no evidence exists and why.
 * It is a required field, checked by audit(), so an argument cannot enter this
 * atlas without saying what would end it. */
function settleBlock(d) {
  const s = el('section.cx-panel.cx-panel--plain.hgx-settle');
  s.append(eyebrow('What would settle it'));
  if (d.settleKey) {
    s.append(el('p.hgx-settle__key', {},
      el('span.sc.hgx-k', { text: 'the evidence itself' }),
      document.createTextNode(d.settleKey)));
  }
  s.append(el('p', { text: d.settle }));
  return s;
}

/* ------------------------------------------------------------- the evidence -- */

/**
 * How a source is named on the pager. Short, and NEVER a truncated word.
 *
 * The first attempt cut at thirty characters and the Treaty of Nanking arrived
 * on screen as "The plenipotentiaries of Great, 1842". LAYOUT_BUDGET §4 says a
 * word cut mid-word teaches nothing, and a party to a treaty cut mid-name
 * teaches something false. So nothing is ever cut: where the author is an
 * institution or a list too long to be a label, the document's own name is used
 * instead, and where both are long the label wraps.
 */
const clause = (t) => String(t || '').replace(/\s*\((ed|eds|comp)s?\.?\)\s*$/i, '').split(/,| and | with |; /)[0].trim();

function srcLabel(x) {
  const a = clause(x.author);
  const w = clause(x.work);
  const name = (a && a.length <= 26) ? a : (w || a);
  return x.year ? name + ', ' + x.year : name;
}

/* A book can be BOTH a transcribed text in this atlas's corpus and the work
   behind a position — John Mitchel's Last Conquest is both, and the famine
   argument printed it twice with two different sets of provenance answers.
   The corpus copy wins, because it carries the words. */
const srcKey = (x) => [x.author, x.work, x.year].map((v) => String(v || '').toLowerCase().trim()).join('|');

/**
 * THE SOURCES, ONE PER CHAPTER.
 *
 * Measured at 390x844 after a commitment, with every source in one block: the
 * Scramble's came to 5,847px against a 145px reading window — forty screens
 * behind a single pager stop that said "3 of 3 · the sources". A source is the
 * natural unit here: one document, one set of four questions, one screen's worth
 * of provenance before the words. So each gets a chapter of its own and the
 * pager names it. Above 62rem every chapter is visible and this is a sequence of
 * blocks in one column, which is what it was before.
 */
function sourceChapters(d, opts = {}) {
  const out = [];
  const when = byWhen(d);
  const any = when.during.length + when.before.length + when.after.length;
  const intro = el('p.cx-note', {
    text: when.during.length
      ? (when.during.length === 1
        ? 'One document made while this was happening, which each of these positions has to account for. Its four questions are answered before the words, as they are everywhere in this atlas.'
        : when.during.length + ' documents made while this was happening, which these positions have to account for. Each carries its four questions before the words.')
      : 'No document in this atlas was made during the years this argument is about. What follows was written outside them, and is printed under a heading that says when.',
  });
  let first = true;
  for (const k of ['during', 'before', 'after']) {
    for (const t of when[k]) {
      const box = el('div.hgx-evpart');
      if (first) { box.append(eyebrow('The evidence at issue')); box.append(intro); first = false; }
      if (k !== 'during') box.append(el('p.hgx-ev__when.sc', { text: WHEN_LABEL[k] }));
      box.append(renderSource(t));
      out.push(chap('ev-' + t.id, srcLabel(t), box));
    }
  }
  const shown = new Set();
  for (const k of ['during', 'before', 'after']) for (const t of when[k]) shown.add(srcKey(t));
  const works = (opts.noWorks ? [] : sourcesOf(d)).filter((w) => !shown.has(srcKey(w)));
  works.forEach((w, n) => {
    const box = el('div.hgx-evpart');
    if (!n) {
      if (first) { box.append(eyebrow('The evidence at issue')); first = false; }
      box.append(el('p.cx-note.hgx-ev__k', {
        text: 'And the historians\u2019 own books and articles, put through the same four questions. A monograph is a source too: '
          + 'somebody made it, for a reason, out of a particular archive, and there are things it cannot reach.',
      }));
    }
    box.append(renderSource(w));
    out.push(chap('ev-w' + n, srcLabel(w), box));
  });
  if (!any && !works.length) {
    const box = el('div.hgx-evpart');
    box.append(eyebrow('The evidence at issue'));
    box.append(el('p.cx-note', { text: 'This atlas holds no text of its own that bears directly on this argument.' }));
    out.push(chap('ev-none', 'the sources', box));
  }
  return out;
}

/* ------------------------------------------------------------- the lens ------
 * Kenya only, and it exists to stop a specific misuse. FEATURE_SPEC §2 P16
 * test 3: filtering to "what could be known before 2011" must name what the
 * Hanslope Park files actually added and must state that Anderson and Elkins
 * had established the hangings and the camps in 2005 from other records.
 */
function lensBlock(d, on) {
  if (!d.lens) return null;
  const box = el('section.cx-panel.hgx-lens', { dataset: { on: on ? 'yes' : 'no' } });
  box.append(eyebrow('The evidence lens'));
  box.append(el('button.cx-more.hgx-lens__go', {
    type: 'button', dataset: { hgx: 'lens', dispute: d.id }, 'aria-expanded': on ? 'true' : 'false',
  }, el('span', { text: on ? 'Show every claim again' : d.lens.label })));

  const ul = el('ul.hgx-lens__list');
  let live = 0;
  for (const c of d.lens.claims) {
    const greyed = on && c.since > 2010;
    if (!greyed) live++;
    const li = el('li.hgx-lens__row', { dataset: { greyed: greyed ? 'yes' : 'no' } });
    li.append(el('p.hgx-lens__claim', { text: c.text }));
    li.append(el('p.hgx-lens__src', {}, el('span.num', { text: String(c.since) }), document.createTextNode(' · ' + c.source)));
    ul.append(li);
  }
  box.append(el('p.hgx-lens__count', {},
    el('span.sc.hgx-k', { text: 'Claims supported' }), ' ',
    el('span.num', { text: live + ' of ' + d.lens.claims.length })));
  box.append(ul);
  box.append(el('p.cx-note.cx-note--warn.hgx-lens__cap', { text: d.lens.caption }));
  return box;
}

/* ------------------------------------------------------------ the full block -- */

/* =============================================================== CHAPTERS ====
 * THE PHONE, WHICH IS THE DEVICE MOST STUDENTS HOLD.
 *
 * Measured on the running app before this pass, with an argument open:
 *
 *   390x844   the sheet body is 390x198 and the argument is 3,016px tall  15.3 : 1
 *   768x1024  the sheet body is 768x223 and the argument is 2,012px tall   9.0 : 1
 *   900x700   the rail column is 303x571                                   6.7 : 1
 *   1440x900  the rail column is 431x767                                   3.7 : 1
 *
 * At 390 that is five lines of prose at a time through a fifteen-screen scroll,
 * with a position card, a treaty and a commitment somewhere inside it. A student
 * cannot hold two historians in tension by scrolling past them one clause at a
 * time — which is the exact thing this panel exists to make them do.
 *
 * So in the sheet band the argument is CHAPTERED: the question, then one
 * historian per screen, then the commitment; and after the commitment, the
 * verdict, what would settle it, and the sources. One chapter is one thing to
 * read. The pager is sticky at the top of the scroller because in a 198px
 * window a control at the foot of a chapter is a control nobody finds.
 *
 * Two rules govern it and neither is negotiable:
 *   1. IT IS PRESENTATION, NOT CONTENT. Every chapter is in the DOM at every
 *      viewport; below 62rem the ones that are not current carry `hidden`. The
 *      band changes on resize and `paginate()` is re-run — nothing is rebuilt,
 *      so a half-typed sentence survives a rotation.
 *   2. IT DOES NOT TOUCH THE BRANCH. The verdict and the settle-field are still
 *      not rendered at all until the student has committed. Chapters exist
 *      inside whichever half of that branch is live; they never carry content
 *      across it.
 */

/** A painted fade for the line somebody else's sticky bar would slice in half.
 *  Sticky, decorative, and invisible until `liftPager()` finds furniture at the
 *  foot of the reading window that is not ours. */
function veilEl() {
  return el('div.hgx-veil', { 'aria-hidden': 'true' });
}

/** Wrap one block as a chapter. `label` is what the pager prints. */
function chap(key, label, node) { return node ? { key, label, node } : null; }

/* The same name `choicesFor` uses, so the pager and the buttons that ask the
   student to choose print the same name for the same person. */
const chapterName = positionName;

function pagerEl(d, chapters) {
  const nav = el('nav.hgx-pager', {
    hidden: true, 'aria-label': 'Move through this argument',
    dataset: { dispute: d.id, n: String(chapters.length) },
  });
  nav.append(el('button.hgx-pager__go', {
    type: 'button', dataset: { hgx: 'step', dispute: d.id, dir: '-1' },
  }, el('span', { text: '← Back' })));
  nav.append(el('p.hgx-pager__at', { 'aria-live': 'polite' },
    el('span.num.hgx-pager__n', { text: '1' }),
    document.createTextNode(' of ' + chapters.length + ' · '),
    el('span.hgx-pager__lab', { text: chapters[0] ? chapters[0].label : '' })));
  nav.append(el('button.hgx-pager__go', {
    type: 'button', dataset: { hgx: 'step', dispute: d.id, dir: '1' },
  }, el('span', { text: 'Next →' })));
  return nav;
}

/* ================================================= THE BAND, MEASURED =======
 * ROUND 3. The band used to be a WIDTH test — `#app[data-rail]` is `sheet`
 * below 62rem — and the thing it was trying to protect a reader from is a
 * HEIGHT. Measured on the running app, every argument opened in the rail:
 *
 *   viewport   the reading window        worst argument      screens
 *   390×844    .cx-sheet__body   198px   chaptered            2.6
 *   768×1024   .cx-sheet__body   223px   chaptered            1.4
 *   900×700    .cx-sheet__body   571px   NOT chaptered       15.4   ← the-scramble
 *   1024×640   .cx-sheet__body   511px   NOT chaptered       15.6   ← the-scramble
 *   1366×768   .cx-sheet__body   635px   NOT chaptered       10.3   ← the-scramble
 *   1440×900   .cx-sheet__body   767px   NOT chaptered        8.3   ← the-scramble
 *
 * 900×700 and 1024×640 are wide enough to be called desktop and short enough
 * that the reading window is smaller than a laptop's — and they were the two
 * worst viewports in this module by a factor of six, on the far side of a test
 * that could not see them. A rule about how much a reader can hold in view has
 * to be written against the view.
 *
 * So the band is measured off the surface the node is actually in — the
 * nearest scrolling ancestor, whoever owns it: the rail sheet, or a lesson
 * beat's `.tr-panel__scroll`, or a caller this module has never heard of. Two
 * conditions, either of which chapters the argument:
 *
 *   1. the reading window is shorter than WIN_FLOOR (620px), or
 *   2. the argument would take more than SCREENS (6) windowfuls to read.
 *
 * (1) is the old rule generalised: every window the shell calls a sheet is far
 * below the floor, so nothing that was chaptered stops being chaptered, and
 * 900×700, 1024×640 and any short beat panel now are. (2) catches the two
 * arguments — `the-scramble` and `waitangi-texts` — that carry parallel texts
 * and run two to three times the length of the other twelve: they are
 * chaptered in a laptop column where the other twelve read as one column, which
 * is the honest answer, because they are the ones that do not fit.
 *
 * It stays presentation, not content: every chapter is in the DOM at every
 * viewport and `paginate()` is re-run rather than anything rebuilt.
 */
export const BAND = Object.freeze({ WIN_FLOOR: 620, SCREENS: 6 });

/** The surface this node is really being read in: the nearest scrolling
 *  ancestor with a height. Falls back to the viewport, which is what a caller
 *  who mounts into a non-scrolling panel has actually given us. */
export function readingWindow(root) {
  let n = root && root.parentElement;
  for (let i = 0; n && i < 12; i += 1, n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (/auto|scroll|overlay/.test(cs.overflowY) && n.clientHeight > 24) return n;
  }
  return null;
}

/** How tall the whole argument is when nothing is hidden.
 *  Measured with every chapter shown and put back in the same frame, so it
 *  costs one synchronous layout and never paints. Cached against the width it
 *  was measured at, because a rotation changes the answer. */
export function naturalHeight(root) {
  if (!root) return 0;
  const w = Math.round(root.clientWidth || 0);
  if (w > 0 && Number(root.dataset.natw) === w && Number(root.dataset.nath) > 0) {
    return Number(root.dataset.nath);
  }
  const chapters = [...root.querySelectorAll(':scope > .hgx-chaps > .hgx-chap')];
  if (!chapters.length) return 0;
  const was = chapters.map((c) => c.hidden);
  chapters.forEach((c) => { c.hidden = false; });
  const h = Math.round(chapters.reduce((a, c) => a + c.getBoundingClientRect().height, 0));
  chapters.forEach((c, i) => { c.hidden = was[i]; });
  if (h > 0 && w > 0) { root.dataset.nath = String(h); root.dataset.natw = String(w); }
  return h;
}

/**
 * Should this argument be chaptered where it stands?
 *
 * `hint` is the shell's own answer — `#app[data-rail] === 'sheet'` — and it
 * wins when it is true, because a bottom sheet is a bottom sheet whatever a
 * measurement says. Everything else is measured.
 */
export function bandFor(root, hint) {
  if (hint) return true;
  if (!root || !root.isConnected) return !!hint;
  const win = readingWindow(root);
  const wh = win ? win.clientHeight : (typeof innerHeight === 'number' ? innerHeight : 0);
  if (!wh) return !!hint;
  if (wh < BAND.WIN_FLOOR) return true;
  const nat = naturalHeight(root);
  return nat > 0 && nat > wh * BAND.SCREENS;
}

/* ============================== TWO THINGS PINNED TO ONE SCROLLER'S FOOT =====
 * FOUND BY DRIVING THE APP, ROUND 3, AND NOT BY ANY CRITIC.
 *
 * At 390x844 with an argument open, `elementFromPoint` at the centre of this
 * panel's own Next button returns `cl-blk__finish`. The Close module puts the
 * through-line block — `.cl-blk`, `position: sticky`, `z-index: 4` — INSIDE
 * `.cx-sheet__body`, the same 198px scroller this panel is rendered into, and
 * pins it to the bottom. The pager is sticky at `z-index: 2` and pinned to the
 * same edge. Measured: pager 390x47 at y=613, through-line block 390x33 at
 * y=611, and the through-line wins. Back and Next were drawn under it and a
 * tap on either of them landed on the through-line, on every one of the
 * fourteen arguments, at the viewport most students hold.
 *
 * Two modules each did the right thing on the assumption that the foot of the
 * scroller was theirs. Neither is wrong and the collision is real, so this is
 * fixed on our side only, by measurement, and without touching anything the
 * Close module owns: whatever is stuck across our buttons is measured, and the
 * pager is lifted to sit ON TOP OF it rather than under it. The through-line
 * keeps the edge — it is the app's C5 centrepiece and it belongs there — and
 * the pager becomes the row above it.
 *
 * If nothing is stuck there, the lift is 0 and the geometry is what it was.
 */
/** How far above the foot of `win` somebody else's stuck furniture begins.
 *  0 when the foot is ours. Measured, never assumed: we ask the browser what
 *  is painted at the bottom of the reading window and walk up from it to the
 *  thing that is stuck there. */
function stuckFoot(root, win) {
  const wb = win.getBoundingClientRect();
  if (!wb.height) return 0;
  let clear = 0;
  /* Two levels of the scroller's own children, which is where a bar that pins
     itself to a panel's foot lives — `.cl-blk` is a direct child of
     `.cx-sheet__body`. Bounded on purpose: this runs on every page turn, and
     walking a whole argument's subtree to find one sticky bar would be a
     hundred times the work for the same answer. */
  const look = [];
  for (const kid of win.children) {
    if (kid === root || kid.contains(root) || root.contains(kid)) continue;
    look.push(kid);
    for (const g of kid.children) look.push(g);
  }
  for (const n of look) {
    const cs = getComputedStyle(n);
    if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
    const b = n.getBoundingClientRect();
    /* Stuck at OUR foot: it ends inside the last 48px of the reading window. */
    if (!b.height || b.bottom < wb.bottom - 48 || b.top > wb.bottom) continue;
    clear = Math.max(clear, Math.round(wb.bottom - b.top));
  }
  return clear;
}

export function liftPager(root) {
  if (!root || !root.isConnected || typeof document === 'undefined') return 0;
  const win = readingWindow(root);
  const nav = root.querySelector('.hgx-pager');
  const paged = !!nav && !nav.hidden;
  if (!win) return 0;
  root.style.setProperty('--hgx-pager-lift', '0px');
  root.style.removeProperty('--hgx-foot-clear');
  root.style.removeProperty('--hgx-veil-at');
  delete root.dataset.footclear;
  const clear = stuckFoot(root, win);
  if (!clear) { if (nav) root.style.setProperty('--hgx-pager-lift', '0px'); return 0; }
  if (paged) {
    /* The pager owns our foot: lift it to sit ON TOP of their furniture rather
       than under it, and its own gradient goes on doing the fading. */
    root.style.setProperty('--hgx-pager-lift', clear + 'px');
  } else {
    /* No pager on this surface — the index, and any argument short enough to
       read as one column. Nothing of ours is at the foot to be lifted, so what
       is needed is the fade: `.hgx-veil` is sticky at their top edge and
       dissolves the line their bar would otherwise slice through its x-height.
       Measured at 390x844 on the index: `explain away, and asks you to choose
       and say` cut in half by `cl-blk`. */
    root.style.setProperty('--hgx-foot-clear', clear + 'px');
    root.style.setProperty('--hgx-veil-at', '0px');
    root.dataset.footclear = 'on';
    /* AND THEN CORRECT IT BY WHAT ACTUALLY HAPPENED. A sticky inset resolves
       against the scrollport, so a scroller with 16px of bottom padding lands
       the veil 16px above where the arithmetic says. Rather than hard-code
       somebody else's padding, put it where we asked, measure where it went,
       and close the difference. One reflow, on a redraw. */
    const veil = root.querySelector('.hgx-veil');
    if (veil) {
      const delta = Math.round(win.getBoundingClientRect().bottom
        - veil.getBoundingClientRect().bottom);
      if (delta && Math.abs(delta) < 200) root.style.setProperty('--hgx-veil-at', (-delta) + 'px');
    }
  }
  return clear;
}

/**
 * Show one chapter, or all of them.
 *
 * `on` is the band — see `bandFor()`, which measures it. Called after every
 * render AND on `chrome:layout` and on a resize of the surface we are mounted
 * in, so a rotation from portrait to landscape does not leave five chapters
 * hidden on a surface with room for all of them. Returns the step it settled
 * on, which the caller stores.
 */
export function paginate(root, on, want) {
  if (!root) return 0;
  const chapters = [...root.querySelectorAll(':scope > .hgx-chaps > .hgx-chap')];
  const nav = root.querySelector('.hgx-pager');
  if (!chapters.length) return 0;
  const step = Math.max(0, Math.min(chapters.length - 1, Number(want) || 0));
  /* THE PAGED STATE IS OURS TO DECLARE, and the stylesheet reads it here.
     It used to read `#app[data-rail="sheet"]` — the shell's width signal — and
     the moment the band stopped being a width test that selector was wrong in
     both directions: at 1366 an argument was chaptered with the fade that stops
     the sticky pager slicing a line through its x-height switched off, and in a
     short window at any width the chapter's bottom padding went missing. */
  root.dataset.paged = on ? 'on' : 'off';
  if (!on) {
    for (const c of chapters) c.hidden = false;
    if (nav) nav.hidden = true;
    /* The step is REMEMBERED, not reset. Measured: a reader on the commitment
       at 390 who rotated to landscape and back arrived on chapter 1 again,
       because the wide pass wrote a 0 into the stored step on its way through. */
    return step;
  }
  chapters.forEach((c, i) => { c.hidden = i !== step; });
  if (nav) {
    nav.hidden = false;
    const n = nav.querySelector('.hgx-pager__n');
    const lab = nav.querySelector('.hgx-pager__lab');
    if (n) n.textContent = String(step + 1);
    if (lab) lab.textContent = chapters[step].dataset.label || '';
    const back = nav.querySelector('[data-dir="-1"]');
    const next = nav.querySelector('[data-dir="1"]');
    if (back) back.disabled = step === 0;
    if (next) next.disabled = step === chapters.length - 1;
  }
  /* Clear whatever else is pinned to the foot of this scroller. Measured, in
     the frame after the chapter is shown, because the answer depends on what
     the caller's surface has put there. */
  liftPager(root);
  return step;
}

/** How many chapters an argument in this state has. */
export function chapterCount(root) {
  return root ? root.querySelectorAll(':scope > .hgx-chaps > .hgx-chap').length : 0;
}

export function assemble(root, chapters) {
  const list = chapters.filter(Boolean);
  const wrap = el('div.hgx-chaps');
  list.forEach((c, i) => {
    const sec = el('section.hgx-chap', {
      dataset: { chap: c.key, label: c.label, i: String(i) },
      'aria-label': c.label,
    });
    sec.append(c.node);
    wrap.append(sec);
  });
  root.append(wrap);
  /* THE PAGER GOES LAST, AND THAT IS A KEYBOARD DECISION.
     Measured at 390x844 with the pager first: focus lands on the question (it is
     what you have come to read), and a forward Tab from there has to travel the
     whole rest of the document and wrap — 21 presses — before it reaches Next.
     Last in the document, the loop is the loop a reader actually performs: read
     the chapter, Tab to Next, press it. It is pinned to the foot of the scroller
     by CSS, so it is on screen the whole time either way, and at 390 the foot is
     also where the thumb is. */
  root.append(pagerEl({ id: root.dataset.dispute }, list));
  root.append(veilEl());
  return root;
}

/* --------------------------------------------------------- the two halves -- */

function beforeChapters(d, state, ctx, opts) {
  const out = [];
  const head = el('div.hgx-head');
  head.append(el('p.hgx__q', { text: d.question }));
  head.append(el('p.hgx__stake', { text: d.stake }));
  if (opts.lede) head.append(el('p.cx-note.hgx__lede', { text: opts.lede }));
  head.append(shapeBlock(d));
  out.push(chap('question', 'the question', head));

  /* ONE HISTORIAN PER CHAPTER. This is the point of the whole exercise: two or
     three people who read different records reached different conclusions, and
     the student has to hold them side by side. On a phone "side by side" is
     "one after another with a counter saying 2 of 5", and that is still the
     comparison — it is not the same as scrolling past them. */
  (d.positions || []).forEach((p, i) => {
    const grid = el('div.hgx-grid', { dataset: { n: '1' } });
    grid.append(positionCard(p, i, d));
    out.push(chap('pos-' + p.key, chapterName(p), grid));
  });

  if (d.parallelTexts && typeof ctx.parallel === 'function' && !opts.gate) {
    /* The Waitangi apparatus is two exercises in one block — the disputed
       clauses paired, and then both texts whole with their four questions. At
       390x844 the two together measured 2,847px against a 145px reading window,
       nineteen screens, and the pager said "4 of 5" over all of it. It comes
       back as two chapters. */
    const parts = ctx.parallel(d, state) || [];
    for (const part of (Array.isArray(parts) ? parts : [{ key: 'parallel', label: 'the two texts', node: parts }])) {
      if (part && part.node) out.push(chap(part.key, part.label, part.node));
    }
  }

  /* THE FOUR LINES THE STUDENT WRITES, before they judge the people who read
     the document. Six of the fourteen arguments carry one (produce.js), and it
     stands here — after the historians have named the evidence they read, and
     before the commitment — because "say what this document is" is a different
     act from "say who explains more", and doing the first makes the second
     harder in the way it should be. Not in a mounted gate: a beat has already
     spent that attention on documents of its own, and the path mounts an
     exercise on its own through CONTRACT.md §9 instead. */
  /* ROUND 5 MADE THAT A CHOICE INSTEAD OF A RULE, because the rubric critic
     found the four lines firing exactly once on the whole default route. A
     caller that asks for `withSource` gets the exercise inside its gate, and
     `costOf(ex)` on the reply says what that costs in seconds in the path's
     own cost model, so a beat with a minute budget can decide rather than
     guess. The default does not move: no exercise in a gate unless asked for. */
  if (!opts.gate || opts.withSource) {
    const ex = productionFor(d.id);
    if (ex) for (const c of produceChapters(ex, state, ctx, opts)) out.push(c);
  }

  const decide = el('div.hgx-decide');
  decide.append(askBlock(d, state));
  /* THE BRANCH. Everything below this point exists only on the far side of
     a commitment, and this is where it stops. */
  decide.append(el('p.cx-note.hgx__stop', {
    text: 'Below this line, once you have answered: where the argument stands, what would settle it, '
      + 'and every source each side is reading, with its provenance.',
  }));
  out.push(chap('decide', 'decide', decide));
  return out;
}

function afterChapters(d, state, judged, opts, ctx) {
  const out = [];
  /* Measured at 390x844: verdict + settle in one chapter came to 1,008–1,508px
     against a 145px window. They are two different acts of reading — here is
     where the argument stands; here is what would end it — and they are now two
     stops. */
  out.push(chap('verdict', 'the verdict', verdictBlock(d, judged)));
  out.push(chap('settle', 'what would settle it', settleBlock(d)));

  if (d.atlasCan) {
    const a = el('section.cx-panel.cx-panel--plain.hgx-atlas');
    a.append(eyebrow('What this atlas can do about it'));
    /* Classed because the step control rewrites it in place: the note travels
       with the year, and a panel captioning 1840 with what happened in 1863
       is a sentence about a map that is not on screen. */
    a.append(el('p.hgx-atlas__note', { text: d.atlasCan.note }));
    a.append(el('button.cx-more', { type: 'button', dataset: { hgx: 'atlas', dispute: d.id } },
      el('span', { text: d.atlasCan.label })));
    if (d.atlasCan.honest) a.append(el('p.cx-note.cx-note--warn', { text: d.atlasCan.honest }));
    out.push(chap('atlas', 'on the map', a));
  }

  /* THE DOCUMENTS SURVIVE THE JUDGEMENT.
     `renderFull` swaps the whole set of chapters at the commitment, and the
     parallel texts were built only into the pre-commit half — so a student who
     judged the Waitangi argument lost the two texts of the treaty, the clause
     locking and Kawharu's back-translation the moment they committed, which is
     every part of FEATURE_SPEC §2 P16 test 5. They are evidence, not a teaser
     shown until a button is pressed. They come back here, after the verdict and
     what would settle it, because that is the order a reader wants them in:
     here is where the argument stands, here is what would end it, now read the
     paper it turns on. */
  if (d.parallelTexts && ctx && typeof ctx.parallel === 'function' && !opts.gate) {
    const parts = ctx.parallel(d, state) || [];
    for (const part of (Array.isArray(parts) ? parts : [])) {
      if (part && part.node) out.push(chap(part.key, part.label, part.node));
    }
  }

  /* And the source exercise survives the judgement, for the same reason the
     parallel texts do: it is evidence and a piece of the student's own work,
     not a teaser shown until a button is pressed. A student who wrote four
     lines before committing finds them here beside the atlas's four; a student
     who has not written them yet is still asked. */
  if (!opts.gate || opts.withSource) {
    const ex = productionFor(d.id);
    /* `printed` is checked against this argument's own testimony list rather
       than assumed: the second half prints every source the argument reads, and
       for some of the exercises that includes the very document the
       exercise is about. For the others it does not, and telling a student
       "the answers are printed below" when they are not would be this project's
       oldest bug — a sentence about a record written without reading it. */
    if (ex) {
      for (const c of produceChapters(ex, state, ctx,
        { ...opts, after: true, printed: (d.testimony || []).includes(ex.doc) })) out.push(c);
    }
  }

  const lens = lensBlock(d, !!state.lens);
  if (lens) out.push(chap('lens', 'the evidence lens', lens));

  for (const c of sourceChapters(d, { noWorks: !!opts.gate })) out.push(c);

  const end = el('div.hgx-evpart');
  if (opts.gate) {
    end.append(el('p.cx-note', {
      text: 'The historians’ own books, each with the same four questions answered about it, are in the '
        + 'full argument — with the thirteen other arguments this atlas holds open.',
    }));
    end.append(el('button.cx-more', { type: 'button', dataset: { hgx: 'open', dispute: d.id } },
      el('span', { text: 'Open the whole argument' })));
  } else {
    end.append(indexLink(disputeCount()));
  }
  /* Not a chapter of its own: a route out is 18px of link, and a pager stop
     that holds one link is a stop that wastes a press. It rides on the last
     chapter the reader will reach anyway. */
  const last = out[out.length - 1];
  if (last) last.node.append(end); else out.push(chap('end', 'the sources', end));
  return out;
}

/* ------------------------------------------------------------ the full block -- */

export function renderFull(d, state, ctx, opts = {}) {
  const root = el('div.hgx', { dataset: { dispute: d.id, mode: opts.gate ? 'gate' : 'full' } });
  const judged = judgementFor(d.id);
  const chapters = judged
    ? afterChapters(d, state, judged, opts, ctx)
    : beforeChapters(d, state, ctx, opts);
  return assemble(root, chapters);
}

/* ================================================================ THE GATE ==
 * WHAT THE LESSON PATH MOUNTS. See ./CONTRACT.md for the full contract.
 *
 * Same argument, same commitment, same refusal to print a verdict before one.
 * Three differences, all of them about a beat rather than about the argument:
 *   - the parallel-texts apparatus is left out (it is a second exercise);
 *   - the historians' own monographs are not re-printed with their four
 *     questions, because the beat has already spent that attention on the
 *     documents, and a route to them is offered instead;
 *   - the caller's own sentence can stand under the question, so the lesson can
 *     say why it has stopped here.
 * Everything a student has to do to get past it is identical, and the judgement
 * is written to the same Ledger under the same key, so the Close prints it in
 * the student's own words whichever surface they met it on.
 */
export function renderGate(d, state, ctx, opts = {}) {
  const node = renderFull(d, state, ctx, { ...opts, gate: true, lede: opts.lede || (d.pathGate && d.pathGate.lede) });
  node.classList.add('hgx--gate');
  return node;
}

/* The only route out of one argument and into the rest of them. It is printed
   at the foot of every argument and under every dossier card, because a reader
   who has just done one of these is the reader most likely to want another,
   and a deep link is not a route a student can find. */
export function indexLink(n) {
  return el('p.cx-note.hgx-index__foot', {},
    el('button.cx-more', { type: 'button', dataset: { hgx: 'index' } },
      el('span', { text: 'All ' + n + ' arguments this atlas holds open' })));
}

/* ------------------------------------------------------------- the index ---- */

export function renderIndex(disputes, ctx) {
  const root = el('div.hgx-index');
  root.append(el('p.hgx-index__lede', {
    text: 'Every argument this atlas holds where named historians reach different conclusions from the same evidence. '
      + 'Each one states each position in the form its own author would recognise, names the evidence each side reads '
      + 'and the thing each has to explain away, and asks you to choose and say why before it tells you where the '
      + 'argument stands.',
  }));
  const n = disputes.filter((d) => judgementFor(d.id)).length;
  root.append(el('p.cx-note', {
    text: n === 0
      ? 'You have not taken a position on any of them yet.'
      : 'You have taken a position on ' + n + ' of ' + disputes.length + '. Opening one again shows you what you said.',
  }));
  const ul = el('ul.hgx-index__list');
  for (const d of disputes) {
    const li = el('li.hgx-index__row', { dataset: { judged: judgementFor(d.id) ? 'yes' : 'no' } });
    li.append(el('button.cx-more.hgx-index__go', { type: 'button', dataset: { hgx: 'open', dispute: d.id } },
      el('span', { text: d.question })));
    li.append(el('p.hgx-index__who', { text: (d.positions || []).map((p) => p.who).join('  vs  ') }));
    ul.append(li);
  }
  root.append(ul);
  root.append(veilEl());
  void ctx;
  return root;
}

export { commit };
