/**
 * Locally available evidence for the classroom enquiry.
 * `summary` is our paraphrase; `excerpt` contains clearly attributed original words.
 * `scope` explains what the evidence can and cannot establish.
 * `context`, `locator` and links are supporting details, not extra tasks.
 * `optional` readings extend the route. All original-source visits are optional.
 * Original evidence was checked on 1 October 2026; see
 * docs/unit-alignment/SOURCES.md, docs/learning-revision/SOURCES.md and
 * docs/learning-revision/task7-review/.
 */
const source = (record) => ({
  summaryLabel: "In our words · paraphrase",
  checked: "2026-10-01",
  optional: false,
  ...record,
});

export const RALLYE_RESOURCES = {
  "profit-and-power": [
    source({
      id: "profit-company",
      title: "From trade to tax collection",
      organisation: "National Army Museum",
      date: "Events: 1757–1765",
      kind: "Modern museum explanation",
      url: "https://www.nam.ac.uk/explore/battle-plassey",
      provenanceUrl:
        "https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1",
      summary:
        "The East India Company sought power and income in Bengal. In 1757, it helped Mir Jafar replace the ruler of Bengal. In 1765, Robert Clive secured its right to collect taxes there, called the diwani. The Company created an administration of officials and soldiers to collect taxes and police its territories. In the following years, the British used this tax income alongside military force against their European rivals in India.",
      scope:
        "The account describes the Company’s growing power. It does not give the views of the people paying those taxes.",
      context:
        "The museum’s article explains the battle of Plassey and the growth of Company rule. Its collection also includes William Heath’s picture made around 1821, decades after the battle; the additional link leads to that object. These are modern museum explanations, not accounts by people paying Bengal’s taxes.",
      locator: "Original article: “Regime change” and “Imperial power”.",
    }),
    source({
      id: "profit-clive-memory",
      title: "What should Shrewsbury do with Clive’s statue?",
      organisation: "Shropshire Council and Shrewsbury Museum",
      date: "Council decisions and updates: 2020–2021",
      kind: "Council accounts of a public monument dispute",
      url: "https://newsroom.shropshire.gov.uk/2021/11/robert-clive-statue-in-the-square-shrewsbury-an-update/",
      provenanceUrl: "https://newsroom.shropshire.gov.uk/2020/09/robert-clive-statue-shrewsbury/",
      provenanceLabel: "Read the council’s earlier explanation (2020)",
      summary:
        "After petitions about Robert Clive’s statue in Shrewsbury, Shropshire Council chose in 2020 to keep it with added historical explanation. The council argued that learning about controversial history should differ from celebrating it. In November 2021, its museum reported that a temporary interpretation panel had been installed and that information about colonial objects had been added to its catalogue. A permanent panel was still planned. These decisions kept the monument in public space while changing the information presented about it.",
      scope:
        "These are the council’s accounts of its decisions in 2020–2021. They do not measure all residents’ opinions, visitors’ reactions or the monument’s condition today.",
      context:
        "This is the same Robert Clive who secured the Company’s tax-collecting rights in Bengal in 1765. The petitions disagreed about the statue’s future. The council’s response is one institutional choice about how a British town remembers an imperial figure.",
      locator: "2021 update: the decision to retain the statue and the museum’s interpretation work. The 2020 statement explains the council’s reasoning.",
    }),
    source({
      id: "profit-charter",
      title: "The Company begins, 1600",
      organisation: "British Library, India Office Records",
      date: "31 December 1600",
      kind: "Archive description of a royal charter",
      url: "https://searcharchives.bl.uk/catalog/040-000178602",
      summary:
        "Elizabeth I authorised a group of merchants to form the East India Company. A charter is an official document granting rights. This one established a trading company; Britain did not already govern India in 1600.",
      scope:
        "The charter records the Company’s official beginning. It is not evidence that the Company controlled all of India.",
      context:
        "Catalogue reference IOR/A/1/2 describes a copy made at the time. The catalogue is free; the linked manuscript viewer may require institutional access.",
      optional: true,
    }),
  ],
  "freedom-and-memory": [
    source({
      id: "freedom-rebellion",
      title: "An army commander responds to resistance",
      organisation: "Willoughby Cotton, British army commander",
      date: "2 January 1832",
      kind: "Public military order",
      url: "https://cdn.nationalarchives.gov.uk/documents/education/spotlight-on-baptist-war.pdf#page=6",
      urlLabel: "Original poster and transcript (PDF)",
      summary:
        "Enslaved people in Jamaica rose against slavery in the rebellion associated with Samuel Sharpe. Cotton ordered them to surrender. His poster denied that the king had freed them and threatened those who continued the rebellion with death.",
      excerpt:
        "Some wicked persons have told you that the King has made you free, and that your Masters withhold your freedom from you. In the name of the King, I come amongst you, to tell you that you are misled. […] Surrender yourselves, and beg that your crime may be pardoned. All who yield themselves up at any Military Post immediately, provided they are not principals and chiefs in the burnings that have been committed, will receive His Majesty’s gracious pardon. All who hold out, will meet with certain death.",
      excerptLabel: "Read here · selected words from Cotton’s poster",
      excerptNote:
        "The selection follows the original poster. […] marks an omitted passage. The heading, opening accusation and closing signature are not reproduced.",
      scope:
        "This is the commander’s response to the rebellion. It does not let the enslaved people explain their own aims or experiences.",
      context:
        "The National Archives reproduces the poster and a transcript, reference CO 137/181. Cotton wanted the rebels to surrender. The full original includes racist language.",
      locator:
        "The relevant wording is printed above. For the original layout only: PDF page 6 shows the poster; page 7 supplies the archive’s transcript.",
    }),
    source({
      id: "freedom-compensation",
      title: "What changed after the abolition law?",
      organisation: "UK Parliament, Living Heritage",
      date: "Events: 1833–1838",
      kind: "Modern historical account",
      url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/the-west-indian-colonies-and-emancipation/",
      summary:
        "The 1833 Slavery Abolition Act set aside £20 million for slave owners as compensation. From 1834, many formerly enslaved people in the British Caribbean still had to work for their former owners under a system called “apprenticeship”. That system ended in 1838. Britain’s earlier ban on the slave trade in 1807 had not ended slavery itself.",
      scope:
        "This account explains laws and their timing. It does not provide a formerly enslaved person’s own account of freedom.",
      context:
        "Parliament’s public history website describes legislation and campaigning. It is a modern explanation, not a document written in the 1830s.",
      locator: "Original page: “Anti-Slavery Society” and “Freedom”.",
    }),
    source({
      id: "freedom-bristol-memory",
      title: "A contested statue becomes a museum display",
      organisation: "M Shed, Bristol Museums · Helen McConnell-Simpson, curator",
      date: "Display opened March 2024 · statue toppled in 2020",
      kind: "Museum account of its own exhibition",
      url: "https://www.bristolmuseums.org.uk/blog/new-display-at-m-shed-the-toppling-of-the-colston-statue/",
      summary:
        "In March 2024, Bristol’s M Shed opened a permanent display of the statue of slave trader Edward Colston, toppled during a 2020 Black Lives Matter protest. The display preserves protest graffiti on the statue and includes placards. It presents accounts by people who took part in toppling it and people who opposed the action. Community contributors helped shape the display. Some African Caribbean participants stressed that racial injustice extended beyond the dispute over one statue.",
      scope:
        "This describes a museum’s curatorial choices and selected contributions. It does not show that all visitors, Bristol residents or British people interpret the statue alike.",
      context:
        "Colston’s slave trading belongs to an earlier episode than the Jamaican rebellion and abolition sources. Those sources can help question how British involvement in slavery is remembered; they are not evidence that Colston caused the later events in Jamaica. The proposed label in this assignment is not a quotation from M Shed’s display.",
      locator: "Original article: the new permanent display, accounts on different sides of the dispute, and community involvement.",
    }),
  ],
  "rule-and-resistance": [
    source({
      id: "rule-proclamation",
      title: "Victoria announces Crown rule",
      organisation: "Queen Victoria",
      date: "1 November 1858",
      kind: "Royal public announcement",
      url: "https://tamildigitallibrary.in/assets/docs/uploads/primary_files/book/TVA_BOK_0025134/TVA_BOK_0025134_speeches_in_India.pdf#page=178",
      urlLabel: "View the original book scan (PDF, p. 178)",
      summary:
        "After the 1857 uprising, Victoria announced that the British Crown would take over the Company’s rule in India. The announcement promised equal legal protection regardless of religious belief and told officials not to interfere with worship. It also required loyalty to the Crown.",
      excerpt:
        "We hold Ourselves bound to the Natives of Our Indian territories by the same Obligations of Duty which bind Us to all Our other Subjects; and these Obligations, by the Blessing of Almighty God, We shall faithfully and conscientiously fulfil.\n\nFirmly relying Ourselves on the truth of Christianity, and acknowledging with gratitude the solace of Religion, We disclaim alike the Right and the Desire to impose Our Conviction on any of Our Subjects. We declare it to be Our Royal Will and Pleasure that none be in anywise favoured, none molested or disquieted, by reason of their Religious Faith or Observances, but that all shall alike enjoy the equal and impartial protection of the Law; and We do strictly charge and enjoin all those who may be in authority under Us that they abstain from all interference with the Religious Belief or Worship of Our Subjects, on pain of Our highest Displeasure.",
      excerptLabel: "Read the proclamation · original wording, 1858",
      excerptNote:
        "Two consecutive paragraphs transcribed from printed page xviii. Original wording and capitalisation retained; line-break hyphens removed. The full book is optional.",
      scope:
        "These are the ruler’s promises. The announcement alone cannot show whether people were treated as promised.",
      context:
        "A proclamation is an official public announcement. This text was addressed to India’s princes and people after the uprising. Tamil Digital Library preserves a later reproduction in His Majesty King George’s Speeches in India, Appendix E. The British Library catalogue is an additional provenance reference.",
      locator:
        "His Majesty King George’s Speeches in India, Appendix E: PDF page 178, printed page xviii. Read the two paragraphs above for this assignment.",
      provenanceUrl: "https://searcharchives.bl.uk/catalog/041-000566434",
      provenanceLabel: "View the British Library catalogue record (HTML)",
    }),
    source({
      id: "rule-commonwealth",
      title: "A monarch speaks of independent, equal nations",
      organisation: "Charles III · The Commonwealth",
      date: "Speech: 25 October 2024 · relationship changed in 1949",
      kind: "Royal speech, with context from the London Declaration",
      url: "https://www.royal.uk/news-and-activity/2024-10-25/his-majestys-speech-to-open-the-commonwealth-heads-of-government",
      provenanceUrl: "https://thecommonwealth.org/london-declaration-1949",
      provenanceLabel: "Read the London Declaration (1949)",
      summary:
        "India became independent in 1947. In 1949, Commonwealth governments agreed that India could remain in the association when it became a republic. The monarch would symbolise an association of independent countries, rather than rule India. In Samoa in 2024, Charles III spoke as Head of the Commonwealth. He linked his role to his mother’s and grandfather’s, acknowledged painful aspects of the shared past, and promoted cooperation on education, opportunity and climate change.",
      excerpt: "All nations are equal in this unique and voluntary association.",
      excerptLabel: "Charles III’s words to Commonwealth leaders, 2024",
      scope:
        "The speech presents the monarch’s account of the relationship. It does not prove that all members have equal influence or that people in Britain share his view.",
      context:
        "The Head of the Commonwealth is a symbolic role, chosen by its members; it does not give the holder authority to govern them. India is a republic. Some Commonwealth countries were never British colonies. Compare what the two royal speakers claim, while keeping their different political relationships clear.",
      locator: "Speech: opening paragraphs on the voluntary association and later passages on shared history. Declaration: India’s continued membership as a republic.",
    }),
    source({
      id: "rule-canada",
      title: "Canada’s different arrangement, 1867",
      organisation: "UK Parliament, Parliamentary Archives",
      date: "Act effective 1 July 1867",
      kind: "Archive explanation of a law",
      url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/collections1/parliament-and-canada/british-north-america-act-1867/",
      summary:
        "The British North America Act brought Canada, Nova Scotia and New Brunswick together as a dominion. It created a central government and Parliament as well as provincial governments. The British monarch remained head of state. This arrangement differed from Crown rule in India.",
      scope:
        "The law explains government institutions. It cannot show everyone’s political rights or experiences, including those of Indigenous peoples.",
      context:
        "A dominion had its own government within the British Empire. This archive page explains the constitutional arrangement established in 1867.",
      optional: true,
    }),
    source({
      id: "rule-government",
      title: "The law transferring Company rule to the Crown",
      organisation: "UK Parliament",
      date: "2 August 1858",
      kind: "Government of India Act",
      url: "https://www.legislation.gov.uk/ukpga/Vict/21-22/106/pdfs/ukpga_18580106_en.pdf#page=2",
      urlLabel: "View the original Act (PDF, p. 2)",
      summary:
        "This law transferred the East India Company’s governing powers to the Crown. It gave major responsibilities to a British secretary of state, a government minister. The transfer did not give India independence.",
      excerpt: "India shall be governed by and in the Name of Her Majesty",
      excerptLabel: "Original words from section II of the Act",
      scope:
        "The law records who held formal authority. It does not describe how every person in India experienced that authority.",
      context:
        "This law was made by the British Parliament. The original is hosted on legislation.gov.uk; sections I–III set out the transfer of power.",
      locator: "Original scan: PDF page 2. The extract is from section II.",
      optional: true,
    }),
    source({
      id: "rule-rebellion",
      title: "Why people resisted in 1857",
      organisation: "National Army Museum",
      date: "Events: 1857",
      kind: "Modern museum explanation",
      url: "https://www.nam.ac.uk/explore/why-did-indian-mutiny-happen",
      summary:
        "Indian soldiers had complaints about pay, promotion and religious matters. Rulers whose territories the Company had taken also joined the resistance, as did other people. Some Indian rulers and soldiers supported the British or stayed neutral. Participants had different aims.",
      scope:
        "This account identifies several reasons for resistance. It does not show that everyone in India held the same view.",
      context:
        "The museum discusses soldiers and civilians. It is a modern interpretation with a military focus, rather than an eyewitness account of the uprising.",
      locator: "Original page: “Discontent” and “Rulers join the rising”.",
      optional: true,
    }),
  ],
  "departure-and-division": [
    source({
      id: "departure-partition",
      title: "Partition: a border and people’s lives",
      organisation: "The National Archives",
      date: "Letter: 1946 · map: 1947 · later memories",
      kind: "Archive collection: map, letter and spoken memories",
      url: "https://www.nationalarchives.gov.uk/education/teaching-resources/partition-of-british-india/",
      summary:
        "British rule ended and India and Pakistan became independent in August 1947. The final border decision was announced after independence. The archive includes a 1947 boundary map for Punjab. It also includes a letter dated 1 June 1946: Santokh Singh was worried that the interests of the Sikhs, a religious community, were being ignored. In a later recorded account, a woman identified as Iqbal’s aunt recalls her family having to leave their home before partition.",
      scope:
        "The letter and memory add individual experiences to the border map. Neither represents everyone, and both concern events before the 1947 border was drawn.",
      context:
        "The Sikhs are a religious community with deep roots in Punjab. Website source 3a is the 1947 map (CO 1054/76); 3b is Singh’s 1946 letter (CAB 127/106). Source 6 contains spoken memories, including Iqbal’s aunt’s account. The archive page discusses violence. Its downloadable PDF numbers the sources differently.",
      locator:
        "Original webpage: source 3b for the letter, or source 6 for a recorded memory. The summary above includes the evidence needed for this task.",
    }),
    source({
      id: "departure-family-memory",
      title: "A family’s lost village in a London museum",
      organisation: "Imran Javed, collection manager · British Museum",
      date: "24 October 2022 · bracelet commissioned in 2019",
      kind: "Personal account of a museum display",
      url: "https://www.britishmuseum.org/blog/confluence-stories",
      summary:
        "In 2022, British Museum collection manager Imran Javed described a display combining museum objects with his own possessions. One was a bracelet bearing the name of his family’s village in Punjab. His Punjabi Muslim ancestors had left that village during Partition and settled in what is now Pakistan. Javed commissioned the bracelet to remember their journey and a home they had lost. By including it in a London museum display, he brought his family history into a public account of South Asian heritage in Britain.",
      scope:
        "This is one person’s family memory and curatorial choice. It does not represent all British South Asian families, explain every migration to Britain, or tell us visitors’ responses.",
      context:
        "Javed’s family is different from the families in the earlier archive card. His 2022 account shows a later choice to preserve and share a connection to a place lost through Partition. The complete evidence needed here is in this card; the museum website is an optional visit.",
      locator: "Original article: the village-name bracelet and the account of Javed’s family’s journey from Punjab.",
    }),
  ],
  "migration-and-belonging": [
    source({
      id: "migration-windrush",
      title: "Ena Sullivan’s life after arriving in Britain",
      organisation: "Ena Clare Sullivan’s nationality registration record",
      date: "3 December 1968; records her life from 1948",
      kind: "Official form preserved by The National Archives",
      url: "https://cdn.nationalarchives.gov.uk/documents/education/empire-windrush-caribbean-migration.pdf#page=19",
      urlLabel: "Original registration form and transcript (PDF)",
      summary:
        "Ena Clare Sullivan travelled from Jamaica to Britain on Empire Windrush in 1948. Her nationality registration form, completed in 1968, records nursing and health work in London, Stoke-on-Trent and Manchester.",
      excerpt:
        "I, ENA CLARE SULLIVAN […]\n\nI have been in Crown service under Her Majesty’s government in the United Kingdom during the past five years as follows:\n\nHospital · S/N. · 1948–1957\nPublic Health · Health Visitor · 1957–1961\nHospital · Staff /N · 1961–1968",
      excerptLabel: "Read here · entries from Sullivan’s form",
      excerptNote:
        "Selected entries; […] marks omissions. S/N and Staff /N mean staff nurse. Dots separate the form’s columns.",
      scope:
        "The form records parts of Sullivan’s life. It does not tell us all her feelings about Britain or represent every migrant’s experience.",
      context:
        "The National Archives reference is HO 334/1406/110478. A nationality application records information required by officials. The pack’s transcript headings contain a naming error; the form identifies her as Ena Clare Sullivan. Selected entries come from sections 1 and 7(b). Employment rows show department, role and dates; the government column is omitted and date ranges are joined for reading. Although the printed question says “past five years”, Sullivan entered dates beginning in 1948. Someone’s work contributions do not determine their right to belong.",
      locator:
        "The relevant entries are printed above. For the handwriting only: PDF page 19 shows the form and employment table; pages 20–21 supply the archive’s transcript.",
    }),
    source({
      id: "migration-review",
      title: "The Windrush review: lawful residents harmed",
      organisation: "Wendy Williams, independent reviewer",
      date: "Review: 19 March 2020 · follow-up: 31 March 2022",
      kind: "Independent review and later explanation of government actions",
      url: "https://www.gov.uk/government/publications/windrush-lessons-learned-review-progress-update/windrush-lessons-learned-review-progress-update-accessible",
      urlLabel: "Read the 2022 follow-up (HTML)",
      provenanceUrl: "https://www.gov.uk/government/publications/windrush-lessons-learned-review",
      provenanceLabel: "Original 2020 review publication and PDF",
      summary:
        "Williams’s 2020 review found that lawful residents had been wrongly targeted by immigration controls and seriously harmed. Her 2022 follow-up explains how later governments increasingly required documentary proof of status for work, housing and services. Some long-settled residents had not been given documents, and the Home Office had not kept records confirming their status. They could not prove their rights when challenged. Williams identified failures in policy and institutions, including poor historical understanding. Her original review quotes an affected person:",
      excerpt:
        "I can’t believe I have been treated like this by my beloved England",
      excerptLabel:
        "An affected person’s words, quoted in Williams’s 2020 review",
      scope:
        "The reports explain documented harm and government decisions; the quotation records one person’s response. The speaker is not identified here and is not Ena Sullivan from the other card. These reports do not establish everyone’s feelings or the situation in 2026.",
      context:
        "The government commissioned Williams’s independent review, which used interviews and departmental records. The Home Office published it. One person’s words cannot establish what every migrant or British person believes.",
      locator:
        "The 2022 HTML report’s Introduction → Background explains the documentation problem. In the original 2020 PDF, pages 7–8 contain the summary and introduction, with the quotation on page 8; recommendation 6 on page 15 concerns historical understanding.",
    }),
    source({
      id: "migration-monument",
      title: "Choosing to remember Windrush at Waterloo",
      organisation: "Windrush Commemoration Committee · UK government",
      date: "22 June 2022",
      kind: "Account of a national monument’s unveiling",
      url: "https://www.gov.uk/government/news/national-windrush-monument-unveiled-at-london-waterloo-station",
      summary:
        "A national monument unveiled at London Waterloo in June 2022 presents a Caribbean family standing together on suitcases. Jamaican sculptor Basil Watson connected the work to his parents’ migration and to Caribbean people’s cultural influence in Britain. The Windrush Commemoration Committee commissioned the sculpture after public consultation, with government funding. It was intended as a permanent place for reflection and recognition. The sculpture makes a Caribbean family part of the story told in a major London public space.",
      scope:
        "This records a particular act of public remembrance. A monument cannot by itself show how welcome everyone feels or whether injustices have been resolved; consultation does not mean unanimous agreement.",
      context:
        "The committee was chaired by Baroness Floella Benjamin. The artist and community contributors took part in shaping how migration would be remembered. Their agency matters alongside official decisions. Recognition of people’s work or culture is not a condition of their right to belong.",
      locator: "Original announcement: the sculpture, the committee and consultation, and Basil Watson’s account of his family’s connection.",
    }),
  ],
  "remembering-empire": [
    source({
      id: "memory-mau-mau",
      title: "Britain’s government speaks about colonial Kenya",
      organisation: "William Hague, UK Foreign Secretary",
      date: "6 June 2013",
      kind: "Government statement to Parliament",
      url: "https://www.gov.uk/government/news/statement-to-parliament-on-settlement-of-mau-mau-claims",
      summary:
        "Hague acknowledged torture and ill-treatment during British colonial rule in Kenya. He announced a £19.9 million settlement, including legal costs, for 5,228 people bringing claims against the government. He also announced support for a memorial in Nairobi. The two quoted extracts come from separate parts of his statement. Liability means legal responsibility.",
      excerpt:
        "“sincerely regrets that these abuses took place” / “We continue to deny liability”",
      excerptLabel: "Hague’s original words · two separate extracts",
      scope:
        "This records the British government’s position in 2013. It does not tell us what every survivor or every person in Britain thought.",
      context:
        "Hague was the minister responsible for the UK’s relations with other countries. His statement explained and defended the settlement. The slash between the extracts separates two passages; they are not one continuous sentence. Survivors may assess the statement differently.",
      locator: "Original page: the paragraphs on regret and liability.",
    }),
    source({
      id: "memory-royal-visit",
      title: "Remembering colonial violence during a royal visit",
      organisation: "Charles III",
      date: "31 October 2023",
      kind: "Speech at a state banquet in Kenya",
      url: "https://www.royal.uk/news-and-activity/2023-10-31/a-speech-by-his-majesty-the-king-at-the-state-banquet-kenya",
      summary:
        "During his 2023 visit to Kenya, Charles III condemned violence committed against Kenyans during their struggle for independence and expressed sorrow and regret. He wanted to learn from people affected by those events. In the same speech, he celebrated the contributions of Kenyans and British Kenyans to life in Britain, including medicine, the arts and education. He presented the two countries as equal partners and linked an honest discussion of their history with the possibility of a closer future relationship.",
      scope:
        "This shows the king’s public position in 2023. It does not establish survivors’ acceptance, repair the harms by itself or represent everyone’s idea of Britain.",
      context:
        "The speech came during the sixtieth year of Kenyan independence and ten years after Hague’s settlement statement. It was a diplomatic speech, not a new court ruling or an acceptance of legal liability. Recognition, compensation and survivors’ responses are different kinds of evidence.",
      locator: "Original speech: the contributions of Kenyans and British Kenyans, the struggle for independence, and the future relationship.",
    }),
    source({
      id: "memory-hong-kong",
      title: "Hong Kong’s transfer, 1997",
      organisation: "UK and Chinese governments",
      date: "Agreement signed 19 December 1984",
      kind: "Joint Declaration: agreement between two governments",
      url: "https://www.cmab.gov.hk/en/issues/jd2.htm",
      summary:
        "The agreement set 1 July 1997 as the date for Hong Kong to come under Chinese sovereignty, meaning authority to govern the territory. It stated that Hong Kong would become a special administrative region with a high degree of autonomy, or control over its own affairs, except in foreign affairs and defence.",
      scope:
        "The agreement records the governments’ commitments. It does not show residents’ views or prove how every commitment was later carried out.",
      context:
        "The Hong Kong government hosts the agreement’s text. The date of signing, 1984, differs from the date of transfer, 1997.",
      locator: "Original page: paragraphs 1–3, especially 3(2).",
      optional: true,
    }),
  ],
  "whose-britain": [
    source({
      id: "final-identities",
      title: "People can name more than one national identity",
      organisation: "Office for National Statistics",
      date: "Census: 2021 · report: 29 November 2022",
      kind: "Official census report for England and Wales",
      url: "https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/ethnicity/bulletins/nationalidentityenglandandwales/census2021",
      summary:
        "In the 2021 census, people in England and Wales could select more than one national identity. For example, 13.6% selected English and British together. ONS describes national identity as people’s own sense of where they belong or consider home, rather than something determined by citizenship or ethnic group. These answers show that identity labels can overlap. They do not explain why someone chose a label or what that person thinks about Britain’s imperial past.",
      scope:
        "This is evidence about identity labels in England and Wales in 2021, not the whole UK or a survey of views in 2026. It cannot measure how much empire, or any other influence, caused those choices.",
      context:
        "The Office for National Statistics publishes census findings. The order of answer options changed between 2011 and 2021, which also affects comparisons between the two censuses.",
      locator:
        "Original page: section 2 on combinations of UK identities; section 8, “National identity”; and section 10, “Strengths and limitations”.",
    }),
    source({
      id: "final-charter",
      title: "The Commonwealth describes its shared values",
      organisation: "The Commonwealth",
      date: "Charter signed in 2013",
      kind: "Official statement of shared values",
      url: "https://thecommonwealth.org/charter",
      summary:
        "The Charter describes the Commonwealth as a voluntary association of independent, equal states. It sets out commitments to democracy, rights and cooperation. A charter is an official statement of principles.",
      scope:
        "This states shared values and aims. It cannot prove that every member follows them or that past inequalities have disappeared.",
      context:
        "The Commonwealth is an international association whose members include many former British colonies. The Charter is a statement by the association, not a survey of its members’ populations.",
      locator:
        "Original page: the opening description and the paragraph beginning “Recalling”.",
      optional: true,
    }),
  ],
};

export const RALLYE_RESOURCE_LIST = Object.values(RALLYE_RESOURCES).flat();
export const RALLYE_RESOURCE_BY_ID = Object.fromEntries(
  RALLYE_RESOURCE_LIST.map((record) => [record.id, record]),
);

export function resourcesForStation(stationId) {
  return RALLYE_RESOURCES[stationId] || [];
}
