# Classroom redesign

## Purpose

Students use this on school laptops in a brightly lit classroom; teachers project it while
leading discussion. A light, high-contrast interface, a generous map and a small number of
clear actions suit both situations. This redesign implements the user's request to reduce
detail and improve classroom usability. It supersedes the older research-interface layout
requirements for `app/index.html`; those still describe `app/research.html`.

## Information architecture

Three student destinations: Explore, Guided lessons, Quick check. A quieter teacher entrance
holds preparation and printing. The first screen presents the map and one historical context
at a time. Territory records replace the context in the same panel; search makes small places
and keyboard use practical. Sources expand inline. There is no initial modal or forced tour.

The six key years are entry points, not a claim that phases followed in a neat sequence.
Lessons retain resistance, colonised people's agency, economic mechanisms and map criticism,
while moving advanced apparatus into the preserved research atlas.

## Visual system

The identity keeps the original locally bundled Source Serif and Source Sans families.
Source Serif carries narrative headings; Source Sans carries controls and reading text.
Forest green identifies actions and current selection. Muted coral marks British authority
on a quiet green-grey sea. Warm and green geographical silhouettes distinguish the three
lessons; these are generated from the project's real map geometry.

The surface is near-white, with restrained rules, 7–12px radii and consistent buttons. There
are no decorative stock images, remote font dependencies, giant statistics or competing
panels. Map fills encode information. A brief view transition and map-fill transitions
acknowledge state changes; reduced-motion preferences remove them.

Map colours are simplified levels of authority, not exact constitutional categories. The
place panel shows each record's specific status. Partial coverage has a hatch; selected
small territories have a visible ring. England and Wales are distinguished before 1707,
Britain from 1707. Historical borders remain explicitly approximate.

## Responsive and accessible behaviour

At desktop widths the map and explanation share a frame. At tablet widths the explanation
moves below it. Phones keep the same reading order and visible navigation. Chapter controls
become numbered steps with complete accessible names. Search results support arrow keys,
Enter and Escape; `/` focuses search. Form controls have visible labels, focus states and
native semantics. Skip navigation keeps the current destination. A live status announces
map selection and quiz feedback. No content depends on an entrance animation finishing.

Student notes are optional, stored locally with an explicit fallback when storage is
unavailable, escaped when rendered, and downloadable as plain text. Quiz scores remain in
the current tab. Print styles produce teacher plans, a discussion sheet and student notes.

## Maintenance

The classroom layer imports the existing data API and local D3/TopoJSON bundle. It does not
mount the old interface modules. `app/research.html` preserves the original entry document
and loads them unchanged. Keep curated content short; add optional depth via sources and
research links before adding more controls or prose to the default classroom view.
