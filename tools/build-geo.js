#!/usr/bin/env node
'use strict';
/**
 * build-geo.js — the historical geography pipeline for the British Empire Atlas.
 *
 * Open historical boundary polygons at the fidelity this atlas needs do not exist.
 * So we synthesise them: we build a stable vocabulary of ~380 "geo units" out of
 * modern Natural Earth boundaries, split wherever empire history demands it, and the
 * territory dataset composes historical polities as *unions of units* at any year.
 *
 * Inputs  : Natural Earth 10m/50m vector GeoJSON, cached in tools/.cache (public domain).
 * Outputs : app/data/geo/units-coarse.topo.json   world-zoom geometry
 *           app/data/geo/units-fine.topo.json     region-zoom geometry
 *           app/data/geo/units.index.json         THE VOCABULARY (ids, names, aliases, points)
 *           app/data/geo/land.topo.json           base map: land, lakes, graticule
 *           app/data/geo/README.md                provenance + splitting decisions
 *
 * Run: node tools/build-geo.js            (offline once tools/.cache is populated)
 *      node tools/build-geo.js --refetch  (re-download the Natural Earth sources)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const mapshaper = require('mapshaper');
const topojson = require('topojson-client');
const d3 = require('d3-geo');

const ROOT = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(ROOT, 'app', 'data', 'geo');
const NE_BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const NE_FILES = [
  'ne_10m_admin_0_map_units',
  'ne_10m_admin_1_states_provinces',
  'ne_10m_admin_0_disputed_areas',
  'ne_50m_land',
  'ne_10m_lakes',
];

const R_EARTH = 6371.0088;            // km, IUGG mean radius
const TINY_KM2 = 6000;                // below this a unit needs a marker at world zoom
const SIMPLIFY_FINE = '60%';
const SIMPLIFY_COARSE = '10%';
const QUANT_FINE = '1e6';
const QUANT_COARSE = '1e5';

// ---------------------------------------------------------------------------
// 0. tiny helpers
// ---------------------------------------------------------------------------
const log = (...a) => console.log(...a);
const warnings = [];
const warn = (m) => { warnings.push(m); console.warn('  ! ' + m); };

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'user-agent': 'british-empire-atlas/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return resolve(get(res.headers.location));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(url + ' -> HTTP ' + res.statusCode)); }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function ensureSources(refetch) {
  fs.mkdirSync(CACHE, { recursive: true });
  for (const name of NE_FILES) {
    const f = path.join(CACHE, name + '.geojson');
    if (!refetch && fs.existsSync(f) && fs.statSync(f).size > 1000) continue;
    log('  downloading ' + name + ' ...');
    fs.writeFileSync(f, await get(NE_BASE + name + '.geojson'));
  }
}

const readNE = (n) => JSON.parse(fs.readFileSync(path.join(CACHE, n + '.geojson'), 'utf8'));

/** Run mapshaper on in-memory GeoJSON/TopoJSON objects. */
async function ms(commands, inputs) {
  const files = {};
  for (const k of Object.keys(inputs)) files[k] = Buffer.from(JSON.stringify(inputs[k]));
  const out = await mapshaper.applyCommands(commands, files);
  const parsed = {};
  for (const k of Object.keys(out)) parsed[k] = JSON.parse(Buffer.from(out[k]).toString('utf8'));
  return parsed;
}

// ---------------------------------------------------------------------------
// 1. THE UNIT TABLE
// ---------------------------------------------------------------------------
// Each unit declares where its geometry comes from:
//   mu:      Natural Earth 10m admin-0 *map unit* codes (GU_A3)
//   a1:      [adm0_a3, [admin-1 names...]]     — named provinces/states/regions
//   a1rest:  [adm0_a3, [names to exclude...]]  — everything else in that country
// `drop: true` marks scaffolding that only exists to be carved up (see CARVES).
const UNITS = [];
const CTX = { region: '', sov: '', iso: '', kind: 'subnational' };
const ctx = (o) => Object.assign(CTX, o);
function u(id, name, opts = {}) {
  UNITS.push({
    id, name,
    aliases: opts.aliases || [],
    kind: opts.kind || CTX.kind,
    sovereign_today: opts.sov || CTX.sov,
    iso_a2: opts.iso !== undefined ? opts.iso : CTX.iso,
    region: opts.region || CTX.region,
    note: opts.note || '',
    mu: opts.mu || null,
    a1: opts.a1 || null,
    a1rest: opts.a1rest || null,
    drop: !!opts.drop,
  });
}

/* ===================== BRITISH ISLES & IRELAND ===================== */
ctx({ region: 'British Isles & Ireland', sov: 'United Kingdom', iso: 'GB', kind: 'subnational' });
u('gb-england', 'England', { mu: ['ENG'], aliases: ['Kingdom of England'] });
u('gb-scotland', 'Scotland', { mu: ['SCT'], aliases: ['Kingdom of Scotland'] });
u('gb-wales', 'Wales', { mu: ['WLS'], aliases: ['Cymru'] });
u('gb-northern-ireland', 'Northern Ireland', { mu: ['NIR'], aliases: ['the Six Counties', 'Ulster (six counties)'] });
ctx({ kind: 'dependency' });
u('isle-of-man', 'Isle of Man', { mu: ['IMN'], iso: 'IM', aliases: ['Mann', 'Ellan Vannin'] });
u('jersey', 'Jersey', { mu: ['JEY'], iso: 'JE', aliases: ['Bailiwick of Jersey', 'Channel Islands'] });
u('guernsey', 'Guernsey', { mu: ['GGY'], iso: 'GG', aliases: ['Bailiwick of Guernsey', 'Alderney', 'Sark', 'Channel Islands'] });
ctx({ sov: 'Ireland', iso: 'IE', kind: 'subnational' });
u('ie-leinster', 'Leinster', { a1: ['IRL', ['Carlow', 'Dublin', 'Dún Laoghaire–Rathdown', 'Fingal', 'South Dublin', 'Kildare', 'Kilkenny', 'Laoighis', 'Longford', 'Louth', 'Meath', 'Offaly', 'Westmeath', 'Wexford', 'Wicklow']], aliases: ['Laighin', 'Dublin', 'the Pale'] });
u('ie-munster', 'Munster', { a1: ['IRL', ['Clare', 'Cork', 'Kerry', 'Limerick', 'North Tipperary', 'South Tipperary', 'Waterford']], aliases: ['An Mhumhain', 'Cork', 'Munster Plantation'] });
u('ie-connacht', 'Connacht', { a1: ['IRL', ['Galway', 'Leitrim', 'Mayo', 'Roscommon', 'Sligo']], aliases: ['Connaught', 'Cromwellian transplantation'] });
u('ie-ulster-counties', 'Ulster (Cavan, Donegal, Monaghan)', { a1: ['IRL', ['Cavan', 'Donegal', 'Monaghan']], aliases: ['Ulster (three counties)', 'Plantation of Ulster (part)'] });

/* ===================== EUROPE & THE MEDITERRANEAN ===================== */
ctx({ region: 'Europe & the Mediterranean', kind: 'dependency', sov: 'United Kingdom', iso: 'GB' });
u('gibraltar', 'Gibraltar', { mu: ['GIB'], iso: 'GI', aliases: ['the Rock'] });
u('cy-akrotiri-dhekelia', 'Akrotiri and Dhekelia', { mu: ['WSB', 'ESB'], aliases: ['Sovereign Base Areas', 'SBA'] });
ctx({ kind: 'country' });
u('malta', 'Malta', { mu: ['MLT'], sov: 'Malta', iso: 'MT', aliases: ['Malta and Gozo'] });
u('cyprus', 'Cyprus', { mu: ['CYP', 'CYN', 'CNM'], sov: 'Cyprus', iso: 'CY' });
ctx({ kind: 'subnational' });
u('gr-ionian-islands', 'Ionian Islands', { a1: ['GRC', ['Ionioi Nisoi']], sov: 'Greece', iso: 'GR', aliases: ['United States of the Ionian Islands', 'Corfu', 'Kerkyra', 'Zante', 'Cephalonia'] });
u('es-minorca', 'Minorca', { sov: 'Spain', iso: 'ES', aliases: ['Menorca', 'Port Mahon'], note: 'Carved from the Spanish Balearic Islands by bounding box.' });
u('de-heligoland', 'Heligoland', { sov: 'Germany', iso: 'DE', aliases: ['Helgoland'], note: 'Carved from Schleswig-Holstein by bounding box.' });
u('de-british-zone', 'British Zone of Occupation (Germany)', { a1: ['DEU', ['Schleswig-Holstein', 'Niedersachsen', 'Nordrhein-Westfalen', 'Hamburg', 'Bremen']], sov: 'Germany', iso: 'DE', aliases: ['British Zone', 'Hamburg', 'Ruhr', 'Bizone'] });
u('fr-corsica', 'Corsica', { a1: ['FRA', ['Haute-Corse', 'Corse-du-Sud']], sov: 'France', iso: 'FR', aliases: ['Anglo-Corsican Kingdom', 'Corse'] });
u('pt-madeira', 'Madeira', { a1: ['PRT', ['Madeira']], sov: 'Portugal', iso: 'PT' });
u('pt-azores', 'Azores', { a1: ['PRT', ['Azores']], sov: 'Portugal', iso: 'PT', aliases: ['Açores'] });
ctx({ kind: 'country' });
u('iceland', 'Iceland', { mu: ['ISL'], sov: 'Iceland', iso: 'IS' });
u('faroe-islands', 'Faroe Islands', { mu: ['FRO'], sov: 'Denmark', iso: 'FO', aliases: ['Føroyar'] });

/* ===================== BRITISH NORTH AMERICA ===================== */
ctx({ region: 'British North America (Canada)', sov: 'Canada', iso: 'CA', kind: 'subnational' });
u('ca-nova-scotia', 'Nova Scotia', { a1: ['CAN', ['Nova Scotia']], aliases: ['Acadia (part)', 'Cape Breton Island'] });
u('ca-new-brunswick', 'New Brunswick', { a1: ['CAN', ['New Brunswick']] });
u('ca-prince-edward-island', 'Prince Edward Island', { a1: ['CAN', ['Prince Edward Island']], aliases: ['Île Saint-Jean', 'St John’s Island'] });
u('ca-newfoundland-labrador', 'Newfoundland and Labrador', { a1: ['CAN', ['Newfoundland and Labrador']], aliases: ['Colony of Newfoundland', 'Dominion of Newfoundland', 'Labrador'] });
u('ca-quebec', 'Quebec', { a1: ['CAN', ['Québec']], aliases: ['Lower Canada', 'Canada East', 'Province of Quebec', 'Bas-Canada'] });
u('ca-ontario', 'Ontario', { a1: ['CAN', ['Ontario']], aliases: ['Upper Canada', 'Canada West', 'Haut-Canada'] });
u('ca-manitoba', 'Manitoba', { a1: ['CAN', ['Manitoba']], aliases: ['Red River Colony', 'Assiniboia', 'Rupert’s Land (part)'] });
u('ca-saskatchewan', 'Saskatchewan', { a1: ['CAN', ['Saskatchewan']], aliases: ['North-West Territories (part)', 'Rupert’s Land (part)'] });
u('ca-alberta', 'Alberta', { a1: ['CAN', ['Alberta']], aliases: ['North-West Territories (part)', 'Rupert’s Land (part)'] });
u('ca-british-columbia', 'British Columbia (mainland)', { a1: ['CAN', ['British Columbia']], aliases: ['Colony of British Columbia', 'New Caledonia (fur district)'] });
u('ca-vancouver-island', 'Vancouver Island', { aliases: ['Colony of Vancouver Island', 'Victoria'], note: 'Carved from British Columbia by an approximate polygon; the Gulf and Discovery Islands are apportioned roughly.' });
u('ca-yukon', 'Yukon', { a1: ['CAN', ['Yukon']], aliases: ['Yukon Territory', 'Klondike'] });
u('ca-northwest-territories', 'Northwest Territories', { a1: ['CAN', ['Northwest Territories']], aliases: ['North-Western Territory', 'Rupert’s Land (part)'] });
u('ca-nunavut', 'Nunavut', { a1: ['CAN', ['Nunavut']], aliases: ['Arctic Archipelago', 'Rupert’s Land (part)'] });

/* ===================== THIRTEEN COLONIES & THE LOST AMERICAN EMPIRE ===================== */
ctx({ region: 'Thirteen Colonies & North American mainland', sov: 'United States', iso: 'US', kind: 'subnational' });
u('us-massachusetts', 'Massachusetts', { a1: ['USA', ['Massachusetts']], aliases: ['Massachusetts Bay', 'Plymouth Colony'] });
u('us-maine', 'Maine', { a1: ['USA', ['Maine']], aliases: ['District of Maine'] });
u('us-new-hampshire', 'New Hampshire', { a1: ['USA', ['New Hampshire']] });
u('us-vermont', 'Vermont', { a1: ['USA', ['Vermont']], aliases: ['New Hampshire Grants'] });
u('us-rhode-island', 'Rhode Island', { a1: ['USA', ['Rhode Island']], aliases: ['Rhode Island and Providence Plantations'] });
u('us-connecticut', 'Connecticut', { a1: ['USA', ['Connecticut']] });
u('us-new-york', 'New York', { a1: ['USA', ['New York']], aliases: ['New Netherland', 'Province of New York'] });
u('us-new-jersey', 'New Jersey', { a1: ['USA', ['New Jersey']], aliases: ['East Jersey', 'West Jersey'] });
u('us-pennsylvania', 'Pennsylvania', { a1: ['USA', ['Pennsylvania']] });
u('us-delaware', 'Delaware', { a1: ['USA', ['Delaware']], aliases: ['the Lower Counties'] });
u('us-maryland', 'Maryland', { a1: ['USA', ['Maryland', 'District of Columbia']] });
u('us-virginia', 'Virginia', { a1: ['USA', ['Virginia', 'West Virginia']], aliases: ['Jamestown', 'Colony of Virginia'] });
u('us-north-carolina', 'North Carolina', { a1: ['USA', ['North Carolina']], aliases: ['Carolina (north)', 'Roanoke'] });
u('us-south-carolina', 'South Carolina', { a1: ['USA', ['South Carolina']], aliases: ['Carolina (south)'] });
u('us-georgia', 'Georgia', { a1: ['USA', ['Georgia']], aliases: ['Province of Georgia'] });
u('us-florida', 'Florida', { a1: ['USA', ['Florida']], aliases: ['East Florida', 'Spanish Florida'] });
u('us-west-florida', 'West Florida (Gulf coast)', { aliases: ['British West Florida', 'Mobile', 'Natchez'], note: 'Approximate: the Gulf strip of Alabama, Mississippi and Louisiana south of 32°28′N, carved by bounding box. The Florida panhandle part of British West Florida sits inside us-florida.' });
u('us-gulf-interior', 'Alabama, Mississippi and Louisiana (interior)', { a1: ['USA', ['Alabama', 'Mississippi', 'Louisiana']], aliases: ['Mississippi Territory', 'Louisiana (part)'] });
u('us-northwest-territory', 'Old Northwest', { a1: ['USA', ['Ohio', 'Indiana', 'Illinois', 'Michigan', 'Wisconsin']], aliases: ['Northwest Territory', 'Ohio Country', 'the western posts'] });
u('us-kentucky-tennessee', 'Kentucky and Tennessee', { a1: ['USA', ['Kentucky', 'Tennessee']], aliases: ['trans-Appalachian West'] });
u('us-oregon-country', 'Oregon Country', { a1: ['USA', ['Oregon', 'Washington', 'Idaho']], aliases: ['Columbia District', 'Oregon Territory'] });
u('us-alaska', 'Alaska', { a1: ['USA', ['Alaska']], aliases: ['Russian America'] });

/* ===================== THE CARIBBEAN & ATLANTIC AMERICAS ===================== */
ctx({ region: 'Caribbean & western Atlantic', sov: 'United Kingdom', iso: 'GB', kind: 'dependency' });
u('bermuda', 'Bermuda', { mu: ['BMU'], iso: 'BM', aliases: ['Somers Isles'] });
u('bahamas', 'The Bahamas', { mu: ['BHS'], sov: 'Bahamas', iso: 'BS', kind: 'country', aliases: ['Bahama Islands', 'New Providence', 'Nassau'] });
u('turks-caicos-islands', 'Turks and Caicos Islands', { mu: ['TCA'], iso: 'TC' });
u('cayman-islands', 'Cayman Islands', { mu: ['CYM'], iso: 'KY' });
u('jamaica', 'Jamaica', { mu: ['JAM'], sov: 'Jamaica', iso: 'JM', kind: 'country', aliases: ['Port Royal', 'Kingston'] });
u('british-virgin-islands', 'British Virgin Islands', { mu: ['VGB'], iso: 'VG', aliases: ['Tortola', 'Virgin Gorda'] });
u('anguilla', 'Anguilla', { mu: ['AIA'], iso: 'AI' });
u('montserrat', 'Montserrat', { mu: ['MSR'], iso: 'MS' });
ctx({ kind: 'country' });
u('antigua', 'Antigua', { mu: ['ACA'], sov: 'Antigua and Barbuda', iso: 'AG', aliases: ['English Harbour'] });
u('barbuda', 'Barbuda', { mu: ['ACB'], sov: 'Antigua and Barbuda', iso: 'AG' });
u('saint-kitts', 'Saint Kitts', { a1: ['KNA', ['Saint Paul Capesterre', 'Saint Anne Sandy Point', 'Saint Thomas Middle Island', 'Trinity Palmetto Point', 'Saint George Basseterre', 'Saint Peter Basseterre', 'Saint Mary Cayon', 'Christ Church Nichola Town', 'Saint John Capesterre']], sov: 'Saint Kitts and Nevis', iso: 'KN', aliases: ['St Christopher', 'Basseterre'] });
u('nevis', 'Nevis', { a1: ['KNA', ['Saint Paul Charlestown', 'Saint John Figtree', 'Saint George Gingerland', 'Saint James Windward', 'Saint Thomas Lowland']], sov: 'Saint Kitts and Nevis', iso: 'KN', aliases: ['Charlestown'] });
u('dominica', 'Dominica', { mu: ['DMA'], sov: 'Dominica', iso: 'DM' });
u('saint-lucia', 'Saint Lucia', { mu: ['LCA'], sov: 'Saint Lucia', iso: 'LC' });
u('saint-vincent', 'Saint Vincent and the Grenadines', { mu: ['VCT'], sov: 'Saint Vincent and the Grenadines', iso: 'VC', aliases: ['Kingstown', 'the Grenadines'] });
u('grenada', 'Grenada', { mu: ['GRD'], sov: 'Grenada', iso: 'GD', aliases: ['Carriacou'] });
u('barbados', 'Barbados', { mu: ['BRB'], sov: 'Barbados', iso: 'BB', aliases: ['Bridgetown', 'Little England'] });
u('trinidad', 'Trinidad', { a1rest: ['TTO', ['Eastern Tobago', 'Western Tobago']], sov: 'Trinidad and Tobago', iso: 'TT', aliases: ['Port of Spain'] });
u('tobago', 'Tobago', { a1: ['TTO', ['Eastern Tobago', 'Western Tobago']], sov: 'Trinidad and Tobago', iso: 'TT', aliases: ['Scarborough'] });
u('guadeloupe', 'Guadeloupe', { mu: ['GLP'], sov: 'France', iso: 'GP', kind: 'dependency' });
u('martinique', 'Martinique', { mu: ['MTQ'], sov: 'France', iso: 'MQ', kind: 'dependency' });
u('saint-martin', 'Saint-Martin', { mu: ['MAF', 'SXM'], sov: 'France / Netherlands', iso: 'MF', kind: 'dependency', aliases: ['Sint Maarten'] });
u('saint-barthelemy', 'Saint-Barthélemy', { mu: ['BLM'], sov: 'France', iso: 'BL', kind: 'dependency' });
u('curacao', 'Curaçao', { mu: ['CUW'], sov: 'Netherlands', iso: 'CW', kind: 'dependency' });
u('aruba', 'Aruba', { mu: ['ABW'], sov: 'Netherlands', iso: 'AW', kind: 'dependency' });
u('caribbean-netherlands', 'Bonaire, Sint Eustatius and Saba', { mu: ['NLY'], sov: 'Netherlands', iso: 'BQ', kind: 'dependency', aliases: ['Statia', 'Dutch Leeward Islands'] });
u('us-virgin-islands', 'US Virgin Islands', { mu: ['VIR'], sov: 'United States', iso: 'VI', kind: 'dependency', aliases: ['Danish West Indies', 'St Croix', 'St Thomas'] });
u('puerto-rico', 'Puerto Rico', { mu: ['PRI'], sov: 'United States', iso: 'PR', kind: 'dependency' });
u('cuba', 'Cuba', { mu: ['CUB', 'USG'], sov: 'Cuba', iso: 'CU', aliases: ['Havana'] });
u('haiti', 'Haiti', { mu: ['HTI'], sov: 'Haiti', iso: 'HT', aliases: ['Saint-Domingue'] });
u('dominican-republic', 'Dominican Republic', { mu: ['DOM'], sov: 'Dominican Republic', iso: 'DO', aliases: ['Santo Domingo'] });

/* ===================== CENTRAL & SOUTH AMERICA ===================== */
ctx({ region: 'Central & South America', kind: 'country' });
u('belize', 'Belize', { mu: ['BLZ'], sov: 'Belize', iso: 'BZ', aliases: ['British Honduras', 'Bay of Honduras', 'the Baymen'] });
u('guyana', 'Guyana', { mu: ['GUY'], sov: 'Guyana', iso: 'GY', aliases: ['British Guiana', 'Demerara', 'Essequibo', 'Berbice'] });
u('suriname', 'Suriname', { mu: ['SUR'], sov: 'Suriname', iso: 'SR', aliases: ['Dutch Guiana', 'Surinam'] });
u('french-guiana', 'French Guiana', { mu: ['GUF'], sov: 'France', iso: 'GF', kind: 'dependency', aliases: ['Guyane'] });
u('hn-bay-islands', 'Bay Islands', { a1: ['HND', ['Islas de la Bahía']], sov: 'Honduras', iso: 'HN', kind: 'subnational', aliases: ['Islas de la Bahía', 'Roatán', 'Colony of the Bay Islands'] });
u('uruguay', 'Uruguay', { mu: ['URY'], sov: 'Uruguay', iso: 'UY', aliases: ['Banda Oriental', 'Montevideo'] });
u('ar-buenos-aires', 'Buenos Aires province', { a1: ['ARG', ['Buenos Aires', 'Ciudad de Buenos Aires']], sov: 'Argentina', iso: 'AR', kind: 'subnational', aliases: ['Río de la Plata', 'Buenos Ayres'] });
u('ni-mosquito-coast', 'Mosquito Coast', { a1: ['NIC', ['Atlántico Norte', 'Atlántico Sur']], sov: 'Nicaragua', iso: 'NI', kind: 'subnational', aliases: ['Mosquitia', 'Miskito Coast', 'Bluefields'] });
ctx({ sov: 'United Kingdom', iso: 'GB', kind: 'dependency' });
u('falkland-islands', 'Falkland Islands', { mu: ['FLK'], iso: 'FK', aliases: ['Islas Malvinas', 'Port Stanley'] });
u('south-georgia', 'South Georgia', { mu: ['SGS'], iso: 'GS', aliases: ['Grytviken', 'Falkland Islands Dependencies'] });
u('south-sandwich-islands', 'South Sandwich Islands', { iso: 'GS', aliases: ['Southern Thule'], note: 'Carved from the South Georgia and the Islands map unit by bounding box.' });

/* ===================== WEST AFRICA ===================== */
ctx({ region: 'West Africa', kind: 'country', sov: '', iso: '' });
u('gambia', 'The Gambia', { mu: ['GMB'], sov: 'Gambia', iso: 'GM', aliases: ['Bathurst', 'Banjul', 'James Island'] });
u('senegal', 'Senegal', { mu: ['SEN'], sov: 'Senegal', iso: 'SN', aliases: ['Senegambia', 'Gorée', 'Saint-Louis', 'French West Africa'] });
u('equatorial-guinea', 'Equatorial Guinea', { mu: ['GNQ'], sov: 'Equatorial Guinea', iso: 'GQ', aliases: ['Fernando Pó', 'Bioko', 'Clarence', 'Port Clarence'] });
ctx({ kind: 'subnational', sov: 'Sierra Leone', iso: 'SL' });
u('sl-freetown-colony', 'Sierra Leone Colony (Freetown)', { a1: ['SLE', ['Western']], aliases: ['Freetown', 'Province of Freedom', 'Western Area'] });
u('sl-protectorate', 'Sierra Leone Protectorate', { a1: ['SLE', ['Northern', 'Eastern', 'Southern']], aliases: ['Sierra Leone hinterland'] });
ctx({ sov: 'Ghana', iso: 'GH' });
u('gh-gold-coast-colony', 'Gold Coast Colony', { a1: ['GHA', ['Western', 'Central', 'Greater Accra', 'Eastern']], aliases: ['Cape Coast', 'Accra', 'Elmina'] });
u('gh-ashanti', 'Ashanti', { a1: ['GHA', ['Ashanti', 'Brong Ahafo']], aliases: ['Asante', 'Kumasi', 'Asanteman'] });
u('gh-northern-territories', 'Northern Territories of the Gold Coast', { a1: ['GHA', ['Northern', 'Upper East', 'Upper West']], aliases: ['Tamale'] });
u('gh-british-togoland', 'British Togoland', { a1: ['GHA', ['Volta']], aliases: ['Trans-Volta Togoland', 'Volta Region'], note: 'Volta Region plus a carved strip of the Northern Territories; the 1956 plebiscite boundary is approximated.' });
ctx({ sov: 'Togo', iso: 'TG' });
u('tg-french-togoland', 'French Togoland', { mu: ['TGO'], kind: 'country', aliases: ['Togo', 'Togoland (French mandate)'] });
ctx({ sov: 'Nigeria', iso: 'NG', kind: 'subnational' });
u('ng-lagos', 'Lagos', { a1: ['NGA', ['Lagos']], aliases: ['Colony of Lagos', 'Eko'] });
u('ng-southern-nigeria', 'Southern Nigeria', { a1: ['NGA', ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti', 'Edo', 'Delta', 'Bayelsa', 'Rivers', 'Imo', 'Abia', 'Anambra', 'Enugu', 'Ebonyi', 'Akwa Ibom', 'Cross River']], aliases: ['Niger Coast Protectorate', 'Oil Rivers Protectorate', 'Biafra', 'Benin', 'Yorubaland'] });
u('ng-northern-nigeria', 'Northern Nigeria', { a1: ['NGA', ['Sokoto', 'Kebbi', 'Zamfara', 'Katsina', 'Kano', 'Jigawa', 'Yobe', 'Borno', 'Bauchi', 'Gombe', 'Adamawa', 'Taraba', 'Plateau', 'Nassarawa', 'Niger', 'Kwara', 'Kogi', 'Benue', 'Kaduna', 'Federal Capital Territory']], aliases: ['Sokoto Caliphate', 'Kano', 'Northern Nigeria Protectorate'] });
u('ng-british-northern-cameroons', 'British Northern Cameroons', { aliases: ['Northern Cameroons', 'Dikwa', 'Sardauna'], note: 'Approximate: the strip of Borno, Adamawa and Taraba that voted to join Nigeria in 1961, carved from Northern Nigeria by polygon.' });
ctx({ sov: 'Cameroon', iso: 'CM' });
u('cm-british-southern-cameroons', 'British Southern Cameroons', { a1: ['CMR', ['Nord-Ouest', 'Sud-Ouest']], aliases: ['Southern Cameroons', 'Ambazonia', 'Buea', 'Bamenda'] });
u('cm-french-cameroun', 'French Cameroun', { a1rest: ['CMR', ['Nord-Ouest', 'Sud-Ouest']], aliases: ['Kamerun', 'Cameroun', 'Yaoundé'] });

/* ===================== EAST AFRICA & THE NILE ===================== */
ctx({ region: 'East Africa & the Nile', kind: 'country', sov: '', iso: '' });
u('kenya', 'Kenya', { mu: ['KEN'], sov: 'Kenya', iso: 'KE', aliases: ['British East Africa', 'East Africa Protectorate', 'Mombasa', 'Nairobi'] });
u('uganda', 'Uganda', { mu: ['UGA'], sov: 'Uganda', iso: 'UG', aliases: ['Uganda Protectorate', 'Buganda', 'Kampala'] });
ctx({ kind: 'subnational', sov: 'Tanzania', iso: 'TZ' });
u('tz-tanganyika', 'Tanganyika', { a1rest: ['TZA', ['Zanzibar South and Central', 'Kaskazini-Unguja', 'Zanzibar West', 'Kusini-Pemba', 'Kaskazini-Pemba']], aliases: ['German East Africa', 'Deutsch-Ostafrika', 'Dar es Salaam'] });
u('tz-zanzibar', 'Zanzibar', { a1: ['TZA', ['Zanzibar South and Central', 'Kaskazini-Unguja', 'Zanzibar West', 'Kusini-Pemba', 'Kaskazini-Pemba']], aliases: ['Unguja', 'Pemba', 'Sultanate of Zanzibar', 'Stone Town'] });
ctx({ kind: 'country' });
u('so-british-somaliland', 'British Somaliland', { mu: ['SOL'], sov: 'Somaliland (unrecognised) / Somalia', iso: 'SO', aliases: ['Somaliland', 'Berbera', 'Hargeisa'] });
u('so-italian-somaliland', 'Italian Somaliland', { mu: ['SOX', 'SOP'], sov: 'Somalia', iso: 'SO', aliases: ['Somalia', 'Mogadishu', 'Puntland'] });
u('ethiopia', 'Ethiopia', { mu: ['ETH'], sov: 'Ethiopia', iso: 'ET', aliases: ['Abyssinia', 'Italian East Africa (part)'] });
u('eritrea', 'Eritrea', { mu: ['ERI'], sov: 'Eritrea', iso: 'ER', aliases: ['Italian Eritrea', 'Asmara'] });
u('djibouti', 'Djibouti', { mu: ['DJI'], sov: 'Djibouti', iso: 'DJ', aliases: ['French Somaliland', 'Obock'] });
u('sudan', 'Sudan', { mu: ['SDN'], sov: 'Sudan', iso: 'SD', aliases: ['Anglo-Egyptian Sudan (north)', 'Khartoum', 'Omdurman', 'Mahdist State'] });
u('south-sudan', 'South Sudan', { mu: ['SDS'], sov: 'South Sudan', iso: 'SS', aliases: ['Anglo-Egyptian Sudan (south)', 'Equatoria', 'Juba'] });
u('egypt', 'Egypt (outside the Canal Zone)', { a1rest: ['EGY', ['Al Isma`iliyah', 'As Suways', 'Bur Sa`id']], mu: ['BRT'], sov: 'Egypt', iso: 'EG', aliases: ['Khedivate of Egypt', 'Sultanate of Egypt', 'Cairo', 'Alexandria'] });
u('eg-suez-canal-zone', 'Suez Canal Zone', { a1: ['EGY', ['Al Isma`iliyah', 'As Suways', 'Bur Sa`id']], sov: 'Egypt', iso: 'EG', kind: 'subnational', aliases: ['Suez Canal', 'Ismailia', 'Port Said', 'Suez Base'] });
u('libya', 'Libya', { mu: ['LBY'], sov: 'Libya', iso: 'LY', aliases: ['Cyrenaica', 'Tripolitania', 'Italian Libya'] });
u('madagascar', 'Madagascar', { mu: ['MDG'], sov: 'Madagascar', iso: 'MG', aliases: ['Merina Kingdom', 'Antananarivo', 'Diego Suarez'] });
u('reunion', 'Réunion', { mu: ['REU'], sov: 'France', iso: 'RE', kind: 'dependency', aliases: ['Bourbon', 'Île Bonaparte'] });
u('rwanda', 'Rwanda', { mu: ['RWA'], sov: 'Rwanda', iso: 'RW', aliases: ['Ruanda-Urundi', 'German East Africa (part)'] });
u('burundi', 'Burundi', { mu: ['BDI'], sov: 'Burundi', iso: 'BI', aliases: ['Ruanda-Urundi', 'German East Africa (part)'] });

/* ===================== SOUTHERN AFRICA ===================== */
ctx({ region: 'Southern Africa', kind: 'subnational', sov: 'South Africa', iso: 'ZA' });
u('za-cape-colony', 'Cape Colony', { a1: ['ZAF', ['Western Cape', 'Eastern Cape', 'Northern Cape']], aliases: ['Cape of Good Hope', 'Kaapkolonie', 'British Kaffraria', 'Griqualand West', 'Cape Town'] });
u('za-natal', 'Natal', { a1: ['ZAF', ['KwaZulu-Natal']], aliases: ['Zululand', 'Durban', 'Port Natal', 'KwaZulu'] });
u('za-transvaal', 'Transvaal', { a1: ['ZAF', ['Limpopo', 'Mpumalanga', 'Gauteng', 'North West']], aliases: ['South African Republic', 'Zuid-Afrikaansche Republiek', 'ZAR', 'Witwatersrand', 'Pretoria', 'Johannesburg'] });
u('za-orange-free-state', 'Orange Free State', { a1: ['ZAF', ['Free State']], aliases: ['Oranje-Vrystaat', 'Orange River Colony', 'Bloemfontein'] });
ctx({ kind: 'country' });
u('botswana', 'Botswana', { mu: ['BWA'], sov: 'Botswana', iso: 'BW', aliases: ['Bechuanaland Protectorate', 'Bechuanaland', 'Gaborone'] });
u('lesotho', 'Lesotho', { mu: ['LSO'], sov: 'Lesotho', iso: 'LS', aliases: ['Basutoland', 'Maseru', 'Moshoeshoe'] });
u('eswatini', 'Eswatini', { mu: ['SWZ'], sov: 'Eswatini', iso: 'SZ', aliases: ['Swaziland', 'Mbabane'] });
u('zw-southern-rhodesia', 'Zimbabwe', { mu: ['ZWE'], sov: 'Zimbabwe', iso: 'ZW', aliases: ['Southern Rhodesia', 'Rhodesia', 'Mashonaland', 'Matabeleland', 'Salisbury', 'Harare'] });
u('zm-northern-rhodesia', 'Zambia', { mu: ['ZMB'], sov: 'Zambia', iso: 'ZM', aliases: ['Northern Rhodesia', 'Barotseland', 'Lusaka', 'Copperbelt'] });
u('mw-nyasaland', 'Malawi', { mu: ['MWI'], sov: 'Malawi', iso: 'MW', aliases: ['Nyasaland', 'British Central Africa', 'Blantyre', 'Lake Nyasa'] });
u('namibia', 'Namibia', { mu: ['NAM'], sov: 'Namibia', iso: 'NA', aliases: ['South West Africa', 'German South West Africa', 'Walvis Bay', 'Windhoek'] });
u('mozambique', 'Mozambique', { mu: ['MOZ'], sov: 'Mozambique', iso: 'MZ', aliases: ['Portuguese East Africa', 'Lourenço Marques'] });
u('angola', 'Angola', { mu: ['AGO'], sov: 'Angola', iso: 'AO', aliases: ['Portuguese West Africa', 'Luanda'] });

/* ===================== THE MIDDLE EAST & THE GULF ===================== */
ctx({ region: 'Middle East & the Gulf', kind: 'country' });
u('israel', 'Israel', { mu: ['ISR'], sov: 'Israel', iso: 'IL', aliases: ['Mandatory Palestine (west)', 'Palestine', 'Jerusalem', 'Haifa'] });
u('west-bank', 'West Bank', { mu: ['WEB'], sov: 'Palestine', iso: 'PS', kind: 'subnational', aliases: ['Judea and Samaria', 'Mandatory Palestine (east of the Green Line)', 'Jericho'] });
u('gaza-strip', 'Gaza Strip', { mu: ['GAZ'], sov: 'Palestine', iso: 'PS', kind: 'subnational', aliases: ['Gaza'] });
u('jordan', 'Jordan', { mu: ['JOR'], sov: 'Jordan', iso: 'JO', aliases: ['Transjordan', 'Emirate of Transjordan', 'Amman'] });
u('iraq', 'Iraq', { mu: ['IRR', 'IRK'], sov: 'Iraq', iso: 'IQ', aliases: ['Mesopotamia', 'Baghdad', 'Basra', 'Mosul', 'Kingdom of Iraq'] });
u('syria', 'Syria', { mu: ['SYX', 'SYU'], sov: 'Syria', iso: 'SY', aliases: ['French Mandate for Syria', 'Damascus'] });
u('lebanon', 'Lebanon', { mu: ['LBN'], sov: 'Lebanon', iso: 'LB', aliases: ['Greater Lebanon', 'Beirut'] });
u('kuwait', 'Kuwait', { mu: ['KWT'], sov: 'Kuwait', iso: 'KW', aliases: ['Sheikhdom of Kuwait'] });
u('bahrain', 'Bahrain', { mu: ['BHR'], sov: 'Bahrain', iso: 'BH', aliases: ['Manama'] });
u('qatar', 'Qatar', { mu: ['QAT'], sov: 'Qatar', iso: 'QA', aliases: ['Doha'] });
u('united-arab-emirates', 'United Arab Emirates', { mu: ['ARE'], sov: 'United Arab Emirates', iso: 'AE', aliases: ['Trucial States', 'Trucial Oman', 'Pirate Coast', 'Abu Dhabi', 'Dubai', 'Sharjah'] });
u('oman', 'Oman', { mu: ['OMN'], sov: 'Oman', iso: 'OM', aliases: ['Muscat and Oman', 'Sultanate of Muscat', 'Musandam'] });
ctx({ kind: 'subnational', sov: 'Yemen', iso: 'YE' });
u('ye-aden-colony', 'Aden Colony', { a1: ['YEM', ['`Adan']], aliases: ['Aden', 'Aden Settlement', 'Crater'] });
u('ye-aden-protectorate', 'Aden Protectorate', { a1: ['YEM', ['Lahij', 'Abyan', 'Shabwah', 'Hadramawt', 'Al Mahrah', 'Al Dali\'']], aliases: ['South Arabia', 'Federation of South Arabia', 'Hadhramaut', 'Mukalla', 'Western and Eastern Protectorates'] });
u('ye-north-yemen', 'North Yemen', { a1rest: ['YEM', ['`Adan', 'Lahij', 'Abyan', 'Shabwah', 'Hadramawt', 'Al Mahrah', 'Al Dali\'']], aliases: ['Yemen Arab Republic', 'Mutawakkilite Kingdom', 'Sanaa', 'Ta`izz'] });
u('ye-socotra', 'Socotra', { aliases: ['Suqutra', 'Soqotra'], note: 'Carved from the Hadramawt governorate by bounding box.' });
u('ye-perim', 'Perim', { aliases: ['Mayyun', 'Bab-el-Mandeb'], note: 'Carved from Aden Colony by bounding box.' });
u('ye-kamaran', 'Kamaran', { aliases: ['Kamaran Island'], note: 'Carved from North Yemen (Al Hudaydah) by bounding box.' });
u('om-kuria-muria', 'Kuria Muria Islands', { sov: 'Oman', iso: 'OM', kind: 'island-group', aliases: ['Khuriya Muriya', 'Hallaniyah'], note: 'Carved from Oman by bounding box.' });
ctx({ kind: 'country' });
u('saudi-arabia', 'Saudi Arabia', { mu: ['SAU'], sov: 'Saudi Arabia', iso: 'SA', aliases: ['Hejaz', 'Nejd', 'Kingdom of the Hejaz', 'Mecca', 'Riyadh'] });
u('iran', 'Iran', { mu: ['IRN'], sov: 'Iran', iso: 'IR', aliases: ['Persia', 'Anglo-Persian Oil', 'Abadan'] });
u('turkey', 'Turkey', { mu: ['TUR'], sov: 'Turkey', iso: 'TR', aliases: ['Ottoman Empire (Anatolia)', 'Constantinople', 'Istanbul', 'Gallipoli'] });

/* ===================== SOUTH ASIA ===================== */
ctx({ region: 'South Asia', kind: 'subnational', sov: 'India', iso: 'IN' });
u('in-west-bengal', 'West Bengal', { a1: ['IND', ['West Bengal']], aliases: ['Bengal', 'Calcutta', 'Kolkata', 'Fort William', 'Plassey'] });
u('in-bihar', 'Bihar', { a1: ['IND', ['Bihar']], aliases: ['Bengal Presidency (part)', 'Patna', 'Buxar', 'Champaran'] });
u('in-jharkhand', 'Jharkhand', { a1: ['IND', ['Jharkhand']], aliases: ['Chota Nagpur', 'Santal Parganas'] });
u('in-odisha', 'Odisha', { a1: ['IND', ['Odisha']], aliases: ['Orissa', 'Cuttack', 'Puri'] });
u('in-assam', 'Assam', { a1: ['IND', ['Assam']], aliases: ['Ahom Kingdom', 'Guwahati', 'Assam tea districts'] });
u('in-arunachal-pradesh', 'Arunachal Pradesh', { a1: ['IND', ['Arunachal Pradesh']], aliases: ['North-East Frontier Agency', 'NEFA', 'McMahon Line'] });
u('in-nagaland', 'Nagaland', { a1: ['IND', ['Nagaland']], aliases: ['Naga Hills'] });
u('in-manipur', 'Manipur', { a1: ['IND', ['Manipur']], aliases: ['Imphal', 'Kangleipak'] });
u('in-mizoram', 'Mizoram', { a1: ['IND', ['Mizoram']], aliases: ['Lushai Hills'] });
u('in-tripura', 'Tripura', { a1: ['IND', ['Tripura']] });
u('in-meghalaya', 'Meghalaya', { a1: ['IND', ['Meghalaya']], aliases: ['Khasi Hills', 'Shillong'] });
u('in-sikkim', 'Sikkim', { a1: ['IND', ['Sikkim']], aliases: ['Kingdom of Sikkim', 'Gangtok', 'Chogyal'] });
u('in-uttar-pradesh', 'Uttar Pradesh', { a1: ['IND', ['Uttar Pradesh']], aliases: ['United Provinces', 'Awadh', 'Oudh', 'Lucknow', 'Kanpur', 'Cawnpore', 'Meerut', 'Ceded and Conquered Provinces'] });
u('in-uttarakhand', 'Uttarakhand', { a1: ['IND', ['Uttarakhand']], aliases: ['Kumaon', 'Garhwal', 'Simla hills (part)'] });
u('in-delhi', 'Delhi', { a1: ['IND', ['Delhi']], aliases: ['Shahjahanabad', 'New Delhi', 'Mughal capital'] });
u('in-haryana', 'Haryana', { a1: ['IND', ['Haryana', 'Chandigarh']], aliases: ['Punjab (east)', 'Panipat'] });
u('in-punjab-india', 'Punjab (India)', { a1: ['IND', ['Punjab']], aliases: ['Sikh Empire', 'Amritsar', 'Jallianwala Bagh', 'East Punjab'] });
u('in-himachal-pradesh', 'Himachal Pradesh', { a1: ['IND', ['Himachal Pradesh']], aliases: ['Simla', 'Shimla', 'Punjab Hill States'] });
u('in-rajasthan', 'Rajasthan', { a1: ['IND', ['Rajasthan']], aliases: ['Rajputana', 'Jaipur', 'Udaipur', 'Jodhpur'] });
u('in-gujarat', 'Gujarat', { a1: ['IND', ['Gujarat']], aliases: ['Surat', 'Kathiawar', 'Ahmedabad', 'Dandi', 'Baroda'] });
u('in-madhya-pradesh', 'Madhya Pradesh', { a1: ['IND', ['Madhya Pradesh']], aliases: ['Central Provinces', 'Central India Agency', 'Gwalior', 'Indore', 'Jhansi'] });
u('in-chhattisgarh', 'Chhattisgarh', { a1: ['IND', ['Chhattisgarh']], aliases: ['Central Provinces (east)'] });
u('in-maharashtra', 'Maharashtra', { a1: ['IND', ['Maharashtra']], aliases: ['Bombay Presidency', 'Bombay', 'Mumbai', 'Maratha Confederacy', 'Poona', 'Pune', 'Nagpur'] });
u('in-goa', 'Goa', { a1: ['IND', ['Goa']], aliases: ['Portuguese India', 'Estado da Índia', 'Panjim'] });
u('in-daman-diu-dadra', 'Daman, Diu, Dadra and Nagar Haveli', { a1: ['IND', ['Dadra and Nagar Haveli and Daman and Diu']], aliases: ['Portuguese India'] });
u('in-telangana', 'Telangana (Hyderabad State core)', { a1: ['IND', ['Telangana']], aliases: ['Hyderabad State', 'Nizam’s Dominions', 'Hyderabad', 'Deccan'], note: 'Hyderabad State also covered Marathwada and Kalyana-Karnataka, which Natural Earth admin-1 cannot separate from Maharashtra and Karnataka. This unit is the Telangana core only.' });
u('in-andhra-pradesh', 'Andhra Pradesh', { a1: ['IND', ['Andhra Pradesh']], aliases: ['Northern Circars', 'Madras Presidency (north)', 'Masulipatnam', 'Vizagapatam'] });
u('in-karnataka', 'Karnataka', { a1: ['IND', ['Karnataka']], aliases: ['Mysore', 'Kingdom of Mysore', 'Seringapatam', 'Srirangapatna', 'Bangalore', 'Bengaluru'] });
u('in-kerala', 'Kerala', { a1: ['IND', ['Kerala']], aliases: ['Travancore', 'Cochin', 'Malabar', 'Calicut', 'Kozhikode'] });
u('in-tamil-nadu', 'Tamil Nadu', { a1: ['IND', ['Tamil Nadu']], aliases: ['Madras Presidency', 'Madras', 'Chennai', 'Fort St George', 'Carnatic', 'Tanjore'] });
u('in-puducherry', 'Puducherry', { a1: ['IND', ['Puducherry']], aliases: ['French India', 'Pondicherry', 'Karaikal', 'Yanam', 'Mahé'] });
u('in-lakshadweep', 'Lakshadweep', { a1: ['IND', ['Lakshadweep']], aliases: ['Laccadive Islands', 'Minicoy'] });
u('in-andaman-nicobar', 'Andaman and Nicobar Islands', { a1: ['IND', ['Andaman and Nicobar']], aliases: ['Port Blair', 'Cellular Jail', 'Kala Pani'] });
u('in-jammu-kashmir', 'Jammu and Kashmir (Indian-administered)', { a1: ['IND', ['Jammu and Kashmir']], aliases: ['Princely State of Jammu and Kashmir', 'Srinagar', 'Vale of Kashmir'] });
u('in-ladakh', 'Ladakh', { a1: ['IND', ['Ladakh']], aliases: ['Leh', 'Baltistan (part)'] });
ctx({ sov: 'Pakistan', iso: 'PK' });
u('pk-punjab', 'Punjab (Pakistan)', { a1: ['PAK', ['Punjab', 'F.C.T.']], aliases: ['West Punjab', 'Lahore', 'Islamabad', 'Sikh Empire (part)'] });
u('pk-sindh', 'Sindh', { a1: ['PAK', ['Sind']], aliases: ['Scinde', 'Karachi', 'Hyderabad (Sindh)', 'Talpur Amirs'] });
u('pk-balochistan', 'Balochistan', { a1: ['PAK', ['Baluchistan']], aliases: ['Kalat', 'Quetta', 'British Baluchistan'] });
u('pk-khyber-pakhtunkhwa', 'Khyber Pakhtunkhwa', { a1: ['PAK', ['K.P.', 'F.A.T.A.']], aliases: ['North-West Frontier Province', 'NWFP', 'Peshawar', 'Khyber Pass', 'Tribal Areas', 'Waziristan'] });
u('pk-azad-kashmir', 'Azad Kashmir', { a1: ['PAK', ['Azad Kashmir']], aliases: ['Pakistan-administered Kashmir', 'Muzaffarabad'] });
u('pk-gilgit-baltistan', 'Gilgit-Baltistan', { a1: ['PAK', ['Northern Areas']], aliases: ['Gilgit Agency', 'Northern Areas', 'Baltistan', 'Hunza'] });
ctx({ sov: 'Bangladesh', iso: 'BD' });
u('bd-east-bengal', 'East Bengal', { a1: ['BGD', ['Dhaka', 'Chittagong', 'Rangpur', 'Rajshahi', 'Khulna', 'Barisal']], kind: 'subnational', aliases: ['East Pakistan', 'Bangladesh', 'Dacca', 'Dhaka', 'Chittagong', 'Bengal (east)'] });
u('bd-sylhet', 'Sylhet', { a1: ['BGD', ['Sylhet']], aliases: ['Sylhet district (Assam)', 'Surma Valley'] });
ctx({ sov: 'Myanmar', iso: 'MM' });
u('mm-arakan', 'Arakan', { a1: ['MMR', ['Rakhine']], aliases: ['Rakhine', 'Akyab', 'Sittwe'] });
u('mm-tenasserim', 'Tenasserim', { a1: ['MMR', ['Tanintharyi']], aliases: ['Tanintharyi', 'Mergui', 'Moulmein (region)'] });
u('mm-lower-burma', 'Lower Burma', { a1: ['MMR', ['Ayeyarwady', 'Yangon', 'Bago', 'Mon', 'Kayin']], aliases: ['Pegu', 'Rangoon', 'Yangon', 'Irrawaddy delta'] });
u('mm-upper-burma', 'Upper Burma', { a1: ['MMR', ['Mandalay', 'Sagaing', 'Magway']], aliases: ['Ava', 'Mandalay', 'Konbaung kingdom'] });
u('mm-frontier-areas', 'Burma frontier areas', { a1: ['MMR', ['Shan', 'Kachin', 'Chin', 'Kayah']], aliases: ['Shan States', 'Kachin Hills', 'Chin Hills', 'Karenni'] });
ctx({ sov: 'Sri Lanka', iso: 'LK' });
u('lk-maritime-provinces', 'Ceylon maritime provinces', { a1rest: ['LKA', ['Mahanuvara', 'Mātale', 'Nuvara Ĕliya', 'Badulla', 'Mŏṇarāgala', 'Ratnapura', 'Kægalla', 'Anurādhapura', 'Pŏḷŏnnaruva']], aliases: ['Dutch Ceylon', 'Colombo', 'Jaffna', 'Galle', 'Trincomalee'] });
u('lk-kandy', 'Kandyan provinces', { a1: ['LKA', ['Mahanuvara', 'Mātale', 'Nuvara Ĕliya', 'Badulla', 'Mŏṇarāgala', 'Ratnapura', 'Kægalla', 'Anurādhapura', 'Pŏḷŏnnaruva']], aliases: ['Kingdom of Kandy', 'Kandy', 'Uva', 'Sabaragamuwa'] });
ctx({ kind: 'country' });
u('nepal', 'Nepal', { mu: ['NPL'], sov: 'Nepal', iso: 'NP', aliases: ['Gorkha', 'Kathmandu', 'Gurkhas'] });
u('bhutan', 'Bhutan', { mu: ['BTN'], sov: 'Bhutan', iso: 'BT', aliases: ['Druk Yul', 'Duars'] });
u('afghanistan', 'Afghanistan', { mu: ['AFG'], sov: 'Afghanistan', iso: 'AF', aliases: ['Kabul', 'Kandahar', 'Durand Line', 'Emirate of Afghanistan'] });
u('maldives', 'Maldives', { mu: ['MDV'], sov: 'Maldives', iso: 'MV', aliases: ['Malé', 'Addu', 'Gan'] });

/* ===================== SOUTH-EAST ASIA ===================== */
ctx({ region: 'South-East Asia', kind: 'subnational', sov: 'Malaysia', iso: 'MY' });
u('my-penang', 'Penang', { a1: ['MYS', ['Pulau Pinang']], aliases: ['Prince of Wales Island', 'George Town', 'Province Wellesley', 'Straits Settlements'] });
u('my-melaka', 'Malacca', { a1: ['MYS', ['Melaka']], aliases: ['Melaka', 'Straits Settlements'] });
u('my-perak', 'Perak', { a1: ['MYS', ['Perak']], aliases: ['Federated Malay States', 'Pangkor', 'Larut', 'the Dindings'] });
u('my-selangor', 'Selangor', { a1: ['MYS', ['Selangor', 'Kuala Lumpur', 'Putrajaya']], aliases: ['Federated Malay States', 'Kuala Lumpur'] });
u('my-negeri-sembilan', 'Negeri Sembilan', { a1: ['MYS', ['Negeri Sembilan']], aliases: ['Federated Malay States', 'Sungai Ujong'] });
u('my-pahang', 'Pahang', { a1: ['MYS', ['Pahang']], aliases: ['Federated Malay States'] });
u('my-johor', 'Johor', { a1: ['MYS', ['Johor']], aliases: ['Johore', 'Unfederated Malay States'] });
u('my-kedah', 'Kedah', { a1: ['MYS', ['Kedah']], aliases: ['Unfederated Malay States', 'Siamese Malay States'] });
u('my-perlis', 'Perlis', { a1: ['MYS', ['Perlis']], aliases: ['Unfederated Malay States'] });
u('my-kelantan', 'Kelantan', { a1: ['MYS', ['Kelantan']], aliases: ['Unfederated Malay States'] });
u('my-terengganu', 'Terengganu', { a1: ['MYS', ['Terengganu']], aliases: ['Trengganu', 'Unfederated Malay States'] });
u('my-sarawak', 'Sarawak', { a1: ['MYS', ['Sarawak']], aliases: ['Raj of Sarawak', 'White Rajahs', 'Brooke', 'Kuching'] });
u('my-sabah', 'Sabah', { a1: ['MYS', ['Sabah']], aliases: ['British North Borneo', 'North Borneo', 'Jesselton', 'Kota Kinabalu'] });
u('my-labuan', 'Labuan', { a1: ['MYS', ['Labuan']], aliases: ['Straits Settlements (1907–1912)', 'Victoria'] });
ctx({ kind: 'country' });
u('singapore', 'Singapore', { mu: ['SGP'], sov: 'Singapore', iso: 'SG', aliases: ['Straits Settlements', 'Temasek', 'Raffles'] });
u('brunei', 'Brunei', { mu: ['BRN'], sov: 'Brunei', iso: 'BN', aliases: ['Sultanate of Brunei', 'Bandar Seri Begawan'] });
ctx({ kind: 'subnational', sov: 'Indonesia', iso: 'ID' });
u('id-java', 'Java', { a1: ['IDN', ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Yogyakarta', 'Banten', 'Jakarta Raya']], aliases: ['Batavia', 'Jakarta', 'Dutch East Indies', 'Raffles'] });
u('id-bencoolen', 'Bencoolen', { a1: ['IDN', ['Bengkulu']], aliases: ['Bengkulu', 'Fort Marlborough', 'British Sumatra'] });
u('id-sumatra', 'Sumatra (rest)', { a1: ['IDN', ['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Lampung', 'Bangka-Belitung', 'Kepulauan Riau']], aliases: ['Aceh', 'Palembang', 'Padang'] });
u('id-moluccas', 'Maluku', { a1: ['IDN', ['Maluku', 'Maluku Utara']], aliases: ['Moluccas', 'Spice Islands', 'Ambon', 'Banda', 'Ternate', 'Run'] });
ctx({ kind: 'country' });
u('thailand', 'Thailand', { mu: ['THA'], sov: 'Thailand', iso: 'TH', aliases: ['Siam', 'Bangkok'] });
u('philippines', 'Philippines', { mu: ['PHL'], sov: 'Philippines', iso: 'PH', aliases: ['Manila', 'Spanish Philippines'] });
u('vietnam', 'Vietnam', { mu: ['VNM'], sov: 'Vietnam', iso: 'VN', aliases: ['Cochinchina', 'French Indochina', 'Saigon'] });

/* ===================== EAST ASIA ===================== */
ctx({ region: 'East Asia', kind: 'subnational', sov: 'China', iso: 'CN' });
u('hk-hong-kong-island', 'Hong Kong Island', { a1: ['HKG', ['Central and Western', 'Wan Chai', 'Eastern', 'Southern']], aliases: ['Victoria', 'Hong Kong'] });
u('hk-kowloon', 'Kowloon', { a1: ['HKG', ['Yau Tsim Mong', 'Sham Shui Po', 'Kowloon City', 'Wong Tai Sin', 'Kwun Tong']], aliases: ['Kowloon Peninsula', 'Stonecutters Island'] });
u('hk-new-territories', 'New Territories', { a1: ['HKG', ['North', 'Islands', 'Tsuen Wan', 'Tai Po', 'Sha Tin', 'Sai Kung', 'Kwai Tsing', 'Tuen Mun', 'Yuen Long']], aliases: ['Lantau', 'Sha Tin', '99-year lease'] });
u('cn-weihaiwei', 'Weihaiwei', { aliases: ['Weihai', 'Port Edward'], note: 'Carved from Shandong by bounding box; the leased territory boundary is approximated.' });
u('macau', 'Macau', { mu: ['MAC'], iso: 'MO', kind: 'dependency', aliases: ['Macao', 'Portuguese Macau'] });
u('japan', 'Japan', { mu: ['JPN'], sov: 'Japan', iso: 'JP', kind: 'country', aliases: ['British Commonwealth Occupation Force', 'Hiroshima prefecture', 'Kure'] });

/* ===================== INDIAN OCEAN ===================== */
ctx({ region: 'Indian Ocean', kind: 'country' });
u('mauritius', 'Mauritius', { a1rest: ['MUS', ['Rodrigues']], sov: 'Mauritius', iso: 'MU', aliases: ['Isle de France', 'Port Louis', 'Agalega'] });
u('mu-rodrigues', 'Rodrigues', { a1: ['MUS', ['Rodrigues']], sov: 'Mauritius', iso: 'MU', kind: 'subnational' });
u('seychelles', 'Seychelles (inner islands)', { a1rest: ['SYC', ['Outer Islands']], sov: 'Seychelles', iso: 'SC', aliases: ['Mahé', 'Victoria', 'Praslin', 'La Digue'] });
u('sc-outer-islands', 'Seychelles Outer Islands', { a1: ['SYC', ['Outer Islands']], sov: 'Seychelles', iso: 'SC', kind: 'island-group', aliases: ['Aldabra', 'Farquhar', 'Desroches', 'BIOT (1965–1976)'] });
ctx({ kind: 'dependency', sov: 'United Kingdom', iso: 'IO' });
u('io-chagos-archipelago', 'Chagos Archipelago (except Diego Garcia)', { mu: ['IOT'], aliases: ['British Indian Ocean Territory', 'BIOT', 'Peros Banhos', 'Salomon'] });
u('io-diego-garcia', 'Diego Garcia', { aliases: ['BIOT', 'Camp Justice'], note: 'Carved from the British Indian Ocean Territory map unit by bounding box.' });
ctx({ kind: 'dependency', sov: 'Australia', iso: 'AU' });
u('christmas-island', 'Christmas Island', { mu: ['CXR'], iso: 'CX' });
u('cocos-keeling-islands', 'Cocos (Keeling) Islands', { mu: ['CCK'], iso: 'CC', aliases: ['Clunies-Ross'] });
u('heard-mcdonald-islands', 'Heard Island and McDonald Islands', { mu: ['HMD'], iso: 'HM' });

/* ===================== SOUTH ATLANTIC & ANTARCTIC ===================== */
ctx({ region: 'South Atlantic & Antarctic', kind: 'dependency', sov: 'United Kingdom', iso: 'SH' });
u('saint-helena', 'Saint Helena', { a1: ['SHN', ['Saint Helena']], aliases: ['Jamestown', 'Napoleon’s exile', 'St Helena'] });
u('ascension', 'Ascension Island', { a1: ['SHN', ['Ascension']], aliases: ['Georgetown', 'Wideawake'] });
u('tristan-da-cunha', 'Tristan da Cunha', { a1: ['SHN', ['Tristan da Cunha']], aliases: ['Edinburgh of the Seven Seas', 'Gough Island'] });
u('aq-ross-dependency', 'Ross Dependency', { iso: 'AQ', kind: 'antarctic', sov: 'New Zealand (claim, Antarctic Treaty)', aliases: ['Ross Sea', 'Scott Base', 'McMurdo'], note: 'The sector 160°E–150°W south of 60°S, carved from the Natural Earth Antarctica map unit.' });
u('aq-australian-antarctic', 'Australian Antarctic Territory', { iso: 'AQ', kind: 'antarctic', sov: 'Australia (claim, Antarctic Treaty)', aliases: ['Mawson', 'Wilkes Land', 'Enderby Land'], note: 'The sectors 45°E–136°E and 142°E–160°E south of 60°S, carved from the Natural Earth Antarctica map unit.' });
u('british-antarctic-territory', 'British Antarctic Territory', { iso: 'AQ', kind: 'antarctic', sov: 'United Kingdom (claim, Antarctic Treaty)', aliases: ['Graham Land', 'Antarctic Peninsula', 'Falkland Islands Dependencies'], note: 'The sector 20°W–80°W south of 60°S, carved from the Natural Earth Antarctica map unit by bounding box.' });

/* ===================== AUSTRALASIA ===================== */
ctx({ region: 'Australia & New Zealand', kind: 'subnational', sov: 'Australia', iso: 'AU' });
u('au-new-south-wales', 'New South Wales', { a1: ['AUS', ['New South Wales', 'Australian Capital Territory', 'Jervis Bay Territory', 'Lord Howe Island']], aliases: ['Botany Bay', 'Sydney', 'Port Jackson', 'Canberra'] });
u('au-tasmania', 'Tasmania', { a1: ['AUS', ['Tasmania', 'Macquarie Island']], aliases: ['Van Diemen’s Land', 'Hobart', 'Port Arthur', 'lutruwita'] });
u('au-victoria', 'Victoria', { a1: ['AUS', ['Victoria']], aliases: ['Port Phillip District', 'Melbourne', 'Ballarat', 'Eureka'] });
u('au-south-australia', 'South Australia', { a1: ['AUS', ['South Australia']], aliases: ['Adelaide', 'Wakefield settlement'] });
u('au-queensland', 'Queensland', { a1: ['AUS', ['Queensland']], aliases: ['Moreton Bay', 'Brisbane', 'Torres Strait Islands'] });
u('au-western-australia', 'Western Australia', { a1: ['AUS', ['Western Australia']], aliases: ['Swan River Colony', 'Perth', 'Fremantle'] });
u('au-northern-territory', 'Northern Territory', { a1: ['AUS', ['Northern Territory']], aliases: ['Darwin', 'Port Essington', 'Palmerston'] });
ctx({ kind: 'dependency' });
u('norfolk-island', 'Norfolk Island', { mu: ['NFK'], iso: 'NF', aliases: ['Kingston', 'penal settlement'] });
u('au-ashmore-cartier', 'Ashmore and Cartier Islands', { mu: ['ATC'] });
u('au-coral-sea-islands', 'Coral Sea Islands', { mu: ['CSI'] });
ctx({ kind: 'country', sov: 'New Zealand', iso: 'NZ' });
u('new-zealand', 'New Zealand', { mu: ['NZL'], aliases: ['Aotearoa', 'Waitangi', 'Wellington', 'Auckland', 'Chatham Islands', 'Kermadecs'] });
ctx({ kind: 'dependency' });
u('cook-islands', 'Cook Islands', { mu: ['COK'], iso: 'CK', aliases: ['Rarotonga', 'Aitutaki'] });
u('niue', 'Niue', { mu: ['NIU'], iso: 'NU' });
u('tokelau', 'Tokelau', { mu: ['TKL'], iso: 'TK', aliases: ['Union Islands'] });

/* ===================== THE PACIFIC ===================== */
ctx({ region: 'The Pacific', kind: 'country' });
u('fiji', 'Fiji', { mu: ['FJI'], sov: 'Fiji', iso: 'FJ', aliases: ['Suva', 'Levuka', 'Rotuma', 'Cakobau'] });
u('tonga', 'Tonga', { mu: ['TON'], sov: 'Tonga', iso: 'TO', aliases: ['Friendly Islands', 'Nuku’alofa'] });
u('samoa', 'Samoa', { mu: ['WSM'], sov: 'Samoa', iso: 'WS', aliases: ['Western Samoa', 'German Samoa', 'Apia', 'Upolu', 'Savai’i'] });
u('american-samoa', 'American Samoa', { mu: ['ASM'], sov: 'United States', iso: 'AS', kind: 'dependency', aliases: ['Pago Pago', 'Tutuila'] });
u('solomon-islands', 'Solomon Islands', { mu: ['SLB'], sov: 'Solomon Islands', iso: 'SB', aliases: ['British Solomon Islands Protectorate', 'Guadalcanal', 'Honiara', 'Tulagi'] });
u('vanuatu', 'Vanuatu', { mu: ['VUT'], sov: 'Vanuatu', iso: 'VU', aliases: ['New Hebrides', 'Anglo-French Condominium', 'Port Vila', 'Espiritu Santo'] });
u('nauru', 'Nauru', { mu: ['NRU'], sov: 'Nauru', iso: 'NR', aliases: ['Pleasant Island', 'phosphate'] });
u('tuvalu', 'Tuvalu', { mu: ['TUV'], sov: 'Tuvalu', iso: 'TV', aliases: ['Ellice Islands', 'Funafuti'] });
u('ki-gilbert-islands', 'Gilbert Islands', { mu: ['KIR'], sov: 'Kiribati', iso: 'KI', kind: 'island-group', aliases: ['Gilbert and Ellice Islands Colony', 'Tarawa', 'Ocean Island', 'Banaba', 'Betio'] });
u('ki-line-phoenix-islands', 'Line and Phoenix Islands', { sov: 'Kiribati', iso: 'KI', kind: 'island-group', aliases: ['Christmas Island', 'Kiritimati', 'Fanning', 'Washington', 'Canton', 'Enderbury'], note: 'Carved from the Kiribati map unit by longitude: everything east of the antimeridian.' });
ctx({ kind: 'dependency', sov: 'United Kingdom', iso: 'PN' });
u('pitcairn-islands', 'Pitcairn Islands', { mu: ['PCN'], aliases: ['Adamstown', 'Bounty mutineers', 'Henderson Island'] });
ctx({ kind: 'subnational', sov: 'Papua New Guinea', iso: 'PG' });
u('pg-papua', 'Papua', { a1: ['PNG', ['Western', 'Gulf', 'Central', 'National Capital District', 'Milne Bay', 'Northern', 'Southern Highlands']], aliases: ['British New Guinea', 'Territory of Papua', 'Port Moresby'] });
u('pg-new-guinea', 'New Guinea (Mandated Territory)', { a1: ['PNG', ['Sandaun', 'East Sepik', 'Madang', 'Morobe', 'Manus', 'New Ireland', 'East New Britain', 'West New Britain', 'Chimbu', 'Enga', 'Western Highlands', 'Eastern Highlands']], aliases: ['German New Guinea', 'Kaiser-Wilhelmsland', 'Rabaul', 'Lae'] });
u('pg-bougainville', 'Bougainville', { mu: ['PNB'], aliases: ['North Solomons', 'Buka', 'Panguna'] });
ctx({ kind: 'dependency', sov: 'France', iso: 'FR' });
u('new-caledonia', 'New Caledonia', { mu: ['NCL'], iso: 'NC', aliases: ['Nouvelle-Calédonie', 'Nouméa'] });
u('french-polynesia', 'French Polynesia', { mu: ['PYF'], iso: 'PF', aliases: ['Tahiti', 'Society Islands', 'Marquesas'] });
u('wallis-futuna', 'Wallis and Futuna', { mu: ['WLF'], iso: 'WF' });
ctx({ sov: 'United States', iso: 'US' });
u('guam', 'Guam', { mu: ['GUM'], iso: 'GU' });
u('hawaii', 'Hawaii', { a1: ['USA', ['Hawaii']], sov: 'United States', iso: 'US', kind: 'subnational', aliases: ['Sandwich Islands', 'Kingdom of Hawai‘i', 'Honolulu'] });

/* ===================== SCAFFOLDING (carved up, then discarded) ===================== */
ctx({ region: 'scaffolding', kind: 'scaffolding', sov: '', iso: '' });
u('tmp-germany', 'Germany (scaffolding)', { a1rest: ['DEU', ['Schleswig-Holstein', 'Niedersachsen', 'Nordrhein-Westfalen', 'Hamburg', 'Bremen']], drop: true });
u('tmp-spain', 'Spain (scaffolding)', { mu: ['ESP'], drop: true });
u('tmp-china', 'China (scaffolding)', { mu: ['CHN'], drop: true });
u('tmp-antarctica', 'Antarctica (scaffolding)', { mu: ['ATA'], drop: true });

// ---------------------------------------------------------------------------
// 2. CARVES — sub-unit splits Natural Earth cannot express
// ---------------------------------------------------------------------------
// Applied to the tagged source features BEFORE the big dissolve, so a carve can
// either create a new unit or merge into an existing one.
/**
 * A polar sector as a densified ring. A plain bounding box would give the carved
 * polygon straight edges between two corner vertices; on any curved projection
 * those edges cut across meridians and the wedge renders wrong. Densifying every
 * degree makes the cut follow the meridians and the 60°S parallel.
 */
function antarcticSector(lonW, lonE, latN = -60, latS = -89.9) {
  const ring = [];
  for (let lat = latN; lat > latS; lat -= 1) ring.push([lonW, lat]);
  ring.push([lonW, latS]);
  for (let lon = lonW; lon < lonE; lon += 1) ring.push([lon, latS]);
  ring.push([lonE, latS]);
  for (let lat = latS; lat < latN; lat += 1) ring.push([lonE, lat]);
  ring.push([lonE, latN]);
  for (let lon = lonE; lon > lonW; lon -= 1) ring.push([lon, latN]);
  ring.push([lonW, latN]);
  return ring;
}

const CARVES = [
  { from: 'de-british-zone', to: 'de-heligoland', bbox: [7.83, 54.14, 8.00, 54.23] },
  { from: 'tmp-spain', to: 'es-minorca', bbox: [3.75, 39.75, 4.45, 40.15] },
  { from: 'tmp-china', to: 'cn-weihaiwei', bbox: [121.95, 37.28, 122.80, 37.60] },
  { from: 'tmp-antarctica', to: 'british-antarctic-territory', poly: antarcticSector(-80, -20) },
  { from: 'tmp-antarctica', to: 'aq-ross-dependency', poly: antarcticSector(160, 180) },
  { from: 'tmp-antarctica', to: 'aq-ross-dependency', poly: antarcticSector(-180, -150) },
  { from: 'tmp-antarctica', to: 'aq-australian-antarctic', poly: antarcticSector(45, 136) },
  { from: 'tmp-antarctica', to: 'aq-australian-antarctic', poly: antarcticSector(142, 160) },
  { from: 'ye-north-yemen', to: 'ye-perim', bbox: [43.38, 12.62, 43.46, 12.69] },
  { from: 'ye-north-yemen', to: 'ye-kamaran', bbox: [42.55, 15.27, 42.70, 15.42] },
  { from: 'oman', to: 'om-kuria-muria', bbox: [55.60, 17.25, 56.45, 17.70] },
  { from: 'io-chagos-archipelago', to: 'io-diego-garcia', bbox: [72.28, -7.55, 72.65, -7.10] },
  { from: 'south-georgia', to: 'south-sandwich-islands', bbox: [-29, -60.5, -24, -55.0] },
  { from: 'ki-gilbert-islands', to: 'ki-line-phoenix-islands', bbox: [-180, -15, -140, 15] },
  { from: 'ye-aden-protectorate', to: 'ye-socotra', bbox: [52.85, 11.85, 54.95, 12.95] },
  { from: 'us-gulf-interior', to: 'us-west-florida', bbox: [-91.75, 28.80, -84.90, 32.47] },
  {
    from: 'ca-british-columbia', to: 'ca-vancouver-island',
    poly: [[-129.4, 48.15], [-123.0, 48.15], [-123.25, 49.05], [-124.3, 49.65], [-125.1, 50.20],
    [-125.8, 50.60], [-126.6, 50.95], [-127.4, 51.15], [-129.4, 51.15], [-129.4, 48.15]],
  },
  {
    // The eastern strip of the Gold Coast's Northern Territories that voted to
    // join Ghana with British Togoland in 1956.
    from: 'gh-northern-territories', to: 'gh-british-togoland',
    poly: [[-0.60, 8.05], [0.90, 8.05], [0.90, 11.30], [-0.35, 11.30], [-0.45, 10.20], [-0.60, 9.00], [-0.60, 8.05]],
  },
  {
    // British Northern Cameroons: the border strip of Borno, Adamawa and Taraba.
    from: 'ng-northern-nigeria', to: 'ng-british-northern-cameroons',
    poly: [[13.20, 13.60], [16.00, 13.60], [16.00, 6.00], [9.90, 6.00], [10.30, 7.20],
    [11.30, 8.80], [12.10, 10.40], [12.60, 11.80], [13.20, 13.60]],
  },
];

// ---------------------------------------------------------------------------
// 3. assemble parts
// ---------------------------------------------------------------------------
const CARVE_TARGETS = new Set(CARVES.map(c => c.to));

function assembleParts() {
  const mu = readNE('ne_10m_admin_0_map_units');
  const a1 = readNE('ne_10m_admin_1_states_provinces');

  const byMU = new Map();
  for (const f of mu.features) byMU.set(f.properties.GU_A3, f);

  const byA0 = new Map();
  for (const f of a1.features) {
    const k = f.properties.adm0_a3;
    if (!byA0.has(k)) byA0.set(k, []);
    byA0.get(k).push(f);
  }

  const parts = [];
  const seenA1 = new Map(); // adm0 -> Set(name) claimed, to detect double-claims
  for (const un of UNITS) {
    let n = 0;
    if (un.mu) {
      for (const code of un.mu) {
        const f = byMU.get(code);
        if (!f) { warn(`${un.id}: map unit ${code} not found`); continue; }
        parts.push({ type: 'Feature', properties: { unit: un.id }, geometry: f.geometry });
        n++;
      }
    }
    if (un.a1) {
      const [a3, names] = un.a1;
      const pool = byA0.get(a3) || [];
      if (!pool.length) warn(`${un.id}: no admin-1 features for ${a3}`);
      for (const name of names) {
        const hits = pool.filter(f => f.properties.name === name);
        if (!hits.length) { warn(`${un.id}: admin-1 "${name}" not found in ${a3}`); continue; }
        for (const f of hits) {
          parts.push({ type: 'Feature', properties: { unit: un.id }, geometry: f.geometry });
          n++;
        }
        if (!seenA1.has(a3)) seenA1.set(a3, new Map());
        const s = seenA1.get(a3);
        if (s.has(name)) warn(`${a3}/"${name}" claimed by both ${s.get(name)} and ${un.id}`);
        s.set(name, un.id);
      }
    }
    if (un.a1rest) {
      const [a3, except] = un.a1rest;
      const pool = byA0.get(a3) || [];
      if (!pool.length) warn(`${un.id}: no admin-1 features for ${a3}`);
      const ex = new Set(except);
      for (const e of except) {
        if (!pool.some(f => f.properties.name === e)) warn(`${un.id}: exclusion "${e}" not present in ${a3}`);
      }
      for (const f of pool) {
        if (ex.has(f.properties.name)) continue;
        parts.push({ type: 'Feature', properties: { unit: un.id }, geometry: f.geometry });
        n++;
      }
    }
    if (!n && !CARVE_TARGETS.has(un.id)) warn(`${un.id}: NO source features and no carve fills it`);
    un._parts = n;
  }
  return parts;
}

function bboxPoly(b) {
  const [w, s, e, n] = b;
  return {
    type: 'FeatureCollection', features: [{
      type: 'Feature', properties: {},
      geometry: { type: 'Polygon', coordinates: [[[w, s], [e, s], [e, n], [w, n], [w, s]]] },
    }],
  };
}
const ringPoly = (ring) => ({
  type: 'FeatureCollection', features: [{
    type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] },
  }],
});

async function applyCarves(parts) {
  for (const c of CARVES) {
    const src = parts.filter(f => f.properties.unit === c.from);
    if (!src.length) { warn(`carve ${c.from} -> ${c.to}: source has no parts`); continue; }
    const shape = c.bbox ? bboxPoly(c.bbox) : ringPoly(c.poly);
    const input = { 'src.json': { type: 'FeatureCollection', features: src }, 'shape.json': shape };
    const clipped = await ms('-i src.json -clip shape.json -o clip.json', input);
    const erased = await ms('-i src.json -erase shape.json -o erase.json', input);
    const cf = (clipped['clip.json'].features || []).filter(f => f.geometry);
    const ef = (erased['erase.json'].features || []).filter(f => f.geometry);
    if (!cf.length) { warn(`carve ${c.from} -> ${c.to}: clip produced nothing`); continue; }
    // remove originals, add carved + remainder
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].properties.unit === c.from) parts.splice(i, 1);
    for (const f of cf) parts.push({ type: 'Feature', properties: { unit: c.to }, geometry: f.geometry });
    for (const f of ef) parts.push({ type: 'Feature', properties: { unit: c.from }, geometry: f.geometry });
    log(`  carved ${c.to} out of ${c.from} (${cf.length} piece(s), ${ef.length} remaining)`);
  }
  return parts;
}

// ---------------------------------------------------------------------------
// 4. geometry metrics: area, bbox, centroid, guaranteed-on-land label point
// ---------------------------------------------------------------------------
function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] * ring[i][1]) - (ring[i][0] * ring[j][1]);
  }
  return a / 2;
}
function ringBBox(ring) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const p of ring) {
    if (p[0] < w) w = p[0]; if (p[0] > e) e = p[0];
    if (p[1] < s) s = p[1]; if (p[1] > n) n = p[1];
  }
  return [w, s, e, n];
}
function inRing(pt, ring) {
  let inside = false;
  const [x, y] = pt;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inPolygon(pt, poly) {
  if (!inRing(pt, poly[0])) return false;
  for (let i = 1; i < poly.length; i++) if (inRing(pt, poly[i])) return false;
  return true;
}
function segDist(p, a, b) {
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
  }
  return Math.hypot(p[0] - x, p[1] - y);
}
function distToPoly(p, poly) {
  let best = Infinity;
  for (const ring of poly) {
    const step = Math.max(1, Math.floor(ring.length / 900));
    for (let i = 0; i + step < ring.length; i += step) {
      const d = segDist(p, ring[i], ring[i + step]);
      if (d < best) best = d;
    }
  }
  return best;
}
function pointInGeometry(pt, geom) {
  if (!geom) return false;
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  for (const poly of polys) if (inPolygon(pt, poly)) return true;
  return false;
}

/** Pole of inaccessibility of the largest polygon: a point guaranteed to be on land. */
function labelPoint(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let poly = null, bestA = -1;
  for (const p of polys) {
    const a = Math.abs(ringArea(p[0]));
    if (a > bestA) { bestA = a; poly = p; }
  }
  if (!poly) return null;
  let [w, s, e, n] = ringBBox(poly[0]);
  let best = null, bestD = -1;
  let cw = w, cs = s, ce = e, cn = n;
  for (let iter = 0; iter < 5; iter++) {
    const N = iter === 0 ? 40 : 12;
    let found = false;
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N; j++) {
        const x = cw + (ce - cw) * (i / N), y = cs + (cn - cs) * (j / N);
        if (!inPolygon([x, y], poly)) continue;
        const d = distToPoly([x, y], poly);
        if (d > bestD) { bestD = d; best = [x, y]; found = true; }
      }
    }
    if (!best) break;
    const rw = (ce - cw) / (iter === 0 ? 40 : 12), rh = (cn - cs) / (iter === 0 ? 40 : 12);
    cw = best[0] - rw; ce = best[0] + rw; cs = best[1] - rh; cn = best[1] + rh;
    if (!found && iter > 0) break;
  }
  if (!best) {
    // Degenerate sliver: fall back to the midpoint of the longest edge of the ring.
    const ring = poly[0];
    let bi = 0, bl = -1;
    for (let i = 0; i + 1 < ring.length; i++) {
      const l = Math.hypot(ring[i + 1][0] - ring[i][0], ring[i + 1][1] - ring[i][1]);
      if (l > bl) { bl = l; bi = i; }
    }
    best = [(ring[bi][0] + ring[bi + 1][0]) / 2, (ring[bi][1] + ring[bi + 1][1]) / 2];
  }
  return [round(best[0], 4), round(best[1], 4)];
}
const round = (v, d) => Math.round(v * Math.pow(10, d)) / Math.pow(10, d);

/**
 * mapshaper writes GeoJSON with RFC 7946 ring order (outer ring counter-clockwise).
 * d3-geo uses the OPPOSITE convention: a spherical polygon's exterior ring must be
 * clockwise, or d3 reads it as "the whole globe except this shape" and every
 * measurement comes back as 4*pi steradians. Rewind before measuring.
 * (mapshaper's TopoJSON output already uses d3's order, so the shipped files are fine.)
 */
function rewindGeometry(geom) {
  const fix = (poly) => poly.map((ring, i) => {
    const ccw = ringArea(ring) > 0;
    const wantCcw = i !== 0;               // outer ring clockwise, holes counter-clockwise
    return ccw === wantCcw ? ring : ring.slice().reverse();
  });
  if (geom.type === 'Polygon') return { type: 'Polygon', coordinates: fix(geom.coordinates) };
  if (geom.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: geom.coordinates.map(fix) };
  return geom;
}

// ---------------------------------------------------------------------------
// 5. graticule
// ---------------------------------------------------------------------------
function graticule(step = 15) {
  const lines = [];
  for (let lon = -180; lon <= 180; lon += step) {
    const l = [];
    for (let lat = -90; lat <= 90; lat += 2) l.push([lon, lat]);
    lines.push(l);
  }
  for (let lat = -75; lat <= 75; lat += step) {
    const l = [];
    for (let lon = -180; lon <= 180; lon += 2) l.push([lon, lat]);
    lines.push(l);
  }
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: { step }, geometry: { type: 'MultiLineString', coordinates: lines } }],
  };
}

// ---------------------------------------------------------------------------
// 6. main
// ---------------------------------------------------------------------------
async function main() {
  const refetch = process.argv.includes('--refetch');
  fs.mkdirSync(OUT, { recursive: true });

  log('1/7  Natural Earth sources');
  await ensureSources(refetch);

  log('2/7  assembling source parts');
  let parts = assembleParts();
  log(`     ${parts.length} source polygons tagged across ${UNITS.length} declared units`);

  log('3/7  carving sub-units');
  parts = await applyCarves(parts);

  log('4/7  dissolving into units (mapshaper topology-safe union)');
  const dissolved = await ms(
    '-i parts.json -dissolve2 unit -o units.json format=geojson',
    { 'parts.json': { type: 'FeatureCollection', features: parts } }
  );
  const units = dissolved['units.json'];
  const byId = new Map();
  for (const f of units.features) {
    if (f.geometry) byId.set(f.properties.unit, f);
  }

  // Keep only the real (non-scaffolding) units, in stable sorted order.
  const keep = UNITS.filter(x => !x.drop).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const missing = [];
  const features = [];
  for (const un of keep) {
    const f = byId.get(un.id);
    if (!f || !f.geometry) { missing.push(un.id); continue; }
    features.push({ type: 'Feature', properties: { id: un.id }, geometry: f.geometry });
  }
  if (missing.length) warn('units with no geometry: ' + missing.join(', '));
  log(`     ${features.length} units with geometry`);

  log('5/7  simplifying + writing TopoJSON')
  const unitsFC = { type: 'FeatureCollection', features };
  const drawn = {};
  for (const [key, file, pct, quant] of [
    ['fine', 'units-fine.topo.json', SIMPLIFY_FINE, QUANT_FINE],
    ['coarse', 'units-coarse.topo.json', SIMPLIFY_COARSE, QUANT_COARSE],
  ]) {
    const res = await ms(
      `-i units.json -simplify visvalingam weighted keep-shapes percentage=${pct} -clean -rename-layers units -o out.json format=topojson quantization=${quant}`,
      { 'units.json': unitsFC }
    );
    const topo = res['out.json'];
    for (const g of topo.objects.units.geometries) {
      if (g.properties && g.properties.id) g.id = g.properties.id;
    }
    fs.writeFileSync(path.join(OUT, file), JSON.stringify(topo));
    drawn[key] = new Map(topojson.feature(topo, topo.objects.units).features
      .map(f => [f.id || f.properties.id, f.geometry]));
    log(`     ${file}  ${(fs.statSync(path.join(OUT, file)).size / 1024).toFixed(0)} KB`);
  }

  log('6/7  measuring (area, bbox, centroid, on-land label point)');
  const index = [];
  let pointFrom = { source: 0, coarse: 0, fine: 0 };
  for (const un of keep) {
    const f = features.find(x => x.properties.id === un.id);
    if (!f) continue;
    const rf = { type: 'Feature', properties: {}, geometry: rewindGeometry(f.geometry) };
    const area = d3.geoArea(rf) * R_EARTH * R_EARTH;
    const b = d3.geoBounds(rf);
    const c = d3.geoCentroid(rf);
    // The label anchor must sit inside the geometry the app actually draws, at
    // BOTH detail levels where possible. Try the full-resolution shape first,
    // then fall back to deriving it from the simplified shapes themselves.
    const gFine = drawn.fine.get(un.id), gCoarse = drawn.coarse.get(un.id);
    const candidates = [
      ['source', labelPoint(f.geometry)],
      ['coarse', gCoarse && labelPoint(gCoarse)],
      ['fine', gFine && labelPoint(gFine)],
    ].filter(x => x[1]);
    let lp = null, lpFrom = null;
    for (const [tag, pt] of candidates) {
      if (pointInGeometry(pt, gFine) && pointInGeometry(pt, gCoarse)) { lp = pt; lpFrom = tag; break; }
    }
    if (!lp) for (const [tag, pt] of candidates) {
      if (pointInGeometry(pt, gFine)) { lp = pt; lpFrom = tag; break; }
    }
    if (!lp) { lp = candidates[0][1]; lpFrom = 'source'; warn(`${un.id}: label point could not be verified inside the drawn geometry`); }
    pointFrom[lpFrom]++;
    index.push({
      id: un.id,
      name: un.name,
      aliases: un.aliases,
      kind: un.kind,
      sovereign_today: un.sovereign_today,
      iso_a2: un.iso_a2 || null,
      region: un.region,
      centroid: [round(c[0], 4), round(c[1], 4)],
      point: lp,
      area_km2: area >= 100 ? Math.round(area) : Math.round(area * 100) / 100,
      bbox: [round(b[0][0], 4), round(b[0][1], 4), round(b[1][0], 4), round(b[1][1], 4)],
      tiny: area < TINY_KM2,
      note: un.note || undefined,
    });
  }
  index.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  fs.writeFileSync(path.join(OUT, 'units.index.json'), JSON.stringify(index, null, 1) + '\n');
  log(`     label points derived from: ${JSON.stringify(pointFrom)}`);

  log('7/7  base map (land, lakes, graticule)');
  const mu = readNE('ne_10m_admin_0_map_units');
  const lakes = readNE('ne_10m_lakes');
  const bigLakes = { type: 'FeatureCollection', features: lakes.features.filter(f => (f.properties.scalerank ?? 9) <= 2) };
  const landRes = await ms(
    '-i land.json -dissolve2 -simplify visvalingam weighted keep-shapes percentage=10% -clean -rename-layers land -o land.json format=geojson',
    { 'land.json': { type: 'FeatureCollection', features: mu.features.map(f => ({ type: 'Feature', properties: {}, geometry: f.geometry })) } }
  );
  const lakeRes = await ms(
    '-i lakes.json -simplify visvalingam weighted keep-shapes percentage=6% -clean -rename-layers lakes -o lakes.json format=geojson',
    { 'lakes.json': bigLakes }
  );
  const base = await ms(
    '-i land.json lakes.json graticule.json combine-files -o base.json format=topojson quantization=1e5',
    {
      'land.json': landRes['land.json'],
      'lakes.json': { type: 'FeatureCollection', features: lakeRes['lakes.json'].features.map(f => ({ type: 'Feature', properties: { name: f.properties.name || null }, geometry: f.geometry })) },
      'graticule.json': graticule(15),
    }
  );
  fs.writeFileSync(path.join(OUT, 'land.topo.json'), JSON.stringify(base['base.json']));
  log(`     land.topo.json  ${(fs.statSync(path.join(OUT, 'land.topo.json')).size / 1024).toFixed(0)} KB`);

  // ---- summary ----
  log('');
  log(`units: ${index.length}   tiny: ${index.filter(x => x.tiny).length}   warnings: ${warnings.length}`);
  if (warnings.length) { log('WARNINGS:'); warnings.forEach(w => log('  - ' + w)); }
  fs.writeFileSync(path.join(CACHE, 'build-warnings.txt'), warnings.join('\n') + '\n');
}

main().catch(e => { console.error(e); process.exit(1); });
