/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p02r8-dock — the enlarged plate must not stand on the sentence band when
    there is a map's worth of room under it. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.store.dispatch('select', (window.BEA.data.territories || [])[0].id));
  await page.waitForTimeout(2200);
  const r = () => page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
    const m = g('.map'), l = g('.app__lede');
    return { map: m, lede: l, dossier: g('.app__dossier'),
      ledeCovered: !!(m && l && m[1] < l[1] + l[3] - 4 && m[1] + m[3] > l[1] + 4),
      ledeText: (document.querySelector('.cx-lede__say') || {}).textContent || '' };
  });
  log('AS SHIPPED ' + JSON.stringify(await r()));
  await shot('dock-as-shipped');
  // Now give the sheet 200px+ of room, the way the shell has been asked to,
  // and check the plate hands the band back on its own.
  await page.evaluate(() => {
    const d = document.querySelector('.app__dossier');
    if (d) { d.style.top = Math.round(innerHeight * 0.55) + 'px'; d.style.bottom = '0'; d.style.height = 'auto'; }
    window.dispatchEvent(new Event('resize'));
  });
  await page.waitForTimeout(1600);
  log('WITH 200px OF ROOM ' + JSON.stringify(await r()));
  await shot('dock-with-room');
};
