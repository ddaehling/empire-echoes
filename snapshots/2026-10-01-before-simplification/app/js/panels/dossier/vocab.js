/* panels/dossier/vocab.js — the words this piece is allowed to use.
 *
 * Everything a student reads here is either (a) a string from the dataset, or
 * (b) a label from one of the tables below. There is no third source. If a
 * mechanism id ever arrives that is not in these tables the UI prints the raw
 * id rather than guessing, so a data change shows up as an ugly id instead of
 * a plausible lie.
 *
 * House style, DIDACTIC_SPEC §7.1: name the agent, use the plain word.
 * "acquired", "pacified", "unrest" and "native" appear nowhere below, and no
 * TAKING or LEAVING is ever glossed as a gift: nothing was "granted"
 * independence and no territory was "granted" to Britain. The one place the
 * word survives is where it is the exact legal act and the gift ran the other
 * way — Charles II granting Rupert's Land to the Hudson's Bay Company, and the
 * `granted-it` counterparty role that names such a grantor. A rule the file
 * itself breaks is a rule the next editor ignores, so it is stated as it is
 * kept.
 */

/* --- status → the ten map-palette families -------------------------------
   The dataset carries 21 legal statuses; the palette (DESIGN §2) carries ten
   fills, each with an assigned engraved texture. This is the only mapping
   between them in this module. P17 owns the legend; when it ships it may
   publish its own and this table becomes the fallback. */
export const STATUS_FAMILY = {
  'company-trading-posts': 'company-rule',
  'company-rule': 'company-rule',
  'proprietary-colony': 'settlement',
  'representative-colony': 'settlement',
  'self-governing-colony': 'settlement',
  'crown-colony': 'crown-conquered',
  'crown-rule': 'crown-conquered',
  'part-of-uk': 'crown-conquered',
  'overseas-territory': 'crown-conquered',
  'protectorate': 'protectorate',
  'protected-state': 'protectorate',
  'princely-state': 'protectorate',
  'mandate': 'mandate',
  'trusteeship': 'mandate',
  'condominium': 'lease',
  'leased-territory': 'lease',
  'occupied': 'occupied',
  'dominion': 'dominion',
  'associated-state': 'dominion',
  'crown-dependency': 'dominion',
  'informal-sphere': 'informal',
};

/* The texture each family carries, from DESIGN §2.2. Colour is never the only
   signal: the swatch draws fill + texture, and the word sits beside it. */
export const FAMILY_TEXTURE = {
  'never-british': 'plain',
  'lost-former': 'hatch-45',
  'dominion': 'rule-h',
  'settlement': 'stipple',
  'crown-conquered': 'plain',
  'company-rule': 'cross',
  'lease': 'rule-v',
  'protectorate': 'hatch-135',
  'mandate': 'stipple-coarse',
  'occupied': 'hatch-135-dense',
  'informal': 'plain',
};

/* --- how a place was taken -----------------------------------------------
 *
 * THE RULE THIS TABLE NOW OBEYS, AND WHY IT EXISTS.
 *
 * Three times this atlas printed a sentence that its own record contradicted,
 * and all three times the sentence came from here — one string keyed to a
 * mechanism tag, printed in bold over a record that said something else:
 *
 *   round 1  `annexation-of-existing-colony` glossed "taken from another
 *            European coloniser", printed over Kenya's African counterparties.
 *   round 3  `war-transfer` glossed "Handed over by another European power at
 *            the end of a war", printed over Tipu Sultan's Mysore, the Maratha
 *            confederacy, the Lahore Durbar, Konbaung Burma, Nepal and Bhutan.
 *   round 5  `purchase` glossed "Bought", printed over the Treaty of Amritsar,
 *            where Britain was the SELLER: the Company sold Kashmir, Ladakh
 *            and their people to Gulab Singh for 7.5 million rupees.
 *
 * Each was patched as a string. Each came back in a new form, because the
 * defect was never the string: it was that a CATEGORY was being asked to write
 * a SENTENCE. A tag says what kind of transaction this was. It cannot say who
 * paid whom, whose army did it, or which way the property moved. Only the
 * record can say that, and until it does, nothing may print it.
 *
 * So the tables below are split in two, and the split is the fix:
 *
 *   MECHANISM_GLOSS      one line per mechanism, asserting ONLY what the tag
 *                        means in DATA_MODEL §3.2. No direction of transfer, no
 *                        agent, no named party, no consent. Every one of these
 *                        is true of every record that carries the tag, and a
 *                        retag tomorrow cannot make one false.
 *   MECHANISM_DIRECTION  the sentences that DO assert a direction or an agent.
 *                        They are reachable only through `acquisition.direction`
 *                        — an explicit field the record must state — and never
 *                        through the mechanism. No record, no sentence.
 *
 * `acquisitionGloss()` below is the ONLY function allowed to turn a mechanism
 * into printed prose, in this module or any other. tools/check-gloss.js renders
 * every acquisition in the dataset under every mechanism and every direction and
 * fails the build if any sentence asserts something the record does not warrant.
 *
 * House style, DIDACTIC_SPEC §7.1: name the agent, use the plain word.
 * "acquired", "pacified", "unrest" and "native" appear nowhere below, and no
 * taking is glossed as a gift.
 */
export const MECHANISM_GLOSS = {
  'conquest': 'Taken by conquest',
  /* No agent. Four of these were Australian or New Zealand expeditions, six
     were East India Company troops, and eleven were joint operations with an
     ally who was not British. `direction` says which. */
  'occupation': 'Taken and held by military occupation',
  /* DATA_MODEL §3.2: "Britain announced it would control a state's foreign
     relations and defence". The agent is in the definition of the tag. */
  'protectorate-declared': 'Declared a British protectorate',
  /* DATA_MODEL §3.2: "an existing polity or colony was absorbed whole into
     British rule OR INTO A LARGER BRITISH TERRITORY". Round 1 read the first
     half only and printed "taken from another European coloniser" over Kenya.
     Twenty of the fifty-one records are one British administration handing a
     place to another — Zululand to Natal, the Cook Islands to New Zealand, the
     Northern Territory to South Australia — and six are British colonies
     joining themselves into a federation. The base gloss covers all three. */
  'annexation-of-existing-colony': 'Absorbed whole into a larger territory',
  'treaty-cession': 'Transferred by treaty',
  /* Nine of the forty-eight are a flag planted on a beach with nobody left
     behind, or letters patent signed in London over a coast no British subject
     had stood on. "Settled by British subjects" is not true of those. */
  'settlement': 'Claimed as land for British settlement',
  /* Not "handed to": eleven of the twenty-four are a company putting up a
     factory on ground a local ruler granted it, or on no grant at all. */
  'chartered-company': 'Held by a chartered company',
  'informal-influence': 'Controlled without a claim of sovereignty',
  'war-transfer': 'Transferred at the end of a war',
  /* THE ROUND 5 DISQUALIFIER. "Bought" states a direction, and the direction is
     wrong on two of the fourteen records. */
  'purchase': 'Changed hands for money',
  'mandate': 'Assigned as a League of Nations mandate',
  'trusteeship': 'Assigned as a United Nations trust territory',
  'lease': 'Held on a lease',
  /* DATA_MODEL §3.2: "governed jointly with another power". The partner is
     named from the record's own `jointlyWith`, never guessed. */
  'condominium': 'Held jointly with another power',
};

/* Back-compatible alias. Nothing new may read this: it is the same table. */
export const ACQUISITION_VERB = MECHANISM_GLOSS;

/* --- THE FRAME: the words printed AROUND the verb -------------------------
 *
 * ROUND 6, AND THE FOURTH RETURN OF ONE CLASS.
 *
 * Round 5 split the verb in two — a category gloss that asserts nothing, and a
 * direction sentence reachable only from a field the record states — and the
 * verb has told the truth ever since. The class came back anyway, one line
 * lower down the page, because the CALLER was still writing the frame:
 *
 *     HOW IT WAS TAKEN, AND FROM WHOM            ← hardcoded in dossier.js
 *     Kept when the surrounding country was lost, 1204   ← correct, from here
 *     TAKEN FROM  The Duchy of Normandy …; The islanders of Jersey   ← hardcoded
 *
 * Three lines, two of them asserting a transfer the middle one denies, over the
 * only two records in the dataset that say `retained-not-taken`. Twelve live
 * dossiers printed a version of this, and tools/check-gloss.js passed clean
 * across 21,482 renderings — because it rendered the verb and the page prints
 * the block.
 *
 * So the unit of truth is no longer the verb. It is the BLOCK, and `takenBlock()`
 * below builds all of it: eyebrow, verb, secondary-mechanism qualifier, and one
 * labelled group per set of counterparties. dossier.js renders what this returns
 * and composes nothing of its own; check-gloss.js renders the same object and
 * runs its contradiction tests over the composed string, so the checker and the
 * page are looking at the same sentence for the first time.
 *
 * FRAME ids are the vocabulary of labels. Each is true of every record that can
 * reach it, and each is reachable only from `acquisition.direction` (explicit),
 * the mechanism (category-safe), or `counterparty.role` (explicit).
 */
export const FRAME = {
  /* Something was taken from a named holder by force or by annexation. */
  'taken-from': { key: 'Taken from', eyebrow: 'How it was taken, and from whom', stem: 'How it was taken' },
  /* THE NEUTRAL DEFAULT. Asserts only what `counterparties` means: these are
     the other parties to the step. No direction, no loss, no consent. */
  'parties': { key: 'The parties to it', eyebrow: 'How it happened, and who was party to it', stem: 'How it happened' },
  'here-already': { key: 'Who was already here', eyebrow: 'How it was settled, and who was already here', stem: 'How it was settled' },
  'here-first': { key: 'Who was here, and who else claimed it', eyebrow: 'How it was claimed, and who else had a claim', stem: 'How it was claimed' },
  'sold-by': { key: 'Sold, and who lost by it', eyebrow: 'How it changed hands, and who lost by it', stem: 'How it changed hands' },
  'bought-from': { key: 'Bought from', eyebrow: 'How it changed hands, and who sold', stem: 'How it changed hands' },
  'rented-from': { key: 'Rented from', eyebrow: 'How it changed hands, and who owned it', stem: 'How it changed hands' },
  'signed-by': { key: 'Signed over by', eyebrow: 'How it was signed over, and by whom', stem: 'How it was signed over' },
  'signed-to': { key: 'Signed away to', eyebrow: 'How it was signed away, and to whom', stem: 'How it was signed away' },
  'signed-not-asked': { key: 'Who signed, and who was not asked', eyebrow: 'Who signed it, and who was not asked', stem: 'Who signed it' },
  'ceded-by': { key: 'Ceded by', eyebrow: 'How it was ceded, and by whom', stem: 'How it was ceded' },
  'leased-from': { key: 'Leased from', eyebrow: 'How it was leased, and from whom', stem: 'How it was leased' },
  'leased-to': { key: 'Leased to', eyebrow: 'How it was leased, and to whom', stem: 'How it was leased' },
  /* The KEY here is the neutral fallback and should never print: every
     union-of-territories and crown-charter record must state its roles, because
     one label over "the six colonies … and Aboriginal and Torres Strait
     Islander peoples" is wrong about one of them whatever it says. */
  'joined-by': { key: 'The parties to it', eyebrow: 'Who joined, and who was not asked', stem: 'Who joined it' },
  /* Seventeen records carry this direction and only six name an administration:
     the rest name the Zulu of Zululand, the Chagossians, the people of Sylhet —
     the people the district was moved WITH, who were not asked. So the fallback
     key is neutral and the roles do the work. */
  'moved-between': { key: 'The parties to it', eyebrow: 'How it was moved, and between whom', stem: 'How it was moved' },
  'kept-not-taken': { key: 'Who lost, and who stayed', eyebrow: 'What was lost around it, and who stayed', stem: 'What was lost around it' },
  'granted-by': { key: 'The parties to it', eyebrow: 'Who granted it, and over whose ground', stem: 'Who granted it' },
  'over-whom': { key: 'The parties to it', eyebrow: 'How the protectorate was declared, and over whom', stem: 'How it was declared' },
};

/* The frame a MECHANISM may reach on its own. Category-safe: true of every
   record that carries the tag, whatever the record turns out to say. Where the
   tag genuinely leaves the direction open the answer is `parties`, which
   asserts nothing, and the record must state a direction to say more. */
export const MECHANISM_FRAME = {
  'conquest': 'taken-from',
  'occupation': 'taken-from',
  'protectorate-declared': 'over-whom',
  'annexation-of-existing-colony': 'parties',
  'treaty-cession': 'parties',
  'settlement': 'here-already',
  'chartered-company': 'parties',
  'informal-influence': 'parties',
  'war-transfer': 'parties',
  'purchase': 'parties',
  'mandate': 'parties',
  'trusteeship': 'parties',
  'lease': 'parties',
  'condominium': 'parties',
};

/* --- the sentences that assert a direction, an agent or a party ------------
 * Reachable ONLY through `acquisition.direction`. Every id here is in the
 * schema's `acquisitionDirection` enum and is checked against the mechanism by
 * tools/validate-data.js, so a direction from the wrong mechanism cannot be
 * printed even if a shard states one.
 *
 * ROUND 6: each entry now carries the FRAME as well as the verb, because the
 * label beside the names is an assertion exactly as the verb is, and the two
 * must be decided in the same place from the same field or they drift apart —
 * which is what happened, and is why "TAKEN FROM" sat under "Joined with
 * others into one state" on eight federations for three rounds.
 */
export const MECHANISM_DIRECTION = {
  'purchase': {
    /* Britain, the Company, Parliament or Canada is the buyer. */
    'britain-buys': { verb: 'Bought by Britain', frame: 'bought-from' },
    /* Amritsar 1846, and only Amritsar. Britain took Kashmir from the defeated
       Sikh state on 9 March and sold it to Gulab Singh a week later for 7.5
       million rupees, keeping him as a tributary. Britain was the seller — so
       "Taken from … The people of the Kashmir valley" was the label under it,
       three lines above that counterparty's own `lost` field, which reads
       "They were sold." The record corrected the label two clicks away. */
    'britain-sells': { verb: 'Sold on by Britain to a ruler of its own choosing', frame: 'sold-by' },
    /* William Penn bought Pennsylvania from the Lenape a second time because he
       did not think the king's grant was enough; Lord Selkirk bought control of
       the Hudson's Bay Company and granted himself Assiniboia; an Austrian
       consul and a British merchant bought northern Borneo twice over. None of
       these was Britain, and "Bought by Britain" over them names the wrong
       buyer. The list mixes the seller with the Crown that issued the charter,
       so the frame is neutral and `counterparty.role` separates them. */
    'private-buyer': { verb: 'Bought by a British subject, not the Crown', frame: 'parties' },
    /* Rupert's Land, 1870. Canada paid the £300,000, not London. */
    'dominion-buys': { verb: 'Bought by a self-governing colony', frame: 'bought-from' },
    /* Madras 1639. Francis Day did not buy the sand Fort St George stands on:
       he took it on an annual rent from the Nayak of Kalahasti. */
    'rent-paid': { verb: 'Rented from the ruler who owned it', frame: 'rented-from' },
  },
  'treaty-cession': {
    'to-britain': { verb: 'Signed over to Britain by treaty', frame: 'signed-by' },
    'by-britain': { verb: 'Signed away by Britain in a treaty', frame: 'signed-to' },
    /* "Signed over" carries a consent the record sometimes denies. Oba Dosunmu
       signed Lagos away aboard a warship with the guns of HMS Prometheus
       already trained on his palace; Kamehameha III signed under written
       protest; Nanking was signed aboard HMS Cornwallis with the fleet at the
       gates. A signature obtained that way is still a signature, and the
       headline now says how it was obtained. */
    'to-britain-under-duress': { verb: 'Signed over to Britain under threat of force', frame: 'signed-by' },
    /* Waitangi, and only Waitangi. About 540 rangatira signed; the Māori text
       they signed ceded kāwanatanga and the English text London kept claimed
       sovereignty, and the difference between those two words is the most
       argued sentence in New Zealand’s history. A headline that says "signed
       over to Britain" settles that argument in London’s favour on the way
       past, three lines above a record that says the texts disagree. */
    'to-britain-disputed-text': { verb: 'Signed by treaty — and the two texts do not agree', frame: 'parties' },
    /* Siam signed Kedah, Kelantan, Terengganu and Perlis over to Britain in
       Bangkok in 1909. Nobody in any of the four was asked. */
    'to-britain-by-a-third-party': { verb: 'Signed over to Britain by a third state, not by the people it covered', frame: 'signed-not-asked' },
  },
  'war-transfer': {
    'from-european-power': { verb: 'Ceded by another European power at the end of a war', frame: 'ceded-by' },
    'from-defeated-state': { verb: 'Signed over under a treaty imposed after a war', frame: 'signed-by' },
  },
  'lease': {
    'britain-leases-in': { verb: 'Leased by Britain from the state that kept sovereignty', frame: 'leased-from' },
    'britain-leases-out': { verb: 'Leased out by Britain to somebody else', frame: 'leased-to' },
  },
  'annexation-of-existing-colony': {
    'into-british-rule': { verb: 'Annexed whole into British rule', frame: 'taken-from' },
    'between-british-territories': { verb: 'Moved from one British administration to another', frame: 'moved-between' },
    /* Scotland 1707, Canada 1867, Australia 1901, South Africa 1910, the
       Malayan Union 1946. Nobody was absorbed by anybody: existing territories
       joined. "Absorbed whole into British rule" over the Australian
       referendums would be the round-1 defect wearing a different hat — and
       "TAKEN FROM The six colonies of New South Wales, Victoria …" under the
       corrected verb was the round-6 defect wearing the same one. */
    'union-of-territories': { verb: 'Joined with others into one state', frame: 'joined-by' },
    /* Jersey and Guernsey, 1204. Nothing was taken: Normandy was lost and the
       islands stayed. The only two records in the dataset that say this. */
    'retained-not-taken': { verb: 'Kept when the surrounding country was lost', frame: 'kept-not-taken' },
  },
  'occupation': {
    'british-forces': { verb: 'Occupied by British forces', frame: 'taken-from' },
    'imperial-forces': { verb: 'Occupied by British and imperial troops', frame: 'taken-from' },
    'dominion-forces': { verb: 'Occupied by Australian or New Zealand forces', frame: 'taken-from' },
    'company-forces': { verb: 'Occupied by East India Company troops', frame: 'taken-from' },
    'allied-forces': { verb: 'Occupied by Britain together with an ally', frame: 'taken-from' },
    'administration-taken-over': { verb: 'Its government taken over and run directly', frame: 'taken-from' },
  },
  'settlement': {
    'settlers-landed': { verb: 'Settled by British subjects', frame: 'here-already' },
    /* Port Blair 1858 and Norfolk Island 1825 were not settled by anybody who
       chose to go. Two hundred prisoners taken in the 1857 rebellion were
       landed under guard to clear jungle. */
    'penal-settlement': { verb: 'Settled as a penal colony', frame: 'here-already' },
    /* Cook at Possession Bay, Gilbert at St John's, the Sea Venture's
       survivors: a flag, a reading, and the ship sails on. Gilbert's
       proclamation at St John's in 1583 took nothing from France, Spain,
       Portugal or the Basque country, who are in the record because they were
       fishing the Grand Banks and were pre-empted, not dispossessed. */
    'claimed-nobody-left': { verb: 'Claimed for the Crown, with nobody left behind', frame: 'here-first' },
    /* Letters patent and Orders in Council over coasts no British subject had
       stood on — and, at Kororāreka in May 1840, over islands where they had. */
    'claimed-by-proclamation': { verb: 'Claimed for the Crown by proclamation', frame: 'here-first' },
    'existing-settlement-claimed': { verb: 'An existing settlement brought under the Crown', frame: 'here-already' },
  },
  'chartered-company': {
    /* Rupert's Land, 1670: Charles II granted the whole Hudson Bay watershed to
       his cousin's company, and France is in the counterparty list because it
       claimed the same watershed and was pre-empted by the grant. Nothing was
       taken from France in 1670; that took until 1713. */
    'crown-charter': { verb: 'Handed to a chartered company by the Crown', frame: 'granted-by' },
    'company-post': { verb: 'A chartered company put a post here', frame: 'here-already' },
  },
};

/* A step often did more than one thing, and the record says so in
   `secondaryMechanisms`. Nepal is the case that forced this: the primary tag is
   `informal-influence`, the headline read "Controlled without a claim of
   sovereignty", and beneath it stood the people of Kumaon, Garhwal and the
   Terai — districts Sugauli ceded outright. The territory named and the
   territory transferred were not the same, and only the secondary tag said so.
   Every line here is category-safe: it names a KIND of transfer over some of
   the ground, and no agent, party or direction. */
export const MECHANISM_ALSO = {
  'conquest': 'and ground taken by conquest',
  'occupation': 'and ground held under military occupation',
  'protectorate-declared': 'and a protectorate declared over part of it',
  'annexation-of-existing-colony': 'and ground absorbed into a larger territory',
  'treaty-cession': 'and ground transferred outright by treaty',
  'settlement': 'and ground claimed for settlement',
  'chartered-company': 'and ground held by a chartered company',
  'informal-influence': 'and influence claimed over the rest',
  'war-transfer': 'and ground transferred at the end of a war',
  'purchase': 'and ground that changed hands for money',
  'mandate': 'and ground assigned as a mandate',
  'trusteeship': 'and ground assigned as a trust territory',
  'lease': 'and ground held on a lease',
  'condominium': 'and ground held jointly with another power',
};

/* --- what one counterparty was to this step -------------------------------
 *
 * A single acquisition's counterparty list often mixes people who lost the
 * ground with people who were only pre-empted, or with the Crown that issued
 * the charter. One label over that list is wrong about somebody whatever it
 * says: "TAKEN FROM The Lenape (Delaware) nation; Charles II and the English
 * Crown" was wrong about Charles II, who gave Penn the charter in settlement of
 * a debt to his father. So a counterparty may state its own role, and the block
 * prints one labelled group per role. The field is optional: with no roles the
 * block prints one group under the frame's own label, which asserts only what
 * the frame's direction warrants.
 */
export const COUNTERPARTY_ROLE = {
  'dispossessed': 'Taken from',
  'ceded-it': 'Signed it over',
  'sold-it': 'Sold by',
  'bought-it': 'Bought by',
  'granted-it': 'Granted by',
  'joined': 'Who joined',
  'not-asked': 'Who was not asked',
  'already-here': 'Who was already here',
  /* France in 1670, Germany at Kuwait in 1899, France at Fashoda in 1898, Italy
     on the Somali coast in 1884: powers that wanted the ground and did not get
     it. They lost a claim, not a country, and the difference is the whole
     point of the word "scramble". */
  'pre-empted': 'Who was pre-empted, not dispossessed',
  /* The 218 London merchants who got the 1600 charter were given a monopoly
     against other Englishmen. Nobody was dispossessed; a trade was closed. */
  'excluded': 'Who was shut out',
  /* "SIGNED OVER BY The Baganda peasantry; The Kabaka's court" — the peasantry
     did not sign anything. "BOUGHT FROM The Dukes of Atholl; The Manx" — the
     Manx were not paid. "THE ADMINISTRATIONS INVOLVED … The Chagossians" — they
     were not an administration. A counterparty list on a treaty, a lease or a
     sale routinely pairs the party that ACTED with the people the act was
     performed upon, and one label over both is false about one of them. */
  'covered': 'Who it covered',
  'nobody-there': 'Who was there',
  'lost-around-it': 'What was lost around it',
  'stayed': 'Who stayed',
  'co-signatory': 'Who else signed',
  'held-it-before': 'Who held it before',
  /* ROUND 7. The historian found eighteen counterparty groups printing an act
     label over a party whose own `lost` field denied it — "TAKEN FROM The
     Haudenosaunee (Iroquois Confederacy)" over "Nothing in 1664, and that is
     the point"; "TAKEN FROM ... the first Maroons" over "Nothing to England —
     they gained". Every one of them is a record that has already said what
     happened to that party, in a sentence two lines further down the same
     dossier. These four roles are the vocabulary that sentence needed, and
     nothing more: each says which KIND of non-loss the record recorded, and
     none of them softens a loss that the record states. */
  /* New York 1664, the Danish West Indies 1801, the Moluccas 1796, Goa 1799.
     The flag changed and the party's position did not. */
  'unchanged': 'Whose position did not change',
  /* Jamaica 1655. The Africans the fleeing Spanish owners abandoned took to the
     mountains, stayed free, and fought England for eighty-five years. */
  'gained': 'Who gained by it',
  /* The Menorcans in 1708, the Kalina and Lokono in 1796, the peoples of
     Bougainville in 1914: the record says the loss came, and says it came
     later. A label that dates it to this step is wrong about the date, which
     in a historical atlas is wrong about the thing. */
  'lost-it-later': 'Who lost it later, not here',
  /* Buenos Aires in 1806, the Jiaqing Emperor at Macau in 1808. Britain landed
     and Britain left, because these people made it leave. */
  'drove-it-out': 'Who drove it out',
};

/* The order groups print in. Whoever lost most prints first. */
export const ROLE_ORDER = [
  'dispossessed', 'lost-it-later', 'ceded-it', 'sold-it', 'not-asked',
  'already-here', 'stayed', 'joined', 'co-signatory', 'held-it-before',
  'covered', 'unchanged', 'nobody-there', 'lost-around-it', 'granted-it',
  'bought-it', 'excluded', 'pre-empted', 'drove-it-out', 'gained',
];

/* Frames whose LABEL names an act — signing, ceding, leasing, buying, joining,
   granting, moving. Under one of these, a party listed beside the actor is
   asserted to have done the same thing, and that is the assertion that has to
   be earned. So on these frames the block splits the list, and a counterparty
   the record calls `indigenous-people` or `no-resident-population` prints under
   "Who it covered" rather than under the act. That is not an inference about
   what they did: `kind` is a statement about who they were, and the label says
   only that the act was performed over them, which is why they are in the
   record at all. An explicit `role` always wins over this. */
export const ACT_FRAMES = new Set([
  'signed-by', 'signed-to', 'signed-not-asked', 'ceded-by', 'leased-from',
  'leased-to', 'bought-from', 'rented-from', 'sold-by', 'moved-between',
  'joined-by', 'granted-by',
]);

/* The role this counterparty carries in this block: what the record says, or —
   on an act frame only — what its own `kind` already says about it. */
export function counterpartyRole(c, frameId) {
  if (!c) return null;
  if (c.role && Object.prototype.hasOwnProperty.call(COUNTERPARTY_ROLE, c.role)) return c.role;
  /* `no-resident-population` is not a party to anything, under any frame:
     "TAKEN FROM No resident population" and "WHO WAS ALREADY HERE No resident
     population" both say the opposite of what the record says. */
  if (c.kind === 'no-resident-population') return 'nobody-there';
  if (ACT_FRAMES.has(frameId) && c.kind === 'indigenous-people') return 'covered';
  return null;
}

/* Kept only so an old record that has not been retagged still resolves to a
   true sentence. `acquisitionGloss()` reads `direction` first; this is the
   fallback, and it reads the record's own counterparties, never the tag.
     - EUROPEAN: a European power is named as a counterparty.
     - IMPOSED: none is, so every one of these is a treaty signed by a defeated
       Asian state — Seringapatam 1792, Surji-Anjangaon 1803, Sugauli 1816,
       Yandabo 1826, Lahore 1846, Sinchula 1865. */
export const WAR_TRANSFER_VERB = {
  european: MECHANISM_DIRECTION['war-transfer']['from-european-power'].verb,
  imposed: MECHANISM_DIRECTION['war-transfer']['from-defeated-state'].verb,
};

/* THE ONE FUNCTION THAT TURNS A MECHANISM INTO PROSE.
 *
 * fields.js re-exports this as `acquisitionVerb` and adds nothing. Both
 * argument orders work, because callers outside this piece already pass
 * (mechanism, acquisition):
 *
 *   acquisitionGloss(acquisition)                 preferred
 *   acquisitionGloss(mechanism, acquisition)      historic
 *   acquisitionGloss(mechanism)                   category only — SAFE, and
 *                                                 deliberately so: a caller who
 *                                                 does not hand over the record
 *                                                 gets a sentence that asserts
 *                                                 nothing the record could
 *                                                 contradict, rather than a
 *                                                 plausible lie.
 *
 * Nothing prints this on its own any more except a one-line summary elsewhere
 * in the dossier. The block a student reads comes from `takenBlock()`.
 */
export function acquisitionGloss(a, b) {
  return resolveVerb(a, b).verb;
}

/* verb + frame together, from one read of the record. */
function resolveVerb(a, b) {
  const acq = (a && typeof a === 'object') ? a : (b && typeof b === 'object' ? b : null);
  const mech = typeof a === 'string' ? a : (acq ? acq.mechanism : null);
  const say = (s) => (s && acq && beforeTheUnion(acq)
    ? String(s).replace(/\ba British\b/g, 'an English').replace(/\bBritish\b/g, 'English').replace(/\bBritain\b/g, 'England')
    : s);
  const baseFrame = label(MECHANISM_FRAME, mech, 'parties');
  const base = label(MECHANISM_GLOSS, mech, mech);
  if (!acq) return { verb: base, frame: baseFrame, source: 'mechanism' };

  const table = MECHANISM_DIRECTION[mech];
  if (table && acq.direction && Object.prototype.hasOwnProperty.call(table, acq.direction)) {
    const e = table[acq.direction];
    return { verb: say(e.verb), frame: e.frame, source: 'direction' };
  }
  /* The one inference this module still makes, and it reads the record, not
     the tag: an untagged war-transfer whose counterparties name a European
     power may say so, because the record itself named them. */
  if (mech === 'war-transfer' && Array.isArray(acq.counterparties) && acq.counterparties.length) {
    const european = acq.counterparties.some((c) => c && c.kind === 'european-power');
    return european
      ? { verb: say(WAR_TRANSFER_VERB.european), frame: 'ceded-by', source: 'counterparties' }
      : { verb: say(WAR_TRANSFER_VERB.imposed), frame: 'signed-by', source: 'counterparties' };
  }
  /* A condominium may name its partner, and then the headline names them too. */
  if (mech === 'condominium' && typeof acq.jointlyWith === 'string' && acq.jointlyWith.trim()) {
    return { verb: say('Held jointly with ' + acq.jointlyWith.trim()), frame: baseFrame, source: 'record' };
  }
  return { verb: say(base), frame: baseFrame, source: 'mechanism' };
}

/* THE WHOLE PRINTED BLOCK, IN ONE OBJECT.
 *
 * dossier.js renders exactly this and composes nothing of its own;
 * tools/check-gloss.js renders exactly this and runs its contradiction tests
 * over `.text`. That is the entire fix for round 6: the checker and the page
 * now read the same sentence.
 *
 *   takenBlock(acquisition, { count, isFounding })
 *     → { frame, eyebrow, verb, also, groups[{ role, key, names[] }], text }
 */
export function takenBlock(acq, opts = {}) {
  const r = resolveVerb(acq);
  const f = FRAME[r.frame] || FRAME.parties;
  const count = Number(opts.count) || 0;

  /* The eyebrow is the frame's own line. When there is more than one step the
     dossier says which step this is, and the frame supplies the stem so the
     counted form is built from the same words as the uncounted one. */
  let eyebrow = f.eyebrow;
  if (count > 1) {
    eyebrow = f.stem + (opts.isFounding
      ? ' — first of ' + count + ' steps'
      : ' — the step it turns on, of ' + count);
  }

  const also = [];
  for (const m of (Array.isArray(acq && acq.secondaryMechanisms) ? acq.secondaryMechanisms : [])) {
    if (m === (acq && acq.mechanism)) continue;
    const s = MECHANISM_ALSO[m];
    if (s) also.push(s);
  }

  /* One labelled group per role, and the frame's own label over whatever the
     record has said nothing about. The frame group prints first because it is
     the party the verb is about; the rest follow in ROLE_ORDER, heaviest loss
     first. */
  const cps = Array.isArray(acq && acq.counterparties) ? acq.counterparties.filter(Boolean) : [];
  const groups = [];
  if (cps.length) {
    const roleFor = new Map(cps.map((c) => [c, counterpartyRole(c, r.frame)]));
    const plain = cps.filter((c) => !roleFor.get(c));
    if (plain.length) groups.push({ role: null, key: f.key, names: plain.map((c) => c.name) });
    for (const role of ROLE_ORDER) {
      const names = cps.filter((c) => roleFor.get(c) === role).map((c) => c.name);
      if (names.length) groups.push({ role, key: COUNTERPARTY_ROLE[role], names });
    }
  }

  const text = [
    eyebrow,
    r.verb + (also.length ? ' — ' + also.join(', ') : ''),
    groups.map((g) => g.key.toUpperCase() + ' ' + g.names.join('; ')).join(' | ')
      || 'NO COUNTERPARTY IS RECORDED',
  ].join(' — ');

  return { frame: r.frame, source: r.source, key: f.key, eyebrow, verb: r.verb, also, groups, text };
}

/* Lowercase the first word of a gloss for use inside a sentence — and nothing
   else. `.toLowerCase()` on the whole string printed "annexed whole into
   english rule, 18 June 1541" on Ireland, because the pre-Union substitution
   had already put a proper noun in the middle of it. */
export const inSentence = (s) => (typeof s === 'string' && s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/* BEFORE 1 MAY 1707 THERE WAS NO BRITAIN.
 *
 * "Settled by British subjects, 17 February 1627" over Barbados, and "Annexed
 * whole into British rule, 1536" over Wales, are the same defect in a milder
 * form: a sentence asserting something the record's own date contradicts. The
 * record states the date; the Act of Union is not an inference. So every
 * sentence this module prints over a step dated before the union of the English
 * and Scottish parliaments says England, because that is who did it.
 *
 * Applied last, to the resolved sentence, so there is exactly one place where
 * the word can appear and exactly one place where it is corrected.
 */
const UNION_OF_1707 = 1707;
function beforeTheUnion(acq) {
  if (!acq) return false;
  /* The shard carries date.value as a string; core/data.js normStep() replaces
     it with readDate()'s {year} and hangs a `year` on the step. Both shapes
     arrive here — the dossier passes the normalised step, tools/check-gloss.js
     passes the raw record — so both are read, and neither is guessed at. */
  const d = acq.date || null;
  let y = null;
  if (typeof acq.year === 'number') y = acq.year;
  else if (d && typeof d.year === 'number') y = d.year;
  else if (d && typeof d.value === 'string') y = parseInt(d.value.slice(0, 4), 10);
  return Number.isFinite(y) && y < UNION_OF_1707;
}
/* --- how it ended --------------------------------------------------------
   No departure is ever glossed as a gift: nothing here was "granted"
   independence, because nobody in this dataset was. */
export const DEPARTURE_VERB = {
  'negotiated-independence': 'Independence by negotiation',
  'war-of-independence': 'Independence after a war',
  'insurgency-then-negotiation': 'Armed struggle, then negotiation',
  'referendum': 'Independence after a referendum',
  'partition': 'Partitioned',
  'merger-into-neighbour': 'Merged into a neighbouring state',
  'transfer-to-another-power': 'Handed to another power',
  'lease-expiry': 'The lease ran out',
  'still-a-territory': 'It has not ended',
};

/* --- who could sit in the local legislature ------------------------------ */
export const LEGISLATURE = {
  'none': 'None. No local legislature of any kind.',
  'nominated-council': 'A council whose members were appointed, not elected.',
  'part-elected': 'An assembly part elected, part appointed.',
  'elected-assembly': 'An elected assembly.',
  'responsible-government': 'Responsible government: ministers answerable to the local assembly.',
  'sovereign-parliament': 'A sovereign parliament.',
};

/* --- what a counterparty was --------------------------------------------- */
export const COUNTERPARTY_KIND = {
  'indigenous-polity': 'Indigenous state',
  'indigenous-people': 'Indigenous people',
  'regional-state': 'regional state',
  'empire': 'empire',
  'european-power': 'European power',
  'chartered-company': 'chartered company',
  'no-resident-population': 'no resident population recorded',
  'other': 'other party',
};

export const BECOMES_KIND = {
  'sovereign-state': 'a sovereign state',
  'part-of-another-state': 'part of another state',
  'dominion': 'a Dominion',
  'british-territory': 'a British territory',
  'republic': 'a republic',
  'special-administrative-region': 'a special administrative region',
};

export const INSTRUMENT_KIND = {
  'treaty': 'treaty',
  'convention': 'convention',
  'order-in-council': 'Order in Council',
  'proclamation': 'proclamation',
  'grant': 'royal grant',
  'charter': 'royal charter',
  'act-of-parliament': 'Act of Parliament',
  'letters-patent': 'letters patent',
  'none': 'no instrument was signed',
};

/* --- source classes, for renderSource -------------------------------------
   `nature` is a formatting of the recorded `kind` field, not an inference.
   `limit` is a statement about the CLASS of source and is labelled as such in
   the UI; it is never presented as this source's own recorded limitation. */
export const SOURCE_KIND = {
  'book': {
    nature: 'A book by a modern historian.',
    purposeHint: 'To argue a case to other readers.',
    limit: 'It can only reach what other people\u2019s records held.',
  },
  'chapter': {
    nature: 'A chapter in an edited academic book.',
    purposeHint: 'Written for other historians, inside someone else\u2019s volume.',
    limit: 'It can only reach what other people\u2019s records held.',
  },
  'article': {
    nature: 'A journal article by a modern historian.',
    purposeHint: 'To make one narrow case to specialists.',
    limit: 'One case argued at length; not a survey.',
  },
  'reference-work': {
    nature: 'A reference work.',
    purposeHint: 'Compiled to be consulted, not read.',
    limit: 'It reports a settled position and hides the argument behind it.',
  },
  'official-record': {
    nature: 'An official record made by a government.',
    purposeHint: 'Made by an administration for its own use.',
    limit: 'What officials did not write down leaves no trace in it.',
  },
  'primary-source': {
    nature: 'A primary source made at the time.',
    purposeHint: 'Made at the time, by someone with their own reasons.',
    limit: 'One position at one moment; it does not stand for everyone there.',
  },
};

export const label = (table, id, fallback) =>
  (id != null && Object.prototype.hasOwnProperty.call(table, id)) ? table[id] : (fallback ?? id ?? null);
