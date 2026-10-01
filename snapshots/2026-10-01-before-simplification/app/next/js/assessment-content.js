// Assessment content is independent of the renderer and the existing classroom app.
// Answer keys, explanations and rubrics are for feedback after submission.
// Written responses are assessed by a person; word counts only check completeness.
// Historical evidence: app/data/territories/{south-asia,caribbean,africa-east-south,north-america}.json.
export const assessment = {
  id: "empire-investigation-v1",
  title: "Investigate the empire",
  minutes: 35,
  instructions: [
    "Complete all eight assignments. Use the globe and reference material as you work.",
    "You can revisit and revise your answers before submitting. Feedback appears after submission.",
    "There are 30 marks: 18 checked automatically and 12 requiring a person to review your writing.",
    "Allow about 35 minutes. The suggested time is a guide, not a countdown.",
  ],
  tasks: [
    {
      id: "changing-empire",
      type: "single-choice",
      title: "Define an empire",
      prompt:
        "Which description best explains how the British Empire worked across different places and centuries?",
      instructions: "Select one answer.",
      points: 2,
      minutes: 3,
      required: true,
      review: "automatic",
      options: [
        {
          id: "uniform-state",
          label:
            "A single state that gave everyone the same political rights and governed every territory in the same way.",
        },
        {
          id: "changing-relations",
          label:
            "A changing set of territories and relationships, with different forms of British power and different local responses.",
        },
        {
          id: "trade-only",
          label:
            "A network of trading partners over which Britain exercised commercial influence but no governing power.",
        },
        {
          id: "voluntary-alliance",
          label:
            "A voluntary alliance whose members could always leave by making the same legal request.",
        },
      ],
      sources: [
        {
          title: "Government of India Act 1858 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Vict/21-22/106/contents/enacted",
        },
        {
          title: "British North America Act 1867 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Vict/30-31/3/contents/enacted",
        },
      ],
      answer: "changing-relations",
      explanation:
        "Company rule, Crown colonies, protectorates and self-governing dominions operated differently. Their relationships with Britain changed through conquest, legislation, negotiation and resistance.",
    },
    {
      id: "reading-rule",
      type: "multi-select",
      title: "Read beyond the map",
      prompt:
        "Two territories appear in the same empire on a map. Which TWO conclusions about their government are historically sound?",
      instructions:
        "Select exactly two statements. Each correct selection earns one mark.",
      points: 2,
      minutes: 3,
      required: true,
      review: "automatic",
      requiredSelections: 2,
      options: [
        {
          id: "equal-rights",
          label: "Their inhabitants necessarily had the same voting rights.",
        },
        {
          id: "local-institutions",
          label:
            "A protectorate could retain local rulers and institutions under British supervision.",
        },
        {
          id: "same-control",
          label:
            "The map proves that British officials exercised the same degree of control in both.",
        },
        {
          id: "self-government",
          label:
            "A dominion could govern its domestic affairs while retaining constitutional connections to Britain.",
        },
      ],
      sources: [
        {
          title:
            "Uganda agreements · Parliamentary statement, 19 December 1928",
          url: "https://hansard.parliament.uk/commons/1928-12-19/debates/8d18e39d-bc79-4af2-a856-2972c0b998e5/Uganda%28AgreementsNatives%29",
        },
        {
          title: "British North America Act 1867 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Vict/30-31/3/contents/enacted",
        },
      ],
      answer: ["local-institutions", "self-government"],
      explanation:
        "In Uganda, British officials supervised existing kingdoms and chiefs. Canada had an elected government running domestic affairs while constitutional links with Britain remained. One map colour cannot establish equal rights or equal control.",
    },
    {
      id: "turning-points",
      type: "order",
      title: "Put change in sequence",
      prompt:
        "Place these four turning points in chronological order, from earliest to latest.",
      instructions:
        "Arrange all four events, then confirm your order. Each event in its correct position earns one mark.",
      points: 4,
      minutes: 3,
      required: true,
      review: "automatic",
      requireConfirmation: true,
      items: [
        {
          id: "crown-india",
          label:
            "The British Crown takes over the East India Company’s governing powers in India.",
        },
        {
          id: "independence-partition",
          label:
            "India and Pakistan become independent, accompanied by partition.",
        },
        {
          id: "plassey",
          label: "The East India Company wins the Battle of Plassey in Bengal.",
        },
        {
          id: "abolition-jamaica",
          label:
            "The Slavery Abolition Act takes effect in Jamaica; compulsory apprenticeship begins.",
        },
      ],
      sources: [
        {
          title: "Slavery Abolition Act 1833 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Will4/3-4/73/contents/enacted",
        },
        {
          title: "Government of India Act 1858 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Vict/21-22/106/contents/enacted",
        },
        {
          title: "Indian Independence Act 1947 · Original legislation (PDF)",
          url: "https://www.legislation.gov.uk/ukpga/1947/30/pdfs/ukpga_19470030_en.pdf",
        },
      ],
      answer: [
        "plassey",
        "abolition-jamaica",
        "crown-india",
        "independence-partition",
      ],
      explanation:
        "The sequence is Plassey in 1757; the Abolition Act taking effect in Jamaica in 1834; transfer to Crown rule in 1858; and independence and partition in 1947. Apprenticeship continued in Jamaica until 1838, so 1834 did not end all compulsory labour.",
    },
    {
      id: "forms-of-rule",
      type: "matching",
      title: "Match the form of government",
      prompt: "Match each historical example to the form of rule it describes.",
      instructions:
        "Use each label once. Complete all four matches. Each correct match earns one mark.",
      points: 4,
      minutes: 4,
      required: true,
      review: "automatic",
      uniqueMatches: true,
      items: [
        {
          id: "bengal",
          label:
            "Bengal after 1765: a chartered trading corporation collects revenue and maintains an army.",
        },
        {
          id: "kenya",
          label:
            "Kenya in 1922: a British governor governs with a council in which European settlers hold a privileged position.",
        },
        {
          id: "uganda",
          label:
            "Uganda after 1900: British officials supervise existing African kingdoms, chiefs and courts.",
        },
        {
          id: "canada",
          label:
            "Canada in 1922: an elected federal government runs domestic affairs, while constitutional ties to Britain remain.",
        },
      ],
      options: [
        { id: "protectorate", label: "Protectorate" },
        { id: "dominion", label: "Self-governing dominion" },
        { id: "company-rule", label: "Company rule" },
        { id: "crown-colony", label: "Crown colony" },
      ],
      sources: [
        {
          title:
            "Clive’s letter on revenue rights, 8 September 1765 · British Library catalogue",
          url: "https://searcharchives.bl.uk/catalog/032-002278233",
        },
        {
          title: "Kenya Colony · Parliamentary debate, 26 July 1923",
          url: "https://api.parliament.uk/historic-hansard/lords/1923/jul/26/kenya-colony",
        },
        {
          title:
            "Uganda agreements · Parliamentary statement, 19 December 1928",
          url: "https://hansard.parliament.uk/commons/1928-12-19/debates/8d18e39d-bc79-4af2-a856-2972c0b998e5/Uganda%28AgreementsNatives%29",
        },
        {
          title: "British North America Act 1867 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Vict/30-31/3/contents/enacted",
        },
      ],
      answer: {
        bengal: "company-rule",
        kenya: "crown-colony",
        uganda: "protectorate",
        canada: "dominion",
      },
      explanation:
        "Bengal illustrates Company government; Kenya, a Crown colony; Uganda, a protectorate using existing institutions; and Canada, a self-governing dominion. These labels describe political arrangements, not equal rights for everyone living within them.",
    },
    {
      id: "locate-india",
      type: "map-location",
      title: "Locate the centre of Company rule",
      prompt:
        "Find British India on the map in 1922. Select a location on the Indian subcontinent, the main setting of Company and later Crown rule in India.",
      instructions:
        "Use the map to select one location. You can change your selection before submitting.",
      points: 2,
      minutes: 3,
      required: true,
      review: "automatic",
      year: 1922,
      sources: [
        {
          title: "India · Early twentieth-century map, Library of Congress",
          url: "https://www.loc.gov/resource/g7650.ct000283/",
        },
      ],
      mapOptions: [
        { id: "canada", label: "Canada" },
        { id: "jamaica", label: "Jamaica" },
        { id: "british-india", label: "British India (Indian subcontinent)" },
        { id: "kenya", label: "Kenya" },
        { id: "commonwealth-of-australia", label: "Commonwealth of Australia" },
        { id: "hong-kong", label: "Hong Kong" },
      ],
      // Nested presidency/princely-state picks must also be accepted by their unit ID.
      // This task tests location, not a boundary between direct and indirect rule.
      answer: {
        territoryId: "british-india",
        unitIds: [
          "in-gujarat",
          "in-tamil-nadu",
          "in-andhra-pradesh",
          "in-maharashtra",
          "in-west-bengal",
          "in-bihar",
          "in-jharkhand",
          "in-odisha",
          "bd-east-bengal",
          "bd-sylhet",
          "in-kerala",
          "in-telangana",
          "in-karnataka",
          "in-lakshadweep",
          "in-uttar-pradesh",
          "in-uttarakhand",
          "in-delhi",
          "in-haryana",
          "in-madhya-pradesh",
          "in-rajasthan",
          "in-chhattisgarh",
          "in-assam",
          "in-meghalaya",
          "in-nagaland",
          "in-arunachal-pradesh",
          "in-mizoram",
          "in-manipur",
          "in-tripura",
          "pk-sindh",
          "in-jammu-kashmir",
          "in-ladakh",
          "pk-azad-kashmir",
          "pk-gilgit-baltistan",
          "pk-punjab",
          "in-punjab-india",
          "in-himachal-pradesh",
          "pk-khyber-pakhtunkhwa",
          "in-andaman-nicobar",
          "pk-balochistan",
          "in-sikkim",
        ],
      },
      explanation:
        "The Indian subcontinent lies in South Asia, between the Arabian Sea and the Bay of Bengal. The atlas’s British India record covers directly ruled provinces and areas containing princely states under British supremacy. Its modern geographical units approximate historical boundaries; the whole area was not governed uniformly.",
    },
    {
      id: "independence-source",
      type: "source-analysis",
      title: "Ask what a source can prove",
      prompt:
        "What change in political authority does this source establish? Explain one reason it is useful evidence for Kenya’s independence, and one question about Kenyan people’s experience that this excerpt cannot answer on its own.",
      instructions:
        "Write 35–200 words. Refer to the wording or purpose of the source and explain the limit you identify.",
      points: 4,
      minutes: 5,
      required: true,
      review: "human",
      minWords: 35,
      maxWords: 200,
      source: {
        title: "Kenya Independence Act 1963, section 1",
        author: "UK Parliament",
        date: "3 December 1963",
        purpose:
          "Legislation setting the legal arrangements for Kenya’s independence. This provision applied from 12 December 1963.",
        excerpt:
          "Her Majesty’s Government in the United Kingdom shall have no responsibility for the government of Kenya or any part thereof.",
        url: "https://www.legislation.gov.uk/ukpga/1963/54/pdfs/ukpga_19630054_en.pdf",
      },
      rubric: [
        {
          points: 1,
          criterion:
            "Identifies the end of the UK government’s responsibility for governing Kenya.",
        },
        {
          points: 1,
          criterion:
            "Explains that an enacted law is strong evidence for the formal constitutional change, using the wording or purpose.",
        },
        {
          points: 1,
          criterion:
            "Identifies a relevant unanswered question about people’s experiences, such as land, living conditions, violence or political participation.",
        },
        {
          points: 1,
          criterion:
            "Explains why this legal provision cannot by itself answer that question, rather than simply calling the source biased or unreliable.",
        },
      ],
      explanation:
        "This provision establishes a formal change in government. Its legal authority makes it useful for that question, but it does not by itself describe how independence changed land ownership, daily life or memories of violence. Those questions require other evidence. A person must review your interpretation.",
    },
    {
      id: "company-cause-chain",
      type: "order",
      title: "Build a chain of cause and effect",
      prompt:
        "Start with the Company gaining revenue rights in 1765. Arrange the remaining stages to show how revenue could help its territorial expansion.",
      instructions:
        "Arrange all four stages, then confirm your chain. Follow the financial mechanism, rather than ranking the stages by importance. Each correct position earns one mark.",
      points: 4,
      minutes: 4,
      required: true,
      review: "automatic",
      requireConfirmation: true,
      items: [
        {
          id: "finance-army",
          label:
            "Revenue helps pay soldiers and maintain the Company’s military forces.",
        },
        {
          id: "expand-control",
          label:
            "Those forces help the Company secure or expand territorial control.",
        },
        {
          id: "revenue-rights",
          label:
            "The Company gains the right to collect revenue in Bengal, Bihar and Orissa.",
        },
        {
          id: "collect-taxes",
          label:
            "Taxes collected from people in those regions provide the Company with income.",
        },
      ],
      sources: [
        {
          title:
            "Clive’s letter on revenue rights, 8 September 1765 · British Library catalogue",
          url: "https://searcharchives.bl.uk/catalog/032-002278233",
        },
        {
          title:
            "Company revenue and military accounts, 1765–1784 · British Library catalogue",
          url: "https://searcharchives.bl.uk/catalog/032-002273017",
        },
      ],
      answer: [
        "revenue-rights",
        "collect-taxes",
        "finance-army",
        "expand-control",
      ],
      explanation:
        "Revenue rights enabled tax collection; that income helped sustain military forces; those forces could secure or extend Company control. More territory could provide further revenue. This is one reinforcing mechanism, not a claim that conquest was automatic or that alliances and resistance did not matter.",
    },
    {
      id: "evidence-argument",
      type: "extended-writing",
      title: "Make a judgement with evidence",
      prompt:
        "“Changes in the British Empire were decided in London.” How far do you agree? Build an argument using at least two of the cases below, and consider both British decisions and actions taken by people living under imperial rule.",
      instructions:
        "Write 80–400 words. Make a clear judgement, explain evidence from at least two cases, and address something that complicates your argument. You may also use evidence from the atlas.",
      points: 8,
      minutes: 10,
      required: true,
      review: "human",
      minWords: 80,
      maxWords: 400,
      evidence: [
        {
          title: "Jamaica · 1831–1838",
          text: "Samuel Sharpe helped organise enslaved workers in 1831; a strike developed into a rebellion that colonial forces suppressed. Parliament passed the Abolition Act in 1833. It took effect in Jamaica in 1834, followed by compulsory unpaid apprenticeship until 1838. Compensation went to slave-owners.",
        },
        {
          title: "India · 1857–1858",
          text: "Indian soldiers and civilian groups rebelled against Company rule in 1857, with different aims across regions. After the rebellion was suppressed, Parliament transferred the Company’s governing powers to the Crown in 1858. British rule continued, in directly governed provinces and through authority over princely states.",
        },
        {
          title: "Kenya · 1952–1963",
          text: "Mau Mau fighters challenged colonial rule, with land and freedom central to their demands. Britain declared an emergency in 1952 and used detention and forced resettlement. Political organising, constitutional negotiations and elections also shaped the transition. Kenya became independent on 12 December 1963.",
        },
      ],
      rubric: [
        {
          points: 2,
          criterion:
            "Makes a clear, reasoned judgement about the claim. Award one mark for a clear position and another for a judgement sustained through the response.",
        },
        {
          points: 2,
          criterion:
            "Uses accurate, relevant evidence from at least two cases. Award one mark for each supported case, up to two.",
        },
        {
          points: 2,
          criterion:
            "Explains how actions or decisions contributed to change, connecting evidence to the judgement. Award up to two marks for developed causal reasoning, rather than a list of events.",
        },
        {
          points: 2,
          criterion:
            "Considers a complication or counterargument involving both British power and local agency. Award one mark for identifying it and another for explaining how it qualifies the judgement.",
        },
      ],
      sources: [
        {
          title:
            "Proclamation against the 1831 Jamaica rebellion · National Archives source discussion",
          url: "https://www.nationalarchives.gov.uk/education/students/videos/spotlight-on/spotlight-on-baptist-war/spotlight-on-baptist-war-video-transcript/",
        },
        {
          title: "Government of India Act 1858 · Original legislation",
          url: "https://www.legislation.gov.uk/ukpga/Vict/21-22/106/contents/enacted",
        },
        {
          title: "Kenya Independence Act 1963 · Original legislation (PDF)",
          url: "https://www.legislation.gov.uk/ukpga/1963/54/pdfs/ukpga_19630054_en.pdf",
        },
        {
          title: "Mau Mau claims · UK government statement, 6 June 2013",
          url: "https://www.gov.uk/government/news/statement-to-parliament-on-settlement-of-mau-mau-claims",
        },
      ],
      explanation:
        "A strong answer weighs formal decisions made by British authorities against the pressures and choices that shaped them. Different judgements can earn full marks when they use accurate evidence, explain causes and address a meaningful complication. Your writing requires human review; length alone does not earn marks.",
    },
  ],
};
