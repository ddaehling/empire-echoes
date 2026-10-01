/* =============================================================================
   layers/catalog.js — WHAT MAY BE DRAWN, AND WHAT EACH DRAWING CLAIMS.
   Owner: P06 (thematic layers). FEATURE_SPEC §2 P06.

   THE LAW THIS FILE EXISTS TO ENFORCE, from the piece's own brief:
   *a layer with no definition must not be registrable.* So a layer is not a
   string in a switch statement. It is a record that has to carry, before the
   registry will accept it:

     · `sentence`  what the colour (or the mark) means, in one line, in the
                   same words the legend prints. P17 owns the vocabulary for
                   the ten spine layers and publishes it as LAYER_MEANING; for
                   the four this piece adds, the sentence is written here and
                   is the only place it is written.
     · `byline`    what is being MEASURED and where the figure comes from —
                   author, work, year. A re-encoding without a byline is a
                   fresh lie, which is exactly what this piece was created to
                   prevent.
     · `caption`   the honest caveat. What this drawing cannot tell you.
     · `group`     where it sits in the chooser, so thirteen encodings are
                   four short lists and not a menu.

   `assertLayer()` at the foot of this file throws on any record missing one of
   those. Nothing registers by accident.

   ON COLOUR. docs/DESIGN.md §2 proves TEN fills, each paired with ONE engraved
   texture, separable under normal vision and three dichromacies. This file
   invents no colour and no texture: every category borrows a whole audited
   (fill, texture) PAIR by naming its palette key. Two categories in one layer
   are therefore exactly as separable as the two statuses they borrow from —
   proved, not asserted. It also means a layer may carry at most ten
   categories. Where the dataset carries more than ten — the fourteen
   acquisition mechanisms — the plate paints the families and the sheet names
   every one of the fourteen with its count. The grouping is printed, not
   hidden, because a fold a reader cannot see is a lie about the data.
   ========================================================================== */

/* -------------------------------------------------------------------- groups */

export const GROUPS = [
  { id: 'held', label: 'How Britain held it',
    note: 'Three readings of the same year: what the law called it, how much authority Britain actually had, and how long it had been held.' },
  { id: 'edges', label: 'How it was taken, who from, and how it ended',
    note: 'The two ends of a colony, and the party on the other side of the first one. None is on the map by default, and all three are what students are asked about in exams.' },
  { id: 'work', label: 'What it was for, and who paid',
    note: 'Empire moved people, and it starved some of them. These three layers paint the record this atlas holds, and are quiet where it holds none.' },
  { id: 'hidden', label: 'What a coloured map hides',
    note: 'Pressure without a flag, a network of dots that does not look like an empire, revolt, and size that means people instead of land.' },
];

/* ------------------------------------------------------- category tables --- */
/* Every `key` below is a palette key from docs/DESIGN.md §2.2 and carries that
   key's audited fill AND its audited texture. `word` is what the key prints. */

/** ACQUISITION — the fourteen mechanisms in the dataset, folded onto nine
 *  audited (fill, texture) pairs. `members` is printed in the sheet. */
export const MECHANISM_FAMILIES = [
  { id: 'force', key: 'crown-conquered', word: 'taken by force',
    members: ['conquest', 'occupation'],
    gloss: 'An army or a fleet took it, and the record says so.' },
  { id: 'war-spoil', key: 'occupied', word: 'won at the end of a war',
    members: ['war-transfer'],
    /* Not "from another empire" and not only European: Nepal and Bhutan are
       in this family too. The gloss says what is true of all sixteen. */
    gloss: 'Transferred by treaty when a war ended — at a European peace conference, or by a defeated state signing under the guns. The people living there attended neither.' },
  { id: 'paper', key: 'lease', word: 'ceded, bought or leased',
    members: ['treaty-cession', 'purchase', 'lease'],
    gloss: 'A signature, a price or a term of years. Often signed under the guns that had just arrived.' },
  { id: 'declared', key: 'protectorate', word: 'declared a protectorate',
    members: ['protectorate-declared'],
    gloss: 'Britain announced protection over a state that went on existing, and took the foreign policy and the customs revenue.' },
  { id: 'awarded', key: 'mandate', word: 'awarded by a conference',
    members: ['mandate', 'trusteeship', 'condominium'],
    gloss: 'The League of Nations, the United Nations, or a shared administration with another power.' },
  { id: 'settled', key: 'settlement', word: 'settled on land already lived in',
    members: ['settlement'],
    gloss: 'Colonists arrived and stayed. The people already there are named in the dossier, and in the counterparties of the acquisition record.' },
  { id: 'company', key: 'company-rule', word: 'taken by a chartered company',
    members: ['chartered-company'],
    gloss: 'A private firm with a charter, a flag and an army: the Company empire, and the shareholders who ran it.' },
  { id: 'relabel', key: 'dominion', word: 're-labelled, not newly taken',
    members: ['annexation-of-existing-colony'],
    gloss: 'Ground Britain already held, put under a new name or a new office. Nothing changed hands; a great deal changed on paper.' },
  { id: 'informal', key: 'informal', word: 'never claimed at all',
    members: ['informal-influence'],
    gloss: 'Influence without a flag. Drawn with no fill and no border, because that is the content.' },
];

/**
 * WHO WAS ON THE OTHER SIDE — the eight kinds of counterparty in this dataset.
 *
 * WHY THIS TABLE EXISTS. Round 3 capped the whole artefact at 40 over one
 * sentence: nine acquisition records whose losing party is Tipu Sultan’s
 * Mysore, the Maratha confederacy, the Lahore Durbar, the Konbaung kingdom,
 * Nepal or Bhutan were being headlined, in the app’s own vocabulary, as
 * “handed over by another European power”. This plate carried its own
 * version of the same error. Neutralising a gloss removes the sentence; it does
 * not remove the vantage point that produced it, which is DIDACTIC_SPEC M17 —
 * “empire is a British story, about what Britain did” — and which
 * a layer called HOW BRITAIN TOOK IT reproduces by construction, however
 * carefully its nine words are written.
 *
 * So the atlas gains the reading that turns the question round. Every one of
 * the 469 acquisition records in this dataset names at least one counterparty,
 * with a `kind` from a controlled vocabulary of eight and a `lost` clause in
 * its own words. Nothing in the app drew that field. It is drawn here: the
 * plate is painted by the FIRST party each record names, the unit’s own label
 * on the plate carries that party’s name, and the sheet counts the eight and
 * lists the parties actually on the map this year.
 *
 * ONE WARNING, PRINTED IN THE LAYER’S OWN CAVEAT AND REPEATED HERE FOR
 * WHOEVER EDITS THIS FILE: `empire` holds the Mughals, the Ottomans and Qing
 * China alongside Russia, Spain, Germany and Italy. This is NOT a
 * European / non-European split and must never be folded into one. The eight
 * kinds are drawn as the dataset writes them, and the reader is told what the
 * vocabulary can and cannot carry.
 */
export const COUNTERPARTY_KINDS = [
  { id: 'european-power', key: 'occupied', word: 'another European power',
    gloss: 'A European state or its colonial administration — France, Spain, the Dutch republics, Denmark. Mostly islands, mostly changing hands at a peace conference: Paris 1763, Amiens 1802, Paris 1814, Vienna 1815.' },
  { id: 'empire', key: 'mandate', word: 'another empire',
    gloss: 'A state the record calls an empire. Read the names before you read the colour: this category holds the Mughal empire, the Ottoman empire and Qing China alongside Russia, Spain, Germany and Italy. It is not a European category and it is not a non-European one.' },
  { id: 'regional-state', key: 'crown-conquered', word: 'a regional state, or its ruler',
    gloss: 'A state with a ruler Britain negotiated with or defeated — Tipu Sultan’s Mysore, Daulat Rao Scindia of Gwalior, the Lahore Durbar, the Konbaung kingdom, Nepal, Bhutan, Asanteman, Egypt. Nine of them are war settlements that a map drawn from London files as “handed over by another European power”. They were not: the states named here lost them, and they are on this plate under their own names.' },
  { id: 'indigenous-polity', key: 'protectorate', word: 'an Indigenous state or confederacy',
    gloss: 'A polity of the people already there: the Basotho kingdom under Moshoeshoe I, the Gaelic lordships of Ulster, the Bemba, Ngoni, Lunda and Tonga polities, the Griqua under Adam Kok III. A state the record names, whether or not Britain recognised it as one.' },
  { id: 'indigenous-people', key: 'settlement', word: 'people already living there',
    gloss: 'People the record names without naming a state: the Kalinago and Arawak of the eastern Caribbean, Aboriginal and Torres Strait Islander peoples, the Naga, Lushai, Garo, Khasi and Abor peoples. Being unrecognised as a state was, repeatedly, the ground on which land was taken.' },
  { id: 'chartered-company', key: 'company-rule', word: 'another chartered company',
    gloss: 'A private firm with a charter and an army — the Dutch and French East India Companies, the Hudson’s Bay Company, the North West Company. Ground that passed between shareholders before it passed between states (T6).' },
  { id: 'other', key: 'lease', word: 'another party the record names',
    gloss: 'The party whose position changed fits none of the seven above: Bengali landholders, weavers and peasants; the Acadians; Argentine manufacturers and provincial economies; Egyptian peasants; Kenya’s Indian population. A small category, and usually the most specific clause on the plate. The record’s own words are in the dossier.' },
  { id: 'no-resident-population', key: 'dominion', word: 'the record names nobody living there',
    gloss: 'The acquisition record names no prior population. Two of these date the claim in their own wording — “no resident population in 1788”, “in 1790” — because the honest answer depends on the year being asked about. An empty island is a fact about a date, not about a place.' },
  { id: 'none', mode: 'absence', word: 'no counterparty named in the record',
    gloss: 'Drawn as bare ground. Every acquisition record in this atlas currently names at least one party, so this row should read zero at every year; if it ever does not, a record has shipped without the field this reading is made of.' },
];

/** DEPARTURE — nine mechanisms, one audited pair each, plus a tenth state for
 *  a place that has not ended. The three madder shades are used as a ladder of
 *  violence, so the palette's own order teaches: pale = negotiated, mid =
 *  fought then negotiated, deep = fought out. */
export const EXIT_CATEGORIES = [
  { id: 'negotiated-independence', key: 'dominion', word: 'negotiated independence',
    gloss: 'A date, a flag and a constitution, agreed. Usually after decades of refusal.' },
  { id: 'insurgency-then-negotiation', key: 'settlement', word: 'insurgency, then a settlement',
    gloss: 'Britain fought first and negotiated after: Malaya, Cyprus, Kenya.' },
  { id: 'war-of-independence', key: 'crown-conquered', word: 'war of independence',
    gloss: 'It was taken back by force, or Britain was driven out.' },
  { id: 'transfer-to-another-power', key: 'occupied', word: 'handed to another power',
    gloss: 'Ceded, swapped or surrendered to another empire or state. The people living there were not asked.' },
  { id: 'merger-into-neighbour', key: 'lease', word: 'merged into a neighbour',
    gloss: 'Absorbed by a larger state, sometimes its own federation, sometimes not.' },
  { id: 'partition', key: 'mandate', word: 'partitioned',
    gloss: 'It left as more than one state, along a line drawn for the occasion.' },
  { id: 'referendum', key: 'protectorate', word: 'settled by a vote',
    gloss: 'A plebiscite decided where it went. Who was allowed to vote is the question to ask.' },
  { id: 'lease-expiry', key: 'company-rule', word: 'the lease ran out',
    gloss: 'The clock finished. Hong Kong’s New Territories, 1997.' },
  /* NOT `never-british`. That fill is the palest thing in the palette and the
     ground of the plate is the same cream, so at 1860 the still-British
     territories were invisible against the continents. `lost-former` is a mid
     grey with its own hatch and is used by P02 for a place held once and not
     now — a different fact, and never on this plate at the same time as this
     category, because on this layer every drawn unit is keyed by its exit. */
  { id: 'still-a-territory', key: 'lost-former', word: 'has not ended',
    gloss: 'Still British today. Fourteen Overseas Territories, and the argument about them is live.' },
];

/** SLAVERY — three states of law, in time, over the places whose record in
 *  this atlas names enslavement. The order is the T5 order and the whole point
 *  is that the three dates are not one date. */
export const SLAVERY_STATES = [
  { id: 'trade', key: 'crown-conquered', word: 'the British slave trade is legal here',
    gloss: 'Before the Slave Trade Act. British ships are landing enslaved people at this place, lawfully.' },
  { id: 'traded-banned', key: 'settlement', word: 'trade banned — slavery continues',
    gloss: 'After abolition of the trade and before emancipation. The people already enslaved stayed enslaved.' },
  { id: 'after', key: 'dominion', word: 'slavery ended here',
    gloss: 'After the emancipation date in this record. In most British colonies that is 1834 in law and 1838 in fact, after four years of unpaid “apprenticeship”.' },
  { id: 'undated', key: null, mode: 'absence', word: 'enslavement recorded, no date held',
    gloss: 'This atlas records enslaved people here and holds no abolition or emancipation date for the place. Drawn as bare ground, never as a colour and never as a zero.' },
];

/** WHO WAS MADE TO WORK HERE — four kinds of coerced or assisted arrival, from
 *  `consequences.populationTransfer.kind`. A place may carry several; it is
 *  painted by the FIRST in this order, and the count of places carrying more
 *  than one is printed on the key. Movements OUT of a place — forced removal,
 *  refugee flight, emigration under famine — are in the dataset and are not
 *  painted here, because a layer that mixes arrivals and expulsions in one
 *  colour teaches neither. */
export const LABOUR_CATEGORIES = [
  { id: 'enslaved-people-transported', key: 'crown-conquered', word: 'enslavement and the trade in people',
    gloss: 'People trafficked across the Atlantic or the Indian Ocean and sold. Arrival almost everywhere on this plate; on the West African coast and in Britain, the sending end (T3).' },
  { id: 'indentured-labour', key: 'company-rule', word: 'indentured labour',
    gloss: 'Roughly 1.3 to 1.5 million people went from India alone under indenture between 1834 and 1917 — to Mauritius, the Caribbean, Fiji, Natal. Indenture began within a year of the Abolition Act.' },
  { id: 'convict-transportation', key: 'occupied', word: 'convict transportation',
    gloss: 'About 162,000 people sentenced in Britain and Ireland and shipped to Australia between 1788 and 1868, and tens of thousands to the American colonies before that. Australia is the receiving end; Britain and Ireland are the sending end.' },
  { id: 'settler-migration', key: 'settlement', word: 'settler migration',
    gloss: 'Movement to take land and stay. This is the settler half of the settler-versus-extractive distinction; the three categories above are the other half.' },
];

/** FAMINE — from `consequences.violence.kind` containing `famine-policy`, plus
 *  every event in the dataset whose kind is `famine`, drawn as a dated pin. */
export const FAMINE_CATEGORIES = [
  { id: 'famine-policy', key: 'crown-conquered', word: 'famine under British rule, recorded here',
    gloss: 'The dataset records a famine at this place whose course was shaped by British policy — exports, revenue demands, relief doctrine or wartime denial.' },
];

/** RESISTANCE — the pins. Colour on the plate marks the places whose record
 *  carries a rising or a killing; the pins are the dated events themselves. */
export const RESISTANCE_CATEGORIES = [
  { id: 'revolt', mark: 'dot', word: 'a rising, at the place it happened',
    gloss: 'An event in this atlas of kind `revolt`, dated on or before the year on the clock. Scrub forward and they accumulate; they never clear.' },
  { id: 'massacre', mark: 'x', word: 'a killing by British forces',
    gloss: 'An event of kind `massacre`. Where the count is disputed the pin prints the range and never a single number.' },
  { id: 'held', mark: 'lit', word: 'places whose record carries one',
    gloss: 'The fill is still the legal status. What changes is that everywhere with nothing recorded stands back, so the places that fought are what the eye lands on.' },
];

/* ------------------------------------------------------------ the layers --- */

/**
 * `paints`
 *   'map'     the map module already draws this reading; this piece only sets
 *             the store, says the sentence and shows the key.
 *   'fill'    this piece re-keys the plate's own paint records (see paint.js).
 *   'mark'    this piece draws over the plate and quiets what is not its
 *             subject, so the plate still changes and the legend's pixel probe
 *             can verify the change.
 *
 * `band` — THE SENTENCE THE SHELL'S ONE VOICE PRINTS, AND WHY IT IS A THIRD
 * FIELD RATHER THAN A COMPUTED ONE. `sentence` is P17's vocabulary and is
 * printed in the key and the legend; `byline` names the source and is printed
 * in the sheet. Round 2 fed the band `sentence + " — " + bylineShort`, which at
 * 390 rendered "colour = how Britain took it — Measured from 468 acquisition
 * records carrying 14…" and at 900 "…carrying 14 mechanisms." on two lines with
 * the second clipped. The band is two lines at reading size; a sentence written
 * for it is written to fit it. **Sixty-two characters is the ceiling and the
 * acceptance test asserts it**, because a sentence cut mid-word teaches
 * nothing (LAYOUT_BUDGET §4). The full byline is one control away, on the
 * band's own `cta`, on the key card's `.cx-more`, and in the sheet.
 */
export const LAYERS = [
  {
    id: 'status', group: 'held', label: 'Legal status', paints: 'map', short: 'Status',
    sentence: 'colour = the legal status of British authority in this year',
    byline: 'Measured from `statusPeriods` in this atlas: 21 legal statuses folded onto the ten audited fills of docs/DESIGN.md §2.2.',
    bylineShort: 'Measured from the legal status recorded for each place',
    band: 'colour = what the law called this place, in this year',
    caption: 'One colour per legal form. It says what the law called a place, not how much control Britain had there, and not what living there was like.',
    key: 'ribbon',
  },
  {
    id: 'control', group: 'held', label: 'Degree of control', paints: 'map', short: 'Control',
    sentence: 'colour = how much authority Britain actually had, on a 0–5 scale',
    byline: 'Measured from `controlDegree` on each status period, 0 (no British authority) to 5 (full direct sovereignty). Keys 1–4 hold the year and change the threshold.',
    bylineShort: 'Measured from `controlDegree`, 0 to 5, on each status period',
    band: 'colour = how much authority Britain really had, 0 to 5',
    caption: 'Degree is a threshold, not a second colour: it decides what is drawn at all. Hold a year and press 1, 2, 3, 4 — the year never moves and the empire changes size four times.',
    key: 'ribbon',
  },
  {
    id: 'tenure', group: 'held', label: 'How long it was held', paints: 'map', short: 'Tenure',
    sentence: 'colour = how long it had been held by this year, one hue, seven steps',
    byline: 'Measured from `since` — the first year of the unbroken run of British control this place is in, across territories, so Bengal reads 1757 and not 1858.',
    bylineShort: 'Measured from the first year of the unbroken run of British control',
    band: 'colour = how long it had been held by the year on the clock',
    caption: 'One hue, seven steps, strictly ordered, so it can never be read as a category. It measures duration up to the year on the clock, not the total a place was ever held.',
    key: 'ribbon',
  },

  {
    id: 'mechanism', group: 'edges', label: 'How Britain took it', paints: 'fill', short: 'Taken',
    sentence: 'colour = how Britain took it',
    byline: 'Measured from `acquisitions[].mechanism` in this atlas — 468 acquisition records carrying 14 mechanisms — folded onto nine audited fills. Every one of the fourteen is named and counted in the full key.',
    bylineShort: 'Measured from 468 acquisition records carrying 14 mechanisms',
    band: 'colour = how Britain took it, from 468 acquisition records',
    caption: 'The act that most recently brought this ground under British authority on or before this year. Where the record names no mechanism the ground is left bare, never coloured in.',
    predict: {
      q: 'Before this paints: was more of the map taken by an army, or by a signature?',
      choices: [
        { id: 'force', label: 'By an army — conquest and occupation' },
        { id: 'paper', label: 'By a signature — treaty, purchase or lease' },
        { id: 'settled', label: 'By settlers arriving and staying' },
        { id: 'company', label: 'By a private company with its own army' },
      ],
      /* NO TOTAL IS ASSERTED HERE. The counts move with the year on the clock,
         they are on the key one second later, and a hard-coded majority in this
         string would be a number that does not come from the dataset. */
      after: 'Count them on the key — and notice that the counts move as you scrub, so "most" has no answer until you name a year. The lesson is not which family is biggest. It is that "ceded" and "conquered" are not opposites: a cession is a document, and a document does not tell you what was in the harbour when it was signed.',
    },
    categories: MECHANISM_FAMILIES,
  },
  {
    id: 'taken-from', group: 'edges', label: 'Who it was taken from', paints: 'fill', short: 'From',
    sentence: 'colour = the party this atlas records as losing this ground',
    byline: 'Measured from `acquisitions[].counterparties[]` in this atlas. Every one of the 469 acquisition records names at least one party that lost something, with a kind from a vocabulary of eight and a clause in its own words. A place is painted by the FIRST party named on the most recent acquisition on or before the year on the clock in which ground actually changed hands — a re-labelling of ground Britain already held is skipped, because the only party it names is the British office that filed the previous paper. The other parties on the same record are in the dossier.',
    bylineShort: 'Measured from the party each acquisition record names as losing it',
    band: 'colour = who Britain took it from, not what Britain did',
    caption: 'Three things this drawing cannot tell you. First, the eight kinds are this atlas\u2019s own vocabulary and one of them is a trap: “another empire” holds the Mughals, the Ottomans and Qing China alongside Russia, Spain, Germany and Italy, so this is not a European against non-European split and reading it as one would reproduce exactly the mistake it was built to end. Second, a record names the party whose authority ended, not everyone who lost something: where a state and the people it ruled are both named, the state is named first and is what the colour shows — Assam in 1826 reads “the Konbaung kingdom”, and the Ahom kingdom and the Naga, Lushai, Garo, Khasi and Abor peoples are the second and third names on the same record. Third, one party per place is one line of a record that often runs to three. The whole list, with what each one lost, is in the dossier.',
    predict: {
      q: 'Before this paints: taken across the whole atlas, who did Britain most often take ground from?',
      choices: [
        { id: 'european-power', label: 'Other European empires — France, Spain, the Dutch' },
        { id: 'regional-state', label: 'States and rulers Britain defeated or pressured' },
        { id: 'indigenous-people', label: 'People already living there, holding no state Britain recognised' },
        { id: 'no-resident-population', label: 'Land with nobody living on it' },
      ],
      /* NO SPAN AND NO SHARE IS ASSERTED IN THIS STRING. Both are computed
         from the records at the year on the clock and printed in the sheet, so
         a retagged shard moves them and this paragraph can never go stale. */
      after: 'Now scrub, and watch the answer change. There is one stretch of this atlas in which “another European power” is the largest single group on the plate — the sheet counts its years and names the run, from the records themselves. Outside it the largest group is a state or a people Britain took ground from directly. The same block counts the European share at its highest, and whether it ever reaches a majority. That is the whole of the mistake this reading exists to end: an empire taken mostly from other Europeans would be an empire with nobody in it, and it is not what the records say.',
    },
    categories: COUNTERPARTY_KINDS,
  },
  {
    id: 'exit', group: 'edges', label: 'How it ended', paints: 'fill', short: 'Ended',
    sentence: 'colour = how it left',
    byline: 'Measured from `departures[].mechanism` — 292 departure records carrying 9 mechanisms, one audited fill each.',
    bylineShort: 'Measured from 292 departure records carrying 9 mechanisms',
    band: 'colour = how it left, from 292 departure records',
    caption: 'This colours a place by how British rule there eventually ended — a fact from after the year on the clock. It is the one layer in this atlas that tells you the future, and it is drawn on purpose that way: the pattern is the argument. And read the bare ground. About twenty places have no departure recorded here at all. Some are still British. Others — Australia, New Zealand, Canada — never had a departure to record: self-government arrived by instalments, 1867, 1901, 1907, 1931, and no single act ends the story. Meanwhile India, Kenya and Malaya each have a date. Who gets a moment of independence and who simply drifts into it is the asymmetry of T15, and here it is a hole in the map.',
    predict: {
      q: 'Before this paints: most of the empire left by one route. Which?',
      choices: [
        { id: 'negotiated-independence', label: 'A negotiated independence, on an agreed date' },
        { id: 'war-of-independence', label: 'A war Britain lost' },
        { id: 'transfer-to-another-power', label: 'Handed to another power' },
        { id: 'insurgency-then-negotiation', label: 'Fighting first, then a settlement' },
      ],
      after: 'Most places left by negotiation — and Kenya, Malaya, Cyprus, Aden and Palestine did not. Counting the majority is not the same as describing the decade: Britain fought where it thought it could win.',
    },
    categories: EXIT_CATEGORIES,
  },

  {
    id: 'slavery', group: 'work', label: 'Slavery, and its three dates', paints: 'fill', short: 'Slavery',
    sentence: 'colour = whether the British slave trade, and then slavery itself, were still lawful here in this year',
    byline: 'Measured from `consequences.slavery` in this atlas: 74 places whose record names enslavement, 44 carrying an abolition-of-the-trade date and 55 an emancipation date. Arrival figures are the Trans-Atlantic Slave Trade Database (Eltis and Richardson).',
    bylineShort: 'Measured from the abolition and emancipation dates recorded for each place',
    band: 'colour = was slavery lawful here, in this year',
    caption: 'Three dates, not one: 1807 ended the trade, 1834 ended slavery in law, 1838 ended “apprenticeship”. Scrub across them and watch the colour change twice. £20,000,000 went to the owners; £0 went to the people they had held. Places with no record here are quieted, which means this atlas holds nothing — not that nothing happened.',
    categories: SLAVERY_STATES,
  },
  {
    id: 'labour', group: 'work', label: 'People moved, and how', paints: 'fill', short: 'Labour',
    sentence: 'colour = the kind of forced or assisted movement of people this place’s record names',
    byline: 'Measured from `consequences.populationTransfer.kind` in this atlas — 134 places carrying at least one kind of movement.',
    bylineShort: 'Measured from the movement of people recorded for each place',
    band: 'colour = who was moved here, and how',
    caption: 'Two things this drawing cannot tell you. First, the dataset’s vocabulary does not record DIRECTION: for almost every colony here the movement is arrival, but for Britain and Ireland the same words mean departure — about ten million people left the United Kingdom for the empire and the United States between 1815 and 1914. Each place’s own note says which, and is printed in its dossier. Second, a place is painted by the FIRST of the four categories its record carries, in the order on the key, because one fill cannot say “both”; the number carrying more than one is on the key. Movements this layer does not paint — forced removal, refugee flight, emigration under famine — are in this atlas and are in the dossier.',
    categories: LABOUR_CATEGORIES,
  },
  {
    id: 'famine', group: 'work', label: 'Famine', paints: 'mark', short: 'Famine',
    sentence: 'colour = places where this atlas records a famine shaped by British policy; the pins are the dated famines themselves',
    byline: 'Measured from `consequences.violence.kind` containing `famine-policy`, and from every event of kind `famine`. Death ranges are printed as ranges, from the events’ own `toll`.',
    bylineShort: 'Measured from the famines this atlas records and dates',
    band: 'the pins are famines this atlas dates, with their ranges',
    caption: 'Famine under British rule was policy-shaped, not only weather: Ireland 1845–52, India 1876–78 and 1896–1902, Bengal 1943. Amartya Sen’s Poverty and Famines (1981) argues these were failures of entitlement — who could afford food — not absolute shortages of it. Nobody counted the dead at the time, so every figure here is a range with a method behind it.',
    categories: FAMINE_CATEGORIES,
    pins: 'famine',
  },

  {
    id: 'informal', group: 'hidden', label: 'Pressure without a claim', paints: 'mark', short: 'Pressure',
    sentence: 'no colour = pressure without a claim; the haze is an argument, not a measurement',
    byline: 'Places are those this atlas gives the status `informal-sphere`. The haze radius is one stated quantity — British capital invested in 1913, in nominal £ million — from Herbert Feis, Europe: The World’s Banker 1870–1914 (1930).',
    bylineShort: 'Radius = British capital invested in 1913, £m, from Feis (1930)',
    band: 'no colour = pressure without a claim, drawn as a haze',
    caption: 'This layer is an argument, not a measurement. John Gallagher and Ronald Robinson, “The Imperialism of Free Trade” (Economic History Review, 1953), argued that Britain ruled informally wherever it could and formally only where it had to. The standard objection — put most sharply by D. C. M. Platt — is that stretched far enough the concept becomes unfalsifiable: if trade counts as empire, everywhere Britain traded was empire, and the word stops dividing anything. Both are on the key. Where this atlas has no cited figure a ring is drawn and no haze, because a radius nobody can source is the same lie in a softer edge.',
    /* FEATURE_SPEC §1 charge 5 asks for this commit by name — "[PREDICT] more
       or less imperial in 1860 than in 1900?" — and round 2 shipped the haze,
       the caption and the citations without it, so the layer revealed an
       argument to a reader who had not yet taken a position on it. */
    predict: {
      q: 'Britain’s formal empire grew hugely between 1860 and 1900. Was Britain more imperial in 1900 than in 1860?',
      choices: [
        { id: 'more', label: 'More — look how much bigger the map is' },
        { id: 'same', label: 'About the same — the map grew, the grip did not' },
        { id: 'less', label: 'Less, in one real sense — rivals arrived' },
      ],
      after: 'Gallagher and Robinson’s answer, in 1953, was that the question is badly posed. In 1860 Britain already ran Argentina’s railways, Egypt’s debt and China’s treaty ports without owning an acre of any of them. Much of the scramble after 1880 was Britain painting pink what it had already held informally, because France and Germany had arrived and informal grip no longer kept them out. The map grew faster than the grip did. Then the objection, put most sharply by D. C. M. Platt: stretched far enough, “informal empire” cannot be falsified — if trade counts as empire, everywhere Britain traded was empire, and the word stops dividing anything.',
    },
    pins: 'pressure',
    autoYears: [1830, 1914],
  },
  {
    id: 'system', group: 'hidden', label: 'The stitching', paints: 'mark', short: 'System',
    sentence: 'colour = the role a place played in the network, not the ground it covered',
    byline: 'Nodes are places this atlas tags as a naval base, a coaling station, a cable station, a fort or a free port, plus the stations in `app/js/layers/routes.json`. Every link carries the year that segment opened and at least one source; nothing here is computed.',
    bylineShort: 'Nodes and dated links from this atlas and from routes.json; nothing computed',
    band: 'the empire as a network: dated nodes, cables and coal',
    caption: 'Read as ground, the empire is a quarter of the world. Read as a network, it is a chain of dots holding a line of cable and a coal bunker every two thousand miles. No route is simulated and no sailing time is calculated in this atlas: a cut cable is drawn as a cut line with the dated consequence written beside it.',
    pins: 'system',
  },
  {
    id: 'resistance', group: 'hidden', label: 'Revolt and refusal', paints: 'mark', short: 'Revolt',
    sentence: 'colour = the legal status; the pins are recorded revolt and killing',
    byline: 'Every event in this atlas of kind `revolt` or `massacre`, dated on or before the year on the clock — 42 risings and 10 killings, each with its own sources and, where the count is disputed, its range.',
    bylineShort: 'Every rising and killing this atlas records, dated to the year on the clock',
    band: 'the pins are risings and killings, as they happen',
    caption: 'Every pin is a rising the record names, at the place it happened, in the year it happened. Scrub forward and they accumulate: rebellion was not occasional. What you cannot see is what was never written down.',
    categories: RESISTANCE_CATEGORIES,
    pins: 'resistance',
  },
  {
    id: 'weight', group: 'hidden', label: 'Size by people, not land', paints: 'map', short: 'Weight',
    sentence: 'size = a cited quantity; colour still = legal status',
    byline: 'Each shape is scaled about its own centre by its territory’s `peak.population`, in that territory’s own census year, from this atlas. A place with no cited figure is drawn as bare ground.',
    bylineShort: 'Each place scaled by its own peak recorded population, in its own census year',
    band: 'size = people, not land; colour still = legal status',
    caption: 'Area on a map means land, and land is the wrong unit for an empire whose people were three-quarters in India. Nothing moves: every shape grows or shrinks about its own position, so a re-encoding can never relocate a place. A shape with no figure is left bare, never drawn as zero and never guessed.',
    key: 'ribbon',
  },
];

/**
 * WHAT THIS ATLAS CANNOT DRAW, AND WHY. FEATURE_SPEC §2 P06 lists a
 * `war-service` layer over `metrics[]`. There is no `metrics[]` in the shards
 * and no per-territory troop figure anywhere in the dataset: the word "troops"
 * appears 361 times, always inside prose. A layer with no definition must not
 * be registrable, so it is not registered — and it is printed here instead,
 * because a missing layer that nobody is told about is the defect this piece
 * was built to prevent.
 */
export const NOT_BUILT = [
  {
    id: 'war-service',
    label: 'Troops raised, and where they served',
    why: 'This atlas holds no per-place figure for troops raised. The numbers exist in the literature — roughly 1.4 million Indians served in the First World War and about 74,000 died; about 2.5 million volunteered in the Second, the largest volunteer army ever raised — but they are not in this dataset, and a layer drawn from a figure the atlas cannot cite per place would be a picture of nothing. It is named here rather than drawn.',
  },
];

/* ------------------------------------------------------------- the run ----- */

/**
 * FIVE WAYS TO BE WRONG ABOUT THIS MAP — a route through this surface, because
 * a chooser is not a lesson.
 *
 * WHY THIS EXISTS. Round 2's verdict on the whole app was that the sentence
 * "there is no path, the app hands a student a world map and leaves them to
 * click" is dead — the spine now has eighteen sequenced beats. It is not dead
 * *here*. Measured on the running build: `app/js/tours/tours.json` carries
 * `layer` three times and its value is `status` all three times, so a student
 * who presses Next from the first beat to the Close never meets a single one
 * of these readings. This surface was a menu of twelve, in four groups,
 * with no order and no question — the same defect the whole app was rebuilt to
 * remove, in one panel.
 *
 * So the sheet opens on a numbered run of five, not on the whole list. Each
 * step is a commit before a reveal (the four are exactly the four layers that
 * carry a `predict`, or that carry a claim the reader can be wrong about), each
 * names what changes on the plate, and the run hands back the full chooser at
 * the end rather than replacing it. `Every layer →` is one control away at
 * every step, because DIDACTIC_SPEC §8.2 is explicit that a reader may leave
 * the path at any moment and nothing may block them.
 *
 * Each step's `then` is what the reader is asked to DO on the plate once it has
 * painted, because a re-encoding a reader only looks at is a picture.
 */
export const RUN = {
  id: 'four-ways',
  title: 'Five ways to be wrong about this map',
  lead: 'The plate you arrived on paints one thing: what the law called each place. '
    + 'Four other readings of the same territories and the same year, in the order that '
    + 'does the most damage to the picture in your head. Commit to an answer before each one paints.',
  steps: [
    {
      layer: 'mechanism',
      head: 'An army, or a signature?',
      then: 'Scrub from 1750 to 1860 and watch which colour spreads. Then open the full key: '
        + 'the nine families on the plate fold fourteen mechanisms, and all fourteen are counted there.',
    },
    /* THE TURN-AROUND, AND WHY IT IS THE STEP IMMEDIATELY AFTER THE ONE ABOVE.
       The step before this asks what BRITAIN did. A whole atlas of that
       question is the vantage point DIDACTIC_SPEC M17 exists to break, and
       round 3 caught this app committing exactly that error in its own
       vocabulary. So the reading that names the other party is not filed away
       in the chooser to be found by whoever goes looking: it is the next press
       after the reading that needs it, on the same plate, in the same year. */
    {
      layer: 'taken-from',
      head: 'And who was on the other side?',
      then: 'Hover the same shapes you were just reading. Assam now says “the Konbaung kingdom”, '
        + 'Punjab says “the Sikh empire (Lahore Durbar)”, Barbados says “the Kalinago and Arawak of Ichirouganaim”. '
        + 'Every one of those names is in the record; none of them was on the plate a moment ago.',
    },
    {
      layer: 'exit',
      head: 'And how did it end?',
      then: 'Find Kenya, Malaya, Cyprus, Aden and Palestine. They are the exception the majority hides — '
        + 'and read the bare ground, where no departure was ever recorded at all.',
    },
    {
      layer: 'informal',
      head: 'The empire that was never coloured in',
      then: 'Now hold the year and press 4. The word changes, the year does not, and the empire changes size.',
      cta: { label: 'Press 4 for me — count the influenced', emit: 'map:setDefinition', payload: { id: 'influenced', from: 'layers' } },
    },
    {
      layer: 'system',
      head: 'A quarter of the world, or a chain of dots?',
      then: 'Every link carries the year it opened and a source. Nothing here is a simulated route, '
        + 'and no sailing time is calculated anywhere in this atlas.',
    },
  ],
  close: 'Five down. The other readings of this same map — how long each place had been held, '
    + 'whether slavery was lawful there that year, who was moved there and how, famine, revolt, '
    + 'and size by people instead of land — are below, each with what it measures and where the figure came from.',
};

/* ------------------------------------------------------------- the check --- */

const REQUIRED = ['id', 'label', 'group', 'sentence', 'byline', 'band', 'caption', 'paints'];

/**
 * A layer with no definition must not be registrable. This is the whole of
 * that rule, and it runs at module load, in front of the developer, and again
 * at mount, in front of the reader.
 */
export function assertLayer(l) {
  const missing = REQUIRED.filter((k) => !l || !l[k] || String(l[k]).trim() === '');
  if (missing.length) {
    throw new Error('layers: refusing to register "' + ((l && l.id) || '?')
      + '" — missing ' + missing.join(', ') + '. A layer with no definition is not a layer.');
  }
  if (!GROUPS.some((g) => g.id === l.group)) {
    throw new Error('layers: refusing to register "' + l.id + '" — unknown group "' + l.group + '".');
  }
  /* The band is two lines at reading size. A band sentence that does not fit
     it is clipped mid-word, which LAYOUT_BUDGET §4 calls teaching nothing, so
     it fails to register here rather than being clipped in front of a reader. */
  if (String(l.band).length > 62) {
    throw new Error('layers: refusing to register "' + l.id + '" — its band sentence is '
      + String(l.band).length + ' characters and the band holds 62.');
  }
  return l;
}

export const REGISTERED = LAYERS.map(assertLayer);
export const byId = new Map(REGISTERED.map((l) => [l.id, l]));
export const LAYER_IDS = REGISTERED.map((l) => l.id);

export default { GROUPS, LAYERS: REGISTERED, byId, LAYER_IDS, NOT_BUILT, RUN, assertLayer };
