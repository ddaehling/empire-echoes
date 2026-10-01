/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const svgs = [...document.querySelectorAll('svg')].map(s => ({ cls: s.getAttribute('class'), id: s.id, vb: s.getAttribute('viewBox'), children: s.children.length }));
    const units = [...document.querySelectorAll('[data-unit]')].slice(0, 5).map(e => e.outerHTML.slice(0, 400));
    const groups = [...document.querySelectorAll('svg g')].map(g => g.getAttribute('class')).filter(Boolean).slice(0,40);
    return { svgs, units, groups,
      unitCount: document.querySelectorAll('[data-unit]').length,
      mapRoot: document.querySelector('.map, #map, [data-module=map]')?.className || null };
  });
  log(JSON.stringify(info, null, 1).slice(0, 6000));
  // global API
  const api = await page.evaluate(() => {
    const out = {};
    out.windowKeys = Object.keys(window).filter(k => /app|store|data|bus|map|atlas/i.test(k));
    if (window.__app) out.app = Object.keys(window.__app);
    return out;
  });
  log('API: ' + JSON.stringify(api));
};
