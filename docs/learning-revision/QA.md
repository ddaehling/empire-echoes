# Learning revision acceptance

Verified on 1 October 2026 against content revision `ungraded-2026-10-01`, using the real current application in Chromium. All browser profiles were temporary; servers used private ephemeral ports. Port 8777 and existing student browser storage were not touched.

## Results

| Check | Result | Command |
| --- | --- | --- |
| Current learning content and source integrity | 3 passed | `npm run test:journey:unit` |
| Pure progress and migration behavior | 14 passed | `npm run test:journey:progress` |
| Actual ungraded learning, teacher and recovery flows | 15 passed | `npm run test:journey:learning` |
| Broad atlas, territory, learning and responsive regression | 13 passed | `npm run test:journey` |

No unresolved functional failure was found in these checks. This report records automated acceptance and a screenshot inspection, not real student participation or a claim of cross-browser coverage.

## What the browser tests prove

- All six historical tasks and the final comment show their current scenario and exact task. The learner has one editable response. Optional language, research, map and notes tools remain available behind disclosures.
- The current student UI, JSON, text and HTML exports and teacher UI/documents contain no grade, point, rubric, word-count, word-target or response-length requirements. The response textarea has no minimum or maximum length attribute.
- Empty work can move forward and save a review. A concise factual response and a long text fixture exceeding the previous character limit both survive exactly. Writing does not automatically decide whether a task is done; the learner explicitly toggles that state.
- Optional chosen-evidence notes are saved. Source titles, URLs, authentic excerpts, prepared summaries and limitations remain attributable. Current exports explicitly distinguish provided material from sources the learner actually selected.
- Saving a review leaves every answer editable. An edit survives a map excursion, a territory story, return to the learning workspace and reload. All seven task responses export successfully, including HTML escaping of learner text.
- Teacher text contains the exact current student prompts. The teacher HTML/text and rendered teacher view agree with the ungraded learning design.
- The learning workspace has no horizontal overflow at 320, 390, 768 and 1440 pixels. The 320-pixel screenshot was visually inspected: context, evidence, task and response form a readable single column and optional tools stay collapsed.
- An earlier v3 storage string is byte-for-byte unchanged after reading, new writing, reload, starting a fresh notebook and a simulated quota failure. Old answers are never attached to rewritten questions. Separate recovery JSON retains the complete original object; recovery text retains original prompts, unknown old task IDs, answers and notes. Current portfolios exclude earlier-attempt content.
- Under a simulated storage quota failure, an unavailable-autosave notice and current-work backup remain available. The separate original-work recovery download still functions.
- The frozen pre-simplification snapshot passes its full SHA-256 manifest before and after the learning suite. The broad suite also verifies all 231 pre-journey files, real WebGL behavior, territory imagery, responsive routes, optional-network independence and absence of browser errors or failed local assets.

## Test maintenance

`tools/journey-learning-test.js` is the new integration suite. Its shared `tools/qa/learning-harness.js` uses ephemeral ports and temporary contexts. `tools/journey-unit-test.js` now checks the current learning-content contract rather than the removed assessment model. `tools/journey-test.js` preserves atlas assertions while checking editable ungraded work. `tools/journey-focus-test.js` retains its existing focus assertions and imports the current storage key instead of assuming v3; it opens the now-optional research disclosure before selecting a territory story.

The first learning run found two test assumptions requiring correction: printable HTML legitimately escapes apostrophes, and the new storage key is written on a learner action rather than merely viewing recovered work. The corrected tests inspect equivalent exported text and verify persistence after actual input. No application behavior was weakened to make the tests pass.

## Local evidence

The learning suite writes `results.json`, screenshots of all seven task pages, four responsive screenshots, current JSON/text/HTML portfolios, the teacher HTML and separate original-work recovery JSON to `/tmp/empire-learning-qa/`. The broad regression writes screenshots and printable report artifacts to `/tmp/journey-final-*`. Set `QA_ARTIFACT_DIR` when a different artifact destination is needed.

The dedicated accessibility review and five independent simulated student-perspective reviews are recorded separately. Their acceptance decisions are not inferred from these automated checks.
