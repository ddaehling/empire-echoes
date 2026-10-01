/**
 * teacher/figures.js — the runtime walk that produces the Evidence Ledger.
 *
 * ONE FUNCTION, TWO CALLERS. `buildFigures()` is pure: it takes the raw shard
 * payloads exactly as they sit on disk and returns one row per figure in the
 * atlas. The browser feeds it the shards it fetches; `tools/evidence-audit.js`
 * feeds it the same files read from the filesystem. That is why FEATURE_SPEC
 * P20 acceptance test 2 — "the audit tool and the in-app table produce the
 * same rows" — is true by construction rather than by discipline. There is no
 * second extraction anywhere in this piece.
 *
 * NO DOM, NO FETCH, NO NODE APIS in this file. It must import cleanly into a
 * browser module and into a CommonJS tool.
 *
 * WHAT COUNTS AS A FIGURE. Any number a reader can see with their own eyes:
 * an area, a population, a death toll, a displacement, a count of people
 * enslaved. Ranges are one row, not two, because a range is one claim.
 * Monetary claims are carried as rows too, with a null value, because the
 * dataset states them as prose and a prose number is exactly the kind no
 * validator can check — hiding them would make this table flatter than the
 * truth.
 *
 * WHAT A ROW PROMISES. `sources` are the citations that actually stand behind
 * THIS number, and `sourceLevel` says whether they were attached to the figure
 * (`figure`) or are the record's general reading list (`record`). That
 * distinction is the whole point of the table: 256 of the atlas's area figures
 * are backed by a book about the territory, not by a source for the area.
 */

/* core/warrant.js is the app's one contract for "no check, no number". It
   imports nothing and touches the DOM only in its render functions, so this
   file can read a warrant's class without breaking its own no-DOM rule. */
import { readWarrant, warrantText } from '../core/warrant.js';

/* ---------------------------------------------------------------- helpers -- */

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

function yearOf(d) {
  if (!d) return null;
  if (typeof d === 'number') return d;
  if (typeof d === 'string') { const m = /^(-?\d{1,4})/.exec(d); return m ? +m[1] : null; }
  if (typeof d === 'object') {
    if (num(d.year) !== null) return d.year;
    return yearOf(d.value);
  }
  return null;
}

function citations(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean).map(e => ({
    author: str(e.author) || 'unknown',
    work: str(e.work) || 'unknown',
    year: num(e.year),
    kind: str(e.kind) || 'unknown',
    supports: str(e.supports) || null,
  }));
}

/** A source list, and an honest label for where it came from. */
function sourcesFor(own, fallback) {
  const mine = citations(own);
  if (mine.length) return { sources: mine, sourceLevel: 'figure' };
  const theirs = citations(fallback);
  if (theirs.length) return { sources: theirs, sourceLevel: 'record' };
  return { sources: [], sourceLevel: 'none' };
}

/* FNV-1a, 32-bit. Deterministic in every JS engine, which is the only
   property a content version needs. */
export function fingerprint(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return ('0000000' + h.toString(16)).slice(-8);
}

/* ------------------------------------------------------------- the walk --- */

/**
 * @param {Array<{file:string, payload:object}>} shards  raw shard files
 * @returns {Array<Figure>}
 */
export function buildFigures(shards) {
  const rows = [];
  let n = 0;

  const push = (r) => {
    const low = num(r.low), high = num(r.high);
    rows.push({
      id: r.id,
      seq: n++,
      subject: r.subject,
      subjectKind: r.subjectKind,          // 'territory' | 'event'
      subjectId: r.subjectId,
      region: r.region || null,
      figure: r.figure,
      quantity: r.quantity,                // area | population | deaths | displaced | enslaved | money
      unit: r.unit,
      low, high,
      hasRange: low !== null && high !== null && high !== low,
      hasValue: low !== null,
      year: num(r.year),
      supports: r.supports || null,
      note: r.note || null,
      /* WHICH FIGURE IS THIS NOTE ABOUT?  A `cost.note` or a `toll.note` sits on
         a BLOCK, not on a number, and a block routinely holds two figures — a
         death toll and a displacement. Copying the block's note onto each of
         them prints, on the emigration figure, a sentence about how the deaths
         were estimated. That is exactly the defect round two found on the Irish
         famine pair. So each row records the path of the note it inherited, and
         a pass at the end of the walk marks any note shared by more than one
         figure as `block`. Every renderer then labels it as covering the block
         rather than the number it happens to sit beside. */
      noteFrom: r.noteFrom || null,
      noteScope: 'figure',
      gloss: r.gloss || null,
      confidence: r.confidence || 'unstated',
      contested: !!r.contested,
      contestedNote: r.contestedNote || null,
      sources: r.sources,
      sourceLevel: r.sourceLevel,
      /* THE RECORD THAT WARRANTS THE NUMBER — a different thing from the works
         above, and the difference is the whole of the historian's H1 ask. A
         `source` is what the RECORD rests on ("the whole narrative"); a
         WARRANT is what THIS QUANTITY rests on, and core/warrant.js is the one
         contract for it. Rows carry the warrant raw, and its class, so the
         printed key and the printed ledger can say "here is where this number
         comes from" or say honestly that nobody can check it yet. */
      warrant: r.warrant || null,
      warrantStatus: readWarrant(r.warrant || null).status,
      warrantText: r.warrant ? warrantText(r.warrant) : null,
      shard: r.shard,
      path: r.path,
      link: r.link,
    });
  };

  for (const { file, payload } of shards) {
    const shard = 'app/data/territories/' + file;
    const terrs = (payload && payload.territories) || [];
    const evs = (payload && payload.events) || [];

    terrs.forEach((t, ti) => {
      const base = `territories[${ti}]`;
      const conf = str(t.confidence) || 'unstated';
      const contested = !!(t.contested && t.contested.isContested);
      const cnote = t.contested ? str(t.contested.note) : null;
      const common = { subject: t.name || t.id, subjectKind: 'territory', subjectId: t.id,
        region: t.region, confidence: conf, contested, contestedNote: cnote, shard };
      const linkAt = (y) => '#year=' + (y || '') + '&sel=' + t.id;

      /* --- extent and people ------------------------------------------- */
      const peak = t.peak || {};
      if (num(peak.areaKm2) !== null) {
        push({ ...common, ...sourcesFor(null, t.evidence),
          id: t.id + ':peak.areaKm2', figure: 'Peak area',
          quantity: 'area', unit: 'km²', low: peak.areaKm2, high: null,
          year: peak.areaYear,
          supports: 'How much ground this territory covered when it was largest.',
          note: str(peak.areaNote), warrant: peak.areaWarrant || null,
          path: base + '.peak.areaKm2', link: linkAt(peak.areaYear) });
      }
      if (num(peak.population) !== null) {
        push({ ...common, ...sourcesFor(null, t.evidence),
          id: t.id + ':peak.population', figure: 'Peak population',
          quantity: 'population', unit: 'people', low: peak.population, high: null,
          year: peak.populationYear,
          supports: 'How many people lived under this rule when the territory was largest.',
          note: str(peak.populationNote), warrant: peak.populationWarrant || null,
          path: base + '.peak.population', link: linkAt(peak.populationYear) });
      }
      const sb = t.stillBritish;
      if (sb && num(sb.population) !== null) {
        push({ ...common, ...sourcesFor(null, t.evidence),
          id: t.id + ':stillBritish.population', figure: 'Population today',
          quantity: 'population', unit: 'people', low: sb.population, high: null,
          year: sb.populationYear,
          supports: 'How many people live there now, under British sovereignty.',
          note: str(sb.note), warrant: sb.populationWarrant || null,
          path: base + '.stillBritish.population', link: linkAt(sb.populationYear) });
      }

      /* --- the cost of taking ------------------------------------------ */
      (t.acquisitions || []).forEach((a, ai) => {
        const p = `${base}.acquisitions[${ai}]`;
        const y = yearOf(a.date);
        const src = sourcesFor(a.evidence, t.evidence);
        const c = { ...common, ...src, confidence: str(a.confidence) || conf, year: y, link: linkAt(y) };
        const cost = a.cost || {};
        if (num(cost.deathsLow) !== null) push({ ...c,
          id: `${t.id}:acq${ai}.deaths`, figure: 'Killed in the taking',
          quantity: 'deaths', unit: 'people', low: cost.deathsLow, high: cost.deathsHigh,
          supports: str(a.how) || 'How this place came under British control.',
          note: str(cost.note), noteFrom: p + '.cost.note', warrant: cost.warrant || null,
          path: p + '.cost.deathsLow' });
        if (num(cost.displacedLow) !== null) push({ ...c,
          id: `${t.id}:acq${ai}.displaced`, figure: 'Driven out in the taking',
          quantity: 'displaced', unit: 'people', low: cost.displacedLow, high: cost.displacedHigh,
          supports: str(a.how) || 'How this place came under British control.',
          note: str(cost.note), noteFrom: p + '.cost.note', warrant: cost.warrant || null,
          path: p + '.cost.displacedLow' });
        if (str(cost.money)) push({ ...c,
          id: `${t.id}:acq${ai}.money`, figure: 'Money, in prose',
          quantity: 'money', unit: null, low: null, high: null,
          supports: str(a.how) || 'How this place came under British control.',
          note: str(cost.money), warrant: cost.warrant || null, path: p + '.cost.money' });
      });

      /* --- the cost of leaving ------------------------------------------ */
      (t.departures || []).forEach((d, di) => {
        const p = `${base}.departures[${di}]`;
        const y = yearOf(d.date);
        const src = sourcesFor(d.evidence, t.evidence);
        const c = { ...common, ...src, confidence: str(d.confidence) || conf, year: y, link: linkAt(y) };
        const cost = d.cost || {};
        if (num(cost.deathsLow) !== null) push({ ...c,
          id: `${t.id}:dep${di}.deaths`, figure: 'Killed as rule ended',
          quantity: 'deaths', unit: 'people', low: cost.deathsLow, high: cost.deathsHigh,
          supports: str(d.how) || 'How British rule here ended.',
          note: str(cost.note), noteFrom: p + '.cost.note', warrant: cost.warrant || null,
          path: p + '.cost.deathsLow' });
        if (num(cost.displacedLow) !== null) push({ ...c,
          id: `${t.id}:dep${di}.displaced`, figure: 'Driven from home as rule ended',
          quantity: 'displaced', unit: 'people', low: cost.displacedLow, high: cost.displacedHigh,
          supports: str(d.how) || 'How British rule here ended.',
          note: str(cost.note), noteFrom: p + '.cost.note', warrant: cost.warrant || null,
          path: p + '.cost.displacedLow' });
        if (str(cost.money)) push({ ...c,
          id: `${t.id}:dep${di}.money`, figure: 'Money, in prose',
          quantity: 'money', unit: null, low: null, high: null,
          supports: str(d.how) || 'How British rule here ended.',
          note: str(cost.money), warrant: cost.warrant || null, path: p + '.cost.money' });
      });

      /* --- what the rule did -------------------------------------------- */
      const cons = t.consequences || {};
      const tolls = [
        ['violence', cons.violence, 'deaths', 'Killed under British rule'],
        ['slavery', cons.slavery, 'enslaved', 'Held as property'],
        ['slavery', cons.slavery, 'deaths', 'Killed in the slavery system'],
        ['populationTransfer', cons.populationTransfer, 'displaced', 'Moved out of their homes'],
        /* NOT "Killed in the moving". The dataset files four very different
           things in this one block — Acadians drowned in a 1758 deportation,
           deaths on the Canadian removals, and Irish famine excess mortality —
           and one verb cannot be honest about all four. The plain word is
           correct in every case, and the gloss below says what the reader is
           looking at instead of asserting an agent the record may not support. */
        ['populationTransfer', cons.populationTransfer, 'deaths', 'Died'],
      ];
      for (const [key, block, q, label] of tolls) {
        const toll = block && block.toll;
        if (!toll) continue;
        const lo = num(toll[q + 'Low']);
        if (lo === null) continue;
        push({ ...common, ...sourcesFor(null, t.evidence),
          id: `${t.id}:cons.${key}.${q}`, figure: label,
          quantity: q, unit: 'people', low: lo, high: toll[q + 'High'],
          year: null, supports: str(block.note) || label + '.',
          gloss: key === 'populationTransfer' && q === 'deaths'
            ? 'This death toll is filed in the same record as a forced movement of people. '
              + 'The sentence beside it says what the deaths were — a deportation, a clearance, '
              + 'or a famine that emptied the same places.'
            : null,
          note: str(toll.note), noteFrom: `${base}.consequences.${key}.toll.note`,
          warrant: toll.warrant || null,
          path: `${base}.consequences.${key}.toll.${q}Low`, link: '#sel=' + t.id });
      }
      if (cons.slavery && cons.slavery.toll && str(cons.slavery.toll.money)) {
        push({ ...common, ...sourcesFor(null, t.evidence),
          id: `${t.id}:cons.slavery.money`, figure: 'Money, in prose',
          quantity: 'money', unit: null, low: null, high: null, year: null,
          supports: str(cons.slavery.note) || 'Compensation paid when slavery was abolished.',
          note: str(cons.slavery.toll.money), warrant: cons.slavery.toll.warrant || null,
          path: `${base}.consequences.slavery.toll.money`, link: '#sel=' + t.id });
      }
    });

    /* --- events --------------------------------------------------------- */
    evs.forEach((e, ei) => {
      const toll = e.toll;
      if (!toll) return;
      const base = `events[${ei}]`;
      const y = yearOf(e.date);
      const first = (e.links && e.links.territories && e.links.territories[0]) || null;
      const common = {
        subject: e.title || e.id, subjectKind: 'event', subjectId: e.id,
        region: e.region, confidence: str(e.confidence) || 'unstated',
        contested: !!(e.contested && (e.contested.isContested === undefined || e.contested.isContested)),
        contestedNote: e.contested ? str(e.contested.note) : null,
        shard, year: y,
        link: '#year=' + (y || '') + (first ? '&sel=' + first : ''),
        ...sourcesFor(e.evidence, null),
      };
      /* THE LABEL ON A DEATH TOLL. "Killed" names an agent, which the voice
         guide demands — and which a famine or an epidemic toll cannot honestly
         supply, because the figure is not a count of people killed by anyone
         but a reconstruction of how many more died than would have. Round two
         flagged the Irish famine printing 800,000–1,500,000 under the bare word
         KILLED. For those two kinds the plain, technical and correct label is
         the one the estimators themselves use. The kind comes from the dataset,
         never from a list of event ids typed here. */
      const excess = e.kind === 'famine' || e.kind === 'epidemic';
      const each = [
        ['deaths', excess ? 'Excess deaths' : 'Killed'],
        ['displaced', 'Driven from home'],
        ['enslaved', 'Held as property'],
      ];
      for (const [q, label] of each) {
        const lo = num(toll[q + 'Low']);
        if (lo === null) continue;
        push({ ...common, id: `${e.id}:toll.${q}`, figure: label,
          quantity: q, unit: 'people', low: lo, high: toll[q + 'High'],
          supports: str(e.summary), note: str(toll.note),
          noteFrom: `${base}.toll.note`,
          gloss: excess && q === 'deaths'
            ? 'Excess deaths: how many more people died in these years than would have died otherwise, '
              + 'reconstructed from population records. It is not a count of bodies and nobody made one.'
            : null,
          path: `${base}.toll.${q}Low` });
      }
      if (str(toll.money)) push({ ...common, id: `${e.id}:toll.money`,
        figure: 'Money, in prose', quantity: 'money', unit: null,
        low: null, high: null, supports: str(e.summary), note: str(toll.money),
        path: `${base}.toll.money` });
    });
  }

  /* A note inherited from a block that produced more than one figure belongs to
     the block, not to any one number in it. Mark it, once, from the data. */
  const perNote = new Map();
  for (const r of rows) {
    if (!r.noteFrom || !r.note) continue;
    perNote.set(r.noteFrom, (perNote.get(r.noteFrom) || 0) + 1);
  }
  for (const r of rows) {
    if (r.noteFrom && r.note && perNote.get(r.noteFrom) > 1) r.noteScope = 'block';
  }

  return rows;
}

/**
 * How a note should be introduced, given what it is a note about. Every
 * renderer in this piece — the ledger table, the workshop's evidence blocks,
 * the printed pack and tools/evidence-audit.js — asks this one function, so the
 * app cannot say it two different ways.
 */
export function noteLead(row) {
  return row && row.noteScope === 'block'
    ? 'Note on the whole record, covering more than this one figure:'
    : null;
}

/* ------------------------------------------------------------- ordering --- */

const CONF_RANK = { low: 0, medium: 1, high: 2, unstated: -1 };

/** The default the spec demands: weakest first, then contested, then the
 *  numbers with no range, then alphabetically so the order is reproducible. */
export function defaultSort(rows) {
  return rows.slice().sort((a, b) => {
    const ca = CONF_RANK[a.confidence] ?? 3, cb = CONF_RANK[b.confidence] ?? 3;
    if (ca !== cb) return ca - cb;
    if (a.contested !== b.contested) return a.contested ? -1 : 1;
    if (a.hasRange !== b.hasRange) return a.hasRange ? 1 : -1;
    return a.subject.localeCompare(b.subject) || a.figure.localeCompare(b.figure);
  });
}

/* -------------------------------------------------------------- version --- */

/**
 * The content version. It is computed from the dataset, never typed by hand,
 * so a shard edited on a Tuesday changes it. It goes in the ledger header,
 * on every printed page and beside every frozen deep link.
 */
export function contentVersion(shards, manifest, rows) {
  const meta = (manifest && manifest.meta) || {};
  const built = str(meta.built) || 'undated';
  const schema = (manifest && manifest.schemaVersion) || 1;
  /* Order-independent, and independent of anything this piece writes. It is a
     fingerprint of the DATA: the shard names and, for every figure, its id and
     its value. Rename a column header here and the version must not move;
     change a number in a shard and it must. */
  const canon = shards.map(s => s.file).sort().join(',') + '|' +
    rows.map(r => r.id + ':' + r.low + '/' + r.high).sort().join(';');
  return {
    schema, built, fingerprint: fingerprint(canon),
    figures: rows.length,
    shards: shards.length,
    string: `dataset ${schema} · built ${built} · ${rows.length} figures · ${fingerprint(canon)}`,
  };
}

/** Counts a reviewer wants before they read a single row. */
export function ledgerStats(rows) {
  const s = {
    total: rows.length, low: 0, medium: 0, high: 0, unstated: 0,
    contested: 0, noRange: 0, recordLevel: 0, noSource: 0, noNote: 0,
    money: 0, quantities: {},
    /* Warrant classes, in core/warrant.js's own words: `ok` is author, work,
       year, supports AND a check line; `weak` is warranted with nowhere named
       to look; `bare` is a number nobody can check. The printed ledger prints
       these three counts at the top, because a sheet that claims every figure
       is checkable while two thirds are not is worse than one that says so. */
    warrantOk: 0, warrantWeak: 0, warrantBare: 0,
  };
  for (const r of rows) {
    s[r.confidence] = (s[r.confidence] || 0) + 1;
    if (r.contested) s.contested++;
    if (r.hasValue && !r.hasRange) s.noRange++;
    if (r.sourceLevel === 'record') s.recordLevel++;
    if (r.sourceLevel === 'none') s.noSource++;
    if (!r.note) s.noNote++;
    if (r.quantity === 'money') s.money++;
    if (r.warrantStatus === 'ok') s.warrantOk++;
    else if (r.warrantStatus === 'weak') s.warrantWeak++;
    else s.warrantBare++;
    s.quantities[r.quantity] = (s.quantities[r.quantity] || 0) + 1;
  }
  return s;
}

export default { buildFigures, defaultSort, contentVersion, ledgerStats, fingerprint };
