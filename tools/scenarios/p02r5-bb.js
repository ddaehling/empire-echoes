/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, log }) => {
  await page.goto(page.url().split('#')[0] + '#year=1913');
  await page.waitForTimeout(3400);
  const r = await page.evaluate(() => {
    const m = window.__map;
    const f = document.querySelector('.map__frame').getBoundingClientRect();
    const s = m.plate.unitScreen('barbados');
    const ml = m.markLayout().get('barbados');
    const at = document.elementFromPoint(f.left + s.mx, f.top + s.my);
    return { f: [f.left, f.top, f.width, f.height],
      s: { mx: s.mx, my: s.my, mr: s.mr, moved: s.moved, tiny: s.tiny, px: s.px, py: s.py },
      ml: ml ? { x: ml.x, y: ml.y, r: ml.r, moved: ml.moved } : null,
      at: at ? String(at.className || at.tagName) : null,
      pick: m.pick(s.mx, s.my), obstacles: m.obstacles() };
  });
  log(JSON.stringify(r, null, 1));
};
