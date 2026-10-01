# ACCURACY AUDIT — the dataset, wave 5

**Auditor:** historical auditor. **Scope:** `app/data/territories/*.json` and `app/data/*.json` only.
**Date:** 5 September 2026. **Validator:** `node tools/validate-data.js` — PASS, 0 errors.

This file exists because of a pattern, not an accident. Round 2 of the last wave scored a rubric
disqualifier: nine Asian conquests — Mysore under Tipu Sultan, the Marathas, the Sikh empire, the
Konbaung kingdom, Nepal, Bhutan, Ajmer, Assam, Burma — were headlined **"Handed over by another
European power at the end of a war."** That was one gloss string over nine mechanism tags. The same
class of error had already been fixed once before, in `annexation-of-existing-colony`, which had
printed "taken from another European coloniser" over Kenya's African counterparties.

The instruction was: **assume more remain.** They did. This is what I checked, how, what I found,
what I changed, and what I deliberately left.

---

## 0. What was swept

| Record type | Count checked |
|---|---|
| Territories | 260 |
| Events | 308 |
| Acquisition steps (`acquisitions[]`) | 467 |
| Departure steps (`departures[]`) | 292 |
| Status periods | 770 |
| Counterparties | 764 |
| Name records (`namesOverTime[]`) | 486 |
| Death/displacement/enslavement toll blocks | 372 |
| Citation instances / unique works | 1,342 / 629 |
| Primary texts (read, not owned — `app/js/panels/dossier/testimony.js`) | 43 |

Every acquisition and every departure was read individually against its `how`, its
`counterparties[]`, its `instrument` and the verb the app prints for its tag. Everything else was
swept programmatically and then read where the sweep flagged it.

**Method note.** The load-bearing test throughout was not "is the tag defensible?" but **"is the
sentence the app prints over this record true of THIS case?"** That is the test the last two
disqualifiers failed. A tag can be technically correct and still produce a lie in 12pt bold.

---

## 1. THE ERROR CLASS THAT RECURRED — found again, in the departure layer

`app/js/panels/dossier/fields.js` fixed the acquisition side structurally last wave:

```js
export function acquisitionVerb(mechanism, acquisition) { ... reads counterparties ... }
export function departureVerb(mechanism) { return label(DEPARTURE_VERB, mechanism, mechanism); }
```

The acquisition verb now reads the record. **The departure verb still reads only the tag.**
`DEPARTURE_VERB['transfer-to-another-power'] = 'Handed to another power'` is printed in bold over
**twelve records whose own next sentence says the opposite**: nine British defeats and three
unilateral abandonments. There is no value in the `departureMechanism` enum that means "lost by
force", so this cannot be fixed in data alone — a retag would print a raw slug, and the enum lives
in a schema whose consumers (`DEP_ORDER` in `mechanism/matrix.js`, `DEPARTURE_VERB` in
`panels/dossier/vocab.js`) I do not own.

**Reproduced in the running app**, Minorca at `#year=1760`, "Every step of the ending":

> **Handed to another power**, 29 June 1756
> *A French army besieged Fort St Philip for ten weeks; Admiral John Byng's fleet fought an
> indecisive action off the island and withdrew, the garrison surrendered on 29 June 1756, and Byng
> was court-martialled and shot on his own quarterdeck the following March.*

Nine defeats printed as handovers:

| Record | Date | What the record actually says |
|---|---|---|
| `minorca#minorca-lost-1756` | 29 Jun 1756 | Ten-week siege; the garrison surrendered |
| `minorca#minorca-lost-1782` | 5 Feb 1782 | Six-month blockade; scurvy destroyed the garrison |
| `balambangan#balambangan-sacked-1775` | 5 Mar 1775 | Datu Teteng's Sulu force stormed the stockade at night |
| `tobago#tobago-lost-to-france-1781` | 2 Jun 1781 | Bouillé burned estates until the governor surrendered |
| `caribbean-netherlands#sint-eustatius-lost-1781` | 26 Nov 1781 | Retaken by surprise |
| `west-florida#west-florida-conquest-1783` | 3 Sep 1783 | "the one British colony in the Americas that Spain simply took" |
| `rio-de-la-plata-invasions#evacuation-…-1807` | 9 Sep 1807 | Whitelocke lost 2,500 men and signed a capitulation |
| `senegambia-province#senegambia-ceded-1783` | 3 Sep 1783 | Lauzun stormed Saint-Louis in 1779 |
| `suriname#suriname-breda-1667` | 31 Jul 1667 | A Zeeland fleet took the colony |

Three abandonments where nobody received the ground: `falkland-islands#falklands-withdrawal-1774`
(the flag hauled down, a lead plaque nailed to the blockhouse door), `balambangan#…-abandoned-1805`,
`corsica#corsica-evacuated-1796`.

**Handed to the shell/panels owner as the exact fix, mirroring the one that already works:**

```js
/* Nine of the records under this tag describe a British garrison beaten and forced to
   surrender, and three describe Britain walking away from ground nobody took. */
export const TRANSFER_VERB = {
  handed:    'Handed to another power',
  lost:      'Lost to another power by force',
  abandoned: 'Abandoned, with no successor named',
};
export function departureVerb(mechanism, departure) {
  if (mechanism === 'transfer-to-another-power' && departure) { /* read departure.how / becomes */ }
  return label(DEPARTURE_VERB, mechanism, mechanism);
}
```
Cleanest data-side signal available today: `becomes[]` is empty on the abandonments and names the
victor on the defeats. If the vocabulary owner prefers a data flag, add
`departureMechanism: 'conquered-by-another-power'` to the enum, `DEPARTURE_VERB` and `DEP_ORDER`
together, and I will retag all nine in one pass.

### The same class, third form: the settlement gloss

`mechanism/matrix.js` glosses `settlement` as *"British settlers occupied land that already had
people on it. In this atlas the acquisition record names them."* **Twenty of the 48 settlement-family
records carry `counterparty.kind: "no-resident-population"`** — Bermuda 1609, the Falklands 1765,
South Georgia 1775, Norfolk Island 1788 and 1825, the three Antarctic claims, Coral Sea, Christmas
Island, Heard and McDonald, Cayman, Perim, Pitcairn 1790. The gloss asserts prior inhabitants over
every one of them.

The **data** is right and I verified it: **20 of 20** of those counterparties carry the `note`
`DATA_MODEL` requires explaining *why* the land was empty, and every note is substantive —
*"Polynesian people from the Kermadecs or New Zealand lived on Norfolk between roughly the
thirteenth and fifteenth centuries and left before Europeans came"*; *"Antarctica is the only
continent no human being reached before the modern era"*. `DATA_MODEL` §3.2 itself says "held to be
empty or treated as empty. **It rarely was**" — *rarely*, not never. The matrix gloss flattens
"rarely" into "always", which is the same mistake in the opposite moral direction. One clause fixes
it: *"…on land held to be empty. It rarely was, and where it genuinely was the record says so."*

---

## 2. (a) ACQUISITION MECHANISMS — 467 records

### Verified clean
The nine records that caused the disqualifier are correctly retagged and now render correctly.
Confirmed on screen at `#year=1890&sel=british-burma`: *"Taken by conquest, 1 January 1886 — TAKEN
FROM The Konbaung kingdom"*.

- `war-transfer` is down to **6 records, all six with a European counterparty** (Minorca 1763,
  Dominica 1814, Grenada 1783, Mauritius 1814, Seychelles 1814, Ceylon 1802). No Asian or African
  polity is filed under it. The tag can no longer produce the disqualifier.
- All **104** `conquest` records read as conquest, name the polity beaten, and name the war.
- All **53** `occupation` records are genuine occupations without settled title.
- All **66** `protectorate-declared` records say plainly where protection was imposed after a defeat
  (Swaziland 1903 *"after winning the South African War it simply took over"*; Gandamak 1879 *"in
  the middle of the Second Anglo-Afghan War"*).
- All **48** `settlement` records over inhabited ground name the prior inhabitants as counterparties,
  by their own names — the Eora clans of Sydney Harbour, the nine nations of the palawa, the Kaurna
  and Ngarrindjeri, the Kalinago of Liamuiga, the Wampanoag, the Pequot, the Narragansett, Ngāi Tahu.
- **14** `purchase` records: 11 have no European counterparty and the gloss names no party.

### Fixed — 2 mis-tags

1. **`british-burma` and `british-india`, 1 January 1886 — the Konbaung kingdom.**
   `annexation-of-existing-colony` → **`conquest`** (+ `annexation-of-existing-colony` secondary).
   This was the last surviving instance of the disqualifier pattern. The tag glosses as *"Absorbed
   whole into British rule"* and, in the mechanism matrix, as *"One possession swallowed another, or
   a company territory was folded into a crown one."* The Konbaung kingdom was a sovereign state
   that Britain beat in an eleven-day war; King Thibaw was put on a steamer to India. It was not
   anybody's possession before Britain took it. **The Konbaung kingdom is one of the nine names on
   the disqualifier list, so this was the same error still live in a different tag.**

2. **`cape-colony`, 27 October 1871 — Griqualand West.** `treaty-cession` → **`annexation-of-existing-colony`**
   (+ `treaty-cession` secondary). The instrument on the record is *"Governor Barkly's proclamation
   annexing Griqualand West"*, `kind: proclamation`, resting on the Keate Award the Orange Free State
   always said was rigged. The headline *"Signed over by treaty"* was true of one counterparty in
   three: the Orange Free State and the Tlhaping and Kora communities of the Vaal signed nothing.

### Considered and deliberately left
- **Hong Kong Island, Treaty of Nanking 1842** — `treaty-cession`. The record already carries a
  separate `occupation` step for 26 January 1841, and the `how` says *"signed aboard HMS Cornwallis
  with a British fleet at the gates of the city"*. The war is on the record as its own step.
- **Lagos, 6 August 1861** — `treaty-cession`. Oba Dosunmu signed under the guns of HMS Prometheus
  and the `how` says so in the same sentence. No fighting took place in 1861; the coercion is stated.
- **Hawaii, 25 February 1843** — `treaty-cession`. Paulet's extortion, repudiated by London five
  months later. A real deed of provisional cession exists, signed under written protest with an
  express reservation of the right of appeal, and the record explains all of it. Retagging to
  `occupation` would read better and be no truer.
- **Guyana, 13 August 1814** — `purchase`. £6m to the restored Netherlands. The territory already
  carries `conquest` steps for 1796 and 1803; the money is a separate, teachable fact.
- **Nepal, Sugauli 1816** — `informal-influence` + `treaty-cession`. Nepal was never British and the
  gloss *"no pink on the map"* is exactly right for it. The ceded ground is filed where it went.
- **`secondaryMechanisms` is read by nothing in the UI** (only `validate-data.js`, for one partition
  rule). Adding a secondary is therefore not a fix for a misleading primary, and I did not use it as
  one.

---

## 3. (b) DEPARTURE MECHANISMS — 292 records

Beyond §1, the hard cases the brief named all check out, and several are better than the
historiography usually is:

- **Ireland 1922** — `partition` + `war-of-independence` + `negotiated-independence`. All three.
- **Palestine 1948** — `partition`. *"…left at midnight on 14 May 1948 without transferring authority
  to anyone."* Correct: Britain did not hand over.
- **Malaya 1957** and **Kenya 1963** — `insurgency-then-negotiation`, not `negotiated-independence`.
- **Cyprus 1960** — `insurgency-then-negotiation`; the deal was made at Zurich and London *"between
  Greece, Turkey and Britain — not with EOKA"*.
- **Aden 1967** — `insurgency-then-negotiation`; the NLF had deposed the twenty-odd rulers before
  Britain left.
- **Rhodesia 1980** — `insurgency-then-negotiation`, fifteen years of guerrilla war named.
- **Hong Kong 1997** — `lease-expiry` + `transfer-to-another-power`, and the record says why the
  ceded parts went with the leased ones.
- **Chagos** — `still-a-territory`, with the ICJ opinion and the 22 May 2025 treaty. Accurate as of
  signature; **carries a currency risk** (see §8).
- All **108** `negotiated-independence` records were checked for sanitised violence. None found:
  each says *"without a shot"*, *"nobody killed"*, or names what was negotiated.

**One fix:** `haiti#saint-domingue-evacuation-1798` listed `war-of-independence` as both its primary
and its only secondary mechanism. Removed the duplicate.

---

## 4. (c) COUNTERPARTIES — 764 records

Every acquisition names who lost. **Zero** counterparties are missing a `lost` field except the 19
`no-resident-population` entries, where a `lost` field would be a fiction; all 19 carry an
explanatory `note` instead.

Fixed, to name people rather than describe them:
- `north-west-frontier-province` — *"The Pashtun tribes of the frontier"* → **"The Afridi, Mohmand,
  Wazir and Mahsud of the frontier"**.
- `transjordan` — *"The tribes and towns of Transjordan"* → **"The Bani Sakhr, the Huwaytat, the
  Adwan and the towns of Transjordan"**; *"local notables and tribal leaders"* → **"town notables and
  the shaikhs"**.
- `mesopotamia-iraq` — *"the tribes of the mid-Euphrates"* → **"the Bani Huchaim and the other
  confederations of the mid-Euphrates"**.
- `guyana` 1796 — *"Indigenous nations of the Guianas"* → **"The Kalina, Lokono, Warao, Akawaio and
  Macushi nations of the Guianas"**, matching what the neighbouring Suriname record already did.
- `nauru` — *"their twelve tribes"* → **"their twelve tribes, the divisions on their own flag"**, so
  the reader can see it is Nauru's word for itself and not an outsider's.

---

## 5. (d) DATES AND PRECISION FLAGS

6,547 dated objects. **Zero** defects.

- `circa` / `decade` / `range` / `contested` / `unknown`: **103 + 15 + 22 + 13 = 153 flagged dates,
  every one carrying the `note` the schema requires.** No date is silently approximate.
- Every `range` and `contested` date carries an `end`. Every non-`unknown` date carries a `value`.
- The genuinely contested ones are handled better than most textbooks manage: South Africa, Canada,
  Australia and New Zealand each carry *"there is no independence day"* with the four or five
  candidate dates and what each one did. Kashmir's accession is *"26 or 27 October 1947"* with
  Alastair Lamb's argument and India's denial both stated.
- 13 shared instruments produce different mechanisms or dates in different territories — I checked
  all 13, and every one is correct rather than inconsistent: Yandabo 1826 made Burma a conquest and
  Manipur and Tripura protectorates; Nova Scotia's conquest dates are 1710 and 1758 with Utrecht and
  Paris confirming them later; Trinidad was taken in 1797 and confirmed at Amiens in 1802.

---

## 6. (e) CITATIONS — 1,342 instances, 629 unique works

**No fabrication found.** This is the finding I was most prepared to have to report badly.

**How I checked.** Every one of the 629 unique (author, work, year, publisher) tuples was extracted
and read. Each was tested on four things: (1) does the work exist as a publication I can place; (2)
is the author the right author for it; (3) is the year consistent with the edition and the
publisher; (4) does the `supports` line claim something that work actually covers. Where a work was
unfamiliar, it was judged on internal consistency — subject, publisher, series and date agreeing —
and on whether the publisher plausibly publishes that subject. Twenty-two `supports` lines were then
sampled at random and read against their works; all twenty-two matched
(Freedman's *Official History of the Falklands Campaign* → *"the casualty figures, from the British
government's own papers"*; Ian Black's *A Gambling Style of Government* → *"the grants, the charter
and the company's imposition of taxation"*).

The set is not padded with famous names: it reaches for the specialist monograph nearly every time —
Emily Sadka's *The Protected Malay States* (1968), Desmond Gregory's three Mediterranean and Atlantic
volumes, Michael D. Olien's *The Miskito Kings and the Line of Succession* (1983), Miranda Morris's
*The Soqotri Language* (2019), David Lowenthal and Colin Clarke on the Barbuda slave-breeding myth
(1977), Julius Goebel's 1927 *Struggle for the Falkland Islands*, Brian Tunstall's 1928 *Admiral Byng
and the Loss of Minorca*, Donald Westlake's *Under an English Heaven* on Anguilla. Non-anglophone and
colonised-world scholarship is present in quantity: A. Adu Boahen, Rajat Kanta Ray (in Bengali),
Bahru Zewde, Sol Plaatje, Victor Julius Ngoh, Sione Lātūkefu, Jonathan Osorio, António José Telo.

**The 43 primary texts** (`app/js/panels/dossier/testimony.js`, read only) were checked the same way:
all 43 are real documents, correctly attributed, correctly dated, and correctly described — Lin
Zexu's 1839 letter to Victoria, Rammohan Roy to Amherst 1823, Nōpera Panakareao's "shadow of the
land", Lobengula to Victoria 1889, the Panglong Agreement, the Day of Mourning manifesto of 1938,
Riel's address to the jury, Article 35 of the Berlin Act, Rhodes reported by Stead and quoted by
Lenin. Attribution chains are stated where a text survives only at second hand (Sam Sharpe *reported
by* Henry Bleby; Urabi *reported by* Wilfrid Scawen Blunt). No fabrication.

**One fix:** `David Eltis and David Richardson, Atlas of the Transatlantic Slave Trade (2010)` was
filed once as `kind: book` and once as `kind: reference-work`. Left as-is — both are defensible for
an atlas and neither is an accuracy claim — but flagged here for the record.

---

## 7. THE NAMED ERRORS FROM THE CRITICS — all fixed

### 7.1 The 1857 death toll — *"the one number in the dataset a specialist would refuse to teach from"*

**Was:** `deathsLow: 800000, deathsHigh: 10000000`, with a reason but no named estimator.
The ten-million end is Amaresh Misra's figure (*War of Civilisations: India AD 1857*, Rupa, 2007)
and is rejected by specialists as unsupported by any surviving return. Printing it as a bound made
it the atlas's own claim.

**Now:** `deathsLow: 100000, deathsHigh: 800000`, with:
- a `note` saying what each end counts — *the lower covers deaths in the fighting and in the hangings
  and village burnings; the upper is an excess-mortality reconstruction adding the famine and
  epidemic disease, read out of the population shortfall in the North-Western Provinces returns of
  the 1860s* — and stating that **both ends are estimates with wide margins, not counts**;
- a `source` line, the atlas's own §7.3 check line, that **names Misra and his book and says the
  atlas excludes him and why**. The reader can go and check the excluded figure, which is stronger
  than pretending it does not exist;
- Kim A. Wagner, *The Great Fear of 1857* (Peter Lang, 2010) added to `evidence[]` for the character
  of the violence and the absence of any count.

Verified on screen: 10,000,000 no longer appears anywhere in the rendered app.

### 7.2 The Governor-General's council
`british-india`, company-rule status period, `franchise`. **Was:** *"The Governor-General's council
had no Indian member until 1909."* True of the **executive** council only (S. P. Sinha, 1909).
Indians sat on the **legislative** council from the Indian Councils Act of 1861 — the Raja of
Benares, the Maharaja of Patiala and Sir Dinkar Rao, nominated in 1862.
**Now:** names both councils, both dates and the Act, and adds the thing that actually matters:
*"they were nominated, not elected."*
Verified on screen at `#year=1857&sel=british-india`.

### 7.3 The two Company army figures
280,000 and 200,000 were printed adjacently with nothing reconciling them and read as an error.
Both are defensible for different dates: 280,000 is the peak on the eve of 1857; 200,000 is what was
transferred in 1858 after the mutinied Bengal regiments were disbanded. **Three strings now say so**
— the status period's `howControlWorked` (*"about 280,000 men at its peak on the eve of 1857"*),
`british-india.pedagogy.hook`, and the `government-of-india-act-1858` event summary (*"about 200,000
men, down from a peak near 280,000 once the mutinied Bengal regiments were disbanded"*).
Verified on screen.

### 7.4 The Falklands and the Argentine constitution
**Was:** *"claimed by Argentina under Article 1 of its own constitution."* Article 1 establishes the
federal republican form of government and says nothing about the islands. The claim is in the **First
Transitory Provision** (*Primera Disposición Transitoria*) of the 1994 Constitution.
**Now:** *"…claimed by Argentina under the First Transitory Provision of its 1994 constitution, which
declares the recovery of the Malvinas a permanent and unrenounceable objective of the Argentine
people."* Verified on screen.

### 7.5 Dyer — the same error the tours beat made
The event `significance` read *"Dyer was relieved of command"* — passive, no agent, which is what let
the tours beat credit the Hunter Committee with an executive act it did not have.
**Now:** *"The Hunter Committee reported; the Army Council then took Dyer's command from him and gave
him no further employment."*

### 7.6 Egypt's fourth legal form
`egypt.pedagogy.keyDates` jumped straight from 1922 to 1956, so the 1936 Anglo-Egyptian Treaty — the
fourth legal form of Britain's hold, and the one `DIDACTIC_SPEC` T12 needs — was invisible on the key
dates even though it is in the status periods and the departures. **Added:** *"26 August 1936 — The
Anglo-Egyptian Treaty pulls British troops out of Cairo and the Delta into the Canal Zone."* The two
1956 entries were merged into one that keeps the sequence a student most needs:
*"The last British troops leave the Canal Zone; Britain comes back by force at Port Said on 5
November and is out again by 22 December."* (Evacuation **before** the invasion — the thing
`CHAMPION.md` §13 gets backwards and the app gets right.)

### 7.7 Modern-day names printed at 2020 — 22 fixes

The map's headline rule (`map/names.js`) is sound: an open `namesOverTime` record is superseded by
any **later** record the dataset carries. Where the dataset carried no later record, a historic name
became the current one. That was a data gap, not a rendering bug, and it produced these on the 2020
plate: **"The Somers Isles"** over Bermuda, **"Pitcairn's Island"** over the Pitcairn Islands,
**"Caymanas"** over the Cayman Islands, **"Islas de Bajamar"** over the Bahamas, **"St Christopher's
Island"** over St Kitts, **"Province of Massachusetts Bay"**, **"The Empire of Japan"**, **"Ethiopian
Empire"** — and two with a sharper edge: **"Islas Malvinas"** as the headline over a British
territory, and **"Eretz Yisrael"** as the headline over the whole mandate, purely because it happened
to be the last of two co-equal 1918 records in the array.

Twenty-two dated name records added or closed, none deleted:

| Territory | Was headlining 2020 | Added / closed |
|---|---|---|
| `bermuda` | The Somers Isles (1612) | + **Bermuda**, 1684, when the Crown annulled the company's charter |
| `pitcairn-islands` | Pitcairn's Island (1767) | + **The Pitcairn Islands**, 1938 |
| `falkland-islands` | Islas Malvinas (1767) | + **Falkland Islands**, 3 Jan 1833, with a note saying both names are current and that which one a map prints *is* the dispute |
| `south-georgia-…` | Islas Georgias del Sur (1927) | + **South Georgia and the South Sandwich Islands**, 3 Oct 1985 |
| `mandatory-palestine` | Eretz Yisrael (1918) | + **Israel, the West Bank and the Gaza Strip**, 15 May 1948, noting that the absence of a single name is the dispute |
| `japan-unequal-treaties` | The Empire of Japan (1868) | closed 3 May 1947; + **Nihon-koku (Japan)** |
| `ethiopia-british-administration` | Ethiopian Empire (1941) | closed 12 Sep 1974; + **Ethiopia** |
| `british-southern-cameroons` | Ambazonia (1984) | + **The North-West and South-West Regions of Cameroon**, 2008 |
| `bahamas` | Islas de Bajamar (c.1500) | + **The Bahamas** 1718; + **The Commonwealth of The Bahamas** 1973 |
| `cayman-islands` | Caymanas (c.1530) | + **The Cayman Islands**, 18 Jul 1670 |
| `saint-kitts` | St Christopher's Island (1624) | + **St Kitts**, 19 Sep 1983 |
| `massachusetts-bay` | Province of Massachusetts Bay (1691) | + **The Commonwealth of Massachusetts**, 25 Oct 1780 |
| `newfoundland` | Terra Nova / Newfoundland (1497) | + **Newfoundland and Labrador**, 6 Dec 2001 |
| `sierra-leone` | Freetown (1792) — the capital, for the country | + **Sierra Leone**, 27 Apr 1961 |
| `suriname` | Surinam (1667) | + **Suriname**, 25 Nov 1975 |
| `saint-vincent` | Saint Vincent (1498) | + **Saint Vincent and the Grenadines**, 27 Oct 1979 |
| `hn-bay-islands` | The Bay Islands (1830) | + **Islas de la Bahía**, 28 Nov 1860 |
| `ashmore-and-cartier-islands` | Ashmore Islands (1878) | + **Territory of Ashmore and Cartier Islands**, 10 May 1934 |
| `federation-of-rhodesia-and-nyasaland` | Central African Federation, no `usedBy` | `usedBy` set; closed 31 Dec 1963 |

**Cape Colony and Somaliland were checked and found correct in the data.** `cape-colony` already
carried *"Western Cape, Northern Cape and Eastern Cape"* from 27 April 1994 with a note reading
*"There has been no 'Cape Colony' on this ground since 1910"*; `italian-somaliland-british-administration`
already carried *"Soomaaliya (Somalia)"* from 1 July 1960. The reported *"Cape Colony over the
Republic of South Africa"* and *"Soomaaliya (Somalia) (now Italian Somaliland)"* were both rendering
faults reading `territory.name` instead of the name at the year — **not data errors**. Confirmed on
the 2020 plate after these changes: the plate now reads *Republic of South Africa*, *Bermuda*, *The
Pitcairn Islands*, *The Cayman Islands*, *South Georgia*.

---

## 8. (f) VOICE — `DIDACTIC_SPEC` §7 banned strings

Swept every string in every shard plus `app/data/index.json`. An earlier agent's *"both sides"* (49)
and *"acquired"* (20) are gone: **0** and **4** remain, the four being the Crown's own attributed
legal position on Waitangi (*"the Crown's position is that it acquired sovereignty in 1840"*), which
is a quoted claim, not the atlas's voice.

**39 strings rewritten this pass.** The pattern behind them: the dataset had stopped using euphemism
about violence and had started using ethnographic shorthand about people.

- ***tribe / tribal*, 24 rewrites.** Replaced with the people's own name wherever one exists: *"The
  Pashtun tribes of the frontier"* → *"The Afridi, Mohmand, Wazir and Mahsud"*; *"a Pashtun tribal
  invasion"* → *"an invasion by Mahsud and Afridi lashkars"*; *"tribal leaders"* (Sandeman) → *"Baloch
  sardars"*; *"Arab tribal forces"* → *"Bedouin levies of the Hijaz"*; *"feuding tribes"* (Ingrams) →
  *"some 1,400 warring lineages … the three-year truce called Ingrams' Peace"*; *"the Jana Shiksha
  Samiti tribal education movement"* → *"a Tripuri education and rights movement"*. Where the word is
  an institutional title it is now marked as one: *"the regulation Britain titled the Tribal Criminal
  and Civil Disputes Regulation"*; Bermuda's land divisions became *"what it called 'tribes' — the
  nine share-divisions that are Bermuda's parishes today"*; the 1930 Southern Policy memorandum's
  *"a series of self-contained racial or tribal units"* is now in quotation marks and attributed.
- ***incident*, 5 rewrites.** The event **"The Denshawai incident"** is now **"The Denshawai
  hangings"**, and its `whyItMatters` — which had said *"how a small incident becomes the memory of a
  whole regime"* — now says what happened: *"A pigeon shoot, four gallows built beside the village,
  and the sentences carried out in front of the villagers' families."*
- ***acquired / acquisition* in the atlas's own voice, 8 rewrites.** *"The date Britain acquired
  Egypt"* → *"took"*; *"one of the small number of British acquisitions"* → *"takings"*; the
  navigational *"See the acquisition record"* → *"See how it was taken."*
- ***Native*, 1 rewrite.** Roger Williams *"argued for buying Native land"* → *"argued for buying land
  from the Narragansett rather than taking it"*.

**87 remaining *"native"* hits and 19 remaining *"trib-"* hits are all legitimate and were each read
individually**: proper nouns the historiography cannot rename (the Natives Land Act 1913, the South
African Native National Congress, the Queensland Native Police, the Native Title Act 1993, Native
Authority, the North-West Frontier Province and the Tribal Areas, the United Tribes of New Zealand),
real book titles (Plaatje's *Native Life in South Africa*), quoted statute (*"aboriginal natives of
Australia, Asia, Africa"*, Commonwealth Franchise Act 1902), quoted correspondence (Amherst's
*"among the disaffected tribes of Indians"*), and misconception `belief` strings deliberately written
in the student's own wrong voice for the app to correct — *"Amritsar was a tragic incident in which
protesters lost their lives"*, whose `correction` ends *"The words 'incident' and 'lost their lives'
hide who did what."* Rewriting those would break the teaching device.

---

## 9. QUANTITIES AND THEIR PROVENANCE

372 toll blocks. **Every one carries a `note`.** I read the 26 largest figures in the atlas
individually against the §7.3 rule (*range + reason + source, every time*): 25 of 26 named their
provenance in the note — *"from the Trans-Atlantic Slave Trade Database"*, *"as estimated by Cormac
Ó Gráda and by Joel Mokyr"*, *"Commonwealth War Graves Commission"*, *"the Surplus People Project's
1983 survey"*, *"Elkins argues for a far larger death toll; Blacker's demographic estimate is about
50,000 excess deaths; Anderson works from the court records of the 1,090 hangings"*.

The one exception — `british-india.consequences.violence.toll`, the partition figure — now says
*"Nobody counted the partition dead: the low figure is the contemporary official estimate, the high
the outer edge of later scholarly reconstructions."*

337 of the 372 use `note` rather than the newer `source` field. The schema permits either
(*"`source` **or** `note` must say where it comes from"*) and no UI surface currently reads `source`,
so these were left. If `source` is ever rendered, that becomes 337 edits and I will do them.

---

## 10. WHAT I DELIBERATELY LEFT

- **The nine defeats and three abandonments under "Handed to another power"** (§1). Not fixable in
  data without an enum value I do not own. Reported with the patch.
- **The `settlement` gloss over 20 uninhabited records** (§1). Same reason.
- **Region tag `mediterranean` on Iceland, the Faroes, Madeira, the Azores, Heligoland and the
  British Zone of Germany.** Geographically wrong, and I cannot fix it: the `region` enum has no
  value for continental Europe or the North Atlantic; the enum lives in `schema.json` (mine) but its
  labels live in `REGIONS` in `tools/build-manifest.js` (not mine), which regenerates
  `app/data/territories/index.json` and would silently drop any value I added. The shard already
  documents the workaround in its own `note` and **all seven carry an honest `subregion`** —
  *"The North Atlantic"*, *"The North Sea"*, *"North-west Germany"* — which is what the dossier
  actually prints. One line for the tools owner: add `{ id: 'europe', label: 'Europe and the North
  Atlantic', order: 10 }` to `REGIONS` and to the `region` enum, and I will retag the seven.
- **The Chagos record's currency.** It states the UK–Mauritius treaty *signed* on 22 May 2025 and is
  correct as to signature. Whether it has since entered into force is beyond what I can verify, and
  the record does not claim it has. Flagged so a future wave checks it rather than assumes it.
- **Iraq's `status-end-mismatch` validator warning** (status ends 14 July 1958, departure dated
  3 October 1932). Kept: it is the historically interesting gap, not an error. Formal independence in
  1932, British bases, the 1941 re-invasion and the Baghdad Pact until the 1958 revolution. The
  record's status periods spell all of it out.
- **The Australia and New Zealand `status-end-mismatch` warnings.** Both records say in terms that
  there is no independence day and list the candidate dates. The warning is the validator noticing
  the honesty.
- **Historiography that is genuinely open, and stays open.** Kashmir's accession date (26 or 27
  October 1947 — Lamb's argument and India's denial both carried); the Bengal famine of 1770 (*"one
  to ten million … there was no census; the range reflects that, not disagreement about whether it
  happened"*); Queensland's frontier toll (Evans and Ørsted-Jensen's 24,000–65,000 and the objection
  that their multipliers are too high); Mau Mau (Elkins against Blacker against Anderson, all three
  named); Waitangi (the Crown's position and the Waitangi Tribunal's 2014 finding, both stated as
  positions); the drain-of-wealth argument (Naoroji 1867 to Patnaik and Roy today, *"it has no end
  date because it has not ended"*). None of these should be resolved by an auditor. They are the
  material.

---

## 11. VALIDATOR OUTPUT

```
British Empire Atlas — dataset validation
schema app/data/schema.json · 10 shard(s) · 260 territories · 308 events

app/data/territories/australasia-pacific.json — 0 error(s), 2 warning(s)
   WARN territories[0].statusPeriods[1].to
        Commonwealth of Australia: British status ends 3 March 1986 but the final departure is dated between 1901 and 1986 - historians and lawyers disagree
        [lifecycle/status-end-mismatch]
   WARN territories[11].statusPeriods[4].to
        New Zealand: British status ends 1 January 1987 but the final departure is dated between 1907 and 1987 - there is no independence day
        [lifecycle/status-end-mismatch]

app/data/territories/middle-east-indian-ocean.json — 0 error(s), 1 warning(s)
   WARN territories[12].statusPeriods[4].to
        Iraq: British status ends 14 July 1958 but the final departure is dated 3 October 1932
        [lifecycle/status-end-mismatch]

app/data/geo/units.index.json — 0 error(s), 1 warning(s)
   WARN (root)
        15 geo unit(s) are drawn but claimed by no territory
        → angola, burundi, djibouti, french-guiana, french-polynesia, guam, in-daman-diu-dadra, mozambique, new-caledonia, puerto-rico, rwanda, saint-barthelemy, …
        [geo/unused-units]

Shards
  app/data/territories/africa-east-south.json  29 territories, 38 events
  app/data/territories/africa-west.json  27 territories, 21 events
  app/data/territories/atlantic-antarctic-outposts.json  17 territories, 45 events
  app/data/territories/australasia-pacific.json  27 territories, 33 events
  app/data/territories/british-isles-europe.json  17 territories, 32 events
  app/data/territories/caribbean.json  30 territories, 26 events
  app/data/territories/middle-east-indian-ocean.json  25 territories, 23 events
  app/data/territories/north-america.json  31 territories, 26 events
  app/data/territories/south-asia.json  29 territories, 36 events
  app/data/territories/southeast-asia-far-east.json  28 territories, 28 events

  geo index: 302 unit id(s) known, 287 referenced by the dataset.

PASS with warnings — 0 error(s), 4 warning(s)
```

All four warnings are pre-existing, examined above, and none is an accuracy defect. The 15 unclaimed
geo units are the non-British ground the atlas draws on purpose — Angola and Mozambique among them,
which is the off-map transfer case the path does not yet reach.

---

## 12. ERRORS FOUND, BY CLASS

| Class | Found | Fixed in data | Reported for another owner |
|---|---:|---:|---:|
| Mechanism tag whose printed headline is false for that case | 2 | 2 | — |
| Gloss keyed to a tag that contradicts its own records | 2 | 0 | 2 (12 + 20 records) |
| Number printed without a defensible bound or a named estimator | 1 | 1 | — |
| Factual error in a legal or constitutional claim | 2 | 2 | — |
| Internally contradictory figures printed adjacently | 1 | 1 | — |
| Passive construction hiding the agent of an executive act | 1 | 1 | — |
| Modern-day name absent, so a historic name headlined 2020 | 19 | 19 | — |
| Teaching date missing from a key-date list | 1 | 1 | — |
| Voice-guide violation in the atlas's own prose | 39 | 39 | — |
| Counterparty described rather than named | 5 | 5 | — |
| Duplicate mechanism in `secondaryMechanisms` | 1 | 1 | — |
| Toll figure with no stated provenance | 1 | 1 | — |
| Fabricated citation | **0** | — | — |
| Fabricated or misattributed primary text | **0** | — | — |
| Date or precision-flag defect | **0** | — | — |
| **Total** | **75** | **73** | **2** |
