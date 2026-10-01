/**
 * viz/plate.js — THE TENSION PLATE. FEATURE_SPEC charge 3, P08.
 *
 * The charge print makes: "a reader holds three paragraphs in tension; a
 * click-driven UI serialises." Tabs serialise. Accordions serialise. Hover
 * cards serialise and then hide the evidence again. So this component has
 * none of them.
 *
 * WHAT IT IS. A 2×2 field. Four claims about one subject, all true, all
 * rendered permanently and simultaneously, no scroll at ≥62rem, nothing behind
 * a hover, no tab, no accordion, no disclosure triangle. Landing on any figure
 * — with the pointer OR with the keyboard, identically — lights the same
 * figure in whichever of the other cells it also appears in, and paints its
 * units on the map, which stays live beside this panel. Lighting is emphasis
 * and never content: nothing appears on hover that was not already on screen.
 *
 * THEN THE MOVE PRINT CANNOT MAKE. "Pick the one you think is the real story."
 * The chosen claim promotes to the full width of the field; the other three
 * slide into a strip headed "what this version has to leave out", each showing
 * the sentence it must strike through, struck through. The choice is written to
 * the Ledger as `collapsed`, so it comes back at the Close in the student's own
 * words. "Put them back" restores the field.
 *
 * Under 62rem the field stacks in DOM order. It never becomes tabs.
 */

import { el, fill } from '../core/util.js';
import { FIGURES } from './content.js';
import { figure, citation, warrantLine, checkWarrant } from './figures.js';

export function buildPlate(ctx, plate) {
  const { data, bus } = ctx;
  const root = el('div.viz.viz-plate', { dataset: { plate: plate.id, mode: 'field' } });

  /* --- the instruction, above the field. Two lengths for the same reason the
     claims have two: on a short window the shorter complete sentence is shown
     and the longer one is not rendered. */
  const ask = el('p.viz-plate__ask', { text: plate.ask });
  const askShort = plate.askShort ? el('p.viz-plate__ask.viz-plate__ask--short', { text: plate.askShort }) : null;

  /* --- the field ------------------------------------------------------- */
  const field = el('div.viz-plate__field', { role: 'group', 'aria-label': 'Four claims, all true' });
  const cells = new Map();

  for (const claim of plate.claims) {
    const cell = el('article.viz-claim.cx-panel.cx-panel--tight', { dataset: { claim: claim.id } });
    const h = el('h3.viz-claim__t', { text: claim.title, tabindex: '-1' });
    const figs = el('p.viz-claim__figs');
    for (const fid of claim.figures) {
      const spec = FIGURES[fid];
      if (!spec) continue;
      figs.append(figure(data, spec, {
        hint: spec.year
          ? ' — lights this figure wherever else it is printed; press to take the map to ' + spec.year
          : ' — lights this figure wherever else it is printed',
      }));
    }
    /* Two lengths of the same sentence. On a short window the SHORTER one is
       shown and the longer one is not rendered — LAYOUT_BUDGET's rule is that a
       piece that does not fit sheds content, never type, and never prints a
       sentence cut mid-word. Both are complete sentences. */
    const body = el('p.viz-claim__b', { text: claim.body });
    const bodyShort = claim.short ? el('p.viz-claim__b.viz-claim__b--short', { text: claim.short }) : null;
    const pick = el('button.viz-claim__pick', {
      type: 'button',
      'aria-label': 'Pick “' + claim.title + '” as the real story',
      text: 'This is the real story',
      onclick: () => collapse(claim.id),
    });
    cell.append(h, figs, body, bodyShort, pick);

    /* The warrant: the dataset's own sentence, with the figure's words marked,
       and the work it rests on. A number in a chart with no visible parent is
       the easiest lie in software; this is the parent, printed. */
    const wf = FIGURES[claim.warrantFig];
    if (wf) {
      const wl = warrantLine(data, wf);
      if (wl) cell.append(wl);
      const c = citation(data, wf);
      if (c) cell.append(c);
    }
    cells.set(claim.id, cell);
    field.append(cell);
  }

  /* --- the discard strip ----------------------------------------------- */
  const strip = el('section.viz-strip', { hidden: true });
  const stripHead = el('h3.viz-strip__h', { text: 'What this version has to leave out' });
  const stripList = el('ul.viz-strip__l');
  const putBack = el('button.cx-more.viz-strip__back', {
    type: 'button', text: 'Put them back',
    onclick: () => restore(),
  });
  strip.append(stripHead, stripList, putBack);

  root.append(ask, askShort, field, strip);

  /* ================================================ cross-lighting ====== */
  /**
   * One fact, one id, wherever it is printed. Landing on it lights every other
   * printing of it and asks the map to paint the units it is about. It adds no
   * information — the rule in FEATURE_SPEC P08 test 4 — it only says "this
   * number and that number are the same number".
   */
  let lit = null;
  let paintT = 0;

  function light(fid, source) {
    if (lit === fid) return;
    lit = fid;
    for (const n of root.querySelectorAll('.viz-fig')) {
      n.dataset.lit = n.dataset.fig === fid && fid ? 'yes' : '';
    }
    clearTimeout(paintT);
    paintT = setTimeout(() => {
      if (lit !== fid) return;
      const spec = fid && FIGURES[fid];
      const units = spec ? unitsOf(data, spec) : [];
      if (spec && units.length) {
        bus.emit('ask:paintUnits', { unitIds: units, reason: spec.print + ' ' + (spec.unit || '') });
      } else if (!fid) {
        bus.emit('ask:paintUnits', { unitIds: [], reason: 'viz:clear' });
      }
      bus.emit('viz:figure', fid ? {
        id: fid, print: spec.print, unit: spec.unit || '', year: spec.year || null,
        unitIds: units, source: source || 'plate',
      } : { id: null });
    }, 90);
  }

  root.addEventListener('pointerover', (ev) => {
    const f = ev.target.closest && ev.target.closest('.viz-fig');
    if (f && !f.dataset.bad) light(f.dataset.fig, 'pointer');
  });
  root.addEventListener('pointerleave', () => { if (!root.contains(document.activeElement)) light(null, 'pointer'); });
  root.addEventListener('focusout', (ev) => {
    if (!ev.relatedTarget || !root.contains(ev.relatedTarget)) light(null, 'keyboard');
  });
  root.addEventListener('focusin', (ev) => {
    const f = ev.target.closest && ev.target.closest('.viz-fig');
    if (f && !f.dataset.bad) light(f.dataset.fig, 'keyboard');
  });
  root.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const f = ev.target.closest && ev.target.closest('.viz-fig');
    if (!f || f.dataset.bad) return;
    ev.preventDefault();
    const spec = FIGURES[f.dataset.fig];
    if (spec && spec.year) bus.emit('ask:setYear', { year: spec.year });
    light(f.dataset.fig, 'keyboard');
  });
  root.addEventListener('click', (ev) => {
    const f = ev.target.closest && ev.target.closest('.viz-fig');
    if (!f || f.dataset.bad) return;
    const spec = FIGURES[f.dataset.fig];
    if (spec && spec.year) bus.emit('ask:setYear', { year: spec.year });
  });

  /* ================================================ the collapse ======== */

  function collapse(id) {
    const chosen = plate.claims.find((c) => c.id === id);
    if (!chosen) return;
    /* The cross-light was emphasis on a field that no longer exists. Put the
       map back before promoting anything. */
    light(null, 'collapse');
    root.dataset.mode = 'collapsed';
    root.dataset.chosen = id;
    for (const [cid, cell] of cells) cell.dataset.state = cid === id ? 'chosen' : 'discarded';

    fill(stripList, ...plate.claims.filter((c) => c.id !== id).map((c) => el('li.viz-strip__i',
      el('s.viz-strip__s', { text: c.strike }),
      el('span.cx-note.viz-strip__w', { text: c.cost }))));
    strip.hidden = false;
    const line = '“' + chosen.title + '” is the story you picked. Three true sentences have to go.';
    ask.textContent = line;
    if (askShort) askShort.textContent = line;

    bus.emit('ledger:append', {
      kind: 'collapsed',
      claimId: 'p08:plate:' + plate.id,
      t: plate.t || null,
      prompt: plate.ask,
      youSaid: chosen.title,
      answer: plate.claims.filter((c) => c.id !== id).map((c) => c.strike).join(' '),
      year: plate.year || null,
    });
    bus.emit('viz:collapsed', { plate: plate.id, claim: id, title: chosen.title });
    if (ctx.util && ctx.util.announce) {
      ctx.util.announce('You picked: ' + chosen.title + '. Three sentences it has to leave out are now struck through below.');
    }
    /* Land on the promoted claim, not on the control at the far end of the
       panel: focusing "Put them back" scrolled the sheet past the very sentence
       the reader had just chosen. */
    const scroller = root.closest('.cx-sheet__body') || root.parentElement;
    if (scroller) scroller.scrollTop = 0;
    const head = cells.get(id) && cells.get(id).querySelector('.viz-claim__t');
    if (head) head.focus({ preventScroll: true });
  }

  function restore() {
    root.dataset.mode = 'field';
    delete root.dataset.chosen;
    for (const [, cell] of cells) cell.dataset.state = '';
    strip.hidden = true;
    ask.textContent = plate.ask;
    if (askShort) askShort.textContent = plate.askShort;
    bus.emit('viz:collapsed', { plate: plate.id, claim: null });
  }

  return {
    node: root,
    collapse,
    restore,
    /** Which figures failed their warrant, for the acceptance tests. */
    defects: () => [...root.querySelectorAll('.viz-fig--bad')].length,
    destroy() { clearTimeout(paintT); bus.emit('ask:paintUnits', { unitIds: [], reason: 'viz:clear' }); },
  };
}

/** The units a figure is about, taken from its own record — never authored. */
export function unitsOf(data, spec) {
  const w = spec && spec.warrant;
  const r = checkWarrant(data, w).record;
  if (!r) return [];
  if (r.links && Array.isArray(r.links.units)) return r.links.units.slice(0, 40);
  if (Array.isArray(r.units)) return r.units.slice(0, 40);
  return [];
}
