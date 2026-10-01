/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.BEA.store.dispatch('select', (window.BEA.data.territories || [])[0].id));
  await page.waitForTimeout(2000);
  log(JSON.stringify(await page.evaluate(() => {
    const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height), getComputedStyle(e).position]; };
    return { dossierMount: r('[data-mount="dossier"]'), appDossier: r('.app__dossier'), stage: r('.app__stage'),
      time: r('.app__time'), key: r('.stage__key'), bar: r('.app__bar'), lede: r('.app__lede'),
      map: r('.map'), stageMap: r('.stage__map') };
  })));
  await shot('mob3');
};
