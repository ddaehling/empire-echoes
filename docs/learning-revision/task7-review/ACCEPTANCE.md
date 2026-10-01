# Task 7 preparation: review and acceptance

Revision: `identity-connections-2026-10-01`. Date: 1 October 2026.

## Finding

Five independent reviewers found that the preceding revision did not adequately prepare students to choose two cases freely for the final identity question. Windrush and Kenya offered the strongest routes; several other stops supplied historical evidence without an actual contemporary British connection. More demanding historical questions alone did not solve this alignment problem.

## Result

All six cases now include essential contemporary evidence available inside the assignment, with dates, attribution and explicit limits. Each earlier task requires a historical-to-contemporary interpretation. The final retains the central question, requires evidence for both cases, asks students to compare explanatory reach, and makes a relevant limit or another evidenced influence affect their overall judgement.

The interface groups historical and contemporary evidence and gives task 7 six independently expandable cases containing saved responses, notes and required sources. Census evidence is visible and explicitly cannot identify causes. The existing seven responses remain ungraded and editable.

About 60 minutes is the new planning estimate, including 20 for the final task. Teacher guidance recommends splitting across lessons if necessary. This timing is ambitious and has not been measured with real students.

## Five independent second reviews

| Reviewer | Focus | Initial verdict | Final verdict |
| --- | --- | --- | --- |
| 01 Alignment | Match between earlier learning and final demands; every case choice | Revision required | Accept |
| 02 Evidence | Provenance, dates, causal and population-scope boundaries | Revision required | Accept |
| 03 Learner | Required-material-only answer simulations, including Company + Partition | Revision required | Accept |
| 04 Judgement | Meaningful “how far”, comparison and qualification without a forced thesis | Revision required | Accept |
| 05 Sequence | Progression, reading load and final retrieval in the browser | Revision required | Accept |

Each report retains its initial findings and appends its independent second assessment. All five verified the final four-file student manifest in `reviewed-build.json`. A final wording clarification changed “dated evidence from Britain today” to “dated contemporary evidence” because some British institutional speeches were delivered abroad; all five acknowledged that exact correction. These are expert-agent reviews and simulated learner reasoning, not a classroom study.

The revised teacher examples align with the prompts and permit stronger or narrower supported conclusions. A final feedback clarification requires original wording for claims about language choices without making original-site visits necessary for evaluating a clearly labelled paraphrase. The 26-page teacher PDF was regenerated, all pages visually checked, and its final changed pages rechecked. HTML/TXT/Markdown parity covers all seven tasks.

## Verification

- Unit: four checks, including every contemporary source being essential and attributed, all IDs resolving, time totals and absence of grading/word-limit schema.
- Progress: sixteen checks, including archived work retaining exact prompt snapshots.
- Browser recovery: both earlier v4 revisions preserved in readable TXT and original JSON, with new answers separate and no duplicate archives after reload. The immediately preceding revision uses a fixed fixture captured from published commit `08b3132`.
- Learning: fifteen browser checks covering the complete editable enquiry, navigation and exports.
- Archival reading: all three embedded historical readings still usable without external source access.
- Identity preparation: all six modern summaries and limits visible with external requests blocked; ONS visible; six keyboard disclosures retrieve full responses, notes and every required source; final draft survives revisiting and reload; no overflow at 320, 390, 768 and 1440 pixels.
- Full journey: thirteen checks pass. Final student unit and identity-browser suites rerun after the last renderer copy correction.
- Static build: 534 public files, with the existing frozen app and older routes preserved. Deployment verification and production-prefix browser smoke checks cover assets, privacy exclusions, teacher PDF, frozen journey and older apps.

No claim is made that a museum, official speech or individual represents all British identities. The dated examples support bounded arguments; further evidence would be needed for population-wide causal conclusions. Students can disagree on the importance of imperial history while supporting their interpretation.

## Reproduction

Run `npm run test:journey:unit`, `test:journey:progress`, `test:journey:recovery`, `test:journey:learning`, `test:journey:sources`, `test:journey:identities`, and `test:journey`. Publish checks are `npm run build`, `npm run test:deployment`, and `node scripts/smoke-static.mjs`.

The public update is deployed through the repository’s existing GitHub Pages workflow. The final response records the published URL after live verification; source and review records in this folder distinguish the review build from the earlier revisions.
