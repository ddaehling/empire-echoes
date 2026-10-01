# `app/vendor` — third-party runtime libraries

Vendored, pinned, offline. **Nothing in the running app touches a CDN.** These files were
copied verbatim from the published npm `dist/` builds; they are not modified.

| file | package | version | licence | size |
|---|---|---|---|---|
| `d3-array.min.js` | [d3-array](https://github.com/d3/d3-array) | 3.2.4 | ISC | 17 KB |
| `d3-geo.min.js` | [d3-geo](https://github.com/d3/d3-geo) | 3.1.1 | ISC | 36 KB |
| `d3-geo-projection.min.js` | [d3-geo-projection](https://github.com/d3/d3-geo-projection) | 4.0.0 | ISC | 61 KB |
| `topojson-client.min.js` | [topojson-client](https://github.com/topojson/topojson-client) | 3.1.0 | ISC | 7 KB |
| `geo.js` | *ours* | — | — | 4 KB |

Full licence texts are in `licenses/`. All four are ISC (BSD-equivalent): free to use and
redistribute with the copyright notice, which `licenses/` preserves.

## How to use them

**Import `geo.js`, not the dist files.**

```js
import { feature, geoPath, geoNaturalEarth1, loadUnits, unionUnits } from '../vendor/geo.js';

const { topology, fc, byId } = await loadUnits('data/geo/units-coarse.topo.json');
const projection = geoNaturalEarth1().fitExtent([[0, 0], [w, h]], { type: 'Sphere' });
const path = geoPath(projection);
svgPath.setAttribute('d', path(byId.get('bermuda')));

// union several units into one outline (arcs are shared, so this is cheap)
const raj = unionUnits(topology, 'units', ['in-west-bengal', 'in-bihar', 'bd-east-bengal']);
```

The four dist files are UMD bundles. Importing them for their side effects installs
`globalThis.d3` and `globalThis.topojson`; `geo.js` re-exports those as proper named ES-module
bindings so the rest of the app never touches a global. **Import order matters** — d3-array
before d3-geo before d3-geo-projection — and `geo.js` already gets it right. Importing a dist
file directly will work by accident today and break tomorrow; don't.

`geo.js` throws immediately if either global failed to appear, so a broken vendor drop shows up
as a clear error rather than a blank map.

## Refreshing a version

```bash
npm i d3-array d3-geo d3-geo-projection topojson-client
cp node_modules/<pkg>/dist/<pkg>.min.js  app/vendor/
cp node_modules/<pkg>/LICENSE            app/vendor/licenses/<pkg>.LICENSE
```

Then update the table above and re-run `node tools/inspect.js tools/scenarios/geo-preview.js
--url http://localhost:8777/app/data/geo/preview.html --out /tmp/geo` — it renders 302 units
through the whole stack and reports console errors, so it doubles as the vendor smoke test.

## Deliberately not vendored

- **d3-selection / d3-transition / d3-zoom** — the map renderer builds SVG with plain DOM calls
  and handles its own pointer maths. Adding them would be ~40 KB for convenience we do not need.
- **d3-scale, d3-shape** — the charts own that choice; see `app/js/viz/`.
- **topojson-server** — build-time only, lives in `devDependencies`.
