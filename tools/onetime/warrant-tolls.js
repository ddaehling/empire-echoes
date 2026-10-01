#!/usr/bin/env node
/**
 * one-time: ROUND 7 — the tolls whose own note already names who counted.
 *
 * THE RULE, UNCHANGED FROM tools/onetime/add-warrants.js: nothing is attributed
 * to a work because that work is "about" the place. Every entry below promotes
 * a producer THE RECORD ITSELF NAMES, in the toll's own `note`, into a
 * structured warrant a checker can read and a reader can walk to. The `supports`
 * line is the record's own sentence, so the warrant cannot drift away from the
 * claim it warrants.
 *
 * WHAT IS BEING CITED, AND WHY IT IS WORTH CITING. Most of these are not
 * histories. They are British campaign returns, colonial commissions, ships'
 * manifests and camp registers — the records of the side doing the counting,
 * and usually of the side doing the killing. That is the point. A student who
 * reads "about 11,000 Sudanese killed at Omdurman, against 48 on Kitchener's
 * side" and then reads "the Sudanese figures are British estimates made by
 * burial parties" has learned something about the empire AND something about
 * evidence, and the second lesson is the one that transfers.
 *
 *   node tools/onetime/warrant-tolls.js [--dry]
 */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../../app/data/territories');
const DRY = process.argv.includes('--dry');

/* ------------------------------------------------------- where to look --- */
const WO = 'Campaign returns, casualty states and despatches are in the WO, ADM and CO series at The National Archives, Kew; the despatches were printed in the London Gazette and the totals in British Parliamentary Papers.';
const PP = 'Reports of colonial commissions and boards of inquiry are Command Papers: British Parliamentary Papers, and the CO series at The National Archives, Kew.';
const CO = 'Colonial administration returns are printed in the territory’s annual Blue Book and administration report; the British copies are in the CO series at The National Archives, Kew.';
const SHIP = 'Transport, embarkation and evacuation returns are in the ADM, CO and T series at The National Archives, Kew.';
const IOR = 'East India Company and Government of India military returns are in the India Office Records at the British Library (IOR series) and in the WO series at The National Archives, Kew.';
const ANOM = 'French colonial records are in the Archives nationales d’outre-mer, Aix-en-Provence.';
const NAA = 'Commonwealth Parliamentary Papers, and the file series at the National Archives of Australia.';

/* THE ASYMMETRY NOTE. It belongs on every figure produced by the side that did
   the killing, and it is the single most useful thing a student can carry away
   from a casualty figure in this atlas. */
const ASYM = 'The side doing the killing counted its own dead precisely and the other side’s by estimate. That asymmetry is in the figure, not just in the footnote.';

/* territory | step id, or "consequences.<key>" | author | work | year | check | note */
const ROWS = [
  // ---- Africa -----------------------------------------------------------
  ['natal', 'consequences.violence', 'The Natal colonial government, in its own returns', 'Natal colonial returns of the Bambatha rebellion', 1906, CO, ASYM],
  ['transvaal-colony', 'transvaal-conquest-1900', 'The British camp superintendents’ own registers, and the historians who reworked them', 'Death registers of the South African War concentration camps', 1902, CO,
    'The 27,927 Boer deaths were registered; the 14,154 African deaths were registered separately and less completely, which is why the historians’ figure runs to 20,000.'],
  ['anglo-egyptian-sudan', 'sudan-reconquest-1898', 'Kitchener’s burial parties, in the British returns from Omdurman', 'British despatches and returns of the Sudan campaign of 1896–98', 1898, WO, ASYM],
  ['madagascar-british-occupation', 'consequences.violence', 'The French colonial administration’s own count, against contemporary Malagasy and French press estimates', 'French official returns for the rising of 1947 and its suppression', 1949, ANOM,
    'The low figure is the administration’s; the high one the press of the time. Most historians now work between them, and the record says so.'],
  ['reunion-british-occupation', 'consequences.slavery', 'The French colonial registers of emancipation', 'Registers of the 1848 emancipation on Bourbon (Réunion)', 1848, ANOM,
    'The register counts the people freed in 1848, not the people enslaved during the British occupation of 1810–15, which nobody recorded separately.'],
  ['sierra-leone', 'sierra-leone-province-of-freedom-1787', 'The Province of Freedom settlement, in its own returns', 'Returns of the Sierra Leone settlement of 1787', 1788, CO,
    'Scanty returns from a settlement that was collapsing while it made them.'],
  ['sierra-leone', 'consequences.violence', 'Sir David Chalmers, Royal Commissioner', 'Report by Her Majesty’s Commissioner … into the insurrection in the Sierra Leone Protectorate (C. 9388)', 1899, PP,
    'Chalmers blamed the hut tax and was overruled in London. The commission is why any figure exists at all.'],
  ['sierra-leone', 'consequences.slavery', 'The Vice-Admiralty and Mixed Commission courts at Freetown', 'Registers of Liberated Africans landed at Freetown, 1808–1863', 1863,
    'The registers are in the FO 84 and CO 267 series at The National Archives, Kew, and are name-indexed in the African Origins database at slavevoyages.org.',
    'These are people landed from captured slave ships, not people enslaved in Sierra Leone. The record says so, and the difference matters.'],
  ['sierra-leone-protectorate', 'sierra-leone-protectorate-declared-1896', 'The British columns, in their own military reports, and the Chalmers commission', 'British military reports of the 1898 hut tax war, and the Chalmers report (C. 9388)', 1899, PP, ASYM],
  ['ashanti', 'ashanti-annexed-1902', 'The British columns, in their own military reports', 'British military reports of the Asante campaign of 1900', 1901, WO, ASYM],
  ['nigeria', 'consequences.violence', 'The Aba Commission of Inquiry', 'Report of the Commission of Inquiry into the Disturbances in the Calabar and Owerri Provinces, December 1929', 1930, PP,
    'A figure exists for Aba because the killings embarrassed the administration into an inquiry. No inquiry followed the conquest patrols, and no figure exists for those.'],
  ['southern-nigeria-protectorate', 'consequences.violence', 'The Aba Commission of Inquiry', 'Report of the Commission of Inquiry into the Disturbances in the Calabar and Owerri Provinces, December 1929', 1930, PP,
    'A figure exists for Aba because the killings embarrassed the administration into an inquiry. No inquiry followed the conquest patrols of 1902–18.'],
  ['northern-nigeria-protectorate', 'northern-nigeria-sokoto-1903', 'The British column, in its own returns', 'British military returns of the Kano–Sokoto campaign', 1903, WO, ASYM],
  ['sokoto-caliphate', 'sokoto-conquest-1903', 'The British column, in its own returns', 'British military returns of the Kano–Sokoto campaign', 1903, WO, ASYM],
  ['egba-united-government', 'egba-annexed-1914', 'The British administration, and the commission of inquiry into the Adubi rising', 'British reports and the inquiry into the Adubi rising', 1918, PP,
    'The Ijemo killings of 1914 had no inquiry and have no agreed total, which is the same fact seen from the other side.'],
  ['egba-united-government', 'consequences.violence', 'The British administration, and the commission of inquiry into the Adubi rising', 'British reports and the inquiry into the Adubi rising', 1918, PP, ASYM],

  // ---- Atlantic and South America ---------------------------------------
  ['falkland-islands', 'consequences.violence', 'The British and Argentine ministries of defence', 'The official casualty rolls of the 1982 Falklands/Malvinas war', 1983,
    'The British roll of honour is published by the Ministry of Defence and the Commonwealth War Graves Commission; the Argentine roll by the Ministerio de Defensa.',
    'Two governments counted their own dead, and for once the two counts agree.'],
  ['rio-de-la-plata-invasions', 'montevideo-stormed-1807', 'The British expedition, in its own returns', 'British returns of the River Plate expeditions', 1807, WO, ASYM],
  ['rio-de-la-plata-invasions', 'reconquista-of-buenos-aires-1806', 'The British expedition, in its own returns', 'British returns of the River Plate expeditions', 1806, WO, ASYM],

  // ---- Egypt -------------------------------------------------------------
  ['egypt-before-the-occupation', 'egypt-financial-control-1840', 'Stephen Cave, and the Goschen–Joubert mission', 'Report on the Financial Condition of Egypt (the Cave report), and the Goschen–Joubert settlement', 1876, PP,
    'The debt figures are the bondholders’ own inquiries. They are broadly agreed; the effective interest rates are not.'],
  ['egypt-before-the-occupation', 'egypt-informal-empire-becomes-occupation-1882', 'The British expeditionary force, in its own returns', 'British returns of the Egyptian campaign of 1882', 1882, WO, ASYM],

  // ---- Australasia and the Pacific --------------------------------------
  ['western-australia', 'wa-swan-river-1829', 'Governor James Stirling, in his own despatch, against later settler and Noongar accounts', 'Stirling’s despatch on the killings at Pinjarra', 1834, CO,
    'Stirling led the party and wrote the return. The state government now calls it a massacre; the number in the despatch has not changed.'],
  ['northern-territory', 'consequences.violence', 'The Commonwealth board of inquiry into the Coniston killings', 'Report of the Board of Inquiry concerning the killing of natives in Central Australia', 1929, NAA,
    'The board accepted 31; Warlpiri oral history and later historians put it between 60 and 200. The board was appointed to settle the question and did not.'],
  ['fiji', 'fiji-cession-1874', 'The colonial government of Fiji, in its reports on the epidemic', 'Colonial reports on the measles epidemic of 1875', 1876, CO,
    'The colonial government counted the deaths its own failure to quarantine had caused.'],
  ['nauru', 'consequences.violence', 'The Australian administration of Nauru, in its post-war count', 'Australian administration returns on the Nauruans deported to Chuuk, 1943–46', 1946, NAA,
    'One of the best-documented figures in the wartime Pacific, because a small population was counted out and counted back.'],

  // ---- Caribbean ---------------------------------------------------------
  ['saint-vincent', 'consequences.populationTransfer', 'The British commissary, in the transport returns', 'British transport and commissary returns for the Garifuna deportation of 1797', 1797, SHIP,
    'Roughly 5,000 were held on Balliceaux and 4,338 were landed on Roatán. The difference is the winter, and the returns are how we know it.'],
  ['hn-bay-islands', 'consequences.populationTransfer', 'The British commissary, in the transport returns', 'British transport and commissary returns for the Garifuna deportation of 1797', 1797, SHIP,
    'The ships’ returns and the Spanish counts of who was still on Roatán months later do not agree, and the record prints both.'],
  ['grenada', 'consequences.violence', 'The British administration of Grenada, in contemporary estimates', 'British estimates of the enslaved dead in Fédon’s rebellion', 1796, CO,
    'Nobody counted the dead among the enslaved. Modern historians treat this as an order of magnitude, and so should a reader.'],
  ['cayman-islands', 'consequences.slavery', 'The Slave Registration Office, Jamaica', 'Jamaican slave registration returns for the Cayman Islands, 1834', 1834,
    'The registers are in T 71 at The National Archives, Kew, and are indexed award by award in the Legacies of British Slavery database at ucl.ac.uk/lbs.',
    'Registration existed to protect owners’ property in people. It is the most precise count on this page for exactly that reason.'],
  ['ni-mosquito-coast', 'mosquito-coast-evacuation-1787', 'The British superintendency of the Mosquito Shore, in its evacuation returns', 'Evacuation returns of the Mosquito Shore, 1787', 1787, SHIP,
    'The returns count people moved. They record no consent because none was asked.'],
  ['caribbean-netherlands', 'sint-eustatius-seizure-1781', 'The merchants’ claims in the English prize courts, and Rodney’s prize accounts', 'Prize court claims and accounts for the seizure of St Eustatius', 1784,
    'High Court of Admiralty prize papers, HCA series, The National Archives, Kew.',
    'Two sets of figures by two interested parties, and they do not agree. The record prints the gap rather than splitting it.'],

  // ---- Middle East and Indian Ocean -------------------------------------
  ['aden-colony', 'aden-storming-1839', 'Captain Stafford Bettesworth Haines, in his own despatches', 'Haines’s despatches on the storming of Aden', 1839, IOR, ASYM],
  ['trucial-states', 'trucial-general-maritime-treaty-1820', 'The British expedition to Ras al-Khaimah, in its own returns', 'British returns of the Ras al-Khaimah expedition of 1819', 1820, IOR,
    'British losses were counted man by man. Arab losses were estimated later, from the size of the town and the length of the bombardment.'],
  ['mesopotamia-iraq', 'iraq-independence-1932', 'British military records of the 1920 revolt, against Iraqi estimates', 'British military records of the Iraqi revolt of 1920', 1921, WO,
    'The Iraqi figures were never systematically compiled, so one side of this comparison is a count and the other is not.'],
  ['british-indian-ocean-territory', 'biot-creation-1965', 'The Chagos plantation registers, and the British and Mauritian counts made afterwards', 'Plantation registers of the Chagos Archipelago and the removal records of 1965–73', 1973,
    'FCO 31 and CO 1036 at The National Archives, Kew, and the evidence rehearsed in the Bancoult judgments.',
    'The registers counted contract workers and residents differently, and people away for medical treatment were simply not counted back. The dispute over the number is a dispute about who was a resident.'],
  ['cyprus', 'cyprus-independence-1960', 'The British administration of Cyprus, in its own casualty returns', 'British security-force casualty returns for the Cyprus emergency, 1955–59', 1960, WO,
    'The categories overlap: an EOKA member killed as an informer appears in more than one total.'],
  ['cyprus', 'consequences.populationTransfer', 'The United Nations, and the Republic of Cyprus', 'UN and Republic of Cyprus figures for the displacement of 1974–75', 1975,
    'UN Security Council and UNFICYP reports, 1974–76, and the Republic of Cyprus Press and Information Office statistics.',
    'Both communities’ totals are politically contested and the Republic’s and Turkey’s counts differ. The atlas prints the range that follows.'],

  // ---- North America -----------------------------------------------------
  ['new-york', 'new-york-independence-1783', 'The British commissioners at New York, in the Book of Negroes', 'The Book of Negroes and the British embarkation returns of 1783', 1783,
    'PRO 30/55/100 at The National Archives, Kew, with a copy at the Nova Scotia Archives; digitised and searchable by name.',
    'The Book of Negroes recorded people by name, age and former owner. It is among the best-documented movements of people in this atlas, and it exists because the Americans wanted them back.'],
  ['east-florida', 'east-florida-transfer-1783', 'The British evacuation commissioners for East Florida', 'Evacuation returns of East Florida, 1783–85', 1785, SHIP, ''],
  ['west-florida', 'west-florida-conquest-1783', 'The British and Spanish commanders at Pensacola, in their own returns', 'British and Spanish returns of the siege of Pensacola', 1781, WO,
    'Two sets of contemporary returns that differ, which is why the figure is a range.'],
  ['nova-scotia', 'nova-scotia-louisbourg-1758', 'The transport masters, in the ships’ returns', 'Ships’ returns of the 1758 deportation from Île Saint-Jean', 1758, SHIP,
    'Close to half of those embarked did not arrive. The returns count both ends of the voyage, which is how that is known.'],
  ['nova-scotia', 'consequences.populationTransfer', 'Acadian parish registers and British shipping records', 'Parish and shipping records of the Acadian deportations, 1755–64', 1764, SHIP,
    'Both series are incomplete, which is why the figure is a range and not a number.'],
  ['prince-edward-island', 'consequences.populationTransfer', 'The transport masters, in the ships’ returns', 'Ships’ returns of the 1758 deportation from Île Saint-Jean', 1758, SHIP,
    'The Duke William and the Violet sank in December 1758 with about 700 people between them.'],

  // ---- South and South-East Asia ----------------------------------------
  ['british-india', 'fall-of-seringapatam-1799', 'The British siege train at Seringapatam, in its own returns', 'British siege returns of the fourth Anglo-Mysore war', 1799, IOR,
    'The attackers’ dead were counted to the man; Tipu’s were estimated, and the civilians killed in the sack of the city were not counted at all.'],
  ['british-india', 'consequences.violence', 'The Government of India’s contemporary estimate, against later scholarly reconstructions', 'The range of partition death estimates, from the official figure of 1948 to the demographic reconstructions built on the 1951 censuses', 1948,
    'The contemporary figure is in the Government of India’s statements to the Constituent Assembly, 1948; the upper end is reconstructed from the 1951 censuses of India and Pakistan.',
    'Nobody counted the partition dead. The low figure is what a government was willing to say in 1948 and the high figure is what demography can bear; the atlas prints both because the gap is the finding.'],
  ['punjab-province', 'punjab-annexation-1849', 'The Company army, in its own returns', 'British returns of the two Anglo-Sikh wars', 1849, IOR,
    'British and Company losses were returned unit by unit. Khalsa losses were never systematically counted.'],
  ['punjab-province', 'punjab-partitioned-1947', 'The contemporary British and Indian official estimates, against later scholarly reconstructions', 'The range of partition death estimates for Punjab, from the official figures of 1947–48 to later reconstructions', 1948,
    'Contemporary estimates are in the records of the Punjab Boundary Force and the Government of India, 1947–48; the reconstructions rest on the 1951 censuses of India and Pakistan.',
    'Most partition deaths happened in Punjab and nobody counted them. Tens of thousands of women were abducted, and that figure is worse recorded still.'],
  ['sindh', 'sindh-conquest-1843', 'Napier’s force, in its own returns', 'British returns of the Sindh campaign of 1843', 1843, IOR, ASYM],
  ['sindh', 'sindh-to-pakistan-1947', 'The Government of Pakistan, in its census reconstructions', 'Census of Pakistan 1951 and its reconstruction of the migration of 1947–48', 1951,
    'Census of Pakistan 1951, Government of Pakistan; the migration tables are reprinted in the provincial reports for Sindh.', ''],
  ['central-provinces-and-berar', 'consequences.violence', 'The Census of India, and the famine mortality reconstructions built on it', 'Census of India 1901, and the Report of the Indian Famine Commission 1901 (Cd. 876)', 1901, PP,
    'All-India figures for the famine of 1899–1900 range from about one to four and a half million and are strongly contested; the provincial figure is firmer than the national one.'],
  ['hyderabad', 'hyderabad-annexed-1947', 'Pandit Sunderlal and the committee of inquiry appointed by the Government of India', 'Report on the Hyderabad disturbances (the Sunderlal report)', 1949,
    'Held unpublished by the Government of India until 2013; a copy is in the Nehru Memorial Museum and Library, New Delhi.',
    'A government commissioned this count, read it, and suppressed it for sixty-four years. Other estimates run to 200,000 and rest on less.'],
  ['hyderabad', 'consequences.violence', 'Pandit Sunderlal and the committee of inquiry appointed by the Government of India', 'Report on the Hyderabad disturbances (the Sunderlal report)', 1949,
    'Held unpublished by the Government of India until 2013; a copy is in the Nehru Memorial Museum and Library, New Delhi.',
    'No independent count was ever made, and the one count that was made stayed secret until 2013.'],
  ['tripura', 'tripura-merged-1947', 'The Census of India', 'Census of India: the 1951, 1961 and 1971 counts for Tripura compared', 1971,
    'Census of India, Office of the Registrar General, New Delhi.',
    'The refugee arrivals are read off the difference between three censuses, not counted at the border.'],
  ['british-burma', 'burma-upper-annexed-1886', 'The British administration of Upper Burma, in its own reports', 'British reports on the pacification of Upper Burma, 1886–90', 1890, IOR,
    'British reports classified the resistance as dacoity, so its dead were counted as criminals where they were counted at all.'],
  ['singapore', 'consequences.violence', 'The Singapore war crimes trial of 1947, and the post-war Chinese community surveys', 'Testimony at the Singapore war crimes trial, and the Chinese community’s own surveys of the Sook Ching', 1947,
    'The trial record is in WO 235 at The National Archives, Kew.',
    'The low figure is what the perpetrators admitted under trial and the high figure is what the survivors counted. The truth is not recoverable, and the range itself is the honest answer.'],
];

/* ------------------------------------------------------------------ run --- */
const firstSentences = (s, n) => {
  const t = String(s || '').trim();
  if (t.length <= 300) return t;
  return t.slice(0, 297) + '…';
};

let wrote = 0; const missing = [];
const seen = new Set();
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const t of data.territories || []) {
    for (const row of ROWS) {
      const [tid, where, author, work, year, check, note] = row;
      if (t.id !== tid) continue;
      let toll = null;
      if (where.startsWith('consequences.')) {
        const key = where.slice('consequences.'.length);
        toll = ((t.consequences || {})[key] || {}).toll || null;
      } else {
        const st = [].concat(t.acquisitions || [], t.departures || []).find((s) => s.id === where);
        toll = st ? st.cost : null;
      }
      if (!toll) continue;
      seen.add(tid + '|' + where);
      if (toll.warrant) continue;
      const w = {
        author, work, year, kind: 'official-record',
        supports: firstSentences(toll.note || toll.money || ''),
        check,
      };
      if (note) w.note = note;
      toll.warrant = w;
      wrote++; touched = true;
    }
  }
  if (touched && !DRY) fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
for (const row of ROWS) if (!seen.has(row[0] + '|' + row[1])) missing.push(row[0] + '/' + row[1]);
console.log('toll warrants written: ' + wrote + ' of ' + ROWS.length + (DRY ? '   (dry run)' : ''));
if (missing.length) { console.log('NOT FOUND:\n  ' + missing.join('\n  ')); process.exit(1); }
