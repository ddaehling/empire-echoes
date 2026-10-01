/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs=[]; page.on('pageerror',e=>errs.push(String(e))); page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await page.goto('http://localhost:8777/app/#year=1913', { waitUntil: 'load' });
  await page.waitForTimeout(5000);
  const d = await page.evaluate(() => {
    const svg = document.querySelector('svg');
    const paths = document.querySelectorAll('svg path');
    const stage = document.querySelector('.stage, [class*=stage]');
    const map = document.querySelector('.map, [class*="map__canvas"], canvas');
    return { svgCount: document.querySelectorAll('svg').length, pathCount: paths.length,
      canvasCount: document.querySelectorAll('canvas').length,
      stageRect: stage && (r=>({x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0}))(stage.getBoundingClientRect()),
      mapCls: map && String(map.className).slice(0,80),
      mapRect: map && (r=>({x:r.x|0,y:r.y|0,w:r.width|0,h:r.height|0}))(map.getBoundingClientRect()) };
  });
  log(JSON.stringify(d));
  await shot('map-1913');
  log('ERR', JSON.stringify(errs.slice(0,10)));
};
