/* =============================================================================
   THE COLOUR RIBBON — P17's whole footprint at second zero.
   Owner: P17. Contract: docs/LAYOUT_BUDGET.md §2 (`--key-h`), §3 level 0, §7.

   ROUND 6. Rounds 1–5 of this piece won their arguments by growing: a 30rem
   corner card, a four-field byline on the map's flank, and a reading plate that
   inset the whole application by 40rem. Measured together at 1366x768 that was
   three panels and about 250 words of apparatus standing over a 704px map,
   before the reader had asked anything.

   The strip is now the whole of it. `data-mount="legend"` is a full-width band
   along the FOOT of the plate — 28px at 1024, 30px at 1366, 34px at 1920 — and
   this file fills it with the only thing a reader needs before they have a
   question: THE COLOURS THAT ARE ACTUALLY ON THE MAP THIS YEAR, each with its
   engraved texture, its word and its live count, and one sentence saying what
   the colour is measuring.

   ROUND 9 — TWO THINGS. (a) The strip prints NO control at second zero when it
   managed to draw every colour on the plate with its word and its count: an
   invitation to a reference work nobody asked for was one of six madder-red
   links of identical weight competing in the bottom band, and LAYOUT_BUDGET §7
   asks this piece for "no bordered full-key button" at `plate`. Measured at
   1366x768 the legend's contribution to the opening screen falls from one
   control and 28 words to none and 25. (b) It is withdrawn ONLY when
   withdrawing it costs the reader nothing — if a colour on the plate could not
   be drawn, the control stays at every stage and says how many are missing,
   because the defect round 8 ended was a key that omits in silence.

   THREE RULES IT KEEPS, and each one is a defect this round is repairing:

   1. IT IS INK, NOT CHROME. Every swatch here used to be a button (six controls
      of the nineteen on the opening screen) whose only job was to open the full
      key. A printed atlas's key is not a control surface. There is exactly ONE
      control in this strip — a `.cx-more` into the sheet — and it is the single
      route out of the ribbon.

   2. IT RENDERS ON A PHONE — AND IT SAYS THE WORDS. Round 6 got the strip onto
      a phone; round 7 then let a NAMED_FLOOR turn it into seven anonymous
      squares behind "Name them →" in every state at 390x844, which a hostile
      reader called correctly: the map's primary encoding had become
      undecodable. ROUND 8 removes the floor. The strip names what it can name,
      largest family first, and counts the rest onto its one control.

      RE-MEASURED IN ROUND 12, because the number that was printed here was
      taken before the map's zoom cluster and definition dial docked into this
      strip's trailing end. At 390x844 the strip is 390 wide, of which
      RESPONSIVE_LAW §7 reserves 6.5rem (104px) at the trailing end for P02's
      controls and 10px is gutter: the ribbon gets 276, the route "+7 more"
      takes 73 and a gap 8, and the list gets 195. One name fits — "London
      decides 93", 139px — where "Formerly British 50" would need 148 more.
      That is 93 of the 182 units on the plate named, and the other seven one
      tap away. It is a debt against RESPONSIVE_LAW §5: the dial is on this
      strip at 390 and the law says it should not be.

   3. IT NEVER GROWS. The band has a `block-size`, not a `min-block-size`. If a
      thing does not fit on one line here it goes in the sheet; nothing in this
      file measures the stage, and nothing in it can take a pixel from the map.
   ========================================================================== */

import { el } from '../core/util.js';
import { FAMILIES, FAMILY_BY_KEY, STATUS_SYMBOL, MARKS, layerShort } from './symbology.js';
import { swatch, silenceState, absenceState } from './key.js';
import { keySentence, LAYER_OVER } from './plate-key.js';

/**
 * One entry: the drawn mark, the word for it, and the count under the rule.
 *
 * The word and the count are ALWAYS in the DOM, and always in this order, at
 * every width. What the fit pass below changes is whether they are *painted* —
 * `data-tier="compact"` hides the count from the eye and `"bare"` hides the
 * word as well, each by the `.visually-hidden` clip, never by `display:none`.
 * A phone reader with a screen reader hears "Protectorate, 46" from a strip
 * that has room to draw only the colour, which is the difference between a
 * key that has been abbreviated and a key that has been deleted.
 */
function markLi(cls, symNode, word, count, title, say) {
  const li = el('li.legend__rib', title ? { title } : {});
  li.className = 'legend__rib' + (cls ? ' ' + cls : '');
  li.dataset.tier = 'full';
  li.appendChild(symNode);
  li.appendChild(el('span.legend__rib-w', { text: word }));
  if (count != null) li.appendChild(el('span.legend__rib-n.num', { text: String(count) }));
  /* ROUND 10 — WHAT A READER ACTUALLY HEARD HERE, and it was not this.
     `listitem` takes its name from the author and never from its contents, so
     the `title` above was the WHOLE of the accessible name, and the word and
     the count — the two things a sighted reader gets first — were not in it.
     Measured with Chromium's own accname at 1440x900:

       NAME = "Ruled from London — A governor or a minister in London decides…"

     with no "94" anywhere in it, in a strip whose own comment promises that a
     phone reader "hears Protectorate, 46". They do now. The name states the
     legal form, the count with the noun the numeral is counting, and then the
     sentence, in the order the eye reads them.

     ROUND 12 — AND IT STILL DID NOT SAY THE PRINTED WORD: the name opened
     with the family's LABEL where the chip prints its SHORT. See `ribSay`. */
  if (say) li.setAttribute('aria-label', say);
  return li;
}

/* -----------------------------------------------------------------------------
   THE PRINTED WORD IS THE FIRST WORD SAID — ROUND 12.

   WCAG 2.5.3 (Label in Name) measured on the running app at 1440x900, year 1900,
   with Chromium's own accessible-name computation:

     SEEN  "London decides 93"
     SAID  "The decision is taken in London, 93 units on the plate now. For a
            colony that means a governor or a minister no local electorate…"

   Five of the ten families printed one string and said a different one, and so
   did all seven steps of the tenure ramp and both of the marks. The name was
   not wrong — it is the family's full label, and round 10 put it there for a
   good reason, so that a phone reader whose count is clipped still hears the
   number with its noun. It was *the wrong first word*. A student reading over a
   classmate's shoulder and a student listening to the same strip could not name
   the same chip; a speech-input user saying "London decides" hit nothing.

   So the chip is now said in the order it is drawn — WORD, COUNT, then the full
   label as a clause, then the sentence — and the abbreviation the strip prints
   is expanded rather than replaced. Nothing is lost from the name; one clause
   is added and the order is the eye's.
----------------------------------------------------------------------------- */
function ribSay(word, num, units, { full = null, tail = '', noun = null } = {}) {
  const n = noun || (units === 1 ? 'unit' : 'units');
  const w = String(word || '').trim();
  const inFull = full && String(full).trim().toLowerCase() !== w.toLowerCase()
    ? ` In full: ${String(full).charAt(0).toLowerCase()}${String(full).slice(1)}.`
    : '';
  return `${w}, ${num} ${n} on the plate now.${inFull}${tail ? ' ' + tail : ''}`;
}

/* -----------------------------------------------------------------------------
   WHAT THE CHIPS ARE, AND WHERE THEY COME FROM — ROUND 11.

   They come from the plate. `plate-key.js` reads P02's own paint table and
   returns the colours that are on the map right now, whatever is keying them:
   the ten status families, or a thematic layer's own categories, or the seven
   steps of the tenure ramp. Before this round they were always the status
   families — on all thirteen layers — under a sentence that changed with the
   layer, so at #layer=exit the strip read "colour = how it left" over "Ruled
   from London 94". See plate-key.js for the measurement and the critic.

   The dataset route below is the FALLBACK, for a screen with no plate on it: it
   counts the legal statuses in the dataset at this year, and the sentence that
   goes with it says legal status, because that is what it counted.
----------------------------------------------------------------------------- */
function plateEntries(ctx) {
  const { format } = ctx;
  const pk = ctx.plateKey;
  if (!pk || !pk.rows.length) return null;
  const gloss = ctx.categoryGloss || null;
  return pk.rows.map((r) => {
    const fam = r.key ? FAMILY_BY_KEY.get(r.key) : null;
    const n = r.count;
    const num = format.number(n);
    const noun = n === 1 ? 'unit' : 'units';
    let sym, title, say, word = r.word;
    if (r.kind === 'category') {
      const g = gloss && gloss.get(r.id.replace(/^cat:/, ''));
      sym = swatch('status', { family: r.key, texture: fam ? fam.texture : null });
      title = g ? word + ' — ' + g : word;
      say = ribSay(word, num, n, { tail: g || '' });
    } else if (r.kind === 'tenure') {
      sym = swatch('tenure', { tenure: r.tenure });
      word = r.word;
      title = 'Held ' + r.word + (/year/.test(r.word) ? '' : ' years') + ' by the year on the clock.';
      /* The ramp prints "10\u201324" and said "Held 10\u201324 years by this year": the
         numeral a reader can see was not the numeral they heard first. */
      say = ribSay(r.word, num, n, { tail: 'Held ' + r.word + (/year/.test(r.word) ? '' : ' years') + ' by the year on the clock.' });
    } else if (r.kind === 'absence') {
      sym = swatch('absence');
      title = word + ' — bare ground, never a zero: the record answers nothing this reading asks.';
      say = ribSay(word, num, n, { noun: n === 1 ? 'unit' : 'units', tail: 'Bare ground, never a zero: the record answers nothing this reading asks.' });
    } else if (r.kind === 'informal') {
      sym = swatch('informal');
      title = MARKS.informal.sentence;
      say = ribSay(word, num, n, { full: MARKS.informal.label, tail: MARKS.informal.sentence });
    } else if (r.kind === 'quiet') {
      sym = swatch('quiet');
      title = 'Still drawn, at half strength, in the colour of its legal status — this reading has nothing to say about it.';
      say = ribSay(word, num, n, { tail: 'Still drawn, at half strength, in the colour of their legal status, because this reading has nothing to say about them.' });
      title = word === 'every colour stands back'
        ? 'Every unit on the plate is drawn at half strength, in the colour of its legal status. Nothing on this plate is keyed by this reading — the marks over it are.'
        : title;
    } else {
      sym = swatch('status', { family: r.key, texture: fam ? fam.texture : null });
      title = fam ? fam.label + ' — ' + fam.sentence : word;
      say = ribSay(word, num, n, { full: fam ? fam.label : null, tail: fam ? fam.sentence : '' });
    }
    return { key: r.id, word, count: num, units: n, sym, title, say };
  });
}

/**
 * The families in the DATASET at this year under the rule in force, largest
 * first. The fallback route: used when there is no plate to read.
 */
function families(ctx) {
  const { totals, format } = ctx;
  if (!totals) return [];
  const agg = new Map(totals.sets[ctx.defId].byStatus.filter(a => a.units > 0).map(a => [a.statusId, a]));
  const per = new Map();
  for (const s of (ctx.data.statuses || [])) {
    if (!agg.has(s.id)) continue;
    const sym = STATUS_SYMBOL[s.id];
    const k = sym && sym.family ? sym.family : '_informal';
    per.set(k, (per.get(k) || 0) + agg.get(s.id).units);
  }
  return [...per.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => {
    const fam = FAMILIES.find(f => f.key === k);
    return {
      key: k,
      word: fam ? (fam.short || fam.label) : 'No colour at all',
      count: format.number(n),
      units: n,
      sym: fam ? swatch('status', { family: fam.key, texture: fam.texture }) : swatch('informal'),
      title: (fam ? fam.label + ' — ' + fam.sentence : MARKS.informal.sentence),
      /* The printed word is an abbreviation ("London decides" for "The decision
         is taken in London"). It is said FIRST, then expanded, so the count is
         never a bare numeral, the noun it counts is said, and the first words a
         listener hears are the words a reader can see. */
      say: ribSay(fam ? (fam.short || fam.label) : 'No colour at all', format.number(n), n,
        { full: fam ? fam.label : null, tail: fam ? fam.sentence : MARKS.informal.sentence }),
    };
  });
}

/**
 * The marks that are not colours, and only the ones the RENDERER says it is
 * drawing right now. They arrive at `working`, because a mark for a mode nobody
 * has switched on is decoration. Counts come from the verified recount in
 * index.js or they are not printed at all.
 */
function liveMarks(ctx) {
  const out = [];
  if (ctx.stage === 'plate') return out;
  const sil = silenceState(ctx);
  if (sil.live && sil.count > 0) {
    out.push(markLi('legend__rib--mark', swatch(MARKS.silence.kind, { family: 'crown-conquered' }),
      MARKS.silence.shortLabel, ctx.format.number(sil.count), MARKS.silence.sentence,
      ribSay(MARKS.silence.shortLabel, ctx.format.number(sil.count), sil.count,
        { full: MARKS.silence.label, tail: MARKS.silence.sentence })));
  }
  const abs = absenceState(ctx);
  if (abs.live && abs.count > 0) {
    out.push(markLi('legend__rib--mark', swatch(MARKS.absence.kind, { family: 'crown-conquered' }),
      MARKS.absence.shortLabel, ctx.format.number(abs.count), MARKS.absence.sentence,
      ribSay(MARKS.absence.shortLabel, ctx.format.number(abs.count), abs.count,
        { full: MARKS.absence.label, tail: MARKS.absence.sentence })));
  }
  return out;
}

/**
 * HOW MANY SWATCHES FIT — MEASURED, ONCE, AFTER THE STRIP IS ON SCREEN.
 *
 * Rounds 1–6 answered this from a breakpoint table (`wide 99 / mid 6 / small 4
 * / phone 99`) because a measured budget had once, in round 4, oscillated and
 * deleted the piece's own colours for a session. That table was safe and it was
 * wrong, and at 390x844 it was wrong in the way a hostile reader can see: seven
 * families were emitted into a 271px box, so the strip showed "Ruled from
 * London 94", "Protectorate 46" — cut through the middle of the word, behind a
 * grey fade, with "The key →" on top of it — and five more colours that a phone
 * reader had no way to know existed. A key that looks like a rendering fault is
 * not a key.
 *
 * The measurement is safe HERE, and it was not safe in round 4, for one
 * structural reason: THIS STRIP'S WIDTH DOES NOT DEPEND ON ITS CONTENTS. The
 * shell gives `.stage__key` a full-width row and `block-size: var(--key-h)`;
 * nothing this function does can change the width it is fitting into, so the
 * feedback loop that made round 4's height budget oscillate does not exist.
 * Round 4 measured the STAGE, which the legend was standing in and could push.
 *
 * THREE TIERS, and every entry keeps its word and its count in the DOM in all
 * three (see markLi):
 *
 *   full     the mark, the word, the count       — the key as it is meant to read
 *   compact  the mark and the word               — the count is in the sheet
 *   bare     the mark                            — the word is in the title and
 *                                                  read aloud; the control names
 *                                                  how many colours it is naming
 *
 * THE LADDER — ROUND 8. Rounds 6–7 had a NAMED_FLOOR: if fewer than three
 * families could be named, the strip stopped naming at all and became a row of
 * anonymous colours behind "Name them →". Measured at 390x844 that fired every
 * time, in every state, so the whole phone build shipped a key with no words in
 * it — and a hostile reader put it exactly right: *the map's primary encoding
 * becomes undecodable*. The floor was a theory ("one word out of seven teaches
 * less than seven colours and a promise") and it lost to the screenshot.
 *
 * The floor is gone. THE STRIP ALWAYS NAMES WHAT IT CAN NAME, largest family
 * first, and counts the rest onto its one control:
 *
 *   full     the mark, the word, the count       — the key as it is meant to read
 *   compact  the mark and the word               — the count is in the sheet
 *   bare     the mark alone                      — NEVER CHOSEN. It survives for
 *                                                  print and for the DOM, so a
 *                                                  screen reader still hears
 *                                                  "Protectorate, 46".
 *
 * At 390x844, re-measured in round 12 with P02's controls docked in the strip's
 * trailing 6.5rem, that is one named colour out of eight — "London decides 93 ·
 * +7 more →" — which is 93 of the 182 units on the plate, decodable without
 * leaving the screen, and the other seven one tap away with their words and
 * counts at reading size. One name is what 195px of list buys at 14px; the
 * honest thing is to spend them, not to withhold them.
 *
 * NOTHING IS EVER HALF-DRAWN. An entry that does not fit whole is hidden, not
 * faded: `overflow` is only allowed to do anything in the pathological case
 * where a single entry is wider than the whole strip.
 */

/* WHEN THE RAIL IS OPEN the strip is short by the rail's width — 410px of 1366.
   This decides how the SENTENCE is worded at that width; whether it is printed
   at all is now measured (see the say pass in fitRibbon), not assumed, because
   at 1024x640 with a dossier open the breakpoint dropped a sentence that had
   560 spare pixels to sit in. */
const NARROWER = { wide: 'mid', mid: 'small', small: 'tiny', tiny: 'tiny', phone: 'phone' };

/** The group's name when the strip is printing its own definition sentence. */
const KEY_NAME = 'The key: what each colour on this map means';

/**
 * Build the ribbon.
 *
 * @param ctx     the legend's render context (see index.js buildContext)
 * @param stage   'plate' | 'working' | 'apparatus' — what may be on screen
 * @param width   'phone' | 'small' | 'mid' | 'wide'
 * @param onOpen  (section) => void — the one route out, into the sheet
 */
export function buildRibbon(ctx, { stage = 'plate', width = 'mid', rail = false, onOpen = null } = {}) {
  const phone = width === 'phone';
  const w = rail ? NARROWER[width] || width : width;
  const root = el('div.legend.legend--ribbon', {
    role: 'group',
    'aria-label': KEY_NAME,
  });
  root.dataset.stage = stage;
  root.dataset.width = width;
  root.dataset.rail = rail ? 'open' : 'closed';

  /* THE SENTENCE. FEATURE_SPEC P17 test 1: every layer, in every state, prints
     its one-line definition. It is first because it is what makes the swatches
     mean anything, and it is the sentence the four competing top-of-screen
     panels used to say four ways. A COMPLETE SHORT SENTENCE BEATS A TRUNCATED
     LONG ONE: below 96rem it is the layer's short form, with the full sentence
     on the title and in the sheet, rather than "…British authority in t…". */
  /* ROUND 11 — THE SENTENCE IS WRITTEN FROM THE SAME MEASUREMENT AS THE CHIPS.
     It used to be the active layer's claim, printed whatever the strip below it
     was actually keying. It is now `keySentence(...)`, which reads the plate:
     where the layer really re-keys the fills the sentence is the layer's own;
     where it does not — resistance, weight, the network, the definition dial —
     it says legal status, which is what the chips under it are, and names what
     the layer adds on top. A key that contradicts itself is the error the
     whole M4 lesson exists to kill, and this strip was making it on nine of the
     thirteen layers. */
  const said = keySentence(ctx.plateKey, ctx.activeLayer, layerShort(ctx.activeLayer), ctx.layerSentence);
  const full = said.text || ctx.layerSentence || null;
  const short = said.short || layerShort(ctx.activeLayer);
  /* WHERE THE SENTENCE GOES WHEN THERE IS NO ROOM TO PRINT IT. On a phone, and
     behind an open rail, the strip is about 240 pixels wide and the colours on
     the plate are what it has to spend them on. The sentence is then carried
     three ways and never dropped: at the head of the sheet the one control
     opens, on this group's accessible name (so a screen reader meets it before
     the swatches, exactly as a sighted reader meets it at 1366), and on the
     control's own title. This is the one thing on this strip that has to be
     true at every width, because it is what makes a colour mean anything. */
  if ((phone || rail) && full) root.setAttribute('aria-label', 'The key — ' + full);
  if (!phone) {
    /* "colour = " is a PREFIX, not part of the sentence, so a reading whose
       whole content is that there is NO colour must not have it bolted on. At
       #layer=informal the strip read "colour = pressure without a claim" over a
       plate with every fill quieted — the opposite of what the layer says. */
    const text = w === 'wide' ? full
      : (short ? (/^(no\s+)?colour\b/i.test(short) ? short : 'colour = ' + short) : full);
    root.appendChild(full
      ? el('p.legend__say', { text, title: full })
      : el('p.legend__say.legend__say--defect', {
        text: `[layer “${ctx.activeLayer}” has no definition sentence — it should not have registered]`,
      }));
  }

  const list = el('ul.legend__ribbon-list');
  const fams = plateEntries(ctx) || families(ctx);
  if (!fams.length) {
    list.appendChild(el('li.legend__rib.legend__rib--none', {},
      el('span.cx-note', {
        text: ctx.totals
          ? `nothing is drawn at ${ctx.format.year(ctx.year)} under ${ctx.def.label.toLowerCase()} — a real result, not a loading state`
          : 'no status reported at this year',
      })));
  }
  for (const f of fams) list.appendChild(markLi('', f.sym, f.word, f.count, f.title, f.say));
  for (const m of liveMarks(ctx)) list.appendChild(m);
  root.appendChild(list);

  /* THE ONE CONTROL. `.cx-more`: the route to the fourteen legal forms, the
     marks, the tenure ramp, what a "unit" is, and the three things wrong with
     this rendering. Its LABEL is written by the fit pass, because only the fit
     pass knows what the strip managed to say — a control that says "+2 more"
     beside a strip that in fact drew everything is the same lie as a strip that
     drops two colours in silence. It ships with the honest default and is
     relabelled below.

     ROUND 9 — IT IS NOT ON THE OPENING SCREEN UNLESS THE KEY IS INCOMPLETE.
     LAYOUT_BUDGET §7 asks this piece for "no bordered full-key button" at
     `plate`, and a hostile critic counted six madder-red `.cx-more` links of
     identical weight competing in the bottom band, of which "The full key" was
     one. An invitation to a reference work the reader has not asked for is the
     definition of a link that has not earned its place at second zero.

     But it is only withdrawn when withdrawing it costs the reader NOTHING. If
     the strip could not draw every colour on the plate — at 1024x640 it draws
     six of seven, on a phone two of seven — the control stays, at `plate` and
     at every other stage, labelled with what is missing. Rule 1 of this module
     is that nothing is asserted about the plate that has not been measured, and
     its corollary is that a key which omits must say so and must offer the way
     to what it omitted. Silence about a missing colour is the worse defect, and
     it is the one round 8 was built to end. See the tail of `fitRibbon`. */
  /* WHAT THE CONTROL PROMISES DEPENDS ON WHAT THE STRIP IS KEYING. On a plate
     re-keyed by a thematic layer, "every legal form on the plate" describes
     neither the chips beside it nor the colours above it, and the sheet it
     opens now leads with the reading actually in force. */
  const routeTitle = said.keyed === 'layer' || said.keyed === 'tenure'
    ? 'What these colours are counting right now, the marks that are not colours, what a unit is, and what is wrong with this rendering.'
    : 'Every legal form on the plate, the marks that are not colours, what a unit is, and what is wrong with this rendering.';
  const route = el('button.cx-more.legend__route', {
    type: 'button',
    'data-focus-key': 'legend-route',
    'aria-haspopup': 'dialog',
    text: phone ? 'The key' : 'The full key',
    title: routeTitle,
    /* The fit pass rewrites this the moment the strip is in the document, but
       `.cx-more::after` prints a right arrow and generated content is part of
       an accessible name, so the control ships WITH a name rather than
       acquiring one: a strip that never gets a fit pass must not be the one
       state where the route is spoken "The full key right-pointing arrow". */
    'aria-label': (phone ? 'The key' : 'The full key') + ' — ' + routeTitle,
  });
  if (onOpen) route.addEventListener('click', () => onOpen('colour'));
  root.appendChild(route);
  /* MAY THE SENTENCE BE SPENT ON A COLOUR? Only when it is the redundant one.
     The fit pass drops the sentence when dropping it buys another chip, on the
     round-6 argument that "the swatch words ARE legal statuses and the sentence
     is the more redundant of the two". That argument holds for exactly one
     case and this round created the others: on a re-keyed plate the sentence
     names the reading its categories belong to, and on a marked plate it is the
     only thing on the strip that says the pins exist. Measured at 1366x768 on
     the resistance plate before this flag: the strip spent "colour = legal
     status; the pins are revolt and killing" to print "A company 1". */
  const sayRedundant = said.keyed === 'status' && !LAYER_OVER[ctx.activeLayer];
  /* `full` is kept because the FIT PASS can spend the sentence for a colour
     after this function has returned, and when it does the sentence has to move
     to this group's accessible name. See the tail of `fitRibbon`. */
  root.__ribbon = { phone, rail, stage, families: fams.length, keyed: said.keyed, title: routeTitle, sayRedundant, full };
  return root;
}

/* -------------------------------------------------------------------------- */
/* THE FIT PASS                                                               */
/* -------------------------------------------------------------------------- */

const HIDDEN_STYLE = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;'
  + 'overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;';

/** px width of a child, plus the flex gap that precedes it. */
function slice(node, gap) {
  if (!node) return 0;
  return node.getBoundingClientRect().width + gap;
}

/** Set an entry's tier and paint it: the DOM never changes, only what is drawn. */
function setTier(li, tier) {
  li.dataset.tier = tier;
  const word = li.querySelector('.legend__rib-w');
  const num = li.querySelector('.legend__rib-n');
  const hide = (n, yes) => { if (n) n.setAttribute('style', yes ? HIDDEN_STYLE : ''); };
  hide(num, tier !== 'full');
  hide(word, tier === 'bare');
}

/**
 * Fit the ribbon to the strip it is standing in. Called by the legend once, on
 * the frame after the strip is in the document. Idempotent: it rebuilds its
 * decision from scratch every time, from the same three measurements, so it
 * cannot ratchet.
 *
 * @param root the `.legend--ribbon` element, already in the document
 * @returns {{tier:string, named:number, shown:number, dropped:number, total:number}}
 */
export function fitRibbon(root) {
  if (!root || !root.isConnected) return null;
  const list = root.querySelector('.legend__ribbon-list');
  const routeEl = root.querySelector('.legend__route');
  if (!list) return null;
  const items = [...list.querySelectorAll('.legend__rib')].filter(n => !n.classList.contains('legend__rib--none'));
  const total = items.length;
  if (!total) { root.dataset.fit = 'ok'; return { tier: 'full', named: 0, shown: 0, dropped: 0, total: 0 }; }

  /* Reset to full and unhide everything, so the measurement below is of the
     strip as it wants to be, not of last render's answer. */
  for (const li of items) { li.hidden = false; setTier(li, 'full'); }
  /* The control too: it is withdrawn at the tail of this function when the key
     turns out to be complete, and this function is idempotent. */
  if (routeEl) routeEl.hidden = false;
  /* The sentence too: this function is idempotent and is re-run whenever the
     strip's width changes, so it must never inherit the last run's answer. */
  const say0 = root.querySelector('.legend__say');
  if (say0) say0.hidden = false;
  root.dataset.fit = 'ok';

  const cs = getComputedStyle(list);
  const gap = parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
  /** The disclosure level the strip was built at. See the tail of this file. */
  const stageOf = () => (root.__ribbon && root.__ribbon.stage) || 'plate';

  /* ONE MEASURING PASS, taken with every entry at `full` and every entry shown,
     so the numbers below describe the strip as it wants to be rather than what
     the last render decided. `full` is the entry as drawn; `compact` is it
     without its count; `bare` is it without its word as well. None of these
     depend on the strip's width, so they are measured once and the ladder is
     then pure arithmetic. */
  const rows = items.map((li) => {
    const inner = parseFloat(getComputedStyle(li).columnGap) || 0;
    const full = li.getBoundingClientRect().width;
    const numW = slice(li.querySelector('.legend__rib-n'), inner);
    const wordW = slice(li.querySelector('.legend__rib-w'), inner);
    return { li, full, compact: full - numW, bare: full - numW - wordW };
  });
  const words = items.map(li => ((li.querySelector('.legend__rib-w') || {}).textContent || '').trim());

  const runs = (key, k) => rows.slice(0, k).reduce((n, r) => n + r[key], 0) + gap * Math.max(0, k - 1);
  const phone = !!(root.__ribbon && root.__ribbon.phone);

  /**
   * THE LADDER, taken from the width the list has RIGHT NOW.
   *
   * ROUND 8: NAMING IS NOT NEGOTIABLE. Draw as many entries whole as the strip
   * holds, largest family first, at the richest tier that fits at least one of
   * them. `bare` — a colour with no word beside it — is never chosen: it was
   * chosen on every phone render in round 7 and it turned the whole 390px build
   * into a key with no words in it. If not even one entry fits with its word,
   * one is drawn anyway at `compact` and allowed to overrun by a few pixels; a
   * word running a little past the edge is a key, and seven anonymous squares
   * are not.
   */
  const layout = (cap = Infinity) => {
    const avail = list.clientWidth;
    const howMany = (key) => { let k = 0; while (k < total && runs(key, k + 1) <= avail) k++; return k; };
    let tier = 'full';
    let shown = avail ? howMany('full') : total;
    /* THE COUNT IS THE FIRST THING TO GO, NEVER THE WORD. "Protectorate" with
       its 46 in the sheet still tells a reader what the blue hatch is. */
    if (avail && shown < 1) {
      const kCompact = howMany('compact');
      if (kCompact > 0) { tier = 'compact'; shown = kCompact; }
    }
    /* ROUND 10 — NOTHING IS HALF-DRAWN, AND THAT NOW INCLUDES THE LAST ONE.
       Rounds 8–9 ended this ladder with `if (shown < 1) { shown = 1; }`: draw
       one entry anyway and let it "overrun by a few pixels". Measured at
       390x844 inside beat 1 of the authored path, with RESPONSIVE_LAW §E's
       6.5rem reservation for the map's zoom cluster standing at the strip's
       trailing end, the list box was 118px, the one forced entry was 140px, and
       the strip read "Ruled from Londo" under a hard clip. That is 22 pixels,
       not a few, and it is the exact defect RESPONSIVE_LAW §7 names for this
       module ("Settler assemb") and the one LAYOUT_BUDGET §4 forbids in as many
       words: a word cut mid-word is not a shorter key, it is a wrong one.
       The pixels come back from the CONTROL's label, never from the swatch —
       "+7 more" is 73px where "+7 more · the full key" is 150px, and 77px is
       the difference between a whole colour and a cut one. See `solve`. */
    shown = Math.min(shown, cap);
    for (let i = 0; i < total; i++) {
      const li = rows[i].li;
      if (i < shown) { setTier(li, tier); li.hidden = false; } else { li.hidden = true; }
    }
    /* The box itself, not the arithmetic about it: `runs()` is a sum of widths
       measured at one tier, and this is what the strip is actually doing now. */
    return { tier, shown, dropped: total - shown, over: Math.max(0, list.scrollWidth - list.clientWidth) };
  };

  /* THE CONTROL IS PART OF THE LAYOUT. "+2 more · the full key" is sixty-five
     pixels wider than "The full key", and on a 358px phone strip those pixels
     are two colours. So the strip is fitted against the SHORTEST label first,
     and a longer, more explicit label is kept only if it costs the reader
     nothing. A control that explains what was left out by leaving more out is
     worse than a short one with the same promise on its title.

     ONE RULE OVERRIDES THAT ECONOMY: the label may never be quieter than the
     truth. If colours were dropped, the control says "+N more" at every width,
     whatever it costs, because the alternative is a key that silently omits. */
  const SHORT = phone ? 'The key' : 'The full key';
  const FULL_TITLE = (root.__ribbon && root.__ribbon.title)
    || 'Every legal form on the plate, the marks that are not colours, what a unit is, and what is wrong with this rendering.';
  /* THE LABEL IS PRINTED AND THE NAME IS SPOKEN, AND THEY ARE NOT THE SAME
     STRING. "+4 more · the full key" is four printed things — a plus sign, a
     numeral, a mid dot used as punctuation, and a `::after` arrow from
     `.cx-more` — of which only "more" and "the full key" are words. Before this
     round the accessible name was that label verbatim. `say` is the sentence,
     and the label is left to be a label. */
  /* ROUND 12 — AND THE NAME STILL HAS TO CONTAIN THE LABEL. Measured at
     1440x900 on #layer=exit: the control printed "+7 more · the full key" and
     was named "7 more colours, in the full key — …". A speech-input user who
     says what they can see ("seven more, the full key") hits nothing, which is
     WCAG 2.5.3 failed on the strip's only control. The plus sign and the mid
     dot are punctuation and stay drawn-only; every WORD that is printed is now
     said, in the printed order, and the explanation follows it. */
  const spokenLabel = (text) => String(text).replace(/^\+/, '').replace(/\s*·\s*/g, ', ').trim();
  const setLabel = (text, title, say) => {
    if (!routeEl) return;
    if (routeEl.textContent !== text) routeEl.textContent = text;
    routeEl.title = title;
    const lead = spokenLabel(text);
    const tail = say && say.toLowerCase() !== lead.toLowerCase() ? ' — ' + say : '';
    routeEl.setAttribute('aria-label', lead + tail + ' — ' + title);
  };
  const restTitle = (r) => `${words.slice(r.shown).filter(Boolean).join(', ')} — and every colour on this plate, every mark, and every criticism, in the full key.`;
  /* Every entry the strip draws is now named, so the only thing a label ever
     has to admit is a colour it could not fit at all. "Name them" is gone with
     the tier that made it necessary. When the counts had to go, the control
     says so — the reader is looking at a key with words and no numbers and is
     owed the reason. */
  const countTitle = () => `${words.filter(Boolean).join(', ')} — with their counts, the reading behind them, and what is wrong with this rendering.`;
  /* "+N MORE" MEANS "MORE THAN THE ONES BESIDE ME", so when there are none
     beside it the word is a lie about the strip and not just about the count.
     Measured at 320x700 — narrower than any viewport in the budget, and a real
     phone in landscape-locked cases — the withdraw pass below empties the strip
     and the label read "+8 more" with nothing to be more than. It says what it
     has instead. */
  const none = (r) => r.shown === 0;
  /* `say` is now the clause that FOLLOWS the printed label in the name, not a
     replacement for it, so it supplies the noun the numeral is counting and
     never repeats the words the label already said. */
  const moreSay = (r) => (none(r)
    ? `all ${words.length} colours on the plate, and none of them fit on this strip`
    : `that is ${r.dropped} ${r.dropped === 1 ? 'colour' : 'colours'} this strip could not draw`);
  const moreText = (r) => (none(r) ? `All ${r.dropped} colours` : `+${r.dropped} more`);
  const allTitle = () => `${words.filter(Boolean).join(', ')} — with their counts, the reading behind them, and what is wrong with this rendering. This strip is too narrow to draw any of them.`;
  const moreTitle = (r) => (none(r) ? allTitle() : restTitle(r));
  /** The most explicit honest label for an outcome. */
  const wideLabel = (r) => (r.dropped > 0
    ? { text: `${moreText(r)} · the full key`, title: moreTitle(r), say: moreSay(r) }
    : r.tier === 'compact'
      ? { text: phone ? 'The counts' : 'The counts · the full key', title: countTitle(), say: 'the numbers this strip could not print' }
      : { text: SHORT, title: FULL_TITLE, say: null });
  /** The shortest honest label for an outcome. */
  const terseLabel = (r) => (r.dropped > 0
    ? { text: moreText(r), title: moreTitle(r), say: moreSay(r) }
    : r.tier === 'compact'
      ? { text: 'The counts', title: countTitle(), say: 'the numbers this strip could not print' }
      : { text: SHORT, title: FULL_TITLE, say: null });

  /* THE LABEL IS PART OF THE LAYOUT, AND SO IS THE SENTENCE.

     "+2 more · the full key" is 56 pixels wider than "+2 more", and 56 pixels
     is a colour: measured at 1366x768 with the dossier open, round 7 printed
     the long form beside five colours where the short form would have printed
     six. So the label and the strip are solved together, and only three things
     are ever true of a key — everything fits; N are missing and the control
     says N; or the words fit but the counts do not.

     The pathological case is real and has to be decided rather than left to
     flicker: at some widths ANNOUNCING the missing colour ("+1 more", 77px)
     frees exactly the pixels that colour needed (109px at "A company 3"), so
     "+1 more" beside seven of seven and "the full key" beside six of seven are
     both lies. The strip then holds one back on purpose (`cap`) and says so.
     The reader is told about a colour they can reach in one tap, which is true,
     and the key does not swap a colour in and out under a stationary cursor. */
  const fit = (lab, cap) => { setLabel(lab.text, lab.title, lab.say); return layout(cap); };

  const solve = () => {
    let out = fit({ text: SHORT, title: FULL_TITLE, say: null }, Infinity);
    if (out.dropped === 0) {
      /* Everything is drawn. The only remaining question is whether the counts
         had to go, which `terseLabel` answers with "The counts". */
      const lab = terseLabel(out);
      out = fit(lab, out.shown);
      return { out, lab };
    }
    /* Something is missing, so the control must say so, and the shortest
       honest form is tried first because it is the one that buys colours. */
    let lab = terseLabel(out);
    for (let i = 0; i < 4; i++) {
      out = fit(lab, Infinity);
      const next = terseLabel(out);
      if (next.text === lab.text) break;
      lab = next;
    }
    if (out.dropped === 0) {
      out = fit(lab, total - 1);
      lab = terseLabel(out);
      out = fit(lab, total - 1);
    }
    /* The explicit form is kept only if it costs the reader nothing — and, from
       round 9, only once the reader has started. "+1 more · the full key" is
       two things: an omission the key owes the reader, and an invitation to a
       reference work. At `plate` only the debt is printed. */
    const wide = stageOf() === 'plate' ? lab : wideLabel(out);
    if (wide.text !== lab.text) {
      const t = fit(wide, out.shown);
      /* "costs the reader nothing" now includes NOT CUTTING THE LAST COLOUR.
         Measured at 390x844 on beat 9 before this round: the explicit label was
         kept because it dropped no colour, and the colour it kept was drawn six
         pixels short of its own last letter. A count of entries is not the test;
         whether the strip overruns its own box is. */
      if (t.shown === out.shown && t.dropped === out.dropped && !t.over) return { out: t, lab: wide };
      out = fit(lab, out.shown);
    }
    return { out, lab };
  };

  /* THE SENTENCE PASS — MEASURED, NOT ASSUMED.
     Rounds 6–7 dropped "colour = legal status" from a breakpoint whenever the
     rail was open. At 1024x640 with a dossier open that threw the sentence away
     to leave 560 spare pixels behind it, and FEATURE_SPEC P17 test 1 — every
     layer, in every state, shows its one-line definition — failed in the state a
     reader is most likely to be in: a territory selected, asking what its colour
     means. The sentence yields the strip ONLY when yielding it actually buys a
     colour. When it does, the colours win, because the swatch words ARE legal
     statuses and the sentence is the more redundant of the two — and it is never
     lost: it stays on the group's accessible name, on the control's title, and
     at the head of the sheet the control opens. */
  const sayEl = root.querySelector('.legend__say');
  const saySpendable = !!(root.__ribbon && root.__ribbon.sayRedundant);
  let solved = solve();
  if (sayEl && saySpendable && solved.out.dropped > 0) {
    const withSay = solved;
    sayEl.hidden = true;
    const without = solve();
    if (without.out.shown > withSay.out.shown) solved = without;
    else { sayEl.hidden = false; solved = solve(); }
  }
  /* ------------------------------------------------------------------------
     THE LAW'S OWN SENTENCE, ENFORCED ON THE BOX AND NOT ON THE ARITHMETIC.

     RESPONSIVE_LAW §7 to this module: "make a swatch that does not fit
     DISAPPEAR rather than be cut". Everything above is a sum of widths measured
     once, at one tier, before the label was chosen; this is the strip as it now
     stands. If it still overruns — because a font fell back, because a count
     grew a digit, because the shell's 6.5rem reservation for the zoom cluster
     moved — the LAST entry drawn is withdrawn and the control counts it, and
     that repeats until nothing is half-drawn. The strip may end up naming
     nothing at all; that is honest and it is one press from all of it, where a
     colour cut through its own word is neither.
  ------------------------------------------------------------------------ */
  const overruns = () => list.scrollWidth > list.clientWidth + 1;
  for (let guard = 0; guard <= total && overruns() && solved.out.shown > 0; guard++) {
    const want = solved.out.shown - 1;
    const lab = terseLabel({ shown: want, dropped: total - want, tier: solved.out.tier });
    solved = { out: fit(lab, want), lab };
  }
  const out = solved.out;

  const { tier, shown } = out;
  root.dataset.fit = (out.dropped || tier !== 'full') ? 'trimmed' : 'ok';
  root.dataset.tier = tier;

  /* ROUND 9 — THE CONTROL LEAVES THE OPENING SCREEN WHEN THE KEY IS WHOLE.
     At `plate`, with every colour on the plate drawn with its word and its
     count, there is nothing this control can honestly promise that the strip is
     not already saying, so it is an invitation and not a route, and the opening
     screen is allowed exactly one of those (the shell's). Withdrawing it here
     can only give the list MORE width, and the list is already showing
     everything, so the layout above cannot change under it.
     Measured at 1366x768: the legend's contribution to the opening screen falls
     from one control to none, and the screen loses one of its madder-red links.
     The moment the reader touches anything the shell moves to `working` and the
     route is back — as is anything the strip had to leave out, at every stage,
     because an omission that is not offered a way out is the defect this
     control exists to prevent. */
  const whole = out.dropped === 0 && tier === 'full';
  if (routeEl) routeEl.hidden = (stageOf() === 'plate' && whole);

  /* ROUND 12 — THE CLAIM THIS FILE MAKES ABOUT THE SENTENCE, MADE TRUE.
     The sentence pass above says the definition "is never lost: it stays on the
     group's accessible name". It did not. The name was written once, in
     `buildRibbon`, and only for a phone or an open rail — so at 1440x900 on the
     cold plate at 1900, where eight families make the sentence worth a colour,
     `.legend__say` was hidden and the group was still named "The key: what each
     colour on this map means". Measured: the layer's one-line definition —
     "colour = the legal status of British authority in this year", FEATURE_SPEC
     P17 acceptance test 1 — was on that screen nowhere at all, printed or
     spoken. The name is now decided from what the strip ACTUALLY PAINTED, on
     every pass, which is the only place that fact exists. */
  const full = root.__ribbon && root.__ribbon.full;
  const sayPainted = !!(sayEl && !sayEl.hidden && sayEl.getBoundingClientRect().width > 0);
  root.setAttribute('aria-label', full && !sayPainted ? 'The key — ' + full : KEY_NAME);

  return { tier, named: tier === 'bare' ? 0 : shown, shown, dropped: total - shown, total,
    route: routeEl ? !routeEl.hidden : false };
}

export default { buildRibbon, fitRibbon };
