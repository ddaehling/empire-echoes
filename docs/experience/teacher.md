# Planning next Tuesday with this app

*A head of history walks the British Empire Atlas looking for a lesson. Mixed-ability Y10/Y11, 28
students, 60 minutes, one projector, a trolley of 1366×768 laptops, some phones. The printed
chapter (`docs/rival/CHAMPION.md`) is on the desk next to it.*

Everything below comes from driving the running app at `http://localhost:8777/app/` with Playwright
scenarios and reading the pixels: cold first paint at 1024×768, 1280×800, 1366×768, 1920×1080 and
390×844; keyboard-only traversal; playback; the full key; the dossier; the drawers; print media and
a real A4 PDF. No description of the app was taken on trust, including my own.

---

## 1. What I would actually put on the board at 09:05

I can build a lesson out of this. It is not the lesson the app thinks it is offering, and it takes
me about forty minutes of prep to assemble, because **nothing in the app tells a teacher what to do
with it.** Here is what survives contact with a real room.

**09:00 — Do Now, on the board, before anyone touches a device.** Project the app at `#year=1900`,
press **E** to enlarge the plate, and ask one question with nothing else on screen:

> *This is every place Britain called British in 1900. Two of these are the same colour and should
> not be: Canada and Nigeria. Why did Britain put them in the same box?*

Then press **2**, **3**, **4** in front of them and let the map change under the same year. The app
prints the line for you, live: *"Nothing was taken or given up in 1900. The word 'British' was
redefined, and 97 units cross the line. The map goes from 94 units to 191."* That is the best two
minutes in the product and it needs no worksheet. (Caveat below — pressing those keys visibly
breaks the layout, so I would do it *enlarged*, where the damage happens off-screen.)

**09:08 — Modelled explanation, projected, teacher reading aloud.** Click *Three things wrong with
this rendering*. You get three numbered paragraphs, recomputed from the year on screen:

> *"Of what is drawn at 1900, 29 units lie 40° or more from the equator and cover 11 million km²;
> 101 lie within the tropics and cover 13 million km² — 1.2 times as much ground, drawn smaller."*

That is a modelled explanation of projection bias with live arithmetic in it. No textbook can do
it. I would read it out, then press **P** and let them watch Canada shrink. Two minutes.

**09:12 — Task with a right answer.** Set `#year=1857`, select **Bengal Presidency**, and scroll the
dossier to *THINK, BEFORE YOU READ THE RECORD*:

> *"Britain partitioned Bengal once, in 1947." — true / false / not sure. Commit to an answer and
> the record opens underneath it.*

It is false (1905 and 1947), the commitment is forced before the reveal, and the reveal is a sourced
record. That is a proper hypercorrection item and the only assessable, right-answer task I found in
the whole app. There are a handful of others scattered in other dossiers. **There is no list of
them and no way to find them**, so I would have to hand-collect them the night before.

**09:20 — The one thing I would genuinely teach off this and nothing else.** Bengal's dossier
carries the revenue→sepoys→conquest loop as a *cause chip* with real citations:

> *"From 1765 the Company held the diwani… It spent that revenue on soldiers, and the soldiers took
> more territory, and the new territory paid more revenue. Revenue, sepoys, conquest, revenue: the
> loop is the mechanism of British India. Source: P. J. Marshall,* Bengal: The British Bridgehead*,
> 1987."* plus *"The Company's Indian army was around 250,000 strong by the 1850s and overwhelmingly
> Indian… Indian taxpayers bought the soldiers who took India. Source: Douglas M. Peers, 2006."*

Two sentences, two real books, one mechanism. That is a whole exam paragraph. I would project it and
have them write it out as PEE.

**09:32 — Homework.** `#year=1947` and `#year=1948` side by side, and: *"Count the units. Explain why
the number changes between these two years and why the map does not change on 15 August 1947."* This
is a good question **only because the app has a bug-shaped convention** (see §5). I would be teaching
around the tool, not with it.

**What I could not put on the board at all:** a starter the app runs itself; a sequence; a quiz;
a plenary; a printable; a revision sheet; a glossary; a mark scheme; anything I could set for a
cover lesson.

---

## 2. What is genuinely excellent — and there is a lot

I want to be fair, because the *content* here is better than the chapter in several places, and I
would be sorry to see it thrown away in the tidying-up.

1. **The prose is the best I have read in an educational interface.** "Elizabeth I gave 218 London
   merchants a fifteen-year monopoly of English trade east of the Cape of Good Hope." "Winston
   Churchill gathered about forty British officials at the Semiramis Hotel in Cairo and in twelve
   days settled…" "Britain finally accepted a protectorate over Niue after ignoring petitions from
   its kings for twenty-one years." Named agents, plain verbs, specific numbers, no euphemism. The
   voice guide in §7 of the didactic spec has actually been obeyed, string by string.
2. **The definition switch is the single best misconception device I have seen anywhere on this
   topic.** One year, four definitions of "British", 94 units to 191 units, and the app narrates the
   change rather than just performing it. This alone kills the pink-map misconception more
   convincingly than the chapter's opening section does.
3. **"Three things wrong with this rendering" is live, recomputed criticism of the app's own output.**
   It teaches map criticism using the map in front of you, with numbers that change when the year
   changes. Nothing in print can do it.
4. **The legend is a 14-form taxonomy of colonial legality with a control-degree number and a
   one-line definition each** — Crown colony deg 5, Protectorate deg 3, Protected state deg 2,
   Princely state deg 2, Dominion deg 1. That is a better key-terms section than the chapter's §2,
   and it is *sorted by how much power Britain actually had*, which is the analytic move.
5. **"Account disputed — why?" is real historiography**: 14 named live disputes for 1893–1901
   alone — the Durand Line and whether it lapsed in 1919 or 1947, Mat Salleh as bandit / resistance
   leader / trading chief on the same documents, the Jameson Raid. This is C10 at level 4–5.
6. **Uncertainty is handled honestly and everywhere.** "people — no figure." "no census or
   registration was possible during the blockade, and some researchers argue the upper figure is too
   high. The range is given rather than a…" The app refuses to invent a number and says so on the
   face of the interface.
7. **The rate rail is a genuinely new argument.** *"Half of it was taken in 123 years (1778–1900);
   half of it went in 28 (1941–1968). 370 units in, 345 out."* Asymmetry of acquisition and
   dissolution, in one sentence and one chart. I have never seen that taught.
8. **Silences and stitching exist as map layers.** "SMALL PLACES: one fixed size, not their area — 66
   at 1900" answers WHY_PRINT_WINS #4 head-on; the destroyed-record layer answers #7.
9. **`#year=NNNN` deep links work and are stable.** That is a page number. I can set it in a
   worksheet.
10. **It does not crash.** I mashed 45 keystrokes and a dozen clicks in 4 seconds and got zero console
    errors, zero page errors, zero failed requests, and a correct final state. That is rare and it
    matters in a room of 28.
11. **Press E.** Enlarged, the plate is 1107×467 and beautiful — Punjab, Sindh, Ceylon, British
    Burma, Rhodesia, Cape of Good Hope all legible from the back of a room.

---

## 3. The five worst moments

### 1. I clicked the app's own invitation and nothing happened — because the answer opened in a 13-pixel window five pixels below the bottom of the screen

`account disputed — why?` sits under the year, in yellow, begging to be clicked. Click it at
1366×768 and the screen is pixel-identical. Nothing moves. The button does not even take a pressed
state.

Measured: the click adds **4,694 characters** to the DOM. They go into `.tl__drawer`, whose box is
`[0, 772, 1366, 1]` — **y = 772 in a 768-pixel viewport**. Its scroll pane is 1334×**13** pixels and
holds **1,379 pixels** of content: fourteen named historiographical disputes, the best material in
the app.

Fourteen live scholarly controversies, rendered into thirteen pixels, positioned off the bottom of
the screen. A student clicks, sees nothing, and concludes the app is broken. They are not wrong.

### 2. Pressing "2" — the app's single best teaching move — visibly breaks the interface

Press any of `1 2 3 4` from cold at 1366×768. `.tl__changes` grows from 115px to 245px inside a
fixed-height 321px time bar, and overflows on top of everything under it. I measured **25 distinct
text-on-text collisions**, the largest 1074×127 pixels. The year axis "1200 1600 1650 1700 1750
1800 1850 1900" prints straight through the four change cards. "13 acts dated 1900" prints through
the density ticks. "HOW FAST, AND HOW MUCH" prints through the Transvaal card.

The content that appears is superb — *"THE WORD CHANGED, NOT THE MAP. Nothing was taken or given up
in 1900…"* — and it is illegible on arrival. The app's centrepiece rewards you by destroying itself.

### 3. Opening any panel guillotines the map to a 519×219 strip — and then draws a panel on top of it

The map canvas is **704×297** at 1366×768 to begin with: 20% of the viewport, for the thing the whole
product is named after. Open the full key, or select any territory, and it drops to **519×219**.

At that size the "ASK THESE THREE" apparatus panel is no longer *beside* the map, it is *on* it,
covering the Atlantic and the eastern seaboard. The legend's own COLOURS row is sliced in half by
its container's edge — two half-swatches, no scroll cue. And the "British" definition switch, pushed
below the map, has its explanatory sentence hard-clipped mid-word by the time bar:

> *"Everywhere Britain said was hers — from a governor with an army to a resident with a treaty and
> no garrison. Places Britain"*

Three separate clippings, all visible in one screenshot, at the commonest school resolution.

### 4. Three clicks put roughly four thousand words on a 768-pixel screen, and there is no path

I measured the text each control adds on one click: *Three things wrong* **+11,501 characters**;
*open the other 8* **+8,957**; *account disputed* **+4,694**. Twenty-five thousand characters —
about four thousand words — from three clicks, into a window in which the map has already been
reduced to a strip.

The Bengal dossier alone is **9,777 characters and 5,698 pixels tall in a 519-pixel-wide column** —
8.3 screens of vertical scrolling for one territory, with a "13 sections" jump menu because even the
authors knew nobody would find the bottom.

There is no first, no next, no last. Cold first paint already carries **23 distinct information
zones**: header, three imperial-map questions, "three things wrong", a fold control, four summary
statistics, a four-swatch colour key, a "+3 more colours" note, a full-key button, the map, a
four-way definition switch, a truncated explanatory paragraph, five layer toggles, three zoom
buttons, seven transport controls, a speed selector, a year readout, a disputed-account chip, a
truncated acts headline, four change cards, a "4 of 12" opener, a density rail, a year axis, a rate
rail with four annotations, a guess prompt, a caption sentence, a four-band spine, a phase essay and
a coverage tracker. On second zero. Before anyone has learned anything.

### 5. On a phone, the map is 390×165 and four-fifths of it is covered — and the app knows

At 390×844 the plate is **390×165 pixels**, and the apparatus card sits directly on top of it. What a
student can actually see of the British Empire is: a sliver of the Bay of Bengal, Fiji, Queensland
and New Zealand. No Britain. No Atlantic. No Africa. No Americas.

The app's own honest note, which I found in the DOM, says it out loud:

> *"The map was 46% covered by other panels, so it has taken the top of the…"* (itself clipped)

There is no year readout, no Play button, no scrubber and no change cards on the phone at all — only
the density ticks and the rate chart. The definition sentence is again clipped mid-word: *"…with a
treaty and no"*. A third of my class will be on a phone. They cannot see the map and cannot move
the year.

**Honourable mention, because it wrecks a lesson quietly.** Press **H** for Silences at the year the
app opens on, and it reports *"none at 1900; earliest destroyed 1910."* The flagship
archival-silence layer — the app's answer to the strongest charge in `WHY_PRINT_WINS` — has nothing
to show at the default year. And press **Play** at 1×: I measured 1900 → 1902 in six seconds. At
700ms per year plus rests, a 1600→1997 sweep runs about **twenty minutes**. There is no "watch the
empire breathe" that fits in a lesson.

---

## 4. What to remove from first paint — ranked

Nothing here means *delete*. It means *not on second zero*.

1. **The rate rail, the "how fast and how much" caption, and the +36/−45/123 yr/28 yr annotations.**
   This is a sophisticated argument about the asymmetry of acquisition and dissolution. It is
   meaningless before a student knows there was an acquisition. It costs ~180px of a 768px screen.
   Move it behind the spine band and reveal it at the end.
2. **The density tick rail with its per-decade count labels (4 3 3 2 4 2 2 3 5 6 …).** Thirty-odd
   naked integers above a year axis, unexplained, competing with the axis for the same eye. It is a
   data-density flex, not a teaching object.
3. **Three of the four change cards.** Show one, with a "3 more from 1900" control. Four cards ×
   ~90 words each, all truncated with "…" and all requiring a second click to finish, is four
   half-thoughts instead of one whole one.
4. **The "12 acts dated 1900 · 6 change the m… · +4 units · 3 records dated here, no map change ·
   2 further records of these same ac…" headline.** Two of its five clauses are already ellipsised at
   1366px. It is a changelog, and it reads like one.
5. **"ASK THESE THREE OF ANY IMPERIAL MAP" as a permanently answered panel.** The three questions are
   excellent. Pre-answering them on the first screen is the pedagogical equivalent of printing the
   mark scheme above the question. Ask them; make the student press something; then answer.
6. **The five layer toggles (P S W H E) and three zoom buttons as a persistent nine-control rail.**
   Nine controls, none of which mean anything until the map means something. Keep **E** — promote it,
   in fact — and defer the rest.
7. **The "+3 more colours (11 units) in the full key" line and the "Open the full key · the 14 legal
   forms, the marks and the criticism · two columns, the map narrows" button.** A button whose own
   label warns you that pressing it will shrink the map is a button that should not be on the first
   screen.
8. **The coverage tracker** ("Not yet looked at: Atlantic 1585–1838, Company 1600–1858, Dissolution
   1942–1997 · years visited: 1 of 314 that carry a record"). It is a guilt meter in a corner. On
   second zero it tells a student they are already behind on a thing they have not started.
9. **The keyboard-instructions paragraph** (an 80-word block read out to screen readers before
   anything else). Teach the keys where they are used.

That is roughly 400 of 768 vertical pixels recovered. The map would go from 704×297 to something
like 1100×470 — which is exactly what **E** already proves is possible and beautiful.

---

## 5. What to defer, and until when

| Thing | Show it when |
|---|---|
| The four-way definition switch (1–4) | After the student has looked at the pink map for 60 seconds and answered one question about it. It is the *pay-off*, not the furniture. Its "THE WORD CHANGED, NOT THE MAP" panel should be the **reward**, full width, on its own. |
| The full 14-form legend | On demand, and **beside** the map at full size — never at the cost of the plate. At 1366 it currently costs 64% of the screen and crops the western hemisphere. |
| "Three things wrong with this rendering" | Beat 3 of a sequence, projected, one item at a time. Item 2 ends *"Press 2 and 3 and watch how much of it goes"* — that is a scripted lesson beat already written; let it *be* one. |
| The rate rail and the 123-yr/28-yr comparison | Minute 22+, after the student has scrubbed at least once and has a feel for the shape. |
| The historiography drawer (14 disputes) | On demand, in a panel that is **not** 13 pixels tall — and, better, one dispute at a time, tied to the territory on screen. |
| The density tick rail | Free-explore mode only. It is a navigation aid for someone who already knows what they are looking for. |
| The per-year change cards | One at a time during playback; all of them only when the student asks "what else happened in 1900?" |
| The spine band's phase essay | Keep it, but not as a clipped two-line footer. It is the through-line sentence and it is currently cut off by the bottom of the window at 768px. |
| Silences (H) | At a year where there is something to show. Never at 1900, where it reports nothing. |

**And the thing to bring forward, not defer: `E`.** The enlarged plate is 1107×467 and it is the
only view in the app that looks like the "great printed historical atlas that came alive" the brief
asks for. It should be the *default* on a projector-shaped window, not a keyboard shortcut in the
corner of a rail.

---

## 6. Would I assign the app, the chapter, or the chapter with the app?

**The chapter, with the app as a projected supplement for two specific beats.** Reluctantly, and
mostly for reasons that have nothing to do with the quality of the history.

The chapter is a lesson in a box: key terms, a master chronology table, case studies, THINK
questions, SOURCE exercises with attribution lines, COMPLICATION boxes that ambush the reader, a
skills workshop with model paragraphs, a reference table of every territory added-how/left-how, an
interpretations dossier, eighteen practice questions, and a twelve-sentence summary. I can hand that
to a supply teacher. I can photocopy §16.1 for the bottom set and §14 for the top.

The app has **no lesson at all.** I audited the mount points: **17 of the 23 slots in the shell are
empty.** There is no tour, no quiz, no onboarding, no close, no mechanism diagram, no compare view,
no glossary, no search, no methods panel, no historiography panel, no teacher panel, no toolbar and
no status bar. The words "lesson", "tour", "quiz", "start", "glossary", "print", "revision",
"teacher" and "search" appear nowhere in the app's own controls. The 30-minute sequenced path in
§8 of the didactic spec — the thing that was supposed to answer the chapter's decisive advantage —
does not exist in the product. What exists is four superb instruments and no score.

Then there is the printing. The chapter photocopies. I emulated print media and rendered a real A4
PDF: it comes out as **one page**, the **entire western hemisphere is cropped off the map** (no
Canada, no Caribbean, no Falklands, on a map of the British Empire), the legend column is cut off
mid-entry at the page break with no second page, the change cards print straight through the year
axis, and "IV Dissolution" falls off the right edge. There is nothing here I can put in a student's
hand.

And the room problem. `#year=` deep links work, which is genuinely good — I can set "open
`#year=1857`" the way I'd set a page number. But I cannot deep-link a territory (`#/india/1765` is
overwritten on arrival), so I cannot set "read the Bengal entry" as homework without a click-by-click
instruction. A third of the class will be on phones where the map is invisible. And any student who
presses `2` — which the app itself tells them to do — gets a wall of overlapping text.

### What would reverse it, in order

1. **Ship the sequence.** One guided path, first-run by default, one beat at a time, escapable. Not
   more content — the content is already outstanding and there is far too much of it. A *path*
   through what exists. This is the single change that flips my answer, and it is the one thing
   `WHY_PRINT_WINS` correctly identifies as the app's structural loss (#1, #2, #11).
2. **Give the map back its screen.** Make the enlarged plate the default. Get first paint down from
   23 information zones to about five. Everything in §4 above.
3. **Fix the three layout breaks**: the 13-pixel drawer below the fold; the definition-switch
   overflow that collides 25 pairs of text; the panel-on-map occlusion at 519×219.
4. **Make something printable.** A one-page handout with a *whole* map, the four phases, ten dates
   and three questions. The didactic spec promised a session-derived revision sheet; a static
   handout that actually prints would beat it for now.
5. **Publish a list of the retrieval items.** The THINK commit questions are excellent and
   assessable. Twelve of them on one page, with answers, and I have a homework and an assessment.
6. **Fix, or explain on the face of the interface, the 1947 problem** (below).

---

## 7. Three things that break with 28 teenagers in a room

**1. Twenty-eight students press "2" in the first ninety seconds, and twenty-eight screens turn to
mush.** The app *instructs* them to: the keyboard help says "Keys 1 to 4 change what the word British
means", and the legend says "Press 2 and 3 and watch how much of it goes." At 1366×768 that is 25
overlapping text collisions. Twenty-eight hands go up at once and I lose the room. There is no
recovery instruction on screen, because the app does not know it has broken.

**2. Someone clicks the yellow "account disputed — why?" chip, nothing happens, and it spreads.**
Within four minutes the whole class has clicked the button that visibly does nothing, and I am
fielding "sir, it's broken" from every table while trying to teach the Diwani. The honest answer —
"it *did* work, the answer is in a thirteen-pixel window below the bottom of your screen" — is worse
than a bug.

**3. The map does not change on 15 August 1947.** I scrub to 1947 to show independence. The headline
says "−45 units", four cards say India left, and **the map is unchanged and India is still red** —
because the app redraws states on the following year's plate, as four cards note in small mono type:
*"the map redraws it in 1948."* Measured: 1947 = 180 units, 1948 = 137. Thirty seconds of a class of
28 reading "India was still British in 1947" off a projector is thirty seconds I will spend the rest
of term undoing. The app's convention is defensible; it is not survivable in a room without being
said out loud, in the largest type on the screen, on the 1947 plate.

*Runners-up, in the order I expect them:* a student on a phone who cannot find Britain on the map;
a keyboard-only student who has to press **Tab 35 times** to reach the "1 claimed / 2 administered"
switch (it sits after the entire time bar in the tab order); and the student who presses **Play**,
watches the year advance from 1900 to 1902 in six seconds, and quietly gives up on the idea that
this thing animates.

---

## 8. The verdict in one line

The history in here is better than the chapter's and the interface is losing it: four superb
instruments are playing at once, on second zero, on a 704×297 map, with no conductor — and until
someone sequences it, the chapter goes in the students' hands and the app goes on the projector for
two brilliant minutes.
