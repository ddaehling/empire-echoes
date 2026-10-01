# RESPONSE: INVERT THE MEDIUM

**Stance:** the app's atomic unit is not a territory-plus-date. It is a **mechanism** — a named causal
machine with inputs, a loop, and a failure condition — and an **argument** that mechanisms support.
The map is not the subject. The map is an *exhibit* the mechanism calls as a witness, and one the
student is taught to cross-examine.

**Author:** counter-design agent (stance: invert). **Scope:** design only. Nothing outside
`docs/counter/` is touched. Where a feature needs state, data or geometry owned by another agent, it is
marked **⟶ REQ** and stated as an amendment request, not as a decision.

---

## 0. The one-paragraph argument

`WHY_PRINT_WINS` is right about the medium and wrong about the product. Its charge sheet assumes a
choropleth-first app whose primary act is "colour the polygons for year Y". That app deserves to lose:
its grammar says *area = importance* and *colour = control*, and both are the errors the chapter exists
to correct. So we do not build it. In this design the landing view is a **control gradient over a
value cartogram**, the default index is **by mechanism, not by year**, and the persistent right-hand
object is not a territory dossier but a **twelve-claim argument the student is assembling**. The map
still exists, is still beautiful, and is still constantly on screen — but it is demoted from *the
thing being taught* to *the evidence being interrogated*, and it carries a permanent byline saying what
projection it is in, what its colour currently means, what year exactly, and what it cannot show.

Three of the fifteen charges are architecturally true and I concede them. Two more I concede in part.
The remaining ten I think we beat, and in six cases beat badly.

---

## 1. VERDICT ON THE FIFTEEN

Verdicts are **CONCEDED** (print wins; we mitigate and say so), **NEUTRALISED** (we get to parity by a
different route) or **REVERSED** (we teach this better than the page can).

| # | Print's charge | Verdict | The mechanism that does the work |
|---|---|---|---|
| **1** | A sustained causal argument dies in a tooltip | **REVERSED** | **F1 Mechanism Deck** + **F9 Argument Spine**. A mechanism is a first-class data object (`app/data/mechanisms/*.json`) with `inputs[]`, `steps[]`, `breakConditions[]`, `failsFor[]`. The student *runs* `revenue → sepoys → conquest → revenue`, then cuts an input and watches it stall at a named step. Print asserts a feedback loop in a subordinate clause; we execute one. The Argument Spine rail (slot `dossier`) holds the twelve claims and fills each one in with the evidence *this student produced*, so the argument accumulates across the session instead of being restated. |
| **2** | No beginning/middle/end; nothing lands | **NEUTRALISED** | **F9 Argument Spine** + **F10 Wrong-Question Corrector**. Default state is the guided path (DIDACTIC_SPEC §5.3), and the ending is manufactured, not hoped for: at 00:00 the student commits a verdict; at 00:29 the Spine returns all twelve claims filled and asks them to write the verdict again, and F10 corrects the *framing* of what they typed. The close is the student's argument, evaluated — better than an author's conclusion they read. **Honest residual:** a student who takes the "explore on my own" escape at minute 3 gets a weaker close (the Spine stays visible and ghosted, which is a nag, not an ending). Print's ending is free; ours is engineered and can be dodged. |
| **3** | Four facts must be simultaneously present; a UI serialises | **REVERSED** | **F11 Who Gained / Who Paid**. One frame, in `map-overlay`, four non-dismissible claim cards (the £20m to owners, apprenticeship to 1838, the West Africa Squadron's real cost, Indian indenture from 1834) all on screen at once with no tabs and no accordion. The interaction is not "read all four", which is what print offers — it is **drag each onto the party that bore it**. The frame then shows the columns do not cancel, which is THINK 15.1's point made structural. Print can hold four facts in tension; it cannot make the reader *sort them by incidence* and discover the balance-sheet framing is broken. |
| **4** | Area = importance; the grammar contradicts the thesis | **REVERSED** | **F3 Encoding Switch** + **F2 Control Gradient** + **F4 Network View**. The landing view is not a choropleth. `encoding` cycles land-area → population → trade value → officials-per-100k → soldiers-raised as a non-contiguous Dorling cartogram from `unitMeta.centroid`; Barbados 1770 swells past British North America on one keypress. Chokepoints (`gibraltar`, `malta`, `ye-aden-colony`, `singapore`, `hk-hong-kong-island`, `ascension`) size by *traffic*, not area, so they stop being dots. And the flat fill is abolished outright: `controlDegree` 0–5 renders as engraved hatch density, `partial: true` as split hatch. |
| **5** | Informal empire is unmappable; the app reproduces the lie | **REVERSED** | The data model already carries it: `mechanism: "informal-influence"` and `status: "informal-sphere"` at `controlDegree: 0`, and `units.index.json` already has `ar-buenos-aires`, `iran`, `turkey`, `thailand`, `uruguay`, `cn-weihaiwei`, `macau`, `japan`. **F2** renders degree 0 as an *edgeless wash* radiating from port nodes with **no coastline stroke** — deliberately unbounded, because that is what it was. It is **on by default in the 1830–1880 view**, not a checkbox. **F1**'s `M-INFORMAL` mechanism ships with Fieldhouse's falsifiability objection as a built-in warning card. Print gives you one map of 1860; we give you the same 1860 under three definitions of control at one keystroke. |
| **6** | The mechanism column is the pedagogy; a slider teaches only *when* | **REVERSED** | **F8 Mechanism Ledger**. The default sort of the whole atlas index is `acquisition.mechanism` / `departure.mechanism`, **not** year. THINK 13.1 becomes a live count: 14 acquisition mechanisms and 9 departure mechanisms with running totals, predict-then-reveal on "how many left by war?", and clicking a mechanism selects every territory it produced across four centuries at once. The time slider still exists; it is no longer the primary index, and it never runs without the causal chip attached to what is changing. |
| **7** | Print can render a silence; software must display something | **REVERSED** (with a discipline caveat) | **F7 Silence Layer**. Two devices. (a) No contested figure ever renders as a point: `confidence: "low"` or `contested.isContested` forces a **range bar whose width is the disagreement**, with the reason, per the §9.2 register. (b) The signature move — **Operation Legacy**: a toggle between `archive: "as-surviving"` and `archive: "as-returned-2011"`. Flipping to the pre-2011 state **deletes fields from the Kenya dossier in front of the student**, shrinks the source list, and turns a number into a range and then into a marked absence. Software can *perform* a manufactured silence; a page can only describe one. **Caveat:** print gets this discipline free, we have to enforce it — so the validator must fail a point-value on any registered contested figure. |
| **8** | A quotation in an interface becomes decoration | **REVERSED** | **F5 Attribution Gate**. Every `source` object renders **nature-origin-purpose first, in the same type size as the quotation**, and the quotation is masked until the student answers "what was this made for?" from three options. Source G renders its full chain — *Rhodes → Stead, 1895 → Lenin, 1917* — drawn on a 22-year mini-axis, with `cannotTellYou` printed under it. Print puts the attribution above the quote and prays you read it; we can enforce the reading order. That is a straight inversion of the charge. |
| **9** | Two texts side by side: Waitangi is invisible at map scale | **REVERSED** | **F6 Parallel Text frame**, rendered *into the stage* (`map-overlay`), never a modal — the map stays behind it, which is the whole point of not becoming "a book with extra steps". Two columns, `sovereignty` / `kāwanatanga`, `possession` / `tino rangatiratanga`, plus the thing print cannot do: clicking `kāwanatanga` opens a **concordance** showing the same missionaries using `rangatiratanga` for "kingdom" in the Lord's Prayer, and a one-click jump from the panel to the 1863 confiscations drawn on the map underneath and the Tribunal still sitting. The comparison stays on screen while its consequence is drawn beneath it. |
| **10** | Disproportion is a prose fact with no cartographic footprint | **REVERSED** | **F11**, Kenya instance, in `[PREDICT]` mode. The numbers (32 settlers killed; over a million villagised; 11,503 recorded killed; 1,090 hanged; £19.9m to 5,228 claimants in 2013) appear as consecutive claim cards — but before the reveal the student is asked to **estimate the ratio themselves**. Print's pedagogy is that the reader does the division; ours is that the reader *commits to a division and is wrong*, which is strictly stronger (hypercorrection, DIDACTIC_SPEC §8.1). The map does no work here and is told to shut up: the frame occludes it and the stage-note says so. |
| **11** | A book can ambush; users route around what they don't click | **REVERSED** | The complication is not a box beside the flow — it is **a required input to the machine the student is running**. In `M-COLLAB` you cannot execute step 2 without recruiting intermediaries, and the recruitment step names Mir Jafar, the Jagat Seths, the sepoy, the Fante merchant and the warrant chief. In `M-PLANTATION` you cannot run the supply step without African suppliers on the coast. The self-refutation arrives as a **consequence of the student's own action**, which no page can arrange. **Honest residual:** this only holds on the guided path; in free-explore the complications become clickable, i.e. optional, i.e. not complications. |
| **12** | Engagement metrics will select against the material that matters | **CONCEDED** | This is a true statement about product process, not about software, and I will not pretend a feature fixes it. The mitigation is a constraint, written down and enforceable: **the app instruments only DIDACTIC_SPEC §8.3's five learning metrics** — path completion, first-attempt accuracy per T-item, prediction-error rate, through-line completion, post-session exploration — **all local, no network, no accounts** (BRIEF rule 2 makes anything else impossible anyway). There is no dwell-time, no click-heat, no "most popular territory". A metric that could rank the scramble animation above Naoroji's drain **does not exist in the codebase**, so no iteration can be driven by it. That is the strongest answer available and it is weaker than a printed page that cannot be A/B tested at all. |
| **13** | A page carries its evidence base; an app buries it in a build | **REVERSED** | **F13 Audit Sheet** at `#panel=audit`: one page, generated at runtime from `data`, listing **every number in the app** with its value, its range, its `confidence`, its citation and the citation's `supports` line, sorted contested-first, print-styled to A4. A head of department audits it faster than a chapter because it is sorted by contestedness rather than scattered across forty pages — and because `node tools/validate-data.js --strict` already fails the build on a toll with no note, a low-confidence claim with no `contested.note`, a page locator, or a fabricated-looking citation. Print's evidence base cannot be diffed between editions. Ours can. |
| **14** | Print has one version; software has a deploy | **NEUTRALISED** | Substantially, not wholly. Mitigations, all already BRIEF-mandated or cheap: no build step, no framework, no CDN — a static folder that runs from a USB stick or a school intranet in 2031 the same as today; a **content version string** in the footer and in every deep link's audit trail; **stable hash deep links** (`#year=1765&sel=bengal&mech=revenue-loop&step=3`) that a teacher sets like a page number; a **print stylesheet** that turns any state into an annotatable sheet; and the F13 Audit Sheet as the citable artefact. **Honest residual:** a room with no devices, a filtering policy and a dead supplier still beats us, and the head of department buying a five-year scheme of work is right to price that in. |
| **15** | Print has standing to tell you you're wrong; a UI flatters | **NEUTRALISED** | **F10 Wrong-Question Corrector** plus the declared stance. The app writes in the first person and says where it stands (§5.2), it marks retrieval answers wrong and says why, and at the close it **criticises the framing of the student's own sentence**: typing "worth it", "mixed legacy", "both sides" or "good and bad" returns the §15.1 correction — *worth it to whom, measured how, compared with what* — followed by the F11 incidence sort. The standing to be rude is bought with **F13**, not with tone: an app that hands you its whole evidence base and says "check me" has earned one corrective sentence. **Honest residual:** print earns this over 18,000 words of defended position; we earn it in one place and should not spend it twice. |

**Score: 8 reversed, 5 neutralised, 1 conceded, 1 conceded-in-substance (#14 is neutralised with a real
residual, #12 is a straight loss).** The two we lose are both about institutions, not about teaching.

---

## 2. THE FEATURES

Fourteen. **Six are the irreducible core** (F1, F2, F3, F8, F9, F5) — if the budget halves, those ship
and the rest wait. Each spec gives: purpose, student-visible behaviour, data, module home, and the
sentence a student says afterwards that proves it worked.

---

### F1 — The Mechanism Deck `[CORE]`

**Purpose.** Make the causal machine, not the territory, the thing the app is *about*.

**Behaviour.** The deck is six cards. Selecting one opens a stepped diagram in the `overlay` slot with
the map still visible behind it at 40% and the instance territories lit. The student presses **Step**
and each step animates one arrow, printing the sentence that step performs. Then two affordances that
are the point: **Cut an input** (remove Bengal's revenue, remove the Indian sepoys, remove naval
supremacy, remove the collaborators) — the machine visibly stalls at a named step and every territory
the mechanism produced dims on the map; and **Run it on a case it doesn't fit** — pick Hong Kong 1997
or Southern Rhodesia 1965 and the mechanism *refuses*, printing its own `failsFor` note. Fails-for is
compulsory: a mechanism with no cases it cannot explain fails validation, because that is Fieldhouse's
objection turned into a schema rule.

The six:

| id | Name | Loop | Cuts to |
|---|---|---|---|
| `revenue-loop` | Revenue → sepoys → conquest | diwani 1765 → land revenue → sepoys → more territory → more revenue | T7, M2, LO3 |
| `collaboration` | Rule through intermediaries | recruit elites → rule cheap → they defect → rule seizes | Robinson 1972; runs **forwards and backwards**, i.e. it is the spine's single engine |
| `outsourcing` | Crown outsources, then nationalises | charter → company overreach → scandal → state takeover | EIC 1773–84, IBEAC 1895, Royal Niger 1900, BSAC after Jameson |
| `plantation` | Buy replacements, not children | sugar → lethal labour → cheaper to purchase than to reproduce → the trade persists | T3, T4; Champion §5.2's "single accounting decision" |
| `cost-shifting` | Make the colony pay, break the colony | debt → tax the colony → the colony claims the metropole's own constitutional language → rupture | Stamp Act 1765, Amritsar 1919, RIN mutiny 1946 |
| `informal-control` | Trade with rule only when necessary | access → informal control → local collapse → reluctant annexation | LO11, G&R 1953, with Fieldhouse's objection attached |

**Data ⟶ REQ (new, I would own it).** `app/data/mechanisms/*.json`:
`{ id, name, oneLine, inputs[{id,label,suppliedBy,requiredForStep}], steps[{n, verb, requires[], produces[], sentence, evidence[]}], breakConditions[{id,label,whatHappens,historians[]}], instances[{territoryId, years:[from,to], note}], failsFor[{territoryId, why}], historians[{name,work,year,claim}], evidence[] }`.
Uses existing `data.byId`, `data.acquisitions[].mechanism`, `data.spans[].howControlWorked`.

**Module.** `app/js/mechanisms/index.js` + `app/css/mechanisms.css`. Slot `overlay`.
**⟶ REQ shell:** state key `mechanism: { id, step, cutInputs: [] }`, actions `setMechanism`,
`stepMechanism`, `cutInput`, `uncutInput`; URL key `mech` / `mstep`.

**Proof sentence.** *"The empire ran on a loop: the tax money paid for the soldiers who took more land
to tax. Cut the tax base in 1765 and the conquest stops."*

---

### F2 — The Control Gradient `[CORE]`

**Purpose.** Kill flat colour. Render *degrees* of control, and render informal empire as a field.

**Behaviour.** No unit is ever a single flat fill. `controlDegree` 0–5 draws as engraved hatch density
in one madder ink (`--tenure-*` ramp logic, `--tex-*` patterns, per DESIGN §2.4/§6.12): degree 5 is
solid plate, degree 3 is open hatch, degree 1 is stipple, degree 0 is an **edgeless wash with no
coastline stroke** radiating from that unit's `point`. `partial: true` draws split hatch. Above it, a
three-position control in `toolbar` — **claimed / administered / controlled** — which rethresholds the
whole map (`≥1` / `≥3` / `=5`) in one keystroke, on the same year. Section 1 of the chapter, as a
percept.

**Data.** Entirely existing: `data.statusAt(year)` already returns `controlDegree`, `partial`,
`contested`, `circa`. `informal-sphere` at degree 0 already exists in DATA_MODEL §3.3.

**Module.** A layer inside the map module — **I do not own `app/js/map/`**; this is a spec handed to
the map agent, with the palette handed to design. **⟶ REQ shell:** state key
`controlDefinition: 'claimed'|'administered'|'controlled'`; action `setControlDefinition`; URL key `def`.

**Proof sentence.** *"In 1860 Britain claimed a lot, administered less and controlled less again — and
'the empire' is a different shape depending on which one you mean."*

---

### F3 — The Encoding Switch `[CORE]`

**Purpose.** Break `area = importance` by making area optional.

**Behaviour.** Five encodings, one key each: **land area** (labelled *the poster*), **population**,
**trade value**, **British officials per 100,000 people**, **soldiers raised**. Non-contiguous Dorling
cartogram — one circle per unit at its `centroid`, radius ∝ √value, ~40 iterations of naive repulsion
relaxation in a `requestAnimationFrame` loop; pure vanilla, no layout library, ~120 lines. Transitions
are position+radius tweens at `--dur-deliberate` so the student *sees* Barbados grow and Canada
collapse. Chokepoints size by traffic, not land. Under reduced motion it cross-fades between two static
states instead. The stage-note always names the encoding and its year, because a cartogram with no
label is a worse lie than a choropleth.

**Data ⟶ REQ (data agent).** `app/data/metrics/series.json`:
`{ metric, unit, unitId, values: [{year, value, confidence, range:[lo,hi]|null, citation}] }` — sparse
is fine; the renderer interpolates between known years and **marks interpolated circles with a dotted
edge**, because an invented number rendered as a solid circle is exactly charge #13.

**Module.** `app/js/encoding/index.js` + `app/css/encoding.css`. Slots `toolbar` (the switch) and
`map-overlay` (the circles, drawn over a dimmed base map).
**⟶ REQ shell:** state key `encoding`; action `setEncoding`; URL key `enc`.

**Proof sentence.** *"Barbados was 166 square miles and worth more to London than the whole of North
America. On a normal map you'd never guess that."*

---

### F4 — The Network View

**Purpose.** Champion §4: the empire was a system of communications before it was a territory.

**Behaviour.** Nodes are ports, coaling stations, cable relays and chokepoints, positioned from
`unitMeta.point`. Edges are routes with year ranges and a kind (`sea-route`, `cable`, `coaling`,
`troop-movement`). The interaction is **cut a knot**: close Suez (1956), lose Singapore (Feb 1942),
lose Gibraltar. A breadth-first search from London over the surviving edges with a distance budget
recomputes reachability; routes that lengthen redraw longer and territories that fall out of reach dim
on the map with the new sailing time printed. This is where the Fall of Singapore stops being a date.

**Data ⟶ REQ (new, I would own it).** `app/data/network/routes.json`:
`{ nodes: [{id, unitId, kind, from, to, role, traffic}], edges: [{from, to, kind, from_year, to_year, nominalDays, note, evidence}] }`.

**Module.** `app/js/network/index.js` + `app/css/network.css`. Slot `map-overlay`.

**Proof sentence.** *"The empire was a set of routes with about eight knots in it. Take Suez out and
half of it is suddenly on the wrong side of the world."*

---

### F5 — The Attribution Gate `[CORE]`

**Purpose.** Stop a quotation from being decoration. Enforce reading order, which print cannot.

**Behaviour.** A SOURCE renders **nature / origin / purpose first, at the same type size as the
quotation**. The quotation is masked. One question — *what was this made for?* — three options, commit,
then the quotation reveals with the `cannotTellYou` line permanently beneath it. Source G renders its
provenance **chain** on a 22-year mini-axis: *Rhodes, to the journalist W. T. Stead, 1895 → quoted by
Lenin, 1917, in a pamphlet arguing capitalism causes imperialism*. Source B (Equiano) renders the
Carretta dispute as part of the origin line, not as a footnote, with the LO framing: the dispute
changes *what it is evidence for*, not whether it is evidence.

**Data ⟶ REQ (new, I would own it).** `app/data/sources/*.json`:
`{ id, quote, nature, maker, makerRole, date, madeFor, chain:[{who, what, year}], cannotTellYou, usefulFor[], links:{territoryId|eventId}, evidence }`.

**Module.** `app/js/sources/index.js` + `app/css/sources.css`. Slot `dossier` (inline) and `overlay`
(the drill). Never a hover; never an "i" icon.

**Proof sentence.** *"Rhodes said that to a journalist and Lenin repeated it 22 years later to prove a
point. That changes what it's evidence for."*

---

### F6 — The Parallel Text Frame

**Purpose.** Waitangi, Berlin, and the 1858 Proclamation — the two-column device, in the stage.

**Behaviour.** Two vertically aligned columns rendered into `map-overlay`, with the map still visible
below and around them (the frame is 62ch, not full-screen — it is not a modal, and `Escape` is not
needed to see the map). Word-level anchors: clicking `kāwanatanga` opens the concordance — the same
missionary translators' use of `rangatiratanga` for "kingdom" in the Lord's Prayer. A **"what each side
thought it signed"** toggle swaps in the back-translation. A **"what happened next"** button fires the
1863 New Zealand Settlements Act confiscations onto the map underneath, without closing the frame, and
the last line is the Waitangi Tribunal, still sitting.

**Data ⟶ REQ (new, I would own it).** `app/data/parallel/*.json`:
`{ id, title, date, columns:[{lang, label, articles:[{n, text, anchors:[{term, gloss, concordance[]}]}]}], whatEachSideThought:[…], consequences:[{eventId, year}] }`.

**Module.** `app/js/paralleltext/index.js` + `app/css/paralleltext.css`. Slot `map-overlay`.

**Proof sentence.** *"The chiefs signed the Māori text, and the Māori text gives away governance, not
sovereignty — and the translators knew the difference, because they'd used the other word for
'kingdom'."*

---

### F7 — The Silence Layer / Operation Legacy

**Purpose.** Render a manufactured absence as an event with a date and an author.

**Behaviour.** Two devices. (a) **No point values for contested figures.** Anything in DIDACTIC_SPEC
§9.2 renders as a horizontal range bar whose *width is the disagreement*, with the reason inline
(`--warn` chip). Partition deaths render as a bar from several hundred thousand to a million, not as a
number. (b) **The archive toggle.** A control in `chrome-end`: *the record as it survives (pre-2011)* /
*the record including the Hanslope files (2011–)*. Flipping to pre-2011 **removes fields from the Kenya
dossier in front of the student** — the source list shortens, three claims grey out and are replaced by
a struck-through line, and the range bar widens. A one-line caption names what happened: Operation
Legacy, the FCO's 2011 admission, the 2013 settlement of £19.9m to 5,228 claimants.

**Data ⟶ REQ (data-model agent).** Add to territory:
`archive: { destroyedUnder, destroyedYears, returnedYear, fieldsAffected: [jsonPaths], note, evidence }`.
And a **validator rule**: any figure listed in the §9.2 register that renders as a scalar fails
`--strict`.

**Module.** `app/js/silence/index.js` + `app/css/silence.css`. Slots `chrome-end` and `dossier`.
**⟶ REQ shell:** state key `archiveState: 'as-surviving'|'as-returned'`; action `setArchiveState`.

**Proof sentence.** *"Britain burned or hid the Kenya files, so the numbers we argue about are the
numbers Britain chose to leave us. That's not a gap in the history — it's something that was done."*

---

### F8 — The Mechanism Ledger `[CORE]`

**Purpose.** THINK 13.1 as an interaction. Make *how*, not *when*, the primary index of the atlas.

**Behaviour.** A board — not a table of territories, a table of **mechanisms** — with a live count
beside each. Fourteen acquisition mechanisms, nine departure mechanisms, straight out of DATA_MODEL
§3.2/§3.4. Predict-first: *"Of the territories that left, how many left after a war Britain lost?"*
Commit, reveal, and the reveal is deliberately uncomfortable — most left by negotiation, and the next
card asks whether that makes decolonisation peaceful, with Kenya, Malaya, Cyprus, Aden and Palestine
listed underneath. Clicking a mechanism selects every territory it produced and the map shows **only**
those, across four centuries at once — settlement in 1627 and 1788 lit simultaneously. A second axis
crosses `mechanism` against `century` so the student can see that "chartered company" is an
eighteenth-*and*-nineteenth-century device.

**Data.** Existing: `data.acquisitions[].mechanism`, `data.departures[].mechanism`, `.how`,
`.counterparties`, `.instrument`, `.cost`.

**Module.** `app/js/ledger/index.js` + `app/css/ledger.css`. Slot `overlay`, deep-linked `#panel=ledger`.

**Proof sentence.** *"Six completely different things are all called 'joining the empire', and most
exits were negotiated — which is not the same as peaceful."*

---

### F9 — The Argument Spine `[CORE]`

**Purpose.** Carry one argument to a conclusion the user cannot skip. This is the answer to charges 1
and 2 in a single object.

**Behaviour.** A permanent rail in `dossier` — the app's *default* right-hand content, which the
territory dossier temporarily replaces rather than the other way round. Twelve claims (our spine's
version of Champion §17), each starting **ghosted and unearned**. A claim fills in when the student
produces evidence for it: completing a mechanism run, answering a retrieval item correctly, passing an
Attribution Gate, making a prediction and being corrected. When it fills, it prints **what the student
did** beneath it — *"you ran the revenue loop and cut Bengal out of it"* — so the citation under each
claim is the student's own act. Claims are clickable: clicking one returns the map to the state where
its evidence lives. At 00:29 the completed rail is the ending, and it exports as the printable revision
sheet.

**Data ⟶ REQ (new, I would own it).** `app/data/argument/spine.json`:
`{ claims: [{ id, sentence, earnedBy: [{kind:'mechanism'|'retrieval'|'source'|'prediction', ref}], mapState:{year, sel, layer, enc}, tNumbers[], loNumbers[] }] }`.

**Module.** `app/js/argument/index.js` + `app/css/argument.css`. Slot `dossier`.
**⟶ REQ shell:** state key `argument: { earned: Set<claimId>, trail: [{claimId, how, at}] }`, persisted
to `localStorage` alongside `visited`.

**Proof sentence.** *"I can say the whole argument in twelve sentences, and I know which piece of
evidence goes under each one."*

---

### F10 — The Wrong-Question Corrector

**Purpose.** Give the app the standing to tell a student their framing is wrong (charge 15).

**Behaviour.** At the close, the student types their verdict into the through-line sentence. A ~30-entry
phrase lint (drawn from DIDACTIC_SPEC §7.1's banned list plus *worth it*, *mixed legacy*, *both sides*,
*good and bad*, *rich tapestry*, *played a key role*) matches and returns a **specific** correction —
not a scold, a question: *"You wrote 'was it worth it'. Worth it to whom, measured how, compared with
what? Here are the three ledgers that question hides."* It then opens F11 pre-loaded with those three.
The student can dismiss it, and the app says so plainly rather than blocking. Runs entirely locally on
a string; no model, no network.

**Data.** `app/data/argument/lint.json` — `[{ pattern, why, replacementQuestion, opens }]`.

**Module.** Part of `app/js/argument/`.

**Proof sentence.** *"'Was it worth it' turned out to be the wrong question, and I can say why."*

---

### F11 — Who Gained / Who Paid

**Purpose.** Hold four claims in tension without serialising them, and break the balance-sheet framing.

**Behaviour.** One frame in `map-overlay`. Four-plus claim cards, all visible, none dismissible, no
tabs. A row of **parties**: British taxpayers · City investors · planters and owners · colonial
intermediaries · settlers · Indian peasants and workers · enslaved and formerly enslaved people. The
student drags each claim onto the party (or parties) that bore it. Nothing is scored right or wrong;
what happens is that the columns fill unevenly and the closing line reads: *these do not cancel,
because they did not land on the same people*. Three instances ship: **Abolition 1833** (£20m to owners
/ apprenticeship to 1838 / the West Africa Squadron's real cost / Indian indenture from 1834),
**Railways and famine in India**, and **Kenya 1952–63** — the last in `[PREDICT]` mode, where the
student estimates the settler-to-Kikuyu ratio *before* the numbers land.

**Data ⟶ REQ (data agent).** `app/data/incidence/*.json`:
`{ id, title, claims:[{ text, number, range, citation, defensibleParties[] }], parties[], closingLine }`.

**Module.** `app/js/incidence/index.js` + `app/css/incidence.css`. Slot `map-overlay`.

**Proof sentence.** *"Railways and famines don't cancel out, because different people got the railways
and the famines."*

---

### F12 — The Map's Own Provenance Bar

**Purpose.** Make the app's map an object of criticism, permanently — not in one lesson at minute 17.

**Behaviour.** A one-line byline pinned in `stage-note`, always present, never dismissible, in four
fields: **projection · what the colour means right now · exact year · whose definition of control**. It
updates live with `encoding`, `activeLayer` and `controlDefinition`. Beside it, a link: **"three things
wrong with this rendering"**, which is *state-dependent* — in cartogram mode the first item is "this is
not where these places are"; in Mercator mode it is "Canada is not that big"; in `controlled` mode it
is "this hides everywhere Britain ran without a flag". The app criticises itself in the same words it
teaches the student to criticise the 1886 poster.

**Data.** Existing state plus `app/data/argument/rendering-caveats.json` keyed by `(encoding, layer, def)`.

**Module.** `app/js/provenance/index.js` + `app/css/provenance.css`. Slot `stage-note`.

**Proof sentence.** *"Every imperial map has a projection, a definition of its colour and an exact date.
I ask for all three now — including of this one."*

---

### F13 — The Audit Sheet

**Purpose.** Let a head of department check us faster than they can check a chapter (charge 13).

**Behaviour.** `#panel=audit`. One page, generated at runtime by walking `data.territories`,
`data.events` and the metrics series: every number in the app, its value, its range, its `confidence`,
its citation with the `supports` line, and a deep link to where it is used. Sorted **contested-first**,
filterable by shard, and print-styled to A4 so it can be marked in pen. A footer line gives the content
version and the validator's last clean run. No build step: it is a `data` walk.

**Data.** Existing. Plus the F7 validator rule and a `contentVersion` string.

**Module.** `app/js/audit/index.js` + `app/css/audit.css`. Slot `overlay`.

**Proof sentence** (teacher): *"I checked the twelve numbers I actually care about in about four
minutes, and I found where each one came from."*

---

### F14 — The Counterfactual Bench `[EXT]`

**Purpose.** Rubric C1 level 5 — apply the causal model — without inventing an alternate history.

**Behaviour.** Exactly three counterfactuals, each drawn from a mechanism's `breakConditions`, each
opened from the Mechanism Deck. **No simulated alternate map is ever drawn.** What the student gets is
the named machine stalling at a named step, plus the two historians who disagree about whether it would
have, plus the evidence at issue. (a) *No Diwani in 1765* — `revenue-loop` has no fuel; Marshall and
Bayly on what the Company becomes. (b) *Suez open in November 1956* — does the African exit slow?
Louis & Robinson against Hyam. (c) *No Indian Army 1914–18* — the Middle Eastern limb, and what
happens to the 1922 maximum. Each ends with the compulsory line: *this is an argument about a mechanism,
not a prediction about the past*.

**Data.** `breakConditions[].historians[]` on the mechanism objects (F1) — no new file.

**Module.** Part of `app/js/mechanisms/`.

**Proof sentence.** *"Without Bengal's tax revenue in 1765 the Company couldn't have paid for the army
that took the rest — that's the argument, and here's who disputes it."*

---

## 3. THE THREE MOVES ONLY SOFTWARE CAN MAKE

### Move 1 — Show the same year under three definitions of control and five definitions of value, at one keystroke

Not "it's interactive". Specifically: **1860, held fixed**, redrawn as *claimed* (a fat empire),
*administered* (a much thinner one) and *controlled* (thinner again) — and then redrawn again with area
replaced by population, by trade value, by officials-per-100,000. Six renderings, one year, no
navigation, under a second.

**Why it teaches better.** Chapter §1 spends its whole length arguing that claimed ≠ administered ≠
controlled, and it has to argue, because it can only print one map. Conceptual-change research (Chi;
Vosniadou) is explicit that a wrong *model* is not displaced by a correct *fact* — it is displaced by a
better model the student can run against the same data. "A quarter of the world was claimed, less
administered, less again controlled" is a fact on a page and a **percept** in this app: the same
polygon set, breathing in and out, under labels the student is choosing. And the value encodings do the
work chapter §4 and §5.2 can only assert — Barbados's 166 square miles outweighing British North
America is a sentence you nod at and a shape you cannot unsee. The move also inoculates: a student who
has watched an empire change size four times because someone changed a definition will not take the
next choropleth they meet at face value, which is transfer (rubric C8), not recall.

**What print does instead.** Prints one map, and writes a paragraph asking you to imagine three others.

---

### Move 2 — Run a causal loop, then cut one of its inputs and watch it stall at a named step

The `revenue-loop` executes: *diwani 1765 → land revenue from ~20–30 million people → pay sepoys →
take more territory → more revenue*. The student then removes Bengal's revenue, or removes the Indian
soldiers, and the animation halts at step 2 with the sentence *"the Company can now pay for about a
tenth of the army it had"*, and every territory the loop produced dims on the map.

**Why it teaches better.** A feedback loop is not a fact, it is a *procedure*, and procedures are
learned by execution and by watching them fail — worked example first, then faded guidance (Sweller;
Kirschner, Sweller & Clark 2006). Reading "revenue funded the sepoys who won the revenue" produces
recognition; running it and breaking it produces a model the student can carry to Malaya or to a
different empire entirely. It is also the only honest route to rubric C1's level-5 anchor, which
demands the learner *manipulate* the causal model, not restate it.

And there is a second, sharper reason, which is the answer to charge 11. In `collaboration` and
`plantation`, the complication is **a required input**: you cannot execute the conquest step without
recruiting Mir Jafar, the Jagat Seths and 200,000 sepoys; you cannot execute the supply step without
Dahomey, Asante and the Aro networks on the coast. Print can put a self-refuting COMPLICATION box in
the reader's path and hope they read it. Software can make the self-refutation **the thing the student
themself just did** — which is not a box to skip, it is a step they pressed. That is a stronger
delivery of an uncomfortable truth than any page can arrange, and it arrives without the app having to
lecture.

**What print does instead.** Asserts the loop in a strong sentence and moves on.

---

### Move 3 — Delete the archive in front of the student

The Kenya dossier is open, complete, with its sources listed. The student flips one control from *the
record including the Hanslope files* to *the record as it survived*. Fields vanish. The source list
shortens. A claim that read "over a thousand hanged" becomes a struck-through line reading *not in the
surviving record*. The range bar for detentions gets visibly wider. A caption names the date, the
operation and the author: Operation Legacy; the FCO's 2011 admission that it held thousands of
migrated files at Hanslope Park; the 2013 settlement.

**Why it teaches better.** WHY_PRINT #7 says a deliberately created silence is not a data type. That is
exactly backwards, and it is the charge I most want to answer. In software, absence *can* be a data
type — a rendering state with an author, a date and a reason — and the only medium that can make a
student *feel* an archival gap is one that can take information away from them **after they have had
it**. Reading "records were destroyed" costs a 16-year-old nothing; watching six lines you were relying
on disappear costs them something, and the cost is the lesson. This is the highest anchor on rubric C4
("at least one silence in the archive is named") delivered as an experience rather than a claim, and it
converts the app's supposed structural weakness — *software must always display something* — into its
sharpest teaching instrument, because we get to choose the moment at which it stops displaying.

**What print does instead.** Describes the destruction, in a paragraph the student reads once, from a
position of never having held the thing that was destroyed.

*(Three moves I considered and left out: animating 15 million people across the Radcliffe Line — real,
but it teaches scale, which the numbers already do; making duration bodily by scrubbing 190 years of
Bengal at one second per year — a good beat, not a top-three move; and the adaptive re-ask, which is
genuinely software-only but is a retention mechanism, not a teaching one.)*

---

## 4. WHAT I WOULD CUT

Every item here is something a competent version of this app would ship. Each one makes it teach worse.

**1. The scramble animation as a headline feature.** Africa flooding red across 1880–1902 is the most
screenshot-able thing we could build and it teaches one variable: speed. WHY_PRINT #6 is right about
this. Keep it as a 20-second beat *inside* the chapter where speed is the actual argument (quinine,
steamboats, telegraph, breech-loaders, Omdurman's casualty ratio), with the causal chips attached to
the motion — and never, ever as the landing screen.

**2. The Mercator↔equal-area toggle as the signature interaction.** It is a lovely eight seconds and a
terrible thesis. It teaches that the map lies *about area* — which reinforces area as the dimension
that matters, the precise error of charge #4. Demote it to one of the three lies, and the *weakest* of
the three; the colour lie and the date lie are more load-bearing. If it is the thing people remember,
we have taught them to be pedantic about Greenland.

**3. "Build your own empire" / any strategy or optimisation sim.** It teaches that empire was a set of
rational choices well made, seats the student permanently in the coloniser's chair, and makes the only
available agency imperial agency. It would also be the most fun thing in the app, which is why it has
to be refused explicitly rather than left off the list.

**4. Any "was it good or bad?" verdict device** — slider, meter, thumbs, agree/disagree poll, and above
all "here's what other students said". DIDACTIC_SPEC §1 refuses this as a summative task and the
refusal is load-bearing; it collapses incommensurable claims into a single number and rewards
sourceless moralising. The aggregate version is worse: it turns a moral question into a popularity
readout and is exactly the metric charge #12 warns will eat the product.

**5. Achievements, badges, streaks, XP, completion percentages.** Extrinsic reward attached to a history
of famine and detention camps is grotesque, and mechanically they select for volume of interaction —
which is charge #12's mechanism running inside our own UI rather than in a boardroom.

**6. Hover-only tooltips as a place where teaching lives.** No touch device has hover, no keyboard user
has hover, and the ones we would write are exactly the 40-word cards charge #1 is about. If a fact
matters it is a label on the map or a line in the dossier. Hover may confirm; it may not inform.

**7. A search-everything omnibox as the primary entry point.** It presupposes the schema the novice
does not yet have and delivers them to the Scramble before they know what a protectorate is
(Kirschner, Sweller & Clark 2006). Search stays, in `toolbar`, sized and placed as a lookup tool for
people who already know what they want.

**8. A 3D globe.** It costs the single most valuable affordance we have — seeing two hemispheres, or
two eras, side by side — costs keyboard and screen-reader access, costs performance, and buys nothing
except that it looks like the future. Comparison is the whole method here; a globe hides half of
everything by construction.

**9. Per-territory "did you know" trivia cards.** Twelve pins, twelve facts, no argument. This is the
failure mode charge #1 predicts, and it is seductive because the dataset makes it nearly free to build.

**10. Any generative or conversational assistant.** It will fabricate a citation, and a single
fabricated citation caps rubric C4 at 0 and the whole artefact at 2. It also breaks the offline rule.
There is no version of this that is worth the risk.

**11. Auto-playing atrocity imagery, a ticking casualty counter, and a "deaths" heat map.** Spectacle
that trains the eye to skim suffering, and a direct violation of §7.3. Numbers about the dead get
ranges, reasons and named sources, delivered at rest.

**12. The territory dossier as the app's default right-hand panel.** This is the cut that defines the
whole design. A dossier-first app has already conceded that its atomic unit is a territory. The default
occupant of `dossier` is the **Argument Spine**; the dossier is what temporarily replaces it when you
ask about a place. The map is what you consult; the argument is what you are building.

**13. Making the informal-empire layer a checkbox that is off by default.** That single default is
charge #5 coming true. In every view between roughly 1830 and 1880 it is on, and turning it *off* is
the deliberate act.

---

## 5. WHAT THIS ASKS OF OTHER AGENTS

Stated plainly so nobody is surprised. All of it is an ask, not a decision.

- **Shell (`core/store.js`, `core/url.js`):** five new state keys — `controlDefinition`, `encoding`,
  `mechanism {id, step, cutInputs[]}`, `archiveState`, `argument {earned, trail}` — with matching
  actions and URL keys (`def`, `enc`, `mech`, `mstep`, `arch`). All are small, serialisable and
  deep-linkable, which is what makes a teacher's link mean something.
- **Map agent:** the control-gradient renderer (F2) — hatch density by `controlDegree`, split hatch on
  `partial`, and **no coastline stroke at all** on `informal-sphere`.
- **Design agent:** a hatch-density ramp keyed to `controlDegree` 0–5 that survives all four vision
  models, and an "edgeless wash" token for degree 0. Both are extensions of the existing `--tenure-*`
  ramp and `--tex-*` set, not new colours.
- **Data-model agent:** the `archive {}` block on territory; a validator rule failing scalar values on
  any figure in the §9.2 contested register; `causalLinks[]` (already promised by DIDACTIC_SPEC §5.1).
- **Data agent:** `app/data/metrics/series.json` and `app/data/incidence/*.json`.
- **New files I would own:** `app/data/mechanisms/*`, `app/data/network/routes.json`,
  `app/data/sources/*`, `app/data/parallel/*`, `app/data/argument/*`.

---

## 6. THE ONE-LINE TEST

If a student closes this app and says *"the British Empire was a quarter of the world, coloured pink"*,
we have built the app WHY_PRINT_WINS predicted and we lose.

If they say *"empire ran on loops — tax paying for soldiers who took more land to tax, and elites
cooperating until it stopped paying them — and the map you've seen is a poster with a projection, a
colour convention and a date"*, then the atomic unit worked, and the map was doing what it should
always have been doing: giving evidence, under cross-examination.
