/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p02r8-rail — the map's rectangle with the dossier open, at each viewport. */
const probe = () => {
  const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y) }; };
  const stage = box('.app__stage'), key = box('.stage__key'), map = box('.stage__map canvas');
  const plateH = stage ? stage.h - (key ? key.h : 0) : 0;
  const app = document.getElementById('app');
  return { vp: innerWidth + 'x' + innerHeight, stage, plateH, map,
    fill: map && stage && plateH ? Math.round(100 * map.w * map.h / (stage.w * plateH)) : 0,
    ds: JSON.stringify(app.dataset), sel: window.BEA.store.getState().selectedTerritoryId,
    docScroll: document.documentElement.scrollHeight - innerHeight };
};
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  log('CLOSED ' + JSON.stringify(await page.evaluate(probe)));
  const id = await page.evaluate(() => {
    const t = (window.BEA.data.territories || [])[0];
    window.BEA.store.dispatch('select', t.id);
    return t.id;
  });
  log('picked ' + id);
  await page.waitForTimeout(1800);
  log('DOSSIER ' + JSON.stringify(await page.evaluate(probe)));
  await shot('dossier');
};
