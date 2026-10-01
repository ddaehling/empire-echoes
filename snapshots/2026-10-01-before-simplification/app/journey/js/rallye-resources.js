/**
 * Short, locally available readings for the 45-minute enquiry.
 * `summary` is our paraphrase, never a quotation from the original.
 * Original quotations are explicitly separated in `excerpt` (under 25 words/source).
 * `date` describes the document/event, not an invented web publication date.
 * `optional` readings extend the route; they are not extra required tasks.
 * Source texts and live URLs checked 1 October 2026. See docs/JOURNEY_RALLYE_REVIEW.md
 * and docs/unit-alignment/SOURCES.md for the English-unit alignment.
 */
const source = (record) => ({
  summaryLabel: "Offline summary · paraphrase",
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
      date: "1757–1765; modern museum interpretation",
      kind: "Museum interpretation of a historical object",
      url: "https://collection.nam.ac.uk/detail.php?acc=1968-06-269-1",
      summary:
        "The East India Company pursued political and financial advantage in Bengal. Before Plassey in 1757, it offered to support Mir Jafar as ruler if the existing nawab was defeated. In 1765, Robert Clive secured the Company’s diwani: the right to collect Bengal’s tax revenues. A trading company had become a territorial and political power.",
      context:
        "The museum explains William Heath’s picture, made around 1821, decades after Plassey. Neither the picture nor its modern caption is a Bengal taxpayer’s account.",
      questionCue:
        "Separate the trading company’s interests from those of people whose taxes it collected. What can the map show, and what remains invisible?",
      locator: "Read the final paragraph of the museum description.",
    }),
    source({
      id: "profit-charter",
      title: "The Company begins, 1600",
      organisation: "British Library, India Office Records",
      date: "31 December 1600",
      kind: "Archive catalogue of a contemporary charter copy",
      url: "https://searcharchives.bl.uk/catalog/040-000178602",
      summary:
        "Elizabeth I authorised a group of merchants to form the East India Company. This charter concerns a commercial corporation; it does not mean that Britain already governed India in 1600.",
      context:
        "Catalogue reference IOR/A/1/2. The free catalogue describes a contemporary copy; the linked manuscript viewer may require institutional access.",
      questionCue:
        "Compare the sparse map in 1600 with Bengal in 1765. Do not treat the charter as the conquest of India.",
      optional: true,
    }),
  ],
  "freedom-and-memory": [
    source({
      id: "freedom-rebellion",
      title: "Resistance, and the colonial response",
      organisation: "The National Archives",
      date: "2 January 1832",
      kind: "Primary source: military proclamation",
      url: "https://cdn.nationalarchives.gov.uk/documents/education/spotlight-on-baptist-war.pdf#page=6",
      summary:
        "During the uprising against slavery associated with Samuel Sharpe, British commander Willoughby Cotton ordered enslaved people in Jamaica to surrender. His poster denied that the king had freed them and threatened those continuing the rebellion with death. It reveals that colonial military power defended slavery before Parliament abolished it.",
      context:
        "Cotton wrote to frighten rebels into surrender, not to explain their experiences. The National Archives reproduces the poster and transcript, reference CO 137/181. The original includes racist language.",
      excerpt: "All who hold out, will meet with certain death.",
      excerptLabel: "Original wording · Willoughby Cotton's proclamation",
      questionCue:
        "The threat reveals military coercion. Whose action disappears when freedom is described only as Parliament’s gift?",
      locator:
        "PDF pages 6–7: poster and transcript. Read only this source, not the whole pack.",
    }),
    source({
      id: "freedom-compensation",
      title: "Emancipation was a process",
      organisation: "UK Parliament, Living Heritage",
      date: "1833–1838; modern historical account",
      kind: "Institutional historical interpretation",
      url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/the-west-indian-colonies-and-emancipation/",
      summary:
        "The 1833 Slavery Abolition Act provided £20 million to compensate slave owners. From 1834, many formerly enslaved people in the British Caribbean were still compelled to work for former owners under “apprenticeship”. This system ended in 1838. Ending the British slave trade in 1807 and ending slavery were different changes.",
      context:
        "Parliament’s public history account highlights legislation and campaigning. Read it alongside evidence of resistance in Jamaica to avoid making Westminster the only actor.",
      questionCue:
        "How do compensation and continued forced labour complicate a national story focused only on abolition?",
      locator: "Read “Anti-Slavery Society” and “Freedom”.",
    }),
  ],
  "rule-and-resistance": [
    source({
      id: "rule-proclamation",
      title: "A promise of equal protection",
      organisation: "Queen Victoria; text preserved by Tamil Digital Library",
      date: "1 November 1858; reproduced in a later printed collection",
      kind: "Primary text: royal proclamation",
      url: "https://tamildigitallibrary.in/assets/docs/uploads/primary_files/book/TVA_BOK_0025134/TVA_BOK_0025134_speeches_in_India.pdf#page=178",
      summary:
        "After the uprising, Victoria announced Crown rule and promised that religious belief would not determine legal treatment. Officials were told not to interfere with worship. The proclamation also required allegiance to the Crown.",
      context:
        "The proclamation sought loyalty after rebellion. Its promises reveal how rule was justified, but cannot prove that people received equal treatment. The linked scan reproduces it in His Majesty King George’s Speeches in India, Appendix E.",
      excerpt:
        "all shall alike enjoy the equal and impartial protection of the Law",
      excerptLabel: "Original wording · Victoria's 1858 proclamation",
      questionCue:
        "Select one word or short phrase. What does it suggest about rule, and why might that matter after an uprising?",
      locator:
        "PDF page 178 (printed xviii). The 37.5 MB scan is optional; use the quotation here for wording analysis.",
      provenanceUrl: "https://searcharchives.bl.uk/catalog/041-000566434",
    }),
    source({
      id: "rule-canada",
      title: "A different arrangement: Canada, 1867",
      organisation: "UK Parliament, Parliamentary Archives",
      date: "Act effective 1 July 1867",
      kind: "Archive presentation of legislation",
      url: "https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/collections1/parliament-and-canada/british-north-america-act-1867/",
      summary:
        "The British North America Act united Canada, Nova Scotia and New Brunswick into a dominion. It established a federal government and Parliament, alongside provincial governments, while retaining the British monarch. One imperial map colour could therefore cover very different political arrangements.",
      context:
        "This constitutional summary explains institutions, not the experiences or political exclusion of every community, including Indigenous peoples.",
      questionCue:
        "Compare dominion government with Crown rule. Neither label, by itself, proves political equality for everyone.",
      optional: true,
    }),
    source({
      id: "rule-government",
      title: "Company rule becomes Crown rule",
      organisation: "UK Parliament; original Act on legislation.gov.uk",
      date: "2 August 1858",
      kind: "Primary source: Government of India Act",
      url: "https://www.legislation.gov.uk/ukpga/Vict/21-22/106/pdfs/ukpga_18580106_en.pdf#page=2",
      summary:
        "Sections I–III transferred the Company’s governing powers to the Crown and placed major responsibilities with a British secretary of state. The change altered who governed British India; it did not give Indians independence or create equal political participation.",
      context:
        "This is a law made by the imperial Parliament. It is strong evidence of formal authority, but cannot show how every Indian experienced that authority.",
      excerpt: "India shall be governed by and in the Name of Her Majesty",
      questionCue:
        "Can two similarly coloured maps conceal a major change in the way power operates?",
      locator:
        "PDF page 2, sections I–III. The quoted words are from section II.",
      optional: true,
    }),
    source({
      id: "rule-rebellion",
      title: "Why people resisted in 1857",
      organisation: "National Army Museum",
      date: "1857; modern historical account",
      kind: "Museum historical interpretation",
      url: "https://www.nam.ac.uk/explore/why-did-indian-mutiny-happen",
      summary:
        "Soldiers’ grievances included pay, promotion and religious concerns. Annexed rulers and other people also resisted Company power. Some Indian rulers and soldiers supported the British or remained neutral. The uprising had different participants and aims; it was not a single, unanimous Indian response.",
      context:
        "This modern military museum account discusses both soldiers and civilians. Its institutional focus is one reason to seek other perspectives.",
      questionCue:
        "Use a specific grievance to explain why the transfer in 1858 cannot be understood only as a decision made in London.",
      locator: "Read “Discontent” and “Rulers join the rising”.",
      optional: true,
    }),
  ],
  "departure-and-division": [
    source({
      id: "departure-partition",
      title: "Partition: borders and lived experience",
      organisation: "The National Archives",
      date: "Letter, 1 June 1946; map, 1947; later oral testimony",
      kind: "Primary sources with an archival introduction",
      url: "https://www.nationalarchives.gov.uk/education/teaching-resources/partition-of-british-india/",
      summary:
        "India and Pakistan became independent in August 1947; the border award followed independence. The archive pairs a Punjab boundary map with letters and oral testimony. Santokh Singh’s 1946 letter fears that Sikh interests are being ignored. Iqbal’s aunt recalls her family’s displacement before partition. A border map and a remembered life tell different parts of this history.",
      context:
        "Website source 3 includes the 1947 map (CO 1054/76) and Singh’s 1946 letter (CAB 127/106); source 6 is remembered experience. Neither one map nor one family represents everyone. The page discusses violence; its downloadable PDF uses different source numbers.",
      questionCue:
        "What would be lost if a British museum showed only the colour change on the map, without people’s voices?",
      locator:
        "Optional: website source 3b (letter) or one source 6 testimony clip. The local summary supplies the core evidence.",
    }),
  ],
  "migration-and-belonging": [
    source({
      id: "migration-windrush",
      title: "Ena Sullivan: a life connecting Jamaica and Britain",
      organisation: "The National Archives",
      date: "Nationality registration, 3 December 1968; records life from 1948",
      kind: "Primary source: nationality registration form",
      url: "https://cdn.nationalarchives.gov.uk/documents/education/empire-windrush-caribbean-migration.pdf#page=19",
      summary:
        "Ena Clare Sullivan travelled from Jamaica on Empire Windrush in 1948. Her 1968 nationality registration records nursing and health work in London, Stoke-on-Trent and Manchester. This official form records a life after arrival, but does not explain all her feelings about Britain. Work contributions alone do not determine a person’s right to belong.",
      context:
        "Reference HO 334/1406/110478. A nationality application records facts required by officials. It cannot tell us all Sullivan’s feelings about belonging or represent every migrant.",
      questionCue:
        "How does this life complicate a simple division between a British “us” and a colonial “them”?",
      locator:
        "PDF pages 19–21: form and transcript. The pack’s transcript headings contain a naming error; use the form’s name, Ena Clare Sullivan.",
    }),
    source({
      id: "migration-review",
      title: "When belonging was denied",
      organisation:
        "Wendy Williams, independent adviser; published by the Home Office",
      date: "19 March 2020",
      kind: "Independent review of government actions",
      url: "https://www.gov.uk/government/publications/windrush-lessons-learned-review",
      summary:
        "Williams found that lawful residents were wrongly caught in immigration enforcement, losing work and suffering other serious harms. She connected this to policy and institutional failures, including poor historical understanding. Her review also quotes an affected person: attachment to Britain coexisted with rejection by its institutions.",
      context:
        "The government commissioned the independent review; Williams used interviews and departmental records. The quoted interviewee is unnamed here and is not Ena Sullivan. One person’s experience cannot establish what every migrant or British person believes.",
      excerpt:
        "I can’t believe I have been treated like this by my beloved England",
      excerptLabel: "Original wording · unnamed person quoted by Williams",
      questionCue:
        "Distinguish a legal right to belong from social recognition. The person’s words also express an emotional attachment.",
      locator:
        "Accessible PDF pp. 7–8: summary and introduction; quotation on p. 8. Optional: recommendation 6, p. 15.",
    }),
  ],
  "remembering-empire": [
    source({
      id: "memory-mau-mau",
      title: "Kenya’s past in a British statement, 2013",
      organisation: "William Hague, UK Foreign Secretary",
      date: "6 June 2013",
      kind: "Primary source: ministerial statement to Parliament",
      url: "https://www.gov.uk/government/news/statement-to-parliament-on-settlement-of-mau-mau-claims",
      summary:
        "Hague acknowledged colonial torture and ill-treatment. He announced a £19.9 million settlement, including costs, for 5,228 claimants and support for a Nairobi memorial. He expressed regret while denying legal liability. The statement shows that recognition and responsibility remained contested fifty years after Kenyan independence.",
      context:
        "This statement explains and defends a government settlement. It is evidence of an official position in 2013; survivors may assess its adequacy differently.",
      excerpt:
        "“sincerely regrets that these abuses took place” / “We continue to deny liability”",
      excerptLabel: "Original wording · two separate extracts from Hague",
      questionCue:
        "Compare regret with the denial of liability. How does this contrast frame the government’s responsibility for readers?",
      locator:
        "Optional original: the paragraphs on regret and liability. The slash above separates two extracts; they are not one sentence.",
    }),
    source({
      id: "memory-hong-kong",
      title: "Hong Kong, 1997: a transfer with continuing consequences",
      organisation:
        "UK and Chinese governments; text hosted by the Hong Kong government",
      date: "Joint Declaration signed 19 December 1984",
      kind: "Primary source: bilateral agreement",
      url: "https://www.cmab.gov.hk/en/issues/jd2.htm",
      summary:
        "The agreement set 1 July 1997 for the transfer of Hong Kong to Chinese sovereignty. It specified a special administrative region with a high degree of autonomy apart from foreign affairs and defence. The transfer was a major endpoint of British colonial rule, not a statement that all overseas ties or responsibilities disappeared.",
      context:
        "These are the two governments’ negotiated commitments. The text alone does not show residents’ views or establish how every commitment was later implemented.",
      questionCue:
        "A map has an end date. Do historical relationships, migration and arguments about responsibility have one?",
      locator: "Read paragraphs 1–3, especially 3(2).",
      optional: true,
    }),
  ],
  "whose-britain": [
    source({
      id: "final-identities",
      title: "There is more than one way to belong",
      organisation: "Office for National Statistics",
      date: "Census 2021; bulletin published 29 November 2022",
      kind: "Official statistics with methodological guidance",
      url: "https://www.ons.gov.uk/peoplepopulationandcommunity/culturalidentity/ethnicity/bulletins/nationalidentityenglandandwales/census2021",
      summary:
        "People could choose several national identities in the 2021 census. Responses include British, English, Welsh and other identities, sometimes combined. National identity is self-described and differs from citizenship and ethnicity. The bulletin covers residents of England and Wales, not the entire UK.",
      context:
        "This measures identity labels, not attitudes to empire. A change in answer order also affects comparisons with 2011. Do not infer that a percentage proves an imperial cause.",
      questionCue:
        "Use precise groups and evidence in your argument; avoid saying that “the British” all think alike.",
      locator:
        "Read section 8, “National identity”, and section 10, “Strengths and limitations”.",
      optional: true,
    }),
    source({
      id: "final-charter",
      title: "Commonwealth: connection after empire",
      organisation: "The Commonwealth",
      date: "Charter signed in 2013",
      kind: "Primary source: statement of shared values",
      url: "https://thecommonwealth.org/charter",
      summary:
        "The Charter presents the Commonwealth as a voluntary association of independent, equal states. It commits members to democracy, rights and cooperation. This offers a language of continuing international connection which differs from colonial government.",
      context:
        "A charter sets out values and aspirations. It cannot prove that every member lives up to them, or that past inequalities have disappeared.",
      questionCue:
        "Does continuing connection mean continued British control? Distinguish the two in your final judgement.",
      locator:
        "Read the opening description and the paragraph beginning “Recalling”.",
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
