/* =============================================================================
   THE KEY IS READ OFF THE PLATE. Owner: P17 (legend).

   ROUND 11 — THE DEFECT THIS FILE EXISTS TO END, in a classroom critic's words:

     "The pinned colour ribbon adopts the active layer's sentence — 'colour =
      how it left, from 292 departure records' — while continuing to render the
      legal-status chips. Reproduce at #year=1900&layer=exit at 1440x900: the
      strip reads 'colour = how it left' above 'Ruled from London 94 ·
      Protectorate 46 · Self-governing 26'. A key that contradicts itself is the
      exact error the M4 lesson exists to kill."

   Measured before this file, at 1900, on nine layers: the sentence changed nine
   times and THE CHIPS NEVER CHANGED ONCE. Every one of them read "Ruled from
   London 94 · Protectorate 46 · …", because `families()` was built from
   `totals.sets[def].byStatus` — the dataset's legal statuses — which is what
   the plate paints on ONE of the thirteen layers.

   WHY IT WAS BUILT THAT WAY, AND WHY THAT IS NOT AVAILABLE ANY MORE. A key
   built from the dataset is a key built from an intention. This module's own
   first rule is that nothing is asserted about the plate that has not been
   measured — `plate-probe.js` already refuses to say "colour = how Britain took
   it" until it has seen the pixels move — and a strip of chips is a much larger
   assertion than that sentence is.

   WHAT IT READS. P02 publishes its renderer at `window.__map`, and the paint
   table on it is the map's own answer to "what did I draw, and in what": one
   record per geometry unit, carrying `key` (the status family it is filled
   with), and — after P16's `layers/paint.js` has re-keyed the table for a
   thematic layer — `layerKey`, `layerWord` and `layerCat`, plus `tenureLabel`
   on the tenure ramp, `mode: 'absence'` for ground the layer has no record for,
   `mode: 'hole'` for a destroyed record, and `quiet` / `dim` for a unit the
   layer has stood back. That table is not a second opinion about the plate. It
   is what the plate is painted from.

   THREE THINGS THIS FILE WILL NOT DO.

   1. IT WILL NOT GUESS. No plate, no paint table, or a table this render cannot
      vouch for — and every function here returns null, and the ribbon falls
      back to the dataset's own status totals with the sentence that is true of
      them ("colour = legal status"). Falling back is visible: the strip says
      legal status, and legal status is what the fallback counts.

   2. IT COUNTS EVERY COLOUR THE PLATE PAINTS, INCLUDING THE GREY. `_recount()`
      skips records flagged `lost` — P02's ghost fill for ground Britain held
      once and does not hold at this year — because the FIGURES beside the strip
      count the set the rule in force draws, and that grey is not in it. A KEY
      is a different promise from a figure: fifty grey shapes are on the map at
      1900 and a reader can see them, so the strip names them, with a count and
      a sentence, rather than leaving the second-largest colour on the plate
      unexplained. Skipping them was measurably worse elsewhere too: on the exit
      plate the ground that has already left is most of the layer's subject, and
      dropping it turned "handed to another power, 41" into "10".

   3. IT WILL NOT SORT THE STOOD-BACK ROW INTO THE ARGUMENT. On the resistance
      plate 197 of 232 units stand back and 35 carry a mark; sorted by count the
      strip would lead with "stood back 197", which is the one thing on that
      plate that is not the subject. Standing back is appended last, where the
      fit pass drops it first.
   ========================================================================== */

import { FAMILY_BY_KEY, TENURE_BUCKETS, MARKS } from './symbology.js';

/** P02's published renderer, or null. Read-only, always. */
function plateOf() {
  const m = (typeof window !== 'undefined' && ((window.BEA && window.BEA.map) || window.__map)) || null;
  const plate = m && m.plate;
  const paint = plate && plate.paint;
  return paint && typeof paint.entries === 'function' && paint.size ? paint : null;
}

/** '10–24' is this atlas's bucket label; the plate prints '10–24 years'. */
function tenureStepOf(label) {
  if (!label) return null;
  const s = String(label).trim();
  const b = TENURE_BUCKETS.find(x => s === x.label || s.startsWith(x.label));
  return b ? b.step : null;
}

/**
 * WHAT THE PLATE IS ACTUALLY KEYED BY, RIGHT NOW.
 *
 * @returns null, or
 *   {
 *     keyed:  'status' | 'layer' | 'tenure' | 'nothing',
 *     rows:   [{ id, kind, key, tenure, word, count, mode }]   largest first,
 *             with the stood-back row appended last if there is one
 *     drawn, quiet, holes, units
 *   }
 *
 * `kind` is what the chip has to draw: 'family' (a status fill), 'category' (a
 * layer's own fill), 'tenure' (a step of the ramp), 'absence' (bare ground the
 * layer has no record for) or 'quiet' (stood back, still legible underneath).
 */
export function readPlate() {
  const paint = plateOf();
  if (!paint) return null;

  const rows = new Map();
  let quiet = 0, holes = 0, drawn = 0, units = 0;
  let layerRows = 0, tenureRows = 0;

  const add = (id, row) => {
    const cur = rows.get(id);
    if (cur) { cur.count++; return; }
    rows.set(id, { ...row, id, count: 1 });
  };

  for (const [, rec] of paint) {
    if (!rec) continue;
    units++;
    if (rec.mode === 'hole') { holes++; continue; }
    if (rec.quiet || rec.dim) { quiet++; continue; }
    drawn++;

    /* Ground a thematic layer has no record for. It carries the layer's own
       words ("no departure recorded in this atlas") and is drawn bare, which is
       a category a reader must be able to look up — it is the difference
       between a zero and a hole. */
    if (rec.mode === 'absence' && rec.layerAbsence) {
      add('absence:' + rec.layerAbsence, { kind: 'absence', key: null, word: rec.layerAbsence, mode: 'absence' });
      layerRows++;
      continue;
    }
    if (rec.layerKey) {
      add('cat:' + (rec.layerCat || rec.layerKey), {
        kind: 'category', key: rec.layerKey, word: rec.layerWord || rec.layerKey, mode: 'fill',
      });
      layerRows++;
      continue;
    }
    if (rec.tenureLabel) {
      const step = tenureStepOf(rec.tenureLabel);
      /* '10–24 years' prints as '10–24' under a sentence that already says
         "how long held"; 'under 10 years' and '150 years or more' keep their
         noun, because without it they are not a number at all. Same rule, same
         strings, as the ramp in the sheet. */
      const label = String(rec.tenureLabel);
      add('ten:' + rec.tenureLabel, {
        kind: 'tenure', key: null, tenure: step, mode: 'fill',
        word: /^\d/.test(label) ? label.replace(/\s*years?$/, '') : label,
      });
      tenureRows++;
      continue;
    }
    if (rec.mode === 'absence') {
      /* P02's own absence — no cited figure for the measure sizing the map. It
         is already a pinned mark on this strip, counted by the renderer's
         verified recount, so it is not made into a second chip here. */
      drawn--;
      continue;
    }
    /* Informal empire is the one thing on the plate with no fill and no border,
       so it has no family and no `key`. It is a mark, not a colour, and it is
       named as one. Without this branch a chip would read "undefined". */
    if (rec.mode === 'informal' || !rec.key) {
      add('informal', { kind: 'informal', key: null, word: MARKS.informal.shortLabel, mode: 'informal' });
      continue;
    }
    const fam = FAMILY_BY_KEY.get(rec.key);
    add('fam:' + rec.key, {
      kind: 'family', key: rec.key, word: fam ? (fam.short || fam.label) : rec.key, mode: 'fill',
    });
  }

  /* LARGEST FIRST — EXCEPT A RAMP, WHICH IS ORDERED BY ITS OWN STEPS.
     The tenure plate is one hue in seven steps and its whole claim is that
     colour is an AMOUNT here and not a category (DESIGN §2.4). Sorted by count
     the strip read "100–149 · 150 or more · 10–24 · 50–74 · …", which is a set
     of categories drawn in a gradient — the exact misreading the ramp exists to
     prevent. The steps stay in order; anything on that plate which is not a
     step of the ramp (the grey of ground already lost) follows them. */
  const out = [...rows.values()].sort((a, b) => {
    if (tenureRows) {
      const at = a.kind === 'tenure', bt = b.kind === 'tenure';
      if (at !== bt) return at ? -1 : 1;
      if (at && bt) return (a.tenure || 0) - (b.tenure || 0);
    }
    return b.count - a.count || String(a.word).localeCompare(String(b.word));
  });
  const keyed = layerRows ? 'layer' : tenureRows ? 'tenure' : out.length ? 'status' : 'nothing';
  if (quiet > 0) {
    /* WHEN EVERY COLOUR STANDS BACK. On the informal plate all 232 units are
       drawn at half alpha and the reading is the dashed rings over them: there
       is no lit colour at all, and a strip that fell back to the dataset's
       legal statuses said "colour = legal status" over a plate whose colours
       had all been quieted. One row says what the plate is doing, and the
       sentence beside it is the layer's own, because on that plate the layer's
       own sentence is true. */
    out.push({
      id: 'quiet', kind: 'quiet', key: null, count: quiet, mode: 'quiet',
      word: keyed === 'nothing' ? 'every colour stands back' : 'stood back',
    });
  }
  return { keyed, rows: out, drawn, quiet, holes, units };
}

/**
 * A cheap signature of the answer above, so the legend can notice that the
 * plate has been repainted under a strip that is already on screen and render
 * again. The renderer paints on its own schedule; measured on this build the
 * paint table is one to two animation frames behind a layer change, and without
 * this the strip could sit on the previous layer's chips indefinitely — which
 * is the same defect as the one this file is fixing, one frame later.
 */
export function plateSig() {
  const p = readPlate();
  if (!p) return 'none';
  return p.keyed + '/' + p.rows.map(r => r.id + ':' + r.count).join(',');
}

/* -----------------------------------------------------------------------------
   THE SENTENCE IS WRITTEN FROM THE SAME MEASUREMENT AS THE CHIPS.

   The classroom critic offered two cures and this is both of them at once:
   where the layer really does re-key the plate, the strip prints the layer's
   sentence over the layer's own categories; where it does not — resistance,
   weight, the network, informal empire, the definition dial — the strip says
   "colour = legal status" and names what the layer adds ON TOP of the fill,
   which is the true description of what a reader is looking at.

   `over` is that second clause. It is not a shortening of the layer's sentence;
   it is the part of the layer that is not the fill.
----------------------------------------------------------------------------- */
export const LAYER_OVER = {
  control: 'the 1–4 keys change what counts as British',
  resistance: 'the pins are revolt and killing',
  famine: 'the pins are dated famines',
  weight: 'size = a cited quantity',
  system: 'the nodes and cables are drawn over it',
  informal: 'the haze is pressure without a claim',
  status: null,
};

/**
 * What this strip may honestly say it is keying.
 * @param plate  the answer from readPlate(), or null
 * @param layerId the active layer
 * @param short  layerShort(layerId) — the layer's own two-word claim
 * @param full   layerSentence(layerId) — the layer's own sentence
 */
export function keySentence(plate, layerId, short, full) {
  /* NO PLATE TO READ. The chips are then the dataset's legal statuses — the
     fallback in ribbon.js — so the sentence says legal status. Printing the
     layer's claim over that fallback is the identical contradiction one step
     further back, and it is what a screen with no map on it used to do. */
  if (!plate) {
    return { text: 'colour = the legal status of British authority in this year', short: 'legal status', keyed: 'unmeasured' };
  }
  if (plate.keyed === 'layer' || plate.keyed === 'tenure' || plate.keyed === 'nothing') {
    return { text: full, short, keyed: plate.keyed };
  }
  const over = LAYER_OVER[layerId];
  if (layerId === 'status' || !over) return { text: 'colour = the legal status of British authority in this year', short: 'legal status', keyed: 'status' };
  return {
    text: 'colour = the legal status of British authority in this year; ' + over,
    short: 'legal status; ' + over,
    keyed: 'status',
  };
}

/** The mark rows the plate is drawing that are not colours, in strip order. */
export const MARK_ORDER = [MARKS.silence, MARKS.absence];

export default { readPlate, plateSig, keySentence, LAYER_OVER, MARK_ORDER };
