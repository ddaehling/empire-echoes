import { rallye } from "./rallye-content.js";

/** Teacher-facing context, discussion examples and optional support for an ungraded enquiry. */
const source = (label, url) => ({ label, url });
const sources = {
  union: source(
    "UK Parliament · the Union, constitution and trade",
    "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/act-of-union-1707/overview/the-articles-constitution-and-trade/",
  ),
  identities: source(
    "ONS · National identity, England and Wales: Census 2021",
    "https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/ethnicity/bulletins/nationalidentityenglandandwales/census2021",
  ),
  company: source(
    "National Army Museum · Battle of Plassey",
    "https://www.nam.ac.uk/explore/battle-plassey",
  ),
  diwani: source(
    "National Army Museum · Clive at Plassey, 1757",
    "https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1",
  ),
  sharpe: source(
    "Jamaica Information Service · Samuel Sharpe",
    "https://jis.gov.jm/information/heroes/samuel-sharpe/",
  ),
  rebellionJamaica: source(
    "The National Archives · Willoughby Cotton’s proclamation, 2 January 1832 (CO 137/181), PDF pp. 6–7",
    "https://cdn.nationalarchives.gov.uk/documents/education/spotlight-on-baptist-war.pdf#page=6",
  ),
  proclamationText: source(
    "Tamil Digital Library · His Majesty King George’s Speeches in India, Appendix E, PDF p. 178 / printed xviii: reproduction of the 1858 proclamation",
    "https://tamildigitallibrary.in/assets/docs/uploads/primary_files/book/TVA_BOK_0025134/TVA_BOK_0025134_speeches_in_India.pdf#page=178",
  ),
  proclamation: source(
    "British Library · catalogue record for the proclamation of 1 November 1858",
    "https://searcharchives.bl.uk/catalog/041-000566434",
  ),
  emancipation: source(
    "UK Parliament · The West Indian colonies and emancipation",
    "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/the-west-indian-colonies-and-emancipation/",
  ),
  legacies: source(
    "UCL · Centre for the Study of the Legacies of British Slavery",
    "https://www.ucl.ac.uk/social-historical-sciences/history/research/research-projects-and-centres/centre-study-legacies-british-slavery-cslbs",
  ),
  compensation: source(
    "UCL · Research on British slave-ownership and its legacies",
    "https://www.ucl.ac.uk/research-innovation/case-studies/2014/dec/engaging-legacies-british-slave-ownership",
  ),
  rebellion: source(
    "National Army Museum · Why did the Indian Rebellion happen?",
    "https://www.nam.ac.uk/explore/why-did-indian-mutiny-happen",
  ),
  canada: source(
    "UK Parliament · British North America Act 1867",
    "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/collections1/parliament-and-canada/british-north-america-act-1867/",
  ),
  partition: source(
    "The National Archives · Partition of British India",
    "https://www.nationalarchives.gov.uk/education/teaching-resources/partition-of-british-india/",
  ),
  independence: source(
    "The National Archives · Indian independence, part one",
    "https://www.nationalarchives.gov.uk/education/teaching-resources/indian-independence-part-one/",
  ),
  migration: source(
    "The National Archives · Ena Clare Sullivan nationality registration, 3 December 1968 (HO 334/1406/110478), PDF pp. 19–21",
    "https://cdn.nationalarchives.gov.uk/documents/education/empire-windrush-caribbean-migration.pdf#page=19",
  ),
  nationality: source(
    "The National Archives · Nationality and the Immigration Act 1971",
    "https://www.nationalarchives.gov.uk/education/resources/commonwealth-migration-since-1945/changes-to-british-nationality-act-with-immigration-act-1971/",
  ),
  windrush: source(
    "Wendy Williams · Windrush Lessons Learned Review (2020)",
    "https://www.gov.uk/government/publications/windrush-lessons-learned-review",
  ),
  windrushRoots: source(
    "Independent research · The Historical Roots of the Windrush Scandal",
    "https://www.gov.uk/government/publications/the-historical-roots-of-the-windrush-scandal/the-historical-roots-of-the-windrush-scandal-independent-research-report-accessible",
  ),
  kenya: source(
    "UK Government · Statement on settlement of Mau Mau claims, 6 June 2013",
    "https://www.gov.uk/government/news/statement-to-parliament-on-settlement-of-mau-mau-claims",
  ),
  hongKong: source(
    "Sino-British Joint Declaration · treaty text, 1984",
    "https://www.cmab.gov.hk/en/issues/jd2.htm",
  ),
  commonwealth: source(
    "The Commonwealth · Charter, 2013",
    "https://thecommonwealth.org/charter",
  ),
};

const keyDetails = {
  "profit-and-power": {
    evidence: [sources.company, sources.diwani],
    note: "The task asks students to compare two kinds of political power and defend a choice. In 1757, the Company helped Mir Jafar replace Bengal’s ruler; in 1765, it acquired tax-collecting rights. Discuss the criterion behind the judgement: influence over who rules, or a continuing capacity to raise revenue and administer territory. Either choice can be convincing when the comparison explains what the other development also shows. Revenue could finance officials and troops, but taxation was not the only source of finance. Keep the earlier 1600 trading charter distinct from these developments.",
    alternatives: [
      "A student may choose 1757 because helping replace a ruler demonstrates power over political leadership, while recognising the later importance of revenue rights.",
      "A student may choose 1765 because tax collection and an administration show sustained governing capacity, while recognising the political intervention in 1757.",
    ],
    misconceptions: [
      "A charter in 1600 gave the Company ownership of India.",
      "Company rule and direct Crown government were identical.",
      "Every inhabitant of Britain benefited equally from imperial profits.",
    ],
    discussion: [
      "What would you need to know about taxpayers, soldiers or local officials to test the proposed causal chain?",
    ],
  },
  "freedom-and-memory": {
    evidence: [
      sources.rebellionJamaica,
      sources.emancipation,
      sources.sharpe,
      sources.compensation,
    ],
    note: "The task asks for a replacement museum label for teenage visitors and an explanation of the writer’s main editorial choice. Discuss how details from both sources change the story, rather than accepting a list of facts or a reversed slogan. Cotton’s military proclamation of 2 January 1832 records colonial threats against rebels, not an account in their own voice. Read it alongside Parliament’s account. Resistance supplies enslaved agency, while apprenticeship or compensation can complicate a gift-of-freedom narrative. Parliament’s action can still be recognised. The additional JIS profile helps with Sharpe’s organising but its Act passage date is imprecise: corroborate 1833/1834 with Parliament. A 1833 Act taking effect in 1834 is more precise than treating those as competing dates.",
    alternatives: [
      "The revised panel may foreground resistance, the incomplete transition from slavery, compensation to owners, or a combination; the explanation should show why that emphasis changes a visitor’s understanding.",
      "A student may preserve a place for abolitionist campaigning while using both sources to explain why enslaved people’s actions and the limits of the legal change also belong in the label.",
    ],
    misconceptions: [
      "The 1807 Act immediately freed enslaved people in Jamaica.",
      "Those formerly enslaved received the compensation.",
      "Jamaica became independent when apprenticeship ended.",
    ],
    discussion: [
      "Whose name, action or experience belongs on a public panel, and which evidence justifies the choice?",
    ],
  },
  "rule-and-resistance": {
    evidence: [
      sources.proclamationText,
      sources.proclamation,
      sources.rebellion,
      sources.canada,
    ],
    note: "Link a short phrase from the original wording to a purpose and a plausible audience effect. For example, the promise of equal protection presents Crown rule as fair and reassuring after rebellion. This is an interpretation of the wording, not proof of its success or implementation. The student card reproduces an excerpt from the 1858 proclamation via a later book: His Majesty King George’s Speeches in India, Appendix E, PDF p. 178 / printed xviii, held by Tamil Digital Library. The separate British Library catalogue record supplies contextual provenance. Distinguish the original proclamation, its later reproduction and the editorial summary. Canada remains an optional comparison of governmental forms; elected settler government was not universal political equality.",
    alternatives: [
      "Students may request court records, recruitment records, testimony or local administrative records to test the promise.",
      "A student may argue that the promise later offered a standard against which subjects could criticise rule, while distinguishing that inference from demonstrated practice.",
    ],
    misconceptions: [
      "A biased or official source is useless.",
      "Self-government meant equal rights for Indigenous peoples and all other inhabitants.",
      "All Indian communities reacted identically to Company rule or the rebellion.",
    ],
    discussion: [
      "What can an unfulfilled promise still tell a historian about an institution and the people it addresses?",
    ],
  },
  "departure-and-division": {
    evidence: [sources.partition, sources.independence],
    note: "The task asks students to argue how a borders-and-dates account changes when read alongside both personal accounts. Singh’s concern about Sikh interests being ignored raises the question of whose voice counts in political decisions; the family memory makes losing a home visible. Students should connect those details to their argument and explain why chronology changes what can be claimed. Singh wrote on 1 June 1946, and the later oral testimony recalls displacement before partition. Neither account establishes displacement caused by the final 1947 boundary or is a response written after independence. Keep the date of the remembered experience separate from the later act of remembering, and avoid treating either perspective as universal.",
    alternatives: [
      "An argument may emphasise representation and insecurity, showing how Singh’s concern and the family’s loss complicate a story centred on sovereign states.",
      "An argument may emphasise chronology: concerns and displacement already existed before the final border, so independence dates cannot by themselves explain every experience. Both accounts still have limited individual scope.",
    ],
    misconceptions: [
      "The map shows precise day-by-day borders in August 1947.",
      "Partition was inevitable because religious communities could never coexist.",
      "Every South Asian person in Britain has the same migration or partition history.",
    ],
    discussion: [
      "Which matters more for the question you are asking: a constitutional document, a boundary map, or a person’s testimony? Explain rather than rank them absolutely.",
    ],
  },
  "migration-and-belonging": {
    evidence: [
      sources.migration,
      sources.nationality,
      sources.windrush,
      sources.windrushRoots,
    ],
    note: "The task now focuses on how “my beloved England” shapes the witness’s criticism. Connect the possessive “my” and affectionate “beloved” to an interpretation of attachment, then explain how the reported treatment makes that language significant. A reading of hurt, betrayal or an appeal to belonging should draw on the review’s findings and the colonial relationship, rather than simply call the language emotional. Imperial subjecthood helps explain a historical connection; it does not establish this unnamed person’s exact status, biography or feelings beyond the quoted words. Ena Clare Sullivan’s registration is a separate source: do not attribute the testimony to her or infer that she experienced the scandal. Neither source represents all migrants.",
    alternatives: [
      "A student may read the affection as intensifying a sense of betrayal: treatment by institutions conflicts with the attachment the speaker expresses.",
      "A student may read the possessive and affection as an assertion of belonging, or as an appeal to the country to meet expectations. Support the interpretation through the wording, review findings and colonial context without claiming a single intended effect.",
    ],
    misconceptions: [
      "The 1948 Act had already taken effect when the Empire Windrush arrived in June.",
      "Legal residence means every person was a British citizen, or legal citizenship always meant equal treatment.",
      "Black British history began in 1948.",
    ],
    discussion: [
      "What evidence would establish legal status, and what different evidence would establish felt belonging?",
    ],
  },
  "remembering-empire": {
    evidence: [sources.kenya, sources.hongKong],
    note: "The task asks for a qualified judgement about meaningful recognition, not only identification of the contrast. Students can define what would make recognition meaningful and weigh the wording of both extracts alongside the £19.9 million settlement, including legal costs, for 5,228 claimants and support for a Nairobi memorial. Regret, material settlement and public commemoration can carry significance while denial of liability limits the legal acknowledgement. Different judgements are defensible. Do not treat the total as money divided equally among claimants, turn regret into an unlimited apology, or assume survivors all approved. Their views would help assess the settlement’s meaning. Hong Kong remains an optional comparison.",
    alternatives: [
      "Students may judge the recognition meaningful because regret is accompanied by a settlement and memorial support, while explaining how the liability denial limits that conclusion.",
      "Students may judge the recognition insufficient because responsibility remains restricted, while acknowledging the settlement’s material and commemorative significance. The official statement alone cannot settle what survivors considered adequate.",
    ],
    misconceptions: [
      "The 2013 statement resolved every claim arising from colonial rule.",
      "Hong Kong became an independent sovereign state in 1997.",
      "Every overseas territory and all imperial relationships disappeared in 1997.",
    ],
    discussion: [
      "Which phrases establish the statement’s scope, and which additional voices would change or extend the account?",
    ],
  },
};

const possibleExamples = {
  "profit-and-power": "Helping Mir Jafar replace Bengal’s ruler in 1757 shows that the Company could influence political leadership. I find the 1765 tax-collecting rights stronger evidence of sustained political power: the museum describes officials and soldiers collecting revenue and policing territory, with tax income supporting further military action. Both developments go beyond trade, but 1765 shows a continuing capacity to govern as well as intervene.",
  "freedom-and-memory": "Replacement label: Enslaved people in Jamaica resisted slavery, and colonial forces threatened them with death if they did not surrender. Parliament’s abolition law took effect in 1834, but compulsory apprenticeship continued until 1838, while compensation went to slave-owners. Freedom involved struggle and an incomplete legal transition. Editorial choice: I replaced “gave” because it makes enslaved people passive. Cotton’s threats reveal resistance to colonial control, while Parliament’s account shows why abolition did not immediately mean freedom from compulsory work.",
  "rule-and-resistance": "“Equal and impartial” presents Crown rule as fair and protective. After the uprising, this assurance could seek trust and loyalty among people in India. It establishes the official promise, but evidence of administration and people’s experiences is needed to judge whether it was fulfilled.",
  "departure-and-division": "Borders and independence dates show a change of states but can hide whose interests were heard and what losing a home meant. Singh’s concern that Sikh interests were being ignored points to uncertainty about representation; Iqbal’s aunt’s memory makes family displacement visible. Both concern the period before the final 1947 border: Singh wrote in 1946, and the later testimony recalls an earlier displacement. They therefore complicate a story that begins with the new boundary, but cannot prove that this boundary caused the family’s move or establish everyone’s experience.",
  "migration-and-belonging": "“My” claims a personal connection to England, while “beloved” expresses affection. That attachment makes the witness’s disbelief sound like hurt or betrayal rather than simple rejection of the country. Williams’s findings of harm to lawful residents give this contrast an institutional context. Colonial subjecthood had already connected the Caribbean to Britain, so belonging cannot be understood only as arrival from somewhere unrelated. Yet this unnamed witness is not Ena Sullivan, and the quotation cannot tell us how all migrants felt.",
  "remembering-empire": "I find the recognition meaningful but limited. “Sincerely regrets” publicly acknowledges the abuses, and the £19.9 million settlement for 5,228 claimants, including legal costs, gives the response material substance. Support for a Nairobi memorial also offers public commemoration. However, “We continue to deny liability” maintains a legal boundary around responsibility. Recognition therefore does not amount to accepting every claim. The statement establishes the government’s position; survivors’ accounts would be needed to assess whether they regarded this response as adequate.",
  "whose-britain": "A map cannot tell the whole story of Britain. Imperial history helps explain important, but different, experiences of belonging. In Jamaica, Sharpe’s supporters resisted slavery; Parliament’s account shows that compulsory apprenticeship continued after abolition. Together, these sources challenge a simple national story in which Britain gave freedom. Remembering whose actions mattered can change which experiences a public account recognises. Windrush offers a direct connection to belonging: colonial ties meant Caribbean arrivals could be British subjects, yet legal status did not guarantee fair treatment. Williams’s review documents how lawful residents later suffered injustice. Empire therefore helps explain both connection and exclusion. However, the review cannot tell us how everyone in Britain defines themselves. Region, class and personal experience also matter. We should use imperial history to explain particular relationships and question public stories, while recognising that it is one influence on plural identities rather than a complete explanation."
};

function makeStationKey(station) {
  const task = station.investigation;
  const detail = keyDetails[station.id];
  return {
    id: station.id,
    title: station.title,
    minutes: station.minutes,
    context: station.contextParagraphs || [station.context],
    prompt: task.prompt,
    operator: task.operator,
    product: task.responsePurpose,
    requirements: task.instructions,
    answer: [possibleExamples[station.id]],
    teachingNote: detail.note,
    evidence: detail.evidence,
    alternatives: detail.alternatives,
    misconceptions: detail.misconceptions,
    discussion: task.discussionPrompts || detail.discussion,
    map: { ...station.mapFocus },
  };
}

function makeFinalKey(final) {
  const task = final.investigation;
  return {
    id: final.id,
    title: final.title,
    minutes: final.minutes,
    context: final.contextParagraphs || [final.context],
    operator: task.operator,
    product: task.responsePurpose,
    prompt: task.prompt,
    requirements: task.instructions,
    answer: [possibleExamples[final.id]],
    teachingNote: "Read this as a comment for a school magazine. Invite students to develop their own position and explain how their chosen historical examples help them think about belonging or public memory today. A complication or a specific source limit can make the judgement more precise. The example is a conversation starter; students do not need to share its conclusion or copy its structure.",
    alternatives: [
      "A partial disagreement might argue that the sources establish particular institutional and community connections but cannot prove that empire is more important than every other influence on identity.",
      "An agreement might use migration as a direct connection and public memory as a contested connection, while arguing that present borders are an inadequate measure of either.",
      "Students may weigh class, religion, regional politics, European relationships or later events as additional influences. Discuss how those influences qualify the argument and what further evidence would help.",
    ],
    misconceptions: [
      "There is one national psychology that can be read from the size of the empire.",
      "A government statement is a public-opinion survey.",
      "The class must agree with the teacher or reach one shared conclusion about identity.",
    ],
    discussion: task.discussionPrompts || [],
    evidence: [sources.identities, sources.windrush, sources.kenya],
    feedback: [
      "Invite students to explain, compare and revise their ideas. Discuss evidence and reasoning without turning the examples into a required answer.",
      "Offer one optional next step that helps a student develop their own idea, such as: ‘How does that historical detail help explain the connection you describe?’ Give the student time to revise if they wish.",
      "A source can be named naturally in a sentence: ‘Parliament’s account explains …’ or ‘The Williams review records …’. The notebook is optional, and formal citation formatting is unnecessary for this classroom activity.",
      "For contextual explanation, use the labelled summary or a teacher-issued equivalent if a link is blocked. When interpreting language or evaluating a speaker’s position, use the original wording printed in the source card or an equivalent original excerpt; an editorial summary cannot establish the original speaker’s language choices.",
      "For English-language support, discuss one useful revision in audience, organisation or vocabulary. For example, replace an unclear ‘they’ with the group intended, or try ‘although’ to make a contrast visible. Keep factual clarification separate from language support.",
      "Work remains editable. Saving and downloading preserve a learning record; they do not lock a response or automatically judge its quality. The teacher material is openly accessible so students may use it as another support if that suits the lesson.",
    ],
  };
}

export const teacherGuide = {
  id: "empire-echoes-teacher-guide-enquiry-analysis-2026-10-01",
  title: "Before the discussion",
  subtitle:
    "Q2 English: background, discussion examples and optional support for the Empire / Echoes learning enquiry.",
  overviewNote:
    "Teacher reference · The sample responses illustrate possible reasoning and invite discussion; students can develop a different view and revise their work throughout.",
  overview: [
    "This Q2 English activity asks how imperial history helps explain plural British identities today. Students read short evidence cards, analyse original public language, and write an audience-aware comment in English. Commerce, coercion, resistance, independence, migration and public memory supply relevant contextual knowledge. Territorial extent is a starting point, not a measure of human experience.",
    "There is no single British state of mind. Distinguish a state’s institutions and official statements from a population’s varied identities, and distinguish both from individual experiences. Students may agree, disagree or qualify the final claim. Discuss the evidence and the connections they make, without seeking political agreement.",
    "The route samples South Asia, the Caribbean and Kenya, with comparisons to Canada and Hong Kong. It cannot represent every colony or community. The wider atlas and territory pages provide a route into further enquiries rather than a claim to completeness.",
  ],
  learningGoals: [
    "Compare evidence and defend an interpretation or judgement; distinguish an original excerpt from an institutional account or editorial summary, and explain how timing and perspective limit a claim.",
    "Analyse how a short quotation presents authority or responsibility: connect language choice, purpose, audience and a plausible effect rather than naming a device alone.",
    "Explain historical connections clearly in English, including colonised people’s agency and differences between legal status, lived belonging and public memory.",
    "Write a coherent school-magazine comment that develops two historical connections, weighs a complication or evidence limit and reaches a qualified judgement about plural British identities.",
    "Revise one aspect of evidence, organisation or language; use precise vocabulary and connectors to make relationships and limits intelligible.",
  ],
  unitAlignment: [
    "Primary planning materials: Q2_Englisch_UK_5_Verlaufsplanungen_AUSFUEHRLICH_2026_27.pdf (213 pages), Lehrerhandbuch_Q2_Englisch_UK_2026_27.pdf (129 pages), and UK_Q2_Lehrwerksrecherche_SH_2026_27.pdf (22 pages). The shorter 28-page plans and the three supplied classroom documents are supplementary. These documents guide the teaching sequence and its learning aims.",
    "The guide follows the handbook’s principle that selected historical knowledge should serve analysis of the present, with careful distinctions between evidence, interpretation and judgement (handbook, PDF pp. 12–13). Its primary competence focus is reading and text/media analysis leading to written production; the follow-up provides a brief speaking opportunity.",
    "Possible placement: consolidate historical anchors before Plan A’s memory discussion (detailed plans, PDF pp. 41–43), or connect a contemporary belonging enquiry to Plan B’s functional use of background knowledge (PDF pp. 75, 79). This is an adaptation using this app’s sources and products, not a reproduction of those lessons.",
    "The route covers one Empire-to-postcolonial-Britain enquiry. It does not replace the full UK unit, the Elizabethan Age strand, or planned listening, viewing, mediation and extended speaking lessons. The primary plans assign distinct competences to those lessons; changing the medium changes the learning opportunity.",
  ],
  lessonIntegration: [
    "0–5 minutes: establish the enquiry and the distinction between original wording and summary. Demonstrate one source card, map return, optional notebook and download. Briefly rehearse how to support an interpretation or judgement with evidence; do not pre-teach the model answers.",
    "5–50 minutes: run the 45-minute enquiry. Protect the final 15 minutes: 2 to plan, 9 to write, 3 to revise and 1 to export. The first 30 minutes are station responses that compare evidence, explain editorial choices, analyse language and evaluate recognition.",
    "50–57 minutes: in pairs, each student defends one connection with a named source; the partner paraphrases it, then asks one question about scope or a counterpoint. Offer one question about evidence and one optional language suggestion. Give the writer time to respond or revise.",
    "57–60 minutes: students record a specific revision target and name a question to carry into the next class text. If the timetable offers only 45 minutes, orient navigation beforehand and move this discussion/transfer to the next lesson.",
    "Timing is a planning estimate, not a classroom trial. Use the prepared core cards and indicated passages. Unrestricted web research, all optional comparisons and a first encounter with the interface will require extra time. Adjust support or extend the lesson when needed rather than removing the final judgement.",
  ],
  materialConnections: [
    "Pathway Advanced 2024: Robert Tombs, In Defence of the British Empire, and Afua Hirsch, The New Black, offer subsequent comparison of argument and perspective; Paul Hawkins, The Bloody British!, supports analysis of irony and stereotypes (material research, PDF p. 7). The app supplies historical evidence for these readings, not their text or conclusions.",
    "Context 2022: Taking Stock: The Mood in the UK is a dated journalistic representation; Sathnam Sanghera, The Legacy of the Empire, and the Argumentative Writing skills lab provide a natural transfer from this comment to fuller text analysis (material research, PDF p. 11). Do not treat a newspaper mood account as a survey of all British people.",
    "Green Line: The Voyage of the Empire Windrush is listed as listening, alongside Andrea Levy’s Back to My Own Country (material research, PDF p. 9). The app’s short written evidence can prepare or consolidate that lesson but does not practise understanding its audio.",
    "Abi-Box: Changing views of the British Empire, British history: Pride or shame? and the role-play Decolonising the curriculum? can extend evidence into a comparison or discussion. The impact of British colonialism and Empireworld are listed as listening and should retain that mode (material research, PDF p. 14).",
    "Material titles and formats above are reported by the supplied research, not verified here from every licensed book or platform. Its own evidence/access limits appear on PDF p. 5. Check the school’s edition, page numbers, excerpt length, licence and media access before assigning anything. These class-copy links are optional follow-up; no full copyrighted classroom reading is required or reproduced in the app.",
  ],
  languageFeedback: [
    "Compare and judge: explain what each piece of evidence shows, choose a criterion and defend the judgement. Interpret: connect details to an argument while keeping their dates and scope clear. Analyse: quote briefly and explain how wording works in context. Evaluate and comment: weigh evidence, consider a complication and reach a qualified position for the stated audience.",
    "Model the chain: “The phrase … presents … as … . For this audience, it may … because … . However, it cannot show … .” An effect is a justified interpretation, not a claim that every reader reacted identically.",
    "For the school magazine, look for an accessible opening, two connected examples and a clear qualified judgement. Useful language includes “contributed to”, “helps explain”, “in this case”, “although” and “this does not establish”. Avoid deterministic claims about what all British people think.",
    "Feedback example: “Your Windrush detail supports the link between imperial status and later treatment. Explain that link before the next example. For language, replace ‘everyone’ with a precise group and use ‘although’ to connect legal status and unequal treatment.” Ask the student to make the revision immediately.",
  ],
  preparation: [
    "Before class, open the six stations and their source links on the school network. Check the external pages are accessible. The atlas and source summaries work locally while the server is running; external websites and their full documents need internet access. The application is not an offline web cache.",
    "For limited connectivity, print or save the linked readings in advance where permission allows. Students can use the supplied source summaries as their evidence base and identify them explicitly as summaries. Do not ask them to pretend they opened a blocked source. A prepared short source pack is a fair alternative to live browsing.",
    "Reserve 30 minutes for six station responses and 15 for the final comment, including revision and download. Use the 60-minute wrapper below when the full lesson is available. Discussion is outside the timed 45-minute enquiry.",
    "The task names the purpose and audience of each response. Let students use the space they need to explain their idea. Read the supplied evidence, choose a useful detail and discuss its significance; open-ended research is optional extension work.",
    "Demonstrate changing the year, opening a territory page, and returning to the rallye. Explain that annual map snapshots and present-day geographic units cannot resolve every historical boundary, exact transfer date, local institution or degree of control.",
    "Ask each student to use their own browser profile and download their learning record when useful. Browser drafts can be lost when browsing data is cleared. On shared computers, download first and use the enquiry’s confirmed reset before another student begins.",
    "Give a brief content note for enslavement, racial discrimination, colonial violence and partition. Require evidence-based language and never ask students to speak on behalf of a nationality, religion or ancestry. No student needs to disclose family history to complete the task.",
    "Read the background sections and station discussion notes first. The essential reading list is enough to teach this lesson; the extension reading is for answering further questions, not homework required to finish the rallye.",
  ],
  route: [...rallye.stations, rallye.finalAssessment].map((item) => ({
    id: item.id,
    title: item.title,
    minutes: item.minutes,
    focus: `${item.period} · ${item.theme}`,
  })),
  background: [
    {
      title: "Britain, the UK and identities: establish the vocabulary",
      paragraphs: [
        "England is one country within the UK. Great Britain refers geographically to the island containing England, Scotland and Wales; the United Kingdom also includes Northern Ireland. The state changed during the period studied: the 1707 union created Great Britain, and the 1801 union created the United Kingdom of Great Britain and Ireland. Do not project today’s borders or citizenship categories backwards.",
        "Britishness is not a single ethnicity, opinion or emotional attachment. English, Scottish, Welsh, Northern Irish, Irish, British and other identities can overlap. The 2021 England and Wales census allowed more than one national identity. Its results describe self-identification in those two countries, not attitudes to empire or the whole UK. A changed order of response options also complicates comparisons with 2011.",
        "A useful classroom distinction is between legal membership, felt belonging and an official national story. These may reinforce one another or conflict. A minister’s speech supplies evidence of an official position at a particular time; it does not establish what all citizens believe. Treat any claim that empire caused a modern political choice as a hypothesis needing further evidence.",
      ],
      evidence: [sources.union, sources.identities],
    },
    {
      title:
        "Trade and conquest were intertwined, but empire was not one system",
      paragraphs: [
        "The East India Company began in 1600 as an English trading corporation. Its growth into a territorial power depended on armed force as well as negotiation, alliances and Indian labour. Victories in the mid-eighteenth century and revenue rights in Bengal in 1765 helped link commerce with government. A royal charter did not mean that the Crown directly administered every Company possession.",
        "Follow the mechanism rather than merely listing acquisitions: authority to collect revenue could finance armies and administration, which could enable further expansion. This is an explanatory chain, not proof that all revenue reached Britain, that expansion was inevitable, or that everyone in Britain benefited equally.",
        "A single colour hides constitutional differences. Canada’s 1867 confederation established a federal dominion under the Crown; India passed from Company to Crown rule in 1858. Self-government for settler institutions was not the same as equal political power for every inhabitant. Neither label should be confused with immediate, complete independence.",
      ],
      evidence: [sources.company, sources.diwani, sources.canada],
    },
    {
      title:
        "Emancipation needs a history of resistance as well as legislation",
      paragraphs: [
        "Keep three dates apart: 1807 prohibited the British slave trade; the 1833 Slavery Abolition Act came into effect in 1834 across most British colonies; in Jamaica, compulsory apprenticeship continued until 1838. The dates mark different legal changes. Abolition did not itself remove racial hierarchy, economic dependency or colonial rule.",
        "Credit enslaved people’s resistance and organising alongside abolitionists, religious networks and parliamentary action. A story centred only on Westminster makes freedom look like a gift. The legislation also compensated slave-owners, not the people who had been enslaved. UCL’s work follows those compensation records into British families, institutions and economic life.",
        "The interpretive question is how commemoration selects evidence. It is possible to value abolitionist campaigning while recognising the preceding violence and continuing inequality. Students should explain what an account makes visible and what it leaves out, rather than mechanically replacing a story of pride with a story in which every person held the same responsibility.",
      ],
      evidence: [sources.emancipation, sources.compensation, sources.legacies],
    },
    {
      title:
        "Resistance, decolonisation and the limits of a disappearing colour",
      paragraphs: [
        "The 1857 rebellion had military, political, economic and religious causes. Cartridge controversy was a trigger rather than a sufficient explanation. Participation varied: soldiers, rulers and civilians did not share one programme, and some Indian groups supported the Company. The 1858 transfer to Crown rule shows a major constitutional change; it does not show that resistance ended or that rule became consensual.",
        "In 1947 British withdrawal and partition produced independent India and Pakistan. Anti-colonial mobilisation, political negotiation and Britain’s changing capacity all belong in the explanation. Punjab and Bengal were divided, with mass displacement and violence. The new borders were announced after the independence ceremonies. A map can show a political change while concealing upheaval in people’s lives.",
        "Do not present partition as an automatic consequence of religious difference or reduce responsibility to a single actor. A strong enquiry asks how decisions, institutions, timing and local violence interacted. British official records illuminate decision-making but should be read alongside testimony and South Asian perspectives; administrative language is not the whole experience.",
      ],
      evidence: [sources.rebellion, sources.partition, sources.independence],
    },
    {
      title: "Migration made imperial connections part of life in Britain",
      paragraphs: [
        "The Empire Windrush’s 1948 arrival is a landmark, not the beginning of Black presence in Britain or a description of every Caribbean migrant. British subjecthood already linked people in the Caribbean to Britain. The British Nationality Act received assent after the ship’s arrival and took effect on 1 January 1949; it created citizenship of the UK and Colonies. Do not say the Act caused that June voyage.",
        "Citizenship and membership of an imperial political community did not guarantee equal treatment in housing, work or public life. Migrants also organised, worked, raised families and shaped culture and institutions. Their histories help explain why British identity can include Caribbean and other inheritances rather than treating them as external additions.",
        "The Windrush scandal gives a documented later connection between past status and state practice. The Williams review examined serious failures affecting people lawfully living in the UK, including failures to understand their history. This is evidence about institutions and policies, not a licence to attribute identical beliefs to every British person. Current legal status cannot be inferred from a historic label alone.",
      ],
      evidence: [
        sources.migration,
        sources.nationality,
        sources.windrush,
        sources.windrushRoots,
      ],
    },
    {
      title: "Formal endings did not close every historical question",
      paragraphs: [
        "Kenya became independent in 1963. In June 2013 the UK government acknowledged torture and ill-treatment under colonial administration and expressed regret while announcing a settlement with 5,228 claimants. The £19.9 million sum included costs. The statement maintained the government’s denial of legal liability; it was not a settlement of every colonial claim or a general legal finding about the empire.",
        "That statement can support an argument that imperial history still shapes official obligations and public memory. Its wording also reveals the limits of what the government was prepared to acknowledge. Survivors’ pursuit of redress is part of the explanation, not a detail to place after the government’s action.",
        "Hong Kong’s 1997 transfer concerned sovereignty, not the creation of an independent state. The 1984 Joint Declaration is evidence of what the two governments agreed, not a survey of residents’ wishes. Use 1997 as a significant endpoint in this atlas, not as proof that every British overseas relationship ended that year.",
        "The Commonwealth’s charter describes independent and equal sovereign members. Its ideals are useful evidence of an institutional self-description. They are neither evidence that all members share one identity nor proof that proclaimed equality has always been realised. Historical connections can endure while their political form changes.",
      ],
      evidence: [sources.kenya, sources.hongKong, sources.commonwealth],
    },
  ],
  stations: rallye.stations.map((station) => makeStationKey(station)),
  finalAssessment: makeFinalKey(rallye.finalAssessment),
  misconceptions: [
    "“England”, “Great Britain” and “the United Kingdom” are interchangeable. Correct by identifying geography, institutions and the time period before making an argument.",
    "A coloured territory means uniform, uncontested control. Ask which kind of authority the layer represents, whose institutions continued, and what the map cannot show.",
    "Abolition happened in one year and was simply given by Britain. Separate trade abolition, emancipation, apprenticeship, resistance and continuing inequality.",
    "Independence means that previous relationships or inequalities disappeared. Separate sovereignty from migration, language, trade, memory and institutions.",
    "An official apology, regret or settlement proves everyone agrees. Identify the speaker, precise wording, date, audience and limits of the claim.",
    "Empire explains every modern British attitude. Require a mechanism and evidence; leave room for other histories and disagreement within and between communities.",
    "A forceful condemnation or celebration supplies its own evidence. Ask which source supports the claim, and leave space for a student to qualify or revise it.",
  ],
  differentiatedPrompts: {
    support: [
      "Offer this structure: “The map shows … . Source [title] adds … . Together they suggest … . However, neither tells us … .”",
      "Give a small glossary: revenue = income collected by a government; sovereignty = supreme political authority; emancipation = release from slavery; citizenship = legal membership; identity = a person’s or group’s sense of belonging.",
      "Let pairs discuss one source before each student writes an individual response. Give students time to express and revise their own ideas.",
      "For language support, allow a bilingual glossary and a plan in the student’s strongest language, then produce the response in English. Recognise historical understanding while teaching the English needed to express it. Offer a specific phrase or explanation that helps the student communicate their intended meaning.",
    ],
    extension: [
      "Compare an official statement with a survivor’s account, a local museum interpretation or a historian’s analysis. Explain what changes when the viewpoint changes.",
      "Trace one named institution, place or object in Britain back to an imperial connection. Establish the connection through evidence rather than assuming its name is sufficient.",
      "Challenge the final claim: which aspects of identity might be better explained by class, religion, domestic constitutional history or later international relationships?",
      "Investigate a case missing from the route, such as Ireland, Australia or an African territory. Explain whether it strengthens or changes your initial argument.",
    ],
  },
  discussion: [
    "Which station changed your explanation rather than just adding a fact? Identify the evidence responsible.",
    "Choose one event whose colour on the map barely changes but whose significance for people is enormous. What does that reveal about historical maps?",
    "Can abolition be a source of pride without erasing enslavement and resistance? What would an honest commemorative text include?",
    "When are the actions of a state useful evidence about national identity, and when would that inference be too broad?",
    "What additional evidence would help distinguish imperial inheritance from later choices? Make one researchable question rather than a general opinion.",
  ],
  furtherReading: [
    {
      ...sources.partition,
      level: "essential",
      note: "Read the introduction and source questions; useful for separating a border change from human experience.",
    },
    {
      ...sources.emancipation,
      level: "essential",
      note: "Secure the 1807/1834/1838 distinction before discussing national memory.",
    },
    {
      ...sources.windrush,
      level: "essential",
      note: "Read the review’s summary and recommendations, not the full report for this lesson.",
    },
    {
      ...sources.kenya,
      level: "essential",
      note: "Read the statement’s acknowledgement and legal qualification together.",
    },
    {
      ...sources.legacies,
      level: "extension",
      note: "Follow the research database to test a specific connection between slavery and institutions in Britain.",
    },
    {
      ...sources.independence,
      level: "extension",
      note: "A larger primary-source collection for an extended enquiry into decolonisation.",
    },
    {
      ...sources.identities,
      level: "extension",
      note: "Read the measurement caveats as well as the results. Do not use it as an empire-attitudes survey.",
    },
    {
      ...sources.windrushRoots,
      level: "extension",
      note: "Longer context on nationality, migration policy and the historical roots of the scandal.",
    },
  ],
  sources: Object.values(sources),
};
