/* =============================================================================
   THE SECOND MAP — the transfer exercise. Owner: P17.

   Round 3's byline ended with the sentence "these three questions work on the
   1886 pink poster and on any textbook plate", and the student never did it
   once. An asserted transferable skill is not a transferable skill; the whole
   claim of this piece is that a student leaves able to read a map that is not
   ours, and the only way to show that is to make them do it on one that is not
   ours, in the same three questions, with their answer kept.

   THE OBJECT. "Imperial Federation — Map of the World Showing the Extent of the
   British Empire in 1886", issued as a colour supplement to The Graphic on
   24 July 1886, with a decorative border drawn by Walter Crane for the Imperial
   Federation League. It is the single most reproduced image of the British
   Empire and it is in most textbooks. Nothing is asserted about it here beyond
   what is on the sheet itself and what its own publication line says. There is
   no reproduction of the image in this app — it is not ours to serve — so the
   exercise is done from the description and from what the student has already
   seen of it in class or in the book beside them.

   HOW IT IS GRADED. It is not graded like a quiz. Each question has one answer
   that is right about this object and the other options are the errors a
   student actually makes; picking one prints why it is wrong ABOUT THIS SHEET,
   not a score. The last field is free text and has no right answer at all.

   ROUND 5 — WHAT THIS EXERCISE IS ALLOWED TO ASSUME THE STUDENT CAN SEE.
   Round 4's open question named the iconography of the border — "the chained
   figure at her feet" — and the app shows no reproduction, so a student had to
   take that on trust from the software criticising a map for asking to be taken
   on trust. Every question below is now answerable from three things and three
   things only: the sheet's own publication line, printed above it; the feedback
   the student has just read on the three multiple-choice questions; and what
   this atlas has on screen behind the plate. Nothing is asserted about marks on
   a sheet the student cannot open.
   ========================================================================== */

export const POSTER = {
  id: 'imperial-federation-1886',
  title: 'Imperial Federation — Map of the World Showing the Extent of the British Empire in 1886',
  published: 'Colour supplement to The Graphic, 24 July 1886. Decorative border by Walter Crane, for the Imperial Federation League.',
  why: 'It is the most reproduced picture of the British Empire there is, it was made to argue for something, and it is probably the map in your textbook.',
  /* This app serves no reproduction of the sheet and does not need one: every
     question below is answerable from the publication line, from the feedback,
     and from the atlas behind this panel. This line says so, so that a student
     who cannot picture it knows they are not missing a prerequisite. */
  seeing: 'There is no reproduction of the sheet in this app. You do not need one for these three: each is answerable from the publication line above and from the atlas behind this panel. If your textbook has it — most do, under that exact title — put it beside this and check yourself.',
};

/**
 * The same three questions the byline asks of this atlas, asked of that sheet.
 * `right` is the option that is true of the 1886 poster; `because` on the other
 * options is what a student learns by choosing it.
 */
export const POSTER_QUESTIONS = [
  {
    id: 'projection',
    q: 'What projection, and what does it stretch?',
    options: [
      {
        id: 'mercator',
        text: 'Mercator — and the sheet never says so',
        right: true,
        because: 'Right. It is Mercator, and the projection is named nowhere on the sheet. Canada, Greenland and the Antarctic edge are swollen; the tropics — where most of the people Britain ruled actually lived — are shrunk. An undeclared projection is the commonest way a map argues without saying it is arguing.',
      },
      {
        id: 'equal-area',
        text: 'An equal-area projection — shapes bent, areas true',
        because: 'No. On an equal-area projection Canada would be visibly smaller than Africa. On this sheet it is not, which is the fastest way to identify Mercator by eye.',
      },
      {
        id: 'unknowable',
        text: 'There is no way to tell from looking',
        because: 'There is: compare Greenland with Africa. Africa is about fourteen times Greenland on the ground. If they look comparable, you are looking at Mercator.',
      },
    ],
  },
  {
    id: 'colour',
    q: 'What is the colour measuring?',
    options: [
      {
        id: 'flat',
        text: 'One flat red for everything British, with no definition of "British" printed anywhere',
        right: true,
        because: 'Right. India ruled by a viceroy, a protectorate with a treaty and no garrison, a coaling station and a claim on paper are all the same red. The sheet never states the test it applied — which is the same question this atlas answers, out loud, in the line at the top left of the plate.',
      },
      {
        id: 'graded',
        text: 'Different reds for colonies, protectorates and spheres of influence',
        because: 'No. A graded key is exactly what the sheet has not got, and its absence is the argument: a single colour makes an empire of very different legal forms look like one thing under one government.',
      },
      {
        id: 'trade',
        text: 'Trade, weighted by value',
        because: 'No — and notice that a trade map would have shown a great deal of red in Argentina, Persia and the Chinese treaty ports, where Britain had no colour on this sheet at all.',
      },
    ],
  },
  {
    id: 'year',
    q: 'What year, and whose definition?',
    options: [
      {
        id: 'mixed',
        text: '1886 in the title — but the red holds places taken at wildly different dates, and places only claimed',
        right: true,
        because: 'Right. A single date on a map of an empire assembled over three centuries hides the assembling, which is the part with the causes in it. This atlas has a year control for that reason, and a definition switch because "claimed" and "administered" are different maps of the same year.',
      },
      {
        id: 'exact',
        text: '1886 exactly, everywhere, on one legal test',
        because: 'No. There is no legal test on the sheet, and there could not be one that fitted both Ontario and a protectorate declared the year before.',
      },
    ],
  },
];

/** The last field: no options, no right answer, and it is the one that matters. */
export const POSTER_OPEN = {
  id: 'open',
  q: 'The sheet is called Imperial Federation, and the league that paid for it wanted one. What is it asking its reader to do?',
  hint: 'You have three findings to build on, and you got each of them from the three questions above: it is Mercator and never says so; it is one flat red with no definition of “British” anywhere; and it prints one date over an empire assembled across three centuries. Each of those makes the empire look like a particular kind of thing. Say what kind, and what a reader who believed it would then be willing to vote for.',
};

/** What this atlas answers to the same three, for the side-by-side at the end. */
export const OURS = {
  projection: 'named in the line at the top left of the plate, and criticised there with figures recomputed from the units actually drawn',
  colour: 'stated as a sentence that changes when the layer changes, with the legal form of every colour spelled out in this panel',
  year: 'one exact year on the scrubber, and four different definitions of "British" on keys 1 to 4, each printing its own totals',
};

export default { POSTER, POSTER_QUESTIONS, POSTER_OPEN, OURS };
