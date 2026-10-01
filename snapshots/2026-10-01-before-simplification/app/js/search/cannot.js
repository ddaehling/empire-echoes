/**
 * search/cannot.js — WHAT THIS ATLAS CANNOT TELL YOU.
 *
 * -------------------------------------------------------------------------
 * WHY THIS EXISTS
 *
 * P07 already returns an absence as a result (FEATURE_SPEC §1 charge 7,
 * Move 3). But you only meet it if you happen to type the question. A student
 * who has never heard of Operation Legacy will never search for it, so the
 * strongest thing in this piece was reachable only by people who already knew
 * it was there. That is the same failure the whole app was sent to fix — "the
 * app hands a student a world map and leaves them to click" — repeated inside
 * the archive.
 *
 * So the 180 holes become a reference work: grouped, counted, named, and
 * openable one by one. It lives in the rail sheet, so it costs the plate no
 * pixels at any disclosure level (LAYOUT_BUDGET §3, level 3).
 *
 * -------------------------------------------------------------------------
 * THE ARGUMENT IT MAKES, WHICH IS NOT THE ONE STUDENTS EXPECT
 *
 * Ask a class why we do not know how many people a colonial war killed and
 * they will tell you the records were burned. It is a satisfying answer: it
 * has a villain, a bonfire and a motive. Counted from this atlas's own notes,
 * it is also the RAREST of the three shapes:
 *
 *   destroyed         a record was made and somebody destroyed or hid it
 *   never-made        nobody with a pen was counting these people at all
 *   contested-range   the record exists and cannot settle the question
 *
 * The split is computed live from `buildSilences()`, never typed in here, so
 * it cannot drift from the dataset and a shard added tomorrow moves it. The
 * student commits to a guess before the counts appear (DIDACTIC_SPEC §4:
 * activation, then disconfirming evidence, then a replacement model), and the
 * commitment goes to the Ledger so the Close can quote it back.
 *
 * FEATURE_SPEC charge 7 warns against "a dramatised deletion". This surface is
 * the opposite move: it takes the drama out with the app's own arithmetic and
 * puts something harder in its place — an absence that needed no order, no
 * bonfire and no cover-up, only the decision that these deaths were not the
 * sort that get written down.
 *
 * WHICH MISCONCEPTION. DIDACTIC_SPEC §4 M18 — "historians agree about all this,
 * the facts are settled" — and its replacement model, verbatim: "knowing why a
 * number is uncertain is a higher skill than knowing the number." The third
 * shape, 80 of the 180, is that sentence with a count attached. The commitment
 * is written to the Ledger as M18 so the Close can tally it with the rest.
 *
 * NOTHING HERE INVENTS A FIGURE. Every count is `list.filter(...).length` over
 * records the dataset produced, and the caption says exactly that.
 */

import { el } from '../core/util.js';

const SHAPES = [
  {
    id: 'destroyed',
    label: 'Somebody destroyed the record',
    gloss: 'A record was made, and then a person destroyed, burned or removed it. There is a document-shaped hole, and someone put it there.',
  },
  {
    id: 'never-made',
    label: 'Nobody ever made the count',
    gloss: 'There is nothing to disclose, because nothing was written down. No order was needed, and no one had to hide anything.',
  },
  {
    id: 'contested-range',
    label: 'The record cannot settle it',
    gloss: 'Documents survive and historians read them differently. The honest answer is a range with a reason, and the midpoint is not the answer.',
  },
];

/* THE GUESS IS A NUMBER, NOT A MULTIPLE CHOICE. Three labelled options were
   tried first and had to go: with only 180 silences in the atlas, any option
   list that contains the true answer prints it on the screen before the
   student has committed to anything, and the option that carries the right
   number was also the option that carried the replacement model in its label.
   A free number on an axis gives nothing away, records what this student
   actually believed, and takes the same grammar as the app's other
   commitments — arrows move it, Enter commits (FEATURE_SPEC P08). */

/**
 * Build the sheet body.
 *
 * @param ctx        the module context (bus, store, format, data)
 * @param silences   the built silence index ({ list, byId })
 * @param onOpen     (record) => void — open one absence, in full
 * @param answered   a Ledger-shaped getter for a prior commitment, or null
 */
export function buildCannot(ctx, silences, onOpen, prior) {
  const { bus, format } = ctx;
  const list = silences.list;
  const n = list.length;

  const counts = {};
  for (const s of SHAPES) counts[s.id] = list.filter((r) => r.silenceKind === s.id).length;
  const destroyed = counts.destroyed;
  const named = list.filter((r) => r.silenceKind === 'destroyed' && !r.agentUnknown).length;
  const withRange = list.filter((r) => r.range).length;

  const root = el('div.cn');

  /* ---------------------------------------------------------- the lede -- */

  /* SHORT, BECAUSE THE QUESTION HAS TO BE ABOVE THE FOLD. Measured at 390x844:
     a four-sentence opening filled the whole bottom sheet and clipped the
     commitment mid-word. The provenance sentence it used to carry is at the
     foot of this surface instead, where the other caveat already lives. */
  root.append(el('p.cn__lede',
    'This atlas holds ', el('span.num', { text: format.number(n) }),
    ' questions it cannot answer. They come in three shapes, and telling them '
    + 'apart is the whole skill.'));

  /* -------------------------------------------------- the commit, first -- */

  const revealBox = el('div.cn__reveal', { hidden: true, tabindex: '-1' });
  const PROMPT = 'Of ' + n + ' things this atlas cannot tell you, how many are missing '
    + 'because somebody destroyed the record?';

  const readout = el('output.cn__read', { for: 'cn-guess' });
  const slider = el('input#cn-guess.cn__slider', {
    type: 'range', min: '0', max: String(n), step: '1', value: String(Math.round(n / 2)),
    'aria-label': PROMPT,
  });
  const go = el('button.cn__commit', { type: 'button' }, 'Commit this guess');
  const paintRead = () => {
    const v = Number(slider.value);
    readout.replaceChildren(
      el('span.num.cn__readn', { text: format.number(v) }),
      el('span.cn__readl', ' of ', el('span.num', { text: format.number(n) }),
        ' — ', el('span.num', { text: Math.round((v / n) * 100) + '%' })));
  };
  paintRead();
  slider.addEventListener('input', paintRead);
  slider.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); commit(Number(slider.value)); } });
  go.addEventListener('click', () => commit(Number(slider.value)));

  const ask = el('div.cx-ask.cn__ask',
    el('span.cx-ask__eyebrow', { text: 'Before you look' }),
    el('p.cx-ask__q', { text: PROMPT }),
    /* Axis, then scale, then the value beside its control. Two measurements
       drove this order. Stacked with the button on its own line, the commit
       fell below the fold of a 390px bottom sheet. With the value-and-button
       row ABOVE the slider, a keyboard reader tabbed into "Commit" before
       they had reached the thing they were meant to move. DOM order is
       visual order is tab order. */
    el('div.cn__guess',
      slider,
      el('p.cn__scale', el('span.num', '0'), el('span', { text: 'drag, or use ← →' }), el('span.num', { text: format.number(n) })),
      el('div.cn__guessrow', readout, go)));

  function commit(mine) {
    if (root.dataset.committed === 'yes') return;
    root.dataset.committed = 'yes';
    slider.disabled = true;
    go.remove();
    paintReveal(mine);
    bus.emit('ledger:append', {
      kind: 'predicted',
      claimId: 'p07:silence-shapes',
      misconceptionId: 'M18',
      prompt: PROMPT,
      youSaid: format.number(mine) + ' of ' + n,
      answer: destroyed + ' of ' + n + ' were destroyed; ' + counts['never-made'] + ' were never counted at all.',
    });
    bus.emit('search:silenceGuess', { youSaid: mine, answer: destroyed, of: n });
    revealBox.hidden = false;
    gate.hidden = false;
    gateNote.remove();
    revealBox.focus({ preventScroll: true });
    revealBox.scrollIntoView({ block: 'nearest' });
  }
  root.append(ask, revealBox);

  function paintReveal(mine) {
    revealBox.replaceChildren(
      el('p.cn__you', 'You said ', el('span.num', { text: format.number(mine) }), '. ',
        el('strong', 'It is ', el('span.num', { text: format.number(destroyed) })), '.'),
      el('p.cn__body',
        'Destruction is the rarest of the three and the easiest to picture: '
        + 'it has a villain, a bonfire and a motive. ',
        el('span.num', { text: format.number(counts['never-made']) }),
        ' of these holes needed none of that. Nobody with a pen was counting, '
        + 'so there was nothing to burn — and an absence that required no order '
        + 'and no cover-up is harder to argue with, and harder to repair.'),
      el('p.cn__body',
        'The third shape is the commonest kind of trouble a historian actually meets: ',
        el('span.num', { text: format.number(counts['contested-range']) }),
        ' places where documents do survive and will not settle the question. '
        + 'Across all three shapes, ', el('span.num', { text: format.number(withRange) }),
        ' of these ', el('span.num', { text: format.number(n) }),
        ' carry a range with a reason rather than a number, which is what an '
        + 'honest figure looks like when the record cannot do better.'),
      el('p.cn__warn.cx-note',
        'Watch what the first answer does if you keep it: if every gap is a bonfire, '
        + 'then finding the files would finish the argument. Most of these gaps have no files to find.'),
    );
  }

  /* ------------------------------------------------------- the three ---- */

  /* THE COUNTS ARE BEHIND THE QUESTION. Measured on the first build: the
     answer — "5 Somebody destroyed the record" — sat one scroll below the
     slider, so a reader could read it before committing to anything, and a
     prediction you can peek at is not a prediction. FEATURE_SPEC charge 12(c)
     already makes this the house rule: nothing of consequence renders before
     a committed guess. */
  const gate = el('div.cn__gate', { hidden: true });
  const gateNote = el('p.cn__gatenote.cx-note', { text:
    'The three counts are behind that question. Commit a number and they appear — a guess you can check first is not a guess.' });
  const groups = el('div.cn__groups');
  for (const shape of SHAPES) {
    const rows = list
      .filter((r) => r.silenceKind === shape.id)
      .sort((a, b) => (a.year || 9999) - (b.year || 9999) || String(a.owner).localeCompare(String(b.owner)));
    const body = el('ul.cn__list', { hidden: true, id: 'cn-l-' + shape.id });
    for (const r of rows) body.append(el('li.cn__item',
      el('button.cn__go', { type: 'button', onclick: () => onOpen(r) },
        el('span.cn__gow', { text: r.authored ? r.title : r.owner }),
        Number.isFinite(r.year) ? el('span.num.cn__goy', { text: format.year(r.year) }) : null,
        el('span.cn__gowho', { text: rowWhy(r, format) }))));

    const toggle = el('button.cx-more.cn__toggle', {
      type: 'button', 'aria-expanded': 'false', 'aria-controls': body.id,
      onclick: () => {
        const open = body.hidden;
        body.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Hide these' : 'All ' + rows.length + ', one by one';
      },
    }, 'All ' + rows.length + ', one by one');

    groups.append(el('section.cn__grp', { dataset: { shape: shape.id } },
      el('p.cn__grph',
        el('span.cn__grpn.num', { text: format.number(counts[shape.id]) }),
        el('span.cn__grpl', { text: shape.label })),
      el('p.cn__grpg', { text: shape.gloss }),
      shape.id === 'destroyed'
        ? el('p.cn__grpg.cn__grpg--who',
          named ? [el('span.num', { text: String(named) }), ' of these ', el('span.num', { text: String(destroyed) }),
            ' name the people who did it. '] : null,
          destroyed - named > 0
            ? [el('span.num', { text: String(destroyed - named) }), ' do not — and an unnamed destroyer is still a destroyer.']
            : null)
        : null,
      toggle, body));
  }
  gate.append(el('p.cx-panel__head.cn__head', { text: 'The three shapes, counted' }), groups);
  root.append(gateNote, gate);

  /* If this student already committed, in this session or a previous one, the
     surface opens where they left it rather than asking them twice. */
  if (prior && prior.youSaid) {
    const mine = parseInt(String(prior.youSaid).replace(/,/g, ''), 10);
    if (Number.isFinite(mine)) {
      root.dataset.committed = 'yes';
      slider.value = String(Math.min(n, mine));
      slider.disabled = true;
      paintRead();
      go.remove();
      paintReveal(mine);
      revealBox.hidden = false;
      gate.hidden = false;
      gateNote.remove();
    }
  }

  /* --------------------------------------------------------- the close -- */

  root.append(el('p.cn__foot.cx-note',
    'Every one of these was read out of a note the dataset already writes about '
    + 'its own numbers, not from a list somebody typed here, and the three counts '
    + 'are taken live from those ', el('span.num', { text: format.number(n) }),
    ' records. A shard that adds a note tomorrow moves them tomorrow. They are a '
    + 'fact about our bibliography, not a measurement of the past.'));

  return root;
}

/**
 * The one line under a row's name, and it has to say something different for
 * each shape or the group heading contradicts its own contents. A row under
 * "Nobody ever made the count" that reads "100–2,000 people dead" looks like a
 * count; it is an estimate made afterwards by somebody who was not there, and
 * saying so is the distinction the whole surface is about.
 */
function rowWhy(r, format) {
  const range = r.range
    ? format.number(r.range.low) + '–' + format.number(r.range.high) + ' ' + r.range.unit
    : null;
  if (r.silenceKind === 'destroyed') {
    return r.agentUnknown ? 'destroyer not named in the record' : firstClause(r.agent);
  }
  if (r.silenceKind === 'never-made') {
    return range ? 'no one counted at the time; the estimate since is ' + range : 'no count exists';
  }
  return range ? 'documents survive; the estimates run ' + range : 'the record will not settle it';
}

/** The first sentence of a long agent note, so a list row stays a list row. */
function firstClause(s) {
  const t = String(s || '').trim();
  const i = t.indexOf('.');
  const one = i > 12 ? t.slice(0, i) : t;
  return one.length > 84 ? one.slice(0, 82).replace(/[,;:]$/, '') + '…' : one;
}

export { SHAPES };

/** The split, for a scenario or a caller that wants the number without the DOM. */
export function silenceCounts(list) {
  const out = { total: list.length };
  for (const s of SHAPES) out[s.id] = list.filter((r) => r.silenceKind === s.id).length;
  return out;
}
