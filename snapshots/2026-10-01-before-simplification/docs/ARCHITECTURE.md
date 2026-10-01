# ARCHITECTURE — the contract

This is the only document you need in order to build a module for the British Empire Atlas.
If something here is wrong or missing, that is a bug in the shell; say so rather than working around it.

**Owner of this file and of everything it describes:** the shell/core agent.

---

## 1. What this app is, mechanically

No framework. No build step. Vanilla ES modules served statically from `app/`.
`app/index.html` loads `app/js/main.js`, which:

1. loads the dataset (`core/data.js`),
2. restores state from the URL (`core/url.js`),
3. discovers and mounts **feature modules** listed in `app/js/modules.json`,
4. subscribes once, and fans every state change out to every module.

There is exactly one store, one bus and one data object. Everything else is a module.

```
index.html ──► main.js ──► core/{store,url,bus,data,util,format,registry}.js
                   │
                   └──► app/js/<area>/index.js   ← your module
```

---

## 2. File ownership

Do not edit a file you do not own. If you need something in someone else's file, say so out loud.

| Path | Owner |
|---|---|
| `app/index.html` | **shell** |
| `app/js/core/*` | **shell** |
| `app/js/main.js` | **shell** |
| `app/js/modules.json` | shell — but **everyone appends one line to it** (see §7) |
| `app/css/layout.css` | **shell** |
| `docs/ARCHITECTURE.md` | **shell** |
| `tools/modules.js`, `tools/data-index.js` | shell |
| `app/css/tokens.css`, `app/css/base.css` | design system |
| `app/data/territories/*` + `docs/DATA_MODEL.md` | dataset / data-model |
| `app/data/geo/*` + `app/vendor/geo.js` | geometry |
| `app/js/map/*`, `app/css/map.css` | map |
| `app/js/timeline/*`, `app/css/timeline.css` | time control |
| `app/js/panels/*`, `app/css/panels.css` | dossier / panels |
| `app/js/legend/*`, `app/js/tours/*`, `app/js/quiz/*`, `app/js/viz/*`, `app/js/search/*`, … | the named area's agent |

Your module owns **one directory under `app/js/`** and **its own CSS file under `app/css/`**. Nothing else.

---

## 3. State shape

`app/js/core/store.js`. This is the whole of it. There are no other globals.

```js
{
  /* time */
  year: 1900,                       // the year currently on the map (integer, clamped to bounds)
  bounds: { min: 1600, max: 2027 }, // set from the dataset at boot; do not hard-code years
  playing: false,                   // is the clock running
  speed: 1,                         // playback multiplier, 0.25 … 16
  compareYear: null,                // number => compare mode is on, against this year

  /* selection */
  selectedTerritoryId: null,        // the dossier's subject (a territory id, not a unit id)
  hoveredUnitId: null,              // geometry unit under the pointer
  focusedUnitId: null,              // geometry unit under keyboard focus (kept apart from hover)

  /* view */
  activeLayer: 'status',            // which thematic layer paints the map
  mapView: null,                    // { k, x, y } — opaque to everyone but the map module
  filters: {},                      // free-form { region?, status?, era?, … }
  searchQuery: '',

  /* narrative */
  activeTour: null,                 // tour id
  tourStep: 0,                      // 0-BASED here; the URL shows it 1-based
  quizState: { active, quizId, index, answers, score, done },

  /* chrome */
  panelState: { dossier: false, legend: true, timeline: true, overlay: null, sheet: null },
  theme: 'auto',                    // 'auto' | 'paper' (light) | 'lamplit' (dark)
  reducedMotion: 'auto',            // 'auto' | 'reduced' | 'full'

  /* learner memory */
  visited: Set<territoryId>,        // persisted to localStorage by the shell

  /* runtime */
  status: 'booting' | 'ready' | 'error',
  error: { message, detail, where } | null,
  hydrating: false,                 // true only while url.js is restoring
}
```

### Rules

1. **Never mutate state.** `store.getState()` returns a frozen object.
2. **Change it only by dispatching an action.** Actions are the list in §4.
3. Subscribers are notified **once per animation frame**, no matter how many actions fired.
4. `changed` is a `Set` of the top-level keys that actually changed. Use it to skip work:
   `if (!changed.has('year') && !changed.has('activeLayer')) return;`

### Store API

```js
store.getState()                         // frozen state
store.dispatch('setYear', 1857)          // or store.dispatch({ type, payload })
store.act.setYear(1857)                  // same thing, sugar
store.batch(d => { d('setYear', 1900); d('setLayer', 'trade'); })  // one notification
store.flush()                            // force pending notifications now (tests)
store.subscribe((state, prev, changed) => …)          // → unsubscribe fn
store.watch(s => s.year, (year, prevYear, state) => …) // fires only on change → unsubscribe fn
store.watchKeys(['year', 'activeLayer'], (state) => …) // → unsubscribe fn
store.history()                          // last 50 action names, for debugging
```

An unknown action name **warns and changes nothing**. It never throws.

---

## 4. Actions

| Action | Payload | Notes |
|---|---|---|
| `setYear` | number | clamped to `bounds` |
| `nudgeYear` | number (delta) | |
| `setBounds` | `{min,max}` | the shell calls this once, from the dataset |
| `play` / `pause` / `togglePlay` / `setPlaying` | — / bool | |
| `setSpeed` | number | clamped 0.25–16 |
| `setCompareYear` | number \| null | |
| `toggleCompare` | — | |
| `select` | territoryId \| null | also opens the dossier and records the visit |
| `deselect` | — | |
| `hover` | unitId \| null | |
| `focusUnit` | unitId \| null | |
| `visit` | territoryId | |
| `setLayer` | layerId | |
| `setMapView` | `{k,x,y}` \| null | map module only |
| `setFilter` | partial object | merges; `null`/`''`/`false` removes a key |
| `clearFilters` | — | |
| `setSearch` | string | |
| `startTour` | `'id'` or `{id, step}` | |
| `setTourStep` / `nextStep` / `prevStep` / `endTour` | number / — | 0-based |
| `setQuiz` | partial `quizState` | merges |
| `resetQuiz` | — | |
| `setPanel` | partial `panelState` | merges |
| `togglePanel` | key | |
| `openOverlay` / `closeOverlay` | id / — | |
| `setTheme` | `'auto'\|'paper'\|'lamplit'` | `'light'`/`'dark'` accepted and normalised |
| `setReducedMotion` | `'auto'\|'reduced'\|'full'` | |
| `setStatus` / `fail` / `clearError` | | shell only |
| `hydrate` | partial state | bulk restore; every key is routed through its own action |

---

## 5. Module API

A module lives at **`app/js/<area>/index.js`** and default-exports one object.

```js
export default {
  id: 'map',                 // required, unique. Also the default slot name.
  slot: 'map',               // optional. Which data-mount="…" element you render into.
  requires: ['geo'],         // optional: 'geo' (needs map geometry) | 'data' (needs a real dataset)

  async mount({ root, store, data, bus, format, util, url, registry, id }) { },
  update(state, prev, changed) { },
  destroy() { },
};
```

* `root` — **always a real element**, already in the document. Render into it; it is yours.
* `mount()` is awaited. If it throws or rejects, only your module is disabled — the atlas still runs.
* `update()` runs at most once per frame, after `mount()` resolves, never after `destroy()`.
  If it throws three times your module is switched off and the failure is logged once.
* `destroy()` must remove every listener you added. `util.disposer()` exists for exactly this.

### Mount points in `index.html`

| `data-mount` | Where it is | Intended for |
|---|---|---|
| `toolbar` | the masthead, centre | layer switch, search box, tour launcher |
| `chrome-end` | the masthead, right | theme, help, share, teacher mode |
| `map` | fills the map stage | the map renderer |
| `map-overlay` | absolutely over the map, pointer-transparent | labels, tour spotlights, hover cards |
| `legend` | bottom-left of the stage | legend, symbology key |
| `stage-note` | top-left of the stage | "showing 1857", caveats, contested-date notes |
| `dossier` | the right-hand panel (a bottom sheet under 62rem) | territory dossier |
| `timeline` | the full-width bar under the map | scrubber, playback, event ticks |
| `statusbar` | the thin footer, left | counts, source note |
| `overlay` | fixed, full-screen, pointer-transparent | tours, quiz, onboarding, modals |

Ask for a new slot rather than inventing one; if your `slot` does not exist the registry
creates a container inside `overlay` and logs a warning.

### DOM attributes the shell keeps in sync (style against these; never write them)

* `<html data-theme="auto|paper|lamplit" data-motion="auto|reduced|full" data-boot="loading|ready|error"
  data-stage="plate|working|apparatus">`
* `<div id="app" data-dossier="open|closed" data-sheet="open|closed" data-stage data-rail="side|sheet"
  data-layer data-tour data-step data-compare="on|off"
  data-playing="on|off" data-overlay data-selected data-year data-dev>`

`data-dev` is present only while some module is missing or broken, or a stray error has been
logged; it is what makes the dashed slot outlines visible.

**`data-rail` and the geometry custom properties.** `app/js/chrome/index.js` measures the running
layout and publishes it on `#app`. Read these; never write them.

| | |
|---|---|
| `#app[data-rail="side"]` | the rail is a column beside the plate |
| `#app[data-rail="sheet"]` | the rail is a bottom sheet over the foot of the plate |
| `--stage-top` | the stage's top edge, in px. **Nothing may be positioned above it** (LAYOUT_BUDGET B10) |
| `--stage-height` | the stage's height, in px |
| `--rail-top-min` | the highest y a bottom sheet may reach — the drawn map's top plus its 150px floor |
| `--rail-clear` | how far the open rail reaches up from the bottom of the window (the seam) |
| `--dock-floor` | how far the plate's own foot furniture reaches up from the bottom of the window. **A floating control strip over the plate writes `bottom: var(--dock-floor)` and is clear of the map's definition dial, the colour ribbon, the time bar and an open bottom sheet.** Measured, not summed from tokens: the map's strip is content-sized, it wraps, and it exists only from `data-stage="working"`. Do not re-derive this from `--time-h + --foot-h + --key-h`; that sum was what put the guided path's Back/Next bar 19px inside the definition dial at 900×700 |

The band is decided by which axis has room, not by width alone — see LAYOUT_BUDGET §2A. It is a
media condition in `layout.css` and the same condition in `matchMedia` here; if you change one,
change both. `bus.on('chrome:layout', …)` carries `{ rail, stage, plate, vw, vh }` whenever any of
it changes (resize, orientation, the rail opening, the map being re-parented).

### CSS

Load your own stylesheet from `mount()`. `util.loadCss` fetches first, so a missing file
never produces a console error:

```js
await util.loadCss(new URL('../../css/map.css', import.meta.url));
```

Use tokens from `css/tokens.css`. Do not redefine `--bar-h`, `--time-h`, `--dossier-w`,
`--stage-inset` or `--z-boot`; those belong to the shell.

---

## 6. Data API

`data` is handed to every module in `mount()`. It is also `window.BEA.data`.

The dataset's own schema is **`docs/DATA_MODEL.md`** (owned by the data-model agent). This section is
what `core/data.js` gives you after reading it. The two axes in the schema — `geoCoverage` (extent over
time) and `statusPeriods` (constitutional status over time) — are crossed here into flat **spans**: one
status, on one set of units, over one stretch of years. That is the thing a map can paint.

### The query the whole atlas is built on

```js
data.statusAt(year) → Map<unitId, {
  unitId, territoryId, territory,   // territory is the full object, by reference
  status,                           // 'crown-colony', 'company-rule', 'dominion', … (DATA_MODEL §3.3)
  controlDegree,                    // 0–5. 0 = no British authority, 5 = full direct sovereignty.
                                    //   Use this for shading; `status` for the legend.
  controlled,                       // controlDegree > 0
  since,                            // first year of the UNBROKEN run of British control this unit
                                    //   is in — ACROSS territories, so a unit held by the Company
                                    //   and then the Crown reads 1757, not 1858. null when not held.
  tenureYears,                      // year - since (0 when since is null)
  spanStart, spanEnd,               // the span that produced this entry (spanEnd null = ongoing)
  partial,                          // true when British control did not fill this unit — draw it hatched
  circa, contested,                 // flag the caveat in the UI; never hide it
  span,                             // the full span: label, note, governedFrom, localLegislature,
                                    //   franchise, howControlWorked, from/to date objects, sources
}>
```

* **Fast.** The timeline is cut into segments at every year anything changes; each segment is computed
  once. Measured: 200,000 calls in ~60 ms cold, ~0 ms warm; a 600-frame scrub costs 0.2 ms.
* **Stable.** `statusAt(1857) === statusAt(1857)`. Compare with `===` to skip a re-render.
* Years outside `data.bounds` are clamped.

### The rest

```js
data.metricsAt(year)      → { year, units, controlledUnits, territories, byStatus, byRegion, byDegree }
data.territoryAt(id, y)   → { id, territory, active, controlled, status, controlDegree, span, since,
                              tenureYears, units, nextChange, prevChange, year } | null
data.territoriesAt(y, {controlledOnly}) → [{ territory, span, status, controlDegree, controlled }]
data.eventsBetween(a, b, {type, region, territoryId, changedStatus, limit}) → event[]   (inclusive)
data.timeline()           → { min, max, cuts, events, eventsByYear:Map,
                              unitsByYear:Int32Array, territoriesByYear:Int32Array, at(y) }
                            (typed arrays indexed by year - min; computed once, on first call)
data.nextChangeYear(y, dir=1) → the next / previous year anything on the map changes
data.search(q, {limit, year}) → [{ id, name, region, territory, score }]
data.eventsFor(territoryId)   → that territory's events, chronological
data.readDate(dateObject)     → { year, month, day, precision, display, note, circa, endYear }

data.territories          // every territory, normalised (all original fields preserved)
data.byId                 // Map<territoryId, territory>
data.byRegion             // Map<regionId, territory[]>
data.byUnit               // Map<unitId, territory[]>
data.spans                // flat, sorted by start
data.events               // flat, sorted chronologically — territory events and empire-wide ones
data.acquisitions         // flat, sorted: { year, date, mechanism, how, counterparties, units, … }
data.departures           // flat, sorted: { year, date, mechanism, how, units, becomes, led, cost, … }
data.statuses             // [{ id, label, count, controlDegree, controlled, order }] — derived, never stale
data.regions              // [{ id, label, count, territories }]
data.bounds               // { min, max } — feed straight to store.dispatch('setBounds', …)
data.get(id) / data.unitsOf(id, year?) / data.territoriesForUnit(unitId) / data.unitName(unitId)
data.meta                 // { placeholder, warnings, loadedMs, counts, dataset, geo }
```

### A normalised territory

Every field from the shard is passed through untouched (`pedagogy`, `consequences`, `evidence`,
`peak`, `contested`, `namesOverTime`, `modernSuccessors`, `confidence`, …), plus these:

```
id, name, formalName, shortName, region, subregion, nestedWithin
aka[]            // namesOverTime + formalName + modernSuccessors, de-duplicated
units[]          // union of every geoCoverage period
spans[]          // statusPeriods × geoCoverage, flattened (see above)
events[]         // its own events plus every empire-wide event that links to it
acquisitions[] / departures[]   // normalised, each with a plain `year`
firstYear, lastYear, acquiredYear, endedYear, tenureYears, stillBritish
```

### Territory / unit — the distinction that matters

* A **territory** is a historical entity: Barbados, Bengal, British India. It has an id, spans and events.
* A **unit** is a piece of geometry: `barbados`, `hk-kowloon`, `in-west-bengal`. Unit ids come from
  `app/data/geo/units.index.json` — 302 of them. **Never invent one.**
* One territory covers many units; one unit may be claimed by different territories at different times.
  Where two spans overlap on a unit: a territory `nestedWithin` another beats its parent (a princely
  state inside British India), then the later `start` wins, then the more specific claim (fewer units).

### Geometry

```js
data.geoAvailable          // false if no geometry has landed
data.geo                   // { coarse, fine, land, lakes, graticule } — each { id, file, object,
                           //   lazy, loaded, data }  where `data` is the raw TopoJSON topology
data.unitMeta              // Map<unitId, { name, aliases, kind, sovereign_today, iso_a2, region,
                           //   centroid, point, area_km2, bbox, tiny }>  — 302 entries
await data.loadGeoLayer('fine')   // fetch a layer the manifest marks "preload": false
```

Layers that share a file (land, lakes, graticule) are fetched once. Decoding helpers live in
`app/vendor/geo.js` — see `app/data/geo/README.md`.

### Manifests

```
app/data/territories/index.json   { "shards": ["caribbean.json", …], "events": ["../events/wars.json"],
                                    "statuses": [...], "regions": [...], "meta": {} }
app/data/geo/index.json           { "files": [{ "id", "file", "object", "preload": false }],
                                    "units": "units.index.json" }
```

**A shard that is not listed in `territories/index.json` never reaches the app.**
After adding a shard, run `node tools/data-index.js` (or `--check` in CI) to regenerate the list.
The shell trusts a manifest exactly and probes nothing else, which is why a healthy boot makes zero
failing requests.

**If no shards are listed, the app boots on a small built-in placeholder dataset**
(`data.meta.placeholder === true`) and says so in the footer. Build against it safely.

---

## 7. How to add a module — 15 lines

```js
// app/js/legend/index.js
import { el } from '../core/util.js';

export default {
  id: 'legend',
  async mount({ root, store, data, util }) {
    await util.loadCss(new URL('../../css/legend.css', import.meta.url));
    this.root = root;
    this.off = store.watch(s => s.year, () => this.render());
    this.render();
  },
  render() { /* read store/data, write into this.root */ },
  update(state, prev, changed) { if (changed.has('activeLayer')) this.render(); },
  destroy() { this.off(); this.root.replaceChildren(); },
};
```

Then **register it**: add `"./legend/index.js"` to `modules` in `app/js/modules.json`
(or just run `node tools/modules.js`, which rewrites that list from the filesystem).
Unregistered modules never mount. Mount order is the order of that list.

---

## 8. URL and deep links

`core/url.js`. The address bar is a teaching tool: a teacher scrubs to a moment and sends the link.

```
/app/#year=1857&sel=bengal&layer=trade&tour=company-rule&step=3&compare=1914&q=beng&view=2.4,0.31,-0.08
```

| key | state | note |
|---|---|---|
| `year` | `year` | always present |
| `sel` | `selectedTerritoryId` | |
| `layer` | `activeLayer` | omitted when `status` |
| `tour` / `step` | `activeTour` / `tourStep` | **`step` is 1-based in the URL, 0-based in state** |
| `compare` | `compareYear` | |
| `q` | `searchQuery` | |
| `filter` | `filters` | `region:africa,status:colony` |
| `view` | `mapView` | `k,x,y` |
| `panel` / `quiz` | `panelState.overlay` / `quizState.quizId` | |
| `theme` / `motion` | `theme` / `reducedMotion` | omitted when `auto` |

Selection, tour, step, layer, compare and overlay changes **push** a history entry, so Back works.
Year scrubbing, panning and typing **replace** it, so Back is never a stutter. Writes are throttled
to 150 ms — never call `history.pushState` yourself.

**The hydration window.** While a link is being restored, and while Back or Forward is being
applied, `state.hydrating` is `true` **and subscribers actually observe it** — the restore flushes
inside the window and closes it with a second notification. Guard on it whenever "the year
changed" must not be read as "the reader did something": before this, a link to `#year=1857`
promoted the disclosure level and rewrote itself to `#year=1857&filter=stage:working` before the
page had finished painting, so a teacher's link was not the same object after it was opened.
The address is also never written before it has been read.

For a share button: `url.link({ selectedTerritoryId: 'bengal' })` returns an absolute URL,
`url.share()` returns the current one.

---

## 9. The bus

`core/bus.js`. State lives in the store; the bus is for *moments*. A throwing handler can never
break the emitter.

### The shell's own channel — how to drive the surface

`app/js/chrome/index.js` owns the one-sentence band, the disclosure level and the rail sheet.
Everything it owns is reachable from the bus, and everything that is a *position in the lesson*
is in the store and therefore in the URL, so a beat is a link.

```js
bus.emit('ask:say',   { id, text, mark?, priority?, cta? });  // the one sentence. text:null clears yours.
bus.emit('ask:stage', { level: 'working' | 'apparatus' });    // request a disclosure level
bus.emit('ask:sheet', { id, eyebrow, title, node });          // open the rail sheet; null closes it
bus.emit('ask:sweep');                                        // the 30-second 1600→1997 sweep
```

Priorities on `ask:say`: `1` the shell's default · `40` content · `50` a moment · `60` the sweep.
Highest wins; equal priority, newest wins. Only `<strong> <em> <b> <i> <span>` survive sanitising.
The band's `cta` becomes the one quiet control while your sentence is up; **no module renders a
`.cx-cta` of its own.**

The shell answers with `chrome:ready`, `chrome:stage`, `chrome:sheet`, `chrome:sweep` and
`chrome:layout`. A stage is *requested*, never set: levels advance on their own and a reader may
go back explicitly.

```js
const off = bus.on('territory:select', ({ id }) => …);
bus.emit('ask:flyTo', { unitId: 'IND' });
await bus.next('map:ready', 3000);   // promise, resolves null on timeout
```

Naming: `<area>:<verb>`. `ask:<verb>` is a request another module may honour.
Emitted by the shell: `app:ready`, `url:restore`, `url:change`, `url:pop`.
Please document the events your module emits in a comment at the top of your `index.js`.

---

## 10. util and format

`core/util.js` — `$`, `$$`, `el`, `fill`, `frag`, `escapeHtml`, `on` (with delegation), `disposer`,
`debounce`, `throttle`, `rafThrottle`, `animate` (respects reduced motion), `clamp`, `lerp`,
`mapRange`, `bisect`, `easing`, `uid`, `hash`, `slug`, `groupBy`, `byKey`, `sortBy`,
`shallowEqual`, `prefersReducedMotion`, `media`, `announce`, `trapFocus`, `loadCss`, `getJson`,
`exists`, `storage` (localStorage that never throws).

`core/format.js` — **every number, year and date a user reads goes through here**, so the atlas
speaks with one voice.

```js
format.year(1612, { circa: true })   // "c. 1612"
format.yearRange(1757, 1858)         // "1757–1858"      (en dash, no spaces)
format.yearRange(1815, null)         // "1815–present"
format.date({ year: 1858, month: 8, day: 2 })  // "2 August 1858"
format.duration(191)                 // "191 years";  { approx: true } → "almost 200 years"
format.tenure(1757, 1947)            // "190 years"
format.number(1204000)               // "1,204,000"
format.compact(1204000)              // "1.2 million"
format.percent(0.372)                // "37%"
format.ordinal(22)                   // "22nd"
format.century(1857)                 // "19th century"
format.area(2350000)                 // "2,350,000 km²"
format.list(['a','b','c'])           // "a, b and c"
format.plural(3, 'territory', 'territories')
format.statusLabel('crown-colony')   // "Crown colony" (pass data.statuses labels if you have them)
format.truncate(text, 140)
```

Unknown values read `"unknown"`, never `N/A`, `null` or a blank cell.

---

## 11. Accessibility the shell already handles

* Skip links to the map and the timeline; `#stage` is focusable.
* Two live regions: `util.announce('…')` (polite) and `util.announce('…', true)` (assertive).
  Announce meaningful state changes — a year jump, a selection, a tour step.
* `Escape` closes the overlay, then ends the tour, then clears the selection.
  Call `ev.preventDefault()` if you handle Escape first.
* `<html data-motion>` and `util.prefersReducedMotion()` reflect the user's setting *and* an
  in-app override. `util.animate()` already jumps to the end state under reduced motion.

Everything else — roles, labels, focus order inside your component, keyboard operation of your
own controls — is yours.

---

## 12. Failure, and what the user sees

Six modules landing in one wave is six chances to take the atlas down. None of them can.

* A **missing** module (file not there) is silent; it simply does not mount.
* A **broken** module — one that throws in `mount()` — is logged once, its slot is emptied so a
  half-rendered panel is never left standing, and it is named in the footer: "Not running: quiz."
* A **slow** module — one whose `mount()` has not settled after **6 s** — does not hold the boot
  open. The atlas opens without it, the footer says "Still opening: search.", and if it settles
  later it takes its place quietly. Nothing is killed; the atlas simply stops waiting.
* A module that throws **three times in `update()`** is disabled and named.
* An uncaught error from a module's own timer is **not fatal**: from the moment the shell starts
  mounting modules, a stray error is recorded, counted in the footer and survivable. Only a
  failure while the shell itself is still assembling — the dataset, the store, the address —
  replaces the app with the error boundary.
* The error boundary is a page of prose: what broke, that it is not the reader's fault, the
  detail a developer needs, a Reload button, and where the underlying history lives as plain text.
* **The boot watchdog** is an inline script in `index.html`, deliberately not a module: if
  `main.js` or anything it imports fails to parse, no module script in the document ever runs and
  nothing else is left to speak. It says "this is taking longer than it should" at 6 s and shows
  the error boundary at 14 s, and it wires its own Reload button.

---

## 13. Debugging

`window.BEA` exists once the app is ready:

```js
BEA.store.dispatch('setYear', 1857)
BEA.data.statusAt(1857)
BEA.registry.report()      // { mounted, failed, absent, skipped, disabled, log }
BEA.url.share()
BEA.ms                     // boot time in ms
```

Inspect the real thing, headlessly, from the repo root:

```
node tools/inspect.js tools/scenarios/shell.js --out /tmp/mycheck         # shell, store, URL, registry
node tools/inspect.js tools/scenarios/data-fixture.js --out /tmp/mycheck  # the data layer
node tools/inspect.js tools/scenarios/smoke.js --out /tmp/mycheck --mobile --dark
```

**The bar: zero console errors and zero failed requests.** The shell meets it today with no
modules installed. Keep it there — probe with `util.exists()` / `util.getJson()` rather than
letting a 404 reach the console.
