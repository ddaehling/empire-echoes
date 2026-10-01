/**
 * map/hit.js — picking, and the 44px rule.
 *
 * 101 of the 302 units are flagged `tiny`. Gibraltar is 3.7 km²; at world zoom
 * its polygon is a fifth of a pixel. A map that makes those unclickable teaches
 * the coursebook's charge back at the student: that area is importance. So
 * picking runs in two passes.
 *
 *   1. Any unit whose mark is under the minimum size gets a 44px target,
 *      resolved to the NEAREST centre. Two marks closer together than 44px
 *      split the difference between them, so each is still individually
 *      reachable — we never displace a mark to make room, because moving
 *      Gibraltar off Gibraltar would be a worse lie than a tight target.
 *   2. Everything else is picked exactly, against the real path, smallest
 *      first, with a bounding-box reject so a pointer move costs microseconds.
 */

export const HIT_RADIUS = 22;        // half of the 44px target

export function pick(plate, x, y) {
  if (!plate.geom) return null;
  const cam = plate.camera();
  const bounds = plate._boundsNow();
  const d = plate.dpr;
  const sc = (uid) => (plate.weight && plate.weight.has(uid) ? plate.weight.get(uid) : 1);

  // pass 1 — minimum-size marks. The positions come from the same deconflicted
  // layout the renderer drew, so what the pointer hits is what the eye sees,
  // including when a mark was pushed off its anchor.
  //
  // Two rounds, and the order matters. Round 2 took the nearest centre inside
  // 22px, which meant that where Hong Kong Island's dot and the New
  // Territories' dot were both within the target radius, the pointer resolved
  // to whichever centre happened to be a pixel closer — and a click on Hong
  // Kong Island's own drawn disc selected the New Territories. A pointer inside
  // a mark that was actually DRAWN there must select that mark, and where two
  // discs somehow contain the same pixel the smaller place wins, because the
  // bigger one is reachable everywhere else and the smaller one is not.
  const areaOf = (uid) => {
    const m = plate.meta && plate.meta.get(uid);
    const a = m && Number(m.area_km2);
    return Number.isFinite(a) ? a : Infinity;
  };
  // Where two discs contain the same pixel, the NEAREST CENTRE wins, and only
  // a genuine tie is broken by area. Round 4's first pass took the smaller
  // place outright, which meant that a pointer on the middle of Jamaica's own
  // dot selected the Cayman Islands, whose dot merely overlapped it.
  let inside = null, insideD = Infinity, insideArea = Infinity;
  let best = null, bestD = HIT_RADIUS * HIT_RADIUS;
  for (const m of plate.markLayout(cam).values()) {
    const dx = m.x - x, dy = m.y - y, dd = dx * dx + dy * dy;
    const r = m.r + 1;
    if (dd <= r * r) {
      const a = areaOf(m.uid);
      if (dd < insideD - 0.5 || (Math.abs(dd - insideD) <= 0.5 && a < insideArea)) {
        insideD = dd; insideArea = a; inside = m.uid;
      }
    }
    if (dd <= bestD) { bestD = dd; best = m.uid; }
  }
  if (inside) return inside;

  // pass 2 — exact, smallest first
  const paths = plate.paths(cam);
  const g = plate.ctx;
  const px = x * d, py = y * d;
  const order = plate.drawOrder();
  for (let i = order.length - 1; i >= 0; i--) {
    const uid = order[i];
    if (!plate.paint.has(uid)) continue;
    const b = bounds.get(uid); if (!b) continue;
    const s = sc(uid);
    const x0 = (b.cx + (b.x0 - b.cx) * s) * cam.s + cam.ox;
    const x1 = (b.cx + (b.x1 - b.cx) * s) * cam.s + cam.ox;
    const y0 = (b.cy + (b.y0 - b.cy) * s) * cam.s + cam.oy;
    const y1 = (b.cy + (b.y1 - b.cy) * s) * cam.s + cam.oy;
    if (px < x0 - 2 || px > x1 + 2 || py < y0 - 2 || py > y1 + 2) continue;
    const p = paths.get(uid); if (!p) continue;
    if (g.isPointInPath(p, px, py, 'evenodd')) return uid;
  }

  // pass 3 — the 44px courtesy radius, LAST.
  //
  // Round 3 ran this before the exact test, so any pointer within 22px of a
  // tiny mark resolved to that mark even when it was standing inside a drawn
  // country: hovering Quebec's own label point returned Prince Edward Island's
  // tooltip, and hovering New Zealand returned Tristan da Cunha's. A minimum
  // mark exists so that a 3.7 km² rock is reachable on empty sea; it may not
  // take clicks away from the ground it is standing on.
  if (best) return best;
  return null;
}

/**
 * Geographic neighbour in a screen direction — how arrow keys walk the map
 * when focus is on a unit rather than on the plate.
 */
export function neighbour(plate, fromId, dx, dy, ids) {
  const cam = plate.camera();
  const here = plate.unitScreen(fromId, cam);
  if (!here) return null;
  let best = null, bestScore = Infinity;
  for (const uid of ids) {
    if (uid === fromId) continue;
    const s = plate.unitScreen(uid, cam);
    if (!s) continue;
    const vx = s.mx - here.mx, vy = s.my - here.my;
    const along = vx * dx + vy * dy;
    if (along <= 1) continue;                       // not in that direction
    const across = Math.abs(vx * -dy + vy * dx);
    const score = along + across * 2.2;             // prefer straight ahead
    if (score < bestScore) { bestScore = score; best = uid; }
  }
  return best;
}

export default { pick, neighbour, HIT_RADIUS };
