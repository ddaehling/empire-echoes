// Six historical-to-contemporary enquiries and a final comment, with editable, ungraded responses.
// Stable task IDs are paired with contentRevision so earlier work keeps its original prompts.
// Source IDs preserve provenance; optional help never controls completion.
export const rallye = {
  id: "empire-echoes-rallye-v1",
  activityLabel: "An English enquiry",
  title: "Empire. Evidence. Identity.",
  subtitle: "Explore the history. Read the evidence. Develop your own view.",
  minutes: 60,
  introduction:
    "How did imperial relationships develop, and how are they remembered or reworked in Britain? At six stops, connect historical evidence with a recent act of remembrance, a personal account or an official statement. Then choose two cases to develop your own view about British identities today.",
  instructions: [
    "At each stop, read the introduction and prepared evidence, then write one response connecting the history with the later example. The introductions explain the history you need; you can work in your own words and at your own pace.",
    "Use the map to explore where and when events happened. Extra sources and language help are available if you want them. The prepared evidence can be read without opening other websites.",
    "Your writing saves in this browser and stays editable. You can return to an earlier stop or download your work whenever you want.",
  ],
  framing:
    "British identities are the different ways people understand their connection to Britain. Nation, region, family, language, religion and other experiences can overlap. A personal account, museum display or royal speech reveals a particular perspective; none speaks for everyone. The recent examples here are dated evidence for thinking about Britain today, not proof of everyone’s views in 2026.",
  mapReminder:
    "The map shows changing political relationships using annual snapshots and approximate modern geographical areas. A shared colour does not mean that everyone had the same rights or experiences. The sources help explain the people and decisions behind the colours.",
  stations: [
    {
      id: "profit-and-power",
      caseLabel: "Company rule and public monuments",
      title: "When trade becomes rule",
      location: "Bengal / Britain",
      period: "1757 → 1765 · remembered in 2020–2021",
      minutes: 6,
      theme: "Commerce, wealth and power",
      context:
        "The East India Company began as an English trading business run by merchants who wanted to make money from trade with Asia. In 1600, Queen Elizabeth I gave it a charter: an official document allowing the Company to operate. That permission did not make it the ruler of India. Over time, the Company became involved in wars and agreements with Indian rulers, as well as buying and selling goods.\n\nThis stop takes you to Bengal, in the eastern part of the Indian subcontinent. In 1757, the Company helped change its ruler; in 1765, it gained the right to collect taxes, called revenue. The later evidence takes you to a debate about a statue of Robert Clive in Shrewsbury. A statue in a public square gives a selected person a visible place in a town’s history. Consider how knowledge of Company rule affects what that act of remembrance might mean.",
      mapFocus: {
        year: 1765,
        territoryId: "british-india",
      },
      sourceIds: ["profit-company", "profit-charter", "profit-clive-memory"],
      presentDaySourceIds: ["profit-clive-memory"],
      researchInstructions: [
        "You can compare 1600 with 1765 on the map to see how the Company’s position changed.",
      ],
      investigation: {
        prompt:
          "How far does Company rule in Bengal help explain the debate over Clive’s statue in Shrewsbury? Choose the strongest historical evidence and use the council record to justify your answer. Distinguish what this debate reveals about public memory from what it can tell you about people across Britain.",
        instructions: [],
        operator: "Connect and judge",
        responsePurpose: "Your judgement on a public monument",
        support: {
          stems: [
            "The development that most helps explain this debate is … because …",
            "The council record supports a claim about …, but not …",
          ],
          vocabulary: [
            {
              term: "revenue",
              meaning: "money received, for example through taxes",
            },
            {
              term: "to govern",
              meaning: "to exercise authority over a place and its people",
            },
            {
              term: "to finance",
              meaning: "to provide money for something",
            },
          ],
        },
        discussionPrompts: [
          "What difference does it make to display a monument in a public square?",
          "Does knowing the history settle how it should be remembered, or leave room for different choices?",
        ],
      },
      essentialSourceIds: ["profit-company", "profit-clive-memory"],
      contextParagraphs: [
        "The East India Company began as an English trading business run by merchants who wanted to make money from trade with Asia. In 1600, Queen Elizabeth I gave it a charter: an official document allowing the Company to operate. That permission did not make it the ruler of India. Over time, the Company became involved in wars and agreements with Indian rulers, as well as buying and selling goods.",
        "This stop takes you to Bengal, in the eastern part of the Indian subcontinent. In 1757, the Company helped change its ruler; in 1765, it gained the right to collect taxes, called revenue. The later evidence takes you to a debate about a statue of Robert Clive in Shrewsbury. A statue in a public square gives a selected person a visible place in a town’s history. Consider how knowledge of Company rule affects what that act of remembrance might mean.",
      ],
    },
    {
      id: "freedom-and-memory",
      caseLabel: "Slavery and contested memory",
      title: "Who made freedom happen?",
      location: "Jamaica / Britain",
      period: "1831 → 1838 · remembered in 2024",
      minutes: 7,
      theme: "Enslavement, resistance and remembrance",
      context:
        "Jamaica was a British colony in the Caribbean. On plantations, enslaved people were forced to work, often producing sugar for sale overseas. Enslavement meant that people were treated as property and denied control over their own lives. They resisted in different ways, while campaigners also demanded an end to slavery. Abolition means ending a practice through law; emancipation means being freed from slavery.\n\nResistance in Jamaica and decisions in Britain’s Parliament formed part of the struggle over slavery and freedom. A museum label chooses whose actions readers encounter. You will propose wording for one, then consider a real museum display in Bristol in 2024. The display concerns a statue of Edward Colston, who was involved in the slave trade long before the Jamaican rebellion. These are different histories within the wider question of how Britain remembers slavery.",
      mapFocus: {
        year: 1838,
        territoryId: "jamaica",
      },
      sourceIds: ["freedom-rebellion", "freedom-compensation", "freedom-bristol-memory"],
      presentDaySourceIds: ["freedom-bristol-memory"],
      researchInstructions: [
        "You can find Jamaica on the map in 1838. It was still a British colony when compulsory apprenticeship ended.",
      ],
      investigation: {
        prompt:
          "Rewrite this proposed museum label: “Britain gave enslaved people their freedom.” Use the Jamaica sources to decide whose actions matter. Explain which idea about Britain your changes invite visitors to reconsider, using the historical evidence and one feature of M Shed’s 2024 display.",
        instructions: [],
        operator: "Rewrite and interpret",
        responsePurpose: "Your museum label and its purpose",
        support: {
          stems: [
            "My label emphasises … because …",
            "The display’s choice to … invites visitors to …",
          ],
          vocabulary: [
            {
              term: "resistance",
              meaning: "action against an imposed power",
            },
            {
              term: "abolition",
              meaning: "the legal ending of slavery",
            },
            {
              term: "compensation",
              meaning: "money paid for a loss; here, it went to slave-owners",
            },
          ],
        },
        discussionPrompts: [
          "What changes when a museum displays evidence of a protest alongside a monument?",
          "What can a display show about public debate, and what would you need to know about visitors’ responses?",
        ],
      },
      essentialSourceIds: [
        "freedom-rebellion",
        "freedom-compensation",
        "freedom-bristol-memory",
      ],
      contextParagraphs: [
        "Jamaica was a British colony in the Caribbean. On plantations, enslaved people were forced to work, often producing sugar for sale overseas. Enslavement meant that people were treated as property and denied control over their own lives. They resisted in different ways, while campaigners also demanded an end to slavery. Abolition means ending a practice through law; emancipation means being freed from slavery.",
        "Resistance in Jamaica and decisions in Britain’s Parliament formed part of the struggle over slavery and freedom. A museum label chooses whose actions readers encounter. You will propose wording for one, then consider a real museum display in Bristol in 2024. The display concerns a statue of Edward Colston, who was involved in the slave trade long before the Jamaican rebellion. These are different histories within the wider question of how Britain remembers slavery.",
      ],
    },
    {
      id: "rule-and-resistance",
      caseLabel: "Monarchy and the Commonwealth",
      title: "One colour, unequal power",
      location: "India / Britain",
      period: "1858 → 1949 → 2024",
      minutes: 7,
      theme: "Authority, agency and unequal citizenship",
      context:
        "By the mid-nineteenth century, the East India Company governed large parts of India. In 1857, soldiers and other groups rose against its rule. Their reasons and aims differed; people in India did not all take the same side. After the uprising, Britain's Parliament transferred the Company's governing powers to the Crown in 1858. Crown rule meant government under the authority of the British monarch, carried out through British ministers and officials.\n\nVictoria’s proclamation, a public announcement, presented the new government’s position after conflict and distrust. Much later, independence changed the relationship: India became independent in 1947, and the 1949 London Declaration allowed it to remain in the Commonwealth as a republic. The monarch symbolised an association of independent countries rather than ruling India. Read Victoria’s words alongside Charles III’s 2024 account of his Commonwealth role. Compare what these official statements present with what they can establish about people’s experiences.",
      mapFocus: {
        year: 1858,
        territoryId: "british-india",
      },
      sourceIds: [
        "rule-proclamation",
        "rule-canada",
        "rule-government",
        "rule-rebellion",
        "rule-commonwealth",
      ],
      presentDaySourceIds: ["rule-commonwealth"],
      researchInstructions: [
        "You can explore India in 1858. The optional Canada source shows a different form of government within the same empire.",
      ],
      investigation: {
        prompt:
          "How has the relationship presented by the monarchy changed from Victoria’s proclamation to Charles’s 2024 Commonwealth speech? Analyse one phrase from Victoria and use the 1949 change to explain your comparison. Judge what these sources reveal about the monarchy’s image of Britain’s place in the world, and how much that image can tell us about British identities.",
        instructions: [],
        operator: "Compare official language",
        responsePurpose: "Your reading of Britain’s royal image",
        support: {
          stems: [
            "Victoria’s phrase “…” presents a relationship in which …",
            "The 1949 change matters to this comparison because …",
            "This institutional image can tell us …, but …",
          ],
          vocabulary: [
            {
              term: "impartial",
              meaning: "treating different sides fairly",
            },
            {
              term: "disclaim",
              meaning: "to say that you do not claim a right or intention",
            },
            {
              term: "conviction",
              meaning: "a firmly held belief",
            },
            {
              term: "molested or disquieted",
              meaning: "here: harassed or disturbed because of religious belief",
            },
            {
              term: "proclamation",
              meaning: "a public announcement by a ruler or government",
            },
            {
              term: "to reassure",
              meaning: "to make someone feel less worried",
            },
          ],
        },
        discussionPrompts: [
          "What would be misleading about describing the Commonwealth as the empire with a different name?",
          "What evidence could test whether a royal statement is accepted by people inside or outside Britain?",
        ],
      },
      essentialSourceIds: ["rule-proclamation", "rule-commonwealth"],
      contextParagraphs: [
        "By the mid-nineteenth century, the East India Company governed large parts of India. In 1857, soldiers and other groups rose against its rule. Their reasons and aims differed; people in India did not all take the same side. After the uprising, Britain's Parliament transferred the Company's governing powers to the Crown in 1858. Crown rule meant government under the authority of the British monarch, carried out through British ministers and officials.",
        "Victoria’s proclamation, a public announcement, presented the new government’s position after conflict and distrust. Much later, independence changed the relationship: India became independent in 1947, and the 1949 London Declaration allowed it to remain in the Commonwealth as a republic. The monarch symbolised an association of independent countries rather than ruling India. Read Victoria’s words alongside Charles III’s 2024 account of his Commonwealth role. Compare what these official statements present with what they can establish about people’s experiences.",
      ],
    },
    {
      id: "departure-and-division",
      caseLabel: "Partition and family memory",
      title: "Independence is more than a border",
      location: "India / Pakistan / Britain",
      period: "1947 · remembered in 2022",
      minutes: 7,
      theme: "Decolonisation and its human consequences",
      context:
        "In 1947, British rule in India ended after decades of political campaigning, resistance and negotiations. British India was divided into two independent countries, India and Pakistan. This division is called partition. New borders cut through Punjab and Bengal, regions where people from different religious communities lived. Millions of people fled or were forced to leave their homes, and violence affected many communities around the time of independence.\n\nA map can show new countries and borders; individual accounts reveal concerns and experiences it leaves out. The archive’s Singh letter and the experience remembered by Iqbal’s aunt both concern events before the 1947 border was drawn. A separate source takes you to a London museum in 2022, where Imran Javed displayed an object connected to his own family’s partition history. Keep these people and dates distinct when relating an experience to a later act of remembering.",
      mapFocus: {
        year: 1947,
        territoryId: "british-india",
      },
      sourceIds: ["departure-partition", "departure-family-memory"],
      presentDaySourceIds: ["departure-family-memory"],
      researchInstructions: [
        "You can compare 1946 and 1948 on the map to see the change from British rule to independence.",
      ],
      investigation: {
        prompt:
          "What can Javed’s 2022 display tell us about the place of partition in Britain’s public memory? Use his object and one earlier account to develop an explanation, keeping the different people and dates distinct. Judge what his later choice to remember adds to an account of independence told only through borders, and how widely your interpretation can apply.",
        instructions: [],
        operator: "Interpret family memory",
        responsePurpose: "Your interpretation of a remembered past",
        support: {
          stems: [
            "The earlier account makes visible …, while Javed’s object …",
            "Choosing to display the object turns … into …",
            "This interpretation applies to …; to extend it, we would need …",
          ],
          vocabulary: [
            {
              term: "partition",
              meaning: "the division of a territory into separate parts",
            },
            {
              term: "displacement",
              meaning: "being forced to leave one’s home",
            },
            {
              term: "testimony",
              meaning: "a person’s account of an experience",
            },
          ],
        },
        discussionPrompts: [
          "How does a private family object change when it enters a public museum?",
          "Why can neither the family object nor the earlier accounts represent everyone affected by partition?",
        ],
      },
      essentialSourceIds: ["departure-partition", "departure-family-memory"],
      contextParagraphs: [
        "In 1947, British rule in India ended after decades of political campaigning, resistance and negotiations. British India was divided into two independent countries, India and Pakistan. This division is called partition. New borders cut through Punjab and Bengal, regions where people from different religious communities lived. Millions of people fled or were forced to leave their homes, and violence affected many communities around the time of independence.",
        "A map can show new countries and borders; individual accounts reveal concerns and experiences it leaves out. The archive’s Singh letter and the experience remembered by Iqbal’s aunt both concern events before the 1947 border was drawn. A separate source takes you to a London museum in 2022, where Imran Javed displayed an object connected to his own family’s partition history. Keep these people and dates distinct when relating an experience to a later act of remembering.",
      ],
    },
    {
      id: "migration-and-belonging",
      caseLabel: "Windrush and belonging",
      title: "Who gets to belong?",
      location: "The Caribbean / Britain",
      period: "1948 → the 2020 review → 2022",
      minutes: 6,
      theme: "Citizenship, migration and everyday belonging",
      context:
        "Empire Windrush was the name of a ship that brought passengers from the Caribbean and elsewhere to Britain in June 1948. At the time, Jamaica and several other Caribbean islands were British colonies, and their people were British subjects: they had a legal relationship with Britain through its empire. The name Windrush has also come to describe a wider generation of people who moved from the Caribbean to Britain after the Second World War.\n\nDecades later, the Windrush scandal revealed that lawful residents had been wrongly treated as having no right to be in Britain. You will read Ena Sullivan’s earlier record and a separate 2020 review with its 2022 follow-up, including another person’s words about England and the policy decisions behind wrongful exclusion. A third source describes the National Windrush Monument unveiled in 2022. Consider how a legal relationship, institutional treatment, personal attachment and public recognition can differ. An act of commemoration does not itself show that earlier injustices have been resolved.",
      mapFocus: {
        year: 1948,
        territoryId: "jamaica",
      },
      sourceIds: ["migration-windrush", "migration-review", "migration-monument"],
      presentDaySourceIds: ["migration-review", "migration-monument"],
      researchInstructions: [
        "You can find Jamaica in 1948. It remained a British colony until 1962.",
      ],
      investigation: {
        prompt:
          "How far does the imperial relationship explain the tension between “my beloved England”, the treatment described by the review and the public recognition offered by the 2022 monument? Analyse the witness’s words, then assess what later policy choices and acts of remembrance add to your explanation of belonging.",
        instructions: [],
        operator: "Analyse and weigh explanations",
        responsePurpose: "Your argument about belonging",
        support: {
          stems: [
            "The words “…” suggest … when read beside …",
            "The imperial relationship helps explain …, while the later decision to …",
          ],
          vocabulary: [
            {
              term: "legal status",
              meaning: "a person’s position under the law",
            },
            {
              term: "belonging",
              meaning: "being or feeling part of a community",
            },
            {
              term: "lawful resident",
              meaning: "someone who has a legal right to live in a country",
            },
          ],
        },
        discussionPrompts: [
          "How do migrants and their descendants participate in choosing what Britain remembers?",
          "Why does evidence of public recognition differ from evidence of how welcome a person feels?",
        ],
      },
      essentialSourceIds: ["migration-windrush", "migration-review", "migration-monument"],
      contextParagraphs: [
        "Empire Windrush was the name of a ship that brought passengers from the Caribbean and elsewhere to Britain in June 1948. At the time, Jamaica and several other Caribbean islands were British colonies, and their people were British subjects: they had a legal relationship with Britain through its empire. The name Windrush has also come to describe a wider generation of people who moved from the Caribbean to Britain after the Second World War.",
        "Decades later, the Windrush scandal revealed that lawful residents had been wrongly treated as having no right to be in Britain. You will read Ena Sullivan’s earlier record and a separate 2020 review with its 2022 follow-up, including another person’s words about England and the policy decisions behind wrongful exclusion. A third source describes the National Windrush Monument unveiled in 2022. Consider how a legal relationship, institutional treatment, personal attachment and public recognition can differ. An act of commemoration does not itself show that earlier injustices have been resolved.",
      ],
    },
    {
      id: "remembering-empire",
      caseLabel: "Kenya and public recognition",
      title: "When does an empire end?",
      location: "Kenya / Britain",
      period: "1950s → 1963 → 2013 → 2023",
      minutes: 7,
      theme: "Independence, responsibility and continuing connections",
      context:
        "Kenya, in East Africa, was under British colonial rule. In the 1950s, the Mau Mau movement fought against that rule. The colonial government declared an emergency and detained many people, meaning it held them in camps or prisons, often without a trial. People suffered torture and other ill-treatment at the hands of the colonial authorities. Kenya became independent in 1963, but some survivors later brought claims against the British government over their treatment.\n\nIn 2013, Foreign Secretary William Hague announced a settlement of survivors’ claims in Parliament. His statement expressed regret while denying liability, meaning legal responsibility. Ten years later, Charles III spoke in Kenya about colonial harm, the countries’ relationship and British Kenyans. These are two dated official accounts. Examine how each presents Britain, while distinguishing the government’s and monarch’s positions from survivors’ responses or the identities of people in Britain.",
      mapFocus: {
        year: 1963,
        territoryId: "kenya",
      },
      sourceIds: ["memory-mau-mau", "memory-hong-kong", "memory-royal-visit"],
      presentDaySourceIds: ["memory-royal-visit"],
      researchInstructions: [
        "You can explore Kenya around its independence in 1963. Hong Kong’s transfer in 1997 is an optional comparison.",
      ],
      investigation: {
        prompt:
          "Does Charles’s 2023 speech strengthen or complicate the recognition offered by Hague in 2013? Use the wording of Hague’s statement and the King’s account to assess how these institutions present Britain’s imperial past and its relationship with Kenya. Explain what your judgement can—and cannot—show about ideas of Britain today.",
        instructions: [],
        operator: "Evaluate public recognition",
        responsePurpose: "Your judgement on Britain’s public image",
        support: {
          stems: [
            "Hague’s words “…” recognise … while …",
            "Read alongside the 2023 speech, this suggests …",
            "This supports a judgement about …, rather than …",
          ],
          vocabulary: [
            {
              term: "to acknowledge",
              meaning: "to recognise that something happened or is true",
            },
            {
              term: "liability",
              meaning: "legal responsibility",
            },
            {
              term: "settlement",
              meaning: "an agreement intended to resolve a dispute",
            },
            {
              term: "a qualified judgement",
              meaning: "a judgement that recognises limits or considers a counterargument",
            },
          ],
        },
        discussionPrompts: [
          "What would evidence from survivors or British Kenyans add to these official accounts?",
          "Does a later statement establish a changed relationship, or a claim about one?",
        ],
      },
      essentialSourceIds: ["memory-mau-mau", "memory-royal-visit"],
      contextParagraphs: [
        "Kenya, in East Africa, was under British colonial rule. In the 1950s, the Mau Mau movement fought against that rule. The colonial government declared an emergency and detained many people, meaning it held them in camps or prisons, often without a trial. People suffered torture and other ill-treatment at the hands of the colonial authorities. Kenya became independent in 1963, but some survivors later brought claims against the British government over their treatment.",
        "In 2013, Foreign Secretary William Hague announced a settlement of survivors’ claims in Parliament. His statement expressed regret while denying liability, meaning legal responsibility. Ten years later, Charles III spoke in Kenya about colonial harm, the countries’ relationship and British Kenyans. These are two dated official accounts. Examine how each presents Britain, while distinguishing the government’s and monarch’s positions from survivors’ responses or the identities of people in Britain.",
      ],
    },
  ],
  finalAssessment: {
    id: "whose-britain",
    title: "The past inside the present",
    period: "1600 → today",
    minutes: 20,
    theme: "A comment for your school magazine",
    context:
      "Your school magazine is preparing an issue about British identities: how people describe themselves, where they feel they belong, and how Britain is publicly represented. The census evidence below shows that identities can overlap. It records people’s chosen labels in England and Wales, not why they chose them. Your cases concern particular people, disputes or institutions; they cannot stand for everyone.\n\nA historical fact alone does not explain an identity today. Connect it to a dated later experience or act of remembrance and explain why that link matters. “How far” asks what imperial history explains well, what it cannot explain, and why. Compare the two cases before reaching an overall judgement. Explain how a source limitation or another influence supported by evidence affects what you conclude. A comment presents and supports your view for readers who may know little about the history.",
    sourceIds: ["final-identities", "final-charter"],
    researchInstructions: [
      "All six cases have historical and contemporary evidence you can reuse. Open a case below to find your response, notes and sources; you do not need to visit another website.",
    ],
    investigation: {
      prompt:
        "Write a comment for your school magazine answering: “How far does Britain’s imperial past help explain British identities today?” Choose two cases from your journey and explain how each helps you understand belonging, public memory or ideas about Britain today. Use historical and contemporary evidence for each case. Compare what imperial history explains across the two, then explain how a relevant limit or another influence supported by evidence changes your overall judgement.",
      instructions: [
        "Before drafting, choose the historical evidence, the contemporary evidence and the connection you can explain for each case. Decide what those connections together justify—and what they leave unexplained.",
        "Name the source or person and date the contemporary evidence so readers can follow your thinking. The census can help you limit a claim about British identities; it does not show what caused them.",
      ],
      operator: "Comment",
      responsePurpose: "Your school-magazine comment",
      support: {
        stems: [
          "The historical relationship helps explain … in [person’s/institution’s] later account because …",
          "Compared with …, this case explains … more/less directly because …",
          "This limit changes my overall judgement by …",
        ],
        vocabulary: [
          {
            term: "public memory",
            meaning: "how a society remembers and discusses its past",
          },
          {
            term: "a legacy",
            meaning: "an effect of the past that continues",
          },
          {
            term: "to qualify a claim",
            meaning: "to make clear when, or how far, a statement is true",
          },
        ],
      },
      discussionPrompts: [
        "Do your two cases explain the same aspect of identity or public memory, or different ones? What does that change about your judgement?",
        "Does a limit reveal that empire explains less, or only that these sources cannot establish a broader claim?",
      ],
    },
    essentialSourceIds: ["final-identities"],
    contextParagraphs: [
      "Your school magazine is preparing an issue about British identities: how people describe themselves, where they feel they belong, and how Britain is publicly represented. The census evidence below shows that identities can overlap. It records people’s chosen labels in England and Wales, not why they chose them. Your cases concern particular people, disputes or institutions; they cannot stand for everyone.",
      "A historical fact alone does not explain an identity today. Connect it to a dated later experience or act of remembrance and explain why that link matters. “How far” asks what imperial history explains well, what it cannot explain, and why. Compare the two cases before reaching an overall judgement. Explain how a source limitation or another influence supported by evidence affects what you conclude. A comment presents and supports your view for readers who may know little about the history.",
    ],
  },
  contentRevision: "identity-connections-2026-10-01",
};
