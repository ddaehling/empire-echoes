# Rallye evidence and classroom review

Reviewed 1 October 2026. This is a source and desk-based pedagogy review of `app/journey/js/rallye-content.js`, `rallye-resources.js`, the source-card rendering in `rallye.js`, and `docs/JOURNEY_TEACHER_BACKGROUND.md`. It is not a report of a timed classroom trial.

## Result

The route supports a substantive 45-minute enquiry rather than a fact-retrieval quiz: six short explanations lead to a final, qualified argument about imperial history and plural present-day identities. All seven answers are typed. The teacher assesses reasoning; completion checks and word counts cannot assess the quality of the argument.

The chronological arc runs from the Company's 1600 charter through Bengal, Caribbean slavery and emancipation, India and Canada, partition, Windrush, Kenyan memory and Hong Kong's 1997 transfer. Commonwealth and census readings extend the final argument without adding required stops. This selection does not purport to represent every territory, community or experience.

The resource module contains **15 unique sources: 10 core and 5 optional**. Every requested source ID resolves. Each record identifies institution or author, historical date, source type, an explicitly labelled local paraphrase, its relevance to a particular question, and a limitation. Original quotations are separate from paraphrases. The three quotations contain 9, 12 and 12 words respectively, below 25 words per source. Sources remain citable through their local summaries when external reading is unavailable; this does not imply the app is an offline web cache.

## Evidence register

The live URLs are stored beside the readings in `app/journey/js/rallye-resources.js`; changing a URL there keeps the student card and notebook citation together.

| ID | Evidence and intended use | Necessary qualification |
| --- | --- | --- |
| `profit-company` | National Army Museum interpretation of Clive at Plassey; connects military bargaining with 1765 revenue rights. | The picture dates from about 1821 and the caption is a modern museum account; neither is a taxpayer's testimony. |
| `profit-charter` · optional | British Library IOR/A/1/2, contemporary copy of the 31 December 1600 charter. | A commercial charter did not place India under British territorial government. Catalogue access is free; manuscript access may be restricted. |
| `freedom-rebellion` | Cotton's 2 January 1832 military proclamation, CO 137/181, reproduced with transcript by The National Archives. | A threat intended to suppress the uprising exposes colonial power but does not voice the rebels' own explanations. The original includes racist language. |
| `freedom-compensation` | Parliament's public history of emancipation: owner compensation, apprenticeship and 1838. | An institutional history of legislation needs to be read alongside resistance; 1807, 1833/34 and 1838 are different changes. |
| `rule-proclamation` | Victoria's 1 November 1858 proclamation promises equal legal protection and religious non-interference. | The proclamation seeks allegiance; a promise is not evidence that it was fulfilled. The accessible scan is a later printed reproduction. |
| `rule-canada` | Parliamentary Archives presentation of the British North America Act, effective 1 July 1867. | Dominion institutions differ from Indian Crown government; neither constitutional label proves equal rights for all inhabitants. |
| `rule-government` · optional | Original Government of India Act 1858, sections I–III. | Establishes formal authority and the transfer from Company to Crown; it does not establish lived experience or independence. |
| `rule-rebellion` · optional | National Army Museum explanation of varied causes of the 1857 uprising. | A synthesis supports context, not a claim that all Indians had identical motives. |
| `departure-partition` | National Archives collection: 1947 Punjab map, Santokh Singh's letter and later oral testimony. | Constitutional boundaries, contemporary fears and remembered family experience are different forms of evidence. One family cannot stand for every community. |
| `migration-windrush` | Ena Clare Sullivan's nationality registration, HO 334/1406/110478, records a life connecting Jamaica and British health work. | A registration form selects information officials required. Its value is an individual life, not a survey of migrants' feelings. |
| `migration-review` | Wendy Williams's 2020 Windrush Lessons Learned Review; institutional injustice and historical understanding. | Lawful residence, citizenship, social acceptance and institutional treatment are different questions. The review is not an opinion poll of Britain. |
| `memory-mau-mau` | Hague's 6 June 2013 statement: acknowledged abuse, expressed regret, settlement for 5,228 claimants. | £19.9 million includes costs; legal liability continued to be denied. The statement does not establish all survivors' or present-day Britons' views. |
| `memory-hong-kong` | The 1984 Sino-British Joint Declaration specifies the 1 July 1997 transfer. | Negotiated commitments do not by themselves establish implementation, residents' views or an end to every overseas relationship. |
| `final-identities` · optional | ONS Census 2021 bulletin allows multiple self-described identities. | England and Wales only; identity labels are not attitudes to empire. A change in response order affects comparison with 2011. |
| `final-charter` · optional | Commonwealth Charter, signed in 2013, states voluntary association and shared values. | Aspirations and commitments are not proof of universal implementation or continued British control. |

## Verification and access

- The selected historical claims were checked against the linked documents or the responsible archive/museum's descriptions, rather than search-result snippets alone. The 1858 quotation was visually checked on printed page xviii, PDF page 178 of *His Majesty King George's Speeches in India*, Appendix E. The British Library catalogue independently identifies the dated proclamation. The scan is roughly 37 MB: the local quotation and summary are sufficient if it loads slowly.
- A final live HTTP check returned 200 for 13 of the 15 student URLs. Parliament's two pages returned 403 to a plain programmatic fetch, but their complete relevant passages were retrieved through the web reader on the same date. This is an access constraint, not evidence that those pages have disappeared. Test the school's browser/network before class; all cards provide equivalent local summaries.
- Legacy National Archives education URLs sometimes returned 410 or redirected to an archive endpoint that blocked retrieval. The slavery and Windrush cards therefore link directly to the Archives' available education PDFs, with page locators. The partition card uses the current `education/teaching-resources` page.
- The Windrush PDF's transcript headings incorrectly reuse another person's name. The actual form and relevant reading concern **Ena Clare Sullivan**; the card warns about the naming error and points to PDF pages 19–21. Its summary avoids unrelated errors in the pack's general introduction.
- The original sources contain some violent or racist language and descriptions of displacement. The local summaries support analysis without reproducing slurs or sensationalising suffering. Students are not asked to disclose personal or family experiences.

## Timing and word load

The advertised allocation is **33 minutes for six stops plus 12 minutes for the final assessment**. The six station targets are 45–65 words, and the final target is 140–200. Higher upper limits permit revision; they are not intended writing targets.

| Stage | Minutes | Minimum written words | Illustrative answer words | Core readings | Visible reading words* |
| --- | ---: | ---: | ---: | ---: | ---: |
| Trade and power | 5 | 40 | 63 | 1 | 283 |
| Freedom and memory | 6 | 45 | 62 | 2 | 383 |
| Rule and resistance | 6 | 45 | 62 | 2 | 382 |
| Independence and partition | 6 | 45 | 63 | 1 | 293 |
| Migration and belonging | 5 | 45 | 62 | 2 | 437 |
| Remembering empire | 5 | 45 | 58 | 2 | 428 |
| Final argument | 12 | 140 | 167 | 0 new required | 269 |
| **Total** | **45** | **405** | **537** | **10** | **2,475** |

\*Whitespace word count of each stage's context, research directions, prompt, writing instructions, and visible core-source text/metadata. It excludes controls, optional readings, rubric details and external full documents. Introductory directions add approximately 234 words; collapsible provenance adds 253. Counts describe this reviewed edition and may change with later copy edits.

A planning model at 180 words per minute for reading and 25 words per minute for composing 405–537 words uses approximately 31–37 minutes, leaving 8–14 minutes for navigation, evidence selection, thinking and checking. These are assumptions, not measured student speeds; source analysis is not ordinary reading. The migration and memory stops are particularly compressed. Students reading or composing more slowly will need support or additional time.

For the full 45-minute route, orient students to the app before starting, direct them to the short indicated passages, treat open-ended browsing as extension work, accept concise responses, and protect the final 12 minutes. The five optional sources and follow-up discussion are not required within the timed route. Language support, paired oral planning and a prepared short source pack can reduce access barriers without changing the historical question. A classroom pilot remains necessary to validate pacing for a particular class.

## Student tasks and teacher key

- All source IDs requested by the seven content stages exist; the proclamation and Canada cards are core, as their comparison is required. Hong Kong is also core. The optional Act and rebellion context appear after the two core readings.
- All six station rubrics total 5 marks; the final rubric totals 10. The overall **40 marks** match the teacher guide. Three stops require a notebook source; the final requires at least two sources and evidence from at least three stops. Merely saving a link cannot earn the substantive evidence marks.
- The teacher's model station answers are 58–63 words, within the advised ranges; the final example is 167 words. They illustrate warranted explanation and qualification. Students can take a different supported position and earn full marks.
- Historical distinctions are maintained across the prompt and key: the charter is not conquest; revenue rights are not uniform territorial control; abolition of trade differs from emancipation; 1858 is a transfer of government, not the Empress of India title; Canadian institutions do not imply universal equality; independence differs from the human experience of partition; imperial subjecthood differs from later legal categories and treatment.
- The final task asks for mechanisms linking evidence to later belonging or memory and requires a complication plus a specific source limitation. It does not infer a single British national psychology or explain Brexit through empire alone. English, Scottish, Welsh, Northern Irish, Irish and other identities are allowed to overlap and differ.
- Official and imperial records remain prominent in this short route. Their limitations are explicit, and the partition and migration readings offer personal experience. A longer course should add more colonised people's own accounts and contested contemporary interpretations; the route's limited selection should not be mistaken for a complete history.

No blocking historical contradiction or missing source reference was found in the reviewed student tasks and teacher key. The material is suitable for a guided, formative enquiry, with the pacing and access limitations above made explicit.
