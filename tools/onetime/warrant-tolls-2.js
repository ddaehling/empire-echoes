#!/usr/bin/env node
/**
 * one-time: ROUND 7, second pass — THE TOLLS A STUDENT ACTUALLY MEETS.
 *
 * The panel's instruction was explicit: "Prioritise the tolls a student meets on
 * the path and in the twenty." tools/onetime/warrant-tolls.js took the tolls
 * whose notes named a producer, wherever they were. This one takes the twenty
 * (DIDACTIC_SPEC §3) and the entries the default route stops at — Ireland,
 * Jamaica, Barbados, Virginia, Bengal, Egypt, Palestine, Mesopotamia, Punjab,
 * Mauritius, South Africa — and promotes their notes on the same rule: the
 * producer is one the record already names, and `supports` is the record's own
 * sentence.
 *
 *   node tools/onetime/warrant-tolls-2.js [--dry]
 */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../../app/data/territories');
const DRY = process.argv.includes('--dry');

const WO = 'Campaign returns and casualty states are in the WO, ADM and CO series at The National Archives, Kew, and were printed in the London Gazette and in British Parliamentary Papers.';
const PP = 'Reports of colonial commissions and royal commissions are Command Papers: British Parliamentary Papers, and the CO series at The National Archives, Kew.';
const CO = 'Colonial administration returns are printed in the territory’s annual Blue Book and report; the British copies are in the CO series at The National Archives, Kew.';
const IOR = 'East India Company and Government of India returns are in the India Office Records at the British Library (IOR series) and in the WO series at The National Archives, Kew.';
const T71 = 'T 71 at The National Archives, Kew, indexed award by award in the Legacies of British Slavery database at ucl.ac.uk/lbs.';
const MILEFFORT = 'War Office, Statistics of the Military Effort of the British Empire during the Great War (HMSO, 1922); and the Mesopotamia Commission report (Cd. 8610, 1917).';

const ROWS = [
  ['ireland', 'nine-years-war-1603', 'The English commanders and administrators in Ireland, in the surviving accounts', 'English accounts of the Nine Years War and the wasting of Ulster', 1603,
    'Calendar of State Papers, Ireland, 1600–03; and the Carew manuscripts at Lambeth Palace Library.',
    'The record says these accounts are English and partisan. The width of the range is what that partisanship looks like once it is turned into a number.'],
  ['ireland', 'cromwellian-settlement-1652', 'Sir William Petty, against modern population-loss reconstructions', 'The Political Anatomy of Ireland', 1691,
    'Petty, The Political Anatomy of Ireland (London, 1691). The modern range is reconstructed from the 1659 census, the Down Survey and the hearth-money returns.',
    'Petty surveyed the confiscated land himself and was paid in it. His 616,000 is disputed; the atlas prints the dispute rather than choosing a side of it.'],
  ['jamaica', 'jamaica-conquest-1655', 'The Western Design’s own musters and returns', 'English musters and returns of the Western Design, 1655–56', 1656,
    'State Papers Colonial and the Thurloe State Papers; CO 1 at The National Archives, Kew.',
    'The invaders counted the invaders. Spanish and Maroon losses were not counted at all, which is why the only precise number here is England’s own dead.'],
  ['jamaica', 'jamaica-independence-1962', 'The West India Royal Commission (the Moyne commission)', 'Report of the West India Royal Commission (Cmd. 6607)', 1945,
    'Command Paper Cmd. 6607, HMSO; the commission reported in 1939 and publication was held back until the war ended.',
    'The report on the 1938 killings was written in 1939 and suppressed for six years because of what it said about conditions in the colonies.'],
  ['barbados', 'barbados-independence-1966', 'The commission of inquiry into the Barbados disturbances of 1937', 'Report of the Commission of Inquiry into the disturbances in Barbados, 1937', 1938, PP,
    'Nobody died at independence. The figure on this step is the fourteen the police killed in 1937, and it exists because those deaths produced an inquiry.'],
  ['virginia', 'virginia-jamestown-1607', 'The Virginia Company of London, in its own records', 'The Records of the Virginia Company of London, ed. Susan Myra Kingsbury', 1624,
    'Kingsbury’s four-volume edition (Washington, 1906–35), from the originals in the Library of Congress.',
    'A company-records reconstruction, and approximate. Roughly 7,300 people were sent and about 1,200 were alive in 1624.'],
  ['east-florida', 'consequences.slavery', 'The New Smyrna colony records, and the depositions taken in 1777', 'Colony records of New Smyrna and the 1777 depositions', 1777, CO,
    'Arrivals were not fully recorded, so the mortality is a floor and not a total.'],
  ['bermuda', 'consequences.slavery', 'The Slave Compensation Commission, in its returns for Bermuda', 'Returns of the Slave Compensation Commission', 1836, T71,
    'The most exact count of enslaved people in this atlas is the one made to pay their owners.'],
  ['seychelles', 'consequences.slavery', 'The colonial registers of emancipation', 'Seychelles colonial registers of the 1835 emancipation', 1835, CO,
    'The 1835 register is a count. The total trafficked to the islands from 1770 is an estimate, and the record says which is which.'],
  ['zanzibar', 'consequences.slavery', 'The Zanzibar customs records and the Royal Navy’s anti-slavery patrol reports', 'Zanzibar customs records and Royal Navy slave-trade suppression reports', 1873,
    'ADM 123 and FO 84 (Slave Trade) at The National Archives, Kew.',
    'The trade went clandestine after the 1873 treaty, so the later the year the worse the count — the opposite of what a reader expects.'],
  ['egypt', 'egypt-occupation-1882', 'The British expeditionary force, in its own returns', 'British returns of the Egyptian campaign of 1882', 1882, WO,
    'Fifty-seven British and Indian dead, counted man by man; about 2,000 Egyptian dead, counted by the victors.'],
  ['egypt', 'egypt-nominal-independence-1922', 'The British administration in Egypt, in its official figures', 'British official figures for the deaths of the 1919 revolution', 1919,
    'FO 141 and FO 371 at The National Archives, Kew; summarised in the Milner mission report, Cmd. 1131 (1921).',
    'Egyptian accounts give higher numbers, and there was no count that both sides accepted.'],
  ['egypt', 'egypt-suez-withdrawal-1956', 'Three defence ministries for their own dead; contemporary estimates for Egypt’s', 'Casualty returns of the Suez–Sinai war of 1956', 1957, WO,
    'Britain lost 22, France 10, Israel about 190, and each government counted its own precisely. Nobody counted Port Said.'],
  ['mesopotamia-iraq', 'mesopotamia-conquest-1914', 'The War Office, in the army’s own casualty and medical returns', 'Statistics of the Military Effort of the British Empire during the Great War, 1914–1920', 1922, MILEFFORT,
    'The British and Indian dead are counted to the man. Ottoman and civilian deaths were never counted.'],
  ['mandatory-palestine', 'palestine-occupation-1917', 'The War Office, in the army’s own casualty and medical returns', 'Statistics of the Military Effort of the British Empire during the Great War, 1914–1920', 1922, MILEFFORT,
    'The Greater Syrian famine of 1915–18 killed hundreds of thousands, with a naval blockade among its causes, and appears in no casualty return anywhere.'],
  ['mauritius', 'mauritius-capture-1810', 'The British and French naval commanders, in their own returns', 'British and French returns of the Mauritius campaign of 1810', 1811,
    'ADM and WO series at The National Archives, Kew; the French figures for Grand Port are the ones inscribed on the Arc de Triomphe.',
    'Both navies counted, and both counts survive, which is rare enough in this atlas to be worth saying.'],
  ['mauritius', 'consequences.populationTransfer', 'The immigration depot at Port Louis, in its own registers', 'The indenture registers of the Aapravasi Ghat, Port Louis', 1910,
    'Held by the Mauritius National Archives and the Aapravasi Ghat Trust Fund; the depot is a UNESCO World Heritage Site.',
    'Indenture was registered because the state wanted to be able to find people. That is why this figure is firmer than almost any other movement of people here.'],
  ['union-of-south-africa', 'consequences.violence', 'The commission of inquiry into the events at Sharpeville and Langa', 'Report of the Commission of Inquiry into the events at Sharpeville and Langa, 21 March 1960', 1960,
    'Government Printer, Pretoria, 1960; the evidence is in the Union government records, National Archives of South Africa.',
    'The number of dead is not seriously disputed. The number of shots fired and the order to fire are, and the inquiry is where that argument lives.'],
  ['union-of-south-africa', 'consequences.populationTransfer', 'The Surplus People Project', 'Forced Removals in South Africa: the Surplus People Project reports', 1983,
    'Surplus People Project, Cape Town, 1983, five volumes; held at the University of Cape Town libraries.',
    'Built up from local case studies rather than counted centrally, because the state that did the removing did not publish a total.'],
  ['british-india', 'diwani-of-bengal-1765', 'Contemporary Company estimates, against later reconstructions', 'The range of estimates for the Bengal famine of 1769–70', 1772,
    'The contemporary figures are in the Company’s Bengal correspondence, India Office Records, British Library. There was no census to check them against.',
    'The record says it plainly: contemporary estimates were political documents. "A third of the province" was an assertion made by men with an interest in its size.'],
  ['bengal-presidency', 'bengal-diwani-1765', 'Contemporary Company estimates, against later reconstructions', 'The range of estimates for the Bengal famine of 1769–70', 1772,
    'The contemporary figures are in the Company’s Bengal correspondence, India Office Records, British Library. There was no census to check them against.',
    'The range is not a disagreement about whether the famine happened. It is the absence of anybody whose job was to count.'],
  ['british-india', 'treaty-of-yandabo-1826', 'The Company army, in its own casualty and medical returns', 'British and Company returns of the first Anglo-Burmese war', 1826, IOR,
    'Most of the British and Indian dead were killed by disease. Burmese losses were never counted.'],
  ['bengal-presidency', 'bengal-partitioned-1947', 'Contemporary official estimates for Calcutta and Noakhali, against later reconstructions of the refugee movement', 'The range of estimates for Bengal’s partition killings and the migration that followed', 1951,
    'Government of Bengal and Government of India records, 1946–48; the refugee totals are read off the censuses of India and Pakistan, 1951 and 1961.',
    'Bengal’s killing came mostly before partition. Its refugee movement went on for twenty years, and the two are counted by completely different means.'],
  ['madras-presidency', 'consequences.violence', 'Colonial mortality registration, and the famine reconstructions built on it', 'Report of the Indian Famine Commission 1880, and the mortality registration behind it', 1880, PP,
    'Registration was incomplete and the baselines differ, which is why the range is so wide. That width is a fact about colonial record-keeping, not about the famine.'],
  ['united-provinces', 'united-provinces-independence-1947', 'The provincial police, in their own reports', 'United Provinces police reports on the disturbances of 1946–47', 1947,
    'Uttar Pradesh State Archives, Lucknow; and the Home Department (Political) files of the Government of India, National Archives of India.',
    'The record says the police reports undercounted. They are still the only count there is, which is the whole difficulty.'],
  ['punjab-province', 'consequences.violence', 'The contemporary official estimates, against later scholarly reconstructions', 'The range of estimates for the partition killings in Punjab', 1948,
    'Records of the Punjab Boundary Force and the Government of India, 1947–48; the reconstructions rest on the 1951 censuses of India and Pakistan.',
    'The range reflects the absence of any counting authority, not a disagreement about what happened.'],
];

const clip = (s) => { const t = String(s || '').trim(); return t.length <= 300 ? t : t.slice(0, 297) + '…'; };
let wrote = 0, already = 0; const seen = new Set(), missing = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const t of data.territories || []) {
    for (const [tid, where, author, work, year, check, note] of ROWS) {
      if (t.id !== tid) continue;
      let toll = null;
      if (where.startsWith('consequences.')) toll = ((t.consequences || {})[where.slice(13)] || {}).toll || null;
      else { const st = [].concat(t.acquisitions || [], t.departures || []).find((s) => s.id === where); toll = st ? st.cost : null; }
      if (!toll) continue;
      seen.add(tid + '|' + where);
      if (toll.warrant) { already++; continue; }
      toll.warrant = { author, work, year, kind: 'official-record', supports: clip(toll.note || toll.money || ''), check, note };
      wrote++; touched = true;
    }
  }
  if (touched && !DRY) fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
for (const r of ROWS) if (!seen.has(r[0] + '|' + r[1])) missing.push(r[0] + '/' + r[1]);
console.log('toll warrants written: ' + wrote + ' of ' + ROWS.length + '   already warranted: ' + already + (DRY ? '   (dry run)' : ''));
if (missing.length) { console.log('NOT FOUND:\n  ' + missing.join('\n  ')); process.exit(1); }
