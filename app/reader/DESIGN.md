# Classroom reader

Mode: Read. This extends the existing British Empire reading system with its local Source Serif and Source Sans fonts, warm paper, ink, admiralty blue and ruled sections. The passage is the main surface; word help stays beside it on desktop and in a dismissible, nonmodal bottom sheet on smaller screens.

Every eligible word is a real button. A single roving tab stop plus arrow navigation keeps long passages usable with a keyboard. Selecting a word requests an explanation for that occurrence in its immediate authored context; the explanation may cover a short expression containing the selected word. Responses are inserted as text. Saving vocabulary is local to this browser, with a plain-text download.

The source is `content.json` (`title` and `source` as strings, `paragraphs` as an array of strings). The supplied worksheet's 17 paragraphs and seven numbered parts are preserved through optional `sectionStarts` entries; simple part links support navigation through the long reading. Superscript vocabulary markers are removed in favour of direct word interaction, while actual years, quantities and ordinal suffixes remain unchanged. `sourceUrl` links the article and `sourceCitation` retains its original full credit. API credentials and the daily limit belong to the existing server-side word-help service.
