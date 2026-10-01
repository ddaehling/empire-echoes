# COUNTER-DESIGN — Simultaneity, Evidence, Silence

**Stance owner:** simultaneity / evidence / silence.
**Answers:** `docs/rival/WHY_PRINT_WINS.md` (15 points) against `docs/rival/CHAMPION.md`.
**Builds within:** `docs/ARCHITECTURE.md` (module contract), `docs/DATA_MODEL.md`, `docs/DESIGN.md`, `docs/DIDACTIC_SPEC.md`.

---

## 0. The argument in one paragraph

The rival brief is right that a map's grammar is *place, extent and time*, and that its own subject is
*causation, contested evidence, and claims that are true of some cases and not others*. Our mistake would
be to answer that by getting better at place, extent and time. The winning move is to stop treating the
map as the app and start treating **the plate** as the app: a fixed, non-scrolling field that holds four
claims at once, with the map as one instrument on it. Then attack on the three fronts where a page is not
merely matchable but beatable: **cross-lighting** (a page cannot highlight the corresponding figure in the
other three columns when your eye lands on this one), **provenance as a live index** (a page cannot repaint
itself to show only what one source can support), and **absence as a data type** (a page can *tell* you the
archive was burned; it cannot let you go looking and come back empty). Everything below is one of those
three, or a concession.

Two rules govern every mechanism in this document.

1. **Nothing essential is behind a click, a hover, a tab or an accordion.** Tabs are how apps lose
   argument #3. Where print puts four things on a page, we put four things in a grid. Under 62rem they
   stack; they never become tabs.
2. **A defect is student-visible.** An unsourced number renders as `[unsourced]` in `--danger` in front of
   a sixteen-year-old. Auditability that only a developer can see is not auditability.

---

## 1. Verdict on the fifteen

| # | Print's claim | Verdict | The mechanism that does the work |
|---|---|---|---|
| 1 | Sustained causal argument dies in a tooltip | **NEUTRALISED** | Three things, none of them a tooltip. (a) The **Tension Plate** (F1) holds a four-clause argument in one visual field at `--fs-prose`/48ch per cell — the connectives are on screen together, not serialised. (b) `causal_links[]` on the dataset renders as **because-chips** that survive panel changes, so a cause stays visible next to its consequence in a different panel. (c) The **Complication Gate** (F10) carries the thesis across four forced commitments and the **Closing Argument** (F12) settles it. Honest limit: 18,000 words of subordinate clauses is a real print advantage and we run about a fifth of that. We match; we do not beat. |
| 2 | No ending, so nothing lands | **REVERSED** | The tour **terminates** — it does not decant into a sandbox. The last screen is the **Closing Argument** (F12): the app's twelve-sentence thesis in the left column, and in the right column *the student's own recorded commitments*, quoted back with the minute at which they made them — the 00:00 population guess, the four Complication Gate placements, every prediction error. A chapter's conclusion is the same for everyone. Ours names the reader and their wrong answers. |
| 3 | The eye holds three paragraphs in tension; a click UI serialises | **REVERSED** | **F1, the Tension Plate.** Four claims in a 2×2 CSS grid with a shared hairline gutter, all four permanently rendered, none collapsible. Then the move print cannot make: **"pick the one you think is the real story"**. Choosing one promotes it and renders the other three as a discard strip captioned *what this version has to leave out*, each with the sentence it must strike through. Print can *instruct* you to hold four at once. We let you attempt the simplification you were going to make anyway, and price it. |
| 4 | The map's weight is area; the argument's weight often isn't. And territory is the wrong unit | **REVERSED** | Three mechanisms. (a) **Size-by cartogram morph** (F5): the same map re-scales each unit about its own centroid by land area / population / trade value to Britain / soldiers supplied / revenue extracted. Barbados swells past British North America on one control, on the map that was just lying about it. (b) **System view** (F6): the 101 units flagged `tiny` in `units.index.json` become nodes with cable and coaling routes between them, landmasses dropped to ghost — CHAMPION §4's "a system of communications before it was a territory", rendered. (c) **Three definitions of control** (F7): keys 1/2/3 repaint the same year at `controlDegree ≥ 1 / ≥ 3 / ≥ 5`. Residual concession, stated in-app: our *default first screen* is the 1921 pink map presented as a poster to be attacked, not as our map, because default view choice is itself a teaching act. |
| 5 | Informal empire is unmappable, so the app reproduces the lie | **NEUTRALISED** | **F9, the pressure layer.** `informal-sphere` (controlDegree 0) never gets a fill or a claimed border. It gets a **radial pressure haze** anchored on the node — Buenos Aires, Bushehr, Weihaiwei — whose radius encodes a stated quantity (British share of that state's foreign trade, or British-held debt as a share of state revenue), with the legend naming the quantity and the year. Then the **1860 test**: `[PREDICT]` "more or less imperial in 1860 than 1900?", then a two-up compare of 1860 formal-only against 1860 formal-plus-informal. Honest limit: our geometry has `ar-buenos-aires`, `iran`, `turkey`, `cn-weihaiwei` and no treaty-port polygons. The layer is labelled in-app as **a claim about influence, not a measurement**. Neutralised, not reversed. |
| 6 | The mechanism column is the pedagogy; a time-slider teaches only *when* | **REVERSED** | **F8, the Mechanism Matrix.** A real 14 × 9 contingency table (acquisition mechanisms × departure mechanisms from `DATA_MODEL` §3.2 and §3.4), counts in every cell, built from `data.acquisitions` and `data.departures`. Click a cell and the map paints only those units. Click a column header and the map paints every conquest. The default `activeLayer` at boot is **`mechanism`, not `year`** — the time slider is demoted to an instrument, not the thesis. Print gives a column you count by eye; we give the count, its geography, and the cross-tabulation of the two columns, which no printed spread can hold. |
| 7 | Print can render a silence; software must display something | **REVERSED** | **F3, the Silence Layer.** `silences[]` becomes a data type (§3 below) with `kind ∈ {records-destroyed, records-withheld, never-counted, counted-only-one-side, name-not-recorded, category-erased}`. It renders three ways: an **absence hatch** (coastline drawn, interior left as bare paper inside a field of filled units — the eye reads the hole); an **excision block** in running prose, an ink rule of the measured width of the removed text, clickable for who removed it and when; and an **open range bar** whose upper bound fades out with no terminal and the words *no one counted*. Plus the software-only move: **a search of our own evidence base that returns the absence as a result** (§4, Move 3). Print states an absence. We can make a student go looking and fail. |
| 8 | A quotation on a page carries provenance; in an interface it becomes decoration | **REVERSED** | **F2.** Every quotation renders through one function that *requires* four fields — nature, origin, purpose, and **what it cannot tell you** (CHAMPION's own §16.1 method, taken and made structural). Attribution renders **before** the quote in DOM order and above it visually. Missing any field renders `[unsourced]` in `--danger`, visibly, to students. Then the reversal: the **provenance rail**, a sticky 20px strip beside every prose panel with one tick per sourced claim, textured by source kind, so a passage that is four official records and zero testimonies *has a visible shape*. Footnote numbers do not aggregate into a picture. And clicking a tick triggers **Provenance Repaint** (§4, Move 2). |
| 9 | Two texts side by side: Waitangi is invisible at map scale | **REVERSED** | **F4, Parallel Texts.** Two columns, hairline rule between, both at `--fs-prose` serif — matched to print — plus three things a page cannot do: **segment locking** (focus "sovereignty" and *te Kawanatanga katoa* lights in the other column, because the corresponding clauses are never on the same line and never will be); a **third column on demand** (Kawharu's 1989 back-translation of the Māori text) that would make print unreadable at 48ch × 3; and **word history** on `rangatiratanga`, showing the same missionaries' use of it for "kingdom" in the Lord's Prayer. Then the coupling: the texts stay fixed while the New Zealand units beneath recolour 1840 → 1863 confiscations → 1975 Tribunal. Print must turn the page. |
| 10 | Disproportion is a prose fact, not a spatial one | **REVERSED** | **F11, the Ratio Line.** One axis, and before any number appears the student **drags a divider to where they think the ratio is**. Then the reveal: 32 European settlers killed; 1,090 hanged; over a million Kikuyu villagised. Print makes the reader do the division silently, and most do not. We make them commit to a wrong division first, which is the hypercorrection effect and the whole basis of §4 misconception repair. Same component runs T5 (£20,000,000 / £0), T8 (British share of a 250,000-strong army) and T14 (population lost vs area lost in 1947). |
| 11 | A book ambushes; an app's users route around | **NEUTRALISED** | **F10, the Complication Gate.** Four beats in the 30-minute path where Next is disabled until the student *places* a damaging fact on a two-axis field (weakens ↔ complicates ↔ doesn't affect × how confident). Any placement advances; there is no right answer; there is no way past without touching it. The 20,000 enslaved people who fled to British lines in 1776 is one of them. Honest limit: I refuse to go further. Removing the free-explore escape (`DIDACTIC_SPEC` §8.2) to force compliance would teach worse, and a reader can close a book too. Neutralised. |
| 12 | Engagement metrics select against what matters | **NEUTRALISED, by governance not by UI** | `DIDACTIC_SPEC` §8.3 already names five measures. Make the refusal enforceable: **the instrumentation module has no code path that can report dwell time, click count, session length or scroll depth** — it can emit first-attempt accuracy per T-item, prediction error at each `[PREDICT]`, gate placements, through-line completion, and post-30-minute continuation, and literally nothing else, into `localStorage`, with no network. Plus a hard **animation budget** (§5): no autoplaying sequence longer than 25 seconds, and none at all on the Africa scramble. This is a promise backed by an absence of capability, not a feature. Say so out loud. |
| 13 | A page carries its own evidence base; an app buries it in a build | **REVERSED** | **F13, the Evidence Ledger.** One overlay (`#panel=ledger`), one row per number in the atlas: value, range, source (author / work / year / `kind`), the `supports` sentence, `confidence`, `contested` flag, and a deep link to where it appears. Sortable; default sort **`confidence: low` first**, because that is what a head of department wants to audit. It prints (one row per line, content version in the header) and `node tools/evidence-audit.js` emits the same table as markdown with no browser. A page can be audited in one armchair sitting; ours can be audited in one armchair sitting *sorted by how shaky we admit each number is*. |
| 14 | Print has one version; curriculum needs permanence | **CONCEDED** | Narrowed, not answered. A content version string in every deep link (`#v=3&year=1857`) and printed in the footer of every print view; a changelog; hash routes frozen and documented in `ARCHITECTURE` §8 so `#year=1765&sel=bengal` means the same thing in three years; offline-first with everything vendored, so the app is a folder that works from a USB stick with no Wi-Fi and no supplier. But a chapter on a shelf in 2031 beats a folder of ES modules in 2031, and pretending otherwise would be exactly the kind of unearned confidence we are attacking elsewhere. Conceded. |
| 15 | Print has the standing to tell the reader they are wrong | **REVERSED** | **F14, the Editor's Note.** A named first-person voice in its own typographic register — sans, `--fs-small`, `--paper-sunk` ground, 3px `--accent` left rule — that fires *against the student's own recorded commitment*, not against a generic reader. Not "estimates vary". Instead: *"You put Partition's dead at 200,000. That is the lowest published figure. The highest is two million. Choosing the low end is a choice, and here is who made it and why."* Print can only be generically corrective. Software can be **specifically** corrective, and specificity is the difference between a scold and a teacher. |

**Tally: 1 conceded, 4 neutralised, 10 reversed.** The concession and the four neutralisations are the
honest ones — sustained prose, informal empire, the ambush, and the metrics pressure. If those four were
also claimed as reversals this document would not be worth reading.

---

## 2. The fourteen features

Format for each: **purpose** / **student-visible behaviour** / **data** / **lives at** / **the sentence
that proves it worked**. Ownership boundaries are respected: where a feature needs something owned by the
shell, the map, or the data model, it is flagged **ASK** and the request is stated exactly.

---

### F1 — The Tension Plate

**Purpose.** Hold four incompatible-feeling true claims in one visual field, and make collapsing them to
one cost something visible.

**Behaviour.** A 2×2 field fills the lower stage; the map compresses above it and stays live. Four claims,
each a heading, 40–70 words of serif prose at 48ch, and an attribution footer. No cell scrolls, closes or
tabs. Landing on any figure — by pointer or by keyboard — lights the *same* figure everywhere it appears
in the other three cells, on the timeline, and on the map. Under the grid: *"Pick the one you think is the
real story."* Four buttons. Choosing one promotes it to a full-height left column and pushes the other
three into a right-hand discard strip headed **what this version has to leave out**, each showing the one
sentence it must strike through. "Put them back" restores. The choice is recorded and quoted back in F12.

Canonical plates: **Abolition** (£20m to owners / apprenticeship to 1838 / the West Africa Squadron's real
cost / indenture starting within a year), **Kenya 1952–60**, **The railways** (M7), **Waitangi**,
**Did empire pay?** (M11).

```html
<section class="plate" data-plate="abolition" aria-labelledby="pl-ab-h">
  <h2 id="pl-ab-h" class="plate__q">Abolition. Four things, all true at once.</h2>
  <div class="plate__grid">
    <article class="claim" data-claim="compensation" tabindex="0">
      <h3 class="claim__h">£20,000,000 went to the owners</h3>
      <p class="claim__body">Parliament paid <span class="fig" data-fig="comp-20m">£20 million</span> on
        about 46,000 claims — roughly 40% of annual government spending. The people freed got
        <span class="fig" data-fig="comp-0">nothing</span>.</p>
      <footer class="claim__cite"><cite-chip src="draper-2010"></cite-chip></footer>
    </article>
    <!-- ×4 -->
  </div>
  <div class="plate__collapse" role="group" aria-label="Try to make one claim win">…</div>
</section>
```

```css
.plate__grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  grid-template-rows:repeat(2,minmax(0,1fr));
  gap:var(--rule-fine);                      /* the gutter IS the rule */
  background:var(--border-default);
  border:var(--rule-fine) solid var(--border-default);
}
.claim{ background:var(--surface-panel); padding:var(--space-lg);
        max-inline-size:var(--measure-narrow);            /* 48ch */
        font:380 var(--fs-prose)/var(--lh-prose) var(--font-serif); }
.claim__h{ font:600 var(--fs-h4)/var(--lh-snug) var(--font-serif); margin-block-end:var(--space-sm); }
.claim__cite{ font:400 var(--fs-caption)/1.3 var(--font-sans); color:var(--text-secondary); }
.fig{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; }
[data-lit="on"]{ box-shadow:inset 0 -0.55em 0 var(--accent-wash); }   /* marker pen, not selection */
.plate[data-collapsed] .claim[data-discarded] .claim__body{        /* JS sets data-discarded */
  text-decoration:line-through; color:var(--text-secondary); }
.plate[data-collapsed] .claim:not([data-discarded]){ grid-row:1 / span 2; }
@media (width < 62rem){
  .plate__grid{ grid-template-columns:1fr; grid-template-rows:none; }
  .claim__h{ position:sticky; inset-block-start:0; background:var(--surface-panel); }
}
```

Cross-lighting is 20 lines: on `pointerover`/`focusin`, read `closest('[data-fig]').dataset.fig`, set
`data-lit` on every matching `[data-fig]` inside the plate, and `bus.emit('plate:lit', { figId, unitIds })`
so the map and timeline can answer. `pointerout`/`focusout` clears. No hover-only information ever
crosses this channel — lighting is emphasis, not content (`DIDACTIC_SPEC` §5.7).

**Data.** A new `plates.json` in the module directory: `{ id, question, claims:[{id, heading, body,
figures:[{id,label,value,unitIds[]}], sourceIds[], strikeSentence}] }`. Figures reference existing
territory numbers so the ledger (F13) already covers them.

**Lives at.** `app/js/plate/index.js`, `app/css/plate.css`. **ASK (shell):** one new mount slot,
`stage-lower` — the lower 55–60% of the map stage, so the map compresses rather than disappearing
(`DIDACTIC_SPEC` §8.1). Falls back to `overlay` with `position:absolute` if declined.

**The sentence.** *"There were four true things about abolition and I couldn't drop any of them without
losing something — I tried."*

---

### F2 — Provenance rail and the source card contract

**Purpose.** Make attribution load-bearing, not decorative, and make the *shape* of an evidence base
visible at a glance.

**Behaviour.** Every quotation in the app renders as a figure whose caption comes **first**: four labelled
lines in small caps — NATURE / ORIGIN / PURPOSE / **WHAT IT CANNOT TELL YOU** — then the quote at
`--fs-lede` behind a 1.5px `--accent` rule. Beside every prose panel, a sticky rail of ticks, one per
sourced claim, textured by `citation.kind` (official-record / primary-testimony / dataset /
modern-reconstruction / book). A student can see that the Amritsar passage is four official-record ticks
and one testimony tick before reading a word. Clicking a tick scrolls its claim into view and opens the
source card; **long-pressing or shift-clicking a tick fires Provenance Repaint** (§4, Move 2).

```css
.prose{ display:grid; grid-template-columns:minmax(0,var(--measure)) var(--space-xl);
        column-gap:var(--space-md); }
.rail{ display:flex; flex-direction:column; gap:2px; position:sticky; inset-block-start:var(--space-md); }
.rail__tick{ inline-size:16px; block-size:8px; border-radius:1px; border:var(--rule-hair) solid var(--ink-faint); }
.rail__tick[data-kind="primary-testimony"]{ background:var(--tex-testimony); }
.rail__tick[data-kind="official-record"]{ background:var(--tex-official); }
.source__nop{ font:600 var(--fs-micro)/1.5 var(--font-sans); letter-spacing:.075em; text-transform:uppercase; }
.source__quote{ font:380 var(--fs-lede)/var(--lh-prose) var(--font-serif);
                border-inline-start:var(--rule-mid) solid var(--accent); padding-inline-start:var(--space-md); }
.unsourced{ color:var(--danger); font-family:var(--font-mono); }
```

`renderSource(id)` is the single entry point. If `nature | origin | purpose | limits` is missing it
returns `<p class="unsourced">[unsourced] — this is a defect: <code>id</code></p>`, warns once, and
increments a counter shown in the statusbar. Nothing else in the app is permitted to print a quotation.

**Data. ASK (data-model):** extend `evidence[]` citations with four required strings when the citation is
attached to a displayed quotation — `nature`, `origin`, `purpose`, `limits`. `supports` already exists and
stays. Everything else is present.

**Lives at.** `app/js/sources/index.js` (exports `renderSource`, `renderRail`, registers the `cite-chip`
custom element), `app/css/sources.css`. Slot: none — it is a library other modules import, plus a
`dossier`-adjacent card region.

**The sentence.** *"Before I read the Rhodes quote I knew a journalist wrote it down and Lenin reprinted
it twenty-two years later to prove a point about capitalism."*

---

### F3 — The Silence Layer

**Purpose.** Make a deliberately created absence a thing the app draws, not a thing it apologises for.

**Behaviour.** Three renderings, one data type.

1. **Absence hatch, on the map.** A unit carrying a silence of kind `never-counted` or `records-destroyed`
   draws its coastline and leaves its interior as bare paper with a 0.5px 45° dotted texture. In a field
   of solidly filled units, the hole is the loudest thing on the plate. Legend entry: *"we do not know —
   and here is why"*, never *"no data"*.
2. **Excision, in running prose.** Inside a rendered document, the removed passage is an ink rule of the
   measured width of the missing text, sitting in the line where the words would be. Clicking it gives the
   removal: who, when, under what instruction, and what was later disclosed. Operation Legacy and the
   FCO 141 "migrated archives" (released from 2012) are the anchor case; the Kenya file counts and the
   destruction figures render as ranges with their notes, never as round numbers.
3. **Open range bar.** A quantity nobody counted draws with a hard lower tick and an upper end that fades
   to nothing, terminating in the words `no one counted` at `--fs-micro`. Set on the same axis as a
   *counted* figure — Amritsar's official 379, one commission, one solid tick — the two bars teach the
   epistemology by their shape. Partition's dead, Bengal 1770, Mau Mau, and the Black African camp deaths
   of 1900–02 alongside the counted 28,000 Boer deaths all run through this component.

```css
.unit[data-silence]{ fill:url(#tex-absent); stroke:var(--map-coast); stroke-dasharray:3 3; }
.excised{ display:inline-block; block-size:.92em; inline-size:var(--excised-w); background:var(--ink);
          vertical-align:-.14em; cursor:pointer; }
.range--open{ background:linear-gradient(90deg, var(--danger) 0 var(--lo),
              color-mix(in oklab, var(--danger), transparent 100%) 100%); }
.range--open::after{ content:"no one counted"; font:600 var(--fs-micro)/1 var(--font-sans);
                     color:var(--text-secondary); }
```

Colour never carries this alone (`DESIGN` rule 4): the hatch has a legend word, the excision has a
marginal note, the open bar has its four-word label.

**Data. ASK (data-model):** a `silences[]` array on territories and events —
`{ id, kind, what, why, agent, when, scope, evidenceOfAbsence[], whatWouldSettleIt, sources[] }`,
`kind ∈ {records-destroyed, records-withheld, never-counted, counted-only-one-side, name-not-recorded,
category-erased}`. `agent` is required and is a named body, because §7.1 rule 1 applies to archives too:
records do not get destroyed, people destroy them.

**Lives at.** `app/js/silence/index.js`, `app/css/silence.css`. Emits `ask:paintSilence` with a
`Set<unitId>` for the map to honour; renders excisions and range bars in-place for any module that imports
it.

**The sentence.** *"The gap in the Kenya map isn't missing data — the files were burned in 1963 and some
of the rest weren't shown to anyone until 2012."*

---

### F4 — Parallel Texts

**Purpose.** Beat the single best exercise in the rival chapter — Waitangi's two texts — on its own
typographic ground, and then do three things a page cannot.

**Behaviour.** Two columns, `--fs-prose` serif in both, hairline rule between, no images, no chrome. Every
clause is a segment; focusing a segment in either column lights its counterpart in the other, because
"sovereignty" and *te Kawanatanga katoa* do not sit on the same line and never will. A control adds a
**third column** — Kawharu's 1989 English translation *of the Māori text* — which print at three × 48ch
cannot carry. Clicking `rangatiratanga` opens a word-history card: the same missionary translators used it
for "kingdom" in the Lord's Prayer. Then the coupling: the texts stay fixed while a slider beneath runs
1840 → 1863 (New Zealand Settlements Act confiscations) → 1975 (Tribunal) → today, and the New Zealand
units recolour by confiscated land under the words that promised it.

Second and third instances: the **Berlin "effective occupation"** clause against what was said to the
chiefs whose land it allocated; and the **Hunter Commission count** against Indian evidence given to the
Congress inquiry.

```html
<div class="parallel" style="--cols:2">
  <div class="parallel__col" lang="en"><h4>English text</h4>
    …<span data-seg="a1" tabindex="0" role="button" aria-describedby="a1-mi">all the rights and powers of
    Sovereignty</span>…</div>
  <div class="parallel__col" lang="mi"><h4>Te reo Māori text — the one almost everyone signed</h4>
    …<span id="a1-mi" data-seg="a1" tabindex="0" role="button">te Kawanatanga katoa</span>…</div>
  <div class="parallel__col" lang="en" data-col="back" hidden><h4>The Māori text, back into English
    (Kawharu, 1989)</h4>…</div>
</div>
```

```css
.parallel{ display:grid; grid-template-columns:repeat(var(--cols),minmax(0,1fr)); column-gap:var(--space-xl); }
.parallel__col + .parallel__col{ border-inline-start:var(--rule-hair) solid var(--border-subtle);
                                 padding-inline-start:var(--space-xl); }
.parallel__col{ font:380 var(--fs-prose)/var(--lh-prose) var(--font-serif); }
[data-seg][data-lit]{ box-shadow:inset 0 -.55em 0 var(--accent-wash); }
@media (width < 62rem){ .parallel{ grid-template-columns:1fr; } }   /* stacked, segment lock still works */
```

**Data.** `texts.json` in the module: `{ id, columns:[{lang, label, sourceId, blocks:[{seg, text}]}],
glossary:[{term, seg, note, sourceIds}], afterlife:[{year, note, unitIds, metric}] }`. Every column needs
its own citation, so the three Waitangi columns carry three attributions — which is itself the lesson.

**Lives at.** `app/js/parallel/index.js`, `app/css/parallel.css`. Renders into `stage-lower` (F1's slot)
or `dossier`.

**The sentence.** *"The chiefs signed the Māori text and it says governance, not sovereignty — and the
land the English text promised them got confiscated in 1863."*

---

### F5 — Size-by (the cartogram morph)

**Purpose.** Break the map's own grammar on demand, so area stops being the argument.

**Behaviour.** One control in `toolbar`: **size by** — land area (identity) / population / value of trade
to Britain / soldiers supplied / revenue extracted. The same map animates each unit's scale about its own
projected centroid over `--dur-deliberate`; positions do not move, so the student never loses the place.
Switching to "trade to Britain, 1770" makes Barbados and Jamaica swell past British North America on the
very map that was misleading them thirty seconds earlier. The legend states the quantity, the year, and
its source; a unit with no figure for that metric draws with the F3 absence hatch rather than at zero,
because zero is a claim and we do not have one.

Implementation is a per-path transform, not a solver:
`translate(cx,cy) scale(sqrt(v / vRef)) translate(-cx,-cy)` using the projected `unitMeta.centroid`.
Non-contiguous, honest, and cheap.

**Data.** `data.unitMeta` already gives `centroid`, `area_km2` and `tiny`. **ASK (data-model):** a
`metrics[]` block on territories — `{ metric, year, value, unit, sourceIds, confidence }` for the five
metrics above. Every value lands in the Evidence Ledger.

**Lives at.** The control is mine (`app/js/viz/sizeby.js`); **the rendering belongs to the map agent.**
Contract: `bus.emit('ask:sizeBy', { metric, year, values: Map<unitId, number>, caption })`, and
`bus.emit('ask:sizeBy', null)` to reset.

**The sentence.** *"Barbados is 166 square miles and in the 1770s it was worth more to Britain than the
whole of North America — I watched it grow."*

---

### F6 — System view (the stitching)

**Purpose.** Render CHAMPION §4's own best sentence — the empire as a communications system before a
territory — and stop dots being demoted.

**Behaviour.** A toggle beside the layer switch: **territory / system**. In system view landmasses drop to
a ghost outline, and Gibraltar, Malta, Cyprus, Aden, Perim, Socotra, Ceylon, Singapore, Hong Kong, the
Falklands, St Helena and Ascension become nodes at a 44px minimum target with the cable and coaling routes
drawn between them. Scrubbing the year adds cables as they are laid. A node's card gives what it was for
in one sentence, and the year the route it served closed. Losing Suez in 1956 and losing Singapore in 1942
both become *cuts in a line*, not colour changes.

**Data.** `app/js/system/routes.json` (mine): `{ nodes:[{unitId, role, fromYear, toYear, sourceIds}],
links:[{a, b, kind:'cable'|'coaling'|'route', fromYear, toYear, sourceIds}] }`. 101 units already carry
`tiny: true` in `units.index.json`, which is the selection basis.

**Lives at.** `app/js/system/index.js`, `app/css/system.css`, rendering into `map-overlay` (an SVG layer
over the map, so the map module keeps its own drawing).

**The sentence.** *"The empire was a chain of dots holding a set of routes open, and when the dots went the
territories followed."*

---

### F7 — Three definitions of control

**Purpose.** Turn CHAMPION §1's single sentence — *claimed / administered / controlled* — from a claim into
something a student can measure.

**Behaviour.** Keys `1`, `2`, `3` (and three radio buttons, because keys are not an interface) repaint the
current year at `controlDegree ≥ 1`, `≥ 3`, `≥ 5`. A readout in `stage-note` gives the count and the share
each time: *"1860 — claimed: 96 units. Administered: 61. Directly controlled: 34."* The threshold stays
locked while the year is scrubbed, so the student can watch the gap between "claimed" and "controlled"
**change shape across decades** — widest around 1900 when protectorates and princely states are doing most
of the work, narrowest in the Caribbean in 1750.

Nearly free to build: `data.statusAt(year)` already returns `controlDegree`, and
`data.metricsAt(year).byDegree` already returns the counts.

**Data.** Present. `controlDegree` defaults are already binding per `DATA_MODEL` §3.3.

**Lives at.** Layer ids `control:claimed`, `control:administered`, `control:effective`, owned by the map
agent; the readout and the key handling are mine (`app/js/viz/control-defs.js` → `stage-note`).

**The sentence.** *"A quarter of the world was claimed. Under a strict definition Britain actually
administered about half of that, and it was different every decade."*

---

### F8 — The Mechanism Matrix

**Purpose.** Answer THINK 13.1 with a picture, and demote the time slider.

**Behaviour.** A 14 × 9 table: acquisition mechanisms down, departure mechanisms across, a count in each
cell, built entirely from `data.acquisitions` and `data.departures`. Empty cells stay visibly empty — the
scatter is the answer to "is this one phenomenon or several?". Click a cell and the map paints only those
units. Click a row header ("chartered-company") and the map paints all nine of them across three
centuries. Hover is not used. Row and column totals are `<th>` elements with tabular figures, so a student
can read down a column exactly as they would in the book — and then click it.

The app's **default `activeLayer` at boot is `mechanism`**, not year and not status. That single default is
the answer to print #6.

```css
.matrix{ border-collapse:collapse; font:400 var(--fs-small)/1.3 var(--font-sans); }
.matrix td{ font-family:var(--font-mono); font-variant-numeric:tabular-nums; text-align:end;
            border:var(--rule-hair) solid var(--border-subtle); }
.matrix td:empty::after{ content:"·"; color:var(--ink-ghost); }
.matrix td[aria-pressed="true"]{ box-shadow:inset 0 0 0 var(--rule-mid) var(--accent); }
```

**Data.** Present. `data.acquisitions[].mechanism`, `data.departures[].mechanism`, `.units`.

**Lives at.** `app/js/ledger/matrix.js`, `app/css/ledger.css`, slot `overlay` (a plate, not a modal — the
map stays visible above it). Filters via `store.act.setFilter({ mechanism, departure })`.

**The sentence.** *"Nine places were handed to a company, six left because a lease ran out or a mandate
ended, and one left after a war Britain lost — 'the British Empire' is at least four different things."*

---

### F9 — The informal-empire pressure layer

**Purpose.** Stop the map structurally teaching that mid-Victorian Britain was barely imperial.

**Behaviour.** A layer toggle, on by default from 1830 to 1914. `informal-sphere` places get **no fill and
no claimed border** — that distinction is the whole point — but a radial haze anchored on the node, radius
encoding a stated quantity, with the legend naming it: *"radius = British share of this state's foreign
trade, 1875; source: …"*. Then the taught moment: `[PREDICT]` "was Britain more or less imperial in 1860
than in 1900?", commit, then a two-up compare of 1860 formal-only beside 1860 formal-plus-informal.
A permanent caption under the layer reads: **this layer is an argument, not a measurement** — Gallagher and
Robinson (1953), and the standard objection that stretched far enough the concept becomes unfalsifiable.

**Data.** `ar-buenos-aires`, `iran`, `turkey`, `cn-weihaiwei`, `uruguay` exist as units. **ASK
(data-model):** territories with `status: informal-sphere` need `influence[]` —
`{ year, quantity, value, sourceIds }` — and the honest note that the geometry is thin.

**Lives at.** `app/js/viz/informal.js` + `map-overlay`. Compare uses the existing `compareYear` state.

**The sentence.** *"Britain ran Argentina's railways and Persia's debt without colouring either of them
red, and if you only count the red you get 1860 badly wrong."*

---

### F10 — The Complication Gate

**Purpose.** Restore print's ambush: put self-refutation in the path, with no way round it.

**Behaviour.** Four beats in the 30-minute path where **Next is disabled** until the student places a
marker on a two-axis field: *does this weaken / complicate / not affect the claim you just accepted* ×
*how confident are you*. Any placement advances. There is no right answer and the app says so. The four:

1. After the Atlantic chapter — the roughly 20,000 enslaved people who fled to British lines in 1775–83,
   for whom the empire was the road out and the revolution the threat.
2. After Ireland-as-first-colony — Irish people as soldiers, administrators and settlers in the empire, out
   of all proportion to their numbers.
3. After the slave-trade beat — Dahomey, Asante and the Aro networks as suppliers, with the demand, the
   finance, the shipping and the plantation regime still British.
4. After "responsible government" — self-rule for settlers as intensified rule over First Nations, Māori
   and Aboriginal peoples; the dominions as the empire's most permanent form, not its exit.

Markers are stored and shown back in F12. The free-explore escape (`DIDACTIC_SPEC` §8.2) is never removed
and never warns.

**Data.** `complications.json`: `{ id, afterBeat, claimRestated, fact, sourceIds, axisLabels }`.

**Lives at.** `app/js/tours/complication-gate.js` (tours agent's directory — **coordinate**, do not
unilaterally edit), `app/css/tours.css`. **ASK (shell):** a `commitments` object in the store,
`{ [id]: { value, at, kind } }`, persisted to `localStorage` alongside `visited`, with actions `commit`
and `clearCommitments`. F1, F10, F11, F12 and F14 all read it.

**The sentence.** *"I had to say what the 20,000 people who ran to the British lines did to my argument
before the app would let me carry on."*

---

### F11 — The Ratio Line

**Purpose.** Make disproportion something a student gets wrong before they get it right.

**Behaviour.** One horizontal axis, one draggable divider, and a question: *"32 European settlers were
killed in Kenya between 1952 and 1960. Drag the divider to where you think the number of Kikuyu people
moved into guarded villages sits on the same axis."* Commit, then reveal: over a million; 1,090 hanged;
tens of thousands detained; £19.9 million to 5,228 claimants in 2013. The axis is logarithmic and *says so*
in words, because a linear axis would put the settler figure at one pixel and teach nothing. The error
between guess and truth is stored and reappears in the F12 close.

Reused for T5 (£20,000,000 / £0 — the only case where the axis is linear, because the point is the
absoluteness of the zero), T8 (British share of a ~250,000-strong Company army), T14 (population lost vs
area lost in 1947), and the Barbados/North America trade comparison feeding F5.

**Data.** The figures come from `metrics[]` and `consequences.violence.toll` with their required notes.
No number without a range and a reason where a range exists (`DIDACTIC_SPEC` §9.2).

**Lives at.** `app/js/viz/ratio-line.js`, `app/css/viz.css`.

**The sentence.** *"I guessed about twenty thousand. It was over a million, and thirty-two settlers had
been killed."*

---

### F12 — The Closing Argument

**Purpose.** Give the app an ending a book cannot have, because the book does not know who is reading.

**Behaviour.** The tour terminates here; it does not decant to a sandbox. Two columns. Left: the app's
twelve-sentence argument, in one voice, with its stance declared. Right: **the student's own session** —
their 00:00 population guess against 412 million, their four Complication Gate placements quoted with the
minute they made them, their Tension Plate collapse choice and what it discarded, their ratio-line errors,
and the T-items they missed. Then the through-line sentence with four blanks for them to complete, and
the printable revision sheet generated from exactly this. Last card: three arguments to go and have, three
real books, and the 14 dots still on the map.

**Data.** `store.commitments` (F10's ASK), `quizState.answers`, `visited`.

**Lives at.** `app/js/tours/closing.js` (**coordinate with tours agent**), print styles in
`app/css/print.css` (**ASK design-system**: or I ship `@media print` inside my own stylesheet).

**The sentence.** *"At the start I said Britain ruled about a tenth of the world's people. It was closer
to a quarter, and I can now say why I was wrong."*

---

### F13 — The Evidence Ledger

**Purpose.** Let a head of department audit every number in the atlas faster than they can audit a page.

**Behaviour.** `#panel=ledger`. One row per figure in the app: value, range, source (author / work / year /
`kind`), the `supports` sentence, `confidence`, `contested`, and a deep link to where the number appears
in the app. Sortable on every column; **default sort is `confidence: low` first**, then `contested: true`.
A filter chip: *"show only numbers with no range"* — which is where false precision hides. It prints, one
row per line, with the content version string in the header. `node tools/evidence-audit.js` emits the same
table as markdown for someone with no browser and no trust.

The student-visible half: any figure rendered without a registered source shows `[unsourced]` in
`--danger` in the interface, and the statusbar carries the count. A silent missing citation is impossible
by construction.

**Data.** Present — `evidence[]`, `confidence`, `contested`, plus F5's `metrics[]`.

**Lives at.** `app/js/ledger/index.js`, `app/css/ledger.css`, slot `overlay`; `tools/evidence-audit.js`
(**ASK shell**: `tools/` ownership — or it ships as `tools/evidence-audit.js` with the shell agent's
agreement).

**The sentence.** *"I sorted the whole atlas by how confident it says it is, and the shakiest number in it
is the Bengal famine of 1770."*

---

### F14 — The Editor's Note

**Purpose.** Give the app the standing to tell a student they are wrong — specifically, not generically.

**Behaviour.** A named first-person voice in its own register: sans, `--fs-small`, on `--paper-sunk`,
3px `--accent` left rule, never more than 60 words, always signed. It fires **only** against something the
student actually did: a slider they moved, a claim they collapsed, an estimate they gave. *"You chose the
lowest published figure for Partition's dead. The published range runs from about two hundred thousand to
two million. Nobody counted. Choosing the low end is a position — here is who else holds it, and why."*
It never fires on arrival at a page, never congratulates, and never appears twice for the same commitment.

```css
.editor{ font:400 var(--fs-small)/var(--lh-ui) var(--font-sans); background:var(--paper-sunk);
         border-inline-start:3px solid var(--accent); padding:var(--space-md) var(--space-lg);
         max-inline-size:var(--measure-narrow); }
.editor__sign{ font-variant-caps:all-small-caps; letter-spacing:.075em; color:var(--text-secondary); }
```

**Data.** `store.commitments` + a `notes.json` keyed by commitment id and threshold.

**Lives at.** `app/js/editor/index.js`, `app/css/editor.css`, rendering into `stage-note` or beneath the
active plate.

**The sentence.** *"It told me my number was the lowest one anybody publishes, and why somebody would
choose it."*

---

## 3. The three moves only software can make

Not "it's interactive". Three specific operations a printed page cannot perform, each argued on teaching
grounds rather than on impressiveness.

---

### Move 1 — Let the student attempt the simplification, and render what it costs

**What happens.** The Tension Plate (F1) shows four true claims about abolition. Under them: *"Pick the one
you think is the real story."* The student picks — and they will, because sixteen-year-olds want a verdict
and the exam has trained them to produce one. The chosen claim promotes to a full-height column. The other
three slide into a strip headed **what this version has to leave out**, each with the sentence it must
strike through in order for the chosen story to hold. "Britain abolished slavery" has to strike through
*£20 million to the owners, £0 to the people freed*. "It was pure cynicism" has to strike through *the
largest mass petition campaign in British political history to that date*. Then: "put them back".

**Why a page cannot.** Print's move is an instruction: *hold all of the following at once*. That is the
single most sophisticated sentence in the rival chapter and it is also the weakest, because instruction is
not evidence. The page cannot know whether the reader complied, and it cannot show the reader the specific
cost of their specific shortcut, because it does not know which shortcut they took.

**Why it teaches better.** Conceptual-change research is unambiguous (Chi; Vosniadou; `DIDACTIC_SPEC` §4):
a wrong model has to be *activated*, contradicted by evidence the learner processes themselves, and
replaced. "Hold four at once" activates nothing. Letting a student collapse four claims into their
preferred one and then showing them the exact sentences their preference deletes is activation,
disconfirmation and replacement in one gesture — and it is the same gesture for every one of the four
choices, so the student who picks the cynical reading is corrected as firmly as the one who picks the
redemptive reading. This is also, directly, M8 and M11, and it produces the §15 ledger habit the rival
chapter says it wants: *worth it to whom? measured how? compared with what?*

---

### Move 2 — Repaint the entire atlas by a single source, and let the map go blank

**What happens.** Shift-click any tick on the provenance rail, or any source card's title. The atlas
repaints so that **only claims that source can support remain**. Choose the Slave Voyages database and the
Atlantic lights up in dense detail while India goes bare. Choose Colonial Office correspondence and the
map fills with administrative confidence and empties of anything that happened to a person. Choose
*testimony by colonised people* and roughly nine tenths of the map goes blank — Equiano, Mary Prince,
Naoroji, the Congress inquiry evidence, the Mau Mau claimants' statements, and then paper. A counter in
`stage-note` reads: *"claims supported: 41 of 612"*, with a link straight into F13.

**Why a page cannot.** A book's footnotes point outward, one at a time. A book cannot re-set itself with
only one source's claims standing, because setting is a physical act performed once. The rival brief's
point #8 is that interfaces compress attribution into a byline; the answer is not to make the byline
bigger — print already wins on that — but to make attribution an *index the whole artefact can be sorted
by*. That is a database operation and a book is not a database.

**Why it teaches better.** It converts "different archives produce different empires" — CHAMPION §16.3's
own best line, which the chapter can only assert — into something the student watches happen. It teaches
Rubric C4 at level 4 and 5 simultaneously: the *nature and limits* of a source, and at least one silence
in the archive, in one keystroke, without a paragraph of methodology. And it is the strongest available
answer to the fabrication risk in the BRIEF's rule 5, because a source with nothing behind it repaints an
empty map and is instantly visible as empty.

**Buildability.** Every claim already carries `sources[]`; the repaint is a filter over
`data.statusAt(year)` plus the claim index F13 already builds. No new geometry, no new maths.

---

### Move 3 — Let the student search the archive and come back empty

**What happens.** The atlas search box (`store.searchQuery`) indexes not only territories and events but
`silences[]`. A student searching *"Kenya deaths 1954"* gets results — and among them, styled as results
rather than as an error, the absences: *"Records for this period were removed from Kenya in 1963 under the
instructions later known as Operation Legacy. Some were destroyed; others were held at Hanslope Park and
disclosed from 2012 as FCO 141. What survives is one side's account of the other side's deaths."* A
student searching *"names of the people held in the camps"* gets the `name-not-recorded` silence and a
short list of the names we do have, from the 2013 claim, which is short for a reason.

The failure is designed: the search does not return nothing, and it does not return a fabricated
substitute. It returns **an account of the absence, with an agent, a date and an instruction**, and a
`whatWouldSettleIt` line naming the evidence that would change the answer.

**Why a page cannot.** A page can print a paragraph saying the archive was burned. It cannot let a reader
go looking. The difference is the difference between being told a door is locked and putting your hand on
the handle. The rival brief's #7 is the sharpest thing in it — *a deliberately created silence is not a
data type* — and the answer is simply to make it one, and then to give the student the experience of
running into it while trying to do something else.

**Why it teaches better.** Rubric C4 level 4 asks that "at least one silence in the archive is named" and
level 5 asks that the learner "can say what evidence would change a stated conclusion". A search result
carrying `whatWouldSettleIt` does both in the moment the student wanted the number, which is the only
moment they will care. It is also the app's best defence against its own polish: the most authoritative-
looking thing on screen periodically tells the student that nobody knows, and names who arranged for
nobody to know.

---

## 4. What I would cut

Named features a lesser version of this app would ship, and the reason each would make it teach worse.

**1. The autoplaying scramble-for-Africa animation.** The rival brief's #6 and #12 are correct and we
should say so: red flooding across Africa in the 1890s is memorable and teaches nothing except that it
happened fast. **Cut the autoplay.** Keep a *stepped* Africa sequence where each acquisition requires a
keypress and cannot appear without its mechanism glyph and its named counterparty — Asante, Zulu, Sokoto,
Buganda — on screen at the same moment. Speed is the thing that must not be the payload.

**2. The handover countdown clock, the "sun never sets" rotating globe, and the 1922-maximum hero moment
as spectacle.** Each is the most screenshot-able thing we could build and each teaches the shape of the
empire while teaching nothing about its machinery. If the 1922 maximum appears, it appears as T14's
counter-intuitive fact — the peak is *to the right of* 1914 — with a `[PREDICT]` in front of it, or not at
all.

**3. The 3D globe.** It looks expensive and it costs us the single best interaction in the spec. M4's
projection reveal works because the student sees the *lie* and feels the distortion collapse; a globe is
simply correct, which sounds better and destroys the teaching. It also costs label density, keyboard
operation, and print output. Refuse it every time it is proposed, and it will be proposed.

**4. Hover cards as an information channel — including the map's hover card.** `DIDACTIC_SPEC` §5.7
already bans hover-only information; I would go further and delete the map hover card entirely in favour
of a persistent `stage-note` that updates on focus and selection. Hover cards train scanning. Scanning is
the behaviour that loses to a book.

**5. Full-screen modals, anywhere, for anything.** §8.1: the map never disappears. Every plate, ledger,
matrix and parallel-text view in this document compresses the map rather than covering it. The moment we
ship one full-screen modal, the "constant spatial frame" advantage — our biggest structural edge over the
chapter — is gone, and it will not come back, because the second modal is always easier to justify than
the first.

**6. Badges, streaks, XP, a leaderboard, or any score the student can optimise.** Extrinsic reward biases
effort toward the cheapest items, which is precisely the engagement-pressure failure of print #12 turned
inward. And a completion streak on a module about the Middle Passage is indefensible on its own terms.

**7. Any "was the empire good or bad?" slider, thumbs, poll or verdict widget.** `DIDACTIC_SPEC` §1
refuses this objective explicitly and calls the refusal load-bearing. It will be proposed as "engagement"
and as "student voice". It collapses incommensurable claims into a thumbs-up and it is the exact exam
habit the rival chapter's own opening warning exists to break.

**8. A conversational answer box — "ask the empire anything".** Two disqualifying reasons: the BRIEF
requires full offline operation with nothing fetched at runtime, and a generative answer surface is a
citation-fabrication machine, which caps Rubric C4 at 0 and the whole artefact at 2. There is no version
of this that is safe here.

**9. Search as the primary navigation of the first-run experience.** Search stays, and it is where Move 3
lives, but it does not open the app. A search box on the landing screen is §5.3's "door in every wall",
handed to a novice with no schema, and it is the fastest way to arrive at the Scramble for Africa without
knowing what a protectorate is.

**10. Photographic atrocity imagery anywhere except as the evidence under discussion**, per §7.3 — and no
ambient audio or narration at all. Narration imposes a pace on material that needs re-reading, cannot be
skimmed back over, and a soundtrack under a famine chart is a decision nobody should have to defend.

**11. A "territory of the day", a randomiser, or an achievements map of places visited.** They convert an
atlas into a collection, and a list of territories is exactly what §1 refuses to make students memorise.

---

## 5. What this costs, and the four asks

**Asks that cross ownership boundaries** (stated here rather than acted on):

| Ask | Owner | What |
|---|---|---|
| `stage-lower` mount slot | shell | The lower ~58% of the map stage, so plates compress the map instead of covering it. Fallback: absolute positioning inside `overlay`. |
| `commitments` in the store | shell | `{ [id]: { value, at, kind } }`, persisted to `localStorage` beside `visited`; actions `commit`, `clearCommitments`. F1, F10, F11, F12, F14 depend on it. |
| `silences[]`, `metrics[]`, `influence[]`, and NOP fields on citations | data-model | §2 F3, F5, F9, F2. Follow `DATA_MODEL` §17 amendment procedure. |
| `ask:sizeBy`, `ask:paintSilence`, `control:*` layer ids | map | Three bus contracts and three layer ids; all three read fields `data` already exposes. |

**The risk I would flag loudest.** F1, F4, F8 and F13 are all *plates* — dense, typographic, non-scrolling
surfaces. If any of them ships as a scrolling panel or a set of tabs, its verdict in §1 reverts to
CONCEDED immediately and silently. The plate discipline is the whole design. It is also the thing that will
be eroded first, one responsive breakpoint at a time, by whoever is fixing a layout bug at the end of a
long day. Put it in the component checklist: **four claims in a plate stack; they never tab.**
