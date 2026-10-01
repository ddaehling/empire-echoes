# Learning workspace design — 1 October 2026

Students use this enquiry on school laptops, tablets and phones in a bright classroom. The page should make the historical situation understandable, keep source evidence readable, and let a student write without operating an assessment dashboard.

The revised workspace preserves Empire / Echoes’ navy ink, orange accent, cool white surfaces, locally bundled Source Sans and Source Serif. It uses a restrained reading sheet and a route, with no new decorative illustrations, nested cards or repeated card grid. Impeccable’s product guidance informed hierarchy, contrast, control consistency, reflow and reduced motion.

## What changed

| Before | Revised learning workspace |
|---|---|
| The complete question appeared in a task preview and again above the answer. | The question appears once, directly above its response field. |
| Reading, research instructions, map actions, citation buttons, grading details, writing, word guidance and a notebook competed for attention. | One reading sequence: the situation → evidence to use → the task and response. |
| A brief context assumed prior knowledge of unfamiliar historical terms. | Expanded connected context uses a comfortable reading measure and paragraph spacing. Content authors own its substance. |
| Source links and citation management were visible before writing. | Essential evidence and source limitations remain visible. Provenance/originals use named disclosures; optional exploration and language help follow the answer. |
| The sidebar combined the route, progress, map navigation, download controls and restart. | The sidebar contains the seven stops and review access. Notebook tools live below the assignment. |
| Completion meant meeting checks and preparing a hand-in. | The editable notebook has a student-controlled “Mark this stop as done” control and review/download access. |

The renderer and learning-state owners removed grading and word-count behavior. CSS supports the new semantics rather than concealing old assessment controls.

## Layout and accessibility decisions

- On the entry page, the start form precedes the full route preview in mobile reading order. At 390px this moves the Begin action from y1580 to y1008 without removing the introductory explanation.
- Desktop uses a 204px route rail and one reading/writing column. Prose is limited to 68ch. Clear section spacing and fine horizontal rules replace separate cards and toolbars.
- At 800px and below, the route becomes seven evenly spaced number buttons. Full titles and state remain in each accessible name. The current stop uses a filled navy circle and `aria-current`, with its full title in the page heading.
- The source text is 17px on desktop and 16px on narrow phones; editable fields remain 17px. The main question uses a modest larger weight/size, rather than a second display heading.
- Source attribution and source limits stay next to the evidence. Original wording is visually distinguished with Source Serif; prepared summaries are explicitly labelled as paraphrases.
- Form boundaries use `#8b95a5`, which measures 3.03:1 against white. Text/white contrast: navy `#18233b` 15.64:1, body `#39465a` 9.56:1, muted `#5c6676` 5.81:1. Orange `#b44421` focus rings measure 5.54:1 against white.
- Standard actions/disclosure summaries are at least 44px tall. At 390px the seven route targets are approximately 47×44px. At 320px they are approximately 37×44px, above WCAG 2.2’s 24px minimum while keeping all seven visible without horizontal scrolling.
- Focus uses a visible 3px orange outline with a 4px offset. Reduced motion removes transitions and animations. No content depends on entrance animations.

## Rendered verification

A private headless Chromium context served the project on port 8976; port 8777 was untouched. No real student answers were entered or represented as research evidence. The separate learner reviews are simulated perspectives.

`visual-checks.json` records all seven stops at 320, 390, 768 and 1440px (28 combinations):

- No horizontal page overflow.
- Exactly one main question and one answer textarea per stop.
- 17px answer fields at every tested width.
- Keyboard navigation from the answer reaches the done checkbox, then the language-help disclosure. Enter opens the disclosure; its focus outline is 3px orange.
- Reduced-motion mode reports `0s` transition duration and no animation on the next action.
- No page JavaScript errors during the sweep.

The independent accessibility reviewer additionally reported zero axe violations and zero horizontal overflow across 40 screens, including all seven tasks and 200% text checks at 320, 768 and 1440px. See that reviewer’s final report for their complete acceptance scope.

## Concrete before/after

The first-stop screenshots use the same 1440px desktop and 390px phone widths. The scenario text is longer in the revision, while the complete page is shorter:

| View | Before page height | Revised page height | Difference |
|---|---:|---:|---:|
| Desktop, 1440px | 2736px | 2305px | −431px (16%) |
| Phone, 390px | 3474px | 2775px | −699px (20%) |

These are rendered page measurements from the first integrated pass, not a target length for the student's response. Source-heavy stops still require reading and vertical scrolling; the design does not collapse essential context to claim a smaller page.

Screenshots:

- [Desktop before](screenshots/before-desktop.png) · [desktop revised](screenshots/after-desktop.png)
- [Phone before](screenshots/before-mobile.png) · [phone revised](screenshots/after-mobile.png)
- [Tablet revised](screenshots/after-tablet.png)
- [Entry page on a phone](screenshots/after-intro-mobile.png) · [desktop entry page](screenshots/after-intro-desktop.png)
- [Crown-rule task on a phone](screenshots/after-mobile-rule-and-resistance.png)
- [Windrush task on a phone](screenshots/after-mobile-migration-and-belonging.png)
- [Final comment on a phone](screenshots/after-mobile-whose-britain.png)
- [Editable review on a phone](screenshots/after-review-mobile.png) · [desktop review](screenshots/after-review-desktop.png)
- [Machine-readable rendered checks](screenshots/visual-checks.json)

Implementation ownership: `app/journey/css/rallye.css` and this report. Renderer changes were coordinated with `interface_builder`; historical wording and evidence were revised by their respective owners. This work does not alter the preserved snapshot, `/app/` old files, or `/app/next/`.
