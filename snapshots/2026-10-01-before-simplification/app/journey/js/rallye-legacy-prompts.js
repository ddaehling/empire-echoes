// Frozen pre-alignment questions for recovering saved v3 attempts.
// These are never used to assess work on a newer content revision.
export const LEGACY_CONTENT_REVISION = "legacy-v1";
export const LEGACY_PROMPT_SNAPSHOT = [
  {
    id: "profit-and-power",
    title: "When trade becomes rule",
    prompt:
      "How could collecting taxes turn a trading company into a territorial power? Use one piece of evidence to explain the connection. Then explain what a modern description of Britain simply as a ‘trading nation’ could leave out of this history.",
    instructions: [
      "Aim for 45–65 words. Explain a mechanism, rather than listing dates.",
      "A possible modern connection is an interpretation, not evidence that all people in Britain think alike.",
    ],
    minWords: 40,
    maxWords: 130,
    minSources: 0,
    points: 5,
    rubric: [
      {
        criterion: "Accurate evidence",
        points: 1,
        description:
          "Identifies the 1765 revenue rights or another accurate, relevant piece of Company evidence.",
      },
      {
        criterion: "Causal explanation",
        points: 2,
        description:
          "Explains that taxation supplied money and that money sustained military or governing power; two connected steps earn both marks.",
      },
      {
        criterion: "Identity connection",
        points: 1,
        description:
          "Explains a meaningful omission in a purely commercial account, such as coercion, conquest, unequal power or the people who paid taxes.",
      },
      {
        criterion: "Careful judgement",
        points: 1,
        description:
          "Distinguishes trade from territorial rule, or avoids treating expansion as inevitable or present-day British opinion as uniform.",
      },
    ],
  },
  {
    id: "freedom-and-memory",
    title: "Who made freedom happen?",
    prompt:
      "A museum panel says, ‘Britain gave enslaved people their freedom.’ What would you add or change to make the panel more accurate? Explain the role of enslaved people’s resistance and use one other detail about abolition or compensation. Why could the wording matter in Britain today?",
    instructions: [
      "Aim for 45–65 words. You may recognise abolitionist campaigning and Parliament’s action while also explaining what the sentence leaves out.",
      "Support your revision with a named source. Add at least one source to your notebook for this stop.",
    ],
    minWords: 45,
    maxWords: 140,
    minSources: 1,
    points: 5,
    rubric: [
      {
        criterion: "Enslaved people’s agency",
        points: 1,
        description:
          "Uses Sharpe, the 1831 rebellion, resistance or another supported example to explain enslaved people’s action.",
      },
      {
        criterion: "Specific historical correction",
        points: 1,
        description:
          "Accurately uses the 1834/1838 distinction, compensation to owners, or the relationship between parliamentary abolition and wider pressure.",
      },
      {
        criterion: "Explanation and evidence",
        points: 2,
        description:
          "Explains how the supplied wording changes the story of agency and uses a named, relevant source; one mark for each.",
      },
      {
        criterion: "Present-day significance",
        points: 1,
        description:
          "Makes a reasoned connection to public memory, recognition, national pride, inherited inequality or debate, without claiming everyone holds the same view.",
      },
    ],
  },
  {
    id: "rule-and-resistance",
    title: "One colour, unequal power",
    prompt:
      "Why does colouring India and Canada as parts of one empire fail to explain who held power? Use the Indian proclamation and the Canada comparison to identify a difference. Explain why a promise of equal legal protection cannot by itself prove that imperial rule fulfilled the ideals Britain claimed.",
    instructions: [
      "Aim for 45–65 words. Separate an official claim from evidence about how people were governed.",
      "You are evaluating what sources can establish, not deciding that every official statement is false.",
    ],
    minWords: 45,
    maxWords: 140,
    minSources: 0,
    points: 5,
    rubric: [
      {
        criterion: "Political difference",
        points: 1,
        description:
          "Distinguishes Crown government in India from Canada’s elected domestic government and continuing imperial ties.",
      },
      {
        criterion: "Reading the source",
        points: 2,
        description:
          "Identifies the proclamation as an official statement of promises or intentions and explains why that purpose does not establish actual implementation.",
      },
      {
        criterion: "Limits of the map",
        points: 1,
        description:
          "Explains that one colour cannot show equal rights, consent or equal degrees of control.",
      },
      {
        criterion: "Qualification",
        points: 1,
        description:
          "Adds a relevant qualification, such as unequal power within Canada, varied Indian responses or the need for evidence of lived experience.",
      },
    ],
  },
  {
    id: "departure-and-division",
    title: "Independence is more than a border",
    prompt:
      "What does the disappearance of imperial colour explain about 1947, and what important experience does it hide? Use one specific piece of evidence. Suggest one way this history could still matter in Britain through families, communities or public memory, and say what further evidence would test your suggestion.",
    instructions: [
      "Aim for 45–65 words. Connect a legal change to a human consequence.",
      "Label your present-day connection as a suggestion unless a source supports it directly. Do not treat all South Asian families as having the same history.",
    ],
    minWords: 45,
    maxWords: 140,
    minSources: 0,
    points: 5,
    rubric: [
      {
        criterion: "Constitutional change",
        points: 1,
        description:
          "Identifies the end of British rule and creation of independent India and Pakistan.",
      },
      {
        criterion: "Human consequence",
        points: 1,
        description:
          "Uses accurate evidence of displacement, violence, divided communities or another supported consequence.",
      },
      {
        criterion: "Connection across time",
        points: 2,
        description:
          "Explains a plausible connection to families, migration, community life or memory in Britain and distinguishes supported evidence from a hypothesis.",
      },
      {
        criterion: "Further inquiry",
        points: 1,
        description:
          "Suggests a relevant source that could test the connection, such as oral histories, family testimony, museum collections or migration records.",
      },
    ],
  },
  {
    id: "migration-and-belonging",
    title: "Who gets to belong?",
    prompt:
      "Explain why legal citizenship or residence and being accepted as ‘British’ are different questions. Use the Windrush evidence to connect an imperial relationship with a later issue of belonging or exclusion. What would be misleading about presenting Caribbean migration as a story with no connection to Britain’s own history?",
    instructions: [
      "Aim for 45–65 words. Distinguish people’s legal position from how institutions or other people treated them.",
      "Use a named source and add at least one source to your notebook. Do not assume that one experience represents everyone from the Caribbean.",
    ],
    minWords: 45,
    maxWords: 140,
    minSources: 1,
    points: 5,
    rubric: [
      {
        criterion: "Historical relationship",
        points: 1,
        description:
          "Connects Caribbean migration with colonial ties or British subjecthood, using the timing accurately.",
      },
      {
        criterion: "Legal status and treatment",
        points: 2,
        description:
          "Clearly distinguishes legal citizenship or residence from social acceptance, racism or institutional treatment, supported by relevant evidence.",
      },
      {
        criterion: "Source use",
        points: 1,
        description:
          "Identifies a relevant source and uses it to substantiate the explanation rather than merely listing a link.",
      },
      {
        criterion: "Interpretation of belonging",
        points: 1,
        description:
          "Explains why an account detached from imperial history is incomplete without assuming a single Caribbean or British experience.",
      },
    ],
  },
  {
    id: "remembering-empire",
    title: "When does an empire end?",
    prompt:
      "How does the 2013 statement about Kenya challenge the idea that imperial history became irrelevant once colonies gained independence? Explain one thing the statement can establish and one thing it cannot establish about people’s views in Britain today. Use Hong Kong in 1997 as a comparison between a constitutional ending and a continuing history.",
    instructions: [
      "Aim for 45–65 words. An official acknowledgement is evidence of an official position at a particular time, not an opinion poll.",
      "Add at least one source to your notebook. Avoid saying that the empire simply vanished everywhere in 1997.",
    ],
    minWords: 45,
    maxWords: 150,
    minSources: 1,
    points: 5,
    rubric: [
      {
        criterion: "Accurate use of the statement",
        points: 1,
        description:
          "Identifies the UK government’s acknowledgement of torture/ill-treatment or its settlement, rather than inventing a wider admission.",
      },
      {
        criterion: "Continuing significance",
        points: 1,
        description:
          "Explains how a post-independence claim, acknowledgement or debate shows continuing consequences of colonial rule.",
      },
      {
        criterion: "Scope of the evidence",
        points: 2,
        description:
          "Distinguishes an official position in 2013 from the varied views of present-day people and identifies the limits of using this source to infer them.",
      },
      {
        criterion: "Comparison",
        points: 1,
        description:
          "Uses Hong Kong’s 1997 transfer to distinguish a change of sovereignty from an end to historical connections, without treating it as the disappearance of every UK territory.",
      },
    ],
  },
  {
    id: "whose-britain",
    title: "The past inside the present",
    prompt:
      "‘Britain’s imperial past matters more to its present identities than its size on today’s map suggests.’ How far do you agree? Make a reasoned judgement using at least three stops from the rallye. Explain at least two connections between past events and present-day belonging, public memory or ideas about Britain’s place in the world. Include a complication or counterargument and explain the limits of at least one source.",
    instructions: [
      "Aim for 140–200 words; you may write up to 300. State your judgement and develop it with evidence rather than listing examples.",
      "Use at least three stops, including one about resistance or independence and one about migration or memory. Cite at least two sources in your notebook and identify them in your answer.",
      "Treat British identities as plural. For example, national, regional, ethnic, family and generational experiences may overlap or differ; do not assume all English, Scottish, Welsh, Northern Irish or other communities think alike.",
      "Consider what else shapes identity, or explain why an apparent link with empire needs more evidence. Supported disagreement can earn full marks.",
    ],
    minWords: 140,
    maxWords: 300,
    minSources: 2,
    points: 10,
    rubric: [
      {
        criterion: "Judgement and reasoning",
        points: 3,
        description:
          "Makes a clear judgement and explains at least two connections from historical evidence to present identities, rather than asserting that one caused the other automatically. Award one mark for the judgement and up to two for developed connections.",
      },
      {
        criterion: "Range and use of evidence",
        points: 3,
        description:
          "Uses accurate evidence from at least three stops, including resistance/independence and migration/memory, and identifies at least two relevant sources. Up to two marks for accurate, purposeful examples; one for identifiable source use.",
      },
      {
        criterion: "Plural identities and qualification",
        points: 2,
        description:
          "Avoids a single British state of mind and develops a relevant complication or counterargument, such as different family experiences or other influences on identity. One mark for each.",
      },
      {
        criterion: "Source evaluation",
        points: 2,
        description:
          "Identifies a specific limit of a source and explains how that limit affects the argument or what further evidence would be needed. Calling a source biased without explanation is insufficient.",
      },
    ],
  },
];
