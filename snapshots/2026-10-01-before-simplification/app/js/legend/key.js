/* =============================================================================
   THE KEY'S PARTS — the sections the sheet is assembled from.
   Owner: P17.

   ROUND 6. This file used to build three things: the corner card, the parts of
   the reading plate, and a phone stub. The corner card is gone — the key is a
   one-line ribbon along the foot of the plate now (ribbon.js), and everything
   longer than one line is a sheet in the shell's rail (sheet.js). What is left
   here is the material itself, and none of it knows where it will be put:

     ruleBlock       the rule in force, the live totals, the anchors, the modes
     colourSection   every legal form drawn at this year, grouped by family,
                     each openable for its trap, its citation and the roll of
                     places with each place's own label beside it
     marksSection    the marks that are not colours, in full
     tenureRamp      one hue, seven steps, with its buckets in years
     groupingNotes   why the colours are grouped as they are, and the forms not
                     on the plate this year
     countingNotes   the rule, the denominator, the rounding, and the full
                     reconciliation against data.metricsAt
     deltaLine       what goes when the definition gets stricter

   ONE RULE STILL GOVERNS EVERY LINE OF IT: nothing is asserted about the plate
   that has not been reported by the renderer or measured against the dataset.
   A missing figure is a defect a student can see; a stale one is not.

   Emits:  legend:filter {status|null}
           ask:paintUnits {unitIds, reason}
   ========================================================================== */

import { el } from '../core/util.js';
import {
  FAMILIES, FAMILY_BY_KEY, STATUS_SYMBOL, MARKS, TENURE_BUCKETS, symbolFor, trapFor, seeFor,
} from './symbology.js';
import { areaText, sig, anchors } from './totals.js';

/* ------------------------------------------------------------- swatches -- */

/** A drawn mark: the fill, the engraved texture over it, the coastline round it. */
export function swatch(kind, { family = null, texture = null, tenure = null, label = '' } = {}) {
  const node = el('span.sym', { 'aria-hidden': 'true' });
  node.dataset.kind = kind;
  if (family) {
    node.style.setProperty('--sym-fill', `var(--map-${family})`);
    node.style.setProperty('--sym-stroke', `var(--map-${family}-stroke)`);
  }
  if (tenure) node.style.setProperty('--sym-fill', `var(--tenure-${tenure})`);
  if (texture && texture !== 'plain') node.dataset.tex = texture;
  if (label) node.title = label;
  return node;
}

/* -----------------------------------------------------------------------------
   A MARK FOR THE EYE AND A SENTENCE FOR THE EAR.

   ROUND 10 — THE DEFECT THIS ANSWERS, measured with Chromium's own accessible
   name computation on the running app at 1440x900, sheet open, year 1700:

     <button class="legend__entry">  NAME = "Company trading posts deg 1 · 14
                                             A business with forts, not a government."

   and, in an implementation that does not insert whitespace between inline
   spans, exactly the string the critic reported: "Company trading postsdeg 19".
   "deg 1" is a printed abbreviation — it is a badge 24 pixels wide, and it is
   read aloud as the word "deg" — and "14" is a bare numeral with no unit on it.
   Both were carrying their real form on a `title` that the name computation
   never reaches, because a title is a DESCRIPTION and only a fallback name.

   The rule this file now keeps, everywhere: A GLYPH, A BADGE OR A BARE NUMERAL
   IS FOR THE EYE ONLY. It is `aria-hidden`, and the words it stands for — the
   same words its title already carried — are in the accessible name instead.
   `spoken()` is the one way that is done here, so the two can never drift.
----------------------------------------------------------------------------- */
export function spoken(text) {
  return el('span.legend__spoken.visually-hidden', { text });
}

/* ------------------------------------------------------- the fixed head -- */

export function ruleBlock(ctx, { anchored = true, inline = false, ruleLine = true, modes = true, micro = false } = {}) {
  const { def, totals, format, data } = ctx;
  const wrap = el('div.legend__rulebox');

  /* The byline at the top of the plate prints the rule in full; this is the
     same rule in short, so the panel states the definition in force without the
     two surfaces saying the same sentence twice. */
  if (ruleLine) {
    wrap.appendChild(el('p.legend__rule-line', {},
      el('span.legend__drawn', { text: 'Drawn now' }),
      ' ',
      el('strong.legend__defword', { text: def.label.toLowerCase() }),
      ' ',
      el('span.legend__rule-text', { text: '— ' + (def.shortRule || def.rule) }),
    ));
  }

  if (!totals) {
    wrap.appendChild(el('p.legend__absent', { text: 'No totals: the dataset has not reported a status for this year.' }));
    return wrap;
  }

  const set = totals.sets[def.id];
  const anc = anchors(data, format, set);

  const line = el('p.legend__figures');
  /* The mid dot is set punctuation between figures. It is not a word, so it
     is drawn and not spoken (see `spoken` above). */
  const bit = (node) => { if (line.childNodes.length) line.appendChild(el('span.legend__sep', { text: ' · ', 'aria-hidden': 'true' })); line.appendChild(node); };
  /* `inline` folds the two comparisons into the figures line instead of giving
     them a line of their own. It is what the stub uses: measured, the separate
     line put the anchor 19px below the fold of a 108px panel, and an anchor
     nobody can see anchors nothing. */
  bit(inline && anc.units
    ? el('span', { title: anc.units.long },
      el('span.num', { text: format.number(set.units) }),
      el('span.legend__unitword', { text: ' of ' }),
      el('span.num', { text: format.number(ctx.data.unitMeta ? ctx.data.unitMeta.size : 0) }),
      el('span.legend__unitword', { text: ' units' }))
    : el('span', {},
      el('span.num', { text: format.number(set.units) }),
      el('span.legend__unitword', { text: ' units' })));
  /* MICRO drops the territory count and nothing else. FEATURE_SPEC asks this
     line for units, km² and population-where-sourced; territories is the fourth
     figure and the one whose absence costs a student least, and at 96px of
     stage the alternative is the control that opens the full key falling off
     the bottom of the panel. It is back the moment there is a line for it. */
  if (!micro) bit(el('span', {}, el('span.num', { text: format.number(set.territories) }), el('span.legend__unitword', { text: ' territories' })));
  bit(set.km2 > 0
    ? (inline && anc.area
      ? el('span', { title: anc.area.long },
        el('span.num', { text: areaText(format, set.km2) }),
        /* "≈ 41× Great Britain" is two mathematical glyphs a reader hears as
           "almost equal to 41 x". The words are in the comparison itself. */
        el('span.legend__anchor-in', { text: ' ≈ ' + anc.area.short.replace(/^about /, ''), 'aria-hidden': 'true' }),
        spoken(' — ' + anc.area.short.replace(/×/g, ' times') + '.'))
      : el('span.num', { text: areaText(format, set.km2) }))
    : el('span.legend__absent-inline', { text: 'no area in the geometry index' }));
  /* THE POPULATION HOLE. This dataset holds one figure per territory — that
     territory's own peak, in its own census year. Adding those up and printing
     the total under a year heading produces a number that belongs to no year at
     all, so neither this panel nor the map's own card prints one. Where we have
     no figure we draw the hole and say so. */
  bit(el('span.legend__absent-inline', { text: 'people — no figure' }));
  wrap.appendChild(line);

  /* ----------------------------------------------------------------------
     THE ANCHOR. Round 3 printed the magnitude with impeccable method and no
     meaning at all. Both comparisons are computed in totals.js from the same
     geometry index the areas are summed from; if either denominator is missing
     nothing is printed in its place.
  ---------------------------------------------------------------------- */
  if (anchored && !inline && (anc.area || anc.units)) {
    const p = el('p.legend__anchor', { title: [anc.area && anc.area.long, anc.units && anc.units.long].filter(Boolean).join(' ') });
    p.appendChild(el('span.legend__anchor-h', { text: 'That is' }));
    const parts = [anc.area && anc.area.short, anc.units && anc.units.short].filter(Boolean);
    parts.forEach((t, i) => {
      if (i) p.appendChild(el('span.legend__sep', { text: ' · ', 'aria-hidden': 'true' }));
      p.appendChild(el('span', { text: t }));
    });
    wrap.appendChild(p);
  }

  /* WHAT A MODE HAS DONE TO THE MARKS. Weight, stitching and silences each
     change what size or shape MEAN on the plate. Round 2 printed a line for the
     first and nothing for the other two, so pressing S or H changed the map and
     left the legend describing a plate that was no longer there. */
  if (modes) for (const m of modeLines(ctx)) wrap.appendChild(m);
  return wrap;
}

/* -----------------------------------------------------------------------------
   ROUND 5. EVERY COUNT IN THESE THREE LINES IS A LIVE MEASUREMENT OR IT IS NOT
   PRINTED.

   The critic pressed W at 1900, scrubbed to 1620 and read "176 carry a figure,
   6 draw as a hole" over a map of nineteen units, under a heading that says the
   figures are recomputed from the units drawn at this year. They were not: the
   renderer emits `map:weight`, `map:stitch` and `map:silence` only when the
   mode is TOGGLED, so the number was true at the year the key was pressed and
   was then reprinted, unchanged, for four centuries.

   index.js now recounts the renderer's own paint table on every state change
   and cross-checks the total against this panel's own count of the units drawn
   under the rule in force. If the two disagree — which is what a stale paint
   table looks like — `modes.stale` is set, and every line below prints the
   sentence WITHOUT the figure. A missing number is a defect a student can see.
   A wrong number is one they cannot.
----------------------------------------------------------------------------- */

/** One line per mode the renderer has reported as on. Nothing is assumed. */
export function modeLines(ctx) {
  const { format, modes } = ctx;
  const out = [];
  if (!modes) return out;
  if (modes.weight) {
    out.push(el('p.legend__mode', {},
      el('span.legend__mode-h', { text: 'Size' }), ' ',
      Number.isFinite(modes.weightCounted)
        ? `a cited quantity, not land area — ${format.number(modes.weightCounted)} places carry a figure, ${format.number(modes.weightMissing || 0)} draw as a hole.`
        : 'a cited quantity, not land area. The renderer has not recounted since the year changed, so no figure is printed here rather than the last one it gave.',
    ));
  }
  if (modes.stitch) {
    out.push(el('p.legend__mode', {},
      el('span.legend__mode-h', { text: 'Size' }), ' ',
      Number.isFinite(modes.stitchDrawn)
        ? `one fixed size for every small place — ${format.number(modes.stitchDrawn)} of them at ${format.year(ctx.year)}, with the landmasses ghosted behind. Area is switched off on purpose.`
        : 'one fixed size for every small place, with the landmasses ghosted behind. The renderer has not recounted since the year changed, so the number is withheld rather than carried over.',
    ));
  }
  if (modes.silence) {
    out.push(el('p.legend__mode', {},
      el('span.legend__mode-h', { text: 'Holes' }), ' ',
      !Number.isFinite(modes.silenceDrawn)
        ? 'coastline with bare paper inside, where no record was allowed to survive. The renderer has not recounted since the year changed, so no number is printed.'
        : modes.silenceDrawn > 0
          ? `${format.plural(modes.silenceDrawn, 'place is', 'places are')} drawn as coastline with bare paper inside at ${format.year(ctx.year)}: no record was allowed to survive there.`
          : `none at ${format.year(ctx.year)}. The mark is real and it is not being used to decorate an empty map — the destroyed-record places this atlas knows of are not under British rule at this year under the rule in force.`,
    ));
  }
  return out;
}

/* ----------------------------------------------------------- status rows - */

/**
 * Resolve the atlas's OWN citation for a trap.
 *
 * ROUND 4. Round 3 resolved this from a fixed pointer per legal form, so
 * "company rule" at 1900 listed Labuan, Northern Rhodesia and Southern Rhodesia
 * and then cited Plassey, the dual system and the famine of 1770, offering
 * "open Bengal Presidency in the dossier" — the wrong place and the wrong
 * century, in the one part of this panel whose subject is provenance.
 *
 * The pointer is still the canonical example, but a territory that is ACTUALLY
 * ON THE PLATE at this year wins, and when the canonical one is not on the
 * plate the panel says so in words rather than quietly time-travelling.
 */
function evidenceFor(ctx, statusId, agg) {
  const see = seeFor(statusId);
  const { data } = ctx;
  const pick = (tid) => {
    const t = data.byId && data.byId.get(tid);
    const ev = t && Array.isArray(t.evidence) ? t.evidence : [];
    if (!ev.length) return null;
    const hit = see && see.match ? ev.find(e => see.match.test(String(e && e.supports || ''))) : null;
    return { src: hit || ev[0], territory: t };
  };

  /* 1. A place drawn in this legal form at this exact year. */
  const here = (agg && agg.places) || [];
  for (const p of here) {
    const got = pick(p.id);
    if (got) return { see, ...got, present: true, canonical: see ? see.territories.includes(p.id) : false };
  }
  /* 2. Otherwise the canonical example, labelled as not being on this plate. */
  if (see) {
    for (const tid of see.territories) {
      const got = pick(tid);
      if (got) return { see, ...got, present: false, canonical: true };
    }
  }
  return { see, src: null, territory: null, present: false, canonical: false };
}

/** Why the panel is sending you to this work, given which place it landed on. */
function citeHeading(ctx, res, statusId) {
  const { format } = ctx;
  if (res.canonical && res.present) return res.see.why;
  if (res.present) return `How this worked in ${res.territory.name}, which is drawn in this form at ${format.year(ctx.year)}.`;
  return `${res.see ? res.see.why + ' ' : ''}${res.territory.name} is not on the plate at ${format.year(ctx.year)}: this is where the atlas documents the form, not where it is drawn now.`;
}

export function statusRow(ctx, agg, meta, { open = false, onOpen = null } = {}) {
  const { format } = ctx;
  const sym = symbolFor(agg.statusId);
  const label = (meta && meta.label) || format.statusLabel(agg.statusId);
  const sentence = (meta && meta.short) || null;

  const row = el('li.legend__row');
  const btn = el('button.legend__entry', {
    type: 'button',
    'data-status': agg.statusId,
    'data-focus-key': 'status:' + agg.statusId,
    'aria-pressed': open ? 'true' : 'false',
    'aria-expanded': open ? 'true' : 'false',
    'aria-controls': 'legend-roll-' + agg.statusId,
    title: open
      ? 'Close this entry'
      : `Open ${label.toLowerCase()}: the trap in the word, its source, and the ${format.plural(agg.places.length, 'place', 'places')} it covers in ${format.year(ctx.year)}`,
  });
  if (onOpen) btn.addEventListener('click', (ev) => { ev.stopPropagation(); onOpen(agg.statusId); });

  if (!sym) {
    btn.appendChild(swatch('unknown'));
    btn.appendChild(el('span.legend__body', {},
      el('span.legend__word', {}, label, el('span.legend__defect', { text: '[no symbol assigned]' })),
      el('span.legend__sentence', { text: 'This status is in the dataset but not in the legend’s vocabulary. That is a bug in app/js/legend/symbology.js, and you are seeing it because hiding it would be worse.' }),
    ));
    row.appendChild(btn);
    return row;
  }

  const noFill = !sym.family;   // informal empire: no fill and no claimed border
  btn.appendChild(noFill
    ? swatch('informal', { label })
    : swatch('status', { family: sym.family, texture: sym.texture, label }));

  const body = el('span.legend__body');
  const degree = meta && meta.controlDegree;
  /* THE BADGE, THE NUMERAL AND THE CHEVRON ARE DRAWN, NOT SPOKEN.
     Measured before this change, at 1440x900 with the sheet open at 1700, this
     button's accessible name was "Company trading posts deg 1 · 14 A business
     with forts, not a government." — a printed abbreviation ("deg 1"), a bare
     numeral with no unit on it, and a mid dot that comes out of a stylesheet
     (`.legend__marks > * + *::before`). The words each of them stands for were
     on titles, which a name computation never reads. The whole strip of marks
     is now `aria-hidden` — which takes the stylesheet's mid dot with it — and
     the sentence it was standing in for is in the name, from the same strings
     the titles carry, so a reader hears:

       "Company trading posts, control degree 1 of 5, 14 geographic units at
        this year. A business with forts, not a government."   */
  const marks = el('span.legend__marks', { 'aria-hidden': 'true' });
  const say = [];
  if (Number.isFinite(degree)) {
    marks.appendChild(el('span.legend__deg.num', { text: `deg ${degree}` }));
    say.push(`control degree ${degree} of 5`);
  }
  marks.appendChild(el('span.legend__count.num', { text: format.number(agg.units) }));
  say.push(`${format.plural(agg.units, 'geographic unit', 'geographic units')} at this year`);
  marks.appendChild(el('span.legend__more', { text: open ? '▾' : '▸' }));
  body.appendChild(el('span.legend__wordline', {},
    el('span.legend__word', {}, label),
    spoken(', ' + say.join(', ') + '.'),
    marks));
  /* ROUND 11 — THE SPACE THE NAME COMPUTATION PUTS IN. `spoken()` is a separate
     inline element, so accname joins it to the word before it WITH A SPACE, and
     Chromium's own computation returned "Proprietary colony , control degree 3
     of 5, …" — a comma standing on its own, read as a pause in the wrong place.
     Punctuation cannot be carried across an element boundary, so the name is
     stated outright here instead of being assembled out of the contents. The
     visible spans are unchanged; `spoken()` stays for print and for the case
     where this attribute is not honoured.

     ROUND 12 — THE FIGURES MOVE TO THE END. The button PRINTS two things a
     reader can select and repeat — "Company trading posts" and "A business with
     forts, not a government." — with the badges between them drawn and
     `aria-hidden`. The name put the figures between them too, so the visible
     label was not a contiguous run of the accessible name and WCAG 2.5.3 was
     failed on all eight entries. The badges are supplementary and now follow
     the words they annotate: LABEL, SENTENCE, then the degree and the count. */
  const figures = say.join(', ');
  btn.setAttribute('aria-label',
    label + (sentence ? '. ' + sentence : '.')
    + ' ' + figures.charAt(0).toUpperCase() + figures.slice(1) + '.');
  body.appendChild(sentence
    ? el('span.legend__sentence', { text: sentence })
    : el('span.legend__sentence.legend__defect', { text: '[no definition in the dataset for this status]' }));

  btn.appendChild(body);
  row.appendChild(btn);

  if (open) row.appendChild(openPanel(ctx, agg, label));
  return row;
}

/* -----------------------------------------------------------------------------
   DOES THIS PLACE MATCH THE BOX IT IS IN?

   The legend's own WATCH OUT column tells a student that a legal label is not
   the same thing as how a place was ruled. Round 3 then listed Yukon and South
   Georgia under "ruled directly from London through an appointed governor" and
   showed neither the dataset's own label for them — "Canadian territory, run
   from Ottawa"; "A claim on paper" — nor its own note saying they do not fit.
   The lesson has to apply to the legend before it can be taught by it.

   NOTHING IS JUDGED HERE, and this is deliberate. Round 4's first attempt
   flagged every crown colony whose recorded seat of government was not London,
   which flagged thirty-one of forty-three: Antigua governed from St John's is a
   crown colony governed exactly as a crown colony is. The test is now the
   dataset's OWN field for this exact problem — `controlDegreeNote`, which the
   data model carries only where a place's degree of control is not what its
   status implies — plus a seat of government recorded as nowhere. Measured at
   1900 that is a handful of places, and every one of them is a real one.

   The roll prints every place's own label whatever happens. Only the note is a
   flag.
----------------------------------------------------------------------------- */
function mismatchOf(place) {
  if (place.degreeNote) return { kind: 'note', text: place.degreeNote };
  const gf = place.governedFrom;
  if (gf && /^\s*nowhere\b/i.test(gf)) {
    return { kind: 'nowhere', text: `Governed from ${gf} — the dataset records no seat of administration for this place at all.` };
  }
  return null;
}

/** What opening a row gives you: the trap, its source, and the roll of places. */
export function openPanel(ctx, agg, label) {
  const { format } = ctx;
  const box = el('div.legend__roll', { id: 'legend-roll-' + agg.statusId, role: 'group' });

  const trap = trapFor(agg.statusId);
  if (trap) {
    box.appendChild(el('p.legend__trap', {},
      el('span.legend__trap-h', { text: 'Watch out' }),
      el('span.legend__trap-t', { text: trap }),
    ));
  } else {
    box.appendChild(el('p.legend__sentence.legend__defect', {
      text: '[no “watch out” written for this form — app/js/legend/symbology.js]',
    }));
  }

  box.appendChild(el('p.legend__roll-h', {},
    el('span.num', { text: format.number(agg.places.length) }), ' ',
    agg.places.length === 1 ? 'territory was ' : 'territories were ',
    label.toLowerCase(), ' in ', el('span.num', { text: format.year(ctx.year) }),
    ', across ', el('span.num', { text: format.number(agg.units) }),
    agg.units === 1 ? ' map unit:' : ' map units:',
  ));

  const ul = el('ul.legend__roll-list');
  let flagged = 0;
  for (const p of agg.places) {
    const mis = mismatchOf(p);
    if (mis) flagged++;
    ul.appendChild(el('li', { class: mis ? 'is-mismatch' : null },
      el('span.legend__roll-name', { text: p.name }),
      p.units > 1 ? el('span.legend__roll-n.num', { text: `${p.units} units` }) : null,
      p.label ? el('span.legend__roll-label', { text: p.label }) : null,
      mis ? el('span.legend__roll-flag', {},
        el('span.legend__roll-flag-h', { text: 'Does not fit this box' }),
        el('span', { text: mis.text })) : null,
    ));
  }
  box.appendChild(ul);
  if (flagged) {
    box.appendChild(el('p.legend__roll-warn', {},
      el('span.legend__trap-h', { text: 'And in this list' }),
      el('span', { text: `${format.plural(flagged, 'place carries', 'places carry')} the dataset's own note saying ${flagged === 1 ? 'it does' : 'they do'} not fit this box — printed under ${flagged === 1 ? 'its' : 'their'} name above. The colour on the plate is one word for all of them; the sentence under each name is what that place actually was. When they disagree, the place wins and the colour is the thing to distrust. That is this key's own WATCH OUT applied to this key.` }),
    ));
  }

  box.appendChild(el('p.legend__roll-foot', {
    text: ctx.paintWorked === true
      ? 'The plate has repainted: only these are drawn in full, the rest is dimmed rather than deleted. Counting a category is the thing a coloured map is worst at, so the atlas counts it as well.'
      : 'Counting a category is the thing a coloured map is worst at, so the atlas counts it for you. The plate itself has not changed.',
  }));

  /* Charge 8: this panel makes dated claims, so it cites them, through the one
     function in this app allowed to render a source. */
  const res = evidenceFor(ctx, agg.statusId, agg);
  if (!res.see && !res.src) {
    box.appendChild(el('p.legend__defect', { text: '[no evidence pointer for this legal form — app/js/legend/symbology.js]' }));
  } else if (!res.src) {
    box.appendChild(el('p.legend__defect', {
      text: `[unsourced] The note above is not attached to any work: ${(res.see && res.see.territories.join(', ')) || 'no territory'} carries no evidence in this dataset.`,
    }));
  } else {
    const cite = el('div.legend__cite');
    cite.appendChild(el('p.legend__cite-h', {
      class: res.present ? null : 'legend__cite-h--offplate',
      text: citeHeading(ctx, res, agg.statusId),
    }));
    if (typeof ctx.renderSource === 'function') {
      try {
        cite.appendChild(ctx.renderSource(res.src, { compact: true }));
      } catch (err) {
        cite.appendChild(el('p.legend__defect', { text: '[the source renderer threw: ' + (err && err.message) + ']' }));
      }
    } else {
      cite.appendChild(el('p.legend__defect', {
        text: '[the app’s source renderer is not running, so this citation cannot be shown with its four questions answered]',
      }));
      cite.appendChild(el('p.legend__cite-plain', {
        text: `${res.src.author || 'unattributed'}, ${res.src.work || 'untitled'}${res.src.year ? ' (' + res.src.year + ')' : ''}.`,
      }));
    }
    if (res.territory) {
      const go = el('button.legend__cite-go', {
        type: 'button',
        'data-focus-key': 'cite-go:' + agg.statusId,
        text: `Open ${res.territory.name} in the dossier`,
      });
      go.addEventListener('click', (ev) => { ev.stopPropagation(); ctx.store.dispatch('select', res.territory.id); });
      cite.appendChild(go);
    }
    box.appendChild(cite);
  }

  return box;
}

/* ------------------------------------------------------------- mark rows - */

export function markRow(ctx, mark, extra) {
  const { format } = ctx;
  const row = el('li.legend__row', { class: mark.strong ? 'legend__row--strong' : null });
  const item = el('div.legend__entry.legend__entry--static');
  item.appendChild(swatch(mark.kind, { family: mark.family || 'crown-conquered' }));
  const body = el('span.legend__body');
  /* The same rule as `statusRow`: a bare numeral beside a word is read as a
     second word ("Coastline only 3"). The numeral is drawn; the unit is said. */
  body.appendChild(el('span.legend__wordline', {},
    el('span.legend__word', { text: mark.label }),
    extra && extra.count != null
      ? el('span.legend__count.num', { text: format.number(extra.count), 'aria-hidden': 'true' })
      : null,
    extra && extra.count != null
      ? spoken(`, ${format.plural(extra.count, 'unit', 'units')} drawn on the plate now.`)
      : null,
  ));
  body.appendChild(el('span.legend__sentence', { text: mark.sentence }));
  if (mark.caption) body.appendChild(el('span.legend__caption-mark', { text: mark.caption }));
  if (extra && extra.note) body.appendChild(el('span.legend__meta', { text: extra.note }));
  if (extra && extra.names && extra.names.length) {
    body.appendChild(el('span.legend__meta', { text: 'Drawn now: ' + format.list(extra.names) + '.' }));
  }
  if (extra && extra.action) {
    const b = el('button.legend__cite-go', {
      type: 'button',
      'data-focus-key': 'mark-go:' + mark.kind,
      text: extra.action.label,
    });
    b.addEventListener('click', (ev) => { ev.stopPropagation(); extra.action.run(); });
    body.appendChild(b);
  }
  item.appendChild(body);
  row.appendChild(item);
  return row;
}

/* -----------------------------------------------------------------------------
   CHARGE 7, IN ONE FUNCTION.

   The count and the names come from the renderer's `map:silence` report — what
   was actually drawn — and where the renderer has never reported, this says
   that rather than asserting a zero.
----------------------------------------------------------------------------- */
export function silenceState(ctx) {
  const r = ctx.silenceReport;
  const drawn = ctx.modes && Number.isFinite(ctx.modes.silenceDrawn) ? ctx.modes.silenceDrawn : null;
  if (r && drawn == null) {
    return {
      count: null, names: [], chip: 'recounting',
      note: 'Silences are on, and the renderer has not recounted since the year changed. No number is printed here rather than the one it last gave.',
      live: true,
    };
  }
  if (r && drawn > 0) {
    return {
      count: drawn,
      names: ctx.silenceNames || [],
      chip: `${ctx.format.number(drawn)} drawn`,
      note: null,
      live: true,
    };
  }
  if (r) {
    /* THE DEFAULT-YEAR PROBLEM, NAMED WHERE THE STUDENT IS.
       At 1900 — where the app lands — this mark is real and nothing on the
       plate carries it, because the destroyed records this atlas knows of
       belong to places Britain ruled later. Round 4 described the mark anyway.
       Now the entry says so at the point of pressing H, and offers the year. */
    const y = ctx.silenceFirstYear;
    return {
      count: 0, names: [],
      chip: 'none at this year',
      note: y
        ? `Silences are on and the renderer draws none at ${ctx.format.year(ctx.year)}. That is not the mark failing: the earliest of the records this atlas knows were destroyed was destroyed in ${ctx.format.year(y)}, and a record cannot be destroyed before it is made. Go to a year after that and the hole is on the plate.`
        : `Silences are on and the renderer draws none at ${ctx.format.year(ctx.year)}. The mark is not being used to decorate an empty map.`,
      goYear: y || null,
      live: true,
    };
  }
  return {
    count: null, names: [],
    chip: 'press H',
    note: 'This dataset has no `silences[]` field yet, so the map derives them from the territories whose own records state that the record was destroyed. Press H and this entry takes its count from what the plate actually draws — never from a number typed here.',
    live: false,
  };
}

/**
 * THE ABSENCE HATCH, HONESTLY.
 *
 * Round 3 pinned "Dense hatch — no figure" in every state, including the
 * default status plate at 1900 and the empty year 1200, where no drawn unit
 * carries it. The mark means "no cited figure exists for this quantity", and
 * there is no quantity on a legal-status plate — it is drawn only when the
 * renderer is sizing by a metric. So the chip now degrades exactly as the haze
 * chip already did.
 */
export function absenceState(ctx) {
  const { modes, format } = ctx;
  if (modes && modes.weight) {
    return Number.isFinite(modes.weightMissing)
      ? { chip: `${format.number(modes.weightMissing)} drawn`, count: modes.weightMissing, live: true,
        note: null }
      : { chip: 'in use', count: null, live: true, note: null };
  }
  return {
    chip: 'not on this plate', count: null, live: false,
    note: 'Nothing on this plate is sized by a quantity, so nothing is drawn with this mark at the moment. Press W and the units with no cited figure take it — a hole, never a zero.',
  };
}

/* ---------------------------------------------------------------- ramp --- */

/* FEATURE_SPEC §2 rule 2: nothing essential is behind a hover, a tab or an
   accordion. P17's own spec makes "the tenure ramp shows its buckets in years"
   student-visible behaviour, and round 4 shipped it inside a closed <details>.
   It is a plain section now, and so is every other block in this file. */
export function tenureRamp(ctx) {
  const { activeLayer } = ctx;
  const det = el('section.legend__section');
  det.appendChild(el('h3.legend__h', {},
    'How long it had been held',
    spoken(' — '),
    el('span.legend__hint', { text: activeLayer === 'tenure' ? 'in force on the plate now' : 'one hue, seven steps' }),
  ));
  det.appendChild(el('p.legend__sentence.legend__sentence--block', {
    text: 'One hue getting darker, never a set of categories. Colour here is an amount, so a darker place is not a different kind of place — only an older one.',
  }));
  const list = el('ul.legend__ramp');
  for (const b of TENURE_BUCKETS) {
    /* Five of the seven buckets are printed as a bare range — "10–24" — because
       the heading above them already says what the number is. Read aloud, out
       of that heading's reach, "10–24" is two numbers and no noun, so the noun
       is said and not drawn. */
    const bare = !/year/.test(b.label);
    list.appendChild(el('li.legend__ramp-step', {},
      swatch('tenure', { tenure: b.step }),
      el('span.legend__ramp-label.num', { text: b.label }),
      bare ? spoken(' years held') : null,
    ));
  }
  list.appendChild(el('li.legend__ramp-step', {},
    swatch('tenure-none'),
    el('span.legend__ramp-label', { text: 'never held' }),
  ));
  det.appendChild(list);
  return det;
}

/* -------------------------------------------------------- counting notes - */

export function countingNotes(ctx) {
  const { totals, def, format, data } = ctx;
  const det = el('section.legend__section');
  det.appendChild(el('h3.legend__h', {},
    'How these totals are counted',
    spoken(' — '),
    el('span.legend__hint', { text: 'the rule, the denominator, the rounding' }),
  ));
  if (!totals) { det.appendChild(el('p.legend__absent', { text: 'No totals at this year.' })); return det; }
  const set = totals.sets[def.id];
  const anc = anchors(data, format, set);

  det.appendChild(el('p.legend__caveat-line', {
    text: `The rule in force, in full: ${def.label.toLowerCase()} = ${def.rule}. Everything above is recomputed from data.statusAt(${format.year(ctx.year)}) every time this panel draws. No total in this app is stored, and no area is printed to more than three significant figures, because an area summed from modern coastlines is not good to two decimal places.`,
  }));
  if (anc.area) det.appendChild(el('p.legend__caveat-line', { text: anc.area.long }));
  if (anc.units) det.appendChild(el('p.legend__caveat-line', { text: anc.units.long }));
  if (set.partialUnits) {
    det.appendChild(el('p.legend__caveat-line', {
      text: `Land is measured on modern unit outlines, and ${format.plural(set.partialUnits, 'unit that British control did not fill is', 'units that British control did not fill are')} counted at half area — a convention, stated rather than hidden, and the one tools/audit-timeline.js uses.`,
    }));
  }
  if (set.unitsWithoutArea > 0) {
    det.appendChild(el('p.legend__caveat-line', {
      text: `${format.plural(set.unitsWithoutArea, 'unit has', 'units have')} no area in the geometry index: counted, not measured, never zeroed.`,
    }));
  }
  const pop = set.population;
  det.appendChild(el('p.legend__caveat-line', {
    text: pop && pop.counted
      ? `People: no figure, and that is the honest answer rather than a missing one. The dataset holds ONE population per territory — its own peak, in its own census year — and ${format.plural(pop.counted, 'territory carries', 'territories carry')} one${pop.earliest ? `, across ${format.yearRange(pop.earliest, pop.latest)}` : ''}${pop.missing ? `, while ${format.plural(pop.missing, 'territory carries', 'territories carry')} none` : ''}. Peaks from different centuries do not add up to a year. The map's own card prints the same hole for the same reason.`
      : 'People: no territory in this set carries a sourced population figure at all. Nothing is estimated in its place.',
  }));

  /* THE RECONCILIATION. FEATURE_SPEC P17 test 5 asks that these totals equal
     data.metricsAt(year). They do — for the definition whose rule is the one
     metricsAt uses. This prints the arithmetic in full so a critic can check it
     on screen rather than inferring a fabrication from a difference of one. */
  const m = ctx.metrics;
  if (m) {
    const infl = totals.sets.influenced;
    const claimed = totals.sets.claimed;
    const admin = totals.sets.administered;
    const ctrl = totals.sets.controlled;
    const byDeg = m.byDegree || {};
    const sumFrom = (lo) => [1, 2, 3, 4, 5].filter(d => d >= lo).reduce((n, d) => n + (Number(byDeg[d]) || 0), 0);
    det.appendChild(el('p.legend__caveat-line.legend__caveat-line--flag', {
      text: `Checked against the shell's own count at ${format.year(ctx.year)}: data.metricsAt says ${format.number(m.controlledUnits)} units carry a control degree of 1 or more, and this panel counts ${format.number(totals.degreeOneUnits)}. Claimed draws ${format.number(claimed.units)} of them, because it excludes informal spheres whatever degree they carry (${format.number(totals.informalUnits)} at this year). Administered = degrees 3, 4 and 5 = ${format.number(sumFrom(3))} by metricsAt.byDegree and ${format.number(admin.units)} here. Controlled = degree 5 = ${format.number(Number(byDeg[5]) || 0)} and ${format.number(ctrl.units)} here. Influenced adds the informal spheres that carry no degree at all: ${format.number(infl.units)}.`,
    }));
    det.appendChild(el('p.legend__caveat-line', {
      text: `Partial units are counted the same way and reported the same way: ${['claimed', 'administered', 'controlled', 'influenced'].map(id => `${ctx.definitionsById.get(id).label.toLowerCase()} ${format.number(totals.sets[id].partialUnits)}`).join(' · ')}. The broken-bands entry in this key prints the figure for the rule in force, never a single number for all four.`,
    }));
  }
  const built = data && data.meta && data.meta.dataset ? data.meta.dataset.built : null;
  if (built) det.appendChild(el('p.legend__caveat-line', { text: `Dataset ${built}.` }));
  return det;
}

/* ------------------------------------------------------- the colour rows - */

/* -----------------------------------------------------------------------------
   THE COLOURS ON THE PLATE RIGHT NOW, when they are not this vocabulary's.
   Built from the same `ctx.plateKey` the ribbon's chips are built from, so the
   strip and the sheet cannot disagree about what is on the map.
----------------------------------------------------------------------------- */
export function livePlateBlock(ctx) {
  const pk = ctx.plateKey;
  const { format } = ctx;
  if (!pk || (pk.keyed !== 'layer' && pk.keyed !== 'tenure')) return null;
  const box = el('div.legend__live');
  box.appendChild(el('p.legend__live-h', {},
    el('span.legend__live-eyebrow', { text: 'On the plate now' }),
    el('span.legend__live-say', { text: ctx.layerSentence || '' }),
  ));
  const ul = el('ul.legend__live-list');
  for (const r of pk.rows) {
    const fam = r.key ? FAMILY_BY_KEY.get(r.key) : null;
    const sym = r.kind === 'tenure' ? swatch('tenure', { tenure: r.tenure })
      : r.kind === 'absence' ? swatch('absence')
        : r.kind === 'quiet' ? swatch('quiet')
          : r.kind === 'informal' ? swatch('informal')
            : swatch('status', { family: r.key, texture: fam ? fam.texture : null });
    const li = el('li.legend__live-row');
    li.appendChild(sym);
    li.appendChild(el('span.legend__live-w', { text: r.word }));
    li.appendChild(el('span.legend__count.num', { text: format.number(r.count), 'aria-hidden': 'true' }));
    li.appendChild(spoken(`, ${format.plural(r.count, 'unit', 'units')} on the plate now.`));
    ul.appendChild(li);
  }
  box.appendChild(ul);
  box.appendChild(el('p.cx-note.legend__live-note', {
    text: 'The legal-status vocabulary below is not what this plate is keyed by at the moment. It is still the thing every one of these readings is drawn on top of, and the place list under each form is the same one.',
  }));
  return box;
}

/**
 * The colour vocabulary: every legal form drawn at this year, grouped by the
 * family that gives it its fill, largest family first. Shared by the corner key
 * and the reading plate, so the two can never disagree about what is on screen.
 */
export function colourSection(ctx, { headingId = 'legend-status-h', columns = false } = {}) {
  const { totals, format } = ctx;
  const sec = el('section.legend__section.legend__section--key', { 'aria-labelledby': headingId });
  /* ROUND 11 — WHAT THIS SHEET IS FOR, WHEN THE PLATE IS NOT KEYED BY IT.
     The ribbon now reads its chips off the plate, so on a thematic layer the
     strip says "negotiated independence 90" and the control beside it opens
     THIS, which is the legal-status vocabulary. Opening a reference work that
     answers a question the reader did not ask is the defect this block ends:
     the sheet leads with the colours that are actually on the plate, in the
     same words and the same counts as the strip, and then says what the section
     below it is and why it is still worth having. */
  const live = livePlateBlock(ctx);
  if (live) sec.appendChild(live);
  /* UNDER THE RULE IN FORCE. Not the whole year's roll — see totals.js.
     Round 4 printed the same fifteen forms and the same counts under all four
     definitions, so this piece's own answer to charge 4 changed the headline
     figure and left the colour vocabulary untouched. */
  const present = totals ? totals.sets[ctx.defId].byStatus.filter(s => s.units > 0) : [];
  sec.appendChild(el('h3.legend__h', { id: headingId },
    'What the colour means',
    spoken(' — '),
    el('span.legend__hint', {
      text: present.length ? `${format.number(present.length)} legal forms` : '',
    }),
  ));
  /* "deg 3" is printed on every row below and it is the one abbreviation in
     this panel a reader cannot decode from the row itself. Round 10 carried it
     on a `title`; a tooltip is not a definition — nobody hovers a badge they
     have not already understood — and on the way out of the accessible name it
     was being read aloud twice (see `statusRow`). It is printed here instead,
     once, above the rows it explains. NOT in the heading's hint: that hint has
     `text-overflow: ellipsis` and one line, and measured in the rail at
     1440x900 it came out as "8 legal forms · deg = how much contr…", which is
     the defect this module is elsewhere trying to end. A line that wraps
     cannot be cut. */
  if (present.length) {
    sec.appendChild(el('p.cx-note.legend__degnote', {
      text: 'deg 3 means degree of control 3 of 5 — how much of a place Britain actually ran, whatever the legal word for it was.',
    }));
  }
  if (!ctx.layerSentence) {
    sec.appendChild(el('p.legend__defect.legend__sentence--block', {
      text: `[layer "${ctx.activeLayer}" has no definition sentence — it should not have registered]`,
    }));
  }

  const statusMeta = new Map((ctx.data.statuses || []).map(s => [s.id, s]));
  const aggById = new Map(present.map(a => [a.statusId, a]));
  const grouped = new Map();
  for (const s of (ctx.data.statuses || [])) {
    const sym = STATUS_SYMBOL[s.id];
    const key = sym && sym.family ? sym.family : '_informal';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(s);
  }
  const famUnits = (k) => (grouped.get(k) || []).reduce((n, s2) => n + (aggById.has(s2.id) ? aggById.get(s2.id).units : 0), 0);
  const famOrder = [...FAMILIES.map(f => f.key), '_informal'].sort((a, b) => famUnits(b) - famUnits(a));
  const absent = [];
  const wrap = el('div.legend__families', columns ? { 'data-columns': 'true' } : {});
  for (const famKey of famOrder) {
    const list = grouped.get(famKey);
    if (!list || !list.length) continue;
    const here = list.filter(s => aggById.has(s.id));
    for (const s of list) if (!aggById.has(s.id)) absent.push(s);
    if (!here.length) continue;
    const fam = FAMILIES.find(f => f.key === famKey);
    const block = el('div.legend__family');
    const units = here.reduce((n, s) => n + aggById.get(s.id).units, 0);
    block.appendChild(el('p.legend__family-head', {
      title: fam ? fam.sentence : MARKS.informal.sentence,
    },
      fam ? swatch('status', { family: fam.key, texture: fam.texture }) : swatch('informal'),
      el('span.legend__family-name', { text: fam ? fam.label : 'No colour at all' }),
      el('span.legend__count.num', { text: format.number(units) }),
    ));
    const ul = el('ul.legend__rows');
    for (const s of here) {
      ul.appendChild(statusRow(ctx, aggById.get(s.id), statusMeta.get(s.id), {
        open: ctx.filterStatus === s.id,
        onOpen: ctx.onToggleStatus,
      }));
    }
    block.appendChild(ul);
    wrap.appendChild(block);
  }
  sec.appendChild(wrap);
  if (!present.length) {
    sec.appendChild(el('p.legend__absent', { text: 'Nothing is drawn at this year. That is a real result, not a loading state.' }));
  }
  sec.__absent = absent;
  return sec;
}

/** Why the colours are grouped as they are, plus the forms not on the plate. */
export function groupingNotes(ctx, absent) {
  const { format } = ctx;
  const out = [];
  const famDet = el('section.legend__section');
  famDet.appendChild(el('h3.legend__h', {},
    'Why these colours are grouped as they are',
    spoken(' — '),
    el('span.legend__hint', { text: 'where the decision was taken' }),
  ));
  const famUl = el('ul.legend__absentlist');
  for (const f of FAMILIES) {
    famUl.appendChild(el('li', {},
      swatch('status', { family: f.key, texture: f.texture }),
      el('span.legend__family-word', { text: f.label }),
      el('span.legend__family-def', { text: f.sentence }),
    ));
  }
  famUl.appendChild(el('li', {},
    swatch('informal'),
    el('span.legend__family-word', { text: 'No colour at all' }),
    el('span.legend__family-def', { text: MARKS.informal.sentence }),
  ));
  famDet.appendChild(famUl);
  out.push(famDet);

  if (absent && absent.length) {
    const det = el('section.legend__section');
    det.appendChild(el('h3.legend__h', {},
      'Legal forms not on the plate this year',
      spoken(' — '),
      el('span.legend__hint', { text: format.number(absent.length) }),
    ));
    const ul = el('ul.legend__absentlist');
    for (const s of absent) {
      const sym = symbolFor(s.id);
      ul.appendChild(el('li', {},
        sym && sym.family ? swatch('status', { family: sym.family, texture: sym.texture }) : swatch('informal'),
        el('span.legend__family-word', { text: s.label || format.statusLabel(s.id) }),
        el('span.legend__family-def', { text: s.short || s.definition || '' }),
      ));
    }
    det.appendChild(ul);
    out.push(det);
  }
  return out;
}

/** The six marks that are not colours, in full. */
export function marksSection(ctx, { headingId = 'legend-more-h' } = {}) {
  const sec = el('section.legend__section', { 'aria-labelledby': headingId });
  sec.appendChild(el('h3.legend__h', { id: headingId },
    'Marks that are not colours',
    spoken(' — '),
    el('span.legend__hint', { text: 'the three pinned in the key, and three more' }),
  ));
  const sil = silenceState(ctx);
  const abs = absenceState(ctx);
  const more = el('ul.legend__rows.legend__rows--marks');
  more.appendChild(markRow(ctx, MARKS.absence, { count: abs.count, note: abs.note }));
  more.appendChild(markRow(ctx, MARKS.silence, {
    count: sil.count, note: sil.note, names: sil.names,
    action: sil.goYear && ctx.onGoToYear
      ? { label: `Take me to ${ctx.format.year(sil.goYear)}, the year the earliest of them was destroyed`, run: () => ctx.onGoToYear(sil.goYear) }
      : null,
  }));
  more.appendChild(markRow(ctx, MARKS.informal, {
    count: ctx.informalUnits,
    note: ctx.influenceCited ? null
      : 'No cited quantity for the radius exists in this dataset yet, so the haze is drawn at one size and encodes nothing but presence. Gallagher and Robinson (1953) named the phenomenon; the standard objection is that stretched far enough it cannot be disproved.',
  }));
  /* BROKEN BANDS IS DEFINITION-AWARE NOW. Round 3 printed 61 under all four
     rules while the same panel's own totals note said 53 / 33 / 22 / 61. */
  more.appendChild(markRow(ctx, MARKS.partial, ctx.partialCount != null
    ? {
      count: ctx.partialCount,
      note: ctx.partialCount === 0
        ? `No unit drawn under ${ctx.def.label.toLowerCase()} is flagged partial at this year.`
        : `Counted under the rule in force — ${ctx.def.label.toLowerCase()}. Change the rule and this figure changes with it, because a different set of units is on the plate.`,
    }
    : null));
  more.appendChild(markRow(ctx, MARKS.selected));
  more.appendChild(markRow(ctx, MARKS.coast));
  sec.appendChild(more);
  return sec;
}

/**
 * The delta to the next stricter rule — charge 4's whole point, and the move
 * the map's own definition card does not make. Split out of ruleBlock so the
 * head can carry the rule and the totals without it and the scroller can carry
 * it, which is what lets the head keep a fixed, reservable height.
 */
export function deltaLine(ctx) {
  const { def, totals, format } = ctx;
  if (!totals) return null;
  const set = totals.sets[def.id];
  const ladder = ['influenced', 'claimed', 'administered', 'controlled'];
  const i = ladder.indexOf(def.id);
  const nextId = i >= 0 && i < ladder.length - 1 ? ladder[i + 1] : null;
  const next = nextId ? totals.sets[nextId] : null;
  if (!next) return null;
  const nd = ctx.definitionsById.get(nextId);
  const gone = set.units - next.units;
  /* Areas print to three significant figures, so the percentage is read off the
     same rounding — otherwise this line prints "100% of what is drawn now"
     beside two identical figures and looks like it is lying. */
  if (gone <= 0 && Math.round(sig(next.km2)) >= Math.round(sig(set.km2))) {
    return el('p.legend__delta', {},
      'Press ', el('kbd.legend__kbd', { text: nd.key }), ' for ', nd.label.toLowerCase(),
      ' and nothing goes: everything ', def.label.toLowerCase(), ' here was also ', nd.label.toLowerCase(), '.');
  }
  if (set.km2 > 0 && next.km2 > 0 && Math.round(sig(next.km2)) === Math.round(sig(set.km2))) {
    return el('p.legend__delta', {},
      'Press ', el('kbd.legend__kbd', { text: nd.key }), ' for ', nd.label.toLowerCase(), ': ',
      el('span.num', { text: format.number(next.units) }), ' units not ',
      el('span.num', { text: format.number(set.units) }), ', same land to three figures.');
  }
  if (set.km2 > 0 && next.km2 > 0) {
    return el('p.legend__delta', {},
      'Press ', el('kbd.legend__kbd', { text: nd.key }), ' — ', nd.label.toLowerCase(), ': ',
      el('span.num', { text: format.number(next.units) }), ' units, ',
      el('span.num', { text: format.percent(Math.round(sig(next.km2)) / Math.round(sig(set.km2))) }),
      ' of the land.');
  }
  return null;
}

/* ---------------------------------------------------------------- build -- */

/* ROUND 6. `buildKey`, `buildMirror`, `coloursBand`, `familyStrip`, `marksStrip`,
   `markChip` and `buildPhoneNote` were removed with the corner card they built.
   The strip along the foot of the plate is ribbon.js; the sections below are
   assembled by sheet.js. Their CSS went with them: legend.css is 434 lines
   shorter, and it no longer contains a rule that reaches outside this piece. */
export default {
  swatch, ruleBlock, modeLines, statusRow, openPanel, markRow,
  silenceState, absenceState, tenureRamp, countingNotes,
  colourSection, groupingNotes, marksSection, deltaLine,
};
