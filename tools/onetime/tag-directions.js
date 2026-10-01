#!/usr/bin/env node
/* one-time: write acquisition.direction (and condominium jointlyWith) into the shards.
 * Kept in the repo so the assignment is reviewable, not a ghost edit. */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../../app/data/territories');

const DEFAULTS = {
  'purchase': 'britain-buys',
  'treaty-cession': 'to-britain',
  'war-transfer': 'from-european-power',
  'lease': 'britain-leases-in',
  'annexation-of-existing-colony': 'into-british-rule',
  'occupation': 'british-forces',
  'settlement': 'settlers-landed',
  'chartered-company': 'crown-charter',
};

const BY_ID = {
  /* --- purchase: Britain is the SELLER at Amritsar ------------------- */
  'treaty-of-amritsar-1846': 'britain-sells',
  'kashmir-sold-1846': 'britain-sells',
  'pennsylvania-charter-1681': 'private-buyer',
  'red-river-selkirk-grant-1811': 'private-buyer',
  'north-borneo-grants-1878': 'private-buyer',
  'canada-ruperts-land-purchase-1870': 'dominion-buys',
  'madras-fort-st-george-1639': 'rent-paid',
  'madras-fort-st-george-lease-1639': 'rent-paid',

  /* --- treaty cession: signed how, and by whom ----------------------- */
  'lagos-ceded-1861': 'to-britain-under-duress',
  'nigeria-lagos-1861': 'to-britain-under-duress',
  'hawaii-paulet-cession-1843': 'to-britain-under-duress',
  'labuan-cession-1846': 'to-britain-under-duress',
  'hong-kong-nanking-1842': 'to-britain-under-duress',
  'hong-kong-kowloon-1860': 'to-britain-under-duress',
  'awadh-ceded-provinces-1801': 'to-britain-under-duress',
  'balochistan-gandamak-districts-1879': 'to-britain-under-duress',
  'nz-treaty-of-waitangi-1840': 'to-britain-disputed-text',
  'kedah-bangkok-treaty-1909': 'to-britain-by-a-third-party',
  'kelantan-bangkok-treaty-1909': 'to-britain-by-a-third-party',
  'terengganu-bangkok-treaty-1909': 'to-britain-by-a-third-party',
  'perlis-bangkok-treaty-1909': 'to-britain-by-a-third-party',

  /* --- occupation: whose troops --------------------------------------- */
  'tanganyika-occupation-1916': 'imperial-forces',
  'italian-somaliland-conquest-1941': 'imperial-forces',
  'eritrea-conquest-1941': 'imperial-forces',
  'ethiopia-occupation-1941': 'allied-forces',
  'togoland-occupied-1914': 'allied-forces',
  'cameroons-occupied-1914': 'allied-forces',
  'southern-cameroons-partition-1916': 'allied-forces',
  'northern-cameroons-partition-1916': 'allied-forces',
  'balambangan-second-attempt-1803': 'company-forces',
  'samoa-nz-occupation-1914': 'dominion-forces',
  'nauru-occupation-1914': 'dominion-forces',
  'new-guinea-anmef-1914': 'dominion-forces',
  'bougainville-occupation-1914': 'dominion-forces',
  'british-zone-occupied-1945': 'allied-forces',
  'guadeloupe-capture-1815': 'allied-forces',
  'perim-occupation-1799': 'company-forces',
  'perim-reoccupation-1857': 'british-forces',
  'kamaran-seizure-1915': 'imperial-forces',
  'socotra-occupation-1834': 'company-forces',
  'palestine-occupation-1917': 'imperial-forces',
  'transjordan-occupation-1918': 'allied-forces',
  'syria-oeta-1918': 'allied-forces',
  'syria-operation-exporter-1941': 'allied-forces',
  'constantinople-occupation-1918': 'allied-forces',
  'persia-anglo-soviet-invasion-1941': 'allied-forces',
  'mysore-british-administration-1831': 'administration-taken-over',
  'ceylon-taken-from-dutch-1796': 'company-forces',
  'pondicherry-captured-1793': 'company-forces',
  'indochina-occupation-1945': 'imperial-forces',

  /* --- settlement: a landing, a flag, or a place already lived in ----- */
  'south-georgia-cook-1775': 'claimed-nobody-left',
  'nsw-possession-1770': 'claimed-nobody-left',
  'coral-sea-guano-claims': 'claimed-nobody-left',
  'heard-island-claim-1910': 'claimed-nobody-left',
  'bermuda-wreck-1609': 'claimed-nobody-left',
  'newfoundland-gilbert-1583': 'claimed-nobody-left',
  'british-antarctic-claim-1908': 'claimed-by-proclamation',
  'ross-dependency-claim-1923': 'claimed-by-proclamation',
  'australian-antarctic-claim-1933': 'claimed-by-proclamation',
  'nz-sovereignty-proclamations-1840': 'claimed-by-proclamation',
  'christmas-island-annexation-1888': 'claimed-by-proclamation',
  'andaman-settlement-1858': 'penal-settlement',
  'andaman-penal-colony-1858': 'penal-settlement',
  'norfolk-second-settlement-1825': 'penal-settlement',
  'norfolk-first-settlement-1788': 'penal-settlement',
  'qld-moreton-bay-1824': 'penal-settlement',
  'pitcairn-british-settlement-1838': 'existing-settlement-claimed',
  'cocos-annexation-1857': 'existing-settlement-claimed',

  /* --- chartered company: a Crown grant, or a company putting up a post */
  'bunce-island-factory-1670': 'company-post',
  'gold-coast-kormantin-1631': 'company-post',
  'saint-helena-company-settlement-1659': 'company-post',
  'virginia-jamestown-1607': 'company-post',
  'new-hampshire-piscataqua-1623': 'company-post',
  'south-carolina-charles-town-1670': 'company-post',
  'newfoundland-cupids-1610': 'company-post',
  'surat-factory-1612': 'company-post',
  'bengal-calcutta-founded-1690': 'company-post',
  'bencoolen-founding-1685': 'company-post',
  'northern-rhodesia-company-concessions-1890': 'company-post',
  'uganda-company-treaty-1890': 'company-post',

  /* --- annexation: into British rule, between British hands, or a union */
  'cape-british-bechuanaland-1895': 'between-british-territories',
  'natal-zululand-transfer-1897': 'between-british-territories',
  'rhodesia-crown-annexation-1923': 'between-british-territories',
  'senegambia-charter-1765': 'between-british-territories',
  'south-sandwich-dependencies-1908': 'between-british-territories',
  'nt-annexation-to-sa-1863': 'between-british-territories',
  'biot-creation-1965': 'between-british-territories',
  'new-brunswick-loyalist-province-1784': 'between-british-territories',
  'prince-edward-island-separate-colony-1769': 'between-british-territories',
  'upper-canada-constitutional-act-1791': 'between-british-territories',
  'british-columbia-proclamation-1858': 'between-british-territories',
  'north-west-territories-transfer-1870': 'between-british-territories',
  'canada-british-columbia-1871': 'between-british-territories',
  'canada-prince-edward-island-1873': 'between-british-territories',
  'canada-newfoundland-1949': 'between-british-territories',
  'assam-sylhet-attached-1874': 'between-british-territories',
  'straits-labuan-1907': 'between-british-territories',
  'south-africa-union-1910': 'union-of-territories',
  'central-african-federation-1953': 'union-of-territories',
  'australia-federation-1901': 'union-of-territories',
  'canada-confederation-1867': 'union-of-territories',
  'union-with-scotland-1707': 'union-of-territories',
  'straits-union-1826': 'union-of-territories',
  'malaya-union-1946': 'union-of-territories',
  'fms-federation-1896': 'union-of-territories',
  'channel-islands-kept-1204': 'retained-not-taken',
  'guernsey-kept-1204': 'retained-not-taken',
};

const JOINTLY = {
  'sudan-condominium-1899': 'Egypt',
  'canton-condominium-1939': 'the United States',
  'new-hebrides-condominium-1906': 'France',
  'oregon-joint-occupation-1818': 'the United States',
};

let touched = 0; const defaulted = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const raw = fs.readFileSync(p, 'utf8');
  const data = JSON.parse(raw);
  for (const t of data.territories || []) {
    for (const a of t.acquisitions || []) {
      if (JOINTLY[a.id]) { a.jointlyWith = JOINTLY[a.id]; touched++; }
      const d = BY_ID[a.id] || DEFAULTS[a.mechanism];
      if (!d) continue;
      if (!BY_ID[a.id]) defaulted.push(`${a.mechanism}\t${d}\t${a.id}`);
      a.direction = d; touched++;
    }
  }
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
console.log(`wrote ${touched} field(s)`);
console.log(`took the mechanism default: ${defaulted.length}`);
if (process.argv.includes('--list')) console.log(defaulted.sort().join('\n'));
