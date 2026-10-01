/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { window.BEA.store.dispatch('select', 'barbados'); window.BEA.store.flush(); });
  await page.waitForTimeout(1200);
  log(JSON.stringify(await page.evaluate(() => {
    const lede = document.querySelector('.app__lede').getBoundingClientRect();
    const out = [];
    for (const e of document.querySelectorAll('#app *')) {
      const cs = getComputedStyle(e);
      if (cs.position !== 'absolute' && cs.position !== 'fixed') continue;
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const w = Math.max(0, Math.min(r.right, lede.right) - Math.max(r.left, lede.left));
      const h = Math.max(0, Math.min(r.bottom, lede.bottom) - Math.max(r.top, lede.top));
      if (w * h > 100) out.push({ sel: e.tagName + '.' + String(e.className).slice(0,60), pos: cs.position, z: cs.zIndex,
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], area: Math.round(w*h),
        insetEnd: cs.insetBlockEnd, bottom: cs.bottom, top: cs.top });
    }
    const legendSlot = document.querySelector('[data-mount="legend"]');
    return { lede: [Math.round(lede.x),Math.round(lede.y),Math.round(lede.width),Math.round(lede.height)],
      intruders: out,
      legendSlotHTML: legendSlot ? legendSlot.innerHTML.slice(0, 200) : null,
      legendSlotAttrs: legendSlot ? [...legendSlot.attributes].map(a=>a.name+'='+a.value) : null,
      legendSlotDisplay: legendSlot ? getComputedStyle(legendSlot).display : null };
  }), null, 1));
};
