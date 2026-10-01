# Simulated student-perspective review: task clarity

Reviewer 4 adopts the perspective of a diligent student asking: “What exactly am I meant to write, and how do I know I have answered?” This is an independent simulated perspective, not a trial with a real pupil and not evidence of measured learning gains.

## Method and review boundary

Read the learning-revision contract; inspected the current seven assignments, every core source card, optional source cards, source-origin disclosures and language support in the actual rendered app with a fresh, isolated Playwright Chromium context (1440 × 1100). No answers were supplied by a teacher key. The initial source inspection incidentally included embedded teacher material, but judgements here use the learner-facing instructions and evidence, not agreement with model answers. No app files or user browser profiles were changed.

The first baseline was captured while other agents were integrating content and interface changes. It is explicitly a transitional build: new prompts appeared alongside the preceding assessment UI. Screenshots were saved outside the project at `/tmp/task-clarity-baseline-1.png` through `-7.png`, and rendered text at `/tmp/task-clarity-baseline.txt`. A later baseline read already showed the expanded scenarios and revised source cards. These are not a claim that one frozen version contained every baseline issue simultaneously.

## Baseline ratings — not accepted

| Dimension | Rating / 5 | Learner-facing evidence |
| --- | --- | --- |
| Context | 3 | Initial short scenarios assumed knowledge of Crown rule, Windrush and partition. The expanded scenarios in the second read resolve most of this and explain the actual writing situation. |
| Instruction clarity | 3 | The writing product is named at every stop. The final instruction’s “something that these examples cannot explain on their own” does not distinguish another influence on identity from a source limitation. |
| Visual focus | 2 | Each task was printed verbatim twice, above and below the source section. Large source controls and notebook sections competed with the answer area. |
| Usability | 2 | Transitional interface displayed “undefined marks”, “undefined–undefined words” and “7 of 7 ready” before any writing. A learner cannot use that state to know whether work is complete. |
| Autonomy | 3 | All seven source-supported prompts can be approached without opening an original website, but final evidence retrieval and a possible causal evidence gap at stop 1 still need attention. |

## Assignment-by-assignment findings

1. **When trade becomes rule.** “Your explanation” and the dates tell me the required product. The revised context explains merchant business, charter and revenue. The new source establishes tax rights but does not identify what tax money could fund; the context also no longer names officials or troops. For a novice, connecting money to the ability to govern may require knowledge not supplied here. Add one factual piece of evidence about the costs of governing, while leaving the causal explanation to the learner.
2. **Who made freedom happen?** Strong product clarity: write the replacement museum label itself, for visitors my age. Resistance plus one choice of abolition/apprenticeship/compensation detail are explicit. The two core sources supply these details. No separate commentary is implicitly needed.
3. **One colour, unequal power.** The prompt identifies four connected actions: quote wording, interpret the image of rule, explain possible purpose after the uprising, identify further evidence needed. The expanded scenario now defines Crown rule and proclamation. The quoted original is visually distinct from the summary; optional Canada context is not a hidden required comparison. This is demanding but answerable.
4. **Independence is more than a border.** The revised prompt now makes its two jobs clear: describe the political change, then use an individual detail from around partition. The explicit timing sentence prevents the misleading assumption that a 1946 letter or pre-partition displacement happened as a result of the August 1947 border. This improvement must remain. “Outline” is less specific than the prompt’s “Describe”, but not a blocker. The source-origin disclosure explains who Sikhs are; moving this definition to first use would make reading smoother.
5. **Who gets to belong?** The task clearly asks for legal right versus treatment and a colonial connection. The revised context distinguishes the ship, wider generation, British subject status and scandal. The two sources are separate: the instructions must not imply that Ena Sullivan was the unnamed person harmed in the review. The current wording does not make that claim.
6. **When does an empire end?** The prompt asks for a comparison of regret and liability, then a link across independence and later consequences. The updated scenario defines Mau Mau, detention, settlement and liability before I write. Two labelled extracts provide actual wording, so language analysis is feasible. The optional Hong Kong card is correctly not a second required case.
7. **The past inside the present.** The expanded scenario now explains identities, overlapping identities, audience and comment genre. The main remaining ambiguity is the requested limit: prompt says “something that these examples cannot explain on their own”, while context mentions both other influences and source limits. State whether either is valid or one is required. The task specifies two cases but the page says “0 core sources”; a student who did not manually save citations must still be able to reopen the earlier evidence easily. A source chooser/revisit disclosure is preferable to requiring citation administration. It should remain clear that naming the source/person in the prose is enough.

## Actions communicated to owners

- To `learning_author`: clarify the final limit; make the final’s own definition of identities and link to today visible; preserve partition timing; supply any necessary Company causal evidence.
- To `interface_builder`: remove repeated prompts, grading/word-count remnants and blank-answer completion; make final earlier-source access straightforward; prevent source cues being mistaken for separate assignments.
- To root: baseline is transitional and cannot yet be accepted. Rerate the same final integrated version after fixes.

## Round 1: integrated re-review — accepted

Reviewed the integrated `ungraded-2026-10-01` learner flow in a new isolated Playwright Chromium context at 1440 × 1100. Inspected rendered text and full-page screenshots of all seven actual stages, opened their source details and optional language/research disclosures, and inspected the final earlier-response/evidence recap. This round did not use teacher answers.

| Dimension | Rating / 5 | Reason for this rating |
| --- | --- | --- |
| Context | 4 | The two connected scenario paragraphs define the Company, charter, revenue, enslavement, abolition, Crown rule, proclamation, partition, Windrush, Mau Mau, settlement and liability before they are needed. Final context explains overlapping identities and the school-magazine audience. Some first-use vocabulary remains inside optional support, so this is not a claim that every possible novice difficulty has gone. |
| Instruction clarity | 4 | Each stage has one visible “Your task” beside a specifically named response. Actions and evidence requirements are explicit. The final limit now clearly offers another influence **or** something the sources cannot tell us. The two analysis tasks still require several connected intellectual steps, but these are stated rather than hidden. |
| Visual focus | 4 | The repeated task and competing controls are gone. Context, essential evidence, task and response follow a consistent order; optional material is collapsed. Two-source stages require substantial scrolling, which is a real remaining reading cost, but the page hierarchy remains clear. |
| Usability | 4 | Empty work shows 0/7 marked done. A learner may navigate freely, revise marked work and reopen earlier responses. A short test draft persisted after navigation and reload, and editing after marking done remained possible. The completion control describes the learner’s decision and makes no judgement of quality. |
| Autonomy | 4 | Prepared evidence supplies all seven tasks without external research. Final recap supplies the earlier source cards even when no citations were manually collected. Definitions, optional starters, original-source attribution and source limits remain available. No blocking dependency on teacher explanations was found in this simulated review. |

### What a learner can now identify at each stop

| Assignment | Clear writing action and available evidence |
| --- | --- |
| Company | Explain the change from trading permission to tax/governing power. The repaired National Army Museum summary now supplies officials, soldiers, tax collection and military use of income, resolving the earlier causal evidence gap. |
| Jamaica | Write a replacement museum label, including resistance plus one chosen detail about the end of slavery. The two cards supply both parts, and the prompt explicitly says to write the label itself. |
| Crown rule | Quote a phrase, explain the image of rule and possible purpose, then identify what further evidence is needed. The original extract and conflict context support those actions. The Canada comparison remains optional. |
| Partition | Describe the independent countries and end of British rule, then use one individual detail. Both the task and source make clear that the letter and remembered displacement concern events before the border was drawn. No forced claim of a 1947 cause is required. |
| Windrush | Explain a contrast between legal right and treatment, then connect it to the Caribbean’s colonial relationship. The scene and Williams card supply this. The card explicitly prevents identifying the unnamed speaker as Ena Sullivan. |
| Kenya | Compare regret with denial of legal responsibility, use wording, and explain a connection beyond independence. The paired original extracts, definitions and 1963/2013 context supply the evidence. Hong Kong remains optional. |
| Final comment | Give a view on how far imperial history explains identities today, develop two cases with present-day connections, and discuss either another influence or a source limit. The recap offers all earlier core evidence and the task requests attribution in prose rather than manual citation collection. |

### Direct interaction checks

- With all disclosures opened, no marks, grading rubric, scores, word-count display, word limit or suggested answer length appeared in the seven learner pages.
- All seven pages had one visible response area; notes stayed inside an optional disclosure.
- A deliberately brief test string could be saved and marked done without a length judgement. This was a UI check, not a sample of adequate student work.
- The final recap displayed that earlier draft and its source card. Returning to the stop retained the draft; revising after marking done and reloading retained the revision.
- Original quotations and paraphrases remain separately labelled. Source limitations stay readable without pretending the sources represent everybody.

### Remaining nonblocking refinement

The partition card uses “Sikh” before its definition in the source-details disclosure. Moving “a religious community with deep roots in Punjab” to first use would reduce one small interruption. The current disclosure and the alternative family-displacement example keep this from blocking the task. Long expanded final evidence recap also warrants restraint: it is useful as reference material and should remain optional.

**Acceptance:** all five dimensions are at least 4/5 and no blocking task confusion remains in the reviewed build. This is simulated reviewer acceptance, not evidence from a real pupil trial.

Evidence snapshots: `/tmp/task-clarity-round1-1.png` through `-7.png`; rendered text `/tmp/task-clarity-round1.txt`; expanded text `/tmp/task-clarity-round1-expanded.txt`.

File fingerprints captured for the reviewed integrated round:

- `rallye-content.js`: `0ac09b9e596061a52b8cd3008118c6a2ee56f1f79ca4df4f798df654e163e2d5`
- `rallye-resources.js`: `5a3fb5e1c98074300fb925bd830dc46fc00187c43cf20c7fc9bb1ca84ab8e618`
- `rallye.js`: `b2849f0e2e2474fee3fe1283c57aaa6b46ea32d8fb2de998a0cb2b5cc8875f5e`

## Round 2: final manifest and delta check — accepted on the shared build

Re-reviewed the introduction and affected live stages 3, 4, 6 and final comment in another fresh Playwright Chromium context at 1440 × 1100. Inspected their rendered text and screenshots, plus the final-page footer at 390 × 844. Prior all-seven assignment/source coverage from round 1 continues to apply to unchanged task content.

Verified **all nine files** listed in `docs/learning-revision/reviewed-build.json` against both the local bytes and the bytes served at `http://127.0.0.1:8777/`. Every SHA-256 matched. The manifest identifies revision `ungraded-2026-10-01`, review round `2`; manifest SHA-256: `2a8c00ca443d7aba5b9f70d0bce23da726598c84f7d906693396eed6bd13823c`.

Observed deltas:

- The partition source now explains “the Sikhs, a religious community” at first visible use. The round-1 vocabulary refinement is resolved. The 1946/pre-partition timing remains explicit.
- Stage 3 now identifies India/Britain and 1857–1858; stage 6 identifies Kenya/Britain and the 1950s–1963–2013. Their headings no longer imply an additional required Canada/Hong Kong response.
- The introduction places the begin form before the route preview in reading order. The action remains clearly visible beside the introduction on desktop.
- Research disclosures explicitly say “optional”. The final still asks for two cases and one of two clearly named qualification approaches; its evidence recap remains closed initially.
- The mobile footer wraps within the viewport. Measured page width and viewport width both equal 390 px; no horizontal overflow appeared in this check.

| Final dimension | Rating / 5 |
| --- | --- |
| Context | 4 |
| Instruction clarity | 4 |
| Visual focus | 4 |
| Usability | 4 |
| Autonomy | 4 |

**Same-build acceptance confirmed.** No new blocking task ambiguity, source-to-task mismatch, grading display or length instruction appeared in the affected pages. Scores remain 4 rather than increasing for minor polish: reading and reasoning demands remain substantial, though the required work is now understandable. This remains a simulated perspective, not a real student trial.

Delta evidence: `/tmp/task-clarity-final-delta.txt`, `/tmp/task-clarity-final-intro.png`, `/tmp/task-clarity-final-rule-and-resistance.png`, `/tmp/task-clarity-final-departure-and-division.png`, `/tmp/task-clarity-final-remembering-empire.png`, `/tmp/task-clarity-final-whose-britain.png` and `/tmp/task-clarity-final-footer-mobile.png`.
