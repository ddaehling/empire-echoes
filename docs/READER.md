# Interactive classroom reader

The standalone reader is at `app/reader/`. It uses the same server-side OpenAI
vocabulary service as the British Empire journey. The existing Pages build
includes its HTML, CSS, JavaScript and JSON automatically.

## Reading content

Edit `app/reader/content.json` with the teacher's supplied text, preserving its
wording and paragraph boundaries:

```json
{
  "title": "The reading's title",
  "source": "Author or source credit, when supplied",
  "paragraphs": ["First paragraph.", "Second paragraph."]
}
```

An empty paragraph array intentionally displays a missing-text message. It is
not a completed lesson. Do not substitute invented reading material or publish
the empty reader as the requested text.

The current reading is **In defence of the British Empire**, extracted from the
user-supplied `British_Empire_Worksheet (1).docx`. Its 17 prose paragraphs and
seven numbered parts are preserved. The 49 superscript vocabulary markers are
omitted because each word now opens contextual help; years, statistics and
superscript ordinal suffixes remain intact. The document contained no glossary
definitions or separate assignment instructions. The original file stays local.

Optional `sectionStarts` entries (`index`, `label`) retain the worksheet's part
boundaries and generate navigation links. `sourceUrl` links the original
article; `sourceCitation` retains the worksheet's complete citation, including
its access date, separately from the shorter visible source credit.

## Vocabulary service

The endpoint is imported from `app/journey/js/word-help-config.js`; the API key
stays in Cloudflare Secrets Store. A selected word and at most 800 characters of
its reading context are sent for an explanation. No word-help request is made just by
loading the reader.

The configured allowance is **1,000 OpenAI attempts per UTC day, shared across
this reader and the British Empire journey**. It resets at midnight UTC.
Reservations are atomic and persisted by the server, including failed
attempts. Cached explanations do not use another attempt. There are no
automatic provider retries. See `services/word-help/README.md` for the service
contract and operations.

Saved vocabulary stays in the browser on that device and can be downloaded as
a text file. Browsers that block local storage can still use vocabulary help
and download the entries kept during the visit.

## Verification and publication

```sh
npm run test:reader
npm run test:word-help:service
npm run build
npm run test:deployment
```

The reader test intercepts the text and API with explicit fixtures; it neither
changes the actual reading nor spends API credits. Commit only the intended
reader changes. Pushing reader changes to `main` triggers the existing Pages workflow.

The publication path is
`https://ddaehling.github.io/empire-echoes/app/reader/`.
