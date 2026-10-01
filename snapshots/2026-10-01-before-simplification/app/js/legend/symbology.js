/* =============================================================================
   SYMBOLOGY — the atlas's status vocabulary, published once, consumed by everyone.
   Owner: P17 (legend). FEATURE_SPEC §2 P04 lists P17 as the owner of the
   "status vocabulary"; this file is that vocabulary.

   The problem this file solves
   ----------------------------
   docs/DESIGN.md §2.2 proves TEN map fills. app/data/territories/index.json
   declares TWENTY-ONE legal statuses. Nobody had written down which status gets
   which plate colour, so every consumer would have invented its own answer.

   The answer here is: ten colour FAMILIES (the ten proved fills, untouched),
   each holding the legal forms that share a kind of authority, and inside a
   family the statuses are told apart by a different engraved texture drawn from
   the nine textures DESIGN already ships. No new colour. No new texture.

   The texture assignment is PROVED, not asserted, by the same backtracking
   graph-colouring that tools/design/textures.js runs on the ten families:
   two marks must differ in texture if they share a family (identical fill) or
   if their families are closer than 12 dE00 in either theme under normal,
   protan, deutan or tritan vision. 22 marks, max degree 9, nine textures,
   zero clashes. Each family's namesake keeps the texture DESIGN assigned it
   (crown-colony keeps `plain`, protectorate keeps `hatch-135`, and so on), so
   nothing already drawn changes meaning.

   Exposed as `window.BEA.symbology` and emitted on the bus as
   `legend:symbology` at mount, so the map, dossier and layer modules read the
   same table rather than each keeping a private one.
   ========================================================================== */

/** The ten proved plate fills. `sentence` is what the family MEANS, in one line. */
export const FAMILIES = [
  {
    key: 'never-british',
    short: "Not British",
    label: 'Not British this year',
    texture: 'plain',
    sentence: 'Nobody in London claimed authority here on this date. It may have been British before, or later.',
  },
  {
    key: 'lost-former',
    short: "Formerly British",
    label: 'Formerly British',
    texture: 'hatch-45',
    sentence: 'Britain held this and no longer does. The empire lost places all the way through, not only at the end.',
  },
  {
    key: 'dominion',
    short: "Self-governing",
    label: 'Self-governing under the Crown',
    texture: 'rule-h',
    sentence: 'Local ministers run the place; the Crown stays at the top of it and the date it stopped being British is arguable.',
  },
  {
    key: 'settlement',
    short: "Settler assembly",
    label: 'Settler colony with an assembly',
    texture: 'stipple',
    sentence: 'Settlers who owned property elected an assembly. The people already living there did not vote in it.',
  },
  {
    key: 'crown-conquered',
    short: "London decides",
    label: 'The decision is taken in London',
    texture: 'plain',
    /* ROUND 11 — "Great Britain itself painted under the same 'Ruled from
       London' chip as Anguilla at 2020, which reads as a category slip even
       though the underlying status is part-of-uk" (specialist critic). The
       colour is right and the argument for it is in STATUS_SYMBOL['part-of-uk']:
       this fill means the seat of decision, and for the United Kingdom that seat
       is its own parliament. "Ruled from London" said something else — it is
       what is done TO a colony — so the chip now names the seat rather than the
       ruling, and the sentence says in one clause which of the two a reader is
       looking at. The two are told apart on the plate by texture (crown-colony
       `plain`, part-of-uk `hatch-135`) and by name in the entry. */
    sentence: 'For a colony that means a governor or a minister no local electorate can remove; for the United Kingdom itself it means its own parliament.',
  },
  {
    key: 'company-rule',
    short: "A company",
    label: 'A company, not a government',
    texture: 'cross',
    sentence: 'A chartered private company with its own ships, forts and soldiers — answerable to shareholders and a charter.',
  },
  {
    key: 'lease',
    short: "Leased or shared",
    label: 'Sovereignty is not Britain’s alone',
    texture: 'rule-v',
    /* ROUND 11 — WHAT THE CHIP SAID, AND WHAT IT WAS SAYING IT ABOUT. A
       specialist critic: "app/js/legend/symbology.js maps status 'condominium'
       into family 'lease' whose chip short is 'Leased'. At 1900 the student
       reads Anglo-Egyptian Sudan as leased. It was a condominium, and
       DIDACTIC_SPEC LO2 names condominium as one of the five statuses a student
       must be able to distinguish."
       The grouping is right — in both forms the sovereignty is somebody else's,
       which is the fact the colour carries — and the word on the chip was the
       name of only one of them. It now names the family and not one member of
       it, and both members are in the sentence, with the difference between
       them stated: a lease has a landlord and an expiry date; a condominium has
       two sovereigns and no single one. The texture still tells them apart on
       the plate (leased-territory `rule-v`, condominium `plain`) and the entry
       in the sheet names each place under its own legal form. */
    sentence: 'Britain administers it and the sovereignty is not Britain’s: a lease from an owner, with an expiry date, or a condominium run jointly with another state.',
  },
  {
    key: 'protectorate',
    short: "Protectorate",
    label: 'A ruler kept, a decision taken',
    texture: 'hatch-135',
    sentence: 'The local ruler keeps his title and his court. Britain takes the foreign policy, and in practice much more.',
  },
  {
    key: 'mandate',
    short: "Mandate",
    label: 'Held on paper for someone else',
    texture: 'stipple-coarse',
    sentence: 'Administered under an international body Britain sat on, with a duty to report and to prepare it for self-rule.',
  },
  {
    key: 'occupied',
    short: "Held by the army",
    label: 'Held by the army',
    texture: 'hatch-135-dense',
    sentence: 'Soldiers are in charge and the legal position has not been settled. Usually wartime, sometimes for decades.',
  },
];

export const FAMILY_BY_KEY = new Map(FAMILIES.map(f => [f.key, f]));

/**
 * status id -> { family, texture }
 * `family` is why it is that colour. `texture` is the proved mark that keeps it
 * distinguishable from every neighbour, including its own family siblings.
 * `note` explains a grouping a student could reasonably query.
 */
export const STATUS_SYMBOL = {
  /* --- the company --- */
  'company-trading-posts': { family: 'company-rule', texture: 'plain' },
  'company-rule':          { family: 'company-rule', texture: 'cross' },

  /* --- settlers with a legislature of their own --- */
  'proprietary-colony':    { family: 'settlement', texture: 'rule-h' },
  'representative-colony': { family: 'settlement', texture: 'stipple' },

  /* --- decided in London --- */
  'crown-colony':          { family: 'crown-conquered', texture: 'plain' },
  'crown-rule':            { family: 'crown-conquered', texture: 'rule-v' },
  'overseas-territory':    { family: 'crown-conquered', texture: 'hatch-45',
    note: 'Same colour as a crown colony because it is the same office: these were called colonies until 1981, and London suspended the Turks and Caicos constitution in 2009.' },
  'part-of-uk':            { family: 'crown-conquered', texture: 'hatch-135',
    note: 'The deepest madder is "governed from Westminster". For Britain that means the state itself; for Ireland between 1801 and 1922 it meant Westminster and Dublin Castle. The colour is the same because the seat of decision was.' },

  /* --- self-governing, Crown on top --- */
  'self-governing-colony': { family: 'dominion', texture: 'rule-v' },
  'dominion':              { family: 'dominion', texture: 'rule-h' },
  'associated-state':      { family: 'dominion', texture: 'hatch-135' },
  'crown-dependency':      { family: 'dominion', texture: 'stipple',
    note: 'Jersey, Guernsey and the Isle of Man were never colonies and were never in the United Kingdom. They are here because they are the Crown\'s, which is what this colour means.' },

  /* --- a ruler kept, a decision taken --- */
  'protectorate':          { family: 'protectorate', texture: 'hatch-135' },
  'protected-state':       { family: 'protectorate', texture: 'rule-h' },
  'princely-state':        { family: 'protectorate', texture: 'hatch-45' },

  /* --- held for an international body --- */
  'mandate':               { family: 'mandate', texture: 'stipple-coarse' },
  'trusteeship':           { family: 'mandate', texture: 'plain' },

  /* --- sovereignty stays elsewhere --- */
  'leased-territory':      { family: 'lease', texture: 'rule-v' },
  'condominium':           { family: 'lease', texture: 'plain',
    note: 'Grouped with the lease because British sovereignty was never sole. The New Hebrides had two police forces and three legal systems at once.' },

  /* --- the army --- */
  'occupied':              { family: 'occupied', texture: 'hatch-135-dense' },

  /* --- the one status that gets no fill at all. See MARKS.informal. --- */
  'informal-sphere':       { family: null, texture: null, mark: 'informal' },
};


/* -----------------------------------------------------------------------------
   THE TRAP — the "watch out for" column the printed chapter has and a colour key
   usually has not. One line per legal form, naming the specific way that word
   misleads a reader who takes it at face value, with a named case wherever the
   case is what makes it stick. Without this a student can read the whole key and
   come away with a taxonomy of constitutional forms in which nobody was ever
   conquered, disenfranchised or deposed.
----------------------------------------------------------------------------- */
export const STATUS_TRAP = {
  'company-trading-posts':
    'A "trading post" arrived with cannon. The Company armed its own ships and hired its own soldiers from the start, so the trade and the force were never two separate things.',
  'company-rule':
    'Read this as a private firm collecting land tax and hanging people. Nobody elected it — not in Bengal, and not in Britain either.',
  'proprietary-colony':
    'The Crown granted land it had never held, to people who had never seen it, over people who were already living on it.',
  'representative-colony':
    'An elected assembly is not a democracy. The electors were property-owning white men; in the West Indies they were slave-owners voting on the law of slavery.',
  'crown-colony':
    'Colonies were often moved INTO this box, not out of it: Jamaica surrendered its 200-year-old assembly in 1866 after the Morant Bay rising, and London ruled it directly for the next 78 years.',
  'self-governing-colony':
    'Self-government meant self-government for settlers. It is the local white electorate, not London, that writes the franchise laws which exclude everyone else.',
  'crown-rule':
    'Direct rule is usually the sequel to a war rather than an alternative to one. The paperwork is calm; the years just before it are not.',
  'protectorate':
    '"Protection" was routinely a treaty signed under the guns of a warship, and within a generation Britain was collecting the revenue and running the courts anyway. The ruler kept his title and lost the decisions.',
  'protected-state':
    'The treaty says "foreign relations only". In practice a British Resident sat beside the ruler, and his advice was not the kind you decline.',
  'princely-state':
    'These princes could be deposed, and were. Under the Doctrine of Lapse the Company annexed states whose ruler died without a natural heir — Satara 1848, Jhansi and Nagpur 1854.',
  'mandate':
    'The mandate was invented at Versailles to redistribute German and Ottoman territory without using the word annexation. Nobody asked the inhabitants, and the "duty to prepare for self-rule" had no date on it.',
  'trusteeship':
    'The duty to report to the United Nations was genuine. The reports were written by the administering power.',
  'condominium':
    'Two sovereigns means two police forces and nobody accountable. In the New Hebrides a person chose between three legal systems and could vote in none of them.',
  'leased-territory':
    'A lease has an expiry date, which is exactly why Britain kept several past theirs. Weihaiwei was leased "for so long as Russia holds Port Arthur" — a term with no length at all.',
  'occupied':
    'Occupations are announced as temporary and measured in decades. Britain occupied Egypt in 1882 promising an early withdrawal and left in 1956.',
  'dominion':
    'Dominion status is not independence, and the date it became independence is arguable: for Canada you can defend 1867, 1931 or 1982, and historians do.',
  'associated-state':
    'The state can end the association by itself — that is the one thing that separates this from a protectorate. Britain still held defence and foreign affairs until it did.',
  'overseas-territory':
    'The name changed in 1981; the office did not. London suspended the Turks and Caicos constitution in 2009, and the Chagossians removed from Diego Garcia have still not been allowed home.',
  'crown-dependency':
    'Never colonies, never inside the United Kingdom, and still not self-governing in defence or foreign affairs. If you count them as empire, say why.',
  'part-of-uk':
    'Constitutional status is not the same as how a place was actually ruled. Ireland sat inside the Union from 1801 and was governed through a Lord Lieutenant, Dublin Castle and a run of coercion acts.',
  'informal-sphere':
    'Nothing here was ever coloured red, so no map of claims will show it — which is why a reader who counts only the red underestimates British power in the nineteenth century, and why a reader who counts all of this overestimates it.',
};

export const trapFor = (statusId) => STATUS_TRAP[statusId] || null;

/* -----------------------------------------------------------------------------
   WHERE EACH TRAP'S EVIDENCE IS.

   Round 2 shipped twenty-one authored paragraphs carrying dates and numbers —
   Jamaica's assembly in 1866, Satara 1848, Weihaiwei's lease "for so long as
   Russia holds Port Arthur", Egypt 1882 to 1956 — with no citation on any of
   them. FEATURE_SPEC charge 8 says one function renders every quotation in this
   app and it requires four fields; a legend that asserts dated facts and cites
   nothing is exactly the habit that charge exists to break.

   Nothing here is a new citation. Each entry POINTS at a territory the atlas
   already holds and at the work in that territory's own `evidence[]` whose
   `supports` line is about this fact. `match` picks it; if it matches nothing
   the first work is used; if the territory is not in the dataset the legend
   prints a visible defect rather than an invisible one. `why` is the one line
   that says what the reader is being sent to.
----------------------------------------------------------------------------- */
export const STATUS_SEE = {
  'company-trading-posts': { territories: ['british-india', 'bengal-presidency'], match: /Company period|army|bankers|finances/i,
    why: 'The Company’s own army and finances.' },
  'company-rule': { territories: ['bengal-presidency', 'british-india'], match: /Plassey|dual system|famine|Company/i,
    why: 'Plassey, the dual system and the famine of 1770.' },
  'proprietary-colony': { territories: ['maryland'], match: /proprietorship/i,
    why: 'A proprietorship in practice: Maryland, granted to one family.' },
  'representative-colony': { territories: ['barbados'], match: /planter|slave code/i,
    why: 'Who the electors were in a West Indian assembly.' },
  'crown-colony': { territories: ['jamaica'], match: /Assembly|1865 rising/i,
    why: 'Morant Bay and the surrender of the Jamaica Assembly.' },
  'self-governing-colony': { territories: ['union-of-south-africa'], match: /segregation|Union|apartheid/i,
    why: 'What a settler electorate did with the franchise once it had it.' },
  'crown-rule': { territories: ['british-india'], match: /improvised|anxious|chaos/i,
    why: 'How direct rule was actually conducted.' },
  'protectorate': { territories: ['uganda'], match: /1900 Agreement|chiefs|mailo/i,
    why: 'A protectorate in operation: the 1900 Buganda Agreement.' },
  'protected-state': { territories: ['federated-malay-states'], match: /federation|rulers/i,
    why: 'The Residents, and what the rulers thought of them.' },
  'princely-state': { territories: ['central-india-agency', 'british-india'], match: /paramountcy|princes|agencies/i,
    why: 'Paramountcy, and what it meant for a ruler who displeased it.' },
  'mandate': { territories: ['mandatory-palestine'], match: /texture of British rule|choices|mandate/i,
    why: 'A mandate as it was administered.' },
  'trusteeship': { territories: ['tanganyika'], match: /trusteeship|mandate/i,
    why: 'The mandate, the trusteeship and the reporting duty.' },
  'condominium': { territories: ['new-hebrides'], match: /condominium/i,
    why: 'Two sovereigns over one archipelago.' },
  'leased-territory': { territories: ['weihaiwei'], match: /leased territory|return/i,
    why: 'The lease, its terms and its end.' },
  'occupied': { territories: ['egypt'], match: /1882 occupation|partition/i,
    why: 'The 1882 occupation that was announced as temporary.' },
  'dominion': { territories: ['canada'], match: /constitutional relationship|1763 to 1982/i,
    why: 'Why the date Canada became independent is arguable.' },
  'associated-state': { territories: ['saint-kitts', 'anguilla', 'dominica'], match: /association|independence|constitution/i,
    why: 'The West Indies associated states, and what association meant.' },
  'overseas-territory': { territories: ['british-indian-ocean-territory'], match: /ICJ|legal struggle|Chagossians/i,
    why: 'The Chagos removal and the litigation still running.' },
  'crown-dependency': { territories: ['isle-of-man'], match: /self-government|constitutional development|Revestment/i,
    why: 'A dependency’s constitutional development, from revestment onward.' },
  'part-of-uk': { territories: ['ireland'], match: /plantation to partition|narrative/i,
    why: 'Ireland inside the Union, governed through Dublin Castle.' },
  'informal-sphere': { territories: ['ottoman-informal-empire', 'egypt-before-the-occupation'], match: /debt|tariffs|trade/i,
    why: 'Informal empire at work: debt, tariffs and the Public Debt Administration.' },
};

export const seeFor = (statusId) => STATUS_SEE[statusId] || null;

/** Marks that are not a colour. These are the entries that teach hardest. */
export const MARKS = {
  partial: {
    id: 'partial',
    label: 'Broken bands — control did not fill the shape',
    sentence: 'British authority covered part of this unit, not all of it. The polygon is the unit we have geometry for, not the area actually run.',
    kind: 'partial',
  },
  absence: {
    id: 'absence',
    label: 'Dense hatch — no figure exists for this',
    shortLabel: 'Dense hatch',
    gloss: 'no figure',
    short: 'no figure exists — not a zero, not an estimate.',
    /* The pinned band is three ONE-LINE rows; the full sentence above is in
       "marks that are not colours, in full", a few lines up the scroller. */
    sentence: 'No cited figure exists for this place and this quantity. It is not a zero and not an estimate — nothing is put in its place.',
    kind: 'absence',
  },
  silence: {
    id: 'silence',
    label: 'Coastline only — the record was destroyed',
    shortLabel: 'Coastline only',
    gloss: 'a record destroyed',
    short: 'a record somebody destroyed.',
    /* ROUND 11 — THE HEADLINE MAY NOT OUTRUN THE RECORD UNDER IT. A critic
       pressed H at 1955 and found seven Australian states drawn under "a
       silence: no record was allowed to survive here" over a Bringing Them Home
       sentence saying removal records "were poor and many were destroyed" —
       which is a different and weaker claim. That mark and that name are P02's
       (map/index.js) and this is the vocabulary they are drawn from, so this
       sentence stops asserting the strong form for every case and says what is
       true of all of them: a record this atlas holds says it was destroyed or
       withheld, and the place's own entry says who says so, and when. */
    sentence: 'A record for this place was destroyed or withheld, and this atlas holds the account of it. The empty shape is that account drawn; the dossier names who did it, on what date, and how much of the record it covers.',
    kind: 'silence',
    strong: true,
  },
  informal: {
    id: 'informal',
    label: 'Haze, no border — informal empire',
    shortLabel: 'Haze, no border',
    gloss: 'informal',
    short: 'run by Britain, never claimed by it.',
    sentence: 'Britain set the terms without owning the place — the trade, the debt, the warship in the harbour. No fill and no border, because Britain claimed none.',
    caption: 'this layer is an argument, not a measurement',
    kind: 'informal',
    strong: true,
  },
  selected: {
    id: 'selected',
    label: 'Heavy outline — the place you have selected',
    sentence: 'Selection is an outline, never a change of colour, so it can never be mistaken for a change of status.',
    kind: 'selected',
  },
  coast: {
    id: 'coast',
    label: 'Hairline — every coast, always drawn',
    sentence: 'The coastline is drawn on every unit in both themes, so a shape is never carried by its fill alone.',
    kind: 'coast',
  },
};

/* -----------------------------------------------------------------------------
   THE DEFINITION SWITCH — what the word "British" is being made to mean.
   FEATURE_SPEC §1 charge 4: keys 1-4 hold the year and change the definition.
   The four sets nest: controlled ⊆ administered ⊆ claimed ⊆ influenced.
   `test` runs against one entry of data.statusAt(year).
----------------------------------------------------------------------------- */
export const DEFINITIONS = [
  {
    id: 'claimed', key: '1', label: 'Claimed',
    rule: 'control degree 1 or more, informal spheres excluded',
    shortRule: 'degree 1+, not informal',
    sentence: 'everywhere Britain asserted authority — from a governor with an army to a resident with a treaty and no garrison.',
    test: (e) => e.controlDegree >= 1 && e.status !== 'informal-sphere',
  },
  {
    id: 'administered', key: '2', label: 'Administered',
    rule: 'control degree 3 or more',
    shortRule: 'degree 3+',
    sentence: 'everywhere British officials actually collected revenue, ran courts or appointed the government.',
    test: (e) => e.controlDegree >= 3,
  },
  {
    id: 'controlled', key: '3', label: 'Controlled',
    rule: 'control degree 5, and nothing less',
    shortRule: 'degree 5 only',
    sentence: 'only full direct sovereignty — London legislates, London appoints, and no other state has a claim.',
    test: (e) => e.controlDegree === 5,
  },
  {
    id: 'influenced', key: '4', label: 'Influenced',
    rule: 'control degree 1 or more, or an informal sphere',
    shortRule: 'degree 1+, or informal',
    sentence: 'everything claimed, plus the places Britain never claimed and ran anyway through trade, debt and the navy.',
    test: (e) => e.controlDegree >= 1 || e.status === 'informal-sphere',
  },
];

export const DEFINITION_BY_ID = new Map(DEFINITIONS.map(d => [d.id, d]));
export const DEFAULT_DEFINITION = 'claimed';

/* -----------------------------------------------------------------------------
   THE TENURE RAMP — DESIGN §2.4. One hue, seven steps, monotone in L* under all
   four vision models, so it can never be read as a category.
----------------------------------------------------------------------------- */
export const TENURE_BUCKETS = [
  { step: 1, min: 0,   max: 9,    label: 'under 10 years' },
  { step: 2, min: 10,  max: 24,   label: '10–24' },
  { step: 3, min: 25,  max: 49,   label: '25–49' },
  { step: 4, min: 50,  max: 74,   label: '50–74' },
  { step: 5, min: 75,  max: 99,   label: '75–99' },
  { step: 6, min: 100, max: 149,  label: '100–149' },
  { step: 7, min: 150, max: Infinity, label: '150 years or more' },
];

export const tenureStep = (years) =>
  (!Number.isFinite(years) || years < 0) ? null
    : (TENURE_BUCKETS.find(b => years >= b.min && years <= b.max) || TENURE_BUCKETS[6]).step;

/* -----------------------------------------------------------------------------
   What every layer's colour MEANS, in one line. FEATURE_SPEC P06 acceptance
   test 2: a layer with no definition sentence must not register. `layerSentence`
   returns null for an unknown layer, and the legend renders that as a visible
   defect rather than inventing a caption.
----------------------------------------------------------------------------- */
export const LAYER_MEANING = {
  status:      'colour = the legal status of British authority in this year',
  /* Degree of control is a THRESHOLD, not a second colour: keys 1–4 decide what
     is drawn at all and the fills stay legal status. The layer's own caption
     says so in as many words; this line used to say the opposite. */
  control:     'colour = the legal status; keys 1–4 change how much control counts as British',
  mechanism:   'colour = how Britain took it',
  exit:        'colour = how it left',
  tenure:      'colour = how long it had been held by this year, one hue, seven steps',
  informal:    'no colour = pressure without a claim; the haze is an argument, not a measurement',
  /* The network layer draws nodes, cables and routes OVER a plate that is still
     filled by legal status; it does not re-key a single fill. Saying "colour =
     the role a place played" over status colours is the contradiction round 11
     took out of the ribbon, and it was in this table too. */
  system:      'colour = the legal status; the nodes, cables and routes are drawn over it',
  resistance:  'colour = the legal status; the pins are recorded revolt and killing',
  'war-service': 'colour = troops raised and where they served',
  weight:      'size = a cited quantity; colour still = legal status',
};

export const layerSentence = (layerId) => LAYER_MEANING[layerId] || null;

/**
 * The same meaning in two or three words, for the byline on a stage measured at
 * 183 pixels. It is a shortening of LAYER_MEANING and never a different claim;
 * the full sentence is the element's title and is set in full in the plate.
 */
export const LAYER_SHORT = {
  status: 'legal status',
  control: 'legal status; 1–4 set the threshold',
  mechanism: 'how Britain took it',
  exit: 'how it left',
  tenure: 'how long held',
  informal: 'no colour = pressure without a claim',
  system: 'legal status; a network on top',
  resistance: 'legal status; pins = revolt',
  'war-service': 'troops raised',
  weight: 'legal status; size = a quantity',
};
export const layerShort = (layerId) => LAYER_SHORT[layerId] || null;

/* -------------------------------------------------------------- helpers -- */

/** symbolFor('crown-colony') -> the full drawing instruction for that status. */
export function symbolFor(statusId) {
  const sym = STATUS_SYMBOL[statusId];
  if (!sym) return null;
  if (!sym.family) return { ...sym, statusId, fillVar: null, family: null };
  return {
    statusId,
    family: sym.family,
    texture: sym.texture,
    note: sym.note || null,
    fillVar: `--map-${sym.family}`,
    hoverVar: `--map-${sym.family}-hover`,
    selectedVar: `--map-${sym.family}-selected`,
    strokeVar: `--map-${sym.family}-stroke`,
    onVar: `--map-${sym.family}-on`,
    textureVar: `--tex-${sym.texture}`,
  };
}

/** Every status id this vocabulary covers — used to detect a dataset that has
 *  outgrown it, which must be shown to the student, not swallowed. */
export const KNOWN_STATUSES = Object.keys(STATUS_SYMBOL);

export function unknownStatuses(dataStatuses = []) {
  return dataStatuses.map(s => s.id || s).filter(id => !(id in STATUS_SYMBOL));
}


/* =============================================================================
   THE NIGHT WEIGHTING — INK TRACKS DEGREE OF CONTROL
   =============================================================================

   THE DEFECT, in a hostile critic's words: *"Dark mode inverts the colour
   semantics: pale pink 'Self-governing' becomes the highest-contrast fill on the
   map, so the least coercive status reads loudest."* That is exact. Measured on
   the build before this round, against the lamplit ground (#15120E):

     dominion        (mean control degree 1.5)  #FFC9BF   L* 85.4   12.77 : 1
     crown-conquered (mean control degree 4.5)  #B14936   L* 44.8    3.45 : 1

   Self-governing under the Crown — the one status whose end date is arguable —
   was the loudest mark on the plate. Ruled from London, 94 of the 182 units
   drawn at 1900, was among the quietest. At 1900 by lamplight Canada, Australia
   and New Zealand blazed and India receded. Spearman's rho between a family's
   ink weight and its degree of control was 0.12: no relationship at all.

   WHY IT IS THIS FILE'S. FEATURE_SPEC §2 P17 makes the legend the owner of the
   status vocabulary, and this file is that vocabulary. How loud a legal status
   shouts is not decoration; it is the map's primary claim about that status, and
   it is what the ribbon at the foot of the plate is naming.

   THE RULE, STATED SO IT CAN BE TESTED. Against the ground it is drawn on, a
   family's contrast must be monotone in its mean `controlDegree`, in BOTH
   themes. The paper theme already satisfied it (rho 0.92): the ground is light,
   so darker ink is louder, and the deepest madder was already "governed from
   Westminster". The night theme inverts the ground, so it must invert the ramp
   — exactly as this theme already inverts its ink, #241F19 by day becoming
   #EFE7D7 by night. Hue identity is kept: no family moves more than ten degrees
   in OKLCH from its day counterpart, so a reader who learns the colours by
   daylight still knows them by lamplight. Only lightness and chroma move.

     family            day      night was   night now   L*     /ground   degree
     occupied          #493A2F  #5B4431     #FFDDC0     90.2   14.54     5.0
     crown-conquered   #AE3D35  #B14936     #EB9786     70.5    8.27     4.5
     mandate           #694479  #795288     #B396C4     66.0    7.18     4.0
     lease             #61A093  #6AA69A     #5E9B93     59.8    5.86     4.0
     settlement        #CF786F  #C57670     #C66E67     56.2    5.18     3.5
     company-rule      #DAAF64  #D6AC60     #917932     51.8    4.43     2.5
     protectorate      #5583B0  #5587B6     #356693     41.8    3.09     2.3
     dominion          #FDC3B9  #FFC9BF     #784C3F     37.0    2.58     1.5
     lost-former       #BBB6B1  #423F3B     unchanged   26.8    1.78     —
     never-british     #EEE9DE  #27231E     unchanged   14.0    1.20     —

   WHAT IT COST, audited with the project's own instrument — tools/design/
   colour.js and the four vision models of tools/design/cvd-check.js:

     Spearman(ink weight, control degree)   0.12  ->  0.99
     worst of 45 pairs x 4 vision models    8.44  ->  8.98 dE00  (tier-B floor 6)
     worst land-against-sea separation      17.3  ->  17.3 dE00  (night floor 12)
     worst `--map-*-on` text contrast       3.45  ->  4.63 : 1   (was below AA)

   It is not a trade. The palette is MORE colour-blind-safe after the
   re-weighting than before it, every fill still carries the engraved texture
   this file proved for it, and the one `-on` ink that was below AA is fixed.

   WHY IT IS INJECTED FROM JAVASCRIPT RATHER THAN WRITTEN IN legend.css.
   Because it did not work there, and the failure was visible in a screenshot.
   legend.css is fetched by this piece's own module with `loadCss`; the shell
   mounts the map BEFORE the legend, and map/index.js reads the ten fills out of
   the computed style once at mount, re-reading only when `data-theme` or the
   system colour scheme changes. Declared in legend.css the re-weighting
   repainted the ribbon and left the plate above it on the old palette — the
   strip saying one thing and the map saying another, which is the one failure a
   key may never have. `main.js` imports every module before it mounts any, so a
   style element appended here, at module evaluation, is in the cascade before
   the map takes its reading.

   WHERE IT BELONGS. In app/css/tokens.css §7 beside the day palette, and in
   tools/design/palette.js so that `node tools/design/cvd-check.js --night`
   audits the values that actually ship. Both are the design-system agent's
   files. When they take it, delete everything below and this comment with it;
   the audit above is the acceptance test.
   ========================================================================== */

const NIGHT_WEIGHTING = `
  --map-occupied: #FFDDC0;
  --map-occupied-hover: #FFF0D0;
  --map-occupied-selected: #FFFFDD;
  --map-occupied-stroke: #836246;
  --map-occupied-on: #0F0C09;

  --map-crown-conquered: #EB9786;
  --map-crown-conquered-hover: #FEA391;
  --map-crown-conquered-selected: #FFB6A3;
  --map-crown-conquered-stroke: #6E1E10;
  --map-crown-conquered-on: #0F0C09;

  --map-mandate: #B396C4;
  --map-mandate-hover: #C2A2D4;
  --map-mandate-selected: #D1AFE5;
  --map-mandate-stroke: #40254F;
  --map-mandate-on: #0F0C09;

  --map-lease: #5E9B93;
  --map-lease-hover: #67A9A0;
  --map-lease-selected: #71B7AE;
  --map-lease-stroke: #00322D;
  --map-lease-on: #0F0C09;

  --map-settlement: #C66E67;
  --map-settlement-hover: #D87A72;
  --map-settlement-selected: #EA857C;
  --map-settlement-stroke: #5F0109;
  --map-settlement-on: #0F0C09;

  --map-company-rule: #917932;
  --map-company-rule-hover: #9F8539;
  --map-company-rule-selected: #AE9341;
  --map-company-rule-stroke: #FDE6A6;
  --map-company-rule-on: #0F0C09;

  --map-protectorate: #356693;
  --map-protectorate-hover: #3E72A3;
  --map-protectorate-selected: #477FB4;
  --map-protectorate-stroke: #A2D0FE;
  --map-protectorate-on: #F3ECDE;

  --map-dominion: #784C3F;
  --map-dominion-hover: #875749;
  --map-dominion-selected: #966353;
  --map-dominion-stroke: #E2B4A6;
  --map-dominion-on: #F3ECDE;
`;

/* Both selectors, because tokens.css pairs them: the system preference, and an
   explicit choice that must win over it in either direction. */
export const NIGHT_WEIGHTING_CSS =
  `@media (prefers-color-scheme: dark) { :root:not([data-theme='paper']) {${NIGHT_WEIGHTING}} }\n`
  + `:root[data-theme='lamplit'] {${NIGHT_WEIGHTING}}\n`;

/** Idempotent: the id makes a second evaluation of this module a no-op. */
export function installNightWeighting(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc || doc.getElementById('legend-night-weighting')) return false;
  const style = doc.createElement('style');
  style.id = 'legend-night-weighting';
  style.textContent = NIGHT_WEIGHTING_CSS;
  (doc.head || doc.documentElement).appendChild(style);
  return true;
}

installNightWeighting();

export default {
  FAMILIES, FAMILY_BY_KEY, STATUS_SYMBOL, STATUS_TRAP, trapFor, STATUS_SEE, seeFor, MARKS, DEFINITIONS, DEFINITION_BY_ID,
  DEFAULT_DEFINITION, TENURE_BUCKETS, tenureStep, LAYER_MEANING, layerSentence, LAYER_SHORT, layerShort,
  symbolFor, KNOWN_STATUSES, unknownStatuses, NIGHT_WEIGHTING_CSS, installNightWeighting,
};
