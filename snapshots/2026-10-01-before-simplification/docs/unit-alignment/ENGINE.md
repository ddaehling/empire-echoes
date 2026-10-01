# Engine alignment and saved-work preservation

Owner: unit_engine. Only the journey engine, its frozen legacy prompt data and a new isolated alignment test were changed. Both older app versions and the live server on port 8777 remain untouched.

## Runtime contract

- `rallye.contentRevision` identifies the questions, independently of the stable rallye ID and storage-format version. Every newly saved attempt includes a prompt snapshot (question, instructions, word limits, required citations, marks and rubric).
- A saved attempt with the current revision resumes normally. A changed revision creates a separate current notebook and preserves the entire earlier attempt under `previousAttempts`, with its own revision, prompt snapshot and original completion metadata. The current answers, notebooks and checkpoints start empty; student name/class carry forward. Earlier work never enters current completion checks or automatic practice grading.
- Pre-revision v3 attempts are identified as `legacy-v1`. `app/journey/js/rallye-legacy-prompts.js` freezes the seven questions that existed before alignment. Unknown revisions without saved prompts are labelled as having unavailable original questions; the engine does not invent a question or attach the current one.
- Migration stores the preserved attempt and new notebook in one localStorage write. If it fails, the original stored record is unchanged, recovery stays in memory, and the UI tells the student to download before leaving. An earlier-work panel offers readable original prompts/answers and separate TXT/JSON downloads. Current JSON/TXT/HTML exports identify the current revision and keep earlier attempts in a separate section. Starting again removes the current attempt but retains preserved earlier revisions.

## Learning interface

The exact task appears in a compact briefing before source reading, with optional `investigation.operator` and `investigation.responsePurpose`. `investigation.expectedWords` is the displayed target when supplied; minimum/maximum fields continue to control completion validation rather than a quality score. The maximum remains visible. Existing writing, citation, autosave, review and portfolio flows remain required.

Optional `investigation.support` uses `stems: string[]` and `vocabulary: {term, meaning}[]` (plain vocabulary strings are accepted defensively). Support is a native collapsed details element beside the answer and never fills student text. Original source extracts have a distinct `excerptLabel`, defaulting to “Original wording · short extract”; paraphrase labels remain separate in cards and downloaded source references. All content is escaped before rendering.

## Verification

Run `node tools/journey-unit-test.js` (independent default port 8993 and a fresh Playwright browser context). Nine checks cover:

1. Seven required responses, 45 total minutes, rubric totals and human-only written assessment, derived from the content module.
2. Old completed work, original prompt snapshots and unknown old stage IDs surviving migration without active answers.
3. Same-revision resume without archive duplication; subsequent revisions preserving snapshots; unknown prompts handled explicitly.
4. Current completed work remaining locked and citation requirements still checked.
5. Browser migration persisting recovery before new work, and TXT recovery downloads containing original prompts/answers.
6. Task briefing order, optional collapsed language help and answer independence.
7. Separate old/current work and revision provenance in JSON, TXT and HTML exports.
8. Preserved revisions surviving “Start again”.
9. Simulated storage-quota failure retaining the original stored attempt while downloadable recovery remains available.

All nine checks passed against the approved `q2-english-2026-10-01` content. Independent migration review also checked the preservation paths; its HTML recovery attribution/printed source-address findings were corrected. Visual inspection belongs to the UX reviewer; no screenshots of the user's live profile were taken.
