#!/usr/bin/env node
/* one-time: ROUND 7 — the eighteen counterparties that printed an act label
 * over a party whose own `lost` field denied the loss.
 *
 * The class is B1's fourth appearance and the fix is the same shape as the
 * previous three: the RECORD says what happened to each party, so the record
 * must carry the role and the label must come from the role. Nothing here is
 * inferred. Every assignment below is followed by the counterparty's own
 * `lost` sentence, verbatim from the shard, which is the whole warrant for it.
 *
 * tools/check-gloss.js rule `frame/label-contradicts-lost` now fires PER
 * COUNTERPARTY, so a group that mixes a real loser with a non-loser no longer
 * passes clean — which is exactly how these eighteen survived a PASS.
 *
 *   node tools/onetime/tag-non-losers.js
 */
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../../app/data/territories');

/* territory | step | counterparty name (exact) → role, with the record's reason. */
const TAGS = [
  // ---- they lost nothing, ever, by this act -------------------------------
  ['new-york', 'new-york-conquest-1664', 'The Haudenosaunee (Iroquois Confederacy)', 'unchanged',
    '"Nothing in 1664 … the Five Nations dealt with the English as they had with the Dutch, as partners in a Covenant Chain alliance."'],
  ['us-virgin-islands', 'danish-west-indies-occupation-1801', 'The enslaved people of St Croix, St Thomas and St John', 'unchanged',
    '"Nothing, and that is the point: Britain governed under Danish law and left slavery exactly as it found it."'],
  ['british-moluccas', 'moluccas-conquest-1796', 'The people of the Banda and Ambon islands', 'unchanged',
    '"Nothing was returned to them: a change of European flag left the nutmeg plantations … exactly as they were."'],
  ['reunion-british-occupation', 'bourbon-conquest-1810', 'The enslaved population of Bourbon', 'unchanged',
    '"Nothing and gained nothing: Britain did not free them."'],
  ['madagascar-british-occupation', 'madagascar-occupation-1942', 'Malagasy people', 'unchanged',
    '"Nothing they had not already lost to France in 1895-96, and they gained nothing."'],

  // ---- the act was performed over them, and did not dispossess them -------
  ['goa-british-garrison', 'goa-garrisoned-1799', 'The people of Goa', 'covered',
    '"Nothing changed in law; they got a foreign garrison and the trade disruption that came with the blockade."'],
  ['minorca', 'minorca-taken-1708', 'The Menorcans', 'covered',
    '"Nothing immediately: Stanhope guaranteed Catholic worship and the island’s own institutions."'],
  ['libya-british-administration', 'libya-occupation-1943', 'The Sanusi order and the people of Cyrenaica', 'covered',
    '"Nothing to Britain, and much to Italy before it … Britain promised in 1942 that Cyrenaica would never return to Italian rule, and kept that promise."'],

  // ---- the loss came, and the record says it came later -------------------
  ['cape-colony', 'cape-conquest-1795', 'Xhosa chiefdoms of the Zuurveld', 'lost-it-later',
    '"Nothing yet in 1795 - but the new rulers inherited a frontier war and would fight seven more against them."'],
  ['guyana', 'guyana-conquest-1796', 'The Kalina, Lokono, Warao, Akawaio and Macushi nations of the Guianas', 'lost-it-later',
    '"Nothing immediately … but they lost that status as British planters pushed inland during the nineteenth century."'],
  ['bougainville', 'bougainville-occupation-1914', 'The Nasioi, Nagovisi, Buin, Halia and other peoples of Bougainville and Buka', 'lost-it-later',
    '"Nothing they could see at the time - and, in the long run, the right to be part of the Solomon Islands."'],
  ['trinidad', 'trinidad-conquest-1797', 'The French planters of Trinidad', 'lost-it-later',
    '"Nothing at first … but they lost the French legal and social order within a generation."'],

  // ---- they stayed -------------------------------------------------------
  ['falkland-islands', 'falklands-reoccupation-1833', 'The civilian settlers at Puerto Soledad', 'stayed',
    '"Nothing immediately: unlike the garrison, most of the roughly 25 gauchos and settlers were told they could stay, and most did."'],

  // ---- they gained -------------------------------------------------------
  ['jamaica', 'jamaica-conquest-1655', 'The Africans enslaved by the Spanish, who became the first Maroons', 'gained',
    '"Nothing to England — they gained … they took to the mountains and stayed free, founding communities that fought England for eighty-five years."'],

  // ---- they made Britain leave -------------------------------------------
  ['macau-1808', 'macau-landing-1808', 'The Qing Empire', 'drove-it-out',
    '"Nothing, in the end: the Jiaqing Emperor … suspended the Canton trade until the troops left, and won."'],
  ['rio-de-la-plata-invasions', 'buenos-aires-captured-1806', 'The people of Buenos Aires', 'drove-it-out',
    '"Nothing they kept: within seven weeks they had organised their own militias, retaken the city."'],

  // ---- rivals who lost a claim, not a country ----------------------------
  ['canton-and-enderbury', 'canton-british-annexation-1937', 'The United States', 'pre-empted',
    '"Nothing yet - it contested the claim within months … and Britain refused to give way."'],
  ['canton-and-enderbury', 'canton-condominium-1939', 'The United States', 'co-signatory',
    '"Nothing. Britain and the United States each kept their claim alive and shared the airfield." Both signed the 1939 agreement.'],
  ['ascension', 'ascension-garrisoned-1815', 'The United States and France as naval rivals', 'pre-empted',
    'The step’s other counterparty is "No resident population": nothing was taken from anybody living there, and what these two lost was the use of an unclaimed island.'],
  ['tristan-da-cunha', 'tristan-annexation-1816', 'The United States as a maritime rival', 'pre-empted',
    'Same shape as Ascension: "The islands had never been permanently inhabited"; what was closed was an American whaling and sealing station, not a country.'],

  // ---- THE FOURTH SHAPE, found by hand: they handed it over ---------------
  // Not a denial of loss — all three lost, and heavily. What their records deny
  // is the DIRECTION the label asserts: it was not taken out of their hands.
  ['cape-coast-castle', 'cape-coast-castle-taken-1664', 'The state of Fetu', 'granted-it',
    '"Fetu’s ruler had granted the ground and taken rent from Swedes, Danes and Dutch in turn. The English tenancy became permanent and eventually stopped being a tenancy at all."'],
  ['haiti', 'saint-domingue-invasion-1793', 'The royalist planters of Saint-Domingue', 'ceded-it',
    '"Everything, in the end. They invited the British in to save slavery and signed away their colony’s sovereignty by the Whitehall accords."'],
  ['corsica', 'anglo-corsican-kingdom-1794', 'Pasquale Paoli and the Corsican independence movement', 'ceded-it',
    '"The self-rule they had asked Britain to protect. Paoli wanted a British protector; he got a British viceroy." The Corsican assembly voted the crown to George III.'],
  ['heligoland', 'heligoland-taken-1807', 'The Heligolanders', 'gained',
    '"Little at first, and they gained a great deal: the smuggling trade made the island rich, and British rule left their Frisian language, their fishing rights and their tax freedom alone."'],

  // ---- the grant this occupation rested on -------------------------------
  ['balambangan', 'balambangan-second-attempt-1803', 'The Sultanate of Sulu', 'granted-it',
    '"Nothing lasting. The Company returned on the strength of its old grants, without a new agreement."'],
];

let done = 0, missing = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const p = path.join(DIR, file);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  let touched = false;
  for (const t of data.territories || []) {
    for (const [tid, sid, name, role] of TAGS) {
      if (t.id !== tid) continue;
      const st = [].concat(t.acquisitions || [], t.departures || []).find((s) => s.id === sid);
      if (!st) continue;
      const c = (st.counterparties || []).find((x) => x.name === name);
      if (!c) continue;
      if (c.role !== role) { c.role = role; touched = true; done++; }
    }
  }
  if (touched) fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}
/* every row must land: a rename in a shard must break this, not be ignored */
const all = [];
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'index.json' && !f.startsWith('_'))) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
  for (const t of d.territories || []) for (const s of [].concat(t.acquisitions || [], t.departures || []))
    for (const c of s.counterparties || []) all.push(t.id + '|' + s.id + '|' + c.name + '|' + (c.role || ''));
}
for (const [tid, sid, name, role] of TAGS) if (!all.includes(tid + '|' + sid + '|' + name + '|' + role)) missing.push(tid + '/' + sid + '/' + name);
console.log('roles written: ' + done + ' of ' + TAGS.length);
if (missing.length) { console.log('NOT FOUND:\n  ' + missing.join('\n  ')); process.exit(1); }
