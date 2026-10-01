/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.waitForTimeout(3200);
  const r = await page.evaluate(() => {
    const m = window.BEA.registry;
    const map = document.querySelector('.map');
    const out = { foreign: [], frame: null };
    const fr = document.querySelector('.map__frame').getBoundingClientRect();
    out.frame = [Math.round(fr.left), Math.round(fr.top), Math.round(fr.width), Math.round(fr.height)];
    for (const slot of document.querySelectorAll('#app [data-mount]')) {
      if (map.contains(slot) || slot.contains(map)) continue;
      for (const c of slot.children) {
        const cs = getComputedStyle(c);
        const b = c.getBoundingClientRect();
        if (b.width < 24 || b.height < 24) continue;
        out.foreign.push({ cls: String(c.className).slice(0, 30), pe: cs.pointerEvents, r: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)] });
      }
    }
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
