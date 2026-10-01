# Q2 English alignment and territory spotlight: completion audit

User scope: align the rallye, its assignments and design with all three confirmed teaching-unit PDFs, using at least ten agents; change assignments where needed. Two further agents implement and verify opening a territory by zooming and highlighting it on the existing global map while fading the rest of the app.

## Primary evidence

The user confirmed the detailed 213-page lesson plans, 129-page teacher handbook and 22-page textbook/material research in Downloads. Exact filenames and SHA-256 hashes are in `primary-sources.json`. The concise plans and three Britishness DOCX files are authorized supplementary evidence. Current official Schleswig-Holstein gN rules were separately checked; they take precedence over planning documents for regulatory claims. No commercial textbook's full text is assumed available merely because a report lists it.

Eleven agents were dedicated to English alignment: `unit_curriculum`, `unit_handbook`, `unit_lessonplans`, `unit_classroom_texts`, `unit_assessment`, `unit_language`, `unit_sources`, `unit_ux`, `unit_tasks`, `unit_teacher`, and `unit_engine`. Exactly two additional agents own the atlas focus work: `atlas_focus_build` and `atlas_focus_qa`. Their individual reports live in this directory.

## Requirement gates

| Requirement                                                                                                       | Evidence required                                                                                  | Current status                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| All three primary documents drive the revision                                                                    | Exact source/page mappings, official-rule distinction, teacher-material relationships              | Passed: TASK_REVISION, CURRICULUM, TEACHER and UNIT_ALIGNMENT; all three source hashes unchanged                |
| Tasks practise relevant Q2 English skills while retaining historical enquiry into contemporary British identities | Actual final prompts, original wording for analysis, criteria, model responses, optional support   | Passed: independent assessment and language reviews accepted all seven final products                           |
| Workload remains about 45 minutes including final assessment                                                      | Final timings, bounded reading/writing load, explicit planning/revision allocation                 | Passed as a planning estimate: 30 + 15 minutes; 1,999 core words; 275–420 written words; no pupil trial claimed |
| Design supports understanding each task before reading and writing                                                | Rendered task preview, source labels, optional support, touch/keyboard/mobile checks               | Passed: 28 stage views, four review views, 200% text and three-browser recovery checks                          |
| Teacher key and portable handout match final assignments                                                          | Dynamic prompt/rubric checks, source provenance, unit/textbook placement, regenerated PDF/HTML/TXT | Passed: 24 PDF pages visually reviewed; 87-string Markdown/TXT parity and independent HTML review               |
| Earlier drafts/completed work remain recoverable when prompts change                                              | Content revision snapshots, archive downloads, unavailable-storage tests; no silent regrading      | Passed: nine unit-alignment checks including original identity, prompts, separate exports and quota failure     |
| Territory opens using the existing global globe/rectangle                                                         | Same canvas/scene DOM, actual camera change and selected region highlight; projection preserved    | Passed: original DOM identity plus measured globe/flat/SVG zoom and restoration                                 |
| Rest of app and unselected geography fade while active story stays readable                                       | Actual rendered frames at representative territory sizes and viewports                             | Passed: independently inspected desktop/mobile frames; surrounding-page luminance reduced by about 68%          |
| Focus interaction restores the atlas and student context                                                          | Close/Escape/back/deep link, camera/year, fullscreen, reduced motion, keyboard, fallback           | Passed: 13 focus scenarios including runtime WebGL loss; 60 fullscreen checks across three browsers             |
| Integrated quality and existing features remain intact                                                            | Root flow, dedicated suites, earlier regression suites and 231 preserved files                     | Passed: all 185 automated regression checks and preservation checks                                             |

## Agreed implementation direction

Keep six historical stops and a final English comment. Allow 30 minutes for focused notes/explanations, audience-aware rewriting and authentic wording analysis, followed by 15 minutes for planning, writing, revising and exporting the final comment. The final remains a causal, qualified enquiry into how imperial history helps explain plural British identities, with two developed historical-to-contemporary connections. A magazine audience supplies purpose and register. It is not a generic debate about whether history should be taught.

Curated local material is sufficient for the timed core; original websites support research and checking, while extended browsing and supplementary class texts remain optional follow-up. Short source quotations, editorial paraphrases and invented teaching stimuli must be clearly distinguished. The local 40-point rubric supplies teacher feedback and is not an official Abitur score. The teacher key must name the reading/writing focus and avoid claiming coverage of listening, mediation, literature or the whole semester.

The spotlight keeps the same global-map renderer, with the chosen projection. It frames and highlights the selected territory, dims other geography, and makes the surrounding app inactive and visually subdued. Existing story text, photographs and provenance remain available. Focus is a selection emphasis, not a claim that the territory is under British authority in the current year.

## Integrated verification

| Suite                                   |  Result |
| --------------------------------------- | ------: |
| Original classroom                      | 10 / 10 |
| Previous Explore & Assessment           | 17 / 17 |
| Complete latest application flow        | 14 / 14 |
| Historical map semantics                | 27 / 27 |
| Map interaction and SVG fallback        | 17 / 17 |
| Fullscreen, Chromium / Firefox / WebKit | 60 / 60 |
| Unit content and saved-work recovery    |   9 / 9 |
| Territory focus and runtime fallback    | 13 / 13 |
| Unfolding and year-colour transitions   | 18 / 18 |

Automated WCAG 2 A/AA, WCAG 2.1 AA and best-practice scanning found zero violations across 15 states: atlas, search, territory desktop/mobile, teacher, rallye intro, all seven responses and review desktop/mobile. This is automated coverage, not a claim of comprehensive accessibility conformance. Responsive checks include 320, 390, 768 and 1440px; optional help, keyboard focus and recovered work were visually inspected. All 231 earlier app files still match the preservation manifest. The three primary PDFs are unchanged. All three local app URLs and the revised teacher PDF return HTTP 200 on port 8777, which stayed running.

Root updated old integration-test expectations to match the intended architecture: the atlas stays visible and inert behind the territory dialog, and closes through its active controls. An obsolete hidden-map expectation and a duplicate hidden return-link selector caused initial cascading failures; the corrected full student flow passes 14/14. No actual viewport overflow remained. The focus audit records the implementation defects found and fixed before acceptance.

The 45-minute duration needs a classroom trial. The flat world's fixed date-line seam still divides Fiji; the visible caption explains the split and available navigation, while the globe provides a continuous view. Modern boundaries and annual snapshots remain approximate. Fullscreen/recovery coverage uses browser automation; no physical iPad trial is claimed. These limits are documented in the product and teacher materials.

The initial geometric-midpoint screenshot check was timing-sensitive: screenshot encoding could advance the live animation past the intended frame. It now uses a separate controlled browser clock, captures the production mesh at a morph value near 0.5, and retains the existing silhouette, pixel and corner assertions. The complete 18-check unfolding suite passes. The application animation itself was unchanged. Final regression total: **185 passed, zero failed**.
