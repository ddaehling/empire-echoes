/**
 * core/warrant.js — NO CHECK, NO NUMBER.
 *
 * ============================== WHY THIS EXISTS ============================
 * The historian's round-5 note, in one sentence: the app already enforces "no
 * check, no entry" on its 43 primary texts (panels/dossier/testimony.js) and
 * runtime-warrants its chart figures (viz/content.js), but the NUMBERS A
 * STUDENT MEETS ON THE PATH have neither. Beat 6 prints "£1.72m paid to
 * Barbadian slave-owners for 83,150 people" while the Barbados dossier's
 * evidence works are Beckles and Dunn, supporting "the whole narrative".
 * A figure traced to a whole narrative is not traced.
 *
 * So this module is the one way to print a quantity in this application. It
 * takes the number AND the record that warrants it, and if the warrant is
 * missing or incomplete it prints the number with a visible defect marker in
 * --danger rather than printing it clean. The defect is the point: a figure
 * nobody can check should look like a problem, on the page, to the reader.
 *
 * ============================== THE CONTRACT ==============================
 * A warrant is four things, and all four are required:
 *
 *   author   who produced the figure — a person, a commission, a database
 *   work     the named thing a reader can go to
 *   year     when it was published or last revised
 *   supports THE SPECIFIC CLAIM. Not "the whole narrative". "The 1836 award to
 *            Barbadian slave-owners: £1,721,345 for 83,150 people."
 *
 * and one more that makes it usable rather than decorative:
 *
 *   check    where a reader actually looks. A shelfmark, a URL, a series, a
 *            volume. Same rule as testimony.js. Optional but counted: a
 *            warrant without it is `weak`, and the audit says so.
 *
 * ============================== HOW TO USE IT =============================
 *   import { quantity, warrantOf, CONTRACT } from '../core/warrant.js';
 *
 *   node.append(quantity({
 *     value: '£1.72 million',
 *     label: 'paid to Barbadian slave-owners in 1836',
 *     warrant: t.consequences.slavery.toll.warrant,
 *     of: 'barbados/slavery.toll.money',
 *   }));
 *
 * `quantity()` returns one element and never throws. It is safe to call with a
 * missing warrant — that is the case it exists for.
 *
 * Nothing here imports anything. It is loadable in Node (tools/check-warrants.js
 * reads it through a data: URL to audit the shards with the same code the
 * browser runs) and it touches `document` only inside the render functions.
 *
 * ================================ ADOPTION ================================
 * Published on `window.BEA.warrant` at first use so the path, tours, close and
 * viz teams can adopt it without importing across ownership lines. The dossier
 * adopts it in this wave; the contract is frozen so the others can adopt next.
 */

/* ------------------------------------------------------------------ shape -- */

export const CONTRACT = Object.freeze({
  version: 2,   /* v2 adds `note` (a caveat on the figure) and warrantLine's `echo`. Additive: every v1 warrant is a valid v2 warrant. */
  required: Object.freeze(['author', 'work', 'year', 'supports']),
  recommended: Object.freeze(['check']),
  optional: Object.freeze(['kind', 'locator', 'url', 'note']),
  /* `note` is a caveat ON THE FIGURE, printed in italic under the check line:
     "The attackers' dead were counted to the man; Tipu's were estimated."
     It is where a warrant says what KIND of record this is, which for a
     campaign return or a camp register is half of what the figure means. */
  rule: 'A printed quantity carries the record that warrants it, or it prints a defect. '
    + '`supports` names THE CLAIM THIS FIGURE MAKES, never the record it sits in.',
  classes: Object.freeze({
    ok: 'author, work, year, supports and check are all present',
    weak: 'warranted but with no `check` line — a reader is told who, not where',
    bare: 'no warrant: the figure prints with a defect marker in --danger',
  }),
  api: Object.freeze({
    'readWarrants(w)': '[{ status, warrant }] — a figure may rest on more than one record',
    'quantity({ value, label, warrant, of, tone })': 'HTMLElement — the figure with its warrant or its defect',
    'warrantLine(warrant, { of, echo })': 'HTMLElement — just the check line, for a figure already drawn. '
      + '`echo` is any sentence the caller has ALREADY printed: where it is the same sentence as `supports`, '
      + 'the line prints who counted and where to look and does not repeat the claim.',
    'readWarrant(w)': '{ status: "ok" | "weak" | "bare", warrant, missing[] }',
    'warrantText(w)': 'string — the one-line citation, for a title attribute or a plain-text export',
    'auditWarrants(territories)': '{ total, ok, weak, bare, rows[] } — the same audit the tool runs',
  }),
  where: Object.freeze({
    'toll.warrant': 'deathsLow/High, displaced, enslaved and money on any acquisition, departure or consequence',
    'peak.populationWarrant': 'peak.population',
    'peak.areaWarrant': 'peak.areaKm2',
  }),
});

const REQUIRED = CONTRACT.required;
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/**
 * What kind of warrant is this?
 *   ok    everything a reader needs, including where to look
 *   weak  who and what, but no `check` — printed, and marked as thin
 *   bare  nothing usable. The caller prints a defect.
 */
export function readWarrant(w) {
  /* A figure can rest on two records and often should: the Barbados line is a
     compensation award from the Slave Compensation Commission's registers AND a
     range of people landed from the voyage data, and one citation for both
     would be a lie about one of them. So a warrant may be a list, and the
     status of the list is the status of its best member. */
  if (Array.isArray(w)) {
    const read = w.map(readWarrant);
    return read.find((r) => r.status === 'ok') || read.find((r) => r.status === 'weak')
      || { status: 'bare', warrant: null, missing: (read[0] && read[0].missing) || REQUIRED.slice() };
  }
  if (!w || typeof w !== 'object') return { status: 'bare', warrant: null, missing: REQUIRED.slice() };
  const missing = [];
  for (const k of REQUIRED) {
    if (k === 'year') { if (!Number.isFinite(Number(w.year))) missing.push('year'); continue; }
    if (!str(w[k])) missing.push(k);
  }
  if (missing.length) return { status: 'bare', warrant: null, missing };
  /* "The whole narrative" is the exact failure this module was written for, so
     it is named and refused rather than quietly accepted. */
  const supports = str(w.supports);
  if (/^the whole (narrative|record|entry|story)\.?$/i.test(supports)) {
    return { status: 'bare', warrant: null, missing: ['supports (names the entry, not the figure)'] };
  }
  const warrant = {
    author: str(w.author), work: str(w.work), year: Number(w.year),
    supports, check: str(w.check), kind: str(w.kind),
    locator: str(w.locator), url: str(w.url), note: str(w.note),
  };
  return { status: warrant.check ? 'ok' : 'weak', warrant, missing: warrant.check ? [] : ['check'] };
}

/** Every warrant on a figure, in order, dropping the unusable ones. */
export function readWarrants(w) {
  const list = Array.isArray(w) ? w : (w ? [w] : []);
  return list.map(readWarrant).filter((r) => r.warrant);
}

/** The citation on one line: for a title attribute, an export, or a tool. */
export function warrantText(w) {
  const all = readWarrants(w);
  if (!all.length) return null;
  return all.map(({ warrant: v }) =>
    [v.author + ', ' + v.work + ' (' + v.year + ')', v.locator, v.check].filter(Boolean).join(' — ')
  ).join('  ·  ');
}

/* ------------------------------------------------------------------ paint -- */

function make(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

/**
 * The check line under a figure — or the defect, when there is nothing to
 * check. `of` names the field, so a reader reporting the defect and the agent
 * fixing it are talking about the same thing.
 */
export function warrantLine(w, opts = {}) {
  const all = readWarrants(w);
  if (all.length > 1) {
    const box = make('div', 'wq__ws');
    for (const r of all) box.append(oneLine(r, opts));
    return box;
  }
  const r = all[0] || readWarrant(w);
  return oneLine(r, opts);
}

function oneLine(r, opts) {
  if (!r.warrant) {
    const n = make('p', 'wq__defect');
    n.dataset.defect = 'no-warrant';
    /* The field id goes in an attribute, not in the sentence. A reader needs to
       know the number is unchecked; only the person fixing it needs to know
       which field it is, and they can read it off the element. */
    if (opts.of) n.dataset.of = opts.of;
    n.append(make('span', 'sc wq__k', 'No source for this figure'));
    n.append(document.createTextNode(' '
      + 'this atlas prints the number and cannot yet say who counted it. '
      + 'Treat it as a claim, not a fact.'));
    return n;
  }
  const v = r.warrant;
  const n = make('p', 'wq__w');
  n.dataset.status = r.status;
  n.append(make('span', 'sc wq__k', r.status === 'weak' ? 'Figure from' : 'Check this figure'));
  n.append(document.createTextNode(' '));
  /* An em dash, not a comma, between who and what. Half the authors in this
     dataset are phrases with commas in them — "The English commanders and
     administrators in Ireland, in the surviving accounts" — and a comma after
     that reads as one more item in the list rather than the start of a title. */
  n.append(make('span', 'wq__cite', v.author + ' — ' + v.work + ' (' + v.year + ')'));
  /* DO NOT PRINT THE CLAIM TWICE.
     `supports` names the claim the figure makes, and where a warrant was
     promoted out of the record's own note that IS the note — which the caller
     has usually just printed, one line above. Repeating it verbatim under a
     "Check this figure" label makes the warrant look like padding, which is the
     opposite of what it is for. The caller passes `echo` with whatever it has
     already shown; the field itself is untouched, still checked by
     tools/check-warrants.js, and still in the element's title attribute. */
  const echoed = opts.echo && norm(opts.echo) && norm(v.supports) === norm(opts.echo);
  if (!echoed) n.append(document.createTextNode(' — ' + v.supports));
  if (v.check) {
    const c = make('span', 'wq__where', (echoed ? ' ' : ' ') + v.check);
    n.append(c);
  }
  if (v.note) n.append(make('span', 'wq__note', ' ' + v.note));
  return n;
}

/* Same string, allowing for the ellipsis a clip leaves and for whitespace. */
function norm(s) {
  return String(s || '').replace(/\s+/g, ' ').replace(/[…\.]+$/, '').trim().toLowerCase();
}

/**
 * A quantity, printed with the thing that warrants it.
 * `value` is already formatted by the caller — this module never formats a
 * number, because the app has one formatter (core/format.js) and two would
 * disagree eventually.
 */
export function quantity(spec = {}) {
  const r = readWarrant(spec.warrant);
  const wrap = make('span', 'wq');
  wrap.dataset.warranted = r.warrant ? r.status : 'no';
  const v = make('span', 'wq__v', spec.value == null ? '—' : String(spec.value));
  wrap.append(v);
  if (spec.label) wrap.append(make('span', 'wq__l', spec.label));
  const t = warrantText(spec.warrant);
  if (t) wrap.title = t;
  else wrap.title = 'No source is recorded for this figure' + (spec.of ? ' (' + spec.of + ')' : '') + '.';
  return wrap;
}

/* ------------------------------------------------------------------ audit -- */

/** Every quantity in the dataset and whether it is warranted. Pure; runs in Node. */
export function auditWarrants(territories) {
  const rows = [];
  const add = (of, kind, present, w) => {
    if (!present) return;
    const r = readWarrant(w);
    rows.push({ of, kind, status: r.status, missing: r.missing });
  };
  for (const t of territories || []) {
    const hasFig = (c) => !!c && typeof c === 'object' && (
      Number.isFinite(c.deathsLow) || Number.isFinite(c.deathsHigh)
      || Number.isFinite(c.displacedLow) || Number.isFinite(c.displacedHigh)
      || Number.isFinite(c.enslavedLow) || Number.isFinite(c.enslavedHigh)
      || (typeof c.money === 'string' && /\d/.test(c.money)));
    for (const a of t.acquisitions || []) add(t.id + '/' + a.id + '.cost', 'toll', hasFig(a.cost), a.cost && a.cost.warrant);
    for (const d of t.departures || []) add(t.id + '/' + d.id + '.cost', 'toll', hasFig(d.cost), d.cost && d.cost.warrant);
    const cons = t.consequences || {};
    for (const key of ['violence', 'populationTransfer', 'slavery', 'famine', 'partition']) {
      const c = cons[key] && cons[key].toll;
      add(t.id + '/consequences.' + key + '.toll', 'toll', hasFig(c), c && c.warrant);
    }
    /* ZERO IS NOT AN ESTIMATE.
       Ten records state a peak population of 0 and five an area of 0, and in
       every one of them the zero IS the finding: "Britain governed no Ottoman
       territory and no Ottoman subjects. The zeroes are deliberate: informal
       empire has no area and no population." Nobody counted them because there
       was nothing to count, so there is no counter to name, and demanding a
       citation for the absence of a quantity would put a defect marker on the
       one number in the dataset that cannot be wrong. tools/check-path-numbers.js
       already exempts "£0" on the same reasoning and states it in the same
       words. Both exemptions are narrow — exactly zero, nothing else. */
    const peak = t.peak || {};
    add(t.id + '/peak.population', 'population', Number.isFinite(peak.population) && peak.population !== 0, peak.populationWarrant);
    add(t.id + '/peak.areaKm2', 'area', Number.isFinite(peak.areaKm2) && peak.areaKm2 !== 0, peak.areaWarrant);
  }
  const count = (s) => rows.filter((r) => r.status === s).length;
  return { total: rows.length, ok: count('ok'), weak: count('weak'), bare: count('bare'), rows };
}

/* --------------------------------------------------------------- adoption -- */

/** Publish the contract so other pieces can adopt without importing across
 *  ownership lines. Safe to call more than once; safe outside a browser. */
export function publish() {
  if (typeof window === 'undefined') return;
  window.BEA = window.BEA || {};
  window.BEA.warrant = Object.freeze({
    contract: CONTRACT, quantity, warrantLine, readWarrant, warrantText, auditWarrants,
  });
}
