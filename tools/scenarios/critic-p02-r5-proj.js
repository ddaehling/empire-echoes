/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3200);
  await page.evaluate(() => { location.hash = '#year=1913'; });
  await page.waitForTimeout(1200);
  await page.keyboard.press('e');
  await page.waitForTimeout(1000);
  const measure = async (tag) => {
    const r = await page.evaluate(() => {
      const s = window.__map.unitScreen ? window.__map.unitScreen('ca-nunavut') : null;
      const q = window.__map.unitScreen ? window.__map.unitScreen('ca-quebec') : null;
      const i = window.__map.unitScreen ? window.__map.unitScreen('in-bengal-presidency') : null;
      const t = id => { const e = document.getElementById('map-u-' + id); if(!e) return null; const b = e.getBoundingClientRect(); return {x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}; };
      return { proj: window.__map.projection, nunavut: t('ca-nunavut'), quebec: t('ca-quebec'), bengal: t('in-bengal-presidency'),
        gb: t('great-britain'), plate: (()=>{const b=document.querySelector('.map__plate').getBoundingClientRect(); return {x:b.x,y:b.y,w:b.width,h:b.height};})() };
    });
    log(tag + ': ' + JSON.stringify(r));
  };
  await measure('mercator');
  await shot('merc');
  await page.keyboard.press('p');
  await page.waitForTimeout(4000);
  await measure('equal-earth-settled');
  await shot('equal-settled');
  await shot('equal-plate', '.map__frame');
  // check ASK panel presence and bbox
  const ask = await page.evaluate(() => {
    const els = [...document.querySelectorAll('*')].filter(e => /ASK THESE THREE/i.test(e.textContent||'') && e.children.length < 8);
    const e = els[els.length-1];
    if (!e) return null;
    const b = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return { cls: e.className, b: {x:b.x,y:b.y,w:b.width,h:b.height}, bg: cs.backgroundColor, opacity: cs.opacity };
  });
  log('ASK panel: ' + JSON.stringify(ask));
};
