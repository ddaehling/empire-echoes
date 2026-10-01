/**
 * search/lens.js — the evidence lens.
 *
 * FEATURE_SPEC §1 charge 7, second half: "filter the atlas by source so every
 * claim resting only on post-2011 disclosure greys out, captioned as exactly
 * that." Two instruments, one surface, both computed from our own citation
 * years and from nothing else.
 *
 *   BY DATE. Set a publication year. Every territory that keeps at least one
 *   cited work published by then stays on the plate; the rest grey out. Drag
 *   it back to 1945 and most of this atlas goes grey, because most of the
 *   history of the British empire was written after the empire ended.
 *
 *   BY WORK. Pick one of the 627 cited works and the map paints only the
 *   places whose claims rest on it. This is how a student finds out that a
 *   region they thought was solidly evidenced is carried by two books.
 *
 * THE CAPTION IS LOAD-BEARING and it is the reason this piece is honest. A
 * grey unit does not mean nobody knew. It means THIS ATLAS cites nothing
 * older. Anderson's *Histories of the Hanged* and Elkins's *Britain's Gulag*
 * both appeared in 2005, six years before the Hanslope files were disclosed,
 * and they established the detention system from other records. The lens is
 * a fact about our bibliography. It is never a dramatised deletion.
 */

import { el } from '../core/util.js';

export const STOPS = [1945, 1963, 1990, 2005, 2011];

/** Earliest and latest cited publication year for every territory. */
export function citationYears(data) {
  const by = new Map();
  for (const t of data.territories) {
    let lo = Infinity, hi = -Infinity, n = 0;
    const eat = (list) => {
      for (const e of list || []) {
        const y = Number(e && e.year);
        if (!Number.isFinite(y)) continue;
        n++; if (y < lo) lo = y; if (y > hi) hi = y;
      }
    };
    eat(t.evidence);
    for (const a of t.acquisitions || []) eat(a.evidence);
    for (const d of t.departures || []) eat(d.evidence);
    by.set(t.id, { lo: n ? lo : null, hi: n ? hi : null, n });
  }
  return by;
}

/** Which units survive a given publication-year threshold. */
export function surviving(data, years, before) {
  const units = new Set();
  const kept = [], greyed = [];
  for (const t of data.territories) {
    const c = years.get(t.id);
    const ok = c && c.lo != null && c.lo <= before;
    (ok ? kept : greyed).push(t);
    if (ok) for (const u of t.units || []) units.add(u);
  }
  return { units: [...units], kept, greyed };
}

/**
 * Build the sheet body. `onApply(state)` is called whenever the reader changes
 * the lens; the module turns that into `ask:paintUnits` and a URL filter.
 */
export function buildLens(ctx, opts) {
  const { data, format } = ctx;
  const years = citationYears(data);
  const { onApply, onClear, sources, initial } = opts;

  const root = el('div.lens');
  const figures = el('p.lens__figures');
  const detail = el('div.lens__detail');
  let mode = (initial && initial.mode) || 'date';
  let before = (initial && initial.before) || 2011;
  let work = (initial && initial.work) || null;

  const total = data.territories.length;

  /* ---- the sentence, and the caption that keeps it honest -------------- */
  root.append(
    el('p.lens__say', 'Every claim in this atlas is attached to a work we can name. '
      + 'This asks a different question of the map: ',
      el('strong', { text: 'which of these places could this atlas still describe using only the works published by a given year?' })),
  );

  /* ---- by date --------------------------------------------------------- */
  const stopRow = el('div.lens__stops', { role: 'group', 'aria-label': 'Publication year' });
  const stopBtns = new Map();
  for (const y of STOPS) {
    const b = el('button.lens__stop', {
      type: 'button', 'aria-pressed': 'false',
      onclick: () => { mode = 'date'; before = y; work = null; apply(); },
    }, el('span.num', { text: String(y) }));
    stopBtns.set(y, b);
    stopRow.append(b);
  }
  const allBtn = el('button.lens__stop.lens__stop--off', {
    type: 'button',
    onclick: () => { mode = 'off'; work = null; apply(); },
  }, 'lens off');
  stopRow.append(allBtn);

  root.append(
    el('p.cx-panel__head', { text: 'By the year a work was published' }),
    stopRow,
    figures,
    detail,
  );

  /* ---- the caption ----------------------------------------------------- */
  root.append(el('p.cx-note.lens__caution',
    el('strong', { text: 'This is a fact about our bibliography, not about what was knowable. ' }),
    'A greyed place means this atlas cites nothing published by that year. It does not mean nobody knew. '
    + 'David Anderson’s ', el('cite', { text: 'Histories of the Hanged' }), ' and Caroline Elkins’s ',
    el('cite', { text: 'Britain’s Gulag' }), ' both appeared in ', el('span.num', { text: '2005' }),
    ' — six years before the Foreign Office admitted holding the removed Kenyan files — and they built the '
    + 'case from other records. The disclosure changed the evidence, not the finding.'));

  /* ---- the disclosure this lens is named after ------------------------- */
  const disc = data.events.find((e) => e.id === 'migrated-archives-2011');
  if (disc) {
    const d = data.readDate(disc.date) || {};
    const e2 = disc.endDate ? (data.readDate(disc.endDate) || {}) : null;
    root.append(el('div.cx-panel.cx-panel--tight.lens__disc',
      el('p.cx-panel__head', { text: 'The disclosure' }),
      el('h3.cx-panel__title', { text: disc.title }),
      el('p.lens__discwhen', el('span.num', { text: d.display || '' }),
        e2 && e2.display ? [' → ', el('span.num', { text: e2.display })] : null),
      el('p', { text: disc.summary || '' }),
      disc.toll && disc.toll.money ? el('p.cx-note', { text: disc.toll.money }) : null));
  }

  /* ---- by work --------------------------------------------------------- */
  const workBox = el('div.lens__work');
  root.append(el('p.cx-panel__head', { text: 'Or by a single work' }), workBox);

  function renderWork() {
    workBox.replaceChildren();
    if (!work) {
      const top = (sources || []).slice().sort((a, b) => b.cites.length - a.cites.length).slice(0, 5);
      workBox.append(el('p.cx-note', { text: 'Search a historian or a title (⌘K) and choose the source result. The five this atlas leans on hardest:' }));
      const ul = el('ul.lens__list');
      for (const s of top) {
        ul.append(el('li', el('button.cx-more', {
          type: 'button',
          onclick: () => { mode = 'work'; work = s; apply(); },
        }, s.author ? s.author.split(',')[0] + ', ' : '', el('cite', { text: s.title }),
        s.year ? [' ', el('span.num', { text: '(' + s.year + ')' })] : null,
        ' — ', el('span.num', { text: String(s.cites.length) }), ' claims')));
      }
      workBox.append(ul);
      return;
    }
    workBox.append(
      el('p.lens__workname', work.author ? work.author + ', ' : '', el('cite', { text: work.title }),
        work.year ? [' ', el('span.num', { text: '(' + work.year + ')' })] : null),
      el('p', 'Carries ', el('span.num', { text: String(work.cites.length) }), ' claims in this atlas, across ',
        el('span.num', { text: String(new Set(work.cites.map((c) => c.id)).size) }), ' entries. '
        + 'The map now paints only the ground those claims are about.'),
      work.supports.length ? el('ul.lens__list', work.supports.slice(0, 6).map((s) => el('li', { text: s }))) : null,
      el('button.cx-more.cx-more--back', { type: 'button', onclick: () => { work = null; mode = 'date'; apply(); } }, 'Back to the date lens'),
    );
  }

  /* ---- apply ----------------------------------------------------------- */
  function apply() {
    for (const [y, b] of stopBtns) b.setAttribute('aria-pressed', String(mode === 'date' && y === before));
    allBtn.setAttribute('aria-pressed', String(mode === 'off'));

    if (mode === 'off') {
      figures.replaceChildren(document.createTextNode('The lens is off. The whole atlas is on the plate.'));
      detail.replaceChildren();
      renderWork();
      onClear && onClear();
      return;
    }
    if (mode === 'work' && work) {
      figures.replaceChildren();
      figures.append(el('span.num', { text: String(work.unitIds.length) }),
        document.createTextNode(' pieces of ground rest on this one work.'));
      renderWork();
      onApply({ mode: 'work', workId: work.id, unitIds: work.unitIds, reason: 'everything this atlas cites ' + (work.author || work.title) + ' for' });
      return;
    }

    const s = surviving(data, years, before);
    figures.replaceChildren();
    figures.append(
      el('span.num', { text: format.number(s.kept.length) }),
      document.createTextNode(' of '),
      el('span.num', { text: format.number(total) }),
      document.createTextNode(' territories keep a cited work published by '),
      el('span.num', { text: String(before) }),
      document.createTextNode('. '),
      el('span.num', { text: format.number(s.greyed.length) }),
      document.createTextNode(' grey out.'),
    );
    renderWork();

    /* The named case, computed rather than asserted. */
    detail.replaceChildren();
    if (before === 2011) {
      const only = data.territories.filter((t) => { const c = years.get(t.id); return c && c.lo != null && c.lo > 2011; });
      detail.append(el('p.cx-note.lens__only',
        only.length
          ? ['Places whose whole cited evidence base in this atlas postdates ', el('span.num', { text: '2011' }), ': ',
            el('span.num', { text: format.number(only.length) }), ' — ', only.map((t) => t.name).join(', '),
            '. Everything else here was already sourceable before the files came out.']
          : ['Not one place in this atlas rests only on works published after ', el('span.num', { text: '2011' }),
            '. That is the honest answer, and it is the answer that matters: the disclosure changed what could be proved in court, not what historians had already established.']));
    }

    onApply({ mode: 'date', before, unitIds: s.units, reason: 'places this atlas can still source from works published by ' + before });
  }

  apply();
  return { root, apply, setWork(w) { work = w; mode = 'work'; apply(); }, get state() { return { mode, before, workId: work && work.id }; } };
}
