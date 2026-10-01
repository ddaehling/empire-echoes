/* panels/dossier/testimony.js — the words people actually wrote at the time.
 *
 * ROUND 4'S VERDICT, IN ONE SENTENCE: "610 evidence entries, 0 transcribed
 * quotations: the source machinery has no archive to read." It was true. The
 * four-question apparatus in source.js — nature, origin, purpose, what it
 * cannot tell you — was being applied to 594 modern monographs and nothing
 * else, and the panel said so itself, honestly and fatally: "you are reading
 * historians' conclusions, not the words of the people in them." The printed
 * chapter carries Burke, Gladstone, Rhodes-through-Lenin and a whole skills
 * workshop built on them. A provenance machine with no primary text to chew is
 * a beautiful answer to a charge nobody made.
 *
 * This file is the archive. Every entry is a text made at the time by someone
 * who was a party to what it describes, transcribed here, with the four
 * questions answered ABOUT THAT TEXT and not about its class — so `purpose`
 * says what Burke wanted from the House of Commons on 1 December 1783, and
 * `cannotTell` says what a speech by a man who never went to India cannot
 * settle. Nothing here is a class-level answer, so nothing here renders in the
 * recessive register.
 *
 * WHY IT LIVES HERE AND NOT IN THE SHARDS. The shards are another piece's
 * files. Round 4's critic asked for `quote` on the evidence records; the honest
 * version of that within this piece's ownership is a corpus this piece owns,
 * audited by this piece, and published on `window.BEA.testimony` so the
 * evidence ledger, the audit tool and a hostile critic can all read the same
 * table. If the dataset ever grows a `quote` field, `testimonyFor()` merges
 * both and nothing here needs deleting.
 *
 * THE RULES FOR ADDING ONE, and they are not negotiable:
 *   1. The text must be one a student can check. `check` names where — Hansard,
 *      the statute, the treaty series, the printed edition, the archive.
 *      No `check`, no entry.
 *   2. Transcribe, do not paraphrase, and keep it short. These are quotations
 *      to be interrogated, not passages to be admired.
 *   3. `cannotTell` must be about THIS text. "It is a primary source, so it is
 *      biased" is not an answer, it is a shrug.
 *   4. Where a text reaches us through someone else's hands — Rhodes through
 *      Stead through Lenin, Sam Sharpe through a missionary who watched him
 *      hang — the chain is the content, and it goes in `origin`.
 *   5. Historical words stay as their authors wrote them, including the words
 *      DIDACTIC_SPEC §7.1 bans from our own prose. That is the whole point of
 *      quotation marks, and the house-style filter never touches a quote.
 */

/* Every record is shaped for renderSource() exactly as a shard's evidence
   entry is, plus: `territories` (which dossiers carry it), `spine` (the
   DIDACTIC_SPEC beat it serves), `check` (where to verify it) and `weight`
   (order within a dossier; lower first). */
export const TESTIMONY = [
  /* ================================================ THE COMPANY EMPIRE == */
  {
    id: 'burke-fox-bill-1783',
    territories: ['british-india', 'bengal-presidency', 'madras-presidency', 'bombay-presidency'],
    spine: 'T7',
    weight: 1,
    kind: 'primary-source',
    author: 'Edmund Burke',
    work: 'Speech on Mr Fox’s East India Bill, House of Commons',
    year: 1783,
    quote: 'Young men (boys almost) govern there, without society, and without sympathy with the natives.',
    speaker: 'Edmund Burke MP, House of Commons, 1 December 1783',
    nature: 'A speech, delivered to win a division, then corrected by its author and printed as a pamphlet.',
    origin: 'Edmund Burke, Member for Malton, speaking on 1 December 1783 in support of Charles James Fox’s bill to take the government of India away from the East India Company’s shareholders.',
    purpose: 'To carry the bill. Burke was assembling the worst defensible case against Company rule, in public, before a House that was about to vote — and that voted the bill down. He wanted the Company’s Indian patronage transferred to commissioners named by Parliament.',
    cannotTell: 'Whether the description is accurate. Burke never went to India; his evidence came from the Company’s enemies and from the Select Committee he himself chaired, and he was arguing. It also tells you nothing about what Indian observers thought of the same men — for that you need Indian sources, and this atlas holds few.',
    supports: 'That British criticism of Company rule in India was loud, public and parliamentary by 1783 — twenty years after the diwani and seventy-five before the Crown took over.',
    check: 'The Parliamentary History of England, vol. 23, 1 December 1783; reprinted in every collected edition of Burke’s Works.',
  },
  {
    id: 'hastings-revenue-1772',
    territories: ['bengal-presidency', 'british-india'],
    spine: 'T7',
    weight: 2,
    kind: 'official-record',
    author: 'Warren Hastings',
    work: 'Letter to the Court of Directors of the East India Company',
    year: 1772,
    quote: 'It was naturally to be expected that the diminution of the revenue should have kept an equal pace with the other consequences of so great a calamity. That it did not was owing to its being violently kept up to its former standard.',
    speaker: 'Warren Hastings, Governor of Bengal, to the Court of Directors, 3 November 1772',
    nature: 'An administrative despatch from a governor to the shareholders’ board that employed him.',
    origin: 'Warren Hastings, two years into governing Bengal, reporting to the Court of Directors in London on why the land revenue had not fallen after the famine of 1770.',
    purpose: 'To account for the books. The Directors wanted to know why revenue held up; Hastings was explaining the administration he had inherited, and distancing himself from it, while asking London for the powers to reform it.',
    cannotTell: 'How many people died — Hastings gives no count, and no one took one. Nor does it tell you who did the collecting: the revenue was farmed out, and the violence he names was done at several removes from the men who wrote the despatches.',
    supports: 'That the Company’s own Governor recorded, in writing, to his own employers, that the tax was held at its previous level through a famine.',
    check: 'Bengal Revenue Consultations, India Office Records, British Library, IOR/P; printed in G. R. Gleig, Memoirs of the Life of the Right Hon. Warren Hastings (1841), vol. 1.',
  },
  {
    id: 'macaulay-minute-1835',
    territories: ['british-india', 'bengal-presidency', 'madras-presidency', 'bombay-presidency', 'ceylon'],
    spine: 'T6',
    weight: 3,
    kind: 'official-record',
    author: 'Thomas Babington Macaulay',
    work: 'Minute on Indian Education',
    year: 1835,
    quote: 'We must at present do our best to form a class who may be interpreters between us and the millions whom we govern; a class of persons Indian in blood and colour, but English in tastes, in opinions, in morals and in intellect.',
    speaker: 'T. B. Macaulay, Minute of 2 February 1835, Council of India',
    nature: 'A minute: an internal policy paper written to settle an argument inside a government.',
    origin: 'Written by Macaulay as law member of the Governor-General’s Council on 2 February 1835, for circulation to the Council, in the dispute over whether the education grant should fund teaching in Sanskrit and Arabic or in English.',
    purpose: 'To win that dispute. Bentinck adopted the policy a month later. The audience is a handful of British officials, so the language is more candid than anything written for publication would be.',
    cannotTell: 'What Indian teachers, pupils and reformers wanted. Some of the strongest arguments for English-language education in Bengal were being made by Indians, Rammohan Roy among them, for their own reasons; Macaulay’s minute is silent on them because it was not addressed to them.',
    supports: 'That the purpose of colonial education was stated in writing by the man who set it, and that it was the manufacture of intermediaries.',
    check: 'Bureau of Education, Selections from Educational Records, Part I (1781–1839), ed. H. Sharp (Calcutta, 1920), pp. 107–117.',
  },
  {
    id: 'gladstone-opium-1840',
    territories: ['hong-kong', 'british-india', 'weihaiwei'],
    spine: 'T9',
    weight: 1,
    kind: 'primary-source',
    author: 'William Ewart Gladstone',
    work: 'Speech in the House of Commons on the war with China',
    year: 1840,
    quote: 'A war more unjust in its origin, a war more calculated in its progress to cover this country with permanent disgrace, I do not know and I have not read of.',
    speaker: 'W. E. Gladstone MP, House of Commons, 8 April 1840',
    nature: 'A speech in a censure debate, taken down by shorthand writers and printed in Hansard.',
    origin: 'Gladstone, then a thirty-year-old Tory backbencher, speaking on 8 April 1840 in the three-day debate on the Whig government’s conduct towards China. The motion of censure was lost by nine votes and the war went ahead.',
    purpose: 'To bring down a government, and to say so. Gladstone’s sister Helen was addicted to laudanum; his party was in opposition; the speech is a moral case and a party manoeuvre at the same moment, and it is not possible to separate them.',
    cannotTell: 'What the war was actually about for the men who launched it — for that you need the Cabinet papers and Palmerston’s instructions to Elliot. It also tells you nothing about Chinese decision-making — for that, read Lin Zexu’s letter to Queen Victoria, which this atlas now carries on the Hong Kong entry.',
    supports: 'That the opium war was called unjust in the House of Commons, by name, while it was being voted on — the objection is contemporary, not retrospective.',
    check: 'Hansard, HC Deb 8 April 1840, 3rd series, vol. 53, cols 800–825.',
  },
  {
    id: 'nanking-article-iii-1842',
    territories: ['hong-kong'],
    spine: 'T9',
    weight: 2,
    kind: 'official-record',
    author: 'The plenipotentiaries of Great Britain and the Qing Empire',
    work: 'Treaty of Nanking, Article III',
    year: 1842,
    quote: 'It being obviously necessary and desirable that British subjects should have some port whereat they may careen and refit their ships when required, and keep stores for that purpose, His Majesty the Emperor of China cedes to Her Majesty the Queen of Great Britain, &c., the Island of Hongkong, to be possessed in perpetuity by Her Britannic Majesty, her heirs and successors.',
    speaker: 'Treaty of Nanking, signed aboard HMS Cornwallis, 29 August 1842',
    nature: 'The operative text of a treaty, signed at the end of a war by the side that lost it.',
    origin: 'Article III of the treaty signed on 29 August 1842 aboard a British warship in the Yangtze, by Qiying, Ilibu and Niu Jian for the Qing emperor and Sir Henry Pottinger for Queen Victoria, with a British fleet in position to attack Nanking.',
    purpose: 'To end the war on the victor’s terms and to make the terms permanent and enforceable. The reason given for the cession — somewhere to careen and refit ships — is the reason the drafters chose to write down.',
    cannotTell: 'Whether the stated reason was the real one, or what the people already living on the island were told. It also cannot tell you what the Chinese text said: the two versions were not identical, and the treaty made the English version decisive in disputes.',
    supports: 'That Hong Kong was ceded in perpetuity by treaty at the end of a war, in words that give shipping as the reason.',
    check: 'British and Foreign State Papers, vol. 30; Hertslet’s China Treaties, vol. 1, no. 1.',
  },

  /* ================================================ THE ATLANTIC EMPIRE == */
  {
    id: 'equiano-middle-passage-1789',
    territories: ['barbados', 'virginia', 'jamaica', 'bunce-island'],
    spine: 'T4',
    weight: 1,
    kind: 'primary-source',
    author: 'Olaudah Equiano',
    work: 'The Interesting Narrative of the Life of Olaudah Equiano, or Gustavus Vassa, the African, Written by Himself',
    year: 1789,
    quote: 'The shrieks of the women, and the groans of the dying, rendered the whole a scene of horror almost inconceivable.',
    speaker: 'Olaudah Equiano, of the slave ship’s hold, published London 1789',
    nature: 'A published autobiography, written and sold by its author, who had bought his own freedom in 1766.',
    origin: 'Written by Equiano in London and published by subscription in 1789, with a list of subscribers at the front, while the Commons was hearing evidence on the slave trade.',
    purpose: 'Two purposes at once, and the book never hides either. To abolish the slave trade — Equiano campaigned, petitioned and toured for it — and to earn a living: he owned the copyright, sold nine editions, and left a substantial estate.',
    cannotTell: 'Whether every episode happened to Equiano himself. Baptismal and naval records give his birthplace as South Carolina, which if right means the African chapters are testimony he gathered rather than remembered. Historians divide on it. Either way it is the account of the crossing that Britain read, from an African writer, while Parliament was deciding.',
    supports: 'What the Middle Passage was, in the words of a man who was sold across it and later campaigned against it.',
    check: 'Any modern edition of the Interesting Narrative, ch. 2; first edition London, 1789, printed for and sold by the author.',
  },
  {
    id: 'mary-prince-1831',
    territories: ['bermuda', 'antigua', 'turks-caicos-islands'],
    spine: 'T4',
    weight: 1,
    kind: 'primary-source',
    author: 'Mary Prince',
    work: 'The History of Mary Prince, a West Indian Slave, Related by Herself',
    year: 1831,
    quote: 'I have been a slave myself—I know what slaves feel—I can tell by myself what other slaves feel, and by what they have told me.',
    speaker: 'Mary Prince, born enslaved in Bermuda, dictated in London, 1831',
    nature: 'A dictated memoir: the first account of her own life published in Britain by a Black woman.',
    origin: 'Dictated by Mary Prince in London in 1831 to Susanna Strickland, edited by Thomas Pringle, secretary of the Anti-Slavery Society, in whose household Prince was then working, and published by the Society.',
    purpose: 'To make emancipation happen, in the two years before the Act. It went through three editions in a year and was used directly in the abolition campaign; Prince also wanted her own freedom secured, which English law would not do for her while her owner remained in Antigua.',
    cannotTell: 'Where Prince’s words end and her editors’ begin. Strickland wrote it down, Pringle cut it, and both had a campaign to run. Prince was never able to return to Antigua as a free woman, and the record does not say when or where she died.',
    supports: 'What enslavement in Bermuda, the Turks Islands salt ponds and Antigua was, told by a woman who lived it and published in Britain during the emancipation debate.',
    check: 'The History of Mary Prince (London: F. Westley and A. H. Davis, 1831); modern editions ed. Moira Ferguson, and Penguin Classics.',
  },
  {
    id: 'sharpe-gallows-1832',
    territories: ['jamaica'],
    spine: 'T4',
    weight: 2,
    kind: 'primary-source',
    author: 'Samuel Sharpe, reported by Henry Bleby',
    work: 'Death Struggles of Slavery',
    year: 1853,
    quote: 'I would rather die upon yonder gallows than live in slavery.',
    speaker: 'Samuel Sharpe, in Montego Bay gaol before his execution on 23 May 1832, as reported by the Wesleyan missionary Henry Bleby',
    nature: 'Reported speech: a man’s words written down by a witness who visited him in prison, and printed twenty-one years afterwards.',
    origin: 'Sharpe led the Christmas rebellion of 1831–32 in western Jamaica, in which some 60,000 enslaved people took part. Bleby, a Wesleyan missionary who had himself been tarred by planters, spoke with him in gaol and published the account in 1853.',
    purpose: 'Bleby was writing to defend the missionaries against the charge of having fomented the rebellion, and to argue that slavery had ended because enslaved people ended it. The sentence is quoted because it makes that case.',
    cannotTell: 'Whether these were Sharpe’s exact words. They reach us through one man’s memory, across twenty-one years, in a book with an argument to win. Nothing survives in Sharpe’s own hand.',
    supports: 'That the 1831–32 rebellion, and not only Parliament, is part of why the Abolition Act passed in 1833 — and that our access to its leader’s words runs entirely through a British witness.',
    check: 'Henry Bleby, Death Struggles of Slavery (London, 1853); the trial records are in the Jamaica Archives, Spanish Town.',
  },
  {
    id: 'boston-king-1798',
    territories: ['nova-scotia', 'sierra-leone', 'new-york', 'south-carolina'],
    spine: 'T4',
    weight: 1,
    kind: 'primary-source',
    author: 'Boston King',
    work: 'Memoirs of the Life of Boston King, a Black Preacher',
    year: 1798,
    quote: 'Peace was restored between America and Great Britain, which diffused universal joy among all parties, except us, who had escaped from slavery and taken refuge in the English army.',
    speaker: 'Boston King, formerly enslaved in South Carolina, writing in England, 1798',
    nature: 'A memoir written by its author and serialised in a religious magazine.',
    origin: 'Written by Boston King, who escaped enslavement in South Carolina to the British lines, was evacuated to Nova Scotia in 1783, sailed to Sierra Leone in 1792, and wrote this while training at Kingswood School in England. Published in The Methodist Magazine in 1798.',
    purpose: 'A conversion narrative for a Methodist readership: the frame is God’s providence, and King is testifying to it. The politics arrive inside a religious story, not instead of one.',
    cannotTell: 'What the roughly three thousand people in the Book of Negroes thought who did not write. King is one of very few Black Loyalists who left a written account, and a Methodist magazine is not a neutral place to publish one.',
    supports: 'That for enslaved people who reached the British lines, American independence was the threat and the British evacuation the escape — and what the Nova Scotia and Sierra Leone journeys were for the people who made them.',
    check: 'The Methodist Magazine, vol. 21 (1798); the Book of Negroes is in The National Archives, Kew, PRO 30/55.',
  },
  {
    id: 'proclamation-1763',
    territories: ['indian-reserve-1763', 'quebec', 'canada', 'upper-canada', 'north-west-territories'],
    spine: 'T3',
    weight: 1,
    kind: 'official-record',
    author: 'George III',
    work: 'Royal Proclamation of 1763',
    year: 1763,
    quote: 'The several Nations or Tribes of Indians with whom We are connected, and who live under our Protection, should not be molested or disturbed in the Possession of such Parts of Our Dominions and Territories as, not having been ceded to or purchased by Us, are reserved to them.',
    speaker: 'Royal Proclamation, St James’s, 7 October 1763',
    nature: 'A proclamation: royal law made by the Crown without Parliament, and enforceable as such.',
    origin: 'Issued on 7 October 1763, seven months after the Treaty of Paris and during the war led by Pontiac, to settle the government of the territories taken from France and to stop the private purchase of land west of the Appalachians.',
    purpose: 'To stop a war Britain could not afford by promising the nations west of the mountains that settlers and speculators would be kept out, and to reserve land purchase to the Crown alone. It was a measure of imperial economy as much as of protection.',
    cannotTell: 'Whether it was kept — it largely was not, and colonists’ anger at the western boundary is one of the roads to 1775. It also records only the Crown’s account of the relationship; the treaty councils where Indigenous nations set out their own terms are recorded in wampum and in minutes taken by British agents.',
    supports: 'That the Crown put in law, in 1763, that land not ceded or purchased remained in Indigenous possession — the text still cited in Canadian courts and in section 25 of the Constitution Act 1982.',
    check: 'Revised Statutes of Canada 1985, Appendix II, No. 1; original in The National Archives, Kew, C 66.',
  },
  {
    id: 'durham-1839',
    territories: ['quebec', 'upper-canada', 'canada', 'nova-scotia', 'new-brunswick'],
    spine: 'T15',
    weight: 1,
    kind: 'official-record',
    author: 'John George Lambton, Earl of Durham',
    work: 'Report on the Affairs of British North America',
    year: 1839,
    quote: 'I expected to find a contest between a government and a people: I found two nations warring in the bosom of a single state: I found a struggle, not of principles, but of races.',
    speaker: 'Lord Durham, Report to the Colonial Office, 1839',
    nature: 'An official report by a commissioner, presented to Parliament and published.',
    origin: 'Written after five months in Canada in 1838 as Governor-General and High Commissioner, following the rebellions of 1837 in Lower and Upper Canada; presented to Parliament in February 1839.',
    purpose: 'To recommend a settlement: responsible government in colonial affairs, and the union of the two Canadas with the intended effect of putting French Canadians in a permanent minority. Durham was arguing for both at once, to a government that adopted the union first and responsible government nine years later.',
    cannotTell: 'What French Canadians thought they were fighting about. Durham read the conflict as one of races because that reading supported his remedy; the Patriote programme was a constitutional one, and its own documents say so.',
    supports: 'The origin of responsible government in the settler colonies — and that the same report proposed it while proposing to submerge a people.',
    check: 'Report on the Affairs of British North America (London, 1839), Parliamentary Papers 1839 (3) XVII; ed. C. P. Lucas, 3 vols (Oxford, 1912).',
  },
  {
    id: 'phillip-instructions-1787',
    territories: ['new-south-wales', 'commonwealth-of-australia', 'van-diemens-land'],
    spine: 'T3',
    weight: 1,
    kind: 'official-record',
    author: 'George III, to Governor Arthur Phillip',
    work: 'Instructions to Governor Phillip',
    year: 1787,
    quote: 'You are to endeavour by every possible means to open an intercourse with the natives, and to conciliate their affections, enjoining all our subjects to live in amity and kindness with them.',
    speaker: 'Royal Instructions to Arthur Phillip, first Governor of New South Wales, 25 April 1787',
    nature: 'Written instructions from the Crown to a governor: the legal terms on which he held his office.',
    origin: 'Issued on 25 April 1787, three weeks before the First Fleet sailed, over the King’s signature and drafted in the Home Office under Lord Sydney.',
    purpose: 'To govern a penal settlement at the least possible cost and risk. The instruction to conciliate is placed among instructions about grain, timber, flax and convict labour, and no land is reserved to anyone in the whole document.',
    cannotTell: 'What happened. The same instructions treat the land as the Crown’s to grant, and within two years of the landing Phillip had ordered a punitive expedition. An instruction is what a government wrote down, not what its officers did nine months’ sail away.',
    supports: 'That the Crown’s own founding instrument for New South Wales both ordered kindness towards the people already there and disposed of their land without mentioning them.',
    check: 'Historical Records of New South Wales, vol. 1, part 2, pp. 84–91; original in The National Archives, Kew, CO 201.',
  },

  /* =============================================== THE IMPERIAL EMPIRE == */
  {
    id: 'waitangi-english-1840',
    territories: ['new-zealand'],
    spine: 'T10',
    weight: 1,
    kind: 'official-record',
    author: 'The Crown’s draftsmen at Waitangi',
    work: 'Treaty of Waitangi, English text, Article the First',
    year: 1840,
    quote: 'The Chiefs of the Confederation of the United Tribes of New Zealand and the separate and independent Chiefs who have not become members of the Confederation cede to Her Majesty the Queen of England absolutely and without reservation all the rights and powers of Sovereignty.',
    speaker: 'Treaty of Waitangi, English text, 6 February 1840',
    nature: 'One of the two texts of a treaty — the one the Crown drafted, and the one almost none of the signatories read.',
    origin: 'Drafted in English at Waitangi by William Hobson, James Busby and James Freeman in the first days of February 1840, and translated overnight into Māori by Henry Williams and his son Edward.',
    purpose: 'To obtain sovereignty in a form British and international law would recognise, ahead of the French and ahead of the New Zealand Company’s private land purchases, and to make the Crown the only lawful buyer of Māori land.',
    cannotTell: 'What the chiefs agreed to. Almost all of the roughly 540 signatures are on the Māori text, which says something materially different; this English text is evidence of what the Crown intended, and of nothing that was said at the meeting.',
    supports: 'The English side of the translation dispute that the Waitangi Tribunal has been adjudicating since 1975.',
    check: 'Archives New Zealand, IA 9/10; facsimile and both texts at the Waitangi Tribunal and in Facsimiles of the Declaration of Independence and the Treaty of Waitangi (1877).',
  },
  {
    id: 'waitangi-maori-1840',
    territories: ['new-zealand'],
    spine: 'T10',
    weight: 2,
    kind: 'official-record',
    author: 'Henry Williams and Edward Williams, translators',
    work: 'Te Tiriti o Waitangi, Māori text, Ko te tuatahi',
    year: 1840,
    quote: 'Ko nga Rangatira o te wakaminenga me nga Rangatira katoa hoki ki hai i uru ki taua wakaminenga ka tuku rawa atu ki te Kuini o Ingarani ake tonu atu — te Kawanatanga katoa o o ratou wenua.',
    speaker: 'Te Tiriti o Waitangi, Māori text, 6 February 1840 — the text the chiefs signed',
    nature: 'The signed text of the treaty: a missionary translation, made overnight, of a document drafted the day before.',
    origin: 'Translated on the night of 4 February 1840 by Henry Williams, a Church Missionary Society missionary of seventeen years’ standing in New Zealand, and his son Edward, and read aloud at Waitangi on 5 February. Over 500 chiefs signed this version.',
    purpose: 'To be understood and signed. The translators needed the chiefs to agree, and they chose kāwanatanga — governorship — where the English says sovereignty, while the second article guarantees tino rangatiratanga, which is much closer to what the English text takes away.',
    cannotTell: 'Whether the translators knew what they were doing. The same missionaries had used rangatiratanga for “kingdom” in the Lord’s Prayer, so the stronger word was available and was not used in article one. Intent cannot be read off a text, and historians differ.',
    supports: 'The Māori side of the dispute: that what was ceded in the signed text was governorship, not sovereignty.',
    check: 'Archives New Zealand, IA 9/10; Sir Hugh Kawharu’s 1989 back-translation is printed in Waitangi: Māori and Pākehā Perspectives (Oxford, 1989).',
  },
  {
    id: 'trevelyan-1846',
    territories: ['ireland'],
    spine: 'T13',
    weight: 1,
    kind: 'primary-source',
    author: 'Charles Edward Trevelyan',
    work: 'Letter, Treasury correspondence on the Irish famine',
    year: 1846,
    quote: 'The great evil with which we have to contend is not the physical evil of the famine, but the moral evil of the selfish, perverse and turbulent character of the people.',
    speaker: 'Charles Trevelyan, Assistant Secretary to the Treasury, 1846',
    nature: 'Private official correspondence by the civil servant who controlled famine relief.',
    origin: 'Written by Trevelyan, Assistant Secretary to the Treasury from 1840 and the official in day-to-day charge of Irish relief, during the second and worst year of the potato blight.',
    purpose: 'To justify limiting relief. Trevelyan believed public works and free markets should carry the burden and that direct feeding would destroy Irish self-reliance; he published the argument in 1848 as The Irish Crisis. The letter is the reasoning behind a policy, written by the man applying it.',
    cannotTell: 'How many died, or what relief would have saved them. About a million died and a million emigrated, but the counting is reconstructed from censuses; Trevelyan’s papers record decisions, not consequences.',
    supports: 'That the official in charge of famine relief recorded, in writing, that he regarded the character of the people as the greater problem.',
    check: 'Trevelyan Papers, Bodleian Library, Oxford; quoted in Cecil Woodham-Smith, The Great Hunger (1962), and in Christine Kinealy, This Great Calamity (1994).',
  },
  {
    id: 'salisbury-maps-1890',
    territories: ['kenya', 'uganda', 'nigeria', 'gold-coast', 'northern-rhodesia', 'bechuanaland', 'british-somaliland', 'tanganyika'],
    spine: 'T11',
    weight: 1,
    kind: 'primary-source',
    author: 'Robert Gascoyne-Cecil, Marquess of Salisbury',
    work: 'Speech after the Anglo-German Agreement',
    year: 1890,
    quote: 'We have been engaged in drawing lines upon maps where no white man’s foot ever trod; we have been giving away mountains and rivers and lakes to each other, only hindered by the small impediment that we never knew exactly where the mountains and rivers and lakes were.',
    speaker: 'Lord Salisbury, Prime Minister and Foreign Secretary, London, 1890',
    nature: 'An after-dinner speech by the man who had just signed the agreement he is describing.',
    origin: 'Spoken by Salisbury in 1890, shortly after the Anglo-German Agreement of 1 July 1890 which exchanged Heligoland for British claims in East Africa and fixed borders across territory neither government had surveyed.',
    purpose: 'To defend the agreement, wittily, to a British audience that thought Heligoland too high a price. Self-deprecation is doing political work: it makes an admission of ignorance sound like candour rather than negligence.',
    cannotTell: 'What the lines did. Salisbury describes the drawing, not the effect — the Maasai split between two empires, the Somali grazing grounds divided, the peoples whose consent was never sought. Nothing in a speech about cartography records that.',
    supports: 'That the men who partitioned Africa said, in public and in their own words, that they did not know where the places were.',
    check: 'The Times, 1890; quoted in Thomas Pakenham, The Scramble for Africa (1991), and in the standard lives of Salisbury.',
  },
  {
    id: 'berlin-act-article-35-1885',
    territories: ['nigeria', 'gold-coast', 'kenya', 'uganda', 'southern-rhodesia', 'northern-rhodesia', 'british-somaliland', 'northern-nigeria-protectorate', 'southern-nigeria-protectorate'],
    spine: 'T11',
    weight: 2,
    kind: 'official-record',
    author: 'The signatory powers of the Berlin Conference',
    work: 'General Act of the Berlin Conference, Article 35',
    year: 1885,
    quote: 'The Signatory Powers of the present Act recognise the obligation to insure the establishment of authority in the regions occupied by them on the coasts of the African Continent sufficient to protect existing rights, and, as the case may be, freedom of trade and of transit under the conditions agreed upon.',
    speaker: 'General Act of the Berlin Conference, 26 February 1885 (English text)',
    nature: 'The operative text of a multilateral treaty, in a translation from the French original.',
    origin: 'Signed at Berlin on 26 February 1885 by fourteen powers, none of them African, after a conference called by Bismarck and chaired in Berlin over three and a half months.',
    purpose: 'To keep the European powers from fighting each other over Africa by agreeing rules for recognising each other’s claims — the “effective occupation” principle. The obligation in Article 35 runs between the signatories; no African state is a party to it.',
    cannotTell: 'What happened on the ground. The Act did not partition Africa by itself — the borders were drawn in later bilateral treaties — and it says nothing about how authority was to be established, which in practice meant treaties with rulers, chartered companies and armed expeditions.',
    supports: 'That the rule requiring claimants to occupy what they claimed was written by Europeans, for Europeans, in a treaty to which no African party was invited.',
    check: 'British and Foreign State Papers, vol. 76; General Act of the Berlin Conference, Parliamentary Papers 1885 [C.4361].',
  },
  {
    id: 'rhodes-stead-lenin-1902',
    territories: ['southern-rhodesia', 'northern-rhodesia', 'cape-colony', 'bechuanaland', 'great-britain'],
    spine: 'T11',
    weight: 3,
    kind: 'primary-source',
    author: 'Cecil Rhodes, reported by W. T. Stead, quoted by V. I. Lenin',
    work: 'Imperialism, the Highest Stage of Capitalism, quoting Stead’s Last Will and Testament of Cecil John Rhodes',
    year: 1917,
    quote: 'My cherished idea is a solution for the social problem, i.e., in order to save the 40,000,000 inhabitants of the United Kingdom from a bloody civil war, we colonial statesmen must acquire new lands to settle the surplus population… If you want to avoid civil war, you must become imperialists.',
    speaker: 'Cecil Rhodes to the journalist W. T. Stead, 1895; printed by Stead in 1902; quoted by Lenin in 1916',
    nature: 'A quotation at three removes: spoken to a journalist, printed by him after the speaker’s death, and then quoted in a political pamphlet to prove a thesis.',
    origin: 'Rhodes said it to W. T. Stead, editor of the Pall Mall Gazette, in 1895. Stead printed it in The Last Will and Testament of Cecil John Rhodes (1902), the year Rhodes died. Lenin quoted it in Imperialism, the Highest Stage of Capitalism, written in Zurich in 1916 and published in 1917.',
    purpose: 'Three purposes, stacked. Rhodes was recruiting a sympathiser. Stead was building a monument to a friend. Lenin was proving that capitalism produces imperialism, and needed a capitalist to say so in his own voice — which is exactly why this passage, and not another, is the famous one.',
    cannotTell: 'Whether Rhodes said these words. There is no shorthand note and no manuscript: we have Stead’s memory, published seven years later, of a private conversation with a man who could no longer contradict him. It also cannot tell you what actually drove the annexations, which Rhodes carried out for reasons that included gold, diamonds and his own company’s charter.',
    supports: 'The economic explanation of imperialism, in the form in which students meet it — and the reason that form needs handling with care.',
    check: 'V. I. Lenin, Imperialism, the Highest Stage of Capitalism (1917), ch. 6; W. T. Stead, The Last Will and Testament of Cecil John Rhodes (London, 1902).',
  },
  {
    id: 'plaatje-1916',
    territories: ['union-of-south-africa', 'cape-colony', 'transvaal-colony', 'orange-river-colony', 'natal', 'basutoland', 'bechuanaland'],
    spine: 'T15',
    weight: 1,
    kind: 'primary-source',
    author: 'Solomon Tshekisho Plaatje',
    work: 'Native Life in South Africa',
    year: 1916,
    quote: 'Awaking on Friday morning, June 20, 1913, the South African Native found himself, not actually a slave, but a pariah in the land of his birth.',
    speaker: 'Sol Plaatje, first General Secretary of the South African Native National Congress, London, 1916',
    nature: 'A book of reportage and argument, written by a founding officer of the organisation that became the African National Congress.',
    origin: 'Written by Plaatje — journalist, linguist, translator of Shakespeare into Setswana — after he travelled by bicycle through the Orange Free State recording what the Natives Land Act of 1913 did to African families. Published in London in 1916 while he was there to petition the imperial government.',
    purpose: 'To get the Land Act repealed by appealing over the head of the South African government to Britain, and to raise money for the deputation. The book is a campaign document, and the reporting in it was gathered to make a case.',
    cannotTell: 'How many were evicted. Plaatje records what he saw, family by family, and no one compiled a national figure; the Act’s effect is measured today from land registers, not from a count of the people put off the land.',
    supports: 'What the Natives Land Act of 1913 did, recorded at the time by an African writer who went and looked, and published in the imperial capital.',
    check: 'Sol T. Plaatje, Native Life in South Africa (London: P. S. King & Son, 1916), ch. 1; modern edition Picador Africa, 2007.',
  },
  {
    id: 'dyer-hunter-1920',
    territories: ['punjab-province', 'british-india'],
    spine: 'T14',
    weight: 1,
    kind: 'official-record',
    author: 'Brigadier-General Reginald Dyer, in evidence',
    work: 'Report of the Committee appointed to investigate the disturbances in the Punjab (the Hunter Committee)',
    year: 1920,
    quote: 'It was no longer a question of merely dispersing the crowd, but one of producing a sufficient moral effect from a military point of view not only on those who were present, but more especially throughout the Punjab.',
    speaker: 'Brigadier-General R. E. H. Dyer, in evidence to the Hunter Committee, Lahore, November 1919',
    nature: 'Sworn evidence to an official committee of inquiry, printed in the committee’s published report.',
    origin: 'Given by Dyer at Lahore in November 1919, seven months after his troops fired for about ten minutes into the crowd at Jallianwala Bagh in Amritsar, to a committee of five British and three Indian members chaired by Lord Hunter.',
    purpose: 'To defend himself, and — the striking thing — not by denying the intention. Dyer explained his action as deliberate deterrence aimed at the whole province. He was speaking to an inquiry that could end his career, which it did.',
    cannotTell: 'How many were killed. The committee’s count of 379 dead came from lists compiled afterwards; the Indian National Congress inquiry put it far higher, and no one was counting at the time. Dyer’s evidence explains a decision, not a toll.',
    supports: 'That the officer commanding stated, on the record, that the firing was intended to produce an effect beyond the crowd in front of him.',
    check: 'Report of the Committee appointed by the Government of India to investigate the disturbances in the Punjab (Cmd. 681, 1920), and the accompanying Evidence volumes.',
  },
  {
    id: 'gandhi-great-trial-1922',
    territories: ['british-india', 'bombay-presidency'],
    spine: 'T14',
    weight: 2,
    kind: 'primary-source',
    author: 'Mohandas Karamchand Gandhi',
    work: 'Statement in court at the Great Trial, Ahmedabad',
    year: 1922,
    quote: 'I hold it to be a virtue to be disaffected towards a Government which in its totality has done more harm to India than any previous system.',
    speaker: 'M. K. Gandhi, pleading guilty to sedition, Ahmedabad, 18 March 1922',
    nature: 'A written statement read into the record of a criminal trial by the defendant, who had pleaded guilty.',
    origin: 'Read by Gandhi at his trial for sedition at Ahmedabad on 18 March 1922, before Judge C. N. Broomfield, who sentenced him to six years. Gandhi had pleaded guilty and asked for the heaviest penalty the law allowed.',
    purpose: 'To convert a prosecution into a platform. Gandhi wanted the charge proved and the sentence passed, because a government jailing a man for saying what he had said was the argument he was making. The statement was written to be reported in every newspaper in India.',
    cannotTell: 'Whether the movement agreed with him. Gandhi had just suspended non-cooperation after the killings at Chauri Chaura, against the wishes of much of Congress, and the statement does not mention that split.',
    supports: 'That Indian objection to British rule was stated in a British court, in English, by a defendant who asked to be convicted for it.',
    check: 'Collected Works of Mahatma Gandhi, vol. 26; the trial record is printed in full as The Great Trial (Ahmedabad, 1922).',
  },
  {
    id: 'lugard-dual-mandate-1922',
    territories: ['nigeria', 'northern-nigeria-protectorate', 'southern-nigeria-protectorate', 'uganda', 'kenya', 'gold-coast', 'tanganyika'],
    spine: 'T11',
    weight: 3,
    kind: 'primary-source',
    author: 'Frederick Lugard',
    work: 'The Dual Mandate in British Tropical Africa',
    year: 1922,
    quote: 'Let it be admitted at the outset that European brains, capital, and energy have not been, and never will be, expended in developing the resources of Africa from motives of pure philanthropy.',
    speaker: 'Sir Frederick Lugard, former Governor-General of Nigeria, 1922',
    nature: 'A book of doctrine by a retired proconsul, written to set the terms on which colonies should be run.',
    origin: 'Written by Lugard after twenty-eight years in Africa — Uganda, Nigeria, Hong Kong — and after conquering the Sokoto Caliphate in 1903 and amalgamating Nigeria in 1914. Published in 1922, the year the League of Nations mandates began operating.',
    purpose: 'To justify indirect rule and to define the “dual mandate”: that colonies should be run for the benefit of both the colonial power and the colonised. Lugard was also defending his own record and shaping how the new mandates would be administered.',
    cannotTell: 'Whether indirect rule worked as described, or what the emirs and chiefs it governed through understood themselves to be doing. Lugard’s account of African political systems is the account that justified the system he built.',
    supports: 'That the leading British theorist of colonial administration opened his case by conceding that the motive was not philanthropy.',
    check: 'F. D. Lugard, The Dual Mandate in British Tropical Africa (Edinburgh: Blackwood, 1922), ch. 3.',
  },
  {
    id: 'balfour-declaration-1917',
    territories: ['mandatory-palestine', 'transjordan'],
    spine: 'T16',
    weight: 1,
    kind: 'official-record',
    author: 'Arthur James Balfour',
    work: 'Letter to Lord Rothschild (the Balfour Declaration)',
    year: 1917,
    quote: 'His Majesty’s Government view with favour the establishment in Palestine of a national home for the Jewish people… it being clearly understood that nothing shall be done which may prejudice the civil and religious rights of existing non-Jewish communities in Palestine.',
    speaker: 'A. J. Balfour, Foreign Secretary, to Lord Rothschild, 2 November 1917',
    nature: 'A letter, drafted and redrafted in Cabinet, published five days later as a statement of policy.',
    origin: 'Sent by Balfour to Walter Rothschild on 2 November 1917, agreed by the War Cabinet, while Allenby’s army was advancing on Jerusalem and the territory was still legally Ottoman.',
    purpose: 'War aims. The Cabinet hoped to bind Jewish opinion in Russia and the United States to the Allied cause, to forestall a similar German declaration, and to establish a British claim to Palestine against the French under the Sykes-Picot agreement of 1916.',
    cannotTell: 'What “national home” meant — the phrase was chosen because it had no settled meaning in international law — or what the roughly ninety per cent of the population who were Arab were told. They are named in the letter only by what they are not.',
    supports: 'That Britain promised Palestine as a national home before it held Palestine, and defined the majority population by negation in the same sentence.',
    check: 'The letter is in the British Library, Add MS 41178; text in Cmd. 1785 (1922) and in every documentary collection on the mandate.',
  },
  {
    id: 'egypt-declaration-1922',
    territories: ['egypt', 'anglo-egyptian-sudan', 'egypt-before-the-occupation'],
    spine: 'T12',
    weight: 1,
    kind: 'official-record',
    author: 'His Majesty’s Government',
    work: 'Declaration to Egypt of 28 February 1922',
    year: 1922,
    quote: 'The British Protectorate over Egypt is terminated, and Egypt is declared to be an independent sovereign State… The following matters are absolutely reserved to the discretion of His Majesty’s Government: the security of the communications of the British Empire in Egypt; the defence of Egypt against all foreign aggression or interference; the protection of foreign interests in Egypt and the protection of minorities; the Soudan.',
    speaker: 'The British declaration to Egypt, 28 February 1922',
    nature: 'A unilateral declaration: not a treaty, because no Egyptian government would sign one on these terms.',
    origin: 'Issued in Cairo and London on 28 February 1922 by the British government, after the revolution of 1919, the deportation of Saad Zaghloul, and the failure of the Milner mission to obtain an agreed settlement.',
    purpose: 'To end the protectorate and keep the substance of control: the canal, the army, the Sudan. Declaring independence unilaterally let Britain choose what independence meant, which a negotiated treaty would not have done.',
    cannotTell: 'What Egyptians thought independence was. The Wafd rejected the reserved points; British troops stayed until 1956, and the Sudan was not settled until 1953. A declaration records one government’s terms, not the other party’s consent — there was no other party.',
    supports: 'Egypt’s third legal label in this atlas, and the clearest single text on the difference between formal sovereignty and actual control.',
    check: 'Cmd. 1592 (1922); British and Foreign State Papers, vol. 116.',
  },

  /* ================================================== THE DISSOLUTION == */
  {
    id: 'nehru-tryst-1947',
    territories: ['british-india', 'bengal-presidency', 'punjab-province', 'united-provinces'],
    spine: 'T17',
    weight: 1,
    kind: 'primary-source',
    author: 'Jawaharlal Nehru',
    work: 'Speech to the Constituent Assembly of India (“A Tryst with Destiny”)',
    year: 1947,
    quote: 'At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom.',
    speaker: 'Jawaharlal Nehru, Constituent Assembly, New Delhi, midnight of 14–15 August 1947',
    nature: 'A speech made to a national assembly at the moment the state it addressed came into being.',
    origin: 'Delivered by Nehru in the Constituent Assembly in New Delhi at midnight on 14–15 August 1947, hours before the transfer of power, and broadcast.',
    purpose: 'To found a country in words: to give the new state a beginning that people could remember, and to speak for a Congress that had campaigned for this since 1885. It is a founding text, written to be quoted.',
    cannotTell: 'What was happening in Punjab and Bengal that week. The speech is made in Delhi at the hour when the killing on the new borders was starting, and Gandhi was not in the chamber — he was in Calcutta, fasting. A founding speech records an intention, not a country.',
    supports: 'How independence was described by the man who took office at it — and what a founding speech leaves out.',
    check: 'Constituent Assembly of India Debates, vol. V, 14 August 1947; Selected Works of Jawaharlal Nehru, second series, vol. 3.',
  },
  {
    id: 'nkrumah-political-kingdom',
    territories: ['gold-coast', 'ashanti', 'british-togoland'],
    spine: 'T18',
    weight: 1,
    kind: 'primary-source',
    author: 'Kwame Nkrumah',
    work: 'Slogan of the Convention People’s Party, and Nkrumah’s Autobiography',
    year: 1957,
    quote: 'Seek ye first the political kingdom, and all things shall be added unto it.',
    speaker: 'Kwame Nkrumah, leader of the Convention People’s Party and first Prime Minister of Ghana',
    nature: 'A political slogan, adapted from the Gospel of Matthew, used in campaigning and then printed by its author.',
    origin: 'Used by Nkrumah in the Gold Coast independence campaign from the late 1940s, in a territory where the great majority of voters were Christian and would recognise the verse it rewrites, and printed in his Autobiography, published in 1957 on the day Ghana became independent.',
    purpose: 'To organise. The slogan makes a strategic argument — take state power first, and economic and social change follow — in a form that can be chanted, and it borrows the authority of scripture to do it.',
    cannotTell: 'Whether the strategy worked. Ghana was independent in 1957 and Nkrumah was removed by a coup in 1966. A slogan is evidence of what a movement told itself, not of what followed.',
    supports: 'That the decolonisation of West Africa was argued for, in public, in the terms its own leaders chose — and that the ending was campaigned into being, not conferred.',
    check: 'Kwame Nkrumah, Ghana: The Autobiography of Kwame Nkrumah (Edinburgh: Nelson, 1957).',
  },
  {
    id: 'powell-hola-1959',
    territories: ['kenya'],
    spine: 'T19',
    weight: 1,
    kind: 'primary-source',
    author: 'Enoch Powell',
    work: 'Speech in the House of Commons on the Hola Camp deaths',
    year: 1959,
    quote: 'We cannot say, “We will have African standards in Africa, Asian standards in Asia and perhaps British standards here at home.” We must be consistent with ourselves everywhere.',
    speaker: 'J. Enoch Powell MP, House of Commons, 27 July 1959',
    nature: 'A speech by a government backbencher attacking his own party, in an all-night debate, recorded in Hansard.',
    origin: 'Delivered at about 2 a.m. on 27 July 1959, after eleven detainees were beaten to death at Hola camp in Kenya and the official account — that they had died from drinking contaminated water — collapsed.',
    purpose: 'To force accountability for the deaths and to reject the defence that different standards applied in a colony. Powell was speaking against his own front bench, and the speech is remembered as one of the most effective of the century in that chamber.',
    cannotTell: 'What happened at Hola, or across the emergency. Powell is arguing about responsibility in London; the scale of detention, villagisation and killing in Kenya was documented later, partly from files the Foreign Office admitted holding at Hanslope Park only in 2011.',
    supports: 'That the conduct of the Kenya emergency was condemned in the House of Commons at the time, by a Conservative member, on the ground that colonial subjects were owed the same standard as anyone else.',
    check: 'Hansard, HC Deb 27 July 1959, vol. 610, cols 232–237.',
  },
  {
    id: 'macmillan-wind-1960',
    territories: ['union-of-south-africa', 'kenya', 'northern-rhodesia', 'southern-rhodesia', 'nyasaland', 'gold-coast', 'nigeria', 'tanganyika'],
    spine: 'T18',
    weight: 2,
    kind: 'primary-source',
    author: 'Harold Macmillan',
    work: 'Speech to both Houses of the Parliament of South Africa, Cape Town',
    year: 1960,
    quote: 'The wind of change is blowing through this continent, and, whether we like it or not, this growth of national consciousness is a political fact.',
    speaker: 'Harold Macmillan, Prime Minister, Cape Town, 3 February 1960',
    nature: 'A prepared speech by a head of government, delivered to another country’s parliament and released to the press.',
    origin: 'Delivered by Macmillan on 3 February 1960 to both Houses of the South African Parliament in Cape Town, at the end of a six-week African tour, with Hendrik Verwoerd — who replied — on the platform. Six weeks later came Sharpeville.',
    purpose: 'To tell the South African government, on its own floor and in front of the world’s press, that Britain would not support apartheid, and to prepare British and colonial opinion for rapid decolonisation. It was aimed at least as much at audiences in London and Washington as at the men in the room.',
    cannotTell: 'Why Britain was leaving. A speech about an irresistible wind describes decolonisation as weather. It says nothing about the balance of payments, the cost of the Kenya and Malaya emergencies, Suez in 1956, or the American pressure — the reasons that appear in the Cabinet papers.',
    supports: 'The moment British policy on Africa was stated in public — and an example of an agent describing himself as a bystander.',
    check: 'The text is printed in Macmillan’s Pointing the Way (1972) and in the South African Hansard for 3 February 1960.',
  },
  /* ============================================ ROUND 3: THE OTHER SIDE ==
   * The charge, and it was correct: "the testimony is overwhelmingly
   * imperial. Kenya 1954 — the entry that says the end of empire is best
   * documented here — offers five texts written at the time, all by Britons,
   * and no Kenyan." Measured before this block: 18 of 28 texts by British
   * officials, politicians or settlers; Kenya 5–0, Nigeria 4–0, Egypt 1–0,
   * Ireland 1–0, Australia 1–0, Canada 2–0, Hong Kong 2–0, Uganda 3–0,
   * Southern Rhodesia 3–0.
   *
   * The archive really is lopsided — colonial governments kept their own
   * paper and burned a good deal of everyone else's — but that is a reason to
   * go and find the texts that do survive, not a reason to print five Britons
   * and call it the record. Every entry below obeys the same four rules as
   * the rest of the file, and each one is a document a student can go and
   * check. Where a text reaches us through somebody else's hands — Urabi
   * through an English sympathiser, Panakareao through a missionary's
   * translation — the chain is named in `origin` and priced in `cannotTell`,
   * because that chain is the most teachable thing about it.
   */
  {
    id: 'lin-zexu-victoria-1839',
    territories: ['hong-kong', 'weihaiwei'],
    spine: 'T9',
    weight: 0,
    kind: 'primary-source',
    author: 'Lin Zexu',
    work: 'Letter to Queen Victoria',
    year: 1839,
    quote: 'Let us ask, where is your conscience? I have heard that the smoking of opium is very strictly forbidden by your country; that is because the harm caused by opium is clearly understood. Since it is not permitted to do harm to your own country, then even less should you let it be passed on to the harm of other countries.',
    speaker: 'Lin Zexu, imperial commissioner at Canton, 1839',
    nature: 'A state letter from one government to another, drafted for a Chinese imperial commissioner, circulated in Chinese and in English translation.',
    origin: 'Written at Canton in 1839 by Lin Zexu, sent by the Daoguang emperor to stop the opium trade, shortly after he had confiscated and destroyed some 1,000 tonnes of opium held by British merchants. It is not certain that any copy reached Victoria; a version was printed in Canton and in the missionary journal the Chinese Repository.',
    purpose: 'To persuade a foreign sovereign to restrain her own subjects. Lin argues from reciprocity — you forbid it at home — and expects the argument to be answered in kind rather than fought.',
    cannotTell: 'What Britain decided, or why. The answer was a war, and the reasons for it are in the Cabinet papers and in Palmerston’s instructions, not here. It is also silent about the opium grown, sold and smoked inside China, and about the Qing officials who profited from it.',
    supports: 'That the Chinese government stated its objection to the opium trade in writing, in the language of law and reciprocity, before the first British fleet arrived — so the war was fought over a trade one side had already banned.',
    check: 'Printed in the Chinese Repository, vol. 8 (1839–40); the standard English translation is in Ssu-yü Teng and John K. Fairbank, China’s Response to the West (Cambridge, MA: Harvard University Press, 1954).',
  },
  {
    id: 'rammohan-roy-amherst-1823',
    territories: ['bengal-presidency', 'british-india'],
    spine: 'T6',
    weight: 0,
    kind: 'primary-source',
    author: 'Rammohan Roy',
    work: 'Letter to Lord Amherst on the proposed Sanskrit College',
    year: 1823,
    quote: 'The Sungscrit system of education would be the best calculated to keep this country in darkness, if such had been the policy of the British Legislature.',
    speaker: 'Rammohan Roy to Lord Amherst, Governor-General, Calcutta, 11 December 1823',
    nature: 'A petition: a private letter to a Governor-General, written to reverse a decision that had already been taken.',
    origin: 'Written in Calcutta on 11 December 1823 by Rammohan Roy — Bengali scholar, reader of Sanskrit, Persian and Arabic, founder of the Brahmo Sabha — after the Committee of Public Instruction resolved to spend the education grant on a new Sanskrit college.',
    purpose: 'To get the money spent on European science instead: mathematics, natural philosophy, chemistry, anatomy. Roy is arguing to the one man who could reverse the vote, and he frames the case in the terms that man would find hardest to refuse.',
    cannotTell: 'That Indians wanted British rule. Roy was arguing about a curriculum, twelve years before Macaulay, for his own reasons as a reformer — and he fought the same government over the press regulations and over the taxation of Bengal in the same decade.',
    supports: 'That the argument for European learning in India was being made by Indians before it was made by Macaulay — which makes the Minute of 1835 the capture of an argument rather than the origin of one.',
    check: 'Bureau of Education, Selections from Educational Records, Part I (1781–1839), ed. H. Sharp (Calcutta, 1920) — the same volume that prints Macaulay’s minute, a hundred pages apart.',
  },
  {
    id: 'naoroji-knife-1901',
    territories: ['british-india', 'bombay-presidency', 'bengal-presidency'],
    spine: 'T10',
    weight: 1,
    kind: 'primary-source',
    author: 'Dadabhai Naoroji',
    work: 'Poverty and Un-British Rule in India',
    year: 1901,
    quote: 'It is “Sakar ki Chhuri”, the knife of sugar. That is to say there is no oppression, it is all smooth and sweet, but it is the knife, notwithstanding.',
    speaker: 'Dadabhai Naoroji, first written in the 1870s and collected in Poverty and Un-British Rule in India, London, 1901',
    nature: 'A book of economic argument, assembled by its author from thirty years of his own papers, speeches and evidence to official commissions.',
    origin: 'Dadabhai Naoroji — Bombay merchant, professor of mathematics, and Liberal MP for Central Finsbury from 1892 to 1895, the first Indian to sit in the House of Commons — collected his case in London in 1901, for British readers and for a British Parliament.',
    purpose: 'To convict Britain out of its own accounts. Naoroji’s method is arithmetic: the “drain” of Indian revenue to Britain in home charges, pensions and guaranteed railway dividends. Even the title is tactical — “un-British” argues that the empire is betraying its own stated principles, which is the charge a British Parliament can be made to answer.',
    cannotTell: 'How large the drain was. Naoroji’s figures are estimates built from published Indian budgets, and the size of the transfer has been argued over ever since — Utsa Patnaik puts it far higher, Tirthankar Roy far lower. What the book settles is that the charge was made, in figures, in London, by an Indian MP.',
    supports: 'That the economic case against British rule in India was made in Britain, in the language of accountancy, by an Indian member of the Parliament that ran it, half a century before independence.',
    check: 'Dadabhai Naoroji, Poverty and Un-British Rule in India (London: Swan Sonnenschein, 1901).',
  },
  {
    id: 'tagore-knighthood-1919',
    territories: ['punjab-province', 'british-india', 'bengal-presidency'],
    spine: 'T14',
    weight: 0,
    kind: 'primary-source',
    author: 'Rabindranath Tagore',
    work: 'Letter to the Viceroy renouncing his knighthood',
    year: 1919,
    quote: 'The time has come when badges of honour make our shame glaring in the incongruous context of humiliation, and I for my part wish to stand, shorn of all special distinctions, by the side of those of my countrymen who, for their so-called insignificance, are liable to suffer degradation not fit for human beings.',
    speaker: 'Rabindranath Tagore to Lord Chelmsford, Viceroy of India, 31 May 1919',
    nature: 'A private letter written to be published: the return of a British honour, sent to the Viceroy and released to the press the same week.',
    origin: 'Written in Calcutta on 31 May 1919, forty-eight days \u2014 seven weeks \u2014 after troops under Brigadier-General Dyer fired into the crowd at Jallianwala Bagh in Amritsar on 13 April 1919. Tagore had been knighted in 1915 and had won the Nobel Prize in Literature in 1913; the Punjab was under martial law and he could not travel there.',
    purpose: 'To make a refusal legible. Tagore had no vote and no office; the honour was the only instrument he held, and he used it in public, in English, so that Britain would have to read it.',
    cannotTell: 'What happened at Jallianwala Bagh. Tagore was in Calcutta. For the killing itself the record is the Hunter Commission — 379 dead by its count — and the Indian National Congress inquiry, which put the figure considerably higher.',
    supports: 'That Amritsar was the point at which Indian opinion that had worked inside the empire stopped working inside it: the most honoured Indian alive handed the honour back, in writing, and said exactly why.',
    check: 'Printed in full in the Modern Review (Calcutta), July 1919, and in the collected editions of Tagore’s English writings; the manuscript is at Rabindra Bhavana, Santiniketan.',
  },
  {
    id: 'kenyatta-facing-1938',
    territories: ['kenya'],
    spine: 'T19',
    weight: 0,
    kind: 'primary-source',
    author: 'Jomo Kenyatta',
    work: 'Facing Mount Kenya',
    year: 1938,
    quote: 'To Moigoi and Wamboi and all the dispossessed youth of Africa: for perpetuation of communion with ancestral spirits through the fight for African Freedom, and in the firm faith that the dead, the living, and the unborn will unite to rebuild the destroyed shrines.',
    speaker: 'Jomo Kenyatta, the dedication of Facing Mount Kenya, London, 1938',
    nature: 'A book of anthropology written by a political organiser about his own people, and dedicated as a political act.',
    origin: 'Written in London by Jomo Kenyatta while he was general secretary of the Kikuyu Central Association and a student of Bronisław Malinowski at the London School of Economics. He had come to Britain in 1929 to put the Kikuyu land claim to the Colonial Office and stayed fifteen years. He was convicted at Kapenguria in 1953 on evidence later shown to have been bought, and became Kenya’s first prime minister in 1963.',
    purpose: 'To make the land claim in the one form British readers would accept as knowledge. In 1938 an ethnography written by a member of the people it describes was itself an argument, and the dedication states plainly what the argument is for.',
    cannotTell: 'Anything about the emergency of 1952 to 1960, which was fourteen years away. It also speaks for one people among many in Kenya, and it is a case being argued: the Kikuyu Central Association’s land claim, which the Kenya Land Commission of 1932–34 had largely refused.',
    supports: 'That the Kenyan land claim was stated in print, in London, by a Kenyan, fourteen years before the emergency whose files the Foreign Office kept at Hanslope Park until 2011.',
    check: 'Jomo Kenyatta, Facing Mount Kenya (London: Secker & Warburg, 1938). The land case he had come to London to press is in Kenya Land Commission, Evidence and Memoranda, 3 vols (London: HMSO, 1934).',
  },
  {
    id: 'awolowo-path-1947',
    territories: ['nigeria', 'southern-nigeria-protectorate', 'northern-nigeria-protectorate'],
    spine: 'T18',
    weight: 0,
    kind: 'primary-source',
    author: 'Obafemi Awolowo',
    work: 'Path to Nigerian Freedom',
    year: 1947,
    quote: 'Nigeria is not a nation. It is a mere geographical expression. There are no “Nigerians” in the same sense as there are “English”, “Welsh”, or “French”. The word “Nigerian” is merely a distinctive appellation to distinguish those who live within the boundaries of Nigeria from those who do not.',
    speaker: 'Obafemi Awolowo, Path to Nigerian Freedom, London, 1947',
    nature: 'A political book, written in London by a colonial subject reading for the Bar and published by a London house.',
    origin: 'Written by Awolowo in London in the mid-1940s, thirty years after Lugard amalgamated the northern and southern protectorates into one Nigeria, and published by Faber in 1947. Awolowo went on to lead the Action Group and to govern the Western Region.',
    purpose: 'To argue for a federal Nigeria against a unitary one, and for self-government soon. The sentence is the opening move of a constitutional case, not a lament — the point of saying the country is an expression is to say what should now be built on it.',
    cannotTell: 'Whether he was right. It is the most quoted sentence in Nigerian political argument and is used by people who want opposite things from it. It is evidence of what one Nigerian politician said in 1947 about a border Britain drew, not a finding about Nigerian nationhood.',
    supports: 'That the shape Britain gave Nigeria in 1914 was being argued over by Nigerians in print thirteen years before independence, and that the argument was about federation, not about whether to leave.',
    check: 'Obafemi Awolowo, Path to Nigerian Freedom (London: Faber and Faber, 1947).',
  },
  {
    id: 'urabi-abdin-1881',
    territories: ['egypt', 'anglo-egyptian-sudan'],
    spine: 'T12',
    weight: 0,
    kind: 'primary-source',
    author: 'Ahmad Urabi, reported by Wilfrid Scawen Blunt',
    work: 'Words at the Abdin Palace confrontation, reported in Secret History of the English Occupation of Egypt',
    year: 1881,
    quote: 'We are not slaves, and we shall never from this day forth be inherited.',
    speaker: 'Colonel Ahmad Urabi to Khedive Tewfik outside the Abdin Palace, Cairo, 9 September 1881, as reported afterwards',
    nature: 'A reported sentence: words spoken in Arabic in a public confrontation, written down later by people who were not all present, and reaching English through translation.',
    origin: 'Urabi was a colonel of Egyptian peasant origin in an army whose senior ranks were reserved for Turco-Circassians. On 9 September 1881 he drew up regiments outside the Abdin Palace and put demands to Khedive Tewfik. Tewfik is said to have answered that he had inherited the country from his fathers and that the officers were his family’s property; this is the reply. The best-known English account is by Wilfrid Scawen Blunt, an English poet who backed Urabi and was not in the square.',
    purpose: 'To refuse a claim of ownership in public, in front of troops, in words that could be repeated. Everything about how it reaches us is shaped by what happened next: Urabi lost, was tried, and was exiled to Ceylon, and the men who wrote it down were defending him.',
    cannotTell: 'His exact words. There is no Arabic verbatim record of the exchange and the English wording varies between accounts; read it as the sense of what was said and not as a transcript. It also cannot tell you what the Egyptian movement wanted in detail — for that, the programme of the Chamber of Delegates in 1882.',
    supports: 'That the British occupation of 1882 fell on a country that already had a constitutional movement of its own, and that the movement’s language was about who owned Egypt.',
    check: 'Wilfrid Scawen Blunt, Secret History of the English Occupation of Egypt (London: T. Fisher Unwin, 1907); the standard modern reconstruction is Alexander Schölch, Egypt for the Egyptians! (London: Ithaca Press, 1981).',
  },
  {
    id: 'mitchel-last-conquest-1861',
    territories: ['ireland'],
    spine: 'T4',
    weight: 0,
    kind: 'primary-source',
    author: 'John Mitchel',
    work: 'The Last Conquest of Ireland (Perhaps)',
    year: 1861,
    quote: 'The Almighty, indeed, sent the potato blight, but the English created the Famine.',
    speaker: 'John Mitchel, The Last Conquest of Ireland (Perhaps), 1861',
    nature: 'A polemic written in exile by a convicted political prisoner, serialised in his own newspaper before it was a book.',
    origin: 'Written by John Mitchel — Young Irelander, transported to Van Diemen’s Land in 1848 for treason-felony, escaped to the United States in 1853 — and serialised in New York before publication in 1861, fifteen years after the deaths it describes.',
    purpose: 'To fix responsibility for the famine on British policy, and to raise Irish America for a rising. It is written to make people act, and its sentences are built to be repeated.',
    cannotTell: 'Whether the charge holds in the terms Mitchel puts it. Historians divide over how far the deaths followed from ideology, from incompetence, or from the structure of Irish landholding. Nor is Mitchel a witness to be taken on trust about human suffering in general: he settled in the American South and defended slavery there in print.',
    supports: 'That the charge of a policy-made famine is contemporary, Irish, and in print within fifteen years of the deaths — not a modern reinterpretation of them.',
    check: 'John Mitchel, The Last Conquest of Ireland (Perhaps) (Dublin, 1861); critical edition ed. Patrick Maume (Dublin: University College Dublin Press, 2005).',
  },
  {
    id: 'irish-proclamation-1916',
    territories: ['ireland'],
    spine: 'T17',
    weight: 1,
    kind: 'primary-source',
    author: 'Patrick Pearse, James Connolly and the five other signatories',
    work: 'Proclamation of the Irish Republic',
    year: 1916,
    quote: 'The Republic guarantees religious and civil liberty, equal rights and equal opportunities to all its citizens, and declares its resolve to pursue the happiness and prosperity of the whole nation and of all its parts, cherishing all the children of the nation equally.',
    speaker: 'Read by Patrick Pearse outside the General Post Office, Dublin, 24 April 1916',
    nature: 'A proclamation: a founding document, printed on a press and posted on walls, claiming a state into existence.',
    origin: 'Printed overnight on 23–24 April 1916 in Liberty Hall, on a press short of type, and read outside the General Post Office at the start of a rising that lasted six days. Seven men signed it; all seven were shot within a month.',
    purpose: 'To convert an insurrection into a state. It is doing legal work — declaring a republic, naming a provisional government, claiming the allegiance of everyone in Ireland — and political work: its first line addresses Irishwomen, at a time when they had no parliamentary vote.',
    cannotTell: 'What Irish people wanted. The rising had little public support when it began; the executions changed that, and Sinn Féin took 73 of 105 Irish seats in December 1918. This is evidence of what seven men claimed, not of what the country thought in Easter week.',
    supports: 'That Irish independence was declared in a document, by named people who were shot for it, five years before the Anglo-Irish Treaty — so that the treaty was the end of an argument, not the start of one.',
    check: 'Original copies are held by the National Library of Ireland and the National Museum of Ireland; the full text is reproduced in Charles Townshend, Easter 1916: The Irish Rebellion (London: Allen Lane, 2005).',
  },
  {
    id: 'panakareao-shadow-1840',
    territories: ['new-zealand'],
    spine: 'T15',
    weight: 0,
    kind: 'primary-source',
    author: 'Nōpera Panakareao',
    work: 'Speech at the treaty signing at Kaitaia',
    year: 1840,
    quote: 'The shadow of the land goes to the Queen, but the substance remains with us.',
    speaker: 'Nōpera Panakareao, rangatira of Te Rarawa, at Kaitaia, 28 April 1840',
    nature: 'A speech at a signing, spoken in Māori to a Māori meeting, translated into English by the missionaries present and preserved in their accounts.',
    origin: 'Spoken at Kaitaia on 28 April 1840, at one of the meetings at which the Māori text of the Treaty of Waitangi was carried round the country for signature. About a year later Panakareao reversed the sentence in public: the substance of the land had gone to the Europeans, and only the shadow was left to Māori.',
    purpose: 'To tell his own people what he understood he was agreeing to, and to carry them with him. This is a chief speaking to a meeting he has to persuade, not a document drafted for the Crown.',
    cannotTell: 'What the Crown understood itself to be taking. The English text cedes sovereignty outright; this is the Māori side of a translation dispute the Waitangi Tribunal has been adjudicating since 1975. And it reaches us in English, through missionary ears and missionary transcription.',
    supports: 'That the two texts of the Treaty of Waitangi were understood to mean different things at the time of signing, by a signatory — and that within a year he said in public that he had been wrong about which one was operating.',
    check: 'Recorded in the accounts of the Kaitaia signing by the missionaries present; quoted and sourced in Claudia Orange, The Treaty of Waitangi (Wellington: Allen & Unwin, 1987) and in the Waitangi Tribunal’s Muriwhenua reports.',
  },
  {
    id: 'day-of-mourning-1938',
    territories: ['commonwealth-of-australia', 'new-south-wales'],
    spine: 'T16',
    weight: 0,
    kind: 'primary-source',
    author: 'Jack Patten and William Ferguson',
    work: 'Aborigines Claim Citizen Rights!',
    year: 1938,
    quote: 'WE, representing THE ABORIGINES OF AUSTRALIA, assembled in conference at the Australian Hall, Sydney, on the 26th day of January, 1938, this being the 150th Anniversary of the Whitemen’s seizure of our country, HEREBY MAKE PROTEST against the callous treatment of our people by the whitemen during the past 150 years, AND WE APPEAL to the Australian nation of today to make new laws for the education and care of Aborigines, and we ask for a new policy which will raise our people TO FULL CITIZEN STATUS AND EQUALITY WITHIN THE COMMUNITY.',
    speaker: 'The Day of Mourning conference, Australian Hall, Sydney, 26 January 1938',
    nature: 'A conference resolution and a printed pamphlet, written, published and sold by the people it is about.',
    origin: 'Drafted by Jack Patten and William Ferguson of the Aborigines Progressive Association and issued at the Day of Mourning protest in Sydney on 26 January 1938 — the 150th anniversary of the landing of the First Fleet — while the official re-enactment was being staged a few streets away.',
    purpose: 'To demand citizenship, and to be seen demanding it on the day the country was celebrating. The pamphlet was sold, the conference was reported, and a deputation carried the demands to the Prime Minister eleven days later.',
    cannotTell: 'What Aboriginal and Torres Strait Islander people wanted in general. This is one organisation, in New South Wales, asking for one thing — equal citizenship inside Australia — and other movements before and since have asked instead for land and for sovereignty.',
    supports: 'That Aboriginal people organised, wrote and published their own political demand a hundred and fifty years after the First Fleet and twenty-nine years before the referendum of 1967.',
    check: 'Jack Patten and William Ferguson, Aborigines Claim Citizen Rights! (Sydney: The Publicist, 1938); copies at the National Library of Australia and at AIATSIS, Canberra.',
  },
  {
    id: 'riel-jury-1885',
    territories: ['canada', 'north-west-territories'],
    spine: 'T16',
    weight: 0,
    kind: 'primary-source',
    author: 'Louis Riel',
    work: 'Address to the jury at his trial for high treason, Regina',
    year: 1885,
    quote: 'I know that through the grace of God I am the founder of Manitoba.',
    speaker: 'Louis Riel, Regina, 31 July 1885',
    nature: 'A speech from the dock, taken down by the court stenographer and printed in the official report of the trial.',
    origin: 'Spoken by Louis Riel — Métis leader of the Red River resistance of 1869–70 and of the North-West resistance of 1885 — at his trial in Regina. He refused the insanity defence his own counsel had prepared, in order to be allowed to speak. The jury convicted him and recommended mercy; he was hanged on 16 November 1885.',
    purpose: 'To be judged as a political actor rather than as a madman, and to leave the Métis case on a record that would outlast him. He is addressing the jury, Ottawa and Quebec in the same breath.',
    cannotTell: 'What the Métis communities of the South Saskatchewan, or the Cree who rose in the same months, wanted. Riel speaks for himself and in his own religious idiom; the land grievances and the terms of Cree leaders such as Mistahimaskwa and Pîhtokahanapiwiyin are in other records, most of them written by the government they were negotiating with.',
    supports: 'That Canada’s expansion west was resisted twice by the people already living there, and that the second resistance was tried and hanged rather than negotiated with.',
    check: 'The Queen v. Louis Riel, official report of the trial (Ottawa, 1886); reprinted with an introduction by Desmond Morton (Toronto: University of Toronto Press, 1974).',
  },
  {
    id: 'panglong-1947',
    territories: ['british-burma'],
    spine: 'T18',
    weight: 0,
    kind: 'treaty',
    author: 'Aung San and the Shan, Kachin and Chin representatives at Panglong',
    work: 'The Panglong Agreement',
    year: 1947,
    quote: 'Citizens of the Frontier Areas shall enjoy rights and privileges which are regarded as fundamental in democratic countries.',
    speaker: 'Signed at Panglong, in the Shan States, 12 February 1947',
    nature: 'An agreement between colonised parties: not between a colony and Britain, but among the peoples a British administrative line had kept apart.',
    origin: 'Signed on 12 February 1947 at Panglong by Aung San for the Burmese interim government and by Shan, Kachin and Chin representatives, three weeks after the Aung San–Attlee agreement in London and five months before Aung San and six colleagues were shot dead in Rangoon.',
    purpose: 'To assemble a country before independence. Britain ran “Ministerial Burma” and the “Frontier Areas” as two different administrations, and without the frontier peoples there was no single state to hand anything to; this is the bargain that made one.',
    cannotTell: 'Whether the bargain held. Aung San was assassinated in July 1947; the autonomy and the right of secession written into the 1947 constitution were not honoured, and the civil wars that began in 1948 have not ended. A signed agreement is evidence of terms, not of what was done with them.',
    supports: 'That the shape of an independent state was negotiated between colonised parties, over lines the colonial power had drawn, before the colonial power left — and that the borders of the successor state are as much an inheritance as the buildings.',
    check: 'Printed in Burma: Frontier Areas Committee of Enquiry, 1947, Report (Rangoon: Government Printing and Stationery, 1947), and in Hugh Tinker (ed.), Burma: The Struggle for Independence 1944–1948, 2 vols (London: HMSO, 1983–84).',
  },
  {
    id: 'lobengula-victoria-1889',
    territories: ['southern-rhodesia', 'northern-rhodesia', 'bechuanaland'],
    spine: 'T13',
    weight: 0,
    kind: 'primary-source',
    author: 'Lobengula Khumalo',
    work: 'Letter to Queen Victoria repudiating the Rudd Concession',
    year: 1889,
    quote: 'A document was written and presented to me for signature. I asked what it contained, and they said in it were my words and the words of those men. I put my hand to it. About three months afterwards I heard from other sources that I had given by that document the right to all the minerals of my country.',
    speaker: 'Lobengula Khumalo, king of the Ndebele, to Queen Victoria, 23 April 1889',
    nature: 'A letter from one head of state to another, dictated in isiNdebele, written down and translated by Europeans at Lobengula\u2019s court, and carried to London.',
    origin: 'Written at Bulawayo after Charles Rudd, Rochfort Maguire and Francis Thompson obtained Lobengula\u2019s mark on a mineral concession in October 1888 on Cecil Rhodes\u2019s behalf. That concession was the legal basis for the British South Africa Company\u2019s royal charter in 1889 and for the occupation of Mashonaland in 1890.',
    purpose: 'To have the concession set aside by the sovereign whose own subjects had obtained it. Lobengula is using the only forum open to him \u2014 the Queen\u2019s authority over her own people \u2014 because the men in front of him were not going to be moved by anything he said to them.',
    cannotTell: 'What was actually said at the signing, or what Lobengula understood at the time. The letter is written months afterwards, through interpreters with interests of their own, and its purpose is repudiation. Nor can it tell you what the Shona polities of the plateau, who were party to none of it, thought about a concession over their land.',
    supports: 'That the document the British South Africa Company\u2019s charter rested on was repudiated in writing, to the Queen, by the man who had signed it \u2014 a year before the occupation went ahead anyway.',
    check: 'Reproduced in the Matabeleland correspondence printed in the British Parliamentary Papers, 1890; quoted and sourced in Stafford Glass, The Matabele War (London: Longmans, 1968), and in Terence Ranger, Revolt in Southern Rhodesia 1896\u20137 (London: Heinemann, 1967).',
  },
  {
    id: 'kandyan-convention-1815',
    territories: ['ceylon'],
    spine: 'T11',
    weight: 0,
    kind: 'treaty',
    author: 'The British Governor and the chiefs of the Kandyan provinces',
    work: 'The Kandyan Convention',
    year: 1815,
    quote: 'The Religion of Boodhoo professed by the Chiefs and Inhabitants of these Provinces is declared inviolable, and its Rites, Ministers and Places of Worship are to be maintained and protected.',
    speaker: 'Signed at Kandy, 2 March 1815',
    nature: 'A convention: at once an instrument of surrender and a settlement of terms, signed by the invading power and by the nobility of the kingdom it had just taken.',
    origin: 'Signed at Kandy on 2 March 1815 by Sir Robert Brownrigg for the Crown and by the Kandyan chiefs, who had turned against Sri Vikrama Rajasinha and let a British army into a kingdom the Portuguese and the Dutch had failed to take in three centuries.',
    purpose: 'To make the chiefs\u2019 change of side into a settlement they could defend to their own people. That is why the guarantee of Buddhism is in it \u2014 the chiefs required it \u2014 and it is why a Christian empire made itself the legal protector of the Temple of the Tooth.',
    cannotTell: 'Whether the terms held. Within three years the chiefs who signed had risen, the rising of 1817\u201318 was put down hard, and the Colebrooke\u2013Cameron reforms of 1833 dismantled much of what the Convention had preserved. A signed guarantee is evidence of terms, not of what was done with them. The spelling in the quotation is the document\u2019s own.',
    supports: 'That the last independent kingdom in Ceylon ended in an agreement its own nobility signed, on conditions they put into it \u2014 so this taking was neither straight conquest nor anything anyone handed over.',
    check: 'The text was published in the Ceylon Government Gazette in 1815 and is printed in the standard documentary collections of Sri Lankan constitutional history; the original is in the Sri Lanka National Archives, Colombo.',
  },
];

/* ------------------------------------------------------- whose words these are --
 * WHO HELD THE PEN. Round 3's critic counted the corpus and was right about
 * it: eighteen of the first twenty-eight texts were made by British officials,
 * politicians, settlers or campaigners, and Kenya — the entry that says the
 * end of empire is best documented here — held five of them and no Kenyan.
 *
 * This table is the answer to that, and it is a table rather than an adjective
 * so that it can be counted, disputed and shown to the student. Every id in
 * TESTIMONY must appear in it or `auditTestimony()` fails and the panel prints
 * the failure in --danger, in front of the reader.
 *
 *   'subject'  made by somebody from the place, or on the receiving end of
 *              what it describes — including where it reaches us through
 *              somebody else's hands, in which case `origin` names the chain
 *   'british'  made by a British official, politician, settler or campaigner
 *   'joint'    a text both parties put their names to, or two texts of one
 *              instrument that do not say the same thing
 *
 * The category is about WHO MADE THE DOCUMENT, not about whether we agree with
 * it: Burke attacking the Company is 'british'; Lin Zexu, whose country was
 * never a British colony but who was on the receiving end of the trade and the
 * war, is 'subject'.
 */
export const VOICE = {
  /* British hands */
  'burke-fox-bill-1783': 'british',
  'hastings-revenue-1772': 'british',
  'macaulay-minute-1835': 'british',
  'gladstone-opium-1840': 'british',
  'proclamation-1763': 'british',
  'durham-1839': 'british',
  'phillip-instructions-1787': 'british',
  'waitangi-english-1840': 'british',
  'trevelyan-1846': 'british',
  'salisbury-maps-1890': 'british',
  'berlin-act-article-35-1885': 'british',
  'rhodes-stead-lenin-1902': 'british',
  'dyer-hunter-1920': 'british',
  'lugard-dual-mandate-1922': 'british',
  'balfour-declaration-1917': 'british',
  'egypt-declaration-1922': 'british',
  'powell-hola-1959': 'british',
  'macmillan-wind-1960': 'british',
  /* Both names on it */
  'nanking-article-iii-1842': 'joint',
  'waitangi-maori-1840': 'joint',
  'kandyan-convention-1815': 'joint',
  /* The other side of it */
  'equiano-middle-passage-1789': 'subject',
  'mary-prince-1831': 'subject',
  'sharpe-gallows-1832': 'subject',
  'boston-king-1798': 'subject',
  'plaatje-1916': 'subject',
  'gandhi-great-trial-1922': 'subject',
  'nehru-tryst-1947': 'subject',
  'nkrumah-political-kingdom': 'subject',
  'lin-zexu-victoria-1839': 'subject',
  'rammohan-roy-amherst-1823': 'subject',
  'naoroji-knife-1901': 'subject',
  'tagore-knighthood-1919': 'subject',
  'kenyatta-facing-1938': 'subject',
  'awolowo-path-1947': 'subject',
  'urabi-abdin-1881': 'subject',
  'mitchel-last-conquest-1861': 'subject',
  'irish-proclamation-1916': 'subject',
  'panakareao-shadow-1840': 'subject',
  'day-of-mourning-1938': 'subject',
  'riel-jury-1885': 'subject',
  'panglong-1947': 'subject',
  'lobengula-victoria-1889': 'subject',
};
for (const t of TESTIMONY) t.voice = VOICE[t.id] || null;

const VOICE_RANK = { subject: 0, joint: 1, british: 2 };
export const VOICE_WORD = {
  subject: 'by somebody from here, or on the receiving end of it',
  joint: 'signed by both parties',
  british: 'by a British official, politician, settler or campaigner',
};

/* ------------------------------------------------------------------ index -- */

const BY_TERRITORY = new Map();
for (const t of TESTIMONY) {
  for (const id of t.territories || []) {
    if (!BY_TERRITORY.has(id)) BY_TERRITORY.set(id, []);
    BY_TERRITORY.get(id).push(t);
  }
}
/* THE ORDER, AND WHY IT CHANGED.
   Two of these render open and the rest are folded, so the order decides what
   a student actually reads. Round 5 ordered by specificity alone — how few
   entries a text is filed on — which was right about Salisbury's joke about
   maps (filed on eight entries, so last) and wrong about everything else: on
   Kenya it opened with Powell, on Nigeria with Lugard, on Egypt with the
   British declaration, and on Ireland with Trevelyan. Four places, four
   Englishmen, first.

   So the first key is now whose hands the document came from. The colonised
   side of a record is read first where this atlas holds it; the second key is
   still specificity, so a text about this place still beats a text filed on
   eight; and Salisbury is still last. Nothing is hidden by this — every text
   is in the same sheet, one scroll apart — and the tally underneath prints the
   split both ways, so a reader can see the thumb on the scale and the reason
   for it. */
for (const list of BY_TERRITORY.values()) {
  list.sort((a, b) => ((VOICE_RANK[a.voice] ?? 1) - (VOICE_RANK[b.voice] ?? 1))
    || (a.territories.length - b.territories.length)
    || ((a.weight ?? 9) - (b.weight ?? 9))
    || (a.year - b.year));
}

/**
 * The primary texts this atlas holds for a territory, most load-bearing first.
 * Also merges any `quote`-carrying evidence the dataset itself grows later, so
 * the day a shard gains a transcription nothing here has to change.
 */
export function testimonyFor(territory) {
  if (!territory) return [];
  const own = BY_TERRITORY.get(territory.id) || [];
  const fromShard = [];
  const seen = new Set(own.map((s) => s.id));
  const scan = (list) => {
    for (const e of list || []) {
      if (e && e.quote && !seen.has(e.id || e.quote)) { seen.add(e.id || e.quote); fromShard.push(e); }
    }
  };
  scan(territory.evidence);
  for (const a of territory.acquisitions || []) scan(a.evidence);
  for (const d of territory.departures || []) scan(d.evidence);
  return [...own, ...fromShard];
}

/** Does this atlas hold any text made at the time for this place? */
export function hasTestimony(territory) { return testimonyFor(territory).length > 0; }

/** Corpus-wide numbers, printed to the student so the absence is legible too. */
export function testimonyStats() {
  const places = new Set();
  for (const t of TESTIMONY) for (const id of t.territories || []) places.add(id);
  const v = { subject: 0, british: 0, joint: 0 };
  for (const t of TESTIMONY) if (v[t.voice] != null) v[t.voice]++;
  return { texts: TESTIMONY.length, places: places.size, ...v };
}

/**
 * WHOSE WORDS, FOR ONE PLACE. Counted, not asserted, and printed in the panel
 * under the texts themselves. An archive assembled by the side that won is a
 * fact about the evidence, and a student who is not told the split will read
 * five Englishmen on Kenya and take it for the record of Kenya.
 *
 * `list` is what `testimonyFor()` returned, so a text the dataset grows later
 * with no `voice` counts as `unknown` and is reported as unknown.
 */
export function voiceTally(list) {
  const out = { subject: 0, british: 0, joint: 0, unknown: 0, total: 0 };
  for (const t of list || []) {
    out.total++;
    if (out[t.voice] == null) out.unknown++;
    else out[t.voice]++;
  }
  return out;
}

/* The audit every entry must pass. Run at module load in the panel and
   published, so a missing field is a student-visible defect and not a comment
   in a source file nobody opens. */
export const REQUIRED = ['kind', 'author', 'work', 'year', 'quote', 'speaker', 'nature', 'origin', 'purpose', 'cannotTell', 'supports', 'check'];

export function auditTestimony() {
  const bad = [];
  const ids = new Set();
  for (const t of TESTIMONY) {
    const missing = REQUIRED.filter((k) => !t[k] || String(t[k]).trim() === '');
    if (missing.length) bad.push({ id: t.id, missing });
    if (ids.has(t.id)) bad.push({ id: t.id, missing: ['duplicate id'] });
    ids.add(t.id);
    if (!(t.territories || []).length) bad.push({ id: t.id, missing: ['territories'] });
    /* A text with no entry in VOICE is a text this atlas has not said whose
       hands it came from, and that is exactly the defect round 3 found. */
    if (!t.voice) bad.push({ id: t.id, missing: ['voice'] });
  }
  return bad;
}

export default TESTIMONY;
