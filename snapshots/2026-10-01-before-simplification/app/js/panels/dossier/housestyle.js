/* panels/dossier/housestyle.js — the §7.1 filter, applied to rendered text.
 *
 * DIDACTIC_SPEC §7.1 bans a list of strings in UI copy. The shards are UI copy:
 * the moment the dossier prints a `how`, a `note` or a `correction`, that prose
 * is in this app's voice. Round 1 shipped a lint over the module source, which
 * proves nothing, and the rendered panel carried "acquired" for conquest four
 * times, "pacified" twice and "both sides" eighteen times.
 *
 * Two devices, both visible to the student, neither of them silent:
 *
 *   1. SUBSTITUTION. A closed, auditable table of exact rewrites, every one of
 *      them meaning-preserving. "acquired" becomes "took"; "pacified" becomes
 *      "crushed". Each substitution is recorded and printed at the foot of the
 *      dossier under "The words on this page", naming both words, so a teacher
 *      can see exactly what we changed and disagree with it.
 *   2. MARKING. A historical term inside the name of a law or a body — the
 *      Natives Land Act, the Native Police, the Federally Administered Tribal
 *      Areas — cannot be rewritten without falsifying a proper noun. It is
 *      marked instead, with a rule under it, and listed in the same footer with
 *      the reason. §7.1 rule 4: historical terms carry a note, not a silence.
 *
 * Nothing here invents, deletes or softens a fact. Where a rewrite would change
 * a claim it is not in the table, and the phrase is reported instead.
 */
import { el } from '../../core/util.js';

/* --- exact rewrites ------------------------------------------------------
   Order matters: the specific rules run before the general ones. `why` is
   printed to the student, not to a log. */
const REWRITES = [
  /* §7.1 rule 2: use the plain word. "acquired" makes conquest sound like
     shopping. Every one of these is Britain taking a place. */
  { re: /\bacquired sovereignty\b/g, to: 'gained sovereignty', why: 'the record’s word here was the softer one' },
  { re: /\bacquired responsible government\b/g, to: 'won responsible government', why: 'a settler assembly took this; it was not handed over' },
  { re: /\bacquired a foreign garrison\b/g, to: 'gained a foreign garrison', why: 'the plain verb' },
  { re: /\bformally acquired\b/g, to: 'formally taken', why: 'the plain verb for taking a place' },
  { re: /\bacquired\b/g, to: 'took', why: '“acquired” for conquest is banned by this atlas’s own style rule' },

  /* §7.1 rule 2 again. "pacified" is the coloniser's word for the end of
     resistance and it hides what ended it. */
  { re: /\bnever pacified\b/g, to: 'never brought under control', why: 'the coloniser’s euphemism, replaced' },
  { re: /\bpacified\b/g, to: 'crushed', why: 'the coloniser’s euphemism, replaced' },

  /* §7.1 and FEATURE_SPEC §2 P04 test 2: the word "granted" is banned as a
     MECHANISM — no departure in this app may read as a gift. The ordinary
     transitive verb with a named agent ("Charles II granted the Company its
     title", "Maquinna granted use rather than ownership") is not that, and
     rewriting it would falsify sixty sentences. These four are the mechanism
     sense, and there are none in the dataset today; the rules are here so a
     future shard cannot introduce one without being caught. */
  { re: /\b(?:was |were )?granted independence\b/g, to: 'won independence', why: '"granted" makes independence a gift; §7.1 bans it as a mechanism' },
  { re: /\b(?:was |were )?granted self-government\b/g, to: 'won self-government', why: '"granted" makes self-government a gift; §7.1 bans it as a mechanism' },
  { re: /\bgranted responsible government\b/g, to: 'conceded responsible government', why: '"granted" makes responsible government a gift; §7.1 bans it as a mechanism' },
  { re: /\bgranted dominion status\b/g, to: 'conceded dominion status', why: '"granted" makes dominion status a gift; §7.1 bans it as a mechanism' },

  /* §7.1 rule 3: "native" is not used for people or for a place's own things.
     Inside the name of a law or a body it is marked instead (HIST_TERMS
     below); these three are ordinary prose and are rewritten. */
  { re: /\bnative flax\b/g, to: 'the flax growing there', why: '"native" is not this atlas\u2019s word' },
  { re: /\blast native Prince of Wales\b/g, to: 'last Welsh Prince of Wales', why: '"native" is not this atlas\u2019s word, and Welsh is the more exact one' },
  { re: /\blast native speaker\b/g, to: 'last first-language speaker', why: '"native speaker" replaced with the plain description' },

  /* Banned filler. */
  { re: /\barguably the most\b/g, to: 'among the most', why: '“arguably” is a hedge that commits to nothing' },
  { re: /\barguably\b/g, to: 'on this evidence', why: '“arguably” is a hedge that commits to nothing' },
  { re: /\bit is important to note that\b/gi, to: '', why: 'filler' },
  { re: /\bplayed a key role\b/g, to: 'did the work', why: 'filler that names no action' },
  { re: /\bmixed legacy\b/g, to: 'record of gains and losses that fell on different people', why: '“mixed” averages a moral claim; §7.1 rule 6' },

  /* "both sides" is banned as false balance. Where the phrase is literal —
     two banks of a river, two sides of a border — it stays, because there the
     words mean what they say. The three literal cases are named exactly. */
  { re: /\bthe land on both sides of it\b/g, to: 'the land on either bank of it', why: 'the literal sense, written literally' },
  { re: /\bmajorities on both sides of the border\b/g, to: 'majorities north and south of the border', why: 'the literal sense, written literally' },
  { re: /\bused on both sides of a bigger argument\b/g, to: 'used by each side of a bigger argument', why: '“both sides” flattens an argument into a scoreline' },
  { re: /\b(on|by|from|of|told|between|among) both sides\b/g, to: '$1 each side', why: '“both sides” is the false-balance phrase §7.1 bans' },
  { re: /\bBoth sides\b/g, to: 'Both', why: '“both sides” is the false-balance phrase §7.1 bans' },
  { re: /\bboth sides\b/g, to: 'both', why: '“both sides” is the false-balance phrase §7.1 bans' },

  /* A note the data author wrote to whoever would build the panel, printed
     verbatim to a fifteen-year-old. British India's "Where historians
     disagree" block ended "…Show both positions and the reason the numbers are
     uncertain; do not split the difference." — an instruction, in the second
     person, to us. Ethiopia's read "…should not be shown as one." Neither is a
     statement about the past. Both are turned into the statement they imply
     about what this panel does, and the change is printed in the footer. */
  { re: /\bshould not be shown as one\b/g, to: 'is not shown as one in this atlas', why: 'an instruction to whoever built this panel, rewritten as what the panel does' },
  { re: /\bshould not be shown on this map\b/g, to: 'is not shown on this map', why: 'an instruction to whoever built this panel, rewritten as what the panel does' },
];

/* --- instructions to the author, not statements about the past -----------
   A trailing sentence in the imperative, addressed to whoever renders this
   record. It is removed from the student's prose and printed in full in the
   footer under "The words on this page", so nothing is deleted in silence. */
const DIRECTIVES = [
  /(?:^|(?<=[.;] ))(?:Show|Present|Display|Render|Print|Give|Set|Use|Treat|Mark|Flag|Keep|Avoid|Do not|Never)\b[^.]*\bdo not split the difference\.\s*/g,
  /(?:^|(?<=[.;] ))(?:Show|Present|Display|Render|Print) both (?:positions|cases|figures|sides)\b[^.]*\.\s*/g,
];

/* --- historical terms that live inside proper nouns ----------------------
   These cannot be rewritten: they are the names of statutes, forces and
   administrative categories, and changing them would make the record
   unsearchable. They are marked and explained instead. */
const HIST_TERMS = [
  {
    re: /\b(?:Natives? Land Act|Native Trust and Land Act|Native Land Husbandry Act|Native Franchise Act|Native Police(?: Force)?|Native Authority|Native Authorities|native authority|native authorities|native courts|Native Affairs|Native Convention|Native National Congress|Native Rising|Native American|Native Agency|native agents|Native Constabulary|Native Life in South Africa|native title|Native History|Native nation|Native Americans|Native land)\b/g,
    note: '“Native” here is part of the name of a law, a force or a legal category invented by colonial administrations. This atlas keeps the name and marks the word; it does not use it for people.',
  },
  {
    re: /\b(?:Tribal Areas|Tribal Administration|Tribal Criminal and Civil Disputes Regulation|tribal agencies|tribal areas|tribal districts|United Tribes)\b/g,
    note: '“Tribal” here is the administrative name Britain gave a district or a legal regime. Where this atlas means a people it names the people.',
  },
  {
    /* The bare words, wherever the record still uses them. DIDACTIC_SPEC §7.1
       rule 4: a historical term is used only with a note, never silently. We
       cannot rewrite "the Pashtun tribes of the frontier" into something else
       without inventing a social structure, so it is marked and explained. */
    re: /\b(?:[Tt]ribes|[Tt]ribe|[Tt]ribal|[Tt]ribesmen)\b/g,
    note: '“Tribe” was a colonial administrative category at least as often as it was a description of how people organised themselves — it decided who a British officer paid, taxed and held responsible. Where this atlas can name the people it names them; where this is the record’s own word it is marked, not quietly replaced.',
  },
  {
    /* Inside the title of a real book, which cannot be altered. */
    re: /\bBritain, the Slaves and the American Revolution\b/g,
    note: '“Slaves” stands here because it is part of a book’s title. This atlas does not use it as a noun for people: enslavement was a condition imposed on them, not who they were.',
  },
];

/* Terms that are already inside quotation marks in the record are left exactly
   as the record has them — a quoted historical term is the correct treatment,
   not a defect. */
const QUOTED = /['‘’“”]/;

/**
 * A sink collects what the filter did so the dossier can print it once, at the
 * foot, where a teacher can audit it.
 */
export function createStyleSink() {
  const rewrites = new Map();
  const marked = new Map();
  const cut = new Map();
  return {
    rewrite(was, now, why) { if (!rewrites.has(was + '→' + now)) rewrites.set(was + '→' + now, { was, now, why }); },
    mark(term, note) { if (!marked.has(term)) marked.set(term, { term, note }); },
    cut(text) { if (!cut.has(text)) cut.set(text, { text }); },
    rewrites: () => [...rewrites.values()],
    marked: () => [...marked.values()],
    removed: () => [...cut.values()],
    size: () => rewrites.size + marked.size + cut.size,
  };
}

/** Apply the rewrite table to a string. Returns the corrected string. */
export function houseText(input, sink) {
  let s = String(input == null ? '' : input);
  for (const d of DIRECTIVES) {
    d.lastIndex = 0;
    if (!d.test(s)) continue;
    d.lastIndex = 0;
    s = s.replace(d, (m) => { if (sink) sink.cut(m.trim()); return ''; });
  }
  for (const r of REWRITES) {
    r.re.lastIndex = 0;
    if (!r.re.test(s)) continue;
    r.re.lastIndex = 0;
    s = s.replace(r.re, (m, ...rest) => {
      const out = typeof r.to === 'string' && r.to.includes('$1') ? r.to.replace('$1', rest[0]) : r.to;
      if (sink) sink.rewrite(m, out.trim() || '(deleted)', r.why);
      return out;
    });
  }
  return s.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Text for the DOM: the rewrite table applied, then historical terms wrapped in
 * a marked span. Returns a DocumentFragment so callers can append it directly.
 */
export function houseNodes(input, sink) {
  const s = houseText(input, sink);
  const frag = document.createDocumentFragment();
  const hits = [];
  for (const h of HIST_TERMS) {
    h.re.lastIndex = 0;
    let m;
    while ((m = h.re.exec(s))) {
      /* Already in quotation marks in the record? Then it is already handled
         the way §7.1 rule 4 asks, and we leave it untouched. */
      const before = s.slice(Math.max(0, m.index - 2), m.index);
      const after = s.slice(m.index + m[0].length, m.index + m[0].length + 2);
      if (QUOTED.test(before) && QUOTED.test(after)) continue;
      hits.push({ start: m.index, end: m.index + m[0].length, term: m[0], note: h.note });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const h of hits) {
    if (h.start < cursor) continue;
    if (h.start > cursor) frag.append(document.createTextNode(s.slice(cursor, h.start)));
    /* §7.1 rule 4: a historical term is used "only in quotation marks with a
       date and a note". Round 4 gave it a dotted rule and a note in the footer
       but left the word bare in the text stream, so a grep of the rendered
       panel — which is how anyone audits this — read it as our own voice.
       The marks are real characters now, not a border-bottom. */
    frag.append(el('span.dsr__hist', { text: '\u201c' + h.term + '\u201d', 'data-histterm': '' }));
    if (sink) sink.mark(h.term, h.note);
    cursor = h.end;
  }
  if (cursor < s.length) frag.append(document.createTextNode(s.slice(cursor)));
  return frag;
}

/** A <p> (or any element) whose text has been through the filter. */
export function houseP(spec, input, sink, props) {
  const p = el(spec, props || {});
  p.append(houseNodes(input, sink));
  return p;
}

/** The audit block. Printed once per dossier, at the foot, never hidden. */
export function styleFooter(sink) {
  const rw = sink.rewrites();
  const mk = sink.marked();
  const rm = sink.removed ? sink.removed() : [];
  if (!rw.length && !mk.length && !rm.length) return null;
  const box = el('section.dsr__block.dsr__style', { dataset: { block: 'housestyle' } });
  box.append(el('h3.dsr__eyebrow.sc', { text: 'The words on this page' }));
  box.append(el('p.dsr__stylelede', {
    text: 'This atlas bans a short list of words in its own voice (the house style rule, DIDACTIC_SPEC §7.1). '
      + 'Where the record’s prose used one, we say so here rather than change it quietly.',
  }));
  if (rw.length) {
    const ul = el('ul.dsr__stylelist');
    for (const r of rw) {
      ul.append(el('li', {},
        el('span.dsr__style-now', { text: '“' + r.now + '”' }),
        document.createTextNode(' printed where the record’s prose says '),
        el('span.dsr__style-was', { text: '“' + r.was + '”' }),
        document.createTextNode(' — ' + r.why + '.')));
    }
    box.append(ul);
  }
  if (mk.length) {
    const ul = el('ul.dsr__stylelist');
    for (const m of mk) {
      ul.append(el('li', {},
        el('span.dsr__hist', { text: '\u201c' + m.term + '\u201d' }),
        document.createTextNode(' — ' + m.note)));
    }
    box.append(ul);
  }
  if (rm.length) {
    box.append(el('p.dsr__stylelede', {
      text: 'Removed from the prose above: an instruction our own data author wrote to whoever would build '
        + 'this panel. It is not a statement about the past, so it is not printed as one — but it is printed here.',
    }));
    const ul = el('ul.dsr__stylelist');
    for (const r of rm) ul.append(el('li', {}, el('span.dsr__style-was', { text: '“' + r.text + '”' })));
    box.append(ul);
  }
  return box;
}

/** Exported for the build-time lint scenario. */
export const BANNED_IN_OUR_VOICE = [
  'acquired', 'pacified', 'unrest', 'mixed legacy', 'rich tapestry',
  'played a key role', 'left a lasting legacy', 'both sides', 'arguably',
  'many would say', 'it is important to note',
];
