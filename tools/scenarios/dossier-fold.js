/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 — the fold, measured on every territory in the dataset at 1280x800.
 * Acceptance test 1: name, legal status, how it was taken, how it ended and the
 * franchise line are all visible without scrolling.
 *   node tools/inspect.js tools/scenarios/dossier-fold.js --out /tmp/dsr-fold --w 1280 --h 800
 */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  /* Restore the shell's intended geometry: while other pieces are in flight one
     of them can overflow the stage and hand every panel a fake amount of room. */
  await page.addStyleTag({ content: `
    .app { height: 100dvh !important; max-height: 100dvh !important; }
    .app__stage { overflow: hidden !important; min-height: 0 !important; }
    .stage__map { overflow: hidden !important; height: 100% !important; }
  ` });
  await page.waitForTimeout(300);

  const out = await page.evaluate(async () => {
    const data = window.BEA.data, store = window.BEA.store;
    const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const rows = [];
    for (const t of data.territories) {
      const y = t.acquiredYear != null ? Math.min(t.acquiredYear + 1, data.bounds.max)
        : (t.firstYear != null ? t.firstYear : 1900);
      store.batch(d => { d('setYear', y); d('select', t.id); });
      store.flush();
      await frame();
      const panel = document.querySelector('.app__dossier');
      const fold = document.querySelector('.dsr__fold');
      if (!panel || !fold) { rows.push({ id: t.id, y, error: 'no fold' }); continue; }
      panel.scrollTop = 0;
      const p = panel.getBoundingClientRect(), f = fold.getBoundingClientRect();
      const vis = (s) => { const e = document.querySelector(s); if (!e) return false;
        const r = e.getBoundingClientRect(); return r.bottom <= p.bottom + 1 && r.top >= p.top - 1; };
      rows.push({
        id: t.id, y,
        over: Math.round(f.bottom - p.bottom),
        panelH: Math.round(p.height),
        name: vis('.dsr__name'), status: vis('.dsr__statusword') || vis('[data-block="status"] .dsr__absent'),
        franchise: !!document.querySelector('.dsr__franchise'),
        franchiseVis: vis('.dsr__franchise'),
        taken: vis('[data-block="taken"] .dsr__lead') || vis('[data-block="taken"] .dsr__absent'),
        ended: vis('[data-block="ended"] .dsr__lead') || vis('[data-block="ended"] .dsr__absent'),
        actors: !!document.querySelector('[data-block="actors"] .dsr__actors li, [data-block="actors"] .dsr__missing'),
        chips: document.querySelectorAll('.dsr-chip').length,
      });
    }
    return rows;
  });

  const bad = out.filter(r => r.error || r.over > 0 || !r.name || !r.status || !r.taken || !r.ended || !r.franchiseVis);
  const noFranchiseLine = out.filter(r => !r.franchise);
  const noActors = out.filter(r => !r.actors);
  const noChips = out.filter(r => !r.chips);
  log('territories measured:', out.length, '| panel height:', out[0] && out[0].panelH);
  log('FOLD FAILURES (any of name/status/taken/ended/franchise not visible, or fold overflows):', bad.length);
  log(bad.slice(0, 25).map(r => '  ' + r.id + ' @' + r.y + ' over=' + r.over + ' name=' + r.name + ' status=' + r.status
    + ' taken=' + r.taken + ' ended=' + r.ended + ' franchiseVis=' + r.franchiseVis).join('\n'));
  log('worst overflow px:', Math.max(...out.map(r => r.over || -999)));
  log('dossiers with no franchise element at all:', noFranchiseLine.length);
  log('dossiers with no actors block content:', noActors.length, JSON.stringify(noActors.map(r => r.id)));
  log('dossiers with zero chips:', noChips.length, JSON.stringify(noChips.map(r => r.id)));
  await shot('last');
};
