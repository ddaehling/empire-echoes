/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20-degrade — the desk with the dossier's renderSource taken away. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { delete window.BEA.renderSource; });
  await page.evaluate(() => { window.BEA.store.dispatch('setPanel', { overlay: 'workshop' }); });
  await page.waitForTimeout(1500);
  const m = await page.evaluate(() => ({
    hasRenderSource: typeof (window.BEA && window.BEA.renderSource),
    own: document.querySelectorAll('.tp-source--own').length,
    fields: document.querySelectorAll('.tp-source__k').length,
    quotes: document.querySelectorAll('.tp-source__q').length,
    checks: document.querySelectorAll('.tp-check').length,
    moves: document.querySelectorAll('.tp-move').length,
    firstFieldOrder: [...document.querySelectorAll('.tp-source--own')][0]
      ? [...document.querySelectorAll('.tp-source--own')][0].textContent.slice(0, 60) : null,
  }));
  log('DEGRADED ' + JSON.stringify(m));
  await page.evaluate(() => { const p = document.querySelector('.tp__pages'); const t = document.querySelector('.tp-source'); p.scrollTop += t.getBoundingClientRect().top - p.getBoundingClientRect().top - 60; });
  await page.waitForTimeout(300);
  await shot('fallback-source');
};
