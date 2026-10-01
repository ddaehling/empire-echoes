# Independent review 5 — progression, transfer and classroom load

Baseline reviewed: `enquiry-analysis-2026-10-01`, 1 October 2026. This is an independent pedagogical review of the implemented content and rendering code, not a report from real students. Files inspected: `app/journey/PRODUCT.md`, `js/rallye-content.js`, `js/rallye-resources.js`, and the final-task/retrieval rendering in `js/rallye.js`. No application files were changed by this reviewer.

## Verdict

**Revision needed.** The sequence offers worthwhile historical analysis, but it does not yet adequately prepare an ordinary B2 learner to answer the final question using any two freely chosen cases. A strong learner selecting Windrush and Kenya can construct a defensible answer. A learner selecting Bengal and the proclamation, or partition and emancipation, faces a large unannounced leap from historical interpretation to identities in Britain today. The final task is intellectually appropriate; the missing work is evidence-supported transfer, not further factual difficulty.

## What the current sequence actually prepares

| Stop | Useful preparation already present | Transfer still missing |
| --- | --- | --- |
| 1: Company power | Compare evidence and defend a judgement; distinguish commerce from government. | Nothing asks how that history is represented or matters in Britain today, and the provided evidence does not support a present-day identity claim. |
| 2: Emancipation | Rewrite a one-sided account; weigh agency, law and delayed freedom. This is good practice for public memory. | The museum-label scenario makes memory relevant, but it is not evidence of what an actual contemporary British institution or public believes. Learners need to distinguish their proposed label from a documented public representation. |
| 3: Proclamation | Read official rhetoric critically and distinguish a promise from evidence about lives. | Analysing a ruler's self-presentation in 1858 does not establish a continuing belief today. No present-day comparison supplies or tests that continuity. |
| 4: Partition | Contrast a border story with individual experience; attend to chronology. | The prepared memory is not identified as testimony about a British person's present-day identity. Learners must not silently convert displacement in South Asia into a claim about belonging in Britain. |
| 5: Windrush | Connect colonial status, migration, recent institutional exclusion and a person's expressed attachment. | This is the strongest direct preparation. The wording concentrates on quotation analysis; the answer should also make explicit what this tension helps explain about belonging and what it does not establish about everyone. |
| 6: Kenya | Make a qualified judgement about acknowledgement, settlement and responsibility in 2013. | A defensible case about official public memory is available. The task stops at whether recognition is meaningful, rather than asking what the statement reveals about Britain presenting its imperial past. It must remain a claim about a government statement, not a survey of British attitudes. |

The progression moves from comparison to rhetoric, interpretation and evaluation. Those skills transfer, but analytical difficulty alone does not produce the historical-to-present explanatory connection required by task 7. The key unpractised move is: **historical relationship → a documented later experience or representation → a bounded claim about identity or memory → how much this explains.**

## Final task and retrieval evidence

- Task 7 (`rallye-content.js`, finalAssessment) asks for two cases, a connection to the present, an opinion and another influence **or** a source limitation. These are coherent requirements and allow more than one defensible conclusion.
- Its introduction defines plural identities well and warns against treating everyone alike. The final source limitation is valuable, but a generic sentence such as “not everyone thinks this” can satisfy the surface instruction without altering the argument about **how far** empire explains anything.
- The two final sources are optional. The ONS summary records chosen identity labels, not causes. The Commonwealth charter states institutional aims, not British people's identities. Neither repairs the missing causal bridge for the first four cases.
- `earlierResponses()` in `rallye.js` lines 326–327 repeats all six answers and all essential source cards inside one disclosure. This helps recovery but leaves the learner to sift a long dossier. It omits the learner's optional notes, although `privateNotes()` explicitly invites recording connections and chosen evidence. Therefore the work most likely to hold a synthesis idea is unavailable at the point of synthesis without leaving task 7.
- The final comment is the first place learners must select, connect and weigh two cases together. Sentence starters supply language, not a method for making that judgement.

## Least intrusive remedies

1. **Keep seven tasks and the existing central question.** Do not append a compulsory worksheet, increase historical detail in every stop, or make six new mini-essays. The B2 challenge should lie in interpreting and justifying, not managing additional forms.
2. **Build explicit transfer into selected earlier responses.** Preserve their analytical core, but replace or extend one instruction so that a response develops a supported present-day connection or explains why the evidence is insufficient for one. In particular, make Windrush address the tension between personal attachment and institutional treatment; make Kenya address the government's public presentation of the imperial past. Neither prompt should predetermine a moral verdict or erase source limits.
3. **Offer a genuine choice of usable cases.** Add short, verified modern evidence for additional cases, preferably through one readable source card per relevant stop and replacing redundant explanation. For emancipation, an actual British museum's interpretation would make the public-memory connection evidential. For partition, an attributed British-based memory/commemoration would support a bounded connection. If any case remains historical background only, say so clearly and help students pair it with a suitable later source; do not imply every historical source proves an effect today.
4. **Make task 7's planning move visible and compact.** Before drafting, ask learners to choose two cases and identify the historical connection, the later evidence, what aspect of identity/memory it helps explain, and a limit. This can be a short thinking prompt or optional notes area, not four required input fields. Ask which connection is better supported or what the two cases together explain well and leave unexplained. That converts a decorative caveat into an extent judgement without prescribing the answer.
5. **Retrieve selectively.** In the final task, keep earlier work collapsed by default but provide one disclosure per case. Include that case's answer, saved notes and relevant evidence together. A learner should be able to inspect two cases without reopening every source from all six stops. Preserve the current response during any revisit.
6. **Model method, not a ready-made conclusion.** A short general reminder can distinguish “This happened in the empire” from “This helps explain this later experience/representation because…”. Do not provide a full model final paragraph before students write.

## Acceptance conditions for the revised sequence

I would accept a revision when:

- A B2 learner using only essential on-page material can identify at least three viable case choices, select two, and show a traceable historical-to-modern link without inventing a general opinion held by British people.
- Historical-only material is clearly bounded or paired with appropriate later evidence; 1858 rhetoric and 1947 displacement are not presented as direct proof of identities in 2026.
- At least two earlier task responses require students to practise a connection that they can actually reuse in task 7, rather than merely retrieve historical facts or analyses.
- Task 7 makes an overall extent judgement necessary: students explain what empire helps explain, with what evidential strength, and where that explanation has limits. A limitation affects the claim, rather than being an unrelated closing disclaimer.
- Retrieval includes earlier answers **and** saved notes, grouped by case; all required sources remain readable on the page, and the main writing view remains calm.
- No new grades, word-count constraints, answer-length gates or mandatory multi-field planning exercise are introduced. The challenge remains interpretation and argument, and distinct reasonable conclusions remain possible.

## Revised-sequence review

### Round 2 — accepted

Reviewed the actual `identity-connections-2026-10-01` implementation against all four SHA-256 hashes in `reviewed-build.json`; each matched. I reread the complete prompts, required modern source cards, final context/support, source-group rendering and comparison retrieval. I also checked the real application in an isolated Chromium profile on a private ephemeral server at desktop (1440 × 1000) and mobile (390 × 844) sizes. The user's server and browser storage were not touched.

**Verdict: accepted for the requested learning progression. No blocking sequence or retrieval issue remains.** The revision closes the original preparation gap without adding an eighth assignment or fragmenting writing across required form fields.

| Baseline acceptance condition | Evidence in the revised build |
| --- | --- |
| At least three defensible case choices | All six now pair historical material with named, dated modern evidence: the Clive statue dispute, M Shed's display, the Commonwealth speech and constitutional change, Javed's museum display, Windrush review/monument, and the Kenya royal visit. Students can choose different combinations with a supported link. |
| Historical material is bounded | The proclamation is compared with 1949 and 2024, rather than treated as proof of continuous rule or public attitudes. Javed's family is explicitly distinguished from the earlier partition witnesses. Jamaica's emancipation and Colston's earlier slave trading are distinguished, while the public-memory comparison remains legitimate. |
| Earlier responses practise transferable reasoning | Each response now asks students to connect or compare the historical case with the later representation or experience. They produce material usable in task 7. Distinct operations remain: judgement, label revision, language comparison, family-memory interpretation, weighing explanations and evaluation. |
| A real extent judgement is required | Task 7 requires a historical/contemporary pair for each case, comparison across cases, and an explanation of how a limit or evidenced further influence changes the overall judgement. The optional language help now supplies comparison and qualification moves without prescribing conclusions. |
| Retrieval includes answers and notes by case | Six separate collapsed disclosures replace the complete expanded dossier. My saved Company-rule response and optional notes appeared together with clearly separated historical and contemporary evidence. All essential evidence was readable locally. |
| Calm, editable, ungraded workflow | The final initially displayed one essential ONS card and zero expanded case panels. The six choices were legible on both viewports, with no mobile horizontal overflow. Opening another case left the final draft unchanged. There is still one response area and no required planning form, grading or length gate. |

The source architecture now does substantive teaching work. A learner can argue that imperial history helps explain why Clive is disputed, while council decisions determine how that history is presented; connect imperial subjecthood with Windrush belonging while accounting for later documentation policies; or compare an institutional image with a family's act of remembrance. These are attainable, materially different arguments, not a supplied single answer. Modern sources repeatedly locate claims in a particular institution, person and date. The ONS evidence supports a warning against collapsing plural identities into one story; the text correctly says it cannot identify the causes of those labels.

The six-stop allocation totals 40 minutes and the final is given 20, for a 60-minute planning estimate. This is more plausible than the former 45-minute allocation, but it remains ambitious for B2 learners reading all materials for the first time, particularly the original proclamation and the three-source Jamaica and Windrush tasks. It is **not a measured completion time or a guarantee**. Optional help, editable responses and the ability to return to work support a teacher spreading the activity across lesson phases. The important gain is that this reading and writing now contributes directly to the final argument. Further compulsory content would weaken the fit; no additional task is needed.

Browser inspection evidence: `/tmp/task7-sequence-review-desktop.png` and `/tmp/task7-sequence-review-mobile.png`. These are local reviewer inspection captures, not live-site acceptance or reports from real learners.

### Final hash acknowledgement

Rechecked the updated manifest after the final wording correction. Content (`da585b96…`), resources (`2bcc12bb…`) and CSS (`4fb57aa7…`) are unchanged from the accepted build. The final renderer hash is `2bce930f5f71dadefcab6b6d6e94c14fe0b6df86a19414617429f05b36783555`. Reversing only “dated contemporary evidence” to the earlier wording reproduces the previously reviewed renderer hash (`960311b7…`), confirming the narrow change. This correction appropriately includes relevant British institutional speeches delivered outside Britain. The entry points now describe the enquiry as taking **about** 60 minutes, and the teacher guidance allows the work to be split across sessions. Acceptance stands; no new issue was found. The browser suite was not repeated for this text-only correction.
