// Recovery-only historical questions, copied from the exact pre-simplification snapshot.
// Never use this metadata for the current enquiry or its exports.
export const Q2_CONTENT_REVISION = "q2-english-2026-10-01";
export const Q2_PROMPT_SNAPSHOT = [
  {
    id: "profit-and-power",
    title: "When trade becomes rule",
    prompt:
      "Explain how revenue collection helped the East India Company move from trade towards territorial rule. Use the 1600–1765 change and one source detail to connect money with power.",
    operator: "Explain",
    responsePurpose: "A short causal note",
    expectedWords: "20–35 words",
    instructions: [
      "Aim for 20–35 words in your own words. Show how the steps connect, rather than listing dates.",
    ],
    minWords: 15,
    maxWords: 80,
    minSources: 0,
    points: 5,
    rubric: [
      {
        criterion: "Historical change",
        points: 2,
        description:
          "Accurately distinguishes the 1600 trading charter from the later revenue rights; one mark for each.",
      },
      {
        criterion: "Causal connection",
        points: 2,
        description:
          "Explains how revenue could finance troops or administration and thus support governing or territorial power; reward the connected mechanism.",
      },
      {
        criterion: "Clear English",
        points: 1,
        description:
          "Communicates the relationship concisely in intelligible own wording, using cause and effect accurately.",
      },
    ],
  },
  {
    id: "freedom-and-memory",
    title: "Who made freedom happen?",
    prompt:
      "An invented museum label reads: “Britain gave enslaved people their freedom.” Rewrite it for visitors your age. Include enslaved people’s resistance and one accurate detail about abolition, apprenticeship or compensation.",
    operator: "Rewrite",
    responsePurpose: "A museum label for teenage visitors",
    expectedWords: "20–35 words",
    instructions: [
      "Aim for 20–35 words. Write the replacement label itself, choosing evidence that changes the story of who acted.",
      "Save at least one source that supports your label; you do not need to add a separate explanation.",
    ],
    minWords: 20,
    maxWords: 80,
    minSources: 1,
    points: 5,
    rubric: [
      {
        criterion: "Agency and historical accuracy",
        points: 3,
        description:
          "Recognises enslaved people’s active resistance, accurately describes a relevant abolition/apprenticeship/compensation detail, and avoids presenting freedom as an uncomplicated gift; one mark for each.",
      },
      {
        criterion: "Source evidence",
        points: 1,
        description:
          "Selects a concrete detail supported by a saved relevant source; a link without a relevant detail is insufficient.",
      },
      {
        criterion: "Audience and clarity",
        points: 1,
        description:
          "Produces a concise, intelligible museum label for teenage readers rather than a separate academic explanation.",
      },
    ],
  },
  {
    id: "rule-and-resistance",
    title: "One colour, unequal power",
    prompt:
      "Analyse how one word or short phrase in Victoria’s 1858 proclamation presents British rule to people in India. Explain its possible effect or purpose, then state why this promise cannot establish how people were actually treated.",
    operator: "Analyse wording",
    responsePurpose: "A note linking language, purpose and evidence",
    expectedWords: "35–50 words",
    instructions: [
      "Aim for 35–50 words. Select exact wording from the authentic quotation, explain what it does, and use the historical context.",
      "A possible audience effect is an interpretation. Do not assume everyone accepted the promise, or that the promise proves either success or universal failure.",
    ],
    minWords: 25,
    maxWords: 100,
    minSources: 0,
    points: 5,
    rubric: [
      {
        criterion: "Precise textual evidence",
        points: 1,
        description:
          "Selects an exact, relevant word or phrase from the authentic proclamation, not from the editorial summary.",
      },
      {
        criterion: "Language and function",
        points: 2,
        description:
          "Explains how the wording presents rule and connects this to an intended audience, purpose or plausible reader effect; mere device naming is insufficient.",
      },
      {
        criterion: "Historical context",
        points: 1,
        description:
          "Uses the change to Crown rule or the aftermath of the uprising to make the interpretation more specific.",
      },
      {
        criterion: "Source limit",
        points: 1,
        description:
          "Explains that a stated promise does not establish implementation or every person’s response.",
      },
    ],
  },
  {
    id: "departure-and-division",
    title: "Independence is more than a border",
    prompt:
      "Outline what changed politically in 1947 and one human experience surrounding partition that the map cannot show. Use a specific detail from the partition source.",
    operator: "Outline",
    responsePurpose:
      "Two sentences distinguishing a border change from experience",
    expectedWords: "20–30 words",
    instructions: [
      "Aim for 20–30 words in two short sentences. Distinguish the change in government from people’s experiences.",
    ],
    minWords: 15,
    maxWords: 80,
    minSources: 0,
    points: 5,
    rubric: [
      {
        criterion: "Constitutional change",
        points: 1,
        description:
          "Identifies the end of British rule and/or the creation of independent India and Pakistan accurately.",
      },
      {
        criterion: "Human experience and evidence",
        points: 2,
        description:
          "Identifies displacement, violence or another supported human experience and gives a source-supported detail; one mark for each. Distinguishes earlier events from consequences of the 1947 partition.",
      },
      {
        criterion: "Distinction",
        points: 1,
        description:
          "Clearly separates political independence from lived experience instead of treating one as a full account of the other.",
      },
      {
        criterion: "Precise English",
        points: 1,
        description:
          "Uses concise, intelligible own wording and accurate references to people, places or events.",
      },
    ],
  },
  {
    id: "migration-and-belonging",
    title: "Who gets to belong?",
    prompt:
      "Explain the difference between legal status and accepted belonging using one Windrush detail. Connect the example to Britain’s imperial relationship with the Caribbean.",
    operator: "Explain",
    responsePurpose: "A short contrast about citizenship and belonging",
    expectedWords: "25–40 words",
    instructions: [
      "Aim for 25–40 words. Make the contrast clear, for example with a concession or contrasting clause.",
      "Use and save a relevant source. One person’s experience cannot represent everyone’s identity or treatment.",
    ],
    minWords: 20,
    maxWords: 100,
    minSources: 1,
    points: 5,
    rubric: [
      {
        criterion: "Legal status and belonging",
        points: 2,
        description:
          "Distinguishes a legal entitlement/status from social acceptance or institutional treatment, and explains the difference rather than listing two terms.",
      },
      {
        criterion: "Specific source evidence",
        points: 1,
        description:
          "Uses a relevant, attributable detail from the arrival evidence or Williams review.",
      },
      {
        criterion: "Imperial connection",
        points: 1,
        description:
          "Connects the example accurately with colonial ties or British subjecthood, without crediting June 1948 arrivals to an Act effective in 1949.",
      },
      {
        criterion: "Coherent English contrast",
        points: 1,
        description:
          "Expresses the relationship clearly with appropriate linking or sentence structure; no particular linking word is required.",
      },
    ],
  },
  {
    id: "remembering-empire",
    title: "When does an empire end?",
    prompt:
      "Analyse the contrast between the expressions of regret and the denial of liability in the 2013 Kenya statement. What position does this wording present, and how does the statement complicate the idea that imperial history ended at independence?",
    operator: "Analyse wording",
    responsePurpose:
      "A source analysis connecting independence with continuing consequences",
    expectedWords: "35–50 words",
    instructions: [
      "Aim for 35–50 words. Link a precise word or phrase to the government’s communicative purpose and a continuing consequence.",
      "Save the statement. It records an official position in 2013; it cannot establish what all people in Britain think today.",
    ],
    minWords: 25,
    maxWords: 100,
    minSources: 1,
    points: 5,
    rubric: [
      {
        criterion: "Precise textual evidence",
        points: 1,
        description:
          "Refers precisely to authentic wording expressing regret and/or limiting liability, clearly distinguished from editorial paraphrase.",
      },
      {
        criterion: "Language and purpose",
        points: 2,
        description:
          "Explains the tension between acknowledgement and a legal boundary, and its communicative effect or purpose; reward analysis rather than treating regret as an unlimited admission.",
      },
      {
        criterion: "Connection across time",
        points: 1,
        description:
          "Explains how the post-independence statement, claims or settlement show continuing consequences of colonial rule.",
      },
      {
        criterion: "Scope and clarity",
        points: 1,
        description:
          "Expresses a bounded interpretation of this official position without generalising it to all British opinion or claiming all responsibility was accepted.",
      },
    ],
  },
  {
    id: "whose-britain",
    title: "The past inside the present",
    prompt:
      "Your school magazine asks: “How far does Britain’s imperial past help explain British identities today?” Write a comment for readers your age. Develop two connections between past events and present-day belonging, public memory or ideas about Britain. Use one case about resistance or independence and one about belonging or memory. Consider a complication and explain one limit of your evidence.",
    operator: "Comment",
    responsePurpose: "An evidence-based school-magazine comment",
    expectedWords: "120–180 words",
    instructions: [
      "Aim for 120–180 words. Give a clear judgement and explain how each historical example supports it; a list of events is not an argument.",
      "Identify at least two relevant sources in your comment and save them in your notebook. Judge the value of your examples by their explanatory relevance and whose experiences they represent.",
      "Write clear paragraphs for readers your age. Treat British identities as plural: experiences and views can differ between and within nations, communities and generations. Supported disagreement can earn full marks.",
      "During revision, check one past-to-present link for overstatement and improve one sentence for clarity. A complication might be another influence on identity or a source that cannot show present-day opinion.",
    ],
    minWords: 100,
    maxWords: 240,
    minSources: 2,
    points: 10,
    rubric: [
      {
        criterion: "Judgement and explanation",
        points: 3,
        description:
          "States a defensible judgement and develops two historical-to-present connections, one mark for each. Uses relevance or representation to weigh what the cases can explain and considers a complication; do not reward unsupported inevitability.",
      },
      {
        criterion: "Purposeful evidence",
        points: 2,
        description:
          "Uses accurate evidence from two cases, including resistance/independence and belonging/memory, and identifies at least two relevant sources. Credit evidence that advances the argument, not a list of facts or links.",
      },
      {
        criterion: "Source scope",
        points: 1,
        description:
          "Explains a specific source limit and respects plural identities; a single official statement or individual experience is not evidence of everyone’s present opinion.",
      },
      {
        criterion: "Audience and text type",
        points: 2,
        description:
          "Produces a focused comment with an accessible position and explanations suited to school-magazine readers; one mark for a recognisable comment, one for effective audience awareness.",
      },
      {
        criterion: "Coherence and English",
        points: 2,
        description:
          "Organises the argument clearly and uses sufficiently precise, intelligible English to connect claim, evidence and qualification; one mark for each. Assess communication, not a quota of advanced vocabulary.",
      },
    ],
  },
];
