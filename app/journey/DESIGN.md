# Empire / Echoes — design direction and review

## Use and visual idea

Secondary-school students use this atlas on laptops and tablets in a bright classroom, moving between geography, historical sources and a short written investigation. Keep the reading and controls light and legible. Give the map a distinct blue spatial stage, so the globe, changing territory and unfolding motion carry the visual interest.

The direction is a contemporary historical atlas: cool neutral page, near-black ink, deep blue map field, blue-white land and warm orange for imperial control. It is a deliberate departure from the previous green/coral identity. Orange is an encoding and action accent, not a judgement of historical events. Territorial additions and losses need labelled, distinct feedback; colour alone cannot describe them.

Use locally bundled Source Serif for enquiry and reading headings, Source Sans for UI, and tabular numerals for years. The page should feel precise rather than antique: no parchment, decorative grain, ornamental compass or nostalgic imperial imagery. Preserve historical complexity through the language and sources.

## Gallery inspection

Both supplied collections were opened in Chromium and their rendered landing pages inspected on 1 October 2026:

- [Sonnet 5.5 — 100 HTML Files](https://miaai-lab.github.io/Sonnet-5.5-100-HTML-Files/)
- [Claude Opus 5.5 — 100 HTML Files](https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/)

Eight individual examples were opened, rendered at 1440 × 1000, and visually reviewed. These are composition and interaction references, not templates or borrowed code.

| Primary reference                                                                                                             | Observed strength                                                                                                                                                                                                                       | Application to this product                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sonnet: Daylight Around the World](https://miaai-lab.github.io/Sonnet-5.5-100-HTML-Files/012-daylight-around-the-world.html) | A large enquiry sits beside a concise explanation; a broad chart and selected-place rail form one instrument. The selected place is named, not just coloured.                                                                           | Put a compact question-led title above the atlas; make the atlas and context rail the main composition. Keep place selection and current year explicit. Use a short interpretation before detailed evidence.                                                    |
| [Sonnet: Contour — Rising Tides](https://miaai-lab.github.io/Sonnet-5.5-100-HTML-Files/008-sea-level-contours.html)           | The geography fills the viewport; legends and a single meaningful control stay around its edges. Changing sea level visibly changes the world rather than only a counter.                                                               | In fullscreen, let the atlas dominate, retain the year/timeline and projection controls, and show territorial changes on the map with a readable explanation. Avoid its parchment decoration and tiny legend text.                                              |
| [Sonnet: Structure / Rhythm](https://miaai-lab.github.io/Sonnet-5.5-100-HTML-Files/025-swiss-poster-grid.html)                | Strong typographic alignment, a limited palette and programme rows create an editorial hierarchy. The captured initial frame also exposes the drawback of oversized motion-led composition: useful content can fall below the viewport. | Borrow the alignment, rules and disciplined type hierarchy. Keep the atlas visible without a large promotional hero and never hide essential content behind entrance motion.                                                                                    |
| [Sonnet: Fold — Paper Plane](https://miaai-lab.github.io/Sonnet-5.5-100-HTML-Files/075-paper-plane-fold.html)                 | A single coloured sheet changes through spatial folds; lighting and shadow make its surface legible. The object remains recognisable across states.                                                                                     | Preserve geographical correspondence throughout globe-to-map transformation. Rotate home, then unfold the existing surface. Avoid replacing it with an unrelated crossfade or scaling a flat screenshot.                                                        |
| [Opus: Long Water](https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/020-rivers-of-the-world.html)                   | Navy editorial typography, thin rules and generous data space feel like a carefully composed atlas. Approximation is disclosed near the visualisation.                                                                                  | Establish a calm reading vocabulary and a single map limitations note. Use semantic colour and geometry instead of added decoration. Keep body and metadata larger/darker than this reference.                                                                  |
| [Opus: Connected — Dot-Matrix Globe](https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/083-dot-globe.html)           | A dominant globe, consistent side rail, edge legend and fly-to selection make the interaction immediately legible.                                                                                                                      | Devote at least roughly two-thirds of the desktop atlas width to geography; fly to selection; keep the context in a stable rail. Use a light reading rail and actual territorial polygons rather than its dark dashboard, simulated traffic or decorative arcs. |
| [Opus: Skyward — History of Flight](https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/063-history-of-flight.html)    | Specific dated milestones, keyboard movement and persistent temporal orientation turn a chronology into a spatial experience.                                                                                                           | Keep a current year, meaningful turning points and keyboard year controls. Add explanations of transitions. Avoid compulsory horizontal page scrolling, repeated decorative cards or progress that implies history was inevitable.                              |
| [Opus: Senbazuru — Origami Crane](https://miaai-lab.github.io/Claude-Opus-5.5-100-HTML-Files/027-origami-crane.html)          | The object, short instruction and step rail have separate roles. The shadow anchors an object in space; each fold has an understandable destination.                                                                                    | Make unfolding a brief, comprehensible projection change. Keep labels and controls fixed as the map transforms; support reduced motion with immediate, usable final states. Use a visible sequence for the rallye because its order is meaningful.              |

Research screenshots were captured under `/tmp/journey-ref-*.png`; they are ephemeral working evidence, not shipped project assets. Only the gallery URLs above are source references.

## Composition and interaction rules

- The first desktop screen should contain the enquiry and a generous working map. Use a restrained header and a short two-part introduction. No extra marketing section before the atlas.
- On desktop, place search and historical context in a stable light rail beside the map. On narrower screens, move the rail below the atlas and keep the controls reachable. Do not squeeze a reading column to an unusable width.
- The map stage can carry committed blue colour; reading pages, teacher material and written responses use cool white surfaces and dark text. Accent is reserved for active navigation, selected places and primary actions.
- Use straight rules and modest corner radii. Repeated nested cards dilute hierarchy; prefer reading sections, a single framed map and ordered station navigation.
- Keep the year and projection controls in consistent locations. The globe should feel like a geographical object, with calm lighting and precise outlines. It must stop rendering when idle.
- Unfolding should first restore orientation, then visibly open the geographical mesh into the rectangular map. Keep the final rectangle fully visible; no decorative clipping of corners. Reverse the operation coherently when returning to the globe.
- Deep-linked territory pages begin with a top-centred focused map. Fade surrounding geography while retaining enough to locate the territory. Follow with readable history, present-day identity connections, relevant photographs and clear provenance.
- The rallye has a visible time budget and real station progress. Required writing, source access and saved state must be obvious. A finished report distinguishes submitted work from teacher assessment.
- The teacher guide is a separate reading surface with a printable handout. Keep its reference material substantial but outside the student's immediate route.

## Acceptance criteria for the integrated build

Verify rendered desktop (1440px), tablet (768px) and mobile (390px), plus narrow 320px and text zoom where practical. Inspect the actual WebGL stage, fallback map, territory page, rallye question, review/report and teacher page; a clean landing screenshot does not prove the product.

Check no horizontal page overflow, no clipped headings or controls, readable map labels, appropriate touch targets, visible keyboard focus, labels for icon buttons, and no overlap during a projection transition. Body text requires at least 4.5:1 contrast and meaningful map/UI boundaries at least 3:1 where needed. All interaction must remain available without hover, and state differences must have textual labels.

Motion must respect reduced motion. Fullscreen must retain an obvious exit and usable atlas controls. After entering/leaving fullscreen, resizing and changing projection, selection and current year must remain coherent. Geography and sources must remain authoritative; visual polish must not imply greater historical precision than the dataset supports.

## Integrated review status

Initial shell review completed at 1440, 768 and 390 pixels on 1 October 2026. The revised masthead, flat navigation, navy tool frame and cool neutral reading surfaces visibly depart from the previous green/coral system. No horizontal page overflow appeared in those three rendered shells.

Sent to the design implementation owner for refinement:

1. Reduce header/intro vertical space. The initial desktop scene began at y377.5 and the mobile scene at y533; this pushes the actual geography too far down a normal classroom screen.
2. At 768 pixels, the initial two-column atlas leaves a 436-pixel map beside a 270-pixel reading rail. Move to a full-width map at a wider breakpoint and let tablet context use two columns if useful.
3. When waypoint text labels collapse, retain descriptive accessible names/tooltips so dates still communicate their meaning.

The initial screenshots showed the loading shell while modules were being integrated. The actual globe, territory page, rallye, report and teacher guide remain unverified by this review. Further findings will be recorded after integration; these preliminary observations are not a finished-product validation.

Palette review measured these sRGB contrast ratios from the first committed shell tokens: ink/background 14.47:1, body/background 8.84:1, muted/background 5.37:1, action orange/white 5.54:1 and blue/white 8.19:1. The original map orange/land contrast was only 1.54:1. The design owner accepted a darker ordinary map boundary (`#415976`, 3.73:1 against land) and an imperial boundary token (`#713813`, 3.10:1 against the orange fill, 4.77:1 against land). The globe and flat-map owners were asked to consume these tokens in their actual rendered geometry.

A subsequent atlas preview with actual data, globe and map feedback was reviewed at desktop, tablet and mobile. That preview temporarily stubbed the missing rallye module in its browser, so it is only atlas visual evidence. The new full-width tablet map and compact header corrected the initial layout concerns. The atlas appeared coherent and legible; final unmodified runtime verification remains required.

### Integrated runtime review

The actual, unmodified `/app/journey/` route subsequently booted with every module. A clean browser profile rendered Atlas, British India, Rallye and Teacher at 1440, 768 and 390 pixels (12 full-page captures): zero page errors and no horizontal page overflow in those checks. Additional viewport captures inspected the territory map/photo, the first rallye station, and the expanded first teacher key. The local Salt March photograph decoded correctly after scrolling into view.

The teacher page passed the visual review: comfortable text measure, clear reference navigation, readable disclosures and accessible-size export actions on desktop and mobile. The territory map passed the requested composition: centred focus, faded surroundings, a locator inset and clear coverage caveat. Territory chronology was flagged for a usefulness improvement: British India's initial five entries were all before 1700 while major nineteenth-century change and independence were hidden in the expanded list.

The first integrated rallye exposed CSS/DOM alignment defects and is **not yet signed off**: native-sized name inputs, default list formatting, titles/dates/minutes touching, and a narrow mobile route strip trying to display full titles. The style owner received these findings and screenshot locations. Final visual verification of the corrected rallye remains required, as does the root integration owner's broader functional, motion, print and preservation testing.

### Visual sign-off after corrections

The reported rallye defects were corrected and the revised, actual runtime renders reviewed: introduction, first station, final written argument, review and completed report. The form controls, route list, source actions and notebook spacing now share the shell's component language. Mobile uses a compact numbered station rail, and the start form appears immediately after the short introduction rather than after the full route and instructions. The first name input moved from roughly y1750 to y698 at 390 pixels.

The territory owner replaced the earliest-five chronology preview with dataset-authored teaching key dates. British India now previews 1600, 1765, 1857, 1858, 1919 and 1947; the full 58-event chronology remains available in a disclosure. Additional rendered checks of Hong Kong, Jamaica and Commonwealth of Australia confirmed that small island groups and a large continent receive an appropriately focused, centred map with subdued surrounding geography.

A further independent 320-pixel check of Atlas, Commonwealth of Australia, Rallye introduction and Teacher found no horizontal overflow. The actual mobile rallye heading receives focus on starting; the skip link stays above the viewport as expected. Its appearance in some full-page screenshots is an artefact of capturing a fixed element after scrolling, not a live overlap.

**Visual review result:** the substantive findings raised by this review are resolved. Atlas, territory reading, rallye and teacher surfaces now form a coherent blue/ink/orange educational product. The developer may still add quiet read/write jump controls to reduce back-and-forth scrolling during written investigation; this does not require removing core evidence or changing the visual concept.

**Scope of this sign-off:** visual layout, hierarchy, palette, representative imagery and responsive behaviour. The root integration owner remains responsible for the full functional, accessibility, geographical, motion, print/export and old-version-preservation gates. This design document does not claim those gates have passed merely because the screenshots look correct.
