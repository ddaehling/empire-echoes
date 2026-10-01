# Q2 English rallye: usability and classroom alignment

Reviewed 1 October 2026. Scope: `/app/journey/#rallye`, using the real current data and a separate server on port 8893. Browser contexts were isolated; the teaching server on 8777 and earlier applications were not changed. Impeccable audit guidance was applied while preserving the existing atlas design system.

## Evidence and scope

The source set has been resolved: the handbook, detailed lesson plans and textbook research report are the three primary documents. The shorter plans and classroom texts provide supplementary evidence. The review supports the bounded English activity below; it does not claim that one 45-minute activity covers the whole course.

- `Lehrerhandbuch_Q2_Englisch_UK_2026_27.pdf`, PDF pp. 12–13: historical knowledge should serve interpretation and present-day debate; on the basic level, a precise causal link and well-used evidence are preferable to superficial completeness.
- `Q2_Englisch_UK_5_Verlaufsplanungen_AUSFUEHRLICH_2026_27.pdf`, PDF p. 204: task focus and operator awareness, claim–evidence–analysis–link, a limitation or counter-reading, and concise planning and revision support. PDF p. 206 provides the evidence-log and claim–evidence–analysis templates. This justifies a visible route through the task, without adding every template field as compulsory typing.
- `UK_Q2_Lehrwerksrecherche_SH_2026_27.pdf`, PDF p. 4, section 2.2: the field should go beyond factual country knowledge. For gN, the report recommends curated texts, clear consolidation, less historical detail and regular language support. This directly supports short purpose-led tasks and an optional language disclosure. It does not require every course competence to appear in this one activity.
- `British Identities Today.docx`, assignment section of the Fletcher extract: comprehension, analysis of tone and message, and evaluation. The UI must distinguish the work of explaining, analysing and judging; historical recall alone does not signal the English learning outcome.
- `Q2_Vocabulary_Britishness_Taking_Stock.docx`, sections A–B: lexical chunks, collocations and transferable use. Support should help pupils formulate their own English, not supply the historical judgement.
- `The_Bloody_British_Paul_Hawkins_Extract.docx`, sections 1–3: comic national representations invite attention to voice, hyperbole, metaphor and audience. Classroom text references belong beside the task and must be distinguished from historical evidence. Full readings need not be republished in the app.

## Baseline audit

Anti-pattern verdict: pass. The actual desktop and mobile reading surfaces use an established serif/sans pairing, calm colour tokens, ruled sections and a genuine ordered route. No re-theme is justified.

| Dimension         | Baseline score | Finding                                                                                           |
| ----------------- | -------------: | ------------------------------------------------------------------------------------------------- |
| Accessibility     |            3/4 | Labelled writing fields and visible focus; several supporting controls need larger touch targets. |
| Performance       |            3/4 | No observed runtime errors or layout instability. No performance benchmark was run.               |
| Responsive design |            3/4 | No page overflow at 1440 or 390px; long linear reading delays the task on phones.                 |
| Theming           |            4/4 | Existing light reading surface, navy ink and restrained accent are consistently token based.      |
| Anti-patterns     |            4/4 | Reading hierarchy and navigation are purposeful; no decorative redesign needed.                   |
| **Total**         |      **17/20** | **Good; improve task orientation and touch usability.**                                           |

### Findings before implementation

1. **[P1, task clarity] The purpose is discovered after the reading.** The first station’s full task begins at document y=1529px on desktop and y=2052px at 390px. Its heading begins at y=201px and y=469px respectively. Pupils can enter source reading without knowing the operator and intended English response. Keep the full prompt near the answer, but add a concise operator and response-purpose line immediately under the station title, before context and sources. This is an engine/content change; style it as ordinary instructional prose. Suggested refinement: `impeccable clarify`.
2. **[P2, language support] No optional, task-specific language help sits beside writing.** Use a closed native disclosure next to the response, with a few content-free stems and lexical chunks. Preserve the actual task outside the disclosure; do not expose the teacher answer or add compulsory work. Suggested refinement: `impeccable clarify`.
3. **[P2, touch usability] Supporting controls are smaller than the project’s 44px touch target.** Measured provenance disclosure 22px; source links/citation buttons 40px; mobile sidebar controls 34–42px. Increase the hit areas, retaining plain links and disclosures. This is a usability target, not a claim that every control breaches WCAG 2.2’s separate 24px minimum. Suggested refinement: `impeccable adapt`.
4. **[P2, recoverability] Revised tasks must make preserved work readable.** The content revision will require an explanation and access to earlier answers. Use a clear native disclosure with full original prompts, whitespace-preserving answer text and recoverable downloads. Do not silently conflate old answers with changed tasks. Engine owns the migration and recovery logic. Suggested refinement: `impeccable harden`.

Positive findings to retain: a 45-minute route with protected final writing time; short reading measures; visible student progress; read/write jumps; source provenance and clearly optional extra reading; local-save messaging; and a separate teacher assessment rather than machine marking of argument quality. The original allocation was 33 minutes of stops plus 12 final minutes. The approved revision is 30 minutes of focused stops plus 15 minutes for final planning, writing, checking and export.

## Agreed implementation contract

Engine and UX owners agreed these additions before CSS changes:

- `.ry-task-focus`: operator, response purpose and exact prompt preview directly beneath the station heading; visible before reading. `.ry-task-preview` uses ordinary body size and dark ink to distinguish the exact question from the short product cue.
- `.ry-language-support`: optional, closed disclosure beside the response. A short list of vocabulary and a short list of sentence stems remain distinct.
- `.ry-recovered-work`: preserved-work disclosure with explanatory text, archive downloads and original prompts/answers. Styles handle long student text without clipping.

Only `app/journey/css/rallye.css` and this report belong to the UX owner. Engine/content changes belong to their respective owners. The CSS keeps existing typography, colour tokens and layout. Final refinement is `impeccable polish` through live visual verification of the integrated markup.

## Validation

Baseline screenshots: `/tmp/unit-ux-before-intro-{1440,390}.png`, `/tmp/unit-ux-before-stage-{1440,390}.png`. Both tested widths had zero horizontal page overflow and zero browser `pageerror` events. Screenshots were visually inspected. These are working evidence, not bundled website assets.

Initial CSS regression: all seven stages at 320, 390, 768 and 1440px (28 views) had no page overflow or runtime errors, and route changes focused the stage heading. An isolated module fixture exercised the new engine fields and content-revision recovery before the authored content landed. At all four widths the task preceded the reading; language support opened with Enter and retained a 3px focus outline; source disclosure/link/cite controls measured 44px; and original synthetic answers were preserved beside their original prompts. Fixture screenshots: `/tmp/unit-ux-fixture-{stage,support,recovery}-{320,390,768,1440}.png`. Mobile support, station and recovery screenshots were visually inspected.

### Integrated authored-content verification

After `q2-english-2026-10-01` landed, all seven actual stages were checked again at 320, 390, 768 and 1440px. All 28 stage views and all four review views had zero horizontal overflow and no browser runtime errors. In each stage the preview exactly matched the full writing prompt and preceded the source section. Each language disclosure opened with Enter; every station exposed at most two stems and three terms. The final operator, audience, 15-minute allocation and response purpose are legible at 320px.

The first exact question is now at document y=386px on desktop and y=681px at 390px, compared with y=1529px and y=2052px at baseline. This makes the intended response available before source reading while keeping the full prompt beside the response field.

Actual migration, recovery text and optional support were also checked at 390px in Chromium, Firefox and WebKit. All three preserved the synthetic earlier answer with the original question, produced no horizontal overflow/runtime errors, and retained a 3px keyboard focus indicator. The original student's identity is shown in the recovery block. A separate 200% text-size check exposed a long-title overflow at the partition stop; allowing long heading words to wrap fixed it. All seven stages then passed that check.

The unchanged ink, body, muted and accent colours have contrast ratios of 5.12:1 or higher on the two primary light surfaces. Source links, citation buttons and provenance disclosures have 44px minimum hit areas. The new help disclosure measures approximately 49–50px across the three browsers. These are targeted checks, not a claim of a complete accessibility conformance audit.

Final screenshots: `/tmp/unit-ux-final-head-{1,3,6,7}-{320,390,768,1440}.png`, matching `support` screenshots, `/tmp/unit-ux-final-review-{390,1440}.png`, `/tmp/unit-ux-final-recovery-{chromium,firefox,webkit}.png`, and `/tmp/unit-ux-final-text-resize.png`. Desktop/phone first-task headings, narrow final task, mobile language support, recovery, and resized text were visually inspected. No theme, old app files or original classroom documents were changed. Classroom completion time remains an estimate until tested with learners.
