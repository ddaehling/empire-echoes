/* panels/dossier/provenance.js — what a source was made for, and what it cannot
 * tell you.
 *
 * Charge 8 says a quotation on a page carries its provenance and in an
 * interface becomes decoration. FEATURE_SPEC §1 answers with four required
 * fields: nature, origin, purpose, and what it cannot tell you.
 *
 * The dataset holds author, work, year, kind, publisher and `supports` for all
 * 880 evidence entries, and holds `purpose` and `cannotTell` for none of them.
 * Round 1 therefore printed [unsourced] about 1,760 times, which is not an
 * audit, it is noise: a student who sees the same red mark on every entry stops
 * reading it by the fourth dossier.
 *
 * So this file does the work the promise requires, at three levels, and the
 * level is always printed beside the answer:
 *
 *   RECORDED   the shard itself holds the field. Nothing here is consulted.
 *   THIS WORK  a note written by this atlas about this specific work. Every one
 *              below is about a book, article or record a reader can find, and
 *              says what its author set out to do and what its evidence base
 *              cannot reach. Signed as ours, not smuggled in as the record's.
 *   ITS CLASS  a statement true of any source of that kind, marked as being
 *              about the class and not about this source. This is the weakest
 *              answer and it is labelled the weakest answer.
 *   MISSING    nothing at all. [unsourced] in --danger, in front of the student.
 *
 * The `origin` field is never invented: it is assembled from author, work, year
 * and publisher, and where the shard has no publisher that gap is shown.
 */

/* Keys are matched on a normalised "author | work" string, so a work cited from
   twenty different shards gets one note. */
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const WORKS = [
  /* ---------------------------------------------------- primary sources -- */
  {
    author: 'Sol Plaatje', work: 'Native Life in South Africa',
    purpose: 'Written in 1916 to be read in Britain: Plaatje travelled the country recording what the 1913 Natives Land Act did to African families, and took the book to London as part of the South African Native National Congress deputation asking the imperial government to disallow the Act.',
    cannotTell: 'It is a campaigning book by a man who was refused a hearing, and it is deliberately selective: it records the families he reached on a bicycle, not a sample. It cannot give you numbers for the whole country, and it ends before the worst of the removals.',
  },
  {
    author: 'Frederick Lugard', work: 'The Dual Mandate in British Tropical Africa',
    purpose: 'Written in 1922 by the architect of indirect rule to justify it and to teach it to the men who would administer it. It is an argument for a method of governing, addressed to the Colonial Office and to a British public asked to pay for it.',
    cannotTell: 'It tells you what a colonial governor believed he was doing and wanted others to believe. It cannot tell you what indirect rule was like for the people ruled, and it treats African political institutions as instruments of British administration rather than as governments with their own histories.',
  },
  {
    author: 'Lee Kuan Yew', work: 'The Singapore Story: Memoirs of Lee Kuan Yew',
    purpose: 'A memoir published in 1998 by the man who led Singapore out of the merger with Malaysia and then governed it for three decades. It was written to fix an account of those events, and of his own part in them, while he was still in office as Senior Minister.',
    cannotTell: 'It is the winner’s version, written thirty years later by a government that controlled the archive and the press. It cannot be used on its own for the motives of Tunku Abdul Rahman, of the Barisan Sosialis, or of the men detained under Operation Coldstore.',
  },
  {
    author: 'Reginald Fleming Johnston', work: 'Lion and Dragon in Northern China',
    purpose: 'Published in 1910 by a serving British district officer in Weihaiwei, partly to describe village government to a British readership and partly to argue that Chinese customary institutions worked and should be left alone.',
    cannotTell: 'It is an administrator writing about the people he administered, in a leased territory he had a professional interest in presenting as well governed. It carries no Chinese voice that is not filtered through his court.',
  },
  {
    author: 'Harold Ingrams', work: 'Arabia and the Isles',
    purpose: 'Written in 1942 by the British Resident Adviser who negotiated the Hadhramaut truce, to explain and defend the advisory system he had built in the Aden Protectorate.',
    cannotTell: 'The truce is described by the man whose career depended on it holding. It cannot tell you what the signatory chiefs thought they were agreeing to, and it has almost nothing on the people who were neither chiefs nor officials.',
  },
  {
    author: 'G.K.N. Trevaskis', work: 'Eritrea: A Colony in Transition, 1941-52',
    purpose: 'Written in 1960 by a British official of the administration it describes, to record how Britain governed Eritrea between the Italian defeat and the federation with Ethiopia.',
    cannotTell: 'It is the administration’s own account of its own decade, and it is unsympathetic to the Eritrean independence movement whose case it was in Britain’s interest to discount. It cannot settle what Eritreans wanted in 1952.',
  },
  /* ---------------------------------------------------- official records -- */
  {
    author: 'Patrick Devlin (chair)', work: 'Report of the Nyasaland Commission of Inquiry, Cmnd 814',
    purpose: 'A British government commission of inquiry, published in 1959, appointed to establish what had happened in Nyasaland during the emergency. It was written for the Colonial Secretary and Parliament, and its conclusion — that Nyasaland was "no doubt temporarily, a police state" — was rejected by the government that commissioned it.',
    cannotTell: 'It counted the dead the administration knew of and heard the witnesses it could reach in weeks. It cannot give you the full scale of the detentions, and it did not investigate the Federation’s politics that produced the emergency.',
  },
  {
    author: 'Lawrence Freedman', work: 'The Official History of the Falklands Campaign',
    purpose: 'Commissioned by the British government and written with privileged access to the Cabinet and service papers, to produce an authoritative account of the 1982 campaign and the diplomacy before it.',
    cannotTell: 'It is built from British state papers. It cannot show you the Argentine decision-making except through British eyes, and an official history is written under conditions its government sets.',
  },
  /* ----------------------------------------------------------- articles -- */
  {
    author: 'John Gallagher and Ronald Robinson', work: 'The Imperialism of Free Trade',
    purpose: 'A 1953 article written to overturn the standard chronology of British expansion, arguing that formal annexation was the exception and that "trade with informal control if possible" was the rule. It is a thesis aimed at other historians, and it started the argument it is still cited for.',
    cannotTell: 'It is an argument, not a measurement. It offers no way of saying how much informal control existed at a given date, and critics have pointed out that stretched far enough the concept cannot be disproved.',
  },
  {
    author: 'Peter Winn', work: 'British Informal Empire in Uruguay in the Nineteenth Century',
    purpose: 'A 1976 article in Past and Present applying the Gallagher and Robinson thesis to a single small state, to test whether informal empire can be demonstrated rather than asserted.',
    cannotTell: 'It is one case chosen because it is the clearest. It cannot tell you how typical Uruguay was of British influence in South America.',
  },
  {
    author: 'Ralph A. Austen', work: 'The Slave Trade as History and Memory: Confrontations of Slaving Voyage Documents and Communal Traditions',
    purpose: 'A 2001 article setting the documented traffic through particular slaving sites against the far larger figures carried in local and diaspora memory, and asking what a historian owes each.',
    cannotTell: 'It works from shipping records, which were kept by the traders. It cannot recover the numbers that were never written down, and it does not claim to settle the moral question it raises.',
  },
  {
    author: 'David Lowenthal and Colin G. Clarke', work: 'Slave-Breeding in Barbuda: The Past of a Negro Myth',
    purpose: 'A 1977 article written to test, and demolish, the long-repeated story that Barbuda was used as a stud farm for enslaved people, using the Codrington estate’s own demographic records.',
    cannotTell: 'It disproves a story using planter records. Those records cannot tell you how enslaved Barbudans understood their own families.',
  },
  {
    author: 'Riva Berleant-Schiller', work: 'The Black Barbudans',
    purpose: 'An anthropologist’s study of communal land use and the provisioning economy on Barbuda, written to explain how a practice that survived emancipation actually worked.',
    cannotTell: 'It is fieldwork and estate records read together. It cannot give you the island’s history from the Codrington family’s point of view, and this atlas’s record of it carries no publisher.',
  },
  {
    author: 'Michael D. Olien', work: 'The Miskito Kings and the Line of Succession',
    purpose: 'A 1983 article reconstructing the succession of the British-sponsored Miskitu kingship from 1687, written to establish a chronology other scholars had got wrong.',
    cannotTell: 'It is a reconstruction from British colonial documents naming Miskitu kings. It cannot tell you how Miskitu people themselves understood the office.',
  },
  {
    author: 'Heather Sutherland', work: 'The Taming of the Trengganu Elite',
    purpose: 'A chapter in an edited volume on Southeast Asian transitions, written to show how British administration displaced an existing Malay ruling class and what that cost.',
    cannotTell: 'It is one state’s elite politics. It cannot tell you what the 1928 rising meant to the peasants who joined it.',
  },
  /* ---------------------------------------------------- reference works -- */
  {
    author: 'A. Adu Boahen (ed.)', work: 'General History of Africa, Volume VII: Africa under Colonial Domination 1880-1935',
    purpose: 'A UNESCO project begun in the 1960s and written under African editorial control, to replace colonial-era history of Africa with an account written by African scholars for a general readership.',
    cannotTell: 'It is a synthesis at continental scale by many hands. It cannot go deep on any one place, and it reflects the state of research in the early 1980s.',
  },
  {
    author: 'Miranda Morris', work: 'The Soqotri Language: Volume I, Texts',
    purpose: 'A linguistic corpus published in 2019, recording Soqotri texts from speakers so that a Modern South Arabian language with few speakers is documented before it is lost.',
    cannotTell: 'It is a record of language and oral culture. It carries no political or administrative history of the island.',
  },
  /* --------------------------------------- heavily used modern monographs -- */
  {
    author: 'Caroline Elkins', work: 'Britain’s Gulag: The Brutal End of Empire in Kenya',
    purpose: 'Written to argue that the detention system in Kenya was far larger and more violent than Britain ever admitted, using oral testimony from Kikuyu survivors alongside the surviving files.',
    cannotTell: 'Its highest population estimates are disputed by other historians, and oral testimony taken forty years later cannot be checked against the files Britain destroyed.',
  },
  {
    author: 'Ronald Robinson and John Gallagher', work: 'Africa and the Victorians: The Official Mind of Imperialism',
    purpose: 'A 1961 book arguing that the partition of Africa was driven by British officials’ strategic anxieties about Egypt and the route to India rather than by economic appetite. It is a case against the economic explanation.',
    cannotTell: 'It is built almost entirely from the papers of British decision-makers. By design it cannot tell you what African rulers, traders or soldiers were doing to shape the outcome.',
  },
  {
    author: 'Thomas Pakenham', work: 'The Boer War',
    purpose: 'A narrative history for a general readership, written to bring the war’s conduct — including the camps — to a wide audience.',
    cannotTell: 'It is strongest on the British and Boer commands. African participation and African deaths are thinner in it than in later scholarship.',
  },
  {
    author: 'Alan Taylor', work: 'American Colonies: The Settling of North America',
    purpose: 'A survey written to reframe colonial North America as a contest between several empires and many Native nations, rather than as the prehistory of the United States.',
    cannotTell: 'It is a survey. It cannot give you the documentary detail of any single colony, and it works from other historians’ research throughout.',
  },
  {
    author: 'Leonard Thompson', work: 'A History of South Africa',
    purpose: 'A single-volume history written to give a general reader an account of South Africa in which African societies are agents rather than background.',
    cannotTell: 'It compresses four centuries into one volume, and it was written before the full opening of apartheid-era state archives.',
  },
  {
    author: 'B. W. Higman', work: 'A Concise History of the Caribbean',
    purpose: 'A regional survey written to treat the Caribbean as one place with a common history of plantation, slavery and migration, across the European empires that divided it.',
    cannotTell: 'It is regional and short. It cannot carry the archival detail of any one island, and it is a synthesis of other people’s research.',
  },
  {
    author: 'Robert Aldrich', work: 'The Last Colonies',
    purpose: 'A 1998 survey of the territories that were never decolonised, written to ask why some places stayed dependencies when almost everywhere else did not.',
    cannotTell: 'It is a comparative survey written in the 1990s. It cannot cover the constitutional changes since, and it is thin on internal politics in the smallest territories.',
  },
  {
    author: 'Toyin Falola and Matthew M. Heaton', work: 'A History of Nigeria',
    purpose: 'A survey written for students, one of its authors a Nigerian historian, to set colonial rule inside a longer Nigerian history rather than to begin the story with the British arrival.',
    cannotTell: 'It is one volume over several centuries and many peoples. It cannot carry the detail of any one region, and it is a synthesis of other historians’ research rather than archival work.',
  },
  {
    author: 'R. J. Gavin', work: 'Aden Under British Rule, 1839-1967',
    purpose: 'A scholarly history of the whole span of British rule at Aden, written to explain how a coaling station taken for the route to India turned into a colony and a protectorate.',
    cannotTell: 'It is built largely from the records of the administration it describes. It is thinner on what the people of the port and the hinterland thought they were living under.',
  },
  {
    author: 'John D. Hargreaves', work: 'Prelude to the Partition of West Africa',
    purpose: 'A 1963 study arguing that the partition of West Africa grew out of local crises on the coast rather than out of a plan made in Europe.',
    cannotTell: 'It works mostly from European diplomatic and colonial papers, so African states appear in it as the other party to a European decision more often than as decision-makers of their own.',
  },
  {
    author: 'Victor Julius Ngoh', work: 'History of Cameroon Since 1800',
    purpose: 'A national history by a Cameroonian historian, written to hold German, British and French rule and the reunification inside a single Cameroonian account.',
    cannotTell: 'It compresses two centuries into one volume, and the constitutional history it tells is itself argued over inside Cameroon.',
  },
  {
    author: 'Christopher Fyfe', work: 'A History of Sierra Leone',
    purpose: 'A very large narrative history published in 1962, assembled from the Freetown records, to give the colony and its settler communities a documented history of their own.',
    cannotTell: 'It is built from the records kept in Freetown. The interior, and the societies the colony traded with and later ruled, are thinner in it than the coast.',
  },
  {
    author: 'Richard S. Dunn', work: 'Sugar and Slaves: The Rise of the Planter Class in the English West Indies, 1624-1713',
    purpose: 'A 1972 study of how a planter class formed in the early English Caribbean, written from estate papers, wills and colonial correspondence.',
    cannotTell: 'The records it rests on were kept by planters and colonial officials. It can count the people they enslaved far better than it can tell you what those people did with their own lives.',
  },
  {
    author: 'Glen Balfour-Paul', work: 'The End of Empire in the Middle East: Britain’s Relinquishment of Power in her Last Three Arab Dependencies',
    purpose: 'Written by a former British diplomat who served in the region, to explain how Britain left Aden, the Gulf and South Arabia and how those decisions were reached in London.',
    cannotTell: 'It is the view from the British side of the negotiation, by someone who was on it. It cannot stand alone for what the movements that forced the withdrawals wanted.',
  },
  {
    author: 'William St Clair', work: 'The Grand Slave Emporium: Cape Coast Castle and the British Slave Trade',
    purpose: 'Written from the surviving records of the Company of Merchants Trading to Africa, to show how the slave trade was run as an ordinary business from one fort on the Gold Coast.',
    cannotTell: 'Those records were kept by the traders. They register the people sold as cargo, and they cannot give you the lives, names or communities of almost anyone shipped from that castle.',
  },
  {
    author: 'Peter J. Beck', work: 'The International Politics of Antarctica',
    purpose: 'A study of the diplomacy of Antarctic claims and of the 1959 Antarctic Treaty, written to explain how competing sovereignty claims were set aside rather than settled.',
    cannotTell: 'It is a history of states negotiating with each other. It is not a history of the scientists, whalers or bases on the ice.',
  },
  {
    author: 'Barbara Watson Andaya and Leonard Y. Andaya', work: 'A History of Malaysia',
    purpose: 'A standard survey written to give Malaysian history a shape of its own, running from the Melaka sultanate through colonial rule to the federation, rather than beginning with the British arrival.',
    cannotTell: 'It is a national survey. It cannot go deep on any one state, and it necessarily compresses the Emergency.',
  },

  /* ------------------------------------ round 4: the most-cited works ------
     Round 3's own amber counter read "Of 16 answers on this page, 8 are true
     only of the class of source". The fix for that is not a shorter sentence,
     it is doing the work: these are the works this dataset leans on hardest,
     and each now has a note about that book and not about books in general. */
  {
    author: 'Barbara D. Metcalf and Thomas R. Metcalf', work: 'A Concise History of Modern India',
    purpose: 'A short survey written for students and general readers, to give modern India a history that runs through and past the colonial period rather than being organised by it.',
    cannotTell: 'It is a synthesis in a few hundred pages across two centuries and a subcontinent. It cannot carry the archival detail of any one province, and it settles contested figures by summarising the argument rather than resolving it.',
  },
  {
    author: 'William Dalrymple', work: 'The Anarchy: The Relentless Rise of the East India Company',
    purpose: 'A narrative history published in 2019, written for a wide readership to make one argument: that India was taken not by a nation but by a joint-stock company answerable to shareholders, and that this is the fact the phrase "the British Empire" hides.',
    cannotTell: 'It is a story told through commanders, nawabs and directors, and it is strongest where they wrote letters. It is thinner on the peasants and weavers whose revenue paid for all of it, and specialists argue that it makes the Company more decisive than the Indian politics it exploited.',
  },
  {
    author: 'Jon Wilson', work: 'India Conquered: Britain’s Raj and the Chaos of Empire',
    purpose: 'Written to argue against the idea that British rule in India was a system at all: Wilson’s case is that it was improvised, anxious and violent, and that its own claims to order were a performance.',
    cannotTell: 'It is an argument aimed at other historians of empire, and it is deliberately unsympathetic to the administrative record. It cannot be used on its own for what the institutions of the Raj actually did day to day.',
  },
  {
    author: 'Yasmin Khan', work: 'The Great Partition: The Making of India and Pakistan',
    purpose: 'A history of 1947 written to show Partition from below — how decisions taken in Delhi and London reached villages, and how quickly the timetable outran any capacity to protect anyone.',
    cannotTell: 'The killings were not counted at the time by anyone with an interest in counting them. The book gives ranges, not a figure, and it says so.',
  },
  {
    author: 'Ayesha Jalal', work: 'The Sole Spokesman: Jinnah, the Muslim League and the Demand for Pakistan',
    purpose: 'A 1985 study written to overturn the standard account of Jinnah, arguing that the demand for Pakistan was a bargaining position for Muslim power within a united India rather than a settled aim.',
    cannotTell: 'It is a close reading of one man’s political strategy from the papers of the negotiation. It is not a history of what ordinary Muslims wanted, and its thesis is contested in both India and Pakistan.',
  },
  {
    author: 'Arnold Hughes and David Perfect', work: 'A Political History of the Gambia, 1816-1994',
    purpose: 'A detailed political history written to trace how a strip of river bank became a party-political state, from the colonial administration through to the coup that ended the First Republic.',
    cannotTell: 'It is about parties, elections and administrations. It has little on the rural economy or on the Senegalese border that cuts every Gambian community in half.',
  },
  {
    author: 'Simon C. Smith', work: 'Britain’s Revival and Fall in the Gulf: Kuwait, Bahrain, Qatar, and the Trucial States, 1950-71',
    purpose: 'Written from the British archives to explain why Britain stayed in the Gulf after leaving India, and then left in 1971 within three years of saying it would not.',
    cannotTell: 'It is the view from London and from the Residency. The politics of the ruling families, and of the merchants and workers who pressed them, appear mainly as problems reported to British officials.',
  },
  {
    author: 'Emily Sadka', work: 'The Protected Malay States, 1874-1895',
    purpose: 'A close institutional study of how the Residential system actually worked in its first twenty years, written to test what "advice" meant when a ruler was obliged to take it.',
    cannotTell: 'It works from the Residents’ own files. It cannot tell you how the system looked to the Malay chiefs who lost their revenue farms, or to the Chinese miners whose labour paid for it.',
  },
  {
    author: 'Donald R. Wright', work: 'The World and a Very Small Place in Africa: A History of Globalization in Niumi, The Gambia',
    purpose: 'Written to hold six centuries of world history inside one small Gambian district, using oral tradition alongside documents, to show that Atlantic commerce reached and reshaped even the smallest places.',
    cannotTell: 'It is one district, chosen because it is documented. Oral traditions collected in the twentieth century are evidence about the present as well as about the past, and the book is explicit that it cannot date them precisely.',
  },
  {
    author: 'Ivor Wilks', work: 'Asante in the Nineteenth Century: The Structure and Evolution of a Political Order',
    purpose: 'A major reconstruction of Asante as a state with its own bureaucracy, roads, finance and political argument, written to end the treatment of African polities as backdrop to European expansion.',
    cannotTell: 'Its reconstruction of Asante government rests on court traditions and on European visitors’ accounts, and other historians read both differently. It is about the capital and the office-holders more than about the provinces they taxed.',
  },
  {
    author: 'Piet Konings and Francis B. Nyamnjoh', work: 'Negotiating an Anglophone Identity: A Study of the Politics of Recognition and Representation in Cameroon',
    purpose: 'Written by two Cameroon specialists to explain how the former British Southern Cameroons came to see itself as a colonised minority inside a French-speaking state, and where that grievance comes from constitutionally.',
    cannotTell: 'It is a study of a political claim and it takes that claim seriously. It is not a neutral account of the 1961 plebiscite, and it was published before the armed conflict that began in 2016.',
  },
  {
    author: 'John Lynch', work: 'The Spanish American Revolutions 1808-1826',
    purpose: 'The standard survey of the wars that broke up the Spanish American empire, written to explain why the revolutions happened when and where they did.',
    cannotTell: 'It is about Spanish America. Britain appears in it as a trading interest and an intervening power, so it cannot on its own establish how much British influence replaced Spanish rule.',
  },
  {
    author: 'Stuart Kaye', work: 'Australia’s Maritime Boundaries',
    purpose: 'A legal study of where Australia’s maritime limits run and how they were negotiated, written for lawyers and officials rather than for historians.',
    cannotTell: 'It is a work of law about lines on charts. It carries almost nothing about the people on the islands those lines were drawn around.',
  },
  {
    author: 'W. David McIntyre', work: 'Winding Up the British Empire in the Pacific Islands',
    purpose: 'Written to explain how Britain left the Pacific — the smallest, poorest and last of its dependencies — and why the constitutional forms it left behind differ so much from island to island.',
    cannotTell: 'It is a constitutional and administrative history, largely from British and New Zealand records. It is thin on what independence meant to islanders who had not asked for the timetable.',
  },
  {
    author: 'Donald Denoon', work: 'A Trial Separation: Australia and the Decolonisation of Papua New Guinea',
    purpose: 'Written to explain why Australia, having governed Papua and New Guinea for sixty years, decolonised them in a hurry, and what that haste cost.',
    cannotTell: 'It is an Australian debate about an Australian decision. Papua New Guinean politics enter mostly through the men Australia negotiated with.',
  },
  {
    author: 'Michael Duffy', work: 'Soldiers, Sugar, and Seapower: The British Expeditions to the West Indies and the War against Revolutionary France',
    purpose: 'A study of the West Indian campaigns of the 1790s, written to show that Britain committed its army to the Caribbean because sugar revenue, not Europe, was the strategic priority — and to count what that cost in soldiers’ lives.',
    cannotTell: 'It counts the British forces because the army counted them. The enslaved people whose islands were fought over, and the Black troops raised there, are much less visible in the same records.',
  },
  {
    author: 'J. E. Peterson', work: 'Oman in the Twentieth Century: Political Foundations of an Emerging State',
    purpose: 'Written to explain how the Sultanate survived the imamate revolt and the Dhofar war, and how a state was built around a ruler Britain had kept in place.',
    cannotTell: 'It is written from the state’s side and from British records of it. The interior imamate’s own case, and the Dhofari rebels’, are represented rather than heard.',
  },
  {
    author: 'James Onley', work: 'The Arabian Frontier of the British Raj: Merchants, Rulers, and the British in the Nineteenth-Century Gulf',
    purpose: 'Written to show that British power in the Gulf was exercised through Indian and Arab merchants through men the Company itself called native agents, not by British officials — an argument about how thin the imperial presence really was.',
    cannotTell: 'It rests on the correspondence of the Bombay government and its agents. It cannot tell you what the pearling crews and slaves of the Gulf ports made of any of it.',
  },
  {
    author: 'J. B. Kelly', work: 'Britain and the Persian Gulf, 1795-1880',
    purpose: 'A very large archival study of how Britain came to police the Gulf, written in 1968 largely from India Office and Admiralty records.',
    cannotTell: 'It accepts the British account of "piracy" and the maritime truces more readily than later scholarship does, and the Qawasim case against that account is not given its own hearing.',
  },
  {
    author: 'Mary C. Wilson', work: 'King Abdullah, Britain and the Making of Jordan',
    purpose: 'Written to show how a state was assembled around a British subsidy and a Hashemite prince who had wanted Damascus, and how dependent the arrangement remained.',
    cannotTell: 'It is a political biography built from British and Hashemite papers. The Transjordanian tribes and the Palestinian population that later formed the majority are largely outside it.',
  },
  {
    author: 'Deryck Scarr', work: 'Seychelles Since 1770: History of a Slave and Post-Slavery Society',
    purpose: 'Written to trace one small plantation society from its French founding through British rule to independence, with slavery and its aftermath as the organising fact rather than an episode.',
    cannotTell: 'The records of a tiny colony are thin and were kept by planters and officials. The book reconstructs the enslaved population’s life largely from what was recorded about them.',
  },
  {
    author: 'Tim Harper', work: 'The End of Empire and the Making of Malaya',
    purpose: 'Written to argue that the Malayan Emergency was not simply a counter-insurgency but the making of a state: resettlement, citizenship and the communal bargain were all decided under emergency powers.',
    cannotTell: 'It is a history of the making of a state and of its politics. It is not a military history, and the numbers detained and resettled come from the administration that did the detaining.',
  },
  {
    author: 'Nicholas Tarling', work: 'Anglo-Dutch Rivalry in the Malay World, 1780-1824',
    purpose: 'A diplomatic history written to explain how two European powers divided maritime Southeast Asia between themselves, ending in the treaty of 1824 that drew the line still on the map.',
    cannotTell: 'It is a study of two European foreign ministries. The sultanates whose territories were traded appear as objects of the negotiation, not parties to it.',
  },
  {
    author: 'Nicholas Tarling', work: 'Imperialism in Southeast Asia: A Fleeting, Passing Phase',
    purpose: 'A late survey arguing that European rule in Southeast Asia was shorter, shallower and more contingent than the phrase "colonial era" suggests.',
    cannotTell: 'It is a regional argument at high altitude. It cannot be used for the detail of any single colony, and its thesis of shallowness is contested by historians who work on what colonial states did to land and labour.',
  },
  {
    author: 'Leonard Thompson', work: 'Survival in Two Worlds: Moshoeshoe of Lesotho, 1786-1870',
    purpose: 'A biography written to show a nineteenth-century African ruler as a strategist — assembling a nation out of refugees and choosing British protection as the least bad option against the Boer republics.',
    cannotTell: 'It is built from missionary and colonial records plus Sotho traditions collected later. Moshoeshoe left almost nothing in his own hand, so his reasoning is reconstructed.',
  },
  {
    author: 'Andrew Roberts', work: 'A History of Zambia',
    purpose: 'A general history written in 1976, soon after independence, to give Zambia a past that does not begin with the British South Africa Company.',
    cannotTell: 'It was written before much of the research on the Copperbelt and on rural Zambia was done, and it necessarily compresses many peoples into one national story.',
  },
  {
    author: 'I.M. Lewis', work: 'A Modern History of the Somali: Nation and State in the Horn of Africa',
    purpose: 'The standard modern history of the Somali, written by an anthropologist to explain how one people came to be divided between five administrations and what that did to Somali politics.',
    cannotTell: 'Its organising framework is clan genealogy, and other scholars argue that this framework hardens something more fluid and lets colonial and post-colonial state policy off too lightly.',
  },
  {
    author: 'Ashley Jackson', work: 'The British Empire and the Second World War',
    purpose: 'Written to show that the war was fought by the whole empire — that the manpower, food, bases and money came overwhelmingly from the colonies, and that this is invisible in most British accounts.',
    cannotTell: 'It is a survey of an enormous subject. It cannot go deep on any theatre, and its figures for colonial contributions come from the imperial administrations that collected them.',
  },
  {
    author: 'Padraic X. Scanlan', work: 'Freedom’s Debtors: British Antislavery in Sierra Leone in the Age of Revolution',
    purpose: 'Written to argue that British antislavery in Sierra Leone was itself a business: officials and officers were paid bounties for the people they liberated, and liberation meant apprenticeship and military service.',
    cannotTell: 'It is a case against the redemption story, and it is built from the colony’s administrative and legal records. It is not a full account of what liberated Africans made of their own lives afterwards.',
  },
  {
    author: 'Simon Schama', work: 'Rough Crossings: Britain, the Slaves and the American Revolution',
    purpose: 'A narrative written for a general readership to tell the American Revolution from the point of view of enslaved people for whom the British lines were the road to freedom — and to follow them to Nova Scotia and Sierra Leone.',
    cannotTell: 'It is written to overturn one story and it leans hard on the individuals whose testimony survives. Historians have criticised it for taking British promises at their word more readily than the record supports.',
  },
  {
    author: 'Dennis Austin', work: 'Politics in Ghana, 1946-1960',
    purpose: 'Written by a political scientist who was there, to record in detail how the Convention People’s Party won power and what the constitutional bargaining with Britain actually involved.',
    cannotTell: 'It stops in 1960 and is written close to the events, before the archives opened. It is about parties and elections rather than about the cocoa economy underneath them.',
  },
  {
    author: 'Roger S. Gocking', work: 'The History of Ghana',
    purpose: 'A single-volume survey written for students, to set the Gold Coast colony inside a longer history of the Akan and northern states.',
    cannotTell: 'It is short and it is a synthesis. It cannot carry the detail of the Asante wars or of the cocoa economy, and it works from other historians throughout.',
  },
  {
    author: 'Robert Smith', work: 'The Lagos Consulate 1851-1861',
    purpose: 'A close study of the decade between the British bombardment of Lagos and its annexation, written to establish exactly how a consulate became a colony.',
    cannotTell: 'It is built from consular despatches. The politics of the Lagos kingship, and of the traders whose slave business was being suppressed, are seen through British eyes.',
  },
  {
    author: 'Martin Lynn', work: 'Commerce and Economic Change in West Africa: The Palm Oil Trade in the Nineteenth Century',
    purpose: 'An economic history written to test the claim that "legitimate commerce" replaced the slave trade cleanly, using price and volume series for palm oil.',
    cannotTell: 'It works from trade statistics kept at the European end. It cannot tell you how the labour that produced the oil — much of it enslaved, inside Africa — was organised.',
  },
  {
    author: 'Klaus Dodds', work: 'Pink Ice: Britain and the South Atlantic Empire',
    purpose: 'Written by a political geographer to examine how Britain has justified and imagined its South Atlantic claims, from the Falklands to the Antarctic, and how those claims are maintained politically.',
    cannotTell: 'It is a study of geopolitics and representation. It is not an administrative or environmental history of the territories themselves.',
  },
  {
    author: 'Robert Hughes', work: 'The Fatal Shore: A History of the Transportation of Convicts to Australia, 1787-1868',
    purpose: 'A narrative history written for a general readership to argue that the convict system was a system of terror, and to put it at the centre of Australia’s founding rather than at its embarrassing edge.',
    cannotTell: 'Later research has revised several of its harshest generalisations about convict life. Aboriginal Australians appear in it far less than the dispossession it describes would warrant.',
  },
  {
    author: 'Katerina Martina Teaiwa', work: 'Consuming Ocean Island: Stories of People and Phosphate from Banaba',
    purpose: 'Written by a scholar of Banaban descent to follow the island’s phosphate to the farms of Australia and New Zealand, and to account for the removal of the Banabans to Rabi.',
    cannotTell: 'It is a study of one island and of a displacement, written partly from family and community memory. It is not a neutral audit of the mining company’s accounts, and it does not claim to be.',
  },
  {
    author: 'Barrie Macdonald', work: 'Cinderellas of the Empire: Towards a History of Kiribati and Tuvalu',
    purpose: 'Written to give two of the least-documented British colonies a history, and to argue that they were neglected because they were poor and small rather than because they were quiet.',
    cannotTell: 'The colonial record for these islands is thin and was written by a handful of officials. Gilbertese and Tuvaluan voices survive mainly where an official recorded them.',
  },
  {
    author: 'Michael J. Jarvis', work: 'In the Eye of All Trade: Bermuda, Bermudians, and the Maritime Atlantic World, 1680-1783',
    purpose: 'Written to show Bermuda as a maritime society rather than a plantation one — a place whose people, free and enslaved, made their living at sea across the whole Atlantic.',
    cannotTell: 'It is built from shipping registers, wills and court records kept by Bermuda’s white householders. Enslaved Bermudian sailors appear in it as property being accounted for, more often than as people speaking.',
  },
  {
    author: 'Fred Anderson', work: 'Crucible of War: The Seven Years’ War and the Fate of Empire in British North America, 1754-1766',
    purpose: 'Written to argue that the victory of 1763 caused the crisis of 1776: the war doubled Britain’s debt, removed the French threat that had kept the colonies loyal, and taught London to tax.',
    cannotTell: 'It is a history of the war and its politics from the British and colonial side. Indigenous nations are treated as diplomatic actors, which is an advance, but their own records are oral and largely outside it.',
  },
  {
    author: 'Bridget Brereton', work: 'A History of Modern Trinidad 1783-1962',
    purpose: 'Written by a Trinidadian historian to give the island a national history in which enslaved Africans, indentured Indians and creole society are the subject, not the labour supply.',
    cannotTell: 'It is a single volume across two centuries. It is thinner on the oil economy of the twentieth century than on the nineteenth-century plantation society it reconstructs.',
  },
  {
    author: 'Andrew Jackson O’Shaughnessy', work: 'An Empire Divided: The American Revolution and the British Caribbean',
    purpose: 'Written to answer a question the thirteen colonies usually crowd out: why the British West Indies, which had the same grievances, did not join the revolution.',
    cannotTell: 'The answer it gives turns on white planters’ fear of the enslaved majority around them. It is a study of that white political class, and not of the majority whose presence explains their choice.',
  },
  {
    author: 'Stuart Macintyre', work: 'A Concise History of Australia',
    purpose: 'A short national history written to include Aboriginal Australia in the same frame as settlement, federation and the twentieth-century state.',
    cannotTell: 'It is concise by design. It cannot carry the evidence for any single frontier conflict, and it summarises arguments — over frontier deaths above all — that other historians conduct in detail.',
  },
  {
    author: 'Spencer Mawby', work: 'British Policy in Aden and the Protectorates 1955-67: Last Outpost of a Middle East Empire',
    purpose: 'Written from the British archives to explain how a colony and its protectorates were lost in twelve years, and how far British policy created the movements that removed it.',
    cannotTell: 'It is policy history from London and Government House. The NLF and FLOSY appear as the problem being managed rather than as movements with internal politics of their own.',
  },
  {
    author: 'Jill Crystal', work: 'Oil and Politics in the Gulf: Rulers and Merchants in Kuwait and Qatar',
    purpose: 'A political-science study written to explain how oil revenue let Gulf rulers buy off the merchant families who had previously constrained them, and so changed the shape of these states.',
    cannotTell: 'It is a comparison of two ruling bargains. The migrant workforce that produced and served the oil economy is not the subject.',
  },
  {
    author: 'Hank Nelson', work: 'Taim Bilong Masta: The Australian Involvement with Papua New Guinea',
    purpose: 'Built from a large oral-history project recorded for Australian radio, to preserve what Australians and Papua New Guineans said about the colonial period while the people who lived it were alive.',
    cannotTell: 'It is memory, recorded decades later, and the Australian voices in it outnumber the Papua New Guinean ones. It is evidence of how the period was remembered as much as of what happened.',
  },
];

const INDEX = new Map();
const BY_AUTHOR = new Map();
for (const w of WORKS) {
  INDEX.set(norm(w.author) + '|' + norm(w.work), w);
  INDEX.set(norm(w.work), w);
  const a = norm(w.author);
  BY_AUTHOR.set(a, BY_AUTHOR.has(a) ? null : w);   // null = this author has more than one work here
}

/* Round 2 keyed Elkins on "Britain's Gulag" while every shard cites
   "Britain's Gulag: The Brutal End of Empire in Kenya", so the exact match
   failed and the single most contested book in the subject fell back to the
   sentence we print about every book ever written. A title in the shards is
   the same work as a title here when one is a prefix of the other; and where
   this file holds exactly one work by an author, that author's name is enough.
   Both are cheap, and both are checkable by eye against the list above. */
export function workNote(src) {
  if (!src) return null;
  const a = norm(src.author);
  const w = norm(src.work);
  const exact = INDEX.get(a + '|' + w) || INDEX.get(w);
  if (exact) return exact;
  if (w) {
    for (const entry of WORKS) {
      const ew = norm(entry.work);
      if (!ew) continue;
      const prefix = (w.startsWith(ew + ' ') || ew.startsWith(w + ' '));
      if (!prefix) continue;
      if (a && norm(entry.author) !== a) continue;
      return entry;
    }
  }
  /* Deliberately NOT matched on the author alone. Pakenham wrote The Boer War
     and The Scramble for Africa; Alan Taylor is cited here for three different
     books. A note about the wrong book is worse than no note. */
  return null;
}

export const WORK_NOTE_COUNT = WORKS.length;
