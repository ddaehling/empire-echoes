// Six historical enquiries and a final comment, with editable, ungraded responses.
// Stable task IDs are paired with contentRevision so earlier work keeps its original prompts.
// Source IDs preserve provenance; optional help never controls completion.
export const rallye = {
  id: "empire-echoes-rallye-v1",
  activityLabel: "An English enquiry",
  title: "Empire. Evidence. Identity.",
  subtitle: "Explore the history. Read the evidence. Develop your own view.",
  minutes: 45,
  introduction:
    "How did a trading company gain power in India? Who resisted slavery? What changed when colonies became independent, and what connections remained? Follow six historical stops, then bring your ideas together in a comment about British identities today.",
  instructions: [
    "At each stop, read the introduction and the prepared evidence, then write your response. The introductions explain the history you need; you can work in your own words and at your own pace.",
    "Use the map to explore where and when events happened. Extra sources and language help are available if you want them. The prepared evidence can be read without opening other websites.",
    "Your writing saves in this browser and stays editable. You can return to an earlier stop or download your work whenever you want.",
  ],
  framing:
    "British identities are the different ways people understand their connection to Britain. Someone may describe themselves through their nation, region, family, language, religion or other experiences, and these connections can overlap. People in Britain do not all share one identity or one view of the past. As you read, distinguish what a particular person or government says from what you can know about a whole population.",
  mapReminder:
    "The map shows changing political relationships using annual snapshots and approximate modern geographical areas. A shared colour does not mean that everyone had the same rights or experiences. The sources help explain the people and decisions behind the colours.",
  stations: [
    {
      id: "profit-and-power",
      title: "When trade becomes rule",
      location: "Bengal / Britain",
      period: "1600 → 1765",
      minutes: 4,
      theme: "Commerce, wealth and power",
      context:
        "The East India Company began as an English trading business run by merchants who wanted to make money from trade with Asia. In 1600, Queen Elizabeth I gave it a charter: an official document allowing the Company to operate. That permission did not make it the ruler of India. Over time, the Company became involved in wars and agreements with Indian rulers, as well as buying and selling goods.\n\nThis stop takes you to Bengal, in the eastern part of the Indian subcontinent. By 1765, the Company had gained the right to collect taxes there. Tax income is called revenue. You will compare the Company's position in 1600 and 1765, then use the evidence to explain how control of money could change what a trading business was able to do.",
      mapFocus: {
        year: 1765,
        territoryId: "british-india",
      },
      sourceIds: ["profit-company", "profit-charter"],
      researchInstructions: [
        "You can compare 1600 with 1765 on the map to see how the Company’s position changed.",
      ],
      investigation: {
        prompt:
          "Explain how the East India Company gained more power in Bengal between 1600 and 1765. Use the source to connect its new right to collect taxes with its ability to govern.",
        instructions: [],
        operator: "Explain",
        responsePurpose: "Your explanation",
        support: {
          stems: [
            "At first, the Company … . Later, it … .",
            "This gave it more power because …",
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
          "How can control over money help an organisation control a territory?",
          "What might a taxpayer’s account add to the museum’s explanation?",
        ],
      },
      essentialSourceIds: ["profit-company"],
      contextParagraphs: [
        "The East India Company began as an English trading business run by merchants who wanted to make money from trade with Asia. In 1600, Queen Elizabeth I gave it a charter: an official document allowing the Company to operate. That permission did not make it the ruler of India. Over time, the Company became involved in wars and agreements with Indian rulers, as well as buying and selling goods.",
        "This stop takes you to Bengal, in the eastern part of the Indian subcontinent. By 1765, the Company had gained the right to collect taxes there. Tax income is called revenue. You will compare the Company's position in 1600 and 1765, then use the evidence to explain how control of money could change what a trading business was able to do.",
      ],
    },
    {
      id: "freedom-and-memory",
      title: "Who made freedom happen?",
      location: "Jamaica / Britain",
      period: "1831 → 1838",
      minutes: 5,
      theme: "Enslavement, resistance and remembrance",
      context:
        "Jamaica was a British colony in the Caribbean. On plantations, enslaved people were forced to work, often producing sugar for sale overseas. Enslavement meant that people were treated as property and denied control over their own lives. They resisted in different ways, while campaigners also demanded an end to slavery. Abolition means ending a practice through law; emancipation means being freed from slavery.\n\nIn the 1830s, resistance in Jamaica and decisions in Britain's Parliament formed part of the struggle over slavery and freedom. At this stop, you are helping to improve a museum label for visitors your age. A label tells readers who acted and what changed, so its choice of words matters. Read the evidence about resistance and the changes between 1833 and 1838 before deciding how to tell this story.",
      mapFocus: {
        year: 1838,
        territoryId: "jamaica",
      },
      sourceIds: ["freedom-rebellion", "freedom-compensation"],
      researchInstructions: [
        "You can find Jamaica on the map in 1838. It was still a British colony when compulsory apprenticeship ended.",
      ],
      investigation: {
        prompt:
          "A museum label says: “Britain gave enslaved people their freedom.” Rewrite the label for visitors your age. Show that enslaved people resisted slavery, and use one detail from the sources about how slavery ended.",
        instructions: [
          "Write the replacement label itself. You can choose a detail about abolition, compulsory apprenticeship or compensation.",
        ],
        operator: "Rewrite",
        responsePurpose: "Your museum label",
        support: {
          stems: ["Enslaved people …", "Although …, … continued."],
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
          "Whose actions does the original label leave out?",
          "How do the source details change the story a visitor would take away?",
        ],
      },
      essentialSourceIds: ["freedom-rebellion", "freedom-compensation"],
      contextParagraphs: [
        "Jamaica was a British colony in the Caribbean. On plantations, enslaved people were forced to work, often producing sugar for sale overseas. Enslavement meant that people were treated as property and denied control over their own lives. They resisted in different ways, while campaigners also demanded an end to slavery. Abolition means ending a practice through law; emancipation means being freed from slavery.",
        "In the 1830s, resistance in Jamaica and decisions in Britain's Parliament formed part of the struggle over slavery and freedom. At this stop, you are helping to improve a museum label for visitors your age. A label tells readers who acted and what changed, so its choice of words matters. Read the evidence about resistance and the changes between 1833 and 1838 before deciding how to tell this story.",
      ],
    },
    {
      id: "rule-and-resistance",
      title: "One colour, unequal power",
      location: "India / Britain",
      period: "1857 → 1858",
      minutes: 6,
      theme: "Authority, agency and unequal citizenship",
      context:
        "By the mid-nineteenth century, the East India Company governed large parts of India. In 1857, soldiers and other groups rose against its rule. Their reasons and aims differed; people in India did not all take the same side. After the uprising, Britain's Parliament transferred the Company's governing powers to the Crown in 1858. Crown rule meant government under the authority of the British monarch, carried out through British ministers and officials.\n\nQueen Victoria then issued a proclamation: a public announcement explaining the new government's position. It addressed people living under British rule in India at a time of conflict and distrust. You will examine a short passage from that announcement. Pay attention to the actual words Victoria used, their possible purpose in this situation, and the difference between an official promise and evidence about people's lives.",
      mapFocus: {
        year: 1858,
        territoryId: "british-india",
      },
      sourceIds: [
        "rule-proclamation",
        "rule-canada",
        "rule-government",
        "rule-rebellion",
      ],
      researchInstructions: [
        "You can explore India in 1858. The optional Canada source shows a different form of government within the same empire.",
      ],
      investigation: {
        prompt:
          "Choose a word or phrase from Queen Victoria’s proclamation and quote it in your response. Explain what image of British rule it creates and why the Queen might want to create that image after the uprising. What would you need to find out before deciding whether the promise matched people’s lives?",
        instructions: [],
        operator: "Analyse wording",
        responsePurpose: "Your reading of the proclamation",
        support: {
          stems: [
            "The words “…” make British rule sound …",
            "To find out whether …, we would need …",
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
          "How might different readers have responded to this promise?",
          "Which other kinds of evidence could help us investigate how the promise was put into practice?",
        ],
      },
      essentialSourceIds: ["rule-proclamation"],
      contextParagraphs: [
        "By the mid-nineteenth century, the East India Company governed large parts of India. In 1857, soldiers and other groups rose against its rule. Their reasons and aims differed; people in India did not all take the same side. After the uprising, Britain's Parliament transferred the Company's governing powers to the Crown in 1858. Crown rule meant government under the authority of the British monarch, carried out through British ministers and officials.",
        "Queen Victoria then issued a proclamation: a public announcement explaining the new government's position. It addressed people living under British rule in India at a time of conflict and distrust. You will examine a short passage from that announcement. Pay attention to the actual words Victoria used, their possible purpose in this situation, and the difference between an official promise and evidence about people's lives.",
      ],
    },
    {
      id: "departure-and-division",
      title: "Independence is more than a border",
      location: "India / Pakistan / Britain",
      period: "1947",
      minutes: 4,
      theme: "Decolonisation and its human consequences",
      context:
        "In 1947, British rule in India ended after decades of political campaigning, resistance and negotiations. British India was divided into two independent countries, India and Pakistan. This division is called partition. New borders cut through Punjab and Bengal, regions where people from different religious communities lived. Millions of people fled or were forced to leave their homes, and violence affected many communities around the time of independence.\n\nA map can show the new countries and their borders. To understand what this period meant to people, you will also read evidence of an individual's concerns or a family's remembered experience. The sources come from different moments: one letter was written before partition, while later testimony looks back on an earlier displacement. Keep those dates in mind when explaining what the evidence shows.",
      mapFocus: {
        year: 1947,
        territoryId: "british-india",
      },
      sourceIds: ["departure-partition"],
      researchInstructions: [
        "You can compare 1946 and 1948 on the map to see the change from British rule to independence.",
      ],
      investigation: {
        prompt:
          "Describe the political change in 1947: name the two new independent countries and say whose rule ended. Then use one detail from the source to show how people’s homes or concerns about their future were affected in the period around partition.",
        instructions: [
          "Keep the timing of your example clear. The letter was written in 1946, and the family testimony recalls displacement before partition.",
        ],
        operator: "Outline",
        responsePurpose: "Your account of the change",
        support: {
          stems: ["In 1947, …", "The source adds the experience of …, who …"],
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
          "What does a border map make visible, and what does a person’s account add?",
          "Why does it matter whether an experience happened before or after a new border was drawn?",
        ],
      },
      essentialSourceIds: ["departure-partition"],
      contextParagraphs: [
        "In 1947, British rule in India ended after decades of political campaigning, resistance and negotiations. British India was divided into two independent countries, India and Pakistan. This division is called partition. New borders cut through Punjab and Bengal, regions where people from different religious communities lived. Millions of people fled or were forced to leave their homes, and violence affected many communities around the time of independence.",
        "A map can show the new countries and their borders. To understand what this period meant to people, you will also read evidence of an individual's concerns or a family's remembered experience. The sources come from different moments: one letter was written before partition, while later testimony looks back on an earlier displacement. Keep those dates in mind when explaining what the evidence shows.",
      ],
    },
    {
      id: "migration-and-belonging",
      title: "Who gets to belong?",
      location: "The Caribbean / Britain",
      period: "1948 → the Windrush scandal",
      minutes: 5,
      theme: "Citizenship, migration and everyday belonging",
      context:
        "Empire Windrush was the name of a ship that brought passengers from the Caribbean and elsewhere to Britain in June 1948. At the time, Jamaica and several other Caribbean islands were British colonies, and their people were British subjects: they had a legal relationship with Britain through its empire. The name Windrush has also come to describe a wider generation of people who moved from the Caribbean to Britain after the Second World War.\n\nDecades later, the Windrush scandal revealed that people who were lawfully living in Britain had been wrongly treated as having no right to be there. Some lost jobs or access to services. You will read about Ena Sullivan's life after her arrival and a separate review of the scandal. These sources raise different questions: what rights did a person have, how did institutions treat them, and where did they feel they belonged?",
      mapFocus: {
        year: 1948,
        territoryId: "jamaica",
      },
      sourceIds: ["migration-windrush", "migration-review"],
      researchInstructions: [
        "You can find Jamaica in 1948. It remained a British colony until 1962.",
      ],
      investigation: {
        prompt:
          "Use a detail from the Windrush sources to explain how someone could have a legal right to live in Britain yet be treated as if they did not belong. Connect this example to Britain’s colonial relationship with the Caribbean.",
        instructions: [],
        operator: "Explain",
        responsePurpose: "Your explanation of belonging",
        support: {
          stems: [
            "Although … had the right to …, …",
            "The connection with empire matters because …",
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
          "How are legal rights, treatment by institutions and a personal feeling of belonging connected?",
          "What can the two sources tell us, and what can neither tell us about every migrant’s identity?",
        ],
      },
      essentialSourceIds: ["migration-windrush", "migration-review"],
      contextParagraphs: [
        "Empire Windrush was the name of a ship that brought passengers from the Caribbean and elsewhere to Britain in June 1948. At the time, Jamaica and several other Caribbean islands were British colonies, and their people were British subjects: they had a legal relationship with Britain through its empire. The name Windrush has also come to describe a wider generation of people who moved from the Caribbean to Britain after the Second World War.",
        "Decades later, the Windrush scandal revealed that people who were lawfully living in Britain had been wrongly treated as having no right to be there. Some lost jobs or access to services. You will read about Ena Sullivan's life after her arrival and a separate review of the scandal. These sources raise different questions: what rights did a person have, how did institutions treat them, and where did they feel they belonged?",
      ],
    },
    {
      id: "remembering-empire",
      title: "When does an empire end?",
      location: "Kenya / Britain",
      period: "1950s → 1963 → 2013",
      minutes: 6,
      theme: "Independence, responsibility and continuing connections",
      context:
        "Kenya, in East Africa, was under British colonial rule. In the 1950s, the Mau Mau movement fought against that rule. The colonial government declared an emergency and detained many people, meaning it held them in camps or prisons, often without a trial. People suffered torture and other ill-treatment at the hands of the colonial authorities. Kenya became independent in 1963, but some survivors later brought claims against the British government over their treatment.\n\nIn 2013, Britain's Foreign Secretary, William Hague, announced a settlement of those claims in Parliament. A settlement is an agreement that resolves a legal dispute. You will read two short extracts from his statement. One expresses regret; the other concerns liability, meaning legal responsibility. Examine how these words present the government's position and what the event reveals about the relationship between independence and later demands for recognition.",
      mapFocus: {
        year: 1963,
        territoryId: "kenya",
      },
      sourceIds: ["memory-mau-mau", "memory-hong-kong"],
      researchInstructions: [
        "You can explore Kenya around its independence in 1963. Hong Kong’s transfer in 1997 is an optional comparison.",
      ],
      investigation: {
        prompt:
          "Compare the words expressing regret with the words denying legal responsibility in the 2013 Kenya statement. Explain what the government acknowledges and what it refuses to accept. Then explain why this statement shows that the consequences of colonial rule continued after Kenya became independent.",
        instructions: [
          "Use a word or phrase from the quotation to explain your reading.",
        ],
        operator: "Analyse wording",
        responsePurpose: "Your reading of the statement",
        support: {
          stems: [
            "The words “…” acknowledge …, while “…” …",
            "Although Kenya became independent in 1963, …",
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
          ],
        },
        discussionPrompts: [
          "How does the wording distinguish recognition of suffering from legal responsibility?",
          "Which other voices would help us understand what the settlement meant to people affected by colonial violence?",
        ],
      },
      essentialSourceIds: ["memory-mau-mau"],
      contextParagraphs: [
        "Kenya, in East Africa, was under British colonial rule. In the 1950s, the Mau Mau movement fought against that rule. The colonial government declared an emergency and detained many people, meaning it held them in camps or prisons, often without a trial. People suffered torture and other ill-treatment at the hands of the colonial authorities. Kenya became independent in 1963, but some survivors later brought claims against the British government over their treatment.",
        "In 2013, Britain's Foreign Secretary, William Hague, announced a settlement of those claims in Parliament. A settlement is an agreement that resolves a legal dispute. You will read two short extracts from his statement. One expresses regret; the other concerns liability, meaning legal responsibility. Examine how these words present the government's position and what the event reveals about the relationship between independence and later demands for recognition.",
      ],
    },
  ],
  finalAssessment: {
    id: "whose-britain",
    title: "The past inside the present",
    period: "1600 → today",
    minutes: 15,
    theme: "A comment for your school magazine",
    context:
      "Your school magazine is preparing an issue about identities in Britain: how people describe themselves, where they feel they belong, and how others see them. These identities can overlap. Someone may feel British as well as Scottish, Welsh, English or Northern Irish, or connect their identity to a region, religion, family history or community. There is no single experience or opinion shared by everyone in Britain.\n\nYou have now encountered trade, resistance, government, independence, migration and public memory. Your comment will use selected evidence from these stops to explore how much imperial history helps explain identities today. Readers may know little about the events, so make each connection understandable. You can reach your own judgement, while considering another influence on identity or what your chosen sources cannot tell you. A comment presents and supports a point of view for its readers.",
    sourceIds: ["final-identities", "final-charter"],
    researchInstructions: [
      "You can return to any of the six stops and use its sources. The extra sources here are optional.",
    ],
    investigation: {
      prompt:
        "Write a comment for your school magazine answering: “How far does Britain’s imperial past help explain British identities today?” Choose two cases from your journey and explain how each helps you understand belonging, public memory or ideas about Britain today. Give your view, and discuss another influence on identity or something your sources cannot tell you.",
      instructions: [
        "Refer to the source or person when you use their evidence, so readers can follow your thinking.",
      ],
      operator: "Comment",
      responsePurpose: "Your school-magazine comment",
      support: {
        stems: [
          "The example of … helps explain … because …",
          "However, this evidence cannot tell us …",
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
        "Which historical connection do you find most useful for understanding a present-day question, and why?",
        "What other influences shape identities, and whose experience would you want to hear next?",
      ],
    },
    essentialSourceIds: [],
    contextParagraphs: [
      "Your school magazine is preparing an issue about identities in Britain: how people describe themselves, where they feel they belong, and how others see them. These identities can overlap. Someone may feel British as well as Scottish, Welsh, English or Northern Irish, or connect their identity to a region, religion, family history or community. There is no single experience or opinion shared by everyone in Britain.",
      "You have now encountered trade, resistance, government, independence, migration and public memory. Your comment will use selected evidence from these stops to explore how much imperial history helps explain identities today. Readers may know little about the events, so make each connection understandable. You can reach your own judgement, while considering another influence on identity or what your chosen sources cannot tell you. A comment presents and supports a point of view for its readers.",
    ],
  },
  contentRevision: "ungraded-2026-10-01",
};
