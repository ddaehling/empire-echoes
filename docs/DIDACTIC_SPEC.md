# DIDACTIC SPEC — the pedagogical constitution of the British Empire Atlas

**Status: normative.** Every other agent builds against this file. If a design decision, a data
field, a tour script, a quiz item or a piece of UI prose contradicts this document, this document
wins — or this document gets amended first, in writing, by the didactics owner.

**Owner:** didactics. **Consumers:** data, map, timeline, panels, tours, quiz, viz, copy, QA, critics.

**The one-sentence test for everything we build:**
> A 16-year-old who works through this unit's two lessons can afterwards draw the empire's four
> phases from memory, explain what drove each, name at least six colonised people who shaped events,
> say why the pink map lies, and defend one contested claim with evidence — better than they could
> after the same time with the best textbook chapter on the subject.

And its per-lesson form, because one lesson must also be worth having on its own:
> A 16-year-old who works through **one** lesson can afterwards say what drove the two phases it
> covers, name the people who shaped them, and defend one contested claim from it with evidence.

If a feature does not move those sentences, cut it.

---

## 0. How to use this document

- §1 **Objectives** are the acceptance criteria. Every screen must map to at least one. Tag your work.
- §2 **The Spine** is the narrative contract. All chronology, colour, ordering and tour structure obey it.
- §3 **The 20** is the retrieval budget. The quiz bank, the tour beats and the "recap" surfaces draw from
  these twenty and nothing else. Everything else in the app is scaffolding, texture, or extension.
  §3.1 divides the twenty between the unit's two lessons and states which floor applies to which
  artefact. §3.2 is the spaced recall rule and is binding on the quiz and tours modules.
- §4 **Misconceptions** each own a *specific interaction*. Not a paragraph. An interaction. Build it.
- §5 **Coursebook benchmark** is where we admit what books do better and commit to beating it.
- §6 **Rubric** is handed verbatim to adversarial critics. Do not soften it.
- §7 **Voice** governs every string in the UI, tooltip and alt-text included.
- §8 **The lesson** is a **two-lesson unit**, amended wave 9 (§9.4). Lesson One is the default path
  and the thing a cold start runs; Lesson Two is a whole lesson of its own, not a continuation.
  Everything else is what a student finds when they wander off — and they must be able to wander off.

Two shorthand conventions used throughout:

- `[CORE]` — must be learned by every student across the unit's two lessons. `[EXT]` — extension,
  for the curious, the able, or the second visit. Roughly a 60/40 split of app surface, 100/0 of the
  guided path.
- `⟶ builds:` names the concrete artefact an agent must produce.

---

## 1. LEARNING OBJECTIVES

Twelve objectives. Each is a thing the student can **do**, observably, by the end of the unit
(§3.1 says which lesson carries the evidence for each). Each names the
in-app evidence that would demonstrate it. Where an objective is assessed by the quiz, the item type
is named so the quiz agent can build it without re-deriving the intent.

**LO1 `[CORE]` — Place the four phases of empire on a timeline and say what drove each.**
Given a blank 1600–2000 axis, the student can mark Atlantic (c.1585–1833), Company (1600–1858),
Formal/High Imperial (c.1815–1947) and Dissolution (1942–1997), and give one driver per phase
(sugar and enslaved labour; trade monopoly turning into land revenue; industrial capitalism, steam,
strategy and rivalry; war-exhaustion plus organised anticolonial mass politics).
*Assessed by:* drag-to-timeline ordering item + a "what drove this?" matching item.

**LO2 `[CORE]` — Distinguish at least five legal statuses a "British" territory could hold, and give
an example of each.** Crown colony (Jamaica after 1866), protectorate (Uganda 1894), protected state
(Kuwait 1899), dominion (Canada after 1867), mandate (Iraq 1920), condominium (Anglo-Egyptian Sudan
1899), chartered-company rule (British North Borneo 1881), princely state under paramountcy
(Hyderabad).
*Assessed by:* classify-the-territory item; reinforced every time a dossier opens.

**LO3 `[CORE]` — Explain how a trading company came to rule a subcontinent, in four steps.**
Charter (1600) → armed factories and alliance with Indian bankers and soldiers → Plassey 1757 and the
Diwani of Bengal 1765 (the right to collect land revenue for ~20–30 million people) → revenue funds
more sepoys, which funds more conquest. Then the state takes it over in 1858.
*Assessed by:* four-step causal-chain reconstruction (drag steps into order and fill the arrow labels).

**LO4 `[CORE]` — Read the pink map critically: state three ways the classic imperial map misleads.**
Projection inflates high latitudes; a single colour hides wildly different degrees of control;
a static map hides territories Britain held briefly, lost, swapped or shared.
*Assessed by:* projection-toggle before/after estimate; "which of these was actually ruled from London?"

**LO5 `[CORE]` — Quantify the Atlantic slave trade's British share and locate it on the map.**
Roughly 3.4 million Africans embarked on British-flagged and British-colonial ships; roughly 2.6–2.8
million survived the crossing. Name three main embarkation regions (Bight of Biafra, Gold Coast,
West-Central Africa) and three destinations (Jamaica, Barbados, Virginia/Carolina).
*Assessed by:* flow-map cued recall with numeric estimation and a "how confident is this number?" prompt.

**LO6 `[CORE]` — Name at least six colonised or enslaved people who changed the empire's course, and
say what each did.** From a required roster (§3, T18): Toussaint Louverture, Olaudah Equiano,
Sam Sharpe, Mangal Pandey / Rani Lakshmibai, Dadabhai Naoroji, Mohandas Gandhi, Ambedkar,
Kwame Nkrumah, Jomo Kenyatta, Dedan Kimathi, Aung San, Fatma Kanji-era Indian traders (or Cetshwayo
for the Zulu kingdom).
*Assessed by:* "who did this?" matching; also a passive check — no tour beat may pass without a named
non-British actor.

**LO7 `[CORE]` — Explain why 1776–83 did not end the empire, and what changed instead.**
Britain lost 13 colonies of about 2.5 million people, and within 40 years ruled far more people in
Asia. The centre of gravity moved east and the mode of rule moved from settler assemblies to
conquest-and-revenue.
*Assessed by:* territory-count-over-time chart with a "predict the line after 1783" interaction.

**LO8 `[CORE]` — Describe decolonisation as contested, uneven and often violent — with three examples
that are not India.** Malayan Emergency 1948–60; Kenya 1952–60; Cyprus 1955–59; Aden 1963–67;
Rhodesia's white settler UDI 1965–80 as decolonisation *resisted from inside*.
*Assessed by:* sort "handover / war / collapse / delayed by settlers" onto a map of 1945–1997 exits.

**LO9 `[CORE]` — State what the empire moved besides soldiers: people, crops, capital, law, disease,
languages — with one concrete instance each.** e.g. ~1.3–1.5 million Indian indentured labourers
1834–1917 to Mauritius, the Caribbean, Fiji, Natal; Kew-brokered transfers of rubber, tea and
cinchona; English common law and the 1860 Indian Penal Code exported to a dozen jurisdictions.
*Assessed by:* "trace this thing across the map" mini-task.

**LO10 `[EXT]` — Weigh two historians against each other on one question and say which evidence
would settle it.** Default pairing: did empire enrich Britain and impoverish India? Tharoor's
*Inglorious Empire* (2017) versus the gentlemanly-capitalism account in Cain & Hopkins, with the
Maddison/Bairoch share-of-world-output series as the contested evidence.
*Assessed by:* an open "which claim does this chart support, and which does it not?" prompt.

**LO11 `[EXT]` — Explain "informal empire" and name two places Britain controlled without a flag.**
Argentina's railways and finance; the China treaty ports after 1842; Ottoman and Persian debt and
concessions. Cite Gallagher and Robinson's 1953 argument that the flag followed trade only when
local collapse forced it.
*Assessed by:* toggle the "informal influence" layer and explain what it adds.

**LO12 `[EXT]` — State one way the empire is not over, with evidence.** Fourteen British Overseas
Territories today; the Chagos Islands / Diego Garcia dispute; the £20 million 1835 slave-owner
compensation loan whose repayment ended only in 2015; the 2013 Mau Mau settlement of £19.9 million
to 5,228 Kenyan claimants; Windrush.
*Assessed by:* end-of-lesson "so what" card with a source link.

**Two objectives we deliberately refuse.**
We do **not** ask students to "evaluate whether the empire was good or bad" as a summative task — it
collapses incommensurable claims into a thumbs-up and is exactly the exam habit that produces
sourceless moralising. We do **not** ask them to memorise a list of all territories: the atlas is a
tool for looking things up, not a list to learn. Both refusals are load-bearing; do not sneak them
back in as a "fun quiz".

---

## 2. THE SPINE

### 2.1 The one story

> **Britain did not build one empire. It built four, overlapping, each with a different engine, and
> each collapsed or transformed into the next. The map's single pink hides four different machines.**

Named, with engines:

| # | Empire | Rough span | Engine — the thing that actually made it grow | Ended / became |
|---|--------|-----------|------------------------------------------------|----------------|
| I | **The Atlantic empire** | c.1585 – 1833/38 | Sugar, tobacco, cotton grown by enslaved Africans on land taken from Indigenous peoples; the Navigation Acts made the traffic exclusive; the Royal Navy protected it | Fractured by 1776–83; its labour system abolished 1833–38; its capital reinvested in II and III |
| II | **The Company empire** | 1600 – 1858 | A chartered monopoly that discovered land revenue was more lucrative than trade; Indian bankers, sepoys and rival rulers made the conquest possible | Nationalised after the 1857 rebellion; absorbed into III |
| III | **The imperial empire** | c.1815 – 1947 | Industrial output needing markets, steam and telegraph shrinking distance, strategic paranoia about routes to India, and rivalry with France, Russia and Germany; run partly through settlers who demanded self-rule and partly through conquered subjects who were refused it | Bankrupted and de-legitimised by two world wars; dismantled by IV |
| IV | **Dissolution** | 1942 – 1997 | Mass anticolonial politics that predated the wars, Britain's insolvency, US and Soviet pressure, and — where Britain fought — counter-insurgency that lost anyway | 14 Overseas Territories, the Commonwealth, and unresolved claims |

The app's colour system, timeline chapters, tour structure and dossier "phase" field all key to
these four. **One story, four machines.** Any agent tempted to add a fifth: don't; propose an
amendment instead.

### 2.2 Why these four, and why the dates

**Why phases and not a single line.** A single 1600→1997 line teaches students that empire was one
thing that got bigger and then smaller. That is the misconception we most need to kill (§4, M4).
Overlapping phases teach that the empire of 1750 (slave sugar) and the empire of 1900 (African
protectorates and dominion nationalism) were different projects that happened to share a flag.

**Why the phases overlap, visibly.** Phase II starts in 1600, before Phase I is fully underway, and
Phases I, II and III all run simultaneously across 1815–33. The overlaps are pedagogically the point:
they show the empire was never centrally planned. Render the overlap; do not tidy it into a relay race.

**Defence of each boundary, against the obvious alternatives:**

- **Why start c.1585 and not 1497 (Cabot) or 1707 (Union)?** Cabot's landfall produced no settlement.
  Roanoke (1585) and Jamestown (1607) begin continuous English overseas colonisation. We show 1497
  and 1583 (Gilbert in Newfoundland) as antecedents on the timeline but do not let them anchor the
  phase. The Union of 1707 matters enormously — it makes it a *British* empire and pours Scottish
  personnel into it (see Devine's work on Scotland and empire) — but it is a change of ownership, not
  of engine, so it is a marked event inside Phase I, not a boundary.
- **Why is 1783 not a phase boundary?** Because P.J. Marshall (*The Making and Unmaking of Empires*,
  2005) is right: the same decades that lost America won Bengal. Treating 1783 as the hinge produces
  the "empire ended in 1776" misconception. We mark 1783 as a *shock inside* Phase I that redirects
  investment, not as an ending.
- **Why 1833/38 rather than 1807 for the end of Phase I?** 1807 abolished the British slave *trade*;
  slavery itself continued in British colonies until the 1833 Act (effective 1 August 1834) and
  the "apprenticeship" system until 1838. Ending Phase I at 1807 flatters Britain. End it at 1838.
- **Why 1858 for the end of Phase II?** The Government of India Act 1858 transferred Company
  territory to the Crown. Clean, legal, datable, and it lets the student see a mechanism (rebellion →
  nationalisation) rather than a drift.
- **Why does Phase III start in 1815, not 1870 or 1884?** Because starting at the Scramble teaches
  that high imperialism was an 1880s invention. Gallagher and Robinson ("The Imperialism of Free
  Trade", *Economic History Review*, 1953) showed the mid-century was expansionist too, mostly
  informally. Bayly (*Imperial Meridian*, 1989) showed a militarised, aristocratic, garrison empire
  consolidating from the 1780s. 1815 (Vienna: Britain keeps the Cape, Ceylon, Malta, Trinidad,
  Mauritius, Guyana) is the honest start.
- **Why does Phase IV start in 1942, not 1947?** Because the Fall of Singapore (15 February 1942) —
  about 80,000 troops surrendered to a smaller Japanese force — destroyed the prestige on which
  Asian rule rested, and the Quit India movement began that August. 1947 is an outcome, not an origin.
  We also surface earlier roots explicitly: the Indian National Congress (1885), the 1919 Amritsar
  massacre, the 1935 Government of India Act.
- **Why end at 1997 and not 1980 or "today"?** The Hong Kong handover (1 July 1997) is the last
  large, populated territory to leave. We then explicitly refuse closure: LO12 and the final tour
  beat show the 14 Overseas Territories and live disputes. The story ends; the history doesn't.

**Alternative periodisations we considered and rejected, on the record** (show this to students in
`[EXT]`, it is genuine historical thinking):

1. **"First and Second British Empire" (Harlow's "swing to the east").** Elegant, still common in
   textbooks, but it makes 1783 the hinge and implies a clean Atlantic→Asian pivot. Bayly's
   *Imperial Meridian* dismantles the discontinuity. Rejected — but named in the app, because
   students will meet it in books.
2. **Formal vs informal empire (Gallagher & Robinson).** Analytically superb, and we adopt it as a
   *layer* (LO11), not as the spine, because "informal" is invisible on a map of colours and would
   leave a 14-year-old with no shape to hold.
3. **Metropole-centred: Elizabethan / Georgian / Victorian / Edwardian / post-war.** Organises by
   British domestic politics, which is precisely the vantage point we are trying to decentre.
4. **Region-by-region (Americas, India, Africa, Pacific).** How atlases usually work, and how
   students end up with four disconnected stories and no chronology. We provide it as a *filter*,
   never as the spine.
5. **Resistance-centred periodisation (1791 Haiti, 1831 Jamaica, 1857 India, 1919 Amritsar, 1947,
   1952 Kenya).** Morally attractive, and Gopal's *Insurgent Empire* (2019) shows how much it
   explains. We embed all six of these as spine beats but do not periodise by them, because it would
   imply resistance only mattered when it produced a British reaction.

**The spine's moral shape, stated once so nobody has to guess:** the empire was built by force and
run for profit; it was also a system that different people experienced incommensurably differently,
including the millions who worked in it, fought for it, and used its own language of liberty against
it. We hold both without averaging them into "mixed legacy". See §7.

### 2.3 The through-line sentence students should be able to say at minute 30

> "Britain's empire started as sugar islands worked by enslaved Africans, became a trading company
> that ended up ruling India, turned into a global industrial-strategic system painted one colour on
> a map that hid a dozen kinds of rule, and came apart between 1942 and 1997 because the people it
> ruled organised, and Britain went broke."

That sentence is the app's success metric. Print it on the last card of the tour and ask them to
type it back in their own words.

---

## 3. THE 20 THINGS THAT MUST STICK

The retrieval budget. Twenty items: facts, dates, and — crucially — **mechanisms**, because dates
without mechanisms are trivia. Each has a **hook**: the specific, concrete, dual-coded thing that
makes it retrievable. Hooks are not decoration; the tours agent and quiz agent must implement them
literally.

Spacing plan: each item is encountered at least twice **within the lesson that teaches it**, with at
least six minutes between encounters, and the second encounter is always *retrieval* (produce it),
never re-presentation (read it again). See Roediger & Karpicke (2006) and the Dunlosky et al. (2013)
review in *Psychological Science in the Public Interest*, which rank practice testing and distributed
practice as the two highest-utility techniques. **A second encounter that the student never had a
first encounter with is not spacing — it is a false statement about their own session, and §3.2
forbids it.**

| # | Must stick | Hook (build this) |
|---|-----------|-------------------|
| **T1** | Empire ran on **four engines**, not one: sugar/slavery, company revenue, industrial-strategic rule, and dissolution. | The four-colour spine bar, always visible under the map. Scrubbing the timeline lights one band. Students see the colour before they read the word. |
| **T2** | **1607 Jamestown, 1627 Barbados, 1655 Jamaica** — the Atlantic begins with tobacco, then sugar, then conquest of a Spanish island. | "Three islands, three crops" cluster animation: the map zooms Chesapeake → Barbados → Jamaica in 8 seconds while the sugar-export curve climbs. |
| **T3** | **c.3.4 million** Africans were forced onto British-flagged ships; **c.2.6–2.8 million** arrived alive. | A flow map where the width of the arrow *is* the number, and the gap between "embarked" and "disembarked" is drawn as a visible loss. Number sourced to the Trans-Atlantic Slave Trade Database (Eltis & Richardson). |
| **T4** | Enslaved people **rebelled continuously**: Tacky's Revolt (Jamaica 1760), the Haitian Revolution (1791, which defeated a British invasion), Barbados 1816, Demerara 1823, Jamaica's Baptist War (1831–32, led by Sam Sharpe, c.60,000 people). | A "resistance" pin layer that cannot be turned off during the slavery beat. Abolition is dated *after* Sam Sharpe, on the same axis, so the order is unmissable. |
| **T5** | **1807** ended the trade; **1833/1834** ended slavery; **1838** ended "apprenticeship"; **£20 million** went to slave-*owners*, not the enslaved — about 40% of annual Treasury spending, financed by a loan finally repaid in **2015**. | Two counters side by side: "compensation paid to owners: £20,000,000" / "compensation paid to the enslaved: £0". Link to the UCL *Legacies of British Slave-ownership* database. |
| **T6** | The **East India Company was chartered on 31 December 1600** — a private firm with an army. | The dossier for India opens with a company seal, not a crown. "Who owned this?" is the first question the panel answers. |
| **T7** | **Plassey 1757 → the Diwani of Bengal 1765**: the Company won the right to collect land revenue from perhaps 20–30 million people, and used it to pay for more soldiers. | The single most important loop in the app: an animated feedback diagram — *revenue → sepoys → conquest → more revenue* — that the student can step through, and later must reassemble. |
| **T8** | Conquest was done **mostly by Indian soldiers**: by the 1850s the Company's army was roughly 250,000 strong and overwhelmingly Indian, with a small British officer corps. | A 100-dot unit chart where the student guesses the British share before it is revealed. Guess-then-reveal is deliberate: prediction failure improves retention. |
| **T9** | **1857–58**: rebellion across northern India; the Company is abolished; the Crown takes over (Government of India Act, 1858); Victoria proclaimed Empress of India in 1876. | The map's India polygon changes *ownership colour* while the student watches, with the legal instrument named on the card. Mechanism visible, not asserted. |
| **T10** | **1858–1947: roughly 1,000 covenanted ICS officers** administered a population that passed 300 million — rule depended on Indian clerks, police, soldiers, landlords and princes. | Scale sculpture: one figure vs a field of figures, with the caption "empire was mostly run by the colonised". Ties directly to M2 and M9. |
| **T11** | **565 princely states** covered around a third of the subcontinent's area at independence — "British India" was never all of India. | The India map has two fills. Toggling "show princely states" visibly shrinks direct rule. Students who never see this cannot understand Partition. |
| **T12** | **1882: Britain occupies Egypt** to protect the Suez Canal (opened 1869) and bondholders — and stays for 74 years, without ever formally annexing it. | The "what is this place, legally?" widget: Egypt cycles through veiled protectorate (1882) → protectorate (1914) → nominally independent kingdom with British troops (1922) → 1956. One place, four labels. |
| **T13** | The **Berlin Conference (Nov 1884 – Feb 1885)** set European rules for claiming Africa. No African state was represented. Claims required "effective occupation" — which meant treaties, then guns. | A treaty document the student can open, with the two texts side by side: what the chief was told, what the English version said. |
| **T14** | **Peak extent c.1920–22**: roughly a quarter of the world's land and, by the 1913 figures, over 400 million people — and the peak came *after* the League of Nations mandates, i.e. after the empire was supposedly in decline. | The area-over-time chart with the peak marked *to the right of* 1914. The counter-intuitive placement is the hook. |
| **T15** | **Settler self-government came early to some and never to others**: Durham Report 1839 → Canada 1867 → Australia 1901 → New Zealand 1907 → South Africa 1910 → Balfour formula 1926 → Statute of Westminster 1931. Meanwhile Indian and African subjects were told they were "not yet ready". | A two-track timeline in one frame: "given self-rule" above the line, "refused self-rule" below it, same years. The asymmetry is the lesson. Race is named as the operative criterion, with evidence. |
| **T16** | **Famine under British rule was policy-shaped, not just weather**: Ireland 1845–52 (c.1 million dead, c.1 million emigrated, exports continuing); India 1876–78 and 1896–1902 (millions dead under Famine Codes and free-trade doctrine); Bengal 1943 (c.2–3 million dead, wartime priorities and denial policies). | Population-line charts with the drop, plus a source pairing: a colonial official's memo next to a survivor's testimony. Sen's *Poverty and Famines* (1981) is the interpretive anchor: entitlement failure, not absolute food shortage. |
| **T17** | **1919, Jallianwala Bagh, Amritsar**: troops under Dyer fired on a penned crowd; the official Hunter Commission counted 379 dead and c.1,200 wounded, Indian estimates were far higher. Dyer was relieved but publicly feted in Britain. | A single map pin that expands into the enclosed garden's plan with the exits marked. Geography *is* the argument here. |
| **T18** | **Anticolonial politics was organised, long, and led by named people** — Naoroji (drain theory, MP from 1892), Gandhi and the 1930 Salt March, Ambedkar, Nkrumah (Ghana 1957), Kenyatta, Kimathi, Aung San, Nehru, Jinnah. | The "who" ribbon: every tour beat carries a face and a name; the recap quiz asks for the person, not the year. |
| **T19** | **Decolonisation was not a peaceful handover**: Partition 1947 (10–20 million displaced; several hundred thousand to c.1 million dead); Malaya 1948–60; Kenya 1952–60 (tens of thousands detained; the Hanslope Park files surfaced in 2011; £19.9m settlement in 2013); Suez 1956; Rhodesia's UDI 1965–80. | A choropleth of exits coloured by *how* they happened, not when. Students are asked to predict the colour before it loads. |
| **T20** | **It isn't finished**: 14 British Overseas Territories; the Chagos Archipelago dispute and Diego Garcia; the Commonwealth of 56 states; Windrush; ongoing claims over restitution and reparations. | The final map state: 1997 fades but does not go blank. Fourteen dots remain, clickable, dated to today. |

**Rule for the quiz agent:** all 20 must appear in the full bank; no quiz item may test anything
outside these 20 plus the §4 misconceptions. If you want to test something else, argue for adding it
here first. The floor of fourteen is a *route* rule and lives in §3.1; what a quiz item may ask on a
given route lives in §3.2.

**Rule for the tours agent:** each tour beat carries exactly one T-number as its primary payload.
A beat carrying three is a beat nobody remembers. (A counted figure the viz module mounts inside a
beat may carry a second, and only a second — that is how T3, T8 and T14 are taught.)

---

### 3.1 THE FLOOR, AND WHICH ARTEFACT IT APPLIES TO

**Amended, wave 9 (§9.4). This replaces "at least 14 of the 20 in the default 30-minute path".**
That sentence was unsatisfiable and it was this document's fault: `budget.js`'s exhaustive search
over the authored beats says the ceiling on beat-taught coverage inside 1,800 seconds at 110 words
a minute, with one Complication Gate, is roughly **seven to nine** of the twenty. A one-period lesson
cannot carry fourteen, and a specification that demands fourteen from one period is asking a builder
to lie. §8.0 states the arithmetic in full. The floors now are:

| Artefact | Floor | Measured against |
|---|---|---|
| **The unit** (Lesson One + Lesson Two) | **14** — §3's own number, unchanged | items a **beat** on either lesson teaches, counted once |
| **Lesson One** alone | **7** | items a beat on that lesson teaches |
| **Lesson Two** alone | **8** | items a beat on that lesson teaches |
| **The full route** | **20** | every item, or the shortfall named on its own card |

**A recall is never coverage.** An item counts toward a floor only when a **required** beat on that
route carries it as its primary payload (`beat.t`) or as the counted figure mounted inside it
(`beat.onPath.t`). An optional beat, a side road, a pin, a Close line, an extension card and a
spaced recall are all excluded. This is already what `tours/budget.js::mustStick()` computes; it is
written here so that no surface can quietly recount it.

**The division of the twenty.**

| Item | Lesson | Why there |
|---|---|---|
| **T1** four engines | **One**, restated in **Two** | The spine is the frame both lessons file onto. Restating it is not duplication; it is the schema. |
| **T2** Jamestown, Barbados, Jamaica | One | Where Phase I begins. |
| **T3** the crossing | One | The Atlantic's central magnitude; its chart lives inside the T2 beat. |
| **T4** continuous rebellion | One | Abolition is unintelligible without it, and it must be dated *before* abolition on the same axis. |
| **T5** the compensation ledger | One | The ending of the Atlantic argument, and the repair for M8. Never demotes. |
| **T6** a company chartered in 1600 | One | The `[PREDICT]` that activates M2; the reveal opens Phase II. |
| **T7** Plassey → diwani → the loop | One | The mechanism the whole app is built around. Never demotes. |
| **T8** an army that was mostly Indian | One | The loop's output, taught inside the loop beat where it means something. |
| **T9** 1857 and the Crown takeover | **Two** | It is the *hinge*, and a hinge belongs to the door it opens. As Lesson Two's first beat it gives that lesson a real beginning and gives Phase II an ending the student has just built the machine for. |
| **T10** a thousand officers over three hundred million | **Extension** | It has never been carried as a primary payload by any beat; it is stated in the princely-states beat's own prose. Hosted there, one press away, named in Lesson Two's Close. |
| **T11** the 565 princely states | Two | §3's own hook: a student who never sees this cannot understand Partition — and Partition is in Lesson Two. |
| **T12** Egypt's four legal labels | Two, **first on the demotion order** | The best legal-status teaching in the app, at 170 seconds. If the budget will not close, LO2 is still served by T11's paramountcy, by the status recolour that shatters the single pink, and by the dossier legal-status field on every territory. |
| **T13** Berlin 1884–85 | **Two — required, undemotable** | See below. |
| **T14** the peak came after the war | Two | The counter-intuitive placement is the hook, and it is taught inside the exits beat. |
| **T15** given and refused | Two, second on the demotion order | Where race is named as the operative criterion. At 136 seconds it is the cheapest morally load-bearing item in the unit. |
| **T16** famine as policy | **Extension** | The honest cost: a famine beat is ~180 seconds and neither lesson has 180 seconds. It is hosted twice — off Lesson One's loop beat, where Bengal 1770 is the loop's first product, and off Lesson Two's two-track beat — one press each, named in both Closes, and taught as a beat on the full route. **The `t16-bengal-1943` recall that currently fires on a route teaching no famine is exactly the defect §3.2 forbids and must be removed.** |
| **T17** Amritsar 1919 | **Extension** | The most expensive single item in the unit: 389 seconds, six and a half minutes of a period for one afternoon in one garden. At that price it buys T15 *and* T12. It stays a beat on the full route, sits one press from Lesson Two's two-track beat — *"who was refused, and what happened when they asked"* — and is named in that lesson's Close. |
| **T18** anticolonial politics was organised and named | Two | The "who" ribbon carries the exits beat; no beat passes without a named non-British actor anyway (LO6). |
| **T19** decolonisation was not a handover | Two | February 1942 is where Phase IV starts (§2.2). |
| **T20** it isn't finished | Two | The unit's last map state, and LO12. |

**Defence of the split, in one paragraph.** The cut is between the two engines that *built* the
empire and the two that *ran and lost* it — §2.1's own boundary, not an arbitrary halfway mark.
Lesson One is a complete argument: sugar and enslaved labour, people who never stopped resisting, a
ledger that paid the owners and not the freed, and a shareholder company that discovered taxing
people paid better than trading with them. It ends where its argument ends — with a company
governing twenty to thirty million people — and its through-line is a whole sentence. Lesson Two is
also complete: the state takes the company over, the map's single colour turns out to hide princely
states and protectorates and four labels for one country, Africa is taken by a rulebook and then by
guns, self-rule is given above the line and refused below it, the prestige breaks in February 1942,
and the exits are not the colour anyone guessed. It ends with the fourteen dots that are still
there. Each half is the half of §2.3's sentence that names its own phases, so a student signs a
true sentence at the end of each lesson and the two signatures compose.

**T13 is required and undemotable.** How Britain took Africa — the Scramble, the Berlin Conference
of November 1884 – February 1885 at which no African state was represented, and "effective
occupation" — **must be taught by a beat the student walks**, in Lesson Two, at §3's own hook (the
treaty document with the two texts side by side). It may not be delivered by a recall, a pin, a
Close line, an extension card or a sentence in another beat's prose. An atlas of the British Empire
whose taught route never shows the Scramble is not finished, and no budget argument overrides this:
if Lesson Two will not close, T12 goes first and T15 second, and T13 stays.

**Extension is a promise, not a bin.** Every item assigned to extension above must (a) be named in
prose inside a specified beat of the lesson that raises it, (b) be reachable in **one press** from
that beat, (c) be named by name in that lesson's Close under §8.4(6), and (d) be taught as a beat on
the full route — or the full route's card names it as a shortfall, by name. An extension item that
fails any of the four is not extension; it is an omission with better manners.

### 3.2 THE SPACED RECALL RULE

**Normative, verbatim. The current implementation violates it and must be changed.**

A spaced recall is a **second** encounter with something the student has already met. It is
retrieval, not instruction, and all of its didactic value rests on one implicit claim: *you have
seen this before.* A recall that asks for something the student was never taught is not a hard
question. It is a false statement about their own session, and what it teaches them is that this app
does not know what it showed them — which is the one thing an app claiming to adapt cannot afford.

**Three tests, in this order, every time, before a recall renders.**

1. **The route test.** The item the recall asks for must be carried by a **required** beat on the
   route the student is running — as that beat's primary payload (`beat.t`) or as the counted figure
   mounted inside it (`beat.onPath.t`) — and that beat must sit **earlier in the route than the
   recall**. A recall may never be the first encounter with anything. Optional beats, side roads,
   pins, extension cards, essay panels and Close lines are not teaching for this purpose.
2. **The run test.** This student's **own run record** must say they reached that beat and completed
   it. Skipping forward, arriving by deep link, entering from free-explore or resuming a route
   mid-way all fail this test. The route test asks what the lesson offers; the run test asks what
   this person actually did. Both must pass. A recall may not be satisfied by a beat the student
   walked in a *previous* lesson unless that lesson's completion is in the same local record and the
   recall's own wording says so ("last lesson, the loop").
3. **The spacing test.** At least **six minutes** of this student's elapsed session must separate
   the teaching beat from the recall. If less has elapsed, the recall waits. If the route ends
   first, it does not fire.

**What a recall may say.** Its prose may claim only what the three tests have proved. *"A number
this lesson has named but not given you"* is a claim about the route and must be falsifiable against
it. Where a recall names the earlier moment — *"the loop again, from memory"*, *"from the loop,
earlier"* — that moment must be the beat the route test found, addressed by id, not by hope.

**What it must do when it has nothing legitimate to ask.** It renders **nothing**. There is no
substitute question, no downgraded version, no consolation fact. A route with fewer eligible recalls
than slots runs with fewer recalls and says so, once, in one true line on its own card and in its
Close: *"this lesson had room for two spaced recalls and legitimate ground for one."* A true
sentence about the lesson is worth more than a second question the lesson did not earn.

**A recall is never counted as coverage** (§3.1). A first encounter dressed as a second is the same
lie in a different place.

**Failure is student-visible.** A recall that renders without passing all three tests is a defect of
the same class as an unsourced number: it renders `[unearned recall]` in `--danger` in front of a
sixteen-year-old, and CI fails the build. The check belongs beside `tools/check-timing.js` and takes
the same `--selftest`.

---

## 4. MISCONCEPTIONS TO DEFEAT

Eighteen. These are not straw men: they are what students say out loud in classrooms and write in
exams. Conceptual change research (Chi; Vosniadou) is clear that stating the correct fact does not
displace a wrong model — the wrong model has to be *activated, contradicted by evidence the student
processes themselves, and then replaced by a model that explains the same things better*. So each
entry below specifies the **activation** (make them commit to the wrong belief first), the
**refutation evidence**, and the **replacement model**. Build all three or you have built nothing.

---

**M1. "The empire was mostly settled by British people who moved there."**
- *Activation:* slider — "what share of the empire's population in 1913 was of British descent?"
  Students typically say 20–50%.
- *Evidence:* reveal against the 1913 population of roughly 412 million, of whom the settler
  populations of Canada, Australia, New Zealand and white South Africa together were on the order of
  1.5–2%. India alone was around three-quarters of the empire's people.
- *Replacement:* "The empire was overwhelmingly a system for ruling non-British people. Settlement
  was the exception and it was concentrated in five places."
- *Owner:* viz (population treemap) + tours beat 4.

**M2. "India was conquered by the British government."**
- *Activation:* "Who conquered Bengal? (a) the Royal Navy (b) the British Army (c) a London
  shareholder company (d) Parliament."
- *Evidence:* the 1600 charter; Plassey 1757 fought by Company forces with Indian allies and
  bankers (the Jagat Seths); the Diwani grant of 1765 from the Mughal emperor Shah Alam II; the
  Company army's overwhelmingly Indian composition; the state taking over only in 1858 after
  rebellion.
- *Replacement:* the T7 revenue→sepoys→conquest loop. "A company with an army discovered that tax
  collection paid better than trade. The government arrived a century later to clean up."
- *Owner:* tours (India chapter) + panels (India dossier legal-status field).

**M3. "Decolonisation was a peaceful, planned handover — Britain decided to leave."**
- *Activation:* sort ten exits into "peaceful / violent" before seeing any data.
- *Evidence:* Partition's death toll and displacement; the Malayan Emergency (1948–60, half a
  million people moved into "New Villages"); Kenya (mass detention, the 2011 disclosure of the
  Hanslope Park "migrated archives", the 2013 settlement of £19.9m to 5,228 claimants); Cyprus,
  Aden, Suez; and the destruction of records under Operation Legacy.
- *Replacement:* "Britain left when it could no longer afford or win. Where it thought it could
  win, it fought — and mostly still lost." Anderson's *Histories of the Hanged* (2005) and Elkins's
  *Britain's Gulag* (2005) are the citations; note in-app that Elkins's higher casualty estimates
  are disputed by demographers, and that the disputed part is the *scale*, not the *system*.
- *Owner:* tours (dissolution chapter) + map exit-type layer.

**M4. "The map was pink and static — the empire was one solid block that grew then shrank."**
- *Activation:* show the classic 1886 imperial-federation-style pink map. Ask: "what's wrong with
  this picture?" Collect guesses.
- *Evidence:* (i) projection toggle — Mercator vs equal-area, watch Canada shrink; (ii) status
  toggle — recolour by legal status and the single pink shatters into eight categories; (iii)
  churn — replay 1750–1950 and count territories that entered and left more than once (Menorca,
  Java 1811–16, Heligoland ceded 1890, Weihaiwei leased 1898–1930, the Ionian Islands 1815–64).
- *Replacement:* "The pink map was a poster, not a description. Ask three questions of any imperial
  map: what projection, what does the colour mean, and what year exactly?"
- *Owner:* map (projection + status recolour) + tours beat 1. This is the app's signature interaction.

**M5. "1776 ended the British Empire."**
- *Activation:* "Was the empire bigger in 1770 or in 1820?"
- *Evidence:* the territory- and population-over-time chart, with the loss of 13 colonies visible as
  a dip that the Indian conquests more than fill; 1815's retained gains (Cape, Ceylon, Malta,
  Trinidad, Mauritius, Guyana); Marshall's *The Making and Unmaking of Empires* (2005).
- *Replacement:* "Losing America redirected the empire; it did not end it. The eighteenth century
  ends with Britain ruling more people than ever, mostly in Asia."
- *Owner:* viz (extent chart with prediction interaction).

**M6. "Colonies wanted independence and Britain kindly granted it."**
- *Activation:* two-sided statement card, "agree / disagree", answer recorded.
- *Evidence:* Naoroji's drain-theory critique from the 1860s–70s and his election to Parliament in
  1892; the Indian National Congress founded 1885 and refused; the 1919 Rowlatt Acts and Amritsar;
  the Government of India Act 1935 as an attempt to concede form while retaining power; the
  1946 Royal Indian Navy mutiny; and — for the other side of the ledger — Attlee's cabinet papers
  weighing the cost of holding India against a bankrupt post-war Britain.
- *Replacement:* "Independence was demanded for decades and refused, then conceded fast when
  refusing became unaffordable. 'Granting' is the loser's word for losing."
- *Owner:* copy + tours; also a strict rule for the data agent: the dossier field is
  `independence_mechanism`, never `granted`.

**M7. "The empire brought railways, law and English, so it developed the colonies."**
- *Activation:* "What did the railways carry, and who owned them?"
- *Evidence:* India's railway network was among the world's largest by 1900, built with guaranteed
  returns of ~5% to British investors charged to Indian taxpayers; freight structured to move raw
  material to ports; India's share of world manufacturing output collapsed across the nineteenth
  century (Bairoch's series, with Maddison's GDP-share series alongside); the 1943 Bengal famine
  happened on a railway network.
- *Replacement:* "Infrastructure was built where it served extraction and control. Some of it was
  genuinely useful afterwards. Both are true; the second does not pay for the first."
- *Careful here:* present Tharoor's *Inglorious Empire* (2017) and the critical responses to his
  numbers. This is a place to model argument, not to hand down a verdict. Flag the Maddison figures
  as reconstructions with wide error bars.
- *Owner:* viz + `[EXT]` historiography card.

**M8. "Britain abolished slavery, so Britain was basically the good guy."**
- *Activation:* timeline drag — "put these in order: British slave trade peaks / Somerset case /
  abolition of trade / abolition of slavery / compensation paid".
- *Evidence:* Britain was the largest single carrier in the eighteenth century; abolition came after
  a century of Black resistance and a mass petition movement; the enslaved got nothing and the owners
  got £20 million; apprenticeship kept people working unpaid until 1838; indenture replaced slavery
  within a year of the Act.
- *Replacement:* "Britain built the biggest slave-trading operation of the eighteenth century and
  then dismantled it, under pressure from the enslaved and from its own abolitionists. Abolition is
  a real achievement inside a system Britain made. Both clauses stay in the sentence."
- *Owner:* tours (Atlantic chapter) + T5 counters.

**M9. "A small number of Britons ruled by sheer technological superiority."**
- *Activation:* "How many British officials governed India in 1900?" Free numeric entry.
- *Evidence:* the ICS at roughly a thousand covenanted officers; the Indian Army; Indian police,
  clerks, revenue collectors, translators and munshis; 565 princely rulers under paramountcy;
  Lugard's *The Dual Mandate in British Tropical Africa* (1922) as the explicit doctrine of ruling
  through existing authorities.
- *Replacement:* "Empire was collaboration under duress plus coercion. Break the collaboration —
  1857, 1919, 1942, 1946 — and rule wobbles immediately."
- *Owner:* viz (dot chart) + panels.

**M10. "The Scramble for Africa was decided at the Berlin Conference, which carved up the map."**
- *Evidence:* Berlin (Nov 1884–Feb 1885) recognised Leopold's Congo claim and set procedural rules,
  notably "effective occupation"; the actual borders were fixed by dozens of bilateral treaties and
  by force over the following two decades. And African states fought: the Anglo-Zulu War of 1879
  included the British defeat at Isandlwana; Asante fought four wars; Ethiopia defeated Italy at
  Adwa in 1896.
- *Replacement:* "Berlin wrote the rulebook for a race that was run on the ground, with guns, over
  twenty years, against people who fought back."
- *Owner:* map (Africa sequence) + tours.

**M11. "Empire made ordinary British people rich."**
- *Evidence:* the distribution of colonial investment income — Cain & Hopkins's "gentlemanly
  capitalism" thesis locates the beneficiaries in the City, finance and services rather than
  industry; the fiscal cost of defence; Davis and Huttenback's argument that empire was a subsidy
  from taxpayers to investors. Balanced against: cheap sugar, tea, cotton and grain did reach
  working-class tables, and port cities were built on it.
- *Replacement:* "Empire concentrated profits and socialised costs. Some Britons got very rich; most
  got cheaper tea and a bigger tax bill."
- *Owner:* `[EXT]` economics card. Mark the disagreement openly; this is genuinely contested.

**M12. "Everyone at the time thought empire was fine — you can't judge them by our standards."**
- *Evidence:* contemporaneous British and colonial critics — the abolitionists; the Aborigines'
  Protection Society (1837); the Jamaica Committee's prosecution attempt against Governor Eyre
  (1865–68) with Mill on one side and Carlyle on the other; the Congo reform movement; E.D. Morel;
  Naoroji and Gokhale; the Indian press. Gopal's *Insurgent Empire* (2019) documents how British
  dissent was itself prompted by colonial rebellion.
- *Replacement:* "The moral arguments we make now were being made then, loudly, by people on both
  sides — including by the colonised. Empire was always contested."
- *Owner:* tours (a dedicated "argued at the time" beat in each chapter) + sources panel.

**M13. "The Commonwealth is what the empire naturally became — a family of friends."**
- *Evidence:* the 1926 Balfour formula and the Statute of Westminster 1931 applied only to the white
  dominions; India's 1949 decision to stay in as a republic changed the institution's meaning;
  South Africa left in 1961 over apartheid; Commonwealth membership now includes states with no
  British colonial past (Mozambique, Rwanda, Gabon, Togo).
- *Replacement:* "The Commonwealth started as a club for settler states, was rebuilt by the newly
  independent, and is now a voluntary association that includes countries Britain never ruled."
- *Owner:* panels + final tour beat.

**M14. "Indian independence in 1947 was the end of the empire."**
- *Evidence:* the extent chart after 1947 — Malaya, Kenya, Nigeria, the Gulf, Aden, Hong Kong; and
  the fact that British *forces* were more heavily committed to colonial wars in the 1950s than in
  the 1930s.
- *Replacement:* "1947 removed three-quarters of the empire's population in one day and almost none
  of its territories. The fighting was mostly still ahead."
- *Owner:* viz (twin charts: population lost vs area lost, 1947).

**M15. "Colonial borders were drawn arbitrarily with a ruler, which explains everything that went
wrong afterwards."**
- *Evidence:* some borders were indeed straight lines drawn in Europe (much of the Sahara);
  many followed rivers, watersheds, and existing polities; the Radcliffe Line of 1947 was drawn in
  five weeks by a man who had never been to India, and its consequences were catastrophic — but
  post-colonial outcomes vary enormously between states with similar border histories.
- *Replacement:* "Borders were sometimes arbitrary and always consequential — but 'the borders did
  it' is a way of not talking about extraction, indirect rule and armed exits. Look at what was
  inside the borders as well as where they were."
- *Owner:* map (border-origin annotation on hover) + `[EXT]` card. This one guards against a
  *sympathetic* oversimplification, which is why it matters.

**M16. "The World Wars were European wars that the empire watched."**
- *Evidence:* roughly 1.4 million Indians served in the First World War, with about 74,000 dead;
  around 2.5 million Indians volunteered in the Second — the largest volunteer army in history;
  hundreds of thousands of African troops served in Burma and East Africa; the Caribbean regiments;
  the war was fought across Mesopotamia, East Africa, Palestine, Burma and Malaya.
- *Replacement:* "These were imperial world wars, fought largely by colonial soldiers, and the bill
  for them is one reason the empire ended."
- *Owner:* map (war-service layer) + tours (dissolution chapter opening).

**M17. "Empire is a British story — it's about what Britain did."**
- *Evidence:* every dossier requires a named local actor and a named local institution; the
  Company's dependence on Indian finance; African rulers who negotiated, allied and fought; the
  Māori who forced the Treaty of Waitangi (1840) and then fought over its two divergent texts;
  Caribbean maroon communities that won treaties.
- *Replacement:* "Empire is a story about relationships under coercion. Britain is one party in it.
  It never had the only agency, and usually didn't have most of it locally."
- *Owner:* data schema — `local_actors[]` is a **required, non-empty** field on every territory.
  QA fails the build if any territory ships with an empty array.

**M18. "Historians agree about all this — the facts are settled."**
- *Evidence:* the app's own contested-value markers: the Bengal 1770 death toll, the Mau Mau
  casualty range, Maddison's GDP shares, whether empire was profitable for Britain, whether the
  British public cared about empire (Porter's *The Absent-Minded Imperialists*, 2004, versus Hall &
  Rose's *At Home with the Empire*, 2006, and MacKenzie's *Propaganda and Empire*, 1984).
- *Replacement:* "Numbers about the past are estimates with methods behind them. Knowing why a
  number is uncertain is a higher skill than knowing the number."
- *Owner:* everyone. Any number with a real range renders with the range and a "why is this
  disputed?" affordance. **A false-precision number in this app is a bug, not a rounding choice.**

---

## 5. WHAT A GREAT COURSEBOOK DOES BETTER THAN A WEBSITE

Written honestly, because the whole project is a bet that we can beat a book, and a bet you don't
understand is a bet you lose. The benchmark: a strong A-level / IB / AP-style chapter — think the
better textbook treatments and the synthesis chapters of the *Oxford History of the British Empire*
(Louis, gen. ed., 5 vols, 1998–99) or Darwin's *Unfinished Empire* (2012) written down for schools.

### 5.1 Sustained causal prose

**The book's advantage.** A book can run 900 words of unbroken argument: *because* this, *therefore*
that, *however* this complication. Causation lives in subordinate clauses, and subordinate clauses
need paragraphs. Interfaces chop text into 40-word cards, and 40-word cards can state facts but
cannot argue. A student who reads Darwin on why the mid-Victorian state kept trying not to annex
things comes away with a *reasoning pattern*. A student who taps twelve map pins comes away with
twelve pins.

**How we match or beat it.** (a) We ship *real prose* — every chapter of the tour ends with a
250–400 word essay panel written as argument, not caption, with the connectives visible. No chapter
ships without one; QA counts words. (b) We make causation **manipulable**, which no book can do: the
T7 revenue→sepoys→conquest loop is a diagram the student can step, break and re-run — remove Bengal's
revenue and watch the conquest stall. Books can assert a feedback loop; we can let a student run it.
(c) Every causal claim in the app carries a visible **"because" chip** linking cause to consequence
across panels, so causation is a first-class object in the data model, not a sentence.
⟶ builds: `causal_links[]` in the data model; `essay` field on every tour chapter; the mechanism
diagram component.

### 5.2 A single authorial voice with a point of view

**The book's advantage.** Cannadine's *Ornamentalism* (2001) is memorable because one mind is
arguing one thing — that Britons saw the empire through class and hierarchy more than race. You may
disagree, but you remember it, because a voice with a stake is easier to hold than a committee's
balance. Apps built by teams read like airport signage.

**How we match or beat it.** We write in **one voice with an explicit stance**: the empire was built
by force and run for profit, was experienced incommensurably by different people, and was contested
throughout. That stance is stated in the app's About panel, not hidden behind neutrality. Where we
take a side, we say we are taking it and show the other side's best case (§7). One copy owner
edits every string; contributions get rewritten, not concatenated. A house-style lint (banned words,
sentence-length ceiling) runs in CI.
⟶ builds: About/"where we stand" panel; copy lint; single copy owner named in ARCHITECTURE.md.

### 5.3 Deliberate sequencing — the author controls the order

**The book's advantage.** Chapter 3 can assume Chapter 2. The author builds a schema before loading
it. Hypertext hands the student a door in every wall, and a student who wanders arrives at the
Scramble for Africa without knowing what a protectorate is. Cognitive load theory (Sweller) is
unambiguous: novices need worked, ordered examples; exploration is for people who already have a
schema.

**How we beat it.** This is our biggest risk and we treat it as such. **The default state of the app
is the guided path, not the sandbox.** A first-time visitor lands in Lesson One (§8), which
is strictly sequenced. Free exploration is one click away and is *encouraged after* the schema is
built, or at any point via an explicit "I'll explore on my own" escape that warns nothing and blocks
nothing. Beyond that we beat the book on two fronts a book cannot touch: (i) the path **adapts** —
a missed retrieval item re-appears later, which a printed page cannot do; (ii) the map is a
**constant spatial frame**, so every new fact is filed on the same mental object, which is a stronger
schema than chapter order gives you.
⟶ builds: first-run guided mode; `progress` state in the store; adaptive re-ask in the quiz module.

### 5.4 Sourcing and scholarly apparatus

**The book's advantage.** Footnotes, a bibliography, named archives, and the discipline that comes
from an author who expects to be checked. Websites tend toward confident sourceless assertion, and
students learn that history is a set of facts that appear from nowhere.

**How we beat it.** Every substantive claim in this app is **click-to-source**, which is faster than
flipping to a footnote and lets us show the source's *nature* — Hunter Commission report, Company
correspondence, a testimony, a modern reconstruction — rather than just its title. `docs/SOURCES.md`
is a real bibliography with author, title, year, and a note on what each work is used for and where
it's contested. **Hard rule from the BRIEF: never invent a citation.** Where we cannot source a
number, we say "estimates vary" and give the range and the reason. A number with no provenance does
not ship.
⟶ builds: `sources[]` on every claim; source-type taxonomy; the "why is this disputed?" affordance.

### 5.5 Exam-readiness

**The book's advantage.** It knows the specification. It gives model paragraphs, key terms with
exam-usable definitions, essay plans, and the phrasing that earns marks. Students and teachers pick
books for this, and they are not wrong to.

**How we match it.** We ship an **exam layer**, opt-in, not decorative: (a) a 40-term glossary with
definitions written to be usable in a sentence — protectorate, paramountcy, indirect rule, informal
empire, dominion status, mandate, indenture, drain theory, settler colonialism, decolonisation;
(b) three **worked model paragraphs** (a point-evidence-explanation causal paragraph, a
"how far do you agree" paragraph handling counter-argument, a source-utility paragraph) with the
moves annotated in the margin — worked examples are the highest-leverage thing in the load-theory
literature for novices; (c) a printable one-page revision sheet generated from the student's own
session, which is the one thing a coursebook physically cannot do; (d) exportable timeline and map
images for revision notes.
⟶ builds: glossary; worked-paragraph component with annotation layer; session-derived print sheet.

### 5.6 Portability, permanence and the absence of a battery

**The book's advantage.** It works on a train, needs no login, doesn't change under you, and can be
annotated in pencil. A teacher can plan a lesson around a page number that will be the same in March.

**How we match it.** Offline-first is already a BRIEF rule — vendored, no CDN, works from a local
file. We add **stable deep links** for every territory, year and tour beat, so a teacher can set
"open `#/india/1765`" the way they'd set a page number, and a **print stylesheet** that turns the
current view into something a student can annotate. Version the content and show the version, so a
teacher's link means the same thing in March.
⟶ builds: hash routing scheme, documented in ARCHITECTURE.md; print CSS; content version string.

### 5.7 Density without fuss

**The book's advantage.** A double-page spread can hold a map, a timeline, three sources, a chart
and 600 words simultaneously, and the eye picks its own route with no interaction cost. Apps hide
things behind clicks and call it "clean". Every click is a chance to not learn something.

**How we beat it.** Design to **atlas density, not dashboard density** (the BRIEF says as much).
Key numbers sit on the map as labels, not in tooltips. The dossier shows the four things that matter
without scrolling. Nothing essential lives behind a hover — hovers don't exist on touch and don't
exist for keyboards. And where the book is fixed, we are dynamic: the same spread can be re-projected,
re-coloured by status, and re-timed. Density plus mutability beats density alone.
⟶ builds: no-hover-only rule in the component checklist; label-on-map policy; dossier above-the-fold spec.

### 5.8 Trust and authority

**The book's advantage.** A named author, a publisher, a review process, a date. Students and
teachers extend it credit. An unbranded website starts at zero, and a website about empire starts
below zero for anyone who suspects it of an agenda.

**How we match it.** Show our workings: a visible methods note (how territories were defined, how
dates were chosen, what "controlled" means here), a named historiography panel, an explicit statement
of stance, an errata/changelog, and a "how to disagree with this app" card telling students exactly
which of our choices are debatable and where to read the other case. Inviting the reader to check us
buys more authority than asserting it.
⟶ builds: Methods panel; changelog; "how to disagree with this" card.

### 5.9 Where the book simply cannot follow — press the advantage

Not a concession; the offensive half of the ledger. We must actually build these, or we are a worse
book.

1. **Time as a manipulable dimension.** Scrub 1600→1997 and watch the empire breathe. A book shows
   four static maps.
2. **Projection as an argument.** Toggle Mercator to equal-area mid-sentence. The distortion is
   *felt*, not described.
3. **Same data, many encodings.** Recolour by status, by date acquired, by how it was acquired, by
   how it left. Books pick one and print it.
4. **Retrieval built into the surface.** Predict-then-reveal, low-stakes recall, spacing across the
   session. A book cannot ask you a question and know you got it wrong.
5. **Mechanism simulation.** Step the revenue→sepoys→conquest loop; break the loop and see the
   consequence.
6. **Scale made bodily.** 3.4 million people rendered as area, not as a numeral you skim.
7. **Personalised revision.** The session becomes a study sheet of what *this* student missed.
8. **Non-linear comparison.** Put Jamaica 1831 next to Bengal 1857 next to Kenya 1952 on one screen
   and see the pattern of rebellion and reprisal.

**The benchmark line, for critics:** if a student would learn more from 30 minutes with a good
chapter, we have failed, and §6 is how that gets measured.

---

## 6. THE COMPARISON RUBRIC

**Use verbatim.** For a blind comparison of *Artefact A* and *Artefact B* (one of which is this app,
one of which is the best available coursebook treatment of the British Empire). The judged question
is **"which one teaches the history better?"** — not which is prettier, more modern, or more
interactive. Interactivity that does not teach scores zero.

**Procedure.** The judge spends 30 minutes with each artefact in a randomised order, then scores each
criterion 0–5 against the anchors below. Fractions are not allowed; force a choice. Weighted score =
Σ(score × weight) / 5, out of 100. Any criterion scored 0 or 1 requires a one-sentence justification
quoting the artefact. The judge must also record the three most damaging specific failures in each
artefact, and answer: *"If you taught this topic next Tuesday, which would you assign?"*

| # | Criterion | Weight |
|---|-----------|--------|
| C1 | Causal explanation | 12 |
| C2 | Chronological control | 10 |
| C3 | Geographic literacy | 10 |
| C4 | Evidence and sourcing | 10 |
| C5 | Memorability and retrieval | 10 |
| C6 | Multiperspectivity and named actors | 9 |
| C7 | Misconception repair | 9 |
| C8 | Transfer and historical thinking | 8 |
| C9 | Scale and quantitative sense | 7 |
| C10 | Honesty about violence, contestation and historiography | 7 |
| C11 | Narrative coherence and voice | 5 |
| C12 | Cognitive load, access and pace | 3 |
| | **Total** | **100** |

### Anchors

**C1 — Causal explanation (weight 12).** Does the learner end able to explain *why* things happened,
with mechanisms rather than lists?
- **0** Chronicle only: things happen in order, no because.
- **1** Causes named as labels ("nationalism", "trade") with no mechanism.
- **2** One or two causal chains stated, none developed; monocausal.
- **3** Multiple developed causal chains; some multi-causality; consequences distinguished from causes.
- **4** As 3, plus explicit weighing of causes against each other, and at least one feedback loop or
  contingency treated seriously.
- **5** As 4, plus the learner can *manipulate or apply* the causal model — counterfactual, broken
  loop, or transfer to a case the artefact didn't teach — and can say what evidence would refute it.

**C2 — Chronological control (weight 10).** Can the learner order events, hold periods, and grasp
duration and simultaneity?
- **0** Dates absent or unusable.
- **1** Dates present but unstructured; no periodisation.
- **2** A periodisation is given but not justified; duration and overlap invisible.
- **3** Clear justified periodisation; ordering supported; sequence recoverable.
- **4** As 3, plus simultaneity across regions is made visible, and the periodisation's boundaries
  are defended against alternatives.
- **5** As 4, plus the learner can *use* chronology to explain — placing an unfamiliar event and
  reasoning from its position — and knows which dates are conventions rather than facts.

**C3 — Geographic literacy (weight 10).** Does the learner leave with a correct, critical mental map?
- **0** Places named, never located.
- **1** A map exists; it is decorative and unexamined.
- **2** Places locatable; the map is treated as neutral truth.
- **3** Accurate located geography; scale and distance conveyed; routes and adjacency matter to the argument.
- **4** As 3, plus map projection, colour convention and the meaning of "control" are explicitly
  problematised; the learner can criticise an imperial map.
- **5** As 4, plus geography does explanatory work the prose alone couldn't do — the learner uses
  spatial reasoning (chokepoints, coasts, rivers, distance-to-port) to explain an outcome.

**C4 — Evidence and sourcing (weight 10).** Are claims traceable, and does the learner see how we know?
- **0** Assertions with no sourcing.
- **1** A bibliography exists; no claim-level traceability.
- **2** Some claims sourced; primary material is illustrative only.
- **3** Substantive claims traceable to real, correctly cited works; primary sources used as evidence
  for specific claims.
- **4** As 3, plus the *nature* and limits of sources are discussed (who made this record, why, what
  it omits), and at least one silence in the archive is named.
- **5** As 4, plus the learner practises source reasoning themselves and can say what evidence would
  change a stated conclusion. Zero fabricated or unverifiable citations (any fabrication caps this
  criterion at 0 and the whole artefact at 2 overall).

**C5 — Memorability and retrieval (weight 10).** Will it still be there in a week?
- **0** No structure for retention; undifferentiated information.
- **1** Bolded key terms; summary at the end.
- **2** A clear core set of takeaways; some imagery supporting text.
- **3** Explicit core/extension distinction; genuine dual coding (image and word carrying the same
  idea, mutually referring); recap present.
- **4** As 3, plus active retrieval demanded during the session, not just at the end, with feedback.
- **5** As 4, plus spacing across the session, prediction-before-reveal, and personalised follow-up
  on what this learner actually got wrong.

**C6 — Multiperspectivity and named actors (weight 9).** Whose history is this?
- **0** One perspective; colonised people appear as numbers or scenery, or not at all.
- **1** Other perspectives mentioned in the abstract ("resistance occurred").
- **2** A few named non-British individuals, mostly as objects of British action.
- **3** Named colonised actors with agency, motives and outcomes throughout; more than one social
  position represented (elite/peasant, women/men).
- **4** As 3, plus perspectives that conflict are held in tension rather than averaged; collaborators,
  intermediaries and beneficiaries among the colonised are included honestly.
- **5** As 4, plus the learner can reconstruct a contemporary debate from more than one side and say
  what each party knew and wanted.

**C7 — Misconception repair (weight 9).** Does it displace what learners wrongly believe?
- **0** Reinforces common misconceptions (pink static map, benign handover, "we gave them railways").
- **1** Neutral; correct facts present but wrong models untouched.
- **2** One or two misconceptions explicitly contradicted in text.
- **3** Several common misconceptions named and refuted with evidence.
- **4** As 3, plus the learner is made to *commit* to the wrong belief first, then confronted with
  disconfirming evidence, and given a replacement model that explains more.
- **5** As 4, across at least eight distinct misconceptions, including at least one *sympathetic*
  oversimplification (e.g. "arbitrary borders explain everything").

**C8 — Transfer and historical thinking (weight 8).** Does the learner gain portable skill?
- **0** Nothing transferable.
- **1** Terms defined but not deployed.
- **2** Concepts (protectorate, informal empire) defined and used once.
- **3** Second-order concepts — causation, change and continuity, significance, evidence — are used
  explicitly and named.
- **4** As 3, plus the learner applies a concept to a fresh case within the artefact.
- **5** As 4, plus the learner could apply the analytic frame to a different empire or period, and
  can articulate the frame in their own words.

**C9 — Scale and quantitative sense (weight 7).** Do the numbers mean anything?
- **0** No quantities, or numbers so large they read as "lots".
- **1** Numbers present, unanchored, no comparison.
- **2** Some comparison to a familiar reference.
- **3** Key magnitudes conveyed with comparisons and visual encoding; the learner can estimate
  correctly afterwards.
- **4** As 3, plus uncertainty ranges given where real, with the reason for the uncertainty.
- **5** As 4, plus the learner reasons *with* the numbers — estimating, comparing, catching an
  implausible figure.

**C10 — Honesty about violence, contestation and historiography (weight 7).** Does it tell the truth
without turning into a pamphlet?
- **0** Euphemism, omission, or celebration; or pure denunciation with no evidence.
- **1** Violence acknowledged in passing; no historiographical awareness.
- **2** Major violence covered; a single settled interpretation presented as fact.
- **3** Conquest, slavery, famine and repression named plainly with evidence, specific and
  proportionate; disagreement among historians acknowledged.
- **4** As 3, plus at least two named historians in genuine disagreement, with the evidence at issue
  identified; contested numbers shown as ranges.
- **5** As 4, plus the learner can state the strongest version of a position they don't hold, and the
  artefact's own stance is declared rather than smuggled.

**C11 — Narrative coherence and voice (weight 5).** Is there one story, told by someone?
- **0** Disconnected fragments.
- **1** Chronological sequence with no through-line.
- **2** A stated theme, inconsistently carried.
- **3** A clear through-line that organises the material and is recoverable by the learner.
- **4** As 3, plus a distinctive, consistent voice and concrete human detail that makes it stick.
- **5** As 4, plus the learner can retell the whole story in five sentences, unprompted, correctly.

**C12 — Cognitive load, access and pace (weight 3).** Can a real 16-year-old actually use it in the
time available?
- **0** Overwhelming or unusable; inaccessible to keyboard/screen-reader users (for digital), or
  impenetrable prose density (for print).
- **1** Usable with significant effort; extraneous load throughout.
- **2** Mostly manageable; some split-attention or redundancy problems.
- **3** Well-paced, low extraneous load, complete in the stated time; accessible.
- **4** As 3, plus deliberate load management — worked examples before independent tasks, signalling,
  segmenting — and genuine accessibility (WCAG AA, keyboard, reduced-motion).
- **5** As 4, plus difficulty is *desirable* rather than accidental: effort is spent on the history,
  never on the interface.

**Disqualifiers (cap the total at 40/100 regardless of other scores):** any fabricated citation; any
factual error a specialist would call indefensible; any euphemism for mass violence that a reasonable
reader would call whitewashing; a claimed 30-minute experience that cannot be completed in 45.

---

## 7. VOICE AND ETHICS GUIDE

### 7.1 Six rules

1. **Name the agent.** Passive voice is where responsibility goes to hide. "Land was taken" → who
   took it.
2. **Use the plain word.** Conquest, killed, enslaved, seized, starved, deported. Not acquired,
   pacified, unrest, incident, tragedy, lost their lives.
3. **Quantify, and mark uncertainty honestly.** A range with a reason beats a confident round number.
   "Estimates range from X to Y because Z."
4. **People, not categories.** "The enslaved" is a condition imposed on people, not an identity;
   prefer "enslaved people". Never "slaves" as a noun for human beings except inside a quotation.
   Same logic: "colonised people", not "natives"; use historical terms only in quotation marks with
   a date and a note.
5. **Evidence before adjective.** If the fact is damning, the fact does the work. Adjectives invite
   the reader to argue with you instead of with the evidence.
6. **Never average moral claims into "mixed".** "It was a mixed legacy" is the phrase students write
   when they have nothing to say. Specify: who gained what, who lost what, when, and how we know.

**Banned strings in UI copy** (lint them): *acquired* (for conquest), *pacified*, *civilising
mission* (except in quotation marks, attributed), *native* (unquoted), *tribe*/*tribal* (unquoted;
prefer the people's own name), *unrest*, *the natives revolted*, *rich tapestry*, *played a key
role*, *left a lasting legacy*, *both sides*, *it is important to note*, *arguably*, *many would
say*, *the empire on which the sun never set* (except when we are explicitly examining the slogan).

**Also banned: the opposite failure.** *Genocidal* without a sourced argument for that specific term
and case; *Britain's Holocaust*; *always/never* claims about British motive; *evil*; any sentence
whose evidence is the writer's indignation. We are trying to make students angry at *the evidence*,
which lasts, not at *us*, which doesn't.

### 7.2 Ten rewrites

**1. Conquest as acquisition**
- ✗ *Britain acquired Bengal in 1765.*
- ✓ *After defeating the Nawab's army at Plassey in 1757, the East India Company forced the Mughal
  emperor to grant it the Diwani of Bengal in 1765 — the right to tax roughly 20 to 30 million
  people. A shareholder company had become a government.*
- *Why:* "acquired" makes conquest sound like shopping, hides the agent (a company, not the state),
  and drops the mechanism the student actually needs (T7).

**2. Slavery in the passive**
- ✗ *Slaves were transported to the Caribbean to work on plantations.*
- ✓ *British merchants and shipowners forced about 3.4 million African people onto ships; roughly
  2.6 to 2.8 million survived the crossing. Those who arrived were sold to planters in Jamaica,
  Barbados and the mainland colonies, and worked until they died.*
- *Why:* names the agents, restores the people, gives the magnitude and the mortality gap, and
  refuses "slaves" as a noun.

**3. Famine as weather**
- ✗ *A terrible famine struck Bengal in 1943, killing millions.*
- ✓ *Between two and three million people died in Bengal in 1943. The rice harvest had been damaged,
  but grain was still moving out of the province, boats had been destroyed under a wartime denial
  policy, and the imperial government in London refused most of the shipping the Viceroy asked for.
  Amartya Sen's* Poverty and Famines *(1981) argues the deaths came from collapsing entitlements —
  who could afford food — not from an absolute shortage of it.*
- *Why:* "struck" makes policy into meteorology. The rewrite gives the mechanism, the decision-makers
  and the interpretive frame, and it cites a real book for a real argument.

**4. Massacre as incident**
- ✗ *There was an incident at Amritsar in 1919 in which a number of protesters lost their lives.*
- ✓ *On 13 April 1919 at Jallianwala Bagh in Amritsar, troops under Brigadier-General Reginald Dyer
  fired for about ten minutes into a crowd penned in an enclosure with few exits. The official
  Hunter Commission counted 379 dead and about 1,200 wounded; Indian estimates were considerably
  higher. Dyer was relieved of command, and a public subscription in Britain raised a large sum in
  his honour.*
- *Why:* date, place, agent, duration, geography, disputed numbers, and the British reaction — which
  is the part that explains what happened to Indian opinion afterwards.

**5. Resistance as irrationality**
- ✗ *The Indian Mutiny of 1857 saw native troops rebel against their British officers.*
- ✓ *In 1857 sepoys of the Bengal Army mutinied at Meerut and marched on Delhi, where they proclaimed
  the Mughal emperor Bahadur Shah Zafar their sovereign. Peasants, dispossessed landholders and
  rulers such as Rani Lakshmibai of Jhansi joined them. Indian historians generally call it the
  first war of independence; British accounts long called it the Mutiny. What you call it is an
  argument about what it was.*
- *Why:* "mutiny" and "native" pre-judge. The rewrite names participants, shows the political
  programme, and turns the naming dispute into a teaching moment.

**6. Independence as a gift**
- ✗ *Britain granted India its independence in 1947.*
- ✓ *India became independent on 15 August 1947, after six decades of organised campaigning by the
  Indian National Congress and others, mass civil disobedience from 1920, the Quit India movement of
  1942, mutinies in the Royal Indian Navy in 1946, and a British government that had emerged from
  the war effectively bankrupt. Britain set the date and drew the border; it did not choose whether
  to go.*
- *Why:* kills M6 in one paragraph. Note it still concedes what Britain did control — the timing and
  the line — which is the accurate, and more damning, version.

**7. Partition without agents or scale**
- ✗ *Partition was a tragic event that led to violence between communities.*
- ✓ *The boundary between India and Pakistan was drawn in about five weeks by Cyril Radcliffe, a
  British lawyer who had never visited India, and was published two days after independence. Between
  ten and twenty million people fled across it. Estimates of the dead range from several hundred
  thousand to around a million; no one counted at the time.*
- *Why:* "communal violence" as an explanation implies ancient hatreds. Naming the process, the
  timing and the uncertainty gives students something to reason with.

**8. Counter-insurgency as policing**
- ✗ *The Mau Mau uprising in Kenya was suppressed by the authorities in the 1950s.*
- ✓ *Between 1952 and 1960 the colonial government in Kenya detained tens of thousands of Kikuyu
  people in camps, hanged over a thousand, and moved much of the rural population into guarded
  villages. Caroline Elkins's* Britain's Gulag *(2005) argues the scale was far larger than
  officially admitted; her highest estimates are disputed by other historians. In 2011 the Foreign
  Office admitted holding thousands of hidden colonial files at Hanslope Park, and in 2013 the
  British government paid £19.9 million to 5,228 Kenyan claimants and expressed regret.*
- *Why:* names what was done, cites the historian and the dispute honestly, and ends on documented
  British admissions — which no reader can dismiss as bias.

**9. Polemic replaced by evidence**
- ✗ *The British looted India and destroyed its economy, stealing trillions in one of history's
  greatest crimes.*
- ✓ *India's share of world manufacturing output fell from roughly a quarter in 1750 to a few per
  cent by 1900, on Paul Bairoch's estimates, while Britain's rose. Shashi Tharoor's* Inglorious
  Empire *(2017) argues British policy caused this: tariffs against Indian textiles, taxes remitted
  to Britain, and railways built on returns guaranteed to British investors at Indian expense.
  Others argue that global industrialisation would have eroded India's handloom sector regardless.
  The figures are reconstructions with wide margins — which is exactly what the argument is about.*
- *Why:* same accusation, but now the student can *use* it: there is a number, a named advocate, a
  named counter-argument, and a stated uncertainty. Polemic ends an inquiry; evidence starts one.

**10. Balance as evasion**
- ✗ *The empire had both positive and negative aspects, and historians continue to debate its
  overall legacy.*
- ✓ *Empire built railways, universities and law courts, and it built them to move goods to ports,
  train clerks and enforce its own rule. The same decades saw famines that killed millions and
  wealth transferred to Britain. Historians disagree about the balance — Niall Ferguson's* Empire
  *(2003) stresses the institutions Britain spread; Shashi Tharoor and Jon Wilson stress the
  extraction and the disorder — but they disagree about weighting, not about whether these things
  happened. Decide what you think, and say which evidence moved you.*
- *Why:* replaces the sentence that means nothing with named positions, concrete instances, and a
  task. This is also the model answer we want in an exam.

### 7.3 Special-care rules

- **Enslaved people's names.** Where we know a name — Sam Sharpe, Nanny of the Maroons, Olaudah
  Equiano, Mary Prince — use it. Anonymity is a consequence of the record-keeping we are describing;
  say so once, explicitly, in the Atlantic chapter.
- **Images.** No photographs of atrocity as decoration. Images of violence appear only where they
  are the evidence under discussion, are captioned with who made them and why, and are never
  auto-playing or used as a background. Photographs of colonised people made for imperial display
  (ethnographic "types", postcards) are labelled as such.
- **Indigenous peoples.** Use current preferred names (First Nations, Inuit, Métis; Aboriginal and
  Torres Strait Islander peoples; Māori; and specific nations where known — Wiradjuri, Xhosa, Asante,
  Igbo). "Discovery" and "settlement" of inhabited land always carry the prior inhabitants in the
  same sentence.
- **Britain's own divisions.** Ireland is inside this story, not a footnote to it. Scots, Welsh and
  Irish people were disproportionately present as soldiers, administrators, migrants and settlers —
  and Ireland was also governed as a colony. Say both.
- **Contested numbers get ranges.** Bengal 1770, Irish famine emigration, the late-Victorian Indian
  famines, Mau Mau, Partition, peak imperial area. Range + reason + source. Every time.
- **No comparative-suffering league tables.** We never write "worse than" or "not as bad as" about
  atrocities. We give the evidence and let the student think.

---

## 8. THE LESSON — A TWO-LESSON UNIT

**Amended, wave 9 (see §9.4).** This section used to be called "the 30-minute lesson" and to
describe one path. It now describes a **two-lesson unit**. §8.0 states the arithmetic that forced
the change, in the open, because a specification that hides its own arithmetic is how we spent two
waves asking builders for something that could not be built.

### 8.0 Why this is a unit, and not a lesson

Wave 7 built a genuinely thirty-minute route, priced honestly at the slow reading rate. It carried
**eight** of §3's twenty against §3's own floor of fourteen, and all four critics flagged the
shortfall. The app's cost model — `app/js/tours/budget.js`, the only place in the repository where
a duration is computed — has since been asked the question directly, by exhaustive search over the
authored beats: **inside 1,800 seconds at 110 words a minute, with one Complication Gate, the
ceiling on beat-taught coverage is roughly seven to nine of the twenty.**

It is nine and not fourteen for a reason that is not fixable by better cutting. Two of the twenty
are expensive because their hooks are the expensive part: T3's embarked-versus-landed chart costs
458 seconds inside the Atlantic beat that hosts it, and T7's revenue loop with the army figure
inside it costs 524. Those two are 982 seconds — over half a period — and they are the last two
things in this app anyone should delete.

**So §8's thirty minutes and §3's fourteen were never both satisfiable by one artefact.** That is a
contradiction in this document, not a defect in the build. It is resolved here the way a real scheme
of work resolves a topic this size:

- **A lesson** is one school period: about **30 minutes of screen at the SLOW reading rate**. The
  binding test is `budgetMinutes(steps, SLOW_WPM) ≤ 30`, and nothing else — a route that fits only
  if the class reads at 180 words a minute does not fit. Thirty minutes of screen inside a
  50-minute period leaves the room its 20 minutes for settling, talk, writing and packing away.
- **The unit is two lessons**, and **together they clear §3's floor of fourteen**. §3.1 assigns
  seventeen of the twenty across them. The published demotion order (§3.1) is bounded: its expected
  case is seventeen, its worst case is exactly fourteen, and it can never go below, because the
  per-lesson floors are seven and eight and the two lessons share only T1.
- **The full route stays**, for a student who wants the whole thing in one sitting and for a teacher
  with a double period. It is not the default, and it never claims a period.
- **Each lesson is a whole thing** — its own beginning, its own argument, its own ending, its own
  Close and its own signable through-line. Not half a lesson and a cliffhanger. §8.4 enforces this.

**This document states the ORDER and the PAYLOAD. `budget.js` states the LENGTH.** Where they
disagree, `budget.js` is right and the route is cut against §3.1's demotion order. **No minute
figure in §8 is normative**; the ones below are illustrations of the arithmetic at wave-9 beat
lengths, and every duration a student or a teacher ever sees is computed, never retyped.

---

### LESSON ONE — *How it was taken*

**Phases I and II.** Carries **T1, T2, T3, T4, T5, T6, T7, T8**. Repairs M1, M4 (colour and year),
M8, M2, M9. Serves LO1, LO3, LO5, LO6. Floor: seven of the twenty (§3.1).

**Its through-line, completed and signed at its own Close:**
> "Britain's empire began as sugar islands worked by enslaved Africans, and as a shareholder company
> that found taxing people paid better than trading with them."

That is the first half of §2.3's sentence, and it is a complete sentence standing on its own. The
student signs *this* one. §2.3 entire belongs to the unit, not to either lesson (§8.4).

**The beats, in order.** Percentages are shares of the lesson's own budget, not wall-clock promises.

1. **The hook: the map that lies.** `[T1, M4, LO4]` Land on the classic pink world map, 1921,
   unlabelled. One question: **[PREDICT]** *"Roughly what share of the world's people did Britain
   rule at this moment?"* Slider, commit, no answer yet. Then one line: *"This map is a poster.
   Three things about it are misleading. You will find two of them in this lesson and the third in
   the next."* No menu, no tour of the UI, no welcome. *The hook is a question the student has
   committed an answer to — Loewenstein's gap theory, and the reason prediction beats exposition as
   an opener.* **The promise must match the lesson.** The old copy promised three misleads in one
   sitting; a lesson that delivers two must say two.
2. **The spine, stated.** `[T1, LO1]` The four-colour band appears beneath the map. A 25-second
   animated sweep 1600→1997, one clause per phase, then the whole spine as one paragraph readable
   in 40 seconds. The map redraws once in equal-area with one sentence saying so — the projection
   mislead, delivered rather than named — and Mercator is restored on the next beat.
   **[RETRIEVE]** drag the four phase names onto the timeline; wrong drops snap back with the
   *driver* shown, not the answer.
3. **Three islands, three crops — and the crossing.** `[T2 + T3, LO5]` The map runs Chesapeake →
   Barbados → Jamaica while the sugar-export curve climbs. Then the flow map inside the same beat:
   arrow width *is* the number, and the gap between embarked and disembarked is drawn as a visible
   loss, sourced to the Trans-Atlantic Slave Trade Database.
4. **They never stopped.** `[T4, M8]` The resistance layer switches on and cannot be switched off:
   Tacky 1760, Haiti 1791, Barbados 1816, Demerara 1823, the Baptist War 1831–32 under Sam Sharpe.
   Abolition is dated *after* Sam Sharpe on the same axis, so the order is unmissable.
5. **COMPLICATION GATE.** The African supply side — the complication that damages the sympathetic
   simplification beat 4 invites. Next is disabled until the student places it. Any placement
   advances; there is no right answer and the app says so; declining is a named, recorded choice.
6. **The ledger.** `[T5, M8]` £20,000,000 to owners / £0 to the people freed, side by side, with
   1807, 1833/34, 1838 and the loan finally repaid in 2015 on one axis. Links to the UCL *Legacies
   of British Slave-ownership* database.
7. **Who conquered Bengal?** `[T6, M2]` **[PREDICT]** four options — Royal Navy, British Army, a
   London shareholder company, Parliament — commit, then the reveal is the charter of 31 December
   1600. The India dossier opens with a company seal, not a crown.
8. **The loop.** `[T7 + T8, LO3, M2, M9]` Plassey 1757, then the Diwani of Bengal 1765 — the right
   to tax perhaps 20 to 30 million people. Then the mechanism diagram, which is the centre of the
   whole app: step *revenue → sepoys → conquest → more revenue*, then **break it** — remove Bengal's
   revenue and watch the conquest stall. Inside the same beat, **[PREDICT]** the army's composition
   before the dot chart reveals it. *This is the longest beat in the unit, deliberately. If a
   student remembers one mechanism from this app, it is this one.*
9. **Close (§8.4).** Lesson One's own ending: what they can now defend, in their own numbers; the
   through-line above, completed in their words and signed; and what Lesson Two is *for*.

**The arithmetic, stated.** At wave-9 beat lengths this list costs **1,877 seconds** at 110 words a
minute — 77 seconds over a period. **Close it with a trim, not a demotion:** the `resistance` beat
is 470 words, the longest non-mechanism beat in the unit, and 140 words out of it is 77 seconds.
Only if that trim fails does T6 demote (its reveal, the 1600 charter, survives as the opening clause
of the loop beat), and T5 never demotes.

---

### LESSON TWO — *How it was ruled, and how it ended*

**Phases III and IV.** Carries **T9, T11, T13, T14, T15, T18, T19, T20**, plus **T12** where the
budget allows it, and restates **T1**. Repairs M4 (the single colour), M3, M6, M10, M13, M14, M16.
Serves LO2, LO7, LO8, LO12. Floor: eight of the twenty (§3.1).

**Its through-line, completed and signed at its own Close:**
> "It turned into a global system painted one colour on a map that hid a dozen kinds of rule, and it
> came apart between 1942 and 1997 because the people it ruled organised, and Britain went broke."

The second half of §2.3, and again a complete sentence on its own. A student who did Lesson One last
week has now signed both halves; the unit Close is where they become one sentence (§8.4).

**The beats, in order.**

1. **The spine, restated.** `[T1, LO1]` Not the pink hook again — a 40-second re-entry: the
   four-colour band, where we got to (a company is the government of Bengal), and the third mislead
   named as this lesson's business. A student arriving here without Lesson One is offered it in one
   press and is not blocked.
2. **Nationalisation.** `[T9, M2]` 1857–58: rebellion across northern India, the Company abolished,
   the Crown taking over under the Government of India Act 1858, Victoria proclaimed Empress in
   1876. The India polygon changes ownership colour while the student watches, with the legal
   instrument named on the card. **This beat is Lesson Two's beginning and it is load-bearing:** it
   is the hinge between Phase II and Phase III, and it is the ending of the machine Lesson One built.
3. **British India was never all of India.** `[T11, LO2, M9]` Two fills; toggling "show princely
   states" visibly shrinks direct rule across 565 of them. Names T10 in the same paragraph and puts
   it one press away (§3.1).
4. **How Britain took Africa.** `[T13, M10, LO4]` **Required. This item may not be demoted, moved to
   extension, or delivered by a recall, a pin or a Close line.** Africa 1870→1914 plays across the
   map, then the Berlin Conference of November 1884 – February 1885, at which no African state was
   represented, and the "effective occupation" rule; then the two texts side by side — what the
   chief was told, and what the English version said. And the counter-line, unskippably: Berlin
   wrote a rulebook for a race run on the ground, with guns, over twenty years, against people who
   fought back — Isandlwana 1879, four Asante wars, Adwa 1896. *An atlas of the British Empire whose
   taught route never shows the Scramble is not finished, and no budget argument overrides this.*
5. **Given, and refused.** `[T15, M6]` The two-track timeline in one frame: self-rule given above the
   line — Durham 1839, Canada 1867, Australia 1901, New Zealand 1907, South Africa 1910, Balfour
   1926, Westminster 1931 — and refused below it, in the same years, to Indian and African subjects.
   Race is named as the operative criterion, with evidence. The asymmetry is the lesson.
6. **COMPLICATION GATE**, aimed by the Ledger at the claim this student has just made.
7. **February 1942.** `[T19, M3, M16]` Singapore: about 80,000 troops surrendered to a smaller
   Japanese force, and Quit India began that August. The prestige on which Asian rule rested is
   gone. The war-service layer names who actually fought — roughly 1.4 million Indians in the first
   war, about 2.5 million volunteers in the second, and African troops in Burma and East Africa.
8. **How they left, and when it was biggest.** `[T18 + T14, LO7, LO8, M14]` The "who" ribbon —
   Naoroji, Gandhi, Ambedkar, Jinnah, Nkrumah, Kenyatta, Kimathi, Aung San — a face, a name and one
   sentence each. Then **[PREDICT]** the exits coloured by *how* they happened, not when, and the
   map comes back mostly not the colour students guessed: Partition's ranges, Malaya, Kenya with the
   2011 Hanslope Park disclosure and the 2013 settlement, Suez, Rhodesia's UDI. Inside the same
   beat, the counted figure: **[PREDICT]** when the empire was largest, and the peak draws to the
   *right* of 1914.
9. **What is still British.** `[T20, LO12, M13]` 1997 fades and fourteen dots remain, clickable,
   dated to today: what is still British, what is still disputed, what was settled recently and by
   whom.
10. **Close (§8.4).**

**Where T12 goes.** *Egypt: one place, four legal labels* — veiled protectorate 1882, protectorate
1914, nominally independent kingdom with British troops 1922, 1956 — is the best single piece of
legal-status teaching in the app and it costs 170 seconds. It is **assigned to Lesson Two and is the
first item on the demotion order**, because if it must go, LO2 is still served by T11's paramountcy,
by the status recolour that shatters the single pink across the whole map, and by the dossier's
legal-status field, which fires on every territory a student opens.

**The arithmetic, stated.** With T12, this list costs **2,054 seconds** — 254 over. Close it in this
order, and stop as soon as it closes: (i) trim `scramble` (340 words) and `nationalisation` (320
words) by 230 words together, −126s; (ii) trim the counted figure inside the exits beat (606 words)
by 130 words, −71s; (iii) demote **T12**, −170s; (iv) and only then **T15**, −136s. Without T12 the
list is **1,839 seconds** and needs a 72-word trim alone. The floor is eight items and the demotion
order cannot breach it.

---

### THE FULL ROUTE

Both lessons end to end, plus the essay panels, the arguments between historians, the worked exam
paragraphs and one regional deep-dive. It is offered on the first beat of either lesson, it prints
its own honest length, and **it never calls itself a lesson**. It is the only route that must reach
**all twenty** of §3. Until beats exist for T10 and T16, its card names those two as its own
shortfall, by name, in the same sentence that states its coverage — a route that names what it
misses is telling the truth; a route that omits silently is not.

---

### 8.1 Load profile and why the order is this order

- **Worked example before independent task, always.** The Company chapter shows the full mechanism
  before the student is asked to reconstruct anything. Reversing this — "explore and discover" —
  reliably fails novices (Kirschner, Sweller & Clark, 2006, on minimal guidance).
- **The heaviest content sits at minutes 10–16, not at the start or end.** Attention and working
  memory are best in the second third of a short session, once orientation is done and before fatigue.
- **Spacing is built in.** Every T-item introduced before minute 16 is retrieved again after minute
  22. Cepeda et al.'s (2006) meta-analysis is the basis: the gap should scale with the retention
  interval we care about, which here is "next week's lesson".
- **Prediction before reveal, five times.** Committing to a wrong answer and being corrected beats
  reading the right answer — the hypercorrection effect, and the core of misconception repair (§4).
- **One idea per beat.** Any beat carrying two T-numbers is over budget and must be split or cut.
- **The map never disappears.** All new information attaches to one persistent spatial object. This
  is the app's single biggest schema advantage over a book, and it is lost the moment we push a
  full-screen modal.
- **Every clock in this subsection is per lesson, not per unit.** "Minutes 10–16" and "after minute
  22" are positions inside *one* 30-minute lesson and are read that way by `quiz/checkpoint.js`.
  Spacing across the two lessons is a different and better thing — a week, usually — and §3.2
  governs what may be asked on the strength of it.

### 8.2 Variants the tours agent must ship

- **Lesson One** and **Lesson Two** above. **Lesson One is the default** — a cold start runs it —
  and every surface says which lesson it is (§8.5).
- **The full route**: both lessons end to end plus the essay panels, the arguments between
  historians, the worked exam paragraphs and one regional deep-dive. It is offered on the first beat
  of either lesson. It never calls itself a lesson and never claims a period.
- **The 8-minute version** (assembly, cover lesson, first taste): the poster, the spine, the Company
  mechanism, the exit-type map, the close. Same spine, five beats, no quiz beyond two items. It is
  a taste, not a lesson, and its card says so.
- **The free-explore mode**, reachable at any time from any beat, which never blocks anything and
  which keeps the spine band on screen so a wandering student always knows where they are in the story.

### 8.3 What we measure to know it worked

Instrumented locally, no accounts, no network — this is an offline app and stays one.
1. Completion rate **per lesson**, reported per lesson and never averaged into one figure.
2. First-attempt accuracy per T-item (find the items nobody retains and fix the *teaching*, not the
   question).
3. Prediction-error rate at each `[PREDICT]` (if students guess right at the opening, the hook is
   too easy and the misconception isn't being activated).
4. Whether each lesson's own through-line gets completed and signed at its Close.
5. Post-session exploration: did they keep going after the Close? The BRIEF names this as part of
   the bar, so it is a metric, not a nicety.
6. **Whether Lesson Two was ever reached** — the one number that says whether the unit is a unit or
   a lesson with an orphan. It is written to the same fixed schema, locally, and it is not a
   judgement of the student.

### 8.4 THE CLOSE RULE — what each lesson's Close must offer

**Normative, verbatim.** A Close is an ending, not a progress bar. A student who finishes Lesson One
has finished something, and the Close must say so before it says anything else.

1. **It opens by naming what was finished, in words, and the words are true.** *"You have finished
   Lesson One: how it was taken."* Never a percentage, never "9 of 20", never a fraction of a unit,
   never a bar with an unfilled remainder. The first sentence is an achievement and it is stated as
   one.
2. **Finishing is reaching the last beat.** It is never conditional on a quiz score, a signature, a
   gate placement or a completed sentence. A student who answered nothing correctly has still
   finished the lesson, and the Close says so first and tells them what they missed second.
3. **It completes and signs THIS LESSON'S own through-line** — the sentence printed in §8 under that
   lesson, in the student's own words. §2.3's full sentence belongs to the **unit** and may be
   offered for signing only at the unit Close (7) or at the end of the full route. A lesson must
   never present a sentence it cannot earn, and must never present §2.3 with the other lesson's half
   greyed out.
4. **It prints what this student can now defend, in full, in their own evidence** — their numbers,
   their first wrong guesses, their gate placements, their recorded dissent. This is the existing
   Any-Exit Close behaviour, scoped to *this lesson's* lines. **Grey lines belong to the unit Close,
   not to a lesson's.** Inside a lesson, a line this lesson was never going to reach is not a gap in
   the student's work and must not be drawn as one.
5. **It names the other lesson as a subject, not as a deficit.** The sentence is *"Lesson Two covers
   how Britain ruled what it had taken and how it lost it: 1857 and the Crown, the 565 princely
   states, the Scramble and Berlin 1884–85, who was given self-rule and who was refused, February
   1942, how the exits actually happened, and what is still British"* — with a control that starts
   it. Banned in this slot: *incomplete*, *unfinished*, *you missed*, *remaining*, *left to go*, any
   percentage, and any progress meter. A student who does one lesson and no more has done a whole
   lesson.
6. **It names, by name and with one press each, the items this lesson raised but did not teach** —
   the §3.1 extension items hosted by its beats. Lesson One names Bengal 1770 as the loop's first
   product (T16) and the crossing's African supply side. Lesson Two names the thousand ICS officers
   over three hundred million (T10), Amritsar 1919 (T17), famine as policy (T16), and Egypt's four
   labels (T12) whenever the demotion order has taken it. Naming a thing you did not teach, and
   putting it one press away, is honest; leaving it unnamed is not.
7. **The unit Close exists and fires once.** A student whose record shows both lessons finished gets
   it, whether they did them a week apart or in one sitting: it is the only surface that completes
   §2.3 entire, prints the unit's coverage against §3's floor of fourteen by name, and greys what
   the *unit* never reached with its price in seconds. How they got there is recorded and never
   judged.
8. **The printable revision sheet** carries this lesson's name and date, this lesson's signed
   through-line as its header, what they got right, what they missed and where to look — plus one
   line naming the other lesson, so a teacher filing two sheets can see they are two halves of one
   unit. On the unit Close, the sheet is one sheet for the unit.
9. **It ends where it always ended:** *"Three things you could go argue with. Here's where to
   start."* — three `[EXT]` entry points and three real books, chosen for the lesson just finished.

### 8.5 The labelling law

Every surface that names a route says **which lesson it is, what it covers, and what the other one
covers**. That is: the door, the route card, the statusbar, the Close, the printed revision sheet,
the teacher's pack, the deep link's own title, and any sentence anywhere that quotes a duration.

- The name is the lesson's name — "Lesson One: how it was taken" — never "the lesson", never "the
  guided path", never a bare duration.
- The coverage sentence names §3 items in words, not counts, and states the unit total beside the
  lesson total, so neither number can be read as the other.
- A deep link into a beat resolves to the lesson that owns that beat and says so on arrival.
- No surface may print a duration this document invented. Every one is read from `budget.js`.

---

## 9. APPENDIX

### 9.1 Works cited in this spec

All real; verify before adding any others. `docs/SOURCES.md` is the fuller bibliography and owns
edition details.

**General and synthetic**
- Wm. Roger Louis (gen. ed.), *The Oxford History of the British Empire*, 5 vols (OUP, 1998–99):
  I *The Origins of Empire* (ed. Nicholas Canny); II *The Eighteenth Century* (ed. P.J. Marshall);
  III *The Nineteenth Century* (ed. Andrew Porter); IV *The Twentieth Century* (eds. Judith M. Brown
  and Wm. Roger Louis); V *Historiography* (ed. Robin W. Winks).
- John Darwin, *The Empire Project: The Rise and Fall of the British World-System, 1830–1970* (2009);
  *Unfinished Empire: The Global Expansion of Britain* (2012); *After Tamerlane* (2007).
- C.A. Bayly, *Imperial Meridian: The British Empire and the World 1780–1830* (1989);
  *The Birth of the Modern World, 1780–1914* (2004).
- Philippa Levine, *The British Empire: Sunrise to Sunset* (2007) — the best short single-volume
  student text; our nearest "coursebook" benchmark.
- Ronald Hyam, *Britain's Declining Empire: The Road to Decolonisation, 1918–1968* (2006).
- David Cannadine, *Ornamentalism: How the British Saw Their Empire* (2001).
- P.J. Cain and A.G. Hopkins, *British Imperialism*, 2 vols (1993; revised single-volume editions
  since) — the gentlemanly-capitalism thesis.
- John Gallagher and Ronald Robinson, "The Imperialism of Free Trade", *Economic History Review*
  (1953); Robinson and Gallagher, *Africa and the Victorians* (1961).
- Linda Colley, *Britons: Forging the Nation 1707–1837* (1992); *Captives* (2002).
- Bernard Porter, *The Absent-Minded Imperialists* (2004), against Catherine Hall and Sonya Rose
  (eds.), *At Home with the Empire* (2006) and John M. MacKenzie, *Propaganda and Empire* (1984).
- Dane Kennedy, *The Imperial History Wars* (2018) — on how these disputes are conducted.
- Niall Ferguson, *Empire: How Britain Made the Modern World* (2003) — included as the position we
  present fairly and disagree with in part.

**Atlantic, slavery, abolition**
- Eric Williams, *Capitalism and Slavery* (1944).
- David Eltis and David Richardson, *Atlas of the Transatlantic Slave Trade* (2010), and the
  Trans-Atlantic Slave Trade Database (slavevoyages.org) — our source for T3's figures.
- Catherine Hall, Nicholas Draper, Keith McClelland, Katie Donington and Rachel Lang, *Legacies of
  British Slave-Ownership* (2014), and the UCL database of the same name — our source for T5.
- Catherine Hall, *Civilising Subjects* (2002).
- Olaudah Equiano, *The Interesting Narrative* (1789); Mary Prince, *The History of Mary Prince* (1831).

**India and Asia**
- P.J. Marshall, *The Making and Unmaking of Empires: Britain, India, and America c.1750–1783* (2005).
- Jon Wilson, *India Conquered: Britain's Raj and the Chaos of Empire* (2016).
- Shashi Tharoor, *Inglorious Empire: What the British Did to India* (2017; published in India as
  *An Era of Darkness*, 2016).
- Nicholas B. Dirks, *The Scandal of Empire* (2006).
- Ranajit Guha, *Elementary Aspects of Peasant Insurgency in Colonial India* (1983).
- Amartya Sen, *Poverty and Famines: An Essay on Entitlement and Deprivation* (1981).
- Yasmin Khan, *The Great Partition: The Making of India and Pakistan* (2007); *The Raj at War* (2015).

**Africa, war, decolonisation**
- Frederick D. Lugard, *The Dual Mandate in British Tropical Africa* (1922) — a primary source, read
  as such.
- Caroline Elkins, *Britain's Gulag: The Brutal End of Empire in Kenya* (2005; US title *Imperial
  Reckoning*); *Legacy of Violence: A History of the British Empire* (2022).
- David Anderson, *Histories of the Hanged: Britain's Dirty War in Kenya and the End of Empire* (2005).
- Frederick Cooper, *Africa Since 1940: The Past of the Present* (2002); *Colonialism in Question* (2005).
- Ashley Jackson, *The British Empire and the Second World War* (2006).
- Priyamvada Gopal, *Insurgent Empire: Anticolonial Resistance and British Dissent* (2019).
- Richard Gott, *Britain's Empire: Resistance, Repression and Revolt* (2011).
- Mike Davis, *Late Victorian Holocausts: El Niño Famines and the Making of the Third World* (2001) —
  cite with its critics noted.

**Learning science and history education**
- Henry L. Roediger III and Jeffrey D. Karpicke, "Test-Enhanced Learning" (*Psychological Science*, 2006).
- John Dunlosky et al., "Improving Students' Learning With Effective Learning Techniques"
  (*Psychological Science in the Public Interest*, 2013).
- Nicholas J. Cepeda et al., "Distributed Practice in Verbal Recall Tasks: A Review and Quantitative
  Synthesis" (*Psychological Bulletin*, 2006).
- Robert A. Bjork on desirable difficulties; Richard E. Mayer, *Multimedia Learning*; John Sweller on
  cognitive load; Allan Paivio on dual coding.
- Paul A. Kirschner, John Sweller and Richard E. Clark, "Why Minimal Guidance During Instruction Does
  Not Work" (*Educational Psychologist*, 2006).
- Michelene T.H. Chi and Stella Vosniadou on conceptual change.
- Melanie C. Green and Timothy C. Brock on narrative transportation (2000).
- Sam Wineburg, *Historical Thinking and Other Unnatural Acts* (2001).
- Peter Seixas and Tom Morton, *The Big Six Historical Thinking Concepts* (2013).

### 9.2 The contested-number register

Every figure here renders with its range and a "why is this disputed?" affordance. This list is
normative for the data agent; adding a contested number without registering it fails QA.

| Figure | What we show | Why it's disputed |
|---|---|---|
| Africans embarked on British ships | c.3.4m embarked, c.2.6–2.8m disembarked | Voyage records are incomplete; the database is a reconstruction with documented coverage estimates |
| Bengal famine 1770 deaths | wide range, often given as up to a third of Bengal's population | No census; contemporary estimates are political documents |
| Irish famine 1845–52 | c.1m dead, c.1m emigrated | Death registration was partial; excess mortality is modelled |
| Indian famines 1876–78, 1896–1902 | multi-million ranges | Colonial mortality reporting was incomplete; baselines differ |
| Bengal famine 1943 | c.2–3m | Different demographic methods; disagreement over the window counted |
| Amritsar 1919 | 379 official; Indian estimates higher | The official count came from a commission with limited access |
| Mau Mau detentions and deaths | tens of thousands detained; total excess deaths strongly contested | Records were destroyed and removed; Elkins's estimate is challenged demographically |
| Partition deaths and displacement | several hundred thousand to c.1m dead; 10–20m displaced | No counting authority existed during the movement |
| Peak imperial area | roughly a quarter of world land, c.1920–22 | Depends on whether mandates, protected states and Antarctic claims count |
| India's share of world output | Maddison/Bairoch series | Pre-modern national accounts are reconstructions with wide error bars |

### 9.3 Amendment procedure

Propose changes as a diff to this file with a one-paragraph justification citing evidence or
learning-science grounds, plus the list of downstream artefacts affected. Anything touching §2
(the spine), §3 (the twenty) or §6 (the rubric) requires re-running the comparison rubric afterwards,
because those three sections are what the critics score us on.

### 9.4 Amendment log

**Wave 9 — 2026-09-06 — the empire becomes a two-lesson unit.**
*Sections amended:* the one-sentence test; §0 conventions and the §3/§8 pointers; §1's opening line;
§3's spacing plan and its two agent rules; **new §3.1** (the floor, and which artefact it applies
to; the division of the twenty; T13 required and undemotable; extension as a promise); **new §3.2**
(the spaced recall rule); **§8 in full**, including new §8.0, the two lesson scripts, the full route,
amended §8.2 and §8.3, and **new §8.4** (the Close rule) and **§8.5** (the labelling law); §5.3's
pointer to §8.
*Sections deliberately untouched:* §2 (the four-empire spine), §4 (the eighteen misconceptions),
§6 (the rubric — including its disqualifier, which now binds each lesson separately: a lesson
claimed at 30 minutes that cannot be completed in 45 still caps the artefact at 40/100), §7 (voice
and ethics), §9.1, §9.2.

*Why.* §8 asked for a thirty-minute lesson and §3 asked that lesson for fourteen of the twenty
must-stick items. `app/js/tours/budget.js` — the repository's only cost model — was asked the
question by exhaustive search over the authored beats, and the answer is that **inside 1,800 seconds
at 110 words a minute, with one Complication Gate, beat-taught coverage tops out at roughly seven to
nine of the twenty.** Not because the route is badly cut: T3's crossing chart and T7's revenue loop
with the army figure inside it cost 458 and 524 seconds between them, and they are the two hooks
this app would defend last. Wave 7 obeyed §8 and fell to eight items; all four critics flagged it
against §3's floor; wave 8 tried again and hit the same wall. **The contradiction was in this
document, and two waves were spent paying for it.** The resolution is the one any real scheme of
work reaches with a topic this size: two lessons, each a whole thing, together clearing the floor.
Seventeen of the twenty are assigned to lessons, under a bounded demotion order whose worst case is
exactly §3's fourteen (per-lesson floors of seven and eight, sharing only T1), and three (T10, T16,
T17) are assigned to extension with four binding conditions each, so that "extension" cannot become
a bin.

*What this fixes that was a live defect, not a design change.* (a) The default route inserted a
spaced recall asking for a 1943 famine figure that no beat on that route teaches, and told the
student it was a number "this lesson has named" — §3.2 forbids it and requires it removed. (b) The
default route and its Close omitted how Britain took Africa entirely; T13 is now required and
undemotable, taught by a beat the student walks. (c) A student finishing a short route was shown
grey lines and an unearned fraction of §2.3's sentence; §8.4 gives each lesson its own signable
through-line and moves grey lines to the unit Close, where they are true.

*Downstream artefacts affected.* `docs/FEATURE_SPEC.md` (charge 2, the Any-Exit Close; charge 11,
the gates; P05, P21); `app/js/tours/tours.json` (`variants`, `variantMeta`, `recallAfter` on
`revenue-loop`, and the prose trims priced in §8); `app/js/tours/budget.js` (`MUST_STICK_FLOOR`
becomes per-artefact; `PERIOD_MINUTES` unchanged); `app/js/quiz/{checkpoint,adaptive,items}.js`
(§3.2's three tests); `app/js/close/*` (§8.4); `app/js/onboarding/*`, `app/js/chrome/*` and
`app/js/teacher/*` (§8.5); `tools/check-timing.js` (per-lesson fit) and a new checker for §3.2.

*Rubric re-run required.* Yes — §9.3 requires it for anything touching §3, and §3.1 and §3.2 are
new. Re-run §6 against Lesson One, Lesson Two and the full route separately, and record which
artefact each score belongs to.
