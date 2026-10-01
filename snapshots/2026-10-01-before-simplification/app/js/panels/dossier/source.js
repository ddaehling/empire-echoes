/* panels/dossier/source.js — renderSource().
 *
 * THE single function that renders a quotation or a citation anywhere in this
 * app. Nothing else may print one. It is exported here, published on
 * `window.BEA.renderSource` by the dossier module, and announced on the bus as
 * `source:ready` so a piece that loads later can pick it up.
 *
 * Charge 8: "a quotation on a page carries its provenance; a quotation in an
 * interface becomes decoration." The answer is structural:
 *
 *   1. Four labelled fields — NATURE, ORIGIN, PURPOSE, WHAT IT CANNOT TELL YOU
 *      — always render, always BEFORE the quote in DOM order, always above it
 *      visually, and at the SAME TYPE SIZE as the quote. The attribution can
 *      never shrink to a byline because it is not styled as one.
 *   2. Every field says where its answer came from: the record, a note this
 *      atlas wrote about this work, or a statement about the class of source.
 *      A class-level answer is marked as the weakest kind and counted.
 *   3. A field with no answer at any level prints [unsourced] in --danger, in
 *      front of the student, and increments a counter other pieces can read.
 *
 * Emits: source:unsourced { field, key, count }
 */
import { el } from '../../core/util.js';
import { SOURCE_KIND } from './vocab.js';
import { workNote } from './provenance.js';
import { houseText, houseNodes } from './housestyle.js';

let unsourcedCount = 0;
let classCount = 0;
let busRef = null;
const seen = new Set();

export function useBus(bus) { busRef = bus; }
export function unsourced() { return unsourcedCount; }
export function classOnly() { return classCount; }
export function resetUnsourced() { unsourcedCount = 0; classCount = 0; seen.clear(); }

const FIELDS = [
  { key: 'nature', label: 'What it is' },
  { key: 'origin', label: 'Who made it, and when' },
  { key: 'purpose', label: 'What it was made for' },
  { key: 'cannotTell', label: 'What it cannot tell you' },
];

/* Terse on purpose. The long explanation of what these tags mean is printed
   once per dossier, in the evidence block's tally, where it is read once
   instead of thirty-six times. */
const LEVEL_WORD = {
  record: null,
  work: 'this atlas, on this work',
  class: 'true of the class, not recorded for this source',
};

function sourceKey(src) {
  return [src.author, src.work, src.year, src.quote && src.quote.slice(0, 24)].filter(Boolean).join('|') || 'anonymous';
}

/* -------------------------------------------------------- panel bookkeeping --
 * Round 2 printed "A book of history is written to persuade other readers of a
 * case…" and "It is built from other people's records…" up to twelve times in
 * one dossier, and rendered Anderson and Elkins twice each. A sentence a
 * student has already read six times is not an audit, it is wallpaper, and
 * wallpaper is what they learn to skip.
 *
 * A panel object is created once per render. The FIRST source to need a
 * class-level answer prints it in full; every later one points at it and is
 * counted, so the page still answers all four questions for every source and
 * says exactly how many of those answers are second-hand.
 */
let panelSeq = 0;
export function createPanelSources() {
  panelSeq++;
  return {
    id: 'p' + panelSeq,
    classFirst: new Map(),   // 'kind|field' -> { anchorId, label, n }
    srcFirst: new Map(),     // sourceKey -> { anchorId, line, n }
    n: 0,
  };
}
export function panelClassRepeats(panel) {
  if (!panel) return [];
  return [...panel.classFirst.values()].filter((v) => v.n > 1);
}
export function panelSourceRepeats(panel) {
  if (!panel) return 0;
  let n = 0;
  for (const v of panel.srcFirst.values()) n += Math.max(0, v.n - 1);
  return n;
}

/** Origin, assembled from whatever the record actually holds. Never invented. */
function originOf(src) {
  if (src.origin) return { value: String(src.origin), level: 'record', gap: null };
  const bits = [];
  if (src.author) bits.push(String(src.author));
  if (src.work) bits.push(src.work + (src.year ? ', ' + src.year : ''));
  else if (src.year) bits.push(String(src.year));
  const pub = src.publisher && String(src.publisher) !== 'undefined' ? String(src.publisher) : null;
  if (pub) bits.push(pub);
  if (!bits.length) return { value: null, level: null, gap: null };
  return { value: bits.join(' · '), level: 'record', gap: pub ? null : 'no publisher is recorded' };
}

/**
 * The four answers, each with the level it came from. This is the whole
 * epistemology of the panel in one function, and it is the same function for
 * a quotation, a footnote and a one-line reference.
 */
export function provenanceOf(src) {
  const cls = SOURCE_KIND[src.kind] || null;
  const note = workNote(src);
  const pick = (recorded, workVal, classVal) => {
    if (recorded) return { value: String(recorded), level: 'record' };
    if (workVal) return { value: String(workVal), level: 'work' };
    if (classVal) return { value: String(classVal), level: 'class' };
    return { value: null, level: null };
  };
  /* `nature` is a formatting of the recorded `kind` field, not a guess about
     the class: the shard says kind: 'primary-source', and this prints what
     that means. So it counts as recorded. */
  const nature = src.nature ? { value: String(src.nature), level: 'record' }
    : cls ? { value: cls.nature, level: 'record' }
      : { value: null, level: null };
  return {
    nature,
    origin: originOf(src),
    purpose: pick(src.purpose, note && note.purpose, cls ? cls.purposeHint : null),
    cannotTell: pick(src.cannotTell || src.cannotTellYou, note && note.cannotTell, cls ? cls.limit : null),
  };
}

/**
 * renderSource(src, opts) -> HTMLElement
 *
 * src:  { kind, author, work, year, publisher, supports, url,
 *         quote?, speaker?, nature?, origin?, purpose?, cannotTell? }
 * opts: { claimId?, compact? }
 */
export function renderSource(src, opts = {}) {
  if (!src || typeof src !== 'object') {
    return el('p.src.src--broken', { role: 'note' },
      el('b.defect', { text: '[unsourced]' }),
      ' This claim was printed with no source object at all.');
  }
  const v = provenanceOf(src);
  const key = sourceKey(src);
  const panel = opts.panel || null;

  /* The same work, twice on one page. Print it once in full and point at it. */
  if (panel) {
    const prior = panel.srcFirst.get(key);
    if (prior) {
      prior.n++;
      /* A SECOND appearance of a source already printed in full is a
         reference, and a reference is a citation: it takes the shared
         `.cx-src` treatment (chrome.css §B) rather than a private one. The
         full four-question figure above it is not a citation in that sense
         and does not become one — see the note in renderSource. */
      const again = el('p.src.src--again.cx-src.cx-note', { role: 'note', dataset: { kind: src.kind || 'unrecorded' } });
      again.append(el('span.cx-src__kind.src__k', { text: 'Same source' }), ' ');
      again.append(houseNodes(prior.line, opts.sink || null));
      again.append(document.createTextNode(' — its four questions are answered in full '));
      again.append(el('button.cx-more.dsr__jump', { type: 'button', dataset: { act: 'goto', target: prior.anchorId } },
        el('span', { text: 'earlier on this page' })));
      if (src.supports) {
        const f = el('span.src__foragain');
        f.append(document.createTextNode(' Cited here for: '));
        f.append(houseNodes(String(src.supports), opts.sink || null));
        again.append(f);
      }
      return again;
    }
  }

  const root = el('figure.src.cx-panel.cx-panel--tight', {
    dataset: { kind: src.kind || 'unrecorded', quote: src.quote ? 'yes' : 'no' },
  });
  if (opts.claimId) root.dataset.claim = opts.claimId;
  if (panel) {
    panel.n++;
    root.id = 'src-' + panel.id + '-' + panel.n;
    panel.srcFirst.set(key, { anchorId: root.id, line: sourceLine(src), n: 1 });
  }

  const dl = el('dl.src__nop');
  let missing = 0;
  let weak = 0;
  for (const f of FIELDS) {
    const got = v[f.key] || { value: null, level: null };
    const dt = el('dt.src__k.sc', { text: f.label });
    const dd = el('dd.src__v', { dataset: { level: got.level || 'missing' } });
    if (got.value) {
      if (got.level === 'class') {
        weak++;
        if (!seen.has(key + ':cls:' + f.key)) { seen.add(key + ':cls:' + f.key); classCount++; }
        const ck = (src.kind || 'unrecorded') + '|' + f.key;
        if (panel) {
          const prior = panel.classFirst.get(ck);
          if (prior) prior.n++;
          else panel.classFirst.set(ck, { anchorId: root.id, label: f.label, n: 1, kind: src.kind || 'unrecorded' });
        }
      }
      /* THE ATTRIBUTION GATE. Charge 8's second move: on one source per
         dossier the answer to "what was this made for?" is not in the DOM
         until the student has committed to one. Round 3 had no gate here
         because it had nothing to gate — it read the charge as being about
         quotations, and our 880 evidence entries carry none. The habit the
         charge is about is not "read the quote marks"; it is treating a source
         as an ACT BY SOMEONE WITH A PURPOSE. That is gateable on a citation. */
      if (opts.gate && f.key === 'purpose' && typeof opts.gate.render === 'function') {
        dd.dataset.gate = 'yes';
        const node = opts.gate.render({ src, value: got.value, level: got.level, sink: opts.sink || null });
        if (node) { dd.append(node); dl.append(dt, dd); continue; }
      }
      {
        /* Every string a student reads goes through the §7.1 filter, including
           the four provenance answers. Round 3 exempted them, so "Native Life
           in South Africa" and "the Native Police" printed unmarked inside a
           citation while the same words were marked six lines above. */
        dd.append(houseNodes(got.value, opts.sink || null));
        const word = LEVEL_WORD[got.level];
        if (word) dd.append(el('span.src__level', { dataset: { level: got.level }, text: word }));
        if (got.gap) dd.append(el('span.src__level', { dataset: { level: 'gap' }, text: got.gap }));
      }
    } else {
      missing++;
      dd.append(el('b.defect', { text: '[unsourced]' }));
      dd.append(el('span.src__level', { dataset: { level: 'missing' }, text: 'nothing in the record answers this, and nothing true of its class either' }));
      if (!seen.has(key + ':' + f.key)) {
        seen.add(key + ':' + f.key);
        unsourcedCount++;
        if (busRef) busRef.emit('source:unsourced', { field: f.key, key, count: unsourcedCount });
      }
    }
    dl.append(dt, dd);
  }
  root.append(dl);

  if (src.supports) {
    /* `supports` is prose in this app's voice like any other, so it goes
       through the house-style filter too. Round 2 found three "both sides" in
       it — the only banned strings left in the rendered panel — because this
       one string was the only prose that bypassed the filter. */
    root.append(el('p.src__for', {},
      el('span.sc.src__k', { text: 'Cited here for' }), ' ',
      houseNodes(String(src.supports), opts.sink || null)));
  }

  if (src.quote) {
    /* The four answers are already above this in DOM order and at the same
       type size. Only now, and never before, the words themselves. Quotations
       are NOT passed through the house-style filter: a historical text keeps
       the words its author used, which is the entire function of the marks
       around it (DIDACTIC_SPEC §7.1, rule 4). */
    const q = el('blockquote.src__quote');
    q.append(el('p', { text: String(src.quote) }));
    root.append(q);
    if (src.speaker) root.append(el('figcaption.src__speaker', { text: String(src.speaker) }));
    root.dataset.primary = 'yes';
  }

  /* Where a student, or a head of department, can go and check it against the
     original. Charge 13 in one line per source. It renders for any source that
     carries a locator, quotation or not. */
  if (src.check) {
    const chk = el('p.src__check', {}, el('span.sc.src__k', { text: 'Check it against' }), ' ');
    /* Through the same §7.1 filter as every other string a student reads.
       A book title is not an exemption: "Native Life in South Africa" gets the
       same marks in a locator as it gets in a sentence. */
    chk.append(houseNodes(String(src.check), opts.sink || null));
    root.append(chk);
  }

  if (missing) root.dataset.defect = String(missing);
  else if (weak) root.dataset.weak = String(weak);
  return root;
}

/** How many of the four required fields have no answer at any level. */
export function missingFields(src) {
  if (!src || typeof src !== 'object') return FIELDS.length;
  const v = provenanceOf(src);
  return FIELDS.reduce((n, f) => n + (v[f.key] && v[f.key].value ? 0 : 1), 0);
}

/** How many of the four are answered only at the level of the source's class. */
export function classFields(src) {
  if (!src || typeof src !== 'object') return 0;
  const v = provenanceOf(src);
  return FIELDS.reduce((n, f) => n + (v[f.key] && v[f.key].level === 'class' ? 1 : 0), 0);
}

/** How many carry a note this atlas wrote about that specific work. */
export function workFields(src) {
  if (!src || typeof src !== 'object') return 0;
  const v = provenanceOf(src);
  return FIELDS.reduce((n, f) => n + (v[f.key] && v[f.key].level === 'work' ? 1 : 0), 0);
}

/** A one-line reference, for lists. Still routed through the same field maths,
 *  so a reference can never quietly drop the provenance a quotation must show. */
export function sourceLine(src) {
  const v = provenanceOf(src);
  return [src.author, src.work && src.work + (src.year ? ', ' + src.year : '')].filter(Boolean).join(', ')
    || (v.origin && v.origin.value) || '[unsourced]';
}

export const SOURCE_FIELDS = FIELDS.map((f) => f.key);

/* ------------------------------------------------------ the provenance rail --
 * Charge 8's third move, and the one a footnote number cannot do: give the
 * evidence a SHAPE the eye reads before a word of it. One tick per source, in
 * the order they appear on the page, textured by `kind`. A page that is six
 * modern monographs and no testimony looks like six identical marks; a page
 * with an official record and a memoir does not. The counts are printed beside
 * it in words, because a rail on its own is decoration.
 */
export const KIND_WORD = {
  book: ['book by a modern historian', 'books by modern historians'],
  article: ['journal article', 'journal articles'],
  chapter: ['chapter in an edited book', 'chapters in edited books'],
  'primary-source': ['source made at the time', 'sources made at the time'],
  'official-record': ['official record', 'official records'],
  'reference-work': ['reference work', 'reference works'],
  unrecorded: ['source of unrecorded kind', 'sources of unrecorded kind'],
};

export function provenanceRail(sources, opts = {}) {
  const list = (sources || []).filter(Boolean);
  if (!list.length) return null;
  const wrap = el('div.src__rail', { role: 'img' });
  const kinds = new Map();
  for (const s of list) {
    const k = s.kind || 'unrecorded';
    kinds.set(k, (kinds.get(k) || 0) + 1);
    wrap.append(el('span.src__tick', { dataset: { kind: k }, 'aria-hidden': 'true' }));
  }
  const bits = [...kinds.entries()].map(([k, n]) => {
    const w = KIND_WORD[k] || [k, k + 's'];
    return n + ' ' + (n === 1 ? w[0] : w[1]);
  });
  wrap.setAttribute('aria-label', 'The evidence on this page, one mark per source: ' + bits.join(', ') + '.');
  if (opts.wrapInto) opts.wrapInto.append(wrap);
  return { rail: wrap, bits, kinds };
}

/** What a source of this class was made for — the answer the gate scores on. */
export const PURPOSE_CLASS = {
  book: 'argue', chapter: 'argue', article: 'argue',
  'reference-work': 'consult',
  'official-record': 'administer',
  'primary-source': 'persuade',
};

export const PURPOSE_CHOICES = [
  { id: 'argue', label: 'To argue a case to other historians' },
  { id: 'administer', label: 'To run something, for the administration’s own use' },
  { id: 'persuade', label: 'To persuade, justify or record, by someone who was there' },
  { id: 'consult', label: 'To be consulted, not read' },
];

export default renderSource;
