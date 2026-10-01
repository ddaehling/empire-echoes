/* panels/dossier/causes.js — the causation this atlas is prepared to state.
 *
 * Charge 1 of docs/rival/WHY_PRINT_WINS.md: "a sustained causal argument
 * survives on a page and dies in a tooltip." FEATURE_SPEC §1 commits us to
 * `causalLinks[]` as a first-class object — a BECAUSE chip on a claim that
 * navigates to the claim it caused, so causation survives a panel change.
 *
 * Round 3 shipped the machinery and no argument. `causalLinks[]` is empty in
 * all 260 shards, so the panel printed, honestly and uselessly, "No chip on
 * this page says 'because'". Honest is not the same as taught. The chapter we
 * are up against carries one proposition across eighteen thousand words and
 * eleven callbacks; we carried none.
 *
 * This file is that argument, written down, in one auditable table, in this
 * atlas's own voice and signed as ours — exactly as provenance.js does for
 * what a book was written for. Each entry is:
 *
 *   from      the territory whose dossier carries the chip: THE CAUSE
 *   to        the territory the chip navigates to:           THE EFFECT
 *   year      the year the effect's panel should open at
 *   text      what the chip says, in the student's reading order
 *   because   the reason, printed under the rail at reading size, never in a
 *             title attribute, never truncated
 *   section   which block of the target panel to land on
 *
 * A reverse chip is generated for the effect's own panel — same statement,
 * read from the other end — so the join is reachable from both places.
 *
 * THE RULE FOR ADDING ONE. A causal link is a claim, not a cross-reference.
 * If the honest word is "compare with", "named in this record" or "it sat
 * inside", it belongs in claims.js and not here. Nothing in this table is a
 * novel thesis: every one is standard in the historiography, and the ones
 * historians argue about say so in their own reason.
 *
 * The spine it carries (DIDACTIC_SPEC §2, §3):
 *   T7  revenue → sepoys → conquest → revenue
 *   T8  Britain conquered India with Indian soldiers paid from Indian taxes
 *   T12 the route to India is why Egypt, Aden, Malta, Cyprus and the Cape
 *   T5  the demand end of the slave trade and the supply end are one system
 *   T15 self-government conceded to settlers and refused to the colonised
 *   T19 how it ended, and what the ending cost
 */

export const CAUSES = [
  /* ================================================== THE INDIA ENGINE == */
  {
    from: 'bengal-presidency', to: 'british-india', year: 1765,
    text: 'the land revenue of Bengal paid for the army that took the rest of India',
    section: 'taken',
    because: 'From 1765 the Company held the diwani — the right to collect Bengal\'s land revenue. It spent that revenue on soldiers, and the soldiers took more territory, and the new territory paid more revenue. Revenue, sepoys, conquest, revenue: the loop is the mechanism of British India.',
    cite: {
      author: 'P. J. Marshall',
      work: 'Bengal: The British Bridgehead: Eastern India 1740–1828',
      year: 1987, kind: 'book',
      publisher: 'Cambridge University Press',
      supports: 'The diwani, the revenue settlement and what the Company did with Bengal\'s money.',
    },
  },
  {
    from: 'british-india', to: 'bengal-presidency', year: 1765,
    text: 'Britain did not pay for the conquest of India',
    section: 'taken',
    backText: 'the Indian revenue that paid for it',
    because: 'The Company\'s Indian army was around 250,000 strong by the 1850s and overwhelmingly Indian; its British officers were a thin layer on top. It was paid out of Indian land revenue, beginning with Bengal\'s. Indian taxpayers bought the soldiers who took India.',
    cite: {
      author: 'Douglas M. Peers',
      work: 'India under Colonial Rule 1700–1885',
      year: 2006, kind: 'book',
      publisher: 'Pearson Longman',
      supports: 'The size, composition and funding of the Company\'s Indian armies — the figure of roughly a quarter of a million by the 1850s, overwhelmingly Indian, paid from Indian land revenue.',
    },
  },
  {
    from: 'british-india', to: 'aden-colony', year: 1839,
    text: 'Aden was stormed by an expedition from Bombay',
    backText: 'the empire that took it, and paid for it',
    section: 'taken',
    because: 'Aden was taken in 1839 by a Bombay Marine expedition, on Indian revenue, to coal the steamers on the run to Suez. It was governed from Bombay as part of British India until 1937. A piece of empire that India took, ran and paid for.',
    cite: {
      author: 'Robert J. Gavin',
      work: 'Aden Under British Rule 1839–1967',
      year: 1975, kind: 'book',
      publisher: 'C. Hurst',
      supports: 'The Bombay expedition of 1839, the coaling station, and Aden\'s administration from India until 1937.',
    },
  },
  {
    from: 'british-india', to: 'egypt', year: 1882,
    text: 'Egypt was occupied to hold the short route to India',
    backText: 'the reason the canal mattered',
    section: 'taken',
    because: 'The Suez Canal opened in 1869 and cut thousands of miles off the voyage to Bombay. Britain bought the Khedive\'s canal shares in 1875, occupied the country in 1882, and stayed 74 years without ever annexing it. Egypt\'s importance to Britain was, very largely, India\'s importance.',
    cite: {
      author: 'Ronald Robinson and John Gallagher, with Alice Denny',
      work: 'Africa and the Victorians: The Official Mind of Imperialism',
      year: 1961, kind: 'book',
      publisher: 'Macmillan',
      supports: 'The argument that the 1882 occupation of Egypt was driven by the security of the route to India.',
    },
  },
  {
    from: 'british-india', to: 'hong-kong', year: 1841,
    text: 'opium grown in India paid for tea bought in China',
    backText: 'where the opium came from',
    section: 'taken',
    because: 'The Company balanced its enormous purchases of Chinese tea by selling Indian opium into China. When Beijing destroyed the stocks at Canton in 1839 Britain went to war, and took Hong Kong as the base for a trade that began in Bengal and Bihar.',
    cite: {
      author: 'Julia Lovell',
      work: 'The Opium War: Drugs, Dreams and the Making of China',
      year: 2011, kind: 'book',
      publisher: 'Picador',
      supports: 'The Indian opium trade, the Canton crisis of 1839 and the cession of Hong Kong.',
    },
  },
  {
    from: 'british-india', to: 'mesopotamia-iraq', year: 1914,
    text: 'Iraq was taken by an Indian army',
    backText: 'the army that took it',
    section: 'taken',
    because: 'The force that landed at Fao in November 1914 was Indian Expeditionary Force D, sent from India to cover the head of the Gulf and the oil that fuelled the Royal Navy. The mandate Britain held after 1920 rested on a campaign fought largely by Indian soldiers.',
    cite: {
      author: 'Charles Townshend',
      work: 'When God Made Hell: The British Invasion of Mesopotamia and the Creation of Iraq 1914–1921',
      year: 2010, kind: 'book',
      publisher: 'Faber',
      supports: 'The Indian Army\'s landing at Fao in 1914 and the Indian government\'s role in the Mesopotamia campaign.',
    },
  },
  {
    from: 'british-india', to: 'afghanistan', year: 1839,
    text: 'Britain invaded Afghanistan for India, not for Afghanistan',
    backText: 'the country the wars were fought for',
    section: 'taken',
    because: 'Britain went into Afghanistan in 1839 and again in 1878 to keep a Russian-leaning ruler off the passes into the Punjab. It never administered the country. Afghanistan is on an imperial map as a buffer, which is a thing India made it.',
    cite: {
      author: 'William Dalrymple',
      work: 'Return of a King: The Battle for Afghanistan',
      year: 2013, kind: 'book',
      publisher: 'Bloomsbury',
      supports: 'The 1839 invasion, the Army of the Indus and the reasoning behind the forward policy.',
    },
  },
  {
    from: 'british-india', to: 'british-burma', year: 1826,
    text: 'Burma was conquered by the Indian Army and ruled as a province of India',
    backText: 'the empire it was governed from',
    section: 'taken',
    because: 'Three wars — 1824, 1852, 1885 — were fought by the Company\'s and then the Indian Army, and Burma was administered as a province of British India until 1937. Burmese objections to being governed from Delhi are part of why it was separated.',
    cite: {
      author: 'Thant Myint-U',
      work: 'The Making of Modern Burma',
      year: 2001, kind: 'book',
      publisher: 'Cambridge University Press',
      supports: 'The Anglo-Burmese wars and Burma\'s administration as a province of British India.',
    },
  },
  {
    from: 'british-india', to: 'straits-settlements', year: 1826,
    text: 'Penang, Malacca and Singapore were run from Calcutta',
    backText: 'the presidency that governed them',
    section: 'status',
    because: 'The Straits Settlements were an East India Company presidency until 1867, staffed and paid from India. They were stations on the China run, and the China run was an Indian business before it was a British one.',
    cite: {
      author: 'Anthony Webster',
      work: 'Gentlemen Capitalists: British Imperialism in South East Asia 1770–1890',
      year: 1998, kind: 'book',
      publisher: 'Tauris',
      supports: 'The Straits Settlements, the China route and the commercial interests behind British expansion in the archipelago.',
    },
  },
  {
    from: 'british-india', to: 'mauritius', year: 1810,
    text: 'Mauritius was taken because French frigates based there were taking East Indiamen',
    backText: 'the shipping the island threatened',
    section: 'taken',
    because: 'The island\'s value to Britain was not its sugar but its position: from Port Louis, French cruisers could reach the Company\'s homeward convoys. Britain took it in 1810 and never gave it back, which is what a sea road looks like on a map.',
    cite: {
      author: 'Auguste Toussaint',
      work: 'History of Mauritius',
      year: 1977, kind: 'book',
      publisher: 'Macmillan',
      supports: 'The 1810 capture, the Indian Ocean campaign and Mauritius\'s place on the route to India.',
    },
  },
  {
    from: 'british-india', to: 'saint-helena', year: 1700,
    text: 'St Helena was a Company island, victualling the ships on the India run',
    backText: 'the run the island existed to serve',
    section: 'status',
    because: 'The East India Company held St Helena from 1659 and settled it to water and provision East Indiamen on the long haul home. It is on this map because a sailing route needed a stop in the South Atlantic.',
    cite: {
      author: 'Stephen A. Royle',
      work: 'The Company\'s Island: St Helena, Company Colonies and the Colonial Endeavour',
      year: 2007, kind: 'book',
      publisher: 'I. B. Tauris',
      supports: 'St Helena as an East India Company victualling station on the homeward run.',
    },
  },
  {
    from: 'british-india', to: 'cape-colony', year: 1795,
    text: 'the Cape was taken twice for the same reason: it commanded the sea road to India',
    backText: 'the route it commanded',
    section: 'taken',
    because: 'Britain took the Cape from the Dutch in 1795, handed it back in 1803, and took it again in 1806. There was no canal; every ship to India rounded the Cape, and the power holding Table Bay could close the route.',
    cite: {
      author: 'Robert Ross',
      work: 'A Concise History of South Africa',
      year: 2008, kind: 'book',
      publisher: 'Cambridge University Press',
      supports: 'The 1795 and 1806 British occupations of the Cape and their strategic rationale.',
    },
  },
  {
    from: 'british-india', to: 'persia-iran', year: 1907,
    text: 'Persia was a place Britain wanted no one else to hold',
    backText: 'the frontier being defended',
    section: 'status',
    because: 'Britain never ruled Persia. It bounded Persian policy for a century, and after 1908 the oil at Masjid-i-Suleiman fuelled the Royal Navy. Both interests — the land approach to India and the fuel for the fleet that guarded it — begin in India.',
    cite: {
      author: 'Firuz Kazemzadeh',
      work: 'Russia and Britain in Persia 1864–1914: A Study in Imperialism',
      year: 1968, kind: 'book',
      publisher: 'Yale University Press',
      supports: 'The 1907 Anglo-Russian Convention and the partition of Persia into spheres.',
    },
  },
  {
    from: 'british-india', to: 'hyderabad', year: 1948,
    text: 'two fifths of the subcontinent was never British territory',
    backText: 'the empire it was inside, and not part of',
    section: 'status',
    because: 'Some 565 princely states kept their own rulers under British paramountcy. That is why in 1947 the map had to be assembled state by state, why Junagadh needed a plebiscite, and why the Indian Army entered Hyderabad in September 1948.',
    cite: {
      author: 'Ian Copland',
      work: 'The Princes of India in the Endgame of Empire 1917–1947',
      year: 1997, kind: 'book',
      publisher: 'Cambridge University Press',
      supports: 'The princely states, their number and status, and their accession in 1947–48. The count of about 565 is the standard one; the states were never a fixed list, and the figure varies with what is counted as a state.',
    },
  },
  {
    from: 'singapore', to: 'federated-malay-states', year: 1874,
    text: 'Singapore\'s merchants pushed Britain up the peninsula',
    backText: 'the port that wanted the tin',
    section: 'taken',
    because: 'Singapore\'s trading houses had money in the Malay tin states and pressed London to end the fighting there. The Pangkor Engagement of 1874 put a Resident beside the Sultan of Perak whose advice had to be taken, and that formula was then applied state by state.',
    cite: {
      author: 'Anthony Webster',
      work: 'Gentlemen Capitalists: British Imperialism in South East Asia 1770–1890',
      year: 1998, kind: 'book',
      publisher: 'Tauris',
      supports: 'The Pangkor Engagement of 1874 and the extension of the Residential system into the Malay states.',
    },
  },

  /* ============================================ THE ATLANTIC SYSTEM == */
  {
    from: 'barbados', to: 'jamaica', year: 1655,
    text: 'Barbados showed what sugar could earn, and Jamaica was taken to repeat it',
    backText: 'the island the model came from',
    section: 'taken',
    because: 'By the 1650s Barbados was the richest thing England owned, on 166 square miles of sugar worked by enslaved Africans. Cromwell\'s Western Design failed at Hispaniola and took Jamaica instead — twenty-six times the land, and Barbadian planters among the first to move in.',
    cite: {
      author: 'Richard S. Dunn',
      work: 'Sugar and Slaves: The Rise of the Planter Class in the English West Indies 1624–1713',
      year: 1972, kind: 'book',
      publisher: 'University of North Carolina Press',
      supports: 'Barbadian planters, the sugar revolution and the settlement of Jamaica and the Leewards by Barbadian emigrants.',
    },
  },
  {
    from: 'barbados', to: 'cape-coast-castle', year: 1700,
    text: 'the plantations were the demand end of the trade the forts supplied',
    backText: 'the plantations this trade supplied',
    section: 'why',
    because: 'A sugar island consumed the people it enslaved and required constant replacement. The forts on the Gold Coast existed to meet that demand. The two ends are one system, and neither can be explained on its own.',
    cite: {
      author: 'Richard S. Dunn',
      work: 'Sugar and Slaves: The Rise of the Planter Class in the English West Indies 1624–1713',
      year: 1972, kind: 'book',
      publisher: 'University of North Carolina Press',
      supports: 'The wealth of Barbados relative to its size — the island is about 166 square miles — and its demand for enslaved labour from the West African forts.',
    },
  },
  {
    from: 'virginia', to: 'barbados', year: 1627,
    text: 'Barbados began with tobacco because Virginia had shown it could pay',
    backText: 'the colony whose crop was copied',
    section: 'taken',
    because: 'The first English settlers on Barbados planted tobacco in imitation of the Chesapeake. It was poor leaf and it did not sell, and in the 1640s the island turned to sugar — which needed capital, mills, and thousands of enslaved people rather than servants.',
    cite: {
      author: 'Richard S. Dunn',
      work: 'Sugar and Slaves: The Rise of the Planter Class in the English West Indies 1624–1713',
      year: 1972, kind: 'book',
      publisher: 'University of North Carolina Press',
      supports: 'The transfer of servants, capital and the plantation model between Virginia and Barbados in the 1620s.',
    },
  },
  {
    from: 'jamaica', to: 'sierra-leone', year: 1800,
    text: 'the Trelawny Town Maroons were deported to Freetown',
    backText: 'where these settlers were deported from',
    section: 'actors',
    because: 'After the second Maroon war of 1795 Jamaica shipped the Trelawny Town Maroons to Nova Scotia, and in 1800 on to Sierra Leone. They arrived in time to be used against a rising by the Nova Scotian settlers already there.',
    cite: {
      author: 'Mavis C. Campbell',
      work: 'The Maroons of Jamaica 1655–1796: A History of Resistance, Collaboration and Betrayal',
      year: 1988, kind: 'book',
      publisher: 'Bergin & Garvey',
      supports: 'The deportation of the Trelawny Town Maroons to Nova Scotia and their onward passage to Sierra Leone.',
    },
  },
  {
    from: 'nova-scotia', to: 'sierra-leone', year: 1792,
    text: 'the Black Loyalists sailed from Halifax and founded Freetown',
    backText: 'where the settlers came from',
    section: 'actors',
    because: 'About 1,200 Black Loyalists, promised land in Nova Scotia for leaving American slavery on the British side, were still waiting for it. In January 1792 they sailed for Sierra Leone and laid out the streets of Freetown themselves.',
    cite: {
      author: 'James W. St G. Walker',
      work: 'The Black Loyalists: The Search for a Promised Land in Nova Scotia and Sierra Leone 1783–1870',
      year: 1976, kind: 'book',
      publisher: 'Longman',
      supports: 'The Nova Scotian settlers — about 1,200 of them — who sailed to Freetown in January 1792, and what they had been promised.',
    },
  },
  {
    from: 'virginia', to: 'new-south-wales', year: 1788,
    text: 'when America closed, the convict ships turned to Botany Bay',
    backText: 'where the convicts had been sent before',
    section: 'taken',
    because: 'Britain had transported convicts to the American colonies for decades. Independence ended it, the prison hulks on the Thames filled, and in 1787 the First Fleet sailed for New South Wales instead. Australia\'s founding is a consequence of losing America.',
    cite: {
      author: 'Alan Frost',
      work: 'Botany Bay: The Real Story',
      year: 2011, kind: 'book',
      publisher: 'Black Inc.',
      supports: 'Why New South Wales was settled after the loss of the American convict destinations, and the debate over strategic versus penal motives.',
    },
  },
  {
    from: 'virginia', to: 'bermuda', year: 1612,
    text: 'Bermuda was settled by people shipwrecked on the way to Virginia',
    backText: 'the colony the ship was bound for',
    section: 'taken',
    because: 'The Sea Venture, carrying supplies and settlers to Jamestown, was driven onto Bermuda\'s reefs in a hurricane in 1609. The survivors built two small ships and went on, and the Virginia Company then claimed the island it had found by accident.',
    cite: {
      author: 'Michael J. Jarvis',
      work: 'In the Eye of All Trade: Bermuda, Bermudians and the Maritime Atlantic World 1680–1783',
      year: 2010, kind: 'book',
      publisher: 'University of North Carolina Press',
      supports: 'Bermuda\'s origin as a Virginia Company outpost and its Atlantic maritime economy.',
    },
  },
  {
    from: 'ireland', to: 'canada', year: 1847,
    text: 'the famine emigration filled the ships to Quebec',
    backText: 'where the emigrants of 1847 came from',
    section: 'why',
    because: 'Between 1845 and 1852 about a million people died in Ireland and about a million left. Food exports continued while they did. The cheapest passage was the timber ship to British North America, and the quarantine station at Grosse Île could not cope with what arrived.',
    cite: {
      author: 'Cormac Ó Gráda',
      work: 'Black \'47 and Beyond: The Great Irish Famine in History, Economy and Memory',
      year: 1999, kind: 'book',
      publisher: 'Princeton University Press',
      supports: 'Famine emigration, the 1847 crossings and mortality among emigrants to British North America.',
    },
  },

  /* ================================== THE ROUTE, AND THE MEDITERRANEAN == */
  {
    from: 'egypt', to: 'anglo-egyptian-sudan', year: 1899,
    text: 'Sudan was taken in Egypt\'s name to hold the Nile above Egypt',
    backText: 'the country whose river this was',
    section: 'taken',
    because: 'Egypt lives on the Nile, and Britain lived on Egypt. The reconquest of 1896–98 was fought by an Anglo-Egyptian army and the country was then run as a condominium — legally Egyptian, actually British — so that no other power could touch the headwaters.',
    cite: {
      author: 'M. W. Daly',
      work: 'Empire on the Nile: The Anglo-Egyptian Sudan 1898–1934',
      year: 1986, kind: 'book',
      publisher: 'Cambridge University Press',
      supports: 'The reconquest of the Sudan, the condominium of 1899 and its government from Cairo.',
    },
  },
  {
    from: 'egypt', to: 'cyprus', year: 1878,
    text: 'Cyprus was taken as a place to watch the eastern Mediterranean',
    backText: 'the region it was taken to watch',
    section: 'taken',
    because: 'Britain took the administration of Cyprus from the Ottoman Empire in 1878, four years before occupying Egypt, under a convention that left Ottoman sovereignty on paper. It was a station on the same road: Gibraltar, Malta, Cyprus, Suez, Aden, Bombay.',
    cite: {
      author: 'Andrekos Varnava',
      work: 'British Imperialism in Cyprus 1878–1915: The Inconsequential Possession',
      year: 2009, kind: 'book',
      publisher: 'Manchester University Press',
      supports: 'The 1878 convention, the reasons given for taking Cyprus and how quickly they were overtaken by Egypt.',
    },
  },
  {
    from: 'egypt', to: 'malta', year: 1800,
    text: 'Malta was taken from the garrison Napoleon left behind on his way to Egypt',
    backText: 'the campaign that put a French garrison on Malta',
    section: 'taken',
    because: 'Bonaparte seized Malta in 1798 en route to Egypt. The Maltese rose, the Royal Navy blockaded, and the French surrendered in 1800. Britain kept the island because Grand Harbour is the best naval base between Gibraltar and Suez.',
    cite: {
      author: 'Desmond Gregory',
      work: 'Malta, Britain and the European Powers 1793–1815',
      year: 1996, kind: 'book',
      publisher: 'Associated University Presses',
      supports: 'The Maltese rising against the French, the British occupation and Malta\'s value as a Mediterranean base.',
    },
  },
  {
    from: 'egypt', to: 'mandatory-palestine', year: 1917,
    text: 'Palestine was taken by an army based in Egypt, defending the canal',
    backText: 'the base the campaign started from',
    section: 'taken',
    because: 'The Egyptian Expeditionary Force was raised to hold the Suez Canal against Ottoman attack. It pushed north across Sinai, and the campaign that began as the defence of a waterway ended with Britain holding Jerusalem and, from 1920, a mandate.',
    cite: {
      author: 'James Barr',
      work: 'A Line in the Sand: Britain, France and the Struggle that Shaped the Middle East',
      year: 2011, kind: 'book',
      publisher: 'Simon & Schuster',
      supports: 'The 1917 campaign from Egypt into Palestine, Sykes-Picot and the reasoning behind British war aims in the region.',
    },
  },
  {
    from: 'gibraltar', to: 'minorca', year: 1708,
    text: 'both were taken in the same war, to put the Navy inside the Mediterranean',
    backText: 'the other station taken in that war',
    section: 'taken',
    because: 'Gibraltar in 1704 and Minorca in 1708 were taken in the War of the Spanish Succession for the same purpose: harbours inside the straits from which a fleet could operate all year. Minorca was traded away three times. Gibraltar never was.',
    cite: {
      author: 'Desmond Gregory',
      work: 'Minorca, the Illusory Prize: A History of the British Occupations of Minorca between 1708 and 1802',
      year: 1990, kind: 'book',
      publisher: 'Associated University Presses',
      supports: 'Port Mahon, the Mediterranean squadron and the relationship between the Minorca and Gibraltar stations.',
    },
  },

  /* ================================================ THE SCRAMBLE == */
  {
    from: 'uganda', to: 'kenya', year: 1901,
    text: 'the railway to Uganda is why the Kenyan highlands were settled',
    backText: 'the place the railway was built to reach',
    section: 'taken',
    because: 'The Uganda Railway was built from Mombasa to reach the protectorate at the head of the Nile. It cost far more than it earned, so the highlands along it were cleared of their owners and offered to European settlers to give the line freight.',
    cite: {
      author: 'Robert M. Maxon',
      work: 'East Africa: An Introductory History',
      year: 2009, kind: 'book',
      publisher: 'West Virginia University Press',
      supports: 'The Uganda Railway, the reasons for building it and the settlement of the Kenya highlands that followed it.',
    },
  },
  {
    from: 'egypt', to: 'uganda', year: 1894,
    text: 'the Nile headwaters became British because Egypt was British',
    backText: 'the country downstream',
    section: 'why',
    because: 'Once Britain occupied Egypt it could not tolerate another power at the source of the river Egypt depends on. That strategic anxiety — not trade — is the usual explanation for the protectorate at the head of the Nile, and it is Robinson and Gallagher\'s central case.',
    cite: {
      author: 'Ronald Robinson and John Gallagher, with Alice Denny',
      work: 'Africa and the Victorians: The Official Mind of Imperialism',
      year: 1961, kind: 'book',
      publisher: 'Macmillan',
      supports: 'The argument that Uganda was taken to secure the headwaters of the Nile, and so Egypt.',
    },
  },
  {
    from: 'bechuanaland', to: 'southern-rhodesia', year: 1890,
    text: 'the road north ran through Bechuanaland',
    backText: 'the corridor the column came up',
    section: 'taken',
    because: 'Rhodes called Bechuanaland the Suez Canal to the interior. The protectorate of 1885 kept the corridor between the Transvaal and the Kalahari open, and the Pioneer Column went up it in 1890 to take Mashonaland for a chartered company.',
    cite: {
      author: 'Robert I. Rotberg',
      work: 'The Founder: Cecil Rhodes and the Pursuit of Power',
      year: 1988, kind: 'book',
      publisher: 'Oxford University Press',
      supports: 'The Rudd Concession, the British South Africa Company\'s charter and the Pioneer Column\'s route through Bechuanaland.',
    },
  },
  {
    from: 'gold-coast', to: 'ashanti', year: 1902,
    text: 'the coastal colony annexed Asante to own the routes to the interior',
    backText: 'the colony on the coast',
    section: 'taken',
    because: 'Four wars between 1824 and 1900 were fought over who controlled the trade roads from the forest to the sea. Britain annexed Asante in 1902, deported the Asantehene, and the gold and kola that had gone to Kumasi went to the coast instead.',
    cite: {
      author: 'Ivor Wilks',
      work: 'Asante in the Nineteenth Century: The Structure and Evolution of a Political Order',
      year: 1975, kind: 'book',
      publisher: 'Cambridge University Press',
      supports: 'Asante\'s wars with the Gold Coast colony, the 1896 deposition of Prempeh I and the annexation of 1902.',
    },
  },

  /* ============================ SETTLERS, AND WHO WAS REFUSED == */
  {
    from: 'upper-canada', to: 'canada', year: 1867,
    text: 'the risings of 1837 produced responsible government',
    backText: 'the rebellions that led to it',
    section: 'status',
    because: 'The rebellions in Upper and Lower Canada brought Durham to Canada and his report in 1839. Responsible government followed in the 1840s and Confederation in 1867. Britain conceded to settlers, within thirty years, what it refused to colonised subjects for another century.',
    cite: {
      author: 'Ged Martin',
      work: 'Britain and the Origins of Canadian Confederation 1837–67',
      year: 1995, kind: 'book',
      publisher: 'Macmillan',
      supports: 'British policy towards confederation, defence costs after 1865 and the passage of the British North America Act.',
    },
  },
  {
    from: 'transvaal-colony', to: 'union-of-south-africa', year: 1910,
    text: 'the peace of 1902 deferred the African franchise, and the deferral was the decision',
    backText: 'the treaty that deferred it',
    section: 'status',
    because: 'Vereeniging in 1902 left the question of a vote for Africans to be settled by a future self-governing parliament. When that parliament met in 1910 it was white, and it closed the question. Postponing a right until your opponents hold the vote is a way of refusing it.',
    cite: {
      author: 'Leonard M. Thompson',
      work: 'The Unification of South Africa 1902–1910',
      year: 1960, kind: 'book',
      publisher: 'Oxford University Press',
      supports: 'The National Convention, the franchise settlement and the terms on which the Union was formed.',
    },
  },
  {
    from: 'new-zealand', to: 'new-zealand', year: 1863,
    text: 'the Treaty promised rangatiratanga; the 1863 Act confiscated the land',
    backText: 'the treaty the confiscations broke',
    section: 'ended',
    because: 'The Māori text of Waitangi guaranteed te tino rangatiratanga — full chieftainship — over lands and treasures. The New Zealand Settlements Act 1863 confiscated more than a million hectares from iwi declared to be in rebellion. The argument about what the translation meant was settled by confiscation.',
    cite: {
      author: 'Vincent O\'Malley',
      work: 'The Great War for New Zealand: Waikato 1800–2000',
      year: 2016, kind: 'book',
      publisher: 'Bridget Williams Books',
      supports: 'The invasion of the Waikato and the confiscations under the New Zealand Settlements Act 1863.',
    },
  },
  {
    from: 'kenya', to: 'southern-rhodesia', year: 1930,
    text: 'the white highlands and the Land Apportionment Act are the same instrument',
    backText: 'the other settler colony built on reserved land',
    section: 'status',
    because: 'Both colonies reserved the best land for Europeans by law and pushed Africans onto reserves — Kenya from 1915 and 1930, Southern Rhodesia by the Land Apportionment Act of 1930. Kenya\'s ended in 1963 after a war; Rhodesia\'s took until 1980, and a longer one.',
    cite: {
      author: 'Dane Kennedy',
      work: 'Islands of White: Settler Society and Culture in Kenya and Southern Rhodesia 1890–1939',
      year: 1987, kind: 'book',
      publisher: 'Duke University Press',
      supports: 'The parallel settler societies of Kenya and Southern Rhodesia and the political claims they made on London.',
    },
  },

  /* ================================================ THE ENDING == */
  {
    from: 'egypt', to: 'gold-coast', year: 1957,
    text: 'after Suez, Britain could not act alone, and it showed',
    backText: 'the crisis five months earlier',
    section: 'ended',
    because: 'In 1956 the United States and the Soviet Union together forced Britain out of Egypt within days. Ghana became independent five months later. Historians argue over how far Suez changed the timetable; what is not in doubt is that the limit on British power had been made public.',
    cite: {
      author: 'John Darwin',
      work: 'Britain and Decolonisation: The Retreat from Empire in the Post-War World',
      year: 1988, kind: 'book',
      publisher: 'Macmillan',
      supports: 'The sequence of West African independence after Suez and the Cabinet\'s reassessment of the cost of holding on.',
    },
  },
  {
    from: 'british-india', to: 'mandatory-palestine', year: 1947,
    text: 'the empire\'s reason for the Middle East went home in 1947',
    backText: 'the possession the region protected',
    section: 'ended',
    because: 'Aden, the Gulf treaties, Suez, Palestine and Iraq were held, in the first place, to protect the route to India and the army India paid for. India left in August 1947; Palestine was handed to the United Nations in 1947 and abandoned in 1948.',
    cite: {
      author: 'Wm. Roger Louis',
      work: 'The British Empire in the Middle East 1945–1951: Arab Nationalism, the United States and Postwar Imperialism',
      year: 1984, kind: 'book',
      publisher: 'Oxford University Press',
      supports: 'The 1947 referral of Palestine to the United Nations and the connection to the withdrawal from India.',
    },
  },
  {
    from: 'weihaiwei', to: 'hong-kong', year: 1898,
    text: 'both leases were taken in 1898, to answer other people\'s leases',
    backText: 'the other lease of 1898',
    section: 'taken',
    because: 'Russia leased Port Arthur and Germany Kiaochow. Britain answered in the same year with Weihaiwei and the New Territories. Three of the four were leases with an end date, which is why Hong Kong had to be given back and Weihaiwei was handed over in 1930.',
    cite: {
      author: 'Peter Wesley-Smith',
      work: 'Unequal Treaty 1898–1997: China, Great Britain and Hong Kong\'s New Territories',
      year: 1980, kind: 'book',
      publisher: 'Oxford University Press',
      supports: 'The 1898 leases of Weihaiwei and the New Territories, and the expiry that decided 1997.',
    },
  },
  {
    from: 'ireland', to: 'great-britain', year: 1847,
    text: 'relief was cut off on the doctrine that Irish property must pay for Irish poverty',
    backText: 'the government that made the policy',
    section: 'why',
    because: 'In 1847 the Treasury shifted the cost of famine relief onto Irish poor rates, on the principle that Irish property should support Irish poverty, while grain continued to leave Irish ports. Amartya Sen\'s argument is that famine is a failure of entitlement, not of harvest.',
    cite: {
      author: 'Cormac Ó Gráda',
      work: 'Ireland: A New Economic History 1780–1939',
      year: 1994, kind: 'book',
      publisher: 'Oxford University Press',
      supports: 'Irish population, emigration and labour in Britain across the famine decades.',
    },
  },
];

/* ------------------------------------------------------------------ index -- */

const FROM = new Map();
const TO = new Map();
for (const c of CAUSES) {
  if (!FROM.has(c.from)) FROM.set(c.from, []);
  FROM.get(c.from).push(c);
  if (!TO.has(c.to)) TO.set(c.to, []);
  TO.get(c.to).push(c);
}

/**
 * Every authored cause that should render a chip on this territory's dossier,
 * normalised into the shape claims.js consumes.
 *
 *   direction 'forward'  this place is the cause; the chip goes to the effect
 *   direction 'back'     this place is the effect; the chip goes to the cause
 *
 * Both print the same authored reason, because it is the same statement.
 */
export function causesFor(territoryId) {
  const out = [];
  for (const c of FROM.get(territoryId) || []) {
    out.push({
      to: c.to,
      year: c.year,
      word: 'because',
      text: c.text,
      because: c.because,
      cite: c.cite || null,
      section: c.section || null,
      direction: 'forward',
    });
  }
  for (const c of TO.get(territoryId) || []) {
    if (c.from === c.to) continue;      /* a self-link is printed once, forward */
    out.push({
      to: c.from,
      year: c.backYear != null ? c.backYear : c.year,
      word: 'this happened because of',
      text: c.backText || c.text,
      because: c.because,
      cite: c.cite || null,
      section: c.backSection || 'why',
      direction: 'back',
    });
  }
  return out;
}

/** Does this atlas state a cause for this place, in either direction? */
export function hasCause(territoryId) {
  return FROM.has(territoryId) || TO.has(territoryId);
}

export const CAUSE_COUNT = CAUSES.length;

/* Every causal claim in this table is a claim, so every one carries a source.
   Round 4's critic found 42 substantive historical statements hard-coded here
   with no citation field at all, four of them carrying rendered quantities —
   "around 250,000 strong by the 1850s", "some 565 princely states", "166
   square miles", "about 1,200 Black Loyalists" — which reached students with
   nothing behind them and no [unsourced] mark either. There is now one `cite`
   per link, it renders under the reason at reading size through the same
   renderSource() as everything else, and this audit is published so a missing
   one is findable without reading the file. */
export function auditCauses() {
  const bad = [];
  for (const c of CAUSES) {
    const id = c.from + '→' + c.to + '@' + c.year;
    if (!c.because) bad.push({ id, missing: 'because' });
    if (!c.cite) { bad.push({ id, missing: 'cite' }); continue; }
    for (const k of ['author', 'work', 'year', 'kind', 'supports']) {
      if (!c.cite[k]) bad.push({ id, missing: 'cite.' + k });
    }
  }
  return bad;
}
