# THE RESPONSIVE LAW — an amendment to `docs/LAYOUT_BUDGET.md`

**Status: normative.** It amends LAYOUT_BUDGET **B5** (nothing stands on the plate) and **B2**
(the drawn map's floor) below 62 rem, and it adds one rule those two could never state. Where it
and a component stylesheet disagree, this file wins and the component is wrong. It is subordinate
to `docs/DIDACTIC_SPEC.md` and `docs/DESIGN.md`, and it is read together with LAYOUT_BUDGET, which
governs everything at and above 62 rem unchanged.

**Owner:** the shell / responsive agent.
**Files that implement it:** `app/index.html`, `app/css/layout.css`, `app/css/chrome.css` §E,
`app/js/chrome/index.js`.

> **§11 BELOW ADDS READING MODE, AND IT AMENDS LAYOUT_BUDGET B1 AND THIS FILE'S OWN D4.**
> B1 gives the plate 50–64 % of the viewport. It is right about the COLD PLATE, where the plate is
> the subject of the page; it was being applied unchanged inside a mounted lesson beat, where the
> subject is the beat. Measured at 390×844 on `#tour=thirty&step=18` — Dyer and Tagore at Amritsar —
> the beat's 2,154 px of prose was read through a **128 px** window with a **390×170** map above it
> and a **390×184** time control below: **16.8 screenfuls**, four lines at a time, a mask fading a
> sentence at both edges, and three nested touch scroll regions inside one panel. Three phone rounds
> named it as the one defect that decides whether a fifteen-year-old finishes the lesson on a bus,
> and every harness in this repository passed the build that had it. §11 states the amendment, its
> per-breakpoint table, the contract the path team writes, and the floor a hostile critic can test.
> Its executable form is `tools/scenarios/read.js`.
>
> **ROUND 2 AMENDED §11 AGAIN, AND IN ONE DIRECTION: READING MODE IS A PROPERTY OF THE
> SURFACE, NOT OF THE BEAT.** It required a mounted `.tr-panel`, and four of the surfaces a
> student on the guided path actually meets are not one. Measured at 390×844: **the Close** —
> the ending, the sign and the print — read through a **242 px** window holding **6,342 px**
> (26.2 screenfuls), over a 170 px map of a place it is not about, with **no control anywhere**
> to collapse any of it; **the two recall cards** read 661 px through 242 with the map at 192
> and, having no `.tr-panel__foot`, no way back from `OPEN THE MAP`; and the panel stacked
> behind the open sheet kept **26 tab stops** nobody could see. §11.2, §11.4, §11.5, §11.9 and
> rules **R12–R16** are that amendment.

**Its executable form is `tools/scenarios/dock.js`.** It prints PASS/FAIL per rule and
`>>> the dock law holds` / `>>> DOCK LAW BROKEN`, and it is run at every viewport in the table:

```
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d390  --mobile
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d768  --w 768  --h 1024
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d900  --w 900  --h 700
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1024 --w 1024 --h 640
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1366 --w 1366 --h 768
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1440 --w 1440 --h 900
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d1920 --w 1920 --h 1080
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d844  --w 844  --h 390   <- §12
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d740  --w 740  --h 360   <- §12
node tools/inspect.js tools/scenarios/dock.js --out /tmp/d360  --w 360  --h 740   <- §11.15
```

It **cold-loads into a lesson beat** and walks steps 1, 4, 9, 14 and 23, because every defect it
exists to catch survives a resize down from desktop and appears only on first paint.

---

## 0. Why this file exists

LAYOUT_BUDGET B5 says no floating element may cover the plate, and then exempts three layers by
name: `.stage__map`, `.stage__over` and `.app__overlay`. **Every floating control in this
application is parented into the third one** — the map's furniture, the lesson's transport and the
legend's pinned ribbon all say so in their own comments, and all three are right to be there,
because `.app__overlay` is the only layer that can escape `.stage__map`'s stacking context. So B5
has never once been able to see the things it was written to stop, and `budget.js` measures the
cold plate, where none of them exist.

Measured on the running app, cold-loaded into a mounted lesson beat — the state a student is in for
twenty-nine of the lesson's thirty minutes:

| | **390×844**, beat 9 | **768×1024**, beat 1 | **900×700**, beat 1 |
|---|---|---|---|
| the map band a student sees | 390×152 (y 156→308) | 768×174 (y 158→332) | 596×394 |
| `.map__zooms` | 246,164 136×42 = **5,712** | 624,166 136×42 = **5,712** | 542,124 46×124 = **5,704** |
| `.tr-dock` (Back · 9/24 · Next) | 176,234 206×40 = **8,240** | 554,288 206×40 = **8,240** | 382,358 206×40 = **8,240** |
| `.legend__pin` (the colour ribbon) | 0,278 390×28 = **10,920** | abuts, 0 | abuts, 0 |
| `.map__foot` (the “British means” dial) | not rendered | not rendered | 8,402 580×100 = **57,792** |
| **covered** | **24,872 px² = 42.5 %** | **13,952 px² = 10.4 %** | **71,736 px² = 30.5 %** |
| **contiguous map left** | **33,785 px²** | **119,680 px²** | **163,088 px²**, in three pieces |

At 390×844 the transport sat directly on the Bay of Bengal, on the beat about Bengal. At 900×700
the three strips put a hole in Australia, a hole in Siberia and a hole across the Southern Ocean.

**A map with three holes in it is not a map.** The value of an atlas is in its contiguity: you read
a British Empire plate by seeing Britain, West Africa, the Caribbean and India *at the same time*.
A control that floats costs 0 px of height and up to 42 % of the map, every frame. A control that
docks costs its own height once and 0 % of the map. Docking is right, and this file is the schedule
of what docks where.

---

## 1. THE LAW

> **Below 62 rem (992 px), nothing floats inside the map rectangle.**
> Every control that acts on the map, the lesson or the year has a **named dock**, the dock is a
> **strip with a height**, and the height is charged against the plate once. There is no exemption
> for `.app__overlay`, for the map's own furniture layer, or for a control that “only covers sea”.

The band is published as `#app[data-dock="docked" | "float"]`, mirrored by `app/js/chrome/index.js`
from exactly the media condition `layout.css` states:

```
DOCKED BAND   (max-width: 61.999rem)     390×844, 768×1024, 900×700
FLOAT  BAND   everything else            1024×600, 1024×640, 1366×768, 1440×900, 1920×1080
```

62 rem is not a new number: it is the breakpoint every other piece in this app already keys on
(LAYOUT_BUDGET §2A). In the float band B5 is unchanged and its three exemptions stand.

**The one exception, and it is stated rather than emergent.** The map's hover card
(`.map__tiplayer`) may sit over the plate in the docked band. It takes no pointer events, it
follows the pointer, and it exists only while the pointer is on the map: it is the map speaking,
not furniture standing on it.

---

## 2. THE TABLE — where every floating element goes, per breakpoint

| | **390×844** (sheet band) | **768×1024** (sheet band) | **900×700** (side band) | **≥ 62 rem** (float band) |
|---|---|---|---|---|
| `#app[data-dock]` | `docked` | `docked` | `docked` | `float` |
| `#app[data-rail]` | `sheet` | `sheet` | `side` | `side` |
| **lesson transport** (Back · n/24 · Next) | `.bar__dock` in the masthead | `.bar__dock` | `.bar__dock` | `data-mount="toolbar"` — unchanged |
| **escape** (“Explore on my own”) | the collapsed `Tools` panel | the masthead's own copy, then `Tools` | same | `chrome-end` — unchanged |
| **a beat's jump link** (“Place it ↓”) | not in the bar — it points at the panel below it | same | same | the transport — unchanged |
| **map zoom cluster** (`+ − ⌂`) | the ribbon strip, trailing end | the ribbon strip, trailing end | the ribbon strip, trailing end | over the plate — unchanged |
| **“British means” dial** | **not on the plate** (see §5) | `.stage__dock` | `.stage__dock` | over the plate — unchanged |
| **“Other ways to draw this”** | `apparatus` only | `apparatus` only | `apparatus` only | unchanged |
| **the colour ribbon** | `.stage__key` / its pinned copy, below the map | same | same | same |
| `--key-h` | **32** (28 in the float band) | 32 | 32 | 28–34 |
| `--dock-h` | **0** | **36** at `working`+ | **36** at `working`+ | 0 |
| `--foot-h` | 0 → `#app[data-foot="off"]` | 0 → `off` | 26 → `on` | 26–32 → `on` |
| **the map's clean band, before** | 390×152, 42.5 % covered | 768×174, 10.4 % covered | 596×394, 30.5 % covered | — |
| **the map's clean band, after** | **390×192, 0 % covered** | **768×334–355, 0 %** | **596×354, 0 %** | unchanged |
| **the beat panel** | **exactly 280** (B8's floor) | **exactly 280** | 304 wide × 652, a column | unchanged |
| `.bar__dock` (the reserved box) | **9 rem**, and the wordmark stands down | 9 rem | 9 rem | not shown |
| masthead while a beat is mounted | `data-bar="stack"`, unconditional | same | same | same |

### The arithmetic, at 390×844, which is the window this law exists for

```
bar         46   <- globe · [<- 9/24 ->] · Layers · Tools
lede       110
MAP        192   <- clean, contiguous, nothing on it   (was 152, 42.5% covered)
ribbon      32   <- --key-h; carries the zoom cluster at its trailing end
panel      280   <- LAYOUT_BUDGET B8's floor, met exactly
time       184
           ---
           844
```

There is no fourth place for a pixel to come from. That is why the definition dial is not on the
plate at phone width (§5), why the through-line has no strip of its own there (§6), and why the
masthead in that band carries the mark, the lesson and `Tools` and nothing else: measured with the
box at 13.75 rem, `mark 28 + Layers 97 + box 220 + Tools 68 = 413` of a 390 px bar, the globe was
cut in half and “Layers” read “Lay”.

**Contiguous map, before → after**, measured inside the same beats:

| | before | after | |
|---|---|---|---|
| 390×844 | 33,785 px² (390×152, 42.5 % covered) | **74,880 px²** (390×192, 0 %) | **+122 %** |
| 768×1024 | 119,680 px² (768×174, 10.4 % covered) | **272,640 px²** (768×355, 0 %) | **+128 %** |
| 900×700 | 163,088 px² (596×394, 30.5 % covered, in three pieces) | **210,984 px²** (596×354, 0 %) | **+29 %** |
| 1366×768 (cold plate) | 1366×462, 60.2 % of the viewport | **1366×462, 60.2 %** | unchanged |

---

## 3. THE DOCK-SLOT CONTRACT — what other modules read and write

Everything below is published by `app/js/chrome/index.js` on `#app`, in CSS pixels, measured on the
running app, and re-published whenever it changes. **Read it; never redefine it.**

### 3.1 The slots, in the DOM

| slot | element | where it is | who renders into it |
|---|---|---|---|
| `data-mount="dock-step"` | `<div class="bar__dock" id="dock-step">`, a child of `.app__bar` | the masthead, between the wordmark and `Tools` | **tours** (P05) — the lesson transport |
| `data-mount="dock-foot"` | `<div class="stage__dock" id="dock-foot">`, a child of `.app__stage` | a strip at the foot of the plate, immediately **above** the colour ribbon | **map** (P02) — every control over the whole map |
| `data-mount="legend"` | `<div class="stage__key">` — unchanged | the ribbon strip, below the dock | **legend** (P17), and the map's zooms at the trailing end |

Both new slots go through `core/registry.js` like every other slot, so a second claimant gets its
own `.mount--sub` root and cannot delete its neighbour.

**`dock-step` is filled by adoption until tours renders into it.** `app/js/chrome/index.js`
`_syncStepDock()` moves the existing `.tr-dock` node into the slot — the same element, with tours'
own listeners and lifecycle — and puts it back the moment the band or the lesson changes. It is the
only piece of this pass that touches another module's DOM, and it does so because **CSS cannot fix
a focus order.** Measured at 390×844 on beat 9, with the bar pinned into the masthead by §E alone
but still parented into `.app__overlay`, which is the last element in the document:

```
tab 1  Skip to the map        tab 4  Tools
tab 2  Skip to the timeline   tab 5  The argument, in full
tab 3  Layers                 tab 6  a territory on the map
…      Back and Next: past tab stop 40, after the whole dossier
```

A control drawn between `Layers` and `Tools` and reached fortieth is worse than the floating bar it
replaced (WCAG 2.4.3). Adopted, it is **tab 4 and tab 5**, exactly where it is drawn. Rule **D9**
asserts it as document order — the transport is inside `.app__bar` and precedes both `.app__stage`
and `.app__sheet` — because a beat legitimately moves focus into its own panel when it mounts, so a
count of Tab presses measures where the beat put the caret and not where the transport is.

`.stage__dock` is a flex row: `align-items: center`, `gap: --space-md`, `overflow: hidden`. A child
carrying **`class="dock-end"`** is pushed to the trailing end. The strip is `display: none` unless
`#app[data-dock="docked"][data-dockfoot="on"]`, and it has no height when it is not shown, so a
module that renders nothing into it costs the map nothing.

### 3.2 The attributes

| attribute | values | means |
|---|---|---|
| `#app[data-dock]` | `docked` \| `float` | the band. `docked` ⇒ **the law applies**. Mirrors `(max-width: 61.999rem)`. |
| `#app[data-dockfoot]` | `on` \| `off` | is there anything for the foot dock to hold? Measured: a piece has rendered into `dock-foot`, or a piece is still drawing a control strip at the plate's foot. `off` ⇒ `--dock-h` is 0 and the map keeps the 36 px. |
| `#app[data-path]` | `on` \| `off` | is a lesson mounted? From `state.activeTour`, so it is right on a cold load into `#tour=…&step=…` rather than one frame later. |
| `#app[data-foot]` | `on` \| `off` | is there a provenance strip on screen at all? `off` means `--foot-h` is 0 and **anything rendered into `data-mount="statusbar"` is invisible, not merely short** — see §6. |
| `#app[data-rail]`, `#app[data-stage]`, `#app[data-bar]` | unchanged | LAYOUT_BUDGET §2A, §3, §5A |

### 3.3 The custom properties

| property | means |
|---|---|
| `--dock-step-x/-y/-w/-h` | the transport's reserved box in the masthead, as a **viewport** rectangle. |
| `--dock-step-box-w` | **how wide that box is, and it is a band, not a constant.** 9 rem under 46 rem, where tours abbreviates the transport (measured at 390×844 on the last step of the full route: Back 31 + counter 27 + Next 27 = 157); **17.5 rem from 46 to 62 rem and in the whole landscape band**, where the labels are whole — "past the end" and the Close's own "Say what it does ↓" measure **260** on that same step, and at 9 rem Next was drawn at 658–788 of a 768 px window and 790–920 of a 900 px one, outside the box and outside the viewport (`dock.js` D2, wave 10 round 2). 13.75 rem above 62 rem, where the transport floats. **It is paid for out of `.brand__text`, which stands down for the lesson wherever the box is 17.5 rem** — the wordmark is identification and the transport is the lesson, and there is no other slack in that masthead: measured mid-lesson before the change, mark + wordmark 324 + Layers 164 + box 144 + Tools 68 ends at x=752 of 768. |
| `--dock-foot-x/-y/-w/-h` | the control dock, as a viewport rectangle. `0 0 0 0` when there is no dock. |
| `--dock-key-x/-y/-w/-h` | the colour ribbon strip, as a viewport rectangle — **whichever copy is live**. P17 renders the ribbon in two places (its own slot, and a `position: fixed` copy the moment a rail opens under 62 rem), so “where is the ribbon” has no answer in CSS. It has one here. |
| `--dock-foot-dx/-dy`, `--dock-key-dx/-dy` | the same two rectangles expressed as an **offset from `.map__furniture`'s own top-left**. `.map__furniture` carries `container-type: size`, which is `contain: size layout style`, which makes it a containing block for every `position: fixed` descendant — so a strip inside it *cannot* be pinned to a viewport rectangle. Pin to these instead. |
| `--dock-h`, `--key-h`, `--map-min` | the two strips' heights, and the clean map the shell asks for (a pre-paint floor; see §4). |
| `--rail-top-min` | unchanged in name, **changed in meaning**: it is now `the drawn map's bottom + the depth of the foot strips`, capped so the panel keeps `--cx-sheet-min`. See §4. |
| `--read-peek` | the peek strip's height in CSS px, as measured (§11). |
| `--read-trim` | the remainder when the reading window is divided by its own line box: 0–32 px, given back so the window is a whole number of lines and its bottom edge falls between them (§11.5A). Applied to `.cx-sheet__body`'s `max-block-size`, so it lands inside the panel's own surface and never as a seam of bare stage. |
| `--rail-clear`, `--dock-floor`, `--stage-top`, `--stage-height` | unchanged (LAYOUT_BUDGET §2A). `--dock-floor` now also clears `.stage__dock`. |

### 3.4 On the bus

```js
bus.on('chrome:layout', ({ rail, dock, dockFoot, docks, stage, plate, railClear, dockFloor, vw, vh }) => …);
// docks = { step: {x,y,w,h}, foot: {…}, key: {…}, offset: { foot: {x,y}, key: {x,y} } }
```

---

## 4. THE MAP'S FLOOR — what the shell guarantees, and what it stops guaranteeing

**Before.** `_mapFloor()` returned a flat `150`, and `--rail-top-min` was `the drawn map's top + 150`.
That number was a lie about what a student saw: at 390×844 the 150 px band it defended contained the
colour ribbon (28 px, pinned across the map's own bottom edge), the zoom cluster and the transport,
so the map inside it was about 120 px with 29 % of *that* covered.

**Now, three rules:**

* **F1 — the panel gets exactly `--cx-sheet-min`; the map gets everything else.**
  `--rail-top-min = stage.top + (stage.height − strips − 280) + strips = stage.top + stage.height − 280`,
  where `strips` is the **union** (not the sum — P17 renders two copies of one ribbon) of
  `.stage__dock`, `.stage__key` and `.legend__pin`.
  **It is computed from the stage, never from the map, and that is the point.** Reserving “what the
  map actually draws” was tried and it is a trap: the reservation sets the map's rectangle (F3) and
  the rectangle sets what the map draws, so the pair is a feedback loop that can only contract.
  Measured at 390×844 under `prefers-reduced-motion`, where the first frames happen in a different
  order, it settled at **a map of 165 and a panel of 352**; the same build under full motion settled
  at **192 and 280**. Both are stable fixed points of the same arithmetic, and a layout with two
  answers is a layout with none. The stage's height is an input, not an output, so this has one.
  It is also the most map the budget can give.
* **F2 — the panel is never under `--cx-sheet-min`** (LAYOUT_BUDGET B8, 280 px), whatever the map
  wants; and the map is never under 40, whatever the panel wants.
* **F3 — the map's rectangle is the room it actually gets.** In the sheet band `.stage__map` now
  ends where the foot strips begin, not at the foot of the stage, and it clips.
  Measured at 768×1024 before F3: `.stage__map` was 768×355, the map drew a 768×391 canvas into it
  with an inline height of its own, and overflowed by exactly the 36 px the control dock stands in.
  **This also makes LAYOUT_BUDGET B6 answerable for the first time**: “the drawn map must cover 80 %
  of the plate rectangle” was measuring the map against a rectangle a third of which was behind a
  panel — 35 % at 390×844 — and no work by P02 could have moved that number.

`--map-min` (11.5 rem at ≤ 40 rem, 18.75 rem at 40–62 rem, 20 rem in the short side band) is the
floor used **before the first paint**, when there is no stage to measure. If the map letterboxes
inside the rectangle F3 hands it, the empty band is *inside* `.stage__map` — which is exactly what
B6 measures and exactly what P02 owns. Measured at 390×844: the map draws 192 of a 192 rectangle
under full motion, and 165 of it under reduced motion, where P02 lifts the plate into its own fixed
strip (see §7).

---

## 5. WHY THE DEFINITION DIAL IS NOT ON THE PLATE AT 390

It is the best single idea in the app and it is the one thing this law takes away at one viewport.
The arithmetic, at 390×844 with a beat mounted, against B8's 280 px panel:

| the dial's home | the map keeps |
|---|---|
| the ribbon strip alone (32) | **192** |
| + a one-row control dock (36) | **156** — and 390 px will not carry “1 claimed · 2 administered · 3 controlled · 4 influenced” on one 36 px line. `map.css` wraps it to two lines *on purpose*: round 6 clipped “4 influenced” and two of the four definitions of British became unclickable. |
| + a two-row control dock (72) | **120** — less map than the build this pass is repairing |

So the dial sheds a stratum, which is LAYOUT_BUDGET B3's own remedy, and LAYOUT_BUDGET §7's
instruction to P02 already names its two destinations: *the ribbon strip, or the rail*. Nothing is
lost meanwhile — keys 1–4 still change the reading and the reading itself is printed under the year,
in the time bar, at every viewport — but **this is a debt, not a design**, and §7 below says who
pays it.

Until this pass the same thing happened by accident: `map.css` stands its own furniture down below
11 rem of plate, and at 390 the plate happened to be under 11 rem whenever a beat was open. It is
not any more (the map now draws 192), so the rule that was doing this work invisibly is written down.

---

## 6. THE THROUGH-LINE HAS NO STRIP ON A PHONE

`.cl-bar` — the sentence a student assembles across the whole lesson and signs at the Close, the
app's C5 centrepiece — is rendered into `data-mount="statusbar"`, which lives in `.app__foot`.
Measured at 390×844 on beat 9: the element was in the document, carried **all six of its clauses**,
and had a bounding box of **0×0**, because `--foot-h` is `0px` in the sheet band and `.app__foot` is
`display: none`. At 900×700 it is 564×18 in a 26 px strip and prints **two of six**.

There is no room for a strip on a phone: §2's arithmetic closes at 844 with the panel at B8's floor.
So the shell does the only honest thing it can, which is to **say so in a form a piece can test**:
`#app[data-foot="off"]` means *there is no provenance strip at this viewport; render your foot
content somewhere else*. §7 says where.

---

## 7. WHAT EACH PIECE MUST CHANGE

`app/css/chrome.css` §E enforces all of this from outside today, the way the rest of §E does. **Each
block names the piece that owns the real fix and deletes the block**, and `dock.js` must still pass
afterwards.

### P05 — tours (`app/js/tours/`, `app/css/tours.css`)

Render the transport into **`data-mount="dock-step"`** and stop positioning it. The reserved box is
already in the masthead at every width below 62 rem, 9 rem at every width in this band,
and it is the same strip the transport occupies at 1366 — so this is one destination, not two, and
Back and Next are in the same place on a phone as on a projector. Delete `.tr-dock`'s
`position: fixed`, its `bottom:` expression and its `--tr-dock-lift`; the shell is adopting the node
into the slot right now (§3.1) and §E strips its panel border, because in a masthead it is a control
among controls and not a card lifted off the map. Two things leave the bar in this band and both
are measured: **`.tr-bar__escape`** (from 46–62 rem the masthead's own “Explore” is right there and
the two are a duplicate that does not fit — at 768×1024 two beats in it reached x = 736 of 768, and
`budget-working.js` rule W15 caught it; below 46 rem neither is in the bar and “Explore on my own”
is one press on `Tools` away), and **`.tr-bar__togate`**, the beat's “Place it ↓” / “the field ↓”
jump link, which at 390×844 reached x = 365 of 390 and points at a panel that is already on screen
directly below it. **Test:** `dock.js` D2 (Back and Next rendered, inside the viewport, topmost at
their own centre, above y = 60, at every beat) and **D9** (the transport precedes the plate and the
panel in the document).

### P02 — the map (`app/js/map/`, `app/css/map.css`)

Three things, and the first is the big one. **(1)** At `#app[data-dock="docked"]`, render every
control over the whole map into **`data-mount="dock-foot"`** — the definition dial as a single
36 px row (its printed title stands down; the four segments never clip, that was round 3's defect),
and put the zoom cluster in the ribbon strip's trailing end with `class="dock-end"`. Do not position
either yourself: §E is pinning them to `--dock-foot-dy` and `--dock-key-dy` right now precisely
because `container-type: size` on `.map__furniture` makes a viewport rectangle unusable from inside
it, and rendering into the slot removes that whole problem. **(2)** Give the dial a home at
≤ 40 rem — the ribbon strip's `.cx-more` route, or `ask:sheet`. §5 is a debt this module owns.
**(3)** `.stage__map` now clips in the sheet band and it is the room you actually have: at 768×1024
it is 768×355, not 768×635, because the lower 280 was always behind the bottom sheet. This is the
rectangle B6 has been asking you to fill. **(4)** The phone's enlarged plate is now the *smaller* of
your two geometries: measured at 390×844 under `prefers-reduced-motion` with a territory selected,
`.map.is-enlarged` is 390×**165** where the docked band hands you 390×**192**. That device was
designed when the docked band was 122 px. Re-fit it to `.stage__map`, or stop using it below 62 rem.
It also fires inconsistently — enlarged under reduced motion at beat 9, not enlarged under full
motion at the same beat — which is a second thing to look at.

### P21 / the Close (`app/js/close/`)

Read **`#app[data-foot="off"]`**. When it is `off` there is no provenance strip on screen and the
through-line is invisible rather than short — measured at 390×844, all six clauses present, bounding
box 0×0. Render the through-line as the beat panel's own last block in that state (the panel scrolls
and it is where the student is already reading), and keep the strip where `data-foot="on"`. At
900×700 the strip is 564×18 and prints two of six clauses, so the same move buys four clauses there
too. Nothing in this needs new geometry from the shell; it needs one attribute and one branch.

### P06 / compare (`app/js/compare/`)

Compare is a second full-width teaching surface and the shell already arbitrates it against the rail
sheet (LAYOUT_BUDGET §3). Two things it must now also do: read **`#app[data-dock="docked"]`** and
never pin a control over the plate in that band — if the two-plate comparison needs a control strip,
it goes in `data-mount="dock-foot"` with the rest, or it takes a row of its own and states the
height here; and read **`#app[data-path="on"]`** rather than deriving “is a lesson running” from the
tours bus, so that opening compare inside a beat cannot desynchronise the masthead it shares with the
transport.

### P17 — the legend (`app/js/legend/`, `app/css/legend.css`)

The ribbon strip is now a **dock as well as a key**: the map's zooms sit at its trailing end below
62 rem, and §E reserves 6.5 rem there — measured, not rounded: three 28 px buttons, two 4 px gaps
and one 8 px inset. Render your `+n more` route inside that reservation rather than against the
strip's own right edge, and **make a swatch that does not fit disappear rather than be cut**:
measured at 390×844 with the reservation in place, the first chip reads “Settler assemb”, and
LAYOUT_BUDGET §4 says in as many words that a word cut mid-word teaches nothing. A chip is a swatch
*and* a word; half a word is not a shorter key, it is a wrong one. And the two copies of the ribbon are now a published fact
(`--dock-key-*` resolves whichever is live) — one copy would be better, and the pinned copy is only
needed because a bottom sheet used to be able to bury the strip, which F1 no longer allows.

---

## 8. THE MASTHEAD IS A CONSTANT FOR THE LENGTH OF A LESSON

LAYOUT_BUDGET §5A makes the masthead's collapse a **measurement** — right for a bar whose contents
are fixed. A lesson's are not. Measured at 1366×768, walking the authored path:

| step | `data-bar` | controls on screen |
|---|---|---|
| 1 | *unset* | 9 |
| 4 | *unset* | 9 |
| 5 | *unset* | **10** — the beat adds “Place it ↓” and “the field ↓” |
| 8 | *unset* | 9 |
| 9 | *unset* | **10** — the beat adds “Count it ↓” |
| 14 | **`stack`** | **6** |
| 23 | **`stack`** | **5** |

The masthead was one shape for the first half of the lesson and another for the second. Six
entrances whose position a student had learned moved behind a menu at beat 14 — not because the
student did anything, but because beat 14 happens to add a wide control of its own. That is the
definition of an interface that cannot be learned.

**So while `#app[data-path="on"]`, `data-bar` is `stack`, unconditionally, at every viewport.**
`toolbar` is still never collapsed (LAYOUT_BUDGET §5A, and rule W4 of `budget-working.js`), so Back
and Next are never behind the menu; the bar holds the lesson and `Tools`, from the first beat to the
last. `dock.js` rule **D8** asserts it by counting the masthead's own controls — excluding
`.bar__slot--main` and `.bar__dock`, because a beat's own control legitimately changes — and
requires the count and `data-bar` to be identical at every beat.

---

## 9. THE RULES, IN THE FORM `dock.js` ASSERTS THEM

| rule | assertion |
|---|---|
| **D1** | In the docked band, the summed area of every positioned, *painting* element overlapping the **drawn map** is **0**. No exemption for `.app__overlay`, `.map__furniture` or “it only covers sea”. Layers that paint nothing (`.ly-layer` and the like) are not boxes; their children are still measured one at a time. |
| **D2** | `.tr-bar__back` and `.tr-bar__next` are rendered, inside the viewport, and the topmost element at their own centre — at every beat. In the docked band they are above y = 60, i.e. in the masthead. |
| **D3** | `#dock-step[data-mount="dock-step"]` and `#dock-foot[data-mount="dock-foot"]` are in the DOM; the step dock and the ribbon publish non-zero rectangles — **except in reading mode (§11), where the ribbon publishes `0 0 0 0`, which is the honest answer when the strip it keys is 44 px of coastline.** |
| **D4** | The drawn map keeps its band: **≥ 360×176** at 390×844, **≥ 700×220** at 768×1024, **≥ 560×330** at 900×700 — **except in reading mode (§11), where the plate is a full-width peek strip of 40–72 px and the band returns in one press.** |
| **D5** | The beat panel is **≥ 280** (LAYOUT_BUDGET B8). |
| **D6** | Both foot strips start at or after the drawn map ends. |
| **D7** | No document scroll, at any beat (LAYOUT_BUDGET B4). |
| **D8** | The masthead's own control count and `data-bar` are identical at every beat of one lesson (§8). |
| **D9** | In the docked band the transport is inside `.app__bar` and **precedes `.app__stage` and `.app__sheet` in the document**, so the keyboard reaches it where the eye finds it (§3.1). |

`shell-accept.js`'s rule F floors were amended in the same pass, with the measurement recorded in
that file: 900×700 380 → 340, 390×844 140 → 160, 768×1024 190 → 300.

---

## 11. READING MODE — an amendment to LAYOUT_BUDGET B1, and to D3 and D4 above

### 11.1 The measurement

**LAYOUT_BUDGET B1 is a rule about the cold plate and it was being applied inside a lesson beat.**
On the cold plate the map IS the subject of the page and 50–64 % of the viewport is right. Inside a
mounted beat the subject of the page is the beat, and for **twelve of the twenty-five steps** of the
authored path the beat's whole argument is prose in a panel while the plate holds one polygon doing
nothing.

Measured on the running app at **390×844**, cold-loaded into `#tour=thirty&step=18` — Dyer and
Tagore at Amritsar, the app's C6 beat, 2,154 px of prose and two parallel testimonies:

| | before | after |
|---|---|---|
| `.app__lede` | 390×132 | 390×132 — unchanged; it is the beat's own opening sentence |
| `.stage__map` (the drawn plate) | 390×170 | **390×44** — a peek strip, and the strip is the control |
| the colour ribbon (`.legend__pin`) | 390×32 | **not rendered** — it returns with the map it keys |
| `.app__sheet` (the beat) | 390×280 = **33.2 %** | **390×570 = 67.5 %** |
| `.cx-sheet__head` | 390×37 | 390×31 |
| **`.tr-panel__scroll` — THE READABLE WINDOW** | **390×128, holding 2,154** | **390×434, holding 2,154** |
| in screenfuls | **16.8** | **5.0** |
| `.tr-panel__foot` (P05) | 390×53 | 390×53 |
| `.cl-blk`, the through-line (P21) | 390×33 | 390×33 |
| `.app__time` | 390×184 = 21.8 % | **390×52 = 6.2 %** |
| scroll regions between the student's thumb and the prose | **3** (`.tr-panel__scroll` in `.sheet__body` in `.app__dossier`) | **1** |
| document scroll | none | none |

and at **768×1024**, same address:

| | before | after |
|---|---|---|
| `.stage__map` | 768×334 | **768×44** + the dial's own 36 px dock |
| `.app__sheet` | 768×280 = 27.3 % | **768×742 = 72.5 %** |
| **`.tr-panel__scroll`** | **768×128, holding 1,329** | **768×598–606, holding 1,329** |
| in screenfuls | **10.4** | **2.2** |

The phone critic's own figures for the round they reviewed were **129 px holding 2,135** at 390×844
and **154 px holding 1,329** at 768×1024. The numbers above were taken independently, three rounds
later, on a different build, and they are the same defect.

**Every rule in this repository passed that build.** B8 passed (280 ≥ 280). B1 passed. D5 passed.
W2 passed. The panel was big enough to pass and too small to read, so §11.7 adds the rule that can
fail.

### 11.1A The second measurement — round 2, and it is the same defect one surface out

Reading mode asked for a mounted beat panel, so it could only see a beat. Measured on the
running app at **390×844**, on the build round 2 reviewed:

| the surface | the window | what it held | screenfuls | the map behind it | the control that leaves |
|---|---|---|---|---|---|
| a textual beat (`#tour=core&step=11`, Amritsar) | `.tr-panel__scroll` 434 | 2,154 | 5.0 | 44 px peek | `Map`, in the beat's own foot |
| **THE CLOSE** (`close:open`) | `.cx-sheet__body` **242** | **6,342** (7,071 once signed) | **26.2** | **170 px** + a 32 px ribbon + a 184 px time control | **none — no `.tr-panel__foot` is rendered** |
| **a recall card** (`#tour=core&step=15`) | `.cx-sheet__body` **242** | **661** | **2.7** | **192 px** | **none** |
| a Complication Gate (`#tour=core&step=4`) | `.tr-panel__scroll` 456 | 811 | 1.8 | 44 px peek | `Map` |
| the panel stacked behind the open sheet | — | 2,110 | — | — | **26 tab stops, not `inert`, `display: block`** |

Three of those five are the lesson's own surfaces and one of them is its ending. The Close is
**the most textual surface in the application and the only one that never collapsed the map**,
and a recall card offered `OPEN THE MAP` with nothing to press to come back — an entrance with
no exit, which is worse than no mode at all.

After, same addresses, same measurements:

| the surface | the window | screenfuls | the map | the ribbon | the time control | the control that leaves |
|---|---|---|---|---|---|---|
| a textual beat, Amritsar | **458** | 4.7–5.7 | 44 | 0 | 52 | `Map`, tours' |
| **THE CLOSE** | **503** holding 7,152 | **14.2** | **44** | **0** | **52** | **`MAP`, the shell's, in the sheet's head** |
| **a recall card** | **570–578** holding 579–676 | **1.0–1.2** | **44** | **0** | **52** | **`MAP`, the shell's** |
| a Complication Gate | **578** | 1.0 | 44 | 0 | 52 | `Map`, tours' |
| the panel behind the sheet | — | — | — | — | — | **`inert` + `aria-hidden`, 0 tab stops** |

and at **768×1024**: the Close **667** holding 4,813 (7.2 screenfuls, from 27), a textual beat
**621**, a gate **741**.

### 11.2 The contract — what the path team writes and what the shell publishes

The split is a property of the SURFACE, not of the viewport. A beat declares it; so may any
piece that opens a surface in the rail.

| what | who writes it | values |
|---|---|---|
| `<html data-tour-fit>` | **P05 tours** — from the step's authored `"fit"` field in `tours.json`, else the step's kind, else whether the beat flies somewhere; a student's press on `Map` outranks all of it for as long as they stay on that step. **It answers only while the beat it declares is on screen** — see the note below | `text` \| `map` |
| **`bus.emit('ask:sheet', { …, work })`** *(new)* | **any piece that opens a surface in the rail** — the same sentence `fit` is, said about a sheet: is the plate the evidence for this surface, or is the panel? | `text` \| `map` \| absent |
| **`data-read-window`** *(new)* | **any piece**, on the element its prose actually scrolls in. The shell and `read.js` both look for it first, then for `.tr-panel__scroll` and `.cl-close__scroll`, then for the deepest scroller with something to scroll | an attribute, no value |
| `#app[data-read]` | **the shell** (`chrome/index.js` `_readWork`), resolved from the above | `on` \| `off` |
| `#app[data-beatwork]` | the shell — the resolved answer, for a piece that needs the reason and not just the state | `text` \| `map` \| absent |
| `--read-peek` | the shell — the peek strip's height in CSS px, as measured | `44px` |
| `chrome:layout` on the bus | the shell — `{ read, beatWork, readPeek, … }` alongside everything §3.4 already carries | |
| `bus.emit('ask:read', { mode })` | **any piece** — the same shape as `ask:stage`. The shell answers by pressing the one control tours renders (`.tr-panel__fit`), so the two routes can never disagree and the announcement is made once, by the module that owns the words | `map` \| `text` |

**The fallback table, for a step that has not declared.** It is read only when `data-tour-fit` is
absent, and a declaration always wins:

```
TEXT   tension  dispute  gate  sort  definition  close  source  retrieve  recall  loop  offmap
MAP    sweep    predict  present  paint  compare  poster
```

**A DECLARATION ABOUT A BEAT ANSWERS ONLY WHILE THE BEAT IS ON SCREEN, and that is round 2's
correction.** `data-tour-fit` is tours' contract about a STEP; a recall card, a gate rendered
into the sheet and the Close are surfaces of the lesson with no beat panel in them, and the
attribute standing from the step before was answering for a beat that had left. Measured at
390×844 on `#tour=core&step=15` — "The famine on the railway", a recall card — the standing
declaration read `map`, so reading mode was off, 661 px of card was read through 242 with the
map at 192, and the card renders no `.tr-panel__foot`, so **the app's only reading toggle did
not exist on that screen**. When there is no `.tr-panel`, the SURFACE answers.

**THE SURFACE TABLE, and it is deliberately short.** A sheet id matching
`/^(close|tours:|quiz:)/` opens a surface of the lesson or of the ending, and its work is
prose: `close`, `close:ledger`, `tours:beat:…`, `tours:gate:…`, `tours:dispute:…`,
`tours:recall:…`, `quiz:recall`. **Nothing else in the application is swept in.** A territory
dossier, a layer's key, the comparison, the search, a chart and the map's own definition sheet
are unchanged, because on those the plate is what the reader is looking at — measured at
390×844 with `#year=1913&sel=barbados` open, `data-read` is `off` and the map is 390×186, as it
was. Any of them may opt in or out by name with `work` in its own `ask:sheet` payload.

**And the default for an un-flagged step is `text`.** A step that has not said what it is is a step
with prose in a panel and a polygon on a plate, and on a 390 px screen the prose is the thing that
cannot be read at 128 px while the polygon is perfectly legible at 44. The map is one press away in
either direction; the sentence is not.

**A gate declares nothing and is not a beat.** Five of the twenty-five steps are Complication Gates,
which render `.qz` straight into the sheet's body with no `.tr-panel` at all. `data-tour-fit` is
published by tours only while a step is mounted and running, so **its presence is itself the answer
to "is there a lesson step on screen"**, and that is why the shell asks for it before it asks what
is in the rail. Measured at 390×844 on step 14 before it did: the gate was 358×527 in a 242 px
scrolling body — 2.2 screenfuls of a gate, with its own answer buttons below the fold. It is 515 in
a 562 px body now, question, four answers, Commit, Skip and the note, all on one screen.

### 11.3 The table — per breakpoint, and testable

Reading mode exists in the **sheet band** only (`#app[data-rail="sheet"]`): 390×844 and 768×1024.
At 900×700 and in the float band the rail is a side column, the beat panel is already a full-height
grid item measuring **92–93 %** of the window, and there is nothing to take — measured at 900×700 on
step 18, `.app__sheet` 304×652 with a readable window of 546. `read.js` asserts that reading mode
does **not** turn on there.

| | **390×844** `data-read="off"` | **390×844** `data-read="on"` | **768×1024** `off` | **768×1024** `on` | **900×700** and up |
|---|---|---|---|---|---|
| masthead `--bar-h` | 46 | 46 | 48 | 48 | unchanged |
| lede band | 94–116 | 94–116 | 110 | 110 | unchanged |
| **the drawn plate** | **208** | **44** (`--read-peek-h`) | 350–371 | **44** | unchanged |
| control dock `--dock-h` | 0 (no dial at < 40 rem) | 0 | 36 at `dockfoot="on"` | **36 — it keeps it** | unchanged |
| colour ribbon `--key-h` | 32 | **0** | 32 | **0** | unchanged |
| **the beat panel** | 280 (B8's floor) | **594 = 70.4 %** | 280 | **758 = 74.0 %** | unchanged |
| **the readable window, a beat** | 128 | **≥ 400; 458 measured** | 128 | **≥ 520; 621 measured** | 546 at 900×700 |
| **the readable window, THE CLOSE** | **242** | **503** | **242** | **667** | not applicable |
| **the readable window, a recall card** | **242** | **570–578** | 242 | 741 | not applicable |
| time control `--time-h` | 184 | **52** (`--read-time-h`) | 184 | **52** | unchanged |
| time control, **round 3** (§11.10) | **52 on a map beat too** | 52 | **52** | 52 | unchanged |
| **and 184 on a `time` beat**, whose evidence is the four lanes | 184 | 184 | 184 | 184 | unchanged |
| scroll regions above the prose | 3 | **1** | 3 | **1** | unchanged |
| **the control that leaves reading mode** | tours' `Map`, when the surface has one | **exactly one, always** — tours' `Map`, else the shell's `MAP` in the sheet's head; plus the peek strip | same | same | not applicable |
| **the panel stacked behind the sheet** | 26 tab stops | **`inert`, 0 tab stops** | 26 | **`inert`, 0** | **`inert`, 0** |
| **the window's height** | any | **a whole number of line boxes** (`--read-trim`) | any | **a whole number** | unchanged |
| `dock.js` **D4** | ≥ 360×176 | full width × 40–72 | ≥ 700×220 | full width × 40–72 | unchanged |
| `dock.js` **D3** ribbon rect | non-zero | **`0 0 0 0`** | non-zero | **`0 0 0 0`** | unchanged |
| `budget-working.js` **W6/W7** | unchanged | the peek strip instead | unchanged | the peek strip instead | unchanged |

**The arithmetic, at 390×844, and there is no fourth place for a pixel to come from:**

```
                    data-read="off"        data-read="on"
bar                       46                     46
lede                     116                    116   <- the beat's own opening sentence
MAP                      208                     44   <- a peek strip; tap it and the band is back
ribbon                    32                      0   <- it returns with the map it keys
panel                    280                    594   <- 33.2 %  ->  70.4 %
time                     184                     52   <- the year, the spine's reading, the axis
                        ----                   ----
                         844                    844
```

**AND THE LEDE BAND FOUND 24 PIXELS IN ROUND 2, WHICH IS ALL THERE WAS LEFT IN IT.** The band
was 132 for 99 px of content: `base.css` §91 gives every button a 1 rem top margin so a control
after a paragraph is not welded to it, and in the sheet band the focal control is a **grid area
on the band's first row**, not a block in a flow — the margin was adding 16 px to the row's own
height (the same defect LAYOUT_BUDGET **W8** records for `.cl-bar`, at the same cost). The
band's own 8 px of vertical air is 4 while reading. Both are shell pixels and both land in the
window underneath. **The 16 also goes to the plate on a beat whose work is the map: 192 → 208,
and on the cold plate the stage grows by the same 16.**

**Every pixel reading mode finds comes out of a SHELL ROW.** Not one comes out of the beat's prose,
out of the lede that carries its opening sentence, or out of B8's 280 px floor under the panel.

### 11.4 Nothing disappears, and one press brings it back

The state collapses three things and each of them keeps a presence a student can act on. **It is one
state, not three independent collapses**, so one press restores all of it.

* **The plate → a 44 px peek strip.** 44 because the strip IS the control (WCAG 2.2 SC 2.5.5), and
  the whole width of it is the target: `.map__peek`, a transparent button rendered by P02 as a child
  of `.stage__map`, focusable, reached by Tab in 8 presses at 390×844, and topmost at its own centre
  at every beat — which cost a rule of its own, because `.stage__over` is a **sibling** of the plate
  at `z-index: 10` and `layers.css` puts `pointer-events: all` back on `.ly-hit`, so the beat's own
  event marks were the topmost thing on the strip. In reading mode the layers still PAINT and take
  no pointer. The strip's word is fed to the map's label engine as an obstacle, because before it
  was, the one name on a 44 px strip read `Assa`.
* **The colour ribbon → nothing, and that is the honest answer.** A key to eight colours over 44 px
  of coastline is a key to nothing. It comes back in the same press. `dock.js` D3 is amended to
  require `0 0 0 0` in this state rather than a rectangle.
* **The time control → a 52 px year line**: the year, **the spine's reading** (`I II III` at 1820,
  `III Imperial` at 1919, in the lanes' own colours, from the same `activePhases()` the band lights
  from), and the axis, which is still the scrubber and still keyboard-reachable. 52 and not 44
  because the axis is 30 px tall with its decade labels and at 768 those labels printed 10 px below
  the bottom edge of the window in a 44 px row — LAYOUT_BUDGET B3: being clipped is being over
  budget.
* **The definition dial keeps its 36 px dock wherever it is rendered.** It is the one thing on this
  list that does NOT stand down. Measured at 768×1024 with `--dock-h` forced to 0 in this state, all
  four segments hit-tested as BLOCKED and `shell-accept.js` rule Q4 failed: the four definitions of
  *British* are the best single idea in this application and round 3 already lost two of them once.
  At 390 the dial is not on the plate at all (§5), so a phone pays nothing for it.

**The one control is `Map`, in the beat panel's own foot, beside Next** — tours renders it, owns
its `aria-pressed`, owns the announcement, and forgets a student's override the moment the step
changes. The peek strip is the second route to that same control, not a second toggle:
`ask:read` presses it.

**AND WHEN THE SURFACE HAS NO FOOT, THE SHELL RENDERS ONE, IN THE SHEET'S OWN HEAD.** Round 2
measured the class this closes: the two recall cards and the Close render no `.tr-panel__foot`
at all, so on those screens the app's only reading toggle did not exist. A student who reached
the Close, or who pressed `OPEN THE MAP` on a recall card, had no way back to the text but Back
or Next. **A mode with an entrance and no exit is worse than no mode**, and the exit cannot be
another module's to render — that is what made this a class rather than an instance.

So `.cx-sheet__fit` is the shell's, it lives in `.cx-sheet__head`, which is the one piece of
sheet furniture the shell draws for *every* surface, and it is shown **only when
`.app__sheet .tr-panel__fit` does not exist**, so the interface never carries two controls for
one state. It is scoped to the open sheet on purpose: a beat panel left mounted in the rail
behind an open Close still carries its own `Map`, inert and invisible, and counting it hid the
only control the surface on screen had. Its label is the state it moves to (`MAP` while
reading, `READ` while the map is open), its `aria-label` opens with that same word (WCAG 2.5.3),
and pressing it emits the same `ask:read` the peek strip does.

`read.js` **R13** asserts the count is exactly one, on every step and on the Close, at 390×844
and 768×1024.

### 11.5 No scroller inside a scroller

Measured at 390×844 on step 18 before this pass: `.tr-panel__scroll` (128/2,154) inside
`.sheet__body` (`overflow: hidden auto`) inside `.app__dossier` (`overflow: hidden auto`) — **three
touch scroll regions stacked inside one panel**, and a thumb flick landed in whichever of the three
the 30 px band under it belonged to. Only the innermost had anything to scroll, so the outer two
were pure hazard.

In reading mode the rail's containers clip and **the step's own window is the only scroll region**:

* `.sheet__body` clips, always.
* `.cx-sheet__body` clips **only when it contains a `.tr-panel`** — a gate has no scroller of its own
  and the body IS its one scroller; clipping it would cut the gate's answer buttons off.
* `.app__dossier` clips **only when it contains the beat** (`:has(.tr-panel)`). The dossier stacked
  behind an open sheet is not an ancestor of anything the thumb can reach, and it holds 2,110 px of
  its own reading that must still scroll the moment the sheet closes.

The rule is stated as a number a critic can take: **the count of scrolling ancestors of the
step's reading window is 0** (`read.js` R4).

**AND THE READING WINDOW IS THE SCROLLER THE PROSE IS ACTUALLY IN, wherever the piece that
renders the surface put it.** Round 2 measured what a rule written against `.cx-sheet__body`
cannot see: with the Close open at 390×844 that element reported **511 holding 511** and looked
settled, while `.cl-close__scroll` inside it held **6,332** — one scroller inside another, the
outer one with nothing in it to move, and every rule in this file passing. Three surfaces put
the window in three places (a beat in `.tr-panel__scroll`, the Close in `.cl-close__scroll`, a
recall card and a gate in the body itself), so both the shell and `read.js` resolve it the same
way, in this order: **`[data-read-window]`, then the two known selectors, then the deepest
descendant that scrolls and has something to scroll, then the body.** `data-read-window` is the
published contract; a piece that names its own window is found by both.

### 11.5A THE EDGES — no line of prose is cut through its x-height

Round 2, measured at 390×844 on `#tour=core&step=9`: "What kind of thing is it?" clipped at the
top of the window and "What can it NOT tell you?" at the bottom; on first paint of the same
beat, "on the 1914 map took twenty years of treaties" clipped at the bottom. A window that
shows fourteen lines and two halves shows fourteen lines and two pieces of litter, and a mask
over each edge fades the litter rather than removing it.

**Two moves, and they are the same move at the two edges.**

* **`--read-trim` — the window is a whole number of lines.** The shell measures where the
  window's bottom edge falls in the live layout, and gives back the visible fragment of the
  line the edge lands inside: the panel is that much shorter and the edge falls where a line
  ends. It is measured **from zero, never from the last answer** (an increment is an
  accumulator: it read 2 px on the Amritsar beat, carried it forward, and stood at 55 px three
  surfaces later, the window shrinking under a thumb that was already reading), it is taken at
  the top of the scroll and held for the surface (a window that resized itself mid-flick would
  be worse than the defect), it is re-checked once ~450 ms later because a beat's own blocks
  finish laying out over several frames and none of that changes the window's `clientHeight`,
  and it is capped at 32 px.
* **The top edge lands on a line boundary after a scroll settles.** A flick leaves `scrollTop`
  anywhere. 160 ms after the last scroll event the shell reads the line boxes out of the live
  layout — a `Range` over the window's own contents returns one rectangle per line box, so
  **mixed leading is handled by construction**, which a `line-height` token cannot do in a
  panel that sets caps, prose, testimony and captions at four different leadings — and moves
  `scrollTop` by the smallest offset that leaves the worse of the two edges cleanest. It is a
  correction, not a movement, so it is instant in both motion settings, and it never fires at
  either end of the scroll, where the edges are flush by construction.

**Two things are deliberately NOT done.** A cut inside a line's DESCENDER band is not a cut
through its x-height and reads perfectly, so no trim is spent on one (the test is a quarter of
the line's own height). And a straddling block taller than 40 px is a figure, a ring diagram or
a row of answer buttons, not a line: shrinking the window by its height would cost most of a
screenful to hide something the student can see the top of and scroll to.

`read.js` **R14** asserts it as the number the complaint was made in: **how deep into a line box
each edge falls, ≤ 7 px at both**, on every textual step and on the Close, at 390×844 and
768×1024, in light, dark and reduced motion.

### 11.5B WHEN ANOTHER PIECE PUTS A BLOCK IN THE BEAT'S BODY — round 3, and the one MATERIAL defect of that round

§11.5 clips `.cx-sheet__body` on the premise that *the surface in it brings its own scroller*. The
premise is true of every surface §11.5 names and it stops being true the moment **another piece
appends a block of its own beside the beat panel**. `viz/index.js` does exactly that: `.viz-onpath`
— the counted figure that carries **T3, T8 and T14** onto the default route — is appended as a
SIBLING of `.tr-panel` inside the body, outside `.tr-panel__scroll`.

Measured at **390×844** on `#tour=core` step 3, the Barbados beat, on the build round 3 reviewed:

| | before | after |
|---|---|---|
| `.cx-sheet__body` | `overflow-y: hidden`, **1,256 px in 578** | `overflow-y: auto`, 1,256 in 578 |
| `.tr-panel__scroll` | 908 in 481, ends at "The full record for Barbados" | unchanged |
| `.viz-onpath` | 358×658 at y = **764** | 358×658, scrolls to y = 86 |
| its `Commit this guess` | y = **1,388**, in an 844 px window, **no scrollable ancestor** | **y = 710, in view, topmost at its own centre** |
| eight wheel events over the sheet | scrollTop **0 → 0** | scrolls |
| `MORE OF THIS BEAT ↓` pressed to exhaustion | reveals nothing below the prose | unchanged; the body carries the rest |
| the aux jump, `.tr-bar__auxb` "Count it ↓" | `display: none`, 0×0 | **71×18 in the sheet's own head** |
| the masthead's `.viz-entry` | `display: none` | unchanged — it is the apparatus route, not this one |

**The default route lost T3 — the scale of the slave trade, the item the wave was commissioned to
restore — on the one device most students use, and only there:** at 844×390, 900×700, 1366×768 and
1440×900 this body is a scroller and always was.

**Two things were wrong and the second is the one that lasts.**

* **The clip had no exception, and `tours.css` §THE GUARD had already written the right one** for
  its own flex arrangement, in as many words: *"anything else and the body goes back to being a
  scroller, which is the honest answer when there is more in it than can be shown."* The rule in
  `layout.css` was written later and at higher specificity and was quietly overruling it. It now
  says the same thing: **the body clips only while every child in it is a surface of the lesson
  that manages its own height** — `.tr-panel`, `.tr-gate`, `.tr-dispute`, `.cl-close`, `.cl-blk`
  and anything carrying `[data-read-window]`. It is an allow-list of that sentence, not a list of
  exceptions, so the next piece that appends a block is caught by construction rather than by
  another round. `tours.css` §THE FOOT CLEARS THE SPINE had already reserved 2.75 rem at the panel's
  end **for this exact state**, which is the strongest evidence that the state was intended and the
  clip was the accident.
* **The one control that jumps to the figure had no home in the docked band.** `tours:aux` is the
  published slot for it and the bar cannot hold it anywhere below 62 rem: at 390 `tours.css` stands
  it down (mark 28 + Layers 97 + the transport's box 220 + Tools 68 = 413 of 390, and it rendered
  "One mo"); at **768×1024** it is drawn at x 665–736, outside the 144 px box that ends at 672, with
  `Tools` at 684–752 — **its own centre hit-tests to `.bar__more-w`**; at **900×700** the same, aux
  797–868 against Tools at 816–884, where it renders as the single letter **"C"**. That is §12.1's
  defect, deferred at those two windows, arriving on the one control that carries a must-stick item.

**So the shell adopts the node into the sheet's own head, across the whole docked band**
(`chrome/index.js _syncPathJump`), the way `_syncStepDock` adopts the transport: the same element,
tours' listeners, viz's payload, put back the moment the figure, the band or the lesson changes. It
is **scoped to the figure** — `tours:aux` is shared, and the teacher desk's "Move 3 · Comparing two
extracts" does not belong in a 324 px head. The head can take it because at this width it has
already shed its eyebrow, and `min-inline-size: 0` on the head is the rule without which none of it
holds: the head is a **grid item** of `.cx-sheet`, so its automatic minimum size is its min-content
width and it measured **450 in a 390 px window** with the close button at x = 406, outside the sheet.

| | 390×844 | 768×1024 | 900×700 | 844×390 |
|---|---|---|---|---|
| the chip | 71×18 in the head | 71 | 71 | 71 |
| the head, Barbados | **37** | 37 | **47** | **47** |
| the head, the revenue loop | **47** | 37 | 47 | 47 |
| the title | whole | whole | whole, on two lines | whole, on two lines |
| the head's trailing edge | 374 of 390 | 752 of 768 | 884 of 900 | 828 of 844 |

`tours.css` §17 clamps that title to ONE line, which is right for a head with nothing else in it and
wrong for one with a chip: at 900×700, where the rail is a 303 px column, "Three islands, three
crops" clamped to **"Three islands, thre…"** — LAYOUT_BUDGET §4's word cut mid-word, in the one
place a student learns which beat they are on. The clamp is lifted to two lines **for exactly the
head that carries a chip**, so the head grows by 10 px (37 → 47) wherever the title needs it and nothing is lost.

**`budget-working.js` W18** asserts the consequence, at every viewport in the table: **every
ON_PATH figure's commit control is in the window already or inside something that scrolls to it,
and is the topmost thing at its own centre once it is there.** A viewport where no figure is
mounted asserts nothing, which is honest — whether a figure belongs on a step is the path's
business, not the budget's.

### 11.5C THE SIXTEEN PIXELS UNDER THE SPINE — round 8, the phone

`position: sticky` resolves against its **containing block**, which for a child of `.cx-sheet__body`
is that body's **content box**. The scrollport a student looks through is the body's **padding box**.
The two differ by `padding-block-end`, so a spine pinned to `inset-block-end: 0` inside a padded
scroller comes to rest **one padding above the visible edge**, and whatever is behind it keeps
painting through the gap.

This was already known twice and stated twice — once for `max-height: 460px` (`chrome.css`
§THE SIXTEEN PIXELS UNDER THE SPINE) and once for `#app[data-read="on"]` (§11.6's table gives the
padding to the reading) — and the arithmetic knows about neither breakpoint.

**Measured, cold-loading `#tour=thirty&step=20` at 390×844** — the exits beat, `data-read="off"`,
`work="map"`, so neither existing copy of the rule applied, and the body is a scroller because
§11.5B hands it its overflow back the moment `viz/index.js` appends `.viz-onpath` beside the beat:

| | before | after |
|---|---|---|
| `.cx-sheet__body` | 390×371 at y 418–789, holding 1,118 | 390×**374** at y 418–**792**, holding 1,124 |
| `.cl-blk`, sticky, opaque, `inset-block-end: 0` | rests at **740–773** — 16 px short of the edge | rests at **759–792**, flush |
| `.viz-onpath__h` | **779–829: ten pixels of a 50 px heading** — "1947 is the date everyone gives" — printed below the through-line and above the year line, with no fade and nothing to say what it was | 798–848, wholly below the edge |
| the reading window | 258 | **277** — two more lines, and nothing paid for them |

**The rule.** `#app .cx-sheet__body:has(> .cl-blk) { padding-block-end: 0; }`, stated once about the
geometry instead of twice about two breakpoints. Nothing moves where the body clips: a clipped body
has no scrollport for sticky to resolve against and the block already overflows into the padding.
`read.js` **R20** asserts it, and asserts it on a cold load with storage cleared, because the walked
session reaches step 20 with a checkpoint card over the beat and the body never becomes a scrollport.

### 11.15 THE FLOORS ARE A FUNCTION OF THE WINDOW — round 8, the rubric

> "at 360×740 read.js reports 5 of 102 broken — step 1 R17 readable 157 px against a floor of 200,
> steps 4 and 18 at 337 against 340, R11 at 145 and the return at 333."

Reproduced exactly. **Every one of the five was a DEFAULT floor** — `READ_MIN`'s 340 and
`READ_FLOOR_ANY`'s 200, the two numbers `read.js` falls back to at a window it has no row for — and
both of those were measured in an 844 px window. The layout was not failing; the harness was asking
a 740 px phone for a share of a phone somebody else was holding. (`budget.js` had the same defect in
a sharper form: its fallback row was **1366×768**, so a 360 px phone was asked for a 1000×420 map.)

**The derivation.** In the sheet band every row that is not the plate and not the reading window is a
**fixed number of pixels**, set by touch targets and by type and by nothing about the window:

```
data-read="on"    bar 46 + lede 108 + peek 44 + year line 52
                  + sheet border 1 + head 37 + beat foot 53
                  + gap 12 + through-line 33 + body pad 16          = 402
work="map"        bar 46 + lede 116 + plate 176 (D4's floor) + ribbon 32
                  + year line 52 + 1 + 37 + 53 + 12 + 33 + 16       = 574
```

plus `--read-trim`, at most one line box. So the reading window is `viewport height − K`, and so is
the floor under it:

| | expression | 390×844 | 360×740 |
|---|---|---|---|
| `READ_MIN` (a textual beat, reading mode) | `vh − 444` | **400** | **300** |
| `READ_FLOOR_ANY` / `--read-any-min` (any step, any work) | `min(240, vh − 604)` | **240** | **136** |

The 844 column is **not a new claim**: 400 and 240 are the numbers this file and `read.js` have
asserted since round 3, and they fall straight out of the arithmetic. What changes is that a window
off the table is now measured against **its own** height. `layout.css` states the same expression
for the token — `--read-any-min: max(7.5rem, min(15rem, calc(100dvh − 37.75rem)))`, registered with
`@property` so `getComputedStyle` resolves it to px for `chrome/index.js _cssLen` — so the shell and
the harness still cannot hold different numbers.

**One is capped and the other is not, and that is the two states behaving differently rather than a
fudge.** In reading mode the PANEL takes what is left, so every extra pixel of window reaches the
prose and `READ_MIN` rises with it (measured at 412×915: 529). On a map-work beat the PLATE takes
what is left and the panel sits on B8's 280 px floor, so the reading is a **constant** and the extra
pixels go to the map — which is right, because there the plate is the subject (§11.10). Measured:
**254** at 390×844, **255** at 393×873, **255** at 412×915. `--read-any-min` is the floor the plate
gives up to, never a share it must hand over.

**WHAT 136 COSTS, SAID OUT LOUD.** It is thin, and it is thin because a 740 px window has 104 fewer
pixels than the one §11 was written for while the band's rows are constants. The shell already
spends every pixel it has: measured at 360×740 on step 1, the poster, `chrome/index.js` drops the
plate to hold `--read-any-min` and the plate **stops at D4's 176**, because below that a world map is
not a map. The only route to a 200 px window there is to take D4's band on the one beat whose subject
IS the plate — a readable paragraph bought with an unreadable map, on the step that asks a student to
count colours on a map. §11.10 already decided that: **the subject keeps its size.** The remedy, if a
later round wants more, is a shorter poster card (P05's), not a shorter map (the shell's).

**360×740, in the form §11.3's table states the other two windows:**

| | `data-read="off"`, `work="map"` | `data-read="on"` |
|---|---|---|
| masthead / lede | 46 / 116 | 46 / 108 |
| the drawn plate | **176** — D4's floor, and it binds here | **44** |
| colour ribbon | 32 | 0 |
| the beat panel | 318 | **490 = 66.2 %** |
| the readable window | **157** (floor 136) | **337** (floor 300) |
| time control | 52 | 52 |
| the Close | — | **399** holding 9,585 |
| `read.js` | **113 of 113** | |

**AND THE FLOOR IS NOW ASSERTED AGAINST THE BOX THAT WAS DRAWN, NOT AGAINST THE PREDICTION THAT
SIZED IT — wave 10, round 2, the rubric and the classroom, at 768×1024.**

`read.js` R17 broke twice at that window and only when the route was WALKED, never when the address
was pasted:

```
lesson-two step 9   317 px of reading against a floor of 320   (cold: 320)
thirty     step 1   319 px                                     (cold: 320)
```

Two stable fixed points of one arithmetic, reached from two different previous surfaces, which is the
shape §11 has now paid for three times. The cause: `chrome/index.js` sizes the plate on a map-work
beat from `_panelOffset()`, and that is a **prediction** — the furniture between the panel's edge and
the prose, measured as a side effect of the same pass that has already used it, and starting from a
160 px fallback on a surface it has not seen. So the plate was sized from the offset belonging to the
surface the student had just left, by 1 to 3 pixels.

> **The reading floor is checked on the scroller the prose is in, one frame after the layout is
> written, and the shortfall is reserved against the plate.**

`_guardReadFloor` does it. The reserve only grows within a surface and resets with the surface, so it
cannot oscillate; it waits up to three frames while the prediction is still moving, because
reserving against an offset that is about to be corrected pays for the same pixels twice (measured:
the plate went 306 → 277 to buy one pixel of reading); it gives up the moment the plate is standing
on D4's own floor, because a map under 220 is not a map; it is bounded at 64 px; and it tells the
line grid to fit again, because the four passes `_syncLineGrid` had already spent were spent on a
window that no longer exists (measured, without that: R14 read the bottom edge 11.2 px into a line
box on `lesson-two step 9`). **Achieved at 768×1024, walking every published route: 320, 320, 334,
338, 320, 338 — 433 of 433.**

### 11.6 THE DEBT, WITH ITS OWNERS

Of the 594 px reading mode hands the beat at 390×844, **98 belong to two other pieces and 37 to
the shell's own furniture**, and none of the four can be taken:

| | px | owner | what it is | can it be taken? |
|---|---|---|---|---|
| `.cx-sheet__head` | **37** | the shell | the surface's title, the way out, and — on a surface tours has no foot on — the reading toggle | **no.** §11.6 previously recorded this as 31 "already tightened from 37". **That was wrong and this round measured it**: the head's height is set by its 28 px buttons, not by its 19 px title, and 28 is the smallest a target may be here. The vertical padding is already 4. |
| `.tr-panel__foot` | 53 | **P05 tours** | `more of this beat` · `Map` · `Next` | not the shell's |
| the gap above the spine | 12 | **P05 tours** | | not the shell's |
| `.cl-blk` | 33 | **P21 the Close** | the through-line the student is assembling | not the shell's |

**THE CEILING, STATED, SO THE NEXT ROUND DOES NOT RE-LITIGATE IT.** At 390×844 the band is fully
allocated and there is no fourth place for a pixel to come from:

```
bar    46  a masthead that carries the transport
lede  116  the beat's own opening sentence, its date and its focal control
peek   44  WCAG 2.2 SC 2.5.5 — the strip IS the control, and it may not be smaller
head   37  set by a 28px target, not by a 19px title
FOOT   53  P05                                     |
gap    12  P05                                     |  98px, and not the shell's to spend
blk    33  P21                                     |
time   52  the year, the spine's reading, the axis — 30 of the 52 are the axis's decade labels
      ---
      393   of 844.  THE READING GETS THE OTHER 451, and it measured 458.
```

The only ways past 458 delete something a student needs: the beat's opening sentence, the way of
knowing where they are, the way of knowing when they are, or a touch target. **The remaining
distance to "two screens" is the beat's own 2,154–2,616 px of content, and that is P05's.** The
Amritsar beat is 4.7–5.7 screenfuls because it carries two full testimonies and a sorting task,
not because the window is small.

Two further debts, both measured and neither this pass's to pay:

* **`--lede-h` is `auto` in the sheet band, and a third line costs the plate 22 px.** Step 1's
  opening sentence wraps to two lines and the map is 390×192; step 18's wraps to three and the map is
  390×170 — in map mode, with or without this pass. LAYOUT_BUDGET's own words are that "a band that
  grows to fit its sentence takes the map's pixels to do it". `read.js` R11 therefore asserts the
  band comes back to ≥ 160 and to at least three times the peek, not to D4's 176.
* **A beat whose work IS the map still reads through 128 px.** That is B8's floor doing exactly what
  it was written to do, and it is the student's own choice — they pressed `Map`. But a beat that is
  both (`fitAfter` in `tours.json`: the plate is the question, the panel is the answer) will meet it,
  and `.cx-sheet__body` still nests a second scroller in that state (measured at 390×844 on step 20:
  242/988 inside the panel's own 129/533). P05 owns both.
* **AND BEAT 1 IS THAT DEBT ON THE FIRST SCREEN OF THE LESSON.** Measured at 390×844 on
  `#tour=core&step=1`, before the guess is committed: the "route you are on" card is **1,096 px in
  a 128 px window — 8.6 screenfuls**, because the poster declares `fit: map` and hands the reading
  over only on `fitAfter`. The reading is one press away (`Map`, in the panel's own foot, which
  this beat does render), and after this round that press is guaranteed to exist on every surface
  — but a student who wants to read what the core route leaves out *before* choosing still reads
  it four lines at a time. The declaration is P05's; what the shell can promise, and now does, is
  that the control to change it is always there.
* **The fade over each edge is the surface's own.** `--read-trim` puts the window's edges between
  lines; the gradient tours and the Close draw over the last line is theirs, and it is right —
  it is how a scroller says there is more. What it may not do is fade a line the student has no
  way to finish, and R14 is the number that keeps those two apart.

### 11.7 The rules, in the form `read.js` asserts them

```
node tools/inspect.js tools/scenarios/read.js --out /tmp/r390  --mobile
node tools/inspect.js tools/scenarios/read.js --out /tmp/r360  --w 360  --h 740   <- §11.15
node tools/inspect.js tools/scenarios/read.js --out /tmp/r768  --w 768  --h 1024
node tools/inspect.js tools/scenarios/read.js --out /tmp/r900  --w 900  --h 700
node tools/inspect.js tools/scenarios/read.js --out /tmp/r1366 --w 1366 --h 768
```

It walks steps **1, 2, 4, 14, 18, 20 in one session, then opens the Close, then clears storage and cold-loads step 20** (R20, §11.5C) — two textual beats, a Complication Gate, and two
beats whose work is the plate — because a gate reached by walking the path is a different mount from
a gate reached by pasting its address, and the first version of the shell's resolver could see one
and not the other. It prints `>>> the reading law holds` / `>>> READING LAW BROKEN`.

| rule | assertion |
|---|---|
| **R1** | **The readable window is ≥ 400 px at 390×844, ≥ 300 px at 360×740 and ≥ 520 px at 768×1024** (§11.15: below 40 rem the floor is `viewport height − 444`), inside a mounted step whose work is textual. This is the rule the whole section exists for and the one no other harness can make. *(Achieved: 434 and 598–606. Before: 128 and 128.)* |
| **R2** | The beat panel is **≥ 60 %** of the window — B1's sentence, said about the panel, because on a textual beat the panel is the subject of the page. *(Achieved: 67.5 % and 72.5 %. Before: 33.2 % and 27.3 %.)* |
| **R3** | The plate is a peek strip: the full width of the window, 40–72 px tall; and the strip is a **reachable control** — a focusable button, ≥ 44 px, and the topmost element at its own centre. |
| **R4** | **Zero scrolling ancestors** of the step's reading window. |
| **R5** | The year line is 28–60 px and carries the year, the axis and the spine's reading, all three rendered. |
| **R6** | The colour ribbon is not rendered while it would be keying a 44 px map. |
| **R7** | No document scroll, at either setting (LAYOUT_BUDGET B4). |
| **R8** | Nothing is clipped by the rows this mode resized — nothing in the masthead, the lede band or the time control is drawn outside the region that owns it. |
| **R9** | A beat whose work is the map keeps D4's band and its colour ribbon, unchanged. |
| **R10** | `#app[data-read]` is always published, and `#app[data-beatwork]` agrees with **the declaration that governs the surface on screen** — the beat's `<html data-tour-fit>` while a beat is mounted; the surface's own `ask:sheet` `work` when it is a gate, a checkpoint or recall card, or the Close, which §11.1 gives the same band (plate 44, ribbon 0, time 52) and which this rule therefore holds to `text` or `time` with the plate actually stood down. *(Round 7 corrected the rule, not the app — see §11.14.)* |
| **R11** | **One press, both ways.** Pressing the peek strip turns reading mode off and brings the map, the ribbon and the time control back together; pressing `Map` returns to the reading with the window back over R1's floor. |
| **R0** | At 900×700 and above, reading mode is **off** — the defect it answers is not there, so neither is the mode. |
| **R12** | **THE CLOSE READS LIKE A BEAT.** With the Close open in the sheet band: `data-read` is `on`, the readable window is over R1's floor, the plate is a peek strip, the year line is 28–60, there is exactly one control that leaves reading mode, the count of scrolling ancestors is 0, the covered panel is inert and the document does not scroll. *(Achieved: 503 holding 7,152 at 390×844, 667 holding 4,813 at 768×1024. Before: 242 holding 6,342–7,071.)* |
| **R13** | **EVERY SURFACE THAT CAN ENTER READING MODE CARRIES THE CONTROL THAT LEAVES IT — exactly one, in the panel.** Either tours' `Map` or the shell's `MAP`, never both and never neither; and while reading mode is on, the peek strip is rendered as the second route. *(Before: the two recall cards and the Close carried none.)* |
| **R14** | **NO LINE OF PROSE IS CUT THROUGH ITS X-HEIGHT AT EITHER EDGE.** How deep into a line box the window's top and bottom edges fall, measured off the live layout, is ≤ 7 px at both, on every textual step and on the Close. *(Before: 10–17 px, and a mask fading the cut.)* |
| **R15** | **THE PANEL STACKED BEHIND THE OPEN SHEET IS `inert` AND `aria-hidden`**, whenever it is rendered at all. *(Achieved: 0 tab stops behind the sheet at 390×844 and at 1366×768. Before: 26 at both, and eighteen presses of Tab from a mounted beat walked them instead of reaching the transport.)* |
| **R16** | **ONE PRESS, BOTH WAYS, ON THE CLOSE TOO.** The shell's own control opens the map from the Close and returns the reading over R1's floor, exactly as `Map` does from a beat. |
| **R17** | **THE FLOOR UNDER EVERY STEP, WHATEVER ITS WORK — round 3.** The readable window is ≥ `--read-any-min` (240 at 390×844, 136 at 360×740, 320 at 768×1024; §11.15: below 40 rem it is `min(240, viewport height − 604)`) on every mounted step in the sheet band, INCLUDING the beats that keep the plate. R1 and R2 live inside the `read="on"` branch, so the three beats that keep the plate — the first, the second and the tenth stop of the default route — were measured by no rule at all. *(Achieved: 254, 347, 258 at 390×844; 320, 511, 320 at 768×1024. Before: 128, 128, 129.)* |
| **R18** | **AND THE EDGES ARE ASSERTED IN EVERY MODE.** R14 ran only while `data-read` was `on`, and the rubric critic's cut — 9.3 px into a line box — was on the spine beat, whose `data-read` was `off`. *(Before: 9.3 on the spine, 6.8 on the poster, with no rule looking.)* |
| **R20** | **THE THROUGH-LINE SPINE RESTS ON THE SCROLLPORT'S EDGE, AND NOTHING PAINTS UNDER IT** — §11.5C. Asserted on a cold load of `#tour=thirty&step=20` with storage cleared, which is the only state in which `.cx-sheet__body` is a scrollport at all. *(Before: a 16 px gap with `.viz-onpath__h` printing through it.)* |
| **R19** | **EXACTLY ONE CLAIMANT IS THE SUBJECT.** On a `time` beat the whole time control is on screen and its four lanes are drawn, and the plate is a peek strip; on every other mounted step the time control is the 28–60 px year line. This is the rule that stops the `map` state holding both apparatus rows at full size over a panel on its floor. |

`dock.js` D3 and D4, and `budget-working.js` W6 and W7, carry the amendment with the measurement
that motivates it, in their own files. All four still hold at every viewport in §0's list, in light,
dark and reduced motion, with zero console errors and zero failed requests.

### 11.8 What each piece must change

**P05 — tours.** Nothing is required and one thing is asked for. `<html data-tour-fit>` is now the
published contract and this file reads it; keep publishing it, keep `Map` where it is, and **state a
`"fit"` on every beat in `tours.json` with the reason beside it**, so that the fallback table in
§11.2 is a backstop and not the answer. `tours.css`'s own `--rail-top-min` override is gone, and it
should stay gone: the shell writes that property as an inline `!important` now, which is
LAYOUT_BUDGET B9 enforced rather than trusted. The 65 px of `.tr-panel__foot` and its gap are the
largest single block the shell cannot reach (§11.6).

**P21 — the Close.** `.cl-blk` is 33 px of the reading window on every textual beat. It is the right
place for it (§7) and it is worth its 33; it is named here so the arithmetic is complete.

**And the Close is now a reading surface itself.** Nothing is required of it: the shell resolves
`close` and `close:ledger` from the surface table (§11.2), sizes the band, renders the control
that leaves reading mode in the sheet's head because the Close renders no `.tr-panel__foot`, and
finds `.cl-close__scroll` as the reading window by name. Two things are asked for. **Put
`data-read-window` on `.cl-close__scroll`**, so the shell and `read.js` find it by contract
rather than by selector. And the **signature textarea is a fixed three-line box that clips the
student's own sentence with no scroll affordance** — measured at 390×844, `clientHeight` 68 and
`scrollHeight` 68 over a sentence cut at "…became a company that taxed Bengal and used the". You
cannot read back what you are about to sign. That is P21's, and the room for it now exists: the
panel is 594 px rather than 280.

**P04 — the dossier, and every piece that opens a rail surface.** The panel stacked behind an
open sheet is `inert` and `aria-hidden` while it is covered, and released the moment the sheet
closes (§11.9). A piece that moves focus into the rail must not do so while the sheet is open;
the shell moves the caret out before it sets the attribute, but it cannot put back a focus a
module takes afterwards.

**P17 — the legend.** Both copies of the ribbon are hidden from `layout.css` in this state, the way
chrome.css §E enforces everything else it cannot ask for. If the two copies ever become one, this
becomes one selector.

**P02 — the map.** `.map__peek` and its label are in this module and so is the obstacle rule that
keeps a name from being printed under the chip. The peek strip's camera is still the beat's own
`flyTo`; a beat that names a place gets a legible 44 px of it (measured on step 18: Punjab, outlined
and labelled). `.map.is-enlarged` is off in this state — there is no band to lift the plate out of.

---

### 11.9 THE PANEL UNDER THE SHEET IS NOT ON THE PAGE

LAYOUT_BUDGET **B7**: the dossier and the sheet occupy the same grid column and the same
`--rail-w`, and opening the sheet **stacks** it over the dossier rather than opening a second
column. The covered one stayed `display: block`, `visibility: visible`, with no `inert` and no
`aria-hidden`, and full of tab stops. Measured at 390×844 inside a mounted beat: `#dossier` and
`#sheet` at identical coordinates, z 20 against z 50, **26 tabbable controls in the covered
one**, and **eighteen presses of Tab from the beat never reached `.tr-bar__next`** — they walked
a panel nobody could see. Measured again at 1366×768: the same stacking, 26 against 22.

`inert` is the whole answer and it is one attribute: it removes the subtree from the tab order,
from hit testing and from the accessibility tree in one move, which is exactly what "this is
behind something" means. `aria-hidden="true"` rides with it for assistive technology that does
not yet honour `inert`.

**The test is structural, not geometric, and that is deliberate.** There is no state in this
application in which the sheet is open and the panel under it is partly readable — B7 says so,
and the two rectangles measure identical at 390×844 and at 1366×768. An overlap ratio was tried
first and it is a race: on the frame the sheet opens, the panel behind it has not been
re-clamped yet, the ratio read **0.27**, and because nothing resized afterwards to ask again the
covered panel stayed in the tab order for the life of the beat. **A fact that is true by layout
should not be re-derived from pixels that settle two frames later.**

It is released on `_closeSheet`, and the caret is moved out of the subtree before the attribute
goes on, or the browser drops focus to `<body>` and the next Tab starts from the top of the
document. After it: **tab 1 skip-to-map, 2 skip-to-timeline, 3 Layers, 4 Back, 5 Tools** at
390×844, and 0 tab stops behind the sheet. `read.js` **R15** asserts it.

### 11.10 THREE CLAIMANTS, ONE SUBJECT — round 3's amendment, and the one that kills the class

**`fit` answers "plate or panel". It has never answered "and the time control?", and in the `map`
state nothing did.** Reading mode had two states and the band has three claimants, so when a beat
declared `map` BOTH apparatus rows stood at full size and the panel sat on LAYOUT_BUDGET B8's 280 px
floor as if the floor were an allowance. Measured on the running app at **390×844** on the build
round 3 reviewed, cold-loaded into each address:

| the beat | declares | plate | ribbon | time | panel | **the reading** | screenfuls |
|---|---|---|---|---|---|---|---|
| `#tour=core&step=1` the poster | `fit: map` | 208 | 32 | **184** | 280 | **128 holding 681** | **5.3** |
| `#tour=core&step=2` the spine | `fit: map` | 208 | 32 | **184** | 280 | **128 holding 735** | **5.7** |
| `#tour=core&step=12` the exits | `fit: map` | 208 | 32 | **184** | 280 | **129 holding 533** | **4.1** |

The poster is **stop 1 of 15 on the default route**, and its own guess input — the prediction the
Close scores — sat 400 px below the fold of a 128 px window. The historian: "the panel edge cuts
'The poster map used one pink for' mid-sentence". The spine beat is worse than it looks: its own
sentence is *"the bands under the map overlap on purpose: in 1820 three engines are running at
once"*, its evidence is the four lanes in the time control, and its plate is a 1636 outline doing
nothing at all.

**THE AMENDMENT.** The band has three claimants — the PLATE, the PANEL and the TIME control — and
**exactly one of them is the subject of the page**. The other two stand down to a strip that is also
the control that restores them. Nothing disappears; one press brings the whole of it back.

| `#app[data-beatwork]` | what the subject is | plate | colour ribbon | time control | the panel gets |
|---|---|---|---|---|---|
| `text` | the prose in the panel | **44** peek strip | not rendered | **52** year line | the rest |
| `map` | the plate | **D4's band**, unchanged | rendered | **52** year line | the rest |
| `time` | the four lanes | **44** peek strip | not rendered | **its whole band** | the rest |

`data-read` still means exactly what it always meant — **the plate has stood down** — so it is `on`
for `text` and for `time`, and every rule already written against it is untouched. The new switch is
`#app[data-timeband="line"]`, and `app/css/timeline.css` keys the year line on that rather than on
`data-read`, because the question that block is asking has never been "has the plate stood down".

**Who says which.** `fit: "text" | "map" | "time"` in `tours.json`, published as `<html
data-tour-fit>`; or `work` in an `ask:sheet` payload; or, for a beat that has not said, the fallback
table in §11.2 with **`sweep` → `time`** added to it. A beat that declares `text` **and** whose kind
is a time kind resolves to `time`: the declaration is obeyed about the plate, which is all it
answers. The shell publishes the resolved answer as `#app[data-beatwork]`, and `read.js` **R10**
asserts the two never contradict each other about the plate.

**And the shell PRESSES tours' own control rather than writing tours' attribute**, on a mount where
the two disagree — the spine, and any map beat a student has already asked to read. One source of
truth, one announcement, made by the module that owns the words (§11.2). It fires at most once per
step, so a press made after it lands is the student's and stands.

**THE STICKY PREFERENCE.** Round 3, the phone: *"The MAP collapse preference does not persist
between beats: tap it on the poster, press Next, and the spine re-opens with 208 px of map and a
128 px slot."* It is remembered for the route now, in the sheet band only, and applied through the
same press. A student who says "I want to read" on a 390 px screen has said something about the
screen in their hand, not about one beat. Above 62 rem there is no trade to remember.

**THE ARITHMETIC, at 390×844, all three ways, and there is no fourth place for a pixel:**

```
                    work=text        work=map         work=time
bar                     46               46               46
lede                   116              116              116
PLATE                   44              208               44     <- 44 is the peek strip, WCAG 2.5.5
ribbon                   0               32                0
panel                  594              412              484
TIME                    52               52              184     <- the transport, the axis, four lanes
                      ----             ----             ----
                       844              844              844
the reading            458              254              347
was                    458              128              128
```

**AND THE PLATE GIVES UP THE DIFFERENCE WHEN THE READING WOULD FALL UNDER ITS FLOOR.** At 390×844
this never binds: the plate is 208 before and after. At 768×1024 it does — the plate was 350 and the
exits beat read 240 against a floor of 320 — so the plate drops to what leaves the floor standing and
stops at D4's own minimum. `--read-any-min` is the token the shell and `read.js` R17 both read.

| | **390×844** | **768×1024** |
|---|---|---|
| `--read-any-min` | **240** | **320** |
| the poster, before → after | 128 / 681 → **254 / 683** | 128 → **320 / 538** |
| the spine, before → after | 128 / 735 → **347 / 735** | 128 → **511 / 529** |
| the exits, before → after | 129 / 533 → **258 / 533** | 240 → **320 / 463** |
| the plate on a map beat | **208 → 208** | 350 → **290** |
| the plate on a time beat | 208 → **44** | 350 → **44** |
| the time control on a time beat | 184 → **184**, and nothing in it clipped | 184 → **184** |

### 11.11 HOW LONG THE READING IS, PUBLISHED — the gate a staging rule should read

Round 3, the classroom: *"the one-person-at-a-time staging of the tension beat stops at 46 rem, so
the projector case is the worst case: at 1024×640 the Amritsar beat is 463 px of scroller holding
2,951 px (6.4 screenfuls) and at 1366×768 it is 587/2,645 (4.5). The phone gets 3.9. Gate the
staging on available height, not width alone."*

**A width query was never the right gate and a height query is not one either.** What decides
whether a beat needs staging is how many screens of it there are, which is a fact about the window
AND the content and is knowable only by measuring both. The shell measures it at **every** viewport
— including the two where reading mode does not exist, which are the two where the beat is longest —
and publishes it:

| what | where | value |
|---|---|---|
| `#app[data-readfuls]` | the shell | the reading, in screenfuls, floored, `"1"`…`"9"` |
| `#app[data-readlong="on"]` | the shell | four or more of them |
| `--read-screenfuls` | the shell | the same number, for a CSS-only gate |
| `chrome:layout { screenfuls }` | the bus | the unrounded figure |

Measured after this pass on `#tour=thirty&step=18`: **390×844 → 3**, 768×1024 → 2, **1024×640 → 4,
`data-readlong="on"`**, 1366×768 → 3. The projector case is the one that lights, which is the
classroom critic's own finding, arrived at by measurement rather than by a breakpoint. **P05 owns
the staging; this is the gate it should read.**

### 11.12 THE TWELVE PIXELS THE TABLET HAD ALWAYS BEEN CLIPPING

Found while asserting §11.10 at 768×1024 and true on the **cold plate** as well as inside a beat:
`--time-h` is 11.5 rem = 184 across the whole sheet band, but between 46 rem and 62 rem the axis
keeps both the 24 px row reserved for the uncertainty marks and the full 34 px rail, so `.tl__deck`
72 + `.tl__body` 123 asked for **195 of 183** and the FOURTH LANE — Dissolution — was drawn 12 px
below the bottom edge of the region that owns it, on first paint, at the app's default tablet size.
LAYOUT_BUDGET **B3**: being clipped is being over budget, and the remedy is to shed a stratum. Three
were shed and no type moved: the rail's leading (34 → 30), the band's own padding and gaps, and the
trace — an `aria-hidden` shading whose tally is printed in words in the rate sheet, and which
`apparatus` on a phone already sheds for exactly this reason. **183 of 183 after, nothing clipped.**

### 11.13 THE FOUR LANES, AND WHY THE ANSWER IS NOT TO MAKE THEM BIGGER

Round 3, the phone: *"The four `.tl-lane` phase buttons are 12×189, 12×192, 12×98 and 12×41 CSS px
at 390×844, stacked on a 14 px pitch, no hit expander. That fails WCAG 2.2 AA SC 2.5.8 with no
spacing exception, and they are not decorative."* It is a true finding and the obvious fix is
impossible, which is worth writing down so the next round does not spend a day on it:

* four targets stacked in the 54 px the spine band gets cannot each be 24 px, and
* the spine cannot have more, because the time control is 184 and LAYOUT_BUDGET **B3** caps it at
  190, and
* the lanes are drawn **on the axis** — their widths are their date ranges, and the overlap of I and
  II from 1600 to 1838 is the whole argument — so they cannot be re-laid as a list without deleting
  what they say.

SC 2.5.8's own second exception is the answer: *"the function can be achieved through a different
control on the same page that meets this criterion"*. That control is **`Engines`**, 51×26 in the
transport's own rank, and it opens all four as **44 px rows** (measured: 358×82 each at 390×844),
every one of which opens the same argument the lane does. The lanes keep their press, their focus
ring and their hover reading for a mouse and a keyboard. **A thumb has a target.** The sheet it
opens declares `work: 'text'` (§11.2), so it is read at 594 px and not at 242.

### 11.14 ROUND 7 — R10 WAS ASSERTING A SENTENCE §11.2 HAD ALREADY WITHDRAWN

`read.js` reported `>>> READING LAW BROKEN — 1 of 112` at 390×844 and at 768×1024, on one step, on
one rule. The failing line was **R10**, and the app was right.

**The measurement.** `read.js` walks `[1, 2, 4, 14, 18, 20]` of `#tour=thirty` **in one session**,
because a gate reached by walking the path is a different mount from a gate reached by pasting its
address — and step 20 is the case that proves it. Cold-loaded, `#tour=thirty&step=20` is the exits
choropleth: `fit: map`, plate 390×208, `work=map`, and R10 passed. Walked to, the same address opens
**checkpoint 2 of 4, "Who did this"** — Gandhi in Natal in 1893 — over that beat:

```
                       cold into step 20        walked into step 20
the surface            the exits beat           checkpoint 2 of 4
.tr-panel              mounted                  NOT MOUNTED
<html data-tour-fit>   map                      map          <- the beat's, and still correct
#app[data-beatwork]    map                      text         <- the card's, and still correct
plate                  390x208                  390x44
ribbon                 390x32                   0
time control           52                       52
the reading            254 of 683               578 of 582   (1.0 screenfuls)
R10                    PASS                     FAIL
```

Nothing on that screen is wrong. The card is read through 578 px of a 582 px card; the plate is a
44 px strip with `OPEN THE MAP` on it; the year line says 1960, Dissolution. `work=text` is resolved
from the card's own `ask:sheet` `work`, which is precisely the contract §11.2 gives it. And the beat
is right to go on declaring `map`, because the exits choropleth comes back with its band the moment
the card closes — a student who dismisses a checkpoint has said nothing about the beat underneath.

**So the fault was in the rule.** §11.2's round-2 correction already says it in bold — *a declaration
about a beat answers only while the beat is on screen* — and the shell has branched on exactly that
predicate since (`chrome/index.js` `_livePanel`). R10's own wording, written in round 1, was never
brought with it: it read `<html data-tour-fit>` on every step in the band and compared it to a work
that, on four of the surfaces a student actually meets, was never resolved from it. Step 14 passed
only by coincidence — its beat happens to declare `text`, which is what its checkpoint card resolves.

**THE AMENDMENT. R10 asks the question of the surface, and it got sharper on the half that was
never being asked.**

| what is mounted | the declaration that governs | R10 asserts |
|---|---|---|
| a beat panel | `<html data-tour-fit>` | identical, or `time` resolved from `text` — **unchanged** |
| no beat panel: a Complication Gate, a checkpoint or recall card, the Close | the surface's own `ask:sheet` `work` | the shell published a work, it is **not `map`**, and the plate **has actually stood down** to the peek strip |

The second row is the stronger rule, not a weaker one, and it is the rule that would have caught the
dead end the phone critic found at `#tour=core&step=15` — a 661 px recall card read through 242 px
because a dormant `map` declaration was still answering for a beat that had left, with no control
anywhere to give the room back. Under the old wording that surface *passed* R10 (the dormant
declaration and the resolved work agreed with each other, and both were wrong about the screen);
under this one it fails on all three terms. §11.1's own after-table is the warrant: the Close, a
recall card and a Complication Gate all get plate 44, ribbon 0, time control 52.

**No pixel moved.** This round changed one rule in `tools/scenarios/read.js` and this file. The
count is unchanged — 112 assertions at 390×844 and at 768×1024, 12 at every viewport at and above
900×700, where reading mode does not exist and R0 says so.

## 12. LANDSCAPE — THE BAND NOBODY HAD EVER MEASURED

**Status: normative.** It amends this file's own §1 table and LAYOUT_BUDGET's height ladder below
460 px of viewport height. Everything at or above 46 rem tall is unchanged.

### 12.1 The measurement

Every height step in `layout.css` stopped at `(max-height: 700px)`. A phone turned sideways is
**844×390**, and at that window the five rows of the app grid do not sum:

```
bar 48 + lede 68 + stage minmax(15rem, 1fr) + time 136 + foot 26  =  518  of 390
```

`#app.app` is `height: 100dvh; max-height: 100dvh; overflow: hidden` and `--stage-min` was 240, so
**128 px of the layout was laid out below the fold of a page that does not scroll**
(`document.scrollHeight − innerHeight = 0`). Measured on the running app, cold-loaded into
`#tour=core&step=9` and again at steps 1, 4 and 11:

| element | rectangle | what it is |
|---|---|---|
| `.app__sheet` | 540,48 **304×470**, bottom at **518** | the beat |
| `.tr-panel__foot` | 541,404 303×53 | `more of this beat` · `Map` · `Next` |
| `.tr-panel__next` | 541,724 104×44 | the 44 px twin of Next |
| `.cl-blk` | 557,469 271×33 | the through-line, all six clauses |
| `.cl-blk__finish` | 468,792 38×36 | **`Finish`** |
| `.app__time` | 0,356 540×136, bottom at **492** | the year and the axis, cut in half |
| `.app__foot` | 0,492 540×26 | entirely below the fold |

**In landscape the lesson could not be advanced and it could not be finished.** And on the two beats
whose Next keeps a word — a Complication Gate refusing to move, which `tours.css` §176 says in as
many words must never lose its label — the transport asked for **211–221 px of a 144 px reserved
box**, was drawn outside `.bar__dock`, and hit-tested as **BLOCKED by `.bar__more`**. (That second
defect is also live at 900×700 and 768×1024; this pass fixes it only in the landscape band, because
those two windows are `budget-working.js` W15's and are not this pass's to move.)

Not one harness in this repository could see any of it. `budget.js` and `budget-working.js` had no
entry for the viewport and fell back to the 1366×768 row. W9 looks only in the masthead. W12 asks
whether the document scrolls, and the document does not scroll — which is the whole problem. W8's
region scan looks for an element outside the region that owns it, and these elements were inside
their regions; the regions were outside the window.

### 12.2 The rule

> **Below 460 px of viewport height the five rows are re-cut so that they sum to the window, and
> every stratum that leaves has a named home.**

460 and not 400: an iPhone 14 Pro Max in landscape is 430 tall, and a rule that catches four phones
and not the fifth is not a rule. The band is published as `#app[data-vband="short" | "tall"]`,
mirrored by `app/js/chrome/index.js` `_mqShortMatches()` from exactly the media condition
`layout.css` states. **If you change one, change both.**

The rail is unchanged: 844 and 740 are both ≥ 40 rem wide, so §THE TWO RAIL BANDS puts the rail in a
**side column** and the beat panel is a full-height grid item — 304×346 of 390, **88.7 %** of the
window. Reading mode (§11) does not exist here and `read.js` R0 is untouched.

**AND THE SENTENCE THAT USED TO STAND HERE JUSTIFIED THAT WITH THE WRONG BOX.** It read: "the
defect that mode answers is not present, so neither is the mode", on the strength of the 88.7 %.
88.7 % is the PANEL. §11 exists because the panel is not the reading, and this file's own §11.2 says
the reading window is "the scroller the prose is actually in" — the exact substitution §11 was
written to stop, made by §12 about §11. Round 2 of wave 10, the phone, was right to name it.

**THE SCROLLER, MEASURED at 844×390, walking every step of the default route** (`.tr-panel__scroll`,
except step 7 where the surface is a card and the body is the scroller):

| step | beat | the reading window | what it holds | screenfuls |
|---|---|---|---|---|
| 1 | poster | 211 | 875 | 4.1 |
| 2 | spine | 211 | 1,058 | 5.0 |
| 3 | barbados | **201** | 1,926 | 9.6 |
| 4 | resistance | 211 | **2,256** | 10.7 |
| 5 | the Complication Gate | 211 | 1,679 | 8.0 |
| 6 | compensation | 211 | 1,009 | 4.8 |
| 7 | the recall card | 309 | 313 | 1.0 |
| 8 | who-took-bengal | 211 | 562 | 2.7 |
| 9 | revenue-loop | **201** | **3,908** | **19.4** |

So the honest statement of the rule is the one below, and it is narrower than the one it replaces:

> **Reading mode does not exist in the short band because its MECHANISM has nothing to work on, not
> because the reading is comfortable here. §11 works by taking the plate's ROW and giving it to the
> panel. Below 460 px the panel is a COLUMN BESIDE the plate, so there is no row to take, and a
> control that promised to give the reading more would have nothing to give it.**

**What stands between the 346 px panel and the 201 px reading, with its owner** — measured on step 9
at 844×390, and this is the whole of the 145 px:

| | px | owner |
|---|---|---|
| `.cx-sheet__head` — the beat's title and the way out | 47 | the shell (chrome.css) |
| `.tr-panel__foot` — `more of this beat` · `Map` · `Next` | 53 | P05 (tours.css) |
| `.cl-blk` — the through-line, rendered here because `data-foot="off"` (§12.4) | 45 | P21 (close.css) |

**Two consequences a reader of this file is owed.** First, no floor of 320, or of 240, is reachable
in this band by any arrangement of the shell's own rows: even if the shell gave up the whole of its
47 px head the reading would be 248, and the other 98 px are two other pieces' and are on screen for
stated reasons. §12.7's first bullet has said so since round 3 and it is confirmed here, at 201–211
rather than the 195 it recorded. Second, **any sentence anywhere in this app that tells a reader the
guided lesson's panel is held to a 400 px floor is untrue at this window** — the panel is 346 and the
reading inside it is 201. A piece that declines to render below 400 px is entitled to decline; it is
not entitled to give this floor as its reason.

The remedy, when a round wants one, is P05's and P21's and it is the one §11 already applied to the
beat in the sheet band: a beat that collapses what a student has already read. It is not another row
of the shell's, and it is not a mode.

### 12.3 The arithmetic, at 844×390, with a beat mounted

```
                      before            after
bar                      48               44   <- a 36px transport box and 4px of air
lede                     68               59   <- AUTO: the beat's own sentence, never clipped
STAGE                   240              199   <- of which the colour ribbon is 28
  the drawn map        (152)             171   <- 540x171, contiguous, nothing on it
  the control dock      (36)               0   <- the definition dial: §12.5
  the colour ribbon     (28)              28
time                    136               88   <- two deck ranks and a 30px axis
foot                     26                0   <- #app[data-foot="off"], as in the sheet band
                       ----             ----
                        518              390
```

and at **740×360**, the narrowest window this band is stated for: bar 44 + lede 74 + stage 154
(map **436×126** + ribbon 28) + time 88 + foot 0 = 360.

| | 844×390 | 740×360 |
|---|---|---|
| the drawn map, **cold plate**, before → after | 844×171 (rows summed to 518) | 740×141 |
| the drawn map, **inside a beat**, before → after | 540×**120** → 540×**171** | 436×**90** → 436×**126** |
| the plate's share of the window, cold | **43.8 %** | **39.2 %** |
| **wave 10**: cold plate, after the door's sentence grew and `.cx-cta` re-stacked | **844×179, 45.6 %** | **740×134, 37.2 %** |
| controls laid out past the fold | **6** → **0** | 6 → 0 |
| shell regions past the fold | **4** → **0** | 4 → 0 |
| `.brand__title` cut by | 0 → 0 | **48 px** → 0 |
| the lede sentence clamped away | 0 | **22 px** → 0 |

**WAVE 10 RE-MEASURED THIS ROW AND ONE NUMBER IN IT WENT DOWN.** DIDACTIC_SPEC §8's amendment
lengthened the door's own sentence — it now names which of the three misleads this lesson delivers
and which is Lesson Two's — and at 740 that is one more line of a row this band deliberately made
`auto`. Measured cold, before anything was done about it: the lede was 74, the plate 126, and
`budget.js` B1/B2 read **35 % and 740×126 against floors of 37 % and 132**; at 844, **40 % and
844×156 against 42 % and 160**. The three pixels came back out of the FOCAL CONTROL, not out of the
sentence and not by lowering a floor: `.cx-cta` stacks its label over its note in this band, drops
base.css's 16 px flow margin (which no rule had ever cancelled at a landscape phone), sets both
parts at 1.2, and is capped at 10 rem under 47.5 rem wide. chrome.css carries the arithmetic. The
plate ends up **better than the row above it at 844 (179, 45.6 %) and 7 px short of it at 740 (134,
37.2 %)**, and the sentence is not clipped at either.

**43.8 % is the honest number and it is not a relaxation to make a red line green.** LAYOUT_BUDGET
B1's 50–64 % is a rule about windows with the height to spend it. 390 px carries four fixed rows
before the plate gets one, and each has been pared to what it actually holds: a 44 px bar around a
36 px transport box, a lede that is the beat's own sentence, a 28 px ribbon carrying a 28 px target,
and an 88 px time control. That is 219 of 390 = 56 %; the plate gets the other 171.

### 12.4 What leaves each row, and where it went

| row | what stands down | its home, on the same screen |
|---|---|---|
| `.app__foot` | the provenance strip, `display: none` | `#app[data-foot="off"]` is published, and P21 already renders the through-line as the panel's own last block in that state (§6, §7). It is measured at 557,341 271×33, on screen and topmost, at every step. |
| the lede band | `.cx-lede__mark` — the period mark | The year is on this screen **three times**: here, in the panel's own head, and in the time control's 22 px year block. Shedding one of three copies of one number gives the sentence 359 px instead of 297 at 844 and 242 instead of 180 at 740 — three lines become two, and W9b's "22 px of it clamped away" at 740×360 becomes 0. |
| the masthead | `.brand__text` while a lesson runs | Identification, exactly as under 46 rem (§2). Measured at 740×360 before: mark 28 + wordmark 145 + `AN INTERACTIVE ATLAS` 150 + Layers 97 + Explore 110 + box 280 + Tools 68 = **878 of 740**, and `budget-working.js` W8 read `.brand__title` "cut by 48px". 583 of 740 after. On the cold plate, where there is no transport and no box, the wordmark stays. |
| the plate | the definition dial's 36 px dock | §12.5 |
| the time control | `.tl-spine`, the four-lane band, and the axis's uncertainty-mark row | `.tl__phase` prints which engines are running, in the lanes' own colours, from the same `activePhases()` the band lights from; `Engines` is on rank 2 and opens all four as 44 px rows (§11.13). The marks row is `apparatus`-only and a phone already sheds it for this reason. **Nothing else leaves**: the year, the count, the one route out, Play, the two jumps, ±1 and the axis are all on screen. |

**And the press that brings the whole of it back is the rotation of the phone.** That is why this is
a band and not a mode, and why §11.4's rule — a mode with an entrance and no exit is worse than no
mode — is satisfied without a control: the student's own hand is the control, and every stratum
returns together.

The time control, measured at 844×390 after:

```
rank 1   the year (22), the spine's reading, the count, the one route out    24
rank 2   Play · ⇤ · −1 · +1 · ⇥ · Engines                                    26
the axis, FULL WIDTH — 540, and 508 of ruling with its decade labels         30
padding + row gap                                                             8
                                                                            ---
                                                                             88
```

`chrome.css` §E's `#app[data-rail="side"] .tl` block — the two-column deck-beside-axis arrangement
— is switched off here and P03's own narrow arrangement restated, so the axis is read across the
whole 540 rather than across 296.

### 12.5 THE DEFINITION DIAL IS NOT ON THE PLATE HERE EITHER

§5 stands the dial down at 390 px of **width** because 390 will not carry four segments on one 36 px
line. A landscape phone is 844 wide and carries them easily; what it does not have is the 36 px of
**height**, and §5's own table is the arithmetic:

| the dial's home | the map keeps, at 844×390 |
|---|---|
| the ribbon strip alone (28) | **156**, and 171 once the lede sheds its mark |
| + a one-row control dock (36) | **120** — which §5 itself calls "less map than the build this pass is repairing" |

and at 740×360 the same row leaves the map **90**. A map of 90 px is not a map. §11.4 argues the
opposite at 768×1024 and is right there — "the panel has 742 pixels to pay it from"; here the panel
has 346 and the map has 120, so the answer is the other one. The homes are §5's, unchanged, and all
three are on screen: keys 1–4 still change the reading; **the reading itself is printed under the
year in the time bar** (measured at 844×390: `211 units · 149 territories · claimed`); and the
ribbon's own `+n more` route opens the key. `shell-accept.js` **Q4** is satisfied because it asks
about occlusion of a dial that is DRAWN — "a dial the map has not put on screen is a different
conversation" — and `rule F`'s floor is met at both viewports for the first time.

**This is the same debt §5 records, at a second viewport, and P02 pays it in the same move.**

*The strip stands down, not its contents.* Hiding `.map__foot` alone leaves `.stage__dock` at
`--dock-h` with nothing in it — 36 px of empty rule across the foot of the plate — and it puts the
shell into a two-frame oscillation, because `data-dockfoot` is MEASURED from what is in the dock, so
a rule keyed on `[data-dockfoot="on"]` that empties the dock turns itself off and then back on.
`chrome.css` §E states it on `[data-dockfoot]` instead, in both states, and takes `--dock-h` to 0
with it.

### 12.6 The rules, and where they are asserted

There is no twelfth harness. The defect was that the existing ones had no entry for the viewport, so
the fix is entries and two rules, in the checker that cold-loads into the lesson:

| rule | assertion | where |
|---|---|---|
| **W16** | **No control the student must press is outside the window** — every visible control is inside the viewport, or inside something that scrolls to it. The plate's own 44 px territory targets are excluded, because a map pans and a target near the eastern edge at x=420 of 390 is the map working; the tolerance is 4 px, because `.cl-bar__whole` measures 1.4 px past the fold at 900×700 and a descender is W8's business, not this rule's. *(Before §12, at 844×390: 6 controls, including `Next`, `Map`, the through-line's `Finish` and `Play`.)* | `budget-working.js` |
| **W17** | **The shell's rows sum to the window** — no `.app__*` region ends more than 4 px past the fold. *(Before: `.app__time` +102, `.app__foot` +128, `.app__sheet` +128, `.app__dossier` +128.)* | `budget-working.js` |
| **W16h** | **No control on screen is under anything** — every control that is wholly inside the window and wholly inside its own scroller is the topmost element at the centre of its first client rect. Three exclusions, each measured: a control inside `[inert]` or `[aria-hidden]` (the dossier behind an open sheet is not on the page, §11.9); a control not wholly inside its own scroller (half-scrolled-out is the scroller working, and six of the seventeen beats have one at any moment); and the FIRST client rect rather than the bounding box, because a `more` link wrapped across two lines has a centre in the prose between them. *(Before §12.8, at 844×390: the recall card's `Commit` and `Skip`, both hit-testing to `.cl-blk__spine`; at 768×1024 and 900×700 the aux "Count it ↓", hit-testing to `.bar__more-w`.)* | `budget-working.js` |
| **W18** | **The counted figure is reachable** — every `.viz-onpath`'s commit control is in the window or inside something that scrolls to it, and topmost at its own centre once it is. §11.5B. *(Before: at 390×844 `Commit this guess` at y = 1,388 with no scrollable ancestor.)* | `budget-working.js` |
| **W16b** | All of the above, again, two beats later. | `budget-working.js` |
| B1/B2/B3, W6/W7, F | the two viewports have entries of their own, taken from the running app | `budget.js`, `budget-working.js`, `shell-accept.js` |

```
node tools/inspect.js tools/scenarios/budget.js         --out /tmp/b844 --w 844 --h 390
node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w844 --w 844 --h 390
node tools/inspect.js tools/scenarios/shell-accept.js   --out /tmp/a844 --w 844 --h 390
node tools/inspect.js tools/scenarios/dock.js           --out /tmp/d844 --w 844 --h 390
node tools/inspect.js tools/scenarios/read.js           --out /tmp/r844 --w 844 --h 390
… and the same five at --w 740 --h 360, in light, dark and reduced motion.
```

All five hold at both viewports in all three settings, with zero console errors and zero failed
requests. Walking `#tour=core` step by step at 844×390 — all seventeen stops and then the Close —
`off: []`, `rows: []`, `docScroll: 0`, and `Back`, `Next` and the beat's own foot topmost at their
own centres at every one.

### 12.8 THE RAIL'S OWN FRAME IS A PROPERTY OF THE ROOM — round 3, the phone

§12 re-cut the five shell rows and left the rail alone, on the ground that 844 and 740 are both over
40 rem wide, so the rail is a **side column** and the beat panel is already 88.7 % of the window.
That is true of a BEAT. It is not true of the two surfaces of the lesson that are not beats, and
both of the rules that give a long surface a pinned foot are keyed on `#app[data-rail="sheet"]`.
**A 237 px column is not a side rail in any sense those rules meant; it is a sheet turned on its
side.** Measured, on the build round 3 reviewed:

| | | 844×390 before | 740×360 before | after | 390×844, for comparison |
|---|---|---|---|---|---|
| **THE CLOSE** | `.cx-sheet__body` | 237 holding **10,437** — 44 screenfuls | 279 / 11,159 | **body clips; `.cl-close__scroll` 240 / 11,759** | 506 / — |
| | `.cl-close__scroll` | `overflow: visible`, scrolled **nothing** | same | **`hidden auto`, the one scroller** | `hidden auto` |
| | `.tr-panel__foot.cl-foot` — `more of this page ↓` · `Print` | **y = 10,522** | y = 11,170 | **y = 321, pinned** | y = 721, pinned |
| **A RECALL CARD** | `Commit` | 338–382 | 308–352 | 83 after the card scrolls | — |
| | `.cl-blk`, sticky, `z-index: 4` | **341.5–374, over it** | 311.5–344, over it | **341–374, a row with a height** | — |
| | `elementFromPoint` at Commit's centre | **`.cl-blk__spine`** | `.cl-blk__spine` | **`.qz__commit` — itself** | itself |
| | `Skip — it stays unanswered` | same rect, equally dead | same | itself | itself |
| | the card's own `.tr-panel__foot` | y = **773** of 390 | — | **y = 276, pinned** | pinned |
| **A BEAT WITH A FIGURE** | the 16 px under the spine | `.viz-onpath__h` painting through it | same | **`padding-block-end: 0`; nothing under it** | already 0 |

**The rule.**

> **Below 460 px of viewport height, a surface in the rail is framed the way the sheet band frames
> it: the prose is the one scroller, and the foot and the through-line are rows with a height
> rather than rafts over the reading.**

Three consequences, and each of them is a rule some other file had already written for a rail one
band over:

* **The Close** takes close.css §7's two-row grid — `minmax(0, 1fr) auto`, the body's own padding
  bled through at the head and the sides — at any height under 460, whatever `[data-rail]` says.
* **A recall card or a Complication Gate** — anything that renders `.qz` straight into the body —
  takes `tours.css` §THE GUARD's column: the body clips, `.qz` is `flex: 1 1 0` and scrolls,
  `.tr-panel__foot` and `.cl-blk` are `flex: 0 0 auto`. **`.cl-blk` goes `position: static` there,
  and that is not a change of P21's mind about it**: the spine is right to be sticky in a scroller
  and there is no scroller left for it to stick inside; its `z-index: 4` was the only thing left,
  and the only thing it was doing was standing on Commit.
* **A body that still scrolls with the spine in it gives up its bottom padding.** `position: sticky`
  resolves against the scrollport's CONTENT box, so a spine at `inset-block-end: 0` comes to rest
  one padding above the visible edge and the prose keeps going underneath it —
  `tours.css` §THE FRAME records the same arithmetic costing a whole line three rounds ago, and
  reading mode already gives this padding away for the same reason.

All of it is stated in `chrome.css` §E, from outside, with the piece that owns the real fix named in
the block, as the rest of §E is. **Deleted when P21 and P07 state their own frames for the short
band.**

### 12.7 What is still weak here, stated so it is not rediscovered as a surprise

* **The reading window is 201–211 px** (re-measured in wave 10 across all nine steps of the default
  route; §12.2 carries the table, and the 195 this bullet used to give was one beat, not the range).
  The panel is 346 of 390 — 88.7 % of the window, over §11's own R2 floor of 60 % — and there is
  nothing left to take: the four other rows are 44 px of masthead, 59 of the beat's sentence, 28 of
  ribbon and 88 of time control, and the 145 px inside the panel is named with its owner in §12.2.
  A 390 px window is about 205 px of reading and that is the whole of it. §11's remedy does not
  apply, because it works by taking the plate's row and here the panel is a column beside the plate,
  not a row under it. **The worst of it is `revenue-loop` — 201 px holding 3,908, 19.4 screenfuls —
  and that is the beat DIDACTIC_SPEC §8 calls the centre of the whole app.**
* **740×360 is the edge.** The map is 436×126 with the rail open and the plate's share is 35 %. Both
  numbers are floors in the checker now, so they cannot silently get worse.
* **Below 40 rem wide AND short** — a 568×320 landscape phone from 2013 — the rail is still a bottom
  sheet with a 280 px floor, because §THE TWO RAIL BANDS keys the sheet on width alone and this pass
  did not move that condition. The height ladder above still applies and the window degrades rather
  than breaks. Nobody has measured it.
* **The dial is a debt at a second viewport now** (§12.5), and it is still P02's.
* **The Close's reading window in landscape is 240 px holding 11,759** — 49 screenfuls, against 44
  before §12.8. The frame did not make the page shorter; it made the pager work and put `Print` one
  press away instead of forty-four. There is nothing left to take: bar 44, head 37, foot 53, time
  88. The remedy is P21's and it is the same one §11 applied to the beat — a Close that collapses
  what a student has already read — not another row of the shell's.
* **The recall card's `Commit` is below the fold at first paint in landscape** — 676 px of card in a
  179 px scroller. It is reachable, it hit-tests to itself, and the same card in portrait needs the
  same scroll; a 390 px window cannot show a question, four answers and a commit at once. Stated so
  it is not read as the defect §12.8 fixed, which was that the control was on screen and dead.
* **`.tr-bar__aux` still overflows its box at 768×1024 and 900×700 when the offer is not a
  figure** — the teacher desk's move and onboarding's review still render there and still hit-test
  to `.bar__more-w`. §11.5B moves the one offer that carries a must-stick item; the box is P05's.

## 13. THE THREE RULES ABOUT BOXES — `shell-furniture.js`

*Wave 9.* Every rule above this one is about where a thing goes and how big it is. These three are
about whether the box **around** it tells the truth, which is the failure mode nothing in this
repository could see: a critic reading a screenshot cannot tell that a control's target has been
cut, and the type looks perfect while the box is nine pixels short at each end.

They are asserted by `tools/scenarios/shell-furniture.js`, at every disclosure level, at every
viewport, in both themes.

**F1 — nothing in the time band is cut by its own furniture.** `.app__time` is `overflow: hidden`
by LAYOUT_BUDGET B3 — *being clipped is being over budget* — so every box inside it must fit inside
every clipping ancestor it has, at `plate`, at `working` and at `apparatus`. A scroller is exempt
on the axis it scrolls; a `hidden` box is not exempt on any axis.

**F2 — the axis and the four phase bands sit at the same `y` at every disclosure level, to zero
tolerance.** `.tl__body` centres what it holds, so *anything* that changes the height of the deck
beside it moves the axis and all four bands under a reader's stationary finger. Measured at 390×844
before this pass: `apparatus` put the speed selector on the year rank, the deck's grid track went
**71.59 → 71.95**, and the axis and the spine went with it — 0.18 px, which is small and is not
zero. The deck's track is now *reserved* at 4.5 rem in the phone arrangement rather than measured,
which is the same remedy §11 and `timeline.css` already use for the marks row: **deck 72.00, axis y
755.50, spine y 787.50, at all three levels.**

The reservation is scoped `#app:not([data-timeband="line"])`. Reading mode's band is 52 px and its
deck is one rank; 72 px of reservation in a 52 px band *is* the defect F1 exists to catch, and
`read.js` R8 caught it on seventeen steps across five routes the moment it went in unscoped.

**F3 — a masthead control's target is the size it looks.** The two masthead strips clip on the x
axis to keep the document one screen wide, and CSS makes that a decision about **both** axes: with
`overflow-x: auto` the y axis can never compute to `visible`. So the strips were as tall as a line
of 13 px type. Measured at 900×700 on the cold plate:

| | before | after |
|---|---|---|
| `.bar__slot--main` | 240 × **17.0** | 240 × **47.0** |
| "Start the lesson" — the app's one call to action | 95 × 36.2 | 95 × 36.2 |
| its **effective** target | 95 × **17.0** | 95 × **36.2** |
| `elementFromPoint` 2 px inside its top and bottom edges | the masthead | the control |

9.6 px was cut off each end of the target and of the focus ring, WCAG 2.2 SC 2.5.8 (24 px) failed
by seven pixels, and nothing about the type looked wrong. `align-self: stretch` gives each strip the
47 px of masthead it has to stand in; the strip's own `align-items: center` keeps every control on
the same optical line, and the horizontal clip — the one these boxes exist for — is untouched.

F3 fails only on a control **the shell cuts**. Whether a module gives its own control a 24 px box is
that module's business; the scenario prints those as a NOTE with the number, so whoever owns the
control can see it. At wave 9 that is `Layers` (18.5 px) and `Count it` (18.5 px).

### 13.1 CONTRAST IS A RULE ABOUT THE COMPOSITE, NOT ABOUT THE STYLESHEET

The same wave swept every label, caption and chip in `layout.css`, `chrome.css`, `timeline.css` and
`map.css` — 80 distinct label styles, eight viewports, both themes, six routes, five years, the
Engines sheet and the mark sheet — compositing each colour over its real backdrop **and over every
`opacity` between it and that backdrop.** Four failures, all of them invisible to a reading of the
stylesheet, because in three of the four the colour token was fine and an `opacity` did the damage:

| | before | after | what it was |
|---|---|---|---|
| `.map__defkey` (paper) | **4.01** | 4.84 | `--text-secondary` at `opacity: .75` |
| `.map__defkey` on the chosen chip (lamplit) | **3.79** | 5.14 | `--text-on-accent` at `opacity: .85` |
| `.map__defword` on the chosen chip (lamplit) | **4.41** | 5.14 | `--text-on-accent` on flat `--accent` |
| `.map__modesub` (paper / lamplit) | **2.40 / 2.56** | 4.84 / 4.57 | the whole tile at `opacity: .62` |

Three rules follow, and they are rules for every piece, not only for the shell's:

1. **Opacity is the one way to fail a contrast rule that no audit of the stylesheet can see.** If a
   label is meant to be quieter, make it quieter with a colour token — `--text-min` is that token —
   and never with `opacity`.
2. **AA's exception is for *disabled* controls.** `.map__mode.is-unavailable` says in its own
   comment that the tile is never disabled, because a disabled button cannot explain itself. A
   pressable control carrying a sentence is not incidental text and gets 4.5:1 at 12 px.
3. **`--text-on-accent` on flat `--accent` is 4.41:1 in lamplit** and misses AA at 12 px by nine
   hundredths. `--accent` and `--text-on-accent` are `tokens.css`'s and not a component's to move,
   so a filled chip that carries small type mixes its own fill one step *away* from its own ink —
   `color-mix(in srgb, var(--accent) 88%, var(--text-body))`, which darkens the red under near-white
   type and lightens it under near-black type from one expression, with the flat declaration above
   it as the fallback. **This is a token-level defect and every filled accent chip in the app that
   carries 12 px type has it.** The shell has fixed its own two; the rest are their owners'.

## 10. Amending this file

As LAYOUT_BUDGET §8: propose a diff with the measurement that motivates it, taken from the running
app at the viewport in question, inside a mounted beat, and re-run `read.js`, `dock.js`, `budget.js`,
`budget-working.js` and `shell-accept.js` at all eight viewports plus `--dark` and `--reduced`. A
rule may be relaxed. It may not be quietly ignored from a component stylesheet, and **it may not be
answered by putting a control back on the map.**
