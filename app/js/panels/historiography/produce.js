/* panels/historiography/produce.js — THE FOUR LINES THE STUDENT WRITES.
 *
 * THE CHARGE, in the historian's words, and it is the sharpest one left:
 * "Every one of the 43 primary texts arrives with nature / origin / purpose /
 * what-it-cannot-tell-you already written by the atlas. The student can
 * RECOGNISE source reasoning; they never PRODUCE any. Give them one text with
 * those four fields blank, take their sentences, then show the atlas's beside
 * them."
 *
 * ONE INSTANCE IS NOT PRACTICE. The lesson path already does this once, on
 * Lobengula's letter to Queen Victoria of 1889 (`tours.json`, the `scramble`
 * beat), and the recall quiz does it once unaided on Macaulay's Minute
 * (`quiz/items.js`). Both were built in an earlier round and both are good.
 * What neither can be is a habit: a move met twice, on two documents, is
 * still a move you have met. So this file is the third act, and it is
 * deliberately NOT a third rendering of Lobengula — two surfaces asking the
 * same four questions about the same document would be a repeat, and the
 * repeat is what the historian was complaining about.
 *
 * WHAT IS HERE THAT IS NOT THERE. Three things.
 *
 *   1. SIX DOCUMENTS OF SIX DIFFERENT KINDS, so the move is practised on
 *      genres that resist it differently: reported speech carried in another
 *      man's book (Sharpe, 1832/1853); an administrative despatch explaining a
 *      revenue figure (Hastings, 1772); sworn evidence to a committee of
 *      inquiry by the officer under investigation (Dyer, 1919); a speech in
 *      the official record of a parliament (Powell, 1959); private
 *      correspondence between officials of one government (Trevelyan, 1846);
 *      and a joke made in public by the man who had just signed the treaty
 *      (Salisbury, 1890). One of the four questions is genuinely hard on each,
 *      and it is a different one each time — `hardest` names it.
 *   2. WHAT A STRONG ANSWER NOTICES, AND WHAT A WEAK ONE SAYS INSTEAD. Showing
 *      a student the atlas's four lines beside their own tells them what a good
 *      answer looks like on THIS document. It does not tell them what to look
 *      for on the next one. Every field here carries `strong` and `weak`: the
 *      thing this document rewards noticing, and the plausible answer that
 *      stops one step early. That is the transferable half, and it is the half
 *      a comparison alone cannot give.
 *   3. IT STANDS WHERE AN ARGUMENT TURNS ON IT. Each exercise is keyed to one
 *      of this module's fourteen disputes, and is offered inside it, before the
 *      commitment: read the document, say what it is, then judge the historians
 *      who read it. `did-britain-care` was the one argument of the fourteen
 *      with no document in it at all; choosing an exercise for it found that,
 *      and Dyer's evidence to the Hunter Committee is now in its testimony list
 *      as well as in front of the student here — because what Britain did WITH
 *      that document in 1920 (the Commons debate, the Lords voting the other
 *      way, a public subscription for him) is the sharpest evidence either
 *      position has about whether Britain cared.
 *
 * NOTHING IS MARKED, AND NOTHING CAN BE. These are sentences, not options, and
 * no machine on this page can tell a good one from a bad one. The feedback is
 * the comparison, which is the only feedback a source exercise has ever really
 * had, plus the two lines saying what a strong answer notices — which is a
 * criterion the student applies to their own words, not a grade applied to them.
 *
 * WHY THE WORDS ARE PRINTED WITHOUT THE APPARATUS, ONCE. `renderSource()` is
 * the single function in this application permitted to print a quotation, and
 * it prints the four provenance answers above the words in DOM order. Here the
 * four answers ARE the exercise, so before the commitment the document is set
 * as its quotation, its speaker line and where to check it, and nothing else.
 * On the far side of the commitment `renderSource()` prints the whole record in
 * its own rectangle, four questions and all. The apparatus is withheld for one
 * screen, not abolished, and the last chapter is the canonical rendering.
 *
 * WHAT IS WRITTEN, AND WHERE. One row per document into the Close's Ledger,
 * `kind: 'attributed'` — the Ledger's own word for "answered what this source
 * was made for" — so the Close prints the student's own sentences back under
 * their own name. NOT into the dossier's `remember()`: that list renders every
 * kind it does not recognise against a right answer ("Not the class of purpose
 * a source of that kind has"), and there is no right answer here. Putting a
 * false verdict on a student's own sentences, in a panel this piece does not
 * own, is not a trade worth making for a second appearance.
 */
import { el } from '../../core/util.js';
import { TESTIMONY } from '../dossier/testimony.js';
import { renderSource } from '../dossier/source.js';

const TXT = new Map(TESTIMONY.map((t) => [t.id, t]));

/* Twenty characters a field, the same floor as a judgement's sentence
   (judgement.js MIN_CHARS) and the same as the lesson path's own source beat.
   The gate is "you have committed to a sentence", not "you have written
   enough". A student who types six words into each box has done the thing. */
export const MIN_FIELD = 20;

/* The four questions, in the order a historian takes them, and keyed exactly
   the way `renderSource()` keys them (source.js FIELDS) so the student's answer
   and the atlas's answer can never end up under different headings. The labels
   are the student-facing form of the same four; source.js prints them as
   statements ("What it is") because it is answering, and this file prints them
   as questions because it is asking. */
export const FIELDS = [
  {
    key: 'nature',
    label: 'What kind of thing is it?',
    short: 'what it is',
    hint: 'Not what it is about — what it IS. A letter, a law, a speech, sworn evidence, an account '
      + 'of somebody else’s words. Who is allowed to make one, and who is it addressed to?',
  },
  {
    key: 'origin',
    label: 'Who made it, when, and through whose hands?',
    short: 'who made it',
    hint: 'How long after the thing it describes? Who wrote it down, and who translated, edited, '
      + 'printed or published it before it reached you?',
  },
  {
    key: 'purpose',
    label: 'What was it made to do?',
    short: 'what it was for',
    hint: 'Every document is an act by somebody who wanted something. What was this one for, and '
      + 'who was meant to read it?',
  },
  {
    key: 'cannotTell',
    label: 'What can it not tell you?',
    short: 'what it cannot tell you',
    hint: 'Name a question you would like to answer that this document cannot reach — and say what '
      + 'you would have to read instead.',
  },
];

const FIELD_BY_KEY = new Map(FIELDS.map((f) => [f.key, f]));

/* ============================================================ THE FOUR TEXTS ==
 * `doc` is an id in the dossier's corpus, so the quotation, the speaker line,
 * the locator and the atlas's own four answers all come from the one place this
 * atlas keeps them. Nothing in this file re-states a document's provenance in
 * its own words; if testimony.js changes, this exercise changes with it.
 *
 * `dispute` is where the exercise stands. `why` says, on the panel, what the
 * document has to do with the argument it stands inside — because an exercise
 * dropped beside an argument for no stated reason is a worksheet.
 *
 * `strong` and `weak` are written about THIS document and this field. They are
 * printed only after the commitment, under the student's own sentence and the
 * atlas's, and they are the transferable half of the exercise.
 */
export const PRODUCTIONS = [
  {
    id: 'src-sharpe',
    doc: 'sharpe-gallows-1832',
    dispute: 'abolition-decline',
    kindWord: 'reported speech, in someone else’s book',
    madeTo: 'to persuade',
    contrastWith: 'trevelyan-1846',
    contrast: 'The document a few screens on from this one was written by the official who ran the '
      + 'Treasury’s Irish famine relief, and it was made to justify a limit. This one was printed to '
      + 'win an argument on the other side. Two documents can both have a case to make and still be '
      + 'nothing like each other; which is why “biased” is a useless word and “made to do what?” is not.',
    hardest: 'nature',
    title: 'Samuel Sharpe’s last words',
    why: 'Williams and Drescher argue about whether abolition followed the money. Neither of them '
      + 'is arguing about this sentence — but the rebellion Sharpe led is in the record between '
      + '1831 and 1833, and what you can prove from this one line decides how much weight it can '
      + 'carry in that argument.',
    lead: 'Samuel Sharpe led a rising of some 60,000 enslaved people in western Jamaica at Christmas '
      + '1831 and was hanged in Montego Bay on 23 May 1832. These are his words as far as anyone has '
      + 'them. Read the line under the quotation, and the line saying where to check it: between them '
      + 'they hold everything you need for the first two questions.',
    fields: {
      nature: {
        strong: 'That the document in front of you is not Sharpe’s statement. It is Bleby’s book. What '
          + 'you are reading is reported speech — one man’s record of another man’s words — set inside '
          + 'a printed argument. Nothing survives in Sharpe’s own hand.',
        weak: '“A primary source, because Sharpe was there.” Being present is not being the author, and '
          + 'that gap is what this document is for.',
      },
      origin: {
        strong: 'The gap and the chain. Twenty-one years between the speaking and the printing, one '
          + 'man’s memory carrying them across it, and a witness who was himself a party to the '
          + 'quarrel: Bleby was a Wesleyan missionary at a moment when planters were accusing the '
          + 'missionaries of having caused the rising.',
        weak: '“Written in Jamaica in 1832.” Nothing was written in 1832. The rising is 1831–32; the '
          + 'book is 1853.',
      },
      purpose: {
        strong: 'That Bleby had a case to win. He printed the sentence to answer the charge that the '
          + 'missionaries fomented the rebellion, and to argue that enslaved people, and not Parliament '
          + 'alone, ended slavery. The sentence is in the book because it makes that case.',
        weak: '“To record what Sharpe said.” Nobody publishes a book twenty-one years later merely to '
          + 'record. Ask what the book is arguing and the quotation’s position in it becomes visible.',
      },
      cannotTell: {
        strong: 'Two limits, not one. It cannot establish the words — there is no shorthand and no '
          + 'second witness. And one sentence from one leader is not evidence of what the 60,000 who '
          + 'rose believed. For that you would go to the trial records in the Jamaica Archives, and '
          + 'they record the prosecution’s questions rather than the rebels’ reasons.',
        weak: '“It is biased, so it is useless.” A document with a purpose is evidence of that purpose '
          + 'and of a great deal else. “Biased” is a way of stopping, not a finding.',
      },
    },
  },

  {
    id: 'src-hastings',
    doc: 'hastings-revenue-1772',
    dispute: 'was-1783-a-hinge',
    kindWord: 'an administrative despatch, explaining a figure',
    madeTo: 'to account for',
    contrastWith: 'salisbury-maps-1890',
    contrast: 'Compare the audience. Hastings is writing to a board that employs him and will never '
      + 'print what he says; Salisbury, in another of these exercises, is speaking to a public that '
      + 'will read him in tomorrow’s paper. Who a document is FOR is half of what it was made to do.',
    hardest: 'cannotTell',
    title: 'The revenue that did not fall',
    why: 'Harlow dates a new empire from 1783; Marshall says the decades that lost America won '
      + 'Bengal, and that the same state was doing the same thing at both ends of the world. This '
      + 'is the Bengal end of it, in the handwriting of the man doing it, eleven years before the '
      + 'date Harlow marks.',
    lead: 'A famine killed a large part of the population of Bengal in 1770 — the usual estimate is '
      + 'about a third, reconstructed from later revenue and settlement records rather than counted '
      + 'at the time. Two years later the governor explains to the board in London why the tax '
      + 'receipts had not fallen with it. Say what this document is before you say what it shows.',
    fields: {
      nature: {
        strong: 'That it is an accounting document. The sentence sits inside a revenue despatch: an '
          + 'employee explaining a figure to the shareholders’ board that pays him. The flatness of '
          + 'the language is the genre, and the genre is why the admission is in it at all.',
        weak: '“A letter, so it is personal.” It is a letter the way a company report is a letter.',
      },
      origin: {
        strong: 'Two years after the famine, from a governor two years into the office, to a Court of '
          + 'Directors in London who would read it months later — and who is describing a collection '
          + 'system he inherited rather than built.',
        weak: '“By Warren Hastings, in India, in 1772.” True, and empty: it says nothing about who he '
          + 'was writing to, how far away they were, or what they had asked him.',
      },
      purpose: {
        strong: 'To account for a number that looked good. The Directors wanted to know why the revenue '
          + 'had held up; Hastings tells them, names the violence that did it, puts a distance between '
          + 'himself and the men who applied it, and asks London for the powers to reform the system. '
          + 'The admission serves him.',
        weak: '“To describe the famine.” The famine is the background of the sentence. The subject of '
          + 'it is the revenue.',
      },
      cannotTell: {
        strong: 'The number that is not in it. Hastings gives no count of the dead, because nobody took '
          + 'one; every figure you have ever seen for 1770 is a reconstruction. Nor does the despatch '
          + 'name a collector — the revenue was farmed out, so “violently kept up” was done several '
          + 'removes from the man writing. For who did it you would need the district records, not the '
          + 'despatch.',
        weak: '“It proves a third of Bengal died.” It proves the tax did not fall. The death toll has to '
          + 'come from somewhere else, and it is an estimate wherever it comes from.',
      },
    },
  },

  /* ---------------------------------------------------- ROUND 5, ONE AND TWO
   * TWO DOCUMENTS MADE TO JUSTIFY. The rubric critic, on the round-4 set:
   * "the four-line source task fires once, on Lobengula. A second, on a source
   * whose purpose cuts the other way, would let the student see that the four
   * fields answer differently for a document written to justify rather than to
   * protest."
   *
   * That is a criticism of the SET, not of any exercise in it — so the answer
   * is a property of the set, checked by `auditProductions()`: every exercise
   * now declares `madeTo`, the act the document performs, and `contrastWith`,
   * a document in this atlas that performs the opposite act. The audit fails a
   * set that is all one kind of act, and fails a pairing that does not point at
   * a real document with a different `madeTo`. A student who meets six of these
   * cannot come away thinking every source is somebody complaining.
   *
   * Both of these stand inside the two arguments the lesson path already
   * mounts as gates (`pathGate.after` = `compensation` and `egypt`), so a path
   * that wants a second four-liner does not need a new beat: CONTRACT.md §9.1.
   */
  {
    id: 'src-trevelyan',
    doc: 'trevelyan-1846',
    dispute: 'irish-famine-intent',
    kindWord: 'private correspondence between officials of one government',
    madeTo: 'to justify',
    contrastWith: 'sharpe-gallows-1832',
    contrast: 'The other document in this set from the same half-century was spoken by a man about to '
      + 'be hanged for leading a rising. Sharpe’s words were made to protest; this sentence was made '
      + 'to justify. The four questions do not change. Watch how far apart the four answers land.',
    pathBeat: { after: 'compensation', spine: 'T16' },
    hardest: 'nature',
    title: 'The greater evil',
    why: 'Mitchel says the blight was natural and the famine was made. Kinealy says relief was '
      + 'withdrawn by decision while the dying went on. Ó Gráda says the failure was of doctrine and '
      + 'will rather than of purpose. All three read this man’s papers, and this is the sentence of '
      + 'his that is quoted most often, usually as though it settled the argument by itself. What '
      + 'you can prove from it decides how much weight it can carry.',
    lead: 'About a million people died in Ireland between 1845 and 1852, and about a million more '
      + 'emigrated, while food went on leaving Irish ports. The official who controlled the '
      + 'Treasury’s relief spending wrote this in the second year of it.',
    fields: {
      nature: {
        strong: 'That the sentence is not a policy. It is one official writing inside the machine — '
          + 'not a statute, not a minute of a decision, not a speech in the House. That is what makes '
          + 'it evidence of what the man in charge believed rather than evidence of what the '
          + 'government resolved, and it is also why it is so quotable: nobody had to weigh it in '
          + 'public.',
        weak: '“A government document, so it is what the government thought.” One official is not a '
          + 'cabinet and a letter is not a decision. Find the decision somewhere else and this becomes '
          + 'evidence about it; treat it as the decision and you have skipped a step.',
      },
      origin: {
        strong: 'The year, and the office. 1846 is the second failure of the crop and the worst, so '
          + 'this is written while the deaths are rising rather than afterwards in defence. And the '
          + 'writer is not a minister: he is the permanent official who spends the money, which is why '
          + 'what you are reading sits in his own papers at the Bodleian and not in a Cabinet series.',
        weak: '“By Charles Trevelyan during the famine.” The famine ran seven years and the policy '
          + 'changed inside it — the soup kitchens opened and closed in 1847 alone. Which year this '
          + 'is written in is most of its force.',
      },
      purpose: {
        strong: 'What the sentence is FOR, which is not what it is about. It is not describing '
          + 'Ireland; it is arguing for a limit, and the limit is the policy he is applying. A '
          + 'document made to justify tells you most about the thing it is defending — and this one '
          + 'is defending a course of action that was being taken while people starved.',
        weak: '“To express his opinion of the Irish.” The contempt is real and it is not the point. '
          + 'The sentence has a job: it makes withholding relief look like principle rather than '
          + 'economy.',
      },
      cannotTell: {
        strong: 'Whether the policy followed the belief or the belief was found for the policy — and '
          + 'what the relief actually did. It gives no count of the dead and no measure of what was '
          + 'fed. For that you go to the Relief Commission and Poor Law files month by month, which '
          + 'is exactly what Christine Kinealy did, and it is why her reading of the same years is '
          + 'the sharpest thing said against Ó Gráda.',
        weak: '“It proves the British deliberately starved Ireland.” It proves what one powerful '
          + 'official wrote. Intent in the legal sense is a much higher bar, and this sentence is '
          + 'where that argument starts, not where it ends.',
      },
    },
  },

  {
    id: 'src-salisbury',
    doc: 'salisbury-maps-1890',
    dispute: 'the-scramble',
    kindWord: 'a joke, made in public by the man who had just signed the treaty',
    madeTo: 'to justify',
    contrastWith: 'lobengula-victoria-1889',
    contrast: 'The lesson path asks you these same four questions about Lobengula’s letter to Queen '
      + 'Victoria, written in 1889 to say that he had been deceived about what he had put his mark '
      + 'to. That letter and this sentence are about the same partition of Africa, a year apart, '
      + 'from its two ends: one made to protest, one made to justify. Nothing about the questions '
      + 'changes. Everything about the answers does.',
    pathBeat: { after: 'egypt', spine: 'T13' },
    hardest: 'purpose',
    title: 'Lines upon maps',
    why: 'Hobson says surplus capital drove the partition. Robinson and Gallagher say strategy and '
      + 'the Egyptian crisis did. Boahen says both are describing an argument Europeans had with '
      + 'each other, and that what happened on the ground was settled in part by African armies. '
      + 'Here is the man who signed one of the treaties, describing in public what he had just done '
      + '— and whether this is evidence for any of the three depends entirely on what you decide it '
      + 'is.',
    lead: 'In 1890 Britain and Germany exchanged claims across East Africa and fixed borders through '
      + 'country neither had surveyed. Shortly afterwards the Prime Minister described the exercise '
      + 'in these words. They are almost always quoted as a confession.',
    fields: {
      nature: {
        strong: 'That it is a performance and not a record. A man speaking in public, to an audience '
          + 'he needs, about a thing he has just done — a different kind of document from a despatch '
          + 'or a minute, even when the same man writes both. And what reaches you is a newspaper’s '
          + 'report of what was said, not a transcript he corrected.',
        weak: '“A primary source from the Prime Minister, so it is reliable.” Reliable about what? It '
          + 'is excellent evidence of what he was willing to say out loud, which is not the same as '
          + 'evidence about the treaty.',
      },
      origin: {
        strong: 'The date does the work: this comes AFTER the agreement, not before it. Nothing here '
          + 'is a decision being taken; it is a decision being explained to people who might not like '
          + 'the price. And it reaches you through a newspaper, and then through historians quoting '
          + 'the newspaper, which is a chain worth stating.',
        weak: '“Lord Salisbury, 1890.” True, and it misses the only thing about the date that matters '
          + '— that the lines were already drawn when he said it.',
      },
      purpose: {
        strong: 'That the modesty is a tactic. Admitting ignorance in a joke is the cheapest answer '
          + 'to a charge of negligence: it makes not knowing sound like candour, and it makes the '
          + 'critic look humourless. The sentence is a defence of the agreement, and it works by '
          + 'conceding the smaller fault so that the larger one is not put.',
        weak: '“He was being honest about how little they knew.” He was — that is why the sentence '
          + 'has lasted. But honesty offered by the man under criticism, about the least damaging of '
          + 'the charges against him, is still a move in an argument.',
      },
      cannotTell: {
        strong: 'Anything from the other side of the line, and whether the ignorance was real. It '
          + 'cannot tell you what those borders did to the people they cut through; and a man making '
          + 'a joke about not knowing where the mountains were is not under oath, so how complete the '
          + 'ignorance was cannot be tested from the joke. For the effect you need the boundary '
          + 'commissions, and the people who lived across the lines.',
        weak: '“It proves the borders were drawn arbitrarily.” It proves that one signatory said so, '
          + 'in a sentence built to be repeated. Arbitrary at the desk is not the same as arbitrary '
          + 'on the ground: those lines were made real afterwards, by treaties and by force, over '
          + 'twenty years — which is the misconception this document is most often used to feed.',
      },
    },
  },

  {
    id: 'src-dyer',
    doc: 'dyer-hunter-1920',
    dispute: 'did-britain-care',
    kindWord: 'sworn evidence to an official inquiry',
    madeTo: 'to defend',
    contrastWith: 'powell-hola-1959',
    contrast: 'The other document from an official record in this set is Powell on Hola, forty years '
      + 'later: a man attacking his own government over deaths in a camp. Dyer is defending an order '
      + 'he gave. Both are inside the state’s own paper. The paper does not tell you which is which '
      + '— the purpose does.',
    hardest: 'purpose',
    title: 'Dyer explains himself',
    why: 'Porter says empire was the business of a small governing class and that most Britons '
      + 'neither knew nor cared. MacKenzie, Hall and Rose say it ran through the schoolbooks, the '
      + 'shops and the family. This document is the test: when the Hunter report was published, the '
      + 'Commons debated Dyer in July 1920, the Lords voted the other way, and a public subscription '
      + 'in Britain raised a large sum for him. Whatever that was, it was not indifference.',
    lead: 'Seven months after troops under his command fired for about ten minutes into a crowd penned '
      + 'in an enclosure at Jallianwala Bagh in Amritsar, the officer who ordered it answered questions '
      + 'under examination. This is one of his answers, printed by the government that appointed the '
      + 'committee.',
    fields: {
      nature: {
        strong: 'Two hands, in effect. The words are Dyer’s; the document is the state’s — evidence '
          + 'taken under examination and printed inside an official report. What reaches you has been '
          + 'through a committee’s questions and a government printer.',
        weak: '“A report on the massacre.” The report is the container. The evidence is what he said '
          + 'inside it, and the two are not the same source.',
      },
      origin: {
        strong: 'Lahore, November 1919, before a committee of five British and three Indian members. '
          + 'He is answering questions, so the shape of what he says is partly the shape of what he '
          + 'was asked — which is why the evidence volumes are worth more than the extract.',
        weak: '“Dyer wrote it at Amritsar in 1919.” He did not write it, and he was not at Amritsar '
          + 'when he said it.',
      },
      purpose: {
        strong: 'To defend himself — and the whole force of the document is in HOW. He does not deny '
          + 'the intention. He explains the firing as deliberate deterrence aimed at a whole province, '
          + 'because in November 1919 he expected that to be accepted as a defence. A document made to '
          + 'justify can be the most damaging kind there is.',
        weak: '“To explain what happened”, or “to apologise”. He was not describing and he was not '
          + 'sorry. He was making a case, and the case is the evidence.',
      },
      cannotTell: {
        strong: 'The toll, and the crowd. The committee’s count of 379 dead was compiled from lists '
          + 'made afterwards; the Indian National Congress’s own inquiry put it far higher, and nobody '
          + 'was counting at the time. And nobody who was in the enclosure speaks here — for why they '
          + 'had come you need the Congress inquiry’s volumes of testimony.',
        weak: '“379 people died — it says so.” It does not say so. The committee said so, from lists '
          + 'made after the fact, and the number is disputed.',
      },
    },
  },

  {
    id: 'src-powell',
    doc: 'powell-hola-1959',
    dispute: 'kenya-scale',
    kindWord: 'a speech, in a parliament’s official record',
    madeTo: 'to accuse',
    contrastWith: 'dyer-hunter-1920',
    contrast: 'Set this beside Dyer’s evidence to the Hunter Committee, which is also printed by the '
      + 'British state and is also a man explaining a killing. One document was made to defend the '
      + 'man who ordered it; this one was made to accuse the government that allowed it. The four '
      + 'questions are the same and every answer differs.',
    hardest: 'origin',
    title: 'Hola, in the House of Commons',
    why: 'Elkins, Anderson and Blacker disagree about how many people British rule killed in Kenya. '
      + 'This document is not evidence about that number at all, and seeing exactly what it IS '
      + 'evidence about is the thing that keeps the argument on the next page honest.',
    lead: 'Eleven detainees were beaten to death at Hola camp in Kenya in March 1959, and the official '
      + 'account — that they had died from drinking contaminated water — collapsed. At the end of an '
      + 'all-night debate that July, a backbencher on the government’s own side rose and said this.',
    fields: {
      nature: {
        strong: 'A verbatim report of a speech, produced by the institution being addressed. Hansard '
          + 'records what was said in that chamber. It is not a record of anything that happened in '
          + 'Kenya, and that distinction is the whole exercise.',
        weak: '“A speech, so it is only his opinion.” A speech in the Commons is an act with '
          + 'consequences, and the record of it is an official one.',
      },
      origin: {
        strong: 'The hour and the target. The small hours, at the end of an all-night debate, four '
          + 'months after the deaths and after the official explanation had failed — and by a member '
          + 'of the governing party attacking his own front bench, which is what made the speech '
          + 'expensive for the man giving it.',
        weak: '“By Enoch Powell in 1959.” The date without the circumstances explains nothing, least '
          + 'of all why the sentence is built as a rule rather than as a description.',
      },
      purpose: {
        strong: 'To force responsibility onto the people in the room, and to refuse the defence that a '
          + 'different standard applied in a colony. That is why the sentence is a principle and not an '
          + 'account of Hola: he is arguing about what Britain may not do anywhere.',
        weak: '“To condemn the empire.” He was not against the empire. He was arguing that it had to be '
          + 'run to one standard everywhere — a different claim, and a more awkward one.',
      },
      cannotTell: {
        strong: 'What happened at Hola, or the scale of the emergency. Powell is arguing about '
          + 'responsibility in London. For the camps you need the court records Anderson read, the '
          + 'survivors Elkins interviewed, the censuses Blacker worked from — and the files the '
          + 'Foreign Office admitted holding at Hanslope Park only in 2011.',
        weak: '“It proves the British public was outraged.” It proves that one member said this in a '
          + 'thin chamber in the middle of the night. Whether anyone outside it noticed is the argument '
          + 'this exercise is standing next to.',
      },
    },
  },
];

const BY_ID = new Map(PRODUCTIONS.map((p) => [p.id, p]));
const BY_DISPUTE = new Map(PRODUCTIONS.map((p) => [p.dispute, p]));
const BY_DOC = new Map(PRODUCTIONS.map((p) => [p.doc, p]));

export function productionById(id) { return BY_ID.get(String(id || '')) || null; }
export function productionFor(disputeId) { return BY_DISPUTE.get(String(disputeId || '')) || null; }
export function productionForDoc(docId) { return BY_DOC.get(String(docId || '')) || null; }
export function productionCount() { return PRODUCTIONS.length; }
export function docOf(ex) { return ex ? TXT.get(ex.doc) || null : null; }

/* THE EXERCISE NOMINATED FOR A NAMED BEAT OF THE LESSON PATH, or null — the
 * same API as `gateFor(beatId)` in disputes.js, and for the same reason: the
 * path asks at every beat and mounts when the answer is not null, and WHICH
 * document a beat gets is decided here rather than by the caller.
 *
 * It also closes a real hole. `index.js _mountSource` accepted `beatId` and
 * passed it to `productionFor()`, which keys by ARGUMENT id — so a caller that
 * asked for the exercise belonging to the beat `egypt` got no match, fell
 * through the chain and was handed the first exercise in the file. A silently
 * wrong document is worse than a null.
 */
const BY_BEAT = new Map(PRODUCTIONS.filter((p) => p.pathBeat && p.pathBeat.after)
  .map((p) => [p.pathBeat.after, p]));
export function productionForBeat(beatId) { return BY_BEAT.get(String(beatId || '')) || null; }
export function pathSources() { return PRODUCTIONS.filter((p) => p.pathBeat); }

/* WHAT IT COSTS THE LESSON, COMPUTED RATHER THAN ASSERTED, in the lesson
 * path's own cost model (tours.json `$note`): reading time at 180 words a
 * minute over this exercise's own rendered prose, plus what the beat asks the
 * student to DO — four sentences, at the 45 seconds a `predict` beat is
 * costed. A path with a minute budget can read this before it mounts anything.
 */
const WRITE_S = 45;
export function costOf(ex) {
  if (!ex) return null;
  const t = docOf(ex);
  const parts = [ex.why, ex.lead, ex.contrast, t && t.quote, t && t.speaker, t && t.check];
  for (const f of FIELDS) parts.push(f.label, f.hint);
  const words = parts.filter(Boolean).join(' ').trim().split(/\s+/).length;
  return { words, readS: Math.round((words / 180) * 60), doS: WRITE_S * FIELDS.length,
    costS: Math.round((words / 180) * 60) + WRITE_S * FIELDS.length };
}

/* ------------------------------------------------------------ what was said --
 * Session memory, plus whatever can be read back out of the Ledger, which
 * survives a reload. Nothing here writes to storage: the row goes onto the bus
 * as `ledger:append` and P21 owns the schema and the key.
 */
const wrote = new Map();   /* exId -> { fields:{…}, at, declined, restored } */

/* HALF-TYPED SENTENCES LIVE HERE, and not in the caller's state object.
 * The band re-pages on a rotation and on a resize of whatever surface this is
 * standing in, and a repaint rebuilds the textareas. Keeping the text in this
 * module means a student who rotates a phone mid-sentence gets the sentence
 * back, wherever the exercise is mounted and whoever owns the surface. */
const typing = new Map();  /* exId -> { nature, origin, purpose, cannotTell } */

export function typingFor(exId) { return typing.get(String(exId || '')) || {}; }
export function noteTyping(exId, field, value) {
  const id = String(exId || '');
  if (!BY_ID.has(id) || !FIELD_BY_KEY.has(field)) return null;
  const cur = typing.get(id) || {};
  cur[field] = String(value == null ? '' : value);
  typing.set(id, cur);
  return cur;
}

export function linesFor(exId) { return wrote.get(String(exId || '')) || null; }
export function writtenCount() { return [...wrote.values()].filter((v) => !v.declined).length; }
export function resetLines() { wrote.clear(); typing.clear(); }

export function ledgerKey(ex) { return 'hgx:src:' + ex.id; }

/* The exact join written into the Ledger's `youSaid` and read back out of it,
   and the label each part carries. One place, so the two halves cannot drift.
   `youSaid` is capped at 400 characters by the Ledger's own schema, so a long
   fourth answer can be cut there; the full text stays in this session's memory
   and is what the panel prints. The Close prints what the Ledger holds, and
   that is the student's own words either way. */
const PART_JOIN = ' · ';

function packLines(fields) {
  return FIELDS
    .map((f) => (fields[f.key] ? f.short + ': ' + fields[f.key] : null))
    .filter(Boolean).join(PART_JOIN);
}

function unpackLines(said) {
  const out = {};
  let any = false;
  for (const part of String(said || '').split(PART_JOIN)) {
    for (const f of FIELDS) {
      if (part.indexOf(f.short + ': ') === 0) { out[f.key] = part.slice(f.short.length + 2).trim(); any = true; }
    }
  }
  return any ? out : null;
}

/**
 * BRING BACK WHAT THIS STUDENT ALREADY WROTE, from the Ledger, on mount.
 * Same discipline as judgement.js `rehydrate`: read our own rows only, and say
 * on the panel that the words came from an earlier visit rather than showing a
 * reader sentences they do not remember writing.
 */
export function rehydrateLines(ledger) {
  if (!ledger || typeof ledger.all !== 'function') return 0;
  let n = 0;
  for (const e of ledger.all()) {
    if (!e || (e.kind !== 'attributed' && e.kind !== 'declined')) continue;
    const id = String(e.claimId || '');
    if (!id.startsWith('hgx:src:')) continue;
    const exId = id.slice('hgx:src:'.length);
    if (!BY_ID.has(exId) || wrote.has(exId)) continue;
    if (e.kind === 'declined') {
      wrote.set(exId, { fields: {}, at: Number(e.at) || Date.now(), declined: true, restored: true });
      n += 1;
      continue;
    }
    const fields = unpackLines(e.youSaid);
    if (!fields) continue;
    wrote.set(exId, { fields, at: Number(e.at) || Date.now(), declined: false, restored: true });
    n += 1;
  }
  return n;
}

/**
 * Record the four lines. Returns the stored entry, or null if the four are not
 * all written — the same shape as judgement.js `commit`, so the two commitments
 * in this module behave identically to a caller.
 */
export function commitLines(ex, fields, ctx, opts = {}) {
  if (!ex) return null;
  const declined = !!opts.declined;
  const src = fields || typingFor(ex.id);
  const clean = {};
  for (const f of FIELDS) clean[f.key] = String((src && src[f.key]) || '').trim();
  if (!declined && FIELDS.some((f) => clean[f.key].length < MIN_FIELD)) return null;
  if (wrote.has(ex.id)) return wrote.get(ex.id);
  const entry = { fields: declined ? {} : clean, at: Date.now(), declined };
  wrote.set(ex.id, entry);

  const t = docOf(ex);
  if (ctx && ctx.bus) {
    ctx.bus.emit('ledger:append', {
      /* `attributed` is the Ledger's own word for "answered what this source
         was made for", which is one of these four questions and the hardest of
         them. `declined` is its word for being offered something and saying no,
         by name. Neither is a new kind: close/ledger.js is another piece's file
         and its enumeration already holds the right words. */
      kind: declined ? 'declined' : 'attributed',
      claimId: ledgerKey(ex),
      prompt: 'What it is, who made it, what for, and what it cannot tell you — '
        + (t ? (t.work || ex.title) + (t.year ? ', ' + t.year : '') : ex.title),
      youSaid: declined
        ? 'I read this atlas’s four lines without writing my own'
        : packLines(clean),
      year: t && t.year ? Number(t.year) : null,
      at: entry.at,
    });
    ctx.bus.emit('hgx:wrote', {
      exId: ex.id, doc: ex.doc, dispute: ex.dispute, declined,
      fields: entry.fields, at: entry.at, ledgerKey: ledgerKey(ex),
    });
  }
  return entry;
}

/* ================================================================ RENDERING ==
 * Chapters, not one block. The module's own band (render.js `bandFor`) chapters
 * an argument when the reading window is short or the argument long, and this
 * exercise is measured by the same rule as everything else in it: the document
 * is one chapter, the four boxes are one chapter, and after the commitment each
 * of the four comparisons is a chapter of its own — one field per screen, which
 * is the same idiom as one historian per screen.
 */

function eyebrow(text) { return el('span.hgx__eyebrow.sc', { text }); }

/* WHY THIS DOCUMENT IS IN FRONT OF YOU — its own screen, and the reason is
 * measured. In the rail at 390x844 the reading window is 170px and this
 * chapter, which carried the argument it stands in, the quotation, the
 * attribution, the locator, the lead and the note about the missing
 * apparatus, was 731px: 4.3 screenfuls, against 1.9 for each of the four
 * questions after it. The rest of this module's rule is one thing to read per
 * screen, and this was six. The split is along the only seam that matters —
 * why you are being asked, and then the words themselves. Tallest chapter
 * after it: 411px. Where the band is off the two print as one column and a
 * laptop reader sees no change. */
function whyBlock(ex, opts = {}) {
  const box = el('section.cx-panel.cx-panel--plain.hgx-src__doc.hgx-src__doc--why');
  /* NOT WHEN THE SURFACE ALREADY SAYS IT. Opened in the rail the sheet's own
     head prints this exact eyebrow, so the first chapter was repeating it —
     30px of a 170px reading window spent saying a thing already on screen
     two lines above. Measured, not guessed: see the round-5 note in index.js. */
  if (!opts.sheet) box.append(eyebrow('you write the four lines first'));
  box.append(el('p.hgx-src__why', { text: ex.why }));
  /* SAY THAT THE APPARATUS IS MISSING, AND WHY.
   * FEATURE_SPEC §2 P16 test 1 is "no rendered quotation anywhere in this app
   * that did not go through renderSource()", and this exercise is the one
   * place that is deliberately not true — because renderSource() prints the
   * four answers, and the four answers are the exercise. A silent exception
   * would be indistinguishable from the defect the test exists to catch. So
   * the panel declares it, in front of the student, where it also does some
   * teaching: the shape they are about to fill in is the shape every other
   * document in this atlas already carries. The canonical rendering follows on
   * the far side of the commitment, in the last chapter. */
  box.append(el('p.cx-note.cx-note--warn.hgx-src__missing', {
    text: 'Every other document in this atlas is printed with four labelled answers above the words '
      + '— what it is, who made it, what it was made for, what it cannot tell you. They are missing '
      + 'here on purpose. You write them; then this atlas prints its own in the usual shape, in full, '
      + 'a few screens from now.',
  }));
  return box;
}

/** The document, and ONLY the document. The four provenance answers are what
 *  is being asked for, so they are not on this screen at any level. */
function docBlock(ex, t) {
  const box = el('section.cx-panel.cx-panel--plain.hgx-src__doc');
  const q = el('blockquote.hgx-src__quote');
  q.append(el('p', { text: '“' + t.quote + '”' }));
  box.append(q);
  box.append(el('p.hgx-src__cite', { text: t.speaker || [t.author, t.year].filter(Boolean).join(', ') }));
  if (t.check) {
    box.append(el('p.cx-note.hgx-src__check', {},
      el('span.sc.hgx-k', { text: 'where to check it' }),
      document.createTextNode(t.check)));
  }
  box.append(el('p.hgx-src__lead', { text: ex.lead }));
  return box;
}

/* ONE QUESTION PER SCREEN, and the reason is measured.
 *
 * The four boxes were one chapter. Measured in the rail at 390x844, with the
 * sheet body at 198px, that chapter was 914px — 4.6 screenfuls of form, with
 * the opening sentence alone filling the window before a single box. The
 * module's answer to that everywhere else is one thing per screen: one
 * historian, one document, one field of the comparison. A question with its
 * hint and its box is one thing. So each of the four is its own chapter, ~250px
 * against a 198px window, and the commitment is the fifth — which is also where
 * the argument's own commitment sits, on a screen of its own after the reading.
 *
 * Where the band is off nothing is hidden and the five print as one column, so
 * a laptop reader sees the form they have always seen.
 */
function fieldBlock(ex, f, n) {
  const said = typingFor(ex.id);
  const id = 'hgx-src-' + ex.id + '-' + f.key;
  const box = el('form.cx-ask.hgx-src__form', {
    dataset: { hgxsrc: ex.id, field: f.key },
    onsubmit: (ev) => ev.preventDefault(),
  });
  box.append(el('span.cx-ask__eyebrow', { text: 'question ' + n + ' of ' + FIELDS.length + ', in your own words' }));
  const field = el('div.hgx-src__field');
  field.append(el('label.hgx-src__flab', { for: id, text: f.label }));
  field.append(el('p.cx-note.hgx-src__fhint', { id: id + '-h', text: f.hint }));
  const ta = el('textarea.hgx-src__in', {
    id, rows: '3', spellcheck: 'true',
    dataset: { hgx: 'srcfield', ex: ex.id, field: f.key },
    'aria-describedby': id + '-h',
    placeholder: 'In your own words…',
  });
  ta.value = said[f.key] || '';
  field.append(ta);
  box.append(field);
  box.append(el('p.cx-note.hgx-src__count', { dataset: { ex: ex.id }, text: countLine(ex) }));
  return box;
}

function countLine(ex) {
  const said = typingFor(ex.id);
  const done = FIELDS.filter((f) => String(said[f.key] || '').trim().length >= MIN_FIELD).length;
  return done >= FIELDS.length
    ? 'All four written. Ours are one press away, and they are not a mark scheme.'
    : done + ' of ' + FIELDS.length + ' written. Nothing here is scored; a sentence each is enough.';
}

/** The commitment. Nothing downstream of it is in the document until it is
 *  pressed — the atlas's four answers are not rendered, not hidden. */
function commitBlock(ex) {
  const said = typingFor(ex.id);
  const done = FIELDS.filter((f) => String(said[f.key] || '').trim().length >= MIN_FIELD).length;
  const box = el('form.cx-ask.hgx-src__form.hgx-src__form--go', {
    dataset: { hgxsrc: ex.id, field: 'commit' },
    onsubmit: (ev) => ev.preventDefault(),
  });
  box.append(el('span.cx-ask__eyebrow', { text: 'and then ours' }));
  box.append(el('p.cx-ask__q.hgx-src__ask', {
    text: 'These are the four questions this atlas answers about every document it prints. When '
      + 'yours are written, ours are printed beside them — with the thing a strong answer notices on '
      + 'each, which is the part you can take to the next document.',
  }));
  box.append(el('p.cx-note.hgx-src__count', { dataset: { ex: ex.id }, text: countLine(ex) }));
  /* NOT `.hgx-ask__go`. It looks like the argument's own commitment and it is
     styled like it, but sharing the class made `document.querySelector(
     '.hgx-ask__go')` — which this module's own acceptance scenario used, and
     which any caller might — return this button instead of the judgement's,
     on the four arguments that carry an exercise. Two commitments on one
     surface need two names. */
  const go = el('button.hgx-src__go', {
    type: 'button', dataset: { hgx: 'srccommit', ex: ex.id },
  }, el('span', { text: 'Now show me this atlas’s four' }));
  go.disabled = done < FIELDS.length;
  box.append(go);
  /* DIDACTIC_SPEC §8.2: a student who will not write must still be able to go
     on, and the decline is recorded under their own name rather than pretended
     away. It is the same bargain the lesson path's own source beat offers. */
  box.append(el('button.cx-more.hgx-src__skip', {
    type: 'button', dataset: { hgx: 'srcskip', ex: ex.id },
    title: 'Recorded as a decline. You get the four lines either way.',
  }, el('span', { text: 'I would rather read this atlas’s four lines' })));
  box.append(el('p.cx-note.hgx-src__price', {
    text: 'You get ours either way. A decline is recorded in your own record, and the Close says '
      + 'which of the four you wrote.',
  }));
  return box;
}

/** One field: your sentence, ours, and what a strong answer notices here. */
function compareBlock(ex, f, mine, t, entry) {
  const spec = (ex.fields && ex.fields[f.key]) || {};
  const box = el('section.cx-panel.cx-panel--plain.hgx-src__cmp', { dataset: { field: f.key } });
  box.append(eyebrow(f.label));
  if (ex.hardest === f.key) {
    box.append(el('p.cx-note.cx-note--warn.hgx-src__hard', {
      text: 'This is the one this document makes hardest.',
    }));
  }
  const yours = el('div.hgx-src__side', { dataset: { who: 'you' } });
  yours.append(el('span.sc.hgx-k', { text: 'yours' }));
  yours.append(el('p.hgx-src__said', {
    text: mine || 'You did not write this one.',
    dataset: { empty: mine ? 'no' : 'yes' },
  }));
  box.append(yours);
  const ours = el('div.hgx-src__side', { dataset: { who: 'atlas' } });
  ours.append(el('span.sc.hgx-k', { text: 'this atlas' }));
  ours.append(el('p.hgx-src__said', { text: String(t[f.key] || t[f.key === 'cannotTell' ? 'cannotTellYou' : f.key] || 'not recorded') }));
  box.append(ours);
  if (spec.strong) {
    const n = el('div.hgx-src__notice');
    n.append(el('p.hgx-src__strong', {},
      el('span.sc.hgx-k', { text: 'a strong answer notices' }),
      document.createTextNode(spec.strong)));
    if (spec.weak) {
      n.append(el('p.hgx-src__weak', {},
        el('span.sc.hgx-k', { text: 'a weak one stops at' }),
        document.createTextNode(spec.weak)));
    }
    box.append(n);
  }
  if (f.key === 'purpose') {
    const cn = contrastLine(ex);
    if (cn) box.append(cn);
  }
  if (entry && entry.restored) {
    box.dataset.restored = 'yes';
  }
  return box;
}

/* THE PAIRING, AND WHY IT IS NOT ON THE FIRST SCREEN.
 *
 * The rubric critic's charge was about the SET: "a source whose purpose cuts
 * the other way would let the student see that the four fields answer
 * differently for a document written to justify rather than to protest". A
 * document made to justify sitting somewhere else in the app does not teach
 * that by itself — the comparison has to be put in front of the student, and
 * put where it does its work, which is under `purpose` and on the far side of
 * the commitment.
 *
 * AND IT MUST NOT ANSWER THE NEXT EXERCISE. `contrast` names what the paired
 * document was made to do, which is one of the four answers for THAT document.
 * So it is printed in full only when the pair is a text this atlas has already
 * answered in front of this student — one they have written about, or one the
 * lesson path put them through, which is the case for Lobengula. Otherwise the
 * pairing is named and the answer withheld: the same rule as the rest of this
 * file, applied to the exercise the student has not reached yet.
 */
function contrastLine(ex) {
  if (!ex.contrast || !ex.contrastWith) return null;
  const pair = BY_DOC.get(ex.contrastWith) || null;
  const spent = !pair || !!linesFor(pair.id);
  const box = el('div.hgx-src__pair');
  box.append(el('span.sc.hgx-k', { text: 'and set beside it' }));
  box.append(document.createTextNode(spent ? ex.contrast
    : 'This atlas asks the same four questions about “' + pair.title + '”, and that document was '
      + 'made to do a different thing from this one. Write those four as well, then set the two '
      + 'purposes side by side — that comparison is most of what “purpose” means.'));
  return box;
}

/**
 * The exercise, as chapters. Returns `[{ key, label, node }, …]` in the shape
 * render.js `assemble()` expects, so the pager, the fade and the band apply to
 * it without knowing anything about it.
 */
export function produceChapters(ex, state, ctx, opts = {}) {
  const t = docOf(ex);
  if (!t || !t.quote) return [];
  const entry = linesFor(ex.id);
  const out = [];
  const n = PRODUCTIONS.indexOf(ex) + 1;
  const seq = 'document ' + n + ' of ' + PRODUCTIONS.length;

  /* THE ONE PLACE THE EXERCISE MUST NOT BE ASKED.
   * A reader can page past the exercise, judge the argument, and land in its
   * second half — where every source the argument reads is printed whole,
   * `renderSource()` and all, including THIS document with the four answers on
   * it. Asking for four lines on a page that already prints ours is not an
   * exercise, it is a copying task, and it would break the rule this file is
   * built on. Measured in accept.scenario.js: the atlas's `nature` string was
   * in the DOM, in the evidence chapters, while the boxes were still empty.
   * So after the judgement an unwritten exercise is a route to the other three
   * rather than a question that has already been answered on the same screen. */
  if (!entry && opts.after && opts.printed) {
    const skip = el('section.cx-panel.cx-panel--plain.hgx-src__missed');
    skip.append(eyebrow('the four lines you went past'));
    skip.append(el('p.hgx-src__afterlede', {
      text: 'This argument asked you to say what ' + (t.speaker ? t.speaker.split(',')[0] : ex.title)
        + '’s document was before it printed its own four lines about it. You judged the argument '
        + 'first, and the document is now printed below with all four answers on it — so asking you '
        + 'to write them here would be a copying exercise rather than a reading one. There are '
        + (PRODUCTIONS.length - 1) + ' other documents in this atlas that ask the same four, and '
        + 'none of the answers is on the page.',
    }));
    const ul = el('ul.hgx-index__list.hgx-index__list--src');
    for (const other of PRODUCTIONS) {
      if (other.id === ex.id) continue;
      const li = el('li.hgx-index__row', { dataset: { judged: linesFor(other.id) ? 'yes' : 'no' } });
      li.append(el('button.cx-more.hgx-index__go', { type: 'button', dataset: { hgx: 'srcopen', ex: other.id } },
        el('span', { text: other.title })));
      li.append(el('p.hgx-index__who', { text: other.kindWord }));
      ul.append(li);
    }
    skip.append(ul);
    return [{ key: 'src-missed', label: 'the four lines', node: skip }];
  }

  if (!entry) {
    const why = whyBlock(ex, opts);
    why.dataset.seq = seq;
    out.push({ key: 'src-why', label: 'why this one', node: why });
    out.push({ key: 'src-doc', label: 'the document', node: docBlock(ex, t) });
    FIELDS.forEach((f, i) => {
      out.push({ key: 'src-w-' + f.key, label: f.short, node: fieldBlock(ex, f, i + 1) });
    });
    out.push({ key: 'src-write', label: 'your four lines', node: commitBlock(ex) });
    void state;
    return out;
  }

  /* On the far side of the commitment: one field per chapter, then the whole
     record as `renderSource()` prints it. */
  const head = el('div.hgx-src__after');
  head.append(eyebrow(entry.declined ? 'you read ours without writing yours' : 'yours, and ours'));
  head.append(el('p.hgx-src__afterlede', {
    text: entry.declined
      ? 'You chose to read this atlas’s four lines rather than write your own. They are below, with '
        + 'what a strong answer notices on each — which is worth having even second-hand.'
      : 'Nothing below is a mark scheme and nothing has been scored. The four lines this atlas '
        + 'prints about this document are set beside your own, and under each pair is the thing '
        + 'that document rewards noticing — which is the part you can take to the next one.',
  }));
  if (entry.restored) {
    head.append(el('p.cx-note.hgx-src__when', {
      text: 'You wrote those in an earlier visit. They are kept in your own record on this device.',
    }));
  }
  const q = el('blockquote.hgx-src__quote.hgx-src__quote--again');
  q.append(el('p', { text: '“' + t.quote + '”' }));
  head.append(q);
  head.append(el('p.hgx-src__cite', { text: t.speaker || [t.author, t.year].filter(Boolean).join(', ') }));
  out.push({ key: 'src-after', label: 'yours and ours', node: head });

  for (const f of FIELDS) {
    out.push({
      key: 'src-cmp-' + f.key,
      label: f.short,
      node: compareBlock(ex, f, (entry.fields || {})[f.key] || '', t, entry),
    });
  }

  /* THE CANONICAL RENDERING, LAST. The four answers are not the whole record —
     the quotation, what this atlas cites it for and where to check it are in it
     too — and `renderSource()` is the only function in this application allowed
     to print one. It has been withheld for two screens, not abolished. */
  const whole = el('section.cx-panel.cx-panel--plain.hgx-src__whole');
  whole.append(eyebrow('and the record whole, as this atlas prints it'));
  whole.append(el('p.cx-note', {
    text: 'Every document in this atlas carries these four answers above its words, in this shape. '
      + 'Having written four of your own, you can now read anyone else’s as an argument rather than '
      + 'as a label.',
  }));
  try { whole.append(renderSource(t, { claimId: ledgerKey(ex) })); } catch (_) { /* the corpus is another piece's */ }
  if (!opts.gate) {
    /* The genres are LISTED, not counted. The first draft said "four documents
       of four different kinds" — and the corpus's own `kind` field holds two
       (`primary-source` and `official-record`), so a reader checking the claim
       against the record would have found it wrong. What is actually four is
       the genre, and the honest form of that is to name them. Built from the
       data so it cannot drift when an exercise is added. */
    whole.append(el('p.cx-note.hgx-src__onward', {
      text: 'This atlas asks for these four lines on ' + PRODUCTIONS.length + ' documents — '
        + PRODUCTIONS.map((p) => p.kindWord).join('; ') + ' — because the move is worth having as '
        + 'a habit rather than as a memory. This was ' + seq + '.',
    }));
  }
  out.push({ key: 'src-whole', label: 'the record whole', node: whole });
  return out;
}

/**
 * THE STANDALONE NODE, for a caller that wants to mount one exercise as a beat.
 * Same chapters, same commitment, same everything — the only difference is that
 * it is its own root rather than four chapters inside an argument, so the band
 * and the pager measure it on its own. See CONTRACT.md §9.
 */
export function renderProduce(ex, state, ctx, opts = {}) {
  /* `dispute` is the STATE KEY, not the argument: an exercise standing on its
     own has its own pager position, and sharing a key with the argument it
     belongs to would make paging one page the other when both are open. */
  const root = el('div.hgx.hgx--src', { dataset: { dispute: 'src:' + ex.id, src: ex.id, mode: 'src' } });
  if (opts.lede) root.append(el('p.cx-note.hgx__lede', { text: opts.lede }));
  return { root, chapters: produceChapters(ex, state, ctx, opts) };
}

/* ==================================================================== AUDIT ==
 * This module's own standing, for `auditOwn()`. Every finding here is a defect
 * a reader would meet: an exercise pointing at a document the corpus does not
 * hold, or one the corpus holds without the answers this exercise promises to
 * print, or a field with no criterion under it.
 */
/* The acts a document can be made to perform, which is the axis this set is
   built to span. Deliberately short and deliberately not a taxonomy: it exists
   so that `auditProductions()` can fail a set that is all one kind. */
export const MADE_TO = ['to protest', 'to persuade', 'to accuse', 'to bear witness',
  'to account for', 'to justify', 'to defend'];
const DEFENSIVE = ['to justify', 'to defend'];
const ADVERSARIAL = ['to protest', 'to accuse', 'to persuade'];

export function auditProductions(texts) {
  const bad = [];
  const corpus = texts ? new Map(texts.map((t) => [t.id, t])) : TXT;
  const seenDoc = new Set();
  const seenDispute = new Set();
  for (const ex of PRODUCTIONS) {
    const t = corpus.get(ex.doc);
    if (!t) {
      bad.push({ id: ex.id, problem: 'names a document this atlas does not hold', detail: ex.doc });
      continue;
    }
    if (!t.quote) bad.push({ id: ex.id, problem: 'the document has no transcribed words, so there is nothing to reason about', detail: ex.doc });
    if (!t.check) bad.push({ id: ex.id, problem: 'the document has no locator, so a reader cannot check it', detail: ex.doc });
    for (const f of FIELDS) {
      if (!t[f.key] && !(f.key === 'cannotTell' && t.cannotTellYou)) {
        bad.push({ id: ex.id + '/' + f.key, problem: 'this atlas has no answer of its own to compare against', detail: ex.doc });
      }
      const spec = (ex.fields || {})[f.key] || {};
      if (!spec.strong) bad.push({ id: ex.id + '/' + f.key, problem: 'no criterion: nothing says what a strong answer notices here' });
      if (!spec.weak) bad.push({ id: ex.id + '/' + f.key, problem: 'no criterion: nothing says where a weak answer stops' });
    }
    if (!FIELD_BY_KEY.has(ex.hardest)) bad.push({ id: ex.id, problem: 'hardest must name one of the four fields', detail: ex.hardest });
    if (seenDoc.has(ex.doc)) bad.push({ id: ex.id, problem: 'two exercises on one document is a repeat, not practice', detail: ex.doc });
    seenDoc.add(ex.doc);
    if (seenDispute.has(ex.dispute)) bad.push({ id: ex.id, problem: 'two exercises inside one argument', detail: ex.dispute });
    seenDispute.add(ex.dispute);
    for (const k of ['why', 'lead', 'title', 'kindWord', 'madeTo', 'contrastWith', 'contrast']) {
      if (!ex[k]) bad.push({ id: ex.id, problem: 'missing field', detail: k });
    }
    /* WHAT THE DOCUMENT WAS MADE TO DO, and a real document that did the
       opposite. Both are checked, because the criticism this answers was about
       the set and a set is not audited by looking at one entry in it. */
    if (ex.madeTo && !MADE_TO.includes(ex.madeTo)) {
      bad.push({ id: ex.id, problem: 'madeTo is not one of the acts this atlas names', detail: ex.madeTo });
    }
    if (ex.contrastWith) {
      if (ex.contrastWith === ex.doc) {
        bad.push({ id: ex.id, problem: 'a document cannot be its own contrast', detail: ex.doc });
      } else if (!corpus.get(ex.contrastWith)) {
        bad.push({ id: ex.id, problem: 'the contrast names a document this atlas does not hold', detail: ex.contrastWith });
      }
      const pair = BY_DOC.get(ex.contrastWith);
      if (pair && pair.madeTo === ex.madeTo) {
        bad.push({ id: ex.id, problem: 'the contrast was made to do the same thing, so it contrasts with nothing', detail: ex.contrastWith });
      }
    }
    if (ex.pathBeat && !ex.pathBeat.after) {
      bad.push({ id: ex.id, problem: 'nominated for the path with no beat named', detail: 'pathBeat.after' });
    }
  }
  /* THE SET MUST CUT BOTH WAYS. Round 5's rubric finding, made into a rule:
     "a source whose purpose cuts the other way would let the student see that
     the four fields answer differently for a document written to justify
     rather than to protest". A set in which every document is somebody
     objecting teaches that a source is a complaint; a set in which every
     document is a government defending itself teaches that a source is a
     cover story. Both are met here, and the audit fails either. */
  const acts = new Set(PRODUCTIONS.map((p) => p.madeTo).filter(Boolean));
  if (PRODUCTIONS.length >= 3 && acts.size < 3) {
    bad.push({ id: 'set', problem: 'the documents were nearly all made to do the same thing, so the set does not practise purpose', detail: [...acts].join(', ') });
  }
  if (PRODUCTIONS.length >= 3 && ![...acts].some((k) => DEFENSIVE.includes(k))) {
    bad.push({ id: 'set', problem: 'no document in the set was made to justify or defend, so a student meets only sources that object' });
  }
  if (PRODUCTIONS.length >= 3 && ![...acts].some((k) => ADVERSARIAL.includes(k))) {
    bad.push({ id: 'set', problem: 'every document in the set was made by power defending itself, so a student meets nobody answering back' });
  }
  const beats = PRODUCTIONS.map((p) => p.pathBeat && p.pathBeat.after).filter(Boolean);
  if (new Set(beats).size !== beats.length) {
    bad.push({ id: 'set', problem: 'two exercises nominated for one beat of the lesson path', detail: beats.join(', ') });
  }
  /* The point of the set is that the move is practised on documents that resist
     it differently. Four exercises on four despatches would be four repetitions
     of one lesson. */
  const kinds = new Set(PRODUCTIONS.map((p) => (corpus.get(p.doc) || {}).kind).filter(Boolean));
  if (PRODUCTIONS.length >= 3 && kinds.size < 2) {
    bad.push({ id: 'set', problem: 'every exercise is on the same kind of document, so nothing is being practised' });
  }
  /* And the genre, which is the thing the panel actually claims. The corpus's
     `kind` is coarse — an inquiry's evidence volume and a royal proclamation
     are both `official-record` — so the finer distinction is `kindWord`, and it
     has to be distinct per exercise or the set is not practising anything. */
  const words = new Set(PRODUCTIONS.map((p) => p.kindWord));
  if (words.size !== PRODUCTIONS.length) {
    bad.push({ id: 'set', problem: 'two exercises describe the same genre, so the set repeats rather than practises' });
  }
  /* The hard field should move around the four, or three of the four questions
     never get the attention the panel says they need. */
  const hard = new Set(PRODUCTIONS.map((p) => p.hardest));
  if (PRODUCTIONS.length >= 3 && hard.size < 3) {
    bad.push({ id: 'set', problem: 'the hard field is the same on nearly every document, so one question is being practised and three are being met' });
  }
  return bad;
}

/** What the set holds, for the published handle and for a report. */
export function produceStats() {
  const kinds = {};
  for (const ex of PRODUCTIONS) {
    const t = docOf(ex);
    const k = (t && t.kind) || 'unrecorded';
    kinds[k] = (kinds[k] || 0) + 1;
  }
  return {
    exercises: PRODUCTIONS.length,
    documents: new Set(PRODUCTIONS.map((p) => p.doc)).size,
    arguments: new Set(PRODUCTIONS.map((p) => p.dispute)).size,
    kinds,
    written: writtenCount(),
    fields: FIELDS.length,
    min: MIN_FIELD,
  };
}
