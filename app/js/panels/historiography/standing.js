/* panels/historiography/standing.js — THE STANDING CHECKS.
 *
 * WHY THIS FILE EXISTS. Three times now this atlas has printed one authored
 * sentence over a set of records it had not read.
 *
 *   round 2  nine Asian conquests headlined "Handed over by another European
 *            power at the end of a war" — Mysore, the Marathas, the Lahore
 *            Durbar, Konbaung Burma, Nepal, Bhutan, Ajmer, Assam and Burma.
 *            One gloss string keyed to a mechanism tag. Scored 40.
 *   before   the same bug in a different form: `annexation-of-existing-colony`
 *            printing "taken from Europeans" over Kenya's African counterparties.
 *   round 5  seven Australian states drawn as bare paper under the accessible
 *            name "a silence: no record was allowed to survive here", over a
 *            single Bringing Them Home sentence which says that removal records
 *            "were poor and many were destroyed".
 *
 * That is not three typos. It is one defect with one shape: A SENTENCE ABOUT A
 * RECORD, PRINTED WITHOUT READING THE RECORD. The cure that worked the first
 * time is `acquisitionVerb()` in panels/dossier/fields.js, which reads the
 * acquisition's own `counterparties[]` before it is allowed to assert one, and
 * `auditHeadlines()` in this directory's index.js, which walks the live dataset
 * and reports any headline that names a party the record does not.
 *
 * This file applies the same cure to the two remaining places the class lives.
 *
 *   `auditSilences()`  every hole the plate can draw, against the sentence the
 *                      shard actually supplies for it.
 *   `auditWorks()`     every cited work in the atlas, against every other, so
 *                      that one book counted twice under two spellings is a
 *                      finding rather than a bibliography a marker notices first.
 *
 * NOTHING HERE RENDERS. It runs against the data as loaded, not against a
 * fixture, so a retag in a shard tomorrow is caught by
 * `BEA.historiography.audit()` today. Findings carry `piece`, naming the
 * directory that must fix them, because this module can report a defect in the
 * plate and must not pretend it can repair one.
 */

/* ========================================================== the silences ==== */

/**
 * THE SENTENCE THE PLATE PRINTS OVER A HOLE.
 *
 * Set as `label` on every `mode: 'hole'` paint record in map/index.js, spoken
 * as the accessible name, and printed by legend/key.js and legend/byline.js.
 * It is quoted here because this check is a check ON IT: change the sentence
 * and the three assertions below have to be re-derived, which is the point.
 */
const HOLE_HEADLINE = 'no record was allowed to survive here';

/**
 * WHAT THAT SENTENCE ASSERTS. Three things, and a shard's own sentence has to
 * carry all three or the plate is claiming more than it has read.
 *
 *   1. AN ACT.       "was allowed to survive" is about a record that existed
 *                    and then did not. Somebody destroyed, removed, concealed
 *                    or withheld it. A record that is merely thin, or a count
 *                    that was never made, is a different kind of hole and this
 *                    atlas already has two other shapes for it.
 *   2. TOTALITY.     "NO record", not "many records". A sentence that says
 *                    many were destroyed supports "many were destroyed", and a
 *                    sentence that also blames the survivors' quality — "the
 *                    records were poor" — is describing an archive that is
 *                    incomplete, which is not the same claim at all.
 *   3. A PERMISSION. "allowed" names somebody who had the authority to allow
 *                    it. FEATURE_SPEC §1 charge 7 makes the named `agent`
 *                    required for exactly this reason: records do not get
 *                    destroyed, people destroy them.
 */
const RECORD_NOUN = '(?:records?|files?|archives?|documents?|registers?|papers?|ledgers?|returns?|dockets?)';
const DESTROY_VERB = '(?:destroy\\w*|burn\\w*|shred\\w*|conceal\\w*|hidden|hiding|withheld|withhold\\w*|suppress\\w*|removed to Britain|weeded|culled)';
/* The noun first, then the verb, inside one sentence: the ordering is what
   stops "British columns burned hundreds of villages" reading as a burnt
   archive. Kept deliberately close to search/silence.js's own test, which is
   the function that decides a shard sentence is about a destroyed record. */
const ACT = new RegExp(RECORD_NOUN + '\\b[^.]{0,160}\\b' + DESTROY_VERB
  + '|\\b' + DESTROY_VERB + '\\b[^.]{0,80}' + RECORD_NOUN
  + '|Hanslope|Operation Legacy|migrated archive', 'i');

/* A quantifier that governs the destruction and is short of all of it. Word
   boundaries matter: Kenya's sentence says "thousands more were removed", which
   is not a hedge, and must not be read as one. */
const PARTIAL = /\b(many|some|most|much|several|a number of|a few|partly|partial|in part|parts? of|certain)\b/i;
/* The archive was thin as well as raided — a second, different reason the
   number cannot be given, and the one the Bringing Them Home sentence gives
   first. Where it appears, "no record was ALLOWED to survive" is doing work the
   record does not support. */
const THIN = /\b(poor|incomplete|patchy|fragmentary|inadequate|unreliable|never (?:kept|made)|were not kept)\b/i;
/* Stronger than a hedge: the sentence DENIES the destruction. Australia's shard
   now ends "The inquiry did not find that the record had been systematically
   destroyed, and it named no destroyer" — and the plate went on drawing seven
   holes over it, because the words "record" and "destroyed" are both in the
   sentence and nothing was reading the word between them. */
const DENIED = new RegExp('\\b(?:no|not|never|nothing|neither)\\b[^.]{0,80}\\b' + DESTROY_VERB, 'i');

/**
 * Read the set of holes the plate can draw, from the plate itself.
 *
 * Three routes, in order of how close they are to what is painted, because an
 * audit that silently sees nothing is the failure mode this whole file exists
 * to kill. If the map is mounted and none of them answer, that is itself a
 * finding.
 */
function silenceSet(map) {
  if (!map) return { rows: [], reachable: true, note: 'no map on this page' };
  const rows = [];
  try {
    const live = map.silences;
    if (live && typeof live.forEach === 'function' && live.size) {
      live.forEach((s, uid) => rows.push([uid, s]));
      return { rows, reachable: true, via: 'the live paint set' };
    }
  } catch (_) { /* fall through */ }
  try {
    const der = map.module && map.module._derivedSilences && map.module._derivedSilences();
    if (Array.isArray(der)) return { rows: der, reachable: true, via: 'the plate’s derived set' };
  } catch (_) { /* fall through */ }
  return { rows: [], reachable: false };
}

/**
 * Every silence the plate can draw, checked against the sentence it quotes.
 *
 * One finding per TERRITORY, not per unit: seven Australian states are one
 * editorial decision made once, and seven identical findings would bury it.
 */
export function auditSilences(map) {
  const out = [];
  const { rows, reachable, note } = silenceSet(map);
  if (!reachable) {
    return [{
      piece: 'map', id: 'silences',
      problem: 'the silence set could not be read, so the headline over every hole is unchecked',
      detail: 'Neither map.silences nor map.module._derivedSilences() answered. This check is the '
        + 'third guard on a defect class that has already scored 40 once; it must not pass by being blind.',
    }];
  }
  if (note) return out;

  const byT = new Map();
  for (const [uid, s] of rows) {
    if (!s) continue;
    const k = s.territoryId || uid;
    if (!byT.has(k)) byT.set(k, { units: [], s });
    byT.get(k).units.push(uid);
  }

  for (const [tid, { units, s }] of byT) {
    const sentence = String(s.reason || '').trim();
    const where = { piece: 'map', id: 'silence/' + tid };
    const drawn = units.length === 1 ? '1 unit' : units.length + ' units';
    const said = sentence ? '“' + sentence + '”' : 'no sentence at all';

    if (!sentence) {
      out.push({ ...where, problem: 'a hole is drawn with no sentence under it',
        detail: `${drawn} drawn as bare paper under “${HOLE_HEADLINE}” with nothing quoted beneath.` });
      continue;
    }
    if (!ACT.test(sentence)) {
      out.push({ ...where,
        problem: 'the hole asserts a destroyed record and the sentence beneath it does not describe one',
        detail: `${drawn} · ${HOLE_HEADLINE} · the record says: ${said}` });
      continue;
    }
    if (DENIED.test(sentence)) {
      out.push({ ...where,
        problem: 'the hole says the record was destroyed and the sentence beneath it says it was not',
        detail: `${drawn} drawn as bare paper under “${HOLE_HEADLINE}”, over: ${said}`,
        fix: 'This is a denial, not a hedge. The plate is printing the opposite of its own evidence: '
          + 'either the silence is a different shape — a count that was never made — or it should not '
          + 'be drawn.' });
      continue;
    }
    if (PARTIAL.test(sentence) || THIN.test(sentence)) {
      const hedge = (sentence.match(PARTIAL) || sentence.match(THIN) || [''])[0];
      out.push({ ...where,
        problem: 'the hole says NO record survived; the sentence beneath it says only that some did not',
        detail: `${drawn} drawn as bare paper under “${HOLE_HEADLINE}”, over: ${said} — the word “${hedge}” `
          + 'is the whole difference between an archive that was destroyed and an archive that is incomplete. '
          + 'The claim is in the accessible name, so a screen-reader user gets it unqualified.',
        fix: 'Do here what acquisitionVerb() does in panels/dossier/fields.js: read the record before '
          + 'asserting over it. A hole whose sentence hedges needs its own headline — “much of this record '
          + 'was destroyed” — or it should not be drawn as a hole at all.' });
      continue;
    }
    if (!s.agent || !String(s.agent).trim()) {
      out.push({ ...where,
        problem: 'the hole says the record was not ALLOWED to survive and names nobody who could allow it',
        detail: `${drawn} · the record says: ${said} · agent: none. FEATURE_SPEC §1 charge 7 requires a named `
          + 'agent on a silence, because records do not get destroyed, people destroy them.' });
    }
  }
  return out;
}

/* ============================================================= the works ==== */

/**
 * THE ATLAS'S OWN IDENTITY KEY FOR A CITED WORK.
 *
 * search/corpus.js keys the bibliography on `norm(author|work|year)` using
 * search/match.js's `norm`, so two records of one book are two entries in the
 * evidence ledger whenever the two strings differ by a subtitle, an initial or
 * a full stop. This reproduces that key exactly rather than inventing a
 * kinder one — the point is to find what the LEDGER will double-count, not
 * what a generous reader would forgive.
 */
function norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Fold runs of single letters into one token, so "U. S." and "US" agree, and
    "I. M. Lewis" and "I.M. Lewis" are one man. */
function fold(s) {
  return norm(s).replace(/\b(?:[a-z] ){1,4}[a-z]\b/g, (m) => m.replace(/ /g, ''));
}

const TITLE_STOP = new Set(['the', 'a', 'an', 'of', 'in', 'and', 'on', 'to', 'for']);

/**
 * Every work cited anywhere in the dataset, keyed the way the ledger keys it.
 * The walk is corpus.js's walk — territory evidence, acquisition evidence,
 * departure evidence, event evidence — so the count this returns is the count
 * the student is shown.
 */
export function works(data) {
  const by = new Map();
  if (!data || !Array.isArray(data.territories)) return [];
  const add = (src, where) => {
    if (!src || !src.work) return;
    const key = norm((src.author || '') + '|' + src.work + '|' + (src.year || ''));
    let r = by.get(key);
    if (!r) {
      r = { key, author: src.author || null, work: src.work, year: Number(src.year) || null, cites: 0, where: [] };
      by.set(key, r);
    }
    r.cites += 1;
    if (r.where.length < 4 && !r.where.includes(where)) r.where.push(where);
  };
  const walk = (list, where) => { for (const e of list || []) add(e, where); };
  for (const t of data.territories) {
    walk(t.evidence, t.id);
    for (const a of t.acquisitions || []) walk(a.evidence, t.id);
    for (const d of t.departures || []) walk(d.evidence, t.id);
  }
  for (const e of data.events || []) walk(e.evidence, 'event:' + e.id);
  return [...by.values()];
}

/**
 * One book, two entries. Three shapes, and each is stated so that the fix is
 * obvious from the finding — a bibliography that lists the same book twice is
 * the first thing a marker notices, and the second thing they conclude is that
 * nobody read it.
 */
export function auditWorks(data) {
  const list = works(data);
  const out = [];
  /* Folded once per work, not once per comparison: 628 works is ~197,000 pairs
     and re-splitting both strings inside the inner loop made `audit()` the
     slowest thing on the page. Pairs are also only considered within a year,
     which cuts the real work by two orders of magnitude — two records of one
     book always agree about the year, because the year is in the ledger's key. */
  const F = list.map((w) => ({
    a: fold(w.author).split(' ').filter(Boolean),
    t: fold(w.work).split(' ').filter(Boolean),
  }));
  const byYear = new Map();
  list.forEach((w, i) => {
    const y = w.year || 0;
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push(i);
  });
  const seen = new Set();
  for (const idx of byYear.values()) {
    for (let ii = 0; ii < idx.length; ii += 1) {
      for (let jj = ii + 1; jj < idx.length; jj += 1) {
      const i = idx[ii]; const j = idx[jj];
      const a = list[i]; const b = list[j];
      const a1 = F[i].a; const a2 = F[j].a; const t1 = F[i].t; const t2 = F[j].t;
      if (!a1.length || !a2.length || !t1.length || !t2.length) continue;
      const sameAuthor = a1.join(' ') === a2.join(' ');
      const sameTitle = t1.join(' ') === t2.join(' ');
      let why = null;
      if (sameAuthor && sameTitle) {
        why = 'the two records differ only in punctuation or an initial';
      } else if (sameAuthor) {
        /* One title is the other with its subtitle attached. Compared as a
           prefix of the word sequence, not as a substring, so "A Modern
           History of the Somali" and "…: Nation and State in the Horn of
           Africa" are one book and two different books about Kenya are not. */
        const n = Math.min(t1.length, t2.length);
        let prefix = n >= 3 && t1.length !== t2.length;
        for (let k = 0; k < n && prefix; k += 1) if (t1[k] !== t2[k]) prefix = false;
        if (prefix) why = 'one record carries the subtitle and the other stops at the colon';
      } else if (sameTitle) {
        const small = a1.length <= a2.length ? a1 : a2;
        const big = new Set(a1.length <= a2.length ? a2 : a1);
        const real = small.filter((t) => t.length > 1 && !TITLE_STOP.has(t));
        if (real.length && real.every((t) => big.has(t))) {
          why = 'one record gives the author’s initials and the other does not';
        }
      }
      if (!why) continue;
      const k = a.key + '||' + b.key;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push({
        piece: 'data',
        id: 'works/' + (a.author || '?').split(' ').pop().toLowerCase() + '-' + (a.year || ''),
        problem: 'one work counted twice in the bibliography: ' + why,
        detail: `[${a.year}] ${a.author} — ${a.work}  (cited ${a.cites}×, e.g. ${a.where.join(', ')})\n`
          + `[${b.year}] ${b.author} — ${b.work}  (cited ${b.cites}×, e.g. ${b.where.join(', ')})`,
        fix: 'Make the two records agree, string for string. search/corpus.js keys the ledger on '
          + 'norm(author|work|year), so anything short of an exact match is a second entry.',
      });
      }
    }
  }
  return out;
}

/** What the bibliography would count, and what it should count. */
export function workStats(data) {
  const n = works(data).length;
  const dupes = auditWorks(data).length;
  return { counted: n, duplicated: dupes, distinct: n - dupes };
}

/* ==================================================== the attributions ====== */

/**
 * THE CLASS AGAIN, IN THE ONE PLACE IT HAD NOT BEEN CAUGHT: A CITATION.
 *
 * Round 3's historian found it. `Africa and the Victorians` was printed with
 * `author: 'Ronald Robinson and John Gallagher'` and, two lines below in the
 * same rectangle, `check: '… with Alice Denny …'`. Two authors in the line the
 * student reads, three in the line that tells them where to go and check it.
 * The citation was right; the display disagreed with it.
 *
 * That is the same defect as the gloss and the silences and the headline: A
 * SENTENCE ABOUT A RECORD, PRINTED WITHOUT READING THE RECORD — here the record
 * is the citation sitting six inches away. Round 3 said of the gloss class that
 * "patching the third one is not the job — killing the class is". This is the
 * fourth surface, so it gets a rule rather than an edit.
 *
 * WHAT IT COMPARES. Every citation this atlas renders through `renderSource()`
 * carries both an `author` line, which is printed, and a `check` line, which is
 * printed under it. Where the `check` names the same work, the two must agree
 * about who wrote it. The rule is asymmetric on purpose, because the two
 * directions are not the same defect:
 *
 *   the check credits somebody the author line does not
 *       — the Denny case. Always wrong: the student is shown fewer authors than
 *         the work has, and the evidence that it is wrong is in the same box.
 *   the check names the work and nobody from the author line
 *       — the reader cannot get from the display to the shelf. It caught
 *         `Legacies of British Slave-ownership`, whose check pointed at the
 *         UCL database and named none of its five authors.
 *
 * The reverse — an author line naming somebody the check does not — is NOT a
 * finding, because a primary source legitimately prints its speaker as author
 * and cites the volume that carries the words: `author: 'Samuel Sharpe,
 * reported by Henry Bleby'` against `check: 'Henry Bleby, Death Struggles of
 * Slavery …'` is correct, and a rule that failed it would be a rule nobody
 * could keep. Neither is a year absent from a check line, because an archival
 * citation gives the repository and the box, not a date of publication.
 *
 * Run over the fourteen arguments' 39 citations AND the dossier's 43 primary
 * texts, which are the whole set of citations this atlas prints with a check
 * line. Testimony findings carry `piece: 'P08'` — this module can report a
 * defect in another directory and must not pretend it can repair one.
 */

/* Words that begin a citation without being anybody's name. Kept small and
   explicit: a stoplist that grows to silence a finding is a rule being bent. */
const CITE_STOP = new Set(['and', 'with', 'the', 'of', 'in', 'ed', 'eds', 'a', 'an', 'for', 'on',
  'to', 'at', 'by', 'de', 'van', 'von', 'da', 'du', 'la', 'le', 'et', 'al', 'jr', 'sr', 'st',
  'vol', 'vols', 'edn', 'ser', 'no', 'pp', 'ch', 'chs', 'see', 'also', 'from', 'after', 'before',
  'trans', 'rev', 'repr', 'new', 'ns', 'his', 'her', 'their', 'its', 'any', 'modern', 'edition',
  'original', 'reproduced', 'printed', 'quoted', 'sourced', 'text', 'texts', 'letter', 'report']);

/* Ranks and roles that sit in front of a name. Not names. */
const CITE_TITLES = new Set(['Captain', 'Lieutenant', 'Governor', 'Sir', 'Lord', 'Dr', 'Mr', 'Mrs',
  'General', 'Brigadier', 'Colonel', 'Major', 'Professor', 'Rev', 'Reported', 'Recorded',
  'Published', 'Printed', 'Presented', 'Quoted']);

function citeNames(s, exclude) {
  const out = new Set();
  for (const raw of String(s == null ? '' : s).split(/\s+/)) {
    const w = raw.replace(/[^A-Za-zÀ-ÿ'’-]/g, '');
    if (w.length < 3 || CITE_STOP.has(w.toLowerCase()) || CITE_TITLES.has(w)) continue;
    if (!/^[A-ZÀ-Þ]/.test(w)) continue;
    if (exclude && exclude.has(w)) continue;
    out.add(w);
  }
  return out;
}

const citeNorm = (s) => String(s == null ? '' : s)
  .replace(/[“”"’‘']/g, "'").replace(/\s+/g, ' ').toLowerCase();

const citeHead = (s, n) => String(s == null ? '' : s).split(/\s+/).filter(Boolean).slice(0, n).join(' ');

/** "Sol" against "Solomon Tshekisho Plaatje" is the same man, not a fourth author. */
const isShortForm = (w, set) => [...set].some((a) => a !== w && a.toLowerCase().startsWith(w.toLowerCase()));

/* Number words a citation is likely to reach for when it says how long a thing
   is. Numerals are handled by the same regex. */
const CITE_NUM = new Map([['one', 1], ['two', 2], ['three', 3], ['four', 4], ['five', 5],
  ['six', 6], ['seven', 7], ['eight', 8], ['nine', 9], ['ten', 10], ['eleven', 11],
  ['twelve', 12], ['thirteen', 13], ['fourteen', 14], ['fifteen', 15], ['sixteen', 16],
  ['seventeen', 17], ['eighteen', 18], ['nineteen', 19], ['twenty', 20], ['thirty', 30],
  ['forty', 40], ['fifty', 50], ['sixty', 60], ['seventy', 70], ['eighty', 80], ['ninety', 90]]);

/**
 * "A journal article, sixteen pages" over a check line that reads "1–15".
 *
 * The same defect one more time, and this one was caught by reading the screen
 * rather than the file: the sentence describing the record disagreed with the
 * record's own locator, printed four lines under it. The 1953 article is
 * fifteen pages. Only fires when BOTH numbers are present, so a citation that
 * gives no page range is not nagged for one.
 */
function pageDisagreement(s) {
  const said = String(s.nature || '').match(/\b(\d{1,4}|[a-z]+)[- ]pages?\b|\b(\d{1,4}|[a-z]+)\s+pages\b/i);
  if (!said) return null;
  const word = String(said[1] || said[2] || '').toLowerCase();
  const claimed = /^\d+$/.test(word) ? Number(word) : CITE_NUM.get(word);
  if (!claimed) return null;
  const range = String(s.check || '').match(/\b(\d{1,4})\s*[–—-]\s*(\d{1,4})\b\s*\.?\s*$/);
  if (!range) return null;
  const from = Number(range[1]); const to = Number(range[2]);
  if (!(to > from)) return null;
  const actual = to - from + 1;
  return actual === claimed ? null : { claimed, actual, range: from + '–' + to };
}

/** One citation, against its own check line. */
export function auditCitation(id, s, piece) {
  const out = [];
  if (!s || !s.check || !s.work) return out;
  const chk = String(s.check);
  const key = citeNorm(citeHead(s.work, 3));
  /* The check has to be talking about this work before it can disagree about
     who wrote it. Where it names an archive instead — which is the right
     citation for a treaty or a despatch — there is nothing to compare. */
  const at = key ? citeNorm(chk).indexOf(key) : -1;
  if (at <= 0) return out;
  /* The run before the title has to LOOK like an author list before it can be
     read as one. A citation may legitimately name another work first — an
     article, an edition, an archive — and the words of that title are not
     people. So: no quotation mark, no parenthesis, and no more than a dozen
     words. Anything longer or punctuated is a citation this rule declines to
     read rather than one it reads wrongly. */
  const head = chk.slice(0, at);
  if (/[“”"(]/.test(head) || head.split(/\s+/).filter(Boolean).length > 12) return out;
  const inTitle = citeNames(String(s.work) + ' ' + (s.publisher || ''));
  const shown = citeNames(s.author, inTitle);
  const cited = citeNames(head, inTitle);
  const where = { piece: piece || 'P16', id };
  if ([...shown].some((w) => cited.has(w))) {
    const extra = [...cited].filter((w) => !shown.has(w) && !isShortForm(w, shown));
    if (extra.length) {
      out.push({ ...where,
        problem: 'the citation credits an author the line the student reads does not',
        detail: `printed: “${s.author}” · citation: “${head.trim()}” · dropped from the display: ${extra.join(', ')}`,
        fix: 'Put the same names in `author` as in `check`. The check line is the one that was '
          + 'copied off the title page; the author line is the one that was typed.' });
    }
  } else if (shown.size && ![...shown].some((w) => chk.includes(w))) {
    out.push({ ...where,
      problem: 'the citation names this work and nobody from the author line above it',
      detail: `printed: “${s.author}” · citation: “${chk}”`,
      fix: 'Name the authors in the check line, so a reader can get from the display to the shelf.' });
  }
  const pg = pageDisagreement(s);
  if (pg) {
    out.push({ ...where,
      problem: 'the sentence describing the work disagrees with the page range cited under it',
      detail: `“…${pg.claimed} pages…” · citation: ${pg.range}, which is ${pg.actual}`,
      fix: 'Count the range. The locator was copied; the adjective was written.' });
  }
  return out;
}

/**
 * Every citation this module renders, plus the dossier's primary texts.
 * `disputes` and `texts` are passed in rather than imported so the rule can be
 * run against a fixture with a known defect — see accept.scenario.js.
 */
export function auditAttribution(disputes, texts) {
  const out = [];
  for (const d of disputes || []) {
    for (const p of d.positions || []) {
      if (p.src) out.push(...auditCitation(d.id + '/' + p.key, p.src, 'P16'));
      /* The badge is the position's name on screen — "Econocide, 1977". If it
         carries years, one of them has to be the year of the work cited under
         it, or the student is reading two different books as one. */
      const ys = (String(p.badge || '').match(/\b(1[4-9]\d\d|20\d\d)\b/g) || []).map(Number);
      if (p.src && p.src.year && ys.length && !ys.includes(Number(p.src.year))) {
        out.push({ piece: 'P16', id: d.id + '/' + p.key,
          problem: 'the badge on the position names a different year from the work cited under it',
          detail: `badge: “${p.badge}” · citation year: ${p.src.year}`,
          fix: 'Name the cited work in the badge, or cite the work the badge names.' });
      }
    }
    for (const s of d.extraSources || []) out.push(...auditCitation(d.id + '/' + citeHead(s.work, 2), s, 'P16'));
  }
  for (const t of texts || []) out.push(...auditCitation('testimony/' + t.id, t, 'P08'));
  return out;
}

/** How much of the atlas's citation surface this rule actually covers. */
export function attributionStats(disputes, texts) {
  let n = 0;
  for (const d of disputes || []) {
    for (const p of d.positions || []) if (p.src && p.src.check) n += 1;
    for (const s of d.extraSources || []) if (s.check) n += 1;
  }
  for (const t of texts || []) if (t.check) n += 1;
  return { citations: n, findings: auditAttribution(disputes, texts).length };
}
