# THE BRITISH EMPIRE ATLAS — shared build brief

## What we are building
An interactive web app + map that lets a student explore **the full extent of the British Empire,
when every part was added, and how each part later split away** — built to be the single best
teaching artefact on this subject that exists. Not "a good website". The bar is:
*a student learns more, faster, and remembers it longer than from the best coursebook chapter,
and wants to keep exploring after the lesson ends.*

Audience: secondary / early-undergraduate students (~14–19) and their teachers. Assume curiosity,
not prior knowledge. Assume they will be graded on this material.

## Absolute rules
1. **No framework, no build step.** Vanilla ES modules, plain CSS, served statically. `app/index.html`
   is the entry. Everything must work by opening `http://localhost:8777/app/`.
2. **Fully offline after first build.** Vendor every dependency into `app/vendor/`. No CDN at runtime.
3. **Historical accuracy is non-negotiable.** Every date, status and claim must be defensible.
   Where historians disagree or a date is contested/approximate, say so *in the UI*, don't hide it.
4. **Honesty about empire.** This is a history of conquest, settlement, extraction, slavery, famine,
   resistance and independence. Neither celebrate nor flatten it. Colonised people are actors with
   names, not scenery. Avoid euphemism ("acquired" for conquest) and avoid polemic. Show evidence.
5. **Never invent a citation.** Sources must be real works you are confident exist (author, title, year).
   If unsure, cite the general historiography, not a fake page number.
6. **Every pixel is didactic.** If an element does not help someone understand or remember, cut it.

## Repository layout (own your files; do not edit another agent's files without saying so)
```
app/index.html          app shell
app/css/                tokens.css, base.css, + one file per component area
app/js/core/            store.js (state), bus.js, util.js, format.js
app/js/map/             renderer, projection, interaction, layers
app/js/timeline/        time scrubber + playback
app/js/panels/          territory dossier, legend, info
app/js/tours/           guided narrative chapters
app/js/quiz/            retrieval practice
app/js/viz/             charts
app/data/territories/   dataset shards (one JSON per region)
app/data/geo/           vendored + built geometry
app/vendor/             vendored third-party libs
tools/                  build + inspection scripts (node, CommonJS)
docs/                   ARCHITECTURE.md, DATA_MODEL.md, SOURCES.md, DIDACTIC_SPEC.md
```

## Running + inspecting
- A static server is already running: **http://localhost:8777/app/** (root also serves `/progress/`).
  If it is down: `node tools/serve.js &` from the repo root.
- **Inspect the real running app headlessly (parallel-safe, each call gets its own browser):**
  ```
  node tools/inspect.js <scenario.js> --out /tmp/<unique-dir> [--url ...] [--mobile] [--dark] [--w 1440 --h 900]
  ```
  A scenario is `module.exports = async ({page, shot, log}) => { ... }` with the full Playwright
  Page API. `await shot('name')` writes a PNG and the report prints its path — **read those PNGs**.
  See `tools/scenarios/smoke.js`. Never trust a builder's description of the app; look at it.
- Report progress so the human can watch:
  `node tools/progress.js event "<what you just did>"`
  `node tools/progress.js piece <id> <pending|building|review|round|done|blocked> "<short note>"`

## House style
- Prose in the UI: concrete, specific, human. Names, numbers, dates, consequences. No filler
  ("rich tapestry", "played a key role"). Short sentences beat long ones. A 12-word sentence a
  student remembers beats a 40-word one they skim.
- Typography and colour do the teaching too: this should feel like a great printed historical
  atlas that came alive, not a dashboard.
- Accessibility is part of correctness: keyboard-operable, screen-reader sane, WCAG AA contrast,
  respects `prefers-reduced-motion`.
