/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(4500);
  const r = await page.evaluate(() => {
    const c = document.querySelector('.map__plate').getBoundingClientRect();
    let vis = 0, tot = 0;
    for (let i=0;i<50;i++) for (let j=0;j<50;j++){
      const x = c.x + (i+0.5)*c.width/50, y = c.y + (j+0.5)*c.height/50;
      const e = document.elementFromPoint(x,y); tot++;
      if (e && (e.classList.contains('map__plate') || e.classList.contains('map__target') || e.classList.contains('map__targets'))) vis++;
    }
    return { plate:{w:Math.round(c.width),h:Math.round(c.height),y:Math.round(c.y)}, visiblePct: Math.round(100*vis/tot), enlarged: document.querySelector('.map').classList.contains('is-enlarged') };
  });
  log('MOBILE LANDING: ' + JSON.stringify(r));
  await shot('grid');
};
