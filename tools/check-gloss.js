#!/usr/bin/env node
/**
 * check-gloss.js — DOES THE PRINTED SENTENCE TELL THE TRUTH ABOUT THE RECORD?
 *
 * ================================ WHY THIS EXISTS =========================
 * Three times this atlas printed, in bold, a sentence its own record
 * contradicted. Each time the sentence came from one string keyed to a
 * mechanism tag:
 *
 *   round 1  `annexation-of-existing-colony` glossed "taken from another
 *            European coloniser" — printed over Kenya, whose counterparties are
 *            the African population of the highlands and Kenya's Indian
 *            population. No European anywhere in the record.
 *   round 3  `war-transfer` glossed "Handed over by another European power at
 *            the end of a war" — printed over Tipu Sultan's Mysore, Daulat Rao
 *            Scindia, the Lahore Durbar, Konbaung Burma, Nepal and Bhutan, with
 *            the true counterparty in smaller type directly beneath it.
 *   round 5  `purchase` glossed "Bought" — printed over the Treaty of Amritsar,
 *            at which Britain was the SELLER: the Company sold Kashmir, Ladakh
 *            and their people to Gulab Singh for 7.5 million rupees.
 *
 * Each was patched as a string, and the class came back in a new form. A string
 * fixed three times is not a typo. So the class is checked, mechanically, on
 * every build.
 *
 * ============================= WHAT IT ACTUALLY DOES ======================
 * Nothing here re-implements the app's prose. It imports `acquisitionGloss()`
 * out of app/js/panels/dossier/vocab.js — the one function allowed to turn a
 * mechanism into printed words — and renders the real sentence.
 *
 * Three passes:
 *
 *   A. LIVE       every acquisition as the app prints it today. Any
 *                 contradiction is an ERROR and fails the build.
 *   B. SWEEP      every acquisition re-tagged with each of the 14 mechanisms in
 *                 turn, with no direction — the fallback path. This is the
 *                 structural claim: a retag in a shard tomorrow cannot produce
 *                 a sentence that contradicts a record, because no gloss
 *                 reachable from a tag alone asserts a direction, an agent or a
 *                 party. Any hit here is an ERROR.
 *   C. TEETH      the full cross-product, every mechanism × every direction ×
 *                 every acquisition. These SHOULD mostly fail — a direction is
 *                 an assertion and most of them are false of most records — and
 *                 the count is printed as evidence that the checker is not
 *                 vacuous. `--selftest` additionally replays the three
 *                 historical regressions above from a cold start and fails if
 *                 any of them is not caught.
 *
 * ================================ THE TWO WITNESSES =======================
 * A generated sentence is checked against two things the record states for
 * itself, and never against the tag that produced it:
 *
 *   counterparties[]  structured. Warrants any claim about WHO the other party
 *                     was. `european-power` is the only warrant for the word
 *                     "European power"; a European named anywhere else in the
 *                     prose is not one, which is why Kenya 1920 is still caught
 *                     even though its `how` sentence says "European settlers".
 *   how (+ instrument) the record's own sentence. Warrants claims about the
 *                     DIRECTION of the transaction and the AGENT who acted.
 *                     Read independently of `acquisition.direction`, so the
 *                     field being checked is never its own witness.
 *
 * Only CONTRADICTION is reported, never silence: a headline that says "British
 * forces" over prose that names nobody is not flagged; one that says it over
 * prose naming only the Australian Naval and Military Expeditionary Force is.
 *
 * Usage
 *   node tools/check-gloss.js                 human report, exit 1 on any error
 *   node tools/check-gloss.js --json          machine-readable
 *   node tools/check-gloss.js --teeth         also print pass C in full
 *   node tools/check-gloss.js --selftest      replay the three regressions
 *   node tools/check-gloss.js --all           every rendered headline, for the
 *                                             hand sweep a checker cannot do
 * Also exported: `check(territories)` → findings[], used by tools/validate-data.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TERRITORY_DIR = path.join(ROOT, 'app', 'data', 'territories');
const VOCAB = path.join(ROOT, 'app', 'js', 'panels', 'dossier', 'vocab.js');
const FIELDS = path.join(ROOT, 'app', 'js', 'panels', 'dossier', 'fields.js');

/* ------------------------------------------------------------------ *
 * Load the app's own vocabulary. app/ is ES modules; tools/ is CommonJS
 * and package.json says "type": "commonjs", so the file is handed to the
 * ESM loader as a data: URL. vocab.js imports nothing, so nothing has to
 * resolve. This is the real module, not a copy: if it drifts, this drifts
 * with it.
 * ------------------------------------------------------------------ */
async function loadVocab() {
  const src = fs.readFileSync(VOCAB, 'utf8');
  return import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
}

/* THE ONE-FUNCTION RULE, ENFORCED IN SOURCE.
 * fields.js must re-export the gloss and add nothing. The moment a second
 * place starts deciding what a mechanism means, this checker is checking the
 * wrong function — which is exactly how round 3 survived round 1's fix. */
/* THE ROLE VOCABULARY LIVES IN TWO FILES AND MUST NOT DRIFT.
   app/data/schema.json says which roles a shard may state; vocab.js says what
   each one prints. A role in one and not the other is either a record that
   silently loses its label or a label no record can ever reach. */
function checkRoleVocabulary(V, out) {
  const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'app', 'data', 'schema.json'), 'utf8'));
  const enumed = (((schema.$defs || {}).counterparty || {}).properties || {}).role;
  const inSchema = new Set((enumed && enumed.enum) || []);
  const inVocab = new Set(Object.keys(V.COUNTERPARTY_ROLE || {}));
  for (const r of inVocab) if (!inSchema.has(r)) out.push({
    severity: 'error', pass: 'structure', id: 'app/data/schema.json', code: 'gloss/role-not-in-schema',
    message: 'vocab.js prints a label for counterparty role "' + r + '" and no shard may state it',
    hint: 'Add it to $defs.counterparty.properties.role.enum, or delete the label.',
  });
  for (const r of inSchema) if (!inVocab.has(r)) out.push({
    severity: 'error', pass: 'structure', id: 'panels/dossier/vocab.js', code: 'gloss/role-not-in-vocab',
    message: 'the schema lets a shard state counterparty role "' + r + '" and vocab.js prints no label for it',
    hint: 'Add it to COUNTERPARTY_ROLE and to ROLE_ORDER, or remove it from the schema enum.',
  });
  const ordered = new Set(V.ROLE_ORDER || []);
  for (const r of inVocab) if (!ordered.has(r)) out.push({
    severity: 'error', pass: 'structure', id: 'panels/dossier/vocab.js', code: 'gloss/role-not-ordered',
    message: 'counterparty role "' + r + '" is not in ROLE_ORDER, so a record that states it prints no group at all',
    hint: 'Add it to ROLE_ORDER in the position its loss deserves.',
  });
}

function checkDelegation(out) {
  const src = fs.readFileSync(FIELDS, 'utf8');
  if (!/export const acquisitionVerb = acquisitionGloss;/.test(src)) {
    out.push({
      severity: 'error', pass: 'structure', id: 'panels/dossier/fields.js',
      code: 'gloss/second-author',
      message: 'fields.js no longer re-exports acquisitionGloss verbatim — a second place is deciding what a mechanism means',
      hint: 'Restore `export const acquisitionVerb = acquisitionGloss;` and put any new logic in vocab.js, where check-gloss.js can see it.',
    });
  }
}

/* ------------------------------------------------------------------ *
 * WITNESS 1 — the record's own sentence.
 * Deliberately conservative. Every pattern below had to survive being read
 * against all 510 `how` sentences in the dataset without a false positive.
 * ------------------------------------------------------------------ */
const BRITISH_SUBJECT = '(?:Britain|British|England|English|the Crown|Parliament|the Company|the East India Company|Canada|the Treasury)';

function readProse(a) {
  const how = String(a.how || '');
  const instr = String((a.instrument && a.instrument.name) || '');
  const text = how + ' · ' + instr;
  const t = text.toLowerCase();

  const sells = new RegExp(BRITISH_SUBJECT + '[^.;]{0,60}\\b(sold|sells|sold on|sold it)\\b', 'i').test(text)
    || /\b(the Company|Britain|the Crown|Parliament)\b[^.;]{0,80}\bsold\b/i.test(text);
  const money = /\bbought\b|\bbuys\b|\bpurchas\w*\b|\bpaid\b|\bfor [\d,]+ (?:dollars|rupees|pounds)\b|£[\d,]/i.test(text);
  const rented = /\bleas(?:e|ed|ing)\b|\brent\b|\bannual payment\b|\ba year\b/i.test(text);
  const buys = new RegExp(BRITISH_SUBJECT + '[^.;]{0,60}\\b(bought|buys|paid|purchased)\\b', 'i').test(text)
    || /\bbought (?:by )?(?:Britain|the Company|Parliament)\b/i.test(text)
    || /\b(?:Disraeli|Canada|Britain|Parliament|the Company)\b[^.;]{0,60}\bbought\b/i.test(text);

  /* Who is named as having done it. A record may name more than one. */
  const agent = new Set();
  if (/\bRoyal Navy\b|\bRoyal Marines\b|\bBritish (?:troops|forces|force|expedition|squadron|garrison|warships|marines|army|commissioners|officers|officials|and Indian troops)\b|\bHMS \w+|\bthe Eighth Army\b|\bBritain (?:invaded|bombarded|occupied|took|landed|annexed|reoccupied|garrisoned|declared)\b|\bA British\b|\bBritish and\b/i.test(text)) agent.add('british');
  if (/\bAustralian\b|\bNew Zealand\b|\bANMEF\b|\bAustralian Naval and Military Expeditionary Force\b|\bQueensland\b/i.test(text)) agent.add('dominion');
  if (/\bEast India Company\b|\bthe Company\b|\bMadras expedition\b|\bBombay\b|\bIndian Army\b|\bIndian Division\b|\bIndian troops\b|\bSepoy\b/i.test(text)) agent.add('company-or-india');
  if (/\bAnglo-French\b|\bFrench troops\b|\band French\b|\bFree French\b|\bRed Army\b|\bFaisal\b|\bSwedish\b|\bAllied\b|\bAllies\b|\bCommonwealth forces\b|\bEthiopian forces\b|\bUnited States\b|\bfour Allied powers\b/i.test(text)) agent.add('allied');

  /* DID ANYBODY STAY, OR WAS THIS A FLAG AND A SIGNATURE?
     Two positive signals, and a finding needs both to fire. "Landed" alone is
     not a settlement: Cook landed at Possession Bay, took South Georgia for
     George III and sailed on. So `settled` looks for people who stayed, and
     `paperClaim` looks for the instrument or the gesture that was the whole
     act. A rule fires only where the two CONTRADICT the printed sentence —
     silence in the record is never a finding. */
  const settled = /\bsettl(?:e|ed|es|er|ers|ement|ements|ing)\b|\bcolonists?\b|\bcolony\b|\bfounded\b|\bconvicts?\b|\bgarrison\b|\bbuil[dt] (?:a |the )?(?:town|palisade|fort|colony|factory|house|trading post|lodge|stockaded|station)\b|\bput up a house\b|\bmoved (?:in|onto|his congregation)\b|\bcame down every year\b|\bpenal (?:colony|settlement)\b|\bpunishment station\b|\breoccupied\b|\bprivate estate\b|\btimber crews\b|\bplanted tobacco\b|\bcut a clearing\b|\bmangrove creeks\b/i.test(text);
  const paperClaim = /\bletters patent\b|\border in council\b|\braised a flag\b|\basserted sovereignty\b|\bproclaimed [A-Za-z ]{0,20}sovereignty\b|\bclaim(?:ed|ing) the (?:place|island|islands|whole group|group|sector|whole)\b|\bannexed the uninhabited\b|\btook the island for\b|\bwithout ever passing a law\b|\btook possession of the whole\b|\bsailed away\b/i.test(text);

  return {
    text, how, instr,
    money: { sells, buys, any: money, rented },
    agent,
    settled,
    paperClaim,
    mentionsCompany: /\bchartered\b|\bcharter\b|\bcompany\b/i.test(t),
    crownGrant: /\b(?:Charles I|Charles II|Elizabeth I|James VI|Henry VIII|the Crown|Parliament|Britain|the King|the Queen)\b[^.;]{0,60}\b(?:granted|gave|chartered|leased|licensed)\b/i.test(text)
      || /\b(?:granted|gave|chartered) [^.;]{0,40}\b(?:a |the )?(?:royal )?(?:charter|licence|monopoly|grant)\b/i.test(text)
      || /\btook a royal charter\b|\bturned that document into a royal charter\b|\bunder a trust charter\b/i.test(text),
  };
}

/* ------------------------------------------------------------------ *
 * WITNESS 2 — the counterparties, and what the sentence claims about them.
 * ------------------------------------------------------------------ */
const ASSERTIONS = [
  {
    id: 'party/european',
    re: /\bEuropean power\b|\bEuropeans\b|\bEuropean coloniser\b|\banother European\b/i,
    says: 'that the other party was a European power',
    ok: (rec) => rec.kinds.has('european-power'),
    why: (rec) => 'the record names no counterparty of kind european-power (' + rec.kindList + ')',
  },
  {
    id: 'party/another-power',
    re: /\banother power\b|\bjointly with\b/i,
    says: 'that another state held this jointly with Britain',
    ok: (rec) => rec.a.mechanism === 'condominium' || rec.kinds.has('european-power') || rec.kinds.has('empire') || rec.kinds.has('regional-state'),
    why: () => 'no second state is named in the record, and the mechanism is not condominium',
  },
  {
    id: 'direction/britain-pays',
    re: /\bBought\b|\bBritain (?:bought|paid)\b/i,
    says: 'that Britain was the buyer',
    /* Not "the record does not contradict it" but "the record affirms it": a
       purchase headline over a sentence that never mentions money is how
       "Bought" came to sit over Francis Day's annual rent for the Madras sand. */
    ok: (rec) => rec.prose.money.any && !rec.prose.money.sells,
    why: (rec) => (rec.prose.money.sells
      ? 'the record’s own sentence says Britain was the seller: “' + clip(rec.prose.how) + '”'
      : 'the record’s own sentence names no payment by Britain: “' + clip(rec.prose.how) + '”'),
  },
  {
    id: 'direction/britain-receives',
    re: /\bSold (?:on )?by Britain\b|\bBritain sold\b/i,
    says: 'that Britain was the seller',
    ok: (rec) => rec.prose.money.sells,
    why: (rec) => 'the record’s own sentence does not say Britain sold anything: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'direction/private-buyer',
    re: /\bBought by a British subject\b/i,
    says: 'that a private British buyer paid for this',
    ok: (rec) => rec.prose.money.any,
    why: () => 'the record names no payment',
  },
  {
    id: 'direction/dominion-buys',
    re: /\bBought by a self-governing colony\b/i,
    says: 'that a self-governing colony was the buyer',
    ok: (rec) => /\bCanada\b|\bAustralia\b|\bNew Zealand\b|\bthe Cape\b/i.test(rec.prose.text),
    why: () => 'the record names no self-governing colony as the buyer',
  },
  {
    id: 'direction/rent-paid',
    re: /\bRented from the ruler who owned it\b/i,
    says: 'that this was rented, not bought',
    ok: (rec) => rec.prose.money.rented,
    why: () => 'the record names no lease or rent',
  },
  {
    id: 'consent/duress',
    re: /\bunder threat of force\b/i,
    says: 'that the signature was obtained under threat of force',
    ok: (rec) => /\bguns?\b|\bwarship\b|\bfleet\b|\bshell(?:ed|ing)\b|\bbombard\w*\b|\bimposed\b|\btroops\b|\bburn(?:ed|t)\b|\bprotest\b|\bdemanded\b|\bopen fire\b|\bmiddle of a war\b/i.test(rec.prose.text),
    why: (rec) => 'the record describes no force or threat: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'consent/disputed-text',
    re: /\bthe two texts do not agree\b/i,
    says: 'that the treaty exists in two texts that say different things',
    ok: (rec) => /\bdid not say the same thing\b|\btwo texts\b|\bversions did not say\b|\bthe .{0,20}text .{0,30}and the .{0,20}text\b/i.test(rec.prose.text),
    why: () => 'the record does not say the texts disagree',
  },
  {
    id: 'consent/third-party',
    re: /\bby a third state, not by the people it covered\b/i,
    says: 'that a third state signed away somebody else’s country',
    ok: (rec) => /\bnobody in \w+ was consulted\b|\bnot consulted\b|\btransferred (?:its claim|[A-Z]\w+)\b|\bhanded its rights\b|\bwas transferred to Britain\b/i.test(rec.prose.text),
    why: (rec) => 'the record does not describe a third state signing: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'agent/british-forces',
    re: /\bOccupied by British forces\b|\bBritish troops\b/i,
    says: 'that British troops did this',
    ok: (rec) => rec.prose.agent.has('british') || rec.prose.agent.size === 0,
    why: (rec) => 'the record names only ' + [...rec.prose.agent].join(', ') + ' forces',
  },
  {
    id: 'agent/dominion-forces',
    re: /\bAustralian or New Zealand forces\b/i,
    says: 'that Australian or New Zealand troops did this',
    ok: (rec) => rec.prose.agent.has('dominion'),
    why: () => 'the record names no Australian or New Zealand force',
  },
  {
    id: 'agent/company-forces',
    re: /\bEast India Company troops\b/i,
    says: 'that East India Company troops did this',
    ok: (rec) => rec.prose.agent.has('company-or-india'),
    why: () => 'the record names no Company force',
  },
  {
    id: 'agent/allied-forces',
    re: /\btogether with an ally\b/i,
    says: 'that Britain acted with a non-British ally',
    ok: (rec) => rec.prose.agent.has('allied'),
    why: () => 'the record names no ally',
  },
  {
    id: 'agent/settlers',
    re: /\bSettled by British subjects\b/i,
    says: 'that British subjects settled here',
    ok: (rec) => rec.prose.settled || !rec.prose.paperClaim,
    why: (rec) => 'the record describes a paper claim and nobody staying: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'agent/no-settlement',
    re: /\bwith nobody left behind\b/i,
    says: 'that nobody stayed',
    ok: (rec) => !rec.prose.settled,
    why: (rec) => 'the record describes people settling: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'agent/proclamation',
    re: /\bby proclamation\b/i,
    says: 'that this was done by a proclamation, patent or order',
    ok: (rec) => rec.prose.paperClaim,
    why: (rec) => 'the record names no proclamation, letters patent or Order in Council: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'agent/penal',
    re: /\bSettled as a penal colony\b/i,
    says: 'that this was a penal settlement',
    ok: (rec) => /\bconvicts?\b|\bprisoners\b|\bpenal\b|\bpunishment station\b/i.test(rec.prose.text),
    why: () => 'the record names no convicts or prisoners',
  },
  {
    id: 'agent/existing-settlement',
    re: /\bAn existing settlement brought under the Crown\b/i,
    says: 'that a settlement was already here',
    ok: (rec) => rec.prose.settled,
    why: () => 'the record describes no settlement already on the ground',
  },
  {
    id: 'agent/crown-grant',
    re: /\bGranted to a chartered company by the Crown\b|\bHanded to a chartered company\b/i,
    says: 'that the Crown granted this to a company',
    /* Contradiction, not absence: fires where the record says the company put
       itself here on locally granted ground, or on none at all. */
    ok: (rec) => rec.prose.crownGrant || !/\bwithout asking permission\b|\bground granted by the local ruler\b|\basked the chiefs\b|\bheld no charter\b|\bgave the British South Africa Company\b/i.test(rec.prose.text),
    why: (rec) => 'the record says the company put itself here without a Crown grant of the ground: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'agent/company-post',
    re: /\bA chartered company put a post here\b/i,
    says: 'that a company established itself here without a Crown grant of the ground',
    ok: (rec) => rec.prose.mentionsCompany || !rec.prose.crownGrant,
    why: (rec) => 'the record describes a Crown grant: “' + clip(rec.prose.how) + '”',
  },
  {
    id: 'direction/into-british-rule',
    re: /\bAnnexed whole into British rule\b|\bAbsorbed whole into British rule\b/i,
    says: 'that something outside British rule was brought inside it',
    ok: (rec) => !/\b(?:British colonies|its own colonies|its own possessions|self-governing British colonies|already British|three of its own|four of its own)\b/i.test(rec.prose.text),
    why: () => 'the record says the parties were already British',
  },
];

const clip = (s) => (String(s || '').length > 120 ? String(s).slice(0, 117) + '…' : String(s || ''));

/* ------------------------------------------------------------------ *
 * The render + judge step.
 * ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ *
 * ROUND 6 — WHAT THIS FUNCTION USED TO MISS.
 *
 * It rendered `acquisitionGloss()` and judged that string. The page printed
 * three lines, and the verb was only the middle one:
 *
 *     HOW IT WAS TAKEN, AND FROM WHOM
 *     Kept when the surrounding country was lost, 1204
 *     TAKEN FROM  The Duchy of Normandy …; The islanders of Jersey
 *
 * so this file reported PASS across 21,482 renderings while twelve live
 * dossiers printed a contradiction, because the contradiction was between the
 * verb and the frame and the frame was not in the string being checked.
 *
 * It now renders `V.takenBlock()` — the object dossier.js renders and composes
 * nothing of its own around — and judges `block.text`: eyebrow, verb, the
 * secondary-mechanism qualifier, and every counterparty label with the names
 * that sit beside it. Same words, same order, one function.
 * ------------------------------------------------------------------ */
function judge(V, t, a, over) {
  if (!LOSS_LABELS) buildLossLabels(V);
  const acq = over ? Object.assign({}, a, over) : a;
  let block;
  try {
    block = V.takenBlock(acq, over && over.__frame ? over.__frame : {});
  } catch (e) {
    block = { text: '((threw: ' + e.message + '))', verb: '((threw))', eyebrow: '', also: [], groups: [], key: '' };
  }
  const kinds = new Set((a.counterparties || []).map((c) => c && c.kind).filter(Boolean));
  const rec = {
    t, a: acq, kinds, block,
    kindList: [...kinds].join(', ') || 'no counterparty kinds recorded',
    prose: readProse(a),
    from: (a.counterparties || []).map((c) => c.name).join('; ') || 'no counterparty recorded',
    cps: (a.counterparties || []),
  };
  const hits = [];
  /* The verb rules run over the whole block, so a verb rule also fires when the
     LABEL asserts the same thing the verb is not allowed to. */
  for (const rule of ASSERTIONS) {
    if (!rule.re.test(block.text)) continue;
    if (rule.ok(rec)) continue;
    hits.push({ rule: rule.id, says: rule.says, why: rule.why(rec) });
  }
  /* The frame rules read the block as a structure: which label sits over which
     names, and what those names' own records say they lost.
     `witness: 'record'` rules are skipped under a counterfactual retag (pass B),
     because there the record and the tag are inconsistent BY CONSTRUCTION and
     the finding would be about the fixture, not about the prose. The rules that
     compare the block's own lines with each other run in every pass, and they
     are the ones that carry the structural claim. */
  const witnessOk = (rule) => (over && over.mechanism ? rule.witness !== 'record' : true);
  for (const rule of FRAME_ASSERTIONS) {
    if (!witnessOk(rule)) continue;
    const h = rule.test(rec, block);
    if (h) hits.push({ rule: rule.id, says: rule.says, why: h });
  }
  return { headline: block.verb, block, text: block.text, from: rec.from, hits };
}

/* ------------------------------------------------------------------ *
 * WITNESS 3 — THE LABEL BESIDE THE NAMES.
 *
 * Every rule below compares one printed label with something the record states
 * for itself: the verb the same function resolved, the counterparty's own
 * `lost` sentence, or its `kind`. None of them reads `acquisition.direction`,
 * so the field under test is never its own witness.
 * ------------------------------------------------------------------ */

/* Verbs that say NOTHING WAS TAKEN FROM ANYBODY. A label saying "taken from"
   over any of these contradicts the line above it, which is the entire class. */
const NOT_A_TAKING = /\bJoined with others into one state\b|\bKept when the surrounding country was lost\b|\bSold on by Britain\b|\bMoved from one British administration to another\b|\bHanded to a chartered company by the Crown\b|\bLeased out by Britain\b|\bSigned away by Britain\b|\bwith nobody left behind\b/i;

const TAKEN_LABEL = /\bTAKEN FROM\b/;
const takenGroups = (b) => (b.groups || []).filter((g) => /^Taken from$/i.test(g.key));
/* A group whose label came from a DERIVED frame rather than from a role stated
   on each name in it. Those are the ones that can contradict the verb: where a
   record gives a party a role, the record has said what that party was, and the
   verb is describing the step while the role describes the party. The 1946
   Malayan Union both joined eleven territories into one colony AND took the
   nine sultans' sovereignty; only a record that says so per party can print
   both, and this atlas now does. */
const derivedGroups = (b) => (b.groups || []).filter((g) => !g.role);

/* WHICH LABELS ASSERT THAT THE PARTY LOST SOMETHING.
   Built from vocab.js by ROLE ID and FRAME ID, never by matching the printed
   words, so renaming a label in vocab.js cannot silently switch the rule off —
   it throws instead. `Leased from` and `Rented from` are deliberately absent:
   a lessor keeps the freehold, and the record says so. `Who lost, and who
   stayed` is absent because mixing is its entire purpose. */
const LOSS_ROLES = ['dispossessed', 'ceded-it', 'sold-it', 'lost-around-it'];
const LOSS_FRAMES = ['taken-from', 'sold-by', 'bought-from', 'signed-by', 'ceded-by'];
let LOSS_LABELS = null;
/* The narrower set: labels that say the thing was taken OUT OF this party's
   hands as a dispossession. "SOLD, AND WHO LOST BY IT … The people of the
   Kashmir valley" over "They were sold." is not a contradiction — it is the
   label the record earned. "TAKEN FROM" over it was. */
let TAKEN_LABELS = null;
function buildLossLabels(V) {
  const keys = new Set();
  TAKEN_LABELS = new Set([V.FRAME['taken-from'].key, V.COUNTERPARTY_ROLE['dispossessed']]);
  for (const r of LOSS_ROLES) {
    const k = V.COUNTERPARTY_ROLE[r];
    if (!k) throw new Error('check-gloss.js: counterparty role "' + r + '" is gone from vocab.js; the loss-label rule cannot be built');
    keys.add(k);
  }
  for (const f of LOSS_FRAMES) {
    const fr = V.FRAME && V.FRAME[f];
    if (!fr || !fr.key) throw new Error('check-gloss.js: frame "' + f + '" is gone from vocab.js; the loss-label rule cannot be built');
    keys.add(fr.key);
  }
  LOSS_LABELS = keys;
}
const assertsLoss = (g) => !!(LOSS_LABELS && LOSS_LABELS.has(g.key));
const assertsTaking = (g) => !!(TAKEN_LABELS && TAKEN_LABELS.has(g.key));
/* Frames whose counterparty list is mixed by nature — a federation's members
   and the people nobody asked; a Crown grantor and the nation whose ground it
   was — and which therefore may not print one label over the whole list. */
const FRAMES_NEEDING_ROLES = new Set(['joined-by', 'granted-by']);

/* A counterparty's own account of what it lost. 745 of the 764 counterparties
   in the dataset carry one, so this is a real witness, not a hoped-for one.
   ROUND 7 — WHY THIS IS NOW THE WHOLE DENIAL AND NOT A NARROW ONE.
   The old rule fired only on a flat denial with no "yet", "immediately" or
   "they had not already", AND only when every name under the label said it. It
   passed clean while eighteen groups printed an act label over a party that
   denied the loss, because (a) a group that mixed one real loser with one
   non-loser escaped, and (b) "Nothing immediately … but they lost that status
   as British planters pushed inland" was read as consent to the label when it
   is a statement about the DATE — and a date is what a historical atlas is for.
   Both softenings are gone. Any `lost` that OPENS by denying the loss is a
   denial, and the answer is the same in every case: state the role. Fourteen
   roles say which kind of non-loss it was, including four written for exactly
   these records — `lost-it-later`, `unchanged`, `gained`, `drove-it-out`. */
const lostDeniesLoss = (c) => /^\s*(nothing|none|little|almost nothing|hardly anything|not much|nothing much)\b/i.test(String(c.lost || ''));

/* ROUND 7, THE FOURTH SHAPE, found by hand and not by the rule above.
   "TAKEN FROM … The state of Fetu", over a record whose next sentence is
   "Fetu's ruler had granted the ground and taken rent from Swedes, Danes and
   Dutch in turn". "TAKEN FROM … The royalist planters of Saint-Domingue", over
   "They invited the British in to save slavery and signed away their colony's
   sovereignty by the Whitehall accords." Neither denies a loss — both lost, and
   heavily — so no rule about denial can see them. What they contradict is the
   DIRECTION: the label says it was taken out of their hands and their own
   record says they put it into Britain's. That is the same defect as Kashmir,
   one field further down.
   The negation guard is not decoration: "handed to a French mandate they had
   not asked for" is the people of Syria saying the opposite, and a rule that
   read it as consent would be worse than no rule. */
const HANDED_IT_OVER = /\b(?:they invited|invited the (?:British|English|Company)|had granted the ground|granted the ground and|signed away (?:their|its)|signed it (?:over|away)|asked (?:Britain|the British|the Company) (?:to|for)|had asked (?:Britain|the British) to)\b/i;
const NOT_ASKED_AT_ALL = /\b(?:had not asked|did not ask|never asked|without (?:being )?asking|they had not asked|not asked for)\b/i;
const lostSaysTheyHandedItOver = (c) => {
  const t = String(c.lost || '') + ' · ' + String(c.note || '');
  if (NOT_ASKED_AT_ALL.test(t)) return false;
  return HANDED_IT_OVER.test(t);
};
/* "They were sold." — the Kashmiris' own entry, printed two clicks from a
   label that said the valley was taken from them. Anchored to the subject so
   that "an island Norway had sold to Scotland in 1266" is not a hit. */
const lostSaysSold = (c) => /^\s*(?:they|their people|the people[^.]{0,40})\s+were sold\b/i.test(String(c.lost || ''));

const FRAME_ASSERTIONS = [
  {
    id: 'frame/taken-from-a-non-taking',
    says: 'that something was taken from these people',
    test: (rec, b) => {
      if (!derivedGroups(b).some((g) => /^Taken from$/i.test(g.key))) return null;
      if (!NOT_A_TAKING.test(b.verb)) return null;
      return 'the verb printed one line above says the opposite: “' + b.verb + '”';
    },
  },
  {
    id: 'frame/eyebrow-contradicts-verb',
    says: 'in its eyebrow that this was a taking',
    test: (rec, b) => {
      if (!/^How it was taken/i.test(b.eyebrow)) return null;
      if (!NOT_A_TAKING.test(b.verb)) return null;
      return 'the verb under it says “' + b.verb + '”';
    },
  },
  {
    /* PER COUNTERPARTY, NOT PER GROUP, AND OVER EVERY LABEL THAT ASSERTS A LOSS.
       The old version asked "does EVERY name under TAKEN FROM deny it?", so
       "TAKEN FROM The Sikh empire; The people of the Kashmir valley" was clean
       as long as one of the two really had lost something. That is how a class
       fixed three times came back a fourth. It now asks the question the reader
       asks, which is about one name at a time. */
    id: 'frame/label-contradicts-lost',
    witness: 'record',
    says: 'that this party lost something by this step',
    test: (rec, b) => {
      for (const g of (b.groups || [])) {
        if (!assertsLoss(g)) continue;
        for (const name of g.names) {
          const c = rec.cps.find((x) => x.name === name);
          if (!c) continue;
          if (assertsTaking(g) && lostSaysSold(c)) {
            return '“' + g.key.toUpperCase() + ' … ' + name + '”, and that party’s own entry says: “' + clip(c.lost) + '”';
          }
          if (lostDeniesLoss(c)) {
            return '“' + g.key.toUpperCase() + ' … ' + name + '”, and that party’s own entry opens by denying it: “'
              + clip(c.lost) + '” — state a role (unchanged, lost-it-later, gained, drove-it-out, covered, stayed, pre-empted)';
          }
        }
      }
      return null;
    },
  },
  {
    id: 'frame/taken-from-a-party-that-handed-it-over',
    witness: 'record',
    says: 'that this was taken out of the hands of a party whose own record says it put it into Britain’s',
    test: (rec, b) => {
      for (const g of (b.groups || [])) {
        if (!assertsTaking(g)) continue;
        for (const name of g.names) {
          const c = rec.cps.find((x) => x.name === name);
          if (!c || c.role) continue;
          if (!lostSaysTheyHandedItOver(c)) continue;
          return '“' + g.key.toUpperCase() + ' … ' + name + '”, and that party’s own entry says it handed it over: “'
            + clip(c.lost) + '” — state a role (ceded-it, granted-it, sold-it)';
        }
      }
      return null;
    },
  },
  {
    /* ASCENSION 1815 AND TRISTAN 1816 printed "TAKEN FROM No resident
       population; The United States and France as naval rivals". Neither party
       denies a loss in its `lost` field — the rivals really did lose the use of
       the island — so the rule above cannot see it. The contradiction is
       between the two names: a record that states there was nobody there has
       said that nothing was taken FROM anybody, and what the rival lost was a
       claim. So a step whose own counterparty list contains a
       `no-resident-population` may not print a loss label over anyone else
       without saying, in the record, what that party was. */
    id: 'frame/taken-from-where-nobody-was',
    witness: 'record',
    says: 'that this was taken from a party, on a step whose record says nobody was there',
    test: (rec, b) => {
      if (!rec.cps.some((c) => c && c.kind === 'no-resident-population')) return null;
      for (const g of (b.groups || [])) {
        if (!assertsTaking(g)) continue;
        for (const name of g.names) {
          const c = rec.cps.find((x) => x.name === name);
          if (!c || c.role || c.kind === 'no-resident-population') continue;
          return '“' + g.key.toUpperCase() + ' … ' + name + '”, on a step whose own record also names “No resident population”'
            + ' — nothing was taken from anybody living there; say what this party was (pre-empted, held-it-before)';
        }
      }
      return null;
    },
  },
  {
    id: 'frame/label-contradicts-role',
    witness: 'record',
    says: 'a relationship the counterparty’s own role denies',
    test: (rec, b) => {
      for (const g of (b.groups || [])) {
        for (const name of g.names) {
          const c = rec.cps.find((x) => x.name === name);
          if (!c || !c.role) continue;
          if (/^Taken from$/i.test(g.key) && c.role !== 'dispossessed') {
            return '“' + name + '” is recorded with role "' + c.role + '", not dispossessed';
          }
        }
      }
      return null;
    },
  },
  {
    id: 'frame/taken-from-the-grantor',
    witness: 'record',
    says: 'that this was taken from the Crown that granted it',
    test: (rec, b) => {
      if (!takenGroups(b).length) return null;
      if (!rec.prose.crownGrant) return null;
      for (const g of takenGroups(b)) {
        for (const name of g.names) {
          if (/\bCharles (?:I|II)\b|\bElizabeth I\b|\bJames (?:I|VI)\b|\bthe (?:English |British )?Crown\b|\bthe King\b|\bParliament\b/i.test(name)) {
            return '“' + name + '” granted this: “' + clip(rec.prose.how) + '”';
          }
        }
      }
      return null;
    },
  },
  {
    id: 'frame/no-label',
    says: 'nothing at all about who the other parties were',
    test: (rec, b) => {
      if (!rec.cps.length) return null;
      if (b.groups && b.groups.length) return null;
      return 'the record names ' + rec.cps.length + ' counterparties and the block prints no label for them';
    },
  },
  {
    /* THE TRIPWIRE ON `kind: other`.
       The split that keeps the Baganda peasantry out from under "Signed over
       by" reads `kind`, and `kind: other` covers both "The Dukes of Atholl",
       who sold the Isle of Man, and "The people of Sylhet", who were moved
       between two provinces without being asked. So the NAME is read too: a
       counterparty a record calls a people, a peasantry, villagers or
       inhabitants may not sit under a label that says it signed, sold, leased,
       joined, granted or administered anything. The fix is a stated role, not
       a wider label. */
    id: 'frame/act-label-over-a-population',
    witness: 'record',
    says: 'that these people performed the act in the label',
    test: (rec, b) => {
      const ACT_KEY = /^(Signed over by|Signed away to|Who signed, and who was not asked|Ceded by|Leased from|Leased to|Bought from|Rented from|The administrations involved|Who joined|Granted by)$/i;
      const POPULATION = /^The (?:people|peasantry|villagers|inhabitants|residents|population|fishermen|settlers)\b|\bpeasantry\b|\bvillagers\b|^The (?:Manx|Acadians|Chagossians)\b|\bthe people of\b/i;
      for (const g of (b.groups || [])) {
        if (!ACT_KEY.test(g.key)) continue;
        /* A group the record itself roled is the record speaking: the people of
           Newfoundland and Labrador really did vote themselves into Canada. */
        const hit = g.names.find((n) => {
          const c = rec.cps.find((x) => x.name === n);
          return POPULATION.test(n) && !(c && c.role);
        });
        if (hit) return '“' + hit + '” is a population, and it sits under a label that says “' + g.key + '”';
      }
      return null;
    },
  },
  {
    id: 'frame/mixed-list-needs-roles',
    witness: 'record',
    says: 'one relationship over a list that holds more than one',
    test: (rec, b) => {
      if (!FRAMES_NEEDING_ROLES.has(b.frame)) return null;
      if (!rec.cps.length) return null;
      const missing = rec.cps.filter((c) => !c.role).map((c) => c.name);
      if (!missing.length) return null;
      return 'a "' + b.frame + '" step must say what each party was to it, and '
        + missing.length + ' of ' + rec.cps.length + ' state no role: “' + missing[0] + '”';
    },
  },
  {
    id: 'frame/unknown-frame',
    says: 'a label this module cannot resolve',
    test: (rec, b) => (b.frame && b.key ? null : 'takenBlock() resolved no frame for mechanism "' + (rec.a.mechanism || '?') + '"'),
  },
];

/* ------------------------------------------------------------------ *
 * The three passes.
 * ------------------------------------------------------------------ */
function check(V, territories, opts) {
  const o = opts || {};
  const out = [];
  const rendered = [];
  let sweptRenders = 0, teethRenders = 0, teethCaught = 0;

  const mechanisms = Object.keys(V.MECHANISM_GLOSS);

  for (const t of territories) {
    for (const a of t.acquisitions || []) {
      const where = t.id + '/' + (a.id || a.mechanism);

      /* ---- rule 0: a direction-bearing mechanism must state its direction */
      const table = V.MECHANISM_DIRECTION[a.mechanism];
      if (table) {
        if (!a.direction) {
          out.push({
            severity: 'error', pass: 'live', id: where, code: 'gloss/direction-missing',
            message: `mechanism "${a.mechanism}" needs a direction and this record states none, so the dossier falls back to the category`,
            hint: 'One of: ' + Object.keys(table).join(' | '),
          });
        } else if (!Object.prototype.hasOwnProperty.call(table, a.direction)) {
          out.push({
            severity: 'error', pass: 'live', id: where, code: 'gloss/direction-wrong-mechanism',
            message: `direction "${a.direction}" is not one of the directions "${a.mechanism}" allows`,
            hint: 'One of: ' + Object.keys(table).join(' | '),
          });
        }
      } else if (a.direction) {
        out.push({
          severity: 'error', pass: 'live', id: where, code: 'gloss/direction-not-allowed',
          message: `mechanism "${a.mechanism}" takes no direction, but this record states "${a.direction}"`,
          hint: 'Directions exist only where the tag genuinely leaves the direction, the agent or the party open.',
        });
      }
      if (a.mechanism === 'condominium' && !a.jointlyWith) {
        out.push({
          severity: 'error', pass: 'live', id: where, code: 'gloss/condominium-partner-missing',
          message: 'a condominium headline says "held jointly" and this record does not name the other power',
          hint: 'Add jointlyWith: the co-sovereign, named.',
        });
      }

      /* ---- pass A: what the app prints today --------------------------- */
      const live = judge(V, t, a);
      rendered.push({ id: where, mechanism: a.mechanism, direction: a.direction || null, headline: live.headline, block: live.block, text: live.text, from: live.from, region: t.region, year: (a.date && a.date.display) || '' });
      for (const h of live.hits) {
        out.push({
          severity: 'error', pass: 'live', id: where, code: 'gloss/contradiction',
          message: `the dossier block "${live.text}" asserts ${h.says}, but ${h.why}`,
          hint: 'rule ' + h.rule,
        });
      }

      /* ---- pass B: every mechanism, no direction — the fallback path ---- */
      for (const m of mechanisms) {
        sweptRenders++;
        const r = judge(V, t, a, { mechanism: m, direction: undefined });
        for (const h of r.hits) {
          out.push({
            severity: 'error', pass: 'sweep', id: where, code: 'gloss/tag-can-lie',
            message: `re-tagged as "${m}" the headline "${r.headline}" would assert ${h.says}, but ${h.why}`,
            hint: 'A gloss reachable from a mechanism tag alone must be true of every record that could carry the tag.',
          });
        }
      }

      /* ---- pass C: the full cross-product — proof the checker has teeth - */
      for (const m of mechanisms) {
        const dirs = V.MECHANISM_DIRECTION[m] ? Object.keys(V.MECHANISM_DIRECTION[m]) : [];
        for (const d of dirs) {
          teethRenders++;
          const r = judge(V, t, a, { mechanism: m, direction: d });
          if (r.hits.length) {
            teethCaught++;
            if (o.teeth) out.push({ severity: 'info', pass: 'teeth', id: where, code: 'gloss/caught', message: `${m}/${d} → "${r.headline}" — ${r.hits[0].why}` });
          }
        }
      }
    }
  }
  return { findings: out, rendered, stats: { sweptRenders, teethRenders, teethCaught } };
}

/* ------------------------------------------------------------------ *
 * PASS D — THE OTHER SURFACES.
 *
 * The dossier is not the only place a mechanism tag becomes prose. The
 * mechanism matrix, the timeline's change cards, the compare diff, the layers
 * rail and the tours all keep their own tables, owned by other agents. This
 * pass does not edit them and cannot: it reads them, runs the same assertion
 * patterns over any string they key to a mechanism, and reports what it finds
 * as a WARNING naming the file and the line — so the class is visible
 * everywhere it lives, and the owning agent gets a line number rather than a
 * lecture. Comment lines are skipped: several of these files carry the round-3
 * post-mortem in their comments, and quoting a defect is not committing one.
 * ------------------------------------------------------------------ */
const MECH_IDS = /'(?:conquest|occupation|protectorate-declared|annexation-of-existing-colony|treaty-cession|settlement|chartered-company|informal-influence|war-transfer|purchase|mandate|trusteeship|lease|condominium)'|(?:^|[{,\s])(?:conquest|purchase|lease|mandate|trusteeship|settlement|occupation)\s*:/;
const OTHER_SURFACE_RULES = [
  { id: 'party/european', re: /\b(?:another European power|European coloniser|from Europeans)\b/i,
    say: 'names a European counterparty from the tag alone' },
  { id: 'direction/buyer', re: /\bBritain (?:paid|bought)\b|^\s*\w[\w-]*:\s*\[?'?bought'?/i,
    say: 'states who paid, from the tag alone' },
  { id: 'direction/into-british', re: /\babsorbed whole into British rule\b/i,
    say: 'states that the thing absorbed was outside British rule, from the tag alone' },
  { id: 'agent/british-forces', re: /\bBritish (?:forces|troops|subjects) (?:beat|occupied|settled|moved)\b/i,
    say: 'names whose troops or settlers acted, from the tag alone' },
];

function scanOtherSurfaces(out) {
  const roots = [path.join(ROOT, 'app', 'js')];
  const skip = new Set([path.join(ROOT, 'app', 'js', 'panels', 'dossier')]);
  const files = [];
  const walk = (dir) => {
    if (skip.has(dir)) return;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.js')) files.push(full);
    }
  };
  for (const r of roots) if (fs.existsSync(r)) walk(r);
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    let inBlockComment = false;
    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (inBlockComment) { if (trimmed.includes('*/')) inBlockComment = false; return; }
      if (trimmed.startsWith('/*')) { if (!trimmed.includes('*/')) inBlockComment = true; return; }
      if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;
      if (!MECH_IDS.test(line)) return;
      for (const rule of OTHER_SURFACE_RULES) {
        if (!rule.re.test(line)) continue;
        out.push({
          severity: 'warn', pass: 'surfaces', id: path.relative(ROOT, f) + ':' + (i + 1),
          code: 'gloss/other-surface',
          message: 'a string keyed to a mechanism tag ' + rule.say + ': ' + trimmed.slice(0, 150),
          hint: 'The dossier answers this by splitting the table: see MECHANISM_GLOSS and MECHANISM_DIRECTION in app/js/panels/dossier/vocab.js, and acquisition.direction in app/data/schema.json.',
        });
      }
    });
  }
}

/* ------------------------------------------------------------------ *
 * Cold-start regression replay. Each fixture is the record and the string
 * exactly as the app carried them on the day the critic found the defect.
 * ------------------------------------------------------------------ */
const REGRESSIONS = [
  {
    name: 'round 1 — Kenya 1920 under "taken from another European coloniser"',
    headline: 'Absorbed whole into British rule, taken from another European coloniser',
    a: {
      id: 'kenya-colony-1920', mechanism: 'annexation-of-existing-colony',
      how: 'The interior was annexed outright as Kenya Colony so that land could be sold freehold to European settlers; the ten-mile coastal strip stayed a protectorate.',
      counterparties: [
        { name: 'The African population of the highlands', kind: 'indigenous-people' },
        { name: "Kenya's Indian population", kind: 'other' },
      ],
    },
  },
  {
    name: 'round 3 — Konbaung Burma under "Handed over by another European power at the end of a war"',
    headline: 'Handed over by another European power at the end of a war',
    a: {
      id: 'burma-yandabo-1826', mechanism: 'war-transfer',
      how: 'The Treaty of Yandabo ended the first Anglo-Burmese war: the Konbaung kingdom ceded Arakan and Tenasserim and paid an indemnity of one million pounds.',
      counterparties: [{ name: 'The Konbaung kingdom', kind: 'regional-state' }],
    },
  },
  {
    name: 'round 5 — the Treaty of Amritsar 1846 under "Bought"',
    headline: 'Bought',
    a: {
      id: 'kashmir-sold-1846', mechanism: 'purchase',
      how: 'Having taken Kashmir from the defeated Sikh state a week earlier, the Company sold it and its people to Gulab Singh of Jammu for 7.5 million rupees, because governing it directly looked expensive.',
      counterparties: [
        { name: 'The Sikh empire', kind: 'regional-state' },
        { name: 'The people of the Kashmir valley', kind: 'other' },
      ],
    },
  },
];

/* ROUND 6 — the frame defects, replayed as the PAGE printed them: three lines,
   the middle one correct and the two around it asserting a transfer it denies.
   Each fixture below is a `block` because the defect was never in the verb, and
   a checker that can only be handed a verb cannot be handed this. */
const FRAME_REGRESSIONS = [
  {
    name: 'round 6 — Jersey 1204 under "HOW IT WAS TAKEN … / TAKEN FROM the islanders of Jersey"',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Kept when the surrounding country was lost', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The Duchy of Normandy and the Kings of France', 'The islanders of Jersey, under Norman customary law'] }],
    },
    a: {
      mechanism: 'annexation-of-existing-colony', direction: 'retained-not-taken',
      how: 'When Philip II of France took Normandy from King John in 1204, Jersey stayed with John because he was still its Duke; England kept the island not by taking it but by not losing it.',
      counterparties: [
        { name: 'The Duchy of Normandy and the Kings of France', kind: 'european-power', lost: 'The last fragment of Normandy.' },
        { name: 'The islanders of Jersey, under Norman customary law', kind: 'indigenous-people', lost: 'Nothing, in 1204. Jersey kept the Coutume de Normandie, and still keeps it.' },
      ],
    },
  },
  {
    name: 'round 6 — Australia 1901 under "TAKEN FROM the six colonies that federated"',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Joined with others into one state', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The six colonies of New South Wales, Victoria, Queensland, South Australia, Western Australia and Tasmania'] }],
    },
    a: {
      mechanism: 'annexation-of-existing-colony', direction: 'union-of-territories',
      how: 'Six self-governing British colonies voted in referendums to federate; the Commonwealth of Australia Constitution Act passed at Westminster and the Commonwealth came into being on 1 January 1901.',
      counterparties: [{ name: 'The six colonies of New South Wales, Victoria, Queensland, South Australia, Western Australia and Tasmania', kind: 'other', lost: 'Their separate customs, defence and immigration powers.' }],
    },
  },
  {
    name: 'round 6 — Pennsylvania 1681 under "TAKEN FROM … Charles II and the English Crown"',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Bought by an English subject, not the Crown', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The Lenape (Delaware) nation', 'Charles II and the English Crown'] }],
    },
    a: {
      mechanism: 'purchase', direction: 'private-buyer',
      how: 'Charles II granted William Penn the province by charter in settlement of a £16,000 debt owed to his father, and Penn then bought the land again from the Lenape because he did not think the king\u2019s grant was enough.',
      counterparties: [
        { name: 'The Lenape (Delaware) nation', kind: 'indigenous-polity', lost: 'The Delaware valley, in a series of purchases.' },
        { name: 'Charles II and the English Crown', kind: 'other', lost: 'A debt, and a province.' },
      ],
    },
  },
  {
    name: 'round 6 — Kashmir 1846: correct verb, and "TAKEN FROM the people of the Kashmir valley" beneath it',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Sold on by Britain to a ruler of its own choosing', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The Sikh empire', 'The people of the Kashmir valley'] }],
    },
    a: {
      mechanism: 'purchase', direction: 'britain-sells',
      how: 'Having taken Kashmir from the defeated Sikh state a week earlier, the Company sold it and its people to Gulab Singh of Jammu for 7.5 million rupees.',
      counterparties: [
        { name: 'The Sikh empire', kind: 'regional-state', lost: 'Kashmir and Ladakh.' },
        { name: 'The people of the Kashmir valley', kind: 'other', lost: 'They were sold.' },
      ],
    },
  },
  {
    name: 'round 6 — Newfoundland 1583 "with nobody left behind / TAKEN FROM … France, Spain, Portugal"',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Claimed for the Crown, with nobody left behind', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The Beothuk', 'France, Spain, Portugal and the Basque country'] }],
    },
    a: {
      mechanism: 'settlement', direction: 'claimed-nobody-left',
      how: 'Humphrey Gilbert read his letters patent to the fishing fleet at St John\u2019s harbour, claimed the island for Elizabeth I and sailed away; he drowned on the return voyage and nobody stayed.',
      counterparties: [
        { name: 'The Beothuk', kind: 'indigenous-people', lost: 'Nothing in 1583.' },
        { name: 'France, Spain, Portugal and the Basque country', kind: 'european-power', lost: 'Nothing in 1583: their fleets went on fishing the Grand Banks for two more centuries.' },
      ],
    },
  },
  /* ---------------------------------------------------------------- *
   * ROUND 7 — THE MIXED GROUP. The round-6 rule asked whether EVERY name under
   * a label denied the loss, so the moment one real loser stood beside a
   * non-loser the group passed clean, and eighteen of them did. Each fixture
   * below is a group the checker declared clean while the dossier printed it.
   * ---------------------------------------------------------------- */
  {
    name: 'round 7 — New York 1664: "TAKEN FROM … The Haudenosaunee" beside a party that really did lose',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Taken by conquest', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The Dutch West India Company and New Netherland', 'The Haudenosaunee (Iroquois Confederacy)'] }],
    },
    a: {
      mechanism: 'conquest',
      how: 'Four English warships anchored off Manhattan in peacetime and demanded the surrender of New Netherland; the colony changed hands without a shot.',
      counterparties: [
        { name: 'The Dutch West India Company and New Netherland', kind: 'european-power', lost: 'The whole colony, its fur trade and its port.' },
        { name: 'The Haudenosaunee (Iroquois Confederacy)', kind: 'indigenous-polity', lost: 'Nothing in 1664, and that is the point: the Five Nations dealt with the English as they had with the Dutch, as partners in a Covenant Chain alliance.' },
      ],
    },
  },
  {
    name: 'round 7 — Jamaica 1655: "TAKEN FROM … the first Maroons", who gained',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Taken by conquest', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['Spain', 'The Africans enslaved by the Spanish, who became the first Maroons'] }],
    },
    a: {
      mechanism: 'conquest',
      how: "Cromwell's Western Design fleet failed to take Santo Domingo and seized lightly defended Jamaica instead.",
      counterparties: [
        { name: 'Spain', kind: 'european-power', lost: 'An island it had held for 160 years.' },
        { name: 'The Africans enslaved by the Spanish, who became the first Maroons', kind: 'indigenous-people', lost: 'Nothing to England — they gained. Fleeing Spanish owners freed or abandoned them, and they took to the mountains and stayed free.' },
      ],
    },
  },
  {
    name: 'round 7 — the Danish West Indies 1801: "TAKEN FROM the enslaved people of St Croix"',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Taken and held by military occupation', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['Denmark', 'The enslaved people of St Croix, St Thomas and St John'] }],
    },
    a: {
      mechanism: 'occupation', direction: 'british-forces',
      how: "Britain occupied St Thomas, St John and St Croix without fighting, to stop Denmark's neutral shipping being used to supply France.",
      counterparties: [
        { name: 'Denmark', kind: 'european-power', lost: 'Its three Caribbean islands for a year.' },
        { name: 'The enslaved people of St Croix, St Thomas and St John', kind: 'indigenous-people', lost: 'Nothing, and that is the point: Britain governed under Danish law and left slavery exactly as it found it.' },
      ],
    },
  },
  {
    name: 'round 7 — Saint-Domingue 1793: "TAKEN FROM … The royalist planters", who invited the British in',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Occupied by British forces', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['The French Republic', 'The royalist planters of Saint-Domingue'] }],
    },
    a: {
      mechanism: 'occupation', direction: 'british-forces',
      how: 'British troops landed at Jérémie in September 1793 at the invitation of royalist planters, to take the richest colony in the Caribbean and restore the slavery the French Republic had just abolished.',
      counterparties: [
        { name: 'The French Republic', kind: 'european-power', lost: 'Control of its most valuable colony for five years.' },
        { name: 'The royalist planters of Saint-Domingue', kind: 'other', lost: "Everything, in the end. They invited the British in to save slavery and signed away their colony's sovereignty by the Whitehall accords." },
      ],
    },
  },
  {
    name: 'round 7 — Ascension 1815: "TAKEN FROM No resident population; The United States and France as naval rivals"',
    block: {
      frame: 'taken-from', key: 'Taken from', eyebrow: 'How it was taken, and from whom',
      verb: 'Taken and held by military occupation', also: [],
      groups: [{ role: null, key: 'Taken from', names: ['No resident population', 'The United States and France as naval rivals'] }],
    },
    a: {
      mechanism: 'occupation', direction: 'british-forces',
      how: 'A Royal Navy garrison was put on Ascension in October 1815 to stop the island being used to rescue Napoleon from St Helena.',
      counterparties: [
        { name: 'No resident population', kind: 'no-resident-population', note: 'There is no evidence of any human presence before the Portuguese.' },
        { name: 'The United States and France as naval rivals', kind: 'european-power', lost: 'Both had used the island as an unclaimed watering and turtling stop; the garrison closed it to them.' },
      ],
    },
  },
];

function selftest(V) {
  /* WITHOUT THIS LINE the round-7 rules are inert here and every fixture below
     reports CAUGHT on some older rule while the new one never runs. The
     selftest exists to be run from a cold start, so it builds what it needs. */
  if (V) buildLossLabels(V);
  const rows = [];
  for (const r of REGRESSIONS) {
    const kinds = new Set((r.a.counterparties || []).map((c) => c.kind));
    const rec = { t: {}, a: r.a, kinds, kindList: [...kinds].join(', '), prose: readProse(r.a), from: '', cps: r.a.counterparties || [] };
    const caught = [];
    for (const rule of ASSERTIONS) {
      if (!rule.re.test(r.headline)) continue;
      if (rule.ok(rec)) continue;
      caught.push(rule.id + ' — ' + rule.why(rec));
    }
    rows.push({ name: r.name, headline: r.headline, caught });
  }
  for (const r of FRAME_REGRESSIONS) {
    const b = Object.assign({}, r.block);
    b.text = [b.eyebrow, b.verb, b.groups.map((g) => g.key.toUpperCase() + ' ' + g.names.join('; ')).join(' | ')].join(' — ');
    const kinds = new Set((r.a.counterparties || []).map((c) => c.kind));
    const rec = { t: {}, a: r.a, kinds, kindList: [...kinds].join(', '), prose: readProse(r.a), from: '', cps: r.a.counterparties || [], block: b };
    const caught = [];
    for (const rule of ASSERTIONS) {
      if (!rule.re.test(b.text)) continue;
      if (rule.ok(rec)) continue;
      caught.push(rule.id + ' — ' + rule.why(rec));
    }
    for (const rule of FRAME_ASSERTIONS) {
      const why = rule.test(rec, b);
      if (why) caught.push(rule.id + ' — ' + why);
    }
    rows.push({ name: r.name, headline: b.text, caught });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
function loadTerritories() {
  const out = [];
  for (const f of fs.readdirSync(TERRITORY_DIR)) {
    if (!f.endsWith('.json') || f === 'index.json' || f.startsWith('_')) continue;
    const d = JSON.parse(fs.readFileSync(path.join(TERRITORY_DIR, f), 'utf8'));
    for (const t of d.territories || []) out.push(t);
  }
  return out;
}

async function run(opts) {
  const V = await loadVocab();
  const territories = loadTerritories();
  const structural = [];
  checkDelegation(structural);
  checkRoleVocabulary(V, structural);
  scanOtherSurfaces(structural);
  const r = check(V, territories, opts);
  return { V, territories, findings: structural.concat(r.findings), rendered: r.rendered, stats: r.stats };
}

module.exports = { run, check, loadVocab, loadTerritories, selftest, readProse, ASSERTIONS, FRAME_ASSERTIONS };

if (require.main === module) {
  const argv = process.argv.slice(2);
  const opts = { teeth: argv.includes('--teeth'), json: argv.includes('--json'), all: argv.includes('--all') };
  run(opts).then(({ V, territories, findings, rendered, stats }) => {
    if (argv.includes('--selftest')) {
      const rows = selftest(V);
      let bad = 0;
      for (const row of rows) {
        const ok = row.caught.length > 0;
        if (!ok) bad++;
        process.stdout.write(`${ok ? 'CAUGHT ' : 'MISSED '} ${row.name}\n         "${row.headline}"\n`);
        for (const c of row.caught) process.stdout.write(`         → ${c}\n`);
      }
      process.stdout.write(`\n${rows.length - bad}/${rows.length} historical regressions caught from a cold start.\n`);
      if (bad) process.exit(1);
    }
    if (opts.all) {
      /* THE WHOLE BLOCK, as the page prints it. The hand sweep a checker cannot
         do needs to read what a student reads, not a fragment of it. */
      for (const r of rendered) {
        const b = r.block;
        process.stdout.write(`${r.region}\t${r.id}\t${r.mechanism}/${r.direction || '-'}\n`
          + `    ${b.eyebrow.toUpperCase()}\n`
          + `    ${b.verb}${r.year ? ', ' + r.year : ''}${b.also.length ? ' — ' + b.also.join(', ') : ''}\n`
          + b.groups.map((g) => `    ${g.key.toUpperCase()}  ${g.names.join('; ')}\n`).join(''));
      }
      process.exit(0);
    }
    const errors = findings.filter((f) => f.severity === 'error');
    if (opts.json) {
      process.stdout.write(JSON.stringify({ ok: errors.length === 0, stats, findings }, null, 2) + '\n');
      process.exit(errors.length ? 1 : 0);
    }
    const acq = territories.reduce((n, t) => n + (t.acquisitions || []).length, 0);
    process.stdout.write('gloss check — ' + territories.length + ' territories, ' + acq + ' acquisitions\n');
    process.stdout.write('  pass A live      ' + acq + ' headlines as printed\n');
    process.stdout.write('  pass B sweep     ' + stats.sweptRenders + ' headlines (every acquisition × every mechanism, no direction)\n');
    process.stdout.write('  pass C teeth     ' + stats.teethRenders + ' headlines (every mechanism × every direction), ' + stats.teethCaught + ' contradictions detected\n\n');
    const byPass = new Map();
    for (const f of findings) {
      if (f.severity !== 'error' && !opts.teeth) continue;
      if (!byPass.has(f.pass)) byPass.set(f.pass, []);
      byPass.get(f.pass).push(f);
    }
    if (!byPass.size) process.stdout.write('  No contradictions.\n');
    for (const [p, list] of byPass) {
      process.stdout.write(`  ${p.toUpperCase()} — ${list.length}\n`);
      for (const f of list.slice(0, 400)) {
        process.stdout.write(`    ${f.id}  [${f.code}]\n      ${f.message}\n${f.hint ? '      ' + f.hint + '\n' : ''}`);
      }
      if (list.length > 400) process.stdout.write(`    … and ${list.length - 400} more\n`);
    }
    process.stdout.write('\n' + (errors.length ? 'FAIL — ' + errors.length + ' error(s)\n' : 'PASS — clean\n'));
    process.exit(errors.length ? 1 : 0);
  }).catch((e) => { process.stderr.write((e && e.stack) || String(e)); process.exit(2); });
}
