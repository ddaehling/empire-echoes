/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(1400);
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(1600);
  log(JSON.stringify(await page.evaluate(() => {
    const app = document.getElementById('app');
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return null;
      return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; };
    return { railTopMin: app.style.getPropertyValue('--rail-top-min'),
      enlarged: R('.map.is-enlarged'), mapCanvas: R('.stage__map canvas'), doss: R('.app__dossier'),
      key: R('.legend__pin') || R('.stage__key') };
  })));
  await shot('phone-open');
};
