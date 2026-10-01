# Journey map: historical semantics and change feedback

Audit performed 1 October 2026. This document concerns `/app/journey/` only. The previous `/app/` and `/app/next/` applications and shared source data remain unchanged.

## Display convention

The new map shows **31 December snapshots**, using the earliest stated start year and removing an authority when its recorded endpoint falls within the displayed year. A date recorded only to a year remains an annual estimate, not a claim that the event occurred on 31 December. A stated date range uses its latest endpoint; `circa`, `range`, `decade`, `contested` and `unknown` retain uncertainty flags. Exact historical dates remain in the territory and event records.

`createYearEndData(data)` in `app/journey/js/map-change-data.js` recomputes the status-period and geographic-coverage intersection at year end. It returns a separate API and never mutates source records. The application should pass this one adapter to every globe, flat map, territory profile and investigation map. It wraps `statusAt`, `territoryAt`, `territoriesAt`, `unitsOf`, `metricsAt`, `timeline` and `nextChangeYear`. The original atlas reader deliberately retains terminal periods through their last calendar year, which previously left India coloured in 1947, Kenya in 1963 and Hong Kong in 1997.

An authority that starts and ends during one calendar year can be absent from both year-end snapshots. The separate event list is therefore essential; animation cannot be a complete account of what happened between endpoints. Approximate dates and source uncertainty cannot be repaired by more fluid animation.

## What change feedback can honestly say

`diffMapStates(data, fromYear, toYear)` compares **unique geographic unit IDs**, after resolving overlapping political records. It returns `added`, `removed`, `changed`, grouped political records, the events in the endpoint-exclusive interval and explanatory notes. When travelling backwards, additions and removals reverse relative to the displayed direction; they are not automatically historical conquests or losses.

Suitable labels are “Newly coloured”, “No longer coloured” and “Rule / coverage changed”. A change includes a different governing record, control degree, legal status or partial-coverage flag. Switching from Company government to Crown government is a change of authority, not a fresh territorial acquisition. A unit cannot appear in two categories for the same transition.

**Never interpret these arrays or `metricsAt` as empire land area, independent countries, population, an empire-size score, or an exhaustive count of colonies.** India is subdivided into many modern units while other regions use much larger units. A parent territory and a presidency can cover the same ground. Political records such as the Canadian provinces and Canadian federation can overlap. The same rendered unit must be counted once, and a replaced record should not generate a momentary blank on the map.

Grouping preserves from/to territory names, statuses, authority degrees and partial flags. A change of governing record may be meaningful even if the formal status label is identical. Showing names and a short historical explanation is more useful than presenting a large numeric “gain” badge.

## Historical checks

| Case | Required behaviour | Verified evidence |
| --- | --- | --- |
| Scotland, 1600–1707 | Scotland is not coloured as the English home state before the parliamentary union of 1707. A shared monarch from 1603 is not the same event. | [UK Parliament: Union of the Crowns](https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/act-of-union-1707/overview/union-of-the-crowns/) and [Articles of Union](https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/act-of-union-1707/overview/the-articles-constitution-and-trade/). Actual dataset tests confirm Scotland absent in 1600 and present in 1707. |
| Bengal, 1757 | Explain military and political leverage rather than instantly colouring all India as a homogeneous conquest. Partial areas stay hatched. | [National Army Museum: Plassey](https://www.nam.ac.uk/explore/battle-plassey). |
| India, 1858 | Company-to-Crown transfer retains geographic authority and appears as a governance change. | [UK Parliament: East India Company and Raj](https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/parliament-and-the-american-colonies-before-1765/east-india-company-and-raj-1785-1858/). Test checks Bengal is in `changed`, not `removed`. |
| Canada, 1867 | Retired colonial records reveal the still-controlled new dominion; there is no false loss caused by removing an overlapping child record. Dominion is limited authority, not a direct Crown colony. | [UK Parliament: Empire timeline](https://www.parliament.uk/about/living-heritage/evolutionofparliament/legislativescrutiny/parliament-and-empire/key-dates/parliament-and-empire-1815-1970/). Test checks every active Canadian unit remains controlled. |
| Ireland, 1922 | Explain the Irish Free State as a dominion and Northern Ireland remaining within the UK. Do not label all of Ireland fully independent or simply “lost” in 1922. | [Commons Library: Anglo-Irish Treaty](https://commonslibrary.parliament.uk/research-briefings/cbp-9260/). |
| India, 1947 | All units in the final British India coverage lose British authority by year end. All-time Indian coverage cannot be used for this assertion: it includes Burma, separated administratively in 1937 and still British in 1947. | [The National Archives: Partition of British India](https://www.nationalarchives.gov.uk/education/teaching-resources/partition-of-british-india/). Test uses the 1946 coverage rather than the all-time union. |
| Nigeria, 1960 | Independence appears in the year it occurred and is framed as self-government as well as a change to British authority. | [Nigeria Independence Act 1960](https://www.legislation.gov.uk/ukpga/Eliz2/8-9/55/body/enacted?view=plain), effective 1 October; [UN decolonisation declaration](https://www.un.org/dppa/decolonization/about), adopted in 1960. |
| Kenya, 1963 | Self-government earlier in the year does not leave the country shaded as British on 31 December. | [Kenya Independence Act 1963](https://www.legislation.gov.uk/ukpga/1963/54/pdfs/ukpga_19630054_en.pdf), effective 12 December. Tests check territory and unit APIs. |
| Hong Kong, 1997 | All three geographic units lose British shading and the handover event remains available. Label this a transfer to Chinese sovereignty, not independence. Other British overseas territories remain. | [1998 Commons report on the handover](https://publications.parliament.uk/pa/cm199798/cmselect/cmfaff/710/71003.htm) and [2008 Commons report on remaining territories](https://publications.parliament.uk/pa/cm200708/cmselect/cmfaff/147/14704.htm). Tests check the three units and event. |

The brief `MAP_MILESTONES` export supplies these seven selected narratives (1757, 1858, 1922, 1947, 1960, 1963, 1997), questions and source links to the map-experience module. It deliberately makes no “1922 was exactly the maximum empire” claim: unit counts are insufficient evidence for an area maximum.

## Source-data limits retained

- The geometry is primarily modern boundary data. Hatching represents partial authority within that modern unit, not its exact historical extent or uniform control over inhabitants.
- “Controlled” is an existing dataset classification based on `controlDegree > 0`. It groups very different relationships. The legend must retain rule categories; dominions cannot be read as identical to colonies.
- `territoryAt(id)` describes that political record. `statusAt(year)` resolves competing records into one display per unit. They are related, but a parent profile can be historically relevant when the map selects a nested presidency.
- Source dates include uncertain and contested entries. No single canonical end of empire follows from the chosen final slider year.
- The source Canadian coverage contains an internally inconsistent 1949–1931 row. The new intersection naturally excludes it. This audit does not alter that old data or infer extra authority after the recorded end of the dominion period.

## Motion review criteria

The globe-to-map sequence should signal reorientation, opening and flattening of the same geography. It should not imply that territory is created by flattening. Year changes should use a brief restrained change outline and named context, not confetti, conquest sounds or victory scoring. Keep hatching and authority categories identifiable throughout. A change remains readable after movement ends, through text and legend. Reduced-motion users need immediate projection changes with the same final information, and keyboard users need the same place selection and year controls.

The geography audit proves data semantics, not rendered animation fidelity. Globe unfolding, fullscreen, responsive layouts and actual on-screen comparison signals are owned by the corresponding integration/visual tests and must be verified separately.

The integrated map-change ribbon was subsequently inspected in Chromium at 1440 and 390 pixels through 1857 → 1858, 1946 → 1947, 1962 → 1963, 1996 → 1997 and a backward jump to 1922. The milestone wording and year-end convention remained visible, backward travel was explicitly explained, named changes were disclosed on demand, and there were no page errors or horizontal overflow. Screenshots were saved to `/tmp/journey-map-ribbon-desktop.png` and `/tmp/journey-map-ribbon-mobile.png`. Two refinements were sent to the implementation owner: avoid a decorative side stripe on the historical paragraph, and identify non-milestone interval events as selected context so, for example, Mabo is not mistaken for a new loss of British territory.

## Reproducible verification

Run `node tools/journey-map-semantics-test.js`. It starts its own server on port 8897, launches an isolated headless Chromium browser, loads the actual shared dataset and verifies 27 assertions. `PORT` changes that test port; `BASE_URL` may point to an existing server. It does not stop or modify the classroom server on 8777.

The first run exposed two mistaken test assumptions, not source fixes: all-time India units include Burma, and a synthetic uncertain range extended beyond the old reader’s bounds. The test was tightened to final-period India, and the adapter’s bounds now include the stated latest endpoint. The current suite passes all 27 checks, including unchanged old-reader results in the same browser session.
