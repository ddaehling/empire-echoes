# Simulated student perspective: phone / small tablet

This is an independent **simulated test persona**, not a real pupil, user study, or evidence of classroom learning outcomes. Persona: a learner using a 390px phone (also checked at 320px and 768px) who easily loses their place while scrolling.

## Baseline inspection — 1 October 2026

Inspected all six stops and the final comment in the actual browser UI with isolated, ephemeral Playwright Chromium contexts; no user browser profile or user storage was accessed. Private test server: port 8963. Viewports: 320×844, 390×844 and 768×844. Port 8777 was untouched.

**Baseline acceptance: not accepted.**

| Dimension | Score / 5 | Evidence |
| --- | --- | --- |
| Context | 3 | Relevant history is present, but the opening paragraphs assume Company/Crown/partition vocabulary and do not consistently establish an understandable classroom scenario. |
| Instructions | 3 | The response type is named, but the full prompt is repeated and competes with separate source-saving and length requirements. The final comment adds a separate source collection task. |
| Visual focus | 2 | The page contains multiple task formulations, source toolbars, an open required notebook, optional research tools and assessment metadata. It is difficult to see a single reading-to-writing path. |
| Usability | 3 | No horizontal overflow at any tested width; readable controls and useful top jump links. However, response fields begin several screens down, and map return loses the previous reading/writing position. |
| Autonomy | 3 | Learners can move between stops, use source cards offline and save drafts. Mandatory citation administration, completion gates and a distant explicit map-return link create avoidable dependency on teacher help. |

### All seven pages at 390px

Numbers are CSS pixels from the page top, recorded from the actual rendered UI before the content/UI rewrite was integrated.

| Page | Total page height | First response field starts | Specific mobile friction |
| --- | ---: | ---: | --- |
| When trade becomes rule | 3,474 | 2,562 | Full task appears twice; main input is three screens below the start. |
| Who made freedom happen? | 4,750 | 3,441 | Two large source cards, save-source controls and expanded required notebook compete with writing the replacement label. |
| One colour, unequal power | 3,812 | 2,901 | Wording analysis is separated from the authentic quotation by several source controls and repeated task text. |
| Independence is more than a border | 3,454 | 2,542 | A short requested response still requires a long page traversal; unfamiliar partition vocabulary arrives quickly. |
| Who gets to belong? | 4,801 | 3,492 | Longest 390px page; two source cards plus notebook make it difficult to retain the legal-status/belonging question. |
| When does an empire end? | 4,402 | 3,094 | Legal wording task, source interpretation, optional comparison and notebook all compete for attention. |
| The past inside the present | 3,987 | 2,600 | Long prompt repeated in full; separate planning, reading, source selection, language support and writing sections. |

At 320px, first response fields began at 3,052–4,207px. At 768px they began at 1,981–2,808px. All 21 rendered task/viewport combinations had document width equal to viewport width: no horizontal overflow.

### Reading, writing and map-return probes

- The “Write your response” jump focuses the prompt, keeping it above the input. This is useful and should be retained without repeating the entire task earlier.
- Typed a labelled test draft, opened the atlas from the task and returned. The draft survived and the same stop reopened.
- At 390×844 the explicit “Return to your rallye” link was 2,074px below the viewport top on the atlas. The generic top navigation “The rallye” was visible; its wording did not explicitly promise to resume the current task.
- Returning reset scroll to zero rather than the prior writing/evidence location. For this persona, that is a significant interruption because they must rediscover their place.
- The later map probe overlapped active author/UI integration. Temporary `undefined` metadata in that probe is not treated as a stable finding or included in the acceptance score.

### Screenshots and measurements

All images below are actual browser screenshots of a **simulated test persona**, not photographs or evidence from real learners.

- [390px Jamaica — entire baseline task](/tmp/student-mobile-baseline/testpersona-390-freedom-and-memory.png)
- [390px final comment — entire baseline task](/tmp/student-mobile-baseline/testpersona-390-whose-britain.png)
- [390px atlas — return action absent from initial viewport](/tmp/student-mobile-baseline/testpersona-390-atlas-return.png)
- [Baseline measurements and rendered task text, all 21 combinations](/tmp/student-mobile-baseline/measurements.json)
- Complete screenshot set: `/tmp/student-mobile-baseline/testpersona-{320|390|768}-{station-id}.png`.

### Specific requested fixes

1. Give each page one full task immediately beside its response area; provide compact reading/writing wayfinding without another full prompt.
2. Keep essential source text visible, while collapsing attribution detail, external research and optional notes under clearly named disclosures. Remove manual source-saving administration from the required flow.
3. Keep the compact mobile route, but clearly identify the current stop and preserve an easy route back to the current task after long reading.
4. Put an explicit resume-current-task control near the top of the atlas when reached from the rallye. Restore the learner’s previous reading/writing position where practical.
5. Retain expanded historical context, but break it into connected readable paragraphs and explain unfamiliar terms before the task needs them.

These findings were sent to `interface_builder`, `visual_designer` and the root agent. A fresh independent review of the same final revision is required. Acceptance requires every dimension to be at least 4 and no blocking friction; the baseline does not meet it.

## Integrated round 1 — independent re-review

Repeated all seven tasks at 320×844, 390×844 and 768×844 in fresh isolated Chromium contexts. Read the revised situation, evidence and task text, inspected actual full-page screenshots and task/input viewport screenshots, and exercised the map round trip at the first and Windrush stops at all three widths. This remains a simulated persona review, not a real student study.

**Round 1 assessment: all dimensions meet the acceptance threshold; no blocking mobile friction found.** A final matching-file check follows because renderer/CSS polish occurred during the first capture.

| Dimension | Score / 5 | Independent reason |
| --- | --- | --- |
| Context | 5 | The situations explain Company/charter/revenue, enslavement/abolition, Crown/proclamation, partition, Windrush and Kenya/liability before asking the learner to use them. Two connected paragraphs make the purpose understandable. |
| Instructions | 4 | One actual task is paired with an appropriately named response field. The final task and the two wording analyses require several linked steps, but the evidence and source limits make those steps understandable. |
| Visual focus | 4 | Clear situation → evidence → task → response sequence. Attribution detail, language help, research and notes are collapsed, leaving the main activity easy to distinguish. The two-source pages remain long because their essential evidence is visible. |
| Usability | 4 | All 21 task/viewport combinations fit without horizontal overflow and have no page errors. Map return now restores exact scroll and focus. Long reading on the smallest phone still involves scrolling, but there is a single clear path and no competing form administration. |
| Autonomy | 5 | No name requirement, word-length gate, source-saving chore or locked completion blocks work. The learner controls “marked done”, can leave other responses empty, save a review, return, revise and download. Source details are included automatically. |

### Updated all-task mobile evidence

| Page | 390px page height | 390px response starts | Improvement over baseline |
| --- | ---: | ---: | --- |
| When trade becomes rule | 2,775 | 1,821 | The business/charter/revenue scenario is explained while duplicate task and toolbar are removed. |
| Who made freedom happen? | 3,503 | 2,550 | Two sources stay readable; source registration and open notebook no longer compete with the museum label. |
| One colour, unequal power | 2,994 | 2,041 | Authentic wording, source limit and one task clearly lead to the response. |
| Independence is more than a border | 3,050 | 2,096 | Partition is defined, and the instruction explicitly distinguishes political change from timed personal evidence. |
| Who gets to belong? | 3,442 | 2,488 | Source dates/voices are distinguished; legal status versus treatment becomes the single writing focus. |
| When does an empire end? | 3,249 | 2,296 | Regret/liability vocabulary is explained before the linked analysis task. |
| The past inside the present | 2,763 | 1,670 | Earlier responses/evidence are available in a disclosure; one magazine task sits directly above one input. |

At 320px, response fields begin at 1,902–2,982px. At 768px they begin at 1,305–2,024px. These are reading distances rather than hidden controls: essential material is intentionally shown before the task. There are no unnecessary citation forms in that path.

### Return and editing behavior verified

- The new **“Back to your task”** link appears at y≈138px on 320/390px screens and y=88px at 768px, immediately below primary navigation.
- Six direct atlas round trips (two stops × three widths) restore exactly the prior scroll position, focus the atlas-opening button, keep its research disclosure open, and retain both the typed draft and learner-controlled done state.
- At 390px, a first-stop round trip restored scroll 1,937→1,937; Windrush restored 2,604→2,604. The learner does not need to locate their place again.
- A short labelled test response could be marked done. With other responses empty, review saved successfully; returning to the response allowed revision. TXT export included the revised text and no numeric word/marks/points metadata.
- Physical phone keyboard behavior and real classroom learning outcomes were not tested; the evidence concerns responsive browser UI and this explicitly simulated perspective.

### Round 1 actual screenshots

- [390px complete first task](/tmp/student-mobile-round1/testpersona-390-profit-and-power.png)
- [390px Jamaica task and response](/tmp/student-mobile-round1/testpersona-390-freedom-and-memory-task.png)
- [390px Victoria task and response](/tmp/student-mobile-round1/testpersona-390-rule-and-resistance-task.png)
- [390px partition task and response](/tmp/student-mobile-round1/testpersona-390-departure-and-division-task.png)
- [390px Windrush task and response](/tmp/student-mobile-round1/testpersona-390-migration-and-belonging-task.png)
- [390px Kenya task and response](/tmp/student-mobile-round1/testpersona-390-remembering-empire-task.png)
- [390px final comment and response](/tmp/student-mobile-round1/testpersona-390-whose-britain-task.png)
- [390px atlas with prominent return](/tmp/student-mobile-round1/testpersona-390-atlas-return.png)
- [390px restored task position](/tmp/student-mobile-round1/testpersona-390-returned-task.png)
- [All 21 measurements, rendered text and initial file hashes](/tmp/student-mobile-round1/measurements.json)
- [Six map-return results](/tmp/student-mobile-round1/map-return.json)
- [Review, edit and download results](/tmp/student-mobile-round1/review-edit-download.json)

No further blocking fixes requested from the owners in this round.

## Final same-build acceptance — review round 2

**Accepted independently: context 5/5, instructions 4/5, visual focus 4/5, usability 4/5, autonomy 5/5. No blocking friction remains for this simulated mobile persona.**

Verified all nine file hashes against `docs/learning-revision/reviewed-build.json`, revision **`ungraded-2026-10-01`**, review round **2**. All nine match. The final 21-case screenshot/measurement sweep also had unchanged hashes before and after capture for content, resources, renderer, task CSS and navigation, and those hashes match the frozen manifest.

Fresh final checks confirm:

- All seven tasks at 320/390/768px still have exactly one task prompt and one response field, no horizontal overflow and no page errors.
- The 390px response positions are 1,821 / 2,550 / 2,041 / 2,123 / 2,488 / 2,271 / 1,670px. Remaining page length comes from clear essential reading, rather than competing forms or repeated questions.
- The final metadata focuses on India/Britain in 1857–1858 and Kenya/Britain in the 1950s–2013. The partition source explains that Sikhs are a religious community. Optional exploration is explicitly labelled “(optional)”.
- The introduction’s start form appears before the route preview at every checked width. Mobile learners reach the start action without first traversing the seven-stop preview.
- Repeated Windrush atlas-return checks on the frozen files again restored exact scroll: 3,072→3,072 at 320px, 2,604→2,604 at 390px and 2,097→2,097 at 768px. Button focus, open disclosure and the draft survive. The prominent return remains in the first viewport.

Evidence from the accepted build:

- [Final nine-file manifest verification and live affected checks](/tmp/student-mobile-final/manifest-check.json)
- [Final all-seven / three-width measurements and frozen hashes](/tmp/student-mobile-final/verification.json)
- [Final map-return results on matching files](/tmp/student-mobile-final/map-return.json)
- [390px first task](/tmp/student-mobile-final/testpersona-390-profit-and-power.png)
- [390px Jamaica task](/tmp/student-mobile-final/testpersona-390-freedom-and-memory.png)
- [390px Victoria task](/tmp/student-mobile-final/testpersona-390-rule-and-resistance.png)
- [320px partition task with terminology explained](/tmp/student-mobile-final/testpersona-320-departure-and-division.png)
- [390px Windrush task](/tmp/student-mobile-final/testpersona-390-migration-and-belonging.png)
- [768px Kenya task](/tmp/student-mobile-final/testpersona-768-remembering-empire.png)
- [390px final comment](/tmp/student-mobile-final/testpersona-390-whose-britain.png)
- [390px introduction with start before preview](/tmp/student-mobile-final/testpersona-390-intro.png)
- [390px atlas return control](/tmp/student-mobile-final/testpersona-390-atlas-return.png)

Screenshots are explicitly **simulated test-persona browser evidence**, not a real user study. Ratings do not claim physical-device keyboard testing or classroom learning outcomes. No application files were edited by this reviewer.
