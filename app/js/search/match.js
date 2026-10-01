/**
 * search/match.js — the matcher.
 *
 * A student types "Van Diemen's Land", "Ceylon", "Rhodeisa" or "bombay". None
 * of those is the name this atlas files the place under, and one of them is a
 * typo. The matcher's whole job is that none of that should matter.
 *
 * FOUR LADDERS, in descending confidence, and every hit records WHICH name it
 * matched so the result row can print "you asked for Ceylon; this atlas files
 * it as Sri Lanka (maritime provinces)". A search engine that silently
 * substitutes a modern name teaches that the historical name was wrong.
 *
 *   1. exact          the whole field is the query
 *   2. prefix         the field, or a word inside it, starts with the query
 *   3. substring      the query appears anywhere in the field
 *   4. edit distance  one or two typos away from a word in the field
 *
 * No dependency, no index build cost beyond a lowercased string per field.
 */

/** Fold case, strip diacritics and punctuation, collapse whitespace. */
export function norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function words(s) { const n = norm(s); return n ? n.split(' ') : []; }

/**
 * Words that are grammar, not names. They are dropped from the "every query
 * word must land somewhere" rule, because otherwise "how many died AT
 * partition" matches Natal, Montserrat and every Protectorate in the atlas —
 * measured, in round 1 of this piece, at 47 spurious answers for one question.
 */
export const STOP = new Set(('a an and are as at be by did do does for from how in is it its many much '
  + 'not of on or the their there they this to was were what when where which who whom why will with '
  + 'deaths death dead died dying killed kill toll number numbers figure figures count counted counting '
  + 'casualties casualty victims records record files file archives archive destroyed missing lost '
  + 'displaced refugees removed detained hanged statistics evidence silence silences absence unknown '
  + 'people person year years').split(' '));

/** The words in a query that actually name something. */
export function keyWords(s) {
  const w = words(s).filter((x) => !STOP.has(x) && !/^\d{4}$/.test(x));
  return w.length ? w : words(s);
}

/**
 * Bounded Levenshtein. Returns a number > max as soon as it can prove it,
 * so a 300-term corpus costs nothing measurable.
 */
export function edits(a, b, max = 2) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  let prev = new Array(lb + 1);
  let cur = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) prev[j] = j;
  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let best = cur[0];
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= lb; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    const t = prev; prev = cur; cur = t;
  }
  return prev[lb];
}

/**
 * Score one query against one name, with the reason.
 *
 * `full` is the round-3 addition and it carries the piece's relevance cliff.
 * It says: the WHOLE query landed on this name — either the name is the query,
 * or it starts with it, or it contains it, or every naming word in the query
 * found a word here. A match that is only `full: false` landed *part* of the
 * query: "Tipu Sultan" against "The Sultanate of Muscat and Oman", "Sam
 * Sharpe" against "Western Samoa", "Berlin Conference" against "The Cairo
 * Conference". Measured in round 3: five of the nine answers to *Tipu Sultan*
 * were places that matched the word "sultan" and nothing else. `_search` drops
 * partial matches whenever a full one exists, which is why that list is now
 * four rows and all four are about Mysore.
 *
 * `weight` lets a record say "my own name counts for more than my region does".
 */
export function scoreNameDetail(q, qw, name, weight = 1) {
  const n = norm(name);
  if (!n) return { s: 0, full: false };
  if (n === q) return { s: Math.round(1000 * weight), full: true };

  const nw = n.split(' ');
  let s = 0;
  let full = false;
  const take = (v, isFull) => { if (v > s) { s = v; full = isFull; } };

  if (n.startsWith(q)) take(820 * weight - Math.min(60, n.length - q.length), true);
  else if (nw.some((w) => w.startsWith(q))) take(690 * weight, true);

  if (!s && n.includes(q)) take(520 * weight, true);

  /* Every query word must land somewhere: "van diemens land" against
     "Tasmania · Van Diemen's Land" should beat "New Zealand" on "land". */
  if (qw.length > 1) {
    /* Whole words, not substrings: otherwise "Operation Legacy" is answered by
       "Non-co-OPERATION and Khilafat", which it was, in round 1. */
    let hit = 0;
    for (const w of qw) if (nw.some((x) => x === w || x.startsWith(w))) hit++;
    if (hit === qw.length) take(640 * weight + 20 * hit, true);
    else if (hit) take(260 * weight + 30 * hit, false);
  }

  /* Typos, last. Only on words long enough for an edit to be meaningful:
     at three letters everything is two edits from everything. */
  if (!s && q.length >= 4) {
    const max = q.length >= 7 ? 2 : 1;
    for (const w of nw) {
      if (Math.abs(w.length - q.length) > max) continue;
      const d = edits(q, w, max);
      if (d <= max) { take((430 - 90 * d) * weight, true); break; }
    }
  }
  return { s: Math.round(s), full: s > 0 && full };
}

/** The same thing, as the bare number the older callers want. */
export function scoreName(q, qw, name, weight = 1) {
  return scoreNameDetail(q, qw, name, weight).s;
}

/**
 * Score a query against a record's whole name set.
 * Returns { score, via } — `via` is the name that actually matched, which the
 * result row prints when it is not the record's headline name.
 */
export function scoreRecord(q, qw, names) {
  let best = 0, via = null, viaKind = null, full = false;
  for (const nm of names) {
    const r = scoreNameDetail(q, qw, nm.text, nm.weight == null ? 1 : nm.weight);
    if (r.s > best) { best = r.s; via = nm.text; viaKind = nm.kind || null; full = r.full; }
  }
  return { score: best, via, viaKind, full };
}

/**
 * Score a record against several readings of the same query, and keep the best.
 *
 * A student types "Kenya deaths 1954". Read whole, that string matches nothing
 * called Kenya. Read as its naming words — "kenya" — it matches exactly. Both
 * readings have to be tried, and the whole-string reading has to win ties, or
 * a search for "New South Wales" would be answered by "Wales".
 *
 * `variants` is [{ q, qw, mul }], strongest first.
 */
export function scoreBest(variants, names) {
  let best = 0, via = null, viaKind = null, full = false;
  for (const v of variants) {
    if (!v.q) continue;
    const r = scoreRecord(v.q, v.qw, names);
    const s = Math.round(r.score * (v.mul == null ? 1 : v.mul));
    if (s > best) { best = s; via = r.via; viaKind = r.viaKind; full = r.full; }
  }
  return { score: best, via, viaKind, full };
}

/** Years mentioned in a query: "Kenya deaths 1954" → [1954]. */
export function yearsIn(q) {
  const out = [];
  const re = /\b(1[4-9]\d{2}|20[0-3]\d)\b/g;
  let m;
  while ((m = re.exec(q))) out.push(Number(m[1]));
  return out;
}
