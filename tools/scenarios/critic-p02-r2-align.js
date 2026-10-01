/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3500);
  await page.evaluate(() => {
    const ids = ['gibraltar','malta','ascension','barbados','ye-aden-colony','singapore','hk-hong-kong-island'];
    for (const id of ids) {
      const el = document.querySelector(`.map__target[data-unit="${id}"]`);
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;left:${b.x}px;top:${b.y}px;width:${b.width}px;height:${b.height}px;border:2px solid #00f;z-index:99999;pointer-events:none;`;
      const t = document.createElement('span');
      t.textContent = id.slice(0,6); t.style.cssText='font:9px sans-serif;color:#00f;background:#fff';
      d.appendChild(t);
      document.body.appendChild(d);
    }
    const m = document.querySelector('.map__targets');
    const cs = getComputedStyle(m);
    window.__dbg = { transform: cs.transform, pos: cs.position, rect: JSON.stringify(m.getBoundingClientRect()), overflow: cs.overflow, plateRect: JSON.stringify(document.querySelector('.map__plate').getBoundingClientRect()) };
  });
  log(JSON.stringify(await page.evaluate(()=>window.__dbg)));
  await shot('align');
};
