# The British Empire · A classroom atlas

A local classroom atlas and English enquiry for Q2 in Schleswig-Holstein. Empire / Echoes
combines an interactive globe, territory stories and a written rallye connecting imperial
history to British identities. Both earlier classroom versions remain available.

## Latest experience · Empire / Echoes

Open **http://localhost:8777/app/journey/** locally. The published classroom address is
**https://ddaehling.github.io/empire-echoes/** (publication is verified in the current release record).

- **Atlas:** rotate, zoom, switch between globe and flat map, or use fullscreen. Year
  changes show additions, departures and changes of authority. Year-end snapshots
  and modern geographic approximations are explained in the interface.
- **Territory stories:** opening a place highlights it on the same global map and
  fades the surrounding app. Close restores the atlas. Stories, photographs and
  source credits remain available.
- **The enquiry:** six historical stops and a final school-magazine comment connect
  empire with British identities. Each page explains the situation, offers prepared
  evidence, then presents one clear task and an editable response. Optional language
  help and further research stay out of the main reading path. Students control
  their own progress and can revisit, revise or download at any time.
- **Learning notebook:** there are no scores, response-length targets or completion
  thresholds. Provided sources accompany exports automatically; optional notes can
  name chosen evidence. Nothing is submitted automatically.

The **Teacher guide** includes historical background, possible discussion responses,
English support, classroom pacing and connections to the three primary planning PDFs.
Download its [PDF handout](app/journey/assets/teacher-handout.pdf), use its HTML/text
exports, or print it. Allow flexible classroom time: the earlier 45-minute estimate
has not been tested with pupils, and the expanded introductions may need more time.

Core maps, text, photographs, fonts and code work without external network access when
served locally. Original source links require internet access. Fullscreen has a viewport
fallback; WebGL has an SVG fallback; motion respects reduced-motion preferences.

The current notebook uses `empire-echoes-enquiry-v4` in browser storage. Earlier v3 work
is read without changing its stored copy and is recoverable with its original questions.
Browser storage belongs to the site, browser and device: local and hosted notebooks do
not transfer automatically. Download important work before switching devices or addresses.

## Preserved version and deployment

The exact version preceding this revision is available at
[snapshots/2026-10-01-before-simplification/app/journey/](snapshots/2026-10-01-before-simplification/app/journey/).
The matching Git tag is `classroom-snapshot-2026-10-01`; its 314-file manifest is verified
by the deployment build. Both earlier applications also remain unchanged at `/app/next/`
and `/app/`.

The repository is [ddaehling/empire-echoes](https://github.com/ddaehling/empire-echoes).
GitHub Pages publishes an allowlisted `dist/` artifact; `vercel.json` supports deploying
the same build on Vercel. See [deployment instructions](docs/DEPLOYMENT.md) and
[the current revision record](docs/learning-revision/ACCEPTANCE.md). Credits and licences
are available at [licenses/](licenses/).

## Previous experience · Explore & assess

Open **http://localhost:8777/app/next/** after starting the server below.

- **Explore:** a real Three.js globe with historical colouring, rotation, zoom, place
  selection, a time slider and concise context. Switch to the flat map at any time;
  it also opens automatically when WebGL is unavailable. Search provides a keyboard
  alternative to selecting a place on the globe. Arrow keys rotate the focused globe;
  Enter selects its centre, +/− zoom, and Home resets the view.
- **Assessment:** eight required assignments in seven formats: single choice, multiple
  selection, chronological ordering, matching, map location, source analysis and an
  evidence-based argument. Allow about 35 minutes. All tasks must be complete before
  submission; feedback appears afterwards. Of 30 available marks, 18 are checked
  automatically and 12 await teacher review of the written responses.
- **Hand-in:** students download a text, HTML or JSON copy, or print/save a PDF using
  their browser. Completing an attempt locks its answers; nothing is sent automatically.
  Drafts and completed attempts are saved on this browser and device, in storage separate
  from the original version. If storage is unavailable, an in-memory draft and backup
  download remain available. Starting a new attempt asks for confirmation.

This previous version's navigation contains only Explore and Assessment. It has no guided lessons or
teacher section. Fonts, Three.js, maps and assessment content are bundled locally; source
links need internet access. The globe stops rendering when idle and respects reduced
motion. It is a classroom learning resource with client-side marking, not a secure exam
or a shared learning-management system.

The original **http://localhost:8777/app/** stays live and unchanged, including its guided
lessons, quick check, teacher tools and existing saved notes. Links in the new experience
open that version in a separate tab. Details below describe that original version.

## Open the atlas

Double-click **start.command** on macOS, or run:

```sh
npm start
```

Open **http://localhost:8777/app/journey/** for the latest version. Node.js is needed for the local server. The app itself
has no build step and needs no package installation: maps, fonts, lessons and territory
records are included in the folder. External reading links need internet access.

Use another port if needed:

```sh
PORT=8780 npm start
```

To make the server available to devices on the same trusted classroom network:

```sh
HOST=0.0.0.0 npm start
```

Students then open the host computer's local network address, for example
`http://192.168.1.20:8777/app/journey/`. A copied `localhost` link only works on the computer
running the server. School firewall/network settings may affect device access.

## Classroom experience

- **Explore:** a responsive world map, year slider, six historical waypoints, territory search,
  simplified authority views, and concise place records. Use the map's buttons to zoom and
  drag to pan when zoomed. Search provides keyboard access to all territory records.
- **Guided lessons:** three four-chapter stories about Jamaica, India and Kenya, about
  12 minutes each including discussion. Each chapter combines a short explanation, a map
  link, a question, optional notes and a hint.
- **Quick check:** five overview questions with answer explanations and a review at the end.
- **For teachers:** an adaptable 45-minute plan, learning outcomes, source guidance, and a
  printable student discussion sheet.

Notes and lesson progress are stored only in this browser on this device. They survive a
reload where browser storage is available. Completed lessons offer a text download and
printing. There are no student accounts, analytics, cloud submissions or shared scores.
If local storage is unavailable, the app keeps notes for the current tab and says so.

The atlas uses modern geographic units to approximate historical coverage. Year snapshots
simplify changes within each year. Authority is neither uniform control nor consent; the
map's explanation and territory records make those limits visible.

## Project structure

```text
app/index.html             Classroom entry point
app/css/classroom.css      Classroom design system and responsive/print styles
app/js/classroom/main.js    Navigation, lessons, quiz, notes and teacher tools
app/js/classroom/map.js     Interactive SVG atlas
app/js/classroom/content.js Curated, sourced classroom content
app/js/core/data.js         Shared historical data API
app/data/                  Original territory, event and geography data
app/assets/                Local fonts and atlas mark
app/research.html          Preserved full research experience
app/next/index.html        Preserved Explore & Assessment entry point
app/next/css/              Previous globe experience and assessment styles
app/next/js/               Globe, navigation, assessment engine and content
app/next/vendor/           Locally bundled Three.js and its licence
app/journey/index.html     Latest Empire / Echoes entry point
app/journey/css/           Atlas, territory, rallye and teacher styles
app/journey/js/            Unfolding globe, year-end data adapter and page modules
app/journey/assets/        Credited archival photographs and teacher handout PDF
```

The full research atlas remains accessible through the footer. Its original architecture,
modules and documentation are retained; see [docs/RESEARCH_ATLAS.md](docs/RESEARCH_ATLAS.md).
The classroom redesign's rationale and scope are in [docs/CLASSROOM_DESIGN.md](docs/CLASSROOM_DESIGN.md).

## Verify

Install development dependencies and Playwright's Chromium once if not already present:

```sh
npm install
npx playwright install chromium
npm test
npm run test:next
npm run test:journey
npm run test:journey:unfold
npm run test:journey:map
npm run test:journey:fullscreen
npm run test:journey:unit
npm run test:journey:progress
npm run test:journey:learning
npm run test:journey:focus
npm run validate:data
npm run build
npm run test:deployment
```

The classroom regression suite starts its own local server and checks the main classroom
flows, responsive layouts and browser errors. Older scenario tests under `tools/scenarios/`
exercise the research atlas and its former interface; they are retained for that version.

The previous-version regression suite starts a separate server on port 8880. It checks the globe,
fallbacks, assessment validation/marking, saved progress, exports, responsive layouts and
browser errors. It also verifies that all 219 original app files match the SHA-256
manifest captured before this version was added. Its browser profile is isolated from
your saved classroom work. Set `BASE_URL=http://localhost:8777/app/next/` to test an
already-running server instead. Product decisions are recorded in
[app/next/PRODUCT.md](app/next/PRODUCT.md).

The Empire / Echoes integration suite uses port 8947 and checks globe unfolding,
year-end territorial changes, territory pages, the complete written rallye, persistence,
exports, teacher-key alignment, responsive layouts and offline core access. It verifies
all 231 pre-existing app files against `tools/qa/pre-journey-sha256.json`. Its isolated
browser does not touch students' saved work. Set `BASE_URL=http://localhost:8777/app/journey/`
to test the running classroom server instead. The additional journey suites test
geometric unfolding, historical change semantics, map interaction, fullscreen entry/exit,
recovery of earlier work and territory focus on the existing global map.
The fullscreen suite accepts `BROWSERS=chromium,firefox,webkit` when those Playwright
browsers are installed. Design decisions and final evidence are in
[app/journey/DESIGN.md](app/journey/DESIGN.md) and
[docs/JOURNEY_ACCEPTANCE.md](docs/JOURNEY_ACCEPTANCE.md).
