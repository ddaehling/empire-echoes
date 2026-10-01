/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* shell-url.js — deep links, Back/Forward and reload restore state EXACTLY.
   Every step prints what it asked for and what it got. */
module.exports = async ({ page, log }) => {
  const ready = () => page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  const snap = () => page.evaluate(() => {
    const s = window.BEA.store.getState();
    return { hash: location.hash, year: s.year, sel: s.selectedTerritoryId, layer: s.activeLayer,
      stage: document.getElementById('app').dataset.stage, filters: JSON.stringify(s.filters),
      theme: s.theme, view: s.mapView ? [s.mapView.k, s.mapView.x, s.mapView.y].map(n => +n.toFixed(3)).join(',') : null,
      dossier: document.getElementById('app').dataset.dossier };
  });

  await ready(); await page.waitForTimeout(900);
  log('A cold load          -> ' + JSON.stringify(await snap()));

  // 1. deep link with a year only: must NOT promote the stage, must NOT rewrite the link
  await page.goto('http://localhost:8777/app/#year=1857', { waitUntil: 'load' });
  await ready(); await page.waitForTimeout(1200);
  log('B #year=1857         -> ' + JSON.stringify(await snap()));

  // 2. deep link with everything
  await page.goto('http://localhost:8777/app/#year=1783&sel=bengal&layer=status&filter=stage:apparatus', { waitUntil: 'load' });
  await ready(); await page.waitForTimeout(1400);
  log('C full deep link     -> ' + JSON.stringify(await snap()));

  // 3. reload restores exactly
  await page.reload({ waitUntil: 'load' });
  await ready(); await page.waitForTimeout(1400);
  log('D after reload       -> ' + JSON.stringify(await snap()));

  // 4. navigate in-app, then Back / Forward
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(500);
  log('E select barbados    -> ' + JSON.stringify(await snap()));
  await page.evaluate(() => { window.BEA.store.dispatch('setYear', 1901); window.BEA.store.flush(); });
  await page.waitForTimeout(500);
  log('F year 1901          -> ' + JSON.stringify(await snap()));
  await page.goBack({ waitUntil: 'commit' }); await page.waitForTimeout(700);
  log('G back               -> ' + JSON.stringify(await snap()));
  await page.goBack({ waitUntil: 'commit' }); await page.waitForTimeout(700);
  log('H back again         -> ' + JSON.stringify(await snap()));
  await page.goForward({ waitUntil: 'commit' }); await page.waitForTimeout(700);
  log('I forward            -> ' + JSON.stringify(await snap()));

  // 5. a scrub must not create history entries
  const before = await page.evaluate(() => history.length);
  await page.evaluate(async () => { for (let y = 1800; y < 1860; y++) { window.BEA.store.dispatch('setYear', y); window.BEA.store.flush(); await new Promise(r => requestAnimationFrame(r)); } });
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => history.length);
  log('J scrub 60 years: history ' + before + ' -> ' + after + ' (want +0 or +1)');

  // 6. an unknown selection is cleared and said
  await page.goto('http://localhost:8777/app/#year=1900&sel=not-a-place', { waitUntil: 'load' });
  await ready(); await page.waitForTimeout(1200);
  log('K bad sel            -> ' + JSON.stringify(await snap()) + ' note=' + JSON.stringify(await page.evaluate(() => document.getElementById('shell-note').textContent.slice(0, 90))));
};
