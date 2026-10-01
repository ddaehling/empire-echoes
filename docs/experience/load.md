# LOAD AUDIT — cognitive load, hierarchy and pace

**Auditor:** a fresh pair of eyes. Built none of this, owes it nothing.
**Judged against:** rubric **C12** (cognitive load, access and pace, weight 3) and **C11**
(narrative coherence and voice, weight 5), DIDACTIC_SPEC §8 (the 30-minute lesson),
DESIGN.md §1 and §3.1.
**Method:** the real running app, driven headlessly at 1366×768, 1440×900 and 390×844.
Every number below was measured in the DOM or read off the pixels. Nothing here is an opinion
about code I read; it is what the browser painted. Scenarios in
`/private/tmp/.../scratchpad/sc/load-*.js`, screenshots alongside.

---

## 0. The measurements, first

| | **1366×768** | **1440×900** | **390×844** |
|---|---|---|---|
| Interactive controls on first paint *(excl. map polygons)* | **80** | **100** | **52** |
| Words of text on screen at second zero | **676** | **1 161** | **420** |
| Map drawing area (the SVG) | 704×297 px | 758×320 px | ~390×176 px |
| **Map's share of the viewport** | **19.9 %** | **18.7 %** | 20.9 % |
| Time bar height | 321 px = **41.8 %** | 391 px = **43.4 %** | 588 px = **69.7 %** |
| Distinct typographic registers *(family × size × weight × style × case × tracking)* | **37** | — | — |
| Distinct box / border / shadow treatments | **27** | — | — |
| Simultaneous competing text blocks (≥ 5 own words) | **36** | — | — |
| Truncated or clipped text elements | **13** | — | — |

Three of those numbers are the whole diagnosis.

**One.** The map is **19.9 %** of a school laptop screen and the time bar is **41.8 %**.
The control for time is physically larger than the thing it controls (321 px vs 297 px of
map). §8 says *"the map never disappears… all new information attaches to one persistent
spatial object. This is the app's single biggest schema advantage over a book."* At 946×361
of allotted stage, 704×297 of actual map, that advantage has been spent.

**Two.** Give the app **132 more pixels of height** (1366×768 → 1440×900) and the map's share
of the viewport goes **down**, 19.9 % → 18.7 %, while words go **676 → 1 161** and controls
**80 → 100**. Every additional pixel is consumed by apparatus. That is not a layout that is
short of room; it is a layout with no editor.

**Three — the one that decides C12.** On first paint at 1366×768, **exactly seven visible
elements are 14 px or larger**, and every one of them is a brand name, a numeral or an arrow
glyph:

```
19px  Source Serif 4   "The British Empire"     ← the masthead
27px  IBM Plex Mono    "1900"                   ← a numeral
16px  Source Sans 3    "+"   "−"                ← zoom glyphs
14px  Source Sans 3    "⇤"   "⇥"   "◻"          ← transport glyphs
```

**Not one word of history on the default screen is set above 13 px.** Six hundred and
seventy-six words, all at 12–13 px. DESIGN.md §3.1 declares `--fs-prose` 17 px "**the reading
size**", `--fs-lede` 19, `--fs-h4` 22, `--fs-h3` 27, `--fs-h2` 33, and "nothing below 12px
exists". The default screen uses the floor and the floor+1 and nothing else. The type scale
this project built and proved is, on the screen every student actually sees, **entirely
unused**. The atlas prints its entire argument at footnote size.

That is what a wall is. It is not that there is too much content — the content is superb.
It is that **everything has been demoted to the same rank, so nothing is first.**

---

## 1. The five worst moments

### 1.1 Clicking a country — the most natural first action — collapses the app

Click Egypt at 1366×768. Measured, before → after:

| | before | after |
|---|---|---|
| map SVG | 704×297 | **519×219** |
| map share of viewport | 19.9 % | **10.8 %** |
| words on screen | 676 | **2 408** |
| controls inside the dossier alone | — | **50** |

Three things break at once, and I have the pixels for each:

- **The map's own control rail is ejected from the map and lands on top of the legend.**
  `.map__furniture` becomes 956×132 at y = 285; `.stage__legend` is 396×159 at y = 222.
  Measured intersection: **38 016 px² — 60 % of the legend's total area.** The colour key
  (`.legend__key`, y 292–336) is **entirely inside** the furniture rectangle. The map's
  control panel covers the map's colour key.
- **A sentence is sliced horizontally through the middle of its letters.** The gloss
  "*Everywhere Britain said was hers — from a governor with an army to a resident with a
  treaty and no garrison. Places Britain*" is cut in half by the stage boundary at y ≈ 417 —
  not ellipsised, not faded: the glyphs are chopped through the x-height. (See
  `out06/crop-legend.png`.)
- **The dossier itself is cut mid-word** at the viewport bottom ("…showed that Britain could
  no longer act").

A student clicks a country to find out about that country, and the map they clicked into
shrinks to a tenth of the screen while 2 408 words arrive.

### 1.2 First paint: 80 controls, 676 words, and nothing bigger than 13 px

Three panels compete across the top of a 361 px stage:

- **top-left, 396×154:** "ASK THESE THREE OF ANY IMPERIAL MAP" — a numbered interrogation of
  the map's own honesty, 90 words, plus a red link "Three things wrong with this rendering";
- **top-left below it, 396×159:** "How to read this map", counts, four of fourteen colours,
  "+3 more colours (11 units) in the full key", a bordered "Open the full key";
- **top-right, 300×130 + 200×200:** `"British"` with a 2×2 definition grid, a 43-word gloss
  clamped to three lines with an ellipsis, then eight further chips.

Between them, in the middle, is the map — 704 px wide, at which width its own labels collide
("Bengal Presidency" over "Madras Presidency", "The North-West Territories" over "Quebec")
and Punjab, Sindh, Ceylon, Barbados, Guernsey and Jersey are not drawn at all.

Then, below: 8 transport controls, a speed `<select>`, a 4-card prose deck, a 38-stop tick
rail, a second chart of the same time axis, a 36-word caption, and a phase band.

**Reading order is undecidable.** There is no first thing. C12 anchor 3 requires "well-paced,
low extraneous load"; anchor 5 requires "effort is spent on the history, never on the
interface." A student's first sixty seconds here are spent entirely on the interface.

### 1.3 Press Play, and four prose essays rewrite themselves once a second

Measured at 1× during playback: **four `.tl-chg__card`s, each carrying a 16–28-word account,
are re-rendered on every year tick.** Simultaneously the byline value changes
("1900 exactly" → "1901 exactly"), and six numbers in the legend flip
(132→126 territories, 25→28 million km², 109×→122× Great Britain, 94→96, 46→44, 182 units).
The map animates underneath.

At 1 fps, a 25-second sweep pushes roughly a thousand words of unreadable prose past the eye
while the one thing a student is meant to watch — the map changing colour — is 19.9 % of the
screen and in a different quadrant from every moving number.

It also **breaks its own layout**: during playback the change cards overflow their band and
paint on top of the timeline axis; the Queensland card's tail ("*the same act as Western
Australia (Commonwealth of Australia), in…*") is drawn across the tick marks and the card
borders cut vertically through the axis. (`out07/02-play-1.png`.)

There is no version of this in which the prose is read. It is not slow enough to read and not
quiet enough to ignore.

### 1.4 "FOLD" — the only visible relief valve — gives the map nothing and adds 95 words

Measured before → after clicking **Fold**:

```
map SVG        704×297   →   704×297     (identical)
map share      19.9 %    →   19.9 %      (identical)
apparatus      396×337   →   396×337     (identical)
words on screen   676    →   771         (+95)
```

What actually happens (`out08/01-folded.png`): the **entire colour key disappears** — the one
thing that tells a student what red, pink, blue and green mean — leaving a dead
"HOW TO READ THIS MAP" button and roughly **250 px of blank paper** in the most valuable
column on the screen. The 90-word interrogation panel above it is untouched. The map does not
reflow by one pixel.

The app's only decluttering control throws away the legend, keeps the essay, and widens
nothing.

### 1.5 The through-line — the sentence that makes this a story — is clipped off the bottom edge

`.tl-spine__caption` reads: *"**One engine: the imperial empire.** Industrial output needing
markets, steam and telegraph shrinking distance, strategic fear about the routes to India, and
rivalry with France, Russia and Germany."*

That is the C11 spine. It is DIDACTIC_SPEC §2.1's "one story", stated in the app's best
voice. Measured position at 1366×768: **top = 758, bottom = 790, viewport height = 768.**
Ten of its thirty-one pixels are on screen. Alongside it, also clipped:
`.tl-spine__seen` ("Not yet looked at: Atlantic 1585–1838, Company 1600–1858, Dissolution
1942–1997 · years visited: 1 of 314 that carry a record") and the four phase-lane names
(`.tl-lane__name` × 4, all `overflow: hidden`).

On the commonest school laptop in the world, **the one sentence that turns this from a
database into a narrative is the one sentence you cannot read** — while paying full rent for
its pixels. C11 and C12 lose together, in the same 32 px.

*(Honourable mention, mobile.* At 390×844 the page does not scroll — `scrollHeight` =
`innerHeight` = 844 — and 180 px of it, **as much vertical space as the map itself**, is spent
on five bare letter chips **P S W H E** and three glyphs **+ − ◻**. They are keyboard-shortcut
badges. The device has no keyboard. Above them the definition gloss is cut mid-word with no
ellipsis: *"…to a resident with a treaty and no"*. And the byline + colour key are present in
the DOM at z-index 20 over the map, marked `visibility: visible; opacity: 1`, announced to
screen readers, hit-testable at (120, 90) — **and not painted**. A phone user sees eight
colours and no key.)*

---

## 2. What is genuinely excellent — and it is a lot

I am here to cut, so let me be exact about what must survive the cut intact.

**The prose is the best thing in the project.** It does what BRIEF says and almost nothing
else on the web does:

> *"The Orange Free State had no gold and no quarrel with Britain, but it had a treaty with
> the Transvaal, honoured it in October 1899, and was annexed."*

> *"Britain finally accepted a protectorate over Niue after ignoring petitions from its kings
> for twenty-one years."*

> *"Evelyn Baring, Lord Cromer, held no Egyptian office and ruled anyway."*

Named agents, no euphemism, no passive hiding, 15–25 words. Voice guide §7.1 satisfied
without effort. **This is worth building a whole interface around — which is exactly the
argument for showing one of them at a time instead of five at 12 px.**

**One sentence in the app is worth the entire rest of the screen:**

> *"Half of it was taken in 123 years (1778–1900); half of it went in 28 (1941–1968)."*

That is a C2/C9 sentence a student will still have in ten years. It is currently 13 px, on
line two of a caption, under a second chart, 985 px down the page.

**The four-way definition switch** (claimed / administered / controlled / influenced) is the
best software-only idea in the artefact — FEATURE_SPEC Move 1, made real: hold the year, change
the meaning of "British", watch the map change. It deserves to be the app's headline
interaction. It is currently a 2 × 2 grid of 12 px chips in a corner, tab stop **37**.

**The uncertainty ticks** are C4 and C10 gold: *"1874–1882: 9 years this atlas cannot settle,
15 reasons in all."* An atlas that publishes the years it cannot settle is doing something
almost no coursebook does.

**The Enlarge state proves the team knows what good looks like.** Press `E`
(`out05/01-after-E.png`) and the map becomes magnificent: ~66 % of the viewport, thirty-plus
place names legible, Punjab and Sindh and Ceylon and Barbados and the Bailiwick of Jersey all
readable, the hatching doing its tier-B work, the palette singing. It is a printed plate come
alive, exactly as DESIGN.md §1 promises. **The app's own markup calls that button
`is-urgent`.** The design is begging the user to press E. The good state already exists and is
one keypress away, hidden behind a letter.

**The accessibility scaffolding is real, not claimed.** Every polygon carries a sentence-long
`aria-label` with status and control degree ("*Yukon. Crown colony. Control degree 5 of 5.
held since 1821.*"), roving tabindex, two skip links, live regions, a `<noscript>` that tells
the truth. Cold load ≈ 3.7 s, **zero console errors, zero page errors, zero failed requests**
across every scenario I ran, at three viewports, light and dark.

**The palette work holds up under the pixels.** Ten flat fills, proved to a stated two-tier
ΔE00 standard, with genuinely different engraved textures on the tier-B pairs — legible in the
screenshots at Enlarge, and honest about the ceiling on the specimen page rather than hiding
it.

None of this needs to be deleted. All of it needs to be **sequenced**.

---

## 3. What to remove from first paint — ranked

Ranked by (pixels reclaimed × attention reclaimed) ÷ pedagogical cost of deferring.

**Target budget for second zero:** map ≥ 55 % of viewport, ≤ 12 controls, ≤ 120 words,
≤ 8 type registers, ≤ 6 box treatments, **one** sentence above 17 px.

| # | Remove from first paint | Cost now | Why it must go |
|---|---|---|---|
| **1** | **The change-card deck** — 4–5 cards, ~110 words, plus its header line and "open the other 8 →" | 5 controls, 110 px tall, ~130 words | Cannot be read while playing (rewritten every second) and cannot be read while still (clamped to two lines, all four cut mid-sentence). It is five essays competing for one reader. |
| **2** | **The rate rail** — the second chart of the same time axis, its 36-word caption, "Guess the widest year first →", and the four floating callouts (+36 1945 / −45 1947 / 123 yr / 28 yr) | 5 controls, ~90 px, 50 words | Two charts of one axis, 60 px apart, is the definition of split attention. And "Guess the widest year first" **is a [PREDICT]** — §8 puts that prediction at 00:23:30, not 00:00. |
| **3** | **The three-question interrogation panel** ("ASK THESE THREE OF ANY IMPERIAL MAP" + "Three things wrong with this rendering") | 1 control, 396×154 px of the map's left flank, 90 words | This is M4 misconception repair, and §8 is explicit that its answers are delivered at 00:17 and 00:27 **"rather than at the start, because it now means something."** Right now it criticises a map the student has not yet looked at. You cannot repair a misconception the student has not yet had. |
| **4** | **The map mode chips** — P Mercator · S Stitching · W Weight · H Silences · E Enlarge, with their key badges and "fills the window" | 5 controls + 5 badges, ~200×200 px | Five alternative readings of the map offered before the default reading has been read once. On mobile these are letters for keys the device does not have, occupying as much height as the map. |
| **5** | **The 2×2 definition grid as a permanently-open panel**, and its 43-word ellipsised gloss | 4 controls, ~300×230 px | Keep the *idea* — it is the best thing here. Kill the *panel*. One line ("British here means **claimed** — change") and the four-way choice on demand. |
| **6** | **The legend's numeric apparatus** — "25 million km² ≈ 109× Great Britain · people — no figure", "+3 more colours (11 units) in the full key", the MARKS row, "Press 2 — administered: 126 units, 41 % of the land" (1440 only) | up to 11 of the legend's 17 controls at 1440 | Keep the swatches and their names. Everything else is a table pretending to be a key. |
| **7** | **The duplicated count line.** "182 units · 132 territories · claimed" is printed **verbatim twice**, 300 px apart, in two different type treatments — once by the legend, once by the timeline | 1 block, ~10 words | Pure redundancy. The legend owns counting; the timeline owns the year. |
| **8** | **Six of the eight transport controls** (⏮ ⇤ −1 +1 ⇥ ⏭ + speed `<select>`) | 8 → 2 controls | Play and one step. "Jump to the next year that moves most of the map" is a superb affordance and belongs in the scrubber's own keyboard contract (Shift+Arrow, already implemented and already announced), not as two more identical grey squares. |
| **9** | **The 90-word screen-reader keyboard preamble**, read before any content | first thing a SR user hears | Eleven shortcuts before one fact of history. One line, then a shortcuts panel on demand. |
| **10** | **The progress meter** — "Not yet looked at: Atlantic 1585–1838, Company 1600–1858, Dissolution 1942–1997 · years visited: **1 of 314**" | 20 words | A discouragement counter at second zero. It tells a student who has done nothing wrong that they have seen 0.3 % of the thing. |
| **11** | **"account disputed — why?"** as a standing mustard pill (it relabels itself to "dates disagree — why?" as the year changes, so it can never be learned) | 1 control | Merge into the one house treatment for "there is more" (see §5). |

Removing 1–11 reclaims, at 1366×768, roughly **200 px of the time bar** and **the whole
left column**, which is the difference between a 19.9 % map and a ~55 % map — i.e. between
this and the Enlarge state that already exists and is already beautiful.

---

## 4. What to defer, and until when

Nothing above is deleted. Each has a beat in §8 where it lands harder than it does now.

| Deferred | Reappears | Why there |
|---|---|---|
| The three-question interrogation ("what projection / what colour / what year") | **§8 00:16–00:18**, at the status recolour, and **00:27** at the projection reveal | §8 says this in so many words: delivered there "because it now means something". Answer #1 (projection) is literally scheduled for 00:27. |
| "Three things wrong with this rendering" | **00:00** as *one line of copy*, per §8's hook: *"This map is a poster. Three things about it are misleading. You'll find all three in the next half hour."* Then the three are paid off at 00:17, 00:18 and 00:27 | It is already written as a promise. Let it be a promise instead of a table of answers. |
| The rate rail + "Guess the widest year first" | **00:23:30**, the scheduled [PREDICT] — "When was the empire at its largest?" | It is that prediction. It is currently sitting 23 minutes early with the answer (+36 1945, 123 yr / 28 yr) printed next to it. |
| "Half of it was taken in 123 years; half of it went in 28" | **Promote, don't defer** — this is the standfirst. One sentence, `--fs-lede` 19 px, directly under the map, replacing all three top panels | It is the best sentence in the app and the closest thing to a through-line the student currently meets. |
| The change-card deck | On a **deliberate stop**, not on every year: one card for the single most consequential act, the rest behind the existing "open the other 8 →". Never during playback | Prose and animation cannot share a second. |
| The four-way definition switch | **00:16–00:17**, Egypt's four legal labels — the beat it was designed for. Before that, one line of state | Move 1 needs a place whose label it can change. Egypt is that place, at minute 16. |
| P / S / W / H (projection, stitching, weight, silences) | Behind one control, "**Other ways to draw this**", after the first status recolour (00:18). `H` (silences) belongs with the archive beat; `W` (people not land) belongs at 00:23:30 next to the population question | Four alternate encodings before the first encoding is understood is four ways to be lost. |
| The legend's numbers (km², × Great Britain, unit counts) | The **close, 00:29–00:30**, and the dossier | C9 numbers land when there is something to compare them to. At second zero "25 million km² ≈ 109× Great Britain" is a number about nothing. |
| The spine band + "One engine…" | **Promote to the top**, 00:02–00:05 per §8 ("The four-colour band appears beneath the map"). It must never again be the thing clipped by the viewport | It is C11. It is currently the only thing on screen that is *off* screen. |
| "years visited: 1 of 314" | The **close**, as an invitation ("you have seen 40 years; here are the ones that would surprise you") | Same data, opposite emotional sign, and it earns its place once there is progress to report. |

---

## 5. One voice, one vocabulary — the C11 half of the problem

Four teams wrote four vocabularies. On a single screen:

**"claimed" carries three different meanings at once.**
1. a threshold — "claimed — degree 1+, not informal" (byline);
2. the same string again, verbatim, 160 px away (legend rule line);
3. one of four toggle states — "1 claimed" (map rail);
4. a suffix on a count — "182 units · 132 territories · claimed" (timeline).

**"unit" is the app's core counting noun and is never defined.** It appears four times on
first paint ("182 of 302 units", "182 units", "+4 units", "11 units") before any screen says
what a unit is or how it differs from a "territory" — which is counted separately, in the same
line, at a different number.

**Eight different visual treatments say "there is more here":**

| Wording | Treatment |
|---|---|
| "Three things wrong with this rendering" | red underlined link |
| "Open the full key · two columns, the map narrows" | red-bordered box, centred serif |
| "more ↓" | grey centred link on a gradient fade |
| "the rest of this account →" (×4) | red arrow link |
| "open the other 8 →" | grey arrow link beside a mono counter |
| "account disputed — why?" | mustard pill, 999 px radius |
| "Guess the widest year first →" | dashed pill |
| "+3 more colours (11 units) in the full key" | grey italic — **not a control at all** |

Eight signals for one idea. A student cannot learn the interface's language because it does
not have one.

**Three headings for one job:** "What is the colour measuring?" (byline) · "How to read this
map" (legend title) · "WHAT THE COLOUR MEANS · 14 legal forms" (legend, 1440). Plus a fourth,
"COLOURS", directly beneath the third.

**Three self-criticisms stacked in 250 px:** "Ask these three of any imperial map" ·
"Three things wrong with this rendering" · "…the marks and **the criticism**".

**And "1900" is printed six times** on one screen, in six treatments: `1900 exactly` (13 px
mono), **1900** (27 px mono), `1900` in the rail header (14 px mono), "12 acts dated 1900",
"1900: +4 units · 1900s: +13 / −0", and the axis tick.

### Against the design system's own law

DESIGN.md §1 states the style is four rule weights and **square corners**. Measured on first
paint: **27 distinct box treatments**, **five** border-radius values (0, 1, 2, 3 and 999 px),
**two** border styles (solid *and* dashed), five border colours and three shadow recipes.
The 999 px pill and the dashed pill are both on screen at once, 200 px apart, meaning
different things.

**37 typographic registers** on one screen, 24 of them at 12 px. That is not four voices
harmonising; it is thirty-seven voices at the same volume.

---

## 6. Focus order — the invisible version of the same wall

Tabbing from the top at 1366×768, measured stop by stop:

```
 1–2   skip links (off-screen)
 3     a map polygon (Gibraltar)         — top of the screen
 4     the byline critic link            — top LEFT
 5–10  the legend                        — mid LEFT
11–36  the timeline: 26 consecutive stops — BOTTOM
37–40  the definition switch             — back up to top RIGHT
```

Three vertical round-trips of the screen before the tour is over, and **the single most
important control in the app — "what does the word *British* mean?" — is tab stop 37**,
behind twenty-six timeline stops. A keyboard user meets the app's best idea last, if at all.

---

## 7. The verdict, and the shape of the fix

The content here is better than the coursebook. The screen is worse than the coursebook,
and by a wider margin than the content is better — which is why C12 and C11 are where this
loses.

The fix is not a redesign. **The app already contains its own answer**: press `E`. In that
state the map is ~66 % of the viewport, thirty-plus places are legible, the palette does what
it was proved to do, and the plate looks like the printed atlas DESIGN.md promised. The team
built the right screen and then buried it behind a letter chip labelled `is-urgent`.

Make the Enlarge state **the default**. Give the map ~55–65 % of the viewport at 1366×768.
Under it, one sentence at 19 px — *"Half of it was taken in 123 years; half of it went in
28."* — and the phase band. Everything catalogued in §3 comes back on the beat named in §4,
one thing at a time, when it means something.

Nothing of pedagogical value is lost. It is only that a student meets it at minute 16 instead
of second zero, which is the difference between learning it and never seeing it.
