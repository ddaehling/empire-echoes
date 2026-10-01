# Teacher guide revision — 1 October 2026

The current teacher guide now supports the classroom learning enquiry. It contains historical background, the exact student scenarios and tasks, possible responses, alternative interpretations, misconceptions for discussion, and optional support. It has no points, marks, rubrics, grading instructions, length expectations or word-based completion requirements.

## Current artifacts

- `app/journey/js/teacher-content.js`: teacher background and discussion examples; task context, prompt, operator, response purpose, instructions and discussion prompts derive from the current `rallye-content.js`.
- `app/journey/js/teacher.js` and `app/journey/css/teacher.css`: browser guide, standalone HTML, print and plain-text output. All former rubric rendering and scoring labels have been removed.
- `docs/JOURNEY_TEACHER_BACKGROUND.md`: regenerated from the same guide data.
- `app/journey/assets/teacher-handout.pdf`: regenerated from the standalone teacher HTML, 23 A4 pages with page numbering.

The internal `finalAssessment` property remains for compatibility; the visible section is “The final comment”. Examples live only in the teacher module. They are introduced as possible responses, not required conclusions or answers to reproduce. The language-analysis examples quote the authentic source wording. Feedback offers optional, specific next steps while students retain control of revising their work.

## Curriculum and evidence relationships

The three user-confirmed primary planning PDFs retain their hierarchy and named page references. The detailed plans and teacher handbook support functional historical knowledge, original-language analysis, discussion and revision. The material-research PDF supplies optional classroom-material connections and its own access caveat. The shorter plan and classroom readings remain supplementary. No publisher text has been substituted for an original source or shipped as a full classroom reading.

The source editor’s updated National Army Museum “Battle of Plassey” page is now the main Company evidence reference. The earlier collection object remains a separate contextual reference. Cotton’s proclamation, Victoria’s proclamation and its later reproduction, the distinct Singh/Iqbal-aunt evidence, Sullivan’s registration and the unnamed Williams-review witness, and Hague’s regret/liability distinction retain their provenance and limitations.

The lesson wrapper is still a flexible 60-minute plan containing the estimated 45-minute enquiry. The guide explicitly identifies this timing as a planning estimate, not a classroom trial. Support or additional time should respond to learners’ needs.

## Verification completed

- All seven student prompts, all fourteen scenario paragraphs, current task instructions and teacher unit/lesson/material/language guidance passed a 43-string parity check across standalone HTML, plain text and Markdown.
- Extracted final PDF text passes a 71-string check covering all seven current prompts, all scenarios, task instructions, examples, teaching notes, discussion prompts and unit guidance (normalising whitespace, page footers and typographic dashes for extraction).
- Browser-generated exports and extracted PDF text contain no rubrics, numerical scores, word counts, word limits, target lengths, grading instructions or grading disclaimers.
- The route still totals 45 minutes, and saving/downloading is described as preserving editable learning work.
- The actual browser print lifecycle was checked: the print document appears, global navigation and controls disappear, all seven prompts remain present, body text uses the intended 10pt size, and the prior disclosure state is restored after printing.
- The PDF was produced with Chromium’s A4 print workflow and rendered with Poppler at 95 dpi. Every page was visually inspected. A sparse page was removed by tightening heading spacing; misconceptions were explicitly labelled; the Kenya example was aligned with the quoted-language instruction. The final PNGs either match an inspected page byte for byte or were separately inspected after the final change. No clipped text, overflow, detached heading, broken glyph or footer defect remains.
- The accessibility reviewer independently checked the teacher page at 320, 390, 768 and 1440 pixels: no horizontal overflow, zero axe WCAG 2 A/AA or 2.1 AA violations with the guide both collapsed and expanded, working Enter activation of native disclosure controls, and a visible focus outline. The teacher content also reflows at 320 pixels / 200% zoom.

Scratch build/inspection evidence is in `/tmp/empire-learning-teacher/`, including the guide JSON, standalone HTML/TXT, PDF text, render generations and browser-print builder. The persistent Markdown and PDF are the classroom artifacts. The frozen snapshot, old apps and port 8777 were not changed by this work.

## Final publication refresh

The narrowed station chronology is reflected in the route: India 1857–1858 and Kenya 1950s–1963–2013. The teacher guide does not duplicate the source-card paraphrases, so the additional explanation of “Sikhs” remains in the prepared student evidence without creating a stale second copy here. All prompts and scenarios remain matched.

After this refresh, only PDF page 4 differs from the preceding approved rendering. It was visually re-inspected and is clean; the other 22 page images are byte-identical to the inspected rendering. The 43-string HTML/TXT/Markdown check, 71-string PDF check and browser print lifecycle checks pass again. Final PDF SHA-256: `717d46b5b8e9f1ed842cff72037d82794c5c2ff29e7e719a581ee6bf5187d5a8`.
