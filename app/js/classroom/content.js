// The classroom layer deliberately selects a few ideas from the full atlas.
// Dates are waypoints in overlapping histories, not neat stages shared by every place.
// Historical claims are drawn from app/data/territories and docs/SOURCES.md.
export const eras = [
  {
    key: "trade",
    year: 1600,
    label: "Trade",
    title: "A company. A charter. A beginning.",
    summary:
      "English merchants receive a charter to trade in Asia. They do not yet rule India. During the following century, overseas trading posts and Atlantic settlements grow alongside the dispossession of Indigenous peoples and plantation slavery.",
    question:
      "What is the difference between trading in a place and ruling it?",
  },
  {
    key: "expansion",
    year: 1757,
    label: "Expansion",
    title: "Trade becomes territorial power.",
    summary:
      "The East India Company wins at Plassey in Bengal, accelerating its rise as a political power. Across the Atlantic, plantations depend on enslaved labour. Conquest, commerce and resistance unfold together, in different ways in different places.",
    question:
      "How might controlling land make a trading company more powerful?",
  },
  {
    key: "crown",
    year: 1858,
    label: "Crown rule",
    title: "One empire. Different kinds of rule.",
    summary:
      "After the Indian Rebellion of 1857, the British Crown takes over the Company’s territories. Some Indian rulers remain under British authority. Settler colonies gain self-government while imperial conquest continues elsewhere, especially in Africa later in the century.",
    question:
      "Does one colour on a map mean everyone was governed in the same way?",
  },
  {
    key: "peak",
    year: 1922,
    label: "High tide",
    title: "The largest map tells only part of the story.",
    summary:
      "The empire approaches its greatest territorial extent after the First World War. But control is uneven: dominions have considerable self-government, mandates bring new responsibilities, and demands for independence challenge British power from Ireland to India.",
    question: "Can an empire grow on a map while its authority weakens?",
  },
  {
    key: "independence",
    year: 1947,
    label: "Independence",
    title: "Independence changes the map.",
    summary:
      "India and Pakistan become independent after decades of political organising and resistance. Partition brings mass displacement and violence. Across the empire, independence follows different paths: negotiation, protest and armed struggle often overlap. British rule continues in many places.",
    question:
      "Why might independence be both a moment of freedom and a moment of crisis?",
  },
  {
    key: "legacies",
    year: 1997,
    label: "Legacies",
    title: "An ending, with many afterlives.",
    summary:
      "Hong Kong passes from British to Chinese sovereignty. It is a major landmark, but not the end of every British overseas territory. Borders, languages, migration and unequal access to land continue to carry histories of empire.",
    question:
      "Which effects of empire could continue after colonial rule ends?",
  },
];

// Minutes are suggested time for reading, using the map and discussing the prompts.
export const stories = [
  {
    id: "atlantic",
    title: "Sugar, slavery & resistance",
    description:
      "Follow Jamaica to see how wealth was made—and how people fought for freedom.",
    minutes: 12,
    territoryId: "jamaica",
    year: 1655,
    steps: [
      {
        title: "An island becomes a plantation colony",
        body: "English forces seized Jamaica from Spain in 1655. Under English, and later British, rule, sugar plantations expanded using the forced labour of enslaved Africans. The sugar sold across the Atlantic generated wealth for plantation owners and merchants; the people producing it were denied freedom.",
        question: "Who gained from the sugar trade, and who carried its costs?",
        hint: "Connect the plantation, the Atlantic crossing and the market. Distinguish people earning profits from people forced to work.",
        year: 1655,
        territoryId: "jamaica",
      },
      {
        title: "Freedom defended in the mountains",
        body: "Maroons built communities beyond plantation control. They fought colonial forces and used Jamaica’s mountainous interior to defend their freedom. Treaties in 1739 and 1740 recognised Maroon communities, while requiring them to help capture other people escaping slavery. Resistance could win freedom for some without ending the wider system.",
        question: "What can a single colour on the map hide about Jamaica?",
        hint: "A colonial claim to an island did not mean equal control of its coast, plantations and mountains.",
        year: 1739,
        territoryId: "jamaica",
      },
      {
        title: "People make emancipation possible",
        body: "In 1831, Samuel Sharpe helped organise a strike among enslaved workers. It developed into a rebellion, which colonial forces violently suppressed. Enslaved people’s resistance, testimony and organising helped push emancipation forward, alongside abolitionist campaigning in Britain. Freedom was something people struggled for.",
        question:
          "How does this change an account that gives Parliament all the credit for abolition?",
        hint: "Include the actions of enslaved people as well as the people who passed legislation.",
        year: 1831,
        territoryId: "jamaica",
      },
      {
        title: "Abolition was a process",
        body: "Britain banned its slave trade in 1807, but slavery continued in Jamaica. The 1833 Abolition Act took effect in 1834; compulsory unpaid “apprenticeship” then continued until 1838. Compensation went to slave-owners, not the people they had enslaved. Legal freedom left questions of land, wages and political power unresolved.",
        question: "Why are 1807, 1834 and 1838 different turning points?",
        hint: "Separate the trade in people, legal slavery and the compulsory labour system that followed.",
        year: 1838,
        territoryId: "jamaica",
      },
    ],
    sources: [
      {
        title: "The National Archives · Sam Sharpe’s rebellion",
        url: "https://www.nationalarchives.gov.uk/education/students/videos/spotlight-on/spotlight-on-baptist-war/spotlight-on-baptist-war-video-transcript/",
      },
      {
        title: "UCL · Legacies of British Slavery",
        url: "https://www.ucl.ac.uk/made-at-ucl/stories/legacies-british-slavery",
      },
      {
        title: "The National Archives · Slavery and emancipation",
        url: "https://www.nationalarchives.gov.uk/education/resources/slavery/",
      },
    ],
  },
  {
    id: "company",
    title: "The company that became a ruler",
    description:
      "Follow India from commercial ambition to colonial government and independence.",
    minutes: 12,
    territoryId: "british-india",
    year: 1757,
    steps: [
      {
        title: "From merchants to a military power",
        body: "The East India Company began in 1600 as a trading company. Its victory at Plassey in 1757 depended on alliances and divisions within Bengal, as well as military force. It helped the Company influence who governed Bengal. This was a turning point in a long expansion, not the conquest of all India at once.",
        question: "Why is “Britain conquered India in 1757” too simple?",
        hint: "Think about the size of India, the role of Indian allies and what happened after this battle.",
        year: 1757,
        territoryId: "british-india",
      },
      {
        title: "Taxes help pay for expansion",
        body: "In 1765, the Company gained the right to collect revenue in Bengal, Bihar and Orissa. Taxes paid by people in India helped finance its army and further expansion. Most of its soldiers were Indian. Trade, taxation and military power now reinforced one another.",
        question:
          "Explain the connection between collecting taxes and taking more territory.",
        hint: "Try this chain: revenue pays for an army; an army can secure more territory; that territory can supply more revenue.",
        year: 1765,
        territoryId: "british-india",
      },
      {
        title: "Rebellion changes who rules",
        body: "In 1857, Indian soldiers and civilian groups rebelled against Company rule, with different aims in different regions. After violently suppressing the rebellion, Britain transferred the Company’s governing powers to the Crown in 1858. Directly governed provinces existed alongside princely states, whose rulers remained subject to British supremacy.",
        question: "What changed in 1858, and what continued?",
        hint: "The governing institution changed. British authority continued, and the forms of rule still varied across India.",
        year: 1858,
        territoryId: "british-india",
      },
      {
        title: "Independence, and partition",
        body: "Mass movements, political negotiation and the pressures of the Second World War helped end British rule. India and Pakistan became independent in 1947. Partition divided British India; new borders and communal violence drove people from their homes. Independence brought self-government, but did not settle every dispute over territory or belonging.",
        question:
          "What would a map of independence show—and what would it leave out?",
        hint: "Compare a border changing colour with a family deciding whether it is safe to remain at home.",
        year: 1947,
        territoryId: "british-india",
      },
    ],
    sources: [
      {
        title: "UK Parliament · Parliament and the East India Company",
        url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/parliament-and-the-east-india-company/",
      },
      {
        title: "Government of India Act 1858 · Original legislation",
        url: "https://www.legislation.gov.uk/ukpga/Vict/21-22/106/contents/enacted",
      },
      {
        title: "UK Parliament · Empire and independence, 1815–1970",
        url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/key-dates/parliament-and-empire-1815-1970/",
      },
    ],
  },
  {
    id: "independence",
    title: "The struggle for independence",
    description:
      "Follow Kenya through the conflicts over land, colonial rule and self-government.",
    minutes: 12,
    territoryId: "kenya",
    year: 1920,
    steps: [
      {
        title: "Land and an unequal political voice",
        body: "Britain declared the East Africa Protectorate in 1895 and made most of it the Colony of Kenya in 1920. European settlers took valuable farmland. Colonial taxes and land policies pushed Africans towards wage labour, while political power favoured settlers. Demands for land and representation grew together.",
        question:
          "How could control of land also shape people’s political power?",
        hint: "Consider who could make the rules, who owned farmland and who needed to work for wages.",
        year: 1920,
        territoryId: "kenya",
      },
      {
        title: "Resistance and the emergency",
        body: "The Mau Mau movement fought colonial rule, with land and freedom central to its demands. Britain declared an emergency in 1952. Colonial authorities used detention without trial, forced resettlement and torture. The conflict also divided Kenyan communities; Mau Mau fighters attacked African opponents as well as settlers.",
        question:
          "Why does a simple story of “British against Kenyans” miss part of this conflict?",
        hint: "People within Kenya held different positions and faced different pressures. Recognising this does not erase the power of the colonial state.",
        year: 1952,
        territoryId: "kenya",
      },
      {
        title: "Different routes to the same demand",
        body: "Armed resistance was one part of a wider independence struggle. Political parties, trade unionists and negotiators also pressed for change. After constitutional talks and elections, Kenya became independent on 12 December 1963, with Jomo Kenyatta as prime minister. Independence emerged from conflict and negotiation over years.",
        question:
          "Which actions helped bring independence beyond fighting alone?",
        hint: "Name political organising, trade union activity, negotiations and elections. Explain how more than one could matter.",
        year: 1963,
        territoryId: "kenya",
      },
      {
        title: "The flag changes. Questions remain.",
        body: "Independence ended British government in Kenya, but disputes about land and the violence of colonial rule continued. Decades later, survivors pursued claims in British courts. In 2013, Britain agreed a settlement and acknowledged torture and ill-treatment during the emergency. People affected by empire continued to shape how its history was recognised.",
        question:
          "Why might the history of independence continue long after independence day?",
        hint: "Distinguish the transfer of political authority from the longer struggles over land, memory and redress.",
        year: 1963,
        territoryId: "kenya",
      },
    ],
    sources: [
      {
        title: "The National Archives · Kenya’s colonial records (PDF)",
        url: "https://cdn.nationalarchives.gov.uk/documents/migrated-archives-guidance.pdf",
      },
      {
        title: "Kenya Independence Act 1963 · Original legislation (PDF)",
        url: "https://www.legislation.gov.uk/ukpga/1963/54/pdfs/ukpga_19630054_en.pdf",
      },
      {
        title: "UK government · Statement on Mau Mau claims, 2013",
        url: "https://www.gov.uk/government/news/statement-to-parliament-on-settlement-of-mau-mau-claims",
      },
    ],
  },
];

// These questions retrieve the six overview waypoints, so any story can be chosen.
export const quiz = [
  {
    id: "company-or-crown",
    question: "What did the East India Company’s charter of 1600 begin?",
    options: [
      "Direct British government across India",
      "A company authorised to trade in Asia",
      "Indian independence from Britain",
    ],
    answer: 1,
    explanation:
      "It began as a trading company. Its territorial power developed later through war, alliances and revenue collection.",
  },
  {
    id: "crown-rule",
    question: "What changed in India in 1858?",
    options: [
      "Every princely state became a directly ruled province",
      "India and Pakistan became independent",
      "The Crown took over the Company’s governing powers",
    ],
    answer: 2,
    explanation:
      "After the 1857 rebellion, Company government gave way to Crown rule. Direct rule still coexisted with princely states under British authority.",
  },
  {
    id: "map-and-power",
    question: "What does the empire’s large extent around 1922 tell us?",
    options: [
      "British connections covered a vast area, but forms of control differed",
      "Every territory was governed directly from London",
      "Demands for independence had stopped",
    ],
    answer: 0,
    explanation:
      "Territorial extent and political control are different. Self-governing dominions, colonies and mandates had different relationships with Britain.",
  },
  {
    id: "partition",
    question:
      "Which best describes the independence of India and Pakistan in 1947?",
    options: [
      "A transfer of power that left existing borders untouched",
      "The year British rule ended in every colony",
      "Self-government accompanied by partition, displacement and violence",
    ],
    answer: 2,
    explanation:
      "Independence and partition happened together. Freedom from British rule coincided with upheaval for people living across the new borders.",
  },
  {
    id: "after-1997",
    question: "Why is 1997 a landmark rather than a complete ending?",
    options: [
      "Hong Kong remained under British sovereignty",
      "Hong Kong changed sovereignty, while other territories and imperial legacies continued",
      "All former colonies became part of the Commonwealth that year",
    ],
    answer: 1,
    explanation:
      "Hong Kong passed to Chinese sovereignty. Other British overseas territories remained, and empire’s effects continued in borders, migration, land and institutions.",
  },
];

export const teacherNotes = {
  audience: "Ages 15–18",
  duration: 45,
  aim: "Explain how British imperial power changed, how people challenged it, and why a map cannot tell the whole story.",
  timingNote:
    "Suggested timings include reading, map use and discussion. Adapt them to your class.",
  plan: [
    {
      minutes: 5,
      title: "Notice",
      activity:
        "Show the map at 1922. Ask students what it shows, and what they would need to know before calling a place “British”.",
    },
    {
      minutes: 8,
      title: "Get the overview",
      activity:
        "Read the six timeline waypoints together. Distinguish trade, colonial government, self-government and independence.",
    },
    {
      minutes: 12,
      title: "Follow one story",
      activity:
        "Choose Jamaica, India or Kenya. Work through its four steps in pairs, using the map and discussion prompts.",
    },
    {
      minutes: 10,
      title: "Build an explanation",
      activity:
        "Each pair explains one change using a date, a place and an action taken by people living there. Compare explanations as a class.",
    },
    {
      minutes: 5,
      title: "Check recall",
      activity:
        "Answer the five overview questions individually, then discuss the explanations.",
    },
    {
      minutes: 5,
      title: "Exit ticket",
      activity:
        "Finish: “The map helps me understand …, but it cannot show …”. Support both parts with an example.",
    },
  ],
  successCriteria: [
    "Use a specific place and date to explain a change in imperial power.",
    "Describe an action taken by people living under colonial rule.",
    "Identify one limit of using a map as historical evidence.",
  ],
  sourceNote:
    "Story summaries work offline. Source links need an internet connection. Official records show the views and purposes of their authors; compare them with the people and experiences they leave out.",
  mapNote:
    "The atlas uses modern geographical units to approximate historical coverage. A coloured area does not mean uniform control, agreement or consent.",
};
