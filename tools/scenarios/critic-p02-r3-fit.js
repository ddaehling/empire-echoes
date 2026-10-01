/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913');
  await page.waitForTimeout(3200);
  const probe = async (tag) => {
    const r = await page.evaluate(() => {
      const opts = [...document.querySelectorAll('.map__targets [role="option"]')];
      const plate = document.querySelector('.map__plate').getBoundingClientRect();
      const pick = id => { const o = opts.find(e=>e.getAttribute('data-unit')===id); if(!o) return null;
        const b=o.getBoundingClientRect(); return { cx: Math.round(b.x+b.width/2), cy: Math.round(b.y+b.height/2) }; };
      const inside = p => p && p.cx>plate.x && p.cx<plate.x+plate.width && p.cy>plate.y && p.cy<plate.y+plate.height;
      const ids = ['au-new-south-wales','nz-north-island','ca-ontario','ca-nunavut','in-bengal','za-cape-colony','gibraltar','jamaica'];
      const out = { plate: {x:Math.round(plate.x),y:Math.round(plate.y),w:Math.round(plate.width),h:Math.round(plate.height)} };
      for (const id of ids) { const p = pick(id); out[id] = p ? (p.cx+','+p.cy+(inside(p)?'':'  OFFSCREEN')) : 'no target'; }
      return out;
    });
    log(tag, JSON.stringify(r, null, 1));
  };
  await probe('default');
  await page.click('.map__zoom--home'); await page.waitForTimeout(1600);
  await shot('home');
  await probe('after home');
  await page.keyboard.press('p'); await page.waitForTimeout(2200);
  await shot('home-equalearth');
  await probe('equal earth after home');
};
