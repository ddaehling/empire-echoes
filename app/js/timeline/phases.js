/* timeline/phases.js — the four-phase spine (DIDACTIC_SPEC §2.1, §2.2).
   This is the app's argument, made permanent furniture under the map.

   The four phases and their dates are the narrative contract in DIDACTIC_SPEC §2.1.
   They are NOT derived from the dataset, because they are an interpretation of it —
   so every boundary carries the defence written in §2.2, shown on focus.

   Round 2 printed that defence with numbers in it and no source line: "about
   80,000 troops" at Singapore, the 1815 Vienna list, "about three-quarters of
   the people Britain ruled". FEATURE_SPEC §2's own rule is that an unsourced
   number is student-visible, and these were the most prominent numbers the
   piece printed. Every phase now carries `sources[]`, drawn from docs/SOURCES.md,
   and the popover prints them under the note in the same type size — author,
   work, year, kind, and what that work is being cited for.

   Colour: no colour is invented. Each lane reuses an existing map fill whose meaning
   matches the phase, and colour is never the only signal — lane position (I–IV, fixed),
   the printed name, and a distinct --tex-* texture all carry it too. */

/* `engine` is the argument, and it is set in the sheet where there is room for
   it. `clause` is the same argument at one breath, for the lede band — the band
   holds about a hundred and ten characters beside a phase numeral at 1366x768,
   and a sentence that does not fit whole is not printed at all in the one place
   this app sets at nineteen pixels. Neither is a summary of the other: the
   clause names the motor, the engine names the motor and the people who worked
   it, and the reader who wants the second is one press away from it. */
export const PHASES = [
  {
    id: 'atlantic',
    numeral: 'I',
    name: 'The Atlantic empire',
    short: 'Atlantic',
    from: 1585,
    to: 1838,
    fromSoft: true,             // c.1585 — Roanoke, not a legal act
    engine: 'Sugar, tobacco and cotton grown by enslaved Africans on land taken from Indigenous peoples, protected by the Navigation Acts and the Royal Navy.',
    clause: 'Sugar, tobacco and cotton, grown by enslaved Africans on land taken from Indigenous peoples.',
    startNote: 'c.1585. Roanoke, then Jamestown in 1607, begin continuous English overseas colonisation. Cabot’s 1497 landfall produced no settlement, so it is marked as an antecedent and not as a start. The Munster and Ulster plantations of the 1580s and after ran the same argument on Irish land first.',
    endNote: '1838, not 1807 and not 1833. The 1807 Act ended the British slave trade; slavery in the colonies ended under the 1833 Act on 1 August 1834, and the “apprenticeship” that replaced it ran until 1838. Ending this phase at 1807 flatters Britain.',
    sources: [
      { author: 'Karen Ordahl Kupperman', work: 'The Jamestown Project', year: 2007, kind: 'book', supports: 'Roanoke and Jamestown as the start of continuous English overseas settlement, and why 1497 is not.' },
      { author: 'Nicholas Canny', work: 'Making Ireland British, 1580–1650', year: 2001, kind: 'book', supports: 'The Irish plantations as the first working model of English colonisation.' },
      { author: 'Nicholas Draper', work: 'The Price of Emancipation: Slave-ownership, Compensation and British Society at the End of Slavery', year: 2010, kind: 'book', supports: 'The 1833 Act, the compensation paid to owners, and the apprenticeship that ran to 1838.' },
    ],
    fill: 'var(--map-settlement)',
    ink: 'var(--map-settlement-on)',
    tex: 'var(--tex-stipple)',
    texSize: 'var(--tex-stipple-size)',
  },
  {
    id: 'company',
    numeral: 'II',
    name: 'The Company empire',
    short: 'Company',
    from: 1600,
    to: 1858,
    engine: 'A chartered monopoly that discovered land revenue was worth more than trade. Indian bankers, sepoys and rival rulers made the conquest possible.',
    clause: 'A chartered monopoly that discovered land revenue was worth more than trade.',
    startNote: '31 December 1600: Elizabeth I charters the East India Company. A private firm with an army — the point of the date is that the state is not yet the actor.',
    endNote: '1858. The Government of India Act moved Company territory to the Crown after the 1857 rebellion. A datable mechanism — rebellion, then nationalisation — rather than a drift.',
    sources: [
      { author: 'William Dalrymple', work: 'The Anarchy: The Relentless Rise of the East India Company', year: 2019, kind: 'book', supports: 'The 1600 charter, and the Company as a private firm with an army rather than an arm of the state.' },
      { author: 'P. J. Marshall', work: 'Bengal: The British Bridgehead, Eastern India 1740–1828', year: 1987, kind: 'book', supports: 'Land revenue overtaking trade as the Company’s engine.' },
      { author: 'Barbara D. Metcalf and Thomas R. Metcalf', work: 'A Concise History of Modern India', year: 2012, kind: 'book', supports: 'The 1857 rebellion and the transfer of Company territory to the Crown in 1858.' },
    ],
    fill: 'var(--map-company-rule)',
    ink: 'var(--map-company-rule-on)',
    tex: 'var(--tex-cross)',
    texSize: 'auto',
  },
  {
    id: 'imperial',
    numeral: 'III',
    name: 'The imperial empire',
    short: 'Imperial',
    from: 1815,
    to: 1947,
    fromSoft: true,             // c.1815
    engine: 'Industrial output needing markets, steam and telegraph shrinking distance, strategic fear about the routes to India, and rivalry with France, Russia and Germany.',
    clause: 'Industry needing markets, steam shrinking distance, and fear for the routes to India.',
    startNote: 'c.1815, not 1870 and not 1884. Starting at the Scramble teaches that high imperialism was an 1880s invention. Gallagher and Robinson (1953) showed the mid-century was expansionist too, mostly informally; Bayly (1989) showed a garrison empire consolidating from the 1780s. At the Vienna settlement of 1815 Britain keeps the Cape, Ceylon, Malta, Trinidad, Mauritius and part of Guiana.',
    endNote: '1947. India and Pakistan leave. The 1941 census of India returned about 389 million people, on any reckoning the largest share of everyone Britain ruled — which is why this date, and not the loss of the thirteen colonies, is the one that ends the phase.',
    sources: [
      { author: 'John Gallagher and Ronald Robinson', work: 'The Imperialism of Free Trade', year: 1953, kind: 'article', supports: 'That the mid-Victorian decades were expansionist, mostly by informal means — the argument against starting at 1870.' },
      { author: 'Christopher Alan Bayly', work: 'Imperial Meridian: The British Empire and the World 1780–1830', year: 1989, kind: 'book', supports: 'The post-1780 garrison empire, and the territories Britain retained at the Vienna settlement of 1815.' },
      { author: 'Barbara D. Metcalf and Thomas R. Metcalf', work: 'A Concise History of Modern India', year: 2012, kind: 'book', supports: 'The scale of India’s population within the empire and the 1947 transfer of power.' },
      { author: 'Census Commissioner for India', work: 'Census of India, 1941', year: 1941, kind: 'official record', supports: 'The figure of about 389 million people in India and the princely states.' },
    ],
    fill: 'var(--map-crown-conquered)',
    ink: 'var(--map-crown-conquered-on)',
    tex: 'var(--tex-hatch-45)',
    texSize: 'auto',
  },
  {
    id: 'dissolution',
    numeral: 'IV',
    name: 'Dissolution',
    short: 'Dissolution',
    from: 1942,
    to: 1997,
    engine: 'Mass anticolonial politics that predated the wars, Britain’s insolvency, US and Soviet pressure, and — where Britain fought — counter-insurgency that lost anyway.',
    clause: 'Anticolonial politics older than the wars, a bankrupt Britain, and counter-insurgencies that lost anyway.',
    startNote: '1942, not 1947. Singapore surrendered on 15 February 1942 — about 80,000 troops, to a smaller Japanese force — and the prestige Asian rule rested on went with it. Quit India began that August. 1947 is an outcome, not an origin.',
    endNote: '1 July 1997: Hong Kong, the last large populated territory to leave. The story ends here; the history does not — see what is still on the map after this line.',
    sources: [
      { author: 'Christopher Bayly and Tim Harper', work: 'Forgotten Armies: The Fall of British Asia, 1941–1945', year: 2004, kind: 'book', supports: 'The surrender at Singapore on 15 February 1942, the size of the garrison, and the collapse of British prestige in Asia.' },
      { author: 'Ronald Hyam', work: 'Britain’s Declining Empire: The Road to Decolonisation, 1918–1968', year: 2006, kind: 'book', supports: 'Why decolonisation is dated from the war rather than from any single grant of independence.' },
      { author: 'Steve Tsang', work: 'A Modern History of Hong Kong', year: 2004, kind: 'book', supports: 'The handover of 1 July 1997 and the lease that produced it.' },
    ],
    fill: 'var(--ok)',
    ink: 'var(--text-on-accent)',
    tex: 'var(--tex-rule-h)',
    texSize: 'auto',
  },
];

export const SPINE_MIN = 1585;
export const SPINE_MAX = 1997;

export function activePhases(year) {
  return PHASES.filter((p) => year >= p.from && year <= p.to);
}

const WORD = ['No', 'One', 'Two', 'Three', 'Four'];

/* The caption under the band. It is the sentence the band exists to make sayable,
   and at 1820 it must say three engines are running at once. */
export function spineCaption(year, live) {
  const on = activePhases(year);
  const n = on.length;
  if (n === 0) {
    if (year < PHASES[0].from) {
      return {
        lead: 'None of the four engines has started.',
        rest: live && live.territories
          ? `In ${year} the Crown already holds ${live.territories} ${live.territories === 1 ? 'place' : 'places'} on this map — close to home, and mostly Ireland. The empire begins before anyone calls it one.`
          : 'The empire begins before anyone calls it one.',
      };
    }
    return {
      lead: 'All four engines have stopped.',
      rest: live && live.territories
        ? `${live.territories} ${live.territories === 1 ? 'place is' : 'places are'} still under British sovereignty in ${year}. The story ends in 1997; the history does not.`
        : 'The story ends in 1997; the history does not.',
    };
  }
  if (n === 1) {
    const p = on[0];
    return { lead: `One engine: ${p.name.toLowerCase()}.`, rest: p.engine };
  }
  const names = on.map((p) => p.short);
  const list = names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  if (n === 3) {
    return {
      lead: 'Three engines are running at once — ' + list + '.',
      rest: 'Not one empire getting bigger: three projects, three motors, one flag. Print sets them one after another. They did not run one after another.',
    };
  }
  return {
    lead: `${WORD[n]} engines are running at once — ${list}.`,
    rest: 'Two projects, two motors, one flag. The overlap is the point: nobody planned this.',
  };
}
