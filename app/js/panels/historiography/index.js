/* panels/historiography — HISTORIANS DISAGREE.
 *
 * WHAT WAS WRONG. The argument content of this piece — fourteen disputes,
 * thirty-one named historians, every position written in the form its own
 * author would recognise, every one carrying the strongest thing said against
 * it — was written, audited and then never mounted. `index.js` was still the
 * no-op stub the shell ships as a placeholder, nothing in the application
 * imported `render.js`, and there was no stylesheet. A reader driving the
 * running app could not reach one word of it. This file is the wiring, and it
 * is the whole of this round's structural work.
 *
 * WHERE IT LIVES. Two surfaces, both at LAYOUT_BUDGET level 3, which is the
 * rail — a surface, not a stage. Nothing here is added to the plate, the lede
 * band, the ribbon or the time bar, so the budget at every viewport is
 * unchanged by this piece.
 *
 *   1. THE CARD, in the dossier column, under its own eyebrow, printing the
 *      argument's own question and the names of the people having it. It is
 *      injected into an anchor the dossier prints for it, so if this module
 *      fails to mount the anchor stays empty and the dossier is unharmed.
 *   2. THE ARGUMENT, in the rail sheet via `ask:sheet` — one panel at a time,
 *      guaranteed 280px and its own scroll, beside a live map.
 *
 * THE RULE THIS PIECE EXISTS FOR. Nothing downstream of the student's
 * commitment is in the DOM before the commitment. Not hidden with CSS, not
 * disabled, not one element away: `renderFull` returns early. A student who
 * opens the panel and reads it top to bottom cannot read the verdict before
 * they have chosen a side and written a sentence saying why.
 *
 * WHAT IT DOES NOT DO. It renders no quotation itself. Every text in this
 * panel — the primary documents and the historians' own books — goes through
 * the dossier's `renderSource()`, the single function in this application
 * permitted to print one, which answers nature / origin / purpose / what it
 * cannot tell you above the words and in front of them in DOM order.
 *
 * ---------------------------------------------------------------------------
 * THIS ROUND — THREE THINGS.
 *
 *   1. A THIRD SURFACE: THE GATE THE LESSON PATH MOUNTS. `./CONTRACT.md` is the
 *      whole contract and `window.BEA.historiography.contract` is the same thing
 *      on the running app. In one line: a caller emits `ask:disputeGate` with
 *      two callbacks, reads `payload.gate` on the next line — `bus.emit` is
 *      synchronous and returns its own detail — mounts `gate.node` on a surface
 *      it owns, and unlocks on `onCommit`. Nothing about the commitment changes:
 *      the verdict is not in the document until the student has chosen a
 *      position AND written a sentence, wherever the argument is standing.
 *      Which argument the path gets is decided in `disputes.js` (`pathGate`),
 *      not by the caller: today it is 1857 — mutiny, peasant war, or first war
 *      of independence — at spine T9, beside the beat where the Company hands
 *      India to the Crown. `gate.scenario.js` in this directory is the
 *      executable form; run it with `tools/inspect.js`.
 *
 *   2. THE PHONE. Measured with an argument open: at 390x844 the rail's body is
 *      390x198 and the argument was 3,016px — fifteen screens, five lines at a
 *      time, with three historians and a commitment somewhere inside it. There
 *      is no more height to ask for (RESPONSIVE_LAW §2 closes the arithmetic at
 *      844 with the panel at LAYOUT_BUDGET B8's floor), so the argument is
 *      CHAPTERED below 62rem — one historian per screen, a sticky pager at the
 *      foot saying `2 of 5 · Eric Stokes`. Longest chapter now 1,335px. It is
 *      presentation only: every chapter is in the DOM at every viewport,
 *      `paginate()` re-runs on `chrome:layout`, and a half-typed sentence
 *      survives a rotation.
 *
 *   3. WHEN A TEXT WAS MADE. Every dispute now carries `span`, the years it is
 *      about, and every text is placed against it. The 1857 argument listed one
 *      "document made at the time" and it was Gandhi in 1922. It is still there
 *      — what a nationalist leader said in a British court is part of the
 *      argument about what to call 1857 — under a heading that says when it was
 *      written. And `settleKey` names, on the face of every argument, the
 *      archive or the comparison that would decide it; `audit()` requires it.
 *
 * ---------------------------------------------------------------------------
 * ROUND 3 — FOUR THINGS, THREE OF THEM FOUND BY MEASURING RATHER THAN BY BEING
 * TOLD.
 *
 *   1. THE BAND IS MEASURED, NOT GUESSED. Chaptering was gated on the shell's
 *      width signal, `#app[data-rail="sheet"]`, and the thing it protects a
 *      reader from is a HEIGHT. Measured, all fourteen opened in the rail:
 *      900x700 was **15.4 screens** and 1024x640 **15.6** — both wide enough to
 *      miss the width test and short enough to be worse than the phone, which
 *      was 2.6. It is now read off the surface the node is actually in, whoever
 *      owns it: chapter when the reading window is under 620px, or when the
 *      argument would take more than six windowfuls. After: 1.2 and 1.3. A gate
 *      mounted in a 129px lesson beat at 1440 chapters itself for the same
 *      reason, and the caller does nothing. See render.js `bandFor`.
 *
 *   2. TWO THINGS PINNED TO ONE SCROLLER'S FOOT. `elementFromPoint` at the
 *      centre of this panel's own Next button returned `cl-blk__finish`: the
 *      Close module pins the through-line block inside `.cx-sheet__body` at
 *      z-index 4, and the pager is pinned to the same edge at 2. Back and Next
 *      were under it on all fourteen arguments at 390x844. The pager now
 *      measures whatever is stuck across it and sits on top of it; the
 *      through-line keeps the edge. No file of theirs is touched. See
 *      render.js `liftPager`, and `P16-band` in accept.scenario.js.
 *
 *   3. THE PATH GETS THREE ARGUMENTS, NOT ONE. "The path never meets famine or
 *      the Scramble" — and both arguments were written, sourced and gated in
 *      `disputes.js` and merely not nominated. `gateFor('compensation')`,
 *      `gateFor('nationalisation')` and `gateFor('egypt')` are the whole API.
 *      `defaultGate()` is still 1857 and does not move. CONTRACT v2.
 *
 *   4. THE STRONGEST CASE ON THE OTHER SIDE IS NOW A POSITION. Christine
 *      Kinealy's reading of the relief files was load-bearing in the famine
 *      verdict and in Ó Gráda's `explainAway` — stated, that is, only by the
 *      people arguing against it, which is the failure mode this file's first
 *      rule exists to prevent. She is the third position now, in her own form,
 *      with her own evidence and her own thing to explain away.
 *
 * ---------------------------------------------------------------------------
 * ROUND 4 — THE STUDENT PRODUCES SOURCE REASONING INSTEAD OF RECOGNISING IT.
 *
 *   1. FOUR DOCUMENTS WITH THE FOUR ANSWERS BLANK. `./produce.js`, and the
 *      historian's sharpest remaining criticism in his own words: "the student
 *      can RECOGNISE source reasoning; they never PRODUCE any." The lesson path
 *      already asks for the four lines once, on Lobengula's 1889 letter, and
 *      the recall quiz once on Macaulay's Minute — so this is not a third
 *      rendering of either. It is the practice: Sharpe's words at the gallows
 *      carried in a missionary's book, Hastings explaining a revenue figure to
 *      his shareholders, Dyer defending himself under examination, Powell on
 *      Hola in Hansard. Four kinds of document, four arguments, and a different
 *      one of the four questions hard on each. Ours are printed beside theirs
 *      only after they have written four, and under each pair is what a strong
 *      answer notices and where a weak one stops — which is the half a
 *      comparison cannot give and the half that transfers.
 *
 *   2. A SECOND CONTRACT, THE SAME SHAPE AS THE FIRST. `ask:sourceLines`,
 *      CONTRACT.md §9, v3: emit, read `payload.exercise` on the next line,
 *      mount the node, unlock on `onCommit`. A path team learns one contract.
 *      `produce.scenario.js` mounts it into a 320x140 box of its own and
 *      asserts all of it, including that this atlas's four answers are not in
 *      the DOM — searched in `textContent`, because a chaptered surface hides
 *      things and `innerText` would not see a leak.
 *
 *   3. THE ONE ARGUMENT WITH NO DOCUMENT IN IT. Choosing where the four
 *      exercises should stand found that `did-britain-care` — Porter against
 *      MacKenzie, Hall and Rose — named no primary text at all, so the panel
 *      that says what an argument stands on printed works and nothing else. It
 *      has Dyer's evidence to the Hunter Committee now, because what Britain
 *      did WITH that document in 1920 is the sharpest evidence either position
 *      has.
 *
 *   4. AND ONE NUMBER MADE HONEST. Re-checking every historiographical
 *      attribution in this module against the record turned up no misattributed
 *      position and no invented work, but it did turn up one over-precise
 *      figure: "about 3.2 million acres" for the raupatu under the New Zealand
 *      Settlements Act, where the published totals differ because some of the
 *      land was later returned or paid for. It now says "more than three
 *      million acres" and says why the totals differ — DIDACTIC_SPEC §7.1
 *      rule 3, applied to our own prose.
 *
 * ---------------------------------------------------------------------------
 * ROUND 5 — THE SET, NOT THE EXERCISE; AND THE PROSE RE-CHECKED AGAINST THE
 * RECORD A SECOND TIME.
 *
 *   1. TWO DOCUMENTS MADE TO JUSTIFY, AND AN AUDIT THAT REQUIRES THEM. The
 *      rubric critic: "the four-line source task fires once, on Lobengula. A
 *      second, on a source whose purpose cuts the other way, would let the
 *      student see that the four fields answer differently for a document
 *      written to justify rather than to protest." So the set now holds six,
 *      and Trevelyan on the greater evil (1846) and Salisbury on drawing lines
 *      upon maps (1890) are both documents made to defend a thing being done.
 *      More to the point, `madeTo` and `contrastWith` are now FIELDS, and
 *      `auditProductions()` fails a set that is all complaint or all cover
 *      story, or a pairing that points at a document made to do the same
 *      thing. The criticism was about the set; the answer is a property of the
 *      set, and it is checked rather than asserted.
 *
 *   2. THE PATH CAN FIRE IT TWICE WITHOUT INVENTING ANYTHING. `sourceForBeat
 *      (beatId)`, the same shape as `gateFor(beatId)`: `compensation` gets
 *      Trevelyan, `egypt` gets Salisbury, both on the core route, both keyed
 *      to arguments the path already gates. `withSource: true` folds the
 *      exercise into the gate instead. Every reply carries `costS`, computed
 *      off the exercise's own prose in the path's own model, because the
 *      minute belongs to the caller. CONTRACT v4, §9.1 and §9.2. And a
 *      `beatId` that names nothing now returns null instead of quietly
 *      handing back the first exercise in the file, which is what it did.
 *
 *   3. THE OPENING SCREEN WAS SIX THINGS. Measured in the rail at 390x844:
 *      reading window 170px, and the exercise's first chapter — the argument,
 *      the quotation, the attribution, the locator, the lead and the note
 *      about the missing apparatus — was 731px. 4.3 screenfuls, against 1.9
 *      for each of the four questions after it, in a module whose whole rule
 *      is one thing to read per screen. It is two chapters now, the sheet no
 *      longer repeats its own eyebrow inside the panel (that alone gave the
 *      window back 28px), and the tallest chapter is 411px. `pair.scenario.js`
 *      guards the ratio.
 *
 *   4. THE STRIP UNDER THE LIFTED PAGER. With the pager lifted over the
 *      Close's through-line block there was a ~20px letterbox below it where
 *      the tail of the chapter went on being drawn — at 390 it was the amber
 *      "Every other document in this atlas is printed with four labelled…"
 *      cut off under everything else. The pager's background now continues
 *      through the whole lifted region; their block still paints over ours.
 *
 *   5. EVERY HISTORIOGRAPHICAL ATTRIBUTION RE-CHECKED, and this is the second
 *      pass over the same 14 arguments. 31 named historians, 39 works, and
 *      every claim / reads / explain-away / verdict paragraph read against the
 *      record. No position was found misattributed and no work invented — the
 *      subtle ones are right, including that the 1953 article is Gallagher and
 *      Robinson and the 1961 book is Robinson and Gallagher with Alice Denny,
 *      and that The Peasant Armed is posthumous, edited by Bayly. Five things
 *      were corrected, all of them ours rather than the historians':
 *        · Waitangi printed "185 years of unbroken practice" in two places —
 *          arithmetic pegged to 2025, wrong from 2026 onward. It now says
 *          "since 1840", which cannot go stale.
 *        · Waitangi said the argument "is running now, in the New Zealand
 *          Parliament, over a bill to redefine the treaty's principles". The
 *          Treaty Principles Bill was voted down at its second reading in
 *          April 2025. The verdict now dates the bill, its record number of
 *          submissions and its defeat.
 *        · The stake said the question "is being argued in the New Zealand
 *          Parliament ... now". Dated to 2024–25.
 *        · Dalrymple's Delhi was "the five months it held the city", twice.
 *          11 May to the assault of 14–21 September 1857 is four, and the
 *          dates are now printed so a reader can check the arithmetic.
 */
import { el, on, disposer, loadCss, announce } from '../../core/util.js';
import { DISPUTES, disputesFor, disputeById, stats, audit, auditVoice, defaultGate, pathGates,
  gateFor, disputesAbout } from './disputes.js';
import { renderCard, renderFull, renderGate, renderIndex, paginate, chapterCount, bandFor,
  readingWindow, naturalHeight, liftPager, BAND, assemble, indexLink as renderIndexLink } from './render.js';
import { commit, judgementFor, judgements, judgedCount, rehydrate, MIN_CHARS } from './judgement.js';
import { PRODUCTIONS, productionById, productionFor, productionForBeat, pathSources, costOf,
  produceChapters, renderProduce, commitLines,
  linesFor, noteTyping, typingFor, rehydrateLines, auditProductions, produceStats, MIN_FIELD,
  FIELDS as SRC_FIELDS } from './produce.js';
import { renderSource } from '../dossier/source.js';
import { TESTIMONY } from '../dossier/testimony.js';
import { acquisitionVerb } from '../dossier/fields.js';
import { auditSilences, auditWorks, workStats, auditAttribution, attributionStats } from './standing.js';

/* Small counts are spelled in prose: DESIGN §6 rule 2 reserves tabular figures
   for dates, counts and durations a reader compares. Held once so that two
   sentences about the same set cannot print two different numbers. */
const SPELLED = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];

const TXT = new Map(TESTIMONY.map((t) => [t.id, t]));

/* ========================================================= THE GATE CONTRACT ==
 * Published on `window.BEA.historiography.contract` so the path team can read
 * it off the running app, and written out in full in ./CONTRACT.md.
 *
 * WHY IT IS SHAPED LIKE THIS. `bus.emit` in this application is synchronous and
 * returns the detail object it was handed (core/bus.js). So a request that must
 * come back with a DOM node does not need a promise, a second event or a
 * handshake: the caller emits, this module writes `payload.gate`, and the caller
 * reads it on the next line. If the key is still undefined, this module is not
 * mounted — which is a real state, because autodiscover will skip a piece whose
 * file is missing — and the caller falls back to whatever it did before.
 */
const CONTRACT = Object.freeze({
  version: 5,
  event: 'ask:disputeGate',
  /* v5, round 3. NOTHING A v1–v4 CALLER DOES CHANGES. What is new is a fourth
     standing check, and it closes the surface the historian found open: a
     CITATION whose printed author line contradicts its own check line. See
     `audits` below and CONTRACT.md §7a. */
  /* v4. TWO THINGS, BOTH ANSWERING ONE FINDING — that the four lines fire
     exactly once on the default route, on Lobengula, so the student meets a
     document made to PROTEST and never one made to JUSTIFY.
       1. `sourceForBeat(beatId)` / `pathSources()`, the same shape as
          `gateFor` / `pathGates`: two exercises are now nominated for named
          beats of the core route — Trevelyan at `compensation` and Salisbury
          at `egypt` — and both are documents made to justify. Ask at each
          beat, mount when the answer is not null.
       2. `withSource: true` on a gate request mounts that argument's own four
          lines inside the gate, before the commitment. Default off. The reply
          carries `source.costS`, computed in the path's own cost model, so the
          minute is the caller's to spend and not this module's to take. */
  /* v3. A SECOND THING A CALLER CAN MOUNT: the four lines the student writes
     about a document before this atlas prints its own. Identical shape to the
     gate — emit, read `payload.exercise`, mount the node, unlock on onCommit —
     because a path team should have to learn one contract, not two. The whole
     of it is in ./CONTRACT.md §9. */
  sourceEvent: 'ask:sourceLines',
  sources: Object.freeze({
    ask: 'window.BEA.historiography.sourceLines({ exerciseId?, disputeId?, beatId?, lede?, onReady, onCommit }) '
      + '— or emit "ask:sourceLines" with the same payload and read payload.exercise',
    all: 'window.BEA.historiography.sources() — [{ id, doc, dispute, title, kindWord, hardest, '
      + 'madeTo, contrastWith, after, costS, written, say }]',
    forBeat: 'window.BEA.historiography.sourceForBeat("<beatId>") — null when this beat has no '
      + 'exercise nominated; pass the id straight back as exerciseId',
    nominated: Object.freeze({
      compensation: 'src-trevelyan — T16, the official who ran Irish relief, on the greater evil',
      egypt: 'src-salisbury — T13, the man who signed the treaty, on drawing lines upon maps',
    }),
    inGate: 'window.BEA.historiography.gate({ disputeId, withSource: true }) — the same four lines '
      + 'inside the argument they belong to, before the commitment. Off by default.',
    cost: 'Every reply carries costS: reading at 180 words a minute over the exercise’s own prose, '
      + 'plus 45s a sentence for the four — the lesson path’s own cost model, computed not asserted.',
    contrast: 'Each exercise names a document in this atlas made to do the OPPOSITE thing '
      + '(madeTo / contrastWith), and prints the comparison under “what was it made to do?” once the '
      + 'student has committed. Lobengula, which the path already asks about, is the pair for '
      + 'Salisbury: same partition, a year apart, one made to protest and one to justify.',
    note: 'The lesson path already asks for these four lines once, on Lobengula’s 1889 letter, and '
      + 'the recall quiz asks for them once on Macaulay’s Minute. These SIX are the practice — six '
      + 'documents of six different kinds, each with what a strong answer notices and where a weak '
      + 'one stops. Mount one where the beat already has the document in front of the student. '
      + 'The number is productionCount(); do not copy it into your own prose.',
  }),
  /* v2, round 3. THREE arguments are nominated for the path, not one, because
     the path critic found that "the path never meets famine or the Scramble"
     while both arguments sat written and sourced in this file. A caller that
     wants one gate changes nothing: `defaultGate` is still the 1857 argument
     and does not move. A caller that wants to rotate asks `gateFor(beatId)` at
     each beat and mounts when the answer is not null. */
  gates: Object.freeze({
    ask: 'window.BEA.historiography.gateFor("<beatId>") — null when this beat has no argument',
    all: 'window.BEA.historiography.pathGates() — [{ id, after, spine, question, say, lede }]',
    default: 'window.BEA.historiography.defaultGate() — "the-1857-name", stable',
    nominated: Object.freeze({
      compensation: 'irish-famine-intent — T16, the famine and what to call it',
      nationalisation: 'the-1857-name — T9, the word for 1857 (the default)',
      egypt: 'the-scramble — T13, Berlin and why Africa was partitioned',
    }),
  }),
  /* THE STANDING CHECKS, NAMED SO A CRITIC CAN RUN THEM WITHOUT READING THE
     FILE. All four are the same defect class — a sentence about a record,
     printed without reading the record — and all four take an override so the
     guard can be proved against a known-bad input rather than observed empty. */
  audits: Object.freeze({
    own: 'window.BEA.historiography.auditOwn() — this module\'s own fields and own prose. []',
    all: 'window.BEA.historiography.audit() — that plus four cross-module checks, each finding '
      + 'carrying `piece`: the directory that must fix it (P16, P08, map, data).',
    attribution: 'window.BEA.historiography.auditAttribution(disputes?, texts?) — every citation '
      + 'this atlas prints with a check line, read against its own check line: an author the '
      + 'display drops, a check that names nobody above it, a page count that disagrees with the '
      + 'range, a badge year that is not the cited year. 82 citations, 0 findings.',
    attributionStats: 'window.BEA.historiography.attributionStats() — { citations, findings }',
    headlines: 'window.BEA.historiography.auditHeadlines() — every acquisition headline against '
      + 'its own counterparties',
    silences: 'window.BEA.historiography.auditSilences(map?) — every hole the plate draws against '
      + 'the shard sentence that warrants it',
    works: 'window.BEA.historiography.auditWorks(data?) — one book counted twice',
  }),
  request: Object.freeze({
    disputeId: 'string, optional — omit to get the argument this module has nominated for the path',
    lede: 'string, optional — one sentence printed under the question, in the caller’s voice',
    withSource: 'boolean, optional (v4) — mount this argument’s four-line source exercise inside '
      + 'the gate, before the commitment. Default false. Read reply.source.costS first.',
    onReady: 'function(gate), optional — called synchronously, before emit returns',
    onCommit: 'function(record), optional — called when the student commits; this is the unlock',
    onOpenFull: 'function(disputeId), optional — called instead of taking the sheet, if the student '
      + 'asks for the whole argument from inside a mounted gate',
  }),
  reply: Object.freeze({
    on: 'payload.gate, written synchronously; undefined means this module is not mounted',
    node: 'HTMLElement — mount it; do not style it and do not reach into it',
    committed: 'boolean — TRUE AT READY-TIME if this student has already judged this argument, '
      + 'here or in the dossier or in an earlier visit. A caller that locks a Next control must read '
      + 'it, or a student who has already done the work is locked out of a gate they have passed.',
    say: 'string — one line for the caller’s own status band',
    eyebrow: 'string · title: string — for the caller’s panel head',
    question: 'string · positions: [{ key, who, badge }] · after: the beat id this argument belongs beside',
    source: '(v4) { id, doc, title, madeTo, mounted, written, costS, words } — the four-line '
      + 'exercise that stands inside this argument, or null. `mounted` says whether withSource put '
      + 'it in the node you are holding.',
    focus: 'function() — put the caret on the question',
    release: 'function() — call when the surface goes away',
  }),
  events: Object.freeze({
    'hgx:gate': '{ phase: "ready" | "committed", disputeId, committed, question?, record? }',
    'hgx:judged': '{ disputeId, question, choice, label, why, at, ledgerKey } — every commitment, '
      + 'from any surface, not only from a gate',
  }),
  ledger: Object.freeze({
    kind: 'collapsed',
    claimId: 'hgx:<disputeId>',
    youSaid: '<the position’s short label> explains more — <the student’s own sentence>',
    note: 'written by judgement.js through the dossier’s own remember(); the Close reads it back',
    source: Object.freeze({
      kind: 'attributed  (or "declined", if the student asks for ours without writing theirs)',
      claimId: 'hgx:src:<exerciseId>',
      youSaid: 'what it is: … · who made it: … · what it was for: … · what it cannot tell you: …',
      note: 'written by produce.js straight onto the bus. It is NOT written into the dossier’s '
        + 'remember(): that list marks every kind it does not recognise against a right answer, and '
        + 'four sentences about a document do not have one.',
    }),
  }),
  rules: Object.freeze([
    'The verdict, what would settle it and the sources are NOT IN THE DOM until the student has '
      + 'chosen a position AND written at least 20 characters. Not hidden, not disabled: not rendered.',
    'Any position is accepted, including "neither on its own". There is no right answer and the '
      + 'panel says so.',
    'The gate never takes the sheet. The caller owns the surface.',
    'The argument chapters itself when the surface the caller mounted it in is too short to read '
      + 'it in — one thing to read per screen — and the caller does not have to know that. The band '
      + 'is MEASURED off the caller’s own scroller, not off the viewport width, so a gate mounted in '
      + 'a 129px lesson beat at 1440 is chaptered and one in a tall column is not. See ./CONTRACT.md §6.',
  ]),
});

/* =============================================== the headline audit ==========
 * ROUND 3'S DISQUALIFIER, made greppable.
 *
 * Nine dossiers headlined the conquest of Mysore, the Maratha confederacy, the
 * Lahore Durbar, Konbaung Burma, Nepal and Bhutan as "Handed over by another
 * European power at the end of a war", with the true counterparty named in
 * smaller type directly beneath. It was one string keyed to a mechanism tag,
 * and it was the second time this atlas had made exactly that mistake: the
 * same bug had already been found and fixed once, for
 * `annexation-of-existing-colony`, after it printed "taken from Europeans"
 * over Kenya's African counterparties.
 *
 * A string fixed twice is a class of defect, not a typo. So the class is now
 * checked. `acquisitionVerb()` is the one function that writes that headline,
 * and this walks every acquisition in the live dataset, asks it for the
 * sentence a reader would see, and reports any case where the sentence asserts
 * a party the record's own `counterparties[]` do not contain. It runs against
 * the data as loaded, not against a fixture, so a retag in a shard tomorrow is
 * caught by `BEA.historiography.audit()` today — which is the standing this
 * piece claims for itself in FEATURE_SPEC charge 13, applied to itself.
 *
 * Deliberately not a lint over source strings: the failure was never the
 * string, it was a sentence about a record printed without reading the record.
 */
const ASSERTS = [
  {
    re: /\bEuropean power\b|\bEuropeans\b/i,
    kind: 'european-power',
    say: 'the headline asserts a European counterparty',
  },
];

export function auditHeadlines(data) {
  const bad = [];
  if (!data || !Array.isArray(data.territories)) return bad;
  for (const t of data.territories) {
    for (const a of t.acquisitions || []) {
      let verb = '';
      try { verb = acquisitionVerb(a.mechanism, a); } catch (_) { continue; }
      const kinds = new Set((a.counterparties || []).map((c) => c && c.kind));
      for (const rule of ASSERTS) {
        if (!rule.re.test(verb) || kinds.has(rule.kind)) continue;
        bad.push({
          piece: 'data',
          id: t.id + '/' + (a.id || a.mechanism),
          problem: 'acquisition headline names a party the record does not: ' + rule.say,
          detail: verb + '  —  taken from: '
            + ((a.counterparties || []).map((c) => c.name).join('; ') || 'no counterparty recorded'),
        });
      }
    }
  }
  return bad;
}

/* ============================================================ parallel texts ==
 * FEATURE_SPEC §2 P16, test 5. Two texts of one treaty, side by side, at prose
 * size, in the rail — matched to print on print's own ground — plus the three
 * things a page cannot do: segment locking, a third column on demand, and the
 * afterlife coupling to the map (which is `atlasCan`, below).
 *
 * The columns are not written here. Each is `renderSource()` of a document
 * already in this atlas's corpus, and the locking is applied to the rendered
 * quotation afterwards, so the four provenance questions still stand above
 * every word and no second way of printing a quotation comes into existence.
 */
const PARALLEL = {
  /* ============================================ THE SECOND PARALLEL INSTANCE ==
   * FEATURE_SPEC charge 9 names three: Waitangi (below), "Berlin's effective
   * occupation clause against what was said to the chiefs whose land it
   * allocated", and the Hunter Commission against the Indian evidence. Only the
   * first was built, so the apparatus that answers the charge had one instance
   * and the charge's own second example sat unbuilt beside a dispute that
   * already carried the Berlin Act in its testimony list.
   *
   * IT IS NOT THE SAME EXERCISE AS WAITANGI, AND IT MUST NOT PRETEND TO BE.
   * Waitangi is one document in two languages, and the marked clauses are
   * translations of each other. These are two different documents, four years
   * and a continent apart, and saying otherwise would be this panel making
   * exactly the category error it exists to teach against. What is paired here
   * is not wording but FUNCTION: the sentence in each document where a
   * signature becomes a right. The gloss under each pair says so.
   *
   * The teaching is the dispute's own verdict, made visible: the conference
   * students are taught carved up Africa set procedural rules between
   * Europeans — by its own words, about the coasts — and the lines were drawn
   * afterwards, by other means, over people who were party to none of it.
   */
  berlin: {
    eyebrow: 'The rule, and a man it was applied to',
    note: 'Two documents, four years apart, and not two versions of one text. What is paired below '
      + 'is the sentence in each where a signature turns into a right. Press a marked phrase to '
      + 'light it wherever it appears.',
    columns: ['berlin-act-article-35-1885', 'lobengula-victoria-1889'],
    pagerLabel: 'the rule and the reply',
    wholesHead: 'And each document whole, with the four questions above it',
    wholesNote: 'A marked phrase lights wherever it appears, including in the other document.',
    shortNames: {
      'berlin-act-article-35-1885': 'the Berlin Act',
      'lobengula-victoria-1889': 'Lobengula to Victoria',
    },
    segments: [
      {
        seg: 'who-is-a-party',
        parts: {
          'berlin-act-article-35-1885': 'The Signatory Powers of the present Act recognise the obligation',
          'lobengula-victoria-1889': 'I put my hand to it.',
        },
        gloss: 'Both sentences are about signing. Fourteen powers signed at Berlin and none of them '
          + 'was African, and the obligation the article creates runs between those signatories — it '
          + 'is a promise the powers make to each other about how they will recognise each other’s '
          + 'claims. Lobengula signed too, in October 1888, and the document he signed was a mineral '
          + 'concession obtained for Cecil Rhodes. He is a party to that paper and to no other. The '
          + 'difference is not who signed; it is who the signing was addressed to.',
      },
      {
        seg: 'what-the-paper-did',
        parts: {
          'berlin-act-article-35-1885': 'the establishment of authority in the regions occupied by them',
          'lobengula-victoria-1889': 'the right to all the minerals of my country',
        },
        gloss: 'The Act requires authority to be established and says nothing whatever about how. In '
          + 'Matabeleland the answer was this concession: it became the legal basis for the British '
          + 'South Africa Company’s royal charter in 1889 and the charter became the occupation of '
          + 'Mashonaland in 1890. Lobengula wrote this letter in April 1889 to say the paper did not '
          + 'contain what he had been told it contained. The occupation went ahead. Note the limit in '
          + 'the Act’s own words, though: article 35 speaks of regions occupied “on the coasts of the '
          + 'African Continent”, and Bulawayo is a long way from any coast. The Berlin Act did not '
          + 'authorise this. It is the frame students are taught to explain the partition with, and '
          + 'the partition happened beside it.',
      },
    ],
  },

  waitangi: {
    eyebrow: 'The two texts, side by side',
    note: 'Article the first, in both texts of the same treaty, signed on the same day. The '
      + 'corresponding clauses are not on the same line and never will be, which is why they are '
      + 'set here one under the other. Press a marked clause to light it wherever it appears.',
    columns: ['waitangi-english-1840', 'waitangi-maori-1840'],
    /* seg: which phrases correspond. The English and the Māori of one clause. */
    segments: [
      {
        seg: 'sovereignty',
        parts: {
          'waitangi-english-1840': 'all the rights and powers of Sovereignty',
          'waitangi-maori-1840': 'te Kawanatanga katoa',
        },
        gloss: 'The English says sovereignty. The Māori says kāwanatanga — governorship, built on '
          + 'kāwana, a transliteration of “governor”. Article two of the same Māori text guarantees '
          + 'tino rangatiratanga, full chieftainship, over lands, villages and treasures. The stronger '
          + 'word was available to the translators: they had used rangatiratanga for “kingdom” in the '
          + 'Lord’s Prayer. It is not the word in article one.',
      },
      {
        seg: 'cede',
        parts: {
          'waitangi-english-1840': 'cede to Her Majesty the Queen of England absolutely and without reservation',
          'waitangi-maori-1840': 'ka tuku rawa atu ki te Kuini o Ingarani ake tonu atu',
        },
        gloss: 'Here the two texts agree: something is given up completely and for ever. The whole '
          + 'argument is about what the thing given up was.',
      },
    ],
    third: {
      label: 'Add Kawharu’s back-translation as a third column',
      src: {
        kind: 'monograph',
        author: 'Sir Hugh Kawharu',
        work: 'English translation of the Māori text of the Treaty of Waitangi, in Waitangi: Māori and Pākehā Perspectives of the Treaty of Waitangi',
        year: 1989,
        publisher: 'Oxford University Press',
        nature: 'A translation back into English of the Māori text the chiefs signed, made by a Ngāti '
          + 'Whātua anthropologist and professor, and printed in the standard scholarly collection on the treaty.',
        origin: 'Prepared for the 1989 volume Kawharu edited, at a point when the Waitangi Tribunal’s '
          + 'jurisdiction had just been extended back to 1840 and the courts had begun to be asked what '
          + 'the Māori text meant.',
        purpose: 'To let an English reader see what the signed text says, rather than what the English '
          + 'draft says — the two being the substance of the dispute. It is widely reproduced by New '
          + 'Zealand government bodies for exactly that reason.',
        cannotTell: 'What the signatories understood. A careful translation of a document is still a '
          + 'translation of a document; it is not a record of what was said at Waitangi on 5 February '
          + '1840 or of what the rangatira took themselves to be agreeing to.',
        quote: 'The Chiefs of the Confederation and all the Chiefs who have not joined that Confederation '
          + 'give absolutely to the Queen of England for ever the complete government over their land.',
        speaker: 'Sir Hugh Kawharu’s translation of Ko te tuatahi, the first article of the Māori text, 1989',
        supports: 'What the text the chiefs signed says in English, as against what the English draft says.',
        check: 'I. H. Kawharu (ed.), Waitangi: Māori and Pākehā Perspectives of the Treaty of Waitangi '
          + '(Auckland: Oxford University Press, 1989); the translation is also printed by the Waitangi '
          + 'Tribunal and by Archives New Zealand.',
      },
      segments: { sovereignty: 'the complete government over their land' },
    },
  },
};

/**
 * ONE MARKED CLAUSE.
 *
 * A span, not a button, and the reason is typographic. `<button>` in Blink and
 * WebKit lays its content out in a block box whatever `display` is computed to,
 * so a marked clause longer than the line it starts on began on a line of its
 * own — which left the paragraph's opening quotation mark stranded above it and
 * the closing one stranded below, on every clause that wrapped, at every rail
 * width. Measured at 900x700: “ / all the rights and powers of / Sovereignty /
 * ”. The previous fix set `display: inline` in the stylesheet and did nothing,
 * because the element, not the declaration, is what forces it.
 *
 * A span with role and tabindex is genuinely inline, so the quotation marks
 * close around the clause the way they do in the printed treaty. The keyboard
 * contract a button gives free is restored explicitly below: Enter and Space
 * both activate, and Space does not scroll the sheet.
 */
function segEl(seg, text, title) {
  return el('span.hgx-seg', {
    role: 'button', tabindex: '0',
    dataset: { hgx: 'seg', seg }, 'aria-pressed': 'false', title,
  }, text);
}

/**
 * Wrap the marked clauses inside an already-rendered quotation, so each can be
 * lit against its counterpart in the other column. Every phrase is placed in
 * ONE pass over the original text: marking them one at a time re-read the
 * paragraph after the first rewrite and silently deleted the mark before it,
 * which is why article one had one linked clause instead of two.
 */
function markPhrases(node, pairs) {
  const p = node.querySelector('.src__quote p');
  if (!p) return 0;
  const text = p.textContent || '';
  const hits = [];
  for (const { phrase, seg } of pairs) {
    if (!phrase) continue;
    const i = text.indexOf(phrase);
    if (i < 0) continue;
    hits.push({ i, end: i + phrase.length, phrase, seg });
  }
  if (!hits.length) return 0;
  hits.sort((a, b) => a.i - b.i);
  const kept = [];
  let cursor = 0;
  for (const h of hits) {
    if (h.i < cursor) continue;              /* overlapping marks: keep the first */
    kept.push(h);
    cursor = h.end;
  }
  p.replaceChildren();
  let at = 0;
  for (const h of kept) {
    if (h.i > at) p.append(document.createTextNode(text.slice(at, h.i)));
    p.append(segEl(h.seg, h.phrase, 'Light this clause wherever it appears'));
    at = h.end;
  }
  if (at < text.length) p.append(document.createTextNode(text.slice(at)));
  return kept.length;
}

/**
 * TWO CHAPTERS, NOT ONE BLOCK.
 *
 * Returns `[{ key, label, node }, …]`. The paired clauses and the whole texts
 * are two different exercises — compare these six words; now read the document
 * they sit in — and at 390x844 the two together measured 2,847px against a
 * 145px reading window. Above 62rem they are printed one after the other and
 * nothing about this is visible; below it they are two stops on the pager.
 */
function parallelBlock(d, state) {
  const spec = PARALLEL[d.parallelTexts];
  if (!spec) return null;
  const box = el('section.cx-panel.cx-panel--plain.hgx-par');
  box.append(el('h3.cx-panel__head.hgx__eyebrow.sc', { text: spec.eyebrow }));
  box.append(el('p.cx-note.hgx-par__note', { text: spec.note }));

  /* 1. THE CLAUSES, PAIRED.
     Two columns of running text is print's way of holding two versions of one
     sentence in the eye at once, and the rail is 279–432px wide at every
     viewport this atlas is built for: at that measure a two-up serif column is
     twenty-four characters wide and teaches nothing. So the pairing is made
     structural instead of spatial — each disputed clause is printed with its
     counterpart directly beneath it and the word history under both — and the
     full texts follow, whole, with the same clauses linked. */
  const pairs = el('div.hgx-par__pairs');
  for (const seg of spec.segments) {
    const row = el('section.cx-panel.hgx-pair', { dataset: { seg: seg.seg } });
    for (const id of spec.columns) {
      const t = TXT.get(id);
      const phrase = seg.parts[id];
      if (!t || !phrase) continue;
      row.append(el('p.hgx-pair__k.sc', { text: t.work }));
      row.append(el('p.hgx-pair__t', {},
        segEl(seg.seg, phrase, 'Light this clause wherever it appears below')));
    }
    if (seg.gloss) row.append(el('p.cx-note.hgx-pair__g', { text: seg.gloss }));
    pairs.append(row);
  }
  box.append(pairs);

  /* 2. THE TEXTS, WHOLE, each through renderSource so the four questions stand
        above the words. Side by side where the surface is wide enough for it,
        measured on this block and not on the window. */
  /* ONE TEXT PER CHAPTER. Measured at 390x844, both texts in one chapter came to
     2,325px against a 145px reading window — sixteen screens behind one pager
     stop. Nothing is lost by splitting them: the rail is 279–432px wide at every
     viewport this atlas is built for, so `.hgx-par__cols`'s 46rem container
     query has never once fired and the two texts have never once stood side by
     side. And the clause locking survives the split, because it is a DOM state
     rather than a re-render: light a clause here, page to the other text, and it
     is still lit there. */
  const wholes = [];
  const ids = [...spec.columns];
  const third = state.third && spec.third ? spec.third : null;
  let lockable = 0;
  let first = true;
  const shortName = (t) => (spec.shortNames && spec.shortNames[t.id]) || String(t.work || '').split(',')[0].trim();
  for (const id of ids) {
    const t = TXT.get(id);
    if (!t) continue;
    const sec = el('section.cx-panel.cx-panel--plain.hgx-par');
    if (first) {
      sec.append(el('h3.cx-panel__head.hgx__eyebrow.sc', {
        text: spec.wholesHead || 'And the whole of article one, in each text',
      }));
      sec.append(el('p.cx-note', {
        text: spec.wholesNote
          || 'Each with the four questions answered above it. A marked clause lights its counterpart '
          + 'wherever it appears, including in the other text.',
      }));
      first = false;
    }
    const fig = renderSource(t);
    lockable += markPhrases(fig, spec.segments.map((sg) => ({ phrase: sg.parts[id], seg: sg.seg })));
    sec.append(fig);
    wholes.push({ key: 'parallel-' + id, label: shortName(t), node: sec });
  }
  if (third) {
    const sec = el('section.cx-panel.cx-panel--plain.hgx-par');
    const fig = renderSource(third.src);
    markPhrases(fig, Object.entries(third.segments || {}).map(([seg, phrase]) => ({ phrase, seg })));
    sec.append(fig);
    wholes.push({ key: 'parallel-third', label: 'the back-translation', node: sec });
  }
  const last = wholes[wholes.length - 1];
  if (last && spec.third) {
    last.node.append(el('button.cx-more', {
      type: 'button', dataset: { hgx: 'third', dispute: d.id }, 'aria-expanded': third ? 'true' : 'false',
    }, el('span', { text: third ? 'Put the back-translation away' : spec.third.label })));
  }
  if (last && !lockable) {
    last.node.append(el('p.cx-note.cx-note--warn', {
      text: 'The phrases this atlas marks are not in the texts as transcribed here, so the linking between '
        + 'them is off. The texts are printed whole; read them against each other yourself.',
    }));
  }
  return [{ key: 'parallel', label: spec.pagerLabel || 'the two texts', node: box }, ...wholes];
}

/* ================================================================= module === */

export default {
  id: 'panels-historiography',
  slot: 'overlay',
  requires: ['data'],

  async mount(ctx) {
    await loadCss(new URL('../../../css/historiography.css', import.meta.url));
    this.ctx = ctx;
    this.d = disposer();
    /* Per-dispute working state: what has been picked, what has been typed,
       whether the lens is on, whether the third column is up. Session only;
       nothing here is written to storage — the metrics schema is not ours. */
    this.work = new Map();
    this.openId = null;      /* the dispute standing in the sheet, if it is ours */
    this.atlasStep = new Map();

    /* `main.js` REPLACES window.BEA wholesale at app:ready, after every module
       has mounted, so a handle published during mount() is thrown away. Publish
       again on the next task, which is after that assignment. */
    this._publish();

    /* WHAT THIS STUDENT ALREADY SAID, from before the reload. The Ledger is
       loaded dynamically and inside a try: this panel works without it, and a
       piece that cannot reach another piece's record must degrade to asking
       the question again rather than to throwing. */
    import('../../close/ledger.js')
      .then((mod) => {
        const led = mod.getLedger(ctx.bus);
        const n = rehydrate(led) + rehydrateLines(led);
        if (n) this._inject({ root: document.querySelector('[data-mount="dossier"]') });
      })
      .catch(() => {});

    this.d(ctx.bus.on('app:ready', () => {
      const t = setTimeout(() => this._publish(), 0);
      this.d(() => clearTimeout(t));
    }));

    /* --- the card in the dossier ------------------------------------------
       The dossier prints an empty anchor for us and tells us when it has
       re-rendered. Both are fail-safe: with this module absent the anchor
       stays empty and the event has no subscriber. */
    this.d(ctx.bus.on('dossier:rendered', (m) => this._inject(m)));
    this._inject({ root: document.querySelector('[data-mount="dossier"]') });

    /* --- one delegated listener, for both surfaces ------------------------
       Our controls stand in the dossier column AND in the shell's sheet, which
       is outside any root we own, so the listener is on the document and keyed
       to our own attribute. It never sees another piece's controls. */
    this.d(on(document, 'click', '[data-hgx]', (ev, hit) => this._onClick(ev, hit)));
    this.d(on(document, 'input', 'textarea[data-hgx="why"]', (ev, hit) => this._onType(hit)));
    /* The four boxes of the source exercise. Kept out of `_onType` because a
       judgement has one sentence and this has four, and because the counter and
       the button under them are updated in place rather than re-rendered — a
       re-render here would take the caret out of whichever of the four the
       student is in the middle of. */
    this.d(on(document, 'input', 'textarea[data-hgx="srcfield"]', (ev, hit) => this._onSrcType(hit)));
    /* The marked clauses are spans (see segEl), so Enter and Space are ours to
       honour. Space is prevented as well as handled: on a focused span it would
       otherwise page the sheet away from the text being read. */
    this.d(on(document, 'keydown', '[data-hgx="seg"]', (ev, hit) => {
      if (ev.key !== 'Enter' && ev.key !== ' ' && ev.key !== 'Spacebar') return;
      ev.preventDefault();
      this._light(hit);
    }));

    /* --- THE GATE THE LESSON PATH MOUNTS -----------------------------------
       See ./CONTRACT.md. One request, answered synchronously, because the bus
       returns the detail object it was given and `emit` runs its handlers before
       it returns: a caller emits, then reads `payload.gate`, and if the key is
       still undefined this module is not present and the caller falls back.
       Nothing here reaches into the caller's DOM and nothing here takes the
       sheet: the caller owns the surface and mounts `gate.node` into it. */
    this.gates = new Map();      /* disputeId -> the live gate record */
    this.d(ctx.bus.on('ask:disputeGate', (p) => this._mountGate(p)));

    /* --- THE OTHER THING A CALLER CAN MOUNT: THE FOUR LINES ----------------
       Same shape, same synchronous reply, same ownership rules. CONTRACT §9. */
    this.srcMounts = new Map();  /* exerciseId -> the live exercise record */
    this.d(ctx.bus.on('ask:sourceLines', (p) => this._mountSource(p)));

    /* The band can change under an argument that is already open — a rotation,
       a resize, a rail that opens. `paginate()` is re-run rather than the panel
       re-rendered, so a half-typed sentence and the caret in it both survive. */
    this.d(ctx.bus.on('chrome:layout', () => this._relayout()));

    /* Somebody else took the sheet: ours is no longer on screen. */
    this.d(ctx.bus.on('chrome:sheet', (m) => {
      if (!m) return;
      const mine = !!m.id && String(m.id).startsWith('hgx:');
      if (!m.open || !mine) this.openId = null;
    }));

    /* --- the route --------------------------------------------------------
       `#panel=historiography` opens the index of every argument in the atlas,
       so a teacher can set one the way they set a page number. */
    const want = (s) => ((s.panelState && s.panelState.overlay) === 'historiography');
    this.d(ctx.store.watch(want, (on2) => { if (on2) this._openIndex(); }));
    if (want(ctx.store.getState())) this._openIndex();
  },

  /**
   * A panel is about one argument, and most arguments are about particular
   * places. When the reader selects somewhere this argument does not cover,
   * the surface standing over the dossier is about the place they have just
   * left, so it comes down rather than silently re-pointing. Selecting another
   * place the SAME argument covers — Jamaica while the abolition argument is
   * open — leaves it up, because that is the argument still being read.
   */
  update(state, prev, changed) {
    if (!changed || !changed.has('selectedTerritoryId')) return;
    if (!this.openId || this.openId === 'index') return;
    const d = disputeById(this.openId);
    const sel = state.selectedTerritoryId;
    if (!d) return;
    if (sel && (d.territories || []).includes(sel)) return;
    this.openId = null;
    this.ctx.bus.emit('ask:sheet', null);
  },

  destroy() {
    if (this.openId && this.ctx) { try { this.ctx.bus.emit('ask:sheet', null); } catch (_) {} }
    if (this.d) this.d();
    if (typeof window !== 'undefined' && window.BEA) delete window.BEA.historiography;
  },

  /* ------------------------------------------------------------- publish --
   * Charge 13: a head of department must be able to audit this without a
   * debugger. `BEA.historiography.audit()` returns every missing field, every
   * territory id this piece names that the dataset does not hold, and every
   * banned string from DIDACTIC_SPEC §7.1 found in our own voice.
   */
  _publish() {
    if (typeof window === 'undefined') return;
    window.BEA = window.BEA || {};
    window.BEA.historiography = {
      disputes: DISPUTES,
      stats,
      /* EVERY STANDING CHECK, IN ONE CALL. The last three are not about this
         module's own fields: they are the three places where one authored
         sentence is printed over records nobody re-read, which is the defect
         class that has now cost this atlas a disqualifying score twice. A
         finding carries `piece`, naming the directory that must fix it. See
         ./standing.js. */
      audit: () => [
        ...audit(this.ctx && this.ctx.data).map((f) => ({ piece: 'P16', ...f })),
        ...this._auditVoice().map((f) => ({ piece: 'P16', ...f })),
        ...auditAttribution(DISPUTES, TESTIMONY),
        ...auditHeadlines(this.ctx && this.ctx.data),
        ...auditSilences(typeof window !== 'undefined' ? window.__map : null),
        ...auditWorks(this.ctx && this.ctx.data),
      ],
      /* This module's own findings, for a caller that wants to know whether
         P16 is clean without being told about the plate or the shards. */
      auditOwn: () => [
        ...audit(this.ctx && this.ctx.data).map((f) => ({ piece: 'P16', ...f })),
        ...this._auditVoice().map((f) => ({ piece: 'P16', ...f })),
        ...auditProductions().map((f) => ({ piece: 'P16', ...f })),
        ...auditAttribution(DISPUTES, TESTIMONY).filter((f) => f.piece === 'P16'),
      ],
      /* Takes an override so the guard can be tested against a corpus with a
         known hole rather than merely observed returning [] against a clean
         one — see accept.scenario.js. */
      auditProductions: (texts) => auditProductions(texts),
      auditHeadlines: () => auditHeadlines(this.ctx && this.ctx.data),
      /* Takes an override so the guard itself can be tested against a known
         set — see accept.scenario.js. Omit it and it reads the live plate. */
      auditSilences: (m) => auditSilences(m === undefined
        ? (typeof window !== 'undefined' ? window.__map : null) : m),
      auditWorks: (d) => auditWorks(d === undefined ? (this.ctx && this.ctx.data) : d),
      /* THE FOURTH SURFACE OF THE GLOSS CLASS: a citation whose author line
         and check line disagree about who wrote the book. Takes overrides so
         the rule can be run against a fixture with a known defect rather than
         merely observed returning [] — see accept.scenario.js. */
      auditAttribution: (ds, tx) => auditAttribution(ds === undefined ? DISPUTES : ds,
        tx === undefined ? TESTIMONY : tx),
      attributionStats: () => attributionStats(DISPUTES, TESTIMONY),
      workStats: () => workStats(this.ctx && this.ctx.data),
      judgements,
      open: (id) => this._open(id),
      index: () => this._openIndex(),
      /* THE GATE, for a caller that would rather hold a function than emit an
         event. Identical behaviour; the bus route is the documented one. */
      gate: (opts) => this._mountGate({ ...(opts || {}) }),
      pathGates: () => pathGates().map((d) => ({
        id: d.id, after: d.pathGate.after, spine: d.pathGate.spine || d.spine,
        question: d.question, say: d.pathGate.say, lede: d.pathGate.lede,
      })),
      /* The whole API a rotating path needs: ask at every beat, mount when the
         answer is not null, pass the id straight back as `disputeId`. */
      gateFor: (beatId) => {
        const d = gateFor(beatId);
        return d ? {
          id: d.id, after: d.pathGate.after, spine: d.pathGate.spine || d.spine,
          question: d.question, say: d.pathGate.say, lede: d.pathGate.lede,
        } : null;
      },
      defaultGate: () => defaultGate().id,
      /* ---- the four lines the student writes (CONTRACT §9) --------------- */
      sources: () => PRODUCTIONS.map((ex) => ({
        id: ex.id, doc: ex.doc, dispute: ex.dispute, title: ex.title,
        kindWord: ex.kindWord, hardest: ex.hardest,
        madeTo: ex.madeTo, contrastWith: ex.contrastWith,
        after: (ex.pathBeat && ex.pathBeat.after) || null,
        costS: (costOf(ex) || {}).costS,
        written: !!linesFor(ex.id),
        say: 'Four questions about one document. You write them; then this atlas prints its own.',
      })),
      /* The whole API a path needs to put a SECOND four-liner on the route:
         ask at every beat, mount when the answer is not null, pass the id back
         as `exerciseId`. Same shape as `gateFor`. CONTRACT.md §9.1. */
      pathSources: () => pathSources().map((ex) => ({
        id: ex.id, doc: ex.doc, dispute: ex.dispute, title: ex.title, madeTo: ex.madeTo,
        after: ex.pathBeat.after, spine: ex.pathBeat.spine || null,
        costS: (costOf(ex) || {}).costS,
      })),
      sourceForBeat: (beatId) => {
        const ex = productionForBeat(beatId);
        if (!ex) return null;
        const c = costOf(ex) || {};
        return { id: ex.id, doc: ex.doc, dispute: ex.dispute, title: ex.title, madeTo: ex.madeTo,
          after: ex.pathBeat.after, spine: ex.pathBeat.spine || null,
          hardest: ex.hardest, costS: c.costS, words: c.words, written: !!linesFor(ex.id) };
      },
      sourceCost: (id) => costOf(productionById(id)),
      sourceFor: (disputeId) => {
        const ex = productionFor(disputeId);
        return ex ? { id: ex.id, doc: ex.doc, dispute: ex.dispute, title: ex.title, hardest: ex.hardest } : null;
      },
      sourceLines: (opts) => this._mountSource({ ...(opts || {}) }),
      openSource: (id) => this._openSource(id),
      produceStats: () => produceStats(),
      /* DIDACTIC_SPEC §4, keyed the way the quiz bank keys it. */
      disputesAbout: (mis) => disputesAbout(mis).map((d) => ({ id: d.id, question: d.question })),
      /* What the band decided, and off what — so a caller can see why its gate
         is chaptered without reading this module's source. */
      band: () => [...document.querySelectorAll('.hgx')].map((root) => {
        const win = readingWindow(root);
        return {
          dispute: root.dataset.dispute || null,
          surface: win ? (win.className || win.tagName).split(' ')[0] : 'viewport',
          window: win ? win.clientHeight : null,
          argument: naturalHeight(root),
          chaptered: !root.querySelector('.hgx-pager') || !root.querySelector('.hgx-pager').hidden,
          floor: BAND.WIN_FLOOR, screens: BAND.SCREENS,
        };
      }),
      contract: CONTRACT,
    };
  },

  /**
   * Render every argument off-screen, in both halves, and read the words back.
   * This is the check that would have caught "both sides" in this module's own
   * prose, which `audit()` could not see because it lives in the renderer and
   * not in the data. Quotations are skipped: §7.1 governs our voice.
   */
  _auditVoice() {
    const out = [];
    if (typeof document === 'undefined') return out;
    for (const d of DISPUTES) {
      const st = { pick: null, why: '', lens: true, third: true, step: 0 };
      try {
        out.push(...auditVoice(renderFull(d, st, { ...this.ctx, parallel: (dd, ss) => parallelBlock(dd, ss) })));
      } catch (err) { out.push({ id: d.id, problem: 'argument failed to render', detail: String(err && err.message) }); }
    }
    try {
      out.push(...auditVoice(renderIndex(DISPUTES, this.ctx)));
      const first = DISPUTES[0];
      out.push(...auditVoice(renderCard([first], this.ctx)));
    } catch (err) { out.push({ id: 'index', problem: 'index failed to render', detail: String(err && err.message) }); }
    return out;
  },

  /* --------------------------------------------------------- the dossier -- */
  _inject(m) {
    const root = (m && m.root) || document.querySelector('[data-mount="dossier"]');
    if (!root) return;
    const slot = root.querySelector('[data-slot="historiography"]');
    if (!slot) return;
    const id = (m && m.territoryId)
      || (this.ctx.store.getState().selectedTerritoryId) || null;
    const list = id ? disputesFor(id) : [];
    /* A RESTING STATE, NOT A HIDDEN ONE.
       Sixty-four of this atlas's 260 entries carry an argument. For the other
       196 this slot printed nothing at all, and since the only other route in
       is a deep link, a student who never happened to select Kenya, Jamaica or
       New Zealand could finish the lesson without learning that the app holds
       fourteen arguments between named historians. That is the same defect the
       round-3 verdict names against Recall — a surface that cannot be
       discovered by a reader who does not already know it is there.
       So the slot is never empty: where no argument covers this place it says
       so, in one line, and prints the way through to all of them. It says
       "none of them is about here" rather than implying there is nothing to
       argue about, which would be the more comfortable lie. */
    if (!list.length) {
      const t = id && this.ctx.data.get ? this.ctx.data.get(id) : null;
      const rest = el('section.cx-panel.cx-panel--plain.hgx-card.hgx-card--rest',
        { dataset: { block: 'disagree' } });
      rest.append(el('h3.cx-panel__head.hgx__eyebrow.sc', { text: 'Where historians disagree' }));
      rest.append(el('p.cx-note.hgx-card__say', {
        text: 'This atlas holds ' + stats().disputes + ' arguments open between named historians — each '
          + 'one with the evidence each position reads and the thing each has to explain away. None of them '
          + 'is about ' + (t && t.name ? t.name : 'this place') + '. They cover '
          + stats().places + ' other entries.',
      }));
      rest.append(renderIndexLink(stats().disputes));
      slot.replaceChildren(rest);
      return;
    }
    const card = renderCard(list, this.ctx);
    slot.replaceChildren(card || document.createComment('none'));
  },

  /* =============================================================== the gate ==
   * `bus.emit('ask:disputeGate', payload)` — the whole contract is in
   * ./CONTRACT.md and the shape is asserted by `BEA.historiography.contract`.
   *
   * The caller says which argument (or says nothing and gets the one this
   * module has nominated for the path), gives two callbacks, and receives a
   * node. It mounts the node wherever it likes. It may not style it, may not
   * reach into it, and does not need to: everything the student has to do
   * happens inside the node and this module answers every click in it, because
   * the delegated listener is on the document and keyed to our own attribute.
   *
   * `committed` is true at ready-time when this student has already judged this
   * argument — from the dossier, from the index, or in an earlier visit through
   * the Ledger. A caller that locks its Next control must read it, or a student
   * who has already done the work is locked out of a gate they have passed.
   */
  _mountGate(p) {
    if (!p || typeof p !== 'object') return;
    const d = (p.disputeId && disputeById(p.disputeId)) || defaultGate();
    if (!d) return;
    const st = this._state(d.id);
    st.step = 0;
    /* v4: the caller may ask for the four lines INSIDE the gate. Default off,
       exactly as before, because it is the caller's minute that pays for it. */
    const withSource = !!p.withSource;
    const node = renderGate(d, st, { ...this.ctx }, { lede: p.lede, withSource });
    const rec = {
      id: 'hgx:gate:' + d.id,
      disputeId: d.id,
      question: d.question,
      say: (d.pathGate && d.pathGate.say)
        || 'An argument between historians. Choose a side and say why before going on.',
      eyebrow: 'historians disagree',
      title: 'Before you go on',
      positions: (d.positions || []).map((q) => ({ key: q.key, who: q.who, badge: q.badge })),
      after: (d.pathGate && d.pathGate.after) || null,
      lede: p.lede || null,
      withSource,
      /* WHAT ELSE IS AVAILABLE HERE, AND WHAT IT COSTS. A gate whose argument
         carries a source exercise says so on the reply, with the cost in
         seconds computed in the path's own model — so a caller can mount it
         with `withSource: true` on a beat that has the minute, and not on one
         that does not. Null where the argument has no exercise. */
      source: (() => {
        const ex = productionFor(d.id);
        if (!ex) return null;
        const c = costOf(ex);
        return { id: ex.id, doc: ex.doc, title: ex.title, madeTo: ex.madeTo,
          mounted: withSource, written: !!linesFor(ex.id), costS: c && c.costS, words: c && c.words };
      })(),
      node,
      committed: !!judgementFor(d.id),
      judgement: judgementFor(d.id),
      onCommit: typeof p.onCommit === 'function' ? p.onCommit : null,
      onOpenFull: typeof p.onOpenFull === 'function' ? p.onOpenFull : null,
      focus: () => {
        const n = node.querySelector('.hgx__q') || node;
        n.setAttribute('tabindex', '-1');
        try { n.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ }
      },
      release: () => { this.gates.delete(d.id); },
    };
    this.gates.set(d.id, rec);
    /* Chapter it for the band it is being mounted into. The caller has not put
       the node in the document yet, so this runs again on the next frame, when
       the measurement that decides the band is real. */
    this._page(node, d.id, 0);
    requestAnimationFrame(() => this._page(node, d.id));
    p.gate = rec;
    if (typeof p.onReady === 'function') { try { p.onReady(rec); } catch (_) { /* the caller's problem */ } }
    this.ctx.bus.emit('hgx:gate', {
      phase: 'ready', disputeId: d.id, committed: rec.committed, question: d.question,
    });
    return rec;
  },

  /**
   * REDRAW ONE ARGUMENT, ON WHOSEVER SURFACE IT IS STANDING.
   *
   * Every control in this panel that changes what is rendered — the commitment,
   * the evidence lens, the third column — used to answer by re-opening the rail
   * sheet. Inside a mounted gate that is wrong twice over: it takes a surface
   * the caller owns, and it throws away the node the caller is holding. So a
   * gate is redrawn where it stands, by replacing its own root in place, and the
   * caller never learns that anything happened except through `onCommit`.
   */
  _repaint(id, opts = {}) {
    const g = this.gates.get(id);
    if (!g || !g.node || !g.node.isConnected) return this._open(id, opts);
    const d = disputeById(id);
    const st = this._state(id);
    if (opts.step != null) st.step = opts.step;
    const fresh = renderGate(d, st, { ...this.ctx }, { lede: g.lede, withSource: !!g.withSource });
    g.node.replaceWith(fresh);
    g.node = fresh;
    this._page(fresh, id);
    requestAnimationFrame(() => this._page(fresh, id));
    return true;
  },

  /* ====================================================== THE FOUR LINES ====
   * `bus.emit('ask:sourceLines', payload)` — CONTRACT.md §9, and deliberately
   * the same shape as the gate above, down to the synchronous reply, so a path
   * team learns one contract and not two. The caller says which exercise (or
   * names a beat's argument and gets the one that stands inside it), gives two
   * callbacks and receives a node. It mounts the node wherever it likes.
   *
   * `committed` is true at ready-time when this student has already written
   * about this document — in the rail, in an argument, or in an earlier visit
   * through the Ledger — and a caller that locks a Next control must read it,
   * for the same reason the gate's does.
   */
  _mountSource(p) {
    if (!p || typeof p !== 'object') return;
    /* `beatId` used to be handed to `productionFor()`, which keys by ARGUMENT
       id — so a caller naming a beat matched nothing, fell through the chain
       and was given the first exercise in the file. A wrong document printed
       silently is worse than a null, and the beat index now exists. */
    const ex = (p.exerciseId && productionById(p.exerciseId))
      || (p.disputeId && productionFor(p.disputeId))
      || (p.beatId && productionForBeat(p.beatId))
      || (p.beatId ? null : PRODUCTIONS[0]);
    if (!ex) return;
    const node = this._srcNode(ex, { lede: p.lede });
    const rec = {
      id: 'hgx:src:' + ex.id,
      exerciseId: ex.id,
      disputeId: ex.dispute,
      doc: ex.doc,
      title: ex.title,
      kindWord: ex.kindWord,
      hardest: ex.hardest,
      eyebrow: 'you write the four lines first',
      say: 'Four questions about one document. You answer them; then this atlas prints its own '
        + 'four beside yours.',
      fields: SRC_FIELDS.map((f) => ({ key: f.key, label: f.label })),
      min: MIN_FIELD,
      lede: p.lede || null,
      node,
      committed: !!linesFor(ex.id),
      lines: linesFor(ex.id),
      onCommit: typeof p.onCommit === 'function' ? p.onCommit : null,
      onOpenFull: typeof p.onOpenFull === 'function' ? p.onOpenFull : null,
      focus: () => {
        const n = node.querySelector('.hgx-src__quote') || node;
        n.setAttribute('tabindex', '-1');
        try { n.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ }
      },
      release: () => { this.srcMounts.delete(ex.id); },
    };
    this.srcMounts.set(ex.id, rec);
    this._page(node, 'src:' + ex.id, 0);
    requestAnimationFrame(() => this._page(node, 'src:' + ex.id));
    p.exercise = rec;
    if (typeof p.onReady === 'function') { try { p.onReady(rec); } catch (_) { /* the caller's problem */ } }
    this.ctx.bus.emit('hgx:source', {
      phase: 'ready', exerciseId: ex.id, doc: ex.doc, committed: rec.committed,
    });
    return rec;
  },

  /** One exercise, assembled into a root of its own with the module's own
   *  chapters, pager and fade — so the band treats it exactly like an
   *  argument, wherever it is standing. */
  _srcNode(ex, opts = {}) {
    const { root, chapters } = renderProduce(ex, {}, { ...this.ctx }, opts);
    return assemble(root, chapters);
  },

  /** Redraw one exercise where it stands: in a caller's beat, or in our sheet. */
  _repaintSource(ex) {
    const key = 'src:' + ex.id;
    const rec = this.srcMounts.get(ex.id);
    if (rec && rec.node && rec.node.isConnected) {
      const fresh = this._srcNode(ex, { lede: rec.lede });
      rec.node.replaceWith(fresh);
      rec.node = fresh;
      this._page(fresh, key, 0);
      requestAnimationFrame(() => this._page(fresh, key, 0));
      return true;
    }
    const standing = document.querySelector('.hgx--src[data-src="' + ex.id + '"]');
    if (standing) {
      /* A repaint must not put back an eyebrow the sheet head is already
         printing: the node has to be rebuilt for the surface it is standing
         in, not for the surface it was first built for. */
      const fresh = this._srcNode(ex, { sheet: !!standing.closest('.cx-sheet__body') });
      standing.replaceWith(fresh);
      this._page(fresh, key, 0);
      requestAnimationFrame(() => this._page(fresh, key, 0));
      return true;
    }
    /* It is a set of chapters inside an argument: that argument is redrawn. */
    return this._repaintDispute(ex.dispute);
  },

  /** The argument this exercise stands inside, wherever IT is standing. */
  _repaintDispute(id) {
    const g = this.gates.get(id);
    if (g && g.node && g.node.isConnected) return this._repaint(id);
    if (this.openId === id) return this._open(id, { keepScroll: true, quiet: true });
    return false;
  },

  /** Open one exercise on its own, in the rail sheet. The route a reader takes
   *  from the index — a deep link is not a route a student can find. */
  _openSource(id) {
    const ex = productionById(id);
    if (!ex) return false;
    const node = this._srcNode(ex, { sheet: true });
    this.openId = 'src:' + ex.id;
    this.ctx.bus.emit('ask:sheet', {
      id: 'hgx:src:' + ex.id,
      eyebrow: 'you write these four',
      title: ex.title,
      node,
    });
    this._page(node, 'src:' + ex.id, 0);
    requestAnimationFrame(() => this._page(node, 'src:' + ex.id));
    this._land('.hgx-src__quote', 'The document, and the four questions you write about it before '
      + 'this atlas prints its own.');
    return true;
  },

  /** The four boxes: count, button and warning updated in place. */
  _onSrcType(ta) {
    const ex = productionById(ta.dataset.ex);
    if (!ex) return;
    noteTyping(ex.id, ta.dataset.field, ta.value);
    this._srcGate(ta.closest('.hgx') || document, ex);
  },

  /** The counter stands on all five of the exercise's screens and the button on
   *  the last, so both are updated across the whole root — never re-rendered,
   *  because a re-render takes the caret out of the box being typed in. */
  _srcGate(root, ex) {
    const said = typingFor(ex.id);
    const done = SRC_FIELDS.filter((f) => String(said[f.key] || '').trim().length >= MIN_FIELD).length;
    const line = done >= SRC_FIELDS.length
      ? 'All four written. Ours are one press away, and they are not a mark scheme.'
      : done + ' of ' + SRC_FIELDS.length + ' written. Nothing here is scored; a sentence each is enough.';
    for (const c of root.querySelectorAll('.hgx-src__count[data-ex="' + ex.id + '"]')) c.textContent = line;
    for (const go of root.querySelectorAll('.hgx-src__go[data-ex="' + ex.id + '"]')) go.disabled = done < SRC_FIELDS.length;
  },

  /** A student committed their four lines. Tell whoever is holding this one. */
  _afterSrcCommit(ex, entry) {
    const rec = this.srcMounts.get(ex.id);
    const record = {
      exerciseId: ex.id, doc: ex.doc, disputeId: ex.dispute,
      declined: !!entry.declined, fields: entry.fields, at: entry.at,
      ledgerKey: 'hgx:src:' + ex.id,
    };
    this.ctx.bus.emit('hgx:source', { phase: 'committed', ...record, committed: true });
    if (!rec) return;
    rec.committed = true;
    rec.lines = entry;
    if (rec.onCommit) { try { rec.onCommit(record); } catch (_) { /* the caller's problem */ } }
  },

  /** A commitment was made. Tell whoever is holding a gate on this argument. */
  _afterCommit(d, entry) {
    const g = this.gates.get(d.id);
    const record = {
      disputeId: d.id, question: d.question,
      choice: entry.choice, label: entry.label, why: entry.why, at: entry.at,
      ledgerKey: 'hgx:' + d.id,
    };
    this.ctx.bus.emit('hgx:judged', record);
    if (!g) return;
    g.committed = true;
    g.judgement = entry;
    this.ctx.bus.emit('hgx:gate', { phase: 'committed', disputeId: d.id, committed: true, record });
    if (g.onCommit) { try { g.onCommit(record); } catch (_) { /* the caller's problem */ } }
  },

  /** Re-apply the band to everything of ours that is on screen. Every root is
   *  measured separately, because two of ours can be standing in two different
   *  surfaces at once — an argument in the rail and a gate in a lesson beat. */
  _relayout() {
    for (const root of document.querySelectorAll('.hgx')) {
      const id = root.dataset.dispute;
      const st = id ? this._state(id) : null;
      const at = paginate(root, bandFor(root, this._sheetBand()), st ? st.step : 0);
      if (st) st.step = at;
    }
    for (const root of document.querySelectorAll('.hgx-index')) liftPager(root);
  },

  /**
   * WATCH THE SURFACE, NOT THE WINDOW.
   *
   * `chrome:layout` is the shell telling us its own geometry changed. It does
   * not fire when a caller's panel changes height under a node we have handed
   * it — the lesson beat that expands its map peek strip, a sheet that grows
   * when its head wraps — and after round 3 the band is measured off exactly
   * that box. One observer per module, re-pointed at whatever surfaces our
   * roots are currently in; it calls the same `_relayout` and nothing else.
   */
  _watchSurfaces() {
    if (typeof ResizeObserver === 'undefined') return;
    if (!this.ro) {
      let queued = false;
      this.ro = new ResizeObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; this._relayout(); });
      });
      this.d(() => { try { this.ro.disconnect(); } catch (_) { /* going away anyway */ } });
    }
    this.ro.disconnect();
    const seen = new Set();
    for (const root of document.querySelectorAll('.hgx, .hgx-index')) {
      const win = readingWindow(root);
      if (win && !seen.has(win)) { seen.add(win); this.ro.observe(win); }
    }
  },

  /* ----------------------------------------------------------- the sheet -- */
  _state(id) {
    if (!this.work.has(id)) this.work.set(id, { pick: null, why: '', lens: false, third: false, step: 0 });
    return this.work.get(id);
  },

  /** Is the rail a bottom sheet? Below 62rem it is, and the shell says so on
   *  `#app[data-rail]` (LAYOUT_BUDGET §2A). At that width the sheet body is
   *  198px at 390x844 and 223px at 768x1024 — measured. It is now a HINT and
   *  not the whole answer: `bandFor()` measures the surface a node is actually
   *  in, because 900x700 and 1024x640 are not sheets and were the two worst
   *  reading windows in this module. */
  _sheetBand() {
    const app = document.getElementById('app');
    return !!app && app.dataset.rail === 'sheet';
  },

  /** Apply the band to a rendered argument. Idempotent, and safe on any root. */
  _page(root, id, want) {
    if (!root) return;
    const st = id ? this._state(id) : null;
    const at = paginate(root, bandFor(root, this._sheetBand()), want != null ? want : (st ? st.step : 0));
    if (st) st.step = at;
    this._watchSurfaces();
  },

  _open(id, opts = {}) {
    const d = disputeById(id);
    if (!d) return false;
    const st = this._state(id);
    if (opts.step != null) st.step = opts.step;
    const node = renderFull(d, st, { ...this.ctx, parallel: (dd, ss) => parallelBlock(dd, ss) });
    const sel = this.ctx.store.getState().selectedTerritoryId;
    const t = sel && (d.territories || []).includes(sel) ? this.ctx.data.get(sel) : null;
    this.openId = id;
    const body = document.querySelector('.cx-sheet__body');
    const keep = opts.keepScroll && body ? body.scrollTop : null;
    this.ctx.bus.emit('ask:sheet', {
      id: 'hgx:' + id,
      eyebrow: t ? t.name : 'An argument in this atlas',
      title: 'Historians disagree',
      node,
    });
    this._page(node, id);
    requestAnimationFrame(() => {
      const b = document.querySelector('.cx-sheet__body');
      if (b && keep != null) b.scrollTop = keep;
      this._page(node, id);
    });
    if (opts.focus) this._land('.hgx-verdict', 'Your answer is recorded. Where the argument stands, what would '
      + 'settle it, and every source each side reads are open below it.');
    else if (!opts.quiet) this._land('.hgx__q', d.question + ' Read the positions, then choose one and say why.');
    return true;
  },

  /**
   * Move the caret onto the surface that has just opened and say what it is.
   * The control that opened it is still in the document — the dossier column
   * stands behind the sheet — so without this a keyboard reader pressed "Weigh
   * it up" and stayed exactly where they were, seventeen tab stops from the
   * panel they had just asked for. After a commitment the button they pressed
   * has been thrown away, and focus would otherwise land on <body>.
   */
  _land(sel, say) {
    requestAnimationFrame(() => {
      const n = document.querySelector('.cx-sheet__body ' + sel);
      if (!n) return;
      n.setAttribute('tabindex', '-1');
      n.focus({ preventScroll: true });
      if (say) announce(say);
    });
  },

  _openIndex() {
    const s = stats();
    const node = renderIndex(DISPUTES, this.ctx);

    /* THE FOUR DOCUMENTS YOU WRITE ABOUT YOURSELF, reachable without knowing
       which argument they stand in. A surface a reader can only find by
       already knowing it is there is the defect this module's own resting
       state exists to answer, and it applies to this just as much. */
    const ps = produceStats();
    const box = el('section.cx-panel.cx-panel--plain.hgx-index__src');
    /* COUNTED, NOT ASSERTED. This head said "And four you write about
       yourself" while the sentence directly under it, which counts, said "On
       these six documents". Two numbers for one set, three lines apart, on the
       screen a student reads — the same defect as a gloss that contradicts its
       own record, in this module's own panel. Both now come off
       produceStats(). */
    box.append(el('h3.cx-panel__head.hgx__eyebrow.sc', {
      text: 'And ' + (SPELLED[ps.exercises] || String(ps.exercises)) + ' you write about yourself',
    }));
    box.append(el('p.cx-note', {
      /* Spelled, not set as a numeral: "On these 4 the answers are blank" puts a
         figure where the sentence wants a word, and DESIGN §6 rule 2 reserves
         tabular figures for dates, counts and durations a reader compares. */
      text: 'This atlas answers four questions about every document it prints — what it is, who made '
        + 'it, what it was made to do, and what it cannot tell you. On these '
        + (SPELLED[ps.exercises] || String(ps.exercises))
        + ' documents the answers are blank until you have written your own, and then ours stand '
        + 'beside yours with what a strong answer notices on each. You have written '
        + ps.written + ' of ' + ps.exercises + '.',
    }));
    const ul = el('ul.hgx-index__list.hgx-index__list--src');
    for (const ex of PRODUCTIONS) {
      const li = el('li.hgx-index__row', { dataset: { judged: linesFor(ex.id) ? 'yes' : 'no' } });
      li.append(el('button.cx-more.hgx-index__go', { type: 'button', dataset: { hgx: 'srcopen', ex: ex.id } },
        el('span', { text: ex.title })));
      li.append(el('p.hgx-index__who', { text: ex.kindWord }));
      ul.append(li);
    }
    box.append(ul);
    node.append(box);

    node.append(el('p.cx-note.hgx-index__foot', {
      text: s.disputes + ' arguments · ' + s.positions + ' positions · ' + s.places
        + ' places in this atlas carry one. You have taken a position on ' + judgedCount() + '.',
    }));
    /* The veil is sticky and has to be the last thing in the box, so anything
       appended after renderIndex() goes in front of it. */
    const veil = node.querySelector('.hgx-veil');
    if (veil) node.append(veil);
    this.openId = 'index';
    this.ctx.bus.emit('ask:sheet', {
      id: 'hgx:index',
      eyebrow: s.disputes + ' arguments · ' + s.positions + ' positions',
      title: 'Historians disagree',
      node,
    });
    /* The index has no pager to lift, so what it needs from the same
       measurement is the fade — see render.js `liftPager` / `.hgx-veil`. */
    requestAnimationFrame(() => liftPager(node));
    this._watchSurfaces();
    this._land('.hgx-index__lede', 'Every argument this atlas holds open, ' + s.disputes + ' of them.');
    return true;
  },

  /* ------------------------------------------------------------- events --- */
  _onClick(ev, hit) {
    const act = hit.dataset.hgx;
    const id = hit.dataset.dispute;
    const d = id ? disputeById(id) : null;

    if (act === 'open' && d) {
      ev.preventDefault();
      /* Inside a mounted gate the surface belongs to the caller, so the route
         out of it is the caller's to take. Without this, pressing "Open the
         whole argument" inside a lesson beat would emit `ask:sheet` and take
         the panel the lesson is standing in. */
      const inGate = hit.closest('.hgx--gate');
      const g = inGate ? this.gates.get(id) : null;
      if (g && g.onOpenFull) { g.onOpenFull(id); return; }
      this._open(id);
      return;
    }
    if (act === 'index') { ev.preventDefault(); this._openIndex(); return; }
    if (act === 'seg') { ev.preventDefault(); this._light(hit); return; }

    /* ---- the four lines ---------------------------------------------------
       These carry `data-ex`, not `data-dispute`, and they are answered before
       the dispute guard below: an exercise can be standing on its own, in a
       caller's beat, with no argument anywhere near it. */
    if (act === 'srcopen') { ev.preventDefault(); this._openSource(hit.dataset.ex); return; }
    if (act === 'srccommit' || act === 'srcskip') {
      ev.preventDefault();
      const ex = productionById(hit.dataset.ex);
      if (!ex) return;
      /* Read every box in this root, not the one form the button is in: the
         four questions are four chapters, and four of them are hidden while
         the fifth is on screen. Read from the DOM as well as from what the
         input listener recorded, because a paste with the mouse and an
         autofill do not both raise `input` in every engine. */
      const root = hit.closest('.hgx') || document;
      const said = { ...typingFor(ex.id) };
      for (const ta of root.querySelectorAll('textarea[data-hgx="srcfield"][data-ex="' + ex.id + '"]')) {
        said[ta.dataset.field] = ta.value;
        noteTyping(ex.id, ta.dataset.field, ta.value);
      }
      const rec = commitLines(ex, said, this.ctx, { declined: act === 'srcskip' });
      if (!rec) return;
      this._repaintSource(ex);
      this._afterSrcCommit(ex, rec);
      /* The commitment swaps five chapters for six, so the pager position the
         reader was standing on now points at something else — measured: a
         student who committed on chapter 9 of 10 landed on "the record whole"
         and never saw the comparison they had just earned. Go to the first
         chapter of the second half, the way the argument's own commitment
         does, and put the caret and the scroller at the top of it. */
      requestAnimationFrame(() => {
        const root = document.querySelector('.hgx--src[data-src="' + ex.id + '"]')
          || document.querySelector('.hgx[data-dispute="' + ex.dispute + '"]');
        if (root) {
          const chaps = [...root.querySelectorAll(':scope > .hgx-chaps > .hgx-chap')];
          const at = chaps.findIndex((c) => c.dataset.chap === 'src-after');
          if (at >= 0) this._page(root, root.dataset.dispute, at);
          const body = root.closest('.cx-sheet__body') || root.parentElement;
          if (body) { try { body.scrollTop = 0; } catch (_) { /* not a scroller */ } }
        }
        const n = document.querySelector('.hgx-src__after');
        if (n) {
          n.setAttribute('tabindex', '-1');
          try { n.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ }
        }
        announce(rec.declined
          ? 'This atlas’s four lines about the document are open, with what a strong answer notices on each.'
          : 'Your four lines are recorded. This atlas’s four are beside them, one question at a time.');
      });
      return;
    }

    /* The pager works on any root of ours, and a standalone exercise is one:
       its state key is `src:<id>` and there is no dispute behind it, so this
       branch stands above the guard. */
    if (act === 'step') {
      ev.preventDefault();
      const root = hit.closest('.hgx');
      if (!root || !id) return;
      const sst = this._state(id);
      const n = chapterCount(root);
      const at = Math.max(0, Math.min(n - 1, (sst.step || 0) + Number(hit.dataset.dir || 1)));
      this._page(root, id, at);
      /* The reader has been given a new page; put them at the top of it and say
         what it is. Without this the scroller stays where the last chapter left
         it and a 198px window opens two thirds of the way down the new one. */
      const body = root.closest('.cx-sheet__body') || root.parentElement;
      if (body && body.scrollTo) { try { body.scrollTo({ top: 0, behavior: 'auto' }); } catch (_) { body.scrollTop = 0; } }
      const cur = root.querySelector('.hgx-chap:not([hidden])');
      if (cur) announce((at + 1) + ' of ' + n + '. ' + (cur.dataset.label || ''));
      const same = root.querySelector('[data-hgx="step"][data-dir="' + hit.dataset.dir + '"]');
      if (same && !same.disabled) { try { same.focus({ preventScroll: true }); } catch (_) {} }
      return;
    }

    if (!d) return;
    const st = this._state(id);

    if (act === 'pick') {
      ev.preventDefault();
      /* No re-render. A re-render would rebuild the textarea and take the
         caret out of the sentence the student is in the middle of writing. */
      st.pick = hit.dataset.value;
      const form = hit.closest('.hgx-ask');
      if (form) {
        for (const b of form.querySelectorAll('.hgx-choice')) {
          const on2 = b.dataset.value === st.pick;
          b.setAttribute('aria-pressed', on2 ? 'true' : 'false');
          if (on2) b.dataset.chosen = 'yes'; else delete b.dataset.chosen;
        }
        this._askGate(form, st);
      }
      return;
    }
    if (act === 'commit') {
      ev.preventDefault();
      const form = hit.closest('.hgx-ask');
      const ta = form && form.querySelector('textarea[data-hgx="why"]');
      if (ta) st.why = ta.value;
      const rec = commit(d, st.pick, st.why, this.ctx);
      if (!rec) return;
      /* The second half of the argument is a different set of chapters, so the
         reader goes to the first of them rather than to whichever number they
         happened to be standing on. */
      if (hit.closest('.hgx--gate')) {
        this._repaint(id, { step: 0 });
        this._afterCommit(d, rec);
        requestAnimationFrame(() => {
          const g = this.gates.get(id);
          const n = g && g.node && g.node.querySelector('.hgx-verdict');
          if (!n) return;
          n.setAttribute('tabindex', '-1');
          try { n.focus({ preventScroll: true }); } catch (_) { /* focus is a courtesy */ }
          announce('Your answer is recorded. Where the argument stands, and what would settle it, are open below it.');
        });
        return;
      }
      this._open(id, { keepScroll: true, focus: true, step: 0 });
      this._afterCommit(d, rec);
      return;
    }
    const inGate2 = !!hit.closest('.hgx--gate');
    if (act === 'lens') {
      ev.preventDefault(); st.lens = !st.lens;
      if (inGate2) this._repaint(id); else this._open(id, { keepScroll: true, quiet: true });
      this._refocus('[data-hgx="lens"]'); return;
    }
    if (act === 'third') {
      ev.preventDefault(); st.third = !st.third;
      if (inGate2) this._repaint(id); else this._open(id, { keepScroll: true, quiet: true });
      this._refocus('[data-hgx="third"]'); return;
    }
    if (act === 'atlas') { ev.preventDefault(); this._atlas(d, hit); return; }
  },

  /** A toggle re-renders the surface; the caret goes back on the toggle. */
  _refocus(sel) {
    requestAnimationFrame(() => {
      /* The argument stands in the rail sheet OR, as a mounted gate, on a
         surface belonging to whoever asked for it. Look in both. */
      const n = document.querySelector('.cx-sheet__body ' + sel) || document.querySelector('.hgx ' + sel);
      if (n) n.focus({ preventScroll: true });
    });
  },

  _onType(ta) {
    const id = ta.dataset.dispute;
    if (!id) return;
    const st = this._state(id);
    st.why = ta.value;
    const form = ta.closest('.hgx-ask');
    if (form) this._askGate(form, st);
  },

  /** The ASK's own gate — the disabled/enabled state of the commit button,
   *  updated in place, never re-rendered under a caret. Named apart from
   *  `_mountGate` because the two collided in this object literal once and the
   *  later definition silently won: the lesson path's gate request reached the
   *  form validator, which threw on `form.querySelector`. */
  _askGate(form, st) {
    const go = form.querySelector('.hgx-ask__go');
    const need = form.querySelector('.hgx-ask__need');
    const short = String(st.why || '').trim().length < MIN_CHARS;
    const blocked = !st.pick || short;
    if (go) go.disabled = blocked;
    if (!need) return;
    need.hidden = !blocked;
    need.textContent = !st.pick
      ? 'Choose one of the answers above.'
      : 'A few more words — at least ' + MIN_CHARS + ' characters, so the sentence says something you can be held to.';
  },

  /** Segment locking across the parallel columns. */
  _light(btn) {
    /* The counterpart clause now lives in another chapter, so the search is over
       the whole argument rather than over one block. On a phone the counterpart
       is behind the pager and stays lit when the reader gets there — which is
       the only form "side by side" can take in a 390px column. */
    const box = btn.closest('.hgx') || btn.closest('.hgx-par');
    if (!box) return;
    const seg = btn.dataset.seg;
    const was = btn.dataset.lit === 'yes';
    for (const b of box.querySelectorAll('.hgx-seg')) {
      const lit = !was && b.dataset.seg === seg;
      if (lit) b.dataset.lit = 'yes'; else delete b.dataset.lit;
      b.setAttribute('aria-pressed', lit ? 'true' : 'false');
    }
  },

  /**
   * The afterlife coupling. The texts and the argument stay exactly where they
   * are; the map underneath moves. Nothing is invented: the year, the units and
   * the sentence are all fields on the dispute, and where our geometry cannot
   * draw what the note describes, `honest` says so on the panel.
   */
  _atlas(d, btn) {
    const a = d.atlasCan;
    if (!a) return;
    const step = this.atlasStep.get(d.id) || 0;
    /* `step` is the state BEFORE this press: 0 means the next thing to show is
       the first year, 1 means the second. The note and the reason travel with
       the year, or the panel would caption 1840 with what happened in 1863. */
    const second = step === 1 && a.thenYear;
    const year = second ? a.thenYear : a.year;
    const note = (second && a.thenNote) ? a.thenNote : a.note;
    const reason = (second && a.thenReason) ? a.thenReason : (a.reason || '');
    if (year) this.ctx.store.dispatch('setYear', year);
    const ids = a.unitIds && a.unitIds.length
      ? a.unitIds.flatMap((t) => {
        const u = this.ctx.data.unitsOf ? this.ctx.data.unitsOf(t) : null;
        return (u && u.length) ? u.map((x) => (typeof x === 'string' ? x : x.unitId || x.id)) : [t];
      }).filter(Boolean)
      : [];
    if (ids.length) {
      this.ctx.bus.emit('ask:paintUnits', { unitIds: ids, reason });
      this.ctx.bus.emit('ask:flyTo', { unitId: ids[0] });
    }
    this.ctx.bus.emit('ask:say', {
      id: 'hgx:atlas', priority: 40, mark: String(year || ''), text: note,
    });
    announce('The map is at ' + year + '. ' + note);
    if (a.thenYear) {
      this.atlasStep.set(d.id, step === 1 ? 0 : 1);
      const span = btn.querySelector('span');
      if (span) span.textContent = step === 1 ? a.label : 'Now take it to ' + a.thenYear;
      const box = btn.closest('.hgx-atlas');
      const para = box && box.querySelector('.hgx-atlas__note');
      if (para) para.textContent = note;
    }
  },
};
