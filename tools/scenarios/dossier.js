/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* P04 — territory dossier. Primary inspection scenario.
 * node tools/inspect.js tools/scenarios/dossier.js --out /tmp/dsr
 */
const sel = async (page, id, year) => page.evaluate(([i, y]) => {
  window.BEA.store.batch(d => { d('setYear', y); d('select', i); });
  window.BEA.store.flush();
}, [id, year]);

/* Other pieces are being built at the same time; while one of them overflows
   the stage the whole grid grows and every panel gets a fake amount of room.
   This clamp restores the shell's intended geometry (ARCHITECTURE §5) so the
   fold is measured against the height the dossier is actually given. */
const clamp = (page) => page.addStyleTag({ content: `
  .app { height: 100dvh !important; max-height: 100dvh !important; }
  .app__stage { overflow: hidden !important; min-height: 0 !important; }
  .stage__map { overflow: hidden !important; height: 100% !important; }
` });

const foldReport = (page) => page.evaluate(() => {
  const panel = document.querySelector('.app__dossier');
  const fold = document.querySelector('.dsr__fold');
  const head = document.querySelector('.dsr__head');
  if (!panel || !fold || !head) return { ok: false };
  const p = panel.getBoundingClientRect();
  const f = fold.getBoundingClientRect();
  const inView = (sel) => {
    const e = document.querySelector(sel);
    if (!e) return 'absent';
    const r = e.getBoundingClientRect();
    return (r.bottom <= p.bottom + 1 && r.top >= p.top - 1) ? 'yes' : 'no';
  };
  return {
    ok: true,
    viewport: window.innerHeight,
    panelHeight: Math.round(p.height),
    foldContentHeight: Math.round(f.bottom - p.top + panel.scrollTop),
    headroomPx: Math.round(p.bottom - f.bottom),
    fitsWithoutScrolling: f.bottom <= p.bottom + 1 && panel.scrollTop === 0,
    scrollTop: panel.scrollTop,
    name: inView('.dsr__name'),
    status: inView('.dsr__statusword'),
    franchise: inView('.dsr__franchise'),
    taken: inView('[data-block="taken"] .dsr__from'),
    ended: inView('[data-block="ended"] .dsr__from'),
  };
});

module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  log('registry:', JSON.stringify(await page.evaluate(() => {
    const r = window.BEA.registry.report();
    return { mounted: r.mounted, failed: r.failed, absent: (r.absent || []).length };
  })));

  await clamp(page);

  /* ---- 1. Egypt 1913, the fold ---- */
  await sel(page, 'egypt', 1913);
  await page.waitForTimeout(400);
  await shot('egypt-1913');
  log('FOLD egypt 1913:', JSON.stringify(await foldReport(page)));

  /* ---- 2. Egypt at four years -> four legal labels (T12) ---- */
  const labels = [];
  for (const y of [1882, 1914, 1922, 1956]) {
    await sel(page, 'egypt', y);
    await page.waitForTimeout(150);
    labels.push(await page.evaluate((yy) => {
      const w = document.querySelector('.dsr__statusword');
      const l = document.querySelector('.dsr__statuslabel');
      return yy + ' :: ' + (w ? w.textContent : 'none') + ' :: ' + (l ? l.textContent : '');
    }, y));
  }
  log('EGYPT LABELS:\n  ' + labels.join('\n  '));
  log('distinct labels:', new Set(labels.map(s => s.split(' :: ').slice(1).join(' '))).size);
  await shot('egypt-1956');

  /* ---- 3. India at 1800 — company seal, not a crown (T6) ---- */
  const ids = await page.evaluate(() => window.BEA.data.territories
    .filter(t => t.spans.some(s => s.status === 'company-rule'))
    .map(t => { const s = t.spans.find(x => x.status === 'company-rule'); return [t.id, s.start + 1]; })
    .slice(0, 8));
  log('company-rule territories sample:', JSON.stringify(ids));
  if (ids.length) {
    const pick = ids.find(([i]) => /india|bengal/.test(i)) || ids[0];
    await sel(page, pick[0], pick[1]);
    log('seal test on', JSON.stringify(pick));
    await page.waitForTimeout(250);
    log('seal:', await page.evaluate(() => {
      const s = document.querySelector('.dsr__seal');
      return s ? s.dataset.seal : 'none';
    }));
    await shot('company-rule');
  }

  /* ---- 4. because-chips + Back ---- */
  await sel(page, 'egypt', 1913);
  await page.waitForTimeout(250);
  const chips = await page.evaluate(() => [...document.querySelectorAll('.dsr-chip')].map(c => ({
    rel: c.dataset.rel, target: c.dataset.target, y: c.dataset.targetYear, text: c.textContent.trim().slice(0, 60),
  })));
  log('chips on egypt:', JSON.stringify(chips.slice(0, 12), null, 1));
  const before = await page.evaluate(() => ({ sel: BEA.store.getState().selectedTerritoryId, year: BEA.store.getState().year }));
  if (chips.length) {
    await page.evaluate(() => { document.querySelector('.dsr__below .dsr-chip').click(); });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => ({ sel: BEA.store.getState().selectedTerritoryId, year: BEA.store.getState().year, back: !!document.querySelector('.dsr__back') }));
    log('chip nav:', JSON.stringify(before), '->', JSON.stringify(after));
    await shot('after-chip');
    await page.evaluate(() => document.querySelector('.dsr__back').click());
    await page.waitForTimeout(400);
    const backTo = await page.evaluate(() => ({ sel: BEA.store.getState().selectedTerritoryId, year: BEA.store.getState().year }));
    log('after Back:', JSON.stringify(backTo), 'exact restore:', JSON.stringify(backTo) === JSON.stringify(before));
  }

  /* ---- 5. the fold at four more shapes of place ---- */
  for (const [id, y] of [['british-india', 1900], ['jamaica', 1750], ['kenya', 1955], ['hong-kong', 1930]]) {
    if (!(await page.evaluate((i) => window.BEA.data.byId.has(i), id))) { log('missing id', id); continue; }
    await sel(page, id, y);
    await page.waitForTimeout(250);
    log('FOLD ' + id + ' ' + y + ':', JSON.stringify(await foldReport(page)));
    await shot('fold-' + id);
  }

  /* ---- 6. a territory with no local actors -> the visible defect ---- */
  for (const id of ['bermuda', 'ascension']) {
    await sel(page, id, 1900);
    await page.waitForTimeout(200);
    log(id, 'defect:', await page.evaluate(() => {
      const d = document.querySelector('.dsr__missing');
      return d ? d.textContent.trim().slice(0, 90) : 'none';
    }));
  }
  await shot('missing-actors');

  /* ---- 7. renderSource, published and defective where the record is thin ---- */
  log('renderSource published:', await page.evaluate(() => typeof window.BEA.renderSource));
  await sel(page, 'egypt', 1913);
  await page.waitForTimeout(250);
  log('unsourced count:', await page.evaluate(() => window.BEA.unsourcedCount()));
  log('first source block:', await page.evaluate(() => {
    const s = document.querySelector('.src');
    return s ? s.innerText.replace(/\n+/g, ' | ').slice(0, 420) : 'none';
  }));
  await page.evaluate(() => { const s = document.querySelector('.src'); if (s) s.scrollIntoView(); });
  await page.waitForTimeout(300);
  await shot('source-block');

  /* ---- 8. banned strings in my own rendered output ---- */
  log('banned scan:', JSON.stringify(await page.evaluate(() => {
    const banned = ['acquired', 'pacified', 'civilising mission', 'unrest', 'rich tapestry',
      'played a key role', 'left a lasting legacy', 'both sides', 'it is important to note',
      'arguably', 'many would say', 'mixed legacy'];
    const txt = document.querySelector('.dossier').innerText.toLowerCase();
    return banned.filter(b => txt.includes(b));
  })));
};
