# DATA MODEL — the British Empire Atlas dataset

**Version 1.0.0.** Owned by the data-model agent. Schema: [`app/data/schema.json`](../app/data/schema.json).
Validator: `node tools/validate-data.js`. Exemplar: [`app/data/territories/_TEMPLATE.json`](../app/data/territories/_TEMPLATE.json).

Everything the app shows about a place comes from here. If a fact cannot be expressed in this model,
say so and the model changes — do not smuggle it into a free-text field.

---

## 0. Why the model looks like this

A student's questions are, in order: *What was British? When did it become British? How? What kind of
British? When and how did it stop? What did that do to the people there?* The model answers those six
questions for every territory, in that order, with the same fields every time, so the app can put the
same six answers side by side for Barbados and for Bengal.

Four commitments follow from the brief and shape every design decision below.

1. **"British" is not binary.** A dominion and a crown colony were both coloured red on the old maps and
   were not remotely the same thing. Hence `statusPeriods` with a `controlDegree`, not a boolean.
2. **Extent changes, and the change is the lesson.** British India lost Burma in 1937 without anyone
   becoming independent. Hence `geoCoverage` as a list of periods, separate from status.
3. **Uncertainty is content, not noise.** Every date carries a `precision`; anything softer than `exact`
   must carry a `note` saying why. Every territory carries `confidence` and may carry `contested`.
4. **No euphemism.** Every acquisition names a `mechanism` from a closed list, states in one sentence
   *how it actually happened*, and names the `counterparties` who lost something and what they lost.

---

## 1. File layout

```
app/data/schema.json                  the JSON Schema (draft 2020-12) for one shard
app/data/territories/_TEMPLATE.json   the exemplar: Barbados, encoded perfectly. Copy it.
app/data/territories/<region>.json    one shard per region, written by regional historians
app/data/events/<theme>.json          optional shards holding only empire-wide events
app/data/geo/units.index.json         the geographic vocabulary. NOT ours. Read-only to us.
```

A **shard** is one JSON file. It carries a `shard` header plus a `territories` array, an `events` array,
or both. Shards are loaded and merged by the app; ids must therefore be unique across *all* shards, not
just within one file. The validator enforces that.

```jsonc
{
  "$schema": "../schema.json",
  "schemaVersion": "1.0.0",
  "shard": {
    "id": "caribbean",
    "title": "The Caribbean",
    "region": "caribbean",
    "updated": "2026-09-04",
    "author": "who wrote it"
  },
  "territories": [ /* territory objects */ ],
  "events":      [ /* event objects */ ]
}
```

### The contract with the geometry agent

`app/data/geo/units.index.json` defines the **geo unit ids**. We consume them and never invent them.
The validator reads that file in whatever shape it takes (an array of ids, an array of objects with
`id`, or an object keyed by id, with optional `aliases`) and rejects any id the dataset uses that the
index does not define. Two rules follow, and the second one is a request to the geometry side:

- **Never invent a unit id.** If a place you need has no unit, say so and stop; do not guess.
- **The granularity rule: a unit must never straddle a border the empire's story crosses.** If a
  territory was ever partitioned, transferred, or split, each resulting piece needs its own unit.

As built, the index holds 302 units. Sovereign-state-sized units are bare slugs (`barbados`, `jamaica`,
`bermuda`); anything subnational is `<iso2>-<slug>` (`hk-hong-kong-island`, `hk-kowloon`,
`hk-new-territories`; `ie-munster`, `ie-ulster-counties`, `gb-northern-ireland`; `in-west-bengal`,
`bd-east-bengal`, `pk-sindh`, `mm-upper-burma`, `ye-aden-colony`). That granularity is what makes 1937,
1947 and 1971 expressible on one map. Each entry also carries `name`, `aliases`, `kind`,
`sovereign_today`, `region` and a centroid — read them, and use `id` and nothing else in this dataset.

If `units.index.json` is absent, the validator reports missing-index as a **warning** so parallel work is
not blocked, and `--strict` turns it into a failure for CI.

---

## 2. The territory object, field by field

| Field | Required | What it is |
|---|---|---|
| `id` | ● | kebab-case slug, unique across the whole dataset. Used in URLs. |
| `name` | ● | Short label on the map: "Barbados", "British India". |
| `formalName` | | Full official name at its fullest extent. |
| `region` | ● | One of the region vocabulary (§3.1). Groups the legend. |
| `namesOverTime` | | What it was called, when, in what language, **by whom** (`usedBy`). A colonial name and the name its people used are both facts; label which is which. |
| `modernSuccessors` | | The countries a student can find on a modern map, with ISO codes. |
| `geoCoverage` | ● | Ordered periods of geographic extent (§4). |
| `nestedWithin` | | Set when this sits inside another territory (a princely state inside British India), so overlapping unit claims are legitimate. |
| `acquisitions` | ● | One or more acquisition steps (§5). Hong Kong has three; Barbados has one. |
| `statusPeriods` | ● | Ordered, contiguous constitutional statuses (§6). |
| `departures` | ◐ | How British rule ended (§7). Required unless `stillBritish` is present. |
| `stillBritish` | ◐ | Present when some or all of it is still under British sovereignty. |
| `consequences` | | Partition, violence, population transfer, slavery, Commonwealth, retained territory, legacies (§8). |
| `peak` | | Area, population and exports at the fullest extent, for the charts. |
| `evidence` | ● | 1–3 real citations (§9). |
| `confidence` | ● | `high` \| `medium` \| `low`. |
| `contested` | | What historians actually argue about here. Shown in the UI, never hidden. |
| `pedagogy` | ● | Hook, misconception, why it matters, key dates (§10). |
| `eventIds` | | Empire-wide events that belong on this dossier. |

● required ◐ one of the two required

### 2.1 The date object

Every date in the dataset is an object, never a bare string.

```json
{ "value": "1898-07-01", "precision": "exact", "display": "1 July 1898",
  "end": "1898-12-31", "calendar": "gregorian", "note": "why it is uncertain" }
```

`value` is `YYYY`, `YYYY-MM` or `YYYY-MM-DD`, proleptic Gregorian. `display` is what the student reads,
so write it like a human: "spring 1899", "between 1663 and 1666". `note` is **required** whenever the
precision is soft, and the UI prints it.

### 2.2 Date precision

| Value | Means | Needs |
|---|---|---|
| `exact` | The day is known and agreed. | |
| `month` | The month is known, the day is not. | |
| `year` | The year is known, the month is not. | |
| `circa` | Approximately this year; sources vary or the event was gradual. | `note` |
| `decade` | Somewhere in this decade. | `note` |
| `range` | Definitely between two dates, not pinned. | `end`, `note` |
| `contested` | Historians give different dates and it matters which you choose. | `end`, `note` |
| `unknown` | Not known. Say so rather than guessing. | `note` |

---

## 3. Controlled vocabularies

Closed lists. The schema rejects anything else. Every term below is defined the way it would be
explained to a fifteen-year-old, because these definitions are also the copy the UI shows on hover.

### 3.1 Regions

`british-isles` · `north-america` · `caribbean` · `south-america` · `west-africa` · `east-africa` ·
`central-africa` · `southern-africa` · `north-africa` · `mediterranean` · `middle-east` · `south-asia` ·
`southeast-asia` · `east-asia` · `australasia` · `pacific` · `indian-ocean` · `south-atlantic` ·
`polar` · `empire-wide` (events only).

### 3.2 ACQUISITION MECHANISMS — how a place became British

Exactly one primary `mechanism` per acquisition, plus optional `secondaryMechanisms`. The point of the
list is that these are *not the same thing*, and a student who can tell them apart understands the empire.

| Mechanism | What it means | Example |
|---|---|---|
| `settlement` | British subjects moved in and set up a colony, on land held to be empty or treated as empty. It rarely was: "empty" usually means the people there had been killed, driven off, or were not recognised as owners. | Barbados 1627; New South Wales 1788 under *terra nullius*. |
| `conquest` | Taken by military force from the people or state that held it. | Sindh 1843; Ulster 1603; Aden 1839. |
| `chartered-company` | The Crown granted a company a monopoly and, often, the right to govern. The company raised armies and taxed people, and the government could disclaim responsibility. | East India Company 1600; British South Africa Company 1889. |
| `treaty-cession` | Another state formally signed the territory over. Almost always after a defeat, so read the treaty date next to the war. **Must name the treaty in `instrument`.** | Hong Kong Island, Treaty of Nanking 1842. |
| `purchase` | Britain paid a state, a company or a claimed owner for it. **Must name the contract.** | The Gambia settlements; land purchases from chartered companies. |
| `protectorate-declared` | Britain announced it would control a state's foreign relations and defence, leaving the local ruler on the throne. Cheaper than conquest and easier to disown. | Buganda 1894; Zanzibar 1890. |
| `lease` | Rented for a fixed number of years from another state, which kept legal sovereignty. **Must name the lease.** | The New Territories, 99 years from 1 July 1898. |
| `annexation-of-existing-colony` | An existing polity or colony was absorbed whole into British rule or into a larger British territory. | Upper Burma attached to British India, 1886; the Kingdom of Ireland, 1541. |
| `war-transfer` | Handed over by another European power at the end of a war. **Must name the treaty.** | Ceylon and the Cape from the Netherlands, 1802 and 1814; Trinidad from Spain, 1802. |
| `mandate` | Administered under a League of Nations mandate after 1919 — legally a trust to prepare a territory for self-rule, in practice a colony with paperwork. | Palestine 1923; Tanganyika 1922. |
| `trusteeship` | The United Nations successor to a mandate, after 1946, with reporting obligations and a visiting mission. | Tanganyika 1946; British Cameroons. |
| `condominium` | Governed jointly with another power, usually badly. | Sudan with Egypt, 1899; the New Hebrides with France. |
| `occupation` | Held by military force without a settled legal title — sometimes for decades. | Hong Kong Island, January 1841 to June 1843; Egypt from 1882. |
| `informal-influence` | Not ruled, but controlled: gunboats, debt, treaty ports and the threat of the first three. It belongs on the map because leaving it off makes the empire look smaller than it was. | Argentina and the River Plate; the Persian Gulf before the protectorates. |

Every acquisition also carries:

- **`how`** — one sentence, plain verbs, saying what was actually done. Not "was acquired".
- **`counterparties`** — who lost what. `kind` is one of `indigenous-people`, `indigenous-polity`,
  `regional-state`, `empire`, `european-power`, `chartered-company`, `no-resident-population`, `other`.
  `no-resident-population` is allowed and is sometimes true, but it needs a `note` explaining *why* the
  land was empty.
- **`units`** — the geo units this step brought in. They must be inside the territory's coverage at that date.
- optional `instrument`, `people`, `cost`, `resistance`, `contested`, `evidence`.

### 3.3 STATUS — degrees of being British

`statusPeriods` is an ordered, contiguous list. Each entry says what kind of British the place was, who
gave the orders (`howControlWorked`), where from (`governedFrom`), what legislature existed
(`localLegislature`) and **who could actually vote** (`franchise`).

`controlDegree` is 0–5, where **0 = no British authority** and **5 = full direct British sovereignty and
administration**. It drives the map's shading, so the defaults below are binding: override one only with
a `controlDegreeNote` explaining why this case differs.

| Status | Default | What it means |
|---|---|---|
| `company-trading-posts` | 1 | Fortified warehouses held by licence from a local ruler who could expel them. No sovereignty. |
| `company-rule` | 4 | A chartered company governs and taxes, with its own army, under loose parliamentary supervision. |
| `proprietary-colony` | 3 | The colony is a private grant to an individual, who appoints the governor and collects rent. |
| `representative-colony` | 4 | Governor appointed in London; an elected local assembly controls taxes. The franchise is usually tiny and white. |
| `crown-colony` | 5 | Governor appointed in London rules with a nominated council. No elected assembly. |
| `self-governing-colony` | 2 | Local ministers responsible to a local legislature run internal affairs; London keeps defence and foreign policy. |
| `crown-rule` | 5 | Ruled directly by the Crown through a Secretary of State and a Viceroy, outside the Colonial Office structure. British India, 1858–1947. |
| `protectorate` | 3 | Britain runs foreign relations and defence; local rulers keep their thrones and, on paper, their internal power. |
| `protected-state` | 2 | A sovereign state whose foreign policy Britain controls by treaty, with much less interference inside. |
| `princely-state` | 2 | An Indian state under British "paramountcy": its own ruler, its own laws, no foreign policy, and a British Resident at the palace. |
| `mandate` | 4 | Held under League of Nations mandate, with an obligation to report and, in theory, to prepare for self-rule. |
| `trusteeship` | 4 | The UN version of a mandate after 1946: same job, more scrutiny, a visiting mission. |
| `condominium` | 3 | Two powers govern jointly. |
| `leased-territory` | 5 | Britain governs completely, but under a lease with an expiry date and another state's residual sovereignty. |
| `occupied` | 5 | Under military occupation with no settled title. **Also used, with a `controlDegreeNote` and degree 0, when the territory is occupied by someone else** — Hong Kong under Japan, 1941–45. |
| `dominion` | 1 | Self-governing and effectively independent, sharing the Crown. Foreign policy became fully its own between 1926 and 1931. |
| `associated-state` | 1 | Fully self-governing, with Britain retaining defence and foreign affairs by agreement and either side able to end it. |
| `overseas-territory` | 3 | The modern residue: British sovereignty, local self-government, UK-appointed governor. |
| `crown-dependency` | 2 | Not part of the UK and never a colony: Jersey, Guernsey, the Isle of Man. |
| `part-of-uk` | 5 | Legally part of the United Kingdom, sending MPs to Westminster. Ireland 1801–1922; Northern Ireland since. |
| `informal-sphere` | 0 | Not British in law at all, but inside the empire's economic and naval reach. |

**Contiguity rule.** Period *n*'s `to` must be period *n+1*'s `from`. Only the last period may omit `to`,
and only if the territory is still British. A real gap needs `gapBefore: true` and a `gapReason`.

**A status period may repeat.** Ireland has `part-of-uk` twice: once for the whole island to 1922, once
for the six counties after it. The status did not change; the extent did.

### 3.4 DEPARTURE MECHANISMS — how British rule ended

| Mechanism | What it means | Example |
|---|---|---|
| `negotiated-independence` | Independence agreed at a conference and legislated at Westminster, without a war of independence. The commonest ending, and the one students expect least. | Barbados 1966; Ghana 1957. |
| `war-of-independence` | Independence won by armed struggle against British forces. | The United States 1776–83; Ireland 1919–21 (with partition). |
| `insurgency-then-negotiation` | Armed rebellion Britain suppressed militarily, followed within a few years by a negotiated handover — often to people who had opposed the rebels. | Kenya after the Mau Mau emergency; Cyprus after EOKA. |
| `partition` | The territory was divided at independence, usually along a line drawn in a hurry by a British official. **Must fill in `borders` and `consequences.partition`.** | India and Pakistan 1947; Ireland 1921–22; Palestine 1948. |
| `transfer-to-another-power` | Handed to a different state rather than made independent. | Heligoland to Germany 1890; British Somaliland into Somalia 1960. |
| `lease-expiry` | The lease ran out and the territory reverted. | Hong Kong 1997 — where the lease covered only nine tenths of it. |
| `merger-into-neighbour` | Joined an existing neighbouring state instead of standing alone. | British Cameroons, split between Nigeria and Cameroon in 1961. |
| `referendum` | The decisive step was a popular vote. | The 1961 plebiscites in British Cameroons; Malta's 1964 path. |
| `still-a-territory` | It never left. Use with a `stillBritish` record; `date` may be omitted. | Bermuda; the Falkland Islands; Gibraltar. |

Every departure also carries `how` (one sentence), `units` released, `becomes` (what it turned into),
`led` (name people on all sides), `movement`, `cost` (a `toll`, even if only to say nobody died),
`borders` (what the borders did), and optional `instrument`, `contested`, `evidence`.

**Three modelling rulings, so shards stay consistent:**

1. **A transfer between two British territories is not a departure.** Burma leaving British India in 1937
   is a *coverage change* plus an event; Burma was still British. Departure means leaving British control.
2. **Leaving the Commonwealth is not a departure.** Ireland left the empire in 1922 and the Commonwealth
   in 1949. The second belongs in `consequences.commonwealth.left`, plus an event.
3. **A change of status is not an acquisition.** The Crown taking India from the Company in 1858 is a
   status boundary and an event, not a new acquisition — nothing new came under British control.

### 3.5 Other closed lists

- **`counterparty.kind`**: `indigenous-people`, `indigenous-polity`, `regional-state`, `empire`,
  `european-power`, `chartered-company`, `no-resident-population`, `other`.
- **`localLegislature`**: `none`, `nominated-council`, `part-elected`, `elected-assembly`,
  `responsible-government`, `sovereign-parliament`.
- **`stillBritish.statusToday`**: `british-overseas-territory`, `crown-dependency`, `part-of-uk`,
  `sovereign-base-area`, `antarctic-claim`, `disputed`.
- **`event.kind`**: `war`, `battle`, `revolt`, `massacre`, `act-of-parliament`, `treaty`, `conference`,
  `famine`, `epidemic`, `abolition`, `migration`, `company`, `exploration`, `economic`, `constitutional`,
  `independence`.
- **`consequences.violence.kind`**: `war-of-conquest`, `rebellion-suppressed`, `communal-violence`,
  `counter-insurgency`, `massacre`, `famine-policy`, `penal-transportation`, `internment`.
- **`consequences.populationTransfer.kind`**: `enslaved-people-transported`, `indentured-labour`,
  `settler-migration`, `convict-transportation`, `refugee-flight`, `forced-removal`,
  `emigration-under-famine`.
- **`citation.kind`**: `book`, `chapter`, `article`, `primary-source`, `official-record`,
  `reference-work`, `dataset`.

---

## 4. Coverage: extent over time

```json
{ "from": {...}, "to": {...}, "units": ["in","bd","mm"],
  "gained": ["mm"], "lost": [], "partial": ["in","mm"],
  "label": "With Arakan and Tenasserim",
  "change": "The Treaty of Yandabo took the Burmese coast." }
```

- Periods are ordered and must not overlap. Only the last may omit `to`.
- `units` is the **complete** set for that period, not a delta. `gained` and `lost` are optional
  annotations; if you supply them the validator checks them against the actual set difference.
- `partial` marks units British control did not fill — draw them hatched. British India carries
  `partial: ["in"]` for its whole life because two fifths of it was princely states.
- Every period after the first needs a `change` sentence saying what happened.
- Occupation by an enemy is **not** a coverage change: Hong Kong's coverage runs unbroken through
  1941–45, and the Japanese occupation is a status period with `controlDegree: 0`. Extent and control
  are different axes and the map draws them differently.

---

## 5–8. Acquisition, status, departure, consequences — two rules easy to miss

Covered by the vocabularies above. Two rules the validator enforces that are easy to miss:

- **Human cost needs a note.** Any `toll` with a number must carry a `note` saying who counted, when,
  and how disputed the figure is. Give the historians' range; never round a death toll to make it tidy.
- **Partition is a package.** `mechanism: "partition"` requires `borders` on the departure *and*
  `consequences.partition.happened: true`.

---

## 9. Evidence

1–3 citations per territory, at least one per event, and optionally one to three more attached to a
single acquisition or departure that needs its own backing.

```json
{ "author": "Yasmin Khan", "work": "The Great Partition: The Making of India and Pakistan",
  "year": 2007, "kind": "book", "publisher": "Yale University Press",
  "supports": "The speed of the transfer, the violence and the displacement figures." }
```

**Never invent a citation** (brief, rule 5). Cite works you are confident exist. Do not give a page
number unless you are certain of the edition — the validator warns about page locators for exactly this
reason. `supports` says which claim the source backs, so a reviewer can check one thing rather than a book.

`confidence: "low"` requires a `contested.note`. `contested.isContested: true` requires a note saying
what is disputed and, where useful, `positions[]` with who holds each view.

---

## 10. Pedagogy

Three required fields, and they are the ones students actually remember.

- **`hook`** — one arresting **true** sentence. Specific, surprising, checkable. Not a summary.
  Good: *"For 258 of the 347 years, 'British India' was a shareholder-owned company with a private army
  of over 200,000 men."* Bad: *"India was the jewel in the crown."*
- **`misconception`** — `belief` (the wrong thing students usually think) and `correction` (what is
  actually true, with the evidence inside it). This is the highest-value field in the model: it is what
  makes the atlas beat a textbook chapter.
- **`whyItMatters`** — why this place explains something bigger.
- **`keyDates`** — up to six dates worth memorising; the quiz reads them.
- **`compareWith`** — territory ids that make an instructive contrast.

The validator warns on house-style filler ("played a key role", "rich tapestry") and fails on
placeholder text.

---

## 11. Events

Wars, acts, treaties, revolts, famines and conferences are **first-class objects**, not fields on a
territory, because the timeline and the guided tours hang narrative on them and one event usually
touches many places.

Required: `id`, `title`, `kind`, `date`, `summary`, `significance`, `links`, `evidence`, `confidence`.
`links` must anchor the event to at least one territory or one geo unit, or it can never appear on the
map; `links.places` carries point coordinates for map pins. `changedStatus: true` marks the events that
are the hinge of a status change somewhere, which the timeline renders differently.

Events may live in the same shard as their territories or in `app/data/events/`. Ids are global either way.

---

## 12. What the validator checks

`node tools/validate-data.js [files…] [--strict] [--json] [--quiet] [--geo path] [--skip-template]`

Exit 0 clean, 1 on errors (or on warnings with `--strict`), 2 if it cannot run.

**Errors** — schema conformance against `schema.json`; unparseable JSON with line and column; dates that
are not real calendar dates or that run backwards; soft precision with no note; ranges with no end;
coverage periods out of order, overlapping, or with `gained`/`lost` that do not match the actual set
difference; status periods out of order, overlapping, or with a gap and no `gapBefore`; a non-final
status period with no `to`; status beginning before the first acquisition; a `controlDegree` that
departs from the default with no note; a territory with no acquisition; a territory with neither a
departure nor a `stillBritish`; a departure dated before the first acquisition; a departure with no date
that is not `still-a-territory`; a unit claimed by an acquisition, departure or successor that the
territory's coverage does not include at that date; a unit id absent from `units.index.json`; a
`treaty-cession`, `war-transfer`, `lease` or `purchase` with no instrument named; a partition with no
`borders` or no `consequences.partition`; an acquisition with no counterparty; a toll with numbers and
no note, or with low above high; missing citations; a future-dated citation; duplicate territory, event
or step ids anywhere in the dataset; an event that links to nothing; a contested flag with no note;
placeholder text.

**Warnings** — `units.index.json` missing entirely; unit ids used via an alias; geo units that no
territory claims; cross-shard references to territories or events that no shard defines yet; two
territories covering the same unit at the same time without `nestedWithin`; a departure that names no
leaders, no cost, or no border consequence; a status period with no `controlDegree`; a coverage change
with no `change` sentence; fewer than three key dates; a territory whose region differs from its shard's;
the same work cited with two different years; page-number locators; house-style filler.

The report is grouped by file, itemised with a JSON path, a message, a hint and a stable code
(`status/gap`, `units/not-covered-at-date`, …) so fixes can be scripted and CI can grep.

---

## 13. How to write a shard

1. Copy `app/data/territories/_TEMPLATE.json` to `app/data/territories/<your-region>.json`.
2. Replace the Barbados territory. Keep every field; delete only the ones that are genuinely
   inapplicable and are not required.
3. Get the unit ids from `app/data/geo/units.index.json`. Never invent one.
4. Run `node tools/validate-data.js` until it is clean, then once with `--strict`.
5. Read the `hook` and the `misconception` out loud. If a fifteen-year-old would not repeat either of
   them to a friend, rewrite them.

---

## 14. Worked example A — British India, 1600 to 1947

The hard case for **status** (a company, then the Crown), for **coverage** (Burma and Aden gained, then
split off in 1937 without leaving the empire), and for **departure** (one colony into two states in
1947, three by 1971).

The `units` arrays below are **abridged** to the places the text actually names, so the example stays
readable: a production shard lists every unit and gives each annexation its own coverage period. Every
id used is a real id from `units.index.json`, and the whole example validates clean.

Note what is *not* modelled as an acquisition or a departure: 1858 is a status boundary plus an event,
because nothing new came under British control; 1937 is a coverage change plus an event, because Burma
stayed British. The princely states are separate territories with `nestedWithin: "british-india"`, which
is also why the Indian unit is marked `partial` for the territory's whole life.

```json
{
  "id": "british-india",
  "name": "British India",
  "formalName": "The Indian Empire: British India and the princely states",
  "region": "south-asia",
  "sortOrder": 1,
  "namesOverTime": [
    {
      "name": "The Company's settlements",
      "from": {
        "value": "1612",
        "precision": "year",
        "display": "1612"
      },
      "to": {
        "value": "1765",
        "precision": "year",
        "display": "1765"
      },
      "language": "English",
      "usedBy": "british-official",
      "note": "Before 1765 there was no 'British India': there were fortified trading posts held on Mughal sufferance."
    },
    {
      "name": "British India",
      "from": {
        "value": "1765-08-12",
        "precision": "exact",
        "display": "12 August 1765"
      },
      "to": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "language": "English",
      "usedBy": "british-official"
    },
    {
      "name": "The Raj",
      "from": {
        "value": "1858-11-01",
        "precision": "exact",
        "display": "1 November 1858"
      },
      "to": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "language": "Hindustani",
      "usedBy": "local",
      "note": "Raj simply means 'rule'. It came into English as shorthand for the Crown period after 1858."
    }
  ],
  "modernSuccessors": [
    {
      "name": "India",
      "iso3": "IND",
      "since": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "in-punjab-india",
        "in-uttar-pradesh"
      ]
    },
    {
      "name": "Pakistan",
      "iso3": "PAK",
      "since": {
        "value": "1947-08-14",
        "precision": "exact",
        "display": "14 August 1947"
      },
      "units": [
        "pk-sindh",
        "pk-punjab"
      ]
    },
    {
      "name": "Bangladesh",
      "iso3": "BGD",
      "since": {
        "value": "1971-12-16",
        "precision": "exact",
        "display": "16 December 1971"
      },
      "units": [
        "bd-east-bengal"
      ],
      "note": "East Pakistan in 1947; independent after the 1971 war, in which between 300,000 and 3 million people were killed."
    },
    {
      "name": "Myanmar",
      "iso3": "MMR",
      "since": {
        "value": "1948-01-04",
        "precision": "exact",
        "display": "4 January 1948"
      },
      "units": [
        "mm-arakan",
        "mm-tenasserim",
        "mm-lower-burma",
        "mm-upper-burma"
      ],
      "note": "Governed as a province of British India until 1937, then as a separate colony."
    },
    {
      "name": "Yemen",
      "iso3": "YEM",
      "since": {
        "value": "1967-11-30",
        "precision": "exact",
        "display": "30 November 1967"
      },
      "units": [
        "ye-aden-colony"
      ],
      "note": "Aden was run from Bombay until 1937 — the empire's filing system, not its geography, decided that."
    }
  ],
  "geoCoverage": [
    {
      "from": {
        "value": "1612",
        "precision": "year",
        "display": "1612"
      },
      "to": {
        "value": "1765-08-12",
        "precision": "exact",
        "display": "12 August 1765"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat"
      ],
      "partial": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat"
      ],
      "label": "Coastal factories only",
      "change": "Walled trading posts at Surat, Madras, Bombay and Calcutta, licensed by Mughal or local rulers. Shade these as points, not territory."
    },
    {
      "from": {
        "value": "1765-08-12",
        "precision": "exact",
        "display": "12 August 1765"
      },
      "to": {
        "value": "1826-02-24",
        "precision": "exact",
        "display": "24 February 1826"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal"
      ],
      "gained": [
        "in-bihar",
        "in-odisha",
        "bd-east-bengal"
      ],
      "partial": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat"
      ],
      "label": "Bengal, Bihar and Orissa",
      "change": "The Diwani made the Company the tax collector of 20 million people. Everything west and south is still Maratha, Mysorean, Sikh or Mughal."
    },
    {
      "from": {
        "value": "1826-02-24",
        "precision": "exact",
        "display": "24 February 1826"
      },
      "to": {
        "value": "1839-01-19",
        "precision": "exact",
        "display": "19 January 1839"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal",
        "mm-arakan",
        "mm-tenasserim"
      ],
      "gained": [
        "mm-arakan",
        "mm-tenasserim"
      ],
      "partial": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "mm-arakan",
        "mm-tenasserim"
      ],
      "label": "With Arakan and Tenasserim",
      "change": "The Treaty of Yandabo took the Burmese coast; the Maratha wars had ended in 1818, so most of the peninsula is now Company territory or a subordinate princely state."
    },
    {
      "from": {
        "value": "1839-01-19",
        "precision": "exact",
        "display": "19 January 1839"
      },
      "to": {
        "value": "1843-02-17",
        "precision": "exact",
        "display": "17 February 1843"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal",
        "mm-arakan",
        "mm-tenasserim",
        "ye-aden-colony"
      ],
      "gained": [
        "ye-aden-colony"
      ],
      "partial": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "mm-arakan",
        "mm-tenasserim"
      ],
      "label": "With Aden",
      "change": "Aden was stormed to make a coaling station on the route to Bombay, and was administered from Bombay for the next 98 years."
    },
    {
      "from": {
        "value": "1843-02-17",
        "precision": "exact",
        "display": "17 February 1843"
      },
      "to": {
        "value": "1937-04-01",
        "precision": "exact",
        "display": "1 April 1937"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal",
        "mm-arakan",
        "mm-tenasserim",
        "ye-aden-colony",
        "pk-sindh",
        "pk-punjab",
        "in-punjab-india",
        "in-uttar-pradesh",
        "mm-lower-burma",
        "mm-upper-burma"
      ],
      "gained": [
        "pk-sindh",
        "pk-punjab",
        "in-punjab-india",
        "in-uttar-pradesh",
        "mm-lower-burma",
        "mm-upper-burma"
      ],
      "partial": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat"
      ],
      "label": "Greatest extent",
      "change": "Sindh in 1843, Punjab in 1849, Lower Burma in 1852, Awadh in 1856 and Upper Burma in 1886 complete the map. A production shard gives each annexation its own period; they are merged here to keep the example readable."
    },
    {
      "from": {
        "value": "1937-04-01",
        "precision": "exact",
        "display": "1 April 1937"
      },
      "to": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal",
        "pk-sindh",
        "pk-punjab",
        "in-punjab-india",
        "in-uttar-pradesh"
      ],
      "lost": [
        "mm-arakan",
        "mm-tenasserim",
        "ye-aden-colony",
        "mm-lower-burma",
        "mm-upper-burma"
      ],
      "partial": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat"
      ],
      "label": "After Burma and Aden are split off",
      "change": "The Government of India Act 1935 made Burma and Aden separate colonies on 1 April 1937. They stayed British; they stopped being India."
    }
  ],
  "succeededBy": [
    "british-burma",
    "aden-colony"
  ],
  "acquisitions": [
    {
      "id": "eic-charter-1600",
      "date": {
        "value": "1600-12-31",
        "precision": "exact",
        "display": "31 December 1600"
      },
      "mechanism": "chartered-company",
      "how": "Elizabeth I gave 218 London merchants a monopoly of English trade east of the Cape of Good Hope; the charter granted no land and no sovereignty over anyone.",
      "counterparties": [
        {
          "name": "Other English merchants",
          "kind": "other",
          "lost": "The legal right to trade east of the Cape; the charter was a monopoly against rival Englishmen, not a claim on India."
        }
      ],
      "instrument": {
        "name": "Royal charter to the Governor and Company of Merchants of London trading into the East Indies",
        "kind": "charter",
        "signed": {
          "value": "1600-12-31",
          "precision": "exact",
          "display": "31 December 1600"
        }
      },
      "confidence": "high"
    },
    {
      "id": "surat-farman-1612",
      "date": {
        "value": "1612",
        "precision": "year",
        "display": "1612"
      },
      "mechanism": "chartered-company",
      "how": "After beating a Portuguese squadron off Swally, the Company was licensed by the Mughal emperor Jahangir to keep a warehouse at Surat and pay customs like any other merchant.",
      "counterparties": [
        {
          "name": "Mughal Empire",
          "kind": "empire",
          "lost": "Nothing yet. Jahangir ruled 100 million people and treated the English as a minor trading nuisance worth taxing.",
          "note": "The asymmetry is the point: in 1612 the Company was the weaker party by an enormous margin."
        }
      ],
      "units": [
        "in-gujarat"
      ],
      "instrument": {
        "name": "Farman of the emperor Jahangir",
        "kind": "grant"
      },
      "confidence": "medium",
      "contested": {
        "isContested": true,
        "note": "Sources date the Surat farman to 1612, 1613 or 1618 depending on which document is counted as the grant. The atlas uses 1612, the year the factory was established."
      }
    },
    {
      "id": "diwani-1765",
      "date": {
        "value": "1765-08-12",
        "precision": "exact",
        "display": "12 August 1765"
      },
      "mechanism": "conquest",
      "secondaryMechanisms": [
        "treaty-cession"
      ],
      "how": "After winning at Plassey in 1757 and Buxar in 1764, Robert Clive made the defeated Mughal emperor sign over the diwani — the right to tax Bengal, Bihar and Orissa — to a company of shareholders.",
      "counterparties": [
        {
          "name": "Shah Alam II, Mughal emperor",
          "kind": "empire",
          "lost": "The tax revenue of the richest province of his empire, and with it any means of paying an army."
        },
        {
          "name": "Nawabs of Bengal",
          "kind": "regional-state",
          "lost": "Real power. Mir Jafar and his successors kept the title and the palace and became salaried figureheads."
        }
      ],
      "units": [
        "in-west-bengal",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal"
      ],
      "instrument": {
        "name": "Treaty of Allahabad",
        "kind": "treaty",
        "signed": {
          "value": "1765-08-12",
          "precision": "exact",
          "display": "12 August 1765"
        }
      },
      "people": [
        {
          "name": "Robert Clive",
          "role": "Company commander and negotiator",
          "side": "british"
        },
        {
          "name": "Shah Alam II",
          "role": "Mughal emperor who signed away the diwani",
          "side": "local"
        },
        {
          "name": "Mir Qasim",
          "role": "Nawab who fought the Company at Buxar and lost",
          "side": "local"
        }
      ],
      "cost": {
        "deathsLow": 1200000,
        "deathsHigh": 10000000,
        "note": "The Bengal famine of 1770 killed between one and ten million people in a province the Company was taxing while grain prices rose. Estimates vary because the Company counted revenue, not deaths."
      },
      "resistance": "Mir Qasim, the Nawab of Awadh and the Mughal emperor fought a combined campaign and were beaten at Buxar on 22 October 1764.",
      "confidence": "high",
      "evidence": [
        {
          "author": "William Dalrymple",
          "work": "The Anarchy: The Relentless Rise of the East India Company",
          "year": 2019,
          "kind": "book",
          "supports": "Plassey, Buxar and the seizure of the diwani."
        }
      ]
    },
    {
      "id": "yandabo-1826",
      "date": {
        "value": "1826-02-24",
        "precision": "exact",
        "display": "24 February 1826"
      },
      "mechanism": "war-transfer",
      "how": "The First Anglo-Burmese War ended with the Konbaung kingdom ceding Arakan and Tenasserim and paying an indemnity of one million pounds.",
      "counterparties": [
        {
          "name": "Konbaung kingdom of Burma",
          "kind": "regional-state",
          "lost": "Its western and southern coasts, and the indemnity that crippled its finances for a generation."
        }
      ],
      "units": [
        "mm-arakan",
        "mm-tenasserim"
      ],
      "instrument": {
        "name": "Treaty of Yandabo",
        "kind": "treaty",
        "signed": {
          "value": "1826-02-24",
          "precision": "exact",
          "display": "24 February 1826"
        }
      },
      "cost": {
        "deathsLow": 15000,
        "deathsHigh": 40000,
        "money": "£13 million, the most expensive war the Company had yet fought.",
        "note": "Most British and Indian deaths were from disease, not fighting. Burmese losses were never counted."
      },
      "confidence": "high"
    },
    {
      "id": "aden-1839",
      "date": {
        "value": "1839-01-19",
        "precision": "exact",
        "display": "19 January 1839"
      },
      "mechanism": "conquest",
      "how": "A Bombay Marine expedition under Captain Stafford Haines bombarded and stormed Aden to secure a coaling station on the steamer route to India.",
      "counterparties": [
        {
          "name": "Sultanate of Lahej",
          "kind": "regional-state",
          "lost": "Its port, taken after a dispute over a wrecked ship was used as the pretext."
        }
      ],
      "units": [
        "ye-aden-colony"
      ],
      "confidence": "high"
    },
    {
      "id": "sindh-1843",
      "date": {
        "value": "1843-02-17",
        "precision": "exact",
        "display": "17 February 1843"
      },
      "mechanism": "conquest",
      "how": "Sir Charles Napier provoked and then destroyed the Talpur amirs at Miani, annexing Sindh against the wishes of his own government.",
      "counterparties": [
        {
          "name": "Talpur amirs of Sindh",
          "kind": "regional-state",
          "lost": "Their state, in a campaign the Company's own directors called unjustified."
        }
      ],
      "units": [
        "pk-sindh"
      ],
      "confidence": "high"
    },
    {
      "id": "punjab-1849",
      "date": {
        "value": "1849-03-29",
        "precision": "exact",
        "display": "29 March 1849"
      },
      "mechanism": "conquest",
      "how": "After two wars the Sikh empire was annexed, its eleven-year-old maharaja deposed and sent to England, and the Koh-i-Noor diamond taken as an indemnity.",
      "counterparties": [
        {
          "name": "Sikh Empire",
          "kind": "regional-state",
          "lost": "Independence, the treasury, and the last army in the subcontinent capable of beating the Company in the field."
        },
        {
          "name": "Duleep Singh",
          "kind": "regional-state",
          "lost": "His throne at the age of eleven; he was exiled to Britain and converted to Christianity."
        }
      ],
      "units": [
        "pk-punjab",
        "in-punjab-india"
      ],
      "confidence": "high"
    },
    {
      "id": "upper-burma-1886",
      "date": {
        "value": "1886-01-01",
        "precision": "exact",
        "display": "1 January 1886"
      },
      "mechanism": "annexation-of-existing-colony",
      "how": "Three weeks after taking Mandalay, Britain abolished the Burmese monarchy by proclamation, exiled King Thibaw to India, and attached the whole kingdom to British India as a province.",
      "counterparties": [
        {
          "name": "Konbaung kingdom of Burma",
          "kind": "regional-state",
          "lost": "Its monarchy and its existence as a state; guerrilla resistance continued for five more years."
        }
      ],
      "units": [
        "mm-upper-burma"
      ],
      "instrument": {
        "name": "Proclamation annexing Upper Burma",
        "kind": "proclamation",
        "signed": {
          "value": "1886-01-01",
          "precision": "exact",
          "display": "1 January 1886"
        }
      },
      "confidence": "high"
    }
  ],
  "statusPeriods": [
    {
      "status": "company-trading-posts",
      "from": {
        "value": "1612",
        "precision": "year",
        "display": "1612"
      },
      "to": {
        "value": "1765-08-12",
        "precision": "exact",
        "display": "12 August 1765"
      },
      "label": "Company factories under Mughal licence",
      "howControlWorked": "The Company rented walled warehouses, paid Mughal customs and could be expelled at any time; in 1686 it fought the emperor Aurangzeb, lost, and had to apologise.",
      "controlDegree": 1,
      "governedFrom": "Court of Directors, Leadenhall Street, London",
      "localLegislature": "none"
    },
    {
      "status": "company-rule",
      "from": {
        "value": "1765-08-12",
        "precision": "exact",
        "display": "12 August 1765"
      },
      "to": {
        "value": "1858-11-01",
        "precision": "exact",
        "display": "1 November 1858"
      },
      "label": "Company rule",
      "howControlWorked": "A private company with shareholders in London collected the land tax of northern India through Indian officials and enforced it with an army of over 200,000 sepoys.",
      "controlDegree": 4,
      "governedFrom": "Calcutta, under the Court of Directors and, after 1784, a government Board of Control",
      "localLegislature": "none",
      "franchise": "Nobody in India voted for anything. The Company's shareholders in London elected its directors.",
      "eventIds": [
        "government-of-india-act-1858"
      ],
      "note": "Parliament tightened its grip in stages: the Regulating Act 1773, Pitt's India Act 1784 and the charter renewals of 1813, 1833 and 1853."
    },
    {
      "status": "crown-rule",
      "from": {
        "value": "1858-11-01",
        "precision": "exact",
        "display": "1 November 1858"
      },
      "to": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "label": "The Raj: direct Crown rule",
      "howControlWorked": "A Viceroy in Calcutta, then Delhi, answered to a Secretary of State in the British Cabinet; about a thousand British civil servants governed 300 million people through Indian clerks, police and soldiers.",
      "controlDegree": 5,
      "governedFrom": "Calcutta to 1911, then New Delhi, under the India Office in London",
      "localLegislature": "part-elected",
      "franchise": "Elected Indian representation came slowly and narrowly: about 3% of adults could vote after 1919 and about 14% after the Government of India Act 1935.",
      "eventIds": [
        "government-of-india-act-1858"
      ],
      "note": "The 565 princely states were never British territory. They kept their rulers under 'paramountcy' and are modelled as separate nested territories."
    }
  ],
  "departures": [
    {
      "id": "partition-1947",
      "date": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "mechanism": "partition",
      "secondaryMechanisms": [
        "negotiated-independence"
      ],
      "how": "Britain, broke and unable to hold India after the war, brought the deadline forward by ten months and left in seventy-three days, splitting the country along a line nobody had seen.",
      "units": [
        "in-tamil-nadu",
        "in-maharashtra",
        "in-west-bengal",
        "in-gujarat",
        "in-bihar",
        "in-odisha",
        "bd-east-bengal",
        "pk-sindh",
        "pk-punjab",
        "in-punjab-india",
        "in-uttar-pradesh"
      ],
      "becomes": [
        {
          "name": "India",
          "kind": "sovereign-state",
          "units": [
            "in-tamil-nadu",
            "in-maharashtra",
            "in-west-bengal",
            "in-gujarat",
            "in-bihar",
            "in-odisha",
            "in-punjab-india",
            "in-uttar-pradesh"
          ]
        },
        {
          "name": "Pakistan",
          "kind": "sovereign-state",
          "units": [
            "pk-sindh",
            "pk-punjab",
            "bd-east-bengal"
          ]
        }
      ],
      "led": [
        {
          "name": "Jawaharlal Nehru",
          "role": "Congress leader, first Prime Minister of India",
          "side": "local",
          "lived": "1889-1964"
        },
        {
          "name": "Muhammad Ali Jinnah",
          "role": "Muslim League leader who demanded and won Pakistan",
          "side": "local",
          "lived": "1876-1948"
        },
        {
          "name": "Mohandas Gandhi",
          "role": "led three decades of mass non-violent resistance; opposed partition and was not at the ceremony",
          "side": "local",
          "lived": "1869-1948"
        },
        {
          "name": "Louis Mountbatten",
          "role": "last Viceroy, who moved the date forward to June 1948 and then to August 1947",
          "side": "british",
          "lived": "1900-1979"
        },
        {
          "name": "Cyril Radcliffe",
          "role": "London lawyer who drew the border in five weeks, having never been to India",
          "side": "british",
          "lived": "1899-1977"
        }
      ],
      "movement": "Indian National Congress and the All-India Muslim League",
      "cost": {
        "deathsLow": 200000,
        "deathsHigh": 2000000,
        "displacedLow": 12000000,
        "displacedHigh": 18000000,
        "note": "No one counted. The range is the span between the official contemporary estimate and the highest scholarly figure; the displacement figure is the largest forced migration in recorded history."
      },
      "borders": "Radcliffe divided Punjab and Bengal with a line published on 17 August, two days after independence, so for two days millions did not know which country they were in.",
      "instrument": {
        "name": "Indian Independence Act 1947",
        "kind": "act-of-parliament",
        "signed": {
          "value": "1947-07-18",
          "precision": "exact",
          "display": "18 July 1947"
        }
      },
      "eventIds": [
        "government-of-india-act-1858"
      ],
      "confidence": "high",
      "contested": {
        "isContested": true,
        "note": "Historians disagree sharply about responsibility: whether partition was made inevitable by Congress intransigence, by Jinnah's demand, or by a British departure so rushed that no orderly transfer was possible."
      },
      "evidence": [
        {
          "author": "Yasmin Khan",
          "work": "The Great Partition: The Making of India and Pakistan",
          "year": 2007,
          "kind": "book",
          "publisher": "Yale University Press",
          "supports": "The speed of the transfer, the violence and the displacement figures."
        }
      ]
    }
  ],
  "consequences": {
    "partition": {
      "happened": true,
      "note": "One colony became two states in 1947 and three in 1971, and the borders drawn in 1947 have caused four wars since.",
      "lineDrawnBy": "Cyril Radcliffe, chairing two boundary commissions that deadlocked, leaving him to decide alone",
      "date": {
        "value": "1947-08-17",
        "precision": "exact",
        "display": "17 August 1947"
      }
    },
    "violence": {
      "note": "Partition killed hundreds of thousands of people in Punjab and Bengal within weeks, in massacres carried out by neighbours rather than armies.",
      "kind": [
        "communal-violence",
        "rebellion-suppressed",
        "famine-policy"
      ],
      "toll": {
        "deathsLow": 200000,
        "deathsHigh": 2000000,
        "note": "Partition deaths only. Separate from the 1943 Bengal famine, in which about three million people died while grain was exported and relief was refused."
      }
    },
    "populationTransfer": {
      "note": "Between 12 and 18 million people crossed the new borders in 1947, and roughly 1.5 million Indians had already been shipped across the empire as indentured labour after 1834.",
      "kind": [
        "refugee-flight",
        "indentured-labour"
      ]
    },
    "commonwealth": {
      "member": true,
      "since": {
        "value": "1947-08-15",
        "precision": "exact",
        "display": "15 August 1947"
      },
      "realm": false,
      "note": "India became a republic in 1950 and stayed in the Commonwealth: the 1949 London Declaration invented that possibility for it."
    },
    "borderLegacy": "Kashmir, divided in 1947 and never settled, has caused three of the four India-Pakistan wars and is still the most militarised border in the world.",
    "economicLegacy": "India's share of world manufacturing output fell from roughly a quarter in 1750 to about 2% by 1900, while Britain's rose.",
    "languageAndLaw": "English remains an official language, the Indian Penal Code of 1860 is still in force in modified form, and the railways run on the network built to move troops and cotton."
  },
  "peak": {
    "areaKm2": 4900000,
    "areaYear": 1935,
    "population": 389000000,
    "populationYear": 1941,
    "populationNote": "1941 census of British India and the princely states combined.",
    "exports": [
      "cotton",
      "opium",
      "tea",
      "jute",
      "indigo",
      "wheat"
    ]
  },
  "evidence": [
    {
      "author": "Barbara D. Metcalf and Thomas R. Metcalf",
      "work": "A Concise History of Modern India",
      "year": 2012,
      "kind": "book",
      "publisher": "Cambridge University Press",
      "supports": "Overall narrative from Company rule to independence."
    },
    {
      "author": "William Dalrymple",
      "work": "The Anarchy: The Relentless Rise of the East India Company",
      "year": 2019,
      "kind": "book",
      "publisher": "Bloomsbury",
      "supports": "The Company period, its army and its finances."
    },
    {
      "author": "Yasmin Khan",
      "work": "The Great Partition: The Making of India and Pakistan",
      "year": 2007,
      "kind": "book",
      "publisher": "Yale University Press",
      "supports": "Partition, its violence and its displacement."
    }
  ],
  "confidence": "high",
  "contested": {
    "isContested": true,
    "note": "The economic effect of British rule is genuinely disputed: the drain of wealth argued by Dadabhai Naoroji and Utsa Patnaik against the market-integration case made by Tirthankar Roy. Show both, do not split the difference."
  },
  "pedagogy": {
    "hook": "For 258 of the 347 years, 'British India' was a shareholder-owned company with a private army of over 200,000 men, twice the size of the British Army.",
    "misconception": {
      "belief": "Britain ruled the whole of India directly, from London.",
      "correction": "Two fifths of the subcontinent was never British territory. 565 princely states, from Hyderabad — larger than Britain — down to estates of a few square miles, kept their own rulers under British 'paramountcy'. That is why in 1947 the map had to be reassembled state by state, and why Hyderabad had to be invaded in 1948."
    },
    "whyItMatters": "India was the reason for much of the rest of the empire: Aden, Singapore, Egypt, Cyprus and swathes of East Africa were taken to protect the route to it. Understand India and half the map explains itself.",
    "keyDates": [
      {
        "date": {
          "value": "1600-12-31",
          "precision": "exact",
          "display": "31 December 1600"
        },
        "what": "East India Company chartered"
      },
      {
        "date": {
          "value": "1765-08-12",
          "precision": "exact",
          "display": "12 August 1765"
        },
        "what": "Diwani of Bengal: a company becomes a government"
      },
      {
        "date": {
          "value": "1857-05-10",
          "precision": "exact",
          "display": "10 May 1857"
        },
        "what": "Rebellion begins at Meerut"
      },
      {
        "date": {
          "value": "1858-11-01",
          "precision": "exact",
          "display": "1 November 1858"
        },
        "what": "The Crown takes over from the Company"
      },
      {
        "date": {
          "value": "1937-04-01",
          "precision": "exact",
          "display": "1 April 1937"
        },
        "what": "Burma and Aden separated from India"
      },
      {
        "date": {
          "value": "1947-08-15",
          "precision": "exact",
          "display": "15 August 1947"
        },
        "what": "Independence and partition"
      }
    ],
    "compareWith": [
      "ireland",
      "hong-kong"
    ],
    "readingLevel": "core"
  },
  "eventIds": [
    "government-of-india-act-1858"
  ],
  "tags": [
    "company-rule",
    "partition",
    "raj",
    "south-asia"
  ]
}
```

The event that hinges the 1858 status boundary, linked from `statusPeriods[].eventIds`:

```json
{
  "id": "government-of-india-act-1858",
  "title": "The Crown takes India from the Company",
  "kind": "act-of-parliament",
  "date": {
    "value": "1858-08-02",
    "precision": "exact",
    "display": "2 August 1858"
  },
  "endDate": {
    "value": "1858-11-01",
    "precision": "exact",
    "display": "1 November 1858"
  },
  "summary": "After the rebellion of 1857, Parliament abolished the East India Company's government, transferred its territories, treasury and 200,000-strong army to the Crown, and had the transfer proclaimed at Allahabad on 1 November 1858.",
  "significance": "It ended 258 years of rule by a chartered company and created the Raj: a Secretary of State in the Cabinet, a Viceroy in Calcutta, and a promise of religious non-interference that was meant to prevent another 1857.",
  "scope": "regional",
  "region": "south-asia",
  "links": {
    "territories": [
      "british-india"
    ],
    "units": [
      "in-west-bengal",
      "in-uttar-pradesh",
      "in-bihar",
      "pk-punjab"
    ],
    "places": [
      {
        "name": "Allahabad",
        "lat": 25.4358,
        "lon": 81.8463,
        "note": "Where Queen Victoria's proclamation was read on 1 November 1858."
      },
      {
        "name": "Meerut",
        "lat": 28.9845,
        "lon": 77.7064,
        "note": "Where the rebellion began on 10 May 1857."
      }
    ]
  },
  "people": [
    {
      "name": "Bahadur Shah Zafar",
      "role": "last Mughal emperor, proclaimed leader by the rebels, tried and exiled to Rangoon",
      "side": "local",
      "lived": "1775-1862"
    },
    {
      "name": "Lakshmibai, Rani of Jhansi",
      "role": "led the defence of Jhansi and was killed in action at Gwalior in June 1858",
      "side": "local",
      "lived": "1828-1858"
    },
    {
      "name": "Charles Canning",
      "role": "last Governor-General of the Company and first Viceroy",
      "side": "british",
      "lived": "1812-1862"
    }
  ],
  "toll": {
    "deathsLow": 800000,
    "deathsHigh": 10000000,
    "note": "Estimates of Indian deaths in the rebellion and the reprisals range enormously; the higher figures include famine and epidemic deaths across the affected provinces in 1857-58. About 6,000 Europeans died. No official count of Indian deaths was made."
  },
  "changedStatus": true,
  "pedagogy": {
    "hook": "The British government did not conquer India in 1858; it took over from a company that had already done it, and paid the shareholders off until 1874.",
    "misconception": {
      "belief": "1857 was a mutiny by soldiers upset about greased cartridges.",
      "correction": "The cartridges lit it, but the fuel was twenty years of annexations under the Doctrine of Lapse, land settlements that ruined landlords and peasants, and the annexation of Awadh in 1856, home province of a third of the Bengal army. Indian historians have called it the first war of independence since 1909."
    },
    "whyItMatters": "Everything students recognise as 'the Raj' — the Viceroy, the ICS, the durbars — begins here, and begins as a response to losing control."
  },
  "evidence": [
    {
      "author": "Barbara D. Metcalf and Thomas R. Metcalf",
      "work": "A Concise History of Modern India",
      "year": 2012,
      "kind": "book",
      "publisher": "Cambridge University Press",
      "supports": "The rebellion, the transfer of power and the shape of the new government."
    }
  ],
  "confidence": "high",
  "contested": {
    "isContested": true,
    "note": "What to call 1857 — mutiny, rebellion, or first war of independence — is itself the argument, and the name a textbook chooses tells you where it was written."
  },
  "tags": [
    "1857",
    "raj",
    "company-rule"
  ]
}
```

---

## 15. Worked example B — Ireland, 1541 to 1922 to 1949

The hard case for a place that was **legally part of the metropolitan state**, that **partitioned**, and
where **part of it never left**. Watch four things:

- `part-of-uk` appears twice. The status did not change in 1922; the extent did.
- The territory has both `departures` (the 26 counties, 1922) and `stillBritish` (the six counties, still).
- 1949 is not a departure. Ireland left the empire in 1922 and the Commonwealth in 1949, and the model
  keeps those apart: `consequences.commonwealth.left`.
- The 1541–1801 period is labelled `representative-colony` and the `note` admits the label is arguable.
  Ireland was formally a kingdom. The model records how power worked and says openly that historians
  dispute the framing, rather than pretending the question is settled.

```json
{
  "id": "ireland",
  "name": "Ireland",
  "formalName": "The Kingdom of Ireland, then part of the United Kingdom of Great Britain and Ireland",
  "region": "british-isles",
  "sortOrder": 1,
  "namesOverTime": [
    {
      "name": "Lordship of Ireland",
      "from": {
        "value": "1177",
        "precision": "year",
        "display": "1177"
      },
      "to": {
        "value": "1541-06-18",
        "precision": "exact",
        "display": "18 June 1541"
      },
      "language": "English",
      "usedBy": "british-official",
      "note": "The Anglo-Norman lordship held only the Pale around Dublin and scattered lordships; most of the island was governed by Gaelic law."
    },
    {
      "name": "Kingdom of Ireland",
      "from": {
        "value": "1541-06-18",
        "precision": "exact",
        "display": "18 June 1541"
      },
      "to": {
        "value": "1801-01-01",
        "precision": "exact",
        "display": "1 January 1801"
      },
      "language": "English",
      "usedBy": "british-official"
    },
    {
      "name": "Éire",
      "from": {
        "value": "1937-12-29",
        "precision": "exact",
        "display": "29 December 1937"
      },
      "language": "Irish",
      "usedBy": "local",
      "note": "The 1937 constitution named the state Éire, or in the English language Ireland."
    }
  ],
  "modernSuccessors": [
    {
      "name": "Ireland",
      "iso3": "IRL",
      "since": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "units": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties"
      ]
    },
    {
      "name": "United Kingdom (Northern Ireland)",
      "iso3": "GBR",
      "since": {
        "value": "1921-05-03",
        "precision": "exact",
        "display": "3 May 1921"
      },
      "units": [
        "gb-northern-ireland"
      ]
    }
  ],
  "geoCoverage": [
    {
      "from": {
        "value": "1541-06-18",
        "precision": "exact",
        "display": "18 June 1541"
      },
      "to": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "units": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties",
        "gb-northern-ireland"
      ],
      "partial": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties",
        "gb-northern-ireland"
      ],
      "label": "The whole island",
      "change": "In 1541 the claim covered the whole island but the reality did not: outside the Pale, English law reached only as far as an army could march. Mark it partial until 1603."
    },
    {
      "from": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "units": [
        "gb-northern-ireland"
      ],
      "lost": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties"
      ],
      "label": "Northern Ireland only",
      "change": "The 26 southern counties leave as the Irish Free State. Six of Ulster's nine counties stay in the United Kingdom, and are still in it."
    }
  ],
  "acquisitions": [
    {
      "id": "crown-of-ireland-1541",
      "date": {
        "value": "1541-06-18",
        "precision": "exact",
        "display": "18 June 1541"
      },
      "mechanism": "annexation-of-existing-colony",
      "how": "The Irish Parliament, packed and managed from Dublin Castle, declared Henry VIII King of Ireland, upgrading a 370-year-old lordship into a kingdom he did not yet control.",
      "counterparties": [
        {
          "name": "Gaelic Irish lordships",
          "kind": "indigenous-polity",
          "lost": "Recognition as independent rulers. Under 'surrender and regrant' they had to hand their lands to the king and receive them back as English-style earls."
        },
        {
          "name": "Hiberno-Norman lords",
          "kind": "regional-state",
          "lost": "Their semi-independence, notably the Fitzgeralds of Kildare, destroyed in the rebellion of 1534-35."
        }
      ],
      "units": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties",
        "gb-northern-ireland"
      ],
      "instrument": {
        "name": "Crown of Ireland Act",
        "kind": "act-of-parliament",
        "signed": {
          "value": "1541-06-18",
          "precision": "exact",
          "display": "18 June 1541"
        },
        "note": "Passed by the Irish Parliament in June 1541; the corresponding English statute is conventionally dated 1542."
      },
      "confidence": "high"
    },
    {
      "id": "nine-years-war-1603",
      "date": {
        "value": "1603-03-30",
        "precision": "exact",
        "display": "30 March 1603"
      },
      "mechanism": "conquest",
      "how": "Hugh O'Neill surrendered at Mellifont after nine years of war, a Spanish landing and a scorched-earth campaign that starved Ulster; for the first time English law ran over the whole island.",
      "counterparties": [
        {
          "name": "Gaelic lordships of Ulster",
          "kind": "indigenous-polity",
          "lost": "Independence and then their land: after the Flight of the Earls in 1607 their estates were confiscated and planted with English and Scottish settlers."
        }
      ],
      "units": [
        "ie-ulster-counties",
        "gb-northern-ireland"
      ],
      "people": [
        {
          "name": "Hugh O'Neill, Earl of Tyrone",
          "role": "led the confederacy of Gaelic lords",
          "side": "local",
          "lived": "1550-1616"
        },
        {
          "name": "Charles Blount, Lord Mountjoy",
          "role": "commanded the English campaign of famine and fort-building",
          "side": "british"
        }
      ],
      "cost": {
        "deathsLow": 30000,
        "deathsHigh": 100000,
        "note": "Most deaths were from the deliberate destruction of harvests in Ulster in 1601-02. Contemporary accounts are English and partisan; the range is wide for that reason."
      },
      "resistance": "Nine years of war, ending with the defeat of a joint Irish and Spanish force at Kinsale on 24 December 1601.",
      "confidence": "high"
    },
    {
      "id": "cromwellian-settlement-1652",
      "date": {
        "value": "1652-08-12",
        "precision": "exact",
        "display": "12 August 1652"
      },
      "mechanism": "conquest",
      "how": "Cromwell's reconquest ended with the Act for the Settlement of Ireland, which confiscated the land of Catholic landowners east of the Shannon and transplanted them to Connacht.",
      "counterparties": [
        {
          "name": "Confederate Catholic Ireland",
          "kind": "regional-state",
          "lost": "Almost everything: Catholic land ownership fell from about 60% of the island in 1641 to under 10% by 1660."
        }
      ],
      "units": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties",
        "gb-northern-ireland"
      ],
      "instrument": {
        "name": "Act for the Settlement of Ireland",
        "kind": "act-of-parliament",
        "signed": {
          "value": "1652-08-12",
          "precision": "exact",
          "display": "12 August 1652"
        }
      },
      "cost": {
        "deathsLow": 200000,
        "deathsHigh": 620000,
        "note": "Deaths across the wars of 1641-53 from fighting, famine and plague. William Petty's contemporary figure of 616,000 is disputed; modern estimates put the population loss between 15% and 40%."
      },
      "confidence": "medium",
      "contested": {
        "isContested": true,
        "note": "The scale of mortality and whether the Drogheda and Wexford storms were within the laws of war of the time are both actively argued."
      }
    },
    {
      "id": "williamite-settlement-1691",
      "date": {
        "value": "1691-10-03",
        "precision": "exact",
        "display": "3 October 1691"
      },
      "mechanism": "conquest",
      "how": "The Treaty of Limerick ended the Jacobite war; its promises of tolerance were broken within five years by the Penal Laws, which barred Catholics from parliament, the professions and the purchase of land.",
      "counterparties": [
        {
          "name": "Jacobite Ireland",
          "kind": "regional-state",
          "lost": "The last Catholic army in Ireland. Around 14,000 soldiers sailed for France in the 'Flight of the Wild Geese'."
        }
      ],
      "units": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties",
        "gb-northern-ireland"
      ],
      "instrument": {
        "name": "Treaty of Limerick",
        "kind": "treaty",
        "signed": {
          "value": "1691-10-03",
          "precision": "exact",
          "display": "3 October 1691"
        }
      },
      "confidence": "high"
    }
  ],
  "statusPeriods": [
    {
      "status": "representative-colony",
      "from": {
        "value": "1541-06-18",
        "precision": "exact",
        "display": "18 June 1541"
      },
      "to": {
        "value": "1801-01-01",
        "precision": "exact",
        "display": "1 January 1801"
      },
      "label": "Kingdom of Ireland under Poynings' Law",
      "howControlWorked": "Ireland had its own parliament in Dublin, but under Poynings' Law of 1494 it could not meet or pass a bill without London's approval, and after 1691 only Protestants could sit in it.",
      "controlDegree": 4,
      "governedFrom": "Dublin Castle, under the English and then British government",
      "localLegislature": "elected-assembly",
      "franchise": "Catholics, about three quarters of the population, could not sit in parliament from 1691 and could not vote at all between 1728 and 1793.",
      "note": "Formally a kingdom in personal union with England, not a colony. Historians argue about the label; the atlas uses 'representative-colony' for how power actually worked and says so here. Grattan's Parliament won legislative independence in 1782; it lasted eighteen years."
    },
    {
      "status": "part-of-uk",
      "from": {
        "value": "1801-01-01",
        "precision": "exact",
        "display": "1 January 1801"
      },
      "to": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "label": "Part of the United Kingdom",
      "howControlWorked": "The Dublin parliament voted itself out of existence and Ireland sent about 100 MPs to Westminster, where they were always outnumbered; the country was still run by a Lord Lieutenant and a Chief Secretary in Dublin Castle.",
      "controlDegree": 5,
      "governedFrom": "Westminster and Dublin Castle",
      "localLegislature": "sovereign-parliament",
      "franchise": "Catholic Emancipation in 1829 let Catholics sit at Westminster; the property franchise kept most Irish men and all women off the register until 1918.",
      "note": "During this period the Great Famine of 1845-52 killed about a million people and drove a million more abroad while food was exported under military guard."
    },
    {
      "status": "part-of-uk",
      "from": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "label": "Northern Ireland remains in the United Kingdom",
      "howControlWorked": "Six counties keep a devolved parliament at Stormont until 1972, then are ruled directly from London through thirty years of conflict, then devolved again under the 1998 Good Friday Agreement.",
      "controlDegree": 5,
      "governedFrom": "Belfast and Westminster",
      "localLegislature": "responsible-government",
      "note": "The same status continues, but the extent changes: this is why a new status period begins here."
    }
  ],
  "departures": [
    {
      "id": "irish-free-state-1922",
      "date": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "mechanism": "partition",
      "secondaryMechanisms": [
        "war-of-independence",
        "negotiated-independence"
      ],
      "how": "Two and a half years of guerrilla war ended in a truce, then a treaty that gave 26 counties dominion status inside the empire and kept six in the United Kingdom; the men who signed it then fought each other over it.",
      "units": [
        "ie-connacht",
        "ie-leinster",
        "ie-munster",
        "ie-ulster-counties"
      ],
      "becomes": [
        {
          "name": "Irish Free State",
          "kind": "dominion",
          "units": [
            "ie-connacht",
            "ie-leinster",
            "ie-munster",
            "ie-ulster-counties"
          ]
        }
      ],
      "led": [
        {
          "name": "Michael Collins",
          "role": "director of intelligence of the IRA, signed the Treaty, killed in the Civil War ten months later",
          "side": "local",
          "lived": "1890-1922"
        },
        {
          "name": "Arthur Griffith",
          "role": "founder of Sinn Féin, led the treaty delegation",
          "side": "local",
          "lived": "1871-1922"
        },
        {
          "name": "Éamon de Valera",
          "role": "president of the Dáil who rejected the Treaty and led the losing side in the Civil War",
          "side": "local",
          "lived": "1882-1975"
        },
        {
          "name": "David Lloyd George",
          "role": "Prime Minister who threatened 'immediate and terrible war' to get the Treaty signed",
          "side": "british",
          "lived": "1863-1945"
        },
        {
          "name": "James Craig",
          "role": "first Prime Minister of Northern Ireland",
          "side": "british",
          "lived": "1871-1940"
        }
      ],
      "movement": "Sinn Féin and the Irish Republican Army",
      "cost": {
        "deathsLow": 2400,
        "deathsHigh": 4500,
        "note": "About 1,400 died in the War of Independence to July 1921 and between 1,000 and 3,000 in the Civil War of 1922-23, where the counting is worst. Figures follow Townshend and Hopkinson."
      },
      "borders": "The border was drawn around six of Ulster's nine counties, chosen because that was the largest area with a secure unionist majority; a Boundary Commission was promised in 1921, reported in 1925, and was shelved unpublished.",
      "instrument": {
        "name": "Anglo-Irish Treaty",
        "kind": "treaty",
        "signed": {
          "value": "1921-12-06",
          "precision": "exact",
          "display": "6 December 1921"
        },
        "note": "Signed on 6 December 1921 and in force exactly one year later."
      },
      "confidence": "high",
      "contested": {
        "isContested": true,
        "note": "Whether the Treaty was the most that could be got or a surrender is still the fault line of Irish politics: the two largest parties in the Republic descend from the two sides of the split."
      },
      "evidence": [
        {
          "author": "Charles Townshend",
          "work": "The Republic: The Fight for Irish Independence, 1918-1923",
          "year": 2013,
          "kind": "book",
          "publisher": "Allen Lane",
          "supports": "The war, the Treaty negotiations and the casualty figures."
        }
      ]
    }
  ],
  "stillBritish": {
    "statusToday": "part-of-uk",
    "note": "Northern Ireland, six counties and about 1.9 million people, is still part of the United Kingdom; the 1998 Good Friday Agreement says it stays until majorities on both sides of the border vote otherwise.",
    "units": [
      "gb-northern-ireland"
    ],
    "population": 1903100,
    "populationYear": 2021
  },
  "consequences": {
    "partition": {
      "happened": true,
      "note": "Partition created a state with a permanent unionist majority and a large nationalist minority, and thirty years of conflict from 1968 killed about 3,500 people.",
      "lineDrawnBy": "the Government of Ireland Act 1920, drawn around six counties rather than the historic nine of Ulster because nine would not have held a unionist majority",
      "date": {
        "value": "1921-05-03",
        "precision": "exact",
        "display": "3 May 1921"
      }
    },
    "violence": {
      "note": "Conquest, plantation, penal law, famine, insurrection and a thirty-year conflict after partition: Ireland is where nearly every technique of British rule was tried first.",
      "kind": [
        "war-of-conquest",
        "rebellion-suppressed",
        "famine-policy",
        "counter-insurgency",
        "internment"
      ]
    },
    "populationTransfer": {
      "note": "The Great Famine of 1845-52 killed about a million people and drove another million abroad; Ireland's population is still below its 1841 level.",
      "kind": [
        "settler-migration",
        "emigration-under-famine"
      ],
      "toll": {
        "deathsLow": 800000,
        "deathsHigh": 1500000,
        "displacedLow": 1000000,
        "displacedHigh": 2100000,
        "note": "Excess deaths 1846-51 as estimated by Ó Gráda and by Mokyr; emigration figures from passenger records, which undercount."
      }
    },
    "commonwealth": {
      "member": false,
      "since": {
        "value": "1922-12-06",
        "precision": "exact",
        "display": "6 December 1922"
      },
      "left": {
        "value": "1949-04-18",
        "precision": "exact",
        "display": "18 April 1949"
      },
      "realm": false,
      "note": "The Republic of Ireland Act came into force on Easter Monday 1949 and put Ireland outside the Commonwealth: leaving the empire in 1922 and leaving the Commonwealth in 1949 are two different events."
    },
    "borderLegacy": "The 499-kilometre border drawn in 1921 became the European Union's only land frontier with the United Kingdom in 2020, and dominated the Brexit negotiations.",
    "languageAndLaw": "Irish was spoken by roughly half the population in 1800 and by a small minority a century later; English common law, the land registry and the police force are all inheritances."
  },
  "peak": {
    "areaKm2": 84421,
    "areaYear": 1841,
    "population": 8175124,
    "populationYear": 1841,
    "populationNote": "The 1841 census, taken four years before the famine. The island has never again held that many people."
  },
  "evidence": [
    {
      "author": "R. F. Foster",
      "work": "Modern Ireland 1600-1972",
      "year": 1988,
      "kind": "book",
      "publisher": "Allen Lane",
      "supports": "The long narrative from plantation to partition."
    },
    {
      "author": "Nicholas Canny",
      "work": "Making Ireland British, 1580-1650",
      "year": 2001,
      "kind": "book",
      "publisher": "Oxford University Press",
      "supports": "Plantation policy and its export to the Atlantic colonies."
    },
    {
      "author": "Cormac Ó Gráda",
      "work": "Black '47 and Beyond: The Great Irish Famine in History, Economy, and Memory",
      "year": 1999,
      "kind": "book",
      "publisher": "Princeton University Press",
      "supports": "Famine mortality and emigration estimates."
    }
  ],
  "confidence": "high",
  "contested": {
    "isContested": true,
    "note": "Whether Ireland was a colony at all is a live argument: it sent MPs to Westminster and Irishmen governed and soldiered across the empire, yet it was conquered, planted, and governed under emergency law for much of the nineteenth century. The atlas shows both facts rather than choosing."
  },
  "pedagogy": {
    "hook": "The plantation methods tried on Munster in the 1580s were carried to Virginia in the 1600s by some of the same men, including Walter Raleigh.",
    "misconception": {
      "belief": "Ireland was a foreign country that Britain invaded, and independence came in 1916.",
      "correction": "From 1801 to 1922 Ireland was legally part of the United Kingdom, sending about 100 MPs to Westminster. The Easter Rising of 1916 failed in six days; what changed everything was the execution of its leaders. Independence came in 1922, and only for 26 of the 32 counties."
    },
    "whyItMatters": "Ireland is the empire's first laboratory and its longest unfinished business: the border drawn in 1921 is still the hardest problem in British politics.",
    "keyDates": [
      {
        "date": {
          "value": "1541-06-18",
          "precision": "exact",
          "display": "18 June 1541"
        },
        "what": "Henry VIII declared King of Ireland"
      },
      {
        "date": {
          "value": "1601-12-24",
          "precision": "exact",
          "display": "24 December 1601"
        },
        "what": "Kinsale: the end of Gaelic Ulster"
      },
      {
        "date": {
          "value": "1801-01-01",
          "precision": "exact",
          "display": "1 January 1801"
        },
        "what": "Act of Union: Ireland becomes part of the UK"
      },
      {
        "date": {
          "value": "1845",
          "precision": "year",
          "display": "1845"
        },
        "what": "The Great Famine begins"
      },
      {
        "date": {
          "value": "1922-12-06",
          "precision": "exact",
          "display": "6 December 1922"
        },
        "what": "Irish Free State; the island is partitioned"
      },
      {
        "date": {
          "value": "1949-04-18",
          "precision": "exact",
          "display": "18 April 1949"
        },
        "what": "Republic declared; Ireland leaves the Commonwealth"
      }
    ],
    "compareWith": [
      "british-india"
    ],
    "readingLevel": "core"
  },
  "tags": [
    "plantation",
    "union",
    "partition",
    "famine",
    "british-isles"
  ]
}
```

---

## 16. Worked example C — Hong Kong, 1841 to 1997

The hard case for **several acquisitions with different mechanisms**, and for a departure that is not
independence at all.

- Three acquisitions, three mechanisms: `occupation` (1841), `treaty-cession` (1842 and 1860), `lease`
  (1898). Three geo units, because the three pieces have three different legal histories.
- The 1898 lease is dated 1 July 1898, when it took effect; the convention was signed on 9 June and that
  date lives in `instrument.signed`.
- The Japanese occupation is a status period with `controlDegree: 0` and a `controlDegreeNote`, not a
  coverage change: Britain claimed the same ground and controlled none of it.
- The departure is `lease-expiry` with `transfer-to-another-power` secondary, and `borders` carries the
  whole lesson: only nine tenths of it was ever leased.

```json
{
  "id": "hong-kong",
  "name": "Hong Kong",
  "formalName": "Colony of Hong Kong, later British Dependent Territory of Hong Kong",
  "region": "east-asia",
  "sortOrder": 1,
  "namesOverTime": [
    {
      "name": "Hong Kong",
      "from": {
        "value": "1841-01-26",
        "precision": "exact",
        "display": "26 January 1841"
      },
      "language": "English",
      "usedBy": "british-official",
      "note": "From the Cantonese heung gong, 'fragrant harbour', originally the name of one inlet on the island."
    }
  ],
  "modernSuccessors": [
    {
      "name": "China (Hong Kong Special Administrative Region)",
      "iso3": "CHN",
      "since": {
        "value": "1997-07-01",
        "precision": "exact",
        "display": "1 July 1997"
      },
      "units": [
        "hk-hong-kong-island",
        "hk-kowloon",
        "hk-new-territories"
      ]
    }
  ],
  "geoCoverage": [
    {
      "from": {
        "value": "1841-01-26",
        "precision": "exact",
        "display": "26 January 1841"
      },
      "to": {
        "value": "1860-10-24",
        "precision": "exact",
        "display": "24 October 1860"
      },
      "units": [
        "hk-hong-kong-island"
      ],
      "label": "The island only",
      "change": "A rocky island of about 7,500 people, taken as a naval base after the first Opium War."
    },
    {
      "from": {
        "value": "1860-10-24",
        "precision": "exact",
        "display": "24 October 1860"
      },
      "to": {
        "value": "1898-07-01",
        "precision": "exact",
        "display": "1 July 1898"
      },
      "units": [
        "hk-hong-kong-island",
        "hk-kowloon"
      ],
      "gained": [
        "hk-kowloon"
      ],
      "label": "Island and Kowloon",
      "change": "The Convention of Peking added the tip of the mainland peninsula south of Boundary Street, plus Stonecutters Island, to stop artillery being sited across the harbour."
    },
    {
      "from": {
        "value": "1898-07-01",
        "precision": "exact",
        "display": "1 July 1898"
      },
      "to": {
        "value": "1997-07-01",
        "precision": "exact",
        "display": "1 July 1997"
      },
      "units": [
        "hk-hong-kong-island",
        "hk-kowloon",
        "hk-new-territories"
      ],
      "gained": [
        "hk-new-territories"
      ],
      "label": "Full extent, with the leased New Territories",
      "change": "The 99-year lease added about nine tenths of the colony's land area, and with it the water supply, the farmland and eventually the airport."
    }
  ],
  "acquisitions": [
    {
      "id": "hk-occupation-1841",
      "date": {
        "value": "1841-01-26",
        "precision": "exact",
        "display": "26 January 1841"
      },
      "mechanism": "occupation",
      "how": "A Royal Navy landing party raised the flag at Possession Point on the strength of a draft convention that neither London nor Peking would ratify, and governed the island by proclamation for two and a half years.",
      "counterparties": [
        {
          "name": "Qing Empire",
          "kind": "empire",
          "lost": "Control of an island in the Pearl River estuary, seized while the war was still being fought."
        }
      ],
      "units": [
        "hk-hong-kong-island"
      ],
      "instrument": {
        "name": "Convention of Chuenpi",
        "kind": "convention",
        "signed": {
          "value": "1841-01-20",
          "precision": "exact",
          "display": "20 January 1841"
        },
        "note": "Repudiated by both governments: Palmerston thought it took too little, the Daoguang emperor thought it gave too much."
      },
      "confidence": "high"
    },
    {
      "id": "hk-nanking-1842",
      "date": {
        "value": "1842-08-29",
        "precision": "exact",
        "display": "29 August 1842"
      },
      "mechanism": "treaty-cession",
      "secondaryMechanisms": [
        "war-transfer"
      ],
      "how": "China ceded Hong Kong Island in perpetuity at the end of the first Opium War, a war Britain fought after Chinese officials destroyed 1,000 tonnes of smuggled opium at Canton.",
      "counterparties": [
        {
          "name": "Qing Empire",
          "kind": "empire",
          "lost": "The island outright, an indemnity of 21 million silver dollars, and the right to control its own tariffs; the first of the 'unequal treaties'."
        }
      ],
      "units": [
        "hk-hong-kong-island"
      ],
      "instrument": {
        "name": "Treaty of Nanking",
        "kind": "treaty",
        "signed": {
          "value": "1842-08-29",
          "precision": "exact",
          "display": "29 August 1842"
        },
        "note": "Ratifications exchanged 26 June 1843, the date the colony was formally proclaimed."
      },
      "people": [
        {
          "name": "Lin Zexu",
          "role": "imperial commissioner who destroyed the opium stocks at Canton in 1839 and was exiled for the defeat",
          "side": "local",
          "lived": "1785-1850"
        },
        {
          "name": "Henry Pottinger",
          "role": "plenipotentiary who negotiated the treaty and became first governor",
          "side": "british",
          "lived": "1789-1856"
        }
      ],
      "cost": {
        "deathsLow": 20000,
        "deathsHigh": 25000,
        "note": "Chinese military deaths in the first Opium War greatly outnumbered British ones, which were mostly from disease. Civilian deaths were not recorded."
      },
      "confidence": "high",
      "evidence": [
        {
          "author": "Julia Lovell",
          "work": "The Opium War: Drugs, Dreams and the Making of China",
          "year": 2011,
          "kind": "book",
          "publisher": "Picador",
          "supports": "The war, the treaty and how both sides have remembered it."
        }
      ]
    },
    {
      "id": "hk-kowloon-1860",
      "date": {
        "value": "1860-10-24",
        "precision": "exact",
        "display": "24 October 1860"
      },
      "mechanism": "treaty-cession",
      "secondaryMechanisms": [
        "war-transfer"
      ],
      "how": "At the end of the second Opium War, days after British and French troops burned the Summer Palace in Peking, China ceded the Kowloon peninsula south of Boundary Street in perpetuity.",
      "counterparties": [
        {
          "name": "Qing Empire",
          "kind": "empire",
          "lost": "The mainland shore of the harbour, and with it any ability to threaten the anchorage."
        }
      ],
      "units": [
        "hk-kowloon"
      ],
      "instrument": {
        "name": "Convention of Peking",
        "kind": "convention",
        "signed": {
          "value": "1860-10-24",
          "precision": "exact",
          "display": "24 October 1860"
        }
      },
      "confidence": "high"
    },
    {
      "id": "hk-new-territories-1898",
      "date": {
        "value": "1898-07-01",
        "precision": "exact",
        "display": "1 July 1898"
      },
      "mechanism": "lease",
      "how": "In the scramble for concessions after China's defeat by Japan, Britain took 235 islands and the land up to the Shenzhen river on a 99-year lease, rent free, and villagers fought a six-day war against the takeover the following April.",
      "counterparties": [
        {
          "name": "Qing Empire",
          "kind": "empire",
          "lost": "Nine tenths of what became Hong Kong, for 99 years and no rent."
        },
        {
          "name": "Villagers of the New Territories",
          "kind": "indigenous-people",
          "lost": "Their land rights and self-government; several hundred were killed resisting the handover in April 1899."
        }
      ],
      "units": [
        "hk-new-territories"
      ],
      "instrument": {
        "name": "Convention for the Extension of Hong Kong Territory (Second Convention of Peking)",
        "kind": "convention",
        "signed": {
          "value": "1898-06-09",
          "precision": "exact",
          "display": "9 June 1898"
        },
        "note": "Signed 9 June 1898; the 99-year lease ran from 1 July 1898 and therefore expired on 30 June 1997."
      },
      "resistance": "The Six-Day War of April 1899: village militias of the Punti clans fought the British takeover and several hundred were killed.",
      "confidence": "high"
    }
  ],
  "statusPeriods": [
    {
      "status": "occupied",
      "from": {
        "value": "1841-01-26",
        "precision": "exact",
        "display": "26 January 1841"
      },
      "to": {
        "value": "1843-06-26",
        "precision": "exact",
        "display": "26 June 1843"
      },
      "label": "Occupied under an unratified convention",
      "howControlWorked": "Captain Charles Elliot governed by proclamation, promising the Chinese inhabitants they would be ruled by Chinese law and custom, while his own government disowned the deal that gave him the island.",
      "controlDegree": 5,
      "governedFrom": "the naval command afloat, then Government House",
      "localLegislature": "none"
    },
    {
      "status": "crown-colony",
      "from": {
        "value": "1843-06-26",
        "precision": "exact",
        "display": "26 June 1843"
      },
      "to": {
        "value": "1941-12-25",
        "precision": "exact",
        "display": "25 December 1941"
      },
      "label": "Crown colony",
      "howControlWorked": "A governor appointed in London ruled with a nominated council; the Chinese majority, over 95% of the population, had no vote and until 1945 could not live on the Peak.",
      "controlDegree": 5,
      "governedFrom": "Government House, under the Colonial Office",
      "localLegislature": "nominated-council",
      "franchise": "Nobody was elected. Hong Kong never had a fully elected legislature under British rule; the first direct elections to any seats came in 1991."
    },
    {
      "status": "occupied",
      "from": {
        "value": "1941-12-25",
        "precision": "exact",
        "display": "25 December 1941"
      },
      "to": {
        "value": "1945-08-30",
        "precision": "exact",
        "display": "30 August 1945"
      },
      "label": "Japanese occupation",
      "howControlWorked": "Japan ruled Hong Kong for three years and eight months after the garrison surrendered on Christmas Day 1941; the population fell from 1.6 million to about 600,000 through deportation and starvation.",
      "controlDegree": 0,
      "controlDegreeNote": "Britain held nothing here. The default for 'occupied' assumes British occupation; this record inverts it, and the map must show Hong Kong as not British for these years.",
      "governedFrom": "the Japanese military administration",
      "localLegislature": "none"
    },
    {
      "status": "crown-colony",
      "from": {
        "value": "1945-08-30",
        "precision": "exact",
        "display": "30 August 1945"
      },
      "to": {
        "value": "1997-07-01",
        "precision": "exact",
        "display": "1 July 1997"
      },
      "label": "Crown colony, then British Dependent Territory",
      "howControlWorked": "British rule resumed in 1945 and lasted another 52 years; the governor still ran the place, but from the 1980s the real negotiation was between London and Beijing, with Hong Kong people at the table only as advisers.",
      "controlDegree": 5,
      "governedFrom": "Government House, under the Foreign and Commonwealth Office after 1968",
      "localLegislature": "part-elected",
      "franchise": "Indirect elections to the Legislative Council began in 1985 and the first direct elections for 18 of 60 seats were held in 1991, six years before the handover.",
      "note": "Renamed a British Dependent Territory by the British Nationality Act 1981, which also stripped most Hong Kong people of the right of abode in Britain."
    }
  ],
  "departures": [
    {
      "id": "hk-handover-1997",
      "date": {
        "value": "1997-07-01",
        "precision": "exact",
        "display": "1 July 1997"
      },
      "mechanism": "lease-expiry",
      "secondaryMechanisms": [
        "transfer-to-another-power"
      ],
      "how": "At midnight the flag came down and Hong Kong became a Special Administrative Region of China, promised its own laws and way of life for fifty years under 'one country, two systems'.",
      "units": [
        "hk-hong-kong-island",
        "hk-kowloon",
        "hk-new-territories"
      ],
      "becomes": [
        {
          "name": "Hong Kong Special Administrative Region of the People's Republic of China",
          "kind": "special-administrative-region",
          "units": [
            "hk-hong-kong-island",
            "hk-kowloon",
            "hk-new-territories"
          ]
        }
      ],
      "led": [
        {
          "name": "Deng Xiaoping",
          "role": "insisted on full sovereignty and proposed 'one country, two systems'",
          "side": "other-power",
          "lived": "1904-1997"
        },
        {
          "name": "Margaret Thatcher",
          "role": "went to Peking in 1982 to argue the treaties were valid, and was refused",
          "side": "british",
          "lived": "1925-2013"
        },
        {
          "name": "Chris Patten",
          "role": "last governor, whose late democratic reforms Beijing reversed in 1997",
          "side": "british",
          "lived": "1944-"
        },
        {
          "name": "Tung Chee-hwa",
          "role": "first Chief Executive of the SAR",
          "side": "other-power",
          "lived": "1937-"
        }
      ],
      "cost": {
        "note": "Nobody was killed. Neither government put the question to the six and a half million people who lived there, and about half a million left in the decade before 1997."
      },
      "borders": "The 1898 lease covered only the New Territories, about nine tenths of the land. Britain returned the two pieces ceded 'in perpetuity' as well, because a city cannot be cut in three and the leased part held the water.",
      "instrument": {
        "name": "Sino-British Joint Declaration",
        "kind": "joint-declaration",
        "signed": {
          "value": "1984-12-19",
          "precision": "exact",
          "display": "19 December 1984"
        },
        "note": "Registered at the United Nations as a binding treaty; China stated in 2017 that it regards it as a historical document with no continuing force."
      },
      "confidence": "high",
      "contested": {
        "isContested": true,
        "note": "Whether Britain could have secured democracy before leaving, and whether the Joint Declaration still binds anyone, are both live disputes between London and Beijing."
      },
      "evidence": [
        {
          "author": "Steve Tsang",
          "work": "A Modern History of Hong Kong",
          "year": 2004,
          "kind": "book",
          "publisher": "I.B. Tauris",
          "supports": "The negotiations of 1982-84 and the handover."
        }
      ]
    }
  ],
  "consequences": {
    "commonwealth": {
      "member": false,
      "note": "Hong Kong did not become a state and so joined nothing; it is the one major British territory that ended by transfer to another power rather than independence."
    },
    "populationTransfer": {
      "note": "Hong Kong's population was made by flight: about a million refugees arrived from China between 1945 and 1951, and about half a million people emigrated to Canada, Australia and Britain before 1997.",
      "kind": [
        "refugee-flight"
      ]
    },
    "borderLegacy": "Boundary Street and the Shenzhen river, drawn in 1860 and 1898, are still the internal frontier between the SAR and mainland China.",
    "economicLegacy": "A colony taken to sell opium became one of the world's largest financial centres; its common law courts and free port rules were the reason.",
    "languageAndLaw": "English remains an official language and the common law still applies under the Basic Law, in principle until 2047."
  },
  "peak": {
    "areaKm2": 1104,
    "areaYear": 1997,
    "population": 6489000,
    "populationYear": 1996,
    "populationNote": "1996 by-census, the last count before the handover.",
    "exports": [
      "re-exported manufactures",
      "textiles",
      "electronics",
      "financial services"
    ]
  },
  "evidence": [
    {
      "author": "Steve Tsang",
      "work": "A Modern History of Hong Kong",
      "year": 2004,
      "kind": "book",
      "publisher": "I.B. Tauris",
      "supports": "The whole colonial period and the handover."
    },
    {
      "author": "John M. Carroll",
      "work": "A Concise History of Hong Kong",
      "year": 2007,
      "kind": "book",
      "publisher": "Rowman and Littlefield",
      "supports": "Society, the Chinese elite and the 1899 resistance in the New Territories."
    },
    {
      "author": "Julia Lovell",
      "work": "The Opium War: Drugs, Dreams and the Making of China",
      "year": 2011,
      "kind": "book",
      "publisher": "Picador",
      "supports": "The wars that produced the 1842 and 1860 cessions."
    }
  ],
  "confidence": "high",
  "pedagogy": {
    "hook": "Britain gave back all of Hong Kong in 1997, though it had legally leased only nine tenths of it; the rest had been ceded 'in perpetuity'.",
    "misconception": {
      "belief": "Britain handed Hong Kong back because the lease on it ran out.",
      "correction": "Only the New Territories were leased, from 1 July 1898 for 99 years. Hong Kong Island (1842) and Kowloon (1860) were ceded outright and forever. Britain returned everything because the leased nine tenths held the reservoirs, the airport and most of the housing — and because China had never accepted the three treaties as valid in the first place."
    },
    "whyItMatters": "Hong Kong is the clearest case in the atlas that empire ended in more than one way: not independence, not a war, but a lease running out and a city being handed to a different state.",
    "keyDates": [
      {
        "date": {
          "value": "1842-08-29",
          "precision": "exact",
          "display": "29 August 1842"
        },
        "what": "Treaty of Nanking cedes Hong Kong Island"
      },
      {
        "date": {
          "value": "1860-10-24",
          "precision": "exact",
          "display": "24 October 1860"
        },
        "what": "Convention of Peking cedes Kowloon"
      },
      {
        "date": {
          "value": "1898-07-01",
          "precision": "exact",
          "display": "1 July 1898"
        },
        "what": "99-year lease of the New Territories begins"
      },
      {
        "date": {
          "value": "1941-12-25",
          "precision": "exact",
          "display": "25 December 1941"
        },
        "what": "Surrender to Japan; British rule stops for 44 months"
      },
      {
        "date": {
          "value": "1984-12-19",
          "precision": "exact",
          "display": "19 December 1984"
        },
        "what": "Sino-British Joint Declaration"
      },
      {
        "date": {
          "value": "1997-07-01",
          "precision": "exact",
          "display": "1 July 1997"
        },
        "what": "Handover to China"
      }
    ],
    "compareWith": [
      "british-india"
    ],
    "readingLevel": "core"
  },
  "tags": [
    "treaty-port",
    "lease",
    "opium",
    "handover",
    "east-asia"
  ]
}
```

---

## 16b. Compatibility with the app loader

`docs/ARCHITECTURE.md` §6 describes a flatter runtime shape: a shard as a bare array of territories,
each with `units` and `spans: [{start, end, status}]`, and events inline. That is a good *runtime* shape
and a bad *authoring* shape — it cannot express acquisition mechanism, counterparty, coverage change,
departure or evidence, which are the whole point of this atlas.

The two are not in conflict; one projects onto the other. **The authoring format in this document is the
source of truth. The loader should accept it and derive the runtime fields.** The projection is about
thirty lines and belongs in the data layer, not in the shards:

```js
// shard: accept either [territory, …] or { schemaVersion, shard, territories, events }
const territories = Array.isArray(raw) ? raw : (raw.territories || []);
const events      = Array.isArray(raw) ? [] : (raw.events || []);

const y = d => d && d.value ? parseInt(d.value.slice(0, 4), 10) : null;

for (const t of territories) {
  // units: every unit the territory ever covered
  t.units = [...new Set(t.geoCoverage.flatMap(c => c.units))];

  // spans: one per status period, plus a trailing 'independent' span after the last departure
  t.spans = t.statusPeriods.map(sp => ({
    start: y(sp.from),
    end: sp.to ? y(sp.to) : null,
    status: sp.status,
    circa: sp.from.precision !== 'exact' && sp.from.precision !== 'year',
    contested: sp.from.precision === 'contested',
    note: sp.label,
    // units actually covered during this span, so the map draws the 1937 loss correctly
    units: unitsCoveredBetween(t, y(sp.from), sp.to ? y(sp.to) : 9999),
  }));
  const last = t.departures && t.departures.filter(d => d.date).slice(-1)[0];
  if (last) t.spans.push({ start: y(last.date), end: null, status: 'independent', controlled: false });
}
```

Two consequences worth stating so nobody re-derives them wrongly:

- **`spans[].units` must come from `geoCoverage`, not from `t.units`.** Otherwise British India keeps
  Burma on the map until 1947 and the 1937 separation disappears, which is exactly the kind of quiet
  error this model exists to prevent.
- **`controlDegree` is the shading channel.** The runtime `controlled` boolean is a coarse fallback; the
  legend should read `controlDegree` (0–5) so a dominion and a crown colony do not print the same red.

`app/data/territories/index.json` is a manifest, not a shard: list shard filenames in `shards`. The
validator skips it by shape and says so in its report.

---

## 17. Changing this model

The schema, this document and the validator move together. If you need a field or a vocabulary term that
does not exist, ask the data-model agent: adding a term to a closed list is cheap, and silently abusing
an existing one costs a student the point of the list. Bump `schemaVersion` on any breaking change and
update `_TEMPLATE.json` in the same commit.
