# Readable sources in the assignments

Updated 1 October 2026, after the initial learning revision documented in SOURCES.md.

Students can read the evidence within the assignment without loading an external
archive, PDF viewer or book scan. Longer original extracts appear as selectable
HTML text with paragraphs, clear attribution and a brief transcription note.
Their plain-language explanation is available under “In our words”. The full
originals remain optional, explicitly labelled by format in the source details.

## Archival readings

| Source | Local reading and verification |
| --- | --- |
| Victoria’s proclamation, 1 November 1858 | Two complete consecutive paragraphs from printed page xviii / PDF page 178 of *His Majesty King George’s Speeches in India*, Appendix E. Checked visually against the [Tamil Digital Library scan](https://tamildigitallibrary.in/assets/docs/uploads/primary_files/book/TVA_BOK_0025134/TVA_BOK_0025134_speeches_in_India.pdf#page=178), then independently reviewed. Original wording, punctuation and capitalisation remain; enclosing quotation marks, line wrapping and a line-break hyphen were removed. The reproduction’s singular “Conviction” is retained. The separate British Library catalogue remains provenance, not a substitute for a transcription. |
| Cotton’s military order, 2 January 1832 | A selected passage from the [National Archives Baptist War pack](https://cdn.nationalarchives.gov.uk/documents/education/spotlight-on-baptist-war.pdf#page=6), scan page 6, transcript page 7, reference CO 137/181. Includes the denial of freedom, conditional pardon and threat. An internal omission is marked […]; the note identifies omitted framing. Checked against the scan, including its capital “King”. |
| Ena Clare Sullivan’s registration, 3 December 1968 | Selected name and employment entries from the [National Archives Windrush pack](https://cdn.nationalarchives.gov.uk/documents/education/empire-windrush-caribbean-migration.pdf#page=19), scan page 19, transcripts pages 20–21, reference HO 334/1406/110478. Checked against the handwritten form. Rows are presented as text; separators, date-range joining and omitted columns are explained. Staff-nurse abbreviations are explained. The form’s 1957–1961 Health Visitor dates take precedence over contradictory HTML/transcript framing. |

These historical original documents are public-domain archival material. Modern
editorial summaries remain labelled paraphrases. No longer modern copyrighted
extracts were introduced. Victoria’s historical vocabulary has optional definitions
in the task’s language help. The questions and saved-response format are unchanged.

## Access decisions

The old National Archives HTML transcript routes for Cotton and Sullivan appeared
in search results but returned HTTP 410 during live checks. They were not added to
the app. Both archive PDFs returned HTTP 200; students only need the local reading.
The 2020 Windrush review landing page offers PDFs rather than an equivalent complete
HTML text. Its existing local summary and brief attributed quotation are retained;
the link now clearly says “Publication page and full report (PDF)”. A later review
has not been substituted for the 2020 source.

The other records already provide local paraphrases and, where relevant, extracts.
The optional Government of India Act has its original opening clause locally;
its scan link is explicitly labelled PDF. HTML labels identify file format, not a
guarantee of accessibility or third-party availability.

## Regression checks

`npm run test:journey:sources` blocks external requests while reading all three
archival extracts. It checks visible paragraphs, mobile/tablet/desktop fit,
keyboard access to the paraphrase, saved-response recovery, explicit PDF labels,
and preservation of the text and transcription notes in JSON, TXT and HTML
downloads. Screenshots are written to `/tmp/empire-source-reading` for visual QA.
The existing learning and deployment suites cover the full task flow, original
snapshot integrity and static publication.
