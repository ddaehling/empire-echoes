# Classroom learning revision — completion record

Date: 1 October 2026. Content revision: `ungraded-2026-10-01`. This record supersedes the current-use grading, response-length and layout requirements of the preceding unit-alignment revision. That preceding version remains frozen and accessible.

## Requested changes and evidence

| Requirement                                                       | Implemented behavior and verification                                                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove grading references from assignments                        | No grades, points, rubrics, score summaries or grading disclaimers in current student prose. Current content no longer defines assessment values. UI, TXT, HTML, JSON and teacher material checked. Old metadata survives only in explicitly separate original-work recovery files and the frozen older website.     |
| Remove all word-count guidance and constraints                    | No suggested lengths, counters, minimum/maximum attributes or hidden word-based gates. Empty, concise and 21,000-character responses are accepted and preserved. Progress is a learner's reversible choice.                                                                                                          |
| Expand each introduction                                          | All seven tasks have connected introductory paragraphs. They explain unfamiliar actors and ideas, including the Company, charter, enslaved labour, Crown rule, partition, Windrush's ship/generation/scandal, Mau Mau and liability.                                                                                 |
| Make assignments clearer                                          | One concrete task beside one response area. Partition names the two countries and the end of British rule, then asks for a supported human experience, with source dates distinguished. The final comment explains its audience, choice of cases and an alternative influence or evidence limit.                     |
| Reduce clutter and redesign pages                                 | One situation → essential evidence → task → writing flow; optional language help, research and notes are collapsed. Duplicate prompts, citation administration and assessment panels removed. Mobile navigation is compact, intro starts before the full route list, and map return restores the learner's position. |
| Dedicate ten revision agents                                      | learning_author, context_writer, source_editor, interface_builder, visual_designer, progress_engine, teacher_revision, learning_qa, deployment_prep and accessibility_review. Each owns a report or verified deliverable.                                                                                            |
| Five separate student-perspective reviews, iterated to acceptance | All five independently reviewed actual pages, rejected the baseline, accepted the redesign and rechecked the final shared nine-file hash manifest after refinements. Ratings below. These are simulated perspectives, not actual pupil participants.                                                                 |
| Preserve current version                                          | Exact app/docs snapshot at `snapshots/2026-10-01-before-simplification/`, 314-file SHA-256 manifest, and Git tag `classroom-snapshot-2026-10-01` at initial commit `a337058`. Original v3 storage is never overwritten by the new enquiry.                                                                           |
| Push to GitHub                                                    | Repository created at `https://github.com/ddaehling/empire-echoes`; initial snapshot commit and tag pushed. Final revision push and live publication recorded below.                                                                                                                                                 |
| Publish for students or make Vercel-deployable                    | GitHub Pages configured for Actions; dependency-free static build and relative paths verified at both hosting root and `/empire-echoes/`. Vercel configuration builds the same allowlisted artifact. Live publication verification follows below.                                                                    |

## Independent simulated learner acceptance

Each dimension uses 1–5; acceptance requires at least 4 in every dimension and no blocking confusion. The reports record observations and individual decisions, not inferred approval. Final reviewed manifest: `reviewed-build.json`, SHA-256 `2a8c00ca443d7aba5b9f70d0bce23da726598c84f7d906693396eed6bd13823c`.

| Perspective         | Context | Instructions | Visual focus | Usability | Autonomy | Final decision |
| ------------------- | ------: | -----------: | -----------: | --------: | -------: | -------------- |
| Historical novice   |       4 |            4 |            4 |         4 |        4 | Accepted       |
| B2 English learner  |       4 |            4 |            4 |         4 |        5 | Accepted       |
| Mobile learner      |       5 |            4 |            4 |         4 |        5 | Accepted       |
| Task clarity        |       4 |            4 |            4 |         4 |        4 | Accepted       |
| Independent learner |       4 |            4 |            4 |         4 |        5 | Accepted       |

The first reviews found unexplained historical terms, competing instructions, long scrolling, citation administration and inflexible completion. Iteration expanded context and replaced the workspace. Final refinements moved the intro's start form ahead of the route list, explicitly labelled optional research, defined Sikh at first use, aligned headings with the actual primary cases and fixed footer reflow. All five final reviewers verified the same runtime hashes; unchanged seven-task evidence carries forward from their full first review.

## Verification

| Suite                                      |         Result |
| ------------------------------------------ | -------------: |
| Learning content/source integrity          |       3 passed |
| State and migration                        |      14 passed |
| Actual learning/recovery/exports           |      15 passed |
| Broad atlas, territory and learning flow   |      13 passed |
| Unfolding and year-colour transitions      |      18 passed |
| Territory focus and WebGL recovery         |      13 passed |
| Fullscreen in Chromium, Firefox and WebKit |      60 passed |
| **Functional total**                       | **136 passed** |

The accessibility audit inspected 58 rendered states, including all seven tasks across phone/tablet/desktop widths, expanded disclosures and 200% text. It found no horizontal overflow or browser errors and zero automated WCAG A/AA violations in scanned states. Nine interaction checks cover focus, keyboard, disclosures, reset, review editing, old-work recovery and exact map-return position. This is automated/agent review, not comprehensive certification or a physical-device trial.

The 23-page teacher guide matches current tasks and scenarios. Export parity covers 43 strings; PDF parity covers 71. All final PDF pages were visually inspected, with unchanged page images byte-matched after the final metadata refresh. Final PDF SHA-256: `717d46b5b8e9f1ed842cff72037d82794c5c2ff29e7e719a581ee6bf5187d5a8`.

All 231 earlier application files remain unchanged. All 314 frozen snapshot files match their manifest. Production build verification checks 534 public files and 854 local references, copied bytes, dependency paths and publication exclusions. The public site contains runtime assets and generated handouts, not source planning PDFs, internal reports, screenshots, dependency caches or student browser storage.

## Publication record

Repository: https://github.com/ddaehling/empire-echoes

Planned current address: https://ddaehling.github.io/empire-echoes/

Preserved address: https://ddaehling.github.io/empire-echoes/snapshots/2026-10-01-before-simplification/app/journey/

Status at candidate freeze: all local acceptance gates passed; final commit, Actions deployment and live HTTP/browser verification pending. This paragraph must be replaced with actual deployment evidence before the goal is marked complete.

GitHub Pages fits the static application. Vercel is an optional alternative, not required. Browser writing stays on the same origin/device; moving from localhost to the published site does not transfer it automatically. The earlier 45-minute estimate is not a pupil-tested duration, especially with expanded context. The flat map's documented date-line seam and approximate historical coverage remain unchanged.
