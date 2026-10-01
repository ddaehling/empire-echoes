# Simulated novice learner review

This is an independent simulated perspective, not a pupil trial or evidence from real students. Persona: Q2 learner who can work in English but has little prior imperial history and does not know the East India Company, partition, Windrush or Mau Mau.

## Baseline — 1 October 2026

Reviewed `http://localhost:8777/app/journey/#rallye` in a fresh isolated headless Chromium context at 1440 × 1000. Read the introduction and all seven rendered task pages and inspected their full-page screenshots. Local evidence: `/tmp/student-novice/intro.txt`, `stage-1.txt` through `stage-7.txt`, and matching PNGs. No user browser or server state was changed. Review preceded the revision team's replacement content/UI.

| Dimension | Rating / 5 | Evidence |
| --- | --- | --- |
| Context | 2 | The Company is introduced through its charter rather than as a British trading business. “Crown”, “subjects”, “dominion” and partition are assumed. Kenya begins with independence and jumps to a 2013 statement without explaining the colonial conflict. |
| Instruction clarity | 3 | The intended product is often clear, especially the replacement museum label and two-sentence partition note, but duplicate questions plus additional “Look for” questions, map actions and citation requirements obscure the essential action. |
| Visual focus | 3 | Typography and reading width are calm, but the same prompt appears above and below evidence. Stops 2 and 5 exceed 3,700 screenshot pixels; the learner sees two writing areas when the required notebook is open. |
| Usability | 3 | The route makes all seven tasks reachable and the writing jump is useful. Multiple atlas/source actions and separate source administration add navigation work. Visible word-count completion rules and locking language conflict with editable learning work. |
| Autonomy | 2 | The learner can navigate, but essential meanings are missing from the initial prose; the final argument expects independent present-day connections without a concrete explanation of what an identity connection can be. |

**Baseline result: not accepted.** All dimensions must be at least 4 and no blocking confusion may remain. This is not a score for the learner.

### Concrete novice confusions and actions

1. **Trade / Bengal:** On seeing “East India Company received a royal trading charter”, I do not know whether this is an Indian company, a government, or a British business. I can repeat that taxes paid for troops, but cannot picture why a company could govern people. Explain the actor, charter, trading purpose and later power before asking for the causal connection. “Nawab”, “Plassey” and “diwani” in the source summary add names without helping me understand the required chain.
2. **Jamaica:** I can tell that I must write the label itself and that the displayed label is invented. I still need the setting: enslaved people were forced to work for owners in a British colony; abolition is the legal ending of slavery. The difference between abolition and continued compulsory apprenticeship is helpful when plainly explained. Remove the separate requirement to remember a cite button after using a source detail.
3. **India / Crown rule:** “The Company to the Crown” might sound like a change of leader inside the same company. Explain that British government rule replaced Company government, Victoria was the British queen, and a proclamation is a public official statement. Explain the uprising enough to make the purpose of reassurance intelligible. The quotation is short and clearly distinguished from paraphrase; preserve this strength.
4. **Partition:** I infer that partition means the creation of India and Pakistan, but the text never actually defines the term or explains why a new border could force a family to move. “Constitutional change”, “border award”, “Sikh interests” and “displacement” make the short scenario harder. A plain account of independence, division and people's uncertain safety would let me choose a human detail meaningfully.
5. **Windrush:** “Windrush arrived” assumes I know it was a ship. Explain arrival in Britain, the colonial relationship and the difference between lawful residence/citizenship and being treated as belonging. The detailed 1948/1949 Act chronology comes before I understand the main situation. The source pair is useful once the setting is clear.
6. **Kenya:** This is the largest context gap. I am asked to analyse regret versus denial of liability, but I do not know who experienced the abuses, what Mau Mau was, what colonial authorities were responding to, or why survivors were making claims fifty years later. Define legal liability plainly without giving the interpretation away. Kenya–2013 needs to be intelligible before optional Hong Kong comparison appears.
7. **Final comment:** I understand the magazine audience and need for two cases. I do not know how a resistance or independence event from long ago becomes an argument about identities *today*. Explain that identities can include how people see their membership of a nation/community, family histories and which public histories they remember. Clarify the process of making a supported connection while leaving the judgement open. “Complication” and “limit of evidence” need plain instructions. The final screen's “0 core sources” and required source notebook make me fear I have lost evidence.

### Design and interaction priorities

- Keep one displayed task, essential scenario, relevant evidence and one visible response field. The current repeated prompt doubles the perceived workload.
- Put optional original-site locators, extra research and language support behind clear disclosures; avoid unlabelled extra questions competing with the required task.
- Remove marks, word targets/counts, scoring criteria, source-count gates and completion locking in accordance with the contract. Make it clear that revisiting and revising are expected.
- Keep source attribution and authentic-wording labels. They make it possible to choose a quotation without mistaking a paraphrase for historical wording.
- Preserve an obvious route back from the map and show which current task is resumed.

## Final re-review

Pending. Acceptance will be decided from the same final live version used by the other independent reviewers, after a fresh rendered-page review and interaction check.

## Integrated round 1 — 1 October 2026, 19:25–19:27 UTC

Re-reviewed every actual live page at `http://localhost:8777/app/journey/#rallye` with content revision `ungraded-2026-10-01`, in fresh isolated Chromium contexts at 1440 × 1000. The findings below come from rendered text, all seven screenshots and real form/navigation interactions, not from assuming the context drafts were integrated. No teacher answers were opened in this round.

| Dimension | Rating / 5 | Independent finding |
| --- | --- | --- |
| Context | 4 | Essential unfamiliar actors and concepts are now explained visibly before the task: English trading business/charter/revenue, enslavement/abolition, Crown rule/proclamation/uprising, partition, Windrush ship/generation/scandal, Mau Mau/detention/settlement/liability. |
| Instruction clarity | 4 | Every task says what to produce, with a single task block. I can distinguish an explanation, replacement museum label, reading of a quotation, account of change and magazine comment. The final comment now permits two freely chosen cases and explains the qualification plainly. |
| Visual focus | 4 | The sequence is consistently situation → evidence → task → response. Each default task page has exactly one visible textarea and no horizontal overflow. Attribution and original-wording labels stay visible; extra research and notes are disclosures. |
| Usability | 4 | A draft persists through navigation and reload. Marking done and saving the review do not lock writing. The atlas's “Back to your task” returns to the correct stop with the draft intact. The final evidence disclosure restores earlier work and eight essential source cards. |
| Autonomy | 4 | The learner can begin without a name, use local evidence without external research, revisit any stop, choose relevant evidence and develop an independent view. Source details are included automatically; no separate citation-completion chore is needed. |

**Round 1 result: accepted for the inspected build.** All five dimensions meet the threshold, and no blocking novice confusion remains. This remains a simulated perspective, not an actual pupil trial. Small improvements below do not prevent the learner from carrying out the task.

### What the novice can now understand and do

1. **Trade:** I now know the Company was an English business, not an Indian government, and that the charter and tax rights are different powers. I can use the evidence about officials, soldiers and income to write my own causal explanation.
2. **Jamaica:** The plantation setting and meaning of enslavement/abolition are supplied. I know I must produce the replacement label itself, including resistance and one chosen detail about ending slavery, not answer several separate questions.
3. **Crown rule:** The actor change and public-announcement genre are explained. I can pick actual quoted wording, explain its image of rule and possible purpose after conflict, then say what further evidence I would need. No claim about universal reader reaction is required.
4. **Partition:** The new countries, end of British rule, meaning of partition, and danger to people's homes are clear. The instruction explicitly keeps the 1946 letter and earlier displacement separate from the 1947 border, allowing an accurate personal example.
5. **Windrush:** The ship, wider generation, legal relationship and later scandal are distinguished. I can connect legal residence with exclusion using a supplied detail. The unnamed quoted speaker is explicitly separated from Ena Sullivan.
6. **Kenya:** The previous largest blocker is resolved: the movement, colonial response, detention, survivors' later claims and legal terms are explained. I can compare the two authentic extracts and explain why a 2013 statement matters after 1963 independence.
7. **Final comment:** “Identities” is explained through belonging, self-description, family/community and overlapping identities. I can select two cases, make a judgement and discuss another influence or what the evidence cannot establish. The earlier-responses disclosure gives access to my draft and source material without asking me to rebuild a source notebook.

### Non-blocking refinements

- The partition evidence still says “Sikh interests” without identifying Sikhs as a religious community. A short gloss would improve confidence in the letter option. The surrounding situation and family testimony currently provide enough context to complete the task.
- Stop 6's heading metadata says `1963 → 1997 → public memory` and `Kenya / Hong Kong / Britain`, although the essential task concerns the 1950s, 1963 and 2013 Kenya statement. Stop 3 similarly names Canada/1867 in metadata while the essential task is India/1858. Aligning the primary metadata to the essential task would make orientation faster; the prose currently resolves this mismatch.

### Screenshot and interaction evidence

- [Stop 1: Company context and single response](/tmp/student-novice-round1/stage-1.png)
- [Stop 2: museum-label task](/tmp/student-novice-round1/stage-2.png)
- [Stop 3: Crown rule and authentic wording](/tmp/student-novice-round1/stage-3.png)
- [Stop 4: partition and chronology](/tmp/student-novice-round1/stage-4.png)
- [Stop 5: Windrush distinction](/tmp/student-novice-round1/stage-5.png)
- [Stop 6: Kenya and legal terms](/tmp/student-novice-round1/stage-6.png)
- [Stop 7: magazine comment](/tmp/student-novice-round1/stage-7.png)
- [Atlas return](/tmp/student-novice-round1/map.png), [earlier responses and evidence](/tmp/student-novice-round1/earlier-evidence.png)
- Interaction results: `/tmp/student-novice-round1/interaction.json` and `/tmp/student-novice-round1/map-interaction.json`. No browser page errors were recorded. A short draft remained editable after “Save this review” and persisted on reload; other tasks were empty and did not create a completion gate.

Build fingerprints captured at the end of review (SHA-256):

```text
0ac09b9e596061a52b8cd3008118c6a2ee56f1f79ca4df4f798df654e163e2d5  rallye-content.js
5a3fb5e1c98074300fb925bd830dc46fc00187c43cf20c7fc9bb1ca84ab8e618  rallye-resources.js
ec9f79509030fd402da3ff317ee7223de1a63271b96fa4391b14e5daa775848a  rallye.js
dc942d4aa6a4b1e8f13c0348fadba11b3bed349b5170031ec7440c7e642e3993  rallye.css
```

## Final same-build delta review — 1 October 2026

**Accepted: context 4/5, instruction clarity 4/5, visual focus 4/5, usability 4/5, autonomy 4/5. No blocking confusion or regression found.** This final acceptance applies to review round 2, revision `ungraded-2026-10-01`, exactly as recorded in `docs/learning-revision/reviewed-build.json`. All nine local runtime files matched their SHA-256 entries both before and after the live delta review. The manifest itself has SHA-256 `2a8c00ca443d7aba5b9f70d0bce23da726598c84f7d906693396eed6bd13823c`.

Reopened the actual introduction and affected stops 3, 4 and 6 in a fresh isolated Chromium context; existing round-1 all-seven-task review remains the evidence for unchanged content. Verified these changes in rendered text and screenshots:

- The introduction places the Begin action before the route preview in reading order; it is immediately visible in the desktop layout.
- Stop 3 now says `1857 → 1858` and `India / Britain`; stop 6 says `1950s → 1963 → 2013` and `Kenya / Britain`. The previous metadata mismatch is resolved.
- The partition card now identifies Sikhs as a religious community at first visible use. The previous small vocabulary gap is resolved.
- The sources/atlas disclosure explicitly says `(optional)`, and the optional Hong Kong comparison remains understandable and separate from the essential Kenya task.
- Opening the atlas from Kenya and choosing “Back to your task” returned to `remembering-empire` with the test draft intact.
- At 200% CSS zoom, page width remained 1440px with no horizontal overflow. The global footer links wrapped and remained readable. No browser page errors occurred.

Final evidence: [introduction](/tmp/student-novice-final/intro.png), [stop 3](/tmp/student-novice-final/stage-3.png), [stop 4](/tmp/student-novice-final/stage-4.png), [stop 6](/tmp/student-novice-final/stage-6.png), [footer at 200%](/tmp/student-novice-final/footer200.png); recorded hashes, rendered text and map-return result in `/tmp/student-novice-final/review.json`.

This remains an independent simulated novice review, not evidence of an actual pupil trial.
