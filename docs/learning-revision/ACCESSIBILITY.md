# Accessibility and responsive review

Independent review of the ungraded revision, 1 October 2026. **No unresolved accessibility or responsive blockers were found in the audited scope.** The two global 320 px text-resize defects found during review were corrected and rechecked.

## Scope and evidence

The final `ungraded-2026-10-01` interface was checked in isolated Playwright Chromium contexts against the running local server. The existing port 8777 server and the user's browser profile were not changed. Source-file hashes, the 58-screen matrix, nine interaction checks and legacy recovery results are recorded in [ACCESSIBILITY_RESULTS.json](ACCESSIBILITY_RESULTS.json).

The audit covers the introduction, six historical tasks, final comment, optional disclosures, review, downloads, fresh-notebook dialog, historical recovery, atlas return and teacher guide. It combines real screenshots, browser accessibility trees, keyboard interaction, DOM measurements and axe-core WCAG 2 A/AA and 2.1 AA rules. This is not a claim of complete WCAG conformance or a substitute for testing with assistive-technology users. Actual VoiceOver/NVDA speech output was not tested. Cross-browser functional testing is a separate root-owned check.

## Final results

| Check | Evidence and result |
| --- | --- |
| Responsive layout | All seven tasks at 320, 390, 768 and 1440 px: no horizontal overflow. |
| 200% text | All seven tasks at 320, 768 and 1440 px, with every computed text size doubled: no horizontal overflow or observed clipped task content. Header and footer wrap. |
| Automated accessibility | 16 document-wide student scans: introduction, seven tasks closed and expanded, and review. Zero WCAG A/AA violations; no browser JavaScript errors. |
| Contrast | axe found no failures. Its only incomplete student contrast check was `#nav-count`; the explicit colours `#284b9a` on `#e8edf8` calculate to 6.98:1. Keyboard controls showed a visible 3 px focus outline. |
| Keyboard order | Starting or changing a task focuses its heading. Tab reaches source details, the labelled primary response, learner-controlled checkbox, optional disclosures, navigation and download/reset tools in a meaningful order. |
| Disclosures and labels | Native summaries respond to Enter/Space and expose expanded/collapsed state. Each task has one primary response field with a visible associated label. Optional notes remain collapsed by default. |
| Mobile route | At 320 px the seven task buttons are about 37.4 × 44 px. Their accessible names include the full title/period even when mobile shows a compact number. Current task uses `aria-current="step"`. |
| Save/review state | Marking a stop and saving the review produce polite live announcements. Marking done is learner-controlled; responses remain editable after saving a review. |
| Atlas and territory return | The visible top “Back to your task” link and territory Escape return preserved the response, open research disclosure, originating button focus and exact scroll position (1670 px in the tested case). |
| Reset dialog | Labelled/described native dialog initially focuses “Keep writing here”. Tab reaches its actions without entering background page controls; Escape closes it and restores the opener. |
| Recovery | Starting fresh leaves the preceding answer in a separate recovery download. Seeded legacy v3 data was preserved unchanged in the old storage key and original-data recovery payload. The current response starts empty. Expanded recovery reported zero axe violations. |
| Ungraded accessible text | No grading, score, rubric or word-count requirements were found in the rendered text or accessibility trees, including expanded optional content. “Mark this stop as done” is a personal completion control, not an assessment mark. |
| Teacher guide | Closed and expanded guide reported zero axe violations. It reflows at 320, 390, 768 and 1440 px, and its content wraps at 320 px with doubled text. Native disclosure keyboard operation and visible focus passed. |

The introduction's final reading order places “Begin the enquiry” before the route preview. Screenshot inspection confirms a readable task column, one writing area and optional tools with distinct disclosure labels.

## Resolved findings

1. The original global brand/navigation overflowed to 362 px at 320 px with text doubled. The root owner added header wrapping and width constraints. The final full matrix passes.
2. The newly added “Previous classroom version” footer link overflowed to 364 px at the same text size. The root owner enabled footer wrapping and link word wrapping. All seven final task pages pass the repeat check.

No application files were edited by the accessibility reviewer.

## Representative screenshots

- [Introduction, 390 px](screenshots/accessibility-intro-390.png)
- [Task context, 390 px](screenshots/accessibility-task-390.png)
- [Response and optional help, 390 px](screenshots/accessibility-response-390.png)
- [Header, 320 px at 200% text](screenshots/accessibility-header-320-200pct.png)
- [Footer, 320 px at 200% text](screenshots/accessibility-footer-320-200pct.png)

The complete 58 captures, text dumps and accessibility trees are retained locally under `/tmp/learning-accessibility/final/`. The observational matrix can be rerun with `node tools/learning-accessibility-audit.js`; set `BASE_URL`, `QA_ARTIFACT_DIR` and `AXE_PATH` when using another server or axe-core installation.

## Baseline comparison

Before revision, the first task at 390 px was 3,474 px tall, repeated its question and exposed a citation notebook, word-count requirements, marks and assessment guidance. The revised first-task capture was 2,716 px tall while providing more introductory context. All seven baseline tasks had already reported zero axe violations: automated accessibility checks alone did not detect the clutter or educational restrictions being revised.
