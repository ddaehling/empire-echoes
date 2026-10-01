/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('boot');
  const r = await page.evaluate(() => {
    const out = {};
    const m = document.querySelector('.map');
    out.mapHTML = m ? m.outerHTML.slice(0, 1200) : 'NO .map';
    const p = document.querySelector('.map__plate');
    if (p) { const b = p.getBoundingClientRect(); out.plate = {cssW: Math.round(b.width), cssH: Math.round(b.height), attrW: p.width, attrH: p.height}; }
    out.registry = window.BEA ? window.BEA.registry.report() : null;
    return out;
  });
  log(JSON.stringify(r, null, 1).slice(0, 3000));
};
