/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  for (const [y,sel] of [[1866,'new-zealand'],[1913,'commonwealth-of-australia'],[1913,'dominion-of-canada'],[1913,'india']]) {
    await page.goto('http://localhost:8777/app/#year='+y+'&sel='+sel);
    await page.waitForTimeout(3200);
    const r = await page.evaluate((sel)=>{
      const plate=document.querySelector('.map__plate').getBoundingClientRect();
      const opts=[...document.querySelectorAll('.map__targets [role="option"]')];
      const chosen=opts.filter(o=>o.getAttribute('aria-selected')==='true');
      const first=chosen[0];
      const inside=(b)=>b.x+b.width/2>plate.x&&b.x+b.width/2<plate.x+plate.width&&b.y+b.height/2>plate.y&&b.y+b.height/2<plate.y+plate.height;
      return { selCount: chosen.length, first: first?first.getAttribute('data-unit'):null,
        visible: chosen.filter(o=>inside(o.getBoundingClientRect())).length,
        pos: chosen.slice(0,3).map(o=>{const b=o.getBoundingClientRect(); return o.getAttribute('data-unit')+'@'+Math.round(b.x)+','+Math.round(b.y);}) };
    }, sel);
    log(y+' '+sel+': '+JSON.stringify(r));
    await shot('sel-'+sel);
  }
};
