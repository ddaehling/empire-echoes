/* =============================================================================
   layers/overlay.js — THE MARKS THAT ARE NOT FILLS.
   Owner: P06.

   Four of this piece's layers cannot be said with a fill:

     · the pressure haze, whose radius is a cited quantity and whose ABSENCE is
       the point wherever the quantity does not exist;
     · the pins for revolt, killing and famine, which happen at a point on a
       date and not over a polygon for a century;
     · the stitching's nodes and its dated links, which are the empire read as
       a network rather than as ground.

   Everything here is drawn into `[data-mount="map-overlay"]`, the slot the
   shell reserves over the plate and which LAYOUT_BUDGET B5 names as one of the
   three places something may stand on the map. The <svg> itself is
   `pointer-events: none`, which matters for a reason that is not obvious: P02
   treats every pointer-receiving child of every mount slot as an obstacle its
   label placer must route around, so a full-plate SVG that took pointer events
   would silently delete every name on the map. Only the marks take events.

   Positions come from `plate.unitScreen(unitId)` — P02's own published
   projection of a unit into CSS pixels, including the deconflicted position of
   a minimum-size mark — so a mark can never drift from the place it names.
   Nothing here computes a route, a distance or a duration.
   ========================================================================== */

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (name, attrs = {}) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, String(attrs[k]));
  return n;
};

/* Marks are shapes as well as colours (DESIGN §6.4): a reader who cannot tell
   the madder from the brown still reads a circle against a cross against a
   triangle. */
function glyph(kind, x, y, r) {
  if (kind === 'massacre') {
    const g = svgEl('path', { d: `M${x - r} ${y - r}L${x + r} ${y + r}M${x + r} ${y - r}L${x - r} ${y + r}` });
    g.setAttribute('class', 'ly-pin__glyph ly-pin__glyph--x');
    return g;
  }
  if (kind === 'famine') {
    const g = svgEl('path', { d: `M${x} ${y - r * 1.15}L${x + r} ${y + r * 0.75}L${x - r} ${y + r * 0.75}Z` });
    g.setAttribute('class', 'ly-pin__glyph ly-pin__glyph--tri');
    return g;
  }
  /* A RING, NOT A DISC. Round 1 drew a rising as a filled madder circle, which
     is exactly what P02 draws for a unit too small to have a shape — so on the
     Caribbean plate at 1860 the risings were indistinguishable from the islands
     they happened on. A ring reads as an annotation over the map rather than as
     a piece of it. */
  const c = svgEl('circle', { cx: x, cy: y, r: r * 1.35 });
  c.setAttribute('class', 'ly-pin__glyph ly-pin__glyph--ring');
  return c;
}

const ROLE_SHAPE = {
  'metropole': 'square',
  'naval base': 'square',
  'coaling station': 'dot',
  'cable station': 'diamond',
  'chokepoint': 'bar',
  'terminus': 'diamond',
};

function nodeGlyph(role, x, y) {
  const s = ROLE_SHAPE[role] || 'dot';
  if (s === 'square') return svgEl('rect', { x: x - 4.5, y: y - 4.5, width: 9, height: 9 });
  if (s === 'diamond') return svgEl('path', { d: `M${x} ${y - 5.5}L${x + 5.5} ${y}L${x} ${y + 5.5}L${x - 5.5} ${y}Z` });
  if (s === 'bar') return svgEl('rect', { x: x - 6, y: y - 2.5, width: 12, height: 5 });
  return svgEl('circle', { cx: x, cy: y, r: 4.5 });
}

export class Overlay {
  constructor(host, { onActivate, format }) {
    this.host = host;
    this.onActivate = onActivate || (() => {});
    this.format = format;
    this.el = svgEl('svg', { class: 'ly-over', 'aria-hidden': 'false', focusable: 'false' });
    this.el.setAttribute('role', 'presentation');
    this.defs = svgEl('defs');
    this.el.appendChild(this.defs);
    this.gLinks = svgEl('g', { class: 'ly-links' });
    this.gHaze = svgEl('g', { class: 'ly-hazes' });
    this.gMarks = svgEl('g', { class: 'ly-marks' });
    this.el.append(this.gLinks, this.gHaze, this.gMarks);
    host.appendChild(this.el);
    this.items = [];        // focusable marks, in draw order
    this.active = 0;
    this._wireKeys();
  }

  destroy() { this.el.remove(); }

  clear() {
    this.gLinks.replaceChildren();
    this.gHaze.replaceChildren();
    this.gMarks.replaceChildren();
    this.defs.replaceChildren();
    this.items = [];
  }

  /** Size and offset the canvas so overlay pixels are plate pixels. */
  fit(rect, offset) {
    this.el.setAttribute('viewBox', `0 0 ${Math.max(1, rect.w)} ${Math.max(1, rect.h)}`);
    this.el.setAttribute('width', Math.max(1, rect.w));
    this.el.setAttribute('height', Math.max(1, rect.h));
    this.el.style.transform = offset && (offset.x || offset.y)
      ? `translate(${offset.x}px, ${offset.y}px)` : '';
  }

  /* ------------------------------------------------------------ the haze -- */

  /**
   * One circle per informal place. Area is proportional to the cited value, so
   * the RADIUS is its square root — a linear radius would make Argentina look
   * nine times Uruguay when it is nine times by money and one hundredth by
   * anything else. A place with no figure gets a broken ring at a fixed size
   * and the words "no figure", never a small haze, because a small haze is a
   * claim that the pressure was small.
   */
  drawPressure(places, { maxValue, maxRadius = 62, showValues = true }) {
    /* Where a value label has already been printed. Uruguay's node sits inside
       Argentina's haze, so at 1900 "£320m" and "£36m" were set 14 pixels apart
       and read as one string. A label that would land on top of another is put
       BELOW its node instead of above it; nothing is dropped, because a figure
       this atlas can cite is the whole content of this layer. */
    const placed = [];
    const clear = (x, y) => !placed.some((q) => Math.abs(q.x - x) < 34 && Math.abs(q.y - y) < 13);
    for (const p of places) {
      if (!p.at) continue;
      const { x, y } = p.at;
      if (p.value == null) {
        const ring = svgEl('circle', { cx: x, cy: y, r: 13, class: 'ly-haze__none' });
        this.gHaze.appendChild(ring);
        const dot = svgEl('circle', { cx: x, cy: y, r: 2.2, class: 'ly-haze__node' });
        this.gHaze.appendChild(dot);
        this._hit(x, y, 22, {
          label: `${p.name}: inside the British sphere, and this atlas has no cited figure for it. ${p.why || ''}`,
          onActivate: () => this.onActivate({ kind: 'pressure', place: p }),
        });
        continue;
      }
      const r = Math.max(10, maxRadius * Math.sqrt(p.value / maxValue));
      const id = 'ly-haze-' + p.unitId.replace(/[^\w-]/g, '');
      const grad = svgEl('radialGradient', { id });
      grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': 'var(--ly-haze)', 'stop-opacity': '0.46' }));
      grad.appendChild(svgEl('stop', { offset: '62%', 'stop-color': 'var(--ly-haze)', 'stop-opacity': '0.20' }));
      grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': 'var(--ly-haze)', 'stop-opacity': '0' }));
      this.defs.appendChild(grad);
      this.gHaze.appendChild(svgEl('circle', { cx: x, cy: y, r, fill: `url(#${id})`, class: 'ly-haze__fill' }));
      this.gHaze.appendChild(svgEl('circle', { cx: x, cy: y, r, class: 'ly-haze__edge' }));
      this.gHaze.appendChild(svgEl('circle', { cx: x, cy: y, r: 2.2, class: 'ly-haze__node' }));
      if (showValues) {
        let ly = y - r - 5;
        if (!clear(x, ly)) ly = y + r + 13;
        if (!clear(x, ly)) ly = y - 9;
        placed.push({ x, y: ly });
        const t = svgEl('text', { x, y: ly, class: 'ly-haze__val', 'text-anchor': 'middle' });
        t.textContent = '£' + p.value + 'm';
        this.gHaze.appendChild(t);
      }
      this._hit(x, y, Math.max(22, r * 0.5), {
        label: `${p.name}: about £${p.value} million of British capital in 1913, on Feis's reconstruction. Never claimed, never governed.`,
        onActivate: () => this.onActivate({ kind: 'pressure', place: p }),
      });
    }
  }

  /* ------------------------------------------------------------- the pins - */

  drawPins(pins) {
    for (const p of pins) {
      if (!p.at) continue;
      const { x, y } = p.at;
      const g = svgEl('g', { class: 'ly-pin', 'data-kind': p.kind, 'data-recent': p.recent ? 'yes' : 'no' });
      g.appendChild(glyph(p.kind, x, y, p.recent ? 5.5 : 4));
      this.gMarks.appendChild(g);
      this._hit(x, y, 22, { label: p.label, onActivate: () => this.onActivate({ kind: 'pin', pin: p }) });
    }
  }

  /* --------------------------------------------------------- the network -- */

  /**
   * Links first, so a node is never drawn under its own cable. A link whose
   * endpoints sit more than half a world apart on screen is crossing the edge
   * of the map, so it is drawn twice, once off each side — the world wraps and
   * a straight line across the whole plate would be a lie about where the
   * cable ran.
   */
  drawNetwork(links, nodes, { worldW }) {
    for (const l of links) {
      if (!l.a.at || !l.b.at) continue;
      const cls = 'ly-link ly-link--' + l.kind;
      const dx = l.b.at.x - l.a.at.x;
      const wrap = worldW && Math.abs(dx) > worldW / 2;
      const title = `${l.aName} to ${l.bName}, ${l.kind === 'cable' ? 'cable' : 'route'}, from ${l.fromYear}`;
      const line = (x1, y1, x2, y2) => {
        const n = svgEl('line', { x1, y1, x2, y2, class: cls });
        n.appendChild(this._title(title));
        this.gLinks.appendChild(n);
      };
      if (!wrap) {
        line(l.a.at.x, l.a.at.y, l.b.at.x, l.b.at.y);
      } else {
        const sign = dx > 0 ? -1 : 1;
        line(l.a.at.x, l.a.at.y, l.b.at.x + sign * worldW, l.b.at.y);
        line(l.a.at.x - sign * worldW, l.a.at.y, l.b.at.x, l.b.at.y);
      }
    }
    for (const n of nodes) {
      if (!n.at) continue;
      const g = svgEl('g', { class: 'ly-node', 'data-role': (n.role || '').replace(/\s+/g, '-') });
      const shape = nodeGlyph(n.role, n.at.x, n.at.y);
      shape.setAttribute('class', 'ly-node__glyph');
      g.appendChild(shape);
      this.gMarks.appendChild(g);
      this._hit(n.at.x, n.at.y, 22, {
        label: `${n.name}: ${n.role}, from ${n.fromYear}${n.toYear ? ' to ' + n.toYear : ''}. ${n.note || ''}`,
        onActivate: () => this.onActivate({ kind: 'node', node: n }),
        cls: 'ly-hit--node',
      });
    }
  }

  /* -------------------------------------------------------------- plumbing */

  _title(text) {
    const t = svgEl('title');
    t.textContent = text;
    return t;
  }

  /**
   * A 44-pixel target, which is the floor for a finger and the floor rule 4 of
   * FEATURE_SPEC P06 asserts for the stitching's nodes. It is transparent, it
   * carries the accessible name, and it is the only thing in this overlay that
   * receives a pointer.
   */
  _hit(x, y, r, { label, onActivate, cls = '' }) {
    const c = svgEl('circle', {
      cx: x, cy: y, r: Math.max(22, r),
      class: 'ly-hit ' + cls,
      role: 'button', tabindex: '-1',
    });
    c.setAttribute('aria-label', String(label || '').trim());
    c.appendChild(this._title(String(label || '').trim()));
    c.addEventListener('click', (ev) => { ev.stopPropagation(); onActivate(); });
    c.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); onActivate(); }
    });
    c.addEventListener('focus', () => { this.active = this.items.indexOf(c); });
    this.gMarks.appendChild(c);
    this.items.push(c);
    if (this.items.length === 1) c.setAttribute('tabindex', '0');
    return c;
  }

  /** A roving tabindex: one tab stop for the whole layer, arrows walk it. */
  _wireKeys() {
    this.el.addEventListener('keydown', (ev) => {
      if (!this.items.length) return;
      const step = ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1
        : ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1
          : ev.key === 'Home' ? -Infinity : ev.key === 'End' ? Infinity : 0;
      if (!step) return;
      ev.preventDefault();
      const n = this.items.length;
      const next = step === -Infinity ? 0 : step === Infinity ? n - 1 : (this.active + step + n) % n;
      for (const it of this.items) it.setAttribute('tabindex', '-1');
      this.items[next].setAttribute('tabindex', '0');
      this.items[next].focus();
      this.active = next;
    });
  }

  /** Keep the tab stop alive across a redraw. */
  restoreFocus(index) {
    if (!this.items.length) return;
    const i = Math.min(Math.max(0, index || 0), this.items.length - 1);
    for (const it of this.items) it.setAttribute('tabindex', '-1');
    this.items[i].setAttribute('tabindex', '0');
    this.active = i;
  }
}

export default { Overlay };
