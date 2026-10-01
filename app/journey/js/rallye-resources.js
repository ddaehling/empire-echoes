/**
 * Locally available evidence for the classroom enquiry.
 * `summary` is our paraphrase; `excerpt` contains clearly attributed original words.
 * `scope` explains what the evidence can and cannot establish.
 * `context`, `locator` and links are supporting details, not extra tasks.
 * `optional` readings extend the route. All original-source visits are optional.
 * Original evidence was checked on 1 October 2026; see
 * docs/unit-alignment/SOURCES.md and docs/learning-revision/SOURCES.md.
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
      summary:
        "Enslaved people in Jamaica rose against slavery in the rebellion associated with Samuel Sharpe. Cotton ordered them to surrender. His poster denied that the king had freed them and threatened those who continued the rebellion with death.",
      excerpt: "All who hold out, will meet with certain death.",
      excerptLabel: "Cotton’s original words",
      scope:
        "This is the commander’s response to the rebellion. It does not let the enslaved people explain their own aims or experiences.",
      context:
        "The National Archives reproduces the poster and a transcript, reference CO 137/181. Cotton wanted the rebels to surrender. The full original includes racist language.",
      locator: "Original pack: PDF pages 6–7, poster and transcript.",
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
  ],
  "rule-and-resistance": [
    source({
      id: "rule-proclamation",
      title: "Victoria announces Crown rule",
      organisation: "Queen Victoria",
      date: "1 November 1858",
      kind: "Royal public announcement",
      url: "https://tamildigitallibrary.in/assets/docs/uploads/primary_files/book/TVA_BOK_0025134/TVA_BOK_0025134_speeches_in_India.pdf#page=178",
      summary:
        "After the 1857 uprising, Victoria announced that the British Crown would take over the Company’s rule in India. The announcement promised equal legal protection regardless of religious belief and told officials not to interfere with worship. It also required loyalty to the Crown.",
      excerpt:
        "all shall alike enjoy the equal and impartial protection of the Law",
      excerptLabel: "Original words from Victoria’s announcement",
      scope:
        "These are the ruler’s promises. The announcement alone cannot show whether people were treated as promised.",
      context:
        "A proclamation is an official public announcement. This text was addressed to India’s princes and people after the uprising. Tamil Digital Library preserves a later reproduction in His Majesty King George’s Speeches in India, Appendix E. The British Library catalogue is an additional provenance reference.",
      locator:
        "Original scan: PDF page 178, printed page xviii. The large scan is optional; the extract above supplies the wording needed here.",
      provenanceUrl: "https://searcharchives.bl.uk/catalog/041-000566434",
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
  ],
  "migration-and-belonging": [
    source({
      id: "migration-windrush",
      title: "Ena Sullivan’s life after arriving in Britain",
      organisation: "Ena Clare Sullivan’s nationality registration record",
      date: "3 December 1968; records her life from 1948",
      kind: "Official form preserved by The National Archives",
      url: "https://cdn.nationalarchives.gov.uk/documents/education/empire-windrush-caribbean-migration.pdf#page=19",
      summary:
        "Ena Clare Sullivan travelled from Jamaica to Britain on Empire Windrush in 1948. Her nationality registration form, completed in 1968, records nursing and health work in London, Stoke-on-Trent and Manchester.",
      scope:
        "The form records parts of Sullivan’s life. It does not tell us all her feelings about Britain or represent every migrant’s experience.",
      context:
        "The National Archives reference is HO 334/1406/110478. A nationality application records information required by officials. The pack’s transcript headings contain a naming error; the form identifies her as Ena Clare Sullivan. Someone’s work contributions do not determine their right to belong.",
      locator: "Original pack: PDF pages 19–21, form and transcript.",
    }),
    source({
      id: "migration-review",
      title: "The Windrush review: lawful residents harmed",
      organisation: "Wendy Williams, independent reviewer",
      date: "19 March 2020",
      kind: "Review of government actions",
      url: "https://www.gov.uk/government/publications/windrush-lessons-learned-review",
      summary:
        "Williams investigated the Windrush scandal. She found that people legally living in Britain had been wrongly targeted by immigration controls. Some lost their jobs and suffered other serious harm. She linked this to failures in government policy and institutions, including poor understanding of history. Her report also quotes an affected person.",
      excerpt:
        "I can’t believe I have been treated like this by my beloved England",
      excerptLabel:
        "An affected person’s original words, quoted in Williams’s review",
      scope:
        "This records documented harm and one person’s response. The speaker is not identified here and is not Ena Sullivan from the other card.",
      context:
        "The government commissioned Williams’s independent review, which used interviews and departmental records. The Home Office published it. One person’s words cannot establish what every migrant or British person believes.",
      locator:
        "Accessible PDF: pages 7–8 for the summary and introduction; quotation on page 8. Recommendation 6, on page 15, concerns historical understanding.",
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
        "People could choose several national identities in the 2021 census. Answers included British, English, Welsh and other identities, sometimes combined. National identity describes how people see themselves; it differs from citizenship and ethnicity. This report covers England and Wales, not the whole UK.",
      scope:
        "The census records identity labels. It did not ask whether empire caused people to choose them or what they thought of empire.",
      context:
        "The Office for National Statistics publishes census findings. The order of answer options changed between 2011 and 2021, which also affects comparisons between the two censuses.",
      locator:
        "Original page: section 8, “National identity”, and section 10, “Strengths and limitations”.",
      optional: true,
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
