# Clear tasks for an ungraded enquiry

Revised 1 October 2026 in `app/journey/js/rallye-content.js`. The six historical stops and final school-magazine comment remain. This supersedes the current-use task and assessment requirements in the earlier unit-alignment reports; the frozen earlier app and its recovery material remain unchanged.

## What the learner does

Each stop has two connected introductory paragraphs, essential evidence, one task and one editable response. The task names a concrete action and response. Optional map exploration, additional sources and language help support the same enquiry; they do not generate extra written work.

| Stop                               | The writing task                                                                                                                                           | What the introduction now explains                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| When trade becomes rule            | Connect the Company's new tax rights to its ability to govern.                                                                                             | An English trading business, charter, Bengal and revenue.                                                                               |
| Who made freedom happen?           | Rewrite an explicitly invented museum label for teenage visitors using resistance and a detail about ending slavery.                                       | Enslavement, plantation labour, abolition and the museum-writing situation.                                                             |
| One colour, unequal power          | Interpret a quoted word or phrase from Victoria's proclamation in its historical situation and identify evidence needed to investigate the promise.        | The 1857 uprising, transfer from Company to Crown rule and what a proclamation is.                                                      |
| Independence is more than a border | Name the two new independent countries and whose rule ended, then explain one person's or family's experience around partition.                            | The division of British India, India and Pakistan, new borders, displacement and the different dates of the sources.                    |
| Who gets to belong?                | Explain how a legal right to live in Britain could coexist with exclusion, using Windrush evidence and the colonial connection.                            | The ship, the wider generation, British subjecthood and the later scandal.                                                              |
| When does an empire end?           | Read the contrast between regret and denial of legal responsibility, then explain why the 2013 statement shows continuing consequences.                    | Kenya, Mau Mau, colonial detention and abuse, independence, legal claims, settlement and liability.                                     |
| The past inside the present        | Write a school-magazine comment using two chosen cases to explain present-day identities, state a view and discuss another influence or an evidence limit. | Overlapping identities, the purpose and audience of a comment, and the relation between historical examples and a present-day argument. |

The final retains historical-to-contemporary explanation and independent judgement while removing a checklist of case categories, saved-source quotas and separate revision products. Learners can naturally name a source or person when using evidence. Source provenance travels with the workspace and export rather than requiring a citation-administration exercise.

## Removed requirements

The shared content has no `points`, `rubric`, `minWords`, `maxWords`, `expectedWords`, `minSources` or `teacherAnswer` fields. Student instructions contain no marks, grades, response-length requirements, saved-source quotas or promises of a score. The former teacher answer keys have been replaced in this module by optional `discussionPrompts`. These invite further thinking; they are not criteria for judging completion or answer quality. The separate teacher guide may include clearly labelled possible discussion responses.

The 45-minute aggregate and individual planning-time metadata remain for teacher compatibility. They are estimates, not timers or completion gates. Expanded reading and unrestricted writing have not been timed with real learners. Classroom pacing can be adjusted without changing the tasks.

## Historical and source integrity

- The East India Company began as an English trading business in 1600; a charter did not make it ruler of India. The source editor verified the military and administrative foothold needed to connect tax income with governing power.
- The Jamaica line is explicitly an invented teaching label. The source distinguishes enslaved resistance, the 1833 Act, its implementation in 1834 and compulsory apprenticeship ending in 1838. Compensation went to slave-owners.
- The Victoria and Kenya tasks analyse clearly labelled authentic extracts rather than diction invented in a summary. A possible communicative purpose does not prove actual reception or implementation.
- The partition question explicitly permits experience around partition. The 1946 letter and remembered pre-partition displacement must not become experiences caused by a border drawn in 1947.
- Ena Sullivan's registration document and the unnamed person quoted in Williams's review remain separate. The 1948 ship, the wider generation and the later scandal are explained separately.
- The Kenya introduction does not label all claimants Mau Mau fighters. It defines liability without deciding the rhetorical interpretation or the settlement's adequacy for the learner.
- The final permits different conclusions and does not treat one official statement or individual's account as the beliefs of everyone in Britain.

The three user-confirmed primary PDFs remain the pedagogical source hierarchy. Prior findings in `docs/unit-alignment/TASK_REVISION.md` and `ASSESSMENT.md` were read and reused for causal history, text–context–function analysis, communicative writing and plural identities. Their previous grading/length machinery is not part of this revision. The context writer rechecked the source documents and unfamiliar historical background; details and links are in `CONTEXT.md`. The source editor owns the historical evidence cards and their live provenance in `SOURCES.md`.

## Integration contract

- Preserve `rallye.id`, all seven response IDs, `stations` and the internal `finalAssessment` key.
- Set `contentRevision` to `ungraded-2026-10-01`. Rewritten tasks must not silently inherit older answers.
- `contextParagraphs` contains two readable paragraphs. `context` contains the same paragraphs joined with a blank line for compatibility.
- `essentialSourceIds` names only the visible core evidence. All existing `sourceIds` remain available; the final has no new essential reading.
- `investigation.prompt` is the single task. `instructions` is empty or contains one brief clarification. `responsePurpose` is a simple response label; `operator` remains available as metadata.
- `support.stems` and `support.vocabulary` are optional language help, with no lexical quota.
- `discussionPrompts` is teacher-facing only; it must not become a second student task panel or a rubric.

## Verification

The rewritten module parses as an ES module. A structural check verifies all seven IDs, the new revision, absence of removed schema anywhere in the content, two consistent context paragraphs per task, source-ID resolution, essential-source membership and both authentic analysis quotations. The standard Node CommonJS syntax checker does not accept browser `export` syntax; the successful check uses `node --input-type=module --check` with the file on stdin.

Five independent simulated learner perspectives review the integrated rendered pages separately. Their acceptance belongs in their own reports and must not be inferred from this author's checks. No claim is made that these reviews replace a classroom trial.

## Final orientation check

The independent novice review identified optional comparison metadata competing with the required cases. Stop 3 now names India / Britain and 1857–1858; stop 6 names Kenya / Britain and the 1950s–1963–2013. Canada in 1867 and Hong Kong in 1997 remain optional research through their existing source cards and disclosure instructions. Task wording and context paragraphs are unchanged.
