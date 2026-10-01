/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** shellr3-stage — what disclosure level does a cold deep link into a beat land on? */
module.exports = async ({ page, shot, log }) => {
  for (const h of ['#tour=thirty&step=1', '#tour=thirty&step=9', '#tour=thirty&step=14', '#year=1857&sel=bengal', '#year=1900']) {
    await page.goto('http://localhost:8777/app/' + h, { waitUntil: 'load' });
    await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
    await page.waitForTimeout(2200);
    const r = await page.evaluate(() => {
      const cta = document.querySelector('.cx-cta');
      const defs = document.querySelector('.map__defs');
      return {
        hash: location.hash,
        stage: document.getElementById('app').dataset.stage,
        cta: (cta && !cta.hidden) ? (cta.textContent || '').trim() : null,
        ctaQuiet: cta ? cta.dataset.quiet || null : null,
        defsVisible: !!(defs && defs.getBoundingClientRect().width > 2),
        lede: (document.querySelector('.cx-lede__say') || {}).textContent,
      };
    });
    log(h + ' -> ' + JSON.stringify(r));
  }
};
