/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => {
    const out = {};
    const stage = document.getElementById('stage');
    out.stageHTMLHead = stage ? stage.innerHTML.slice(0, 1200) : null;
    const canvases = [...document.querySelectorAll('canvas')].map(c => ({w:c.width,h:c.height,cls:c.className,id:c.id, style:c.getAttribute('style')}));
    out.canvases = canvases;
    const mapRoot = document.querySelector('.map, #map, [class*=map]');
    out.mapRootCls = mapRoot ? mapRoot.className : null;
    const u = document.getElementById('map-u-barbados');
    out.barbados = u ? {tag:u.tagName, cls:u.className.baseVal||u.className, attrs:[...u.attributes].map(a=>a.name+'='+a.value).join(' ').slice(0,600)} : null;
    out.unitEls = document.querySelectorAll('[id^="map-u-"]').length;
    out.svgs = [...document.querySelectorAll('svg')].map(s=>({cls:s.getAttribute('class'), vb:s.getAttribute('viewBox'), children:s.children.length}));
    return out;
  });
  log(JSON.stringify(d, null, 1).slice(0, 6000));
};
