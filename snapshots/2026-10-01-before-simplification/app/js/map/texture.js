/**
 * map/texture.js — the engraved plate hatching, as canvas patterns.
 *
 * These mirror the --tex-* gradients in css/tokens.css one for one, at the same
 * periods and the same ink. They are what a colour-blind student is actually
 * reading: docs/DESIGN.md proves that nine status pairs sit under 12 ΔE00 and
 * are separated by texture alone, so dropping a texture because it "looks busy"
 * would delete information from the map.
 *
 * Tiles are built in DEVICE pixels and the renderer draws with an identity
 * transform, so the hatching stays the same weight at every zoom — exactly as
 * an engraved plate does, and as the CSS tokens promise.
 */

const cache = new Map();

function tile(px) { return Math.max(2, Math.round(px)); }

function make(name, ink, dpr, weight = 1) {
  const t = (v) => tile(v * dpr);
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const line = Math.max(1, Math.round(0.5 * weight * dpr));
  const lineDense = Math.max(1, Math.round(0.75 * weight * dpr));

  const strokeAt = (size, w, segs) => {
    c.width = size; c.height = size;
    g.clearRect(0, 0, size, size);
    g.strokeStyle = ink; g.lineWidth = w; g.lineCap = 'butt';
    g.beginPath();
    for (const [x0, y0, x1, y1] of segs) { g.moveTo(x0, y0); g.lineTo(x1, y1); }
    g.stroke();
  };

  switch (name) {
    case 'rule-h': {
      const s = t(6); strokeAt(s, line, [[0, line / 2, s, line / 2]]); break;
    }
    case 'rule-v': {
      const s = t(6); strokeAt(s, line, [[line / 2, 0, line / 2, s]]); break;
    }
    case 'cross': {
      const s = t(7);
      strokeAt(s, line, [[0, line / 2, s, line / 2], [line / 2, 0, line / 2, s]]);
      break;
    }
    case 'hatch-45': {           // "/" lines, perpendicular spacing 6px
      const s = t(6 * Math.SQRT2);
      strokeAt(s, line, [[0, s, s, 0], [-s, s, s, -s], [0, 2 * s, 2 * s, 0]]);
      break;
    }
    case 'hatch-135': {          // "\" lines, perpendicular spacing 6px
      const s = t(6 * Math.SQRT2);
      strokeAt(s, line, [[0, 0, s, s], [-s, 0, s, 2 * s], [0, -s, 2 * s, s]]);
      break;
    }
    case 'hatch-135-dense': {
      const s = t(3.5 * Math.SQRT2);
      strokeAt(s, lineDense, [[0, 0, s, s], [-s, 0, s, 2 * s], [0, -s, 2 * s, s]]);
      break;
    }
    case 'stipple': {
      const s = t(5); c.width = s; c.height = s;
      g.clearRect(0, 0, s, s); g.fillStyle = ink;
      g.beginPath(); g.arc(s / 2, s / 2, Math.max(0.65 * weight * dpr, 0.6), 0, 6.2832); g.fill();
      break;
    }
    case 'stipple-coarse': {
      const s = t(9); c.width = s; c.height = s;
      g.clearRect(0, 0, s, s); g.fillStyle = ink;
      g.beginPath(); g.arc(s / 2, s / 2, Math.max(0.9 * weight * dpr, 0.8), 0, 6.2832); g.fill();
      break;
    }
    /* Not a status texture. Absence: no cited figure for the active metric.
       Wide, open, unmistakably different from all nine plate textures. */
    case 'absence': {
      const s = t(9 * Math.SQRT2);
      strokeAt(s, line, [[0, s, s, 0], [-s, s, s, -s], [0, 2 * s, 2 * s, 0]]);
      break;
    }
    default: return null;
  }
  return g.createPattern(c, 'repeat');
}

/**
 * Broken bands: how a `partial` unit is drawn. British control did not fill
 * this unit, so the colour is not allowed to fill it either — bands of the bare
 * ground are cut through the status fill. The status colour still dominates,
 * because a student has to be able to read the status as well as the doubt.
 */
function bands(colour, dpr) {
  const period = Math.max(5, Math.round(11 * dpr));
  const s = Math.max(5, Math.round(period * Math.SQRT2));
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const g = c.getContext('2d');
  g.strokeStyle = colour;
  g.lineWidth = Math.max(2, Math.round(2.2 * dpr));
  g.beginPath();
  g.moveTo(0, s); g.lineTo(s, 0);
  g.moveTo(-s, s); g.lineTo(s, -s);
  g.moveTo(0, 2 * s); g.lineTo(2 * s, 0);
  g.stroke();
  return g.createPattern(c, 'repeat');
}

/** A pattern set, rebuilt whenever the theme or the device ratio changes. */
export function patterns(tokens, dpr) {
  const sig = [tokens.texInk, tokens.inkGhost, dpr].join('|');
  let set = cache.get(sig);
  if (set) return set;
  set = { plain: null, none: null };
  for (const n of ['rule-h', 'rule-v', 'cross', 'hatch-45', 'hatch-135', 'hatch-135-dense', 'stipple', 'stipple-coarse']) {
    set[n] = make(n, tokens.texInk || 'rgba(45,34,20,.22)', dpr);
  }
  set.absence = make('absence', tokens.inkFaint || tokens.texInk, dpr);
  /* THE HEAVY ENGRAVING — the same mark, at the weight of a line that has to
     do the separating on its own.

     palette.js measures, per theme, which families sit under DESIGN.md's 12
     ΔE00 against the ground for some reader (the self-governing fill is at 9.6
     for a protanope), and those families are drawn with this set instead. The
     PERIOD is deliberately unchanged — a 6px rule stays a 6px rule, so the
     legend's swatch is still the same engraving and the key does not lie — and
     only the line weight and the ink change: twice the width, and the family's
     own published `--map-*-stroke`, which the palette already guarantees
     against that fill. It is built lazily, per ink, because only one or two
     families ever need it. */
  set.heavyFor = (name, ink) => {
    if (!name || name === 'plain' || !ink) return set[name] || null;
    const k = 'h:' + name + ':' + ink;
    if (!(k in set)) set[k] = make(name, ink, dpr, 2);
    return set[k] || set[name] || null;
  };
  set.bandsFor = (colour) => {
    const k = 'b:' + colour;
    if (!set[k]) set[k] = bands(colour, dpr);
    return set[k];
  };
  cache.set(sig, set);
  return set;
}

export default { patterns };
