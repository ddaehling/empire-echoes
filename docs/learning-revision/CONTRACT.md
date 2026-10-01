# Ungraded classroom enquiry — 1 October 2026

The user requests ten revision agents plus five independent student-perspective reviewers. Preserve the preceding version, remove all grading and word-count requirements, expand understandable scenario introductions, clarify tasks, redesign cluttered assignment pages, publish on GitHub and make the classroom website accessible online.

## Non-negotiable behavior

- The current enquiry is ungraded. No marks, points, rubrics, grades, score summaries, word counts, suggested lengths, minimum/maximum word limits, or hidden word-based completion gates in its student UI or exports. Remove contradictory current teacher guidance too. Historical archived work may retain its original metadata in a clearly separate recovery download; the frozen snapshot stays exact.
- Preserve six historical tasks plus the final comment and their historical-to-contemporary connections, authentic language analysis and evidence integrity. Clarify what the learner should do and why without giving the answer away.
- Explain unfamiliar concepts before they are needed, particularly the East India Company, enslavement/abolition, Crown rule, partition, Windrush and Kenya/Mau Mau. Use plain, connected prose with a clear scenario and concrete writing instruction.
- Design one calm assignment workspace: context, essential evidence, a clear task and one response area. Hide optional research/support behind understandable disclosures. Avoid repeating the question, demanding manual citation administration, or showing multiple competing toolbars. Let the response remain editable; saved work is learning work, not a locked assessment.
- Keep optional sources, attribution, source limits and return-from-map behavior available. No automatic judgement of answer quality. No fake learner evidence.
- Use a new content revision and storage key. Read older current-app work safely and preserve it without overwriting the old storage key, so the exact frozen snapshot remains usable. Do not silently attach old answers to rewritten questions.
- Do not modify `snapshots/2026-10-01-before-simplification/`, `/app/` old files, or `/app/next/`. Snapshot contains exact pre-change app/docs with a SHA-256 manifest. Never stop port 8777.
- Source hierarchy remains the three user-confirmed PDFs in Downloads. Findings from the preceding unit-alignment reports may be reused, but inspect current source before changing it.

## Ownership

1. `learning_author`: `app/journey/js/rallye-content.js`; coordinates context writer and student feedback.
2. `context_writer`: expanded scenario drafts and evidence in `docs/learning-revision/CONTEXT.md` (no shared app edits).
3. `source_editor`: `rallye-resources.js` and SOURCES.md.
4. `interface_builder`: `rallye.js` and optional new render helpers; sole owner of this file.
5. `visual_designer`: `rallye.css`; collaborates with interface owner.
6. `progress_engine`: new pure state/validation helper if useful, integration contract and dedicated tests; never edits rallye.js; interface owner imports/integrates.
7. `teacher_revision`: teacher-content.js, teacher.js, teacher.css, background Markdown and regenerated PDF.
8. `learning_qa`: new ungraded-flow tests and updates to journey/unit tests, in coordination with engine/UI owner.
9. `deployment_prep`: static build, GitHub Pages workflow, Vercel config, deployment docs; no remote mutation/Git commits (root owns those).
10. `accessibility_review`: independent responsive/keyboard/accessibility checks and concise actionable report; no app edits.

Five reviewers (`student_novice`, `student_english`, `student_mobile`, `student_task_clarity`, `student_independent`) inspect actual pages and all seven tasks. They are simulated perspectives, not real student participants. Each rates context, instruction clarity, visual focus, usability and autonomy from 1–5, supplies concrete evidence, and marks acceptance only when every dimension is at least 4 and no blocking confusion remains. Do not inflate scores to pass. Repeat review after fixes until all five independently accept the same final version.

## Root-owned integration

Snapshot, Git history/repository creation, publication, global navigation links, README/product/docs, final requirement audit and deployment verification. Agents must not create unrelated chats or new agents; the requested fifteen roles are already allocated. Use isolated browser profiles and private ephemeral test ports. Avoid simultaneous heavyweight three-browser suites; coordinate with root.
