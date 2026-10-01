# Ungraded state and original-work recovery

The enquiry uses `app/journey/js/rallye-state.js`. It has no browser side effects and never reads, writes or removes storage. `rallye.js` owns browser storage and imports its functions.

## Current state

- `RALLYE_STORAGE_KEY`: `empire-echoes-enquiry-v4`.
- `LEGACY_STORAGE_KEY`: `empire-echoes-rallye-v3`. The new interface may read this key but must never write or remove it. The frozen earlier app can still resume its original saved record.
- Format `VERSION` is `4`; the content revision comes from `rallye.contentRevision`, currently `ungraded-2026-10-01`.
- `emptyState()` creates independent `answers`, optional `notebooks`, `completedStages`, `previousAttempts`, and student identity. Name and class are optional. Dates are `startedAt`, `updatedAt` and optional learner-set `finishedAt`.
- `markStageDone(state, id, done = true)` returns a new state with that learner choice. The caller assigns the result. It never checks the answer, source collection or final status. Unmarking is supported.
- `progressFor(state)` counts only explicit `completedStages[id] === true` values. Writing an answer cannot automatically mark a task complete; leaving a response empty cannot prevent the learner from marking it. `finishedAt` is a personal status, never a lock. The `submitted` callback field is a compatibility alias for `finished`, without submission enforcement.
- `validateStage()` always returns an empty message and `validateRallye()` always returns an empty list. They exist only for compatibility with callers of the previous engine. `responseNotice(response)` provides an optional empty-response notice; it is never a navigation, save, completion or download condition.
- No response or note is truncated. The helper neither counts words nor provides response-length advice. It has no quality judgement, grading function or assessment metadata in current snapshots/progress.
- `validCitations()` and `safeURL()` check optional saved reference URLs for HTTP(S), a title and duplicate addresses. No reference count controls progress or export.

## Migration and recovery

The UI reads the two storage keys and passes parsed records to `recoverSavedState(currentRaw, legacyRaw)`. If a parsed current record exists, it takes precedence and is normalised. Otherwise, a legacy record becomes separate recovered work. The result is saved only under the new key. Reloading a saved current state does not duplicate the archive.

`normaliseSaved(raw)` resumes answers only when the format version, activity ID and content revision all match. If any identity differs, current answers, notes and completion choices start empty. Student name/class carry forward for convenience, while the earlier record retains its own complete original identity.

`preserveEarlierAttempt(raw, { archivedAt?, sourceStorageKey? })` preserves a detached copy of the entire earlier record, including unknown old stage IDs, old completion metadata, arbitrary original fields and its own `previousAttempts`. Existing archive entries also remain separately accessible. Neither the input record nor its nested answers are mutated.

Original questions come from, in priority order:

1. The attempt's saved `promptSnapshot`, kept exactly.
2. `rallye-q2-prompts.js` for `q2-english-2026-10-01`. This recovery-only module was generated directly from the exact `snapshots/2026-10-01-before-simplification/app/journey/js/rallye-content.js`, using the frozen engine's snapshot field mapping.
3. `rallye-legacy-prompts.js` for pre-revision v3 work (`legacy-v1`).
4. An explicit unavailable-original-question message for an unknown revision or different activity. No current question is substituted.

`recoveredStages(entry)` joins original questions, answers, notes and optional old checkpoints by original task ID, including IDs no longer present. `recoveredAttemptText(entry)` produces a separate historical recovery download. Historical metadata may remain in recovery JSON and the exact old instructions may appear in recovery text. None belongs in a current enquiry export.

Current `promptSnapshot()` uses a whitelist of question identity, title, prompt, operator, purpose and instructions. Current JSON/TXT/HTML exports must similarly omit historical `previousAttempts`, assessment fields and length guidance. The interface offers the historical archives as separate downloads. On storage failure, the original v3 record remains unchanged and the in-memory recovery data remains downloadable.

## Integration exports

```js
import {
  RALLYE_STORAGE_KEY, LEGACY_STORAGE_KEY, VERSION, RALLYE_CONTENT_REVISION,
  emptyState, normaliseSaved, recoverSavedState, preserveEarlierAttempt,
  promptSnapshot, recoveredStages, recoveredAttemptText,
  safeURL, validCitations, validateStage, validateRallye, responseNotice,
  markStageDone, progressFor,
} from "./rallye-state.js";
```

The storage owner must add `canSave` to the progress callback itself. It must not use advisory notices to disable controls, use the `submitted` callback alias to lock edits, or call a current export function with historical entries included.

## Verification

`node tools/journey-progress-test.js` runs fourteen isolated state checks without a server or browser. All fourteen pass. They cover exact frozen q2 snapshot parity, legacy migration, original prompt precedence, unknown revision isolation, inherited historical attempts, no input mutation, no duplicate imports, editable finished work, learner-controlled completion, unrestricted answer preservation, absence of assessment metadata, historical unknown task recovery and optional URL filtering.

The learning QA agent owns the browser migration/export/flow tests in `tools/journey-learning-test.js` and the updated integration tests. Browser verification should compare the entire original v3 storage string before and after migration, save, reload, restart and simulated storage failure.
