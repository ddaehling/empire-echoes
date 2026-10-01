# Evidence cards for the classroom enquiry

Revised 1 October 2026. This report records changes to `app/journey/js/rallye-resources.js`. The source hierarchy and English-unit rationale remain those established in the three user-confirmed PDFs and documented in `docs/unit-alignment/SOURCES.md`. Current card content and the preceding verification report were inspected before editing.

## What changed

All fifteen source IDs remain available. Eight essential cards support the six historical tasks; the other seven are optional background. The final comment reuses evidence from the historical tasks, so its two reference cards are optional. Opening an external page is never needed to obtain the essential evidence.

The visible card now distinguishes a source's identity and date, an authentic extract where one is available, a factual summary labelled “In our words · paraphrase”, and a brief `scope` statement. The new scope states what the source can establish and where its limits lie. The existing `context`, `locator`, `url` and `provenanceUrl` fields preserve details for the interface's source disclosure. The existing `optional` flag continues to identify further reading.

The former `questionCue` fields were removed. They repeated task instructions and sometimes supplied the intended interpretation. The revised summaries keep the evidence needed to investigate a question while leaving the learner to explain its significance. The interface owner confirmed the reduced card structure and automatic source metadata in exports; manual citation controls are unnecessary.

## Essential evidence and integrity

| Task and source ID | Evidence retained | Important distinction |
| --- | --- | --- |
| Company, `profit-company` | Bengal; 1757 change of ruler; 1765 tax rights; officials, soldiers and the use of revenue alongside military force | A modern museum explanation, not a taxpayer's account; the learner connects the facts to governing power. |
| Jamaica, `freedom-rebellion` | Cotton's 2 January 1832 public military order and authentic threat; resistance associated with Samuel Sharpe | The commander speaks, not the enslaved people resisting him. The original's racist language is noted in the source details. |
| Jamaica, `freedom-compensation` | The 1833 Act, compensation to owners, compulsory “apprenticeship” from 1834 and its end in 1838 | The 1807 ban on the trade did not end slavery. This is a modern historical account. |
| India, `rule-proclamation` | Victoria's 1858 promise of equal and impartial legal protection | The authentic promise is evidence of what the ruler announced, not proof of equal treatment. The surviving scan is a later printed reproduction. |
| Partition, `departure-partition` | The 1947 Punjab border map, Singh's letter of 1 June 1946 and Iqbal's aunt's later account of family displacement before partition | The letter and remembered displacement predate the 1947 border. The letter records concern for Sikh interests; it is not paraphrased as a claim about the writer's personal safety. |
| Windrush, `migration-windrush` | Ena Clare Sullivan's 1968 nationality record, her 1948 arrival and nursing/health work | The form records facts needed by officials, not her full emotional experience. The source-details note preserves the naming correction and avoids making work a condition of belonging. |
| Windrush, `migration-review` | Williams's findings about wrongful treatment of lawful residents and an affected person's authentic words | The quoted speaker is not Williams and is not Ena Sullivan. It does not represent every migrant's view. |
| Kenya, `memory-mau-mau` | Hague's 2013 statement; settlement for 5,228 claimants; authentic regret and denial-of-liability fragments | The two fragments are separate passages, not one continuous sentence. Liability is defined. This is an official position in 2013, not a survey of British opinion. |

All existing authentic extracts remain unchanged. They remain short and explicitly separated from editorial paraphrases. The optional Government of India Act extract also has an explicit original-wording label. No new quotation was introduced.

## Targeted source improvement for the Company task

The existing [National Army Museum object record](https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1) was re-read on 1 October 2026. It supports the battle, political bargain and tax rights but says little about the governing machinery. The learning author identified the resulting gap: a novice was being asked to connect tax revenue with governing without a concrete factual basis.

The same museum's [Battle of Plassey article](https://www.nam.ac.uk/explore/battle-plassey) was then checked. Its “Regime change” and “Imperial power” sections support the ruler change, tax rights, civil and military administration, policing, and later use of revenue with military force against European rivals. The article is now the primary link for the same `profit-company` card; the earlier object URL remains as `provenanceUrl`. The summary includes the necessary facts without asserting an unsupported precise financial allocation or adding a completed analytical response. The object context still distinguishes William Heath's approximately 1821 picture from the 1757 events and from the modern museum explanation.

This was a targeted content check. Other original-wording verification and access decisions remain those documented in `docs/unit-alignment/SOURCES.md`; this revision does not claim a new full link audit.

## Provenance and access retained

- Victoria: Tamil Digital Library, *His Majesty King George's Speeches in India*, Appendix E, PDF page 178 / printed xviii; British Library catalogue provenance remains available. The large scan is optional.
- Cotton: National Archives CO 137/181, Baptist War pack, PDF pages 6–7.
- Partition: website 3a, CO 1054/76 map; website 3b, CAB 127/106 letter; website 6, recorded memories. Website and downloaded-pack numbering must not be mixed.
- Sullivan: National Archives HO 334/1406/110478, Windrush pack, PDF pages 19–21; the form's name takes precedence over the transcript headings.
- Williams: accessible report pages 7–8, quotation on page 8; recommendation 6 on page 15 is optional background.
- Hague: the linked government statement contains both short extracts; the visible extract label identifies them as separate passages.

## Verification

The module parses as an ES module. A content check confirms fifteen unique IDs across the seven unchanged task IDs; eight essential and seven optional cards; valid source URLs; a nonempty scope for every card; explicitly labelled paraphrases and original extracts; and the absence of task-like `questionCue` fields or grading/completion requirements. The five authentic extracts match the frozen preceding version exactly. The frozen snapshot and old applications were not edited.
