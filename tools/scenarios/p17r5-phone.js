/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  for (const L of ['exit', 'mechanism', 'taken-from', 'slavery']) {
    await page.evaluate((l) => { location.hash = '#year=1900&layer=' + l; }, L);
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => {
      const rib = document.querySelector('.legend--ribbon');
      const shown = [...document.querySelectorAll('.legend__rib')].filter(n => !n.hidden).map(n => n.textContent.trim().replace(/\s+/g, ' '));
      const route = document.querySelector('.legend__route');
      const list = document.querySelector('.legend__ribbon-list');
      return {
        shown, route: route && !route.hidden ? route.textContent.trim() : null,
        listW: list ? Math.round(list.clientWidth) : null,
        overrun: list ? Math.round(list.scrollWidth - list.clientWidth) : null,
        say: rib ? rib.getAttribute('aria-label') : null,
      };
    });
    log(JSON.stringify(r));
    await shot('phone-' + L, '.stage__key');
  }
};
