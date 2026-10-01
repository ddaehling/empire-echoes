# RESPONSE — SEQUENCE AND CLOSURE

*An answer to `docs/rival/WHY_PRINT_WINS.md`, written from one stance: the chapter's deepest
advantages are **ordering, arrival and ambush**, and we take all three without becoming a slideshow.*

**Owner of this document:** the sequence/closure design track. **Consumers:** tours, quiz, panels,
map, viz, shell, copy.

---

## 0. The position, in one paragraph

The rival brief is right that a chapter guarantees the reader meets everything, in order, and ends.
It is wrong about why that matters. What a chapter actually guarantees is not *an* arrival — it is
*one* arrival, the author's, reached only by the minority of readers who finish. Our answer is not
to imitate the chapter's sequence. It is to build an app in which **every stopping point is an
arrival**, the next step is always visible and always singular, the self-refuting material sits on
the only forward edge rather than down a side road, and the conclusion is computed from what *this
student actually did and said* rather than printed in advance. A book abandoned at page nine gives
you nothing. This app abandoned at minute nine hands you the four sentences you can now defend, the
two you cannot, and your own wrong answer quoted back at you. **That is the trade: we give up the
guarantee that everyone sees everything, and we take in exchange a guarantee no printed page can
make — that the ending is about the reader.**

Three inventions carry the whole response, and everything below is one of them or a consequence:

1. **The Ledger.** Every commitment the student makes — a prediction, a sort, a classification, a
   gate choice, a disagreement — is written down as a sentence in their voice. Nothing else is
   recorded. Not clicks, not dwell time.
2. **The Unfinished Sentence.** The §2.3 through-line sits in the status bar from second one with
   blanks in it. The app therefore has a permanently visible ending and a permanently visible
   distance to it, without a progress bar and without a rail.
3. **The Any-Exit Close.** The conclusion is available at every moment and is always truthful about
   how much of the argument the student can currently support.

---

## 1. VERDICTS ON THE FIFTEEN

| # | The charge | Verdict | The mechanism that does the work |
|---|---|---|---|
| **1** | A sustained causal argument survives on a page and dies in a tooltip | **NEUTRALISED** | Three parts, and we concede the fourth. (a) **Essay panels** — `tour.chapters[].essay`, 250–400 words, argument not caption, rendered in `dossier` with the map still on screen; QA counts words and fails a chapter that ships without one. (b) **The Ledger** (F1) makes the thesis cumulative in the only place a chapter's thesis is ever really cumulative — the reader's head — by writing each of the student's own commitments as a line that the Close later reassembles. Print states its thesis and hopes it accreted; we can *show* the accretion. (c) **`causal_links[]`** as a first-class data object (DIDACTIC §5.1): a "because" chip on a dossier claim navigates to the claim it caused, so causation is traversable rather than asserted. **What we do not get back:** the rhythm of 900 unbroken words, where the reader's eye chooses the route through a subordinate clause. We are not claiming it. We ship real prose and stop pretending the prose is the interactive part. |
| **2** | No beginning, middle and end — an explorable map has no arrival | **REVERSED** | **The Any-Exit Close (F7)** plus **the Unfinished Sentence (F2)**. The Close is not an end-screen; it is a function of the Ledger available at any second via `Esc Esc`. At minute eleven it prints the twelve-line argument with the lines the student can defend set in full — carrying their own numbers and their own wrong first guesses — and the lines they cannot set greyed, each with what it would cost to earn it ("90 seconds"). The last line is a text field: the through-line sentence, in their words, signed, which becomes the header of the printed revision sheet. Meanwhile the status bar has carried that sentence, with blanks, since second one, so the ending is visible from the beginning and clicking a blank navigates to the beat that fills it. **Why this beats print:** a chapter has exactly one conclusion and it is only true for the reader who reached page 40. We can compute a correct, honest conclusion from partial evidence — and a conclusion that names its own gaps teaches better than one that pretends there are none. |
| **3** | A reader holds three paragraphs in tension; a UI serialises everything | **NEUTRALISED** | The specific case the brief names is answerable and we answer it exactly: the **Hold All Four** panel for abolition — a four-quadrant, non-scrolling, no-tab, no-hover, no-click layout in `dossier` at ≥62rem carrying £20m to owners / apprenticeship to 1838 / the West Africa Squadron's real cost / Indian indenture from 1834, all four in view simultaneously, with the *interaction* being which one you promote to the top — an act that forces the tension rather than resolving it, and is recorded in the Ledger as a position. Same pattern for Waitangi (see 9) and for the Kenya ratio (see 10). **The standing concession:** below 62rem this degrades to a stack, and we do not claim to have won the general case. Layout discipline is a print virtue we can copy in specific places and cannot copy everywhere. Print CSS restores all four to one page. |
| **4** | A map makes territory the unit of analysis, and weights by area — the chapter's thesis says otherwise | **REVERSED** | Three mechanisms, all on the map itself, because the fix has to be in the grammar and not in a caption. (a) **The Definition Switch (F10)**: keys `1`–`4` hold the year and swap what "British" means — claimed (`controlDegree ≥ 1`), administered (`≥ 3`), controlled (`= 5`), influenced (`informal-sphere`, degree 0) — with the km² and population readout updating live. The chapter's own sentence ("*a quarter was claimed; rather less administered; less again controlled*") stops being a sentence and becomes three pictures of one year. (b) **The Value Cartogram (F11)**: press `V` and unit size stops meaning land area and starts meaning people, revenue, enslaved people embarked, soldiers raised. Barbados swells past Canada in 1750, in place, keeping position and colour so the student's spatial schema survives the re-encoding. (c) **The Stitching layer**: Gibraltar, Malta, Aden, Ceylon, Singapore, Hong Kong, the Falklands, St Helena, Ascension drawn at constant *screen* size with the cable-and-coal network as edges — the units index already marks all of these `tiny: true`, so the layer is one filter away. The dots stop being invisible and become the skeleton. |
| **5** | Informal empire is unmappable, so the app reproduces the lie it was built to expose | **REVERSED** | The data model already has the two fields: acquisition mechanism `informal-influence` and status `informal-sphere` at `controlDegree: 0` (DATA_MODEL §3.2, §3.3). The units exist — `ar-buenos-aires`, `iran`, `turkey`, `uruguay`, `thailand`, `oman`, `macau`, `cn-weihaiwei` — and where no polygon exists (Shanghai and the other treaty ports) the event's `links.places` point coordinates carry it. **The interaction that does the teaching:** hold 1860 and press `1`,`2`,`3`,`4` in sequence. Claimed is modest; controlled is smaller; **influenced is enormous**, drawn as unfilled outlines with a hatched edge and a counter — "British capital and gunboats, no British flag: *n* places". Then the Margin (F6) says the one sentence: *"Every map of 1860 you have ever seen was drawn under definition 3."* Print can assert Gallagher and Robinson. We can make the student watch the map change size under a definition they chose, which is what the argument actually is. |
| **6** | The mechanism column is the pedagogy; a time-slider teaches chronology and unteaches causation | **REVERSED** | **The Mechanism Table (F12)** plus the `mechanism` map layer. The chapter's table 13 is generated live from `acquisitions[].mechanism` (14 closed terms) and `departures[].mechanism` (9), and THINK 13.1 — *go down the column and count* — becomes an interaction the student cannot decline: predict the tally, then see it, then sort by "how left" and watch the map recolour in place. **We beat the printed table on its own ground** because a printed table cannot be sorted, cannot be counted for you, and cannot recolour a map when you sort it — so in practice most students never do the counting the table exists for. And the point that makes the exit choropleth honest is built in: the tally says "mostly negotiated", and the next line, unskippable, is Kenya, Malaya, Cyprus, Aden, Palestine. |
| **7** | Print can render a silence; software must always display something | **REVERSED** | A choropleth cell must pick a colour. An *interface* can refuse, and refusal is something a page can never do because a page is never asked. (a) **The Hole**: units whose record was destroyed render with **no fill at all** — not grey, not hatched, a gap in the paper — with a legend entry reading "no record was allowed to survive here". On a filled map, absence is the loudest mark available. (b) **The Refusing Archive (F13)**: at the Kenya beat a real file list opens (FCO 141 references); clicking a file returns nothing, with the destruction date under Operation Legacy and the 2011 disclosure. The interface fails in front of the student, on purpose, and the failure *is* THINK 11.3. (c) **Contested numbers do not resolve to a value.** Query Partition's death toll and the field returns a range, a "why is this disputed?" affordance and the sentence "no one was counting" — enforced upstream, because `tools/validate-data.js` already fails any `toll` with a number and no note. (d) `confidence: low` spans render with a visibly coarser edge, so uncertainty is drawn rather than footnoted. |
| **8** | A quotation on a page carries its provenance; in an interface it becomes decoration | **REVERSED** | **The Source Card puts Nature-Origin-Purpose above the quotation, at the same type size, in DOM order** — never a byline, never an "i", never a hover — and the card cannot render at all unless `evidence.kind` and `evidence.supports` are present, which the validator already requires. Then the move print cannot make: **the Utility Drill**. In the guided path, a source beat does not advance until the student has answered three things — what is this good evidence *for*, what can it not establish, and name one silence in it — with their answers written to the Ledger and quoted in the Close. The chapter prints THINK 5.1 and the strong Hobhouse model answer; we can require the answer before the page turns, and can show the student their own weak first answer next to the strong one. Print asks. We ask and wait. |
| **9** | Two texts side by side: Waitangi is invisible at map scale | **REVERSED** | The parallel-text panel is trivially buildable — two columns, English and te reo Māori, vertically aligned, in `dossier`, **not a modal**, with the map still on screen. What the page cannot do: **phrase-linked geography.** Hovering or focusing *tino rangatiratanga* highlights the corresponding English clause *and* lights the units confiscated under the New Zealand Settlements Act 1863, with the hectares counted in the stage note. The translation dispute acquires an acreage in front of the student. A third column carries the afterlife — the Wars of 1845–72, the Tribunal still sitting. This is exactly rubric C3 anchor 5: geography doing explanatory work the prose alone could not do. Print's version is excellent and static; ours is the same comparison with the consequence attached to the words. |
| **10** | Disproportion is a prose fact, not a spatial one | **REVERSED** | **The Value Cartogram (F11)** again, plus arithmetic the app does out loud. Kenya 1952–60: 32 European settlers killed; 1,090 hanged; over a million Kikuyu moved into guarded villages; £19.9m to 5,228 claimants in 2013. The map holds Kenya's shape and re-scales the *dots inside it* — one dot per hundred detained, one per settler killed — and the app states the ratio in a sentence rather than leaving the division to a reader who mostly will not do it. The brief's own complaint is that Kenya is "the same shape in 1952 and 1963, no larger for the camps". Correct — under an area encoding. We can change the encoding at one keystroke and the shape can be as large as the camps. |
| **11** | A book can ambush the reader; an app's users route around what they don't click | **REVERSED** | **Complication Gates (F5).** Five of them, placed on the spine's *only forward edge* — the transition the student most wants to make — never on a side road. Each demands a choice between two uncomfortable positions; there is no "OK" button, because an acknowledgement is not a commitment. And the part print cannot do: **the gate is aimed.** It fires on a Ledger predicate, so the complication that appears is the one that damages the claim *this* student just made. A student who never held the belief gets a different gate. Declining is permitted (we do not trap people), is recorded, is re-offered on rejoining the spine, and is named in the Close: *"You skipped the complication about Ireland. Here it is."* Print's ambush is universal and un-aimed and lands on many readers who did not need it. Ours is a self-refutation addressed to a specific person, by name, about a specific sentence they wrote three minutes ago. |
| **12** | Engagement metrics will quietly select against the material that matters | **NEUTRALISED** | Three defences, and none of them is a promise to be virtuous. (a) **You cannot optimise a number you never collect.** `docs/METRICS.md` fixes the schema at seven fields — completion of the path, first-attempt accuracy per T-item, prediction-error rate per `[PREDICT]`, whether the through-line got completed, delayed-retrieval accuracy on return, gates declined, and Close-reached-at-minute. There is no time-on-page field, no click count, no session length, and a CI test fails the build if any other key is written to the metrics store. (b) **The structural rule:** *load-bearing content lives on the spine or inside a gate; nothing load-bearing is a pin.* Naoroji's drain, the collaboration thesis, 1909→1947 and THINK 15.1 are beats and gate contents, so they cannot be routed around and their value cannot be measured in taps. (c) **Drama gating:** no animation of consequence plays before a committed prediction — the scramble sequence is unlocked by a guess about *how* the borders were made, and it plays with a treaty counter, not an area counter. **Why only NEUTRALISED:** a future owner can delete the test. This is a governance defence with an architectural lock, not a law of physics, and the brief is entitled to be sceptical. |
| **13** | A page carries its own evidence base; an app buries it in a build | **REVERSED** | **The Auditor's Sheet (F14)** at `#panel=methods`: one printable table of every figure in the app — value, range, source with author/work/year, `confidence`, `contested.note`, and the shard path the row came from — sortable by confidence, so the weakest claims sort to the top. A head of department audits the whole dataset in one sitting **faster than the chapter**, because the chapter's forty contested numbers are scattered across 18,000 words and ours are in one sorted table with the disputes named. Behind it: `tools/validate-data.js` already rejects invented unit ids, missing citations, future-dated citations, tolls without notes, page locators, and placeholder text; `--strict` runs in CI. The brief's fear is "a single wrong row is invisible". A wrong row in our dataset is (a) grep-able, (b) rendered with its provenance next to it, and (c) reported against a stable error code. The chapter's wrong sentence is none of those. |
| **14** | Print has one version; software has a deploy — and curriculum is built on permanence | **CONCEDED** | We do not win this and I will not pretend otherwise. What we do: no build step and no CDN, so a copy on a memory stick runs in 2031; a `content-version` string in the footer **and inside every deep link**, so `#year=1765&sel=bengal&v=2026.1` means in March what it meant in September; stable hash routes documented as a contract in ARCHITECTURE §8, so a teacher sets a link the way they set a page number; a print stylesheet on every panel; and a per-school-year frozen copy in the repo. But a head of history is buying five years, and a browser upgrade is outside our control. **The honest position:** the permanent artefacts are the *printed outputs* — the revision sheet, the auditor's sheet, the parallel-text pages, the exported map and timeline images. The app is the machine that generates a student's page; the page is what survives. Sell the machine on that, not on permanence. |
| **15** | Print has the standing to tell the reader they are wrong; an interface flatters by construction | **REVERSED** | **The Margin (F6).** One editorial voice, one fixed slot (`stage-note`), two sentences maximum, never a modal, and one absolute rule: **it only speaks when it has the student's own record to quote.** "You've spent four minutes in Africa and none in India. Three-quarters of the people Britain ruled were in India. Your mental map is the pink map's mental map." "You said Britain granted independence. Two minutes ago you sorted the 1946 naval mutiny into 'demanded'. Which of those do you want to keep?" It is corrective, unsolicited and faintly rude, and it earns that the way the chapter does — by declaring a stance in the About panel and defending it — plus something print does not have: **a "push back" control that records the student's disagreement verbatim into the Ledger and prints it in the Close, unrewritten.** An interface that argues with you and then publishes your rebuttal under your own name is not flattering you. Print can tell *a* reader they are wrong. We can tell *this* reader what they said, when, and what the evidence was. |

**Tally: 11 reversed, 3 neutralised, 1 conceded.** The concession (14) is real and structural. The
three neutralisations (1, 3, 12) are places where we match print's effect by a different route and
should stop claiming more than that.

---

## 2. THE FOURTEEN FEATURES

Module ownership: features F1–F9 live in a **new module directory `app/js/spine/`** (files:
`index.js`, `ledger.js`, `next-move.js`, `gates.js`, `margin.js`, `close.js`) with `app/css/spine.css`,
registered by one line in `app/js/modules.json`. F10–F14 belong to existing area agents and are
specified here as contracts, not as land grabs.

**One shell request, stated openly:** the store shape is the shell's (ARCHITECTURE §3). The spine
needs one new top-level key, `spine: { ledgerVersion, thesisSlots, dueCount, closeAvailable }` — four
scalars, no payload — plus actions `ledgerAppend`, `openClose`. Until the shell owner grants it, the
module keeps its state internally and persists via `util.storage`, mirroring nothing. **The Ledger
itself never enters the shared store**; it is too big and nobody else should read it directly.

---

### F1 — The Ledger
**Purpose.** Turn everything the student commits to into a record of positions, so a conclusion can
be computed rather than printed.
**Student-visible behaviour.** Invisible while working. Every commitment writes one line. Pressing
`L` (or the pen mark in the status bar) opens a drawer of those lines *as sentences in the student's
voice*, newest last: "I said 40% of the empire was British-descended. It was under 2%." "I chose:
Ireland was both victim and agent." "I disagreed: the app says 'granted' is the loser's word. I said
Britain still chose the date." Each line links back to the map state where it happened.
**Data.** `LedgerEntry { id, t, misconceptionId, beatId, kind: 'predict'|'sort'|'classify'|'gate'|'dissent'|'found'|'source-drill', prompt, youSaid, evidence: { value, range, sourceIds[] }, verdict: 'confirmed'|'corrected'|'declined', year, unitIds[], at }`. Persisted at `bea.ledger.v1` via `util.storage`.
**Lives.** `app/js/spine/ledger.js`. No slot; other modules write to it by `bus.emit('ledger:append', entry)`.
**Proof sentence.** *"I said forty per cent were British. It was under two. I remember it because it was my number that was wrong."*

### F2 — The Unfinished Sentence
**Purpose.** Give the app a visible ending, and a visible distance to it, from second one — without a progress bar.
**Student-visible behaviour.** The §2.3 through-line runs along the status bar with blanks:
"Britain's empire started as ______ worked by ______, became a ______ that ended up ruling ______…".
A blank fills — in the student's own answer, not ours — when the Ledger earns it. Clicking a blank
navigates to the beat that fills it. When the last blank fills, the strip pulses once and the Close
button becomes primary. It never nags and never blocks.
**Data.** `thesisSlots[] { n, label, requires: [T-ids], filledBy: ledgerPredicate, beatId }` — a small
authored file, `app/js/spine/thesis.json`.
**Lives.** `app/js/spine/index.js`, slot `statusbar`.
**Proof sentence.** *"I could see the sentence I was building the whole time, and I finished it."*

### F3 — Next Move
**Purpose.** Guarantee that from any state there is exactly one obvious next step, so the app never
dead-ends — and that it is a suggestion, so the app never becomes a slideshow.
**Student-visible behaviour.** One persistent control, always the same place, keyboard `N`, labelled
with a *claim* and a *price*, never a task: "You've never seen what Egypt was legally called in 1890.
40 seconds." Pressing it sets the map state and starts the beat. Ignoring it costs nothing and it
re-ranks silently after every state change. Ranking order: unfilled thesis slot > retrieval item now
due > declined gate > `[CORE]` beat not done > `[EXT]` beat nearest the current map state.
**Data.** `beats[] { id, t, lo, core: bool, prereq: [beatIds], cost_s, mapState: { year, layer, sel, view }, kind: 'present'|'retrieve' }` — authored by the tours agent, consumed here.
**Lives.** `app/js/spine/next-move.js`, slot `toolbar`.
**Proof sentence.** *"I never had to wonder what to do next, and I never once felt railroaded."*

### F4 — Mode Duality (Wild ↔ Spine)
**Purpose.** Make free exploration feed the guided argument instead of competing with it — the single
hardest thing on the list, and the reason hypertext usually loses to a chapter.
**Student-visible behaviour.** Two directions.
*Spine → wild:* leaving a beat keeps the four-colour spine band on screen and carries the beat's open
question into the stage note ("open question: which of these was actually ruled from London?"). You
are not lost; you are off-piste with a question in your hand.
*Wild → spine:* every substantive fact in a dossier carries a `claimId`. Opening it stamps
`kind: 'found'` in the Ledger. When the spine later reaches a beat whose claim you already found, the
beat **converts from presentation to retrieval**: instead of showing you the Diwani, it says *"You
found this yourself at minute six. Say what the Diwani was."* Nothing is skipped and nothing is
repeated; exposure upgrades presentation into production.
**Data.** `claimId` on dossier facts (a `panels`/data contract); `seen: Map<claimId, { mode: 'wild'|'spine', year, at }>`.
**Lives.** `app/js/spine/index.js`; contract: `panels` emits `claim:seen { claimId, territoryId, year }`.
**Proof sentence.** *"Wandering off didn't cost me anything — it turned the tour into questions instead of slides."*

### F5 — Complication Gates
**Purpose.** Put self-refutation directly in the student's path, aimed at the claim they just made.
**Student-visible behaviour.** Five gates, each on the spine's only forward edge. Each presents one
COMPLICATION and two positions; there is no dismiss button, because an acknowledgement is not a
commitment. Choosing writes to the Ledger and the Close quotes it. Declining is allowed via "not now",
is recorded as `verdict: 'declined'`, is re-offered on rejoining the spine, and is named at the Close.
**The five, and where each sits:**
1. *After the Atlantic chapter:* African states and merchants as active suppliers — and the ~20,000
   enslaved people for whom British lines in 1776–83 were the road to freedom.
2. *After Ireland is introduced as the first colony:* Irish people as agents of empire, wildly out of
   proportion to their numbers, as soldiers, settlers and administrators.
3. *After the dominion/self-government beat:* responsible government as intensified rule — the
   Numbered Treaties and the residential schools, "cultural genocide" in the TRC's words, 2015.
4. *Before the dissolution close:* Hong Kong 1997 — profitable, stable, handed over because a lease
   expired. The affordability model the student has just assembled does not explain it.
5. *At the ledger beat:* THINK 15.1 — the balance-sheet framing assumes costs and benefits fell on the
   same people; they did not. "Worth it *to whom*, measured *how*, compared with *what*?"
**Data.** `gates[] { id, afterBeat, trigger: ledgerPredicate, complication, options: [2], evidence, sourceIds[] }` in `app/js/spine/gates.json`.
**Lives.** `app/js/spine/gates.js`, slot `overlay` (over the map; the map never disappears).
**Proof sentence.** *"Twice it showed me something that wrecked what I'd just decided, and I couldn't click past it."*

### F6 — The Margin
**Purpose.** Give the app the standing to tell *this* student they are wrong.
**Student-visible behaviour.** One voice, one slot, a different typeface, two sentences maximum, never
a modal, at most six times per session with a 90-second cooldown. It fires only on a real condition
computed from state plus Ledger, and it always contains the student's own data. Every note carries a
**push back** control; pressing it opens a one-line field, and the dissent is stored verbatim and
printed in the Close under the student's name, unedited.
*Examples of real firing conditions:* region-dwell share versus 1913 population share; the word
"granted" chosen in a sort while the naval-mutiny item was sorted into "demanded"; four consecutive
`[PREDICT]` items answered correctly (→ *"You're guessing well. Try the harder layer"*); a Ledger
converging on a good/bad verdict (→ the reframe: to whom, measured how, compared with what).
**Data.** `marginRules[] { id, when: (state, ledger) => bool, text: ctx => string, cooldown_s, maxPerSession, tone }` in `app/js/spine/margin.js`. Copy owned by the copy agent, lint-checked against the §7 banned strings.
**Lives.** `app/js/spine/margin.js`, slot `stage-note` (second child, `data-owner="spine"`; coordinate with the map agent).
**Proof sentence.** *"It told me my mental map was the pink map's mental map, and it was right."*

### F7 — The Any-Exit Close
**Purpose.** Make every stopping point an arrival, and make the conclusion be about the student.
**Student-visible behaviour.** Available at any second (`Esc Esc`, or the Close control which is
always present and becomes primary when the thesis sentence completes). It prints the twelve-line
argument: lines the student can support are set in full, carrying their own numbers, their own first
wrong guesses and their own gate choices and dissents; lines they cannot are set greyed with the
evidence they are missing and the price of getting it ("90 seconds — the princely-states toggle").
The last line is a field: the through-line sentence, in their own words. They sign it. Then the refusal
of closure: 1997 fades, fourteen dots remain, and three `[EXT]` doors open.
**Data.** `closeLines[] { n, text, requires: [T-ids], studentSlots: [ledgerRefs] }` in `app/js/spine/close.json`; everything else from the Ledger.
**Lives.** `app/js/spine/close.js`, slot `overlay`.
**Proof sentence.** *"I stopped at minute eleven and it still told me exactly what I could and couldn't argue, with my own sentence at the top."*

### F8 — The Revision Sheet
**Purpose.** The permanent artefact — the one thing that outlives the deploy, and the one thing a
coursebook physically cannot make.
**Student-visible behaviour.** One A4 page, generated from the Ledger, printable from any state with
`Ctrl/Cmd+P`: the signed sentence at the top; the four phases with their engines; the six colonised
people this student actually named; the three things they got wrong with the map state where the
evidence lives, as deep links; two contested numbers with their ranges and why; the content version.
No branding, no QR code, wide left margin for pencil.
**Data.** Ledger + `content-version` + `thesisSlots`.
**Lives.** `app/js/spine/close.js`; needs `app/css/print.css` (shell coordination).
**Proof sentence.** *"I printed the sheet and it had my mistakes on it, not somebody's generic summary."*

### F9 — The Re-ask Queue
**Purpose.** Make it stick a week later, which is the actual bar (§3 spacing plan, Cepeda et al.).
**Student-visible behaviour.** Within the session: a missed item returns at least six minutes later,
as production, never as re-presentation, and a wrong answer returns the student to the *map state*
where the evidence lives rather than to a paragraph. Across sessions: on the next visit the app opens
with three questions from last time — "before you carry on" — then hands the student back to exactly
where they were, map state and all. No accounts; `localStorage` only; explicitly clearable.
**Data.** `dueAt` on Ledger entries with expanding intervals (same session → +1 day → +7 days → +30);
`quiz` reads the queue rather than owning it.
**Lives.** `app/js/spine/ledger.js`; contract with `app/js/quiz/`.
**Proof sentence.** *"I opened it a week later and it asked me the three things I'd got wrong. I got two of them."*

### F10 — The Definition Switch  *(map + legend)*
**Purpose.** Make "what counts as British" a threshold the student sets, not a property of a place.
**Student-visible behaviour.** Keys `1`–`4` on a held year: **claimed** / **administered** /
**controlled** / **influenced**. The recolour is instant (`statusAt(year)` is memoised and `===`-stable,
so this is a re-paint, not a re-query) and the legend prints the definition in one sentence plus the
live totals and the delta from the previous press: "1913 — claimed 35.5m km²; controlled 12.1m km²".
**Data.** `controlDegree` thresholds only: `≥1`, `≥3`, `=5`, and `status === 'informal-sphere'`. Zero new fields.
**Lives.** `app/js/map/` (layer), `app/js/legend/` (definition copy + totals); the beat that requires it is a `tours` beat in Chapter III.
**Proof sentence.** *"A quarter of the world was claimed. I pressed 3 and most of the pink went away."*

### F11 — The Value Cartogram  *(viz + map)*
**Purpose.** Take area away from the map as the measure of importance.
**Student-visible behaviour.** `V` cycles the size metric: land area → people → value of trade to
Britain → enslaved people embarked → soldiers raised → deaths in a named famine. Units morph over
600 ms, keeping position and colour so the schema survives; under reduced motion it cross-fades.
Units with no figure shrink to a dot and the legend says "no figure exists for these", which is itself
a lesson. Barbados 1750 versus British North America is the set-piece.
**Data.** A new small dataset `app/data/metrics/*.json`: `{ unitId, metric, year, value, range?, sourceIds[] }`. Sparse is fine and honest. **Requires the data agent's agreement** and registration in the contested-number register (§9.2) for every figure with a real range.
**Lives.** `app/js/viz/` (scale computation) + `app/js/map/` (render).
**Proof sentence.** *"Barbados was bigger than Canada in 1750, and I watched it happen."*

### F12 — The Mechanism Table  *(panels + map)*
**Purpose.** Teach *how*, which the time-slider structurally hides.
**Student-visible behaviour.** A full-width sheet under the map: every territory, added-how, left-how,
generated from the data. Before it reveals the tally it asks for a prediction ("how many left by
negotiation, out of 31?"). Sorting a column recolours the map in place. Sorting by "how left" is
followed, unskippably, by the counter-line: mostly negotiated — and Kenya, Malaya, Cyprus, Aden,
Palestine. This is THINK 13.1, done rather than assigned.
**Data.** Already in the model: `acquisitions[].mechanism` (14 terms), `departures[].mechanism` (9 terms), `how`, `counterparties`, `cost.toll`.
**Lives.** `app/js/panels/` (`panelState.sheet = 'mechanisms'`) + a `mechanism` layer in `app/js/map/`.
**Proof sentence.** *"Most of them left by negotiation — and that still doesn't make it peaceful, because of Kenya and Malaya and Aden."*

### F13 — The Refusing Archive and the Hole  *(panels + map)*
**Purpose.** Render a manufactured silence as an experience rather than a sentence.
**Student-visible behaviour.** At the Kenya beat a file list opens with real FCO 141 references.
Clicking a file returns nothing — a stated refusal with the destruction date and the 2011 disclosure,
not an error. On the map, units whose record was destroyed have **no fill**: a hole in the paper, with
its own legend entry. The student then answers one question before advancing: *what happens to the
balance of evidence when one side's records were burned and the other's hidden for fifty years?*
**Data.** A new field, `recordStatus: 'intact'|'partial'|'destroyed'|'withheld'|'released-2012'`, on spans and events — a DATA_MODEL amendment, proposed with its justification, not smuggled in.
**Lives.** `app/js/panels/` + `app/js/map/`.
**Proof sentence.** *"I tried to open the file and it told me it was burned in 1963."*

### F14 — The Auditor's Sheet  *(teacher)*
**Purpose.** Let a head of department check every number in the app faster than they could check the chapter.
**Student-visible behaviour.** Not for students. `#panel=methods` renders one printable table: every
figure in the app with value, range, `confidence`, source (author, work, year, `supports`), the
`contested.note`, and the shard path — sortable, defaulting to weakest-confidence-first. Above it: how
territories were defined, what "controlled" means here, what we chose and what we rejected, the content
version, and the date of the last clean `--strict` validator run.
**Data.** Generated by extending `tools/data-index.js`; no new authoring.
**Lives.** `app/js/teacher/`.
**Proof sentence** *(the teacher's)*. *"I checked forty numbers in twenty minutes and found where each one came from."*

---

## 3. THE STATE MODEL, IN ONE PAGE

The reason free-exploration and guided-argument usually fight is that products model them as two
*modes*. They are not modes. They are two **write paths into one record**.

```
                    ┌──────────────────────────────────────┐
   spine beat  ────►│                                      │
   (present)        │            THE LEDGER                │◄──── dossier opened
                    │  entries: predict | sort | classify  │      in free explore
   gate choice ────►│           gate | dissent | found     │      (kind: 'found')
                    │                                      │
   source drill ───►│  every entry: a sentence in the      │◄──── margin push-back
                    │  student's voice + the map state     │
                    └───────────────┬──────────────────────┘
                                    │  read by
              ┌─────────────────────┼──────────────────────┬───────────────────┐
              ▼                     ▼                      ▼                   ▼
      Unfinished Sentence     Next Move rank         Gate targeting        Any-Exit Close
      (which blanks fill)     (what is due)          (which complication)  (what you can argue)
```

Three rules make it work:

1. **Presentation downgrades to retrieval, never to nothing.** A claim found in the wild is never
   skipped on the spine; it is asked instead of told. Skipping loses the second encounter, which is
   where the learning is (§3 spacing plan).
2. **The spine band never leaves the screen, and the map never leaves the screen.** Off-piste is a
   place *inside* the story, marked as such, not an exit from it.
3. **Only commitments are recorded.** Looking is not a commitment; saying is. This is what keeps the
   Ledger short enough to render as prose and what keeps the Close honest.

---

## 4. THE THREE MOVES ONLY SOFTWARE CAN MAKE

### Move 1 — Hold the year, change the definition of control
Press `1`, `2`, `3`, `4` on 1913 and the same year renders as *claimed*, *administered*, *controlled*,
*influenced*, with km² and population recomputed each time. Press them on 1860 and the map goes from
modest to enormous when you reach *influenced*.

**Why it teaches better, not just why it is clever.** The misconception is not that students think the
empire was too big or too small. It is that they think "British" is a **binary property of a place**.
Every printed map in every book they have ever seen reinforces that, because a printed map must pick
one definition and then can never mention that it picked. The definition switch makes the threshold
visible *as a choice the student made*, and the pink area is seen to depend on it. That is the actual
historiographical operation — Gallagher and Robinson's whole argument is a change of threshold — and
the student performs it rather than reading about it. It also disposes of two of the brief's charges
at once: the "flat colour" problem (4) and the unmappability of informal empire (5). Print states the
chapter's own best sentence about claimed/administered/controlled. We make it the interface's grammar.

### Move 2 — Keep the map object, change what size means
`V` re-scales every unit by people, by trade value, by enslaved people embarked, by soldiers raised,
by famine deaths — in place, same positions, same colours, 600 ms.

**Why it teaches better.** A bar chart next to a map asks the student to do the hardest cognitive
operation in the whole session: relate two different representations of the same objects. Most will
not, and split attention is the best-documented way to waste working memory (Mayer, Sweller). Morphing
*the same object* removes the relating step entirely — the student's existing spatial schema stays
loaded and only the encoding changes underneath it. That is why this beats both the map and the chart:
it is one object with two meanings rather than two objects with one meaning each. And it directly
repairs the brief's strongest structural claim (4, 10): area is the wrong weight, Barbados at 166
square miles outranked North America, and the chapter can only *say* so. We can make the island grow.

### Move 3 — Remember what the student said, and use it against them later
The Ledger stores commitments as sentences. The gates fire on them. The Margin quotes them. The Close
is assembled from them and printed under the student's signature, dissents included.

**Why it teaches better.** Conceptual change requires the wrong model to be *activated, contradicted by
evidence the learner processes themselves, and replaced* (Chi; Vosniadou). Print can do the first and
second for a generic reader, and the hypercorrection effect — the finding that confidently-wrong
answers are corrected best — needs the correction to arrive **attached to the specific error**. A page
cannot know which error you made, so it must address all of them, which means it addresses none of them
to you. We can hold a student's own wrong number for twenty minutes and produce it at the moment the
evidence lands: *"You said forty per cent. Here is 412 million and here is where the settlers were."*
And the same machinery answers the two charges the brief thought were unanswerable: an interface *can*
tell a reader they are wrong (15), because it can quote them; and its ambushes are *better* than print's
(11), because they are aimed at the belief this reader actually holds instead of the belief the author
assumed. This is the move. The other two are maps. This one is the reason the app should exist.

---

## 5. WHAT I WOULD CUT

Named so nobody has to re-argue them. A lesser version of this app ships every one of these.

- **Scores, points, streaks, badges, "8/10!"** — they convert a retrieval system into a performance
  system. The entire engine of §4 is getting students to *commit to a wrong answer*, and nobody
  commits to a wrong answer in front of a scoreboard. The quiz shows what you missed and where the
  evidence is. It never shows a headline total.
- **Any leaderboard or social layer.** Same reason, louder: it makes being wrong public, and being
  wrong has to be the cheapest thing in the app.
- **"Explore freely!" as the landing state.** Kirschner, Sweller & Clark (2006). A novice dropped into
  a sandbox arrives at the Scramble not knowing what a protectorate is. The default is the spine; the
  sandbox is one click away, warns nothing and blocks nothing.
- **A tour of the interface, coach marks, a welcome modal.** Every second spent teaching the UI is a
  second not spent on the history, and the opening beat must be a question the student answers, not a
  greeting (§8, 00:00).
- **Tooltips and hovers carrying anything that matters.** No touch, no keyboard, no print, no
  screen reader. Already banned in §5.7; I would make it a component-checklist gate, not a preference.
- **A "was the empire good or bad?" slider, poll or thumbs.** The most tempting engagement feature on
  the board and the one that would do the most damage: it is precisely the exam habit that produces
  sourceless moralising, it is refused by §1, and the chapter's own THINK 15.1 explains why the
  balance-sheet frame is broken. The replacement, if we want that interaction's *feel*: pick a
  beneficiary and a metric — "worth it to whom, measured how" — and get the evidence for that pair.
- **Full-screen content modals.** They destroy the constant spatial frame, which is our single biggest
  schema advantage over a book (§8.1). Content goes in the dossier, the sheet, or an overlay that
  leaves the map visible. If it must cover the map, it is the wrong component.
- **A 3D globe.** It is the demo everyone asks for and it costs us the projection argument — you
  cannot show Mercator against equal-area on a sphere, and M4 is the app's signature interaction.
- **Search as a primary affordance.** Correct to have, wrong to put in the masthead: a prominent search
  box is an invitation to arrive anywhere with no schema. Demote to `Ctrl+K`.
- **Any animation that plays before the student has predicted something.** The scramble sweep, the
  1922 maximum and the handover clock are the three most watchable things in this history and three
  of the least informative. Ungated, they are the exact failure the brief predicts in charge 12.
- **Time-on-page, click counts, session length, heatmaps.** Not collected, not collectable — enforced
  by a test, so the pressure the brief describes has nothing to act on.
- **An "ask the atlas" chat box.** It would fabricate citations under pressure, and one fabricated
  citation caps rubric C4 at 0 and the whole artefact at 2. Categorical.
- **Accounts, sign-in, cloud sync, class dashboards.** Offline is a BRIEF rule, and anonymity is what
  makes committing to a wrong answer cheap. A teacher who wants evidence of work gets the printed
  revision sheet, which is better evidence anyway.
- **A second spine.** Four phases (§2.1). Anyone who wants a fifth proposes an amendment.

---

## 6. THE ONE THING TO TEST FIRST

Before any of this is built, run the cheapest possible falsification: a paper prototype of **the Close
at minute eleven**. Show ten students the twelve lines with four filled from their own answers and
eight greyed, and ask them what they can and cannot argue. If they cannot say it, the whole stance is
wrong and the app should be sequenced as a rail after all. If they can, then the brief's second charge
— the one it thinks is fatal — is the place where we are strongest, and everything else follows.
