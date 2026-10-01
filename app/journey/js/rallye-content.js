// Six focused English responses (30 minutes) and a final comment (15 minutes).
// Suggested lengths are planning guidance; all marks require human assessment.
// Changed questions use contentRevision so earlier drafts retain their original prompts.
export const rallye = {
  id: "empire-echoes-rallye-v1",
  activityLabel: "A 45-minute English enquiry",
  title: "Empire. Evidence. Identity.",
  subtitle:
    "A 45-minute English enquiry: from imperial power to identities today.",
  minutes: 45,
  points: 40,
  introduction:
    "Follow six stops from a trading charter to resistance, independence, migration and memory. Build a small evidence bank, analyse how sources present power, then write a comment for your school magazine about British identities today.",
  instructions: [
    "Plan for 30 minutes on the six stops and 15 minutes on your final comment, including revision and hand-in. The times are guides, not a countdown.",
    "Use the map and prepared source cards, then write the short product named at each stop. The two wording analyses use authentic quotations; the labelled summaries are our paraphrases.",
    "The prepared cards provide the evidence for the timed enquiry, online or offline. Open original websites for optional further research.",
    "Save a source at the Jamaica, Windrush and Kenya stops. For the final comment, select at least two sources and explain what their evidence shows. A saved link alone is not an argument.",
    "All seven written responses are required. Word targets guide your planning; concise, clear reasoning matters more than length. Your work saves in this browser until you finish and download it.",
    "A teacher gives feedback on evidence, analysis and English communication. The 40 practice marks are local formative criteria, not an official examination scale. Supported disagreement can earn full marks.",
  ],
  framing:
    "British identities are plural: national, regional, ethnic, family and generational identities may overlap. England, Great Britain and the United Kingdom are not interchangeable names. A writer’s or government’s claim is not evidence of what everyone thinks; test it against a specific source and context.",
  mapReminder:
    "The atlas uses annual snapshots and approximate modern geographical units. A colour records a political relationship, not equal rights, complete control or shared beliefs. Use the dated sources to explain what changes on the map.",
  stations: [
    {
      id: "profit-and-power",
      title: "When trade becomes rule",
      location: "Bengal / Britain",
      period: "1600 → 1765",
      minutes: 4,
      theme: "Commerce, wealth and power",
      context:
        "The East India Company received a royal trading charter in 1600; this did not make it the ruler of India. After warfare and political agreements, it acquired revenue-collection rights in Bengal, Bihar and Orissa in 1765. Tax income could finance troops and government. Expansion depended on decisions, alliances and resistance.",
      mapFocus: {
        year: 1765,
        territoryId: "british-india",
      },
      sourceIds: ["profit-company", "profit-charter"],
      researchInstructions: [
        "Compare 1600 with 1765 on the atlas. Then read “From trade to tax collection” to explain the change; colour alone cannot explain how power grew.",
      ],
      investigation: {
        prompt:
          "Explain how revenue collection helped the East India Company move from trade towards territorial rule. Use the 1600–1765 change and one source detail to connect money with power.",
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
        teacherAnswer:
          "The Company began as a chartered trader in 1600. Its 1765 revenue rights supplied tax income to finance troops and administration, helping it exercise and extend territorial power.",
        operator: "Explain",
        responsePurpose: "A short causal note",
        expectedWords: "20–35 words",
        support: {
          stems: [
            "The evidence links … to … because …",
            "This helps explain …, although …",
          ],
          vocabulary: [
            {
              term: "revenue",
              meaning: "money received, for example through taxes",
            },
            {
              term: "to exert influence on",
              meaning: "to affect decisions or a situation",
            },
            {
              term: "a consequence of",
              meaning: "a result of something",
            },
          ],
        },
      },
    },
    {
      id: "freedom-and-memory",
      title: "Who made freedom happen?",
      location: "Jamaica / Britain",
      period: "1831 → 1838",
      minutes: 5,
      theme: "Enslavement, resistance and remembrance",
      context:
        "In Jamaica, Samuel Sharpe helped organise enslaved workers in 1831; a strike became a rebellion, suppressed by colonial forces. Parliament’s 1833 Abolition Act took effect in 1834, but compulsory unpaid apprenticeship continued until 1838. Compensation went to slave-owners. Ending slavery did not end British colonial rule.",
      mapFocus: {
        year: 1838,
        territoryId: "jamaica",
      },
      sourceIds: ["freedom-rebellion", "freedom-compensation"],
      researchInstructions: [
        "Locate Jamaica in 1838 and check its continuing colonial status. Read the two core cards for resistance and abolition evidence.",
        "Save one source to your notebook. The museum sentence below is an invented teaching example, not an authentic museum quotation.",
      ],
      investigation: {
        prompt:
          "An invented museum label reads: “Britain gave enslaved people their freedom.” Rewrite it for visitors your age. Include enslaved people’s resistance and one accurate detail about abolition, apprenticeship or compensation.",
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
        teacherAnswer:
          "Enslaved people, including Samuel Sharpe’s supporters in Jamaica, resisted slavery. Abolition took effect in 1834, but compulsory apprenticeship continued until 1838, while slave-owners received compensation.",
        operator: "Rewrite",
        responsePurpose: "A museum label for teenage visitors",
        expectedWords: "20–35 words",
        support: {
          stems: ["This panel explains how …", "The evidence from … shows …"],
          vocabulary: [
            {
              term: "resistance",
              meaning: "action against an imposed power",
            },
            {
              term: "apprenticeship",
              meaning: "here: compulsory labour after legal abolition",
            },
            {
              term: "to compensate",
              meaning: "to pay someone for a loss",
            },
          ],
        },
      },
    },
    {
      id: "rule-and-resistance",
      title: "One colour, unequal power",
      location: "India / Canada",
      period: "1857 → 1867",
      minutes: 6,
      theme: "Authority, agency and unequal citizenship",
      context:
        "After the 1857 uprising, governing powers in British India passed from the Company to the Crown in 1858. Victoria’s proclamation announced the new relationship between the Crown and its subjects. Canada’s self-governing dominion in 1867 offers a different form of imperial government, with inequalities of its own.",
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
        "Inspect India in 1858. Read the proclamation’s authentic quotation and its context before writing.",
        "The Canada card helps explain why one imperial map colour can cover different forms of rule; use it as context if helpful.",
      ],
      investigation: {
        prompt:
          "Analyse how one word or short phrase in Victoria’s 1858 proclamation presents British rule to people in India. Explain its possible effect or purpose, then state why this promise cannot establish how people were actually treated.",
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
        teacherAnswer:
          "“Equal and impartial” presents Crown rule as fair and protective. After the uprising, this assurance could seek trust and loyalty among people in India. It establishes the official promise, but evidence of administration and people’s experiences is needed to judge whether it was fulfilled.",
        operator: "Analyse wording",
        responsePurpose: "A note linking language, purpose and evidence",
        expectedWords: "35–50 words",
        support: {
          stems: [
            "The phrase “…” presents … as …, which could …",
            "This suggests …, but does not establish …",
          ],
          vocabulary: [
            {
              term: "impartial",
              meaning: "treating different sides fairly",
            },
            {
              term: "a disconnect between … and …",
              meaning: "a lack of agreement between two things",
            },
            {
              term: "to establish",
              meaning: "to show with evidence",
            },
          ],
        },
      },
    },
    {
      id: "departure-and-division",
      title: "Independence is more than a border",
      location: "India / Pakistan / Britain",
      period: "1947",
      minutes: 4,
      theme: "Decolonisation and its human consequences",
      context:
        "British rule ended in 1947 and independent India and Pakistan were created. Partition was accompanied by mass displacement and violence. Political movements, regional and religious tensions, British decisions and negotiations all shaped events. A legal change on a map cannot capture these varied human experiences.",
      mapFocus: {
        year: 1947,
        territoryId: "british-india",
      },
      sourceIds: ["departure-partition"],
      researchInstructions: [
        "Compare 1946 and 1948 on the atlas. Read the partition card: separate the constitutional change from a documented human experience.",
      ],
      investigation: {
        prompt:
          "Outline what changed politically in 1947 and one human experience surrounding partition that the map cannot show. Use a specific detail from the partition source.",
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
        teacherAnswer:
          "Independent India and Pakistan replaced British rule in 1947. Iqbal’s aunt recalls her family’s earlier displacement, showing a human experience invisible in the map’s colour change.",
        operator: "Outline",
        responsePurpose:
          "Two sentences distinguishing a border change from experience",
        expectedWords: "20–30 words",
        support: {
          stems: ["The map records … . The source adds … ."],
          vocabulary: [
            {
              term: "displacement",
              meaning: "being forced to leave one’s home",
            },
            {
              term: "testimony",
              meaning: "a person’s account of an experience",
            },
            {
              term: "sovereignty",
              meaning: "authority to govern a territory",
            },
          ],
        },
      },
    },
    {
      id: "migration-and-belonging",
      title: "Who gets to belong?",
      location: "The Caribbean / Britain",
      period: "1948 → the Windrush scandal",
      minutes: 5,
      theme: "Citizenship, migration and everyday belonging",
      context:
        "Windrush arrived in June 1948 carrying passengers from the Caribbean and elsewhere. People from Britain’s Caribbean colonies were British subjects then; the British Nationality Act passed later in 1948 took effect in 1949. Decades later, the Windrush scandal exposed wrongful treatment of people lawfully living in Britain. Legal status did not ensure fair treatment.",
      mapFocus: {
        year: 1948,
        territoryId: "jamaica",
      },
      sourceIds: ["migration-windrush", "migration-review"],
      researchInstructions: [
        "Find Jamaica in 1948: it remained a colony until 1962. Read the arrival card and the later review, keeping their different dates and voices clear.",
        "Save one source to your notebook. Its evidence should support the distinction in your response.",
      ],
      investigation: {
        prompt:
          "Explain the difference between legal status and accepted belonging using one Windrush detail. Connect the example to Britain’s imperial relationship with the Caribbean.",
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
        teacherAnswer:
          "Caribbean colonial ties meant arrivals could be British subjects, yet this status did not guarantee acceptance. Williams’s review documents injustice towards lawful residents, showing how institutions could exclude people whose lives and belonging were already connected to Britain.",
        operator: "Explain",
        responsePurpose: "A short contrast about citizenship and belonging",
        expectedWords: "25–40 words",
        support: {
          stems: [
            "Although …, the evidence shows …",
            "This example suggests …, but does not represent …",
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
              term: "regardless of",
              meaning: "without being affected by",
            },
          ],
        },
      },
    },
    {
      id: "remembering-empire",
      title: "When does an empire end?",
      location: "Kenya / Hong Kong / Britain",
      period: "1963 → 1997 → public memory",
      minutes: 6,
      theme: "Independence, responsibility and continuing connections",
      context:
        "Kenya became independent in 1963. In 2013, the UK government acknowledged torture and ill-treatment during colonial rule and announced a settlement for 5,228 claimants, while denying legal liability. Hong Kong’s 1997 transfer of sovereignty offers another constitutional ending; neither date erased all historical connections. Some UK Overseas Territories remain.",
      mapFocus: {
        year: 1963,
        territoryId: "kenya",
      },
      sourceIds: ["memory-mau-mau", "memory-hong-kong"],
      researchInstructions: [
        "Inspect Kenya around 1963, then read the 2013 statement’s authentic quotations and provenance. Save this source to your notebook.",
        "Hong Kong in 1997 is an optional comparison: a change of sovereignty can coexist with continuing connections and memories.",
      ],
      investigation: {
        prompt:
          "Analyse the contrast between the expressions of regret and the denial of liability in the 2013 Kenya statement. What position does this wording present, and how does the statement complicate the idea that imperial history ended at independence?",
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
        teacherAnswer:
          "The expression of regret recognises suffering, while the government denies legal liability for the claims. This presents an acknowledgement of abuse alongside a legal defence. Addressing claimants in 2013 shows that consequences continued after Kenya’s independence; it does not reveal every Briton’s views.",
        operator: "Analyse wording",
        responsePurpose:
          "A source analysis connecting independence with continuing consequences",
        expectedWords: "35–50 words",
        support: {
          stems: [
            "By using “…”, the speaker presents … as …",
            "This supports the claim that …, but cannot tell us …",
          ],
          vocabulary: [
            {
              term: "to acknowledge",
              meaning: "to recognise that something is true",
            },
            {
              term: "liability",
              meaning: "legal responsibility",
            },
            {
              term: "to grapple with",
              meaning: "to work hard to understand or deal with something",
            },
          ],
        },
      },
    },
  ],
  finalAssessment: {
    id: "whose-britain",
    title: "The past inside the present",
    period: "1600 → today",
    minutes: 15,
    theme: "A comment for your school magazine",
    context:
      "Today’s map shows borders. Your evidence bank shows how trade, resistance, rule, independence, migration and memory created relationships that crossed them. Use two cases to explain connections to identities in Britain, while considering what imperial history cannot explain on its own.",
    sourceIds: ["final-identities", "final-charter"],
    researchInstructions: [
      "Use two minutes to choose and order your evidence, nine to write, three to revise and one to download your hand-in.",
      "Choose at least two sources from your notebook. No new reading is required: the final reference cards are optional context.",
    ],
    investigation: {
      prompt:
        "Your school magazine asks: “How far does Britain’s imperial past help explain British identities today?” Write a comment for readers your age. Develop two connections between past events and present-day belonging, public memory or ideas about Britain. Use one case about resistance or independence and one about belonging or memory. Consider a complication and explain one limit of your evidence.",
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
      teacherAnswer:
        "A map cannot tell the whole story of Britain. Imperial history helps explain important, but different, experiences of belonging. In Jamaica, Sharpe’s supporters resisted slavery; Parliament’s account shows that compulsory apprenticeship continued after abolition. Together, these sources challenge a simple national story in which Britain gave freedom. Remembering whose actions mattered can change which experiences a public account recognises. Windrush offers a direct connection to belonging: colonial ties meant Caribbean arrivals could be British subjects, yet legal status did not guarantee fair treatment. Williams’s review documents how lawful residents later suffered injustice. Empire therefore helps explain both connection and exclusion. However, the review cannot tell us how everyone in Britain defines themselves. Region, class and personal experience also matter. We should use imperial history to explain particular relationships and question public stories, while recognising that it is one influence on plural identities rather than a complete explanation.",
      operator: "Comment",
      responsePurpose: "An evidence-based school-magazine comment",
      expectedWords: "120–180 words",
      support: {
        stems: [
          "The evidence from … helps explain … because …",
          "Although …, this source cannot establish …",
        ],
        vocabulary: [
          {
            term: "a judgement",
            meaning: "a conclusion reached after considering evidence",
          },
          {
            term: "a distorted view of",
            meaning: "an account that gives a misleading impression",
          },
          {
            term: "a legacy",
            meaning: "an effect of the past that continues",
          },
        ],
      },
    },
  },
  contentRevision: "q2-english-2026-10-01",
};
