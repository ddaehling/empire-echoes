/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2600);
  await shot('mode-top');
  const geom = await page.evaluate(() => {
    const d = document.querySelector('.dossier'); const a = document.querySelector('.app__dossier');
    const m = document.querySelector('.map, [class*=map]');
    const r = e => e ? (({x,y,width,height}) => ({x:Math.round(x),y:Math.round(y),w:Math.round(width),h:Math.round(height)}))(e.getBoundingClientRect()) : null;
    return {dossier:r(d), aside:r(a), vw:innerWidth, vh:innerHeight,
      overflowX: document.documentElement.scrollWidth > innerWidth,
      clipped: [...document.querySelectorAll('.dossier *')].filter(n=>n.children.length===0 && n.scrollWidth>n.clientWidth+2).slice(0,8).map(n=>n.textContent.trim().slice(0,45))};
  });
  log('GEOM ' + JSON.stringify(geom, null, 1));
  // scroll a bit
  await page.evaluate(() => { const e=document.querySelector('.dossier__body'); if(e) e.scrollTop = 600; });
  await page.waitForTimeout(400);
  await shot('mode-scrolled');
};
