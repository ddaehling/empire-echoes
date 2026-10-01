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
  const fold = await page.$('text=FOLD'); if (fold) { await fold.click(); await page.waitForTimeout(500); }
  await page.click('.map__zoom--home'); await page.waitForTimeout(1500);
  await shot('folded-home');
  const r = await page.evaluate(() => {
    const plate = document.querySelector('.map__plate').getBoundingClientRect();
    const opts = [...document.querySelectorAll('.map__targets [role="option"]')];
    const off = [], onmap = [];
    for (const o of opts) {
      const b = o.getBoundingClientRect();
      const cx = b.x+b.width/2, cy = b.y+b.height/2;
      const rec = o.getAttribute('data-unit') + '@' + Math.round(cx) + ',' + Math.round(cy);
      if (cx < plate.x || cx > plate.x+plate.width || cy < plate.y || cy > plate.y+plate.height) off.push(rec); else onmap.push(rec);
    }
    // which are under an opaque panel?
    const panels = [...document.querySelectorAll('.map__switch, .map__controls, #app [data-mount]')].map(n=>n.getBoundingClientRect()).filter(b=>b.width>20&&b.height>20);
    const under = [];
    for (const o of opts) {
      const b = o.getBoundingClientRect(); const cx=b.x+b.width/2, cy=b.y+b.height/2;
      if (cx<plate.x||cx>plate.x+plate.width||cy<plate.y||cy>plate.y+plate.height) continue;
      for (const p of panels) if (cx>p.x&&cx<p.x+p.width&&cy>p.y&&cy<p.y+p.height) { under.push(o.getAttribute('data-unit')+'@'+Math.round(cx)+','+Math.round(cy)); break; }
    }
    return { total: opts.length, offCount: off.length, off: off.slice(0,40), underCount: under.length, under: under.slice(0,40) };
  });
  log(JSON.stringify(r, null, 1).slice(0,4000));
};
