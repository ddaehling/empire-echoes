# Simulated student review — English accessibility

Reviewer perspective: a B2 English learner who can form thoughtful ideas, but is unfamiliar with academic task language. This is an independent simulated review, not testing with an actual pupil.

## Baseline review, 1 October 2026

**Decision: not accepted.** The five dimensions below must each reach at least 4, with no blocking confusion, before I accept a revised version. These scores describe the observed baseline; they are not ratings of the version still being edited.

I read `CONTRACT.md`, inspected the current `rallye-content.js` and `rallye.js`, and visited the start screen and all seven actual task pages at `http://localhost:8777/app/journey/#rallye`. The browser was an isolated headless Playwright Chromium context at 1440 × 1000. I used only a simulated reviewer name; no real student work or user browser was used. Screenshots and rendered text were collected in `/tmp/student-english-*`. Baseline content revision: `q2-english-2026-10-01`; baseline storage: `empire-echoes-rallye-v3`.

| Dimension | Score | Concrete evidence and learner consequence |
|---|---:|---|
| Context | 2/5 | The first task assumes I know what the East India Company and a royal trading charter are. Task 3 says powers passed “to the Crown” without explaining Crown government; Task 5 says “Windrush arrived” without first identifying the ship. Task 6 jumps from Kenya's independence to a settlement without introducing Mau Mau or the colonial conflict. I can repeat facts without understanding the scene. |
| Instruction clarity | 2/5 | “A short causal note,” “constitutional change,” “concession or contrasting clause,” “communicative purpose,” and “explanatory relevance” are additional language puzzles. The final task layers two links, two case categories, a complication, a source limit, a judgement, source selection, plural identities and revision checks across several locations. |
| Visual focus | 2/5 | Every task displays the full main question twice. Task 1 runs approximately 2,736 pixels and the final task 2,981 pixels at the reviewed width. Source prompts, “Look for,” “Where to look,” map actions, citation actions and the repeated question compete before the response area. The styling is restrained, but the structure is not calm. |
| Usability | 3/5 | The route and autosave messages are helpful, and all seven pages are directly reachable. However, the response is far below the first question, the two jump controls imply separate work modes, and the final page shows “0 core sources” alongside an evidence notebook requiring two sources. “Cite this source” does not plainly describe the button's action. |
| Autonomy | 2/5 | Optional language help and optional additional readings are positive. But marks, word targets, maximums and “The word count checks completeness” make the page feel like a compliance test. Some stages require citation administration, and the final task requires sources saved separately. The code's `validateStage` enforces word/source counts, so the learner's own judgement about sufficient reasoning cannot govern completion. |

### Findings and proposed wording, by task

These are proposed task instructions, not model answers. Keep exact historical quotations unchanged and retain clear source attribution.

1. **When trade becomes rule.** The question arrives before the context. “Revenue collection” and “territorial rule” are not explained where they first occur; “causal” in the product label adds nothing for me. First introduce the East India Company as a trading business allowed by the English monarch to trade in Asia, then explain the later right to collect taxes. Suggested task: **“Explain how collecting taxes helped the East India Company gain power over land and people. Use one detail from the source and show how money and power were connected.”** Suggested label: **“Explain the change.”** Keep a learner's choice of which evidence establishes the connection.

2. **Who made freedom happen?** The invented museum label and requested replacement are concrete and engaging. However, enslavement, abolition and apprenticeship appear in quick succession without a simple initial scene. Explain forced labour and legal abolition in ordinary language before the dates; clarify that “apprenticeship” here did not mean a freely chosen training course. Suggested task: **“A museum has written: ‘Britain gave enslaved people their freedom.’ Write a more accurate label for visitors your age. Include enslaved people's resistance and one detail about how slavery ended.”** Put the available detail categories in optional help if needed. Say directly that the learner writes the label, with no additional essay required. Remove saving a source as an extra task.

3. **One colour, unequal power.** “Crown,” “subjects,” “proclamation” and “dominion” need explanation. The task's intellectual challenge is appropriate; its wording makes the steps harder to see. Suggested task: **“Choose one word or phrase from Victoria's statement. Explain what impression of British rule it gives and why the government might want people in India to have that impression. Then explain why this promise alone cannot show how people were treated.”** Suggested label: **“Explain the effect of the words.”** Keep the actual quotation prominent. Make the Canada comparison clearly optional so it is not mistaken for a second required response.

4. **Independence is more than a border.** This is the most immediately understandable baseline output: two sentences with different purposes. Define partition as the division of British India into independent India and Pakistan before using it. “Constitutional change” in the research instructions can become “change in who governed.” Suggested task: **“Explain what changed in government in 1947. Then use one person's experience from the source to show something the map cannot show.”** Keep chronology explicit: the source includes experiences before the 1947 division, so the task must not imply every experience happened after it.

5. **Who gets to belong?** Identify Empire Windrush as a ship and explain British subject status and the later scandal before asking for comparison. “Accepted belonging” is abstract; “concession or contrasting clause” is unnecessary required grammar terminology. Suggested task: **“Explain how a person could have the legal right to live in Britain but still be treated as if they did not belong. Use one Windrush detail and explain its connection to Britain's rule in the Caribbean.”** Optional help may offer “Although …, …” without prescribing the conclusion or requiring the term “concession.” Preserve the difference between the arrival, the 1949 law and the later scandal.

6. **When does an empire end?** This is the largest missing-context problem. Introduce British rule in Kenya, the Mau Mau conflict and colonial detention/abuse so the 2013 statement is understandable. Define “liability” immediately beside the quotation as legal responsibility; do not require a learner to open help to understand the main question. Suggested task: **“Compare the government's words of regret with its refusal to accept legal responsibility. What does the government acknowledge, and what does it refuse to accept? Use exact words from the statement. Explain how this statement shows that colonial rule still mattered after Kenya became independent.”** Keep the two quotation extracts distinct. Replace “communicative purpose” and “provenance” in required instructions with plain descriptions of the speaker's purpose and where the statement comes from.

7. **The past inside the present.** Use **“Your magazine comment”** consistently; the baseline switches among “comment,” “written argument,” “final argument,” and “Make your case.” Explain a comment as writing that gives a view and supports it. The main question can remain, with “How much” as an optional explanation of “How far.” Suggested sequence: **“Give your view on how Britain's imperial past helps us understand identities in Britain today. Use two cases from this enquiry: one about resistance or independence, and one about belonging or memory. Explain the connection to today in each case. Consider another influence on identity, and explain something one of your sources cannot tell us.”** A final optional revision prompt can ask the learner to check whether they have claimed more than their evidence shows. Keep definitions of identity/public memory nearby; do not bury indispensable definitions in optional support. Remove the second full question, source-saving mechanics, mark references, length targets and the detailed minute-by-minute schedule.

### Shared language and interface changes

- Put the historical situation first, followed by essential evidence, one clearly labelled task and one writing area. A small task preview may be useful, but repeating the entire question increases reading rather than orientation.
- Label optional actions at their point of use: **“Explore on the map (optional),” “Read the original source (optional),” “Help with words and sentences,” “About this source.”** “Where to look” currently sounds like an instruction to leave the page, although the later notice says the local cards are sufficient.
- If source saving remains as an optional convenience, say **“Save source”** and clarify that it saves a reference. Do not equate pressing this button with using evidence well.
- Do not let the “Look for” questions become competing assignments. Present genuinely necessary thinking inside the single task; move extra questions into optional help.
- Keep sentence starters incomplete and open. They should assist expression without supplying the historical judgement. The baseline stems generally meet this principle and can be retained selectively.
- Use a progress label that describes work saved or tasks visited, without making the app appear to judge quality. Explain that responses remain editable.

### Blocking issues for acceptance

1. Essential concepts must be understandable before the task uses them, particularly Company/Crown rule, Windrush, and Kenya/Mau Mau.
2. Each stage needs one main instruction set. The final task must be understandable as a short sequence, not a collection of assessment terms.
3. Remove marks, length requirements/counts and completion gates based on them, including indirect guidance in the current interface.
4. Remove required manual citation administration, while preserving source identity and evidence use.

Critical feedback was sent directly to `learning_author`, `interface_builder` and root. A final decision remains pending an independent re-review of the same integrated revision reviewed by the other student perspectives.

## Integrated round 1 review, 1 October 2026

**Decision: accepted for this simulated B2 English learner perspective.** Every dimension is at least 4 and no blocking confusion remains. This acceptance describes the version below, not an actual pupil trial, and does not replace the other independent reviews.

I started with a clean isolated Playwright Chromium context at 1440 × 1000, visited the introduction and all seven actual task pages, opened every language-help disclosure, read the rendered text and inspected screenshots. I entered only the plainly labelled dummy text “Simulated reviewer draft.” in the final response, marked that stop done, saved the review with other responses empty, and returned to the final response. It retained the text and remained editable. No page errors were reported. No application files were edited.

Content revision: **`ungraded-2026-10-01`**. The four relevant files had identical SHA-256 values before and after this review:

| File | SHA-256 |
|---|---|
| `app/journey/js/rallye-content.js` | `0ac09b9e596061a52b8cd3008118c6a2ee56f1f79ca4df4f798df654e163e2d5` |
| `app/journey/js/rallye-resources.js` | `5a3fb5e1c98074300fb925bd830dc46fc00187c43cf20c7fc9bb1ca84ab8e618` |
| `app/journey/js/rallye.js` | `b2849f0e2e2474fee3fe1283c57aaa6b46ea32d8fb2de998a0cb2b5cc8875f5e` |
| `app/journey/css/rallye.css` | `dc942d4aa6a4b1e8f13c0348fadba11b3bed349b5170031ec7440c7e642e3993` |

| Dimension | Score | Round 1 evidence |
|---|---:|---|
| Context | 4/5 | The Company is introduced as a trading business, charter and revenue are explained, Crown rule/proclamation are defined, partition is explained before the task, Windrush is identified as both ship and later generation, and Kenya now introduces Mau Mau, detention and the later claims. These introductions let me understand who is doing what and why the source exists. |
| Instruction clarity | 4/5 | Each task has one prompt under “Your task,” and action verbs give understandable steps. Task 3 says “Choose a word or phrase … and quote it” instead of relying on “analyse” alone. Task 6 says “what … acknowledges and what … refuses to accept.” The final task asks for a view, two cases and a qualification without the earlier assessment terminology. |
| Visual focus | 4/5 | Every page follows situation → evidence → task → response. Each has one visible textarea; optional notes are closed. The main task is visually distinct, exact quotations are separated from paraphrases, and source details no longer look like extra questions. Pages still involve scrolling because the historical introductions and evidence are substantive, but this now serves reading rather than repeated administration. |
| Usability | 4/5 | All seven stages are directly reachable, clear labels show the writing product, “Review & download” describes the next action, and the response survives review. The final page offers earlier responses and evidence in one disclosure. The route says “marked done,” accurately describing the learner-controlled checkbox. |
| Autonomy | 5/5 | No marks, grades, word targets, word counters, required source-saving controls or automatic quality judgement appeared on the reviewed current pages. I could save a review with a short draft and revisit it for editing. Each help panel explicitly says to use a phrase only if it helps and to add one's own reasoning. The starters leave the substantive interpretation open. |

### All seven tasks checked

| Task | What became understandable | Remaining observation |
|---|---|---|
| When trade becomes rule | The learner first learns what the business, charter, Bengal and revenue are; the task then asks for a connection between tax rights and governing power. “Your explanation” is a plain writing label. | No blocker. The historical causal connection still has to be expressed by the learner. |
| Who made freedom happen? | Enslavement and abolition are defined. The evidence explains compulsory apprenticeship. The invented label is clearly marked, and “Write the replacement label itself” removes uncertainty about the requested text. | No blocker. The learner chooses the additional historical detail. |
| One colour, unequal power | Crown rule, the uprising and proclamation now have a connected explanation. The task makes quoting, interpreting and identifying needed evidence concrete. | No blocker. “Impartial” is usefully defined in language help. |
| Independence is more than a border | Partition is explicitly defined, and the task states what to name and what human experience to use. The timing note prevents treating the 1946 letter or earlier displacement as an event caused by the 1947 border. | No blocker. The learner may choose either concern or displacement. |
| Who gets to belong? | The ship, generation, colonial relationship and later scandal are separated. The task's legal-right-versus-treatment contrast is plain. The two cards explicitly avoid merging Ena Sullivan with the unnamed quoted person. | No blocker. “Although … had the right to …, …” helps expression without supplying an answer. |
| When does an empire end? | The Kenya/Mau Mau context makes the later statement meaningful. Settlement and liability are explained before analysis. The learner compares two distinct quoted extracts and connects 2013 with independence in 1963. | No blocker. The prompts preserve language analysis and an across-time connection. |
| The past inside the present | A school-magazine scenario explains identity with familiar examples and defines a comment. “How much” in the introduction makes “How far” understandable. The task consistently asks for a magazine comment, and earlier evidence is available without citation administration. | No blocker. “Public memory” could also be defined in the introduction, though it is already defined in optional vocabulary and the task offers understandable alternatives. |

### Round 1 evidence files

Rendered text, all help-panel text, observations and file hashes are recorded in `/tmp/student-english-round1-pages.json`.

Screenshots of the closed default workspace were captured for every task:

- `/tmp/student-english-round1-profit-and-power.png`
- `/tmp/student-english-round1-freedom-and-memory.png`
- `/tmp/student-english-round1-rule-and-resistance.png`
- `/tmp/student-english-round1-departure-and-division.png`
- `/tmp/student-english-round1-migration-and-belonging.png`
- `/tmp/student-english-round1-remembering-empire.png`
- `/tmp/student-english-round1-whose-britain.png`

All four baseline blockers are resolved in this reviewed revision. Two optional polish suggestions were sent to the owners: explain “public memory” in the final context as well as the language help, and add “optional” to the exploration disclosure label. Neither prevents comprehension or independent completion, and neither is a condition of this acceptance.

## Final same-build delta review — round 2

**Final decision: accepted.** Scores remain **context 4/5, instruction clarity 4/5, visual focus 4/5, usability 4/5 and autonomy 5/5**. No new issue or blocking confusion was found. The all-seven-task and language-help review above carries forward; this round checked the changed regions in a fresh isolated browser session.

I independently calculated the SHA-256 hashes of **all nine runtime files** in `docs/learning-revision/reviewed-build.json` before and after the live inspection. Every value matched the manifest in both checks. The manifest identifies content revision `ungraded-2026-10-01`, review round 2; the manifest file itself has SHA-256 `2a8c00ca443d7aba5b9f70d0bce23da726598c84f7d906693396eed6bd13823c`. This final acceptance therefore refers to the same frozen build listed there.

The live introduction now puts the notebook form and Begin action ahead of the route preview in reading order. At 1440 × 1000 the Begin action is visible in the right-hand notebook panel. The actual disclosure reads “Explore sources and the atlas (optional),” and the final comment reads “Explore sources further (optional),” so exploratory reading no longer looks compulsory. The partition summary explains Sikhs as a religious community where the term is used. Task 3 now shows India / Britain, 1857 → 1858; Task 6 shows Kenya / Britain, 1950s → 1963 → 2013. These headings match the required evidence and avoid suggesting that optional Canada or Hong Kong comparisons are separate assignments. The single-task layout and plain final-comment instructions remain intact. No browser page errors were reported.

Evidence: `/tmp/student-english-round2-evidence.json` contains the before/after nine-file hash comparison and rendered affected regions. Screenshots inspected: `/tmp/student-english-round2-intro.png` and `/tmp/student-english-round2-partition.png`. This is still an independent simulated student perspective, not a claim of real pupil participation.
