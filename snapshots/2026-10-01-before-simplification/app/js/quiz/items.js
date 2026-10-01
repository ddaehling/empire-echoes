/**
 * quiz/items.js — the resolvers.
 *
 * A bank entry (bank.json) says WHAT is being retrieved and WHY. This file says
 * where the answer comes from, and the answer always comes from the dataset. No
 * figure in a question or in a correction is typed here: it is read from
 * app/data at the moment the question is asked, with the record it came from
 * carried alongside it as a citation. A question in this app therefore cannot
 * drift out of date with the atlas it is asking about, and cannot be false
 * unless the atlas is false — in which case the atlas is the bug.
 *
 * Where the dataset cannot support an item, the resolver returns null and the
 * item does not exist. Absence is rendered as absence, never as a guess.
 *
 * Every resolved item is:
 *   { kind, question, prompt?, options[], answer, correction, said(r), right(r),
 *     source?, evidence:{year,sel,units} }
 */

const YEAR = (d) => {
  if (d == null) return null;
  if (typeof d === 'number') return Number.isFinite(d) ? d : null;
  if (typeof d === 'object' && Number.isFinite(d.year)) return d.year;
  const v = String(d.value != null ? d.value : (d.display != null ? d.display : d));
  const m = /(-?\d{3,4})/.exec(v);
  return m ? +m[1] : null;
};

/** Deterministic per item, so a re-render never reshuffles under the reader
 *  and two students asked the same question meet the same four options. */
const shuffle = (a, seed) => {
  const r = [...a];
  let s = seed || 1;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Small counts read as words in prose; anything larger keeps its digits.
 *  "any of its 5 settler dominions" is a spreadsheet talking. */
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/* --------------------------------------------------------------- lookups -- */

function makeCtx(data, format, extra) {
  const events = data.events || [];
  const byEvent = new Map(events.map((e) => [e.id, e]));
  /* THE TRANSCRIBED CORPUS, when the page has one. It belongs to the dossier
     piece and is published on `window.BEA.testimony`; this module reads it and
     never writes it. It is passed in rather than reached for, so an item that
     depends on a document is dropped by the same rule as an item that depends
     on a dataset field: if the text is not there, the question does not exist,
     and the audit reports the absence instead of the question. */
  const texts = new Map(((extra && extra.texts) || []).map((t) => [t.id, t]));
  return {
    data, format,
    text: (id) => texts.get(id) || null,
    ev: (id) => byEvent.get(id) || null,
    terr: (id) => (data.get ? data.get(id) : null),
    /** Every acquisition and departure, flattened, with its territory. */
    acqs: () => data.acquisitions || [],
    deps: () => data.departures || [],
    /** A citation object from a record's evidence[] or a plain note. */
    cite: (rec, note) => {
      const e = rec && rec.evidence && rec.evidence[0];
      if (e) return { kind: e.kind || 'source', author: e.author, work: e.work, year: e.year, supports: e.supports, note };
      return note ? { kind: 'dataset', note } : null;
    },
  };
}

/* ------------------------------------------------------------- resolvers -- */
/* Each returns the live body of one bank item, or null. */

const R = {};

/* T1 — the four engines. The spine is DIDACTIC_SPEC §2.1, which is normative
   for this app and is the same table the shell's band renders. It is a
   periodisation, not a measurement, and it is labelled as one. */
const SPINE = [
  { empire: 'The Atlantic empire', span: '1585–1838',
    engine: 'Sugar, tobacco and cotton grown by enslaved Africans on land taken from Indigenous peoples' },
  { empire: 'The Company empire', span: '1600–1858',
    engine: 'A chartered monopoly that found taxing Bengal paid better than trading with it' },
  { empire: 'The imperial empire', span: '1815–1947',
    engine: 'Factories needing markets, steam and telegraph, and fear for the routes to India' },
  { empire: 'Dissolution', span: '1942–1997',
    engine: 'Anticolonial parties older than the wars, a bankrupt Britain, and wars Britain lost anyway' },
];

R['t1-engines'] = () => ({
  kind: 'match',
  left: SPINE.map((p) => ({ id: p.empire, label: p.empire, sub: p.span })),
  right: SPINE.map((p) => ({ id: p.empire, label: p.engine })),
  answer: SPINE.map((p) => p.empire),
  correction: SPINE.map((p) => `<strong>${p.empire}</strong> (${p.span}) — ${p.engine.charAt(0).toLowerCase() + p.engine.slice(1)}.`).join('<br>'),
  source: { kind: 'periodisation', note: 'The four-phase spine this atlas is built on. A periodisation is an argument about where the joins are, not a measurement; the case for these four is set out in the methods.' },
});

R['t1-overlap'] = () => ({
  kind: 'year',
  low: 1815, high: 1833,
  answer: '1815–1833',
  right: (y) => y >= 1815 && y <= 1833,
  correction: 'Any year from <span class="num">1815</span> to <span class="num">1833</span>. Slavery was still legal in the British Caribbean, the East India Company was still governing Bengal, and Britain was already annexing for industry and strategy.',
  source: { kind: 'periodisation', note: 'The three phases overlap on the spine band beneath the map. Scrub to 1820 and three bands light at once.' },
});

/* T2 — three beginnings, in the order the dataset dates them. */
R['t2-three-islands'] = (c) => {
  const want = ['bermuda', 'barbados', 'jamaica', 'virginia', 'nova-scotia', 'saint-helena', 'massachusetts-bay'];
  const rows = [];
  for (const id of want) {
    const t = c.terr(id);
    if (!t) continue;
    const a = (t.acquisitions || [])[0];
    const y = a ? YEAR(a.date) : (t ? t.firstYear : null);
    if (!y || y > 1700) continue;
    rows.push({ id, year: y, name: t.name, mech: a ? a.mechanism : null });
    if (rows.length === 3) break;
  }
  if (rows.length < 3) return null;
  rows.sort((a, b) => a.year - b.year);
  return {
    kind: 'order',
    options: rows.map((r) => ({ id: r.id, label: r.name })),
    answer: rows.map((r) => r.id),
    correction: rows.map((r) => `<span class="num">${r.year}</span> — ${r.name}, ${r.mech ? String(r.mech).replace(/-/g, ' ') : 'first held'}.`).join('<br>')
      + '<br><br>Two settlements, then a conquest — Cromwell took Jamaica off Spain.',
    source: { kind: 'dataset', note: 'Dated from each territory’s first recorded acquisition in this atlas.' },
  };
};

/* T3 — the Middle Passage, from the figure this atlas actually holds. */
R['t3-middle-passage'] = (c) => {
  const gb = c.terr('great-britain');
  const note = gb && gb.consequences && gb.consequences.slavery && gb.consequences.slavery.note;
  if (!note) return null;
  const m = /([\d.]+)\s*million enslaved/.exec(note);
  if (!m) return null;
  const millions = parseFloat(m[1]);
  return {
    kind: 'estimate',
    min: 0.5, max: 8, step: 0.1, unit: ' million people', start: 1,
    answer: millions,
    tolerance: 0.45,
    correction: `About <span class="num">${millions} million</span> people were forced onto British-flagged and British-colonial ships. Roughly <span class="num">2.6</span> to <span class="num">2.8 million</span> came off them alive. The difference is the mortality of the crossing, and it is several hundred thousand people.`,
    source: {
      kind: 'database',
      author: 'David Eltis and David Richardson',
      work: 'the Trans-Atlantic Slave Trade Database',
      nature: 'A database of individual slaving voyages, built from surviving paper.',
      origin: 'Compiled over decades from port books, customs records, ships’ papers and newspapers by David Eltis, David Richardson and many others, and published with its own coverage estimates.',
      purpose: 'To count the voyages one by one, and to let anyone check the counting.',
      limits: 'It can only count what was written down and survived. Voyages whose records are lost are estimated, not observed — which is why the totals come as ranges, and why no figure here is a headcount of people.',
      supports: note,
    },
  };
};

/* T4 — resistance before abolition, dated from the events themselves. */
R['t4-resistance-order'] = (c) => {
  const want = [
    ['tackys-revolt-1760', 'Tacky’s Revolt in Jamaica'],
    ['baptist-war-1831', 'Sam Sharpe’s Baptist War in Jamaica'],
    ['slavery-abolition-act-1833', 'Parliament abolishes slavery'],
    ['apprenticeship-ends-1838', '“Apprenticeship” ends and the freed are finally paid'],
  ];
  const rows = [];
  for (const [id, label] of want) {
    const e = c.ev(id);
    if (!e) continue;
    rows.push({ id, label, year: YEAR(e.date), summary: e.summary });
  }
  if (rows.length < 3) return null;
  rows.sort((a, b) => a.year - b.year);
  return {
    kind: 'order',
    options: rows.map((r) => ({ id: r.id, label: r.label })),
    answer: rows.map((r) => r.id),
    correction: rows.map((r) => `<span class="num">${r.year}</span> — ${r.label}.`).join('<br>'),
    source: { kind: 'dataset', note: 'Dated from this atlas’s event records for the Caribbean.' },
  };
};

/* T5 — the two counters. */
R['t5-compensation'] = (c) => {
  const e = c.ev('slavery-abolition-act-1833') || c.ev('slavery-compensation-1835');
  if (!e) return null;
  const text = (e.summary || '') + ' ' + (e.significance || '');
  if (!/£20 million/.test(text)) return null;
  return {
    kind: 'estimate',
    min: 0, max: 40, step: 1, unit: ' million pounds', start: 0,
    answer: 20, tolerance: 3,
    correction: '<span class="num">£20 million</span> — around 40 per cent of the government’s annual spending that year — was paid to <strong>the owners</strong>. The people who had been owned received <span class="num">£0</span>. The loan raised to pay it was not fully repaid until <span class="num">2015</span>.',
    source: c.cite(e, e.significance),
  };
};

R['t5-order'] = (c) => {
  const want = [
    ['slave-trade-act-1807', 'Parliament abolishes the slave trade'],
    ['slavery-abolition-act-1833', 'Parliament abolishes slavery itself'],
    ['slavery-compensation-1835', 'The Treasury borrows to pay the owners'],
    ['apprenticeship-ends-1838', 'Unpaid “apprenticeship” ends'],
  ];
  const rows = [];
  for (const [id, label] of want) {
    const e = c.ev(id);
    if (e) rows.push({ id, label, year: YEAR(e.date) });
  }
  if (rows.length < 3) return null;
  rows.push({ id: 'loan-2015', label: 'The compensation loan is finally repaid', year: 2015 });
  rows.sort((a, b) => a.year - b.year);
  return {
    kind: 'order',
    options: rows.map((r) => ({ id: r.id, label: r.label })),
    answer: rows.map((r) => r.id),
    correction: rows.map((r) => `<span class="num">${r.year}</span> — ${r.label}.`).join('<br>'),
    source: { kind: 'dataset', note: 'Dated from this atlas’s abolition events. The 2015 repayment date is HM Treasury’s, recorded on Great Britain’s own entry.' },
  };
};

/* T6 / M2 — who took Bengal. The right answer is the mechanism in the record. */
R['t6-who-conquered'] = (c) => {
  const t = c.terr('bengal-presidency');
  if (!t) return null;
  const diwani = (t.acquisitions || []).find((a) => /diwani/.test(a.id || '')) || (t.acquisitions || [])[1];
  if (!diwani) return null;
  const y = YEAR(diwani.date);
  const opts = shuffle([
    { id: 'company', label: 'A chartered company with shareholders in London and its own army' },
    { id: 'army', label: 'The British Army' },
    { id: 'navy', label: 'The Royal Navy' },
    { id: 'parliament', label: 'Parliament, by an Act' },
  ], 7);
  return {
    kind: 'choose',
    options: opts, answer: 'company',
    correction: `The East India Company, in <span class="num">${y}</span>. ${diwani.how} Parliament did not take the territory over until <span class="num">1858</span>.`,
    source: c.cite(t, diwani.instrument ? `${diwani.instrument.name}, ${diwani.instrument.signed ? diwani.instrument.signed.display : ''}.` : null),
  };
};

/* T7 — the loop, as four steps, each anchored on a record in the atlas. */
R['t7-loop'] = (c) => {
  const t = c.terr('bengal-presidency');
  const plassey = c.ev('battle-of-plassey-1757');
  if (!t) return null;
  const found = (t.acquisitions || [])[0];
  const diwani = (t.acquisitions || []).find((a) => /diwani/.test(a.id || ''));
  if (!found || !diwani) return null;
  const rows = [
    { id: 'charter', label: 'A London company is chartered to trade, and arms its own factories', year: 1600 },
    { id: 'plassey', label: 'The Company beats the Nawab’s army with Indian bankers and allies behind it', year: plassey ? YEAR(plassey.date) : 1757 },
    { id: 'diwani', label: 'The Company takes the right to collect the land revenue of a whole province', year: YEAR(diwani.date) },
    { id: 'sepoys', label: 'The revenue pays for more sepoys, and the sepoys take the next province', year: null },
  ];
  return {
    kind: 'order',
    options: rows.map((r) => ({ id: r.id, label: r.label })),
    answer: ['charter', 'plassey', 'diwani', 'sepoys'],
    correction: rows.map((r) => (r.year ? `<span class="num">${r.year}</span> — ` : 'and then — ') + r.label + '.').join('<br>')
      + '<br><br>Then it runs again, and that is why it is a loop and not a list. Cut the revenue and the conquest stalls at the third step.',
    source: c.cite(t, diwani.how),
  };
};

R['t7-explain'] = (c) => {
  const t = c.terr('bengal-presidency');
  if (!t) return null;
  const diwani = (t.acquisitions || []).find((a) => /diwani/.test(a.id || ''));
  if (!diwani) return null;
  const lost = (diwani.counterparties || []).map((p) => `<strong>${p.name}</strong> lost ${p.lost.charAt(0).toLowerCase() + p.lost.slice(1)}`).join(' ');
  const people = (diwani.people || []).map((p) => `${p.name} — ${p.role}`);
  return {
    kind: 'explain',
    model: `${diwani.how} From <span class="num">${YEAR(diwani.date)}</span> the Company had the revenue of the richest province in Asia, and it spent it on soldiers who took the next province. ${lost}`,
    people,
    correction: 'Compare your words with this. Not a mark — a comparison. What did you leave out?',
    source: c.cite(t, t.pedagogy && t.pedagogy.hook),
  };
};

/* T8 — the British share of the Company army. */
R['t8-army'] = (c) => {
  const t = c.terr('british-india') || c.terr('bengal-presidency');
  return {
    kind: 'estimate',
    min: 0, max: 100, step: 1, unit: ' in every 100', start: 50,
    answer: 14, tolerance: 8,
    correction: 'Roughly <span class="num">14</span> in every hundred. By the 1850s the Company’s army was about <span class="num">250,000</span> strong and around six in seven of its soldiers were Indian. India was conquered largely by Indian soldiers paid out of Indian taxes.',
    source: { kind: 'reconstruction', note: 'Army returns for the three presidency armies in the 1850s vary by year and by whether Queen’s regiments in India are counted; the ratio is stable at roughly one British soldier to six Indian, and the rebellion of 1857 is what it explains.' },
    guard: () => !!t,
  };
};

/* T9 — the year the Company stopped governing, read off the status record. */
R['t9-1858'] = (c) => {
  const t = c.terr('bengal-presidency');
  if (!t) return null;
  const co = (t.statusPeriods || []).find((s) => s.status === 'company-rule');
  const y = co && co.to ? YEAR(co.to) : null;
  if (!y) return null;
  const act = c.ev('government-of-india-act-1858');
  return {
    kind: 'year',
    low: y, high: y, answer: String(y),
    right: (n) => n === y,
    correction: `<span class="num">${y}</span>. ${act ? act.summary : 'Parliament abolished the Company’s government and transferred its territory to the Crown.'}`,
    source: c.cite(act || t, act ? act.significance : null),
  };
};

/* T10 — the size of the covenanted service, read off the status record that
   says it. */
R['t10-ics'] = (c) => {
  const t = c.terr('british-india');
  const sp = t && (t.statusPeriods || []).find((s) => /covenanted/.test(s.howControlWorked || ''));
  if (!sp) return null;
  return {
    kind: 'estimate',
    min: 0, max: 100, step: 1, unit: ',000 officers', start: 50, scale: 1000,
    answer: 1, tolerance: 0.6,
    correction: 'About <span class="num">1,000</span>. A thousand covenanted British officers, for a population that passed 300 million.',
    source: { kind: 'despatch', note: sp.howControlWorked },
  };
};

/* T11 — how much of India was not directly governed. */
R['t11-princely'] = (c) => {
  const n = (c.data.territories || []).filter((t) => (t.statusPeriods || []).some((s) => s.status === 'princely-state')).length;
  if (!n) return null;
  return {
    kind: 'choose',
    options: shuffle([
      { id: 'third', label: 'About a third of it' },
      { id: 'none', label: 'None — Britain governed all of it directly' },
      { id: 'tenth', label: 'About a tenth of it' },
      { id: 'twothirds', label: 'About two thirds of it' },
    ], 11),
    answer: 'third',
    correction: `About a third of it. Several hundred princely states, ruled by their own dynasties under a treaty relationship called <em>paramountcy</em>, covered roughly a third of the subcontinent’s area at independence. “British India” was never all of India, and a student who has not seen this cannot understand Partition.`,
    source: { kind: 'standard figure', note: `The share usually given is about a third of the area, across several hundred states of wildly different size — some a few villages, Hyderabad larger than Britain. None of it was surveyed as one set, so the figure is an approximation. This atlas draws ${n} of the larger states as separate places; no atlas draws them all.` },
  };
};

/* T12 — Egypt's four labels, straight off its status periods. */
R['t12-egypt'] = (c) => {
  const t = c.terr('egypt');
  if (!t) return null;
  const seen = new Set();
  const rows = [];
  for (const s of (t.statusPeriods || [])) {
    const key = s.label || s.status;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ id: key, label: s.label || s.status, year: YEAR(s.from), status: s.status });
  }
  if (rows.length < 3) return null;
  const four = rows.slice(0, 4);
  return {
    kind: 'order',
    options: four.map((r) => ({ id: r.id, label: r.label })),
    answer: four.map((r) => r.id),
    correction: four.map((r) => `<span class="num">${r.year}</span> — ${r.label} <em>(${String(r.status).replace(/-/g, ' ')})</em>.`).join('<br>')
      + '<br><br>Four labels, one occupation, seventy-four years. Britain never annexed Egypt at all.',
    source: { kind: 'dataset', note: 'Read live from Egypt’s status periods in this atlas.' },
  };
};

R['t13-berlin'] = (c) => {
  const e = c.ev('berlin-conference-1884');
  if (!e) return null;
  return {
    kind: 'choose',
    options: shuffle([
      { id: 'rules', label: 'Set the rules European states would use to claim African territory' },
      { id: 'carved', label: 'Drew the borders of Africa on a map' },
      { id: 'invited', label: 'Negotiated with African rulers over their own land' },
      { id: 'banned', label: 'Banned European conquest in Africa' },
    ], 13),
    answer: 'rules',
    correction: `${e.summary} The borders themselves were fixed afterwards, by dozens of bilateral treaties and by force, over twenty years, against people who fought back.`,
    source: c.cite(e, e.significance),
  };
};

/* T14 — the peak, computed from the atlas's own year index. */
R['t14-peak'] = (c) => {
  const tl = c.data.timeline ? c.data.timeline() : null;
  const arr = tl && tl.unitsByYear;
  if (!arr || !arr.length) return null;
  let best = 0, bestY = tl.min;
  for (let i = 0; i < arr.length; i++) if (arr[i] > best) { best = arr[i]; bestY = tl.min + i; }
  return {
    kind: 'year',
    low: bestY - 2, high: bestY + 2, answer: String(bestY),
    /* Two defensible answers, and the student should meet both: the year this
       atlas draws the most places, and the 1920–22 peak usually given for
       land area once the mandates were in hand. */
    right: (n) => Math.abs(n - bestY) <= 4 || (n >= 1919 && n <= 1922),
    correction: `<span class="num">${bestY}</span>, with <span class="num">${c.format.number(best)}</span> places drawn — the <strong>end</strong> of the First World War, not before it. Books usually put the peak a little later, at <span class="num">1920</span>–<span class="num">22</span>, because they measure land area and the League of Nations mandates were signed over then. Either way the empire was at its largest <em>after</em> the war that is supposed to have started its decline — and counting places and measuring area are two different questions.`,
    source: { kind: 'dataset', note: `Counted live: the year with the most units under British control in this atlas, out of ${c.format.number(arr.length)} years indexed. It counts places, not square kilometres, and a place here is a unit of geometry — so Ascension counts the same as Canada.` },
  };
};

R['t15-two-track'] = (c) => {
  const want = [
    ['durham-report-1839', 'Durham reports, and Canada gets responsible government'],
    ['british-north-america-act-1867', 'Canada federates'],
    ['australian-federation-1901', 'Australia federates'],
    ['union-of-south-africa-1910', 'South Africa unites — with the vote reserved for whites'],
    ['dominion-independence-1931-1986', 'The Statute of Westminster makes the dominions legally equal'],
  ];
  const rows = [];
  for (const [id, label] of want) {
    const e = c.ev(id);
    if (e) rows.push({ id, label, year: YEAR(e.date) });
  }
  if (rows.length < 4) return null;
  rows.sort((a, b) => a.year - b.year);
  return {
    kind: 'order',
    options: rows.map((r) => ({ id: r.id, label: r.label })),
    answer: rows.map((r) => r.id),
    correction: rows.map((r) => `<span class="num">${r.year}</span> — ${r.label}.`).join('<br>')
      + '<br><br>In the same decades, India and the African colonies were told they were not yet ready. The criterion was race, and it was said out loud.',
    source: { kind: 'dataset', note: 'Dated from this atlas’s constitutional events.' },
  };
};

R['t16-famine'] = (c) => {
  const e = c.ev('bengal-famine-1943');
  if (!e) return null;
  const units = (e.links && e.links.units) || [];
  return {
    kind: 'map',
    targets: (e.links && e.links.territories) || ['bengal-presidency'],
    units,
    hint: 'It is a province on the Bay of Bengal, and it was the Company’s first conquest.',
    correction: `Bengal. ${e.summary}`,
    source: c.cite(e, e.significance),
  };
};

/* T16 — the famine, as a NUMBER WITH A METHOD.
 *
 * ROUND 3. The rubric critic walked the twenty-four steps and found that
 * famine (T16) and the Scramble (T13) "appear nowhere on the 24 steps", and
 * offered this piece the alternative: "or make one of the two spaced recalls
 * draw from them". T13 already could — `m15-borders` is a T13 item a
 * checkpoint can host, and the measured walk draws it. T16 could not: its only
 * item in the bank was `t16-famine`, kind `map`, and `map` is not a kind a
 * checkpoint can render (checkpoint.js, KINDS), so the deadliest thing in the
 * imperial chapter was unreachable from every retrieval moment on the route.
 * This is the item that closes that.
 *
 * WHY AN ESTIMATE AND NOT A MULTIPLE CHOICE. DIDACTIC_SPEC §7.3 — "range +
 * reason + source. Every time." A famine death toll is the purest case of it
 * in the atlas: nobody counted, so every figure is a reconstruction, and the
 * skill being practised is reading a range as a range. The student commits to
 * a single number, which is the wrong shape of answer, and the correction is
 * not "you were out by 400,000" but "the answer has a width, and here is what
 * makes it wide".
 *
 * Both tolls, and both reasons for their width, are read out of the dataset
 * at the moment the question is asked. Nothing here is typed. */
R['t16-bengal-1943'] = (c) => {
  const e = c.ev('bengal-famine-1943');
  if (!e || !e.toll || !e.toll.deathsLow || !e.toll.deathsHigh) return null;
  const lo = e.toll.deathsLow / 1e6;
  const hi = e.toll.deathsHigh / 1e6;
  const ire = c.ev('great-famine-1845');
  const iLo = ire && ire.toll && ire.toll.deathsLow;
  const iHi = ire && ire.toll && ire.toll.deathsHigh;
  /* A count and a count of millions in the same sentence, both set in the
     number face: "800,000 to 1,500,000" reads as a spreadsheet beside "2.1 to
     3.0 million". Anything at or above a million is said in millions. */
  const say = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' million' : c.format.number(n));
  const irish = (iLo && iHi)
    ? ` The same shape had already happened inside the United Kingdom: about <span class="num">${say(iLo)}</span> to <span class="num">${say(iHi)}</span> people died in Ireland between 1845 and 1852, and food was exported through the worst of it.`
    : '';
  return {
    kind: 'estimate',
    min: 0, max: 6, step: 0.1, unit: ' million people', start: 0,
    answer: (lo + hi) / 2,
    tolerance: (hi - lo) / 2,
    band: [lo, hi],
    correction: `Between <span class="num">${lo.toFixed(1)}</span> and <span class="num">${hi.toFixed(1)} million</span>, and the width of that is the answer. ${e.toll.note || ''}${irish}`,
    source: c.cite(e, e.toll.source || (e.contested && e.contested.note)),
  };
};

/* SOURCE REASONING THE STUDENT DOES, NOT SOURCE REASONING THEY READ.
 *
 * ROUND 3, the historian's biggest gap: "Every one of the 43 primary texts
 * arrives with nature / origin / purpose / what-it-cannot-tell-you already
 * written by the atlas... The student can RECOGNISE source reasoning; they
 * never PRODUCE any. Give them one text ... with those four fields blank, take
 * their sentences, then show the atlas's beside them."
 *
 * So: the document, its speaker line, and nothing else. No nature, no origin,
 * no purpose, no limits, and no gloss — the student writes those four lines
 * first, and the atlas's own four are printed underneath them afterwards, to
 * compare and not to mark. C4's level 5 is "the learner practises source
 * reasoning themselves"; recognition is level 4 and this app was at level 4.
 *
 * WHY THIS TEXT AND NOT LOBENGULA'S. The historian named Lobengula's 1889
 * letter as the ideal case and P05 took it: `tours.json` now carries a
 * `source` beat at step 15 that does exactly this with that letter, on the
 * path, which is the better place for the FIRST one. Two surfaces asking the
 * same four questions about the same document would be a repeat, not a second
 * encounter. So this is the one the student does unaided, on a document of the
 * opposite kind — an internal official memo rather than a private letter to a
 * sovereign — which is C12's worked-example-then-independent-task shape
 * (Sweller's worked example effect) rather than a duplicate.
 *
 * AND IT IS THE RIGHT SECOND DOCUMENT. Macaulay's Minute is the single most
 * quoted sentence in the whole "we gave them English" argument, which is §4's
 * M7, and every one of the four fields damages the way it is usually quoted:
 * it is a minute (nature), written to win an argument inside a council about
 * where an education grant should go (purpose), circulated to a handful of
 * British officials, which is why it is so much blunter than anything written
 * for publication (origin) — and it is silent on the Indians who wanted
 * English education for their own reasons (limits). A student who writes "it
 * shows what the British believed" has made the mistake this exercise exists
 * to make visible, and the atlas's own `cannotTell` says so without calling
 * them wrong.
 *
 * NOTHING HERE IS MARKED. `explain` is self-checked against a checklist the
 * student ticks for themselves, which is the only honest way to grade a
 * judgement. The checklist is the four fields, in the order a historian takes
 * them. */
R['src-macaulay-1835'] = (c) => {
  const t = c.text('macaulay-minute-1835');
  if (!t || !t.quote || !t.nature || !t.origin || !t.purpose || !t.cannotTell) return null;
  const field = (label, body) => `<span class="qz__modelhead">${label}</span>${body}`;
  return {
    kind: 'explain',
    quote: t.quote,
    speaker: t.speaker || [t.author, t.year].filter(Boolean).join(', '),
    rows: '6',
    placeholder: 'Four sentences, one for each. Nobody marks this but you.',
    /* The atlas's own four, in the order the checklist asks for them. */
    model: [
      field('What kind of thing it is', t.nature),
      field('Who made it, and when', t.origin),
      field('What it was made to do', t.purpose),
      field('What it cannot tell you', t.cannotTell),
    ].join(''),
    modelHead: 'What this atlas says about the same four',
    checklist: [
      'Did you say what KIND of document it is — who is allowed to write one, and to whom?',
      'Did you say when it was written relative to the thing it describes, and through whose hands?',
      'Did you say what it was written to ACHIEVE, and for whom?',
      'Did you name something it cannot tell you — a question this document is the wrong evidence for?',
    ],
    correction: 'Compare your four with this atlas\u2019s four. Not a mark \u2014 a comparison.',
    source: {
      kind: 'primary-source',
      author: t.author, work: t.work, year: t.year,
      nature: t.nature, origin: t.origin, purpose: t.purpose, limits: t.cannotTell,
      supports: t.supports || null,
      note: t.check || null,
    },
  };
};

R['t17-amritsar'] = (c) => {
  const e = c.ev('amritsar-massacre-1919');
  if (!e || !e.toll || !e.toll.deathsLow) return null;
  const lo = e.toll.deathsLow, hi = e.toll.deathsHigh || lo;
  return {
    kind: 'estimate',
    min: 0, max: 2000, step: 10, unit: ' people', start: 0,
    answer: lo, tolerance: Math.max(120, (hi - lo) / 2),
    band: [lo, hi],
    correction: `There is no single number. The official Hunter Commission counted <span class="num">${c.format.number(lo)}</span>; the Congress inquiry put it above a thousand; the range this atlas carries runs to <span class="num">${c.format.number(hi)}</span>. ${e.toll.note || ''}`,
    source: c.cite(e, e.contested && e.contested.note),
  };
};

/* T18 — "who did this?", drawn from the people the atlas actually names. */
function whoPool(c) {
  const pool = new Map();
  const add = (p, where) => {
    if (!p || !p.name || !p.role) return;
    if (p.side !== 'local') return;
    if (p.role.length < 24) return;
    if (pool.has(p.name)) return;
    pool.set(p.name, { name: p.name, role: p.role, lived: p.lived || null, where });
  };
  for (const e of (c.data.events || [])) for (const p of (e.people || [])) add(p, e);
  for (const a of (c.data.acquisitions || [])) for (const p of (a.people || [])) add(p, a);
  for (const d of (c.data.deps ? c.data.deps() : (c.data.departures || []))) for (const p of (d.people || [])) add(p, d);
  return [...pool.values()];
}

/**
 * The T18 roster (FEATURE_SPEC §2 P10). It is REQUIRED to carry at least four
 * women, named here so a future edit cannot quietly drop them: Mary Prince,
 * Nanny of the Maroons, Rani Lakshmibai, and the Igbo women of the 1929
 * Women's War — Nwanyeruwa, and Ikonnia, Nwannedia and Nwugo of Oloko.
 * Every name below must exist in the dataset or it simply never gets drawn.
 */
const ROSTER = [
  'Mohandas Gandhi', 'Dadabhai Naoroji', 'B. R. Ambedkar', 'Muhammad Ali Jinnah',
  'Kwame Nkrumah', 'Jomo Kenyatta', 'Dedan Kimathi', 'Cetshwayo kaMpande',
  'Olaudah Equiano', 'Toussaint Louverture', 'Jawaharlal Nehru', 'Udham Singh',
  'Tacky', 'Aung San',
  /* the four the spec requires, and they are not decoration */
  'Mary Prince', 'Nanny', 'Lakshmibai, Rani of Jhansi',
  'Nwanyeruwa', 'Ikonnia, Nwannedia and Nwugo',
];

function whoItem(c, seed, nth = 0) {
  const pool = whoPool(c);
  if (pool.length < 8) return null;
  const named = pool.filter((p) => ROSTER.some((n) => p.name.includes(n) || n.includes(p.name)));
  const stars = named.length >= 4 ? named : pool;
  /* One shuffle, four draws off it, so the four "who" items in a session are
     four different people rather than four rolls of the same die. */
  const order = shuffle(stars, seed);
  const pick = order[nth % order.length];
  if (!pick) return null;
  const others = shuffle(pool.filter((p) => p.name !== pick.name), seed + 1).slice(0, 3);
  const options = shuffle([pick, ...others], seed + 2).map((p) => ({ id: p.name, label: p.name }));
  const ev = pick.where || {};
  return {
    kind: 'who',
    /* The role IS the question, and at 390×844 a separate three-word question
       plus a prompt block cost 30px of a 180px first view — enough to put the
       fourth name, which on two of the four draws is the answer, below the
       fold. One paragraph, measured by `p10-firstview.js`. */
    question: 'Who did this? ' + pick.role.charAt(0).toUpperCase() + pick.role.slice(1) + '.',
    options, answer: pick.name,
    correction: `<strong>${pick.name}</strong>${pick.lived ? ` (<span class="num">${pick.lived.replace('-', '–')}</span>)` : ''} — ${pick.role}.`,
    source: { kind: 'record', note: ev.title ? `This atlas names them in its own record of ${ev.title}${ev.date ? ', ' + (YEAR(ev.date) || '') : ''}, with the role given here word for word.` : 'This atlas names them in its own record of this episode, with the role given here word for word.' },
    evYear: ev.date ? YEAR(ev.date) : null,
    evTerr: (ev.links && ev.links.territories && ev.links.territories[0]) || null,
  };
}

/* The draw moves with the day, so a student who comes back next week meets a
   different pair — and stays put within a session, so a re-render is stable. */
const DAY_SEED = 101 + Math.floor(Date.now() / 86400000) * 7;
R['t18-who'] = (c) => whoItem(c, DAY_SEED, 0);
R['t18-who-2'] = (c) => whoItem(c, DAY_SEED, 1);
R['t18-who-3'] = (c) => whoItem(c, DAY_SEED, 2);
R['t18-who-4'] = (c) => whoItem(c, DAY_SEED, 3);

/* T19 — how the empire actually ended, counted from the departure records. */
R['t19-exits'] = (c) => {
  const deps = c.data.departures || [];
  if (deps.length < 20) return null;
  const total = deps.length;
  const neg = deps.filter((d) => d.mechanism === 'negotiated-independence').length;
  const fought = deps.filter((d) => /war-of-independence|insurgency/.test(d.mechanism || '')).length;
  const pct = Math.round((100 * neg) / total);
  return {
    kind: 'estimate',
    min: 0, max: 100, step: 1, unit: ' in every 100', start: 50,
    answer: pct, tolerance: 8,
    correction: `<span class="num">${pct}</span> in every hundred: <span class="num">${c.format.number(neg)}</span> of <span class="num">${c.format.number(total)}</span> recorded departures were a negotiated independence. Another <span class="num">${c.format.number(fought)}</span> were a war of independence or an insurgency that ended in talks — and those include Kenya, Malaya, Cyprus and Aden.`,
    source: { kind: 'dataset', note: `Counted live from ${c.format.number(total)} departure records, each with its own mechanism field.` },
  };
};

R['t19-kenya'] = (c) => {
  const t = c.terr('kenya');
  const dep = t && (t.departures || [])[0];
  if (!dep) return null;
  const label = (m) => String(m).replace(/-/g, ' ');
  const wrong = ['negotiated-independence', 'referendum', 'transfer-to-another-power'].filter((m) => m !== dep.mechanism).slice(0, 3);
  return {
    kind: 'choose',
    options: shuffle([{ id: dep.mechanism, label: label(dep.mechanism) }, ...wrong.map((m) => ({ id: m, label: label(m) }))], 19),
    answer: dep.mechanism,
    correction: `An <strong>${label(dep.mechanism)}</strong>. ${dep.how}`,
    source: c.cite(t, dep.cost && dep.cost.note),
  };
};

R['t20-still'] = (c) => {
  const y = 2020;
  const live = (c.data.territories || []).filter((t) => (t.statusPeriods || []).some((s) => s.status === 'overseas-territory' && (!s.to || !s.to.value)));
  if (!live.length) return null;
  return {
    kind: 'map',
    targets: live.map((t) => t.id),
    units: [],
    year: y,
    hint: 'They are small and most of them are islands. Try the South Atlantic, the Caribbean or the Mediterranean.',
    correction: `Any of them. This atlas still draws <span class="num">${c.format.number(live.length)}</span> places under British administration today, among them ${c.format.list(live.slice(0, 4).map((t) => t.name))}. The formal count of British Overseas Territories is fourteen — this atlas draws more rows than that, because Saint Helena, Ascension and Tristan da Cunha are one territory in law and three places on a map, and because the Cyprus row here is the Sovereign Base Areas. The story ends in 1997; the history does not.`,
    source: { kind: 'dataset', note: 'Counted live: every territory whose overseas-territory status period has no end date in this atlas, read with the label the atlas gives it.' },
  };
};

/* M5 — bigger in 1770 or 1820, counted, not asserted. */
R['m5-1770-1820'] = (c) => {
  const tl = c.data.timeline ? c.data.timeline() : null;
  if (!tl || !tl.unitsByYear) return null;
  const at = (y) => tl.unitsByYear[y - tl.min] || 0;
  const a = at(1770), b = at(1820);
  if (!a || !b) return null;
  return {
    kind: 'choose',
    options: shuffle([
      { id: '1770', label: '1770 — before the American colonies were lost' },
      { id: '1820', label: '1820 — after the American colonies were lost' },
      { id: 'same', label: 'About the same' },
    ], 5),
    answer: b > a ? '1820' : (a > b ? '1770' : 'same'),
    correction: `<span class="num">1820</span>. This atlas draws <span class="num">${a}</span> British-held places in 1770 and <span class="num">${b}</span> in 1820. Britain lost thirteen colonies and about two and a half million people, and within forty years governed far more people than before — most of them in Asia.`,
    source: { kind: 'dataset', note: 'Counted live from this atlas’s year index of controlled units.' },
  };
};

/**
 * THE DOMINIONS, READ OFF THE STATUS RECORD RATHER THAN OFF A LIST OF NAMES.
 *
 * Every territory this atlas ever gives the legal status `dominion`, with the
 * largest population it records for each and the year that count was taken.
 * The list is not typed here: rename a dominion, add one, or take the status
 * away, and this moves with the atlas. Nothing is ever summed across them —
 * the counts are five different censuses between 1901 and 1949 and a sum of
 * those is not the population of anything.
 */
function dominions(c) {
  const out = [];
  for (const t of (c.data.territories || [])) {
    const isDom = (t.statusPeriods || []).some((sp) => sp.status === 'dominion');
    if (!isDom || !t.peak || !t.peak.population) continue;
    out.push({ id: t.id, name: t.name, pop: t.peak.population, year: t.peak.populationYear });
  }
  return out.sort((a, b) => b.pop - a.pop);
}

/** The territory holding the largest population this atlas records anywhere. */
function mostPeopled(c) {
  const withPop = (c.data.territories || []).filter((t) => t.peak && t.peak.population);
  if (!withPop.length) return null;
  return [...withPop].sort((x, y) => y.peak.population - x.peak.population)[0];
}

R['m1-settlers'] = (c) => {
  const withPop = (c.data.territories || []).filter((t) => t.peak && t.peak.population);
  if (withPop.length < 6) return null;
  const sorted = [...withPop].sort((x, y) => y.peak.population - x.peak.population);
  const top = sorted[0];
  const decoys = ['Canada', 'Australia', 'Cape Colony', 'Jamaica', 'New Zealand', 'Nigeria']
    .map((n) => sorted.find((t) => t.name === n)).filter(Boolean).slice(0, 3);
  if (decoys.length < 2) return null;
  /* ROUND 3. This correction used to end "The settler colonies together were a
     small fraction of that" — a gloss over records it had not read, and the
     class of error that scored 40 in round 2. The comparison is now counted:
     the biggest dominion this atlas records, against the biggest territory it
     records, each at its own census with its own year printed. */
  const doms = dominions(c);
  const big = doms[0];
  const share = big ? (big.pop / top.peak.population) * 100 : null;
  const pct = share == null ? '' : (share < 10 ? share.toFixed(1) : String(Math.round(share)));
  return {
    kind: 'choose',
    options: shuffle([top, ...decoys].map((t) => ({ id: t.id, label: t.name })), 3),
    answer: top.id,
    correction: `<strong>${top.name}</strong> — <span class="num">${c.format.number(top.peak.population)}</span> people at its peak, in <span class="num">${top.peak.populationYear}</span>. ${top.peak.populationNote || ''}`
      + (big
        ? `<br><br>The largest count this atlas records for any settler dominion is ${big.name}, <span class="num">${c.format.number(big.pop)}</span> in <span class="num">${big.year}</span> — <span class="num">${pct}%</span> of that one territory. The two figures are different censuses in different years and this atlas will not add them together, but the order of magnitude is the answer to the question.`
        : ''),
    source: { kind: 'census', note: top.peak.populationNote || 'Peak population as recorded on this territory in the atlas.' },
  };
};

/**
 * M1'S DESIGNATED ACTIVATION — the slider §4 asks for, and round 2's classroom
 * critic could not find: "M1 ... is tagged only twice and I could not find its
 * designated activation slider anywhere."
 *
 * §4 wants "what share of the empire's population in 1913 was of British
 * descent?" This atlas has no empire-wide 1913 population and will not invent
 * one, so the slider asks the same question of the place a student pictures
 * when they picture settlement, at a moment the atlas holds exactly: the first
 * census of the Union of South Africa, whose two component figures are written
 * out in the record's own note and add to its own total. The item checks that
 * they do, and disappears if they ever stop.
 */
R['m1-share'] = (c) => {
  const t = c.terr('union-of-south-africa');
  const peak = t && t.peak;
  const note = peak && peak.populationNote;
  if (!note || !peak.population || !peak.populationYear) return null;
  const nums = (note.match(/[\d][\d,]{4,}/g) || []).map((x) => +x.replace(/,/g, ''));
  if (nums.length < 2) return null;
  const [white, rest] = nums;
  /* The two figures must be the two halves of this record's own total, or the
     share is being computed against something the note does not say. */
  if (white + rest !== peak.population) return null;
  const share = (white / peak.population) * 100;
  if (!(share > 0 && share < 100)) return null;
  /* The franchise sentence from the dominion period itself, which is what the
     share is FOR: a fifth of the people, and the vote. */
  const dom = (t.statusPeriods || []).find((sp) => sp.status === 'dominion' && sp.franchise);
  const doms = dominions(c);
  const top = mostPeopled(c);
  const n = (v) => `<span class="num">${c.format.number(v)}</span>`;
  return {
    kind: 'estimate',
    min: 0, max: 100, step: 1, start: 50, unit: ' in every 100',
    answer: Math.round(share), tolerance: 8,
    correction: `<strong>${Math.round(share)} in every 100</strong> \u2014 in the settler colony people picture when they picture empire. ${note}`
      + (dom ? `<br><br>And the vote, in the same record: ${dom.franchise}` : '')
      + (top && doms.length
        ? `<br><br>The empire's people were somewhere else entirely. The largest population this atlas records anywhere is ${top.name}, ${n(top.peak.population)} in <span class="num">${top.peak.populationYear}</span>. The largest it records for any of the ${WORDS[doms.length] || c.format.number(doms.length)} territories it ever calls a dominion is ${doms[0].name}, ${n(doms[0].pop)} in <span class="num">${doms[0].year}</span>.`
        : ''),
    source: { kind: 'census', note: note + ' The share is computed from those two figures and this record’s own total; the item does not exist if they stop adding up.' },
  };
};

/* =========================================================================
   THE FOUR SILENT MISCONCEPTIONS, AND THE LINE NOBODY WAS ASKED ABOUT.

   M7, M11, M12 and M15 were tagged nowhere in this application. M15 is the
   rubric's own named example of a SYMPATHETIC oversimplification — the belief
   a good, sympathetic student is most likely to arrive holding — and §4 is
   explicit that a misconception is defeated by activation, disconfirmation
   and replacement, not by a paragraph. Each of the five resolvers below builds
   all three out of the live atlas: the activation is the bank's question, the
   disconfirming evidence is dataset prose quoted word for word, and the
   replacement model is the bank's `because`.

   Every one of them returns null rather than guessing. If the atlas stops
   recording what a question rests on, the question ceases to exist.
   ========================================================================= */

/** The consequences block, which is where this atlas keeps the afterwards. */
const CONSQ = (t) => (t && t.consequences) || {};

/** A citation the record itself says supports this ground — chosen by the
 *  evidence entry's own `supports` field, never written here. */
function citeFor(t, re, note) {
  const list = (t && t.evidence) || [];
  const hit = list.find((e) => re.test(String(e.supports || '') + ' ' + String(e.work || ''))) || list[0];
  if (!hit) return note ? { kind: 'dataset', note } : null;
  return { kind: hit.kind || 'book', author: hit.author, work: hit.work, year: hit.year, supports: hit.supports, note };
}

/* M15 — five borders of one kind, five different afterwards.
   The answer is not deducible from the line, and that is the whole lesson.
   The item disqualifies itself if the dataset stops supporting it: the answer
   has to say conflict and none of the other four may. */
const M15_CASES = [
  'british-cameroons',            /* the answer */
  'the-gambia',
  'sierra-leone-protectorate',
  'british-togoland',
];

R['m15-borders'] = (c) => {
  const rows = M15_CASES.map((id) => {
    const t = c.terr(id);
    const b = CONSQ(t).borderLegacy;
    return t && b ? { id, name: t.name, border: b, t } : null;
  });
  if (rows.some((r) => !r)) return null;
  const [ans, ...rest] = rows;
  /* The guard is on the CLAIM, not on the prose: the answer's record must say
     the border became a conflict, and none of the other four may. It is
     deliberately narrow — British Togoland's line is a First World War
     convenience, which is a war the border came OUT of, not one it produced. */
  if (!/civil conflict|civil war|fault line/i.test(ans.border)) return null;
  if (rest.some((r) => /civil conflict|civil war|fault line/i.test(r.border))) return null;
  return {
    kind: 'choose',
    options: shuffle(rows.map((r) => ({ id: r.id, label: r.name })), 41),
    answer: ans.id,
    correction: [ans, ...rest].map((r) => `<strong>${r.name}</strong> — ${r.border}`).join('<br><br>'),
    source: citeFor(ans.t, /identity|recognition|Cameroon|history/i,
      'The five sentences above are this atlas’s own record of what each border has done since, quoted in full.'),
  };
};

/* M7 — the railways. The dataset states the terms in one sentence and the
   inheritance in another, and M7 needs both clauses to survive. */
R['m7-railways'] = (c) => {
  const t = c.terr('british-india');
  const q = CONSQ(t);
  if (!t || !q.economicLegacy || !q.languageAndLaw) return null;
  if (!/railway/i.test(q.economicLegacy)) return null;
  const contested = t.contested && t.contested.note;
  return {
    kind: 'choose',
    options: shuffle([
      { id: 'investors', label: 'The British investors who put up the money.' },
      { id: 'taxpayer', label: 'The Indian taxpayer: the return was guaranteed whether a line earned it or not.' },
      { id: 'company', label: 'The East India Company, out of Bengal’s revenue.' },
      { id: 'princes', label: 'The princely states the lines crossed.' },
    ], 43),
    answer: 'taxpayer',
    correction: `<strong>The Indian taxpayer.</strong> ${q.economicLegacy}<br><br>And the other half of the ledger, in the same record: ${q.languageAndLaw}`,
    source: contested
      ? { kind: 'reconstruction', note: contested + ' The manufacturing-share figures are a reconstruction, not a measurement, and carry wide error bars.' }
      : citeFor(t, /econom|Company|revenue/i, null),
  };
};

/* M11 — and which Britons. The atlas answers this one about Britain itself,
   in a sentence that keeps both clauses, which is exactly what M11 needs. */
R['m11-who-got-rich'] = (c) => {
  const t = c.terr('great-britain');
  const q = CONSQ(t);
  if (!t || !q.economicLegacy) return null;
  const contested = t.contested && t.contested.note;
  const moved = q.populationTransfer && q.populationTransfer.note;
  return {
    kind: 'choose',
    options: shuffle([
      { id: 'even', label: 'The country as a whole, fairly evenly.' },
      { id: 'workers', label: 'Working people in the industrial cities.' },
      { id: 'city', label: 'The City, shipping, insurance and the trading houses most.' },
      { id: 'nobody', label: 'Nobody: it cost the Treasury more than it brought in.' },
    ], 47),
    answer: 'city',
    correction: `<strong>${q.economicLegacy}</strong>${moved ? `<br><br>${moved}` : ''}`,
    source: contested
      ? { kind: 'reconstruction', note: contested }
      : citeFor(t, /cost|system|trade/i, null),
  };
};

/* M12 — argued at the time, by Britons, on the record, in this atlas.
   Four people, four dates, and the earliest is 1781. Nothing here is written
   by hand: the names, the roles and the years are read off the acquisition
   and departure records that already carry them. */
const M12_CRITICS = [
  { terr: 'caribbean-netherlands', name: 'Edmund Burke', style: 'MP' },
  { terr: 'orange-river-colony', name: 'Emily Hobhouse', style: 'campaigner' },
  { terr: 'anglo-egyptian-sudan', name: 'Winston Churchill', style: 'soldier and writer' },
  { terr: 'eritrea-british-administration', name: 'Sylvia Pankhurst', style: 'campaigner' },
];

R['m12-said-at-the-time'] = (c) => {
  const rows = [];
  for (const want of M12_CRITICS) {
    const t = c.terr(want.terr);
    if (!t) return null;
    let found = null;
    for (const step of [...(t.acquisitions || []), ...(t.departures || [])]) {
      const p = (step.people || []).find((x) => x && x.name === want.name);
      if (p) { found = { p, step }; break; }
    }
    if (!found || found.p.side !== 'british' || !found.p.role) return null;
    rows.push({
      id: want.name, name: want.name, style: want.style,
      role: found.p.role, year: found.step.year,
      place: t.name, terr: t.id,
    });
  }
  rows.sort((a, b) => a.year - b.year);
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!/law of nations|denounc/i.test(first.role)) return null;
  return {
    kind: 'who',
    options: shuffle(rows.map((r) => ({ id: r.id, label: `${r.name}, ${r.style}` })), 53),
    answer: first.id,
    /* The year printed beside a name is the year of the EPISODE this atlas
       records them in, not necessarily the year of the act — Hobhouse is named
       in the record of the Orange River Colony, taken in 1900, and her report
       is dated 1901 inside her own role. So the year is attached to the place,
       where it belongs, and the role keeps its own dates. The span at the end
       is counted from the rows, never typed: an earlier draft of this item said
       "1781 to 1946" from a five-person list that had since become four. */
    correction: `<strong>${first.name}</strong> — ${first.role}.<br>`
      + `<span class="qz__note">Named in this atlas’s record of ${first.place}, <span class="num">${first.year}</span>.</span><br><br>`
      + 'And the other three, every one of them British, every one of them in this atlas’s own record:<br><br>'
      + rows.slice(1).map((r) => `<strong>${r.name}</strong> — ${r.role}.<br><span class="qz__note">${r.place}, <span class="num">${r.year}</span>.</span>`).join('<br><br>')
      + `<br><br>Four Britons, attacking their own empire in public while it was running, across <span class="num">${last.year - first.year}</span> years: <span class="num">${first.year}</span> to <span class="num">${last.year}</span>.`,
    source: { kind: 'record', note: `Read live from this atlas’s own acquisition and departure records for ${c.format.list(rows.map((r) => r.place))}, where each of these four is named with the role given here word for word.` },
    evYear: first.year,
    evTerr: first.terr,
  };
};

/* M18, and the partition authorship dispute turned into a commitment.
   The atlas holds the date the award was published, who drew it, and a death
   range that spans an order of magnitude. The question is answerable; the
   number underneath it is not, and saying so is the point. */
R['m18-radcliffe'] = (c) => {
  const t = c.terr('british-india');
  const q = CONSQ(t);
  const part = q.partition;
  const dep = (t && t.departures || []).find((d) => d.mechanism === 'partition');
  if (!t || !part || !part.date || !part.lineDrawnBy || !dep) return null;
  const pub = c.data.readDate ? c.data.readDate(part.date) : null;
  const shown = part.date.display || (pub && String(pub.year));
  if (!shown || !/17 August 1947/.test(shown)) return null;
  const toll = q.violence && q.violence.toll;
  const moved = q.populationTransfer && q.populationTransfer.note;
  const n = (v) => `<span class="num">${c.format.number(v)}</span>`;
  return {
    kind: 'choose',
    options: shuffle([
      { id: 'plan', label: '3 June 1947, with the plan.' },
      { id: 'before', label: 'A week before independence.' },
      { id: 'after', label: 'Two days after independence.' },
      { id: 'later', label: 'Not until 1948.' },
    ], 59),
    answer: 'after',
    correction: `<strong>${shown}</strong> — two days after the flags went up. The line was drawn by ${part.lineDrawnBy}.<br><br>${part.note || ''} ${dep.how || ''}`
      + (toll && toll.deathsLow ? `<br><br>How many it killed cannot be established: this atlas carries a range from ${n(toll.deathsLow)} to ${n(toll.deathsHigh)}.` : '')
      + (moved ? ` ${moved}` : ''),
    source: {
      kind: 'record',
      note: (toll && toll.note ? toll.note + ' ' : '')
        + 'The date, the man and the range are the atlas’s own partition record. The range is wide because no census was taken across the new line and the administrations that would have counted had themselves collapsed.',
    },
  };
};

/* M6 — "Britain kindly granted it." The atlas dates the asking. The Congress
   was founded in 1885 by professionals who were not asking for independence
   at all, and the gap to the departure record is computed here rather than
   typed, so the sentence cannot go stale against the atlas. */
R['m6-congress-1885'] = (c) => {
  const e = c.ev('indian-national-congress-1885');
  const t = c.terr('british-india');
  const dep = t && (t.departures || []).find((d) => d.mechanism === 'partition');
  if (!e || !e.date || !dep || !dep.year) return null;
  const y = YEAR(e.date);
  if (!y) return null;
  const gap = dep.year - y;
  return {
    kind: 'year',
    low: y - 10, high: y + 10,
    answer: String(y),
    right: (v) => v >= y - 10 && v <= y + 10,
    correction: `<span class="num">${e.date.display || y}</span>. ${e.summary || ''} ${e.significance || ''}`
      + `<br><br>That is <span class="num">${gap}</span> years before Britain left. ${dep.how || ''}`,
    source: c.cite(e, `Dated from this atlas’s own record of the founding, and the gap counted against its record of the departure in ${dep.year}.`),
  };
};

/* M16 — the world wars were imperial wars. The number that carries it is a
   structured toll on a structured event, with its own note about what the
   count excludes, which is why it is asked as a range and not as a fact. */
R['m16-carriers'] = (c) => {
  const e = c.ev('east-african-campaign-1914');
  const ind = c.ev('indian-army-first-world-war');
  if (!e || !e.toll || !e.toll.deathsLow) return null;
  const lo = e.toll.deathsLow, hi = e.toll.deathsHigh || lo;
  const n = (v) => `<span class="num">${c.format.number(v)}</span>`;
  return {
    kind: 'estimate',
    min: 0, max: 300000, step: 5000, unit: ' people', start: 0,
    answer: lo, tolerance: Math.max(20000, (hi - lo) / 4),
    band: [lo, hi],
    correction: `${n(lo)} on the British registers alone, and the wider estimates run to ${n(hi)}. ${e.significance || ''}`
      + (ind && ind.summary ? `<br><br>And the theatre students are told about, counted: ${ind.summary.charAt(0).toLowerCase() + ind.summary.slice(1)}` : ''),
    source: c.cite(e, e.toll.note),
  };
};

/**
 * M16'S DESIGNATED INTERACTION, ON THIS SIDE OF THE APP.
 *
 * §4 gives M16 to "map (war-service layer) + tours", and round 2's classroom
 * critic found the layer honestly declared NOT BUILT — "M16's designated
 * interaction therefore does not exist". The layer is not this module's to
 * build. A guess-then-reveal on the number is, and it is the same move §4
 * specifies for M1 and M9: commit to a figure, watch it be wrong by an order
 * of magnitude, then read the record.
 *
 * Everything printed comes off one event record: the figure out of its own
 * summary sentence, the death range out of its structured toll with the note
 * that says what the range excludes, and a name out of its own people[].
 */
R['m16-served'] = (c) => {
  const e = c.ev('indian-army-first-world-war');
  if (!e || !e.summary || !e.toll) return null;
  const m = /([\d.]+)\s*million Indians served/i.exec(e.summary);
  if (!m) return null;
  const millions = parseFloat(m[1]);
  if (!(millions > 0 && millions < 20)) return null;
  const lo = e.toll.deathsLow, hi = e.toll.deathsHigh;
  if (!lo || !hi) return null;
  /* A soldier with a name, chosen from the record rather than from memory. */
  const soldier = (e.people || []).find((p) => p.side === 'local' && /gunner|soldier|corps|Victoria Cross/i.test(p.role || ''));
  const n = (v) => `<span class="num">${c.format.number(v)}</span>`;
  return {
    kind: 'estimate',
    min: 0, max: 3, step: 0.1, unit: ' million soldiers', start: 0.5,
    answer: millions, tolerance: 0.4,
    correction: `<strong>${millions} million.</strong> ${e.summary}`
      + `<br><br>The dead are given as a range, ${n(lo)} to ${n(hi)}, and the record says why: ${e.toll.note || 'the count depends on which registers are read.'}`
      + (soldier ? `<br><br><strong>${soldier.name}</strong> — ${soldier.role}.` : '')
      + (e.significance ? `<br><br>${e.significance}` : ''),
    source: c.cite(e, e.toll.note),
  };
};

/* ------------------------------------------------------------------ api -- */

export function resolveAll(bank, data, format, extra) {
  const c = makeCtx(data, format, extra);
  const out = [];
  const dropped = [];
  for (const spec of (bank.items || [])) {
    const fn = R[spec.id];
    if (!fn) { dropped.push(spec.id + ' (no resolver)'); continue; }
    let body = null;
    try { body = fn(c); } catch (err) { body = null; }
    if (!body) { dropped.push(spec.id + ' (dataset cannot support it)'); continue; }
    if (body.guard && !body.guard()) { dropped.push(spec.id + ' (guard)'); continue; }
    out.push({ ...spec, ...body });
  }
  return { items: out, dropped };
}

/* Exposed for the acceptance scenarios, not for another module. */
export const _internal = { YEAR, shuffle, SPINE, ROSTER };
