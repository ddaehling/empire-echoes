/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.data, null, { timeout: 20000 });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const q = s => document.querySelector(s);
    const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
    const out = {
      vw: innerWidth, vh: innerHeight,
      stage: r(q('.app__stage')), mapslot: r(q('.stage__map')),
      map: r(q('.map')), frame: r(q('.map__frame')), plate: r(q('.map__plate')),
      furniture: r(q('.map__furniture')), rail: r(q('.map__rail')),
      switchEl: r(q('.map__switch')), controls: r(q('.map__controls')),
      legend: r(q('.stage__legend')), note: r(q('.stage__note')),
      canvasAttr: (() => { const c = q('.map__plate'); return c ? { w: c.width, h: c.height, cls: c.className } : null; })(),
      mapHTMLhead: q('.map') ? q('.map').outerHTML.slice(0, 600) : (q('.stage__map') ? q('.stage__map').innerHTML.slice(0,400) : 'NO .map'),
      registry: window.BEA.registry ? window.BEA.registry.report() : null,
    };
    return out;
  });
  log(JSON.stringify(info, null, 1));
  await shot('boot');
};
