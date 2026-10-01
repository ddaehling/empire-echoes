/* =============================================================================
   PLATE PROBE — the legend checks its own byline against the pixels.
   Owner: P17.

   FEATURE_SPEC P17 acceptance test 2 says the byline's four fields "always
   match the actual render". A byline that simply prints whatever the store says
   is not matching the render, it is repeating a request. The projection field
   already solves this by trusting only the renderer's `map:projection` REPORT
   and never the `map:setProjection` request.

   Nothing in the app reports which thematic layer the plate actually drew, so
   the colour field had the same problem in reverse: switch to `mechanism` and
   the legend confidently printed "colour = how Britain took it" over a plate
   that had not changed a pixel.

   This module supplies the missing report by measuring it. It takes a 48 x 27
   downscale of the map canvas (about 5,200 bytes, roughly a millisecond) and
   compares two samples. If the state changed and the plate did not, the legend
   says so, in front of the student, rather than asserting an encoding that is
   not on screen.

   It is deliberately one-way: this file reads pixels and owns no state in the
   map. If there is no canvas, every function here returns null and every caller
   falls back to "not reported", which is the honest answer.
   ========================================================================== */

const W = 48;
const H = 27;

let scratch = null;

function canvasOf(root = document) {
  return root.querySelector('.stage__map canvas.map__plate')
    || root.querySelector('canvas.map__plate')
    || null;
}

/**
 * sample() -> Uint8ClampedArray | null
 * A downscaled RGBA copy of whatever the plate is currently showing.
 */
export function sample() {
  const src = canvasOf();
  if (!src || !src.width || !src.height) return null;
  if (!scratch) {
    scratch = document.createElement('canvas');
    scratch.width = W; scratch.height = H;
  }
  const ctx = scratch.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(src, 0, 0, W, H);
    return ctx.getImageData(0, 0, W, H).data;
  } catch (err) {
    /* A tainted or zero-sized canvas is a "cannot tell", never a "no change". */
    return null;
  }
}

/**
 * differs(a, b) -> true | false | null
 * null means we could not tell (no plate, or a sample failed) — which is a
 * different answer from "the plate did not change" and is printed differently.
 */
export function differs(a, b) {
  if (!a || !b || a.length !== b.length) return null;
  /* A handful of pixels can move under antialiasing without the encoding
     changing, so ask for a real difference: at least 0.5% of samples off by
     more than 8/255 in any channel. */
  let off = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i] - b[i]) > 8 || Math.abs(a[i + 1] - b[i + 1]) > 8 || Math.abs(a[i + 2] - b[i + 2]) > 8) off++;
  }
  return off > (a.length / 4) * 0.005;
}

/** Is there a plate on screen at all? */
export const platePresent = () => !!canvasOf();

/**
 * watch(fn) — take a sample now, run fn, and report whether the plate moved.
 * The map cross-fades a re-projection over --dur-deliberate, so we look twice:
 * once on the next frame and once after the settle window.
 */
export function afterChange(before, { settle = 620 } = {}) {
  return new Promise((resolve) => {
    if (!before) { resolve(null); return; }
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const look = () => {
      const now = sample();
      const d = differs(before, now);
      if (d === true) finish(true);
      return d;
    };
    requestAnimationFrame(() => { requestAnimationFrame(() => { if (look() !== true) setTimeout(() => finish(look()), settle); }); });
  });
}

export default { sample, differs, platePresent, afterChange };
