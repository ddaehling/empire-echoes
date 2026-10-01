/* =============================================================================
   THE BYLINE — the map's own provenance line, pinned in `stage-note`.
   Owner: P17.

   FEATURE_SPEC P17 requires four fields here, never dismissible, always
   matching what is actually drawn: projection · what the colour means right
   now · the exact year · whose definition of control. They are set out as the
   answers to three questions a student can carry off this screen and use on any
   imperial map — the 1886 pink poster, a textbook plate, an atlas in a library.

   ROUND 3 CHANGES, all forced by measurement rather than taste:

   · HEIGHT, AND ROUND 4'S FIX. This block and the colour key share one column
     of a stage that is 157px tall at 1366x768 on this build. Round 3 set the
     four fields tight, which helped, and then opened the self-criticism INSIDE
     this block, which did not: measured, the byline became a 184px window on
     355px of list — criticism 1 readable, 2 and 3 off the bottom — and the
     colour key was pushed off the panel to pay for it. So this block no longer
     grows at all. It is four fields at a fixed height, and the criticism
     control opens the criticism sheet, where all three are set in a column of
     their own, 410x716 beside a live map. Nothing was deleted; it was moved
     somewhere it fits.

   · THE FOURTH FIELD TRACKS EVERY MODE. Weight mode added a line and stitching
     and silences did not, so pressing S or H changed what size and shape MEAN
     while the byline printed the same three answers. Each of the three modes
     now adds its own field, from the renderer's own report, with the count the
     renderer gave.

   · THE CRITICISM IS YEAR-AWARE. "Canada is not that big — the Canadian units
     cover 9.9 million km²" was printed at 1650 and at 2023, when no Canadian
     unit was on the plate. Every figure now comes from the units actually
     painted at this year under this definition (totals.geo), and a caveat whose
     figures do not exist at this year is not selectable at all — see `needs`.

   Two honesty rules are enforced here rather than assumed:

   · PROJECTION is taken only from the renderer's `map:projection` REPORT, never
     from a `map:setProjection` request. If nothing has reported, the field says
     "not declared by the renderer" and the criticism list says why that matters.

   · COLOUR is checked against the pixels. Nothing in the app reports which
     thematic layer the plate actually drew, so index.js measures it with
     plate-probe.js. If the layer changed and the plate did not, this line
     prints the defect instead of the sentence.

   This module writes ONLY into its own element inside the stage-note slot and
   never clears that slot, because P03 and P16 also speak there.
   ========================================================================== */

import { el } from '../core/util.js';
import { sig } from './totals.js';
import { layerShort } from './symbology.js';

/* ------------------------------------------------------- computed figures - */

/* format.compact prints millions to one decimal below ten and none above, and
   format.area compacts anything over a million. This reproduces that rounding
   so a ratio quoted beside two printed areas is the ratio of those areas. */
function asPrinted(km2) {
  const n = Math.round(sig(km2));
  if (n < 1e6) return n;
  const v = n / 1e6;
  return (v >= 100 ? Math.round(v) : +v.toFixed(v >= 10 ? 0 : 1)) * 1e6;
}

const ratio = (a, b) => {
  const x = asPrinted(a), y = asPrinted(b);
  if (!(x > 0) || !(y > 0)) return null;
  const r = x / y;
  return r >= 100 ? Math.round(r) : +r.toFixed(1);
};

/**
 * Every number the self-criticism can print, computed over THE UNITS ON THE
 * PLATE at this year under this definition. A key that is not present here is
 * a figure this rendering has not got, and `needs` below makes the caveat that
 * would have used it unselectable rather than letting it print a figure from a
 * different century.
 */
export function figures(data, format, state, totals, defId, modes = {}) {
  const set = totals && totals.sets ? totals.sets[defId] : null;
  const g = set ? set.geo : null;
  const out = {
    yearLabel: format.year(state.year),
    unitCount: data && data.unitMeta && data.unitMeta.size ? format.number(data.unitMeta.size) : null,
  };
  if (set) {
    out.drawnUnits = format.number(set.units);
    out.drawnKm2 = set.km2 > 0 ? format.area(Math.round(sig(set.km2))) : null;
    if (set.partialUnits) out.partialDrawn = format.number(set.partialUnits);
  }
  if (g) {
    if (g.tiny) out.tinyDrawn = format.number(g.tiny);
    if (g.canadaKm2 > 0) out.canadaKm2 = format.area(Math.round(sig(g.canadaKm2)));
    if (g.africaKm2 > 0) out.africaKm2 = format.area(Math.round(sig(g.africaKm2)));
    if (g.canadaKm2 > 0 && g.africaKm2 > 0) {
      const r = ratio(g.africaKm2, g.canadaKm2);
      if (r != null && r >= 1.1) out.africaRatio = String(r);
    }
    if (g.highLatKm2 > 0 && g.tropicKm2 > 0) {
      const r = ratio(g.tropicKm2, g.highLatKm2);
      if (r != null && r >= 1.1) {
        out.highLatKm2 = format.area(Math.round(sig(g.highLatKm2)));
        out.highLatUnits = format.number(g.highLatUnits);
        out.tropicKm2 = format.area(Math.round(sig(g.tropicKm2)));
        out.tropicUnits = format.number(g.tropicUnits);
        out.tropicRatio = String(r);
      }
    }
    if (g.barbadosKm2 > 0) out.barbadosArea = format.area(Math.round(g.barbadosKm2), { compact: false });
    if (g.smallest && g.largest && g.smallest.id !== g.largest.id) {
      out.smallestName = g.smallest.name;
      out.smallestArea = format.area(Math.round(g.smallest.km2), { compact: false });
      out.largestName = g.largest.name;
      out.largestArea = format.area(Math.round(sig(g.largest.km2)));
      const r = ratio(g.largest.km2, g.smallest.km2);
      if (r != null) out.sizeRatio = format.number(Math.round(r));
    }
  }
  if (totals) {
    out.informalCount = totals.informalUnits
      ? `${format.plural(totals.informalUnits, 'unit', 'units')}${totals.informalTerritories ? ` (${format.plural(totals.informalTerritories, 'territory', 'territories')})` : ''}`
      : null;
  }
  if (Number.isFinite(modes.stitchDrawn) && modes.stitchDrawn > 0) out.stitchDrawn = format.number(modes.stitchDrawn);
  if (Number.isFinite(modes.silenceDrawn) && modes.silenceDrawn > 0) out.silenceDrawn = format.number(modes.silenceDrawn);
  if (Number.isFinite(modes.weightCounted)) out.weightCounted = format.number(modes.weightCounted);
  if (Number.isFinite(modes.weightMissing)) out.weightMissing = format.number(modes.weightMissing);
  return out;
}

/* Fills {name} slots in a caveat with figures computed from the dataset.
   Text substitution only — no number in this app is ever interpolated. */
export function fillFigures(text, fig) {
  return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in fig && fig[k] != null ? String(fig[k]) : m));
}

/* ------------------------------------------------------------- selection - */

const KEYS_OF = (c) => Object.keys((c && c.when) || {});
const VIEWPOINT = new Set(['projection', 'weight', 'plate', 'stitch', 'silence']);
const isViewpoint = (c) => KEYS_OF(c).some(k => VIEWPOINT.has(k));
const isEncoding = (c) => KEYS_OF(c).some(k => k === 'definition' || k === 'layer');

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

/** A caveat may only be chosen if every figure it prints exists at this year. */
export const caveatUsable = (c, fig) =>
  !c.needs || c.needs.every(k => fig && fig[k] != null && fig[k] !== '');

/**
 * Pick the three caveats that are true of THIS rendering.
 *
 * The three slots have different jobs, so the list is guaranteed to change when
 * the state does:
 *   1  the viewpoint  — projection, weight, stitching, silences, or "no plate"
 *   2  the encoding   — the definition of control, or the active layer
 *   3  a rotating universal caveat, keyed to the whole view signature
 * `avoid` is the previous triple; slot 3 advances until the set is not stale.
 *
 * `fig` gates the whole list: a caveat that would print a figure this plate has
 * not got is dropped before any of this runs, which is what makes the list
 * year-aware rather than merely state-aware.
 */
export function chooseCaveats(caveats, view, avoid = null, avoidUniversal = null, fig = {}) {
  const matches = (c) => {
    if (!caveatUsable(c, fig)) return false;
    if (!c.when) return true;
    for (const [k, v] of Object.entries(c.when)) {
      if (k === 'plate') { if ((view.plate || 'none') !== v) return false; continue; }
      if (k === 'weight' || k === 'stitch' || k === 'silence') { if (!!view[k] !== !!v) return false; continue; }
      if ((view[k] || null) !== v) return false;
    }
    return true;
  };
  const byRank = (a, b) => (b.rank || 0) - (a.rank || 0) || a.id.localeCompare(b.id);
  const all = caveats.filter(matches).sort(byRank);
  const out = [];
  const take = (c) => { if (c && !out.includes(c)) out.push(c); };

  take(all.find(isViewpoint));
  /* Slot 2 is the ENCODING fault. Which encoding the student has just chosen
     decides which one: on the default status plate the interesting encoding
     choice is the definition of control, and on any other layer it is the layer
     itself. Round 2 sorted this slot on rank alone, so the definition caveats
     (rank 9) beat every layer caveat (rank 7) and six authored layer
     criticisms could never appear. */
  const enc = all.filter(c => isEncoding(c) && !out.includes(c));
  const layerC = enc.find(c => c.when && c.when.layer);
  const defC = enc.find(c => c.when && c.when.definition);
  const chosenLayer = view.layer && view.layer !== 'status';
  take(chosenLayer ? (layerC || defC) : (defC || layerC));

  /* SLOT 3 rotates over a pool, and the pool is the universal caveats PLUS the
     encoding caveat slot 2 did not take. Round 3 rotated over the universals
     alone, so with a thematic layer on the plate slot 2 was always the layer
     and changing the definition of control changed nothing the student could
     see — measured: layer=tenure and layer=tenure+controlled produced an
     identical list. The definition now has somewhere to appear whatever the
     layer is doing. */
  const other = enc.find(c => !out.includes(c)) || null;
  const universal = all.filter(c => !c.when);
  const pool = other ? [other, ...universal] : universal;
  if (pool.length) {
    const key = [view.projection, view.layer, view.definition, view.weight ? 'w' : '',
      view.stitch ? 's' : '', view.silence ? 'h' : '', view.plate].join('|');
    const start = hash(key) % pool.length;
    for (let i = 0; i < pool.length; i++) {
      const c = pool[(start + i) % pool.length];
      if (out.includes(c)) continue;
      if (avoidUniversal && c.id === avoidUniversal && pool.length > 1) continue;
      const trial = [...out, c].map(x => x.id).sort().join(',');
      if (avoid && trial === avoid) continue;
      take(c);
      break;
    }
  }
  /* Still short? Fall back to the highest-ranked matches not already chosen —
     but never pad past what actually applies. */
  for (const c of all) { if (out.length >= 3) break; take(c); }
  return out.slice(0, 3);
}

export const caveatKey = (list) => (list || []).map(c => c.id).sort().join(',');
/* The rotating slot's id — whatever took slot 3, universal or not. It is what
   the next state is asked not to repeat. */
export const universalOf = (list) => { const l = list || []; return l.length ? l[l.length - 1].id : null; };

/* ---------------------------------------------------------------- render - */

const QUESTIONS = [
  { field: 'projection', q: 'What projection, and what does it stretch?', short: 'What projection?', tiny: 'Projection' },
  { field: 'colour', q: 'What is the colour measuring?', short: 'Colour = what?', tiny: 'Colour' },
  { field: 'year', q: 'What year, and whose definition?', short: 'What year, whose definition?', tiny: 'Year · rule' },
];

/**
 * THE FOUR FIELDS, BUILT ONCE.
 *
 * FEATURE_SPEC P17 test 2 asks that the byline's four fields are present and
 * always match the actual render. The byline itself is now deferred to
 * `data-stage="apparatus"` (LAYOUT_BUDGET §7: its three questions are §8's
 * 00:16 beat, not a greeting), so the same list is also printed at the head of
 * the criticism sheet, which is reachable in one control from the ribbon at
 * every stage and every width. One builder, so the two can never drift.
 */
export function fieldList(ctx) {
  const { view, def, format, layerSentence, activeLayer } = ctx;
  const ol = el('ol.byline__three', ctx.tiny ? { 'data-tiny': 'true' } : {});

  const item = (spec, valueNodes, extraClass) => {
    const li = el('li.byline__item', extraClass ? { class: extraClass } : {});
    li.appendChild(el('span.byline__q', {
      text: ctx.tiny ? spec.tiny : (ctx.narrow ? spec.short : spec.q),
      title: spec.q,
    }));
    const a = el('span.byline__a');
    for (const n of valueNodes) if (n) a.appendChild(n);
    li.appendChild(a);
    return li;
  };

  /* 1 — projection. Only the renderer's own report is trusted. */
  const projFull = view.projection === 'mercator' ? 'Mercator — it swells the far north'
    : view.projection === 'equal-area' ? 'Equal Earth — areas true, shapes sheared'
      : null;
  const projText = ctx.tiny && projFull ? projFull.split(' — ')[0] : projFull;
  ol.appendChild(item(QUESTIONS[0], [projFull
    ? el('span.byline__value', { 'data-field': 'projection', text: projText, title: projFull })
    : el('span.byline__value.byline__value--absent', { 'data-field': 'projection', text: ctx.tiny ? 'not declared' : 'not declared by the renderer', title: 'The renderer has not reported a projection.' })]));

  /* 2 — what the colour means right now, checked against the pixels. */
  let colourNode;
  if (!layerSentence) {
    colourNode = el('span.byline__value.byline__value--defect', {
      'data-field': 'colour',
      text: `[layer “${activeLayer}” has no definition sentence — it should not have registered]`,
    });
  } else if (ctx.layerVerified === false) {
    colourNode = el('span.byline__value.byline__value--defect', {
      'data-field': 'colour',
      text: `[the atlas is set to “${activeLayer}”, but this plate is pixel-for-pixel the legal-status plate — what the colour is measuring is still ${ctx.drawnSentence || 'the legal status'}]`,
    });
  } else {
    const full = layerSentence.replace(/^colour = /, '');
    colourNode = el('span.byline__value', {
      'data-field': 'colour',
      text: ctx.tiny ? (layerShort(activeLayer) || full) : full,
      title: full,
    });
    if (ctx.layerVerified == null && activeLayer !== 'status') {
      colourNode.appendChild(el('span.byline__flag', { text: 'not yet checked against the plate' }));
    }
  }
  ol.appendChild(item(QUESTIONS[1], [colourNode]));

  /* 3 — the exact year, and the definition of control in force. */
  ol.appendChild(item(QUESTIONS[2], [
    el('span.byline__value.num', { 'data-field': 'year', text: ctx.tiny ? format.year(ctx.year) : format.year(ctx.year) + ' exactly' }),
    el('span.byline__dot', { text: '·', 'aria-hidden': 'true' }),
    ctx.tiny
      ? el('span.byline__value', {
        'data-field': 'definition',
        text: def.label.toLowerCase(),
        title: `${def.label.toLowerCase()} — ${def.rule}`,
      })
      : el('span.byline__value', { 'data-field': 'definition' },
        def.label.toLowerCase(), ' — ', def.shortRule || def.rule),
  ]));

  /* -----------------------------------------------------------------------
     THE FOURTH FIELD, IN ONE LINE.

     Two things forced this. (a) Every figure in it is now a live recount of the
     renderer's own paint table, verified unit by unit against this year's set
     before it is printed: round 4 stored the payload the renderer sent when the
     mode was switched on and reprinted it for the rest of the session, so "176
     carry a figure, 6 draw as a hole" was still on screen at 1620 over nineteen
     units. Where the recount has not cleared its check the field says so and
     prints no number at all.

     (b) It was three separate items, each with a question and a wrapped answer,
     and with all three modes on at 1440x900 this block grew to about 200px of a
     300px stage — which took `--legend-max` for the colour key down to 72 and
     clipped the key's own foot off the bottom. The three modes are supplements
     to the three questions, not a fourth question each, so they are one item
     now: about 60px saved, and every one of them still names its count.
  ----------------------------------------------------------------------- */
  const yr = format.year(ctx.year);
  const mo = ctx.modes || {};
  const bits = [];
  const terse = !!ctx.micro;
  if (view.weight) {
    bits.push(['Size', Number.isFinite(mo.weightCounted)
      ? (terse
        ? `a cited quantity — ${format.number(mo.weightCounted)} with a figure, ${format.number(mo.weightMissing || 0)} a hole`
        : `a cited quantity, not land area — ${format.number(mo.weightCounted)} carry a figure at ${yr}, ${format.number(mo.weightMissing || 0)} a hole`)
      : `a cited quantity — recounting for ${yr}`]);
  }
  if (view.stitch) {
    bits.push(['Small places', Number.isFinite(mo.stitchDrawn)
      ? (terse ? `one fixed size — ${format.number(mo.stitchDrawn)}` : `one fixed size, not their area — ${format.number(mo.stitchDrawn)} at ${yr}`)
      : `one fixed size — recounting for ${yr}`]);
  }
  if (view.silence) {
    bits.push(['Empty shapes', !Number.isFinite(mo.silenceDrawn)
      ? `coastline round bare paper — recounting for ${yr}`
      : mo.silenceDrawn > 0
        ? (terse
          ? `bare paper, record destroyed — ${format.number(mo.silenceDrawn)}`
          : `coastline round bare paper: no record was allowed to survive — ${format.number(mo.silenceDrawn)} at ${yr}`)
        : (terse
          ? `none at ${yr}${ctx.silenceFirstYear ? `; earliest destroyed ${format.year(ctx.silenceFirstYear)}` : ''}`
          : `no record was allowed to survive — none drawn at ${yr}${ctx.silenceFirstYear ? `, because the earliest of these records was destroyed in ${format.year(ctx.silenceFirstYear)}` : ''}`)]);
  }
  if (bits.length) {
    const li = el('li.byline__item.byline__item--extra');
    li.appendChild(el('span.byline__q', { text: ctx.tiny ? 'Switched on' : 'And what have you switched on?' }));
    const a = el('span.byline__a', { 'data-field': 'modes' });
    bits.forEach(([h, t], i) => {
      if (i) a.appendChild(el('span.byline__dot', { text: '·', 'aria-hidden': 'true' }));
      a.appendChild(el('span.byline__mode-h', { text: h }));
      a.appendChild(el('span.byline__value', { text: t }));
    });
    li.appendChild(a);
    ol.appendChild(li);
  }
  return ol;
}

export function buildByline(ctx) {
  const { view, def, format, layerSentence, activeLayer } = ctx;
  const root = el('div#legend-byline.byline.cx-panel.cx-panel--tight', {
    role: 'note',
    'aria-label': 'How this map is drawn: projection, colour, year and definition of control',
  });
  root.dataset.crit = ctx.critOpen ? 'open' : 'closed';

  /* The header and the self-criticism control share one line: this block and
     the colour key share one column of a stage that is about 460px tall, and a
     line here is a line of colour vocabulary the student does not get. */
  /* TINY. Measured on this build at 390x844: the stage is 183px tall, and this
     block at 102px plus the compact key at 72px blanket it. Under a measured
     stage height the four fields FEATURE_SPEC requires are still all here and
     still not dismissible — they are set as one line of four rather than a
     numbered list of three, and the three-question framing moves to the head of
     the criticism section in the plate, where there is room to teach it. */
  root.dataset.tiny = ctx.tiny ? 'true' : 'false';
  const askRow = el('p.byline__ask', {},
    /* COHERENCE PASS — ONE NAME FOR ONE THING. This block was headed "Ask
       these three of any imperial map" on a laptop and "How this map is drawn"
       on a phone, while the panel below it was headed "How to read this map" in
       both. Three names, two of them for the same block. The ask is what this
       block teaches, so the ask is what it is called, at every width; "How to
       read this map" is the key, and only the key. */
    el('span.byline__ask-h.cx-panel__head', {
      text: (ctx.tiny || ctx.narrow) ? 'Ask these three of any map' : 'Ask these three of any imperial map',
    }),
  );
  root.appendChild(askRow);

  root.appendChild(fieldList(ctx));

  /* ROUND 4: this control no longer opens anything inside the byline. It opens
     the criticism sheet, where all three are set in full beside a live map.
     There is exactly one control with this name in the app now — round 3 had
     two, one here and one in the key, which is also why this one was the 36th
     tab stop behind an identical 35th. */
  const critLabel = ctx.critOpen ? 'Shown in the sheet' : 'Three things wrong with this rendering';
  const btn = el('button.byline__crit.cx-more', {
    type: 'button',
    'aria-expanded': ctx.critOpen ? 'true' : 'false',
    'aria-controls': 'sheet',
    'data-focus-key': 'byline-crit',
    /* `.cx-more::after` prints " →", and generated content is part of an
       accessible name. The arrow is drawn, not said. */
    'aria-label': critLabel,
    text: critLabel,
  });
  askRow.appendChild(btn);

  /* ROUND 6: there is no second control here. The phone used to carry an
     "Open the full key" button in this block because the old corner card could
     not be pressed at 390px; the key is a ribbon along the foot of the plate at
     every width, with its own `.cx-more` into the sheet, and this block does
     not render below 62rem at all (nothing of P17's may stand on the plate —
     LAYOUT_BUDGET B5). */
  const keyBtn = null;

  /* NO PANEL HERE ANY MORE. The list lives in plate.js. What stays in the
     byline is the button, whose own label says where the three went. This block
     is the same height in both states — measured, 86px open and 86px shut — so
     opening the criticism can no longer move the colour key by a pixel. */
  /* A DEFECT IS STUDENT-VISIBLE. This is the one thing allowed to make this
     block taller, and it should be: it only appears when something this panel
     depends on is not running, and the alternative is four confident fields
     describing a plate that is not on the screen. */
  /* On a phone this block is the only surface this piece has (see index.js
     `_placeByline` and key.js `buildPhoneNote`), so the colour band rides here
     rather than nowhere. */
  if (ctx.defect) root.appendChild(el('p.byline__defect.cx-note.cx-note--warn', { text: ctx.defect }));

  const panel = null;

  return { root, btn, keyBtn, panel };
}

export default { buildByline, fieldList, chooseCaveats, caveatKey, universalOf, figures, fillFigures, caveatUsable };
