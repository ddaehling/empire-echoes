# `app/data/geo` — the geo-unit vocabulary

Everything the atlas draws on the map comes from these five files. They are **generated**;
edit `tools/build-geo.js`, never the JSON.

```
units.index.json        THE VOCABULARY — 302 units, sorted by id. Read this first.
units-coarse.topo.json  world-zoom geometry   (329 KB, quantised 1e5 ≈ 400 m)
units-fine.topo.json    region-zoom geometry  (1.8 MB, quantised 1e6 ≈ 40 m)
land.topo.json          base map: `land`, `lakes`, `graticule` (413 KB)
preview.html            build-inspection page (not part of the app)
```

Rebuild: `node tools/build-geo.js` (offline once `tools/.cache/` is populated;
`--refetch` re-downloads). Verify: `node tools/verify-geo.js`.

---

## The idea

Open historical boundary polygons at the fidelity this atlas needs **do not exist**. The
Anglo-Egyptian Sudan, the Aden Protectorate and British Togoland were never surveyed into a
downloadable GeoJSON with defensible edges. So we do not pretend to have them.

Instead we build a **vocabulary of stable geo units** — pieces of the modern world, split
wherever empire history demands a split — and the territory dataset composes every historical
polity as a **union of unit ids at a given year**. Company rule vs Crown rule in India, or
protectorate vs colony in Nigeria, are *temporal* facts about the same ground: they need dates,
not separate geometry.

So, for example:

| historical territory | = union of units |
|---|---|
| Ireland before 1922 | `ie-leinster` + `ie-munster` + `ie-connacht` + `ie-ulster-counties` + `gb-northern-ireland` |
| Irish Free State, 1922 | the four `ie-*` units |
| Anglo-Egyptian Sudan | `sudan` + `south-sudan` |
| British Raj, 1930 | the `in-*`, `pk-*`, `bd-*`, `mm-*` units (Burma until 1937) |
| Straits Settlements, 1900 | `my-penang` + `my-melaka` + `singapore` |
| Union of South Africa, 1910 | `za-cape-colony` + `za-natal` + `za-transvaal` + `za-orange-free-state` |
| Federation of Rhodesia & Nyasaland | `zw-southern-rhodesia` + `zm-northern-rhodesia` + `mw-nyasaland` |
| Hong Kong, 1899 | `hk-hong-kong-island` + `hk-kowloon` + `hk-new-territories` |

Units never overlap (verified), so a union is just a set of ids.

---

## Provenance and licence

All geometry derives from **Natural Earth** vector data, version as published on the
`nvkelso/natural-earth-vector` master branch, downloaded to `tools/.cache/`:

| file | used for |
|---|---|
| `ne_10m_admin_0_map_units.geojson` | the base vocabulary: 298 map units, which already separate Bermuda, Gibraltar, the Falklands, St Helena, Hong Kong, Jersey, Zanzibar, Bougainville, England/Scotland/Wales/Northern Ireland |
| `ne_10m_admin_1_states_provinces.geojson` | every sub-national split (Canadian provinces, Australian colonies, Indian states, Malayan states, Hong Kong districts, Yemeni governorates, …) |
| `ne_10m_lakes.geojson` | big lakes in the base map (`scalerank ≤ 2`) |
| `ne_10m_admin_0_disputed_areas.geojson` | downloaded and inspected; **not used** — Kashmir and the other contested areas are built from admin-1 instead, so units cannot overlap |
| `ne_50m_land.geojson` | downloaded for reference; the shipped `land` layer is instead all 10m map units dissolved, so the coastline matches the units exactly |

**Natural Earth is in the public domain.** From its terms of use: *"All versions of Natural
Earth raster and vector map data found on this website are in the public domain."* No
attribution is legally required; we credit it anyway, in the app's About panel.

Processing uses [mapshaper](https://github.com/mbloch/mapshaper) (MPL-2.0, a build-time
dependency only) for topology-safe dissolve, clip, erase and Visvalingam simplification, and
`d3-geo` for spherical area, bounds and centroids.

**Nothing here is a historical boundary from a historical source.** Every polygon is a modern
boundary standing in for a historical one. Where that stand-in is materially wrong, the unit's
`note` field says so, and the UI must not pretend otherwise.

---

## `units.index.json` — the fields

```json
{
  "id": "tz-zanzibar",
  "name": "Zanzibar",
  "aliases": ["Unguja", "Pemba", "Sultanate of Zanzibar", "Stone Town"],
  "kind": "subnational",
  "sovereign_today": "Tanzania",
  "iso_a2": "TZ",
  "region": "East Africa & the Nile",
  "centroid": [39.3399, -5.9954],
  "point": [39.3176, -6.1341],
  "area_km2": 2510,
  "bbox": [39.1854, -6.4818, 39.9042, -4.8828],
  "tiny": true
}
```

- **`id`** — stable lowercase kebab slug. Sub-national units are namespaced by the modern
  sovereign's ISO-3166 alpha-2 in lowercase (`ca-nova-scotia`, `za-cape-colony`, `in-sikkim`).
  Units coextensive with a whole modern state or dependency get a bare slug (`bermuda`,
  `gibraltar`, `jamaica`). **These ids are the contract with the dataset. Do not rename them.**
- **`name`** — the label to show. Deliberately the *modern* name where the unit is modern, and
  the *historical* name where the unit only exists for history (`ye-aden-colony`,
  `ng-british-northern-cameroons`).
- **`aliases`** — historical and alternative names, for search and for dossier headings.
  Not exhaustive; add to them in `tools/build-geo.js`.
- **`kind`** — `country` (coextensive with a modern sovereign state), `subnational`,
  `dependency`, `island-group`, or `antarctic`.
- **`sovereign_today`** — plain-English modern sovereign. Contested cases say so
  (`"Somaliland (unrecognised) / Somalia"`, `"United Kingdom (claim, Antarctic Treaty)"`).
- **`centroid`** — spherical centroid (d3 `geoCentroid`). **May be at sea** for archipelagos.
  Use it for zoom-to, never for a label.
- **`point`** — a label anchor **guaranteed to be inside the drawn polygon at both detail
  levels** (pole of inaccessibility of the largest part, re-derived from the simplified
  geometry when simplification moves it). Draw markers and labels here.
- **`area_km2`** — spherical area of the *unsimplified* geometry. Two decimals below 100 km².
- **`bbox`** — `[west, south, east, north]`. **For units crossing the antimeridian, `west` is
  greater than `east`** (Fiji: `174.59 … −178.22`). Handle that case or the map will jump.
- **`tiny`** — `true` when `area_km2 < 6000`. At world zoom (~29 km per pixel) such a unit is
  under three pixels across, so the renderer **must** draw a minimum-size marker at `point`
  instead of relying on the polygon. 101 of the 302 units are tiny.
- **`note`** — present only where the geometry is an approximation; show it in the dossier.

## The TopoJSON files

One object, `units`. Each geometry carries both a TopoJSON `id` and `properties.id` — the same
slug — so either access pattern works.

```js
import { feature, geoPath } from '../vendor/geo.js';
const topo = await (await fetch('data/geo/units-coarse.topo.json')).json();
const fc = feature(topo, topo.objects.units);          // GeoJSON FeatureCollection
const byId = new Map(fc.features.map(f => [f.id, f]));
```

Ring winding follows d3's spherical convention (exterior rings clockwise), so `d3.geoPath`,
`d3.geoArea`, `d3.geoContains` and clipped projections such as `geoOrthographic` all behave.
Arcs are shared inside each file, so `topojson.mergeArcs` unions a set of units cheaply —
`unionUnits()` in `app/vendor/geo.js` does exactly that.

`land.topo.json` has three objects: `land` (all 10m map units dissolved, 10 % Visvalingam),
`lakes` (45 large lakes), `graticule` (a 15° grid, densified every 2°). Draw them in that order,
under the units.

Simplification is Visvalingam *weighted* with `keep-shapes`, which guarantees every polygon
survives: Pitcairn (43 km²), Heligoland (2 km²) and Gibraltar (4 km²) are all still present and
non-degenerate in the coarse file. `tools/verify-geo.js` asserts this for 67 named small units.

---

## Splitting decisions, and why

Only the splits that carry historical weight were made. Everything else stays whole, because
every extra unit is an extra thing the dataset has to get right.

**Ireland.** Natural Earth already separates Northern Ireland (`gb-northern-ireland`) from the
Republic. The Republic is further split into its four historic provinces
(`ie-leinster`, `ie-munster`, `ie-connacht`, `ie-ulster-counties`) so the atlas can draw the
Plantation of Ulster, the Cromwellian transplantation "to Hell or to Connacht", and the
1921 partition, which cut the nine-county province of Ulster into six and three.

**Canada.** Straight from admin-1 provinces, because Canada accreted province by province:
Nova Scotia, New Brunswick, PEI, Newfoundland and Labrador (one unit — the colony always
included Labrador), Quebec (Lower Canada), Ontario (Upper Canada), Manitoba/Saskatchewan/Alberta
(carved out of Rupert's Land and the North-West Territories), British Columbia, Yukon, NWT,
Nunavut. **Vancouver Island** was a separate Crown colony 1849–66, so it is carved out of
British Columbia with an approximate polygon; the Gulf and Discovery Islands are apportioned
roughly and the note says so.

**Australia.** The six colonies plus the Northern Territory, exactly as admin-1 gives them.
The Australian Capital Territory, Jervis Bay and Lord Howe Island are folded into New South
Wales (they were carved out of it); Macquarie Island into Tasmania.

**British India.** One unit per modern Indian state, plus Pakistan's provinces, Bangladesh, the
Burmese divisions and Ceylon. Per-state granularity is what makes Company expansion drawable:
Bengal 1765 = `in-west-bengal` + `in-bihar` + `in-jharkhand` + `in-odisha` + `bd-east-bengal`;
Sind 1843 = `pk-sindh`; the Punjab 1849 = `pk-punjab` + `in-punjab-india` + `in-haryana` +
`in-himachal-pradesh`. Burma is split by the three Anglo-Burmese wars: `mm-arakan` and
`mm-tenasserim` (1826), `mm-lower-burma` (1852), `mm-upper-burma` and `mm-frontier-areas`
(1885–86). Ceylon is split into the Dutch-inherited maritime provinces (1796) and the Kandyan
provinces (1815).
*Kashmir* is four units — `in-jammu-kashmir`, `in-ladakh`, `pk-azad-kashmir`,
`pk-gilgit-baltistan` — built from admin-1 so they tile without overlap; the atlas can show the
princely state whole and the post-1947 line separately. *Sikkim* is its own unit.
*Hyderabad State* is the honest weak point: Natural Earth cannot separate Marathwada from
Maharashtra or Kalyana-Karnataka from Karnataka, so `in-telangana` is the **Telangana core only**
and its `note` says so. Company vs Crown rule is temporal, not spatial.

**Africa.** Tanganyika and Zanzibar are separated at the admin-1 level (the five Unguja and
Pemba regions). Sudan and South Sudan together are the Anglo-Egyptian Sudan; Egypt is separate,
and the **Suez Canal Zone** (Ismailia, Suez, Port Said governorates) is its own unit so the
1936–56 base can be drawn. British Somaliland is Natural Earth's Somaliland map unit; Italian
Somaliland is the rest. The four South African colonies map onto modern provinces — Cape =
Western + Eastern + Northern Cape, Natal = KwaZulu-Natal, Transvaal = Limpopo + Mpumalanga +
Gauteng + North West, Orange Free State = Free State. Nigeria splits into Lagos, Southern and
Northern; Sierra Leone into the Freetown colony (Western Area) and the protectorate; the Gold
Coast into the colony, Ashanti and the Northern Territories.

**The two mandate strips.** These are the least exact geometry in the set, and both are
labelled approximate:
- **British Togoland** = Ghana's Volta Region plus a carved strip of the Northern Territories
  east of roughly 0.5°W. The 1956 plebiscite boundary is not in any open dataset.
- **British Northern Cameroons** = a carved polygon following the Nigeria–Cameroon border
  through Borno, Adamawa and Taraba — the part that voted to join Nigeria in 1961. British
  Southern Cameroons, which voted to join Cameroon, is exact: the Nord-Ouest and Sud-Ouest
  regions.

**South-East Asia.** Every Malay state separately, because they entered British control at
different dates: Penang (1786), Malacca (1824), Perak/Selangor/Negeri Sembilan/Pahang (the
Federated States, 1874–88), the four northern states transferred from Siam in 1909, Johor
(1914), Sarawak, North Borneo and Labuan. Singapore and Brunei are their own map units.
The Straits Settlements are composed, not stored.

**Hong Kong** is three units built from admin-1 districts, matching the three acquisitions:
the island (1842), Kowloon south of Boundary Street (1860), and the New Territories (1898
lease). Weihaiwei is carved from Shandong by bounding box and is approximate.

**Arabia and the Gulf.** Aden Colony is the `Adan governorate; the Aden Protectorate is Lahij,
Abyan, Shabwah, Hadramawt, Al Mahrah and Al Dali'; North Yemen is the rest. Perim, Kamaran,
Socotra and the Kuria Muria Islands — all British at some point, all separately administered —
are carved out by bounding box. Kuwait, Bahrain, Qatar, Oman and the Trucial States (the modern
UAE, kept whole) are separate units.

**Antarctica.** The three claims descended from the Falkland Islands Dependencies are carved
from Natural Earth's Antarctica polygon as **densified** sectors, not bounding boxes — a
bounding box gives the wedge two straight edges that cut across meridians and render wrong on
any curved projection. `british-antarctic-territory` is 20°W–80°W, `aq-ross-dependency` is
160°E–150°W, `aq-australian-antarctic` is 45°E–136°E and 142°E–160°E (the gap is French Adélie
Land). Each stops at 89.9°S. Their areas are smaller than the official figures because Natural
Earth's coastline excludes the Ronne and Ross ice shelves.

**Small but pedagogically vital.** Every Caribbean island is its own unit, including Nevis
separately from St Kitts and Tobago separately from Trinidad (they were acquired and governed
separately). Bermuda, the Bahamas, Gibraltar, Malta, Cyprus, the Ionian Islands, Minorca,
Heligoland, Ascension, Tristan da Cunha, St Helena, the Falklands, South Georgia, the South
Sandwich Islands, Mauritius, Rodrigues, Seychelles (inner and outer separately, because the
outer islands were part of BIOT 1965–76), the Maldives, Diego Garcia separately from the rest of
the Chagos Archipelago, Zanzibar, Penang and Labuan all exist as units.

**Territories Britain did not keep, or never held.** The vocabulary includes the Thirteen
Colonies and Maine, Vermont, Florida, West Florida, the Old Northwest, Kentucky–Tennessee and
the Oregon Country; the Mosquito Coast and the Bay Islands; Manila, Java, Bencoolen and the
Moluccas; Buenos Aires and Montevideo; Corsica, Iceland, the Faroes, Madeira and the Azores;
Réunion, Madagascar, Rwanda and Burundi; the British Zone of occupied Germany and occupied
Japan. Conquests that were handed back — Havana 1762, Manila 1762, Java 1811, Réunion 1810 —
are as much a part of the story as the ones that stuck, and they need geometry too.

---

## Known limitations

1. Modern boundaries are stand-ins for historical ones. Colonial borders shifted; internal
   provinces were redrawn constantly. Treat every polygon as **the right ground, not the right
   line**.
2. `in-telangana` covers only the Telangana core of Hyderabad State.
3. British Togoland and British Northern Cameroons are hand-drawn approximations.
4. Vancouver Island's separation from mainland British Columbia is approximate.
5. Weihaiwei's leased boundary is a bounding box.
6. The Kenyan coastal strip leased from Zanzibar until 1963 is not separated from Kenya.
7. Antarctic areas are land-only; the ice shelves are missing from Natural Earth.
8. Sub-degree features — treaty ports, the Shanghai International Settlement, individual forts
   and factories — have no geometry here. Show them as points from the dataset instead.
