/**
 * teacher/questions.js — practice questions with mark schemes.
 *
 * Twelve questions, tagged by type, every one of them answerable from this
 * atlas and from nothing else. Each carries three things a printed question
 * list does not:
 *
 *   `atlas`   working deep links to the exact map states the evidence lives
 *             in, so "use your own knowledge" has somewhere to go;
 *   `moves`   which of the four workshop moves the question is testing, by
 *             name, so a student knows what is being asked of them;
 *   `scheme`  what a top-band answer does, what a middle-band answer does, and
 *             the specific evidence a marker should expect to see — written as
 *             instructions to a student marking their own work, because that is
 *             who will read it.
 *
 * The `evidence` lines are pointers into the dataset, not new claims: every one
 * of them is a fact the atlas already holds and the ledger already audits.
 * Nothing here invents a number.
 */

export const TYPES = [
  { id: 'source', label: 'Source questions', note: 'One or two extracts, and what they can establish.' },
  { id: 'interpretation', label: 'Interpretation questions', note: '“How far do you agree” — the three-move paragraph and the scope test.' },
  { id: 'synoptic', label: 'Synoptic essays', note: 'Across regions and centuries. The atlas is at its strongest here.' },
  { id: 'short', label: 'Short explanations', note: 'Eight-mark mechanism questions. One loop, explained.' },
];

export const QUESTIONS = [
  /* ------------------------------------------------------------- source -- */
  {
    id: 'q-waitangi', type: 'source', marks: 20, moves: ['Comparing two extracts', 'Source utility'],
    tags: ['T13', 'T15'],
    q: 'Assess the value of the two texts of the Treaty of Waitangi to a historian studying how British sovereignty over New Zealand was established.',
    atlas: [
      { label: 'New Zealand in 1840', href: '#year=1840&sel=new-zealand' },
      { label: 'New Zealand in 1863, after the confiscations', href: '#year=1863&sel=new-zealand' },
    ],
    scheme: {
      top: 'Runs one question at a time across both texts rather than summarising each. Quotes the join — “all the rights and powers of Sovereignty” against te Kawanatanga katoa — and says what each text is evidence OF: the English of what the Crown intended to obtain, the Māori of what was put in front of the chiefs and signed. Notes that the intention of the translators is disputed and does not settle it.',
      middle: 'Identifies the discrepancy and explains it as a translation problem, with some provenance, but treats one text as correct and the other as an error.',
      floor: 'Summarises each text in turn and concludes that the treaty was unfair.',
    },
    evidence: [
      'Over 500 chiefs signed the Māori text; almost none read the English one.',
      'The Māori text was translated overnight on 4 February 1840 by Henry Williams and his son Edward.',
      'The same missionaries had used rangatiratanga for “kingdom” in the Lord’s Prayer, so the stronger word existed and was not used in article one.',
      'The dispute has been before the Waitangi Tribunal since 1975.',
    ],
  },
  {
    id: 'q-lobengula', type: 'source', marks: 20, moves: ['Source utility'],
    tags: ['T13'],
    q: 'How useful is Lobengula’s letter to Queen Victoria of 23 April 1889 to a historian studying how European companies obtained rights in southern Africa?',
    atlas: [
      { label: 'Southern Rhodesia in 1890', href: '#year=1890&sel=southern-rhodesia' },
      { label: 'The Berlin Conference, 1884', href: '#year=1884' },
    ],
    scheme: {
      top: 'Treats the purpose — repudiation, addressed to the only authority above the men in front of him — as what makes the letter valuable rather than what discredits it. Names what it cannot establish: what was said at the signing, what Lobengula understood at the time, and what the Shona polities of the plateau thought about a concession over their land. Uses own knowledge: the Rudd Concession of October 1888, the British South Africa Company charter of 1889, the occupation of Mashonaland in 1890.',
      middle: 'Explains the provenance and the chain of translation, and says the source shows Lobengula was deceived, without scoping what it can prove.',
      floor: 'Says the source is biased because Lobengula wanted his land back.',
    },
    evidence: [
      'The concession was signed in October 1888 and repudiated in writing in April 1889.',
      'The charter was granted in 1889 and the occupation went ahead in 1890 regardless.',
      'The letter was dictated in isiNdebele and written down by Europeans at Lobengula’s court.',
    ],
  },
  {
    id: 'q-trevelyan', type: 'source', marks: 20, moves: ['Source utility'],
    tags: ['T16'],
    q: 'Trevelyan’s letter of 1846 records an attitude; the census records a population collapse. Explain how a historian would use the two together to explain why mortality in Ireland was so high between 1845 and 1852.',
    atlas: [
      { label: 'Ireland in 1847', href: '#year=1847&sel=ireland' },
      { label: 'The Great Famine, in the ledger', href: '#panel=evidence' },
    ],
    scheme: {
      top: 'Says explicitly that the source cannot establish scale and the census cannot establish motive, and that the argument is made by putting the two together with the policy record — the closure of the soup kitchens in 1847 and the shift of relief costs onto Irish poor rates. Uses the atlas range (about 800,000 to 1.5 million excess deaths) rather than a round figure, and says why the range is wide.',
      middle: 'Uses both kinds of evidence and reaches the right conclusion, but treats the death toll as a settled number.',
      floor: 'Quotes Trevelyan as proof that Britain caused the deaths, with no demographic evidence.',
    },
    evidence: [
      'The census fell from 8,175,124 in 1841 to 6,552,385 in 1851.',
      'Excess deaths 1846–51 are estimated at roughly 800,000 to 1.5 million; emigration at 1 to 2.1 million, from passenger records that undercount.',
      'Trevelyan published the same argument in 1848 as The Irish Crisis.',
    ],
  },
  {
    id: 'q-africa-pair', type: 'source', marks: 20, moves: ['Comparing two extracts'],
    tags: ['T13'],
    q: 'Compare Lord Salisbury’s speech of 1890 and Lobengula’s letter of 1889 as evidence for how European claims in Africa were made.',
    atlas: [
      { label: 'Africa in 1890', href: '#year=1890' },
      { label: 'Africa in 1902', href: '#year=1902' },
    ],
    scheme: {
      top: 'Names the different question each answers, compares the evidence bases (Salisbury was in the room; Lobengula heard afterwards, through interpreters with interests of their own), handles scale honestly — neither is evidence about “Africa” — and ends with what the pair establishes that neither does alone.',
      middle: 'Compares them properly but concludes only that Europeans were careless and Africans were wronged.',
      floor: 'Describes each source in turn.',
    },
    evidence: [
      'The Anglo-German Agreement of 1 July 1890 exchanged Heligoland for British claims in East Africa and fixed borders across unsurveyed ground.',
      'The Berlin Act of 1885 required “effective occupation” to make a claim good.',
    ],
  },

  /* ----------------------------------------------------- interpretation -- */
  {
    id: 'q-collaboration', type: 'interpretation', marks: 25, moves: ['The interpretation paragraph', 'The scope test'],
    tags: ['T8', 'T10', 'T11'],
    q: '“British rule in India depended on Indians.” How far do you agree, for the period 1765 to 1947?',
    atlas: [
      { label: 'British India in 1765', href: '#year=1765&sel=bengal-presidency' },
      { label: 'British India in 1857', href: '#year=1857&sel=british-india' },
      { label: 'British India in 1941', href: '#year=1941&sel=british-india' },
    ],
    scheme: {
      top: 'States the claim at its strongest — that the Company and then the Crown ruled through Indian soldiers, revenue, clerks, landlords and princes, and could not have ruled otherwise. Tests it with numbers the atlas holds: a private army of over 200,000 men, twice the size of the British Army; about a thousand covenanted British officers of the Indian Civil Service governing 300 million people through Indian clerks, police and revenue collectors; 565 princely states that were never British territory at all. Then scopes it: dependence explains the durability of the system and the speed of its collapse in 1946–47, but not the decisions taken in London, and it must not be turned into an argument that Indians chose British rule.',
      middle: 'Argues the case with one or two of those figures and no scope.',
      floor: 'Lists things Indians did for the British.',
    },
    evidence: [
      'The Diwani of Bengal, 1765: the right to collect land revenue from perhaps 20 to 30 million people.',
      '1857 begins with sepoys of the Bengal Army — the same men the system depended on.',
      'The 1941 census counted 388,997,955 people in British India and the princely states together — about a fifth of the world, under one Viceroy.',
    ],
  },
  {
    id: 'q-abolition', type: 'interpretation', marks: 25, moves: ['The interpretation paragraph'],
    tags: ['T4', 'T5'],
    q: 'How far do you agree that abolition in 1833 owed more to resistance by enslaved people than to British humanitarianism?',
    atlas: [
      { label: 'Jamaica, 1831 — the Baptist War', href: '#year=1831&sel=jamaica' },
      { label: 'The Caribbean in 1834', href: '#year=1834' },
    ],
    scheme: {
      top: 'Puts the dates in order and makes the order the argument: Sam Sharpe’s rising of December 1831 involved tens of thousands of people, and the Act came in August 1833. States the humanitarian case at its strongest — the petitions were the largest mass political campaign in Britain to that date — and does not pretend it was fraudulent. Then scopes it: resistance changed what planters and the government thought slavery cost to maintain, and the shape of the Act, with £20 million to the owners, £0 to the freed, and apprenticeship until 1838, shows whose interests survived the change.',
      middle: 'Has both causes and the right chronology, but weighs them by assertion.',
      floor: 'Describes Wilberforce and the campaign, with the rebellion as background.',
    },
    evidence: [
      'The Baptist War began on 27 December 1831; the Slavery Abolition Act was passed on 28 August 1833.',
      'Compensation went to the owners; the people freed received nothing, and “apprenticeship” ran to 1838.',
    ],
  },
  {
    id: 'q-scramble', type: 'interpretation', marks: 25, moves: ['The scope test'],
    tags: ['T12', 'T13'],
    q: '“Britain took territory in Africa for strategic reasons rather than economic ones.” Assess this view for the years 1880 to 1902.',
    atlas: [
      { label: 'Africa in 1880', href: '#year=1880' },
      { label: 'Africa in 1902', href: '#year=1902' },
      { label: 'Egypt in 1882', href: '#year=1882&sel=egypt' },
    ],
    scheme: {
      top: 'Names the domain — the two decades, the continent, and the question of motive rather than method. Finds a case that fits (Egypt in 1882: the canal, the route to India, and the bondholders, which is both) and a case that breaks the strategic reading (Southern Rhodesia, where a chartered company went in after minerals). Ends by reducing the claim rather than choosing a side: strategy explains where Britain went first, economics explains who went with it.',
      middle: 'Gives strategic and economic examples and concludes that both mattered.',
      floor: 'Lists causes of the Scramble.',
    },
    evidence: [
      'The Suez Canal opened in 1869; Britain occupied Egypt in 1882 and stayed 74 years without annexing it.',
      'The Berlin Conference of 1884–85 set the rules for claiming, with no African state represented.',
      'The British South Africa Company received its charter in 1889 on the strength of a mineral concession.',
    ],
  },
  {
    id: 'q-1922', type: 'interpretation', marks: 25, moves: ['The interpretation paragraph'],
    tags: ['T14'],
    q: '“The British Empire was strongest in 1922.” How far do you agree?',
    atlas: [
      { label: 'The empire in 1922', href: '#year=1922' },
      { label: 'Ireland in 1922', href: '#year=1922&sel=ireland' },
      { label: 'Egypt in 1922', href: '#year=1922&sel=egypt' },
    ],
    scheme: {
      top: 'Separates extent from strength and says so in the first sentence. Uses the map: 1922 is the largest the empire ever gets, and the mandates that made it largest arrived after 1918. Then the same three years produce Amritsar in 1919, the Irish treaty of December 1921 and the Egyptian declaration of February 1922. Concludes that maximum extent and the loss of the argument happened together, and says what that implies about how empires end.',
      middle: 'Notes the peak and some of the crises, without connecting them.',
      floor: 'Describes how big the empire was.',
    },
    evidence: [
      'The League of Nations mandates were added after 1918, which is why the peak is later than 1914.',
      'Egypt was declared independent in February 1922 with British troops remaining.',
      'The Irish Free State came into being on 6 December 1922 with six counties kept in the United Kingdom.',
    ],
  },

  /* ---------------------------------------------------------- synoptic -- */
  {
    id: 'q-1783-1947', type: 'synoptic', marks: 30, moves: ['Comparing two extracts', 'The scope test'],
    tags: ['T7', 'T19'],
    q: 'Compare the loss of the Thirteen Colonies in 1783 with the loss of India in 1947. Which reveals more about the limits of British power?',
    atlas: [
      { label: 'North America in 1783', href: '#year=1783' },
      { label: 'South Asia in 1947', href: '#year=1947&sel=british-india' },
    ],
    scheme: {
      top: 'Compares mechanisms, not narratives: in 1783 a settler population with representation in its own assemblies refused taxation and won a war with French help; in 1947 a mass movement plus a bankrupt metropolis plus mutinies in the Royal Indian Navy in 1946 removed the cooperation the whole system ran on. Notes that Britain kept trading with America after 1783, which is where the idea of informal empire starts, and that the 1947 departure was managed to a deadline brought forward by ten months. Answers the question asked — “which reveals more” — instead of describing both.',
      middle: 'Compares the two competently and concludes that both show weakness.',
      floor: 'Narrates each in turn.',
    },
    evidence: [
      'The Treaty of Paris was signed on 3 September 1783.',
      'Britain left India in 73 days after bringing its own deadline forward by ten months, and the border was published two days after independence.',
    ],
  },
  {
    id: 'q-1947-end', type: 'synoptic', marks: 30, moves: ['The scope test'],
    tags: ['T19', 'T20'],
    q: '“The empire ended in 1947.” How far do you agree?',
    atlas: [
      { label: '1947', href: '#year=1947' },
      { label: '1968 — the East of Suez decision', href: '#year=1968' },
      { label: '1997 — Hong Kong', href: '#year=1997&sel=hong-kong' },
      { label: 'The last change the atlas records', href: '#year=@last' },
    ],
    scheme: {
      top: 'Makes the claim precise before testing it: 1947 removes the manpower, the revenue and the strategic purpose that organised the eastern system, which is a strong case. Then breaks it with the map — the African colonies mostly leave between 1957 and 1968, Hong Kong in 1997, and fourteen territories are still administered from London. Ends with a claim about what “ended” means: the system ended in 1947, the territories went on leaving for fifty years, and some disputes are open now.',
      middle: 'Argues for or against 1947 with examples and no definition of “ended”.',
      floor: 'Lists dates of independence.',
    },
    evidence: [
      'The atlas records departures across four centuries, and a set of territories it lists as still British today.',
      'Hong Kong left in 1997 by lease expiry, the only departure of its kind in the dataset.',
    ],
  },

  /* ------------------------------------------------------------- short -- */
  {
    id: 'q-loop', type: 'short', marks: 8, moves: ['The interpretation paragraph'],
    tags: ['T7'],
    q: 'Explain how the Diwani of Bengal in 1765 changed what the East India Company was.',
    atlas: [{ label: 'Bengal in 1765', href: '#year=1765&sel=bengal-presidency' }],
    scheme: {
      top: 'Explains a loop, not a list: land revenue paid for soldiers, soldiers took more territory, more territory produced more revenue. Names the change of kind — a shareholder company became a government, with courts and an army, answerable to a board in London and to nobody it ruled.',
      middle: 'Says the Company got rich and powerful and expanded.',
      floor: 'Says 1765 was important.',
    },
    evidence: [
      'Plassey, 23 June 1757; the Diwani, 1765 — the right to collect land revenue from perhaps 20 to 30 million people.',
    ],
  },
  {
    id: 'q-peak', type: 'short', marks: 8, moves: ['The scope test'],
    tags: ['T14'],
    q: 'Explain why the empire’s largest extent came after the First World War rather than before it.',
    atlas: [
      { label: '1914', href: '#year=1914' },
      { label: '1922', href: '#year=1922' },
    ],
    scheme: {
      top: 'Names the mechanism: the mandates handed out after 1918 added territory that had belonged to the German and Ottoman empires, so the peak is a consequence of a war Britain barely afforded. Adds the point that matters — extent went up while the capacity to hold it went down.',
      middle: 'Says the empire grew because of the peace settlement.',
      floor: 'Says the empire was biggest in 1922.',
    },
    evidence: [
      'The mandates are recorded in this atlas as their own acquisition mechanism, and there are ten of them.',
    ],
  },
];

export function byType(type) {
  return QUESTIONS.filter(q => q.type === type);
}
