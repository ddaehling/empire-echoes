/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await shot('landing');
  log('title:', await page.title());
  log('url:', page.url());
  const txt = await page.evaluate(() => document.body.innerText);
  log('BODY TEXT:', txt.slice(0, 2500));
  // structure
  const svgInfo = await page.evaluate(() => {
    const out = {};
    const svgs = [...document.querySelectorAll('svg')];
    out.svgCount = svgs.length;
    out.svgs = svgs.slice(0,6).map(s => ({cls: s.getAttribute('class'), id: s.id, vb: s.getAttribute('viewBox'), w: s.clientWidth, h: s.clientHeight, kids: s.children.length}));
    const cvs = [...document.querySelectorAll('canvas')];
    out.canvas = cvs.map(c => ({cls:c.className, w:c.width,h:c.height}));
    return out;
  });
  log('SVG:', JSON.stringify(svgInfo));
  const mapEl = await page.evaluate(() => {
    const m = document.querySelector('.map, #map, [data-module="map"], .map-root');
    if (!m) return null;
    return {tag: m.tagName, cls: m.className, html: m.outerHTML.slice(0,1200)};
  });
  log('MAP EL:', JSON.stringify(mapEl));
};
