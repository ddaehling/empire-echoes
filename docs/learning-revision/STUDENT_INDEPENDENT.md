# Simulated independent student review

Reviewer: `student_independent`, one of five independent simulated perspectives. This is a product inspection, **not real learner testing**. Persona: a conscientious student working alone, who needs to know what to do, why it matters, whether work is safe, and whether a choice is allowed without assessment pressure.

## Baseline — 1 October 2026

**Not accepted.** Ratings are based on the initial rendered seven-task UI, before the concurrent content/UI revision was integrated.

| Dimension | Rating (1–5) | Evidence |
| --- | --- | --- |
| Context | 3 | Historical overviews are useful but assume Company, charter, revenue collection, Crown and dominion vocabulary. Kenya starts at 1963 and jumps to the 2013 legal statement without explaining the colonial conflict. |
| Instruction clarity | 3 | Museum-label and partition tasks have identifiable outputs. Repeated full prompts, source-saving instructions, map instructions and marking guidance make the other tasks feel like several separate obligations. Final writing adds many conditions and a timed sequence. |
| Visual focus | 2 | At 1440 × 1050 the first task is 2736 px tall and final task 2981 px tall. The same question appears in the header and below evidence. Map controls, source citation buttons, research jumps, notebook form and rubric compete with the one answer area. |
| Usability | 3 | Begin is discoverable, and short draft plus notebook notes survived both map return and reload. Download is available in a disclosure. Word/source gates and locked completion make ordinary revision harder than it should be. |
| Autonomy | 2 | “Required · 5 marks · teacher review”, word ranges, source count requirements and “Completing the rallye locks this attempt” frame the activity as an assessment. A conscientious student cannot judge whether a short tentative idea is safe to leave and improve later. |

### All seven tasks inspected

1. **When trade becomes rule:** sensible causal question, but the prompt arrives before definitions of Company/charter/revenue; map and source actions distract from the actual explanation.
2. **Who made freedom happen?:** rewriting the invented museum label gives a concrete audience and output. Required citation-saving and word guidance become extra tasks unrelated to improving the label.
3. **One colour, unequal power:** authentic quoted wording makes analysis possible. Crown rule and the Canada comparison need explaining before they can help; the difference between interpretation and evidence of treatment is intellectually useful but demanding.
4. **Independence is more than a border:** the clearest output: distinguish political change and a human experience. A plain definition of partition would improve independent access.
5. **Who gets to belong?:** chronology and legal status are carefully distinguished, and two prepared sources are useful. The citizenship terminology and long source meta-information slow the route to writing.
6. **When does an empire end?:** regret versus liability is a legitimate analysis, but I need the Kenya/Mau Mau story before I know why the statement exists or why responsibility remains disputed.
7. **The past inside the present:** school-magazine audience gives a purpose. The long prompt, duplicated prompt, multi-part conditions, timed writing plan and two-source administration make it feel like a high-pressure final assessment.

### Actual interaction evidence

- Used a private Chromium browser context (Playwright), desktop viewport 1440 × 1050, and private local server on port 8965. No user browser/profile was read. No app files changed.
- Opened the beginning page and all seven actual task pages; captured rendered text and screenshots in `/tmp/independent-baseline-*`.
- Entered a short answer on the first task and an optional notebook note. Opened the atlas and used “Return to your rallye”. Both answer and note remained after return and page reload.
- Opened language help and inspected the review screen and a text download.
- The content file changed during that last follow-up. The old renderer then showed `undefined marks`/`undefined–undefined words`, and blank tasks appeared “Ready”. These are observations of a **moving integration state**, not asserted defects of a final revision. Final acceptance requires a fresh run after integration.

### Actionable feedback delivered

- **interface_builder:** one context → essential evidence → task → answer flow; do not repeat the full task. Keep optional map, research, language help and notes behind clearly named disclosures. Let the learner download a partial draft and edit after review.
- **progress_engine:** preserve the demonstrated map/reload save behavior; state local-save status clearly; remove length/citation gates and locking; use factual progress wording rather than suggesting answers have passed a quality check.
- **learning_author:** define unfamiliar concepts before the task needs them, especially Company/Crown/partition and Kenya/Mau Mau. Give one concrete writing instruction and purpose; reduce final-task stacked requirements while keeping evidence and source-limit thinking.
- **root:** do not accept this baseline; schedule independent re-review on the integrated final version. All dimensions must be at least 4, with no blocking friction.

## Re-review status

The baseline was superseded by the integrated review below and the final round-2 acceptance at the end of this report.

## Integrated round 1 — 1 October 2026

**Accepted for this simulated independent-student perspective.** Every dimension is at least 4 and no blocking friction remained in the inspected flow. This is an independent product review, not evidence from actual students.

| Dimension | Rating (1–5) | Evidence |
| --- | --- | --- |
| Context | 4 | Every task now begins with a situation and a purpose. Company/charter/revenue, enslavement/abolition, Crown rule/proclamation, partition, Windrush and Kenya/Mau Mau/liability are explained before use. The two-source tasks still require sustained reading, but the historical relationships are understandable without the optional pages. |
| Instruction clarity | 4 | Each task appears once directly above a specifically named response area. The final task now asks for two freely chosen cases and a supported view, without a checklist of marking conditions. Source limitations are explicit; the task remains intellectually demanding rather than mechanically restrictive. |
| Visual focus | 4 | The page follows situation → evidence → task → one answer. Help, research and notes are below the writing area in clearly labelled disclosures. Two-source stops remain long scrolling pages, but the sequence is coherent and there are no competing citation forms or repeated questions. |
| Usability | 4 | Begin worked without a name; blank stops could be skipped. Answer, optional note and my marked-done choice survived atlas return and reload. Review saved with six empty responses, all responses stayed editable, and TXT/HTML/JSON downloads preserved the draft. Fresh-notebook recovery preserved my edited answer and notes in a separate readable download. |
| Autonomy | 5 | I could start anonymously, leave a tentative response, skip, revisit, choose help, mark progress myself, save a partial review, edit it, and download at any time. There were no marks, word limits, required source-administration steps or answer-quality claims in the rendered workflow or inspected current downloads. |

### Seven-task re-review

1. **When trade becomes rule:** the context defines Company, charter and revenue; the evidence shows what tax income made possible. The requested causal explanation is clear.
2. **Who made freedom happen?:** the context explains enslavement and abolition; the audience and invented label are explicit. I can choose which abolition detail to use, and only need to write the replacement label.
3. **One colour, unequal power:** Crown rule and proclamation are now explained. The task tells me to select actual wording, interpret its purpose, then consider what else I would need to know about treatment.
4. **Independence is more than a border:** partition is defined. The task distinguishes political change from a documented individual experience, and clearly warns that the cited experiences predate the border.
5. **Who gets to belong?:** the ship, wider generation, colonial legal relationship and scandal are all introduced. The source card explicitly prevents me from attributing the unnamed speaker's words to Ena Sullivan.
6. **When does an empire end?:** the Kenya/Mau Mau detention history now gives the 2013 statement a reason to exist. Settlement and liability are defined, and the prompt makes the comparison of language concrete.
7. **The past inside the present:** overlapping identities and the magazine audience are explained. “Your earlier responses and evidence” exposes my earlier draft and eight essential evidence cards; a “Revisit this stop” action returned me to my editable first response.

### Interaction and artifact verification

- Fresh isolated Playwright Chromium contexts; private server port 8965; viewport 1440 × 1050. No user profile or browser data was read and no app file was edited.
- Inspected all seven rendered task texts and captured all seven screenshots; visually reviewed the longer two-source stops as well as first/final task layout.
- Entered “A tentative independent idea about taxes and governing.” and a source note, marked the first task done, opened optional language and research help, visited the map, and used the prominent “Back to your task”. The text, note and selected completion state persisted across return and reload.
- Once the rallye view was visible after map return, focus returned to “Open on the atlas”; scroll position was restored near the departure point (1241 → 1264 px, allowing layout differences).
- Moved over empty stops using Next; saved review with only one response; edited the answer afterward. No validation gate appeared.
- Inspected TXT, HTML and JSON current downloads. The response was retained, no grading/word-count metadata was found, and the text explains that automatic attribution does not claim the learner used every source.
- Started a fresh notebook using the explicit dialog. “Earlier saved work” produced a readable recovery download containing both the edited answer and optional note. This checked current-attempt recovery, not every historical migration format.
- No browser page errors during the comprehensive run. The answer field has no `maxlength` and is not `required`.

### Stable inspected revision

The comprehensive all-seven-task run had identical file hashes at its beginning and end:

- `rallye.js`: `ec9f79509030fd402da3ff317ee7223de1a63271b96fa4391b14e5daa775848a`
- `rallye-content.js`: `0ac09b9e596061a52b8cd3008118c6a2ee56f1f79ca4df4f798df654e163e2d5`
- `rallye-state.js`: `172aa42b704fb2952e6c0aaf0dc1c159850fa627963d01ee5e65aa84ec14634f`
- `rallye-resources.js`: `5a3fb5e1c98074300fb925bd830dc46fc00187c43cf20c7fc9bb1ca84ab8e618`
- `rallye.css`: `dc942d4aa6a4b1e8f13c0348fadba11b3bed349b5170031ec7440c7e642e3993`

No blocking changes requested. A future polish opportunity is a discreet “Back to my response” control after opening the final task's long earlier-evidence disclosure; normal scrolling and the existing route are adequate, so this does not block acceptance.


## Final round 2 — same-build acceptance

**Accepted.** This final delta review applies to `revision: ungraded-2026-10-01`, `reviewRound: 2` in `docs/learning-revision/reviewed-build.json`. All **nine file hashes matched the manifest before and after** the browser inspection. The earlier all-seven-task review remains the evidence for unchanged material; this round checked the changed regions and basic begin/review/edit behavior.

Final ratings: **context 4/5 · instruction clarity 4/5 · visual focus 4/5 · usability 4/5 · autonomy 5/5**. No blocking friction or new issue found.

- Inspected the actual introduction at 1440 × 1050. The Begin form precedes the route preview in reading order; the desktop layout presents it clearly beside the introduction. Anonymous begin still works.
- Checked the affected task headings: task 3 now reads **1857 → 1858 · India / Britain**, and task 6 reads **1950s → 1963 → 2013 · Kenya / Britain**. These accurately identify the primary evidence instead of implying that optional comparisons are required.
- Confirmed the research disclosure explicitly says **“Explore sources and the atlas (optional)”** on the inspected tasks.
- Read the partition source with the new **“Sikhs, a religious community”** explanation. The detail is understandable without another lookup and preserves the 1946 timing.
- Saved a review containing only a short draft, returned to task 6 and edited it freely. The review confirms that every response remains open for editing.
- Checked footer reflow at a 640 × 480 CSS viewport, the effective layout width of a 1280-wide window at 200% zoom. Document scroll width equals viewport width (640 px), and the screenshot shows separate readable footer links with no clipping or overlap. This is a reflow-equivalent check, not a claim to have changed the native browser zoom setting.
- Used a fresh isolated Chromium context and private port 8965. No user profile read, no application changes, and no real-student testing claim.
