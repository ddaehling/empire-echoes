#!/usr/bin/env node
/* one-time: attach structured `warrant` records to the quantities this atlas
 * prints. Kept in the repo so every attribution is reviewable.
 *
 * THE RULE, and it is the reason this script warrants so few of the 700-odd
 * quantities in the dataset: a warrant is only written where the record ALREADY
 * names the source of the figure, in its own `source` line or in an evidence
 * entry whose `supports` names the figure. Nothing is attributed to a work
 * because that work is "about" the place. That is the exact failure the
 * historian named: Beat 6's £1.72m traced to Beckles supporting "the whole
 * narrative". Everything not warranted here prints a defect, and the defect is
 * the honest state of the record.
 */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../../app/data/territories');

const LBS = (supports) => ({
  author: 'Centre for the Study of the Legacies of British Slavery, University College London',
  work: 'Legacies of British Slavery database',
  year: 2013,
  kind: 'dataset',
  supports,
  check: 'ucl.ac.uk/lbs — browse by colony. Every award transcribes the Slave Compensation Commission’s registers, T 71, The National Archives, Kew.',
});
const VOYAGES = (supports) => ({
  author: 'David Eltis and David Richardson',
  work: 'Atlas of the Transatlantic Slave Trade',
  year: 2010,
  kind: 'book',
  supports,
  check: 'Yale University Press, 2010; the voyage-by-voyage data behind it is at slavevoyages.org, Estimates.',
});

const firstSentence = (s) => {
  const t = String(s || '').trim();
  const i = t.search(/\.\s/);
  const out = (i > 0 ? t.slice(0, i + 1) : t).trim();
  return out.length > 300 ? out.slice(0, 297) + '…' : out;
};
const num = (n) => Number(n).toLocaleString('en-GB');

const FIGURE = /\b(death|dead|killed|toll|casualt|famine|mortalit|starv|displac|deport|compensat|enslav)/i;

let money = 0, people = 0, fromEvidence = 0, already = 0, skipped = 0;

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const t of data.territories || []) {

    /* 1. THE COMPENSATION FIGURES. Every one of these records already names the
     *    Legacies of British Slavery database in its own `source` line; this
     *    turns that sentence into a record a checker can read and a reader can
     *    follow, with `supports` naming the award rather than the narrative. */
    const sl = (t.consequences || {}).slavery;
    const toll = sl && sl.toll;
    if (toll && !toll.warrant) {
      const list = [];
      if (typeof toll.money === 'string' && /\d/.test(toll.money) && /Legacies of British Slav/i.test(toll.source || '')) {
        list.push(LBS(firstSentence(toll.money))); money++;
      }
      /* 2. THE NUMBERS OF PEOPLE. Only where the record itself says the range
       *    follows the voyage data. */
      const hasRange = Number.isFinite(toll.enslavedLow) || Number.isFinite(toll.enslavedHigh);
      if (hasRange && /Trans-?Atlantic Slave Trade Database|slavevoyages/i.test((toll.note || '') + ' ' + (toll.source || ''))) {
        const lo = toll.enslavedLow, hi = toll.enslavedHigh;
        const range = (Number.isFinite(lo) && Number.isFinite(hi) && lo !== hi)
          ? num(lo) + ' to ' + num(hi) : num(Number.isFinite(lo) ? lo : hi);
        list.push(VOYAGES('The number of enslaved Africans landed in ' + t.name + ': ' + range + '.'));
        people++;
      }
      if (list.length) toll.warrant = list.length === 1 ? list[0] : list;
      else skipped++;
    } else if (toll && toll.warrant) already++;

    /* 3. STEP TOLLS. A warrant only where an evidence entry on THIS step says
     *    it supports the figure. Seven of a hundred and twenty-two. */
    const steps = [].concat(t.acquisitions || [], t.departures || []);
    for (const st of steps) {
      const c = st.cost;
      if (!c || c.warrant) continue;
      const has = ['deathsLow', 'deathsHigh', 'displacedLow', 'displacedHigh', 'enslavedLow', 'enslavedHigh']
        .some((k) => Number.isFinite(c[k])) || (typeof c.money === 'string' && /\d/.test(c.money));
      if (!has) continue;
      const ev = (st.evidence || []).find((e) => FIGURE.test(e.supports || ''));
      if (!ev) { skipped++; continue; }
      c.warrant = {
        author: ev.author, work: ev.work, year: ev.year,
        kind: ev.kind && ev.kind !== 'dataset' ? ev.kind : undefined,
        supports: ev.supports,
        check: ev.locator ? (ev.publisher ? ev.publisher + ', ' + ev.locator : ev.locator)
          : (ev.url || ev.publisher || undefined),
      };
      for (const k of Object.keys(c.warrant)) if (c.warrant[k] === undefined) delete c.warrant[k];
      fromEvidence++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
console.log(`compensation awards warranted (LBS):      ${money}`);
console.log(`numbers of people warranted (voyage data): ${people}`);
console.log(`step tolls warranted from their own evidence: ${fromEvidence}`);
console.log(`already warranted: ${already}   left bare: ${skipped}`);

/* ------------------------------------------------------------------ *
 * 4. NAMED COMMISSIONS. Each of these records already names, in its own note
 *    or source line, the inquiry that produced the figure. Nothing is added
 *    here that the record did not already say; it is turned into something a
 *    checker can read and a reader can walk to.
 * ------------------------------------------------------------------ */
const DEVLIN = {
  author: 'Sir Patrick Devlin and the Nyasaland Commission of Inquiry',
  work: 'Report of the Nyasaland Commission of Inquiry (Cmnd. 814)',
  year: 1959, kind: 'official-record',
  supports: '51 Africans killed by the security forces in the Nyasaland emergency of March 1959, 20 of them shot at Nkhata Bay.',
  check: 'Command Paper Cmnd. 814, HMSO, July 1959; British Parliamentary Papers 1958–59.',
};
const BY_PATH = {
  'nyasaland|departures|malawi-independence-1964': DEVLIN,
  'federation-of-rhodesia-and-nyasaland|departures|central-african-federation-dissolved-1963': DEVLIN,
  'federation-of-rhodesia-and-nyasaland|consequences.violence': DEVLIN,
  'gold-coast|departures|gold-coast-independence-1957': {
    author: 'Aiken Watson and the Commission of Enquiry into Disturbances in the Gold Coast',
    work: 'Report of the Commission of Enquiry into Disturbances in the Gold Coast, 1948 (Colonial No. 231)',
    year: 1948, kind: 'official-record',
    supports: '29 people killed and more than 200 injured in the Accra riots of 28 February to 3 March 1948.',
    check: 'Colonial No. 231, HMSO, London, 1948.',
  },
  'canada|consequences.populationTransfer': {
    author: 'Truth and Reconciliation Commission of Canada',
    work: 'Canada’s Residential Schools: Missing Children and Unmarked Burials (Final Report, volume 4)',
    year: 2015, kind: 'official-record',
    supports: 'At least 3,200 named and unnamed deaths of children in the residential schools, with the true number stated by the Commission to be higher.',
    check: 'McGill-Queen’s University Press, 2015; the register is held by the National Centre for Truth and Reconciliation, nctr.ca.',
  },
  'canada|departures|canada-independence': {
    author: 'Commonwealth War Graves Commission',
    work: 'Debt of Honour Register',
    year: 2024, kind: 'dataset',
    supports: 'About 61,000 Canadian war dead in 1914–18 and about 45,000 in 1939–45.',
    check: 'cwgc.org — search by force and conflict; the Commission is named as the source in this record’s own note.',
  },
  'bengal-presidency|consequences.violence': [
    {
      author: 'Famine Inquiry Commission',
      work: 'Report on Bengal',
      year: 1945, kind: 'official-record',
      supports: 'About 1.5 million deaths in the Bengal famine of 1943 — the Commission’s own figure, the lower bound of the range this record prints.',
      check: 'Government of India, Manager of Publications, 1945; reprinted in facsimile and held in the India Office Records, British Library.',
    },
    {
      author: 'Amartya Sen',
      work: 'Poverty and Famines: An Essay on Entitlement and Deprivation',
      year: 1981, kind: 'book',
      supports: 'The two-to-three-million range for the 1943 Bengal famine, against the Commission’s 1.5 million.',
      check: 'Clarendon Press, 1981, appendix D; and Tim Dyson and Arup Maharatna, “Excess Mortality during the Bengal Famine”, Indian Economic and Social History Review 28 (1991).',
    },
  ],
};

let named = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const t of data.territories || []) {
    for (const key of ['violence', 'populationTransfer']) {
      const c = ((t.consequences || {})[key] || {}).toll;
      const w = BY_PATH[t.id + '|consequences.' + key];
      if (c && w && !c.warrant) { c.warrant = w; named++; touched = true; }
    }
    for (const d of t.departures || []) {
      const w = BY_PATH[t.id + '|departures|' + d.id];
      if (d.cost && w && !d.cost.warrant) { d.cost.warrant = w; named++; touched = true; }
    }
  }
  if (touched) fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
console.log(`named commissions warranted: ${named}`);
