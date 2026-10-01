/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-band.js — the 768–1024px width band, with the rail open.
   Measures: does the rail cover the plate? does the ribbon overlap the lede?
   Run at --w 900 --h 700, --w 768 --h 1024, --w 1024 --h 640. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1500);

  const measure = async (tag) => {
    const m = await page.evaluate(() => {
      const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), b: Math.round(r.bottom), rr: Math.round(r.right) }; };
    const vw = innerWidth, vh = innerHeight;
      const stage = box('.app__stage'), key = box('.stage__key'), lede = box('.app__lede');
      const map = box('.stage__map canvas') || box('.stage__map svg') || box('.stage__map');
      const doss = box('.app__dossier'), sheet = box('.app__sheet'), time = box('.app__time');
      const app = document.getElementById('app');
      const ov = (a, b) => {
        if (!a || !b) return 0;
        const w = Math.max(0, Math.min(a.rr, b.rr) - Math.max(a.x, b.x));
        const h = Math.max(0, Math.min(a.b, b.b) - Math.max(a.y, b.y));
        return Math.round(w * h);
      };
      const cs = doss ? getComputedStyle(document.querySelector('.app__dossier')) : null;
      return {
        vw, vh, stage, key, lede, map, doss, sheet, time,
        dossVisible: cs ? (cs.visibility + '/' + cs.display + '/' + cs.position) : null,
        dataDossier: app.dataset.dossier, dataSheet: app.dataset.sheet, dataStage: app.dataset.stage,
        overlap_key_lede: ov(key, lede),
        overlap_doss_stage: ov(doss, stage),
        overlap_doss_map: ov(doss, map),
        overlap_sheet_map: ov(sheet, map),
        scrollH: document.documentElement.scrollHeight,
        railW: getComputedStyle(app).getPropertyValue('--rail-w').trim(),
      };
    });
    log(tag + ' :: ' + JSON.stringify(m));
    return m;
  };

  await measure('closed');
  await shot('closed');

  const ids = await page.evaluate(() => window.BEA.data.territories.slice(0, 400).map(t => t.id));
  const pick = ids.find(i => /bengal|india|jamaica|barbados/.test(i)) || ids[0];
  log('selecting ' + pick);
  await page.evaluate((id) => { window.BEA.store.dispatch('select', id); window.BEA.store.flush(); }, pick);
  await page.waitForTimeout(1200);
  await measure('dossier-open');
  await shot('dossier-open');

  // open a sheet on top
  await page.evaluate(() => {
    const n = document.createElement('div');
    n.innerHTML = '<p style="font:16px serif">A test sheet body. '.repeat(20) + '</p>';
    window.BEA.bus.emit('ask:sheet', { id: 'test', eyebrow: 'TEST', title: 'A sheet', node: n });
  });
  await page.waitForTimeout(900);
  await measure('sheet-open');
  await shot('sheet-open');
};
