/* panels/historiography/disputes.js — HISTORIANS DISAGREE.
 *
 * THE CHARGE THIS FILE ANSWERS, in the whole-app critic's words: "The app never
 * makes the student weigh an argument. There is no point anywhere in it where
 * two named historians disagree, the evidence at issue is identified, and the
 * learner has to judge between them and say why."
 *
 * Every entry below is a real argument between real people about real evidence.
 * The rules that governed the writing, and they are not negotiable:
 *
 *   1. NO STRAWMEN. Each position is stated in the form its own author would
 *      recognise. Where a position is usually caricatured — Williams as "it was
 *      all economics", Ferguson as "empire was good" — the caricature is not
 *      what is printed. `claim` is the argument; `reads` is the evidence it
 *      rests on; `explainAway` is the strongest thing said against it.
 *   2. NO FALSE BALANCE. `verdict.balance` is one of `open`, `weighted` or
 *      `settled-on-fact`, and the verdict text says plainly where the evidence
 *      is one-sided. Kenya is the case that matters here: Elkins, Anderson and
 *      Blacker disagree about a NUMBER. Presenting that as an open question
 *      about whether the camps existed would be a lie told with a disagreement.
 *   3. NO INVENTED CITATION. Every work named here is one this atlas already
 *      cites (docs/SOURCES.md, 629 works) or one whose author, title and year
 *      the writer is confident of. No page locators are given where none were
 *      verified. `check` says where a reader goes to test the claim.
 *   6. THE DISPLAY MAY NOT CONTRADICT THE CITATION. Round 3's historian found
 *      `Africa and the Victorians` printed as "Ronald Robinson and John
 *      Gallagher" with its own check line, six lines below in the same
 *      rectangle, reading "…with Alice Denny". Same book, same box, two
 *      different sets of authors. That is this project's oldest defect — a
 *      sentence about a record, printed without reading the record — arriving
 *      on its fourth surface, and it is now a RULE rather than an edit:
 *      `auditAttribution()` in ./standing.js reads all 82 citations this atlas
 *      prints with a check line, this file's 39 and the dossier's 43, against
 *      their own check lines, and `accept.scenario.js` fails if it finds one.
 *
 * WHAT ROUND 3 CORRECTED HERE, all of it found by running that rule or by
 * reading the rendered panel:
 *   · Alice Denny restored to the author line of `Africa and the Victorians`,
 *     in both places it is cited.
 *   · the Legacies of British Slave-ownership check line, which pointed at the
 *     UCL database and named none of the volume's five authors.
 *   · "chs. 4–6 on Egypt" on Africa and the Victorians and "Part I, chs. 4–6"
 *     on Hobson — two chapter locators nobody had verified. Rule 3 says no
 *     locator that was not checked, and a chapter TITLE is checkable where a
 *     chapter number is not, so Hobson now names "The Economic Taproot of
 *     Imperialism" and the 1961 book names its Egyptian chapters.
 *   · "A journal article, sixteen pages" over a check line reading 1–15. The
 *     1953 article is fifteen pages, and the audit now compares the two.
 *   · Cannadine's phrase. The panel printed "in his phrase, the exporting of
 *     British hierarchy", which is not a sentence of his. What he wrote is
 *     "hierarchy made visible", and that is what is printed now.
 *   · Fieldhouse's reply to Gallagher and Robinson was credited to Economics
 *     and Empire (1973), whose target is the economic theory of imperialism.
 *     The direct answer to their article is his 1961 historiographical review,
 *     in the journal that had carried it, and Platt's reservations of 1968.
 *     Both are now named, in the badge and in the check.
 *   4. THE COMMITMENT IS REQUIRED. `choices` are the positions plus, always,
 *      "neither on its own". A student must pick one AND write a sentence
 *      before `verdict` and `settle` enter the DOM. Not hidden with CSS: not
 *      rendered.
 *   5. EVERY QUOTATION GOES THROUGH renderSource(). Nothing in this file
 *      prints a quotation itself; `testimony` names ids in the dossier's
 *      corpus and `src` objects carry the four NOP fields so a citation here
 *      answers nature / origin / purpose / what-it-cannot-tell-you at the
 *      strongest level, `record`, rather than at the level of its class.
 *
 * `territories` are ids that exist in app/data/territories/*.json. audit()
 * checks them against the live dataset at runtime, so a dispute pinned to a
 * place this atlas does not hold is a student-visible defect, not a silence.
 */

/* A citation shaped for renderSource(). `nature`, `purpose` and `cannotTell`
   are written about THIS work, so the panel answers at level `record`. */
const src = (o) => ({ kind: 'book', ...o });

export const DISPUTES = [

  /* ==================================================================== 1 == */
  {
    id: 'abolition-decline',
    /* DIDACTIC_SPEC §4, tagged with the quiz bank's own key: M8 — "Britain abolished slavery, so Britain was basically the good guy." This argument IS that question, asked by the people who spent their careers on it. */
    misconceptions: ['M8'],
    span: [1783, 1838],
    spine: 'T5',
    phase: 'I',
    year: 1807,
    question: 'Britain abolished the slave trade in 1807 and slavery in 1833. Did it act because slavery had stopped paying?',
    stake: 'If abolition was economics, Britain gets no moral credit for it. If it was politics, the largest slave-trading power of the eighteenth century abolished a system that was still making money — which is a harder thing to explain and a more interesting one.',
    territories: ['trinidad', 'jamaica', 'barbados', 'guyana', 'saint-kitts', 'antigua',
      'grenada', 'saint-vincent', 'dominica', 'tobago', 'great-britain', 'sierra-leone'],
    positions: [
      {
        key: 'williams',
        who: 'Eric Williams',
        badge: 'Capitalism and Slavery, 1944',
        short: 'Abolition followed the money out.',
        claim: 'The profits of the slave trade and the sugar islands helped build British industry. By the early nineteenth century the protected West Indian sugar monopoly had become a brake on an industrial economy that wanted free trade and cheaper sugar, and the interests that had made the system turned against it. Abolition is a mature capitalism cutting away a part of itself that had stopped paying; the humanitarians were the visible edge of a shift that had already happened underneath them.',
        reads: 'Sugar prices and West Indian estate values falling after 1799; sugar piling up unsold in bond; the political collapse of the West India interest at Westminster; the rise of the East India and free-trade lobbies; and the slave-trade capital that turns up in Liverpool, Bristol and Lancashire banking, insurance and manufacture.',
        explainAway: 'The timing. Britain abolished its own slave trade in 1807, when its share of the traffic and the output of its colonies were at or near their highest, and it had just taken Trinidad and the Guiana colonies, which planters were desperate to stock with people. Britain then spent sixty years and a great deal of money on a naval squadron suppressing other nations’ trade — behaviour that is difficult to read as commercial self-interest.',
        src: src({
          author: 'Eric Williams', work: 'Capitalism and Slavery', year: 1944,
          publisher: 'University of North Carolina Press',
          nature: 'A doctoral thesis turned into a book by a Trinidadian historian who later became his country’s first prime minister.',
          purpose: 'To break the account of abolition then taught in British schools — a moral triumph won by British conscience — and to put the Caribbean and enslaved people at the centre of British economic history instead of at its edge.',
          cannotTell: 'Whether the decline it describes was happening when it says. Williams wrote before the trade and output series were reconstructed; the volumes now available do not show a British slave economy in decline in 1807. The book’s other half — that slavery was structurally central to British commerce — has stood up much better than its chronology.',
          supports: 'The case that abolition served British economic interests rather than defeating them.',
          check: 'Eric Williams, Capitalism and Slavery (Chapel Hill: University of North Carolina Press, 1944), chapters 7–12.',
        }),
      },
      {
        key: 'drescher',
        who: 'Seymour Drescher',
        badge: 'Econocide, 1977',
        short: 'The system was growing when Britain killed it.',
        claim: 'On every measure that can be counted, British slavery was expanding in 1807, not dying: the trade’s volume, the colonies’ share of British commerce, the value of the newly taken Trinidad and Guiana frontier. Abolition was therefore an act against Britain’s own commercial interest, carried by political pressure — the largest petitioning movement in British public life to that date — and not by an economic calculation. Drescher named the thesis he was attacking and gave his book its title from it: economic suicide, not economic rationalisation.',
        reads: 'British slave-trade volumes and colonial trade shares up to 1806; the demand for people on the newly conquered Guiana frontier; and, in his later work, the petition campaigns of 1788, 1792 and 1814, which produced a scale of signature-gathering nothing else in British politics then matched.',
        explainAway: 'The profits were real and they did flow into British banking, insurance and industry — the Legacies of British Slave-ownership project has since traced them payment by payment. And abolishing the trade left slavery itself running for another twenty-six years on some 800,000 people, ended with £20 million paid to the owners and nothing to the people freed, and was followed within a year by indenture.',
        src: src({
          author: 'Seymour Drescher', work: 'Econocide: British Slavery in the Era of Abolition', year: 1977,
          publisher: 'University of Pittsburgh Press',
          nature: 'A quantitative monograph written expressly to test Williams’s decline thesis against the trade and output series.',
          purpose: 'To show, by counting, that the British slave system was not in decline when Britain abolished the trade — and therefore that the explanation of abolition has to be political rather than economic.',
          cannotTell: 'Why the political pressure arose when it did. Drescher establishes that the economic motive was absent; establishing what was present instead is a different problem, which his later work on the petition campaigns takes up.',
          supports: 'That the British slave economy was expanding, not contracting, at the moment of abolition.',
          check: 'Seymour Drescher, Econocide: British Slavery in the Era of Abolition (Pittsburgh: University of Pittsburgh Press, 1977); and Capitalism and Antislavery: British Mobilization in Comparative Perspective (London: Macmillan, 1986).',
        }),
      },
    ],
    verdict: {
      balance: 'weighted',
      lead: 'This one has largely been decided, and not in the middle.',
      text: 'Econocide is generally taken to have broken the decline thesis in its strong form: the numbers do not show a British slave economy that had stopped paying in 1807. Very few historians now explain abolition by decline. What has survived from Williams is the other half of his book — that slavery and the slave trade were central to British commercial and industrial development — and that half is in better shape now than when he wrote it, because the compensation records have been opened. Catherine Hall, Nicholas Draper and their colleagues traced the £20 million voted in 1833 to the individuals who received it and found it running into railways, banks, country houses and public collections. So: Williams was wrong about why abolition happened and closer to right about what slavery had built.',
      note: 'Notice what that leaves. If abolition was not economic self-interest, then Britain really did give something up — and the same Parliament paid the owners £20 million and the people freed nothing, and made them work unpaid until 1838. Both clauses stay in the sentence.',
    },
    settleKey: 'The Trans-Atlantic Slave Trade Database, for the volumes; and firm-level records of where slave '
      + 'capital went, for the half of Williams that is still open.',
    settle: 'The decline half was settled by counting, and it can be re-counted: the Trans-Atlantic Slave Trade Database (Eltis and Richardson) holds the voyages. The half that is still open is how much of Britain’s industrial capital formation slavery actually supplied, and that needs firm-level records — the Legacies of British Slave-ownership database is the first serious attempt at it.',
    extraSources: [
      src({
        author: 'Christopher Leslie Brown', work: 'Moral Capital: Foundations of British Abolitionism', year: 2006,
        publisher: 'University of North Carolina Press',
        nature: 'A monograph on where British antislavery came from as a political force.',
        purpose: 'To explain why abolitionism became respectable and useful in Britain after 1783 — Brown’s argument is that the loss of America made antislavery a way for Britons to recover moral standing, so the campaign was both genuine and serviceable.',
        cannotTell: 'What enslaved people’s own resistance contributed to the timing. Brown is writing about British politics, and the Haitian revolution and the Caribbean risings sit at the edge of his frame rather than the centre.',
        supports: 'That abolition can be a real moral achievement and serve British interests at the same time, without either clause cancelling the other.',
        check: 'Christopher Leslie Brown, Moral Capital: Foundations of British Abolitionism (Chapel Hill, 2006).',
      }),
      src({
        author: 'Catherine Hall, Nicholas Draper, Keith McClelland, Katie Donington and Rachel Lang',
        work: 'Legacies of British Slave-ownership: Colonial Slavery and the Formation of Victorian Britain', year: 2014,
        publisher: 'Cambridge University Press',
        nature: 'A collaborative study built on a database of every award made under the Slave Compensation Act of 1837.',
        purpose: 'To trace where the £20 million paid to slave-owners went, person by person, and what it built in Britain.',
        cannotTell: 'What happened to the people whose enslavement generated the payments. The compensation records were kept to settle claims by owners; the enslaved appear in them as valued property and almost never by name.',
        supports: 'That slave wealth was distributed widely through British society and reinvested in it.',
        check: 'Catherine Hall, Nicholas Draper, Keith McClelland, Katie Donington and Rachel Lang, Legacies of British Slave-ownership: Colonial Slavery and the Formation of Victorian Britain (Cambridge: Cambridge University Press, 2014); and the Legacies of British Slavery database, University College London.',
      }),
    ],
    testimony: ['sharpe-gallows-1832', 'mary-prince-1831'],
  },

  /* ==================================================================== 2 == */
  {
    id: 'railways-india',
    /* DIDACTIC_SPEC §4, tagged with the quiz bank's own key: M7 — "the empire brought railways, law and English, so it developed the colonies." Ferguson and Tharoor are the two published forms of that sentence and its answer. */
    misconceptions: ['M7'],
    span: [1853, 1947],
    spine: 'T7',
    phase: 'III',
    year: 1900,
    question: 'India had one of the world’s largest railway networks by 1900. Who was it built for?',
    stake: 'This is the argument students meet first and answer worst, because both answers are partly true and the interesting question is not "good or bad" but "on whose terms, at whose risk, and for whose traffic".',
    territories: ['british-india', 'bengal-presidency', 'madras-presidency', 'bombay-presidency',
      'punjab-province', 'united-provinces', 'sindh', 'assam-province', 'central-provinces-and-berar'],
    positions: [
      {
        key: 'ferguson',
        who: 'Niall Ferguson',
        badge: 'Empire, 2003',
        short: 'Britain exported institutions, and they outlasted it.',
        claim: 'Britain spread a package — the common law, secure property rights, free trade, the English language, capital, and physical networks including railways, telegraphs, ports and irrigation. However brutal the means, and Ferguson does not deny the means, that package raised the long-run prospects of the societies that received it, and the honest test is not whether empire was benign but what the realistic alternative was: rule by another European power, or by the regimes empire displaced.',
        reads: 'The scale of British capital exported before 1914; the railway, telegraph, canal and port networks and the fact that independent India kept and extended them; and comparative growth records of places inside and outside the British system.',
        explainAway: 'The terms. The lines were built under a guarantee of about 5 per cent to British shareholders, charged to Indian revenues whether a line earned it or not — a structure that removed the investor’s risk and left it on the Indian taxpayer. The freight structure moved raw material to ports rather than between Indian towns. Indians were kept out of the senior engineering and managerial grades for decades. And the Bengal famine of 1943 happened on a completed network.',
        src: src({
          author: 'Niall Ferguson', work: 'Empire: How Britain Made the Modern World', year: 2003,
          publisher: 'Allen Lane',
          nature: 'A book written alongside a television series, for a general readership rather than for other historians.',
          purpose: 'To argue that the British Empire, for all its violence, spread institutions that made the modern global economy possible, and to ask what the counterfactual would have been.',
          cannotTell: 'Whether the institutions caused the outcomes. The argument runs on comparison and counterfactual, neither of which can be observed, and the book is a synthesis rather than a work of new research on any of the cases it covers.',
          supports: 'The case that the networks and institutions built under British rule had value independent of the intentions behind them.',
          check: 'Niall Ferguson, Empire: How Britain Made the Modern World (London: Allen Lane, 2003).',
        }),
      },
      {
        key: 'tharoor',
        who: 'Shashi Tharoor',
        badge: 'Inglorious Empire, 2017',
        short: 'It was a British investment in Britain, paid for by India.',
        claim: 'The railways were built to move troops inland, raw material to the ports and British manufactures to Indian markets, on terms that put the profit with British investors and the risk with the Indian taxpayer. Indians used them, of course; that does not convert an extraction system into a gift, and India paid for the network several times over in guaranteed returns, in the tariffs that destroyed its own textile exports, and in the revenue remitted to London.',
        reads: 'The guaranteed return and what it cost Indian revenues; freight rates that favoured port-bound traffic; the exclusion of Indians from the engineering grades; the tariff regime against Indian cotton textiles; and the collapse of India’s share of world manufacturing output across the nineteenth century.',
        explainAway: 'The counterfactual, and the numbers. What an independent nineteenth-century India would have built cannot be observed. And the deindustrialisation figures are reconstructions with wide margins — Tirthankar Roy argues that mechanised competition would have destroyed handloom export markets whatever policy Britain followed, and that Indian handloom production for the domestic market did not collapse in the way the headline series implies.',
        src: src({
          author: 'Shashi Tharoor', work: 'Inglorious Empire: What the British Did to India', year: 2017,
          publisher: 'Hurst',
          nature: 'A polemic by an Indian politician and former UN official, grown out of an Oxford Union speech.',
          purpose: 'To put the case for the prosecution in public, against what Tharoor takes to be a complacent British memory of the Raj, and to argue for an acknowledgement of what was done.',
          cannotTell: 'How much. It is an argument built on other historians’ figures, and it takes the higher end of contested estimates. It is a case for the prosecution and says so; the numbers in it have to be checked against the economic historians it draws on.',
          supports: 'That the railway network was financed on terms that transferred risk to Indian revenues and profit to British investors.',
          check: 'Shashi Tharoor, Inglorious Empire: What the British Did to India (London: Hurst, 2017); and for the guarantee system, Tirthankar Roy, The Economic History of India 1857–1947.',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'Genuinely open — but not about what it looks like.',
      text: 'Almost nobody disputes the mechanism Tharoor describes. The guarantee, the freight structure and the tariffs are in the India Office records and are not controversial among economic historians. The disagreement is about weight and about the counterfactual: what the network was worth set against what it cost, and what would have been built otherwise. Ferguson’s case rests on a comparison with an India that never existed. Tharoor’s rests partly on a figure — the fall in India’s share of world manufacturing — that is a reconstruction with wide error bars. A student who says "the railways were good" and a student who says "the railways were theft" have both stopped one step too early. The useful sentence is the third one: the network was real, it was built on terms India did not set, and both facts have consequences you can trace.',
    },
    settleKey: 'The guarantee accounts in the India Office records — what the 5 per cent cost Indian revenues, '
      + 'year by year — set against two controls that built their own lines: the princely states, and '
      + 'Japan.',
    settle: 'A defensible estimate of the net transfer — guaranteed payments and remittances out, against the value of the assets left behind — and a controlled comparison. The princely states that financed their own lines, and Japan, which built railways in the same decades under its own government, are the two comparisons that would do most work.',
    extraSources: [
      src({
        author: 'Tirthankar Roy', work: 'The Economic History of India 1857-1947', year: 2011,
        publisher: 'Oxford University Press',
        nature: 'A textbook synthesis of the quantitative economic history of colonial India.',
        purpose: 'To set out what the series actually show, and to argue against explanations of Indian poverty that rest on colonial policy alone rather than on climate, market structure and the shock of global mechanisation.',
        cannotTell: 'What is not in the series. Colonial statistics were collected for revenue and administration; the sectors they measure worst are the ones outside the tax net, and the wide error bars Roy insists on cut against his own conclusions as well as against Tharoor’s.',
        supports: 'The counter-case: that deindustrialisation estimates are uncertain and that global mechanisation would have hurt Indian handlooms regardless of British policy.',
        check: 'Tirthankar Roy, The Economic History of India 1857–1947, 3rd edn (New Delhi: Oxford University Press, 2011).',
      }),
    ],
    testimony: ['naoroji-knife-1901'],
  },

  /* ==================================================================== 3 == */
  {
    id: 'informal-empire',
    span: [1806, 1956],
    spine: 'T12',
    phase: 'III',
    year: 1880,
    question: 'Britain never ruled Argentina, never taxed it and never garrisoned it. Was Argentina part of the empire?',
    stake: 'The answer decides how big the empire was. Draw only the red and you reproduce the pink map’s own lie; draw the influence and you have to say where influence stops being empire — and nobody has a clean answer.',
    territories: ['argentina-informal-empire', 'persia-iran', 'siam', 'japan-unequal-treaties',
      'egypt-before-the-occupation', 'egypt', 'ottoman-informal-empire', 'uruguay-informal-empire', 'weihaiwei', 'muscat-and-oman'],
    positions: [
      {
        key: 'gr',
        who: 'John Gallagher and Ronald Robinson',
        badge: '“The Imperialism of Free Trade”, 1953',
        short: 'Trade with informal control if possible; rule if necessary.',
        claim: 'British expansion was one continuous drive to draw regions into a British trading system, and the choice between a treaty and a flag was a question of cost, not of principle. The textbook picture — an anti-imperial mid-century followed by a sudden imperialist turn in the 1880s — is an artefact of counting annexations. Where a commercial treaty, a loan and the occasional gunboat sufficed, no flag went up, and the map of red therefore understates the reach of British power rather than measuring it.',
        reads: 'The mid-century treaty system — Nanjing in 1842, the Ottoman commercial convention, Siam in 1855, the River Plate republics; the scale of British investment and British-owned railways in Latin America; and the long list of interventions that stopped short of annexation.',
        explainAway: 'The concept has no edge. If a country with British loans, British-built railways and no British soldiers counts as informal empire, it becomes hard to state what evidence would count against the claim — and a thesis that cannot be contradicted is not doing the work of a thesis.',
        src: src({
          author: 'John Gallagher and Ronald Robinson', work: 'The Imperialism of Free Trade', year: 1953,
          kind: 'article', publisher: 'The Economic History Review',
          nature: 'A journal article, fifteen pages, aimed squarely at other historians.',
          purpose: 'To overturn the standard chronology of British expansion by arguing that formal annexation was the exception and informal control the rule, and that the same expansionist policy ran from 1815 to 1914.',
          cannotTell: 'How much. It offers no measure of informal control at any date, which is what its critics have pressed on ever since. It is an argument, not a measurement, and this atlas prints that sentence on the layer that draws it.',
          supports: 'That British power operated over places it never annexed, and that a map of formal possessions understates it.',
          check: 'John Gallagher and Ronald Robinson, “The Imperialism of Free Trade”, Economic History Review, 2nd ser., 6:1 (1953), 1–15.',
        }),
      },
      {
        key: 'fieldhouse',
        who: 'D. K. Fieldhouse, and D. C. M. Platt',
        badge: '“An Historiographical Revision”, 1961 · Economics and Empire, 1973',
        short: 'Trade is not rule. Empire is who decides.',
        claim: 'Calling investment and trade "empire" empties the word of the thing that makes empire matter: the power to decide. Argentina set its own tariffs, ran its own foreign policy, defaulted on British debts and was not compelled to do otherwise. Fieldhouse answered Gallagher and Robinson directly eight years after their article, in a review of the whole historiography: the continuity they claim is bought by widening “imperialism” until it covers every kind of foreign contact, and a category that covers everything explains nothing. Platt then tested the Latin American half of their case against the trade and diplomatic record and found the control it needs was not there. Fieldhouse’s later book runs the same test on the economic explanations of expansion, case by case, and finds the annexations of the 1880s and 1890s pulled by crises on the periphery rather than pushed by investors at home.',
        reads: 'Argentine tariff autonomy; the Baring crisis of 1890, in which Argentina defaulted, a great London house nearly failed, and no British force went anywhere; the absence of British control over Argentine law, revenue or armed forces; and the mismatch between where British capital went — the United States, Canada, Australia, Argentina — and where Britain annexed, which was tropical Africa.',
        explainAway: 'The cases where Britain plainly did decide without annexing. The unequal treaties and the treaty ports were imposed by force. Egypt is the hardest: Britain bombarded Alexandria in 1882, occupied the country, ran its finances, and never annexed it — for seventy-four years. That is exactly the shape Gallagher and Robinson described.',
        src: src({
          author: 'D. K. Fieldhouse', work: 'Economics and Empire 1830-1914', year: 1973,
          publisher: 'Weidenfeld and Nicolson',
          nature: 'A comparative survey testing economic explanations of European expansion against the record of individual annexations. The reply to Gallagher and Robinson themselves is the 1961 historiographical review, printed in the same journal that had carried their article.',
          purpose: 'To examine whether the economic theories of imperialism — Hobson’s, Lenin’s, and the informal-empire thesis — actually fit the cases, and to argue that in most of them they do not.',
          cannotTell: 'What officials believed but did not write. Fieldhouse works from the documented decision in each case, which is the right method and also its limit: an interest that operated as an assumption rather than as a minute leaves no trace for it to find.',
          supports: 'The case that trade and investment without the power to decide are not empire.',
          check: 'D. K. Fieldhouse, Economics and Empire 1830–1914 (London: Weidenfeld and Nicolson, 1973); his direct reply to Gallagher and Robinson is “‘Imperialism’: An Historiographical Revision”, Economic History Review, 2nd ser., 14 (1961). D. C. M. Platt, Latin America and British Trade, 1806–1914 (London: Adam and Charles Black, 1972); and “The Imperialism of Free Trade: Some Reservations”, Economic History Review, 2nd ser., 21 (1968).',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'Open, and this atlas has taken a side — which you are entitled to attack.',
      text: 'This atlas draws Argentina, Persia, Siam, the Ottoman lands, pre-1882 Egypt and the China treaty ports as an informal sphere, at control degree 0 or 1, with no fill and no claimed border, and it prints on the layer itself that the layer is an argument and not a measurement. That is a choice, and it can be wrong. Leaving those places off would make the empire look smaller and more lawful than it was; drawing them risks the exact criticism Fieldhouse and Platt make, which is that a haze on a map looks like a fact. The case that hurts Fieldhouse most is Egypt. The case that hurts Gallagher and Robinson most is the Baring crisis: Argentina defaulted on London and nothing happened to it.',
    },
    settleKey: 'One decision an Argentine government wanted to take between 1860 and 1914 and could not, with '
      + 'the name of whoever stopped it. Foreign Office correspondence and the Argentine cabinet records.',
    settle: 'Each position accepts the same test, which is about decisions. Name a decision an Argentine government wanted to take between 1860 and 1914 and could not take, and say who stopped it and how. Where that can be done, informal empire is demonstrated; where it cannot, the word is doing no work. The archive for it is the Foreign Office correspondence and the Argentine cabinet records, and the answer will differ decade by decade.',
    extraSources: [
      src({
        author: 'Ronald Robinson and John Gallagher, with Alice Denny', work: 'Africa and the Victorians: The Official Mind of Imperialism', year: 1961,
        publisher: 'Macmillan',
        nature: 'A monograph reconstructing British decision-making over Africa from the papers of the officials who took the decisions.',
        purpose: 'To explain the partition of Africa as a strategic response to crises on the periphery — above all the Egyptian collapse of 1882 — filtered through the shared assumptions of a small group of men in Whitehall.',
        cannotTell: 'Whether the official mind is telling the truth about itself. The book is built from the papers of the people whose motives it explains, which is where a self-flattering account of motive would live. It also leaves African political actors very little room.',
        supports: 'The strategic, periphery-driven explanation of the Scramble, against the economic one.',
        check: 'Ronald Robinson and John Gallagher, with Alice Denny, Africa and the Victorians: The Official Mind of Imperialism (London: Macmillan, 1961).',
      }),
    ],
    testimony: ['nanking-article-iii-1842', 'egypt-declaration-1922'],
  },

  /* ==================================================================== 4 == */
  {
    id: 'kenya-scale',
    span: [1952, 1960],
    spine: 'T19',
    phase: 'IV',
    year: 1955,
    question: 'How many people did British rule kill in Kenya between 1952 and 1960 — and what does the disagreement about the number actually cover?',
    stake: 'This is the case where a real scholarly disagreement gets misused. Knowing exactly what is contested, and exactly what is not, is the whole skill.',
    territories: ['kenya'],
    positions: [
      {
        key: 'elkins',
        who: 'Caroline Elkins',
        badge: 'Britain’s Gulag, 2005',
        short: 'A system, and a much larger death toll than was ever admitted.',
        claim: 'The emergency was not a set of excesses by bad officers; it was a system — a "Pipeline" of camps, screening centres and enclosed villages through which the Kikuyu population was processed, with beating, starvation and forced labour as method rather than as failure. The official figures cannot be used, because the administration destroyed and removed its own records. Elkins’s reconstruction from the 1948 and 1962 censuses pointed to a very large number of unrecorded deaths, far above the official count.',
        reads: 'More than three hundred interviews with survivors, detainees and former guards; the camp and detention records that do survive; the villagisation programme, which moved over a million people into guarded settlements; the Hola camp killings of March 1959; and the fact, later admitted, that files were destroyed and removed at independence.',
        explainAway: 'The demographic method. A census-based estimate of missing Kikuyu depends on assumptions about fertility, migration and undercount, and small changes in those assumptions move the answer by an order of magnitude. John Blacker’s demographic study put excess deaths at roughly 50,000, about half of them children, and attributed much of that to the conditions of villagisation rather than to killing. Elkins’s highest figures are not accepted by most demographers.',
        src: src({
          author: 'Caroline Elkins', work: 'Britain’s Gulag: The Brutal End of Empire in Kenya', year: 2005,
          publisher: 'Jonathan Cape',
          nature: 'A monograph built substantially on oral testimony from Kikuyu survivors and former detainees, alongside the surviving official record.',
          purpose: 'To establish that the detention system was systematic and authorised, and to put the accounts of the people held in it into the historical record at a time when the British documentary base had been deliberately thinned.',
          cannotTell: 'The total number of dead. The demographic reconstruction that produced her highest figures is contested by demographers, and oral testimony collected fifty years later establishes what happened to the people who gave it, not how many people it happened to.',
          supports: 'That detention, villagisation and systematic violence were the method of the emergency, not its exceptions.',
          check: 'Caroline Elkins, Britain’s Gulag: The Brutal End of Empire in Kenya (London: Jonathan Cape, 2005), published in the United States as Imperial Reckoning.',
        }),
        restsOnPost2011: false,
      },
      {
        key: 'anderson',
        who: 'David Anderson',
        badge: 'Histories of the Hanged, 2005',
        short: 'Prove it from the state’s own courts, and stop at what can be proved.',
        claim: 'The emergency can be documented from the colonial state’s own legal record without any demographic estimate at all — and what that record shows is bad enough to need no help. The special emergency assize courts tried and hanged 1,090 people, more than in any other British counter-insurgency, and the trial files survive. The scale of official, legally authorised violence is provable. The total number of dead is not, and claiming it is invites an attack on the whole case.',
        reads: 'The trial records of the emergency assize courts; the detention statistics, showing at least 80,000 people held; security-force casualty returns; and the settler dead, of whom there were 32.',
        explainAway: 'What the archive cannot hold. Anderson’s own later work is about the "migrated archive" — the files Britain removed to Hanslope Park and admitted holding only in 2011 — which is a demonstration that the documentary base he works from was made incomplete on purpose. A method that stops where the documents stop will systematically undercount a state that destroyed documents.',
        src: src({
          author: 'David Anderson', work: 'Histories of the Hanged: Britain’s Dirty War in Kenya and the End of Empire', year: 2005,
          publisher: 'Weidenfeld and Nicolson',
          nature: 'A monograph built on the court records of the emergency assize courts and the surviving colonial administrative files.',
          purpose: 'To establish, from the state’s own paperwork, what the colonial legal system in Kenya did — and specifically to document the executions, which had never been counted.',
          cannotTell: 'What was done outside the courts and outside the files. The method is deliberately conservative and its author says so; it cannot reach the deaths in the camps and villages that generated no paper.',
          supports: 'The documented count of executions, trials and detentions.',
          check: 'David Anderson, Histories of the Hanged: Britain’s Dirty War in Kenya and the End of Empire (London: Weidenfeld and Nicolson, 2005); and “Guilty Secrets: Deceit, Denial and the Discovery of Kenya’s ‘Migrated Archive’”, History Workshop Journal 80 (2015).',
        }),
        restsOnPost2011: false,
      },
      {
        key: 'blacker',
        who: 'John Blacker',
        badge: '“The demography of Mau Mau”, African Affairs, 2007',
        short: 'Count the missing people properly: about 50,000.',
        claim: 'The question is a demographic one and should be answered with demographic method. Working from the Kenyan censuses and the age structure they reveal, Blacker estimated excess Kikuyu deaths in the 1950s at around 50,000 — an order of magnitude below Elkins’s highest figure and an order of magnitude above the official one — and found that about half of the excess was among children under ten, which points to the conditions in the villages rather than to killing at the point of a weapon.',
        reads: 'The 1948 and 1962 Kenyan censuses, the age structure of the Kikuyu population in 1962, and standard demographic reconstruction of missing cohorts.',
        explainAway: 'That his method cannot separate causes. Excess mortality tells you people died who should not have; it does not tell you at whose hands, and it cannot distinguish a death in a camp from a death in a village from a death in the forest. It also cannot count anyone whose absence the censuses do not register.',
        src: src({
          author: 'John Blacker', work: 'The demography of Mau Mau: fertility and mortality in Kenya in the 1950s: a demographer’s viewpoint', year: 2007,
          kind: 'article', publisher: 'African Affairs',
          nature: 'A journal article by a demographer who had worked on East African population statistics for decades.',
          purpose: 'To bring demographic method to a dispute that had been conducted between historians, and to test the very large death-toll figures then in circulation against the census evidence.',
          cannotTell: 'Who killed whom. It is a measure of missing people, not an account of how they went missing, and it depends on the censuses being reliable enough to compare.',
          supports: 'A middle estimate of excess deaths, and the finding that much of the mortality was among young children.',
          check: 'John Blacker, “The demography of Mau Mau”, African Affairs 106:423 (2007), 205–227.',
        }),
        restsOnPost2011: false,
      },
    ],
    verdict: {
      balance: 'settled-on-fact',
      lead: 'Read this before you decide, because the disagreement is narrower than it looks.',
      text: 'Elkins, Anderson and Blacker disagree about a number. They do not disagree about the system. Mass detention, forced villagisation and systematic beating are not in dispute between them, and they are not in dispute with the British government either: in June 2013 the Foreign Secretary told the House of Commons that Kenyans had been subjected to torture and other forms of ill-treatment, and Britain paid £19.9 million to 5,228 claimants. Treating this as "historians disagree, so who knows" takes a genuine argument about magnitude and uses it to put the facts back in doubt. That is the move to watch for, and it is the reason this block exists.',
      note: 'The honest sentence is long and worth learning: the system is documented and admitted; the number of dead ranges from about 11,000 in the official returns to about 50,000 on Blacker’s demography to figures many times higher in Elkins; and the range is wide because the state that did the counting destroyed part of the count.',
    },
    settleKey: 'The censuses of 1948 and 1962, which are the whole demographic base; and the files removed to '
      + 'Hanslope Park — the ones that survive, since some were destroyed.',
    settle: 'The censuses of 1948 and 1962 are the whole demographic base and they have now been worked over hard. What would move the argument is the paper that has not been read: the Foreign Office admitted in 2011 that it held thousands of files removed from Kenya at independence, and admitted separately that files were destroyed. A defensible total may not be recoverable at all — which is itself a finding about what a state can do to its own record.',
    lens: {
      id: 'before-2011',
      label: 'Show only what could be known before the 2011 disclosure',
      caption: 'What the Hanslope Park files added — and, just as important, what they did not. The "migrated archive" was admitted in 2011, during the Mau Mau litigation, and released from 2012. It supplied the paper trail of authorisation: who in Nairobi and London knew, approved and signed. It did NOT establish the hangings or the camps. David Anderson’s Histories of the Hanged and Caroline Elkins’s Britain’s Gulag were both published in 2005, six years earlier, from the court records, the surviving administrative files and the testimony of survivors. Anyone who tells you the truth about Kenya only emerged in 2011 is wrong, and this atlas will not dramatise a deletion by pretending otherwise.',
      claims: [
        { text: 'The emergency assize courts tried and hanged 1,090 people.', since: 2005, source: 'Anderson, Histories of the Hanged (2005), from the court records.' },
        { text: 'At least 80,000 people were held in detention; over a million were moved into guarded villages.', since: 2005, source: 'Anderson (2005) and Elkins (2005), from the surviving administrative record and survivor testimony.' },
        { text: 'Beating, starvation and forced labour were systematic in the camps.', since: 2005, source: 'Elkins, Britain’s Gulag (2005), from more than three hundred interviews and the surviving camp files.' },
        { text: 'Excess Kikuyu deaths in the 1950s were of the order of 50,000, about half of them children.', since: 2007, source: 'Blacker, African Affairs (2007), from the 1948 and 1962 censuses.' },
        { text: 'Britain removed thousands of files from Kenya at independence and held them secretly at Hanslope Park.', since: 2011, source: 'Foreign and Commonwealth Office admission during the Mau Mau litigation, 2011; files released from 2012.' },
        { text: 'Ministers and senior officials in Nairobi and London authorised the use of force in the camps, and knew what was being done.', since: 2011, source: 'The migrated archive, released from 2012; analysed in Anderson, “Guilty Secrets” (2015), and Bennett, Fighting the Mau Mau (2013).' },
        { text: 'Britain paid £19.9 million to 5,228 Kenyan claimants and expressed regret in Parliament.', since: 2013, source: 'Statement to the House of Commons, 6 June 2013, and the settlement of Mutua and others v FCO.' },
      ],
    },
    extraSources: [
      src({
        author: 'Huw Bennett', work: 'Fighting the Mau Mau: The British Army and Counter-Insurgency in the Kenya Emergency', year: 2013,
        publisher: 'Cambridge University Press',
        nature: 'A military-historical monograph using army records and, for the first time, the released migrated archive.',
        purpose: 'To establish what the British Army as an institution authorised, tolerated and punished in Kenya, and to test the claim that abuse was the work of a few individuals.',
        cannotTell: 'What happened where the army was not the responsible force. Much of the detention system was run by the colonial administration and the Kenya Police Reserve, not by the army, and those records are thinner.',
        supports: 'That the use of force was authorised up the chain of command rather than improvised at the bottom of it.',
        check: 'Huw Bennett, Fighting the Mau Mau (Cambridge: Cambridge University Press, 2013).',
      }),
    ],
    testimony: ['powell-hola-1959', 'kenyatta-facing-1938'],
  },

  /* ==================================================================== 5 == */
  {
    id: 'the-scramble',
    /* DIDACTIC_SPEC §4, tagged with the quiz bank's own key: M10 — "the Scramble for Africa was decided at the Berlin Conference, which carved up the map." Berlin is here as a document, and none of the three positions holds that it did the carving. */
    misconceptions: ['M10'],
    span: [1876, 1902],
    spine: 'T13',
    phase: 'III',
    year: 1885,
    question: 'Why did Europe take almost all of Africa in twenty years? Was it capital looking for a return, or strategy reacting to crises?',
    stake: 'This is the oldest live argument in imperial history and the one where the evidence most obviously fails to line up with the most popular explanation.',
    territories: ['nigeria', 'gold-coast', 'kenya', 'uganda', 'southern-rhodesia', 'northern-rhodesia',
      'egypt', 'british-somaliland', 'nyasaland', 'ashanti', 'bechuanaland', 'zanzibar', 'the-gambia',
      'sierra-leone-protectorate', 'northern-nigeria-protectorate', 'southern-nigeria-protectorate'],
    positions: [
      {
        key: 'hobson',
        who: 'J. A. Hobson, and after him V. I. Lenin',
        badge: 'Imperialism: A Study, 1902 · Imperialism, the Highest Stage of Capitalism, 1917',
        short: 'Surplus capital at home went looking for returns abroad.',
        claim: 'Hobson argued that under-consumption at home — wages too low to absorb what British industry produced — left a surplus of capital whose owners pressed for territory abroad where it could earn more, and that a small financial interest was therefore able to capture the foreign policy of a nation whose people paid for it and did not benefit. Lenin took the mechanism, stripped out Hobson’s reformist conclusion, and made imperialism a necessary stage of capitalism rather than a corruption of it.',
        reads: 'The growth of British overseas investment income; the concentration of finance; the annexations that followed company charters; and the words of the men doing it — including Cecil Rhodes telling W. T. Stead in 1895 that imperialism was the alternative to civil war at home, a passage Lenin quoted because a capitalist saying it was worth more than a socialist saying it.',
        explainAway: 'The money did not go where the flags went. British capital in the 1880s and 1890s went overwhelmingly to the United States, Canada, Australia and Argentina — places Britain did not annex — while the territories annexed in those decades, in tropical Africa, attracted very little of it and mostly cost the Treasury money. Hobson also never checked whether the interests he named actually took the decisions he attributed to them.',
        src: src({
          author: 'J. A. Hobson', work: 'Imperialism: A Study', year: 1902,
          kind: 'primary-source', publisher: 'James Nisbet',
          nature: 'A work of political economy and polemic by a radical English journalist who had reported on the South African War.',
          purpose: 'To argue that imperialism was neither inevitable nor popular but the capture of national policy by a financial interest — and that domestic reform, by raising wages and consumption, would remove the pressure for it.',
          cannotTell: 'Who actually decided. Hobson infers motive from interest without tracing a single annexation decision through the papers of the people who took it, and his account of finance carries antisemitic imagery that later readers have had to reckon with rather than skip.',
          supports: 'The economic explanation of imperialism in the form in which students meet it.',
          check: 'J. A. Hobson, Imperialism: A Study (London: James Nisbet, 1902), Part I — the under-consumption argument is the chapter titled “The Economic Taproot of Imperialism”.',
        }),
      },
      {
        key: 'rg-africa',
        who: 'Ronald Robinson and John Gallagher',
        badge: 'Africa and the Victorians, 1961',
        short: 'A chain reaction set off by Egypt, driven by strategy.',
        claim: 'The partition was not planned in London boardrooms. British ministers acted on strategy — above all the route to India — and on crises they did not choose. The Egyptian state collapsed, Britain occupied it in 1882 to secure the Canal, and that occupation poisoned relations with France and set off a chain of pre-emptive claims up the Nile and across the continent. The decisions were taken by a small group of officials whose shared assumptions — the "official mind" — mattered more than any investor’s balance sheet.',
        reads: 'The Cabinet and Foreign Office papers; the sequence running from the bombardment of Alexandria in 1882 through the Nile valley claims to Fashoda in 1898; and the near-absence of commercial pressure in the documented decisions to claim Uganda, Bechuanaland or the Sudan.',
        explainAway: 'That the official mind is reconstructed from the officials’ own papers — exactly where a self-serving account of motive would be found — and that the account leaves African rulers and armies almost no part in a process they fought at every stage.',
        src: src({
          author: 'Ronald Robinson and John Gallagher, with Alice Denny', work: 'Africa and the Victorians: The Official Mind of Imperialism', year: 1961,
          publisher: 'Macmillan',
          nature: 'A monograph reconstructing British decision-making over Africa from the papers of the men who took the decisions.',
          purpose: 'To replace economic explanations of the partition with a strategic one, and to show that the impulse came from crises at the periphery rather than from pressure at the centre.',
          cannotTell: 'Whether the officials are telling the truth about themselves, and what the people on the other side of those decisions were doing. It is a history of a partition written almost entirely from the partitioners’ files.',
          supports: 'The strategic, crisis-driven account of the Scramble.',
          check: 'Ronald Robinson and John Gallagher, with Alice Denny, Africa and the Victorians: The Official Mind of Imperialism (London: Macmillan, 1961) — the Egyptian chapters carry the argument.',
        }),
      },
      {
        key: 'african-agency',
        who: 'A. Adu Boahen and the African historiography',
        badge: 'General History of Africa VII, 1985',
        short: 'You are both describing a European argument about Africa.',
        claim: 'Both accounts explain the partition as something Europeans did to each other. African states were parties to it: they negotiated, allied, played powers against each other, and fought — and what they did shaped where the lines fell and how long they took to draw. Britain and Asante fought five wars between 1823 and 1900; the Zulu destroyed a British column at Isandlwana in 1879; Ethiopia defeated Italy at Adwa in 1896 and stayed independent. A partition explained only from Whitehall is a partition with one party missing.',
        reads: 'African oral and written records, the treaties themselves and what was said to the rulers who signed them, the military record of resistance from the Asante wars to the Nandi and the Ndebele, and the colonial administrations’ own accounts of how little they controlled.',
        explainAway: 'That it answers a different question. Showing that Africans were agents does not by itself explain why Europe moved when it did, which is what Hobson and Robinson and Gallagher are arguing about.',
        src: src({
          author: 'A. Adu Boahen (ed.)', work: 'General History of Africa, Volume VII: Africa under Colonial Domination 1880-1935', year: 1985,
          kind: 'reference-work', publisher: 'UNESCO and Heinemann',
          nature: 'A volume of a UNESCO project written under African editorial control by many hands.',
          purpose: 'To replace colonial-era histories of Africa with an account written by African scholars, in which African societies are the subject of their own history rather than the object of Europe’s.',
          cannotTell: 'Any one place in depth. It is a continental synthesis reflecting the research of the early 1980s, and its coverage is uneven where the archives are.',
          supports: 'That African states were parties to the partition and fought it, and that the partition took twenty years for that reason.',
          check: 'A. Adu Boahen (ed.), General History of Africa VII: Africa under Colonial Domination 1880–1935 (Paris: UNESCO; London: Heinemann, 1985).',
        }),
      },
    ],
    verdict: {
      balance: 'weighted',
      lead: 'Hobson’s mechanism does not fit the map. His question survives; his answer mostly does not.',
      text: 'The strong finance thesis is not now widely held, for the reason above: capital and flags went to different continents, and tropical Africa cost the Treasury more than it earned for decades. Robinson and Gallagher’s strategic account is the standard one in British historiography, and its standard objection is its source base — a history of the partition written from the partitioners’ own files. The African historiography is not a third answer to the same question so much as a correction to the question: whatever Europe intended, what happened on the ground was decided in part by armies that Europe did not command. And the Berlin Conference, which students are taught carved up Africa, did nothing of the kind: it set procedural rules between Europeans. The borders were drawn afterwards, in dozens of bilateral treaties, and enforced with guns.',
    },
    settleKey: 'Annexations of the 1880s and 1890s where no metropolitan financial interest can be found at all, '
      + 'taken decision by decision through the Cabinet and Foreign Office papers. Uganda and '
      + 'Bechuanaland are the cases that do the most work.',
    settle: 'Where the money went is countable and has been counted; that part is closed. What is not settled is why cabinets acted, and cabinets do not minute their motives honestly. The test that would do most work is a comparative one: find annexations in the 1880s and 1890s with no metropolitan financial interest at all and see whether the strategic account predicts them better than the economic one. Uganda and Bechuanaland are the obvious cases and they favour Robinson and Gallagher.',
    /* SECOND PATH GATE. The lesson's Africa is Egypt, and Robinson and Gallagher's
       own thesis is that the occupation of Egypt in 1882 is what set the partition
       going — so the argument belongs immediately after that beat, where the
       student has just watched the occupation happen and has been told it was
       about a canal and a debt. Three positions, three archives, and the third
       one says the question itself is the wrong way round. */
    pathGate: {
      after: 'egypt',
      spine: 'T13',
      lede: 'You have just watched Britain take Egypt for a canal and a bondholders’ debt. '
        + 'Within twenty years most of Africa was claimed. Hobson says the money did it; Robinson '
        + 'and Gallagher say Egypt did it, and the money followed; Boahen says both are asking a '
        + 'question about Europe and the answer is on the ground in Africa. Say which explains '
        + 'more before you go on.',
      say: 'Why Africa was partitioned. Three historians, three archives. Choose one and say why.',
    },
    parallelTexts: 'berlin',
    testimony: ['rhodes-stead-lenin-1902', 'berlin-act-article-35-1885', 'salisbury-maps-1890'],
  },

  /* ==================================================================== 6 == */
  {
    id: 'waitangi-texts',
    span: [1835, 1865],
    spine: 'T15',
    phase: 'III',
    year: 1840,
    question: 'The Treaty of Waitangi exists in two texts that do not say the same thing. Which one is the treaty?',
    stake: 'This is not a dead question. It was in front of the New Zealand Parliament in 2024–25 and it is argued in the New Zealand courts, and the answer decides what the Crown owes.',
    territories: ['new-zealand'],
    parallelTexts: 'waitangi',
    positions: [
      {
        key: 'crown',
        who: 'The New Zealand Crown’s long-standing legal position',
        whoShort: 'The Crown',
        badge: 'stated in litigation and in Parliament',
        short: 'The Crown gained sovereignty in 1840, however it was understood.',
        claim: 'Sovereignty over New Zealand passed to the Crown in 1840 and the Crown has exercised it ever since; the treaty’s guarantees operate inside that sovereignty rather than against it. The English text cedes "all the rights and powers of Sovereignty" without reservation. Hobson proclaimed sovereignty in May 1840, the proclamation was gazetted in London in October, and the international recognition and the continuous exercise of jurisdiction that followed are what sovereignty consists of in law.',
        reads: 'The English text; Hobson’s proclamations of 21 May 1840 and their publication in the London Gazette; and the unbroken legislative and judicial practice of a state that has governed continuously since 1840 and whose courts have never held otherwise.',
        src: src({
          kind: 'official-record',
          author: 'Captain William Hobson, Lieutenant-Governor', work: 'Proclamations of British sovereignty over the North and South Islands of New Zealand, 21 May 1840',
          year: 1840, publisher: 'Published in the London Gazette, 2 October 1840',
          nature: 'Two proclamations issued by the Crown’s own officer, three and a half months after the first signings, and gazetted in London that October.',
          purpose: 'To put British sovereignty beyond argument in the terms other European states would recognise — the North Island claimed on the ground of cession by the treaty, the South Island on the ground of discovery — at a moment when the New Zealand Company was landing settlers and a French expedition was expected at Akaroa.',
          cannotTell: 'Whether anything had in fact been ceded. A proclamation is the Crown announcing what it holds; it is evidence of the claim and of the date of the claim, and of nothing that any rangatira understood or agreed to. The South Island proclamation rests on discovery, which is not a treaty argument at all.',
          supports: 'The Crown’s position that sovereignty was asserted in 1840 and has been exercised without interruption since.',
          check: 'The London Gazette, 2 October 1840; the texts are printed by Archives New Zealand and in Claudia Orange, The Treaty of Waitangi (1987).',
        }),
        explainAway: 'The signatures. About 540 rangatira signed, and all but 39 signed the Māori text — which says kāwanatanga, governorship, where the English says sovereignty, and in the very next article guarantees tino rangatiratanga, full chieftainship, over lands, villages and treasures. Where two texts of a treaty differ, international law prefers the one the party that did not draft it signed. And the missionaries who translated had the stronger word available: they used rangatiratanga for "kingdom" in the Lord’s Prayer and did not use it in article one.',
      },
      {
        key: 'tribunal',
        who: 'The Waitangi Tribunal, with Ranginui Walker and most Māori scholarship',
        whoShort: 'The Waitangi Tribunal',
        badge: 'He Whakaputanga me te Tiriti, Wai 1040, 2014',
        short: 'They ceded governorship. They did not cede sovereignty.',
        claim: 'The rangatira who signed in February 1840 agreed to share power with the Crown, not to surrender authority to it. They granted the Governor the right to control his own settlers and to deal with the Crown’s subjects; they kept tino rangatiratanga over their own people and lands. That is what the text they signed says, it is what the record of the debates at Waitangi shows they were told, and it is what they said afterwards. Britain had already acknowledged He Whakaputanga, the Declaration of Independence of the United Tribes, signed by northern rangatira in 1835 — which makes 1840 a treaty between recognised parties, not a claim over ownerless land.',
        reads: 'The Māori text; He Whakaputanga of 1835; the missionary and settler records of what was said at Waitangi on 5 February 1840, including Hobson’s own assurances; Nōpera Panakareao’s speech at Kaitaia, and his public reversal of it a year later; and Sir Hugh Kawharu’s 1989 back-translation of the Māori text into English.',
        explainAway: 'That the Crown did in fact govern from 1840, was recognised internationally, and was not effectively resisted in law. The Tribunal itself did not claim to have altered the legal position: its jurisdiction is to inquire into the meaning of the Treaty and the Crown’s conduct under it, not to determine where sovereignty lies today.',
        src: src({
          author: 'Waitangi Tribunal', work: 'He Whakaputanga me te Tiriti / The Declaration and the Treaty: The Report on Stage 1 of the Te Paparahi o Te Raki Inquiry (Wai 1040)', year: 2014,
          kind: 'official-record', publisher: 'Waitangi Tribunal, New Zealand',
          nature: 'The report of a standing commission of inquiry established by the New Zealand Parliament in 1975, with judicial members, hearing evidence on oath.',
          purpose: 'To determine what the northern rangatira who signed in February 1840 understood themselves to be agreeing to, on the evidence of the texts, the recorded debates and Ngāpuhi oral tradition.',
          cannotTell: 'What the law is. The Tribunal’s findings are recommendations; it has no power to alter the constitutional position, and the Crown does not accept its conclusion on cession. It also covers the February 1840 northern signings specifically, not every signing around the country.',
          supports: 'The finding that the rangatira who signed in February 1840 did not cede sovereignty.',
          check: 'Waitangi Tribunal, Wai 1040, He Whakaputanga me te Tiriti (Wellington, 2014), published in full by the Tribunal.',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'Live, and not settled by anybody.',
      text: 'The New Zealand Crown does not accept the Tribunal’s 2014 finding on cession, and the Tribunal did not claim to change the law. What is not in dispute is the philology: the two texts differ, the difference is in the two most important words in the document, and the great majority of signatures are on the Māori one. What is in dispute is what follows from that — whether a state’s continuous exercise of authority since 1840 settles the question, or whether the text the signatories actually signed does. Both positions have real force, and the argument is live: a Treaty Principles Bill, which would have defined the treaty’s principles by statute, was introduced in the New Zealand Parliament in November 2024, drew a record number of public submissions against it, and was voted down at its second reading in April 2025.',
      note: 'And then there is what happened next, which neither position denies. In July 1863 British troops invaded the Waikato. The New Zealand Settlements Act of that year allowed the confiscation of land from iwi declared to be in rebellion, and more than three million acres were taken — including from iwi that had fought on the Crown’s side. Published totals for the raupatu differ, because some of the land was later returned or paid for and the gross and net figures are not the same. The words guaranteeing tino rangatiratanga were twenty-three years old.',
    },
    settleKey: 'No new evidence, and that is the finding. The two texts, the records of the debates and He '
      + 'Whakaputanga are all published and have been argued over for fifty years. What is left is a '
      + 'political question, and New Zealanders will answer it.',
    settle: 'Nothing more will be found in the archive: the texts, the debates and He Whakaputanga are all published and have been argued over for fifty years. This is a question about what a signature means when two documents are in front of it, and it will be answered politically, in New Zealand, by New Zealanders.',
    extraSources: [
      src({
        author: 'Claudia Orange', work: 'The Treaty of Waitangi', year: 1987,
        publisher: 'Allen & Unwin',
        nature: 'The standard scholarly history of the treaty, its negotiation and its first century.',
        purpose: 'To establish, from the missionary, official and Māori record, what was drafted, what was translated, what was said at the signings and what was done afterwards — written as the Waitangi Tribunal’s jurisdiction was being extended back to 1840.',
        cannotTell: 'What the rangatira understood in their own terms. Orange works largely from records written in English by Europeans who were present, and she says so; the Ngāpuhi oral evidence heard by the Tribunal in the 2010s was not available to her.',
        supports: 'The negotiation, the two texts, the signings and their immediate consequences.',
        check: 'Claudia Orange, The Treaty of Waitangi (Wellington: Allen & Unwin, 1987), and the revised illustrated editions since.',
      }),
      src({
        author: 'Vincent O’Malley', work: 'The Great War for New Zealand: Waikato 1800-2000', year: 2016,
        publisher: 'Bridget Williams Books',
        nature: 'A long monograph on the Waikato and the war fought there, built on Crown records, Māori sources and Tribunal evidence.',
        purpose: 'To argue that the invasion of the Waikato in 1863 was the decisive event in New Zealand’s history and that it has been kept out of the national story, and to establish what was taken and from whom.',
        cannotTell: 'The civilian death toll. O’Malley’s own conclusion is that Māori civilian deaths were undercounted and that nobody kept a register, which leaves the figure open at the lower end of every published estimate.',
        supports: 'The 1863 invasion and the confiscations that followed it.',
        check: 'Vincent O’Malley, The Great War for New Zealand: Waikato 1800–2000 (Wellington: Bridget Williams Books, 2016).',
      }),
    ],
    testimony: ['waitangi-english-1840', 'waitangi-maori-1840', 'panakareao-shadow-1840'],
    /* THE AFTERLIFE COUPLING, in two moves rather than one. The point of
       putting the two texts beside a live map is the distance between the
       promise and what followed, and a single jump to 1863 shows only the
       second half of that. So the first press goes to the year of the
       signatures and the second to the year of the confiscations, with the
       words unchanged on screen throughout. The gap is 23 years and the
       student watches it pass. */
    atlasCan: {
      label: 'Hold the words on screen and take the map to 1840',
      note: 'The texts stay open and the map goes to the year of the signatures. New Zealand enters this atlas as a British possession on the strength of the document on your left — the one almost none of the roughly 540 signatories read.',
      year: 1840,
      thenYear: 1863,
      thenNote: 'Twenty-three years on. British troops crossed the Mangatāwhiri in July 1863 and the New Zealand Settlements Act followed in December. More than three million acres were confiscated under it; published totals differ, because some of the land was later returned or paid for. The words guaranteeing tino rangatiratanga are still on your left, unchanged.',
      unitIds: ['new-zealand'],
      reason: 'the year the treaty was signed',
      thenReason: 'the Waikato invasion and the confiscations of 1863–65',
      honest: 'This atlas holds one geometry unit for New Zealand, so the map cannot draw the confiscation blocks themselves — the raupatu lines in Taranaki and the Waikato are not in our geometry, and we will not paint a boundary we do not have. What changes on the plate is the year and the status of the whole country; the acreage is in the record, and it is stated above.',
    },
  },

  /* ==================================================================== 7 == */
  {
    id: 'the-1857-name',
    span: [1856, 1858],
    spine: 'T9',
    phase: 'II',
    year: 1857,
    question: 'In 1857 sepoys mutinied at Meerut and marched on Delhi. Was it a mutiny, a peasant war, or the first war of independence?',
    stake: 'What you call it is a claim about what it was. The British called it the Mutiny for a century, because a mutiny is an army’s internal problem and a war of independence is a country’s.',
    territories: ['british-india', 'bengal-presidency', 'united-provinces', 'punjab-province',
      'central-provinces-and-berar', 'andaman-and-nicobar-islands'],
    positions: [
      {
        key: 'stokes',
        who: 'Eric Stokes',
        badge: 'The Peasant Armed, 1986',
        short: 'Not one rising. Many local ones, with local causes.',
        claim: 'Stokes took the rising away from both the British and the nationalist accounts by going district by district. What he found was not a national movement and not a simple military mutiny either: particular castes, particular villages and particular kinds of landholder rose, and others next door did not, and the pattern follows the revenue settlement — who had lost land, who had gained, who was in debt to whom. The rebellion is best explained as a set of agrarian crises that the collapse of the Bengal Army let loose at the same moment.',
        reads: 'Revenue and settlement records for the districts of the North-Western Provinces and Awadh; the pattern of which villages and which communities rose and which did not; and the correlation between rebellion and recent dispossession under the settlements of the 1830s and 1840s.',
        explainAway: 'Delhi. The sepoys who reached the capital did not behave like men with local grievances: they proclaimed the Mughal emperor Bahadur Shah Zafar their sovereign and set up an administration in his name. A purely agrarian account struggles with a political programme.',
        src: src({
          author: 'Eric Stokes', work: 'The Peasant Armed: The Indian Revolt of 1857', year: 1986,
          publisher: 'Clarendon Press',
          nature: 'A posthumous book assembled by C. A. Bayly from Stokes’s district studies.',
          purpose: 'To explain the rebellion from the agrarian record rather than from either the British military narrative or the nationalist one, and to establish why some districts rose and others did not.',
          cannotTell: 'What the rebels intended politically. Revenue records show who had lost land; they do not show what anybody meant to build, and Stokes’s method deliberately stops short of the question of a national programme.',
          supports: 'The regional and agrarian explanation of the rising.',
          check: 'Eric Stokes, The Peasant Armed: The Indian Revolt of 1857, ed. C. A. Bayly (Oxford: Clarendon Press, 1986).',
        }),
      },
      {
        key: 'mukherjee',
        who: 'Rudrangshu Mukherjee',
        badge: 'Awadh in Revolt, 1984',
        short: 'In Awadh it was a popular war against the whole British order.',
        claim: 'In Awadh, annexed only the year before, the rising was not the army’s and was not confined to dispossessed landholders. Taluqdars, peasants and soldiers fought together, in a province where the British had removed a dynasty, dismantled a court and rewritten every land right within twelve months. What happened there was a broad-based rejection of an alien government, and calling it a mutiny describes the smallest part of it.',
        reads: 'The Awadh records, the pattern of taluqdari and peasant participation, the persistence of resistance in Awadh long after Delhi fell, and the scale of the British reconquest required to end it.',
        explainAway: 'That Awadh was exceptional. It had been annexed in 1856, on a pretext, and its grievance was fresher and more general than anywhere else; a province that had just lost its king is a poor guide to Punjab, which stayed loyal and supplied the troops that retook Delhi.',
        src: src({
          author: 'Rudrangshu Mukherjee', work: 'Awadh in Revolt 1857-1858: A Study of Popular Resistance', year: 1984,
          publisher: 'Oxford University Press',
          nature: 'A regional monograph on one province, written from the colonial records read against the grain.',
          purpose: 'To show that in Awadh the events of 1857 were a popular resistance movement with broad social participation, and to argue against reducing them to a soldiers’ mutiny.',
          cannotTell: 'What was happening elsewhere. It is one province, chosen because the participation was broadest there, and Mukherjee does not claim it stands for India.',
          supports: 'That in at least one large province the rising was popular and general rather than military.',
          check: 'Rudrangshu Mukherjee, Awadh in Revolt 1857–1858: A Study of Popular Resistance (Delhi: Oxford University Press, 1984).',
        }),
      },
      {
        key: 'dalrymple',
        who: 'William Dalrymple',
        badge: 'The Last Mughal, 2006',
        short: 'Read the rebels’ own paperwork. They were governing.',
        claim: 'The Delhi rising had a political programme and left a record of it. The Mutiny Papers in the National Archives of India — some twenty thousand documents in Urdu and Persian, produced by the rebel administration in Delhi during the four months it held the city, from 11 May to the British assault of 14–21 September 1857 — show petitions, pay disputes, food requisitions, complaints against soldiers and orders in the emperor’s name. This is not the paperwork of a mutiny. It is the paperwork of a government, and it had barely been read before the 2000s because the historians of 1857 mostly did not read Urdu.',
        reads: 'The Mutiny Papers themselves; the Delhi court record; and the British accounts of the siege set against the Urdu and Persian material produced inside the city.',
        explainAway: 'Delhi is not India. A rebel administration in one city, however documented, does not establish that the rising elsewhere had the same character — which is Stokes’s point exactly.',
        src: src({
          author: 'William Dalrymple', work: 'The Last Mughal: The Fall of a Dynasty, Delhi 1857', year: 2006,
          publisher: 'Bloomsbury',
          nature: 'A narrative history built on the Mutiny Papers, an Urdu and Persian archive of the rebel administration in Delhi.',
          purpose: 'To tell the story of 1857 in Delhi from the sources produced inside the rebel city rather than from the British siege narratives, and to restore Bahadur Shah Zafar and the Delhi court to the account.',
          cannotTell: 'The rest of the subcontinent. It is a book about one city over four months, and Dalrymple makes no claim that Delhi explains Awadh, Punjab or Bengal.',
          supports: 'That the rebels in Delhi ran an administration in the emperor’s name and left the records of it.',
          check: 'William Dalrymple, The Last Mughal: The Fall of a Dynasty, Delhi 1857 (London: Bloomsbury, 2006); the Mutiny Papers are in the National Archives of India.',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'The name is the argument, and the argument is largely about scale.',
      text: 'Nobody now defends the old British account in which loyal sepoys were misled by rumours about cartridges — the grease was the trigger, not the cause. Nor do many historians defend the pure nationalist account in which 1857 was a single co-ordinated war for an Indian nation that did not yet exist as a political idea. What is left is a real question of scale: was it a set of regional crises that happened to coincide, or a general rejection of British rule that took regional forms? Stokes and Mukherjee are, in a sense, both right about their own provinces, and that is what makes the naming so hard. Indian historians generally call it the first war of independence; British accounts long called it the Mutiny. The Government of India Act 1858 abolished the Company and took India into the Crown, which tells you how the British government read it at the time, whatever it called it afterwards.',
    },
    settleKey: 'The Mutiny Papers in the National Archives of India — some twenty thousand documents in Urdu and '
      + 'Persian from the rebel administration — read whole rather than in summary translation, and '
      + 'comparable regional records for Awadh, Bihar and Rohilkhand.',
    settle: 'The Mutiny Papers are the largest body of the rebels’ own words in existence and they were barely used for a century and a half. More of that archive, read in Urdu and Persian rather than in summary translation, and comparable regional records for Awadh, Bihar and Rohilkhand, is what moves this argument now.',
    /* THE PATH GATE. One dispute on the authored lesson path, nominated here and
       not in the caller, so the path team asks for "the gate" and this module
       decides which argument it is. 1857 is the one: it sits on the spine at T9,
       where the lesson has just watched the Company hand India to the Crown; the
       three positions are three living historians reading three different bodies
       of evidence about the same eighteen months; and the thing at stake is a
       WORD, which is the cheapest possible demonstration that a name is a claim.
       `gate.lede` is the one sentence the transport prints above it. */
    pathGate: {
      after: 'nationalisation',
      spine: 'T9',
      lede: 'Two of these three historians have read records the other has not. Before you go on, '
        + 'say which of them explains more — and what your answer explains that the others do not.',
      say: 'An argument between historians. Choose a side and say why before going on.',
    },
    /* The map can carry this one: the rising and the Act that answered it are a
       year apart, and the atlas holds both years. */
    atlasCan: {
      label: 'Take the map to 1857',
      note: 'The year of the rising. India is still a company’s possession on this map — the East India '
        + 'Company holds it, and every one of these three historians is arguing about what happened '
        + 'inside these lines in the eighteen months that follow.',
      year: 1857,
      thenYear: 1858,
      thenNote: 'One year on. The Government of India Act 1858 abolished the Company and vested India in '
        + 'the Crown. Whatever the British called the rising afterwards, this is what they did about it '
        + 'within twelve months — which is a fact about how seriously they took it.',
      unitIds: ['british-india'],
      reason: 'the year of the rising, with India still held by a company',
      thenReason: 'the Crown takes India directly, by statute, in 1858',
      honest: 'The plate cannot draw where the fighting was. This atlas holds India as territories, not '
        + 'as districts, and the rising was a district-by-district event — which is precisely Stokes’s '
        + 'argument. What changes on the map is who holds India, and the year.',
    },
    testimony: ['gandhi-great-trial-1922'],
  },

  /* ==================================================================== 8 == */
  {
    id: 'nationalism-social-base',
    span: [1885, 1947],
    spine: 'T18',
    phase: 'III',
    year: 1885,
    question: 'Where did Indian nationalism come from — a competing elite, or a mass movement the elite later joined?',
    stake: 'This decides whether Indian independence is a story about a few thousand English-educated men working the system, or about millions of people who were not asked.',
    territories: ['british-india', 'bengal-presidency', 'madras-presidency', 'bombay-presidency', 'united-provinces'],
    positions: [
      {
        key: 'seal',
        who: 'Anil Seal, and the Cambridge school',
        badge: 'The Emergence of Indian Nationalism, 1968',
        short: 'Competition and collaboration among a thin educated elite.',
        claim: 'The Indian National Congress of 1885 was not a national movement. It was a thin stratum of English-educated professionals from three presidency cities, competing for the offices, contracts and status that British rule distributed, and organising because the British had built institutions in which organisation paid. Nationalism, on this account, is what the politics of collaboration looks like when the collaborators start bargaining harder — and the "nation" was assembled afterwards out of provincial and community interests.',
        reads: 'The social composition of early Congress — lawyers, journalists, landholders, and how few of them there were; the correlation between educational and administrative opportunity and political organisation; and the provincial and communal blocs visible in the record of who allied with whom.',
        explainAway: 'What happened next. This account explains the founding of Congress and the 1890s well and cannot explain 1920, 1930 or 1942, when tens of millions of people who were not lawyers in Bombay acted. A theory whose mechanism is elite competition has to account for the Salt March, and it does not.',
        src: src({
          author: 'Anil Seal', work: 'The Emergence of Indian Nationalism: Competition and Collaboration in the Later Nineteenth Century', year: 1968,
          publisher: 'Cambridge University Press',
          nature: 'A monograph on the social composition of early Indian political organisation.',
          purpose: 'To replace the nationalist account of Congress’s origins with a social analysis of who joined it and why, using the categories of interest and opportunity rather than of ideology.',
          cannotTell: 'What people believed. The method reads politics off social position, and it stops in 1900 — before the mass phase of the movement it is often used to explain away.',
          supports: 'The elite-competition account of the origins of organised Indian politics.',
          check: 'Anil Seal, The Emergence of Indian Nationalism (Cambridge: Cambridge University Press, 1968).',
        }),
      },
      {
        key: 'guha',
        who: 'Ranajit Guha and Subaltern Studies',
        badge: 'Elementary Aspects of Peasant Insurgency, 1983',
        short: 'The peasants had their own politics, and every account writes them out.',
        claim: 'Both British and nationalist historiography are elitist: they treat the peasant as an object moved by others — by British policy, by Congress leadership, by outside agitators — and never as a political subject with reasons. Guha argued that peasant insurgency in colonial India had its own consciousness, its own forms and its own logic, legible in the very colonial records that were written to deny it, and that there is an autonomous domain of subaltern politics that the nationalist movement never controlled.',
        reads: 'A century of colonial records of peasant risings, read against the grain: the district officer’s report is evidence of the peasant’s politics precisely in what it refuses to understand. Shahid Amin’s study of Chauri Chaura in 1922 is the exemplary case — a crowd that Gandhi disowned, read from the trial record.',
        explainAway: 'That reading a rebel’s consciousness out of his enemy’s report is a hard method to check, and that an autonomous subaltern domain is easier to assert than to demonstrate. Critics have also asked what the account can say about the organised movement that did, in fact, end British rule.',
        src: src({
          author: 'Ranajit Guha', work: 'Elementary Aspects of Peasant Insurgency in Colonial India', year: 1983,
          publisher: 'Oxford University Press',
          nature: 'A theoretical and historical monograph, and the founding statement of the Subaltern Studies group.',
          purpose: 'To establish that peasant insurgency was a political act with its own structure, and to attack the elitism Guha saw shared by colonial, nationalist and Marxist historiography alike.',
          cannotTell: 'What the insurgents said in their own words. The evidence is almost entirely the colonial record, which is Guha’s explicit problem and the reason the book is a method as much as a history.',
          supports: 'That colonised people acted politically outside and before the organisations that later claimed to speak for them.',
          check: 'Ranajit Guha, Elementary Aspects of Peasant Insurgency in Colonial India (Delhi: Oxford University Press, 1983); Shahid Amin, Event, Metaphor, Memory: Chauri Chaura 1922–1992 (1995).',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'Largely an argument about which question is being asked.',
      text: 'Seal explains the founding of Congress and cannot explain 1930. Guha explains Chauri Chaura and does not try to explain the committee rooms. The strongest position a student can hold here is not a choice between them but a periodisation: an elite organisation founded in 1885 was taken over after 1918 by a leadership that deliberately went looking for a mass base, and the mass that answered had its own reasons, which Congress could summon and could not always control. Gandhi called off the non-cooperation movement in 1922 because of what a crowd did at Chauri Chaura — which is the clearest evidence in the whole story that the movement’s base was not the movement’s creature.',
    },
    settleKey: 'A rising Congress did not organise, read from the record of its own prosecution. Shahid Amin on '
      + 'Chauri Chaura is that test performed once; the trial records of other risings would perform it '
      + 'again.',
    settle: 'This one is not settled by a document but by scope. The test is predictive: take a rising Congress did not organise, and see which account tells you more about why the people in it did what they did. Amin on Chauri Chaura is that test performed once.',
    testimony: ['gandhi-great-trial-1922', 'naoroji-knife-1901'],
  },

  /* ==================================================================== 9 == */
  {
    id: 'was-1783-a-hinge',
    /* DIDACTIC_SPEC §4, tagged with the quiz bank's own key: M5 — "1776 ended the British Empire." Marshall's Making and Unmaking is the spec's own named evidence for M5, and it is one of the two positions. */
    misconceptions: ['M5'],
    span: [1757, 1820],
    spine: 'T5',
    phase: 'I',
    year: 1783,
    question: 'Britain lost thirteen colonies in 1783 and took Bengal in the same decades. Is 1783 the end of one empire and the start of another?',
    stake: 'The periodisation you use decides what a student thinks happened. "First and second empire" produces the belief that the empire ended in 1776 and started again somewhere else.',
    territories: ['great-britain', 'virginia', 'massachusetts-bay', 'bengal-presidency', 'british-india',
      'madras-presidency', 'bombay-presidency', 'canada', 'quebec', 'new-brunswick', 'nova-scotia'],
    positions: [
      {
        key: 'harlow',
        who: 'Vincent T. Harlow, and the textbooks after him',
        badge: 'The Founding of the Second British Empire, 1952 and 1964',
        short: 'A first empire in the Atlantic, a second in the East.',
        claim: 'The loss of America closed one imperial project and opened another. The first empire was Atlantic, mercantilist and built on settlement and slavery; the second was eastern, territorial and built on trade and dominion over dense populations. Harlow argued the swing to the east was already under way before 1783 — the Pacific voyages, the interest in the Far Eastern trade — and that the American war accelerated a reorientation rather than causing it out of nothing.',
        reads: 'The chronology of eastern expansion after 1763; the Pacific voyages; the shift of British investment and attention to India; and the constitutional experiments of the 1780s and 1790s, which look nothing like the settler assemblies of the first empire.',
        explainAway: 'The continuity. The same ministers, the same navy, the same Parliament and often the same families ran both, and the conquest of Bengal was under way for twenty-six years before the American war ended. Treating 1783 as a break also produces exactly the misconception this atlas exists to kill: that losing America ended the empire.',
        src: src({
          author: 'Vincent T. Harlow', work: 'The Founding of the Second British Empire, 1763–1793', year: 1952,
          publisher: 'Longmans, Green (volume one 1952, volume two 1964)',
          nature: 'A two-volume archival history of British imperial policy in the thirty years around the American war, by an Oxford professor of imperial history.',
          purpose: 'To replace the story in which Britain lost an empire in 1783 and absent-mindedly found another, by showing that the swing towards the East, towards trade rather than settlement, and towards dominion over populous countries, was a deliberate reorientation already under way before the American war ended.',
          cannotTell: 'What was happening outside Whitehall. Harlow is writing from British ministerial and Board of Trade papers, so the reorientation he describes is the one visible in London; the Indian, Caribbean and Pacific actors whose decisions shaped the same years are not in his archive and are barely in his account.',
          supports: 'The case that 1783 marks a real turn in the character of the empire, not merely a defeat.',
          check: 'Vincent T. Harlow, The Founding of the Second British Empire, 1763–1793, 2 vols (London: Longmans, 1952 and 1964).',
        }),
      },
      {
        key: 'marshall',
        who: 'P. J. Marshall, with C. A. Bayly',
        badge: 'The Making and Unmaking of Empires, 2005 · Imperial Meridian, 1989',
        short: 'One process. The decades that lost America won Bengal.',
        claim: 'Marshall put America and India in one frame and found the same state doing the same thing in both places at the same time: taxing without consent, garrisoning, and asserting a sovereignty it had not previously claimed. It failed in one and succeeded in the other, and the difference lies in the societies it was dealing with rather than in a change of British policy. Bayly’s account runs the continuity forward: what consolidates after 1780 is a militarised, aristocratic, garrison empire, and its methods in Ireland, India and the Mediterranean are recognisably one thing.',
        reads: 'The parallel record of British policy in America and Bengal between 1750 and 1783 — the same debates about revenue, sovereignty and force, in the same years; and the personnel, finance and military practice that run straight through the supposed break.',
        explainAway: 'That the empire of 1820 really did look different from the empire of 1750, and that a periodisation which refuses any break has to explain why. A student who is told nothing changed will not understand why the nineteenth-century empire ruled so many more people and consulted so many fewer of them.',
        src: src({
          author: 'P. J. Marshall', work: 'The Making and Unmaking of Empires: Britain, India, and America c.1750-1783', year: 2005,
          publisher: 'Oxford University Press',
          nature: 'A comparative monograph treating British America and British India as one field.',
          purpose: 'To dissolve the "first and second empire" periodisation by showing that the same imperial state, in the same decades, was doing the same thing at opposite ends of the world, and to explain why the outcomes differed.',
          cannotTell: 'What happened after 1783. The book stops where the older story starts, so the case for continuity into the nineteenth century has to be made from Bayly and others.',
          supports: 'That the loss of America and the conquest of Bengal were one process, not a pivot between two empires.',
          check: 'P. J. Marshall, The Making and Unmaking of Empires: Britain, India, and America c.1750–1783 (Oxford: Oxford University Press, 2005); C. A. Bayly, Imperial Meridian (London: Longman, 1989).',
        }),
      },
    ],
    verdict: {
      balance: 'weighted',
      lead: 'This atlas has taken Marshall’s side, and it says so on the timeline.',
      text: 'The four-phase spine this atlas is built on marks 1783 as a shock inside the Atlantic phase, not as a boundary — because Marshall and Bayly are persuasive and because the alternative teaches a falsehood students already believe. Harlow’s framework has not disappeared and you will meet it in books: it captures something real about the character of nineteenth-century rule. But dating the break to 1783 makes the loss of America the hinge of British imperial history, and the numbers do not support it. The eighteenth century ends with Britain ruling more people than it ever had, most of them in Asia.',
    },
    settleKey: 'This atlas’s own figures, at 1770 and at 1820. Population and territory under British authority '
      + 'at both dates, computed from the dataset — and you can make it print them.',
    settle: 'The atlas can answer part of this itself, and you should make it. Take the map to 1770, then to 1820, and read the population and territory figures the map computes at each. If 1783 were the end of an empire, the second reading should be smaller.',
    atlasCan: {
      label: 'Take the map to 1770, then to 1820',
      note: 'Two years, one question: was the empire bigger before the American war or after it? The map computes both from the dataset.',
      year: 1770,
      thenYear: 1820,
      reason: 'the extent before the American war and after it',
    },
    testimony: ['burke-fox-bill-1783', 'proclamation-1763'],
  },

  /* =================================================================== 10 == */
  {
    id: 'ornamentalism',
    span: [1835, 1947],
    spine: 'T15',
    phase: 'III',
    year: 1903,
    question: 'When the British looked at the people they ruled, what did they see first — race, or rank?',
    stake: 'Two of the most influential books written about empire answer this differently, and the answer changes what you think the empire was doing to people’s minds.',
    territories: ['british-india', 'great-britain', 'hyderabad', 'mysore', 'rajputana-agency',
      'central-india-agency', 'nigeria', 'northern-nigeria-protectorate', 'jammu-and-kashmir'],
    positions: [
      {
        key: 'said',
        who: 'Edward Said',
        badge: 'Orientalism, 1978',
        short: 'Knowledge about the East was built to rule it.',
        claim: 'European writing about "the Orient" — scholarly, literary, administrative — did not describe an existing object but constructed one: a East that was static, sensual, despotic and incapable of representing itself, and therefore required representation and government by others. That body of knowledge was not incidental to imperial power; it was one of its instruments, and it outlived the empires that produced it.',
        reads: 'The archive of orientalist scholarship, philology and travel writing from the late eighteenth century onward; and the administrative texts that share its assumptions — Macaulay’s Minute on Indian Education of 1835 is the case students meet, where a man who read no Indian language ranks a single shelf of a European library above all the literature of India and Arabia.',
        explainAway: 'That the record is not one voice. Orientalist scholarship contained fierce internal argument, some of it hostile to empire, and Said’s method — reading a large and contentious literature as a single discourse — has been attacked on exactly that ground by historians and by other literary scholars. There are also places where British hierarchy plainly cut across race rather than along it.',
        src: src({
          author: 'Edward W. Said', work: 'Orientalism', year: 1978,
          publisher: 'Pantheon Books',
          nature: 'A work of literary and cultural criticism, not a work of history in the archival sense.',
          purpose: 'To show that Western knowledge about the East was produced inside a relationship of power and helped to sustain it — and to make that visible to readers who took such knowledge for neutral scholarship.',
          cannotTell: 'What administrators actually did. Said is reading texts, mostly French and British literary and scholarly ones; the book does not work from colonial administrative archives and does not claim to explain particular decisions.',
          supports: 'That imperial knowledge about colonised peoples was shaped by, and served, the power to govern them.',
          check: 'Edward W. Said, Orientalism (New York: Pantheon Books, 1978).',
        }),
      },
      {
        key: 'cannadine',
        who: 'David Cannadine',
        badge: 'Ornamentalism, 2001',
        short: 'They saw class at least as much as they saw colour.',
        claim: 'Cannadine argued that the British saw their empire through the lens of the hierarchical society they came from. They looked for rank, recognised it, and cultivated it: an Indian prince outranked an English shopkeeper, and the durbars, the orders of chivalry, the gun salutes and the honours lists were the machinery for binding local elites into one imperial social order. Ornamentalism, in his phrase, was hierarchy made visible — ornamental as much as racial, and the ornament did real work.',
        reads: 'The durbars of 1877, 1903 and 1911; the orders of chivalry created for Indian and colonial elites; the gun-salute table, which fixed how many guns were fired for a ruler — 21 for Hyderabad, Mysore, Baroda, Gwalior and Kashmir, down through 19, 17, 15, 13, 11 and 9, with most of the 565 princely states entitled to none at all; indirect rule as doctrine, in Lugard’s Dual Mandate of 1922; and the treatment of settler and colonial gentry as provincial versions of the British ruling class.',
        explainAway: 'The colour bar. No rank made an Indian eligible for posts that an ordinary British subaltern could hold; the 1923 Devonshire White Paper refused Kenya’s Indian population a common electoral roll and the White Highlands, though they outnumbered the Europeans and had built the country’s railways and towns; and the honours went to men whose grandsons still could not join the clubs. Hierarchy and race were not alternatives to each other in practice.',
        src: src({
          author: 'David Cannadine', work: 'Ornamentalism: How the British Saw Their Empire', year: 2001,
          publisher: 'Allen Lane',
          nature: 'An interpretive essay by a historian of the British aristocracy, written explicitly as a supplement and corrective to Said.',
          purpose: 'To argue that the British perceived their empire through class and hierarchy as much as through race, and that historians attending only to race had missed how the system actually held together.',
          cannotTell: 'What being ranked felt like from below, or how far the ornament reached. Cannadine works largely from ceremonial, honorific and elite sources; the book has been criticised for what it leaves out, which is most of the violence.',
          supports: 'That hierarchy and status were central to how the British organised and understood imperial rule.',
          check: 'David Cannadine, Ornamentalism: How the British Saw Their Empire (London: Allen Lane, 2001).',
        }),
      },
    ],
    verdict: {
      balance: 'weighted',
      lead: 'Not symmetrical, and not simply opposed.',
      text: 'Cannadine wrote Ornamentalism as a supplement to Said, not as a refutation, and its own weakness is what it does not look at: a book about durbars and honours can be entirely accurate about durbars and honours and still leave out the colour bar, the massacre and the famine. Said’s weakness is the opposite — a method that reads a large, argumentative literature as one discourse and does not follow it into any particular decision. The strongest reading holds both: the British ranked people obsessively, and race set the ceiling on where any ranking could take you. Test it on this atlas’s own documents. Macaulay in 1835 and the Devonshire White Paper of 1923 are here. Ask which account predicts what they say.',
    },
    settleKey: 'Cases where a colonial elite was honoured and still excluded: the Indian princes, the Kenyan '
      + 'Indian community under the Devonshire White Paper of 1923, the Māori knights. What the honour '
      + 'bought, and where it stopped.',
    settle: 'This is not settled by a new document but by cases. Take a colonial elite that was honoured and still excluded — the Indian princes, the Kenyan Indian community, the Māori knights — and ask what the honour bought and where it stopped. Where rank overrides race, Cannadine gains; where it does not, Said does.',
    testimony: ['macaulay-minute-1835', 'lugard-dual-mandate-1922'],
  },

  /* =================================================================== 11 == */
  {
    id: 'irish-famine-intent',
    span: [1845, 1852],
    spine: 'T16',
    phase: 'III',
    year: 1847,
    question: 'A million people died in Ireland between 1845 and 1852 while food was exported. Was that policy, incapacity, or something the law calls genocide?',
    stake: 'The Irish famine is the case where the difference between "they let it happen", "they could not stop it" and "they meant it" has to be argued rather than assumed — and the evidence points different ways on each.',
    territories: ['ireland'],
    positions: [
      {
        key: 'mitchel',
        who: 'John Mitchel, and the tradition after him',
        badge: 'The Last Conquest of Ireland (Perhaps), 1861',
        short: 'The blight was natural. The famine was made.',
        claim: 'Mitchel’s sentence is the most quoted in Irish history: the Almighty sent the potato blight, but the English created the famine. The claim is that a government which continued to permit food exports from a starving country, which wound up its relief works, which transferred the cost of relief to Irish poor rates in 1847, and whose senior official wrote of the famine as a divine judgement, was not failing to prevent deaths but choosing to permit them.',
        reads: 'The export figures for grain, butter and livestock leaving Irish ports through the famine years; the Gregory clause of 1847, which denied relief to anyone holding more than a quarter-acre and so made destitution the price of food; the transfer of relief to Irish rates; and Charles Trevelyan’s own published words about a judgement of God on an indolent people.',
        explainAway: 'That intent is a high bar and the record is mixed. Mitchel was a revolutionary propagandist writing fifteen years afterwards from exile, and his argument works by selection. Relief did reach millions of people through the soup kitchens of 1847, at a cost the Treasury resented; and the same government did not act this way in comparable crises elsewhere in the United Kingdom, which is what a claim of deliberate extermination has to explain.',
        src: src({
          author: 'John Mitchel', work: 'The Last Conquest of Ireland (Perhaps)', year: 1861,
          kind: 'primary-source',
          nature: 'A political polemic by an Irish revolutionary, written in exile after transportation.',
          purpose: 'To establish, for an Irish and Irish-American readership, that the famine deaths were the result of British policy and not of natural disaster — and to make that case serve a movement for separation.',
          cannotTell: 'What was decided in London and why. Mitchel had no access to Treasury or Cabinet papers, wrote fifteen years after the events, and selected his evidence for effect. It is evidence of a case being made, and of the memory that case created.',
          supports: 'The claim that the famine was made by policy, in the form in which it entered Irish political memory.',
          check: 'John Mitchel, The Last Conquest of Ireland (Perhaps) (Dublin, 1861); the food-export figures are in the parliamentary returns.',
        }),
      },
      {
        key: 'kinealy',
        who: 'Christine Kinealy',
        badge: 'This Great Calamity, 1994',
        short: 'Relief was cut while the dying went on, and that was decided.',
        claim: 'Kinealy read the relief administration month by month and found that its provision did not fail so much as it was withdrawn. The soup kitchens of 1847 fed about three million people a day at their peak — proof that the state could reach the starving — and they were closed in September of that year, with mortality still rising, and the cost of relief transferred to Irish poor rates that the worst-hit unions could not raise. Her argument is that the response after the summer of 1847 was shaped by a settled intention to use the crisis to change Irish landholding and Irish habits, and that ministers acted knowing what the consequences would be. Not a plan to destroy a people: a policy pursued through their deaths.',
        reads: 'The Treasury, Relief Commission and Poor Law files read month by month rather than in aggregate; the scale and closure of the soup-kitchen scheme in 1847; the Poor Law Extension Act and the Gregory clause; the rate-in-aid of 1849; and the private charity that was raised where the state withdrew.',
        explainAway: 'That the same summer produced the largest relief operation the British state had then mounted, which does not look like a government indifferent to Irish lives; and that knowing is not the same as intending — the distinction Ó Gráda presses, and the one the files themselves cannot close.',
        src: src({
          author: 'Christine Kinealy', work: 'This Great Calamity: The Irish Famine 1845-52', year: 1994,
          publisher: 'Gill and Macmillan',
          nature: 'A documentary history of famine relief built on the Treasury, Relief Commission and Poor Law records.',
          purpose: 'To test the account then dominant in Irish academic history — that the British state did what a nineteenth-century state could — against the administrative record of what it actually authorised, month by month, as the mortality rose.',
          cannotTell: 'Intent in the legal sense. The files show what was decided and when, and that the deciders were informed; the step from a decision taken in knowledge of its consequences to a purpose of destroying a people is an inference the papers do not themselves make.',
          supports: 'That relief was restricted by decision after the summer of 1847, at a point when the government knew the mortality was still rising.',
          check: 'Christine Kinealy, This Great Calamity: The Irish Famine 1845–52 (Dublin: Gill and Macmillan, 1994); and A Death-Dealing Famine: The Great Hunger in Ireland (London: Pluto Press, 1997).',
        }),
      },
      {
        key: 'ogrady',
        who: 'Cormac Ó Gráda',
        badge: 'Black ’47 and Beyond, 1999',
        short: 'Ideology and meanness, on a scale no state then could have met.',
        claim: 'Ó Gráda’s economic history holds that the relief effort was real, inadequate, and constrained by an ideology — providentialism, political economy, a horror of dependency — that made ministers unwilling to do what was needed. But he argues the scale of the crisis exceeded the administrative capacity of any nineteenth-century state, that the exports were small against the size of the shortfall, and that the evidence does not support intent to destroy. The failure was of will and doctrine rather than of purpose.',
        reads: 'Harvest and mortality series, the price data, the relief expenditure and its timing, the volume of exports set against the size of the calorie deficit, and comparative work on famines in other nineteenth-century states.',
        explainAway: 'That the same doctrine was not applied to English distress, and Kinealy’s month-by-month reading of the relief files, which has provision tightening after the summer of 1847 while the mortality was still rising — a sequence that is hard to read as capacity running out rather than as a decision being taken.',
        src: src({
          author: 'Cormac Ó Gráda', work: 'Black ’47 and Beyond: The Great Irish Famine in History, Economy, and Memory', year: 1999,
          publisher: 'Princeton University Press',
          nature: 'An economic history using demographic, price and harvest series alongside folklore and memory.',
          purpose: 'To establish what the quantitative record can and cannot support about the famine’s causes, scale and relief, against both nationalist and revisionist accounts.',
          cannotTell: 'Intent. Series about food, prices and deaths cannot reach what ministers meant, and Ó Gráda is explicit that the question of culpability is not one his data settle.',
          supports: 'The scale of the mortality, the limits of the relief effort, and the argument against a finding of deliberate extermination.',
          check: 'Cormac Ó Gráda, Black ’47 and Beyond (Princeton: Princeton University Press, 1999); and Christine Kinealy, This Great Calamity (Dublin: Gill and Macmillan, 1994).',
        }),
      },
    ],
    verdict: {
      balance: 'weighted',
      lead: 'The disagreement is about intent and capacity, not about the deaths or the exports.',
      text: 'Nobody in this argument disputes that about a million people died, that about a million more emigrated, or that food left Irish ports throughout. What is argued is why. Most economic historians, Ó Gráda among them, hold that the "genocide" finding does not fit the evidence about intent; Kinealy, reading the same years through the relief files rather than through the price series, has policy after the summer of 1847 tightening as the mortality rose, with ministers informed throughout. The most defensible position is uncomfortable and precise: a government with the means to reduce the mortality substantially chose not to use them, for reasons it stated openly at the time, and it did so to a part of the United Kingdom it would not have treated that way had the deaths been in Kent.',
    },
    settleKey: 'The Treasury and Relief Commission papers, which are open — set beside what the same state did '
      + 'with the same doctrine in the Scottish Highland potato failure of the same years, and in the '
      + 'Indian famines of the 1870s.',
    settle: 'The Treasury and Relief Commission papers are open and have been worked over. What would still move this is comparison: what did the same state do, with the same doctrine, in the Scottish Highland potato failure of the same years, and in the Indian famines of the 1870s? The pattern across the three is the real evidence about intent.',
    /* THIRD PATH GATE. It goes after the compensation beat, and the placement is
       the argument: Parliament voted twenty million pounds to compensate slave-owners
       in 1833 and the Treasury paid it out; twelve years later the same Treasury ran
       the relief in Ireland, and the man who ran it wrote about a judgement of God on
       an indolent people. The student has just been shown what that state could find
       money for. This asks them what to call what it did next. */
    pathGate: {
      after: 'compensation',
      spine: 'T16',
      lede: 'Parliament voted twenty million pounds to compensate slave-owners and the Treasury '
        + 'paid it. Twelve years later the same Treasury was running famine relief in Ireland, '
        + 'and about a million people died while food went on leaving Irish ports. Three '
        + 'historians read that differently. Say which of them explains more before you go on.',
      say: 'A million dead while food was exported. Policy, incapacity, or something worse — choose and say why.',
    },
    testimony: ['trevelyan-1846', 'mitchel-last-conquest-1861'],
  },

  /* =================================================================== 12 == */
  {
    id: 'partition-authorship',
    span: [1940, 1948],
    spine: 'T19',
    phase: 'IV',
    year: 1947,
    question: 'Who is responsible for the partition of India — and why can nobody say how many it killed?',
    stake: 'Two things are argued here at once: an argument about causation with a named and unpopular position, and a counting problem that cannot be solved.',
    territories: ['british-india', 'punjab-province', 'bengal-presidency', 'sindh', 'north-west-frontier-province'],
    positions: [
      {
        key: 'jalal',
        who: 'Ayesha Jalal',
        badge: 'The Sole Spokesman, 1985',
        short: 'Jinnah wanted a bargaining position, not a separate country.',
        claim: 'Jalal argued from the League’s own records that the demand for "Pakistan" was, for most of its life, a negotiating instrument. Jinnah needed to be recognised as the sole spokesman for India’s Muslims in order to win a share of power at the centre of a united India, and an undefined demand for separate statehood was the only lever that could unite the Muslim-majority provinces behind him. Partition, on this account, was not what Jinnah was playing for; it was the outcome when Congress called the bluff and the British left in a hurry.',
        reads: 'The League’s internal papers, the Lahore Resolution of 1940 and its deliberate vagueness, the Cabinet Mission negotiations of 1946, and Jinnah’s own conduct at the points where a smaller sovereign Pakistan was on offer and he did not take it.',
        explainAway: 'That the demand mobilised millions of people who did not read it as a bargaining chip, and that reconstructing an intention from a negotiator’s tactics is a method that can prove almost anything about almost anyone. The argument is unpopular in both India and Pakistan, for opposite reasons, which is a mark in its favour and not an argument for it.',
        src: src({
          author: 'Ayesha Jalal', work: 'The Sole Spokesman: Jinnah, the Muslim League and the Demand for Pakistan', year: 1985,
          publisher: 'Cambridge University Press',
          nature: 'A revisionist political monograph built on the Muslim League’s papers and the transfer-of-power records.',
          purpose: 'To reconstruct Jinnah’s strategy from what he did rather than from what either successor state later said he had wanted, and to explain why the demand for Pakistan was kept undefined for so long.',
          cannotTell: 'What Jinnah privately intended. The argument reads intention off negotiating behaviour, and Jinnah left no confidential account. It is also a study of high politics: the people who moved, and died, are not in it.',
          supports: 'That the Pakistan demand functioned as a bargaining instrument in a struggle over the centre, and that partition was not its inevitable end.',
          check: 'Ayesha Jalal, The Sole Spokesman (Cambridge: Cambridge University Press, 1985).',
        }),
      },
      {
        key: 'british-authorship',
        who: 'Yasmin Khan, with Ian Talbot and Gurharpal Singh',
        whoShort: 'Yasmin Khan',
        badge: 'Khan, The Great Partition, 2007 · Talbot and Singh, 2009',
        short: 'A line drawn in five weeks by a man who had never been there.',
        claim: 'Whatever the Indian parties wanted, the partition that happened was designed and executed by the departing power. Mountbatten brought the date forward by ten months. Cyril Radcliffe, a British lawyer who had never visited India, was given about five weeks to draw a boundary through Punjab and Bengal, and the award was not published until two days after independence — so people celebrated in places whose country was not yet known. No adequate provision was made for the movement or protection of the populations the line would cut through.',
        reads: 'The transfer-of-power papers; Radcliffe’s terms of reference and his timetable; the decision to withhold the award until 17 August 1947; and the near-absence of any plan for population movement in a partition that produced the largest displacement of the twentieth century.',
        explainAway: 'That a line has to be drawn by somebody, that both Indian parties accepted partition, and that blaming the surveyor for the war can serve as a way of not looking at the politics that made the surveyor necessary — which is Jalal’s point about the Indian parties, and it does not go away.',
        src: src({
          author: 'Yasmin Khan', work: 'The Great Partition: The Making of India and Pakistan', year: 2007,
          publisher: 'Yale University Press',
          nature: 'A social and political history of the partition built on official records, press and personal testimony.',
          purpose: 'To describe how partition was decided at the top and experienced at the bottom in the same book, and to establish how little the people affected were told or protected.',
          cannotTell: 'The death toll. Khan gives a range and says why; no one counted, and the sources that would allow a count were never made.',
          supports: 'The speed of the British timetable and the absence of any plan for the people the line divided.',
          check: 'Yasmin Khan, The Great Partition: The Making of India and Pakistan (New Haven: Yale University Press, 2007); Ian Talbot and Gurharpal Singh, The Partition of India (Cambridge, 2009).',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'Two arguments, and only one of them can be settled.',
      text: 'On responsibility, Jalal’s thesis remains a live minority position: influential, taught everywhere, accepted by few in either successor state. Most accounts now distribute the responsibility — a British government leaving fast and cheaply, a Congress that would not concede a federal centre weak enough to hold the League, and a League leader whose instrument became his outcome. On the counting there is no argument to have, because the evidence does not exist. The published estimates run from about 200,000 dead to about two million, and displacement from twelve to eighteen million. The low figures come from contemporary administrative reports and refugee registrations, which counted what officials could see in districts where administration had collapsed. The high figures come from demographic reconstruction, which infers missing populations from census comparison and cannot distinguish a death from a migration that was never recorded. Neither method is dishonest. Neither can be made to yield a number.',
      note: 'A range with a reason is not a failure of research. It is the correct answer, and knowing why a number is uncertain is a higher skill than knowing the number.',
    },
    settleKey: 'On the count: nothing, and that is the answer. No census was taken across the line and the '
      + 'administrations that would have counted had broken down. On responsibility: the twelve volumes '
      + 'of the transfer-of-power papers, and the Indian and Pakistani party archives as they open.',
    settle: 'Nothing will settle the count: no census was taken across the line in 1947 and the administrations that would have counted had themselves broken down. On responsibility, the transfer-of-power papers are published in twelve volumes and the Indian and Pakistani party archives are increasingly open — that is where the argument is still moving.',
    testimony: ['nehru-tryst-1947'],
  },

  /* =================================================================== 13 == */
  {
    id: 'contingency-or-structure',
    /* DIDACTIC_SPEC §4, tagged with the quiz bank's own key: M11 — "empire made ordinary British people rich." Cain and Hopkins's gentlemanly capitalism is the spec's own named evidence for M11, stated here in the form its authors would recognise rather than as a slogan. */
    misconceptions: ['M11'],
    span: [1914, 1970],
    spine: 'T1',
    phase: 'IV',
    year: 1942,
    question: 'Did the British Empire fall because of what happened, or because of what it was?',
    stake: 'This is the argument about whether history has causes you could have changed. It is also the one that decides whether 1942 in Singapore mattered.',
    territories: ['great-britain', 'singapore', 'federation-of-malaya', 'british-india', 'straits-settlements'],
    positions: [
      {
        key: 'darwin',
        who: 'John Darwin',
        badge: 'The Empire Project, 2009',
        short: 'An improvised system that could have held longer, and did not.',
        claim: 'Darwin describes the British world-system as a coalition rather than a design: the City, the dominions, India, the shipping lines, the Navy and a set of local collaborations, each with its own interest, held together while conditions allowed. There was no master plan and no single engine. Its survival depended on things that could have gone otherwise, and what killed it was a specific sequence — two world wars, a lost Asian position in 1942, insolvency, and American and Soviet pressure — rather than an internal contradiction working itself out.',
        reads: 'The system’s finances and its dependence on the sterling area; the dominions’ divergent choices; the sequence from 1914 to 1947, and above all the collapse of the Asian position in 1942, after which the Indian and Southeast Asian bargains could not be put back.',
        explainAway: 'That if everything is contingent, nothing is explained. An account built on sequence has trouble saying why it was Britain that built the largest empire and not Portugal, and it can slide into narrative where an explanation was wanted.',
        src: src({
          author: 'John Darwin', work: 'The Empire Project: The Rise and Fall of the British World-System, 1830-1970', year: 2009,
          publisher: 'Cambridge University Press',
          nature: 'A large synthetic monograph on the British imperial system as a whole.',
          purpose: 'To explain the empire as a world-system of interlocking and partly independent interests, and to argue that its collapse was contingent on a sequence of shocks rather than structurally predetermined.',
          cannotTell: 'What it was like to be governed. Darwin is writing about the system from the level of states, capital and strategy; the colonised appear mainly as the collaborators and nationalists whose choices the system had to accommodate.',
          supports: 'The contingent, sequence-driven account of imperial decline.',
          check: 'John Darwin, The Empire Project: The Rise and Fall of the British World-System, 1830–1970 (Cambridge: Cambridge University Press, 2009).',
        }),
      },
      {
        key: 'cain-hopkins',
        who: 'P. J. Cain and A. G. Hopkins',
        badge: 'British Imperialism, 1993',
        short: 'One interest ran it: gentlemanly capitalism in the City.',
        claim: 'Cain and Hopkins identified a continuous metropolitan interest — the alliance of City finance, the service sector and the landed and professional gentry, whose income came from rent, dividends and fees rather than from manufacturing — and argued that its needs shaped British expansion and British retreat from the late seventeenth century to the twentieth. Empire follows the requirements of that interest: free trade when it suited, annexation when it was needed, sterling and the City to the last. Structure, not accident.',
        reads: 'The composition of British overseas investment and invisible earnings; the social background of the ministers, officials and bankers who made policy; the defence of sterling and the City through the twentieth century; and the fit between financial crises and imperial interventions, Egypt in 1882 being the exemplary case.',
        explainAway: 'Tropical Africa. Very little British capital went to the territories annexed in the 1880s and 1890s, and many of them cost the Treasury money for decades. An account driven by the City’s interest has to show that interest deciding particular things, and in those cases it is hard to find.',
        src: src({
          author: 'P. J. Cain and A. G. Hopkins', work: 'British Imperialism: Innovation and Expansion 1688-1914', year: 1993,
          publisher: 'Longman',
          nature: 'A two-volume reinterpretation of British imperial history built on the economic and social composition of the metropolitan elite.',
          purpose: 'To identify a single continuous interest — "gentlemanly capitalism" — behind three centuries of British expansion, and to displace explanations built on industry or on strategy alone.',
          cannotTell: 'Whether the interest caused the decisions. The correlation between financial interest and imperial action is well documented; the mechanism connecting a social group to a specific Cabinet decision is much harder to show, and critics have pressed on exactly that.',
          supports: 'The structural, metropolitan-interest account of British expansion and decline.',
          check: 'P. J. Cain and A. G. Hopkins, British Imperialism: Innovation and Expansion 1688–1914, and British Imperialism: Crisis and Deconstruction 1914–1990 (London: Longman, 1993).',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'The most useful disagreement in the book, because each position makes a testable prediction.',
      text: 'Cain and Hopkins predict that where the City’s interest was absent, expansion should not have happened — so a well-documented annexation with no metropolitan financial interest is a problem for them, and tropical Africa supplies several. Darwin predicts that small changes in the sequence should have changed the outcome — so if the Asian position had held in 1942, the empire should have lasted materially longer, and that is a counterfactual you can argue but not observe. Most working historians use both: a structural account of why Britain was in a position to expand at all, and a contingent one of what actually happened to it in the twentieth century. That is not a fudge; it is two different questions.',
    },
    settleKey: 'For Cain and Hopkins, the annexations of the 1880s and 1890s one at a time, asking whether a '
      + 'financial interest can be shown to have moved each decision. For Darwin, 15 February 1942 — and '
      + 'a counterfactual you can argue but never observe.',
    settle: 'Two tests, both partly performable. For Cain and Hopkins: take the annexations of the 1880s and 1890s, one by one, and ask whether a financial interest can be shown to have moved the decision. For Darwin: 15 February 1942, when about 80,000 troops at Singapore surrendered to a smaller Japanese force. Whether the Asian empire could have been rebuilt after that is the hinge of the contingent account, and this atlas puts the date on the timeline for exactly that reason.',
    atlasCan: {
      label: 'Take the map to 15 February 1942',
      note: 'The Fall of Singapore. Darwin’s account turns on whether anything after this could have been put back.',
      year: 1942,
      unitIds: ['singapore'],
      reason: 'the surrender at Singapore, 15 February 1942',
    },
    testimony: ['macmillan-wind-1960'],
  },

  /* =================================================================== 14 == */
  {
    id: 'did-britain-care',
    span: [1880, 1960],
    spine: 'T1',
    phase: 'III',
    year: 1900,
    question: 'Did ordinary British people know about the empire, or care?',
    stake: 'If most Britons barely noticed, the empire was a project of a governing class and the country cannot be said to have chosen it. If it saturated everyday life, the responsibility is much wider — and so is the inheritance.',
    territories: ['great-britain', 'ireland'],
    positions: [
      {
        key: 'porter',
        who: 'Bernard Porter',
        badge: 'The Absent-Minded Imperialists, 2004',
        short: 'Most of them did not know and did not care.',
        claim: 'Porter argues that empire was the business of a small governing and administrative class, and that the evidence for its saturation of British popular culture has been badly overread. Imperial imagery being available is not the same as people consuming it, and consumption is not the same as belief. Working-class Britons in the nineteenth century had more immediate concerns; the empire appears rarely in what they wrote, and school curricula and popular texts carried much less of it than the saturation thesis assumes.',
        reads: 'School syllabuses and textbooks; working-class autobiography, diaries and letters; the content of popular newspapers and periodicals against the claims made for them; and the social composition of the people who actually staffed and profited from the imperial service.',
        explainAway: 'The volume of imperial material MacKenzie and others have documented — the exhibitions, the juvenile literature, the missionary societies, the advertising, the music hall — and the fact that an absence of comment is weak evidence of an absence of assumption. What is taken for granted is exactly what does not get written down.',
        src: src({
          author: 'Bernard Porter', work: 'The Absent-Minded Imperialists: Empire, Society, and Culture in Britain', year: 2004,
          publisher: 'Oxford University Press',
          nature: 'A monograph in social and cultural history arguing against the prevailing account in its own field.',
          purpose: 'To test the claim that empire saturated British domestic culture, and to argue that it did not — that most Britons were largely indifferent to it for most of the period.',
          cannotTell: 'What people assumed without saying. The method depends on what was written down, and an argument from silence is the weakest kind of argument about belief.',
          supports: 'The case that imperial enthusiasm was concentrated in a small class rather than general.',
          check: 'Bernard Porter, The Absent-Minded Imperialists (Oxford: Oxford University Press, 2004).',
        }),
      },
      {
        key: 'mackenzie',
        who: 'John M. MacKenzie, and Catherine Hall with Sonya Rose',
        badge: 'Propaganda and Empire, 1984 · At Home with the Empire, 2006',
        short: 'It was in the schoolbooks, the shops and the family.',
        claim: 'MacKenzie documented an imperial culture running through juvenile literature, exhibitions, the music hall, missionary appeals, advertising and the cinema, sustained by organised propaganda from the 1880s. Hall and Rose’s collection pushed further: empire was not merely represented at home, it constituted the home — in who Britons married, where their income came from, what they ate and drank, and how they understood themselves as a people. The metropole and the colony are one field of analysis, not two.',
        reads: 'The imperial content of school readers, boys’ papers and exhibitions; the records of missionary and propagandist organisations; consumption patterns for sugar, tea, cotton and tobacco; and the family, business and municipal records that link particular British towns to particular colonial economies.',
        explainAway: 'Porter’s objection, which is real: producing imperial material proves that somebody wanted it consumed, not that it was believed. And "constitutive" is a claim that is hard to make falsifiable — if everything in British life is imperial, the word stops selecting anything.',
        src: src({
          author: 'John M. MacKenzie', work: 'Propaganda and Empire: The Manipulation of British Public Opinion 1880-1960', year: 1984,
          publisher: 'Manchester University Press',
          nature: 'A monograph on organised imperial propaganda and popular culture, and the founding book of a large series.',
          purpose: 'To establish that imperial ideas were deliberately propagated to the British public through schooling, entertainment and voluntary organisations, and that they took hold.',
          cannotTell: 'What audiences made of it. The evidence is overwhelmingly what was produced and distributed; reception is inferred, and that inference is precisely what Porter attacks.',
          supports: 'That an organised imperial culture existed in Britain and reached a mass audience.',
          check: 'John M. MacKenzie, Propaganda and Empire (Manchester: Manchester University Press, 1984); Catherine Hall and Sonya O. Rose (eds), At Home with the Empire (Cambridge, 2006).',
        }),
      },
    ],
    verdict: {
      balance: 'open',
      lead: 'Unresolved, and unusually hard to resolve.',
      text: 'This is an argument about what was in ordinary people’s heads, and almost all the surviving evidence is what was produced at them rather than what they thought. Porter is right that presence does not prove belief; MacKenzie and Hall are right that an absence of comment is not an absence of assumption. Where the two sides have converged is on distinguishing knowledge from attitude: many Britons could not have named a colony and still lived in an economy, a diet and a self-image that empire had made. That is not indifference and it is not enthusiasm, and the vocabulary for it is still being worked out.',
    },
    settleKey: 'Evidence of what people believed rather than of what they were sold: Mass Observation from 1937, '
      + 'the wartime social surveys, and the earliest opinion polling. All of it arrives at the very end '
      + 'of the period in dispute, which is itself the finding.',
    settle: 'Systematic evidence about what ordinary people believed, rather than what they were sold. Mass Observation from 1937, the wartime social surveys and the earliest polling are the first bodies of that kind of evidence, and they arrive at the very end of the period in dispute — which is itself the finding.',
    /* THE ONE ARGUMENT WITH NO DOCUMENT IN IT, until now. Thirteen of the
       fourteen name a text made at the time; this one named none, so the panel
       that says what an argument stands on printed works and nothing else.
       Dyer's evidence to the Hunter Committee is the document the argument
       turns on, because what Britain did WITH it in 1920 — the Commons debate,
       the Lords vote the other way, and a public subscription for him — is the
       sharpest evidence either position has about whether Britain cared. It is
       also the document produce.js asks the student to write the four lines
       about, standing inside the argument it belongs to. */
    testimony: ['dyer-hunter-1920'],
  },
];

/* ------------------------------------------------------------------ index -- */

const BY_TERRITORY = new Map();
for (const d of DISPUTES) {
  for (const t of d.territories || []) {
    if (!BY_TERRITORY.has(t)) BY_TERRITORY.set(t, []);
    BY_TERRITORY.get(t).push(d);
  }
}

export function disputesFor(territoryId) {
  return BY_TERRITORY.get(territoryId) || [];
}

export function disputeById(id) {
  return DISPUTES.find((d) => d.id === id) || null;
}

/* ------------------------------------------------------------- the gate ----
 * WHICH ARGUMENTS THE LESSON PATH GETS, decided here and not by the caller.
 *
 * The path team asks for "the gate"; this module answers with the dispute it
 * has nominated, so that changing which argument the lesson stops on is a
 * one-line edit in the file that holds the arguments rather than a coordinated
 * change across two modules. `pathGate.after` names the beat the argument
 * belongs beside, so a caller that wants to place it can, and a caller that
 * does not can ignore it.
 *
 * ROUND 3 MADE IT THREE. The path critic found that "the path never meets
 * famine or the Scramble": T13 and T16 are in the quiz bank, in the disputes
 * and in the teaching desk, and nowhere on the twenty-four steps. Both of those
 * arguments were already written, sourced and gated in this file — they were
 * simply not nominated. Nominating them is this module's whole share of that
 * fix, and it costs the caller one lookup:
 *
 *   compensation    → irish-famine-intent   T16   the famine, and what to call it
 *   nationalisation → the-1857-name         T9    the default; the word for 1857
 *   egypt           → the-scramble          T13   Berlin, and why Africa was partitioned
 *
 * The order above is the order of the beats on the thirty-minute path, and it
 * is the caller's business, not ours: `gateFor(beatId)` is how a path asks.
 * A path that wants exactly one gate should keep taking `defaultGate()`, which
 * is still 1857 and does not move when another argument is nominated.
 */
export const PATH_DEFAULT = 'the-1857-name';

export function pathGates() {
  return DISPUTES.filter((d) => d.pathGate);
}

/** The argument nominated for a named beat, or null. This is the whole API a
 *  path needs to rotate: ask at every beat, mount when the answer is not null. */
export function gateFor(beatId) {
  if (!beatId) return null;
  return pathGates().find((d) => d.pathGate.after === beatId) || null;
}

/** The one gate a caller that asks for no particular argument gets. Named, so
 *  that nominating a second and a third does not silently move it. */
export function defaultGate() {
  return disputeById(PATH_DEFAULT) || pathGates()[0] || DISPUTES[0] || null;
}

/* --------------------------------------------------- the misconceptions ----
 * DIDACTIC_SPEC §4 names eighteen, and the app tags them `misconception: 'M7'`
 * — the quiz bank's key, used here so the two are one vocabulary. An argument
 * between historians is not an activation and it is not a refutation: it is the
 * thing a student needs AFTER the misconception has been broken, which is the
 * discovery that the replacement model is itself contested. So these tags say
 * "the argument behind this misconception is here", and a caller that has just
 * corrected M15 can find it.
 *
 * Only exact matches are tagged. A dispute that merely touches a misconception
 * is not tagged for it, because a tag that means "related" cannot be used.
 */
export function disputesAbout(mis) {
  if (!mis) return [];
  /* M18 is "historians agree about all this — the facts are settled", and the
     honest answer is not one argument but every one of them. It is the only
     misconception this panel answers by existing. */
  if (mis === 'M18') return DISPUTES.slice();
  return DISPUTES.filter((d) => (d.misconceptions || []).includes(mis));
}

/** Every misconception this module claims an argument for, and the arguments.
 *  Five of the eighteen, plus M18. The other twelve have no argument between
 *  named historians that this atlas can honestly attach to them, and a tag that
 *  meant "related" would be worse than none. */
export function misconceptionIndex() {
  const out = { M18: DISPUTES.map((d) => d.id) };
  for (const d of DISPUTES) {
    for (const m of d.misconceptions || []) (out[m] = out[m] || []).push(d.id);
  }
  return out;
}

/**
 * WHEN A TEXT WAS MADE, against the years the argument is about.
 *
 * `shapeBlock` used to print "n documents made at the time" over whatever ids a
 * dispute listed, and for the 1857 argument the one document was Gandhi in
 * 1922 — sixty-five years after the rising, and the panel called it
 * contemporary. A caption that is wrong about provenance is worse than no
 * caption in a piece whose whole subject is provenance.
 *
 * So every dispute carries `span`, the years it is about, and every text is
 * placed against it: `during`, `before`, or `after`. Nothing is dropped — the
 * Gandhi statement stays, because what a nationalist leader said in a British
 * court in 1922 is part of the argument about what to call 1857. It is simply
 * no longer described as evidence made at the time.
 */
export function whenMade(dispute, year) {
  const span = dispute && dispute.span;
  if (!span || year == null) return 'during';
  if (year < span[0]) return 'before';
  if (year > span[1]) return 'after';
  return 'during';
}

/** Every source object this file will hand to renderSource(), flattened. */
export function sourcesOf(d) {
  const out = [];
  for (const p of d.positions || []) if (p.src) out.push(p.src);
  for (const s of d.extraSources || []) out.push(s);
  return out;
}

export function stats() {
  const places = new Set();
  for (const d of DISPUTES) for (const t of d.territories || []) places.add(t);
  let positions = 0;
  for (const d of DISPUTES) positions += (d.positions || []).length;
  return { disputes: DISPUTES.length, places: places.size, positions };
}

/* ------------------------------------------------------------------ audit --
 * Published on window.BEA.historiography.audit(), so a hostile critic can run
 * it on the live app: every required field, every territory id checked against
 * the loaded dataset, every banned string checked against DIDACTIC_SPEC §7.1.
 */
const REQUIRED_DISPUTE = ['id', 'question', 'stake', 'territories', 'positions', 'verdict',
  'settle', 'settleKey', 'span'];
const REQUIRED_POSITION = ['key', 'who', 'badge', 'short', 'claim', 'reads', 'explainAway'];
const BALANCES = ['open', 'weighted', 'settled-on-fact'];

/* §7.1's banned list. "both sides" and "arguably" are the two this file was
   most likely to reach for, so they are checked, not trusted. */
const BANNED = [
  /\bacquired\b/i, /\bpacified\b/i, /\bunrest\b/i, /\brich tapestry\b/i,
  /\bplayed a key role\b/i, /\bleft a lasting legacy\b/i, /\bboth sides\b/i,
  /\bit is important to note\b/i, /\barguably\b/i, /\bmany would say\b/i,
  /\bmixed legacy\b/i,
];

export function audit(data) {
  const bad = [];
  const ids = new Set();
  for (const d of DISPUTES) {
    const missing = REQUIRED_DISPUTE.filter((k) => d[k] == null || (Array.isArray(d[k]) ? !d[k].length : String(d[k]).trim() === ''));
    if (missing.length) bad.push({ id: d.id, problem: 'missing fields', detail: missing });
    if (ids.has(d.id)) bad.push({ id: d.id, problem: 'duplicate id' });
    ids.add(d.id);
    if (!BALANCES.includes(d.verdict && d.verdict.balance)) bad.push({ id: d.id, problem: 'verdict.balance must be one of ' + BALANCES.join(', ') });
    if ((d.positions || []).length < 2) bad.push({ id: d.id, problem: 'fewer than two positions' });
    /* FLOORS, not word counts for their own sake. A position that names its
       evidence in six words has not named it, and "more research is needed" is
       not a settle-field. The measured minima across the fourteen as written are
       claim 414, reads 146, explainAway 178, settleKey 154 characters; these
       floors sit well under them and exist to stop a future entry being thinner
       than the ones it stands beside. */
    if (String(d.settleKey || '').length < 60) {
      bad.push({ id: d.id, problem: 'settleKey must name the evidence that would decide it, not gesture at it' });
    }
    for (const p of d.positions || []) {
      const pm = REQUIRED_POSITION.filter((k) => !p[k] || String(p[k]).trim() === '');
      if (pm.length) bad.push({ id: d.id + '/' + (p.key || '?'), problem: 'position missing fields', detail: pm });
      /* A position with no work behind it is an opinion this atlas has written
         and attributed to somebody. Every one of them names something a reader
         can go and check, with the four provenance answers on it. */
      for (const [k, floor] of [['claim', 150], ['reads', 80], ['explainAway', 80]]) {
        if (String(p[k] || '').length < floor) {
          bad.push({
            id: d.id + '/' + (p.key || '?'),
            problem: k === 'reads' ? 'does not name the evidence this position reads'
              : k === 'explainAway' ? 'does not name what this position has to explain away'
                : 'the position is not stated at length enough to be recognisable to its author',
          });
        }
      }
      if (!p.src) bad.push({ id: d.id + '/' + (p.key || '?'), problem: 'position names no work a reader can check' });
      else {
        const sm = ['nature', 'purpose', 'cannotTell', 'check'].filter((k) => !p.src[k]);
        if (sm.length) bad.push({ id: d.id + '/' + (p.key || '?'), problem: 'citation missing provenance fields', detail: sm });
      }
    }
    if (!Array.isArray(d.span) || d.span.length !== 2 || !(d.span[0] < d.span[1])) {
      bad.push({ id: d.id, problem: 'span must be [from, to] with from < to — it is what dates the evidence' });
    }
    if (data && data.byId) {
      const unknown = (d.territories || []).filter((t) => !data.byId.has(t));
      if (unknown.length) bad.push({ id: d.id, problem: 'territory ids not in this dataset', detail: unknown });
    }
    const prose = [d.question, d.stake, d.settle, d.settleKey, d.verdict && d.verdict.text, d.verdict && d.verdict.lead,
      d.verdict && d.verdict.note,
      ...(d.positions || []).flatMap((p) => [p.claim, p.reads, p.explainAway, p.short])].filter(Boolean).join(' \n ');
    for (const re of BANNED) {
      const m = prose.match(re);
      if (m) bad.push({ id: d.id, problem: 'banned string in our own voice (DIDACTIC_SPEC §7.1)', detail: m[0] });
    }
  }
  return bad;
}

/**
 * THE SAME CHECK, OVER WHAT IS ACTUALLY ON SCREEN.
 *
 * `audit()` reads this file's fields. It could not see the prose the renderer
 * writes around them, and one of those strings said "both sides" for four
 * rounds — in a panel whose whole subject is that an argument can have three.
 * `auditVoice(root)` scans a rendered argument, skipping every quotation
 * (`.src`, which is renderSource's output, and every blockquote), because
 * DIDACTIC_SPEC §7.1 bans these words in OUR voice and historical words stay as
 * their authors wrote them.
 */
export function auditVoice(root) {
  const bad = [];
  if (!root || !root.cloneNode) return bad;
  const copy = root.cloneNode(true);
  for (const q of copy.querySelectorAll('.src, blockquote, .hgx-lens__src')) q.remove();
  const text = (copy.textContent || '').replace(/\s+/g, ' ');
  for (const re of BANNED) {
    const m = text.match(re);
    if (m) {
      const i = text.search(re);
      bad.push({
        id: (root.dataset && root.dataset.dispute) || root.className || 'rendered',
        problem: 'banned string in our own voice, on screen (DIDACTIC_SPEC §7.1)',
        detail: m[0] + '  —  “…' + text.slice(Math.max(0, i - 60), i + 60) + '…”',
      });
    }
  }
  return bad;
}

export default DISPUTES;
