/**
 * compare/presets.js — the scripted comparisons, and the question each one opens with.
 *
 * FEATURE_SPEC §2 P18 names three on-path comparisons; the wave brief adds two
 * more. All five are here, and every one of them opens with a committed
 * prediction, because a reveal a student has not bet against is a picture they
 * scroll past (DIDACTIC_SPEC §8.1: prediction before reveal, five times).
 *
 * NOTHING IN THIS FILE IS A NUMBER. The prose is authored; every figure the
 * reveal prints is computed from `data.statusAt()` at run time by diff.js, and
 * `resolve()` decides which of the offered answers the dataset actually
 * supports. If the dataset changes, the right answer changes with it, silently
 * and correctly. That is the whole reason `answer` is a function.
 */

/** Narrow → wide. Used to order two plates that share a year. */
export const DEF_ORDER = ['controlled', 'administered', 'claimed', 'influenced'];

export const PRESETS = [
  {
    id: 'america',
    label: '1770 against 1820', chip: '1770 / 1820',
    teaches: 'M5 · losing America did not shrink the empire',
    a: { year: 1770 }, b: { year: 1820 },
    ask: 'Britain lost thirteen colonies in North America between 1776 and 1783. Was it holding more of the map in 1770, or in 1820?',
    choices: [
      { id: 'a', label: 'More in 1770' },
      { id: 'b', label: 'More in 1820' },
      { id: 'same', label: 'About the same' },
    ],
    resolve: (d) => (d.b.units > d.a.units ? 'b' : d.a.units > d.b.units ? 'a' : 'same'),
    /** The sentence after the reveal. `f` is the formatter, `d` the diff. */
    verdict: (d) => `${d.lost.units} map units went, every American one of them. ${d.gained.units} arrived — India, Australia, the Indian Ocean. `
      + 'Losing America redirected the empire. It did not end it.',
    cite: 'P. J. Marshall, The Making and Unmaking of Empires (2005), argues the decades that lost America won Bengal.',
  },
  {
    id: 'redirect',
    label: '1783 against 1815', chip: '1783 / 1815',
    teaches: 'M5 · where the money went instead',
    a: { year: 1783 }, b: { year: 1815 },
    ask: 'In 1783 the American war is lost. By 1815 the wars against France are over too. Between those two dates, did Britain end up holding fewer places, or more?',
    choices: [
      { id: 'a', label: 'Fewer by 1815' },
      { id: 'b', label: 'More by 1815' },
      { id: 'same', label: 'About the same' },
    ],
    resolve: (d) => (d.b.units > d.a.units ? 'b' : d.a.units > d.b.units ? 'a' : 'same'),
    verdict: (d) => `${d.gained.units} arrive, ${d.lost.units} go. Vienna in 1815 left Britain the Cape, Ceylon, Malta, Trinidad, Mauritius and Guyana. `
      + 'The money that had gone into Atlantic sugar went east instead.',
    cite: 'C. A. Bayly, Imperial Meridian (1989), on the garrison empire consolidating after 1783.',
  },
  {
    id: 'informal',
    label: '1860 claimed, against 1860 claimed and run', chip: '1860 informal',
    teaches: 'charge 5 · informal empire, LO11',
    a: { year: 1860, def: 'claimed' }, b: { year: 1860, def: 'influenced' },
    ask: 'Same year, same world. The first plate draws everywhere Britain said was hers. The second adds the places Britain never claimed and ran anyway — by trade, debt and the navy. How much does the map grow?',
    /* The bands are stated in the choices, so the answer the dataset supports is
       checkable by the reader rather than a matter of the word "handful". */
    choices: [
      { id: 'none', label: 'Not at all' },
      { id: 'few', label: 'By fewer than twenty places' },
      { id: 'many', label: 'By twenty places or more' },
    ],
    resolve: (d) => (d.gained.units === 0 ? 'none' : d.gained.units >= 20 ? 'many' : 'few'),
    verdict: (d) => `${d.gained.units} more map units, in the same year. No fill and no claimed border: that absence is the difference. `
      + 'Britain sent no governor to Buenos Aires and set the terms of trade there anyway.',
    caution: 'This layer is an argument, not a measurement — Gallagher and Robinson, 1953. The objection to it: stretched far enough, '
      + '"influence" covers everything and can never be shown to be wrong. Dispute the second plate.',
    cite: 'John Gallagher and Ronald Robinson, "The Imperialism of Free Trade", Economic History Review (1953).',
  },
  {
    id: 'peak',
    label: '1914 against 1922', chip: '1914 / 1922',
    teaches: 'T14 · the peak is to the right of the war',
    a: { year: 1914 }, b: { year: 1922 },
    ask: 'The First World War is usually where the story turns and the empire starts to shrink. Was Britain holding more of the map in 1914, or in 1922?',
    choices: [
      { id: 'a', label: 'More in 1914' },
      { id: 'b', label: 'More in 1922' },
      { id: 'same', label: 'About the same' },
    ],
    resolve: (d) => (d.b.units > d.a.units ? 'b' : d.a.units > d.b.units ? 'a' : 'same'),
    verdict: (d) => `${d.gained.units} arrive, ${d.lost.units} go, ${d.changed.units} change status. The arrivals are mandates: Palestine, Transjordan, Iraq, Tanganyika. `
      + 'The empire peaks after the war that supposedly began its decline — and Ireland leaves in the same eight years.',
    cite: 'The mandate instruments themselves, under Article 22 of the Covenant of the League of Nations (1919); each territory’s own dossier carries them.',
  },
  {
    id: 'dissolution',
    label: '1945 against 1965', chip: '1945 / 1965',
    teaches: 'T19, M14 · what 1947 did and did not end',
    a: { year: 1945 }, b: { year: 1965 },
    ask: 'India and Pakistan became independent in 1947. Across the twenty years from 1945 to 1965, how many of this atlas’s map units left British control?',
    choices: [
      { id: 'low', label: 'About twenty' },
      { id: 'mid', label: 'About sixty' },
      { id: 'high', label: 'More than a hundred' },
    ],
    resolve: (d) => (d.lost.units > 100 ? 'high' : d.lost.units >= 40 ? 'mid' : 'low'),
    verdict: (d) => (d.gained.units === 0
      ? `${d.lost.units} go and nothing arrives. `
      : `${d.lost.units} go and ${d.gained.units} arrive. `)
      + 'Most of that left in one day in 1947 — and the fighting in Malaya, Kenya, Cyprus and Aden was still ahead.',
    cite: 'David Anderson, Histories of the Hanged (2005), and Caroline Elkins, Britain\'s Gulag (2005), on what "negotiated" covered in Kenya. '
      + 'The scale is disputed between them and their critics; the system is not.',
  },
];

export const presetById = (id) => PRESETS.find((p) => p.id === id) || null;

/**
 * Which plate goes on the left. Chronological where the years differ, because
 * a student reads left to right and the empire runs forwards; narrowest
 * definition first where they do not, so the second plate always ADDS to the
 * first and the delta is always a gain rather than a subtraction you have to
 * read backwards.
 */
export function order(x, y) {
  if (x.year !== y.year) return x.year < y.year ? [x, y] : [y, x];
  const ix = DEF_ORDER.indexOf(x.def), iy = DEF_ORDER.indexOf(y.def);
  return ix <= iy ? [x, y] : [y, x];
}

export default { PRESETS, presetById, order, DEF_ORDER };
