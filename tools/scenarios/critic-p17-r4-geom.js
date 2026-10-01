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
    const R = e => { const r = e.getBoundingClientRect(); return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}; };
    const pick = sel => { const e = document.querySelector(sel); return e ? R(e) : null; };
    const out = { vw: innerWidth, vh: innerHeight };
    out.svg = pick('svg.map, .map svg, #map svg, svg');
    out.stage = pick('.stage, #stage, [class*="stage"]');
    // top-level children of body and their rects
    out.tops = Array.from(document.body.children).map(e => ({tag:e.tagName, cls:String(e.className).slice(0,60), r:R(e)}));
    // legend blocks
    out.legendTop = pick('.legend, #legend, [class*="legend"]');
    const named = {};
    ['.legend__plate','.legend-plate','.legend__key','.legend__head','.legend__scroll','.byline','[class*="byline"]','.stage-note','[class*="stage-note"]'].forEach(s=>{const e=document.querySelector(s); if(e) named[s]=R(e);});
    out.named = named;
    return out;
  });
  log('GEOM', JSON.stringify(g, null, 1));
};
