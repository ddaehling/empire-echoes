/**
 * map/geometry.js — turn TopoJSON into flat coordinate arrays.
 *
 * The renderer never walks GeoJSON objects at frame time. Everything is
 * flattened once into two shared Float64Arrays of longitude and latitude, and
 * every unit keeps a list of {o,n} ring slices into them. Projection then
 * writes into parallel Float32Arrays, and a frame is an affine transform plus
 * `lineTo`. That is the whole reason this can hold a 600-frame scrub.
 *
 * The vendored Natural Earth topology is already split at the antimeridian
 * (verified: zero arcs contain a longitude step above 180 degrees), so no
 * meridian cutting is needed here. Holes are handled by even-odd filling,
 * which is winding-independent and therefore safe against a future rebuild.
 */

import { feature } from '../../vendor/geo.js';

/** Count the coordinate pairs in a GeoJSON geometry. */
function countPoints(geom) {
  if (!geom) return 0;
  const t = geom.type;
  const c = geom.coordinates;
  if (t === 'Polygon') { let n = 0; for (const r of c) n += r.length; return n; }
  if (t === 'MultiPolygon') { let n = 0; for (const p of c) for (const r of p) n += r.length; return n; }
  if (t === 'LineString') return c.length;
  if (t === 'MultiLineString') { let n = 0; for (const l of c) n += l.length; return n; }
  return 0;
}

function ringsOf(geom) {
  if (!geom) return [];
  const t = geom.type, c = geom.coordinates;
  if (t === 'Polygon') return c;
  if (t === 'MultiPolygon') { const out = []; for (const p of c) for (const r of p) out.push(r); return out; }
  if (t === 'LineString') return [c];
  if (t === 'MultiLineString') return c.slice();
  return [];
}

/**
 * flatten(features) -> { lon, lat, n, shapes }
 *   shapes: Map<id, { id, rings: [{o, n}], lon0, lat0, lon1, lat1 }>
 * `rings` are slices into the shared arrays. Bounds are in degrees.
 */
export function flatten(features, idOf = (f) => f.id || (f.properties && f.properties.id)) {
  let total = 0;
  for (const f of features) total += countPoints(f.geometry);
  const lon = new Float64Array(total);
  const lat = new Float64Array(total);
  const shapes = new Map();
  let k = 0;
  for (const f of features) {
    const id = idOf(f);
    if (id == null) continue;
    const rings = [];
    let lo0 = Infinity, la0 = Infinity, lo1 = -Infinity, la1 = -Infinity;
    for (const ring of ringsOf(f.geometry)) {
      const o = k;
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i];
        const x = p[0], y = p[1];
        lon[k] = x; lat[k] = y; k++;
        if (x < lo0) lo0 = x; if (x > lo1) lo1 = x;
        if (y < la0) la0 = y; if (y > la1) la1 = y;
      }
      if (k - o >= 2) rings.push({ o, n: k - o });
      else k = o;
    }
    if (!rings.length) continue;
    const prev = shapes.get(id);
    if (prev) {
      // Several features under one id (a whole layer collapsed): merge the rings.
      for (const r of rings) prev.rings.push(r);
      prev.lon0 = Math.min(prev.lon0, lo0); prev.lat0 = Math.min(prev.lat0, la0);
      prev.lon1 = Math.max(prev.lon1, lo1); prev.lat1 = Math.max(prev.lat1, la1);
    } else {
      shapes.set(id, { id, rings, lon0: lo0, lat0: la0, lon1: lo1, lat1: la1 });
    }
  }
  return { lon, lat, n: k, shapes };
}

/** Decode one named object out of a raw TopoJSON topology into flat arrays. */
export function flattenTopology(topology, objectName, idOf) {
  const obj = topology && topology.objects && topology.objects[objectName];
  if (!obj) return null;
  const fc = feature(topology, obj);
  const features = fc.type === 'FeatureCollection' ? fc.features : [fc];
  return flatten(features, idOf || ((f, i) => f.id ?? (f.properties && f.properties.id) ?? i));
}

/** A whole layer collapsed into one shape (land, lakes, graticule). */
export function flattenAsOne(topology, objectName, id) {
  const flat = flattenTopology(topology, objectName, () => id);
  return flat && flat.shapes.get(id) ? flat : null;
}

export default { flatten, flattenTopology, flattenAsOne };
