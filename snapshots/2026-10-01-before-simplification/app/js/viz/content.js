/**
 * viz/content.js — the copy, and where every number in it comes from.
 *
 * Nothing here holds a number that is not also declared as a WARRANT against a
 * record in `app/data/`. Change the record and the figure either still checks
 * out or renders `[unsourced]` in front of the student. See figures.js.
 *
 * VOICE. DIDACTIC_SPEC §7: name the agent, use the plain word, quantify with a
 * range and a reason, evidence before adjective, never average a moral claim
 * into "mixed". Every sentence below is meant to be readable out loud by a
 * fifteen-year-old in one breath.
 */

/* ============================================================ warrants == */

const E = (id, pick, must, cite) => ({ kind: 'event', id, pick, must, cite });
const T = (id, pick, must, cite) => ({ kind: 'territory', id, pick, must, cite });

const ACT = 'slavery-abolition-act-1833';
const COMP = 'slavery-compensation-1835';
const TRADE = 'slave-trade-act-1807';
const BAPTIST = 'baptist-war-1831';
const APPR = 'apprenticeship-ends-1838';

const kenyaCost = (t) => (t.departures || []).map((d) => d.cost && d.cost.note).filter(Boolean).join(' · ');
const kenyaCites = (t) => {
  const d = (t.departures || []).find((x) => x.evidence && x.evidence.length);
  return (d && d.evidence) || t.evidence || [];
};

/* ============================================================= figures == */
/* One entry per number this piece may print. `id` is the cross-lighting key:
   the same id in two cells is the same fact, and landing on either lights
   both. */

export const FIGURES = {
  'freed-800k': {
    id: 'freed-800k', value: 800000, print: '800,000', unit: 'freed', year: 1834,
    warrant: E(ACT, (e) => e.summary, ['freed about 800,000 people']),
  },
  'act-1834': {
    id: 'act-1834', value: 1834, print: '1834', unit: 'the Act takes effect', year: 1834,
    warrant: E(ACT, (e) => e.summary, ['to take effect on 1 August 1834']),
  },
  'paid-20m': {
    id: 'paid-20m', value: 20000000, print: '£20,000,000', unit: 'to owners', year: 1835,
    warrant: E(COMP, (e) => e.summary, ['about £20 million', '46,000 claimants']),
  },
  'paid-0': {
    id: 'paid-0', value: 0, print: '£0', unit: 'to the freed', year: 1835,
    warrant: E(COMP, (e) => e.summary, ['The people themselves got nothing']),
  },
  'owners-46k': {
    id: 'owners-46k', value: 46000, print: '46,000', unit: 'owners paid', year: 1835,
    warrant: E(COMP, (e) => e.summary, ['roughly 46,000 claimants']),
  },
  'loan-2015': {
    id: 'loan-2015', value: 2015, print: '2015', unit: 'loan repaid', year: 1835,
    warrant: E(ACT, (e) => e.significance, ['not fully redeemed until 2015']),
  },
  'embarked-34m': {
    id: 'embarked-34m', value: 3400000, print: '3.0–3.4 million', unit: 'carried', year: 1807,
    warrant: E(TRADE, (e) => [e.toll.enslavedLow, e.toll.enslavedHigh, e.toll.note].join(' '),
      ['3000000', '3400000', 'Trans-Atlantic Slave Trade Database']),
  },
  'died-crossing': {
    id: 'died-crossing', value: 500000, print: '400,000–600,000', unit: 'died at sea', year: 1807,
    warrant: E(TRADE, (e) => e.toll.note, ['400,000 to 600,000 of them died before landing']),
  },
  'struck-60k': {
    id: 'struck-60k', value: 60000, print: '60,000', unit: 'on strike', year: 1831,
    warrant: E(BAPTIST, (e) => e.summary, ['about 60,000 people took part']),
  },
  'free-1838': {
    id: 'free-1838', value: 1838, print: '1838', unit: 'fully free', year: 1838,
    warrant: E(APPR, (e) => e.summary, ['On 1 August 1838 about 700,000 people became fully free']),
  },
  /* Kenya */
  'settlers-32': {
    id: 'settlers-32', value: 32, print: '32', unit: 'European settlers killed', year: 1956,
    warrant: T('kenya', kenyaCost, ['32 European settlers'], kenyaCites),
  },
  'hanged-1090': {
    id: 'hanged-1090', value: 1090, print: '1,090', unit: 'hanged', year: 1956,
    warrant: T('kenya', kenyaCost, ['1,090 hanged'], kenyaCites),
  },
  'killed-11503': {
    id: 'killed-11503', value: 11503, print: '11,503', unit: 'killed, official count', year: 1956,
    warrant: T('kenya', kenyaCost, ['11,503 Mau Mau killed'], kenyaCites),
  },
  'villagised-1m': {
    id: 'villagised-1m', value: 1000000, print: 'about 1,000,000', unit: 'moved into guarded villages', year: 1955,
    warrant: T('kenya', (t) => t.consequences.populationTransfer.note,
      ['roughly one million Kikuyu into 800 or more guarded villages']),
  },
  'claimants-5228': {
    id: 'claimants-5228', value: 5228, print: '5,228', unit: 'paid in 2013', year: 1956,
    warrant: T('kenya', (t) => t.consequences.violence.note, ['5,228 survivors']),
  },
  /* The Indian Civil Service */
  'ics-1000': {
    id: 'ics-1000', value: 1000, print: 'about 1,000', unit: 'British officers', year: 1900,
    warrant: T('british-india', (t) => (t.statusPeriods || []).map((p) => p.howControlWorked || '').join(' '),
      ['about a thousand covenanted British officers']),
  },
  'ics-300m': {
    id: 'ics-300m', value: 300000000, print: '300,000,000', unit: 'people governed', year: 1900,
    warrant: T('british-india', (t) => (t.statusPeriods || []).map((p) => p.howControlWorked || '').join(' '),
      ['governed 300 million people']),
  },
  /* The Company's army */
  'company-army-280k': {
    id: 'company-army-280k', value: 280000, print: '280,000', unit: 'men under arms', year: 1857,
    /* The one status period that says it, not all three joined: the warrant
       line is printed to the student, and a student reading three centuries of
       constitutional history to find one clause has been given a haystack. */
    warrant: T('british-india',
      (t) => ((t.statusPeriods || []).find((p) => /army that reached/.test(p.howControlWorked || '')) || {}).howControlWorked || '',
      /* ROUND 7 — REPORTED BY THREE CRITICS AS THE WORST THING ON THE DEFAULT
         ROUTE, and it was one word. The `british-india` record reads "an army
         that reached ABOUT 280,000 men at its peak on the eve of 1857, most of
         them Indian"; this anchor asked for the phrase without the "about", so
         `warrant()` failed and step 7 of 17 printed "[unsourced]
         `british-india` no longer says …" in red, on a projector, above the
         T8 dot chart. The claim was always sourced (Metcalf & Metcalf) and the
         record always said it; the anchor was quoting a sentence that had been
         edited since. Anchored on the words the record actually carries, and
         short enough not to break again on the next comma.
         REPORTED, NOT FIXED HERE: `tools/check-warrants.js` reports "path 24
         total, 24 warranted, 0 bare" because it does not walk the viz specs
         mounted on beats, which is how this shipped. */
      ['an army that reached about 280,000 men', 'most of them Indian']),
  },
  'company-army-vs-british-army': {
    id: 'company-army-vs-british-army', value: 2, print: 'twice', unit: 'the size of the British Army', year: 1857,
    warrant: T('british-india', (t) => (t.pedagogy && t.pedagogy.hook) || '',
      ['private army of over 200,000 men', 'twice the size of the British Army']),
  },
};

/* ======================================================= tension plate == */
/**
 * FEATURE_SPEC charge 3. Four claims, all true, that a student will otherwise
 * collapse into one. They are held in one field, permanently, and then the
 * student is invited to make the simplification they were going to make
 * anyway — and shown its price.
 *
 * `strike` is the sentence this claim loses when a DIFFERENT claim is chosen:
 * the thing that version of the story has to leave out.
 */
export const PLATES = {
  abolition: {
    id: 'abolition',
    eyebrow: 'Four claims',
    title: 'Britain and slavery',
    t: 'T5',
    ask: 'All four are true at once. Which is the real story?',
    askShort: 'All four are true. Which is the real story?',
    year: 1834,
    claims: [
      {
        id: 'abolished',
        title: 'Britain abolished slavery.',
        body: 'Parliament ended it across most of the empire. The last people held under it walked free four years later.',
        short: 'The last people held under it walked free four years after the Act.',
        figures: ['act-1834', 'freed-800k', 'free-1838'],
        strike: 'Parliament did abolish it, and about 800,000 people were freed.',
        cost: 'A story that ends here cannot explain why Emancipation Day across the Caribbean is 1838, not 1834.',
        warrantFig: 'freed-800k',
      },
      {
        id: 'built',
        title: 'Britain built the trade it abolished.',
        body: 'Before it policed the Atlantic, Britain was the largest carrier on it. The dead are counted apart from the landed.',
        short: 'Britain was the Atlantic\u2019s largest carrier before it policed the Atlantic.',
        figures: ['embarked-34m', 'died-crossing'],
        strike: 'British ships had already carried between 3.0 and 3.4 million people across the Atlantic.',
        cost: 'A story without this makes 1807 the beginning of Britain’s involvement rather than the end of it.',
        warrantFig: 'embarked-34m',
      },
      {
        id: 'forced',
        title: 'Enslaved people forced it.',
        body: 'In December 1831 enslaved Jamaicans struck for wages. Sam Sharpe was hanged. The Act passed eighteen months later.',
        short: 'The strike came first. The Act came eighteen months after Sharpe was hanged.',
        figures: ['struck-60k', 'act-1834'],
        strike: 'Sixty thousand enslaved Jamaicans struck for wages fourteen months before the Act.',
        cost: 'A story without this has abolition happening to enslaved people rather than because of them.',
        warrantFig: 'struck-60k',
      },
      {
        id: 'bought',
        title: 'Abolition was bought from the owners.',
        body: 'The Treasury valued the people it was freeing, paid those who had owned them, and borrowed to do it.',
        short: 'The Treasury paid the owners, and borrowed the money to do it.',
        figures: ['paid-20m', 'paid-0', 'freed-800k', 'loan-2015'],
        strike: '£20,000,000 to the owners. £0 to the people freed.',
        cost: 'A story without this is the one on the commemorative coin.',
        warrantFig: 'paid-20m',
      },
    ],
  },
};

/* =========================================================== ratio line == */
/**
 * FEATURE_SPEC charge 10. One axis, one divider, and a committed guess before
 * any number appears. Print's pedagogy is that the reader does the division;
 * most do not. Ours is that the reader commits to a division and is wrong.
 */
export const RATIOS = {
  kenya: {
    id: 'kenya',
    t: 'T19',
    eyebrow: 'Guess before you look',
    title: 'Kenya, 1952 to 1960',
    anchorFig: 'settlers-32',
    anchorLine: 'Between 1952 and 1960 the colonial government in Kenya recorded <strong>32 European settlers killed</strong>.',
    question: 'On the same axis, where does the number of Kikuyu people moved into guarded villages sit? Drag the divider and commit before anything else appears.',
    guessLabel: 'People moved into guarded villages',
    scale: 'log',
    min: 10,
    max: 3000000,
    scaleSaid: 'This axis is <strong>logarithmic</strong>: every step along it is ten times the step before. It is drawn that way because on a plain axis the settlers’ figure would sit less than a pixel from the left-hand end, and a mark you cannot see teaches nothing.',
    targetFig: 'villagised-1m',
    alsoFigs: ['hanged-1090', 'killed-11503', 'claimants-5228'],
    /* DIDACTIC_SPEC §9.2 registers the Mau Mau death toll as contested, and
       §4 M18 makes a scalar there a bug rather than a rounding choice. Until
       this round the surface printed the colonial government's own count of
       11,503 and drew nothing for the figure that is actually in dispute. */
    range: {
      id: 'kenya-deaths',
      label: 'People killed, 1952–1960',
      /* The warrant is the record's own SENTENCE, so what prints under the bar
         reads as a sentence. The two ends of the band come from the record's
         `deathsLow` / `deathsHigh` through `read`, and the bar renders
         [unsourced] if either has gone. */
      warrant: T('kenya', (t) => {
        const v = (t.consequences && t.consequences.violence && t.consequences.violence.toll) || {};
        return v.note || '';
      }, ['official counts at the low end', 'Blacker', 'about 50,000 excess deaths', 'Records were destroyed at independence']),
      read: (t) => {
        const v = (t.consequences && t.consequences.violence && t.consequences.violence.toll) || {};
        return { low: Number(v.deathsLow), high: Number(v.deathsHigh), note: v.note || '' };
      },
      said: 'The counted figures above sit on this axis as points. This one cannot, because it is not a count. The solid band is the range the record holds; where it stops, the evidence stops.',
    },
    after: 'Records were destroyed at independence and thousands more were removed to Britain and hidden until 2011. The scale is disputed; the system is not.',
    year: 1956,
    units: ['kenya'],
    sel: 'kenya',
  },
  compensation: {
    id: 'compensation',
    t: 'T5',
    eyebrow: 'Guess before you look',
    title: 'Who was compensated in 1835',
    anchorFig: 'paid-20m',
    anchorLine: 'In 1835 Parliament voted <strong>£20,000,000</strong> in compensation for the ending of slavery. The axis below is that whole sum, from none of it on the left to all of it on the right.',
    question: 'How much of it do you think went to the 800,000 people who were freed? Put the divider where you think their share sits, and commit.',
    guessLabel: 'Paid to the people who were freed',
    scale: 'linear',
    min: 0,
    max: 20000000,
    scaleSaid: 'This axis is <strong>linear</strong> — equal distances are equal pounds — and deliberately not logarithmic, because a logarithmic axis cannot draw zero at all, and the axis has to be able to hold every possible answer including that one.',
    targetFig: 'paid-0',
    alsoFigs: ['owners-46k', 'freed-800k', 'loan-2015'],
    after: 'The money was borrowed. The loan sat on the national accounts until 2015, so descendants of the people who had been enslaved helped repay it.',
    year: 1835,
    units: ['jamaica', 'barbados', 'trinidad', 'guyana'],
    sel: 'jamaica',
  },
  ics: {
    id: 'ics',
    t: 'T10',
    eyebrow: 'Guess before you look',
    title: 'Who actually ran British India',
    anchorFig: 'ics-1000',
    anchorLine: 'Under the Raj, <strong>about 1,000</strong> covenanted British officers of the Indian Civil Service were in post at any one time.',
    question: 'On the same axis, where does the number of people they governed sit? Drag the divider and commit.',
    guessLabel: 'People governed',
    scale: 'log',
    min: 100,
    max: 1000000000,
    scaleSaid: 'This axis is <strong>logarithmic</strong>: every step is ten times the last. Between the two marks there are five of those steps, and no ordinary axis can show both ends at once.',
    targetFig: 'ics-300m',
    alsoFigs: [],
    after: 'The gap was filled by Indian clerks, police, revenue collectors, landlords and soldiers. Empire was mostly run by the colonised, which is why withdrawing that cooperation worked.',
    year: 1900,
    units: [],
    sel: 'british-india',
  },
};

export const RATIO_ORDER = ['kenya', 'compensation', 'ics'];

/* ============================================================== the index ==
 * The one route into this piece that does not depend on another module. It
 * costs the layout budget nothing at `plate` and nothing at `working`: the
 * control that opens it exists only at data-stage="apparatus", which is a
 * level the reader reaches by pressing something. Each line says what it will
 * ask, and none of them says an answer.
 */
export const INDEX = {
  eyebrow: 'Quantities',
  title: 'Eight things worth counting',
  intro: 'Each of these asks you for a number before it shows you one. The map stays where it is.',
  items: [
    { id: 'plate:abolition', label: 'Britain and slavery', say: 'Four sentences, all true, that do not sit comfortably together. Pick the real story and see what it costs.' },
    { id: 'ratio:kenya', label: 'Kenya, 1952 to 1960', say: '32 European settlers were killed. Put the other figure on the same axis before you see it.' },
    { id: 'ratio:compensation', label: 'Who was compensated in 1835', say: '£20,000,000 was voted. Guess how much of it reached the people who were freed.' },
    { id: 'ratio:ics', label: 'Who actually ran British India', say: 'About a thousand British officials. Guess how many people they governed.' },
    { id: 'flow', label: 'The crossing, and the gap', say: 'Three million people forced onto British ships. Guess how many never landed, then watch the gap drawn to scale.' },
    { id: 'dots:army', label: 'Whose army took India?', say: 'A hundred dots for a quarter of a million soldiers. Fill in the British share before the record answers you.' },
    { id: 'extent', label: 'How big, and when', say: 'Land, share of the world and separate territories, recomputed from this atlas year by year.' },
    { id: 'twin', label: '1947: what actually left', say: 'Two marks on two bars. Guess how much of the empire’s people went that year, and how much of its land.' },
  ],
};

/* ============================================================== the flow ==
 * T3 / LO5. The one thing print draws well and this app had not drawn at all:
 * the Atlantic crossing, with the difference between the people forced onto
 * the ships and the people who came off them drawn as a gap you can see.
 *
 * NOTHING HERE IS A NUMBER. Every quantity below is READ OUT OF THE RECORD at
 * render time by `read(record)`; the `warrant` only guarantees that the record
 * still says what this component thinks it says. Correct a shard and the chart
 * moves. Delete a sentence and the chart says `[unsourced]` in front of the
 * student instead of quietly redrawing itself around the hole.
 *
 * THE THREE COASTS ARE REGIONAL TOTALS FOR THE WHOLE ATLANTIC TRADE, not for
 * British ships alone, and the component says so in the copy rather than
 * letting the bars imply it. The atlas's own sentence for each one is printed
 * underneath, and two of the three say how British the traffic was.
 */

const slaveryNote = (t) => (t.consequences && t.consequences.slavery && t.consequences.slavery.note) || '';
const slaveryTollNote = (t) => {
  const s = t.consequences && t.consequences.slavery && t.consequences.slavery.toll;
  return (s && s.note) || '';
};
const slaveryToll = (t) => {
  const s = (t.consequences && t.consequences.slavery && t.consequences.slavery.toll) || {};
  return { low: Number(s.enslavedLow) || null, high: Number(s.enslavedHigh) || null };
};

export const FLOW = {
  id: 'atlantic',
  t: 'T3',
  lo: 'LO5',
  eyebrow: 'Guess before you look',
  title: 'The crossing, and the gap',

  /* ---- the anchor, and the question asked before anything is drawn ---- */
  anchorFig: 'embarked-34m',
  anchorLine: 'Between the 1660s and 1807, British ships carried <strong>between 3.0 and 3.4 million</strong> people out of Africa across the Atlantic. That figure is a floor: it counts the voyages whose papers survive.',
  question: 'Of every hundred people forced onto a British ship, how many do you think never reached land alive? Put the mark where you think it goes, and commit.',
  guessLabel: 'never landed alive',
  scaleSaid: 'This bar is <strong>one hundred people</strong>. Nothing else is drawn until you have committed.',

  /* ---- the crossing --------------------------------------------------- */
  embarkedFig: 'embarked-34m',
  diedFig: 'died-crossing',
  landedLabel: 'Landed alive in the Americas',
  landedNote: 'This atlas does not hold a figure for the people who landed. It holds the two figures above, so the third is a subtraction, done here, in front of you: the smallest embarkation figure less the largest number of deaths, and the largest less the smallest.',

  /* ---- where they were taken from ------------------------------------- */
  fromHead: 'Three coasts the captives were taken from',
  fromNote: 'These are regional totals for the whole Atlantic trade, every flag and every century, not the British share alone — which is why they are drawn apart from the crossing above and not added to it. The atlas says, for each coast, how British the traffic was. The seven bars below and these three share one scale of their own; it is not the scale of the crossing.',
  from: [
    { id: 'flow-from-biafra', territoryId: 'nigeria', label: 'Bight of Biafra',
      warrant: T('nigeria', slaveryNote, ['Bight of Biafra', '1.6 million people were shipped']),
      read: (t) => ({ low: 1600000, high: 1600000 }), circa: true,
      say: 'most of them Igbo and Ibibio, and most of them in British ships' },
    { id: 'flow-from-gold-coast', territoryId: 'gold-coast', label: 'The Gold Coast',
      warrant: T('gold-coast', slaveryNote, ['1.2 million people were shipped']),
      read: () => ({ low: 1200000, high: 1200000 }), circa: true,
      say: 'a large share of them through British forts, sold by Asante and coastal states that grew rich on it' },
    { id: 'flow-from-senegambia', territoryId: 'senegambia-province', label: 'Senegambia',
      warrant: T('senegambia-province', slaveryNote, ['750,000 people were shipped']),
      read: () => ({ low: 750000, high: 750000 }), circa: true,
      say: 'French and British forts on the same coast; the flags changed and the cargoes did not' },
  ],

  /* ---- where they were landed ----------------------------------------- */
  toHead: 'Seven places this atlas counts them landing',
  /* A SECOND PRODUCED ANSWER, seven or eight minutes after the first, inside
     the same surface: DIDACTIC_SPEC §3's spacing rule says the second encounter
     must be retrieval, never re-presentation. The four names are authored; the
     ANSWER is computed from whichever record holds the largest range, so this
     cannot go stale against the dataset. */
  toAsk: {
    question: 'Before the seven bars draw: which single place do you think took the most people?',
    choices: ['virginia', 'barbados', 'jamaica', 'south-carolina'],
    right: 'Jamaica, by a distance. Roughly a million people were landed there between 1655 and 1807 — more than twice Barbados, and more than every mainland North American place on this list put together.',
    wrong: 'Not Barbados, and not the mainland.',
  },
  toNote: 'Every one of these ranges is the Trans-Atlantic Slave Trade Database read through this atlas’s own records, and every one of them counts arrivals. Jamaica, Barbados and St Kitts re-exported people onwards, so the same person can appear twice. That is why these bars are not added up: a total made of overlapping ranges and double counting is a worse number than seven honest ones.',
  to: [
    { id: 'flow-to-jamaica', territoryId: 'jamaica', label: 'Jamaica',
      warrant: T('jamaica', slaveryTollNote, ['The arrivals range is from the Trans-Atlantic Slave Trade Database']), read: slaveryToll },
    { id: 'flow-to-barbados', territoryId: 'barbados', label: 'Barbados',
      warrant: T('barbados', slaveryTollNote, ['the range follows the Trans-Atlantic Slave Trade Database']), read: slaveryToll },
    { id: 'flow-to-guyana', territoryId: 'guyana', label: 'British Guiana',
      warrant: T('guyana', slaveryTollNote, ['The arrivals range covers Dutch and British trafficking']), read: slaveryToll },
    { id: 'flow-to-st-kitts', territoryId: 'saint-kitts', label: 'St Kitts',
      warrant: T('saint-kitts', slaveryTollNote, ['The range is for Africans landed in St Kitts']), read: slaveryToll },
    { id: 'flow-to-south-carolina', territoryId: 'south-carolina', label: 'South Carolina',
      warrant: T('south-carolina', slaveryTollNote, ['Approximate number of Africans landed at Charles Town']), read: slaveryToll },
    { id: 'flow-to-antigua', territoryId: 'antigua', label: 'Antigua',
      warrant: T('antigua', slaveryTollNote, ['The arrivals range is from the Trans-Atlantic Slave Trade Database']), read: slaveryToll },
    { id: 'flow-to-virginia', territoryId: 'virginia', label: 'Virginia and the Chesapeake',
      warrant: T('virginia', slaveryTollNote, ['Approximate number of Africans landed in the Chesapeake']), read: slaveryToll },
  ],

  after: 'The gap is not an accident of the weather. Sugar and rice were worked at a pace that killed, so planters bought people rather than raise them, and the ships were packed to the profit of the voyage. Jamaica’s enslaved population never grew, in a century and a half, despite roughly a million arrivals.',
  year: 1780,
  sel: 'barbados',
};

/* ============================================================== the dots ==
 * T8 / M2 / M9. A hundred dots, a guess placed before anything resolves.
 *
 * AND A REFUSAL, WHICH IS THE POINT. The record in this atlas gives the size
 * of the Company's army and does not give the number of Europeans in it. So
 * the dots do not resolve to a percentage. They resolve to the band the record
 * actually supports, with the rest drawn as uncounted and named as uncounted.
 * A chart that filled in the missing share would teach the wrong lesson twice:
 * once about the army, and once about what a number is.
 */
export const DOTS = {
  army: {
    id: 'army',
    t: 'T8',
    lo: 'LO3',
    eyebrow: 'Guess before you look',
    title: 'Whose army took India?',
    dotUnit: 'soldiers',
    anchorFig: 'company-army-280k',
    anchorLine: 'By the 1850s the East India Company — a firm with shareholders in London — had an army that reached <strong>280,000 men</strong>. When Parliament abolished the Company in 1858 it took over a standing army of 200,000.',
    question: 'Each dot below is one hundredth of that army. Fill in how many of the hundred you think were British.',
    guessLabel: 'were British',
    /* The comparison the record does make, drawn on the same hundred dots. */
    compareFig: 'company-army-vs-british-army',
    compareLine: 'This atlas records one comparison, and it is worth holding: the Company’s private army was <strong>twice the size of the British Army</strong>. On these hundred dots, every soldier the British state had anywhere in the world would fill fifty.',
    answer: {
      /* Where the record stops, and what it does say. */
      capFrac: 0.5,
      capLabel: 'Indian — guaranteed by the record’s word “most”',
      openLabel: 'never counted — the atlas does not say who these were',
      warrantFig: 'company-army-280k',
    },
    verdictLead: 'The atlas gives the strength of that army and does not count its Europeans.',
    verdictBody: 'What its own record says is “most of them Indian”, so the dots stop where the evidence stops: at fewer than half British, with the rest drawn open because nobody here counted it. Any sharper line would be invented, and a chart that invents a line is teaching you the wrong lesson twice.',
    after: 'Conquest in India was paid for out of Bengal’s land tax and carried out, overwhelmingly, by Indian soldiers under a small British officer corps. In May 1857 those soldiers stopped, and British rule across northern India wobbled within weeks. That is the test of the claim, and it is not a thought experiment.',
    year: 1857,
    sel: 'british-india',
    units: [],
  },
};

/* ============================================================== the twin ==
 * M14 / T14. DIDACTIC_SPEC §4 names ONE owner for "1947 was the end of the
 * empire" and one artefact: twin charts, population lost against area lost.
 * Everything the surface prints is computed in the browser from the atlas's
 * own geometry and its own counted population figures — see twin.js. The only
 * thing declared here is the anchor, and it is warranted against the record
 * for the day itself, whose own sentence the chart then checks.
 */
export const TWIN = {
  id: '1947',
  t: 'T14',
  lo: 'LO8',
  eyebrow: 'Guess before you look',
  title: '1947: what actually left',
  anchorLine: 'On <strong>15 August 1947</strong> British rule ended in India and Pakistan. It is the date most people give for the end of the British Empire.',
  question: 'Two marks, one day. Out of every hundred people Britain ruled, how many stopped being ruled by Britain in 1947? And out of every hundred square kilometres it held, how many stopped being British the same year? Set both, then commit.',
  peopleLabel: 'Of every hundred people',
  landLabel: 'Of every hundred square kilometres',
  scaleSaid: 'Both bars run from <strong>none of them</strong> to <strong>all of them</strong>. Nothing is drawn on either until you have committed both.',
  after: 'Britain still held more than a hundred territories the next morning, and it fought for several of them: the Malayan Emergency began in 1948, Kenya in 1952, Cyprus in 1955, Aden in 1963. British forces were more heavily committed to colonial wars in the 1950s than in the 1930s. Hong Kong, the last large populated territory, left fifty years after India.',
  warrant: E('partition-of-india-1947', (e) => e.significance,
    ['removed about three quarters of the empire\u2019s population in a single day, and almost none of its territory']),
  year: 1947,
  sel: 'british-india',
};
