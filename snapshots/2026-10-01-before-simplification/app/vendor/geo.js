/**
 * app/vendor/geo.js — the single ES-module entry point for the atlas's geometry stack.
 *
 * Everything here is vendored locally; nothing touches the network at runtime.
 * The four dist files are UMD bundles: importing them for their side effects
 * installs `globalThis.d3` and `globalThis.topojson`, which we re-export as
 * proper named ES-module bindings. Import order matters — d3-array must be
 * evaluated before d3-geo, and d3-geo before d3-geo-projection.
 *
 *   import { feature, geoPath, geoNaturalEarth1 } from '../vendor/geo.js';
 *
 * Versions and licences: see app/vendor/README.md.
 */
import './d3-array.min.js';
import './d3-geo.min.js';
import './d3-geo-projection.min.js';
import './topojson-client.min.js';

const d3 = globalThis.d3;
const topo = globalThis.topojson;

if (!d3 || !d3.geoPath) throw new Error('vendor/geo.js: d3-geo failed to load');
if (!topo || !topo.feature) throw new Error('vendor/geo.js: topojson-client failed to load');

/* ---- topojson-client ---------------------------------------------------- */
export const feature = topo.feature;             // TopoJSON object -> GeoJSON
export const mesh = topo.mesh;                   // shared borders as one MultiLineString
export const meshArcs = topo.meshArcs;
export const merge = topo.merge;                 // union several geometries
export const mergeArcs = topo.mergeArcs;
export const neighbors = topo.neighbors;
export const quantize = topo.quantize;
export const bbox = topo.bbox;
export const topojson = topo;

/* ---- d3-geo: paths, projections, spherical maths ------------------------ */
export const geoPath = d3.geoPath;
export const geoBounds = d3.geoBounds;
export const geoCentroid = d3.geoCentroid;
export const geoArea = d3.geoArea;
export const geoDistance = d3.geoDistance;
export const geoLength = d3.geoLength;
export const geoContains = d3.geoContains;
export const geoInterpolate = d3.geoInterpolate;
export const geoGraticule = d3.geoGraticule;
export const geoGraticule10 = d3.geoGraticule10;
export const geoCircle = d3.geoCircle;
export const geoRotation = d3.geoRotation;
export const geoTransform = d3.geoTransform;
export const geoIdentity = d3.geoIdentity;
export const geoStream = d3.geoStream;
export const geoClipRectangle = d3.geoClipRectangle;

export const geoEquirectangular = d3.geoEquirectangular;
export const geoMercator = d3.geoMercator;
export const geoOrthographic = d3.geoOrthographic;
export const geoAzimuthalEqualArea = d3.geoAzimuthalEqualArea;
export const geoAzimuthalEquidistant = d3.geoAzimuthalEquidistant;
export const geoConicEqualArea = d3.geoConicEqualArea;
export const geoConicConformal = d3.geoConicConformal;
export const geoAlbers = d3.geoAlbers;
export const geoTransverseMercator = d3.geoTransverseMercator;
export const geoGnomonic = d3.geoGnomonic;
export const geoStereographic = d3.geoStereographic;

/* ---- d3-geo-projection: the world-map projections worth having ---------- */
export const geoNaturalEarth1 = d3.geoNaturalEarth1;   // lives in d3-geo >= 3
export const geoEqualEarth = d3.geoEqualEarth;
export const geoRobinson = d3.geoRobinson;
export const geoWinkel3 = d3.geoWinkel3;
export const geoMollweide = d3.geoMollweide;
export const geoEckert4 = d3.geoEckert4;
export const geoInterrupt = d3.geoInterrupt;
export const geoPolyhedral = d3.geoPolyhedralWaterman;

/* ---- d3-array: the handful the atlas actually uses ---------------------- */
export const extent = d3.extent;
export const range = d3.range;
export const bisector = d3.bisector;
export const ascending = d3.ascending;
export const descending = d3.descending;
export const groups = d3.groups;
export const rollup = d3.rollup;
export const sum = d3.sum;
export const max = d3.max;
export const min = d3.min;
export const cumsum = d3.cumsum;

/* ---- convenience -------------------------------------------------------- */

/** Fetch a TopoJSON file and return { fc, byId } for one named object. */
export async function loadUnits(url, objectName = 'units') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`geo: ${url} -> HTTP ${res.status}`);
  const topology = await res.json();
  const obj = topology.objects[objectName];
  if (!obj) throw new Error(`geo: ${url} has no object "${objectName}" (has: ${Object.keys(topology.objects)})`);
  const fc = feature(topology, obj);
  const byId = new Map(fc.features.map(f => [f.id || (f.properties && f.properties.id), f]));
  return { topology, fc, byId };
}

/** Union a list of unit ids into one GeoJSON geometry (arcs are shared, so this is cheap). */
export function unionUnits(topology, objectName, ids) {
  const want = new Set(ids);
  const geoms = topology.objects[objectName].geometries
    .filter(g => want.has(g.id || (g.properties && g.properties.id)));
  if (!geoms.length) return null;
  return mergeArcs(topology, geoms);
}
