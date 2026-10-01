/* panels/dossier/claims.js — claim ids, the Ledger stamp, and the link chips.
 *
 * Charge 1 of docs/rival/WHY_PRINT_WINS.md: a causal argument dies in a
 * tooltip. Part (c) of the answer is that a link between two claims is an
 * object you can click, so causation survives a panel change.
 *
 * ONE WORD IS RESERVED. Round 2 labelled every chip BECAUSE, including chips
 * built from `eventIds`, `nestedWithin` and `becomes[]`. A chip reading
 * "BECAUSE Plassey → Bengal Presidency, 1757" asserts a causal relation that
 * the join underneath it does not carry — the record only says this step names
 * that event. So `because` now belongs to authored `causalLinks[]` and to
 * nothing else. Every other chip says what its join actually is:
 *
 *   because        <- causalLinks[] only, with the author's own reason printed
 *   named in this record <- eventIds on a step, a status period or the entry
 *   it replaced    <- precededBy
 *   it sat inside  <- nestedWithin
 *   the ground became -> departures[].becomes[] resolved through the geography
 *                   units to the territory that next held them
 *   the record names next -> succeededBy
 *   compare with   -> pedagogy.compareWith, relatedTerritories
 *
 * The dataset carries no `causalLinks[]` (0 of 260 entries). Round 3 therefore
 * printed "No chip on this page says BECAUSE" and shipped no argument at all.
 * The causation this atlas is prepared to state now lives in `causes.js`, in
 * one auditable table signed as ours, and is merged with any `causalLinks[]`
 * a shard may carry in future. Both render the reserved word; nothing else does.
 *
 * Emits: ledger:append { kind:'found', claimId, territoryId, year }
 *        dossier:navigate { from, to }
 */
import { causesFor, hasCause } from './causes.js';

const arr = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

export const claimId = (territoryId, kind, key) =>
  [territoryId, kind, key].filter((x) => x != null && x !== '').join(':');

/* ------------------------------------------------------------- the Ledger -- */

export function createLedger(bus) {
  const stamped = new Set();
  return {
    found(claim, meta) {
      if (!claim || stamped.has(claim)) return false;
      stamped.add(claim);
      bus.emit('ledger:append', { kind: 'found', claimId: claim, at: Date.now(), ...meta });
      return true;
    },
    has: (claim) => stamped.has(claim),
    size: () => stamped.size,
    all: () => [...stamped],
  };
}

/* --------------------------------------------------------- causal linking -- */

function territoryForEvent(data, ev, notId) {
  const ids = [ev.territoryId, ...arr(ev.territoryIds), ...arr(ev.links && ev.links.territories)];
  for (const id of ids) if (id && id !== notId && data.byId.has(id)) return id;
  for (const id of ids) if (id && data.byId.has(id)) return id;
  return null;
}

/** Which territory held these units after `year`? Real, computed, checkable. */
function successorForUnits(data, units, year, notId) {
  let best = null;
  for (const u of arr(units)) {
    for (const t of data.territoriesForUnit(u)) {
      if (t.id === notId) continue;
      const first = (t.spans || []).reduce((m, s) => (s.start >= year && (m == null || s.start < m) ? s.start : m), null);
      if (first == null) continue;
      if (!best || first < best.year) best = { id: t.id, name: t.name, year: first };
    }
  }
  return best;
}

/**
 * linksFor(data, territory, year) -> Map<claimId, link[]>
 * link = { rel, word, text, targetId, targetYear, targetName, basis }
 */
export function linksFor(data, territory, year) {
  const out = new Map();
  const add = (claim, link) => {
    if (!link || !link.targetId || !data.byId.has(link.targetId)) return;
    /* A link back to this same place is allowed only when it moves the year:
       "because of the revolution of 1919" is a real navigation even though the
       dossier does not change. A link that changes nothing is not a link. */
    if (link.targetId === territory.id && Number(link.targetYear) === Number(year)) return;
    if (!out.has(claim)) out.set(claim, []);
    const list = out.get(claim);
    if (list.some((l) => l.targetId === link.targetId && l.rel === link.rel && l.targetYear === link.targetYear)) return;
    /* Authored causation is the point of the rail and is never crowded out by
       cross-references; the cap applies to the joins we inferred. */
    if (!link.authored && list.length >= 4) return;
    if (list.length >= 5) return;
    list.push({ ...link, targetName: data.byId.get(link.targetId).name });
  };
  const findEvent = (eid) => (territory.events || []).find((e) => e.id === eid)
    || data.events.find((e) => e.id === eid) || null;
  const eventLink = (ev, word, rel, basis) => {
    const tid = territoryForEvent(data, ev, territory.id) || (data.byId.has(territory.id) ? territory.id : null);
    if (!tid) return null;
    return { rel, word, text: ev.title || ev.id, targetId: tid, targetYear: ev.year, basis };
  };

  /* --- authored causation, FIRST ----------------------------------------
     The only place the word BECAUSE is allowed. A causal link is a claim an
     author made, with a reason printed verbatim under the rail; it is not a
     join we inferred from two fields sharing an id. It is added before the
     inferred joins so that a place with a lot of cross-references can never
     push the argument off the end of its own rail. */
  const authored = [
    ...arr(territory.causalLinks).filter((c) => c && c.to).map((c) => ({
      to: c.to,
      year: Number.isFinite(c.year) ? c.year : null,
      word: c.word || 'because',
      text: c.text || null,
      because: c.because || c.reason || 'this atlas states the causal link in causalLinks[]',
      section: c.section || null,
      onKind: c.fromKind || 'why',
      onKey: c.fromKey ?? null,
      direction: 'forward',
    })),
    ...causesFor(territory.id),
  ];
  for (const c of authored) {
    const t = data.byId.get(c.to);
    add(claimId(territory.id, c.onKind || 'why', c.onKey ?? null), {
      rel: c.direction === 'back' ? 'causedby' : 'because',
      word: c.word,
      text: c.text || (t ? t.name : c.to),
      targetId: c.to,
      targetYear: Number.isFinite(c.year) ? c.year : (t ? bestYearFor(t, year) : year),
      targetSection: c.section || null,
      basis: c.because,
      cite: c.cite || null,
      authored: true,
    });
  }

  /* --- acquisitions ------------------------------------------------------ */
  for (const a of territory.acquisitions || []) {
    const cid = claimId(territory.id, 'taken', a.id);
    for (const eid of arr(a.eventIds)) {
      const ev = findEvent(eid);
      if (ev) add(cid, eventLink(ev, 'named in this record', 'named', 'this step’s own record names this event'));
    }
    for (const p of arr(territory.precededBy)) {
      add(cid, { rel: 'replaced', word: 'it replaced', text: (data.byId.get(p) ? data.byId.get(p).name : p), targetId: p, targetYear: a.year, basis: 'the record for this place names it as what this replaced' });
    }
  }

  /* --- departures -------------------------------------------------------- */
  for (const d of territory.departures || []) {
    const cid = claimId(territory.id, 'ended', d.id);
    for (const b of arr(d.becomes)) {
      const succ = successorForUnits(data, b.units && b.units.length ? b.units : d.units, d.year || year, territory.id);
      if (succ) {
        add(cid, { rel: 'became', word: 'the ground became', text: b.name || succ.name, targetId: succ.id, targetYear: succ.year, basis: 'the units it left were next held by this territory' });
      } else if (d.year != null) {
        /* Most successors are sovereign states, and a British atlas has no
           dossier for them. The chip still has somewhere true to go: the year
           this place stopped being British, where the departure's own evidence
           sits. */
        add(cid, { rel: 'became', word: 'the ground became', text: b.name, targetId: territory.id, targetYear: d.year, basis: 'becomes[] in this departure’s record; no atlas territory holds these units afterwards, so this goes to the year it happened' });
      }
    }
    for (const sId of arr(territory.succeededBy)) {
      add(cid, { rel: 'succeeded', word: 'the record names next', text: data.byId.get(sId) ? data.byId.get(sId).name : sId, targetId: sId, targetYear: d.year || year, basis: 'the record for this place names it as what came next' });
    }
    for (const eid of arr(d.eventIds)) {
      const ev = findEvent(eid);
      if (ev) add(cid, eventLink(ev, 'named in this record', 'named', 'this departure’s own record names this event'));
    }
  }

  /* --- the status claim -------------------------------------------------- */
  const statusClaim = claimId(territory.id, 'status', year);
  if (territory.nestedWithin) {
    add(statusClaim, { rel: 'inside', word: 'it sat inside', text: data.byId.get(territory.nestedWithin) ? data.byId.get(territory.nestedWithin).name : territory.nestedWithin, targetId: territory.nestedWithin, targetYear: year, basis: 'the record for this place files it inside that one' });
  }
  for (const s of territory.spans || []) {
    if (!(s.start <= year && (s.end == null || year <= s.end))) continue;
    for (const eid of arr(s.raw && s.raw.eventIds)) {
      const ev = findEvent(eid);
      if (ev) add(statusClaim, eventLink(ev, 'named in this record', 'named', 'this status period’s own record names this event'));
    }
  }

  /* --- the events this territory is filed under -------------------------- */
  const whyClaim = claimId(territory.id, 'why', null);
  for (const eid of arr(territory.eventIds)) {
    const ev = findEvent(eid);
    if (ev) add(whyClaim, eventLink(ev, 'filed under', 'event', 'this entry’s own list of events names it'));
  }

  /* --- the misconception ------------------------------------------------- */
  const misClaim = claimId(territory.id, 'misconception', null);
  for (const c of arr(territory.pedagogy && territory.pedagogy.compareWith)) {
    const t = data.byId.get(c);
    add(misClaim, { rel: 'compare', word: 'compare with', text: t ? t.name : c, targetId: c, targetYear: t ? bestYearFor(t, year) : year, basis: 'this entry’s own teaching notes ask you to compare the two' });
  }
  for (const c of arr(territory.relatedTerritories)) {
    const t = data.byId.get(c);
    add(misClaim, { rel: 'compare', word: 'connected to', text: t ? t.name : c, targetId: c, targetYear: t ? bestYearFor(t, year) : year, basis: 'the record for this place lists it as connected' });
  }

  return out;
}

/** Does this entry carry causation an author wrote down, or only joins? */
export function hasAuthoredCause(territory) {
  if (!territory) return false;
  return arr(territory.causalLinks).some((c) => c && c.to) || hasCause(territory.id);
}

/** A year at which the target territory actually has something to show. */
export function bestYearFor(t, year) {
  const spans = t.spans || [];
  if (!spans.length) return year;
  for (const s of spans) if (s.start <= year && (s.end == null || year <= s.end)) return year;
  return spans[0].start;
}

/* ------------------------------------------------------------- navigation -- */

export function createNav(store, bus) {
  const stack = [];
  const snapshot = () => {
    const s = store.getState();
    /* mapView too: a chip fires ask:flyTo, so without it Back returns to the
       right year and the right place but a different piece of the world. */
    return { year: s.year, sel: s.selectedTerritoryId, layer: s.activeLayer, view: s.mapView };
  };
  /* Where the chip asked the target panel to land, consumed by the renderer on
     the next paint. */
  let pendingSection = null;

  const restore = (prev) => {
    store.batch((d) => {
      d('setYear', prev.year);
      if (prev.sel) d('select', prev.sel); else d('deselect');
      /* Acceptance test 5: "Back returns exactly where you were." Round 2
         dispatched `setMapView(null)` when the view had never been written to
         the store, and the map ignores a null view — so Back came home to the
         right year and the right place at 14x on somebody else's coastline.
         A view that was never set was the whole world, so that is what Back
         restores. */
      d('setMapView', prev.view || { k: 1, x: 0, y: 0 });
    });
  };

  return {
    go(targetId, targetYear, section) {
      const from = snapshot();
      stack.push(from);
      pendingSection = section || null;
      store.batch((d) => {
        if (Number.isFinite(targetYear)) d('setYear', targetYear);
        d('select', targetId);
      });
      bus.emit('dossier:navigate', { from, to: { sel: targetId, year: targetYear, section: section || null } });
      bus.emit('ask:flyTo', { territoryId: targetId });
    },
    back() {
      const prev = stack.pop();
      if (!prev) return false;
      pendingSection = null;
      restore(prev);
      bus.emit('dossier:navigate', { from: snapshot(), to: prev, back: true });
      return true;
    },
    /* The browser's own Back button. Round 3 kept a private stack and never
       heard about `popstate`, so after a chip and a browser Back the panel
       still printed "← Back to Bengal Presidency, 1857" ON the Bengal
       Presidency 1857 panel, and the map stayed over western India where the
       chip's flight had left it. The stack is now reconciled with history:
       if the state we have popped back into is the one on top of our stack,
       that is our Back, and it restores the viewport it saved. */
    popped(state) {
      const prev = stack[stack.length - 1];
      if (!prev) return false;
      const same = (prev.sel || null) === (state.selectedTerritoryId || null)
        && Number(prev.year) === Number(state.year);
      if (!same) { stack.length = 0; return false; }
      stack.pop();
      pendingSection = null;
      if (prev.view) store.dispatch('setMapView', prev.view);
      else store.dispatch('setMapView', { k: 1, x: 0, y: 0 });
      return true;
    },
    takeSection() { const s = pendingSection; pendingSection = null; return s; },
    depth: () => stack.length,
    peek: () => stack[stack.length - 1] || null,
    clear: () => { stack.length = 0; pendingSection = null; },
  };
}
