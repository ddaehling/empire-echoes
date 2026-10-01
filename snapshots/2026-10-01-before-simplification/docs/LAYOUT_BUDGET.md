# LAYOUT BUDGET — the binding contract

**Status: normative.** Where this file and a component stylesheet disagree, this file wins and
the component is wrong.

> **AMENDED BELOW 62 rem BY `docs/RESPONSIVE_LAW.md`.** B5's three exemptions —
> `.stage__map`, `.stage__over`, `.app__overlay` — are where every floating control in this
> application actually lives, so B5 has never been able to see the transport, the map's zooms,
> the map's definition dial or the pinned colour ribbon, and inside a mounted lesson beat all
> four were standing on the map: **42.5 % of it covered at 390×844, 30.5 % at 900×700.**
> RESPONSIVE_LAW states the rule those exemptions could not (*below 62 rem nothing floats inside
> the map rectangle*), the dock every control goes to, the contract other modules read, and the
> amended floors for B2 and for `shell-accept.js` rule F. Its executable form is
> `tools/scenarios/dock.js`. At and above 62 rem nothing in this file changes. It is subordinate only to `docs/DIDACTIC_SPEC.md` (pedagogy) and
`docs/DESIGN.md` (ink, type, colour). It governs geometry, sequencing and panel language.

**Owner:** the art-direction / shell agent.
**Files that implement it:** `app/index.html`, `app/css/layout.css`, `app/css/chrome.css`,
`app/js/chrome/index.js`.
**How to test every rule in it:**

```
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b1920 --w 1920 --h 1080
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b1440 --w 1440 --h 900
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b1366 --w 1366 --h 768
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b1024 --w 1024 --h 640
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b1024s --w 1024 --h 600
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b900  --w 900  --h 700
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b768  --w 768  --h 1024
node tools/inspect.js tools/scenarios/budget.js --out /tmp/b390  --mobile
```

**Three viewports were added to that list in the shell pass** — 900×700, 768×1024 and
1024×600 — because a hostile critic found a hard defect on fresh load in the 768–1024px
width band that none of the original five could see. See §2A.

The budget is geometry. The shell's own behaviour — the rail band, the deep link, the
disclosure controller, Escape, module isolation — has a second executable form:

```
node tools/inspect.js tools/scenarios/shell-accept.js   --out /tmp/s900 --w 900 --h 700
node tools/inspect.js tools/scenarios/shell-surface.js  --out /tmp/sf   --w 1366 --h 768
node tools/inspect.js tools/scenarios/shellr3-focal.js  --out /tmp/fc   --w 1366 --h 768
node tools/inspect.js tools/scenarios/shellr3-near.js   --out /tmp/nr   --w 1366 --h 768
node tools/inspect.js tools/scenarios/shellr3-seam.js   --out /tmp/sm   --w 900  --h 700
node tools/inspect.js tools/scenarios/shellr3-drive.js  --out /tmp/dv   --w 1366 --h 768
```

`shell-accept.js` prints PASS/FAIL per rule and `>>> shell holds` / `>>> SHELL BROKEN`, and it
is run at all eight viewports in light, dark and reduced motion. Its rules **Q–Q5** were added
in the round-3 pass and load a beat of the guided path, because three of that round's shell
defects were invisible on the cold plate: the seam at the foot of the plate (§2A,
`--dock-floor`), the disclosure level a lesson link carries, and the red button that pointed at
the sweep while the band said "Place it to go on".

`shellr3-focal.js` counts the filled madder-red controls on screen in four states (§6).
`shellr3-near.js` covers the address that names a place this atlas has not got.
`shellr3-seam.js` walks the guided path by pressing Next and prints the overlap between the
floating transport and every strip on the foot of the plate, beat by beat.
`shellr3-drive.js` drives the shell hard — sweep, re-entrant sweep, four stage changes, the
sheet displaced and restored, the tools panel, the lesson, two resizes across the rail band, a
nonsense address and a good one — and reports console errors, page errors, failed requests and
horizontal overflow. It is run at every listed viewport in light, dark and reduced motion, and
must print 0/0/0 every time.
`shellr3-neg.js` is the **negative control** for `--dock-floor`: it restores the round-2 dock
arithmetic in the page and confirms the overlap comes back, so rule Q3 is known to be able to
fail.

It prints PASS/FAIL per rule and `>>> budget holds` or `>>> BUDGET VIOLATED`. A diff that turns a
PASS into a FAIL is rejected. No rule below is stated as an adjective.

---

## 0A. THE WORKING-STAGE MATRIX — added after round 2

**Every harness above tests the cold plate.** Round 2's verdict found six hard defects and
all six lived one attribute away from it, in `data-stage="working"` with a beat panel
mounted — the state a student is in for twenty-nine of the lesson's thirty minutes:

> "the beat panel mounts empty, the Back/Next bar disappears, and Next is intercepted by the
> dossier — the flagship path cannot be completed on the device most students actually hold,
> and budget.js never catches it because it only tests the cold plate."

Two harnesses close that. Both are run at the four viewports the critic used, in light, dark
and reduced motion, and a green cold plate no longer counts as a green build:

```
node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w390  --mobile
node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w768  --w 768  --h 1024
node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w900  --w 900  --h 700
node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w1366 --w 1366 --h 768
node tools/inspect.js tools/scenarios/budget-working.js --out /tmp/w1440 --w 1440 --h 900

node tools/inspect.js tools/scenarios/shell-surface.js  --out /tmp/s1366 --w 1366 --h 768
```

`budget-working.js` **cold-loads into a beat** (`#tour=thirty&step=3`) — not a resize down
from desktop, because every one of the six defects survived a resize and only appeared on
first paint — and asserts fifteen rules: the beat panel has a body and 280px; nothing paints
over its head; Back and Next are rendered, in the viewport, and are the topmost thing at
their own coordinates; the map keeps a floor and a share; **no region clips its own text**;
no masthead control is stranded outside the viewport; one teaching panel; one year; no
document scroll. Then it **presses Next twice** and asserts the same things again. It prints
`>>> working budget holds` / `>>> WORKING BUDGET VIOLATED`.

`shell-surface.js` asserts the shell's other contract — the one about meaning rather than
geometry. One teaching panel at a time and the displaced one comes back; a link pasted into
an open tab is the object it names; Back out of the lesson leaves the lesson; an address that
names nothing says so instead of being silently rewritten; a real deep link is untouched.

**Three of the rules exist because the harness found the defect, not the critic:**

| Rule | What it caught, measured |
|---|---|
| W5 / W13 | At **900×700** the transport sat at **y = −19**, off the top of the screen. `--rail-clear` is the seam an open bottom sheet leaves; beside a side *column* the shell was publishing 648 of a 700px window, and the piece that pins the transport against it put Back and Next outside the viewport. **The lesson could not be advanced at 900×700 at all.** It is 0 beside a column now (§2A). |
| W8 | `.app__foot` is 26–32px and it is a height. `.cl-bar` asked for **34.45px** at 1366, 1440 and 900 — `align-items: baseline` across a serif paragraph and a sans button, plus a 16px flow margin from base.css §91 — so the through-line, the app's C5 centrepiece, was drawn 2–4px **below the bottom edge of the window** at every desktop viewport. |
| W9 | At **390×844** the Recall button's right edge stood at **x = 388** with half of it off screen, and at 768×1024 the mechanism entry at x = 741 of 768. Both strips scrolled sideways, which keeps the document one screen wide, but a sideways scroll with no affordance is not a route to a control. See §5A. |

**A note for whoever writes a load test.** `waitUntil: 'networkidle'` never settles on this
page and never will: measured after `load`, 167 resources have completed, `readyState` is
`complete`, nothing is in flight and no request is issued in the following four seconds, but
Chromium does not emit the `networkIdle` lifecycle event for the navigation. Wait on the app
instead — every scenario in `tools/scenarios/` does:

```js
await page.waitForFunction(() => window.BEA && window.BEA.store
  && window.BEA.store.getState().status === 'ready');
```

---

## 0. Why this file exists

Four pieces — the map, the time control, the legend and the dossier — were each built separately
and each survived five rounds against a hostile critic. Each won its argument by putting more on
screen. Measured on the build immediately before this pass:

| | 1024×640 | 1366×768 | 1440×900 | 1920×1080 | 390×844 |
|---|---|---|---|---|---|
| drawn map | 377×159 | 704×297 | 758×320 | 1222×516 | 390×176 |
| map as % of viewport | **9.1 %** | **19.9 %** | **18.7 %** | 30.4 % | 20.9 % |
| time bar | 253 px (39.5 %) | 321 px (41.8 %) | 391 px (43.4 %) | 477 px (44.2 %) | 588 px (69.7 %) |
| interactive controls on first paint | 70 | **82** | 101 | 115 | 53 |
| words on first paint | 593 | **821** | 1 145 | 1 310 | 631 |
| distinct font sizes on screen | 7 (incl. 8 px) | 7 (incl. 8 px) | 7 | 7 | 7 |
| document scrollHeight vs viewport | 747 / 640 | 791 / 768 | 900 / 900 | 1080 / 1080 | 844 / 844 |

The control for time was physically larger than the thing it controlled. Four separate explanatory
panels competed above a 704-pixel map. The timeline's drawer — which carries fourteen live
historiographical disputes, the app's only prediction question and the full text of every change
card — resolved to a box one pixel tall at y = 772 in a 768-pixel window, on a page that could not
scroll. **Nothing was wrong with the content. Everything was wrong with the composition.**

After this pass, same measurements, same scenarios:

| | 1024×640 | 1366×768 | 1440×900 | 1920×1080 | 390×844 |
|---|---|---|---|---|---|
| drawn map | 782×330 | **1095×462** | 1182×499 | 1662×701 | 390×165 |
| map plate as % of viewport | 56.6 % | **60.2 %** | 64.0 % | 67.6 % | 56.4 % |
| time bar | 124 px (19.4 %) | **140 px (18.2 %)** | 152 px (16.9 %) | 164 px (15.2 %) | 184 px (21.8 %) |
| controls on first paint | 19 | **19** | 19 | 19 | 16 |
| words on first paint | 174 | **179** | 179 | 179 | 153 |
| distinct font sizes | 5 | 5 | 5 | 5 | 5 |
| largest text that teaches | 17 px | **19 px** | 19 px | 19 px | 17 px |
| console errors / failed requests | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

**Not one line of pedagogical content was deleted.** Every item was given a moment (§4, §6).

---

## 1. The regions, and who owns them

```
┌─────────────────────────────────────────────────┬──────────┐
│ bar     masthead — identification only          │          │  --bar-h
├─────────────────────────────────────────────────┤          │
│ lede    ONE sentence + the ONE control          │   rail   │  --lede-h
├─────────────────────────────────────────────────┤          │
│                                                 │ dossier  │
│ stage   THE PLATE — the subject of the page     │    or    │  1fr
│                                                 │  sheet   │
│ ┌─────────────────────────────────────────────┐ │          │
│ │ key   the colour ribbon, one line           │ │          │  --key-h
├─┴─────────────────────────────────────────────┴─┤          │
│ time    the year                                │          │  --time-h
├─────────────────────────────────────────────────┤          │
│ foot    provenance                              │          │  --foot-h
└─────────────────────────────────────────────────┴──────────┘
```

`data-mount` slots, unchanged except where marked:

| slot | region | owner |
|---|---|---|
| `toolbar`, `chrome-end` | masthead | unclaimed — **shared, see below** |
| **`lede`** *(new)* | the one-sentence band | **chrome** — no other module renders here |
| `map`, `map-overlay` | the plate | map |
| `stage-note` | the deferred apparatus column | legend (byline) |
| `legend` | **the colour ribbon strip** *(moved)* | legend |
| `dossier` | the rail | dossier |
| **`sheet`** *(new)* | the rail, stacked over the dossier | **any piece, via `ask:sheet`** |
| `timeline` | the time bar | timeline |
| `statusbar` | the footer | unclaimed |
| `overlay` | full-screen | tours / quiz / onboarding |

**A shared slot gives every module its own root.** Three slots are claimed by more than one
module — `toolbar` (tours, layers), `chrome-end` (viz, mechanism, quiz, teacher) and
`overlay` (historiography, search, onboarding) — and until this pass they shared the slot
*element*. The module contract says a module owns its root, so a module that legitimately
called `fill(root, …)` deleted its neighbours: `app/js/teacher/index.js` does exactly that
and is the last module to mount, which wiped the search door, the chart entry, the quiz
button and the mechanism entry out of the masthead at every viewport. They came back only
because four separate pieces carry a defensive re-append on `app:ready`.

`core/registry.js` now gives the first claimant the slot element and every later claimant its
own child root, `class="mount mount--sub"`, `display: contents` (layout.css) — no box, no
layout change, and out of reach of a neighbour's `replaceChildren`. **The consequence for a
stylesheet:** a rule of the form `[data-mount="x"] > *` matches the sub-root, not the
control inside it. Where that matters, state both — `layout.css` does it twice, for
`.bar__slot > *` and for `.app__overlay > *`, and each one is load-bearing.

---

## 2. THE BUDGET

All figures are CSS pixels, measured on the running app, not computed from tokens.

| | **390×844** | **768×1024** | **900×700** | **1024×640** | **1366×768** | **1440×900** | **1920×1080** |
|---|---|---|---|---|---|---|---|
| masthead `--bar-h` | 46 | 48 | 48 | 48 | 52 | 52 | 56 |
| lede band `--lede-h` | ≤ 112 (2 lines + control) | ≤ 112 | 52 | 52 | 56 | 60 | 64 |
| **map plate** (stage − ribbon) | **476** | **654** | **410** | **362** | **462** | **576** | **730** |
| colour ribbon `--key-h` | 28 | 28 | 28 | 28 | 30 | 32 | 34 |
| time bar `--time-h` | 184 | 184 | 136 | 124 | 140 | 152 | 164 |
| footer `--foot-h` | 0 (hidden) | 0 (hidden) | 26 | 26 | 28 | 28 | 32 |
| rail `--rail-w` when open | full width sheet | full width sheet | 304 | 336 | 410 | 432 | 432 |

### The rules, in the form the test asserts them

**B1 — the plate's share of the viewport.** `stage.width × (stage.height − key.height) ÷ (vw × vh)`
must be **≥ 50 %** at 390×844, **≥ 58 %** at 768×1024, **≥ 55 %** at 900×700, **≥ 56 %** at
1024×640, **≥ 50 %** at 1024×600, **≥ 60 %** at 1366×768, **≥ 62 %** at 1440×900, **≥ 64 %** at
1920×1080. *(Achieved: 56.4 / 63.9 / 58.6 / 56.6 / 55.3 / 60.2 / 64.0 / 67.6.)*

**B2 — the drawn map's floor.** The `.stage__map` canvas must be at least
**360×150** (390×844) / **700×540** (768×1024) / **860×380** (900×700) / **740×300** (1024×640) /
**700×280** (1024×600) / **1000×420** (1366×768) / **1100×470** (1440×900) / **1500×620** (1920×1080).
This floor holds **with the rail open**, at every disclosure level. *(Achieved with the rail closed:
390×165 / 782×330 / 1095×462 / 1182×499 / 1662×701.)*

**B3 — the time bar's ceiling.** `.app__time` height must be **≤ 190 / 130 / 146 / 158 / 170**.
It is a `height`, not a `min-height`, and the region has `overflow: hidden`.
**If the time control is being clipped it is over budget.** The remedy is to shed a stratum
(§4), never to ask for the row back.

**B4 — no document scroll, ever.** `document.documentElement.scrollHeight ≤ innerHeight` at every
viewport and every disclosure level. Content taller than its region scrolls *inside* its region.
`html, body { overflow: hidden }` is set in `chrome.css` and may not be relaxed.

**B5 — nothing stands on the plate.** No opaque, pointer-receiving element positioned `absolute` or
`fixed` may overlap the plate rectangle by more than 4 000 px², except children of `.stage__map`,
`.stage__over` and `.app__overlay`. **Panels compress the map; they never cover it** (FEATURE_SPEC
§2 rule 1). The dossier and the sheet take the rail; the apparatus column takes a reserved gutter;
the ribbon takes the strip. There is no fourth way to put something on the stage.

**B6 — the map fills its own rectangle.** The drawn map must cover **≥ 80 %** of the plate
rectangle's area. *This rule is the map piece's, not the shell's, and it currently fails at three of
the five viewports (1024×640: 70 %, 1440×900: 71 %, 390×844: 35 %). See §7, P02.*

**B7 — one rail, one width.** The dossier and the sheet occupy the same grid column and the same
`--rail-w`. Opening the sheet while the dossier is open stacks it; it never opens a second column.
Under 62 rem both become the same bottom sheet, and both stop above the time bar so the year stays
reachable while reading.

**B8 — no disclosure surface may be shorter than `--cx-sheet-min` (280 px).** Anything that opens
in answer to a control the reader pressed gets at least that, or it goes in the sheet. This rule
exists because four of the app's promises used to resolve to a 1 px container.

**B9 — the grid is declared at `#app` specificity, from `layout.css`, and nowhere else.** Component
stylesheets load after `layout.css`, so a `.app { grid-template-… }` rule in a component file used
to win silently; three files were doing it and the map paid. Do not declare `grid-template-rows`,
`grid-template-areas`, `grid-template-columns`, `height` or `min-height` on `.app` from a component
file. Yours will be ignored, and that is deliberate.

---

## 2A. THE RAIL'S ORIENTATION — an amendment to B7

**B7 read:** "Under 62 rem both become the same bottom sheet." Measured on the running app at
900×700, on fresh load, with a territory open:

| | measured |
|---|---|
| `.app__stage` | 0,158 900×358 |
| drawn map | 900×330 |
| `.app__dossier` | 0,110 **900×406**, `position: fixed` |
| overlap(rail, drawn map) | **297 000 px² — 100 % of the map** |
| `.legend__pin.stage__key` | 0,**82** 900×28, printed across the lede band |
| lede band | 0,48 900×**110** (budget: 60) |

The rail covered the whole map, so at 900×700 the atlas had no atlas; and the colour key,
pinned above the sheet by P17's own arithmetic, landed on the one-sentence band, slicing the
year and cutting the focal control in half. Both are B5 violations and both are unfixable
while the rail is a bottom sheet, because a 700px window has no 280 px to spare below the
plate. **A 900px window has the room the sheet wanted; it is just horizontal.**

**B7 now reads:** the rail is one column with one width, and *which axis it takes is decided by
which axis has room*:

```
SHEET BAND   (max-width: 39.999rem)                          phones
             (max-width: 61.999rem) and (min-height: 46rem)  tall and narrow
SIDE  BAND   everything else
```

62rem is unchanged as the breakpoint every other piece keys on. In the side band the rail is
19 rem wide and the map is compressed, never covered. After the change, same viewport, same
scenario: drawn map **596×410**, overlap **0 px²**, lede band **52**, nothing over the band.

The shell publishes the answer so no piece has to re-derive it:

* `#app[data-rail="side"|"sheet"]` — mirrored from exactly that media condition.
* `--stage-top`, `--stage-height` — the stage's measured rectangle.
* `--rail-top-min` — the highest y a bottom sheet may reach: the **drawn map's** top plus the
  plate's 150 px floor, measured wherever the map currently is (P02 lifts it into a fixed
  strip at phone width). layout.css clamps the sheet's height against it, so a sheet sized
  from `dvh` alone can never take the map's last pixel again.
* `--rail-clear` — the seam: how far the open rail reaches up from the window's bottom edge,
  for a piece that has to sit immediately above it. **It is `0` whenever `data-rail="side"`,
  and that is the whole of its meaning.** A side rail is a full-height grid item, so there is
  no bottom seam: the window's bottom edge belongs to the time bar. It used to be published
  unconditionally, and beside a column it reported the height of the window — measured at
  900×700, `648` — so `app/js/tours` pinned its transport at
  `bottom: max(--rail-clear, …) + --key-h` and put **Back and Next at y = −19**, off the top
  of the screen, with no other way to advance the lesson. Consumers write
  `max(var(--rail-clear, 0px), <their own floor>)`; beside a column that expression now falls
  back to their floor, which is what they meant.
* **`--dock-floor` — the seam at the FOOT OF THE PLATE**, added in the round-3 shell pass, and
  the same idea as `--rail-clear` one region up. It is how far the plate's own foot furniture
  reaches up from the bottom edge of the window, so a floating control strip can sit
  immediately above it: `bottom: var(--dock-floor)`.

  It exists because two pieces pin something along the foot of the plate and neither can see
  the other. Measured at **900×700 on beat 1 of the guided path**, before it:

  | | measured |
  |---|---|
  | `.tr-dock` (the lesson's Back / Next) | 382,381 **206×40**, `fixed`, z 62 |
  | `.map__switch` (“British means 1 2 3 4”) | 8,402 580×66 |
  | `.map__defs` | 123,407 337×32 |
  | overlap(dock, `.map__switch`) | **3,914 px²** |
  | overlap(dock, `.map__defs`) | **1,092 px²** — the end of the dial: *3 controlled*, *4 influenced* |

  P02 puts its strip at the foot because the foot of a British Empire plate is the Southern
  Ocean; P05 puts the transport there because the foot covers no land. Both are right. P05
  computed the seam from `--time-h + --foot-h + --key-h` plus its own measured
  `--tr-dock-lift`, and on a **cold load into a beat that property is still unwritten** —
  measured, it read `""`. A token sum cannot answer it in any case: the map's strip is
  content-sized (66px at 900×700, 32px at 1440×900), it wraps, and it only exists from
  `data-stage="working"`.

  So the shell measures the topmost of `.map__foot`, `.stage__key`, `.legend__pin`,
  `.app__time`, `.app__foot` and — in the sheet band only — the open rail, and publishes one
  number. It is clamped at both ends: never below the top of the time bar (the floor every
  consumer already had, so it can only raise a bar and never drop it into the time control),
  and never so high that a deep wrapped strip pushes the transport off the plate onto the
  map's labels. A strip that deep is the thing over budget; B3's remedy applies to it.

  `chrome.css` §E enforces it on `.tr-dock` from outside until `tours.css` writes it itself.
  Rules **Q2–Q4** of `shell-accept.js` assert it, and the negative control is recorded: with
  the round-2 arithmetic restored in the page, the overlap comes straight back (471 px² at
  step 9, 3,914 px² at beat 1).
* `chrome:layout` on the bus carries all of it — `rail`, `stage`, `plate`, `railClear`,
  `dockFloor`, `vw`, `vh` — whenever it changes.

**B10 — nothing is positioned above the top of the plate.** Two pieces pin a strip using
`inset-block-end` computed from a panel's height. An arithmetic slip there does not land in
that piece's own region; it lands on the lede band, which is the shell's. chrome.css §E now
clamps those strips against `--stage-top` from outside.

---

## 3. THE DISCLOSURE LEVELS

State: `state.filters.stage`, reflected on `<html data-stage>` and `#app[data-stage]`, and in the
URL (`#year=1857&filter=stage:apparatus`) so a teacher can link to a level. Levels only advance on
their own; a reader may go back explicitly. Owned by `app/js/chrome/index.js`; a piece **requests**
a level (`bus.emit('ask:stage', { level: 'working' })`) and never sets one.

### Level 0 — `plate` — second zero

Nineteen controls, 179 words, five font sizes, one sentence at 19 px.

* the masthead (mark, title, subtitle — quiet, 16 px)
* **the lede band**: one period mark, one sentence at `--fs-lede`, one primary control
* **the map plate**, ≥ 60 % of the viewport
* **the colour ribbon**: the swatches actually on the map this year, with their names and counts
* the year, `Play`, `−1`, `+1`
* the year axis (which is the scrubber)
* the four-phase spine bands
* map zoom `+ − ⌂`

Nothing else. **The one panel that survives above the map is the lede band, and it is new** — it
replaced the byline's three questions, the legend's "How to read this map", the definition switch's
gloss and the rate rail's caption with a single sentence at reading size.

### Level 1 — `working` — the moment the reader touches anything

Reached automatically by: changing the year, pressing Play, selecting a territory, changing the
layer, changing the definition, or finishing the opening sweep. There is no "show me more" button.

**And by an address that names a step in the lesson.** Round 3, measured on cold loads at
900×700: `#tour=thirty&step=1` landed at `working`, `#tour=thirty&step=9` and
`#tour=thirty&step=14` landed at **`plate`** — no definition dial, no full transport, no
"account disputed". Beat 1 escaped only because that beat sets the stage itself. A teacher who
sets `#tour=thirty&step=9` in a lesson plan, which FEATURE_SPEC §1 charge 14 says is the whole
point of a frozen hash route, handed thirty students a poorer app than the student who pressed
Next nine times. `plate` is second zero, and nobody nine beats into the lesson is at second
zero, so a lesson link carries `working` with it. A bare `#year=1857` is still the cold plate
(rule A of `shell-accept.js`), and `filter=stage:apparatus` still wins, because stages never go
backwards. Rule **Q** asserts it.

Adds: the definition dial (1 / 2 / 3 / 4), the "account disputed" affordance, the full transport
(⏮ ⇤ ⇥ ⏭ and speed), the density tick row, and the map's readout figures.

### Level 2 — `apparatus` — one deliberate click

Reached from a named control (`.cx-more`) or a deep link. The apparatus column is **reserved**, and
the plate is drawn beside it — never underneath it.

Adds: the byline ("Ask these three of any imperial map" and "Three things wrong with this
rendering"), the legend's counts and route into the full key, the map's other readings
(P projection, S stitching, W weight, H silences), the per-decade density row.

### Level 3 — `deep` — not a stage, a surface

The **rail**: the dossier (a territory) and the **sheet** (`ask:sheet`). Reached by a named control
at any level, at any time. Everything long lives here: the 14-form key, the historiography drawer,
the full change list for a year, the rate rail, the source apparatus, the prediction questions.
Guaranteed ≥ 280 px and its own scroll.

**One teaching panel, and one year.** There are exactly two exclusive surfaces — the rail
sheet and the two-plate comparison — and the shell arbitrates between them, because the
round-2 verdict reached a screen carrying three dates at once: 1655 in the lede, 1900 on the
timeline and legend, 1914 on the compare map. Two rules, both in `app/js/chrome/index.js`:

* **Opening one closes the other.** P18 and P06 each already stand down for the other; what
  neither could do is put the reader back. A student four beats into the lesson who presses
  `v` had their beat panel closed under them. The shell keeps the displaced surface — the
  node itself, with its listeners and its content — and restores it when the comparison
  closes. Nothing is re-rendered.
* **The comparison exists only while `state.compareYear` is set.** That value is the shell's
  own state and it round-trips through the address, so a pair of labelled plates drawn while
  it is null is a surface asserting a year the app does not hold. A backstop, not the
  mechanism.

---

## 4. WHAT IS CUT FROM FIRST PAINT, AND WHERE EACH THING GOES

Nothing is deleted. Each row is a sequencing decision with a destination.

| Cut from second zero | Reappears | Why there |
|---|---|---|
| "ASK THESE THREE OF ANY IMPERIAL MAP" + "Three things wrong with this rendering" (90 words, 396×154 on the map's left flank) | **`apparatus`**, and inside the guided path at DIDACTIC §8 00:16–00:18 and 00:27 | §8 is explicit that M4's answers are delivered there "because it now means something". You cannot repair a misconception the reader has not had yet. |
| The legend's head, figures line, "+n more colours" note and "Open the full key" | **ribbon → `apparatus` → the sheet** | The swatches and their names are the minimum needed to read the plate. Counts, areas and the 14 legal forms are a reference work; they go in the sheet, beside the map, at full height. |
| The definition dial's 43-word gloss, its figures, its caveats | **`apparatus`** | It was clipped mid-word at every viewport measured. A sentence cut mid-word teaches nothing. |
| The dial itself (1 / 2 / 3 / 4) | **`working`** | It is the best single idea in the app and it needs something to change. At second zero there is nothing to compare it against. |
| The change-card deck (4–5 cards, ~130 words, its header line, "open the other 8 →") | **the lede band** (the one card that matters, as one sentence with a `→`) **and the sheet** (all of them) | Measured: with the deck in flow `.tl` asks for 255 px of a 140 px region and the year axis prints through the cards. Four cards each showing 40 % of a sentence is four half-thoughts. |
| The rate rail, its caption, the ±1945/1947 flags, "Guess the widest year first →" | **the sheet**, reached from the lede after a played sweep; the prediction belongs at §8 00:23:30 | Two charts of one axis 60 px apart is split attention by definition. Its finding — "half in 123 years, half out in 28" — is **promoted**: it is now the opening sentence, at 19 px. |
| The per-decade density row (8 px numerals) | **`apparatus`** | 8 px is below `--fs-micro`, which DESIGN.md §3.1 calls the floor. |
| Six of eight transport buttons and the speed selector | **`working`** | Play and one step each way is the whole contract at second zero. |
| The spine caption ("One engine: the imperial empire…") and the coverage tracker | **the lede band** (the caption, at 19 px, as the phase clause) and **the close** (the tracker) | The caption was the only narrative sentence on screen and it was the one sentence clipped by the bottom of the window. It is now the largest text on the page. |
| The "account disputed — why?" chip | **`working`**, opening into the **sheet** | It opened into a 1 px box. Contestation is interesting once you hold a position. |
| P / S / W / H mode chips | **`apparatus`**, then to specific moments (W at the population question, H at a year where a record was destroyed, P at the projection reveal) | Four alternative readings before the first reading has been read is four ways to be lost. `H` at 1900 reports "none at 1900". |
| The default year of 1900, arrived at without explanation | **unchanged, but no longer the whole story**: the focal control at second zero sweeps 1600→1997 in thirty seconds before the reader does anything else | §8 00:02–00:05 asks for exactly this. |

---

## 5. THE SINGLE VOICE — the shared chrome classes

`app/css/chrome.css`. Adopt these and delete your own. Before this pass one screen carried
**27 box treatments, 5 border-radius values, 2 border styles, 8 different "there is more"
affordances, 3 headings for one job and 37 typographic registers.**

| Class | What it is | The rule |
|---|---|---|
| `.cx-panel` | any bordered block | `--surface-panel`, one `--rule-fine` hairline, **square** (`--radius-none`), `--space-lg` padding, **no shadow**. `--float` adds `--shadow-panel` and is only for a surface the reader just opened. `--tight`, `--plain` are the only other variants. |
| `.cx-panel__head` | the eyebrow that names a block | sans, `--fs-micro`, uppercase, `--tr-caps-wide`, `--text-min`, hairline under. **The only eyebrow.** |
| `.cx-panel__title` | a panel's heading | serif, `--fs-h4`, `--w-semibold`. **The only serif heading inside a panel.** There is no third rank; if you need one you need two panels. |
| `.num` (base.css) | any inline figure | mono, tabular. Already the law in DESIGN.md §6.2. |
| `.cx-fig` / `.cx-fig__v` / `.cx-fig__l` | a display figure | value in mono at `--fs-h3`, label in sans `--fs-micro` beneath. `--sm` for `--fs-base`. `--none` prints an honest "no figure" in italic sans. **These two are the only ways a number may look.** |
| `.cx-src` / `__kind` / `cite` | a citation | hairline above, kind in small caps micro, title in italic, date in `.num`. Despatch, testimony, database and monograph all look the same. |
| `.cx-ask` / `__eyebrow` / `__q` / `__choices` | a question to the student | 3 px admiralty-blue rule on the leading edge, question in serif at `--fs-prose`. **One treatment, everywhere** — dossier, tour, quiz, timeline — so a reader learns it in one encounter. |
| `.cx-more` | "there is more here" | sans `--fs-caption`, `--w-semibold`, `--accent-ink`, trailing `→`. No pill, no dash, no border, no box. `[aria-expanded=true]` flips the arrow. **It replaces all eight of the old affordances.** |
| `.cx-note` / `--warn` | an editorial aside or caveat | sans `--fs-caption`, `--text-secondary`. The app's honesty affordances all look like this and nothing else does. |
| `.cx-sheet` + `__head` `__eyebrow` `__title` `__close` `__body` | the rail sheet | rendered by chrome; you supply the body node. |
| `.cx-lede` `__mark` `__say`, `.cx-cta` | the one-sentence band | **shell only.** No piece renders into the band directly or renders a `.cx-cta`. |

Type: **five font sizes on first paint, none below 12 px, at least one run at ≥ 17 px.** Rule V1 in
the test caps the screen at eight distinct sizes.

### 5A. THE MASTHEAD COLLAPSES RATHER THAN SCROLLS

Six modules put a control in the bar. On a wide window they fit on one line and nothing about
the masthead has changed: `.bar__tools` is `display: contents`, so the two strips are direct
flex children of `.app__bar` exactly as before. In the **sheet band** they do not fit.
Measured at 390×844 on the guided path:

| | measured |
|---|---|
| `.bar__slot--end` | asks for **317 px** of a 196 px strip |
| `.qz-open` ("Recall") | right edge at **x = 388** in a 390 px window — half of it off screen |
| `.brand__title` | truncated to **"The Bri…"** |
| `.ly-bar__open` | truncated to **"Laye"** |

The strips scroll sideways, which is what keeps `scrollWidth === clientWidth` and stops every
`position: fixed` surface in the app being laid out wider than the phone. It is not a route to
a control: a fifteen-year-old does not know a 46 px strip scrolls.

So the `chrome-end` strip — the six *entrances* to the app's other surfaces — becomes a panel
under the masthead, and one named control, `Tools`, is all that is left of it in the bar.
**Nothing is re-parented:** the mount slot keeps its parent, its modules, its listeners and
its `data-mount` identity, so no piece can be broken by it. Each control gets its whole label,
a 44 px target and one left edge. It closes on Escape, on a press inside it, on a pointer
outside it, and when the bar stops overflowing; focus goes in and comes back out.

**`toolbar` is never collapsed.** Back and Next are not tools, they are the lesson: under
62 rem P05 docks its transport over the plate itself, and above it the transport is in this
slot, so `toolbar` stays a direct child of the masthead at every width. Collapsing both strips
was tried first and it put Back and Next behind a menu at 1024×640 — measured, and caught by
`budget-working.js` rule W4 before it could ship.

**And the trigger is measured, not a breakpoint.** A width alone cannot answer "does the
masthead fit", because its contents change with the lesson: at 900×700 the bar holds eight
controls and fits; at 1024×640 it holds eleven — because 1024 is above 62 rem, so the path's
transport is in the bar too — and it does not. Measured at 1024×640 mid-lesson, before this:
the wordmark cut by 49 px and the Teaching desk entry running from x = 978 past the right edge
of a 1024 px window. `app/js/chrome/index.js` sums the bar's contents whenever the bar is not
stacked, compares that against the room, and keeps a 24 px hysteresis so a dragged window does
not oscillate. The sheet band stacks unconditionally as well, set before any control has
mounted, so a phone is right on its first paint rather than one frame later.

Two rules in `chrome.css` §E belong to it: P10 and P02 reduce their control to a bare glyph in
this band, which is right in a 46 px strip and wrong in the panel it becomes, and P07 does the
same to its search door. Each is restored inside `#app[data-tools="open"]` only.

The panel is at `calc(var(--z-modal) + 8)`, and `.app__bar` is raised to match while it is
open. `--z-modal` alone is not enough: `.app__overlay` is exactly that value and comes later
in the document, so the map's zoom buttons, the path's transport dock and the pinned colour
key printed straight through the panel.

**And rule B5.** An open panel covers part of the plate, which B5 forbids — of *apparatus*.
B5 exists so that four explanatory panels cannot stand on the map while the reader is trying
to read it; this is a menu the reader opened with one press that closes on the next, on
Escape, on a pointer outside it, on any control inside it, and whenever a sheet opens. It
cannot be left standing, it is `display: none` at second zero, and `budget.js` measures the
plate with it closed because that is the state the plate is actually in.

Vocabulary: `claimed` carried three different meanings on one screen and `unit` was counted four
times without ever being defined. One noun, one meaning, one place. The definition of a *unit* and
a *territory* belongs in the sheet, once, linked from the ribbon.

---

## 6. THE FOCAL PATH

**At second zero there is exactly one obvious next thing: press `Watch it happen`.**
It sweeps 1600 → 1997 in thirty seconds with one clause per phase in the lede band, then leaves the
reader at 1997 at level `working`. Under `prefers-reduced-motion` it becomes four held plates
(1600, 1783, 1900, 1997) at 2.2 s each. It is `bus.emit('ask:sweep')`; the timeline may take it
over at any time by answering that event.

**How it is signalled without a tutorial overlay:** `.cx-cta` is the **only** filled, madder-red
control that may exist in the viewport, and the shell renders it. **Loud only at second zero.**
Round 3: the sweep has been superseded as the opening offer by onboarding's *"Start the lesson ·
40 minutes"*, and every piece-supplied control was drawn quiet — so the cold plate had no filled
control at all and the focal path was signalled by nothing. The line is the register, not the
owner: at `plate`, with nobody urgent speaking (the shell's own band is priority 1, onboarding's
hook is 30, content starts at 38), the band's control **is** the focal path and is drawn as one.
Everywhere else it is quiet, so there is still never more than one filled control on screen —
`tools/scenarios/shellr3-focal.js` counts them, and inside the lesson the one filled control is
P05's `Next`, which is the correct answer to "what is the next thing to do".

**And the red button points at the sentence above it, or at nothing.** Measured at 900×700 on
`#tour=thirty&step=5`: the band read *"THE COMPLICATION — One fact here damages what you were
just told. Place it to go on"* and the one filled control read *"Watch it happen · 30 seconds"*.
The sweep stands down whenever anyone else is speaking, whether or not that speaker supplied a
control of its own, and whenever a lesson is running. Everything else on the screen is
ink on paper. **Where it sits in the tab order, measured rather than asserted.** This paragraph used to name
a number — "tab stop 3, after the two skip links" — and the number stopped being true as pieces
put controls in the masthead, which precedes the band in DOM order and should. Measured on the
cold plate: stop **4** in the sheet band (skip, skip, `Tools`, the control) and stop **7** above
it (skip, skip, the path's escape, Taken → left, Recall, Teaching desk, the control). The number
was never the contract. The contract is **the focal control is reached before the plate, the year
and the ribbon** — the definition dial, the app's best idea, was once tab stop **37**, behind the
entire time bar — and that is what rule **R** of `shell-accept.js` asserts, at every viewport,
along with **R2**: every stop shows a focus ring.

**After that, the next obvious thing is always in the same place.** The band is a channel:

```js
bus.emit('ask:say', {
  id: 'timeline:change',            // your key; re-emit to replace, text:null to clear
  priority: 40,                     // 1 shell default · 40 content · 50 a moment · 60 the sweep
  mark: '1 September 1900',
  text: 'Britain annexed the Transvaal after invading in October 1899 over the voting rights of foreign miners.',
  cta: { label: 'The rest of this account', emit: 'timeline:openAccount', payload: { id: 'transvaal' } },
});
```

The highest-priority sentence wins; equal priority, newest wins. Its `cta` becomes the band's one
control (quiet) while it is up. Only `<strong>`, `<em>`, `<b>`, `<i>` and `<span>` survive
sanitising. **This is where "the rest of this account →" belongs**, and it is why the app now has
one voice: every piece writes into one sentence slot in one type size in one place.

---

## 7. WHAT EACH PIECE MUST CHANGE

`app/css/chrome.css` §E is a **transitional shim** that enforces everything below from outside.
Each block names the piece that owns the real fix. **Delete your block when you have internalised
your rule** — and the acceptance test must still pass afterwards.

### P02 — the map (`app/js/map/`, `app/css/map.css`)

Your rectangle is now guaranteed: nothing overlaps `.stage__map`, and at 1366×768 it is 1366×462
with the rail closed. Three things. **(1) Fill it.** Rule B6 fails at 1024×640 (70 %), 1440×900
(71 %) and 390×844 (35 %): the drawn plate keeps a margin the shell is no longer charging you for.
Fit to the container, and on viewports under 62 rem zoom-to-fill and crop the Pacific rather than
letterbox a 390×165 strip into a 390×476 plate. **(2) Get the furniture off the plate.** You
compress yourself around `.map__furniture`, so its width is paid for out of the map: measured with
the dossier open, a 324 px rail cost the plate 324 px and the drawn map fell to 714×301. The shell
has capped `.map__rail` at 15 rem as a stopgap. The definition dial is a *control over the whole
map*, like the year — make it a horizontal four-segment control in the ribbon strip or in the rail,
not a 300×340 panel standing on the Atlantic; and put P/S/W/H behind one `.cx-more` labelled
"Other ways to draw this", shown only at `data-stage="apparatus"`. **(3) Read `data-stage`.** At
`plate`, render zooms and nothing else; at `working`, add the dial; at `apparatus`, add the modes,
the figures, the gloss and the caveats. Emit `ask:stage {level:'working'}` when the reader changes
the definition. Move the gloss, the figures and "three things wrong with this rendering" to
`ask:sheet`. Never render a `.cx-cta`. `.map__caveat` and `.map__gloss` must never be clipped
mid-word again: if it does not fit, it goes in the sheet.

### P03 — the time control (`app/js/timeline/`, `app/css/timeline.css`)

Your region is now a hard **140 px at 1366×768** (124 / 152 / 164 / 184 at the others) with
`overflow: hidden`, and you are currently asking for 255 px of it the moment anyone presses `2`.
**Three strata leave the bar permanently**: the change-card deck, the rate rail and the spine's
caption/coverage foot. They are not deleted — the deck becomes `ask:say` (one card, one sentence,
one `cta` into the sheet, at priority 40, and *never* re-rendered during playback), the rate rail
becomes an `ask:sheet` surface reached from the lede after a sweep, and the spine caption is already
being spoken by the band at 19 px. **The drawer must go to the sheet.** It carries the fourteen
disputes and the app's only prediction question and it currently resolves to a 1 px box at y = 772;
`bus.emit('ask:sheet', {id, eyebrow, title, node})` gives it 410×716 with its own scroll, beside a
live map. The shell has lifted it into a fixed strip as a stopgap. **Render by `data-stage`:** at
`plate` only Play / −1 / +1 / the year / the axis / the four phase bands; add the rest of the
transport, the speed selector and the disputed affordance at `working`; the density row at
`apparatus`. **Play must not be a sixteen-minute video**: answer `ask:sweep` with your own scripted
30-second run and make that the first Play. Kill the header line ("12 acts dated 1900 · 6 change the
m… · 3 records dated here…") — it is bookkeeping about bookkeeping. Adopt `.cx-more` for
"the rest of this account", "open the other 8" and "account disputed"; delete the mustard pill and
the dashed pill. Finally, the axis must not reflow: rule B3 means your height is constant, so a
cursor over a tick stays over that tick.

### P17 — the legend (`app/js/legend/`, `app/css/legend.css`)

Your slot has moved. `data-mount="legend"` is now a **full-width strip along the foot of the plate**,
`--key-h` tall (28–34 px), and it is the only apparatus at `plate`. Render a **ribbon** there: the
swatches actually on the map this year, each with its word and its count, one line, no head, no
figures line, no "Open the full key" button. Do it in your own file — the shim is currently doing it
from outside with `#app .stage__key .legend { display:flex }`. **Render the ribbon on a phone too**:
`[data-mount='legend'][data-phone='true'] { display: none }` leaves a phone reader with eight
colours and no key, and re-hosting the colour band inside the byline does not survive the byline
being deferred. Everything else — the head, the figures, the counts, the km²/×Great Britain line,
the 14 legal forms, the marks, the criticism — goes to **`ask:sheet`**, where it gets 410×716 beside
a live map instead of `body:has(#legend-plate) .app { padding-inline-start: 40rem }`; delete that
rule, it is a second layout system. The byline (`stage-note`) renders **only** at
`data-stage="apparatus"`; its three questions are §8's 00:16 beat, not a greeting. Adopt
`.cx-more` for every route out of the ribbon and `.cx-panel` for the sheet's blocks. Define *unit*
and *territory* once, in the sheet, and link to it from the ribbon.

### P04 — the dossier (`app/js/panels/dossier/`, `app/css/dossier.css`)

**Delete the two `.app { grid-template-…; height: … }` blocks in `dossier.css`.** They are inert
now (rule B9) and they are how the stage row lost its budget twice; the floor you were defending is
stated once, in `layout.css`. Your column is unchanged in kind but it is now one of two surfaces
sharing one rail — do not assume you are the only thing in it, and read `#app[data-sheet]`. Then the
editorial work: **four things above the fold, ten behind one click each.** 9 777 characters and
5 698 px of scroll in a 519 px column is 8.3 screenfuls for one place, and the "13 sections" jump
menu is an admission that nobody reaches the bottom. Above the fold: the status, how it was taken
and from whom, how it ended, and the argument this place carries. **Promote "4 texts written at the
time" out of that scroll** — it is the strongest single asset in the application and it sits at
about 35 % depth of a side column. Adopt `.cx-ask` for every THINK/commit question (they are
currently the only assessable items in the app and there is no way to find them — a list of them,
in the sheet, would be a teacher's homework); `.cx-src` for every citation; `.cx-more` for every
"more ↓"; `.cx-fig` for every display number; `.cx-panel` for every block. Publish the fold: when
the reader selects a territory, emit `ask:say` with that place's one sentence so the band answers
immediately even before they read.

---

## 8. Amending this file

Propose a diff with the measurement that motivates it, taken from the running app at the viewport in
question, and re-run `tools/scenarios/budget.js` at all five viewports plus `--dark` and
`--reduced`. A rule may be relaxed. It may not be quietly ignored from a component stylesheet.
