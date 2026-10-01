/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const g = await page.evaluate(() => {
    const out = {};
    const svg = document.querySelector('#map svg, .map svg, svg.map__svg, [data-module="map"] svg');
    out.svgSel = svg ? svg.className.baseVal || svg.id : null;
    const all = [...document.querySelectorAll('svg')].map(s => ({cls:s.getAttribute('class'), id:s.id, r:s.getBoundingClientRect()}));
    out.svgs = all.slice(0,6);
    // map root
    const mr = document.querySelector('.map, #map, [data-piece="map"]');
    out.mapRect = mr ? mr.getBoundingClientRect() : null;
    out.mapClass = mr ? mr.className : null;
    // overlay panels inside map
    out.overlays = [...document.querySelectorAll('.map *')].filter(e=>{
      const cs = getComputedStyle(e); return cs.position==='absolute'&&e.getBoundingClientRect().width>200&&e.getBoundingClientRect().height>80;
    }).slice(0,12).map(e=>({c:e.className, r:e.getBoundingClientRect(), t:(e.innerText||'').slice(0,50)}));
    out.vw = innerWidth; out.vh = innerHeight;
    return JSON.parse(JSON.stringify(out));
  });
  log(JSON.stringify(g, null, 1).slice(0, 6000));
};
