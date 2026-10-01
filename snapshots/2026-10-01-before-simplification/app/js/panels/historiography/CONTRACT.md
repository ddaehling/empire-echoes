# THE DISPUTE GATE, AND THE FOUR LINES — the two contracts the lesson path calls

**Owner:** P16, `app/js/panels/historiography/`.
**Callers:** P05 (tours), and anything else that wants a student to weigh a real argument
between named historians, or to say what a document is before this atlas tells them.
**Machine-readable copy:** `window.BEA.historiography.contract` on the running app — **version 4**.
**What changed in v4:** the four lines now fire more than once on the lesson path without the path
having to invent anything — **two exercises are nominated for named beats** (`sourceForBeat(beatId)`,
§9.1), both on documents made to JUSTIFY rather than to protest, and a gate can carry its own
exercise inside it (`withSource: true`, §9.2). Every reply now says what it costs in seconds, in the
path's own cost model. Nothing a v1–v3 caller does changes.
**What changed in v3:** a second thing a caller can mount — **the four lines the student writes**
about one document, `ask:sourceLines`, §9. Same shape as the gate: emit, read the reply off the
payload synchronously, mount the node, unlock on `onCommit`. Nothing a v1 or v2 caller does breaks;
the gate, `defaultGate()`, `gateFor()` and the reply shape are all unchanged.
**What changed in v2:** three arguments are nominated for the path, not one (§1); the band that
chapters an argument is measured off the caller's own scroller instead of the viewport width (§6a).
**Executable form:** two scenarios — §7 mounts the gate exactly as a caller must and asserts every
rule in §5; `produce.scenario.js` mounts the four lines the same way and asserts §9;
`pair.scenario.js` asserts §9.1 and §9.2 — the beat nomination, the cost, the pairing under
`purpose`, and that no chapter of an exercise is more than 2.2 times the typical one.

---

## 1. What this is

Fourteen arguments in this atlas are open between named historians. Each states every position
in the form its own author would recognise, names the evidence that position reads and the
strongest thing said against it, and refuses to print a verdict until the student has chosen a
side **and** written a sentence saying why.

Until now the only way in was the dossier column or a deep link, so a student walking the
authored path never once had to put two historians in tension. **This contract puts three of them
on the path.** The caller supplies a surface and a lock; this module supplies the argument, the
commitment and the unlock.

The arguments the path gets are chosen **here**, not by the caller — `pathGate` in
`disputes.js`. **Round 3 made it three.** The path critic found that "the path never meets famine
or the Scramble": T13 and T16 were in the quiz bank, in these disputes and in the teaching desk,
and nowhere on the twenty-four steps. Both arguments were already written, sourced and gated in
this file. They were simply not nominated. They are now:

| the beat it stands after | the argument | spine | what is at stake |
|---|---|---|---|
| `compensation` | `irish-famine-intent` | T16 | Parliament voted £20m to compensate slave-owners and the Treasury paid it. Twelve years later the same Treasury ran the relief in Ireland. Mitchel, Kinealy and Ó Gráda read that three different ways. |
| `nationalisation` | `the-1857-name` | T9 | Mutiny, peasant war, or first war of independence? Stokes reads the revenue settlements district by district; Mukherjee reads Awadh; Dalrymple reads twenty thousand Urdu and Persian documents from inside rebel Delhi. Three archives, one word. |
| `egypt` | `the-scramble` | T13 | Robinson and Gallagher's own case is that the occupation of Egypt set the partition going, so the argument stands where the lesson has just watched it happen. Hobson, Robinson and Gallagher, Boahen. |

**How a rotating path asks.** One lookup per beat:

```js
const g = window.BEA.historiography.gateFor(beat.id);   // null ⇒ no argument here
if (g) bus.emit('ask:disputeGate', { disputeId: g.id, lede: g.lede, onCommit, onOpenFull });
```

`g` carries `{ id, after, spine, question, say, lede }`. `pathGates()` returns all three.
A caller that wants exactly one gate keeps calling `defaultGate()`, which is still
`the-1857-name` and **does not move** when a fourth argument is nominated — that is what
`PATH_DEFAULT` in `disputes.js` is for.

Changing which arguments the path stops on is a one-line edit in `disputes.js`. The caller does
not change.

---

## 2. The call

```js
const payload = {
  disputeId: 'the-1857-name',   // optional — omit and you get defaultGate(); pass gateFor(beat).id to rotate
  lede: 'one sentence in your own voice, printed under the question',   // optional
  onReady:    (gate) => { … },  // optional; called SYNCHRONOUSLY, before emit returns
  onCommit:   (record) => { … },// optional; THIS IS THE UNLOCK
  onOpenFull: (id) => { … },    // optional; see §4
};
bus.emit('ask:disputeGate', payload);

const gate = payload.gate;      // undefined ⇒ this module is not mounted; fall back
if (!gate) return this.oldBehaviour();

this.locked = !gate.committed;  // ← read it, see §5.3
bus.emit('ask:sheet', { id: gate.id, eyebrow: gate.eyebrow, title: gate.title, node: gate.node });
```

`core/bus.js` dispatches synchronously and `emit` returns the detail object it was given, so no
promise, no second event and no handshake are needed. `payload.gate` is written before `emit`
returns or it is never written at all.

There is also a direct handle for a caller that would rather hold a function than emit an event:
`window.BEA.historiography.gate(opts)` returns the same record. The bus route is the documented one.

---

## 3. What comes back

| field | type | means |
|---|---|---|
| `node` | `HTMLElement` | **Mount it.** Do not style it, do not reach into it, do not clone it. |
| `committed` | `boolean` | **True at ready-time** if this student has already judged this argument — in the dossier, in the index, or in an earlier visit through the Ledger. See §5.3. |
| `id` | `string` | `hgx:gate:<disputeId>` — a stable id for the caller's own sheet. |
| `disputeId` | `string` | which argument this is. |
| `question` | `string` | the argument's own question. |
| `positions` | `[{ key, who, badge }]` | the historians, in the order the panel prints them. |
| `after` | `string \| null` | the beat id this argument belongs beside, from `pathGate.after`. |
| `say` | `string` | one line for the caller's own status band. |
| `eyebrow`, `title` | `string` | for the caller's panel head — `historians disagree` / `Before you go on`. |
| `judgement` | `object \| null` | what this student already said, if anything. |
| `focus()` | `function` | put the caret on the question. Call it after mounting. |
| `release()` | `function` | call when the surface goes away. |

### On the bus, for anyone

```
hgx:gate    { phase: 'ready' | 'committed', disputeId, committed, question?, record? }
hgx:judged  { disputeId, question, choice, label, why, at, ledgerKey }
```

`hgx:judged` fires for **every** commitment, from any surface — the gate, the dossier card, the
index — not only from a mounted gate.

### Into the Ledger

Every commitment is written through the dossier's own `remember()` and emitted as
`ledger:append`:

```
kind:     'collapsed'
claimId:  'hgx:<disputeId>'
youSaid:  '<the position’s short name> explains more — <the student’s own sentence>'
```

so the Close prints it back in the student's own words, whichever surface they met it on.
Nothing in this module writes to storage.

---

## 4. Who owns what

**The caller owns the surface.** This module never emits `ask:sheet` for a mounted gate and never
moves the caller's panel. Every control inside the node is answered by this module's own delegated
listener, which is on the document and keyed to `[data-hgx]`, so it cannot see the caller's controls
and the caller does not have to forward anything.

**Redraws happen in place.** The commitment, the evidence lens and the third-column toggle all
change what is rendered. Inside a mounted gate the node replaces itself where it stands
(`_repaint`), so the caller's reference stays valid — read `gate.node` again after `onCommit` if
you kept a copy.

**The one route out is yours to take.** After committing, the panel offers *Open the whole
argument*. If you passed `onOpenFull`, it is called with the dispute id and **nothing else
happens** — the lesson keeps its surface, and you decide whether to leave the beat. If you did
not pass it, the button opens the argument in the rail sheet, which would take your panel.
**Pass it.**

---

## 5. The rules a caller must respect

**5.1 The verdict is not in the DOM before the commitment.** Not hidden with CSS, not disabled,
not one element away — `renderFull` returns before it is built. Do not try to reveal it. Do not
search for it to decide whether the student is done; use `onCommit` or `hgx:gate`.

**5.2 Any position is accepted, including "neither on its own", and there is no right answer.**
The unlock is a commitment plus a sentence of at least 20 characters, and nothing else. Do not
mark it. Do not grade it. Do not tell the student they were wrong.

**5.3 Read `committed` at ready-time.** A student who judged this argument from the dossier an
hour ago, or on their last visit — the Ledger survives a reload — arrives at the gate already
past it, and the panel opens on the verdict rather than on the question. A caller that sets
`locked = true` unconditionally locks that student out of a gate they have passed.

**5.4 The escape stays.** This is a complication gate, not a wall. DIDACTIC_SPEC §8.2 applies:
a student who will not commit must still be able to leave the lesson. This module does not
provide a decline — declining is the caller's own recorded choice, as it is for the tours gate —
and it will not pretend a decline was a judgement.

**5.5 Do not reach into the node.** Not to restyle it, not to renumber it, not to move the
commitment. If you need something the node does not give you, ask for it here.

---

## 6. What this module does about small screens, so the caller does not have to

### 6a. The band is measured, not guessed — round 3

The band used to be a **width** test: below 62 rem, read off `#app[data-rail="sheet"]`. The thing
it exists to protect a reader from is a **height**. Measured on the running app, every one of the
fourteen opened in the rail, before this pass:

| viewport | the reading window | chaptered? | worst argument |
|---|---|---|---|
| 390×844 | `.cx-sheet__body` 198px | yes | 2.6 screens |
| 768×1024 | `.cx-sheet__body` 223px | yes | 1.4 screens |
| 900×700 | `.cx-sheet__body` 571px | **no** | **15.4 screens** (`the-scramble`) |
| 1024×640 | `.cx-sheet__body` 511px | **no** | **15.6 screens** (`the-scramble`) |
| 1366×768 | `.cx-sheet__body` 635px | **no** | **10.3 screens** (`the-scramble`) |
| 1440×900 | `.cx-sheet__body` 767px | **no** | 8.3 screens (`the-scramble`) |

900×700 and 1024×640 are wide enough to be called desktop and short enough that the reading
window is smaller than a laptop's. They were the two worst viewports in this module by a factor
of six, on the far side of a test that could not see them — and a gate mounted in a 129 px lesson
beat at 1440 would have been on the same side of it.

So the band is now measured off **the surface the node is actually in** — the nearest scrolling
ancestor, whoever owns it: the rail sheet, a beat's `.tr-panel__scroll`, or a caller this module
has never heard of. Two conditions, either of which chapters the argument:

1. the reading window is shorter than **620 px**, or
2. the argument would take more than **6 windowfuls** to read.

`#app[data-rail="sheet"]` survives as a **hint that wins when it is true** — a bottom sheet is a
bottom sheet whatever a measurement says — so nothing that was chaptered has stopped being
chaptered. (1) is the old rule generalised. (2) catches `the-scramble` and `waitangi-texts`, which
carry parallel texts and run two to three times the length of the other twelve: they are chaptered
in a laptop column where the other twelve read as one column, which is the honest answer, because
they are the ones that do not fit.

Measured after, same viewports, same fourteen arguments:

| viewport | chaptered | worst chapter against the window |
|---|---|---|
| 390×844 | 14 of 14 | 2.6 |
| 768×1024 | 14 of 14 | 1.4 |
| 900×700 | 14 of 14 | **1.2** (was 15.4) |
| 1024×640 | 14 of 14 | **1.3** (was 15.6) |
| 1366×768 | 2 of 14 | **0.8** for the two (was 10.3); 3.8–5.3 for the twelve, unchanged |
| 1440×900 | 2 of 14 | 3.0–4.0 for the twelve, unchanged |

**Round 4 changed one row of that table and nothing else in this section.** The four arguments that
carry a source exercise (§9) are now 4,100–4,800 px where they were 2,300–3,300, so at 1366×768 six
of the fourteen chapter rather than two. The rule did not change; the arguments got longer, and rule
(2) caught them. Measurements in §9e.

**Three consequences for a caller, none of which need any work:**

- `paginate()` writes `data-paged="on" | "off"` on its own root, and the stylesheet reads that
  rather than the shell's rail attribute. The gradient that stops the sticky pager slicing a line
  of prose through its x-height follows the pager now, not the viewport width.
- One `ResizeObserver`, re-pointed at whatever scrollers our roots are in, re-pages when **the
  caller's own panel** changes height — a beat that expands its map peek strip, a sheet whose head
  wraps. `chrome:layout` cannot see that; it is the shell talking about the shell.
- `window.BEA.historiography.band()` prints what was decided and off what, per mounted root:
  `{ dispute, surface, window, argument, chaptered, floor, screens }`.

### 6b. What chaptering does

The argument is **chaptered**: the question, then one historian per screen, then the commitment;
and after the commitment, the verdict, what would settle it, the map, and one source per chapter.
A sticky pager at the top of the scroller says `2 of 5 · Eric Stokes`.

Measured after: the longest chapter in the whole set is **1,335 px** and the median is about 560 px.

**And the line the pager cut in half.** The pager is sticky and its background is opaque, so it does
not clip on the line box — it paints over whatever is under it. Measured at 390×844 across
twenty-four chapter views in four arguments, eight ended with a line of prose sliced horizontally
through its x-height by that bar: *Rudrangshu Mukherjee*, *David Anderson*, *This is the case where
a real scholarly disagreeme…*. A 2 rem gradient in the pager's own colour now rides above the bar,
so the last line dissolves into it instead of being cut by it, and the fade itself says there is
more below. Painted only, and only in the paged band. `accept.scenario.js` asserts it exists.

**The caller does nothing.** It is presentation, not content: every chapter is in the DOM at every
viewport, `paginate()` re-runs on `chrome:layout` and on a resize of the caller's own scroller, and
a half-typed sentence survives a rotation because nothing is rebuilt. Where the window is tall
enough and the argument short enough, the pager is hidden and the argument is one column, exactly
as it was.

---

## 7. Verifying it

### 7a. The two audits, and the difference between them

`window.BEA.historiography.auditOwn()` is **this module's own standing**: every missing field, every
territory id this piece names that the dataset does not hold, every position with no work a reader
can check, and every banned string from DIDACTIC_SPEC §7.1 found in this module's own voice. It
must return `[]`, and `accept.scenario.js` fails if it does not.

`window.BEA.historiography.audit()` is that plus **four cross-module checks on one defect class**,
each finding carrying `piece` — the directory that has to fix it (`P16`, `P08`, `map`, `data`).

The class is: *a sentence about a record, printed without reading the record.* It has now cost this
atlas a disqualifying score twice and appeared a third time:

| where | what was printed | over what |
|---|---|---|
| acquisitions | "taken from Europeans" | Kenya's African counterparties |
| acquisitions | "Handed over by another European power at the end of a war" | Mysore, the Marathas, the Lahore Durbar, Konbaung Burma, Nepal, Bhutan |
| the plate | "no record was allowed to survive here" | a sentence saying removal records "were poor and many were destroyed" |
| a citation | "Ronald Robinson and John Gallagher" | its own check line, six lines below, reading "…with Alice Denny" |

So the class is checked, against the data as loaded, not against a fixture:

- `auditHeadlines(data)` — every acquisition, asking `acquisitionVerb()` for the sentence a reader
  sees and failing any that names a party the record's own `counterparties[]` do not contain.
- `auditSilences(map)` — every hole the plate can draw. The headline *no record was allowed to
  survive here* asserts three things, and the shard's own sentence has to carry all three: **an
  act** (a record that existed and then did not), **totality** (*no* record, not *many*), and **a
  permission** (`agent` — records do not get destroyed, people destroy them). A sentence that
  hedges the destruction, or denies it, or names no destroyer, is a finding.
- `auditAttribution(disputes, texts)` — **new in round 3**, and the fourth surface. Every citation
  this atlas prints with a check line — this module's 39 and the dossier's 43 primary texts, 82 in
  all — read against its own check line. Three shapes are findings: the check **credits an author
  the printed author line drops** (the Denny case: two names in the line the student reads, three in
  the line telling them where to look); the check **names the work and nobody from the author line
  above it**, so the reader cannot get from the display to the shelf; and the **page count in the
  sentence describing the work disagrees with the page range cited under it** (the 1953 article is
  fifteen pages and the line above it said sixteen). Also: a position **badge whose year is not the
  year of the work cited under it**. The reverse of the first — an author line naming somebody the
  check does not — is deliberately **not** a finding, because a primary source rightly prints its
  speaker as author and cites the volume that carries the words (`Samuel Sharpe, reported by Henry
  Bleby` against `Henry Bleby, Death Struggles of Slavery`), and neither is a missing year, because
  an archival citation gives the repository and the box. `attributionStats()` gives
  `{ citations, findings }`; it is `{ citations: 82, findings: 0 }` and `accept.scenario.js` fails
  if either number moves. Testimony findings carry `piece: 'P08'` — this module reports them and
  does not repair them.
- `auditWorks(data)` — every cited work, keyed exactly the way `search/corpus.js` keys the evidence
  ledger (`norm(author|work|year)`), reporting any two records of one book: a subtitle dropped, an
  author's initials dropped, a full stop inside an abbreviation. Four such pairs were standing when
  this was written (Sheriff 1987, I. M. Lewis 2002, Juan Cole 1993, Abrahamian 2013), inflating the
  count by four. `workStats()` gives `{ counted, duplicated, distinct }`.

All of these take an **optional override argument**, so the guard itself can be tested against a
known set rather than merely observed returning `[]` against a clean one — `accept.scenario.js`
feeds each of them the exact sentences and citation pairs that were wrong, and asserts they fail.
`P16-attribution-guard` runs seven fixtures: the Denny shape (must fire), reported speech (must
not), a short given name — "Sol" is not a fourth Plaatje (must not), a check that names another work
before the cited one (must not), an orphan check (must fire), a badge year (must fire), and a page
count that agrees (must not).

### 7b. The scenarios

Two scenarios ship in this directory. Neither is loaded by the app — `modules.json`
autodiscovers only `index.js` at this path — and both are run with the shared harness:

```
node tools/inspect.js app/js/panels/historiography/gate.scenario.js   --out /tmp/g390  --mobile
node tools/inspect.js app/js/panels/historiography/gate.scenario.js   --out /tmp/g1440 --w 1440 --h 900
node tools/inspect.js app/js/panels/historiography/accept.scenario.js --out /tmp/a390  --mobile
node tools/inspect.js app/js/panels/historiography/accept.scenario.js --out /tmp/a1440 --w 1440 --h 900
node tools/inspect.js app/js/panels/historiography/produce.scenario.js --out /tmp/s390  --mobile
node tools/inspect.js app/js/panels/historiography/pair.scenario.js    --out /tmp/p390  --mobile
```

`accept.scenario.js` opens all fourteen, checks each for the question, the stake, the shape,
at least one position with its evidence and its counter-evidence, the commitment gate, no
verdict, no horizontal overflow and exactly one visible chapter in the paged band; then commits
each and checks the verdict, the settle-field, the settle-key and the student's own sentence
came back. It also proves the two new guards against known-bad inputs (§7a), checks that the
parallel texts and their clause locking survive the commitment, and checks the pager fade. It
prints `>>> P16 acceptance holds`, and lists any cross-module findings as `NOTE [piece]` lines
rather than failing on a defect this module cannot repair.

---

## 8. The parallel texts, and what they are not

FEATURE_SPEC charge 9 names three instances. Two are built.

**Waitangi** — one document in two languages. The marked clauses are translations of each other,
and the third column is Kawharu's 1989 back-translation.

**Berlin article 35 against Lobengula's letter to Victoria, 1889** — mounted on `the-scramble`,
which already carried the Berlin Act in its testimony list. These are **two different documents**,
four years and a continent apart, and the apparatus does not pretend otherwise: what is paired is
not wording but function — the sentence in each where a signature turns into a right. *The
Signatory Powers of the present Act recognise the obligation* against *I put my hand to it*; *the
establishment of authority in the regions occupied by them* against *the right to all the minerals
of my country*. The gloss says what the Act does not say: article 35 speaks of regions occupied
"on the coasts of the African Continent", Bulawayo is a long way from any coast, and the Berlin
Act did not authorise the Rudd Concession. It is the frame students are taught to explain the
partition with, and the partition happened beside it — which is `the-scramble`'s own verdict, made
visible with two contemporaries rather than asserted.

A spec adds `pagerLabel`, `wholesHead`, `wholesNote` and `shortNames` so an instance that is not a
translation pair does not inherit Waitangi's captions.

**Both instances now survive the commitment.** `renderFull` swaps the whole chapter set at the
judgement, and the parallel apparatus was built only into the pre-commit half — so a student who
judged the Waitangi argument lost the two texts, the clause locking and the third column at the
moment they committed, which is every part of FEATURE_SPEC §2 P16 test 5. They are printed again
after the verdict and the settle-field. The gate does not get them: a beat has already spent that
attention on documents of its own.

`gate.scenario.js` mounts the gate the way a caller must and checks, in order:
the contract is published; `payload.gate` is written synchronously;
`onReady` fires before `emit` returns; the verdict and the settle-field are **not** in the DOM;
a sentence under 20 characters does not unlock; a full sentence fires `onCommit` with the
student's own words; the post-commit chapters appear in place without the caller's surface
moving; the map coupling moves the year; and `onOpenFull` is called instead of the sheet being
taken.

Round 3 added two rules to it, and both print PASS/FAIL with `>>> P16 gate holds`:

- **`P16-gate-rotation`** — `gateFor('egypt')`, `gateFor('compensation')` and
  `gateFor('nationalisation')` each name their argument, `gateFor('poster')` is `null`,
  `defaultGate()` is still `the-1857-name`, and the published contract is at version 2.
- **`P16-band-short-surface` / `P16-band-grows`** — a gate is mounted into a **scroller of the
  scenario's own**, 320×140, exactly the shape of a letterboxed beat panel, and must chapter
  itself there at every viewport; then the scroller is grown to 760 px and it must stop, in
  place, from the `ResizeObserver` alone — except below 62 rem, where the shell's hint wins and
  it correctly stays chaptered.

---

## 9. THE FOUR LINES THE STUDENT WRITES — `ask:sourceLines` (new in v3)

### 9a. What it is, and why it is not the gate

Every one of this atlas's 43 transcribed documents arrives with **nature / origin / purpose /
what-it-cannot-tell-you** already answered, above the words, at the same type size. The historian
who read round 5 named that as the sharpest remaining gap: *"the student can RECOGNISE source
reasoning; they never PRODUCE any."*

They now produce it **six times, on six documents of six different kinds**, each standing inside the
argument that turns on it. (This paragraph said "four times, on four documents" for two rounds after
the fifth and sixth were written. It was corrected in round 3 by the same rule that corrected the
citations: a sentence about a set has to be counted from the set. `productionCount()` is the number.) The words are printed; the four answers are **not rendered** until the
student has written four of their own. Then ours are printed beside theirs, one question per screen,
and under each pair is the line that makes the move transferable: **what a strong answer notices
here, and where a weak one stops.**

| exercise id | document | what kind of thing it is | the argument it stands in | the hard field |
|---|---|---|---|---|
| `src-sharpe` | Samuel Sharpe at the gallows, 1832, in Bleby (1853) | reported speech, in someone else's book | `abolition-decline` | nature |
| `src-hastings` | Hastings to the Court of Directors, 1772 | an administrative despatch, explaining a figure | `was-1783-a-hinge` | what it cannot tell you |
| `src-dyer` | Dyer's evidence to the Hunter Committee, 1919 | sworn evidence to an official inquiry | `did-britain-care` | purpose |
| `src-powell` | Powell on Hola, Hansard, 1959 | a speech, in a parliament's official record | `kenya-scale` | origin |
| `src-trevelyan` | Trevelyan on the greater evil, 1846 | private correspondence between officials of one government | `irish-famine-intent` | nature |
| `src-salisbury` | Salisbury on drawing lines upon maps, 1890 | a joke, made in public by the man who had just signed the treaty | `the-scramble` | purpose |

**Two documents are deliberately not here.** The lesson path already asks for these four lines once,
on Lobengula's letter to Queen Victoria of 1889 (`tours.json`, the `scramble` beat), and the recall
quiz asks for them unaided on Macaulay's Minute. A third rendering of either would be a repeat, and
"the student meets this once" is the criticism. These six are the practice.

### 9a-2. What the set is for, and what the audit will not let it become  (v4)

Round 5's rubric critic: *"the four-line source task fires once, on Lobengula. A second, on a source
whose purpose cuts the other way (Trevelyan or Salisbury), would let the student see that the four
fields answer differently for a document written to justify rather than to protest."*

That is a criticism of the **set**, so the answer is a property of the set and it is checked. Every
exercise carries `madeTo` — the act the document performs — and `contrastWith`, a document in this
atlas that performs the opposite act. `auditProductions()` fails a set in which:

* fewer than three different acts are represented;
* nothing was made to justify or defend (a student would learn that a source is a complaint);
* nothing was made to protest, accuse or persuade (that a source is a cover story);
* a pairing points at a document this atlas does not hold, or at one that was made to do the same
  thing, which contrasts with nothing;
* two exercises are nominated for the same beat of the path.

Today: `to persuade` 1 · `to account for` 1 · `to justify` 2 · `to defend` 1 · `to accuse` 1.

The pairing is **printed**, under *"what was it made to do?"* and only there, on the far side of the
commitment. Salisbury's pair is Lobengula: the same partition of Africa, a year apart, from its two
ends. And the pairing text will not answer an exercise the student has not reached — where the
partner is another of these six and unwritten, the panel names it and withholds what it was for.

### 9.1 THE EXERCISE NOMINATED FOR A BEAT  (v4)

The same API as `gateFor(beatId)`, so a path learns one shape:

```js
const nom = window.BEA.historiography.sourceForBeat(beat.id);   // null ⇒ nothing here
if (nom && budget >= nom.costS) {
  const payload = { beatId: beat.id, onCommit: () => { this.locked = false; } };
  bus.emit('ask:sourceLines', payload);
  mount(payload.exercise.node);
}
```

| beat | exercise | document | made to | cost |
|---|---|---|---|---|
| `compensation` (T16) | `src-trevelyan` | the official who ran Irish relief, on the greater evil | justify | ~308s |
| `egypt` (T13) | `src-salisbury` | the man who signed the treaty, on drawing lines upon maps | justify | ~320s |

Both beats are on the **core** route, and both arguments are ones the path already gates
(`irish-famine-intent` after `compensation`, `the-scramble` after `egypt`) — so a path that wants a
second four-liner can either mount it as its own beat, or fold it into the gate it already has
(§9.2). `pathSources()` lists them. Passing a `beatId` no exercise is nominated for now returns
**null** rather than silently handing back the first exercise in the file, which is what it did
before v4.

`costS` is computed, not asserted: reading time over this exercise's own rendered prose at 180 words
a minute — the lesson path's own model — plus 45 seconds a sentence for the four. `costOf()` and
`sourceCost(id)` return `{ words, readS, doS, costS }`.

### 9.2 THE FOUR LINES INSIDE A GATE — `withSource`  (v4)

```js
const payload = { disputeId: 'irish-famine-intent', withSource: true, onCommit };
bus.emit('ask:disputeGate', payload);
payload.gate.source;   // { id, doc, title, madeTo, mounted, written, costS, words } | null
```

Default **off**, exactly as in v3: the minute belongs to the caller, so a gate does not take one
without being asked. `payload.gate.source` is present whether or not it was asked for, so a caller
can read the cost and decide. Mounted, the exercise stands **before the commitment** — say what the
document is, then judge the historians who read it — and survives the judgement, printed beside the
atlas's four in the second half.

### 9b. The call — identical in shape to §2

```js
const payload = {
  exerciseId: 'src-powell',   // optional; or disputeId / beatId, or omit for the first
  lede: 'one sentence in your own voice, printed above the document',   // optional
  onReady:  (ex) => { … },    // optional; called SYNCHRONOUSLY, before emit returns
  onCommit: (rec) => { … },   // optional; THIS IS THE UNLOCK
};
bus.emit('ask:sourceLines', payload);

const ex = payload.exercise;  // undefined ⇒ this module is not mounted; fall back
if (!ex) return this.oldBehaviour();

this.locked = !ex.committed;  // ← read it, same rule as §5.3
bus.emit('ask:sheet', { id: ex.id, eyebrow: ex.eyebrow, title: ex.title, node: ex.node });
```

`window.BEA.historiography.sourceLines(opts)` is the same thing as a function call, and
`sources()` lists all six with
`{ id, doc, dispute, title, kindWord, hardest, madeTo, contrastWith, after, costS, written }`.

### 9c. What comes back

| field | type | means |
|---|---|---|
| `node` | `HTMLElement` | **Mount it.** Do not style it, do not reach into it. |
| `committed` | `boolean` | true at ready-time if this student has already written (or declined) these four — here, in the rail, or in an earlier visit through the Ledger. |
| `id` | `string` | `hgx:src:<exerciseId>`, for the caller's own sheet |
| `exerciseId`, `doc`, `disputeId`, `title`, `kindWord`, `hardest` | `string` | what this exercise is |
| `fields` | `[{ key, label }]` | the four questions, in order |
| `min` | `number` | characters required per field — 20, the same floor as a judgement's sentence |
| `say`, `eyebrow` | `string` | one line for a status band, and a panel eyebrow |
| `lines` | `object \| null` | what this student already wrote, if anything |
| `focus()` / `release()` | `function` | as §3 |

On the bus: `hgx:source { phase: 'ready' | 'committed', exerciseId, doc, committed, declined?, fields? }`.

Into the Ledger, one row per document, written straight onto the bus:

```
kind:     'attributed'          (or 'declined')
claimId:  'hgx:src:<exerciseId>'
youSaid:  'what it is: … · who made it: … · what it was for: … · what it cannot tell you: …'
```

`attributed` is the Ledger's own word for *answered "what was this source made for?"*, and
`declined` is its word for being offered something and saying no by name. Neither is a new kind:
`close/ledger.js` is another piece's file and its enumeration already held the right words. Nothing
is written into the dossier's `remember()` — that list renders any kind it does not recognise
against a right answer, and four sentences about a document do not have one.

### 9d. The rules a caller must respect

1. **The atlas's four answers are not in the DOM before the student's four.** Not hidden, not
   disabled, not one element away: not rendered. The same rule as §5.1, and `produce.scenario.js`
   asserts it by searching `textContent`, not `innerText`, because a chaptered surface hides things.
2. **Nothing is marked, and nothing can be.** These are sentences. The feedback is the comparison
   and the criterion under it; there is no score, and a caller must not invent one.
3. **The escape is provided here, unlike the gate.** This is a task, not a gate, so the panel itself
   offers *I would rather read this atlas's four lines*, and records the decline by name
   (DIDACTIC_SPEC §8.2). `onCommit` fires either way with `declined: true|false`.
4. **Read `committed` at ready-time**, for the reason in §5.3.
5. **Do not reach into the node**, and do not mount two exercises on one document. `auditProductions()`
   fails a set that does.
6. **The band applies.** The exercise chapters itself off the surface the caller mounted it in
   (§6a) — one question per screen where the window is short, one column where it is not.

### 9e. What it did to the measurements

Measured with `window.BEA.historiography.band()`, all fourteen arguments opened in the rail:

| viewport | chaptered, before | chaptered, after | worst chapter against its window |
|---|---|---|---|
| 390×844 | 14 of 14 | 14 of 14 | 2.8 (unchanged) |
| 900×700 | 14 of 14 | 14 of 14 | 1.2 (unchanged) |
| 1366×768 | 2 of 14 | **6 of 14** | 1.3 (unchanged) |

The four that move are the four that carry an exercise: they are 4,100–4,800 px where they were
2,300–3,300, so at a laptop height they cross the six-windowful line and chapter themselves. That is
rule (2) of §6a doing exactly what it was written for, and no caller has to know.

Inside the exercise, measured at 390×844 against a 198 px reading window: the document is 501 px
(2.5 screens), each of the four questions 321–338 px (1.6–1.7), the commitment 407 px (2.1), and
each comparison 420–454 px (2.1–2.3). The first draft put all four boxes in one chapter and measured
914 px — 4.6 screenfuls of form, with the opening sentence alone filling the window before a single
box. One question per screen is why they are four chapters.

### 9f. The one place a quotation is not printed by `renderSource()`, and why

FEATURE_SPEC §2 P16 test 1 is *"grep every module for a rendered quotation not routed through
`renderSource`: zero"*. This exercise is a deliberate, single, declared exception, and it is the
only one in this module.

`renderSource()` prints the four provenance answers above the words, in DOM order, at the same type
size. Here the four answers **are the exercise**. Routing the document through it before the
commitment would print the answer sheet above the question; passing a stripped source object would
print `[unsourced]` four times in `--danger` and increment the app's own defect counter, which would
be a lie about the corpus.

So, for exactly one screen, the document is set as its quotation, its speaker line and its locator,
and the panel **says so in front of the student**: *"Every other document in this atlas is printed
with four labelled answers above the words… They are missing here on purpose."* On the far side of
the commitment the last chapter is `renderSource()` of the same document, whole — four answers, what
this atlas cites it for, and where to check it. `produce.scenario.js` asserts both halves:
`P16-src-withheld` (nothing of ours in `textContent` before) and `P16-src-compare` (`.hgx-src__whole
.src` after).

The lesson path's own source beat and the recall quiz's Macaulay item withhold the apparatus the
same way for the same reason. Three surfaces, one exception, declared on each.
