/**
 * map/interaction.js — the camera, and the hands and keyboard that move it.
 *
 * Pointer drag, wheel and pinch pan and zoom; `+` / `-` and the arrow keys do
 * the same from the keyboard when the plate itself has focus. When focus is on
 * a *unit* instead, the arrows walk to the geographically nearest unit in that
 * direction and Shift+arrow still pans, so both jobs live on the same keys
 * without either one being unreachable.
 *
 * The camera is { k, x, y }: zoom, and the viewport centre as a fraction of the
 * world box. That is exactly the shape the shell's `view` URL key stores, so a
 * teacher's link restores the same frame.
 */

import { WORLD_WIDTH } from './projection.js';

/**
 * Below 1, deliberately. k = 1 is now the PLATE FRAME (64°N to 56°S), not the
 * whole projection box, so the poles and Antarctica live below k = 1. A student
 * who presses minus at home does not hit a dead stop; the map pulls back and
 * the Arctic and the British Antarctic Territory come in from the edges.
 */
export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 48;

/**
 * Clamp so the world can never be dragged off the plate. When the projection is
 * taller than the viewport (Mercator at world zoom is), vertical panning is
 * allowed at k = 1; when it is not, it is pinned. The limits are read from the
 * plate, so they are right for either projection and mid-morph.
 */
export function clampView(v, plate = null) {
  const k = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.k || 1));
  let xSpan = 0.5 * (1 - 1 / k);
  let yLo = -xSpan, yHi = xSpan;
  if (plate && plate.w && plate.h) {
    const cam = plate.camera();
    const s = cam.base * k * plate.dpr;
    const worldW = WORLD_WIDTH * s, worldH = cam.height * s;
    const vw = cam.availW * plate.dpr, vh = cam.availH * plate.dpr;
    xSpan = worldW > vw ? (worldW - vw) / (2 * worldW) : 0;
    // The vertical limits are measured from the FRAME's centre, not the world's:
    // at k = 1 the camera sits on 4°S, not on the equator, and the pan must
    // still be able to reach both poles without ever letting the paper show
    // past the edge of the world.
    const H = cam.height || 1;
    const cy = cam.cy || 0;
    const halfVis = vh / (2 * s);
    if (halfVis >= H / 2) { yLo = yHi = -cy / H; }
    else { yLo = (-H / 2 + halfVis - cy) / H; yHi = (H / 2 - halfVis - cy) / H; }
  }
  return {
    k,
    x: Math.max(-xSpan, Math.min(xSpan, v.x || 0)),
    y: Math.max(yLo, Math.min(yHi, v.y || 0)),
  };
}

/**
 * `surface` is the CANVAS, not the map root, and that distinction is load-bearing.
 *
 * Round 1 bound these handlers to the map root and called `setPointerCapture` on
 * it. Every control the map owns — the four Definition Switch tiles, the
 * projection badge, the three zoom buttons — is a child of that root, so a
 * pointerdown inside a button retargeted the following pointerup, mouseup and
 * click to the root. The buttons were dead to a mouse and the app's signature
 * interaction was reachable only by keyboard. Binding to the canvas means a
 * button press never enters the camera's path at all. `frame` is the element
 * that carries the drag cursor class; it is never the listener.
 */
export function attach(plate, {
  target, frame, onView, onPick, onHover, onWheelBlocked,
} = {}) {
  const el = target;
  const skin = frame || target;
  let dragging = false, moved = 0, pid = null;
  let lastX = 0, lastY = 0;
  const pointers = new Map();
  let pinchDist = 0, pinchMid = null;

  const view = () => plate.view;
  const commit = (v) => { const c = clampView(v, plate); plate.setView(c); if (onView) onView(c); };

  const local = (ev) => {
    const r = el.getBoundingClientRect();
    return [ev.clientX - r.left, ev.clientY - r.top];
  };

  function panBy(dxPx, dyPx) {
    const cam = plate.camera();
    const v = view();
    commit({
      k: v.k,
      x: v.x - (dxPx * plate.dpr) / (WORLD_WIDTH * cam.s),
      y: v.y - (dyPx * plate.dpr) / (cam.height * cam.s),
    });
  }

  /** Zoom about a screen point, keeping the world under it still. */
  function zoomAt(factor, px, py) {
    const v = view();
    const k1 = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, v.k * factor));
    if (k1 === v.k) return;
    const cam = plate.camera();
    const d = plate.dpr;
    const wx = (px * d - cam.ox) / cam.s;
    const wy = (py * d - cam.oy) / cam.s;
    const s1 = cam.base * k1 * d;
    const ox1 = px * d - wx * s1;
    const oy1 = py * d - wy * s1;
    // THE INVERSE HAS TO MATCH camera(). It reads the view from the centre of
    // the FREE paper (`insets`) and offsets the vertical by the plate frame's
    // own centre latitude; round 4 inverted it from the centre of the whole
    // canvas and ignored `cy`, so wheeling with the pointer over India landed
    // the view on the North Atlantic. The insets are zero now that the rail is
    // off the plate, but a caller may still set them, and cy never was zero.
    const ins = plate.insets || { left: 0, top: 0 };
    const cxPx = (ins.left + cam.availW / 2) * d;
    const cyPx = (ins.top + cam.availH / 2) * d;
    commit({
      k: k1,
      x: (cxPx - ox1) / (WORLD_WIDTH * s1),
      y: ((cyPx - oy1) / s1 - cam.cy) / cam.height,
    });
  }

  /**
   * Centre the camera on a unit, at a zoom that puts it on the plate at a size
   * a reader can act on.
   *
   * ROUND 10 — TWO MEASURED FAULTS, AND THEY COMPOUNDED ON A PHONE.
   *
   * (1) THE CENTRE WAS OFF BY THE FRAME. `camera()` offsets the vertical by
   *     `frameCentre()` — the plate frame runs 64°N to 56°S, so its centre is
   *     about 4°S and sits 22 world units above the projection's own origin —
   *     and this function set `view.y` from the world origin instead. Every
   *     fly-to in the application therefore landed the subject 22 world units
   *     off centre: 43 px high on the 390×192 band a lesson beat gets on a
   *     phone, which is 22% of it. At beat 17 that put Punjab in the top 45%
   *     of the band and the bottom 55% on the empty Indian Ocean, which is
   *     exactly what the phone critic measured. It is `(b.cy − cam.cy)`.
   *
   * (2) THE FIT WAS AGAINST THE WORLD, NOT THE PLATE. `kx` came from
   *     `WORLD_WIDTH` and `ky` from the whole projection's height, neither of
   *     which is the rectangle the map is drawn in. On a plate whose scale is
   *     height-limited (every desktop) both were wrong, and on a 192 px band
   *     the vertical term was wrong by a factor of five. The visible world
   *     span is `avail / (base · k)` in each axis; that is what a fit is
   *     against.
   *
   * AND ONE RULE THIS FUNCTION NOW ENFORCES ON ITS CALLER. A beat asks for a
   * zoom — `{ flyTo: 'punjab-province', zoom: 5 }` — and a zoom is a request
   * for a certain amount of CONTEXT, authored against a desktop plate. On the
   * 390×192 band the same number drew a continental view of northern India in
   * which Punjab was 18 px across: the beat's own subject, on the beat's own
   * plate, smaller than the type below it. So the requested zoom is honoured
   * unless it leaves the subject under `MIN_SUBJECT_PX` on the plate, or wider
   * than the plate can hold. The floor is in PIXELS on purpose: a 956 px
   * desktop plate already clears it and its framing does not move, and the
   * phone's band — the scarcest 192 px in the application — is the only place
   * the rule bites.
   */
  const MIN_SUBJECT_PX = 48;      // measured: 48 px is Punjab and its borders
  const MAX_SUBJECT_FRAC = 0.88;  // and it may not touch the edges of the band

  function flyTo(unitId, { zoom = null, fill = 0.42, fit = true } = {}) {
    const b = plate._boundsNow().get(unitId);
    if (!b) return false;
    const cam0 = plate.camera();
    const wSpan = Math.max(b.x1 - b.x0, 0.5);
    const hSpan = Math.max(b.y1 - b.y0, 0.5);
    const base = cam0.base || 1;
    const availW = cam0.availW, availH = cam0.availH;
    // The zoom at which the subject exactly fills `f` of each axis of the plate.
    const kFor = (f) => Math.min((f * availW) / (base * wSpan), (f * availH) / (base * hSpan));
    /* A UNIT THE INDEX CALLS TINY IS NOT RESCUED BY ZOOMING. Gibraltar,
       Barbados and Perim are drawn with a minimum mark at every zoom, so they
       are never invisible; slamming the plate to zoom 48 to make Barbados 48px
       wide would throw away the Caribbean the beat is placing it in. The floor
       is for a unit with real extent that the band draws too small to read. */
    const tiny = !fit || (plate.isTiny && plate.isTiny(unitId));
    const kFloor = tiny ? 0 : Math.min(
      MIN_SUBJECT_PX / (base * Math.max(wSpan, hSpan)),      // …at least this big
      Math.max(1, kFor(MAX_SUBJECT_FRAC)),                    // …but never past the fit
    );
    let k = zoom;
    if (k == null) k = Math.max(1.4, Math.min(14, kFor(fill)));
    k = Math.max(k, kFloor);
    k = Math.min(k, Math.max(1, kFor(MAX_SUBJECT_FRAC)));
    commit({ k, x: b.cx / WORLD_WIDTH, y: (b.cy - (cam0.cy || 0)) / cam0.height });
    return true;
  }

  function reset() { commit({ k: 1, x: 0, y: 0 }); }

  /* ---- pointer --------------------------------------------------------- */

  const onDown = (ev) => {
    if (ev.button != null && ev.button !== 0) return;
    // Belt as well as braces: even on the canvas, never swallow a press that
    // began inside a control.
    if (ev.target && ev.target.closest && ev.target.closest('button, [role="button"], a, input, select, label')) return;
    pointers.set(ev.pointerId, local(ev));
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      pinchMid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      dragging = false;
      return;
    }
    const [x, y] = local(ev);
    dragging = true; moved = 0; lastX = x; lastY = y; pid = ev.pointerId;
    try { el.setPointerCapture(ev.pointerId); } catch (_) { /* not fatal */ }
  };

  const onMove = (ev) => {
    if (pointers.has(ev.pointerId)) pointers.set(ev.pointerId, local(ev));
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (pinchDist > 0 && dist > 0) zoomAt(dist / pinchDist, mid[0], mid[1]);
      if (pinchMid) panBy(mid[0] - pinchMid[0], mid[1] - pinchMid[1]);
      pinchDist = dist; pinchMid = mid;
      return;
    }
    const [x, y] = local(ev);
    if (dragging && ev.pointerId === pid) {
      const dx = x - lastX, dy = y - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (moved > 3) { skin.classList.add('is-dragging'); panBy(dx, dy); }
      lastX = x; lastY = y;
      return;
    }
    if (onHover) onHover(x, y, ev);
  };

  const onUp = (ev) => {
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) { pinchDist = 0; pinchMid = null; }
    if (!dragging || ev.pointerId !== pid) return;
    dragging = false; pid = null;
    skin.classList.remove('is-dragging');
    try { el.releasePointerCapture(ev.pointerId); } catch (_) { /* fine */ }
    if (moved <= 4 && onPick) { const [x, y] = local(ev); onPick(x, y, ev); }
  };

  const onLeave = (ev) => { pointers.delete(ev.pointerId); if (onHover) onHover(-1, -1, ev); };

  const onWheel = (ev) => {
    // A page that hijacks the wheel is a page you cannot scroll past. Ctrl or
    // meta always zooms (trackpad pinch sends that); a plain wheel zooms only
    // over the plate, and never scrolls the document out from under the map.
    ev.preventDefault();
    const [x, y] = local(ev);
    const unit = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? plate.h : 1;
    const dy = ev.deltaY * unit;
    zoomAt(Math.exp(-dy * 0.0016), x, y);
    if (onWheelBlocked) onWheelBlocked();
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('wheel', onWheel, { passive: false });

  return {
    panBy, zoomAt, flyTo, reset, commit,
    zoomIn: (f = 1.6) => { const c = plate.camera(); const i = plate.insets || { left: 0, top: 0 }; zoomAt(f, i.left + c.availW / 2, i.top + c.availH / 2); },
    zoomOut: (f = 1.6) => { const c = plate.camera(); const i = plate.insets || { left: 0, top: 0 }; zoomAt(1 / f, i.left + c.availW / 2, i.top + c.availH / 2); },
    destroy() {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('wheel', onWheel);
    },
  };
}

export default { attach, clampView, ZOOM_MIN, ZOOM_MAX };
