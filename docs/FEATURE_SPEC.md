# FEATURE SPEC — what we are building, and how we beat the chapter

**Status: normative for the build wave.** This document is downstream of `BRIEF.md`,
`docs/DIDACTIC_SPEC.md` (pedagogy), `docs/ARCHITECTURE.md` (module contract),
`docs/DATA_MODEL.md` (dataset) and `docs/DESIGN.md` (tokens). Where it conflicts with any of those
four, **they win and this file is the bug**. Where it conflicts with the three counter-designs in
`docs/counter/`, this file wins: those were proposals, this is the decision.

**Owner:** the feature/spec track. **Consumers:** every builder. **Amendments:** a diff to this file
with a justification and a downstream-impact list. Anything touching DIDACTIC_SPEC §2 (the spine),
§3 (the twenty) or §6 (the rubric) additionally requires a §9.3 amendment there **first**. No such
amendment is filed and none is needed: **the four-phase spine, the 30-minute path, the twenty and
the eighteen misconceptions survive this document intact.**

Three things were settled before anything below, and no builder may re-open them:

1. **The spine is the four empires** (DIDACTIC_SPEC §2.1): Atlantic, Company, Imperial, Dissolution.
   Mechanism, evidence and silence are how we *teach* it. They are not a fifth engine and they are
   not the primary index of the atlas. A design that makes mechanism the top-level index deletes
   LO1, T1 and chronological control, and it was rejected for exactly that.
2. **The default state is the guided path**, not the sandbox (DIDACTIC_SPEC §5.3). Free exploration
   is one click away, warns nothing, blocks nothing, and feeds the same record.
3. **No invented number ever renders.** Not an interpolated cartogram value, not a counterfactual
   sailing time, not a counterfactual quantity inside an animation. A fabricated figure caps rubric
   C4 at 0 and the artefact at 2. Where we have no figure we draw a hole and say so.

---

## 1. THE ANSWER TO PRINT

The fifteen charges in `docs/rival/WHY_PRINT_WINS.md`, each with the mechanism we are committing to
build, the piece that owns it, and an honest label.

**CONCEDED** = print wins; we contain the loss and say so in the app.
**NEUTRALISED** = we reach parity by a different route; we claim no more.
**REVERSED** = we teach this better than the page can.

| # | Print's charge | Verdict | Our committed mechanism | Owner |
|---|---|---|---|---|
| **1** | A sustained causal argument survives on a page and dies in a tooltip | **NEUTRALISED** | Four parts. (a) **Essay panels**: every tour chapter ships a 250–400 word argument panel with its connectives visible, rendered in `dossier` with the map still on screen; QA counts words and fails a chapter without one. (b) **The mechanism run** (Move 2): the T7 loop *revenue → sepoys → conquest → revenue* is stepped, broken and refused — a procedure executed, not a clause asserted. (c) **`causalLinks[]`** as a first-class object: a "because" chip on a claim navigates to the claim it caused, so causation survives a panel change. (d) **The Ledger** accumulates the thesis where a chapter's thesis actually accumulates — in the reader — and the Close reassembles it. **What we do not get back:** 900 unbroken words in which the eye picks its own route through a subordinate clause. We ship ~3,500 words of real prose and stop claiming the prose is the interactive part. | P05, P08, P21 |
| **2** | A chapter ends; an explorable map has no ending, so nothing lands | **REVERSED** | **The Any-Exit Close (P21)**, available at any second via the always-present Close control or `Esc Esc`. It prints the twelve-line argument: lines this student can defend are set in full and carry *their own numbers, their own first wrong guesses, their own gate choices and their own dissents*; lines they cannot are set greyed with the evidence missing and its price in seconds. The last line is a field: the §2.3 through-line in their words, signed, which becomes the header of the printed revision sheet. Meanwhile **the Unfinished Sentence** has run in the statusbar since second one, with blanks, so the ending is visible from the beginning and clicking a blank navigates to the beat that fills it. A chapter has one conclusion, true only for the reader who reached page 40. We compute a truthful conclusion from partial evidence, and a conclusion that names its own gaps teaches better than one that pretends there are none. | P21 |
| **3** | A reader holds three paragraphs in tension; a click-driven UI serialises | **REVERSED** | **The Tension Plate (P08)**: a 2×2 field, four claims, no tabs, no accordion, no scroll, nothing behind a hover, all four permanently rendered while the map compresses above and stays live. Landing on any figure lights the same figure in the other three cells, on the timeline and on the map. Then the move print cannot make: *"pick the one you think is the real story"* — the chosen claim promotes, the other three slide into a strip headed **what this version has to leave out**, each showing the sentence it must strike through. "Britain abolished slavery" must strike through *£20m to the owners, £0 to the people freed*; "it was pure cynicism" must strike through *the largest mass petition campaign in British political history to that date*. Print instructs you to hold four at once and cannot know whether you did. We let the student attempt the simplification they were going to make anyway, and price it. **Standing concession:** below 62rem the plate stacks. It never becomes tabs, and print CSS restores all four to one page. | P08, P16 |
| **4** | A map makes territory the unit and area the weight — the exact errors the chapter corrects | **REVERSED** | Three mechanisms, all in the map's own grammar. (a) **The Definition Switch** (Move 1): keys `1`–`4` hold the year and change what "British" means — claimed `controlDegree ≥1` / administered `≥3` / controlled `=5` / influenced `informal-sphere` — with km², unit count and population recomputed and printed each time. (b) **Weight mode**: unit size stops meaning land area and starts meaning a sourced quantity, scaled about each unit's own centroid so positions never move; units with no cited figure draw as a hole, never as zero and never interpolated. (c) **The Stitching view**: the 101 units flagged `tiny` become fixed-screen-size nodes with the coaling and cable network between them, landmasses ghosted — CHAMPION §4's own best sentence, rendered. **And one encoding law:** `controlDegree` is a *threshold*, not a second visual channel. Status carries fill and texture; degree decides what is drawn at all. Hatch-density ramps on Gibraltar and Barbados are illegible and are banned. | P02, P06, P17 |
| **5** | Informal empire is unmappable, so the app reproduces the lie it exists to expose | **NEUTRALISED** | **The pressure layer (P06)**, on by default from 1830 to 1914. `informal-sphere` places get **no fill and no claimed border** — that distinction is the content — but a radial haze anchored on the node whose radius encodes one stated, cited quantity, with the legend naming the quantity, the year and the source. Then the taught moment: `[PREDICT]` *"more or less imperial in 1860 than in 1900?"*, commit, then a two-up compare of 1860 formal-only against 1860 formal-plus-informal (P18), and press `4`. A permanent caption reads **this layer is an argument, not a measurement**, names Gallagher and Robinson (1953) and names the standard objection that stretched far enough the concept becomes unfalsifiable. **Why not REVERSED:** our geometry has `ar-buenos-aires`, `iran`, `turkey`, `cn-weihaiwei`, `uruguay`, `thailand`, `oman`, `macau` and no treaty-port polygons. We will not pretend a haze is a measurement. | P06, P18 |
| **6** | The mechanism column is the pedagogy; a time-slider teaches *when* and unteaches *how* | **REVERSED** | **The Mechanism Matrix (P09)**: a real 14 × 9 contingency table, acquisition mechanisms against departure mechanisms, counts in every cell, built entirely from `data.acquisitions[].mechanism` and `data.departures[].mechanism`. Empty cells stay visibly empty, because the scatter *is* the answer to THINK 13.1. Predict the tally before it reveals; click a cell and the map paints only those units; click a row header and the map paints all nine chartered-company territories across three centuries at once. Sorting by "how left" is followed, unskippably, by the counter-line: mostly negotiated — **and Kenya, Malaya, Cyprus, Aden, Palestine**. A printed table cannot be counted for you, cannot be cross-tabulated, and cannot recolour a map when you sort it, which is why in practice most students never do the counting the table exists for. | P09, P06 |
| **7** | Print can render a silence; software must always display something | **REVERSED** | `silences[]` becomes a data type with a required named `agent` — records do not get destroyed, people destroy them — and renders four ways. (a) **The Hole**: a unit whose record was destroyed draws its coastline and leaves its interior as bare paper. On a filled map, absence is the loudest mark available; the legend entry reads *"no record was allowed to survive here"*, never "no data". (b) **The excision**: inside rendered prose, an ink rule of the measured width of the removed text, clickable for who removed it, when, and under what instruction. (c) **The open range bar**: a lower tick, an upper end that fades with no terminal, and the words *no one counted* — set on the same axis as Amritsar's counted 379, so the two shapes teach the epistemology. (d) **The search that comes back empty** (Move 3): searching *"Kenya deaths 1954"* returns the absence *as a result*, with its agent, its date, its 2012 disclosure and a `whatWouldSettleIt` line. Plus the **evidence lens**: filter the atlas by source and every claim that rests only on post-2011 disclosure greys out — computed from our own citation years, captioned as exactly that, never as a dramatised deletion of things Anderson and Elkins established in 2005 from other records. | P16, P02, P07 |
| **8** | A quotation on a page carries its provenance; in an interface it becomes decoration | **REVERSED** | **One function renders every quotation in this app** (`renderSource`), and it *requires* four fields — nature, origin, purpose, and **what it cannot tell you** — printed **before** the quote in DOM order and above it visually, at the same type size. Missing any field renders `[unsourced]` in `--danger`, in front of the student, and increments a counter in the statusbar. Then the two moves print cannot make: **the Attribution Gate** — on the three spine sources the quotation is masked until the student answers *what was this made for?* and commits, with their answer written to the Ledger; and **the provenance rail**, a sticky strip of ticks beside every prose panel textured by `citation.kind`, so a passage that is four official records and no testimony *has a visible shape* before a word is read. Footnote numbers do not aggregate into a picture. | P16 |
| **9** | Two texts side by side: Waitangi is invisible at map scale | **REVERSED** | **Parallel Texts (P16)**, two columns at `--fs-prose` serif with a hairline between, in the stage, never a modal — matched to print on print's own ground — plus three things a page cannot do. **Segment locking**: focus "all the rights and powers of Sovereignty" and *te Kawanatanga katoa* lights in the other column, because the corresponding clauses are never on the same line and never will be. **A third column on demand**: Kawharu's 1989 back-translation of the Māori text, which print at 3 × 48ch cannot carry. **The afterlife coupling**: the texts stay fixed while the New Zealand units beneath recolour 1840 → the 1863 New Zealand Settlements Act confiscations → the Tribunal, with the hectares counted in the stage note. The translation dispute acquires an acreage while the words that promised otherwise are still on screen. Second and third instances: Berlin's "effective occupation" clause against what was said to the chiefs whose land it allocated; the Hunter Commission count against the Indian evidence. | P16, P02 |
| **10** | Disproportion is a prose fact, not a spatial one | **REVERSED** | **The Ratio Line (P08)**: one axis, one draggable divider, and a question *before* any number appears — *"32 European settlers were killed in Kenya between 1952 and 1960. Drag the divider to where you think the number of Kikuyu people moved into guarded villages sits on the same axis."* Commit, then reveal: over a million villagised; 1,090 hanged; tens of thousands detained; £19.9m to 5,228 claimants in 2013. The axis is logarithmic and says so in words, because a linear axis puts the settler figure at one pixel and teaches nothing. Print's pedagogy is that the reader does the division; most do not. Ours is that the reader commits to a division and is wrong, which is hypercorrection and the engine of DIDACTIC_SPEC §4. Same component runs T5 (£20,000,000 / £0, linear, because the point is the absoluteness of the zero), T8 (the British share of a ~250,000-strong Company army) and T14 (population lost against area lost in 1947). | P08 |
| **11** | A book ambushes the reader; an app's users route around what they don't click | **NEUTRALISED** | **Complication Gates (P05)**: five beats on the spine's *only forward edge* — never on a side road — where Next is disabled until the student places the damaging fact on a two-axis field (*weakens ↔ complicates ↔ doesn't affect* × *how confident*). Any placement advances; there is no right answer and the app says so; there is no dismiss button, because an acknowledgement is not a commitment. And the part print cannot do: **the gate is aimed** — it fires on a Ledger predicate, so the complication that appears is the one that damages the claim *this* student just made, and the Close names the ones they declined. **Why not REVERSED:** the free-explore escape stays (DIDACTIC_SPEC §8.2). Removing it to force compliance would teach worse, and a reader can close a book too. | P05, P21 |
| **12** | Engagement metrics will quietly select against the material that matters most | **CONCEDED** | This is true about product process, and no feature fixes it. We contain it three ways and claim nothing more. (a) **You cannot optimise a number you never collect.** The metrics schema is fixed at seven fields — path completion, first-attempt accuracy per T-item, prediction-error rate per `[PREDICT]`, gate placements, through-line completion, delayed-retrieval accuracy on return, and Close-reached-at-minute — written to `localStorage`, never to a network, and a CI test fails the build if any other key is written. There is no dwell time, no click count, no session length, no "most popular territory". (b) **Structural rule:** load-bearing content lives on the spine or inside a gate; nothing load-bearing is a pin. Naoroji's drain, the collaboration thesis, 1909 → 1947 and THINK 15.1 are beats and gate contents, so they cannot be routed around and their value cannot be measured in taps. (c) **The drama gate** (P12): no animation of consequence plays before a committed prediction. A future owner can delete the test. This is governance with an architectural lock, not a law of physics. | P12, P19, P20 |
| **13** | A page carries its own evidence base; an app buries it in a build | **REVERSED** | **The Evidence Ledger (P20)** at `#panel=evidence`: one row per figure in the atlas — value, range, source (author / work / year / `kind`), the `supports` sentence, `confidence`, `contested`, the shard path, and a deep link to where the number appears. Sortable on every column; **default sort is `confidence: low` first, then `contested: true`**, because that is what a head of department wants. A filter chip reads *"show only numbers with no range"*, which is where false precision hides. It prints one row per line with the content version in the header, and `node tools/evidence-audit.js` emits the same table as markdown for someone with no browser and no trust. Behind it, `node tools/validate-data.js --strict` in CI already fails a toll with no note, a low-confidence claim with no `contested.note`, a page locator, a future-dated citation and an invented unit id. A wrong row here is greppable, rendered beside its provenance, and reported against a stable error code. The chapter's wrong sentence is none of those. | P20 |
| **14** | Print has one version; software has a deploy — and curriculum is built on permanence | **CONCEDED** | We do not win this. Containment: no framework, no build step, no CDN, everything vendored, so the app is a folder that runs from a memory stick on a school intranet in 2031; a **content version string** in the footer, in every print output and in every deep link; **frozen hash routes** documented as a contract in ARCHITECTURE §8, so a teacher sets `#year=1765&sel=bengal` the way they set a page number and it means the same thing in March; a print stylesheet on every panel; a per-school-year frozen copy in the repo. **The honest position, stated in the Methods panel:** the permanent artefacts are the *printed outputs* — the revision sheet, the evidence ledger, the parallel-text pages, the exported map and timeline. The app is the machine that generates a student's page; the page is what survives a browser upgrade. | P20, P19 |
| **15** | Print has the standing to tell the reader they are wrong; an interface flatters by construction | **REVERSED** | **The Margin (P16)**: one named first-person voice, one fixed slot (`stage-note`), its own typographic register, sixty words maximum, never a modal, at most six times a session with a 90-second cooldown, always signed. One absolute rule: **it only speaks when it has the student's own record to quote.** *"You put Partition's dead at 200,000. That is the lowest published figure; the highest is about two million. Choosing the low end is a position — here is who else holds it and why."* / *"You've spent four minutes in Africa and none in India. Three-quarters of the people Britain ruled were in India. Your mental map is the pink map's mental map."* It earns the right the way the chapter does — by declaring its stance in the About panel and defending it — plus something print has not got: a **push back** control that records the student's disagreement verbatim and prints it in the Close, under their name, unedited. Print can tell *a* reader they are wrong. We can tell *this* reader what they said, when, and what the evidence was. | P16, P21 |

**Tally: 10 reversed, 3 neutralised, 2 conceded.** The two concessions (12, 14) are about institutions
and process, not about teaching. Both are stated to the user inside the app, in the Methods panel,
in our own words.

---

## 2. THE FEATURE SET — twenty pieces

Every piece below has an owner, one directory, a definition of done and acceptance tests written so
a hostile critic can run them against the app at `http://localhost:8777/app/`. Tests marked
**[headless]** are expected to be automated as a scenario under `tools/scenarios/`.

Read these three rules before your piece:

- **The map never disappears.** No full-screen content modal exists in this app. Plates, matrices,
  ledgers and parallel texts compress the map; they do not cover it.
- **Nothing essential is behind a hover, a tab or an accordion.** Where print puts four things on a
  page, we put four things in a grid; under 62rem they stack and they never become tabs.
- **A defect is student-visible.** An unsourced number renders `[unsourced]` in `--danger` in front
  of a sixteen-year-old. Auditability only a developer can see is not auditability.

---

### P02 — Map rendering and geography
**Owner:** map · **Directory:** `app/js/map/`, `app/css/map.css`

**Purpose.** Draw the one persistent object every fact is filed on, and make it an exhibit under
cross-examination rather than a poster.

**Student-visible behaviour.** A hand-tinted engraved plate: warm paper, `--map-coast` hairline on
every unit in both themes, flat status fills plus the assigned `--tex-*` texture, `partial: true`
drawn hatched. Pan and zoom with pointer, wheel, and keyboard (`+`/`-`/arrows); `view` persists to
the URL. Two projections — Mercator and an equal-area (Equal Earth) — with a toggle that morphs
between them in `--dur-deliberate` and cross-fades under reduced motion; **this is the app's
signature interaction and it fires at 00:27 in the guided path, not at the start.** Selection is
never carried by fill alone: a selected unit gets the `--map-*-stroke` outline. Tiny units (101 of
302 carry `tiny: true`) always draw at a minimum 10px mark and a 44px hit target, so Gibraltar,
Malta, Aden, Singapore, Hong Kong Island, Ascension and Barbados are never sub-pixel. Weight mode
scales each unit about its own projected centroid (`translate(cx,cy) scale(√(v/vRef)) translate(-cx,-cy)`)
— positions never move, so the spatial schema survives the re-encoding. A unit with no cited figure
for the active metric draws with the absence hatch, never at zero. Silence units draw coastline-only,
no fill.

**Encoding law (binding on every other piece).** `status` → fill + texture. `controlDegree` → a
*threshold* that decides what is drawn at all, never a second visual channel. `tenure` → the
single-hue `--tenure-1…7` ramp, never a categorical read. Colour is never the only signal.

**Data consumed.** `data.statusAt(year)` (`status`, `controlDegree`, `partial`, `circa`, `contested`,
`since`, `tenureYears`), `data.geo`, `data.unitMeta` (`centroid`, `point`, `area_km2`, `tiny`,
`bbox`), `silences[]`, `metrics[]`.

**Files owned.** `app/js/map/{index,render,projection,interaction,hit.js}`, `app/css/map.css`.

**Depends on.** Shell (`store`, `data`, `bus`), P11 tokens, geometry. Honours bus contracts:
`ask:flyTo`, `ask:sizeBy {metric, year, values, caption}`, `ask:paintSilence {unitIds}`,
`ask:paintUnits {unitIds, reason}`, `map:setProjection`, `map:setDefinition`.

**Acceptance tests.**
1. **[headless]** At `#year=1913`, every drawn unit has a coastline stroke in both `paper` and
   `lamplit`; screenshot both and diff against the palette: no fill is `#000` or `#fff`.
2. **[headless]** `#year=1913&def=claimed` and `#year=1913&def=controlled` produce a different set of
   painted units, and the count difference matches `data.metricsAt(1913).byDegree` exactly — no
   hard-coded totals anywhere in the module.
3. Zoom to world scale at 1,000px wide: Gibraltar, Malta, Ascension, Barbados, Aden, Singapore and
   Hong Kong Island are each individually clickable and individually keyboard-focusable, and each
   reads its name, status and control degree on focus.
4. Toggle the projection: Canada's drawn area shrinks visibly, no unit changes colour or selection
   state, and under `data-motion="reduced"` the change is a cross-fade with no tween.
5. Weight mode with a metric that only ten units carry: exactly those ten scale, every other unit
   draws with the absence hatch, and **no interpolated value exists anywhere in the module** (grep
   the source: no `lerp` over a metric series).
6. **[headless]** Zero console errors and zero failed requests across a 1600→1997 scrub.

---

### P03 — Time control and playback
**Owner:** timeline · **Directory:** `app/js/timeline/`, `app/css/timeline.css`

**Purpose.** Make time a manipulable dimension, and make the four-phase spine visible under it at all
times.

**Student-visible behaviour.** A full-width scrubber under the map showing 1600–2027 with tabular
year figures. **The four-colour spine band sits beneath it permanently** (T1): scrubbing lights the
active phase or phases, and the bands **overlap where the phases overlap** — 1600–1833 shows Atlantic
and Company lit together, 1815–1833 shows three. The overlap is rendered, never tidied into a relay
race. Event ticks sit on the axis; `changedStatus` events render heavier. Play/pause at `Space`, speed
0.25×–16×, `←`/`→` nudge one year, `Shift+←/→` jump to `data.nextChangeYear`, `Home`/`End` to bounds.
Contested and `circa` dates render with the `num--contested` treatment and a `chip--warn` naming why —
never a silent pick. A year with a soft precision says so in the stage note. Playback is 700ms per
year (`--dur-map-year`) and stops dead under reduced motion in favour of stepping.

**Data consumed.** `data.timeline()` (`cuts`, `events`, `eventsByYear`, `unitsByYear`,
`territoriesByYear`), `data.nextChangeYear`, `data.readDate`, `data.bounds`, phase boundaries from
DIDACTIC_SPEC §2.1.

**Files owned.** `app/js/timeline/{index,scrubber,spine-band,ticks}.js`, `app/css/timeline.css`.

**Depends on.** Shell store (`year`, `playing`, `speed`, `bounds`, `compareYear`), P02 for the paint.

**Acceptance tests.**
1. The spine band is visible in every state of the app including free-explore, tours, compare and the
   Close. Kill the tours module and it is still there.
2. Scrub to 1820: Atlantic, Company and Imperial bands are all lit simultaneously and the band's
   own caption says three engines are running.
3. **[headless]** `Shift+→` from 1856 lands on the next year anything changes, and that year equals
   `data.nextChangeYear(1856, 1)`.
4. Every contested or `circa` date visible on the axis carries a visible marker and a reason on focus;
   a date object with soft precision and no `note` fails `validate-data.js`, so none can reach here.
5. **[headless]** A 600-frame scrub costs under 16ms per frame at 1440×900 with the full dataset.

---

### P04 — Territory dossier
**Owner:** panels · **Directory:** `app/js/panels/`, `app/css/panels.css`

**Purpose.** Answer, without scrolling, the four questions a student actually has about a place: what
was this, legally; who took it and from whom; who was here and what did they do; how did it end.

**Student-visible behaviour.** Selecting a territory opens the dossier in the `dossier` slot (a bottom
sheet under 62rem). Above the fold, always, no scroll: **(1)** the name in use at the current year,
with `namesOverTime.usedBy` making it clear who used it; **(2)** the legal status at this year, in
words, with `howControlWorked`, `governedFrom`, `localLegislature` and **`franchise` — who could
actually vote**; **(3)** the acquisition line: mechanism, `how` in plain verbs, the named
counterparties who lost, the instrument if there is one; **(4)** the departure line with
`independence_mechanism` — the word "granted" appears nowhere in this app outside a quotation.
Below the fold: `local_actors[]` (**required non-empty**; a territory with an empty array fails the
build), `pedagogy.hook`, `pedagogy.misconception` as a belief/correction pair, key dates, evidence
with `renderSource`, contested notes, and because-chips from `causalLinks[]` that navigate to the
claim this one caused. Every substantive fact carries a `claimId`; opening one stamps a `found` entry
in the Ledger, which is what converts a later spine beat from presentation into retrieval (§3).
An India-shaped dossier opens with a **company seal, not a crown** (T6), and the princely-states
toggle lives here (T11).

**Data consumed.** The normalised territory in full: `namesOverTime`, `spans[]` (`label`, `note`,
`governedFrom`, `localLegislature`, `franchise`, `howControlWorked`), `acquisitions[]`,
`departures[]`, `consequences`, `local_actors[]`, `pedagogy`, `evidence[]`, `confidence`, `contested`,
`causalLinks[]`, `silences[]`, `data.territoryAt(id, year)`.

**Files owned.** `app/js/panels/{index,dossier,fields,claims}.js`, `app/css/panels.css`.

**Depends on.** P16 (`renderSource`), P21 (`ledger:append`), P02 (selection), P17 (status vocabulary).

**Acceptance tests.**
1. Open any territory at 1,280×800: name, legal status, how it was taken and how it ended are all
   visible without scrolling, and the franchise line is present or explicitly reads "unknown".
2. Grep the built dossier output for the banned strings in DIDACTIC_SPEC §7.1 (`acquired`, `pacified`,
   `native`, `unrest`, `granted` as a mechanism, `mixed legacy`): zero hits outside quotation marks.
3. Every dossier renders at least one named non-British person or institution. A shard with an empty
   `local_actors[]` fails `validate-data.js`, and the panel renders `[missing local actors]` in
   `--danger` rather than hiding it.
4. Open Egypt and step 1882 → 1914 → 1922 → 1956: the status line changes four times and names four
   different legal labels (T12).
5. A because-chip on any claim navigates to the caused claim and restores the map state where its
   evidence lives; Back returns exactly where you were.
6. Opening a fact in free-explore and later meeting it on the spine converts that beat to retrieval
   (verifiable: the beat's prompt text changes and the Ledger holds a `found` entry).

---

### P05 — Guided narrative tours
**Owner:** tours · **Directory:** `app/js/tours/`, `app/css/tours.css`

**Purpose.** Ship DIDACTIC_SPEC §8 — the 30-minute lesson — as the app's default state, and own the
clock that keeps it to 30 minutes.

**Student-visible behaviour.** Five chapters on one screen: the map stays, the panels change, nothing
navigates away. The beats, times and payloads are §8 verbatim and are not up for redesign: the hook
at 00:00, the spine at 00:02, the Atlantic at 00:05, the Company at 00:10 (the longest chapter,
deliberately), the imperial empire at 00:16, dissolution at 00:22, retrieval and repair at 00:27, the
close at 00:29. **One T-number per beat**; a beat carrying two is over budget and must be split.
**No beat passes without a named non-British actor.** Every chapter ends with a 250–400 word essay
panel — argument, not caption, connectives visible — available but not blocking. Five **Complication
Gates** sit on the forward edge between chapters, each disabling Next until the student places the
damaging fact on the weakens/complicates/doesn't-affect × confidence field: (1) African states and
merchants as active suppliers, and the ~20,000 enslaved people for whom British lines in 1775–83 were
the road out; (2) Irish people as agents of empire as well as its first subjects; (3) responsible
government as intensified rule — the Numbered Treaties, the residential schools, the TRC's "cultural
genocide", 2015; (4) Hong Kong 1997, which the affordability model the student has just assembled
does not explain; (5) THINK 15.1 — the balance sheet assumes costs and benefits fell on the same
people. Declining is allowed, recorded, re-offered and named at the Close. Three variants ship: the
8-minute (beats 1, 2, the Company mechanism, the exit-type map, the close), the 30-minute default, and
the 60-minute (plus essays, worked exam paragraphs, one regional deep-dive, historiography cards).
Free-explore is reachable from every beat, warns nothing, blocks nothing, and carries the beat's open
question into the stage note.

**Data consumed.** `beats[] { id, t, lo, chapter, core, prereq, cost_s, mapState:{year, layer, sel,
def, view}, kind:'present'|'retrieve'|'predict', actor, essay }` in `app/js/tours/tours.json`;
`gates.json`; the mechanism objects (P08); everything the other pieces render.

**Files owned.** `app/js/tours/{index,runner,beats,gates,essays}.js`, `app/js/tours/*.json`,
`app/css/tours.css`.

**Depends on.** Everything. Tours is the piece that points at the others; it owns no rendering that
another piece already owns.

**Acceptance tests.**
1. **[headless]** A scripted run of the 30-minute path completes in under 45 minutes of wall clock at
   median interaction speed, and the transcript prints the beat boundaries against §8's times. A path
   that cannot be completed in 45 minutes is a C12 disqualifier and fails this piece outright.
2. Every beat in `tours.json` has exactly one `t` value and a non-empty `actor` naming a non-British
   person or institution. A CI test asserts both across all beats.
3. Each of the five chapters has an `essay` between 250 and 400 words; CI counts them.
4. At each of the five gates, `Next` is disabled and unfocusable until a placement is made; the
   placement is written to the Ledger with the minute; declining writes `verdict: 'declined'` and the
   Close names it.
5. Leaving a beat for free-explore keeps the spine band and the map, carries the open question into
   `stage-note`, and returns to the same beat with no loss of state.
6. **[headless]** The 8-minute variant runs beats 1, 2, the Company mechanism, the exit map and the
   close, in that order, with no dangling references.

---

### P06 — Thematic layers
**Owner:** layers · **Directory:** `app/js/layers/`, `app/css/layers.css`

**Purpose.** Same data, many encodings — the thing a book cannot do — with every encoding labelled
so that a re-encoding is never a fresh lie.

**Student-visible behaviour.** A layer switch in `toolbar`, keyboard-reachable, with these layers and
no others without an amendment:

| Layer | What it paints | Data |
|---|---|---|
| `status` (default) | the ten-colour legal-status palette | `statusAt().status` |
| `control` | the Definition Switch: claimed `≥1` / administered `≥3` / controlled `=5` / influenced (`informal-sphere`) on keys `1`–`4` | `controlDegree` |
| `mechanism` | how it was taken — the 14 acquisition mechanisms | `acquisitions[].mechanism` |
| `exit` | how it left — the 9 departure mechanisms, `[PREDICT]` before reveal | `departures[].mechanism` |
| `tenure` | how long it was held, `--tenure-1…7` | `since`, `tenureYears` |
| `informal` | the pressure haze, on by default 1830–1914, radius = one cited quantity | `influence[]` |
| `system` | the stitching: `tiny` units as fixed-screen nodes, cables and coaling routes, landmasses ghosted | `routes.json` |
| `resistance` | rebellion and refusal pins — **cannot be switched off during the slavery beat** (T4) | events `kind: revolt/massacre` |
| `war-service` | troops raised and where they served, 1914–18 and 1939–45 (M16) | `metrics[]` |
| `weight` | size by a cited quantity instead of area | `metrics[]` |

Every layer change updates the legend's one-sentence definition (P17) and the map's provenance byline.
The `system` layer draws real nodes and real dated links only — **there is no reachability simulation,
no sailing-time recomputation and no counterfactual routing**; cutting Suez in 1956 or losing Singapore
in 1942 is drawn as a cut in a line with the dated consequence stated in prose, not as a computed
model.

**Data consumed.** As above, plus `data.metricsAt(year).byRegion/byStatus/byDegree` for the readouts,
`app/js/layers/routes.json` (`nodes[{unitId, role, fromYear, toYear, sourceIds}]`,
`links[{a, b, kind:'cable'|'coaling'|'route', fromYear, toYear, sourceIds}]`).

**Files owned.** `app/js/layers/*.js`, `app/js/layers/routes.json`, `app/css/layers.css`.

**Depends on.** P02 (painting), P17 (legend copy), P16 (`influence[]` citations), P08 (weight values).

**Acceptance tests.**
1. Press `1`,`2`,`3`,`4` on a held 1860: the map repaints four times, the year never changes, and the
   `influenced` view is visibly the largest of the four.
2. **[headless]** For any layer, the legend's definition sentence, the stage-note byline and the
   painted set agree; a layer with no definition sentence fails to register.
3. The informal layer is on by default at 1860 and its caption reads "this layer is an argument, not
   a measurement" with Gallagher & Robinson (1953) and the unfalsifiability objection both named.
4. In `system` view, every one of Gibraltar, Malta, Aden, Ceylon, Singapore, Hong Kong, the Falklands,
   St Helena and Ascension is a node at ≥44px hit target, and every drawn link carries a `fromYear`
   and at least one `sourceId`.
5. Grep `app/js/layers/`: no breadth-first search, no distance budget, no `nominalDays`, no computed
   counterfactual anything.
6. During the Atlantic slavery beat, the resistance layer cannot be turned off; the control is
   present, disabled, and says why.

---

### P07 — Search and wayfinding
**Owner:** search · **Directory:** `app/js/search/`, `app/css/search.css`

**Purpose.** Let someone who knows what they want find it in two seconds — and let someone looking for
a number that does not exist find out *why* it does not exist.

**Student-visible behaviour.** `Ctrl/Cmd+K` opens a lookup over territories, units, events, people and
**silences**. It is not on the landing screen and it is not the primary affordance: a prominent search
box invites a novice to arrive at the Scramble before they know what a protectorate is. Results are
typed and labelled (place / event / person / **absence**). An absence renders *as a result*, in the
same list, with its agent, its date, the instruction it was destroyed under, what was later disclosed,
and a `whatWouldSettleIt` line. Choosing a result sets the whole map state — year, selection, layer —
not just a scroll position. Aliases and historical names resolve (`aka[]`, `namesOverTime`), so
"Ceylon", "Sri Lanka", "Rhodesia" and "Zimbabwe" all land somewhere sensible with the name-in-use for
that year shown. Every result carries the year it is being shown at.

**Data consumed.** `data.search(q, {limit, year})`, `data.byId`, `aka[]`, `namesOverTime`,
`data.events`, `local_actors[]`, `silences[]`.

**Files owned.** `app/js/search/*.js`, `app/css/search.css`.

**Depends on.** P16 (`silences[]`), P02 (state restore).

**Acceptance tests.**
1. Search "Kenya deaths 1954": the result list contains at least one `absence` result naming Operation
   Legacy, a named agent, the 1963 removal and the FCO 141 disclosure from 2012 — and it is styled as
   a result, never as an error or an empty state.
2. Search "Ceylon" at year 2000 and at year 1900: both return the same territory, each labelled with
   the name in use at that year.
3. The landing screen contains no search input. `Ctrl+K` opens it from any state, `Escape` closes it,
   and focus returns to where it was.
4. Choosing a result restores year, selection and layer together; the URL reflects all three.
5. **[headless]** A query with no match returns a written "nothing here, and here is what to try"
   state — never a blank panel.

---

### P08 — Data visualisation
**Owner:** viz · **Directory:** `app/js/viz/`, `app/css/viz.css`

**Purpose.** Make magnitudes mean something, make uncertainty visible, and hold incompatible-feeling
true claims in one field without serialising them.

**Student-visible behaviour.** Six components, and nothing else without an amendment.

- **The Ratio Line** — one axis, one draggable divider, a committed guess *before* the reveal.
  Logarithmic where the spread demands it and it says so in words; linear for T5 because the point is
  the absoluteness of the zero. Runs Kenya's disproportion, T5 (£20,000,000 / £0), T8 (the British
  share of the Company army) and T14 (population lost against area lost in 1947). Keyboard: arrows
  move the divider, `Enter` commits.
- **The Tension Plate** — the 2×2 field of four claims described in charge 3, with cross-lighting on
  pointer *and* focus, the "pick the real story" collapse, the discard strip, and "put them back".
  Content authored by P16; the component is here.
- **Extent over time** — territories and population, 1600–1997, with `[PREDICT]` "draw the line after
  1783" (M5, LO7) and the peak marked **to the right of 1914** (T14).
- **The flow map** — embarked against disembarked on British-flagged and British-colonial ships,
  arrow width as volume, the gap drawn as a visible loss, sourced to Slave Voyages (T3).
- **The dot chart** — 100 dots, guess-then-reveal, for the British share of a ~250,000-strong Company
  army (T8) and for the ICS against the population it administered (T10).
- **The range bar** — the default rendering of every figure in the DIDACTIC_SPEC §9.2 contested
  register: width is the disagreement, the reason is inline, and an uncounted quantity renders as an
  open bar fading to *no one counted*. **A registered contested figure that renders as a scalar fails
  `validate-data.js --strict`.**

Every chart carries its source under it, its year, its units, and tabular figures. No chart animates
before a prediction is committed (P12's drama gate).

**Data consumed.** `data.timeline().unitsByYear/territoriesByYear`, `data.metricsAt`, `metrics[]`,
`consequences.violence.toll` (with its required `note`), `peak`, `evidence[]`, `contested`,
`plates.json` (from P16).

**Files owned.** `app/js/viz/{index,ratio-line,plate,extent,flow,dots,range-bar}.js`, `app/css/viz.css`.

**Depends on.** P16 (`renderSource`, plate copy), P21 (`ledger:append` for every committed guess),
P12 (drama gate), P02 (cross-lighting onto the map).

**Acceptance tests.**
1. The Kenya ratio line refuses to reveal any figure until a divider position is committed, records
   the guess and the error in the Ledger, and states in words that the axis is logarithmic.
2. Open the abolition plate at ≥62rem: all four claims are visible simultaneously with no scrollbar,
   no tab, no accordion and no hover-only content. At 375px they stack in DOM order and there are
   still no tabs.
3. Collapse the plate onto "Britain abolished slavery": the discard strip shows the other three, each
   with a struck-through sentence, and the choice is recorded and reappears in the Close.
4. Cross-lighting: focusing the £20m figure with the keyboard lights the same figure everywhere it
   appears in the plate and on the timeline. Hover produces the same lighting and no additional
   information — lighting is emphasis, never content.
5. Every number rendered by this piece resolves to a row in the Evidence Ledger; a figure with no
   registered source renders `[unsourced]` in `--danger` and increments the statusbar counter.
6. **[headless]** Every figure in DIDACTIC_SPEC §9.2 that appears anywhere in the app renders as a
   range or an open bar, never a scalar.

---

### P09 — How it ended: decolonisation
**Owner:** dissolution · **Directory:** `app/js/dissolution/`, `app/css/dissolution.css`

**Purpose.** Kill M3 ("a peaceful planned handover") and M14 ("1947 was the end") with the two
surfaces print cannot build: an exit map you predict before it loads, and a cross-tabulation of how
places were taken against how they left.

**Student-visible behaviour.** Two objects.

**The exit map.** `[PREDICT]` first: the student colours their guess of how each of ten exits happened
— handover / war / insurgency-then-negotiation / partition / lease expiry / delayed by settlers —
then the real choropleth loads and is mostly not the colour they guessed. Each exit opens the
departure record: `how` in plain verbs, `led` naming people on all sides, `cost.toll` with its range
and its note, `borders`, `becomes`. Kenya, Malaya, Cyprus, Aden, Palestine and Rhodesia are on-path;
Partition's numbers render as ranges with "no one counted".

**The Mechanism Matrix.** 14 acquisition mechanisms down, 9 departure mechanisms across, counts in
every cell, built entirely from the dataset. Empty cells stay visibly empty. Predict the tally before
it reveals ("of the territories that left, how many left after a war Britain lost?"), then read the
uncomfortable answer — most left by negotiation — and then the unskippable counter-line naming Kenya,
Malaya, Cyprus, Aden and Palestine. Click a cell and the map paints only those units; click a row
header and the map paints every chartered-company territory across three centuries at once. Row and
column totals are `<th>` with tabular figures, so a student can read down a column exactly as they
would in the book — and then click it. **1947 and the M14 twin charts sit here:** population lost
against area lost, on the same axis, on the same day.

**Data consumed.** `data.departures` (`mechanism`, `how`, `led`, `movement`, `cost.toll`, `borders`,
`becomes`, `instrument`), `data.acquisitions[].mechanism`, `consequences.partition`,
`stillBritish`, `silences[]`.

**Files owned.** `app/js/dissolution/{index,exit-map,matrix,partition}.js`, `app/css/dissolution.css`.

**Depends on.** P06 (`exit` and `mechanism` layers), P02, P08 (ranges, twin charts), P21 (Ledger).

**Acceptance tests.**
1. The exit choropleth does not render until a prediction is committed; the student's guess and the
   truth are both shown afterwards, and the guess is in the Ledger.
2. The matrix's cell counts equal a direct count over `data.acquisitions` × `data.departures` —
   verified headlessly against the data layer, not against a fixture.
3. Clicking the `chartered-company` row paints every such territory at once, across centuries, with
   the year control untouched.
4. After the "mostly negotiated" reveal the next line cannot be skipped and names Kenya, Malaya,
   Cyprus, Aden and Palestine.
5. Every toll rendered here has a range or a stated reason it has none; Partition's dead render as a
   range with "no one counted" attached.
6. At 1947 the twin charts show population lost and area lost with different shapes, and the caption
   states the asymmetry in one sentence (M14).

---

### P10 — Active recall and assessment
**Owner:** quiz · **Directory:** `app/js/quiz/`, `app/css/quiz.css`

**Purpose.** Make retrieval part of the surface, not a test at the end — and make a wrong answer the
cheapest thing in the app.

**Student-visible behaviour.** Item types, all keyboard-operable, all drawn from the twenty and the
eighteen misconceptions and **nothing else**: drag-to-timeline ordering (LO1), classify-the-territory
(LO2), four-step causal-chain reconstruction (LO3), numeric estimation with a confidence prompt (LO5),
"who did this?" matching against the T18 roster, sort-the-exits (LO8), and predict-then-reveal wrappers
around the charts. **No score is ever shown.** No total, no percentage, no streak, no badge, no
leaderboard: the entire engine of DIDACTIC_SPEC §4 is getting a student to commit to a wrong answer,
and nobody commits to a wrong answer in front of a scoreboard. Feedback is a corrected timeline, a
corrected map state, or the evidence — never a tick. **Every wrong answer returns the student to the
map state where the evidence lives**, not to a paragraph. Spacing is enforced: every item introduced
before minute 16 is retrieved again after minute 22, with at least six minutes between encounters, and
the second encounter is always production. Across sessions, the re-ask queue opens the next visit with
three questions from last time and then hands the student back exactly where they were. The T18 roster
is required and must include at least four women — Mary Prince, Nanny of the Maroons, Rani Lakshmibai,
and the Igbo women of the 1929 Women's War — alongside Equiano, Sam Sharpe, Toussaint Louverture,
Naoroji, Gandhi, Ambedkar, Jinnah, Nkrumah, Kenyatta, Kimathi, Aung San and Cetshwayo.

**Data consumed.** `pedagogy.keyDates`, `pedagogy.misconception`, `local_actors[]`, the T-item bank in
`app/js/quiz/bank.json` (each item tagged with its T-number, its LO and its misconception id), the
Ledger's `dueAt` queue.

**Files owned.** `app/js/quiz/{index,items,adaptive,bank.json}`, `app/css/quiz.css`.

**Depends on.** P21 (the Ledger owns the due queue), P05 (beat placement), P02 (return-to-map-state).

**Acceptance tests.**
1. **[headless]** Every item in the bank carries a T-number from DIDACTIC_SPEC §3 or a misconception
   id from §4. An item that tests anything else fails CI.
2. At least 14 of the 20 T-items are retrieved at least once on the default path; a CI test walks
   `tours.json` × `bank.json` and asserts it.
3. No score, percentage, streak, badge or leaderboard appears anywhere; grep the module for `score`
   rendering into the DOM.
4. Deliberately fail an item at minute 8: the same item returns after minute 22 as production, not as
   re-presentation, and the wrong answer's feedback restores the map state where the evidence is.
5. Return the next day: the app opens with three items from the previous session before handing back
   the exact prior state; clearing local data is offered and works.
6. Every item is completable with the keyboard alone, including the drag items, which have an
   explicit `↑`/`↓` reorder path announced to screen readers.

---

### P11 — Visual design coherence
**Owner:** design system · **Directory:** `app/css/tokens.css`, `app/css/base.css`, `docs/DESIGN.md`,
`tools/design/`

**Purpose.** Make it feel like a magnificent printed atlas that came alive under glass, and make that
feeling enforceable rather than aspirational.

**Student-visible behaviour.** Warm paper, warm near-black ink, a transitional serif carrying
everything that teaches, sans for chrome, mono for every figure, four rule weights, square corners,
flat hand-tinted fills with a hairline coastline and engraved textures where colour cannot carry the
load. Two themes, both first-class. No paper grain, no torn edge, no sepia, no vintage filter, no
compass-rose watermark. This piece also owns the **component checklist** every other piece is reviewed
against, and the **house-style lint** (`tools/copy-lint.js`) that fails the build on DIDACTIC_SPEC
§7.1's banned strings and on sentences over a set length.

**The checklist, in full, because it is the thing that erodes first:**
no colour without a second signal · no text under 12px · no hover-only information · no full-screen
content modal · no tabs where a plate is specified · every figure tabular · every date through
`format.js` · every quotation through `renderSource` · both themes · `prefers-reduced-motion` and
`forced-colors` honoured · a visible `:focus-visible` ring on every control.

**Data consumed.** None. It consumes the palette maths in `tools/design/`.

**Files owned.** `app/css/tokens.css`, `app/css/base.css`, `app/design-preview.html`,
`app/assets/fonts/`, `tools/design/*`, `tools/copy-lint.js`, `docs/DESIGN.md`.

**Depends on.** Nothing. Everything depends on it.

**Acceptance tests.**
1. `node tools/design/cvd-check.js --both` exits 0; `node tools/design/textures.js` proves the
   tier-B pairs are texture-separated.
2. Grep the whole `app/` tree: no raw hex outside `tokens.css` and the print stylesheet, no `#000`,
   no `#fff`, no `z-index` above the named layers.
3. `node tools/copy-lint.js` exits 0 across every JSON string and every rendered template; a banned
   string anywhere fails the build.
4. **[headless]** Screenshot every piece's primary surface in `paper` and `lamplit`: no component is
   unreadable in either, and body text is ≥4.5:1 in both.
5. The specimen page renders live ΔE figures from the same tokens the app uses, and a changed hex
   makes it say so.

---

### P12 — Motion and the feeling of discovery
**Owner:** motion · **Directory:** `app/js/motion/`, `app/css/motion.css`

**Purpose.** Make change legible — and make sure no animation ever teaches speed where the lesson is
mechanism.

**Student-visible behaviour.** Paper settles; it does not bounce. No spring, no overshoot, ever.
Three sanctioned choreographies and no others: **the year tick** (700ms per year of playback, a
fill cross-fade plus a coastline settle), **the re-encoding morph** (600ms, position-preserving, used
by weight mode and the projection toggle), and **the reveal** (a committed prediction gives way to the
evidence in two steps: the student's own guess stays on screen, the truth arrives beside it). This
piece owns **the drama gate**: a helper that refuses to play any sequence longer than 4 seconds unless
a prediction has been committed within that beat. The scramble sequence is *stepped*, not autoplayed —
each acquisition needs a keypress and cannot appear without its mechanism glyph and its named
counterparty (Asante, Zulu, Sokoto, Buganda) on screen at the same moment. Under
`prefers-reduced-motion` every animation resolves to its end state and playback becomes stepping;
nothing is lost, only the tween.

**Data consumed.** None directly; it wraps `util.animate` and reads `state.reducedMotion` and the
Ledger's prediction records.

**Files owned.** `app/js/motion/{index,choreography,drama-gate}.js`, `app/css/motion.css`.

**Depends on.** P21 (prediction records), P11 (durations and easings).

**Acceptance tests.**
1. Grep every module: no `@keyframes` and no `util.animate` call longer than 4s that is not routed
   through the drama gate. A sequence that bypasses it fails review.
2. With `data-motion="reduced"`, every animation in the app resolves instantly to its end state, no
   content is skipped, and the Africa sequence becomes a keypress-stepped sequence.
3. The Africa sequence cannot autoplay from any entry point; each step shows a mechanism and a named
   counterparty simultaneously.
4. No spring, no bounce, no overshoot: grep for `cubic-bezier` values outside the five named easings.
5. **[headless]** Frame timing during the year tick and the re-encoding morph stays under 16ms at
   1440×900.

---

### P13 — Accessibility and keyboard
**Owner:** accessibility · **Directory:** `app/js/a11y/`, `tools/a11y-audit.js`

**Purpose.** Accessibility is part of correctness. A student using a keyboard and a screen reader gets
the same lesson, not a reduced one.

**Student-visible behaviour.** One published keyboard map, discoverable at `?`: `Space` play/pause,
`←`/`→` year, `Shift+←/→` next change, `1`–`4` control definition, `V` weight, `L` the Ledger drawer,
`N` next move, `Ctrl+K` search, `Esc` closes overlay → ends tour → clears selection, `Esc Esc` the
Close. Map units are keyboard-navigable with a roving tabindex ordered by region then name, and
focus announces name, status, control degree and year. `focusedUnitId` is kept apart from
`hoveredUnitId`, so keyboard focus never competes with the pointer. Every committed interaction —
the ratio-line divider, the gate placement, the plate collapse, the drag orderings — has an explicit
keyboard path that is announced, not merely possible. Live regions announce year jumps, selections,
tour steps and reveals, politely; only errors are assertive. All content is reachable without hover.

**Data consumed.** None. It audits everyone else.

**Files owned.** `app/js/a11y/{index,keymap,announce-policy}.js`, `tools/a11y-audit.js`,
`tools/scenarios/a11y.js`.

**Depends on.** Every interactive piece. It has veto power over their definition of done.

**Acceptance tests.**
1. **[headless]** Complete the entire 30-minute path using only the keyboard, including every gate,
   every prediction, every drag item and the Close. The scenario is checked in and run in CI.
2. `node tools/a11y-audit.js` reports zero violations of: missing accessible name, focus order breaks,
   contrast below AA, an interactive element with no `:focus-visible` ring, an aria-live region used
   for decoration.
3. No information anywhere in the app is available only on hover; the audit greps for `mouseenter`
   handlers that write content rather than emphasis.
4. Screen-reader transcript of the Company chapter contains the mechanism's steps in order, the
   named actors, and the numbers with their ranges.
5. Tab order at 375px matches the visual order after every plate has stacked.

---

### P14 — Responsive and mobile
**Owner:** responsive · **Directory:** `app/css/responsive.css` (+ the breakpoint contract in this
file; coordinate with shell for `layout.css`)

**Purpose.** A 16-year-old on a phone in a classroom gets the whole lesson, in the right order, with
the plate discipline intact.

**Student-visible behaviour.** One breakpoint that matters: **62rem**. Above it, the dossier is a
right-hand panel and plates are grids. Below it, the dossier is a bottom sheet, plates stack in DOM
order with sticky claim headings, the timeline keeps full width and the spine band stays visible, and
**nothing becomes a tab**. The map keeps at least 45% of the viewport height at all times, because the
constant spatial frame is the schema. Touch targets are ≥44px, including tiny map units. Text never
drops below `--fs-micro`. The Close, the revision sheet and the evidence ledger are all usable and
printable from a phone.

**Data consumed.** None.

**Files owned.** `app/css/responsive.css`; the responsive clauses inside each piece's own stylesheet
are that piece's, reviewed against this contract.

**Depends on.** P11, and every piece that renders.

**Acceptance tests.**
1. **[headless]** At 375×812, run the 30-minute path: no horizontal scrollbar appears at any beat, the
   map is never smaller than 45% of viewport height, and the spine band is always visible.
2. At 375px every Tension Plate is a stack with sticky headings, and there is no tab control anywhere
   in the app (grep for `role="tab"`: zero results).
3. Every interactive target measures ≥44px at 375px, checked by the audit scenario.
4. Rotate to landscape at 812×375: the dossier does not occlude the map, and the timeline is still
   operable.
5. Print from a phone: the revision sheet renders as one A4 page with the signed sentence at the top.

---

### P15 — Onboarding and first run
**Owner:** onboarding · **Directory:** `app/js/onboarding/`, `app/css/onboarding.css`

**Purpose.** Spend second one on the history, not on the interface.

**Student-visible behaviour.** The app lands on the classic 1921 pink world map, unlabelled, presented
as a poster to be attacked — and **one question**: *"Roughly what share of the world's people did
Britain rule at this moment?"* A slider, a commit, no answer. Then one line: *"This map is a poster.
Three things about it are misleading. You'll find all three in the next half hour."* Then the spine
band appears and the path begins. **There is no welcome modal, no coach marks, no interface tour, no
cookie banner, no sign-in and no "explore freely" landing.** The escape — *"I'll explore on my own"* —
is present from the first screen, warns nothing and blocks nothing. A returning visitor is offered
their previous position and their three due questions; declining costs nothing. The keyboard map is at
`?` for anyone who wants it, and nowhere else.

**Data consumed.** The 1921 poster state (`year=1921`, `layer=status`), the Ledger's resume record,
`store.visited`.

**Files owned.** `app/js/onboarding/{index,hook,resume}.js`, `app/css/onboarding.css`.

**Depends on.** P05 (hands off to beat 1), P21 (the commit is the first Ledger entry, and it is
scored against 412 million at 00:27), P02.

**Acceptance tests.**
1. From a cleared profile, the first interactive element on screen is the prediction slider; there is
   no modal, no coach mark and no dismissible welcome anywhere.
2. The 00:00 guess is written to the Ledger and is quoted verbatim at 00:27 and in the Close.
3. The escape is visible on the first screen, produces no warning dialogue, and free-explore keeps the
   spine band.
4. Second visit: previous position and three due items are offered; declining lands exactly where the
   student left off.
5. **[headless]** Time from load to the first question on a cold cache is under 2.5 seconds at
   throttled 3G-equivalent, and no request goes to a non-local origin.

---

### P16 — Historiography, voice and honesty
**Owner:** historiography / copy · **Directory:** `app/js/historiography/`,
`app/css/historiography.css`, `docs/SOURCES.md`

**Purpose.** Own every word that teaches, every quotation, every silence, and the app's declared
stance. This is the piece that makes the difference between a good website and a defensible one.

**Student-visible behaviour.** Six surfaces.

- **`renderSource(id)` — the single entry point for every quotation in the app.** Four labelled lines
  in small caps first, in DOM order and above the quote: NATURE / ORIGIN / PURPOSE / **WHAT IT CANNOT
  TELL YOU**. Then the quote at `--fs-lede` behind a `--accent` rule. Missing any field returns
  `[unsourced]` in `--danger` and increments the statusbar counter. Nothing else in the app is
  permitted to print a quotation.
- **The Attribution Gate.** On the three spine sources the quote is masked until the student answers
  *what was this made for?* and commits. Source G renders its chain on a 22-year mini-axis — Rhodes,
  to the journalist W. T. Stead, 1895 → quoted by Lenin, 1917, in a pamphlet arguing that capitalism
  causes imperialism. Equiano's renders the Carretta dispute inside the origin line, framed as a
  question about *what it is evidence for*, not whether it is evidence.
- **The provenance rail.** A sticky strip of ticks beside every prose panel, one per sourced claim,
  textured by `citation.kind`, so the shape of an evidence base is visible before a word is read.
- **The Silence Layer.** `silences[]` rendered three ways — the Hole on the map, the excision rule in
  prose, the open range bar — plus the **evidence lens**: filter the atlas by a source or a source
  class and every claim that source cannot support greys out, with a counter reading *"claims
  supported: n of m"*. The Kenya instance is computed from our own citation years: filter to "evidence
  available before the 2011 disclosure" and the claims resting only on post-2011 material grey, with a
  caption stating exactly that — **and stating plainly that Anderson (2005) and Elkins (2005) had
  already established the hangings and the detention system from other records.** We do not dramatise
  a deletion that misrepresents what Hanslope actually added.
- **Parallel Texts.** Waitangi, Berlin's "effective occupation", the Hunter Commission against the
  Congress inquiry — two columns, segment locking, the optional third column, word history on
  `rangatiratanga`, and the afterlife coupling to the map.
- **The Margin, About and Methods.** The Margin is the corrective voice specified in charge 15 —
  never generic, always quoting the student, always signed, with a push-back control. About declares
  the stance in the first person. Methods states how territories were defined, what "controlled" means
  here, which of our choices are debatable, where to read the other case, the content version, and
  the date of the last clean validator run.

**Data consumed.** `evidence[]` + four required NOP fields on any citation attached to a displayed
quotation, `confidence`, `contested{isContested, note, positions[]}`, `silences[]`, `causalLinks[]`,
`plates.json`, `texts.json`, `notes.json` (margin rules keyed to Ledger predicates).

**Files owned.** `app/js/historiography/{index,sources,rail,gate,silence,parallel,margin,about}.js`,
`app/js/historiography/*.json`, `app/css/historiography.css`, `docs/SOURCES.md`.

**Depends on.** Data model (`silences[]`, NOP fields), P02 (holes and afterlife painting), P21 (Ledger
predicates for the Margin), P08 (plates render here's copy).

**Acceptance tests.**
1. Grep every module for a rendered quotation not routed through `renderSource`: zero. Remove a
   `purpose` field from any displayed citation and `[unsourced]` appears in the UI in `--danger`.
2. The Attribution Gate does not reveal Source G's quotation until an answer is committed, and the
   provenance chain shows Rhodes → Stead 1895 → Lenin 1917 on a dated axis.
3. Turn on the evidence lens for "before 2011": the caption names what Hanslope added and names
   Anderson (2005) and Elkins (2005) as pre-existing evidence for the hangings and the camps. A
   reviewer who knows the historiography cannot call the interaction misleading.
4. At least one silence is rendered on the map as a hole with a legend entry reading *"no record was
   allowed to survive here"*, and its `agent` is a named body — never the passive voice.
5. In the Waitangi panel, focusing an English clause lights its Māori counterpart, the third column is
   reachable, and "what happened next" paints the 1863 confiscations on the map without closing the
   texts.
6. The Margin never fires without quoting something the student did; a scenario that makes no
   commitments produces zero margin notes across the whole path.

---

### P17 — Legend, symbology and map literacy
**Owner:** legend · **Directory:** `app/js/legend/`, `app/css/legend.css`

**Purpose.** Teach a student to read *any* imperial map, starting with ours.

**Student-visible behaviour.** The legend is not a key; it is a sentence. Every layer prints its
definition in one line — *"colour = the legal status of British authority in this year"*,
*"drawn: everywhere Britain claimed authority (control degree 1 or more)"* — plus the live totals for
the current year: units, km², population where sourced, and the delta from the previous definition
("1913 — claimed 35.5m km²; controlled, considerably less"). Every swatch shows colour **and** texture
**and** the word. The tenure ramp shows its buckets in years. And the piece owns **the map's own
provenance byline**, pinned in `stage-note`, never dismissible, four fields: **projection · what the
colour means right now · the exact year · whose definition of control**. Beside it a link, *"three
things wrong with this rendering"*, which is **state-dependent**: in Mercator it says Canada is not
that big; in weight mode it says this is not where these places are; in `controlled` it says this
hides everywhere Britain ran without a flag. The app criticises itself in the same words it teaches
the student to criticise the 1886 poster.

**Data consumed.** `data.statuses` (labels, counts, degrees), `data.metricsAt(year)`, the active
layer's definition sentence, `state.projection`, `state.controlDefinition`, `state.weight`,
`app/js/legend/caveats.json` keyed by (projection, layer, definition).

**Files owned.** `app/js/legend/{index,key,byline,caveats.json}`, `app/css/legend.css`.

**Depends on.** P06 (layer definitions), P02 (projection state), P11 (textures).

**Acceptance tests.**
1. Every layer, in every state, shows a one-sentence definition; a layer without one cannot register
   (asserted in CI).
2. The byline is present in every state of the app including tours, compare, the plate and the Close,
   and its four fields always match the actual render.
3. Change projection, layer and definition in turn: the "three things wrong" list changes each time
   and never repeats a stale entry.
4. Every legend swatch carries colour, texture and word; simulate protanopia, deuteranopia and
   tritanopia on the legend screenshot and every entry remains distinguishable.
5. The totals in the legend equal `data.metricsAt(year)` for that definition — no hard-coded numbers.

---

### P18 — Compare two dates
**Owner:** compare · **Directory:** `app/js/compare/`, `app/css/compare.css`

**Purpose.** Non-linear comparison — the thing a book with four static maps cannot do — used for three
specific arguments, not as a toy.

**Student-visible behaviour.** `compareYear` turns the stage into two synchronised plates, side by side
above 62rem and stacked below, sharing pan, zoom, layer and definition, each labelled with its year and
its own totals. A difference readout names what changed between them in words: units gained, units
lost, statuses that changed, and the events between the two dates (`data.eventsBetween`). Three
comparisons are on-path and scripted: **1770 against 1820** (M5 — losing America did not shrink the
empire), **1860 formal-only against 1860 formal-plus-informal** (charge 5, LO11), and **1914 against
1922** (T14 — the peak is to the right of the war). Every comparison begins with a committed
prediction. A share link carries both years, so a teacher can set the comparison the way they set a
page number.

**Data consumed.** `data.statusAt(a)` and `data.statusAt(b)` (both `===`-stable, so the diff is cheap),
`data.metricsAt`, `data.eventsBetween(a, b)`, `state.compareYear`.

**Files owned.** `app/js/compare/{index,split,diff}.js`, `app/css/compare.css`.

**Depends on.** P02 (two paints), P03 (two year controls), P17 (two legends), P08 (the prediction).

**Acceptance tests.**
1. `#year=1820&compare=1770`: both plates render, share view state, and the difference readout matches
   a direct set difference over `data.statusAt` for those years.
2. The 1770/1820 comparison is preceded by a committed prediction, and a student who guesses "smaller"
   sees their own guess beside the answer.
3. Below 62rem the two plates stack with both years labelled; they never become tabs.
4. The compare link round-trips: copy it, open it in a fresh browser, and the identical state loads.
5. Compare mode is operable from the keyboard alone, including switching which plate has focus.

---

### P19 — Performance and load
**Owner:** shell / performance · **Directory:** `tools/perf/`, budgets recorded here

**Purpose.** Effort is spent on the history, never on the interface. A school laptop is the target
machine, not a workstation.

**Behaviour and budgets.** Hard numbers, checked in CI:
- First question on screen in **under 2.5s** on a cold cache, throttled to 3G-equivalent, on a
  4× CPU slowdown.
- **Zero** console errors and **zero** failed requests in every scenario. The shell already meets this;
  keep it there by probing with `util.exists()` / `util.getJson()` rather than letting a 404 land.
- A 600-frame scrub costs **≤16ms per frame**; `statusAt` is memoised and `===`-stable, so a re-paint
  must never re-query.
- Total transferred on first load **≤2.5MB** including fonts (critical font path is 161KB) and the
  preloaded coarse geometry; the fine geometry is lazy.
- Nothing is fetched from a non-local origin, ever. No CDN, no telemetry, no font host.
- Memory: no listener leaks — every module's `destroy()` removes what `mount()` added, verified by
  mounting and destroying every module 50 times in a scenario.

**Files owned.** `tools/perf/*`, `tools/scenarios/perf.js`, the budgets table above.

**Depends on.** Everyone; it fails their builds.

**Acceptance tests.**
1. **[headless]** `node tools/inspect.js tools/scenarios/perf.js` prints every budget above with a
   pass/fail, and exits non-zero on any failure.
2. Load the app with the network panel open: every request is same-origin, and the count matches the
   manifest exactly — the shell probes nothing it has not been told about.
3. Mount/destroy every module 50 times: listener count returns to baseline.
4. Run the whole 30-minute path with the CPU throttled 4×: no beat drops below interactive.

---

### P20 — Teacher and classroom mode
**Owner:** teacher · **Directory:** `app/js/teacher/`, `app/css/teacher.css`

**Purpose.** Let a head of department audit us faster than they can audit the chapter, and let a
teacher plan Tuesday around a link that will mean the same thing in March.

**Student-visible behaviour** (teacher-visible; it is opt-in from `chrome-end` and invisible to
students otherwise). Four surfaces:

- **The Evidence Ledger** at `#panel=evidence` — one row per figure in the atlas: value, range,
  source (author / work / year / `kind`), the `supports` sentence, `confidence`, `contested`, the
  shard path, and a deep link to where it appears. Sortable on every column, **default sort
  `confidence: low` first, then `contested: true`**. Filter chip: *"show only numbers with no range"*.
  Prints one row per line with the content version in the header. `node tools/evidence-audit.js`
  emits the identical table as markdown for someone with no browser.
- **The Methods panel** — how territories were defined, what "controlled" means here, which of our
  choices are debatable and where to read the other case, the periodisations we rejected and why
  (DIDACTIC_SPEC §2.2), the changelog, the content version, and the date of the last clean
  `validate-data.js --strict` run.
- **Lesson links and variants** — the 8-, 30- and 60-minute paths as one-click starts; a link builder
  that produces a stable deep link for any state; a projection-friendly display mode (larger type, the
  dossier suppressed, the map and the spine band dominant).
- **The printable pack** — the revision sheet (P21), the evidence ledger, the parallel-text pages, the
  mechanism matrix, and an exported map or timeline image, all A4, all carrying the content version.

**Data consumed.** A runtime walk of `data.territories`, `data.events`, `metrics[]`, every `evidence[]`
and every `contested` block. No new authoring.

**Files owned.** `app/js/teacher/{index,evidence,methods,links,print}.js`, `app/css/teacher.css`,
`tools/evidence-audit.js`.

**Depends on.** P16 (citations, contested notes), P21 (revision sheet), the data model.

**Acceptance tests.**
1. A reviewer who has never seen the code opens `#panel=evidence` and, within 20 minutes, checks
   forty numbers against their stated sources. Sorted weakest-first by default.
2. `node tools/evidence-audit.js` and the in-app table produce the same rows, and both name the
   content version.
3. Every figure rendered anywhere in the app appears in this table. A figure that does not is a bug in
   the piece that rendered it — the CI test walks both and diffs.
4. A deep link built here, opened in a fresh browser a week later against the same content version,
   restores the identical state.
5. The printed pack fits A4, carries the content version on every page, and contains no interface
   chrome.
6. Teacher mode is invisible in the student default: a cleared profile shows no teacher affordance
   except a single labelled entry in `chrome-end`.

---

### P21 — The ending: closure and what you now know
**Owner:** spine / closure · **Directory:** `app/js/spine/`, `app/css/spine.css`

**Purpose.** Beat print's second advantage outright: guarantee that **every stopping point is an
arrival**, and that the conclusion is about this student. This piece also owns the Ledger — the record
every other piece writes to — so it lands in wave 1, not at the end.

**Student-visible behaviour.** Four objects.

- **The Ledger.** Invisible while working. Every *commitment* — a prediction, a sort, a
  classification, a gate placement, an attribution answer, a plate collapse, a dissent, and a fact
  found in free-explore — writes one line **as a sentence in the student's own voice**: *"I said 40%
  of the empire was British-descended. It was under 2%."* Nothing else is recorded: not clicks, not
  dwell time, not scroll depth. `L` opens the drawer; each line links back to the map state where it
  happened. Persisted to `localStorage` only, clearable, never networked.
- **The Unfinished Sentence.** The §2.3 through-line runs in the statusbar from second one with
  blanks: *"Britain's empire started as ______ worked by ______, became a ______ that ended up ruling
  ______…"*. A blank fills — in the student's own words, not ours — when the Ledger earns it. Clicking
  a blank navigates to the beat that fills it. It never nags and never blocks. The app therefore has a
  visible ending, and a visible distance to it, without a progress bar and without a rail.
- **Next Move.** One persistent control, `N`, labelled with a *claim* and a *price*, never a task:
  *"You've never seen what Egypt was legally called in 1890. 40 seconds."* Ignoring it costs nothing.
  Ranking: unfilled thesis slot > retrieval item due > declined gate > `[CORE]` beat not done >
  `[EXT]` beat nearest the current map state.
- **The Any-Exit Close.** Available at any second (`Esc Esc`, or the always-present Close control,
  which becomes primary when the sentence completes). It prints the twelve-line argument: lines the
  student can support are set in full and carry their own numbers, their own first wrong guesses and
  their own gate choices; lines they cannot are greyed with the missing evidence and its price in
  seconds. Then the 00:00 population guess is scored against 412 million. Then the through-line
  sentence as a field, in their words, signed. Then the refusal of closure: 1997 fades, **fourteen dots
  remain**, clickable and dated to today, with what is still British, what is still disputed, what was
  settled recently and by whom. Final card: *"Three things you could go argue with. Here's where to
  start"* — three `[EXT]` doors and three real books. The whole thing generates the **revision sheet**:
  one A4 page, the signed sentence at the top, the four phases and their engines, the six colonised
  people this student actually named, the three things they got wrong with deep links to the map state
  where the evidence lives, two contested numbers with their ranges and why, their own dissents
  unedited, and the content version. No branding, no QR code, a wide left margin for pencil.

**Data consumed.** `LedgerEntry { id, t, misconceptionId, beatId, kind, prompt, youSaid, evidence:
{value, range, sourceIds[]}, verdict: 'confirmed'|'corrected'|'declined', year, unitIds[], at, dueAt }`
persisted at `bea.ledger.v1`; `thesis.json` (`thesisSlots[] {n, label, requires:[T-ids], filledBy,
beatId}`); `close.json` (`closeLines[] {n, text, requires:[T-ids], studentSlots}`).

**Files owned.** `app/js/spine/{index,ledger,thesis,next-move,close,sheet}.js`,
`app/js/spine/*.json`, `app/css/spine.css`, `app/css/print.css` (coordinate with shell).

**Depends on.** Shell (one new state key, §7), and it is depended on by P05, P08, P09, P10, P15, P16.

**Acceptance tests.**
1. **[headless]** Quit at minute eleven and press `Esc Esc`: the Close renders, some lines full and
   some greyed, every full line carrying at least one thing this student actually did, and every
   greyed line carrying a price in seconds.
2. The 00:00 population guess appears verbatim in the Close and is scored against 412 million.
3. Make a commitment, then press `L`: the drawer shows it as a sentence in the first person, and
   clicking it restores the exact map state where it was made.
4. Push back on a Margin note: the dissent appears in the Close and on the printed sheet, verbatim and
   unedited, under the student's own name.
5. **[headless]** Grep the Ledger's write path: only the enumerated `kind`s can be written. No
   timestamp-of-page-view, no click count, no dwell — a test asserts the persisted object's key set.
6. Print the sheet: one A4 page, the signed sentence at the top, at least three specific errors with
   working deep links, and the content version in the footer.

---

## 3. THE SPINE IN THE PRODUCT

**The thesis is stated at 00:02**, in the spine band and in one paragraph readable in 40 seconds:
Britain built four overlapping empires, each with a different engine, and the map's single pink hides
four different machines. It is stated again, permanently and without words, by the four-colour band
that never leaves the screen (T1) — students see the colour before they read the word.

**It is carried by the band.** The band is the app's chronological backbone and it is owned by P03,
not by the tours. It is visible in free-explore, in compare, in the plate, in the Close, and on a
375px phone. Scrubbing lights the phase; the phases **overlap visibly**, because the overlap is the
teaching: 1815–1833 lights three bands and says three engines are running.

**It is tested at four moments, in this order:**
- **00:04:30** — drag the four phase names onto the timeline. Wrong drops snap back with the *driver*
  shown, not the answer. (LO1, T1.)
- **00:12:30–00:14** — the Company chapter's mechanism run. Step *revenue → sepoys → conquest → more
  revenue*, then cut Bengal's revenue and watch it stall at a named step. This is the longest beat in
  the app and the one mechanism we expect a student to still hold in a week. (LO3, T7, M2.)
- **00:17** — the status recolour: the single pink shatters into ten legal categories. This is M4's
  first answer and it fires here, not at the start, because it now means something.
- **00:25** — predict how the exits happened, then see the exit map, which is mostly not the colour
  guessed. (LO8, T19, M3.)

**It is cashed in at three moments:**
- **00:27** — the projection reveal. The opening pink map redraws in equal-area and the student's
  00:00 population guess is scored against 412 million. The hook question the session opened with is
  answered at the end, and by then the student has the schema to hold the answer. This is the app's
  signature interaction and it is scheduled here by DIDACTIC_SPEC §8; no piece may move it.
- **00:29** — the Close: the twelve lines, the student's own evidence under the ones they earned, the
  through-line sentence completed in their own words and signed.
- **00:30** — the refusal of closure: fourteen dots, three live disputes, three books.

**And it is carried off-path too.** Two rules make free exploration feed the argument instead of
competing with it, and they are binding on P04, P05, P10 and P21:

1. **Presentation downgrades to retrieval, never to nothing.** A claim the student found in the wild is
   never skipped when the spine reaches it. The beat converts: instead of showing the Diwani, it says
   *"You found this yourself at minute six. Say what the Diwani was."* Nothing is skipped and nothing
   is repeated; exposure upgrades presentation into production, which is where the learning is.
2. **Off-piste is a place inside the story.** Leaving a beat keeps the spine band and the map and
   carries the beat's open question into the stage note. You are not lost; you are off-piste with a
   question in your hand.

**The time budget, reconciled.** Every surface in this document is either a §8 beat, an instrument a
§8 beat uses, or explicitly off-path. On-path: the hook (P15), the spine band (P03), the Atlantic
flow map and counters (P08), the mechanism run (P08/P05), the status recolour and the definition
switch (P06), the two-track self-government timeline and Amritsar (P05), the exit map (P09), the
retrieval block (P10), the projection reveal (P02), the Close (P21). Off-path and reachable only by
choice or by Next Move: the Mechanism Matrix, the system view, weight mode, compare, parallel texts
beyond Waitangi, the evidence lens, the Evidence Ledger, the counterfactual `[EXT]` cards, the
essays, the worked exam paragraphs. **P05 owns the clock and has the authority to refuse an on-path
placement.** If the measured path exceeds 45 minutes, features come off the path — not out of the app,
off the path — and P05 says which.

---

## 4. THE THREE SOFTWARE-ONLY MOVES

Elevated to headline features. Each is argued on teaching grounds, not on impressiveness. (The Ledger
and the Close are not on this list because they are not a move — they are the app's structure, and
they are P21's whole job.)

### Move 1 — Hold the year still and change the definition of control

Press `1`, `2`, `3`, `4` on 1913 and the same year renders as *claimed*, *administered*, *controlled*
and *influenced*, with the unit count, km² and sourced population recomputed and printed each time.
Press them on 1860 and the map goes from modest to enormous when you reach *influenced*. Then press
`V` and size stops meaning land area and starts meaning a cited quantity, in place, same positions,
same colours — and Barbados stops being a speck.

**Why it teaches better.** The misconception is not that students think the empire was too big or too
small. It is that they think "British" is a **binary property of a place**. Every printed map they have
ever seen reinforces that, because a printed map must pick one definition and can then never mention
that it picked. The Definition Switch makes the threshold visible *as a choice the student just made*,
and the pink area is seen to depend on it. That is the actual historiographical operation —
Gallagher and Robinson's argument is a change of threshold — performed rather than read. It disposes
of charges 4 and 5 together, it is the honest route to rubric C3 anchor 4, and it inoculates: a
student who has watched an empire change size four times because someone changed a definition does not
take the next choropleth at face value. **What print does instead:** prints one map and writes a
paragraph asking you to imagine three others.

### Move 2 — Run the causal loop, then cut one of its inputs and watch it stall at a named step

The `revenue-loop` executes: *diwani 1765 → land revenue from perhaps 20–30 million people → pay
sepoys → take more territory → more revenue*. The student steps it, then removes Bengal's revenue or
removes the Indian soldiers, and the machine halts **at a named step**, with the historians who dispute
the counterfactual printed beside it and the compulsory line: *this is an argument about a mechanism,
not a prediction about the past*. Then the student runs it on a case it does not fit — Hong Kong 1997,
Southern Rhodesia 1965 — and the mechanism **refuses**, printing its own `failsFor` note.
**`failsFor[]` is a required schema field: a mechanism with no cases it cannot explain fails
validation**, because that is Fieldhouse's objection turned into a build rule. **No quantity is ever
invented inside this animation.** The stall is qualitative and named; there is no "a tenth of the army
it had".

**Why it teaches better.** A feedback loop is not a fact, it is a *procedure*, and procedures are
learned by execution and by watching them fail (Sweller; Kirschner, Sweller & Clark 2006). Reading
"revenue funded the sepoys who won the revenue" produces recognition; running it and breaking it
produces a model that transfers. It is the only honest route to rubric C1's level-5 anchor, which
demands the learner manipulate the model and say what would refute it — which is exactly what
`failsFor` hands them. And it answers charge 11 in passing: in this mechanism the complication is a
**required input**. You cannot execute the conquest step without recruiting Mir Jafar, the Jagat Seths
and the sepoys; the self-refutation is a step the student pressed, not a box they can decline. Three
mechanisms ship — `revenue-loop` `[CORE]`, `collaboration` `[EXT]`, `outsourcing` `[EXT]` — and each
carries `failsFor`, `historians[]` and the case it breaks on. Mechanism is a teaching instrument
inside the four-phase spine. It is not the atlas's index.

### Move 3 — Make absence a data type: go looking, and come back empty

The Kenya file list opens with real FCO 141 references. Click one and nothing comes back — a stated
refusal with the destruction date, the named agency, and the 2011–12 disclosure, rendered as a result
and not as an error. On the map, a unit whose record was destroyed has **no fill**: a hole in the
paper, with a legend entry reading *"no record was allowed to survive here"*. In prose, a removed
passage is an ink rule of the width of the missing words, clickable for who removed them and when. On
an axis, a quantity nobody counted is an open bar fading out into the words *no one counted*, set
beside Amritsar's counted 379 so the two shapes teach the epistemology. And the search box indexes
silences, so a student looking for *"Kenya deaths 1954"* gets the absence back, with its agent, its
date and a `whatWouldSettleIt` line naming the evidence that would change the answer.

**Why it teaches better.** WHY_PRINT #7 says a deliberately created silence is not a data type. It is
one, if you make it one — a rendering state with an author, a date, an instruction and a reason. Print
can *tell* a reader the archive was burned, from a position where the reader never held the thing that
was destroyed. Only an interface can let a student go looking and fail, which is the difference between
being told a door is locked and putting a hand on the handle. This delivers rubric C4's level-4 anchor
("at least one silence in the archive is named") as an experience and its level-5 anchor ("can say what
evidence would change a stated conclusion") in the same gesture, at the only moment a student will care
— the moment they wanted the number. It is also our best defence against our own polish: the most
authoritative-looking thing on screen periodically tells the student that nobody knows, and names who
arranged for nobody to know. **The discipline that makes it honest:** the Kenya lens is computed from
our own citation years, it is captioned as exactly that, and it states what Anderson (2005) and Elkins
(2005) had already established before Hanslope. We render a real silence. We do not stage a fake one.

---

## 5. WHAT WE REFUSE TO BUILD

Each of these is something a competent version of this app would ship. Each makes it teach worse.
Named here so nobody has to re-argue them, and so a reviewer can reject the diff.

1. **Scores, percentages, streaks, badges, XP, completion meters, leaderboards.** The engine of §4 is
   getting a student to commit to a wrong answer, and nobody does that in front of a scoreboard. A
   completion streak on a module about the Middle Passage is indefensible on its own terms.
2. **Any "was the empire good or bad?" slider, poll, thumbs or verdict widget** — and above all the
   aggregate version, "here's what other students said". DIDACTIC_SPEC §1 refuses this and the refusal
   is load-bearing. The replacement, if we want that interaction's feel: pick a beneficiary and a
   metric — *worth it to whom, measured how, compared with what* — and get the evidence for that pair.
3. **A 3D globe.** It costs the projection argument (you cannot show Mercator against equal-area on a
   sphere), costs side-by-side comparison, costs keyboard and screen-reader access, costs label
   density, and buys only the appearance of the future. It will be proposed. Refuse it every time.
4. **Any generative or conversational assistant, "ask the atlas anything".** It fabricates citations
   under pressure — one fabricated citation caps rubric C4 at 0 and the artefact at 2 — and it breaks
   the offline rule. Categorical.
5. **Full-screen content modals, anywhere.** The map never disappears; the constant spatial frame is
   our biggest structural advantage over a chapter, and the second modal is always easier to justify
   than the first.
6. **Hover-only information.** No touch device has hover, no keyboard user has hover, no printer has
   hover, no screen reader has hover. Hover may emphasise. It may not inform.
7. **"Explore freely" as the landing state, and search as the primary entry point.** A novice dropped
   into a sandbox arrives at the Scramble not knowing what a protectorate is (Kirschner, Sweller &
   Clark 2006). The default is the spine; the sandbox is one click away and warns nothing.
8. **A welcome modal, coach marks or an interface tour.** Every second spent teaching the UI is a
   second not spent on the history.
9. **The autoplaying scramble-for-Africa sweep, the handover countdown clock, the rotating "sun never
   sets" globe, and the 1922 maximum as spectacle.** Red flooding across Africa is the most
   screenshot-able thing we could build and it teaches one variable: speed. Keep a *stepped* sequence
   where each step needs a keypress and carries its mechanism and its named counterparty.
10. **Any animation of consequence that plays before a committed prediction.** Enforced by the drama
    gate (P12), not by good intentions.
11. **Invented data of every kind:** interpolated cartogram values, counterfactual sailing times or
    reachability simulations, counterfactual quantities inside an animation, a metric series we cannot
    cite, a scalar for a figure in the §9.2 contested register. Where we have no figure, we draw a hole.
12. **A "build your own empire" strategy or optimisation sim.** It teaches that empire was a set of
    rational choices well made, seats the student permanently in the coloniser's chair, and makes the
    only available agency imperial agency. It would also be the most fun thing in the app, which is
    why it must be refused explicitly.
13. **Auto-playing atrocity imagery, ticking casualty counters, a "deaths" heat map, ambient audio or
    narration.** Spectacle that trains the eye to skim suffering, and a violation of §7.3.
14. **Per-territory "did you know" trivia pins, a territory of the day, a randomiser, an achievements
    map of places visited.** Twelve pins, twelve facts, no argument — the exact failure charge 1
    predicts, and seductive because the dataset makes it nearly free.
15. **Accounts, sign-in, cloud sync, class dashboards, and any analytics beyond the seven fields.**
    Offline is a BRIEF rule, and anonymity is what makes being wrong cheap. A teacher who wants
    evidence of work gets the printed revision sheet, which is better evidence anyway.
16. **Tabs anywhere a plate is specified.** The plate discipline is the whole answer to charge 3 and it
    is the thing that erodes first, one responsive breakpoint at a time, at the end of a long day.
17. **A fifth engine.** Four phases (DIDACTIC_SPEC §2.1). Anyone who wants a fifth files an amendment.
18. **A list of all territories to memorise.** The atlas is a tool for looking things up, not a list to
    learn (DIDACTIC_SPEC §1). Do not sneak it back in as a "fun quiz".

---

## 6. DEPENDENCY ORDER FOR THE BUILD WAVES

A piece may start when everything it depends on has landed a working stub with its public contract
(bus events, exported functions, JSON shape) — not when that piece is finished.

**Wave 0 — done, do not break.** Shell (`core/*`, `main.js`, `modules.json`, `layout.css`), tokens and
base (P11's foundation), geometry (`app/data/geo/*`, 302 units), the data model and the validator.

**Wave 1 — the substrate. Nothing else can start without these.**
- **P11** design tokens finalised and the component checklist published.
- **P02** map rendering: paint, project, select, focus, tiny-unit handling, the bus contracts.
- **P03** time control and **the spine band** — because the band is in every screenshot of every other
  piece from now on.
- **P21a** `app/js/spine/ledger.js` only — the Ledger as a library, with `bus.on('ledger:append')`
  and the persisted shape frozen. Everything downstream writes to it, so it cannot come last.
- **P17** legend and byline skeleton, so no piece ever renders an unlabelled encoding.
- **P19** budgets and scenarios in CI from day one; **P13** publishes the keyboard map and the audit
  scenario now, so pieces are built against it rather than retrofitted.
- Data: the first four shards land, so no one builds against the placeholder for long.

**Wave 2 — the instruments.** Depends on wave 1.
- **P16** `renderSource`, the provenance rail, `silences[]` rendering, the Margin's rule engine.
  *This is the long pole of wave 2 and should start first.*
- **P04** dossier (needs `renderSource` and the Ledger).
- **P06** thematic layers (needs P02's paint contract and P17's definitions).
- **P08** viz components (needs P16's citations, P21a's Ledger, P12's drama gate stub).
- **P07** search (needs `silences[]`).
- **P18** compare (needs P02, P03, P17).
- **P12** motion choreography and the drama gate.

**Wave 3 — the lesson.** Depends on wave 2, because tours point at instruments that must already exist.
- **P05** tours: the 30-minute path, the five gates, the essays, the clock. Nothing else in wave 3
  ships before P05's beat list is frozen.
- **P10** quiz and the re-ask queue (reads the Ledger's due queue).
- **P09** dissolution: the exit map and the Mechanism Matrix.
- **P15** onboarding: the hook, the escape, resume.
- **P16b** the Attribution Gate, Parallel Texts and the evidence lens (they attach to beats).

**Wave 4 — the arrival and the audit.** Depends on wave 3, because both are computed from what the
earlier pieces recorded.
- **P21** the Unfinished Sentence, Next Move, the Close, the revision sheet.
- **P20** teacher mode: the Evidence Ledger, Methods, lesson links, the printable pack.
- **P14** the responsive pass across every surface built in waves 2–3.
- **P13** and **P19** final audit passes with veto power.

**Cut order, if we run out of time.** Off-path `[EXT]` surfaces go first, in this order: the
counterfactual cards, the system view, the second and third parallel texts, weight mode's optional
metrics, the 60-minute variant. **These never get cut:** the spine band, the definition switch, the
mechanism run, the silence rendering, the source card contract, the Close, and keyboard access.

---

## 7. APPENDIX — the asks, stated once

**Shell (`core/store.js`, `core/url.js`).** Four new top-level state keys, all small, serialisable and
deep-linkable, with matching actions and URL keys:

| Key | Values | Action | URL |
|---|---|---|---|
| `controlDefinition` | `'claimed'\|'administered'\|'controlled'\|'influenced'` | `setControlDefinition` | `def` |
| `weight` | metric id \| `null` | `setWeight` | `wt` |
| `projection` | `'mercator'\|'equal-area'` | `setProjection` | `proj` |
| `spine` | `{ commitments: n, thesisSlots: [...], dueCount: n, closeAvailable: bool }` | `commit`, `openClose` | — |

The Ledger itself **never enters the shared store**: it is too big and nobody else should read it
directly. It persists via `util.storage` at `bea.ledger.v1`. The evidence lens uses the existing
free-form `filters` (`setFilter({ source: 'anderson-2005' })`) and needs nothing new. Compare already
exists. One new mount slot is requested: **`stage-lower`**, the lower ~55% of the map stage, so plates
compress the map instead of covering it; if declined, plates fall back to absolute positioning inside
`overlay` with the map still visible — they never become a modal.

**Data model (`docs/DATA_MODEL.md` §17 amendment procedure).** Five additions, no removals:
1. `silences[]` on territories and events — `{ id, kind, what, why, agent, when, scope,
   evidenceOfAbsence[], whatWouldSettleIt, sources[] }`, `kind ∈ {records-destroyed, records-withheld,
   never-counted, counted-only-one-side, name-not-recorded, category-erased}`. **`agent` is required**:
   records do not get destroyed, people destroy them (§7.1 rule 1 applies to archives too).
2. `metrics[]` on territories — `{ metric, year, value, unit, range?, sourceIds, confidence }`.
   Sparse is correct and honest. **No interpolation is permitted at read time or render time.**
3. `influence[]` on `informal-sphere` territories — `{ year, quantity, value, sourceIds }`, with the
   in-app caption that the layer is an argument, not a measurement.
4. Four required fields on any citation attached to a displayed quotation: `nature`, `origin`,
   `purpose`, `limits`. `supports` already exists and stays.
5. `causalLinks[]` (already promised by DIDACTIC_SPEC §5.1) and `local_actors[]` enforced non-empty
   (already promised by M17).

**Validator additions.** `--strict` fails on: a figure in the DIDACTIC_SPEC §9.2 register rendering as
a scalar; a mechanism object with an empty `failsFor[]`; a displayed quotation missing any NOP field;
a `silences[]` entry with no named `agent`; a `metrics[]` value with no `sourceIds`.

**Mechanism objects** (`app/data/mechanisms/*.json`, owned by P08 with P16's copy):
`{ id, name, oneLine, inputs[], steps[{n, verb, requires[], produces[], sentence, evidence[]}],
breakConditions[{id, label, whatHappens, historians[]}], instances[], failsFor[{territoryId, why}],
historians[], evidence[] }`. Three ship. `failsFor` is compulsory.

---

## 8. HOW WE LOSE

Stated plainly, so it can be checked against the running app rather than argued about.

We lose if a student closes this app and says *"the British Empire was a quarter of the world,
coloured pink"*. We have then built exactly the app `WHY_PRINT_WINS` predicted.

We win if they say: *"Britain built four empires with four different engines. A company with an army
found that taxing land paid better than trade, and paid for the next conquest with the last one's
revenue. The map you've seen is a poster — it has a projection, a colour convention and an exact
date, and most of what it shows was claimed rather than controlled. And some of the numbers we argue
about are missing because somebody burned them, in a year, under an instruction, with a name."*

Every piece above exists to produce that second sentence. If your feature does not move it, cut it.
