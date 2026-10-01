# The British Empire — an interactive atlas

An offline, framework-free web app for students: **where the empire reached, when every part was
added, how each part split away** — and, throughout, what "British" actually meant in each place.

## Run it

```
./start.command          # macOS: or double-click it in Finder
```
or

```
node tools/serve.js      # then open http://localhost:8777/app/
```

No build step, no npm install, no network. It is a folder of static files: copy it to a memory stick
and it runs on a school laptop in 2031. Playwright (in `devDependencies`) is only for the inspection
harness, never for the app.

## What's in it

| | |
|---|---|
| Territories | **260**, each with how it was taken, from whom, what changed while Britain held it, and how it ended |
| Empire-wide events | **308** — wars, acts, treaties, revolts, famines, conferences |
| Geographic units | **302**, built from Natural Earth and split where the history demands (Ireland's counties, the Australian colonies, Tanganyika vs Zanzibar, the Cape/Natal/Transvaal/Orange, Aden Colony vs Protectorate) |
| Sources | **629** deduplicated real works; every printed quantity carries a warrant record |
| Primary texts | **43** transcribed, each with nature / origin / purpose / *what it cannot tell you* |
| Misconception traps | **261** commit-then-correct prompts |
| Historiographical disputes | **14**, each refusing its verdict until the student commits |
| Lesson path | **~30 min core / ~45 min full**, ending in a signed, printable argument |

## The three things it does that a book cannot

1. **The definition switch.** Keys `1`–`4` hold the year and change what "British" *means* —
   claimed / administered / controlled / influenced — recomputing area, unit count and population.
   In 1922 the widest reading draws 212 units and the narrowest 97. *Same year, same evidence,
   115 units of difference.* The pink map is revealed as a choice.
2. **Runnable mechanisms.** The Bengal revenue → sepoys → conquest loop can be stepped *and cut*,
   with the map running underneath. Then the app's own strongest claim is taken away from Britain and
   tested on Algeria, the Congo and Angola — one fits, one strains, one breaks it.
3. **A conclusion computed from what you actually did.** The Close prints a twelve-line argument in
   which the lines you can defend carry *your* numbers and *your* first wrong guesses; the rest are
   greyed with the missing evidence named and priced in seconds.

## How it was built, and how it was judged

A rival panel first wrote the strongest possible opponent: an **18,400-word coursebook chapter**
(`docs/rival/CHAMPION.md`) plus `WHY_PRINT_WINS.md`, fifteen ways a printed chapter beats an
interactive map. Several were architecturally true — a choropleth teaches that *area equals
importance*, which is the very lie this app exists to kill; informal empire is unmappable; a chapter
ends and a map does not. `docs/FEATURE_SPEC.md` answers all fifteen: **10 reversed, 3 neutralised,
2 honestly conceded** (and the two concessions are stated to the user inside the app).

Every piece was then built and re-built against a fresh adversarial critic who drove the *running*
app headlessly — never a builder's summary — and blind-scored it against the chapter on the
twelve-criterion rubric in `docs/DIDACTIC_SPEC.md` §6. Final panel of four independent lenses:

| Lens | App | Chapter |
|---|---|---|
| Rubric scorer | 98.0 | 80.0 |
| Professional historian | 99.4 | 79.8 |
| 15-year-old on a phone | 99.4 | 76.2 |
| Head of history | 97.4 | 75.4 |

## Guardrails that run in the build

- `node tools/validate-data.js` — schema plus semantics: contiguous status periods, real geo unit ids,
  controlled vocabulary, no duplicate ids, citations present.
- `node tools/check-gloss.js --selftest` — renders every generated headline, verb and counterparty
  line for all 260 territories under every mechanism × direction, and **fails on any prose that
  contradicts its record**. It replays 13 historical regressions from a cold start and catches all 13.
  This exists because the same class of error escaped three times: "taken from Europeans" over Kenya's
  African counterparties, "handed over by another European power" over Tipu Sultan and the Marathas,
  and "Bought" over Kashmir 1846 — where Britain was the *seller*.
- `node tools/check-warrants.js` — no printed quantity without the record that warrants it.
- `node tools/audit-timeline.js` — the extent curve. Peak 1922 computes to 33,533,305 km² =
  **25.02% of world land** from our own data. The canonical "quarter of the world" falls out; it is
  never asserted.
- `node tools/inspect.js <scenario> --out DIR` — headless Playwright harness, parallel-safe, one
  browser per call. This is how every critic saw the app.

## Docs

`DIDACTIC_SPEC.md` (the pedagogy and the rubric) · `FEATURE_SPEC.md` (law for builders) ·
`DATA_MODEL.md` · `ARCHITECTURE.md` · `DESIGN.md` · `LAYOUT_BUDGET.md` + `RESPONSIVE_LAW.md` ·
`SOURCES.md` (629 works, the 10 positions the dataset takes and the 10 it refuses to settle) ·
`ACCURACY_AUDIT.md` · `rival/` (the opponent) · `counter/` and `experience/` (the design record).

## Honest limits

Historical boundary polygons at this fidelity do not exist openly, so territories are composed from
modern units split where the history demands; `app/data/geo/README.md` documents every decision.
Informal empire is drawn as a captioned *argument, not a measurement*. Where a figure is contested it
is given as a range with a reason, and where the record was destroyed the app draws a hole and names
who destroyed it.
