/* timeline/scrubber.js — the axis: rulings, event ticks, the uncertainty rail,
   the handle and the compare ghost.

   Everything here is built once and then only moved, so scrubbing costs a
   transform and two text writes, not a re-render.

   The uncertainty rail was rebuilt in round 3. It used to draw one 13 × 12px
   button per uncertain year — 148 of them, 125 overlapping their neighbour at a
   median gap of −10.4px, so `document.elementFromPoint` at the centre of 96 of
   them returned a different mark and Playwright refused to hover one at all.
   The keyboard path worked; the mouse path silently lost two thirds of the best
   feature in the piece, and every target was under WCAG 2.2 AA's 24 × 24
   minimum. Marks are now clustered by pixel position at layout time: no two
   targets are closer than 24px, every target is 24 × 24, and a cluster opens a
   list of every year inside it. Nothing is dropped — the count is printed on
   the cluster and the reasons are all in the popover. */

import { el, fill } from '../core/util.js';
import { makeScale, ticksFor, BREAK_YEAR } from './scale.js';

const SVGNS = 'http://www.w3.org/2000/svg';
/* THE AXIS DRAWING IS EXACTLY AS TALL AS THE BOX IT IS DRAWN IN.

   `--tl-rail-h` is 34px on a laptop and 30px on a phone, and this file used to
   draw at a hard 34 regardless. On a phone that put four pixels of svg outside
   a thirty-pixel box, and since the box is a flex child the overflow did not
   push anything: it printed straight through the phase band underneath.
   Measured at 390x844 at `apparatus`: the year labels ran 783–798 and the four
   lanes began at 793, so "1600" was set through the top of "I The Atlantic
   empire". The drawing takes its height from the token now.

   THE RULE SITS SIXTEEN PIXELS ABOVE THE FOOT. Measured: with the base at H-13
   and the major ticks 6px long, every labelled tick was drawn straight through
   the top of its own year — "16|00", "17|00" — because a 12px numeral with its
   baseline at H-1 has its cap top about 9px above it and the tick ran past it.
   At H-16 the ticks stop 5px above the base and the numerals clear them. */
const H_DEFAULT = 34;
const RULE_DROP = 16;      // BASE = H - RULE_DROP
const HIT = 24;            // WCAG 2.2 AA minimum target, and the cluster pitch

function svg(name, attrs) {
  const n = document.createElementNS(SVGNS, name);
  if (attrs) for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  return n;
}

function trim(s, n = 200) {
  const t = String(s || '').trim();
  if (!t) return 'No reason is recorded in this dataset.';
  return t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n)) + '…';
}

/* The kind of a cluster: "when" if every reason in it is a soft date, "what" if
   every one is a disputed account, "both" otherwise. The two are different
   epistemic objects and a student who cannot tell them apart cannot do source
   work, so the rail never merges them into one symbol without saying so. */
function clusterKind(rows) {
  let when = false, what = false;
  for (const r of rows) {
    if (r.kind === 'when' || r.kind === 'both') when = true;
    if (r.kind === 'what' || r.kind === 'both') what = true;
  }
  return when && what ? 'both' : when ? 'when' : 'what';
}

export function createScrubber({ bounds, eventTicks, uncertain, onYear, onMark, onClearCompare }) {
  const gRule = svg('g', { class: 'tl-ax__rule' });
  const gTicks = svg('g', { class: 'tl-ax__ticks' });
  const gLabels = svg('g', { class: 'tl-ax__labels' });
  const gBreak = svg('g', { class: 'tl-ax__break' });
  const sheet = svg('svg', { class: 'tl-ax__svg', height: H_DEFAULT, 'aria-hidden': 'true', focusable: 'false' });
  sheet.append(gRule, gTicks, gLabels, gBreak);

  const marks = el('div.tl-ax__marks', { role: 'group', 'aria-label': 'Dates this atlas cannot settle. Left and right arrows move between them.' });
  const handle = el('div.tl-ax__handle', { 'aria-hidden': 'true' },
    el('span.tl-ax__handle-stem'), el('span.tl-ax__handle-cap'));
  /* The compare ghost is a control, not a decoration. Round 4 found it standing
     at 1914 long after the student had moved on, with nothing on screen able to
     clear it — the hash merges, so dropping `compare` from the address bar does
     not drop it from the state. Pressing the ghost clears the comparison, and
     it says so. */
  const ghostLbl = el('button.tl-ax__ghost-lbl.num', { type: 'button' });
  const ghost = el('div.tl-ax__ghost', { hidden: true }, ghostLbl);
  ghostLbl.addEventListener('click', (ev) => { ev.stopPropagation(); if (onClearCompare) onClearCompare(); });
  ghostLbl.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  const axis = el('div.tl-ax__axis', sheet, ghost, handle);

  const rail = el('div.tl-ax__rail', {
    role: 'slider', tabindex: '0',
    'aria-label': 'Year. Arrow keys move one year; Shift and an arrow jumps to the next year this atlas dates anything to; Alt and an arrow jumps to the next year that moves most of the map; Home and End go to the ends of the record.',
    title: 'Drag to change the year. Press on a tick to land on that year exactly.\nTicks are years with a recorded event; the heavier ticks are years when somebody’s status changed.\nAbove the axis: a hollow ring is a date the sources do not settle, a filled square is a date that is firm but an account that is disputed. Open one for the reason.',
    'aria-valuemin': bounds.min, 'aria-valuemax': bounds.max, 'aria-valuenow': bounds.min,
    'aria-orientation': 'horizontal',
  }, marks, axis);

  const root = el('div.tl-ax', rail);

  let scale = makeScale(bounds.min, bounds.max, 600, 8, 8);
  let width = 600;
  let H = H_DEFAULT;
  let BASE = H_DEFAULT - RULE_DROP;

  /* The token is the single source of truth for how tall this drawing is; it
     is read at layout time rather than copied, so a media query that changes
     `--tl-rail-h` changes the geometry with it. */
  function readH() {
    let v = 0;
    try { v = parseFloat(getComputedStyle(root).getPropertyValue('--tl-rail-h')); } catch (_) { v = 0; }
    return Number.isFinite(v) && v >= 26 ? Math.round(v) : H_DEFAULT;
  }
  const pool = [];            // reusable mark buttons
  let clusters = [];          // the live set, rebuilt on every layout
  let roving = 0;

  function markButton(i) {
    let b = pool[i];
    if (!b) {
      b = el('button.tl-mark', { type: 'button', tabindex: '-1' },
        el('span.tl-mark__ring', { 'aria-hidden': 'true' }));
      b.__i = i;
      const show = (via) => { const c = clusters[b.__i]; if (c && onMark) onMark(c, b, via); };
      b.addEventListener('focus', () => show('focus'));
      b.addEventListener('mouseenter', () => show('hover'));
      b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const c = clusters[b.__i];
        if (!c) return;
        roving = b.__i;
        setRoving();
        onYear(c.rows[0].year, 'mark');
        show('click');
      });
      pool[i] = b;
      marks.append(b);
    }
    return b;
  }

  function setRoving() {
    for (let i = 0; i < clusters.length; i++) pool[i].tabIndex = i === roving ? 0 : -1;
  }

  /* Cluster by pixel, not by year: the same 24px pitch means one mark per
     target at any width, and a wide window simply resolves more of them. */
  function buildClusters() {
    clusters = [];
    let cur = null;
    for (const u of uncertain) {
      const x = scale.x(u.year);
      if (cur && x - cur.x0 < HIT) { cur.rows.push(u); cur.x1 = x; }
      else { cur = { x0: x, x1: x, rows: [u] }; clusters.push(cur); }
    }
    for (const c of clusters) {
      /* The button is placed on the cluster's first year, not its centroid: a
         new cluster begins only 24px or more to the right of that point, so no
         two 24px targets can overlap. */
      c.x = c.x0;
      c.from = c.rows[0].year;
      c.to = c.rows[c.rows.length - 1].year;
      c.kind = clusterKind(c.rows);
      c.n = c.rows.reduce((n, r) => n + r.reasons.length, 0);
    }

    for (let i = 0; i < clusters.length; i++) {
      const c = clusters[i];
      const b = markButton(i);
      b.hidden = false;
      b.style.left = c.x + 'px';
      b.dataset.kind = c.kind;
      b.dataset.year = c.from;
      b.dataset.years = c.rows.length;
      const one = c.rows.length === 1;
      const why = c.rows[0].reasons[0];
      const span = one ? String(c.from) : `${c.from}–${c.to}`;
      /* NO NUMERAL. Round 4: "the unlabelled numeral row … has no legend
         anywhere on screen." The figure was the number of years this 24px
         target happened to swallow at this window width — a fact about the
         rendering, not about the past, changing when the window is resized and
         meaning nothing to anyone. A cluster that holds more than one year says
         so with a second ring, and says how many in its title, its label and
         the sheet it opens. */
      b.title = one ? `${c.from} — ${why.label}` : `${span} — ${c.rows.length} years this atlas cannot settle`;
      b.setAttribute('aria-label', one
        ? (c.kind === 'what'
          ? `${c.from}: ${why.what}. The date is firm; the account is disputed — ${trim(why.note)}`
          : `${c.from}: ${why.what}. This date is not settled — ${why.label}. ${trim(why.note)}`)
          + (c.rows[0].reasons.length > 1 ? ` And ${c.rows[0].reasons.length - 1} more on this year.` : '')
        : `${span}: ${c.rows.length} years this atlas cannot settle, ${c.n} reasons in all. Press for the list.`);
    }
    for (let i = clusters.length; i < pool.length; i++) pool[i].hidden = true;
    if (roving >= clusters.length) roving = Math.max(0, clusters.length - 1);
    setRoving();
  }

  function layout(w) {
    width = Math.max(120, Math.round(w));
    H = readH();
    BASE = H - RULE_DROP;
    scale = makeScale(bounds.min, bounds.max, width, 10, 10);
    sheet.setAttribute('width', width);
    sheet.setAttribute('height', H);
    sheet.setAttribute('viewBox', `0 0 ${width} ${H}`);

    /* rulings. The main run's labels have priority; the compressed head keeps
       its own label only when there is room for it. */
    const ruleKids = [svg('line', { x1: scale.x0, y1: BASE, x2: width - 10, y2: BASE, class: 'tl-ax__base' })];
    const labelKids = [];
    let firstMainX = Infinity;
    for (const t of ticksFor(scale)) {
      const x = Math.round(scale.x(t.year)) + 0.5;
      ruleKids.push(svg('line', { x1: x, y1: BASE, x2: x, y2: BASE + (t.label ? 5 : 3), class: t.label ? 'tl-ax__major' : 'tl-ax__minor' }));
      if (t.label) {
        if (x < firstMainX) firstMainX = x;
        const tx = svg('text', { x, y: H - 1, class: 'tl-ax__yr' });
        tx.textContent = t.label;
        labelKids.push(tx);
      }
    }
    fill(gRule, ...ruleKids);
    fill(gLabels, ...labelKids);

    /* the axis break — a printed atlas convention, and it is labelled */
    fill(gBreak);
    if (scale.hasHead) {
      const bx = scale.breakX;
      gBreak.append(
        svg('line', { x1: bx - 3, y1: BASE + 4, x2: bx + 1, y2: BASE - 5, class: 'tl-ax__slash' }),
        svg('line', { x1: bx + 1, y1: BASE + 4, x2: bx + 5, y2: BASE - 5, class: 'tl-ax__slash' })
      );
      const ttl = svg('title');
      ttl.textContent = `The axis is broken here. ${bounds.min}–${BREAK_YEAR} is compressed into the short head on the left; the atlas's main run, ${BREAK_YEAR}–${bounds.max}, is at true scale.`;
      gBreak.append(ttl);
      /* The head label only prints when it cannot touch the first main label.
         Measured at 1024x640 with the old 34px threshold: "1200" ended two
         pixels inside "1600" and the axis opened on a collision. A centred
         "1600" needs half its width, and "1200" needs all of its own. */
      if (firstMainX - scale.x0 > 50) {
        const t0 = svg('text', { x: scale.x0, y: H - 1, class: 'tl-ax__yr tl-ax__yr--head' });
        t0.textContent = String(bounds.min);
        gLabels.prepend(t0);
      }
    }

    /* event ticks — texture on the axis. The events themselves are text, in the
       year row; these are only the shape of where they fall. */
    const tickKids = [];
    let lastX = -99;
    for (const t of eventTicks) {
      const x = Math.round(scale.x(t.year)) + 0.5;
      if (!t.heavy && x - lastX < 1.2) continue;      // never below a hairline apart
      lastX = x;
      const h = t.heavy ? 8 : 4;
      tickKids.push(svg('line', { x1: x, y1: BASE - 1, x2: x, y2: BASE - 1 - h, class: t.heavy ? 'tl-ax__ev tl-ax__ev--heavy' : 'tl-ax__ev' }));
    }
    fill(gTicks, ...tickKids);

    buildClusters();
    return scale;
  }

  function setYear(year) {
    handle.style.transform = `translateX(${scale.x(year)}px)`;
    rail.setAttribute('aria-valuenow', year);
  }
  function setValueText(text) { rail.setAttribute('aria-valuetext', text); }
  function setCompare(year) {
    if (year == null) { ghost.hidden = true; return; }
    ghost.hidden = false;
    ghostLbl.textContent = String(year);
    ghostLbl.setAttribute('aria-label', `This map is being compared against ${year}. Press to stop comparing.`);
    ghostLbl.title = `Compared against ${year} — press to clear`;
    ghostLbl.classList.toggle('is-left', scale.x(year) > width * 0.8);
    ghost.style.transform = `translateX(${scale.x(year)}px)`;
  }
  function yearAt(clientX) {
    const r = rail.getBoundingClientRect();
    return scale.year(clientX - r.left);
  }
  /* The 308 event ticks are inside an aria-hidden svg, because 308 focusable
     hairlines would wreck the tab order and every one of them is already a text
     card in the year row. But round 3 left them un-clickable too, so a student
     who could see a tick could not land on it: 1736 is a mark on the axis and
     the only way to reach it was to type the year. A press within four pixels
     of a tick now snaps to that tick's own year. Dragging is unaffected —
     scrubbing must stay continuous. */
  function snapYear(clientX) {
    const r = rail.getBoundingClientRect();
    const px = clientX - r.left;
    const raw = scale.year(px);
    let best = null, bestD = 4.5;
    for (const t of eventTicks) {
      const d = Math.abs(scale.x(t.year) - px);
      if (d <= bestD) { bestD = d; best = t.year; }
    }
    return best == null ? raw : best;
  }
  function eventTickAt(year) { return eventTicks.find((t) => t.year === year) || null; }
  function markAt(year) {
    const i = clusters.findIndex((c) => c.rows.some((r) => r.year === year));
    return i < 0 ? null : { c: clusters[i], b: pool[i] };
  }
  function focusMarks(dir) {
    if (!clusters.length) return;
    roving = Math.max(0, Math.min(clusters.length - 1, roving + dir));
    setRoving();
    pool[roving].focus();
  }

  return {
    root, rail, marks, layout, setYear, setValueText, setCompare, yearAt, snapYear, eventTickAt, markAt, focusMarks,
    get scale() { return scale; },
    get width() { return width; },
    get clusters() { return clusters; },
    get markCount() { return clusters.length; },
  };
}
